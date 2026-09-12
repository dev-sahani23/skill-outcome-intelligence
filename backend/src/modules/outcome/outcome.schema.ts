import { z } from "zod";
import { OutcomeType } from "@prisma/client";

export const createOutcomeSchema = z.object({
  type: z.nativeEnum(OutcomeType),

  // Common
  employerName: z.string().optional(),
  designation: z.string().optional(),
  monthlyWage: z.number().nonnegative().optional(),
  retentionMonths: z.number().int().nonnegative().optional(),
  skillGapIdentified: z.string().optional(),
  nonPlacementReason: z.string().optional(),

  // Passed raw from frontend — hashed server-side before storage
  aadhaarNo: z.string().optional(),

  // FORMAL_EMPLOYMENT — stored on TraineeProfile (not on the outcome row itself)
  uanNumber: z.string().optional(),

  // APPRENTICESHIP
  napsNumber: z.string().optional(),

  // SELF_EMPLOYED
  udyamRegistrationNo: z.string().optional(),
  businessActivity: z.string().optional(),
});

export type CreateOutcomeInput = z.infer<typeof createOutcomeSchema>;
