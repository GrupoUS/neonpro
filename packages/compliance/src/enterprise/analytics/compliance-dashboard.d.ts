/**
 * Compliance Dashboard Service
 * Real-time constitutional compliance monitoring dashboard for healthcare regulatory oversight
 * Compliance: LGPD + ANVISA + CFM + Constitutional Healthcare + ≥9.9/10 Standards
 */
import { z } from 'zod';
declare const ComplianceDashboardConfigSchema: z.ZodObject<
  {
    refresh_interval_ms: z.ZodNumber;
    alert_thresholds: z.ZodObject<
      {
        critical_compliance_score: z.ZodNumber;
        warning_compliance_score: z.ZodNumber;
        privacy_budget_warning: z.ZodNumber;
        audit_trail_gap_hours: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        critical_compliance_score: number;
        warning_compliance_score: number;
        privacy_budget_warning: number;
        audit_trail_gap_hours: number;
      },
      {
        critical_compliance_score: number;
        warning_compliance_score: number;
        privacy_budget_warning: number;
        audit_trail_gap_hours: number;
      }
    >;
    real_time_monitoring: z.ZodDefault<z.ZodBoolean>;
    constitutional_validation: z.ZodDefault<z.ZodBoolean>;
    lgpd_tracking_enabled: z.ZodDefault<z.ZodBoolean>;
    anvisa_tracking_enabled: z.ZodDefault<z.ZodBoolean>;
    cfm_tracking_enabled: z.ZodDefault<z.ZodBoolean>;
    automated_reporting: z.ZodDefault<z.ZodBoolean>;
  },
  'strip',
  z.ZodTypeAny,
  {
    refresh_interval_ms: number;
    alert_thresholds: {
      critical_compliance_score: number;
      warning_compliance_score: number;
      privacy_budget_warning: number;
      audit_trail_gap_hours: number;
    };
    real_time_monitoring: boolean;
    constitutional_validation: boolean;
    lgpd_tracking_enabled: boolean;
    anvisa_tracking_enabled: boolean;
    cfm_tracking_enabled: boolean;
    automated_reporting: boolean;
  },
  {
    refresh_interval_ms: number;
    alert_thresholds: {
      critical_compliance_score: number;
      warning_compliance_score: number;
      privacy_budget_warning: number;
      audit_trail_gap_hours: number;
    };
    real_time_monitoring?: boolean | undefined;
    constitutional_validation?: boolean | undefined;
    lgpd_tracking_enabled?: boolean | undefined;
    anvisa_tracking_enabled?: boolean | undefined;
    cfm_tracking_enabled?: boolean | undefined;
    automated_reporting?: boolean | undefined;
  }
