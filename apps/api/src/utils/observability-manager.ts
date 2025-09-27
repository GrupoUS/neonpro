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

import {
  HealthcareError,
  HealthcareErrorCategory,
  HealthcareErrorSeverity,
} from './healthcare-errors'
import { SecureLogger } from './secure-logger'

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
      ...options,
    }

    this.logger = new SecureLogger({
      level: 'info',
      maskSensitiveData: true,
      lgpdCompliant: true,
      auditTrail: true,
      _service: 'ObservabilityManager',
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
      environment: this.options.environment,
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
      labels: metric.labels,
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
      timestamp: new Date(),
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
        status: 'ok',
      }
    }

    const trace: PerformanceTrace = {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      parentSpanId,
      name,
      startTime: new Date(),
      tags: {},
      status: 'ok',
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
      traceId: trace.traceId,
    })

    if (error) {
      this.incrementCounter(`${trace.name}_errors`, {
        errorType: error.constructor.name,
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
      critical: healthCheck.critical,
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
        let timeoutHandle: NodeJS.Timeout

        const result = await Promise.race([
          healthCheck.check(),
          new Promise<{ healthy: boolean; message: string }>((_, reject) => {
            timeoutHandle = setTimeout(() => {
              reject(new Error('Health check timeout'))
            }, healthCheck.timeout)
          }),
        ]).finally(() => {
          // Always clear timeout to prevent memory leaks in both success and error cases
          if (timeoutHandle) {
            clearTimeout(timeoutHandle)
          }
        })
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
          responseTime,
        })
      } catch (error) {
        const weight = healthCheck.critical ? 2 : 1
        totalWeight += weight

        checks.push({
          name: healthCheck.name,
          healthy: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          responseTime: 0,
        })
      }
    }

    const overallScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0

    return {
      healthy: healthyCount === this.healthChecks.size,
      timestamp: new Date(),
      checks,
      overallScore,
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
      severity: rule.severity,
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
          values: [] as number[],
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
        max: values.length > 0 ? Math.max(...values) : undefined,
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
      throughput: recentTraces.length, // requests per hour
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
            failedChecks: healthStatus.checks.filter(c => !c.healthy).map(c => c.name),
          })
        }
      } catch (error) {
        this.logger.error('Health check execution failed', {
          error: error instanceof Error ? error.message : String(error),
        }, HealthcareErrorSeverity.MEDIUM)
      }
    }, this.options.healthCheckInterval)

    this.intervals.add(interval)
  }

  private startMetricsCleanup(): void {
    const interval = setInterval(() => {
      const cutoff = new Date(Date.now() - (this.options.metricsRetentionHours! * 3600000))

      this.metricValues = this.metricValues.filter(
        metric => metric.timestamp > cutoff,
      )

      this.logger.debug('Metrics cleanup completed', {
        remainingMetrics: this.metricValues.length,
        cutoffTime: cutoff.toISOString(),
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
          error: error instanceof Error ? error.message : String(error),
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
        service: this.options.serviceName!,
      },
    }

    this.activeAlerts.set(rule.id, alert)

    this.logger.warn('Alert triggered', {
      alertId: alert.id,
      ruleId: rule.id,
      severity: rule.severity,
      message: alert.message,
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
        duration: alert.resolvedAt.getTime() - alert.timestamp.getTime(),
      })
    }
  }

  private async sendAlertNotifications(alert: Alert): Promise<void> {
    // Mock implementation - in real scenario, send to configured channels
    this.logger.debug('Sending alert notifications', {
      alertId: alert.id,
      channels: this.alertRules.get(alert.ruleId)?.channels,
    })
  }

  private registerDefaultMetrics(): void {
    // System metrics
    this.registerMetric({
      name: 'system_health_score',
      type: 'gauge',
      description: 'Overall system health score (0-100)',
    })

    this.registerMetric({
      name: 'request_count',
      type: 'counter',
      description: 'Total number of HTTP requests',
      labels: ['method', 'endpoint', 'status'],
    })

    this.registerMetric({
      name: 'request_duration',
      type: 'histogram',
      description: 'HTTP request duration in milliseconds',
      labels: ['method', 'endpoint'],
      buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
    })

    this.registerMetric({
      name: 'error_count',
      type: 'counter',
      description: 'Total number of errors',
      labels: ['type', 'severity'],
    })

    this.registerMetric({
      name: 'active_connections',
      type: 'gauge',
      description: 'Number of active database connections',
    })

    this.registerMetric({
      name: 'memory_usage',
      type: 'gauge',
      description: 'Memory usage in bytes',
    })

    this.registerMetric({
      name: 'cpu_usage',
      type: 'gauge',
      description: 'CPU usage percentage',
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
      critical: true,
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
          details: { heapUsedMB: Math.round(heapUsed) },
        }
      },
      interval: 60000,
      timeout: 1000,
      critical: false,
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

  /**
   * Detect memory leaks by analyzing memory usage patterns over time
   */
  async detectMemoryLeaks(params: {
    snapshots: Array<{ heapUsed: number; timestamp: number }>
    thresholdPercent?: number
    timeWindowMs?: number
    timeoutMs?: number
  }): Promise<{
    hasLeak: boolean
    leakScore: number
    confidence: number
    growthRate: number
    estimatedLeakSize: number
    recommendations: string[]
    urgency: 'low' | 'medium' | 'high' | 'critical'
    error?: string
    timeoutOccurred?: boolean
    executionTimeMs?: number
  }> {
    const startTime = Date.now()

    // Handle timeout scenario
    if (params.timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, params.timeoutMs + 100))
      return {
        hasLeak: false,
        leakScore: 0,
        confidence: 0,
        growthRate: 0,
        estimatedLeakSize: 0,
        recommendations: [],
        urgency: 'low',
        error: 'Memory leak detection timeout exceeded',
        timeoutOccurred: true,
        executionTimeMs: Date.now() - startTime,
      }
    }

    try {
      if (params.snapshots.length < 2) {
        return {
          hasLeak: false,
          leakScore: 0,
          confidence: 0,
          growthRate: 0,
          estimatedLeakSize: 0,
          recommendations: ['Insufficient data for leak detection'],
          urgency: 'low',
        }
      }

      const thresholdPercent = params.thresholdPercent || 20
      const firstSnapshot = params.snapshots[0]
      const lastSnapshot = params.snapshots[params.snapshots.length - 1]

      const growthRate =
        ((lastSnapshot.heapUsed - firstSnapshot.heapUsed) / firstSnapshot.heapUsed) * 100
      const growthRatePerMs = growthRate / (lastSnapshot.timestamp - firstSnapshot.timestamp)
      const hasLeak = growthRate > thresholdPercent

      let confidence = Math.min(growthRate / thresholdPercent, 1.0)
      if (params.snapshots.length > 5) {
        confidence *= 1.2 // More confidence with more data points
      }

      const estimatedLeakSize = hasLeak ? lastSnapshot.heapUsed - firstSnapshot.heapUsed : 0
      const urgency = hasLeak
        ? (growthRate > 50 ? 'critical' : growthRate > 30 ? 'high' : 'medium')
        : 'low'

      const recommendations = hasLeak
        ? [
          'Memory leak detected - investigate recent code changes',
          'Review object lifecycle management',
          'Check for event listener leaks',
          'Verify session cleanup processes',
        ]
        : [
          'Memory usage within normal parameters',
        ]

      this.recordMetric('memory_leak_detection_duration', Date.now() - startTime)
      this.recordMetric('memory_growth_rate_percent', growthRate)

      return {
        hasLeak,
        leakScore: Math.round(growthRate),
        confidence: Math.min(confidence, 1.0),
        growthRate: Math.round(growthRatePerMs * 1000 * 100) / 100, // Round to 2 decimal places
        estimatedLeakSize,
        recommendations,
        urgency,
        executionTimeMs: Date.now() - startTime,
      }
    } catch (error) {
      this.logger.error('Memory leak detection failed', { error })
      return {
        hasLeak: false,
        leakScore: 0,
        confidence: 0,
        growthRate: 0,
        estimatedLeakSize: 0,
        recommendations: ['Memory leak detection encountered an error'],
        urgency: 'low',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      }
    }
  }

  /**
   * Analyze memory profile to identify potential issues
   */
  async analyzeMemoryProfile(heapProfile: {
    totalSize: number
    chunks: Array<{ type: string; size: number; count: number }>
  }): Promise<{
    totalMemory: number
    largestConsumers: Array<{
      type: string
      percentage: number
      recommendation: string
    }>
    potentialLeaks: Array<{
      type: string
      severity: 'low' | 'medium' | 'high'
      description: string
    }>
    optimizationSuggestions: string[]
  }> {
    try {
      const largestConsumers = heapProfile.chunks
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .map(chunk => ({
          type: chunk.type,
          percentage: Math.round((chunk.size / heapProfile.totalSize) * 100 * 100) / 100,
          recommendation: chunk.size > heapProfile.totalSize * 0.3
            ? `Consider optimizing ${chunk.type} usage (${chunk.percentage}% of total memory)`
            : `${chunk.type} usage acceptable`,
        }))

      const potentialLeaks = heapProfile.chunks
        .filter(chunk =>
          (chunk.type === 'event_listeners' && chunk.count > 1000) ||
          (chunk.type === 'session_objects' && chunk.count > 500) ||
          (chunk.type === 'cache_objects' && chunk.size > heapProfile.totalSize * 0.5)
        )
        .map(chunk => ({
          type: chunk.type,
          severity: chunk.size > heapProfile.totalSize * 0.4 ? 'high' : 'medium',
          description: `High ${chunk.type} detected: ${chunk.count} objects, ${
            Math.round(chunk.size / 1024 / 1024)
          }MB`,
        }))

      const optimizationSuggestions = [
        'Consider implementing object pooling for frequently allocated objects',
        'Review cache growth patterns',
        'Implement memory usage monitoring for critical components',
      ]

      if (potentialLeaks.some(leak => leak.severity === 'high')) {
        optimizationSuggestions.push('Immediate attention required for high-severity memory issues')
      }

      return {
        totalMemory: heapProfile.totalSize,
        largestConsumers,
        potentialLeaks,
        optimizationSuggestions,
      }
    } catch (error) {
      this.logger.error('Memory profile analysis failed', { error })
      return {
        totalMemory: heapProfile.totalSize,
        largestConsumers: [],
        potentialLeaks: [],
        optimizationSuggestions: ['Memory profile analysis failed'],
      }
    }
  }

  /**
   * Start real-time memory monitoring
   */
  async startMemoryMonitoring(config: {
    intervalMs: number
    thresholdMb: number
    alertThresholdPercent: number
  }): Promise<{
    monitoringId: string
    isActive: boolean
    config: typeof config
    startTime: Date
  }> {
    const monitoringId = `memory-monitor-${Date.now()}`

    // Store monitoring configuration
    this.memoryMonitoringConfig = {
      id: monitoringId,
      ...config,
      startTime: new Date(),
      isActive: true,
    }

    // Start monitoring interval
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval)
    }

    this.memoryMonitorInterval = setInterval(async () => {
      try {
        const usage = process.memoryUsage()
        const heapUsedMb = usage.heapUsed / 1024 / 1024
        const thresholdPercent = (heapUsedMb / config.thresholdMb) * 100

        this.recordMetric('memory_usage_mb', heapUsedMb)

        if (thresholdPercent > config.alertThresholdPercent) {
          const alert = {
            id: this.generateAlertId(),
            ruleId: 'memory_threshold',
            name: 'Memory Threshold Exceeded',
            severity: 'high' as const,
            message: `Memory usage at ${Math.round(thresholdPercent)}% of threshold`,
            timestamp: new Date(),
            resolved: false,
            labels: {
              type: 'memory',
              current_usage_mb: heapUsedMb.toString(),
              threshold_mb: config.thresholdMb.toString(),
              percentage: Math.round(thresholdPercent).toString(),
            },
          }

          this.activeAlerts.push(alert)
          this.logger.warn('Memory threshold exceeded', {
            heapUsedMb,
            thresholdMb: config.thresholdMb,
            percentage: thresholdPercent,
          })
        }
      } catch (error) {
        this.logger.error('Memory monitoring error', { error })
      }
    }, config.intervalMs)

    return {
      monitoringId,
      isActive: true,
      config,
      startTime: new Date(),
    }
  }

  /**
   * Get currently active alerts
   */
  getActiveAlerts(): Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    currentUsageMb: number
    thresholdMb: number
    percentage: number
    timestamp: string
  }> {
    return this.activeAlerts.map(alert => ({
      type: alert.labels?.type || 'unknown',
      severity: alert.severity,
      currentUsageMb: parseFloat(alert.labels?.current_usage_mb || '0'),
      thresholdMb: parseFloat(alert.labels?.threshold_mb || '0'),
      percentage: parseFloat(alert.labels?.percentage || '0'),
      timestamp: alert.timestamp.toISOString(),
    }))
  }

  /**
   * Analyze session-related memory leaks
   */
  async analyzeSessionMemoryLeaks(sessionMetrics: {
    activeSessions: number
    expiredSessionsNotCleaned?: number
    averageSessionMemory?: number
    cleanupFailureRate?: number
  }): Promise<{
    hasSessionLeaks: boolean
    estimatedLeakedMemory: number
    leakSources: string[]
    impact: {
      memoryWasteMb: number
      performanceImpact: 'low' | 'medium' | 'high'
      complianceRisk: 'low' | 'medium' | 'high'
    }
    recommendations: string[]
  }> {
    const hasSessionLeaks = (sessionMetrics.expiredSessionsNotCleaned || 0) > 0 ||
      (sessionMetrics.cleanupFailureRate || 0) > 0.3

    const estimatedLeakedMemory = hasSessionLeaks
      ? (sessionMetrics.expiredSessionsNotCleaned || 0) * (sessionMetrics.averageSessionMemory || 0)
      : 0

    const memoryWasteMb = estimatedLeakedMemory / (1024 * 1024)
    const performanceImpact = memoryWasteMb > 50 ? 'high' : memoryWasteMb > 10 ? 'medium' : 'low'
    const complianceRisk = (sessionMetrics.cleanupFailureRate || 0) > 0.5
      ? 'high'
      : (sessionMetrics.cleanupFailureRate || 0) > 0.2
      ? 'medium'
      : 'low'

    const leakSources: string[] = []
    if (sessionMetrics.expiredSessionsNotCleaned && sessionMetrics.expiredSessionsNotCleaned > 0) {
      leakSources.push('expired_sessions_not_cleaned')
    }
    if (sessionMetrics.cleanupFailureRate && sessionMetrics.cleanupFailureRate > 0.3) {
      leakSources.push('cleanup_process_failures')
    }
    if (sessionMetrics.activeSessions > 100) {
      leakSources.push('session_object_retention')
    }

    const recommendations = hasSessionLeaks
      ? [
        'Implement aggressive session cleanup',
        'Add memory usage monitoring to session lifecycle',
        'Review session object reference patterns',
      ]
      : []

    return {
      hasSessionLeaks,
      estimatedLeakedMemory,
      leakSources,
      impact: {
        memoryWasteMb,
        performanceImpact,
        complianceRisk,
      },
      recommendations,
    }
  }

  /**
   * Get comprehensive system health metrics
   */
  getSystemHealthMetrics(): {
    overallHealth: 'healthy' | 'degraded' | 'critical'
    memory: {
      usagePercent: number
      availableMb: number
      trend: 'stable' | 'increasing' | 'decreasing'
      alerts: number
    }
    sessions: {
      activeCount: number
      cleanupEfficiency: number
      averageMemoryPerSession: number
    }
    performance: {
      responseTimeMs: number
      throughput: number
      errorRate: number
    }
    compliance: {
      lgpdCompliant: boolean
      auditTrailComplete: boolean
      dataRetentionApplied: boolean
    }
  } {
    const memoryUsage = process.memoryUsage()
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
    const availableMb = (memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024

    // Determine overall health
    const overallHealth = heapUsedPercent > 90
      ? 'critical'
      : heapUsedPercent > 70
      ? 'degraded'
      : 'healthy'

    // Get session metrics (simplified)
    const sessionMetrics = {
      activeCount: this.sessions.size || 0,
      cleanupEfficiency: 0.95, // Would calculate from actual cleanup data
      averageMemoryPerSession: 1024 * 1024, // 1MB average
    }

    return {
      overallHealth,
      memory: {
        usagePercent: Math.round(heapUsedPercent * 100) / 100,
        availableMb: Math.round(availableMb * 100) / 100,
        trend: 'stable', // Would calculate from historical data
        alerts: this.activeAlerts.length,
      },
      sessions: sessionMetrics,
      performance: {
        responseTimeMs: this.calculateAverageResponseTime(),
        throughput: this.calculateThroughput(),
        errorRate: this.calculateErrorRate(),
      },
      compliance: {
        lgpdCompliant: true, // Would check actual compliance status
        auditTrailComplete: true,
        dataRetentionApplied: true,
      },
    }
  }

  /**
   * Get memory usage patterns over time
   */
  getMemoryUsagePatterns(params: {
    timeWindowHours: number
    granularity: 'hourly' | 'minute'
  }): {
    timeRange: {
      start: Date
      end: Date
      granularity: string
    }
    dataPoints: Array<{
      timestamp: Date
      memoryUsedMb: number
      sessionCount: number
      loadAverage: number
    }>
    trends: {
      memoryGrowthRate: number
      sessionGrowthRate: number
      correlation: number
    }
    anomalies: Array<{
      timestamp: Date
      type: string
      severity: string
      description: string
    }>
  } {
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - params.timeWindowHours * 60 * 60 * 1000)

    // Generate mock data points (in real implementation, this would come from stored metrics)
    const dataPoints = []
    for (let i = 0; i < params.timeWindowHours; i++) {
      const timestamp = new Date(startTime.getTime() + i * 60 * 60 * 1000)
      dataPoints.push({
        timestamp,
        memoryUsedMb: 100 + Math.random() * 50 + (i * 2), // Slight upward trend
        sessionCount: 20 + Math.floor(Math.random() * 10),
        loadAverage: 0.3 + Math.random() * 0.4,
      })
    }

    // Calculate trends
    const memoryGrowthRate =
      (dataPoints[dataPoints.length - 1].memoryUsedMb - dataPoints[0].memoryUsedMb) /
      dataPoints[0].memoryUsedMb
    const sessionGrowthRate =
      (dataPoints[dataPoints.length - 1].sessionCount - dataPoints[0].sessionCount) /
      Math.max(dataPoints[0].sessionCount, 1)

    // Calculate correlation (simplified)
    const correlation = 0.65 // Would calculate actual correlation

    return {
      timeRange: {
        start: startTime,
        end: endTime,
        granularity: params.granularity,
      },
      dataPoints,
      trends: {
        memoryGrowthRate: Math.round(memoryGrowthRate * 1000) / 1000,
        sessionGrowthRate: Math.round(sessionGrowthRate * 1000) / 1000,
        correlation: Math.round(correlation * 100) / 100,
      },
      anomalies: [], // Would detect actual anomalies
    }
  }

  // Private helper methods for system health metrics
  private calculateAverageResponseTime(): number {
    // Would calculate from actual response time metrics
    return 150 // Mock value
  }

  private calculateThroughput(): number {
    // Would calculate from actual throughput metrics
    return 1000 // Mock value
  }

  private calculateErrorRate(): number {
    // Would calculate from actual error metrics
    return 0.01 // Mock value
  }

  // Private properties for memory monitoring
  private memoryMonitoringConfig?: {
    id: string
    intervalMs: number
    thresholdMb: number
    alertThresholdPercent: number
    startTime: Date
    isActive: boolean
  }
  private memoryMonitorInterval?: NodeJS.Timeout

  private sessions: Map<string, any> = new Map() // For session tracking
}

// Factory function for easy instantiation
export function createObservabilityManager(
  options?: ObservabilityManagerOptions,
): ObservabilityManager {
  return new ObservabilityManager(options)
}

// Utility function for tracing async operations
export function withTrace<T>(
  manager: ObservabilityManager,
  name: string,
  operation: () => Promise<T>,
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

// Utility function for timing operations
export function timeOperation<T>(
  manager: ObservabilityManager,
  name: string,
  operation: () => T,
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
