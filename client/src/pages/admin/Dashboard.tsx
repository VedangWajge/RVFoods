import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";
import Loader from "@/components/common/Loader";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { stats, loading, error, fetchStats } = useAdmin();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size="lg" label="Loading analytics dashboard..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="font-heading text-xl font-bold text-text-primary">Failed to Load Dashboard</h3>
        <p className="mt-2 text-sm text-text-secondary max-w-md">
          {error || "An unexpected error occurred while loading dashboard statistics."}
        </p>
        <button
          onClick={() => fetchStats()}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { counts, lowStock, recentOrders, revenueChart } = stats;

  const statItems = [
    {
      label: "Total Revenue",
      value: formatCurrency(counts.revenue),
      icon: IndianRupee,
      color: "text-success bg-success/10",
      description: "Paid & Delivered COD orders",
    },
    {
      label: "Total Orders",
      value: counts.orders,
      icon: ShoppingBag,
      color: "text-primary bg-primary/10",
      description: "Placed in your store",
    },
    {
      label: "Total Products",
      value: counts.products,
      icon: Package,
      color: "text-accent bg-accent/10",
      description: "Active & inactive inventory",
    },
    {
      label: "Registered Users",
      value: counts.users,
      icon: Users,
      color: "text-blue-600 bg-blue-500/10",
      description: "Customers & administrators",
    },
  ];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success/20 text-success border border-success/30";
      case "cancelled":
        return "bg-error/20 text-error border border-error/30";
      case "processing":
      case "shipped":
        return "bg-accent-light/30 text-primary border border-accent/30";
      default:
        return "bg-background border border-border text-text-secondary";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success/10 text-success";
      case "failed":
        return "bg-error/10 text-error";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Admin | RV Foods</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Header Block */}
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
            Overview
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Here's what is happening with RV Foods store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-secondary">
                    {item.label}
                  </span>
                  <div className={`rounded-lg p-2 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-heading text-2xl font-bold text-text-primary">
                    {item.value}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue Chart Section */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Revenue Trend
              </h3>
              <p className="text-xs text-text-secondary">Daily revenue over the last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>7 Days Active Sales</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueChart}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C84B31" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C84B31" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E0D5" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  stroke="#6B6B6B"
                  fontSize={12}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#6B6B6B"
                  fontSize={12}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E8E0D5",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C84B31"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders & Stock Alerts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Recent Orders Table */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  Recent Orders
                </h3>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-sm text-text-secondary">
                  No orders placed yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-text-muted">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Payment</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentOrders.map((order) => (
                        <tr key={order._id} className="text-text-secondary">
                          <td className="py-3 font-semibold text-text-primary">
                            {order.orderId}
                          </td>
                          <td className="py-3 truncate max-w-[120px]">
                            {order.userId?.name || "Deleted User"}
                          </td>
                          <td className="py-3 font-medium text-text-primary">
                            {formatCurrency(order.finalAmount)}
                          </td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge className={`px-2 py-0.5 text-xs font-semibold uppercase hover:bg-transparent ${getOrderStatusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm lg:col-span-4">
            <h3 className="font-heading text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Stock Alerts
            </h3>
            
            {lowStock.length === 0 ? (
              <div className="text-center py-8 text-sm text-success font-medium">
                ✅ All products are well-stocked!
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {lowStock.map((prod) => (
                  <div
                    key={prod._id}
                    className="flex items-center justify-between border-b border-border/50 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="truncate pr-2">
                      <h4 className="text-sm font-semibold text-text-primary truncate">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-text-muted capitalize">
                        {prod.category} • {formatCurrency(prod.price)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {prod.stock === 0 ? (
                        <Badge className="bg-error/10 text-error border border-error/20 hover:bg-error/10 text-[10px] font-bold">
                          Out of Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100 text-[10px] font-bold">
                          {prod.stock} Left
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
