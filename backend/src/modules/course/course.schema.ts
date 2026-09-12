import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  durationMonths: z.number().int().positive().optional(),
  skills: z.array(z.string()).optional(),
  sector: z.string().optional(),
  skillCategory: z.string().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
