import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { ResponseJobData } from "../queues/responseQueue";
import { structureFollowUpResponse, classifyAttritionReason } from "../services/groqService";
import { OutcomeType, PlacementStatus } from "@prisma/client";

export const responseWorker = new Worker<ResponseJobData>(
  "whatsapp-responses",
  async (job: Job<ResponseJobData>) => {
    const { followUpId, traineeId, rawText, senderPhone, receivedAt } = job.data;

    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
    });

    if (!followUp) {
      console.warn(`FollowUp ${followUpId} not found, skipping`);
      return;
    }

    try {
      const parsedData = await structureFollowUpResponse(rawText, followUp.stage);

      await prisma.$transaction(async (tx) => {
        // a. Update FollowUp
        await tx.followUp.update({
          where: { id: followUpId },
          data: {
            status: "RESPONDED",
            responseData: parsedData as any,
            completedAt: new Date(receivedAt),
          },
        });

        // b. Update CascadeLog
        const latestCascadeLog = await tx.cascadeLog.findFirst({
          where: { followUpId },
          orderBy: { attemptedAt: "desc" },
        });

        if (latestCascadeLog) {
          await tx.cascadeLog.update({
            where: { id: latestCascadeLog.id },
            data: {
              responseReceived: true,
              responseAt: new Date(receivedAt),
            },
          });
        }

        // c. Upsert EmploymentOutcome if employed
        let activeOutcome = await tx.employmentOutcome.findFirst({
          where: { traineeId, status: "ACTIVE" },
          orderBy: { reportedAt: "desc" },
        });

        if (
          parsedData.employmentStatus === "employed" ||
          parsedData.employmentStatus === "self_employed" ||
          parsedData.employmentStatus === "apprenticeship"
        ) {
          let outcomeType: OutcomeType = "FORMAL_EMPLOYMENT";
          if (parsedData.employmentStatus === "self_employed") outcomeType = "SELF_EMPLOYED";
          if (parsedData.employmentStatus === "apprenticeship") outcomeType = "APPRENTICESHIP";

          if (activeOutcome) {
            activeOutcome = await tx.employmentOutcome.update({
              where: { id: activeOutcome.id },
              data: {
                type: outcomeType,
                employerName: parsedData.employerName || activeOutcome.employerName,
                designation: parsedData.jobRole || activeOutcome.designation,
                monthlyWage: parsedData.monthlySalary || activeOutcome.monthlyWage,
              },
            });
          } else {
            activeOutcome = await tx.employmentOutcome.create({
              data: {
                traineeId,
                type: outcomeType,
                employerName: parsedData.employerName,
                designation: parsedData.jobRole,
                monthlyWage: parsedData.monthlySalary,
                status: "ACTIVE",
                reportedAt: new Date(receivedAt),
              },
            });
          }
        }

        // d. Create WageRecord
        if (parsedData.monthlySalary !== null && activeOutcome) {
          // Check if wage record for today exists
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          await tx.wageRecord.upsert({
            where: {
              outcomeId_recordedDate: {
                outcomeId: activeOutcome.id,
                recordedDate: today,
              },
            },
            update: {
              salaryAmount: parsedData.monthlySalary,
            },
            create: {
              outcomeId: activeOutcome.id,
              recordedDate: today,
              salaryAmount: parsedData.monthlySalary,
              source: "self_reported",
            },
          });
        }

        // e. Create AttritionRecord
        if (parsedData.employmentStatus === "unemployed" && parsedData.reasonIfUnemployed) {
          const reasonEnum = await classifyAttritionReason(parsedData.reasonIfUnemployed);
          
          await tx.attritionRecord.create({
            data: {
              traineeId,
              outcomeId: activeOutcome?.id,
              reasonCode: reasonEnum,
              reasonSource: "AI_CLASSIFIED",
              recordedAt: new Date(receivedAt),
            },
          });

          // Mark active outcome as LEFT if unemployed
          if (activeOutcome) {
            await tx.employmentOutcome.update({
              where: { id: activeOutcome.id },
              data: {
                status: "LEFT",
                endDate: new Date(receivedAt),
              },
            });
          }
        }
      });
    } catch (error) {
      console.error("[DEAD LETTER]", rawText, error);
      await prisma.followUp.update({
        where: { id: followUpId },
        data: { status: "SENT" },
      });
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 3,
  }
);

console.log("🚀 responseWorker is running and listening for jobs");
