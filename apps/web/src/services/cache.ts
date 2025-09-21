/**
 * Cache Service for financial data and metrics
 * Provides in-memory caching with TTL support
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private static cache = new Map<string, CacheEntry>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get data from cache
   */
  static async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with optional TTL
   */
  static async set<T = any>(
    key: string,
    data: T,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, entry);

    // Auto-cleanup expired entries
    this.scheduleCleanup();
  }

  /**
   * Invalidate cache entries matching pattern
   */
  static async invalidate(pattern: string): Promise<void> {
    if (pattern.includes('*')) {
      // Pattern matching for wildcard
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const keysToDelete: string[] = [];

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(_key => this.cache.delete(key));
    } else {
      // Exact match
      this.cache.delete(pattern);
    }
  }

  /**
   * Clear all cache entries
   */
  static async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number;
    keys: string[];
    memory: number;
  } {
    const keys = Array.from(this.cache.keys());
    const memory = JSON.stringify(Array.from(this.cache.entries())).length;

    return {
      size: this.cache.size,
      keys,
      memory,
    };
  }

  /**
   * Check if key exists in cache
   */
  static has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Schedule cleanup of expired entries
   */
  private static scheduleCleanup(): void {
    // Run cleanup every 5 minutes
    if (!this.cleanupScheduled) {
      this.cleanupScheduled = true;

      setTimeout(() => {
        this.cleanup();
        this.cleanupScheduled = false;
      }, 5 * 60 * 1000);
    }
  }

  private static cleanupScheduled = false;

  /**
   * Clean up expired cache entries
   */
  private static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(_key => this.cache.delete(key));
  }
}
