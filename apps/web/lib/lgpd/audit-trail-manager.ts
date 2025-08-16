/**
 * LGPD Audit Trail Manager
 * Story 1.5: LGPD Compliance Automation
 *
 * This module provides comprehensive audit trail management for LGPD compliance
 * with automated logging, monitoring, and reporting capabilities.
 */

import { createClient } from '@/app/utils/supabase/client';
import { SecurityAuditLogger } from '@/lib/auth/security-audit-logger';
import { logger } from '@/lib/logger';
import { LGPDDataType, LGPDPurpose } from './consent-automation-manager';

/**
 * LGPD Audit Event Types
 */
export enum LGPDAuditEventType {
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  DATA_DELETION = 'data_deletion',
  DATA_EXPORT = 'data_export',
  DATA_SHARING = 'data_sharing',
  CONSENT_COLLECTED = 'consent_collected',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
  CONSENT_EXPIRED = 'consent_expired',
  DATA_BREACH = 'data_breach',
  PRIVACY_VIOLATION = 'privacy_violation',
  DATA_RETENTION_APPLIED = 'data_retention_applied',
  DATA_ANONYMIZED = 'data_anonymized',
  THIRD_PARTY_SHARING = 'third_party_sharing',
  DATA_SUBJECT_REQUEST = 'data_subject_request',
  COMPLIANCE_CHECK = 'compliance_check',
}

/**
 * LGPD Audit Severity Levels
 */
export enum LGPDAuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * LGPD Audit Record Interface
 */
export type LGPDAuditRecord = {
  id: string;
  eventType: LGPDAuditEventType;
  userId?: string;
  clinicId: string;
  dataType: LGPDDataType;
  purpose: LGPDPurpose;
  severity: LGPDAuditSeverity;
  description: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  legalBasis: string;
  dataSubjectId?: string;
  thirdPartyId?: string;
  retentionPeriod?: number;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review';
  metadata?: Record<string, any>;
};

/**
 * Data Subject Request Interface
 */
export type DataSubjectRequest = {
  id: string;
  requestType:
    | 'access'
    | 'rectification'
    | 'deletion'
    | 'portability'
    | 'restriction'
    | 'objection';
  dataSubjectId: string;
  clinicId: string;
  requestDetails: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  submittedAt: Date;
  completedAt?: Date;
  responseDetails?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationMethod?: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
};

/**
 * Audit Trail Analytics
 */
export type AuditTrailAnalytics = {
  totalEvents: number;
  eventsByType: Record<LGPDAuditEventType, number>;
  eventsBySeverity: Record<LGPDAuditSeverity, number>;
  complianceRate: number;
  recentViolations: LGPDAuditRecord[];
  dataSubjectRequests: {
    total: number;
    pending: number;
    completed: number;
    averageResponseTime: number;
  };
  topDataTypes: Array<{ dataType: LGPDDataType; count: number }>;
  riskScore: number;
};

/**
 * LGPD Audit Trail Manager
 */
export class AuditTrailManager {
  private readonly supabase;
  private readonly auditLogger: SecurityAuditLogger;

  constructor() {
    this.supabase = createClient();
    this.auditLogger = new SecurityAuditLogger();
  }

  /**
   * Log LGPD audit event
   */
  async logAuditEvent(
    event: Omit<LGPDAuditRecord, 'id' | 'timestamp'>,
  ): Promise<LGPDAuditRecord> {
    try {
      const auditRecord: Partial<LGPDAuditRecord> = {
        ...event,
        timestamp: new Date(),
      };

      const { data, error } = await this.supabase
        .from('lgpd_audit_trail')
        .insert(auditRecord)
        .select()
        .single();

      if (error) {
        logger.error('Error logging LGPD audit event:', error);
        throw new Error(`Failed to log audit event: ${error.message}`);
      }

      // Also log to security audit system for critical events
      if (
        event.severity === LGPDAuditSeverity.CRITICAL ||
        event.severity === LGPDAuditSeverity.ERROR
      ) {
        await this.auditLogger.logSecurityEvent({
          userId: event.userId || 'system',
          action: event.eventType,
          resource: 'lgpd_compliance',
          details: event.details,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          severity: event.severity,
        });
      }

      logger.info(
        `LGPD audit event logged: ${event.eventType} - ${event.severity}`,
      );
      return data;
    } catch (error) {
      logger.error('Error in logAuditEvent:', error);
      throw error;
    }
  }

