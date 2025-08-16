import { Redis } from 'ioredis';

// Cache configuration
const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Redis client (optional - falls back to in-memory cache)
let redis: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
  }
} catch (error) {
  console.warn('Redis not available, using in-memory cache:', error);
}

// In-memory cache fallback
const memoryCache = new Map<string, { value: any; expires: number }>();

// Clean up expired entries from memory cache
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expires < now) {
      memoryCache.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export class CacheManager {
  private static instance: CacheManager;

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (redis) {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        const entry = memoryCache.get(key);
        if (entry && entry.expires > Date.now()) {
          return entry.value;
        }
        if (entry) {
          memoryCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const ttl = options.ttl || CACHE_TTL.MEDIUM;

    try {
      if (redis) {
        await redis.setex(key, ttl, JSON.stringify(value));

        // Store tags for invalidation
        if (options.tags) {
          for (const tag of options.tags) {
            await redis.sadd(`tag:${tag}`, key);
            await redis.expire(`tag:${tag}`, ttl);
          }
        }
      } else {
        const expires = Date.now() + ttl * 1000;
        memoryCache.set(key, { value, expires });
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (redis) {
        await redis.del(key);
      } else {
        memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      if (redis) {
        const keys = await redis.smembers(`tag:${tag}`);
        if (keys.length > 0) {
          await redis.del(...keys);
          await redis.del(`tag:${tag}`);
        }
      } else {
        // For memory cache, we'd need to store tag mappings
        // This is a simplified implementation
        console.warn(
          'Tag-based invalidation not fully supported in memory cache',
        );
      }
    } catch (error) {
      console.error('Cache invalidate by tag error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (redis) {
        await redis.flushdb();
      } else {
        memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async getStats(): Promise<{ keys: number; memory?: string }> {
    try {
      if (redis) {
        const info = await redis.info('memory');
        const keyspace = await redis.info('keyspace');
        const memoryMatch = info.match(/used_memory_human:(\S+)/);
        const keysMatch = keyspace.match(/keys=(\d+)/);

        return {
          keys: keysMatch ? parseInt(keysMatch[1]) : 0,
          memory: memoryMatch ? memoryMatch[1] : 'unknown',
        };
      } else {
        return {
          keys: memoryCache.size,
          memory: `${Math.round(JSON.stringify([...memoryCache.entries()]).length / 1024)}KB`,
        };
      }
    } catch (error) {
      console.error('Cache stats error:', error);
      return { keys: 0 };
    }
  }
}

// Utility functions
export const cache = CacheManager.getInstance();

export function createCacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  return async (): Promise<T> => {
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await cache.set(key, result, options);
    return result;
  };
}

// Performance monitoring cache decorator
export function cachePerformance<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  options: CacheOptions = {},
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const start = Date.now();

    const cached = await cache.get(key);
    if (cached !== null) {
      console.log(`Cache hit for ${key} (${Date.now() - start}ms)`);
      return cached;
    }

    const result = await fn(...args);
    const duration = Date.now() - start;

    await cache.set(key, result, options);
    console.log(`Cache miss for ${key} (${duration}ms)`);

    return result;
  }) as T;
}

// Export cache TTL constants
export { CACHE_TTL };

// Export types
export type CacheTTL = (typeof CACHE_TTL)[keyof typeof CACHE_TTL];
