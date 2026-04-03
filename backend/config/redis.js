import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // Allow background retries without throwing error
  enableReadyCheck: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on("connect", () => console.log("✅ Redis Connected"));
redis.on("error", (err) => console.error("❌ Redis Error:", err));

export default redis;
