// Monitoring Service for AI Services
// Real-time metrics collection, alerting, and performance analysis

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EnhancedAIService } from "./enhanced-service-base";
import type { AIServiceInput, AIServiceOutput } from "./enhanced-service-base";

// Monitoring Types and Interfaces
export interface MonitoringMetric {
  id: string;
  service: string;
  metric_name: string;
  metric_value: number;
  tags: Record<string, string>;
  metadata: MetricMetadata;
  timestamp: string;
}

export interface MetricMetadata {
  unit?: string;
  source?: string;
  environment?: string;
  version?: string;
  additional_data?: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric_name: string;
  service?: string;
  condition: AlertCondition;
  threshold_value: number;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  notification_channels: string[];
  cooldown_minutes: number;
  metadata: AlertRuleMetadata;
  created_at: string;
  updated_at: string;
}

export interface AlertCondition {
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=" | "contains" | "not_contains";
  time_window_minutes?: number;
  aggregation?: "avg" | "sum" | "min" | "max" | "count" | "rate";
  comparison_type?: "absolute" | "percentage_change" | "moving_average";
}

export interface AlertRuleMetadata {
  category: string;
  owner: string;
  escalation_policy?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface Alert {
  id: string;
  rule_id: string;
  service: string;
  metric_name: string;
  current_value: number;
  threshold_value: number;
  severity: string;
  status: "active" | "acknowledged" | "resolved";
  triggered_at: string;
  resolved_at?: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  message: string;
  context: Record<string, unknown>;
}

export interface MonitoringInput extends AIServiceInput {
  action:
    | "record_metric"
    | "get_metrics"
    | "create_alert_rule"
    | "update_alert_rule"
    | "delete_alert_rule"
    | "list_alert_rules"
    | "get_alerts"
    | "acknowledge_alert"
    | "resolve_alert"
    | "get_service_health"
    | "bulk_record_metrics";

  // Metric recording
  service?: string;
  metric_name?: string;
  metric_value?: number;
  tags?: Record<string, string>;
  metadata?: MetricMetadata;
  bulk_metrics?: {
    service: string;
    metric_name: string;
    metric_value: number;
    tags?: Record<string, string>;
    metadata?: MetricMetadata;
  }[];

  // Querying
  time_range?: {
    start: string;
    end: string;
  };
  filters?: {
    services?: string[];
    metric_names?: string[];
    tags?: Record<string, string>;
  };
  aggregation?: {
    function: "avg" | "sum" | "min" | "max" | "count";
    interval_minutes: number;
  };

