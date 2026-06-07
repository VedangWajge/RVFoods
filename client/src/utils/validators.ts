import { z } from "zod";
import type { ProductCategory } from "@/types/product.types";

const productCategories = [
  "spices",
  "ghee",
  "sweets",
  "snacks",
  "combo",
] as const satisfies readonly ProductCategory[];

export const addressSchema = z.object({
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().min(2, "Country is required").default("India"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must include uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyOtpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const shippingSchema = addressSchema;

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["razorpay", "cod"]),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(500, "Review must be under 500 characters"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const productFilterSchema = z.object({
  category: z.enum(productCategories).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  search: z.string().optional(),
  sort: z
    .enum(["price-asc", "price-desc", "rating-desc", "newest", "name-asc"])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  category: z.enum(productCategories),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().max(120, "Short description too long"),
  price: z.coerce.number().positive("Price must be positive"),
  discountPrice: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0),
  weight: z.string().min(1, "Weight is required"),
  ingredients: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ShippingFormValues = z.infer<typeof shippingSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
export type ProductFilterFormValues = z.infer<typeof productFilterSchema>;
export type CreateProductFormValues = z.infer<typeof createProductSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
