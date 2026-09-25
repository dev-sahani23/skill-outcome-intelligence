import { Queue } from "bullmq";
import { createRedisConnection } from "../lib/redis";

export interface ResponseJobData {
  followUpId: string;
  traineeId: string;
  rawText: string;
  senderPhone: string;
  receivedAt: string;
}

export const responseQueue = new Queue<ResponseJobData>("whatsapp-responses", {
  connection: createRedisConnection(),
});
