/**
 * ========================================
 * 🚀 EduPulse Backend – Optimized Server
 * ========================================
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
// ⚙️ ENV CONFIG
// ===========================
dotenv.config({ path: path.resolve(__dirname, ".env") });

// ===========================
// 🧠 IMPORTS
// ===========================
import connectDB from "./config/connectDB.js";
import { errorMiddleware } from "./middleware/errorMiddlewares.js";
import { removeUnverifiedAccounts } from "./services/removeUnverifiedAccounts.js";

// Routes
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

// ===========================
// 🚀 APP INIT
// ===========================
const app = express();
const PORT = process.env.PORT || 8080;

// ===========================
// 🔐 SECURITY MIDDLEWARE
// ===========================
app.set("trust proxy", 1);
app.use(helmet());
app.use(mongoSanitize());
app.disable("x-powered-by");

// ===========================
// 🌍 CORS (ULTRA FIXED)
// ===========================
const allowedOrigins = process.env.FRONTEND_URL.split(",");

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed: " + origin));
    }
  },
  credentials: true
}));

// ===========================
// 🚦 RATE LIMIT
// ===========================
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  })
);

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1500,
  })
);

// ===========================
// 🧩 MIDDLEWARE
// ===========================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===========================
// 📂 STATIC FILES
// ===========================
const uploadPath = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use("/uploads", express.static(uploadPath));

// ===========================
// 🧱 DATABASE
// ===========================
connectDB()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err.message));

// ===========================
// 🧹 BACKGROUND JOBS
// ===========================
removeUnverifiedAccounts();

// ===========================
// 📡 REQUEST LOGGER
// ===========================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// ===========================
// 🔗 ROUTES
// ===========================

// Welcome Route for root domains
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 EduPulse Enterprise API is running online and serving requests flawlessly.",
  });
});
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

import sendEmail from "./utils/sendEmail.js";

// ===========================
// 🧪 HEALTH CHECK & TESTING
// ===========================
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      email: "keshavmalik0756@gmail.com",
      subject: "EduPulse SMTP Test",
      html: "<h1>SMTP Configuration is successful!</h1>",
    });
    res.send("✅ Email sent successfully without 500 crashes.");
  } catch (error) {
    console.error("💥 TEST EMAIL ERROR:", error);
    res.status(500).send(`❌ SMTP Failed: ${error.message}`);
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "✅ EduPulse Backend Running",
    environment: process.env.NODE_ENV,
  });
});

// ===========================
// ❌ 404 HANDLER
// ===========================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ===========================
// 💥 ERROR HANDLER
// ===========================
app.use(errorMiddleware);

// ===========================
// 🖥️ SERVER START
// ===========================
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ===========================
// 🧯 SHUTDOWN HANDLING
// ===========================
process.on("SIGINT", () => {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
});

process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});