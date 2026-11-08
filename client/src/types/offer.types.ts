/** The festive offer, as customers see it — GET /api/offer */
export interface FestiveOffer {
  bannerEnabled: boolean;
  title: string;
  discountPercent: number;
  maxOrders: number;
  remaining: number;
  /** True while new orders still get the discount */
  active: boolean;
}

/** The offer as the admin sees it — GET /api/admin/offer */
export interface AdminFestiveOffer extends FestiveOffer {
  discountEnabled: boolean;
  /** Confirmed orders that got the discount since the count was reset */
  claimed: number;
}

export interface UpdateFestiveOfferPayload {
  bannerEnabled?: boolean;
  discountEnabled?: boolean;
  title?: string;
  discountPercent?: number;
  maxOrders?: number;
  resetCount?: boolean;
}
