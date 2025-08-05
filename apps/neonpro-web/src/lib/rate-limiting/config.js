"use strict";
/**
 * Rate Limiting Configuration for NeonPro
 * Configures rate limits for different API endpoints and user types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_HEADERS =
  exports.RATE_LIMIT_MESSAGES =
  exports.RATE_LIMIT_WHITELIST =
  exports.USER_ROLE_LIMITS =
  exports.RATE_LIMIT_CONFIGS =
    void 0;
/**
 * Rate limiting configurations for different endpoints
 */
exports.RATE_LIMIT_CONFIGS = {
  // Analytics endpoints - higher limits for dashboard data
  analytics: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    skipSuccessfulRequests: false,
  },
  // Trial management - moderate limits
  "trial-management": {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50, // 50 requests per minute
    skipSuccessfulRequests: false,
  },
  // Auth endpoints - strict limits to prevent brute force
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true,
  },
  // WebSocket connection attempts - prevent connection flooding
  websocket: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 connection attempts per minute
    skipSuccessfulRequests: true,
  },
  // General API endpoints
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    skipSuccessfulRequests: false,
  },
  // Admin endpoints - higher limits for management operations
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests per minute
    skipSuccessfulRequests: false,
  },
};
exports.USER_ROLE_LIMITS = {
  admin: {
    multiplier: 3, // 3x the base limits
    additionalEndpoints: ["admin", "analytics", "trial-management"],
  },
  clinic_owner: {
    multiplier: 2, // 2x the base limits
    additionalEndpoints: ["analytics", "trial-management"],
  },
  staff: {
    multiplier: 1.5, // 1.5x the base limits
    additionalEndpoints: ["analytics"],
  },
  patient: {
    multiplier: 1, // Base limits
    additionalEndpoints: [],
  },
  trial_user: {
    multiplier: 0.5, // Reduced limits for trial users
    additionalEndpoints: [],
  },
};
/**
 * IP whitelist for rate limiting exemptions
 */
exports.RATE_LIMIT_WHITELIST = [
  "127.0.0.1",
  "::1",
  // Add trusted IPs here
];
/**
 * Response messages for rate limiting
 */
exports.RATE_LIMIT_MESSAGES = {
  EXCEEDED: "Rate limit exceeded. Please try again later.",
  BLOCKED: "Too many requests from this IP. Access temporarily blocked.",
  INVALID_TOKEN: "Invalid or expired authentication token.",
  UNAUTHORIZED: "Authentication required for this endpoint.",
};
/**
 * Headers to include in rate limit responses
 */
exports.RATE_LIMIT_HEADERS = {
  LIMIT: "X-RateLimit-Limit",
  REMAINING: "X-RateLimit-Remaining",
  RESET: "X-RateLimit-Reset",
  RETRY_AFTER: "Retry-After",
};
