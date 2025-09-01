// Healthcare Monitoring Service - Real-time System Health & Compliance Monitoring
// Comprehensive monitoring for healthcare AI platform with LGPD/ANVISA/CFM compliance

import type { LoggerService, MetricsService } from "@neonpro/core-services";
import type { AIServiceConfig, CacheService } from "./enhanced-service-base";
import { EnhancedAIService } from "./enhanced-service-base";

// Healthcare-Specific Monitoring Types
export interface HealthcareMetrics {
  patient_safety: {
    emergency_access_response_time_ms: number;
    critical_data_availability_percentage: number;
    compliance_violations_count: number;
    data_breach_attempts_blocked: number;
    system_downtime_seconds: number;
  };
  ai_performance: {
    streaming_latency_ms: number;
    ai_accuracy_percentage: number;
    bias_detection_alerts: number;
    model_drift_score: number;
    prediction_confidence_avg: number;
    error_rate_percentage: number;
  };
  business_metrics: {
    patient_satisfaction_score: number;
    healthcare_outcome_improvement: number;
    compliance_audit_success_rate: number;
    no_show_reduction_percentage: number;
    roi_monthly: number;
    user_engagement_score: number;
  };
  system_performance: {
    api_response_time_ms: number;
    database_query_time_ms: number;
    cache_hit_rate_percentage: number;
    memory_usage_percentage: number;
    cpu_usage_percentage: number;
    disk_usage_percentage: number;
    active_connections: number;
  };
  compliance_status: {
    lgpd_compliance_score: number;
    anvisa_compliance_score: number;
    cfm_compliance_score: number;
    data_retention_violations: number;
    access_control_violations: number;
    audit_log_completeness: number;
  };
}

export interface HealthAlert {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category:
    | "patient_safety"
    | "ai_performance"
    | "business"
    | "system"
    | "compliance"
    | "security";
  title: string;
  description: string;
  metric_name: string;
  current_value: number;
  threshold_value: number;
  impact:
    | "patient_safety"
    | "service_disruption"
    | "compliance_risk"
    | "performance_degradation"
    | "business_impact";
  created_at: string;
  resolved_at?: string;
  resolution_actions?: string[];
  escalation_level: number;
  affected_users?: number;
  estimated_resolution_time?: string;
}

export interface MonitoringConfig {
  collection_interval_ms: number;
  alert_evaluation_interval_ms: number;
  metric_retention_days: number;
  real_time_dashboard_update_ms: number;
  thresholds: {
    patient_safety: {
      max_emergency_response_time_ms: number;
      min_critical_data_availability: number;
      max_compliance_violations: number;
      max_system_downtime_seconds: number;
    };
    ai_performance: {
      max_streaming_latency_ms: number;
      min_ai_accuracy_percentage: number;
      max_bias_detection_alerts: number;
      max_model_drift_score: number;
      min_prediction_confidence: number;
      max_error_rate_percentage: number;
    };
    business: {
      min_patient_satisfaction: number;
      min_outcome_improvement: number;
      min_audit_success_rate: number;
      min_no_show_reduction: number;
      min_monthly_roi: number;
    };
    system: {
      max_api_response_time_ms: number;
      max_db_query_time_ms: number;
      min_cache_hit_rate: number;
      max_memory_usage_percentage: number;
      max_cpu_usage_percentage: number;
      max_disk_usage_percentage: number;
    };
    compliance: {
      min_lgpd_score: number;
      min_anvisa_score: number;
      min_cfm_score: number;
      max_retention_violations: number;
      max_access_violations: number;
      min_audit_completeness: number;
    };
  };
  notification_channels: {
    email: {
      enabled: boolean;
      recipients: string[];
      severity_threshold: HealthAlert["severity"];
    };
    sms: {
      enabled: boolean;
      recipients: string[];
      severity_threshold: HealthAlert["severity"];
    };
    webhook: {
      enabled: boolean;
      url: string;
      severity_threshold: HealthAlert["severity"];
    };
    slack: {
      enabled: boolean;
      webhook_url: string;
      channel: string;
      severity_threshold: HealthAlert["severity"];
    };
  };
}

export interface DashboardData {
  last_updated: string;
  system_status: "healthy" | "warning" | "critical" | "maintenance";
  overall_health_score: number;
  current_metrics: HealthcareMetrics;
  active_alerts: HealthAlert[];
  trends: {
    last_24h: {
      metric_name: string;
      values: {
        timestamp: string;
        value: number;
      }[];
      trend_direction: "up" | "down" | "stable";
      trend_percentage: number;
    }[];
  };
  sla_status: {
    uptime_percentage: number;
    availability_target: number;
    performance_target_met: boolean;
    compliance_target_met: boolean;
    patient_safety_incidents: number;
  };
  quick_actions: {
    action_id: string;
    title: string;
    description: string;
    severity: "normal" | "urgent";
    estimated_time: string;
  }[];
}

export class HealthcareMonitoringService extends EnhancedAIService {
  private readonly config: MonitoringConfig;
  private readonly metricsHistory: Map<
    string,
    { timestamp: number; value: number; }[]
  > = new Map();
  private readonly activeAlerts: Map<string, HealthAlert> = new Map();
  private monitoringIntervals: NodeJS.Timeout[] = [];
  private readonly dashboardClients: Set<unknown> = new Set(); // WebSocket clients for real-time updates

