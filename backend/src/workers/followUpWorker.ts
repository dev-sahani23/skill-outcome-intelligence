import { Worker, Job } from "bullmq";
import { redisClient } from "../lib/redis";
import {prisma} from "../lib/prisma";
import { FollowUpJobData, followUpQueue } from "../queues/followUpQueue";
import { sendFollowUpWhatsApp } from "../services/whatsappService";
import { CascadeStage, ContactType } from "@prisma/client";

function getCascadeStage(contactType: ContactType): CascadeStage {
  if (contactType === 'SELF') return 'PRIMARY_PENDING';
  if (contactType === 'GUARDIAN') return 'GUARDIAN_PENDING';
  if (contactType === 'LOCAL_ANCHOR') return 'ANCHOR_PENDING';
  return 'PRIMARY_PENDING';
}

export const followUpWorker = new Worker<FollowUpJobData>(
  "follow-ups",
  async (job: Job<FollowUpJobData>) => {
    const { followUpId, traineeId, stage, primaryPhone, traineeFirstName, attemptNumber, contactId } = job.data;

    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
    });

    if (!followUp) {
      console.warn(`FollowUp ${followUpId} not found, skipping`);
      return;
    }

    const currentContact = await prisma.contact.findUnique({ where: { id: contactId }});
    if (!currentContact) return;

    // Consent Check (Final Guard)
    const consent = await prisma.consentRecord.findFirst({
      where: { traineeId, consentType: "data_sharing" },
      orderBy: { grantedAt: "desc" }
    });

    if (consent?.revokedAt) {
      await prisma.followUp.update({
        where: { id: followUpId },
        data: { status: "UNREACHABLE", notes: "System: data_sharing consent revoked." }
      });
      console.warn(`FollowUp ${followUpId} aborted due to revoked consent.`);
      return;
    }

    const response = await sendFollowUpWhatsApp(primaryPhone, stage, traineeFirstName);

    if (response.success) {
      await prisma.$transaction([
        prisma.followUp.update({
          where: { id: followUpId },
          data: {
            status: "SENT",
            channelUsed: "WHATSAPP",
            completedAt: null,
          },
        }),
        prisma.cascadeLog.create({
          data: {
            followUpId,
            contactId,
            attemptNumber,
            cascadeStage: getCascadeStage(currentContact.contactType),
            attemptedAt: new Date(),
            responseReceived: false,
          },
        }),
      ]);
      return;
    }

    if (response.errorType === 'invalid_number') {
      await prisma.followUp.update({
        where: { id: followUpId },
        data: { notes: "Failed: invalid_number" },
      });
      return;
    }

    if (response.errorType === 'auth_error') {
      console.error("WHATSAPP TOKEN EXPIRED — manual intervention required");
      throw new Error("WHATSAPP TOKEN EXPIRED");
    }

    if (response.errorType === 'rate_limit') {
      await followUpQueue.add(job.name, job.data, { delay: 60000 });
      return;
    }

    if (response.errorType === 'server_error') {
      const contacts = await prisma.contact.findMany({
        where: { traineeId, isActive: true },
        orderBy: { priorityOrder: "asc" },
      });

      const nextContact = contacts.find(c => c.priorityOrder > currentContact.priorityOrder);

      await prisma.cascadeLog.create({
        data: {
          followUpId,
          contactId,
          attemptNumber,
          cascadeStage: "UNREACHABLE",
          attemptedAt: new Date(),
          responseReceived: false,
        },
      });

      if (nextContact) {
        await followUpQueue.add(
          job.name,
          {
            ...job.data,
            primaryPhone: nextContact.phone,
            contactId: nextContact.id,
            attemptNumber: attemptNumber + 1,
          },
          { jobId: `${job.name}-${nextContact.id}-${attemptNumber + 1}` }
        );
      } else {
        await prisma.followUp.update({
          where: { id: followUpId },
          data: { status: "UNREACHABLE" },
        });
      }
    }
  },
  {
    connection: redisClient,
    concurrency: 5,
  }
);

console.log("🚀 followUpWorker is running and listening for jobs");
