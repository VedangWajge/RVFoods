/** Product & review types — mirrors server Product & Review models */

import type { ListQueryParams } from "./api.types";

export type ProductCategory =
  | "spices"
  | "ghee"
  | "sweets"
  | "snacks"
  | "combo";

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ProductRatings {
  average: number;
  count: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: ProductImage[];
  ingredients: string[];
  benefits: string[];
  weight: string;
  isFeatured: boolean;
  isActive: boolean;
  ratings: ProductRatings;
  createdAt: string;
  updatedAt: string;
}

/** Effective selling price (discount if available) */
export function getEffectivePrice(product: Product): number {
  return product.discountPrice ?? product.price;
}

export function isInStock(product: Product): boolean {
  return product.stock > 0;
}

export function isOnSale(product: Product): boolean {
  return (
    product.discountPrice !== undefined &&
    product.discountPrice < product.price
  );
}

export interface ProductFilters extends ListQueryParams {
  category?: ProductCategory | ProductCategory[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isFeatured?: boolean;
  sort?: ProductSortOption;
}

export type ProductSortOption =
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "newest"
  | "name-asc";

export interface CreateProductPayload {
  name: string;
  category: ProductCategory;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  stock: number;
  ingredients?: string[];
  benefits?: string[];
  weight: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  image?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Review with populated user info for display */
export interface ReviewWithUser extends Review {
  user: {
    _id: string;
    name: string;
  };
}

export interface CreateReviewPayload {
  rating: number;
  comment: string;
  image?: string;
}

/** Client-side cart line item (before order creation) */
export interface CartLineItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}
