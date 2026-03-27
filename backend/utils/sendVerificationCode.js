import sendEmail from "./sendEmail.js";
import { generateVerificationOtpEmailTemplate } from "./emailTemplates.js";

/**
 * Send verification code to user's email
 * @param {string|number} otp - The verification code/OTP
 * @param {string} email - The user's email address
 */
export const sendVerificationCode = async (otp, email) => {
  try {
    const message = generateVerificationOtpEmailTemplate(otp);
    
    await sendEmail({
      email,
      subject: "Verify your email address - EduPulse",
      message,
    });
    
    console.log(`✅ Verification code sent successfully to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send verification code to ${email}:`, error.message);
    throw error;
  }
};
