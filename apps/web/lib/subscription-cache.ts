/**
 * Subscription Caching Strategies
 *
 * Advanced caching system for subscription data with intelligent cache management,
 * automatic invalidation, and performance optimization.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

import type { SubscriptionValidationResult } from './subscription-status';

// Cache configuration
export interface CacheConfig {
  defaultTTL: number; // Default time-to-live in milliseconds
  gracePeriodTTL: number; // TTL for grace period subscriptions
  errorTTL: number; // TTL for error states
  maxSize: number; // Maximum cache entries
  cleanupInterval: number; // Cache cleanup interval in milliseconds
}

export interface CacheEntry {
  data: SubscriptionValidationResult;
  expires: number;
  created: number;
  accessCount: number;
  lastAccessed: number;
  priority: number; // Higher = more important to keep
}

export interface CacheStats {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  oldestEntry: number | null;
  newestEntry: number | null;
  averageAccessCount: number;
  memoryUsage: number; // Estimated in bytes
}

export interface CacheOperation {
  type: 'get' | 'set' | 'delete' | 'cleanup';
  key?: string;
  hit?: boolean;
  duration: number;
  timestamp: number;
}

/**
 * Intelligent subscription cache with LRU eviction and automatic cleanup
 */
export class SubscriptionCache {
  private readonly cache = new Map<string, CacheEntry>();
  private hitCount = 0;
  private missCount = 0;
  private operations: CacheOperation[] = [];
  private cleanupTimer: NodeJS.Timeout | null = null;

