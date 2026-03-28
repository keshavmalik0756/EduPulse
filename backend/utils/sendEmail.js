import nodemailer from "nodemailer";

/**
 * ========================================
 * 🚀 EduPulse Advanced Email Service
 * ========================================
 */

// Singleton transporter
let transporter = null;

// Lazy initialize transporter to ensure process.env is 100% loaded
const initTransporter = () => {
  if (transporter) return transporter;

  const port = parseInt(process.env.SMTP_PORT, 10);

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    
    // 🔥 ENFORCE IPv4 (Fixes ENETUNREACH IPv6 errors in Node.js 18+)
    host: process.env.SMTP_HOST, // Ensure this is overridden if needed
    // The "family: 4" tells underlying net.Socket to resolve DNS to IPv4 only.
    ...({ family: 4 }), // Ensure family is merged directly to options

    // 🔥 DISABLE POOLING FOR PAAS (Render/Heroku/Vercel)
    // Cloud providers silently drop idle TCP sockets after ~60s.
    // By disabling pool, we ensure a fresh, guaranteed connection every time.
    pool: false,

    // 🔐 SECURITY
    tls: {
      rejectUnauthorized: false,
    },

    // ⏱️ EXTENDED TIMEOUTS (combat slow initial handshakes)
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });

  return transporter;
};

/**
 * Retry Wrapper
 */
const sendWithRetry = async (mailOptions, retries = 3) => {
  try {
    const tp = initTransporter();
    return await tp.sendMail(mailOptions);
  } catch (error) {
    if (retries > 0) {
      console.warn(`⚠️ Email failed, retrying... (${retries})`);
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
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