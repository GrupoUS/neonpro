/**
 * Base metrics and monitoring classes for Background Jobs Manager
 * Consolidates common patterns from circuit breaker and performance optimization services
 */

export interface MetricsEntry {
  timestamp: number
  value: number
  context?: Record<string, unknown>
}

export interface PerformanceMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  successRate: number
  healthStatus: 'healthy' | 'degraded' | 'unhealthy'
  lastUpdated: number
}

export interface CircuitBreakerMetrics extends PerformanceMetrics {
  consecutiveFailures: number
  fallbackActivations: number
  retryAttempts: number
  healthCheckResults: number
  state: 'closed' | 'open' | 'half-open'
}

export interface CacheMetrics {
  hits: number
  misses: number
  evictions: number
  size: number
  hitRate: number
  lastCleanup: number
}

export interface BatchMetrics {
  totalItems: number
  processedItems: number
  failedItems: number
  averageTimePerItem: number
  totalTime: number
  successRate: number
}

/**
 * Base metrics collector with common functionality
 */
export class BaseMetricsCollector {
  protected metrics: Map<string, MetricsEntry[]> = new Map()
  protected maxHistorySize: number = 1000
  protected cleanupInterval?: NodeJS.Timeout

  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize
    this.startCleanupInterval()
  }

  /**
   * Record a metric entry
   */
  recordMetric(key: string, value: number, context?: Record<string, unknown>): void {
    const entry: MetricsEntry = {
      timestamp: Date.now(),
      value,
      context
    }

    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }

    const entries = this.metrics.get(key)!
    entries.push(entry)

    // Maintain history size
    if (entries.length > this.maxHistorySize) {
      entries.shift()
    }
  }

  /**
   * Get recent metrics for a key
   */
  getRecentMetrics(key: string, timeWindow: number = 3600000): MetricsEntry[] {
    const entries = this.metrics.get(key) || []
    const cutoff = Date.now() - timeWindow
    return entries.filter(entry => entry.timestamp >= cutoff)
  }

  /**
   * Calculate average value for recent metrics
   */
  calculateAverage(key: string, timeWindow: number = 3600000): number {
    const entries = this.getRecentMetrics(key, timeWindow)
    if (entries.length === 0) return 0
    
    const sum = entries.reduce((acc, entry) => acc + entry.value, 0)
    return sum / entries.length
  }

  /**
   * Calculate success rate from metrics
   */
  calculateSuccessRate(successKey: string, totalKey: string, timeWindow: number = 3600000): number {
    const successEntries = this.getRecentMetrics(successKey, timeWindow)
    const totalEntries = this.getRecentMetrics(totalKey, timeWindow)
    
    if (totalEntries.length === 0) return 0
    
    const totalSuccess = successEntries.reduce((acc, entry) => acc + entry.value, 0)
    const total = totalEntries.reduce((acc, entry) => acc + entry.value, 0)
    
    return total > 0 ? (totalSuccess / total) * 100 : 0
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(key: string, timeWindow: number = 3600000): {
    count: number
    average: number
    min: number
    max: number
    latest: number
  } {
    const entries = this.getRecentMetrics(key, timeWindow)
    
    if (entries.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, latest: 0 }
    }

    const values = entries.map(e => e.value)
    return {
      count: entries.length,
      average: this.calculateAverage(key, timeWindow),
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1] || 0
    }
  }

  /**
   * Cleanup old metrics entries
   */
  protected cleanupMetrics(): void {
    const cutoff = Date.now() - this.maxHistorySize * 1000 // Convert to milliseconds
    
    for (const [key, entries] of this.metrics.entries()) {
      const filtered = entries.filter(entry => entry.timestamp >= cutoff)
      if (filtered.length === 0) {
        this.metrics.delete(key)
      } else {
        this.metrics.set(key, filtered)
      }
    }
  }

  /**
   * Start automatic cleanup interval
   */
  protected startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupMetrics()
    }, 300000) // Cleanup every 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.metrics.clear()
  }
}

/**
 * Base performance monitoring class
 */
export class BasePerformanceMonitor extends BaseMetricsCollector {
  protected healthCheckInterval?: NodeJS.Timeout
  protected lastHealthCheck: number = 0

