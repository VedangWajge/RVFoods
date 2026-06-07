import { Check, Clock, Truck, Package, MapPin, AlertCircle, ShoppingBag } from "lucide-react";
import type { OrderStatus } from "@/types/order.types";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
  status: OrderStatus;
  updatedAt: string;
  estimatedDelivery?: string;
}

export default function OrderTimeline({ status, updatedAt, estimatedDelivery }: OrderTimelineProps) {
  const allSteps = [
    {
      key: "placed",
      label: "Order Placed",
      description: "We have received your order request.",
      icon: ShoppingBag,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      description: "Payment verified and order accepted.",
      icon: Check,
    },
    {
      key: "processing",
      label: "Processing",
      description: "Preparing your authentic sweets, ghee, or masale.",
      icon: Package,
    },
    {
      key: "shipped",
      label: "Shipped",
      description: "Dispatched from our facility and on the way.",
      icon: Truck,
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Delivered to your shipping address.",
      icon: MapPin,
    },
  ];

  const getStatusIndex = (s: OrderStatus): number => {
    switch (s) {
      case "placed":
        return 0;
      case "confirmed":
        return 1;
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      default:
        return -1;
    }
  };

  const currentIdx = getStatusIndex(status);

  return (
    <div className="space-y-6">
      {status === "cancelled" ? (
        <div className="bg-error/5 border border-error/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-semibold text-error text-sm">Order Cancelled</h4>
            <p className="text-xs text-text-secondary mt-0.5">
              This order has been cancelled and any refund has been initiated if applicable.
            </p>
          </div>
        </div>
      ) : (
        estimatedDelivery && status !== "delivered" && (
          <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-success shrink-0" />
            <span className="text-xs font-semibold text-success">
              Estimated Delivery: {new Date(estimatedDelivery).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )
      )}

      {status !== "cancelled" && (
        <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {allSteps.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;
            const isPending = idx > currentIdx;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="relative group">
                {/* Step Circle */}
                <div
                  className={cn(
                    "absolute -left-[33px] top-0.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 z-10",
                    isCompleted && "bg-success border-success text-white shadow-sm",
                    isActive && "bg-primary border-primary text-white scale-110 shadow-md ring-4 ring-primary/10",
                    isPending && "bg-white border-border text-text-muted"
                  )}
                >
                  <StepIcon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                </div>

                {/* Step Content */}
                <div className="transition-opacity duration-300">
                  <h4
                    className={cn(
                      "font-semibold text-sm transition-colors",
                      isCompleted && "text-success",
                      isActive && "text-primary font-bold",
                      isPending && "text-text-secondary"
                    )}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{step.description}</p>
                  
                  {isActive && (
                    <span className="text-[10px] font-medium text-text-muted bg-background border border-border px-2 py-0.5 rounded mt-2 inline-block">
                      Last update: {new Date(updatedAt).toLocaleString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        day: "numeric",
                        month: "short"
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
