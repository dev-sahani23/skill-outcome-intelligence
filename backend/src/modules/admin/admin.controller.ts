import { Request, Response } from "express";
import { createSkillGapReport } from "./skillGap.service";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { parsePagination, getPaginationMeta } from "../../utils/pagination";

export const postSkillGapReport = async (req: Request, res: Response) => {
  try {
    const { sector, skillName, districtId, demandScore, supplyScore } = req.body;
    
    if (!sector || !skillName || !districtId || demandScore == null || supplyScore == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const report = await createSkillGapReport(sector, skillName, districtId, demandScore, supplyScore);
    return res.status(201).json({ report });
  } catch (error: any) {
    console.error("Error creating skill gap report:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /admin/stats
 * Returns real aggregate statistics for the government admin dashboard.
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const [totalEnrolled, totalOutcomes, placedOutcomes, wageAgg] = await Promise.all([
      prisma.enrollment.count(),
      prisma.employmentOutcome.count(),
      prisma.employmentOutcome.count({
        where: {
          type: {
            in: ["FORMAL_EMPLOYMENT", "INFORMAL_EMPLOYMENT", "APPRENTICESHIP", "SELF_EMPLOYED"]
          }
        }
      }),
      prisma.employmentOutcome.aggregate({
        _avg: { monthlyWage: true },
        where: { monthlyWage: { not: null } }
      }),
    ]);

    const placementRate = totalOutcomes > 0
      ? Math.round((placedOutcomes / totalOutcomes) * 100)
      : 0;

    const avgWage = wageAgg._avg.monthlyWage
      ? Math.round(wageAgg._avg.monthlyWage)
      : 0;

    // District-wise placement counts
    type DistrictRow = { district: string; count: bigint };
    const districtPlacements = await prisma.$queryRaw<DistrictRow[]>`
      SELECT tp.district, COUNT(eo.id) as count
      FROM trainee_profiles tp
      LEFT JOIN employment_outcomes eo ON eo."traineeId" = tp.id
        AND eo.type IN ('FORMAL_EMPLOYMENT', 'INFORMAL_EMPLOYMENT', 'APPRENTICESHIP', 'SELF_EMPLOYED')
      WHERE tp.district IS NOT NULL
      GROUP BY tp.district
      ORDER BY count DESC
      LIMIT 10
    `;

    return res.status(200).json({
      totalEnrolled,
      placementRate,
      avgWage,
      districtPlacements: districtPlacements.map((row: DistrictRow) => ({
        name: row.district,
        Placed: Number(row.count),
      })),
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSkillAssessments = async (req: Request, res: Response) => {
  try {
    const assessments = await prisma.skillAssessment.findMany({
      where: { status: "COMPLETED" },
      select: {
        id: true,
        skillGapScore: true,
        verificationConfidence: true,
        retentionRiskSignal: true,
        completedAt: true,
        trainee: {
          select: {
            id: true,
            fullName: true,
            district: true
          }
        }
      },
      orderBy: { completedAt: "desc" },
      take: 100
    });
    
    return res.status(200).json({ assessments });
  } catch (error: any) {
    console.error("Error fetching skill assessments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAnomalyFlag = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    
    // req.user is set by requireAuth middleware
    const userId = (req as any).user?.id;

    if (!["DISMISSED", "CONFIRMED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const flag = await prisma.providerAnomalyFlag.update({
      where: { id },
      data: {
        status,
        reviewedById: userId,
        reviewedAt: new Date(),
      }
    });

    return res.status(200).json({ flag });
  } catch (error: any) {
    console.error("Error updating anomaly flag:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAnomalyFlags = async (req: Request, res: Response) => {
  try {
    const flags = await prisma.providerAnomalyFlag.findMany({
      include: {
        provider: { select: { instituteName: true, user: { select: { email: true } } } },
        reviewedBy: { select: { email: true } }
      },
      orderBy: { flaggedAt: 'desc' }
    });
    return res.status(200).json({ flags });
  } catch (error: any) {
    console.error("Error fetching anomaly flags:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTrainees = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = parsePagination(req);
    const skip = (page - 1) * limit;

    const whereClause: Prisma.TraineeProfileWhereInput = search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { user: { email: { contains: search, mode: "insensitive" } } }
          ]
        }
      : {};

    const [total, trainees] = await Promise.all([
      prisma.traineeProfile.count({ where: whereClause }),
      prisma.traineeProfile.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: { select: { email: true } },
          enrollments: { select: { id: true, status: true, program: { select: { name: true, provider: { select: { instituteName: true } } } } } },
          skillAssessments: { select: { skillGapScore: true }, orderBy: { createdAt: 'desc' }, take: 1 }
        },
        orderBy: [{ user: { createdAt: 'desc' } }, { id: 'asc' }]
      })
    ]);

    return res.status(200).json({ 
      data: trainees,
      meta: getPaginationMeta(total, page, limit)
    });
  } catch (error: any) {
    console.error("Error fetching trainees:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


import { followUpQueue } from "../../queues/followUpQueue";

export const sendFollowUpNow = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const followUp = await prisma.followUp.findUnique({
      where: { id },
      include: { trainee: true }
    });

    if (!followUp) {
      return res.status(404).json({ error: "Follow up not found" });
    }

    // Check consent before even trying
    const consent = await prisma.consentRecord.findFirst({
      where: { traineeId: followUp.traineeId, consentType: "data_sharing" },
      orderBy: { grantedAt: "desc" }
    });

    if (consent?.revokedAt) {
      return res.status(403).json({ error: "Consent is revoked for this trainee. Cannot send follow-ups." });
    }

    if (['SENT', 'RESPONDED', 'ESCALATED', 'UNREACHABLE'].includes(followUp.status)) {
      return res.status(400).json({ error: `Follow up is already ${followUp.status}` });
    }

    const jobId = `followup-${followUp.id}`;

    if (followUp.status === 'PROCESSING') {
      // Reconciliation flow
      const job = await followUpQueue.getJob(jobId);
      if (job) {
        const state = await job.getState();
        if (['waiting', 'active', 'delayed'].includes(state)) {
          return res.status(200).json({ message: "Job is already queued/running" });
        }
        if (state === 'completed') {
          await prisma.followUp.update({ where: { id }, data: { status: 'SENT' } });
          return res.status(200).json({ message: "Job was already completed. Database state reconciled." });
        }
        if (state === 'failed') {
          if (job.attemptsMade < (job.opts.attempts || 1)) {
            return res.status(200).json({ message: "Job is retrying in background." });
          } else {
            await prisma.followUp.update({ where: { id }, data: { status: 'UNREACHABLE', notes: 'Job failed completely' } });
            return res.status(200).json({ message: "Job failed completely. Database state reconciled." });
          }
        }
      }
      // If job is missing, it's safe to fall through and retry.
    }

    const locked = await prisma.followUp.updateMany({
      where: { id, status: { in: ['PENDING', 'PROCESSING'] } },
      data: { status: 'PROCESSING' }
    });

    if (locked.count === 0) {
      return res.status(409).json({ error: "Could not acquire lock or already processed" });
    }

    const contacts = await prisma.contact.findMany({
      where: { traineeId: followUp.traineeId, isActive: true },
      orderBy: { priorityOrder: "asc" }
    });

    const primaryContact = contacts[0];

    try {
      await followUpQueue.add(
        "send-follow-up",
        {
          followUpId: followUp.id,
          traineeId: followUp.traineeId,
          stage: followUp.stage,
          primaryPhone: primaryContact?.phone || followUp.trainee.phone || "",
          traineeFirstName: followUp.trainee.fullName.split(' ')[0] || followUp.trainee.fullName,
          attemptNumber: 1,
          contactId: primaryContact?.id,
        },
        { jobId }
      );
      return res.status(200).json({ message: "Follow up queued successfully" });
    } catch (err) {
      console.error("Enqueue error:", err);
      return res.status(500).json({ error: "Failed to enqueue follow up. Database is kept in PROCESSING state for reconciliation." });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLocationStats = async (req: Request, res: Response) => {
  try {
    const totalTrainees = await prisma.traineeProfile.count();
    
    const locatedTrainees = await prisma.traineeLocation.groupBy({
      by: ['traineeId'],
      _count: { traineeId: true }
    });
    
    const totalWithLocation = locatedTrainees.length;
    const totalWithout = totalTrainees - totalWithLocation;
    const coveragePercent = totalTrainees > 0 ? Math.round((totalWithLocation / totalTrainees) * 100) : 0;
    
    type DistrictStat = { districtName: string; count: bigint };
    const byDistrictRaw = await prisma.$queryRaw<DistrictStat[]>`
      SELECT tp.district as "districtName", COUNT(DISTINCT tl."traineeId") as count
      FROM trainee_locations tl
      JOIN trainee_profiles tp ON tl."traineeId" = tp.id
      WHERE tp.district IS NOT NULL
      GROUP BY tp.district
    `;
    
    const byDistrict = byDistrictRaw.map((row: DistrictStat) => ({
      districtName: row.districtName,
      count: Number(row.count)
    }));
    
    // Get actual coordinates for the map
    const rawLocations = await prisma.traineeLocation.findMany({
      select: {
        latitude: true,
        longitude: true,
        trainee: { select: { district: true } }
      },
      distinct: ['traineeId'],
      orderBy: { capturedAt: 'desc' }
    });
    
    return res.status(200).json({
      totalWithLocation,
      totalWithout,
      coveragePercent,
      byDistrict,
      rawLocations
    });
  } catch (error: any) {
    console.error("Error fetching location stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getHistoricalData = async (req: Request, res: Response) => {
  try {
    const historicalData = await prisma.districtHistoricalData.findMany({
      include: {
        districtRef: {
          select: {
            name: true,
            state: true
          }
        }
      },
      orderBy: [
        { financialYear: 'asc' },
        { districtRef: { state: 'asc' } },
        { districtRef: { name: 'asc' } }
      ]
    });
    return res.status(200).json({ historicalData });
  } catch (error: any) {
    console.error("Error fetching historical data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

