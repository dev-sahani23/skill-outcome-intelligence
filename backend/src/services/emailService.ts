import { Resend } from "resend";
import path from "path";
import fs from "fs";

export type EmailResult =
  | { success: true; messageId?: string }
  | { success: false; statusCode: number; message: string };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Core generic Email sending function using Resend.
 */
export const sendEmail = async (to: string, subject: string, html: string, attachments?: any[]): Promise<EmailResult> => {
  // 1. Input validation
  if (!emailRegex.test(to)) {
    return { success: false, statusCode: 400, message: "Invalid email address provided." };
  }

  // 2. Check MOCK_EMAIL flag
  if (process.env.MOCK_EMAIL?.trim() === "true") {
    const msg = `\n========== MOCK EMAIL ==========\nTo: ${to}\nSubject: ${subject}\nBody:\n${html}\n================================\n`;
    console.log(msg);
    require("fs").appendFileSync("mock_email.log", msg);
    return { success: true, messageId: "mock_message_id_12345" };
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("Resend API key is not configured in environment variables.");
    return { success: false, statusCode: 500, message: "Email provider not configured." };
  }

  const resend = new Resend(apiKey);
  // Default to Resend's onboarding email if EMAIL_FROM is not provided.
  // NOTE: You should set EMAIL_FROM in your .env to a verified domain on Resend.
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

  try {
    const data = await resend.emails.send({
      from: `Skill Outcomes Portal <${fromEmail}>`,
      to,
      subject,
      html,
      attachments,
    });

    if (data.error) {
      console.error(`Failed to send Email via Resend:`, data.error);
      return { success: false, statusCode: 502, message: "Failed to deliver email due to an external service error." };
    }

    return { success: true, messageId: data.data?.id };
  } catch (error: any) {
    console.error(`Failed to send Email via Resend:`, error);
    return { success: false, statusCode: 502, message: "Failed to deliver email due to an external service error." };
  }
};

/**
 * Sends an OTP code.
 */
export const sendOtpEmail = async (email: string, otp: string): Promise<EmailResult> => {
  const subject = "Your verification code for Skill Outcomes Portal";
  
  const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #0b1120;
    color: #e2e8f0;
    margin: 0;
    padding: 20px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 12px;
    overflow: hidden;
  }
  .banner img {
    width: 100%;
    display: block;
  }
  .content {
    padding: 32px;
    text-align: center;
  }
  h2 {
    color: #f8fafc;
    margin-top: 0;
    font-size: 24px;
    font-weight: 600;
  }
  p {
    font-size: 16px;
    line-height: 1.6;
    color: #cbd5e1;
  }
  .otp-box {
    margin: 32px auto;
    padding: 16px 32px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 8px;
    display: inline-block;
  }
  .otp-code {
    font-size: 40px;
    font-weight: 700;
    letter-spacing: 8px;
    color: #818cf8;
    margin: 0;
  }
  .footer {
    padding: 24px;
    background-color: #0b1120;
    text-align: center;
    font-size: 12px;
    color: #64748b;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="banner">
      <!-- Note: For Resend, inline CID images may not be perfectly supported in all clients out-of-the-box compared to Nodemailer. 
           If the banner does not show up, consider hosting the image on a public URL and referencing it directly. -->
      <img src="cid:emailBannerLogo" alt="Skill Outcome Intelligence Banner" />
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Use the verification code below to securely set a new password.</p>
      
      <div class="otp-box">
        <p class="otp-code">${otp}</p>
      </div>
      
      <p>This code is valid for <strong>15 minutes</strong>.<br>If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Skill Outcome Intelligence. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
  
  let attachments = undefined;
  try {
    const bannerPath = path.join(process.cwd(), 'src/assets/email-banner.png');
    if (fs.existsSync(bannerPath)) {
      attachments = [
        {
          filename: 'email-banner.png',
          content: fs.readFileSync(bannerPath),
        }
      ];
    }
  } catch (error) {
    console.error("Could not load email banner for attachment:", error);
  }

  return sendEmail(email, subject, html, attachments);
};

/**
 * Sends a temporary password.
 */
export const sendTempPasswordEmail = async (email: string, tempPassword: string): Promise<EmailResult> => {
  const subject = "Your temporary password for Skill Outcomes Portal";
  const html = `<p>Your temporary password is <strong>${tempPassword}</strong>.</p><p>Please log in and change it immediately.</p>`;
  return sendEmail(email, subject, html);
};