  /**
   * Log data access event
   */
  async logDataAccess(
    userId: string,
    clinicId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose,
    dataSubjectId: string,
    accessDetails: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAuditEvent({
      eventType: LGPDAuditEventType.DATA_ACCESS,
      userId,
      clinicId,
      dataType,
      purpose,
      severity: LGPDAuditSeverity.INFO,
      description: `Data access: ${dataType} for ${purpose}`,
      details: {
        ...accessDetails,
        accessedFields: accessDetails.fields || [],
        recordCount: accessDetails.recordCount || 1,
      },
      ipAddress,
      userAgent,
      legalBasis: this.getLegalBasisForPurpose(purpose),
      dataSubjectId,
      complianceStatus: 'compliant',
    });
  }

  /**
   * Log data modification event
   */
  async logDataModification(
    userId: string,
    clinicId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose,
    dataSubjectId: string,
    modifications: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAuditEvent({
      eventType: LGPDAuditEventType.DATA_MODIFICATION,
      userId,
      clinicId,
      dataType,
      purpose,
      severity: LGPDAuditSeverity.INFO,
      description: `Data modification: ${dataType}`,
      details: {
        modifiedFields: modifications.fields || [],
        oldValues: modifications.oldValues || {},
        newValues: modifications.newValues || {},
        changeReason: modifications.reason,
      },
      ipAddress,
      userAgent,
      legalBasis: this.getLegalBasisForPurpose(purpose),
      dataSubjectId,
      complianceStatus: 'compliant',
    });
  }

  /**
   * Log data deletion event
   */
  async logDataDeletion(
    userId: string,
    clinicId: string,
    dataType: LGPDDataType,
    dataSubjectId: string,
    deletionReason: string,
    deletionDetails: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAuditEvent({
      eventType: LGPDAuditEventType.DATA_DELETION,
      userId,
      clinicId,
      dataType,
      purpose: LGPDPurpose.LEGAL_OBLIGATION,
      severity: LGPDAuditSeverity.WARNING,
      description: `Data deletion: ${dataType} - ${deletionReason}`,
      details: {
        deletionReason,
        deletedRecords: deletionDetails.recordCount || 1,
        deletionMethod: deletionDetails.method || 'soft_delete',
        retentionPeriodExpired: deletionDetails.retentionExpired,
      },
      ipAddress,
      userAgent,
      legalBasis: 'Art. 16 - Eliminação de dados',
      dataSubjectId,
      complianceStatus: 'compliant',
    });
  }

  /**
   * Log data breach event
   */
  async logDataBreach(
    clinicId: string,
    dataType: LGPDDataType,
    breachDetails: {
      description: string;
      affectedRecords: number;
      affectedDataSubjects: string[];
      breachType:
        | 'unauthorized_access'
        | 'data_loss'
        | 'data_theft'
        | 'system_compromise';
      discoveredAt: Date;
      containedAt?: Date;
      notificationRequired: boolean;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    },
    ipAddress?: string,
  ): Promise<void> {
    await this.logAuditEvent({
      eventType: LGPDAuditEventType.DATA_BREACH,
      clinicId,
      dataType,
      purpose: LGPDPurpose.LEGAL_OBLIGATION,
      severity: LGPDAuditSeverity.CRITICAL,
      description: `Data breach: ${breachDetails.breachType} - ${breachDetails.description}`,
      details: {
        ...breachDetails,
        reportedToANPD: false,
        dataSubjectsNotified: false,
        mitigationActions: [],
      },
      ipAddress,
      legalBasis: 'Art. 48 - Comunicação de incidente',
      complianceStatus: 'non_compliant',
    });

    // Trigger immediate breach response
    await this.triggerBreachResponse(clinicId, breachDetails);
  }

