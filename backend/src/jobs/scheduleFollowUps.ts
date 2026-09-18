import { followUpQueue } from "../queues/followUpQueue";
import { prisma } from "../lib/prisma";

export async function scheduleFollowUpsForTrainee(traineeId: string, certificationDate: Date): Promise<void> {
  try {
    const contacts = await prisma.contact.findMany({
      where: { traineeId, isActive: true },
      orderBy: { priorityOrder: "asc" }
    });

    if (contacts.length === 0) {
      console.warn(`No contacts found for trainee ${traineeId}. Cannot schedule follow-ups.`);
      return;
    }

    const primaryContact = contacts[0];

    const stages = [
      { stage: "AT_CERTIFICATION", delayDays: 0 },
      { stage: "DAY_30", delayDays: 30 },
      { stage: "MONTH_3", delayDays: 90 },
      { stage: "MONTH_6", delayDays: 180 },
      { stage: "MONTH_12", delayDays: 365 },
      { stage: "MONTH_24", delayDays: 730 },
    ];

    const trainee = await prisma.traineeProfile.findUnique({ where: { id: traineeId } });
    if (!trainee) return;

    for (const s of stages) {
      const scheduledDate = new Date(certificationDate);
      scheduledDate.setDate(scheduledDate.getDate() + s.delayDays);

      // We only create if it doesn't exist. We DO NOT overwrite status to PENDING on existing jobs!
      let followUp = await prisma.followUp.findUnique({
        where: { traineeId_stage: { traineeId, stage: s.stage as any } }
      });

      if (!followUp) {
        followUp = await prisma.followUp.create({
          data: { traineeId, stage: s.stage as any, scheduledDate, status: "PENDING" }
        });
      }

      // If it's already sent, responded, unreachable, or escalated, don't enqueue.
      if (['SENT', 'RESPONDED', 'UNREACHABLE', 'ESCALATED'].includes(followUp.status)) {
        continue;
      }

      // Lock row to PROCESSING
      const lockResult = await prisma.followUp.updateMany({
        where: { id: followUp.id, status: 'PENDING' },
        data: { status: 'PROCESSING' }
      });

      // If lock failed, it might already be PROCESSING from a concurrent run
      if (lockResult.count === 0 && followUp.status === 'PENDING') {
        continue; 
      }

      const delayMs = s.delayDays * 24 * 60 * 60 * 1000;
      const jobId = `followup-${followUp.id}`;

      try {
        await followUpQueue.add(
          "send-follow-up",
          {
            followUpId: followUp.id,
            traineeId,
            stage: s.stage as any,
            primaryPhone: primaryContact.phone,
            traineeFirstName: trainee.fullName.split(' ')[0] || trainee.fullName,
            attemptNumber: 1,
            contactId: primaryContact.id,
          },
          { delay: delayMs, jobId } // deterministic jobId is natively deduped by BullMQ!
        );
      } catch (err) {
        console.error(`Failed to enqueue follow-up ${followUp.id}:`, err);
        // DO NOT revert to PENDING. If Redis got it and response timed out, it's safe as PROCESSING.
        // If Redis dropped it completely, /send-now reconciliation will heal it.
      }
    }
  } catch (error) {
    console.error(`Failed to schedule follow-ups for trainee ${traineeId}:`, error);
  }
}
