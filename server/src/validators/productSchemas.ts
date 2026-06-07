import { z } from "zod";

export const productCategoryEnum = z.enum([
  "spices",
  "ghee",
  "sweets",
  "snacks",
  "combo",
]);

export const createProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(100),
  category: productCategoryEnum,
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  shortDescription: z
    .string()
    .max(200, "Short description cannot exceed 200 characters")
    .optional(),
  price: z.number().positive("Price must be positive"),
  discountPrice: z
    .number()
    .positive("Discount price must be positive")
    .optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative").default(0),
  ingredients: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  weight: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  category: productCategoryEnum.optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().max(200).optional(),
  price: z.number().positive().optional(),
  discountPrice: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
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
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductQuery = z.infer<typeof getProductQuerySchema>;
