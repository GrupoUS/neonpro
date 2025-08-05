import type { z } from "zod";

/**
 * Role-Based Access Control (RBAC) for Healthcare
 * Implements fine-grained permissions for medical data access
 * - Role hierarchy with inheritance
 * - Time-based permissions
 * - Patient-specific access controls
 * - Audit trail for all access decisions
 */

// Healthcare roles with hierarchy
export enum Role {
  // Administrative roles
  SUPER_ADMIN = "super_admin",
  CLINIC_ADMIN = "clinic_admin",
  IT_ADMIN = "it_admin",

  // Medical staff
  CHIEF_DOCTOR = "chief_doctor",
  DOCTOR = "doctor",
  SPECIALIST = "specialist",
  RESIDENT = "resident",

  // Nursing staff
  HEAD_NURSE = "head_nurse",
  NURSE = "nurse",
  NURSING_ASSISTANT = "nursing_assistant",

  // Support staff
  RECEPTIONIST = "receptionist",
  BILLING_CLERK = "billing_clerk",
  LAB_TECHNICIAN = "lab_technician",

  // External
  PATIENT = "patient",
  GUARDIAN = "guardian",
  INSURANCE_REVIEWER = "insurance_reviewer",

  // System
  SYSTEM = "system",
  API_CLIENT = "api_client",
}

// Granular permissions
export enum Permission {
  // Patient data permissions
  READ_PATIENT_BASIC = "read_patient_basic",
  READ_PATIENT_FULL = "read_patient_full",
  WRITE_PATIENT_BASIC = "write_patient_basic",
  WRITE_PATIENT_FULL = "write_patient_full",
  DELETE_PATIENT = "delete_patient",

  // Medical records
  READ_MEDICAL_RECORDS = "read_medical_records",
  WRITE_MEDICAL_RECORDS = "write_medical_records",
  DELETE_MEDICAL_RECORDS = "delete_medical_records",
  SIGN_MEDICAL_RECORDS = "sign_medical_records",

  // Appointments
  READ_APPOINTMENTS = "read_appointments",
  CREATE_APPOINTMENTS = "create_appointments",
  MODIFY_APPOINTMENTS = "modify_appointments",
  CANCEL_APPOINTMENTS = "cancel_appointments",

  // Financial
  READ_BILLING = "read_billing",
  WRITE_BILLING = "write_billing",
  PROCESS_PAYMENTS = "process_payments",
  REFUND_PAYMENTS = "refund_payments",

  // Prescriptions
  READ_PRESCRIPTIONS = "read_prescriptions",
  WRITE_PRESCRIPTIONS = "write_prescriptions",
  APPROVE_PRESCRIPTIONS = "approve_prescriptions",

  // Lab results
  READ_LAB_RESULTS = "read_lab_results",
  WRITE_LAB_RESULTS = "write_lab_results",
  APPROVE_LAB_RESULTS = "approve_lab_results",

  // Administrative
  MANAGE_USERS = "manage_users",
  MANAGE_ROLES = "manage_roles",
  VIEW_AUDIT_LOGS = "view_audit_logs",
  SYSTEM_SETTINGS = "system_settings",

  // Reports
  GENERATE_REPORTS = "generate_reports",
  EXPORT_DATA = "export_data",

  // Emergency
  EMERGENCY_ACCESS = "emergency_access",
  BREAK_GLASS = "break_glass",
}

// Access context for fine-grained control
export enum AccessContext {
  NORMAL = "normal",
  EMERGENCY = "emergency",
  AUDIT = "audit",
  EXPORT = "export",
  RESEARCH = "research",
}

// Permission schema
export const permissionSchema = z.object({
  permission: z.nativeEnum(Permission),
  granted: z.boolean(),
  conditions: z
    .array(
      z.object({
        type: z.enum(["time", "location", "patient", "department", "resource"]),
        condition: z.string(),
        value: z.any(),
      }),
    )
    .default([]),
  expiresAt: z.date().optional(),
  grantedBy: z.string().uuid().optional(),
  grantedAt: z.date().default(() => new Date()),
});

export type PermissionGrant = z.infer<typeof permissionSchema>;

