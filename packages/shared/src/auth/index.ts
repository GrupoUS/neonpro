/**
 * NeonPro Authentication System - Export Index
 * Sistema completo de autenticação integrado com AuthTokenManager
 */

// Types
export type { AuthContext, } from '../types/hono.types'
// Middleware (Backend)
export {
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
} from './auth-middleware'
export {
  AuthProvider,
  type AuthProviderProps,
  useAuth,
  useAuthTokenHelpers,
  useCurrentUser,
  useIsAuthenticated,
} from './auth-provider'
// Core Authentication Manager
export {
  type AuthTokenData,
  AuthTokenManager,
  authTokenManager,
  type AuthTokens,
} from './auth-token-manager'
// Route Protection
export {
  ProtectedRoute,
  type ProtectedRouteProps,
  usePermissions,
  withAuth,
} from './protected-route'
// React Hooks and Context
export {
  type AuthState,
  type AuthUser,
  type LoginCredentials,
  type LoginResponse,
  useAuthToken,
} from './use-auth-token'

// Healthcare RBAC System (migrated from @neonpro/utils)
export { HealthcareRBAC, type Permission, type Role, } from './rbac'

// Healthcare Supabase Auth (migrated from @neonpro/utils)
export {
  type AuthConfig,
  createSupabaseAdminClient,
  createSupabaseClient,
  HealthcareAuth,
  type HealthcareUser,
} from './supabase'
