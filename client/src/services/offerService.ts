import { api } from "./api";
import type { ApiResponse } from "@/types/api.types";
import type {
  AdminFestiveOffer,
  FestiveOffer,
  UpdateFestiveOfferPayload,
} from "@/types/offer.types";

export const offerService = {
  /** The festive offer and how many discounted orders are left */
  async getOffer(): Promise<FestiveOffer | null> {
    const { data } = await api.get<ApiResponse<FestiveOffer>>("/offer");
    return data.data ?? null;
  },

  async getAdminOffer(): Promise<AdminFestiveOffer | null> {
    const { data } = await api.get<ApiResponse<AdminFestiveOffer>>("/admin/offer");
    return data.data ?? null;
  },

  async updateAdminOffer(
    payload: UpdateFestiveOfferPayload
  ): Promise<AdminFestiveOffer | null> {
    const { data } = await api.put<ApiResponse<AdminFestiveOffer>>("/admin/offer", payload);
    return data.data ?? null;
  },
};
