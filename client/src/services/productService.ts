import { api } from "./api";
import type { ApiResponse } from "@/types/api.types";
import type {
  Product,
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/product.types";

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const productService = {
  /**
   * Get all products with filters
   */
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<PaginatedProducts>> {
    // Transform filters into query parameters
    const params: Record<string, string> = {};

    if (filters.category) {
      params.category = Array.isArray(filters.category)
        ? filters.category[0] // If it's an array, take the first one (backend expects enum)
        : filters.category;
    }
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    if (filters.minPrice !== undefined) params.minPrice = String(filters.minPrice);
    if (filters.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);
    if (filters.minRating !== undefined) params.minRating = String(filters.minRating);
    if (filters.isFeatured !== undefined) params.featured = String(filters.isFeatured);
    if (filters.page !== undefined) params.page = String(filters.page);
    if (filters.limit !== undefined) params.limit = String(filters.limit);

    const { data } = await api.get<ApiResponse<PaginatedProducts>>("/products", { params });
    return data;
  },

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${slug}`);
    return data;
  },

  /**
   * Create a new product (Admin only)
   */
  async createProduct(payload: CreateProductPayload): Promise<ApiResponse<Product>> {
    const { data } = await api.post<ApiResponse<Product>>("/products", payload);
    return data;
  },

  /**
   * Update an existing product (Admin only)
   */
  async updateProduct(id: string, payload: UpdateProductPayload): Promise<ApiResponse<Product>> {
    const { data } = await api.put<ApiResponse<Product>>(`/products/${id}`, payload);
    return data;
  },

  /**
   * Delete a product (Admin only)
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const { data } = await api.delete<ApiResponse<void>>(`/products/${id}`);
    return data;
  },

  /**
   * Upload product images (Admin only)
   */
  async uploadProductImages(id: string, files: File[]): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const { data } = await api.post<ApiResponse<Product>>(`/products/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  /**
   * Delete product image (Admin only)
   */
  async deleteProductImage(id: string, imageId: string): Promise<ApiResponse<Product>> {
    const { data } = await api.delete<ApiResponse<Product>>(`/products/${id}/images/${encodeURIComponent(imageId)}`);
    return data;
  },

  /**
   * Toggle featured status of a product (Admin only)
   */
  async toggleFeatured(id: string): Promise<ApiResponse<Product>> {
    const { data } = await api.patch<ApiResponse<Product>>(`/products/${id}/featured`);
    return data;
  },
};
