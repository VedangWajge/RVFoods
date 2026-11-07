import { OAuth2Client } from "google-auth-library";
import { AppError } from "../middleware/errorHandler.js";

const client = new OAuth2Client();

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
}

/**
 * Checks with Google that the sign-in credential is genuine and was issued for this
 * site. Failures use 400: a 401 would make the client try to refresh a session.
 */
export const verifyGoogleCredential = async (
  credential: string
): Promise<GoogleProfile> => {
  const audience = process.env.GOOGLE_CLIENT_ID;
  if (!audience) {
    console.error("[CONFIG ERROR] GOOGLE_CLIENT_ID is not set in server/.env");
    throw new AppError("Google sign-in isn't available right now. Please use your email.", 503);
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience });
    payload = ticket.getPayload();
  } catch (error) {
    console.warn(`[GOOGLE] Sign-in credential rejected: ${(error as Error).name}`);
    throw new AppError("Google sign-in failed. Please try again.", 400);
  }

  if (!payload?.sub || !payload.email) {
    throw new AppError("Google sign-in failed. Please try again.", 400);
  }
  // Without this, anyone could claim someone else's email on an unverified Google account.
  if (!payload.email_verified) {
    throw new AppError("Your Google email isn't verified. Please verify it or use your email.", 400);
  }

  const email = payload.email.toLowerCase().trim();
  return {
    googleId: payload.sub,
    email,
    name: (payload.name?.trim() || email.split("@")[0]).slice(0, 100),
  };
};
