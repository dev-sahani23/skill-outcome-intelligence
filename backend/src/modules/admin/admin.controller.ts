import { Request, Response } from "express";
import { createSkillGapReport } from "./skillGap.service";
import { prisma } from "../../lib/prisma";

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
    const trainees = await prisma.traineeProfile.findMany({
      include: {
        user: { select: { email: true } },
        enrollments: { select: { id: true, status: true, program: { select: { name: true, provider: { select: { instituteName: true } } } } } },
        skillAssessments: { select: { skillGapScore: true }, orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { user: { createdAt: 'desc' } }
    });
    return res.status(200).json({ trainees });
  } catch (error: any) {
    console.error("Error fetching trainees:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

