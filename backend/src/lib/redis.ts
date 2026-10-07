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

// Safe Redis Command Usage Tracker (Bypasses Upstash INFO Censorship)
export const globalCommandStats: Record<string, number> = {};

const originalSendCommand = Redis.prototype.sendCommand;
Redis.prototype.sendCommand = function (command: any) {
  if (command && command.name) {
    const cmdName = command.name.toLowerCase();
    globalCommandStats[cmdName] = (globalCommandStats[cmdName] || 0) + 1;
  }
  return originalSendCommand.apply(this, arguments as any);
};

// Console log total commands executed every 10s only in Dev mode
if (process.env.NODE_ENV !== "production") {
  let lastTotal = 0;
  setInterval(() => {
    const total = Object.values(globalCommandStats).reduce((a, b) => a + b, 0);
    const delta = total - lastTotal;
    if (delta > 0) {
      console.log(`[Redis Dev Metrics] ${delta} commands executed in the last 10 seconds`);
      lastTotal = total;
    }
  }, 10000);
}
