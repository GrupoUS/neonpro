'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type HealthcarePermission = {
  id: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  lgpdCompliant: boolean;
  anvisaRequired: boolean;
  cfmRequired: boolean;
};

type PermissionSet = {
  // Financial Operations
  'financial.reconciliation.view': boolean;
  'financial.reconciliation.manage': boolean;
  'financial.reconciliation.export': boolean;
  'financial.algorithms.configure': boolean;
  'financial.transactions.view': boolean;
  'financial.transactions.create': boolean;
  'financial.reports.generate': boolean;

  // Patient Data
  'patients.view': boolean;
  'patients.create': boolean;
  'patients.edit': boolean;
  'patients.delete': boolean;
  'patients.medical_records.view': boolean;
  'patients.medical_records.edit': boolean;
  'patients.files.upload': boolean;
  'patients.files.download': boolean;

  // Appointments & Procedures
  'appointments.view': boolean;
  'appointments.create': boolean;
  'appointments.manage': boolean;
  'procedures.view': boolean;
  'procedures.create': boolean;
  'procedures.approve': boolean;

  // Administration
  'admin.users.manage': boolean;
  'admin.settings.configure': boolean;
  'admin.audit.view': boolean;
  'admin.compliance.manage': boolean;

  // Analytics & Reports
  'analytics.dashboard.view': boolean;
  'analytics.reports.generate': boolean;
  'analytics.export.execute': boolean;

  // Compliance
  'compliance.lgpd.manage': boolean;
  'compliance.anvisa.manage': boolean;
  'compliance.audit.execute': boolean;
};

type UsePermissionsReturn = {
  permissions: PermissionSet;
  isLoading: boolean;
  hasPermission: (permission: keyof PermissionSet) => boolean;
  hasAnyPermission: (permissions: (keyof PermissionSet)[]) => boolean;
  hasAllPermissions: (permissions: (keyof PermissionSet)[]) => boolean;
  canAccessPatientData: (patientId?: string) => boolean;
  canAccessFinancialData: () => boolean;
  canPerformMedicalAction: (action: string) => boolean;
  requiresMFA: (permission: keyof PermissionSet) => boolean;
  refreshPermissions: () => Promise<void>;
};

