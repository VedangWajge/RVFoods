import { z } from "zod";

export const orderProductItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  /** The size chosen, for products sold in several sizes */
  weight: z.string().trim().max(30).optional(),
});

// The map pin. The ranges cover India, so a bad value never costs a Google lookup.
export const deliveryLocationSchema = z.object({
  lat: z.number().min(6, "Please choose a location in India").max(38, "Please choose a location in India"),
  lng: z.number().min(68, "Please choose a location in India").max(98, "Please choose a location in India"),
});

export const shippingAddressSchema = z.object({
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  country: z.string().default("India"),
});

export const createOrderSchema = z.object({
  products: z.array(orderProductItemSchema).min(1, "Order must contain at least one product"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["razorpay", "cod"]),
  promoCode: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

export const updateOrderStatusSchema = z
  .object({
    status: z
      .enum([
        "whatsapp_pending",
        "placed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .optional(),
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  })
  .refine((data) => data.status !== undefined || data.paymentStatus !== undefined, {
    message: "Either status or paymentStatus must be provided",
  });

export const updateOrderPaymentStatusSchema = z.object({
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
});

export const whatsappOrderAttemptSchema = z.object({
  attemptId: z.string().optional(),
  items: z
    .array(orderProductItemSchema)
    .min(1, "Order must contain at least one product"),
  promoCode: z.string().optional(),
  customerName: z.string().trim().max(80).optional(),
  addressLine: z.string().trim().max(200).optional(),
  formattedAddress: z.string().trim().min(3, "Please select your address").max(300),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit PIN code").optional(),
  location: deliveryLocationSchema,
  // Only compared with the server's own figure, never used as the price.
  expectedDeliveryCharge: z.number().min(0),
});

export const confirmWhatsAppOrderSchema = z.object({
  orderId: z.string().min(1, "Order reference ID is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderPaymentStatusInput = z.infer<typeof updateOrderPaymentStatusSchema>;
export type WhatsAppOrderAttemptInput = z.infer<typeof whatsappOrderAttemptSchema>;
export type ConfirmWhatsAppOrderInput = z.infer<typeof confirmWhatsAppOrderSchema>;

