import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDB, disconnectDB } from "./config/db.js";
import { sendSuccess } from "./utils/apiResponse.js";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
}

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl or postman)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^http:\/\/192\.168\.\d+\.\d+:5173$/.test(origin) ||
        /^http:\/\/10\.\d+\.\d+\.\d+:5173$/.test(origin) ||
        /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:5173$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

app.get("/api/health", (_req, res) => {
  sendSuccess(res, "RV Foods API is running", {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://192.168.1.5:${PORT}`);
      console.log(`Health check: http://192.168.1.5:${PORT}/api/health`);
      console.log(`Auth API:    http://192.168.1.5:${PORT}/api/auth`);
      console.log(`Products API: http://192.168.1.5:${PORT}/api/products`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await disconnectDB();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  console.error(`[API ERROR] Uncaught Exception: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.error(`[API ERROR] Unhandled Promise Rejection: ${message}`);
  if (reason instanceof Error && reason.stack) {
    console.error(reason.stack);
  }
});

void startServer();

export default app;
