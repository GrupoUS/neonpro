import { Context, Next } from 'hono';
import { logger } from '../lib/logger';

/**
 * Simple in-memory rate limiting store
 */
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  get(key: string): { count: number; resetTime: number } | undefined {
    const entry = this.store.get(key);

    // Clean up expired entries
    if (entry && Date.now() > entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }

    return entry;
  }

  set(key: string, count: number, windowMs: number): void {
    this.store.set(key, {
      count,
      resetTime: Date.now() + windowMs,
    });
  }

  increment(key: string, windowMs: number): number {
    const existing = this.get(key);

    if (!existing) {
      this.set(key, 1, windowMs);
      return 1;
    }

    const newCount = existing.count + 1;
    this.set(key, newCount, windowMs);
    return newCount;
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const _now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const store = new RateLimitStore();

// Clean up expired entries every 5 minutes
setInterval(_() => store.cleanup(), 5 * 60 * 1000);

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Default key generator using IP address
 */
function defaultKeyGenerator(c: Context): string {
  const ip = c.req.header('x-forwarded-for')
    || c.req.header('x-real-ip')
    || c.req.header('cf-connecting-ip')
    || 'unknown';

  return `rate_limit:${ip}`;
}

/**
 * Creates a rate limiting middleware
 */
function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);

    // Get current count
    const current = store.get(key);
    const count = current ? current.count : 0;

    // Check if rate limit exceeded
    if (count >= maxRequests) {
      const resetTime = current ? current.resetTime : Date.now() + windowMs;
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      logger.warn('Rate limit exceeded', {
        key,
        count,
        maxRequests,
        retryAfter,
        path: c.req.path,
        method: c.req.method,
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      });

      // Set rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      c.header('Retry-After', retryAfter.toString());

      return c.json(
        {
          error: {
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
          },
        },
        429,
      );
    }

    // Process the request
    let shouldCount = true;

    try {
      await next();

      // Check if we should skip counting successful requests
      if (skipSuccessfulRequests && c.res.status < 400) {
        shouldCount = false;
      }
    } catch (_error) {
      // Check if we should skip counting failed requests
      if (skipFailedRequests) {
        shouldCount = false;
      }

      throw error;
    } finally {
      // Increment counter if needed
      if (shouldCount) {
        const newCount = store.increment(key, windowMs);
        const remaining = Math.max(0, maxRequests - newCount);
        const resetTime = current?.resetTime || Date.now() + windowMs;

        // Set rate limit headers
        c.header('X-RateLimit-Limit', maxRequests.toString());
        c.header('X-RateLimit-Remaining', remaining.toString());
        c.header('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      }
    }

    // Return void for middleware compatibility
    return;
  };
}

/**
 * Healthcare-specific rate limiting middleware
 * More restrictive for healthcare data endpoints
 */
export function rateLimitMiddleware() {
  // Different limits for different endpoint types
  return async (c: Context, next: Next) => {
    const path = c.req.path;

    // Healthcare data endpoints - very restrictive
    if (path.includes('/patients') || path.includes('/medical-records')) {
      const healthcareLimit = createRateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 50, // 50 requests per 15 minutes
      });
      return healthcareLimit(c, next);
    }

    // AI/Chat endpoints - moderate limits
    if (path.includes('/chat') || path.includes('/ai')) {
      const aiLimit = createRateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20, // 20 requests per minute
      });
      return aiLimit(c, next);
    }

    // Authentication endpoints - strict limits
    if (path.includes('/auth') || path.includes('/login')) {
      const authLimit = createRateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 10 attempts per 15 minutes
        skipSuccessfulRequests: true, // Only count failed attempts
      });
      return authLimit(c, next);
    }

    // General API endpoints - default limits
    const generalLimit = createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 requests per 15 minutes
    });

    return generalLimit(c, next);
  };
}
