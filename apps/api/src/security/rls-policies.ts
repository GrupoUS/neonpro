/**
 * Advanced RLS Security Policies for Healthcare Platform
 * Comprehensive Row Level Security with multi-tenant isolation and healthcare compliance
 */

import { createServerClient } from '../clients/supabase.js';

export interface RLSContext {
  userId: string;
  userRole: string;
  clinicId: string;
  professionalId?: string;
  emergencyAccess?: boolean;
  accessTime?: Date;
  ipAddress?: string;
  justification?: string;
}

export interface AccessPolicy {
  tableName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  conditions: string[];
  roles: string[];
  timeRestrictions?: {
    startHour: number;
    endHour: number;
    emergencyBypass: boolean;
  };
  consentRequired?: boolean;
  auditLevel: 'basic' | 'detailed' | 'comprehensive';
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
  conditions?: string[];
  auditRequired: boolean;
  emergencyAccess?: boolean;
}

export class AdvancedRLSPolicies {
  private supabase;

  constructor() {
    this.supabase = createServerClient();
  }

  /**
   * Healthcare role hierarchy for access control
   */
  private static readonly ROLE_HIERARCHY = {
    admin: 100, // Full access
    clinic_admin: 90, // Clinic-wide access
    doctor: 80, // Full patient access within clinic
    nurse: 70, // Limited patient access within clinic
    assistant: 60, // Basic patient access within clinic
    receptionist: 50, // Scheduling and basic info only
    patient: 10, // Own data only
    anonymous: 0, // No access
  };

  /**
   * Sensitive data classification levels
   */
  private static readonly DATA_SENSITIVITY = {
    PUBLIC: 0, // No restrictions
    INTERNAL: 25, // Clinic staff only
    CONFIDENTIAL: 50, // Medical staff only
    RESTRICTED: 75, // Treating professionals only
    HIGHLY_RESTRICTED: 100, // Explicit consent + doctor only
  };

  /**
   * Enhanced RLS policies for healthcare tables with additional security constraints
   */
  private static readonly HEALTHCARE_POLICIES: AccessPolicy[] = [
    // Enhanced patient data access policies with additional security layers
    {
      tableName: 'patients',
      operation: 'SELECT',
      conditions: [
        'clinic_id = current_setting(\'app.current_clinic_id\')',
        'EXISTS (SELECT 1 FROM user_clinic_access WHERE user_id = auth.uid() AND clinic_id = patients.clinic_id AND is_active = true)',
        'CASE WHEN current_setting(\'app.user_role\') = \'patient\' THEN id = auth.uid() ELSE true END',
        'patients.is_active = true', // Only active patients
        '(current_setting(\'app.user_role\') = \'admin\' OR current_setting(\'app.user_role\') = \'clinic_admin\' OR '
        + '(SELECT COUNT(*) FROM patient_consent_records WHERE patient_id = patients.id AND status = \'active\' AND expires_at > NOW()) > 0)',
      ],
      roles: ['doctor', 'nurse', 'assistant', 'receptionist', 'patient'],
      consentRequired: true,
      auditLevel: 'detailed',
      timeRestrictions: {
        startHour: 6,
        endHour: 22,
        emergencyBypass: true,
      },
    },
    {
      tableName: 'patients',
      operation: 'UPDATE',
      conditions: [
        'clinic_id = current_setting(\'app.current_clinic_id\')',
        'current_setting(\'app.user_role\') IN (\'doctor\', \'nurse\', \'admin\')',
        'EXISTS (SELECT 1 FROM user_clinic_access WHERE user_id = auth.uid() AND clinic_id = patients.clinic_id AND is_active = true)',
        'patients.is_active = true', // Only active patients can be updated
        'NOT EXISTS (SELECT 1 FROM patient_locks WHERE patient_id = patients.id AND lock_type = \'UPDATE\' AND expires_at > NOW())',
      ],
      roles: ['doctor', 'nurse', 'admin'],
      auditLevel: 'comprehensive',
      timeRestrictions: {
        startHour: 6,
        endHour: 22,
        emergencyBypass: true,
      },
    },

    // Enhanced medical records - highest security with additional constraints
    {
      tableName: 'medical_records',
      operation: 'SELECT',
      conditions: [
        'EXISTS (SELECT 1 FROM patients p WHERE p.id = medical_records.patient_id AND p.clinic_id = current_setting(\'app.current_clinic_id\') AND p.is_active = true)',
        'current_setting(\'app.user_role\') IN (\'doctor\', \'nurse\')',
        'EXISTS (SELECT 1 FROM patient_professional_relationships ppr WHERE ppr.patient_id = medical_records.patient_id AND ppr.professional_id = current_setting(\'app.professional_id\') AND ppr.is_active = true)',
        'EXISTS (SELECT 1 FROM patient_consent_records WHERE patient_id = medical_records.patient_id AND purpose = \'medical_records_access\' AND status = \'active\' AND expires_at > NOW())',
        'medical_records.is_active = true', // Only active records
        'NOT EXISTS (SELECT 1 FROM record_access_restrictions WHERE record_id = medical_records.id AND restriction_type = \'NO_ACCESS\')',
      ],
      roles: ['doctor', 'nurse'],
      timeRestrictions: {
        startHour: 6,
        endHour: 22,
        emergencyBypass: true,
      },
      consentRequired: true,
      auditLevel: 'comprehensive',
    },

    // Appointments - moderate security
    {
      tableName: 'appointments',
      operation: 'SELECT',
      conditions: [
        'clinic_id = current_setting(\'app.current_clinic_id\')',
        'CASE WHEN current_setting(\'app.user_role\') = \'patient\' THEN patient_id = auth.uid() ELSE true END',
      ],
      roles: ['doctor', 'nurse', 'assistant', 'receptionist', 'patient'],
      auditLevel: 'basic',
    },

    // Financial data - restricted access
    {
      tableName: 'billing_records',
      operation: 'SELECT',
      conditions: [
        'clinic_id = current_setting(\'app.current_clinic_id\')',
        'current_setting(\'app.user_role\') IN (\'admin\', \'clinic_admin\', \'doctor\')',
        'CASE WHEN current_setting(\'app.user_role\') = \'patient\' THEN patient_id = auth.uid() ELSE true END',
      ],
      roles: ['admin', 'clinic_admin', 'doctor', 'patient'],
      auditLevel: 'comprehensive',
    },

    // Consent records - special handling
    {
      tableName: 'consent_records',
      operation: 'SELECT',
      conditions: [
        'clinic_id = current_setting(\'app.current_clinic_id\')',
        'CASE WHEN current_setting(\'app.user_role\') = \'patient\' THEN patient_id = auth.uid() ELSE true END',
      ],
      roles: ['doctor', 'nurse', 'admin', 'patient'],
      auditLevel: 'comprehensive',
    },
  ];