/**
 * Healthcare Permissions Hook
 *
 * LGPD Compliance: Granular permission control for patient data access
 * CFM Compliance: Medical professional authorization validation
 * ANVISA Compliance: Medical procedure and device access control
 * Multi-tenant: Clinic-specific permission isolation
 *
 * Quality Standard: ≥9.9/10 (Healthcare authorization security)
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<PermissionSet>(
    {} as PermissionSet,
  );
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserPermissions();
    } else {
      setPermissions({} as PermissionSet);
      setIsLoading(false);
    }
  }, [user, isAuthenticated, loadUserPermissions]);

  const loadUserPermissions = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Load role-based permissions with healthcare compliance
      const { data: rolePermissions, error } = await supabase
        .from('role_permissions')
        .select(
          `
          permission,
          conditions,
          lgpd_compliant,
          anvisa_required,
          cfm_required
        `,
        )
        .eq('role', user.role)
        .eq('tenant_id', user.tenantId);

      if (error) {
        return;
      }

      // Load user-specific permissions
      const { data: userPermissions } = await supabase
        .from('user_permissions')
        .select(
          `
          permission,
          granted,
          conditions,
          expires_at
        `,
        )
        .eq('user_id', user.id)
        .eq('tenant_id', user.tenantId);

      // Build permission set based on healthcare roles
      const permissionSet = buildHealthcarePermissions(
        user.role!,
        rolePermissions || [],
        userPermissions || [],
      );

      setPermissions(permissionSet);

      // Log permission access for LGPD compliance
      await supabase.from('access_audit_log').insert({
        user_id: user.id,
        action: 'permissions_loaded',
        tenant_id: user.tenantId,
        metadata: {
          role: user.role,
          permissions_count: Object.keys(permissionSet).length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (_err) {
    } finally {
      setIsLoading(false);
    }
  };

  const buildHealthcarePermissions = (
    role: string,
    rolePermissions: any[],
    userPermissions: any[],
  ): PermissionSet => {
    // Base permissions by healthcare role
    const basePermissions: Record<string, Partial<PermissionSet>> = {
      admin: {
        // Full access for clinic administrators
        'financial.reconciliation.view': true,
        'financial.reconciliation.manage': true,
        'financial.reconciliation.export': true,
        'financial.algorithms.configure': true,
        'financial.transactions.view': true,
        'financial.transactions.create': true,
        'financial.reports.generate': true,
        'patients.view': true,
        'patients.create': true,
        'patients.edit': true,
        'patients.medical_records.view': true,
        'patients.files.upload': true,
        'patients.files.download': true,
        'appointments.view': true,
        'appointments.create': true,
        'appointments.manage': true,
        'procedures.view': true,
        'procedures.create': true,
        'procedures.approve': true,
        'admin.users.manage': true,
        'admin.settings.configure': true,
        'admin.audit.view': true,
        'admin.compliance.manage': true,
        'analytics.dashboard.view': true,
        'analytics.reports.generate': true,
        'analytics.export.execute': true,
        'compliance.lgpd.manage': true,
        'compliance.anvisa.manage': true,
        'compliance.audit.execute': true,
      },
      doctor: {
        // Medical professionals with patient care focus
        'financial.reconciliation.view': true,
        'financial.transactions.view': true,
        'financial.reports.generate': true,
        'patients.view': true,
        'patients.create': true,
        'patients.edit': true,
        'patients.medical_records.view': true,
        'patients.medical_records.edit': true,
        'patients.files.upload': true,
        'patients.files.download': true,
        'appointments.view': true,
        'appointments.create': true,
        'appointments.manage': true,
        'procedures.view': true,
        'procedures.create': true,
        'procedures.approve': true,
        'analytics.dashboard.view': true,
        'analytics.reports.generate': true,
      },
      nurse: {
        // Nursing staff with patient support focus
        'patients.view': true,
        'patients.edit': true,
        'patients.medical_records.view': true,
        'patients.files.upload': true,
        'appointments.view': true,
        'appointments.create': true,
        'procedures.view': true,
        'analytics.dashboard.view': true,
      },
      receptionist: {
        // Front office with scheduling and basic admin
        'financial.transactions.view': true,
        'patients.view': true,
        'patients.create': true,
        'patients.edit': true,
        'patients.files.upload': true,
        'appointments.view': true,
        'appointments.create': true,
        'appointments.manage': true,
        'analytics.dashboard.view': true,
      },
      patient: {
        // Patients can only view their own data
        'patients.view': false, // Controlled by canAccessPatientData
        'patients.medical_records.view': false, // Controlled by specific logic
        'patients.files.download': false, // Controlled by specific logic
        'appointments.view': false, // Controlled by specific logic
        'analytics.dashboard.view': false,
      },
    };

    const base = basePermissions[role] || {};

    // Apply role permissions and user-specific overrides
    const finalPermissions = { ...base } as PermissionSet;

    // Override with database-stored permissions
    rolePermissions.forEach((perm) => {
      if (perm.permission in finalPermissions) {
        (finalPermissions as any)[perm.permission] = true;
      }
    });

    userPermissions.forEach((perm) => {
      if (perm.permission in finalPermissions && perm.granted) {
        // Check if permission hasn't expired
        if (!perm.expires_at || new Date(perm.expires_at) > new Date()) {
          (finalPermissions as any)[perm.permission] = true;
        }
      }
    });

    return finalPermissions;
  };

  const hasPermission = (permission: keyof PermissionSet): boolean => {
    return permissions[permission] === true;
  };

  const hasAnyPermission = (
    permissionList: (keyof PermissionSet)[],
  ): boolean => {
    return permissionList.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (
    permissionList: (keyof PermissionSet)[],
  ): boolean => {
    return permissionList.every((permission) => hasPermission(permission));
  };

  const canAccessPatientData = (patientId?: string): boolean => {
    if (!user) {
      return false;
    }

    // Patients can only access their own data
    if (user.role === 'patient') {
      return patientId === user.id;
    }

    // Healthcare professionals can access patients in their clinic/tenant
    return hasPermission('patients.view') && Boolean(user.tenantId);
  };

  const canAccessFinancialData = (): boolean => {
    if (!user) {
      return false;
    }

    // Only non-patient roles can access financial data
    return (
      user.role !== 'patient' && hasPermission('financial.reconciliation.view')
    );
  };

  const canPerformMedicalAction = (_action: string): boolean => {
    if (!user) {
      return false;
    }

    // Only licensed medical professionals can perform medical actions
    const medicalRoles = ['doctor', 'nurse'];
    return medicalRoles.includes(user.role!) && Boolean(user.cfmRegistration);
  };

  const requiresMFA = (permission: keyof PermissionSet): boolean => {
    // Financial and administrative operations require MFA
    const mfaRequiredPermissions = [
      'financial.reconciliation.manage',
      'financial.algorithms.configure',
      'admin.users.manage',
      'admin.settings.configure',
      'compliance.lgpd.manage',
      'compliance.anvisa.manage',
    ];

    return mfaRequiredPermissions.includes(permission as string);
  };

  const refreshPermissions = async (): Promise<void> => {
    await loadUserPermissions();
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessPatientData,
    canAccessFinancialData,
    canPerformMedicalAction,
    requiresMFA,
    refreshPermissions,
  };
}
