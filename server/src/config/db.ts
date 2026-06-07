import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === "your_mongodb_uri" || uri.trim() === "") {
    console.error("[CONFIG ERROR] MONGODB_URI is not set. Add your MongoDB Atlas connection string to server/.env");
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[DATABASE ERROR] Failed to connect to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV !== "production") {
      console.error(error.stack);
    }
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error: any) {
    console.error(`[DATABASE ERROR] Error during MongoDB disconnect: ${error.message}`);
    if (process.env.NODE_ENV !== "production") {
      console.error(error.stack);
    }
  }
};
