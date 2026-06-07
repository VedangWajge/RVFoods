import { api } from "./api";
import type { ApiResponse } from "@/types/api.types";
import type { ReviewWithUser, CreateReviewPayload } from "@/types/product.types";

interface BackendReview {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  image?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const mapBackendReview = (r: BackendReview): ReviewWithUser => ({
  _id: r._id,
  productId: r.productId,
  userId: r.userId._id,
  user: {
    _id: r.userId._id,
    name: r.userId.name,
  },
  rating: r.rating,
  comment: r.comment,
  image: r.image,
  isVerified: r.isVerified,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

export const reviewService = {
  /**
   * Get all reviews for a product
   */
  async getProductReviews(productId: string): Promise<ApiResponse<ReviewWithUser[]>> {
    const { data } = await api.get<ApiResponse<BackendReview[]>>(`/reviews/${productId}`);
    
    let mappedData: ReviewWithUser[] | undefined;
    if (data.success && data.data) {
      mappedData = data.data.map(mapBackendReview);
    }
    
    return {
      success: data.success,
      message: data.message,
      data: mappedData,
      error: data.error,
    };
  },

  /**
   * Submit a new review for a product
   */
  async createReview(
    productId: string,
    payload: CreateReviewPayload
  ): Promise<ApiResponse<ReviewWithUser>> {
    const { data } = await api.post<ApiResponse<BackendReview>>(`/reviews/${productId}`, payload);
    
    let mappedData: ReviewWithUser | undefined;
    if (data.success && data.data) {
      mappedData = mapBackendReview(data.data);
    }
    
    return {
      success: data.success,
      message: data.message,
      data: mappedData,
      error: data.error,
    };
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete<ApiResponse<null>>(`/reviews/${reviewId}`);
    return data;
  },
};
