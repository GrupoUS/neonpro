// Healthcare Compliance Metrics Service
// Comprehensive metrics system for LGPD, CFM, ANVISA compliance tracking
// Note: Keep PII out of labels and logs

import { createAdminClient } from '../clients/supabase';

export type Timer = { start: bigint };

// Healthcare-specific metric types
export interface HealthcareMetric {
  id: string;
  timestamp: Date;
  type: HealthcareMetricType;
  value: number;
  metadata: Record<string, any>;
  clinicId?: string;
  userId?: string;
  complianceFlags: {
    lgpd_compliant: boolean;
    cfm_validated: boolean;
    anvisa_compliant: boolean;
    rls_enforced: boolean;
  };
}

export enum HealthcareMetricType {
  // LGPD Compliance Metrics
  LGPD_CONSENT_VALIDATION = 'lgpd_consent_validation',
  LGPD_DATA_ACCESS = 'lgpd_data_access',
  LGPD_DATA_RETENTION = 'lgpd_data_retention',
  LGPD_COMPLIANCE_SCORE = 'lgpd_compliance_score',

  // CFM Compliance Metrics
  CFM_CREDENTIAL_VALIDATION = 'cfm_credential_validation',
  CFM_PROFESSIONAL_ACCESS = 'cfm_professional_access',
  CFM_VALIDATION_SUCCESS_RATE = 'cfm_validation_success_rate',

  // ANVISA Compliance Metrics
  ANVISA_PROCEDURE_COMPLIANCE = 'anvisa_procedure_compliance',
  ANVISA_SAFETY_PROTOCOL = 'anvisa_safety_protocol',
  ANVISA_ADVERSE_EVENT = 'anvisa_adverse_event',

  // Patient Safety Metrics
  PATIENT_DATA_ACCESS = 'patient_data_access',
  PATIENT_CONSENT_STATUS = 'patient_consent_status',
  EMERGENCY_ACCESS = 'emergency_access',

  // Audit Trail Metrics
  AUDIT_LOG_INTEGRITY = 'audit_log_integrity',
  AUDIT_COMPLETENESS = 'audit_completeness',
  COMPLIANCE_VIOLATION = 'compliance_violation',

  // Performance Metrics
  API_RESPONSE_TIME = 'api_response_time',
  DATABASE_QUERY_TIME = 'database_query_time',
  SYSTEM_AVAILABILITY = 'system_availability',
}

export interface ComplianceKPI {
  id: string;
  name: string;
  type: HealthcareMetricType;
  target: number;
  direction: 'higher-better' | 'lower-better';
  unit: string;
  description: string;
  complianceLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface MetricAggregation {
  type: HealthcareMetricType;
  period: 'hour' | 'day' | 'week' | 'month';
  value: number;
  count: number;
  min: number;
  max: number;
  avg: number;
  complianceRate: number;
  timestamp: Date;
}

export class HealthcareMetricsService {
  private supabase;
  private kpis: Map<string, ComplianceKPI> = new Map();

  constructor() {
    this.supabase = createAdminClient();
    this.initializeHealthcareKPIs();
  }

