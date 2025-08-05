/**
 * NeonPro - API Gateway Monitoring System
 * Comprehensive monitoring, metrics and health checking system
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import type {
  ApiGatewayMetrics,
  ApiGatewayHealthCheck,
  ApiGatewayLogger,
  ApiGatewayEvent,
  ApiGatewayRequestContext,
  ApiGatewayResponseContext,
} from "./types";

/**
 * Metrics Collector
 * Collects and aggregates API Gateway metrics
 */
export class ApiGatewayMetricsCollector implements ApiGatewayMetrics {
  private metrics: Map<string, any> = new Map();
  private logger?: ApiGatewayLogger;
  private startTime: number;
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private gauges: Map<string, number> = new Map();
  private timers: Map<string, { start: number; end?: number }[]> = new Map();

  constructor(logger?: ApiGatewayLogger) {
    this.logger = logger;
    this.startTime = Date.now();

    // Initialize default metrics
    this.initializeDefaultMetrics();

    // Collect system metrics every 30 seconds
    setInterval(() => this.collectSystemMetrics(), 30000);
  }

  /**
   * Record request metrics
   */
  recordRequest(context: ApiGatewayRequestContext): void {
    const labels = {
      method: context.method,
      path: context.path,
      clientId: context.clientId || "anonymous",
      version: context.version || "v1",
    };

    this.incrementCounter("requests_total", labels);
    this.incrementCounter(`requests_by_method_${context.method.toLowerCase()}`);
    this.incrementCounter(`requests_by_client_${context.clientId || "anonymous"}`);

    // Start request timer
    this.startTimer(`request_${context.requestId}`);

    this.logger?.debug("Request metrics recorded", { requestId: context.requestId, labels });
  }

  /**
   * Record response metrics
   */
  recordResponse(context: ApiGatewayResponseContext): void {
    const statusCode = context.statusCode || 200;
    const statusClass = Math.floor(statusCode / 100);

    const labels = {
      method: context.method,
      path: context.path,
      statusCode: statusCode.toString(),
      statusClass: `${statusClass}xx`,
    };

    this.incrementCounter("responses_total", labels);
    this.incrementCounter(`responses_${statusClass}xx`);
    this.incrementCounter(`responses_status_${statusCode}`);

    // Record response time
    const duration = this.endTimer(`request_${context.requestId}`);
    if (duration !== null) {
      this.recordHistogram("request_duration_ms", duration, labels);
      this.recordHistogram(`request_duration_${context.method.toLowerCase()}`, duration);
    }

    // Record response size if available
    if (context.responseSize) {
      this.recordHistogram("response_size_bytes", context.responseSize, labels);
    }

    this.logger?.debug("Response metrics recorded", {
      requestId: context.requestId,
      statusCode,
      duration,
    });
  }

  /**
   * Record error metrics
   */
  recordError(error: Error, context?: Partial<ApiGatewayRequestContext>): void {
    const labels = {
      errorType: error.constructor.name,
      errorMessage: error.message,
      method: context?.method || "unknown",
      path: context?.path || "unknown",
    };

    this.incrementCounter("errors_total", labels);
    this.incrementCounter(`errors_by_type_${error.constructor.name}`);

    this.logger?.error("Error metrics recorded", error, labels);
  }

  /**
   * Record rate limit metrics
   */
  recordRateLimit(clientId: string, limit: number, remaining: number, resetTime: number): void {
    const labels = { clientId };

    this.incrementCounter("rate_limit_checks_total", labels);
    this.setGauge(`rate_limit_remaining_${clientId}`, remaining);
    this.setGauge(`rate_limit_limit_${clientId}`, limit);
    this.setGauge(`rate_limit_reset_${clientId}`, resetTime);

    if (remaining === 0) {
      this.incrementCounter("rate_limit_exceeded_total", labels);
    }
  }

  /**
   * Record cache metrics
   */
  recordCacheHit(key: string, ttl?: number): void {
    this.incrementCounter("cache_hits_total");
    this.incrementCounter("cache_operations_total", { operation: "hit" });

    if (ttl) {
      this.recordHistogram("cache_ttl_seconds", ttl / 1000);
    }
  }

  recordCacheMiss(key: string): void {
    this.incrementCounter("cache_misses_total");
    this.incrementCounter("cache_operations_total", { operation: "miss" });
  }

