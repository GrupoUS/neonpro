/**
 * 🚦 Rate Limiting Middleware - NeonPro API
 * ==========================================
 *
 * Rate limiting configurável por endpoint com Redis-like storage
 * para proteger a API contra abuse e garantir performance.
 */

import type { Context, MiddlewareHandler } from "hono";
import { logger } from "../lib/logger";

// Time constants in milliseconds
const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  HOUR: 60 * 60 * 1000,
} as const;

// Request limits
const REQUEST_LIMITS = {
  VERY_STRICT: 2,
  STRICT: 3,
  AUTH_LOGIN: 5,
  MODERATE: 10,
  APPOINTMENTS: 20,
  PATIENTS: 30,
  ANALYTICS: 50,
  API_DEFAULT: 60,
  GENERAL_DEFAULT: 100,
} as const;

// HTTP status codes
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  TOO_MANY_REQUESTS: 429,
} as const;

// Rate limiting configuration per endpoint
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (c: Context) => string;
}

// In-memory store for development (production should use Redis)
class MemoryStore {
  private readonly store = new Map<
    string,
    { count: number; resetTime: number; }
  >();

  get(key: string): { count: number; resetTime: number; } | undefined {
    const record = this.store.get(key);
    if (!record || record.resetTime < Date.now()) {
      this.store.delete(key);
      return;
    }
    return record;
  }

  increment(
    key: string,
    windowMs: number,
  ): { count: number; resetTime: number; } {
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
setInterval(() => store.cleanup(), TIME_CONSTANTS.FIVE_MINUTES);

// Default configurations per endpoint type
const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints - stricter limits
  "/api/v1/auth/login": {
    windowMs: TIME_CONSTANTS.FIFTEEN_MINUTES,
    maxRequests: REQUEST_LIMITS.AUTH_LOGIN,
    message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },

  "/api/v1/auth/register": {
    windowMs: TIME_CONSTANTS.HOUR,
    maxRequests: REQUEST_LIMITS.STRICT,
    message: "Limite de registros atingido. Tente novamente em 1 hora.",
  },

  "/api/v1/auth/forgot-password": {
    windowMs: TIME_CONSTANTS.FIFTEEN_MINUTES,
    maxRequests: REQUEST_LIMITS.STRICT,
    message: "Limite de solicitações de senha atingido.",
  },

  // API endpoints - moderate limits
  "/api/v1/patients": {
    windowMs: TIME_CONSTANTS.MINUTE,
    maxRequests: REQUEST_LIMITS.PATIENTS,
    message: "Limite de requisições atingido. Tente novamente em 1 minuto.",
  },

  "/api/v1/appointments": {
    windowMs: TIME_CONSTANTS.MINUTE,
    maxRequests: REQUEST_LIMITS.APPOINTMENTS,
    message: "Limite de requisições de agendamentos atingido.",
  },

  // Analytics endpoints - higher limits for dashboards
  "/api/v1/analytics": {
    windowMs: TIME_CONSTANTS.MINUTE,
    maxRequests: REQUEST_LIMITS.ANALYTICS,
    message: "Limite de requisições de analytics atingido.",
  },

  // Export/reporting - stricter limits for heavy operations
  "/api/v1/compliance/export": {
    windowMs: TIME_CONSTANTS.FIVE_MINUTES,
    maxRequests: REQUEST_LIMITS.VERY_STRICT,
    message: "Limite de exportações atingido. Tente novamente em 5 minutos.",
  },
};

// Default fallback configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: TIME_CONSTANTS.MINUTE,
  maxRequests: REQUEST_LIMITS.GENERAL_DEFAULT,
  message: "Rate limit exceeded. Please try again later.",
};

/**
 * Rate limiting middleware factory
 */
export const rateLimitMiddleware = (
  config?: Partial<RateLimitConfig>,
): MiddlewareHandler => {
  return async (c, next) => {
    const { path, method } = c.req;
    const fullPath = `${method} ${path}`;

    // Find the most specific matching configuration
    let effectiveConfig = Object.assign({}, DEFAULT_CONFIG, config);

    // Check for endpoint-specific configuration
    for (const [pattern, patternConfig] of Object.entries(DEFAULT_LIMITS)) {
      if (path.startsWith(pattern) || fullPath === pattern) {
        Object.assign(effectiveConfig, patternConfig);
        break;
      }
    }

    // Generate rate limit key
    const keyGenerator = effectiveConfig.keyGenerator
      || ((c) => {
        const clientIP = c.req.header("CF-Connecting-IP")
          || c.req.header("X-Forwarded-For")
          || c.req.header("X-Real-IP")
          || "unknown";
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
        "X-RateLimit-Limit",
        effectiveConfig.maxRequests.toString(),
      );
      c.res.headers.set("X-RateLimit-Remaining", remaining.toString());
      c.res.headers.set("X-RateLimit-Reset", resetTime.toString());
      c.res.headers.set(
        "X-RateLimit-Window",
        effectiveConfig.windowMs.toString(),
      );

      // Check if limit exceeded
      if (record.count > effectiveConfig.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - Date.now()) / 1000);
        c.res.headers.set("Retry-After", retryAfter.toString());

        return c.json(
          {
            success: false,
            error: "RATE_LIMIT_EXCEEDED",
            message: effectiveConfig.message || DEFAULT_CONFIG.message,
            retryAfter,
            limit: effectiveConfig.maxRequests,
            window: effectiveConfig.windowMs / 1000,
          },
          HTTP_STATUS.TOO_MANY_REQUESTS,
        );
      }

      await next();

      // Optional: skip counting successful requests if configured
      if (
        effectiveConfig.skipSuccessfulRequests
        && c.res.status < HTTP_STATUS.BAD_REQUEST
      ) {
        // Don't count this request (decrement)
        const currentRecord = store.get(key);
        if (currentRecord) {
          currentRecord.count = Math.max(0, currentRecord.count - 1);
        }
      }
    } catch (error) {
      logger.error("Rate limiting error", error, {
        endpoint: c.req.path,
        method: c.req.method,
        ip: c.req.header("CF-Connecting-IP")
          || c.req.header("X-Forwarded-For")
          || c.req.header("X-Real-IP")
          || "unknown",
        userAgent: c.req.header("User-Agent"),
      });
      // On error, allow the request to continue
      await next();
    }
  };
};

/**
 * Specific rate limiters for different use cases
 */
export const authRateLimit = rateLimitMiddleware({
  windowMs: TIME_CONSTANTS.FIFTEEN_MINUTES,
  maxRequests: REQUEST_LIMITS.AUTH_LOGIN,
  message: "Muitas tentativas de autenticação. Tente novamente em 15 minutos.",
});

export const apiRateLimit = rateLimitMiddleware({
  windowMs: TIME_CONSTANTS.MINUTE,
  maxRequests: REQUEST_LIMITS.API_DEFAULT,
  message: "Limite de requisições da API atingido.",
});

export const strictRateLimit = rateLimitMiddleware({
  windowMs: TIME_CONSTANTS.MINUTE,
  maxRequests: REQUEST_LIMITS.MODERATE,
  message: "Limite rigoroso atingido. Operação muito frequente.",
});

// Export store for testing and admin purposes
export { store as rateLimitStore };
