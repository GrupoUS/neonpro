/**
 * Memory-based Rate Limiter Implementation
 * Simple in-memory rate limiting for development and small-scale production
 */

import {
  RATE_LIMIT_CONFIGS,
  RATE_LIMIT_WHITELIST,
  type RateLimitConfig,
  USER_ROLE_LIMITS,
} from './config';

type RateLimitEntry = {
  count: number;
  resetTime: number;
  blocked?: boolean;
  blockUntil?: number;
};

type RateLimitStore = {
  [key: string]: RateLimitEntry;
};

/**
 * In-memory rate limit store
 * Note: This will reset on server restart. Use Redis for production.
 */
const rateLimitStore: RateLimitStore = {};

/**
 * Memory-based rate limiter class
 */
export class MemoryRateLimiter {
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Check if request should be rate limited
   */
  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;

    // Get or create rate limit entry
    let entry = rateLimitStore[key];

    if (!entry || now >= entry.resetTime) {
      // Create new window
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      rateLimitStore[key] = entry;
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
      };
    }

    // Remove block if expired
    if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
      entry.blocked = false;
      entry.blockUntil = undefined;
    }

    // Check rate limit
    if (entry.count >= config.maxRequests) {
      // Block for additional time if repeatedly hitting limit
      entry.blocked = true;
      entry.blockUntil = now + config.windowMs * 2; // Block for 2x window

      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil(config.windowMs / 1000),
      };
    }

    // Allow request and increment counter
    entry.count++;
    rateLimitStore[key] = entry;

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get rate limit configuration for endpoint and user
   */
  getRateLimitConfig(endpoint: string, userRole?: string): RateLimitConfig {
    // Get base config
    const baseConfig =
      RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS.default;

    // Apply role-based multiplier
    if (userRole && USER_ROLE_LIMITS[userRole]) {
      const roleConfig = USER_ROLE_LIMITS[userRole];
      return {
        ...baseConfig,
        maxRequests: Math.floor(baseConfig.maxRequests * roleConfig.multiplier),
      };
    }

    return baseConfig;
  }

  /**
   * Check if IP is whitelisted
   */
  isWhitelisted(ip: string): boolean {
    return RATE_LIMIT_WHITELIST.includes(ip);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    for (const key in rateLimitStore) {
      const entry = rateLimitStore[key];

      // Remove expired entries
      if (
        now >= entry.resetTime &&
        (!entry.blockUntil || now >= entry.blockUntil)
      ) {
        delete rateLimitStore[key];
      }
    }
  }

  /**
   * Manually reset rate limit for identifier
   */
  async resetRateLimit(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`;
    delete rateLimitStore[key];
  }

  /**
   * Get current rate limit status
   */
  async getRateLimitStatus(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<{
    limit: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
  }> {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;
    const entry = rateLimitStore[key];

    if (!entry || now >= entry.resetTime) {
      return {
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    return {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      blocked: entry.blocked,
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global rate limiter instance
export const rateLimiter = new MemoryRateLimiter();

/**
 * Helper function to create rate limit identifier
 */
export function createRateLimitIdentifier(
  ip: string,
  userId?: string,
  endpoint?: string,
): string {
  const parts = [ip];

  if (userId) {
    parts.push(`user:${userId}`);
  }

  if (endpoint) {
    parts.push(`endpoint:${endpoint}`);
  }

  return parts.join(':');
}
