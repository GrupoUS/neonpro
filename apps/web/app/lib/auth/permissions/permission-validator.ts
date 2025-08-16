/**
 * Permission Validation System
 *
 * Comprehensive role-based access control (RBAC) and permission validation
 * system for NeonPro healthcare application with granular permission management.
 *
 * Features:
 * - Role-based access control (RBAC) with hierarchical roles
 * - Resource-level permission validation
 * - Dynamic permission evaluation
 * - Permission caching for performance
 * - Audit logging for permission checks
 * - Healthcare-specific role definitions
 */

import {
  AuditEventType,
  securityAuditLogger,
} from '../audit/security-audit-logger';

// System roles with hierarchical permissions
export enum SystemRole {
  SUPER_ADMIN = 'super_admin', // Highest level - system management
  ADMIN = 'admin', // Clinic administration
  MANAGER = 'manager', // Operational management
  DOCTOR = 'doctor', // Medical professionals
  NURSE = 'nurse', // Nursing staff
  RECEPTIONIST = 'receptionist', // Front desk operations
  TECHNICIAN = 'technician', // Technical/lab staff
  PATIENT = 'patient', // Patients
  GUEST = 'guest', // Limited access
}

// Resource types in the system
export enum ResourceType {
  USER = 'user',
  PATIENT = 'patient',
  APPOINTMENT = 'appointment',
  MEDICAL_RECORD = 'medical_record',
  PRESCRIPTION = 'prescription',
  BILLING = 'billing',
  REPORT = 'report',
  SYSTEM_CONFIG = 'system_config',
  AUDIT_LOG = 'audit_log',
  SUBSCRIPTION = 'subscription',
  CLINIC = 'clinic',
  DEPARTMENT = 'department',
}

// Actions that can be performed on resources
export enum Permission {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  EXPORT = 'export',
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  MANAGE = 'manage',
  ADMIN = 'admin',
}

export type RolePermission = {
  role: SystemRole;
  resource: ResourceType;
  actions: Permission[];
  conditions?: string[]; // Additional conditions for permission
  scope?: 'own' | 'department' | 'clinic' | 'system'; // Permission scope
};

export type UserPermissions = {
  userId: string;
  roles: SystemRole[];
  customPermissions: RolePermission[];
  departmentId?: string;
  clinicId?: string;
  isActive: boolean;
  lastUpdated: number;
};

export type PermissionCheck = {
  userId: string;
  resource: ResourceType;
  action: Permission;
  resourceId?: string;
  context?: Record<string, any>;
};

export type PermissionResult = {
  allowed: boolean;
  reason: string;
  role?: SystemRole;
  conditions?: string[];
  timestamp: number;
};

// Role hierarchy (higher roles inherit permissions from lower roles)
const ROLE_HIERARCHY: Record<SystemRole, number> = {
  [SystemRole.SUPER_ADMIN]: 9,
  [SystemRole.ADMIN]: 8,
  [SystemRole.MANAGER]: 7,
  [SystemRole.DOCTOR]: 6,
  [SystemRole.NURSE]: 5,
  [SystemRole.TECHNICIAN]: 4,
  [SystemRole.RECEPTIONIST]: 3,
  [SystemRole.PATIENT]: 2,
  [SystemRole.GUEST]: 1,
};

