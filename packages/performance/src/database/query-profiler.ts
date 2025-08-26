/**
 * Database Performance Monitoring for Healthcare Applications
 * Monitors Supabase/PostgreSQL queries with healthcare-specific insights
 */

import type {
  DatabaseOptimizationSuggestion,
  DatabasePerformanceMetric,
} from "../types";

// Removed unused type declarations QueryExecutionPlan and SupabaseQueryLog

export class HealthcareDatabaseMonitor {
  private metrics: DatabasePerformanceMetric[] = [];
  private readonly slowQueryThreshold: number; // 1 second
  private readonly healthcareTableMap = new Map([
    ["patients", "patient"],
    ["patient_records", "patient"],
    ["medical_records", "medical-record"],
    ["appointments", "appointment"],
    ["prescriptions", "medical-record"],
    ["procedures", "medical-record"],
    ["billing", "billing"],
    ["audit_logs", "audit"],
    ["vital_signs", "medical-record"],
    ["lab_results", "medical-record"],
    ["imaging_studies", "medical-record"],
    ["medications", "medical-record"],
  ]);

  constructor(slowQueryThreshold = 1000) {
    this.slowQueryThreshold = slowQueryThreshold;
  }

  /**
   * Record a database query execution
   */
  recordQuery(
    _query: string,
    executionTime: number,
    table: string,
    queryType: "select" | "insert" | "update" | "delete",
    rowsAffected?: number,
    queryPlan?: string,
  ): void {
    const metric: DatabasePerformanceMetric = {
      queryType,
      table,
      executionTime,
      rowsAffected: rowsAffected ?? 0,
      queryPlan: queryPlan ?? "",
      timestamp: Date.now(),
      isSlowQuery: executionTime > this.slowQueryThreshold,
      healthcareDataType: this.healthcareTableMap.get(table) as any,
    };

    this.metrics.push(metric);

    // Log slow queries immediately
    if (metric.isSlowQuery) {
    }

    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Analyze database performance patterns
   */
  analyzePerformance(): {
    slowQueries: DatabasePerformanceMetric[];
    tablePerformance: Map<
      string,
      {
        avgExecutionTime: number;
        queryCount: number;
        slowQueryCount: number;
        healthcareDataType?: string;
      }
    >;
    optimizationSuggestions: DatabaseOptimizationSuggestion[];
  } {
    const slowQueries = this.metrics.filter((m) => m.isSlowQuery);
    const tablePerformance = this.analyzeTablePerformance();
    const optimizationSuggestions =
      this.generateOptimizationSuggestions(tablePerformance);

    return {
      slowQueries,
      tablePerformance,
      optimizationSuggestions,
    };
  }

  /**
   * Analyze performance by table
   */
  private analyzeTablePerformance(): Map<
    string,
    {
      avgExecutionTime: number;
      queryCount: number;
      slowQueryCount: number;
      healthcareDataType?: string;
    }
  > {
    const tableStats = new Map();

    this.metrics.forEach((metric) => {
      if (!tableStats.has(metric.table)) {
        tableStats.set(metric.table, {
          totalExecutionTime: 0,
          queryCount: 0,
          slowQueryCount: 0,
          healthcareDataType: metric.healthcareDataType,
        });
      }

      const stats = tableStats.get(metric.table);
      stats.totalExecutionTime += metric.executionTime;
      stats.queryCount += 1;
      if (metric.isSlowQuery) {
        stats.slowQueryCount += 1;
      }
    });

    // Calculate averages
    const result = new Map();
    tableStats.forEach((stats, table) => {
      result.set(table, {
        avgExecutionTime: stats.totalExecutionTime / stats.queryCount,
        queryCount: stats.queryCount,
        slowQueryCount: stats.slowQueryCount,
        healthcareDataType: stats.healthcareDataType,
      });
    });

    return result;
  }

  /**
   * Generate optimization suggestions based on patterns
   */
  private generateOptimizationSuggestions(
    tablePerformance: Map<string, any>,
  ): DatabaseOptimizationSuggestion[] {
    const suggestions: DatabaseOptimizationSuggestion[] = [];

    tablePerformance.forEach((stats, table) => {
      // Suggest indexes for slow healthcare tables
      if (stats.avgExecutionTime > this.slowQueryThreshold) {
        suggestions.push({
          table,
          type: "index",
          description: `Table "${table}" has slow average query time (${Math.round(
            stats.avgExecutionTime,
          )}ms). Consider adding indexes on frequently queried columns.`,
          expectedImprovement: Math.min(
            90,
            Math.round(
              ((stats.avgExecutionTime - 100) / stats.avgExecutionTime) * 100,
            ),
          ),
          healthcareImpact: this.getHealthcareImpact(
            stats.healthcareDataType,
            stats.avgExecutionTime,
          ),
        });
      }

      // Suggest caching for frequently accessed healthcare data
      if (stats.queryCount > 100 && stats.healthcareDataType === "patient") {
        suggestions.push({
          table,
          type: "caching",
          description: `Table "${table}" is frequently accessed (${stats.queryCount} queries). Implement query result caching for patient lookups.`,
          expectedImprovement: 80,
          healthcareImpact: "critical",
        });
      }

      // Suggest query rewriting for medical records with many slow queries
      if (
        stats.slowQueryCount > 5 &&
        stats.healthcareDataType === "medical-record"
      ) {
        suggestions.push({
          table,
          type: "query-rewrite",
          description: `Table "${table}" has ${stats.slowQueryCount} slow queries. Review and optimize medical record queries for better performance.`,
          expectedImprovement: 60,
          healthcareImpact: "important",
        });
      }

      // Suggest partitioning for large audit tables
      if (table.includes("audit") && stats.queryCount > 500) {
        suggestions.push({
          table,
          type: "partitioning",
          description: `Audit table "${table}" has high query volume. Consider time-based partitioning for better performance.`,
          expectedImprovement: 50,
          healthcareImpact: "minor",
        });
      }
    });

    // Sort by healthcare impact and expected improvement
    return suggestions.sort((a, b) => {
      const impactOrder = { critical: 3, important: 2, minor: 1 };
      if (impactOrder[a.healthcareImpact] !== impactOrder[b.healthcareImpact]) {
        return (
          impactOrder[b.healthcareImpact] - impactOrder[a.healthcareImpact]
        );
      }
      return b.expectedImprovement - a.expectedImprovement;
    });
  }

  /**
   * Determine healthcare impact based on data type and performance
   */
  private getHealthcareImpact(
    dataType?: string,
    executionTime = 0,
  ): "critical" | "important" | "minor" {
    if (dataType === "patient" && executionTime > 2000) {
      return "critical"; // Patient data access is critical
    }
    if (dataType === "medical-record" && executionTime > 1500) {
      return "important"; // Medical records are important
    }
    if (dataType === "appointment" && executionTime > 1000) {
      return "important"; // Appointment scheduling is important
    }
    return "minor";
  }

  /**
   * Get database performance report
   */
  getPerformanceReport(): string {
    const analysis = this.analyzePerformance();
    const totalQueries = this.metrics.length;
    const slowQueryPercentage = (
      (analysis.slowQueries.length / totalQueries) *
      100
    ).toFixed(2);

    const report = `
🏥 HEALTHCARE DATABASE PERFORMANCE REPORT
==========================================

📊 Query Overview:
- Total Queries: ${totalQueries}
- Slow Queries: ${analysis.slowQueries.length} (${slowQueryPercentage}%)
- Slow Query Threshold: ${this.slowQueryThreshold}ms

📋 Table Performance:
${[...analysis.tablePerformance.entries()]
  .map(
    ([table, stats]) => `
- ${table} (${stats.healthcareDataType || "general"}):
  • Avg Execution Time: ${Math.round(stats.avgExecutionTime)}ms
  • Query Count: ${stats.queryCount}
  • Slow Queries: ${stats.slowQueryCount}
  • Performance: ${
    stats.avgExecutionTime > this.slowQueryThreshold
      ? "❌ Needs Attention"
      : "✅ Good"
  }
`,
  )
  .join("")}

🎯 Optimization Recommendations:
${analysis.optimizationSuggestions
  .map(
    (suggestion, index) => `
${index + 1}. [${suggestion.healthcareImpact.toUpperCase()}] ${suggestion.table}
   🔧 ${suggestion.type}: ${suggestion.description}
   📈 Expected Improvement: ${suggestion.expectedImprovement}%
`,
  )
  .join("")}

🏥 Healthcare-Specific Insights:
${this.getHealthcareInsights(analysis)}

${
  analysis.slowQueries.length === 0
    ? "✅ All database queries are performing well!"
    : "⚠️  Some queries need optimization for optimal healthcare performance."
}
`;

    return report;
  }

  /**
   * Get healthcare-specific insights
   */
  private getHealthcareInsights(_analysis: any): string {
    const patientQueries = this.metrics.filter(
      (m) => m.healthcareDataType === "patient",
    );
    const medicalRecordQueries = this.metrics.filter(
      (m) => m.healthcareDataType === "medical-record",
    );
    const appointmentQueries = this.metrics.filter(
      (m) => m.healthcareDataType === "appointment",
    );

    let insights = "";

    if (patientQueries.length > 0) {
      const avgPatientQueryTime =
        patientQueries.reduce((sum, q) => sum + q.executionTime, 0) /
        patientQueries.length;
      insights += `- Patient Data Access: ${Math.round(
        avgPatientQueryTime,
      )}ms avg (target: <500ms)\n`;
    }

    if (medicalRecordQueries.length > 0) {
      const avgMedicalQueryTime =
        medicalRecordQueries.reduce((sum, q) => sum + q.executionTime, 0) /
        medicalRecordQueries.length;
      insights += `- Medical Records: ${Math.round(avgMedicalQueryTime)}ms avg (target: <800ms)\n`;
    }

    if (appointmentQueries.length > 0) {
      const avgAppointmentQueryTime =
        appointmentQueries.reduce((sum, q) => sum + q.executionTime, 0) /
        appointmentQueries.length;
      insights += `- Appointment Scheduling: ${Math.round(
        avgAppointmentQueryTime,
      )}ms avg (target: <600ms)\n`;
    }

    return insights || "- No healthcare-specific data available yet";
  }

  /**
   * Generate SQL optimization queries
   */
  generateOptimizationSQL(
    suggestions: DatabaseOptimizationSuggestion[],
  ): string {
    const sqlCommands: string[] = [
      "-- Healthcare Database Optimization SQL",
      `-- Generated on ${new Date().toISOString()}`,
      "",
    ];

    suggestions.forEach((suggestion) => {
      if (suggestion.type === "index") {
        sqlCommands.push(`-- ${suggestion.description}`);
        sqlCommands.push(this.generateIndexSQL(suggestion.table));
        sqlCommands.push("");
      }
    });

    // Add healthcare-specific indexes
    sqlCommands.push("-- Healthcare-Specific Indexes");
    sqlCommands.push(this.generateHealthcareIndexes());

    return sqlCommands.join("\n");
  }

  /**
   * Generate index SQL for a table
   */
  private generateIndexSQL(table: string): string {
    const commonIndexes = {
      patients: [
        "CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);",
        "CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);",
        "CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);",
      ],
      appointments: [
        "CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);",
        "CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);",
        "CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);",
      ],
      medical_records: [
        "CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);",
        "CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(created_at);",
        "CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(record_type);",
      ],
    };

    return (
      commonIndexes[table as keyof typeof commonIndexes]?.join("\n") ||
      `-- No specific indexes suggested for ${table}`
    );
  }

  /**
   * Generate healthcare-specific database indexes
   */
  private generateHealthcareIndexes(): string {
    return `
-- Patient Management Indexes
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients USING gin(to_tsvector('portuguese', name || ' ' || cpf));
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(active) WHERE active = true;

-- Medical Records Indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_composite ON medical_records(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_search ON medical_records USING gin(to_tsvector('portuguese', diagnosis || ' ' || notes));

-- Appointment Scheduling Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_scheduling ON appointments(appointment_date, status) WHERE status IN ('scheduled', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(healthcare_provider_id, appointment_date);

-- Audit and Compliance Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date_range ON audit_logs(created_at) WHERE created_at >= NOW() - INTERVAL '90 days';

-- Performance Monitoring Indexes
CREATE INDEX IF NOT EXISTS idx_query_performance ON query_logs(execution_time) WHERE execution_time > 1000;
`;
  }

  /**
   * Clear metrics (useful for testing or memory management)
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get current metrics count
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }
}

export default HealthcareDatabaseMonitor;
