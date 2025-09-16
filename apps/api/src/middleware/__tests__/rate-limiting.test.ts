/**
 * API Rate Limiting and Caching Middleware Tests (T075)
 * Comprehensive test suite for rate limiting and caching with healthcare context
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cache, cacheManager, rateLimit, rateLimitManager } from '../rate-limiting';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

describe('API Rate Limiting and Caching Middleware (T075)', () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    mockContext = {
      req: {
        header: vi.fn(),
        param: vi.fn(),
        query: vi.fn(),
        url: 'https://api.example.com/test',
        method: 'GET',
      },
      set: vi.fn(),
      json: vi.fn(),
      get: vi.fn(),
    };
    mockNext = vi.fn();

    // Reset managers
    (rateLimitManager as any).limits.clear();
    (cacheManager as any).cache.clear();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rate Limit Manager', () => {
    it('should allow requests within rate limit', () => {
      const key = 'test-user';

      const result = rateLimitManager.checkRateLimit(key, false, false);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99); // Default limit is 100
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should apply higher limits for healthcare professionals', () => {
      const key = 'healthcare-user';

      const result = rateLimitManager.checkRateLimit(key, true, false);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(499); // Healthcare professional limit is 500
    });

    it('should apply special limits for AI endpoints', () => {
      const key = 'ai-user';

      const result = rateLimitManager.checkRateLimit(key, false, true);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(49); // AI endpoint limit is 50
    });

    it('should block requests when rate limit exceeded', () => {
      const key = 'blocked-user';

      // Exhaust the rate limit
      for (let i = 0; i < 100; i++) {
        rateLimitManager.checkRateLimit(key, false, false);
      }

      const result = rateLimitManager.checkRateLimit(key, false, false);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset rate limit after window expires', () => {
      const key = 'reset-user';

      // Mock time to simulate window expiration
      const originalNow = Date.now;
      Date.now = vi.fn(() => 1000000);

      // Use up the limit
      for (let i = 0; i < 100; i++) {
        rateLimitManager.checkRateLimit(key, false, false);
      }

      // Advance time beyond window
      Date.now = vi.fn(() => 1000000 + 61 * 60 * 1000); // 61 minutes later

      const result = rateLimitManager.checkRateLimit(key, false, false);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);

      // Restore original Date.now
      Date.now = originalNow;
    });

    it('should clean expired rate limit entries', () => {
      const key1 = 'user1';
      const key2 = 'user2';

      // Create entries
      rateLimitManager.checkRateLimit(key1, false, false);
      rateLimitManager.checkRateLimit(key2, false, false);

      // Mock expired entry
      const limits = (rateLimitManager as any).limits;
      const entry = limits.get(key1);
      if (entry) {
        entry.resetTime = Date.now() - 1000; // Expired 1 second ago
      }

      const cleanedCount = rateLimitManager.cleanExpiredEntries();

      expect(cleanedCount).toBe(1);
      expect(limits.has(key1)).toBe(false);
      expect(limits.has(key2)).toBe(true);
    });
  });

  describe('Cache Manager', () => {
    it('should store and retrieve cached responses', () => {
      const method = 'GET';
      const path = '/api/patients';
      const data = { patients: [{ id: 1, name: 'Test' }] };

      const stored = cacheManager.set(method, path, data, {
        ttl: 300,
        lgpdCompliant: true,
      });

      expect(stored).toBe(true);

      const retrieved = cacheManager.get(method, path);
      expect(retrieved).toEqual(data);
    });

    it('should return null for expired cache entries', () => {
      const method = 'GET';
      const path = '/api/expired';
      const data = { test: 'data' };

      // Store with very short TTL
      cacheManager.set(method, path, data, { ttl: 0.001 });

      // Wait for expiration
      setTimeout(() => {
        const retrieved = cacheManager.get(method, path);
        expect(retrieved).toBeNull();
      }, 10);
    });

    it('should handle user-specific caching', () => {
      const method = 'GET';
      const path = '/api/user-data';
      const userId = 'user-123';
      const data = { userData: 'sensitive' };

      const stored = cacheManager.set(method, path, data, {
        ttl: 300,
        userId,
        lgpdCompliant: true,
      });

      expect(stored).toBe(true);

      // Should retrieve with same user
      const retrieved = cacheManager.get(method, path, undefined, userId);
      expect(retrieved).toEqual(data);

      // Should not retrieve with different user
      const notRetrieved = cacheManager.get(method, path, undefined, 'other-user');
      expect(notRetrieved).toBeNull();
    });

    it('should not cache non-LGPD compliant data', () => {
      const method = 'GET';
      const path = '/api/sensitive';
      const data = { sensitive: 'data' };

      const stored = cacheManager.set(method, path, data, {
        ttl: 300,
        lgpdCompliant: false,
      });

      expect(stored).toBe(false);

      const retrieved = cacheManager.get(method, path);
      expect(retrieved).toBeNull();
    });

    it('should clean expired cache entries', () => {
      const data = { test: 'data' };

      // Store entries with different expiration times
      cacheManager.set('GET', '/api/valid', data, { ttl: 300 });
      cacheManager.set('GET', '/api/expired', data, { ttl: 0.001 });

      // Wait for one to expire
      setTimeout(() => {
        const cleanedCount = cacheManager.cleanExpiredEntries();
        expect(cleanedCount).toBe(1);

        expect(cacheManager.get('GET', '/api/valid')).toEqual(data);
        expect(cacheManager.get('GET', '/api/expired')).toBeNull();
      }, 10);
    });

    it('should get cache statistics', () => {
      // Create some cache entries
      cacheManager.set('GET', '/api/test1', { data: 1 }, { ttl: 300 });
      cacheManager.set('GET', '/api/test2', { data: 2 }, { ttl: 300 });

      // Generate some hits and misses
      cacheManager.get('GET', '/api/test1'); // hit
      cacheManager.get('GET', '/api/test1'); // hit
      cacheManager.get('GET', '/api/missing'); // miss

      const stats = cacheManager.getStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(2 / 3);
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should allow requests within rate limit', async () => {
      const middleware = rateLimit();

      mockContext.req.header.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return '192.168.1.1';
        return undefined;
      });

      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith('rateLimitRemaining', expect.any(Number));
      expect(mockContext.set).toHaveBeenCalledWith('rateLimitReset', expect.any(Number));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should block requests when rate limit exceeded', async () => {
      const middleware = rateLimit();
      const clientIp = '192.168.1.100';

      mockContext.req.header.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return clientIp;
        return undefined;
      });

      // Exhaust rate limit
      for (let i = 0; i < 100; i++) {
        rateLimitManager.checkRateLimit(clientIp, false, false);
      }

      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Limite de requisições excedido',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        429,
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should apply healthcare professional rate limits', async () => {
      const middleware = rateLimit();

      mockContext.req.header.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return '192.168.1.2';
        return undefined;
      });

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'healthcareProfessional') return { id: 'hp-123' };
        return undefined;
      });

      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith('rateLimitRemaining', 499); // Healthcare limit
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle caching for GET requests', async () => {
      const middleware = cache();

      mockContext.req.method = 'GET';
      mockContext.req.path = '/api/cached-endpoint';

      // Mock a cached response
      const cachedData = { cached: true };
      cacheManager.set('GET', '/api/cached-endpoint', cachedData, {
        ttl: 300,
        lgpdCompliant: true,
      });

      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(cachedData);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
