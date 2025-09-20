/**
 * Database Query Optimization Utilities
 * T079 - Backend API Performance Optimization
 *
 * Features:
 * - Query performance analysis
 * - Connection pool optimization
 * - Query caching strategies
 * - Healthcare compliance monitoring
 */

// import { createClient } from '@supabase/supabase-js';

// Query performance metrics
export interface QueryMetrics {
  query: string;
  duration: number;
  rowsAffected: number;
  timestamp: Date;
  endpoint: string;
  userId?: string;
  clinicId?: string;
}

// Query optimization recommendations
export interface QueryOptimization {
  query: string;
  issues: string[];
  recommendations: string[];
  estimatedImprovement: number; // Percentage
  priority: "low" | "medium" | "high" | "critical";
}

// Connection pool configuration
export interface PoolConfig {
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  createTimeoutMillis: number;
  destroyTimeoutMillis: number;
  idleTimeoutMillis: number;
  reapIntervalMillis: number;
  createRetryIntervalMillis: number;
}

// Optimized connection pool settings for healthcare APIs
export const HEALTHCARE_POOL_CONFIG: PoolConfig = {
  min: 2, // Minimum connections
  max: 20, // Maximum connections for healthcare workload
  acquireTimeoutMillis: 30000, // 30 seconds
  createTimeoutMillis: 30000, // 30 seconds
  destroyTimeoutMillis: 5000, // 5 seconds
  idleTimeoutMillis: 300000, // 5 minutes
  reapIntervalMillis: 1000, // 1 second
  createRetryIntervalMillis: 200, // 200ms
};

/**
 * Query Performance Monitor
 */