  /**
   * Create data subject request
   */
  async createDataSubjectRequest(
    request: Omit<DataSubjectRequest, 'id' | 'submittedAt' | 'status'>,
  ): Promise<DataSubjectRequest> {
    try {
      const dataSubjectRequest: Partial<DataSubjectRequest> = {
        ...request,
        status: 'pending',
        submittedAt: new Date(),
      };

      const { data, error } = await this.supabase
        .from('lgpd_data_subject_requests')
        .insert(dataSubjectRequest)
        .select()
        .single();

      if (error) {
        logger.error('Error creating data subject request:', error);
        throw new Error(
          `Failed to create data subject request: ${error.message}`,
        );
      }

      // Log the request creation
      await this.logAuditEvent({
        eventType: LGPDAuditEventType.DATA_SUBJECT_REQUEST,
        clinicId: request.clinicId,
        dataType: LGPDDataType.PROFILE,
        purpose: LGPDPurpose.LEGAL_OBLIGATION,
        severity: LGPDAuditSeverity.INFO,
        description: `Data subject request: ${request.requestType}`,
        details: {
          requestType: request.requestType,
          requestId: data.id,
          priority: request.priority,
        },
        legalBasis: 'Art. 18 - Direitos do titular',
        dataSubjectId: request.dataSubjectId,
        complianceStatus: 'pending_review',
      });

      logger.info(
        `Data subject request created: ${data.id} - ${request.requestType}`,
      );
      return data;
    } catch (error) {
      logger.error('Error in createDataSubjectRequest:', error);
      throw error;
    }
  }

