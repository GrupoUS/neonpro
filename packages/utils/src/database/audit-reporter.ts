/**
 * @file Audit reporting and analytics functionality
 * @description Generate compliance reports and analyze audit data
 */

import { AuditLogger } from "./audit-core";
import type {
  AuditLogEntry,
  AuditLogFilters,
  AuditReport,
  AuditStatistics,
  ComplianceMetrics,
} from "./audit-types";

// Constants
const SAMPLE_SIZE = 10;
const HIGH_RISK_THRESHOLD = 1;
const MIN_USERS_THRESHOLD = 5;

/**
 * Audit reporting and analytics service
 */
class AuditReporter extends AuditLogger {
  /**
   * Get audit logs with filtering
   * @param {AuditLogFilters} filters Filter parameters
   * @returns {Promise<AuditLogEntry[]>} Filtered audit logs
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
    try {
      let query = this.supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false });

      if (filters.user_id) {
        query = query.eq("user_id", filters.user_id);
      }

      if (filters.resource_type) {
        query = query.eq("resource_type", filters.resource_type);
      }

      if (filters.compliance_category) {
        query = query.eq("compliance_category", filters.compliance_category);
      }

      if (filters.risk_level) {
        query = query.eq("risk_level", filters.risk_level);
      }

      if (filters.start_date) {
        query = query.gte("timestamp", filters.start_date.toISOString());
      }

      if (filters.end_date) {
        query = query.lte("timestamp", filters.end_date.toISOString());
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        return [];
      }

      return data || [];
    } catch {
      return [];
    }
  }

  /**
   * Generate compliance audit report
   * @param {object} params Report parameters
   * @returns {Promise<AuditReport | { error: string; success: boolean }>} Audit report
   */
  async generateComplianceAuditReport(params: {
    complianceFramework?: "anvisa" | "cfm" | "lgpd";
    endDate: Date;
    startDate: Date;
  }): Promise<AuditReport | { error: string; success: boolean; }> {
    try {
      const { complianceFramework, endDate, startDate } = params;
      const filters: AuditLogFilters = {
        end_date: endDate,
        start_date: startDate,
      };

      if (complianceFramework) {
        filters.compliance_category = complianceFramework;
      }

      const auditLogs = await this.getAuditLogs(filters);

      // Aggregate statistics
      const stats: AuditStatistics = {
        by_action_type: this.groupBy(auditLogs, "action"),
        by_compliance_category: this.groupBy(auditLogs, "compliance_category"),
        by_risk_level: this.groupBy(auditLogs, "risk_level"),
        by_user_role: this.groupBy(auditLogs, "user_role"),
        critical_events: auditLogs.filter(
          (log) => log.risk_level === "critical",
        ).length,
        total_actions: auditLogs.length,
        unique_users: new Set(auditLogs.map((log) => log.user_id)).size,
      };

      // Compliance-specific metrics
      const complianceMetrics = await this.calculateComplianceMetrics(
        auditLogs,
        complianceFramework,
      );

      return {
        audit_logs_sample: auditLogs.slice(0, SAMPLE_SIZE), // First 10 for reference
        compliance_metrics: complianceMetrics,
        framework: complianceFramework || "all",
        period: {
          end: endDate,
          start: startDate,
        },
        recommendations: this.generateAuditRecommendations(
          stats,
          complianceMetrics,
        ),
        statistics: stats,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  /**
   * Group array by specified key
   * @param {T[]} array Array to group
   * @param {keyof T} key Key to group by
   * @returns {Record<string, number>} Grouped counts
   */
  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce(
      (groups, item) => {
        const value = String(item[key]);
        const ZERO = 0;
        const ONE = 1;
        groups[value] = (groups[value] || ZERO) + ONE;
        return groups;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Calculate compliance-specific metrics
   * @param {AuditLogEntry[]} logs Audit logs
   * @param {string} framework Compliance framework
   * @returns {Promise<ComplianceMetrics>} Compliance metrics
   */
  private async calculateComplianceMetrics(
    logs: AuditLogEntry[],
    framework?: string,
  ): Promise<ComplianceMetrics> {
    const metrics: ComplianceMetrics = {};

    if (!framework || framework === "lgpd") {
      const lgpdLogs = logs.filter((log) => log.compliance_category === "lgpd");
      metrics.lgpd = {
        consent_operations: lgpdLogs.filter((log) => log.action.includes("consent")).length,
        data_subject_requests: lgpdLogs.filter((log) => log.action.includes("lgpd_")).length,
        patient_data_accesses: lgpdLogs.filter((log) => log.action.includes("patient_data")).length,
      };
    }

    if (!framework || framework === "cfm") {
      const cfmLogs = logs.filter((log) => log.compliance_category === "cfm");
      metrics.cfm = {
        digital_signatures: cfmLogs.filter((log) => log.action.includes("signature")).length,
        medical_actions: cfmLogs.filter((log) => log.action.includes("medical_")).length,
        telemedicine_sessions: cfmLogs.filter((log) => log.action.includes("telemedicine")).length,
      };
    }

    if (!framework || framework === "anvisa") {
      const anvisaLogs = logs.filter(
        (log) => log.compliance_category === "anvisa",
      );
      metrics.anvisa = {
        adverse_events: anvisaLogs.filter((log) => log.action.includes("adverse")).length,
        product_usage: anvisaLogs.filter((log) => log.action.includes("anvisa_")).length,
      };
    }

    return metrics;
  }

  /**
   * Generate audit recommendations
   * @param {AuditStatistics} stats Audit statistics
   * @param {ComplianceMetrics} _metrics Compliance metrics
   * @returns {string[]} Recommendations
   */
  private generateAuditRecommendations(
    stats: AuditStatistics,
    _metrics: ComplianceMetrics,
  ): string[] {
    const recommendations = [];
    const ZERO = 0;

    if (stats.critical_events > ZERO) {
      recommendations.push(
        "Review and address all critical security events immediately",
      );
    }

    if (stats.by_risk_level.high > stats.total_actions * HIGH_RISK_THRESHOLD) {
      recommendations.push(
        "High-risk actions represent more than 10% of total actions - review access controls",
      );
    }

    if (stats.unique_users < MIN_USERS_THRESHOLD) {
      recommendations.push(
        "Limited user activity detected - ensure comprehensive audit coverage",
      );
    }

    if (recommendations.length === ZERO) {
      recommendations.push(
        "Audit patterns appear normal - continue monitoring compliance metrics",
      );
    }

    return recommendations;
  }
}

export { AuditReporter };
