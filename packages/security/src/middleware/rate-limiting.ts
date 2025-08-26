import type { NextRequest } from 'next/server';

/**
 * Rate limiting configuration for healthcare API endpoints
 * Implements different limits based on endpoint sensitivity and user type
 */
// Constants for rate limiting calculations
const MILLISECONDS_PER_SECOND = 1000;
const BEARER_TOKEN_PREFIX_LENGTH = 7;
const TOKEN_DISPLAY_LENGTH = 8;
const PERCENTAGE_MULTIPLIER = 100;
const WARNING_THRESHOLD_PERCENTAGE = 80;
const CRITICAL_THRESHOLD_PERCENTAGE = 95;
export interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number;

  /** Time window in seconds */
  windowSeconds: number;

  /** Whether to include user ID in rate limit key */
  includeUserId?: boolean;

  /** Whether to include IP address in rate limit key */
  includeIpAddress?: boolean;

  /** Custom key suffix for specific endpoints */
  keySuffix?: string;

  /** Skip rate limiting for certain conditions */
  skipCondition?: (request: NextRequest) => boolean;
}

/**
 * Rate limit store interface
 * Allows different implementations (memory, Redis, database)
 */
export interface RateLimitStore {
  increment(
    key: string,
    windowSeconds: number,
  ): Promise<{ count: number; remaining: number; resetTime: number; }>;
  reset(key: string): Promise<void>;
}

/**
 * Memory-based rate limit store for development and small deployments
 * For production, use Redis or database-backed store
 */
export class MemoryRateLimitStore implements RateLimitStore {
  private readonly store = new Map<
    string,
    { count: number; resetTime: number; }
  >();

  increment(
    key: string,
    windowSeconds: number,
  ): Promise<{ count: number; remaining: number; resetTime: number; }> {
    const now = Date.now();
    const windowMs = windowSeconds * MILLISECONDS_PER_SECOND;

    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      // Create new window
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return Promise.resolve({ count: 1, remaining: 0, resetTime });
    }

    // Increment existing window
    existing.count++;
    this.store.set(key, existing);

    return Promise.resolve({
      count: existing.count,
      remaining: Math.max(
        0,
        windowMs - (now - (existing.resetTime - windowMs)),
      ),
      resetTime: existing.resetTime,
    });
  }

  reset(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  /**
   * Cleanup expired entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Default rate limiting configurations for different endpoint types
 */
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - stricter limits
  auth: {
    maxRequests: 5,
    windowSeconds: 300, // 5 minutes
    includeIpAddress: true,
    keySuffix: 'auth',
  } as RateLimitConfig,

  // Patient data access - moderate limits
  patientData: {
    maxRequests: 100,
    windowSeconds: 60, // 1 minute
    includeUserId: true,
    includeIpAddress: true,
    keySuffix: 'patient-data',
  } as RateLimitConfig,

  // General API endpoints - generous limits
  api: {
    maxRequests: 1000,
    windowSeconds: 60, // 1 minute
    includeUserId: true,
    keySuffix: 'api',
  } as RateLimitConfig,

  // File uploads - very strict limits
  uploads: {
    maxRequests: 10,
    windowSeconds: 60, // 1 minute
    includeUserId: true,
    includeIpAddress: true,
    keySuffix: 'uploads',
  } as RateLimitConfig,

  // Password reset - very strict limits
  passwordReset: {
    maxRequests: 3,
    windowSeconds: 3600, // 1 hour
    includeIpAddress: true,
    keySuffix: 'password-reset',
  } as RateLimitConfig,

  // LGPD data requests - strict limits
  lgpdRequests: {
    maxRequests: 5,
    windowSeconds: 3600, // 1 hour
    includeUserId: true,
    includeIpAddress: true,
    keySuffix: 'lgpd-requests',
  } as RateLimitConfig,
} as const;

/**
 * Rate limiting result
 */
export interface RateLimitResult {
  allowed: boolean;
  count: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Rate limiter class for healthcare API endpoints
 * Implements sliding window rate limiting with healthcare-specific configurations
 */
export class RateLimiter {
  private readonly store: RateLimitStore;

  constructor(store: RateLimitStore = new MemoryRateLimitStore()) {
    this.store = store;
  }

