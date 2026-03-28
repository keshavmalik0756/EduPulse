/**
 * ========================================
 * 📧 EduPulse Email Templates (Advanced)
 * ========================================
 */

// ========================================
// 🔐 VERIFICATION OTP EMAIL
// ========================================
export function generateVerificationOtpEmailTemplate({ otp, email, ip, device }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f0f9ff;
        font-family: 'Segoe UI', sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        padding: 30px;
        border-radius: 16px;
        border: 1px solid #bae6fd;
      }
      h1 {
        color: #0369a1;
        text-align: center;
      }
      p {
        color: #083344;
        font-size: 15px;
      }
      .otp-box {
        text-align: center;
        margin: 25px 0;
      }
      .otp {
        font-size: 34px;
        font-weight: bold;
        background: #bae6fd;
        padding: 14px 30px;
        border-radius: 12px;
        letter-spacing: 5px;
        display: inline-block;
      }
      .info {
        font-size: 13px;
        color: #0369a1;
        margin-top: 20px;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 13px;
        color: #0c4a6e;
      }
      @media (prefers-color-scheme: dark) {
        body { background: #0c4a6e; }
        .container { background: #083344; color: #bae6fd; }
        p, h1 { color: #bae6fd; }
      }
    </style>
  </head>

  <body>
    <div class="container">
      <h1>🔐 Verify Your Email</h1>

      <p>Hello,</p>
      <p>Use the OTP below to verify your EduPulse account:</p>

      <div class="otp-box">
        <div class="otp">${otp}</div>
      </div>

      <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it.</p>

      <div class="info">
        <p><strong>Requested Email:</strong> ${email}</p>
        <p><strong>IP Address:</strong> ${ip || "Unknown"}</p>
        <p><strong>Device:</strong> ${device || "Unknown Device"}</p>
      </div>

      <div class="footer">
        <p>EduPulse Team 🚀</p>
        <p>This is an automated email. Do not reply.</p>
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
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f0f9ff;
        font-family: 'Segoe UI', sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        padding: 30px;
        border-radius: 16px;
        border: 1px solid #bae6fd;
      }
      h1 {
        text-align: center;
        color: #0369a1;
      }
      p {
        color: #083344;
        font-size: 15px;
      }
      .btn {
        display: block;
        text-align: center;
        margin: 25px auto;
        padding: 14px;
        background: #0ea5e9;
        color: white;
        text-decoration: none;
        border-radius: 12px;
        font-weight: bold;
      }
      .link {
        font-size: 12px;
        word-break: break-word;
        color: #0369a1;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 13px;
        color: #0c4a6e;
      }
      @media (prefers-color-scheme: dark) {
        body { background: #0c4a6e; }
        .container { background: #083344; color: #bae6fd; }
        p, h1 { color: #bae6fd; }
      }
    </style>
  </head>

  <body>
    <div class="container">
      <h1>🔁 Reset Your Password</h1>

      <p>Hello,</p>
      <p>You requested a password reset for your EduPulse account.</p>

      <a href="${resetUrl}" class="btn">Reset Password</a>

      <p>If the button doesn't work:</p>
      <p class="link">${resetUrl}</p>

      <p>This link expires in <strong>5 minutes</strong>.</p>

      <div class="footer">
        <p><strong>Account:</strong> ${email}</p>
        <p><strong>IP:</strong> ${ip || "Unknown"}</p>
        <p>If you didn’t request this, ignore this email.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}