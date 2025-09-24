/**
 * Compliance Types and Interfaces
 *
 * Type definitions for healthcare compliance testing.
 */

export type ComplianceStandard = 'LGPD' | 'ANVISA' | 'CFM'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface ComplianceRequirement {
  id: string
  standard: ComplianceStandard
  description: string
  mandatory: boolean
  riskLevel: RiskLevel
}

export interface ComplianceTestResult {
  requirement: ComplianceRequirement
  passed: boolean
  evidence?: string
  violations?: string[]
  recommendations?: string[]
}

export interface ComplianceReport {
  standard: ComplianceStandard
  results: ComplianceTestResult[]
  overallCompliance: boolean
  complianceScore: number
  criticalViolations: ComplianceTestResult[]
  summary: string
}

export interface AuditTrailEntry {
  timestamp: Date
  action: string
  userId: string
  resourceType: string
  resourceId: string
  details?: Record<string, any>
}

export interface DataSubjectRights {
  accessRight: boolean
  rectificationRight: boolean
  erasureRight: boolean
  portabilityRight: boolean
  objectionRight: boolean
  restrictionRight: boolean
}

export interface ConsentRecord {
  id: string
  dataSubjectId: string
  purpose: string
  consentGiven: boolean
  consentDate: Date
  expiryDate?: Date
  withdrawalDate?: Date
  legalBasis: string
}
