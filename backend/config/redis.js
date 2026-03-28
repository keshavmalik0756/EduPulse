import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on("connect", () => console.log("✅ Redis Connected"));
redis.on("error", (err) => console.error("❌ Redis Error:", err));

export default redis;
