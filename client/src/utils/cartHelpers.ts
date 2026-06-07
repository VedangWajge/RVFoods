import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "./constants";
import type { CartLineItem } from "@/types/product.types";

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  qualifiesForFreeDelivery: boolean;
  amountUntilFreeDelivery: number;
}

export function calculateDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
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
  const deliveryFee = calculateDeliveryFee(subtotal);
  const safeDiscount = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal - safeDiscount + deliveryFee);
  const qualifiesForFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const amountUntilFreeDelivery = qualifiesForFreeDelivery
    ? 0
    : Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return {
    itemCount,
    subtotal,
    deliveryFee,
    discount: safeDiscount,
    total,
    qualifiesForFreeDelivery,
    amountUntilFreeDelivery,
  };
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
  },
  quantity = 1
): CartLineItem {
  return {
    productId: product._id,
    slug: product.slug,
    name: product.name,
    image: product.images[0]?.url ?? "",
    price: product.discountPrice ?? product.price,
    quantity,
    stock: product.stock,
  };
}
