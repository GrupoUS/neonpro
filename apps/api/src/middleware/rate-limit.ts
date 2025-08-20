/**
 * Rate Limiting Middleware
 * Protects API from abuse and DoS attacks
 */

import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '@/types/env';

// In-memory store for rate limiting (TODO: Replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Default rate limit configuration
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later.',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export const rateLimitMiddleware = (
  config: Partial<RateLimitConfig> = {}
): MiddlewareHandler<AppEnv> => {
  const finalConfig = { ...defaultConfig, ...config };

  return async (c, next) => {
    const ipAddress = c.get('ip_address') || 'unknown';
    const user = c.get('user');

    // Create rate limit key (prefer user ID, fallback to IP)
    const rateLimitKey = user?.id || ipAddress;

    // Get current time
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(rateLimitKey);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + finalConfig.windowMs,
      };
      rateLimitStore.set(rateLimitKey, entry);
    }

    // Check rate limit
    if (entry.count >= finalConfig.maxRequests) {
      // Rate limit exceeded
      c.header('X-RateLimit-Limit', finalConfig.maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', entry.resetTime.toString());
      c.header(
        'Retry-After',
        Math.ceil((entry.resetTime - now) / 1000).toString()
      );

      return c.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: finalConfig.message,
          },
          meta: {
            limit: finalConfig.maxRequests,
            remaining: 0,
            reset: entry.resetTime,
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          },
        },
        429
      );
    }

    // Increment counter
    entry.count++;

    // Add rate limit headers
    c.header('X-RateLimit-Limit', finalConfig.maxRequests.toString());
    c.header(
      'X-RateLimit-Remaining',
      (finalConfig.maxRequests - entry.count).toString()
    );
    c.header('X-RateLimit-Reset', entry.resetTime.toString());

    await next();

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      // 1% chance
      cleanupExpiredEntries();
    }
  };
};

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 login attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
  },

  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 API calls per 15 minutes
    message: 'API rate limit exceeded, please try again later.',
  },

  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Rate limit exceeded, please try again later.',
  },
};
