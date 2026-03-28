import nodemailer from "nodemailer";

/**
 * ========================================
 * 🚀 EduPulse Advanced Email Service
 * ========================================
 */

// Create transporter ONCE (pooling enabled)
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT, 10);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },

    // 🔥 PERFORMANCE BOOST
    pool: true,
    maxConnections: 5,
    maxMessages: 100,

    // 🔐 SECURITY
    tls: {
      rejectUnauthorized: false, // Bypasses Render/Gmail SNI certificate handshake mismatches
    },

    // ⏱️ TIMEOUTS
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

// Singleton transporter
const transporter = createTransporter();

/**
 * Retry Wrapper
 */
const sendWithRetry = async (mailOptions, retries = 3) => {
  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    if (retries > 0) {
      console.warn(`⚠️ Email failed, retrying... (${retries})`);
      return sendWithRetry(mailOptions, retries - 1);
    }
    throw error;
  }
};

/**
 * Main Email Function
 */
const sendEmail = async ({
  email,
  subject,
  html,
  text,
  attachments = [],
  cc,
  bcc,
}) => {
  try {
    // ===========================
    // 🔍 ENV VALIDATION
    // ===========================
    const requiredEnv = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_MAIL",
      "SMTP_PASSWORD",
    ];

    for (const key of requiredEnv) {
      if (!process.env[key]) {
        throw new Error(`Missing ENV: ${key}`);
      }
    }

    // ===========================
    // 📧 MAIL OPTIONS
    // ===========================
    const mailOptions = {
      from: `EduPulse <${process.env.SMTP_MAIL}>`,
      to: email,
      subject,
      html,
      text: text || "EduPulse Notification",
      attachments,
      cc,
      bcc,
    };

    console.log("📤 Sending email to:", email);

    const info = await sendWithRetry(mailOptions);

    console.log("✅ Email sent:", {
      messageId: info.messageId,
      response: info.response,
    });

    return info;

  } catch (error) {
    console.error("❌ EMAIL SERVICE ERROR");
    console.error({
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
    });

    throw new Error(`Email failed: ${error.message}`);
  }
};

export default sendEmail;