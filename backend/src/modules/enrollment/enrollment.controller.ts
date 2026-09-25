import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { parsePagination, getPaginationMeta } from "../../utils/pagination";
import { scheduleFollowUpsForTrainee } from "../../jobs/scheduleFollowUps";

/**
 * POST /enrollments/record-details
 * Trainee records their training details (creates an Enrollment row).
 */
export const recordTrainingDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { trainingNumber, batchNumber, enrollmentNumber, isCertified, certificateId, skills } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { traineeProfile: { select: { id: true, userId: true, fullName: true, phone: true, qualification: true, districtId: true } } }
        });

        if (!user?.traineeProfile) {
            return res.status(404).json({ message: "Trainee profile not found" });
        }

        // Pick first available training program as fallback for now
        const program = await prisma.trainingProgram.findFirst();
        if (!program) {
            return res.status(400).json({ message: "No training programs exist in the system to enroll in." });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                traineeId: user.traineeProfile.id,
                programId: program.id,
                trainingNumber,
                batchNumber,
                enrollmentNumber,
                isCertified: Boolean(isCertified),
                certificateId,
                skillsAcquired: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
                status: "COMPLETED"
            },
            include: {
                program: {
                    select: {
                        id: true,
                        name: true,
                        sector: true,
                        skills: true,
                        provider: { select: { id: true, instituteName: true, isVerified: true } }
                    }
                }
            }
        });

        if (enrollment.status === "COMPLETED") {
            // Fire-and-forget background job
            scheduleFollowUpsForTrainee(enrollment.traineeId, new Date()).catch(console.error);
        }

        res.status(201).json({ message: "Training details recorded successfully", enrollment });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /enrollments/my-enrollments  (Trainee)
 * Returns the authenticated trainee's enrollments with program + provider info.
 */
export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trainee = await prisma.traineeProfile.findUnique({
            where: { userId: req.user!.id }
        });

        if (!trainee) {
            return res.status(200).json({ enrollments: [] });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { traineeId: trainee.id },
            include: {
                program: {
                    select: {
                        id: true,
                        name: true,
                        sector: true,
                        skills: true,
                        provider: { select: { id: true, instituteName: true, isVerified: true } }
                    }
                }
            },
            orderBy: { enrolledAt: "desc" }
        });

        // Deduplicate by programId
        const seenPrograms = new Set<string>();
        const deduplicatedEnrollments = enrollments.filter(env => {
            if (seenPrograms.has(env.programId)) return false;
            seenPrograms.add(env.programId);
            return true;
        });

        res.status(200).json({ enrollments: deduplicatedEnrollments });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /enrollments/provider-enrollments  (Provider)
 * Returns all enrollments in the authenticated provider's courses.
 */
export const getProviderEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, search } = parsePagination(req);
        const skip = (page - 1) * limit;

        const provider = await prisma.providerProfile.findUnique({
            where: { userId: req.user!.id }
        });

        if (!provider) {
            return res.status(200).json({ data: [], meta: getPaginationMeta(0, page, limit) });
        }

        const searchFilter: Prisma.EnrollmentWhereInput = search
          ? {
              OR: [
                { trainee: { fullName: { contains: search, mode: "insensitive" } } },
                { trainee: { user: { email: { contains: search, mode: "insensitive" } } } },
                { program: { name: { contains: search, mode: "insensitive" } } }
              ]
            }
          : {};

        const whereClause: Prisma.EnrollmentWhereInput = {
            program: { providerId: provider.id },
            ...searchFilter
        };

        const [totalCount, enrollments] = await Promise.all([
            prisma.enrollment.count({
                where: whereClause
            }),
            prisma.enrollment.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    trainee: {
                        select: { 
                            id: true, 
                            userId: true, 
                            fullName: true, 
                            phone: true, 
                            qualification: true, 
                            districtId: true,
                            user: { select: { email: true } } 
                        }
                    },
                    program: true
                },
                orderBy: [{ enrolledAt: "desc" }, { id: "asc" }]
            })
        ]);

        res.status(200).json({ data: enrollments, meta: getPaginationMeta(totalCount, page, limit) });
    } catch (error) {
        next(error);
    }
};
