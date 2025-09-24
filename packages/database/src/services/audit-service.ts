import { SupabaseClient } from '@supabase/supabase-js'
import { logHealthcareError } from '../../../shared/src/logging/healthcare-logger'
import type {
  AuditLogRequest,
  AuditSearchCriteria,
  ComplianceReport,
  MedicalDataClassification,
  RTCAuditLogEntry,
} from '../types/audit.types'

// Re-export types for external use
export type {
  AuditLogRequest,
  AuditSearchCriteria,
  AuditStatusType,
  ComplianceCheck,
  ComplianceReport,
  MedicalDataClassification,
  ResourceType,
  RTCAuditLogEntry,
} from '../types/audit.types'

// Database log entry interface
interface DatabaseLogEntry {
  id: string
  session_id?: string
  user_id: string
  action: string
  user_role?: 'doctor' | 'patient' | 'nurse' | 'admin' | 'system'
  data_classification?: MedicalDataClassification
  description?: string
  created_at: string
  ip_address?: string
  user_agent?: string
  resource_type?: string
  clinic_id?: string
  status?: string
  risk_level?: string
  event_type?: string
  timestamp?: string
  metadata?: Record<string, unknown>
  compliance_check?: {
    status?: string
    risk_level?: string
  }
}

/**
 * Service for managing audit logs and compliance reporting
 * Handles WebRTC session auditing, LGPD compliance, and security monitoring
 */
