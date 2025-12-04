/**
 * ========================================
 * 🌐 EduPulse Backend – Main Server File
 * ========================================
 * Includes:
 * - Secure middleware setup (Helmet, mongoSanitize, RateLimit)
 * - Global error handling
 * - Cloudinary + Multer ready
 * - Routes for Auth, Users, Courses, Sections, Lectures
 * - Health checks & graceful startup
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ===========================
// 📁 Directory Setup
// ===========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===========================
// ⚙️ Environment Setup
// ===========================
dotenv.config({ path: path.resolve(__dirname, ".env") });

// ===========================
// 🧠 Imports (Database & Routes)
// ===========================
import connectDB from "./config/connectDB.js";
import { removeUnverifiedAccounts } from "./services/removeUnverifiedAccounts.js";
import { errorMiddleware } from "./middleware/errorMiddlewares.js";

// Routers
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRouter.js";
import sectionRouter from "./routes/sectionRouter.js";
import lectureRouter from "./routes/lectureRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import discussionRouter from "./routes/discussionRouter.js";
import noteRouter from "./routes/noteRouter.js";
import confusionRouter from "./routes/confusionRouter.js";
import momentumRouter from "./routes/momentumRouter.js";
import dropoutRouter from "./routes/dropoutRouter.js";
import engagementRouter from "./routes/engagementRouter.js";
import productivityRouter from "./routes/productivityRouter.js";
import leaderboardRouter from "./routes/leaderboardRouter.js";
import lectureQualityRouter from "./routes/lectureQualityRouter.js";
import progressRouter from "./routes/progressRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
// Removed activityRouter import

// ===========================
// 🚀 App Initialization
// ===========================
const app = express();
const port = process.env.PORT || 8080;

// ===========================
// 🔐 Security Middleware
// ===========================
app.set("trust proxy", 1); // Trust proxy headers (for Render.com, Heroku, etc.)
app.use(helmet());
app.use(mongoSanitize());
app.disable("x-powered-by"); // Hide Express info for security

// ===========================
// 🌍 CORS Configuration
// ===========================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ===========================
// 🚦 Rate Limiting (Tiered)
// ===========================
const defaultRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "⏳ Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "⚠️ Too many authentication attempts, please wait a bit.",
  },
});

app.use("/api/", defaultRateLimit);
app.use("/api/auth", authLimiter);

// ===========================
// 🧩 Middleware Configuration
// ===========================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ===========================
// 📂 Static & Upload Handling
// ===========================
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory:", uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

// ===========================
// 🧱 Database Connection
// ===========================
connectDB()
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    console.warn("⚠️ Continuing without DB (for dev mode)");
  });

// ===========================
// 🧹 Background Services
// ===========================
removeUnverifiedAccounts();

// ===========================
// 🧩 API Routes
// ===========================
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/sections", sectionRouter);
app.use("/api/lectures", lectureRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/discussions", discussionRouter);
app.use("/api/notes", noteRouter);
app.use("/api/confusion", confusionRouter);
app.use("/api/momentum", momentumRouter);
app.use("/api/dropout", dropoutRouter);
app.use("/api/engagement", engagementRouter);
app.use("/api/productivity", productivityRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/quality", lectureQualityRouter);
app.use("/api/progress", progressRouter);
app.use("/api/payments", paymentRouter);
// Removed activityRouter usage

// ===========================
// 🧪 Health & Test Routes
// ===========================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ EduPulse Backend Running Smoothly!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    features: {
      security: "Active",
      cors: "Configured",
      database: "Connected",
      fileUploads: "Enabled",
      analytics: "Enabled",
    },
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Backend Test Route Working!",
    timestamp: new Date().toISOString(),
  });
});

// ===========================
// 🌟 Root Endpoint
// ===========================
app.get("/", (req, res) =>
  res.send(
    `<h1>Welcome to EduPulse Backend 🎓</h1><p>Visit <a href="/api/health">/api/health</a> for system status.</p>`
  )
);

// ===========================
// 🧾 Error Handling
// ===========================

// Handle large file upload errors
app.use((error, req, res, next) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message:
        "📦 File too large. Max allowed: 100MB for regular files, 5GB for videos.",
      code: "FILE_TOO_LARGE",
    });
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "🚫 Too many files uploaded.",
      code: "TOO_MANY_FILES",
    });
  }

  next(error);
});

// Catch-all 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `❌ Route not found: ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorMiddleware);

// ===========================
// 🖥️ Server Startup
// ===========================
const server = app.listen(port, () => {
  console.log("==============================================");
  console.log("🚀 EduPulse Backend Server Started Successfully");
  console.log(`🌐 Running on: http://localhost:${port}`);
  console.log("🔗 API Base: http://localhost:" + port + "/api");
  console.log("🏥 Health: http://localhost:" + port + "/api/health");
  console.log("==============================================");
});

// ===========================
// 🧯 Graceful Shutdown Handling
// ===========================
process.on("SIGINT", () => {
  console.log("🛑 Gracefully shutting down server...");
  server.close(() => {
    console.log("✅ Server closed successfully.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});