// Role definition schema
export const roleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.nativeEnum(Role),
  displayName: z.string(),
  description: z.string(),

  // Role hierarchy
  parentRoles: z.array(z.nativeEnum(Role)).default([]),
  inheritPermissions: z.boolean().default(true),

  // Default permissions
  permissions: z.array(permissionSchema).default([]),

  // Constraints
  maxSessionDuration: z.number().optional(), // minutes
  requiresMFA: z.boolean().default(false),
  ipRestrictions: z.array(z.string()).default([]),
  timeRestrictions: z
    .object({
      allowedDays: z.array(z.number()).default([0, 1, 2, 3, 4, 5, 6]), // 0 = Sunday
      startTime: z.string().optional(), // HH:MM
      endTime: z.string().optional(), // HH:MM
    })
    .optional(),

  // Metadata
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type RoleDefinition = z.infer<typeof roleSchema>;

// User role assignment schema
export const userRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  role: z.nativeEnum(Role),

  // Assignment details
  assignedBy: z.string().uuid(),
  assignedAt: z.date().default(() => new Date()),
  expiresAt: z.date().optional(),

  // Additional permissions (beyond role)
  additionalPermissions: z.array(permissionSchema).default([]),

  // Restrictions (overrides role permissions)
  restrictions: z
    .object({
      allowedPatients: z.array(z.string().uuid()).optional(),
      allowedDepartments: z.array(z.string()).optional(),
      maxRecordsPerDay: z.number().optional(),
      requiresApproval: z.boolean().default(false),
    })
    .optional(),

  isActive: z.boolean().default(true),
});

export type UserRole = z.infer<typeof userRoleSchema>;

export class HealthcareRBAC {
  // Role hierarchy definition (parent -> children)
  private static readonly ROLE_HIERARCHY = {
    [Role.SUPER_ADMIN]: [Role.CLINIC_ADMIN, Role.IT_ADMIN],
    [Role.CLINIC_ADMIN]: [Role.CHIEF_DOCTOR, Role.HEAD_NURSE, Role.BILLING_CLERK],
    [Role.CHIEF_DOCTOR]: [Role.DOCTOR, Role.SPECIALIST],
    [Role.DOCTOR]: [Role.RESIDENT],
    [Role.HEAD_NURSE]: [Role.NURSE],
    [Role.NURSE]: [Role.NURSING_ASSISTANT],
    [Role.SPECIALIST]: [],
    [Role.RESIDENT]: [],
    [Role.NURSING_ASSISTANT]: [],
    [Role.RECEPTIONIST]: [],
    [Role.BILLING_CLERK]: [],
    [Role.LAB_TECHNICIAN]: [],
    [Role.PATIENT]: [],
    [Role.GUARDIAN]: [],
    [Role.INSURANCE_REVIEWER]: [],
    [Role.SYSTEM]: [],
    [Role.API_CLIENT]: [],
    [Role.IT_ADMIN]: [],
  };

  // Default permissions for each role
  private static readonly ROLE_PERMISSIONS = {
    [Role.SUPER_ADMIN]: [
      Permission.MANAGE_USERS,
      Permission.MANAGE_ROLES,
      Permission.VIEW_AUDIT_LOGS,
      Permission.SYSTEM_SETTINGS,
      Permission.EMERGENCY_ACCESS,
    ],

    [Role.CLINIC_ADMIN]: [
      Permission.READ_PATIENT_FULL,
      Permission.WRITE_PATIENT_BASIC,
      Permission.READ_APPOINTMENTS,
      Permission.MODIFY_APPOINTMENTS,
      Permission.READ_BILLING,
      Permission.WRITE_BILLING,
      Permission.GENERATE_REPORTS,
      Permission.MANAGE_USERS,
    ],

    [Role.DOCTOR]: [
      Permission.READ_PATIENT_FULL,
      Permission.WRITE_PATIENT_FULL,
      Permission.READ_MEDICAL_RECORDS,
      Permission.WRITE_MEDICAL_RECORDS,
      Permission.SIGN_MEDICAL_RECORDS,
      Permission.READ_PRESCRIPTIONS,
      Permission.WRITE_PRESCRIPTIONS,
      Permission.READ_LAB_RESULTS,
      Permission.READ_APPOINTMENTS,
      Permission.MODIFY_APPOINTMENTS,
      Permission.EMERGENCY_ACCESS,
    ],

    [Role.NURSE]: [
      Permission.READ_PATIENT_BASIC,
      Permission.WRITE_PATIENT_BASIC,
      Permission.READ_MEDICAL_RECORDS,
      Permission.READ_APPOINTMENTS,
      Permission.CREATE_APPOINTMENTS,
      Permission.READ_PRESCRIPTIONS,
    ],

    [Role.RECEPTIONIST]: [
      Permission.READ_PATIENT_BASIC,
      Permission.WRITE_PATIENT_BASIC,
      Permission.READ_APPOINTMENTS,
      Permission.CREATE_APPOINTMENTS,
      Permission.MODIFY_APPOINTMENTS,
      Permission.READ_BILLING,
    ],

    [Role.PATIENT]: [
      Permission.READ_PATIENT_BASIC, // Own data only
      Permission.READ_MEDICAL_RECORDS, // Own records only
      Permission.READ_APPOINTMENTS, // Own appointments only
      Permission.CREATE_APPOINTMENTS,
    ],
  };

