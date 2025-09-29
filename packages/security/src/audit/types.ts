/**
 * Audit types for compliance and risk management
 */

export type ComplianceFramework = 
  | 'LGPD'
  | 'HIPAA'
  | 'GDPR'
  | 'CFM'
  | 'ANVISA'
  | 'SOX'
  | 'PCI_DSS'
  | 'ISO_27001'

export type RiskLevel = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'

export interface AuditLog {
  id: string
  timestamp: Date
  userId?: string
  action: string
  resource: string
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING'
  complianceFramework?: ComplianceFramework
  riskLevel: RiskLevel
  metadata?: Record<string, unknown>
}

export interface ComplianceCheck {
  id: string
  framework: ComplianceFramework
  requirement: string
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNKNOWN'
  lastCheck: Date
  evidence?: string[]
  recommendations?: string[]
}