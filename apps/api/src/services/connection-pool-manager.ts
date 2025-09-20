/**
 * Connection Pool Manager Service
 * T080 - Database Performance Tuning
 *
 * Features:
 * - Dynamic connection pool optimization
 * - Healthcare workload-specific pool management
 * - Connection health monitoring and alerting
 * - Pool size recommendations based on usage patterns
 * - Brazilian healthcare compliance monitoring
 */

import { HEALTHCARE_POOL_CONFIG } from "../utils/query-optimizer";

// Connection pool metrics
export interface PoolMetrics {
  active: number;
  idle: number;
  waiting: number;
  total: number;
  utilization: number;
  averageWaitTime: number;
  connectionErrors: number;
  healthScore: number; // 0-100
}

// Pool configuration
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

// Pool optimization recommendation
export interface PoolOptimization {
  currentConfig: PoolConfig;
  recommendedConfig: PoolConfig;
  reasoning: string[];
  estimatedImprovement: number; // Percentage
  healthcareImpact: "low" | "medium" | "high";
  implementationRisk: "low" | "medium" | "high";
}

// Healthcare workload patterns
export const HEALTHCARE_WORKLOAD_PATTERNS = {
  peakHours: {
    start: 8, // 8 AM
    end: 18, // 6 PM
    multiplier: 2.5,
    description: "Peak clinic hours with high appointment activity",
  },
  lunchBreak: {
    start: 12, // 12 PM
    end: 14, // 2 PM
    multiplier: 0.7,
    description: "Reduced activity during lunch break",
  },
  afterHours: {
    start: 19, // 7 PM
    end: 7, // 7 AM
    multiplier: 0.3,
    description: "Minimal activity - emergency access only",
  },
  weekends: {
    multiplier: 0.4,
    description: "Reduced weekend activity for most clinics",
  },
};

// Connection pool alerts
export interface PoolAlert {
  type:
    | "high_utilization"
    | "connection_errors"
    | "timeout_exceeded"
    | "health_degraded";
  severity: "warning" | "critical";
  message: string;
  metrics: PoolMetrics;
  timestamp: Date;
  healthcareImpact: string;
}

/**
 * Connection Pool Manager Service
 */
