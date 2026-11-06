import { FREE_DELIVERY_THRESHOLD } from "./constants";
import type { CartLineItem, ProductVariant } from "@/types/product.types";

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  /** Before delivery, which the server quotes once there's an address */
  total: number;
  qualifiesForFreeDelivery: boolean;
  amountUntilFreeDelivery: number;
}

export function calculateCartSummary(
  items: CartLineItem[],
  discount = 0
): CartSummary {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const safeDiscount = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal - safeDiscount);
  const qualifiesForFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const amountUntilFreeDelivery = qualifiesForFreeDelivery
    ? 0
    : Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return {
    itemCount,
    subtotal,
    discount: safeDiscount,
    total,
    qualifiesForFreeDelivery,
    amountUntilFreeDelivery,
  };
}

/** Two sizes of one product are separate cart lines. */
export function getCartLineId(item: { productId: string; weight?: string }): string {
  return `${item.productId}|${item.weight ?? ""}`;
}

/** The name to show and send on WhatsApp, including the size when one was chosen. */
export function getCartItemLabel(item: { name: string; weight?: string }): string {
  return item.weight ? `${item.name} (${item.weight})` : item.name;
}

export function productToCartItem(
  product: {
    _id: string;
    slug: string;
    name: string;
    images: { url: string }[];
    price: number;
    discountPrice?: number;
    stock: number;
    variants?: ProductVariant[];
  },
  quantity = 1,
  weight?: string
): CartLineItem {
  const variant = product.variants?.length
    ? product.variants.find((v) => v.weight === weight) ?? product.variants[0]
    : undefined;
  const priced = variant ?? product;

  return {
    productId: product._id,
    slug: product.slug,
    name: product.name,
    image: product.images[0]?.url ?? "",
    price: priced.discountPrice ?? priced.price,
    quantity,
    stock: priced.stock,
    weight: variant?.weight,
  };
}
