import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getDistricts = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    
    const districts = await prisma.district.findMany({
      where: {
        name: { contains: query, mode: "insensitive" }
      },
      select: {
        id: true,
        name: true,
        state: true,
        avgWageBaseline: true,
        avgLayoffRateBaseline: true,
      },
      orderBy: [{ state: 'asc' }, { name: 'asc' }],
      take: 800
    });
    return res.status(200).json({ districts });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const searchEmployers = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    
    const employers = await prisma.employer.findMany({
      where: {
        name: { contains: query, mode: "insensitive" }
      },
      select: {
        id: true,
        name: true,
        sector: true,
        isVerified: true
      },
      orderBy: { name: 'asc' },
      take: 20
    });
    return res.status(200).json({ employers });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
