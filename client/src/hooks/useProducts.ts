import { useState, useCallback } from "react";
import { productService } from "@/services/productService";
import type {
  Product,
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/product.types";
import { getErrorMessage } from "@/services/api";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(filters);
      if (response.success && response.data) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductBySlug = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProductBySlug(slug);
      if (response.success && response.data) {
        setProduct(response.data);
        return response.data;
      } else {
        setError(response.message || "Failed to fetch product");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (payload: CreateProductPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.createProduct(payload);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to create product");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, payload: UpdateProductPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.updateProduct(id, payload);
      if (response.success && response.data) {
        const updated = response.data;
        setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
        setProduct((prev) => (prev?._id === id ? updated : prev));
        return updated;
      } else {
        setError(response.message || "Failed to update product");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setProduct((prev) => (prev?._id === id ? null : prev));
        return true;
      } else {
        setError(response.message || "Failed to delete product");
        return false;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadProductImages = useCallback(async (id: string, files: File[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.uploadProductImages(id, files);
      if (response.success && response.data) {
        const updated = response.data;
        setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
        setProduct((prev) => (prev?._id === id ? updated : prev));
        return updated;
      } else {
        setError(response.message || "Failed to upload images");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProductImage = useCallback(async (id: string, imageId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.deleteProductImage(id, imageId);
      if (response.success && response.data) {
        const updated = response.data;
        setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
        setProduct((prev) => (prev?._id === id ? updated : prev));
        return updated;
      } else {
        setError(response.message || "Failed to delete image");
        return null;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFeatured = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.toggleFeatured(id);
      if (response.success && response.data) {
        const updated = response.data;
        setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
        setProduct((prev) => (prev?._id === id ? updated : prev));
        return updated;
      } else {
        setError(response.message || "Failed to toggle featured status");
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
    products,
    pagination,
    product,
    loading,
    error,
    fetchProducts,
    fetchProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    deleteProductImage,
    toggleFeatured,
  };
}
