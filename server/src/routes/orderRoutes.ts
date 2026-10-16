import { Router } from "express";
import {
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  createWhatsAppOrderAttempt,
} from "../controllers/orderController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

// Log WhatsApp order attempt (accessible by both guests and authenticated customers)
router.post("/whatsapp-attempt", optionalAuth, createWhatsAppOrderAttempt);

// All subsequent order routes are protected/private
router.use(protect);

router.get("/my-orders", getMyOrders);
router.get("/:orderId", getOrderById);

// Admin-only order status update
router.put("/:id/status", adminOnly, updateOrderStatus);

export default router;
