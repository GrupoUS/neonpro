/**
 * LGPD Compliance Service for AI Agent
 * Ensures all data access complies with Brazilian data protection laws
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface LGPDComplianceContext {
  _userId: string;
  clinicId?: string;
  patientId?: string;
  action: 'read' | 'write' | 'delete';
  resourceType: 'patient' | 'appointment' | 'financial' | 'medical_record';
  justification?: string;
}

export interface AuditLogEntry {
  id: string;
  _userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  phiAccessed: boolean;
}

export class LGPDComplianceService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  /**
   * Validate data access request against LGPD principles
   */
  async validateDataAccess(_context: LGPDComplianceContext): Promise<boolean> {
    try {
      // Check if user has valid professional credentials
      const { data: professional, error } = await this.supabase
        .from('professionals')
        .select('id, clinic_id, is_active')
        .eq('user_id', context._userId)
        .single();

      if (error || !professional?.is_active) {
        await this.logViolation(context, 'Unauthorized access attempt');
        return false;
      }

      // Validate clinic access for multi-tenant setup
      if (context.clinicId && professional.clinic_id !== context.clinicId) {
        await this.logViolation(context, 'Cross-clinic access attempt');
        return false;
      }

      // For patient data, check LGPD consent
      if (context.resourceType === 'patient' && context.patientId) {
        const { data: patient, error } = await this.supabase
          .from('patients')
          .select('lgpd_consent_given, data_retention_until')
          .eq('id', context.patientId)
          .single();

        if (error || !patient?.lgpd_consent_given) {
          await this.logViolation(context, 'Access without LGPD consent');
          return false;
        }

        // Check data retention policy
        if (
          patient.data_retention_until
          && new Date() > new Date(patient.data_retention_until)
        ) {
          await this.logViolation(context, 'Access beyond retention period');
          return false;
        }
      }

      return true;
    } catch (_error) {
      console.error('LGPD validation error:', error);
      await this.logViolation(context, `Validation error: ${error}`);
      return false;
    }
  }

  /**
   * Log data access for audit trail
   */
  async logDataAccess(
    _context: LGPDComplianceContext,
    success: boolean,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const auditEntry: Omit<AuditLogEntry, 'id' | 'timestamp'> = {
      _userId: context.userId,
      action: `${context.action}_${context.resourceType}`,
      resourceType: context.resourceType,
      resourceId: context.patientId,
      metadata: {
        ...metadata,
        clinicId: context.clinicId,
        justification: context.justification,
        success,
      },
      phiAccessed: context.resourceType === 'patient'
        || context.resourceType === 'medical_record',
    };

    try {
      await this.supabase.from('audit_logs').insert([auditEntry]);
    } catch (_error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  /**
   * Log LGPD violations
   */
  private async logViolation(
    _context: LGPDComplianceContext,
    reason: string,
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert([
        {
          _userId: context.userId,
          action: 'lgpd_violation',
          resourceType: context.resourceType,
          resourceId: context.patientId,
          metadata: {
            violationReason: reason,
            clinicId: context.clinicId,
            action: context.action,
            severity: 'high',
          },
          phiAccessed: true,
        },
      ]);
    } catch (_error) {
      console.error('Failed to log LGPD violation:', error);
    }
  }

  /**
   * Sanitize PHI from AI responses
   */
  sanitizePHI(text: string): string {
    // Brazilian PHI patterns
    const phiPatterns = [
      // CPF
      /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
      // Phone numbers
      /\(\d{2}\)\s*\d{4,5}-\d{4}/g,
      // Email addresses
      /[\w.-]+@[\w.-]+\.\w+/g,
      // Medical record numbers
      /(?:MR|PR|RM)\s*\d+/gi,
      // Full names (simplified)
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
    ];

    let sanitized = text;

    phiPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  /**
   * Check if data retention policy requires deletion
   */
  async checkRetentionPolicies(): Promise<void> {
    try {
      // Find patients past retention period
      const { data: expiredPatients } = await this.supabase
        .from('patients')
        .select('id, clinic_id')
        .lt('data_retention_until', new Date().toISOString());

      if (expiredPatients) {
        console.log(
          `Found ${expiredPatients.length} patients past retention period`,
        );

        // In production, implement secure deletion process
        // For now, just log the finding
        for (const patient of expiredPatients) {
          await this.logDataAccess(
            {
              _userId: 'system',
              clinicId: patient.clinic_id,
              patientId: patient.id,
              action: 'delete',
              resourceType: 'patient',
              justification: 'Retention policy expired',
            },
            true,
          );
        }
      }
    } catch (_error) {
      console.error('Retention check error:', error);
    }
  }

  /**
   * Create data access request for patient rights
   */
  async createAccessRequest(
    patientId: string,
    requestType: 'access' | 'deletion' | 'portability',
    justification: string,
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('consent_records')
        .insert([
          {
            patient_id: patientId,
            purpose: `lgpd_${requestType}`,
            status: 'pending',
            justification,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    } catch (_error) {
      console.error('Failed to create access _request:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const _lgpdService = new LGPDComplianceService();
