import type { Response } from "express";
import { Types } from "mongoose";
import { Order, type DeliveryChargeSource, type IOrder } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getRoadDistanceKm } from "../utils/deliveryDistance.js";
import { buildDeliveryQuote } from "../utils/deliveryPricing.js";
import { priceOrderItems } from "../utils/orderPricing.js";
import { countClaimedOfferOrders, getFestiveOffer } from "../utils/festiveOffer.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import {
  updateOrderStatusSchema,
  updateOrderPaymentStatusSchema,
  whatsappOrderAttemptSchema,
  confirmWhatsAppOrderSchema,
} from "../validators/orderSchemas.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// The confirm route is public, so it only returns what the cart needs.
const toOrderReceipt = (order: IOrder) => ({
  orderId: order.orderId,
  finalAmount: order.finalAmount,
  orderStatus: order.orderStatus,
});

// @desc    Record or reuse WhatsApp order attempt
// @route   POST /api/orders/whatsapp-attempt
// @access  Public / Optional Auth
export const createWhatsAppOrderAttempt = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData = whatsappOrderAttemptSchema.parse(req.body);
    const {
      items,
      promoCode,
      attemptId,
      customerName,
      addressLine,
      formattedAddress,
      city,
      state,
      pincode,
      location,
      expectedDeliveryCharge,
    } = validatedData;

    const {
      orderProducts,
      subtotal,
      discount: safeDiscount,
      offerDiscount,
      offerTitle,
    } = await priceOrderItems(items, promoCode);

    // Recalculate here: the browser only ever sends what it was shown.
    const quote = buildDeliveryQuote(await getRoadDistanceKm(location), subtotal);

    if (quote.deliveryCharge === null) {
      throw new AppError(
        "Delivery is not available to this address online. Please message us on WhatsApp for a quote.",
        422
      );
    }

    if (quote.deliveryCharge !== expectedDeliveryCharge) {
      throw new AppError(
        `The approx. delivery charge is now ₹${quote.deliveryCharge}. Please review your total and try again.`,
        409
      );
    }

    const deliveryCharge = quote.deliveryCharge;
    const finalAmount = Math.max(0, subtotal - safeDiscount + deliveryCharge);
    const deliveryDetails = {
      // Only the address is required: a signed-in customer's name comes from their profile.
      customerName: customerName || req.user?.name,
      deliveryCharge,
      deliveryChargeSource: quote.status as DeliveryChargeSource,
      deliveryDistanceKm: quote.distanceKm ?? undefined,
      deliveryLocation: location,
      shippingAddress: {
        street: addressLine ? `${addressLine}, ${formattedAddress}` : formattedAddress,
        city: city || "Mumbai",
        state: state || "Maharashtra",
        pincode: pincode ?? "",
        country: "India",
      },
    };

    // Reuse existing unconfirmed attempt if customer clicks again
    if (attemptId) {
      const isObjId = Types.ObjectId.isValid(attemptId);
      const existingOrder = await Order.findOne({
        $or: [
          { orderId: attemptId },
          ...(isObjId ? [{ _id: attemptId }] : []),
        ],
      });

      if (existingOrder && existingOrder.orderStatus === "whatsapp_pending") {
        existingOrder.products = orderProducts;
        existingOrder.totalAmount = subtotal;
        existingOrder.discount = safeDiscount;
        existingOrder.offerDiscount = offerDiscount;
        existingOrder.finalAmount = finalAmount;
        existingOrder.set(deliveryDetails);
        if (!existingOrder.userId && req.user?._id) {
          existingOrder.userId = req.user._id;
        }

        await existingOrder.save();

        sendSuccess(
          res,
          "WhatsApp order attempt updated successfully",
          {
            orderId: existingOrder.orderId,
            deliveryCharge,
            discount: safeDiscount,
            offerDiscount,
            offerTitle,
            finalAmount: existingOrder.finalAmount,
            orderStatus: existingOrder.orderStatus,
          },
          200
        );
        return;
      }
    }

    const order = new Order({
      userId: req.user?._id || undefined,
      products: orderProducts,
      totalAmount: subtotal,
      discount: safeDiscount,
      offerDiscount,
      finalAmount,
      ...deliveryDetails,
      paymentStatus: "pending",
      paymentMethod: "whatsapp",
      orderStatus: "whatsapp_pending",
    });

    await order.save();

    sendSuccess(
      res,
      "WhatsApp order attempt recorded successfully",
      {
        orderId: order.orderId,
        deliveryCharge,
        discount: safeDiscount,
        offerDiscount,
        offerTitle,
        finalAmount: order.finalAmount,
        orderStatus: order.orderStatus,
      },
      201
    );
  }
);

