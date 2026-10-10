import { Pool } from "pg";
import { createPostgresBackend } from "bullmq";
import * as dotenv from "dotenv";

dotenv.config();

// Standard PostgreSQL pool for BullMQ (replaces ioredis instance)
export const queuePool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // max number of clients in the pool
});

// Important: BullMQ uses the 'bullmq' schema for functions/tables.
queuePool.on('connect', (client) => {
    client.query("SET search_path TO bullmq, public;")
        .catch(err => console.error("Failed to set search_path on connect:", err));
});

export const getQueueBackend = () => createPostgresBackend;

export const queueConnectionOptions = {
    connection: queuePool // the pg pool instance
};
