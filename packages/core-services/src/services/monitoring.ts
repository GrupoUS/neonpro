// ================================================
// MONITORING SERVICE
// Comprehensive monitoring, metrics, logging, and alerting system
// ================================================

import { createClient } from "@supabase/supabase-js";

// ================================================
// TYPES AND INTERFACES
// ================================================

interface MetricData {
  name: string;
  value: number;
  unit: "count" | "bytes" | "milliseconds" | "percentage" | "rate";
  tags: Record<string, string>;
  timestamp: Date;
  source: string;
  tenantId?: string;
}

interface LogEntry {
  level: "debug" | "info" | "warn" | "error" | "critical";
  message: string;
  service: string;
  operation?: string;
  userId?: string;
  tenantId?: string;
  requestId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  stack?: string;
  duration?: number;
}

interface Alert {
  id: string;
  name: string;
  level: "info" | "warning" | "critical";
  message: string;
  service: string;
  metricName?: string;
  threshold?: number;
  currentValue?: number;
  tags: Record<string, string>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  tenantId?: string;
}

interface HealthCheck {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency: number;
  checks: Record<
    string,
    {
      status: "pass" | "fail";
      message?: string;
      duration: number;
    }
  >;
  timestamp: Date;
  version?: string;
  uptime?: number;
}

interface PerformanceMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  queueDepth: number;
}

// ================================================
// MONITORING SERVICE
// ================================================

