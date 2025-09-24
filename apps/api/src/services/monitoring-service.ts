/**
 * Comprehensive Monitoring and Observability Service
 *
 * Provides centralized monitoring for AI agent system with healthcare compliance,
 * performance tracking, security monitoring, and real-time alerts.
 *
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, CFM
 */

import { RedisCacheBackend } from '@neonpro/shared/src/services/redis-cache-backend'
import { logger } from '../lib/logger'
import { WebSocketSecurityMiddleware } from '../middleware/websocket-security-middleware'
import { getErrorTrackingHealth } from '../services/error-tracking-init'
import { EnhancedAIDataService } from './enhanced-ai-data-service'

/**
 * Monitoring metrics structure
 */
export interface MonitoringMetrics {
  system: {
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage: NodeJS.CpuUsage
    diskUsage: {
      total: number
      used: number
      free: number
      percentage: number
    }
  }
  performance: {
    avgResponseTime: number
    requestsPerSecond: number
    errorRate: number
    slowQueries: number
    cacheHitRate: number
    databaseConnections: number
  }
  security: {
    authenticationFailures: number
    authorizationFailures: number
    suspiciousActivities: number
    rateLimitViolations: number
    securityEvents: SecurityEvent[]
  }
  healthcare: {
    lgpdCompliance: boolean
    dataAccessAudit: DataAccessRecord[]
    consentViolations: number
    dataRetentionCompliance: boolean
  }
  ai: {
    activeSessions: number
    totalQueries: number
    avgProcessingTime: number
    successRate: number
    errorAnalysis: AIPerformanceMetrics
  }
}

/**
 * Security event structure
 */
export interface SecurityEvent {
  id: string
  timestamp: Date
  type:
    | 'authentication_failure'
    | 'authorization_failure'
    | 'suspicious_activity'
    | 'rate_limit_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  _userId?: string
  ipAddress: string
  userAgent?: string
  metadata?: Record<string, any>
}

/**
 * Data access audit record
 */
export interface DataAccessRecord {
  id: string
  timestamp: Date
  _userId: string
  resourceType:
    | 'client_data'
    | 'appointments'
    | 'financial'
    | 'medical_records'
  resourceId: string
  action: 'read' | 'write' | 'delete'
  ipAddress: string
  success: boolean
  errorMessage?: string
}

/**
 * AI performance metrics
 */
export interface AIPerformanceMetrics {
  queryTypes: Record<string, number>
  avgResponseByType: Record<string, number>
  errorRatesByType: Record<string, number>
  cacheEffectiveness: number
  databaseLoad: number
}

/**
 * Comprehensive monitoring service
 */
export class MonitoringService {
  private metrics: MonitoringMetrics
  private securityEvents: SecurityEvent[] = []
  private dataAccessRecords: DataAccessRecord[] = []
  private startTime: Date
  private healthCheckInterval?: NodeJS.Timeout
  private metricsInterval?: NodeJS.Timeout
  private cleanupInterval?: NodeJS.Timeout

  // Service references
  private dataService?: EnhancedAIDataService
  private wsSecurity?: WebSocketSecurityMiddleware
  private cache?: RedisCacheBackend

  constructor() {
    this.startTime = new Date()
    this.metrics = this.initializeMetrics()

    // Start monitoring processes
    this.startMonitoring()
  }

  /**
   * Initialize monitoring metrics
   */
  private initializeMetrics(): MonitoringMetrics {
    return {
      system: {
        uptime: 0,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        diskUsage: { total: 0, used: 0, free: 0, percentage: 0 },
      },
      performance: {
        avgResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0,
        slowQueries: 0,
        cacheHitRate: 0,
        databaseConnections: 0,
      },
      security: {
        authenticationFailures: 0,
        authorizationFailures: 0,
        suspiciousActivities: 0,
        rateLimitViolations: 0,
        securityEvents: [],
      },
      healthcare: {
        lgpdCompliant: true,
        dataAccessAudit: [],
        consentViolations: 0,
        dataRetentionCompliance: true,
      },
      ai: {
        activeSessions: 0,
        totalQueries: 0,
        avgProcessingTime: 0,
        successRate: 0,
        errorAnalysis: {
          queryTypes: {},
          avgResponseByType: {},
          errorRatesByType: {},
          cacheEffectiveness: 0,
          databaseLoad: 0,
        },
      },
    }
  }

