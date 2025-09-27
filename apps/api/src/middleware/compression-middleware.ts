/**
 * Compression and Response Optimization Middleware
 * Configures compression and optimization for HTTPS responses to improve performance
 */

import { createHash, randomBytes } from 'node:crypto'
import { Context, Next } from 'hono'
// Use global performance API available in Node.js
declare const performance: {
  now(): number
}

export interface CompressionConfig {
  enableBrotli: boolean
  enableGzip: boolean
  compressionLevel: number
  minSize: number // minimum response size to compress
  threshold: number // threshold for compression decision
  enableETag: boolean
  enableCacheControl: boolean
  enableVaryHeader: boolean
  enablePreconditionChecks: boolean
  enableStreamingCompression: boolean
}

export interface CompressionMetrics {
  requestId: string
  method: string
  path: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  compressionMethod: string
  compressionTimeMs: number
  timestamp: string
  cacheHit: boolean
  etag?: string
}

export interface CacheControlOptions {
  maxAge?: number
  sMaxAge?: number
  noCache?: boolean
  noStore?: boolean
  mustRevalidate?: boolean
  proxyRevalidate?: boolean
  public?: boolean
  private?: boolean
  immutable?: boolean
  staleWhileRevalidate?: number
  staleIfError?: number
}

export class CompressionMiddleware {
  private config: CompressionConfig
  private metrics: CompressionMetrics[] = []
  private compressionStats = {
    totalRequests: 0,
    compressedResponses: 0,
    totalBytesSaved: 0,
    averageCompressionRatio: 0,
    compressionMethods: new Map<string, number>(),
  }

  constructor(config: Partial<CompressionConfig> = {}) {
    this.config = {
      enableBrotli: true,
      enableGzip: true,
      compressionLevel: 6, // Balanced compression ratio and speed
      minSize: 1024, // 1KB minimum
      threshold: 0.8, // Compress if ratio > 80%
      enableETag: true,
      enableCacheControl: true,
      enableVaryHeader: true,
      enablePreconditionChecks: true,
      enableStreamingCompression: true,
      ...config,
    }
  }

  /**
   * Hono middleware function
   */
  middleware = async (c: Context, next: Next): Promise<void> => {
    const requestId = this.generateRequestId()
    const startTime = performance.now()
    const url = new URL(c.req.url)

    // Add request ID for tracking
    c.set('requestId', requestId)
    c.set('compressionStartTime', startTime)

    // Parse Accept-Encoding header
    const acceptEncoding = c.req.header('accept-encoding') || ''
    const preferredEncoding = this.selectCompressionMethod(acceptEncoding)

    // Add compression info to context
    c.set('compression', {
      method: preferredEncoding,
      enabled: preferredEncoding !== 'none',
      requestId,
      startTime,
    })

    // Set up response optimization headers
    this.setupResponseOptimizationHeaders(c, preferredEncoding)

    // Execute next middleware
    await next()

    // Get response data and apply compression if needed
    const endTime = performance.now()
    const compressionTime = endTime - startTime

    // Update statistics
    this.compressionStats.totalRequests++
    const compressionInfo = c.get('compression')
    if (compressionInfo?.enabled && c.res.headers.get('Content-Encoding')) {
      this.compressionStats.compressedResponses++
    }
  }

