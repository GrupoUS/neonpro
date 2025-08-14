/**
 * LGPD Compliance System - Main Integration Module
 * Story 1.5: LGPD Compliance Automation
 * 
 * This module provides a unified interface for all LGPD compliance functionality,
 * integrating consent management, audit trails, and data retention policies.
 */

import {
  consentAutomationManager,
  LGPDDataType,
  LGPDPurpose,
  ConsentRecord,
  ConsentAnalytics,
  ConsentCollectionRequest,
  ConsentWithdrawalRequest
} from './consent-automation-manager';
import {
  auditTrailManager,
  LGPDAuditEventType,
  LGPDAuditSeverity,
  LGPDAuditRecord,
  AuditTrailAnalytics,
  DataSubjectRequest,
  DataSubjectRequestType,
  DataSubjectRequestStatus
} from './audit-trail-manager';
import {
  dataRetentionManager,
  DataRetentionPolicy,
  RetentionAnalytics,
  DataRetentionRecord
} from './data-retention-manager';

/**
 * LGPD Compliance Configuration
 */
export interface LGPDComplianceConfig {
  clinicId: string;
  enableAutomaticCleanup: boolean;
  consentExpirationDays: number;
  auditRetentionDays: number;
  dataRetentionDays: number;
  notificationSettings: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    webhookUrl?: string;
  };
  complianceThresholds: {
    minimumConsentRate: number;
    maximumRiskScore: number;
    auditComplianceRate: number;
  };
}

/**
 * Comprehensive LGPD Compliance Status
 */
export interface LGPDComplianceStatus {
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  consentCompliance: {
    score: number;
    activeConsents: number;
    expiredConsents: number;
    withdrawnConsents: number;
    complianceRate: number;
  };
  auditCompliance: {
    score: number;
    recentViolations: number;
    averageResponseTime: number;
    complianceRate: number;
  };
  retentionCompliance: {
    score: number;
    expiredRecords: number;
    expiringSoonRecords: number;
    complianceRate: number;
  };
  recommendations: string[];
  alerts: LGPDAlert[];
}

/**
 * LGPD Alert Types
 */
export interface LGPDAlert {
  id: string;
  type: 'CONSENT_EXPIRING' | 'DATA_BREACH' | 'COMPLIANCE_VIOLATION' | 'RETENTION_EXPIRED' | 'REQUEST_OVERDUE';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  title: string;
  description: string;
  actionRequired: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Data Subject Rights Request
 */
export interface DataSubjectRightsRequest {
  type: DataSubjectRequestType;
  subjectId: string;
  dataTypes: LGPDDataType[];
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  legalBasis?: string;
  metadata?: Record<string, any>;
}

/**
 * LGPD Compliance Report
 */
export interface LGPDComplianceReport {
  reportId: string;
  clinicId: string;
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  complianceStatus: LGPDComplianceStatus;
  consentAnalytics: ConsentAnalytics;
  auditAnalytics: AuditTrailAnalytics;
  retentionAnalytics: RetentionAnalytics;
  violations: LGPDAuditRecord[];
  recommendations: string[];
  executiveSummary: string;
}

/**
 * Main LGPD Compliance System Class
 */
export class LGPDComplianceSystem {
  private config: LGPDComplianceConfig;
  private alerts: LGPDAlert[] = [];

  constructor(config: LGPDComplianceConfig) {
    this.config = config;
  }

  /**
   * Get comprehensive compliance status
   */
  async getComplianceStatus(startDate?: Date, endDate?: Date): Promise<LGPDComplianceStatus> {
    try {
      // Get analytics from all managers
      const [consentAnalytics, auditAnalytics, retentionAnalytics] = await Promise.all([
        consentAutomationManager.getConsentAnalytics(this.config.clinicId, startDate, endDate),
        auditTrailManager.getAuditAnalytics(this.config.clinicId, startDate, endDate),
        dataRetentionManager.getRetentionAnalytics(this.config.clinicId, startDate, endDate)
      ]);

      // Calculate consent compliance
      const totalConsents = consentAnalytics.totalConsents;
      const activeConsents = consentAnalytics.activeConsents;
      const consentComplianceRate = totalConsents > 0 ? (activeConsents / totalConsents) * 100 : 100;
      const consentScore = Math.min(100, consentComplianceRate * 1.2); // Bonus for high compliance

      // Calculate audit compliance
      const auditComplianceRate = auditAnalytics.complianceRate;
      const auditScore = Math.max(0, auditComplianceRate - (auditAnalytics.recentViolations.length * 10));

      // Calculate retention compliance
      const retentionComplianceRate = retentionAnalytics.retentionCompliance;
      const retentionScore = Math.max(0, retentionComplianceRate - (retentionAnalytics.expiredRecords * 5));

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        (consentScore * 0.4) + (auditScore * 0.4) + (retentionScore * 0.2)
      );

      // Determine risk level
      const riskLevel = this.calculateRiskLevel(overallScore, auditAnalytics.riskScore);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        consentAnalytics,
        auditAnalytics,
        retentionAnalytics
      );

