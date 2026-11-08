import { z } from "zod";

export const updateFestiveOfferSchema = z.object({
  bannerEnabled: z.boolean().optional(),
  discountEnabled: z.boolean().optional(),
  title: z.string().trim().min(2, "Offer name is too short").max(60).optional(),
  discountPercent: z.number().int().min(1).max(90).optional(),
  maxOrders: z.number().int().min(1).max(1000).optional(),
  /** Starts counting offer orders from zero again */
  resetCount: z.boolean().optional(),
});

export type UpdateFestiveOfferInput = z.infer<typeof updateFestiveOfferSchema>;
