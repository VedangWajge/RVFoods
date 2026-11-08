import type { Request, Response } from "express";
import { StoreSettings } from "../models/StoreSettings.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getFestiveOfferStatus } from "../utils/festiveOffer.js";
import { updateFestiveOfferSchema } from "../validators/offerSchemas.js";

// @desc    The offer as customers see it (banner and places left)
// @route   GET /api/offer
// @access  Public
export const getPublicOffer = asyncHandler(async (_req: Request, res: Response) => {
  const { bannerEnabled, title, discountPercent, maxOrders, remaining, active } =
    await getFestiveOfferStatus();

  sendSuccess(res, "Offer retrieved", {
    bannerEnabled,
    title,
    discountPercent,
    maxOrders,
    remaining,
    active,
  });
});

// @desc    The offer settings and how many places have been used
// @route   GET /api/admin/offer
// @access  Admin
export const getAdminOffer = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, "Offer retrieved", await getFestiveOfferStatus());
});

// @desc    Turn the banner or discount on and off, or change the offer
// @route   PUT /api/admin/offer
// @access  Admin
export const updateAdminOffer = asyncHandler(async (req: Request, res: Response) => {
  const { resetCount, ...changes } = updateFestiveOfferSchema.parse(req.body);

  const update: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(changes)) {
    if (value !== undefined) update[`festiveOffer.${field}`] = value;
  }
  if (resetCount) update["festiveOffer.countFrom"] = new Date();

  await StoreSettings.findOneAndUpdate(
    { key: "store" },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  sendSuccess(res, "Offer updated", await getFestiveOfferStatus());
});