  /**
   * Set service references for comprehensive monitoring
   */
  setServices(
    dataService: EnhancedAIDataService,
    wsSecurity: WebSocketSecurityMiddleware,
    cache: RedisCacheBackend,
  ): void {
    this.dataService = dataService
    this.wsSecurity = wsSecurity
    this.cache = cache
  }

  /**
   * Start monitoring processes
   */
  private startMonitoring(): void {
    // Health checks every 30 seconds
    this.healthCheckInterval = setInterval(
      () => this.performHealthChecks(),
      30000,
    )

    // Metrics collection every 10 seconds
    this.metricsInterval = setInterval(() => this.collectMetrics(), 10000)

    // Cleanup old data every hour
    this.cleanupInterval = setInterval(() => this.cleanupOldData(), 3600000)
  }

  /**
   * Perform comprehensive health checks
   */
  private async performHealthChecks(): Promise<void> {
    try {
      // System health
      await this.checkSystemHealth()

      // Service health
      await this.checkServiceHealth()

      // Database health
      await this.checkDatabaseHealth()

      // Cache health
      await this.checkCacheHealth()

      // Security health
      await this.checkSecurityHealth()
    } catch {
      // Error caught but not used - handled by surrounding logic
      logger.error('Health check failed:', error)
    }
  }

  /**
   * Check system health
   */
  private async checkSystemHealth(): Promise<void> {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    const uptime = process.uptime()

    this.metrics.system = {
      uptime,
      memoryUsage: memUsage,
      cpuUsage,
      diskUsage: await this.getDiskUsage(),
    }

    // Check for memory leaks
    if (memUsage.heapUsed > 500 * 1024 * 1024) {
      // 500MB
      logger.warn('High memory usage detected', {
        heapUsed: memUsage.heapUsed,
      })
    }

    // Check for high CPU usage
    const cpuPercent = this.calculateCPUUsage(cpuUsage)
    if (cpuPercent > 80) {
      logger.warn('High CPU usage detected', { cpuPercent })
    }
  }

