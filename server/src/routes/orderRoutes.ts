import { Router } from "express";
import {
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

// All order routes are protected/private
router.use(protect);

router.get("/my-orders", getMyOrders);
router.get("/:orderId", getOrderById);

// Admin-only order status update
router.put("/:id/status", adminOnly, updateOrderStatus);

export default router;
