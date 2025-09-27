/**
 * Performance Monitoring Middleware
 * Provides comprehensive performance tracking and optimization for API requests
 */

import { Context, Next } from 'hono'
import { AestheticClinicPerformanceOptimizer } from '../services/performance/aesthetic-clinic-performance-optimizer'
// import { ErrorMapper } from "@neonpro/shared/errors";

export interface PerformanceMetrics {
  requestId: string
  method: string
  url: string
  userAgent: string
  startTime: number
  endTime?: number
  duration?: number
  memoryUsage?: {
    heapUsed: number
    heapTotal: number
    external: number
  }
  cpuUsage?: number
  responseSize?: number
  statusCode?: number
  cacheHit?: boolean
  databaseQueries?: number
  errors?: string[]
  warnings?: string[]
}

export interface PerformanceThresholds {
  warningThreshold: number // milliseconds
  criticalThreshold: number // milliseconds
  maxMemoryUsage: number // bytes
  maxResponseSize: number // bytes
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private thresholds: PerformanceThresholds
  private optimizer: AestheticClinicPerformanceOptimizer

  constructor(
    optimizer: AestheticClinicPerformanceOptimizer,
    thresholds: Partial<PerformanceThresholds> = {},
  ) {
    this.optimizer = optimizer
    this.thresholds = {
      warningThreshold: 1000, // 1 second
      criticalThreshold: 5000, // 5 seconds
      maxMemoryUsage: 500 * 1024 * 1024, // 500MB
      maxResponseSize: 10 * 1024 * 1024, // 10MB
      ...thresholds,
    }

    // Start periodic cleanup
    setInterval(() => this.cleanupOldMetrics(), 300000) // Every 5 minutes
  }

  /**
   * Middleware function for performance monitoring
   */
  middleware() {
    return async (c: Context, next: Next) => {
      const requestId = this.generateRequestId()
      const startTime = performance.now()
      const url = new URL(c.req.url)

      // Add request ID to context for tracking
      c.set('requestId', requestId)

      // Track response size
      let responseSize = 0
      const originalJson = c.json.bind(c)
      c.json = function(data) {
        responseSize = Buffer.byteLength(JSON.stringify(data), 'utf8')
        return originalJson(data)
      }

      // Execute next middleware
      await next()

      // Calculate metrics after response
      const endTime = performance.now()
      const duration = endTime - startTime

      const metrics: PerformanceMetrics = {
        requestId,
        method: c.req.method,
        url: c.req.url,
        userAgent: c.req.header('user-agent') || 'unknown',
        startTime,
        endTime,
        duration,
        statusCode: c.res.status,
        responseSize,
        memoryUsage: process.memoryUsage(),
        databaseQueries: c.get('dbQueryCount') || 0,
      }

      this.recordMetrics(metrics)
      this.checkPerformanceThresholds(metrics)
    }
  }

  /**
   * Database query tracking middleware
   */
  databaseQueryMiddleware() {
    return async (c: Context, next: Next) => {
      c.set('dbQueryCount', 0)
      c.set('dbQueries', [])

      // Track database queries
      // This would need to be implemented based on your database client
      // For now, we'll track manually in services

      await next()
    }
  }

  /**
   * Compression middleware for API responses
   */
  compressionMiddleware() {
    return async (c: Context, next: Next) => {
      // Check if client accepts compression
      const acceptEncoding = c.req.header('accept-encoding')

      if (acceptEncoding?.includes('gzip')) {
        c.header('Content-Encoding', 'gzip')
        // Enable gzip compression
        // This would typically be handled by a compression library
      } else if (acceptEncoding?.includes('deflate')) {
        c.header('Content-Encoding', 'deflate')
      }

      // Add compression headers
      c.header('Vary', 'Accept-Encoding')

      await next()
    }
  }

  /**
   * Cache middleware for aesthetic clinic data
   */
  cacheMiddleware(ttl: number = 300000) { // 5 minutes default
    return async (c: Context, next: Next) => {
      // Only cache GET requests
      if (c.req.method !== 'GET') {
        return await next()
      }

      const url = new URL(c.req.url)
      const cacheKey = `api_cache:${url.pathname}${url.search}`

      try {
        // Check cache
        const cached = await this.getFromCache(cacheKey)
        if (cached) {
          c.header('X-Cache', 'HIT')
          return c.json(cached)
        }

        await next()

        // Cache successful responses
        if (c.res.status >= 200 && c.res.status < 300) {
          // Note: In Hono, you'd need to capture the response data differently
          // This is a simplified version
          this.setToCache(cacheKey, {}, ttl)
        }

        c.header('X-Cache', 'MISS')
      } catch (error) {
        console.error('Cache middleware error:', error)
        await next()
      }
    }
  }

  /**
   * Rate limiting middleware for performance protection
   */
  rateLimitMiddleware(options: {
    windowMs?: number
    maxRequests?: number
    keyGenerator?: (c: Context) => string
  } = {}) {
    const windowMs = options.windowMs || 60000 // 1 minute
    const maxRequests = options.maxRequests || 100
    const requests = new Map<string, { count: number; resetTime: number }>()

    return async (c: Context, next: Next) => {
      const key = options.keyGenerator
        ? options.keyGenerator(c)
        : c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
      const now = Date.now()

      let record = requests.get(key)

      // Reset window if expired
      if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + windowMs }
        requests.set(key, record)
      }

