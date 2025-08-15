/**
 * NeonPro Healthcare Permissions Hook
 * AUTH-02 Implementation - React Hook for Permission Management
 *
 * Features:
 * - React hook for permission checking with healthcare context
 * - Real-time permission updates via Supabase subscriptions
 * - Emergency override capabilities
 * - Medical license and CFM compliance validation
 * - Context-aware permission evaluation
 * - Performance optimized with caching
 */

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { HealthcareRole, type MedicalSpecialty } from '@/lib/auth/permissions';
import {
  HealthcareRBACEngine,
  type PermissionCheckResult,
  type UserRoleContext,
} from '@/lib/auth/rbac';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UsePermissionsOptions {
  /** Enable real-time permission updates */
  realtime?: boolean;

  /** Cache duration in milliseconds */
  cacheDuration?: number;

  /** Auto-refresh permissions interval */
  refreshInterval?: number;

  /** Enable emergency override capabilities */
  allowEmergencyOverride?: boolean;
}

interface PermissionContext {
  clinicId?: string;
  patientId?: string;
  resourceId?: string;
  emergencyOverride?: boolean;
}

interface UsePermissionsReturn {
  // Permission checking
  checkPermission: (
    permission: string,
    context?: PermissionContext
  ) => Promise<PermissionCheckResult>;
  checkPermissions: (
    permissions: string[],
    context?: PermissionContext
  ) => Promise<PermissionCheckResult[]>;
  hasPermission: (permission: string, context?: PermissionContext) => boolean;
  hasAnyPermission: (
    permissions: string[],
    context?: PermissionContext
  ) => boolean;
  hasAllPermissions: (
    permissions: string[],
    context?: PermissionContext
  ) => boolean;

  // User context
  userRole: HealthcareRole;
  userContext: UserRoleContext | null;
  effectivePermissions: string[];

  // Medical context
  medicalLicense: string | null;
  cfmNumber: string | null;
  medicalSpecialty: MedicalSpecialty | null;
  additionalSpecialties: MedicalSpecialty[];
  licenseActive: boolean;
  licenseExpiry: Date | null;

  // Emergency capabilities
  hasEmergencyOverride: boolean;
  requestEmergencyOverride: (
    permission: string,
    reason: string
  ) => Promise<boolean>;

  // State management
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Cache management
  refreshPermissions: () => Promise<void>;
  clearCache: () => void;

  // Real-time updates
  subscribeToUpdates: () => () => void;
}

interface PermissionCache {
  [key: string]: {
    result: PermissionCheckResult;
    timestamp: number;
  };
}

// ============================================================================
// PERMISSIONS HOOK
// ============================================================================

/**
 * Healthcare Permissions Hook with CFM Compliance
 */
