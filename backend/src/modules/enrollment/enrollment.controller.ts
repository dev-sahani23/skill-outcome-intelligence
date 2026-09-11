import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";

export const recordTrainingDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id; // from requireAuth
        const { trainingNumber, batchNumber, enrollmentNumber, isCertified, certificateId, skills } = req.body;

        // Get trainee profile id
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { traineeProfile: true }
        });

        if (!user?.traineeProfile) {
            return res.status(404).json({ message: "Trainee profile not found" });
        }

        // Since we require a programId for an enrollment, we'll try to find one or pick a default course for the demo.
        // Let's get the first training program as a fallback if they don't specify one.
        const program = await prisma.trainingProgram.findFirst();
        if (!program) {
            return res.status(400).json({ message: "No training programs exist in the system to enroll in." });
        }

        // Create the enrollment record to store the training details
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
                status: "COMPLETED" // assuming it's a conducted training
            }
        });

        res.status(201).json({ message: "Training details recorded successfully", enrollment });
    } catch (error) {
        next(error);
    }
};
