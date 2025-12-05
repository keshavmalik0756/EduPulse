/**
 * =========================================
 * ⚡ EduPulse App Configuration (2025)
 * =========================================
 * Core middleware setup:
 * - CORS
 * - Security headers (helmet)
 * - JSON & URL encoding limits
 * - Cookie parser
 * - Mongo sanitize (for query injection protection)
 * - Compression (for faster responses)
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";

dotenv.config(); // Load environment variables early

// Initialize app
const app = express();

// ===============================
// 🌍 CORS CONFIGURATION
// ===============================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  ...(process.env.FRONTEND_URL?.split(",").map(url => url.trim().replace(/\/$/, "")) || []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Normalize origin by removing trailing slash
      const normalizedOrigin = origin.replace(/\/$/, "");
      
      // Check if origin is allowed
      const isAllowed = allowedOrigins.some(
        (allowed) => allowed.replace(/\/$/, "") === normalizedOrigin
      );
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    exposedHeaders: ["Content-Length", "X-JSON-Response-Size"],
  })
);

// ===============================
// 🔐 SECURITY MIDDLEWARE
// ===============================
app.use(helmet());              // Adds security headers
app.use(mongoSanitize());       // Prevents NoSQL injection
app.disable("x-powered-by");    // Hides Express signature

// ===============================
// ⚙️ REQUEST PARSERS
// ===============================
app.use(express.json({ limit: "50mb" }));              // Handle large payloads (e.g., videos)
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ===============================
// ⚡ PERFORMANCE OPTIMIZATION
// ===============================
app.use(compression());         // Gzip compression for faster responses

// ===============================
// 🧩 DEFAULT HEALTH CHECK
// ===============================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ EduPulse App is Running!",
    environment: process.env.NODE_ENV || "development",
    frontend: process.env.FRONTEND_URL,
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// ✅ EXPORT APP INSTANCE
// ===============================
export default app;
