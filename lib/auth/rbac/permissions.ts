// RBAC Permission System - Core Implementation
// Story 1.2: Role-Based Permissions Enhancement

import { createClient } from '@/lib/supabase/client';
import {
  UserRole,
  Permission,
  PermissionCheck,
  PermissionResult,
  PermissionContext,
  PermissionAuditLog,
  RoleDefinition,
  UserRoleAssignment,
  DEFAULT_ROLES
} from '@/types/rbac';

/**
 * Core RBAC Permission Manager
 * Handles all permission checks, role assignments, and audit logging
 */
export class RBACPermissionManager {
  private supabase = createClient();
  private auditEnabled = true;

  /**
   * Check if user has specific permission
   */
  async checkPermission(check: PermissionCheck): Promise<PermissionResult> {
    try {
      // Get user's role assignment for the clinic
      const userRole = await this.getUserRole(check.userId, check.clinicId);
      
      if (!userRole) {
        return this.createPermissionResult(false, 'No role assigned', undefined, check);
      }

      // Get role definition and permissions
      const roleDefinition = await this.getRoleDefinition(userRole.roleId);
      
      if (!roleDefinition) {
        return this.createPermissionResult(false, 'Role definition not found', undefined, check);
      }

      // Check if role has the required permission
      const hasPermission = roleDefinition.permissions.includes(check.permission);
      
      if (!hasPermission) {
        return this.createPermissionResult(
          false, 
          `Role '${roleDefinition.name}' does not have permission '${check.permission}'`,
          roleDefinition.name,
          check
        );
      }

      // Additional context-based checks
      const contextCheck = await this.checkPermissionContext({
        clinicId: check.clinicId,
        userId: check.userId,
        userRole: roleDefinition.name,
        resourceOwnerId: check.resourceId,
        action: check.permission,
        timestamp: new Date()
      });

      if (!contextCheck.allowed) {
        return this.createPermissionResult(
          false,
          contextCheck.reason || 'Context validation failed',
          roleDefinition.name,
          check
        );
      }

      // Permission granted
      return this.createPermissionResult(
        true,
        'Permission granted',
        roleDefinition.name,
        check,
        roleDefinition.hierarchy
      );

    } catch (error) {
      console.error('Permission check error:', error);
      return this.createPermissionResult(false, 'Permission check failed', undefined, check);
    }
  }

  /**
   * Check multiple permissions at once
   */
  async checkMultiplePermissions(
    userId: string,
    clinicId: string,
    permissions: Permission[]
  ): Promise<Record<Permission, PermissionResult>> {
    const results: Record<string, PermissionResult> = {};
    
    for (const permission of permissions) {
      results[permission] = await this.checkPermission({
        userId,
        clinicId,
        permission
      });
    }
    
    return results as Record<Permission, PermissionResult>;
  }

  /**
   * Get user's role for specific clinic
   */
  private async getUserRole(userId: string, clinicId: string): Promise<UserRoleAssignment | null> {
    const { data, error } = await this.supabase
      .from('user_role_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data;
  }

  /**
   * Get role definition by ID
   */
  private async getRoleDefinition(roleId: string): Promise<RoleDefinition | null> {
    // First check if it's a default system role
    const defaultRole = Object.values(DEFAULT_ROLES).find(role => role.id === roleId);
    if (defaultRole) {
      return defaultRole;
    }

    // Otherwise fetch from database
    const { data, error } = await this.supabase
      .from('role_definitions')
      .select('*')
      .eq('id', roleId)
      .single();

    if (error) {
      console.error('Error fetching role definition:', error);
      return null;
    }

    return data;
  }

  /**
   * Context-based permission validation
   */
  private async checkPermissionContext(context: PermissionContext): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Resource ownership check
    if (context.resourceOwnerId && context.userRole === 'patient') {
      if (context.resourceOwnerId !== context.userId) {
        return {
          allowed: false,
          reason: 'Patients can only access their own resources'
        };
      }
    }

    // Time-based access control (if configured)
    const timeCheck = await this.checkTimeBasedAccess(context);
    if (!timeCheck.allowed) {
      return timeCheck;
    }

    // IP-based restrictions (if configured)
    const ipCheck = await this.checkIPRestrictions(context);
    if (!ipCheck.allowed) {
      return ipCheck;
    }

    return { allowed: true };
  }

  /**
   * Check time-based access restrictions
   */
  private async checkTimeBasedAccess(context: PermissionContext): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Get role-specific time restrictions from database
    const { data: restrictions } = await this.supabase
      .from('role_time_restrictions')
      .select('*')
      .eq('role', context.userRole)
      .eq('clinic_id', context.clinicId)
      .single();

    if (!restrictions) {
      return { allowed: true }; // No restrictions configured
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Check allowed hours
    if (restrictions.allowed_hours) {
      const [startHour, endHour] = restrictions.allowed_hours;
      if (currentHour < startHour || currentHour > endHour) {
        return {
          allowed: false,
          reason: `Access not allowed outside of ${startHour}:00-${endHour}:00`
        };
      }
    }

    // Check allowed days
    if (restrictions.allowed_days && !restrictions.allowed_days.includes(currentDay)) {
      return {
        allowed: false,
        reason: 'Access not allowed on this day of the week'
      };
    }

    return { allowed: true };
  }

  /**
   * Check IP-based access restrictions
   */
  private async checkIPRestrictions(context: PermissionContext): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    if (!context.ipAddress) {
      return { allowed: true }; // No IP to check
    }

