/**
 * 📋 AUDIT LOGGER - Healthcare Compliance and Security Audit System
 *
 * Features:
 * - Comprehensive audit logging for healthcare operations
 * - LGPD compliance with structured audit trails
 * - Integration with security monitoring systems
 * - HIPAA and ANVISA compliance tracking
 * - Financial operations audit for healthcare billing
 * - Professional coordination and patient care tracking
 * - CFM medical standards compliance logging
 */

import { SecureLogger } from './secure-logger'
import { LogContext } from './secure-logger'

// Audit Categories for different healthcare operations
export const AUDIT_CATEGORIES = {
  PATIENT_MANAGEMENT: 'patient_management',
  BILLING: 'billing',
  APPOINTMENTS: 'appointments',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  PROFESSIONAL_COORDINATION: 'professional_coordination',
  MEDICAL_RECORDS: 'medical_records',
  PAYMENTS: 'payments',
  SECURITY: 'security',
  COMPLIANCE: 'compliance',
  SYSTEM: 'system',
} as const

export type AuditCategory = keyof typeof AUDIT_CATEGORIES

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'AUTHORIZE'
  | 'DENY'
  | 'EXPORT'
  | 'IMPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'REFUND'
  | 'PAYMENT'
  | 'CONSULTATION'
  | 'TREATMENT'
  | 'PRESCRIPTION'
  | 'REFERRAL'
  | 'COORDINATION'
  | 'AUDIT'
  | 'SECURITY_ALERT'

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId?: string
  patientId?: string
  professionalId?: string
  clinicId?: string
  category: AuditCategory
  action: AuditAction
  resource: string
  resourceId?: string
  details?: any
  result: 'SUCCESS' | 'FAILURE' | 'PENDING'
  ip?: string
  userAgent?: string
  correlationId?: string
  compliance?: {
    lgpd: boolean
    hipaa?: boolean
    anvisa?: boolean
    cfm?: boolean
  }
  risk?: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    factors?: string[]
  }
}

interface AuditLoggerConfig {
  enableComplianceTracking?: boolean
  enableRiskAssessment?: boolean
  enablePerformanceMetrics?: boolean
  retentionPeriod?: number // days
}

class AuditLogger {
  private logger: SecureLogger
  private config: Required<AuditLoggerConfig>
  private auditQueue: AuditLogEntry[] = []

  constructor(config: AuditLoggerConfig = {}) {
    this.config = {
      enableComplianceTracking: config.enableComplianceTracking ?? true,
      enableRiskAssessment: config.enableRiskAssessment ?? true,
      enablePerformanceMetrics: config.enablePerformanceMetrics ?? true,
      retentionPeriod: config.retentionPeriod ?? 2555, // 7 years default for healthcare
    }

    this.logger = SecureLogger
  }

