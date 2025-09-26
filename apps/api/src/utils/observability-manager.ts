/**
 * 🔍 Observability Manager Utility
 * 
 * A comprehensive monitoring and observability system with:
 * - Metrics collection and aggregation
 * - Health checks and system monitoring
 * - Performance tracking and analysis
 * - Distributed tracing support
 * - Alert management and notification
 * - Healthcare-compliant data handling
 */

import { SecureLogger } from './secure-logger'
import { HealthcareError, HealthcareErrorSeverity, HealthcareErrorCategory } from './healthcare-errors'

export interface MetricDefinition {
  /**
   * Metric definition for type-safe metrics collection
   */
  name: string
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
  description: string
  labels?: string[]
  buckets?: number[] // For histogram metrics
  objectives?: { quantile: number; error: number }[] // For summary metrics
}

export interface MetricValue {
  /**
   * Metric value with labels and timestamp
   */
  name: string
  value: number
  labels?: Record<string, string>
  timestamp: Date
}

export interface HealthCheck {
  /**
   * Health check definition
   */
  name: string
  check: () => Promise<{ healthy: boolean; message?: string; details?: any }>
  interval: number // Check interval in milliseconds
  timeout: number // Check timeout in milliseconds
  critical: boolean // Whether this is a critical health check
}

export interface HealthStatus {
  /**
   * Overall system health status
   */
  healthy: boolean
  timestamp: Date
  checks: Array<{
    name: string
    healthy: boolean
    message?: string
    details?: any
    responseTime: number
  }>
  overallScore: number // 0-100 score
}

export interface AlertRule {
  /**
   * Alert rule definition
   */
  id: string
  name: string
  condition: {
    metric: string
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
    threshold: number
    duration?: number // Duration in milliseconds
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  channels: ('email' | 'webhook' | 'slack' | 'pagerduty')[]
  enabled: boolean
  cooldown: number // Cooldown period in milliseconds
}

export interface Alert {
  /**
   * Alert instance
   */
  id: string
  ruleId: string
  name: string
  severity: AlertRule['severity']
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  labels: Record<string, string>
  annotations?: Record<string, string>
}

export interface PerformanceTrace {
  /**
   * Performance trace for distributed tracing
   */
  traceId: string
  spanId: string
  parentSpanId?: string
  name: string
  startTime: Date
  endTime?: Date
  duration?: number
  tags: Record<string, string>
  status: 'ok' | 'error'
  error?: string
}

export interface ObservabilityManagerOptions {
  /**
   * Options for observability manager
   */
  enableMetrics?: boolean
  enableHealthChecks?: boolean
  enableAlerts?: boolean
  enableTracing?: boolean
  metricsRetentionHours?: number
  healthCheckInterval?: number
  alertWebhookUrl?: string
  environment?: string
  serviceName?: string
}

export class ObservabilityManager {
  private logger: SecureLogger
  private options: ObservabilityManagerOptions
  private metrics: Map<string, MetricDefinition> = new Map()
  private metricValues: MetricValue[] = []
  private healthChecks: Map<string, HealthCheck> = new Map()
  private alertRules: Map<string, AlertRule> = new Map()
  private activeAlerts: Map<string, Alert> = new Map()
  private traces: Map<string, PerformanceTrace> = new Map()
  private intervals: Set<NodeJS.Timeout> = new Set()
  private metricsBuffer: Map<string, { values: number[]; timestamp: Date }> = new Map()

  constructor(options: ObservabilityManagerOptions = {}) {
    this.options = {
      enableMetrics: true,
      enableHealthChecks: true,
      enableAlerts: true,
      enableTracing: true,
      metricsRetentionHours: 24,
      healthCheckInterval: 30000, // 30 seconds
      environment: process.env.NODE_ENV || 'development',
      serviceName: 'neonpro-api',
      ...options
    }

    this.logger = new SecureLogger({
      level: 'info',
      maskSensitiveData: true,
      lgpdCompliant: true,
      auditTrail: true,
      _service: 'ObservabilityManager'
    })

    this.initialize()
  }