  /**
   * Check if request is within rate limits
   *
   * @param request - Incoming HTTP request
   * @param config - Rate limiting configuration
   * @returns Rate limiting result with allowed status and metadata
   */
  async checkRateLimit(
    request: NextRequest,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    // Check skip condition
    if (config.skipCondition?.(request)) {
      return {
        allowed: true,
        count: 0,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowSeconds * MILLISECONDS_PER_SECOND,
      };
    }

    // Build rate limit key
    const key = this.buildRateLimitKey(request, config);

    // Check current count
    const { count, resetTime } = await this.store.increment(
      key,
      config.windowSeconds,
    );

    const remaining = Math.max(0, config.maxRequests - count);
    const allowed = count <= config.maxRequests;

    const result: RateLimitResult = {
      allowed,
      count,
      remaining,
      resetTime,
    };

    // Add retry-after header for exceeded limits
    if (!allowed) {
      result.retryAfter = Math.ceil(
        (resetTime - Date.now()) / MILLISECONDS_PER_SECOND,
      );
    }

    return result;
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetRateLimit(
    request: NextRequest,
    config: RateLimitConfig,
  ): Promise<void> {
    const key = this.buildRateLimitKey(request, config);
    await this.store.reset(key);
  }

  /**
   * Build unique rate limit key based on request and configuration
   */
  private buildRateLimitKey(
    request: NextRequest,
    config: RateLimitConfig,
  ): string {
    const keyParts = ['rate-limit'];

    // Add key suffix if specified
    if (config.keySuffix) {
      keyParts.push(config.keySuffix);
    }

    // Add IP address if configured
    if (config.includeIpAddress) {
      const ip = this.getClientIP(request);
      keyParts.push(`ip:${ip}`);
    }

    // Add user ID if configured and available
    if (config.includeUserId) {
      const userId = this.getUserId(request);
      if (userId) {
        keyParts.push(`user:${userId}`);
      }
    }

    return keyParts.join(':');
  }

  /**
   * Extract client IP address from request
   * Handles various proxy scenarios for accurate IP detection
   */
  private getClientIP(request: NextRequest): string {
    // Check for Cloudflare CF-Connecting-IP
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Check for X-Forwarded-For (proxy chain)
    const xForwardedFor = request.headers.get('x-forwarded-for');
    if (xForwardedFor) {
      const ips = xForwardedFor.split(',');
      return ips[0].trim();
    }

    // Check for X-Real-IP
    const xRealIP = request.headers.get('x-real-ip');
    if (xRealIP) {
      return xRealIP;
    }

    // Fallback to unknown if no IP headers are present
    return 'unknown';
  }

  /**
   * Extract user ID from request
   * Can be from JWT token, session, or other authentication mechanism
   */
  private getUserId(request: NextRequest): string | null {
    // Try to get from Authorization header (JWT)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(BEARER_TOKEN_PREFIX_LENGTH);
        // In a real implementation, decode and validate JWT here
        // For now, return a placeholder
        return `jwt:${token.slice(0, TOKEN_DISPLAY_LENGTH)}`;
      } catch {
        return;
      }
    }

    // Try to get from session cookie
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie) {
      return `session:${sessionCookie.value.slice(0, TOKEN_DISPLAY_LENGTH)}`;
    }

    return;
  }
}

/**
 * Default rate limiter instance using memory store
 * For production, replace with Redis-backed store
 */
export const defaultRateLimiter = new RateLimiter();

/**
 * Rate limit enforcement levels for different alert thresholds
 */
export const RateLimitLevel = {
  /** Normal operation - no alerts */
  NORMAL: 'normal',
  /** Warning level - 80% of limit reached */
  WARNING: 'warning',
  /** Critical level - 95% of limit reached */
  CRITICAL: 'critical',
  /** Exceeded - limit has been exceeded */
  EXCEEDED: 'exceeded',
} as const;

export type RateLimitLevel = (typeof RateLimitLevel)[keyof typeof RateLimitLevel];

/**
 * Determine alert level based on current usage
 */
export function getRateLimitLevel(
  count: number,
  maxRequests: number,
): RateLimitLevel {
  const percentage = (count / maxRequests) * PERCENTAGE_MULTIPLIER;

  if (count > maxRequests) {
    return RateLimitLevel.EXCEEDED;
  }
  if (percentage >= CRITICAL_THRESHOLD_PERCENTAGE) {
    return RateLimitLevel.CRITICAL;
  }
  if (percentage >= WARNING_THRESHOLD_PERCENTAGE) {
    return RateLimitLevel.WARNING;
  }
  return RateLimitLevel.NORMAL;
}
