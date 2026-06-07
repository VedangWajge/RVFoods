import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

export const isConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

if (!isConfigured) {
  const missing: string[] = [];
  if (!process.env.RAZORPAY_KEY_ID) missing.push("RAZORPAY_KEY_ID");
  if (!process.env.RAZORPAY_KEY_SECRET) missing.push("RAZORPAY_KEY_SECRET");
  console.warn(`[CONFIG ERROR] Razorpay credentials are missing in server/.env: ${missing.join(", ")}. Checkout will run in mock mode.`);
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

