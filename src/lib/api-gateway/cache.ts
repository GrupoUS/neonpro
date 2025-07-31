/**
 * NeonPro - API Gateway Cache System
 * High-performance caching system for API responses and data
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import { ApiGatewayCache, ApiGatewayLogger } from './types';

/**
 * Memory Cache Implementation
 * In-memory cache with LRU eviction policy
 */
export class MemoryApiGatewayCache implements ApiGatewayCache {
  private cache: Map<string, { value: any; expiry: number; accessTime: number }> = new Map();
  private maxSize: number;
  private defaultTtl: number;
  private logger?: ApiGatewayLogger;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  };

  constructor(
    maxSize: number = 1000,
    defaultTtl: number = 300000, // 5 minutes
    logger?: ApiGatewayLogger
  ) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    this.logger = logger;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access time for LRU
    entry.accessTime = Date.now();
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiry = Date.now() + (ttl || this.defaultTtl);
    const accessTime = Date.now();
    
    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    this.cache.set(key, { value, expiry, accessTime });
    this.stats.sets++;
    
    this.logger?.debug('Cache set', { key, ttl: ttl || this.defaultTtl });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      this.stats.deletes++;
      this.logger?.debug('Cache delete', { key });
    }
    
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    
    this.logger?.info('Cache cleared', { entriesRemoved: size });
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    evictions: number;
    size: number;
    hitRate: number;
  }> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessTime < oldestTime) {
        oldestTime = entry.accessTime;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      
      this.logger?.debug('Cache LRU eviction', { key: oldestKey });
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.logger?.debug('Cache cleanup', { entriesRemoved: cleaned });
    }
  }
}

/**
 * Redis Cache Implementation
 * Distributed cache using Redis
 */
export class RedisApiGatewayCache implements ApiGatewayCache {
  private redis: any; // Redis client
  private defaultTtl: number;
  private logger?: ApiGatewayLogger;
  private keyPrefix: string;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0
  };

  constructor(
    redisClient: any,
    defaultTtl: number = 300, // 5 minutes in seconds
    keyPrefix: string = 'neonpro:api:',
    logger?: ApiGatewayLogger
  ) {
    this.redis = redisClient;
    this.defaultTtl = defaultTtl;
    this.keyPrefix = keyPrefix;
    this.logger = logger;
  }

  /**
   * Get value from Redis cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.keyPrefix + key;
      const value = await this.redis.get(fullKey);
      
      if (value === null) {
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Redis cache get error', error as Error, { key });
      return null;
    }
  }

  /**
   * Set value in Redis cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.keyPrefix + key;
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTtl;
      
      await this.redis.setex(fullKey, expiry, serialized);
      
      this.stats.sets++;
      this.logger?.debug('Redis cache set', { key, ttl: expiry });
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Redis cache set error', error as Error, { key });
      throw error;
    }
  }

  /**
   * Delete value from Redis cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.keyPrefix + key;
      const result = await this.redis.del(fullKey);
      
      const deleted = result > 0;
      
      if (deleted) {
        this.stats.deletes++;
        this.logger?.debug('Redis cache delete', { key });
      }
      
      return deleted;
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Redis cache delete error', error as Error, { key });
      return false;
    }
  }

  /**
   * Clear all cache entries with prefix
   */
  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(this.keyPrefix + '*');
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger?.info('Redis cache cleared', { entriesRemoved: keys.length });
      }
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Redis cache clear error', error as Error);
      throw error;
    }
  }

  /**
   * Check if key exists in Redis cache
   */
  async has(key: string): Promise<boolean> {
    try {
      const fullKey = this.keyPrefix + key;
      const exists = await this.redis.exists(fullKey);
      return exists === 1;
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Redis cache exists error', error as Error, { key });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    errors: number;
    hitRate: number;
    redisInfo?: any;
  }> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    let redisInfo;
    try {
      redisInfo = await this.redis.info('memory');
    } catch (error) {
      this.logger?.error('Redis info error', error as Error);
    }
    
    return {
      ...this.stats,
      hitRate,
      redisInfo
    };
  }
}

/**
 * Supabase Cache Implementation
 * Database-backed cache with memory layer
 */
