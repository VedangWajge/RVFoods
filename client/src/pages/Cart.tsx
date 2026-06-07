import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCart } from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  X,
  Sparkles,
  ChevronLeft,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.419 5.422.002 12.079.002c3.225.001 6.258 1.257 8.537 3.539 2.279 2.28 3.532 5.317 3.53 8.544-.005 6.661-5.424 12.079-12.081 12.079-2.002-.001-3.972-.5-5.713-1.448L0 24zm6.59-4.846c1.6.95 3.397 1.453 5.24 1.454 5.377 0 9.75-4.372 9.754-9.752.002-2.607-1.013-5.059-2.859-6.904C16.883 2.1 14.436 1.087 11.83 1.087 6.455 1.087 2.084 5.46 2.08 10.835c-.001 1.839.486 3.64 1.411 5.234l-.973 3.548 3.638-.954zm10.933-7.877c-.29-.146-1.72-.85-1.987-.947-.267-.097-.461-.146-.656.146-.195.29-.757.947-.927 1.14-.17.195-.34.218-.63.073-.29-.147-1.228-.452-2.338-1.444-.864-.77-1.448-1.721-1.618-2.013-.17-.29-.018-.447.127-.592.13-.13.29-.34.436-.509.145-.17.195-.29.29-.485.097-.195.05-.364-.025-.509-.073-.146-.656-1.579-.9-2.172-.236-.57-.478-.493-.656-.502-.17-.008-.364-.01-.559-.01-.195 0-.514.073-.78.364-.268.29-1.022.996-1.022 2.43 0 1.433 1.043 2.816 1.189 3.01.145.193 2.052 3.134 4.972 4.39.694.299 1.236.478 1.659.613.698.222 1.332.19 1.833.115.558-.083 1.72-.702 1.963-1.38.243-.678.243-1.258.17-1.38-.074-.121-.268-.194-.559-.34z" />
  </svg>
);


export default function Cart() {
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

  const handleWhatsAppOrder = () => {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919XXXXXXXXX";
    
    const itemsText = items
      .map(
        (item) =>
          `- ${item.name} x${item.quantity} — ₹${item.price * item.quantity}`
      )
      .join("\n");
      
    const message = `Hi RV Foods! 🙏 I'd like to order:\n${itemsText}\nTotal: ₹${summary.total}\n\nPlease share payment details.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    
    // Open UPI QR modal immediately so they can scan
    useUIStore.getState().openUPIModal();
  };

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

                  <div className="pt-2 space-y-3">
                    <button
                      type="button"
                      onClick={handleWhatsAppOrder}
                      className="w-full bg-[#25D366] text-white hover:bg-[#1ebe57] rounded-lg px-6 py-2.5 font-medium flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      Order via WhatsApp
                    </button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => useUIStore.getState().openUPIModal()}
                      className="w-full h-11 text-sm font-semibold border-border bg-white"
                    >
                      <QrCode className="w-4 h-4 mr-2" /> Pay via UPI QR
                    </Button>
                    <p className="text-[10px] text-text-secondary text-center mt-3">
                      You'll be redirected to WhatsApp to confirm your order
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
