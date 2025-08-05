/**
 * RBAC Authorization Middleware for NeonPro
 * Story 1.2: Role-Based Access Control Implementation
 * 
 * This middleware provides route-level authorization based on roles and permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRole, Permission } from '@/types/rbac';
import { authenticateRequest, AuthUser } from '@/lib/middleware/auth';
import { hasPermission, hasAnyPermission, hasAllPermissions } from './permissions';

/**
 * Authorization configuration for routes
 */
export interface AuthorizationConfig {
  /** Required role (minimum role level) */
  requiredRole?: UserRole;
  /** Required permissions (user must have ALL) */
  requiredPermissions?: Permission[];
  /** Alternative permissions (user must have ANY) */
  anyPermissions?: Permission[];
  /** Resource ID extractor function */
  resourceIdExtractor?: (req: NextRequest) => string | undefined;
  /** Custom authorization logic */
  customCheck?: (user: AuthUser, req: NextRequest) => Promise<boolean>;
  /** Skip authorization for specific conditions */
  skipIf?: (req: NextRequest) => boolean;
}

/**
 * Authorization result
 */
export interface AuthorizationResult {
  authorized: boolean;
  user?: AuthUser;
  reason?: string;
  statusCode?: number;
}

/**
 * Role hierarchy levels for comparison
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  patient: 1,
  staff: 2,
  manager: 3,
  owner: 4
};

/**
 * Check if user has minimum required role level
 */
function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Main authorization middleware function
 */
export async function authorize(
  req: NextRequest,
  config: AuthorizationConfig
): Promise<AuthorizationResult> {
  try {
    // Skip authorization if condition is met
    if (config.skipIf && config.skipIf(req)) {
      return { authorized: true };
    }

    // Authenticate user first
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated || !authResult.user) {
      return {
        authorized: false,
        reason: 'Authentication required',
        statusCode: 401
      };
    }

    const user = authResult.user;
    const context = {
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
      path: req.nextUrl.pathname,
      method: req.method
    };

    // Check minimum role requirement
    if (config.requiredRole && !hasMinimumRole(user.role as UserRole, config.requiredRole)) {
      return {
        authorized: false,
        user,
        reason: `Minimum role '${config.requiredRole}' required, user has '${user.role}'`,
        statusCode: 403
      };
    }

    // Extract resource ID if needed
    const resourceId = config.resourceIdExtractor ? config.resourceIdExtractor(req) : undefined;

    // Check required permissions (ALL must be present)
    if (config.requiredPermissions && config.requiredPermissions.length > 0) {
      const permissionResult = await hasAllPermissions(
        user,
        config.requiredPermissions,
        resourceId,
        context
      );

      if (!permissionResult.granted) {
        return {
          authorized: false,
          user,
          reason: permissionResult.reason || 'Required permissions not met',
          statusCode: 403
        };
      }
    }

    // Check alternative permissions (ANY can be present)
    if (config.anyPermissions && config.anyPermissions.length > 0) {
      const permissionResult = await hasAnyPermission(
        user,
        config.anyPermissions,
        resourceId,
        context
      );

      if (!permissionResult.granted) {
        return {
          authorized: false,
          user,
          reason: permissionResult.reason || 'None of the alternative permissions met',
          statusCode: 403
        };
      }
    }

    // Run custom authorization check
    if (config.customCheck) {
      const customResult = await config.customCheck(user, req);
      if (!customResult) {
        return {
          authorized: false,
          user,
          reason: 'Custom authorization check failed',
          statusCode: 403
        };
      }
    }

    return {
      authorized: true,
      user
    };

  } catch (error) {
    console.error('Authorization middleware error:', error);
    return {
      authorized: false,
      reason: 'Authorization check failed',
      statusCode: 500
    };
  }
}

/**
 * Create authorization middleware for specific configuration
 */
export function createAuthorizationMiddleware(config: AuthorizationConfig) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const result = await authorize(req, config);
    
    if (!result.authorized) {
      return NextResponse.json(
        {
          error: 'Authorization failed',
          message: result.reason || 'Access denied',
          code: result.statusCode || 403
        },
        { status: result.statusCode || 403 }
      );
    }

    // Add user info to request headers for downstream handlers
    if (result.user) {
      const response = NextResponse.next();
      response.headers.set('x-user-id', result.user.id);
      response.headers.set('x-user-role', result.user.role);
      response.headers.set('x-clinic-id', result.user.clinicId || '');
      return response;
    }

    return NextResponse.next();
  };
}