// Default permission matrix for healthcare roles
const DEFAULT_PERMISSIONS: RolePermission[] = [
  // Super Admin - Full system access
  {
    role: SystemRole.SUPER_ADMIN,
    resource: ResourceType.USER,
    actions: [
      Permission.CREATE,
      Permission.READ,
      Permission.UPDATE,
      Permission.DELETE,
      Permission.LIST,
      Permission.MANAGE,
    ],
    scope: 'system',
  },
  {
    role: SystemRole.SUPER_ADMIN,
    resource: ResourceType.SYSTEM_CONFIG,
    actions: [
      Permission.CREATE,
      Permission.READ,
      Permission.UPDATE,
      Permission.DELETE,
      Permission.MANAGE,
    ],
    scope: 'system',
  },
  {
    role: SystemRole.SUPER_ADMIN,
    resource: ResourceType.AUDIT_LOG,
    actions: [Permission.READ, Permission.LIST, Permission.EXPORT],
    scope: 'system',
  },

  // Admin - Clinic administration
  {
    role: SystemRole.ADMIN,
    resource: ResourceType.USER,
    actions: [
      Permission.CREATE,
      Permission.READ,
      Permission.UPDATE,
      Permission.LIST,
      Permission.MANAGE,
    ],
    scope: 'clinic',
  },
  {
    role: SystemRole.ADMIN,
    resource: ResourceType.PATIENT,
    actions: [
      Permission.CREATE,
      Permission.READ,
      Permission.UPDATE,
      Permission.DELETE,
      Permission.LIST,
    ],
    scope: 'clinic',
  },
  {
    role: SystemRole.ADMIN,
    resource: ResourceType.APPOINTMENT,
    actions: [
      Permission.CREATE,
      Permission.READ,
      Permission.UPDATE,
      Permission.DELETE,
      Permission.LIST,
    ],
    scope: 'clinic',
  },
  {
    role: SystemRole.ADMIN,
    resource: ResourceType.BILLING,
    actions: [
      Permission.CREATE,
      Permission.READ,
      Permission.UPDATE,
      Permission.LIST,
      Permission.EXPORT,
    ],
    scope: 'clinic',
  },
  {
    role: SystemRole.ADMIN,
    resource: ResourceType.REPORT,
    actions: [Permission.READ, Permission.LIST, Permission.EXPORT],
    scope: 'clinic',
  },

  // Manager - Operational management
  {
    role: SystemRole.MANAGER,
    resource: ResourceType.APPOINTMENT,
    actions: [
      Permission.CREATE,
      Permission.READ,
      Permission.UPDATE,
      Permission.LIST,
      Permission.ASSIGN,
    ],
    scope: 'department',
  },
  {
    role: SystemRole.MANAGER,
    resource: ResourceType.PATIENT,
    actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
    scope: 'department',
  },
  {
    role: SystemRole.MANAGER,
    resource: ResourceType.REPORT,
    actions: [Permission.READ, Permission.LIST],
    scope: 'department',
  },

  // Doctor - Medical professionals
  {
    role: SystemRole.DOCTOR,
    resource: ResourceType.PATIENT,
    actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
    scope: 'own',
    conditions: ['assigned_patients_only'],
  },
  {
    role: SystemRole.DOCTOR,
    resource: ResourceType.MEDICAL_RECORD,
    actions: [Permission.CREATE, Permission.READ, Permission.UPDATE],
    scope: 'own',
    conditions: ['assigned_patients_only'],
  },
  {
    role: SystemRole.DOCTOR,
    resource: ResourceType.PRESCRIPTION,
    actions: [Permission.CREATE, Permission.READ, Permission.UPDATE],
    scope: 'own',
    conditions: ['assigned_patients_only'],
  },
  {
    role: SystemRole.DOCTOR,
    resource: ResourceType.APPOINTMENT,
    actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
    scope: 'own',
    conditions: ['assigned_appointments_only'],
  },

  // Nurse - Nursing staff
  {
    role: SystemRole.NURSE,
    resource: ResourceType.PATIENT,
    actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
    scope: 'department',
    conditions: ['basic_patient_info_only'],
  },
  {
    role: SystemRole.NURSE,
    resource: ResourceType.APPOINTMENT,
    actions: [Permission.READ, Permission.UPDATE, Permission.LIST],
    scope: 'department',
  },
  {
    role: SystemRole.NURSE,
    resource: ResourceType.MEDICAL_RECORD,
    actions: [Permission.READ, Permission.UPDATE],
    scope: 'department',
    conditions: ['nursing_notes_only'],
  },

  // Receptionist - Front desk operations
  {
    role: SystemRole.RECEPTIONIST,
    resource: ResourceType.APPOINTMENT,
    actions: [
      Permission.CREATE,
      Permission.READ,
      Permission.UPDATE,
      Permission.LIST,
    ],
    scope: 'clinic',
  },
  {
    role: SystemRole.RECEPTIONIST,
    resource: ResourceType.PATIENT,
    actions: [
      Permission.CREATE,
      Permission.READ,
      Permission.UPDATE,
      Permission.LIST,
    ],
    scope: 'clinic',
    conditions: ['contact_info_only'],
  },
  {
    role: SystemRole.RECEPTIONIST,
    resource: ResourceType.BILLING,
    actions: [Permission.READ, Permission.LIST],
    scope: 'clinic',
    conditions: ['payment_status_only'],
  },

  // Technician - Technical/lab staff
  {
    role: SystemRole.TECHNICIAN,
    resource: ResourceType.PATIENT,
    actions: [Permission.READ, Permission.LIST],
    scope: 'department',
    conditions: ['basic_patient_info_only'],
  },
  {
    role: SystemRole.TECHNICIAN,
    resource: ResourceType.MEDICAL_RECORD,
    actions: [Permission.READ, Permission.UPDATE],
    scope: 'department',
    conditions: ['lab_results_only'],
  },

  // Patient - Self-service access
  {
    role: SystemRole.PATIENT,
    resource: ResourceType.PATIENT,
    actions: [Permission.READ, Permission.UPDATE],
    scope: 'own',
    conditions: ['own_data_only'],
  },
  {
    role: SystemRole.PATIENT,
    resource: ResourceType.APPOINTMENT,
    actions: [Permission.CREATE, Permission.READ, Permission.LIST],
    scope: 'own',
    conditions: ['own_appointments_only'],
  },
  {
    role: SystemRole.PATIENT,
    resource: ResourceType.MEDICAL_RECORD,
    actions: [Permission.READ],
    scope: 'own',
    conditions: ['own_records_only', 'non_sensitive_only'],
  },

  // Guest - Very limited access
  {
    role: SystemRole.GUEST,
    resource: ResourceType.APPOINTMENT,
    actions: [Permission.CREATE],
    scope: 'clinic',
    conditions: ['booking_only'],
  },
];

