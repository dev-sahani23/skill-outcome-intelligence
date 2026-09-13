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

export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const changePasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
