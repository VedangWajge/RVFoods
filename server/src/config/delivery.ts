/**
 * Delivery charge settings. Edit the values here; no logic needs to change.
 *
 * charge = max(MIN_CHARGE, BASE_FARE + max(0, km - BASE_KM) * PER_KM_RATE)
 *          * (1 + BUFFER_PERCENT / 100), rounded up to ROUND_TO
 *
 * Get BASE_FARE and PER_KM_RATE from your Porter quotes with:
 *   npm run fit-rates -- 2:60 5:95 10:150
 */
export interface DeliveryRates {
  BASE_FARE: number;
  BASE_KM: number;
  PER_KM_RATE: number;
  MIN_CHARGE: number;
  BUFFER_PERCENT: number;
  ROUND_TO: number;
  MAX_DISTANCE_KM: number;
  /** Orders with a subtotal at or above this ship free. null turns this off. */
  FREE_DELIVERY_ABOVE: number | null;
  /** Charged when the distance can't be looked up because the maps API is down. */
  FALLBACK_FLAT_CHARGE: number;
}

export const DELIVERY_CONFIG: DeliveryRates & {
  SHOP_ADDRESS: string;
  SHOP_LAT_LNG: { lat: number; lng: number };
  TRAVEL_MODE: string;
} = {
  SHOP_ADDRESS: "A & O Excellente, Mulund West, Mumbai, Maharashtra 400080",
  // Every distance is measured from here: https://maps.app.goo.gl/wVgnDaQe6c1Q8Wsk8
  SHOP_LAT_LNG: { lat: 19.1767738, lng: 72.9542814 },


  // TODO: PLACEHOLDER rates - replace these with your Porter quotes.
  BASE_FARE: 60,
  BASE_KM: 2,
  PER_KM_RATE: 12,
  MIN_CHARGE: 60,
  BUFFER_PERCENT: 10,
  ROUND_TO: 10,
  // Road km from the shop: covers Mumbai, Navi Mumbai, Thane and out to Virar (55 km).
  MAX_DISTANCE_KM: 60,
  FALLBACK_FLAT_CHARGE: 150,

  // Also shown to customers: keep FREE_DELIVERY_THRESHOLD in
  // client/src/utils/constants.ts and the banner in client/src/pages/Home.tsx in step.
  FREE_DELIVERY_ABOVE: 1999,

  // Closest to a Porter 2-wheeler. "DRIVE" has a higher free limit if you ever need it.
  TRAVEL_MODE: "TWO_WHEELER",
};
