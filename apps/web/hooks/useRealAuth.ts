/**
 * React Hook for Real Authentication
 *
 * Provides authentication state management and methods using RealAuthService
 */

import {
  type LoginCredentials,
  type LoginResult,
  RealAuthService,
  type User,
} from "@neonpro/security";
import { useCallback, useEffect, useState } from "react";

// Authentication state interface
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Authentication methods interface
export interface AuthMethods {
  login: (credentials: Omit<LoginCredentials, "deviceInfo">) => Promise<LoginResult>;
  register: (userData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }) => Promise<LoginResult>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

// Hook return type
export interface UseRealAuthReturn extends AuthState, AuthMethods {}

// Get device info for security tracking
function getDeviceInfo() {
  return {
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
    ip: "127.0.0.1", // Will be determined server-side
    fingerprint: typeof window !== "undefined"
      ? btoa(window.navigator.userAgent + window.screen.width + window.screen.height)
      : "",
    trusted: false,
  };
}

// Singleton auth service instance
let authServiceInstance: RealAuthService | null = null;

function getAuthService(): RealAuthService {
  if (!authServiceInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const jwtSecret = process.env.JWT_SECRET || "fallback-dev-secret";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    authServiceInstance = new RealAuthService(supabaseUrl, supabaseKey, jwtSecret);
  }

  return authServiceInstance;
}

export function useRealAuth(): UseRealAuthReturn {
  // State management
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Get auth service instance
  const authService = getAuthService();

  // Update authentication state
  const setAuthState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error message
  const clearError = useCallback(() => {
    setAuthState({ error: null });
  }, [setAuthState]);

  // Login method
  const login = useCallback(
    async (credentials: Omit<LoginCredentials, "deviceInfo">): Promise<LoginResult> => {
      setAuthState({ isLoading: true, error: null });

      try {
        const result = await authService.login({
          ...credentials,
          deviceInfo: getDeviceInfo(),
        });

        if (result.success && result.user) {
          setAuthState({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store tokens for persistence (optional)
          if (typeof window !== "undefined") {
            if (result.accessToken) {
              localStorage.setItem("neonpro_access_token", result.accessToken);
            }
            if (result.refreshToken) {
              localStorage.setItem("neonpro_refresh_token", result.refreshToken);
            }
            if (result.sessionId) {
              localStorage.setItem("neonpro_session_id", result.sessionId);
            }
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: result.error || "Login failed",
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Login failed";
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });

        return { success: false, error: errorMessage };
      }
    },
    [authService, setAuthState],
  );

  // Register method
  const register = useCallback(async (userData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }): Promise<LoginResult> => {
    setAuthState({ isLoading: true, error: null });

    try {
      const result = await authService.register(userData);

      if (result.success) {
        setAuthState({
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          isLoading: false,
          error: result.error || "Registration failed",
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setAuthState({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }, [authService, setAuthState]);

  // Logout method
  const logout = useCallback(async (): Promise<void> => {
    setAuthState({ isLoading: true });

    try {
      // Get session ID from storage
      const sessionId = typeof window !== "undefined"
        ? localStorage.getItem("neonpro_session_id")
        : null;

      if (sessionId) {
        await authService.logout(sessionId);
      }

      // Clear stored tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("neonpro_access_token");
        localStorage.removeItem("neonpro_refresh_token");
        localStorage.removeItem("neonpro_session_id");
      }

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Logout error:", error);

      // Even if logout fails, clear local state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [authService, setAuthState]);

  // Refresh authentication state
  const refreshAuth = useCallback(async (): Promise<void> => {
    setAuthState({ isLoading: true });

    try {
      // Try to get current user
      const currentUser = await authService.getCurrentUser();

      if (currentUser) {
        setAuthState({
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Try refresh token if available
        const refreshToken = typeof window !== "undefined"
          ? localStorage.getItem("neonpro_refresh_token")
          : null;

        if (refreshToken) {
          const result = await authService.refreshToken(refreshToken);

          if (result.success && result.user) {
            setAuthState({
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Update stored tokens
            if (typeof window !== "undefined") {
              if (result.accessToken) {
                localStorage.setItem("neonpro_access_token", result.accessToken);
              }
              if (result.refreshToken) {
                localStorage.setItem("neonpro_refresh_token", result.refreshToken);
              }
            }
          } else {
            // Refresh failed, clear everything
            if (typeof window !== "undefined") {
              localStorage.removeItem("neonpro_access_token");
              localStorage.removeItem("neonpro_refresh_token");
              localStorage.removeItem("neonpro_session_id");
            }

            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      }
    } catch (error) {
      console.error("Auth refresh error:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [authService, setAuthState]);

  // Initialize authentication state on mount
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Auto-refresh on visibility change (user returns to tab)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (!document.hidden && state.isAuthenticated) {
        refreshAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [state.isAuthenticated, refreshAuth]);

  return {
    // State
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,

    // Methods
    login,
    register,
    logout,
    clearError,
    refreshAuth,
  };
}
