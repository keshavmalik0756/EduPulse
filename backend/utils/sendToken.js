/**
 * ========================================
 * 🔐 EduPulse Advanced Token Handler
 * ========================================
 */
import redis from "../config/redis.js";

export const sendToken = async (user, statusCode, res, req = null) => {
  try {
    // ===========================
    // 🔑 GENERATE TOKENS
    // ===========================
    const accessToken = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    if (!accessToken || !refreshToken) {
      throw new Error("Token generation failed");
    }

    // ===========================
    // 🌍 ENV BASED COOKIE CONFIG
    // ===========================
    const isProduction = process.env.NODE_ENV === "production";

    const accessTokenOptions = {
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    };

    const refreshTokenOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    };

    // ===========================
    // 📊 OPTIONAL LOGGING
    // ===========================
    console.log("🔐 Auth Success:", {
      userId: user._id,
      email: user.email,
      ip: req?.ip,
      device: req?.headers["user-agent"],
    });

    // ===========================
    // 🍪 SET COOKIES & REDIS SESSION
    // ===========================
    await redis.set(`session:${user._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

    res
      .status(statusCode)
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .json({
        success: true,

        // 🔥 MINIMAL SAFE USER DATA
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },

        // ⚡ OPTIONAL (for frontend usage)
        accessToken,
        refreshToken,
      });

  } catch (error) {
    console.error("💥 TOKEN ERROR:", {
      message: error.message,
      stack: error.stack,
    });

    // ===========================
    // 🔁 FALLBACK RESPONSE
    // ===========================
    return res.status(statusCode).json({
      success: false,
      message: "Authentication successful but token setup failed",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  }
};