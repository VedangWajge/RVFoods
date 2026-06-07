import { useMemo } from "react";
import {
  useCartStore,
  selectCartItems,
  selectCartItemCount,
  selectPromoDiscount,
} from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { calculateCartSummary } from "@/utils/cartHelpers";
import type { Product } from "@/types/product.types";

export function useCart() {
  const items = useCartStore(selectCartItems);
  const itemCount = useCartStore(selectCartItemCount);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore(selectPromoDiscount);
  const showToast = useUIStore((s) => s.showToast);

  const summary = useMemo(
    () => calculateCartSummary(items, promoDiscount),
    [items, promoDiscount]
  );

  const addFromProduct = useCartStore((s) => s.addFromProduct);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const applyPromoCode = useCartStore((s) => s.applyPromoCode);
  const clearPromoCode = useCartStore((s) => s.clearPromoCode);
  const clearCart = useCartStore((s) => s.clearCart);
  const getItem = useCartStore((s) => s.getItem);
  const isInCart = useCartStore((s) => s.isInCart);

  const isEmpty = items.length === 0;

  const addProduct = (product: Product, quantity = 1) => {
    addFromProduct(product, quantity);
    showToast(`Added ${product.name} to cart!`, "success");
  };

  const getProductQuantity = (productId: string): number =>
    getItem(productId)?.quantity ?? 0;

  return {
    items,
    itemCount,
    summary,
    promoCode,
    promoDiscount,
    isEmpty,
    addProduct,
    addItem,
    removeItem,
    updateQuantity,
    incrementItem,
    decrementItem,
    applyPromoCode,
    clearPromoCode,
    clearCart,
    getItem,
    isInCart,
    getProductQuantity,
  };
}
