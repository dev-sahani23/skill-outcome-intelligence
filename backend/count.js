const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const providerA = await prisma.providerProfile.findFirst({
    where: { user: { email: 'provider1@skillportal.com' } }
  });
  console.log("Provider A ID:", providerA?.id);

  const enrollmentsCount = await prisma.enrollment.count({
    where: { program: { providerId: providerA?.id } }
  });
  console.log("TOTAL ENROLLMENTS COUNT:", enrollmentsCount);

  const enrollmentsDistinctCount = await prisma.enrollment.findMany({
    where: { program: { providerId: providerA?.id } },
    distinct: ['traineeId']
  });
  console.log("DISTINCT TRAINEES COUNT:", enrollmentsDistinctCount.length);
}

main().finally(() => prisma.$disconnect());
