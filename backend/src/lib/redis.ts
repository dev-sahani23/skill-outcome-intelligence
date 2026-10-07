import Redis from "ioredis";

// In production, we'll use process.env.REDIS_URL
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const tlsOptions = redisUrl.startsWith('rediss://')
  ? { rejectUnauthorized: false }
  : undefined;

// Shared connection for BullMQ queues and workers.
// All BullMQ modules share a single ioredis instance to minimise the number
// of connections and authentication round-trips that count against the
// Upstash request quota.
export const bullmqConnection = new Redis(redisUrl, {
  tls: tlsOptions,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// General-purpose client for application code (OTP storage, deduplication, etc.)
export const redisClient = new Redis(redisUrl, {
  tls: tlsOptions,
  maxRetriesPerRequest: 3,
  lazyConnect: false,
  enableReadyCheck: true,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

// Dev-only Redis Command Usage Tracker
if (process.env.NODE_ENV !== "production") {
  const originalSendCommand = Redis.prototype.sendCommand;
  let commandCount = 0;

  // Log command totals periodically
  setInterval(() => {
    if (commandCount > 0) {
      console.log(`[Redis Dev Metrics] ${commandCount} commands executed in the last 10 seconds`);
      commandCount = 0; // reset
    }
  }, 10000);

  Redis.prototype.sendCommand = function (command: any) {
    if (command && command.name) {
      commandCount++;
      // Uncomment the line below for extremely verbose command-level tracing:
      // console.log(`[Redis CMD] ${command.name.toUpperCase()}`);
    }
    return originalSendCommand.apply(this, arguments as any);
  };
}
