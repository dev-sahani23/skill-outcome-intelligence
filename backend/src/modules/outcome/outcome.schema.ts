import { z } from "zod";
import { OutcomeType } from "@prisma/client";

export const createOutcomeSchema = z.object({
  type: z.nativeEnum(OutcomeType),
  employerName: z.string().optional(),
  designation: z.string().optional(),
  monthlyWage: z.number().nonnegative().optional(),
  retentionMonths: z.number().int().nonnegative().optional(),
  skillGapIdentified: z.string().optional(),
  nonPlacementReason: z.string().optional(),
});

export type CreateOutcomeInput = z.infer<typeof createOutcomeSchema>;