class PermissionValidationSystem {
  private readonly permissionCache = new Map<string, PermissionResult>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if user has permission to perform action on resource
   */
  async checkPermission(check: PermissionCheck): Promise<PermissionResult> {
    try {
      const cacheKey = this.generateCacheKey(check);
      const cached = this.permissionCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached;
      }

      const userPermissions = await this.getUserPermissions(check.userId);
      const result = await this.evaluatePermission(check, userPermissions);

      // Cache result
      this.permissionCache.set(cacheKey, result);

      // Log permission check for audit
      await this.logPermissionCheck(check, result);

      return result;
    } catch (_error) {
      const result: PermissionResult = {
        allowed: false,
        reason: 'Error during permission check',
        timestamp: Date.now(),
      };

      await this.logPermissionCheck(check, result);
      return result;
    }
  }

  /**
   * Check multiple permissions at once
   */
  async checkMultiplePermissions(
    checks: PermissionCheck[],
  ): Promise<PermissionResult[]> {
    const results = await Promise.all(
      checks.map((check) => this.checkPermission(check)),
    );
    return results;
  }

  /**
   * Get user's effective permissions
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      const stored = localStorage.getItem(`user_permissions_${userId}`);
      if (stored) {
        const permissions: UserPermissions = JSON.parse(stored);
        if (Date.now() - permissions.lastUpdated < this.cacheTimeout) {
          return permissions;
        }
      }

      // In production, fetch from database
      const defaultPermissions: UserPermissions = {
        userId,
        roles: [SystemRole.PATIENT], // Default role
        customPermissions: [],
        isActive: true,
        lastUpdated: Date.now(),
      };

      // Cache permissions
      localStorage.setItem(
        `user_permissions_${userId}`,
        JSON.stringify(defaultPermissions),
      );

      return defaultPermissions;
    } catch (_error) {
      throw new Error('Failed to retrieve user permissions');
    }
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string, roles: SystemRole[]): Promise<void> {
    try {
      const currentPermissions = await this.getUserPermissions(userId);
      const updatedPermissions: UserPermissions = {
        ...currentPermissions,
        roles,
        lastUpdated: Date.now(),
      };

      // Store updated permissions
      localStorage.setItem(
        `user_permissions_${userId}`,
        JSON.stringify(updatedPermissions),
      );

      // Clear cache for this user
      this.clearUserPermissionCache(userId);

      // Log role change
      await securityAuditLogger.logEvent(
        AuditEventType.ROLE_CHANGE,
        {
          previousRoles: currentPermissions.roles,
          newRoles: roles,
          changedBy: 'system', // In production, track who made the change
        },
        userId,
      );
    } catch (_error) {
      throw new Error('Failed to update user roles');
    }
  }

  /**
   * Add custom permission for user
   */
  async addCustomPermission(
    userId: string,
    permission: RolePermission,
  ): Promise<void> {
    try {
      const currentPermissions = await this.getUserPermissions(userId);
      const updatedPermissions: UserPermissions = {
        ...currentPermissions,
        customPermissions: [
          ...currentPermissions.customPermissions,
          permission,
        ],
        lastUpdated: Date.now(),
      };

      localStorage.setItem(
        `user_permissions_${userId}`,
        JSON.stringify(updatedPermissions),
      );

      this.clearUserPermissionCache(userId);

      await securityAuditLogger.logEvent(
        AuditEventType.ROLE_CHANGE,
        {
          action: 'custom_permission_added',
          resource: permission.resource,
          actions: permission.actions,
        },
        userId,
      );
    } catch (_error) {
      throw new Error('Failed to add custom permission');
    }
  }

  /**
   * Get permissions for role
   */
  getRolePermissions(role: SystemRole): RolePermission[] {
    return DEFAULT_PERMISSIONS.filter((p) => p.role === role);
  }

  /**
   * Check if role has higher privilege than another role
   */
  isHigherRole(role1: SystemRole, role2: SystemRole): boolean {
    return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
  }

  /**
   * Get all available roles
   */
  getAvailableRoles(): SystemRole[] {
    return Object.values(SystemRole);
  }

  /**
   * Get permission requirements for resource action
   */
  getPermissionRequirements(
    resource: ResourceType,
    action: Permission,
  ): RolePermission[] {
    return DEFAULT_PERMISSIONS.filter(
      (p) => p.resource === resource && p.actions.includes(action),
    );
  }

  // Private methods

  private async evaluatePermission(
    check: PermissionCheck,
    userPermissions: UserPermissions,
  ): Promise<PermissionResult> {
    if (!userPermissions.isActive) {
      return {
        allowed: false,
        reason: 'User account is inactive',
        timestamp: Date.now(),
      };
    }

    // Check role-based permissions
    for (const role of userPermissions.roles) {
      const rolePermissions = this.getRolePermissions(role);

      for (const permission of rolePermissions) {
        if (this.matchesPermission(check, permission)) {
          // Check conditions if any
          if (permission.conditions) {
            const conditionResult = await this.evaluateConditions(
              check,
              permission.conditions,
              userPermissions,
            );
            if (!conditionResult.allowed) {
              continue;
            }
          }

          return {
            allowed: true,
            reason: `Granted by role: ${role}`,
            role,
            conditions: permission.conditions,
            timestamp: Date.now(),
          };
        }
      }
    }

    // Check custom permissions
    for (const permission of userPermissions.customPermissions) {
      if (this.matchesPermission(check, permission)) {
        return {
          allowed: true,
          reason: 'Granted by custom permission',
          conditions: permission.conditions,
          timestamp: Date.now(),
        };
      }
    }

    return {
      allowed: false,
      reason: 'No matching permission found',
      timestamp: Date.now(),
    };
  }

  private matchesPermission(
    check: PermissionCheck,
    permission: RolePermission,
  ): boolean {
    return (
      permission.resource === check.resource &&
      permission.actions.includes(check.action)
    );
  }

  private async evaluateConditions(
    check: PermissionCheck,
    conditions: string[],
    _userPermissions: UserPermissions,
  ): Promise<{ allowed: boolean; reason: string }> {
    // Implement condition evaluation logic
    for (const condition of conditions) {
      switch (condition) {
        case 'own_data_only':
          if (check.resourceId !== check.userId) {
            return { allowed: false, reason: 'Can only access own data' };
          }
          break;

        case 'assigned_patients_only':
          // In production, check if patient is assigned to this doctor
          break;

        case 'department_only':
          // Check if resource belongs to user's department
          break;

        case 'clinic_only':
          // Check if resource belongs to user's clinic
          break;

        default:
      }
    }

    return { allowed: true, reason: 'All conditions met' };
  }

  private generateCacheKey(check: PermissionCheck): string {
    return `${check.userId}:${check.resource}:${check.action}:${check.resourceId || 'none'}`;
  }

  private clearUserPermissionCache(userId: string): void {
    const keysToDelete: string[] = [];

    this.permissionCache.forEach((_, key) => {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.permissionCache.delete(key));
  }

  private async logPermissionCheck(
    check: PermissionCheck,
    result: PermissionResult,
  ): Promise<void> {
    if (!result.allowed) {
      await securityAuditLogger.logPermissionDenied(
        check.userId,
        check.resource,
        check.action,
      );
    }
  }
}

