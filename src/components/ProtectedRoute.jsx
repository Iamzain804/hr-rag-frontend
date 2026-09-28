import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

export function ProtectedRoute({ children, requiredPermission = null }) {
  const { isAuthenticated, mustResetPassword, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <LoadingSpinner message="Verifying authentication & permissions..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Force password reset if must_reset_password is true
  if (mustResetPassword && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  // Check granular permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="p-8 bg-bg min-h-screen text-text-primary flex flex-col items-center justify-center">
        <div className="max-w-md p-6 bg-surface border border-border rounded-sm text-center">
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="text-sm text-text-secondary mb-4">
            Your assigned role does not possess the <code className="font-mono font-bold">"{requiredPermission}"</code> permission required to view this section.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-btn-bg text-btn-text text-sm font-semibold rounded-sm hover:opacity-90"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
