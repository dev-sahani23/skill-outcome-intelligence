import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const enrollments = await prisma.enrollment.findMany();
  const seen = new Set();
  const toDelete = [];
  for (const env of enrollments) {
    const key = `${env.traineeId}-${env.programId}`;
    if (seen.has(key)) {
      toDelete.push(env.id);
    } else {
      seen.add(key);
    }
  }
  
  if (toDelete.length > 0) {
    await prisma.enrollment.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log(`Deleted ${toDelete.length} duplicates.`);
  } else {
    console.log("No duplicates found.");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
