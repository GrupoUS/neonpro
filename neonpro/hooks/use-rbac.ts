// RBAC React Hook for Frontend Permission Management
// Story 1.2: Role-Based Permissions Enhancement

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { createClient } from '@/lib/supabase/client';
import { rbacManager } from '@/lib/auth/rbac/permissions';
import {
  Permission,
  UserRole,
  PermissionResult,
  RoleDefinition,
  UserRoleAssignment
} from '@/types/rbac';

/**
 * RBAC Hook State
 */
interface RBACState {
  userRole: UserRole | null;
  permissions: Permission[];
  roleDefinition: RoleDefinition | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Permission Check Cache
 */
interface PermissionCache {
  [key: string]: {
    result: PermissionResult;
    timestamp: number;
    ttl: number;
  };
}

/**
 * RBAC Hook Options
 */
interface UseRBACOptions {
  clinicId?: string;
  cacheTimeout?: number; // Cache timeout in milliseconds
  autoRefresh?: boolean; // Auto refresh permissions on role changes
}

/**
 * Main RBAC Hook
 */
export function useRBAC(options: UseRBACOptions = {}) {
  const { clinicId, cacheTimeout = 5 * 60 * 1000, autoRefresh = true } = options;
  const user = useUser();
  const supabase = createClient();
  
  const [state, setState] = useState<RBACState>({
    userRole: null,
    permissions: [],
    roleDefinition: null,
    isLoading: true,
    error: null
  });
  
  const [permissionCache, setPermissionCache] = useState<PermissionCache>({});
  
  /**
   * Load user role and permissions
   */
  const loadUserRole = useCallback(async () => {
    if (!user?.id || !clinicId) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Missing user or clinic context' }));
      return;
    }
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get user role assignment
      const { data: roleAssignment, error: roleError } = await supabase
        .from('user_role_assignments')
        .select('*')
        .eq('user_id', user.id)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .single();
      
      if (roleError) {
        throw new Error(`Failed to load user role: ${roleError.message}`);
      }
      
      if (!roleAssignment) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'No role assigned for this clinic' 
        }));
        return;
      }
      
      // Get role definition
      const { data: roleDef, error: roleDefError } = await supabase
        .from('role_definitions')
        .select('*')
        .eq('id', roleAssignment.role_id)
        .single();
      
      if (roleDefError) {
        throw new Error(`Failed to load role definition: ${roleDefError.message}`);
      }
      
      // Get user permissions
      const permissions = await rbacManager.getUserPermissions(user.id, clinicId);
      
      setState({
        userRole: roleDef.name as UserRole,
        permissions,
        roleDefinition: roleDef,
        isLoading: false,
        error: null
      });
      
      // Clear permission cache when role changes
      setPermissionCache({});
      
    } catch (error) {
      console.error('Error loading user role:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load user role' 
      }));
    }
  }, [user?.id, clinicId, supabase]);
  
  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback(async (permission: Permission): Promise<boolean> => {
    if (!user?.id || !clinicId) {
      return false;
    }
    
    // Check cache first
    const cacheKey = `${user.id}-${clinicId}-${permission}`;
    const cached = permissionCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.result.granted;
    }
    
    try {
      const result = await rbacManager.checkPermission({
        userId: user.id,
        permission,
        clinicId
      });
      
      // Update cache
      setPermissionCache(prev => ({
        ...prev,
        [cacheKey]: {
          result,
          timestamp: Date.now(),
          ttl: cacheTimeout
        }
      }));
      
      return result.granted;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }, [user?.id, clinicId, permissionCache, cacheTimeout]);
  
  /**
   * Check multiple permissions at once
   */
  const hasPermissions = useCallback(async (permissions: Permission[]): Promise<Record<Permission, boolean>> => {
    const results: Record<string, boolean> = {};
    
    for (const permission of permissions) {
      results[permission] = await hasPermission(permission);
    }
    
    return results as Record<Permission, boolean>;
  }, [hasPermission]);
  
  /**
   * Check if user can manage another user
   */
  const canManageUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user?.id || !clinicId) {
      return false;
    }
    
    try {
      return await rbacManager.canManageUser(user.id, targetUserId, clinicId);
    } catch (error) {
      console.error('Can manage user check error:', error);
      return false;
    }
  }, [user?.id, clinicId]);
  
  /**
   * Get role hierarchy level
   */
  const getHierarchyLevel = useCallback((): number | null => {
    return state.roleDefinition?.hierarchy || null;
  }, [state.roleDefinition]);
  
  /**
   * Check if user is in specific role
   */
  const isRole = useCallback((role: UserRole): boolean => {
    return state.userRole === role;
  }, [state.userRole]);
  
  /**
   * Check if user is at least specific role level
   */
  const isAtLeastRole = useCallback((role: UserRole): boolean => {
    if (!state.roleDefinition) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      owner: 1,
      manager: 2,
      staff: 3,
      patient: 4
    };
    
    return state.roleDefinition.hierarchy <= roleHierarchy[role];
  }, [state.roleDefinition]);
  
  /**
   * Refresh permissions
   */
  const refreshPermissions = useCallback(() => {
    setPermissionCache({});
    loadUserRole();
  }, [loadUserRole]);
  
  /**
   * Clear permission cache
   */
  const clearCache = useCallback(() => {
    setPermissionCache({});
  }, []);
  
  // Load role on mount and when dependencies change
  useEffect(() => {
    loadUserRole();
  }, [loadUserRole]);
  
  // Auto refresh on role changes if enabled
  useEffect(() => {
    if (!autoRefresh || !user?.id || !clinicId) return;
    
    const channel = supabase
      .channel('role_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_role_assignments',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Role assignment changed, refreshing permissions');
          refreshPermissions();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, clinicId, autoRefresh, supabase, refreshPermissions]);
  
  // Memoized computed values
  const computedValues = useMemo(() => ({
    isOwner: state.userRole === 'owner',
    isManager: state.userRole === 'manager',
    isStaff: state.userRole === 'staff',
    isPatient: state.userRole === 'patient',
    isStaffOrAbove: state.roleDefinition ? state.roleDefinition.hierarchy <= 3 : false,
    isManagerOrAbove: state.roleDefinition ? state.roleDefinition.hierarchy <= 2 : false,
    hasAnyRole: state.userRole !== null
  }), [state.userRole, state.roleDefinition]);
  
  return {
    // State
    ...state,
    ...computedValues,
    
    // Methods
    hasPermission,
    hasPermissions,
    canManageUser,
    getHierarchyLevel,
    isRole,
    isAtLeastRole,
    refreshPermissions,
    clearCache,
    
    // Utilities
    isReady: !state.isLoading && !state.error,
    cacheSize: Object.keys(permissionCache).length
  };
}

