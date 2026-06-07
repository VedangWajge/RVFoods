import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User.js";

const email = process.argv[2];

const run = async () => {
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    console.error("Error: MONGODB_URI is not defined in server/.env");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUri);
    console.log("Connected successfully.");

    if (!email) {
      console.log("\nNo email address provided. Listing all registered users:\n");
      const users = await User.find({}).select("name email role isVerified createdAt");
      if (users.length === 0) {
        console.log("No users found in the database. Please register an account on the client first.");
      } else {
        console.table(
          users.map((u) => ({
            Name: u.name,
            Email: u.email,
            Role: u.role,
            Verified: u.isVerified,
            Created: u.createdAt.toISOString(),
          }))
        );
        console.log("\nTo promote a user, run: npx tsx src/utils/makeAdmin.ts <email>");
      }
    } else {
      const targetEmail = email.toLowerCase().trim();
      console.log(`Promoting user: ${targetEmail}`);

      const user = await User.findOne({ email: targetEmail });
      if (!user) {
        console.error(`Error: User with email "${targetEmail}" not found. Make sure they have registered first.`);
      } else {
        user.role = "admin";
        user.isVerified = true;
        await user.save({ validateBeforeSave: false });
        console.log(`\nSuccess! User "${user.name}" (${targetEmail}) is now an ADMIN and has been marked as verified.`);
      }
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  }
};

void run();