  /**
   * Initialize the observability manager
   */
  private initialize(): void {
    this.logger.info('Initializing Observability Manager', {
      enableMetrics: this.options.enableMetrics,
      enableHealthChecks: this.options.enableHealthChecks,
      enableAlerts: this.options.enableAlerts,
      enableTracing: this.options.enableTracing,
      environment: this.options.environment
    })

    // Start background tasks
    if (this.options.enableHealthChecks) {
      this.startHealthChecks()
    }

    if (this.options.enableMetrics) {
      this.startMetricsCleanup()
    }

    if (this.options.enableAlerts) {
      this.startAlertEvaluation()
    }

    // Register default metrics
    this.registerDefaultMetrics()
  }

  /**
   * Register a new metric
   */
  registerMetric(metric: MetricDefinition): void {
    this.metrics.set(metric.name, metric)
    this.metricsBuffer.set(metric.name, { values: [], timestamp: new Date() })
    
    this.logger.debug('Metric registered', { 
      name: metric.name, 
      type: metric.type,
      labels: metric.labels 
    })
  }

  /**
   * Record a metric value
   */
  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.options.enableMetrics) return

    const metric = this.metrics.get(name)
    if (!metric) {
      this.logger.warn('Attempted to record unregistered metric', { name })
      return
    }

    const metricValue: MetricValue = {
      name,
      value,
      labels,
      timestamp: new Date()
    }

    this.metricValues.push(metricValue)

    // Update buffer for aggregation
    const buffer = this.metricsBuffer.get(name)!
    buffer.values.push(value)
    buffer.timestamp = new Date()

    // Keep buffer size reasonable
    if (buffer.values.length > 1000) {
      buffer.values = buffer.values.slice(-500)
    }

