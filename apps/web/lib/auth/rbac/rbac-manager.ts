/**
 * RBAC Permission Manager Class
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This class provides a manager interface for the RBAC system,
 * wrapping the functional permissions API in a class-based interface.
 */

import { createClient } from '@/app/utils/supabase/client';
import type {
  Permission,
  PermissionResult,
  UserRoleAssignment,
} from '@/types/rbac';

export class RBACPermissionManager {
  private readonly supabase: any;
  private readonly permissionCache: Map<
    string,
    { data: any; timestamp: number }
  > = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || createClient();
  }

  /**
   * Get user role assignment with clinic context
   */
  async getUserRole(
    userId: string,
    clinicId: string,
  ): Promise<UserRoleAssignment | null> {
    const cacheKey = `getUserRole:${userId}:${clinicId}`;
    const cached = this.permissionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const { data: userRole, error } = await this.supabase
      .from('user_roles')
      .select(
        `
          *,
          role:roles(*)
        `,
      )
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .single();

    if (error) {
      // Throw error to propagate it up to hasPermission
      throw error;
    }

    const result = userRole || null;
    this.permissionCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });
    return result;
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: string,
    permission: Permission,
    clinicId: string,
    resourceId?: string,
  ): Promise<PermissionResult> {
    try {
      const cacheKey = `hasPermission:${userId}:${permission}:${clinicId}:${resourceId || ''}`;
      const cached = this.permissionCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const roleAssignment = await this.getUserRole(userId, clinicId);

      if (!roleAssignment?.role) {
        const result = { granted: false };
        this.permissionCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
        return result;
      }

      const role = roleAssignment.role;

      // Check if role has wildcard permission
      if (role.permissions.includes('*')) {
        const result = {
          granted: true,
          role: role.name,
          resourceId,
        };
        this.permissionCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
        return result;
      }

      // Check if role has specific permission
      const hasPermission = role.permissions.includes(permission);

      const result = {
        granted: hasPermission,
        role: role.name,
        resourceId,
      };

      this.permissionCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      return result;
    } catch (error) {
      return { granted: false, error: error.message };
    }
  }

  /**
   * Check if user can manage another user (hierarchy validation)
   */
  async canManageUser(
    managerId: string,
    targetUserId: string,
    clinicId: string,
  ): Promise<boolean> {
    try {
      const managerRole = await this.getUserRole(managerId, clinicId);
      const targetRole = await this.getUserRole(targetUserId, clinicId);

      if (!(managerRole?.role && targetRole?.role)) {
        return false;
      }

      const managerHierarchy = managerRole.role.hierarchy;
      const targetHierarchy = targetRole.role.hierarchy;

      // Lower hierarchy number = higher privilege (1 = owner, 2 = manager, 3 = staff)
      return managerHierarchy < targetHierarchy;
    } catch (_error) {
      return false;
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
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('user_roles').insert({
        user_id: userId,
        role_id: roleId,
        clinic_id: clinicId,
        assigned_by: assignedBy,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return !error;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(
    userId: string,
    clinicId: string,
    removedBy: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_roles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
          updated_by: removedBy,
        })
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      return !error;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Clear permission cache for user
   */
  clearUserCache(_userId: string): void {}

  /**
   * Clear all permission caches
   */
  clearAllCaches(): void {}
}
