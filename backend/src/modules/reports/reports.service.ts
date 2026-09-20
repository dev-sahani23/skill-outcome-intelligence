import { prisma } from "../../lib/prisma";
import { TraineeReportDTO, CourseReportDTO, SystemReportDTO, EmptyReportDTO } from "./reports.types";
import { REPORT_THRESHOLDS } from "./reports.constants";
import { Prisma } from "@prisma/client";

export type ReportFilters = {
  from?: Date;
  to?: Date;
};

// Trainee Report
export const getTraineeReport = async (traineeId: string, filters: ReportFilters): Promise<TraineeReportDTO | EmptyReportDTO | null> => {
  const trainee = await prisma.traineeProfile.findUnique({
    where: { id: traineeId },
    include: {
      districtRef: { select: { name: true } },
      enrollments: {
        where: filters.from || filters.to ? {
          enrolledAt: {
            gte: filters.from,
            lte: filters.to
          }
        } : undefined,
        include: {
          program: { include: { provider: true } },
          certification: true,
        },
        orderBy: { enrolledAt: 'desc' }
      },
      outcomes: {
        where: filters.from || filters.to ? {
          reportedAt: {
            gte: filters.from,
            lte: filters.to
          }
        } : undefined,
        include: {
          wageRecords: { orderBy: { recordedDate: 'asc' } },
          attritionRecords: { take: 1, orderBy: { recordedAt: 'desc' } },
        },
        orderBy: { reportedAt: 'desc' },
        take: 1,
      },
      followUps: { orderBy: { scheduledDate: 'asc' } },
    }
  });

  if (!trainee) return null; // 404

  if (trainee.enrollments.length === 0 && trainee.outcomes.length === 0) {
    return {
      enrollmentTotal: 0,
      completionRate: null,
      placementRate: null,
      message: "No training or employment data available for this trainee."
    };
  }

  const outcome = trainee.outcomes[0];
  let currentStatus: "employed" | "self_employed" | "unemployed" | "unknown" = "unknown";
  if (outcome) {
    if (["FORMAL_EMPLOYMENT", "INFORMAL_EMPLOYMENT", "APPRENTICESHIP"].includes(outcome.type)) {
      currentStatus = "employed";
    } else if (outcome.type === "SELF_EMPLOYED") {
      currentStatus = "self_employed";
    } else if (outcome.type === "UNEMPLOYED") {
      currentStatus = "unemployed";
    }
  }

  const wages = outcome?.wageRecords ?? [];
  const initialWage = wages[0]?.salaryAmount ?? null;
  const currentWage = wages[wages.length - 1]?.salaryAmount ?? null;
  const changePercent = initialWage && currentWage && initialWage > 0
    ? +(((currentWage - initialWage) / initialWage) * 100).toFixed(1)
    : null;

  const topAttrition = outcome?.attritionRecords?.[0];

  return {
    reportType: "trainee",
    generatedAt: new Date().toISOString(),
    trainee: {
      name: trainee.fullName,
      district: trainee.districtRef?.name || trainee.district || null,
      gender: trainee.gender || null,
    },
    training: trainee.enrollments.map(e => ({
      courseName: e.program.name,
      providerName: e.program.provider.instituteName,
      completedDate: e.completedAt?.toISOString() || null,
      certified: e.isCertified,
    })),
    outcome: outcome ? {
      currentStatus,
      employerName: outcome.employerName || null,
      jobRole: outcome.designation || null,
      trainingRelevance: outcome.trainingRelevance || null,
    } : null,
    wageProgression: wages.length > 0 ? {
      initialWage,
      currentWage,
      changePercent,
      recordCount: wages.length,
    } : null,
    nonPlacementReason: currentStatus === "unemployed" && topAttrition ? {
      reasonCode: topAttrition.reasonCode,
      reasonSource: topAttrition.reasonSource,
      detail: "Based on recorded attrition/unemployment status"
    } : null,
    followUpHistory: trainee.followUps.map(f => ({
      stage: f.stage,
      status: f.status,
      respondedAt: f.completedAt?.toISOString() || null,
    }))
  };
};