/**
 * Hook for checking specific permission
 */
export function usePermission(permission: Permission, clinicId?: string) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const user = useUser();
  
  useEffect(() => {
    async function checkPermission() {
      if (!user?.id || !clinicId) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }
      
      try {
        setIsChecking(true);
        const result = await rbacManager.checkPermission({
          userId: user.id,
          permission,
          clinicId
        });
        setHasAccess(result.granted);
      } catch (error) {
        console.error('Permission check error:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    }
    
    checkPermission();
  }, [user?.id, permission, clinicId]);
  
  return {
    hasAccess,
    isChecking,
    isReady: !isChecking
  };
}

/**
 * Hook for role-based conditional rendering
 */
export function useRoleGuard(allowedRoles: UserRole[], clinicId?: string) {
  const { userRole, isLoading } = useRBAC({ clinicId });
  
  const isAllowed = useMemo(() => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  }, [userRole, allowedRoles]);
  
  return {
    isAllowed,
    isLoading,
    userRole
  };
}

/**
 * Hook for permission-based conditional rendering
 */
export function usePermissionGuard(requiredPermissions: Permission[], clinicId?: string) {
  const [permissions, setPermissions] = useState<Record<Permission, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();
  
  useEffect(() => {
    async function checkPermissions() {
      if (!user?.id || !clinicId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const results: Record<string, boolean> = {};
        
        for (const permission of requiredPermissions) {
          const result = await rbacManager.checkPermission({
            userId: user.id,
            permission,
            clinicId
          });
          results[permission] = result.granted;
        }
        
        setPermissions(results as Record<Permission, boolean>);
      } catch (error) {
        console.error('Permission guard error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkPermissions();
  }, [user?.id, clinicId, requiredPermissions]);
  
  const hasAllPermissions = useMemo(() => {
    return requiredPermissions.every(permission => permissions[permission]);
  }, [requiredPermissions, permissions]);
  
  const hasAnyPermission = useMemo(() => {
    return requiredPermissions.some(permission => permissions[permission]);
  }, [requiredPermissions, permissions]);
  
  return {
    permissions,
    hasAllPermissions,
    hasAnyPermission,
    isLoading
  };
}
