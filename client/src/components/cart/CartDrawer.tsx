import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/utils/formatCurrency";
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

  const handleNavigate = (path: string) => {
    closeCartDrawer();
    navigate(path);
  };

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
          <button
            onClick={closeCartDrawer}
            className="text-text-secondary hover:text-text-primary p-1.5 hover:bg-background rounded-lg transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
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
            items.map((item) => <CartItem key={item.productId} item={item} />)
          )}
        </div>

        {/* Footer / Summary (sticky at bottom) */}
        {!isEmpty && (
          <div className="border-t border-border bg-background/50 p-6 space-y-4">
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs text-text-secondary font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(summary.subtotal)}</span>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between text-xs text-success font-semibold">
                  <span>Discount</span>
                  <span>-{formatCurrency(summary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-text-secondary font-medium">
                <span>Delivery</span>
                <span className={summary.deliveryFee === 0 ? "text-success font-semibold" : ""}>
                  {summary.deliveryFee === 0 ? "FREE" : formatCurrency(summary.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-text-primary pt-2 border-t border-border/60">
                <span>Total Amount</span>
                <span className="text-primary">{formatCurrency(summary.total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                onClick={() => handleNavigate("/checkout")}
                className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
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
