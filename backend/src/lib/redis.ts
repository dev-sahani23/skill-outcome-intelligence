import Redis from "ioredis";

// In production, we'll use process.env.REDIS_URL
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const createRedisConnection = () => new Redis(redisUrl, {
  tls: redisUrl.startsWith('rediss://')
    ? { rejectUnauthorized: false }
    : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const redisClient = new Redis(redisUrl, {
  tls: redisUrl.startsWith('rediss://')
    ? { rejectUnauthorized: false }
    : undefined,
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
