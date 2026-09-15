import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function run() {
  const followUpId = process.argv[2] || '5b62d6a4-272d-4ec7-8a76-39e839a3f30b';
  
  if (!process.argv[2]) {
    console.log(`No followUpId provided. Using default: ${followUpId}`);
  }
  console.log("Waiting for webhook to process your reply (polling every 2s)...");

  while (true) {
    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
      select: { id: true, status: true, responseData: true, completedAt: true }
    });

    if (followUp && followUp.status === 'RESPONDED') {
      console.log("\n✅ Reply successfully processed!");
      console.log(JSON.stringify(followUp, null, 2));
      break;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  process.exit(0);
}

run();
