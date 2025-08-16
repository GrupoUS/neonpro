/**
 * Advanced Caching Strategies for Next.js 15
 *
 * Comprehensive caching implementation following 2025 best practices
 * Includes multi-level caching, CDN optimization, and cache invalidation
 */

import { type NextRequest, NextResponse } from 'next/server';

// Cache configuration constants
export const CACHE_CONFIG = {
  // Static assets - long-term caching
  STATIC_ASSETS: {
    maxAge: 31_536_000, // 1 year
    swr: 31_536_000, // 1 year stale-while-revalidate
    immutable: true,
  },

  // API responses - medium-term with revalidation
  API_RESPONSES: {
    maxAge: 300, // 5 minutes
    swr: 3600, // 1 hour stale-while-revalidate
    immutable: false,
  },

  // Dynamic content - short-term with frequent updates
  DYNAMIC_CONTENT: {
    maxAge: 60, // 1 minute
    swr: 300, // 5 minutes stale-while-revalidate
    immutable: false,
  },

  // User-specific data - no caching
  USER_SPECIFIC: {
    maxAge: 0,
    swr: 0,
    immutable: false,
  },
} as const;

// Cache key generators
export class CacheKeyGenerator {
  static analytics(userId: string, dateRange: string, filters?: Record<string, any>): string {
    const filterHash = filters ? CacheKeyGenerator.hashObject(filters) : 'no-filters';
    return `analytics:${userId}:${dateRange}:${filterHash}`;
  }

  static subscription(userId: string): string {
    return `subscription:${userId}`;
  }

  static dashboard(userId: string, page: string): string {
    return `dashboard:${userId}:${page}`;
  }

  static apiResponse(endpoint: string, params?: Record<string, any>): string {
    const paramHash = params ? CacheKeyGenerator.hashObject(params) : 'no-params';
    return `api:${endpoint}:${paramHash}`;
  }

  private static hashObject(obj: Record<string, any>): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}

// Multi-level cache manager
export class CacheManager {
  private readonly memoryCache = new Map<string, { data: any; expires: number; tags: string[] }>();
  private readonly DEFAULT_TTL = 300_000; // 5 minutes

  // Set cache with TTL and tags
  set(key: string, data: any, ttl?: number, tags?: string[]): void {
    const expires = Date.now() + (ttl || this.DEFAULT_TTL);
    this.memoryCache.set(key, { data, expires, tags: tags || [] });
  }

  // Get from cache
  get<T = any>(key: string): T | null {
    const cached = this.memoryCache.get(key);

    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  // Delete specific key
  delete(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  // Invalidate by tags
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;

    for (const [key, cached] of this.memoryCache.entries()) {
      if (cached.tags.some((tag) => tags.includes(tag))) {
        this.memoryCache.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  // Clear expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.memoryCache.entries()) {
      if (now > cached.expires) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
      memoryUsage: JSON.stringify([...this.memoryCache.entries()]).length,
    };
  }
}

// Global cache instance
export const cacheManager = new CacheManager();

// Setup automatic cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const cleaned = cacheManager.cleanup();
    if (cleaned > 0) {
    }
  }, 300_000); // 5 minutes
}

// HTTP Cache Headers Helper
export class CacheHeaders {
  static staticAsset(): Headers {
    const headers = new Headers();
    headers.set('Cache-Control', `public, max-age=${CACHE_CONFIG.STATIC_ASSETS.maxAge}, immutable`);
    headers.set('ETag', `"${Date.now()}"`);
    return headers;
  }

  static apiResponse(config = CACHE_CONFIG.API_RESPONSES): Headers {
    const headers = new Headers();
    headers.set(
      'Cache-Control',
      `public, max-age=${config.maxAge}, stale-while-revalidate=${config.swr}`
    );
    headers.set('ETag', `"${Date.now()}"`);
    headers.set('Vary', 'Accept, Authorization');
    return headers;
  }

  static dynamicContent(): Headers {
    const headers = new Headers();
    headers.set(
      'Cache-Control',
      `public, max-age=${CACHE_CONFIG.DYNAMIC_CONTENT.maxAge}, stale-while-revalidate=${CACHE_CONFIG.DYNAMIC_CONTENT.swr}`
    );
    headers.set('ETag', `"${Date.now()}"`);
    return headers;
  }

  static noCache(): Headers {
    const headers = new Headers();
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    return headers;
  }