export class SupabaseApiGatewayCache implements ApiGatewayCache {
  private supabase: any;
  private memoryCache: MemoryApiGatewayCache;
  private tableName: string;
  private logger?: ApiGatewayLogger;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    memoryHits: 0,
    dbHits: 0
  };

  constructor(
    supabaseClient: any,
    tableName: string = 'api_cache',
    memoryMaxSize: number = 500,
    logger?: ApiGatewayLogger
  ) {
    this.supabase = supabaseClient;
    this.tableName = tableName;
    this.memoryCache = new MemoryApiGatewayCache(memoryMaxSize, 300000, logger);
    this.logger = logger;
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanupExpired(), 300000);
  }

  /**
   * Get value from cache (memory first, then database)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try memory cache first
      const memoryValue = await this.memoryCache.get<T>(key);
      
      if (memoryValue !== null) {
        this.stats.hits++;
        this.stats.memoryHits++;
        return memoryValue;
      }
      
      // Try database cache
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('value, expires_at')
        .eq('key', key)
        .single();
      
      if (error || !data) {
        this.stats.misses++;
        return null;
      }
      
      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        // Delete expired entry
        await this.delete(key);
        this.stats.misses++;
        return null;
      }
      
      const value = JSON.parse(data.value) as T;
      
      // Store in memory cache for faster access
      const ttl = new Date(data.expires_at).getTime() - Date.now();
      if (ttl > 0) {
        await this.memoryCache.set(key, value, ttl);
      }
      
      this.stats.hits++;
      this.stats.dbHits++;
      return value;
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Supabase cache get error', error as Error, { key });
      return null;
    }
  }

  /**
   * Set value in cache (both memory and database)
   */
  async set<T>(key: string, value: T, ttl: number = 300000): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttl);
      const serializedValue = JSON.stringify(value);
      
      // Store in memory cache
      await this.memoryCache.set(key, value, ttl);
      
      // Store in database
      const { error } = await this.supabase
        .from(this.tableName)
        .upsert({
          key,
          value: serializedValue,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      this.stats.sets++;
      this.logger?.debug('Supabase cache set', { key, ttl });
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Supabase cache set error', error as Error, { key });
      throw error;
    }
  }

  /**
   * Delete value from cache (both memory and database)
   */
  async delete(key: string): Promise<boolean> {
    try {
      // Delete from memory cache
      await this.memoryCache.delete(key);
      
      // Delete from database
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('key', key);
      
      if (error) {
        throw error;
      }
      
      this.stats.deletes++;
      this.logger?.debug('Supabase cache delete', { key });
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Supabase cache delete error', error as Error, { key });
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      // Clear memory cache
      await this.memoryCache.clear();
      
      // Clear database cache
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .neq('key', ''); // Delete all entries
      
      if (error) {
        throw error;
      }
      
      this.logger?.info('Supabase cache cleared');
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Supabase cache clear error', error as Error);
      throw error;
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    try {
      // Check memory cache first
      const memoryHas = await this.memoryCache.has(key);
      
      if (memoryHas) {
        return true;
      }
      
      // Check database cache
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('expires_at')
        .eq('key', key)
        .single();
      
      if (error || !data) {
        return false;
      }
      
      // Check if expired
      return new Date(data.expires_at) >= new Date();
    } catch (error) {
      this.stats.errors++;
      this.logger?.error('Supabase cache exists error', error as Error, { key });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    errors: number;
    memoryHits: number;
    dbHits: number;
    hitRate: number;
    memoryStats: any;
  }> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    const memoryStats = await this.memoryCache.getStats();
    
    return {
      ...this.stats,
      hitRate,
      memoryStats
    };
  }

  /**
   * Cleanup expired entries from database
   */
  private async cleanupExpired(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .lt('expires_at', new Date().toISOString());
      
      if (error) {
        throw error;
      }
      
      this.logger?.debug('Supabase cache cleanup completed');
    } catch (error) {
      this.logger?.error('Supabase cache cleanup error', error as Error);
    }
  }
}

/**
 * Cache Factory
 * Factory for creating cache instances
 */
export class ApiGatewayCacheFactory {
  /**
   * Create memory cache
   */
  static createMemoryCache(
    maxSize: number = 1000,
    defaultTtl: number = 300000,
    logger?: ApiGatewayLogger
  ): MemoryApiGatewayCache {
    return new MemoryApiGatewayCache(maxSize, defaultTtl, logger);
  }

