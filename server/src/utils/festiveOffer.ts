import type { Types } from "mongoose";
import { Order } from "../models/Order.js";
import { StoreSettings, type IFestiveOffer } from "../models/StoreSettings.js";

export interface FestiveOfferStatus {
  bannerEnabled: boolean;
  discountEnabled: boolean;
  title: string;
  discountPercent: number;
  maxOrders: number;
  /** Placed orders that got the discount since the count was last reset */
  claimed: number;
  remaining: number;
  /** True while new orders still get the discount */
  active: boolean;
}

const OFFER_DEFAULTS: IFestiveOffer = {
  bannerEnabled: false,
  discountEnabled: false,
  title: "Diwali Offer",
  discountPercent: 50,
  maxOrders: 10,
  countFrom: new Date(0),
};

export const getFestiveOffer = async (): Promise<IFestiveOffer> => {
  const settings = await StoreSettings.findOne({ key: "store" });
  const saved = settings?.festiveOffer;
  if (!saved) return OFFER_DEFAULTS;

  return {
    bannerEnabled: saved.bannerEnabled ?? OFFER_DEFAULTS.bannerEnabled,
    discountEnabled: saved.discountEnabled ?? OFFER_DEFAULTS.discountEnabled,
    title: saved.title || OFFER_DEFAULTS.title,
    discountPercent: saved.discountPercent ?? OFFER_DEFAULTS.discountPercent,
    maxOrders: saved.maxOrders ?? OFFER_DEFAULTS.maxOrders,
    countFrom: saved.countFrom ?? OFFER_DEFAULTS.countFrom,
  };
};

/**
 * Drafts waiting on WhatsApp don't take a place, and cancelling an order gives
 * its place back. Only orders the customer confirmed count.
 */
export const countClaimedOfferOrders = (
  offer: IFestiveOffer,
  excludeOrderId?: Types.ObjectId
): Promise<number> =>
  Order.countDocuments({
    offerDiscount: { $gt: 0 },
    orderStatus: { $nin: ["whatsapp_pending", "cancelled"] },
    createdAt: { $gte: offer.countFrom },
    ...(excludeOrderId ? { _id: { $ne: excludeOrderId } } : {}),
  });

export const getFestiveOfferStatus = async (): Promise<FestiveOfferStatus> => {
  const offer = await getFestiveOffer();
  // Skip the count when nothing would use it
  const claimed =
    offer.discountEnabled || offer.bannerEnabled
      ? await countClaimedOfferOrders(offer)
      : 0;
  const remaining = Math.max(0, offer.maxOrders - claimed);

  return {
    bannerEnabled: offer.bannerEnabled,
    discountEnabled: offer.discountEnabled,
    title: offer.title,
    discountPercent: offer.discountPercent,
    maxOrders: offer.maxOrders,
    claimed,
    remaining,
    active: offer.discountEnabled && remaining > 0,
  };
};

export const calculateOfferDiscount = (subtotal: number, percent: number): number =>
  Math.min(subtotal, Math.round((subtotal * percent) / 100));
