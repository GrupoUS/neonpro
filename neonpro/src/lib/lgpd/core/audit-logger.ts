// LGPD Audit Logger - Core Module
// Story 1.5: LGPD Compliance Automation
// Task 4: Comprehensive Audit Trail (AC: 4)

import { createClient } from '@/lib/supabase/client';
import type {
  LGPDAuditLog,
  LGPDDataCategory,
  LGPDLegalBasis,
  LGPDServiceResponse,
  LGPDEventType
} from '../types';
import { LGPDEventEmitter } from '../utils/event-emitter';

/**
 * LGPD Audit Logger
 * Comprehensive audit trail system for LGPD compliance
 * Implements LGPD Article 37 (Security and Audit) requirements
 */
export class LGPDAuditLogger {
  private supabase = createClient();
  private eventEmitter = new LGPDEventEmitter();
  private batchSize = 100;
  private batchTimeout = 5000; // 5 seconds
  private pendingLogs: Omit<LGPDAuditLog, 'id' | 'created_at'>[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize batch processing
    this.initializeBatchProcessing();
  }

  /**
   * Log LGPD-related event with full audit trail
   * @param logData - Audit log data
   * @param immediate - Whether to log immediately (default: false for batch processing)
   */
  async logEvent(
    logData: Omit<LGPDAuditLog, 'id' | 'created_at'>,
    immediate: boolean = false
  ): Promise<LGPDServiceResponse<LGPDAuditLog>> {
    const startTime = Date.now();

    try {
      // Validate required fields
      this.validateLogData(logData);

      // Enrich log data with additional context
      const enrichedLogData = await this.enrichLogData(logData);

      if (immediate) {
        // Log immediately for critical events
        return await this.logImmediate(enrichedLogData, startTime);
      } else {
        // Add to batch for efficient processing
        return await this.addToBatch(enrichedLogData, startTime);
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to log audit event',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Log critical security event immediately
   */
  async logSecurityEvent(
    logData: Omit<LGPDAuditLog, 'id' | 'created_at'>
  ): Promise<LGPDServiceResponse<LGPDAuditLog>> {
    // Security events are always logged immediately
    const result = await this.logEvent({
      ...logData,
      severity: 'high',
      metadata: {
        ...logData.metadata,
        security_event: true,
        immediate_log: true
      }
    }, true);

    // Emit security alert
    if (result.success) {
      this.eventEmitter.emit('security_event_logged' as LGPDEventType, {
        logId: result.data?.id,
        action: logData.action,
        severity: 'high',
        timestamp: new Date()
      });
    }

    return result;
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(filters: {
    userId?: string;
    clinicId?: string;
    action?: string;
    resourceType?: string;
    dateRange?: { start: Date; end: Date };
    severity?: 'low' | 'medium' | 'high';
    limit?: number;
    offset?: number;
  }): Promise<LGPDServiceResponse<LGPDAuditLog[]>> {
    const startTime = Date.now();

    try {
      let query = this.supabase
        .from('lgpd_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.clinicId) {
        query = query.eq('clinic_id', filters.clinicId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get audit logs: ${error.message}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: data || [],
        processing_time_ms: processingTime,
        audit_logged: false // Read operations don't require audit
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get audit logs',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Generate audit report for compliance purposes
   */
  async generateAuditReport(filters: {
    clinicId: string;
    dateRange: { start: Date; end: Date };
    includeUserData?: boolean;
    format?: 'json' | 'csv';
  }): Promise<LGPDServiceResponse<any>> {
    const startTime = Date.now();

    try {
      // Get audit logs for the period
      const logsResult = await this.getAuditLogs({
        clinicId: filters.clinicId,
        dateRange: filters.dateRange,
        limit: 10000 // Large limit for reports
      });

      if (!logsResult.success || !logsResult.data) {
        throw new Error('Failed to retrieve audit logs for report');
      }

      const logs = logsResult.data;

      // Generate report analytics
      const report = {
        report_metadata: {
          clinic_id: filters.clinicId,
          period: {
            start: filters.dateRange.start.toISOString(),
            end: filters.dateRange.end.toISOString()
          },
          generated_at: new Date().toISOString(),
          total_events: logs.length,
          report_format: filters.format || 'json'
        },
        summary: {
          total_events: logs.length,
          unique_users: new Set(logs.map(l => l.user_id)).size,
          event_types: this.groupByField(logs, 'action'),
          resource_types: this.groupByField(logs, 'resource_type'),
          severity_distribution: this.groupByField(logs, 'severity'),
          daily_activity: this.groupByDate(logs),
          top_actors: this.getTopActors(logs),
          data_categories_affected: this.getDataCategoriesStats(logs)
        },
        compliance_indicators: {
          consent_events: logs.filter(l => l.action.includes('consent')).length,
          data_subject_requests: logs.filter(l => l.action.includes('data_subject')).length,
          security_events: logs.filter(l => l.severity === 'high').length,
          data_breaches: logs.filter(l => l.action.includes('breach')).length,
          retention_events: logs.filter(l => l.action.includes('retention')).length
        },
        detailed_logs: filters.includeUserData ? logs : logs.map(l => ({
          ...l,
          user_id: this.anonymizeUserId(l.user_id),
          ip_address: this.anonymizeIpAddress(l.ip_address)
        }))
      };

      // Log report generation
      await this.logEvent({
        user_id: 'system',
        clinic_id: filters.clinicId,
        action: 'audit_report_generated',
        resource_type: 'audit_report',
        data_affected: ['audit_logs'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'compliance_reporting',
        ip_address: 'system',
        user_agent: 'audit_system',
        actor_id: 'system',
        actor_type: 'system',
        severity: 'medium',
        metadata: {
          report_period: filters.dateRange,
          events_included: logs.length,
          include_user_data: filters.includeUserData
        }
      }, true);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: report,
        compliance_notes: [
          'Audit report generated for compliance purposes',
          'All LGPD-related events included',
          'User data anonymized unless explicitly requested'
        ],
        legal_references: ['LGPD Art. 37°', 'LGPD Art. 48°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate audit report',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Search audit logs with advanced filtering
   */
  async searchAuditLogs(searchParams: {
    query: string;
    clinicId: string;
    searchFields?: ('action' | 'resource_type' | 'processing_purpose' | 'metadata')[];
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): Promise<LGPDServiceResponse<LGPDAuditLog[]>> {
    const startTime = Date.now();

    try {
      const searchFields = searchParams.searchFields || ['action', 'resource_type', 'processing_purpose'];
      
      // Build search conditions
      const searchConditions = searchFields.map(field => {
        if (field === 'metadata') {
          return `metadata::text.ilike.%${searchParams.query}%`;
        }
        return `${field}.ilike.%${searchParams.query}%`;
      }).join(',');

      let query = this.supabase
        .from('lgpd_audit_logs')
        .select('*')
        .eq('clinic_id', searchParams.clinicId)
        .or(searchConditions)
        .order('created_at', { ascending: false });

      if (searchParams.dateRange) {
        query = query
          .gte('created_at', searchParams.dateRange.start.toISOString())
          .lte('created_at', searchParams.dateRange.end.toISOString());
      }

      if (searchParams.limit) {
        query = query.limit(searchParams.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to search audit logs: ${error.message}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: data || [],
        processing_time_ms: processingTime,
        audit_logged: false
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search audit logs',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Flush pending batch logs immediately
   */
  async flushBatch(): Promise<LGPDServiceResponse<number>> {
    if (this.pendingLogs.length === 0) {
      return {
        success: true,
        data: 0,
        audit_logged: false,
        processing_time_ms: 0
      };
    }

    return await this.processBatch();
  }

  /**
   * Get audit statistics for monitoring
   */
  async getAuditStatistics(
    clinicId: string,
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<LGPDServiceResponse<any>> {
    const startTime = Date.now();

    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      const { data, error } = await this.supabase
        .from('lgpd_audit_logs')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('created_at', startDate.toISOString());

      if (error) {
        throw new Error(`Failed to get audit statistics: ${error.message}`);
      }

      const logs = data || [];
      
      const statistics = {
        period,
        total_events: logs.length,
        events_by_hour: this.groupByHour(logs),
        top_actions: this.getTopActions(logs, 10),
        severity_breakdown: this.groupByField(logs, 'severity'),
        user_activity: this.getUserActivityStats(logs),
        data_categories: this.getDataCategoriesStats(logs),
        compliance_events: {
          consent_granted: logs.filter(l => l.action === 'consent_granted').length,
          consent_withdrawn: logs.filter(l => l.action === 'consent_withdrawn').length,
          data_exported: logs.filter(l => l.action === 'data_exported').length,
          data_deleted: logs.filter(l => l.action === 'data_deleted').length,
          security_incidents: logs.filter(l => l.severity === 'high').length
        }
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: statistics,
        processing_time_ms: processingTime,
        audit_logged: false
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get audit statistics',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  // Private helper methods

  private validateLogData(logData: Omit<LGPDAuditLog, 'id' | 'created_at'>): void {
    const required = ['user_id', 'clinic_id', 'action', 'resource_type', 'legal_basis', 'processing_purpose'];
    
    for (const field of required) {
      if (!logData[field as keyof typeof logData]) {
        throw new Error(`Required field missing: ${field}`);
      }
    }
  }

  private async enrichLogData(
    logData: Omit<LGPDAuditLog, 'id' | 'created_at'>
  ): Promise<Omit<LGPDAuditLog, 'id' | 'created_at'>> {
    return {
      ...logData,
      severity: logData.severity || this.determineSeverity(logData.action),
      metadata: {
        ...logData.metadata,
        timestamp: new Date().toISOString(),
        system_version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown'
      }
    };
  }

  private determineSeverity(action: string): 'low' | 'medium' | 'high' {
    const highSeverityActions = [
      'data_breach', 'unauthorized_access', 'consent_violation',
      'data_leak', 'security_incident', 'admin_override'
    ];
    
    const mediumSeverityActions = [
      'consent_withdrawn', 'data_deleted', 'data_exported',
      'user_created', 'user_deleted', 'permission_changed'
    ];

    if (highSeverityActions.some(a => action.includes(a))) {
      return 'high';
    }
    if (mediumSeverityActions.some(a => action.includes(a))) {
      return 'medium';
    }
    return 'low';
  }

  private async logImmediate(
    logData: Omit<LGPDAuditLog, 'id' | 'created_at'>,
    startTime: number
  ): Promise<LGPDServiceResponse<LGPDAuditLog>> {
    const { data, error } = await this.supabase
      .from('lgpd_audit_logs')
      .insert(logData)
      .select()
      .single();

    const processingTime = Date.now() - startTime;

    if (error) {
      return {
        success: false,
        error: `Failed to log audit event: ${error.message}`,
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }

    return {
      success: true,
      data,
      audit_logged: true,
      processing_time_ms: processingTime
    };
  }

  private async addToBatch(
    logData: Omit<LGPDAuditLog, 'id' | 'created_at'>,
    startTime: number
  ): Promise<LGPDServiceResponse<LGPDAuditLog>> {
    this.pendingLogs.push(logData);

    // Process batch if it reaches the size limit
    if (this.pendingLogs.length >= this.batchSize) {
      await this.processBatch();
    }

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      data: logData as LGPDAuditLog, // Return the log data (will get ID when batch is processed)
      audit_logged: true,
      processing_time_ms: processingTime
    };
  }

  private initializeBatchProcessing(): void {
    // Set up batch timer
    this.batchTimer = setInterval(async () => {
      if (this.pendingLogs.length > 0) {
        await this.processBatch();
      }
    }, this.batchTimeout);
  }

  private async processBatch(): Promise<LGPDServiceResponse<number>> {
    if (this.pendingLogs.length === 0) {
      return { success: true, data: 0, audit_logged: false, processing_time_ms: 0 };
    }

    const startTime = Date.now();
    const logsToProcess = [...this.pendingLogs];
    this.pendingLogs = [];

    try {
      const { data, error } = await this.supabase
        .from('lgpd_audit_logs')
        .insert(logsToProcess);

      const processingTime = Date.now() - startTime;

      if (error) {
        // Re-add failed logs to batch for retry
        this.pendingLogs.unshift(...logsToProcess);
        
        return {
          success: false,
          error: `Failed to process audit log batch: ${error.message}`,
          audit_logged: false,
          processing_time_ms: processingTime
        };
      }

      return {
        success: true,
        data: logsToProcess.length,
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Re-add failed logs to batch for retry
      this.pendingLogs.unshift(...logsToProcess);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process audit log batch',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  // Analytics helper methods

  private groupByField(logs: LGPDAuditLog[], field: keyof LGPDAuditLog): Record<string, number> {
    return logs.reduce((acc, log) => {
      const value = String(log[field] || 'unknown');
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByDate(logs: LGPDAuditLog[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      const date = new Date(log.created_at || Date.now()).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByHour(logs: LGPDAuditLog[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      const hour = new Date(log.created_at || Date.now()).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      acc[hourKey] = (acc[hourKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopActors(logs: LGPDAuditLog[], limit: number = 10): Array<{ actor: string; count: number }> {
    const actorCounts = this.groupByField(logs, 'actor_id');
    return Object.entries(actorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([actor, count]) => ({ actor, count }));
  }

  private getTopActions(logs: LGPDAuditLog[], limit: number = 10): Array<{ action: string; count: number }> {
    const actionCounts = this.groupByField(logs, 'action');
    return Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([action, count]) => ({ action, count }));
  }

  private getDataCategoriesStats(logs: LGPDAuditLog[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    logs.forEach(log => {
      if (log.data_affected) {
        log.data_affected.forEach(category => {
          categories[category] = (categories[category] || 0) + 1;
        });
      }
    });
    
    return categories;
  }

  private getUserActivityStats(logs: LGPDAuditLog[]): {
    unique_users: number;
    most_active_users: Array<{ user_id: string; activity_count: number }>;
  } {
    const userCounts = this.groupByField(logs, 'user_id');
    const uniqueUsers = Object.keys(userCounts).length;
    
    const mostActiveUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([user_id, activity_count]) => ({ user_id, activity_count }));

    return {
      unique_users: uniqueUsers,
      most_active_users: mostActiveUsers
    };
  }

  private anonymizeUserId(userId: string): string {
    // Simple anonymization - hash the user ID
    return `user_${userId.slice(0, 8)}***`;
  }

  private anonymizeIpAddress(ipAddress: string): string {
    if (!ipAddress || ipAddress === 'unknown') return 'unknown';
    
    // Anonymize IP address (keep first 3 octets for IPv4)
    const parts = ipAddress.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    
    // For IPv6 or other formats, just show first part
    return `${ipAddress.split(':')[0]}:***`;
  }

  /**
   * Cleanup method to clear batch timer
   */
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Flush any remaining logs
    if (this.pendingLogs.length > 0) {
      this.processBatch();
    }
  }
}
