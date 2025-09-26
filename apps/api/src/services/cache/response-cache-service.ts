/**
 * Response Cache Service for AI Agent Performance Optimization
 * Implements intelligent caching for frequently accessed healthcare data
 */

// Browser-compatible crypto API
const getCrypto = () => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    return crypto
  }
  // Fallback for Node.js environments
  try {
    return require('crypto')
  } catch {
    // Minimal fallback
    return {
      createHash: () => ({
        update: () => ({
          digest: (encoding: string) => Math.random().toString(36).substring(7)
        })
      })
    }
  }
}

const cryptoModule = getCrypto()
const createHash = cryptoModule.createHash || ((algorithm: string) => ({
  update: (data: string) => ({
    digest: (encoding: string) => {
      // Simple hash fallback for browser
      let hash = 0
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16)
    }
  })
}))
import { Redis } from 'ioredis'
import { z } from 'zod'
import { AguiQueryMessage, AguiResponseMessage, AguiSource } from '../agui-protocol/types'

// Input validation schemas
const CacheKeySchema = z.string().min(1).max(500)
const UserIdSchema = z.string().min(1).max(255)
const TTLSchema = z.number().min(1).max(86400) // Max 24 hours

export interface CacheConfig {
  redisUrl: string
  defaultTTL: number // seconds
  maxSize: number // number of items
  compressionEnabled: boolean
  healthCheckInterval: number // ms
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: string
  ttl: number
  hitCount: number
  metadata: {
    queryHash: string
    _userId: string
    patientId?: string
    dataCategories: string[]
    confidenceScore?: number
    sources?: AguiSource[]
  }
}

export interface CacheStats {
  totalHits: number
  totalMisses: number
  hitRate: number
  averageResponseTimeMs: number
  memoryUsage: number
  cacheSize: number
  evictionCount: number
  compressionRatio?: number
}

export class ResponseCacheService {
  private redis: Redis
  private config: CacheConfig
  private stats: CacheStats
  private localCache: Map<string, CacheEntry>
  private healthCheckTimer?: NodeJS.Timeout
  private isConnected = false
  private connectionRetries = 0
  private maxRetries = 3
  private securityKey: string
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(config: CacheConfig) {
    // Validate configuration
    this.validateConfig(config)

    this.config = config
    this.securityKey = process.env.CACHE_SECURITY_KEY || 'default_security_key'
    this.localCache = new Map()
    this.stats = {
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      averageResponseTimeMs: 0,
      memoryUsage: 0,
      cacheSize: 0,
      evictionCount: 0,
    }

    // Initialize Redis with security options
    this.initializeRedis()
    this.initializeHealthCheck()
  }

  /**
   * Generate secure cache key for query
   */
  private generateCacheKey(_query: AguiQueryMessage, _userId: string): string {
    // Validate inputs
    const validatedUserId = UserIdSchema.parse(_userId)

    const queryData = {
      _query: this.sanitizeQueryString(_query._query),
      _context: {
        patientId: _query.context?.patientId
          ? this.sanitizeString(_query.context.patientId)
          : undefined,
        _userId: _query.context?.userId
          ? this.sanitizeString(_query.context._userId)
          : undefined,
        previousTopics: _query.context?.previousTopics?.map(t => this.sanitizeString(t)) ||
          [],
      },
      options: {
        maxResults: Math.min(_query.options?.maxResults || 10, 100), // Limit max results
        model: this.sanitizeString(_query.options?.model || 'default'),
        temperature: Math.max(
          0,
          Math.min(1, _query.options?.temperature || 0.7),
        ), // Clamp temperature
      },
    }

    const hash = createHash('sha256')
      .update(JSON.stringify(queryData) + this.securityKey)
      .digest('hex')

    return `agent_response:${validatedUserId}:${hash}`
  }

  /**
   * Extract data categories from response for intelligent caching
   */
  private extractDataCategories(response: AguiResponseMessage): string[] {
    const categories: string[] = []

    if (response.sources) {
      response.sources.forEach(source => {
        switch (source.type) {
          case 'patient_data':
            categories.push('patient_records')
            break
          case 'appointment':
            categories.push('appointments')
            break
          case 'financial':
            categories.push('financial_data')
            break
          case 'document':
            categories.push('documents')
            break
          case 'medical_knowledge':
            categories.push('medical_knowledge')
            break
        }
      })
    }

    // Add content-based categories
    if (response.content.toLowerCase().includes('agendamento')) {
      categories.push('appointments')
    }
    if (response.content.toLowerCase().includes('paciente')) {
      categories.push('patient_data')
    }
    if (response.content.toLowerCase().includes('financeiro')) {
      categories.push('financial_data')
    }

    return [...new Set(categories)]
  }