  /**
   * Get all metrics
   */
  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};

    // Add counters
    for (const [key, value] of this.counters.entries()) {
      metrics[key] = value;
    }

    // Add gauges
    for (const [key, value] of this.gauges.entries()) {
      metrics[key] = value;
    }

    // Add histogram statistics
    for (const [key, values] of this.histograms.entries()) {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        metrics[`${key}_count`] = values.length;
        metrics[`${key}_sum`] = values.reduce((a, b) => a + b, 0);
        metrics[`${key}_avg`] = metrics[`${key}_sum`] / values.length;
        metrics[`${key}_min`] = sorted[0];
        metrics[`${key}_max`] = sorted[sorted.length - 1];
        metrics[`${key}_p50`] = this.percentile(sorted, 0.5);
        metrics[`${key}_p95`] = this.percentile(sorted, 0.95);
        metrics[`${key}_p99`] = this.percentile(sorted, 0.99);
      }
    }

    // Add system metrics
    metrics.uptime_seconds = (Date.now() - this.startTime) / 1000;
    metrics.timestamp = Date.now();

    return metrics;
  }

  /**
   * Get metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    const metrics = this.getMetrics();
    const lines: string[] = [];

    for (const [key, value] of Object.entries(metrics)) {
      if (typeof value === "number") {
        lines.push(`# TYPE ${key} gauge`);
        lines.push(`${key} ${value}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
    this.gauges.clear();
    this.timers.clear();
    this.startTime = Date.now();

    this.initializeDefaultMetrics();

    this.logger?.info("Metrics reset");
  }

  /**
   * Increment counter
   */
  private incrementCounter(name: string, labels?: Record<string, string>): void {
    const key = labels ? `${name}{${this.labelsToString(labels)}}` : name;
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
  }

  /**
   * Set gauge value
   */
  private setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = labels ? `${name}{${this.labelsToString(labels)}}` : name;
    this.gauges.set(key, value);
  }

  /**
   * Record histogram value
   */
  private recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = labels ? `${name}{${this.labelsToString(labels)}}` : name;
    const values = this.histograms.get(key) || [];
    values.push(value);

    // Keep only last 1000 values to prevent memory issues
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }

    this.histograms.set(key, values);
  }

  /**
   * Start timer
   */
  private startTimer(name: string): void {
    const timers = this.timers.get(name) || [];
    timers.push({ start: Date.now() });
    this.timers.set(name, timers);
  }

  /**
   * End timer and return duration
   */
  private endTimer(name: string): number | null {
    const timers = this.timers.get(name);
    if (!timers || timers.length === 0) {
      return null;
    }

    const timer = timers[timers.length - 1];
    if (timer.end) {
      return null; // Already ended
    }

    timer.end = Date.now();
    const duration = timer.end - timer.start;

    // Clean up old timers
    if (timers.length > 100) {
      timers.splice(0, timers.length - 100);
    }

    return duration;
  }

  /**
   * Convert labels to string
   */
  private labelsToString(labels: Record<string, string>): string {
    return Object.entries(labels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(",");
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedArray: number[], p: number): number {
    const index = (sortedArray.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= sortedArray.length) {
      return sortedArray[sortedArray.length - 1];
    }

    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * Initialize default metrics
   */
  private initializeDefaultMetrics(): void {
    this.setGauge("gateway_info", 1, {
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    });
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    try {
      // Memory usage
      if (typeof process !== "undefined" && process.memoryUsage) {
        const memory = process.memoryUsage();
        this.setGauge("process_memory_rss_bytes", memory.rss);
        this.setGauge("process_memory_heap_used_bytes", memory.heapUsed);
        this.setGauge("process_memory_heap_total_bytes", memory.heapTotal);
        this.setGauge("process_memory_external_bytes", memory.external);
      }

      // CPU usage (if available)
      if (typeof process !== "undefined" && process.cpuUsage) {
        const cpu = process.cpuUsage();
        this.setGauge("process_cpu_user_seconds_total", cpu.user / 1000000);
        this.setGauge("process_cpu_system_seconds_total", cpu.system / 1000000);
      }
    } catch (error) {
      this.logger?.error("System metrics collection error", error as Error);
    }
  }
}

/**
 * Health Check Manager
 * Manages health checks for API Gateway components
 */
export class ApiGatewayHealthCheckManager implements ApiGatewayHealthCheck {
  private checks: Map<string, () => Promise<{ status: "healthy" | "unhealthy"; details?: any }>> =
    new Map();
  private logger?: ApiGatewayLogger;
  private lastResults: Map<
    string,
    { status: "healthy" | "unhealthy"; details?: any; timestamp: number }
  > = new Map();
  private checkInterval: number;
  private intervalId?: NodeJS.Timeout;

  constructor(checkInterval: number = 30000, logger?: ApiGatewayLogger) {
    this.checkInterval = checkInterval;
    this.logger = logger;

    // Register default health checks
    this.registerDefaultChecks();

    // Start periodic health checks
    this.startPeriodicChecks();
  }

  /**
   * Register a health check
   */
  registerCheck(
    name: string,
    check: () => Promise<{ status: "healthy" | "unhealthy"; details?: any }>,
  ): void {
    this.checks.set(name, check);
    this.logger?.info("Health check registered", { name });
  }

  /**
   * Unregister a health check
   */
  unregisterCheck(name: string): void {
    this.checks.delete(name);
    this.lastResults.delete(name);
    this.logger?.info("Health check unregistered", { name });
  }

  /**
   * Run all health checks
   */
  async runChecks(): Promise<{
    status: "healthy" | "unhealthy";
    checks: Record<string, { status: "healthy" | "unhealthy"; details?: any; timestamp: number }>;
    timestamp: number;
  }> {
    const results: Record<
      string,
      { status: "healthy" | "unhealthy"; details?: any; timestamp: number }
    > = {};
    let overallStatus: "healthy" | "unhealthy" = "healthy";

    for (const [name, check] of this.checks.entries()) {
      try {
        const result = await Promise.race([
          check(),
          new Promise<{ status: "unhealthy"; details: any }>((_, reject) =>
            setTimeout(() => reject(new Error("Health check timeout")), 5000),
          ),
        ]);

        const resultWithTimestamp = {
          ...result,
          timestamp: Date.now(),
        };

        results[name] = resultWithTimestamp;
        this.lastResults.set(name, resultWithTimestamp);

        if (result.status === "unhealthy") {
          overallStatus = "unhealthy";
        }
      } catch (error) {
        const errorResult = {
          status: "unhealthy" as const,
          details: { error: (error as Error).message },
          timestamp: Date.now(),
        };

        results[name] = errorResult;
        this.lastResults.set(name, errorResult);
        overallStatus = "unhealthy";

        this.logger?.error("Health check failed", error as Error, { checkName: name });
      }
    }

    const healthStatus = {
      status: overallStatus,
      checks: results,
      timestamp: Date.now(),
    };

    this.logger?.debug("Health checks completed", {
      status: overallStatus,
      checkCount: Object.keys(results).length,
    });

    return healthStatus;
  }

  /**
   * Get last health check results
   */
  getLastResults(): {
    status: "healthy" | "unhealthy";
    checks: Record<string, { status: "healthy" | "unhealthy"; details?: any; timestamp: number }>;
    timestamp: number;
  } {
    const results: Record<
      string,
      { status: "healthy" | "unhealthy"; details?: any; timestamp: number }
    > = {};
    let overallStatus: "healthy" | "unhealthy" = "healthy";
    let latestTimestamp = 0;

    for (const [name, result] of this.lastResults.entries()) {
      results[name] = result;

      if (result.status === "unhealthy") {
        overallStatus = "unhealthy";
      }

      if (result.timestamp > latestTimestamp) {
        latestTimestamp = result.timestamp;
      }
    }

    return {
      status: overallStatus,
      checks: results,
      timestamp: latestTimestamp || Date.now(),
    };
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      try {
        await this.runChecks();
      } catch (error) {
        this.logger?.error("Periodic health check error", error as Error);
      }
    }, this.checkInterval);

    this.logger?.info("Periodic health checks started", { interval: this.checkInterval });
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.logger?.info("Periodic health checks stopped");
    }
  }

  /**
   * Register default health checks
   */
  private registerDefaultChecks(): void {
    // Memory usage check
    this.registerCheck("memory", async () => {
      if (typeof process === "undefined" || !process.memoryUsage) {
        return { status: "healthy", details: { message: "Memory monitoring not available" } };
      }

      const memory = process.memoryUsage();
      const heapUsedMB = memory.heapUsed / 1024 / 1024;
      const heapTotalMB = memory.heapTotal / 1024 / 1024;
      const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

      const status = heapUsagePercent > 90 ? "unhealthy" : "healthy";

      return {
        status,
        details: {
          heapUsedMB: Math.round(heapUsedMB),
          heapTotalMB: Math.round(heapTotalMB),
          heapUsagePercent: Math.round(heapUsagePercent),
          rssMB: Math.round(memory.rss / 1024 / 1024),
        },
      };
    });

    // Event loop lag check
    this.registerCheck("event_loop", async () => {
      return new Promise((resolve) => {
        const start = Date.now();
        setImmediate(() => {
          const lag = Date.now() - start;
          const status = lag > 100 ? "unhealthy" : "healthy";

          resolve({
            status,
            details: {
              lagMs: lag,
              threshold: 100,
            },
          });
        });
      });
    });

    // Uptime check
    this.registerCheck("uptime", async () => {
      const uptimeSeconds =
        typeof process !== "undefined" && process.uptime
          ? process.uptime()
          : (Date.now() - this.lastResults.get("uptime")?.timestamp || Date.now()) / 1000;

      return {
        status: "healthy",
        details: {
          uptimeSeconds: Math.round(uptimeSeconds),
          uptimeHours: Math.round((uptimeSeconds / 3600) * 100) / 100,
        },
      };
    });
  }
}

