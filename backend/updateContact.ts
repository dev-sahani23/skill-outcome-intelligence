import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function run() {
  await prisma.contact.updateMany({
    where: {
      traineeId: "a9171437-b833-452f-816c-3367a984b15e",
      priorityOrder: 1,
    },
    data: {
      phone: "+917567186619",
    },
  });

  const updatedContact = await prisma.contact.findFirst({
    where: {
      traineeId: "a9171437-b833-452f-816c-3367a984b15e",
      priorityOrder: 1,
    },
    select: { phone: true, priorityOrder: true, contactType: true },
  });

  console.log(JSON.stringify(updatedContact, null, 2));
  process.exit(0);
}

run().catch(console.error);
