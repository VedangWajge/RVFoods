import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/common/Loader";

interface ProtectedRouteProps {
  children?: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader label="Checking session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
