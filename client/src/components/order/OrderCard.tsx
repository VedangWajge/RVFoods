import { useState } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Order } from "@/types/order.types";
import OrderTimeline from "./OrderTimeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "placed":
        return { label: "Placed", className: "bg-blue-50 text-blue-700 border-blue-200" };
      case "confirmed":
        return { label: "Confirmed", className: "bg-amber-50 text-amber-700 border-amber-200" };
      case "processing":
        return { label: "Processing", className: "bg-primary/5 text-primary border-primary/20" };
      case "shipped":
        return { label: "Shipped", className: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "delivered":
        return { label: "Delivered", className: "bg-success/10 text-success border-success/20" };
      case "cancelled":
        return { label: "Cancelled", className: "bg-error/10 text-error border-error/20" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Paid", className: "bg-success/10 text-success border-success/20" };
      case "pending":
        return { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" };
      case "failed":
        return { label: "Failed", className: "bg-error/10 text-error border-error/20" };
      case "refunded":
        return { label: "Refunded", className: "bg-blue-50 text-blue-700 border-blue-200" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  const orderStatus = getStatusConfig(order.orderStatus);
  const paymentStatus = getPaymentStatusConfig(order.paymentStatus);
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="bg-white border-border hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Card Header (Main Summary) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:bg-background/20 transition-colors select-none"
      >
        <div className="grid grid-cols-2 md:flex md:items-center gap-x-4 gap-y-2 text-sm">
          {/* Order ID */}
          <div>
            <span className="text-xs text-text-secondary block">Order ID</span>
            <span className="font-bold text-text-primary text-base uppercase">{order.orderId}</span>
          </div>

          {/* Placed On */}
          <div className="md:border-l md:border-border md:pl-4">
            <span className="text-xs text-text-secondary block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-text-secondary" /> Placed On
            </span>
            <span className="font-semibold text-text-primary">{formattedDate}</span>
          </div>

          {/* Total Amount */}
          <div className="md:border-l md:border-border md:pl-4">
            <span className="text-xs text-text-secondary block">Total Amount</span>
            <span className="font-bold text-primary">{formatCurrency(order.finalAmount)}</span>
          </div>

          {/* Item Count */}
          <div className="md:border-l md:border-border md:pl-4">
            <span className="text-xs text-text-secondary block">Items</span>
            <span className="font-semibold text-text-primary">
              {order.products.reduce((acc, p) => acc + p.quantity, 0)} items
            </span>
          </div>
        </div>

        {/* Badges & Expand Icon */}
        <div className="flex items-center justify-between md:justify-end gap-3 border-t border-border/60 pt-3 md:border-none md:pt-0">
          <div className="flex items-center gap-2">
            {/* Order Status */}
            <Badge variant="outline" className={cn("font-semibold text-xs px-2.5 py-0.5", orderStatus.className)}>
              {orderStatus.label}
            </Badge>

            {/* Payment Status */}
            <Badge variant="outline" className={cn("font-semibold text-xs px-2.5 py-0.5", paymentStatus.className)}>
              {paymentStatus.label}
            </Badge>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-border/40 text-text-secondary transition-colors"
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <CardContent className="border-t border-border bg-[#FDFAF6]/30 p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Ordered Items & Shipping Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Items List */}
              <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="bg-background px-4 py-3 border-b border-border flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-text-primary text-sm">Ordered Items</h4>
                </div>
                <div className="divide-y divide-border">
                  {order.products.map((item) => (
                    <div key={item.productId} className="p-4 flex items-center gap-4 hover:bg-background/20 transition-colors">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-background shrink-0">
                        <img
                          src={item.image || "/placeholder-product.jpg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h5 className="font-semibold text-text-primary text-sm truncate">{item.name}</h5>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="font-bold text-text-primary text-sm shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Payment Details Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipping */}
                <div className="bg-white rounded-xl border border-border p-4 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-text-secondary flex items-center gap-1 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Address
                  </span>
                  <p className="text-xs text-text-primary leading-relaxed">
                    {order.shippingAddress.street},<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode},<br />
                    {order.shippingAddress.country}
                  </p>
                </div>

                {/* Payment */}
                <div className="bg-white rounded-xl border border-border p-4 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-text-secondary flex items-center gap-1 uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Info
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs text-text-primary font-medium">
                      Method: <span className="uppercase">{order.paymentMethod}</span>
                    </p>
                    <p className="text-xs text-text-primary">
                      Status: <span className="capitalize font-semibold">{order.paymentStatus}</span>
                    </p>
                    {order.razorpayPaymentId && (
                      <p className="text-[10px] text-text-secondary font-mono truncate">
                        ID: {order.razorpayPaymentId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Progress Timeline */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-border p-5 shadow-sm">
              <h4 className="font-semibold text-text-primary text-sm border-b border-border pb-3 mb-5 flex items-center gap-2">
                📦 Order Tracking Status
              </h4>
              <OrderTimeline
                status={order.orderStatus}
                updatedAt={order.updatedAt}
                estimatedDelivery={order.estimatedDelivery}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
