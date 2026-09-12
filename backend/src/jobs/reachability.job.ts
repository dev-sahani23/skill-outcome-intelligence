import { prisma } from "../lib/prisma";
import type { Contact } from "@prisma/client";

const CASCADE_DELAY_DAYS = 5;

/**
 * Mock Notification Service
 */
const sendNotification = async (contactInfo: any, message: string) => {
  console.log(`[MOCK NOTIFICATION] To ${contactInfo.name} (${contactInfo.phone}): ${message}`);
  return true;
};

/**
 * Executes the reachability cascade.
 * Finds FollowUp rows with status PENDING or SENT older than CASCADE_DELAY_DAYS.
 * Finds the trainee's Contact with the next priority order, creates a CascadeLog,
 * sends notification, and updates status.
 */
export const runReachabilityCascade = async () => {
  console.log("Starting Reachability Cascade Job...");
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CASCADE_DELAY_DAYS);

    const followUps = await prisma.followUp.findMany({
      where: {
        status: { in: ["PENDING", "SENT"] },
        scheduledDate: { lte: cutoffDate }
      },
      include: {
        trainee: {
          include: {
            contacts: {
              orderBy: { priorityOrder: "asc" }
            }
          }
        },
        cascadeLogs: {
          orderBy: { attemptNumber: "desc" },
          take: 1
        }
      }
    });

    for (const followUp of followUps) {
      const contacts = followUp.trainee.contacts;
      if (!contacts || contacts.length === 0) {
        await prisma.followUp.update({
          where: { id: followUp.id },
          data: { status: "UNREACHABLE" }
        });
        continue;
      }

      // Determine next contact to try
      let nextContact = contacts[0];
      let attemptNumber = 1;
      
      const lastCascade = followUp.cascadeLogs[0];
      if (lastCascade) {
        const lastContactIndex = contacts.findIndex((c: Contact) => c.id === lastCascade.contactId);
        if (lastContactIndex !== -1 && lastContactIndex + 1 < contacts.length) {
          nextContact = contacts[lastContactIndex + 1];
          attemptNumber = lastCascade.attemptNumber + 1;
        } else {
          // Exhausted all contacts
          await prisma.followUp.update({
            where: { id: followUp.id },
            data: { status: "UNREACHABLE" }
          });
          continue;
        }
      }

      // Map ContactType to CascadeStage roughly, or use attemptNumber
      let cascadeStage: any = "PRIMARY_PENDING";
      if (nextContact.contactType === "GUARDIAN") cascadeStage = "GUARDIAN_PENDING";
      if (nextContact.contactType === "LOCAL_ANCHOR") cascadeStage = "ANCHOR_PENDING";

      // Send notification
      const success = await sendNotification(nextContact, "Please provide follow-up information for " + followUp.trainee.fullName);

      if (success) {
        // Log cascade
        await prisma.cascadeLog.create({
          data: {
            followUpId: followUp.id,
            contactId: nextContact.id,
            attemptNumber,
            cascadeStage,
            responseReceived: false
          }
        });

        // Update follow up status
        await prisma.followUp.update({
          where: { id: followUp.id },
          data: { status: "ESCALATED" }
        });
      }
    }
    console.log("Reachability Cascade Job finished.");
  } catch (error) {
    console.error("Error in Reachability Cascade Job:", error);
  }
};
