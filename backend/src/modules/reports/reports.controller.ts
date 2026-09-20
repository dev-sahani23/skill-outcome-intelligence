import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { getTraineeReport, getSubjectReport, getSystemReport, ReportFilters } from "./reports.service";

// Strict Zod schema enforcing either 'year' OR 'from' + 'to'
const dateFilterSchema = z.object({
  year: z.string().regex(/^\d{4}$/).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
}).refine(data => {
  if (data.year && (data.from || data.to)) return false;
  if (data.from && !data.to) return false;
  if (!data.from && data.to) return false;
  if (data.from && data.to && new Date(data.from) > new Date(data.to)) return false;
  return true;
}, "Filters must provide either 'year' alone, or both 'from' and 'to' (with from <= to).");

const parseFilters = (query: any): ReportFilters => {
  const parsed = dateFilterSchema.parse(query);
  if (parsed.year) {
    return {
      from: new Date(`${parsed.year}-01-01T00:00:00.000Z`),
      to: new Date(`${parsed.year}-12-31T23:59:59.999Z`)
    };
  }
  if (parsed.from && parsed.to) {
    return {
      from: new Date(parsed.from),
      to: new Date(parsed.to)
    };
  }
  return {};
};

export const getTraineeReportController = async (req: Request, res: Response) => {
  try {
    const traineeId = z.string().uuid().parse(req.params.traineeId);
    const filters = parseFilters(req.query);

    // Authorization
    if (req.user?.role === "TRAINEE") {
      const profile = await prisma.traineeProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile || profile.id !== traineeId) {
        return res.status(403).json({ error: "Forbidden: You can only access your own report." });
      }
    } else if (req.user?.role === "PROVIDER") {
      const providerProfile = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
      if (!providerProfile) {
        return res.status(403).json({ error: "Forbidden: Provider profile not found." });
      }
      const hasEnrollment = await prisma.enrollment.findFirst({
        where: {
          traineeId: traineeId,
          program: { providerId: providerProfile.id }
        }
      });
      if (!hasEnrollment) {
        return res.status(403).json({ error: "Forbidden: You can only access reports for your own trainees." });
      }
    } else if (req.user?.role !== "GOVERNMENT_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions." });
    }

    const report = await getTraineeReport(traineeId, filters);
    if (!report) {
      return res.status(404).json({ error: "Trainee not found" });
    }

    return res.status(200).json(report);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCourseReportController = async (req: Request, res: Response) => {
  try {
    const courseId = z.string().uuid().parse(req.params.courseId);
    const filters = parseFilters(req.query);

    // Authorization
    if (req.user?.role === "PROVIDER") {
      const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile) return res.status(403).json({ error: "Forbidden" });
      const course = await prisma.trainingProgram.findUnique({ where: { id: courseId } });
      if (!course || course.providerId !== profile.id) {
        return res.status(403).json({ error: "Forbidden: You can only access your own courses." });
      }
    } else if (req.user?.role !== "GOVERNMENT_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions." });
    }

    const report = await getSubjectReport("course", courseId, filters);
    if (!report) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.status(200).json(report);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProviderReportController = async (req: Request, res: Response) => {
  try {
    const providerId = z.string().uuid().parse(req.params.providerId);
    const filters = parseFilters(req.query);

    // Authorization
    if (req.user?.role === "PROVIDER") {
      const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile || profile.id !== providerId) {
        return res.status(403).json({ error: "Forbidden: You can only access your own provider report." });
      }
    } else if (req.user?.role !== "GOVERNMENT_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions." });
    }

    const report = await getSubjectReport("provider", providerId, filters);
    if (!report) {
      return res.status(404).json({ error: "Provider not found" });
    }

    return res.status(200).json(report);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSystemReportController = async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);

    // Authorization
    if (req.user?.role !== "GOVERNMENT_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only system admins can access the system report." });
    }

    const report = await getSystemReport(filters);
    if (!report) {
      return res.status(404).json({ error: "System data not found" });
    }

    return res.status(200).json(report);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