  // Alert management
  alert_rule?: Partial<AlertRule>;
  rule_id?: string;
  alert_id?: string;
  acknowledgment_note?: string;
  resolution_note?: string;
}

export interface MonitoringOutput extends AIServiceOutput {
  metric_id?: string;
  metrics?: MonitoringMetric[];
  metric_statistics?: MetricStatistics;
  alert_rule?: AlertRule;
  alert_rules?: AlertRule[];
  alert?: Alert;
  alerts?: Alert[];
  service_health?: ServiceHealthStatus;
  bulk_results?: {
    success: boolean;
    metric_id?: string;
    error?: string;
  }[];
  metrics_recorded?: number;
}

export interface MetricStatistics {
  total_points: number;
  min_value: number;
  max_value: number;
  avg_value: number;
  sum_value: number;
  latest_value: number;
  trend: "increasing" | "decreasing" | "stable";
  rate_of_change?: number;
  percentiles?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

export interface ServiceHealthStatus {
  service: string;
  overall_health: "healthy" | "degraded" | "unhealthy" | "unknown";
  last_check: string;
  metrics_summary: {
    response_time_ms: MetricStatistics;
    error_rate_percent: MetricStatistics;
    throughput_rps: MetricStatistics;
    active_alerts: number;
    uptime_percent: number;
  };
  recent_alerts: Alert[];
  performance_grade: "A" | "B" | "C" | "D" | "F";
  recommendations?: string[];
}

// Monitoring Service Implementation
export class MonitoringService extends EnhancedAIService<
  MonitoringInput,
  MonitoringOutput
> {
  private readonly supabase: SupabaseClient;
  private readonly alertRules: Map<string, AlertRule> = new Map();
  private readonly activeAlerts: Map<string, Alert> = new Map();
  private metricBuffer: MonitoringMetric[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL_MS = 10_000; // 10 seconds
  private readonly ALERT_CHECK_INTERVAL_MS = 30_000; // 30 seconds

  constructor() {
    super("monitoring_service");

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    // Initialize monitoring
    this.initializeMonitoring();
  }

  private async initializeMonitoring(): Promise<void> {
    // Load alert rules into memory
    await this.loadAlertRules();

    // Start background processes
    this.startMetricFlushInterval();
    this.startAlertEvaluationInterval();
  }

  protected async executeCore(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    const startTime = performance.now();

    try {
      switch (input.action) {
        case "record_metric": {
          return await this.recordMetric(input);
        }
        case "get_metrics": {
          return await this.getMetrics(input);
        }
        case "create_alert_rule": {
          return await this.createAlertRule(input);
        }
        case "update_alert_rule": {
          return await this.updateAlertRule(input);
        }
        case "delete_alert_rule": {
          return await this.deleteAlertRule(input);
        }
        case "list_alert_rules": {
          return await this.listAlertRules(input);
        }
        case "get_alerts": {
          return await this.getAlerts(input);
        }
        case "acknowledge_alert": {
          return await this.acknowledgeAlert(input);
        }
        case "resolve_alert": {
          return await this.resolveAlert(input);
        }
        case "get_service_health": {
          return await this.getServiceHealth(input);
        }
        case "bulk_record_metrics": {
          return await this.bulkRecordMetrics(input);
        }
        default: {
          throw new Error(`Unsupported monitoring action: ${input.action}`);
        }
      }
    } finally {
      const duration = performance.now() - startTime;
      this.recordInternalMetric("monitoring_operation_duration", duration, {
        action: input.action,
        buffer_size: this.metricBuffer.length.toString(),
      });
    }
  }

  private async recordMetric(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    if (
      !(input.service && input.metric_name)
      || input.metric_value === undefined
    ) {
      throw new Error("service, metric_name, and metric_value are required");
    }

    const metric: MonitoringMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      service: input.service,
      metric_name: input.metric_name,
      metric_value: input.metric_value,
      tags: input.tags || {},
      metadata: {
        source: "monitoring_service",
        environment: process.env.NODE_ENV || "development",
        ...input.metadata,
      },
      timestamp: new Date().toISOString(),
    };

    // Add to buffer for batch processing
    this.metricBuffer.push(metric);

    // Flush immediately if buffer is full
    if (this.metricBuffer.length >= this.BUFFER_SIZE) {
      await this.flushMetricBuffer();
    }

    // Check for alert conditions
    await this.evaluateAlertsForMetric(metric);

    return {
      success: true,
      metric_id: metric.id,
    };
  }

  private async bulkRecordMetrics(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    if (!input.bulk_metrics || input.bulk_metrics.length === 0) {
      throw new Error("bulk_metrics is required for bulk recording");
    }

    const results: {
      success: boolean;
      metric_id?: string;
      error?: string;
    }[] = [];
    const metrics: MonitoringMetric[] = [];

    for (const metricData of input.bulk_metrics) {
      try {
        if (
          !(metricData.service && metricData.metric_name)
          || metricData.metric_value === undefined
        ) {
          results.push({
            success: false,
            error: "service, metric_name, and metric_value are required",
          });
          continue;
        }

        const metric: MonitoringMetric = {
          id: `metric_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          service: metricData.service,
          metric_name: metricData.metric_name,
          metric_value: metricData.metric_value,
          tags: metricData.tags || {},
          metadata: {
            source: "monitoring_service",
            environment: process.env.NODE_ENV || "development",
            ...metricData.metadata,
          },
          timestamp: new Date().toISOString(),
        };

        metrics.push(metric);
        results.push({ success: true, metric_id: metric.id });
      } catch (error) {
        results.push({
          success: false,
          error: (error as Error).message,
        });
      }
    }

    // Add all metrics to buffer
    this.metricBuffer.push(...metrics);

    // Force flush if buffer is getting full
    if (this.metricBuffer.length >= this.BUFFER_SIZE * 0.8) {
      await this.flushMetricBuffer();
    }

    return {
      success: true,
      bulk_results: results,
      metrics_recorded: metrics.length,
    };
  }

  private async getMetrics(input: MonitoringInput): Promise<MonitoringOutput> {
    let query = this.supabase
      .from("ai_monitoring_metrics")
      .select("*")
      .order("timestamp", {
        ascending: false,
      });

    // Apply time range filter
    if (input.time_range) {
      query = query
        .gte("timestamp", input.time_range.start)
        .lte("timestamp", input.time_range.end);
    }

    // Apply service filter
    if (input.filters?.services && input.filters.services.length > 0) {
      query = query.in("service", input.filters.services);
    }

    // Apply metric name filter
    if (input.filters?.metric_names && input.filters.metric_names.length > 0) {
      query = query.in("metric_name", input.filters.metric_names);
    }

    // Apply tag filters
    if (input.filters?.tags) {
      Object.entries(input.filters.tags).forEach(([key, value]) => {
        query = query.contains("tags", { [key]: value });
      });
    }

    const { data, error } = await query.limit(1000);

    if (error) {
      throw new Error(`Failed to retrieve metrics: ${error.message}`);
    }

    const metrics = data || [];

    // Calculate statistics if requested
    let statistics: MetricStatistics | undefined;
    if (metrics.length > 0) {
      const values = metrics.map((m) => m.metric_value);
      const sortedValues = [...values].sort((a, b) => a - b);

      statistics = {
        total_points: metrics.length,
        min_value: Math.min(...values),
        max_value: Math.max(...values),
        avg_value: values.reduce((a, b) => a + b, 0) / values.length,
        sum_value: values.reduce((a, b) => a + b, 0),
        latest_value: metrics[0].metric_value,
        trend: this.calculateTrend(values),
        percentiles: {
          p50: sortedValues[Math.floor(sortedValues.length * 0.5)],
          p90: sortedValues[Math.floor(sortedValues.length * 0.9)],
          p95: sortedValues[Math.floor(sortedValues.length * 0.95)],
          p99: sortedValues[Math.floor(sortedValues.length * 0.99)],
        },
      };
    }

    return {
      success: true,
      metrics,
      metric_statistics: statistics,
    };
  }

  private async createAlertRule(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    if (!input.alert_rule) {
      throw new Error("alert_rule is required");
    }

    const alertRule: AlertRule = {
      id: `alert_rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: input.alert_rule.name || "Unnamed Alert Rule",
      description: input.alert_rule.description || "",
      metric_name: input.alert_rule.metric_name!,
      service: input.alert_rule.service,
      condition: input.alert_rule.condition!,
      threshold_value: input.alert_rule.threshold_value!,
      severity: input.alert_rule.severity || "medium",
      enabled: input.alert_rule.enabled !== false,
      notification_channels: input.alert_rule.notification_channels || [
        "email",
      ],
      cooldown_minutes: input.alert_rule.cooldown_minutes || 15,
      metadata: {
        category: "custom",
        owner: "system",
        ...input.alert_rule.metadata,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("ai_alert_rules")
      .insert(alertRule)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create alert rule: ${error.message}`);
    }

    // Update in-memory cache
    this.alertRules.set(data.id, data);

    await this.auditLog({
      action: "alert_rule_created",
      resource_type: "alert_rule",
      resource_id: data.id,
      details: {
        rule_name: data.name,
        metric_name: data.metric_name,
        threshold: data.threshold_value,
      },
    });

    return {
      success: true,
      alert_rule: data,
    };
  }

  private async updateAlertRule(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    if (!(input.rule_id && input.alert_rule)) {
      throw new Error("rule_id and alert_rule are required");
    }

    const updateData = {
      ...input.alert_rule,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("ai_alert_rules")
      .update(updateData)
      .eq("id", input.rule_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update alert rule: ${error.message}`);
    }

    // Update in-memory cache
    this.alertRules.set(data.id, data);

    return {
      success: true,
      alert_rule: data,
    };
  }

  private async deleteAlertRule(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    if (!input.rule_id) {
      throw new Error("rule_id is required");
    }

    const { error } = await this.supabase
      .from("ai_alert_rules")
      .delete()
      .eq("id", input.rule_id);

    if (error) {
      throw new Error(`Failed to delete alert rule: ${error.message}`);
    }

    // Remove from in-memory cache
    this.alertRules.delete(input.rule_id);

    return {
      success: true,
    };
  }

  private async listAlertRules(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    let query = this.supabase
      .from("ai_alert_rules")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (input.filters?.services && input.filters.services.length > 0) {
      query = query.in("service", input.filters.services);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list alert rules: ${error.message}`);
    }

    return {
      success: true,
      alert_rules: data || [],
    };
  }

  private async getAlerts(input: MonitoringInput): Promise<MonitoringOutput> {
    let query = this.supabase
      .from("ai_alerts")
      .select("*")
      .order("triggered_at", {
        ascending: false,
      });

    // Apply time range filter
    if (input.time_range) {
      query = query
        .gte("triggered_at", input.time_range.start)
        .lte("triggered_at", input.time_range.end);
    }

    // Apply service filter
    if (input.filters?.services && input.filters.services.length > 0) {
      query = query.in("service", input.filters.services);
    }

    const { data, error } = await query.limit(500);

    if (error) {
      throw new Error(`Failed to retrieve alerts: ${error.message}`);
    }

    return {
      success: true,
      alerts: data || [],
    };
  }

  private async acknowledgeAlert(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    if (!input.alert_id) {
      throw new Error("alert_id is required");
    }

    const { data, error } = await this.supabase
      .from("ai_alerts")
      .update({
        status: "acknowledged",
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: input.user_id || "system",
      })
      .eq("id", input.alert_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to acknowledge alert: ${error.message}`);
    }

    return {
      success: true,
      alert: data,
    };
  }

  private async resolveAlert(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    if (!input.alert_id) {
      throw new Error("alert_id is required");
    }

    const { data, error } = await this.supabase
      .from("ai_alerts")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", input.alert_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }

    // Remove from active alerts
    this.activeAlerts.delete(input.alert_id);

    return {
      success: true,
      alert: data,
    };
  }

  private async getServiceHealth(
    input: MonitoringInput,
  ): Promise<MonitoringOutput> {
    if (!input.service) {
      throw new Error("service is required");
    }

    const { service: service } = input;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    // Get recent metrics for the service
    const { data: metrics, error: metricsError } = await this.supabase
      .from("ai_monitoring_metrics")
      .select("*")
      .eq("service", service)
      .gte("timestamp", oneHourAgo)
      .order("timestamp", { ascending: false });

    if (metricsError) {
      throw new Error(
        `Failed to retrieve service metrics: ${metricsError.message}`,
      );
    }

    // Get active alerts for the service
    const { data: alerts, error: alertsError } = await this.supabase
      .from("ai_alerts")
      .select("*")
      .eq("service", service)
      .eq("status", "active")
      .order("triggered_at", { ascending: false });

    if (alertsError) {
      throw new Error(
        `Failed to retrieve service alerts: ${alertsError.message}`,
      );
    }

    // Calculate health metrics
    const responseTimeMetrics = (metrics || []).filter(
      (m) => m.metric_name === "response_time_ms",
    );
    const errorRateMetrics = (metrics || []).filter(
      (m) => m.metric_name === "error_rate_percent",
    );
    const throughputMetrics = (metrics || []).filter(
      (m) => m.metric_name === "throughput_rps",
    );

    const responseTimeStats = this.calculateMetricStatistics(
      responseTimeMetrics.map((m) => m.metric_value),
    );
    const errorRateStats = this.calculateMetricStatistics(
      errorRateMetrics.map((m) => m.metric_value),
    );
    const throughputStats = this.calculateMetricStatistics(
      throughputMetrics.map((m) => m.metric_value),
    );

    // Determine overall health
    let overallHealth: "healthy" | "degraded" | "unhealthy" | "unknown" = "unknown";
    if (
      responseTimeStats.avg_value > 0
      || errorRateStats.avg_value >= 0
      || throughputStats.avg_value > 0
    ) {
      if ((alerts?.length || 0) === 0 && errorRateStats.avg_value < 5) {
        overallHealth = "healthy";
      } else if (errorRateStats.avg_value < 15 && (alerts?.length || 0) < 5) {
        overallHealth = "degraded";
      } else {
        overallHealth = "unhealthy";
      }
    }

    // Calculate performance grade
    let grade: "A" | "B" | "C" | "D" | "F" = "F";
    if (overallHealth === "healthy") {
      grade = responseTimeStats.avg_value < 1000 ? "A" : "B";
    } else if (overallHealth === "degraded") {
      grade = "C";
    } else if (overallHealth === "unhealthy") {
      grade = "D";
    }

    const healthStatus: ServiceHealthStatus = {
      service,
      overall_health: overallHealth,
      last_check: new Date().toISOString(),
      metrics_summary: {
        response_time_ms: responseTimeStats,
        error_rate_percent: errorRateStats,
        throughput_rps: throughputStats,
        active_alerts: alerts?.length || 0,
        uptime_percent: Math.max(0, 100 - errorRateStats.avg_value),
      },
      recent_alerts: (alerts || []).slice(0, 10),
      performance_grade: grade,
    };

    return {
      success: true,
      service_health: healthStatus,
    };
  }

  private calculateMetricStatistics(values: number[]): MetricStatistics {
    if (values.length === 0) {
      return {
        total_points: 0,
        min_value: 0,
        max_value: 0,
        avg_value: 0,
        sum_value: 0,
        latest_value: 0,
        trend: "stable",
      };
    }

    const sortedValues = [...values].sort((a, b) => a - b);

    return {
      total_points: values.length,
      min_value: Math.min(...values),
      max_value: Math.max(...values),
      avg_value: values.reduce((a, b) => a + b, 0) / values.length,
      sum_value: values.reduce((a, b) => a + b, 0),
      latest_value: values.at(-1),
      trend: this.calculateTrend(values),
      percentiles: {
        p50: sortedValues[Math.floor(sortedValues.length * 0.5)],
        p90: sortedValues[Math.floor(sortedValues.length * 0.9)],
        p95: sortedValues[Math.floor(sortedValues.length * 0.95)],
        p99: sortedValues[Math.floor(sortedValues.length * 0.99)],
      },
    };
  }

  private calculateTrend(
    values: number[],
  ): "increasing" | "decreasing" | "stable" {
    if (values.length < 2) {
      return "stable";
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 5) {
      return "increasing";
    }
    if (changePercent < -5) {
      return "decreasing";
    }
    return "stable";
  }

  private async flushMetricBuffer(): Promise<void> {
    if (this.metricBuffer.length === 0) {
      return;
    }

    const metricsToFlush = [...this.metricBuffer];
    this.metricBuffer = [];

    try {
      const { error } = await this.supabase
        .from("ai_monitoring_metrics")
        .insert(metricsToFlush);

      if (error) {
        // Put metrics back in buffer for retry
        this.metricBuffer.unshift(...metricsToFlush);
      }
    } catch {
      this.metricBuffer.unshift(...metricsToFlush);
    }
  }

  private async loadAlertRules(): Promise<void> {
    const { data, error } = await this.supabase
      .from("ai_alert_rules")
      .select("*")
      .eq("enabled", true);

    if (error) {
      return;
    }

    if (data) {
      this.alertRules.clear();
      data.forEach((rule) => this.alertRules.set(rule.id, rule));
    }
  }

  private async evaluateAlertsForMetric(
    metric: MonitoringMetric,
  ): Promise<void> {
    const relevantRules = [...this.alertRules.values()].filter(
      (rule) =>
        rule.enabled
        && rule.metric_name === metric.metric_name
        && (!rule.service || rule.service === metric.service),
    );

    for (const rule of relevantRules) {
      const shouldAlert = this.evaluateAlertCondition(metric, rule);

      if (shouldAlert && !this.isInCooldown(rule)) {
        await this.triggerAlert(metric, rule);
      }
    }
  }

  private evaluateAlertCondition(
    metric: MonitoringMetric,
    rule: AlertRule,
  ): boolean {
    const { operator, threshold_value } = rule;
    const { metric_value: value } = metric;

    switch (operator) {
      case ">": {
        return value > threshold_value;
      }
      case "<": {
        return value < threshold_value;
      }
      case ">=": {
        return value >= threshold_value;
      }
      case "<=": {
        return value <= threshold_value;
      }
      case "==": {
        return value === threshold_value;
      }
      case "!=": {
        return value !== threshold_value;
      }
      default: {
        return false;
      }
    }
  }

  private isInCooldown(rule: AlertRule): boolean {
    const existingAlert = [...this.activeAlerts.values()].find(
      (alert) =>
        alert.rule_id === rule.id
        && alert.status === "active"
        && Date.now() - new Date(alert.triggered_at).getTime()
          < rule.cooldown_minutes * 60 * 1000,
    );

    return !!existingAlert;
  }

  private async triggerAlert(
    metric: MonitoringMetric,
    rule: AlertRule,
  ): Promise<void> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      rule_id: rule.id,
      service: metric.service,
      metric_name: metric.metric_name,
      current_value: metric.metric_value,
      threshold_value: rule.threshold_value,
      severity: rule.severity,
      status: "active",
      triggered_at: new Date().toISOString(),
      message:
        `${rule.name}: ${metric.metric_name} is ${metric.metric_value} (threshold: ${rule.threshold_value})`,
      context: {
        metric_tags: metric.tags,
        rule_condition: rule.condition,
        service: metric.service,
      },
    };

    // Store in database
    const { error } = await this.supabase.from("ai_alerts").insert(alert);

    if (error) {
      return;
    }

    // Store in memory
    this.activeAlerts.set(alert.id, alert);

    // Send notifications (implement as needed)
    await this.sendAlertNotification(alert, rule);
  }

