export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  hierarchy: number;
}

export interface UserPermissions {
  userId: string;
  roles: Role[];
  directPermissions: Permission[];
}

export function hasPermission(
  userPermissions: UserPermissions,
  resource: string,
  action: string,
  conditions?: Record<string, any>,
): boolean {
  // Check direct permissions
  const directPermission = userPermissions.directPermissions.find(
    (p) => p.resource === resource && p.action === action,
  );

  if (directPermission && checkConditions(directPermission.conditions, conditions)) {
    return true;
  }

  // Check role permissions
  for (const role of userPermissions.roles) {
    const rolePermission = role.permissions.find(
      (p) => p.resource === resource && p.action === action,
    );

    if (rolePermission && checkConditions(rolePermission.conditions, conditions)) {
      return true;
    }
  }

  return false;
}

function checkConditions(
  permissionConditions?: Record<string, any>,
  requestConditions?: Record<string, any>,
): boolean {
  if (!permissionConditions) return true;
  if (!requestConditions) return false;

  return Object.entries(permissionConditions).every(
    ([key, value]) => requestConditions[key] === value,
  );
}

export const PERMISSIONS = {
  COMPLIANCE: {
    READ: "compliance:read",
    WRITE: "compliance:write",
    DELETE: "compliance:delete",
    AUDIT: "compliance:audit",
  },
  REPORTS: {
    GENERATE: "reports:generate",
    VIEW: "reports:view",
    EXPORT: "reports:export",
  },
} as const;
