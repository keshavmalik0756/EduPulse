/**
 * ========================================
 * 📧 EduPulse Email Templates (Advanced & Professional)
 * ========================================
 */

// ========================================
// 🔐 VERIFICATION OTP EMAIL
// ========================================
export function generateVerificationOtpEmailTemplate({ otp, email, ip, device }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          /* CSS Reset & Email Client Normalization */
          body, p, h1, h2, h3, div { margin: 0; padding: 0; }
          body { 
              background-color: #f4f7f6; 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              -webkit-font-smoothing: antialiased; 
          }
          .wrapper { background-color: #f4f7f6; padding: 40px 20px; }
          
          /* Main Container */
          .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff; 
              border-radius: 12px; 
              box-shadow: 0 8px 30px rgba(0,0,0,0.04); 
              overflow: hidden; 
              border: 1px solid #eaeaea; 
          }
          
          /* Header */
          .header { 
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
              padding: 30px 40px; 
              text-align: center; 
          }
          .header h1 { 
              color: #ffffff; 
              font-size: 24px; 
              font-weight: 700; 
              letter-spacing: 1px; 
              margin: 0; 
          }
          .header span {
              color: #3b82f6;
          }
          
          /* Content Body */
          .content { padding: 40px; }
          .greeting { 
              font-size: 18px; 
              color: #334155; 
              margin-bottom: 20px; 
              font-weight: 600; 
          }
          .text { 
              font-size: 16px; 
              color: #475569; 
              line-height: 1.6; 
              margin-bottom: 30px; 
          }
          
          /* OTP Display Area */
          .otp-container { 
              background-color: #f8fafc; 
              border: 2px dashed #cbd5e1; 
              border-radius: 12px; 
              padding: 30px; 
              text-align: center; 
              margin-bottom: 30px; 
          }
          .otp-code { 
              font-size: 42px; 
              font-weight: 700; 
              color: #0f172a; 
              letter-spacing: 8px; 
              font-family: 'Courier New', Courier, monospace; 
              margin: 0; 
          }
          
          /* Security Warning */
          .warning { 
              font-size: 14px; 
              color: #ef4444; 
              background: #fef2f2; 
              border-left: 4px solid #ef4444; 
              padding: 12px 16px; 
              border-radius: 4px; 
              margin-bottom: 30px; 
          }
          
          /* Meta / Diagnostic Info */
          .meta-info { 
              background-color: #f8fafc; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 30px; 
              border: 1px solid #e2e8f0;
          }
          .meta-row { 
              display: block; 
              margin-bottom: 8px; 
              font-size: 13px; 
              color: #64748b; 
          }
          .meta-row strong { 
              color: #334155; 
              display: inline-block; 
              width: 120px; 
          }
          
          /* Footer */
          .footer { 
              background-color: #f1f5f9; 
              padding: 30px 40px; 
              text-align: center; 
              border-top: 1px solid #e2e8f0;
          }
          .footer p { 
              font-size: 13px; 
              color: #64748b; 
              line-height: 1.6; 
              margin-bottom: 10px; 
          }
          
          /* Responsive Overrides */
          @media only screen and (max-width: 600px) {
              .content { padding: 25px 20px; }
              .header { padding: 20px; }
              .otp-code { font-size: 32px; letter-spacing: 5px; }
              .meta-row strong { display: block; width: 100%; margin-bottom: 4px; }
          }
      </style>
  </head>
  <body>
      <div class="wrapper">
          <div class="container">
              <div class="header">
                  <h1>Edu<span>Pulse</span></h1>
              </div>
              <div class="content">
                  <p class="greeting">Secure Your Account</p>
                  <p class="text">Hello,</p>
                  <p class="text">We received a request to verify your EduPulse account. Please use the following One-Time Password (OTP) to complete the verification process securely.</p>
                  
                  <div class="otp-container">
                      <p class="otp-code">${otp}</p>
                  </div>
  
                  <div class="warning">
                      <strong>Security Alert:</strong> This code is valid for exactly <strong>5 minutes</strong>. For your protection, never share this code with anyone, including members of our staff.
                  </div>
  
                  <div class="meta-info">
                      <div class="meta-row"><strong>Request Email:</strong> ${email}</div>
                      <div class="meta-row"><strong>IP Address:</strong> ${ip || "Unknown"}</div>
                      <div class="meta-row"><strong>Device/OS:</strong> ${device || "Unknown Device"}</div>
                  </div>
                  
                  <p class="text" style="font-size: 14px; margin-bottom: 0;">If you did not initiate this request, please ignore this email or contact our support team immediately to secure your account.</p>
              </div>
              <div class="footer">
                  <p><strong>EduPulse Inc. | Empowering Education Everywhere</strong></p>
                  <p>This is an automated security message. Replies to this email address are not monitored.</p>
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
}

