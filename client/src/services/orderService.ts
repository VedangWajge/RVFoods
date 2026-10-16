import { api } from "./api";
import type { ApiResponse } from "@/types/api.types";
import type {
  Order,
  LogWhatsAppOrderPayload,
  LogWhatsAppOrderResponse,
} from "@/types/order.types";

export const orderService = {
  /**
   * Record WhatsApp order attempt
   */
  async logWhatsAppOrder(
    payload: LogWhatsAppOrderPayload
  ): Promise<ApiResponse<LogWhatsAppOrderResponse>> {
    const { data } = await api.post<ApiResponse<LogWhatsAppOrderResponse>>(
      "/orders/whatsapp-attempt",
      payload
    );
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
