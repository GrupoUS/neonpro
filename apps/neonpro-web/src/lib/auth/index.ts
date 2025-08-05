/**
 * Auth Module Entry Point
 * Clean exports for production-ready Clerk integration
 */

// Re-export essential Clerk hooks and components for convenience
export {
  RedirectToSignIn,
  RedirectToSignUp,
  SignedIn,
  SignedOut,
  SignIn,
  SignOutButton,
  SignUp,
  UserButton,
  useAuth,
  useClerk,
  useSession,
  useUser,
} from "@clerk/nextjs";
// Re-export server utilities
export {
  auth,
  currentUser,
} from "@clerk/nextjs/server";
// Configuration
export { clerkConfig, healthcareAppearance, validateClerkConfig } from "./clerk-config";
// Session Management
export {
  ClerkSessionManager,
  type SessionMetadata,
  type SessionOptions,
  sessionManager,
} from "./simple-session-manager";
// Utilities and Helpers
export {
  type AuthResult,
  getAuth,
  getUserMetadata,
  type HealthcarePermission,
  HealthcarePermissions,
  type HealthcareRole,
  HealthcareRoles,
  hasPermission,
  hasRole,
  isProtectedRoute,
  isPublicRoute,
  requireAuth,
  requirePermission,
  requireRole,
} from "./utils";