export function usePermissions(
  options: UsePermissionsOptions = {}
): UsePermissionsReturn {
  const {
    realtime = true,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    refreshInterval = 30 * 60 * 1000, // 30 minutes
    allowEmergencyOverride = false,
  } = options;

  // Dependencies
  const { user, session } = useSession();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserRoleContext | null>(null);
  const [effectivePermissions, setEffectivePermissions] = useState<string[]>(
    []
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cache and refs
  const permissionCache = useRef<PermissionCache>({});
  const rbacEngine = useRef<HealthcareRBACEngine>();
  const refreshTimer = useRef<NodeJS.Timeout>();
  const subscriptionRef = useRef<any>();

  // Initialize RBAC engine
  useEffect(() => {
    if (supabase && !rbacEngine.current) {
      rbacEngine.current = new HealthcareRBACEngine(supabase);
    }
  }, [supabase]);

  // Load user permissions on session change
  useEffect(() => {
    if (user?.id) {
      loadUserPermissions();
    } else {
      resetPermissions();
    }
  }, [user?.id]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (realtime && user?.id) {
      const unsubscribe = subscribeToUpdates();
      return unsubscribe;
    }
  }, [realtime, user?.id]);

  // Setup auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshTimer.current = setInterval(() => {
        refreshPermissions();
      }, refreshInterval);

      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [refreshInterval]);

  // ============================================================================
  // CORE PERMISSION FUNCTIONS
  // ============================================================================

  /**
   * Load user permissions and context
   */
  const loadUserPermissions = useCallback(async () => {
    if (!(user?.id && rbacEngine.current)) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load user role context
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          *,
          medical_licenses (
            license_number,
            cfm_number,
            specialty,
            additional_specialties,
            active,
            expires_at
          )
        `)
        .eq('user_id', user.id)
        .eq('active', true)
        .single();

      if (roleError || !roleData) {
        throw new Error('Failed to load user role context');
      }

      // Parse user context
      const context: UserRoleContext = {
        user_id: roleData.user_id,
        role: roleData.role as HealthcareRole,
        clinic_id: roleData.clinic_id,
        franchise_id: roleData.franchise_id,
        medical_license: roleData.medical_licenses?.license_number || null,
        cfm_number: roleData.medical_licenses?.cfm_number || null,
        medical_specialty:
          (roleData.medical_licenses?.specialty as MedicalSpecialty) || null,
        license_expiry: roleData.medical_licenses?.expires_at
          ? new Date(roleData.medical_licenses.expires_at)
          : null,
        license_active: roleData.medical_licenses?.active,
        additional_specialties:
          roleData.medical_licenses?.additional_specialties || [],
        certifications: roleData.certifications || [],
        active: roleData.active,
        temporary_access: roleData.temporary_access,
        emergency_access: roleData.emergency_access,
        access_granted_at: new Date(roleData.access_granted_at),
        access_expires_at: roleData.access_expires_at
          ? new Date(roleData.access_expires_at)
          : undefined,
        granted_by: roleData.granted_by,
        last_validated: new Date(roleData.last_validated),
        validation_required: roleData.validation_required,
        created_at: new Date(roleData.created_at),
        updated_at: new Date(roleData.updated_at),
      };

      setUserContext(context);

      // Load effective permissions
      const permissions = await rbacEngine.current.getUserEffectivePermissions(
        user.id
      );
      setEffectivePermissions(permissions);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Load user permissions error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load permissions'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, supabase]);

  /**
   * Check single permission
   */
  const checkPermission = useCallback(
    async (
      permission: string,
      context?: PermissionContext
    ): Promise<PermissionCheckResult> => {
      if (!(user?.id && rbacEngine.current)) {
        return {
          granted: false,
          permission,
          user_id: user?.id || '',
          role: HealthcareRole.GUEST,
          reason: 'User not authenticated',
          requires_validation: false,
          emergency_override: false,
          license_valid: false,
          specialty_match: false,
          cfm_compliant: false,
          lgpd_compliant: false,
          checked_at: new Date(),
        };
      }

      // Check cache first
      const cacheKey = `${user.id}:${permission}:${JSON.stringify(context)}`;
      const cached = permissionCache.current[cacheKey];

      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        return cached.result;
      }

      try {
        const result = await rbacEngine.current.checkPermission(
          user.id,
          permission,
          context
        );

        // Cache result
        permissionCache.current[cacheKey] = {
          result,
          timestamp: Date.now(),
        };

        return result;
      } catch (err) {
        console.error('Permission check error:', err);
        return {
          granted: false,
          permission,
          user_id: user.id,
          role: userContext?.role || HealthcareRole.GUEST,
          reason: 'Permission check failed',
          requires_validation: false,
          emergency_override: false,
          license_valid: false,
          specialty_match: false,
          cfm_compliant: false,
          lgpd_compliant: false,
          checked_at: new Date(),
        };
      }
    },
    [user?.id, userContext?.role, cacheDuration]
  );

  /**
   * Check multiple permissions
   */
  const checkPermissions = useCallback(
    async (
      permissions: string[],
      context?: PermissionContext
    ): Promise<PermissionCheckResult[]> => {
      const results = await Promise.all(
        permissions.map((permission) => checkPermission(permission, context))
      );
      return results;
    },
    [checkPermission]
  );

  /**
   * Check if user has permission (sync)
   */
  const hasPermission = useCallback(
    (permission: string, _context?: PermissionContext): boolean => {
      // For sync checks, use effective permissions as baseline
      return effectivePermissions.includes(permission);
    },
    [effectivePermissions]
  );

  /**
   * Check if user has any of the permissions (sync)
   */
  const hasAnyPermission = useCallback(
    (permissions: string[], context?: PermissionContext): boolean => {
      return permissions.some((permission) =>
        hasPermission(permission, context)
      );
    },
    [hasPermission]
  );

  /**
   * Check if user has all permissions (sync)
   */
  const hasAllPermissions = useCallback(
    (permissions: string[], context?: PermissionContext): boolean => {
      return permissions.every((permission) =>
        hasPermission(permission, context)
      );
    },
    [hasPermission]
  );

  // ============================================================================
  // EMERGENCY OVERRIDE FUNCTIONS
  // ============================================================================

  /**
   * Request emergency override for permission
   */
  const requestEmergencyOverride = useCallback(
    async (permission: string, reason: string): Promise<boolean> => {
      if (!(user?.id && allowEmergencyOverride && userContext)) {
        return false;
      }

      try {
        // Check if user can request emergency override
        if (!userContext.emergency_access) {
          toast({
            title: 'Acesso de Emergência Negado',
            description:
              'Seu papel não permite solicitações de acesso de emergência',
            variant: 'destructive',
          });
          return false;
        }

        // Log emergency override request
        const { error: logError } = await supabase
          .from('emergency_override_logs')
          .insert({
            user_id: user.id,
            permission,
            reason,
            clinic_id: userContext.clinic_id,
            medical_license: userContext.medical_license,
            cfm_number: userContext.cfm_number,
            requested_at: new Date().toISOString(),
            status: 'approved', // Auto-approve for emergency scenarios
          });

        if (logError) {
          throw new Error('Failed to log emergency override');
        }

        // Clear cache to force permission recheck
        clearCache();

        // Show success toast
        toast({
          title: 'Acesso de Emergência Concedido',
          description: `Acesso temporário concedido para: ${permission}`,
          variant: 'success',
        });

        // Refresh permissions
        await refreshPermissions();

        return true;
      } catch (err) {
        console.error('Emergency override error:', err);
        toast({
          title: 'Erro no Acesso de Emergência',
          description: 'Falha ao processar solicitação de acesso de emergência',
          variant: 'destructive',
        });
        return false;
      }
    },
    [user?.id, allowEmergencyOverride, userContext, supabase, toast]
  );

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Refresh permissions from server
   */
  const refreshPermissions = useCallback(async () => {
    clearCache();
    await loadUserPermissions();
  }, [loadUserPermissions]);

  /**
   * Clear permission cache
   */
  const clearCache = useCallback(() => {
    permissionCache.current = {};
  }, []);

  /**
   * Reset permissions state
   */
  const resetPermissions = useCallback(() => {
    setUserContext(null);
    setEffectivePermissions([]);
    setLastUpdated(null);
    clearCache();
  }, [clearCache]);

  /**
   * Subscribe to real-time permission updates
   */
  const subscribeToUpdates = useCallback(() => {
    if (!user?.id || subscriptionRef.current) return () => {};

    const subscription = supabase
      .channel(`permissions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Permission update received:', payload);
          refreshPermissions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medical_licenses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Medical license update received:', payload);
          refreshPermissions();
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, supabase, refreshPermissions]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const userRole = userContext?.role || HealthcareRole.GUEST;
  const medicalLicense = userContext?.medical_license || null;
  const cfmNumber = userContext?.cfm_number || null;
  const medicalSpecialty = userContext?.medical_specialty || null;
  const additionalSpecialties = userContext?.additional_specialties || [];
  const licenseActive = userContext?.license_active;
  const licenseExpiry = userContext?.license_expiry || null;
  const hasEmergencyOverride =
    allowEmergencyOverride && userContext?.emergency_access;

  return {
    // Permission checking
    checkPermission,
    checkPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // User context
    userRole,
    userContext,
    effectivePermissions,

    // Medical context
    medicalLicense,
    cfmNumber,
    medicalSpecialty,
    additionalSpecialties,
    licenseActive,
    licenseExpiry,

    // Emergency capabilities
    hasEmergencyOverride,
    requestEmergencyOverride,

    // State management
    isLoading,
    error,
    lastUpdated,

    // Cache management
    refreshPermissions,
    clearCache,

    // Real-time updates
    subscribeToUpdates,
  };
}

