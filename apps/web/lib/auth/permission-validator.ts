/**
 * Permission Validation System
 * Comprehensive role-based access control with fine-grained permissions
 */

import { createClient } from '@/app/utils/supabase/client';
import { performanceTracker } from './performance-tracker';
import { securityAuditLogger } from './security-audit-logger';

export type Permission = {
  id: string;
  name: string;
  resource: string;
  action: PermissionAction;
  conditions?: PermissionCondition[];
  description: string;
};

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'unassign'
  | 'manage';

export type PermissionCondition = {
  type: 'time' | 'location' | 'resource_owner' | 'clinic_member' | 'custom';
  operator:
    | 'equals'
    | 'not_equals'
    | 'in'
    | 'not_in'
    | 'greater_than'
    | 'less_than';
  value: any;
  field?: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  clinicId?: string;
};

export type UserPermissions = {
  userId: string;
  roles: Role[];
  directPermissions: Permission[];
  clinicPermissions: Record<string, Permission[]>;
  effectivePermissions: Permission[];
};

export type PermissionContext = {
  userId: string;
  sessionId?: string;
  clinicId?: string;
  resourceId?: string;
  resourceType?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  additionalContext?: Record<string, any>;
};

export type PermissionCheckResult = {
  granted: boolean;
  reason: string;
  matchedPermission?: Permission;
  appliedConditions?: PermissionCondition[];
  requiresElevation?: boolean;
  elevationReason?: string;
};

class PermissionValidator {
  private static instance: PermissionValidator;
  private readonly permissionCache: Map<string, UserPermissions> = new Map();
  private readonly cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 300_000; // 5 minutes

  private constructor() {}

  public static getInstance(): PermissionValidator {
    if (!PermissionValidator.instance) {
      PermissionValidator.instance = new PermissionValidator();
    }
    return PermissionValidator.instance;
  }

  /**
   * Check if user has permission for a specific action
   */
  async checkPermission(
    context: PermissionContext,
    resource: string,
    action: PermissionAction,
  ): Promise<PermissionCheckResult> {
    const startTime = Date.now();

    try {
      // Get user permissions
      const userPermissions = await this.getUserPermissions(context.userId);

      // Find matching permission
      const matchedPermission = this.findMatchingPermission(
        userPermissions.effectivePermissions,
        resource,
        action,
      );

      if (!matchedPermission) {
        const result: PermissionCheckResult = {
          granted: false,
          reason: `No permission found for ${action} on ${resource}`,
        };

        await this.logPermissionCheck(context, resource, action, result);
        return result;
      }

      // Evaluate conditions
      const conditionResult = await this.evaluateConditions(
        matchedPermission.conditions || [],
        context,
      );

      if (!conditionResult.passed) {
        const result: PermissionCheckResult = {
          granted: false,
          reason: `Permission conditions not met: ${conditionResult.reason}`,
          matchedPermission,
          appliedConditions: matchedPermission.conditions,
        };

        await this.logPermissionCheck(context, resource, action, result);
        return result;
      }

      // Check for elevation requirements
      const elevationCheck = await this.checkElevationRequirements(
        matchedPermission,
        context,
      );

      const result: PermissionCheckResult = {
        granted: true,
        reason: 'Permission granted',
        matchedPermission,
        appliedConditions: matchedPermission.conditions,
        requiresElevation: elevationCheck.required,
        elevationReason: elevationCheck.reason,
      };

      await this.logPermissionCheck(context, resource, action, result);
      performanceTracker.recordMetric(
        'permission_check',
        Date.now() - startTime,
      );

      return result;
    } catch (_error) {
      const result: PermissionCheckResult = {
        granted: false,
        reason: 'Permission check failed due to system error',
      };

      await this.logPermissionCheck(context, resource, action, result);
      return result;
    }
  }

  /**
   * Check multiple permissions at once
   */
  async checkMultiplePermissions(
    context: PermissionContext,
    checks: Array<{ resource: string; action: PermissionAction }>,
  ): Promise<Record<string, PermissionCheckResult>> {
    const results: Record<string, PermissionCheckResult> = {};

    for (const check of checks) {
      const key = `${check.resource}:${check.action}`;
      results[key] = await this.checkPermission(
        context,
        check.resource,
        check.action,
      );
    }

    return results;
  }