export class ConnectionPoolManager {
  private currentConfig: PoolConfig;
  private metrics: PoolMetrics;
  private alertCallbacks: ((alert: PoolAlert) => void)[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private metricsHistory: PoolMetrics[] = [];
  private maxHistorySize = 288; // 24 hours of 5-minute intervals

  constructor(initialConfig?: PoolConfig) {
    this.currentConfig = initialConfig || { ...HEALTHCARE_POOL_CONFIG };
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize default metrics
   */
  private initializeMetrics(): PoolMetrics {
    return {
      active: 0,
      idle: this.currentConfig.min,
      waiting: 0,
      total: this.currentConfig.min,
      utilization: 0,
      averageWaitTime: 0,
      connectionErrors: 0,
      healthScore: 100,
    };
  }

  /**
   * Get current pool metrics
   */
  getMetrics(): PoolMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current pool configuration
   */
  getConfig(): PoolConfig {
    return { ...this.currentConfig };
  }

  /**
   * Update pool metrics (would be called by actual pool implementation)
   */
  updateMetrics(newMetrics: Partial<PoolMetrics>): void {
    this.metrics = { ...this.metrics, ...newMetrics };
    this.metrics.utilization = (this.metrics.active / this.metrics.total) * 100;
    this.metrics.healthScore = this.calculateHealthScore();

    // Store in history
    this.metricsHistory.push({ ...this.metrics });
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // Check for alerts
    this.checkForAlerts();
  }

  /**
   * Calculate pool health score
   */
  private calculateHealthScore(): number {
    let score = 100;

    // Penalize high utilization
    if (this.metrics.utilization > 90) {
      score -= 30;
    } else if (this.metrics.utilization > 80) {
      score -= 15;
    }

    // Penalize waiting connections
    if (this.metrics.waiting > 5) {
      score -= 20;
    } else if (this.metrics.waiting > 2) {
      score -= 10;
    }

    // Penalize high wait times
    if (this.metrics.averageWaitTime > 1000) {
      // 1 second
      score -= 25;
    } else if (this.metrics.averageWaitTime > 500) {
      // 500ms
      score -= 10;
    }

    // Penalize connection errors
    score -= this.metrics.connectionErrors * 5;

    return Math.max(0, score);
  }

  /**
   * Check for alert conditions
   */
  private checkForAlerts(): void {
    const alerts: PoolAlert[] = [];

    // High utilization alert
    if (this.metrics.utilization > 85) {
      alerts.push({
        type: "high_utilization",
        severity: this.metrics.utilization >= 95 ? "critical" : "warning",
        message: `Connection pool utilization at ${this.metrics.utilization.toFixed(1)}%`,
        metrics: { ...this.metrics },
        timestamp: new Date(),
        healthcareImpact: "Patient appointment scheduling may be affected",
      });
    }

    // Connection errors alert
    if (this.metrics.connectionErrors > 0) {
      alerts.push({
        type: "connection_errors",
        severity: this.metrics.connectionErrors > 5 ? "critical" : "warning",
        message: `${this.metrics.connectionErrors} connection errors detected`,
        metrics: { ...this.metrics },
        timestamp: new Date(),
        healthcareImpact: "Healthcare data access may be intermittent",
      });
    }

    // Timeout exceeded alert
    if (this.metrics.averageWaitTime > 2000) {
      // 2 seconds
      alerts.push({
        type: "timeout_exceeded",
        severity: "critical",
        message: `Average wait time ${this.metrics.averageWaitTime}ms exceeds threshold`,
        metrics: { ...this.metrics },
        timestamp: new Date(),
        healthcareImpact:
          "Patient data queries experiencing significant delays",
      });
    }

    // Health degraded alert
    if (this.metrics.healthScore < 70) {
      alerts.push({
        type: "health_degraded",
        severity: this.metrics.healthScore < 50 ? "critical" : "warning",
        message: `Pool health score dropped to ${this.metrics.healthScore}`,
        metrics: { ...this.metrics },
        timestamp: new Date(),
        healthcareImpact: "Overall database performance degraded",
      });
    }

    // Trigger alert callbacks
    alerts.forEach((alert) => {
      this.alertCallbacks.forEach((callback) => callback(alert));
    });
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: PoolAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Generate pool optimization recommendations
   */
  generateOptimizationRecommendations(): PoolOptimization {
    const reasoning: string[] = [];
    const recommendedConfig = { ...this.currentConfig };
    let estimatedImprovement = 0;
    let healthcareImpact: "low" | "medium" | "high" = "low";
    let implementationRisk: "low" | "medium" | "high" = "low";

    // Analyze utilization patterns
    const avgUtilization = this.getAverageUtilization();

    if (avgUtilization > 80) {
      // High utilization - recommend increasing pool size
      const increase = Math.ceil(this.currentConfig.max * 0.3);
      recommendedConfig.max = this.currentConfig.max + increase;
      recommendedConfig.min = Math.min(
        recommendedConfig.min + 2,
        recommendedConfig.max,
      );

      reasoning.push(
        `High utilization (${avgUtilization.toFixed(
          1,
        )}%) - increase max connections to ${recommendedConfig.max}`,
      );
      estimatedImprovement += 25;
      healthcareImpact = "high";
      implementationRisk = "medium";
    } else if (avgUtilization < 30) {
      // Low utilization - recommend decreasing pool size
      const decrease = Math.floor(this.currentConfig.max * 0.2);
      const newMax = Math.max(
        this.currentConfig.max - decrease,
        this.currentConfig.min + 5,
      );

      // Only recommend decrease if it would actually be lower
      if (newMax < this.currentConfig.max) {
        recommendedConfig.max = newMax;
        reasoning.push(
          `Low utilization (${avgUtilization.toFixed(
            1,
          )}%) - reduce max connections to ${recommendedConfig.max}`,
        );
        estimatedImprovement += 10;
        healthcareImpact = "low";
        implementationRisk = "low";
      }
    }

    // Analyze wait times
    if (this.metrics.averageWaitTime > 500) {
      recommendedConfig.acquireTimeoutMillis = Math.min(
        this.currentConfig.acquireTimeoutMillis * 1.5,
        60000, // Max 60 seconds
      );

      reasoning.push(
        `High wait times - increase acquire timeout to ${recommendedConfig.acquireTimeoutMillis}ms`,
      );
      estimatedImprovement += 15;
      healthcareImpact = "medium";
    }

    // Healthcare-specific optimizations
    const currentHour = new Date().getHours();
    const isPeakHours =
      currentHour >= HEALTHCARE_WORKLOAD_PATTERNS.peakHours.start &&
      currentHour <= HEALTHCARE_WORKLOAD_PATTERNS.peakHours.end;

    if (isPeakHours && recommendedConfig.max < 25) {
      recommendedConfig.max = Math.max(recommendedConfig.max, 25);
      reasoning.push(
        "Peak healthcare hours - ensure adequate connections for appointment scheduling",
      );
      healthcareImpact = "high";
    }

    // Connection timeout optimizations for healthcare
    if (recommendedConfig.createTimeoutMillis > 15000) {
      recommendedConfig.createTimeoutMillis = 15000; // 15 seconds max for healthcare
      reasoning.push(
        "Healthcare workload - reduce connection creation timeout for faster response",
      );
      estimatedImprovement += 5;
    }

    // Idle timeout optimization
    if (recommendedConfig.idleTimeoutMillis > 600000) {
      // 10 minutes
      recommendedConfig.idleTimeoutMillis = 300000; // 5 minutes for healthcare
      reasoning.push(
        "Healthcare workload - reduce idle timeout to free resources faster",
      );
      estimatedImprovement += 5;
    }

    if (reasoning.length === 0) {
      reasoning.push("Current configuration is optimal for current workload");
    }

    return {
      currentConfig: this.currentConfig,
      recommendedConfig,
      reasoning,
      estimatedImprovement,
      healthcareImpact,
      implementationRisk,
    };
  }

  /**
   * Get average utilization from history
   */
  private getAverageUtilization(): number {
    if (this.metricsHistory.length === 0) {
      return this.metrics.utilization;
    }

    const sum = this.metricsHistory.reduce(
      (acc, metrics) => acc + metrics.utilization,
      0,
    );
    return sum / this.metricsHistory.length;
  }

  /**
   * Apply configuration changes
   */
  applyConfiguration(newConfig: PoolConfig): void {
    this.currentConfig = { ...newConfig };
    console.log(
      "Applied new connection pool configuration:",
      this.currentConfig,
    );
  }

  /**
   * Start monitoring
   */
  startMonitoring(intervalMs: number = 300000): void {
    // 5 minutes default
    this.monitoringInterval = setInterval(() => {
      // In a real implementation, this would collect actual metrics from the pool
      this.simulateMetricsUpdate();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Simulate metrics update (for testing/demo purposes)
   */
  private simulateMetricsUpdate(): void {
    const currentHour = new Date().getHours();
    const isPeakHours = currentHour >= 8 && currentHour <= 18;
    const baseLoad = isPeakHours ? 0.6 : 0.2;
    const randomVariation = Math.random() * 0.3;

    const targetUtilization = Math.min(95, (baseLoad + randomVariation) * 100);
    const active = Math.floor(
      (targetUtilization / 100) * this.currentConfig.max,
    );
    const idle = this.currentConfig.max - active;
    const waiting = targetUtilization > 85 ? Math.floor(Math.random() * 5) : 0;

    this.updateMetrics({
      active,
      idle,
      waiting,
      total: this.currentConfig.max,
      averageWaitTime:
        waiting > 0 ? 200 + Math.random() * 800 : Math.random() * 100,
      connectionErrors: Math.random() < 0.05 ? 1 : 0, // 5% chance of error
    });
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(): PoolMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Clear metrics history
   */
  clearHistory(): void {
    this.metricsHistory = [];
  }
}

export default ConnectionPoolManager;