      // Get current alerts
      const alerts = await this.getActiveAlerts();

      return {
        overallScore,
        riskLevel,
        consentCompliance: {
          score: Math.round(consentScore),
          activeConsents: consentAnalytics.activeConsents,
          expiredConsents: consentAnalytics.expiredConsents,
          withdrawnConsents: consentAnalytics.withdrawnConsents,
          complianceRate: Math.round(consentComplianceRate)
        },
        auditCompliance: {
          score: Math.round(auditScore),
          recentViolations: auditAnalytics.recentViolations.length,
          averageResponseTime: auditAnalytics.dataSubjectRequests.averageResponseTime,
          complianceRate: Math.round(auditComplianceRate)
        },
        retentionCompliance: {
          score: Math.round(retentionScore),
          expiredRecords: retentionAnalytics.expiredRecords,
          expiringSoonRecords: retentionAnalytics.expiringSoonRecords,
          complianceRate: Math.round(retentionComplianceRate)
        },
        recommendations,
        alerts
      };
    } catch (error) {
      console.error('Error getting compliance status:', error);
      throw new Error('Failed to get compliance status');
    }
  }

  /**
   * Process data subject rights request
   */
  async processDataSubjectRequest(request: DataSubjectRightsRequest): Promise<string> {
    try {
      // Log the request in audit trail
      await auditTrailManager.logAuditEvent({
        clinicId: this.config.clinicId,
        eventType: LGPDAuditEventType.DATA_SUBJECT_REQUEST,
        severity: request.urgency === 'HIGH' ? LGPDAuditSeverity.WARNING : LGPDAuditSeverity.INFO,
        dataType: request.dataTypes[0] || LGPDDataType.PERSONAL_DATA,
        description: `Data subject request: ${request.type} - ${request.description}`,
        userId: request.subjectId,
        metadata: {
          requestType: request.type,
          dataTypes: request.dataTypes,
          urgency: request.urgency,
          legalBasis: request.legalBasis
        }
      });

      // Create the request
      const requestId = await auditTrailManager.createDataSubjectRequest({
        clinicId: this.config.clinicId,
        subjectId: request.subjectId,
        requestType: request.type,
        description: request.description,
        urgency: request.urgency,
        metadata: request.metadata
      });

      // Create alert for high urgency requests
      if (request.urgency === 'HIGH') {
        await this.createAlert({
          type: 'REQUEST_OVERDUE',
          severity: 'WARNING',
          title: 'Solicitação de Alta Urgência',
          description: `Nova solicitação de ${request.type} com alta urgência requer atenção imediata`,
          actionRequired: true,
          metadata: { requestId, subjectId: request.subjectId }
        });
      }

      return requestId;
    } catch (error) {
      console.error('Error processing data subject request:', error);
      throw new Error('Failed to process data subject request');
    }
  }

  /**
   * Collect consent with full LGPD compliance
   */
  async collectConsent(request: ConsentCollectionRequest): Promise<string> {
    try {
      // Collect the consent
      const consentId = await consentAutomationManager.collectConsent(request);

      // Log in audit trail
      await auditTrailManager.logAuditEvent({
        clinicId: this.config.clinicId,
        eventType: LGPDAuditEventType.CONSENT_COLLECTED,
        severity: LGPDAuditSeverity.INFO,
        dataType: request.dataTypes[0],
        description: `Consent collected for ${request.dataTypes.join(', ')}`,
        userId: request.userId,
        metadata: {
          consentId,
          dataTypes: request.dataTypes,
          purposes: request.purposes,
          version: request.version
        }
      });

      // Register data for retention tracking
      for (const dataType of request.dataTypes) {
        await dataRetentionManager.registerDataForTracking({
          clinicId: this.config.clinicId,
          dataType,
          dataId: request.userId,
          collectedAt: new Date(),
          metadata: {
            consentId,
            source: 'consent_collection'
          }
        });
      }

      return consentId;
    } catch (error) {
      console.error('Error collecting consent:', error);
      throw new Error('Failed to collect consent');
    }
  }

  /**
   * Withdraw consent with full compliance
   */
  async withdrawConsent(request: ConsentWithdrawalRequest): Promise<void> {
    try {
      // Withdraw the consent
      await consentAutomationManager.withdrawConsent(request);

      // Log in audit trail
      await auditTrailManager.logAuditEvent({
        clinicId: this.config.clinicId,
        eventType: LGPDAuditEventType.CONSENT_WITHDRAWN,
        severity: LGPDAuditSeverity.WARNING,
        dataType: LGPDDataType.PERSONAL_DATA,
        description: `Consent withdrawn: ${request.reason || 'No reason provided'}`,
        userId: request.userId,
        metadata: {
          consentId: request.consentId,
          reason: request.reason,
          withdrawnAt: new Date()
        }
      });

      // Process data deletion if required
      if (request.deleteData) {
        await this.processDataDeletion(request.userId, request.dataTypes || []);
      }
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw new Error('Failed to withdraw consent');
    }
  }

  /**
   * Run automated compliance checks
   */
  async runComplianceChecks(): Promise<LGPDAlert[]> {
    try {
      const alerts: LGPDAlert[] = [];

      // Check for expiring consents
      const expiringConsents = await consentAutomationManager.getExpiringConsents(
        this.config.clinicId,
        30 // 30 days warning
      );

      if (expiringConsents.length > 0) {
        alerts.push({
          id: `consent-expiring-${Date.now()}`,
          type: 'CONSENT_EXPIRING',
          severity: 'WARNING',
          title: 'Consentimentos Expirando',
          description: `${expiringConsents.length} consentimento(s) expirando nos próximos 30 dias`,
          actionRequired: true,
          createdAt: new Date(),
          metadata: { count: expiringConsents.length }
        });
      }

      // Check for expired data retention
      const retentionAnalytics = await dataRetentionManager.getRetentionAnalytics(this.config.clinicId);
      if (retentionAnalytics.expiredRecords > 0) {
        alerts.push({
          id: `retention-expired-${Date.now()}`,
          type: 'RETENTION_EXPIRED',
          severity: 'ERROR',
          title: 'Dados com Retenção Expirada',
          description: `${retentionAnalytics.expiredRecords} registro(s) com período de retenção expirado`,
          actionRequired: true,
          createdAt: new Date(),
          metadata: { count: retentionAnalytics.expiredRecords }
        });
      }

      // Check for compliance violations
      const auditAnalytics = await auditTrailManager.getAuditAnalytics(this.config.clinicId);
      if (auditAnalytics.recentViolations.length > 0) {
        alerts.push({
          id: `violations-detected-${Date.now()}`,
          type: 'COMPLIANCE_VIOLATION',
          severity: 'CRITICAL',
          title: 'Violações de Conformidade Detectadas',
          description: `${auditAnalytics.recentViolations.length} violação(ões) de conformidade detectada(s)`,
          actionRequired: true,
          createdAt: new Date(),
          metadata: { violations: auditAnalytics.recentViolations }
        });
      }

      // Check for overdue requests
      const overdueRequests = auditAnalytics.dataSubjectRequests.pending;
      if (overdueRequests > 5) { // Threshold for overdue requests
        alerts.push({
          id: `requests-overdue-${Date.now()}`,
          type: 'REQUEST_OVERDUE',
          severity: 'WARNING',
          title: 'Solicitações em Atraso',
          description: `${overdueRequests} solicitação(ões) de titular pendente(s)`,
          actionRequired: true,
          createdAt: new Date(),
          metadata: { count: overdueRequests }
        });
      }

      // Store alerts
      for (const alert of alerts) {
        await this.createAlert(alert);
      }

      return alerts;
    } catch (error) {
      console.error('Error running compliance checks:', error);
      throw new Error('Failed to run compliance checks');
    }
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<LGPDComplianceReport> {
    try {
      const reportId = `lgpd-report-${Date.now()}`;
      
      // Get comprehensive status and analytics
      const [complianceStatus, consentAnalytics, auditAnalytics, retentionAnalytics] = await Promise.all([
        this.getComplianceStatus(startDate, endDate),
        consentAutomationManager.getConsentAnalytics(this.config.clinicId, startDate, endDate),
        auditTrailManager.getAuditAnalytics(this.config.clinicId, startDate, endDate),
        dataRetentionManager.getRetentionAnalytics(this.config.clinicId, startDate, endDate)
      ]);

      // Get violations
      const violations = await auditTrailManager.getAuditTrail(
        this.config.clinicId,
        {
          severity: LGPDAuditSeverity.ERROR,
          startDate,
          endDate
        },
        100
      );

      // Generate executive summary
      const executiveSummary = this.generateExecutiveSummary(
        complianceStatus,
        consentAnalytics,
        auditAnalytics,
        retentionAnalytics
      );

      return {
        reportId,
        clinicId: this.config.clinicId,
        generatedAt: new Date(),
        period: { startDate, endDate },
        complianceStatus,
        consentAnalytics,
        auditAnalytics,
        retentionAnalytics,
        violations,
        recommendations: complianceStatus.recommendations,
        executiveSummary
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw new Error('Failed to generate compliance report');
    }
  }

  /**
   * Automated cleanup of expired data
   */
  async runAutomatedCleanup(): Promise<{ processed: number; deleted: number; anonymized: number }> {
    try {
      if (!this.config.enableAutomaticCleanup) {
        throw new Error('Automated cleanup is disabled');
      }

      // Process expired data retention
      const result = await dataRetentionManager.processExpiredData(this.config.clinicId);

      // Clean up expired consents
      await consentAutomationManager.cleanupExpiredConsents(this.config.clinicId);

      // Log cleanup activity
      await auditTrailManager.logAuditEvent({
        clinicId: this.config.clinicId,
        eventType: LGPDAuditEventType.DATA_DELETION,
        severity: LGPDAuditSeverity.INFO,
        dataType: LGPDDataType.PERSONAL_DATA,
        description: `Automated cleanup completed: ${result.processed} processed, ${result.deleted} deleted, ${result.anonymized} anonymized`,
        metadata: result
      });

      return result;
    } catch (error) {
      console.error('Error running automated cleanup:', error);
      throw new Error('Failed to run automated cleanup');
    }
  }

  /**
   * Private helper methods
   */

  private calculateRiskLevel(overallScore: number, auditRiskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const combinedRisk = (100 - overallScore) + auditRiskScore;
    
    if (combinedRisk <= 20) return 'LOW';
    if (combinedRisk <= 50) return 'MEDIUM';
    if (combinedRisk <= 80) return 'HIGH';
    return 'CRITICAL';
  }

  private generateRecommendations(
    consentAnalytics: ConsentAnalytics,
    auditAnalytics: AuditTrailAnalytics,
    retentionAnalytics: RetentionAnalytics
  ): string[] {
    const recommendations: string[] = [];

    // Consent recommendations
    if (consentAnalytics.expiredConsents > consentAnalytics.activeConsents * 0.1) {
      recommendations.push('Renovar consentimentos expirados para manter conformidade');
    }

    if (consentAnalytics.withdrawnConsents > consentAnalytics.totalConsents * 0.2) {
      recommendations.push('Revisar processos de coleta de consentimento para reduzir retiradas');
    }

    // Audit recommendations
    if (auditAnalytics.recentViolations.length > 0) {
      recommendations.push('Investigar e corrigir violações de conformidade identificadas');
    }

    if (auditAnalytics.dataSubjectRequests.averageResponseTime > 15) {
      recommendations.push('Otimizar processo de resposta a solicitações de titulares (meta: 15 dias)');
    }

    // Retention recommendations
    if (retentionAnalytics.expiredRecords > 0) {
      recommendations.push('Processar dados com período de retenção expirado');
    }

    if (retentionAnalytics.expiringSoonRecords > retentionAnalytics.activeRecords * 0.1) {
      recommendations.push('Preparar para expiração de dados nos próximos 30 dias');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Manter monitoramento contínuo da conformidade LGPD');
    }

    return recommendations;
  }

  private generateExecutiveSummary(
    complianceStatus: LGPDComplianceStatus,
    consentAnalytics: ConsentAnalytics,
    auditAnalytics: AuditTrailAnalytics,
    retentionAnalytics: RetentionAnalytics
  ): string {
    const riskText = {
      'LOW': 'baixo',
      'MEDIUM': 'médio',
      'HIGH': 'alto',
      'CRITICAL': 'crítico'
    }[complianceStatus.riskLevel];

    return `
Resumo Executivo - Conformidade LGPD

A clínica apresenta um score geral de conformidade de ${complianceStatus.overallScore}% com nível de risco ${riskText}.

Consentimentos: ${consentAnalytics.activeConsents} ativos de ${consentAnalytics.totalConsents} total (${Math.round((consentAnalytics.activeConsents / consentAnalytics.totalConsents) * 100)}% de conformidade).

Auditoria: ${auditAnalytics.recentViolations.length} violação(ões) recente(s) identificada(s), com tempo médio de resposta de ${Math.round(auditAnalytics.dataSubjectRequests.averageResponseTime)} dias para solicitações.

Retenção: ${retentionAnalytics.expiredRecords} registro(s) com período expirado, ${retentionAnalytics.expiringSoonRecords} expirando em breve.

Recomendações principais: ${complianceStatus.recommendations.slice(0, 3).join('; ')}.
    `.trim();
  }

  private async createAlert(alertData: Omit<LGPDAlert, 'id' | 'createdAt'>): Promise<void> {
    const alert: LGPDAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      ...alertData
    };

    this.alerts.push(alert);

    // Log alert in audit trail
    await auditTrailManager.logAuditEvent({
      clinicId: this.config.clinicId,
      eventType: LGPDAuditEventType.DATA_BREACH,
      severity: alert.severity as LGPDAuditSeverity,
      dataType: LGPDDataType.PERSONAL_DATA,
      description: `LGPD Alert: ${alert.title} - ${alert.description}`,
      metadata: {
        alertId: alert.id,
        alertType: alert.type,
        actionRequired: alert.actionRequired
      }
    });
  }

  private async getActiveAlerts(): Promise<LGPDAlert[]> {
    return this.alerts.filter(alert => !alert.resolvedAt);
  }

  private async processDataDeletion(userId: string, dataTypes: LGPDDataType[]): Promise<void> {
    // Log data deletion
    await auditTrailManager.logAuditEvent({
      clinicId: this.config.clinicId,
      eventType: LGPDAuditEventType.DATA_DELETION,
      severity: LGPDAuditSeverity.WARNING,
      dataType: dataTypes[0] || LGPDDataType.PERSONAL_DATA,
      description: `Data deletion requested for user ${userId}`,
      userId,
      metadata: {
        dataTypes,
        reason: 'consent_withdrawal',
        deletedAt: new Date()
      }
    });

    // Here you would implement actual data deletion logic
    // This is a placeholder for the actual implementation
    console.log(`Processing data deletion for user ${userId}, data types: ${dataTypes.join(', ')}`);
  }
}

