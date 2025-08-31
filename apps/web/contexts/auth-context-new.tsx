"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

// API Base URL - should be from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Types
interface User {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  role: string;
  professional_title?: string;
  medical_license?: string;
  department?: string;
  avatar_url?: string;
  phone?: string;
}

interface Session {
  session_id: string;
  last_activity: string;
  expires_at: string;
}

interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
  user?: User;
  session_id?: string;
  access_token?: string;
  expires_in?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  signUp: (userData: {
    email: string;
    password: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    professional_title?: string;
    medical_license?: string;
    department?: string;
    phone?: string;
    role?: string;
  }) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  resetPasswordWithToken: (
    accessToken: string,
    refreshToken: string,
    newPassword: string,
  ) => Promise<AuthResponse>;
  refreshAuth: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// API Helper functions
class AuthAPI {
  private static async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}/auth${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token && !defaultOptions.headers?.["Authorization"]) {
      (defaultOptions.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return { success: true, ...data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error occurred",
      };
    }
  }

  static async login(email: string, password: string, rememberMe = false): Promise<AuthResponse> {
    const response = await this.makeRequest("/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });

    if (response.success && response.access_token) {
      localStorage.setItem("auth_token", response.access_token);
      localStorage.setItem("user_data", JSON.stringify(response.user));
    }

    return response;
  }

  static async register(userData: any): Promise<AuthResponse> {
    return await this.makeRequest("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  static async logout(): Promise<AuthResponse> {
    const response = await this.makeRequest("/logout", {
      method: "POST",
    });

    // Clear local storage regardless of API response
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");

    return response;
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    return await this.makeRequest("/me");
  }

  static async forgotPassword(email: string): Promise<AuthResponse> {
    return await this.makeRequest("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  static async resetPassword(
    accessToken: string,
    refreshToken: string,
    newPassword: string,
  ): Promise<AuthResponse> {
    return await this.makeRequest("/reset-password", {
      method: "POST",
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        new_password: newPassword,
      }),
    });
  }

  static async verifyToken(token?: string): Promise<AuthResponse> {
    return await this.makeRequest("/verify-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  static async getSessions(): Promise<AuthResponse> {
    return await this.makeRequest("/sessions");
  }

  static async revokeSession(sessionId: string): Promise<AuthResponse> {
    return await this.makeRequest(`/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!user && !!session;

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);

      // Check if we have a token
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user data
      const response = await AuthAPI.getCurrentUser();

      if (response.success && response.user) {
        setUser(response.user);
        setSession(response.session);
        localStorage.setItem("user_data", JSON.stringify(response.user));
      } else {
        // Token is invalid, clear it
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // Clear potentially invalid tokens
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<AuthResponse> => {
    try {
      setLoading(true);

      const response = await AuthAPI.login(email, password, rememberMe);

      if (response.success && response.user) {
        setUser(response.user);
        if (response.session_id) {
          setSession({
            session_id: response.session_id,
            last_activity: new Date().toISOString(),
            expires_at: new Date(Date.now() + (response.expires_in || 86_400) * 1000).toISOString(),
          });
        }

        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      }

      return response;
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: any): Promise<AuthResponse> => {
    try {
      setLoading(true);

      const response = await AuthAPI.register(userData);

      return response;
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);

      // Call API to logout (handles session cleanup)
      await AuthAPI.logout();

      // Clear local state
      setUser(null);
      setSession(null);

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      // Clear local state even if API fails
      setUser(null);
      setSession(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      return await AuthAPI.forgotPassword(email);
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Reset password failed",
      };
    }
  };

  const resetPasswordWithToken = async (
    accessToken: string,
    refreshToken: string,
    newPassword: string,
  ): Promise<AuthResponse> => {
    try {
      return await AuthAPI.resetPassword(accessToken, refreshToken, newPassword);
    } catch (error) {
      console.error("Reset password with token error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Password reset failed",
      };
    }
  };

  const refreshAuth = async (): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      const response = await AuthAPI.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
        setSession(response.session);
      } else {
        // Session expired, sign out
        await signOut();
      }
    } catch (error) {
      console.error("Auth refresh error:", error);
      await signOut();
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return false;

      const response = await AuthAPI.verifyToken(token);
      return response.valid === true;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  };

  // Auto-refresh auth every 5 minutes if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshAuth();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle page visibility change to refresh auth
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        refreshAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resetPasswordWithToken,
    refreshAuth,
    verifyToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
