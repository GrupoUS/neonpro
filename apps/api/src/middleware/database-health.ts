/**
 * Database Health Monitoring Middleware
 * T080 - Database Performance Tuning
 *
 * Features:
 * - Real-time database health monitoring
 * - Healthcare-specific performance thresholds
 * - Connection pool health tracking
 * - Query performance monitoring
 * - LGPD compliance monitoring
 * - Automated alerting and reporting
 */

import { Context, Next } from "hono";
import ConnectionPoolManager from "../services/connection-pool-manager";
import DatabasePerformanceService from "../services/database-performance";

// Database health status
export interface DatabaseHealthStatus {
  status: "healthy" | "warning" | "critical";
  score: number; // 0-100
  timestamp: Date;
  components: {
    connectionPool: ComponentHealth;
    queryPerformance: ComponentHealth;
    indexOptimization: ComponentHealth;
    healthcareCompliance: ComponentHealth;
  };
  alerts: HealthAlert[];
}

// Component health status
export interface ComponentHealth {
  status: "healthy" | "warning" | "critical";
  score: number;
  metrics: Record<string, number>;
  issues: string[];
}

// Health alert
export interface HealthAlert {
  type: "performance" | "compliance" | "connection" | "query";
  severity: "warning" | "critical";
  message: string;
  component: string;
  timestamp: Date;
  healthcareImpact: string;
}

// Healthcare performance thresholds
export const HEALTHCARE_HEALTH_THRESHOLDS = {
  queryPerformance: {
    patientQueries: { warning: 50, critical: 100 }, // ms
    appointmentQueries: { warning: 75, critical: 150 }, // ms
    generalQueries: { warning: 100, critical: 200 }, // ms
    errorRate: { warning: 1, critical: 5 }, // percentage
  },
  connectionPool: {
    utilization: { warning: 80, critical: 95 }, // percentage
    waitTime: { warning: 500, critical: 2000 }, // ms
    errors: { warning: 1, critical: 5 }, // count per minute
  },
  compliance: {
    lgpdQueries: { warning: 90, critical: 80 }, // percentage compliant
    auditCoverage: { warning: 95, critical: 90 }, // percentage
  },
};

/**
 * Database Health Monitor
 */
export class DatabaseHealthMonitor {
  private performanceService: DatabasePerformanceService;
  private poolManager: ConnectionPoolManager;
  private healthHistory: DatabaseHealthStatus[] = [];
  private maxHistorySize = 288; // 24 hours of 5-minute intervals
  private alertCallbacks: ((alert: HealthAlert) => void)[] = [];

  constructor() {
    this.performanceService = new DatabasePerformanceService();
    this.poolManager = new ConnectionPoolManager();

    // Set up alert forwarding
    this.poolManager.onAlert((poolAlert) => {
      const healthAlert: HealthAlert = {
        type: "connection",
        severity: poolAlert.severity,
        message: poolAlert.message,
        component: "connectionPool",
        timestamp: poolAlert.timestamp,
        healthcareImpact: poolAlert.healthcareImpact,
      };
      this.triggerAlert(healthAlert);
    });
  }

  /**
   * Get current database health status
   */
  async getCurrentHealth(): Promise<DatabaseHealthStatus> {
    const [dbMetrics, poolMetrics] = await Promise.all([
      this.performanceService.analyzePerformance(),
      Promise.resolve(this.poolManager.getMetrics()),
    ]);

    const components = {
      connectionPool: this.assessConnectionPoolHealth(poolMetrics),
      queryPerformance: this.assessQueryPerformanceHealth(
        dbMetrics.queryPerformance,
      ),
      indexOptimization: this.assessIndexOptimizationHealth(
        dbMetrics.indexUsage,
      ),
      healthcareCompliance: this.assessHealthcareComplianceHealth(
        dbMetrics.healthcareCompliance,
      ),
    };

    const alerts = this.generateAlerts(components);
    const overallScore = this.calculateOverallScore(components);
    const status = this.determineOverallStatus(overallScore, alerts);

    const healthStatus: DatabaseHealthStatus = {
      status,
      score: overallScore,
      timestamp: new Date(),
      components,
      alerts,
    };

    // Store in history
    this.healthHistory.push(healthStatus);
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory.shift();
    }

