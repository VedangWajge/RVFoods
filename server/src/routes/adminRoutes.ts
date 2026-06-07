import { Router } from "express";
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUser,
  getAdminOrders,
  getAdminProducts,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

// Apply auth protection + admin-only check to all admin routes
router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.put("/users/:id", updateAdminUser);
router.get("/orders", getAdminOrders);
router.get("/products", getAdminProducts);

export default router;