  /**
   * Compress data for storage
   */
  private async compressData(data: any): Promise<any> {
    if (!this.config.compressionEnabled) {
      return data
    }

    // Simple JSON-based compression for now
    // In production, use proper compression algorithms
    return {
      _compressed: true,
      data: JSON.stringify(data),
    }
  }

  /**
   * Decompress cached data
   */
  private async decompressData(data: any): Promise<any> {
    if (!this.config.compressionEnabled || !data._compressed) {
      return data
    }

    return JSON.parse(data.data)
  }

  /**
   * Get cached response with security validation
   */
  async getCachedResponse(
    _query: AguiQueryMessage,
    _userId: string,
  ): Promise<AguiResponseMessage | null> {
    const startTime = Date.now()

    try {
      // Validate inputs and check rate limits
      const validatedUserId = UserIdSchema.parse(_userId)

      if (!(await this.checkCacheRateLimit(validatedUserId))) {
        console.warn(
          `[Cache] Rate limit exceeded for user: ${validatedUserId}`,
        )
        return null
      }

      const cacheKey = this.generateCacheKey(_query, validatedUserId)

      // Check local cache first
      const localEntry = this.localCache.get(cacheKey)
      if (localEntry && !this.isExpired(localEntry)) {
        localEntry.hitCount++
        this.stats.totalHits++
        this.updateHitRate()
        this.stats.averageResponseTimeMs = Date.now() - startTime

        const decompressed = await this.decompressData(localEntry.data)
        return this.validateCachedResponse(decompressed)
      }

      // Check Redis cache if connected
      if (this.isConnected && this.redis) {
        const redisData = await this.safeRedisOperation(() => this.redis.get(cacheKey))
        if (redisData) {
          const entry: CacheEntry = JSON.parse(redisData)

          if (!this.isExpired(entry)) {
            // Validate entry structure
            if (this.validateCacheEntry(entry)) {
              // Move to local cache for faster access
              entry.hitCount++
              this.localCache.set(cacheKey, entry)

              // Cleanup local cache if oversized
              this.enforceLocalCacheSize()

              this.stats.totalHits++
              this.updateHitRate()
              this.stats.averageResponseTimeMs = Date.now() - startTime

              const decompressed = await this.decompressData(entry.data)
              return this.validateCachedResponse(decompressed)
            }
          } else {
            // Remove expired entry
            await this.safeRedisOperation(() => this.redis.del(cacheKey))
          }
        }
      }

      this.stats.totalMisses++
      this.updateHitRate()
      return null
    } catch {
      console.error('[Cache] Error retrieving cached response:', error)
      this.stats.totalMisses++
      this.updateHitRate()
      return null
    }
  }

