import { Request, Response } from "express";
import { createSkillGapReport } from "./skillGap.service";

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
