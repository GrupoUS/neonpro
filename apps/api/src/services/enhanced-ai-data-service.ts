/**
 * Enhanced AI Data Service with Redis Caching
 *
 * Extends the base AIDataService with intelligent caching for <2s response requirements
 * and healthcare compliance optimization.
 *
 * @version 1.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM
 */

import { logger } from '@/utils/healthcare-errors'
import {
  CacheConfig,
  CacheDataSensitivity,
  CacheEntry,
  CacheTier,
} from '@neonpro/shared/src/services/cache-management'
import {
  createRedisCacheBackend,
  RedisCacheBackend,
} from '@neonpro/shared/src/services/redis-cache-backend'
import { PermissionContext, QueryIntent, QueryParameters } from '@neonpro/types'
import { createHash } from 'crypto'
import { aiCacheInvalidationManager } from './ai-cache-invalidation-service'
import { AIDataService } from './ai-data-service'

/**
 * Cache configuration for AI data queries
 */
const AIDATA_CACHE_CONFIG: CacheConfig = {
  defaultTTL: 300, // 5 minutes for frequently accessed data
  maxEntries: 10000,
  enableCompression: true,
  enableEncryption: true,
  lgpdCompliant: true,
  tier: CacheTier.REDIS,
  sensitivity: CacheDataSensitivity.MEDIUM,
  auditEnabled: true,
  performanceMode: true,
  enableHealthCheck: true,
}

/**
 * Enhanced AI Data Service with Redis caching and performance optimization
 */
export class EnhancedAIDataService extends AIDataService {
  private cache: RedisCacheBackend
  private cacheStats = {
    hits: 0,
    misses: 0,
    avgCacheTime: 0,
    avgDbTime: 0,
  }

  constructor(permissionContext: PermissionContext) {
    super(permissionContext)

    // Initialize Redis cache backend
    this.cache = createRedisCacheBackend(AIDATA_CACHE_CONFIG)

    // Initialize cache invalidation service
    const invalidationService = aiCacheInvalidationManager.getService()
    if (invalidationService) {
      // Set up event listeners for cache invalidation
      invalidationService.on('cache:invalidation', event => {
        this.handleCacheInvalidation(event)
      })
    }
  }

  /**
   * Generate cache key for query parameters
   */
  private generateCacheKey(
    intent: QueryIntent,
    parameters: QueryParameters,
  ): string {
    const keyData = {
      intent,
      _userId: this.permissionContext.userId,
      domain: this.permissionContext.domain,
      _role: this.permissionContext.role,
      parameters: this.sanitizeParameters(parameters),
    }

    return createHash('sha256').update(JSON.stringify(keyData)).digest('hex')
  }

  /**
   * Sanitize parameters for cache key generation
   */
  private sanitizeParameters(parameters: QueryParameters): any {
    const sanitized = { ...parameters }

    // Remove sensitive data for cache key
    delete sanitized.patientId

    // Normalize date ranges
    if (sanitized.dateRanges) {
      sanitized.dateRanges = sanitized.dateRanges.map(range => ({
        start: range.start.toISOString().split('T')[0],
        end: range.end.toISOString().split('T')[0],
      }))
    }

    return sanitized
  }

  /**
   * Try to get data from cache first, fallback to database
   */
  private async getWithCache<T>(
    intent: QueryIntent,
    parameters: QueryParameters,
    dbOperation: () => Promise<T>,
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(intent, parameters)
    const startTime = Date.now()

    try {
      // Try cache first
      const cachedEntry = await this.cache.get(cacheKey)

      if (cachedEntry) {
        this.cacheStats.hits++
        this.cacheStats.avgCacheTime = this.updateAverage(
          this.cacheStats.avgCacheTime,
          Date.now() - startTime,
        )

        return cachedEntry.data as T
      }

      // Cache miss - get from database
      this.cacheStats.misses++
      const dbStartTime = Date.now()
      const data = await dbOperation()
      const dbTime = Date.now() - dbStartTime

      this.cacheStats.avgDbTime = this.updateAverage(
        this.cacheStats.avgDbTime,
        dbTime,
      )

      // Cache the result with appropriate TTL
      if (data && Array.isArray(data) && data.length > 0) {
        const cacheEntry: CacheEntry = {
          key: cacheKey,
          data,
          createdAt: new Date(),
          lastAccessedAt: new Date(),
          accessCount: 1,
          ttl: this.getCacheTTL(intent),
          sensitivity: this.getDataSensitivity(intent),
          lgpdCompliant: true,
          tier: CacheTier.REDIS,
          metadata: {
            intent,
            recordCount: data.length,
            queryTime: dbTime,
            _userId: this.permissionContext.userId,
          },
        }

        await this.cache.set(cacheKey, cacheEntry)
      }

      return data
    } catch {
      console.error(
        `[EnhancedAIDataService] Error in getWithCache for ${intent}:`,
        error,
      )
      throw error
    }
  }

  /**
   * Get appropriate TTL based on query type
   */
  private getCacheTTL(intent: QueryIntent): number {
    switch (intent) {
      case 'client_data':
        return 600 // 10 minutes - client data changes less frequently
      case 'appointments':
        return 300 // 5 minutes - appointments change more frequently
      case 'financial':
        return 900 // 15 minutes - financial data is relatively stable
      default:
        return AIDATA_CACHE_CONFIG.defaultTTL
    }
  }

  /**
   * Get data sensitivity level for query type
   */
  private getDataSensitivity(intent: QueryIntent): CacheDataSensitivity {
    switch (intent) {
      case 'financial':
        return CacheDataSensitivity.HIGH
      case 'client_data':
        return CacheDataSensitivity.HIGH
      case 'appointments':
        return CacheDataSensitivity.MEDIUM
      default:
        return CacheDataSensitivity.MEDIUM
    }
  }

