/**
 * Redis Cache Backend Implementation
 *
 * Provides Redis integration for the healthcare cache management system with:
 * - Secure Redis connection with TLS and authentication
 * - Healthcare data compliance and LGPD requirements
 * - Performance optimization with connection pooling
 * - Automatic failover and retry logic
 * - Monitoring and observability
 *
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, ISO 27001
 */

import { Redis } from "ioredis";
import { createHash } from "crypto";
// import { z } from "zod";
import {
  CacheBackend,
  CacheEntry,
  CacheStatistics,
  CacheConfig,
  CacheDataSensitivity,
  CacheTier,
} from "./cache-management";
import { logHealthcareError, cacheLogger } from '../logging/healthcare-logger';

/**
 * Redis connection configuration with security options
 */
export interface RedisConfig {
  url: string;
  password?: string;
  username?: string;
  tls?: boolean;
  database?: number;
  keyPrefix?: string;
  connectTimeout?: number;
  commandTimeout?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  keepAlive?: number;
  family?: number;
  connectionName?: string;
}

/**
 * Redis cache backend with healthcare compliance
 */
export class RedisCacheBackend implements CacheBackend {
  private redis: Redis;
  private config: CacheConfig;
  private redisConfig: RedisConfig;
  private stats: CacheStatistics;
  private isConnected = false;
  private connectionRetries = 0;
  private maxRetries = 3;
  private healthCheckTimer?: NodeJS.Timeout;
  private securityKey: string;

  constructor(config: CacheConfig, redisConfig: RedisConfig) {
    this.config = config;
    this.redisConfig = this.validateRedisConfig(redisConfig);
    this.securityKey =
      process.env.CACHE_SECURITY_KEY || "healthcare_cache_security_key";
    this.stats = this.initializeStats();

    // Initialize Redis connection
    this.initializeRedis();
    this.initializeHealthCheck();
  }