  private initializeHealthcareKPIs() {
    const defaultKPIs: ComplianceKPI[] = [
      {
        id: 'lgpd_compliance_rate',
        name: 'LGPD Compliance Rate',
        type: HealthcareMetricType.LGPD_COMPLIANCE_SCORE,
        target: 95,
        direction: 'higher-better',
        unit: '%',
        description: 'Percentage of operations compliant with LGPD requirements',
        complianceLevel: 'critical',
      },
      {
        id: 'cfm_validation_success',
        name: 'CFM Validation Success Rate',
        type: HealthcareMetricType.CFM_VALIDATION_SUCCESS_RATE,
        target: 98,
        direction: 'higher-better',
        unit: '%',
        description: 'Success rate of CFM professional credential validations',
        complianceLevel: 'critical',
      },
      {
        id: 'anvisa_compliance_rate',
        name: 'ANVISA Procedure Compliance',
        type: HealthcareMetricType.ANVISA_PROCEDURE_COMPLIANCE,
        target: 100,
        direction: 'higher-better',
        unit: '%',
        description: 'Compliance rate with ANVISA safety protocols',
        complianceLevel: 'critical',
      },
      {
        id: 'emergency_access_rate',
        name: 'Emergency Access Rate',
        type: HealthcareMetricType.EMERGENCY_ACCESS,
        target: 5,
        direction: 'lower-better',
        unit: '%',
        description: 'Percentage of data access through emergency protocols',
        complianceLevel: 'high',
      },
      {
        id: 'audit_integrity_score',
        name: 'Audit Log Integrity Score',
        type: HealthcareMetricType.AUDIT_LOG_INTEGRITY,
        target: 100,
        direction: 'higher-better',
        unit: '%',
        description: 'Integrity score of audit log chain validation',
        complianceLevel: 'critical',
      },
    ];

    defaultKPIs.forEach(kpi => this.kpis.set(kpi.id, kpi));
  }

  /**
   * Record a healthcare compliance metric
   */
  async recordMetric(
    type: HealthcareMetricType,
    value: number,
    metadata: Record<string, any> = {},
    context: {
      clinicId?: string;
      userId?: string;
      complianceFlags?: Partial<HealthcareMetric['complianceFlags']>;
    } = {},
  ): Promise<{ success: boolean; metricId?: string; error?: string }> {
    try {
      const metric: HealthcareMetric = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type,
        value,
        metadata,
        clinicId: context.clinicId,
        userId: context.userId,
        complianceFlags: {
          lgpd_compliant: context.complianceFlags?.lgpd_compliant ?? true,
          cfm_validated: context.complianceFlags?.cfm_validated ?? true,
          anvisa_compliant: context.complianceFlags?.anvisa_compliant ?? true,
          rls_enforced: context.complianceFlags?.rls_enforced ?? true,
        },
      };

      // Store in database
      const { data, error } = await this.supabase
        .from('healthcare_metrics')
        .insert({
          id: metric.id,
          timestamp: metric.timestamp.toISOString(),
          type: metric.type,
          value: metric.value,
          metadata: metric.metadata,
          clinic_id: metric.clinicId,
          user_id: metric.userId,
          compliance_flags: metric.complianceFlags,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing healthcare metric:', error);
        // Fallback to console logging
        this.logMetricToConsole(metric);
        return { success: false, error: 'Failed to store metric in database' };
      }

      return { success: true, metricId: data.id };
    } catch (error) {
      console.error('Error recording healthcare metric:', error);
      return { success: false, error: 'Internal metric recording error' };
    }
  }

