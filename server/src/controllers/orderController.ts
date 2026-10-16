import type { Response } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import {
  updateOrderStatusSchema,
  whatsappOrderAttemptSchema,
} from "../validators/orderSchemas.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// @desc    Record WhatsApp order attempt
// @route   POST /api/orders/whatsapp-attempt
// @access  Public / Optional Auth
export const createWhatsAppOrderAttempt = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData = whatsappOrderAttemptSchema.parse(req.body);
    const { items, promoCode } = validatedData;

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    const productMap = new Map<string, (typeof products)[0]>();
    for (const prod of products) {
      productMap.set(prod._id.toString(), prod);
    }

    const orderProducts = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new AppError(
          `Product with ID ${item.productId} is unavailable or inactive`,
          400
        );
      }

      if (item.quantity <= 0) {
        throw new AppError(`Invalid quantity for product ${product.name}`, 400);
      }

      // Trust only the server-side price from MongoDB
      const unitPrice =
        typeof product.discountPrice === "number" && product.discountPrice > 0
          ? product.discountPrice
          : product.price;

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderProducts.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url ?? "",
        price: unitPrice,
        quantity: item.quantity,
      });
    }

    // Server-side promo calculation
    let discount = 0;
    if (promoCode) {
      const normalizedPromo = promoCode.trim().toUpperCase();
      if (normalizedPromo === "RVFOODS10") {
        discount = Math.round(subtotal * 0.1);
      }
    }

    const safeDiscount = Math.min(discount, subtotal);
    // Standard delivery fee convention: ₹49 if subtotal < ₹999, free for ₹999+
    const deliveryFee = subtotal >= 999 || subtotal === 0 ? 0 : 49;
    const finalAmount = Math.max(0, subtotal - safeDiscount + deliveryFee);

    const order = new Order({
      userId: req.user?._id || undefined,
      products: orderProducts,
      totalAmount: subtotal,
      discount: safeDiscount,
      finalAmount,
      paymentStatus: "pending",
      paymentMethod: "whatsapp",
      orderStatus: "whatsapp_pending",
      shippingAddress: {
        street: "Pending confirmation via WhatsApp",
        city: "WhatsApp Order",
        state: "Pending",
        pincode: "000000",
        country: "India",
      },
    });

    await order.save();

    sendSuccess(
      res,
      "WhatsApp order attempt recorded successfully",
      {
        orderId: order.orderId,
        finalAmount: order.finalAmount,
        orderStatus: order.orderStatus,
      },
      201
    );
  }
);

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
    const isOwner =
      order.userId && order.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
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