  /**
   * Check if user has permission for specific action
   */
  static async hasPermission(
    userId: string,
    permission: Permission,
    context: AccessContext = AccessContext.NORMAL,
    resourceId?: string,
  ): Promise<{
    granted: boolean;
    reason?: string;
    conditions?: any[];
    auditRequired?: boolean;
  }> {
    try {
      // Get user's roles and permissions
      const userRoles = await this.getUserRoles(userId);

      if (userRoles.length === 0) {
        return { granted: false, reason: "No roles assigned" };
      }

      // Check each role for the permission
      for (const userRole of userRoles) {
        const hasPermission = await this.checkRolePermission(
          userRole,
          permission,
          context,
          resourceId,
        );

        if (hasPermission.granted) {
          // Log access decision for audit
          await this.logAccessDecision(userId, permission, context, true, hasPermission.reason);

          return {
            granted: true,
            conditions: hasPermission.conditions,
            auditRequired: this.requiresAudit(permission),
          };
        }
      }

      // Permission denied
      await this.logAccessDecision(userId, permission, context, false, "Permission denied");

      return { granted: false, reason: "Insufficient permissions" };
    } catch (error) {
      console.error("Permission check failed:", error);
      return { granted: false, reason: "Permission check failed" };
    }
  }

  /**
   * Emergency access override (break glass)
   */
  static async emergencyAccess(
    userId: string,
    permission: Permission,
    patientId: string,
    justification: string,
    approver?: string,
  ): Promise<{
    granted: boolean;
    emergencyToken?: string;
    expiresAt?: Date;
  }> {
    // Verify user can use emergency access
    const canBreakGlass = await this.hasPermission(
      userId,
      Permission.BREAK_GLASS,
      AccessContext.EMERGENCY,
    );

    if (!canBreakGlass.granted) {
      return { granted: false };
    }

    // Create emergency access token (short-lived)
    const emergencyToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours

    // Store emergency access record
    await this.storeEmergencyAccess({
      token: emergencyToken,
      userId,
      permission,
      patientId,
      justification,
      approver,
      expiresAt,
      createdAt: new Date(),
    });

    // Log emergency access
    await this.logAccessDecision(
      userId,
      permission,
      AccessContext.EMERGENCY,
      true,
      `Emergency access: ${justification}`,
    );

    // Alert security team
    await this.alertEmergencyAccess(userId, permission, patientId, justification);

    return {
      granted: true,
      emergencyToken,
      expiresAt,
    };
  }

  /**
   * Assign role to user
   */
  static async assignRole(
    userId: string,
    role: Role,
    assignedBy: string,
    expiresAt?: Date,
    restrictions?: any,
  ): Promise<UserRole> {
    const userRole: UserRole = {
      userId,
      roleId: crypto.randomUUID(),
      role,
      assignedBy,
      expiresAt,
      restrictions,
      assignedAt: new Date(),
      additionalPermissions: [],
      isActive: true,
    };

    // Validate role assignment
    const canAssign = await this.canAssignRole(assignedBy, role);
    if (!canAssign) {
      throw new Error("Insufficient permissions to assign role");
    }

    // Store user role
    await this.storeUserRole(userRole);

    // Log role assignment
    await this.logRoleChange(userId, "assigned", role, assignedBy);

    return userRole;
  }

