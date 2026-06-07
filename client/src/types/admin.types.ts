
export interface AdminStatsCounts {
  products: number;
  users: number;
  orders: number;
  revenue: number;
}

export interface AdminStatsLowStockProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  slug: string;
  category: string;
}

export interface AdminStatsRecentOrder {
  _id: string;
  orderId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | null;
  totalAmount: number;
  finalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export interface AdminStatsRevenueChartItem {
  date: string;
  revenue: number;
  count: number;
}

export interface AdminStats {
  counts: AdminStatsCounts;
  lowStock: AdminStatsLowStockProduct[];
  recentOrders: AdminStatsRecentOrder[];
  revenueChart: AdminStatsRevenueChartItem[];
}

export interface AdminUpdateUserPayload {
  role?: "user" | "admin";
  isVerified?: boolean;
}
