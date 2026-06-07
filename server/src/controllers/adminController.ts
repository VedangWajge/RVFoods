import type { Response } from "express";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// @desc    Get dashboard analytics (Admin only)
// @route   GET /api/admin/stats
// @access  Admin
export const getAdminStats = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    // 1. Total counts
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await User.countDocuments({});
    const totalOrders = await Order.countDocuments({});

    // 2. Revenue (Sum finalAmount of paid orders or completed COD orders)
    const paidOrders = await Order.find({
      $or: [
        { paymentStatus: "paid" },
        { paymentMethod: "cod", orderStatus: "delivered" },
      ],
    }).lean();

    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.finalAmount, 0);

    // 3. Low stock alerts (stock <= 5)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select("name price stock slug category")
      .lean();

    // 4. Recent orders (latest 5 orders)
    const recentOrders = await Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 5. Revenue Chart Data (Last 7 days daily revenue, using robust in-memory grouping)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7DaysOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo },
      $or: [
        { paymentStatus: "paid" },
        { paymentMethod: "cod", orderStatus: "delivered" },
      ],
    }).lean();

    const dailyRevenueMap: Record<string, { date: string; revenue: number; count: number }> = {};
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      dailyRevenueMap[dateStr] = { date: dateStr, revenue: 0, count: 0 };
    }

    for (const order of last7DaysOrders) {
      const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      if (dailyRevenueMap[dateStr]) {
        dailyRevenueMap[dateStr].revenue += order.finalAmount;
        dailyRevenueMap[dateStr].count += 1;
      }
    }

    const revenueChartData = Object.values(dailyRevenueMap);

    sendSuccess(res, "Admin statistics retrieved successfully", {
      counts: {
        products: totalProducts,
        users: totalUsers,
        orders: totalOrders,
        revenue: totalRevenue,
      },
      lowStock: lowStockProducts,
      recentOrders,
      revenueChart: revenueChartData,
    });
  }
);

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Admin
export const getAdminUsers = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    sendSuccess(res, "Users retrieved successfully", users);
  }
);

// @desc    Update a user profile / role (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Admin
export const updateAdminUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role, isVerified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (role !== undefined) {
      if (role !== "user" && role !== "admin") {
        throw new AppError("Invalid user role", 400);
      }
      user.role = role;
    }

    if (isVerified !== undefined) {
      user.isVerified = !!isVerified;
    }

    await user.save();

    sendSuccess(res, "User updated successfully", user);
  }
);

// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
// @access  Admin
export const getAdminOrders = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, "Orders retrieved successfully", orders);
  }
);

// @desc    Get all products (Admin only)
// @route   GET /api/admin/products
// @access  Admin
export const getAdminProducts = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    sendSuccess(res, "Products retrieved successfully", products);
  }
);
