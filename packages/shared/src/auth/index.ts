/**
 * NeonPro Authentication System - Export Index
 * Sistema completo de autenticação integrado com AuthTokenManager
 */

// Middleware (Backend)
export {
  type AuthContext,
  adminRoute,
  getAuthContext,
  getCurrentUser,
  healthcareRoute,
  optionalAuth,
  protectedRoute,
  requireAuth,
  requirePermissions,
  requireRole,
  requireTenant,
} from './auth-middleware';
export {
  AuthProvider,
  type AuthProviderProps,
  useAuth,
  useAuthToken as useAuthTokenHook,
  useCurrentUser,
  useIsAuthenticated,
} from './auth-provider';
// Core Authentication Manager
export {
  type AuthTokenData,
  AuthTokenManager,
  type AuthTokens,
  authTokenManager,
} from './auth-token-manager';

// Route Protection
export {
  ProtectedRoute,
  type ProtectedRouteProps,
  usePermissions,
  withAuth,
} from './protected-route';
// Re-export AuthUser type for consistency
export type { AuthUser } from './use-auth-token';
// React Hooks and Context
export {
  type AuthState,
  type AuthUser,
  type LoginCredentials,
  type LoginResponse,
  useAuthToken,
} from './use-auth-token';
