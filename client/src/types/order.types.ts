/** Order & checkout types — mirrors server Order model */

import type { Address } from "./user.types";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "razorpay" | "cod" | "whatsapp" | "upi";

export type OrderStatus =
  | "whatsapp_pending"
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
  userId?: string | { _id: string; name?: string; email?: string } | null;
  customerName?: string;
  products: OrderProductItem[];
  totalAmount: number;
  discount: number;
  /** The part of discount that came from the festive offer */
  offerDiscount?: number;
  deliveryCharge?: number;
  deliveryChargeSource?: "calculated" | "free" | "fallback";
  deliveryDistanceKm?: number;
  deliveryLocation?: DeliveryLocation;
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

export interface UpdateOrderPaymentStatusPayload {
  paymentStatus: PaymentStatus;
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

export interface LogWhatsAppOrderItem {
  productId: string;
  quantity: number;
  weight?: string;
}

export interface LogWhatsAppOrderPayload {
  items: LogWhatsAppOrderItem[];
  promoCode?: string;
  attemptId?: string;
  customerName?: string;
  addressLine?: string;
  formattedAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
  location: DeliveryLocation;
  expectedDeliveryCharge: number;
}

export interface LogWhatsAppOrderResponse {
  orderId: string;
  deliveryCharge: number;
  discount: number;
  offerDiscount: number;
  offerTitle?: string;
  finalAmount: number;
  orderStatus: OrderStatus;
}

export interface ConfirmWhatsAppOrderResponse {
  orderId: string;
  finalAmount: number;
  orderStatus: OrderStatus;
  /** The offer ran out before this order was confirmed */
  offerEnded?: boolean;
}

export interface DeliveryLocation {
  lat: number;
  lng: number;
}

export interface SelectedDeliveryPlace extends DeliveryLocation {
  formatted: string;
  city?: string;
  state?: string;
  postcode?: string;
}

export interface DeliveryQuotePayload {
  location: DeliveryLocation;
  items: LogWhatsAppOrderItem[];
  promoCode?: string;
}

export interface DeliveryQuote {
  status: "calculated" | "free" | "fallback" | "out_of_range";
  deliveryCharge: number | null;
  distanceKm: number | null;
  subtotal: number;
  discount: number;
  offerDiscount: number;
  offerTitle?: string;
  offerPercent?: number;
  finalAmount: number | null;
}