  /**
   * Get value from Redis cache
   */
  async get(key: string): Promise<CacheEntry | null> {
    const _startTime = Date.now();
    void _startTime;

    try {
      if (!this.isConnected || !this.redis) {
        throw new Error("Redis not connected");
      }

      // Generate secure cache key
      const secureKey = this.generateSecureKey(key);

      // Get value from Redis with timeout
      const result = await this.safeRedisOperation(() =>
        this.redis.get(secureKey),
      );

      if (!result) {
        this.stats.missRate = this.updateRate(this.stats.missRate, false);
        return null;
      }

      // Parse and validate cache entry with safe JSON parsing
      const entry = this.safeJSONParse(result);
      if (!entry) {
        cacheLogger.warn(`Invalid JSON or failed schema validation for key`, {
          component: 'redis-cache',
          action: 'validation_error',
          secureKey,
          operation: 'get'
        });
        await this.delete(key);
        this.stats.missRate = this.updateRate(this.stats.missRate, false);
        return null;
      }

      // Validate entry structure
      if (!this.validateCacheEntry(entry)) {
        cacheLogger.warn(`Invalid cache entry structure for key`, {
          component: 'redis-cache',
          action: 'structure_error',
          secureKey,
          operation: 'get'
        });
        await this.delete(key);
        this.stats.missRate = this.updateRate(this.stats.missRate, false);
        return null;
      }

      // Check expiration
      if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
        await this.delete(key);
        this.stats.missRate = this.updateRate(this.stats.missRate, false);
        return null;
      }

      // Update access information
      entry.lastAccessedAt = new Date();
      entry.accessCount++;

      // Update the entry in Redis
      await this.safeRedisOperation(() =>
        this.redis.setex(
          secureKey,
          entry.ttl || this.config.defaultTTL,
          JSON.stringify(entry),
        ),
      );

      // Update statistics
      this.stats.hitRate = this.updateRate(this.stats.hitRate, true);
      this.stats.totalEntries = await this.getRedisSize();

      return entry;
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'get',
        component: 'redis-cache',
        secureKey,
        operation: 'cache_get'
      });
      this.stats.missRate = this.updateRate(this.stats.missRate, false);
      throw error;
    }
  }

  /**
   * Set value in Redis cache
   */
  async set(key: string, entry: CacheEntry): Promise<void> {
    try {
      if (!this.isConnected || !this.redis) {
        throw new Error("Redis not connected");
      }

      // Validate and prepare entry
      const validatedEntry = this.prepareCacheEntry(entry, key);

      // Generate secure cache key
      const secureKey = this.generateSecureKey(key);

      // Set in Redis with TTL
      await this.safeRedisOperation(() =>
        this.redis.setex(
          secureKey,
          validatedEntry.ttl || this.config.defaultTTL,
          JSON.stringify(validatedEntry),
        ),
      );

      // Update statistics
      this.stats.totalEntries = await this.getRedisSize();
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'set',
        component: 'redis-cache',
        key,
        operation: 'cache_set'
      });
      throw error;
    }
  }

  /**
   * Delete value from Redis cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      const secureKey = this.generateSecureKey(key);
      const result = await this.safeRedisOperation(() =>
        this.redis.del(secureKey),
      );

      this.stats.totalEntries = await this.getRedisSize();
      return result > 0;
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'delete',
        component: 'redis-cache',
        key,
        operation: 'cache_delete'
      });
      return false;
    }
  }

  /**
   * Check if key exists in Redis cache
   */
  async has(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      const secureKey = this.generateSecureKey(key);
      const exists = await this.safeRedisOperation(() =>
        this.redis.exists(secureKey),
      );

      if (!exists) {
        return false;
      }

      // Check if entry is valid and not expired
      const entry = await this.get(key);
      return entry !== null;
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'has',
        component: 'redis-cache',
        key,
        operation: 'cache_has'
      });
      return false;
    }
  }

  /**
   * Clear all cache entries from Redis
   */
  async clear(): Promise<void> {
    try {
      if (!this.isConnected || !this.redis) {
        return;
      }

      // Clear only keys with our prefix
      const prefix = this.redisConfig.keyPrefix || "healthcare_cache:";
      const keys = await this.safeRedisOperation(() =>
        this.redis.keys(`${prefix}*`),
      );

      if (keys.length > 0) {
        // Delete in batches to avoid blocking
        const batchSize = 100;
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize);
          await this.safeRedisOperation(() => this.redis.del(...batch));
        }
      }

      // Reset statistics
      this.stats = this.initializeStats();
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'clear',
        component: 'redis-cache',
        operation: 'cache_clear'
      });
      throw error;
    }
  }

  /**
   * Get Redis cache statistics
   */
  async getStats(): Promise<CacheStatistics> {
    try {
      if (this.isConnected && this.redis) {
        // Get Redis info
        const redisInfo = await this.safeRedisOperation(() =>
          this.redis.info("memory"),
        );
        const memoryMatch = redisInfo.match(/used_memory_human:([^\r\n]+)/);
        const keyCount = await this.getRedisSize();

        this.stats.memoryUsage = memoryMatch
          ? this.parseMemorySize(memoryMatch[1])
          : 0;
        this.stats.totalEntries = keyCount;
        this.stats.tierDistribution[CacheTier.REDIS] = keyCount;

        // Get performance metrics
        const performanceInfo = await this.safeRedisOperation(() =>
          this.redis.info("stats"),
        );
        const _totalCommands = performanceInfo.match(
          /total_commands_processed:([^\r\n]+)/,
        );
        const keyspaceHits = performanceInfo.match(/keyspace_hits:([^\r\n]+)/);
        const keyspaceMisses = performanceInfo.match(
          /keyspace_misses:([^\r\n]+)/,
        );

        if (keyspaceHits && keyspaceMisses) {
          const hits = parseInt(keyspaceHits[1]);
          const misses = parseInt(keyspaceMisses[1]);
          this.stats.hitRate = hits + misses > 0 ? hits / (hits + misses) : 0;
        }
      }

      return { ...this.stats };
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'getStats',
        component: 'redis-cache',
        operation: 'cache_stats'
      });
      return this.stats;
    }
  }

  /**
   * Get keys matching pattern
   */
  async getKeys(pattern?: string): Promise<string[]> {
    try {
      if (!this.isConnected || !this.redis) {
        return [];
      }

      const searchPattern = pattern
        ? `${this.redisConfig.keyPrefix || ""}${pattern}`
        : "*";
      const keys = await this.safeRedisOperation(() =>
        this.redis.keys(searchPattern),
      );

      // Remove prefix from returned keys
      const prefix = this.redisConfig.keyPrefix || "";
      return keys.map((key) =>
        key.startsWith(prefix) ? key.substring(prefix.length) : key,
      );
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'getKeys',
        component: 'redis-cache',
        pattern,
        operation: 'cache_keys'
      });
      return [];
    }
  }

  /**
   * Get entries by sensitivity level
   */
  async getEntriesBySensitivity(
    sensitivity: CacheDataSensitivity,
  ): Promise<CacheEntry[]> {
    try {
      if (!this.isConnected || !this.redis) {
        return [];
      }

      const entries: CacheEntry[] = [];
      const keys = await this.getKeys();

      for (const key of keys) {
        const entry = await this.get(key);
        if (entry && entry.sensitivity === sensitivity) {
          entries.push(entry);
        }
      }

      return entries;
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'getEntriesBySensitivity',
        component: 'redis-cache',
        sensitivity,
        operation: 'cache_sensitivity'
      });
      return [];
    }
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    try {
      if (!this.isConnected || !this.redis) {
        return 0;
      }

      // Redis automatically expires keys with TTL
      // This is a manual cleanup for any entries that might have expiration issues
      let cleanedCount = 0;
      const keys = await this.getKeys();

      for (const key of keys) {
        const entry = await this.get(key);
        if (!entry) {
          cleanedCount++;
        }
      }

      this.stats.totalEntries = await this.getRedisSize();
      return cleanedCount;
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'cleanup',
        component: 'redis-cache',
        operation: 'cache_cleanup'
      });
      return 0;
    }
  }

  /**
   * Initialize Redis connection with security
   */
  private initializeRedis(): void {
    try {
      const redisOptions = {
        connectTimeout: this.redisConfig.connectTimeout || 5000,
        commandTimeout: this.redisConfig.commandTimeout || 5000,
        retryDelayOnFailover: this.redisConfig.retryDelayOnFailover || 100,
        maxRetriesPerRequest: this.redisConfig.maxRetriesPerRequest || 1,
        lazyConnect: true,
        enableReadyCheck: this.redisConfig.enableReadyCheck ?? true,
        keepAlive: this.redisConfig.keepAlive ?? 0,
        family: this.redisConfig.family || 0,
        connectionName:
          this.redisConfig.connectionName || "healthcare-cache-backend",

        // Security options
        password: this.redisConfig.password,
        username: this.redisConfig.username,
        tls: this.redisConfig.tls ? {} : undefined,
        db: this.redisConfig.database || 0,
      };

      this.redis = new Redis(this.redisConfig.url, redisOptions);

      // Setup event handlers
      this.redis.on("connect", () => {
        this.isConnected = true;
        this.connectionRetries = 0;
        cacheLogger.info("Connected to Redis securely", {
          component: 'redis-cache',
          action: 'connect',
          event: 'connected'
        });
      });

      this.redis.on("error", (error) => {
        logHealthcareError('redis-cache', error, {
          method: 'initializeRedis',
          component: 'redis-cache',
          event: 'connection_error'
        });
        this.isConnected = false;
        this.handleConnectionError();
      });

      this.redis.on("close", () => {
        this.isConnected = false;
        cacheLogger.warn("Redis connection closed", {
          component: 'redis-cache',
          action: 'connection',
          event: 'closed'
        });
      });

      this.redis.on("ready", () => {
        cacheLogger.info("Redis connection ready", {
          component: 'redis-cache',
          action: 'connection',
          event: 'ready'
        });
      });

      // Connect to Redis
      this.redis.connect().catch((error) => {
        logHealthcareError('redis-cache', error, {
          method: 'initializeRedis',
          component: 'redis-cache',
          event: 'connection_failed'
        });
        this.isConnected = false;
      });
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'initializeRedis',
        component: 'redis-cache',
        event: 'initialization_error'
      });
      this.isConnected = false;
    }
  }

  /**
   * Handle Redis connection errors with retry logic
   */
  private handleConnectionError(): void {
    if (this.connectionRetries < this.maxRetries) {
      this.connectionRetries++;
      const delay = Math.pow(2, this.connectionRetries) * 1000; // Exponential backoff

      setTimeout(() => {
        cacheLogger.info(`Retrying connection`, {
          component: 'redis-cache',
          action: 'retry',
          attempt: this.connectionRetries,
          maxRetries: this.maxRetries,
          event: 'connection_retry'
        });
        this.redis.connect().catch((error) => {
          logHealthcareError('redis-cache', error, {
            method: 'handleConnectionError',
            component: 'redis-cache',
            attempt: this.connectionRetries,
            event: 'retry_failed'
          });
        });
      }, delay);
    } else {
      cacheLogger.error("Max connection retries reached", {
        component: 'redis-cache',
        action: 'connection',
        event: 'max_retries_reached',
        maxRetries: this.maxRetries
      });
    }
  }

  /**
   * Initialize health check timer
   */
  private initializeHealthCheck(): void {
    this.healthCheckTimer = setInterval(
      () => this.healthCheck(),
      60000, // Check every minute
    );
  }

  /**
   * Health check for Redis connection
   */
  private async healthCheck(): Promise<void> {
    try {
      if (this.isConnected && this.redis) {
        await this.safeRedisOperation(() => this.redis.ping());
      }
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'healthCheck',
        component: 'redis-cache',
        event: 'health_check_failed'
      });
      this.isConnected = false;
    }
  }

  /**
   * Safe Redis operation wrapper with timeout
   */
  private async safeRedisOperation<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.isConnected || !this.redis) {
      throw new Error("Redis not connected");
    }

    try {
      return await Promise.race([
        operation(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis operation timeout")), 5000),
        ),
      ]);
    } catch (error) {
      logHealthcareError('redis-cache', error, {
        method: 'safeRedisOperation',
        component: 'redis-cache',
        event: 'operation_failed'
      });
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Generate secure cache key with hashing
   */
  private generateSecureKey(key: string): string {
    const prefix = this.redisConfig.keyPrefix || "healthcare_cache:";
    const timestamp = Date.now();
    const hash = createHash("sha256")
      .update(key + this.securityKey + timestamp)
      .digest("hex")
      .substring(0, 16);

    return `${prefix}${hash}:${timestamp}`;
  }

  /**
   * Validate and prepare cache entry for storage
   */
  private prepareCacheEntry(entry: CacheEntry, key: string): CacheEntry {
    const validatedEntry = { ...entry };

    // Ensure required fields
    validatedEntry.key = key;
    validatedEntry.createdAt = validatedEntry.createdAt || new Date();
    validatedEntry.lastAccessedAt = validatedEntry.lastAccessedAt || new Date();
    validatedEntry.accessCount = validatedEntry.accessCount || 0;

    // Set expiration if TTL provided
    if (validatedEntry.ttl) {
      validatedEntry.expiresAt = new Date(
        Date.now() + validatedEntry.ttl * 1000,
      );
    } else {
      validatedEntry.ttl = this.config.defaultTTL;
      validatedEntry.expiresAt = new Date(
        Date.now() + this.config.defaultTTL * 1000,
      );
    }

    // Ensure healthcare compliance
    validatedEntry.lgpdCompliant = validatedEntry.lgpdCompliant ?? true;
    validatedEntry.tier = CacheTier.REDIS;

    return validatedEntry;
  }

  /**
   * Safe JSON parsing with schema validation to prevent prototype pollution
   */
  private safeJSONParse(jsonString: string): CacheEntry | null {
    try {
      // First, basic JSON parsing with reviver to prevent prototype pollution
      const parsed = JSON.parse(jsonString, (key, value) => {
        // Prevent prototype pollution
        if (
          key === "__proto__" ||
          key === "constructor" ||
          key === "prototype"
        ) {
          return undefined;
        }
        return value;
      });

      // Validate against Zod schema
      const validationResult = this.validateWithSchema(parsed);
      if (!validationResult.success) {
        cacheLogger.warn("Schema validation failed", {
          component: 'redis-cache',
          action: 'validation',
          error: validationResult.error,
          operation: 'safeJSONParse'
        });
        return null;
      }

      // Convert date strings to Date objects
      return this.normalizeDates(validationResult.data);
    } catch (error) {
      cacheLogger.warn("JSON parsing failed", {
        component: 'redis-cache',
        action: 'parsing',
        error,
        operation: 'safeJSONParse'
      });
      return null;
    }
  }

  /**
   * Validate parsed data against Zod schema
   */
  private validateWithSchema(data: unknown): {
    success: boolean;
    data?: CacheEntry;
    error?: string;
  } {
    try {
      // Import schema dynamically to avoid circular dependencies
      const { CacheEntrySchema } = require("./cache-management");

      const result = CacheEntrySchema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return {
          success: false,
          error: result.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        };
      }
    } catch {
      return { success: false, error: "Schema validation unavailable" };
    }
  }

  /**
   * Normalize date strings to Date objects
   */
  private normalizeDates(data: unknown): CacheEntry {
    const normalized = { ...data };

    if (typeof normalized.createdAt === "string") {
      normalized.createdAt = new Date(normalized.createdAt);
    }
    if (typeof normalized.lastAccessedAt === "string") {
      normalized.lastAccessedAt = new Date(normalized.lastAccessedAt);
    }
    if (typeof normalized.expiresAt === "string") {
      normalized.expiresAt = new Date(normalized.expiresAt);
    }

    return normalized;
  }

  /**
   * Validate cache entry structure (legacy fallback)
   */
  private validateCacheEntry(entry: unknown): boolean {
    return !!(
      entry &&
      typeof entry === "object" &&
      entry.key &&
      typeof entry.createdAt === "string" &&
      typeof entry.lastAccessedAt === "string" &&
      typeof entry.accessCount === "number" &&
      entry.sensitivity
    );
  }

  /**
   * Get Redis database size
   */
  private async getRedisSize(): Promise<number> {
    try {
      if (!this.isConnected || !this.redis) {
        return 0;
      }
      return await this.safeRedisOperation(() => this.redis.dbsize());
    } catch {
      return 0;
    }
  }

  /**
   * Parse memory size from Redis info
   */
  private parseMemorySize(sizeStr: string): number {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);

    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      return value * (units[unit as keyof typeof units] || 1);
    }

    return 0;
  }

  /**
   * Update hit/miss rate with exponential moving average
   */
  private updateRate(currentRate: number, hit: boolean): number {
    const weight = 0.1;
    return currentRate * (1 - weight) + (hit ? 1 : 0) * weight;
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): CacheStatistics {
    return {
      totalEntries: 0,
      memoryUsage: 0,
      hitRate: 0,
      missRate: 0,
      averageLatency: 0,
      operationsPerSecond: 0,
      sensitiveDataEntries: 0,
      lgpdCompliantEntries: 0,
      auditedOperations: 0,
      tierDistribution: {
        [CacheTier.MEMORY]: 0,
        [CacheTier.REDIS]: 0,
        [CacheTier.DATABASE]: 0,
        [CacheTier.CDN]: 0,
      },
      lastResetTime: new Date(),
      uptime: 0,
    };
  }

  /**
   * Validate Redis configuration
   */
  private validateRedisConfig(config: RedisConfig): RedisConfig {
    if (!config.url) {
      throw new Error("Redis URL is required");
    }

    // Validate URL format
    try {
      new URL(config.url);
    } catch {
      throw new Error("Invalid Redis URL format");
    }

    return {
      ...config,
      connectTimeout: config.connectTimeout || 5000,
      commandTimeout: config.commandTimeout || 5000,
      keyPrefix: config.keyPrefix || "healthcare_cache:",
      database: config.database || 0,
      family: config.family || 0,
      connectionName: config.connectionName || "healthcare-cache-backend",
    };
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    if (this.redis) {
      await this.redis.quit();
    }
  }
}

/**
 * Factory function to create Redis cache backend with healthcare configuration
 */
export function createRedisCacheBackend(
  config: CacheConfig,
): RedisCacheBackend {
  const redisConfig: RedisConfig = {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    tls: process.env.REDIS_TLS === "true",
    database: parseInt(process.env.REDIS_DATABASE || "0"),
    keyPrefix: process.env.REDIS_KEY_PREFIX || "healthcare_cache:",
    connectTimeout: 5000,
    commandTimeout: 5000,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    keepAlive: 0,
    family: 0,
    connectionName: "healthcare-cache-backend",
  };

  return new RedisCacheBackend(config, redisConfig);
}

export default RedisCacheBackend;