  private readonly config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    gracePeriodTTL: 30 * 1000, // 30 seconds
    errorTTL: 30 * 1000, // 30 seconds
    maxSize: 10_000, // 10k entries
    cleanupInterval: 60 * 1000, // 1 minute
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.startCleanupTimer();
  }

  /**
   * Get cached subscription validation result
   */
  get(key: string): SubscriptionValidationResult | null {
    const startTime = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      this.recordOperation({
        type: 'get',
        key,
        hit: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });
      return null;
    }

    // Check expiration
    if (entry.expires <= Date.now()) {
      this.cache.delete(key);
      this.missCount++;
      this.recordOperation({
        type: 'get',
        key,
        hit: false,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      });
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    entry.priority = this.calculatePriority(entry);

    this.hitCount++;
    this.recordOperation({
      type: 'get',
      key,
      hit: true,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });

    return entry.data;
  }

  /**
   * Set cached subscription validation result with intelligent TTL
   */
  set(
    key: string,
    data: SubscriptionValidationResult,
    customTTL?: number
  ): void {
    const startTime = Date.now();

    // Determine TTL based on data characteristics
    let ttl = customTTL || this.config.defaultTTL;

    if (data.gracePeriod) {
      ttl = this.config.gracePeriodTTL;
    } else if (!data.hasAccess && data.status === null) {
      ttl = this.config.errorTTL;
    } else if (data.status === 'trialing' && data.expiresAt) {
      // For trials, cache until expiry or max TTL, whichever is shorter
      const timeUntilExpiry = data.expiresAt.getTime() - Date.now();
      ttl = Math.min(timeUntilExpiry, this.config.defaultTTL);
    } else if (
      data.status === 'active' &&
      data.subscription?.cancel_at_period_end
    ) {
      // Shorter TTL for cancelling subscriptions
      ttl = Math.min(ttl, 2 * 60 * 1000); // 2 minutes
    }

    // Ensure we don't exceed max size
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUseful();
    }

    const now = Date.now();
    const entry: CacheEntry = {
      data,
      expires: now + ttl,
      created: now,
      accessCount: 1,
      lastAccessed: now,
      priority: this.calculatePriority({
        data,
        expires: now + ttl,
        created: now,
        accessCount: 1,
        lastAccessed: now,
        priority: 0,
      }),
    };

    this.cache.set(key, entry);

    this.recordOperation({
      type: 'set',
      key,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Delete specific cache entry or entries matching pattern
   */
  delete(pattern: string): number {
    const startTime = Date.now();
    let deletedCount = 0;

    if (this.cache.has(pattern)) {
      // Exact match
      this.cache.delete(pattern);
      deletedCount = 1;
    } else if (pattern.includes('*')) {
      // Pattern matching
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => {
        this.cache.delete(key);
        deletedCount++;
      });
    } else {
      // Prefix matching
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.startsWith(pattern)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => {
        this.cache.delete(key);
        deletedCount++;
      });
    }

    this.recordOperation({
      type: 'delete',
      key: pattern,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });

    return deletedCount;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    const startTime = Date.now();
    const entriesCleared = this.cache.size;

    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.operations = [];

    this.recordOperation({
      type: 'cleanup',
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });

    console.log(
      `Subscription cache cleared: ${entriesCleared} entries removed`
    );
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    const entries: CacheEntry[] = [];
    this.cache.forEach((entry) => entries.push(entry));
    const validEntries = entries.filter((entry) => entry.expires > now);
    const totalHits = this.hitCount + this.missCount;
    const hitRate = totalHits > 0 ? (this.hitCount / totalHits) * 100 : 0;

    const accessCounts = validEntries.map((entry) => entry.accessCount);
    const averageAccessCount =
      accessCounts.length > 0
        ? accessCounts.reduce((sum, count) => sum + count, 0) /
          accessCounts.length
        : 0;

    // Estimate memory usage (rough calculation)
    const memoryUsage = this.cache.size * 2000; // Rough estimate: 2KB per entry

    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      oldestEntry:
        entries.length > 0 ? Math.min(...entries.map((e) => e.created)) : null,
      newestEntry:
        entries.length > 0 ? Math.max(...entries.map((e) => e.created)) : null,
      averageAccessCount: Math.round(averageAccessCount * 100) / 100,
      memoryUsage,
    };
  }

  /**
   * Get cache operations for debugging
   */
  getOperations(limit = 100): CacheOperation[] {
    return this.operations.slice(-limit);
  }

  /**
   * Optimize cache by removing expired and least useful entries
   */
  optimize(): { removed: number; kept: number; memoryFreed: number } {
    const startTime = Date.now();
    const initialSize = this.cache.size;
    const now = Date.now();

    // Remove expired entries
    let _expiredRemoved = 0;
    const entriesToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (entry.expires <= now) {
        entriesToDelete.push(key);
      }
    });

    entriesToDelete.forEach((key) => {
      this.cache.delete(key);
      _expiredRemoved++;
    });

    // If still over max size, remove least useful entries
    let _lruRemoved = 0;
    while (this.cache.size > this.config.maxSize * 0.8) {
      // Keep at 80% of max
      this.evictLeastUseful();
      _lruRemoved++;
    }

    const finalSize = this.cache.size;
    const totalRemoved = initialSize - finalSize;
    const memoryFreed = totalRemoved * 2000; // Rough estimate

    this.recordOperation({
      type: 'cleanup',
      duration: Date.now() - startTime,
      timestamp: Date.now(),
    });

    return {
      removed: totalRemoved,
      kept: finalSize,
      memoryFreed,
    };
  }

  /**
   * Calculate priority for cache entry (higher = more important to keep)
   */
  private calculatePriority(entry: CacheEntry): number {
    const now = Date.now();
    const _age = now - entry.created;
    const timeSinceAccess = now - entry.lastAccessed;
    const remainingTTL = entry.expires - now;

    // Factors that increase priority:
    // - Higher access count
    // - More recent access
    // - Active/valid subscription status
    // - Longer remaining TTL

    let priority = entry.accessCount * 10;

    // Bonus for recent access
    if (timeSinceAccess < 60_000) {
      // Less than 1 minute
      priority += 50;
    } else if (timeSinceAccess < 300_000) {
      // Less than 5 minutes
      priority += 20;
    }

    // Bonus for active subscriptions
    if (entry.data.hasAccess && entry.data.status === 'active') {
      priority += 100;
    } else if (entry.data.hasAccess) {
      priority += 50;
    }

    // Bonus for longer remaining TTL
    if (remainingTTL > 180_000) {
      // More than 3 minutes
      priority += 30;
    } else if (remainingTTL > 60_000) {
      // More than 1 minute
      priority += 10;
    }

    return priority;
  }

  /**
   * Remove least useful cache entry
   */
  private evictLeastUseful(): boolean {
    if (this.cache.size === 0) {
      return false;
    }

    let leastUsefulKey: string | null = null;
    let lowestPriority = Number.POSITIVE_INFINITY;

    this.cache.forEach((entry, key) => {
      if (entry.priority < lowestPriority) {
        lowestPriority = entry.priority;
        leastUsefulKey = key;
      }
    });

    if (leastUsefulKey) {
      this.cache.delete(leastUsefulKey);
      return true;
    }

    return false;
  }

  /**
   * Record cache operation for monitoring
   */
  private recordOperation(operation: CacheOperation): void {
    this.operations.push(operation);

    // Keep only last 1000 operations
    if (this.operations.length > 1000) {
      this.operations.splice(0, this.operations.length - 1000);
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.optimize();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop automatic cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

// Global cache instance with default configuration
export const globalSubscriptionCache = new SubscriptionCache();

// Cache management utilities
export const cacheManager = {
  /**
   * Warm up cache for specific user
   */
  async warmUp(
    userId: string,
    validationResult: SubscriptionValidationResult
  ): Promise<void> {
    const key = `subscription:${userId}`;
    globalSubscriptionCache.set(key, validationResult);
  },

  /**
   * Invalidate cache for user when subscription changes
   */
  invalidateUser(userId: string): number {
    return globalSubscriptionCache.delete(`subscription:${userId}`);
  },

  /**
   * Invalidate cache for multiple users
   */
  invalidateUsers(userIds: string[]): number {
    let totalDeleted = 0;
    for (const userId of userIds) {
      totalDeleted += this.invalidateUser(userId);
    }
    return totalDeleted;
  },

  /**
   * Invalidate all trial subscriptions (useful when trial policies change)
   */
  invalidateTrials(): number {
    return globalSubscriptionCache.delete('subscription:*trial*');
  },

  /**
   * Get cache health status
   */
  getHealth(): {
    healthy: boolean;
    stats: CacheStats;
    recommendations: string[];
  } {
    const stats = globalSubscriptionCache.getStats();
    const recommendations: string[] = [];

    let healthy = true;

    // Check hit rate
    if (stats.hitRate < 70) {
      healthy = false;
      recommendations.push(
        'Low cache hit rate - consider increasing TTL or optimizing invalidation strategy'
      );
    }

    // Check memory usage
    if (stats.memoryUsage > 50 * 1024 * 1024) {
      // 50MB
      recommendations.push(
        'High memory usage - consider reducing cache size or TTL'
      );
    }

    // Check expired entries
    const expiredPercentage = (stats.expiredEntries / stats.totalEntries) * 100;
    if (expiredPercentage > 30) {
      recommendations.push(
        'High percentage of expired entries - consider running manual cleanup'
      );
    }

    return {
      healthy,
      stats,
      recommendations,
    };
  },
};
