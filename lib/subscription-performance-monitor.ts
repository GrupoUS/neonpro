/**
 * Subscription Performance Monitor
 * 
 * Advanced performance monitoring system for subscription operations.
 * Tracks metrics, identifies bottlenecks, and provides optimization recommendations.
 * 
 * @author NeonPro Development Team
 * @version 1.0.0
 */

export interface PerformanceMetrics {
  subscriptionChecks: {
    total: number
    successful: number
    failed: number
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
  }
  caching: {
    hitRate: number
    missRate: number
    averageRetrievalTime: number
    totalCacheSize: number
    evictionCount: number
  }
  database: {
    queryCount: number
    averageQueryTime: number
    slowQueries: number
    connectionPoolUsage: number
  }
  realtime: {
    activeConnections: number
    messagesPerSecond: number
    averageLatency: number
    reconnectRate: number
  }
}

export interface PerformanceAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  component: 'subscription' | 'cache' | 'database' | 'realtime'
  message: string
  metric: string
  value: number
  threshold: number
  timestamp: Date
  resolved: boolean
}

export interface OptimizationRecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  component: string
  issue: string
  recommendation: string
  estimatedImpact: string
  implementationEffort: 'low' | 'medium' | 'high'
}

export class SubscriptionPerformanceMonitor {
  private metrics: PerformanceMetrics
  private alerts: PerformanceAlert[] = []
  private recommendations: OptimizationRecommendation[] = []
  private timers: Map<string, number> = new Map()
  private responseTimeHistory: number[] = []
  private maxHistorySize = 1000

  // Performance thresholds
  private readonly thresholds = {
    responseTime: {
      warning: 200,
      critical: 500,
    },
    cacheHitRate: {
      warning: 0.85,
      critical: 0.70,
    },
    dbQueryTime: {
      warning: 100,
      critical: 300,
    },
    realtimeLatency: {
      warning: 1000,
      critical: 3000,
    }
  }

  constructor() {
    this.metrics = {
      subscriptionChecks: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      },
      caching: {
        hitRate: 0,
        missRate: 0,
        averageRetrievalTime: 0,
        totalCacheSize: 0,
        evictionCount: 0,
      },
      database: {
        queryCount: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        connectionPoolUsage: 0,
      },
      realtime: {
        activeConnections: 0,
        messagesPerSecond: 0,
        averageLatency: 0,
        reconnectRate: 0,
      },
    }

