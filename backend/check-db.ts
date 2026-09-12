import { prisma } from "./src/lib/prisma";

async function main() {
  const count = await prisma.trainingProgram.count();
  console.log("Total courses:", count);
  const courses = await prisma.trainingProgram.findMany();
  console.log("Courses:", courses.map(c => c.name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