>;
declare const ComplianceDashboardMetricsSchema: z.ZodObject<
  {
    overall_compliance_score: z.ZodNumber;
    lgpd_compliance_score: z.ZodNumber;
    anvisa_compliance_score: z.ZodNumber;
    cfm_compliance_score: z.ZodNumber;
    constitutional_compliance_score: z.ZodNumber;
    privacy_metrics: z.ZodObject<
      {
        privacy_budget_utilization: z.ZodNumber;
        active_anonymization_processes: z.ZodNumber;
        privacy_violations_count: z.ZodNumber;
        data_subject_requests_pending: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        privacy_budget_utilization: number;
        active_anonymization_processes: number;
        privacy_violations_count: number;
        data_subject_requests_pending: number;
      },
      {
        privacy_budget_utilization: number;
        active_anonymization_processes: number;
        privacy_violations_count: number;
        data_subject_requests_pending: number;
      }
    >;
    security_metrics: z.ZodObject<
      {
        failed_authentication_attempts: z.ZodNumber;
        unauthorized_access_attempts: z.ZodNumber;
        data_breach_incidents: z.ZodNumber;
        encryption_coverage_percentage: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        failed_authentication_attempts: number;
        unauthorized_access_attempts: number;
        data_breach_incidents: number;
        encryption_coverage_percentage: number;
      },
      {
        failed_authentication_attempts: number;
        unauthorized_access_attempts: number;
        data_breach_incidents: number;
        encryption_coverage_percentage: number;
      }
    >;
    operational_metrics: z.ZodObject<
      {
        system_uptime_percentage: z.ZodNumber;
        response_time_p95_ms: z.ZodNumber;
        error_rate_percentage: z.ZodNumber;
        concurrent_users: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        system_uptime_percentage: number;
        response_time_p95_ms: number;
        error_rate_percentage: number;
        concurrent_users: number;
      },
      {
        system_uptime_percentage: number;
        response_time_p95_ms: number;
        error_rate_percentage: number;
        concurrent_users: number;
      }
    >;
    last_updated: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    overall_compliance_score: number;
    lgpd_compliance_score: number;
    anvisa_compliance_score: number;
    cfm_compliance_score: number;
    constitutional_compliance_score: number;
    privacy_metrics: {
      privacy_budget_utilization: number;
      active_anonymization_processes: number;
      privacy_violations_count: number;
      data_subject_requests_pending: number;
    };
    security_metrics: {
      failed_authentication_attempts: number;
      unauthorized_access_attempts: number;
      data_breach_incidents: number;
      encryption_coverage_percentage: number;
    };
    operational_metrics: {
      system_uptime_percentage: number;
      response_time_p95_ms: number;
      error_rate_percentage: number;
      concurrent_users: number;
    };
    last_updated: string;
  },
  {
    overall_compliance_score: number;
    lgpd_compliance_score: number;
    anvisa_compliance_score: number;
    cfm_compliance_score: number;
    constitutional_compliance_score: number;
    privacy_metrics: {
      privacy_budget_utilization: number;
      active_anonymization_processes: number;
      privacy_violations_count: number;
      data_subject_requests_pending: number;
    };
    security_metrics: {
      failed_authentication_attempts: number;
      unauthorized_access_attempts: number;
      data_breach_incidents: number;
      encryption_coverage_percentage: number;
    };
    operational_metrics: {
      system_uptime_percentage: number;
      response_time_p95_ms: number;
      error_rate_percentage: number;
      concurrent_users: number;
    };
    last_updated: string;
  }
>;
declare const ComplianceAlertSchema: z.ZodObject<
  {
    alert_id: z.ZodString;
    alert_type: z.ZodEnum<['critical', 'warning', 'info']>;
    category: z.ZodEnum<
      [
        'lgpd',
        'anvisa',
        'cfm',
        'constitutional',
        'privacy',
        'security',
        'operational',
      ]
    >;
    title: z.ZodString;
    description: z.ZodString;
    severity_score: z.ZodNumber;
    compliance_impact: z.ZodObject<
      {
        affects_patient_privacy: z.ZodBoolean;
        affects_regulatory_compliance: z.ZodBoolean;
        affects_constitutional_rights: z.ZodBoolean;
        affects_medical_accuracy: z.ZodBoolean;
      },
      'strip',
      z.ZodTypeAny,
      {
        affects_patient_privacy: boolean;
        affects_regulatory_compliance: boolean;
        affects_constitutional_rights: boolean;
        affects_medical_accuracy: boolean;
      },
      {
        affects_patient_privacy: boolean;
        affects_regulatory_compliance: boolean;
        affects_constitutional_rights: boolean;
        affects_medical_accuracy: boolean;
      }
    >;
    resolution_required: z.ZodBoolean;
    estimated_resolution_time: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
    resolved_at: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    alert_id: string;
    alert_type: 'critical' | 'warning' | 'info';
    category:
      | 'lgpd'
      | 'anvisa'
      | 'cfm'
      | 'constitutional'
      | 'privacy'
      | 'security'
      | 'operational';
    title: string;
    description: string;
    severity_score: number;
    compliance_impact: {
      affects_patient_privacy: boolean;
      affects_regulatory_compliance: boolean;
      affects_constitutional_rights: boolean;
      affects_medical_accuracy: boolean;
    };
    resolution_required: boolean;
    created_at: string;
    estimated_resolution_time?: string | undefined;
    resolved_at?: string | undefined;
  },
  {
    alert_id: string;
    alert_type: 'critical' | 'warning' | 'info';
    category:
      | 'lgpd'
      | 'anvisa'
      | 'cfm'
      | 'constitutional'
      | 'privacy'
      | 'security'
      | 'operational';
    title: string;
    description: string;
    severity_score: number;
    compliance_impact: {
      affects_patient_privacy: boolean;
      affects_regulatory_compliance: boolean;
      affects_constitutional_rights: boolean;
      affects_medical_accuracy: boolean;
    };
    resolution_required: boolean;
    created_at: string;
    estimated_resolution_time?: string | undefined;
    resolved_at?: string | undefined;
  }