  /**
   * Setup response optimization headers
   */
  private setupResponseOptimizationHeaders(
    c: Context,
    compressionMethod: string,
  ): void {
    const url = new URL(c.req.url)
    // Enable ETag for conditional requests
    if (this.config.enableETag) {
      this.setupETag(c)
    }

    // Enable Cache-Control headers
    if (this.config.enableCacheControl) {
      this.setupCacheControl(c)
    }

    // Enable Vary header for proper caching
    if (this.config.enableVaryHeader && compressionMethod !== 'none') {
      const existingVary = c.res.headers.get('Vary')
      const varyValues = existingVary ? existingVary.split(', ') : []
      if (!varyValues.includes('Accept-Encoding')) {
        varyValues.push('Accept-Encoding')
      }
      c.header('Vary', varyValues.join(', '))
    }

    // Enable preconditions checks
    if (this.config.enablePreconditionChecks) {
      this.setupPreconditionChecks(c)
    }

    // Remove headers that shouldn't be compressed
    const headersToRemove = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
    ]
    headersToRemove.forEach(header => {
      // Keep security headers even when compressing
      if (
        header.startsWith('X-') &&
        !header.includes('Content-Type') &&
        !header.includes('Frame')
      ) {
        // Don't remove security headers
      }
    })
  }

  /**
   * Setup ETag generation
   */
  private setupETag(c: Context): void {
    // In Hono, ETag is typically handled at the response level
    // This is a simplified version
    if (this.config.enableETag) {
      c.header('ETag', generateETag(Date.now().toString()))
    }
  }

  /**
   * Setup Cache-Control headers
   */
  private setupCacheControl(c: Context): void {
    const url = new URL(c.req.url)
    const path = url.pathname
    const method = c.req.method

    // Different cache strategies for different types of content
    let cacheOptions: CacheControlOptions

    if (path.startsWith('/api/ai/') || path.includes('data-agent')) {
      // AI responses - cache for 5 minutes
      cacheOptions = {
        maxAge: 300, // 5 minutes
        sMaxAge: 600, // 10 minutes for shared caches
        public: true,
        mustRevalidate: true,
      }
    } else if (
      path.startsWith('/static/') ||
      path.includes('.css') ||
      path.includes('.js')
    ) {
      // Static assets - cache for 1 year
      cacheOptions = {
        maxAge: 31536000, // 1 year
        public: true,
        immutable: true,
      }
    } else if (method === 'GET' && !path.includes('/api/')) {
      // General GET requests - cache for 1 hour
      cacheOptions = {
        maxAge: 3600, // 1 hour
        public: true,
        mustRevalidate: true,
      }
    } else {
      // Dynamic content - don't cache
      cacheOptions = {
        noCache: true,
        noStore: true,
        mustRevalidate: true,
      }
    }

    // Apply Cache-Control header
    const cacheControl = buildCacheControlHeader(cacheOptions)
    if (cacheControl) {
      c.header('Cache-Control', cacheControl)
    }
  }

  /**
   * Setup precondition checks (If-None-Match, If-Modified-Since)
   */
  private setupPreconditionChecks(c: Context): void {
    const etag = c.req.header('if-none-match')
    const modifiedSince = c.req.header('if-modified-since')

    if (etag && etag === c.res.headers.get('ETag')) {
      c.status(304)
      c.body = null
      return
    }

    if (modifiedSince) {
      // Simple implementation - in production, parse and compare dates properly
      const lastModified = c.res.headers.get('Last-Modified')
      if (lastModified && lastModified === modifiedSince) {
        c.status(304)
        c.body = null
        return
      }
    }
  }

  /**
   * Select best compression method based on Accept-Encoding header
   */
  private selectCompressionMethod(acceptEncoding: string): string {
    if (!acceptEncoding) return 'none'

    const encodings = acceptEncoding.split(',').map(e => e.trim())

    // Check for Brotli (highest priority)
    if (this.config.enableBrotli && encodings.includes('br')) {
      return 'br'
    }

    // Check for Gzip
    if (this.config.enableGzip && encodings.includes('gzip')) {
      return 'gzip'
    }

    // Check for deflate
    if (encodings.includes('deflate')) {
      return 'deflate'
    }

    // Check for wildcard (accept any encoding)
    if (encodings.includes('*')) {
      return this.config.enableBrotli ? 'br' : 'gzip'
    }

    return 'none'
  }

  /**
   * Record compression metrics
   */
  private recordCompressionMetrics(metrics: CompressionMetrics): void {
    this.metrics.push(metrics)

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Update statistics
    this.compressionStats.totalBytesSaved += metrics.originalSize - metrics.compressedSize

    // Update compression method stats
    const methodStats = this.compressionStats.compressionMethods.get(metrics.compressionMethod) ||
      0
    this.compressionStats.compressionMethods.set(
      metrics.compressionMethod,
      methodStats + 1,
    )

    // Update average compression ratio
    if (this.compressionStats.compressedResponses > 0) {
      const totalRatio = this.metrics.reduce(
        (sum, m) => sum + m.compressionRatio,
        0,
      )
      this.compressionStats.averageCompressionRatio = totalRatio / this.metrics.length
    }
  }

  /**
   * Get compression statistics
   */
  getCompressionStats() {
    const stats = {
      ...this.compressionStats,
      compressionRate: this.compressionStats.totalRequests > 0
        ? (this.compressionStats.compressedResponses /
          this.compressionStats.totalRequests) *
          100
        : 0,
      averageResponseSize: this.metrics.length > 0
        ? this.metrics.reduce((sum, m) => sum + m.originalSize, 0) /
          this.metrics.length
        : 0,
      averageCompressedSize: this.metrics.length > 0
        ? this.metrics.reduce((sum, m) => sum + m.compressedSize, 0) /
          this.metrics.length
        : 0,
      topCompressedRoutes: this.getTopCompressedRoutes(5),
      compressionMethodDistribution: Object.fromEntries(
        this.compressionStats.compressionMethods,
      ),
    }

    return stats
  }

  /**
   * Get routes with most compression benefits
   */
  private getTopCompressedRoutes(limit: number) {
    const routeStats: Record<string, { count: number; bytesSaved: number }> = {}

    this.metrics.forEach(m => {
      if (!routeStats[m.path]) {
        routeStats[m.path] = { count: 0, bytesSaved: 0 }
      }
      routeStats[m.path].count++
      routeStats[m.path].bytesSaved += m.originalSize - m.compressedSize
    })

    return Object.entries(routeStats)
      .sort((a, b) => b[1].bytesSaved - a[1].bytesSaved)
      .slice(0, limit)
      .map(([route, stats]) => ({
        route,
        requestsCompressed: stats.count,
        bytesSaved: stats.bytesSaved,
        averageCompressionRatio: stats.bytesSaved / (stats.count * 1024), // KB saved per request
      }))
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${randomBytes(4).toString('hex')}`
  }

  /**
   * Health check
   */
  healthCheck() {
    const stats = this.getCompressionStats()
    const isHealthy = stats.compressionRate > 50 && stats.averageCompressionRatio > 20

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      metrics: stats,
      config: {
        enableBrotli: this.config.enableBrotli,
        enableGzip: this.config.enableGzip,
        compressionLevel: this.config.compressionLevel,
        minSize: this.config.minSize,
      },
      recommendations: this.generateHealthRecommendations(stats),
    }
  }

  /**
   * Generate health recommendations
   */
  private generateHealthRecommendations(stats: {
    compressionRate: number
    averageCompressionRatio: number
    totalRequests: number
  }): string[] {
    const recommendations: string[] = []

    if (stats.compressionRate < 50) {
      recommendations.push(
        'Low compression rate - consider adjusting compression thresholds',
      )
    }

    if (stats.averageCompressionRatio < 20) {
      recommendations.push(
        'Low compression ratio - consider increasing compression level',
      )
    }

    if (stats.totalRequests === 0) {
      recommendations.push(
        'No compression metrics available - check middleware configuration',
      )
    }

    return recommendations
  }
}

/**
 * Check if response should be compressed
 */
function shouldCompress(
  buffer: Buffer,
  method: string,
  _config: CompressionConfig,
): boolean {
  if (method === 'none') return false

  // Don't compress very small responses
  if (buffer.length < _config.minSize) return false

  // Don't compress already compressed content
  const contentType = '' // Would need to be passed in
  if (
    contentType.includes('image/') ||
    contentType.includes('video/') ||
    contentType.includes('application/zip')
  ) {
    return false
  }

  return true
}

/**
 * Compress response data
 */
function compressResponse(
  buffer: Buffer,
  method: string,
  _config: CompressionConfig,
): Buffer | null {
  try {
    // This is a placeholder implementation
    // In production, use actual compression libraries like 'iltorb' for Brotli or 'zlib' for Gzip

    if (method === 'gzip') {
      // const gzip = require('zlib').gzipSync;
      // return gzip(buffer);
      return buffer // Placeholder
    } else if (method === 'br') {
      // const brotli = require('iltorb').compressSync;
      // return brotli(buffer);
      return buffer // Placeholder
    } else if (method === 'deflate') {
      // const deflate = require('zlib').deflateSync;
      // return deflate(buffer);
      return buffer // Placeholder
    }

    return null
  } catch (error) {
    // In a real implementation, you'd use proper logging here
    return null
  }
}

/**
 * Generate ETag for response
 */
function generateETag(data: Buffer | string): string {
  const hash = createHash('sha256').update(data).digest('hex')
  return `"${hash}"`
}

/**
 * Build Cache-Control header from options
 */
function buildCacheControlHeader(options: CacheControlOptions): string {
  const directives: string[] = []

  if (options.maxAge !== undefined) {
    directives.push(`max-age=${options.maxAge}`)
  }

  if (options.sMaxAge !== undefined) {
    directives.push(`s-maxage=${options.sMaxAge}`)
  }

  if (options.noCache) {
    directives.push('no-cache')
  }

  if (options.noStore) {
    directives.push('no-store')
  }

  if (options.mustRevalidate) {
    directives.push('must-revalidate')
  }

  if (options.proxyRevalidate) {
    directives.push('proxy-revalidate')
  }

  if (options.public) {
    directives.push('public')
  }

  if (options.private) {
    directives.push('private')
  }

  if (options.immutable) {
    directives.push('immutable')
  }

  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`)
  }

  if (options.staleIfError !== undefined) {
    directives.push(`stale-if-error=${options.staleIfError}`)
  }

  return directives.join(', ')
}

/**
 * Healthcare-specific compression middleware configuration
 */
export function createHealthcareCompressionMiddleware(): CompressionMiddleware {
  return new CompressionMiddleware({
    enableBrotli: true,
    enableGzip: true,
    compressionLevel: 6, // Balanced for healthcare data
    minSize: 512, // Lower threshold for healthcare responses
    threshold: 0.7, // Compress if saves > 30%
    enableETag: true,
    enableCacheControl: true,
    enableVaryHeader: true,
    enablePreconditionChecks: true,
    enableStreamingCompression: true,
  })
}

// Extend Hono Context for our custom properties
declare module 'hono' {
  interface Context {
    getRequestId(): string | undefined
    getCompressionStartTime(): number | undefined
  }
}