    // Trigger alerts
    alerts.forEach((alert) => this.triggerAlert(alert));

    return healthStatus;
  }

  /**
   * Assess connection pool health
   */
  private assessConnectionPoolHealth(poolMetrics: any): ComponentHealth {
    const issues: string[] = [];
    let score = 100;

    // Check utilization
    if (
      poolMetrics.utilization >
      HEALTHCARE_HEALTH_THRESHOLDS.connectionPool.utilization.critical
    ) {
      issues.push("Critical connection pool utilization");
      score -= 30;
    } else if (
      poolMetrics.utilization >
      HEALTHCARE_HEALTH_THRESHOLDS.connectionPool.utilization.warning
    ) {
      issues.push("High connection pool utilization");
      score -= 15;
    }

    // Check wait times
    if (
      poolMetrics.averageWaitTime >
      HEALTHCARE_HEALTH_THRESHOLDS.connectionPool.waitTime.critical
    ) {
      issues.push("Critical connection wait times");
      score -= 25;
    } else if (
      poolMetrics.averageWaitTime >
      HEALTHCARE_HEALTH_THRESHOLDS.connectionPool.waitTime.warning
    ) {
      issues.push("High connection wait times");
      score -= 10;
    }

    // Check errors
    if (
      poolMetrics.connectionErrors >
      HEALTHCARE_HEALTH_THRESHOLDS.connectionPool.errors.critical
    ) {
      issues.push("Critical connection error rate");
      score -= 20;
    } else if (
      poolMetrics.connectionErrors >
      HEALTHCARE_HEALTH_THRESHOLDS.connectionPool.errors.warning
    ) {
      issues.push("Elevated connection errors");
      score -= 10;
    }

    const status =
      score >= 80 ? "healthy" : score >= 60 ? "warning" : "critical";

    return {
      status,
      score: Math.max(0, score),
      metrics: {
        utilization: poolMetrics.utilization,
        waitTime: poolMetrics.averageWaitTime,
        errors: poolMetrics.connectionErrors,
        active: poolMetrics.active,
        idle: poolMetrics.idle,
      },
      issues,
    };
  }

  /**
   * Assess query performance health
   */
  private assessQueryPerformanceHealth(queryMetrics: any): ComponentHealth {
    const issues: string[] = [];
    let score = 100;

    // Check average response time
    if (
      queryMetrics.averageResponseTime >
      HEALTHCARE_HEALTH_THRESHOLDS.queryPerformance.generalQueries.critical
    ) {
      issues.push("Critical query response times");
      score -= 30;
    } else if (
      queryMetrics.averageResponseTime >
      HEALTHCARE_HEALTH_THRESHOLDS.queryPerformance.generalQueries.warning
    ) {
      issues.push("Slow query response times");
      score -= 15;
    }

    // Check error rate
    if (
      queryMetrics.errorRate >
      HEALTHCARE_HEALTH_THRESHOLDS.queryPerformance.errorRate.critical
    ) {
      issues.push("Critical query error rate");
      score -= 25;
    } else if (
      queryMetrics.errorRate >
      HEALTHCARE_HEALTH_THRESHOLDS.queryPerformance.errorRate.warning
    ) {
      issues.push("Elevated query errors");
      score -= 10;
    }

    // Check slow queries
    const slowQueryRate =
      (queryMetrics.slowQueries / queryMetrics.totalQueries) * 100;
    if (slowQueryRate > 10) {
      issues.push("High percentage of slow queries");
      score -= 15;
    } else if (slowQueryRate > 5) {
      issues.push("Moderate slow query rate");
      score -= 5;
    }

    const status =
      score >= 80 ? "healthy" : score >= 60 ? "warning" : "critical";

    return {
      status,
      score: Math.max(0, score),
      metrics: {
        averageResponseTime: queryMetrics.averageResponseTime,
        errorRate: queryMetrics.errorRate,
        slowQueries: queryMetrics.slowQueries,
        totalQueries: queryMetrics.totalQueries,
        slowQueryRate,
      },
      issues,
    };
  }

  /**
   * Assess index optimization health
   */
  private assessIndexOptimizationHealth(indexMetrics: any): ComponentHealth {
    const issues: string[] = [];
    let score = 100;

    // Check index efficiency
    if (indexMetrics.indexEfficiency < 70) {
      issues.push("Low index efficiency");
      score -= 20;
    } else if (indexMetrics.indexEfficiency < 85) {
      issues.push("Moderate index efficiency");
      score -= 10;
    }

    // Check missing indexes
    if (indexMetrics.missingIndexes.length > 5) {
      issues.push("Many missing indexes detected");
      score -= 25;
    } else if (indexMetrics.missingIndexes.length > 2) {
      issues.push("Some missing indexes detected");
      score -= 10;
    }

    // Check unused indexes
    if (indexMetrics.unusedIndexes > 5) {
      issues.push("Many unused indexes (maintenance overhead)");
      score -= 15;
    } else if (indexMetrics.unusedIndexes > 2) {
      issues.push("Some unused indexes detected");
      score -= 5;
    }

    const status =
      score >= 80 ? "healthy" : score >= 60 ? "warning" : "critical";

    return {
      status,
      score: Math.max(0, score),
      metrics: {
        efficiency: indexMetrics.indexEfficiency,
        total: indexMetrics.totalIndexes,
        unused: indexMetrics.unusedIndexes,
        missing: indexMetrics.missingIndexes.length,
      },
      issues,
    };
  }

  /**
   * Assess healthcare compliance health
   */
  private assessHealthcareComplianceHealth(
    complianceMetrics: any,
  ): ComponentHealth {
    const issues: string[] = [];
    let score = 100;

    // Check patient query performance
    if (
      complianceMetrics.avgPatientQueryTime >
      HEALTHCARE_HEALTH_THRESHOLDS.queryPerformance.patientQueries.critical
    ) {
      issues.push("Critical patient data query performance");
      score -= 30;
    } else if (
      complianceMetrics.avgPatientQueryTime >
      HEALTHCARE_HEALTH_THRESHOLDS.queryPerformance.patientQueries.warning
    ) {
      issues.push("Slow patient data queries");
      score -= 15;
    }

    // Check LGPD compliance rate
    const lgpdRate =
      complianceMetrics.patientDataQueries > 0
        ? (complianceMetrics.lgpdCompliantQueries /
            complianceMetrics.patientDataQueries) *
          100
        : 100; // Default to 100% if no patient queries
    if (
      lgpdRate < HEALTHCARE_HEALTH_THRESHOLDS.compliance.lgpdQueries.critical
    ) {
      issues.push("Critical LGPD compliance rate");
      score -= 35;
    } else if (
      lgpdRate < HEALTHCARE_HEALTH_THRESHOLDS.compliance.lgpdQueries.warning
    ) {
      issues.push("Low LGPD compliance rate");
      score -= 20;
    }

    const status =
      score >= 80 ? "healthy" : score >= 60 ? "warning" : "critical";

    return {
      status,
      score: Math.max(0, score),
      metrics: {
        patientQueryTime: complianceMetrics.avgPatientQueryTime,
        lgpdCompliance: lgpdRate,
        patientQueries: complianceMetrics.patientDataQueries,
        auditQueries: complianceMetrics.auditTrailQueries,
      },
      issues,
    };
  }

  /**
   * Generate alerts based on component health
   */
  private generateAlerts(components: any): HealthAlert[] {
    const alerts: HealthAlert[] = [];
    const timestamp = new Date();

    Object.entries(components).forEach(
      ([componentName, health]: [string, any]) => {
        if (health.status === "critical") {
          alerts.push({
            type: this.getAlertType(componentName),
            severity: "critical",
            message: `Critical issues in ${componentName}: ${health.issues.join(", ")}`,
            component: componentName,
            timestamp,
            healthcareImpact: this.getHealthcareImpact(
              componentName,
              "critical",
            ),
          });
        } else if (health.status === "warning") {
          alerts.push({
            type: this.getAlertType(componentName),
            severity: "warning",
            message: `Performance issues in ${componentName}: ${health.issues.join(", ")}`,
            component: componentName,
            timestamp,
            healthcareImpact: this.getHealthcareImpact(
              componentName,
              "warning",
            ),
          });
        }
      },
    );

    return alerts;
  }

  /**
   * Get alert type for component
   */
  private getAlertType(
    componentName: string,
  ): "performance" | "compliance" | "connection" | "query" {
    const typeMap: Record<
      string,
      "performance" | "compliance" | "connection" | "query"
    > = {
      connectionPool: "connection",
      queryPerformance: "query",
      indexOptimization: "performance",
      healthcareCompliance: "compliance",
    };
    return typeMap[componentName] || "performance";
  }

  /**
   * Get healthcare impact description
   */
  private getHealthcareImpact(componentName: string, severity: string): string {
    const impactMap: Record<string, Record<string, string>> = {
      connectionPool: {
        critical:
          "Patient appointment scheduling and data access severely impacted",
        warning: "Potential delays in patient data access",
      },
      queryPerformance: {
        critical: "Healthcare operations experiencing significant delays",
        warning: "Patient queries may be slower than optimal",
      },
      indexOptimization: {
        critical: "Database performance severely degraded",
        warning: "Suboptimal database performance",
      },
      healthcareCompliance: {
        critical: "LGPD compliance at risk - immediate attention required",
        warning: "Healthcare compliance metrics below optimal levels",
      },
    };

    return (
      impactMap[componentName]?.[severity] ||
      "Healthcare operations may be affected"
    );
  }

  /**
   * Calculate overall health score
   */
  private calculateOverallScore(components: any): number {
    const weights = {
      connectionPool: 0.3,
      queryPerformance: 0.3,
      indexOptimization: 0.2,
      healthcareCompliance: 0.2,
    };

    let weightedScore = 0;
    Object.entries(components).forEach(([name, health]: [string, any]) => {
      const weight = weights[name as keyof typeof weights] || 0.25;
      weightedScore += health.score * weight;
    });

    return Math.round(weightedScore);
  }

  /**
   * Determine overall status
   */
  private determineOverallStatus(
    score: number,
    alerts: HealthAlert[],
  ): "healthy" | "warning" | "critical" {
    const hasCriticalAlerts = alerts.some(
      (alert) => alert.severity === "critical",
    );

    if (hasCriticalAlerts || score < 60) {
      return "critical";
    } else if (score < 80 || alerts.length > 0) {
      return "warning";
    }

    return "healthy";
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: HealthAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Trigger alert
   */
  private triggerAlert(alert: HealthAlert): void {
    this.alertCallbacks.forEach((callback) => callback(alert));
  }

  /**
   * Get health history
   */
  getHealthHistory(): DatabaseHealthStatus[] {
    return [...this.healthHistory];
  }

  /**
   * Clear health history
   */
  clearHistory(): void {
    this.healthHistory = [];
  }
}