>;
declare const ComplianceDashboardReportSchema: z.ZodObject<
  {
    report_id: z.ZodString;
    report_type: z.ZodEnum<
      ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'incident']
    >;
    generated_at: z.ZodString;
    reporting_period: z.ZodObject<
      {
        start_date: z.ZodString;
        end_date: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        start_date: string;
        end_date: string;
      },
      {
        start_date: string;
        end_date: string;
      }
    >;
    executive_summary: z.ZodObject<
      {
        overall_compliance_rating: z.ZodEnum<
          ['excellent', 'good', 'fair', 'poor', 'critical']
        >;
        key_achievements: z.ZodArray<z.ZodString, 'many'>;
        critical_issues: z.ZodArray<z.ZodString, 'many'>;
        recommendations: z.ZodArray<z.ZodString, 'many'>;
      },
      'strip',
      z.ZodTypeAny,
      {
        overall_compliance_rating:
          | 'critical'
          | 'excellent'
          | 'good'
          | 'fair'
          | 'poor';
        key_achievements: string[];
        critical_issues: string[];
        recommendations: string[];
      },
      {
        overall_compliance_rating:
          | 'critical'
          | 'excellent'
          | 'good'
          | 'fair'
          | 'poor';
        key_achievements: string[];
        critical_issues: string[];
        recommendations: string[];
      }
    >;
    detailed_metrics: z.ZodRecord<z.ZodString, z.ZodAny>;
    constitutional_certification: z.ZodObject<
      {
        privacy_officer_review: z.ZodBoolean;
        regulatory_compliance_verified: z.ZodBoolean;
        constitutional_standards_met: z.ZodBoolean;
        audit_trail_complete: z.ZodBoolean;
      },
      'strip',
      z.ZodTypeAny,
      {
        privacy_officer_review: boolean;
        regulatory_compliance_verified: boolean;
        constitutional_standards_met: boolean;
        audit_trail_complete: boolean;
      },
      {
        privacy_officer_review: boolean;
        regulatory_compliance_verified: boolean;
        constitutional_standards_met: boolean;
        audit_trail_complete: boolean;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    report_id: string;
    report_type:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'annual'
      | 'incident';
    generated_at: string;
    reporting_period: {
      start_date: string;
      end_date: string;
    };
    executive_summary: {
      overall_compliance_rating:
        | 'critical'
        | 'excellent'
        | 'good'
        | 'fair'
        | 'poor';
      key_achievements: string[];
      critical_issues: string[];
      recommendations: string[];
    };
    detailed_metrics: Record<string, any>;
    constitutional_certification: {
      privacy_officer_review: boolean;
      regulatory_compliance_verified: boolean;
      constitutional_standards_met: boolean;
      audit_trail_complete: boolean;
    };
  },
  {
    report_id: string;
    report_type:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'annual'
      | 'incident';
    generated_at: string;
    reporting_period: {
      start_date: string;
      end_date: string;
    };
    executive_summary: {
      overall_compliance_rating:
        | 'critical'
        | 'excellent'
        | 'good'
        | 'fair'
        | 'poor';
      key_achievements: string[];
      critical_issues: string[];
      recommendations: string[];
    };
    detailed_metrics: Record<string, any>;
    constitutional_certification: {
      privacy_officer_review: boolean;
      regulatory_compliance_verified: boolean;
      constitutional_standards_met: boolean;
      audit_trail_complete: boolean;
    };
  }
