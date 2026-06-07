import type { Response } from "express";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { createReviewSchema } from "../validators/reviewSchemas.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// Helper to update product average rating and count
const updateProductRating = async (productId: string): Promise<void> => {
  const reviews = await Review.find({ productId });
  const count = reviews.length;
  const average =
    count > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 0;

  await Product.findByIdAndUpdate(productId, {
    "ratings.average": average,
    "ratings.count": count,
  });
};

// @desc    Create a new product review
// @route   POST /api/reviews/:productId
// @access  Private
export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const productId = req.params.productId as string;
    const validatedData = createReviewSchema.parse(req.body);
    const { rating, comment, image } = validatedData;

    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    // 1. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // 2. Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId: req.user._id });
    if (existingReview) {
      throw new AppError("You have already reviewed this product", 400);
    }

    // 3. Check if user has purchased this product (to mark as verified buyer)
    const hasPurchased = await Order.exists({
      userId: req.user._id,
      orderStatus: "delivered",
      "products.productId": productId,
    });

    // 4. Create review
    const review = new Review({
      productId,
      userId: req.user._id,
      rating,
      comment,
      image,
      isVerified: !!hasPurchased,
    });

    await review.save();
    await review.populate("userId", "name");

    // 5. Recalculate product rating stats
    await updateProductRating(productId);

    sendSuccess(res, "Review added successfully", review, 201);
  }
);

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const productId = req.params.productId as string;

    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, "Reviews retrieved successfully", reviews);
  }
);

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin only)
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const review = await Review.findById(id);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Check authorization: must be review author OR admin
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new AppError("Not authorized to delete this review", 403);
    }

    await review.deleteOne();

    // Recalculate product rating stats
    await updateProductRating(review.productId.toString());

    sendSuccess(res, "Review deleted successfully", null);
  }
);