export class AuditService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Creates a new audit log entry
   * @param request - Audit log data
   * @returns Promise<string> - The ID of the created audit log
   */
  async createAuditLog(_request: AuditLogRequest): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('webrtc_audit_logs')
        .insert({
          action: request.action || request.eventType || 'UNKNOWN',
          user_id: request._userId,
          resource: request.resource || request.description || 'UNKNOWN',
          resource_type: request.resource || 'session', // Default resource type
          ip_address: request.ipAddress || 'unknown',
          user_agent: request.userAgent || 'unknown',
          clinic_id: request.clinicId,
          lgpd_basis: request.metadata?.legalBasis || null,
          old_values: request.metadata?.oldValues || null,
          new_values: request.metadata?.newValues || null,
        })
        .select('id')
        .single()

      if (error) {
        logHealthcareError('database', error, { method: 'createAuditLog', action: request.action })
        throw new Error(`Failed to create audit log: ${error.message}`)
      }

      return data.id
    } catch (error) {
      logHealthcareError('database', error, { method: 'createAuditLog', action: request.action })
      throw error
    }
  }

  /**
   * Logs the start of a WebRTC session
   * @param sessionId - Session identifier
   * @param userId - User identifier
   * @param userRole - User role
   * @param metadata - Additional session metadata
   * @returns Promise<string> - The ID of the created audit log
   */
  async logSessionStart(
    sessionId: string,
    _userId: string,
    userRole: 'doctor' | 'patient' | 'nurse' | 'admin',
    metadata?: {
      ipAddress?: string
      userAgent?: string
      clinicId?: string
      dataClassification?: MedicalDataClassification
    },
  ): Promise<string> {
    return this.createAuditLog({
      sessionId,
      action: 'CREATE',
      resource: 'TELEMEDICINE_SESSION',
      eventType: 'session-start',
      userId,
      userRole,
      dataClassification: metadata?.dataClassification,
      description: `${userRole} started WebRTC session`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      clinicId: metadata?.clinicId,
    })
  }

  /**
   * Logs the end of a WebRTC session
   * @param sessionId - Session identifier
   * @param userId - User identifier
   * @param userRole - User role
   * @param duration - Session duration in seconds
   * @param metadata - Additional session metadata
   * @returns Promise<string> - The ID of the created audit log
   */
  async logSessionEnd(
    sessionId: string,
    _userId: string,
    userRole: 'doctor' | 'patient' | 'nurse' | 'admin',
    duration: number,
    metadata?: {
      ipAddress?: string
      userAgent?: string
      clinicId?: string
      dataClassification?: MedicalDataClassification
      reason?: string
    },
  ): Promise<string> {
    return this.createAuditLog({
      sessionId,
      action: 'UPDATE',
      resource: 'TELEMEDICINE_SESSION',
      eventType: 'session-end',
      userId,
      userRole,
      dataClassification: metadata?.dataClassification,
      description: `${userRole} ended WebRTC session (duration: ${duration}s)${
        metadata?.reason ? ` - ${metadata.reason}` : ''
      }`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      clinicId: metadata?.clinicId,
      metadata: {
        sessionDuration: duration,
        endReason: metadata?.reason,
      },
    })
  }

  /**
   * Logs a data access event
   * @param userId - User identifier
   * @param userRole - User role
   * @param dataType - Type of data accessed
   * @param patientId - Patient identifier (if applicable)
   * @param metadata - Additional metadata
   * @returns Promise<string> - The ID of the created audit log
   */
  async logDataAccess(
    _userId: string,
    userRole: 'doctor' | 'patient' | 'nurse' | 'admin',
    dataType: string,
    patientId?: string,
    metadata?: {
      ipAddress?: string
      userAgent?: string
      clinicId?: string
      dataClassification?: MedicalDataClassification
      legalBasis?: string
    },
  ): Promise<string> {
    return this.createAuditLog({
      sessionId: `data-access-${Date.now()}`,
      action: 'READ',
      resource: 'PATIENT_DATA',
      eventType: 'data-access',
      userId,
      userRole,
      dataClassification: metadata?.dataClassification,
      description: `${userRole} accessed ${dataType}${
        patientId ? ` for patient ${patientId}` : ''
      }`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      clinicId: metadata?.clinicId,
      metadata: {
        dataType,
        patientId,
        legalBasis: metadata?.legalBasis,
      },
    })
  }

  /**
   * Logs a consent verification event
   * @param userId - User identifier
   * @param patientId - Patient identifier
   * @param consentType - Type of consent
   * @param isValid - Whether consent is valid
   * @param metadata - Additional metadata
   * @returns Promise<string> - The ID of the created audit log
   */
  async logConsentVerification(
    _userId: string,
    patientId: string,
    consentType: string,
    isValid: boolean,
    metadata?: {
      ipAddress?: string
      userAgent?: string
      clinicId?: string
      sessionId?: string
    },
  ): Promise<string> {
    return this.createAuditLog({
      sessionId: metadata?.sessionId || `consent-${Date.now()}`,
      action: 'READ',
      resource: 'PATIENT_CONSENT',
      eventType: 'consent-verification',
      userId,
      userRole: 'system',
      dataClassification: 'sensitive',
      description: `Consent verification for ${consentType}: ${isValid ? 'VALID' : 'INVALID'}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      clinicId: metadata?.clinicId,
      metadata: {
        patientId,
        consentType,
        isValid,
      },
    })
  }

  /**
   * Logs a security event
   * @param eventType - Type of security event
   * @param userId - User identifier (if applicable)
   * @param severity - Event severity
   * @param description - Event description
   * @param metadata - Additional metadata
   * @returns Promise<string> - The ID of the created audit log
   */
  async logSecurityEvent(
    eventType: string,
    _userId: string | null,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    metadata?: {
      ipAddress?: string
      userAgent?: string
      clinicId?: string
      sessionId?: string
      additionalData?: Record<string, unknown>
    },
  ): Promise<string> {
    return this.createAuditLog({
      sessionId: metadata?.sessionId || `security-${Date.now()}`,
      action: 'CREATE',
      resource: 'SYSTEM_CONFIG',
      eventType: `security-${eventType}`,
      _userId: userId || 'system',
      userRole: 'system',
      dataClassification: 'restricted',
      description,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      clinicId: metadata?.clinicId,
      metadata: {
        severity,
        ...metadata?.additionalData,
      },
    })
  }

  /**
   * Retrieves audit logs for a specific session
   * @param sessionId - Session identifier
   * @returns Promise<RTCAuditLogEntry[]> - Array of audit log entries
   */
  async getSessionAuditLogs(sessionId: string): Promise<RTCAuditLogEntry[]> {
    try {
      const { data: logs, error } = await this.supabase
        .from('webrtc_audit_logs')
        .select(
          `
          id,
          user_id,
          action,
          resource_type,
          created_at,
          ip_address,
          user_agent,
          session_id,
          status,
          risk_level
        `,
        )
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })

      if (error) {
        logHealthcareError('database', error, { method: 'getSessionAuditLogs', sessionId })
        return []
      }

      if (!logs) {
        return []
      }

      return logs.map((log: DatabaseLogEntry) => this.mapDatabaseLogToEntry(log))
    } catch (error) {
      logHealthcareError('database', error, { method: 'getSessionAuditLogs', sessionId })
      return []
    }
  }

  /**
   * Retrieves audit logs for a specific user
   * @param userId - User identifier
   * @param limit - Maximum number of logs to retrieve
   * @returns Promise<RTCAuditLogEntry[]> - Array of audit log entries
   */
  async getUserAuditLogs(
    _userId: string,
    limit?: number,
  ): Promise<RTCAuditLogEntry[]> {
    try {
      let query = this.supabase
        .from('webrtc_audit_logs')
        .select('*')
        .eq('user_id', _userId)
        .order('timestamp', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data: logs, error } = await query

      if (error) {
        logHealthcareError('database', error, { method: 'getUserAuditLogs', userId: _userId })
        return []
      }

      if (!logs) {
        return []
      }

      return logs.map((log: DatabaseLogEntry) => this.mapDatabaseLogToEntry(log))
    } catch (error) {
      logHealthcareError('database', error, { method: 'getUserAuditLogs', userId: _userId })
      return []
    }
  }

  /**
   * Retrieves audit logs within a date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param clinicId - Optional clinic filter
   * @param limit - Maximum number of logs to retrieve
   * @returns Promise<RTCAuditLogEntry[]> - Array of audit log entries
   */
  async getAuditLogsByDateRange(
    startDate: Date,
    endDate: Date,
    clinicId?: string,
    limit?: number,
  ): Promise<RTCAuditLogEntry[]> {
    try {
      let query = this.supabase
        .from('webrtc_audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())

      if (clinicId) {
        query = query.eq('clinic_id', clinicId)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data: logs, error } = await query

      if (error) {
        logHealthcareError('database', error, {
          method: 'getAuditLogsByDateRange',
          startDate,
          endDate,
          clinicId,
        })
        return []
      }

      if (!logs) {
        return []
      }

      return logs.map((log: any) => this.mapDatabaseLogToEntry(log))
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getAuditLogsByDateRange',
        startDate,
        endDate,
        clinicId,
      })
      return []
    }
  }

  /**
   * Generates a compliance report for a given date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param clinicId - Optional clinic filter
   * @returns Promise<ComplianceReport> - Compliance report
   */
  async getComplianceReport(
    startDate: Date,
    endDate: Date,
    clinicId?: string,
  ): Promise<ComplianceReport> {
    try {
      let query = this.supabase
        .from('webrtc_audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())

      if (clinicId) {
        query = query.eq('clinic_id', clinicId)
      }

      const { data: logs, error } = await query

      if (error) {
        logHealthcareError('database', error, {
          method: 'getComplianceReport',
          startDate,
          endDate,
          clinicId,
        })
        throw new Error(
          `Failed to generate compliance report: ${error.message}`,
        )
      }

      const auditLogs = logs
        ? logs.map((log: any) => this.mapDatabaseLogToEntry(log))
        : []

      return this.generateComplianceReport(auditLogs, startDate, endDate)
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getComplianceReport',
        startDate,
        endDate,
        clinicId,
      })
      throw error
    }
  }

  /**
   * Searches audit logs based on criteria
   * @param criteria - Search criteria
   * @returns Promise<RTCAuditLogEntry[]> - Array of matching audit log entries
   */
  async searchAuditLogs(
    criteria: AuditSearchCriteria,
  ): Promise<RTCAuditLogEntry[]> {
    try {
      let query = this.supabase.from('webrtc_audit_logs').select('*')

      if (criteria.sessionIds?.length) {
        query = query.in('session_id', criteria.sessionIds)
      }

      if (criteria.userIds?.length) {
        query = query.in('user_id', criteria.userIds)
      }

      if (criteria.eventTypes?.length) {
        query = query.in('event_type', criteria.eventTypes)
      }

      if (criteria.dataClassifications?.length) {
        query = query.in('data_classification', criteria.dataClassifications)
      }

      if (criteria.startDate) {
        const startDate = typeof criteria.startDate === 'string'
          ? new Date(criteria.startDate)
          : criteria.startDate
        query = query.gte('timestamp', startDate.toISOString())
      }

      if (criteria.endDate) {
        const endDate = typeof criteria.endDate === 'string'
          ? new Date(criteria.endDate)
          : criteria.endDate
        query = query.lte('timestamp', endDate.toISOString())
      }

      if (criteria.clinicId) {
        query = query.eq('clinic_id', criteria.clinicId)
      }

      if (criteria.complianceStatus !== undefined) {
        const statusFilter = criteria.complianceStatus ? 'SUCCESS' : 'FAILED'
        query = query.eq('status', statusFilter)
      }

      if (criteria.limit) {
        query = query.limit(criteria.limit)
      }

      query = query.order('timestamp', { ascending: false })

      const { data: logs, error } = await query

      if (error) {
        logHealthcareError('database', error, { method: 'searchAuditLogs', criteria })
        return []
      }

      if (!logs) {
        return []
      }

      return logs.map((log: any) => this.mapDatabaseLogToEntry(log))
    } catch (error) {
      logHealthcareError('database', error, { method: 'searchAuditLogs', criteria })
      return []
    }
  }

  /**
   * Maps database log entry to RTCAuditLogEntry
   * @private
   */
  private mapDatabaseLogToEntry(log: DatabaseLogEntry): RTCAuditLogEntry {
    return {
      id: log.id,
      sessionId: log.session_id,
      _userId: log.user_id,
      action: log.action || this.mapActionToEventType(log.event_type || log.action),
      userRole: log.user_role || 'system',
      dataClassification: typeof log.data_classification === 'string'
        ? log.data_classification
        : 'general',
      description: log.description || '',
      timestamp: log.timestamp || log.created_at,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      clinicContext: log.clinic_id ? { clinicId: log.clinic_id } : undefined,
      metadata: log.metadata,
      complianceCheck: {
        isCompliant: log.compliance_check?.status === 'COMPLIANT' ||
          log.status === 'SUCCESS',
        violations: [],
        riskLevel: (log.compliance_check?.risk_level ||
          log.risk_level ||
          'LOW') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      },
    }
  }

  /**
   * Maps action to event type
   * @private
   */
  private mapActionToEventType(action: string): string {
    const actionMap: Record<string, string> = {
      'session-start': 'video-call-start',
      'session-end': 'video-call-end',
      'data-access': 'data-access',
      'consent-verification': 'consent-verification',
      'security-event': 'security-event',
    }

    return actionMap[action] || action
  }

  /**
   * Generates compliance report from audit logs
   * @private
   */
  private generateComplianceReport(
    logs: RTCAuditLogEntry[],
    startDate: Date,
    endDate: Date,
  ): ComplianceReport {
    const totalEvents = logs.length
    const compliantEvents = logs.filter(
      log => log.complianceCheck?.isCompliant === true,
    ).length
    const nonCompliantEvents = totalEvents - compliantEvents

    const riskLevels = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    }

    const violations: Record<string, number> = {}

    logs.forEach(log => {
      const riskLevel = log.complianceCheck?.riskLevel || 'LOW'
      if (riskLevel in riskLevels) {
        riskLevels[riskLevel.toLowerCase() as keyof typeof riskLevels]++
      }
    })

    const recommendations: string[] = []

    if (nonCompliantEvents > 0) {
      recommendations.push('Review and address non-compliant events')
    }

    if (riskLevels.high > 0 || riskLevels.critical > 0) {
      recommendations.push('Investigate high and critical risk events')
    }

    if (Object.keys(violations).length > 0) {
      recommendations.push('Address identified compliance violations')
    }

    return {
      id: `compliance-report-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      reportType: 'GENERAL',
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString(),
      reportPeriod: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalEvents,
        complianceScore: totalEvents > 0 ? (compliantEvents / totalEvents) * 100 : 100,
        violationsCount: nonCompliantEvents,
        riskLevel: this.calculateOverallRiskLevel(riskLevels),
        compliantEvents,
        nonCompliantEvents,
        complianceRate: totalEvents > 0 ? compliantEvents / totalEvents : 1,
      },
      riskLevels,
      violations,
      recommendations,
    }
  }

  private calculateOverallRiskLevel(riskLevels: {
    low: number
    medium: number
    high: number
    critical: number
  }): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskLevels.critical > 0) return 'CRITICAL'
    if (riskLevels.high > 0) return 'HIGH'
    if (riskLevels.medium > 0) return 'MEDIUM'
    return 'LOW'
  }
}