  /**
   * Get compliance KPI status
   */
  async getKPIStatus(
    kpiId: string,
    period: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<{
    success: boolean;
    kpi?: ComplianceKPI;
    currentValue?: number;
    complianceStatus?: 'compliant' | 'warning' | 'violation';
    trend?: 'improving' | 'stable' | 'declining';
    error?: string;
  }> {
    try {
      const kpi = this.kpis.get(kpiId);
      if (!kpi) {
        return { success: false, error: 'KPI not found' };
      }

      const aggregation = await this.getMetricAggregation(kpi.type, period);
      if (!aggregation.success || !aggregation.data) {
        return { success: false, error: 'Failed to get metric aggregation' };
      }

      const currentValue = aggregation.data.avg;
      const complianceStatus = this.evaluateCompliance(currentValue, kpi);

      // Calculate trend (simplified - compare with previous period)
      const previousPeriod = await this.getMetricAggregation(
        kpi.type,
        period,
        1,
      );
      let trend: 'improving' | 'stable' | 'declining' = 'stable';

      if (previousPeriod.success && previousPeriod.data) {
        const previousValue = previousPeriod.data.avg;
        const improvement = kpi.direction === 'higher-better'
          ? currentValue > previousValue
          : currentValue < previousValue;

        if (Math.abs(currentValue - previousValue) > kpi.target * 0.05) {
          // 5% threshold
          trend = improvement ? 'improving' : 'declining';
        }
      }

      return {
        success: true,
        kpi,
        currentValue,
        complianceStatus,
        trend,
      };
    } catch (error) {
      console.error('Error getting KPI status:', error);
      return { success: false, error: 'Internal KPI status error' };
    }
  }

  /**
   * Get metric aggregation for a specific period
   */
  async getMetricAggregation(
    type: HealthcareMetricType,
    period: 'hour' | 'day' | 'week' | 'month',
    periodsBack: number = 0,
  ): Promise<{
    success: boolean;
    data?: MetricAggregation;
    error?: string;
  }> {
    try {
      const now = new Date();
      const periodMs = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };

      const endTime = new Date(now.getTime() - periodsBack * periodMs[period]);
      const startTime = new Date(endTime.getTime() - periodMs[period]);

      const { data, error } = await this.supabase
        .from('healthcare_metrics')
        .select('value, compliance_flags')
        .eq('type', type)
        .gte('timestamp', startTime.toISOString())
        .lt('timestamp', endTime.toISOString());

      if (error) {
        console.error('Error querying metrics:', error);
        return { success: false, error: 'Failed to query metrics' };
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          data: {
            type,
            period,
            value: 0,
            count: 0,
            min: 0,
            max: 0,
            avg: 0,
            complianceRate: 0,
            timestamp: endTime,
          },
        };
      }

      const values = data.map(d => d.value);
      const compliantCount = data.filter(
        d =>
          d.compliance_flags.lgpd_compliant
          && d.compliance_flags.cfm_validated
          && d.compliance_flags.anvisa_compliant,
      ).length;

      const aggregation: MetricAggregation = {
        type,
        period,
        value: values.reduce((sum, v) => sum + v, 0),
        count: data.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        complianceRate: (compliantCount / data.length) * 100,
        timestamp: endTime,
      };

      return { success: true, data: aggregation };
    } catch (error) {
      console.error('Error in getMetricAggregation:', error);
      return { success: false, error: 'Internal aggregation error' };
    }
  }

  /**
   * Generate compliance dashboard data
   */
  async getComplianceDashboard(clinicId?: string): Promise<{
    success: boolean;
    dashboard?: {
      kpis: Array<{
        kpi: ComplianceKPI;
        currentValue: number;
        complianceStatus: 'compliant' | 'warning' | 'violation';
        trend: 'improving' | 'stable' | 'declining';
      }>;
      overallScore: number;
      criticalViolations: number;
      recentAlerts: Array<{
        type: HealthcareMetricType;
        message: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        timestamp: Date;
      }>;
    };
    error?: string;
  }> {
    try {
      const kpiStatuses = [];
      let totalScore = 0;
      let criticalViolations = 0;

      // Process each KPI using forEach to avoid iteration issues
      for (const kpiId of this.kpis.keys()) {
        const kpi = this.kpis.get(kpiId);
        if (!kpi) continue;

        const status = await this.getKPIStatus(kpiId);
        if (status.success && status.currentValue !== undefined) {
          const kpiData = {
            kpi,
            currentValue: status.currentValue,
            complianceStatus: status.complianceStatus || 'violation',
            trend: status.trend || 'stable',
          };

          kpiStatuses.push(kpiData);

          // Calculate weighted score
          const weight = kpi.complianceLevel === 'critical'
            ? 3
            : kpi.complianceLevel === 'high'
            ? 2
            : 1;
          const kpiScore = this.calculateKPIScore(status.currentValue, kpi);
          totalScore += kpiScore * weight;

          if (
            status.complianceStatus === 'violation'
            && kpi.complianceLevel === 'critical'
          ) {
            criticalViolations++;
          }
        }
      }

      const overallScore = kpiStatuses.length > 0 ? totalScore / kpiStatuses.length : 0;

      // Get recent alerts (simplified - would be more sophisticated in production)
      const recentAlerts = await this.getRecentAlerts(clinicId);

      return {
        success: true,
        dashboard: {
          kpis: kpiStatuses,
          overallScore,
          criticalViolations,
          recentAlerts: recentAlerts.success ? recentAlerts.alerts! : [],
        },
      };
    } catch (error) {
      console.error('Error generating compliance dashboard:', error);
      return { success: false, error: 'Internal dashboard generation error' };
    }
  }

