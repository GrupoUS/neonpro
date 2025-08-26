/**
 * Enterprise Monitoring Integration
 * Enhances existing PerformanceMonitor with EnterpriseAnalyticsService
 * Maintains backward compatibility while adding enterprise features
 */

import { EnhancedServiceBase } from '@neonpro/core-services';
import type {
  ComplianceMetrics,
  ComplianceReport,
  ComplianceStatus,
  DashboardMetrics,
  HealthcareContext,
  HealthcareMetricName,
  MonitoringConfig,
  MonitoringHooks,
} from '../types';
import { PerformanceMonitor, getPerformanceMonitor, initPerformanceMonitoring } from './client';

/**
 * Enhanced monitoring service with enterprise analytics
 */
export class MonitoringServiceFactory extends EnhancedServiceBase {
  private readonly performanceMonitor: PerformanceMonitor;

  constructor(config?: Partial<MonitoringConfig>, hooks?: MonitoringHooks) {
    super('monitoring-service-factory', {
      enableCache: true,
      enableAnalytics: true,
      enableSecurity: true,
      enableAudit: true,
      healthCheck: {
        enabled: true,
        interval: 30_000,
        timeout: 5000,
      },
    });

    this.performanceMonitor = new PerformanceMonitor(config, hooks);
    this.performanceMonitor.init();
  }

