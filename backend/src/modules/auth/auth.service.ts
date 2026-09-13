import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/password";
import { signToken, verifyToken } from "../../utils/jwt";
import { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput, ChangePasswordInput, ResetPasswordInput } from "./auth.schema";
import { sendOtpEmail } from "../../services/emailService";
import { normalizeEmail } from "../../utils/normalizeEmail";
import { redisClient } from "../../lib/redis";

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
          },
        },
      }),
      ...(input.role === "PROVIDER" && {
        providerProfile: {
          create: {
            instituteName: input.instituteName || "",
            contactPerson: input.fullName,
            phone: input.phone,
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
      traineeProfile: true,
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
  const otpKey = `otp:${normalizedEmail}`;

  // Store OTP with 10 minute expiration using pipeline for atomicity
  await redisClient.pipeline()
    .hmset(otpKey, { code: otpCode, attempts: 0 })
    .expire(otpKey, 10 * 60)
    .exec();

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
  const otpKey = `otp:${normalizedEmail}`;

  const verifyScript = `
    local exists = redis.call("EXISTS", KEYS[1])
    if exists == 0 then return -1 end
    local attempts = redis.call("HINCRBY", KEYS[1], "attempts", 1)
    local code = redis.call("HGET", KEYS[1], "code")
    return {attempts, code}
  `;

  const result = await redisClient.eval(verifyScript, 1, otpKey);

  if (result === -1) {
    throw { statusCode: 400, message: "OTP expired or not requested" };
  }

  const [attempts, code] = result as [number, string];

  if (attempts > 5) {
    await redisClient.del(otpKey);
    throw { statusCode: 429, message: "Too many failed attempts. Please request a new OTP.", errorCode: "OTP_ATTEMPTS_EXCEEDED" };
  }

  if (code !== otp) {
    throw { statusCode: 400, message: "Invalid OTP" };
  }

  // OTP is valid — delete it from Redis so it can't be reused
  await redisClient.del(otpKey);

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
