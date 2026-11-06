import { DELIVERY_CONFIG } from "../config/delivery.js";
import { AppError } from "../middleware/errorHandler.js";

const ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const REQUEST_TIMEOUT_MS = 8000;

export interface DeliveryLocation {
  lat: number;
  lng: number;
}

const toWaypoint = ({ lat, lng }: DeliveryLocation) => ({
  location: { latLng: { latitude: lat, longitude: lng } },
});

/**
 * Road distance from the shop in km, or null if Google can't be reached.
 * Not cached: Google's terms let us cache coordinates, but they don't list distance.
 */
export const getRoadDistanceKm = async (
  location: DeliveryLocation
): Promise<number | null> => {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!apiKey) {
    console.error("[DELIVERY] GOOGLE_MAPS_SERVER_KEY is not set");
    return null;
  }

  let body: { routes?: { distanceMeters?: number }[] };
  try {
    const response = await fetch(ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // Asking for only the distance keeps the request in its cheapest form.
        "X-Goog-FieldMask": "routes.distanceMeters",
      },
      body: JSON.stringify({
        origin: toWaypoint(DELIVERY_CONFIG.SHOP_LAT_LNG),
        destination: toWaypoint(location),
        travelMode: DELIVERY_CONFIG.TRAVEL_MODE,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`[DELIVERY] Route lookup failed with status ${response.status}`);
      return null;
    }
    body = (await response.json()) as { routes?: { distanceMeters?: number }[] };
  } catch (error) {
    console.error(`[DELIVERY] Route lookup failed: ${(error as Error).name}`);
    return null;
  }

  // Google answers with no routes when it can't reach the point, such as a pin in the sea.
  const route = body.routes?.[0];
  if (!route) {
    throw new AppError(
      "We couldn't find a road route to this location. Please move the pin onto a road or message us on WhatsApp.",
      422
    );
  }

  // Google leaves distanceMeters out when it is 0.
  return Math.round((route.distanceMeters ?? 0) / 10) / 100;
};
