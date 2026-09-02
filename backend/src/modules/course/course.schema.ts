import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  durationMonths: z.number().int().positive().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
