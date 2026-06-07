import { useState, useCallback } from "react";
import { orderService } from "@/services/orderService";
import type {
  Order,
  CreateOrderPayload,
  CreateOrderResponse,
  VerifyPaymentPayload,
} from "@/types/order.types";
import { getErrorMessage } from "@/services/api";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getMyOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setError(response.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderById(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
        return response.data;
      } else {
        setError(response.message || "Failed to fetch order details");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = useCallback(async (payload: CreateOrderPayload): Promise<CreateOrderResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrder(payload);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to place order");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPayment = useCallback(async (payload: VerifyPaymentPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.verifyPayment(payload);
      if (response.success && response.data) {
        const updatedOrder = response.data;
        setOrder(updatedOrder);
        setOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
        return updatedOrder;
      } else {
        setError(response.message || "Payment verification failed");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    order,
    loading,
    error,
    fetchMyOrders,
    fetchOrderById,
    placeOrder,
    confirmPayment,
  };
}
