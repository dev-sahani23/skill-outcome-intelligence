import { prisma } from "../../lib/prisma";
import { CreateCourseInput } from "./course.schema";

export const createCourse = async (providerId: string, input: CreateCourseInput) => {
  // We need to find the providerProfileId from the userId
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerId }
  });

  if (!provider) {
    throw { statusCode: 404, message: "Provider profile not found" };
  }

  return prisma.trainingProgram.create({
    data: {
      providerId: provider.id,
      ...input,
    },
  });
};

export const getAllCourses = async () => {
  return prisma.trainingProgram.findMany({
    include: {
      provider: true,
    }
  });
};

export const getProviderCourses = async (userId: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId }
  });

  if (!provider) {
    return [];
  }

  return prisma.trainingProgram.findMany({
    where: { providerId: provider.id },
  });
};