  static conditionalCache(request: NextRequest): Headers {
    const headers = new Headers();

    // Check if user is authenticated
    const isAuthenticated = request.headers.get('authorization') || request.cookies.get('session');

    if (isAuthenticated) {
      // Private cache for authenticated users
      headers.set('Cache-Control', 'private, max-age=300');
    } else {
      // Public cache for anonymous users
      headers.set('Cache-Control', 'public, max-age=3600');
    }

    return headers;
  }
}

// Cache invalidation strategies
export class CacheInvalidation {
  // Invalidate user-specific caches
  static async invalidateUser(userId: string): Promise<void> {
    const tags = [`user:${userId}`, `analytics:${userId}`, `subscription:${userId}`];
    const _invalidated = cacheManager.invalidateByTags(tags);
  }

  // Invalidate analytics caches
  static async invalidateAnalytics(userId?: string): Promise<void> {
    const tags = userId ? [`analytics:${userId}`] : ['analytics'];
    const _invalidated = cacheManager.invalidateByTags(tags);
  }

  // Invalidate subscription caches
  static async invalidateSubscriptions(): Promise<void> {
    const _invalidated = cacheManager.invalidateByTags(['subscription']);
  }

  // Time-based invalidation
  static async scheduleInvalidation(key: string, delay: number): Promise<void> {
    setTimeout(() => {
      cacheManager.delete(key);
    }, delay);
  }
}

// CDN optimization utilities
export class CDNOptimization {
  // Generate CDN-optimized URLs
  static imageUrl(
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'auto';
    } = {}
  ): string {
    const { width, height, quality = 75, format = 'auto' } = options;

    // Use Next.js Image Optimization API
    const params = new URLSearchParams();
    if (width) {
      params.set('w', width.toString());
    }
    if (height) {
      params.set('h', height.toString());
    }
    params.set('q', quality.toString());
    if (format !== 'auto') {
      params.set('f', format);
    }

    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
  }

  // Preload critical resources
  static generatePreloadLinks(
    resources: Array<{
      href: string;
      as: 'script' | 'style' | 'font' | 'image';
      type?: string;
      crossorigin?: boolean;
    }>
  ): string {
    return resources
      .map((resource) => {
        let link = `<link rel="preload" href="${resource.href}" as="${resource.as}"`;

        if (resource.type) {
          link += ` type="${resource.type}"`;
        }
        if (resource.crossorigin) {
          link += ' crossorigin';
        }

        return `${link}>`;
      })
      .join('\n');
  }

  // Generate resource hints
  static generateResourceHints(domains: string[]): string {
    return domains.map((domain) => `<link rel="dns-prefetch" href="//${domain}">`).join('\n');
  }
}

// Cache middleware for API routes
export function withCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: {
    ttl?: number;
    tags?: string[];
    keyGenerator?: (req: NextRequest) => string;
    skipCache?: (req: NextRequest) => boolean;
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { ttl = 300_000, tags = [], keyGenerator, skipCache } = config;

    // Skip caching if specified
    if (skipCache?.(req)) {
      return handler(req);
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : CacheKeyGenerator.apiResponse(req.url, Object.fromEntries(req.nextUrl.searchParams));

    // Try to get from cache
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return new NextResponse(JSON.stringify(cached), {
        status: 200,
        headers: CacheHeaders.apiResponse().set('X-Cache', 'HIT'),
      });
    }

    // Execute handler
    const response = await handler(req);

    // Cache successful responses
    if (response.ok) {
      const data = await response.json();
      cacheManager.set(cacheKey, data, ttl, tags);
    }

    return response;
  };
}

// Performance monitoring for cache efficiency
export class CachePerformanceMonitor {
  private static hits = 0;
  private static misses = 0;
  private static startTime = Date.now();

  static recordHit(): void {
    CachePerformanceMonitor.hits++;
  }

  static recordMiss(): void {
    CachePerformanceMonitor.misses++;
  }

  static getStats() {
    const total = CachePerformanceMonitor.hits + CachePerformanceMonitor.misses;
    const hitRate = total > 0 ? (CachePerformanceMonitor.hits / total) * 100 : 0;
    const uptime = Date.now() - CachePerformanceMonitor.startTime;

    return {
      hits: CachePerformanceMonitor.hits,
      misses: CachePerformanceMonitor.misses,
      total,
      hitRate: Number.parseFloat(hitRate.toFixed(2)),
      uptime,
      cacheStats: cacheManager.getStats(),
    };
  }

  static reset(): void {
    CachePerformanceMonitor.hits = 0;
    CachePerformanceMonitor.misses = 0;
    CachePerformanceMonitor.startTime = Date.now();
  }
}
