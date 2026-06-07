import mongoose, { Schema, type Document, type Model } from "mongoose";

export type ProductCategory =
  | "spices"
  | "ghee"
  | "sweets"
  | "snacks"
  | "combo";

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProductRatings {
  average: number;
  count: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: IProductImage[];
  ingredients: string[];
  benefits: string[];
  weight: string;
  isFeatured: boolean;
  isActive: boolean;
  ratings: IProductRatings;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const ratingsSchema = new Schema<IProductRatings>(
  {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["spices", "ghee", "sweets", "snacks", "combo"],
    },
    description: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (this: any, value: number | undefined) {
          if (value === undefined || value === null) return true;

          // Check if running in a Mongoose query context (update operation)
          if (this && typeof this.getUpdate === "function") {
            const update = this.getUpdate();
            const set = update.$set || update;
            const price = set.price !== undefined ? set.price : undefined;
            if (price === undefined) return true; // Skip if price is not being updated
            return value < price;
          }

          // Document context (creation operation)
          return value < this.price;
        },
        message: "Discount price must be less than regular price",
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    weight: {
      type: String,
      default: "",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: ratingsSchema,
      default: () => ({ average: 0, count: 0 }),
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: "text", description: "text" });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

productSchema.pre("validate", async function (next) {
  if (this.slug) return next();

  let baseSlug = slugify(this.name);
  if (!baseSlug) baseSlug = `product-${Date.now()}`;

  let slug = baseSlug;
  let counter = 1;

  const ProductModel = this.constructor as Model<IProduct>;

  while (await ProductModel.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  this.slug = slug;
  next();
});

export const Product: Model<IProduct> =
  mongoose.models.Product ??
  mongoose.model<IProduct>("Product", productSchema);