const generateRecommendation = (data: CourseReportDTO): string => {
  const topReason = data.nonPlacementReasons[0];

  if (data.placement.placementRate !== null && data.placement.placementRate < REPORT_THRESHOLDS.UNDERPERFORMING_PLACEMENT_RATE) {
    if (topReason?.reasonCode === "SKILL_MISMATCH")
      return `Placement rate is low (${data.placement.placementRate}%) and most non-placements cite skill mismatch. Review curriculum against current job requirements in the ${data.subject.sector || 'relevant'} sector.`;

    if (topReason?.reasonCode === "LOW_SALARY")
      return `${data.placement.placementRate}% placement rate with salary expectations as top barrier. Consider partnering with higher-paying employers or adding salary negotiation to the curriculum.`;

    if (topReason?.reasonCode === "LOCATION_CONSTRAINTS" || topReason?.reasonCode === "LACK_OF_LOCAL_OPPORTUNITIES")
      return `Most non-placements are due to location constraints. Expanding employer tie-ups in ${data.subject.district || 'the local'} district is recommended.`;

    return `Placement rate of ${data.placement.placementRate}% is below target. Top barrier: ${topReason?.reasonCode ?? 'unspecified'}. Manual review recommended.`;
  }

  if (data.retention.retentionRate !== null && data.retention.retentionRate < REPORT_THRESHOLDS.LOW_RETENTION_RATE)
    return `Good placement rate (${data.placement.placementRate}%) but retention at 6 months is low (${data.retention.retentionRate}%). Focus on post-placement support and employer engagement to improve retention.`;

  return `Strong performance: ${data.placement.placementRate || 'N/A'}% placement rate and ${data.retention.retentionRate || 'N/A'}% 6-month retention. Consider scaling this programme to additional districts.`;
};

// Course / Provider Report shared logic
export const getSubjectReport = async (
  subjectType: "course" | "provider",
  id: string,
  filters: ReportFilters
): Promise<CourseReportDTO | EmptyReportDTO | null> => {
  
  // 1. Verify exists
  let name = "";
  let sector = null;
  let district = null;
  let courseRatingScore = null;

  if (subjectType === "course") {
    const program = await prisma.trainingProgram.findUnique({ where: { id }, include: { provider: { include: { districtRef: true } }, courseRatings: { take: 1, orderBy: { calculatedAt: 'desc' } } } });
    if (!program) return null;
    name = program.name;
    sector = program.sector;
    district = program.provider.districtRef?.name || null;
    courseRatingScore = program.courseRatings[0]?.finalScore || null;
  } else {
    const provider = await prisma.providerProfile.findUnique({ where: { id }, include: { districtRef: true } });
    if (!provider) return null;
    name = provider.instituteName;
    district = provider.districtRef?.name || null;
  }

  // 2. Query enrollments
  const enrollmentWhere: Prisma.EnrollmentWhereInput = {
    program: subjectType === "course" ? { id } : { providerId: id },
    ...(filters.from || filters.to ? {
      enrolledAt: { gte: filters.from, lte: filters.to }
    } : {})
  };

  const enrollments = await prisma.enrollment.findMany({
    where: enrollmentWhere,
    select: { id: true, status: true, traineeId: true }
  });

  if (enrollments.length === 0) {
    return {
      enrollmentTotal: 0,
      completionRate: null,
      placementRate: null,
      message: "No enrollment data available for this selection."
    };
  }

  const total = enrollments.length;
  const completed = enrollments.filter(e => e.status === "COMPLETED").length;
  const dropped = enrollments.filter(e => e.status === "DROPPED").length;
  const completionRate = total > 0 ? +(completed / total * 100).toFixed(1) : null;

  // 3. Query outcomes for these trainees
  const traineeIds = enrollments.map(e => e.traineeId);
  const outcomes = await prisma.employmentOutcome.findMany({
    where: {
      traineeId: { in: traineeIds },
      ...(filters.from || filters.to ? { reportedAt: { gte: filters.from, lte: filters.to } } : {})
    },
    include: {
      wageRecords: { orderBy: { recordedDate: 'asc' } },
      trainee: { include: { followUps: { where: { stage: "MONTH_6" } } } }
    }
  });

  const totalOutcomes = outcomes.length;
  
  let placed = 0;
  let notPlaced = 0;
  let retainedAt6Months = 0;
  let initialWagesSum = 0;
  let wagesCount = 0;

  outcomes.forEach(o => {
    if (["FORMAL_EMPLOYMENT", "INFORMAL_EMPLOYMENT", "APPRENTICESHIP", "SELF_EMPLOYED"].includes(o.type)) {
      placed++;
      // Check retention
      const month6FollowUp = o.trainee.followUps[0];
      if (month6FollowUp && month6FollowUp.status === "RESPONDED") {
        const responseData = month6FollowUp.responseData as any;
        if (responseData && responseData.employmentStatus === "employed") {
          retainedAt6Months++;
        }
      }
      
      const firstWage = o.wageRecords[0]?.salaryAmount;
      if (firstWage && firstWage > 0) {
        initialWagesSum += firstWage;
        wagesCount++;
      }
    } else if (o.type === "UNEMPLOYED") {
      notPlaced++;
    }
  });

  const placementRate = totalOutcomes > 0 ? +(placed / totalOutcomes * 100).toFixed(1) : null;
  const retentionRate = placed > 0 ? +(retainedAt6Months / placed * 100).toFixed(1) : null;
  const avgInitialWage = wagesCount > 0 ? Math.round(initialWagesSum / wagesCount) : null;

  // 4. Query Attrition reasons
  const attritions = await prisma.attritionRecord.groupBy({
    by: ['reasonCode'],
    where: {
      traineeId: { in: traineeIds },
      ...(filters.from || filters.to ? { recordedAt: { gte: filters.from, lte: filters.to } } : {})
    },
    _count: { reasonCode: true },
    orderBy: { _count: { reasonCode: 'desc' } },
    take: 3
  });

  const totalAttritions = attritions.reduce((acc, curr) => acc + curr._count.reasonCode, 0);
  const nonPlacementReasons = attritions.map(a => ({
    reasonCode: a.reasonCode,
    count: a._count.reasonCode,
    percent: totalAttritions > 0 ? +(a._count.reasonCode / totalAttritions * 100).toFixed(1) : null
  }));

  const report: CourseReportDTO = {
    reportType: subjectType,
    generatedAt: new Date().toISOString(),
    subject: { name, sector, district },
    enrollment: { total, completed, dropped, completionRate },
    placement: { placed, notPlaced, placementRate, avgInitialWage },
    retention: { retainedAt6Months, retentionRate },
    nonPlacementReasons,
    courseRating: courseRatingScore,
    recommendation: ""
  };

  report.recommendation = generateRecommendation(report);
  return report;
};

