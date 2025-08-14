/**
 * Middleware Module Export
 * Centralized exports for middleware functionality
 */

export * from './auth';

// Re-export commonly used items
export {
  authenticateRequest,
  verifyAuthToken,
  getSupabaseUser,
  requireAuth,
  hasRole,
  hasPermission,
  hasRoleLevel,
  canAccessClinic
} from './auth';

export type {
  AuthUser,
  AuthResult
} from './auth';