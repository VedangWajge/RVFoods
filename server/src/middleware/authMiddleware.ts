import type { Request, Response, NextFunction } from "express";
import { User, type IUser } from "../models/User.js";
import { verifyAccessToken } from "../utils/generateToken.js";
import { sendError } from "../utils/apiResponse.js";
import { AppError, asyncHandler } from "./errorHandler.js";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      console.info("[AUTH] Unauthenticated request to protected route: missing Bearer token.");
      sendError(res, "Please log in to continue.", 401);
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (!user) {
        console.warn(`[AUTH] User not found during token authorization. UserId: ${decoded.userId}`);
        sendError(res, "Please log in to continue.", 401);
        return;
      }

      req.user = user;
      next();
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        console.warn(`[AUTH] Access token expired: ${err.message}`);
      } else {
        console.warn(`[AUTH] Token verification failed: ${err.message}`);
      }
      sendError(res, "Please log in to continue.", 401);
    }
  }
);

export const requireVerified = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isVerified) {
    next(new AppError("Please verify your email before continuing.", 403));
    return;
  }
  next();
};

export const optionalAuth = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore token verification errors for optional auth (e.g. guest order attempts)
    }
    next();
  }
);
