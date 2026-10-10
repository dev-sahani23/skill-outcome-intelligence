import { queuePool } from "./lib/queueDB";
import { runMigrations } from "bullmq";

async function setup() {
    try {
        const client = await queuePool.connect();
        try {
            await client.query("CREATE SCHEMA IF NOT EXISTS bullmq;");
            await runMigrations(client);
            console.log("✅ BullMQ PostgreSQL migrations ran successfully.");
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("❌ Failed to setup BullMQ schema:", error);
        process.exit(1);
    } finally {
        await queuePool.end();
    }
}

setup();
