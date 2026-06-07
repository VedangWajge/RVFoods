import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LoginCredentials,
  RegisterPayload,
  UserPublic,
  VerifyEmailPayload,
} from "@/types/user.types";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/services/api";

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  setAccessToken: (token: string) => void;
  setUser: (user: UserPublic) => void;
  clearAuth: () => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (
    payload: RegisterPayload
  ) => Promise<{ email: string; devOtp?: string }>;
  verifyEmail: (payload: VerifyEmailPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

const setSession = (
  user: UserPublic,
  accessToken: string
): Pick<AuthState, "user" | "accessToken" | "isAuthenticated"> => ({
  user,
  accessToken,
  isAuthenticated: true,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false,
      error: null,

      setAccessToken: (accessToken) => set({ accessToken }),

      setUser: (user) => set({ user, isAuthenticated: true }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null,
        }),

      clearError: () => set({ error: null }),

      initializeAuth: async () => {
        if (get().isInitialized || get().isLoading) return;

        set({ isLoading: true });

        try {
          const { accessToken } = get();

          if (accessToken) {
            const me = await authService.getMe();
            if (me.data?.user) {
              set({
                ...setSession(me.data.user, accessToken),
                isInitialized: true,
                isLoading: false,
              });
              return;
            }
          }

          const refreshed = await authService.refreshToken();
          const newToken = refreshed.data?.accessToken;

          if (newToken) {
            const me = await authService.getMe();
            if (me.data?.user) {
              set({
                ...setSession(me.data.user, newToken),
                isInitialized: true,
                isLoading: false,
              });
              return;
            }
          }

          get().clearAuth();
        } catch {
          get().clearAuth();
        } finally {
          set({ isInitialized: true, isLoading: false });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({
            email: credentials.email.toLowerCase().trim(),
            password: credentials.password,
          });
          const payload = response.data;

          if (!payload?.accessToken || !payload?.user) {
            throw new Error(response.message || "Login failed");
          }

          set({
            ...setSession(payload.user, payload.accessToken),
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({
            ...payload,
            email: payload.email.toLowerCase().trim(),
          });

          if (!response.data?.user?.email) {
            throw new Error(response.message || "Registration failed");
          }

          set({ isLoading: false });
          return {
            email: response.data.user.email,
            devOtp: response.data.devOtp,
          };
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }
      },

      verifyEmail: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.verifyEmail(payload);
          const data = response.data;

          if (!data?.accessToken || !data?.user) {
            throw new Error(response.message || "Verification failed");
          }

          set({
            ...setSession(data.user, data.accessToken),
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.logout();
        } catch {
          // clear local session even if API fails
        } finally {
          get().clearAuth();
          set({ isLoading: false });
        }
      },

      fetchMe: async () => {
        try {
          const response = await authService.getMe();
          if (response.data?.user && get().accessToken) {
            set({ user: response.data.user, isAuthenticated: true });
          }
        } catch {
          get().clearAuth();
        }
      },
    }),
    {
      name: "rv-foods-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsAdmin = (state: AuthState) => state.user?.role === "admin";
export const selectIsVerified = (state: AuthState) =>
  Boolean(state.user?.isVerified);
export const selectAuthLoading = (state: AuthState) => state.isLoading;
export const selectAuthError = (state: AuthState) => state.error;
