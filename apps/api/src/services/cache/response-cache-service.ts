/**
 * Response Cache Service for AI Agent Performance Optimization
 * Implements intelligent caching for frequently accessed healthcare data
 */

import { Redis } from 'ioredis';
import { createHash } from 'crypto';
import { z } from 'zod';
import {
  AguiQueryMessage,
  AguiResponseMessage,
  AguiSource,
  AguiUsageStats
} from '../agui-protocol/types';

// Input validation schemas
const CacheKeySchema = z.string().min(1).max(500);
const UserIdSchema = z.string().min(1).max(255);
const TTLSchema = z.number().min(1).max(86400); // Max 24 hours
const CacheSizeSchema = z.number().min(1).max(10000);

export interface CacheConfig {
  redisUrl: string;
  defaultTTL: number; // seconds
  maxSize: number; // number of items
  compressionEnabled: boolean;
  healthCheckInterval: number; // ms
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: string;
  ttl: number;
  hitCount: number;
  metadata: {
    queryHash: string;
    userId: string;
    patientId?: string;
    dataCategories: string[];
    confidenceScore?: number;
    sources?: AguiSource[];
  };
}

export interface CacheStats {
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  averageResponseTimeMs: number;
  memoryUsage: number;
  cacheSize: number;
  evictionCount: number;
  compressionRatio?: number;
}

