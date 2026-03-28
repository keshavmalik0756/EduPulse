import sendEmail from "./sendEmail.js";
import { generateVerificationOtpEmailTemplate } from "./emailTemplates.js";

/**
 * ========================================
 * 🔐 EduPulse Advanced OTP Email Sender
 * ========================================
 */

/**
 * Mask email for secure logging
 */
const maskEmail = (email) => {
  const [name, domain] = email.split("@");
  return `${name[0]}***@${domain}`;
};

/**
 * Send verification OTP
 * @param {Object} options
 * @param {string|number} options.otp
 * @param {string} options.email
 * @param {Object} [options.req] - Express request (for IP & device)
 */
export const sendVerificationCode = async ({ otp, email, req = null }) => {
  try {
    // ===========================
    // 🔍 VALIDATION
    // ===========================
    if (!otp || !email) {
      throw new Error("OTP and email are required");
    }

    // ===========================
    // 📡 METADATA (SECURITY)
    // ===========================
    const ip =
      req?.headers["x-forwarded-for"] ||
      req?.socket?.remoteAddress ||
      "Unknown";

    const device = req?.headers["user-agent"] || "Unknown Device";

    // ===========================
    // 📧 EMAIL TEMPLATE
    // ===========================
    const html = generateVerificationOtpEmailTemplate({
      otp,
      email,
      ip,
      device,
    });

    // ===========================
    // 📤 SEND EMAIL
    // ===========================
    const response = await sendEmail({
      email,
      subject: "🔐 Verify your EduPulse account",
      html,
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });

    // ===========================
    // 📊 SUCCESS LOG
    // ===========================
    console.log("✅ OTP EMAIL SENT", {
      to: maskEmail(email),
      messageId: response?.messageId,
      ip,
    });

    return {
      success: true,
      message: "Verification email sent successfully",
    };

  } catch (error) {
    console.error("❌ OTP EMAIL FAILED", {
      email: maskEmail(email),
      error: error.message,
    });

    throw new Error("Failed to send verification email");
  }
};