  /**
   * Get user's effective permissions
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    // Check cache first
    const cached = this.permissionCache.get(userId);
    const cacheExpiry = this.cacheExpiry.get(userId);

    if (cached && cacheExpiry && Date.now() < cacheExpiry) {
      return cached;
    }

    const startTime = Date.now();

    try {
      const supabase = await createClient();

      // Get user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select(
          `
          role_id,
          clinic_id,
          roles (
            id,
            name,
            description,
            is_system_role,
            role_permissions (
              permission_id,
              permissions (
                id,
                name,
                resource,
                action,
                conditions,
                description
              )
            )
          )
        `,
        )
        .eq('user_id', userId)
        .eq('is_active', true);

      // Get direct permissions
      const { data: directPermissions } = await supabase
        .from('user_permissions')
        .select(
          `
          permission_id,
          clinic_id,
          permissions (
            id,
            name,
            resource,
            action,
            conditions,
            description
          )
        `,
        )
        .eq('user_id', userId)
        .eq('is_active', true);

      // Process roles and permissions
      const roles: Role[] = [];
      const clinicPermissions: Record<string, Permission[]> = {};
      const allPermissions: Permission[] = [];

      // Process roles
      if (userRoles) {
        for (const userRole of userRoles) {
          const role = userRole.roles;
          if (!role) {
            continue;
          }

          const rolePermissions: Permission[] = [];

          if (role.role_permissions) {
            for (const rp of role.role_permissions) {
              if (rp.permissions) {
                rolePermissions.push(rp.permissions as Permission);
              }
            }
          }

          const processedRole: Role = {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: rolePermissions,
            isSystemRole: role.is_system_role,
            clinicId: userRole.clinic_id,
          };

          roles.push(processedRole);
          allPermissions.push(...rolePermissions);

          // Group by clinic
          if (userRole.clinic_id) {
            if (!clinicPermissions[userRole.clinic_id]) {
              clinicPermissions[userRole.clinic_id] = [];
            }
            clinicPermissions[userRole.clinic_id].push(...rolePermissions);
          }
        }
      }

      // Process direct permissions
      const directPerms: Permission[] = [];
      if (directPermissions) {
        for (const dp of directPermissions) {
          if (dp.permissions) {
            directPerms.push(dp.permissions as Permission);
            allPermissions.push(dp.permissions as Permission);

            // Group by clinic
            if (dp.clinic_id) {
              if (!clinicPermissions[dp.clinic_id]) {
                clinicPermissions[dp.clinic_id] = [];
              }
              clinicPermissions[dp.clinic_id].push(
                dp.permissions as Permission,
              );
            }
          }
        }
      }

      // Remove duplicates
      const effectivePermissions = this.deduplicatePermissions(allPermissions);

      const userPermissions: UserPermissions = {
        userId,
        roles,
        directPermissions: directPerms,
        clinicPermissions,
        effectivePermissions,
      };

      // Cache the result
      this.permissionCache.set(userId, userPermissions);
      this.cacheExpiry.set(userId, Date.now() + this.CACHE_TTL);

      performanceTracker.recordMetric(
        'user_permissions_load',
        Date.now() - startTime,
      );
      return userPermissions;
    } catch (_error) {
      // Return empty permissions on error
      return {
        userId,
        roles: [],
        directPermissions: [],
        clinicPermissions: {},
        effectivePermissions: [],
      };
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string,
    roleId: string,
    clinicId?: string,
    assignedBy?: string,
  ): Promise<boolean> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role_id: roleId,
        clinic_id: clinicId,
        assigned_by: assignedBy,
        assigned_at: new Date().toISOString(),
        is_active: true,
      });

      if (error) {
        return false;
      }

      // Clear cache
      this.clearUserCache(userId);

      // Log security event
      await securityAuditLogger.logSecurityEvent(
        'permission_granted',
        `Role ${roleId} assigned to user ${userId}`,
        {
          role_id: roleId,
          clinic_id: clinicId,
          assigned_by: assignedBy,
        },
        {
          userId,
          severity: 'info',
          complianceFlags: ['lgpd_relevant'],
        },
      );

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(
    userId: string,
    roleId: string,
    clinicId?: string,
    removedBy?: string,
  ): Promise<boolean> {
    try {
      const supabase = await createClient();

      let query = supabase
        .from('user_roles')
        .update({
          is_active: false,
          removed_by: removedBy,
          removed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { error } = await query;

      if (error) {
        return false;
      }

      // Clear cache
      this.clearUserCache(userId);

      // Log security event
      await securityAuditLogger.logSecurityEvent(
        'permission_denied',
        `Role ${roleId} removed from user ${userId}`,
        {
          role_id: roleId,
          clinic_id: clinicId,
          removed_by: removedBy,
        },
        {
          userId,
          severity: 'info',
          complianceFlags: ['lgpd_relevant'],
        },
      );

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Grant direct permission to user
   */
  async grantPermission(
    userId: string,
    permissionId: string,
    clinicId?: string,
    grantedBy?: string,
  ): Promise<boolean> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.from('user_permissions').insert({
        user_id: userId,
        permission_id: permissionId,
        clinic_id: clinicId,
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
        is_active: true,
      });

