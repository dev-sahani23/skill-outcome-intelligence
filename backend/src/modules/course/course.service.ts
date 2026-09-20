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

export const getProviderCourses = async (userId: string, page: number, limit: number, search?: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId }
  });

  if (!provider) {
    return { data: [], total: 0 };
  }

  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { sector: { contains: search, mode: 'insensitive' as any } }
        ]
      }
    : {};

  const whereClause = {
    providerId: provider.id,
    ...searchFilter
  };

  const skip = (page - 1) * limit;

  const [total, courses] = await Promise.all([
    prisma.trainingProgram.count({ where: whereClause }),
    prisma.trainingProgram.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [{ name: "asc" }, { id: "asc" }]
    })
  ]);

  return { data: courses, total };
};