  /**
   * Update data subject request status
   */
  async updateDataSubjectRequestStatus(
    requestId: string,
    status: DataSubjectRequest['status'],
    responseDetails?: string,
    assignedTo?: string,
  ): Promise<boolean> {
    try {
      const updateData: Partial<DataSubjectRequest> = {
        status,
        responseDetails,
        assignedTo,
      };

      if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      const { data, error } = await this.supabase
        .from('lgpd_data_subject_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating data subject request:', error);
        throw new Error(
          `Failed to update data subject request: ${error.message}`,
        );
      }

      // Log the status update
      await this.logAuditEvent({
        eventType: LGPDAuditEventType.DATA_SUBJECT_REQUEST,
        clinicId: data.clinicId,
        dataType: LGPDDataType.PROFILE,
        purpose: LGPDPurpose.LEGAL_OBLIGATION,
        severity: LGPDAuditSeverity.INFO,
        description: `Data subject request updated: ${status}`,
        details: {
          requestId,
          newStatus: status,
          responseDetails,
          assignedTo,
        },
        legalBasis: 'Art. 18 - Direitos do titular',
        dataSubjectId: data.dataSubjectId,
        complianceStatus:
          status === 'completed' ? 'compliant' : 'pending_review',
      });

      return true;
    } catch (error) {
      logger.error('Error in updateDataSubjectRequestStatus:', error);
      throw error;
    }
  }

  /**
   * Get audit trail for specific criteria
   */
  async getAuditTrail(
    clinicId: string,
    filters?: {
      eventType?: LGPDAuditEventType;
      dataType?: LGPDDataType;
      severity?: LGPDAuditSeverity;
      userId?: string;
      dataSubjectId?: string;
      startDate?: Date;
      endDate?: Date;
      complianceStatus?: 'compliant' | 'non_compliant' | 'pending_review';
    },
    limit = 100,
    offset = 0,
  ): Promise<LGPDAuditRecord[]> {
    try {
      let query = this.supabase
        .from('lgpd_audit_trail')
        .select('*')
        .eq('clinicId', clinicId);

      if (filters) {
        if (filters.eventType) {
          query = query.eq('eventType', filters.eventType);
        }
        if (filters.dataType) {
          query = query.eq('dataType', filters.dataType);
        }
        if (filters.severity) {
          query = query.eq('severity', filters.severity);
        }
        if (filters.userId) {
          query = query.eq('userId', filters.userId);
        }
        if (filters.dataSubjectId) {
          query = query.eq('dataSubjectId', filters.dataSubjectId);
        }
        if (filters.complianceStatus) {
          query = query.eq('complianceStatus', filters.complianceStatus);
        }
        if (filters.startDate) {
          query = query.gte('timestamp', filters.startDate.toISOString());
        }
        if (filters.endDate) {
          query = query.lte('timestamp', filters.endDate.toISOString());
        }
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching audit trail:', error);
        throw new Error(`Failed to fetch audit trail: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getAuditTrail:', error);
      throw error;
    }
  }

  /**
   * Get audit trail analytics
   */
  async getAuditAnalytics(
    clinicId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditTrailAnalytics> {
    try {
      // Get audit events
      const auditEvents = await this.getAuditTrail(
        clinicId,
        { startDate, endDate },
        1000,
      );

      // Get data subject requests
      let requestQuery = this.supabase
        .from('lgpd_data_subject_requests')
        .select('*')
        .eq('clinicId', clinicId);

      if (startDate) {
        requestQuery = requestQuery.gte('submittedAt', startDate.toISOString());
      }
      if (endDate) {
        requestQuery = requestQuery.lte('submittedAt', endDate.toISOString());
      }

      const { data: requests, error: requestError } = await requestQuery;

      if (requestError) {
        logger.error('Error fetching data subject requests:', requestError);
        throw new Error(
          `Failed to fetch data subject requests: ${requestError.message}`,
        );
      }

      // Calculate analytics
      const eventsByType = {} as Record<LGPDAuditEventType, number>;
      const eventsBySeverity = {} as Record<LGPDAuditSeverity, number>;
      const dataTypeCounts = {} as Record<LGPDDataType, number>;

      // Initialize counters
      Object.values(LGPDAuditEventType).forEach(
        (type) => (eventsByType[type] = 0),
      );
      Object.values(LGPDAuditSeverity).forEach(
        (severity) => (eventsBySeverity[severity] = 0),
      );
      Object.values(LGPDDataType).forEach((type) => (dataTypeCounts[type] = 0));

      // Count events
      auditEvents.forEach((event) => {
        eventsByType[event.eventType]++;
        eventsBySeverity[event.severity]++;
        dataTypeCounts[event.dataType]++;
      });

      // Calculate compliance rate
      const compliantEvents = auditEvents.filter(
        (e) => e.complianceStatus === 'compliant',
      ).length;
      const complianceRate =
        auditEvents.length > 0
          ? (compliantEvents / auditEvents.length) * 100
          : 100;

      // Get recent violations
      const recentViolations = auditEvents
        .filter((e) => e.complianceStatus === 'non_compliant')
        .slice(0, 10);

      // Calculate data subject request metrics
      const completedRequests =
        requests?.filter((r) => r.status === 'completed') || [];
      const averageResponseTime =
        completedRequests.length > 0
          ? completedRequests.reduce((sum, req) => {
              if (req.completedAt && req.submittedAt) {
                return (
                  sum +
                  (new Date(req.completedAt).getTime() -
                    new Date(req.submittedAt).getTime())
                );
              }
              return sum;
            }, 0) /
            completedRequests.length /
            (1000 * 60 * 60 * 24) // Convert to days
          : 0;

      // Calculate risk score
      const riskScore = this.calculateRiskScore(auditEvents, requests || []);

      // Top data types
      const topDataTypes = Object.entries(dataTypeCounts)
        .map(([dataType, count]) => ({
          dataType: dataType as LGPDDataType,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalEvents: auditEvents.length,
        eventsByType,
        eventsBySeverity,
        complianceRate,
        recentViolations,
        dataSubjectRequests: {
          total: requests?.length || 0,
          pending: requests?.filter((r) => r.status === 'pending').length || 0,
          completed: completedRequests.length,
          averageResponseTime,
        },
        topDataTypes,
        riskScore,
      };
    } catch (error) {
      logger.error('Error in getAuditAnalytics:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    reportId: string;
    generatedAt: Date;
    period: { start: Date; end: Date };
    analytics: AuditTrailAnalytics;
    recommendations: string[];
    complianceScore: number;
  }> {
    try {
      const analytics = await this.getAuditAnalytics(
        clinicId,
        startDate,
        endDate,
      );
      const recommendations = this.generateComplianceRecommendations(analytics);
      const complianceScore = this.calculateComplianceScore(analytics);

      const report = {
        reportId: `lgpd-report-${clinicId}-${Date.now()}`,
        generatedAt: new Date(),
        period: { start: startDate, end: endDate },
        analytics,
        recommendations,
        complianceScore,
      };

      // Log report generation
      await this.logAuditEvent({
        eventType: LGPDAuditEventType.COMPLIANCE_CHECK,
        clinicId,
        dataType: LGPDDataType.ANALYTICS,
        purpose: LGPDPurpose.LEGAL_OBLIGATION,
        severity: LGPDAuditSeverity.INFO,
        description: 'LGPD compliance report generated',
        details: {
          reportId: report.reportId,
          complianceScore,
          period: { start: startDate, end: endDate },
        },
        legalBasis: 'Art. 50 - Relatórios de impacto',
        complianceStatus:
          complianceScore >= 80 ? 'compliant' : 'pending_review',
      });

      return report;
    } catch (error) {
      logger.error('Error in generateComplianceReport:', error);
      throw error;
    }
  }

  /**
   * Get legal basis for processing purpose
   */
  private getLegalBasisForPurpose(purpose: LGPDPurpose): string {
    const legalBasisMap = {
      [LGPDPurpose.SERVICE_PROVISION]: 'Art. 7º, V - execução de contrato',
      [LGPDPurpose.LEGAL_OBLIGATION]:
        'Art. 7º, II - cumprimento de obrigação legal',
      [LGPDPurpose.LEGITIMATE_INTEREST]: 'Art. 7º, IX - interesse legítimo',
      [LGPDPurpose.CONSENT]: 'Art. 7º, I - consentimento',
      [LGPDPurpose.VITAL_INTEREST]: 'Art. 7º, IV - proteção da vida',
      [LGPDPurpose.PUBLIC_INTEREST]: 'Art. 7º, III - interesse público',
      [LGPDPurpose.CONTRACT_PERFORMANCE]: 'Art. 7º, V - execução de contrato',
    };

    return legalBasisMap[purpose] || 'Art. 7º, I - consentimento';
  }

  /**
   * Calculate risk score based on audit events
   */
  private calculateRiskScore(
    auditEvents: LGPDAuditRecord[],
    dataSubjectRequests: DataSubjectRequest[],
  ): number {
    let riskScore = 0;

    // Base risk from non-compliant events
    const nonCompliantEvents = auditEvents.filter(
      (e) => e.complianceStatus === 'non_compliant',
    );
    riskScore += nonCompliantEvents.length * 10;

    // Risk from critical/error events
    const criticalEvents = auditEvents.filter(
      (e) =>
        e.severity === LGPDAuditSeverity.CRITICAL ||
        e.severity === LGPDAuditSeverity.ERROR,
    );
    riskScore += criticalEvents.length * 5;

    // Risk from overdue data subject requests
    const overdueRequests = dataSubjectRequests.filter((r) => {
      if (r.status === 'completed') {
        return false;
      }
      const daysSinceSubmission =
        (Date.now() - new Date(r.submittedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      return daysSinceSubmission > 15; // LGPD requires response within 15 days
    });
    riskScore += overdueRequests.length * 15;

    // Normalize to 0-100 scale
    return Math.min(100, riskScore);
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(analytics: AuditTrailAnalytics): number {
    let score = 100;

    // Deduct for non-compliance
    score -= 100 - analytics.complianceRate;

    // Deduct for high risk score
    score -= analytics.riskScore * 0.3;

    // Deduct for overdue requests
    const overdueRequestsPenalty =
      Math.max(0, analytics.dataSubjectRequests.pending - 5) * 2;
    score -= overdueRequestsPenalty;

    return Math.max(0, Math.round(score));
  }

  /**
   * Generate compliance recommendations
   */
  private generateComplianceRecommendations(
    analytics: AuditTrailAnalytics,
  ): string[] {
    const recommendations: string[] = [];

    if (analytics.complianceRate < 95) {
      recommendations.push(
        'Revisar processos de conformidade para reduzir eventos não conformes',
      );
    }

    if (analytics.riskScore > 30) {
      recommendations.push(
        'Implementar medidas adicionais de mitigação de riscos',
      );
    }

    if (analytics.dataSubjectRequests.pending > 5) {
      recommendations.push(
        'Acelerar processamento de solicitações de titulares de dados',
      );
    }

    if (analytics.dataSubjectRequests.averageResponseTime > 10) {
      recommendations.push(
        'Otimizar tempo de resposta para solicitações de titulares (meta: <10 dias)',
      );
    }

    if (analytics.eventsBySeverity[LGPDAuditSeverity.CRITICAL] > 0) {
      recommendations.push(
        'Investigar e resolver eventos críticos de segurança imediatamente',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Manter práticas atuais de conformidade LGPD');
    }

    return recommendations;
  }

  /**
   * Trigger breach response procedures
   */
  private async triggerBreachResponse(
    clinicId: string,
    breachDetails: any,
  ): Promise<void> {
    try {
      // This would integrate with incident response systems
      logger.warn(
        `Data breach response triggered for clinic ${clinicId}:`,
        breachDetails,
      );

      // Log the breach response initiation
      await this.auditLogger.logSecurityEvent({
        userId: 'system',
        action: 'breach_response_initiated',
        resource: 'lgpd_compliance',
        details: {
          clinicId,
          breachType: breachDetails.breachType,
          affectedRecords: breachDetails.affectedRecords,
          riskLevel: breachDetails.riskLevel,
        },
        severity: 'critical',
      });
    } catch (error) {
      logger.error('Error triggering breach response:', error);
    }
  }
}

// Export singleton instance
export const auditTrailManager = new AuditTrailManager();
