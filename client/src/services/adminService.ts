import { api } from "./api";
import type { ApiResponse } from "@/types/api.types";
import type { AdminStats, AdminUpdateUserPayload } from "@/types/admin.types";
import type { User } from "@/types/user.types";
import type { Order } from "@/types/order.types";
import type { Product } from "@/types/product.types";

export const adminService = {
  /**
   * Get dashboard analytics stats
   */
  async getStats(): Promise<ApiResponse<AdminStats>> {
    const { data } = await api.get<ApiResponse<AdminStats>>("/admin/stats");
    return data;
  },

  /**
   * Get all registered users (admin context)
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    const { data } = await api.get<ApiResponse<User[]>>("/admin/users");
    return data;
  },

  /**
   * Update a user's verification or role (admin context)
   */
  async updateUser(userId: string, payload: AdminUpdateUserPayload): Promise<ApiResponse<User>> {
    const { data } = await api.put<ApiResponse<User>>(`/admin/users/${userId}`, payload);
    return data;
  },

  /**
   * Get all client orders (admin context)
   */
  async getOrders(): Promise<ApiResponse<Order[]>> {
    const { data } = await api.get<ApiResponse<Order[]>>("/admin/orders");
    return data;
  },

  /**
   * Get all store products (admin context)
   */
  async getProducts(): Promise<ApiResponse<Product[]>> {
    const { data } = await api.get<ApiResponse<Product[]>>("/admin/products");
    return data;
  },

  /**
   * Update an order's status (admin context)
   */
  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<Order>> {
    const { data } = await api.put<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
    return data;
  },
};
