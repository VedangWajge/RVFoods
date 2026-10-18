import { z } from "zod";

export const orderProductItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
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
    .array(
      z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
        quantity: z.number().int().positive("Quantity must be a positive integer"),
      })
    )
    .min(1, "Order must contain at least one product"),
  promoCode: z.string().optional(),
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

