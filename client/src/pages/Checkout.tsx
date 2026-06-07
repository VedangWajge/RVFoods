import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  MapPin,
} from "lucide-react";
import type { ShippingAddress, PaymentMethod } from "@/types/order.types";

const shippingSchema = z.object({
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  country: z.string().min(2, "Country is required"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, summary, promoCode, isEmpty, clearCart } = useCart();
  const { placeOrder, confirmPayment, loading: apiLoading } = useOrders();
  const showToast = useUIStore((s) => s.showToast);

  const [step, setStep] = useState<1 | 2>(1);
  const [addressData, setAddressData] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const isOrderPlacedRef = useRef(false);

  // Redirect to cart if empty
  useEffect(() => {
    if (isEmpty && !isOrderPlacedRef.current) {
      showToast("Your cart is empty. Add items before checking out.", "info");
      navigate("/cart");
    }
  }, [isEmpty, navigate, showToast]);

  // Load Razorpay SDK
  useEffect(() => {
    const loadRazorpay = async () => {
      const scriptId = "razorpay-sdk";
      if (document.getElementById(scriptId)) {
        setRazorpayLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        showToast("Failed to load payment gateway. Please check your internet connection.", "error");
      };
      document.body.appendChild(script);
    };
    loadRazorpay();
  }, [showToast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
      country: user?.address?.country || "India",
    },
  });

  // Reset form when user address is loaded
  useEffect(() => {
    if (user?.address) {
      reset({
        street: user.address.street || "",
        city: user.address.city || "",
        state: user.address.state || "",
        pincode: user.address.pincode || "",
        country: user.address.country || "India",
      });
    }
  }, [user, reset]);

  const onAddressSubmit = (data: ShippingFormValues) => {
    const address: ShippingAddress = {
      street: data.street,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: data.country,
    };
    setAddressData(address);
    setStep(2);
  };

  const handleCheckout = async () => {
    if (!addressData) {
      showToast("Please provide a valid shipping address", "error");
      setStep(1);
      return;
    }

    const productsPayload = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const orderPayload = {
      products: productsPayload,
      shippingAddress: addressData,
      paymentMethod,
      promoCode: promoCode || undefined,
    };

    if (paymentMethod === "cod") {
      const res = await placeOrder(orderPayload);
      if (res && res.order) {
        isOrderPlacedRef.current = true;
        showToast("Order placed successfully!", "success");
        clearCart();
        navigate("/orders?success=true");
      }
    } else {
      if (!razorpayLoaded) {
        showToast("Razorpay SDK is still loading. Please wait.", "info");
        return;
      }

      const res = await placeOrder(orderPayload);
      if (!res || !res.razorpay) {
        return;
      }

      const { razorpay: rzpData } = res;

      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "RV Foods",
        description: "Pure. Traditional. Delivered.",
        order_id: rzpData.razorpayOrderId,
        handler: async (response: any) => {
          const verifyPayload = {
            razorpayOrderId: rzpData.razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          };
          const successOrder = await confirmPayment(verifyPayload);
          if (successOrder) {
            isOrderPlacedRef.current = true;
            showToast("Order placed successfully!", "success");
            clearCart();
            navigate("/orders?success=true");
          } else {
            showToast("Payment verification failed. Please contact support.", "error");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#C84B31",
        },
        modal: {
          ondismiss: () => {
            showToast("Payment window closed. Order remains pending.", "info");
          },
        },
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        showToast("Failed to initialize Razorpay checkout interface.", "error");
      }
    }
  };

  if (isEmpty) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout | RV Foods</title>
        <meta
          name="description"
          content="Complete your purchase of pure spices, ghee, and traditional sweets from RV Foods. Fast and secure checkout."
        />
      </Helmet>

      <div className="bg-[#FDFAF6] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Back to Cart */}
          <div className="mb-8">
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors mb-3"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Cart
            </Link>
            <h1 className="font-playfair text-3xl font-bold text-text-primary">Secure Checkout</h1>
            <p className="mt-1 text-text-secondary text-sm">
              Please complete the details below to finish your order.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-8 space-y-6">
              {/* Stepper progress indicator */}
              <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex items-center justify-between">
                <button
                  onClick={() => step === 2 && setStep(1)}
                  disabled={step === 1}
                  className={`flex items-center gap-3 text-sm font-semibold transition-colors text-left ${
                    step === 1 ? "text-primary cursor-default" : "text-text-secondary hover:text-primary"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === 1
                        ? "bg-primary text-white"
                        : "bg-success/10 text-success border border-success/20"
                    }`}
                  >
                    {step === 2 ? <CheckCircle className="w-4 h-4" /> : "1"}
                  </span>
                  <div>
                    <p className="leading-tight">Shipping Address</p>
                    <p className="text-[10px] text-text-muted font-normal">Where to send your order</p>
                  </div>
                </button>

                <div className="h-px bg-border flex-grow mx-6 hidden sm:block" />

                <div
                  className={`flex items-center gap-3 text-sm font-semibold text-left ${
                    step === 2 ? "text-primary" : "text-text-muted"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                      step === 2 ? "bg-primary text-white border-primary" : "bg-background border-border"
                    }`}
                  >
                    2
                  </span>
                  <div>
                    <p className="leading-tight">Payment Method</p>
                    <p className="text-[10px] text-text-muted font-normal">Choose Razorpay or COD</p>
                  </div>
                </div>
              </div>

              {/* Step 1: Address Form */}
              {step === 1 && (
                <Card className="bg-white border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-playfair text-xl text-text-primary flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" /> Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="street" className="text-text-primary mb-1.5 block">
                            Street Address <span className="text-primary">*</span>
                          </Label>
                          <Input
                            id="street"
                            placeholder="Flat/House No, Building, Area, Colony"
                            {...register("street")}
                            className={errors.street ? "border-error focus-visible:ring-error" : ""}
                          />
                          {errors.street && (
                            <p className="text-xs text-error font-medium mt-1">{errors.street.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="city" className="text-text-primary mb-1.5 block">
                            City / Town <span className="text-primary">*</span>
                          </Label>
                          <Input
                            id="city"
                            placeholder="e.g. Pune"
                            {...register("city")}
                            className={errors.city ? "border-error focus-visible:ring-error" : ""}
                          />
                          {errors.city && (
                            <p className="text-xs text-error font-medium mt-1">{errors.city.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="state" className="text-text-primary mb-1.5 block">
                            State <span className="text-primary">*</span>
                          </Label>
                          <Input
                            id="state"
                            placeholder="e.g. Maharashtra"
                            {...register("state")}
                            className={errors.state ? "border-error focus-visible:ring-error" : ""}
                          />
                          {errors.state && (
                            <p className="text-xs text-error font-medium mt-1">{errors.state.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="pincode" className="text-text-primary mb-1.5 block">
                            Pincode <span className="text-primary">*</span>
                          </Label>
                          <Input
                            id="pincode"
                            placeholder="6-digit PIN code"
                            maxLength={6}
                            {...register("pincode")}
                            className={errors.pincode ? "border-error focus-visible:ring-error" : ""}
                          />
                          {errors.pincode && (
                            <p className="text-xs text-error font-medium mt-1">{errors.pincode.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="country" className="text-text-primary mb-1.5 block">
                            Country <span className="text-primary">*</span>
                          </Label>
                          <Input
                            id="country"
                            placeholder="India"
                            {...register("country")}
                            className={errors.country ? "border-error focus-visible:ring-error" : ""}
                          />
                          {errors.country && (
                            <p className="text-xs text-error font-medium mt-1">{errors.country.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex justify-end">
                        <Button type="submit" className="font-semibold gap-1.5">
                          Continue to Payment <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment Selector */}
              {step === 2 && addressData && (
                <div className="space-y-6">
                  {/* Address Summary */}
                  <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <h3 className="font-semibold text-text-primary text-sm">Shipping To</h3>
                            <p className="text-sm text-text-secondary mt-1">
                              {addressData.street}, {addressData.city}, {addressData.state} -{" "}
                              {addressData.pincode}, {addressData.country}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStep(1)}
                          className="shrink-0 text-xs font-semibold h-8 px-3 flex items-center gap-1 border-border"
                        >
                          Modify
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Card */}
                  <Card className="bg-white border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="font-playfair text-xl text-text-primary flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" /> Select Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Payment Option: Razorpay */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all ${
                          paymentMethod === "razorpay"
                            ? "border-primary bg-primary/[0.02] shadow-sm"
                            : "border-border hover:bg-background/40"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            paymentMethod === "razorpay" ? "border-primary text-primary" : "border-border"
                          }`}
                        >
                          {paymentMethod === "razorpay" && (
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </span>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-text-primary text-sm">
                              Online Payment (Razorpay)
                            </span>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                              Recommended
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-1">
                            Pay safely via Cards, UPI (GPay/PhonePe), Netbanking, or Wallets.
                          </p>
                        </div>
                      </button>

                      {/* Payment Option: COD */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={`w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all ${
                          paymentMethod === "cod"
                            ? "border-primary bg-primary/[0.02] shadow-sm"
                            : "border-border hover:bg-background/40"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            paymentMethod === "cod" ? "border-primary text-primary" : "border-border"
                          }`}
                        >
                          {paymentMethod === "cod" && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </span>
                        <div className="flex-grow">
                          <span className="font-semibold text-text-primary text-sm flex items-center gap-2">
                            <Truck className="w-4 h-4 text-text-secondary" /> Cash on Delivery (COD)
                          </span>
                          <p className="text-xs text-text-secondary mt-1">
                            Pay with cash, UPI, or card when your traditional items are delivered to your doorstep.
                          </p>
                        </div>
                      </button>

                      <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3 justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="font-semibold border-border h-11"
                        >
                          Back to Shipping
                        </Button>

                        <Button
                          onClick={handleCheckout}
                          disabled={apiLoading}
                          className="font-semibold h-11 flex items-center justify-center gap-2 px-8"
                        >
                          {apiLoading ? (
                            <>
                              Processing...
                            </>
                          ) : (
                            <>
                              Place Order ({formatCurrency(summary.total)}){" "}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
                <h3 className="font-playfair text-lg font-bold text-text-primary border-b border-border pb-3">
                  Items In Your Order
                </h3>

                {/* Items List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-border scrollbar-hide pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-background shrink-0">
                        <img
                          src={item.image || "/placeholder-product.jpg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-semibold text-text-primary truncate">{item.name}</h4>
                        <p className="text-[10px] text-text-secondary mt-0.5">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-text-primary shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Billing Summary */}
                <div className="border-t border-border pt-4 space-y-2.5">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-semibold text-text-primary">
                      {formatCurrency(summary.subtotal)}
                    </span>
                  </div>

                  {summary.discount > 0 && (
                    <div className="flex justify-between text-xs text-success font-semibold">
                      <span>Discount {promoCode && `(${promoCode})`}</span>
                      <span>-{formatCurrency(summary.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Delivery Fee</span>
                    <span
                      className={`font-semibold ${
                        summary.deliveryFee === 0 ? "text-success" : "text-text-primary"
                      }`}
                    >
                      {summary.deliveryFee === 0 ? "FREE" : formatCurrency(summary.deliveryFee)}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3.5 flex justify-between text-base font-bold text-text-primary">
                    <span>Final Amount</span>
                    <span className="text-primary">{formatCurrency(summary.total)}</span>
                  </div>
                </div>

                <div className="pt-2 bg-[#FDFAF6] border border-border/80 rounded-xl p-3 text-center space-y-1">
                  <p className="text-[10px] text-text-secondary font-medium flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0" /> SSL Encrypted & Verified Checkout
                  </p>
                  <p className="text-[9px] text-text-muted">
                    Your personal and traditional transaction details are completely secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
