import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authSchemas.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/me", protect, getMe);

export default router;
