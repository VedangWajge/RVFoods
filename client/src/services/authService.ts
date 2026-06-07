import type { ApiResponse } from "@/types/api.types";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterPayload,
  ResetPasswordPayload,
  UserPublic,
  VerifyEmailPayload,
} from "@/types/user.types";
import { api } from "./api";

interface RegisterResponseData {
  user: UserPublic;
  devOtp?: string;
}

export const authService = {
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<ApiResponse<RegisterResponseData>>(
      "/auth/register",
      payload
    );
    return data;
  },

  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );
    return data;
  },

  logout: async () => {
    const { data } = await api.post<ApiResponse>("/auth/logout");
    return data;
  },

  refreshToken: async () => {
    const { data } = await api.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh-token"
    );
    return data;
  },

  verifyEmail: async (payload: VerifyEmailPayload) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/auth/verify-email",
      {
        email: payload.email.toLowerCase().trim(),
        otp: payload.otp.trim(),
      }
    );
    return data;
  },

  resendOtp: async (email: string) => {
    const { data } = await api.post<ApiResponse<{ devOtp?: string }>>(
      "/auth/resend-otp",
      { email: email.toLowerCase().trim() }
    );
    return data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload) => {
    const { data } = await api.post<ApiResponse>("/auth/forgot-password", payload);
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    const { data } = await api.post<ApiResponse>("/auth/reset-password", payload);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<{ user: UserPublic }>>("/auth/me");
    return data;
  },
};
