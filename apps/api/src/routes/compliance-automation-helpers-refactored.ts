/**
 * Compliance Automation Helper Functions - Refactored
 *
 * IMPROVEMENTS:
 * ✅ Full type safety - no more unknown[] types
 * ✅ Pure functions - removed unnecessary async
 * ✅ Better error handling
 * ✅ Cleaner calculation logic
 * ✅ KISS principle applied
 */

import { COMPLIANCE_STANDARDS, MAGIC_NUMBERS } from "./compliance-automation-constants";
import type {
  ComplianceAlert,
  ComplianceAutomationResult,
  ComplianceHistoryEntry,
  ComplianceOverview,
  ComplianceReportData,
  ComplianceReportSummary,
  ComplianceTrends,
  ComplianceValidationResult,
  SeverityCount,
} from "./compliance-automation-types";

// =============================================================================
// UTILITY FUNCTIONS (Pure, reusable)
// =============================================================================

function calculateAverage(numbers: readonly number[]): number {
  if (numbers.length === 0) {return 0;}
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

function roundToTwoDecimals(num: number): number {
  return Math.round(num * MAGIC_NUMBERS.HUNDRED) / MAGIC_NUMBERS.HUNDRED;
}

function calculateComplianceConsistency(scores: readonly number[]): number {
  const compliantScores = scores.filter(score => score >= COMPLIANCE_STANDARDS.MINIMUM_SCORE);
  const consistencyRate = (compliantScores.length / scores.length) * MAGIC_NUMBERS.HUNDRED;
  return Math.round(consistencyRate);
}

function determineTrend(scores: readonly number[]): "improving" | "stable" | "declining" {
  if (scores.length < 2) {return "stable";}

  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const trendPercentage = ((lastScore - firstScore) / firstScore) * MAGIC_NUMBERS.HUNDRED;

  if (trendPercentage > MAGIC_NUMBERS.ONE) {return "improving";}
  if (trendPercentage < MAGIC_NUMBERS.NEGATIVE_ONE) {return "declining";}
  return "stable";
}

// =============================================================================
// CORE COMPLIANCE FUNCTIONS
// =============================================================================

/**
 * Calculates compliance trends from historical data
 * Pure function - no side effects, fully type-safe
 */
export function calculateComplianceTrends(
  complianceHistory: readonly ComplianceHistoryEntry[],
): ComplianceTrends {
  // Handle empty or insufficient data
  if (!complianceHistory || complianceHistory.length < MAGIC_NUMBERS.TWO) {
    return {
      areas_declining: [],
      areas_improving: [],
      average_score: COMPLIANCE_STANDARDS.MINIMUM_SCORE,
      compliance_consistency: MAGIC_NUMBERS.HUNDRED,
      score_trend: "stable",
    };
  }

  const scores = complianceHistory.map(entry => entry.overall_score);
  const averageScore = calculateAverage(scores);

  return {
    areas_declining: [], // Area-specific analysis
    areas_improving: [], // Area-specific analysis
    average_score: roundToTwoDecimals(averageScore),
    compliance_consistency: calculateComplianceConsistency(scores),
    score_trend: determineTrend(scores),
  };
}

/**
 * Categorizes alerts by severity level
 * Pure function with proper type safety
 */
export function categorizeAlertsBySeverity(
  alerts: readonly ComplianceAlert[],
): SeverityCount {
  if (!alerts || alerts.length === 0) {
    return {
      critical: MAGIC_NUMBERS.ZERO,
      warning: MAGIC_NUMBERS.ZERO,
      info: MAGIC_NUMBERS.ZERO,
      total: MAGIC_NUMBERS.ZERO,
    };
  }

  const criticalCount =
    alerts.filter(alert =>
      alert.severity === "critical" || alert.severity === "constitutional_violation"
    ).length;

  const warningCount = alerts.filter(alert => alert.severity === "warning").length;

  const infoCount = alerts.filter(alert => alert.severity === "info").length;

  return {
    critical: criticalCount,
    warning: warningCount,
    info: infoCount,
    total: alerts.length,
  };
}

/**
 * Generates compliance report summary
 * Synchronous function with proper input validation
 */
export function generateComplianceReportSummary(
  reportData: readonly ComplianceHistoryEntry[],
  startDate: Date,
  endDate: Date,
  periodDays: number,
  reportType: string,
): ComplianceReportSummary {
  const compliance_overview: ComplianceOverview = {
    areas_analyzed: ["LGPD", "ANVISA", "CFM"],
    average_score: reportData.length > 0
      ? roundToTwoDecimals(calculateAverage(reportData.map(r => r.overall_score)))
      : COMPLIANCE_STANDARDS.MINIMUM_SCORE,
    constitutional_compliance_rate: reportData.length > 0
      ? calculateComplianceConsistency(reportData.map(r => r.overall_score))
      : MAGIC_NUMBERS.HUNDRED,
    total_assessments: reportData.length,
  };

  return {
    compliance_overview,
    download_url: "/api/v1/compliance-automation/reports/download/",
    generated_at: new Date().toISOString(),
    period: {
      days: periodDays,
      end: endDate.toISOString(),
      start: startDate.toISOString(),
    },
    report_id: `compliance_report_${Date.now()}`,
    report_type: reportType,
  };
}

/**
 * Creates compliance automation result wrapper
 * Generic type for reusable response structure
 */
export function createComplianceAutomationResult<T>(
  data: T,
  compliance_score?: number,
): ComplianceAutomationResult<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    compliance_score: compliance_score ?? COMPLIANCE_STANDARDS.MINIMUM_SCORE,
  };
}

/**
 * Creates compliance report from input data
 * Type-safe wrapper around report generation
 */
export function createComplianceReport(data: ComplianceReportData): ComplianceReportSummary {
  return generateComplianceReportSummary(
    data.reportData,
    new Date(data.startDate),
    new Date(data.endDate),
    data.periodDays,
    data.reportType,
  );
}

/**
 * Validates compliance data structure
 * Returns detailed validation results
 */
export function validateComplianceData(data: unknown): ComplianceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic structure validation
  if (!data || typeof data !== "object") {
    errors.push("Data must be a valid object");
    return { isValid: false, errors, warnings };
  }

  const typedData = data as Record<string, unknown>;

  // Required field validation
  if (!typedData.tenantId || typeof typedData.tenantId !== "string") {
    errors.push("Missing required field: tenantId");
  }

  // Optional field warnings
  if (typedData.reportData && !Array.isArray(typedData.reportData)) {
    warnings.push("reportData should be an array when provided");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