export class QueryPerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private slowQueryThreshold = 1000; // 1 second
  private maxMetricsHistory = 1000;

  /**
   * Record query execution metrics
   */
  recordQuery(metrics: QueryMetrics): void {
    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Log slow queries
    if (metrics.duration > this.slowQueryThreshold) {
      console.warn("Slow query detected:", {
        query: metrics.query.substring(0, 100) + "...",
        duration: metrics.duration,
        endpoint: metrics.endpoint,
        timestamp: metrics.timestamp,
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalQueries: number;
    averageDuration: number;
    slowQueries: number;
    slowQueryRate: number;
    topSlowQueries: QueryMetrics[];
    queryFrequency: Record<string, number>;
  } {
    const totalQueries = this.metrics.length;
    const averageDuration =
      totalQueries > 0
        ? this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries
        : 0;

    const slowQueries = this.metrics.filter(
      (m) => m.duration > this.slowQueryThreshold,
    );
    const slowQueryRate =
      totalQueries > 0 ? (slowQueries.length / totalQueries) * 100 : 0;

    // Top 10 slowest queries
    const topSlowQueries = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Query frequency analysis
    const queryFrequency: Record<string, number> = {};
    this.metrics.forEach((m) => {
      const queryKey = m.query.substring(0, 50); // First 50 chars as key
      queryFrequency[queryKey] = (queryFrequency[queryKey] || 0) + 1;
    });

    return {
      totalQueries,
      averageDuration: Math.round(averageDuration),
      slowQueries: slowQueries.length,
      slowQueryRate: Math.round(slowQueryRate),
      topSlowQueries,
      queryFrequency,
    };
  }

  /**
   * Analyze queries for optimization opportunities
   */
  analyzeQueries(): QueryOptimization[] {
    const optimizations: QueryOptimization[] = [];
    const queryGroups = new Map<string, QueryMetrics[]>();

    // Group similar queries
    this.metrics.forEach((metric) => {
      const queryPattern = this.extractQueryPattern(metric.query);
      if (!queryGroups.has(queryPattern)) {
        queryGroups.set(queryPattern, []);
      }
      queryGroups.get(queryPattern)!.push(metric);
    });

    // Analyze each query group
    queryGroups.forEach((queries, pattern) => {
      const avgDuration =
        queries.reduce((sum, q) => sum + q.duration, 0) / queries.length;
      const frequency = queries.length;

      const issues: string[] = [];
      const recommendations: string[] = [];
      let priority: "low" | "medium" | "high" | "critical" = "low";
      let estimatedImprovement = 0;

      // Analyze for common issues
      if (avgDuration > 2000) {
        issues.push("High average execution time");
        recommendations.push("Consider adding database indexes");
        recommendations.push("Review query structure for optimization");
        priority = "critical";
        estimatedImprovement += 40;
      } else if (avgDuration > 1000) {
        issues.push("Moderate execution time");
        recommendations.push("Consider query optimization");
        priority = priority === "low" ? "high" : priority;
        estimatedImprovement += 25;
      }

      if (frequency > 100) {
        issues.push("High frequency query");
        recommendations.push("Consider caching results");
        recommendations.push("Implement query result pagination");
        priority = priority === "low" ? "medium" : priority;
        estimatedImprovement += 30;
      }

      // Check for N+1 query patterns
      if (pattern.includes("SELECT") && frequency > 50) {
        issues.push("Potential N+1 query pattern");
        recommendations.push("Consider using JOIN or batch queries");
        priority = "high";
        estimatedImprovement += 50;
      }

      // Check for missing WHERE clauses in healthcare queries
      if (pattern.includes("patients") && !pattern.includes("WHERE")) {
        issues.push("Missing WHERE clause on sensitive data");
        recommendations.push("Add proper filtering for LGPD compliance");
        priority = "critical";
        estimatedImprovement += 20;
      }

      if (issues.length > 0) {
        optimizations.push({
          query: pattern,
          issues,
          recommendations,
          estimatedImprovement: Math.min(estimatedImprovement, 80),
          priority,
        });
      }
    });

    return optimizations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Extract query pattern for grouping
   */
  private extractQueryPattern(query: string): string {
    return query
      .replace(/\$\d+/g, "?") // Replace parameters
      .replace(/\d+/g, "N") // Replace numbers
      .replace(/'[^']*'/g, "'STRING'") // Replace string literals
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .substring(0, 200); // Limit length
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

/**
 * Database Connection Pool Optimizer
 */
export class ConnectionPoolOptimizer {
  private connectionStats = {
    activeConnections: 0,
    totalConnections: 0,
    waitingRequests: 0,
    connectionErrors: 0,
    averageWaitTime: 0,
  };

  /**
   * Monitor connection pool health
   */
  monitorPool(): {
    health: "healthy" | "warning" | "critical";
    recommendations: string[];
    stats: typeof this.connectionStats;
  } {
    const {
      activeConnections,
      totalConnections,
      waitingRequests,
      connectionErrors,
    } = this.connectionStats;

    let health: "healthy" | "warning" | "critical" = "healthy";
    const recommendations: string[] = [];

    // Analyze connection pool health
    const utilizationRate =
      totalConnections > 0 ? (activeConnections / totalConnections) * 100 : 0;

    if (utilizationRate > 90) {
      health = "critical";
      recommendations.push("Increase maximum pool size");
      recommendations.push("Investigate long-running queries");
    } else if (utilizationRate > 75) {
      health = "warning";
      recommendations.push("Consider increasing pool size");
    }

    if (waitingRequests > 10) {
      health = "critical";
      recommendations.push("Reduce query execution time");
      recommendations.push("Increase pool size or timeout settings");
    }

    if (connectionErrors > 5) {
      health = "warning";
      recommendations.push("Check database connectivity");
      recommendations.push("Review connection timeout settings");
    }

    return {
      health,
      recommendations,
      stats: this.connectionStats,
    };
  }

  /**
   * Get optimized pool configuration based on workload
   */
  getOptimizedConfig(workloadType: "light" | "medium" | "heavy"): PoolConfig {
    const baseConfig = { ...HEALTHCARE_POOL_CONFIG };

    switch (workloadType) {
      case "light":
        return {
          ...baseConfig,
          min: 1,
          max: 10,
        };

      case "medium":
        return {
          ...baseConfig,
          min: 2,
          max: 20,
        };

      case "heavy":
        return {
          ...baseConfig,
          min: 5,
          max: 50,
          acquireTimeoutMillis: 60000,
        };

      default:
        return baseConfig;
    }
  }
}

/**
 * Healthcare-specific query optimizer
 */
export class HealthcareQueryOptimizer {
  /**
   * Optimize patient data queries for LGPD compliance
   */
  optimizePatientQuery(
    query: string,
    userId: string,
    clinicId: string,
  ): string {
    let optimizedQuery = query;

    // Ensure proper filtering for patient data
    if (query.includes("patients") && !query.includes("WHERE")) {
      optimizedQuery = query.replace(
        "FROM patients",
        `FROM patients WHERE clinic_id = '${clinicId}'`,
      );
    }

    // Add audit trail for sensitive queries
    if (
      query.includes("patient_records") ||
      query.includes("medical_history")
    ) {
      // This would integrate with audit logging
      console.log("Sensitive query executed:", {
        userId,
        clinicId,
        queryType: "patient_data_access",
        timestamp: new Date().toISOString(),
      });
    }

    return optimizedQuery;
  }

  /**
   * Generate index recommendations for healthcare tables
   */
  getIndexRecommendations(): string[] {
    return [
      "CREATE INDEX CONCURRENTLY idx_patients_clinic_id ON patients(clinic_id);",
      "CREATE INDEX CONCURRENTLY idx_appointments_date_professional ON appointments(appointment_date, professional_id);",
      "CREATE INDEX CONCURRENTLY idx_patient_records_patient_date ON patient_records(patient_id, created_at);",
      "CREATE INDEX CONCURRENTLY idx_audit_logs_timestamp ON audit_logs(timestamp) WHERE action_type IN ('patient_access', 'data_modification');",
      "CREATE INDEX CONCURRENTLY idx_professionals_clinic_active ON professionals(clinic_id, is_active) WHERE is_active = true;",
    ];
  }
}

// Global instances
export const queryMonitor = new QueryPerformanceMonitor();
export const poolOptimizer = new ConnectionPoolOptimizer();
export const healthcareOptimizer = new HealthcareQueryOptimizer();

export default {
  QueryPerformanceMonitor,
  ConnectionPoolOptimizer,
  HealthcareQueryOptimizer,
  queryMonitor,
  poolOptimizer,
  healthcareOptimizer,
  HEALTHCARE_POOL_CONFIG,
};