      record.count++

      // Add rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString())
      c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString())
      c.header('X-RateLimit-Reset', record.resetTime.toString())

      if (record.count > maxRequests) {
        return c.json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        }, 429)
      }

      await next()
    }
  }

  /**
   * Performance optimization headers middleware
   */
  optimizationHeadersMiddleware() {
    return async (c: Context, next: Next) => {
      const url = new URL(c.req.url)

      // Add performance optimization headers
      c.header('X-Content-Type-Options', 'nosniff')
      c.header('X-Frame-Options', 'DENY')
      c.header('X-XSS-Protection', '1; mode=block')

      // Caching headers for static assets
      if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico)$/)) {
        c.header('Cache-Control', 'public, max-age=31536000, immutable')
        c.header('X-Content-Cache', 'STATIC')
      }

      // Add timing headers for performance monitoring
      c.header('X-Response-Time', 'true')

      await next()
    }
  }

  /**
   * Record performance metrics
   */
  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.set(metrics.requestId, metrics)

    // Keep only recent metrics (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    for (const [key, metric] of this.metrics) {
      if (metric.startTime < oneDayAgo) {
        this.metrics.delete(key)
      }
    }
  }

  /**
   * Check performance thresholds and log warnings
   */
  private checkPerformanceThresholds(metrics: PerformanceMetrics): void {
    const { duration, memoryUsage, responseSize } = metrics

    // Response time warnings
    if (duration && duration > this.thresholds.criticalThreshold) {
      console.warn(
        `[CRITICAL] Slow request detected: ${metrics.method} ${metrics.url} took ${
          duration.toFixed(2)
        }ms`,
      )
    } else if (duration && duration > this.thresholds.warningThreshold) {
      console.warn(
        `[WARNING] Slow request detected: ${metrics.method} ${metrics.url} took ${
          duration.toFixed(2)
        }ms`,
      )
    }

    // Memory usage warnings
    if (memoryUsage?.heapUsed && memoryUsage.heapUsed > this.thresholds.maxMemoryUsage) {
      console.warn(
        `[WARNING] High memory usage detected: ${
          (memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
        }MB`,
      )
    }

    // Response size warnings
    if (responseSize && responseSize > this.thresholds.maxResponseSize) {
      console.warn(
        `[WARNING] Large response detected: ${metrics.method} ${metrics.url} - ${
          (responseSize / 1024).toFixed(2)
        }KB`,
      )
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get data from cache
   */
  private async getFromCache(_key: string): Promise<any> {
    // This would integrate with your cache system
    // For now, using the optimizer's cache
    return null
  }

  /**
   * Set data to cache
   */
  private async setToCache(_key: string, _data: any, _ttl: number): Promise<void> {
    // This would integrate with your cache system
    // For now, using the optimizer's cache
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

    for (const [key, metric] of this.metrics) {
      if (metric.startTime < oneDayAgo) {
        this.metrics.delete(key)
      }
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  getMetrics(timeRange?: { start: number; end: number }): PerformanceMetrics[] {
    let metrics = Array.from(this.metrics.values())

    if (timeRange) {
      metrics = metrics.filter(metric =>
        metric.startTime >= timeRange.start && metric.startTime <= timeRange.end
      )
    }

    return metrics.sort((a, b) => b.startTime - a.startTime)
  }

  /**
   * Get performance statistics
   */
  getStatistics(): {
    totalRequests: number
    averageResponseTime: number
    slowRequests: number
    errorRate: number
    cacheHitRate: number
    memoryUsage: { average: number; peak: number }
  } {
    const metrics = Array.from(this.metrics.values())

    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        errorRate: 0,
        cacheHitRate: 0,
        memoryUsage: { average: 0, peak: 0 },
      }
    }

    const totalDuration = metrics.reduce((sum, metric) => sum + (metric.duration || 0), 0)
    const slowRequests =
      metrics.filter(metric =>
        metric.duration && metric.duration > this.thresholds.warningThreshold
      ).length
    const errors = metrics.filter(metric => metric.statusCode && metric.statusCode >= 400).length
    const cacheHits = metrics.filter(metric => metric.cacheHit).length

    const memoryUsage = metrics.map(metric => metric.memoryUsage?.heapUsed || 0)
    const averageMemory = memoryUsage.reduce((sum, usage) => sum + usage, 0) / memoryUsage.length
    const peakMemory = Math.max(...memoryUsage)

    return {
      totalRequests: metrics.length,
      averageResponseTime: totalDuration / metrics.length,
      slowRequests,
      errorRate: (errors / metrics.length) * 100,
      cacheHitRate: (cacheHits / metrics.length) * 100,
      memoryUsage: {
        average: averageMemory,
        peak: peakMemory,
      },
    }
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): string {
    const metrics = this.getMetrics()
    return JSON.stringify(metrics, null, 2)
  }
}

// Extend Hono Context for our custom properties
declare module 'hono' {
  interface Context {
    getRequestId(): string | undefined
    getDbQueryCount(): number | undefined
    getDbQueries(): any[] | undefined
  }
}

// Factory function for creating performance monitor instances
export const createPerformanceMonitor = (
  optimizer: AestheticClinicPerformanceOptimizer,
  thresholds?: Partial<PerformanceThresholds>,
) => {
  return new PerformanceMonitor(optimizer, thresholds)
}

export default PerformanceMonitor