  // Helper methods

  private evaluateCompliance(
    value: number,
    kpi: ComplianceKPI,
  ): 'compliant' | 'warning' | 'violation' {
    const target = kpi.target;
    const warningThreshold = target * 0.9; // 10% tolerance for warning

    if (kpi.direction === 'higher-better') {
      if (value >= target) return 'compliant';
      if (value >= warningThreshold) return 'warning';
      return 'violation';
    } else {
      if (value <= target) return 'compliant';
      if (value <= target * 1.1) return 'warning'; // 10% over target
      return 'violation';
    }
  }

  private calculateKPIScore(value: number, kpi: ComplianceKPI): number {
    const target = kpi.target;

    if (kpi.direction === 'higher-better') {
      return Math.min(100, (value / target) * 100);
    } else {
      return Math.min(100, (target / Math.max(value, 0.1)) * 100);
    }
  }

  private async getRecentAlerts(clinicId?: string) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      let query = this.supabase
        .from('healthcare_metrics')
        .select('type, metadata, timestamp, compliance_flags')
        .gte('timestamp', oneDayAgo.toISOString())
        .or(
          'compliance_flags->lgpd_compliant.eq.false,compliance_flags->cfm_validated.eq.false,compliance_flags->anvisa_compliant.eq.false',
        )
        .order('timestamp', { ascending: false })
        .limit(10);

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: 'Failed to get recent alerts' };
      }

      const alerts = data.map(record => ({
        type: record.type as HealthcareMetricType,
        message: this.generateAlertMessage(record),
        severity: this.determineSeverity(record) as
          | 'critical'
          | 'high'
          | 'medium'
          | 'low',
        timestamp: new Date(record.timestamp),
      }));

      return { success: true, alerts };
    } catch (error) {
      console.error('Failed to aggregate alerts:', error);
      return { success: false, error: 'Internal alerts error' };
    }
  }

  private generateAlertMessage(record: any): string {
    const flags = record.compliance_flags;
    const violations = [];

    if (!flags.lgpd_compliant) violations.push('LGPD');
    if (!flags.cfm_validated) violations.push('CFM');
    if (!flags.anvisa_compliant) violations.push('ANVISA');

    return `Compliance violation detected: ${violations.join(', ')} - ${record.type}`;
  }

  private determineSeverity(record: any): string {
    const flags = record.compliance_flags;

    if (!flags.lgpd_compliant || !flags.anvisa_compliant) return 'critical';
    if (!flags.cfm_validated) return 'high';
    return 'medium';
  }

  private logMetricToConsole(metric: HealthcareMetric) {
    try {
      console.log(
        JSON.stringify({
          type: 'healthcare_metrics',
          metric_type: metric.type,
          value: metric.value,
          compliance_flags: metric.complianceFlags,
          timestamp: metric.timestamp.toISOString(),
        }),
      );
    } catch {
      // noop
    }
  }

  // Legacy compatibility methods
  startTimer(): Timer {
    return { start: process.hrtime.bigint() };
  }

  endTimerMs(t: Timer): number {
    const ns = process.hrtime.bigint() - t.start;
    return Number(ns / BigInt(1000000));
  }

  logMetric(event: Record<string, unknown>) {
    try {
      console.log(JSON.stringify({ type: 'metrics', ...event }));
    } catch {
      // noop
    }
  }
}

// Export singleton instance
export const healthcareMetrics = new HealthcareMetricsService();

// Legacy exports for backward compatibility
export function startTimer(): Timer {
  return { start: process.hrtime.bigint() };
}

export function endTimerMs(t: Timer): number {
  const ns = process.hrtime.bigint() - t.start;
  return Number(ns / BigInt(1000000));
}

export function logMetric(event: Record<string, unknown>) {
  try {
    console.log(JSON.stringify({ type: 'metrics', ...event }));
  } catch {
    // noop
  }
}