/**
 * Default LGPD Compliance Configuration
 */
export const defaultLGPDConfig: Omit<LGPDComplianceConfig, 'clinicId'> = {
  enableAutomaticCleanup: true,
  consentExpirationDays: 365,
  auditRetentionDays: 2555, // 7 years
  dataRetentionDays: 1825, // 5 years
  notificationSettings: {
    emailEnabled: true,
    smsEnabled: false
  },
  complianceThresholds: {
    minimumConsentRate: 80,
    maximumRiskScore: 30,
    auditComplianceRate: 95
  }
};

/**
 * Create LGPD Compliance System instance
 */
export function createLGPDComplianceSystem(clinicId: string, config?: Partial<LGPDComplianceConfig>): LGPDComplianceSystem {
  const fullConfig: LGPDComplianceConfig = {
    clinicId,
    ...defaultLGPDConfig,
    ...config
  };

  return new LGPDComplianceSystem(fullConfig);
}

/**
 * Export singleton instance for default clinic
 */
export const lgpdComplianceSystem = createLGPDComplianceSystem('default-clinic');

// Export all types and enums for external use
export {
  LGPDDataType,
  LGPDPurpose,
  LGPDAuditEventType,
  LGPDAuditSeverity,
  DataSubjectRequestType,
  DataSubjectRequestStatus
};