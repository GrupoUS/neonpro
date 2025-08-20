/**
 * 🚦 Rate Limiting Middleware - NeonPro API
 * ==========================================
 *
 * Rate limiting configurável por endpoint com Redis-like storage
 * para proteger a API contra abuse e garantir performance.
 */

import type { MiddlewareHandler } from 'hono';

// Rate limiting configuration per endpoint
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (c: any) => string;
}

// In-memory store for development (production should use Redis)
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  get(key: string): { count: number; resetTime: number } | undefined {
    const record = this.store.get(key);
    if (!record || record.resetTime < Date.now()) {
      this.store.delete(key);
      return;
    }
    return record;
  }

  increment(
    key: string,
    windowMs: number
  ): { count: number; resetTime: number } {
    const now = Date.now();
    const resetTime = now + windowMs;
    const existing = this.get(key);

    if (existing) {
      existing.count++;
      return existing;
    }

    const newRecord = { count: 1, resetTime };
    this.store.set(key, newRecord);
    return newRecord;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (record.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

// Global store instance
const store = new MemoryStore();

// Cleanup expired entries every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000);

// Default configurations per endpoint type
const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints - stricter limits
  '/api/v1/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Max 5 login attempts per 15 minutes
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },

  '/api/v1/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // Max 3 registrations per hour per IP
    message: 'Limite de registros atingido. Tente novamente em 1 hora.',
  },

  '/api/v1/auth/forgot-password': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // Max 3 password reset requests per 15 minutes
    message: 'Limite de solicitações de senha atingido.',
  },

  // API endpoints - moderate limits
  '/api/v1/patients': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'Limite de requisições atingido. Tente novamente em 1 minuto.',
  },

  '/api/v1/appointments': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
    message: 'Limite de requisições de agendamentos atingido.',
  },

  // Analytics endpoints - higher limits for dashboards
  '/api/v1/analytics': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50, // 50 requests per minute
    message: 'Limite de requisições de analytics atingido.',
  },

  // Export/reporting - stricter limits for heavy operations
  '/api/v1/compliance/export': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 2, // Max 2 exports per 5 minutes
    message: 'Limite de exportações atingido. Tente novamente em 5 minutos.',
  },
};

// Default fallback configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Rate limit exceeded. Please try again later.',
};

/**
 * Rate limiting middleware factory
 */
export const rateLimitMiddleware = (
  config?: Partial<RateLimitConfig>
): MiddlewareHandler => {
  return async (c, next) => {
    const path = c.req.path;
    const method = c.req.method;
    const fullPath = `${method} ${path}`;

    // Find the most specific matching configuration
    let effectiveConfig = { ...DEFAULT_CONFIG, ...config };

    // Check for endpoint-specific configuration
    for (const [pattern, patternConfig] of Object.entries(DEFAULT_LIMITS)) {
      if (path.startsWith(pattern) || fullPath === pattern) {
        effectiveConfig = { ...effectiveConfig, ...patternConfig };
        break;
      }
    }

    // Generate rate limit key
    const keyGenerator =
      effectiveConfig.keyGenerator ||
      ((c) => {
        const clientIP =
          c.req.header('CF-Connecting-IP') ||
          c.req.header('X-Forwarded-For') ||
          c.req.header('X-Real-IP') ||
          'unknown';
        return `ratelimit:${clientIP}:${path}`;
      });

    const key = keyGenerator(c);

    try {
      // Check current usage
      const record = store.increment(key, effectiveConfig.windowMs);
      const remaining = Math.max(0, effectiveConfig.maxRequests - record.count);
      const resetTime = Math.ceil(record.resetTime / 1000);

      // Set rate limit headers
      c.res.headers.set(
        'X-RateLimit-Limit',
        effectiveConfig.maxRequests.toString()
      );
      c.res.headers.set('X-RateLimit-Remaining', remaining.toString());
      c.res.headers.set('X-RateLimit-Reset', resetTime.toString());
      c.res.headers.set(
        'X-RateLimit-Window',
        effectiveConfig.windowMs.toString()
      );

      // Check if limit exceeded
      if (record.count > effectiveConfig.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - Date.now()) / 1000);
        c.res.headers.set('Retry-After', retryAfter.toString());

        return c.json(
          {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: effectiveConfig.message || DEFAULT_CONFIG.message,
            retryAfter,
            limit: effectiveConfig.maxRequests,
            window: effectiveConfig.windowMs / 1000,
          },
          429
        );
      }

      await next();

      // Optional: skip counting successful requests if configured
      if (effectiveConfig.skipSuccessfulRequests && c.res.status < 400) {
        // Don't count this request (decrement)
        const currentRecord = store.get(key);
        if (currentRecord) {
          currentRecord.count = Math.max(0, currentRecord.count - 1);
        }
      }
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request to continue
      await next();
    }
  };
};

/**
 * Specific rate limiters for different use cases
 */
export const authRateLimit = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
});

export const apiRateLimit = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  message: 'Limite de requisições da API atingido.',
});

export const strictRateLimit = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Limite rigoroso atingido. Operação muito frequente.',
});

// Export store for testing and admin purposes
export { store as rateLimitStore };
