import type { Response } from "express";
import crypto from "crypto";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { razorpay, isConfigured as isRazorpayConfigured } from "../config/razorpay.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import {
  createOrderSchema,
  verifyPaymentSchema,
  updateOrderStatusSchema,
} from "../validators/orderSchemas.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

const DELIVERY_FEE = 50;
const FREE_DELIVERY_THRESHOLD = 500;

// @desc    Create new order & initialize payment
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData = createOrderSchema.parse(req.body);
    const { products, shippingAddress, paymentMethod, promoCode } = validatedData;

    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    let subtotal = 0;
    const orderItems = [];

    // 1. Validate stock and calculate prices
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product not found with ID ${item.productId}`, 404);
      }
      if (!product.isActive) {
        throw new AppError(`Product "${product.name}" is no longer active`, 400);
      }
      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
          400
        );
      }

      const itemPrice = product.discountPrice ?? product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url ?? "",
        price: itemPrice,
        quantity: item.quantity,
      });
    }

    // 2. Calculate discounts and shipping fees
    let discount = 0;
    if (promoCode && promoCode.trim().toUpperCase() === "RVFOODS10") {
      discount = Math.round(subtotal * 0.1);
    }

    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
    const finalAmount = Math.max(0, subtotal - discount + deliveryFee);

    // 3. Create the order document
    const order = new Order({
      userId: req.user._id,
      products: orderItems,
      totalAmount: subtotal,
      discount,
      finalAmount,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "placed",
      shippingAddress,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    });

    // 4. Handle COD vs Razorpay flow
    if (paymentMethod === "cod") {
      // For COD, deduct stock immediately
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
      await order.save();

      sendSuccess(res, "Order placed successfully (Cash on Delivery)", { order }, 201);
    } else {
      // Razorpay payment flow
      if (!isRazorpayConfigured) {
        const missing: string[] = [];
        if (!process.env.RAZORPAY_KEY_ID) missing.push("RAZORPAY_KEY_ID");
        if (!process.env.RAZORPAY_KEY_SECRET) missing.push("RAZORPAY_KEY_SECRET");
        console.error(`[CONFIG ERROR] Razorpay order creation requested, but credentials are missing. Missing: ${missing.join(", ")}`);

        if (process.env.NODE_ENV === "production") {
          throw new AppError("Razorpay credentials are not configured on the server", 500);
        }
      }

      try {
        let razorpayOrder;
        if (!isRazorpayConfigured) {
          console.log("Razorpay is running in mock mode. Returning mock order details...");
          razorpayOrder = {
            id: `mock_order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            amount: Math.round(finalAmount * 100), // in paisa
            currency: "INR",
          };
        } else {
          const razorpayOptions = {
            amount: Math.round(finalAmount * 100), // in paisa
            currency: "INR",
            receipt: order.orderId,
          };
          razorpayOrder = await razorpay.orders.create(razorpayOptions);
        }
        
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        sendSuccess(
          res,
          "Order initiated. Pay using Razorpay.",
          {
            order,
            razorpayOrder: {
              id: razorpayOrder.id,
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency,
              key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
            },
          },
          201
        );
      } catch (err: any) {
        console.error(`[RAZORPAY ERROR] Razorpay checkout initialization failed: ${err.message}`);
        if (process.env.NODE_ENV !== "production") {
          console.error(err.stack);
        }
        throw new AppError(`Razorpay checkout initialization failed: ${err.message}`, 500);
      }
    }
  }
);

// @desc    Verify Razorpay payment signature
// @route   POST /api/orders/verify-payment
// @access  Private
export const verifyPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData = verifyPaymentSchema.parse(req.body);
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = validatedData;

    if (!isRazorpayConfigured) {
      const missing: string[] = [];
      if (!process.env.RAZORPAY_KEY_ID) missing.push("RAZORPAY_KEY_ID");
      if (!process.env.RAZORPAY_KEY_SECRET) missing.push("RAZORPAY_KEY_SECRET");
      console.error(`[CONFIG ERROR] Razorpay signature verification requested, but credentials are missing. Missing: ${missing.join(", ")}`);

      if (process.env.NODE_ENV !== "production") {
        console.log("Razorpay is running in mock mode. Automatically verifying mock signature...");
        // Successful mock payment verification
        const order = await Order.findOne({ razorpayOrderId });
        if (!order) {
          throw new AppError("Order not found with this Razorpay order ID", 404);
        }

        if (order.paymentStatus === "paid") {
          sendSuccess(res, "Payment already verified", order);
          return;
        }

        order.paymentStatus = "paid";
        order.razorpayPaymentId = razorpayPaymentId || `mock_payment_${Date.now()}`;
        order.orderStatus = "confirmed";

        for (const item of order.products) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock = Math.max(0, product.stock - item.quantity);
            await product.save();
          }
        }

        await order.save();
        sendSuccess(res, "Payment verified and order placed successfully (mock)", order);
        return;
      } else {
        throw new AppError("Razorpay credentials are not configured on the server", 500);
      }
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new AppError("Razorpay credentials are not configured on the server", 500);
    }

    try {
      // Generate signature to verify
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        // Mark order as failed in background
        await Order.findOneAndUpdate(
          { razorpayOrderId },
          { paymentStatus: "failed" }
        );
        throw new AppError("Payment signature verification failed", 400);
      }

      // Successful payment
      const order = await Order.findOne({ razorpayOrderId });
      if (!order) {
        throw new AppError("Order not found with this Razorpay order ID", 404);
      }

      if (order.paymentStatus === "paid") {
        sendSuccess(res, "Payment already verified", order);
        return;
      }

      // Update status and deduct product stock
      order.paymentStatus = "paid";
      order.razorpayPaymentId = razorpayPaymentId;
      order.orderStatus = "confirmed";

      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }

      await order.save();

      sendSuccess(res, "Payment verified and order placed successfully", order);
    } catch (err: any) {
      console.error(`[RAZORPAY ERROR] Razorpay payment verification failed: ${err.message}`);
      if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
      }
      throw err instanceof AppError ? err : new AppError(`Razorpay payment verification failed: ${err.message}`, 500);
    }
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
