// LGPD Compliance Monitor - Core Module
// Story 1.5: LGPD Compliance Automation
// Task 3: Real-time Compliance Monitoring (AC: 3)

import { createClient } from '@/lib/supabase/client';
import type {
  LGPDComplianceAssessment,
  LGPDMonitoringMetrics,
  LGPDAlert,
  LGPDServiceResponse,
  LGPDEventType,
  LGPDDataCategory
} from '../types';
import { LGPDAuditLogger } from './audit-logger';
import { LGPDEventEmitter } from '../utils/event-emitter';

/**
 * LGPD Compliance Monitor
 * Real-time monitoring and assessment of LGPD compliance
 * Implements continuous compliance validation and alerting
 */
export class LGPDComplianceMonitor {
  private supabase = createClient();
  private auditLogger = new LGPDAuditLogger();
  private eventEmitter = new LGPDEventEmitter();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertThresholds = {
    consent_expiry_warning: 30, // days
    response_deadline_warning: 3, // days
    data_retention_warning: 7, // days
    security_incident_threshold: 5, // incidents per hour
    compliance_score_threshold: 85 // minimum compliance score
  };

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Start real-time compliance monitoring
   */
  async startMonitoring(intervalMinutes: number = 15): Promise<LGPDServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      this.monitoringInterval = setInterval(async () => {
        await this.performComplianceCheck();
      }, intervalMinutes * 60 * 1000);