// System Report
export const getSystemReport = async (filters: ReportFilters): Promise<SystemReportDTO | EmptyReportDTO | null> => {
  const dateFilter = filters.from || filters.to ? {
    gte: filters.from,
    lte: filters.to
  } : undefined;

  // Total Trainees
  const totalTrainees = await prisma.traineeProfile.count({
    where: dateFilter ? { user: { createdAt: dateFilter } } : undefined
  });

  if (totalTrainees === 0) {
    return {
      enrollmentTotal: 0,
      completionRate: null,
      placementRate: null,
      message: "No system data available for this selection."
    };
  }

  // Total Enrollments
  const totalEnrollments = await prisma.enrollment.count({
    where: dateFilter ? { enrolledAt: dateFilter } : undefined
  });

  // System Placement
  const allOutcomes = await prisma.employmentOutcome.findMany({
    where: dateFilter ? { reportedAt: dateFilter } : undefined,
    select: { type: true, monthlyWage: true }
  });

  let totalPlaced = 0;
  let wageSum = 0;
  let wageCount = 0;

  allOutcomes.forEach(o => {
    if (["FORMAL_EMPLOYMENT", "INFORMAL_EMPLOYMENT", "APPRENTICESHIP", "SELF_EMPLOYED"].includes(o.type)) {
      totalPlaced++;
      if (o.monthlyWage && o.monthlyWage > 0) {
        wageSum += o.monthlyWage;
        wageCount++;
      }
    }
  });

  const overallPlacementRate = allOutcomes.length > 0 ? +(totalPlaced / allOutcomes.length * 100).toFixed(1) : null;
  const avgWageAcrossSystem = wageCount > 0 ? Math.round(wageSum / wageCount) : null;

  // By District
  // Find all outcomes and trainee bases per district
  const districtTrainees = await prisma.traineeProfile.groupBy({
    by: ['districtId'],
    _count: { id: true }
  });
  
  const districtOutcomes = await prisma.employmentOutcome.findMany({
    where: dateFilter ? { reportedAt: dateFilter } : undefined,
    include: { districtRef: true }
  });

  const districtStatsMap = new Map<string, { totalOutcomes: number, placed: number, wageSum: number, wageCount: number, name: string, traineeCount: number }>();
  
  districtOutcomes.forEach(o => {
    const distId = o.districtId || "unknown";
    const distName = o.districtRef?.name || o.districtId || "Unknown";
    
    if (!districtStatsMap.has(distId)) {
      districtStatsMap.set(distId, { totalOutcomes: 0, placed: 0, wageSum: 0, wageCount: 0, name: distName, traineeCount: 0 });
    }
    const stat = districtStatsMap.get(distId)!;
    stat.totalOutcomes++;
    
    if (["FORMAL_EMPLOYMENT", "INFORMAL_EMPLOYMENT", "APPRENTICESHIP", "SELF_EMPLOYED"].includes(o.type)) {
      stat.placed++;
      if (o.monthlyWage && o.monthlyWage > 0) {
        stat.wageSum += o.monthlyWage;
        stat.wageCount++;
      }
    }
  });

  // Assign trainee counts
  districtTrainees.forEach(dt => {
    const distId = dt.districtId || "unknown";
    if (districtStatsMap.has(distId)) {
      districtStatsMap.get(distId)!.traineeCount = dt._count.id;
    }
  });

  const byDistrict = Array.from(districtStatsMap.values()).map(stat => {
    const placementRate = stat.totalOutcomes > 0 ? +(stat.placed / stat.totalOutcomes * 100).toFixed(1) : null;
    let performance: "strong" | "average" | "underperforming" | "n/a" = "n/a";
    if (placementRate !== null) {
      if (placementRate >= REPORT_THRESHOLDS.STRONG_PLACEMENT_RATE) performance = "strong";
      else if (placementRate >= REPORT_THRESHOLDS.UNDERPERFORMING_PLACEMENT_RATE) performance = "average";
      else performance = "underperforming";
    }

    return {
      districtName: stat.name,
      traineeCount: stat.traineeCount,
      placementRate,
      avgWage: stat.wageCount > 0 ? Math.round(stat.wageSum / stat.wageCount) : null,
      performance
    };
  });

  // Sort By District (lowest placement rate first, nulls last)
  byDistrict.sort((a, b) => {
    if (a.placementRate === null && b.placementRate === null) return 0;
    if (a.placementRate === null) return 1;
    if (b.placementRate === null) return -1;
    return a.placementRate - b.placementRate;
  });

  const underperformingDistricts = byDistrict
    .filter(d => d.placementRate !== null && d.placementRate < REPORT_THRESHOLDS.UNDERPERFORMING_PLACEMENT_RATE)
    .map(d => d.districtName);

  // By Sector (using TrainingProgram sector connected via enrollments to outcomes)
  // To keep it simple, we use Prisma to find outcomes -> trainee -> enrollments -> program -> sector
  // For MVP System report, if we need sector data, let's fetch all outcomes with their training program sector
  const sectorOutcomes = await prisma.employmentOutcome.findMany({
    where: dateFilter ? { reportedAt: dateFilter } : undefined,
    include: {
      trainee: {
        include: {
          enrollments: {
            include: { program: true },
            take: 1, // approximate primary course
            orderBy: { enrolledAt: 'desc' }
          }
        }
      }
    }
  });

  const sectorStatsMap = new Map<string, { totalOutcomes: number, placed: number, traineeCount: number }>();
  
  sectorOutcomes.forEach(o => {
    const sector = o.trainee.enrollments[0]?.program.sector || "Unknown";
    
    if (!sectorStatsMap.has(sector)) {
      sectorStatsMap.set(sector, { totalOutcomes: 0, placed: 0, traineeCount: 0 });
    }
    const stat = sectorStatsMap.get(sector)!;
    stat.totalOutcomes++;
    
    if (["FORMAL_EMPLOYMENT", "INFORMAL_EMPLOYMENT", "APPRENTICESHIP", "SELF_EMPLOYED"].includes(o.type)) {
      stat.placed++;
    }
  });

  // Fetch skill gaps
  const skillGaps = await prisma.skillGapReport.findMany();
  
  const bySector = Array.from(sectorStatsMap.entries()).map(([sector, stat]) => {
    const placementRate = stat.totalOutcomes > 0 ? +(stat.placed / stat.totalOutcomes * 100).toFixed(1) : null;
    
    // Find highest skill gap for this sector
    const sectorGaps = skillGaps.filter(g => g.sector === sector);
    const topGap = sectorGaps.sort((a, b) => (b.gapScore || 0) - (a.gapScore || 0))[0];
    
    return {
      sector,
      traineeCount: stat.totalOutcomes, // approx
      placementRate,
      topSkillGap: topGap ? topGap.skillName : null
    };
  });
  
  bySector.sort((a, b) => {
    if (a.placementRate === null && b.placementRate === null) return 0;
    if (a.placementRate === null) return 1;
    if (b.placementRate === null) return -1;
    return a.placementRate - b.placementRate;
  });

  const underperformingSectors = bySector
    .filter(s => s.placementRate !== null && s.placementRate < REPORT_THRESHOLDS.UNDERPERFORMING_PLACEMENT_RATE)
    .map(s => s.sector);

  // Avg skill gap score
  const avgSkillGapScore = skillGaps.length > 0 
    ? +(skillGaps.reduce((acc, curr) => acc + (curr.gapScore || 0), 0) / skillGaps.length).toFixed(1) 
    : null;

  return {
    reportType: "system",
    generatedAt: new Date().toISOString(),
    overview: {
      totalTrainees,
      totalEnrollments,
      totalPlaced,
      overallPlacementRate,
      avgWageAcrossSystem,
      avgSkillGapScore
    },
    byDistrict,
    bySector,
    underperformingDistricts,
    underperformingSectors
  };
};