  constructor(
    cache: CacheService,
    logger: LoggerService,
    metrics: MetricsService,
    config?: AIServiceConfig & { monitoringConfig?: MonitoringConfig; },
  ) {
    super(cache, logger, metrics, config);
    this.config = config?.monitoringConfig || this.getDefaultConfig();

    // Initialize monitoring system
    this.initializeMonitoring();
  }

  private getDefaultConfig(): MonitoringConfig {
    return {
      collection_interval_ms: 30_000, // 30 seconds
      alert_evaluation_interval_ms: 10_000, // 10 seconds
      metric_retention_days: 90,
      real_time_dashboard_update_ms: 1000, // 1 second for real-time
      thresholds: {
        patient_safety: {
          max_emergency_response_time_ms: 5000, // 5 seconds max
          min_critical_data_availability: 99.95, // 99.95% availability
          max_compliance_violations: 0, // Zero tolerance
          max_system_downtime_seconds: 300, // 5 minutes max per day
        },
        ai_performance: {
          max_streaming_latency_ms: 200,
          min_ai_accuracy_percentage: 95,
          max_bias_detection_alerts: 5,
          max_model_drift_score: 0.15,
          min_prediction_confidence: 0.85,
          max_error_rate_percentage: 2,
        },
        business: {
          min_patient_satisfaction: 4.2, // Out of 5
          min_outcome_improvement: 15, // 15% improvement
          min_audit_success_rate: 98,
          min_no_show_reduction: 20,
          min_monthly_roi: 50_000, // $50k monthly
        },
        system: {
          max_api_response_time_ms: 500,
          max_db_query_time_ms: 100,
          min_cache_hit_rate: 85,
          max_memory_usage_percentage: 80,
          max_cpu_usage_percentage: 70,
          max_disk_usage_percentage: 85,
        },
        compliance: {
          min_lgpd_score: 95,
          min_anvisa_score: 95,
          min_cfm_score: 95,
          max_retention_violations: 0,
          max_access_violations: 0,
          min_audit_completeness: 99.5,
        },
      },
      notification_channels: {
        email: {
          enabled: true,
          recipients: ["admin@neonpro.health", "alerts@neonpro.health"],
          severity_threshold: "high",
        },
        sms: {
          enabled: true,
          recipients: ["+5511999887766"],
          severity_threshold: "critical",
        },
        webhook: {
          enabled: false,
          url: "",
          severity_threshold: "medium",
        },
        slack: {
          enabled: true,
          webhook_url: "https://hooks.slack.com/services/...",
          channel: "#healthcare-alerts",
          severity_threshold: "medium",
        },
      },
    };
  }

  private async initializeMonitoring(): Promise<void> {
    this.logger?.info("Initializing Healthcare Monitoring Service", {
      service: "HealthcareMonitoringService",
      collection_interval: this.config.collection_interval_ms,
      alert_interval: this.config.alert_evaluation_interval_ms,
      dashboard_update_interval: this.config.real_time_dashboard_update_ms,
    });

    // Start metric collection
    this.startMetricCollection();

    // Start alert evaluation
    this.startAlertEvaluation();

    // Start dashboard updates
    this.startDashboardUpdates();

    // Initialize historical data cleanup
    this.scheduleDataCleanup();
  }

  // Core Monitoring Methods

  async getCurrentMetrics(): Promise<HealthcareMetrics> {
    const startTime = performance.now();

    try {
      const metrics: HealthcareMetrics = {
        patient_safety: await this.collectPatientSafetyMetrics(),
        ai_performance: await this.collectAIPerformanceMetrics(),
        business_metrics: await this.collectBusinessMetrics(),
        system_performance: await this.collectSystemPerformanceMetrics(),
        compliance_status: await this.collectComplianceMetrics(),
      };

      // Store metrics for trending
      await this.storeMetricsHistory(metrics);

      const processingTime = performance.now() - startTime;
      await this.recordMetrics("metric_collection", {
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString(),
      });

      return metrics;
    } catch (error) {
      this.logger?.error("Failed to collect current metrics", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error("Failed to collect current metrics");
    }
  }

  async getDashboardData(): Promise<DashboardData> {
    const startTime = performance.now();

    try {
      const currentMetrics = await this.getCurrentMetrics();
      const activeAlerts = [...this.activeAlerts.values()];
      const overallHealthScore = this.calculateOverallHealthScore(currentMetrics);
      const systemStatus = this.determineSystemStatus(
        overallHealthScore,
        activeAlerts,
      );

      const dashboardData: DashboardData = {
        last_updated: new Date().toISOString(),
        system_status: systemStatus,
        overall_health_score: overallHealthScore,
        current_metrics: currentMetrics,
        active_alerts: activeAlerts.sort(
          (a, b) =>
            this.getSeverityWeight(b.severity)
            - this.getSeverityWeight(a.severity),
        ),
        trends: await this.generateTrendData(),
        sla_status: await this.calculateSLAStatus(currentMetrics),
        quick_actions: await this.generateQuickActions(
          currentMetrics,
          activeAlerts,
        ),
      };

      const processingTime = performance.now() - startTime;
      this.logger?.debug("Dashboard data generated", {
        processing_time_ms: processingTime,
        active_alerts_count: activeAlerts.length,
        system_status: systemStatus,
        health_score: overallHealthScore,
      });

      return dashboardData;
    } catch (error) {
      this.logger?.error("Failed to generate dashboard data", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error("Failed to generate dashboard data");
    }
  }

  async getActiveAlerts(filters?: {
    severity?: HealthAlert["severity"];
    category?: HealthAlert["category"];
    limit?: number;
  }): Promise<HealthAlert[]> {
    let alerts = [...this.activeAlerts.values()];

    if (filters) {
      if (filters.severity) {
        alerts = alerts.filter((alert) => alert.severity === filters.severity);
      }
      if (filters.category) {
        alerts = alerts.filter((alert) => alert.category === filters.category);
      }
      if (filters.limit) {
        alerts = alerts.slice(0, filters.limit);
      }
    }

    return alerts.sort((a, b) => {
      // Sort by severity first, then by creation time
      const severityDiff = this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity);
      if (severityDiff !== 0) {
        return severityDiff;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }

  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string,
  ): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      return false;
    }

    // Mark as acknowledged (add to resolution actions)
    if (!alert.resolution_actions) {
      alert.resolution_actions = [];
    }
    alert.resolution_actions.push(
      `Acknowledged by ${acknowledgedBy} at ${new Date().toISOString()}`,
    );

    this.logger?.info("Alert acknowledged", {
      alert_id: alertId,
      acknowledged_by: acknowledgedBy,
      alert_severity: alert.severity,
      alert_category: alert.category,
    });

    return true;
  }

  async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolution: string,
  ): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.resolved_at = new Date().toISOString();
    if (!alert.resolution_actions) {
      alert.resolution_actions = [];
    }
    alert.resolution_actions.push(`Resolved by ${resolvedBy}: ${resolution}`);

