import { Resend } from "resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

const getFromEmail = (): string => {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (from) {
    return from;
  }
  return "RV Foods <onboarding@resend.dev>";
};

export const sendEmail = async (
  options: SendEmailOptions
): Promise<boolean> => {
  const resend = getResendClient();

  if (!resend) {
    console.warn(
      "[CONFIG] RESEND_API_KEY is not configured in backend environment. Email running in mock mode."
    );
    console.info(`[Email preview] To: ${options.to} | Subject: ${options.subject}`);
    return false;
  }

  const from = getFromEmail();

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error(
        `[EMAIL ERROR] Resend delivery failed: ${error.name} - ${error.message}`
      );
      return false;
    }

    console.info(
      `[Email sent via Resend] ${options.subject} → ${options.to} (id: ${data?.id ?? "unknown"})`
    );
    return true;
  } catch (error: any) {
    console.error(
      `[EMAIL ERROR] Unexpected failure in Resend dispatch: ${error.message}`
    );
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
