import {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsVerified,
  selectAuthLoading,
  selectAuthError,
} from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAdmin = useAuthStore(selectIsAdmin);
  const isVerified = useAuthStore(selectIsVerified);
  const isLoading = useAuthStore(selectAuthLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const error = useAuthStore(selectAuthError);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  return {
    user,
    isAuthenticated,
    isAdmin,
    isVerified,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    verifyEmail,
    logout,
    clearError,
    initializeAuth,
    fetchMe,
  };
}