// ========================================
// 🔁 PASSWORD RESET EMAIL
// ========================================
export function generatePasswordResetEmailTemplate({ resetUrl, email, ip }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          /* CSS Reset & Email Client Normalization */
          body, p, h1, h2, h3, div { margin: 0; padding: 0; }
          body { 
              background-color: #f4f7f6; 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              -webkit-font-smoothing: antialiased; 
          }
          .wrapper { background-color: #f4f7f6; padding: 40px 20px; }
          
          /* Main Container */
          .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff; 
              border-radius: 12px; 
              box-shadow: 0 8px 30px rgba(0,0,0,0.04); 
              overflow: hidden; 
              border: 1px solid #eaeaea; 
          }
          
          /* Header */
          .header { 
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
              padding: 30px 40px; 
              text-align: center; 
          }
          .header h1 { 
              color: #ffffff; 
              font-size: 24px; 
              font-weight: 700; 
              letter-spacing: 1px; 
              margin: 0; 
          }
          .header span {
              color: #3b82f6;
          }
          
          /* Content Body */
          .content { padding: 40px; }
          .greeting { 
              font-size: 18px; 
              color: #334155; 
              margin-bottom: 20px; 
              font-weight: 600; 
          }
          .text { 
              font-size: 16px; 
              color: #475569; 
              line-height: 1.6; 
              margin-bottom: 30px; 
          }
          
          /* Call To Action Button */
          .button-wrapper { 
              text-align: center; 
              margin: 40px 0; 
          }
          .button { 
              display: inline-block; 
              background-color: #2563eb; 
              color: #ffffff !important; 
              font-size: 16px; 
              font-weight: 600; 
              text-decoration: none; 
              padding: 16px 36px; 
              border-radius: 8px; 
              box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); 
              transition: background-color 0.2s; 
          }
          .button:hover { background-color: #1d4ed8; }
          
          /* Fallback Link */
          .fallback { 
              text-align: center; 
              margin-bottom: 30px; 
          }
          .fallback p { 
              font-size: 14px; 
              color: #64748b; 
              margin-bottom: 12px; 
          }
          .fallback-link { 
              font-size: 13px; 
              color: #2563eb; 
              word-break: break-all; 
              text-decoration: underline; 
              background: #f8fafc; 
              padding: 16px; 
              border-radius: 8px; 
              display: block; 
              border: 1px solid #e2e8f0;
          }
          
          /* Meta / Diagnostic Info */
          .meta-info { 
              background-color: #f8fafc; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 30px; 
              border: 1px solid #e2e8f0;
          }
          .meta-row { 
              display: block; 
              margin-bottom: 8px; 
              font-size: 13px; 
              color: #64748b; 
          }
          .meta-row strong { 
              color: #334155; 
              display: inline-block; 
              width: 120px; 
          }
          
          /* Footer */
          .footer { 
              background-color: #f1f5f9; 
              padding: 30px 40px; 
              text-align: center; 
              border-top: 1px solid #e2e8f0;
          }
          .footer p { 
              font-size: 13px; 
              color: #64748b; 
              line-height: 1.6; 
              margin-bottom: 10px; 
          }
          
          /* Responsive Overrides */
          @media only screen and (max-width: 600px) {
              .content { padding: 25px 20px; }
              .header { padding: 20px; }
              .meta-row strong { display: block; width: 100%; margin-bottom: 4px; }
          }
      </style>
  </head>
  <body>
      <div class="wrapper">
          <div class="container">
              <div class="header">
                  <h1>Edu<span>Pulse</span></h1>
              </div>
              <div class="content">
                  <p class="greeting">Password Reset Request</p>
                  <p class="text">Hello,</p>
                  <p class="text">We received a request to reset the password associated with your EduPulse account. If you made this request, please click the button below to securely set a new password.</p>
                  
                  <div class="button-wrapper">
                      <!-- VML Fallback for Outlook compatibility, though inline CSS handles most modern clients -->
                      <a href="${resetUrl}" class="button" target="_blank" rel="noopener noreferrer">Reset My Password</a>
                  </div>
  
                  <div class="fallback">
                      <p>If the button above does not work, copy and paste the following link directly into your browser:</p>
                      <div class="fallback-link">${resetUrl}</div>
                  </div>
  
                  <div class="meta-info">
                      <div class="meta-row"><strong>Account Email:</strong> ${email}</div>
                      <div class="meta-row"><strong>IP Address:</strong> ${ip || "Unknown"}</div>
                      <div class="meta-row"><strong>Request Time:</strong> ${new Date().toUTCString()}</div>
                  </div>
                  
                  <p class="text" style="font-size: 14px; color: #64748b; margin-bottom: 0;">
                      <strong>Note:</strong> This secure link will automatically expire in <strong>5 minutes</strong>. If you did not request a password reset, you can safely ignore this email; your password will remain unchanged.
                  </p>
              </div>
              <div class="footer">
                  <p><strong>EduPulse Inc. | Security Operations</strong></p>
                  <p>This is an automated security message. Replies to this email address are not monitored.</p>
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
}