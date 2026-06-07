import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
