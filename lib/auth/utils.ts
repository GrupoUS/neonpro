/**
 * Auth Utilities and Helper Functions
 * Production-ready utilities for Clerk integration
 */

import { auth, currentUser, redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { clerkConfig } from './clerk-config';
import { sessionManager } from './simple-session-manager';

export interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  sessionId?: string;
  user?: any;
  error?: string;
}

/**
 * Server-side authentication check
 * Use in Server Components and API routes
 */
export async function getAuth(): Promise<AuthResult> {
  try {
    const { userId, sessionId } = auth();
    
    if (!userId || !sessionId) {
      return { isAuthenticated: false };
    }

    const user = await currentUser();
    
    // Update session activity
    await sessionManager.updateSessionActivity(sessionId);
    
    return {
      isAuthenticated: true,
      userId,
      sessionId,
      user
    };
  } catch (error) {
    console.error('Auth check failed:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication check failed'
    };
  }
}

/**
 * Require authentication for a page/route
 * Redirects to sign-in if not authenticated
 */
export async function requireAuth(): Promise<AuthResult> {
  const authResult = await getAuth();
  
  if (!authResult.isAuthenticated) {
    return redirectToSignIn({
      returnBackUrl: clerkConfig.afterSignInUrl
    });
  }
  
  return authResult;
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const { sessionId } = auth();
    if (!sessionId) return false;
    
    return sessionManager.hasPermission(sessionId, permission);
  } catch {
    return false;
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const { sessionId } = auth();
    if (!sessionId) return false;
    
    return sessionManager.hasRole(sessionId, role);
  } catch {
    return false;
  }
}

/**
 * Require specific permission
 * Redirects to unauthorized page if permission not found
 */
export async function requirePermission(permission: string, unauthorizedUrl = '/unauthorized') {
  const authResult = await requireAuth();
  
  if (!await hasPermission(permission)) {
    redirect(unauthorizedUrl);
  }
  
  return authResult;
}

/**
 * Require specific role
 * Redirects to unauthorized page if role not found
 */
export async function requireRole(role: string, unauthorizedUrl = '/unauthorized') {
  const authResult = await requireAuth();
  
  if (!await hasRole(role)) {
    redirect(unauthorizedUrl);
  }
  
  return authResult;
}

/**
 * Get user metadata safely
 */
export async function getUserMetadata() {
  try {
    const user = await currentUser();
    
    return {
      publicMetadata: user?.publicMetadata || {},
      privateMetadata: user?.privateMetadata || {},
      unsafeMetadata: user?.unsafeMetadata || {}
    };
  } catch (error) {
    console.error('Failed to get user metadata:', error);
    return {
      publicMetadata: {},
      privateMetadata: {},
      unsafeMetadata: {}
    };
  }
}

/**
 * Check if route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return clerkConfig.protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Check if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return clerkConfig.publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Healthcare-specific role definitions
 */
export const HealthcareRoles = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
  TECHNICIAN: 'technician'
} as const;

/**
 * Healthcare-specific permission definitions
 */
export const HealthcarePermissions = {
  // Patient management
  VIEW_PATIENTS: 'view_patients',
  CREATE_PATIENTS: 'create_patients',
  EDIT_PATIENTS: 'edit_patients',
  DELETE_PATIENTS: 'delete_patients',
  
  // Appointment management
  VIEW_APPOINTMENTS: 'view_appointments',
  CREATE_APPOINTMENTS: 'create_appointments',
  EDIT_APPOINTMENTS: 'edit_appointments',
  DELETE_APPOINTMENTS: 'delete_appointments',
  
  // Medical records
  VIEW_MEDICAL_RECORDS: 'view_medical_records',
  CREATE_MEDICAL_RECORDS: 'create_medical_records',
  EDIT_MEDICAL_RECORDS: 'edit_medical_records',
  
  // Admin functions
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  SYSTEM_CONFIG: 'system_config',
  
  // Emergency access
  EMERGENCY_ACCESS: 'emergency_access'
} as const;

export type HealthcareRole = typeof HealthcareRoles[keyof typeof HealthcareRoles];
export type HealthcarePermission = typeof HealthcarePermissions[keyof typeof HealthcarePermissions];