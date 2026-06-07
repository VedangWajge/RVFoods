/** Order & checkout types — mirrors server Order model */

import type { Address } from "./user.types";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "razorpay" | "cod";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderProductItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export type ShippingAddress = Address;

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  products: OrderProductItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  products: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  discount?: number;
  promoCode?: string;
}

export interface RazorpayOrderData {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface CreateOrderResponse {
  order: Order;
  razorpay?: RazorpayOrderData;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface UpdateOrderStatusPayload {
  orderStatus: OrderStatus;
}

/** Checkout flow — multi-step form state */
export interface CheckoutFormState {
  step: 1 | 2;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

/** Admin dashboard order stats */
export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

/** Timeline step for OrderTimeline component */
export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
}
