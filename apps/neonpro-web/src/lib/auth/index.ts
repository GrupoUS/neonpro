/**
 * Auth Module Entry Point
 * Clean exports for production-ready Clerk integration
 */

// Configuration
export { clerkConfig, healthcareAppearance, validateClerkConfig } from './clerk-config';

// Session Management
export { 
  sessionManager,
  ClerkSessionManager,
  type SessionMetadata,
  type SessionOptions 
} from './simple-session-manager';

// Utilities and Helpers
export {
  getAuth,
  requireAuth,
  hasPermission,
  hasRole,
  requirePermission,
  requireRole,
  getUserMetadata,
  isProtectedRoute,
  isPublicRoute,
  HealthcareRoles,
  HealthcarePermissions,
  type AuthResult,
  type HealthcareRole,
  type HealthcarePermission
} from './utils';

// Re-export essential Clerk hooks and components for convenience
export {
  useAuth,
  useUser,
  useSession,
  useClerk,
  SignIn,
  SignUp,
  SignOutButton,
  UserButton,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  RedirectToSignUp
} from '@clerk/nextjs';

// Re-export server utilities
export {
  auth,
  currentUser
} from '@clerk/nextjs/server';
