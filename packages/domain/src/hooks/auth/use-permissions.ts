"use client";

import { useCallback, useEffect, useState } from "react";

export interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export type HealthcareRole =
  | "admin"
  | "doctor"
  | "nurse"
  | "receptionist"
  | "patient";

export interface UserPermissions {
  userId: string;
  roles: HealthcareRole[];
  permissions: Permission[];
  lastUpdated: string;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

export interface UsePermissionsOptions {
  userId?: string;
  cacheTime?: number;
  enableRealtime?: boolean;
}

export interface UsePermissionsReturn {
  permissions: Permission[];
  roles: HealthcareRole[];
  isLoading: boolean;
  error: string | null;
  hasPermission: (
    resource: string,
    action: string,
    context?: Record<string, unknown>,
  ) => PermissionCheckResult;
  hasRole: (role: HealthcareRole) => boolean;
  canAccessResource: (resource: string) => boolean;
  canPerformAction: (action: string) => boolean;
  hasAnyRole: (roles: HealthcareRole[]) => boolean;
  hasAllRoles: (roles: HealthcareRole[]) => boolean;
  isAdmin: boolean;
  isHealthcareProfessional: boolean;
  grantPermission: (
    userId: string,
    permission: Omit<Permission, "id">,
  ) => Promise<boolean>;
  revokePermission: (userId: string, permissionId: string) => Promise<boolean>;
  assignRole: (userId: string, role: HealthcareRole) => Promise<boolean>;
  removeRole: (userId: string, role: HealthcareRole) => Promise<boolean>;
  refreshPermissions: () => Promise<void>;
  clearCache: () => void;
}

// Mock toast functions
const toast = {
  error: () => {},
  success: () => {},
};

export function usePermissions(
  options: UsePermissionsOptions = {},
): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<HealthcareRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = { id: options.userId || "user-1" };

  const refreshPermissions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Placeholder implementation
      const mockPermissions: Permission[] = [
        {
          id: "1",
          resource: "appointments",
          action: "read",
        },
        {
          id: "2",
          resource: "patients",
          action: "read",
        },
      ];

      const mockRoles: HealthcareRole[] = ["doctor"];

      setPermissions(mockPermissions);
      setRoles(mockRoles);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to refresh permissions";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {}, []);

  const loadUserPermissions = useCallback(
    async (_userId: string) => {
      await refreshPermissions();
    },
    [refreshPermissions],
  );

  const resetPermissions = useCallback(() => {
    setPermissions([]);
    setRoles([]);
    setError(null);
  }, []);

  const subscribeToUpdates = useCallback((_userId: string) => {
    // Placeholder implementation
    return () => {};
  }, []);

  const logDataAccess = useCallback(
    (_action: string, _resource: string) => {},
    [],
  );
  const hasPermission = useCallback(
    (
      resource: string,
      action: string,
      _context?: Record<string, unknown>,
    ): PermissionCheckResult => {
      try {
        if (!user?.id) {
          return {
            hasPermission: false,
            reason: "User not authenticated",
          };
        }

        logDataAccess("permission_check", resource);

        const permission = permissions.find(
          (p) => p.resource === resource && p.action === action,
        );

        if (!permission) {
          return {
            hasPermission: false,
            reason: `Permission not found for ${action} on ${resource}`,
          };
        }

        return {
          hasPermission: true,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Permission check failed";
        setError(errorMessage);
        return {
          hasPermission: false,
          reason: errorMessage,
        };
      }
    },
    [permissions, user?.id, logDataAccess],
  );

  const hasRole = useCallback(
    (role: HealthcareRole): boolean => {
      if (!user?.id) {
        return false;
      }
      return roles.includes(role);
    },
    [roles, user?.id],
  );

  const canAccessResource = useCallback(
    (resource: string): boolean => {
      if (!user?.id) {
        return false;
      }
      return permissions.some((p) => p.resource === resource);
    },
    [permissions, user?.id],
  );

  const canPerformAction = useCallback(
    (action: string): boolean => {
      if (!user?.id) {
        return false;
      }
      return permissions.some((p) => p.action === action);
    },
    [permissions, user?.id],
  );

  const hasAnyRole = useCallback(
    (rolesToCheck: HealthcareRole[]): boolean => {
      if (!user?.id) {
        return false;
      }
      return rolesToCheck.some((role) => roles.includes(role));
    },
    [roles, user?.id],
  );

  const hasAllRoles = useCallback(
    (rolesToCheck: HealthcareRole[]): boolean => {
      if (!user?.id) {
        return false;
      }
      return rolesToCheck.every((role) => roles.includes(role));
    },
    [roles, user?.id],
  );

  const grantPermission = useCallback(
    async (
      _userId: string,
      permission: Omit<Permission, "id">,
    ): Promise<boolean> => {
      try {
        if (!user?.id) {
          toast.error();
          return false;
        }

        const newPermission: Permission = {
          ...permission,
          id: `perm-${Date.now()}`,
        };

        setPermissions((prev) => [...prev, newPermission]);
        toast.success();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to grant permission";
        setError(errorMessage);
        toast.error();
        return false;
      }
    },
    [user?.id],
  );

  const revokePermission = useCallback(
    async (_userId: string, permissionId: string): Promise<boolean> => {
      try {
        if (!user?.id) {
          toast.error();
          return false;
        }

        setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
        clearCache();
        refreshPermissions();
        toast.success();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Failed to revoke permission";
        setError(errorMessage);
        toast.error();
        return false;
      }
    },
    [user?.id, clearCache, refreshPermissions],
  );

  const assignRole = useCallback(
    async (_userId: string, role: HealthcareRole): Promise<boolean> => {
      try {
        if (!roles.includes(role)) {
          setRoles((prev) => [...prev, role]);
        }

        clearCache();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to assign role";
        setError(errorMessage);
        return false;
      }
    },
    [roles, clearCache],
  );

  const removeRole = useCallback(
    async (_userId: string, role: HealthcareRole): Promise<boolean> => {
      try {
        if (!user?.id) {
          return false;
        }

        setRoles((prev) => prev.filter((r) => r !== role));

        // Remove permissions associated with this role
        const roleName = role;
        setPermissions((prev) => prev.filter((p) => p.resource !== roleName));

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to remove role";
        setError(errorMessage);
        return false;
      }
    },
    [user?.id],
  );

  // Computed properties
  const isAdmin = hasRole("admin");
  const isHealthcareProfessional = hasAnyRole(["doctor", "nurse"]);

  // Initialize permissions
  useEffect(() => {
    if (user?.id) {
      loadUserPermissions(user.id);
    } else {
      resetPermissions();
    }
  }, [user?.id, loadUserPermissions, resetPermissions]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!(options.enableRealtime && user?.id)) {
      return;
    }

    const unsubscribe = subscribeToUpdates(user.id);
    return unsubscribe;
  }, [options.enableRealtime, user?.id, subscribeToUpdates]);

  return {
    permissions,
    roles,
    isLoading,
    error,
    hasPermission,
    hasRole,
    canAccessResource,
    canPerformAction,
    hasAnyRole,
    hasAllRoles,
    isAdmin: Boolean(isAdmin),
    isHealthcareProfessional: Boolean(isHealthcareProfessional),
    grantPermission,
    revokePermission,
    assignRole,
    removeRole,
    refreshPermissions,
    clearCache,
  };
}
