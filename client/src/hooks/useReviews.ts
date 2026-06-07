import { useState, useCallback } from "react";
import { reviewService } from "@/services/reviewService";
import type { ReviewWithUser, CreateReviewPayload } from "@/types/product.types";
import { getErrorMessage } from "@/services/api";

export function useReviews() {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getProductReviews(productId);
      if (response.success && response.data) {
        setReviews(response.data);
      } else {
        setError(response.message || "Failed to fetch reviews");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addReview = useCallback(async (productId: string, payload: CreateReviewPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.createReview(productId, payload);
      if (response.success && response.data) {
        // Optimistically prepend or refresh reviews
        setReviews((prev) => [response.data!, ...prev]);
        return response.data;
      } else {
        setError(response.message || "Failed to submit review");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeReview = useCallback(async (reviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.deleteReview(reviewId);
      if (response.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        return true;
      } else {
        setError(response.message || "Failed to delete review");
        return false;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    addReview,
    removeReview,
  };
}
