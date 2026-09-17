import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { createTrainingRecordSchema } from "./trainingRecord.schema";
import { verifyUpload } from "../../services/cloudinaryService";
import { EnrollmentStatus } from "@prisma/client";

/**
 * Generates a unique certificate number in the format CERT-{year}-{6 random digits}.
 * Uses a retry loop to handle the extremely rare @unique collision case.
 * Returns the generated number and confirms it doesn't already exist in the DB.
 */
async function generateUniqueCertNumber(): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const digits = Math.floor(100000 + Math.random() * 900000).toString();
    const certNumber = `CERT-${year}-${digits}`;
    const existing = await prisma.certification.findUnique({
      where: { certificateNumber: certNumber },
      select: { id: true },
    });
    if (!existing) return certNumber;
  }
  // Extremely unlikely — fallback with timestamp for uniqueness
  return `CERT-${year}-${Date.now().toString().slice(-6)}`;
}

/**
 * POST /api/trainee/training-records
 * Creates a TrainingProgram (upsert) + Enrollment + optional Certification.
 * If a Cloudinary publicId is provided, verifies the file exists before saving.
 */
export const createTrainingRecord = async (req: Request, res: Response) => {
  try {
    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: req.user?.id },
    });
    if (!traineeProfile) {
      return res.status(404).json({ error: "Trainee profile not found" });
    }

    // Validate request body
    const parsed = createTrainingRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    // Verify the Cloudinary upload is real before writing to DB (prevents spoofed publicIds)
    if (data.certificateCloudinaryId) {
      try {
        await verifyUpload(data.certificateCloudinaryId);
      } catch (err: any) {
        // verifyUpload throws with a descriptive message — return 400, not 500
        return res.status(400).json({ error: err.message });
      }
    }

    // Find or create a "virtual" provider profile for self-reported providers.
    // We look for an existing provider with a matching institute name.
    // If not found we use a sentinel provider for self-reported records.
    let providerId: string;
    const existingProvider = await prisma.providerProfile.findFirst({
      where: { instituteName: { equals: data.providerName, mode: "insensitive" } },
      select: { id: true },
    });

    if (existingProvider) {
      providerId = existingProvider.id;
    } else {
      // Create a self-reported (unverified) provider entry
      const newProviderUser = await prisma.user.create({
        data: {
          email: `self-reported-${Date.now()}@skillportal.internal`,
          passwordHash: "SYSTEM_GENERATED_NOT_LOGIN_ACCOUNT",
          role: "PROVIDER",
          providerProfile: {
            create: {
              instituteName: data.providerName,
              isVerified: false,
            },
          },
        },
        include: { providerProfile: true },
      });
      providerId = newProviderUser.providerProfile!.id;
    }

    // Upsert the TrainingProgram (find by name + provider to avoid duplicates)
    let program = await prisma.trainingProgram.findFirst({
      where: {
        name: { equals: data.programName, mode: "insensitive" },
        providerId,
      },
    });
    if (!program) {
      program = await prisma.trainingProgram.create({
        data: {
          providerId,
          name: data.programName,
          sector: data.sector,
          skills: data.skills,
        },
      });
    }

    // Map submitted status to Prisma EnrollmentStatus enum
    const statusMap: Record<string, EnrollmentStatus> = {
      completed: "COMPLETED",
      in_progress: "IN_PROGRESS",
      dropped: "DROPPED",
    };

    // Create the Enrollment record
    const enrollment = await prisma.enrollment.create({
      data: {
        traineeId: traineeProfile.id,
        programId: program.id,
        status: statusMap[data.status],
        enrolledAt: new Date(data.startDate),
        completedAt: data.endDate ? new Date(data.endDate) : null,
        skillsAcquired: data.skills,
        isCertified: data.status === "completed" && !!data.certificateCloudinaryId,
      },
    });

    // Create Certification record if completed and a certificate was uploaded
    let certification = null;
    if (data.status === "completed" && data.certificateCloudinaryId) {
      const issuedDate = data.certificationIssuedDate
        ? new Date(data.certificationIssuedDate)
        : data.endDate
        ? new Date(data.endDate)
        : new Date();

      // SHA-256(traineeId + programName + issuedDate) — deterministic verification hash
      const hashInput = `${traineeProfile.id}${data.programName}${issuedDate.toISOString()}`;
      const verificationHash = crypto.createHash("sha256").update(hashInput).digest("hex");

      const certificateNumber = await generateUniqueCertNumber();

      certification = await prisma.certification.create({
        data: {
          enrollmentId: enrollment.id,
          certificateNumber,
          certificationName: data.certificationName ?? null,
          issuingAuthority: data.providerName,
          issuedDate,
          verificationHash,
          certificatePublicId: data.certificateCloudinaryId,
          certificateUrl: data.certificateUrl ?? null,
        },
      });
    }

    return res.status(201).json({
      message: "Training record created successfully",
      enrollmentId: enrollment.id,
      certificationId: certification?.id ?? null,
    });
  } catch (error: any) {
    console.error("[trainingRecord.controller] createTrainingRecord error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/trainee/training-records
 * Returns all enrollments for this trainee with program, provider, and certification details.
 */
export const getTrainingRecords = async (req: Request, res: Response) => {
  try {
    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: req.user?.id },
    });
    if (!traineeProfile) {
      return res.status(404).json({ error: "Trainee profile not found" });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { traineeId: traineeProfile.id },
      include: {
        program: {
          include: {
            provider: { select: { instituteName: true, isVerified: true } },
          },
        },
        certification: {
          select: {
            id: true,
            certificateNumber: true,
            certificationName: true,
            issuingAuthority: true,
            issuedDate: true,
            verificationHash: true,
            certificateUrl: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const seenPrograms = new Set<string>();
    const deduplicatedEnrollments = enrollments.filter(env => {
      if (seenPrograms.has(env.programId)) return false;
      seenPrograms.add(env.programId);
      return true;
    });

    return res.status(200).json({ enrollments: deduplicatedEnrollments });
  } catch (error: any) {
    console.error("[trainingRecord.controller] getTrainingRecords error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
