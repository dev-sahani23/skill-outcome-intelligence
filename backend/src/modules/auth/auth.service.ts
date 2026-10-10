import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/password";
import { signToken, verifyToken } from "../../utils/jwt";
import { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput, ChangePasswordInput, ResetPasswordInput } from "./auth.schema";
import { sendOtpEmail } from "../../services/emailService";
import { normalizeEmail } from "../../utils/normalizeEmail";
export const registerUser = async (input: RegisterInput) => {
  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw { statusCode: 400, message: "Email already exists" };
  }

  if (input.role === "GOVERNMENT_ADMIN") {
    throw { statusCode: 403, message: "Cannot register as Government Admin" };
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: input.role,
      ...(input.role === "TRAINEE" && {
        traineeProfile: {
          create: {
            fullName: input.fullName || "",
            phone: input.phone,
            qualification: input.qualification,
            gender: input.gender,
            districtId: input.districtId,
          },
        },
      }),
      ...(input.role === "PROVIDER" && {
        providerProfile: {
          create: {
            instituteName: input.instituteName || "",
            contactPerson: input.fullName,
            phone: input.phone,
            registrationNo: input.registrationNo,
          },
        },
      }),
    },
    include: {
      traineeProfile: true,
      providerProfile: true,
      adminProfile: true,
    }
  });

  const accessToken = signToken({ id: user.id, role: user.role, mustChangePassword: user.mustChangePassword });
  const refreshToken = signToken({ id: user.id, role: user.role, mustChangePassword: user.mustChangePassword }, "7d");

  // Exclude passwordHash from returned user
  const { passwordHash, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput) => {
  const normalizedEmail = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      traineeProfile: true,
      providerProfile: true,
      adminProfile: true,
    }
  });

  if (!user) {
    throw { statusCode: 401, message: "Invalid email or password" };
  }

  const isValid = await comparePassword(input.password, user.passwordHash);

  if (!isValid) {
    throw { statusCode: 401, message: "Invalid email or password" };
  }

  const accessToken = signToken({ id: user.id, role: user.role, mustChangePassword: user.mustChangePassword });
  const refreshToken = signToken({ id: user.id, role: user.role, mustChangePassword: user.mustChangePassword }, "7d");

  const { passwordHash, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      traineeProfile: {
        include: {
          followUps: { orderBy: { scheduledDate: "desc" }, take: 1 },
          skillAssessments: { orderBy: { createdAt: "desc" }, take: 1 }
        }
      },
      providerProfile: true,
      adminProfile: true,
    }
  });

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const sendOtp = async (input: SendOtpInput) => {
  const normalizedEmail = normalizeEmail(input.email);

  // Removed the user existence check so anyone can receive an OTP for testing

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 10 minute expiration
  const expireDate = new Date();
  expireDate.setMinutes(expireDate.getMinutes() + 10);

  await prisma.otpToken.upsert({
    where: { phone: normalizedEmail },
    update: { code: otpCode, attempts: 0, expiresAt: expireDate },
    create: { phone: normalizedEmail, code: otpCode, attempts: 0, expiresAt: expireDate }
  });

  const result = await sendOtpEmail(normalizedEmail, otpCode);
  if (!result.success) {
    // throw the specific mapped error from the email provider
    throw { statusCode: result.statusCode, message: result.message };
  }

  return { message: "If this email is registered, an OTP has been sent." };
};

export const verifyOtp = async (input: VerifyOtpInput) => {
  const { otp } = input;
  const normalizedEmail = normalizeEmail(input.email);

  const otpRecord = await prisma.otpToken.findUnique({
    where: { phone: normalizedEmail }
  });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw { statusCode: 400, message: "OTP expired or not requested" };
  }

  const attempts = otpRecord.attempts + 1;

  if (attempts > 5) {
    await prisma.otpToken.delete({ where: { phone: normalizedEmail } });
    throw { statusCode: 429, message: "Too many failed attempts. Please request a new OTP.", errorCode: "OTP_ATTEMPTS_EXCEEDED" };
  }

  if (otpRecord.code !== otp) {
    await prisma.otpToken.update({
      where: { phone: normalizedEmail },
      data: { attempts }
    });
    throw { statusCode: 400, message: "Invalid OTP" };
  }

  // OTP is valid — delete it from DB so it can't be reused
  await prisma.otpToken.delete({ where: { phone: normalizedEmail } });

  // Return a short-lived reset token (15 minutes)
  const resetToken = signToken({ email: normalizedEmail, purpose: "reset_password" }, "15m");
  return {
    message: "OTP verified successfully. Please set your new password.",
    resetToken,
  };
};

export const resetPassword = async (input: ResetPasswordInput) => {
  // 1. Verify the reset token
  let payload: { email: string; purpose: string };
  try {
    payload = verifyToken<{ email: string; purpose: string }>(input.resetToken);
  } catch {
    throw { statusCode: 400, message: "Invalid or expired reset token. Please request a new OTP." };
  }

  if (payload.purpose !== "reset_password") {
    throw { statusCode: 400, message: "Invalid reset token." };
  }

  // 2. Find the user
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw { statusCode: 404, message: "User not found." };
  }

  // 3. Hash and save the new password
  const hashedPassword = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword, mustChangePassword: false },
  });

  return { message: "Password reset successfully. You can now log in with your new password." };
};

export const changePassword = async (userId: string, input: ChangePasswordInput) => {
  const hashedPassword = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashedPassword,
      mustChangePassword: false,
    },
  });
  return { message: "Password updated successfully" };
};
