import type { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { deliveryQuoteSchema } from "../validators/deliverySchemas.js";
import { getRoadDistanceKm } from "../utils/deliveryDistance.js";
import { buildDeliveryQuote } from "../utils/deliveryPricing.js";
import { priceOrderItems } from "../utils/orderPricing.js";

// @desc    Quote the approximate delivery charge and order total
// @route   POST /api/delivery/quote
// @access  Public
export const getDeliveryQuote = asyncHandler(
  async (req: Request, res: Response) => {
    const { location, items, promoCode } = deliveryQuoteSchema.parse(req.body);

    const { subtotal, discount } = await priceOrderItems(items, promoCode);
    const quote = buildDeliveryQuote(await getRoadDistanceKm(location), subtotal);

    sendSuccess(res, "Delivery quote calculated", {
      ...quote,
      subtotal,
      discount,
      finalAmount:
        quote.deliveryCharge === null
          ? null
          : Math.max(0, subtotal - discount + quote.deliveryCharge),
    });
  }
);
