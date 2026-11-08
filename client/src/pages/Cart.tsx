import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { orderService } from "@/services/orderService";
import { deliveryService } from "@/services/deliveryService";
import { offerService } from "@/services/offerService";
import { getErrorMessage } from "@/services/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { getCartItemLabel, getCartLineId } from "@/utils/cartHelpers";
import DeliveryAddressForm from "@/components/cart/DeliveryAddressForm";
import type {
  DeliveryLocation,
  DeliveryQuote,
  SelectedDeliveryPlace,
} from "@/types/order.types";
import type { FestiveOffer } from "@/types/offer.types";
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  X,
  Sparkles,
  ChevronLeft,
  QrCode,
  Loader2,
  CheckCircle2,
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
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.419 5.422.002 12.079.002c3.225.001 6.258 1.257 8.537 3.539 2.279 2.28 3.532 5.317 3.53 8.544-.005 6.661-5.424 12.079-12.081 12.081-2.002-.001-3.972-.5-5.713-1.448L0 24zm6.59-4.846c1.6.95 3.397 1.453 5.24 1.454 5.377 0 9.75-4.372 9.754-9.752.002-2.607-1.013-5.059-2.859-6.904C16.883 2.1 14.436 1.087 11.83 1.087 6.455 1.087 2.084 5.46 2.08 10.835c-.001 1.839.486 3.64 1.411 5.234l-.973 3.548 3.638-.954zm10.933-7.877c-.29-.146-1.72-.85-1.987-.947-.267-.097-.461-.146-.656.146-.195.29-.757.947-.927 1.14-.17.195-.34.218-.63.073-.29-.147-1.228-.452-2.338-1.444-.864-.77-1.448-1.721-1.618-2.013-.17-.29-.018-.447.127-.592.13-.13.29-.34.436-.509.145-.17.195-.29.29-.485.097-.195.05-.364-.025-.509-.073-.146-.656-1.579-.9-2.172-.236-.57-.478-.493-.656-.502-.17-.008-.364-.01-.559-.01-.195 0-.514.073-.78.364-.268.29-1.022.996-1.022 2.43 0 1.433 1.043 2.816 1.189 3.01.145.193 2.052 3.134 4.972 4.39.694.299 1.236.478 1.659.613.698.222 1.332.19 1.833.115.558-.083 1.72-.702 1.963-1.38.243-.678.243-1.258.17-1.38-.074-.121-.268-.194-.559-.34z" />
  </svg>
);


