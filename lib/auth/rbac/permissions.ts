/**
 * RBAC Permissions System for NeonPro
 * Story 1.2: Role-Based Access Control Implementation
 * 
 * This module provides comprehensive permission checking and validation
 * for the NeonPro application with multi-tenant support.
 */

import { UserRole, Permission, PermissionCheck, PermissionResult, DEFAULT_ROLES } from '@/types/rbac';
import { AuthUser } from '@/lib/middleware/auth';
import { createClient } from '@/app/utils/supabase/client';

// Export the class-based manager interface
export { RBACPermissionManager } from './rbac-manager';

/**
 * Permission validation cache for performance optimization
 */
const permissionCache = new Map<string, { result: PermissionResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clear expired cache entries
 */
function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of permissionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      permissionCache.delete(key);
    }
  }
}

/**
 * Generate cache key for permission check
 */
function getCacheKey(check: PermissionCheck): string {
  return `${check.userId}:${check.permission}:${check.clinicId}:${check.resourceId || 'global'}`;
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(
  user: AuthUser,
  permission: Permission,
  resourceId?: string,
  context?: Record<string, any>
): Promise<PermissionResult> {
  const check: PermissionCheck = {
    userId: user.id,
    permission,
    resourceId,
    clinicId: user.clinicId || '',
    context
  };

  // Check cache first
  const cacheKey = getCacheKey(check);
  const cached = permissionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  // Clear expired cache entries periodically
  if (Math.random() < 0.1) {
    clearExpiredCache();
  }

  const result = await validatePermission(check, user);
  
  // Cache the result
  permissionCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });

  return result;
}

/**
 * Core permission validation logic
 */
async function validatePermission(
  check: PermissionCheck,
  user: AuthUser
): Promise<PermissionResult> {
  try {
    // Get user role definition
    const roleDefinition = DEFAULT_ROLES[user.role as UserRole];
    if (!roleDefinition) {
      return {
        granted: false,
        reason: 'Invalid user role',
        roleUsed: user.role as UserRole
      };
    }

    // Check if role has the permission
    const hasRolePermission = roleDefinition.permissions.includes(check.permission);
    if (!hasRolePermission) {
      return {
        granted: false,
        reason: `Role '${user.role}' does not have permission '${check.permission}'`,
        roleUsed: user.role as UserRole,
        hierarchyLevel: roleDefinition.hierarchy
      };
    }

    // Check clinic-specific permissions if required
    if (check.clinicId && user.clinicId !== check.clinicId) {
      // Only admin and owner roles can access other clinics
      if (user.role !== 'owner' && user.role !== 'admin') {
        return {
          granted: false,
          reason: 'Access denied: Different clinic',
          roleUsed: user.role as UserRole,
          hierarchyLevel: roleDefinition.hierarchy
        };
      }
    }

    // Check resource-specific permissions
    if (check.resourceId) {
      const resourceAccess = await checkResourceAccess(check, user);
      if (!resourceAccess.granted) {
        return resourceAccess;
      }
    }

    // Log successful permission check for audit
    await logPermissionCheck(check, user, true);

    return {
      granted: true,
      roleUsed: user.role as UserRole,
      hierarchyLevel: roleDefinition.hierarchy,
      auditId: await generateAuditId()
    };

  } catch (error) {
    console.error('Permission validation error:', error);
    
    // Log failed permission check
    await logPermissionCheck(check, user, false);
    
    return {
      granted: false,
      reason: 'Permission validation failed',
      roleUsed: user.role as UserRole
    };
  }
}

/**
 * Check resource-specific access permissions
 */
async function checkResourceAccess(
  check: PermissionCheck,
  user: AuthUser
): Promise<PermissionResult> {
  // For patient data access, check if user can access specific patient
  if (check.permission.startsWith('patients.') && check.resourceId) {
    return await checkPatientAccess(check.resourceId, user);
  }

  // For appointment access, check if user can access specific appointment
  if (check.permission.startsWith('appointments.') && check.resourceId) {
    return await checkAppointmentAccess(check.resourceId, user);
  }

  // For financial data, check if user has financial permissions
  if (check.permission.startsWith('billing.') || check.permission.startsWith('payments.')) {
    return await checkFinancialAccess(user);
  }

  // Default: allow access if role has permission
  return { granted: true, roleUsed: user.role as UserRole };
}

/**
 * Check patient-specific access
 */