  /**
   * Revoke role from user
   */
  static async revokeRole(
    userId: string,
    role: Role,
    revokedBy: string,
    reason: string,
  ): Promise<void> {
    // Check permission to revoke
    const canRevoke = await this.canRevokeRole(revokedBy, role);
    if (!canRevoke) {
      throw new Error("Insufficient permissions to revoke role");
    }

    // Deactivate user role
    await this.deactivateUserRole(userId, role);

    // Log role revocation
    await this.logRoleChange(userId, "revoked", role, revokedBy, reason);
  }

  /**
   * Get effective permissions for user
   */
  static async getUserPermissions(userId: string): Promise<{
    roles: Role[];
    permissions: Permission[];
    restrictions: any[];
    expiringRoles: Array<{ role: Role; expiresAt: Date }>;
  }> {
    const userRoles = await this.getUserRoles(userId);
    const permissions = new Set<Permission>();
    const restrictions: any[] = [];
    const expiringRoles: Array<{ role: Role; expiresAt: Date }> = [];

    for (const userRole of userRoles) {
      // Get role permissions (including inherited)
      const rolePermissions = await this.getRolePermissions(userRole.role);
      rolePermissions.forEach((p) => permissions.add(p));

      // Add additional permissions
      userRole.additionalPermissions.forEach((perm) => {
        if (perm.granted) permissions.add(perm.permission);
      });

      // Collect restrictions
      if (userRole.restrictions) {
        restrictions.push(userRole.restrictions);
      }

      // Check for expiring roles
      if (
        userRole.expiresAt &&
        userRole.expiresAt <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ) {
        expiringRoles.push({ role: userRole.role, expiresAt: userRole.expiresAt });
      }
    }

    return {
      roles: userRoles.map((ur) => ur.role),
      permissions: Array.from(permissions),
      restrictions,
      expiringRoles,
    };
  }

  /**
   * Generate access control report for compliance
   */
  static async generateAccessReport(params: {
    startDate: Date;
    endDate: Date;
    userId?: string;
    permission?: Permission;
  }): Promise<{
    totalAccessAttempts: number;
    grantedAccess: number;
    deniedAccess: number;
    emergencyAccess: number;
    accessByRole: Record<Role, number>;
    accessByPermission: Record<Permission, number>;
    securityAlerts: number;
    complianceIssues: string[];
  }> {
    // TODO: Generate comprehensive access control report
    return {
      totalAccessAttempts: 0,
      grantedAccess: 0,
      deniedAccess: 0,
      emergencyAccess: 0,
      accessByRole: {} as Record<Role, number>,
      accessByPermission: {} as Record<Permission, number>,
      securityAlerts: 0,
      complianceIssues: [],
    };
  }

  // Private helper methods
  private static async getUserRoles(userId: string): Promise<UserRole[]> {
    // TODO: Query database for user roles
    return [];
  }

  private static async checkRolePermission(
    userRole: UserRole,
    permission: Permission,
    context: AccessContext,
    resourceId?: string,
  ): Promise<{ granted: boolean; reason?: string; conditions?: any[] }> {
    // Get role definition
    const roleDefinition = await this.getRoleDefinition(userRole.role);
    if (!roleDefinition) {
      return { granted: false, reason: "Role not found" };
    }

    // Check if role has permission (including inherited)
    const rolePermissions = await this.getRolePermissions(userRole.role);
    if (!rolePermissions.includes(permission)) {
      return { granted: false, reason: "Permission not in role" };
    }

    // Check time restrictions
    if (roleDefinition.timeRestrictions) {
      const now = new Date();
      const timeValid = this.checkTimeRestrictions(now, roleDefinition.timeRestrictions);
      if (!timeValid) {
        return { granted: false, reason: "Outside allowed time" };
      }
    }

    // Check user-specific restrictions
    if (userRole.restrictions) {
      const restrictionValid = this.checkUserRestrictions(userRole.restrictions, resourceId);
      if (!restrictionValid) {
        return { granted: false, reason: "User restriction violated" };
      }
    }

    return { granted: true, reason: "Permission granted" };
  }