    // Start background monitoring
    this.startMonitoring()
  }

  /**
   * Start timing a subscription operation
   */
  startTimer(operation: string): string {
    const timerId = `${operation}_${Date.now()}_${Math.random()}`
    this.timers.set(timerId, performance.now())
    return timerId
  }

  /**
   * End timing and record metrics
   */
  endTimer(timerId: string, success: boolean = true): number {
    const startTime = this.timers.get(timerId)
    if (!startTime) {
      console.warn(`Timer ${timerId} not found`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(timerId)

    // Record metrics
    this.recordSubscriptionCheck(duration, success)
    
    return duration
  }

  /**
   * Record subscription check metrics
   */
  private recordSubscriptionCheck(duration: number, success: boolean): void {
    this.metrics.subscriptionChecks.total++
    
    if (success) {
      this.metrics.subscriptionChecks.successful++
    } else {
      this.metrics.subscriptionChecks.failed++
    }

    // Update response time history
    this.responseTimeHistory.push(duration)
    if (this.responseTimeHistory.length > this.maxHistorySize) {
      this.responseTimeHistory.shift()
    }

    // Calculate percentiles
    this.updateResponseTimeMetrics()

    // Check for performance alerts
    this.checkPerformanceAlerts('responseTime', duration)
  }

  /**
   * Record cache operation metrics
   */
  recordCacheOperation(hit: boolean, retrievalTime: number): void {
    if (hit) {
      this.metrics.caching.hitRate = this.calculateHitRate(true)
    } else {
      this.metrics.caching.missRate = this.calculateHitRate(false)
    }

    this.metrics.caching.averageRetrievalTime = this.updateAverage(
      this.metrics.caching.averageRetrievalTime,
      retrievalTime,
      this.metrics.subscriptionChecks.total
    )

    // Check cache performance
    this.checkPerformanceAlerts('cacheHitRate', this.metrics.caching.hitRate)
  }

  /**
   * Record database operation metrics
   */
  recordDatabaseOperation(queryTime: number): void {
    this.metrics.database.queryCount++
    
    this.metrics.database.averageQueryTime = this.updateAverage(
      this.metrics.database.averageQueryTime,
      queryTime,
      this.metrics.database.queryCount
    )

    if (queryTime > this.thresholds.dbQueryTime.critical) {
      this.metrics.database.slowQueries++
    }

    this.checkPerformanceAlerts('dbQueryTime', queryTime)
  }

  /**
   * Record realtime operation metrics
   */
  recordRealtimeOperation(latency: number, connectionsCount: number): void {
    this.metrics.realtime.averageLatency = this.updateAverage(
      this.metrics.realtime.averageLatency,
      latency,
      connectionsCount
    )
    
    this.metrics.realtime.activeConnections = connectionsCount

    this.checkPerformanceAlerts('realtimeLatency', latency)
  }

  /**
   * Update response time percentiles
   */
  private updateResponseTimeMetrics(): void {
    if (this.responseTimeHistory.length === 0) return

    const sorted = [...this.responseTimeHistory].sort((a, b) => a - b)
    const p95Index = Math.floor(sorted.length * 0.95)
    const p99Index = Math.floor(sorted.length * 0.99)

    this.metrics.subscriptionChecks.averageResponseTime = 
      this.responseTimeHistory.reduce((a, b) => a + b, 0) / this.responseTimeHistory.length

    this.metrics.subscriptionChecks.p95ResponseTime = sorted[p95Index] || 0
    this.metrics.subscriptionChecks.p99ResponseTime = sorted[p99Index] || 0
  }

  /**
   * Calculate hit rate
   */
  private calculateHitRate(hit: boolean): number {
    // This would integrate with actual cache stats
    return hit ? 0.95 : 0.05 // Placeholder
  }

  /**
   * Update running average
   */
  private updateAverage(currentAverage: number, newValue: number, count: number): number {
    return (currentAverage * (count - 1) + newValue) / count
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metric: string, value: number): void {
    const thresholdConfig = this.getThresholdConfig(metric)
    if (!thresholdConfig) return

    if (value >= thresholdConfig.critical) {
      this.createAlert('critical', metric, value, thresholdConfig.critical)
    } else if (value >= thresholdConfig.warning) {
      this.createAlert('warning', metric, value, thresholdConfig.warning)
    }
  }

  /**
   * Get threshold configuration for metric
   */
  private getThresholdConfig(metric: string) {
    switch (metric) {
      case 'responseTime':
        return this.thresholds.responseTime
      case 'cacheHitRate':
        return { warning: this.thresholds.cacheHitRate.warning, critical: this.thresholds.cacheHitRate.critical }
      case 'dbQueryTime':
        return this.thresholds.dbQueryTime
      case 'realtimeLatency':
        return this.thresholds.realtimeLatency
      default:
        return null
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(type: 'warning' | 'critical', metric: string, value: number, threshold: number): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      component: this.getComponentForMetric(metric),
      message: this.getAlertMessage(metric, value, threshold),
      metric,
      value,
      threshold,
      timestamp: new Date(),
      resolved: false,
    }

    this.alerts.push(alert)

    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }

    // Generate recommendations
    this.generateRecommendations(metric, value, threshold)
  }

  /**
   * Get component name for metric
   */
  private getComponentForMetric(metric: string): PerformanceAlert['component'] {
    if (metric.includes('cache')) return 'cache'
    if (metric.includes('db') || metric.includes('Query')) return 'database'
    if (metric.includes('realtime') || metric.includes('Latency')) return 'realtime'
    return 'subscription'
  }

  /**
   * Generate alert message
   */
  private getAlertMessage(metric: string, value: number, threshold: number): string {
    const messages = {
      responseTime: `Subscription response time (${value.toFixed(2)}ms) exceeds threshold (${threshold}ms)`,
      cacheHitRate: `Cache hit rate (${(value * 100).toFixed(2)}%) below threshold (${(threshold * 100).toFixed(2)}%)`,
      dbQueryTime: `Database query time (${value.toFixed(2)}ms) exceeds threshold (${threshold}ms)`,
      realtimeLatency: `Realtime latency (${value.toFixed(2)}ms) exceeds threshold (${threshold}ms)`,
    }

    return messages[metric as keyof typeof messages] || `${metric} performance issue detected`
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(metric: string, value: number, threshold: number): void {
    const recommendations: Record<string, OptimizationRecommendation> = {
      responseTime: {
        id: `rec_${Date.now()}_response_time`,
        priority: 'high',
        component: 'Subscription Middleware',
        issue: 'High response times for subscription checks',
        recommendation: 'Implement Redis caching layer and optimize database queries',
        estimatedImpact: '60-80% reduction in response time',
        implementationEffort: 'medium',
      },
      cacheHitRate: {
        id: `rec_${Date.now()}_cache_hit`,
        priority: 'medium',
        component: 'Cache System',
        issue: 'Low cache hit rate affecting performance',
        recommendation: 'Increase cache TTL and implement cache warming strategies',
        estimatedImpact: '20-40% improvement in response time',
        implementationEffort: 'low',
      },
      dbQueryTime: {
        id: `rec_${Date.now()}_db_query`,
        priority: 'high',
        component: 'Database',
        issue: 'Slow database queries',
        recommendation: 'Add database indexes and optimize query patterns',
        estimatedImpact: '50-70% reduction in query time',
        implementationEffort: 'medium',
      },
    }

    const recommendation = recommendations[metric]
    if (recommendation && !this.recommendations.find(r => r.component === recommendation.component)) {
      this.recommendations.push(recommendation)
    }
  }

  /**
   * Start background monitoring
   */
  private startMonitoring(): void {
    setInterval(() => {
      this.collectSystemMetrics()
    }, 30000) // Every 30 seconds
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    // Collect memory usage
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      // Update cache size estimate
      this.metrics.caching.totalCacheSize = memUsage.heapUsed
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Get active alerts
   */
  getAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): OptimizationRecommendation[] {
    return [...this.recommendations]
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    metrics: PerformanceMetrics
    alerts: PerformanceAlert[]
    recommendations: OptimizationRecommendation[]
    summary: {
      overallHealth: 'excellent' | 'good' | 'warning' | 'critical'
      primaryIssues: string[]
      topRecommendations: string[]
    }
  } {
    const activeAlerts = this.getAlerts()
    const criticalAlerts = activeAlerts.filter(a => a.type === 'critical')
    const warningAlerts = activeAlerts.filter(a => a.type === 'warning')

    let overallHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent'
    
    if (criticalAlerts.length > 0) {
      overallHealth = 'critical'
    } else if (warningAlerts.length > 2) {
      overallHealth = 'warning'
    } else if (warningAlerts.length > 0) {
      overallHealth = 'good'
    }

    const primaryIssues = activeAlerts
      .slice(0, 3)
      .map(alert => alert.message)

    const topRecommendations = this.recommendations
      .filter(r => r.priority === 'high')
      .slice(0, 3)
      .map(r => r.recommendation)

    return {
      metrics: this.getMetrics(),
      alerts: activeAlerts,
      recommendations: this.getRecommendations(),
      summary: {
        overallHealth,
        primaryIssues,
        topRecommendations,
      },
    }
  }
}

// Global performance monitor instance
export const subscriptionPerformanceMonitor = new SubscriptionPerformanceMonitor()