>;
export type ComplianceDashboardConfig = z.infer<
  typeof ComplianceDashboardConfigSchema
>;
export type ComplianceDashboardMetrics = z.infer<
  typeof ComplianceDashboardMetricsSchema
>;
export type ComplianceAlert = z.infer<typeof ComplianceAlertSchema>;
export type ComplianceDashboardReport = z.infer<
  typeof ComplianceDashboardReportSchema
>;
export type ComplianceDashboardAudit = {
  audit_id: string;
  dashboard_action: string;
  metrics_snapshot: ComplianceDashboardMetrics;
  alerts_generated: ComplianceAlert[];
  constitutional_validation: boolean;
  privacy_impact_assessment: Record<string, any>;
  created_at: string;
  created_by: string;
};
/**
 * Compliance Dashboard Service
 * Real-time constitutional compliance monitoring with regulatory oversight
 */
export declare class ComplianceDashboardService {
  private readonly config;
  private currentMetrics;
  private readonly activeAlerts;
  private readonly auditTrail;
  private monitoringInterval;
  constructor(config: ComplianceDashboardConfig);
  /**
   * Start real-time compliance monitoring dashboard
   */
  startMonitoring(): Promise<{
    success: boolean;
    dashboard_url: string;
    initial_metrics: ComplianceDashboardMetrics;
  }>;
  /**
   * Stop compliance monitoring dashboard
   */
  stopMonitoring(): Promise<{
    success: boolean;
    final_report: ComplianceDashboardReport;
  }>;
  /**
   * Collect comprehensive compliance metrics
   */
  collectComplianceMetrics(): Promise<ComplianceDashboardMetrics>;
  /**
   * Perform real-time compliance check and alert generation
   */
  private performComplianceCheck;
  /**
   * Check for compliance violations and generate alerts
   */
  private checkComplianceViolations;
  /**
   * Generate comprehensive compliance report
   */
  generateComplianceReport(
    reportType:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'annual'
      | 'incident',
    options?: {
      reason?: string;
      include_active_alerts?: boolean;
      include_metrics_history?: boolean;
    },
  ): Promise<ComplianceDashboardReport>;
  /**
   * Get current dashboard metrics
   */
  getCurrentMetrics(): ComplianceDashboardMetrics | null;
  /**
   * Get active compliance alerts
   */
  getActiveAlerts(): ComplianceAlert[];
  /**
   * Resolve compliance alert
   */
  resolveAlert(
    alertId: string,
    resolution: string,
  ): Promise<{
    success: boolean;
  }>;
  private collectLgpdMetrics;
  private collectAnvisaMetrics;
  private collectCfmMetrics;
  private collectPrivacyMetrics;
  private collectSecurityMetrics;
  private collectOperationalMetrics;
  private calculateOverallComplianceScore;
  private calculateReportingPeriod;
  private generateExecutiveSummary;
  private initializeDashboard;
  /**
   * Get audit trail for compliance reporting
   */
  getAuditTrail(): ComplianceDashboardAudit[];
  /**
   * Validate constitutional compliance of dashboard operations
   */
  validateConstitutionalCompliance(): Promise<{
    compliant: boolean;
    score: number;
    issues: string[];
  }>;
}
/**
 * Factory function to create compliance dashboard service
 */
export declare function createComplianceDashboardService(
  config: ComplianceDashboardConfig,
): ComplianceDashboardService;
/**
 * Constitutional compliance validation for dashboard operations
 */
export declare function validateComplianceDashboard(
  config: ComplianceDashboardConfig,
): Promise<{
  valid: boolean;
  violations: string[];
}>;