  private async sendAlertNotification(
    _alert: Alert,
    _rule: AlertRule,
  ): Promise<void> {
    // In a real implementation, this would send emails, Slack messages, etc.
    // based on rule.notification_channels
  }

  private recordInternalMetric(
    metricName: string,
    value: number,
    tags: Record<string, string> = {},
  ): void {
    // Use setTimeout to avoid blocking the main execution
    setTimeout(() => {
      this.recordMetric({
        action: "record_metric",
        service: "monitoring_service",
        metric_name: metricName,
        metric_value: value,
        tags,
      }).catch(console.error);
    }, 0);
  }

  private startMetricFlushInterval(): void {
    setInterval(async () => {
      await this.flushMetricBuffer();
    }, this.FLUSH_INTERVAL_MS);
  }

  private startAlertEvaluationInterval(): void {
    setInterval(async () => {
      try {
        await this.loadAlertRules();
      } catch {}
    }, this.ALERT_CHECK_INTERVAL_MS);
  }

  // Helper methods for easy metric recording
  public async recordPerformanceMetric(
    service: string,
    operation: string,
    durationMs: number,
    tags: Record<string, string> = {},
  ): Promise<boolean> {
    const result = await this.execute({
      action: "record_metric",
      service,
      metric_name: "response_time_ms",
      metric_value: durationMs,
      tags: { operation, ...tags },
    });

    return result.success;
  }

  public async recordErrorRate(
    service: string,
    errorRate: number,
    tags: Record<string, string> = {},
  ): Promise<boolean> {
    const result = await this.execute({
      action: "record_metric",
      service,
      metric_name: "error_rate_percent",
      metric_value: errorRate,
      tags,
    });

    return result.success;
  }

  public async recordThroughput(
    service: string,
    requestsPerSecond: number,
    tags: Record<string, string> = {},
  ): Promise<boolean> {
    const result = await this.execute({
      action: "record_metric",
      service,
      metric_name: "throughput_rps",
      metric_value: requestsPerSecond,
      tags,
    });

    return result.success;
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
