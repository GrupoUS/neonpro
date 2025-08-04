// lib/rbac/permissions.ts
export enum Permission {
  READ_PATIENTS = 'read:patients',
  WRITE_PATIENTS = 'write:patients',
  READ_REPORTS = 'read:reports',
  WRITE_REPORTS = 'write:reports',
  ADMIN_ACCESS = 'admin:access'
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export class PermissionsService {
  static checkPermission(userRoles: string[], requiredPermission: Permission): boolean {
    // Mock implementation for build
    return true;
  }

  static getUserPermissions(userId: string): Permission[] {
    // Mock implementation for build
    return Object.values(Permission);
  }
}