  /**
   * Evaluate RLS policy for specific access request
   */
  async evaluatePolicy(
    context: RLSContext,
    tableName: string,
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    recordId?: string,
  ): Promise<PolicyEvaluationResult> {
    try {
      // Find applicable policies
      const policies = AdvancedRLSPolicies.HEALTHCARE_POLICIES.filter(
        p => p.tableName === tableName && p.operation === operation,
      );

      if (policies.length === 0) {
        return {
          allowed: false,
          reason: 'No applicable RLS policy found',
          auditRequired: true,
        };
      }

      // Evaluate each policy
      for (const policy of policies) {
        const result = await this.evaluateSinglePolicy(
          context,
          policy,
          recordId,
        );
        if (result.allowed) {
          return result;
        }
      }

      return {
        allowed: false,
        reason: 'Access denied by RLS policies',
        auditRequired: true,
      };
    } catch (error) {
      console.error('Error evaluating RLS policy:', error);
      return {
        allowed: false,
        reason: 'RLS policy evaluation error',
        auditRequired: true,
      };
    }
  }

  /**
   * Evaluate a single RLS policy
   */
  private async evaluateSinglePolicy(
    context: RLSContext,
    policy: AccessPolicy,
    recordId?: string,
  ): Promise<PolicyEvaluationResult> {
    // Check role authorization
    if (!policy.roles.includes(context.userRole)) {
      return {
        allowed: false,
        reason: `Role '${context.userRole}' not authorized for this operation`,
        auditRequired: policy.auditLevel !== 'basic',
      };
    }

    // Check time restrictions
    if (policy.timeRestrictions && !context.emergencyAccess) {
      const currentHour = (context.accessTime || new Date()).getHours();
      const { startHour, endHour, emergencyBypass } = policy.timeRestrictions;

      if (currentHour < startHour || currentHour >= endHour) {
        if (emergencyBypass && context.emergencyAccess) {
          return {
            allowed: true,
            reason: 'Emergency access granted outside normal hours',
            auditRequired: true,
            emergencyAccess: true,
          };
        }
        return {
          allowed: false,
          reason: `Access restricted to hours ${startHour}:00-${endHour}:00`,
          auditRequired: true,
        };
      }
    }

    // Check consent requirements
    if (policy.consentRequired && recordId) {
      const hasConsent = await this.validatePatientConsent(
        context.userId,
        recordId,
        policy.tableName,
      );

      if (!hasConsent) {
        return {
          allowed: false,
          reason: 'Patient consent required for this operation',
          auditRequired: true,
        };
      }
    }

    // Evaluate dynamic conditions
    const conditionsValid = await this.evaluateDynamicConditions(
      context,
      policy.conditions,
      recordId,
    );

    return {
      allowed: conditionsValid,
      reason: conditionsValid ? 'Access granted' : 'Dynamic conditions not met',
      conditions: policy.conditions,
      auditRequired: policy.auditLevel !== 'basic',
    };
  }