      if (error) {
        return false;
      }

      // Clear cache
      this.clearUserCache(userId);

      // Log security event
      await securityAuditLogger.logSecurityEvent(
        'permission_granted',
        `Permission ${permissionId} granted to user ${userId}`,
        {
          permission_id: permissionId,
          clinic_id: clinicId,
          granted_by: grantedBy,
        },
        {
          userId,
          severity: 'info',
          complianceFlags: ['lgpd_relevant'],
        },
      );

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Revoke direct permission from user
   */
  async revokePermission(
    userId: string,
    permissionId: string,
    clinicId?: string,
    revokedBy?: string,
  ): Promise<boolean> {
    try {
      const supabase = await createClient();

      let query = supabase
        .from('user_permissions')
        .update({
          is_active: false,
          revoked_by: revokedBy,
          revoked_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('permission_id', permissionId);

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { error } = await query;

      if (error) {
        return false;
      }

      // Clear cache
      this.clearUserCache(userId);

      // Log security event
      await securityAuditLogger.logSecurityEvent(
        'permission_denied',
        `Permission ${permissionId} revoked from user ${userId}`,
        {
          permission_id: permissionId,
          clinic_id: clinicId,
          revoked_by: revokedBy,
        },
        {
          userId,
          severity: 'info',
          complianceFlags: ['lgpd_relevant'],
        },
      );

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private findMatchingPermission(
    permissions: Permission[],
    resource: string,
    action: PermissionAction,
  ): Permission | undefined {
    return permissions.find(
      (permission) =>
        permission.resource === resource && permission.action === action,
    );
  }

  private async evaluateConditions(
    conditions: PermissionCondition[],
    context: PermissionContext,
  ): Promise<{ passed: boolean; reason?: string }> {
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context);
      if (!result.passed) {
        return result;
      }
    }

    return { passed: true };
  }

  private async evaluateCondition(
    condition: PermissionCondition,
    context: PermissionContext,
  ): Promise<{ passed: boolean; reason?: string }> {
    switch (condition.type) {
      case 'time':
        return this.evaluateTimeCondition(condition, context);
      case 'location':
        return this.evaluateLocationCondition(condition, context);
      case 'resource_owner':
        return await this.evaluateResourceOwnerCondition(condition, context);
      case 'clinic_member':
        return await this.evaluateClinicMemberCondition(condition, context);
      case 'custom':
        return await this.evaluateCustomCondition(condition, context);
      default:
        return { passed: true };
    }
  }

  private evaluateTimeCondition(
    condition: PermissionCondition,
    context: PermissionContext,
  ): { passed: boolean; reason?: string } {
    const currentTime = new Date(context.timestamp);
    const currentHour = currentTime.getHours();

    switch (condition.operator) {
      case 'greater_than':
        return {
          passed: currentHour > condition.value,
          reason:
            currentHour <= condition.value
              ? `Current time ${currentHour} is not after ${condition.value}`
              : undefined,
        };
      case 'less_than':
        return {
          passed: currentHour < condition.value,
          reason:
            currentHour >= condition.value
              ? `Current time ${currentHour} is not before ${condition.value}`
              : undefined,
        };
      default:
        return { passed: true };
    }
  }

  private evaluateLocationCondition(
    condition: PermissionCondition,
    context: PermissionContext,
  ): { passed: boolean; reason?: string } {
    // IP-based location checking (simplified)
    const userIP = context.ipAddress;

    switch (condition.operator) {
      case 'in': {
        const allowedIPs = Array.isArray(condition.value)
          ? condition.value
          : [condition.value];
        return {
          passed: allowedIPs.includes(userIP),
          reason: allowedIPs.includes(userIP)
            ? undefined
            : `IP ${userIP} not in allowed list`,
        };
      }
      default:
        return { passed: true };
    }
  }

  private async evaluateResourceOwnerCondition(
    _condition: PermissionCondition,
    context: PermissionContext,
  ): Promise<{ passed: boolean; reason?: string }> {
    if (!(context.resourceId && context.resourceType)) {
      return {
        passed: false,
        reason: 'Resource information required for ownership check',
      };
    }

    try {
      const supabase = await createClient();

      // Check if user owns the resource
      const { data } = await supabase
        .from(context.resourceType)
        .select('created_by, user_id, owner_id')
        .eq('id', context.resourceId)
        .single();

      if (!data) {
        return { passed: false, reason: 'Resource not found' };
      }

      const isOwner =
        data.created_by === context.userId ||
        data.user_id === context.userId ||
        data.owner_id === context.userId;

      return {
        passed: isOwner,
        reason: isOwner ? undefined : 'User is not the resource owner',
      };
    } catch (_error) {
      return { passed: false, reason: 'Failed to check resource ownership' };
    }
  }

  private async evaluateClinicMemberCondition(
    _condition: PermissionCondition,
    context: PermissionContext,
  ): Promise<{ passed: boolean; reason?: string }> {
    if (!context.clinicId) {
      return { passed: false, reason: 'Clinic context required' };
    }

    try {
      const supabase = await createClient();

      // Check if user is member of the clinic
      const { data } = await supabase
        .from('clinic_members')
        .select('id')
        .eq('user_id', context.userId)
        .eq('clinic_id', context.clinicId)
        .eq('is_active', true)
        .single();

      return {
        passed: Boolean(data),
        reason: data ? undefined : 'User is not a member of this clinic',
      };
    } catch (_error) {
      return { passed: false, reason: 'Failed to check clinic membership' };
    }
  }

  private async evaluateCustomCondition(
    _condition: PermissionCondition,
    _context: PermissionContext,
  ): Promise<{ passed: boolean; reason?: string }> {
    // Custom condition evaluation logic
    // This can be extended based on specific business requirements
    return { passed: true };
  }

  private async checkElevationRequirements(
    permission: Permission,
    _context: PermissionContext,
  ): Promise<{ required: boolean; reason?: string }> {
    // Check if permission requires elevation (e.g., for sensitive operations)
    const sensitiveActions: PermissionAction[] = ['delete', 'export', 'manage'];
    const sensitiveResources = [
      'user',
      'clinic',
      'financial_data',
      'medical_records',
    ];

    if (
      sensitiveActions.includes(permission.action) ||
      sensitiveResources.includes(permission.resource)
    ) {
      return {
        required: true,
        reason: 'Sensitive operation requires additional authentication',
      };
    }

    return { required: false };
  }

  private deduplicatePermissions(permissions: Permission[]): Permission[] {
    const seen = new Set<string>();
    return permissions.filter((permission) => {
      const key = `${permission.resource}:${permission.action}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async logPermissionCheck(
    context: PermissionContext,
    resource: string,
    action: PermissionAction,
    result: PermissionCheckResult,
  ): Promise<void> {
    const eventType = result.granted
      ? 'permission_granted'
      : 'permission_denied';

    await securityAuditLogger.logSecurityEvent(
      eventType,
      `Permission check: ${action} on ${resource} - ${result.granted ? 'granted' : 'denied'}`,
      {
        resource,
        action,
        granted: result.granted,
        reason: result.reason,
        matched_permission: result.matchedPermission?.id,
        requires_elevation: result.requiresElevation,
      },
      {
        userId: context.userId,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: result.granted ? 'info' : 'warning',
        complianceFlags: ['lgpd_relevant'],
      },
    );
  }

  private clearUserCache(userId: string): void {
    this.permissionCache.delete(userId);
    this.cacheExpiry.delete(userId);
  }

  /**
   * Clear all cached permissions
   */
  clearAllCache(): void {
    this.permissionCache.clear();
    this.cacheExpiry.clear();
  }
}

export const permissionValidator = PermissionValidator.getInstance();