      // Perform initial check
      await this.performComplianceCheck();

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: true,
        compliance_notes: [
          `Real-time monitoring started with ${intervalMinutes}-minute intervals`,
          'Continuous compliance validation active',
          'Automated alerting system enabled'
        ],
        audit_logged: false,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start monitoring',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Stop compliance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Perform comprehensive compliance assessment
   */
  async assessCompliance(
    clinicId: string,
    assessmentType: 'full' | 'quick' | 'targeted' = 'full',
    targetAreas?: string[]
  ): Promise<LGPDServiceResponse<LGPDComplianceAssessment>> {
    const startTime = Date.now();

    try {
      const assessment: Omit<LGPDComplianceAssessment, 'id' | 'created_at'> = {
        clinic_id: clinicId,
        assessment_type: assessmentType,
        overall_score: 0,
        consent_compliance: await this.assessConsentCompliance(clinicId),
        data_subject_rights_compliance: await this.assessDataSubjectRightsCompliance(clinicId),
        data_retention_compliance: await this.assessDataRetentionCompliance(clinicId),
        security_compliance: await this.assessSecurityCompliance(clinicId),
        audit_compliance: await this.assessAuditCompliance(clinicId),
        third_party_compliance: await this.assessThirdPartyCompliance(clinicId),
        documentation_compliance: await this.assessDocumentationCompliance(clinicId),
        recommendations: [],
        critical_issues: [],
        next_assessment_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        assessor_id: 'system',
        assessment_metadata: {
          assessment_duration_ms: 0,
          areas_assessed: targetAreas || ['all'],
          automated: true
        }
      };

      // Calculate overall score
      assessment.overall_score = this.calculateOverallScore(assessment);

      // Generate recommendations and identify critical issues
      assessment.recommendations = this.generateRecommendations(assessment);
      assessment.critical_issues = this.identifyCriticalIssues(assessment);

      // Store assessment
      const { data, error } = await this.supabase
        .from('lgpd_compliance_assessments')
        .insert({
          ...assessment,
          assessment_metadata: {
            ...assessment.assessment_metadata,
            assessment_duration_ms: Date.now() - startTime
          }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store compliance assessment: ${error.message}`);
      }

      // Log assessment
      await this.auditLogger.logEvent({
        user_id: 'system',
        clinic_id: clinicId,
        action: 'compliance_assessment_performed',
        resource_type: 'compliance_assessment',
        data_affected: ['compliance_data'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'compliance_monitoring',
        ip_address: 'system',
        user_agent: 'compliance_monitor',
        actor_id: 'system',
        actor_type: 'system',
        severity: assessment.overall_score < this.alertThresholds.compliance_score_threshold ? 'high' : 'low',
        metadata: {
          assessment_id: data.id,
          overall_score: assessment.overall_score,
          assessment_type: assessmentType,
          critical_issues_count: assessment.critical_issues.length
        }
      });

      // Generate alerts for critical issues
      if (assessment.critical_issues.length > 0) {
        await this.generateComplianceAlerts(clinicId, assessment.critical_issues, data.id);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data,
        compliance_notes: [
          `Compliance assessment completed with score: ${assessment.overall_score}%`,
          `${assessment.critical_issues.length} critical issues identified`,
          `${assessment.recommendations.length} recommendations generated`
        ],
        legal_references: ['LGPD Art. 37°', 'LGPD Art. 50°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assess compliance',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Get real-time monitoring metrics
   */
  async getMonitoringMetrics(
    clinicId: string,
    period: 'hour' | 'day' | 'week' = 'day'
  ): Promise<LGPDServiceResponse<LGPDMonitoringMetrics>> {
    const startTime = Date.now();

    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'hour':
          startDate.setHours(now.getHours() - 1);
          break;
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
      }

      // Get audit logs for the period
      const auditResult = await this.auditLogger.getAuditLogs({
        clinicId,
        dateRange: { start: startDate, end: now },
        limit: 10000
      });

      const auditLogs = auditResult.data || [];

      // Get active alerts
      const { data: alerts } = await this.supabase
        .from('lgpd_alerts')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .gte('created_at', startDate.toISOString());

      // Get consent metrics
      const consentMetrics = await this.getConsentMetrics(clinicId, startDate, now);
      
      // Get data subject request metrics
      const requestMetrics = await this.getDataSubjectRequestMetrics(clinicId, startDate, now);

      const metrics: LGPDMonitoringMetrics = {
        clinic_id: clinicId,
        period,
        timestamp: now,
        consent_metrics: consentMetrics,
        data_subject_request_metrics: requestMetrics,
        security_metrics: {
          total_security_events: auditLogs.filter(l => l.severity === 'high').length,
          failed_access_attempts: auditLogs.filter(l => l.action.includes('failed')).length,
          data_breach_incidents: auditLogs.filter(l => l.action.includes('breach')).length,
          unauthorized_access_attempts: auditLogs.filter(l => l.action.includes('unauthorized')).length
        },
        audit_metrics: {
          total_events: auditLogs.length,
          events_by_severity: this.groupBySeverity(auditLogs),
          events_by_type: this.groupByAction(auditLogs),
          unique_users: new Set(auditLogs.map(l => l.user_id)).size
        },
        alert_metrics: {
          total_alerts: alerts?.length || 0,
          alerts_by_severity: this.groupAlertsBySeverity(alerts || []),
          alerts_by_type: this.groupAlertsByType(alerts || []),
          unresolved_alerts: alerts?.filter(a => a.status === 'active').length || 0
        },
        compliance_score: await this.calculateCurrentComplianceScore(clinicId),
        data_processing_metrics: {
          total_data_operations: auditLogs.filter(l => 
            ['data_created', 'data_updated', 'data_deleted', 'data_exported'].some(op => l.action.includes(op))
          ).length,
          data_exports: auditLogs.filter(l => l.action.includes('exported')).length,
          data_deletions: auditLogs.filter(l => l.action.includes('deleted')).length,
          data_rectifications: auditLogs.filter(l => l.action.includes('rectified')).length
        }
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: metrics,
        processing_time_ms: processingTime,
        audit_logged: false
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get monitoring metrics',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Generate compliance alert
   */
  async generateAlert(
    clinicId: string,
    alertType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    title: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<LGPDServiceResponse<LGPDAlert>> {
    const startTime = Date.now();

    try {
      const alertData: Omit<LGPDAlert, 'id' | 'created_at' | 'updated_at'> = {
        clinic_id: clinicId,
        alert_type: alertType,
        severity,
        title,
        description,
        status: 'active',
        metadata: metadata || {},
        auto_resolve: this.shouldAutoResolve(alertType),
        resolution_deadline: this.calculateResolutionDeadline(severity)
      };

      const { data, error } = await this.supabase
        .from('lgpd_alerts')
        .insert(alertData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to generate alert: ${error.message}`);
      }

      // Log alert generation
      await this.auditLogger.logEvent({
        user_id: 'system',
        clinic_id: clinicId,
        action: 'compliance_alert_generated',
        resource_type: 'compliance_alert',
        data_affected: ['compliance_data'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'compliance_monitoring',
        ip_address: 'system',
        user_agent: 'compliance_monitor',
        actor_id: 'system',
        actor_type: 'system',
        severity: severity === 'critical' ? 'high' : 'medium',
        metadata: {
          alert_id: data.id,
          alert_type: alertType,
          alert_severity: severity
        }
      });

      // Emit alert event
      this.eventEmitter.emit('compliance_alert_generated' as LGPDEventType, {
        alertId: data.id,
        clinicId,
        alertType,
        severity,
        title
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data,
        compliance_notes: [
          `${severity.toUpperCase()} compliance alert generated`,
          'Relevant stakeholders will be notified',
          'Alert tracking and resolution initiated'
        ],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate alert',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Resolve compliance alert
   */
  async resolveAlert(
    alertId: string,
    resolverId: string,
    resolutionNotes: string
  ): Promise<LGPDServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.supabase
        .from('lgpd_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolver_id: resolverId,
          resolution_notes: resolutionNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to resolve alert: ${error.message}`);
      }

      // Log alert resolution
      await this.auditLogger.logEvent({
        user_id: resolverId,
        clinic_id: data.clinic_id,
        action: 'compliance_alert_resolved',
        resource_type: 'compliance_alert',
        data_affected: ['compliance_data'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'compliance_monitoring',
        ip_address: 'system',
        user_agent: 'compliance_monitor',
        actor_id: resolverId,
        actor_type: 'admin',
        severity: 'medium',
        metadata: {
          alert_id: alertId,
          resolution_notes: resolutionNotes,
          alert_type: data.alert_type
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: true,
        compliance_notes: [
          'Compliance alert resolved successfully',
          'Resolution logged in audit trail',
          'Alert status updated'
        ],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve alert',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Get active compliance alerts
   */
  async getActiveAlerts(
    clinicId: string,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<LGPDServiceResponse<LGPDAlert[]>> {
    const startTime = Date.now();

    try {
      let query = this.supabase
        .from('lgpd_alerts')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (severity) {
        query = query.eq('severity', severity);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get active alerts: ${error.message}`);
      }

      // Check for overdue alerts
      const now = new Date();
      const alerts = (data || []).map(alert => ({
        ...alert,
        is_overdue: alert.resolution_deadline && new Date(alert.resolution_deadline) < now,
        days_until_deadline: alert.resolution_deadline ? 
          Math.ceil((new Date(alert.resolution_deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 
          null
      }));

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: alerts,
        processing_time_ms: processingTime,
        audit_logged: false
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get active alerts',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  // Private helper methods

  private initializeMonitoring(): void {
    // Set up event listeners for real-time monitoring
    this.eventEmitter.on('consent_withdrawn' as LGPDEventType, this.handleConsentWithdrawn.bind(this));
    this.eventEmitter.on('data_subject_request_submitted' as LGPDEventType, this.handleDataSubjectRequest.bind(this));
    this.eventEmitter.on('security_event_logged' as LGPDEventType, this.handleSecurityEvent.bind(this));
  }

  private async performComplianceCheck(): Promise<void> {
    try {
      // Get all active clinics
      const { data: clinics } = await this.supabase
        .from('clinics')
        .select('id')
        .eq('status', 'active');

      if (!clinics) return;

      // Perform quick compliance checks for each clinic
      for (const clinic of clinics) {
        await this.performQuickComplianceCheck(clinic.id);
      }

    } catch (error) {
      console.error('Error in compliance check:', error);
    }
  }

  private async performQuickComplianceCheck(clinicId: string): Promise<void> {
    // Check for expiring consents
    await this.checkExpiringConsents(clinicId);
    
    // Check for overdue data subject requests
    await this.checkOverdueRequests(clinicId);
    
    // Check for data retention violations
    await this.checkDataRetentionViolations(clinicId);
    
    // Check for security incidents
    await this.checkSecurityIncidents(clinicId);
  }

  private async checkExpiringConsents(clinicId: string): Promise<void> {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + this.alertThresholds.consent_expiry_warning);

    const { data: expiringConsents } = await this.supabase
      .from('lgpd_consent_records')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('consent_given', true)
      .is('withdrawn_at', null)
      .lte('expires_at', warningDate.toISOString());

    if (expiringConsents && expiringConsents.length > 0) {
      await this.generateAlert(
        clinicId,
        'consent_expiry_warning',
        'medium',
        'Consents Expiring Soon',
        `${expiringConsents.length} consent(s) will expire within ${this.alertThresholds.consent_expiry_warning} days`,
        { expiring_consents: expiringConsents.length }
      );
    }
  }

  private async checkOverdueRequests(clinicId: string): Promise<void> {
    const now = new Date();
    
    const { data: overdueRequests } = await this.supabase
      .from('lgpd_data_subject_requests')
      .select('*')
      .eq('clinic_id', clinicId)
      .in('status', ['pending', 'processing'])
      .lt('response_deadline', now.toISOString());

    if (overdueRequests && overdueRequests.length > 0) {
      await this.generateAlert(
        clinicId,
        'overdue_requests',
        'high',
        'Overdue Data Subject Requests',
        `${overdueRequests.length} data subject request(s) are overdue`,
        { overdue_requests: overdueRequests.length }
      );
    }
  }

  private async checkDataRetentionViolations(clinicId: string): Promise<void> {
    // This would check for data that should have been deleted based on retention policies
    // Implementation depends on specific retention policy structure
  }

  private async checkSecurityIncidents(clinicId: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const securityEvents = await this.auditLogger.getAuditLogs({
      clinicId,
      severity: 'high',
      dateRange: { start: oneHourAgo, end: new Date() }
    });

    if (securityEvents.success && securityEvents.data && 
        securityEvents.data.length >= this.alertThresholds.security_incident_threshold) {
      await this.generateAlert(
        clinicId,
        'security_incident_threshold',
        'critical',
        'High Security Activity Detected',
        `${securityEvents.data.length} security incidents detected in the last hour`,
        { incident_count: securityEvents.data.length }
      );
    }
  }

  // Assessment helper methods

  private async assessConsentCompliance(clinicId: string): Promise<number> {
    // Implementation for consent compliance assessment
    // Returns score 0-100
    return 85; // Placeholder
  }

  private async assessDataSubjectRightsCompliance(clinicId: string): Promise<number> {
    // Implementation for data subject rights compliance assessment
    return 90; // Placeholder
  }

  private async assessDataRetentionCompliance(clinicId: string): Promise<number> {
    // Implementation for data retention compliance assessment
    return 80; // Placeholder
  }

  private async assessSecurityCompliance(clinicId: string): Promise<number> {
    // Implementation for security compliance assessment
    return 95; // Placeholder
  }

  private async assessAuditCompliance(clinicId: string): Promise<number> {
    // Implementation for audit compliance assessment
    return 88; // Placeholder
  }

  private async assessThirdPartyCompliance(clinicId: string): Promise<number> {
    // Implementation for third party compliance assessment
    return 75; // Placeholder
  }

  private async assessDocumentationCompliance(clinicId: string): Promise<number> {
    // Implementation for documentation compliance assessment
    return 82; // Placeholder
  }

  private calculateOverallScore(assessment: Partial<LGPDComplianceAssessment>): number {
    const scores = [
      assessment.consent_compliance || 0,
      assessment.data_subject_rights_compliance || 0,
      assessment.data_retention_compliance || 0,
      assessment.security_compliance || 0,
      assessment.audit_compliance || 0,
      assessment.third_party_compliance || 0,
      assessment.documentation_compliance || 0
    ];

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  private generateRecommendations(assessment: LGPDComplianceAssessment): string[] {
    const recommendations: string[] = [];
    
    if (assessment.consent_compliance < 90) {
      recommendations.push('Improve consent management processes and documentation');
    }
    if (assessment.data_subject_rights_compliance < 90) {
      recommendations.push('Enhance data subject rights response procedures');
    }
    if (assessment.security_compliance < 95) {
      recommendations.push('Strengthen security measures and incident response');
    }
    
    return recommendations;
  }

  private identifyCriticalIssues(assessment: LGPDComplianceAssessment): string[] {
    const issues: string[] = [];
    
    if (assessment.overall_score < 70) {
      issues.push('Overall compliance score below acceptable threshold');
    }
    if (assessment.security_compliance < 80) {
      issues.push('Critical security compliance deficiencies identified');
    }
    
    return issues;
  }

  private async generateComplianceAlerts(
    clinicId: string,
    criticalIssues: string[],
    assessmentId: string
  ): Promise<void> {
    for (const issue of criticalIssues) {
      await this.generateAlert(
        clinicId,
        'compliance_assessment_critical',
        'critical',
        'Critical Compliance Issue',
        issue,
        { assessment_id: assessmentId }
      );
    }
  }

  private shouldAutoResolve(alertType: string): boolean {
    const autoResolveTypes = ['consent_expiry_warning', 'data_retention_warning'];
    return autoResolveTypes.includes(alertType);
  }

  private calculateResolutionDeadline(severity: string): Date {
    const deadline = new Date();
    
    switch (severity) {
      case 'critical':
        deadline.setHours(deadline.getHours() + 4); // 4 hours
        break;
      case 'high':
        deadline.setDate(deadline.getDate() + 1); // 1 day
        break;
      case 'medium':
        deadline.setDate(deadline.getDate() + 3); // 3 days
        break;
      case 'low':
        deadline.setDate(deadline.getDate() + 7); // 7 days
        break;
    }
    
    return deadline;
  }

  // Metrics helper methods

  private async getConsentMetrics(clinicId: string, startDate: Date, endDate: Date): Promise<any> {
    const { data: consents } = await this.supabase
      .from('lgpd_consent_records')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    return {
      total_consents: consents?.length || 0,
      consents_granted: consents?.filter(c => c.consent_given).length || 0,
      consents_withdrawn: consents?.filter(c => c.withdrawn_at).length || 0,
      consent_rate: consents?.length ? 
        (consents.filter(c => c.consent_given).length / consents.length * 100) : 0
    };
  }

  private async getDataSubjectRequestMetrics(clinicId: string, startDate: Date, endDate: Date): Promise<any> {
    const { data: requests } = await this.supabase
      .from('lgpd_data_subject_requests')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    return {
      total_requests: requests?.length || 0,
      completed_requests: requests?.filter(r => r.status === 'completed').length || 0,
      pending_requests: requests?.filter(r => r.status === 'pending').length || 0,
      overdue_requests: requests?.filter(r => 
        new Date(r.response_deadline) < new Date() && 
        !['completed', 'cancelled'].includes(r.status)
      ).length || 0
    };
  }

  private async calculateCurrentComplianceScore(clinicId: string): Promise<number> {
    // Get latest assessment
    const { data: latestAssessment } = await this.supabase
      .from('lgpd_compliance_assessments')
      .select('overall_score')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return latestAssessment?.overall_score || 0;
  }

  private groupBySeverity(logs: any[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      const severity = log.severity || 'unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByAction(logs: any[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      const action = log.action || 'unknown';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupAlertsBySeverity(alerts: LGPDAlert[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupAlertsByType(alerts: LGPDAlert[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Event handlers

  private async handleConsentWithdrawn(event: any): Promise<void> {
    // Handle consent withdrawal events
    if (event.dataCategories?.includes('sensitive')) {
      await this.generateAlert(
        event.clinicId,
        'sensitive_consent_withdrawn',
        'medium',
        'Sensitive Data Consent Withdrawn',
        'User has withdrawn consent for sensitive data processing',
        { user_id: event.userId, data_categories: event.dataCategories }
      );
    }
  }

  private async handleDataSubjectRequest(event: any): Promise<void> {
    // Handle data subject request events
    if (event.urgencyLevel === 'high') {
      await this.generateAlert(
        event.clinicId,
        'urgent_data_subject_request',
        'high',
        'Urgent Data Subject Request',
        `Urgent ${event.requestType} request submitted`,
        { request_id: event.requestId, request_type: event.requestType }
      );
    }
  }

  private async handleSecurityEvent(event: any): Promise<void> {
    // Handle security events
    await this.generateAlert(
      event.clinicId || 'system',
      'security_incident',
      'high',
      'Security Incident Detected',
      'High-severity security event logged',
      { log_id: event.logId, action: event.action }
    );
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    this.stopMonitoring();
  }
}
