// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return (
      <div style={{ padding: "2rem" }}>
        You don&apos;t have permission to access this dashboard.
      </div>
    );
  }

  return <>{children}</>;
}