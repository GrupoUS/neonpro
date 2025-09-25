/**
 * Healthcare Compliance Utilities
 *
 * Provides testing utilities for Brazilian healthcare compliance
 * including LGPD, ANVISA, and CFM requirements.
 */

export * from './anvisa'
export * from './audit-trail'
export * from './cfm'
export * from './lgpd'
export type {
  AuditTrailEntry,
  ComplianceReport,
  ComplianceRequirement,
  ComplianceStandard,
  ComplianceTestResult,
  ConsentRecord,
  RiskLevel,
} from './types'
export type { DataSubjectRights } from './types'

// Compliance standards
export const COMPLIANCE_STANDARDS = {
  LGPD: {
    name: 'Lei Geral de Proteção de Dados',
    description: 'Brazilian Data Protection Law',
    requirements: [
      'consent-management',
      'data-minimization',
      'purpose-limitation',
      'audit-trail',
      'data-subject-rights',
    ],
  },
  ANVISA: {
    name: 'Agência Nacional de Vigilância Sanitária',
    description: 'Health Surveillance Agency',
    requirements: [
      'medical-device-classification',
      'clinical-workflow-validation',
      'risk-management',
      'post-market-surveillance',
    ],
  },
  CFM: {
    name: 'Conselho Federal de Medicina',
    description: 'Federal Council of Medicine',
    requirements: [
      'professional-licensing',
      'telemedicine-compliance',
      'digital-prescription',
      'patient-confidentiality',
    ],
  },
} as const

// Compliance test categories
export const COMPLIANCE_CATEGORIES = {
  DATA_PROTECTION: 'data-protection',
  MEDICAL_DEVICE: 'medical-device',
  PROFESSIONAL_LICENSING: 'professional-licensing',
  AUDIT_TRAIL: 'audit-trail',
} as const

// Risk levels for compliance violations
export const RISK_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const
