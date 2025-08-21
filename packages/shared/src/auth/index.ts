/**
 * NeonPro Authentication System - Export Index
 * Sistema completo de autenticação integrado com AuthTokenManager
 */

// Core Authentication Manager
export {
  AuthTokenManager,
  authTokenManager,
  type AuthTokens,
  type AuthTokenData,
} from './auth-token-manager';

// React Hooks and Context
export {
  useAuthToken,
  type AuthUser,
  type LoginCredentials,
  type LoginResponse,
  type AuthState,
} from './use-auth-token';

export {
  AuthProvider,
  useAuth,
  useIsAuthenticated,
  useCurrentUser,
  useAuthToken as useAuthTokenHook,
  type AuthProviderProps,
} from './auth-provider';

// Route Protection
export {
  ProtectedRoute,
  withAuth,
  usePermissions,
  type ProtectedRouteProps,
} from './protected-route';

// Middleware (Backend)
export {
  requireAuth,
  optionalAuth,
  requireRole,
  requirePermissions,
  requireTenant,
  protectedRoute,
  adminRoute,
  healthcareRoute,
  getAuthContext,
  getCurrentUser,
  type AuthContext,
} from './auth-middleware';

// Re-export AuthUser type for consistency
export type { AuthUser } from './use-auth-token';