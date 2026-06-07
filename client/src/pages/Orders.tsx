import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useOrders } from "@/hooks/useOrders";
import OrderCard from "@/components/order/OrderCard";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ChevronRight, AlertCircle, ArrowLeft } from "lucide-react";

export default function Orders() {
  const { orders, loading, error, fetchMyOrders } = useOrders();
  const [searchParams] = useSearchParams();
  const isCheckoutSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return (
    <>
      <Helmet>
        <title>My Orders | RV Foods</title>
        <meta
          name="description"
          content="View your order history, tracking details, and estimated delivery dates for your authentic Indian traditional food products."
        />
      </Helmet>

      <div className="bg-[#FDFAF6] min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h1 className="font-playfair text-3xl font-bold text-text-primary">My Order History</h1>
              <p className="mt-1.5 text-text-secondary text-sm">
                View status and track shipments of your home-made delicacies.
              </p>
            </div>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1">
                Shop More <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Checkout Success Banner */}
          {isCheckoutSuccess && (
            <div className="bg-success/5 border border-success/20 rounded-2xl p-6 shadow-sm text-center max-w-2xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center text-xl mx-auto animate-bounce">
                🎉
              </div>
              <h2 className="font-playfair text-xl font-bold text-text-primary">
                Thank you for your order!
              </h2>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Your order is officially placed. We're getting your fresh traditional products packed up. You can track your packages below.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader label="Retrieving your orders..." />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-error/5 border border-error/20 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4">
              <AlertCircle className="w-12 h-12 text-error mx-auto" />
              <h3 className="font-semibold text-text-primary text-base">Unable to retrieve orders</h3>
              <p className="text-xs text-text-secondary">{error}</p>
              <Button onClick={() => fetchMyOrders()} variant="outline" className="text-xs font-semibold">
                Try Reloading
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && orders.length === 0 && (
            <div className="bg-white rounded-2xl border border-border p-12 text-center max-w-md mx-auto shadow-sm space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FDFAF6] border border-border flex items-center justify-center text-2xl mx-auto">
                📦
              </div>
              <div className="space-y-2">
                <h3 className="font-playfair text-xl font-bold text-text-primary">
                  No orders placed yet
                </h3>
                <p className="text-xs text-text-secondary">
                  It looks like you haven't bought anything yet. Explore our delicious traditional pickles, ghee, anarase, and homemade spices!
                </p>
              </div>
              <Link to="/products" className="inline-block">
                <Button className="font-semibold px-6 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Start Shopping
                </Button>
              </Link>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}

          {/* Back button */}
          <div className="pt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
