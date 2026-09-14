import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import {
  generateVerificationQuestions,
  analyzeSkillVerification,
} from "../../services/groqService";

export const startAssessment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId },
    });

    if (!traineeProfile) {
      return res.status(404).json({ error: "Trainee profile not found" });
    }

    const claimedSkills = req.body.claimedSkills;
    const claimedCertifications = req.body.claimedCertifications || [];
    const claimedProjects = req.body.claimedProjects || [];
    const claimedCourses = req.body.claimedCourses || [];
    const enrollmentId = req.body.enrollmentId;

    // Create a new assessment record (append-only history)
    const assessment = await prisma.skillAssessment.create({
      data: {
        traineeId: traineeProfile.id,
        enrollmentId,
        claimedSkills,
        claimedCertifications,
        claimedProjects,
        claimedCourses,
        status: "INTAKE_SUBMITTED",
      },
    });

    // Call Groq API
    const { questions, rawResponse } = await generateVerificationQuestions({
      claimedSkills,
      claimedCertifications,
      claimedProjects,
      claimedCourses,
    });

    // Update the record with generated questions
    await prisma.skillAssessment.update({
      where: { id: assessment.id },
      data: {
        generatedQuestions: questions as any,
        rawGroqResponseQuestions: rawResponse,
        status: "QUESTIONS_GENERATED",
      },
    });

    // Strip targetSkill and difficulty before returning to frontend
    const strippedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
    }));

    return res.status(201).json({
      assessmentId: assessment.id,
      questions: strippedQuestions,
    });
  } catch (error: any) {
    console.error("Error starting assessment:", error);
    return res.status(500).json({ error: "Failed to generate assessment" });
  }
};

export const submitAssessment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const assessmentId = req.params.id as string;
    const { answers } = req.body;

    const assessment = await prisma.skillAssessment.findUnique({
      where: { id: assessmentId },
      include: { trainee: true },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // RBAC verification
    if (assessment.trainee.userId !== userId) {
      return res.status(403).json({ error: "Forbidden: You do not have access to this assessment" });
    }

    // Ensure questions were successfully generated
    if (assessment.status === "INTAKE_SUBMITTED") {
      return res.status(400).json({
        error: "Cannot submit answers: Assessment questions were never successfully generated.",
      });
    }

    // Reconstruct transcript
    const transcript = {
      intake: {
        claimedSkills: assessment.claimedSkills,
        claimedCertifications: assessment.claimedCertifications as any,
        claimedProjects: assessment.claimedProjects as any,
        claimedCourses: assessment.claimedCourses as any,
      },
      questions: assessment.generatedQuestions as any,
      answers,
    };

    // Analyze with Groq
    const { analysis, rawResponse } = await analyzeSkillVerification(transcript);

    // Update record
    const updatedAssessment = await prisma.skillAssessment.update({
      where: { id: assessment.id },
      data: {
        answers,
        analysisResult: analysis as any,
        skillGapScore: analysis.skillGapScore,
        verificationConfidence: analysis.verificationConfidence,
        retentionRiskSignal: analysis.retentionRiskSignal,
        rawGroqResponseAnalysis: rawResponse,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return res.status(200).json({
      assessmentId: updatedAssessment.id,
      analysis,
    });
  } catch (error: any) {
    console.error("Error submitting assessment:", error);
    // Mark as failed if an unexpected error occurs during analysis
    try {
      if (req.params.id) {
        await prisma.skillAssessment.update({
          where: { id: req.params.id as string },
          data: { status: "FAILED" },
        });
      }
    } catch (e) { }
    return res.status(500).json({ error: "Failed to analyze assessment" });
  }
};

export const getAssessment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const assessmentId = req.params.id as string;

    const assessment = await prisma.skillAssessment.findUnique({
      where: { id: assessmentId },
      include: { trainee: true },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // RBAC verification
    if (assessment.trainee.userId !== userId) {
      return res.status(403).json({ error: "Forbidden: You do not have access to this assessment" });
    }

    return res.status(200).json({ assessment });
  } catch (error: any) {
    console.error("Error fetching assessment:", error);
    return res.status(500).json({ error: "Failed to fetch assessment" });
  }
};
