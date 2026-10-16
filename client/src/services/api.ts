import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/api.types";

const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  console.warn("VITE_API_URL is not set in client/.env");
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_STORAGE_KEY = "rv-foods-auth";

export const getStoredAccessToken = (): string | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else if (token) promise.resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post<ApiResponse<{ accessToken: string }>>(
        "/auth/refresh-token"
      );
      const newToken = data.data?.accessToken;

      if (!newToken) {
        throw new Error("No access token returned");
      }

      const { useAuthStore } = await import("@/store/authStore");
      useAuthStore.getState().setAccessToken(newToken);

      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      const { useAuthStore } = await import("@/store/authStore");
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiResponse>(error)) {
    // 1. Network / connectivity error (no response received from server)
    if (!error.response) {
      return "Something went wrong. Please try again later.";
    }

    const { status, data } = error.response;
    const msg = data?.message;
    const requestUrl = error.config?.url ?? "";

    // 2. Server-side internal error (5xx)
    if (status >= 500) {
      return "Something went wrong. Please try again later.";
    }

    // 3. Authentication & session expired errors (401)
    if (status === 401) {
      // Do not treat login or register credential failures as expired sessions
      if (
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register")
      ) {
        return msg || "Invalid email or password.";
      }

      // If refresh token failed or session is missing / expired
      return "Please log in to continue.";
    }

    // 4. Safe user-facing message from server for other expected 4xx errors
    if (typeof msg === "string" && msg.trim().length > 0) {
      const lower = msg.toLowerCase();
      // Filter out low-level technical jargon, stack traces, and internal strings
      if (
        lower.includes("refresh token") ||
        lower.includes("jwt") ||
        lower.includes("no api found") ||
        lower.includes("enotfound") ||
        lower.includes("econnrefused") ||
        lower.includes("cannot read properties") ||
        lower.includes("internal server error") ||
        lower.includes("mongo") ||
        lower.includes("node_modules")
      ) {
        return "Something went wrong. Please try again later.";
      }
      return msg;
    }

    return "Something went wrong. Please try again later.";
  }

  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes("network error") ||
      lower.includes("failed to fetch") ||
      lower.includes("no api found") ||
      lower.includes("load failed") ||
      lower.includes("no refresh token")
    ) {
      return lower.includes("refresh token")
        ? "Please log in to continue."
        : "Something went wrong. Please try again later.";
    }
    if (error.message === "Please log in to continue.") {
      return error.message;
    }
    return "Something went wrong. Please try again later.";
  }

  return "Something went wrong. Please try again later.";
};
