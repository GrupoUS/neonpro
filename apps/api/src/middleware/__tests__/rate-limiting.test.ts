/**
 * Rate Limiting Test Suite for Healthcare APIs
 *
 * Tests rate limiting middleware with healthcare-specific scenarios:
 * - Emergency endpoint bypass
 * - LGPD compliance logging
 * - Multi-tenant isolation
 * - Sliding window accuracy
 */

import { Context } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_RATE_LIMIT_CONFIG,
  getRateLimitStats,
  HEALTHCARE_RATE_LIMITS,
  rateLimitMiddleware,
  type RateLimitRule,
  resetRateLimits,
} from '../rate-limiting';

// Mock Hono Context
function createMockContext(
  overrides: Partial<{
    path: string;
    method: string;
    headers: Record<string, string>;
    userId: string;
    clinicId: string;
    userRole: string;
  }>,
): Context {
  const headers = new Map(Object.entries(overrides.headers || {}));
  const variables = new Map();

  if (overrides.userId) variables.set('userId', overrides.userId);
  if (overrides.clinicId) variables.set('clinicId', overrides.clinicId);
  if (overrides.userRole) variables.set('userRole', overrides.userRole);

  return {
    req: {
      path: overrides.path || '/api/v1/test',
      method: overrides.method || 'GET',
      header: (key: string) => headers.get(key.toLowerCase()),
    },
    header: vi.fn(),
    get: (key: string) => variables.get(key),
    set: (key: string, value: any) => variables.set(key, value),
  } as any;
}

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    resetRateLimits();
    vi.clearAllMocks();
  });

  describe('Basic Rate Limiting', () => {
    it('allows requests within limit', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 5, windowMs: 60000 },
        endpoints: {},
      });

      const context = createMockContext({ path: '/api/v1/test' });
      const next = vi.fn();

      // Should allow first 5 requests
      for (let i = 0; i < 5; i++) {
        await middleware(context, next);
        expect(next).toHaveBeenCalledTimes(i + 1);
      }
    });

    it('blocks requests exceeding limit', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 2, windowMs: 60000 },
        endpoints: {},
      });

      const context = createMockContext({
        path: '/api/v1/test',
        headers: { 'x-forwarded-for': '192.168.1.100' },
      });
      const next = vi.fn();

      // Allow first 2 requests
      await middleware(context, next);
      await middleware(context, next);
      expect(next).toHaveBeenCalledTimes(2);

      // Block 3rd request
      await expect(middleware(context, next)).rejects.toThrow();
      expect(next).toHaveBeenCalledTimes(2); // Still only 2 calls
    });

    it('sets correct rate limit headers', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 10, windowMs: 60000 },
        endpoints: {},
      });

      const context = createMockContext({});
      const next = vi.fn();

      await middleware(context, next);

      expect(context.header).toHaveBeenCalledWith('X-RateLimit-Limit', '10');
      expect(context.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '9');
      expect(context.header).toHaveBeenCalledWith('X-RateLimit-Window', '60000');
    });
  });

  describe('Healthcare-Specific Rules', () => {
    it('applies emergency endpoint rules correctly', async () => {
      const middleware = rateLimitMiddleware(DEFAULT_RATE_LIMIT_CONFIG);
      const context = createMockContext({ path: '/api/v1/emergency/cardiac-alert' });
      const next = vi.fn();

      // Emergency endpoints should have higher limits (1000 requests/minute)
      const emergencyRule = HEALTHCARE_RATE_LIMITS['/api/v1/emergency/'];
      expect(emergencyRule.maxRequests).toBe(1000);
      expect(emergencyRule.priority).toBe('emergency');

      await middleware(context, next);
      expect(next).toHaveBeenCalled();
    });

    it('bypasses rate limiting for emergency responders', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 1, windowMs: 60000 },
        endpoints: {
          '/api/v1/emergency/': {
            maxRequests: 1,
            windowMs: 60000,
            skipRoles: ['emergency_responder'],
          },
        },
      });

      const context = createMockContext({
        path: '/api/v1/emergency/test',
        userRole: 'emergency_responder',
      });
      const next = vi.fn();

      // Should allow multiple requests for emergency responder
      await middleware(context, next);
      await middleware(context, next);
      await middleware(context, next);

      expect(next).toHaveBeenCalledTimes(3);
    });

    it('applies strict limits to authentication endpoints', async () => {
      const middleware = rateLimitMiddleware(DEFAULT_RATE_LIMIT_CONFIG);

      const authRule = HEALTHCARE_RATE_LIMITS['/api/v1/auth/'];
      expect(authRule.maxRequests).toBe(10); // Strict limit for auth
      expect(authRule.priority).toBe('administrative');
    });

    it('handles patient data access with audit logging', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const middleware = rateLimitMiddleware({
        ...DEFAULT_RATE_LIMIT_CONFIG,
        auditLogging: true,
      });

      const context = createMockContext({
        path: '/api/v1/patients/12345',
        userId: 'doc123',
        clinicId: 'clinic456',
      });
      const next = vi.fn();

      await middleware(context, next);

      expect(consoleSpy).toHaveBeenCalledWith(
        'RATE_LIMIT_AUDIT',
        expect.objectContaining({
          endpoint: '/api/v1/patients/12345',
          userId: 'doc123',
          clinicId: 'clinic456',
          allowed: true,
        }),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('isolates rate limits by clinic ID', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 2, windowMs: 60000 },
        endpoints: {},
      });

      const clinic1Context = createMockContext({
        path: '/api/v1/test',
        clinicId: 'clinic1',
        headers: { 'x-forwarded-for': '192.168.1.100' },
      });

      const clinic2Context = createMockContext({
        path: '/api/v1/test',
        clinicId: 'clinic2',
        headers: { 'x-forwarded-for': '192.168.1.100' }, // Same IP
      });

      const next = vi.fn();

      // Use up limit for clinic1
      await middleware(clinic1Context, next);
      await middleware(clinic1Context, next);
      expect(next).toHaveBeenCalledTimes(2);

      // Third request for clinic1 should fail
      await expect(middleware(clinic1Context, next)).rejects.toThrow();

      // But clinic2 should still work (different clinic ID)
      await middleware(clinic2Context, next);
      expect(next).toHaveBeenCalledTimes(3);
    });

    it('isolates rate limits by user ID', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 1, windowMs: 60000 },
        endpoints: {},
      });

      const user1Context = createMockContext({
        path: '/api/v1/test',
        userId: 'user1',
        headers: { 'x-forwarded-for': '192.168.1.100' },
      });

      const user2Context = createMockContext({
        path: '/api/v1/test',
        userId: 'user2',
        headers: { 'x-forwarded-for': '192.168.1.100' }, // Same IP
      });

      const next = vi.fn();

      // Use up limit for user1
      await middleware(user1Context, next);
      expect(next).toHaveBeenCalledTimes(1);

      // Second request for user1 should fail
      await expect(middleware(user1Context, next)).rejects.toThrow();

      // But user2 should still work (different user ID)
      await middleware(user2Context, next);
      expect(next).toHaveBeenCalledTimes(2);
    });
  });

  describe('IP Allowlisting', () => {
    it('bypasses rate limiting for allowlisted IPs', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 1, windowMs: 60000 },
        endpoints: {},
        allowlistedIPs: ['192.168.1.100'],
      });

      const context = createMockContext({
        headers: { 'x-forwarded-for': '192.168.1.100' },
      });
      const next = vi.fn();

      // Should allow multiple requests from allowlisted IP
      await middleware(context, next);
      await middleware(context, next);
      await middleware(context, next);

      expect(next).toHaveBeenCalledTimes(3);
    });

    it('enforces rate limiting for non-allowlisted IPs', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 1, windowMs: 60000 },
        endpoints: {},
        allowlistedIPs: ['192.168.1.100'],
      });

      const context = createMockContext({
        headers: { 'x-forwarded-for': '10.0.0.1' }, // Not allowlisted
      });
      const next = vi.fn();

      // Allow first request
      await middleware(context, next);
      expect(next).toHaveBeenCalledTimes(1);

      // Block second request
      await expect(middleware(context, next)).rejects.toThrow();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sliding Window Behavior', () => {
    it('resets count after window expires', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 2, windowMs: 1000 }, // 1 second window
        endpoints: {},
      });

      const context = createMockContext({});
      const next = vi.fn();

      // Use up the limit
      await middleware(context, next);
      await middleware(context, next);
      expect(next).toHaveBeenCalledTimes(2);

      // Should block third request
      await expect(middleware(context, next)).rejects.toThrow();

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should allow requests again
      await middleware(context, next);
      expect(next).toHaveBeenCalledTimes(3);
    });

    it('maintains accurate counts during window', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 3, windowMs: 2000 },
        endpoints: {},
      });

      const context = createMockContext({});
      const next = vi.fn();

      // Make requests with delays
      await middleware(context, next);
      await new Promise(resolve => setTimeout(resolve, 500));

      await middleware(context, next);
      await new Promise(resolve => setTimeout(resolve, 500));

      await middleware(context, next);
      expect(next).toHaveBeenCalledTimes(3);

      // Fourth request should be blocked
      await expect(middleware(context, next)).rejects.toThrow();
    });
  });

  describe('Error Handling and Messages', () => {
    it('provides healthcare-specific error messages', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 1, windowMs: 60000 },
        endpoints: {
          '/api/v1/emergency/': {
            maxRequests: 1,
            windowMs: 60000,
            priority: 'emergency',
            message:
              'Emergency endpoint rate limit exceeded. Contact system administrator if this is a medical emergency.',
          },
        },
      });

      const context = createMockContext({ path: '/api/v1/emergency/test' });
      const next = vi.fn();

      // Use up the limit
      await middleware(context, next);

      // Should throw with healthcare-specific message
      try {
        await middleware(context, next);
        expect.fail('Should have thrown rate limit error');
      } catch (error: any) {
        const errorData = JSON.parse(error.message);
        expect(errorData.guidance).toContain('medical emergency');
        expect(errorData.compliance.standard).toBe('LGPD-Article-33-Security-Measures');
      }
    });

    it('includes LGPD compliance information in errors', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 1, windowMs: 60000 },
        endpoints: {},
        auditLogging: true,
      });

      const context = createMockContext({});
      const next = vi.fn();

      await middleware(context, next);

      try {
        await middleware(context, next);
        expect.fail('Should have thrown rate limit error');
      } catch (error: any) {
        const errorData = JSON.parse(error.message);
        expect(errorData.compliance).toEqual({
          logged: true,
          standard: 'LGPD-Article-33-Security-Measures',
        });
      }
    });
  });

  describe('Statistics and Monitoring', () => {
    it('provides accurate statistics', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 10, windowMs: 60000 },
        endpoints: {},
      });

      const context1 = createMockContext({
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });
      const context2 = createMockContext({
        headers: { 'x-forwarded-for': '192.168.1.2' },
      });
      const next = vi.fn();

      // Make some requests
      await middleware(context1, next);
      await middleware(context2, next);
      await middleware(context1, next);

      const stats = getRateLimitStats();
      expect(stats.store.totalKeys).toBe(2); // Two different IPs
      expect(stats.store.totalAttempts).toBe(3); // Three total requests
      expect(stats.config.endpointCount).toBeGreaterThan(0);
    });

    it('tracks rate limit status in context', async () => {
      const middleware = rateLimitMiddleware({
        default: { maxRequests: 5, windowMs: 60000 },
        endpoints: {},
      });

      const context = createMockContext({});
      const next = vi.fn();

      await middleware(context, next);

      const status = context.get('rateLimitStatus');
      const rule = context.get('rateLimitRule');

      expect(status).toBeDefined();
      expect(status.allowed).toBe(true);
      expect(status.remainingRequests).toBe(4);
      expect(rule).toBeDefined();
      expect(rule.maxRequests).toBe(5);
    });
  });
});