  /**
   * Update running average
   */
  private updateAverage(current: number, newValue: number): number {
    return current === 0 ? newValue : current * 0.9 + newValue * 0.1
  }

  /**
   * Get clients by name with caching
   */
  async getClientsByName(parameters: QueryParameters): Promise<any[]> {
    return this.getWithCache('client_data', parameters, async () => {
      return super.getClientsByName(parameters)
    })
  }

  /**
   * Get appointments by date range with caching
   */
  async getAppointmentsByDate(parameters: QueryParameters): Promise<any[]> {
    return this.getWithCache('appointments', parameters, async () => {
      return super.getAppointmentsByDate(parameters)
    })
  }

  /**
   * Get financial summary with caching
   */
  async getFinancialSummary(parameters: QueryParameters): Promise<any> {
    return this.getWithCache('financial', parameters, async () => {
      return super.getFinancialSummary(parameters)
    })
  }

  /**
   * Handle cache invalidation events
   */
  private handleCacheInvalidation(event: any): void {
    logger.info('Cache invalidation event received', {
      type: event.type,
      entityType: event.entityType,
      domain: event.domain,
      userId: event.userId,
    })

    // Invalidate relevant cache entries
    if (
      event.domain === this.permissionContext.domain ||
      event.userId === this.permissionContext.userId
    ) {
      // Clear cache stats for affected user/domain
      this.cacheStats.hits = 0
      this.cacheStats.misses = 0
    }
  }

  /**
   * Get cache performance statistics
   */
  async getCacheStats() {
    const redisStats = await this.cache.getStats()
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses
    const hitRate = totalRequests > 0 ? this.cacheStats.hits / totalRequests : 0

    return {
      ...redisStats,
      customStats: {
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        hitRate,
        avgCacheTime: this.cacheStats.avgCacheTime,
        avgDbTime: this.cacheStats.avgDbTime,
        totalRequests,
      },
      performance: {
        cacheEfficiency: hitRate > 0.7
          ? 'excellent'
          : hitRate > 0.5
          ? 'good'
          : 'needs_improvement',
        avgResponseTime: hitRate * this.cacheStats.avgCacheTime +
          (1 - hitRate) * this.cacheStats.avgDbTime,
        speedImprovement: this.cacheStats.avgDbTime > 0
          ? ((this.cacheStats.avgDbTime -
            (hitRate * this.cacheStats.avgCacheTime +
              (1 - hitRate) * this.cacheStats.avgDbTime)) /
            this.cacheStats.avgDbTime) *
            100
          : 0,
      },
    }
  }

  /**
   * Clear cache for specific intent
   */
  async clearIntentCache(intent: QueryIntent): Promise<void> {
    try {
      // Use cache invalidation service for proper invalidation
      const invalidationService = aiCacheInvalidationManager.getService()
      if (invalidationService) {
        await invalidationService.invalidateByQueryContext(
          intent,
          this.permissionContext,
          `Manual cache clear for ${intent}`,
        )
      }

      // Fallback to direct cache clearing
      const keys = await this.cache.getKeys(`${intent}_*`)
      for (const key of keys) {
        await this.cache.delete(key)
      }
    } catch (error) {
      logger.error(
        `[EnhancedAIDataService] Error clearing cache for ${intent}:`,
        error,
      )
    }
  }

  /**
   * Health check for cache and database
   */
  async healthCheck(): Promise<{
    cache: { healthy: boolean; message?: string }
    database: { healthy: boolean; message?: string }
    performance: any
  }> {
    const cacheHealthy = await this.cacheHealthCheck()
    const dbHealthy = await this.databaseHealthCheck()
    const stats = await this.getCacheStats()

    return {
      cache: cacheHealthy,
      database: dbHealthy,
      performance: stats.performance,
    }
  }

  /**
   * Check cache health
   */
  private async cacheHealthCheck(): Promise<{
    healthy: boolean
    message?: string
  }> {
    try {
      // Test cache with a simple get/set operation
      const testKey = 'health_check_test'
      const testData = { test: true, timestamp: Date.now() }

      const testEntry: CacheEntry = {
        key: testKey,
        data: testData,
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        accessCount: 1,
        ttl: 60,
        sensitivity: CacheDataSensitivity.LOW,
        lgpdCompliant: true,
        tier: CacheTier.REDIS,
      }

      await this.cache.set(testKey, testEntry)
      const retrieved = await this.cache.get(testKey)
      await this.cache.delete(testKey)

      if (!retrieved || retrieved.data.test !== true) {
        return { healthy: false, message: 'Cache read/write test failed' }
      }

      return { healthy: true }
    } catch {
      return {
        healthy: false,
        message: `Cache health check failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  /**
   * Check database health
   */
  private async databaseHealthCheck(): Promise<{
    healthy: boolean
    message?: string
  }> {
    try {
      const { data: _data, error } = await this.supabase
        .from('clients')
        .select('count', { count: 'exact', head: true })
        .limit(1)

      if (error) {
        return {
          healthy: false,
          message: `Database query failed: ${error.message}`,
        }
      }

      return { healthy: true }
    } catch {
      return {
        healthy: false,
        message: `Database health check failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.cache) {
      await this.cache.destroy()
    }
  }
}

/**
 * Factory function to create enhanced AI data service
 */
export function createEnhancedAIDataService(
  permissionContext: PermissionContext,
): EnhancedAIDataService {
  return new EnhancedAIDataService(permissionContext)
}

export default EnhancedAIDataService