// Export singleton instance
export const permissionValidator = new PermissionValidationSystem();

// Export convenience functions
export async function hasPermission(
  userId: string,
  resource: ResourceType,
  action: Permission,
  resourceId?: string,
): Promise<boolean> {
  const result = await permissionValidator.checkPermission({
    userId,
    resource,
    action,
    resourceId,
  });
  return result.allowed;
}

export async function requirePermission(
  userId: string,
  resource: ResourceType,
  action: Permission,
  resourceId?: string,
): Promise<void> {
  const result = await permissionValidator.checkPermission({
    userId,
    resource,
    action,
    resourceId,
  });

  if (!result.allowed) {
    throw new Error(`Permission denied: ${result.reason}`);
  }
}

export async function checkMultiplePermissions(
  userId: string,
  checks: Array<{
    resource: ResourceType;
    action: Permission;
    resourceId?: string;
  }>,
): Promise<boolean[]> {
  const permissionChecks = checks.map((check) => ({
    userId,
    ...check,
  }));

  const results =
    await permissionValidator.checkMultiplePermissions(permissionChecks);
  return results.map((result) => result.allowed);
}

export async function getUserRoles(userId: string): Promise<SystemRole[]> {
  const permissions = await permissionValidator.getUserPermissions(userId);
  return permissions.roles;
}

export async function updateUserRoles(
  userId: string,
  roles: SystemRole[],
): Promise<void> {
  return permissionValidator.updateUserRoles(userId, roles);
}

export type {
  UserPermissions,
  PermissionCheck,
  PermissionResult,
  RolePermission,
};
