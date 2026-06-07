import { CURRENCY, CURRENCY_SYMBOL } from "./constants";

export function formatCurrency(
  amount: number,
  options?: { showSymbol?: boolean; locale?: string }
): string {
  const { showSymbol = true, locale = "en-IN" } = options ?? {};

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  if (!showSymbol) {
    return formatted.replace(CURRENCY_SYMBOL, "").trim();
  }

  return formatted;
}

export function formatPriceRange(min: number, max: number): string {
  return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}
