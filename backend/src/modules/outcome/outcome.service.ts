import { prisma } from "../../lib/prisma";
import { CreateOutcomeInput } from "./outcome.schema";

export const createOutcome = async (userId: string, input: CreateOutcomeInput) => {
  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId }
  });

  if (!trainee) {
    throw { statusCode: 404, message: "Trainee profile not found" };
  }

  return prisma.employmentOutcome.create({
    data: {
      traineeId: trainee.id,
      ...input,
    },
  });
};

export const getMyOutcomes = async (userId: string) => {
  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId }
  });

  if (!trainee) {
    return [];
  }

  return prisma.employmentOutcome.findMany({
    where: { traineeId: trainee.id },
    orderBy: { reportedAt: 'desc' }
  });
};
