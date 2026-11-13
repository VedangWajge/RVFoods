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
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (
    payload: RegisterPayload
  ) => Promise<{ email: string }>;
  verifyEmail: (payload: VerifyEmailPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

// How long a protected page waits to learn whether the saved session is valid.
const AUTH_INIT_TIMEOUT_MS = 8000;

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

        const { accessToken, user } = get();

        // This browser has never signed in (or has signed out): there is no
        // session to restore, so don't make a network call at all.
        if (!accessToken && !user) {
          set({ isInitialized: true });
          return;
        }

        set({ isLoading: true });

        const restore = async () => {
          if (accessToken) {
            const me = await authService.getMe();
            if (me.data?.user) {
              set(setSession(me.data.user, accessToken));
              return;
            }
          }

          const refreshed = await authService.refreshToken();
          const newToken = refreshed.data?.accessToken;

          if (newToken) {
            const me = await authService.getMe();
            if (me.data?.user) {
              set(setSession(me.data.user, newToken));
              return;
            }
          }

          get().clearAuth();
        };

        let timer: ReturnType<typeof setTimeout> | undefined;

        try {
          // A slow server isn't proof the session is invalid: on timeout keep
          // the stored session and let the next request settle it.
          await Promise.race([
            restore(),
            new Promise<void>((resolve) => {
              timer = setTimeout(resolve, AUTH_INIT_TIMEOUT_MS);
            }),
          ]);
        } catch {
          get().clearAuth();
        } finally {
          clearTimeout(timer);
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

      loginWithGoogle: async (credential) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.googleLogin(credential);
          const payload = response.data;

          if (!payload?.accessToken || !payload?.user) {
            throw new Error(response.message || "Google sign-in failed");
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
          return { email: response.data.user.email };
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
