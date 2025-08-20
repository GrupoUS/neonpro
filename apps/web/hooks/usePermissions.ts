import { useAuth } from './useAuth';

// Types
type Permission = {
  action: string;
  resource: string;
};

type Role = {
  name: string;
  permissions: Permission[];
};

type PermissionHookReturn = {
  hasPermission: (permissionOrAction: string, resource?: string) => boolean;
  canView: (resource: string) => boolean;
  canCreate: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  userRoles: string[];
  isLoading: boolean;
};

export function usePermissions(): PermissionHookReturn {
  const auth = useAuth();

  // Mock implementation for development
  const userRoles = auth?.user?.roles || ['user'];

  const hasPermission = (
    _permissionOrAction: string,
    _resource?: string
  ): boolean => {
    // In a real implementation, this would check against actual user permissions
    // Support both single permission string and action + resource format
    // For now, return true for all permissions to avoid blocking the UI
    return true;
  };

  const canView = (resource: string): boolean =>
    hasPermission('view', resource);
  const canCreate = (resource: string): boolean =>
    hasPermission('create', resource);
  const canEdit = (resource: string): boolean =>
    hasPermission('edit', resource);
  const canDelete = (resource: string): boolean =>
    hasPermission('delete', resource);

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    userRoles,
    isLoading: false, // Mock loading state
  };
}

export default usePermissions;