    // Get IP restrictions for role and clinic
    const { data: restrictions } = await this.supabase
      .from('role_ip_restrictions')
      .select('*')
      .eq('role', context.userRole)
      .eq('clinic_id', context.clinicId);

    if (!restrictions || restrictions.length === 0) {
      return { allowed: true }; // No restrictions configured
    }

    // Check if IP is in allowed ranges (simplified - would need proper CIDR checking)
    const isAllowed = restrictions.some(restriction => 
      this.isIPInRange(context.ipAddress!, restriction.ip_range)
    );

    if (!isAllowed) {
      return {
        allowed: false,
        reason: 'Access not allowed from this IP address'
      };
    }

    return { allowed: true };
  }

  /**
   * Simple IP range check (would need proper CIDR implementation)
   */
  private isIPInRange(ip: string, range: string): boolean {
    // Simplified implementation - in production, use proper CIDR library
    if (range === '*' || range === '0.0.0.0/0') {
      return true;
    }
    
    if (range.includes('/')) {
      // CIDR notation - would need proper implementation
      return ip.startsWith(range.split('/')[0].split('.').slice(0, 3).join('.'));
    }
    
    return ip === range;
  }

  /**
   * Create permission result with audit logging
   */
  private async createPermissionResult(
    granted: boolean,
    reason: string,
    roleUsed?: UserRole,
    check?: PermissionCheck,
    hierarchyLevel?: number
  ): Promise<PermissionResult> {
    const result: PermissionResult = {
      granted,
      reason,
      roleUsed,
      hierarchyLevel
    };

    // Audit logging
    if (this.auditEnabled && check) {
      const auditId = await this.logPermissionCheck(check, result);
      result.auditId = auditId;
    }

    return result;
  }

  /**
   * Log permission check for audit trail
   */
  private async logPermissionCheck(
    check: PermissionCheck,
    result: PermissionResult
  ): Promise<string | undefined> {
    try {
      const auditLog: Omit<PermissionAuditLog, 'id'> = {
        userId: check.userId,
        action: 'permission_check',
        permission: check.permission,
        resourceId: check.resourceId,
        clinicId: check.clinicId,
        granted: result.granted,
        roleUsed: result.roleUsed || 'unknown',
        ipAddress: check.context?.ipAddress || 'unknown',
        userAgent: check.context?.userAgent || 'unknown',
        timestamp: new Date(),
        metadata: {
          reason: result.reason,
          hierarchyLevel: result.hierarchyLevel,
          context: check.context
        }
      };

      const { data, error } = await this.supabase
        .from('permission_audit_logs')
        .insert(auditLog)
        .select('id')
        .single();

      if (error) {
        console.error('Error logging permission check:', error);
        return undefined;
      }

      return data.id;
    } catch (error) {
      console.error('Audit logging error:', error);
      return undefined;
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string,
    roleId: string,
    clinicId: string,
    assignedBy: string,
    expiresAt?: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already has a role for this clinic
      const existingRole = await this.getUserRole(userId, clinicId);
      
      if (existingRole) {
        // Deactivate existing role
        await this.supabase
          .from('user_role_assignments')
          .update({ is_active: false })
          .eq('id', existingRole.id);
      }

      // Create new role assignment
      const { error } = await this.supabase
        .from('user_role_assignments')
        .insert({
          user_id: userId,
          role_id: roleId,
          clinic_id: clinicId,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
          expires_at: expiresAt?.toISOString(),
          is_active: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to assign role' };
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(
    userId: string,
    clinicId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_role_assignments')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('clinic_id', clinicId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to remove role' };
    }
  }

  /**
   * Get all permissions for a user in a clinic
   */
  async getUserPermissions(userId: string, clinicId: string): Promise<Permission[]> {
    const userRole = await this.getUserRole(userId, clinicId);
    
    if (!userRole) {
      return [];
    }

    const roleDefinition = await this.getRoleDefinition(userRole.roleId);
    
    return roleDefinition?.permissions || [];
  }

  /**
   * Check if user can manage another user (hierarchy check)
   */
  async canManageUser(
    managerId: string,
    targetUserId: string,
    clinicId: string
  ): Promise<boolean> {
    const managerRole = await this.getUserRole(managerId, clinicId);
    const targetRole = await this.getUserRole(targetUserId, clinicId);

    if (!managerRole || !targetRole) {
      return false;
    }

    const managerDef = await this.getRoleDefinition(managerRole.roleId);
    const targetDef = await this.getRoleDefinition(targetRole.roleId);

    if (!managerDef || !targetDef) {
      return false;
    }

    // Higher hierarchy number = lower privilege
    // Manager can only manage users with higher hierarchy numbers
    return managerDef.hierarchy < targetDef.hierarchy;
  }
}

// Export singleton instance
export const rbacManager = new RBACPermissionManager();

// Convenience functions
export const checkPermission = (check: PermissionCheck) => rbacManager.checkPermission(check);
export const assignRole = (userId: string, roleId: string, clinicId: string, assignedBy: string, expiresAt?: Date) => 
  rbacManager.assignRole(userId, roleId, clinicId, assignedBy, expiresAt);
export const getUserPermissions = (userId: string, clinicId: string) => 
  rbacManager.getUserPermissions(userId, clinicId);
export const canManageUser = (managerId: string, targetUserId: string, clinicId: string) => 
  rbacManager.canManageUser(managerId, targetUserId, clinicId);
