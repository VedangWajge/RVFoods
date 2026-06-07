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
      console.error("[AUTH ERROR] Missing or invalid Authorization header format.");
      sendError(res, "Not authorized. No token provided.", 401);
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (!user) {
        console.error(`[AUTH ERROR] User not found during token authorization. UserId: ${decoded.userId}`);
        sendError(res, "User not found", 401);
        return;
      }

      req.user = user;
      next();
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        console.warn(`[AUTH] Access token expired: ${err.message}`);
      } else {
        console.error(`[AUTH ERROR] Token verification failed: ${err.message}`);
        if (process.env.NODE_ENV !== "production") {
          console.error(err.stack);
        }
      }
      sendError(res, "Not authorized. Invalid or expired token.", 401);
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
