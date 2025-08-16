/**
 * Authentication Middleware for NeonPro API Routes
 * Handles JWT token verification and user role validation
 */

import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/client';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  clinicId?: string;
  permissions?: string[];
};

export type AuthResult = {
  success: boolean;
  user?: AuthUser;
  error?: string;
};

/**
 * JWT secret key for token verification
 */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

/**
 * Extract JWT token from request headers
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/);
  if (bearerMatch) {
    return bearerMatch[1];
  }

  return null;
}

/**
 * Verify JWT token and extract user information
 */
export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Validate required fields
    if (!(payload.sub && payload.email)) {
      return null;
    }

    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: (payload.role as string) || 'patient',
      clinicId: payload.clinicId as string | undefined,
      permissions: (payload.permissions as string[]) || [],
    };
  } catch (_error) {
    return null;
  }
}

/**
 * Get user session from Supabase
 */
export async function getSupabaseUser(
  _request: NextRequest
): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Get user profile for role and clinic information
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, clinic_id, permissions')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      role: profile?.role || 'patient',
      clinicId: profile?.clinic_id,
      permissions: profile?.permissions || [],
    };
  } catch (_error) {
    return null;
  }
}

/**
 * Authenticate request using multiple methods
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  // Try JWT token first
  const token = extractToken(request);
  if (token) {
    const user = await verifyAuthToken(token);
    if (user) {
      return { success: true, user };
    }
  }

  // Fallback to Supabase session
  const supabaseUser = await getSupabaseUser(request);
  if (supabaseUser) {
    return { success: true, user: supabaseUser };
  }

  return { success: false, error: 'Authentication required' };
}

/**
 * Check if user has required role
 */
export function hasRole(
  user: AuthUser,
  requiredRole: string | string[]
): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

/**
 * Check if user has required permission
 */
export function hasPermission(user: AuthUser, permission: string): boolean {
  if (!user.permissions) {
    return false;
  }

  return (
    user.permissions.includes(permission) || user.permissions.includes('*')
  );
}

/**
 * Role hierarchy for permission checking
 */
const ROLE_HIERARCHY = {
  admin: 5,
  clinic_owner: 4,
  manager: 3,
  staff: 2,
  patient: 1,
  trial_user: 0,
};

/**
 * Check if user role has sufficient level
 */
export function hasRoleLevel(user: AuthUser, minimumRole: string): boolean {
  const userLevel =
    ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] ?? 0;
  const requiredLevel =
    ROLE_HIERARCHY[minimumRole as keyof typeof ROLE_HIERARCHY] ?? 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if user can access clinic data
 */
export function canAccessClinic(user: AuthUser, clinicId: string): boolean {
  // Admin can access all clinics
  if (user.role === 'admin') {
    return true;
  }

  // User must belong to the clinic
  return user.clinicId === clinicId;
}

/**
 * Middleware function to authenticate API routes
 */
export function requireAuth(
  requiredRole?: string | string[],
  requiredPermission?: string
) {
  return async (request: NextRequest) => {
    const authResult = await authenticateRequest(request);

    if (!(authResult.success && authResult.user)) {
      return {
        authenticated: false,
        error: authResult.error || 'Authentication failed',
        status: 401,
      };
    }

    const user = authResult.user;

    // Check role requirement
    if (requiredRole && !hasRole(user, requiredRole)) {
      return {
        authenticated: false,
        error: 'Insufficient permissions',
        status: 403,
      };
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission(user, requiredPermission)) {
      return {
        authenticated: false,
        error: 'Required permission not found',
        status: 403,
      };
    }

    return {
      authenticated: true,
      user,
    };
  };
}