  /**
   * Cache response with security validation
   */
  async cacheResponse(
    _query: AguiQueryMessage,
    response: AguiResponseMessage,
    _userId: string,
    options: {
      customTTL?: number
      skipCache?: boolean
    } = {},
  ): Promise<void> {
    if (options.skipCache) {
      return
    }

    try {
      // Validate inputs
      const validatedUserId = UserIdSchema.parse(_userId)
      const validatedTTL = TTLSchema.parse(
        options.customTTL || this.config.defaultTTL,
      )

      // Validate response before caching
      const validatedResponse = this.validateResponseForCaching(response)
      if (!validatedResponse) {
        console.warn('[Cache] Response validation failed, not caching')
        return
      }

      const cacheKey = this.generateCacheKey(_query, validatedUserId)

      // Sanitize metadata
      const patientId = _query.context?.patientId
        ? this.sanitizeString(_query.context.patientId)
        : undefined

      const entry: CacheEntry = {
        data: await this.compressData(validatedResponse),
        timestamp: new Date().toISOString(),
        ttl: validatedTTL,
        hitCount: 1,
        metadata: {
          queryHash: this.sanitizeHash(cacheKey.split(':').pop()!),
          _userId: validatedUserId,
          patientId,
          dataCategories: this.extractDataCategories(validatedResponse),
          confidenceScore: Math.max(
            0,
            Math.min(1, validatedResponse.confidence || 0),
          ),
          sources: validatedResponse.sources?.map(s => this.validateSource(s)) || [],
        },
      }

      // Validate entry structure
      if (!this.validateCacheEntry(entry)) {
        console.warn('[Cache] Cache entry validation failed, not caching')
        return
      }

      // Store in Redis if connected
      if (this.isConnected && this.redis) {
        await this.safeRedisOperation(() =>
          this.redis.setex(cacheKey, validatedTTL, JSON.stringify(entry))
        )
      }

      // Store in local cache with size limit
      if (this.localCache.size < this.config.maxSize) {
        this.localCache.set(cacheKey, entry)
        this.enforceLocalCacheSize()
      }

      this.stats.cacheSize++
    } catch {
      console.error('[Cache] Error caching response:', error)
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = new Date()
    const expiresAt = new Date(entry.timestamp)
    expiresAt.setSeconds(expiresAt.getSeconds() + entry.ttl)

    return now > expiresAt
  }

  /**
   * Enforce local cache size limit
   */
  private enforceLocalCacheSize(): void {
    if (this.localCache.size > this.config.maxSize) {
      // Simple LRU eviction
      const entries = Array.from(this.localCache.entries())
      entries.sort((a, _b) => a[1].hitCount - b[1].hitCount)

      const toRemove = entries.slice(0, Math.floor(this.config.maxSize * 0.2))
      toRemove.forEach(([key]) => {
        this.localCache.delete(key)
        this.stats.evictionCount++
      })
    }
  }

  /**
   * Update cache hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses
    this.stats.hitRate = total > 0 ? (this.stats.totalHits / total) * 100 : 0
  }

  /**
   * Invalidate cache entries with validation
   */
  async invalidateCache(pattern: string): Promise<number> {
    try {
      // Validate pattern to prevent cache poisoning
      const validatedPattern = CacheKeySchema.parse(pattern)

      // Sanitize pattern to prevent Redis injection
      const sanitizedPattern = this.sanitizeRedisPattern(validatedPattern)

      let invalidatedCount = 0

      // Clear Redis cache if connected
      if (this.isConnected && this.redis) {
        const keys = await this.safeRedisOperation(() => this.redis.keys(sanitizedPattern))
        if (keys.length > 0) {
          // Limit batch size to prevent Redis overload
          const batchSize = 100
          for (let i = 0; i < keys.length; i += batchSize) {
            const batch = keys.slice(i, i + batchSize)
            await this.safeRedisOperation(() => this.redis.del(...batch))
          }
          invalidatedCount += keys.length
        }
      }

      // Clear matching local cache entries
      for (const [key] of this.localCache) {
        if (this.safeKeyMatch(key, sanitizedPattern)) {
          this.localCache.delete(key)
          invalidatedCount++
        }
      }

      this.stats.evictionCount += invalidatedCount
      return invalidatedCount
    } catch {
      console.error('[Cache] Error invalidating cache:', error)
      return 0
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      // Get Redis info
      const redisInfo = await this.redis.info('memory')
      const memoryMatch = redisInfo.match(/used_memory_human:([^\r\n]+)/)
      this.stats.memoryUsage = memoryMatch ? parseFloat(memoryMatch[1]) : 0

      // Get cache size
      const cacheSize = await this.redis.dbsize()
      this.stats.cacheSize = cacheSize
    } catch {
      console.error('[Cache] Error getting cache stats:', error)
    }

    return { ...this.stats }
  }

  /**
   * Health check and cleanup
   */
  private async healthCheck(): Promise<void> {
    try {
      // Test Redis connection
      await this.redis.ping()

      // Clean expired entries from local cache
      for (const [key, entry] of this.localCache) {
        if (this.isExpired(entry)) {
          this.localCache.delete(key)
          this.stats.evictionCount++
        }
      }
    } catch {
      console.error('[Cache] Health check failed:', error)
    }
  }

  /**
   * Initialize health check timer
   */
  private initializeHealthCheck(): void {
    this.healthCheckTimer = setInterval(
      () => this.healthCheck(),
      this.config.healthCheckInterval,
    )
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }

    await this.redis.quit()
    this.localCache.clear()
  }
}

/**
 * Healthcare-specific cache configuration with validation
 */
export function createHealthcareCacheConfig(): CacheConfig {
  // Validate environment variables
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required')
  }

  // Validate Redis URL format
  try {
    new URL(redisUrl)
  } catch {
    throw new Error('Invalid REDIS_URL format')
  }

  return {
    redisUrl,
    defaultTTL: 3600, // 1 hour for healthcare data
    maxSize: 1000, // Local cache size
    compressionEnabled: true,
    healthCheckInterval: 30000, // 30 seconds
  }
}

/**
 * Cache strategies for different data types
 */
export const CacheStrategies = {
  // Patient data - longer TTL, high priority
  patientData: {
    ttl: 7200, // 2 hours
    compress: true,
    priority: 'high',
  },

  // Appointments - shorter TTL, medium priority
  appointments: {
    ttl: 1800, // 30 minutes
    compress: true,
    priority: 'medium',
  },

  // Financial data - medium TTL, high priority
  financial: {
    ttl: 3600, // 1 hour
    compress: true,
    priority: 'high',
  },

  // Medical knowledge - long TTL, low priority
  medicalKnowledge: {
    ttl: 86400, // 24 hours
    compress: true,
    priority: 'low',
  },

  // Real-time queries - very short TTL, no cache
  realtime: {
    ttl: 60, // 1 minute
    compress: false,
    priority: 'low',
  },
}
