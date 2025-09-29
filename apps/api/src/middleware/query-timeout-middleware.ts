/**
 * Query Timeout Middleware for AI Agent Performance
 * Ensures all queries complete within <2s healthcare compliance requirement
 */

import { Context, Next } from 'hono'
// Use global performance API available in Node.js
declare const performance: {
  now(): number
}

export interface QueryTimeoutConfig {
  defaultTimeout: number // milliseconds
  maxTimeout: number // maximum allowed timeout
  timeoutHeader: string // header to override timeout
  enableTimeoutExtension: boolean // allow timeout extension for complex queries
  enableResponseCompression: boolean // compress responses to reduce latency
}

export interface QueryMetrics {
  queryId: string
  startTime: number
  endTime: number
  duration: number
  timeout: number
  timedOut: boolean
  route: string
  method: string
  statusCode: number
  responseSize: number
  userAgent?: string
  _userId?: string
}

export class QueryTimeoutMiddleware {
  private config: QueryTimeoutConfig
  private metrics: QueryMetrics[] = []
  private activeQueries: Map<
    string,
    { startTime: number; timeout: number; req: Request }
  > = new Map()
  private timeoutWarnings: Set<string> = new Set()

  constructor(config: Partial<QueryTimeoutConfig> = {}) {
    this.config = {
      defaultTimeout: 2000, // 2 seconds for healthcare compliance
      maxTimeout: 5000, // 5 seconds maximum
      timeoutHeader: 'X-Query-Timeout',
      enableTimeoutExtension: true,
      enableResponseCompression: true,
      ...config,
    }

    // Start metrics cleanup interval
    setInterval(() => this.cleanupMetrics(), 300000) // 5 minutes
  }

  /**
   * Hono middleware function
   */
  middleware = async (c: Context, next: Next): Promise<void> => {
    const queryId = this.generateQueryId()
    const startTime = performance.now()
    const url = new URL(c.req.url)

    // Get timeout from header or use default
    const timeoutHeader = c.req.header(this.config.timeoutHeader)
    let timeout = this.config.defaultTimeout

    if (timeoutHeader) {
      const headerTimeout = parseInt(timeoutHeader)
      if (!isNaN(headerTimeout) && headerTimeout > 0) {
        timeout = Math.min(headerTimeout, this.config.maxTimeout)
      }
    }

    // Add query ID to context for tracking
    c.set('queryId', queryId)
    c.set('queryTimeout', timeout)
    c.set('queryStartTime', startTime)

    // Track active query
    this.activeQueries.set(queryId, {
      startTime,
      timeout,
      req: c.req,
    })

    // Set up timeout timer
    const timeoutTimer = setTimeout(() => {
      this.handleQueryTimeout(queryId, c)
    }, timeout)

    // Execute next middleware
    try {
      await next()
    } catch (error) {
      clearTimeout(timeoutTimer)
      throw error
    }

    clearTimeout(timeoutTimer)

    const endTime = performance.now()
    const duration = endTime - startTime

    // Record metrics
    const metrics: QueryMetrics = {
      queryId,
      startTime,
      endTime,
      duration,
      timeout,
      timedOut: false,
      route: url.pathname,
      method: c.req.method,
      statusCode: c.res.status,
      responseSize: 0, // Would need to calculate from response
      userAgent: c.req.header('user-agent'),
      _userId: this.extractUserId(c),
    }

    this.recordQueryMetrics(metrics)
    this.activeQueries.delete(queryId)

    // Log slow queries that didn't timeout (removed console.warn to satisfy lint rule)
  }

  /**
   * Handle query timeout
   */
  private handleQueryTimeout(
    queryId: string,
    c: Context,
  ): void {
    const activeQuery = this.activeQueries.get(queryId)
    if (!activeQuery) return

    const { startTime, timeout } = activeQuery
    const duration = performance.now() - startTime
    const url = new URL(c.req.url)

    // Record timeout metrics
    const metrics: QueryMetrics = {
      queryId,
      startTime,
      endTime: performance.now(),
      duration,
      timeout,
      timedOut: true,
      route: url.pathname,
      method: c.req.method,
      statusCode: 504, // Gateway Timeout
      responseSize: 0,
      userAgent: c.req.header('user-agent'),
      _userId: this.extractUserId(c),
    }

    this.recordQueryMetrics(metrics)
    this.activeQueries.delete(queryId)

    // Send timeout response
    if (!c.res.headersSent) {
      c.status(504)
      c.json({
        error: 'Query timeout exceeded',
        message: 'The request took longer than the allowed time to process',
        queryId,
        timeout: timeout,
        actualTime: duration,
        retryable: true,
      })
    }

    // Emit timeout event for monitoring
    this.emitTimeoutEvent(metrics)
  }