export class MonitoringService {
  private static instance: MonitoringService;
  private readonly supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  );

  private metricsBuffer: MetricData[] = [];
  private logsBuffer: LogEntry[] = [];
  private readonly bufferFlushInterval = 5000; // 5 seconds
  private readonly maxBufferSize = 1000;

  private constructor() {
    this.initializeBufferFlush();
    this.initializeSystemMetrics();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // ================================================
  // METRICS COLLECTION
  // ================================================

  recordMetric(
    name: string,
    value: number,
    unit: MetricData["unit"] = "count",
    tags: Record<string, string> = {},
    source = "application",
  ): void {
    const metric: MetricData = {
      name,
      value,
      unit,
      tags,
      timestamp: new Date(),
      source,
      tenantId: tags.tenantId,
    };

    this.metricsBuffer.push(metric);
    this.flushBufferIfNeeded();
  }

  incrementCounter(name: string, tags: Record<string, string> = {}): void {
    this.recordMetric(name, 1, "count", tags);
  }

  recordTimer(
    name: string,
    duration: number,
    tags: Record<string, string> = {},
  ): void {
    this.recordMetric(name, duration, "milliseconds", tags);
  }

  recordGauge(
    name: string,
    value: number,
    tags: Record<string, string> = {},
  ): void {
    this.recordMetric(name, value, "count", tags);
  }

  recordHistogram(
    name: string,
    value: number,
    tags: Record<string, string> = {},
  ): void {
    this.recordMetric(`${name}.count`, 1, "count", tags);
    this.recordMetric(`${name}.sum`, value, "count", tags);
    this.recordMetric(`${name}.avg`, value, "count", tags);
  }

  // ================================================
  // LOGGING SYSTEM
  // ================================================

  log(
    level: LogEntry["level"],
    message: string,
    service: string,
    metadata: Partial<
      Omit<LogEntry, "level" | "message" | "service" | "timestamp">
    > = {},
  ): void {
    const logEntry: LogEntry = {
      level,
      message,
      service,
      timestamp: new Date(),
      ...metadata,
    };

    // Console output for development
    if (process.env.NODE_ENV === "development") {}

    this.logsBuffer.push(logEntry);
    this.flushBufferIfNeeded();
  }

  debug(message: string, service: string, metadata?: unknown): void {
    this.log("debug", message, service, metadata);
  }

  info(message: string, service: string, metadata?: unknown): void {
    this.log("info", message, service, metadata);
  }

  warn(message: string, service: string, metadata?: unknown): void {
    this.log("warn", message, service, metadata);
  }

  error(message: string, service: string, error?: Error, metadata?: unknown): void {
    this.log("error", message, service, {
      ...metadata,
      stack: error?.stack,
      errorMessage: error?.message,
    });
  }

  critical(
    message: string,
    service: string,
    error?: Error,
    metadata?: unknown,
  ): void {
    this.log("critical", message, service, {
      ...metadata,
      stack: error?.stack,
      errorMessage: error?.message,
    });

    // Immediately flush critical logs
    this.flushBuffers();
  }

  // ================================================
  // PERFORMANCE MONITORING
  // ================================================

  async startTransaction(
    name: string,
    tags: Record<string, string> = {},
  ): Promise<string> {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    this.recordMetric("transaction.started", 1, "count", {
      ...tags,
      transactionName: name,
      transactionId,
    });

    return transactionId;
  }

  async endTransaction(
    transactionId: string,
    name: string,
    success: boolean,
    tags: Record<string, string> = {},
  ): Promise<void> {
    const duration = this.getTransactionDuration(transactionId);

    this.recordMetric("transaction.completed", 1, "count", {
      ...tags,
      transactionName: name,
      transactionId,
      success: success.toString(),
    });

    this.recordTimer("transaction.duration", duration, {
      ...tags,
      transactionName: name,
    });
  }

  async measureOperation<T>(
    name: string,
    operation: () => Promise<T>,
    tags: Record<string, string> = {},
  ): Promise<T> {
    const startTime = Date.now();
    const transactionId = await this.startTransaction(name, tags);

    try {
      const result = await operation();

      const duration = Date.now() - startTime;
      await this.endTransaction(transactionId, name, true, tags);
      this.recordTimer(`operation.${name}`, duration, tags);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.endTransaction(transactionId, name, false, tags);
      this.recordTimer(`operation.${name}`, duration, {
        ...tags,
        error: "true",
      });

      this.error(`Operation ${name} failed`, "monitoring", error as Error, {
        transactionId,
        duration,
        tags,
      });

      throw error;
    }
  }

  // ================================================
  // HEALTH CHECKS
  // ================================================

  async performHealthCheck(service: string): Promise<HealthCheck> {
    const startTime = Date.now();
    const checks: HealthCheck["checks"] = {};

    try {
      // Database connectivity check
      const dbStart = Date.now();
      const { error: dbError } = await this.supabase
        .from("health_check")
        .select("id")
        .limit(1);

      checks.database = {
        status: dbError ? "fail" : "pass",
        message: dbError?.message,
        duration: Date.now() - dbStart,
      };

      // Memory usage check
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      checks.memory = {
        status: memoryUsagePercent > 90 ? "fail" : "pass",
        message: `Memory usage: ${memoryUsagePercent.toFixed(2)}%`,
        duration: 1,
      };

      // Service-specific checks
      if (service === "api-gateway") {
        checks.routes = await this.checkApiRoutes();
      } else if (service === "auth") {
        checks.authentication = await this.checkAuthSystem();
      }

      const latency = Date.now() - startTime;
      const hasFailures = Object.values(checks).some(
        (check) => check.status === "fail",
      );

      const healthCheck: HealthCheck = {
        service,
        status: hasFailures ? "unhealthy" : "healthy",
        latency,
        checks,
        timestamp: new Date(),
        version: process.env.npm_package_version,
        uptime: process.uptime(),
      };

      // Record health check metrics
      this.recordMetric("health_check.latency", latency, "milliseconds", {
        service,
      });
      this.recordMetric("health_check.status", hasFailures ? 0 : 1, "count", {
        service,
      });

      return healthCheck;
    } catch (error) {
      this.error("Health check failed", service, error as Error);

      return {
        service,
        status: "unhealthy",
        latency: Date.now() - startTime,
        checks: {
          error: {
            status: "fail",
            message: (error as Error).message,
            duration: Date.now() - startTime,
          },
        },
        timestamp: new Date(),
      };
    }
  }

  // ================================================
  // ALERTING SYSTEM
  // ================================================

  async createAlert(
    name: string,
    level: Alert["level"],
    message: string,
    service: string,
    metadata: Partial<Alert> = {},
  ): Promise<string> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const alert: Alert = {
      id: alertId,
      name,
      level,
      message,
      service,
      acknowledged: false,
      createdAt: new Date(),
      tags: {},
      ...metadata,
    };

    try {
      await this.supabase.from("alerts").insert(alert);

      // Log the alert
      this.log(level, `Alert created: ${name}`, service, {
        alertId,
        alertMessage: message,
      });

      // Record alert metric
      this.recordMetric("alerts.created", 1, "count", {
        service,
        level,
        alertName: name,
      });

      return alertId;
    } catch (error) {
      this.error("Failed to create alert", "monitoring", error as Error, {
        alertName: name,
        alertLevel: level,
      });
      return alertId;
    }
  }

  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("alerts")
        .update({
          acknowledged: true,
          acknowledgedBy,
          acknowledgedAt: new Date(),
        })
        .eq("id", alertId);

      if (error) {
        this.error(
          "Failed to acknowledge alert",
          "monitoring",
          new Error(error.message),
        );
        return false;
      }

      this.info(`Alert acknowledged: ${alertId}`, "monitoring", {
        acknowledgedBy,
      });
      return true;
    } catch (error) {
      this.error("Failed to acknowledge alert", "monitoring", error as Error);
      return false;
    }
  }

  // ================================================
  // ANALYTICS AND REPORTING
  // ================================================

  async getPerformanceMetrics(
    service: string,
    timeRange: { start: Date; end: Date; },
  ): Promise<PerformanceMetrics> {
    try {
      const { data, error } = await this.supabase
        .from("metrics")
        .select("*")
        .eq("source", service)
        .gte("timestamp", timeRange.start.toISOString())
        .lte("timestamp", timeRange.end.toISOString());

      if (error) {
        throw new Error(error.message);
      }

      const metrics = data as MetricData[];

      return {
        requestsPerSecond: this.calculateRate(metrics, "requests.count"),
        averageResponseTime: this.calculateAverage(metrics, "response.time"),
        errorRate: this.calculateErrorRate(metrics),
        cpuUsage: this.getLatestValue(metrics, "system.cpu"),
        memoryUsage: this.getLatestValue(metrics, "system.memory"),
        diskUsage: this.getLatestValue(metrics, "system.disk"),
        activeConnections: this.getLatestValue(metrics, "connections.active"),
        queueDepth: this.getLatestValue(metrics, "queue.depth"),
      };
    } catch (error) {
      this.error(
        "Failed to get performance metrics",
        "monitoring",
        error as Error,
      );

      return {
        requestsPerSecond: 0,
        averageResponseTime: 0,
        errorRate: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        activeConnections: 0,
        queueDepth: 0,
      };
    }
  }

  // ================================================
  // PRIVATE HELPER METHODS
  // ================================================

  private initializeBufferFlush(): void {
    setInterval(() => {
      this.flushBuffers();
    }, this.bufferFlushInterval);
  }

  private initializeSystemMetrics(): void {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30_000);
  }

  private collectSystemMetrics(): void {
    try {
      const memoryUsage = process.memoryUsage();

      this.recordMetric(
        "system.memory.heap_used",
        memoryUsage.heapUsed,
        "bytes",
      );
      this.recordMetric(
        "system.memory.heap_total",
        memoryUsage.heapTotal,
        "bytes",
      );
      this.recordMetric(
        "system.memory.external",
        memoryUsage.external,
        "bytes",
      );
      this.recordMetric("system.uptime", process.uptime(), "count");

      // CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      this.recordMetric("system.cpu.user", cpuUsage.user, "count");
      this.recordMetric("system.cpu.system", cpuUsage.system, "count");
    } catch (error) {
      this.error(
        "Failed to collect system metrics",
        "monitoring",
        error as Error,
      );
    }
  }

  private flushBufferIfNeeded(): void {
    if (
      this.metricsBuffer.length >= this.maxBufferSize
      || this.logsBuffer.length >= this.maxBufferSize
    ) {
      this.flushBuffers();
    }
  }

  private async flushBuffers(): Promise<void> {
    if (this.metricsBuffer.length > 0) {
      await this.flushMetrics();
    }

    if (this.logsBuffer.length > 0) {
      await this.flushLogs();
    }
  }

  private async flushMetrics(): Promise<void> {
    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      const { error } = await this.supabase.from("metrics").insert(metrics);

      if (error) {
        // Put metrics back in buffer
        this.metricsBuffer.unshift(...metrics);
      }
    } catch {
      // Put metrics back in buffer
      this.metricsBuffer.unshift(...metrics);
    }
  }

  private async flushLogs(): Promise<void> {
    const logs = [...this.logsBuffer];
    this.logsBuffer = [];

    try {
      const { error } = await this.supabase.from("logs").insert(logs);

      if (error) {
        // Put logs back in buffer
        this.logsBuffer.unshift(...logs);
      }
    } catch {
      // Put logs back in buffer
      this.logsBuffer.unshift(...logs);
    }
  }

  private getTransactionDuration(transactionId: string): number {
    // Extract timestamp from transaction ID
    const timestamp = Number.parseInt(transactionId.split("_")[1], 10);
    return Date.now() - timestamp;
  }

  private async checkApiRoutes(): Promise<{
    status: "pass" | "fail";
    message?: string;
    duration: number;
  }> {
    const start = Date.now();
    try {
      // Check a few critical API routes
      const routes = ["/api/health", "/api/auth/session"];

      for (const route of routes) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}${route}`,
        );
        if (!response.ok) {
          return {
            status: "fail",
            message: `Route ${route} returned ${response.status}`,
            duration: Date.now() - start,
          };
        }
      }

      return {
        status: "pass",
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        status: "fail",
        message: (error as Error).message,
        duration: Date.now() - start,
      };
    }
  }

  private async checkAuthSystem(): Promise<{
    status: "pass" | "fail";
    message?: string;
    duration: number;
  }> {
    const start = Date.now();
    try {
      // Simple auth system check
      const { error } = await this.supabase.auth.getSession();

      return {
        status: error ? "fail" : "pass",
        message: error?.message,
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        status: "fail",
        message: (error as Error).message,
        duration: Date.now() - start,
      };
    }
  }

  private calculateRate(metrics: MetricData[], metricName: string): number {
    const relevantMetrics = metrics.filter((m) => m.name === metricName);
    if (relevantMetrics.length === 0) {
      return 0;
    }

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    const timeSpan = Math.max(1, (relevantMetrics.length - 1) * 60); // Assume 1-minute intervals

    return sum / timeSpan;
  }

  private calculateAverage(metrics: MetricData[], metricName: string): number {
    const relevantMetrics = metrics.filter((m) => m.name === metricName);
    if (relevantMetrics.length === 0) {
      return 0;
    }

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  private calculateErrorRate(metrics: MetricData[]): number {
    const totalRequests = metrics
      .filter((m) => m.name === "requests.count")
      .reduce((acc, m) => acc + m.value, 0);

    const errorRequests = metrics
      .filter((m) => m.name === "requests.error")
      .reduce((acc, m) => acc + m.value, 0);

    if (totalRequests === 0) {
      return 0;
    }
    return (errorRequests / totalRequests) * 100;
  }

  private getLatestValue(metrics: MetricData[], metricName: string): number {
    const relevantMetrics = metrics
      .filter((m) => m.name === metricName)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return relevantMetrics.length > 0 ? relevantMetrics[0].value : 0;
  }
}

// ================================================
// MONITORING HELPERS
// ================================================

export const monitoring = MonitoringService.getInstance();

export function withMonitoring<T>(
  operation: string,
  handler: () => Promise<T>,
  tags: Record<string, string> = {},
): Promise<T> {
  return monitoring.measureOperation(operation, handler, tags);
}

export function logOperation(
  level: LogEntry["level"],
  message: string,
  service: string,
  metadata?: unknown,
): void {
  monitoring.log(level, message, service, metadata);
}

// ================================================
// MONITORING DECORATORS
// ================================================

export function Monitor(metricName?: string) {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const { value: originalMethod } = descriptor;
    const finalMetricName = metricName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function value(...args: unknown[]) {
      return monitoring.measureOperation(
        finalMetricName,
        () => originalMethod.apply(this, args),
        {
          class: target.constructor.name,
          method: propertyKey,
        },
      );
    };

    return descriptor;
  };
}

export function LogExecution(service?: string) {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const { value: originalMethod } = descriptor;
    const finalService = service || target.constructor.name;

    descriptor.value = async function value(...args: unknown[]) {
      const startTime = Date.now();

      try {
        monitoring.debug(`Starting ${propertyKey}`, finalService, { args });
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        monitoring.info(`Completed ${propertyKey}`, finalService, { duration });
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        monitoring.error(
          `Failed ${propertyKey}`,
          finalService,
          error as Error,
          { duration },
        );
        throw error;
      }
    };

    return descriptor;
  };
}