// @desc    Confirm WhatsApp order attempt (promote to placed)
// @route   POST /api/orders/confirm-whatsapp
// @access  Public / Optional Auth
export const confirmWhatsAppOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData = confirmWhatsAppOrderSchema.parse(req.body);
    const { orderId } = validatedData;

    const isObjId = Types.ObjectId.isValid(orderId);
    const order = await Order.findOne({
      $or: [
        { orderId },
        ...(isObjId ? [{ _id: orderId }] : []),
      ],
    });

    if (!order) {
      throw new AppError("Order attempt not found", 404);
    }

    // Idempotent: If already placed, return success immediately
    if (order.orderStatus === "placed") {
      sendSuccess(res, "Order is already confirmed", toOrderReceipt(order), 200);
      return;
    }

    // If order has progressed past placed (confirmed, shipped, etc.)
    if (order.orderStatus !== "whatsapp_pending") {
      sendSuccess(res, `Order is already in ${order.orderStatus} status`, toOrderReceipt(order), 200);
      return;
    }

    // The offer may have been switched off, or used up by other customers,
    // since this draft was priced. Only confirmed orders take a place.
    let offerEnded = false;
    if (order.offerDiscount > 0) {
      const offer = await getFestiveOffer();
      const claimed = offer.discountEnabled
        ? await countClaimedOfferOrders(offer, order._id as Types.ObjectId)
        : offer.maxOrders;

      if (claimed >= offer.maxOrders) {
        offerEnded = true;
        order.discount = Math.max(0, order.discount - order.offerDiscount);
        order.offerDiscount = 0;
        order.finalAmount = Math.max(
          0,
          order.totalAmount - order.discount + order.deliveryCharge
        );
      }
    }

    // Promote draft attempt to placed order
    order.orderStatus = "placed";
    // Payment status remains pending (placed order does not mean paid)
    if (!order.userId && req.user?._id) {
      order.userId = req.user._id;
    }

    await order.save();

    sendSuccess(
      res,
      offerEnded
        ? `Order confirmed. Sorry, the offer has just ended, so your total is ₹${order.finalAmount}.`
        : "Order confirmed successfully",
      { ...toOrderReceipt(order), ...(offerEnded ? { offerEnded } : {}) },
      200
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

// @desc    Update order status and/or payment status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const idStr = typeof id === "string" ? id : String(id);
    const validatedData = updateOrderStatusSchema.parse(req.body);
    const { status, paymentStatus } = validatedData;

    const isObjId = Types.ObjectId.isValid(idStr);
    const order = await Order.findOne({
      $or: [
        { orderId: idStr },
        ...(isObjId ? [{ _id: idStr }] : []),
      ],
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (status) {
      const previousStatus = order.orderStatus;

      // Idempotent: If already placed and updating to placed, avoid re-processing
      if (status === "placed" && previousStatus === "placed") {
        if (!paymentStatus) {
          sendSuccess(res, "Order is already marked as placed", order);
          return;
        }
      } else {
        order.orderStatus = status;

        if (status === "cancelled" && previousStatus !== "cancelled") {
          // WhatsApp orders never reduce stock, so cancelling must not add any back.
          if (order.paymentMethod !== "whatsapp") {
            for (const item of order.products) {
              await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity },
              });
            }
          }
          if (order.paymentStatus === "paid") {
            order.paymentStatus = "refunded"; // mark for refund tracking
          }
        }
      }
    }

    // Handle confirmation or shipping adjustments if needed
    await order.save();

    sendSuccess(res, "Order updated successfully", order);
  }
);

// @desc    Update order payment status (Admin only)
// @route   PUT /api/orders/:id/payment-status
// @access  Admin
export const updateOrderPaymentStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const idStr = typeof id === "string" ? id : String(id);
    const validatedData = updateOrderPaymentStatusSchema.parse(req.body);
    const { paymentStatus } = validatedData;

    const isObjId = Types.ObjectId.isValid(idStr);
    const order = await Order.findOne({
      $or: [
        { orderId: idStr },
        ...(isObjId ? [{ _id: idStr }] : []),
      ],
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    sendSuccess(res, `Payment status updated to ${paymentStatus}`, order);
  }
);
