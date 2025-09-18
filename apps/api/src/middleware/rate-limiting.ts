import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Rate limiting infrastructure for healthcare APIs
 *
 * Implements sliding window rate limiting with:
 * - Per-endpoint configuration
 * - Clinic IP allowlisting
 * - Healthcare workflow efficiency
 * - LGPD compliance logging
 * - Memory-based storage for development
 */

export interface RateLimitRule {
  /** Maximum requests per window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Healthcare workflow priority (emergency endpoints get higher limits) */
  priority?: 'emergency' | 'routine' | 'administrative';
  /** Skip rate limiting for specific roles */
  skipRoles?: string[];
  /** Custom error message for healthcare context */
  message?: string;
}

export interface RateLimitConfig {
  /** Default rate limit for unspecified endpoints */
  default: RateLimitRule;
  /** Per-endpoint rate limit overrides */
  endpoints: Record<string, RateLimitRule>;
  /** Allowlisted clinic IP addresses */
  allowlistedIPs?: string[];
  /** Enable audit logging for compliance */
  auditLogging?: boolean;
  /** Redis connection for production scaling */
  redisUrl?: string;
}

export interface RateLimitAttempt {
  /** Request timestamp */
  timestamp: number;
  /** Client IP address */
  ip: string;
  /** User ID if authenticated */
  userId?: string;
  /** Clinic ID for multi-tenant isolation */
  clinicId?: string;
  /** Endpoint being accessed */
  endpoint: string;
  /** Request method */
  method: string;
}

export interface RateLimitStatus {
  /** Current request count in window */
  currentRequests: number;
  /** Maximum allowed requests */
  maxRequests: number;
  /** Window start time */
  windowStart: number;
  /** Window duration in ms */
  windowMs: number;
  /** Remaining requests in current window */
  remainingRequests: number;
  /** Time until window reset (ms) */
  resetTime: number;
  /** Whether request is allowed */
  allowed: boolean;
}

/**
 * Healthcare-specific rate limiting configurations
 */
export const HEALTHCARE_RATE_LIMITS: Record<string, RateLimitRule> = {
  // Emergency endpoints - higher limits for critical care
  '/api/v1/emergency/': {
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1 minute
    priority: 'emergency',
    skipRoles: ['emergency_responder', 'physician_on_call'],
    message:
      'Emergency endpoint rate limit exceeded. Contact system administrator if this is a medical emergency.',
  },

  // Patient data access - moderate limits with audit logging
  '/api/v1/patients/': {
    maxRequests: 300,
    windowMs: 60 * 1000, // 1 minute
    priority: 'routine',
    message: 'Patient data access rate limit exceeded. This is logged for LGPD compliance.',
  },

  // Authentication endpoints - stricter limits to prevent brute force
  '/api/v1/auth/': {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    priority: 'administrative',
    message: 'Authentication rate limit exceeded. Account may be temporarily locked for security.',
  },

  // File upload endpoints - very strict limits for resource protection
  '/api/v1/files/upload': {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    priority: 'administrative',
    message:
      'File upload rate limit exceeded. Large files should be uploaded during off-peak hours.',
  },

  // AI inference endpoints - moderate limits to manage compute costs
  '/api/v1/ai/': {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    priority: 'routine',
    message: 'AI service rate limit exceeded. Consider batching requests for efficiency.',
  },

  // Reports and analytics - lower limits for resource-intensive operations
  '/api/v1/reports/': {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    priority: 'administrative',
    message: 'Report generation rate limit exceeded. Schedule large reports during off-peak hours.',
  },
};

/**
 * Default rate limiting configuration for healthcare platform
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    priority: 'routine',
    message: 'Rate limit exceeded. Please reduce request frequency.',
  },
  endpoints: HEALTHCARE_RATE_LIMITS,
  auditLogging: true,
  allowlistedIPs: [
    // Add clinic IP addresses here
    // '192.168.1.0/24', // Example clinic network
  ],
};

/**
 * In-memory storage for rate limiting data
 * Note: In production, use Redis for distributed rate limiting
 */
