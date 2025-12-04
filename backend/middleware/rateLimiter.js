/**
 * ============================================================
 * ⚡ EduPulse Rate Limiter (Auto-Config Edition – 2025)
 * ============================================================
 *
 * 🔹 Works automatically with all routes using:
 *      import rateLimiter from "../middleware/rateLimiter.js";
 *      router.get("/route", rateLimiter(100, 15 * 60 * 1000), controller);
 *
 * 🔹 Features:
 *   ✅ Auto-uses Redis if REDIS_URL is provided
 *   ✅ In-memory fallback if Redis unavailable
 *   ✅ Role-aware scaling (admin ×5, educator ×2)
 *   ✅ Dev-mode relaxed unless strict routes (like auth)
 *   ✅ Plug-and-play — no other file needs editing
 */

import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

let RedisStore;
let redisClient;
let useRedis = false;

// ------------------------------------------------------------
// 🧩 Optional Redis Setup (only if REDIS_URL exists)
// ------------------------------------------------------------
if (process.env.REDIS_URL) {
  try {
    const { createClient } = await import("redis");
    const { RedisStore: ExpressRedisStore } = await import("rate-limit-redis");

    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (err) =>
      console.warn("⚠️ Redis RateLimiter Error:", err.message)
    );

    await redisClient.connect();
    RedisStore = ExpressRedisStore;
    useRedis = true;

    console.log("✅ RateLimiter: Connected to Redis.");
  } catch (err) {
    console.warn("⚠️ RateLimiter: Redis not available, using in-memory store.");
    useRedis = false;
  }
}

/**
 * ============================================================
 * ⚙️ Main Rate Limiter Middleware
 * ============================================================
 *
 * @param {number} max - Max requests per window
 * @param {number} windowMs - Time window in ms
 * @param {object} opts - Optional: { message, strict }
 */
export default function rateLimiter(max = 100, windowMs = 15 * 60 * 1000, opts = {}) {
  const isProduction = process.env.NODE_ENV === "production";
  const message = opts.message || "Too many requests, please try again later.";
  const strict = opts.strict || false;

  return rateLimit({
    store: useRedis
      ? new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) })
      : undefined,

    windowMs,
    max: (req) => {
      // 🎓 Role-based flexibility (works automatically)
      if (req.user?.role === "admin") return max * 5;
      if (req.user?.role === "educator") return max * 2;
      return max;
    },

    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
      console.warn(`⚠️ Rate limit hit by ${req.ip} → ${req.originalUrl}`);
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000) + "s",
      });
    },

    skip: (req) => {
      // 🚀 Skip limiter in dev mode unless strict (login/OTP, etc.)
      if (!isProduction && !strict) return true;
      return false;
    },
  });
}

/**
 * ============================================================
 * ⚡ Pre-configured Shortcuts (Optional)
 * ============================================================
 * Use anywhere:  import { rateLimits } from "../middleware/rateLimiter.js";
 */
export const rateLimits = {
  general: rateLimiter(500, 15 * 60 * 1000), // general browsing
  auth: rateLimiter(10, 15 * 60 * 1000, {
    strict: true,
    message: "Too many login or OTP attempts. Please wait 15 minutes.",
  }),
  upload: rateLimiter(20, 60 * 60 * 1000, {
    strict: true,
    message: "Too many uploads. Please try again in an hour.",
  }),
  dashboard: rateLimiter(100, 10 * 60 * 1000, {
    message: "Too many analytics requests. Please slow down.",
  }),
};
