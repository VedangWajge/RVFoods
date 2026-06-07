/** Standard API response envelope from the RV Foods backend */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export interface SortOption {
  field: string;
  order: "asc" | "desc";
}

export type RequestStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

/** Admin dashboard analytics — GET /api/admin/stats */
export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: import("./order.types").Order[];
  lowStockProducts: import("./product.types").Product[];
  revenueByMonth: RevenueDataPoint[];
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  orders: number;
}
