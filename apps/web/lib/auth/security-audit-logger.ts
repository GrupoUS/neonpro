/**
 * Security Audit Logger for OAuth and LGPD Compliance
 * Comprehensive logging system for security events and compliance requirements
 */

import { createClient } from '@/app/utils/supabase/client';
import { performanceTracker } from './performance-tracker';

export type SecurityEvent = {
  eventId: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
  description: string;
  metadata: Record<string, any>;
  complianceFlags: ComplianceFlag[];
};

export type SecurityEventType =
  | 'authentication_success'
  | 'authentication_failure'
  | 'oauth_token_issued'
  | 'oauth_token_refreshed'
  | 'oauth_token_revoked'
  | 'session_created'
  | 'session_expired'
  | 'session_terminated'
  | 'suspicious_activity'
  | 'data_access'
  | 'data_modification'
  | 'permission_granted'
  | 'permission_denied'
  | 'privacy_consent_given'
  | 'privacy_consent_withdrawn'
  | 'data_export_requested'
  | 'data_deletion_requested'
  | 'security_violation'
  | 'compliance_check'
  | 'audit_log_access';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical';

export type ComplianceFlag =
  | 'lgpd_relevant'
  | 'gdpr_relevant'
  | 'hipaa_relevant'
  | 'pci_relevant'
  | 'data_processing'
  | 'consent_required'
  | 'retention_policy'
  | 'anonymization_required';

export type LGPDComplianceData = {
  dataSubject: string; // User ID
  dataController: string; // Clinic/Organization
  processingPurpose: string;
  legalBasis: LGPDLegalBasis;
  dataCategories: string[];
  retentionPeriod: number; // Days
  consentGiven: boolean;
  consentTimestamp?: number;
  dataSharing: boolean;
  thirdParties?: string[];
};

export type LGPDLegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';

export type AuditLogQuery = {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  sessionId?: string;
  eventTypes?: SecurityEventType[];
  severity?: SecuritySeverity[];
  complianceFlags?: ComplianceFlag[];
  limit?: number;
  offset?: number;
};

