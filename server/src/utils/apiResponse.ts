import type { Response } from "express";

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  const body: ApiResponseBody<T> = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  error?: string
): Response => {
  const body: ApiResponseBody = { success: false, message };
  if (error) body.error = error;
  return res.status(statusCode).json(body);
};
