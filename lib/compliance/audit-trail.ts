/**
 * LGPD Compliance Framework - Audit Trail System
 * Sistema de auditoria para compliance LGPD
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 37, 38, 39 (Auditoria e Relatórios)
 */

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum AuditEventType {
  // Data Access Events
  DATA_ACCESS = 'data_access',
  DATA_VIEW = 'data_view',
  DATA_EXPORT = 'data_export',
  DATA_DOWNLOAD = 'data_download',
  
  // Data Modification Events
  DATA_CREATE = 'data_create',
  DATA_UPDATE = 'data_update',
  DATA_DELETE = 'data_delete',
  DATA_CORRECTION = 'data_correction',
  
  // Consent Events
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
  CONSENT_EXPIRED = 'consent_expired',
  CONSENT_RENEWED = 'consent_renewed',
  
  // Data Subject Rights Events
  RIGHT_TO_ACCESS = 'right_to_access',
  RIGHT_TO_RECTIFICATION = 'right_to_rectification',
  RIGHT_TO_ERASURE = 'right_to_erasure',
  RIGHT_TO_PORTABILITY = 'right_to_portability',
  RIGHT_TO_OBJECT = 'right_to_object',
  
  // Security Events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH = 'data_breach',
  ENCRYPTION_FAILURE = 'encryption_failure',
  DECRYPTION_FAILURE = 'decryption_failure',
  
  // System Events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PERMISSION_CHANGE = 'permission_change',
  SYSTEM_ERROR = 'system_error'
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
  ERROR = 'error'
}

export interface AuditEvent {
  id?: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  status: AuditStatus;
  userId: string;
  clinicId: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  description: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  timestamp: Date;
  duration?: number; // milliseconds
  dataClassification?: string;
  legalBasis?: string;
  consentId?: string;
  retentionPeriod?: number; // days
  metadata?: Record<string, any>;
}