class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private readonly eventQueue: SecurityEvent[] = [];
  private readonly batchSize = 50;
  private readonly flushInterval = 30_000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startBatchProcessor();
  }

  public static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(
    eventType: SecurityEventType,
    description: string,
    metadata: Record<string, any> = {},
    options: {
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      severity?: SecuritySeverity;
      complianceFlags?: ComplianceFlag[];
    } = {},
  ): Promise<string> {
    const eventId = this.generateEventId();
    const timestamp = Date.now();

    const event: SecurityEvent = {
      eventId,
      eventType,
      severity: options.severity || this.determineSeverity(eventType),
      userId: options.userId,
      sessionId: options.sessionId,
      ipAddress: options.ipAddress || 'unknown',
      userAgent: options.userAgent || 'unknown',
      timestamp,
      description,
      metadata: {
        ...metadata,
        source: 'oauth_system',
        version: '1.0.0',
      },
      complianceFlags:
        options.complianceFlags || this.determineComplianceFlags(eventType),
    };

    // Add to queue for batch processing
    this.eventQueue.push(event);

    // Flush immediately for critical events
    if (event.severity === 'critical') {
      await this.flushEvents();
    }

    return eventId;
  }

  /**
   * Log OAuth-specific events
   */
  async logOAuthEvent(
    operation: 'signin' | 'signup' | 'refresh' | 'revoke',
    provider: 'google' | 'email',
    success: boolean,
    userId?: string,
    sessionId?: string,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    const eventType: SecurityEventType = success
      ? operation === 'signin' || operation === 'signup'
        ? 'authentication_success'
        : operation === 'refresh'
          ? 'oauth_token_refreshed'
          : 'oauth_token_revoked'
      : 'authentication_failure';

    const description = `OAuth ${operation} ${success ? 'successful' : 'failed'} for provider ${provider}`;

    return this.logSecurityEvent(
      eventType,
      description,
      {
        ...metadata,
        operation,
        provider,
        success,
      },
      {
        userId,
        sessionId,
        severity: success ? 'info' : 'warning',
        complianceFlags: ['lgpd_relevant', 'data_processing'],
      },
    );
  }

  /**
   * Log LGPD compliance events
   */
  async logLGPDEvent(
    eventType:
      | 'consent_given'
      | 'consent_withdrawn'
      | 'data_access'
      | 'data_export'
      | 'data_deletion',
    userId: string,
    complianceData: Partial<LGPDComplianceData>,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    const securityEventType: SecurityEventType =
      eventType === 'consent_given'
        ? 'privacy_consent_given'
        : eventType === 'consent_withdrawn'
          ? 'privacy_consent_withdrawn'
          : eventType === 'data_export'
            ? 'data_export_requested'
            : eventType === 'data_deletion'
              ? 'data_deletion_requested'
              : 'data_access';

    const description = `LGPD ${eventType.replace('_', ' ')} for user ${userId}`;

    return this.logSecurityEvent(
      securityEventType,
      description,
      {
        ...metadata,
        lgpd_compliance_data: complianceData,
        event_category: 'lgpd_compliance',
      },
      {
        userId,
        severity: 'info',
        complianceFlags: [
          'lgpd_relevant',
          'data_processing',
          'consent_required',
        ],
      },
    );
  }

  /**
   * Log session management events
   */
  async logSessionEvent(
    eventType: 'created' | 'expired' | 'terminated' | 'suspicious',
    sessionId: string,
    userId?: string,
    reason?: string,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    const securityEventType: SecurityEventType =
      eventType === 'created'
        ? 'session_created'
        : eventType === 'expired'
          ? 'session_expired'
          : eventType === 'terminated'
            ? 'session_terminated'
            : 'suspicious_activity';

    const description = `Session ${eventType}${reason ? `: ${reason}` : ''}`;

    return this.logSecurityEvent(
      securityEventType,
      description,
      {
        ...metadata,
        reason,
        session_event_type: eventType,
      },
      {
        userId,
        sessionId,
        severity: eventType === 'suspicious' ? 'warning' : 'info',
        complianceFlags: ['lgpd_relevant'],
      },
    );
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    operation: 'read' | 'write' | 'delete',
    success: boolean,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    const eventType: SecurityEventType =
      operation === 'read' ? 'data_access' : 'data_modification';

    const description = `Data ${operation} ${success ? 'successful' : 'failed'} for ${resourceType}:${resourceId}`;

    return this.logSecurityEvent(
      eventType,
      description,
      {
        ...metadata,
        resource_type: resourceType,
        resource_id: resourceId,
        operation,
        success,
      },
      {
        userId,
        severity: success ? 'info' : 'warning',
        complianceFlags: ['lgpd_relevant', 'data_processing'],
      },
    );
  }

  /**
   * Query audit logs
   */
  async queryAuditLogs(query: AuditLogQuery): Promise<SecurityEvent[]> {
    const startTime = Date.now();

    try {
      const supabase = await createClient();

      let queryBuilder = supabase
        .from('security_audit_log')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (query.startDate) {
        queryBuilder = queryBuilder.gte(
          'timestamp',
          query.startDate.toISOString(),
        );
      }

      if (query.endDate) {
        queryBuilder = queryBuilder.lte(
          'timestamp',
          query.endDate.toISOString(),
        );
      }

      if (query.userId) {
        queryBuilder = queryBuilder.eq('user_id', query.userId);
      }

      if (query.sessionId) {
        queryBuilder = queryBuilder.eq('session_id', query.sessionId);
      }

      if (query.eventTypes && query.eventTypes.length > 0) {
        queryBuilder = queryBuilder.in('event_type', query.eventTypes);
      }

      if (query.severity && query.severity.length > 0) {
        queryBuilder = queryBuilder.in('severity', query.severity);
      }

      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }

      if (query.offset) {
        queryBuilder = queryBuilder.range(
          query.offset,
          query.offset + (query.limit || 100) - 1,
        );
      }

      const { data, error } = await queryBuilder;

      if (error) {
        return [];
      }

      performanceTracker.recordMetric(
        'audit_log_query',
        Date.now() - startTime,
      );
      return data || [];
    } catch (_error) {
      return [];
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    complianceFlags: ComplianceFlag[] = ['lgpd_relevant'],
  ): Promise<any> {
    const events = await this.queryAuditLogs({
      startDate,
      endDate,
      complianceFlags,
    });

    const report = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      total_events: events.length,
      events_by_type: this.groupEventsByType(events),
      events_by_severity: this.groupEventsBySeverity(events),
      compliance_summary: this.generateComplianceSummary(events),
      lgpd_specific: this.generateLGPDSummary(events),
      recommendations: this.generateRecommendations(events),
    };

    // Log report generation
    await this.logSecurityEvent(
      'compliance_check',
      'Compliance report generated',
      {
        report_period: report.period,
        total_events: report.total_events,
        compliance_flags: complianceFlags,
      },
      {
        severity: 'info',
        complianceFlags: ['lgpd_relevant'],
      },
    );

    return report;
  }

  /**
   * Private helper methods
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(eventType: SecurityEventType): SecuritySeverity {
    const criticalEvents: SecurityEventType[] = [
      'security_violation',
      'suspicious_activity',
    ];

    const warningEvents: SecurityEventType[] = [
      'authentication_failure',
      'permission_denied',
      'session_expired',
    ];

    if (criticalEvents.includes(eventType)) {
      return 'critical';
    }
    if (warningEvents.includes(eventType)) {
      return 'warning';
    }
    return 'info';
  }

  private determineComplianceFlags(
    eventType: SecurityEventType,
  ): ComplianceFlag[] {
    const flags: ComplianceFlag[] = [];

    // LGPD relevant events
    const lgpdEvents: SecurityEventType[] = [
      'authentication_success',
      'authentication_failure',
      'data_access',
      'data_modification',
      'privacy_consent_given',
      'privacy_consent_withdrawn',
      'data_export_requested',
      'data_deletion_requested',
    ];

    if (lgpdEvents.includes(eventType)) {
      flags.push('lgpd_relevant', 'data_processing');
    }

    // Consent-related events
    const consentEvents: SecurityEventType[] = [
      'privacy_consent_given',
      'privacy_consent_withdrawn',
    ];

    if (consentEvents.includes(eventType)) {
      flags.push('consent_required');
    }

    return flags;
  }

  private startBatchProcessor(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, this.flushInterval);
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const eventsToFlush = this.eventQueue.splice(0, this.batchSize);

    try {
      const supabase = await createClient();

      const { error } = await supabase.from('security_audit_log').insert(
        eventsToFlush.map((event) => ({
          event_id: event.eventId,
          event_type: event.eventType,
          severity: event.severity,
          user_id: event.userId,
          session_id: event.sessionId,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          timestamp: new Date(event.timestamp).toISOString(),
          description: event.description,
          metadata: event.metadata,
          compliance_flags: event.complianceFlags,
        })),
      );

      if (error) {
        // Re-add events to queue for retry
        this.eventQueue.unshift(...eventsToFlush);
      }
    } catch (_error) {
      // Re-add events to queue for retry
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  private groupEventsByType(events: any[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});
  }

  private groupEventsBySeverity(events: any[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {});
  }

  private generateComplianceSummary(events: any[]): any {
    const lgpdEvents = events.filter((e) =>
      e.compliance_flags?.includes('lgpd_relevant'),
    );

    return {
      total_compliance_events: lgpdEvents.length,
      data_processing_events: events.filter((e) =>
        e.compliance_flags?.includes('data_processing'),
      ).length,
      consent_events: events.filter((e) =>
        e.compliance_flags?.includes('consent_required'),
      ).length,
    };
  }

  private generateLGPDSummary(events: any[]): any {
    const lgpdEvents = events.filter((e) =>
      e.compliance_flags?.includes('lgpd_relevant'),
    );

    return {
      total_lgpd_events: lgpdEvents.length,
      consent_given: events.filter(
        (e) => e.event_type === 'privacy_consent_given',
      ).length,
      consent_withdrawn: events.filter(
        (e) => e.event_type === 'privacy_consent_withdrawn',
      ).length,
      data_exports: events.filter(
        (e) => e.event_type === 'data_export_requested',
      ).length,
      data_deletions: events.filter(
        (e) => e.event_type === 'data_deletion_requested',
      ).length,
    };
  }

  private generateRecommendations(events: any[]): string[] {
    const recommendations: string[] = [];

    const criticalEvents = events.filter((e) => e.severity === 'critical');
    if (criticalEvents.length > 0) {
      recommendations.push('Investigate critical security events immediately');
    }

    const failedAuth = events.filter(
      (e) => e.event_type === 'authentication_failure',
    );
    if (failedAuth.length > 10) {
      recommendations.push(
        'High number of authentication failures detected - consider implementing additional security measures',
      );
    }

    const suspiciousActivity = events.filter(
      (e) => e.event_type === 'suspicious_activity',
    );
    if (suspiciousActivity.length > 0) {
      recommendations.push(
        'Suspicious activity detected - review and investigate',
      );
    }

    return recommendations;
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush remaining events
    if (this.eventQueue.length > 0) {
      this.flushEvents();
    }
  }
}

export const securityAuditLogger = SecurityAuditLogger.getInstance();
