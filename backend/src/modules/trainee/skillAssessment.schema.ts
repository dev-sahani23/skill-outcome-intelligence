import { z } from "zod";

export const startAssessmentSchema = z.object({
  claimedSkills: z.array(z.string()).min(1, "At least one skill is required"),
  claimedCertifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      year: z.number().int(),
    })
  ).optional().default([]),
  claimedProjects: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ).optional().default([]),
  claimedCourses: z.array(
    z.object({
      name: z.string(),
      provider: z.string(),
      govtOrPrivate: z.enum(["GOVT", "PRIVATE"]),
    })
  ).optional().default([]),
  enrollmentId: z.string().uuid().optional(),
});

export const submitAssessmentSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answerText: z.string().min(1, "Answer cannot be empty"),
    })
  ).min(1, "Answers are required"),
});
