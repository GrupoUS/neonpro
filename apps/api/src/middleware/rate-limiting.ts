/**
 * API Rate Limiting and Caching Middleware (T075)
 * Performance optimization for large datasets and API protection
 *
 * Features:
 * - Rate limiting with healthcare professional tiers
 * - Response caching with LGPD compliance
 * - Performance monitoring and metrics
 * - Brazilian healthcare context optimization
 * - Integration with AI provider rate limits (T072)
 */

import { Context, Next } from 'hono';
import { z } from 'zod';

// Rate limiting configuration
const rateLimitConfigSchema = z.object({
  windowMs: z.number().min(1000).default(60000), // 1 minute default
  maxRequests: z.number().min(1).default(100),
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false),
  keyGenerator: z.function().optional(),
  onLimitReached: z.function().optional(),
  healthcareProfessionalMultiplier: z.number().min(1).default(2),
  aiEndpointMultiplier: z.number().min(0.1).default(0.5),
});

export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;

// Cache configuration
const cacheConfigSchema = z.object({
  ttl: z.number().min(1000).default(300000), // 5 minutes default
  maxSize: z.number().min(1).default(1000),
  lgpdCompliant: z.boolean().default(true),
  excludePersonalData: z.boolean().default(true),
  healthcareDataTtl: z.number().min(1000).default(60000), // 1 minute for healthcare data
  aiInsightsTtl: z.number().min(1000).default(600000), // 10 minutes for AI insights
});

export type CacheConfig = z.infer<typeof cacheConfigSchema>;

// Rate limit entry
interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// Cache entry
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  lgpdCompliant: boolean;
  dataCategories: string[];
  userId?: string;
}

// Performance metrics
interface PerformanceMetrics {
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  rateLimitHits: number;
  averageResponseTime: number;
  lastUpdated: Date;
}

// Rate limiting manager
class RateLimitManager {
  private limits = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = rateLimitConfigSchema.parse(config);
  }

  // Check if request is within rate limit
  checkRateLimit(key: string, isHealthcareProfessional = false, isAIEndpoint = false): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const entry = this.limits.get(key);

    // Calculate effective limit based on user type and endpoint
    let effectiveLimit = this.config.maxRequests;
    if (isHealthcareProfessional) {
      effectiveLimit *= this.config.healthcareProfessionalMultiplier;
    }
    if (isAIEndpoint) {
      effectiveLimit *= this.config.aiEndpointMultiplier;
    }
    effectiveLimit = Math.floor(effectiveLimit);

    if (!entry) {
      // First request for this key
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      });

      return {
        allowed: true,
        remaining: effectiveLimit - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    // Check if window has expired
    if (now >= entry.resetTime) {
      // Reset the window
      entry.count = 1;
      entry.resetTime = now + this.config.windowMs;
      entry.firstRequest = now;

      return {
        allowed: true,
        remaining: effectiveLimit - 1,
        resetTime: entry.resetTime,
      };
    }

    // Check if within limit
    if (entry.count < effectiveLimit) {
      entry.count++;
      return {
        allowed: true,
        remaining: effectiveLimit - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  // Get current limits for key
  getCurrentLimit(key: string): RateLimitEntry | null {
    return this.limits.get(key) || null;
  }

  // Get all active limits
  getActiveLimits(): Map<string, RateLimitEntry> {
    return new Map(this.limits);
  }
}

// Cache manager
class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = cacheConfigSchema.parse(config);
  }

  // Generate cache key
  private generateKey(method: string, path: string, query?: string, userId?: string): string {
    const baseKey = `${method}:${path}`;
    if (query) {
      return `${baseKey}:${query}`;
    }
    if (userId && this.config.lgpdCompliant) {
      return `${baseKey}:user:${userId}`;
    }
    return baseKey;
  }

  // Get from cache
  get(method: string, path: string, query?: string, userId?: string): any | null {
    const key = this.generateKey(method, path, query, userId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // LGPD compliance check
    if (this.config.lgpdCompliant && userId && entry.userId !== userId) {
      return null; // Don't serve cached data to different users
    }

    return entry.data;
  }

  // Set cache entry
  set(
    method: string,
    path: string,
    data: any,
    options: {
      query?: string;
      userId?: string;
      ttl?: number;
      dataCategories?: string[];
      isHealthcareData?: boolean;
      isAIInsight?: boolean;
    } = {},
  ): boolean {
    // Check if we should exclude personal data
    if (this.config.excludePersonalData && this.containsPersonalData(data)) {
      return false;
    }

    // Determine TTL based on data type
    let ttl = options.ttl || this.config.ttl;
    if (options.isHealthcareData) {
      ttl = this.config.healthcareDataTtl;
    } else if (options.isAIInsight) {
      ttl = this.config.aiInsightsTtl;
    }

    const key = this.generateKey(method, path, options.query, options.userId);

    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      lgpdCompliant: this.config.lgpdCompliant,
      dataCategories: options.dataCategories || [],
      userId: options.userId,
    };

    this.cache.set(key, entry);
    return true;
  }

  // Check if data contains personal information
  private containsPersonalData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const personalDataFields = [
      'cpf',
      'rg',
      'email',
      'phone',
      'address',
      'birth_date',
      'full_name',
      'name',
      'medical_history',
      'diagnosis',
    ];

    const checkObject = (obj: any): boolean => {
      if (Array.isArray(obj)) {
        return obj.some(item => checkObject(item));
      }

      if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          if (personalDataFields.includes(key.toLowerCase())) {
            return true;
          }
          if (checkObject(obj[key])) {
            return true;
          }
        }
      }

      return false;
    };

    return checkObject(data);
  }

  // Evict oldest entry
  private evictOldest() {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Clear cache for user (LGPD compliance)
  clearUserCache(userId: string) {
    for (const [key, entry] of this.cache) {
      if (entry.userId === userId) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; timestamp: number; ttl: number; userId?: string }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      userId: entry.userId,
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Will be calculated by performance metrics
      entries,
    };
  }
}

