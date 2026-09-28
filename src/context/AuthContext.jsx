import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, ApiError } from "../api/client";

const AuthContext = createContext({
  user: null,
  permissions: [],
  isAuthenticated: false,
  mustResetPassword: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: () => {},
  refreshContext: async () => {},
  hasPermission: () => false,
  hasAnyPermission: () => false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [mustResetPassword, setMustResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserContext = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setPermissions([]);
      setMustResetPassword(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const ctx = await api.getMyContext();
      setUser(ctx);
      setPermissions(ctx.permissions || []);
      setMustResetPassword(Boolean(ctx.must_reset_password));
    } catch (err) {
      console.error("Context retrieval error:", err);
      // If unauthorized, clear tokens
      if (err.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
        setPermissions([]);
      } else {
        setError(err.message || "Failed to load user context");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserContext();
  }, [fetchUserContext]);

  const login = async (email, password) => {
    setError(null);
    const data = await api.login(email, password);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    // Fetch user context immediately after token acquisition
    const ctx = await api.getMyContext();
    setUser(ctx);
    setPermissions(ctx.permissions || []);
    setMustResetPassword(Boolean(ctx.must_reset_password));
    return ctx;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setPermissions([]);
    setMustResetPassword(false);
    setError(null);
  };

  const hasPermission = (permissionName) => {
    return permissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionNames = []) => {
    return permissionNames.some((p) => permissions.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isAuthenticated: Boolean(user),
        mustResetPassword,
        isLoading,
        error,
        login,
        logout,
        refreshContext: fetchUserContext,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
