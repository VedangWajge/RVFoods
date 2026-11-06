import { z } from "zod";

export const productCategoryEnum = z.enum([
  "spices",
  "ghee",
  "sweets",
  "snacks",
  "combo",
]);

const productCategoriesField = z
  .array(productCategoryEnum)
  .min(1, "Select at least one category");

/**
 * Keeps the main category and the full list in step, whichever was sent.
 * Products saved before multiple categories existed have only `category`.
 */
export const withConsistentCategories = <
  T extends {
    category?: z.infer<typeof productCategoryEnum>;
    categories?: z.infer<typeof productCategoryEnum>[];
  },
>(
  data: T
): T => {
  if (data.categories) {
    const categories = [...new Set(data.categories)];
    const category =
      data.category && categories.includes(data.category) ? data.category : categories[0];
    return { ...data, category, categories };
  }
  return data.category ? { ...data, categories: [data.category] } : data;
};

const productVariantSchema = z
  .object({
    weight: z.string().trim().min(1, "Enter a size").max(30),
    price: z.number().positive("Price must be positive"),
    discountPrice: z.number().positive("Discount price must be positive").nullable().optional(),
    stock: z.number().int().nonnegative("Stock cannot be negative").default(0),
  })
  .refine((v) => v.discountPrice == null || v.discountPrice < v.price, {
    message: "Discount price must be less than the price",
  });

const productVariantsField = z
  .array(productVariantSchema)
  .max(12, "A product can have at most 12 sizes")
  .refine(
    (variants) =>
      new Set(variants.map((v) => v.weight.toLowerCase())).size === variants.length,
    { message: "Each size can only be listed once" }
  );

type VariantInput = {
  weight: string;
  price: number;
  discountPrice?: number | null;
  stock?: number;
};

/**
 * Fills in the product's own price, discount, stock and weight from its sizes, so
 * sorting, price filters and stock alerts work the same for every product.
 */
export const withVariantSummary = <
  T extends {
    variants?: VariantInput[];
    price?: number;
    discountPrice?: number | null;
    stock?: number;
    weight?: string;
  },
>(
  data: T
): T => {
  if (!data.variants?.length) return data;

  const variants = data.variants.map(({ discountPrice, ...variant }) =>
    discountPrice == null ? variant : { ...variant, discountPrice }
  ) as VariantInput[];
  const sellingPrice = (v: VariantInput) => v.discountPrice ?? v.price;
  const cheapest = variants.reduce((a, b) => (sellingPrice(b) < sellingPrice(a) ? b : a));

  return {
    ...data,
    variants,
    price: cheapest.price,
    discountPrice: cheapest.discountPrice ?? null,
    stock: variants.reduce((total, v) => total + (v.stock ?? 0), 0),
    weight: cheapest.weight,
  };
};

const createProductFields = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(100),
  category: productCategoryEnum,
  categories: productCategoriesField.optional(),
  description: z.string().optional(),
  shortDescription: z
    .string()
    .max(200, "Short description cannot exceed 200 characters")
    .optional(),
  price: z.number().positive("Price must be positive").optional(),
  discountPrice: z
    .number()
    .positive("Discount price must be positive")
    .nullable()
    .optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative").default(0),
  variants: productVariantsField.optional(),
  ingredients: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  weight: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const createProductSchema = createProductFields.refine(
  (data) => data.price !== undefined || Boolean(data.variants?.length),
  { message: "Enter a price" }
);

export const updateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  category: productCategoryEnum.optional(),
  categories: productCategoriesField.optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(200).optional(),
  price: z.number().positive().optional(),
  // null removes an existing discount
  discountPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
  // An empty list turns the product back into a single-size product
  variants: productVariantsField.optional(),
  ingredients: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  weight: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const getProductQuerySchema = z.object({
  category: productCategoryEnum.optional(),
  search: z.string().optional(),
  sort: z.enum(["price-asc", "price-desc", "rating-desc", "newest"]).optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minRating: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  featured: z.string().optional(),
  includeHidden: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductQuery = z.infer<typeof getProductQuerySchema>;