  /**
   * Log a healthcare operation audit event
   */
  logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
    }

    // Validate compliance requirements
    if (this.config.enableComplianceTracking) {
      this.validateCompliance(auditEntry)
    }

    // Assess risk level
    if (this.config.enableRiskAssessment) {
      auditEntry.risk = this.assessRisk(auditEntry)
    }

    // Add to queue for batch processing
    this.auditQueue.push(auditEntry)

    // Log immediately for critical events
    if (auditEntry.risk?.level === 'CRITICAL' || auditEntry.result === 'FAILURE') {
      this.logger.error('Healthcare audit event', undefined, {
        auditType: 'healthcare_audit',
        category: auditEntry.category,
        action: auditEntry.action,
        result: auditEntry.result,
        riskLevel: auditEntry.risk?.level,
        compliance: auditEntry.compliance,
        ...auditEntry.details,
      })
    } else {
      this.logger.info('Healthcare audit event', {
        auditType: 'healthcare_audit',
        category: auditEntry.category,
        action: auditEntry.action,
        result: auditEntry.result,
        riskLevel: auditEntry.risk?.level,
        compliance: auditEntry.compliance,
        ...auditEntry.details,
      })
    }

    // Process queue periodically in production
    if (this.auditQueue.length >= 10) {
      this.processAuditQueue()
    }
  }

  /**
   * Log patient management operations
   */
  logPatientOperation(
    action: AuditAction,
    patientId: string,
    userId: string,
    details?: any,
    result: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS',
  ): void {
    this.logAudit({
      userId,
      patientId,
      category: 'PATIENT_MANAGEMENT',
      action,
      resource: 'patient',
      resourceId: patientId,
      details,
      result,
    })
  }

  /**
   * Log billing and financial operations
   */
  logBillingOperation(
    action: AuditAction,
    billingId: string,
    userId: string,
    amount?: number,
    paymentMethod?: string,
    details?: any,
    result: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS',
  ): void {
    this.logAudit({
      userId,
      category: 'BILLING',
      action,
      resource: 'billing',
      resourceId: billingId,
      details: {
        amount,
        paymentMethod,
        ...details,
      },
      result,
      compliance: {
        lgpd: true,
        // Financial data may require additional compliance tracking
      },
    })
  }

  /**
   * Log professional coordination activities
   */
  logCoordinationOperation(
    action: AuditAction,
    coordinationId: string,
    professionalId: string,
    patientId?: string,
    details?: any,
    result: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS',
  ): void {
    this.logAudit({
      professionalId,
      patientId,
      category: 'PROFESSIONAL_COORDINATION',
      action,
      resource: 'coordination',
      resourceId: coordinationId,
      details,
      result,
      compliance: {
        lgpd: true,
        // Professional coordination may have specific compliance requirements
      },
    })
  }

  /**
   * Log authentication and authorization events
   */
  logAuthEvent(
    action: AuditAction,
    userId?: string,
    patientId?: string,
    professionalId?: string,
    result: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS',
    details?: any,
  ): void {
    this.logAudit({
      userId,
      patientId,
      professionalId,
      category: action === 'LOGIN' || action === 'LOGOUT' ? 'AUTHENTICATION' : 'AUTHORIZATION',
      action,
      resource: 'access_control',
      result,
      details: {
        ...details,
        // Security-related logging details
      },
      risk: {
        level: result === 'FAILURE' ? 'HIGH' : 'MEDIUM',
        factors: result === 'FAILURE' ? ['authentication_failure'] : [],
      },
    })
  }

  /**
   * Log medical record access
   */
  logMedicalRecordAccess(
    patientId: string,
    userId: string,
    recordType: string,
    action: 'VIEW' | 'EXPORT' | 'UPDATE',
    result: 'SUCCESS' | 'FAILURE' = 'SUCCESS',
    details?: any,
  ): void {
    this.logAudit({
      userId,
      patientId,
      category: 'MEDICAL_RECORDS',
      action,
      resource: 'medical_record',
      resourceId: patientId,
      details: {
        recordType,
        ...details,
      },
      result,
      compliance: {
        lgpd: true,
        hipaa: true,
        // Medical records have strict compliance requirements
      },
      risk: {
        level: action === 'EXPORT' ? 'HIGH' : 'MEDIUM',
        factors: ['medical_data_access'],
      },
    })
  }

  /**
   * Get audit trail for a specific entity
   */
  getAuditTrail(
    entityId: string,
    entityType: string,
    startDate?: Date,
    endDate?: Date,
  ): AuditLogEntry[] {
    // In a real implementation, this would query the audit database
    return this.auditQueue.filter(entry =>
      entry.resourceId === entityId &&
      entry.resource === entityType &&
      (!startDate || new Date(entry.timestamp) >= startDate) &&
      (!endDate || new Date(entry.timestamp) <= endDate)
    )
  }

  /**
   * Generate audit compliance report
   */
  generateComplianceReport(
    startDate: Date,
    endDate: Date,
  ): {
    totalEvents: number
    byCategory: Record<AuditCategory, number>
    byResult: Record<'SUCCESS' | 'FAILURE' | 'PENDING', number>
    complianceIssues: string[]
    riskDistribution: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', number>
  } {
    const filteredEntries = this.auditQueue.filter(entry => {
      const entryDate = new Date(entry.timestamp)
      return entryDate >= startDate && entryDate <= endDate
    })

    const report = {
      totalEvents: filteredEntries.length,
      byCategory: {} as Record<AuditCategory, number>,
      byResult: {
        SUCCESS: 0,
        FAILURE: 0,
        PENDING: 0,
      },
      complianceIssues: [] as string[],
      riskDistribution: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0,
      },
    }

    filteredEntries.forEach(entry => {
      // Count by category
      report.byCategory[entry.category] = (report.byCategory[entry.category] || 0) + 1

      // Count by result
      report.byResult[entry.result]++

      // Count by risk level
      if (entry.risk) {
        report.riskDistribution[entry.risk.level]++
      }

      // Check for compliance issues
      if (entry.compliance && !entry.compliance.lgpd) {
        report.complianceIssues.push(`LGPD violation in ${entry.category}:${entry.action}`)
      }
    })

    return report
  }

  // Private helper methods
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private validateCompliance(entry: AuditLogEntry): void {
    // Basic compliance validation
    entry.compliance = {
      lgpd: true,
      hipaa: entry.category === 'MEDICAL_RECORDS',
      anvisa: entry.category === 'MEDICAL_RECORDS' || entry.category === 'PATIENT_MANAGEMENT',
      cfm: entry.category === 'PROFESSIONAL_COORDINATION',
    }

    // Add specific compliance rules based on action and category
    if (entry.category === 'BILLING' && entry.action === 'EXPORT') {
      entry.compliance.lgpd = false // Financial exports may have specific requirements
      entry.complianceIssues = ['Financial export requires additional compliance approval']
    }
  }

  private assessRisk(
    entry: AuditLogEntry,
  ): { level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; factors?: string[] } {
    const factors: string[] = []
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'

    // Base risk assessment by category
    const categoryRisk: Record<AuditCategory, 'LOW' | 'MEDIUM' | 'HIGH'> = {
      PATIENT_MANAGEMENT: 'MEDIUM',
      BILLING: 'MEDIUM',
      APPOINTMENTS: 'LOW',
      AUTHENTICATION: 'HIGH',
      AUTHORIZATION: 'HIGH',
      PROFESSIONAL_COORDINATION: 'MEDIUM',
      MEDICAL_RECORDS: 'HIGH',
      PAYMENTS: 'MEDIUM',
      SECURITY: 'HIGH',
      COMPLIANCE: 'MEDIUM',
      SYSTEM: 'LOW',
    }

    riskLevel = categoryRisk[entry.category] || 'LOW'

    // Adjust risk based on action
    if (entry.action === 'DELETE' || entry.action === 'EXPORT') {
      riskLevel = this.increaseRiskLevel(riskLevel)
      factors.push('destructive_operation')
    }

    if (entry.action === 'LOGIN' && entry.result === 'FAILURE') {
      riskLevel = 'HIGH'
      factors.push('authentication_failure')
    }

    if (entry.result === 'FAILURE') {
      riskLevel = this.increaseRiskLevel(riskLevel)
      factors.push('operation_failed')
    }

    // Medical data operations are always higher risk
    if (entry.category === 'MEDICAL_RECORDS') {
      riskLevel = this.increaseRiskLevel(riskLevel)
      factors.push('medical_data_access')
    }

    // Financial operations with large amounts
    if (entry.category === 'BILLING' && entry.details?.amount && entry.details.amount > 10000) {
      riskLevel = this.increaseRiskLevel(riskLevel)
      factors.push('high_value_transaction')
    }

    return {
      level: riskLevel,
      factors: factors.length > 0 ? factors : undefined,
    }
  }

  private increaseRiskLevel(
    current: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
    const currentIndex = levels.indexOf(current)
    return levels[Math.min(currentIndex + 1, levels.length - 1)]
  }

  private async processAuditQueue(): Promise<void> {
    // In a real implementation, this would persist the audit logs to a secure database
    const processed = [...this.auditQueue]
    this.auditQueue = []

    // Log processing completion
    this.logger.info(`Processed ${processed.length} audit events`, {
      auditType: 'batch_processing',
      eventsCount: processed.length,
      timestamp: new Date().toISOString(),
    })
  }
}

// Factory function for creating audit logger instances
export function createAuditLogger(config?: AuditLoggerConfig): AuditLogger {
  return new AuditLogger(config)
}

// Default audit logger instance
export const auditLogger = createAuditLogger({
  enableComplianceTracking: true,
  enableRiskAssessment: true,
  enablePerformanceMetrics: true,
})

// Export types and constants
export type { AuditLogEntry, AuditLoggerConfig }
export { type AuditAction, type AuditCategory }