export interface AuditQuery {
  clinicId: string;
  userId?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  status?: AuditStatus;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditReport {
  id: string;
  clinicId: string;
  reportType: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    eventsByType: Record<AuditEventType, number>;
    eventsBySeverity: Record<AuditSeverity, number>;
    uniqueUsers: number;
    dataAccesses: number;
    consentChanges: number;
    securityEvents: number;
  };
  compliance: {
    lgpdCompliant: boolean;
    issues: string[];
    recommendations: string[];
  };
  generatedAt: Date;
  generatedBy: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const AuditEventSchema = z.object({
  eventType: z.nativeEnum(AuditEventType),
  severity: z.nativeEnum(AuditSeverity),
  status: z.nativeEnum(AuditStatus),
  userId: z.string().uuid(),
  clinicId: z.string().uuid(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  action: z.string().min(1),
  description: z.string().min(1),
  details: z.record(z.any()),
  ipAddress: z.string(),
  userAgent: z.string(),
  sessionId: z.string().optional(),
  timestamp: z.date(),
  duration: z.number().optional(),
  dataClassification: z.string().optional(),
  legalBasis: z.string().optional(),
  consentId: z.string().uuid().optional(),
  retentionPeriod: z.number().optional(),
  metadata: z.record(z.any()).optional()
});

const AuditQuerySchema = z.object({
  clinicId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  eventType: z.nativeEnum(AuditEventType).optional(),
  severity: z.nativeEnum(AuditSeverity).optional(),
  status: z.nativeEnum(AuditStatus).optional(),
  resourceType: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(1000).default(100),
  sortBy: z.string().default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ============================================================================
// AUDIT TRAIL CLASS
// ============================================================================

export class LGPDAuditTrail {
  private supabase: any;
  private retentionPeriod: number; // days
  private batchSize: number;
  private enableRealTimeAlerts: boolean;

  constructor(
    supabase: any,
    options: {
      retentionPeriod?: number;
      batchSize?: number;
      enableRealTimeAlerts?: boolean;
    } = {}
  ) {
    this.supabase = supabase;
    this.retentionPeriod = options.retentionPeriod || 2555; // 7 years (LGPD requirement)
    this.batchSize = options.batchSize || 100;
    this.enableRealTimeAlerts = options.enableRealTimeAlerts || true;
  }

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  /**
   * Log audit event
   */
  public async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    try {
      // Validate event data
      const validatedEvent = AuditEventSchema.parse({
        ...event,
        timestamp: new Date()
      });

      // Add retention period if not specified
      if (!validatedEvent.retentionPeriod) {
        validatedEvent.retentionPeriod = this.getRetentionPeriod(event.eventType);
      }

      // Insert into database
      const { data, error } = await this.supabase
        .from('lgpd_audit_trail')
        .insert(validatedEvent)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log audit event: ${error.message}`);
      }

      // Check for real-time alerts
      if (this.enableRealTimeAlerts) {
        await this.checkAlerts(data);
      }

      return data;

    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw - audit failures shouldn't break main functionality
      // But log to a fallback system if available
      await this.logToFallback(event, error);
      throw error;
    }
  }

  /**
   * Log multiple events in batch
   */
  public async logBatch(events: Omit<AuditEvent, 'id' | 'timestamp'>[]): Promise<AuditEvent[]> {
    try {
      const validatedEvents = events.map(event => 
        AuditEventSchema.parse({
          ...event,
          timestamp: new Date(),
          retentionPeriod: event.retentionPeriod || this.getRetentionPeriod(event.eventType)
        })
      );

      const { data, error } = await this.supabase
        .from('lgpd_audit_trail')
        .insert(validatedEvents)
        .select();

      if (error) {
        throw new Error(`Failed to log audit batch: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('Batch audit logging failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // AUDIT QUERYING
  // ============================================================================

  /**
   * Query audit events
   */
  public async queryEvents(query: AuditQuery): Promise<{
    events: AuditEvent[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // Validate query
      const validatedQuery = AuditQuerySchema.parse(query);
      const { page, limit, sortBy, sortOrder, ...filters } = validatedQuery;

      // Build query
      let dbQuery = this.supabase
        .from('lgpd_audit_trail')
        .select('*', { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'startDate') {
            dbQuery = dbQuery.gte('timestamp', value.toISOString());
          } else if (key === 'endDate') {
            dbQuery = dbQuery.lte('timestamp', value.toISOString());
          } else {
            dbQuery = dbQuery.eq(key, value);
          }
        }
      });

      // Apply sorting and pagination
      const offset = (page - 1) * limit;
      dbQuery = dbQuery
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data: events, error, count } = await dbQuery;

      if (error) {
        throw new Error(`Failed to query audit events: ${error.message}`);
      }

      return {
        events: events || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };

    } catch (error) {
      console.error('Audit query failed:', error);
      throw error;
    }
  }

  /**
   * Get audit events for specific resource
   */
  public async getResourceAudit(
    clinicId: string,
    resourceType: string,
    resourceId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ): Promise<AuditEvent[]> {
    const query: AuditQuery = {
      clinicId,
      resourceType,
      startDate: options.startDate,
      endDate: options.endDate,
      limit: options.limit || 100
    };

    const result = await this.queryEvents(query);
    return result.events.filter(event => event.resourceId === resourceId);
  }

  /**
   * Get user activity audit
   */
  public async getUserActivity(
    clinicId: string,
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      eventTypes?: AuditEventType[];
      limit?: number;
    } = {}
  ): Promise<AuditEvent[]> {
    const query: AuditQuery = {
      clinicId,
      userId,
      startDate: options.startDate,
      endDate: options.endDate,
      limit: options.limit || 100
    };

    const result = await this.queryEvents(query);
    
    if (options.eventTypes) {
      return result.events.filter(event => 
        options.eventTypes!.includes(event.eventType)
      );
    }

    return result.events;
  }

  // ============================================================================
  // COMPLIANCE REPORTING
  // ============================================================================

  /**
   * Generate LGPD compliance report
   */
  public async generateComplianceReport(
    clinicId: string,
    period: { start: Date; end: Date },
    generatedBy: string
  ): Promise<AuditReport> {
    try {
      // Query all events in period
      const { events } = await this.queryEvents({
        clinicId,
        startDate: period.start,
        endDate: period.end,
        limit: 10000 // Large limit for comprehensive report
      });

      // Generate summary statistics
      const summary = this.generateSummary(events);
      
      // Analyze compliance
      const compliance = this.analyzeCompliance(events);

      const report: AuditReport = {
        id: crypto.randomUUID(),
        clinicId,
        reportType: 'lgpd_compliance',
        period,
        summary,
        compliance,
        generatedAt: new Date(),
        generatedBy
      };

      // Store report
      await this.supabase
        .from('lgpd_audit_reports')
        .insert(report);

      return report;

    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(events: AuditEvent[]): AuditReport['summary'] {
    const eventsByType = {} as Record<AuditEventType, number>;
    const eventsBySeverity = {} as Record<AuditSeverity, number>;
    const uniqueUsers = new Set<string>();
    let dataAccesses = 0;
    let consentChanges = 0;
    let securityEvents = 0;

    events.forEach(event => {
      // Count by type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      
      // Count by severity
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      
      // Track unique users
      uniqueUsers.add(event.userId);
      
      // Count specific categories
      if ([AuditEventType.DATA_ACCESS, AuditEventType.DATA_VIEW, AuditEventType.DATA_EXPORT].includes(event.eventType)) {
        dataAccesses++;
      }
      
      if ([AuditEventType.CONSENT_GRANTED, AuditEventType.CONSENT_WITHDRAWN].includes(event.eventType)) {
        consentChanges++;
      }
      
      if ([AuditEventType.UNAUTHORIZED_ACCESS, AuditEventType.DATA_BREACH].includes(event.eventType)) {
        securityEvents++;
      }
    });

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      uniqueUsers: uniqueUsers.size,
      dataAccesses,
      consentChanges,
      securityEvents
    };
  }

  /**
   * Analyze LGPD compliance
   */
  private analyzeCompliance(events: AuditEvent[]): AuditReport['compliance'] {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for security issues
    const securityEvents = events.filter(e => 
      [AuditEventType.UNAUTHORIZED_ACCESS, AuditEventType.DATA_BREACH].includes(e.eventType)
    );
    
    if (securityEvents.length > 0) {
      issues.push(`${securityEvents.length} security events detected`);
      recommendations.push('Review security measures and access controls');
    }

    // Check for failed operations
    const failedEvents = events.filter(e => e.status === AuditStatus.FAILURE);
    if (failedEvents.length > events.length * 0.05) { // More than 5% failure rate
      issues.push('High failure rate detected');
      recommendations.push('Investigate system reliability issues');
    }

    // Check for data access without consent
    const dataAccessEvents = events.filter(e => 
      e.eventType === AuditEventType.DATA_ACCESS && !e.consentId
    );
    
    if (dataAccessEvents.length > 0) {
      issues.push('Data access without explicit consent detected');
      recommendations.push('Ensure all data access has valid consent');
    }

    return {
      lgpdCompliant: issues.length === 0,
      issues,
      recommendations
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get retention period for event type
   */
  private getRetentionPeriod(eventType: AuditEventType): number {
    // LGPD requires different retention periods for different types of data
    switch (eventType) {
      case AuditEventType.DATA_BREACH:
      case AuditEventType.UNAUTHORIZED_ACCESS:
        return 2555; // 7 years for security events
      case AuditEventType.CONSENT_GRANTED:
      case AuditEventType.CONSENT_WITHDRAWN:
        return 1825; // 5 years for consent events
      default:
        return this.retentionPeriod;
    }
  }

  /**
   * Check for real-time alerts
   */
  private async checkAlerts(event: AuditEvent): Promise<void> {
    // Check for critical events that need immediate attention
    if (event.severity === AuditSeverity.CRITICAL || 
        event.eventType === AuditEventType.DATA_BREACH) {
      await this.sendAlert(event);
    }
  }

  /**
   * Send alert for critical events
   */
  private async sendAlert(event: AuditEvent): Promise<void> {
    // Implementation would depend on notification system
    console.warn('CRITICAL AUDIT EVENT:', event);
    
    // Could integrate with:
    // - Email notifications
    // - Slack/Teams alerts
    // - SMS notifications
    // - Dashboard alerts
  }

  /**
   * Log to fallback system when main audit fails
   */
  private async logToFallback(event: any, error: any): Promise<void> {
    // Fallback logging (e.g., to file system, external service)
    console.error('AUDIT FALLBACK:', { event, error });
  }

  /**
   * Clean up old audit records
   */
  public async cleanupOldRecords(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionPeriod);

      const { data, error } = await this.supabase
        .from('lgpd_audit_trail')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('id');

      if (error) {
        throw new Error(`Failed to cleanup old records: ${error.message}`);
      }

      return data?.length || 0;

    } catch (error) {
      console.error('Audit cleanup failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create LGPD audit trail instance
 */
export function createLGPDAuditTrail(
  supabase: any,
  options?: {
    retentionPeriod?: number;
    batchSize?: number;
    enableRealTimeAlerts?: boolean;
  }
): LGPDAuditTrail {
  return new LGPDAuditTrail(supabase, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default LGPDAuditTrail;
