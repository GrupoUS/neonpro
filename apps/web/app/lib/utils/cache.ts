// Caching Utilities for Stock Alert System
// Story 11.4: Alertas e Relatórios de Estoque
// Caching layer for performance optimization

import { Redis } from '@upstash/redis';

// =====================================================
// CONFIGURATION
// =====================================================

const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DASHBOARD: 300, // 5 minutes for dashboard data
  ALERTS: 60, // 1 minute for active alerts
  REPORTS: 1800, // 30 minutes for reports
  CONFIGS: 900, // 15 minutes for configurations
} as const;

const CACHE_KEYS = {
  ALERT_CONFIGS: (clinicId: string) => `alerts:configs:${clinicId}`,
  ACTIVE_ALERTS: (clinicId: string) => `alerts:active:${clinicId}`,
  DASHBOARD_DATA: (clinicId: string, period: string) =>
    `dashboard:${clinicId}:${period}`,
  PRODUCT_STOCK: (productId: string) => `stock:product:${productId}`,
  CLINIC_PRODUCTS: (clinicId: string) => `products:clinic:${clinicId}`,
  REPORT_DATA: (reportId: string) => `report:${reportId}`,
  USER_PERMISSIONS: (userId: string, clinicId: string) =>
    `permissions:${userId}:${clinicId}`,
  NOTIFICATION_QUEUE: (clinicId: string) => `notifications:queue:${clinicId}`,
} as const;

// =====================================================
// CACHE CLIENT SETUP
// =====================================================

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (
    process.env.NODE_ENV === 'development' &&
    !process.env.UPSTASH_REDIS_REST_URL
  ) {
    // In development without Redis, use in-memory cache
    return null;
  }

  if (!redisClient && process.env.UPSTASH_REDIS_REST_URL) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redisClient;
}

// =====================================================
// IN-MEMORY FALLBACK CACHE
// =====================================================

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class InMemoryCache {
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly maxSize = 1000; // Prevent memory leaks

  set<T>(key: string, value: T, ttlSeconds: number): void {
    // Clean up expired entries if cache is getting large
    if (this.cache.size > this.maxSize) {
      this.cleanup();
    }

    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data: value, expiry });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

const inMemoryCache = new InMemoryCache();

// =====================================================
// CACHE INTERFACE
// =====================================================

export class CacheManager {
  private readonly redis: Redis | null;

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Set a value in cache with TTL
   */
  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = CACHE_TTL.MEDIUM
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);

      if (this.redis) {
        await this.redis.setex(key, ttlSeconds, serializedValue);
      } else {
        // Fallback to in-memory cache
        inMemoryCache.set(key, value, ttlSeconds);
      }
    } catch (error) {
      console.error('Cache set error:', error);
      // Don't throw - caching should be transparent
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          return JSON.parse(value) as T;
        }
      } else {
        // Fallback to in-memory cache
        return inMemoryCache.get<T>(key);
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
      } else {
        inMemoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // For in-memory cache, we'd need to implement pattern matching
        console.warn('Pattern deletion not supported in in-memory cache');
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlSeconds: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fetchFunction();
      await this.set(key, result, ttlSeconds);
      return result;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      throw error;
    }
  }

  /**
   * Increment a counter in cache
   */
  async increment(key: string, amount = 1): Promise<number> {
    try {
      if (this.redis) {
        return await this.redis.incrby(key, amount);
      }
      const current = inMemoryCache.get<number>(key) || 0;
      const newValue = current + amount;
      inMemoryCache.set(key, newValue, CACHE_TTL.LONG);
      return newValue;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Add item to a list (queue)
   */
  async listPush(key: string, value: any): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.lpush(key, JSON.stringify(value));
      } else {
        const list = inMemoryCache.get<any[]>(key) || [];
        list.unshift(value);
        inMemoryCache.set(key, list, CACHE_TTL.MEDIUM);
      }
    } catch (error) {
      console.error('Cache list push error:', error);
    }
  }

  /**
   * Get items from a list
   */
  async listGet(key: string, start = 0, end = -1): Promise<any[]> {
    try {
      if (this.redis) {
        const items = await this.redis.lrange(key, start, end);
        return items.map((item) => JSON.parse(item));
      }
      const list = inMemoryCache.get<any[]>(key) || [];
      return list.slice(start, end === -1 ? undefined : end + 1);
    } catch (error) {
      console.error('Cache list get error:', error);
      return [];
    }
  }
}

// =====================================================
// CACHE STRATEGIES
// =====================================================

export class StockAlertCache {
  private readonly cache: CacheManager;

