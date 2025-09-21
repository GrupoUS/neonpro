import { AuditEvent, ComplianceCheck } from '../types/audit.types.js';
import { supabase } from '../client.js';
import { ErrorMapper } from '@neonpro/shared/errors';

export interface ConsentRequest {
  patientId: string;
  consentType: string;
  purpose: string;
  dataTypes: string[];
  expiration?: string;
  metadata?: Record<string, unknown>;
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  consentType: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  purpose: string;
  dataTypes: string[];
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  metadata?: Record<string, unknown>;
  auditTrail: AuditEvent[];
}

/**
 * LGPD-compliant consent management service
 * Handles patient consent with proper audit trails and privacy protection
 */
export class ConsentService {
  private auditLogger: (event: AuditEvent) => void;

  constructor(auditLogger?: (event: AuditEvent) => void) {
    this.auditLogger = auditLogger || this.defaultAuditLogger;
  }

  /**
   * Create a new patient consent record
   * @param request Consent creation request
   * @returns Created consent record
   */
  async createConsent(_request: ConsentRequest): Promise<ConsentRecord> {
    try {
      const consent: ConsentRecord = {
        id: `consent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: request.patientId,
        consentType: request.consentType,
        status: 'ACTIVE',
        purpose: request.purpose,
        dataTypes: request.dataTypes,
        grantedAt: new Date().toISOString(),
        expiresAt: request.expiration,
        metadata: request.metadata,
        auditTrail: [],
      };

      // Create audit trail entry (redacted for privacy)
      const auditEvent: AuditEvent = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_CREATED',
        entityType: 'consent',
        entityId: consent.id,
        actorId: 'system',
        metadata: {
          consentType: request.consentType,
          purpose: request.purpose,
          dataTypesCount: request.dataTypes.length,
          // Patient ID is redacted for privacy
          patientIdHash: this.hashPatientId(request.patientId),
        },
      };

      consent.auditTrail.push(auditEvent);
      this.auditLogger(auditEvent);

      // Persist consent to database with LGPD compliance
      await this.persistConsent(consent);

      return consent;
    } catch (_error) {
      // Log error without exposing patient data
      this.auditLogger({
        id: `audit-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_CREATE_ERROR',
        entityType: 'consent',
        entityId: 'unknown',
        actorId: 'system',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          patientIdHash: this.hashPatientId(request.patientId),
        },
      });
      throw error;
    }
  }

  /**
   * Retrieve consent records for a patient
   * @param patientId Patient identifier
   * @returns Array of consent records
   */
  async getConsent(patientId: string): Promise<ConsentRecord[]> {
    try {
      // Create audit trail for access
      this.auditLogger({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_ACCESSED',
        entityType: 'consent',
        entityId: 'multiple',
        actorId: 'system',
        metadata: {
          patientIdHash: this.hashPatientId(patientId),
        },
      });

      // Query consents from database
      const consents = await this.queryConsentsByPatient(patientId);
      return consents;
    } catch (_error) {
      this.auditLogger({
        id: `audit-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_ACCESS_ERROR',
        entityType: 'consent',
        entityId: 'multiple',
        actorId: 'system',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          patientIdHash: this.hashPatientId(patientId),
        },
      });
      throw error;
    }
  }

  /**
   * Revoke a patient consent
   * @param consentId Consent identifier
   * @returns Updated consent record
   */
  async revokeConsent(consentId: string): Promise<ConsentRecord> {
    try {
      // Fetch existing consent from database
      const existingConsent = await this.findConsentById(consentId);

      if (!existingConsent) {
        throw new Error(`Consent with ID ${consentId} not found`);
      }

      const revokedConsent: ConsentRecord = {
        ...existingConsent,
        status: 'REVOKED',
        revokedAt: new Date().toISOString(),
      };

      // Update consent in database
      await this.updateConsent(revokedConsent);

      // Create audit trail entry
      const auditEvent: AuditEvent = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_REVOKED',
        entityType: 'consent',
        entityId: consentId,
        actorId: 'system',
        metadata: {
          revokedAt: revokedConsent.revokedAt,
          patientIdHash: this.hashPatientId(revokedConsent.patientId),
        },
      };

      revokedConsent.auditTrail.push(auditEvent);
      this.auditLogger(auditEvent);

      return revokedConsent;
    } catch (_error) {
      this.auditLogger({
        id: `audit-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_REVOKE_ERROR',
        entityType: 'consent',
        entityId: consentId,
        actorId: 'system',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Check LGPD compliance for a patient
   * @param patientId Patient identifier
   * @returns Compliance check result
   */
  async checkCompliance(patientId: string): Promise<ComplianceCheck> {
    try {
      // Create audit trail for compliance check
      this.auditLogger({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'COMPLIANCE_CHECK',
        entityType: 'patient',
        entityId: this.hashPatientId(patientId),
        actorId: 'system',
        metadata: {
          checkType: 'LGPD_COMPLIANCE',
        },
      });

      // Perform comprehensive LGPD compliance checking
      const complianceResult = await this.performComplianceCheck(patientId);
      return complianceResult;
    } catch (_error) {
      this.auditLogger({
        id: `audit-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'COMPLIANCE_CHECK_ERROR',
        entityType: 'patient',
        entityId: this.hashPatientId(patientId),
        actorId: 'system',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Hash patient ID for privacy-safe logging
   * @param patientId Patient identifier
   * @returns Hashed patient ID for logging
   */
  private hashPatientId(patientId: string): string {
    // Simple hash for demo - in production use proper crypto hash
    const hash = Array.from(patientId)
      .reduce(_(acc,_char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
      .toString(16);
    return `patient_${hash.slice(-8)}`;
  }

  /**
   * Default audit logger implementation
   * @param event Audit event to log
   */
  private defaultAuditLogger(event: AuditEvent): void {
    // Safe logging without PII
    const safeEvent = {
      id: event.id,
      timestamp: event.timestamp,
      action: event.action,
      entityType: event.entityType,
      // Entity ID is already hashed for patient data
      entityId: event.entityId,
      actorId: event.actorId,
      metadataKeys: Object.keys(event.metadata || {}),
    };

    // Use structured logging instead of console.log for compliance
    this.auditLogger({
      id: `audit-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'AUDIT_LOG_ENTRY',
      entityType: 'system',
      entityId: 'consent-service',
      actorId: 'system',
      metadata: {
        logType: 'audit-trail',
        eventCount: 1,
        safeEventData: safeEvent,
      },
    });
  }

  /**
   * Persist consent record to database
   * @param consent Consent record to persist
   * @throws Error if database operation fails
   */
  private async persistConsent(consent: ConsentRecord): Promise<void> {
    try {
      const { data: _data, error } = await supabase
        .from('patient_consents')
        .insert({
          id: consent.id,
          patient_id: consent.patientId,
          consent_type: consent.consentType,
          status: consent.status,
          purpose: consent.purpose,
          data_types: consent.dataTypes,
          granted_at: consent.grantedAt,
          expires_at: consent.expiresAt,
          revoked_at: consent.revokedAt,
          metadata: consent.metadata,
          audit_trail: consent.auditTrail,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to persist consent: ${error.message}`);
      }

      // Log successful persistence
      this.auditLogger({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_PERSISTED',
        entityType: 'consent',
        entityId: consent.id,
        actorId: 'system',
        metadata: {
          patientIdHash: this.hashPatientId(consent.patientId),
          consentType: consent.consentType,
        },
      });
    } catch (_error) {
      // Use ErrorMapper for consistent error handling
      const mappedError = ErrorMapper.mapError(error, {
        action: 'persist_consent',
        timestamp: new Date().toISOString(),
      });

      // Log error with context
      this.auditLogger({
        id: `audit-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_PERSIST_ERROR',
        entityType: 'consent',
        entityId: consent.id,
        actorId: 'system',
        metadata: {
          error: mappedError.message,
          patientIdHash: this.hashPatientId(consent.patientId),
        },
      });

      throw error;
    }
  }

  /**
   * Query consent records by patient ID
   * @param patientId Patient identifier
   * @returns Array of consent records
   * @throws Error if database operation fails
   */
  private async queryConsentsByPatient(patientId: string): Promise<ConsentRecord[]> {
    try {
      const { data: _data, error } = await supabase
        .from('patient_consents')
        .select('*')
        .eq('patient_id', patientId)
        .order('granted_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to query consents: ${error.message}`);
      }

      // Transform database records to ConsentRecord format
      const consents: ConsentRecord[] = (_data || []).map((record: any) => ({
        id: record.id,
        patientId: record.patient_id,
        consentType: record.consent_type,
        status: record.status,
        purpose: record.purpose,
        dataTypes: record.data_types || [],
        grantedAt: record.granted_at,
        expiresAt: record.expires_at,
        revokedAt: record.revoked_at,
        metadata: record.metadata,
        auditTrail: record.audit_trail || [],
      }));

      return consents;
    } catch (_error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'query_consents',
        timestamp: new Date().toISOString(),
      });

      this.auditLogger({
        id: `audit-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_QUERY_ERROR',
        entityType: 'consent',
        entityId: 'multiple',
        actorId: 'system',
        metadata: {
          error: mappedError.message,
          patientIdHash: this.hashPatientId(patientId),
        },
      });

      throw error;
    }
  }

  /**
   * Find consent record by ID
   * @param consentId Consent identifier
   * @returns Consent record or null if not found
   * @throws Error if database operation fails
   */
  private async findConsentById(consentId: string): Promise<ConsentRecord | null> {
    try {
      const { data: _data, error } = await supabase
        .from('patient_consents')
        .select('*')
        .eq('id', consentId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw new Error(`Failed to find consent: ${error.message}`);
      }

      if (!_data) {
        return null;
      }

      // Transform database record to ConsentRecord format
      return {
        id: _data.id,
        patientId: _data.patient_id,
        consentType: _data.consent_type,
        status: _data.status,
        purpose: _data.purpose,
        dataTypes: _data.data_types || [],
        grantedAt: _data.granted_at,
        expiresAt: _data.expires_at,
        revokedAt: _data.revoked_at,
        metadata: _data.metadata,
        auditTrail: _data.audit_trail || [],
      };
    } catch (_error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'find_consent',
        timestamp: new Date().toISOString(),
      });

      this.auditLogger({
        id: `audit-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_FIND_ERROR',
        entityType: 'consent',
        entityId: consentId,
        actorId: 'system',
        metadata: {
          error: mappedError.message,
        },
      });

      throw error;
    }
  }

  /**
   * Update consent record in database
   * @param consent Updated consent record
   * @throws Error if database operation fails
   */
  private async updateConsent(consent: ConsentRecord): Promise<void> {
    try {
      const { data: _data, error } = await supabase
        .from('patient_consents')
        .update({
          status: consent.status,
          revoked_at: consent.revokedAt,
          audit_trail: consent.auditTrail,
        })
        .eq('id', consent.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update consent: ${error.message}`);
      }

      // Log successful update
      this.auditLogger({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_UPDATED',
        entityType: 'consent',
        entityId: consent.id,
        actorId: 'system',
        metadata: {
          patientIdHash: this.hashPatientId(consent.patientId),
          newStatus: consent.status,
        },
      });
    } catch (_error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'update_consent',
        timestamp: new Date().toISOString(),
      });

      this.auditLogger({
        id: `audit-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CONSENT_UPDATE_ERROR',
        entityType: 'consent',
        entityId: consent.id,
        actorId: 'system',
        metadata: {
          error: mappedError.message,
          patientIdHash: this.hashPatientId(consent.patientId),
        },
      });

      throw error;
    }
  }

  /**
   * Perform comprehensive LGPD compliance check
   * @param patientId Patient identifier
   * @returns Compliance check result
   * @throws Error if compliance check fails
   */
  private async performComplianceCheck(patientId: string): Promise<ComplianceCheck> {
    try {
      // Get all consents for the patient
      const consents = await this.queryConsentsByPatient(patientId);

      const violations: string[] = [];
      const _now = new Date();

      // Check for expired consents
      const expiredConsents = consents.filter(consent =>
        consent.expiresAt && new Date(consent.expiresAt) < now
      );

      if (expiredConsents.length > 0) {
        violations.push(`Found ${expiredConsents.length} expired consent(s)`);
      }

      // Check for consents without proper expiration dates
      const consentsWithoutExpiration = consents.filter(consent =>
        !consent.expiresAt && consent.consentType !== 'EMERGENCY'
      );

      if (consentsWithoutExpiration.length > 0) {
        violations.push(`Found ${consentsWithoutExpiration.length} consent(s) without expiration dates`);
      }

      // Check data retention policies (max 2 years for most healthcare data)
      const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
      const oldConsents = consents.filter(consent =>
        new Date(consent.grantedAt) < twoYearsAgo &&
        consent.consentType !== 'EMERGENCY'
      );

      if (oldConsents.length > 0) {
        violations.push(`Found ${oldConsents.length} consent(s) exceeding 2-year retention policy`);
      }

      // Check for missing sensitive data handling
      const sensitiveConsents = consents.filter(consent =>
        consent.dataTypes.some(type =>
          ['medical_records', 'diagnosis', 'treatment', 'genetic_data'].includes(type)
        )
      );

      if (sensitiveConsents.length > 0) {
        const sensitiveWithoutExpiration = sensitiveConsents.filter(consent => !consent.expiresAt);
        if (sensitiveWithoutExpiration.length > 0) {
          violations.push(`Found ${sensitiveWithoutExpiration.length} sensitive consent(s) without expiration dates`);
        }
      }

      // Determine compliance status and risk level
      const isCompliant = violations.length === 0;
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

      if (violations.length >= 5) {
        riskLevel = 'CRITICAL';
      } else if (violations.length >= 3) {
        riskLevel = 'HIGH';
      } else if (violations.length >= 1) {
        riskLevel = 'MEDIUM';
      }

      const status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING' =
        isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT';

      return {
        status,
        riskLevel,
        risk_level: riskLevel, // Legacy support
        violations,
        isCompliant,
        lastChecked: now.toISOString(),
        recommendations: violations.length > 0 ? [
          'Review and update expired consents',
          'Add expiration dates to consents without them',
          'Archive consents exceeding retention policies',
          'Implement additional safeguards for sensitive data'
        ] : [],
      };
    } catch (_error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'compliance_check',
        timestamp: new Date().toISOString(),
      });

      this.auditLogger({
        id: `audit-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'COMPLIANCE_CHECK_ERROR',
        entityType: 'patient',
        entityId: this.hashPatientId(patientId),
        actorId: 'system',
        metadata: {
          error: mappedError.message,
        },
      });

      throw error;
    }
  }
}

// Export utility functions for creating consent service instances
export const _createConsentService = (auditLogger?: (event: AuditEvent) => void) => {
  return new ConsentService(auditLogger);
};

// Export default for backwards compatibility
export default ConsentService;