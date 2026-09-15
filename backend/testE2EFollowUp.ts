import "dotenv/config";
import { prisma } from "./src/lib/prisma";
import { scheduleFollowUpsForTrainee } from "./src/jobs/scheduleFollowUps";
import { followUpQueue } from "./src/queues/followUpQueue";
import { responseQueue } from "./src/queues/responseQueue";

async function runTests() {
  console.log("=== Starting Verification Tests ===");
  
  // 1. MOCK TEST SETUP
  // Let's create a dummy user and trainee
  const mockEmail = `trainee_test_${Date.now()}@example.com`;
  
  const user = await prisma.user.create({
    data: {
      email: mockEmail,
      passwordHash: "dummy",
      role: "TRAINEE",
      traineeProfile: {
        create: {
          fullName: "Test Trainee",
          phone: "+919999999999"
        }
      }
    },
    include: { traineeProfile: true }
  });

  const trainee = user.traineeProfile!;

  await prisma.contact.create({
    data: {
      traineeId: trainee.id,
      contactType: "SELF",
      name: "Test Trainee Self",
      phone: "+919999999999",
      priorityOrder: 1,
      isActive: true
    }
  });

  console.log(`Created trainee ${trainee.id} with contact`);

  // Simulate enrollment completion
  console.log("Scheduling follow ups...");
  await scheduleFollowUpsForTrainee(trainee.id, new Date());

  // Wait a moment for jobs to be scheduled
  await new Promise(res => setTimeout(res, 2000));

  const followUps = await prisma.followUp.findMany({
    where: { traineeId: trainee.id }
  });

  console.log(`Scheduled FollowUps in DB: ${followUps.length} (expected 6)`);

  const pendingJobs = await followUpQueue.getDelayed();
  console.log(`Delayed jobs in BullMQ: ${pendingJobs.length}`);

  // Find DAY_30 followup
  const day30 = followUps.find(f => f.stage === "DAY_30");
  if (day30) {
    console.log("Promoting DAY_30 job to run immediately...");
    const jobs = await followUpQueue.getDelayed();
    const job = jobs.find(j => j.data.followUpId === day30.id);
    if (job) {
      await job.promote();
      console.log("Job promoted. Waiting for worker to process...");
      await new Promise(res => setTimeout(res, 3000));

      const updatedFollowUp = await prisma.followUp.findUnique({ where: { id: day30.id } });
      console.log(`FollowUp status after mock worker run: ${updatedFollowUp?.status}`);
    }
  }

  console.log("=== Mock Test Completed ===");
  process.exit(0);
}

runTests().catch(console.error);