/**
 * Monitoring Middleware
 * Middleware for collecting request/response metrics
 */
export class MonitoringMiddleware {
  static create(config: {
    metrics: ApiGatewayMetricsCollector;
    healthCheck?: ApiGatewayHealthCheckManager;
    collectRequestBody?: boolean;
    collectResponseBody?: boolean;
    excludePaths?: string[];
  }): any {
    return {
      name: "monitoring",
      order: 1, // Run early to capture all requests
      enabled: true,
      config,
      handler: async (context: any, next: () => Promise<void>) => {
        const startTime = Date.now();

        // Skip monitoring for excluded paths
        if (config.excludePaths?.includes(context.path)) {
          await next();
          return;
        }

        // Record request metrics
        config.metrics.recordRequest(context);

        try {
          // Execute request
          await next();

          // Record response metrics
          const responseContext = {
            ...context,
            statusCode: context.statusCode || 200,
            responseSize: context.responseSize || 0,
          };

          config.metrics.recordResponse(responseContext);
        } catch (error) {
          // Record error metrics
          config.metrics.recordError(error as Error, context);
          throw error;
        }
      },
    };
  }
}

/**
 * Performance Monitor
 * Monitors API Gateway performance and alerts on issues
 */
export class ApiGatewayPerformanceMonitor {
  private metrics: ApiGatewayMetricsCollector;
  private healthCheck: ApiGatewayHealthCheckManager;
  private logger?: ApiGatewayLogger;
  private alerts: Map<string, { threshold: number; callback: (value: number) => void }> = new Map();
  private monitorInterval: number;
  private intervalId?: NodeJS.Timeout;

