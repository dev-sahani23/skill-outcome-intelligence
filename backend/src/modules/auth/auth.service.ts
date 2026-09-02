import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";
import { RegisterInput, LoginInput } from "./auth.schema";

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
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
      email: input.email,
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

  const accessToken = signToken({ id: user.id, role: user.role });
  const refreshToken = signToken({ id: user.id, role: user.role }, "7d");

  // Exclude passwordHash from returned user
  const { passwordHash, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
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

  const accessToken = signToken({ id: user.id, role: user.role });
  const refreshToken = signToken({ id: user.id, role: user.role }, "7d");

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
