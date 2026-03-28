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
import redisClient from "../config/redis.js";

dotenv.config();

let RedisStore;
let useRedis = false;

// ------------------------------------------------------------
// 🧩 Optional Redis Setup (only if REDIS_URL exists)
// ------------------------------------------------------------
if (process.env.REDIS_URL) {
  try {
    const { RedisStore: ExpressRedisStore } = await import("rate-limit-redis");

    RedisStore = ExpressRedisStore;
    useRedis = true;

    console.log("✅ RateLimiter: Connected to global ioredis config.");
  } catch (err) {
    console.warn("⚠️ RateLimiter: Redis logic fallback, using in-memory store.");
    useRedis = false;
  }
}

/**
 * ============================================================
 * 🛡️ OTP Custom Anti-Spam (Redis backed)
 * ============================================================
 */
export const checkOtpLimit = async (email) => {
  const key = `otp_limit:${email}`;
  const attempts = await redisClient.incr(key);

  if (attempts === 1) {
    await redisClient.expire(key, 600); // 10 min
  }

  if (attempts > 5) {
    throw new Error("Too many OTP requests. Try again later.");
  }
};

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
      ? new RedisStore({ sendCommand: (...args) => redisClient.call(...args) })
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
