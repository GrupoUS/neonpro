/**
 * Middleware Module Export
 * Centralized exports for middleware functionality
 */

export type {
  AuthResult,
  AuthUser,
} from './auth';
export * from './auth';
// Re-export commonly used items
export {
  authenticateRequest,
  canAccessClinic,
  getSupabaseUser,
  hasPermission,
  hasRole,
  hasRoleLevel,
  requireAuth,
  verifyAuthToken,
} from './auth';