  private static async getRoleDefinition(role: Role): Promise<RoleDefinition | null> {
    // TODO: Get role definition from database
    return null;
  }

  private static async getRolePermissions(role: Role): Promise<Permission[]> {
    // Get permissions for role including inherited permissions
    const permissions = new Set<Permission>();

    // Add direct permissions
    const directPermissions = this.ROLE_PERMISSIONS[role] || [];
    directPermissions.forEach((p) => permissions.add(p));

    // Add inherited permissions from parent roles
    const parentRoles = this.getParentRoles(role);
    for (const parentRole of parentRoles) {
      const parentPermissions = await this.getRolePermissions(parentRole);
      parentPermissions.forEach((p) => permissions.add(p));
    }

    return Array.from(permissions);
  }

  private static getParentRoles(role: Role): Role[] {
    // Find parent roles in hierarchy
    for (const [parentRole, childRoles] of Object.entries(this.ROLE_HIERARCHY)) {
      if (childRoles.includes(role)) {
        return [parentRole as Role, ...this.getParentRoles(parentRole as Role)];
      }
    }
    return [];
  }

  private static checkTimeRestrictions(now: Date, restrictions: any): boolean {
    // Check day of week
    const dayOfWeek = now.getDay();
    if (!restrictions.allowedDays.includes(dayOfWeek)) {
      return false;
    }

    // Check time of day
    if (restrictions.startTime && restrictions.endTime) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = restrictions.startTime.split(":").map(Number);
      const [endHour, endMin] = restrictions.endTime.split(":").map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      if (currentTime < startTime || currentTime > endTime) {
        return false;
      }
    }

    return true;
  }

  private static checkUserRestrictions(restrictions: any, resourceId?: string): boolean {
    // Check patient restrictions
    if (restrictions.allowedPatients && resourceId) {
      return restrictions.allowedPatients.includes(resourceId);
    }

    // Add more restriction checks as needed
    return true;
  }

  private static requiresAudit(permission: Permission): boolean {
    const auditRequiredPermissions = [
      Permission.READ_MEDICAL_RECORDS,
      Permission.WRITE_MEDICAL_RECORDS,
      Permission.DELETE_PATIENT,
      Permission.EMERGENCY_ACCESS,
      Permission.EXPORT_DATA,
    ];
    return auditRequiredPermissions.includes(permission);
  }

  private static async canAssignRole(assignerId: string, role: Role): Promise<boolean> {
    // Check if assigner has permission to assign this role
    const canManageUsers = await this.hasPermission(assignerId, Permission.MANAGE_USERS);
    return canManageUsers.granted;
  }

  private static async canRevokeRole(revokerId: string, role: Role): Promise<boolean> {
    // Check if revoker has permission to revoke this role
    const canManageUsers = await this.hasPermission(revokerId, Permission.MANAGE_USERS);
    return canManageUsers.granted;
  }

  // Storage and logging methods (to be implemented)
  private static async storeUserRole(userRole: UserRole): Promise<void> {
    console.log("User role stored:", userRole);
  }

  private static async deactivateUserRole(userId: string, role: Role): Promise<void> {
    console.log("User role deactivated:", { userId, role });
  }

  private static async storeEmergencyAccess(access: any): Promise<void> {
    console.log("Emergency access stored:", access);
  }

  private static async logAccessDecision(
    userId: string,
    permission: Permission,
    context: AccessContext,
    granted: boolean,
    reason?: string,
  ): Promise<void> {
    console.log("Access decision logged:", { userId, permission, context, granted, reason });
  }

  private static async logRoleChange(
    userId: string,
    action: string,
    role: Role,
    changedBy: string,
    reason?: string,
  ): Promise<void> {
    console.log("Role change logged:", { userId, action, role, changedBy, reason });
  }

  private static async alertEmergencyAccess(
    userId: string,
    permission: Permission,
    patientId: string,
    justification: string,
  ): Promise<void> {
    console.log("Emergency access alert:", { userId, permission, patientId, justification });
  }
}
