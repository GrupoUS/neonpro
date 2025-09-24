/**
 * Agent Audit Service
 *
 * Provides comprehensive audit logging for all AI agent data access attempts
 * with LGPD compliance and healthcare security requirements.
 */

import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

export interface AuditEvent {
  id: string
  _userId: string
  sessionId?: string
  action: string
  resource: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  error?: string
  metadata?: Record<string, any>
  compliance?: {
    lgpdConsentVerified?: boolean
    dataAccessReason?: string
    dataRetentionPolicy?: string
    patientId?: string
    sensitivityLevel?: 'low' | 'medium' | 'high' | 'critical'
  }
}

export interface AuditQueryOptions {
  _userId?: string
  sessionId?: string
  action?: string
  resource?: string
  startDate?: string
  endDate?: string
  success?: boolean
  limit?: number
  offset?: number
}

export class AgentAuditService {
  private supabase: ReturnType<typeof createClient<Database>>
  private batchSize = 100
  private flushInterval = 5000 // 5 seconds
  private pendingEvents: AuditEvent[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
    this.startFlushTimer()
  }

  /**
   * Log an audit event
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }

    this.pendingEvents.push(auditEvent)

    // Flush immediately if batch size reached
    if (this.pendingEvents.length >= this.batchSize) {
      await this.flushPendingEvents()
    }
  }

  /**
   * Log data access attempt
   */
  async logDataAccess(params: {
    _userId: string
    sessionId?: string
    action: 'read' | 'write' | 'delete'
    resource: string
    resourceId?: string
    success: boolean
    error?: string
    patientId?: string
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, any>
  }): Promise<void> {
    const sensitivityLevel = this.determineSensitivityLevel(
      params.resource,
      params.patientId,
    )

    await this.logEvent({
      _userId: params.userId,
      sessionId: params.sessionId,
      action: `${params.action}:${params.resource}`,
      resource: params.resource,
      success: params.success,
      error: params.error,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        ...params.metadata,
        resourceId: params.resourceId,
        actionType: params.action,
        accessMethod: 'api',
      },
      compliance: {
        lgpdConsentVerified: await this.verifyLgpdConsent(params._userId),
        dataAccessReason: this.determineAccessReason(
          params.action,
          params.resource,
        ),
        dataRetentionPolicy: this.getRetentionPolicy(params.resource),
        patientId: params.patientId,
        sensitivityLevel,
      },
    })
  }

  /**
   * Log AI agent query
   */
  async logAgentQuery(params: {
    _userId: string
    sessionId: string
    _query: string
    responseLength: number
    processingTimeMs: number
    success: boolean
    error?: string
    patientIds?: string[]
    sources?: Array<{
      type: string
      title: string
      id: string
    }>
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    const containsPhi = this.containsProtectedHealthInfo(params._query)

    await this.logEvent({
      _userId: params.userId,
      sessionId: params.sessionId,
      action: 'ai_query',
      resource: 'agent_session',
      success: params.success,
      error: params.error,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        queryLength: params.query.length,
        responseLength: params.responseLength,
        processingTimeMs: params.processingTimeMs,
        patientIds: params.patientIds,
        sources: params.sources,
        containsPhi,
        aiModel: 'gpt-4', // Could be configured
        queryType: this.categorizeQuery(params._query),
      },
      compliance: {
        lgpdConsentVerified: await this.verifyLgpdConsent(params._userId),
        dataAccessReason: 'ai_assistant_interaction',
        dataRetentionPolicy: '30_days',
        patientIds: params.patientIds,
        sensitivityLevel: containsPhi ? 'high' : 'medium',
      },
    })
  }

  /**
   * Log session management events
   */
  async logSessionEvent(params: {
    _userId: string
    sessionId: string
    action: 'create' | 'update' | 'delete' | 'expire'
    success: boolean
    error?: string
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    await this.logEvent({
      _userId: params.userId,
      sessionId: params.sessionId,
      action: `session_${params.action}`,
      resource: 'agent_session',
      success: params.success,
      error: params.error,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        ...params.metadata,
        sessionAction: params.action,
      },
      compliance: {
        lgpdConsentVerified: await this.verifyLgpdConsent(params._userId),
        dataAccessReason: 'session_management',
        dataRetentionPolicy: '24_hours',
      },
    })
  }

  /**
   * Log permission check events
   */
  async logPermissionCheck(params: {
    _userId: string
    sessionId?: string
    permission: string
    granted: boolean
    reason?: string
    resource?: string
    processingTimeMs: number
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    await this.logEvent({
      _userId: params.userId,
      sessionId: params.sessionId,
      action: 'permission_check',
      resource: params.resource || 'permissions',
      success: params.granted,
      error: params.granted ? undefined : params.reason,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        permission: params.permission,
        processingTimeMs: params.processingTimeMs,
        checkType: 'rbac',
      },
      compliance: {
        lgpdConsentVerified: true, // Permission checks don't require additional consent
        dataAccessReason: 'security_validation',
        dataRetentionPolicy: '90_days',
      },
    })
  }

  /**
   * Query audit logs
   */
  async queryAuditLogs(options: AuditQueryOptions): Promise<{
    events: AuditEvent[]
    total: number
    hasMore: boolean
  }> {
    try {
      let query = this.supabase
        .from('agent_audit_log')
        .select('*', { count: 'exact' })

      // Apply filters
      if (options._userId) {
        query = query.eq('user_id', options._userId)
      }

      if (options.sessionId) {
        query = query.eq('session_id', options.sessionId)
      }

      if (options.action) {
        query = query.eq('action', options.action)
      }

      if (options.resource) {
        query = query.eq('table_name', options.resource)
      }

      if (options.success !== undefined) {
        query = query.eq('success', options.success)
      }

      if (options.startDate) {
        query = query.gte('created_at', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('created_at', options.endDate)
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.offset(options.offset)
      }

      // Order by timestamp descending
      query = query.order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const events = (data || []).map(this.mapAuditRecord)

      return {
        events,
        total: count || 0,
        hasMore: (options.limit || 0) + (options.offset || 0) < (count || 0),
      }
    } catch {
      console.error('Error querying audit logs:', error)
      return {
        events: [],
        total: 0,
        hasMore: false,
      }
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(
    options: {
      _userId?: string
      startDate?: string
      endDate?: string
    } = {},
  ): Promise<{
    totalEvents: number
    successfulEvents: number
    failedEvents: number
    topActions: Array<{ action: string; count: number }>
    topResources: Array<{ resource: string; count: number }>
    averageProcessingTime: number
  }> {
    try {
      let query = this.supabase
        .from('agent_audit_log')
        .select('action, table_name, success, compliance_metadata', {
          count: 'exact',
        })

      if (options._userId) {
        query = query.eq('user_id', options._userId)
      }

      if (options.startDate) {
        query = query.gte('created_at', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('created_at', options.endDate)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const events = data || []
      const actionCounts = new Map<string, number>()
      const resourceCounts = new Map<string, number>()
      let successfulEvents = 0
      let failedEvents = 0
      let totalProcessingTime = 0
      let processingTimeCount = 0

      events.forEach((event) => {
        // Count actions
        actionCounts.set(
          event.action,
          (actionCounts.get(event.action) || 0) + 1,
        )

        // Count resources
        if (event.table_name) {
          resourceCounts.set(
            event.table_name,
            (resourceCounts.get(event.table_name) || 0) + 1,
          )
        }

        // Count success/failure
        if (event.success) {
          successfulEvents++
        } else {
          failedEvents++
        }

        // Sum processing times
        const processingTime = event.compliance_metadata?.permission_processing_time
        if (processingTime) {
          totalProcessingTime += processingTime
          processingTimeCount++
        }
      })

      // Get top actions and resources
      const topActions = Array.from(actionCounts.entries())
        .map(([action, _count]) => ({ action, count }))
        .sort((a, _b) => b.count - a.count)
        .slice(0, 10)

      const topResources = Array.from(resourceCounts.entries())
        .map(([resource, _count]) => ({ resource, count }))
        .sort((a, _b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalEvents: events.length,
        successfulEvents,
        failedEvents,
        topActions,
        topResources,
        averageProcessingTime: processingTimeCount > 0
          ? totalProcessingTime / processingTimeCount
          : 0,
      }
    } catch {
      console.error('Error getting audit statistics:', error)
      return {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        topActions: [],
        topResources: [],
        averageProcessingTime: 0,
      }
    }
  }

  /**
   * Export audit logs for compliance reporting
   */
  async exportAuditLogs(
    options: AuditQueryOptions & {
      format: 'csv' | 'json'
    },
  ): Promise<string> {
    const { events } = await this.queryAuditLogs({
      ...options,
      limit: 10000, // Max export size
    })

    if (options.format === 'json') {
      return JSON.stringify(events, null, 2)
    }

    if (options.format === 'csv') {
      const headers = [
        'ID',
        'User ID',
        'Session ID',
        'Action',
        'Resource',
        'Timestamp',
        'IP Address',
        'Success',
        'Error',
        'Patient ID',
        'Sensitivity Level',
      ]

      const rows = events.map((event) => [
        event.id,
        event.userId,
        event.sessionId || '',
        event.action,
        event.resource,
        event.timestamp,
        event.ipAddress || '',
        event.success.toString(),
        event.error || '',
        event.compliance?.patientId || '',
        event.compliance?.sensitivityLevel || '',
      ])

      return [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${cell.toString().replace(/"/g, '""')}"`)
            .join(',')
        )
        .join('\n')
    }

    throw new Error('Unsupported export format')
  }

  /**
   * Cleanup old audit logs based on retention policy
   */
  async cleanupOldLogs(): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 90) // Keep 90 days

      const { error } = await this.supabase
        .from('agent_audit_log')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      if (error) {
        throw error
      }

      return 0 // Actual count would need to be queried separately
    } catch {
      console.error('Error cleaning up old audit logs:', error)
      return 0
    }
  }

  /**
   * Flush pending events to database
   */
  private async flushPendingEvents(): Promise<void> {
    if (this.pendingEvents.length === 0) {
      return
    }

    const eventsToFlush = [...this.pendingEvents]
    this.pendingEvents = []

    try {
      const records = eventsToFlush.map((event) => ({
        user_id: event.userId,
        session_id: event.sessionId,
        action: event.action,
        table_name: event.resource,
        record_id: event.metadata?.resourceId,
        old_values: event.metadata?.oldValues,
        new_values: event.metadata?.newValues,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        compliance_metadata: {
          ...event.metadata,
          ...event.compliance,
        },
      }))

      const { error } = await this.supabase
        .from('agent_audit_log')
        .insert(records)

      if (error) {
        console.error('Error flushing audit events:', error)
        // Re-add failed events to pending queue
        this.pendingEvents.unshift(...eventsToFlush)
      }
    } catch {
      console.error('Error flushing audit events:', error)
      // Re-add failed events to pending queue
      this.pendingEvents.unshift(...eventsToFlush)
    }
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushPendingEvents().catch(console.error)
    }, this.flushInterval)
  }

  /**
   * Map database record to audit event
   */
  private mapAuditRecord(record: any): AuditEvent {
    return {
      id: record.id,
      _userId: record.user_id,
      sessionId: record.session_id,
      action: record.action,
      resource: record.table_name,
      timestamp: record.created_at,
      ipAddress: record.ip_address,
      userAgent: record.user_agent,
      success: record.success,
      error: record.error,
      metadata: record.compliance_metadata,
      compliance: record.compliance_metadata,
    }
  }

  /**
   * Determine sensitivity level based on resource and patient data
   */
  private determineSensitivityLevel(
    resource: string,
    patientId?: string,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (resource.includes('financial') || resource.includes('billing')) {
      return 'high'
    }

    if (patientId && resource.includes('patient')) {
      return 'critical'
    }

    if (resource.includes('agent')) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Verify LGPD consent for a user
   */
  private async verifyLgpdConsent(_userId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('user_lgpd_consents')
        .select('id')
        .eq('user_id', _userId)
        .eq('consent_type', 'data_processing')
        .eq('granted', true)
        .gt('expires_at', new Date().toISOString())
        .single()

      return !!data
    } catch {
      console.error('Error verifying LGPD consent:', error)
      return false
    }
  }

  /**
   * Determine access reason based on action and resource
   */
  private determineAccessReason(action: string, resource: string): string {
    if (action === 'read') {
      return 'data_viewing'
    }

    if (action === 'write') {
      return 'data_modification'
    }

    if (action === 'delete') {
      return 'data_deletion'
    }

    if (resource.includes('ai') || resource.includes('agent')) {
      return 'ai_assistant_interaction'
    }

    return 'system_operation'
  }

  /**
   * Get retention policy for a resource
   */
  private getRetentionPolicy(resource: string): string {
    if (resource.includes('financial') || resource.includes('billing')) {
      return '7_years'
    }

    if (resource.includes('patient')) {
      return '25_years'
    }

    if (resource.includes('agent')) {
      return '30_days'
    }

    return '90_days'
  }

  /**
   * Check if content contains Protected Health Information (PHI)
   */
  private containsProtectedHealthInfo(text: string): boolean {
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{2}\/\d{2}\/\d{4}\b/, // Date
      /\b\d{3}-\d{3}-\d{4}\b/, // Phone
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b(patient|paciente|médico|doctor|hospital|clínica)\b/i, // Healthcare terms
    ]

    return phiPatterns.some((pattern) => pattern.test(text))
  }

  /**
   * Categorize AI query type
   */
  private categorizeQuery(_query: string): string {
    const lowerQuery = query.toLowerCase()

    if (
      lowerQuery.includes('agendamento')
      || lowerQuery.includes('appointment')
    ) {
      return 'scheduling'
    }

    if (lowerQuery.includes('paciente') || lowerQuery.includes('patient')) {
      return 'patient_data'
    }

    if (lowerQuery.includes('financeiro') || lowerQuery.includes('financial')) {
      return 'financial'
    }

    if (lowerQuery.includes('relatório') || lowerQuery.includes('report')) {
      return 'reporting'
    }

    return 'general'
  }

  /**
   * Shutdown the audit service
   */
  async shutdown(): Promise<void> {
    // Flush any remaining events
    await this.flushPendingEvents()

    // Clear timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
  }
}
