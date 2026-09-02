import { z } from "zod";
import { Role } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  role: z.nativeEnum(Role),
  email: z.string().email(),
  password: z.string().min(6),
  
  // Trainee specific
  fullName: z.string().optional(),
  phone: z.string().optional(),
  qualification: z.string().optional(),
  
  // Provider specific
  instituteName: z.string().optional(),
  programs: z.string().optional(),
  
  // Organization specific (Wait, admins shouldn't register here, but leaving it for completeness if an internal tool uses it)
  department: z.string().optional(),
}).refine(data => {
  // Add some conditional validation based on role
  if (data.role === "TRAINEE" && !data.fullName) return false;
  if (data.role === "PROVIDER" && (!data.instituteName || !data.fullName)) return false;
  return true;
}, {
  message: "Missing required fields for the selected role",
  path: ["role"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