// ============================================================================
// SPECIALIZED PERMISSION HOOKS
// ============================================================================

/**
 * Clinical Permissions Hook - For medical procedures and patient care
 */
export function useClinicalPermissions(patientId?: string) {
  const permissions = usePermissions({
    allowEmergencyOverride: true,
    realtime: true,
  });

  const checkClinicalPermission = useCallback(
    async (permission: string): Promise<PermissionCheckResult> => {
      return permissions.checkPermission(permission, { patientId });
    },
    [permissions.checkPermission, patientId]
  );

  const canAccessPatient = useCallback(
    (targetPatientId?: string): boolean => {
      const id = targetPatientId || patientId;
      return permissions.hasAnyPermission(
        ['patient.read.own', 'patient.read.clinic'],
        { patientId: id }
      );
    },
    [permissions.hasAnyPermission, patientId]
  );

  const canPerformProcedure = useCallback(
    (procedureType: 'general' | 'specialty' = 'general'): boolean => {
      return permissions.hasPermission(`procedure.perform.${procedureType}`);
    },
    [permissions.hasPermission]
  );

  const canPrescribe = useCallback(
    (type: 'standard' | 'controlled' = 'standard'): boolean => {
      return permissions.hasPermission(`prescription.create.${type}`);
    },
    [permissions.hasPermission]
  );

  return {
    ...permissions,
    checkClinicalPermission,
    canAccessPatient,
    canPerformProcedure,
    canPrescribe,
  };
}