    // Log metric if it's significant
    if (metric.type === 'counter' && value > 1000) {
      this.logger.info('High metric value recorded', { name, value, labels })
    }
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels?: Record<string, string>, delta: number = 1): void {
    this.recordMetric(name, delta, labels)
  }

  /**
   * Set a gauge metric value
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric(name, value, labels)
  }

  /**
   * Record a timing/latency metric
   */
  recordTiming(name: string, duration: number, labels?: Record<string, string>): void {
    this.recordMetric(name, duration, labels)
  }

  /**
   * Start a performance trace
   */
  startTrace(name: string, parentSpanId?: string): PerformanceTrace {
    if (!this.options.enableTracing) {
      return {
        traceId: 'disabled',
        spanId: 'disabled',
        name,
        startTime: new Date(),
        tags: {},
        status: 'ok'
      }
    }

    const trace: PerformanceTrace = {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      parentSpanId,
      name,
      startTime: new Date(),
      tags: {},
      status: 'ok'
    }

    this.traces.set(trace.spanId, trace)
    return trace
  }

  /**
   * Finish a performance trace
   */
  finishTrace(trace: PerformanceTrace, error?: Error): void {
    if (trace.spanId === 'disabled') return

    const endTime = new Date()
    trace.endTime = endTime
    trace.duration = endTime.getTime() - trace.startTime.getTime()
    trace.status = error ? 'error' : 'ok'
    if (error) {
      trace.error = error.message
    }

    // Record as metric
    this.recordTiming(`${trace.name}_duration`, trace.duration, {
      status: trace.status,
      traceId: trace.traceId
    })

    if (error) {
      this.incrementCounter(`${trace.name}_errors`, { 
        errorType: error.constructor.name 
      })
    }

    // Remove from active traces after some time
    setTimeout(() => {
      this.traces.delete(trace.spanId)
    }, 3600000) // Keep traces for 1 hour
  }

  /**
   * Register a health check
   */
  registerHealthCheck(healthCheck: HealthCheck): void {
    this.healthChecks.set(healthCheck.name, healthCheck)
    
    this.logger.debug('Health check registered', { 
      name: healthCheck.name,
      interval: healthCheck.interval,
      critical: healthCheck.critical
    })
  }

  /**
   * Get current health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = []
    let healthyCount = 0
    let totalWeight = 0
    let weightedSum = 0

    for (const healthCheck of this.healthChecks.values()) {
      try {
        const startTime = Date.now()
        const result = await Promise.race([
          healthCheck.check(),
          new Promise<{ healthy: boolean; message: string }>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), healthCheck.timeout)
          )
        ])
        const responseTime = Date.now() - startTime

        const isHealthy = result.healthy
        if (isHealthy) healthyCount++

        const weight = healthCheck.critical ? 2 : 1
        totalWeight += weight
        weightedSum += isHealthy ? weight : 0

        checks.push({
          name: healthCheck.name,
          healthy: isHealthy,
          message: result.message,
          details: result.details,
          responseTime
        })
      } catch (error) {
        const weight = healthCheck.critical ? 2 : 1
        totalWeight += weight

        checks.push({
          name: healthCheck.name,
          healthy: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          responseTime: 0
        })
      }
    }

    const overallScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0

    return {
      healthy: healthyCount === this.healthChecks.size,
      timestamp: new Date(),
      checks,
      overallScore
    }
  }

  /**
   * Register an alert rule
   */
  registerAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule)
    
    this.logger.debug('Alert rule registered', { 
      id: rule.id,
      name: rule.name,
      severity: rule.severity
    })
  }

  /**
   * Get current alerts
   */
  getAlerts(includeResolved: boolean = false): Alert[] {
    const alerts = Array.from(this.activeAlerts.values())
    return includeResolved ? alerts : alerts.filter(alert => !alert.resolved)
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Array<{
    name: string
    type: string
    count: number
    latest?: number
    average?: number
    min?: number
    max?: number
  }> {
    const summary = new Map()

    // Group metrics by name
    for (const metric of this.metricValues) {
      if (!summary.has(metric.name)) {
        summary.set(metric.name, {
          name: metric.name,
          type: this.metrics.get(metric.name)?.type || 'unknown',
          count: 0,
          values: [] as number[]
        })
      }
      
      const entry = summary.get(metric.name)!
      entry.count++
      entry.values.push(metric.value)
    }

    // Calculate statistics
    return Array.from(summary.values()).map(entry => {
      const values = entry.values
      return {
        name: entry.name,
        type: entry.type,
        count: entry.count,
        latest: values[values.length - 1],
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : undefined,
        min: values.length > 0 ? Math.min(...values) : undefined,
        max: values.length > 0 ? Math.max(...values) : undefined
      }
    })
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    activeTraces: number
    averageResponseTime: number
    errorRate: number
    p95ResponseTime: number
    throughput: number
  } {
    const now = Date.now()
    const oneHourAgo = now - 3600000

    const recentTraces = Array.from(this.traces.values())
      .filter(trace => trace.endTime && trace.endTime.getTime() > oneHourAgo)

    const durations = recentTraces
      .filter(trace => trace.duration !== undefined)
      .map(trace => trace.duration!)

    const errors = recentTraces.filter(trace => trace.status === 'error')

    return {
      activeTraces: this.traces.size,
      averageResponseTime: durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0,
      errorRate: recentTraces.length > 0 
        ? (errors.length / recentTraces.length) * 100 
        : 0,
      p95ResponseTime: durations.length > 0 
        ? this.calculatePercentile(durations, 95) 
        : 0,
      throughput: recentTraces.length // requests per hour
    }
  }

  /**
   * Clean up resources
   */
  shutdown(): void {
    this.logger.info('Shutting down Observability Manager')

    // Clear all intervals
    for (const interval of this.intervals) {
      clearInterval(interval)
    }
    this.intervals.clear()

    // Clear data
    this.metrics.clear()
    this.metricValues = []
    this.healthChecks.clear()
    this.alertRules.clear()
    this.activeAlerts.clear()
    this.traces.clear()
    this.metricsBuffer.clear()
  }

  // Private helper methods
  private startHealthChecks(): void {
    const interval = setInterval(async () => {
      try {
        const healthStatus = await this.getHealthStatus()
        
        // Record health as a metric
        this.setGauge('system_health_score', healthStatus.overallScore)
        
        if (!healthStatus.healthy) {
          this.logger.warn('System health check failed', {
            score: healthStatus.overallScore,
            failedChecks: healthStatus.checks.filter(c => !c.healthy).map(c => c.name)
          })
        }
      } catch (error) {
        this.logger.error('Health check execution failed', {
          error: error instanceof Error ? error.message : String(error)
        }, HealthcareErrorSeverity.MEDIUM)
      }
    }, this.options.healthCheckInterval)

    this.intervals.add(interval)
  }

  private startMetricsCleanup(): void {
    const interval = setInterval(() => {
      const cutoff = new Date(Date.now() - (this.options.metricsRetentionHours! * 3600000))
      
      this.metricValues = this.metricValues.filter(
        metric => metric.timestamp > cutoff
      )

      this.logger.debug('Metrics cleanup completed', {
        remainingMetrics: this.metricValues.length,
        cutoffTime: cutoff.toISOString()
      })
    }, 300000) // Cleanup every 5 minutes

    this.intervals.add(interval)
  }

  private startAlertEvaluation(): void {
    const interval = setInterval(() => {
      this.evaluateAlertRules()
    }, 10000) // Evaluate every 10 seconds

    this.intervals.add(interval)
  }

  private async evaluateAlertRules(): Promise<void> {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue

      try {
        const shouldAlert = await this.evaluateAlertCondition(rule)
        
        if (shouldAlert) {
          await this.triggerAlert(rule)
        } else {
          await this.resolveAlert(rule.id)
        }
      } catch (error) {
        this.logger.error('Alert rule evaluation failed', {
          ruleId: rule.id,
          error: error instanceof Error ? error.message : String(error)
        }, HealthcareErrorSeverity.LOW)
      }
    }
  }

  private async evaluateAlertCondition(rule: AlertRule): Promise<boolean> {
    const metricValues = this.metricValues
      .filter(m => m.name === rule.condition.metric)
      .map(m => m.value)

    if (metricValues.length === 0) return false

    const latestValue = metricValues[metricValues.length - 1]

    switch (rule.condition.operator) {
      case 'gt':
        return latestValue > rule.condition.threshold
      case 'lt':
        return latestValue < rule.condition.threshold
      case 'gte':
        return latestValue >= rule.condition.threshold
      case 'lte':
        return latestValue <= rule.condition.threshold
      case 'eq':
        return latestValue === rule.condition.threshold
      default:
        return false
    }
  }

  private async triggerAlert(rule: AlertRule): Promise<void> {
    const existingAlert = this.activeAlerts.get(rule.id)
    
    // Check cooldown period
    if (existingAlert && !existingAlert.resolved) {
      const timeSinceLastAlert = Date.now() - existingAlert.timestamp.getTime()
      if (timeSinceLastAlert < rule.cooldown) {
        return
      }
    }

    const alert: Alert = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      name: rule.name,
      severity: rule.severity,
      message: `Alert triggered: ${rule.name} threshold exceeded`,
      timestamp: new Date(),
      resolved: false,
      labels: {
        rule_id: rule.id,
        environment: this.options.environment!,
        service: this.options.serviceName!
      }
    }

    this.activeAlerts.set(rule.id, alert)

    this.logger.warn('Alert triggered', {
      alertId: alert.id,
      ruleId: rule.id,
      severity: rule.severity,
      message: alert.message
    }, this.mapSeverityToErrorLevel(rule.severity))

    // Send notifications
    await this.sendAlertNotifications(alert)
  }

  private async resolveAlert(ruleId: string): Promise<void> {
    const alert = this.activeAlerts.get(ruleId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date()

      this.logger.info('Alert resolved', {
        alertId: alert.id,
        ruleId: ruleId,
        duration: alert.resolvedAt.getTime() - alert.timestamp.getTime()
      })
    }
  }

  private async sendAlertNotifications(alert: Alert): Promise<void> {
    // Mock implementation - in real scenario, send to configured channels
    this.logger.debug('Sending alert notifications', {
      alertId: alert.id,
      channels: this.alertRules.get(alert.ruleId)?.channels
    })
  }

  private registerDefaultMetrics(): void {
    // System metrics
    this.registerMetric({
      name: 'system_health_score',
      type: 'gauge',
      description: 'Overall system health score (0-100)'
    })

    this.registerMetric({
      name: 'request_count',
      type: 'counter',
      description: 'Total number of HTTP requests',
      labels: ['method', 'endpoint', 'status']
    })

    this.registerMetric({
      name: 'request_duration',
      type: 'histogram',
      description: 'HTTP request duration in milliseconds',
      labels: ['method', 'endpoint'],
      buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000]
    })

    this.registerMetric({
      name: 'error_count',
      type: 'counter',
      description: 'Total number of errors',
      labels: ['type', 'severity']
    })

    this.registerMetric({
      name: 'active_connections',
      type: 'gauge',
      description: 'Number of active database connections'
    })

    this.registerMetric({
      name: 'memory_usage',
      type: 'gauge',
      description: 'Memory usage in bytes'
    })

    this.registerMetric({
      name: 'cpu_usage',
      type: 'gauge',
      description: 'CPU usage percentage'
    })

    // Register default health checks
    this.registerHealthCheck({
      name: 'database_connectivity',
      check: async () => {
        // Mock database health check
        return { healthy: true, message: 'Database connection healthy' }
      },
      interval: 30000,
      timeout: 5000,
      critical: true
    })

    this.registerHealthCheck({
      name: 'memory_usage',
      check: async () => {
        const usage = process.memoryUsage()
        const heapUsed = usage.heapUsed / 1024 / 1024 // MB
        const healthy = heapUsed < 500 // Less than 500MB
        
        return {
          healthy,
          message: healthy ? 'Memory usage normal' : 'Memory usage high',
          details: { heapUsedMB: Math.round(heapUsed) }
        }
      },
      interval: 60000,
      timeout: 1000,
      critical: false
    })
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
  }

  private mapSeverityToErrorLevel(severity: AlertRule['severity']): HealthcareErrorSeverity {
    switch (severity) {
      case 'low':
        return HealthcareErrorSeverity.LOW
      case 'medium':
        return HealthcareErrorSeverity.MEDIUM
      case 'high':
        return HealthcareErrorSeverity.HIGH
      case 'critical':
        return HealthcareErrorSeverity.CRITICAL
      default:
        return HealthcareErrorSeverity.MEDIUM
    }
  }
}

