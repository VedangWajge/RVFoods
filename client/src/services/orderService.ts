import { api } from "./api";
import type { ApiResponse } from "@/types/api.types";
import type {
  Order,
  CreateOrderPayload,
  CreateOrderResponse,
  VerifyPaymentPayload,
} from "@/types/order.types";

interface BackendRazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  key: string;
}

interface BackendCreateOrderData {
  order: Order;
  razorpayOrder?: BackendRazorpayOrder;
}

export const orderService = {
  /**
   * Create a new order (COD or Razorpay)
   */
  async createOrder(payload: CreateOrderPayload): Promise<ApiResponse<CreateOrderResponse>> {
    const { data } = await api.post<ApiResponse<BackendCreateOrderData>>("/orders", payload);
    
    // Map backend response format to frontend CreateOrderResponse
    let mappedData: CreateOrderResponse | undefined;
    if (data.success && data.data) {
      const orderObj = data.data.order || (data.data as unknown as Order);
      mappedData = {
        order: orderObj,
        razorpay: data.data.razorpayOrder
          ? {
              razorpayOrderId: data.data.razorpayOrder.id,
              amount: data.data.razorpayOrder.amount,
              currency: data.data.razorpayOrder.currency,
              keyId: data.data.razorpayOrder.key,
            }
          : undefined,
      };
    }

    return {
      success: data.success,
      message: data.message,
      data: mappedData,
      error: data.error,
    };
  },

  /**
   * Verify Razorpay payment signature
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<ApiResponse<Order>> {
    const { data } = await api.post<ApiResponse<Order>>("/orders/verify-payment", payload);
    return data;
  },

  /**
   * Get all orders of the logged-in user
   */
  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    const { data } = await api.get<ApiResponse<Order[]>>("/orders/my-orders");
    return data;
  },

  /**
   * Get single order details by orderId (custom RVF-XXXXXX or mongo ID)
   */
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return data;
  },
};
