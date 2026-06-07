import type { Response } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { updateOrderStatusSchema } from "../validators/orderSchemas.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, "Orders retrieved successfully", orders);
  }
);

// @desc    Get order details by orderId
// @route   GET /api/orders/:orderId
// @access  Private
export const getOrderById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;

    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const orderIdStr = orderId as string;

    // Allow lookup by custom orderId string (e.g. RVF-XXXXXX) or Mongo ObjectId
    const query = orderIdStr.startsWith("RVF-")
      ? { orderId: orderIdStr }
      : { _id: orderIdStr };

    const order = await Order.findOne(query);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Authorization check: users can only view their own orders unless they are an admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new AppError("Not authorized to view this order", 403);
    }

    sendSuccess(res, "Order retrieved successfully", order);
  }
);

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const validatedData = updateOrderStatusSchema.parse(req.body);
    const { status } = validatedData;

    const order = await Order.findById(id);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    // Handle cancellation: return stock to store
    if (status === "cancelled" && previousStatus !== "cancelled") {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
      if (order.paymentStatus === "paid") {
        order.paymentStatus = "refunded"; // mark for refund tracking
      }
    }

    // Handle confirmation or shipping adjustments if needed
    await order.save();

    sendSuccess(res, `Order status updated to ${status}`, order);
  }
);
