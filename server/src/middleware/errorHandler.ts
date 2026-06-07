import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/apiResponse.js";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export const asyncHandler =
  <T extends Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<void>
  ) =>
  (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Determine error category based on properties
  let category = "[API ERROR]";
  const errMessage = err.message || "";
  const errName = err.name || "";
  const statusCode = (err as any).statusCode;

  if (
    errName === "JsonWebTokenError" ||
    errName === "TokenExpiredError" ||
    statusCode === 401 ||
    statusCode === 403 ||
    errMessage.toLowerCase().includes("auth") ||
    errMessage.toLowerCase().includes("token") ||
    errMessage.toLowerCase().includes("not authorized")
  ) {
    category = "[AUTH ERROR]";
  } else if (
    errName === "ValidationError" ||
    errName === "MongoServerError" ||
    errName === "CastError" ||
    (err as any).code === 11000 ||
    errMessage.toLowerCase().includes("mongodb") ||
    errMessage.toLowerCase().includes("database") ||
    errMessage.toLowerCase().includes("mongoose")
  ) {
    category = "[DATABASE ERROR]";
  } else if (
    errMessage.toLowerCase().includes("cloudinary") ||
    errMessage.toLowerCase().includes("image upload") ||
    errMessage.toLowerCase().includes("image deletion")
  ) {
    category = "[CLOUDINARY ERROR]";
  } else if (
    errMessage.toLowerCase().includes("razorpay") ||
    errMessage.toLowerCase().includes("payment")
  ) {
    category = "[RAZORPAY ERROR]";
  } else if (
    errMessage.toLowerCase().includes("config") ||
    errMessage.toLowerCase().includes("environment") ||
    errMessage.toLowerCase().includes("missing env")
  ) {
    category = "[CONFIG ERROR]";
  }

  // Prevent silent failures: log the error details with category
  console.error(`${category} ${err.message}`);
  if (process.env.NODE_ENV !== "production" && err.stack) {
    console.error(err.stack);
  }

  if (err instanceof ZodError) {
    const message = err.errors[0]?.message ?? "Validation failed";
    sendError(res, message, 400, "VALIDATION_ERROR");
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  if (err.name === "JsonWebTokenError") {
    sendError(res, "Invalid token", 401, "INVALID_TOKEN");
    return;
  }

  if (err.name === "TokenExpiredError") {
    sendError(res, "Token expired", 401, "TOKEN_EXPIRED");
    return;
  }

  if (err.name === "ValidationError") {
    sendError(res, err.message, 400, "MONGOOSE_VALIDATION");
    return;
  }

  if ((err as { code?: number }).code === 11000) {
    sendError(res, "Duplicate field value entered", 409, "DUPLICATE_KEY");
    return;
  }

  sendError(
    res,
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
    500
  );
};