  constructor(
    metrics: ApiGatewayMetricsCollector,
    healthCheck: ApiGatewayHealthCheckManager,
    monitorInterval: number = 60000,
    logger?: ApiGatewayLogger,
  ) {
    this.metrics = metrics;
    this.healthCheck = healthCheck;
    this.monitorInterval = monitorInterval;
    this.logger = logger;

    // Register default alerts
    this.registerDefaultAlerts();

    // Start monitoring
    this.startMonitoring();
  }

  /**
   * Register performance alert
   */
  registerAlert(name: string, threshold: number, callback: (value: number) => void): void {
    this.alerts.set(name, { threshold, callback });
    this.logger?.info("Performance alert registered", { name, threshold });
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.checkPerformance();
    }, this.monitorInterval);

    this.logger?.info("Performance monitoring started", { interval: this.monitorInterval });
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.logger?.info("Performance monitoring stopped");
    }
  }

  /**
   * Check performance metrics and trigger alerts
   */
  private checkPerformance(): void {
    try {
      const metrics = this.metrics.getMetrics();

      // Check each alert
      for (const [name, alert] of this.alerts.entries()) {
        const value = metrics[name];

        if (typeof value === "number" && value > alert.threshold) {
          this.logger?.warn("Performance alert triggered", {
            alert: name,
            value,
            threshold: alert.threshold,
          });

          try {
            alert.callback(value);
          } catch (error) {
            this.logger?.error("Performance alert callback error", error as Error, { alert: name });
          }
        }
      }
    } catch (error) {
      this.logger?.error("Performance monitoring error", error as Error);
    }
  }

  /**
   * Register default performance alerts
   */
  private registerDefaultAlerts(): void {
    // High response time alert
    this.registerAlert("request_duration_ms_p95", 1000, (value) => {
      this.logger?.warn("High response time detected", { p95ResponseTime: value });
    });

    // High error rate alert
    this.registerAlert("errors_total", 100, (value) => {
      this.logger?.warn("High error rate detected", { totalErrors: value });
    });

    // Memory usage alert
    this.registerAlert("process_memory_heap_used_bytes", 500 * 1024 * 1024, (value) => {
      this.logger?.warn("High memory usage detected", {
        heapUsedMB: Math.round(value / 1024 / 1024),
      });
    });
  }
}
