import mongoose, { Schema, type Document, type Model } from "mongoose";

/** A limited-time offer, such as 50% off the first 10 orders for Diwali. */
export interface IFestiveOffer {
  /** Shows the offer banner on the home page */
  bannerEnabled: boolean;
  /** Takes the discount off eligible orders */
  discountEnabled: boolean;
  title: string;
  discountPercent: number;
  /** How many orders get the discount, across all customers */
  maxOrders: number;
  /** Only orders placed after this count towards maxOrders */
  countFrom: Date;
}

export interface IStoreSettings extends Document {
  key: string;
  festiveOffer: IFestiveOffer;
  createdAt: Date;
  updatedAt: Date;
}

const festiveOfferSchema = new Schema<IFestiveOffer>(
  {
    bannerEnabled: { type: Boolean, default: false },
    discountEnabled: { type: Boolean, default: false },
    title: { type: String, trim: true, maxlength: 60, default: "Diwali Offer" },
    discountPercent: { type: Number, min: 1, max: 90, default: 50 },
    maxOrders: { type: Number, min: 1, max: 1000, default: 10 },
    countFrom: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    // There is one settings document, found by this key.
    key: { type: String, required: true, unique: true, default: "store" },
    festiveOffer: { type: festiveOfferSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ??
  mongoose.model<IStoreSettings>("StoreSettings", storeSettingsSchema);