  constructor(
    maxHistorySize: number = 1000,
    protected healthCheckIntervalMs: number = 30000
  ) {
    super(maxHistorySize)
    this.startHealthMonitoring()
  }

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    metrics: PerformanceMetrics
    checks: Record<string, boolean>
  }> {
    const startTime = Date.now()
    
    try {
      // Perform basic health checks
      const checks = await this.runHealthChecks()
      const allHealthy = Object.values(checks).every(check => check)
      const someHealthy = Object.values(checks).some(check => check)

      const status = allHealthy ? 'healthy' : 
                     someHealthy ? 'degraded' : 'unhealthy'

      const metrics = this.calculatePerformanceMetrics()

      // Record health check result
      this.recordMetric('health_checks', status === 'healthy' ? 1 : 0)
      this.recordMetric('health_check_duration', Date.now() - startTime)

      this.lastHealthCheck = Date.now()

      return { status, metrics, checks }
    } catch (error) {
      this.recordMetric('health_check_errors', 1)
      
      return {
        status: 'unhealthy',
        metrics: this.calculatePerformanceMetrics(),
        checks: { error: false }
      }
    }
  }

  /**
   * Run specific health checks (to be overridden by subclasses)
   */
  protected async runHealthChecks(): Promise<Record<string, boolean>> {
    // Default implementation - subclasses should override
    return {
      memory: this.checkMemoryUsage(),
      cpu: this.checkCpuUsage(),
      responseTime: this.checkResponseTime()
    }
  }

  /**
   * Calculate performance metrics
   */
  protected calculatePerformanceMetrics(): PerformanceMetrics {
    const totalRequests = this.calculateAverage('total_requests', 3600000)
    const successfulRequests = this.calculateAverage('successful_requests', 3600000)
    const failedRequests = this.calculateAverage('failed_requests', 3600000)
    const averageResponseTime = this.calculateAverage('response_time', 3600000)
    const successRate = this.calculateSuccessRate('successful_requests', 'total_requests', 3600000)

    // Determine health status based on metrics
    let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (successRate < 95 || averageResponseTime > 1000) {
      healthStatus = 'degraded'
    }
    
    if (successRate < 80 || averageResponseTime > 5000) {
      healthStatus = 'unhealthy'
    }

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      successRate,
      healthStatus,
      lastUpdated: Date.now()
    }
  }

  /**
   * Check memory usage
   */
  protected checkMemoryUsage(): boolean {
    const usage = process.memoryUsage()
    const heapUsedMB = usage.heapUsed / 1024 / 1024
    return heapUsedMB < 500 // 500MB threshold
  }

  /**
   * Check CPU usage (simplified)
   */
  protected checkCpuUsage(): boolean {
    // This is a simplified check - in production, you'd use a proper CPU monitoring library
    return true
  }

  /**
   * Check response time
   */
  protected checkResponseTime(): boolean {
    const avgResponseTime = this.calculateAverage('response_time', 300000) // 5 minutes
    return avgResponseTime < 1000 // 1 second threshold
  }

  /**
   * Start health monitoring
   */
  protected startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck()
    }, this.healthCheckIntervalMs)
  }

  /**
   * Stop health monitoring
   */
  destroy(): void {
    super.destroy()
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
  }
}

/**
 * Base circuit breaker metrics collector
 */
export class BaseCircuitBreakerMetrics extends BasePerformanceMonitor {
  protected circuitState: 'closed' | 'open' | 'half-open' = 'closed'
  protected consecutiveFailures: number = 0

  constructor(
    maxHistorySize: number = 1000,
    healthCheckIntervalMs: number = 30000
  ) {
    super(maxHistorySize, healthCheckIntervalMs)
  }

  /**
   * Record circuit breaker state change
   */
  recordStateChange(
    fromState: 'closed' | 'open' | 'half-open',
    toState: 'closed' | 'open' | 'half-open',
    reason?: string
  ): void {
    this.circuitState = toState
    this.recordMetric('state_changes', 1, { fromState, toState, reason })
    
    // Reset consecutive failures on state change
    if (toState === 'closed') {
      this.consecutiveFailures = 0
    }
  }

  /**
   * Record request success
   */
  recordSuccess(responseTime: number): void {
    this.recordMetric('successful_requests', 1)
    this.recordMetric('response_time', responseTime)
    this.recordMetric('total_requests', 1)
    
    // Reset consecutive failures on success
    this.consecutiveFailures = 0
  }

  /**
   * Record request failure
   */
  recordFailure(error?: Error): void {
    this.recordMetric('failed_requests', 1)
    this.recordMetric('total_requests', 1)
    this.consecutiveFailures++
    
    this.recordMetric('consecutive_failures', this.consecutiveFailures)
    
    if (error) {
      this.recordMetric('error_occurrences', 1, { 
        errorType: error.constructor.name,
        message: error.message 
      })
    }
  }

  /**
   * Record fallback activation
   */
  recordFallbackActivation(): void {
    this.recordMetric('fallback_activations', 1)
  }

  /**
   * Record health check result
   */
  recordHealthCheckResult(success: boolean, responseTime?: number): void {
    this.recordMetric('health_check_results', success ? 1 : 0)
    if (responseTime) {
      this.recordMetric('health_check_response_time', responseTime)
    }
  }

  /**
   * Get circuit breaker specific metrics
   */
  getCircuitBreakerMetrics(): CircuitBreakerMetrics {
    const baseMetrics = this.calculatePerformanceMetrics()
    
    return {
      ...baseMetrics,
      consecutiveFailures: this.consecutiveFailures,
      fallbackActivations: this.calculateAverage('fallback_activations', 3600000),
      retryAttempts: this.calculateAverage('retry_attempts', 3600000),
      healthCheckResults: this.calculateAverage('health_check_results', 3600000),
      state: this.circuitState
    }
  }

  /**
   * Override health checks for circuit breaker specific checks
   */
  protected async runHealthChecks(): Promise<Record<string, boolean>> {
    const baseChecks = await super.runHealthChecks()
    
    return {
      ...baseChecks,
      circuitState: this.circuitState === 'closed',
      failureRate: this.calculateSuccessRate('successful_requests', 'total_requests', 300000) > 80,
      responseTime: this.calculateAverage('response_time', 300000) < 1000
    }
  }
}