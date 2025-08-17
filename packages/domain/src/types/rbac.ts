// Tipos RBAC centrais para o pacote domain

export type UserRole =
  | 'admin'
  | 'manager'
  | 'doctor'
  | 'nurse'
  | 'receptionist'
  | 'patient'
  | 'guest';

export type Permission =
  | 'read:patients'
  | 'write:patients'
  | 'delete:patients'
  | 'read:appointments'
  | 'write:appointments'
  | 'delete:appointments'
  | 'read:treatments'
  | 'write:treatments'
  | 'delete:treatments'
  | 'read:reports'
  | 'write:reports'
  | 'admin:system'
  | 'admin:users'
  | 'admin:settings';

export type PermissionResult = {
  allowed: boolean;
  reason?: string;
  context?: Record<string, any>;
};

export type UserContext = {
  userId: string;
  role: UserRole;
  permissions: Permission[];
  organizationId?: string;
  departmentId?: string;
};

// Re-export para compatibilidade
export type { PermissionResult as PermissionCheckResult };