class MemoryRateLimitStore {
  private attempts: Map<string, RateLimitAttempt[]> = new Map();
  private readonly maxStorageTime = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get attempts for a specific key within the window
   */
  getAttempts(key: string, windowMs: number): RateLimitAttempt[] {
    const now = Date.now();
    const windowStart = now - windowMs;

    const allAttempts = this.attempts.get(key) || [];
    const validAttempts = allAttempts.filter(attempt => attempt.timestamp >= windowStart);

    // Update stored attempts to only keep valid ones
    this.attempts.set(key, validAttempts);

    return validAttempts;
  }

  /**
   * Record a new attempt
   */
  recordAttempt(key: string, attempt: RateLimitAttempt): void {
    const existing = this.attempts.get(key) || [];
    existing.push(attempt);
    this.attempts.set(key, existing);

    // Cleanup old attempts periodically
    this.cleanup();
  }

  /**
   * Clean up old attempts to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.maxStorageTime;

    for (const [key, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(attempt => attempt.timestamp >= cutoff);
      if (validAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, validAttempts);
      }
    }
  }

  /**
   * Get current statistics for monitoring
   */
  getStats(): { totalKeys: number; totalAttempts: number } {
    let totalAttempts = 0;
    for (const attempts of this.attempts.values()) {
      totalAttempts += attempts.length;
    }

    return {
      totalKeys: this.attempts.size,
      totalAttempts,
    };
  }
}

// Global rate limit store instance
const rateLimitStore = new MemoryRateLimitStore();

/**
 * Extract client IP address with proxy support
 */
