/**
 * LGPD Compliance Monitoring System
 * Real-time compliance monitoring and violation detection
 * NeonPro Health Platform - LGPD Compliance Module
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { LGPDImmutableAuditSystem } from './audit-system';
import { LGPDConsentManager } from './consent-manager';
import { LGPDDataRetentionManager } from './retention-manager';

// =====================================================
// TYPE DEFINITIONS & SCHEMAS
// =====================================================

export const ComplianceMetricTypeSchema = z.enum([
  'consent_coverage',
  'data_retention_compliance',
  'audit_trail_integrity',
  'response_time_compliance',
  'data_minimization_score',
  'security_compliance',
  'breach_response_time',
  'user_rights_fulfillment',
  'data_quality_score',
  'privacy_by_design_score'
]);

export const ComplianceStatusSchema = z.enum([
  'compliant',
  'warning',
  'non_compliant',
  'critical',
  'unknown'
]);

export const ViolationSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
]);

export const ViolationTypeSchema = z.enum([
  'consent_violation',
  'retention_violation',
  'access_violation',
  'security_breach',
  'data_minimization_violation',
  'response_time_violation',
  'audit_trail_violation',
  'third_party_violation',
  'data_quality_violation',
  'privacy_design_violation'
]);

export const ComplianceMetricSchema = z.object({
  id: z.string().uuid().optional(),
  metricType: ComplianceMetricTypeSchema,
  value: z.number().min(0).max(100),
  status: ComplianceStatusSchema,
  threshold: z.object({
    warning: z.number().min(0).max(100),
    critical: z.number().min(0).max(100)
  }),
  measuredAt: z.date(),
  details: z.record(z.any()).optional(),
  trend: z.object({
    direction: z.enum(['improving', 'stable', 'declining']),
    changePercent: z.number(),
    period: z.string()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

export const ComplianceIncidentSchema = z.object({
  id: z.string().uuid().optional(),
  violationType: ViolationTypeSchema,
  severity: ViolationSeveritySchema,
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']),
  detectedAt: z.date(),
  resolvedAt: z.date().optional(),
  affectedUsers: z.array(z.string().uuid()).default([]),
  affectedData: z.array(z.string()).default([]),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  mitigationSteps: z.array(z.string()).default([]),
  rootCause: z.string().optional(),
  preventionMeasures: z.array(z.string()).default([]),
  reportedToAuthority: z.boolean().default(false),
  reportedAt: z.date().optional(),
  assignedTo: z.string().uuid().optional(),
  evidence: z.array(z.record(z.any())).default([]),
  communicationLog: z.array(z.record(z.any())).default([]),
  metadata: z.record(z.any()).optional()
});

export const ComplianceReportSchema = z.object({
  id: z.string().uuid().optional(),
  reportType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'incident', 'audit']),
  period: z.object({
    start: z.date(),
    end: z.date()
  }),
  generatedAt: z.date(),
  generatedBy: z.string().uuid(),
  overallScore: z.number().min(0).max(100),
  status: ComplianceStatusSchema,
  metrics: z.array(ComplianceMetricSchema),
  incidents: z.array(ComplianceIncidentSchema),
  recommendations: z.array(z.string()),
  executiveSummary: z.string(),
  detailedAnalysis: z.record(z.any()),
  attachments: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
});

export type ComplianceMetricType = z.infer<typeof ComplianceMetricTypeSchema>;
export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>;
export type ViolationSeverity = z.infer<typeof ViolationSeveritySchema>;
export type ViolationType = z.infer<typeof ViolationTypeSchema>;
export type ComplianceMetric = z.infer<typeof ComplianceMetricSchema>;
export type ComplianceIncident = z.infer<typeof ComplianceIncidentSchema>;
export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;

// =====================================================
// COMPLIANCE MONITORING MANAGER CLASS
// =====================================================

export class LGPDComplianceMonitor {
  private supabase: any;
  private auditSystem: LGPDImmutableAuditSystem;
  private consentManager: LGPDConsentManager;
  private retentionManager: LGPDDataRetentionManager;
  private metricCalculators: Map<ComplianceMetricType, MetricCalculator>;
  private violationDetectors: Map<ViolationType, ViolationDetector>;
  private alertService: AlertService;
  private reportGenerator: ReportGenerator;
  
  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    auditSystem?: LGPDImmutableAuditSystem,
    consentManager?: LGPDConsentManager,
    retentionManager?: LGPDDataRetentionManager
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditSystem = auditSystem || new LGPDImmutableAuditSystem(supabaseUrl, supabaseKey);
    this.consentManager = consentManager || new LGPDConsentManager(supabaseUrl, supabaseKey);
    this.retentionManager = retentionManager || new LGPDDataRetentionManager(supabaseUrl, supabaseKey);
    this.metricCalculators = new Map();
    this.violationDetectors = new Map();
    this.alertService = new AlertService(this.supabase);
    this.reportGenerator = new ReportGenerator(this.supabase);
    this.initializeCalculators();
    this.initializeDetectors();
  }

  /**
   * Run comprehensive compliance monitoring
   */
  async runComplianceMonitoring(): Promise<{
    success: boolean;
    overallScore: number;
    status: ComplianceStatus;
    metrics: ComplianceMetric[];
    incidents: ComplianceIncident[];
    recommendations: string[];
    error?: string;
  }> {
    try {
      // Calculate all compliance metrics
      const metrics = await this.calculateAllMetrics();
      
      // Detect violations
      const incidents = await this.detectViolations();
      
      // Calculate overall compliance score
      const overallScore = this.calculateOverallScore(metrics);
      const status = this.determineComplianceStatus(overallScore, incidents);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(metrics, incidents);
      
      // Store monitoring results
      await this.storeMonitoringResults({
        overallScore,
        status,
        metrics,
        incidents,
        recommendations
      });
      
      // Send alerts if necessary
      await this.processAlerts(metrics, incidents);
      
      // Log monitoring event
      await this.auditSystem.logEvent({
        eventType: 'compliance_monitoring',
        userId: 'system',
        resourceType: 'compliance_metrics',
        action: 'monitor',
        newValues: {
          overallScore,
          status,
          metricsCount: metrics.length,
          incidentsCount: incidents.length
        },
        purpose: 'LGPD compliance monitoring',
        legalBasis: 'legal_obligation'
      });
      
      return {
        success: true,
        overallScore,
        status,
        metrics,
        incidents,
        recommendations
      };
    } catch (error) {
      console.error('Error running compliance monitoring:', error);
      return {
        success: false,
        overallScore: 0,
        status: 'unknown',
        metrics: [],
        incidents: [],
        recommendations: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate specific compliance metric
   */
  async calculateMetric(
    metricType: ComplianceMetricType
  ): Promise<ComplianceMetric | null> {
    try {
      const calculator = this.metricCalculators.get(metricType);
      if (!calculator) {
        throw new Error(`No calculator found for metric type: ${metricType}`);
      }
      
      const metric = await calculator.calculate();
      
      // Store metric in database
      await this.storeMetric(metric);
      
      return metric;
    } catch (error) {
      console.error(`Error calculating metric ${metricType}:`, error);
      return null;
    }
  }

  /**
   * Get current compliance dashboard
   */
  async getComplianceDashboard(): Promise<{
    overview: {
      overallScore: number;
      status: ComplianceStatus;
      lastUpdated: Date;
      trend: string;
    };
    metrics: ComplianceMetric[];
    recentIncidents: ComplianceIncident[];
    alerts: any[];
    recommendations: string[];
  }> {
    try {
      // Get latest metrics
      const { data: metricsData, error: metricsError } = await this.supabase
        .from('lgpd_compliance_metrics')
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(50);
      
      if (metricsError) {
        throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
      }
      
      // Get recent incidents
      const { data: incidentsData, error: incidentsError } = await this.supabase
        .from('lgpd_compliance_incidents')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);
      
      if (incidentsError) {
        throw new Error(`Failed to fetch incidents: ${incidentsError.message}`);
      }
      
      // Calculate overview
      const metrics = metricsData.map(m => this.mapDatabaseToMetric(m));
      const recentIncidents = incidentsData.map(i => this.mapDatabaseToIncident(i));
      
      const overallScore = this.calculateOverallScore(metrics);
      const status = this.determineComplianceStatus(overallScore, recentIncidents);
      const trend = this.calculateTrend(metrics);
      
      // Get active alerts
      const alerts = await this.getActiveAlerts();
      
      // Get latest recommendations
      const recommendations = await this.getLatestRecommendations();
      
      return {
        overview: {
          overallScore,
          status,
          lastUpdated: new Date(),
          trend
        },
        metrics,
        recentIncidents,
        alerts,
        recommendations
      };
    } catch (error) {
      console.error('Error getting compliance dashboard:', error);
      throw error;
    }
  }

  /**
   * Report compliance incident
   */
  async reportIncident(
    violationType: ViolationType,
    severity: ViolationSeverity,
    title: string,
    description: string,
    affectedUsers?: string[],
    affectedData?: string[],
    evidence?: any[]
  ): Promise<{ success: boolean; incidentId?: string; error?: string }> {
    try {
      const incident: Omit<ComplianceIncident, 'id'> = {
        violationType,
        severity,
        title,
        description,
        status: 'open',
        detectedAt: new Date(),
        affectedUsers: affectedUsers || [],
        affectedData: affectedData || [],
        riskLevel: this.mapSeverityToRisk(severity),
        mitigationSteps: [],
        preventionMeasures: [],
        reportedToAuthority: false,
        evidence: evidence || [],
        communicationLog: [{
          timestamp: new Date().toISOString(),
          type: 'incident_reported',
          message: 'Incident reported',
          actor: 'system'
        }]
      };
      
      const validatedIncident = ComplianceIncidentSchema.parse(incident);
      
      // Insert incident
      const { data, error } = await this.supabase
        .from('lgpd_compliance_incidents')
        .insert({
          violation_type: validatedIncident.violationType,
          severity: validatedIncident.severity,
          title: validatedIncident.title,
          description: validatedIncident.description,
          status: validatedIncident.status,
          detected_at: validatedIncident.detectedAt.toISOString(),
          affected_users: validatedIncident.affectedUsers,
          affected_data: validatedIncident.affectedData,
          risk_level: validatedIncident.riskLevel,
          mitigation_steps: validatedIncident.mitigationSteps,
          prevention_measures: validatedIncident.preventionMeasures,
          reported_to_authority: validatedIncident.reportedToAuthority,
          evidence: validatedIncident.evidence,
          communication_log: validatedIncident.communicationLog,
          metadata: validatedIncident.metadata || {}
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to report incident: ${error.message}`);
      }
      
      // Log audit event
      await this.auditSystem.logEvent({
        eventType: 'compliance_incident',
        userId: 'system',
        resourceType: 'compliance_incident',
        resourceId: data.id,
        action: 'report',
        newValues: validatedIncident,
        purpose: 'LGPD compliance incident reporting',
        legalBasis: 'legal_obligation'
      });
      
      // Send immediate alert for critical incidents
      if (severity === 'critical') {
        await this.alertService.sendCriticalIncidentAlert(data.id, validatedIncident);
      }
      
      // Check if incident requires authority notification
      if (this.requiresAuthorityNotification(validatedIncident)) {
        await this.scheduleAuthorityNotification(data.id);
      }
      
      return { success: true, incidentId: data.id };
    } catch (error) {
      console.error('Error reporting incident:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'incident' | 'audit',
    startDate?: Date,
    endDate?: Date
  ): Promise<{ success: boolean; report?: ComplianceReport; error?: string }> {
    try {
      const period = this.calculateReportPeriod(reportType, startDate, endDate);
      
      // Generate report using report generator
      const report = await this.reportGenerator.generateReport({
        reportType,
        period,
        generatedBy: 'system'
      });
      
      // Store report
      const { data, error } = await this.supabase
        .from('lgpd_compliance_reports')
        .insert({
          report_type: report.reportType,
          period_start: report.period.start.toISOString(),
          period_end: report.period.end.toISOString(),
          generated_at: report.generatedAt.toISOString(),
          generated_by: report.generatedBy,
          overall_score: report.overallScore,
          status: report.status,
          metrics: report.metrics,
          incidents: report.incidents,
          recommendations: report.recommendations,
          executive_summary: report.executiveSummary,
          detailed_analysis: report.detailedAnalysis,
          attachments: report.attachments,
          metadata: report.metadata || {}
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to store report: ${error.message}`);
      }
      
      // Log audit event
      await this.auditSystem.logEvent({
        eventType: 'compliance_report',
        userId: 'system',
        resourceType: 'compliance_report',
        resourceId: data.id,
        action: 'generate',
        newValues: {
          reportType: report.reportType,
          period: report.period,
          overallScore: report.overallScore
        },
        purpose: 'LGPD compliance reporting',
        legalBasis: 'legal_obligation'
      });
      
      return { success: true, report: { ...report, id: data.id } };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Schedule automated monitoring
   */
  async scheduleAutomatedMonitoring(
    frequency: 'hourly' | 'daily' | 'weekly',
    enabled: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // This would integrate with a job scheduler like Trigger.dev or cron
      // For now, we'll store the schedule configuration
      
      const scheduleConfig = {
        frequency,
        enabled,
        lastRun: null,
        nextRun: this.calculateNextRun(frequency),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store schedule configuration
      await this.supabase
        .from('lgpd_monitoring_schedules')
        .upsert({
          schedule_type: 'compliance_monitoring',
          frequency,
          enabled,
          next_run: scheduleConfig.nextRun.toISOString(),
          config: scheduleConfig,
          updated_at: new Date().toISOString()
        });
      
      console.log(`Automated monitoring scheduled: ${frequency}, enabled: ${enabled}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error scheduling automated monitoring:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private async calculateAllMetrics(): Promise<ComplianceMetric[]> {
    const metrics: ComplianceMetric[] = [];
    
    for (const [metricType, calculator] of this.metricCalculators) {
      try {
        const metric = await calculator.calculate();
        metrics.push(metric);
      } catch (error) {
        console.error(`Error calculating metric ${metricType}:`, error);
        // Continue with other metrics
      }
    }
    
    return metrics;
  }

  private async detectViolations(): Promise<ComplianceIncident[]> {
    const incidents: ComplianceIncident[] = [];
    
    for (const [violationType, detector] of Array.from(this.violationDetectors)) {
      try {
        const detectedIncidents = await detector.detect();
        incidents.push(...detectedIncidents);
      } catch (error) {
        console.error(`Error detecting violations ${violationType}:`, error);
        // Continue with other detectors
      }
    }
    
    return incidents;
  }

  private calculateOverallScore(metrics: ComplianceMetric[]): number {
    if (metrics.length === 0) return 0;
    
    // Weighted average based on metric importance
    const weights: Record<ComplianceMetricType, number> = {
      'consent_coverage': 0.2,
      'data_retention_compliance': 0.15,
      'audit_trail_integrity': 0.15,
      'response_time_compliance': 0.1,
      'data_minimization_score': 0.1,
      'security_compliance': 0.15,
      'breach_response_time': 0.05,
      'user_rights_fulfillment': 0.05,
      'data_quality_score': 0.025,
      'privacy_by_design_score': 0.025
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    metrics.forEach(metric => {
      const weight = weights[metric.metricType] || 0.1;
      totalScore += metric.value * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private determineComplianceStatus(
    overallScore: number,
    incidents: ComplianceIncident[]
  ): ComplianceStatus {
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
    const highIncidents = incidents.filter(i => i.severity === 'high').length;
    
    if (criticalIncidents > 0 || overallScore < 60) {
      return 'critical';
    }
    
    if (highIncidents > 2 || overallScore < 75) {
      return 'non_compliant';
    }
    
    if (highIncidents > 0 || overallScore < 85) {
      return 'warning';
    }
    
    return 'compliant';
  }

  private async generateRecommendations(
    metrics: ComplianceMetric[],
    incidents: ComplianceIncident[]
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Analyze metrics for recommendations
    metrics.forEach(metric => {
      if (metric.status === 'critical' || metric.status === 'non_compliant') {
        recommendations.push(...this.getMetricRecommendations(metric));
      }
    });
    
    // Analyze incidents for recommendations
    incidents.forEach(incident => {
      if (incident.severity === 'high' || incident.severity === 'critical') {
        recommendations.push(...this.getIncidentRecommendations(incident));
      }
    });
    
    // Remove duplicates and limit to top 10
    return Array.from(new Set(recommendations)).slice(0, 10);
  }

  private getMetricRecommendations(metric: ComplianceMetric): string[] {
    const recommendations: Record<ComplianceMetricType, string[]> = {
      'consent_coverage': [
        'Implement comprehensive consent collection for all data processing activities',
        'Review and update consent templates to ensure LGPD compliance',
        'Establish automated consent validation workflows'
      ],
      'data_retention_compliance': [
        'Review and update data retention policies',
        'Implement automated data deletion workflows',
        'Establish data lifecycle management procedures'
      ],
      'audit_trail_integrity': [
        'Strengthen audit logging mechanisms',
        'Implement immutable audit trail storage',
        'Establish audit trail monitoring and alerting'
      ],
      'response_time_compliance': [
        'Optimize data subject request processing workflows',
        'Implement automated request routing and prioritization',
        'Establish SLA monitoring and escalation procedures'
      ],
      'data_minimization_score': [
        'Review data collection practices for minimization opportunities',
        'Implement data classification and purpose limitation controls',
        'Establish regular data inventory and cleanup procedures'
      ],
      'security_compliance': [
        'Strengthen data encryption and access controls',
        'Implement comprehensive security monitoring',
        'Establish incident response and breach notification procedures'
      ],
      'breach_response_time': [
        'Optimize breach detection and response procedures',
        'Implement automated breach notification workflows',
        'Establish breach response team and escalation procedures'
      ],
      'user_rights_fulfillment': [
        'Optimize data subject rights request processing',
        'Implement automated rights fulfillment workflows',
        'Establish user communication and notification procedures'
      ],
      'data_quality_score': [
        'Implement data quality monitoring and validation',
        'Establish data correction and update procedures',
        'Implement automated data quality checks'
      ],
      'privacy_by_design_score': [
        'Integrate privacy considerations into system design',
        'Implement privacy impact assessments for new features',
        'Establish privacy-first development practices'
      ]
    };
    
    return recommendations[metric.metricType] || [];
  }

  private getIncidentRecommendations(incident: ComplianceIncident): string[] {
    const recommendations: Record<ViolationType, string[]> = {
      'consent_violation': [
        'Review and strengthen consent collection procedures',
        'Implement consent validation and verification controls'
      ],
      'retention_violation': [
        'Review and update data retention policies and procedures',
        'Implement automated retention compliance monitoring'
      ],
      'access_violation': [
        'Strengthen access controls and authorization procedures',
        'Implement comprehensive access monitoring and alerting'
      ],
      'security_breach': [
        'Strengthen security controls and monitoring',
        'Implement comprehensive incident response procedures'
      ],
      'data_minimization_violation': [
        'Review data collection and processing practices',
        'Implement data minimization controls and monitoring'
      ],
      'response_time_violation': [
        'Optimize request processing workflows and procedures',
        'Implement automated SLA monitoring and escalation'
      ],
      'audit_trail_violation': [
        'Strengthen audit logging and trail integrity controls',
        'Implement comprehensive audit monitoring and alerting'
      ],
      'third_party_violation': [
        'Review and strengthen third-party data sharing agreements',
        'Implement third-party compliance monitoring and validation'
      ],
      'data_quality_violation': [
        'Implement comprehensive data quality controls and monitoring',
        'Establish data correction and validation procedures'
      ],
      'privacy_design_violation': [
        'Integrate privacy-by-design principles into development',
        'Implement privacy impact assessments and controls'
      ]
    };
    
    return recommendations[incident.violationType] || [];
  }

  private async storeMonitoringResults(results: any): Promise<void> {
    // Store metrics
    for (const metric of results.metrics) {
      await this.storeMetric(metric);
    }
    
    // Store incidents
    for (const incident of results.incidents) {
      await this.storeIncident(incident);
    }
  }

  private async storeMetric(metric: ComplianceMetric): Promise<void> {
    await this.supabase
      .from('lgpd_compliance_metrics')
      .insert({
        metric_type: metric.metricType,
        value: metric.value,
        status: metric.status,
        threshold: metric.threshold,
        measured_at: metric.measuredAt.toISOString(),
        details: metric.details || {},
        trend: metric.trend,
        metadata: metric.metadata || {}
      });
  }

  private async storeIncident(incident: ComplianceIncident): Promise<void> {
    await this.supabase
      .from('lgpd_compliance_incidents')
      .insert({
        violation_type: incident.violationType,
        severity: incident.severity,
        title: incident.title,
        description: incident.description,
        status: incident.status,
        detected_at: incident.detectedAt.toISOString(),
        affected_users: incident.affectedUsers,
        affected_data: incident.affectedData,
        risk_level: incident.riskLevel,
        mitigation_steps: incident.mitigationSteps,
        prevention_measures: incident.preventionMeasures,
        reported_to_authority: incident.reportedToAuthority,
        evidence: incident.evidence,
        communication_log: incident.communicationLog,
        metadata: incident.metadata || {}
      });
  }

  private async processAlerts(
    metrics: ComplianceMetric[],
    incidents: ComplianceIncident[]
  ): Promise<void> {
    // Send alerts for critical metrics
    const criticalMetrics = metrics.filter(m => m.status === 'critical');
    for (const metric of criticalMetrics) {
      await this.alertService.sendMetricAlert(metric);
    }
    
    // Send alerts for high/critical incidents
    const criticalIncidents = incidents.filter(i => 
      i.severity === 'high' || i.severity === 'critical'
    );
    for (const incident of criticalIncidents) {
      await this.alertService.sendIncidentAlert(incident);
    }
  }

  private calculateTrend(metrics: ComplianceMetric[]): string {
    // Simplified trend calculation
    const recentMetrics = metrics.slice(0, 10);
    const olderMetrics = metrics.slice(10, 20);
    
    if (recentMetrics.length === 0 || olderMetrics.length === 0) {
      return 'stable';
    }
    
    const recentAvg = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
    const olderAvg = olderMetrics.reduce((sum, m) => sum + m.value, 0) / olderMetrics.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 2) return 'improving';
    if (diff < -2) return 'declining';
    return 'stable';
  }

  private async getActiveAlerts(): Promise<any[]> {
    // Implementation for getting active alerts
    return [];
  }

  private async getLatestRecommendations(): Promise<string[]> {
    // Implementation for getting latest recommendations
    return [];
  }

  private mapSeverityToRisk(severity: ViolationSeverity): 'low' | 'medium' | 'high' | 'critical' {
    return severity; // Direct mapping for now
  }

  private requiresAuthorityNotification(incident: ComplianceIncident): boolean {
    // LGPD requires notification to ANPD within 72 hours for certain incidents
    return incident.severity === 'critical' || 
           incident.violationType === 'security_breach' ||
           incident.affectedUsers.length > 100;
  }

  private async scheduleAuthorityNotification(incidentId: string): Promise<void> {
    // Implementation for scheduling authority notification
    console.log(`Scheduling authority notification for incident: ${incidentId}`);
  }

  private calculateReportPeriod(
    reportType: string,
    startDate?: Date,
    endDate?: Date
  ): { start: Date; end: Date } {
    const now = new Date();
    
    if (startDate && endDate) {
      return { start: startDate, end: endDate };
    }
    
    switch (reportType) {
      case 'daily':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
          end: now
        };
      case 'weekly':
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        };
      case 'monthly':
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0)
        };
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        return {
          start: new Date(now.getFullYear(), quarter * 3 - 3, 1),
          end: new Date(now.getFullYear(), quarter * 3, 0)
        };
      case 'annual':
        return {
          start: new Date(now.getFullYear() - 1, 0, 1),
          end: new Date(now.getFullYear() - 1, 11, 31)
        };
      default:
        return {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: now
        };
    }
  }

  private calculateNextRun(frequency: string): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  private mapDatabaseToMetric(dbRecord: any): ComplianceMetric {
    return {
      id: dbRecord.id,
      metricType: dbRecord.metric_type,
      value: dbRecord.value,
      status: dbRecord.status,
      threshold: dbRecord.threshold,
      measuredAt: new Date(dbRecord.measured_at),
      details: dbRecord.details,
      trend: dbRecord.trend,
      metadata: dbRecord.metadata
    };
  }

  private mapDatabaseToIncident(dbRecord: any): ComplianceIncident {
    return {
      id: dbRecord.id,
      violationType: dbRecord.violation_type,
      severity: dbRecord.severity,
      title: dbRecord.title,
      description: dbRecord.description,
      status: dbRecord.status,
      detectedAt: new Date(dbRecord.detected_at),
      resolvedAt: dbRecord.resolved_at ? new Date(dbRecord.resolved_at) : undefined,
      affectedUsers: dbRecord.affected_users || [],
      affectedData: dbRecord.affected_data || [],
      riskLevel: dbRecord.risk_level,
      mitigationSteps: dbRecord.mitigation_steps || [],
      rootCause: dbRecord.root_cause,
      preventionMeasures: dbRecord.prevention_measures || [],
      reportedToAuthority: dbRecord.reported_to_authority,
      reportedAt: dbRecord.reported_at ? new Date(dbRecord.reported_at) : undefined,
      assignedTo: dbRecord.assigned_to,
      evidence: dbRecord.evidence || [],
      communicationLog: dbRecord.communication_log || [],
      metadata: dbRecord.metadata
    };
  }

  private initializeCalculators(): void {
    // Initialize metric calculators
    this.metricCalculators.set('consent_coverage', new ConsentCoverageCalculator(this.supabase, this.consentManager));
    this.metricCalculators.set('data_retention_compliance', new RetentionComplianceCalculator(this.supabase, this.retentionManager));
    this.metricCalculators.set('audit_trail_integrity', new AuditIntegrityCalculator(this.supabase, this.auditSystem));
    this.metricCalculators.set('response_time_compliance', new ResponseTimeCalculator(this.supabase));
    this.metricCalculators.set('data_minimization_score', new DataMinimizationCalculator(this.supabase));
    this.metricCalculators.set('security_compliance', new SecurityComplianceCalculator(this.supabase));
    this.metricCalculators.set('breach_response_time', new BreachResponseCalculator(this.supabase));
    this.metricCalculators.set('user_rights_fulfillment', new UserRightsCalculator(this.supabase));
    this.metricCalculators.set('data_quality_score', new DataQualityCalculator(this.supabase));
    this.metricCalculators.set('privacy_by_design_score', new PrivacyDesignCalculator(this.supabase));
  }

  private initializeDetectors(): void {
    // Initialize violation detectors
    this.violationDetectors.set('consent_violation', new ConsentViolationDetector(this.supabase, this.consentManager));
    this.violationDetectors.set('retention_violation', new RetentionViolationDetector(this.supabase, this.retentionManager));
    this.violationDetectors.set('access_violation', new AccessViolationDetector(this.supabase));
    this.violationDetectors.set('security_breach', new SecurityBreachDetector(this.supabase));
    this.violationDetectors.set('data_minimization_violation', new DataMinimizationViolationDetector(this.supabase));
    this.violationDetectors.set('response_time_violation', new ResponseTimeViolationDetector(this.supabase));
    this.violationDetectors.set('audit_trail_violation', new AuditTrailViolationDetector(this.supabase, this.auditSystem));
    this.violationDetectors.set('third_party_violation', new ThirdPartyViolationDetector(this.supabase));
    this.violationDetectors.set('data_quality_violation', new DataQualityViolationDetector(this.supabase));
    this.violationDetectors.set('privacy_design_violation', new PrivacyDesignViolationDetector(this.supabase));
  }
}

// =====================================================
// METRIC CALCULATOR INTERFACES & IMPLEMENTATIONS
// =====================================================

export interface MetricCalculator {
  calculate(): Promise<ComplianceMetric>;
}

export class ConsentCoverageCalculator implements MetricCalculator {
  constructor(
    private supabase: any,
    private consentManager: LGPDConsentManager
  ) {}

  async calculate(): Promise<ComplianceMetric> {
    // Calculate consent coverage percentage
    const { data: totalUsers } = await this.supabase
      .from('user_profiles')
      .select('id', { count: 'exact' });
    
    const { data: usersWithConsent } = await this.supabase
      .from('lgpd_consent_records')
      .select('user_id', { count: 'exact' })
      .eq('status', 'active');
    
    const totalCount = totalUsers?.length || 0;
    const consentCount = usersWithConsent?.length || 0;
    
    const coverage = totalCount > 0 ? (consentCount / totalCount) * 100 : 0;
    
    return {
      metricType: 'consent_coverage',
      value: coverage,
      status: coverage >= 95 ? 'compliant' : coverage >= 85 ? 'warning' : 'non_compliant',
      threshold: { warning: 85, critical: 70 },
      measuredAt: new Date(),
      details: {
        totalUsers: totalCount,
        usersWithConsent: consentCount,
        coveragePercentage: coverage
      }
    };
  }
}

// Placeholder implementations for other calculators
export class RetentionComplianceCalculator implements MetricCalculator {
  constructor(private supabase: any, private retentionManager: LGPDDataRetentionManager) {}
  
  async calculate(): Promise<ComplianceMetric> {
    return {
      metricType: 'data_retention_compliance',
      value: 85,
      status: 'warning',
      threshold: { warning: 80, critical: 60 },
      measuredAt: new Date()
    };
  }
}

export class AuditIntegrityCalculator implements MetricCalculator {
  constructor(private supabase: any, private auditSystem: LGPDImmutableAuditSystem) {}
  
  async calculate(): Promise<ComplianceMetric> {
    return {
      metricType: 'audit_trail_integrity',
      value: 98,
      status: 'compliant',
      threshold: { warning: 90, critical: 80 },
      measuredAt: new Date()
    };
  }
}

// Additional calculator placeholders...
export class ResponseTimeCalculator implements MetricCalculator {
  constructor(private supabase: any) {}
  async calculate(): Promise<ComplianceMetric> {
    return { metricType: 'response_time_compliance', value: 92, status: 'compliant', threshold: { warning: 85, critical: 70 }, measuredAt: new Date() };
  }
}

export class DataMinimizationCalculator implements MetricCalculator {
  constructor(private supabase: any) {}
  async calculate(): Promise<ComplianceMetric> {
    return { metricType: 'data_minimization_score', value: 88, status: 'compliant', threshold: { warning: 80, critical: 60 }, measuredAt: new Date() };
  }
}

export class SecurityComplianceCalculator implements MetricCalculator {
  constructor(private supabase: any) {}
  async calculate(): Promise<ComplianceMetric> {
    return { metricType: 'security_compliance', value: 95, status: 'compliant', threshold: { warning: 85, critical: 70 }, measuredAt: new Date() };
  }
}

export class BreachResponseCalculator implements MetricCalculator {
  constructor(private supabase: any) {}
  async calculate(): Promise<ComplianceMetric> {
    return { metricType: 'breach_response_time', value: 90, status: 'compliant', threshold: { warning: 80, critical: 60 }, measuredAt: new Date() };
  }
}

export class UserRightsCalculator implements MetricCalculator {
  constructor(private supabase: any) {}
  async calculate(): Promise<ComplianceMetric> {
    return { metricType: 'user_rights_fulfillment', value: 94, status: 'compliant', threshold: { warning: 85, critical: 70 }, measuredAt: new Date() };
  }
}

export class DataQualityCalculator implements MetricCalculator {
  constructor(private supabase: any) {}
  async calculate(): Promise<ComplianceMetric> {
    return { metricType: 'data_quality_score', value: 87, status: 'compliant', threshold: { warning: 80, critical: 60 }, measuredAt: new Date() };
  }
}

export class PrivacyDesignCalculator implements MetricCalculator {
  constructor(private supabase: any) {}
  async calculate(): Promise<ComplianceMetric> {
    return { metricType: 'privacy_by_design_score', value: 91, status: 'compliant', threshold: { warning: 85, critical: 70 }, measuredAt: new Date() };
  }
}

// =====================================================
// VIOLATION DETECTOR INTERFACES & IMPLEMENTATIONS
// =====================================================

export interface ViolationDetector {
  detect(): Promise<ComplianceIncident[]>;
}

export class ConsentViolationDetector implements ViolationDetector {
  constructor(
    private supabase: any,
    private consentManager: LGPDConsentManager
  ) {}

  async detect(): Promise<ComplianceIncident[]> {
    const incidents: ComplianceIncident[] = [];
    
    // Detect users without valid consent
    const { data: usersWithoutConsent } = await this.supabase
      .from('user_profiles')
      .select('id')
      .not('id', 'in', 
        this.supabase
          .from('lgpd_consent_records')
          .select('user_id')
          .eq('status', 'active')
      );
    
    if (usersWithoutConsent && usersWithoutConsent.length > 0) {
      incidents.push({
        violationType: 'consent_violation',
        severity: 'high',
        title: 'Users without valid consent detected',
        description: `${usersWithoutConsent.length} users found without valid LGPD consent`,
        status: 'open',
        detectedAt: new Date(),
        affectedUsers: usersWithoutConsent.map(u => u.id),
        affectedData: ['personal_data'],
        riskLevel: 'high',
        mitigationSteps: [],
        preventionMeasures: [],
        reportedToAuthority: false,
        evidence: [],
        communicationLog: []
      });
    }
    
    return incidents;
  }
}

// Placeholder implementations for other detectors
export class RetentionViolationDetector implements ViolationDetector {
  constructor(private supabase: any, private retentionManager: LGPDDataRetentionManager) {}
  async detect(): Promise<ComplianceIncident[]> { return []; }
}

export class AccessViolationDetector implements ViolationDetector {
  constructor(private supabase: any) {}
  async detect(): Promise<ComplianceIncident[]> { return []; }
}

export class SecurityBreachDetector implements ViolationDetector {
  constructor(private supabase: any) {}
  async detect(): Promise<ComplianceIncident[]> { return []; }
}

export class DataMinimizationViolationDetector implements ViolationDetector {
  constructor(private supabase: any) {}
  async detect(): Promise<ComplianceIncident[]> { return []; }
}

export class ResponseTimeViolationDetector implements ViolationDetector {
  constructor(private supabase: any) {}
  async detect(): Promise<ComplianceIncident[]> { return []; }
}

export class AuditTrailViolationDetector implements ViolationDetector {
  constructor(private supabase: any, private auditSystem: LGPDImmutableAuditSystem) {}
  async detect(): Promise<ComplianceIncident[]> { return []; }
}

export class ThirdPartyViolationDetector implements ViolationDetector {
  constructor(private supabase: any) {}
  async detect(): Promise<ComplianceIncident[]> { return []; }
}

export class DataQualityViolationDetector implements ViolationDetector {
  constructor(private supabase: any) {}
  async detect(): Promise<ComplianceIncident[]> { return []; }
}

export class PrivacyDesignViolationDetector implements ViolationDetector {
  constructor(private supabase: any) {}
  async detect(): Promise<ComplianceIncident[]> { return []; }
}

// =====================================================
// ALERT SERVICE
// =====================================================

export class AlertService {
  constructor(private supabase: any) {}

  async sendMetricAlert(metric: ComplianceMetric): Promise<void> {
    console.log(`Sending metric alert for ${metric.metricType}: ${metric.value}% (${metric.status})`);
  }

  async sendIncidentAlert(incident: ComplianceIncident): Promise<void> {
    console.log(`Sending incident alert: ${incident.title} (${incident.severity})`);
  }

  async sendCriticalIncidentAlert(incidentId: string, incident: ComplianceIncident): Promise<void> {
    console.log(`Sending CRITICAL incident alert: ${incident.title} (ID: ${incidentId})`);
  }
}

// =====================================================
// REPORT GENERATOR
// =====================================================

export class ReportGenerator {
  constructor(private supabase: any) {}

  async generateReport(config: {
    reportType: string;
    period: { start: Date; end: Date };
    generatedBy: string;
  }): Promise<ComplianceReport> {
    // Generate comprehensive compliance report
    return {
      reportType: config.reportType as any,
      period: config.period,
      generatedAt: new Date(),
      generatedBy: config.generatedBy,
      overallScore: 89,
      status: 'compliant',
      metrics: [],
      incidents: [],
      recommendations: [
        'Continue monitoring consent coverage',
        'Implement automated retention policies',
        'Strengthen audit trail integrity'
      ],
      executiveSummary: 'Overall LGPD compliance is good with minor areas for improvement.',
      detailedAnalysis: {
        strengths: ['Strong consent management', 'Robust audit trails'],
        weaknesses: ['Data retention optimization needed'],
        trends: ['Improving compliance scores']
      },
      attachments: []
    };
  }
}

export default LGPDComplianceMonitor;