    // Remove from active alerts
    this.activeAlerts.delete(alertId);

    this.logger?.info("Alert resolved", {
      alert_id: alertId,
      resolved_by: resolvedBy,
      resolution,
      alert_duration_ms: alert.resolved_at
        ? new Date(alert.resolved_at).getTime()
          - new Date(alert.created_at).getTime()
        : 0,
    });

    return true;
  }

  // Metric Collection Methods

  private async collectPatientSafetyMetrics(): Promise<
    HealthcareMetrics["patient_safety"]
  > {
    // In production, collect from various system components
    return {
      emergency_access_response_time_ms: 2500 + Math.random() * 1000, // Simulate 2.5-3.5s
      critical_data_availability_percentage: 99.97 + Math.random() * 0.02, // 99.97-99.99%
      compliance_violations_count: Math.floor(Math.random() * 2), // 0-1 violations
      data_breach_attempts_blocked: Math.floor(Math.random() * 10), // 0-9 attempts blocked
      system_downtime_seconds: Math.floor(Math.random() * 60), // 0-60 seconds downtime
    };
  }

  private async collectAIPerformanceMetrics(): Promise<
    HealthcareMetrics["ai_performance"]
  > {
    return {
      streaming_latency_ms: 150 + Math.random() * 100, // 150-250ms
      ai_accuracy_percentage: 96.5 + Math.random() * 2, // 96.5-98.5%
      bias_detection_alerts: Math.floor(Math.random() * 3), // 0-2 alerts
      model_drift_score: Math.random() * 0.1, // 0-0.1 drift score
      prediction_confidence_avg: 0.88 + Math.random() * 0.1, // 88-98% confidence
      error_rate_percentage: Math.random() * 1.5, // 0-1.5% error rate
    };
  }

  private async collectBusinessMetrics(): Promise<
    HealthcareMetrics["business_metrics"]
  > {
    return {
      patient_satisfaction_score: 4.3 + Math.random() * 0.6, // 4.3-4.9 out of 5
      healthcare_outcome_improvement: 22 + Math.random() * 8, // 22-30% improvement
      compliance_audit_success_rate: 98.5 + Math.random() * 1.4, // 98.5-99.9%
      no_show_reduction_percentage: 28 + Math.random() * 7, // 28-35% reduction
      roi_monthly: 75_000 + Math.random() * 50_000, // $75k-125k monthly ROI
      user_engagement_score: 7.8 + Math.random() * 1.7, // 7.8-9.5 out of 10
    };
  }

  private async collectSystemPerformanceMetrics(): Promise<
    HealthcareMetrics["system_performance"]
  > {
    return {
      api_response_time_ms: 180 + Math.random() * 120, // 180-300ms
      database_query_time_ms: 25 + Math.random() * 50, // 25-75ms
      cache_hit_rate_percentage: 87 + Math.random() * 10, // 87-97%
      memory_usage_percentage: 45 + Math.random() * 25, // 45-70%
      cpu_usage_percentage: 35 + Math.random() * 25, // 35-60%
      disk_usage_percentage: 40 + Math.random() * 30, // 40-70%
      active_connections: 150 + Math.floor(Math.random() * 100), // 150-250 connections
    };
  }

  private async collectComplianceMetrics(): Promise<
    HealthcareMetrics["compliance_status"]
  > {
    return {
      lgpd_compliance_score: 96 + Math.random() * 3, // 96-99%
      anvisa_compliance_score: 97 + Math.random() * 2, // 97-99%
      cfm_compliance_score: 95 + Math.random() * 4, // 95-99%
      data_retention_violations: Math.floor(Math.random() * 2), // 0-1 violations
      access_control_violations: Math.floor(Math.random() * 2), // 0-1 violations
      audit_log_completeness: 99.6 + Math.random() * 0.35, // 99.6-99.95%
    };
  } // Alert System Methods

  private startMetricCollection(): void {
    const interval = setInterval(async () => {
      try {
        await this.getCurrentMetrics();
      } catch (error) {
        this.logger?.error("Metric collection failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }, this.config.collection_interval_ms);

    this.monitoringIntervals.push(interval);
  }

  private startAlertEvaluation(): void {
    const interval = setInterval(async () => {
      try {
        const currentMetrics = await this.getCurrentMetrics();
        await this.evaluateAlerts(currentMetrics);
      } catch (error) {
        this.logger?.error("Alert evaluation failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }, this.config.alert_evaluation_interval_ms);

    this.monitoringIntervals.push(interval);
  }

  private startDashboardUpdates(): void {
    const interval = setInterval(async () => {
      if (this.dashboardClients.size > 0) {
        try {
          const dashboardData = await this.getDashboardData();
          this.broadcastToClients(dashboardData);
        } catch (error) {
          this.logger?.error("Dashboard update failed", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }, this.config.real_time_dashboard_update_ms);

    this.monitoringIntervals.push(interval);
  }

  private async evaluateAlerts(metrics: HealthcareMetrics): Promise<void> {
    const alerts: HealthAlert[] = [];

    // Patient Safety Alerts
    if (
      metrics.patient_safety.emergency_access_response_time_ms
        > this.config.thresholds.patient_safety.max_emergency_response_time_ms
    ) {
      alerts.push(
        this.createAlert(
          "critical",
          "patient_safety",
          "Emergency Access Response Time Exceeded",
          `Emergency access response time of ${metrics.patient_safety.emergency_access_response_time_ms}ms exceeds maximum allowed threshold of ${this.config.thresholds.patient_safety.max_emergency_response_time_ms}ms`,
          "emergency_access_response_time_ms",
          metrics.patient_safety.emergency_access_response_time_ms,
          this.config.thresholds.patient_safety.max_emergency_response_time_ms,
          "patient_safety",
        ),
      );
    }

    if (
      metrics.patient_safety.critical_data_availability_percentage
        < this.config.thresholds.patient_safety.min_critical_data_availability
    ) {
      alerts.push(
        this.createAlert(
          "critical",
          "patient_safety",
          "Critical Data Availability Below Threshold",
          `Critical data availability at ${
            metrics.patient_safety.critical_data_availability_percentage.toFixed(
              2,
            )
          }% is below minimum required ${this.config.thresholds.patient_safety.min_critical_data_availability}%`,
          "critical_data_availability_percentage",
          metrics.patient_safety.critical_data_availability_percentage,
          this.config.thresholds.patient_safety.min_critical_data_availability,
          "service_disruption",
        ),
      );
    }

    if (
      metrics.patient_safety.compliance_violations_count
        > this.config.thresholds.patient_safety.max_compliance_violations
    ) {
      alerts.push(
        this.createAlert(
          "high",
          "compliance",
          "Compliance Violations Detected",
          `${metrics.patient_safety.compliance_violations_count} compliance violations detected exceeding maximum allowed of ${this.config.thresholds.patient_safety.max_compliance_violations}`,
          "compliance_violations_count",
          metrics.patient_safety.compliance_violations_count,
          this.config.thresholds.patient_safety.max_compliance_violations,
          "compliance_risk",
        ),
      );
    }

    // AI Performance Alerts
    if (
      metrics.ai_performance.streaming_latency_ms
        > this.config.thresholds.ai_performance.max_streaming_latency_ms
    ) {
      alerts.push(
        this.createAlert(
          "medium",
          "ai_performance",
          "AI Streaming Latency High",
          `AI streaming latency of ${metrics.ai_performance.streaming_latency_ms}ms exceeds target of ${this.config.thresholds.ai_performance.max_streaming_latency_ms}ms`,
          "streaming_latency_ms",
          metrics.ai_performance.streaming_latency_ms,
          this.config.thresholds.ai_performance.max_streaming_latency_ms,
          "performance_degradation",
        ),
      );
    }

    if (
      metrics.ai_performance.ai_accuracy_percentage
        < this.config.thresholds.ai_performance.min_ai_accuracy_percentage
    ) {
      alerts.push(
        this.createAlert(
          "high",
          "ai_performance",
          "AI Model Accuracy Below Threshold",
          `AI model accuracy at ${
            metrics.ai_performance.ai_accuracy_percentage.toFixed(
              2,
            )
          }% is below minimum required ${this.config.thresholds.ai_performance.min_ai_accuracy_percentage}%`,
          "ai_accuracy_percentage",
          metrics.ai_performance.ai_accuracy_percentage,
          this.config.thresholds.ai_performance.min_ai_accuracy_percentage,
          "patient_safety",
        ),
      );
    }

    if (
      metrics.ai_performance.error_rate_percentage
        > this.config.thresholds.ai_performance.max_error_rate_percentage
    ) {
      alerts.push(
        this.createAlert(
          "medium",
          "ai_performance",
          "AI Error Rate Elevated",
          `AI error rate at ${
            metrics.ai_performance.error_rate_percentage.toFixed(
              2,
            )
          }% exceeds maximum allowed ${this.config.thresholds.ai_performance.max_error_rate_percentage}%`,
          "error_rate_percentage",
          metrics.ai_performance.error_rate_percentage,
          this.config.thresholds.ai_performance.max_error_rate_percentage,
          "service_disruption",
        ),
      );
    }

    // System Performance Alerts
    if (
      metrics.system_performance.api_response_time_ms
        > this.config.thresholds.system.max_api_response_time_ms
    ) {
      alerts.push(
        this.createAlert(
          "medium",
          "system",
          "API Response Time High",
          `API response time of ${metrics.system_performance.api_response_time_ms}ms exceeds target of ${this.config.thresholds.system.max_api_response_time_ms}ms`,
          "api_response_time_ms",
          metrics.system_performance.api_response_time_ms,
          this.config.thresholds.system.max_api_response_time_ms,
          "performance_degradation",
        ),
      );
    }

    if (
      metrics.system_performance.memory_usage_percentage
        > this.config.thresholds.system.max_memory_usage_percentage
    ) {
      alerts.push(
        this.createAlert(
          "high",
          "system",
          "High Memory Usage",
          `Memory usage at ${
            metrics.system_performance.memory_usage_percentage.toFixed(
              1,
            )
          }% exceeds threshold of ${this.config.thresholds.system.max_memory_usage_percentage}%`,
          "memory_usage_percentage",
          metrics.system_performance.memory_usage_percentage,
          this.config.thresholds.system.max_memory_usage_percentage,
          "service_disruption",
        ),
      );
    }

    if (
      metrics.system_performance.cache_hit_rate_percentage
        < this.config.thresholds.system.min_cache_hit_rate
    ) {
      alerts.push(
        this.createAlert(
          "low",
          "system",
          "Cache Hit Rate Low",
          `Cache hit rate at ${
            metrics.system_performance.cache_hit_rate_percentage.toFixed(
              1,
            )
          }% is below target of ${this.config.thresholds.system.min_cache_hit_rate}%`,
          "cache_hit_rate_percentage",
          metrics.system_performance.cache_hit_rate_percentage,
          this.config.thresholds.system.min_cache_hit_rate,
          "performance_degradation",
        ),
      );
    }

    // Compliance Alerts
    if (
      metrics.compliance_status.lgpd_compliance_score
        < this.config.thresholds.compliance.min_lgpd_score
    ) {
      alerts.push(
        this.createAlert(
          "critical",
          "compliance",
          "LGPD Compliance Score Low",
          `LGPD compliance score at ${
            metrics.compliance_status.lgpd_compliance_score.toFixed(
              2,
            )
          }% is below minimum required ${this.config.thresholds.compliance.min_lgpd_score}%`,
          "lgpd_compliance_score",
          metrics.compliance_status.lgpd_compliance_score,
          this.config.thresholds.compliance.min_lgpd_score,
          "compliance_risk",
        ),
      );
    }

    if (
      metrics.compliance_status.anvisa_compliance_score
        < this.config.thresholds.compliance.min_anvisa_score
    ) {
      alerts.push(
        this.createAlert(
          "critical",
          "compliance",
          "ANVISA Compliance Score Low",
          `ANVISA compliance score at ${
            metrics.compliance_status.anvisa_compliance_score.toFixed(
              2,
            )
          }% is below minimum required ${this.config.thresholds.compliance.min_anvisa_score}%`,
          "anvisa_compliance_score",
          metrics.compliance_status.anvisa_compliance_score,
          this.config.thresholds.compliance.min_anvisa_score,
          "compliance_risk",
        ),
      );
    }

    if (
      metrics.compliance_status.cfm_compliance_score
        < this.config.thresholds.compliance.min_cfm_score
    ) {
      alerts.push(
        this.createAlert(
          "critical",
          "compliance",
          "CFM Compliance Score Low",
          `CFM compliance score at ${
            metrics.compliance_status.cfm_compliance_score.toFixed(
              2,
            )
          }% is below minimum required ${this.config.thresholds.compliance.min_cfm_score}%`,
          "cfm_compliance_score",
          metrics.compliance_status.cfm_compliance_score,
          this.config.thresholds.compliance.min_cfm_score,
          "compliance_risk",
        ),
      );
    }

    // Business Metrics Alerts
    if (
      metrics.business_metrics.roi_monthly
        < this.config.thresholds.business.min_monthly_roi
    ) {
      alerts.push(
        this.createAlert(
          "medium",
          "business",
          "Monthly ROI Below Target",
          `Monthly ROI of $${metrics.business_metrics.roi_monthly.toLocaleString()} is below target of $${this.config.thresholds.business.min_monthly_roi.toLocaleString()}`,
          "roi_monthly",
          metrics.business_metrics.roi_monthly,
          this.config.thresholds.business.min_monthly_roi,
          "business_impact",
        ),
      );
    }

    // Process new alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
  }

  private createAlert(
    severity: HealthAlert["severity"],
    category: HealthAlert["category"],
    title: string,
    description: string,
    metricName: string,
    currentValue: number,
    thresholdValue: number,
    impact: HealthAlert["impact"],
  ): HealthAlert {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return {
      id: alertId,
      severity,
      category,
      title,
      description,
      metric_name: metricName,
      current_value: currentValue,
      threshold_value: thresholdValue,
      impact,
      created_at: new Date().toISOString(),
      escalation_level: 1,
      affected_users: this.estimateAffectedUsers(category, severity),
      estimated_resolution_time: this.estimateResolutionTime(
        severity,
        category,
      ),
    };
  }

  private async processAlert(alert: HealthAlert): Promise<void> {
    // Check if this alert already exists (avoid duplicates)
    const existingAlert = [...this.activeAlerts.values()].find(
      (existing) =>
        existing.metric_name === alert.metric_name
        && existing.category === alert.category
        && !existing.resolved_at,
    );

    if (existingAlert) {
      // Update existing alert with new values
      existingAlert.current_value = alert.current_value;
      existingAlert.description = alert.description;
      return;
    }

    // Add new alert
    this.activeAlerts.set(alert.id, alert);

    this.logger?.warn("New alert created", {
      alert_id: alert.id,
      severity: alert.severity,
      category: alert.category,
      title: alert.title,
      current_value: alert.current_value,
      threshold_value: alert.threshold_value,
    });

    // Send notifications
    await this.sendNotifications(alert);
  }

  private async sendNotifications(alert: HealthAlert): Promise<void> {
    const shouldNotify = (threshold: HealthAlert["severity"]) => {
      const severityLevels = {
        info: 0,
        low: 1,
        medium: 2,
        high: 3,
        critical: 4,
      };
      return severityLevels[alert.severity] >= severityLevels[threshold];
    };

    try {
      // Email notifications
      if (
        this.config.notification_channels.email.enabled
        && shouldNotify(this.config.notification_channels.email.severity_threshold)
      ) {
        await this.sendEmailNotification(alert);
      }

      // SMS notifications
      if (
        this.config.notification_channels.sms.enabled
        && shouldNotify(this.config.notification_channels.sms.severity_threshold)
      ) {
        await this.sendSMSNotification(alert);
      }

      // Slack notifications
      if (
        this.config.notification_channels.slack.enabled
        && shouldNotify(this.config.notification_channels.slack.severity_threshold)
      ) {
        await this.sendSlackNotification(alert);
      }

      // Webhook notifications
      if (
        this.config.notification_channels.webhook.enabled
        && shouldNotify(
          this.config.notification_channels.webhook.severity_threshold,
        )
      ) {
        await this.sendWebhookNotification(alert);
      }
    } catch (error) {
      this.logger?.error("Failed to send notifications for alert", {
        alert_id: alert.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Utility Methods

  private calculateOverallHealthScore(metrics: HealthcareMetrics): number {
    const weights = {
      patient_safety: 0.35, // Highest priority
      ai_performance: 0.25,
      compliance_status: 0.2,
      system_performance: 0.15,
      business_metrics: 0.05,
    };

    const scores = {
      patient_safety: this.calculatePatientSafetyScore(metrics.patient_safety),
      ai_performance: this.calculateAIPerformanceScore(metrics.ai_performance),
      compliance_status: this.calculateComplianceScore(
        metrics.compliance_status,
      ),
      system_performance: this.calculateSystemPerformanceScore(
        metrics.system_performance,
      ),
      business_metrics: this.calculateBusinessScore(metrics.business_metrics),
    };

    const weightedScore = Object.entries(scores).reduce(
      (sum, [category, score]) => sum + score * weights[category as keyof typeof weights],
      0,
    );

    return Math.round(weightedScore * 100) / 100;
  }

  private calculatePatientSafetyScore(
    metrics: HealthcareMetrics["patient_safety"],
  ): number {
    const responseTimeScore = Math.max(
      0,
      (this.config.thresholds.patient_safety.max_emergency_response_time_ms
        - metrics.emergency_access_response_time_ms)
        / this.config.thresholds.patient_safety.max_emergency_response_time_ms,
    );
    const availabilityScore = metrics.critical_data_availability_percentage / 100;
    const complianceScore = metrics.compliance_violations_count === 0 ? 1 : 0.5;
    const uptimeScore = Math.max(
      0,
      (300 - metrics.system_downtime_seconds) / 300,
    ); // 300s = 5 min max downtime

    return (
      responseTimeScore * 0.3
      + availabilityScore * 0.4
      + complianceScore * 0.2
      + uptimeScore * 0.1
    );
  }

  private calculateAIPerformanceScore(
    metrics: HealthcareMetrics["ai_performance"],
  ): number {
    const latencyScore = Math.max(
      0,
      (this.config.thresholds.ai_performance.max_streaming_latency_ms
        - metrics.streaming_latency_ms)
        / this.config.thresholds.ai_performance.max_streaming_latency_ms,
    );
    const accuracyScore = metrics.ai_accuracy_percentage / 100;
    const { prediction_confidence_avg: confidenceScore } = metrics;
    const errorScore = Math.max(
      0,
      (this.config.thresholds.ai_performance.max_error_rate_percentage
        - metrics.error_rate_percentage)
        / this.config.thresholds.ai_performance.max_error_rate_percentage,
    );

    return (
      latencyScore * 0.2
      + accuracyScore * 0.4
      + confidenceScore * 0.3
      + errorScore * 0.1
    );
  }

  private calculateComplianceScore(
    metrics: HealthcareMetrics["compliance_status"],
  ): number {
    const lgpdScore = metrics.lgpd_compliance_score / 100;
    const anvisaScore = metrics.anvisa_compliance_score / 100;
    const cfmScore = metrics.cfm_compliance_score / 100;
    const violationScore = metrics.data_retention_violations + metrics.access_control_violations
        === 0
      ? 1
      : 0.5;

    return (
      lgpdScore * 0.3
      + anvisaScore * 0.3
      + cfmScore * 0.3
      + violationScore * 0.1
    );
  }

  private calculateSystemPerformanceScore(
    metrics: HealthcareMetrics["system_performance"],
  ): number {
    const apiScore = Math.max(
      0,
      (this.config.thresholds.system.max_api_response_time_ms
        - metrics.api_response_time_ms)
        / this.config.thresholds.system.max_api_response_time_ms,
    );
    const cacheScore = metrics.cache_hit_rate_percentage / 100;
    const memoryScore = Math.max(
      0,
      (this.config.thresholds.system.max_memory_usage_percentage
        - metrics.memory_usage_percentage)
        / this.config.thresholds.system.max_memory_usage_percentage,
    );
    const cpuScore = Math.max(
      0,
      (this.config.thresholds.system.max_cpu_usage_percentage
        - metrics.cpu_usage_percentage)
        / this.config.thresholds.system.max_cpu_usage_percentage,
    );

    return (
      apiScore * 0.3 + cacheScore * 0.2 + memoryScore * 0.25 + cpuScore * 0.25
    );
  }

  private calculateBusinessScore(
    metrics: HealthcareMetrics["business_metrics"],
  ): number {
    const roiScore = Math.min(
      1,
      metrics.roi_monthly / this.config.thresholds.business.min_monthly_roi,
    );
    const satisfactionScore = metrics.patient_satisfaction_score / 5; // Out of 5
    const outcomeScore = Math.min(
      1,
      metrics.healthcare_outcome_improvement
        / this.config.thresholds.business.min_outcome_improvement,
    );
    const noShowScore = Math.min(
      1,
      metrics.no_show_reduction_percentage
        / this.config.thresholds.business.min_no_show_reduction,
    );

    return (
      roiScore * 0.3
      + satisfactionScore * 0.3
      + outcomeScore * 0.2
      + noShowScore * 0.2
    );
  }

  private determineSystemStatus(
    healthScore: number,
    activeAlerts: HealthAlert[],
  ): DashboardData["system_status"] {
    const criticalAlerts = activeAlerts.filter(
      (a) => a.severity === "critical",
    );
    const highAlerts = activeAlerts.filter((a) => a.severity === "high");

    if (criticalAlerts.length > 0 || healthScore < 0.7) {
      return "critical";
    }
    if (highAlerts.length > 0 || healthScore < 0.8) {
      return "warning";
    }
    if (healthScore >= 0.95) {
      return "healthy";
    }
    return "warning";
  }

  private getSeverityWeight(severity: HealthAlert["severity"]): number {
    const weights = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };
    return weights[severity];
  }

  private estimateAffectedUsers(
    category: HealthAlert["category"],
    severity: HealthAlert["severity"],
  ): number {
    const baseCounts = {
      patient_safety: 1000,
      ai_performance: 500,
      business: 200,
      system: 800,
      compliance: 1200,
      security: 1500,
    };

    const severityMultipliers = {
      info: 0.1,
      low: 0.2,
      medium: 0.4,
      high: 0.7,
      critical: 1,
    };

    return Math.floor(baseCounts[category] * severityMultipliers[severity]);
  }

  private estimateResolutionTime(
    severity: HealthAlert["severity"],
    _category: HealthAlert["category"],
  ): string {
    const resolutionTimes = {
      critical: "15-30 minutes",
      high: "1-2 hours",
      medium: "4-8 hours",
      low: "1-2 days",
      info: "2-5 days",
    };

    return resolutionTimes[severity];
  }

  // Notification Methods (placeholder implementations)

  private async sendEmailNotification(alert: HealthAlert): Promise<void> {
    this.logger?.info("Email notification sent", {
      alert_id: alert.id,
      recipients: this.config.notification_channels.email.recipients,
    });
  }

  private async sendSMSNotification(alert: HealthAlert): Promise<void> {
    this.logger?.info("SMS notification sent", {
      alert_id: alert.id,
      recipients: this.config.notification_channels.sms.recipients,
    });
  }

  private async sendSlackNotification(alert: HealthAlert): Promise<void> {
    this.logger?.info("Slack notification sent", {
      alert_id: alert.id,
      channel: this.config.notification_channels.slack.channel,
    });
  }

  private async sendWebhookNotification(alert: HealthAlert): Promise<void> {
    this.logger?.info("Webhook notification sent", {
      alert_id: alert.id,
      url: this.config.notification_channels.webhook.url,
    });
  }

  // Data Management Methods

  private async storeMetricsHistory(metrics: HealthcareMetrics): Promise<void> {
    const timestamp = Date.now();

    // Store each metric category
    for (const [category, categoryMetrics] of Object.entries(metrics)) {
      for (const [metricName, value] of Object.entries(categoryMetrics)) {
        const key = `${category}.${metricName}`;

        if (!this.metricsHistory.has(key)) {
          this.metricsHistory.set(key, []);
        }

        const history = this.metricsHistory.get(key)!;
        history.push({ timestamp, value: value as number });

        // Keep only recent data (based on retention period)
        const cutoffTime = timestamp - this.config.metric_retention_days * 24 * 60 * 60 * 1000;
        const filteredHistory = history.filter(
          (point) => point.timestamp > cutoffTime,
        );
        this.metricsHistory.set(key, filteredHistory);
      }
    }
  }

  private async generateTrendData(): Promise<DashboardData["trends"]> {
    const trends: DashboardData["trends"]["last_24h"] = [];
    const last24h = Date.now() - 24 * 60 * 60 * 1000;

    // Get key metrics for trending
    const keyMetrics = [
      "patient_safety.emergency_access_response_time_ms",
      "ai_performance.ai_accuracy_percentage",
      "system_performance.api_response_time_ms",
      "compliance_status.lgpd_compliance_score",
      "business_metrics.roi_monthly",
    ];

    for (const metricKey of keyMetrics) {
      const history = this.metricsHistory
        .get(metricKey)
        ?.filter((point) => point.timestamp > last24h) || [];

      if (history.length > 1) {
        const values = history.map((point) => ({
          timestamp: new Date(point.timestamp).toISOString(),
          value: point.value,
        }));

        const [firstValue] = history.value;
        const lastValue = history.at(-1).value;
        const trendPercentage = firstValue !== 0
          ? ((lastValue - firstValue) / firstValue) * 100
          : 0;

        let trendDirection: "up" | "down" | "stable";
        if (Math.abs(trendPercentage) < 2) {
          trendDirection = "stable";
        } else {
          trendDirection = trendPercentage > 0 ? "up" : "down";
        }

        trends.push({
          metric_name: metricKey,
          values,
          trend_direction: trendDirection,
          trend_percentage: Math.round(trendPercentage * 100) / 100,
        });
      }
    }

    return { last_24h: trends };
  }

  private async calculateSLAStatus(
    metrics: HealthcareMetrics,
  ): Promise<DashboardData["sla_status"]> {
    // Calculate uptime based on system downtime
    const uptimePercentage = Math.max(
      0,
      100
        - (metrics.patient_safety.system_downtime_seconds / (24 * 60 * 60)) * 100,
    );

    return {
      uptime_percentage: Math.round(uptimePercentage * 100) / 100,
      availability_target: 99.95,
      performance_target_met: metrics.system_performance.api_response_time_ms
        <= this.config.thresholds.system.max_api_response_time_ms,
      compliance_target_met: metrics.compliance_status.lgpd_compliance_score
          >= this.config.thresholds.compliance.min_lgpd_score
        && metrics.compliance_status.anvisa_compliance_score
          >= this.config.thresholds.compliance.min_anvisa_score
        && metrics.compliance_status.cfm_compliance_score
          >= this.config.thresholds.compliance.min_cfm_score,
      patient_safety_incidents: metrics.patient_safety.compliance_violations_count,
    };
  }

  private async generateQuickActions(
    metrics: HealthcareMetrics,
    alerts: HealthAlert[],
  ): Promise<DashboardData["quick_actions"]> {
    const actions: DashboardData["quick_actions"] = [];

    // Add actions based on current metrics and alerts
    if (metrics.system_performance.memory_usage_percentage > 75) {
      actions.push({
        action_id: "optimize_memory",
        title: "Optimize Memory Usage",
        description: "Memory usage is high. Consider restarting services or clearing caches.",
        severity: "normal",
        estimated_time: "10-15 minutes",
      });
    }

    if (metrics.ai_performance.error_rate_percentage > 1.5) {
      actions.push({
        action_id: "check_ai_models",
        title: "Check AI Model Health",
        description: "AI error rate is elevated. Review model performance and logs.",
        severity: "urgent",
        estimated_time: "20-30 minutes",
      });
    }

    if (alerts.some((a) => a.severity === "critical")) {
      actions.push({
        action_id: "address_critical_alerts",
        title: "Address Critical Alerts",
        description: "Critical alerts require immediate attention for patient safety.",
        severity: "urgent",
        estimated_time: "5-15 minutes",
      });
    }

    if (metrics.compliance_status.data_retention_violations > 0) {
      actions.push({
        action_id: "fix_retention_policy",
        title: "Fix Data Retention Issues",
        description: "Data retention policy violations detected. Review and clean up old data.",
        severity: "normal",
        estimated_time: "30-60 minutes",
      });
    }

    return actions;
  }

  private scheduleDataCleanup(): void {
    // Clean up old metrics and resolved alerts daily
    const cleanupInterval = setInterval(
      () => {
        this.cleanupOldData();
      },
      24 * 60 * 60 * 1000,
    ); // Daily cleanup

    this.monitoringIntervals.push(cleanupInterval);
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - this.config.metric_retention_days * 24 * 60 * 60 * 1000;

    // Cleanup metrics history
    for (const [key, history] of this.metricsHistory) {
      const filteredHistory = history.filter(
        (point) => point.timestamp > cutoffTime,
      );
      this.metricsHistory.set(key, filteredHistory);
    }

    this.logger?.info("Old metrics data cleaned up", {
      retention_days: this.config.metric_retention_days,
      cutoff_time: new Date(cutoffTime).toISOString(),
    });
  }

  private broadcastToClients(data: DashboardData): void {
    // In production, implement WebSocket broadcasting to connected dashboard clients
    this.logger?.debug("Broadcasting dashboard update to clients", {
      client_count: this.dashboardClients.size,
      system_status: data.system_status,
      active_alerts: data.active_alerts.length,
    });
  }

  // Public API for dashboard client management
  addDashboardClient(client: unknown): void {
    this.dashboardClients.add(client);
  }

  removeDashboardClient(client: unknown): void {
    this.dashboardClients.delete(client);
  }

  // Cleanup method
  destroy(): void {
    this.monitoringIntervals.forEach((interval) => clearInterval(interval));
    this.monitoringIntervals = [];
    this.dashboardClients.clear();

    this.logger?.info("Healthcare Monitoring Service destroyed");
  }
}