// Global health monitor instance
export const databaseHealthMonitor = new DatabaseHealthMonitor();

/**
 * Database health monitoring middleware
 */
export function createDatabaseHealthMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();

    // Add health monitor to context
    c.set("databaseHealthMonitor", databaseHealthMonitor);

    await next();

    // Record query metrics
    const duration = Date.now() - startTime;
    const endpoint = c.req.path;
    const method = c.req.method;

    // Update performance metrics
    const performanceService = databaseHealthMonitor["performanceService"];
    performanceService.getQueryMonitor().recordQuery({
      query: `${method} ${endpoint}`,
      duration,
      rowsAffected: 1,
      timestamp: new Date(),
      endpoint,
    });
  };
}

/**
 * Database health dashboard middleware
 */
export function createDatabaseHealthDashboardMiddleware() {
  return async (c: Context, next: Next) => {
    if (c.req.path === "/v1/database/health") {
      const health = await databaseHealthMonitor.getCurrentHealth();
      return c.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      });
    }

    if (c.req.path === "/v1/database/health/history") {
      const history = databaseHealthMonitor.getHealthHistory();
      return c.json({
        success: true,
        data: history,
        count: history.length,
        timestamp: new Date().toISOString(),
      });
    }

    await next();
  };
}

export default {
  createDatabaseHealthMiddleware,
  createDatabaseHealthDashboardMiddleware,
  DatabaseHealthMonitor,
  databaseHealthMonitor,
};