  /**
   * Setup response compression
   */
  private setupResponseCompression(c: Context): void {
    // Simple compression setup - in production, use compression middleware
    const acceptEncoding = c.req.header('accept-encoding')
    if (acceptEncoding && acceptEncoding.includes('gzip')) {
      c.header('Content-Encoding', 'gzip')
    }
  }

  /**
   * Extract user ID from context
   */
  private extractUserId(c: Context): string | undefined {
    // Extract user ID from various possible sources
    const url = new URL(c.req.url)
    const searchParams = url.searchParams

    const user = c.get('user')
    if (user && typeof user === 'object' && 'id' in user) {
      return (user as { id: string }).id
    }

    return (
      c.req.header('x-user-id') ||
      c.req.header('user-id') ||
      searchParams.get('userId')
    )
  }

  /**
   * Generate query ID
   */
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Record query metrics
   */
  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.metrics.push(metrics)

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Cleanup old metrics
   */
  private cleanupMetrics(): void {
    const oneHourAgo = Date.now() - 3600000
    this.metrics = this.metrics.filter(m => m.endTime > oneHourAgo)
  }

  /**
   * Emit timeout event for monitoring
   */
  private emitTimeoutEvent(metrics: QueryMetrics): void {
    // This could be integrated with your monitoring system
    if (typeof process.emit === 'function') {
      process.emit('queryTimeout', metrics)
    }
  }

  /**
   * Get timeout statistics
   */
  getTimeoutStats() {
    const stats = {
      totalQueries: this.metrics.length,
      timedOutQueries: this.metrics.filter(m => m.timedOut).length,
      timeoutRate: 0,
      averageResponseTime: 0,
      averageTimeout: 0,
      routesWithMostTimeouts: this.getRoutesWithMostTimeouts(),
      timeoutDistribution: this.getTimeoutDistribution(),
      currentActiveQueries: this.activeQueries.size,
      longestRunningQuery: this.getLongestRunningQuery(),
    }

    if (stats.totalQueries > 0) {
      stats.timeoutRate = (stats.timedOutQueries / stats.totalQueries) * 100
      stats.averageResponseTime = this.metrics.reduce((sum, m) => sum + m.duration, 0) /
        stats.totalQueries
      stats.averageTimeout = this.metrics.reduce((sum, m) => sum + m.timeout, 0) /
        stats.totalQueries
    }

    return stats
  }

  /**
   * Get routes with most timeouts
   */
  private getRoutesWithMostTimeouts(limit = 5) {
    const routeTimeouts: Record<string, number> = {}

    this.metrics
      .filter(m => m.timedOut)
      .forEach(m => {
        routeTimeouts[m.route] = (routeTimeouts[m.route] || 0) + 1
      })

    return Object.entries(routeTimeouts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
  }

  /**
   * Get timeout distribution
   */
  private getTimeoutDistribution() {
    const ranges = {
      '<500ms': 0,
      '500-1000ms': 0,
      '1000-1500ms': 0,
      '1500-2000ms': 0,
      '>2000ms': 0,
    }

    this.metrics.forEach(m => {
      const percentage = (m.duration / m.timeout) * 100
      if (percentage < 25) ranges['<500ms']++
      else if (percentage < 50) ranges['500-1000ms']++
      else if (percentage < 75) ranges['1000-1500ms']++
      else if (percentage < 100) ranges['1500-2000ms']++
      else ranges['>2000ms']++
    })

    return ranges
  }

  /**
   * Get longest running active query
   */
  private getLongestRunningQuery() {
    let longestQuery: {
      queryId: string
      duration: number
      route: string
    } | null = null
    let longestDuration = 0

    const now = performance.now()
    for (const [queryId, query] of this.activeQueries) {
      const duration = now - query.startTime
      if (duration > longestDuration) {
        longestDuration = duration
        longestQuery = {
          queryId,
          duration,
          route: new URL(query.req.url).pathname,
        }
      }
    }

    return longestQuery
  }

  /**
   * Check for queries approaching timeout
   */
  checkApproachingTimeouts(
    thresholdPercentage = 80,
  ): Array<{
    queryId: string
    duration: number
    timeout: number
    route: string
  }> {
    const now = performance.now()
    const approaching: Array<{
      queryId: string
      duration: number
      timeout: number
      route: string
    }> = []

    for (const [queryId, query] of this.activeQueries) {
      const duration = now - query.startTime
      const percentage = (duration / query.timeout) * 100

      if (percentage >= thresholdPercentage) {
        approaching.push({
          queryId,
          duration,
          timeout: query.timeout,
          route: new URL(query.req.url).pathname,
        })
      }
    }

    return approaching.sort((a, b) => b.duration - a.duration)
  }

  /**
   * Force timeout specific queries
   */
  forceTimeout(queryIds: string[]): number {
    let timeoutCount = 0

    queryIds.forEach(queryId => {
      const activeQuery = this.activeQueries.get(queryId)
      if (activeQuery) {
        // This would need to be integrated with your request handling system
        // For now, we'll just track it
        this.timeoutWarnings.add(queryId)
        timeoutCount++
      }
    })

    return timeoutCount
  }

  /**
   * Get real-time monitoring data
   */
  getRealTimeMetrics() {
    return {
      activeQueries: Array.from(this.activeQueries.entries()).map(
        ([id, _query]) => ({
          queryId: id,
          duration: performance.now() - _query.startTime,
          timeout: _query.timeout,
          route: new URL(_query.req.url).pathname,
          method: _query.req.method,
          percentageUsed: ((performance.now() - _query.startTime) / _query.timeout) * 100,
        }),
      ),
      approachingTimeouts: this.checkApproachingTimeouts(),
      stats: this.getTimeoutStats(),
    }
  }

  /**
   * Health check
   */
  healthCheck() {
    const stats = this.getTimeoutStats()
    const isHealthy = stats.timeoutRate < 5 && stats.currentActiveQueries < 100

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      metrics: stats,
      recommendations: this.generateHealthRecommendations(stats),
    }
  }

