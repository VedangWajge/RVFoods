import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const isEmailConfigured = (): boolean => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  return Boolean(user && pass);
};

if (!isEmailConfigured()) {
  const missing: string[] = [];
  if (!process.env.EMAIL_USER) missing.push("EMAIL_USER");
  if (!process.env.EMAIL_PASS) missing.push("EMAIL_PASS");
  console.warn(`[CONFIG ERROR] SMTP Email credentials are missing in server/.env: ${missing.join(", ")}. Emails will run in mock mode.`);
}

const createTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  const user = process.env.EMAIL_USER!.trim();
  const pass = process.env.EMAIL_PASS!.trim();
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const sendEmail = async (
  options: SendEmailOptions
): Promise<boolean> => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      "[CONFIG ERROR] Email send requested, but EMAIL_USER and EMAIL_PASS are missing in server/.env (running in mock mode)."
    );
    console.warn(`[Email preview] To: ${options.to} | Subject: ${options.subject}`);
    console.warn(`[Email preview] ${options.text ?? ""}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `RV Foods <${process.env.EMAIL_USER!.trim()}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`[Email sent] ${options.subject} → ${options.to}`);
    return true;
  } catch (error: any) {
    console.error(`[API ERROR] Email send failed: ${error.message}`);
    if (process.env.NODE_ENV !== "production") {
      console.error(error.stack);
    }
    return false;
  }
};

export const sendVerificationOtpEmail = async (
  email: string,
  name: string,
  otp: string
): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: "Verify your RV Foods account",
    text: `Hi ${name}, your verification code is: ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #C84B31;">RV Foods</h2>
        <p>Hi ${name},</p>
        <p>Your email verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #C84B31;">${otp}</p>
        <p style="color: #6B6B6B;">This code expires in 10 minutes.</p>
        <p style="color: #6B6B6B;">Pure. Traditional. Delivered.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetUrl: string
): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: "Reset your RV Foods password",
    text: `Hi ${name}, reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #C84B31;">RV Foods</h2>
        <p>Hi ${name},</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #C84B31; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Reset Password</a>
        <p style="color: #6B6B6B; font-size: 12px;">If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};
