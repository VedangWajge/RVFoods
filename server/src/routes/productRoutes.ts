import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  toggleFeatured,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { upload, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// Admin routes - protected
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.patch("/:id/featured", protect, adminOnly, toggleFeatured);

// Image upload routes
router.post(
  "/:id/images",
  protect,
  adminOnly,
  upload.array("images", 5),
  handleUploadError,
  uploadProductImages
);
router.delete("/:id/images/:imageId", protect, adminOnly, deleteProductImage);

export default router;
