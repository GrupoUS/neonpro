/**
 * Type definitions for compliance automation system
 * Provides type safety for compliance data structures
 */

export interface ComplianceHistoryEntry {
  readonly overall_score: number;
  readonly assessment_date: Date;
  readonly areas: readonly string[];
  readonly severity_counts: SeverityCount;
  readonly tenant_id: string;
}

export interface ComplianceTrends {
  readonly areas_declining: readonly string[];
  readonly areas_improving: readonly string[];
  readonly average_score: number;
  readonly compliance_consistency: number;
  readonly score_trend: "improving" | "stable" | "declining";
}

export interface SeverityCount {
  readonly critical: number;
  readonly warning: number;
  readonly info: number;
  readonly total: number;
}

export interface ComplianceAlert {
  readonly severity: "critical" | "constitutional_violation" | "warning" | "info";
  readonly message: string;
  readonly area: string;
  readonly timestamp: Date;
  readonly resolved: boolean;
}

export interface ComplianceReportData {
  readonly reportData: readonly ComplianceHistoryEntry[];
  readonly startDate: string | Date;
  readonly endDate: string | Date;
  readonly periodDays: number;
  readonly reportType: string;
  readonly tenantId: string;
}

export interface ComplianceOverview {
  readonly areas_analyzed: readonly string[];
  readonly average_score: number;
  readonly constitutional_compliance_rate: number;
  readonly total_assessments: number;
}

export interface ComplianceReportSummary {
  readonly compliance_overview: ComplianceOverview;
  readonly download_url: string;
  readonly generated_at: string;
  readonly period: {
    readonly days: number;
    readonly end: string;
    readonly start: string;
  };
  readonly report_id: string;
  readonly report_type: string;
}

export interface ComplianceValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface ComplianceAutomationResult<T = unknown> {
  readonly success: boolean;
  readonly data: T;
  readonly timestamp: string;
  readonly compliance_score: number;
}