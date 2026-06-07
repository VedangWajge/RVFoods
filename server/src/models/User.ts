import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export type UserRole = "user" | "admin";

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: IAddress;
  role: UserRole;
  isVerified: boolean;
  googleId?: string;
  refreshToken?: string;
  emailOtpHash?: string;
  emailOtpExpires?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, trim: true, default: "India" },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit phone number"],
    },
    address: addressSchema,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    emailOtpHash: { type: String, select: false },
    emailOtpExpires: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.pre("validate", function (next) {
  if (this.isNew && !this.password && !this.googleId) {
    this.invalidate("password", "Password is required for email registration");
  }
  next();
});

// Prevent stale schema when using tsx watch during development
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
