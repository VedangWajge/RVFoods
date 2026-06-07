import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import Loader from "./Loader";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader size="lg" label="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}