export class ResponseCacheService {
  private redis: Redis;
  private config: CacheConfig;
  private stats: CacheStats;
  private localCache: Map<string, CacheEntry>;
  private healthCheckTimer?: NodeJS.Timeout;
  private isConnected = false;
  private connectionRetries = 0;
  private maxRetries = 3;
  private securityKey: string;
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: CacheConfig) {
    // Validate configuration
    this.validateConfig(config);

    this.config = config;
    this.securityKey = process.env.CACHE_SECURITY_KEY || 'default_security_key';
    this.localCache = new Map();
    this.stats = {
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      averageResponseTimeMs: 0,
      memoryUsage: 0,
      cacheSize: 0,
      evictionCount: 0
    };

    // Initialize Redis with security options
    this.initializeRedis();
    this.initializeHealthCheck();
  }

  /**
   * Generate secure cache key for query
   */
  private generateCacheKey(query: AguiQueryMessage, userId: string): string {
    // Validate inputs
    const validatedUserId = UserIdSchema.parse(userId);

    const queryData = {
      query: this.sanitizeQueryString(query.query),
      context: {
        patientId: query.context?.patientId ? this.sanitizeString(query.context.patientId) : undefined,
        userId: query.context?.userId ? this.sanitizeString(query.context.userId) : undefined,
        previousTopics: query.context?.previousTopics?.map(t => this.sanitizeString(t)) || []
      },
      options: {
        maxResults: Math.min(query.options?.maxResults || 10, 100), // Limit max results
        model: this.sanitizeString(query.options?.model || 'default'),
        temperature: Math.max(0, Math.min(1, query.options?.temperature || 0.7)) // Clamp temperature
      }
    };

    const hash = createHash('sha256')
      .update(JSON.stringify(queryData) + this.securityKey)
      .digest('hex');

    return `agent_response:${validatedUserId}:${hash}`;
  }

  /**
   * Extract data categories from response for intelligent caching
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

    // Add content-based categories
    if (response.content.toLowerCase().includes('agendamento')) {
      categories.push('appointments');
    }
    if (response.content.toLowerCase().includes('paciente')) {
      categories.push('patient_data');
    }
    if (response.content.toLowerCase().includes('financeiro')) {
      categories.push('financial_data');
    }

    return [...new Set(categories)];
  }

  /**
   * Compress data for storage
   */
  private async compressData(data: any): Promise<any> {
    if (!this.config.compressionEnabled) {
      return data;
    }

    // Simple JSON-based compression for now
    // In production, use proper compression algorithms
    return {
      _compressed: true,
      data: JSON.stringify(data)
    };
  }

  /**
   * Decompress cached data
   */
  private async decompressData(data: any): Promise<any> {
    if (!this.config.compressionEnabled || !data._compressed) {
      return data;
    }

    return JSON.parse(data.data);
  }

  /**
   * Get cached response with security validation
   */
  async getCachedResponse(
    query: AguiQueryMessage,
    userId: string
  ): Promise<AguiResponseMessage | null> {
    const startTime = Date.now();

    try {
      // Validate inputs and check rate limits
      const validatedUserId = UserIdSchema.parse(userId);

      if (!(await this.checkCacheRateLimit(validatedUserId))) {
        console.warn(`[Cache] Rate limit exceeded for user: ${validatedUserId}`);
        return null;
      }

      const cacheKey = this.generateCacheKey(query, validatedUserId);

      // Check local cache first
      const localEntry = this.localCache.get(cacheKey);
      if (localEntry && !this.isExpired(localEntry)) {
        localEntry.hitCount++;
        this.stats.totalHits++;
        this.updateHitRate();
        this.stats.averageResponseTimeMs = Date.now() - startTime;

        const decompressed = await this.decompressData(localEntry.data);
        return this.validateCachedResponse(decompressed);
      }

      // Check Redis cache if connected
      if (this.isConnected && this.redis) {
        const redisData = await this.safeRedisOperation(() => this.redis.get(cacheKey));
        if (redisData) {
          const entry: CacheEntry = JSON.parse(redisData);

          if (!this.isExpired(entry)) {
            // Validate entry structure
            if (this.validateCacheEntry(entry)) {
              // Move to local cache for faster access
              entry.hitCount++;
              this.localCache.set(cacheKey, entry);

              // Cleanup local cache if oversized
              this.enforceLocalCacheSize();

              this.stats.totalHits++;
              this.updateHitRate();
              this.stats.averageResponseTimeMs = Date.now() - startTime;

              const decompressed = await this.decompressData(entry.data);
              return this.validateCachedResponse(decompressed);
            }
          } else {
            // Remove expired entry
            await this.safeRedisOperation(() => this.redis.del(cacheKey));
          }
        }
      }

      this.stats.totalMisses++;
      this.updateHitRate();
      return null;

    } catch (error) {
      console.error('[Cache] Error retrieving cached response:', error);
      this.stats.totalMisses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Cache response with security validation
   */
  async cacheResponse(
    query: AguiQueryMessage,
    response: AguiResponseMessage,
    userId: string,
    options: {
      customTTL?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<void> {
    if (options.skipCache) {
      return;
    }

    try {
      // Validate inputs
      const validatedUserId = UserIdSchema.parse(userId);
      const validatedTTL = TTLSchema.parse(options.customTTL || this.config.defaultTTL);

      // Validate response before caching
      const validatedResponse = this.validateResponseForCaching(response);
      if (!validatedResponse) {
        console.warn('[Cache] Response validation failed, not caching');
        return;
      }

      const cacheKey = this.generateCacheKey(query, validatedUserId);

      // Sanitize metadata
      const patientId = query.context?.patientId ? this.sanitizeString(query.context.patientId) : undefined;

      const entry: CacheEntry = {
        data: await this.compressData(validatedResponse),
        timestamp: new Date().toISOString(),
        ttl: validatedTTL,
        hitCount: 1,
        metadata: {
          queryHash: this.sanitizeHash(cacheKey.split(':').pop()!),
          userId: validatedUserId,
          patientId,
          dataCategories: this.extractDataCategories(validatedResponse),
          confidenceScore: Math.max(0, Math.min(1, validatedResponse.confidence || 0)),
          sources: validatedResponse.sources?.map(s => this.validateSource(s)) || []
        }
      };

      // Validate entry structure
      if (!this.validateCacheEntry(entry)) {
        console.warn('[Cache] Cache entry validation failed, not caching');
        return;
      }

      // Store in Redis if connected
      if (this.isConnected && this.redis) {
        await this.safeRedisOperation(() => this.redis.setex(cacheKey, validatedTTL, JSON.stringify(entry)));
      }

      // Store in local cache with size limit
      if (this.localCache.size < this.config.maxSize) {
        this.localCache.set(cacheKey, entry);
        this.enforceLocalCacheSize();
      }

      this.stats.cacheSize++;

    } catch (error) {
      console.error('[Cache] Error caching response:', error);
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = new Date();
    const expiresAt = new Date(entry.timestamp);
    expiresAt.setSeconds(expiresAt.getSeconds() + entry.ttl);
    
    return now > expiresAt;
  }

  /**
   * Enforce local cache size limit
   */
  private enforceLocalCacheSize(): void {
    if (this.localCache.size > this.config.maxSize) {
      // Simple LRU eviction
      const entries = Array.from(this.localCache.entries());
      entries.sort((a, b) => a[1].hitCount - b[1].hitCount);
      
      const toRemove = entries.slice(0, Math.floor(this.config.maxSize * 0.2));
      toRemove.forEach(([key]) => {
        this.localCache.delete(key);
        this.stats.evictionCount++;
      });
    }
  }

  /**
   * Update cache hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses;
    this.stats.hitRate = total > 0 ? (this.stats.totalHits / total) * 100 : 0;
  }

  /**
   * Invalidate cache entries with validation
   */
  async invalidateCache(pattern: string): Promise<number> {
    try {
      // Validate pattern to prevent cache poisoning
      const validatedPattern = CacheKeySchema.parse(pattern);
      
      // Sanitize pattern to prevent Redis injection
      const sanitizedPattern = this.sanitizeRedisPattern(validatedPattern);

      let invalidatedCount = 0;

      // Clear Redis cache if connected
      if (this.isConnected && this.redis) {
        const keys = await this.safeRedisOperation(() => this.redis.keys(sanitizedPattern));
        if (keys.length > 0) {
          // Limit batch size to prevent Redis overload
          const batchSize = 100;
          for (let i = 0; i < keys.length; i += batchSize) {
            const batch = keys.slice(i, i + batchSize);
            await this.safeRedisOperation(() => this.redis.del(...batch));
          }
          invalidatedCount += keys.length;
        }
      }

      // Clear matching local cache entries
      for (const [key] of this.localCache) {
        if (this.safeKeyMatch(key, sanitizedPattern)) {
          this.localCache.delete(key);
          invalidatedCount++;
        }
      }

      this.stats.evictionCount += invalidatedCount;
      return invalidatedCount;

    } catch (error) {
      console.error('[Cache] Error invalidating cache:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      // Get Redis info
      const redisInfo = await this.redis.info('memory');
      const memoryMatch = redisInfo.match(/used_memory_human:([^\r\n]+)/);
      this.stats.memoryUsage = memoryMatch ? parseFloat(memoryMatch[1]) : 0;

      // Get cache size
      const cacheSize = await this.redis.dbsize();
      this.stats.cacheSize = cacheSize;

    } catch (error) {
      console.error('[Cache] Error getting cache stats:', error);
    }

    return { ...this.stats };
  }

  /**
   * Health check and cleanup
   */
  private async healthCheck(): Promise<void> {
    try {
      // Test Redis connection
      await this.redis.ping();

      // Clean expired entries from local cache
      for (const [key, entry] of this.localCache) {
        if (this.isExpired(entry)) {
          this.localCache.delete(key);
          this.stats.evictionCount++;
        }
      }

    } catch (error) {
      console.error('[Cache] Health check failed:', error);
    }
  }

  /**
   * Initialize health check timer
   */
  private initializeHealthCheck(): void {
    this.healthCheckTimer = setInterval(
      () => this.healthCheck(),
      this.config.healthCheckInterval
    );
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    await this.redis.quit();
    this.localCache.clear();
  }
}

/**
 * Healthcare-specific cache configuration with validation
 */
export function createHealthcareCacheConfig(): CacheConfig {
  // Validate environment variables
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required');
  }

  // Validate Redis URL format
  try {
    new URL(redisUrl);
  } catch (error) {
    throw new Error('Invalid REDIS_URL format');
  }

  return {
    redisUrl,
    defaultTTL: 3600, // 1 hour for healthcare data
    maxSize: 1000, // Local cache size
    compressionEnabled: true,
    healthCheckInterval: 30000 // 30 seconds
  };
}

  /**
   * Initialize Redis with security options
   */
  private initializeRedis(): void {
    try {
      const redisOptions = {
        connectTimeout: 5000,
        commandTimeout: 5000,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableReadyCheck: true,
        keepAlive: true,
        family: 0, // Allow both IPv4 and IPv6
        // Security options
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
        name: 'healthcare-cache-client'
      };

      this.redis = new Redis(this.config.redisUrl, redisOptions);

      // Setup event handlers
      this.redis.on('connect', () => {
        this.isConnected = true;
        this.connectionRetries = 0;
        console.log('[Cache] Connected to Redis');
      });

      this.redis.on('error', (error) => {
        console.error('[Cache] Redis connection error:', error);
        this.isConnected = false;
        this.handleRedisConnectionError();
      });

      this.redis.on('close', () => {
        this.isConnected = false;
        console.warn('[Cache] Redis connection closed');
      });

      // Connect to Redis
      this.redis.connect().catch(error => {
        console.error('[Cache] Failed to connect to Redis:', error);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('[Cache] Redis initialization error:', error);
      this.isConnected = false;
    }
  }

  /**
   * Handle Redis connection errors with retry logic
   */
  private handleRedisConnectionError(): void {
    if (this.connectionRetries < this.maxRetries) {
      this.connectionRetries++;
      const delay = Math.pow(2, this.connectionRetries) * 1000; // Exponential backoff

      setTimeout(() => {
        console.log(`[Cache] Retrying Redis connection (attempt ${this.connectionRetries}/${this.maxRetries})`);
        this.redis.connect().catch(error => {
          console.error('[Cache] Redis retry failed:', error);
        });
      }, delay);
    } else {
      console.error('[Cache] Max Redis connection retries reached');
    }
  }

  /**
   * Safe Redis operation wrapper
   */
  private async safeRedisOperation<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.isConnected || !this.redis) {
      throw new Error('Redis not connected');
    }

    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Redis operation timeout')), 5000)
        )
      ]);
    } catch (error) {
      console.error('[Cache] Redis operation failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: CacheConfig): void {
    if (!config.redisUrl) {
      throw new Error('Redis URL is required');
    }

    if (config.defaultTTL <= 0 || config.defaultTTL > 86400) {
      throw new Error('TTL must be between 1 and 86400 seconds');
    }

    if (config.maxSize <= 0 || config.maxSize > 10000) {
      throw new Error('Max size must be between 1 and 10000');
    }

    if (config.healthCheckInterval <= 0 || config.healthCheckInterval > 300000) {
      throw new Error('Health check interval must be between 1 and 300000 ms');
    }
  }

  /**
   * Validate cache entry structure
   */
  private validateCacheEntry(entry: CacheEntry): boolean {
    try {
      return !!(
        entry &&
        typeof entry === 'object' &&
        typeof entry.timestamp === 'string' &&
        typeof entry.ttl === 'number' &&
        typeof entry.hitCount === 'number' &&
        entry.metadata &&
        typeof entry.metadata === 'object'
      );
    } catch {
      return false;
    }
  }

  /**
   * Validate response for caching
   */
  private validateResponseForCaching(response: AguiResponseMessage): AguiResponseMessage | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    // Sanitize content
    const sanitizedContent = this.sanitizeString(response.content || '');
    if (sanitizedContent.length === 0) {
      return null;
    }

    return {
      ...response,
      content: sanitizedContent,
      confidence: Math.max(0, Math.min(1, response.confidence || 0))
    };
  }

  /**
   * Validate cached response before returning
   */
  private validateCachedResponse(response: any): AguiResponseMessage | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    try {
      return {
        content: this.sanitizeString(response.content || ''),
        confidence: Math.max(0, Math.min(1, response.confidence || 0)),
        sources: Array.isArray(response.sources) ? response.sources.map(s => this.validateSource(s)).filter(Boolean) : []
      };
    } catch {
      return null;
    }
  }

  /**
   * Validate source structure
   */
  private validateSource(source: any): any {
    if (!source || typeof source !== 'object') {
      return null;
    }

    return {
      type: this.sanitizeString(source.type || ''),
      id: this.sanitizeString(source.id || ''),
      confidence: Math.max(0, Math.min(1, source.confidence || 0))
    };
  }

  /**
   * Sanitize query string
   */
  private sanitizeQueryString(query: string): string {
    if (typeof query !== 'string') return '';
    return query
      .replace(/[<>\"'&]/g, '') // Remove dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>\"'&\\]/g, '') // Remove dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 255); // Limit length
  }

  /**
   * Sanitize Redis pattern
   */
  private sanitizeRedisPattern(pattern: string): string {
    return pattern
      .replace(/[^a-zA-Z0-9_*:\-.]/g, '') // Only allow safe Redis pattern characters
      .substring(0, 100);
  }

  /**
   * Sanitize hash
   */
  private sanitizeHash(hash: string): string {
    return hash.replace(/[^a-fA-F0-9]/g, '').substring(0, 64);
  }

  /**
   * Safe key matching to prevent regex injection
   */
  private safeKeyMatch(key: string, pattern: string): boolean {
    const safePattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    try {
      const regex = new RegExp(`^${safePattern}$`);
      return regex.test(key);
    } catch {
      return false;
    }
  }

  /**
   * Check cache rate limit
   */
  private async checkCacheRateLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 1000; // Max requests per minute per user

    let rateLimitData = this.rateLimits.get(userId);
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      // Reset rate limit
      rateLimitData = {
        count: 1,
        resetTime: now + windowMs
      };
      this.rateLimits.set(userId, rateLimitData);
      return true;
    }

    if (rateLimitData.count >= maxRequests) {
      return false;
    }

    rateLimitData.count++;
    return true;
  }

  /**
   * Cleanup expired rate limits
   */
  private cleanupRateLimits(): void {
    const now = Date.now();
    for (const [userId, data] of this.rateLimits.entries()) {
      if (now > data.resetTime) {
        this.rateLimits.delete(userId);
      }
    }
  }

  /**
   * Intelligent cache invalidation based on data changes
   */
  async invalidateByDataCategory(
    category: string,
    userId?: string,
    patientId?: string
  ): Promise<number> {
    try {
      // Validate inputs
      const validatedCategory = this.sanitizeString(category);
      const validatedUserId = userId ? this.sanitizeString(userId) : undefined;
      const validatedPatientId = patientId ? this.sanitizeString(patientId) : undefined;

      let invalidatedCount = 0;

      // Build invalidation pattern
      let pattern = 'agent_response:*';
      if (validatedUserId) {
        pattern = `agent_response:${validatedUserId}:*`;
      }

      // Get all matching keys
      const keysToCheck: string[] = [];
      
      // Check local cache
      for (const [key, entry] of this.localCache) {
        if (this.safeKeyMatch(key, pattern)) {
          keysToCheck.push(key);
        }
      }

      // Check Redis cache
      if (this.isConnected && this.redis) {
        const redisKeys = await this.safeRedisOperation(() => this.redis.keys(pattern));
        keysToCheck.push(...redisKeys);
      }

      // Check each entry for matching category
      for (const key of keysToCheck) {
        let entry: CacheEntry | null = null;

        // Try local cache first
        if (this.localCache.has(key)) {
          entry = this.localCache.get(key)!;
        } else if (this.isConnected && this.redis) {
          // Try Redis
          const redisData = await this.safeRedisOperation(() => this.redis.get(key));
          if (redisData) {
            entry = JSON.parse(redisData);
          }
        }

        // Check if entry matches invalidation criteria
        if (entry && this.shouldInvalidateEntry(entry, validatedCategory, validatedUserId, validatedPatientId)) {
          // Remove from local cache
          this.localCache.delete(key);
          
          // Remove from Redis
          if (this.isConnected && this.redis) {
            await this.safeRedisOperation(() => this.redis.del(key));
          }

          invalidatedCount++;
        }
      }

      this.stats.evictionCount += invalidatedCount;
      return invalidatedCount;

    } catch (error) {
      console.error('[Cache] Error in category-based invalidation:', error);
      return 0;
    }
  }

  /**
   * Determine if cache entry should be invalidated
   */
  private shouldInvalidateEntry(
    entry: CacheEntry,
    category: string,
    userId?: string,
    patientId?: string
  ): boolean {
    // Check user-specific invalidation
    if (userId && entry.metadata.userId !== userId) {
      return false;
    }

    // Check patient-specific invalidation
    if (patientId && entry.metadata.patientId !== patientId) {
      return false;
    }

    // Check category match
    return entry.metadata.dataCategories.includes(category);
  }

  /**
   * Batch cache invalidation for multiple categories
   */
  async batchInvalidateCategories(
    categories: string[],
    options: {
      userId?: string;
      patientId?: string;
      reason?: string;
    } = {}
  ): Promise<{ success: boolean; invalidatedCount: number; details: string[] }> {
    const results: string[] = [];
    let totalInvalidated = 0;

    try {
      for (const category of categories) {
        const count = await this.invalidateByDataCategory(
          category,
          options.userId,
          options.patientId
        );
        
        totalInvalidated += count;
        results.push(`Invalidated ${count} entries for category: ${category}`);
      }

      // Log invalidation event for audit
      if (options.reason) {
        console.log('[Cache] Batch invalidation:', {
          categories,
          reason: options.reason,
          userId: options.userId,
          patientId: options.patientId,
          totalInvalidated,
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        invalidatedCount: totalInvalidated,
        details: results
      };

    } catch (error) {
      console.error('[Cache] Error in batch invalidation:', error);
      return {
        success: false,
        invalidatedCount: totalInvalidated,
        details: [...results, `Error: ${error}`]
      };
    }
  }

  /**
   * Smart cache pre-warming for critical data
   */
  async prewarmCache(
    queries: AguiQueryMessage[],
    responses: AguiResponseMessage[],
    userId: string
  ): Promise<{ success: boolean; cachedCount: number }> {
    try {
      let cachedCount = 0;

      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        const response = responses[i];

        if (query && response) {
          await this.cacheResponse(query, response, userId, {
            customTTL: CacheStrategies.patientData.ttl // Use longer TTL for pre-warmed data
          });
          cachedCount++;
        }
      }

      console.log(`[Cache] Pre-warmed ${cachedCount} entries for user: ${userId}`);
      return { success: true, cachedCount };

    } catch (error) {
      console.error('[Cache] Error pre-warming cache:', error);
      return { success: false, cachedCount: 0 };
    }
  }

  /**
   * Cache versioning for schema changes
   */
  private getCacheVersion(): string {
    return '1.0.0'; // Increment when cache structure changes
  }

  /**
   * Version-aware cache key generation
   */
  private generateVersionedCacheKey(baseKey: string): string {
    const version = this.getCacheVersion();
    return `${baseKey}:v${version}`;
  }

  /**
   * Invalidate all cache entries for a specific version (schema migration)
   */
  async invalidateVersion(version: string): Promise<number> {
    const pattern = `agent_response:*:v${version}`;
    return await this.invalidateCache(pattern);
  }

/**
 * Cache strategies for different data types
 */
export const CacheStrategies = {
  // Patient data - longer TTL, high priority
  patientData: {
    ttl: 7200, // 2 hours
    compress: true,
    priority: 'high'
  },

  // Appointments - shorter TTL, medium priority
  appointments: {
    ttl: 1800, // 30 minutes
    compress: true,
    priority: 'medium'
  },

  // Financial data - medium TTL, high priority
  financial: {
    ttl: 3600, // 1 hour
    compress: true,
    priority: 'high'
  },

  // Medical knowledge - long TTL, low priority
  medicalKnowledge: {
    ttl: 86400, // 24 hours
    compress: true,
    priority: 'low'
  },

  // Real-time queries - very short TTL, no cache
  realtime: {
    ttl: 60, // 1 minute
    compress: false,
    priority: 'low'
  }
};