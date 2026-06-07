import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  image?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    image: { type: String },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/** One review per user per product */
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>("Review", reviewSchema);