function getClientIP(c: Context): string {
  // Check common proxy headers
  const xForwardedFor = c.req.header('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIP = c.req.header('x-real-ip');
  if (xRealIP) {
    return xRealIP;
  }

  // Fallback to connection IP (may not be available in all environments)
  return c.req.header('cf-connecting-ip') || '0.0.0.0';
}

/**
 * Check if IP is in allowlist
 */
function isIPAllowlisted(ip: string, allowlistedIPs: string[] = []): boolean {
  // Simple implementation - in production, use proper CIDR matching
  return allowlistedIPs.some(allowlistedIP => {
    if (allowlistedIP.includes('/')) {
      // CIDR notation - simplified check
      const [network] = allowlistedIP.split('/');
      return ip.startsWith(network.split('.').slice(0, 3).join('.'));
    }
    return ip === allowlistedIP;
  });
}

/**
 * Generate rate limit key for request grouping
 */
function generateRateLimitKey(c: Context, _rule: RateLimitRule): string {
  const ip = getClientIP(c);
  const path = c.req.path;
  const method = c.req.method;

  // Include user ID for authenticated requests
  const userId = c.get('userId') || 'anonymous';

  // Include clinic ID for multi-tenant isolation
  const clinicId = c.get('clinicId') || 'default';

  return `${ip}:${method}:${path}:${userId}:${clinicId}`;
}

/**
 * Check rate limit status for a request
 */
function checkRateLimit(c: Context, rule: RateLimitRule): RateLimitStatus {
  const key = generateRateLimitKey(c, rule);
  const now = Date.now();
  const windowStart = now - rule.windowMs;

  // Get current attempts in window
  const attempts = rateLimitStore.getAttempts(key, rule.windowMs);
  const currentRequests = attempts.length;

  return {
    currentRequests,
    maxRequests: rule.maxRequests,
    windowStart,
    windowMs: rule.windowMs,
    remainingRequests: Math.max(0, rule.maxRequests - currentRequests),
    resetTime: rule.windowMs - (now - windowStart),
    allowed: currentRequests < rule.maxRequests,
  };
}

/**
 * Record rate limit attempt for audit logging
 */
function recordAttempt(c: Context, rule: RateLimitRule, status: RateLimitStatus): void {
  const key = generateRateLimitKey(c, rule);
  const ip = getClientIP(c);

  const attempt: RateLimitAttempt = {
    timestamp: Date.now(),
    ip,
    userId: c.get('userId'),
    clinicId: c.get('clinicId'),
    endpoint: c.req.path,
    method: c.req.method,
  };

  rateLimitStore.recordAttempt(key, attempt);

  // Log for LGPD compliance if audit logging is enabled
  if (DEFAULT_RATE_LIMIT_CONFIG.auditLogging) {
    console.log('RATE_LIMIT_AUDIT', {
      timestamp: new Date().toISOString(),
      ip: attempt.ip,
      userId: attempt.userId,
      clinicId: attempt.clinicId,
      endpoint: attempt.endpoint,
      method: attempt.method,
      allowed: status.allowed,
      currentRequests: status.currentRequests,
      maxRequests: status.maxRequests,
      // Remove sensitive data for logging
      userAgent: c.req.header('user-agent')?.substring(0, 100),
    });
  }
}

/**
 * Get rate limit rule for endpoint
 */
function getRateLimitRule(endpoint: string, config: RateLimitConfig): RateLimitRule {
  // Find most specific matching endpoint rule
  const matchingEndpoint = Object.keys(config.endpoints)
    .sort((a, b) => b.length - a.length) // Longest match first
    .find(pattern => endpoint.startsWith(pattern));

  return matchingEndpoint ? config.endpoints[matchingEndpoint] : config.default;
}

/**
 * Rate limiting middleware factory
 */
export function rateLimitMiddleware(config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG) {
  return async (c: Context, next: Next) => {
    const ip = getClientIP(c);
    const endpoint = c.req.path;

    // Skip rate limiting for allowlisted IPs
    if (isIPAllowlisted(ip, config.allowlistedIPs)) {
      return next();
    }

    // Get applicable rate limit rule
    const rule = getRateLimitRule(endpoint, config);

    // Skip rate limiting for privileged roles
    const userRole = c.get('userRole');
    if (rule.skipRoles && userRole && rule.skipRoles.includes(userRole)) {
      return next();
    }

    // Check rate limit status
    const status = checkRateLimit(c, rule);

    // Record attempt for audit logging
    recordAttempt(c, rule, status);

    // Set rate limit headers
    c.header('X-RateLimit-Limit', rule.maxRequests.toString());
    c.header('X-RateLimit-Remaining', status.remainingRequests.toString());
    c.header('X-RateLimit-Reset', new Date(Date.now() + status.resetTime).toISOString());
    c.header('X-RateLimit-Window', rule.windowMs.toString());

    // Check if request is allowed
    if (!status.allowed) {
      // Enhanced error response for healthcare context
      const errorResponse = {
        error: 'RATE_LIMIT_EXCEEDED',
        message: rule.message || 'Rate limit exceeded',
        details: {
          maxRequests: rule.maxRequests,
          windowMs: rule.windowMs,
          resetTime: new Date(Date.now() + status.resetTime).toISOString(),
          priority: rule.priority,
          endpoint: endpoint,
        },
        // Healthcare-specific guidance
        guidance: rule.priority === 'emergency'
          ? 'If this is a medical emergency, contact emergency services immediately'
          : 'Consider reducing request frequency or contact system administrator',
        // Compliance information
        compliance: {
          logged: config.auditLogging,
          standard: 'LGPD-Article-33-Security-Measures',
        },
      };

      throw new HTTPException(429, {
        message: JSON.stringify(errorResponse),
        cause: 'Rate limit exceeded',
      });
    }

    // Add rate limit context to request
    c.set('rateLimitStatus', status);
    c.set('rateLimitRule', rule);

    return next();
  };
}

/**
 * Get current rate limit statistics for monitoring
 */
export function getRateLimitStats(): {
  store: { totalKeys: number; totalAttempts: number };
  config: { endpointCount: number; auditLogging: boolean };
} {
  return {
    store: rateLimitStore.getStats(),
    config: {
      endpointCount: Object.keys(DEFAULT_RATE_LIMIT_CONFIG.endpoints).length,
      auditLogging: DEFAULT_RATE_LIMIT_CONFIG.auditLogging || false,
    },
  };
}

/**
 * Reset rate limits for testing purposes
 */
export function resetRateLimits(): void {
  (rateLimitStore as any).attempts.clear();
}
