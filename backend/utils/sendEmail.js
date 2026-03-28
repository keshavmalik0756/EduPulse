import { Resend } from "resend";

/**
 * ========================================
 * 🚀 EduPulse Advanced Email Service (Resend Integration)
 * ========================================
 */

let resendInstance = null;

const getResendClient = () => {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing ENV: RESEND_API_KEY. Please provide your Resend API token.");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
};

/**
 * Main Email Transport Protocol using REST HTTPS
 */
const sendEmail = async ({
  email,
  subject,
  html,
  text,
  attachments,
  cc,
  bcc,
}) => {
  try {
    const resend = getResendClient();

    // In a live production setting with a verified domain, change this in .env
    const fromAddress = process.env.RESEND_FROM_EMAIL || "EduPulse <onboarding@resend.dev>";

    // Build the request securely bypassing raw SMTP layers
    const mailPayload = {
      from: fromAddress,
      to: [email],
      subject,
      html,
    };

    // Add optional routing variables safely
    if (text) mailPayload.text = text;
    if (cc) mailPayload.cc = cc;
    if (bcc) mailPayload.bcc = bcc;
    if (attachments && attachments.length > 0) mailPayload.attachments = attachments;

    console.log(`📤 Dispatching email out to ${email} via HTTPS REST API...`);

    // Submit cleanly via Resend's edge infrastructure
    const response = await resend.emails.send(mailPayload);

    // Resend catches REST validations and returns them inside "response.error" instead of crashing natively
    if (response.error) {
      console.error("❌ RESEND API REJECTED DISPATCH:", response.error);
      throw new Error(response.error.message || "Resend API validation failed.");
    }

    console.log("✅ Email successfully delivered to Edge API:", response.data.id);
    return response;

  } catch (error) {
    console.error("❌ HTTPS EMAIL TRANSPORT ERROR:");
    console.error({ message: error.message, stack: error.stack });
    
    // Pass generalized string up the chain to the client safely
    throw new Error(`Email failed: ${error.message}`);
  }
};

export default sendEmail;