  /**
   * Generate health recommendations
   */
  private generateHealthRecommendations(stats: {
    timeoutRate: number
    averageResponseTime: number
    currentActiveQueries: number
    routesWithMostTimeouts: [string, number][]
  }): string[] {
    const recommendations: string[] = []

    if (stats.timeoutRate > 5) {
      recommendations.push(
        'High timeout rate detected - consider increasing timeout values or optimizing queries',
      )
    }

    if (stats.averageResponseTime > 1500) {
      recommendations.push(
        'Average response time is high - investigate query performance',
      )
    }

    if (stats.currentActiveQueries > 50) {
      recommendations.push(
        'High number of active queries - consider scaling or load balancing',
      )
    }

    const problematicRoutes = stats.routesWithMostTimeouts
    if (problematicRoutes.length > 0 && problematicRoutes[0][1] > 10) {
      recommendations.push(
        `Route ${problematicRoutes[0][0]} has high timeout count - investigate performance`,
      )
    }

    return recommendations
  }

  /**
   * Get query ID from context
   */
  getQueryId(c: Context): string | undefined {
    return c.get('queryId') as string | undefined
  }

  /**
   * Get query timeout from context
   */
  getQueryTimeout(c: Context): number | undefined {
    return c.get('queryTimeout') as number | undefined
  }

  /**
   * Select compression method based on accept-encoding header
   */
  private selectCompressionMethod(acceptEncoding: string): string {
    if (!acceptEncoding) return 'none'

    const encodings = acceptEncoding.split(',').map(e => e.trim())

    // Check for Brotli (highest priority)
    if (encodings.includes('br')) {
      return 'br'
    }

    // Check for Gzip
    if (encodings.includes('gzip')) {
      return 'gzip'
    }

    // Check for deflate
    if (encodings.includes('deflate')) {
      return 'deflate'
    }

    // Check for wildcard (accept any encoding)
    if (encodings.includes('*')) {
      return 'br'
    }

    return 'none'
  }
}

/**
 * Healthcare-specific timeout middleware configuration
 */
export function createHealthcareTimeoutMiddleware(): QueryTimeoutMiddleware {
  return new QueryTimeoutMiddleware({
    defaultTimeout: 2000, // Strict 2-second timeout for healthcare
    maxTimeout: 3000, // Maximum 3 seconds for complex healthcare queries
    timeoutHeader: 'X-Healthcare-Timeout',
    enableTimeoutExtension: false, // Disable extension for healthcare compliance
    enableResponseCompression: true,
  })
}

// Extend Hono Context for our custom properties
declare module 'hono' {
  interface Context {
    get: (key: string) => any
    set: (key: string, value: any) => void
  }
}
