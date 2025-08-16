// Role-Based Access Control Types

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'in'
    | 'not_in'
    | 'greater_than'
    | 'less_than';
  value: any;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface AccessRequest {
  id: string;
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
  requestedAt: Date;
  result: 'granted' | 'denied';
  reason?: string;
}

export interface RBACContext {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  organizationId?: string;
  departmentId?: string;
  [key: string]: any;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface RoleHierarchy {
  parentRoleId: string;
  childRoleId: string;
  inheritPermissions: boolean;
}

export interface ResourceDefinition {
  name: string;
  description: string;
  actions: string[];
  attributes?: string[];
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  conditions: PermissionCondition[];
  priority: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  result: 'success' | 'failure';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

// Predefined system roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

// Predefined resources
export const RESOURCES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  ORGANIZATION: 'organization',
  DEPARTMENT: 'department',
  PATIENT: 'patient',
  APPOINTMENT: 'appointment',
  TREATMENT: 'treatment',
  BILLING: 'billing',
  REPORT: 'report',
} as const;

// Predefined actions
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];
