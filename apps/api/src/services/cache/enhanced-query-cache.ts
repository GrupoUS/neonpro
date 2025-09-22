/**
 * Enhanced Query Cache Service for AI Agent Database Integration
 *
 * Provides intelligent caching with multi-tier architecture, healthcare compliance,
 * smart invalidation, and performance monitoring.
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM, ISO 27001
 */

import { createHash } from 'crypto';
import { AguiQueryMessage, AguiResponseMessage } from '../agui-protocol/types';

import { CacheManagementService } from '../../../shared/src/services/cache-management';
import {
  CacheConfig,
  CacheDataSensitivity,
  CacheOperationResult,
  CacheTier,
  HealthcareCacheContext,
} from '../../../shared/src/services/cache-management';
import { RedisCacheBackend } from '../../../shared/src/services/redis-cache-backend';

const QueryCacheKeySchema = z.string().min(1).max(1000);
const UserIdSchema = z.string().min(1).max(255);
const QueryTTLSchema = z.number().min(1).max(86400); // Max 24 hours
const CacheSizeSchema = z.number().min(1).max(10000);

/**
 * Enhanced query cache configuration
 */
export interface EnhancedQueryCacheConfig {
  // Cache settings
  enableMemoryCache: boolean;
  enableRedisCache: boolean;
  defaultTTL: number;
  maxSize: number;

  // Redis settings
  redisUrl?: string;
  redisPassword?: string;
  redisDatabase?: number;

  // Security settings
  enableEncryption: boolean;
  enableAuditLogging: boolean;
  securityKey: string;

  // Performance settings
  enableCompression: boolean;
  enableMetrics: boolean;
  healthCheckInterval: number;

  // Healthcare compliance
  lgpdCompliance: boolean;
  dataRetentionHours: number;
  anonymizationEnabled: boolean;
}

/**
 * Query cache entry with metadata
 */
export interface QueryCacheEntry {
  // Query information
  queryHash: string;
  _query: AguiQueryMessage;

  // Response data
  response: AguiResponseMessage;

  // Metadata
  timestamp: string;
  ttl: number;
  hitCount: number;

  // Healthcare context
  _userId: string;
  patientId?: string;
  clinicId?: string;
  dataCategories: string[];
  sensitivity: CacheDataSensitivity;

  // Performance metrics
  executionTime: number;
  cacheTier: CacheTier;

  // Compliance
  lgpdCompliant: boolean;
  auditRequired: boolean;
  consentId?: string;
}

/**
 * Cache performance statistics
 */
export interface QueryCacheStats {
  // Basic metrics
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;

  // Performance metrics
  averageResponseTime: number;
  averageExecutionTime: number;
  totalSavingsMs: number;

  // Memory usage
  memoryCacheSize: number;
  redisCacheSize: number;
  totalMemoryUsage: number;

  // Healthcare metrics
  sensitiveDataQueries: number;
  lgpdCompliantQueries: number;
  auditedOperations: number;

  // Tier distribution
  memoryHits: number;
  redisHits: number;

  // Error tracking
  errorCount: number;
  lastError?: string;
}

/**
 * Enhanced Query Cache Service with healthcare compliance
 */
export class EnhancedQueryCacheService {
  private config: EnhancedQueryCacheConfig;
  private cacheService: CacheManagementService;
  private redisBackend?: RedisCacheBackend;
  private stats: QueryCacheStats;
  private healthCheckTimer?: NodeJS.Timeout;
  private isConnected = false;

  constructor(config: EnhancedQueryCacheConfig) {
    this.config = this.validateConfig(config);
    this.stats = this.initializeStats();

    // Initialize cache service
    this.initializeCacheService();
    this.initializeHealthCheck();
  }