const mapLink = ({ lat, lng }: DeliveryLocation) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

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
    clearCart,
  } = useCart();

  const { user } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const [promoInput, setPromoInput] = useState("");
  const [isSubmittingWhatsApp, setIsSubmittingWhatsApp] = useState(false);

  // Delivery details and the server's quote for them
  const [customerName, setCustomerName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<SelectedDeliveryPlace | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<DeliveryLocation | null>(null);
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteRequestId, setQuoteRequestId] = useState(0);
  const [showAddressHint, setShowAddressHint] = useState(false);

  // The total the server recorded, shown again when the customer comes back from WhatsApp
  const [recordedTotal, setRecordedTotal] = useState<number | null>(() => {
    const stored = sessionStorage.getItem("rvf_whatsapp_attempt_total");
    return stored ? Number(stored) : null;
  });

  // Active WhatsApp order draft reference
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(() => {
    return sessionStorage.getItem("rvf_whatsapp_attempt_id");
  });

  // Return-to-site confirmation prompt modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Active festive offer data
  const [activeOffer, setActiveOffer] = useState<FestiveOffer | null>(null);

  useEffect(() => {
    offerService
      .getOffer()
      .then(setActiveOffer)
      .catch(() => {});
  }, []);

  // Confirmed order state for celebratory screen
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    finalAmount: number;
  } | null>(null);

  // Prompt the customer when returning to the website after starting WhatsApp order
  useEffect(() => {
    const handleReturn = () => {
      const awaitingId = sessionStorage.getItem("rvf_awaiting_wa_confirm");
      if (awaitingId && items.length > 0) {
        setShowConfirmModal(true);
      }
    };

    window.addEventListener("focus", handleReturn);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleReturn();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [items.length]);

  // Quote again whenever the confirmed location, cart or promo code changes
  const quoteLat = confirmedLocation?.lat;
  const quoteLng = confirmedLocation?.lng;
  const itemsKey = JSON.stringify(
    items.map(({ productId, quantity, weight }) => ({ productId, quantity, weight }))
  );

  useEffect(() => {
    setQuote(null);
    setQuoteError(null);

    if (quoteLat === undefined || quoteLng === undefined || itemsKey === "[]") {
      setIsQuoting(false);
      return;
    }

    const controller = new AbortController();
    setIsQuoting(true);

    const timer = setTimeout(async () => {
      try {
        const result = await deliveryService.getQuote(
          {
            location: { lat: quoteLat, lng: quoteLng },
            items: JSON.parse(itemsKey),
            promoCode: promoCode || undefined,
          },
          controller.signal
        );
        setQuote(result);
      } catch (err) {
        if (controller.signal.aborted) return;
        setQuoteError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setIsQuoting(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [quoteLat, quoteLng, itemsKey, promoCode, quoteRequestId]);

  const isOutOfRange = quote?.status === "out_of_range";
  const deliveryCharge = quote?.deliveryCharge ?? null;

  // Fallback festive offer discount when user hasn't selected an address yet
  const fallbackOfferDiscount =
    !quote && activeOffer?.active && summary.subtotal > 0
      ? Math.min(
          summary.subtotal,
          Math.round((summary.subtotal * activeOffer.discountPercent) / 100)
        )
      : 0;

  const displayDiscount = quote
    ? quote.discount
    : Math.max(summary.discount, fallbackOfferDiscount);

  const displayTotal =
    quote?.finalAmount ?? Math.max(0, summary.subtotal - displayDiscount);

  const isOfferApplied = quote
    ? (quote.offerDiscount ?? 0) > 0
    : fallbackOfferDiscount > 0 && fallbackOfferDiscount >= summary.discount;

  const appliedOfferTitle = quote?.offerTitle || activeOffer?.title || "Festive Offer";
  const appliedOfferPercent = quote?.offerPercent || activeOffer?.discountPercent || 50;
  // A signed-in customer's name comes from their profile; a guest's is optional.
  const orderName = user?.name || customerName.trim();
  const orderPincode = /^\d{6}$/.test(pincode) ? pincode : undefined;
  const deliverToText = [addressLine.trim(), selectedPlace?.formatted, orderPincode]
    .filter(Boolean)
    .join(", ");

  const goToAddress = () => {
    const field =
      document.getElementById("delivery-search") ?? document.getElementById("delivery-details");
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
    field?.focus({ preventScroll: true });
  };

  // The order buttons always respond: if something is missing, this says what to do next.
  const checkReadyToOrder = (): boolean => {
    if (!selectedPlace || !confirmedLocation) {
      setShowAddressHint(true);
      showToast("Please enter your delivery address to see the delivery charge.", "info");
      goToAddress();
      return false;
    }
    if (isQuoting) {
      showToast("Just a moment, we're working out your delivery charge.", "info");
      return false;
    }
    if (deliveryCharge === null) {
      showToast(quoteError || "Please choose another delivery address.", "error");
      goToAddress();
      return false;
    }
    return true;
  };

  // For addresses we can't price online: no order is recorded, they just message us
  const handleMessageForQuote = () => {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919XXXXXXXXX";
    const itemsText = items
      .map((item) => `- ${getCartItemLabel(item)} x${item.quantity}`)
      .join("\n");
    const message = `Hi RV Foods! 🙏 Please share a delivery quote for:\n${itemsText}${
      deliverToText ? `\n\nDeliver to: ${deliverToText}` : ""
    }${confirmedLocation ? `\nMap pin: ${mapLink(confirmedLocation)}` : ""}${
      orderName ? `\nName: ${orderName}` : ""
    }`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleWhatsAppOrder = async () => {
    if (isSubmittingWhatsApp || items.length === 0 || !checkReadyToOrder()) return;
    if (!selectedPlace || !confirmedLocation || deliveryCharge === null) return;
    setIsSubmittingWhatsApp(true);

    // Synchronously open a blank tab during the user click to prevent popup blockers after await
    const newTab = window.open("about:blank", "_blank");

    try {
      // 1. Log or reuse lightweight order attempt in backend database
      const response = await orderService.logWhatsAppOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          weight: item.weight,
        })),
        promoCode: promoCode || undefined,
        attemptId: activeAttemptId || undefined,
        customerName: orderName || undefined,
        addressLine: addressLine.trim() || undefined,
        formattedAddress: selectedPlace.formatted,
        city: selectedPlace.city,
        state: selectedPlace.state,
        pincode: orderPincode,
        location: confirmedLocation,
        expectedDeliveryCharge: deliveryCharge,
      });

      if (!response.data?.orderId) {
        throw new Error(response.message || "Could not record order attempt.");
      }

      const orderRef = response.data.orderId;
      setActiveAttemptId(orderRef);
      sessionStorage.setItem("rvf_whatsapp_attempt_id", orderRef);
      sessionStorage.setItem("rvf_awaiting_wa_confirm", orderRef);
      setRecordedTotal(response.data.finalAmount);
      sessionStorage.setItem("rvf_whatsapp_attempt_total", String(response.data.finalAmount));

      // 2. Format WhatsApp message including the unique order reference ID
      const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919XXXXXXXXX";
      const itemsText = items
        .map(
          (item) =>
            `- ${getCartItemLabel(item)} x${item.quantity} — ₹${item.price * item.quantity}`
        )
        .join("\n");
      const deliveryText =
        response.data.deliveryCharge === 0 ? "FREE" : `₹${response.data.deliveryCharge}`;

      const offerDisc = response.data.offerDiscount || 0;
      const totalDisc = response.data.discount || 0;
      let discountLine = "";
      if (offerDisc > 0) {
        discountLine = `\n🪔 Festive Offer (${response.data.offerTitle || "Diwali Offer"}): -₹${offerDisc}`;
      } else if (totalDisc > 0) {
        discountLine = `\nDiscount: -₹${totalDisc}`;
      }

      const message = `Hi RV Foods! 🙏 I'd like to order:\nOrder Ref: ${orderRef}${orderName ? `\nName: ${orderName}` : ""}\nDeliver to: ${deliverToText}\nMap pin: ${mapLink(confirmedLocation)}\n\n${itemsText}\n\nSubtotal: ₹${summary.subtotal}${discountLine}\nApprox. delivery charge: ${deliveryText}\nTotal: ₹${response.data.finalAmount}\n\nPlease share payment details.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      // 3. Navigate the opened tab to WhatsApp
      if (newTab && !newTab.closed) {
        newTab.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }

      // 4. Open UPI QR modal immediately so they can scan
      useUIStore.getState().openUPIModal();
    } catch (err) {
      if (newTab && !newTab.closed) {
        newTab.close();
      }
      console.error("Failed to log WhatsApp order:", err);
      const apiError = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Could not record order attempt. Please check your connection and try again.";
      showToast(errorMessage, "error");
      // The charge changed since the quote: show the new amount before they retry
      if (apiError?.response?.status === 409) {
        setQuoteRequestId((id) => id + 1);
      }
    } finally {
      setIsSubmittingWhatsApp(false);
    }
  };

  const handleConfirmYes = async () => {
    const orderIdToConfirm =
      activeAttemptId || sessionStorage.getItem("rvf_awaiting_wa_confirm");
    if (!orderIdToConfirm) return;

    setIsConfirming(true);
    try {
      const res = await orderService.confirmWhatsAppOrder(orderIdToConfirm);
      if (res.success) {
        // Clear cart ONLY after successful confirmation & persistence
        clearCart();
        sessionStorage.removeItem("rvf_awaiting_wa_confirm");
        sessionStorage.removeItem("rvf_whatsapp_attempt_id");
        sessionStorage.removeItem("rvf_whatsapp_attempt_total");
        setActiveAttemptId(null);
        setRecordedTotal(null);
        setShowConfirmModal(false);
        setConfirmedOrder({
          orderId: orderIdToConfirm,
          finalAmount: res.data?.finalAmount ?? recordedTotal ?? displayTotal,
        });
        if (res.data?.offerEnded) {
          showToast(
            `Order confirmed! Reference: ${orderIdToConfirm}. Note: The festive offer ended as all spots were claimed, so your total was updated.`,
            "info"
          );
        } else {
          showToast(
            `Order confirmed successfully! Reference: ${orderIdToConfirm}`,
            "success"
          );
        }
      } else {
        showToast(res.message || "Failed to confirm order", "error");
      }
    } catch (err) {
      console.error("Failed to confirm WhatsApp order:", err);
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Could not confirm order. Please check your connection and try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleConfirmNo = () => {
    // Keep cart and draft; do not create another confirmed order
    sessionStorage.removeItem("rvf_awaiting_wa_confirm");
    setShowConfirmModal(false);
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

      {/* WhatsApp Confirmation Prompt Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-border shadow-xl p-6 sm:p-8 max-w-md w-full relative z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <WhatsAppIcon className="w-7 h-7" />
            </div>

            <h3 className="font-playfair text-xl sm:text-2xl font-bold text-text-primary mb-2">
              Did you send this order on WhatsApp?
            </h3>

            <p className="text-xs sm:text-sm text-text-secondary mb-4">
              Order Reference:{" "}
              <span className="font-mono font-bold text-primary">
                {activeAttemptId || sessionStorage.getItem("rvf_awaiting_wa_confirm")}
              </span>
            </p>

            <div className="bg-[#FDFAF6] border border-border rounded-xl p-3.5 mb-6 text-xs text-text-secondary flex justify-between items-center">
              <span>{items.length} unique items in cart</span>
              <span className="font-bold text-text-primary text-sm">
                Total: {formatCurrency(recordedTotal ?? displayTotal)}
              </span>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleConfirmYes}
                disabled={isConfirming}
                className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold h-11 flex items-center justify-center gap-2 shadow-sm"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Yes, I placed the order
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleConfirmNo}
                disabled={isConfirming}
                className="w-full border-border font-medium h-11 text-text-secondary hover:text-text-primary"
              >
                No, not yet
              </Button>
            </div>

            <p className="text-[11px] text-text-muted mt-4">
              Selecting "No, not yet" keeps your cart and draft intact so you can continue shopping.
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#FDFAF6] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-playfair text-3xl font-bold text-text-primary">Your Shopping Cart</h1>
              <p className="mt-2 text-text-secondary text-sm">
                {isEmpty
                  ? "Your basket is currently empty."
                  : `You have ${items.length} unique item${items.length === 1 ? "" : "s"} in your basket.`}
              </p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
              <ChevronLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>

          {isEmpty ? (
            confirmedOrder ? (
              /* Celebratory Confirmed Order State */
              <div className="bg-white rounded-2xl border border-success/30 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
                <div className="w-20 h-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-4xl mx-auto mb-6">
                  🎉
                </div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                  Order Placed Successfully!
                </h2>
                <p className="text-text-secondary text-sm mb-4">
                  Thank you for ordering with RV Foods. Your order has been recorded with reference:
                </p>
                <div className="inline-block bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl font-mono text-base font-bold text-primary mb-6">
                  {confirmedOrder.orderId}
                </div>
                <p className="text-xs text-text-muted mb-8 max-w-md mx-auto">
                  Our team has received your order and will confirm delivery details with you on WhatsApp shortly. If you haven't completed UPI payment yet, feel free to scan the QR code.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => useUIStore.getState().openUPIModal()}
                    className="w-full sm:w-auto font-semibold px-6 h-11 border-border bg-white"
                  >
                    <QrCode className="w-4 h-4 mr-2" /> Pay via UPI QR
                  </Button>
                  <Link to="/products">
                    <Button variant="default" className="w-full sm:w-auto font-semibold px-8 h-11">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Standard Empty State */
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
            )
          ) : (
            /* Cart Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-4">
                {/* Active Draft Banner if attempt exists */}
                {activeAttemptId && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-sm">
                    <div className="flex items-center gap-2 text-text-primary">
                      <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Active WhatsApp order draft: <span className="font-mono font-bold text-primary">{activeAttemptId}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(true)}
                      className="text-primary hover:underline font-bold text-xs shrink-0 text-left sm:text-right"
                    >
                      Confirm WhatsApp order →
                    </button>
                  </div>
                )}
                {/* Active Festive Offer Alert */}
                {activeOffer?.active && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border border-primary/25 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">🪔</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary tracking-wide uppercase">
                            {activeOffer.title} Active
                          </span>
                          <Badge className="bg-primary text-white text-[10px] px-1.5 py-0 h-4">
                            {activeOffer.discountPercent}% OFF
                          </Badge>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                          Get {activeOffer.discountPercent}% off on first {activeOffer.maxOrders} orders!{" "}
                          <span className="font-semibold text-text-primary">
                            Only {activeOffer.remaining} {activeOffer.remaining === 1 ? "order" : "orders"} remaining.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                      key={getCartLineId(item)}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-background/20 transition-colors"
                    >
                      {/* Image */}
                      <Link to={`/products/${item.slug}`} className="h-20 w-20 rounded-xl overflow-hidden border border-border bg-background shrink-0">
                        <img
                          src={item.image || "/placeholder-product.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <Link to={`/products/${item.slug}`} className="hover:text-primary transition-colors">
                          <h3 className="font-semibold text-text-primary text-base truncate">
                            {getCartItemLabel(item)}
                          </h3>
                        </Link>
                        <p className="text-xs text-text-muted mt-1">
                          Unit Price: {formatCurrency(item.price)}
                        </p>

                        {/* Controls */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center border border-border rounded-lg bg-background h-8">
                            <button
                              onClick={() => decrementItem(getCartLineId(item))}
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
                              onClick={() => incrementItem(getCartLineId(item))}
                              disabled={item.quantity >= item.stock}
                              className="px-2.5 h-full hover:bg-border transition-colors text-text-secondary disabled:opacity-50"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(getCartLineId(item))}
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
                            Only a few left
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

              {/* Right Column: Delivery, Order Summary & Coupon */}
              <div className="lg:col-span-4 space-y-6">
                <DeliveryAddressForm
                  showNameField={!user}
                  customerName={customerName}
                  onCustomerNameChange={setCustomerName}
                  addressLine={addressLine}
                  onAddressLineChange={setAddressLine}
                  pincode={pincode}
                  onPincodeChange={setPincode}
                  selectedPlace={selectedPlace}
                  onSelectPlace={setSelectedPlace}
                  onLocationChange={setConfirmedLocation}
                  showAddressHint={showAddressHint && !selectedPlace}
                  onMessageUs={handleMessageForQuote}
                />

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
                        {activeOffer?.active ? (
                          <>
                            🪔 <span className="font-semibold text-primary">{activeOffer.title}</span> is active! You automatically get <span className="font-bold text-primary">{activeOffer.discountPercent}% off</span> on the first {activeOffer.maxOrders} orders. Promo codes don't stack — the bigger discount wins.
                          </>
                        ) : (
                          <>
                            💡 Tip: Try code <span className="font-bold text-primary">RVFOODS10</span> to get <span className="font-bold text-primary">10% off</span> your entire order subtotal!
                          </>
                        )}
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

                    {displayDiscount > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-success font-semibold">
                          <span className="flex items-center gap-1.5">
                            {isOfferApplied ? (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span>{appliedOfferTitle} ({appliedOfferPercent}% off)</span>
                              </>
                            ) : (
                              <span>Discount {promoCode ? `(${promoCode})` : ""}</span>
                            )}
                          </span>
                          <span>-{formatCurrency(displayDiscount)}</span>
                        </div>
                        {isOfferApplied && promoCode && (
                          <p className="text-[11px] text-text-muted">
                            {appliedOfferTitle} ({appliedOfferPercent}% off) gives a higher discount than promo code {promoCode}.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Approx. delivery charge</span>
                      {!selectedPlace ? (
                        <button
                          type="button"
                          onClick={goToAddress}
                          className="font-semibold text-primary hover:underline"
                        >
                          Add address
                        </button>
                      ) : (
                        <span className={`font-semibold ${deliveryCharge === 0 ? "text-success" : "text-text-primary"}`}>
                          {isQuoting
                            ? "Calculating..."
                            : isOutOfRange || quoteError
                            ? "Not available"
                            : deliveryCharge === 0
                            ? "FREE"
                            : formatCurrency(deliveryCharge ?? 0)}
                        </span>
                      )}
                    </div>

                    {deliveryCharge !== null && deliveryCharge > 0 && !isQuoting && (
                      <p className="text-xs text-text-secondary">
                        {quote?.status === "fallback"
                          ? "An estimated flat rate, as we couldn't check the distance just now."
                          : quote?.distanceKm !== null && quote?.distanceKm !== undefined
                          ? `Estimated for about ${quote.distanceKm} km by road.`
                          : "This is an estimate."}
                      </p>
                    )}

                    {quoteError && <p className="text-xs text-error">{quoteError}</p>}

                    <div className="border-t border-border pt-4 flex justify-between text-lg font-bold text-text-primary">
                      <span>{quote?.finalAmount != null ? "Total Amount" : "Total (excl. delivery)"}</span>
                      <span className="text-primary">{formatCurrency(displayTotal)}</span>
                    </div>
                  </div>

                  {isOutOfRange ? (
                    <div className="pt-2 space-y-3">
                      <p className="text-xs text-text-primary bg-accent-light/20 border border-accent/20 rounded-xl p-3">
                        Delivery is not available to this address online. Message us and we'll send you a quote.
                      </p>
                      <button
                        type="button"
                        onClick={handleMessageForQuote}
                        className="w-full bg-[#25D366] text-white hover:bg-[#1ebe57] rounded-lg px-6 py-2.5 font-medium flex items-center justify-center gap-2 transition-colors duration-200"
                      >
                        <WhatsAppIcon className="w-5 h-5" />
                        Message us for a quote
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 space-y-3">
                      <button
                        type="button"
                        onClick={handleWhatsAppOrder}
                        disabled={isSubmittingWhatsApp}
                        className="w-full bg-[#25D366] text-white hover:bg-[#1ebe57] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg px-6 py-2.5 font-medium flex items-center justify-center gap-2 transition-colors duration-200"
                      >
                        {isSubmittingWhatsApp ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Recording Order...
                          </>
                        ) : (
                          <>
                            <WhatsAppIcon className="w-5 h-5" />
                            Order via WhatsApp
                          </>
                        )}
                      </button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (checkReadyToOrder()) useUIStore.getState().openUPIModal();
                        }}
                        className="w-full h-11 text-sm font-semibold border-border bg-white"
                      >
                        <QrCode className="w-4 h-4 mr-2" /> Pay via UPI QR
                      </Button>
                      <p className="text-[11px] text-text-secondary text-center mt-3">
                        {selectedPlace
                          ? "You'll be redirected to WhatsApp to confirm your order"
                          : "Add your address above to see your delivery charge"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
