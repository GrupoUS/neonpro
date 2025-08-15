'use client';

// =====================================================================================
// CACHE MANAGER
// Advanced caching system with TTL, LRU eviction, and persistence
// =====================================================================================

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  persistent?: boolean; // Whether to persist to localStorage
  prefix?: string; // Prefix for localStorage keys
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class CacheManager<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private stats = { hits: 0, misses: 0 };
  private options: Required<CacheOptions>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      persistent: options.persistent,
      prefix: options.prefix || 'neonpro_cache',
    };

    // Load persisted cache if enabled
    if (this.options.persistent && typeof window !== 'undefined') {
      this.loadFromStorage();
    }

    // Start cleanup interval
    this.startCleanup();
  }

  // =====================================================================================
  // CORE CACHE OPERATIONS
  // =====================================================================================

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const itemTtl = ttl || this.options.ttl;

    // Check if we need to evict items (LRU)
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: itemTtl,
      accessCount: 0,
      lastAccessed: now,
    };

    this.cache.set(key, item);

    // Persist if enabled
    if (this.options.persistent) {
      this.persistItem(key, item);
    }
  }

  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();

    // Check if item has expired
    if (now - item.timestamp > item.ttl) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Check if expired
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);

    if (deleted && this.options.persistent) {
      this.removeFromStorage(key);
    }

    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };

    if (this.options.persistent) {
      this.clearStorage();
    }
  }

  // =====================================================================================
  // ADVANCED OPERATIONS
  // =====================================================================================

  // Get or set pattern
  async getOrSet(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  // Batch operations
  setMany(items: Array<{ key: string; data: T; ttl?: number }>): void {
    items.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  getMany(keys: string[]): Array<{ key: string; data: T | null }> {
    return keys.map((key) => ({ key, data: this.get(key) }));
  }

  deleteMany(keys: string[]): number {
    let deleted = 0;
    keys.forEach((key) => {
      if (this.delete(key)) deleted++;
    });
    return deleted;
  }

  // Pattern-based operations
  deleteByPattern(pattern: RegExp): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  getByPattern(pattern: RegExp): Array<{ key: string; data: T }> {
    const results: Array<{ key: string; data: T }> = [];
    for (const [key, _item] of this.cache.entries()) {
      if (pattern.test(key)) {
        const data = this.get(key); // This will handle expiration
        if (data !== null) {
          results.push({ key, data });
        }
      }
    }
    return results;
  }

  // =====================================================================================
  // CACHE MANAGEMENT
  // =====================================================================================

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.delete(key));
  }

  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  // =====================================================================================
  // PERSISTENCE
  // =====================================================================================

  private persistItem(key: string, item: CacheItem<T>): void {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `${this.options.prefix}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to persist cache item:', error);
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const prefix = `${this.options.prefix}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          const cacheKey = key.substring(prefix.length);
          const itemJson = localStorage.getItem(key);
          if (itemJson) {
            const item: CacheItem<T> = JSON.parse(itemJson);
            // Only load if not expired
            const now = Date.now();
            if (now - item.timestamp <= item.ttl) {
              this.cache.set(cacheKey, item);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private removeFromStorage(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `${this.options.prefix}_${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to remove cache item from storage:', error);
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const prefix = `${this.options.prefix}_`;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache storage:', error);
    }
  }

  // =====================================================================================
  // STATISTICS & MONITORING
  // =====================================================================================

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getSize(): number {
    return this.cache.size;
  }

  // Destroy cache and cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// =====================================================================================
// CACHE INSTANCES
// =====================================================================================

// Default cache instance
export const defaultCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  persistent: true,
  prefix: 'neonpro_default',
});

// API response cache
export const apiCache = new CacheManager({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 50,
  persistent: false,
  prefix: 'neonpro_api',
});

// User data cache
export const userCache = new CacheManager({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 20,
  persistent: true,
  prefix: 'neonpro_user',
});

// Static data cache (longer TTL)
export const staticCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 200,
  persistent: true,
  prefix: 'neonpro_static',
});

export { CacheManager };
export type { CacheOptions, CacheStats };
