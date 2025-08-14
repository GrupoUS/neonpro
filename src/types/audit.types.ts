// Audit and Security Types
export type AuditAction = 
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' 
  | 'LOGIN' | 'LOGOUT' | 'EXPORT' 
  | 'CONSENT_GRANTED' | 'CONSENT_WITHDRAWN' 
  | 'EMERGENCY_ACCESS' | 'ADMIN_ACTION'

export interface AuditLog {
  id: string
  userId?: string
  action: AuditAction
  resourceType: string
  resourceId?: string
  description: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  legalBasis?: string
  dataCategories: string[]
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  automatedAction: boolean
  createdAt: string
}

export interface SecurityEvent {
  id: string
  type: 'login_failure' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ipAddress: string
  userAgent?: string
  description: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  createdAt: string
}

export interface ComplianceReport {
  id: string
  type: 'LGPD' | 'ANVISA' | 'CFM' | 'ISO27001'
  period: {
    start: string
    end: string
  }
  totalEvents: number
  complianceScore: number
  violations: ComplianceViolation[]
  recommendations: string[]
  generatedAt: string
  generatedBy: string
}

export interface ComplianceViolation {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedUsers: number
  detectedAt: string
  resolvedAt?: string
  resolution?: string
}

export interface DataAccessLog {
  id: string
  userId: string
  dataType: string
  dataId: string
  accessType: 'read' | 'write' | 'delete' | 'export'
  purpose: string
  legalBasis: string
  consentId?: string
  ipAddress: string
  accessedAt: string
}