async function checkPatientAccess(
  patientId: string,
  user: AuthUser
): Promise<PermissionResult> {
  try {
    const supabase = createClient();
    
    // Check if patient belongs to user's clinic
    const { data: patient } = await supabase
      .from('patients')
      .select('clinic_id')
      .eq('id', patientId)
      .single();

    if (!patient) {
      return {
        granted: false,
        reason: 'Patient not found',
        roleUsed: user.role as UserRole
      };
    }

    if (patient.clinic_id !== user.clinicId && user.role !== 'admin') {
      return {
        granted: false,
        reason: 'Patient belongs to different clinic',
        roleUsed: user.role as UserRole
      };
    }

    return { granted: true, roleUsed: user.role as UserRole };
  } catch (error) {
    console.error('Patient access check failed:', error);
    return {
      granted: false,
      reason: 'Patient access validation failed',
      roleUsed: user.role as UserRole
    };
  }
}

/**
 * Check appointment-specific access
 */
async function checkAppointmentAccess(
  appointmentId: string,
  user: AuthUser
): Promise<PermissionResult> {
  try {
    const supabase = createClient();
    
    // Check if appointment belongs to user's clinic
    const { data: appointment } = await supabase
      .from('appointments')
      .select('clinic_id, patient_id, staff_id')
      .eq('id', appointmentId)
      .single();

    if (!appointment) {
      return {
        granted: false,
        reason: 'Appointment not found',
        roleUsed: user.role as UserRole
      };
    }

    if (appointment.clinic_id !== user.clinicId && user.role !== 'admin') {
      return {
        granted: false,
        reason: 'Appointment belongs to different clinic',
        roleUsed: user.role as UserRole
      };
    }

    // Staff can only access their own appointments
    if (user.role === 'staff' && appointment.staff_id !== user.id) {
      return {
        granted: false,
        reason: 'Staff can only access own appointments',
        roleUsed: user.role as UserRole
      };
    }

    return { granted: true, roleUsed: user.role as UserRole };
  } catch (error) {
    console.error('Appointment access check failed:', error);
    return {
      granted: false,
      reason: 'Appointment access validation failed',
      roleUsed: user.role as UserRole
    };
  }
}

/**
 * Check financial data access
 */
async function checkFinancialAccess(user: AuthUser): Promise<PermissionResult> {
  // Only owner, manager, and admin roles can access financial data
  const allowedRoles: UserRole[] = ['owner', 'manager', 'admin'];
  
  if (!allowedRoles.includes(user.role as UserRole)) {
    return {
      granted: false,
      reason: 'Insufficient role for financial data access',
      roleUsed: user.role as UserRole
    };
  }

  return { granted: true, roleUsed: user.role as UserRole };
}

/**
 * Log permission check for audit trail
 */
async function logPermissionCheck(
  check: PermissionCheck,
  user: AuthUser,
  granted: boolean
): Promise<void> {
  try {
    const supabase = createClient();
    
    await supabase.from('permission_audit_log').insert({
      user_id: check.userId,
      action: 'permission_check',
      permission: check.permission,
      resource_id: check.resourceId,
      clinic_id: check.clinicId,
      granted,
      role_used: user.role,
      ip_address: check.context?.ipAddress || 'unknown',
      user_agent: check.context?.userAgent || 'unknown',
      timestamp: new Date().toISOString(),
      metadata: check.context
    });
  } catch (error) {
    console.error('Failed to log permission check:', error);
  }
}

/**
 * Generate unique audit ID
 */
async function generateAuditId(): Promise<string> {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  user: AuthUser,
  permissions: Permission[],
  resourceId?: string,
  context?: Record<string, any>
): Promise<PermissionResult> {
  for (const permission of permissions) {
    const result = await hasPermission(user, permission, resourceId, context);
    if (result.granted) {
      return result;
    }
  }

  return {
    granted: false,
    reason: `User does not have any of the required permissions: ${permissions.join(', ')}`,
    roleUsed: user.role as UserRole
  };
}

/**
 * Check if user has all specified permissions
 */
export async function hasAllPermissions(
  user: AuthUser,
  permissions: Permission[],
  resourceId?: string,
  context?: Record<string, any>
): Promise<PermissionResult> {
  for (const permission of permissions) {
    const result = await hasPermission(user, permission, resourceId, context);
    if (!result.granted) {
      return {
        granted: false,
        reason: `Missing required permission: ${permission}`,
        roleUsed: user.role as UserRole
      };
    }
  }

  return {
    granted: true,
    roleUsed: user.role as UserRole
  };
}

/**
 * Clear permission cache for specific user
 */
export function clearUserPermissionCache(userId: string): void {
  for (const [key] of permissionCache.entries()) {
    if (key.startsWith(`${userId}:`)) {
      permissionCache.delete(key);
    }
  }
}

/**
 * Clear all permission cache
 */
export function clearAllPermissionCache(): void {
  permissionCache.clear();
}

/**
 * Get permission cache statistics
 */
export function getPermissionCacheStats(): {
  size: number;
  hitRate: number;
  entries: number;
} {
  return {
    size: permissionCache.size,
    hitRate: 0, // TODO: Implement hit rate tracking
    entries: permissionCache.size
  };
}