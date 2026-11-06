import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLineItem, Product } from "@/types/product.types";
import {
  calculateCartSummary,
  getCartLineId,
  productToCartItem,
  type CartSummary,
} from "@/utils/cartHelpers";
interface CartState {
  items: CartLineItem[];
  promoCode: string | null;
  promoDiscount: number;

  getItemCount: () => number;
  getSubtotal: () => number;
  getSummary: () => CartSummary;
  getItem: (lineId: string) => CartLineItem | undefined;
  isInCart: (productId: string) => boolean;

  addItem: (item: CartLineItem) => void;
  addFromProduct: (product: Product, quantity?: number, weight?: string) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  incrementItem: (lineId: string) => void;
  decrementItem: (lineId: string) => void;
  applyPromoCode: (code: string) => boolean;
  clearPromoCode: () => void;
  clearCart: () => void;
}

const clampQuantity = (quantity: number, stock: number): number =>
  Math.max(1, Math.min(quantity, stock));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,

      getItemCount: () => get().getSummary().itemCount,

      getSubtotal: () => get().getSummary().subtotal,

      getSummary: () =>
        calculateCartSummary(get().items, get().promoDiscount),

      getItem: (lineId) =>
        get().items.find((i) => getCartLineId(i) === lineId),

      isInCart: (productId) =>
        get().items.some((i) => i.productId === productId),

      addItem: (item) => {
        set((state) => {
          const lineId = getCartLineId(item);
          const existing = state.items.find((i) => getCartLineId(i) === lineId);
          const newQty = clampQuantity(
            (existing?.quantity ?? 0) + item.quantity,
            item.stock
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                getCartLineId(i) === lineId
                  ? { ...i, quantity: newQty, price: item.price, stock: item.stock }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { ...item, quantity: clampQuantity(item.quantity, item.stock) },
            ],
          };
        });
      },

      addFromProduct: (product, quantity = 1, weight) => {
        const item = productToCartItem(product, quantity, weight);
        if (item.stock <= 0) return;

        get().addItem(item);
      },

      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((i) => getCartLineId(i) !== lineId),
        })),

      updateQuantity: (lineId, quantity) =>
        set((state) => {
          const target = state.items.find((i) => getCartLineId(i) === lineId);
          if (!target) return state;

          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => getCartLineId(i) !== lineId),
            };
          }

          return {
            items: state.items.map((i) =>
              getCartLineId(i) === lineId
                ? { ...i, quantity: clampQuantity(quantity, i.stock) }
                : i
            ),
          };
        }),

      incrementItem: (lineId) => {
        const item = get().getItem(lineId);
        if (!item) return;
        get().updateQuantity(lineId, item.quantity + 1);
      },

      decrementItem: (lineId) => {
        const item = get().getItem(lineId);
        if (!item) return;
        get().updateQuantity(lineId, item.quantity - 1);
      },

      applyPromoCode: (code) => {
        const normalized = code.trim().toUpperCase();
        const subtotal = get().getSubtotal();

        // TODO: Validate promo codes via API in checkout step
        if (normalized === "RVFOODS10" && subtotal > 0) {
          const discount = Math.round(subtotal * 0.1);
          set({ promoCode: normalized, promoDiscount: discount });
          return true;
        }

        if (normalized === "FREESHIP" && subtotal > 0) {
          set({ promoCode: normalized, promoDiscount: 0 });
          return true;
        }

        return false;
      },

      clearPromoCode: () => set({ promoCode: null, promoDiscount: 0 }),

      clearCart: () => set({ items: [], promoCode: null, promoDiscount: 0 }),
    }),
    {
      name: "rv-foods-cart",
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
      }),
    }
  )
);

export const selectCartItems = (state: CartState) => state.items;
export const selectCartItemCount = (state: CartState) => state.getItemCount();
export const selectPromoDiscount = (state: CartState) => state.promoDiscount;