  /**
   * Get cached response for query
   */
  async getCachedResponse(
    _query: AguiQueryMessage,
    _userId: string,
    options: {
      clinicId?: string;
      forceRefresh?: boolean;
      bypassCache?: boolean;
    } = {},
  ): Promise<{
    response?: AguiResponseMessage;
    cached: boolean;
    source: 'memory' | 'redis' | 'miss';
    executionTime: number;
    metadata?: any;
  }> {
    const startTime = Date.now();

    try {
      // Validate inputs
      const validatedUserId = UserIdSchema.parse(_userId);
      const validatedQuery = this.validateQuery(_query);

      if (options.bypassCache) {
        return { cached: false, source: 'miss', executionTime: Date.now() - startTime };
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(validatedQuery, validatedUserId, options.clinicId);

      // Try to get from cache
      const cacheResult = await this.cacheService.get(
        cacheKey,
        this.createHealthcareContext(validatedQuery, validatedUserId, options.clinicId),
        {
          _userId: validatedUserId,
          sessionId: query.context?.sessionId,
        },
      );

      if (cacheResult.success && cacheResult.hit && cacheResult.value) {
        const entry: QueryCacheEntry = cacheResult.value;

        // Validate cached response
        if (this.validateCacheEntry(entry)) {
          // Update statistics
          this.stats.cacheHits++;
          this.stats.hitRate = this.calculateHitRate();
          this.stats.totalSavingsMs += entry.executionTime;

          if (cacheResult.tier === CacheTier.MEMORY) {
            this.stats.memoryHits++;
          } else if (cacheResult.tier === CacheTier.REDIS) {
            this.stats.redisHits++;
          }

          const executionTime = Date.now() - startTime;
          this.stats.averageResponseTime = this.updateAverage(
            this.stats.averageResponseTime,
            executionTime,
          );

          return {
            response: entry.response,
            cached: true,
            source: cacheResult.tier === CacheTier.MEMORY ? 'memory' : 'redis',
            executionTime,
            metadata: {
              hitCount: entry.hitCount,
              dataCategories: entry.dataCategories,
              sensitivity: entry.sensitivity,
              cacheTier: entry.cacheTier,
            },
          };
        }
      }

      // Cache miss
      this.stats.cacheMisses++;
      this.stats.hitRate = this.calculateHitRate();

      const executionTime = Date.now() - startTime;
      this.stats.averageResponseTime = this.updateAverage(
        this.stats.averageResponseTime,
        executionTime,
      );

      return { cached: false, source: 'miss', executionTime };
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      console.error('[Query Cache] Error getting cached response:', error);
      this.stats.errorCount++;
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error';

      return { cached: false, source: 'miss', executionTime: Date.now() - startTime };
    }
  }

  /**
   * Cache query response
   */
  async cacheResponse(
    _query: AguiQueryMessage,
    response: AguiResponseMessage,
    _userId: string,
    options: {
      clinicId?: string;
      customTTL?: number;
      forceCache?: boolean;
      metadata?: any;
    } = {},
  ): Promise<CacheOperationResult> {
    try {
      // Validate inputs
      const validatedUserId = UserIdSchema.parse(_userId);
      const validatedQuery = this.validateQuery(_query);
      const validatedResponse = this.validateResponse(response);

      // Generate cache key
      const cacheKey = this.generateCacheKey(validatedQuery, validatedUserId, options.clinicId);

      // Create cache entry
      const entry: QueryCacheEntry = {
        queryHash: this.generateQueryHash(validatedQuery),
        _query: validatedQuery,
        response: validatedResponse,
        timestamp: new Date().toISOString(),
        ttl: options.customTTL || this.config.defaultTTL,
        hitCount: 1,
        _userId: validatedUserId,
        patientId: validatedQuery.context?.patientId,
        clinicId: options.clinicId,
        dataCategories: this.extractDataCategories(validatedResponse),
        sensitivity: this.determineSensitivity(validatedQuery, validatedResponse),
        executionTime: 0, // Will be set by caller
        cacheTier: CacheTier.MEMORY, // Default tier
        lgpdCompliant: this.config.lgpdCompliance,
        auditRequired: this.requiresAudit(validatedQuery, validatedResponse),
        consentId: validatedQuery.context?.consentId,
      };

      // Determine cache tier based on sensitivity and usage
      entry.cacheTier = this.determineCacheTier(entry);

      // Store in cache
      const result = await this.cacheService.set(
        cacheKey,
        entry,
        {
          ttl: entry.ttl,
          sensitivity: entry.sensitivity,
          _context: this.createHealthcareContext(validatedQuery, validatedUserId, options.clinicId),
          tier: entry.cacheTier,
          userContext: {
            _userId: validatedUserId,
            sessionId: validatedQuery.context?.sessionId,
          },
        },
      );

      // Update statistics
      this.stats.totalQueries++;
      if (result.success) {
        this.stats.lgpdCompliantQueries++;
        if (entry.auditRequired) {
          this.stats.auditedOperations++;
        }
      }

      return result;
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      console.error('[Query Cache] Error caching response:', error);
      this.stats.errorCount++;
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        key: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Invalidate cache entries
   */
  async invalidateCache(
    pattern: string,
    options: {
      _userId?: string;
      patientId?: string;
      clinicId?: string;
      reason?: string;
    } = {},
  ): Promise<{
    success: boolean;
    invalidatedCount: number;
    details: string[];
  }> {
    try {
      const results: string[] = [];
      let totalInvalidated = 0;

      // Build invalidation pattern
      let invalidationPattern = pattern;
      if (options._userId) {
        invalidationPattern = `*user:${options._userId}*${pattern}*`;
      }
      if (options.patientId) {
        invalidationPattern = `*patient:${options.patientId}*${pattern}*`;
      }
      if (options.clinicId) {
        invalidationPattern = `*clinic:${options.clinicId}*${pattern}*`;
      }

      // Invalidate from cache service
      const invalidatedCount = await this.cacheService.invalidatePattern(
        invalidationPattern,
        options.clinicId
          ? {
            facilityId: options.clinicId,
            dataClassification: CacheDataSensitivity.INTERNAL,
          }
          : undefined,
        options._userId ? { _userId: options._userId } : undefined,
      );

      totalInvalidated += invalidatedCount;
      results.push(`Invalidated ${invalidatedCount} entries for pattern: ${invalidationPattern}`);

      // Log invalidation event
      if (options.reason) {
        console.log('[Query Cache] Cache invalidation:', {
          pattern,
          reason: options.reason,
          _userId: options._userId,
          patientId: options.patientId,
          clinicId: options.clinicId,
          totalInvalidated,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: true,
        invalidatedCount: totalInvalidated,
        details: results,
      };
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      console.error('[Query Cache] Error invalidating cache:', error);
      return {
        success: false,
        invalidatedCount: 0,
        details: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<QueryCacheStats> {
    try {
      // Get statistics from cache service
      const cacheStats = await this.cacheService.getStatistics();

      // Update memory usage
      let totalMemoryUsage = 0;
      cacheStats.forEach((tierStats, _tier) => {
        totalMemoryUsage += tierStats.memoryUsage;
        if (_tier === CacheTier.MEMORY) {
          this.stats.memoryCacheSize = tierStats.totalEntries;
        } else if (_tier === CacheTier.REDIS) {
          this.stats.redisCacheSize = tierStats.totalEntries;
        }
      });

      this.stats.totalMemoryUsage = totalMemoryUsage;

      return { ...this.stats };
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      console.error('[Query Cache] Error getting statistics:', error);
      return this.stats;
    }
  }

  /**
   * Health check and maintenance
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    details: string[];
    stats: QueryCacheStats;
  }> {
    const details: string[] = [];
    let healthy = true;

    try {
      // Check cache service health
      const cacheStats = await this.cacheService.getStatistics();
      details.push(`Cache backends: ${cacheStats.size} active`);

      // Check Redis connection if enabled
      if (this.config.enableRedisCache && this.redisBackend) {
        const redisStats = await this.cacheService.getStatistics();
        const redisAvailable = redisStats.has(CacheTier.REDIS);

        if (redisAvailable) {
          details.push('Redis connection: healthy');
        } else {
          details.push('Redis connection: unavailable');
          healthy = false;
        }
      }

      // Check memory usage
      if (this.stats.totalMemoryUsage > 100 * 1024 * 1024) { // 100MB
        details.push(
          `High memory usage: ${Math.round(this.stats.totalMemoryUsage / 1024 / 1024)}MB`,
        );
        healthy = false;
      }

      // Check error rate
      const errorRate = this.stats.totalQueries > 0
        ? this.stats.errorCount / this.stats.totalQueries
        : 0;
      if (errorRate > 0.05) { // 5% error rate threshold
        details.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
        healthy = false;
      }

      // Cleanup expired entries
      const cleanupResults = await this.cacheService.cleanup();
      let totalCleaned = 0;
      cleanupResults.forEach(count => totalCleaned += count);

      if (totalCleaned > 0) {
        details.push(`Cleaned up ${totalCleaned} expired entries`);
      }

      return {
        healthy,
        details,
        stats: await this.getStats(),
      };
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      console.error('[Query Cache] Health check failed:', error);
      return {
        healthy: false,
        details: [
          `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        stats: this.stats,
      };
    }
  }

  /**
   * Initialize cache service with backends
   */
  private initializeCacheService(): void {
    const cacheConfig: CacheConfig = {
      maxSize: this.config.maxSize,
      defaultTTL: this.config.defaultTTL,
      maxTTL: 86400, // 24 hours
      evictionStrategy: 'lru' as any,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      healthcareRetentionPolicy: {
        [CacheDataSensitivity.PUBLIC]: 86400,
        [CacheDataSensitivity.INTERNAL]: 3600,
        [CacheDataSensitivity.CONFIDENTIAL]: 1800,
        [CacheDataSensitivity.RESTRICTED]: 900,
      },
      lgpdSettings: {
        enableAuditLogging: this.config.enableAuditLogging,
        requireConsent: true,
        autoAnonymization: this.config.anonymizationEnabled,
        dataRetentionDays: Math.floor(this.config.dataRetentionHours / 24),
      },
      performanceSettings: {
        enableCompression: this.config.enableCompression,
        enableEncryption: this.config.enableEncryption,
        enableMetrics: this.config.enableMetrics,
        batchOperations: true,
      },
    };

    this.cacheService = new CacheManagementService(cacheConfig);

    // Add memory backend
    if (this.config.enableMemoryCache) {
      const { InMemoryCacheBackend } = require('../../../shared/src/services/cache-management');
      this.cacheService.registerBackend(CacheTier.MEMORY, new InMemoryCacheBackend(cacheConfig));
    }

    // Add Redis backend
    if (this.config.enableRedisCache && this.config.redisUrl) {
      this.redisBackend = new RedisCacheBackend(cacheConfig, {
        url: this.config.redisUrl,
        password: this.config.redisPassword,
        database: this.config.redisDatabase || 0,
        keyPrefix: 'healthcare_query_cache:',
        connectTimeout: 5000,
        commandTimeout: 5000,
        tls: false, // Configure based on environment
        connectionName: 'healthcare-query-cache',
      });

      this.cacheService.registerBackend(CacheTier.REDIS, this.redisBackend);
      this.isConnected = true;
    }
  }

  /**
   * Initialize health check timer
   */
  private initializeHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => this.healthCheck(), this.config.healthCheckInterval);
  }

  /**
   * Generate secure cache key
   */
  private generateCacheKey(_query: AguiQueryMessage, _userId: string, clinicId?: string): string {
    const queryData = {
      _query: this.sanitizeQueryString(_query._query),
      _context: {
        patientId: query._context?.patientId
          ? this.sanitizeString(_query._context.patientId)
          : undefined,
        _userId: query._context?._userId, // Already has underscore
        // sessionId: query._context?.sessionId, // Property not in AguiQueryContext
      },
      options: {
        maxResults: Math.min(_query.options?.maxResults || 10, 100),
        model: this.sanitizeString(_query.options?.model || 'default'),
        temperature: Math.max(0, Math.min(1, _query.options?.temperature || 0.7)),
      },
    };

    const hash = createHash('sha256')
      .update(JSON.stringify(queryData) + this.config.securityKey + _userId)
      .digest('hex');

    return `_query:${_userId}:${clinicId ? `${clinicId}:` : ''}${hash}`;
  }

  /**
   * Generate query hash for comparison
   */
  private generateQueryHash(_query: AguiQueryMessage): string {
    const queryData = {
      _query: query._query.toLowerCase().trim(),
      _context: {
        patientId: query._context?.patientId,
      },
      options: {
        maxResults: query.options?.maxResults,
        model: query.options?.model,
      },
    };

    return createHash('sha256')
      .update(JSON.stringify(queryData))
      .digest('hex');
  }

  /**
   * Create healthcare context for caching
   */
  private createHealthcareContext(
    _query: AguiQueryMessage,
    _userId: string,
    clinicId?: string,
  ): HealthcareCacheContext {
    return {
      patientId: query._context?.patientId,
      providerId: userId,
      facilityId: clinicId,
      clinicalContext: 'consultation', // Default context
      dataClassification: CacheDataSensitivity.INTERNAL,
      lgpdConsentId: query.context?.consentId,
      retentionRequirement: 'standard',
    };
  }

  /**
   * Extract data categories from response
   */
  private extractDataCategories(response: AguiResponseMessage): string[] {
    const categories: string[] = [];

    if (response.sources) {
      response.sources.forEach(source => {
        switch (source.type) {
          case 'patient_data':
            categories.push('patient_records');
            break;
          case 'appointment':
            categories.push('appointments');
            break;
          case 'financial':
            categories.push('financial_data');
            break;
          case 'document':
            categories.push('documents');
            break;
          case 'medical_knowledge':
            categories.push('medical_knowledge');
            break;
        }
      });
    }

    // Content-based categorization
    const content = response.content.toLowerCase();
    if (content.includes('paciente') || content.includes('patient')) {
      categories.push('patient_data');
    }
    if (content.includes('agendamento') || content.includes('appointment')) {
      categories.push('appointments');
    }
    if (content.includes('financeiro') || content.includes('financial')) {
      categories.push('financial_data');
    }

    return Array.from(new Set(categories));
  }

  /**
   * Determine data sensitivity level
   */
  private determineSensitivity(
    _query: AguiQueryMessage,
    response: AguiResponseMessage,
  ): CacheDataSensitivity {
    // Check for patient data
    if (_query._context?.patientId || response.content.toLowerCase().includes('paciente')) {
      return CacheDataSensitivity.CONFIDENTIAL;
    }

    // Check for financial data
    if (response.content.toLowerCase().includes('financeiro')) {
      return CacheDataSensitivity.CONFIDENTIAL;
    }

    // Check for sensitive health information
    if (
      response.content.toLowerCase().includes('diagnóstico')
      || response.content.toLowerCase().includes('tratamento')
    ) {
      return CacheDataSensitivity.RESTRICTED;
    }

    return CacheDataSensitivity.INTERNAL;
  }

  /**
   * Determine cache tier based on entry characteristics
   */
  private determineCacheTier(entry: QueryCacheEntry): CacheTier {
    // Sensitive data goes to Redis for persistence
    if (entry.sensitivity === CacheDataSensitivity.RESTRICTED) {
      return CacheTier.REDIS;
    }

    // Frequently accessed data goes to fastest available tier
    if (this.config.enableMemoryCache && entry.hitCount > 10) {
      return CacheTier.MEMORY;
    }

    // Default to Redis if available
    if (this.config.enableRedisCache) {
      return CacheTier.REDIS;
    }

    return CacheTier.MEMORY;
  }

  /**
   * Check if operation requires audit logging
   */
  private requiresAudit(
    _query: AguiQueryMessage,
    response: AguiResponseMessage,
  ): boolean {
    // Audit patient data access
    if (_query._context?.patientId) {
      return true;
    }

    // Audit sensitive queries
    if (this.determineSensitivity(_query, response) === CacheDataSensitivity.RESTRICTED) {
      return true;
    }

    return false;
  }

  /**
   * Validate query structure
   */
  private validateQuery(_query: AguiQueryMessage): AguiQueryMessage {
    if (!_query || typeof _query !== 'object') {
      throw new Error('Invalid query object');
    }

    return {
      ..._query,
      _query: this.sanitizeQueryString(_query._query || ''),
      options: {
        maxResults: Math.min(_query.options?.maxResults || 10, 100),
        model: this.sanitizeString(_query.options?.model || 'default'),
        temperature: Math.max(0, Math.min(1, _query.options?.temperature || 0.7)),
      },
    };
  }

  /**
   * Validate response structure
   */
  private validateResponse(response: AguiResponseMessage): AguiResponseMessage {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response object');
    }

    return {
      ...response,
      content: this.sanitizeString(response.content || ''),
      confidence: Math.max(0, Math.min(1, response.confidence || 0)),
    };
  }

  /**
   * Validate cache entry
   */
  private validateCacheEntry(entry: QueryCacheEntry): boolean {
    return !!(
      entry
      && typeof entry === 'object'
      && entry.response
      && typeof entry.timestamp === 'string'
      && entry.ttl > 0
      && entry._userId
    );
  }

  /**
   * Sanitize query string
   */
  private sanitizeQueryString(_query: string): string {
    if (typeof _query !== 'string') return '';
    return query.replace(/[<>"'&]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1000);
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>"'&\\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 255);
  }

  /**
   * Calculate hit rate
   */
  private calculateHitRate(): number {
    const total = this.stats.cacheHits + this.stats.cacheMisses;
    return total > 0 ? this.stats.cacheHits / total : 0;
  }

  /**
   * Update average with exponential moving average
   */
  private updateAverage(current: number, newValue: number): number {
    const weight = 0.1;
    return current * (1 - weight) + newValue * weight;
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): QueryCacheStats {
    return {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      averageExecutionTime: 0,
      totalSavingsMs: 0,
      memoryCacheSize: 0,
      redisCacheSize: 0,
      totalMemoryUsage: 0,
      sensitiveDataQueries: 0,
      lgpdCompliantQueries: 0,
      auditedOperations: 0,
      memoryHits: 0,
      redisHits: 0,
      errorCount: 0,
    };
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: EnhancedQueryCacheConfig): EnhancedQueryCacheConfig {
    if (!config.securityKey) {
      throw new Error('Security key is required');
    }

    if (config.defaultTTL <= 0 || config.defaultTTL > 86400) {
      throw new Error('TTL must be between 1 and 86400 seconds');
    }

    if (config.maxSize <= 0 || config.maxSize > 10000) {
      throw new Error('Max size must be between 1 and 10000');
    }

    return {
      ...config,
      enableMemoryCache: config.enableMemoryCache ?? true,
      enableRedisCache: config.enableRedisCache ?? false,
      enableEncryption: config.enableEncryption ?? false,
      enableAuditLogging: config.enableAuditLogging ?? true,
      enableCompression: config.enableCompression ?? true,
      enableMetrics: config.enableMetrics ?? true,
      lgpdCompliance: config.lgpdCompliance ?? true,
      anonymizationEnabled: config.anonymizationEnabled ?? true,
      dataRetentionHours: config.dataRetentionHours ?? 168, // 7 days
    };
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    if (this.redisBackend) {
      await this.redisBackend.destroy();
    }
  }
}

/**
 * Factory function to create enhanced query cache with healthcare configuration
 */
export function createEnhancedQueryCache(): EnhancedQueryCacheService {
  const config: EnhancedQueryCacheConfig = {
    enableMemoryCache: process.env.ENABLE_MEMORY_CACHE !== 'false',
    enableRedisCache: process.env.ENABLE_REDIS_CACHE === 'true',
    redisUrl: process.env.REDIS_URL,
    redisPassword: process.env.REDIS_PASSWORD,
    redisDatabase: parseInt(process.env.REDIS_DATABASE || '0'),
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'), // 1 hour
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
    enableEncryption: process.env.CACHE_ENABLE_ENCRYPTION === 'true',
    enableAuditLogging: process.env.CACHE_ENABLE_AUDIT !== 'false',
    enableCompression: process.env.CACHE_ENABLE_COMPRESSION !== 'false',
    enableMetrics: process.env.CACHE_ENABLE_METRICS !== 'false',
    healthCheckInterval: parseInt(process.env.CACHE_HEALTH_CHECK_INTERVAL || '30000'),
    lgpdCompliance: process.env.LGDP_COMPLIANCE !== 'false',
    dataRetentionHours: parseInt(process.env.CACHE_DATA_RETENTION_HOURS || '168'),
    anonymizationEnabled: process.env.CACHE_ANONYMIZATION_ENABLED !== 'false',
    securityKey: process.env.CACHE_SECURITY_KEY || 'healthcare_query_cache_security_key',
  };

  return new EnhancedQueryCacheService(config);
}

export default EnhancedQueryCacheService;
