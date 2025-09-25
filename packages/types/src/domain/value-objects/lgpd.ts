import { LegalBasis } from './gender.js'

/**
 * LGPD-specific value objects and utilities
 */

/**
 * Data retention periods for LGPD compliance
 */
export enum RetentionPeriod {
  FIVE_YEARS = '5_years',
  TEN_YEARS = '10_years',
  TWENTY_FIVE_YEARS = '25_years',
  INDEFINITE = 'indefinite',
}

/**
 * Consent status for LGPD compliance
 */
export enum ConsentStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

/**
 * LGPD consent data
 */
export interface LGPDConsent {
  id: string
  patientId: string
  dataProcessing: boolean
  dataSharing: boolean
  marketing: boolean
  retentionPeriod: RetentionPeriod
  consentedAt: string
  ipAddress?: string
  userAgent?: string
  legalBasis: LegalBasis
  version: string
  expiresAt?: string
  revokedAt?: string
}

/**
 * Anonymization configuration
 */
export interface AnonymizationConfig {
  removePersonalData: boolean
  pseudonymizeIdentifiers: boolean
  aggregateData: boolean
  keepStatisticalData: boolean
}

/**
 * Data subject rights request types
 */
export enum DataSubjectRequestType {
  ACCESS = 'access',
  PORTABILITY = 'portability',
  DELETION = 'deletion',
  RECTIFICATION = 'rectification',
  OBJECTION = 'objection',
}

/**
 * Data subject request
 */
export interface DataSubjectRequest {
  id: string
  patientId: string
  requestType: DataSubjectRequestType
  requestedAt: string
  requestedBy: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  processedAt?: string
  processedBy?: string
  resolution?: string
  rejectionReason?: string
}

/**
 * Audit log entry for LGPD compliance
 */
export interface LGPDAuditLogEntry {
  id: string
  timestamp: string
  patientId: string
  action: string
  performedBy: string
  performedByRole: string
  details: Record<string, unknown>
  ipAddress: string
  userAgent?: string
}

/**
 * LGPD compliance report
 */
export interface LGPDComplianceReport {
  patientId: string
  generatedAt: string
  isCompliant: boolean
  violations: LGPDViolation[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastAuditDate: string
}

/**
 * LGPD violation
 */
export interface LGPDViolation {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedData: string[]
  detectedAt: string
  detectedBy: string
  resolution?: string
  resolvedAt?: string
}

/**
 * Data retention policy
 */
export interface DataRetentionPolicy {
  dataType: string
  retentionPeriod: RetentionPeriod
  legalBasis: LegalBasis
  anonymizationMethod: string
  exceptions: string[]
}

/**
 * Anonymization utilities
 */
export class LGPDAnonymizer {
  /**
   * Anonymize patient data for LGPD compliance
   */
  static anonymizePatientData(patientData: any, config: AnonymizationConfig): any {
    const anonymized = { ...patientData }

    if (config.removePersonalData) {
      // Remove direct identifiers
      delete anonymized.name
      delete anonymized.fullName
      delete anonymized.email
      delete anonymized.phone
      delete anonymized.address
      delete anonymized.cpf
      delete anonymized.rg
    }

    if (config.pseudonymizeIdentifiers) {
      // Replace identifiers with pseudonyms
      anonymized.id = `patient_${this.hash(anonymized.id)}`
      anonymized.medicalRecordNumber = `mrn_${this.hash(anonymized.medicalRecordNumber)}`
    }

    if (config.aggregateData) {
      // Aggregate dates and numerical data
      if (anonymized.birthDate) {
        anonymized.birthYear = new Date(anonymized.birthDate).getFullYear()
        delete anonymized.birthDate
      }
    }

    return anonymized
  }

  /**
   * Simple hash function for pseudonymization
   */
  private static hash(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Check if data needs anonymization based on retention policy
   */
  static needsAnonymization(
    data: any,
    retentionPolicy: DataRetentionPolicy,
  ): boolean {
    if (!data.createdAt) return false

    const createdAt = new Date(data.createdAt)
    const now = new Date()
    const retentionPeriod = this.getRetentionDuration(retentionPolicy.retentionPeriod)
    const expirationDate = new Date(createdAt.getTime() + retentionPeriod)

    return now > expirationDate
  }

  /**
   * Convert retention period to milliseconds
   */
  private static getRetentionDuration(period: RetentionPeriod): number {
    const oneYear = 365 * 24 * 60 * 60 * 1000

    switch (period) {
      case RetentionPeriod.FIVE_YEARS:
        return 5 * oneYear
      case RetentionPeriod.TEN_YEARS:
        return 10 * oneYear
      case RetentionPeriod.TWENTY_FIVE_YEARS:
        return 25 * oneYear
      case RetentionPeriod.INDEFINITE:
        return Infinity
      default:
        return oneYear
    }
  }
}