  /**
   * Validate patient consent for data access
   */
  private async validatePatientConsent(
    userId: string,
    recordId: string,
    tableName: string,
  ): Promise<boolean> {
    try {
      // Get patient ID based on table and record
      const patientId = await this.getPatientIdFromRecord(tableName, recordId);
      if (!patientId) return false;

      // Check for active consent
      const { data: consent, error } = await this.supabase
        .from('consent_records')
        .select('status, expires_at, withdrawn_at')
        .eq('patient_id', patientId)
        .eq('purpose', this.getConsentPurposeForTable(tableName))
        .eq('status', 'active')
        .is('withdrawn_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !consent) return false;

      // Check expiration
      if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating patient consent:', error);
      return false;
    }
  }

  /**
   * Evaluate dynamic RLS conditions
   */
  private async evaluateDynamicConditions(
    context: RLSContext,
    conditions: string[],
    recordId?: string,
  ): Promise<boolean> {
    try {
      // This would evaluate SQL-like conditions against the database
      // For now, we'll implement basic checks

      for (const condition of conditions) {
        if (condition.includes('current_setting(\'app.current_clinic_id\')')) {
          // Validate clinic access
          if (
            !(await this.validateClinicAccess(context.userId, context.clinicId))
          ) {
            return false;
          }
        }

        if (condition.includes('auth.uid()')) {
          // Validate user authentication
          if (!context.userId) {
            return false;
          }
        }

        if (condition.includes('user_clinic_access')) {
          // Validate user-clinic relationship
          if (
            !(await this.validateUserClinicRelationship(
              context.userId,
              context.clinicId,
            ))
          ) {
            return false;
          }
        }

        if (condition.includes('patient_professional_relationships')) {
          // Validate professional-patient relationship
          if (context.professionalId && recordId) {
            const patientId = await this.getPatientIdFromRecord(
              'medical_records',
              recordId,
            );
            if (
              patientId
              && !(await this.validateProfessionalPatientRelationship(
                context.professionalId,
                patientId,
              ))
            ) {
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error evaluating dynamic conditions:', error);
      return false;
    }
  }

  /**
   * Enhanced RLS SQL policies for Supabase with additional security constraints
   */
  generateSupabasePolicies(): string[] {
    const policies: string[] = [];

    for (const policy of AdvancedRLSPolicies.HEALTHCARE_POLICIES) {
      const policyName = `${policy.tableName}_${policy.operation.toLowerCase()}_enhanced_policy`;

      let sqlConditions = policy.conditions.join(' AND ');

      // Add role check
      if (policy.roles.length > 0) {
        const roleCheck = `current_setting('app.user_role') IN ('${policy.roles.join('\',\'')}')`;
        sqlConditions = sqlConditions
          ? `(${sqlConditions}) AND (${roleCheck})`
          : roleCheck;
      }

      // Add time restrictions if specified
      if (policy.timeRestrictions) {
        const timeCheck =
          `EXTRACT(HOUR FROM CURRENT_TIMESTAMP) BETWEEN ${policy.timeRestrictions.startHour} AND ${
            policy.timeRestrictions.endHour - 1
          }`;
        const emergencyCheck =
          `current_setting('app.emergency_access', false)::boolean OR ${timeCheck}`;
        sqlConditions = sqlConditions
          ? `(${sqlConditions}) AND (${emergencyCheck})`
          : emergencyCheck;
      }

      // Add IP address restrictions for sensitive operations
      if (policy.auditLevel === 'comprehensive') {
        const ipCheck =
          `current_setting('app.client_ip', 'unknown')::text NOT LIKE ALL(ARRAY['192.168.%', '10.%', '172.16.%', '172.17.%', '172.18.%', '172.19.%', '172.20.%', '172.21.%', '172.22.%', '172.23.%', '172.24.%', '172.25.%', '172.26.%', '172.27.%', '172.28.%', '172.29.%', '172.30.%', '172.31.%']) OR current_setting('app.user_role') = 'admin'`;
        sqlConditions = sqlConditions
          ? `(${sqlConditions}) AND (${ipCheck})`
          : ipCheck;
      }

      const policySQL = `
-- Enhanced RLS Policy for ${policy.tableName} ${policy.operation}
-- Security Level: ${policy.auditLevel}
-- Healthcare Compliance: LGPD, ANVISA, CFM
CREATE POLICY "${policyName}"
ON public.${policy.tableName}
FOR ${policy.operation}
TO authenticated
USING (${sqlConditions});
      `.trim();

      policies.push(policySQL);
    }

    return policies;
  }

  /**
   * Enhanced RLS context setting with additional security parameters
   */
  async setRLSContext(context: RLSContext): Promise<void> {
    try {
      const settings = [
        `SET app.current_user_id = '${context.userId}';`,
        `SET app.user_role = '${context.userRole}';`,
        `SET app.current_clinic_id = '${context.clinicId}';`,
        `SET app.professional_id = '${context.professionalId || ''}';`,
        `SET app.emergency_access = '${context.emergencyAccess || false}';`,
        `SET app.access_time = '${(context.accessTime || new Date()).toISOString()}';`,
        `SET app.client_ip = '${context.ipAddress || 'unknown'}';`,
        `SET app.session_id = '${this.generateSessionId()}';`,
        `SET app.request_id = '${this.generateRequestId()}';`,
        `SET app.security_context = '{"access_level":"${
          this.calculateAccessLevel(context.userRole)
        }","justification":"${context.justification || ''}"}';`,
      ];

      for (const setting of settings) {
        await this.supabase.rpc('exec_sql', { sql: setting });
      }

      // Log RLS context setting for audit trail
      await this.logRLSContextSet(context);
    } catch (error) {
      console.error('Error setting RLS context:', error);
      throw new Error('Failed to set RLS context');
    }
  }

  /**
   * Calculate access level based on user role
   */
  private calculateAccessLevel(role: string): string {
    const accessLevels: Record<string, string> = {
      admin: 'full',
      clinic_admin: 'clinic_wide',
      doctor: 'patient_full',
      nurse: 'patient_limited',
      assistant: 'patient_basic',
      receptionist: 'scheduling_only',
      patient: 'self_only',
      anonymous: 'none',
    };
    return accessLevels[role] || 'none';
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Log RLS context setting for audit trail
   */
  private async logRLSContextSet(context: RLSContext): Promise<void> {
    try {
      await this.supabase.rpc('log_security_event', {
        event_type: 'RLS_CONTEXT_SET',
        event_data: {
          user_id: context.userId,
          user_role: context.userRole,
          clinic_id: context.clinicId,
          professional_id: context.professionalId,
          emergency_access: context.emergencyAccess,
          ip_address: context.ipAddress,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.warn('Failed to log RLS context set:', error);
    }
  }

  // Helper methods

  private async getPatientIdFromRecord(
    tableName: string,
    recordId: string,
  ): Promise<string | null> {
    try {
      let query;
      switch (tableName) {
        case 'patients':
          return recordId;
        case 'medical_records':
        case 'appointments':
        case 'billing_records':
          query = this.supabase
            .from(tableName)
            .select('patient_id')
            .eq('id', recordId)
            .single();
          break;
        default:
          return null;
      }

      const { data, error } = await query;
      return error ? null : data?.patient_id || null;
    } catch {
      return null;
    }
  }

  private getConsentPurposeForTable(tableName: string): string {
    const purposeMap: Record<string, string> = {
      patients: 'visualizacao_dados_paciente',
      medical_records: 'tratamento_medico',
      appointments: 'agendamento_consultas',
      billing_records: 'faturamento_pagamento',
    };
    return purposeMap[tableName] || 'operacao_geral';
  }

  private async validateClinicAccess(
    userId: string,
    clinicId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_clinic_access')
        .select('id')
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  private async validateUserClinicRelationship(
    userId: string,
    clinicId: string,
  ): Promise<boolean> {
    return this.validateClinicAccess(userId, clinicId);
  }

  private async validateProfessionalPatientRelationship(
    professionalId: string,
    patientId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('patient_professional_relationships')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const advancedRLSPolicies = new AdvancedRLSPolicies();

// Export types
export type { AccessPolicy, PolicyEvaluationResult, RLSContext };
