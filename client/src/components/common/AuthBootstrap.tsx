import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Restores the saved session in the background. Public pages render straight
 * away; only ProtectedRoute waits for `isInitialized`.
 */
export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