/**
 * Create a configured ObservabilityManager instance.
 *
 * @param options - Optional configuration to override defaults (feature toggles, retention/intervals, alert webhook, environment, serviceName, etc.)
 * @returns A new ObservabilityManager configured with the provided options
 */
export function createObservabilityManager(options?: ObservabilityManagerOptions): ObservabilityManager {
  return new ObservabilityManager(options)
}

/**
 * Wraps an async operation in a performance trace, ensuring the trace is finished whether the operation succeeds or throws.
 *
 * @param manager - Observability manager used to start and finish the trace
 * @param name - Name to assign to the trace/span
 * @param operation - Async function to execute while traced
 * @returns The resolved value from `operation`
 */
export function withTrace<T>(
  manager: ObservabilityManager,
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const trace = manager.startTrace(name)
    
    try {
      const result = await operation()
      manager.finishTrace(trace)
      resolve(result)
    } catch (error) {
      manager.finishTrace(trace, error as Error)
      reject(error)
    }
  })
}

/**
 * Measures the duration of a synchronous operation and records it as a timing metric.
 *
 * @param manager - Observability manager used to record the timing metric
 * @param name - Metric name under which the operation duration will be recorded
 * @param operation - Synchronous function whose execution time will be measured
 * @returns The value returned by `operation`
 */
export function timeOperation<T>(
  manager: ObservabilityManager,
  name: string,
  operation: () => T
): T {
  const startTime = Date.now()
  
  try {
    const result = operation()
    const duration = Date.now() - startTime
    manager.recordTiming(name, duration)
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    manager.recordTiming(name, duration)
    throw error
  }
}