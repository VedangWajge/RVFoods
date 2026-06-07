import { Router } from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public: Get reviews of a product
router.get("/:productId", getProductReviews);

// Protected: Write or delete reviews
router.post("/:productId", protect, createReview);
router.delete("/:id", protect, deleteReview);

export default router;