/**
 * Helper function to extract patient ID from URL
 */
export function extractPatientId(req: NextRequest): string | undefined {
  const pathname = req.nextUrl.pathname;
  const match = pathname.match(/\/patients\/([^/]+)/);
  return match ? match[1] : undefined;
}

/**
 * Helper function to extract appointment ID from URL
 */
export function extractAppointmentId(req: NextRequest): string | undefined {
  const pathname = req.nextUrl.pathname;
  const match = pathname.match(/\/appointments\/([^/]+)/);
  return match ? match[1] : undefined;
}

/**
 * Helper function to extract clinic ID from URL
 */
export function extractClinicId(req: NextRequest): string | undefined {
  const pathname = req.nextUrl.pathname;
  const match = pathname.match(/\/clinics\/([^/]+)/);
  return match ? match[1] : undefined;
}

/**
 * Helper function to extract user ID from URL
 */
export function extractUserId(req: NextRequest): string | undefined {
  const pathname = req.nextUrl.pathname;
  const match = pathname.match(/\/users\/([^/]+)/);
  return match ? match[1] : undefined;
}

/**
 * Get client IP address from request
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const remoteAddr = req.headers.get('x-remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || remoteAddr || 'unknown';
}

/**
 * Pre-configured authorization middlewares for common use cases
 */
export const AuthMiddlewares = {
  /**
   * Require owner role
   */
  requireOwner: createAuthorizationMiddleware({
    requiredRole: 'owner'
  }),

  /**
   * Require manager role or higher
   */
  requireManager: createAuthorizationMiddleware({
    requiredRole: 'manager'
  }),

  /**
   * Require staff role or higher
   */
  requireStaff: createAuthorizationMiddleware({
    requiredRole: 'staff'
  }),

  /**
   * Patient data access (read)
   */
  patientRead: createAuthorizationMiddleware({
    anyPermissions: ['patients.read', 'patients.manage'],
    resourceIdExtractor: extractPatientId
  }),

  /**
   * Patient data management
   */
  patientManage: createAuthorizationMiddleware({
    requiredPermissions: ['patients.manage'],
    resourceIdExtractor: extractPatientId
  }),

  /**
   * Appointment access
   */
  appointmentAccess: createAuthorizationMiddleware({
    anyPermissions: ['appointments.read', 'appointments.manage'],
    resourceIdExtractor: extractAppointmentId
  }),

  /**
   * Financial data access
   */
  financialAccess: createAuthorizationMiddleware({
    anyPermissions: ['billing.read', 'billing.manage', 'payments.read', 'payments.manage']
  }),

  /**
   * System administration
   */
  systemAdmin: createAuthorizationMiddleware({
    requiredPermissions: ['system.admin']
  }),

  /**
   * Clinic management
   */
  clinicManage: createAuthorizationMiddleware({
    requiredPermissions: ['clinic.manage'],
    resourceIdExtractor: extractClinicId
  }),

  /**
   * User management
   */
  userManage: createAuthorizationMiddleware({
    requiredPermissions: ['users.manage'],
    resourceIdExtractor: extractUserId
  })
};

/**
 * Decorator for API route handlers with authorization
 */
export function withAuthorization(config: AuthorizationConfig) {
  return function (handler: (req: NextRequest, context: any) => Promise<NextResponse>) {
    return async (req: NextRequest, context: any): Promise<NextResponse> => {
      const authResult = await authorize(req, config);
      
      if (!authResult.authorized) {
        return NextResponse.json(
          {
            error: 'Authorization failed',
            message: authResult.reason || 'Access denied',
            code: authResult.statusCode || 403
          },
          { status: authResult.statusCode || 403 }
        );
      }

      // Add user to context
      context.user = authResult.user;
      
      return handler(req, context);
    };
  };
}

/**
 * Check authorization without middleware (for use in API routes)
 */
export async function checkAuthorization(
  req: NextRequest,
  config: AuthorizationConfig
): Promise<{ authorized: boolean; user?: AuthUser; error?: NextResponse }> {
  const result = await authorize(req, config);
  
  if (!result.authorized) {
    return {
      authorized: false,
      error: NextResponse.json(
        {
          error: 'Authorization failed',
          message: result.reason || 'Access denied',
          code: result.statusCode || 403
        },
        { status: result.statusCode || 403 }
      )
    };
  }

  return {
    authorized: true,
    user: result.user
  };
}
