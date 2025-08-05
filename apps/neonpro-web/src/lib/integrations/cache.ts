/**
 * NeonPro - Integration Cache System
 * High-performance caching system for third-party integrations
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import crypto from "crypto";
import type { createClient } from "@supabase/supabase-js";
import type { IntegrationCache, CacheEntry, CacheConfig, CacheStats, CacheKey } from "./types";

/**
 * Memory Cache Implementation
 * Fast in-memory cache with LRU eviction
 */
export class MemoryIntegrationCache implements IntegrationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = [];
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
  };

  constructor(config: CacheConfig) {
    this.config = {
      maxSize: 1000,
      defaultTtl: 300000, // 5 minutes
      cleanupInterval: 60000, // 1 minute
      ...config,
    };

    // Start cleanup interval
    if (this.config.cleanupInterval > 0) {
      setInterval(() => this.cleanup(), this.config.cleanupInterval);
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: CacheKey): Promise<T | null> {
    const keyStr = this.serializeKey(key);
    const entry = this.cache.get(keyStr);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(keyStr);
      this.removeFromAccessOrder(keyStr);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateStats();
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(keyStr);
    this.stats.hits++;
    this.updateHitRate();

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: CacheKey, value: T, ttl?: number): Promise<void> {
    const keyStr = this.serializeKey(key);
    const expiresAt = ttl
      ? Date.now() + ttl
      : this.config.defaultTtl
        ? Date.now() + this.config.defaultTtl
        : null;

    const entry: CacheEntry = {
      key: keyStr,
      value,
      createdAt: Date.now(),
      expiresAt,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    // Check if we need to evict
    if (this.cache.size >= this.config.maxSize && !this.cache.has(keyStr)) {
      this.evictLRU();
    }

    this.cache.set(keyStr, entry);
    this.updateAccessOrder(keyStr);
    this.stats.sets++;
    this.updateStats();
  }

  /**
   * Delete value from cache
   */
  async delete(key: CacheKey): Promise<boolean> {
    const keyStr = this.serializeKey(key);
    const existed = this.cache.delete(keyStr);

    if (existed) {
      this.removeFromAccessOrder(keyStr);
      this.stats.deletes++;
      this.updateStats();
    }

    return existed;
  }

  /**
   * Check if key exists in cache
   */
  async has(key: CacheKey): Promise<boolean> {
    const keyStr = this.serializeKey(key);
    const entry = this.cache.get(keyStr);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(keyStr);
      this.removeFromAccessOrder(keyStr);
      this.stats.evictions++;
      this.updateStats();
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder = [];
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  /**
   * Get cache size
   */
  async size(): Promise<number> {
    return this.cache.size;
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern?: string): Promise<string[]> {
    const keys = Array.from(this.cache.keys());

    if (!pattern) {
      return keys;
    }

    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    return keys.filter((key) => regex.test(key));
  }

  // Private helper methods

  /**
   * Serialize cache key to string
   */
  private serializeKey(key: CacheKey): string {
    if (typeof key === "string") {
      return key;
    }

    const parts = [
      key.integrationId,
      key.operation,
      key.resource || "",
      key.params ? JSON.stringify(key.params) : "",
    ];

    return parts.join(":");
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.removeFromAccessOrder(key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) {
      return;
    }

    const lruKey = this.accessOrder[0];
    this.cache.delete(lruKey);
    this.accessOrder.shift();
    this.stats.evictions++;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt && entry.expiresAt < now) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.evictions++;
    }

    if (expiredKeys.length > 0) {
      this.updateStats();
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.updateHitRate();
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * Redis Cache Implementation
 * Distributed cache using Redis for multi-instance deployments
 */
export class RedisIntegrationCache implements IntegrationCache {
  private redis: any;
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
  };

  constructor(redisClient: any, config: CacheConfig) {
    this.redis = redisClient;
    this.config = {
      maxSize: 10000,
      defaultTtl: 300000, // 5 minutes
      keyPrefix: "neonpro:integration:",
      ...config,
    };
  }

  /**
   * Get value from Redis cache
   */
  async get<T>(key: CacheKey): Promise<T | null> {
    try {
      const keyStr = this.getRedisKey(key);
      const value = await this.redis.get(keyStr);

      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Redis cache get error:", error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Set value in Redis cache
   */
  async set<T>(key: CacheKey, value: T, ttl?: number): Promise<void> {
    try {
      const keyStr = this.getRedisKey(key);
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.config.defaultTtl;

      if (expiry) {
        await this.redis.setex(keyStr, Math.floor(expiry / 1000), serialized);
      } else {
        await this.redis.set(keyStr, serialized);
      }

      this.stats.sets++;
    } catch (error) {
      console.error("Redis cache set error:", error);
      throw error;
    }
  }

  /**
   * Delete value from Redis cache
   */
  async delete(key: CacheKey): Promise<boolean> {
    try {
      const keyStr = this.getRedisKey(key);
      const result = await this.redis.del(keyStr);

      if (result > 0) {
        this.stats.deletes++;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Redis cache delete error:", error);
      return false;
    }
  }

  /**
   * Check if key exists in Redis cache
   */
  async has(key: CacheKey): Promise<boolean> {
    try {
      const keyStr = this.getRedisKey(key);
      const result = await this.redis.exists(keyStr);
      return result === 1;
    } catch (error) {
      console.error("Redis cache has error:", error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const pattern = `${this.config.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error("Redis cache clear error:", error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const pattern = `${this.config.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);
      this.stats.size = keys.length;

      return { ...this.stats };
    } catch (error) {
      console.error("Redis cache stats error:", error);
      return { ...this.stats };
    }
  }

  /**
   * Get cache size
   */
  async size(): Promise<number> {
    try {
      const pattern = `${this.config.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);
      return keys.length;
    } catch (error) {
      console.error("Redis cache size error:", error);
      return 0;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern?: string): Promise<string[]> {
    try {
      const searchPattern = pattern
        ? `${this.config.keyPrefix}${pattern}`
        : `${this.config.keyPrefix}*`;

      const keys = await this.redis.keys(searchPattern);

      // Remove prefix from keys
      return keys.map((key: string) => key.replace(this.config.keyPrefix!, ""));
    } catch (error) {
      console.error("Redis cache keys error:", error);
      return [];
    }
  }

  // Private helper methods

  /**
   * Get Redis key with prefix
   */
  private getRedisKey(key: CacheKey): string {
    const serializedKey = typeof key === "string" ? key : this.serializeKey(key);
    return `${this.config.keyPrefix}${serializedKey}`;
  }

  /**
   * Serialize cache key to string
   */
  private serializeKey(key: CacheKey): string {
    if (typeof key === "string") {
      return key;
    }

    const parts = [
      key.integrationId,
      key.operation,
      key.resource || "",
      key.params ? crypto.createHash("md5").update(JSON.stringify(key.params)).digest("hex") : "",
    ];

    return parts.join(":");
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * Supabase Cache Implementation
 * Database-backed cache using Supabase for persistence
 */
export class SupabaseIntegrationCache implements IntegrationCache {
  private supabase: any;
  private config: CacheConfig;
  private memoryCache: MemoryIntegrationCache;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
  };

  constructor(supabaseUrl: string, supabaseKey: string, config: CacheConfig) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = {
      maxSize: 5000,
      defaultTtl: 300000, // 5 minutes
      useMemoryCache: true,
      ...config,
    };

    // Initialize memory cache for L1 caching
    if (this.config.useMemoryCache) {
      this.memoryCache = new MemoryIntegrationCache({
        maxSize: Math.min(this.config.maxSize / 10, 500),
        defaultTtl: Math.min(this.config.defaultTtl, 60000), // 1 minute max for L1
        cleanupInterval: 30000,
      });
    }

    // Start cleanup interval
    setInterval(() => this.cleanup(), 300000); // 5 minutes
  }

  /**
   * Get value from cache (L1 memory + L2 database)
   */
  async get<T>(key: CacheKey): Promise<T | null> {
    const keyStr = this.serializeKey(key);

    // Try L1 cache first
    if (this.memoryCache) {
      const memoryValue = await this.memoryCache.get<T>(key);
      if (memoryValue !== null) {
        this.stats.hits++;
        this.updateHitRate();
        return memoryValue;
      }
    }

    // Try L2 cache (database)
    try {
      const { data, error } = await this.supabase
        .from("integration_cache")
        .select("value, expires_at")
        .eq("key", keyStr)
        .single();

      if (error || !data) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await this.delete(key);
        this.stats.misses++;
        this.stats.evictions++;
        this.updateHitRate();
        return null;
      }

      const value = JSON.parse(data.value) as T;

      // Store in L1 cache for faster access
      if (this.memoryCache) {
        await this.memoryCache.set(key, value, 60000); // 1 minute in L1
      }

      this.stats.hits++;
      this.updateHitRate();
      return value;
    } catch (error) {
      console.error("Supabase cache get error:", error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Set value in cache (L1 memory + L2 database)
   */
  async set<T>(key: CacheKey, value: T, ttl?: number): Promise<void> {
    const keyStr = this.serializeKey(key);
    const expiry = ttl || this.config.defaultTtl;
    const expiresAt = expiry ? new Date(Date.now() + expiry) : null;

    try {
      // Store in L2 cache (database)
      const { error } = await this.supabase.from("integration_cache").upsert({
        key: keyStr,
        value: JSON.stringify(value),
        expires_at: expiresAt,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (error) {
        throw new Error(`Failed to set cache: ${error.message}`);
      }

      // Store in L1 cache
      if (this.memoryCache) {
        await this.memoryCache.set(key, value, Math.min(expiry || 60000, 60000));
      }

      this.stats.sets++;
    } catch (error) {
      console.error("Supabase cache set error:", error);
      throw error;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: CacheKey): Promise<boolean> {
    const keyStr = this.serializeKey(key);

    try {
      // Delete from L1 cache
      if (this.memoryCache) {
        await this.memoryCache.delete(key);
      }

      // Delete from L2 cache
      const { error } = await this.supabase.from("integration_cache").delete().eq("key", keyStr);

      if (error) {
        console.error("Supabase cache delete error:", error);
        return false;
      }

      this.stats.deletes++;
      return true;
    } catch (error) {
      console.error("Supabase cache delete error:", error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: CacheKey): Promise<boolean> {
    // Check L1 cache first
    if (this.memoryCache && (await this.memoryCache.has(key))) {
      return true;
    }

    // Check L2 cache
    const keyStr = this.serializeKey(key);

    try {
      const { data, error } = await this.supabase
        .from("integration_cache")
        .select("expires_at")
        .eq("key", keyStr)
        .single();

      if (error || !data) {
        return false;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Supabase cache has error:", error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      // Clear L1 cache
      if (this.memoryCache) {
        await this.memoryCache.clear();
      }

      // Clear L2 cache
      const { error } = await this.supabase.from("integration_cache").delete().neq("key", "");

      if (error) {
        throw new Error(`Failed to clear cache: ${error.message}`);
      }
    } catch (error) {
      console.error("Supabase cache clear error:", error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const { count, error } = await this.supabase
        .from("integration_cache")
        .select("*", { count: "exact", head: true });

      if (!error) {
        this.stats.size = count || 0;
      }

      // Merge with L1 cache stats if available
      if (this.memoryCache) {
        const memoryStats = await this.memoryCache.getStats();
        return {
          hits: this.stats.hits + memoryStats.hits,
          misses: this.stats.misses + memoryStats.misses,
          sets: this.stats.sets + memoryStats.sets,
          deletes: this.stats.deletes + memoryStats.deletes,
          evictions: this.stats.evictions + memoryStats.evictions,
          size: this.stats.size,
          hitRate: this.stats.hitRate,
        };
      }

      return { ...this.stats };
    } catch (error) {
      console.error("Supabase cache stats error:", error);
      return { ...this.stats };
    }
  }

  /**
   * Get cache size
   */
  async size(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("integration_cache")
        .select("*", { count: "exact", head: true });

      return count || 0;
    } catch (error) {
      console.error("Supabase cache size error:", error);
      return 0;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern?: string): Promise<string[]> {
    try {
      let query = this.supabase.from("integration_cache").select("key");

      if (pattern) {
        query = query.like("key", pattern.replace(/\*/g, "%"));
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get keys: ${error.message}`);
      }

      return (data || []).map((item: any) => item.key);
    } catch (error) {
      console.error("Supabase cache keys error:", error);
      return [];
    }
  }

  // Private helper methods

  /**
   * Serialize cache key to string
   */
  private serializeKey(key: CacheKey): string {
    if (typeof key === "string") {
      return key;
    }

    const parts = [
      key.integrationId,
      key.operation,
      key.resource || "",
      key.params ? crypto.createHash("md5").update(JSON.stringify(key.params)).digest("hex") : "",
    ];

    return parts.join(":");
  }

  /**
   * Cleanup expired entries
   */
  private async cleanup(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("integration_cache")
        .delete()
        .lt("expires_at", new Date().toISOString());

      if (error) {
        console.error("Cache cleanup error:", error);
      }
    } catch (error) {
      console.error("Cache cleanup error:", error);
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * Cache Factory
 * Creates appropriate cache implementation based on configuration
 */
export class CacheFactory {
  /**
   * Create cache instance based on type
   */
  static createCache(
    type: "memory" | "redis" | "supabase",
    config: CacheConfig,
    options?: any,
  ): IntegrationCache {
    switch (type) {
      case "memory":
        return new MemoryIntegrationCache(config);

      case "redis":
        if (!options?.redisClient) {
          throw new Error("Redis client is required for Redis cache");
        }
        return new RedisIntegrationCache(options.redisClient, config);

      case "supabase":
        if (!options?.supabaseUrl || !options?.supabaseKey) {
          throw new Error("Supabase URL and key are required for Supabase cache");
        }
        return new SupabaseIntegrationCache(options.supabaseUrl, options.supabaseKey, config);

      default:
        throw new Error(`Unsupported cache type: ${type}`);
    }
  }
}
