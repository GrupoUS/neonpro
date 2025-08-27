/**
 * Auth Hooks - React hooks for authentication
 * @package @neonpro/auth
 */

import type { ReactNode } from "react";
import type { AuthService, User } from "../types";

// Auth context types
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string; }) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthProviderProps {
  children: ReactNode;
  authService?: AuthService;
}

// Hook return types
export interface UseAuthReturn extends AuthContextValue {}

export interface UseLoginReturn {
  login: (credentials: { email: string; password: string; }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface UseRegisterReturn {
  register: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface UseLogoutReturn {
  logout: () => Promise<void>;
  loading: boolean;
}

// Context factory type
export interface AuthContextFactory {
  createAuthContext: () => React.Context<AuthContextValue | null>;
  createAuthProvider: (props: AuthProviderProps) => React.ReactElement;
}

// Hook factory types
export interface AuthHookFactory {
  useAuth: () => UseAuthReturn;
  useLogin: () => UseLoginReturn;
  useRegister: () => UseRegisterReturn;
  useLogout: () => UseLogoutReturn;
}

// Default context (to be implemented in frontend)
export let AuthContext: React.Context<AuthContextValue | null> | null;

// Context registration utility
export function registerAuthContext(
  context: React.Context<AuthContextValue | null>,
) {
  AuthContext = context;
}

// Hook utilities and validators
export const validateAuthCredentials = (credentials: {
  email: string;
  password: string;
}): boolean => {
  return (
    credentials
    && typeof credentials.email === "string"
    && credentials.email.includes("@")
    && typeof credentials.password === "string"
    && credentials.password.length >= 6
  );
};

export const validateRegisterData = (data: {
  email: string;
  password: string;
  name: string;
}): boolean => {
  return (
    validateAuthCredentials(data)
    && typeof data.name === "string"
    && data.name.trim().length > 0
  );
};

// Auth state helpers
export const createInitialAuthState = (): Omit<
  AuthContextValue,
  "login" | "logout" | "register"
> => ({
  user: undefined,
  loading: false,
  isAuthenticated: false,
  error: undefined,
});

// Session management types
export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface SessionManager {
  getSession: () => SessionData | null;
  setSession: (session: SessionData) => void;
  clearSession: () => void;
  isSessionValid: () => boolean;
  refreshSession: () => Promise<SessionData | null>;
}

// Local storage keys
export const AUTH_STORAGE_KEYS = {
  SESSION: "neonpro_auth_session",
  USER: "neonpro_auth_user",
  PREFERENCES: "neonpro_auth_preferences",
} as const;

// Hook configuration
export interface AuthHookConfig {
  autoRefresh?: boolean;
  refreshInterval?: number;
  persistSession?: boolean;
  requireAuth?: boolean;
}

export const DEFAULT_AUTH_CONFIG: AuthHookConfig = {
  autoRefresh: true,
  refreshInterval: 15 * 60 * 1000, // 15 minutes
  persistSession: true,
  requireAuth: false,
};