  /**
   * Create Redis cache
   */
  static createRedisCache(
    redisClient: any,
    defaultTtl: number = 300,
    keyPrefix: string = 'neonpro:api:',
    logger?: ApiGatewayLogger
  ): RedisApiGatewayCache {
    return new RedisApiGatewayCache(redisClient, defaultTtl, keyPrefix, logger);
  }

  /**
   * Create Supabase cache
   */
  static createSupabaseCache(
    supabaseClient: any,
    tableName: string = 'api_cache',
    memoryMaxSize: number = 500,
    logger?: ApiGatewayLogger
  ): SupabaseApiGatewayCache {
    return new SupabaseApiGatewayCache(supabaseClient, tableName, memoryMaxSize, logger);
  }

  /**
   * Create cache based on configuration
   */
  static createCache(
    type: 'memory' | 'redis' | 'supabase',
    config: any,
    logger?: ApiGatewayLogger
  ): ApiGatewayCache {
    switch (type) {
      case 'memory':
        return ApiGatewayCacheFactory.createMemoryCache(
          config.maxSize,
          config.defaultTtl,
          logger
        );
      
      case 'redis':
        return ApiGatewayCacheFactory.createRedisCache(
          config.client,
          config.defaultTtl,
          config.keyPrefix,
          logger
        );
      
      case 'supabase':
        return ApiGatewayCacheFactory.createSupabaseCache(
          config.client,
          config.tableName,
          config.memoryMaxSize,
          logger
        );
      
      default:
        throw new Error(`Unsupported cache type: ${type}`);
    }
  }
}

/**
 * Cache Middleware
 * Middleware for caching API responses
 */
export class CacheMiddleware {
  static create(config: {
    cache: ApiGatewayCache;
    defaultTtl: number;
    cacheableStatusCodes: number[];
    cacheableMethods: string[];
    keyGenerator?: (context: any) => string;
    shouldCache?: (context: any) => boolean;
  }): any {
    return {
      name: 'cache',
      order: 10,
      enabled: true,
      config,
      handler: async (context: any, next: () => Promise<void>) => {
        const method = context.method.toUpperCase();
        
        // Only cache GET requests by default
        if (!config.cacheableMethods.includes(method)) {
          await next();
          return;
        }
        
        // Generate cache key
        const cacheKey = config.keyGenerator 
          ? config.keyGenerator(context)
          : CacheMiddleware.generateDefaultKey(context);
        
        // Try to get from cache
        const cachedResponse = await config.cache.get(cacheKey);
        
        if (cachedResponse) {
          context.response = cachedResponse;
          context.headers['X-Cache'] = 'HIT';
          return;
        }
        
        // Execute request
        await next();
        
        // Cache response if conditions are met
        if (CacheMiddleware.shouldCacheResponse(context, config)) {
          await config.cache.set(cacheKey, context.response, config.defaultTtl);
          context.headers['X-Cache'] = 'MISS';
        } else {
          context.headers['X-Cache'] = 'SKIP';
        }
      }
    };
  }

  /**
   * Generate default cache key
   */
  private static generateDefaultKey(context: any): string {
    const parts = [
      context.method,
      context.path,
      context.clientId || 'anonymous'
    ];
    
    // Include query parameters in key
    if (context.query && Object.keys(context.query).length > 0) {
      const sortedQuery = Object.keys(context.query)
        .sort()
        .map(key => `${key}=${context.query[key]}`)
        .join('&');
      parts.push(sortedQuery);
    }
    
    return parts.join(':');
  }

  /**
   * Check if response should be cached
   */
  private static shouldCacheResponse(context: any, config: any): boolean {
    // Custom cache condition
    if (config.shouldCache && !config.shouldCache(context)) {
      return false;
    }
    
    // Check status code
    const statusCode = context.headers['status-code'] || 200;
    if (!config.cacheableStatusCodes.includes(statusCode)) {
      return false;
    }
    
    // Don't cache if response has cache-control: no-cache
    const cacheControl = context.headers['cache-control'];
    if (cacheControl && cacheControl.includes('no-cache')) {
      return false;
    }
    
    return true;
  }
}
