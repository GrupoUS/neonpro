/**
 * Audit event for compliance and security tracking
 */
export interface AuditEvent {
  id: string
  timestamp: string
  action: string
  entityType: string
  entityId: string
  actorId: string
  metadata?: Record<string, unknown>
}

/**
 * Compliance check result for LGPD/healthcare regulations
 */
export interface ComplianceCheck {
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' // Legacy support
  violations: string[]
  isCompliant: boolean
  lastChecked?: string
  recommendations?: string[]
}

/**
 * Data access audit record
 */
export interface DataAccessAudit {
  id: string
  _userId: string
  patientId: string
  dataType: string
  action: 'read' | 'write' | 'delete' | 'export'
  timestamp: string
  source: string
  metadata?: Record<string, unknown>
}

/**
 * Privacy-safe logging utility
 */
export interface PrivateLogEntry {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: string
  redactedFields: string[]
  metadata?: Record<string, unknown>
}

/**
 * Audit log request for creating new audit entries
 */
export interface AuditLogRequest {
  sessionId?: string
  _userId: string
  action: string
  eventType?: string // Legacy support
  userRole?: 'doctor' | 'patient' | 'nurse' | 'admin' | 'system'
  dataClassification?: MedicalDataClassification
  description?: string
  resourceType?: ResourceType // Make optional for backward compatibility
  resourceId?: string
  resource?: string // Legacy support
  clinicId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  source?: string
}

/**
 * Compliance report for healthcare regulations
 */
export interface ComplianceReport {
  id: string
  generatedAt: string
  reportType: 'LGPD' | 'ANVISA' | 'CFM' | 'GENERAL'
  periodStart: string
  periodEnd: string
  reportPeriod?: {
    startDate: string
    endDate: string
  }
  summary: {
    totalEvents: number
    complianceScore: number
    violationsCount: number
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    compliantEvents?: number
    nonCompliantEvents?: number
    complianceRate?: number
  }
  violations:
    | Array<{
      id: string
      type: string
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      description: string
      timestamp: string
      resolved: boolean
    }>
    | Record<string, number> // Support both formats
  riskLevels?: {
    low: number
    medium: number
    high: number
    critical: number
  }
  recommendations: string[]
  metadata?: Record<string, unknown>
}

/**
 * Search criteria for audit logs
 */
export interface AuditSearchCriteria {
  startDate?: string | Date
  endDate?: string | Date
  _userId?: string
  userIds?: string[] // Multiple user IDs
  sessionIds?: string[] // Multiple session IDs
  action?: string
  eventTypes?: string[] // Multiple event types
  resourceType?: ResourceType
  resourceId?: string
  userRole?: 'doctor' | 'patient' | 'nurse' | 'admin' | 'system'
  dataClassification?: MedicalDataClassification
  dataClassifications?: MedicalDataClassification[] // Multiple classifications
  ipAddress?: string
  clinicId?: string
  complianceStatus?: 'compliant' | 'non_compliant' | 'pending'
  limit?: number
  offset?: number
  sortBy?: 'timestamp' | 'action' | 'userId'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Medical data classification levels
 */
export type MedicalDataClassification =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted'
  | 'pii'
  | 'phi'
  | 'sensitive'
  | 'general' // Legacy support

/**
 * Resource types for audit tracking
 */
export type ResourceType =
  | 'patient'
  | 'appointment'
  | 'medical_record'
  | 'prescription'
  | 'payment'
  | 'user'
  | 'clinic'
  | 'report'
  | 'system'
  | 'auth'
  | 'api'
  | 'file'
  | 'configuration'

/**
 * Audit status types
 */
export type AuditStatusType =
  | 'pending'
  | 'processed'
  | 'archived'
  | 'deleted'
  | 'error'

/**
 * Real-time compliance audit log entry
 */
export interface RTCAuditLogEntry {
  id: string
  timestamp: Date | string
  event?: string // Add missing property
  sessionId?: string
  _userId: string
  action: string
  userRole?: 'doctor' | 'patient' | 'nurse' | 'admin' | 'system'
  resourceType?: ResourceType // Make optional
  resourceId?: string
  resource?: string // Add legacy support
  dataClassification?: MedicalDataClassification // Make optional
  description?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  source?: string
  complianceFlags?: string[]
  complianceCheck?: {
    isCompliant: boolean
    violations: string[]
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }
  // Add missing properties from service usage
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  complianceStatus?: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW'
  violations?:
    | Array<{ rule: string; description: string; severity: string }>
    | Record<string, unknown>
  patientContext?: {
    patientId?: string
    cpf?: string
    medicalRecordNumber?: string
  }
  clinicContext?: {
    clinicId?: string
    cnpj?: string
  }
  riskScore?: number
  status?: AuditStatusType
  processedAt?: string
}
