import { DELIVERY_CONFIG, type DeliveryRates } from "../config/delivery.js";

export type DeliveryQuoteStatus =
  | "calculated"
  | "free"
  | "fallback"
  | "out_of_range";

export interface DeliveryQuote {
  status: DeliveryQuoteStatus;
  /** null when delivery isn't available to this address */
  deliveryCharge: number | null;
  /** null when the distance couldn't be looked up */
  distanceKm: number | null;
}

/** Applies the pricing formula. Distance limits are checked by buildDeliveryQuote. */
export function calculateDeliveryCharge(
  km: number,
  rates: DeliveryRates = DELIVERY_CONFIG
): number {
  if (!Number.isFinite(km) || km < 0) {
    throw new RangeError(`Invalid distance: ${km}`);
  }

  const fare =
    rates.BASE_FARE + Math.max(0, km - rates.BASE_KM) * rates.PER_KM_RATE;
  const buffered =
    Math.max(rates.MIN_CHARGE, fare) * (1 + rates.BUFFER_PERCENT / 100);

  // Trim float noise first: 100 * 1.1 is 110.00000000000001, which would
  // otherwise round up to the next step and charge an extra ROUND_TO.
  const cleaned = Number(buffered.toFixed(2));
  return Math.ceil(cleaned / rates.ROUND_TO) * rates.ROUND_TO;
}

/**
 * Decides what the customer pays for delivery.
 * @param km road distance, or null if the maps API was unavailable
 */
export function buildDeliveryQuote(
  km: number | null,
  subtotal: number,
  rates: DeliveryRates = DELIVERY_CONFIG
): DeliveryQuote {
  if (km !== null && km > rates.MAX_DISTANCE_KM) {
    return { status: "out_of_range", deliveryCharge: null, distanceKm: km };
  }

  if (rates.FREE_DELIVERY_ABOVE !== null && subtotal >= rates.FREE_DELIVERY_ABOVE) {
    return { status: "free", deliveryCharge: 0, distanceKm: km };
  }

  if (km === null) {
    return {
      status: "fallback",
      deliveryCharge: rates.FALLBACK_FLAT_CHARGE,
      distanceKm: null,
    };
  }

  return {
    status: "calculated",
    deliveryCharge: calculateDeliveryCharge(km, rates),
    distanceKm: km,
  };
}
