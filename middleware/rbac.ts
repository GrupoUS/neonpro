// RBAC Middleware for Route Protection
// Story 1.2: Role-Based Permissions Enhancement

import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { rbacManager } from '@/lib/auth/rbac/permissions';
import { Permission } from '@/types/rbac';

/**
 * RBAC Middleware Configuration
 */
interface RBACConfig {
  permission: Permission;
  requireClinicContext?: boolean;
  allowSelfAccess?: boolean; // For patient accessing own data
  customValidator?: (req: NextRequest, userId: string, clinicId?: string) => Promise<boolean>;
}

/**
 * Route-to-Permission mapping
 */
const ROUTE_PERMISSIONS: Record<string, RBACConfig> = {
  // User Management Routes
  '/api/users': {
    permission: 'users.read',
    requireClinicContext: true
  },
  '/api/users/create': {
    permission: 'users.create',
    requireClinicContext: true
  },
  '/api/users/[id]': {
    permission: 'users.update',
    requireClinicContext: true,
    allowSelfAccess: true
  },
  '/api/users/[id]/delete': {
    permission: 'users.delete',
    requireClinicContext: true
  },
  
  // Patient Management Routes
  '/api/patients': {
    permission: 'patients.read',
    requireClinicContext: true
  },
  '/api/patients/create': {
    permission: 'patients.create',
    requireClinicContext: true
  },
  '/api/patients/[id]': {
    permission: 'patients.read',
    requireClinicContext: true,
    allowSelfAccess: true
  },
  '/api/patients/[id]/medical-records': {
    permission: 'patients.medical_records.read',
    requireClinicContext: true,
    allowSelfAccess: true
  },
  
  // Appointment Management Routes
  '/api/appointments': {
    permission: 'appointments.read',
    requireClinicContext: true
  },
  '/api/appointments/create': {
    permission: 'appointments.create',
    requireClinicContext: true
  },
  '/api/appointments/[id]': {
    permission: 'appointments.read',
    requireClinicContext: true,
    allowSelfAccess: true
  },
  '/api/appointments/[id]/reschedule': {
    permission: 'appointments.reschedule',
    requireClinicContext: true,
    allowSelfAccess: true
  },
  
  // Financial Management Routes
  '/api/billing': {
    permission: 'billing.read',
    requireClinicContext: true
  },
  '/api/billing/create': {
    permission: 'billing.create',
    requireClinicContext: true
  },
  '/api/payments/process': {
    permission: 'payments.process',
    requireClinicContext: true
  },
  '/api/reports/financial': {
    permission: 'financial_reports.read',
    requireClinicContext: true
  },
  
  // System Administration Routes
  '/api/admin/settings': {
    permission: 'system.settings.read',
    requireClinicContext: true
  },
  '/api/admin/users': {
    permission: 'system.users.manage',
    requireClinicContext: true
  },
  '/api/admin/roles': {
    permission: 'system.roles.manage',
    requireClinicContext: true
  },
  '/api/admin/audit': {
    permission: 'system.audit.read',
    requireClinicContext: true
  },
  
  // Clinic Management Routes
  '/api/clinic/settings': {
    permission: 'clinic.settings.read',
    requireClinicContext: true
  },
  '/api/clinic/staff': {
    permission: 'clinic.staff.manage',
    requireClinicContext: true
  },
  '/api/clinic/reports': {
    permission: 'clinic.reports.read',
    requireClinicContext: true
  },
  
  // Data & Privacy Routes
  '/api/data/export': {
    permission: 'data.export',
    requireClinicContext: true
  },
  '/api/lgpd/compliance': {
    permission: 'lgpd.compliance.manage',
    requireClinicContext: true
  }
};

/**
 * Create RBAC middleware for specific permission
 */