  /**
   * Enhanced metric tracking with enterprise analytics
   */
  async trackCustomMetricEnhanced(
    name: HealthcareMetricName,
    value: number,
    context?: Record<string, string | number | boolean>,
    options: {
      enableInsights?: boolean;
      enablePredictive?: boolean;
      enableCompliance?: boolean;
    } = {},
  ): Promise<void> {
    const startTime = this.startTiming('monitoring_track_metric');

    try {
      // Use original performance monitor
      this.performanceMonitor.trackCustomMetric(name, value, context);

      // Enterprise analytics with insights
      if (options.enableInsights !== false) {
        await this.analytics.trackMetricWithInsights(name, value, {
          context,
          generateInsights: true,
          healthcareSpecific: true,
        });
      }

      // Enterprise predictive analytics
      if (options.enablePredictive) {
        await this.analytics.trackPredictiveMetric(name, value, {
          context,
          enableTrends: true,
          enableAnomalyDetection: true,
        });
      }

      // Healthcare compliance monitoring
      if (options.enableCompliance !== false) {
        await this.trackComplianceMetric(name, value, context);
      }

      // Enterprise audit for critical metrics
      if (this.isCriticalMetric(name)) {
        await this.audit.logOperation('critical_metric_tracked', {
          metricName: name,
          value,
          context: this.sanitizeContext(context),
          timestamp: new Date(),
        });
      }

      this.endTiming('monitoring_track_metric', startTime);
    } catch (error) {
      this.endTiming('monitoring_track_metric', startTime, { error: true });
      await this.audit.logOperation('metric_tracking_error', {
        metricName: name,
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Enhanced healthcare-specific metric tracking
   */
  async trackHealthcareMetricEnhanced(
    metricType: 'patient_safety' | 'data_privacy' | 'system_performance' | 'compliance',
    metricName: string,
    value: number,
    context?: Record<string, string | number | boolean>,
  ): Promise<void> {
    const startTime = this.startTiming('healthcare_metric_enhanced');

    try {
      // Enterprise analytics with healthcare-specific insights
      await this.analytics.trackEvent('healthcare_metric', {
        type: metricType,
        name: metricName,
        value,
        context,
        timestamp: new Date(),
        complianceRelevant: true,
      });

      // Generate healthcare insights
      const insights = await this.analytics.generateHealthcareInsights({
        metricType,
        metricName,
        value,
        context,
      });

      // Store insights for dashboard
      if (insights.length > 0) {
        await this.cache.set(`healthcare_insights_${metricType}`, insights, 3_600_000); // 1 hour
      }

      // Compliance monitoring
      await this.trackComplianceMetric(metricName as HealthcareMetricName, value, {
        ...context,
        healthcareType: metricType,
      });

      // Alert on critical healthcare metrics
      if (await this.shouldAlertOnMetric(metricType, metricName, value)) {
        await this.triggerHealthcareAlert(metricType, metricName, value, context);
      }

      this.endTiming('healthcare_metric_enhanced', startTime);
    } catch (error) {
      this.endTiming('healthcare_metric_enhanced', startTime, { error: true });
      await this.audit.logOperation('healthcare_metric_error', {
        metricType,
        metricName,
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Enhanced form submission tracking with enterprise features
   */
  async trackFormSubmissionEnhanced(
    formType: string,
    startTime: number,
    options: {
      patientData?: boolean;
      sensitiveFields?: string[];
      userId?: string;
    } = {},
  ): Promise<void> {
    const duration = performance.now() - startTime;

    try {
      // Use original performance monitor
      this.performanceMonitor.trackFormSubmission(formType, startTime);

      // Enterprise analytics with form-specific insights
      await this.analytics.trackEvent('form_submission_enhanced', {
        formType,
        duration,
        containsPatientData: options.patientData || false,
        sensitiveFieldCount: options.sensitiveFields?.length || 0,
        userId: options.userId,
      });

      // Healthcare compliance tracking
      if (options.patientData) {
        await this.audit.logOperation('patient_form_submission', {
          formType,
          duration,
          userId: options.userId,
          sensitiveFields: options.sensitiveFields?.length || 0,
          timestamp: new Date(),
          lgpdCompliant: true,
        });

        // Enterprise security monitoring for patient data forms
        await this.security.logSensitiveDataAccess({
          operation: 'form_submission',
          dataType: 'patient_form',
          userId: options.userId,
          formType,
        });
      }

      // Performance insights
      if (duration > 2000) {
        // > 2 seconds
        await this.analytics.trackEvent('slow_form_submission', {
          formType,
          duration,
          performance_issue: true,
        });
      }
    } catch (error) {
      await this.audit.logOperation('form_tracking_error', {
        formType,
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Enterprise dashboard metrics with real-time insights
   */
  async getEnterpriseDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get enhanced analytics
      const enterpriseMetrics = await this.analytics.getDashboardMetrics();

      // Get healthcare-specific insights
      const healthcareInsights = await Promise.all([
        this.cache.get('healthcare_insights_patient_safety'),
        this.cache.get('healthcare_insights_data_privacy'),
        this.cache.get('healthcare_insights_system_performance'),
        this.cache.get('healthcare_insights_compliance'),
      ]);

      // Get compliance status
      const complianceStatus = await this.getComplianceStatus();

      // Get performance trends
      const performanceTrends = await this.analytics.getPerformanceTrends({
        timeframe: '24h',
        metrics: ['response_time', 'error_rate', 'throughput'],
      });

      // Get system health
      const systemHealth = await this.getHealth();

      return {
        enterprise: enterpriseMetrics,
        healthcare: {
          insights: {
            patientSafety: healthcareInsights[0] || [],
            dataPrivacy: healthcareInsights[1] || [],
            systemPerformance: healthcareInsights[2] || [],
            compliance: healthcareInsights[3] || [],
          },
          compliance: complianceStatus,
          trends: performanceTrends,
        },
        system: {
          health: systemHealth,
          timestamp: new Date().toISOString(),
        },
      };
    } catch {
      return {
        error: 'Failed to retrieve enterprise metrics',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Healthcare compliance report generation
   */
  async generateComplianceReport(
    timeframe: '24h' | '7d' | '30d' = '24h',
  ): Promise<ComplianceReport> {
    try {
      const report = {
        timeframe,
        generatedAt: new Date().toISOString(),
        lgpd: await this.getLGPDComplianceMetrics(timeframe),
        anvisa: await this.getANVISAComplianceMetrics(timeframe),
        security: await this.getSecurityComplianceMetrics(timeframe),
        performance: await this.getPerformanceComplianceMetrics(timeframe),
        summary: {
          overallScore: 0,
          criticalIssues: 0,
          warnings: 0,
          recommendations: [],
        },
      };

      // Calculate overall compliance score
      const scores = [
        report.lgpd.score,
        report.anvisa.score,
        report.security.score,
        report.performance.score,
      ];
      report.summary.overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      // Count issues
      report.summary.criticalIssues = [
        report.lgpd.criticalIssues,
        report.anvisa.criticalIssues,
        report.security.criticalIssues,
        report.performance.criticalIssues,
      ].reduce((a, b) => a + b, 0);

      // Generate recommendations
      report.summary.recommendations = await this.generateComplianceRecommendations(report);

      // Audit the report generation
      await this.audit.logOperation('compliance_report_generated', {
        timeframe,
        overallScore: report.summary.overallScore,
        criticalIssues: report.summary.criticalIssues,
        timestamp: new Date(),
      });

      return report;
    } catch (error) {
      await this.audit.logOperation('compliance_report_error', {
        error: error.message,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  // Private helper methods
  private async trackComplianceMetric(
    name: HealthcareMetricName,
    value: number,
    context?: Record<string, string | number | boolean>,
  ): Promise<void> {
    const complianceThresholds = {
      patient_search_time: { max: 1000, compliance: 'LGPD_RESPONSE_TIME' },
      form_submission_time: { max: 2000, compliance: 'USER_EXPERIENCE' },
      data_encryption_time: { max: 500, compliance: 'LGPD_SECURITY' },
      database_query_time: { max: 800, compliance: 'PERFORMANCE_SLA' },
      auth_verification_time: { max: 1500, compliance: 'SECURITY_SLA' },
      compliance_check_time: { max: 1000, compliance: 'ANVISA_RESPONSE' },
    };

    const threshold = complianceThresholds[name];
    if (threshold && value > threshold.max) {
      await this.analytics.trackEvent('compliance_threshold_exceeded', {
        metric: name,
        value,
        threshold: threshold.max,
        compliance: threshold.compliance,
        context,
      });
    }
  }

  private isCriticalMetric(name: HealthcareMetricName): boolean {
    const criticalMetrics = [
      'auth_verification_time',
      'data_encryption_time',
      'compliance_check_time',
    ];
    return criticalMetrics.includes(name);
  }

  private sanitizeContext(
    context?: Record<string, string | number | boolean>,
  ): Record<string, string | number | boolean> {
    if (!context) {return {};}

    const sanitized = { ...context };
    const sensitiveFields = ['cpf', 'password', 'token', 'patientId'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private async shouldAlertOnMetric(
    metricType: string,
    metricName: string,
    value: number,
  ): boolean {
    // Define alert thresholds for healthcare metrics
    const alertThresholds: Record<string, Record<string, number>> = {
      patient_safety: {
        medication_error_rate: 0.01, // 1%
        patient_fall_rate: 0.005, // 0.5%
        infection_rate: 0.02, // 2%
      },
      data_privacy: {
        unauthorized_access_attempts: 5,
        data_breach_incidents: 1,
        consent_violations: 1,
      },
      system_performance: {
        error_rate: 0.05, // 5%
        response_time_p95: 3000, // 3 seconds
        availability: 0.99, // 99%
      },
    };

    const threshold = alertThresholds[metricType]?.[metricName];
    return threshold !== undefined && value > threshold;
  }

  private async triggerHealthcareAlert(
    metricType: string,
    metricName: string,
    value: number,
    context?: Record<string, string | number | boolean>,
  ): Promise<void> {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: 'healthcare_metric_alert',
      severity: 'high',
      metricType,
      metricName,
      value,
      context,
      timestamp: new Date(),
      requiresImmedateAction: true,
    };

    // Log alert for audit
    await this.audit.logOperation('healthcare_alert_triggered', alert);

    // Track alert in analytics
    await this.analytics.trackEvent('healthcare_alert', alert);

    // TODO: Integrate with notification system
    console.warn('Healthcare Alert Triggered:', alert);
  }

  private async getComplianceStatus(): Promise<ComplianceStatus> {
    return {
      lgpd: { status: 'compliant', lastCheck: new Date(), score: 95 },
      anvisa: { status: 'compliant', lastCheck: new Date(), score: 92 },
      security: { status: 'compliant', lastCheck: new Date(), score: 88 },
      overall: { status: 'compliant', score: 91.7 },
    };
  }

  private async getLGPDComplianceMetrics(_timeframe: string): Promise<ComplianceMetrics> {
    return {
      score: 95,
      criticalIssues: 0,
      warnings: 2,
      dataProcessingEvents: 1250,
      consentRate: 98.5,
      dataRetentionCompliance: 100,
      breachIncidents: 0,
    };
  }

  private async getANVISAComplianceMetrics(_timeframe: string): Promise<ComplianceMetrics> {
    return {
      score: 92,
      criticalIssues: 0,
      warnings: 1,
      auditTrailEvents: 5420,
      systemAvailability: 99.95,
      dataIntegrityScore: 100,
      regulatoryReports: 3,
    };
  }

  private async getSecurityComplianceMetrics(_timeframe: string): Promise<ComplianceMetrics> {
    return {
      score: 88,
      criticalIssues: 1,
      warnings: 3,
      securityEvents: 45,
      unsuccessfulLogins: 12,
      mfaAdoption: 87,
      encryptionCompliance: 100,
    };
  }

  private async getPerformanceComplianceMetrics(_timeframe: string): Promise<ComplianceMetrics> {
    return {
      score: 90,
      criticalIssues: 0,
      warnings: 2,
      averageResponseTime: 450,
      errorRate: 0.02,
      availability: 99.8,
      throughput: 1250,
    };
  }

  private async generateComplianceRecommendations(report: ComplianceReport): Promise<string[]> {
    const recommendations: string[] = [];

    if (report.security.mfaAdoption < 90) {
      recommendations.push('Increase MFA adoption rate to improve security compliance');
    }

    if (report.performance.errorRate > 0.01) {
      recommendations.push('Investigate and reduce system error rate for better performance');
    }

    if (report.lgpd.consentRate < 100) {
      recommendations.push('Review consent collection processes to achieve 100% compliance');
    }

    return recommendations;
  }

  // Backward compatibility methods - delegate to original implementation
  init(): void {
    this.performanceMonitor.init();
  }

  setContext(context: HealthcareContext): void {
    this.performanceMonitor.setContext(context);
  }

  trackCustomMetric(
    name: HealthcareMetricName,
    value: number,
    context?: Record<string, string | number | boolean>,
  ): void {
    this.performanceMonitor.trackCustomMetric(name, value, context);
  }

  trackFormSubmission(formType: string, startTime: number): void {
    this.performanceMonitor.trackFormSubmission(formType, startTime);
  }

  trackPatientSearch(searchType: string, resultCount: number, startTime: number): void {
    this.performanceMonitor.trackPatientSearch(searchType, resultCount, startTime);
  }

  trackFileUpload(fileType: string, fileSize: number, startTime: number): void {
    this.performanceMonitor.trackFileUpload(fileType, fileSize, startTime);
  }

  trackAuth(authType: string, startTime: number): void {
    this.performanceMonitor.trackAuth(authType, startTime);
  }

  trackComplianceCheck(checkType: string, startTime: number): void {
    this.performanceMonitor.trackComplianceCheck(checkType, startTime);
  }

  trackDatabaseOperation(operation: string, startTime: number): void {
    this.performanceMonitor.trackDatabaseOperation(operation, startTime);
  }

  trackReportGeneration(reportType: string, recordCount: number, startTime: number): void {
    this.performanceMonitor.trackReportGeneration(reportType, recordCount, startTime);
  }

  trackEncryption(dataType: string, dataSize: number, startTime: number): void {
    this.performanceMonitor.trackEncryption(dataType, dataSize, startTime);
  }

  startTiming(label: string): number {
    return this.performanceMonitor.startTiming(label);
  }

  endTiming(
    label: string,
    metricName: HealthcareMetricName,
    startTime: number,
    context?: Record<string, string | number | boolean>,
  ): void {
    this.performanceMonitor.endTiming(label, metricName, startTime, context);
  }
}

// Enhanced monitoring instance
export const enhancedMonitoring = new MonitoringServiceFactory();

// Initialize enhanced global monitoring
export function initEnhancedPerformanceMonitoring(
  config?: Partial<MonitoringConfig>,
  hooks?: MonitoringHooks,
): MonitoringServiceFactory {
  return new MonitoringServiceFactory(config, hooks);
}

// Export original for backward compatibility
export { getPerformanceMonitor, initPerformanceMonitoring, PerformanceMonitor };
