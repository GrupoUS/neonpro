"use client";

import { AuthApiClient } from "@/lib/api-client";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  professionalLicense?: string;
  isEmailVerified: boolean;
  lgpdConsent: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: {
    email: string;
    password: string;
    tenantId: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode; }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Validate token with server
          try {
            await refreshToken();
          } catch {
            // Token invalid, clear auth
            await logout();
          }
        }
      } catch (error) {
        // console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: {
    email: string;
    password: string;
    tenantId: string;
  }) => {
    setLoading(true);
    try {
      const response = await AuthApiClient.login(credentials);

      if (!response.success) {
        throw new Error(response.error || "Login failed");
      }

      const { user: userData, tokens } = response.data;

      // Store auth data
      localStorage.setItem("authToken", tokens.accessToken);
      localStorage.setItem("authRefreshToken", tokens.refreshToken);
      localStorage.setItem("authUser", JSON.stringify(userData));

      setToken(tokens.accessToken);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await AuthApiClient.logout(token);
      }
    } catch (error) {
      // console.error("Logout error:", error);
    } finally {
      // Clear auth state regardless of API call success
      localStorage.removeItem("authToken");
      localStorage.removeItem("authRefreshToken");
      localStorage.removeItem("authUser");

      setToken(undefined);
      setUser(undefined);
    }
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem("authRefreshToken");

      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await AuthApiClient.refreshToken(storedRefreshToken);

      if (!response.success) {
        throw new Error("Token refresh failed");
      }

      const { tokens } = response.data;

      // Update stored tokens
      localStorage.setItem("authToken", tokens.accessToken);
      localStorage.setItem("authRefreshToken", tokens.refreshToken);

      setToken(tokens.accessToken);
    } catch (error) {
      // console.error("Token refresh error:", error);
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: Boolean(user) && Boolean(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
