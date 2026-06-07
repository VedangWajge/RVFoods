import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLineItem, Product } from "@/types/product.types";
import {
  calculateCartSummary,
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
  getItem: (productId: string) => CartLineItem | undefined;
  isInCart: (productId: string) => boolean;

  addItem: (item: CartLineItem) => void;
  addFromProduct: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
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

      getItem: (productId) =>
        get().items.find((i) => i.productId === productId),

      isInCart: (productId) =>
        get().items.some((i) => i.productId === productId),

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          const newQty = clampQuantity(
            (existing?.quantity ?? 0) + item.quantity,
            item.stock
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
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

      addFromProduct: (product, quantity = 1) => {
        if (product.stock <= 0) return;

        const item = productToCartItem(
          {
            _id: product._id,
            slug: product.slug,
            name: product.name,
            images: product.images,
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
          },
          quantity
        );

        get().addItem(item);
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const target = state.items.find((i) => i.productId === productId);
          if (!target) return state;

          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: clampQuantity(quantity, i.stock) }
                : i
            ),
          };
        }),

      incrementItem: (productId) => {
        const item = get().getItem(productId);
        if (!item) return;
        get().updateQuantity(productId, item.quantity + 1);
      },

      decrementItem: (productId) => {
        const item = get().getItem(productId);
        if (!item) return;
        get().updateQuantity(productId, item.quantity - 1);
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