  /**
   * Check service health
   */
  private async checkServiceHealth(): Promise<void> {
    if (!this.dataService) return

    try {
      const health = await this.dataService.healthCheck()

      if (!health.cache.healthy || !health.database.healthy) {
        logger.error('Service health check failed', health)
      }
    } catch {
      // Error caught but not used - handled by surrounding logic
      logger.error('Service health check error:', error)
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<void> {
    try {
      // Check database connectivity and performance
      const startTime = Date.now()

      // This would be implemented with actual database health checks
      const _dbHealthy = true // Placeholder

      const responseTime = Date.now() - startTime

      if (responseTime > 2000) {
        // > 2s is concerning
        logger.warn('Slow database response', { responseTime })
      }
    } catch {
      // Error caught but not used - handled by surrounding logic
      logger.error('Database health check failed:', error)
    }
  }

  /**
   * Check cache health
   */
  private async checkCacheHealth(): Promise<void> {
    if (!this.cache) return

    try {
      const stats = await this.cache.getStats()
      this.metrics.performance.cacheHitRate = stats.hitRate

      if (stats.hitRate < 0.3) {
        logger.warn('Low cache hit rate', { hitRate: stats.hitRate })
      }
    } catch {
      // Error caught but not used - handled by surrounding logic
      logger.error('Cache health check failed:', error)
    }
  }

  /**
   * Check security health
   */
  private async checkSecurityHealth(): Promise<void> {
    try {
      const _errorTracking = getErrorTrackingHealth()

      // Check for recent security events
      const recentEvents = this.securityEvents.filter(
        (event) => Date.now() - event.timestamp.getTime() < 300000, // 5 minutes
      )

      if (recentEvents.length > 10) {
        logger.error('High volume of security events detected', {
          count: recentEvents.length,
        })
      }
    } catch {
      // Error caught but not used - handled by surrounding logic
      logger.error('Security health check failed:', error)
    }
  }

  /**
   * Collect comprehensive metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      // Update system metrics
      this.metrics.system.uptime = process.uptime()
      this.metrics.system.memoryUsage = process.memoryUsage()

      // Update performance metrics
      await this.updatePerformanceMetrics()

      // Update AI metrics
      await this.updateAIMetrics()
    } catch {
      // Error caught but not used - handled by surrounding logic
      logger.error('Metrics collection failed:', error)
    }
  }

  /**
   * Update performance metrics
   */
  private async updatePerformanceMetrics(): Promise<void> {
    if (this.dataService) {
      try {
        const cacheStats = await this.dataService.getCacheStats()
        this.metrics.performance.cacheHitRate = cacheStats.customStats?.hitRate || 0
      } catch {
        // Error caught but not used - handled by surrounding logic
        logger.error('Failed to update performance metrics:', error)
      }
    }
  }

  /**
   * Update AI metrics
   */
  private async updateAIMetrics(): Promise<void> {
    // This would collect AI-specific metrics from active sessions
    // For now, we'll maintain basic counters
  }

  /**
   * Record security event
   */
  recordSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
    }

    this.securityEvents.push(securityEvent)
    this.metrics.security.securityEvents.push(securityEvent)

    // Update counters
    switch (event.type) {
      case 'authentication_failure':
        this.metrics.security.authenticationFailures++
        break
      case 'authorization_failure':
        this.metrics.security.authorizationFailures++
        break
      case 'suspicious_activity':
        this.metrics.security.suspiciousActivities++
        break
      case 'rate_limit_violation':
        this.metrics.security.rateLimitViolations++
        break
    }

    // Log high severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      logger.error('High severity security event', securityEvent)
    }
  }

  /**
   * Record data access
   */
  recordDataAccess(record: Omit<DataAccessRecord, 'id' | 'timestamp'>): void {
    const accessRecord: DataAccessRecord = {
      ...record,
      id: this.generateId(),
      timestamp: new Date(),
    }

    this.dataAccessRecords.push(accessRecord)
    this.metrics.healthcare.dataAccessAudit.push(accessRecord)

    // Check for compliance violations
    if (!record.success) {
      this.metrics.healthcare.consentViolations++
      logger.warn('Data access violation', accessRecord)
    }
  }

  /**
   * Get comprehensive monitoring dashboard
   */
  async getDashboard(): Promise<{
    overview: {
      status: 'healthy' | 'degraded' | 'critical'
      uptime: string
      activeUsers: number
      systemLoad: number
    }
    metrics: MonitoringMetrics
    alerts: Alert[]
    recommendations: Recommendation[]
  }> {
    const status = this.calculateSystemStatus()
    const alerts = this.generateAlerts()
    const recommendations = this.generateRecommendations()

    return {
      overview: {
        status,
        uptime: this.formatUptime(this.metrics.system.uptime),
        activeUsers: this.metrics.ai.activeSessions,
        systemLoad: this.calculateSystemLoad(),
      },
      metrics: this.metrics,
      alerts,
      recommendations,
    }
  }

  /**
   * Calculate system status
   */
  private calculateSystemStatus(): 'healthy' | 'degraded' | 'critical' {
    const memUsage = this.metrics.system.memoryUsage.heapUsed
    const cpuPercent = this.calculateCPUUsage(this.metrics.system.cpuUsage)
    const errorRate = this.metrics.performance.errorRate
    const recentSecurityEvents = this.securityEvents.filter(
      (event) => Date.now() - event.timestamp.getTime() < 300000, // 5 minutes
    ).length

    if (
      memUsage > 800 * 1024 * 1024
      || cpuPercent > 90
      || errorRate > 0.1
      || recentSecurityEvents > 20
    ) {
      return 'critical'
    }

    if (
      memUsage > 500 * 1024 * 1024
      || cpuPercent > 80
      || errorRate > 0.05
      || recentSecurityEvents > 10
    ) {
      return 'degraded'
    }

    return 'healthy'
  }

  /**
   * Generate alerts based on metrics
   */
  private generateAlerts(): Alert[] {
    const alerts: Alert[] = []

    // Memory alerts
    if (this.metrics.system.memoryUsage.heapUsed > 500 * 1024 * 1024) {
      alerts.push({
        id: this.generateId(),
        type: 'memory',
        severity: 'warning',
        message: 'High memory usage detected',
        timestamp: new Date(),
      })
    }

    // CPU alerts
    const cpuPercent = this.calculateCPUUsage(this.metrics.system.cpuUsage)
    if (cpuPercent > 80) {
      alerts.push({
        id: this.generateId(),
        type: 'cpu',
        severity: 'warning',
        message: 'High CPU usage detected',
        timestamp: new Date(),
      })
    }

    // Security alerts
    const recentSecurityEvents = this.securityEvents.filter(
      (event) => Date.now() - event.timestamp.getTime() < 300000,
    )
    if (recentSecurityEvents.length > 10) {
      alerts.push({
        id: this.generateId(),
        type: 'security',
        severity: 'critical',
        message: 'High volume of security events detected',
        timestamp: new Date(),
      })
    }

    return alerts
  }

  /**
   * Generate recommendations based on metrics
   */
  private generateRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Cache recommendations
    if (this.metrics.performance.cacheHitRate < 0.5) {
      recommendations.push({
        id: this.generateId(),
        type: 'performance',
        priority: 'high',
        title: 'Optimize Cache Strategy',
        description: 'Cache hit rate is below 50%. Consider adjusting TTL values or cache keys.',
        estimatedImpact: '20-30% performance improvement',
      })
    }

    // Memory recommendations
    if (this.metrics.system.memoryUsage.heapUsed > 500 * 1024 * 1024) {
      recommendations.push({
        id: this.generateId(),
        type: 'infrastructure',
        priority: 'medium',
        title: 'Monitor Memory Usage',
        description: 'Memory usage is elevated. Consider scaling or optimizing memory usage.',
        estimatedImpact: 'Improved stability',
      })
    }

    return recommendations
  }

  /**
   * Cleanup old data
   */
  private cleanupOldData(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

    // Cleanup old security events
    this.securityEvents = this.securityEvents.filter(
      (event) => event.timestamp.getTime() > oneDayAgo,
    )

    // Cleanup old data access records
    this.dataAccessRecords = this.dataAccessRecords.filter(
      (record) => record.timestamp.getTime() > oneDayAgo,
    )

    // Cleanup old healthcare audit records
    this.metrics.healthcare.dataAccessAudit = this.metrics.healthcare.dataAccessAudit.filter(
      (record) => new Date(record.timestamp).getTime() > oneDayAgo,
    )
  }

  /**
   * Helper methods
   */
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15)
      + Math.random().toString(36).substring(2, 15)
    )
  }

  private async getDiskUsage() {
    // This would implement actual disk usage checking
    return { total: 0, used: 0, free: 0, percentage: 0 }
  }

  private calculateCPUUsage(_cpuUsage: NodeJS.CpuUsage): number {
    // This would calculate actual CPU usage percentage
    return 0 // Placeholder
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  private calculateSystemLoad(): number {
    const memUsage = this.metrics.system.memoryUsage.heapUsed
    const cpuPercent = this.calculateCPUUsage(this.metrics.system.cpuUsage)
    return (memUsage / (1024 * 1024 * 1024)) * 0.7 + cpuPercent * 0.3 // Weighted average
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

/**
 * Alert structure
 */
interface Alert {
  id: string
  type: 'memory' | 'cpu' | 'security' | 'performance' | 'database'
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: Date
}

/**
 * Recommendation structure
 */
interface Recommendation {
  id: string
  type: 'performance' | 'security' | 'infrastructure' | 'compliance'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  estimatedImpact: string
}

/**
 * Global monitoring service instance
 */
export const monitoringService = new MonitoringService()

export default MonitoringService