  constructor() {
    this.cache = new CacheManager();
  }

  // Alert Configurations
  async getAlertConfigs(clinicId: string): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.ALERT_CONFIGS(clinicId));
  }

  async setAlertConfigs(clinicId: string, configs: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.ALERT_CONFIGS(clinicId),
      configs,
      CACHE_TTL.CONFIGS
    );
  }

  async invalidateAlertConfigs(clinicId: string): Promise<void> {
    await this.cache.delete(CACHE_KEYS.ALERT_CONFIGS(clinicId));
  }

  // Active Alerts
  async getActiveAlerts(clinicId: string): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.ACTIVE_ALERTS(clinicId));
  }

  async setActiveAlerts(clinicId: string, alerts: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.ACTIVE_ALERTS(clinicId),
      alerts,
      CACHE_TTL.ALERTS
    );
  }

  async invalidateActiveAlerts(clinicId: string): Promise<void> {
    await this.cache.delete(CACHE_KEYS.ACTIVE_ALERTS(clinicId));
  }

  // Dashboard Data
  async getDashboardData(
    clinicId: string,
    period: string
  ): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.DASHBOARD_DATA(clinicId, period));
  }

  async setDashboardData(
    clinicId: string,
    period: string,
    data: any
  ): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.DASHBOARD_DATA(clinicId, period),
      data,
      CACHE_TTL.DASHBOARD
    );
  }

  async invalidateDashboardData(clinicId: string): Promise<void> {
    await this.cache.deletePattern(`dashboard:${clinicId}:*`);
  }

  // Product Stock
  async getProductStock(productId: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.PRODUCT_STOCK(productId));
  }

  async setProductStock(productId: string, stock: any): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.PRODUCT_STOCK(productId),
      stock,
      CACHE_TTL.SHORT
    );
  }

  async invalidateProductStock(productId: string): Promise<void> {
    await this.cache.delete(CACHE_KEYS.PRODUCT_STOCK(productId));
  }

  // Clinic Products
  async getClinicProducts(clinicId: string): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.CLINIC_PRODUCTS(clinicId));
  }

  async setClinicProducts(clinicId: string, products: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.CLINIC_PRODUCTS(clinicId),
      products,
      CACHE_TTL.MEDIUM
    );
  }

  async invalidateClinicProducts(clinicId: string): Promise<void> {
    await this.cache.delete(CACHE_KEYS.CLINIC_PRODUCTS(clinicId));
  }

  // Report Data
  async getReportData(reportId: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.REPORT_DATA(reportId));
  }

  async setReportData(reportId: string, data: any): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.REPORT_DATA(reportId),
      data,
      CACHE_TTL.REPORTS
    );
  }

  // Notification Queue
  async addNotification(clinicId: string, notification: any): Promise<void> {
    await this.cache.listPush(
      CACHE_KEYS.NOTIFICATION_QUEUE(clinicId),
      notification
    );
  }

  async getNotifications(clinicId: string, limit = 10): Promise<any[]> {
    return this.cache.listGet(
      CACHE_KEYS.NOTIFICATION_QUEUE(clinicId),
      0,
      limit - 1
    );
  }

  // Bulk invalidation for data changes
  async invalidateClinicData(clinicId: string): Promise<void> {
    await Promise.all([
      this.invalidateAlertConfigs(clinicId),
      this.invalidateActiveAlerts(clinicId),
      this.invalidateDashboardData(clinicId),
      this.invalidateClinicProducts(clinicId),
    ]);
  }
}

// =====================================================
// PERFORMANCE MONITORING
// =====================================================

export class CacheMetrics {
  private readonly cache: CacheManager;

  constructor() {
    this.cache = new CacheManager();
  }

  async recordHit(key: string): Promise<void> {
    const hitKey = `metrics:hits:${key}`;
    await this.cache.increment(hitKey);
  }

  async recordMiss(key: string): Promise<void> {
    const missKey = `metrics:misses:${key}`;
    await this.cache.increment(missKey);
  }

  async getHitRate(key: string): Promise<number> {
    const hits = (await this.cache.get<number>(`metrics:hits:${key}`)) || 0;
    const misses = (await this.cache.get<number>(`metrics:misses:${key}`)) || 0;
    const total = hits + misses;

    return total > 0 ? hits / total : 0;
  }
}

// =====================================================
// EXPORTS
// =====================================================

export const cacheManager = new CacheManager();
export const stockAlertCache = new StockAlertCache();
export const cacheMetrics = new CacheMetrics();

export { CACHE_TTL, CACHE_KEYS };
