import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCart } from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Tag,
  X,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    summary,
    promoCode,
    promoDiscount,
    isEmpty,
    incrementItem,
    decrementItem,
    removeItem,
    applyPromoCode,
    clearPromoCode,
  } = useCart();

  const showToast = useUIStore((s) => s.showToast);
  const [promoInput, setPromoInput] = useState("");

  const handleApplyPromo = (e: FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const success = applyPromoCode(promoInput);
    if (success) {
      showToast(`Coupon "${promoInput.toUpperCase()}" applied successfully!`, "success");
      setPromoInput("");
    } else {
      showToast("Invalid coupon code. Try 'RVFOODS10'.", "error");
    }
  };

  const handleRemovePromo = () => {
    clearPromoCode();
    showToast("Coupon removed.", "info");
  };

  return (
    <>
      <Helmet>
        <title>Shopping Cart | RV Foods</title>
        <meta
          name="description"
          content="Review your selected traditional Indian spices, ghee, and sweets. Ready to place your order with fast, secure delivery."
        />
      </Helmet>

      <div className="bg-[#FDFAF6] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-playfair text-3xl font-bold text-text-primary">Your Shopping Cart</h1>
              <p className="mt-2 text-text-secondary text-sm">
                You have {items.length} unique items in your basket.
              </p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
              <ChevronLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>

          {isEmpty ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-border p-12 text-center max-w-xl mx-auto shadow-sm">
              <div className="w-20 h-20 rounded-full bg-[#FDFAF6] border border-border flex items-center justify-center text-3xl mx-auto mb-6">
                🛒
              </div>
              <h2 className="font-playfair text-2xl font-bold text-text-primary mb-2">
                Your basket is empty
              </h2>
              <p className="text-text-secondary text-sm mb-8">
                It looks like you haven't added any products to your cart yet. Explore our authentic masale, pure ghee, and mouth-watering anarase!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <Button variant="default" className="w-full sm:w-auto font-semibold px-8 h-11">
                    Explore Our Products
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full sm:w-auto font-semibold px-8 h-11 border-border bg-white">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-4">
                {/* Free shipping progress indicator */}
                {!summary.qualifiesForFreeDelivery ? (
                  <div className="bg-accent-light/20 border border-accent/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                    <span className="text-xs font-medium text-text-primary flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      Add <span className="font-bold text-primary">{formatCurrency(summary.amountUntilFreeDelivery)}</span> more to qualify for <span className="font-bold text-success">FREE Delivery!</span>
                    </span>
                    <Link to="/products" className="text-xs font-bold text-primary hover:underline self-start sm:self-center shrink-0">
                      Add Spices/Sweets →
                    </Link>
                  </div>
                ) : (
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-xs font-semibold text-success flex items-center gap-2 shadow-sm">
                    🎉 You have qualified for FREE delivery on this order!
                  </div>
                )}

                {/* Items Container */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-background/20 transition-colors"
                    >
                      {/* Image */}
                      <Link to={`/products/${item.slug}`} className="h-20 w-20 rounded-xl overflow-hidden border border-border bg-background shrink-0">
                        <img
                          src={item.image || "/placeholder-product.jpg"}
                          alt={item.name}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <Link to={`/products/${item.slug}`} className="hover:text-primary transition-colors">
                          <h3 className="font-semibold text-text-primary text-base truncate">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-text-muted mt-1">
                          Unit Price: {formatCurrency(item.price)}
                        </p>

                        {/* Controls */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center border border-border rounded-lg bg-background h-8">
                            <button
                              onClick={() => decrementItem(item.productId)}
                              disabled={item.quantity <= 1}
                              className="px-2.5 h-full hover:bg-border transition-colors text-text-secondary disabled:opacity-50"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center text-sm font-semibold text-text-primary">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => incrementItem(item.productId)}
                              disabled={item.quantity >= item.stock}
                              className="px-2.5 h-full hover:bg-border transition-colors text-text-secondary disabled:opacity-50"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-xs text-text-secondary hover:text-error font-medium flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="sm:text-right shrink-0 self-end sm:self-center">
                        <span className="text-base font-bold text-text-primary block">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        {item.stock <= 5 && (
                          <span className="text-[10px] text-accent font-semibold bg-accent-light/10 border border-accent/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Only {item.stock} left in stock
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-left">
                  <Link to="/products" className="inline-flex sm:hidden items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Right Column: Order Summary & Coupon */}
              <div className="lg:col-span-4 space-y-6">
                {/* Promo Code Card */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-primary" /> Have a Promo Code?
                  </h3>

                  {promoCode ? (
                    <div className="bg-success/10 border border-success/20 rounded-xl p-3 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-success text-white border-none text-xs font-bold px-2 py-0.5">
                          {promoCode}
                        </Badge>
                        <span className="text-xs font-semibold text-success">
                          -{formatCurrency(promoDiscount)} Applied
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-text-secondary hover:text-error p-1 transition-colors"
                        aria-label="Remove promo code"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="e.g. RVFOODS10"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="h-10 text-sm font-semibold uppercase"
                      />
                      <Button type="submit" variant="outline" className="h-10 text-xs font-semibold px-4 border-border bg-background hover:bg-border">
                        Apply
                      </Button>
                    </form>
                  )}
                  
                  {!promoCode && (
                    <div className="mt-3 p-3 bg-[#FDFAF6] border border-border/80 rounded-xl">
                      <p className="text-[11px] text-text-secondary">
                        💡 Tip: Try code <span className="font-bold text-primary">RVFOODS10</span> to get <span className="font-bold text-primary">10% off</span> your entire order subtotal!
                      </p>
                    </div>
                  )}
                </div>

                {/* Summary Card */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                  <h3 className="font-playfair text-lg font-bold text-text-primary border-b border-border pb-3">
                    Order Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Subtotal</span>
                      <span className="font-semibold text-text-primary">
                        {formatCurrency(summary.subtotal)}
                      </span>
                    </div>

                    {summary.discount > 0 && (
                      <div className="flex justify-between text-sm text-success font-semibold">
                        <span>Discount</span>
                        <span>-{formatCurrency(summary.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Delivery Fee</span>
                      <span className={`font-semibold ${summary.deliveryFee === 0 ? "text-success" : "text-text-primary"}`}>
                        {summary.deliveryFee === 0 ? "FREE" : formatCurrency(summary.deliveryFee)}
                      </span>
                    </div>

                    <div className="border-t border-border pt-4 flex justify-between text-lg font-bold text-text-primary">
                      <span>Total Amount</span>
                      <span className="text-primary">{formatCurrency(summary.total)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => navigate("/checkout")}
                      className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout <ArrowRight className="w-5 h-5" />
                    </Button>
                    <p className="text-[10px] text-text-secondary text-center mt-3">
                      Secure checkout powered by Razorpay. Prices inclusive of all traditional taxes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
