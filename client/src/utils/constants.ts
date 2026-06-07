/** RV Foods brand & app constants */

import type { ProductCategory } from "@/types/product.types";
import type { OrderStatus } from "@/types/order.types";

export const BRAND = {
  name: "RV Foods",
  tagline: "Pure. Traditional. Delivered.",
  description:
    "Premium Indian homemade food — authentic masale, pure ghee, and traditional sweets delivered to your door.",
  email: "hello@rvfoods.in",
  phone: "+91 98765 43210",
} as const;

export const COLORS = {
  primary: "#C84B31",
  primaryDark: "#A63A24",
  primaryLight: "#E8755A",
  accent: "#F5A623",
  accentLight: "#FDD284",
  background: "#FDFAF6",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textMuted: "#A3A3A3",
  border: "#E8E0D5",
  success: "#2D6A4F",
  error: "#C0392B",
  footer: "#1A1A1A",
} as const;

export const PRODUCT_CATEGORIES: ReadonlyArray<{
  id: ProductCategory;
  label: string;
  slug: ProductCategory;
}> = [
  { id: "spices", label: "Masale (Spices)", slug: "spices" },
  { id: "ghee", label: "Ghee", slug: "ghee" },
  { id: "sweets", label: "Sweets", slug: "sweets" },
  { id: "snacks", label: "Snacks", slug: "snacks" },
  { id: "combo", label: "Combos", slug: "combo" },
];

/** Order status display labels & colors for UI badges */
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: "default" | "secondary" | "success" | "error" }
> = {
  placed: { label: "Placed", color: "secondary" },
  confirmed: { label: "Confirmed", color: "default" },
  processing: { label: "Processing", color: "default" },
  shipped: { label: "Shipped", color: "default" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const TRUST_ITEMS = [
  { title: "100% Pure", description: "No artificial additives" },
  { title: "Homemade", description: "Traditional family recipes" },
  { title: "Fast Delivery", description: "Pan-India shipping" },
  { title: "COD Available", description: "Pay on delivery" },
] as const;

export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_THRESHOLD = 999;
export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";

export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 48,
} as const;

/** Dev/demo promo codes — TODO: validate via API at checkout */
export const PROMO_CODES = {
  RVFOODS10: { label: "10% off", type: "percent" as const, value: 10 },
  FREESHIP: { label: "Free delivery badge", type: "shipping" as const },
} as const;
