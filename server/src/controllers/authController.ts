import crypto from "crypto";
import type { Response } from "express";
import { User, type IUser } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
} from "../utils/generateToken.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import {
  sendVerificationOtpEmail,
  sendPasswordResetEmail,
} from "../utils/sendEmail.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESET_EXPIRY_MS = 60 * 60 * 1000;

const generateOtp = (): string =>
  crypto.randomInt(100000, 1000000).toString();

const normalizeEmail = (email: string): string => email.toLowerCase().trim();

const normalizeOtp = (otp: string): string => otp.trim().replace(/\s/g, "");

const shouldIncludeDevOtp = (emailSent: boolean): boolean =>
  process.env.NODE_ENV === "development" &&
  (!process.env.EMAIL_USER?.trim() || !emailSent);

const saveEmailOtp = async (
  userId: IUser["_id"],
  otp: string
): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        emailOtpHash: hashToken(otp),
        emailOtpExpires: new Date(Date.now() + OTP_EXPIRY_MS),
      },
    }
  );
};

const toPublicUser = (user: IUser) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });
};

const issueAuthTokens = async (
  user: IUser,
  res: Response
): Promise<{ accessToken: string; user: ReturnType<typeof toPublicUser> }> => {
  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  return { accessToken, user: toPublicUser(user) };
};

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, password, phone } = req.body as {
    name: string;
    email: string;
    password: string;
    phone?: string;
  };
  const email = normalizeEmail(req.body.email as string);

  const existing = await User.findOne({ email }).select(
    "+emailOtpHash +emailOtpExpires +password"
  );

  if (existing?.isVerified) {
    sendError(res, "Email already registered", 409);
    return;
  }

  const otp = generateOtp();
  let user: IUser;

  if (existing && !existing.isVerified) {
    existing.name = name;
    existing.password = password;
    if (phone) existing.phone = phone;
    await existing.save();
    user = existing;
  } else {
    user = await User.create({
      name,
      email,
      password,
      phone: phone || undefined,
      isVerified: false,
    });
  }

  await saveEmailOtp(user._id, otp);

  const emailSent = await sendVerificationOtpEmail(email, name, otp);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Dev OTP] ${email} → ${otp}`);
  }

  const refreshed = await User.findById(user._id);
  if (!refreshed) {
    sendError(res, "Registration failed", 500);
    return;
  }

  sendSuccess(
    res,
    emailSent
      ? "Registration successful. Please verify your email with the OTP sent."
      : "Registration successful. Use the verification code shown below (email not configured).",
    {
      user: toPublicUser(refreshed),
      ...(shouldIncludeDevOtp(emailSent) ? { devOtp: otp } : {}),
    },
    existing ? 200 : 201
  );
});

/** POST /api/auth/resend-otp */
export const resendOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email as string);

  const user = await User.findOne({ email }).select(
    "+emailOtpHash +emailOtpExpires"
  );

  if (!user) {
    sendError(res, "No account found with this email", 404);
    return;
  }

  if (user.isVerified) {
    sendError(res, "Email is already verified", 400);
    return;
  }

  const otp = generateOtp();
  await saveEmailOtp(user._id, otp);

  const emailSent = await sendVerificationOtpEmail(email, user.name, otp);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Dev OTP resent] ${email} → ${otp}`);
  }

  sendSuccess(res, "Verification code sent", {
    ...(shouldIncludeDevOtp(emailSent) ? { devOtp: otp } : {}),
  });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email as string);
  const { password } = req.body as { password: string };

  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user || !user.password) {
    sendError(res, "Invalid email or password", 401);
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    sendError(res, "Invalid email or password", 401);
    return;
  }

  if (!user.isVerified) {
    sendError(
      res,
      "Please verify your email before logging in. Use resend OTP if needed.",
      403
    );
    return;
  }

  const tokens = await issueAuthTokens(user, res);

  sendSuccess(res, "Login successful", tokens);
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (req: AuthRequest, res) => {
  const cookieToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;

  if (cookieToken) {
    try {
      const decoded = verifyRefreshToken(cookieToken);
      await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
    } catch {
      // ignore invalid cookie on logout
    }
  }

  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  }

  clearRefreshTokenCookie(res);
  sendSuccess(res, "Logged out successfully");
});

/** POST /api/auth/refresh-token */
export const refreshToken = asyncHandler(async (req, res) => {
  const cookieToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;

  if (!cookieToken) {
    sendError(res, "Refresh token not found", 401);
    return;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(cookieToken);
  } catch {
    clearRefreshTokenCookie(res);
    sendError(res, "Invalid or expired refresh token", 401);
    return;
  }

  const user = await User.findById(decoded.userId).select("+refreshToken");

  if (!user || user.refreshToken !== hashToken(cookieToken)) {
    clearRefreshTokenCookie(res);
    sendError(res, "Invalid refresh token", 401);
    return;
  }

  const accessToken = generateAccessToken(user._id.toString(), user.role);

  sendSuccess(res, "Token refreshed", { accessToken });
});

/** POST /api/auth/verify-email */
export const verifyEmail = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email as string);
  const otp = normalizeOtp(req.body.otp as string);

  const user = await User.findOne({ email }).select(
    "+emailOtpHash +emailOtpExpires"
  );

  if (!user) {
    sendError(res, "No account found for this email", 404);
    return;
  }

  if (!user.emailOtpHash || !user.emailOtpExpires) {
    sendError(
      res,
      "No verification code on file. Please register again or resend OTP.",
      400
    );
    return;
  }

  if (user.emailOtpExpires < new Date()) {
    sendError(res, "OTP has expired. Please resend a new code.", 400);
    return;
  }

  const otpHash = hashToken(otp);
  if (user.emailOtpHash !== otpHash) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[OTP mismatch] email=${email} submitted=${otp}`);
    }
    sendError(res, "Invalid OTP. Please check the code and try again.", 400);
    return;
  }

  user.isVerified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const tokens = await issueAuthTokens(user, res);

  sendSuccess(res, "Email verified successfully", tokens);
});

/** POST /api/auth/forgot-password */
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email as string);

  const user = await User.findOne({ email });

  sendSuccess(
    res,
    "If an account exists with this email, a reset link has been sent."
  );

  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetTokenHash = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + RESET_EXPIRY_MS);
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const emailSent = await sendPasswordResetEmail(user.email, user.name, resetUrl);

  if (process.env.NODE_ENV === "development" && !emailSent) {
    console.warn(`[Dev] Password reset URL: ${resetUrl}`);
  }
});

/** POST /api/auth/reset-password */
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body as { token: string; password: string };
  const token = String(req.body.token).trim();

  const tokenHash = hashToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpires");

  if (!user) {
    sendError(res, "Invalid or expired reset token", 400);
    return;
  }

  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  clearRefreshTokenCookie(res);
  sendSuccess(res, "Password reset successful. Please log in.");
});

/** GET /api/auth/google */
export const googleAuth = asyncHandler(async (_req, _res) => {
  throw new AppError(
    "Google OAuth is not configured yet. Set up Google credentials in server/.env",
    501
  );
});

/** GET /api/auth/google/callback */
export const googleCallback = asyncHandler(async (_req, _res) => {
  throw new AppError("Google OAuth callback is not configured yet", 501);
});

/** GET /api/auth/me — current user (protected) */
export const getMe = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    sendError(res, "Not authorized", 401);
    return;
  }
  sendSuccess(res, "User profile fetched", { user: toPublicUser(req.user) });
});
