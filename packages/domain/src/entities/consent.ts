import { LegalBasis } from '../value-objects/gender'

/**
 * Consent status enum
 */
export enum ConsentStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Consent type enum
 */
export enum ConsentType {
  DATA_PROCESSING = 'data_processing',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  RESEARCH = 'research',
  TELEHEALTH = 'telehealth',
  EMERGENCY_CONTACT = 'emergency_contact',
  INSURANCE_SHARING = 'insurance_sharing',
  TREATMENT = 'treatment',
}

/**
 * Consent Request
 */
export interface ConsentRequest {
  patientId: string
  consentType: ConsentType
  purpose: string
  dataTypes: string[]
  expiration?: string
  metadata?: Record<string, unknown> | undefined
  requestorId?: string
  requestorRole?: string
}

/**
 * Consent Record - Domain entity
 */
export interface ConsentRecord {
  id: string
  patientId: string
  consentType: ConsentType
  status: ConsentStatus
  purpose: string
  dataTypes: string[]
  grantedAt: string
  expiresAt?: string | undefined
  revokedAt?: string
  revokedBy?: string
  revocationReason?: string
  legalBasis: LegalBasis
  consentVersion: string
  metadata?: Record<string, unknown> | undefined
  auditTrail: ConsentAuditEvent[]
}

/**
 * Consent Audit Event
 */
export interface ConsentAuditEvent {
  id: string
  timestamp: string
  action: ConsentAction
  actorId: string
  actorRole?: string
  patientIdHash: string
  details?: Record<string, unknown> | undefined
}

/**
 * Consent action types
 */
export enum ConsentAction {
  CREATED = 'CONSENT_CREATED',
  GRANTED = 'CONSENT_GRANTED',
  REVOKED = 'CONSENT_REVOKED',
  EXPIRED = 'CONSENT_EXPIRED',
  ACCESSED = 'CONSENT_ACCESSED',
  UPDATED = 'CONSENT_UPDATED',
  VERIFIED = 'CONSENT_VERIFIED',
}

/**
 * Compliance check result
 */
export interface ComplianceCheck {
  patientId: string
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' // legacy support
  violations: ComplianceViolation[]
  isCompliant: boolean
  lastChecked: string
  recommendations: string[]
}

/**
 * Compliance violation
 */
export interface ComplianceViolation {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  affectedConsentId?: string
  recommendation: string
  dueDate?: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
}

/**
 * Consent validation utilities
 */
export class ConsentValidator {
  /**
   * Validate consent request
   */
  static validateRequest(_request: ConsentRequest): string[] {
    const errors: string[] = []

    if (!_request.patientId) errors.push('Patient ID is required')
    if (!_request.consentType) errors.push('Consent type is required')
    if (!_request.purpose) errors.push('Purpose is required')
    if (!_request.dataTypes || _request.dataTypes.length === 0) {
      errors.push('At least one data type must be specified')
    }

    // Validate expiration date is in the future
    if (_request.expiration) {
      const expirationDate = new Date(_request.expiration)
      if (expirationDate <= new Date()) {
        errors.push('Expiration date must be in the future')
      }
    }

    return errors
  }

  /**
   * Check if consent is currently valid
   */
  static isValid(consent: ConsentRecord): boolean {
    const now = new Date()

    // Check status
    if (consent.status !== ConsentStatus.ACTIVE) {
      return false
    }

    // Check expiration
    if (consent.expiresAt && new Date(consent.expiresAt) <= now) {
      return false
    }

    // Check revocation
    if (consent.revokedAt && new Date(consent.revokedAt) <= now) {
      return false
    }

    return true
  }

  /**
   * Check if consent covers specific data types
   */
  static coversDataTypes(
    consent: ConsentRecord,
    requiredDataTypes: string[],
  ): boolean {
    return requiredDataTypes.every(type => consent.dataTypes.includes(type))
  }

  /**
   * Get remaining validity period in days
   */
  static getRemainingDays(consent: ConsentRecord): number {
    if (!consent.expiresAt) return Infinity

    const now = new Date()
    const expirationDate = new Date(consent.expiresAt)
    const diffTime = expirationDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }
}

/**
 * Consent factory methods
 */
export class ConsentFactory {
  /**
   * Create a new consent record from request
   */
  static createFromRequest(
    _request: ConsentRequest,
    grantedBy: string,
  ): ConsentRecord {
    const now = new Date().toISOString()

    return {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: _request.patientId,
      consentType: _request.consentType,
      status: ConsentStatus.ACTIVE,
      purpose: _request.purpose,
      dataTypes: _request.dataTypes,
      grantedAt: now,
      expiresAt: _request.expiration,
      legalBasis: LegalBasis.CONSENT,
      consentVersion: '1.0.0',
      metadata: _request.metadata,
      auditTrail: [
        {
          id: `audit_${Date.now()}`,
          timestamp: now,
          action: ConsentAction.CREATED,
          actorId: grantedBy,
          patientIdHash: this.hashPatientId(_request.patientId),
          details: {
            consentType: _request.consentType,
            purpose: _request.purpose,
            dataTypesCount: _request.dataTypes.length,
          },
        },
      ],
    }
  }

  /**
   * Create an audit event
   */
  static createAuditEvent(
    action: ConsentAction,
    patientId: string,
    actorId: string,
    details?: Record<string, unknown>,
  ): ConsentAuditEvent {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      actorId,
      patientIdHash: this.hashPatientId(patientId),
      details,
    }
  }

  /**
   * Hash patient ID for privacy-safe logging
   */
  private static hashPatientId(patientId: string): string {
    // Simple hash for demo - in production use proper crypto hash
    const hash = Array.from(patientId)
      .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
      .toString(16)
    return `patient_${hash.slice(-8)}`
  }
}
