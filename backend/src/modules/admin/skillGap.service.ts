import { prisma } from "../../lib/prisma";

/**
 * Computes gapScore on application side and saves the report.
 * gapScore = demandScore - supplyScore
 */
export const createSkillGapReport = async (
  sector: string,
  skillName: string,
  districtId: string,
  demandScore: number,
  supplyScore: number
) => {
  const gapScore = demandScore - supplyScore;

  const report = await prisma.skillGapReport.create({
    data: {
      sector,
      skillName,
      districtId,
      demandScore,
      supplyScore,
      gapScore
    }
  });

  return report;
};
