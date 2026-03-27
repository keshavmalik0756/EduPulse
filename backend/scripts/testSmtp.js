import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sendEmail from "../utils/sendEmail.js";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const testSmtp = async () => {
  console.log("==============================================");
  console.log("📧 Starting EduPulse SMTP Configuration Test");
  console.log("==============================================");
  
  const testEmail = process.env.SMTP_MAIL || "keshavmalik0756@gmail.com";
  
  console.log(`📍 SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`📍 SMTP Port: ${process.env.SMTP_PORT}`);
  console.log(`📍 SMTP User: ${process.env.SMTP_MAIL}`);
  console.log(`📍 Target Email: ${testEmail}`);
  console.log("----------------------------------------------");

  try {
    console.log("⏳ Attempting to send test email...");
    
    const result = await sendEmail({
      email: testEmail,
      subject: "EduPulse SMTP Test Connection ✅",
      message: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">EduPulse SMTP Test</h2>
          <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
          <p><strong>Status:</strong> Success ✅</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666;">This email was sent automatically by the EduPulse testing script.</p>
        </div>
      `,
    });

    console.log("✅ SMTP Test Successful!");
    console.log("📋 Result Info:", JSON.stringify(result, null, 2));
    console.log("==============================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ SMTP Test Failed!");
    console.error("❗ Error Details:", error.message);
    console.log("==============================================");
    process.exit(1);
  }
};

testSmtp();
