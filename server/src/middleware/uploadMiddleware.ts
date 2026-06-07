import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Max 5 files at once
  },
});

export const handleUploadError = (
  error: Error,
  _req: Request,
  res: any,
  next: any
): void => {
  console.error(`[API ERROR] Multer/Upload error: ${error.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(error.stack);
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 5MB limit",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 files allowed at once",
      });
    }
  }

  if (error.message === "Invalid file type. Only JPEG, PNG, and WebP are allowed.") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};
