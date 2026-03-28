/**
 * =============================================================
 * ⚡ EduPulse Cache Middleware (Smart Hybrid Edition – 2025)
 * =============================================================
 * ✅ Automatically selects best cache backend:
 *    • Development  → In-Memory (NodeCache)
 *    • Production   → Redis (if available)
 *
 * ✅ Works out of the box — no edits required anywhere else.
 * ✅ Supports cache clearing & health inspection utilities.
 * ✅ Caches all successful GET responses automatically.
 *
 * Example usage:
 *    router.get("/api/courses", cacheMiddleware(300), getAllCourses);
 */

import NodeCache from "node-cache";
import dotenv from "dotenv";
import redisClient from "../config/redis.js";

dotenv.config();

let useRedis = false;

// ==========================================================
// 🔴 Redis Verification
// ==========================================================
if (process.env.REDIS_URL) {
    useRedis = true;
    console.log("✅ CacheMiddleware maps to central ioredis.");
} else {
    console.log("ℹ️ No REDIS_URL provided — using local NodeCache.");
}

// ==========================================================
// 💾 Local Cache Fallback (NodeCache)
// ==========================================================
const localCache = new NodeCache({
    stdTTL: 60,       // default 60 seconds
    checkperiod: 120, // clean interval
    useClones: false,
});

// ==========================================================
// 🧠 Helper Functions
// ==========================================================
const getCache = async (key) => {
    try {
        if (useRedis && redisClient) {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        }
        return localCache.get(key);
    } catch (err) {
        console.warn("⚠️ Cache GET error:", err.message);
        return null;
    }
};

const setCache = async (key, value, ttl) => {
    try {
        if (useRedis && redisClient) {
            await redisClient.set(key, JSON.stringify(value), "EX", ttl);
        } else {
            localCache.set(key, value, ttl);
        }
    } catch (err) {
        console.warn("⚠️ Cache SET error:", err.message);
    }
};

export const cacheUser = async (user) => {
  if (useRedis) await redisClient.set(`user:${user._id}`, JSON.stringify(user), "EX", 3600);
};

export const getCachedUser = async (id) => {
  if (!useRedis) return null;
  const data = await redisClient.get(`user:${id}`);
  return data ? JSON.parse(data) : null;
};

export const invalidateUserCache = async (id) => {
  if (useRedis) await redisClient.del(`user:${id}`);
};

export const clearCacheKey = async (key) => {
    try {
        if (useRedis && redisClient) await redisClient.del(key);
        else localCache.del(key);
    } catch (err) {
        console.warn("⚠️ Cache CLEAR error:", err.message);
    }
};

export const flushAllCache = async () => {
    try {
        if (useRedis && redisClient) await redisClient.flushAll();
        else localCache.flushAll();
    } catch (err) {
        console.warn("⚠️ Cache FLUSH error:", err.message);
    }
};

// ==========================================================
// ⚙️ Main Middleware
// ==========================================================
export const cacheMiddleware = (duration = 60) => {
    return async (req, res, next) => {
        try {
            // Cache only GET requests
            if (req.method !== "GET") return next();

            // Include user id in cache key when available to prevent cross-user leakage
            const userKey = req.user?._id ? `::user:${req.user._id.toString()}` : "";
            const key = `${req.originalUrl}${userKey}`;
            const cachedData = await getCache(key);

            if (cachedData) {
                // Return the original cached response shape to avoid double-nesting
                // Merge a lightweight flag to help observability without breaking clients
                const body = (cachedData && typeof cachedData === "object")
                  ? { ...cachedData, fromCache: true }
                  : cachedData;
                return res.status(200).json(body);
            }

            // Override res.json to store cache automatically
            const originalJson = res.json.bind(res);
            res.json = async (body) => {
                try {
                    if (body && body.success !== false) {
                        await setCache(key, body, duration);
                    }
                } catch (err) {
                    console.warn("⚠️ Cache write skipped:", err.message);
                }
                return originalJson(body);
            };

            next();
        } catch (err) {
            console.warn("⚠️ Cache middleware error:", err.message);
            next();
        }
    };
};

// ==========================================================
// 🧩 Cache System Status (for admin dashboard)
// ==========================================================
export const getCacheStatus = () => {
    return {
        engine: useRedis ? "Redis" : "NodeCache (Memory)",
        keysStored: useRedis
            ? "Managed by Redis"
            : localCache.keys().length,
        defaultTTL: localCache.options.stdTTL,
        health: useRedis
            ? redisClient?.isOpen
                ? "Connected"
                : "Disconnected"
            : "Active (Local Memory)",
    };
};
