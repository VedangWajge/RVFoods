import { Router } from "express";
import {
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  createWhatsAppOrderAttempt,
  confirmWhatsAppOrder,
} from "../controllers/orderController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

// Log WhatsApp order attempt (accessible by both guests and authenticated customers)
router.post("/whatsapp-attempt", optionalAuth, createWhatsAppOrderAttempt);

// Confirm WhatsApp order placement (accessible by both guests and authenticated customers)
router.post("/confirm-whatsapp", optionalAuth, confirmWhatsAppOrder);

// All subsequent order routes are protected/private
router.use(protect);

router.get("/my-orders", getMyOrders);
router.get("/:orderId", getOrderById);

// Admin-only order status update
router.put("/:id/status", adminOnly, updateOrderStatus);

// Admin-only order payment status update
router.put("/:id/payment-status", adminOnly, updateOrderPaymentStatus);

export default router;
