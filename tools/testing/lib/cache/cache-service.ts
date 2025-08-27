/**
 * Cache Service - Mock implementation for testing
 * Provides Redis-like caching functionality for tests
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  serialize?: boolean; // Whether to JSON serialize values
}

export interface CacheEntry<T = any> {
  value: T;
  expires: number;
  metadata?: Record<string, unknown>;
}

class CacheService {
  private readonly cache: Map<string, CacheEntry> = new Map();
  private defaultTtl: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Set a value in cache
   */
  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const ttl = options.ttl ?? this.defaultTtl;
    const expires = ttl > 0 ? Date.now() + ttl : Number.MAX_SAFE_INTEGER;

    const serializedValue = options.serialize !== false
      ? JSON.parse(JSON.stringify(value)) // Deep clone
      : value;

    this.cache.set(key, {
      value: serializedValue,
      expires,
      metadata: {
        createdAt: Date.now(),
        accessed: 0,
      },
    });
  }

  /**
   * Get a value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return;
    }

    // Update access count
    if (entry.metadata) {
      entry.metadata.accessed += 1;
      entry.metadata.lastAccessed = Date.now();
    }

    return entry.value as T;
  } /**
   * Check if key exists in cache
   */

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get multiple values at once
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    const results: (T | null)[] = [];

    for (const key of keys) {
      results.push(await this.get<T>(key));
    }

    return results;
  } /**
   * Set multiple values at once
   */

  async mset<T = any>(
    entries: { key: string; value: T; options?: CacheOptions; }[],
  ): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.options);
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount = 1): Promise<number> {
    const current = await this.get<number>(key);
    const newValue = (current || 0) + amount;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, amount = 1): Promise<number> {
    return this.increment(key, -amount);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalAccesses: number;
    memoryUsage: number;
  } {
    let totalAccesses = 0;
    let memoryUsage = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata?.accessed) {
        totalAccesses += entry.metadata.accessed;
      }

      // Rough memory calculation
      memoryUsage += key.length * 2; // String chars are 2 bytes
      memoryUsage += JSON.stringify(entry.value).length * 2;
    }

    return {
      size: this.cache.size,
      hitRate: totalAccesses > 0
        ? totalAccesses / (totalAccesses + this.cache.size)
        : 0,
      totalAccesses,
      memoryUsage,
    };
  } /**
   * Clean up expired entries
   */

  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get all keys matching a pattern
   */
  getKeys(pattern?: string): string[] {
    const keys = [...this.cache.keys()];

    if (!pattern) {
      return keys;
    }

    // Simple pattern matching with * wildcard
    const regex = new RegExp(
      pattern.replaceAll("\\*", ".*").replaceAll("\\?", "."),
      "i",
    );

    return keys.filter((key) => regex.test(key));
  }

  /**
   * Set default TTL
   */
  setDefaultTtl(ttl: number): void {
    this.defaultTtl = ttl;
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key);

    if (!entry) {
      return -2; // Key doesn't exist
    }

    if (entry.expires === Number.MAX_SAFE_INTEGER) {
      return -1; // Key has no expiration
    }

    const remaining = entry.expires - Date.now();
    return remaining > 0 ? remaining : -2;
  }
}

export const cacheService = new CacheService();
export default cacheService;
