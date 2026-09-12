import { prisma } from "../../lib/prisma";
import { CreateOutcomeInput } from "./outcome.schema";

export const createOutcome = async (userId: string, input: CreateOutcomeInput) => {
  const trainee = await prisma.traineeProfile.findUnique({
    where: { userId }
  });

  if (!trainee) {
    throw { statusCode: 404, message: "Trainee profile not found" };
  }

  // Pull out non-DB fields before spreading into the Prisma create call
  const { aadhaarNo, uanNumber, ...outcomeData } = input;

  const outcome = await prisma.employmentOutcome.create({
    data: {
      traineeId: trainee.id,
      ...outcomeData,
    },
  });

  // Persist UAN on the trainee's profile (permanent, person-level identifier)
  if (uanNumber) {
    await prisma.traineeProfile.update({
      where: { id: trainee.id },
      data: { uanNumber },
    });
  }

  return outcome;
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
