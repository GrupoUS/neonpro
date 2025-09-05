// NeonPro MVP - Auth Module Main Exports

// Server-side auth functions
export { createClient, getUser, signOut } from './server'

// Auth verification
export { verifyAuth, requireAuth, requireRole } from './verify-auth'

// Permission system
export { 
  PERMISSIONS, 
  ROLE_PERMISSIONS, 
  hasPermission, 
  canAccessResource,
  type User,
  type UserRole,
  type Permission
} from './permissions'

// Patient-specific auth (if needed)
export * from './patient-auth'

// Re-export types for convenience
export interface AuthUser {
  id: string
  email: string
  role: UserRole
  professionalId?: string
  patientId?: string
  clinicId?: string
}

// Auth status type
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'