import type { Request, } from 'express'
import { supabase, } from '../lib/supabase'

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  CONSENT_UPDATE = 'CONSENT_UPDATE',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_EXPORT = 'DATA_EXPORT',
}

export enum AuditResourceType {
  USER = 'USER',
  PATIENT = 'PATIENT',
  DOCUMENT = 'DOCUMENT',
  CONSENT = 'CONSENT',
  LGPD_REQUEST = 'LGPD_REQUEST',
  SYSTEM = 'SYSTEM',
  AUTH = 'AUTH',
}

export interface AuditLogEntry {
  id?: string
  clinic_id?: string
  user_id: string
  action: AuditAction
  resource_type: AuditResourceType
  resource_id?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  lgpd_basis?: string
  created_at?: string
}

export interface AuditLogQuery {
  user_id?: string
  action?: AuditAction
  resource_type?: AuditResourceType
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface AuditStatistics {
  total_events: number
  unique_users: number
  actions_by_type: Record<string, number>
  resource_types: Record<string, number>
  recent_activity: AuditLogEntry[]
}

export class AuditService {
  /**
   * Log an audit event
   */
  static async log(entry: Omit<AuditLogEntry, 'id' | 'created_at'>,): Promise<void> {
    try {
      const { error, } = await supabase
        .from('audit_logs',)
        .insert({
          clinic_id: entry.clinic_id,
          user_id: entry.user_id,
          action: entry.action,
          resource_type: entry.resource_type,
          resource_id: entry.resource_id,
          old_values: entry.old_values,
          new_values: entry.new_values,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
          lgpd_basis: entry.lgpd_basis,
        },)

      if (error) {
        console.error('Failed to log audit event:', error,)
        throw error
      }
    } catch (error) {
      console.error('Audit logging failed:', error,)
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Log audit event from Express request
   */
  static async logFromRequest(
    req: Request,
    action: AuditAction,
    resourceType: AuditResourceType,
    resourceId?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    lgpdBasis?: string,
  ): Promise<void> {
    const userId = req.user?.id || 'anonymous'
    const clinicId = req.user?.clinic_id
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.get('User-Agent',)

    await this.log({
      clinic_id: clinicId,
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent,
      lgpd_basis: lgpdBasis,
    },)
  }

  /**
   * Query audit logs
   */
  static async query(params: AuditLogQuery,): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('audit_logs',)
        .select('*',)
        .order('created_at', { ascending: false, },)

      if (params.user_id) {
        query = query.eq('user_id', params.user_id,)
      }

      if (params.action) {
        query = query.eq('action', params.action,)
      }

      if (params.resource_type) {
        query = query.eq('resource_type', params.resource_type,)
      }

      if (params.start_date) {
        query = query.gte('created_at', params.start_date,)
      }

      if (params.end_date) {
        query = query.lte('created_at', params.end_date,)
      }

      if (params.limit) {
        query = query.limit(params.limit,)
      }

      if (params.offset) {
        query = query.range(params.offset, (params.offset + (params.limit || 50)) - 1,)
      }

      const { data, error, } = await query

      if (error) {
        console.error('Failed to query audit logs:', error,)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Audit query failed:', error,)
      return []
    }
  }

  /**
   * Get audit statistics
   */
  static async getStatistics(
    startDate?: string,
    endDate?: string,
  ): Promise<AuditStatistics> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30,)

      const start = startDate || thirtyDaysAgo.toISOString()
      const end = endDate || new Date().toISOString()

      // Get all logs in the date range
      const { data: logs, error, } = await supabase
        .from('audit_logs',)
        .select('*',)
        .gte('created_at', start,)
        .lte('created_at', end,)
        .order('created_at', { ascending: false, },)

      if (error) {
        console.error('Failed to get audit statistics:', error,)
        throw error
      }

      const auditLogs = logs || []

      // Calculate statistics
      const uniqueUsers = new Set(auditLogs.map(log => log.user_id),).size
      const actionsByType: Record<string, number> = {}
      const resourceTypes: Record<string, number> = {}

      auditLogs.forEach(log => {
        actionsByType[log.action] = (actionsByType[log.action] || 0) + 1
        resourceTypes[log.resource_type] = (resourceTypes[log.resource_type] || 0) + 1
      },)

      return {
        total_events: auditLogs.length,
        unique_users: uniqueUsers,
        actions_by_type: actionsByType,
        resource_types: resourceTypes,
        recent_activity: auditLogs.slice(0, 10,),
      }
    } catch (error) {
      console.error('Failed to get audit statistics:', error,)
      return {
        total_events: 0,
        unique_users: 0,
        actions_by_type: {},
        resource_types: {},
        recent_activity: [],
      }
    }
  }

  /**
   * Get LGPD-related audit events
   */
  static async getLGPDEvents(
    startDate?: string,
    endDate?: string,
  ): Promise<AuditLogEntry[]> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30,)

    return this.query({
      start_date: startDate || thirtyDaysAgo.toISOString(),
      end_date: endDate || new Date().toISOString(),
      limit: 100,
    },)
  }

  /**
   * Export audit logs
   */
  static async exportLogs(
    params: AuditLogQuery,
    format: 'json' | 'csv' = 'json',
  ): Promise<string> {
    const logs = await this.query(params,)

    if (format === 'csv') {
      const headers = [
        'ID',
        'Clinic ID',
        'User ID',
        'Action',
        'Resource Type',
        'Resource ID',
        'IP Address',
        'User Agent',
        'LGPD Basis',
        'Created At',
      ]

      const csvRows = logs.map(log => [
        log.id,
        log.clinic_id,
        log.user_id,
        log.action,
        log.resource_type,
        log.resource_id,
        log.ip_address,
        log.user_agent,
        log.lgpd_basis,
        log.created_at,
      ])

      return [headers, ...csvRows,]
        .map(row => row.map(field => `"${field || ''}"`).join(',',))
        .join('\n',)
    }

    return JSON.stringify(logs, null, 2,)
  }
}