// Performance metrics manager
class PerformanceMetricsManager {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    rateLimitHits: 0,
    averageResponseTime: 0,
    lastUpdated: new Date(),
  };

  private responseTimes: number[] = [];

  // Record request
  recordRequest() {
    this.metrics.requestCount++;
    this.metrics.lastUpdated = new Date();
  }

  // Record cache hit
  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  // Record cache miss
  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  // Record rate limit hit
  recordRateLimitHit() {
    this.metrics.rateLimitHits++;
  }

  // Record response time
  recordResponseTime(time: number) {
    this.responseTimes.push(time);

    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    // Calculate average
    this.metrics.averageResponseTime = this.responseTimes.reduce((sum, time) => sum + time, 0)
      / this.responseTimes.length;
  }

  // Get metrics
  getMetrics(): PerformanceMetrics & {
    cacheHitRate: number;
    rateLimitRate: number;
  } {
    const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = totalCacheRequests > 0 ? this.metrics.cacheHits / totalCacheRequests : 0;
    const rateLimitRate = this.metrics.requestCount > 0
      ? this.metrics.rateLimitHits / this.metrics.requestCount
      : 0;

    return {
      ...this.metrics,
      cacheHitRate,
      rateLimitRate,
    };
  }

  // Reset metrics
  reset() {
    this.metrics = {
      requestCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitHits: 0,
      averageResponseTime: 0,
      lastUpdated: new Date(),
    };
    this.responseTimes = [];
  }
}

// Global managers
export const rateLimitManager = new RateLimitManager();
export const cacheManager = new CacheManager();
export const performanceMetrics = new PerformanceMetricsManager();

// Rate limiting middleware
export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const manager = new RateLimitManager(config);

  return async (c: Context, next: Next) => {
    const userId = c.get('userId');
    const isHealthcareProfessional = !!c.get('healthcareProfessional');
    const isAIEndpoint = c.req.path.includes('/ai/');

    // Generate rate limit key
    const key = userId || c.req.header('x-forwarded-for') || c.req.header('x-real-ip')
      || 'anonymous';

    // Check rate limit
    const result = manager.checkRateLimit(key, isHealthcareProfessional, isAIEndpoint);

    // Add rate limit headers
    c.header('X-RateLimit-Limit', String(config.maxRequests || 100));
    c.header('X-RateLimit-Remaining', String(result.remaining));
    c.header('X-RateLimit-Reset', String(result.resetTime));

    if (!result.allowed) {
      performanceMetrics.recordRateLimitHit();

      if (result.retryAfter) {
        c.header('Retry-After', String(result.retryAfter));
      }

      return c.json({
        success: false,
        error: 'Limite de requisições excedido',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.retryAfter,
      }, 429);
    }

    performanceMetrics.recordRequest();
    return next();
  };
}

// Caching middleware
export function cache(config: Partial<CacheConfig> = {}) {
  const manager = new CacheManager(config);

  return async (c: Context, next: Next) => {
    const method = c.req.method;
    const path = c.req.path;
    const query = c.req.query();
    const userId = c.get('userId');
    const isHealthcareData = path.includes('/patients/') || path.includes('/medical/');
    const isAIInsight = path.includes('/ai/insights');

    // Only cache GET requests
    if (method !== 'GET') {
      return next();
    }

    // Check cache
    const queryString = Object.keys(query).length > 0 ? JSON.stringify(query) : undefined;
    const cached = manager.get(method, path, queryString, userId);

    if (cached) {
      performanceMetrics.recordCacheHit();
      c.header('X-Cache', 'HIT');
      return c.json(cached);
    }

    performanceMetrics.recordCacheMiss();
    c.header('X-Cache', 'MISS');

    // Continue with request
    const startTime = Date.now();
    await next();
    const responseTime = Date.now() - startTime;

    performanceMetrics.recordResponseTime(responseTime);

    // Cache successful responses
    const response = c.res;
    if (response.status === 200) {
      try {
        const responseData = await response.clone().json();
        manager.set(method, path, responseData, {
          query: queryString,
          userId,
          isHealthcareData,
          isAIInsight,
        });
      } catch (error) {
        // Response is not JSON, skip caching
      }
    }
  };
}

// Performance monitoring middleware
export function performanceMonitoring() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();

    // Add performance utilities to context
    c.set('performanceMetrics', performanceMetrics);
    c.set('cacheManager', cacheManager);
    c.set('rateLimitManager', rateLimitManager);

    await next();

    const responseTime = Date.now() - startTime;
    performanceMetrics.recordResponseTime(responseTime);

    // Add performance headers
    c.header('X-Response-Time', `${responseTime}ms`);
  };
}

// Cleanup middleware (should be run periodically)
export function cleanup() {
  return async (c: Context, next: Next) => {
    // Clean up expired entries every 100 requests
    if (performanceMetrics.getMetrics().requestCount % 100 === 0) {
      rateLimitManager.cleanup();
      cacheManager.cleanup();
    }

    return next();
  };
}

// Export types
export type { CacheConfig, PerformanceMetrics, RateLimitConfig };