/**
 * Administrative Permissions Hook - For non-clinical operations
 */
export function useAdministrativePermissions() {
  const permissions = usePermissions({
    allowEmergencyOverride: false,
    realtime: true,
  });

  const canManageScheduling = useCallback(
    (scope: 'own' | 'clinic' = 'own'): boolean => {
      return permissions.hasPermission(`scheduling.manage.${scope}`);
    },
    [permissions.hasPermission]
  );

  const canProcessBilling = useCallback();
  : boolean =>
  return permissions.hasPermission('billing.process.standard');
  , [permissions.hasPermission])

  const canManageUsers = useCallback();
  : boolean =>
  return permissions.hasPermission('system.manage.users');
  , [permissions.hasPermission])

  const canConfigureClinic = useCallback();
  : boolean =>
  return permissions.hasPermission('system.configure.clinic');
  , [permissions.hasPermission])

  return {
    ...permissions,
    canManageScheduling,
    canProcessBilling,
    canManageUsers,
    canConfigureClinic,
  };
}

/**
 * Compliance Permissions Hook - For audit and compliance access
 */
export function useCompliancePermissions() {
  const permissions = usePermissions({
    allowEmergencyOverride: false,
    realtime: true,
    cacheDuration: 2 * 60 * 1000, // 2 minutes cache for compliance
  });

  const canAccessAuditLogs = useCallback();
  : boolean =>
  return permissions.hasPermission('audit.access.clinic');
  , [permissions.hasPermission])

  const canGenerateReports = useCallback(
    (type: 'cfm' | 'lgpd'): boolean => {
      return permissions.hasPermission(`compliance.report.${type}`);
    },
    [permissions.hasPermission]
  );

  const canValidateLicenses = useCallback();
  : boolean =>
  return permissions.hasPermission('license.validate.cfm');
  , [permissions.hasPermission])

  const canMonitorLicenses = useCallback();
  : boolean =>
  return permissions.hasPermission('license.monitor.expiration');
  , [permissions.hasPermission])

  return {
    ...permissions,
    canAccessAuditLogs,
    canGenerateReports,
    canValidateLicenses,
    canMonitorLicenses,
  };
}

export default usePermissions;
