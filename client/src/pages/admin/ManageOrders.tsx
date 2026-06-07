import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";
import { useUIStore } from "@/store/uiStore";
import Loader from "@/components/common/Loader";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/formatCurrency";
import type { OrderStatus, PaymentStatus } from "@/types/order.types";
import {
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  CreditCard,
  Truck,
  Clock,
} from "lucide-react";

const ORDER_STATUSES: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUSES: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "All Payment Statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export default function ManageOrders() {
  const { orders, loading, fetchOrders, updateOrderStatus } = useAdmin();
  const showToast = useUIStore((s) => s.showToast);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "">("");

  // Expended row states
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Loading state per order status update
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleRow = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const updated = await updateOrderStatus(orderId, newStatus);
    setUpdatingId(null);
    if (updated) {
      showToast(`Order status updated to ${newStatus}`, "success");
    } else {
      showToast("Failed to update order status", "error");
    }
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return "bg-success/20 text-success border border-success/30 hover:bg-success/20";
      case "cancelled":
        return "bg-error/20 text-error border border-error/30 hover:bg-error/20";
      case "placed":
        return "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50";
      case "confirmed":
        return "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-50";
      case "processing":
        return "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50";
      case "shipped":
        return "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-50";
      default:
        return "bg-background border border-border text-text-secondary hover:bg-background";
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "bg-success/10 text-success hover:bg-success/10";
      case "failed":
        return "bg-error/10 text-error hover:bg-error/10";
      case "refunded":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userId &&
        typeof order.userId === "object" &&
        ("name" in order.userId) &&
        (order.userId as any).name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.userId &&
        typeof order.userId === "object" &&
        ("email" in order.userId) &&
        (order.userId as any).email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "" || order.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === "" || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <>
      <Helmet>
        <title>Manage Orders | Admin | RV Foods</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
            Orders Management
          </h2>
          <p className="text-sm text-text-secondary">
            View orders details, update tracking status, and monitor transaction states.
          </p>
        </div>

        {/* Filters and search panel */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center bg-white p-4 rounded-xl border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search by Order ID, Customer name or email..."
              className="pl-9 bg-background/50"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
              className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | "")}
              className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Orders */}
        {loading && orders.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader size="lg" label="Updating shipping logs..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-xl">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-heading text-lg font-bold text-text-primary">No orders found</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
              No orders matched your search filters. Try resetting the dropdowns or check back later.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="w-10 px-6 py-4"></th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedOrderId === order._id;
                    const customer =
                      order.userId && typeof order.userId === "object"
                        ? (order.userId as any)
                        : null;

                    return (
                      <>
                        <tr
                          key={order._id}
                          onClick={() => toggleRow(order._id)}
                          className="hover:bg-background/20 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 text-center">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-text-secondary" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-text-secondary" />
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-text-primary">
                            {order.orderId}
                          </td>
                          <td className="px-6 py-4 text-text-secondary">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 font-medium text-text-primary truncate max-w-[150px]">
                            {customer?.name || "Deleted User"}
                          </td>
                          <td className="px-6 py-4 font-bold text-text-primary">
                            {formatCurrency(order.finalAmount)}
                          </td>
                          <td className="px-6 py-4 uppercase text-text-secondary text-xs font-bold">
                            {order.paymentMethod}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${getPaymentStatusBadge(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`px-2 py-0.5 text-xs font-bold uppercase hover:bg-transparent ${getOrderStatusBadge(order.orderStatus)}`}>
                              {order.orderStatus}
                            </Badge>
                          </td>
                        </tr>

                        {/* Collapsible Details Row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr className="bg-background/40">
                              <td colSpan={8} className="p-6 border-b border-border">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden text-sm"
                                >
                                  {/* Left col: Address & Method */}
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" /> Shipping Address
                                      </h4>
                                      <div className="text-text-secondary leading-relaxed bg-white border border-border p-3.5 rounded-xl">
                                        <p className="font-semibold text-text-primary">
                                          {customer?.name}
                                        </p>
                                        <p>{order.shippingAddress.street}</p>
                                        <p>
                                          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                                          {order.shippingAddress.pincode}
                                        </p>
                                        <p className="text-xs mt-1 text-text-muted">
                                          Country: {order.shippingAddress.country}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-4">
                                      <div className="flex-1 bg-white border border-border p-3 rounded-xl">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                                          Payment Method
                                        </span>
                                        <span className="font-semibold text-text-primary uppercase flex items-center gap-1.5 text-xs">
                                          <CreditCard className="h-3.5 w-3.5 text-primary" />
                                          {order.paymentMethod === "razorpay" ? "Razorpay" : "COD"}
                                        </span>
                                      </div>
                                      <div className="flex-1 bg-white border border-border p-3 rounded-xl">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                                          Total Weight
                                        </span>
                                        <span className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                                          <Truck className="h-3.5 w-3.5 text-primary" />
                                          {order.products.length} Items
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Center col: Order Items */}
                                  <div className="md:col-span-2 space-y-4">
                                    <div>
                                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" /> Order Summary
                                      </h4>
                                      <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden">
                                        {order.products.map((item) => (
                                          <div
                                            key={item.productId}
                                            className="flex items-center gap-3 p-3 text-xs"
                                          >
                                            <div className="h-10 w-10 rounded-md border border-border overflow-hidden shrink-0">
                                              <img
                                                src={item.image || "/placeholder-product.jpg"}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                              />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-semibold text-text-primary truncate">
                                                {item.name}
                                              </p>
                                              <p className="text-text-muted text-[10px]">
                                                Unit: {formatCurrency(item.price)}
                                              </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                              <p className="font-bold text-text-primary">
                                                {formatCurrency(item.price * item.quantity)}
                                              </p>
                                              <p className="text-text-muted text-[10px]">
                                                Qty: {item.quantity}
                                              </p>
                                            </div>
                                          </div>
                                        ))}

                                        {/* Bill details */}
                                        <div className="bg-background/25 p-3 space-y-1 text-xs">
                                          <div className="flex justify-between text-text-secondary">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(order.totalAmount)}</span>
                                          </div>
                                          {order.discount > 0 && (
                                            <div className="flex justify-between text-success">
                                              <span>Promo Discount:</span>
                                              <span>-{formatCurrency(order.discount)}</span>
                                            </div>
                                          )}
                                          <div className="flex justify-between text-text-primary font-bold text-sm pt-1 border-t border-border/50">
                                            <span>Final Amount:</span>
                                            <span>{formatCurrency(order.finalAmount)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Order Status Action Selector */}
                                    <div className="bg-primary/5 border border-primary/15 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                      <div>
                                        <h5 className="font-semibold text-text-primary text-xs">
                                          Update Shipping State
                                        </h5>
                                        <p className="text-[10px] text-text-secondary mt-0.5">
                                          Updating the status changes order timeline on customer's page.
                                        </p>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        {updatingId === order._id ? (
                                          <div className="flex items-center gap-1 text-xs text-primary font-medium pr-2">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            <span>Saving...</span>
                                          </div>
                                        ) : null}
                                        <select
                                          disabled={updatingId === order._id || order.orderStatus === "cancelled" || order.orderStatus === "delivered"}
                                          value={order.orderStatus}
                                          onChange={(e) =>
                                            handleStatusChange(order._id, e.target.value as OrderStatus)
                                          }
                                          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-text-primary font-semibold focus:border-primary focus:outline-none"
                                        >
                                          <option value="placed" disabled>Placed</option>
                                          <option value="confirmed">Confirmed</option>
                                          <option value="processing">Processing</option>
                                          <option value="shipped">Shipped</option>
                                          <option value="delivered">Delivered</option>
                                          <option value="cancelled">Cancelled / Refund</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Inline mini spinner for updates
function Loader2({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
