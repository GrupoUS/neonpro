/**
 * Agent Permission Service
 * 
 * Implements role-based permission checking for AI agent data access
 * with LGPD compliance and healthcare security requirements.
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export interface PermissionContext {
  userId: string;
  sessionId?: string;
  patientId?: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  resource: 'agent_sessions' | 'agent_messages' | 'agent_context' | 'agent_audit' | 'patient_data' | 'financial_data';
  metadata?: Record<string, any>;
}

export interface PermissionResult {
  granted: boolean;
  reason?: string;
  conditions?: Record<string, any>;
  auditLog?: {
    action: string;
    resource: string;
    userId: string;
    details: Record<string, any>;
  };
}

export interface UserRole {
  id: string;
  role: 'admin' | 'clinic_admin' | 'professional' | 'staff' | 'patient';
  clinicId?: string;
  permissions: string[];
  scopes: string[];
}

export class AgentPermissionService {
  private supabase: ReturnType<typeof createClient<Database>>;
  private cache: Map<string, { permissions: UserRole; expires: number }> = new Map();
  private cacheTimeout = 300000; // 5 minutes

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Check if a user has permission to perform an action
   */
  async checkPermission(context: PermissionContext): Promise<PermissionResult> {
    const startTime = Date.now();
    
    try {
      // Get user roles from cache or database
      const userRoles = await this.getUserRoles(context.userId);
      
      // Check each role for required permission
      for (const role of userRoles) {
        const result = await this.checkRolePermission(role, context);
        if (result.granted) {
          // Log successful permission check
          await this.logPermissionCheck({
            ...context,
            granted: true,
            processingTime: Date.now() - startTime,
            role: role.role
          });
          
          return result;
        }
      }

      // No role has permission
      const denialResult: PermissionResult = {
        granted: false,
        reason: 'Insufficient permissions',
        auditLog: {
          action: context.action,
          resource: context.resource,
          userId: context.userId,
          details: {
            denied: true,
            reason: 'no_sufficient_role',
            processingTime: Date.now() - startTime
          }
        }
      };

      await this.logPermissionCheck({
        ...context,
        granted: false,
        processingTime: Date.now() - startTime
      });

      return denialResult;

    } catch (error) {
      console.error('Permission check error:', error);
      
      // Fail secure - deny permission on error
      const errorResult: PermissionResult = {
        granted: false,
        reason: 'Permission system error',
        auditLog: {
          action: context.action,
          resource: context.resource,
          userId: context.userId,
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime
          }
        }
      };

      await this.logPermissionCheck({
        ...context,
        granted: false,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return errorResult;
    }
  }

  /**
   * Get user roles with caching
   */
  private async getUserRoles(userId: string): Promise<UserRole[]> {
    // Check cache first
    const cached = this.cache.get(userId);
    if (cached && cached.expires > Date.now()) {
      return [cached.permissions];
    }

    try {
      // Get user roles from database
      const { data, error } = await this.supabase
        .from('user_roles')
        .select(`
          *,
          role_permissions (
            permission,
            scope
          )
        `)
        .eq('user_id', userId)
        .eq('active', true);

      if (error) {
        throw error;
      }

      const roles: UserRole[] = data?.map(role => ({
        id: role.id,
        role: role.role as any,
        clinicId: role.clinic_id,
        permissions: role.role_permissions?.map(rp => rp.permission) || [],
        scopes: role.role_permissions?.map(rp => rp.scope) || []
      })) || [];

      // Cache the result
      if (roles.length > 0) {
        this.cache.set(userId, {
          permissions: roles[0],
          expires: Date.now() + this.cacheTimeout
        });
      }

      return roles;

    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  /**
   * Check permission for a specific role
   */
  private async checkRolePermission(role: UserRole, context: PermissionContext): Promise<PermissionResult> {
    const basePermission = `${context.action}:${context.resource}`;
    
    // Check if role has the base permission
    if (!role.permissions.includes(basePermission) && !role.permissions.includes('*:*')) {
      return { granted: false, reason: 'Role lacks required permission' };
    }

    // Role-specific permission logic
    switch (role.role) {
      case 'admin':
        return this.checkAdminPermission(role, context);
      
      case 'clinic_admin':
        return this.checkClinicAdminPermission(role, context);
      
      case 'professional':
        return this.checkProfessionalPermission(role, context);
      
      case 'staff':
        return this.checkStaffPermission(role, context);
      
      case 'patient':
        return this.checkPatientPermission(role, context);
      
      default:
        return { granted: false, reason: 'Unknown role type' };
    }
  }

  /**
   * Admin permissions - full access
   */
  private async checkAdminPermission(role: UserRole, context: PermissionContext): Promise<PermissionResult> {
    return {
      granted: true,
      conditions: {
        role: 'admin',
        scope: 'global'
      }
    };
  }

  /**
   * Clinic admin permissions - clinic-wide access
   */
  private async checkClinicAdminPermission(role: UserRole, context: PermissionContext): Promise<PermissionResult> {
    // For patient data access, verify patient belongs to clinic
    if (context.resource === 'patient_data' && context.patientId) {
      const { data: patient } = await this.supabase
        .from('patients')
        .select('clinic_id')
        .eq('id', context.patientId)
        .single();

      if (!patient || patient.clinic_id !== role.clinicId) {
        return {
          granted: false,
          reason: 'Patient not in clinic scope'
        };
      }
    }

    return {
      granted: true,
      conditions: {
        role: 'clinic_admin',
        scope: 'clinic',
        clinicId: role.clinicId
      }
    };
  }

  /**
   * Professional permissions - assigned patients only
   */
  private async checkProfessionalPermission(role: UserRole, context: PermissionContext): Promise<PermissionResult> {
    // For patient data access, verify professional has access to patient
    if (context.resource === 'patient_data' && context.patientId) {
      const { data: assignment } = await this.supabase
        .from('professional_patient_assignments')
        .select('id')
        .eq('professional_id', context.userId)
        .eq('patient_id', context.patientId)
        .eq('active', true)
        .single();

      if (!assignment) {
        return {
          granted: false,
          reason: 'No professional-patient assignment'
        };
      }
    }

    // For financial data, check if professional has billing permissions
    if (context.resource === 'financial_data') {
      if (!role.permissions.includes('write:financial_data')) {
        return {
          granted: false,
          reason: 'Professional lacks financial write permissions'
        };
      }
    }

    return {
      granted: true,
      conditions: {
        role: 'professional',
        scope: 'assigned_patients',
        clinicId: role.clinicId
      }
    };
  }

  /**
   * Staff permissions - limited access
   */
  private async checkStaffPermission(role: UserRole, context: PermissionContext): Promise<PermissionResult> {
    // Staff cannot access financial data
    if (context.resource === 'financial_data') {
      return {
        granted: false,
        reason: 'Staff cannot access financial data'
      };
    }

    // For patient data, verify clinic membership
    if (context.resource === 'patient_data' && context.patientId) {
      const { data: patient } = await this.supabase
        .from('patients')
        .select('clinic_id')
        .eq('id', context.patientId)
        .single();

      if (!patient || patient.clinic_id !== role.clinicId) {
        return {
          granted: false,
          reason: 'Patient not in clinic scope'
        };
      }
    }

    // Staff can only read agent data, not write/delete
    if (context.resource.startsWith('agent_') && context.action !== 'read') {
      return {
        granted: false,
        reason: 'Staff can only read agent data'
      };
    }

    return {
      granted: true,
      conditions: {
        role: 'staff',
        scope: 'clinic_readonly',
        clinicId: role.clinicId
      }
    };
  }

  /**
   * Patient permissions - own data only
   */
  private async checkPatientPermission(role: UserRole, context: PermissionContext): Promise<PermissionResult> {
    // Patients can only access their own data
    if (context.patientId && context.patientId !== context.userId) {
      return {
        granted: false,
        reason: 'Patients can only access their own data'
      };
    }

    // Patients can only read their agent sessions and messages
    if (context.resource.startsWith('agent_') && context.action !== 'read') {
      return {
        granted: false,
        reason: 'Patients can only read their agent data'
      };
    }

    return {
      granted: true,
      conditions: {
        role: 'patient',
        scope: 'own_data',
        patientId: context.patientId
      }
    };
  }

  /**
   * Log permission check for audit purposes
   */
  private async logPermissionCheck(details: {
    userId: string;
    action: string;
    resource: string;
    granted: boolean;
    processingTime: number;
    role?: string;
    error?: string;
    sessionId?: string;
    patientId?: string;
  }): Promise<void> {
    try {
      await this.supabase
        .from('agent_audit_log')
        .insert({
          user_id: details.userId,
          action: 'permission_check',
          table_name: 'permissions',
          compliance_metadata: {
            permission_action: details.action,
            permission_resource: details.resource,
            permission_granted: details.granted,
            permission_role: details.role,
            permission_processing_time: details.processingTime,
            session_id: details.sessionId,
            patient_id: details.patientId,
            error: details.error
          }
        });

    } catch (error) {
      console.error('Failed to log permission check:', error);
    }
  }

  /**
   * Clear permission cache for a user
   */
  clearCache(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Get all permissions for a user (for debugging/admin)
   */
  async getUserPermissions(userId: string): Promise<{
    roles: UserRole[];
    effectivePermissions: string[];
  }> {
    const roles = await this.getUserRoles(userId);
    const effectivePermissions = new Set<string>();

    roles.forEach(role => {
      role.permissions.forEach(permission => {
        effectivePermissions.add(permission);
      });
    });

    return {
      roles,
      effectivePermissions: Array.from(effectivePermissions)
    };
  }

  /**
   * Check if user has LGPD consent for data processing
   */
  async hasLgpdConsent(userId: string, consentType: 'data_processing' | 'ai_interaction' | 'data_retention'): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('user_lgpd_consents')
        .select('id')
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .eq('granted', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      return !!data;
    } catch (error) {
      console.error('Error checking LGPD consent:', error);
      return false;
    }
  }

  /**
   * Validate session ownership and permissions
   */
  async validateSessionAccess(sessionId: string, userId: string): Promise<{
    valid: boolean;
    session?: any;
    reason?: string;
  }> {
    try {
      const { data: session, error } = await this.supabase
        .from('agent_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error || !session) {
        return { valid: false, reason: 'Session not found' };
      }

      // Check if session belongs to user
      if (session.user_id !== userId) {
        return { valid: false, reason: 'Session ownership mismatch' };
      }

      // Check if session is expired
      if (new Date(session.expires_at) <= new Date()) {
        return { valid: false, reason: 'Session expired' };
      }

      // Check if session is active
      if (!session.is_active) {
        return { valid: false, reason: 'Session inactive' };
      }

      return { valid: true, session };

    } catch (error) {
      console.error('Error validating session access:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }
}