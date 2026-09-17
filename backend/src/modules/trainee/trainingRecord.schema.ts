import { z } from "zod";

// Match the codebase pattern: schema file alongside the controller
// See: skillAssessment.schema.ts for reference

const isoDateString = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: "Invalid date format" }
);

export const createTrainingRecordSchema = z.object({
  programName: z.string().min(2, "Training name must be at least 2 characters"),
  providerName: z.string().min(2, "Provider name must be at least 2 characters"),
  providerType: z.enum(["government", "private", "ngo"] as const, {
    error: () => "providerType must be 'government', 'private', or 'ngo'",
  }),
  sector: z.string().min(1, "Sector is required"),
  startDate: isoDateString.refine(
    (val) => new Date(val) <= new Date(),
    { message: "Start date cannot be in the future" }
  ),
  endDate: isoDateString.optional(),
  status: z.enum(["completed", "in_progress", "dropped"] as const, {
    error: () => "status must be 'completed', 'in_progress', or 'dropped'",
  }),
  certificateCloudinaryId: z.string().nullable().optional(),
  certificateUrl: z.string().url("Invalid certificate URL").nullable().optional(),
  skills: z.array(z.string().min(1)).default([]),
  certificationName: z.string().nullable().optional(),
  certificationIssuedDate: isoDateString.nullable().optional(),
}).superRefine((data, ctx) => {
  // endDate must be after startDate when provided
  if (data.endDate && data.startDate) {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }
  }

  // Business rule: completed training must include at least 1 skill
  if (data.status === "completed" && data.skills.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one skill is required when status is 'completed'",
      path: ["skills"],
    });
  }
});

export type CreateTrainingRecordInput = z.infer<typeof createTrainingRecordSchema>;
