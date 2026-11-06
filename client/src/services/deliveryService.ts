import { api } from "./api";
import type { ApiResponse } from "@/types/api.types";
import type { DeliveryQuote, DeliveryQuotePayload } from "@/types/order.types";

export const deliveryService = {
  /**
   * Approximate delivery charge and order total, calculated on the server
   */
  async getQuote(
    payload: DeliveryQuotePayload,
    signal?: AbortSignal
  ): Promise<DeliveryQuote | null> {
    const { data } = await api.post<ApiResponse<DeliveryQuote>>(
      "/delivery/quote",
      payload,
      { signal }
    );
    return data.data ?? null;
  },
};
