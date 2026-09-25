import { Queue } from "bullmq";
import { createRedisConnection } from "../lib/redis";
import { FollowUpStage } from "@prisma/client";

export interface FollowUpJobData {
  followUpId: string;
  traineeId: string;
  stage: FollowUpStage;
  primaryPhone: string;
  traineeFirstName: string;
  attemptNumber: number;
  contactId: string;
}

export const followUpQueue = new Queue<FollowUpJobData>("follow-ups", {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
