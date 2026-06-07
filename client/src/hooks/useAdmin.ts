import { useState, useCallback } from "react";
import { adminService } from "@/services/adminService";
import type { AdminStats, AdminUpdateUserPayload } from "@/types/admin.types";
import type { User } from "@/types/user.types";
import type { Order } from "@/types/order.types";
import type { Product } from "@/types/product.types";
import { getErrorMessage } from "@/services/api";

export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || "Failed to fetch dashboard statistics");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getOrders();
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, payload: AdminUpdateUserPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.updateUser(userId, payload);
      if (response.success && response.data) {
        const updatedUser = response.data;
        setUsers((prev) => prev.map((u) => (u._id === userId ? updatedUser : u)));
        return updatedUser;
      } else {
        setError(response.message || "Failed to update user");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.updateOrderStatus(orderId, status);
      if (response.success && response.data) {
        const updatedOrder = response.data;
        setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
        // Refresh stats if they are loaded, to keep revenue or status count accurate
        if (stats) {
          fetchStats();
        }
        return updatedOrder;
      } else {
        setError(response.message || "Failed to update order status");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [stats, fetchStats]);

  return {
    stats,
    users,
    orders,
    products,
    loading,
    error,
    fetchStats,
    fetchUsers,
    fetchOrders,
    fetchProducts,
    updateUser,
    updateOrderStatus,
  };
}