export function createRBACMiddleware(config: RBACConfig) {
  return async (req: NextRequest) => {
    try {
      // Create Supabase client
      const res = NextResponse.next();
      const supabase = createMiddlewareClient({ req, res });
      
      // Get user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized - No valid session' },
          { status: 401 }
        );
      }
      
      const userId = session.user.id;
      
      // Extract clinic context if required
      let clinicId: string | undefined;
      
      if (config.requireClinicContext) {
        clinicId = extractClinicId(req);
        
        if (!clinicId) {
          return NextResponse.json(
            { error: 'Bad Request - Clinic context required' },
            { status: 400 }
          );
        }
      }
      
      // Check for self-access scenarios (patients accessing own data)
      if (config.allowSelfAccess) {
        const resourceOwnerId = extractResourceOwnerId(req);
        
        if (resourceOwnerId === userId) {
          // User is accessing their own resource - allow with basic permission check
          const hasBasicPermission = await rbacManager.checkPermission({
            userId,
            permission: config.permission,
            clinicId: clinicId!,
            context: {
              ipAddress: getClientIP(req),
              userAgent: req.headers.get('user-agent') || 'unknown'
            }
          });
          
          if (hasBasicPermission.granted) {
            return res;
          }
        }
      }
      
      // Custom validation if provided
      if (config.customValidator) {
        const customResult = await config.customValidator(req, userId, clinicId);
        
        if (!customResult) {
          return NextResponse.json(
            { error: 'Forbidden - Custom validation failed' },
            { status: 403 }
          );
        }
      }
      
      // Main permission check
      const permissionResult = await rbacManager.checkPermission({
        userId,
        permission: config.permission,
        resourceId: extractResourceOwnerId(req),
        clinicId: clinicId!,
        context: {
          ipAddress: getClientIP(req),
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      });
      
      if (!permissionResult.granted) {
        return NextResponse.json(
          { 
            error: 'Forbidden - Insufficient permissions',
            details: permissionResult.reason,
            required_permission: config.permission
          },
          { status: 403 }
        );
      }
      
      // Add permission context to request headers for downstream use
      res.headers.set('x-user-id', userId);
      res.headers.set('x-user-role', permissionResult.roleUsed || 'unknown');
      res.headers.set('x-clinic-id', clinicId || '');
      res.headers.set('x-permission-granted', config.permission);
      res.headers.set('x-audit-id', permissionResult.auditId || '');
      
      return res;
      
    } catch (error) {
      console.error('RBAC Middleware error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error - Permission check failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Extract clinic ID from request
 */
function extractClinicId(req: NextRequest): string | undefined {
  // Try URL parameters first
  const url = new URL(req.url);
  const clinicIdFromQuery = url.searchParams.get('clinicId');
  
  if (clinicIdFromQuery) {
    return clinicIdFromQuery;
  }
  
  // Try request headers
  const clinicIdFromHeader = req.headers.get('x-clinic-id');
  
  if (clinicIdFromHeader) {
    return clinicIdFromHeader;
  }
  
  // Try to extract from path parameters
  const pathSegments = url.pathname.split('/');
  const clinicIndex = pathSegments.findIndex(segment => segment === 'clinic');
  
  if (clinicIndex !== -1 && pathSegments[clinicIndex + 1]) {
    return pathSegments[clinicIndex + 1];
  }
  
  return undefined;
}

/**
 * Extract resource owner ID from request
 */
function extractResourceOwnerId(req: NextRequest): string | undefined {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/');
  
  // Look for ID patterns in URL
  const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  for (const segment of pathSegments) {
    if (idPattern.test(segment)) {
      return segment;
    }
  }
  
  // Try query parameters
  const userIdFromQuery = url.searchParams.get('userId') || url.searchParams.get('patientId');
  
  if (userIdFromQuery && idPattern.test(userIdFromQuery)) {
    return userIdFromQuery;
  }
  
  return undefined;
}

/**
 * Get client IP address
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

/**
 * Get route configuration for current path
 */
export function getRouteConfig(pathname: string): RBACConfig | undefined {
  // Direct match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }
  
  // Pattern matching for dynamic routes
  for (const [pattern, config] of Object.entries(ROUTE_PERMISSIONS)) {
    if (matchesPattern(pathname, pattern)) {
      return config;
    }
  }
  
  return undefined;
}

/**
 * Check if pathname matches a route pattern
 */
function matchesPattern(pathname: string, pattern: string): boolean {
  // Convert Next.js pattern to regex
  const regexPattern = pattern
    .replace(/\[\w+\]/g, '[^/]+') // Replace [id] with regex for any non-slash characters
    .replace(/\//g, '\\/'); // Escape forward slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

/**
 * Middleware factory for common permission patterns
 */
export const rbacMiddleware = {
  /**
   * Require specific permission
   */
  requirePermission: (permission: Permission, requireClinicContext = true) => 
    createRBACMiddleware({ permission, requireClinicContext }),
  
  /**
   * Allow self-access or specific permission
   */
  allowSelfOrPermission: (permission: Permission, requireClinicContext = true) => 
    createRBACMiddleware({ permission, requireClinicContext, allowSelfAccess: true }),
  
  /**
   * Owner or manager only
   */
  ownerOrManagerOnly: () => 
    createRBACMiddleware({ 
      permission: 'system.settings.read', // High-level permission
      requireClinicContext: true,
      customValidator: async (req, userId, clinicId) => {
        if (!clinicId) return false;
        
        const userRole = await rbacManager.getUserRole(userId, clinicId);
        if (!userRole) return false;
        
        const roleDefinition = await rbacManager.getRoleDefinition(userRole.roleId);
        return roleDefinition?.hierarchy <= 2; // Owner (1) or Manager (2)
      }
    }),
  
  /**
   * Staff and above (excludes patients)
   */
  staffAndAbove: () => 
    createRBACMiddleware({ 
      permission: 'users.read', // Basic staff permission
      requireClinicContext: true,
      customValidator: async (req, userId, clinicId) => {
        if (!clinicId) return false;
        
        const userRole = await rbacManager.getUserRole(userId, clinicId);
        if (!userRole) return false;
        
        const roleDefinition = await rbacManager.getRoleDefinition(userRole.roleId);
        return roleDefinition?.hierarchy <= 3; // Owner (1), Manager (2), or Staff (3)
      }
    })
};

/**
 * Export route permissions for reference
 */
export { ROUTE_PERMISSIONS };
