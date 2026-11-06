import type { Product, ProductVariant } from "@/types/product.types";

/** A product's sizes. A product without sizes counts as having just its own one. */
export const getProductSizes = (product: Product): ProductVariant[] =>
  product.variants?.length
    ? product.variants
    : [
        {
          weight: product.weight,
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock,
        },
      ];

/** The size selected to begin with: the first one that can be ordered. */
export const getDefaultSize = (sizes: ProductVariant[]): ProductVariant =>
  sizes.find((size) => size.stock > 0) ?? sizes[0];

export const findSize = (
  sizes: ProductVariant[],
  weight: string | null
): ProductVariant =>
  sizes.find((size) => size.weight === weight) ?? getDefaultSize(sizes);
