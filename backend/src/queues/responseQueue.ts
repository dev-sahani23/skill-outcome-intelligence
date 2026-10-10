import { Queue } from "bullmq";
import { getQueueBackend, queueConnectionOptions } from "../lib/queueDB";

export interface ResponseJobData {
  followUpId: string;
  traineeId: string;
  rawText: string;
  senderPhone: string;
  receivedAt: string;
}

export const responseQueue = new Queue<ResponseJobData>("whatsapp-responses", {
  ...queueConnectionOptions,
}, getQueueBackend() as any);
