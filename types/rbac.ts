// RBAC Types for NeonPro Authentication System
// Story 1.2: Role-Based Permissions Enhancement

export type UserRole = 'owner' | 'manager' | 'staff' | 'patient';

export type Permission = 
  // User Management
  | 'users.create'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'users.invite'
  | 'users.suspend'
  
  // Patient Management
  | 'patients.create'
  | 'patients.read'
  | 'patients.update'
  | 'patients.delete'
  | 'patients.medical_records.read'
  | 'patients.medical_records.write'
  | 'patients.sensitive_data.read'
  
  // Appointment Management
  | 'appointments.create'
  | 'appointments.read'
  | 'appointments.update'
  | 'appointments.delete'
  | 'appointments.schedule'
  | 'appointments.reschedule'
  | 'appointments.cancel'
  
  // Financial Management
  | 'billing.create'
  | 'billing.read'
  | 'billing.update'
  | 'billing.delete'
  | 'payments.process'
  | 'payments.refund'
  | 'financial_reports.read'
  
  // System Administration
  | 'system.settings.read'
  | 'system.settings.write'
  | 'system.users.manage'
  | 'system.roles.manage'
  | 'system.audit.read'
  | 'system.backup.manage'
  
  // Clinic Management
  | 'clinic.settings.read'
  | 'clinic.settings.write'
  | 'clinic.staff.manage'
  | 'clinic.reports.read'
  | 'clinic.analytics.read'
  
  // Data & Privacy
  | 'data.export'
  | 'data.import'
  | 'privacy.settings.manage'
  | 'lgpd.compliance.manage';

export interface RoleDefinition {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  hierarchy: number; // 1 = highest (owner), 4 = lowest (patient)
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  clinicId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface PermissionCheck {
  userId: string;
  permission: Permission;
  resourceId?: string;
  clinicId: string;
  context?: Record<string, any>;
}

export interface PermissionResult {
  granted: boolean;
  reason?: string;
  roleUsed?: UserRole;
  hierarchyLevel?: number;
  auditId?: string;
}

export interface RoleHierarchy {
  role: UserRole;
  level: number;
  canManage: UserRole[];
  canView: UserRole[];
  restrictions: string[];
}

export interface PermissionAuditLog {
  id: string;
  userId: string;
  action: string;
  permission: Permission;
  resourceId?: string;
  clinicId: string;
  granted: boolean;
  roleUsed: UserRole;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface RolePermissionMatrix {
  [key: string]: {
    role: UserRole;
    permissions: Permission[];
    inheritsFrom?: UserRole[];
    restrictions?: {
      timeBasedAccess?: {
        allowedHours: [number, number]; // [start, end] in 24h format
        allowedDays: number[]; // 0-6, Sunday = 0
      };
      ipRestrictions?: string[]; // CIDR notation
      resourceLimits?: {
        maxPatients?: number;
        maxAppointments?: number;
      };
    };
  };
}

export interface PermissionContext {
  clinicId: string;
  userId: string;
  userRole: UserRole;
  resourceOwnerId?: string;
  resourceType?: string;
  action: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface RoleTransition {
  id: string;
  userId: string;
  fromRole: UserRole;
  toRole: UserRole;
  clinicId: string;
  requestedBy: string;
  approvedBy?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestedAt: Date;
  processedAt?: Date;
  effectiveAt?: Date;
  metadata?: Record<string, any>;
}

// Default role configurations
export const DEFAULT_ROLES: Record<UserRole, RoleDefinition> = {
  owner: {
    id: 'role_owner',
    name: 'owner',
    displayName: 'Clinic Owner',
    description: 'Full system access with all administrative privileges',
    permissions: [
      // All permissions - owner has unrestricted access
      'users.create', 'users.read', 'users.update', 'users.delete', 'users.invite', 'users.suspend',
      'patients.create', 'patients.read', 'patients.update', 'patients.delete', 
      'patients.medical_records.read', 'patients.medical_records.write', 'patients.sensitive_data.read',
      'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
      'appointments.schedule', 'appointments.reschedule', 'appointments.cancel',
      'billing.create', 'billing.read', 'billing.update', 'billing.delete',
      'payments.process', 'payments.refund', 'financial_reports.read',
      'system.settings.read', 'system.settings.write', 'system.users.manage', 
      'system.roles.manage', 'system.audit.read', 'system.backup.manage',
      'clinic.settings.read', 'clinic.settings.write', 'clinic.staff.manage',
      'clinic.reports.read', 'clinic.analytics.read',
      'data.export', 'data.import', 'privacy.settings.manage', 'lgpd.compliance.manage'
    ],
    hierarchy: 1,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  manager: {
    id: 'role_manager',
    name: 'manager',
    displayName: 'Clinic Manager',
    description: 'Administrative access with staff and operational management',
    permissions: [
      'users.read', 'users.update', 'users.invite',
      'patients.create', 'patients.read', 'patients.update', 
      'patients.medical_records.read', 'patients.medical_records.write',
      'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
      'appointments.schedule', 'appointments.reschedule', 'appointments.cancel',
      'billing.create', 'billing.read', 'billing.update',
      'payments.process', 'financial_reports.read',
      'clinic.settings.read', 'clinic.staff.manage', 'clinic.reports.read', 'clinic.analytics.read',
      'data.export'
    ],
    hierarchy: 2,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  staff: {
    id: 'role_staff',
    name: 'staff',
    displayName: 'Clinic Staff',
    description: 'Operational access for daily clinic activities',
    permissions: [
      'users.read',
      'patients.create', 'patients.read', 'patients.update',
      'patients.medical_records.read', 'patients.medical_records.write',
      'appointments.create', 'appointments.read', 'appointments.update',
      'appointments.schedule', 'appointments.reschedule',
      'billing.read', 'billing.create',
      'clinic.settings.read'
    ],
    hierarchy: 3,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  patient: {
    id: 'role_patient',
    name: 'patient',
    displayName: 'Patient',
    description: 'Limited access to own data and appointment management',
    permissions: [
      'appointments.read', 'appointments.schedule',
      'billing.read'
    ],
    hierarchy: 4,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    'users.create', 'users.read', 'users.update', 'users.delete', 'users.invite', 'users.suspend'
  ],
  PATIENT_MANAGEMENT: [
    'patients.create', 'patients.read', 'patients.update', 'patients.delete',
    'patients.medical_records.read', 'patients.medical_records.write', 'patients.sensitive_data.read'
  ],
  APPOINTMENT_MANAGEMENT: [
    'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
    'appointments.schedule', 'appointments.reschedule', 'appointments.cancel'
  ],
  FINANCIAL_MANAGEMENT: [
    'billing.create', 'billing.read', 'billing.update', 'billing.delete',
    'payments.process', 'payments.refund', 'financial_reports.read'
  ],
  SYSTEM_ADMINISTRATION: [
    'system.settings.read', 'system.settings.write', 'system.users.manage',
    'system.roles.manage', 'system.audit.read', 'system.backup.manage'
  ],
  CLINIC_MANAGEMENT: [
    'clinic.settings.read', 'clinic.settings.write', 'clinic.staff.manage',
    'clinic.reports.read', 'clinic.analytics.read'
  ],
  DATA_PRIVACY: [
    'data.export', 'data.import', 'privacy.settings.manage', 'lgpd.compliance.manage'
  ]
} as const;
