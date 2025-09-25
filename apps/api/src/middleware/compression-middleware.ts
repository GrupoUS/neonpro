/**
 * Compression and Response Optimization Middleware
 * Configures compression and optimization for HTTPS responses to improve performance
 */

import { createHash, randomBytes } from 'crypto'
import { NextFunction, Request, Response } from 'express'
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
   * Express middleware function
   */
  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = this.generateRequestId()
    const startTime = performance.now()

    // Add request ID for tracking
    req.requestId = requestId
    req.compressionStartTime = startTime

    // Parse Accept-Encoding header
    const acceptEncoding = req.headers['accept-encoding'] || ''
    const preferredEncoding = this.selectCompressionMethod(acceptEncoding)

    // Add compression info to response locals
    res.locals = res.locals || {}
    res.locals.compression = {
      method: preferredEncoding,
      enabled: preferredEncoding !== 'none',
      requestId,
      startTime,
    }

    // Set up response optimization
    this.setupResponseOptimization(req, res, preferredEncoding)

    // Override res.end to apply compression and metrics
    const originalEnd = res.end
    const _originalWrite = res.write

    let responseBuffer: Buffer[] = []
    let originalSize = 0

    // Override write to capture response data
    res.write = function(chunk: any, encoding?: any) {
      if (chunk) {
        if (Buffer.isBuffer(chunk)) {
          responseBuffer.push(chunk)
          originalSize += chunk.length
        } else {
          const buffer = Buffer.from(
            chunk,
            (encoding as BufferEncoding) || 'utf8',
          )
          responseBuffer.push(buffer)
          originalSize += buffer.length
        }
      }
      return true
    }.bind(this)

    // Override end to apply compression
    res.end = function(chunk?: any, encoding?: any) {
      if (chunk) {
        res.write(chunk, encoding)
      }

      const finalBuffer = Buffer.concat(responseBuffer)
      const endTime = performance.now()
      const compressionTime = endTime - startTime

      // Apply compression if beneficial
      if (shouldCompress(finalBuffer, preferredEncoding, this.config)) {
        const compressedData = compressResponse(
          finalBuffer,
          preferredEncoding,
          this.config,
        )

        if (compressedData && compressedData.length < finalBuffer.length) {
          // Set compression headers
          res.setHeader('Content-Encoding', preferredEncoding)
          res.setHeader('Vary', 'Accept-Encoding')

          // Remove Content-Length as it will be set by the compression
          res.removeHeader('Content-Length')

          // Send compressed data
          originalEnd.call(this, compressedData)

          // Record metrics
          this.recordCompressionMetrics({
            requestId,
            method: req.method,
            path: req.path,
            originalSize: finalBuffer.length,
            compressedSize: compressedData.length,
            compressionRatio: (1 - compressedData.length / finalBuffer.length) * 100,
            compressionMethod: preferredEncoding,
            compressionTimeMs: compressionTime,
            timestamp: new Date().toISOString(),
            cacheHit: false,
          })
        } else {
          // Send uncompressed if compression didn't help
          res.setHeader('Content-Length', finalBuffer.length)
          originalEnd.call(this, finalBuffer)
        }
      } else {
        // Send uncompressed
        res.setHeader('Content-Length', finalBuffer.length)
        originalEnd.call(this, finalBuffer)
      }

      // Update statistics
      this.compressionStats.totalRequests++
      if (res.locals.compression.enabled && res.getHeader('Content-Encoding')) {
        this.compressionStats.compressedResponses++
      }
    }.bind(this)

    next()
  }

  /**
   * Setup response optimization headers
   */
  private setupResponseOptimization(
    req: Request,
    res: Response,
    compressionMethod: string,
  ): void {
    // Enable ETag for conditional requests
    if (this.config.enableETag) {
      this.setupETag(res)
    }

    // Enable Cache-Control headers
    if (this.config.enableCacheControl) {
      this.setupCacheControl(req, res)
    }

    // Enable Vary header for proper caching
    if (this.config.enableVaryHeader && compressionMethod !== 'none') {
      const existingVary = res.getHeader('Vary') as string
      const varyValues = existingVary ? existingVary.split(', ') : []
      if (!varyValues.includes('Accept-Encoding')) {
        varyValues.push('Accept-Encoding')
      }
      res.setHeader('Vary', varyValues.join(', '))
    }

    // Enable preconditions checks
    if (this.config.enablePreconditionChecks) {
      this.setupPreconditionChecks(req, res)
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
  private setupETag(res: Response): void {
    const originalSetHeader = res.setHeader

    res.setHeader = function(name: string, value: any) {
      if (name.toLowerCase() === 'etag') {
        // Store ETag for later use
        res.locals.etag = value
      }
      return originalSetHeader.call(this, name, value)
    }

    // Generate ETag if not set
    const originalEnd = res.end
    res.end = function(chunk?: any, encoding?: any) {
      if (!res.getHeader('ETag') && chunk) {
        const etag = generateETag(chunk)
        res.setHeader('ETag', etag)
      }
      return originalEnd.call(this, chunk, encoding)
    }.bind(this)
  }

  /**
   * Setup Cache-Control headers
   */
  private setupCacheControl(req: Request, res: Response): void {
    const path = req.path
    const method = req.method

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
      res.setHeader('Cache-Control', cacheControl)
    }
  }

  /**
   * Setup precondition checks (If-None-Match, If-Modified-Since)
   */
  private setupPreconditionChecks(req: Request, res: Response): void {
    const etag = req.headers['if-none-match']
    const modifiedSince = req.headers['if-modified-since']

    if (etag && etag === res.getHeader('ETag')) {
      res.status(304).end()
      return
    }

    if (modifiedSince) {
      // Simple implementation - in production, parse and compare dates properly
      const lastModified = res.getHeader('Last-Modified')
      if (lastModified && lastModified === modifiedSince) {
        res.status(304).end()
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
  private generateHealthRecommendations(stats: any): string[] {
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

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      requestId?: string
      compressionStartTime?: number
    }
  }
}
