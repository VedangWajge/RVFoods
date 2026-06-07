import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User.js";

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  userId: string;
}

const isJwtConfigured = (): boolean => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  return Boolean(
    secret && secret !== "your_super_secret_key" &&
    refreshSecret && refreshSecret !== "your_refresh_secret"
  );
};

if (!isJwtConfigured()) {
  const missing: string[] = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "your_super_secret_key") {
    missing.push("JWT_SECRET");
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === "your_refresh_secret") {
    missing.push("JWT_REFRESH_SECRET");
  }
  console.error(`[CONFIG ERROR] JWT configuration is invalid or missing in server/.env: ${missing.join(", ")}`);
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "your_super_secret_key") {
    console.error("[CONFIG ERROR] JWT_SECRET is not configured in server/.env");
    throw new Error("JWT_SECRET is not configured in server/.env");
  }
  return secret;
};

const getJwtRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret || secret === "your_refresh_secret") {
    console.error("[CONFIG ERROR] JWT_REFRESH_SECRET is not configured in server/.env");
    throw new Error("JWT_REFRESH_SECRET is not configured in server/.env");
  }
  return secret;
};

export const generateAccessToken = (userId: string, role: UserRole): string => {
  return jwt.sign({ userId, role } satisfies AccessTokenPayload, getJwtSecret(), {
    expiresIn: ACCESS_EXPIRY,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId } satisfies RefreshTokenPayload,
    getJwtRefreshSecret(),
    { expiresIn: REFRESH_EXPIRY }
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, getJwtRefreshSecret()) as RefreshTokenPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: REFRESH_COOKIE_MAX_AGE,
  path: "/api/auth",
};

export const REFRESH_COOKIE_NAME = "refreshToken";
