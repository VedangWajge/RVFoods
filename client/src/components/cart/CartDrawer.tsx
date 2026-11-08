import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";
import { offerService } from "@/services/offerService";
import type { FestiveOffer } from "@/types/offer.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { getCartLineId } from "@/utils/cartHelpers";
import CartItem from "./CartItem";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function CartDrawer() {
  const navigate = useNavigate();
  const { items, itemCount, summary, isEmpty } = useCart();
  const isOpen = useUIStore((s) => s.isCartDrawerOpen);
  const closeCartDrawer = useUIStore((s) => s.closeCartDrawer);
  const [offer, setOffer] = useState<FestiveOffer | null>(null);

  useEffect(() => {
    if (isOpen) {
      offerService
        .getOffer()
        .then(setOffer)
        .catch(() => {});
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    closeCartDrawer();
    navigate(path);
  };

  const offerDiscount =
    offer?.active && summary.subtotal > 0
      ? Math.min(
          summary.subtotal,
          Math.round((summary.subtotal * offer.discountPercent) / 100)
        )
      : 0;

  const effectiveDiscount = Math.max(summary.discount, offerDiscount);
  const effectiveTotal = Math.max(0, summary.subtotal - effectiveDiscount);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCartDrawer()}>
      <SheetContent side="right" className="flex flex-col w-[min(100%,24rem)] h-full p-0 bg-surface shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <SheetHeader className="space-y-0 text-left">
            <SheetTitle className="font-playfair text-xl font-bold text-text-primary flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Your Cart
              <span className="text-xs font-semibold px-2 py-0.5 bg-background border border-border text-text-secondary rounded-full">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* Cart Contents */}
        <div className="flex-grow overflow-y-auto px-6 py-4 divide-y divide-border">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#FDFAF6] border border-border flex items-center justify-center text-2xl mb-4 text-text-muted">
                🛒
              </div>
              <h3 className="font-semibold text-text-primary text-base">Your cart is empty</h3>
              <p className="text-text-secondary text-xs mt-1 max-w-[200px] mx-auto">
                Add spices, ghee, or sweets to satisfy your traditional cravings.
              </p>
              <Button
                onClick={() => handleNavigate("/products")}
                variant="default"
                size="sm"
                className="mt-6 font-semibold"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => <CartItem key={getCartLineId(item)} item={item} />)
          )}
        </div>

        {/* Footer / Summary (sticky at bottom) */}
        {!isEmpty && (
          <div className="border-t border-border bg-background/50 p-6 space-y-4">
            {offer?.active && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 text-xs text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{offer.title}:</strong> {offer.discountPercent}% OFF auto-applied ({offer.remaining} left)
                </span>
              </div>
            )}

            <div className="space-y-2.5">
              <div className="flex justify-between text-xs text-text-secondary font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(summary.subtotal)}</span>
              </div>
              {effectiveDiscount > 0 && (
                <div className="flex justify-between text-xs text-success font-semibold">
                  <span>
                    {offerDiscount > 0 && offerDiscount >= summary.discount
                      ? `${offer?.title || "Festive Offer"} (${offer?.discountPercent || 50}% OFF)`
                      : "Discount"}
                  </span>
                  <span>-{formatCurrency(effectiveDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-text-secondary font-medium">
                <span>Delivery</span>
                <span>Calculated in cart</span>
              </div>
              <div className="flex justify-between text-base font-bold text-text-primary pt-2 border-t border-border/60">
                <span>Total (excl. delivery)</span>
                <span className="text-primary">{formatCurrency(effectiveTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                onClick={() => handleNavigate("/cart")}
                className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
              >
                Proceed to Order <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleNavigate("/cart")}
                variant="outline"
                className="w-full h-11 text-sm font-semibold border-border bg-white"
              >
                View Full Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
