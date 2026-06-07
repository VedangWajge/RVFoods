import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";
import { AppError } from "./errorHandler.js";

export const adminOnly = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    next(new AppError("Admin access required", 403));
    return;
  }
  next();
};
