"use strict";
/**
 * Rate Limiting Logic for Security
 * Advanced rate limiting with adaptive thresholds
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitLogic = void 0;
// In-memory cache for rate limiting
var rateLimitCache = new Map();
var RateLimitLogic = /** @class */ (function () {
    function RateLimitLogic() {
    }
    /**
     * Check if request is allowed based on rate limits
     */
    RateLimitLogic.checkRateLimit = function (identifier, route, method) {
        var key = "".concat(identifier, ":").concat(route, ":").concat(method);
        var now = Date.now();
        var limits = this.getAdaptiveLimits(route, method);
        // Get or create entry
        var entry = rateLimitCache.get(key);
        if (!entry) {
            entry = {
                count: 0,
                firstRequest: now,
                blocked: false
            };
        }
        // Check if window has expired
        if (now - entry.firstRequest > limits.windowMs) {
            entry = {
                count: 0,
                firstRequest: now,
                blocked: false
            };
        }
        // Check if still blocked
        if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.blockUntil,
                reason: "Currently blocked due to rate limit violation"
            };
        }
        // Reset block status if block period has expired
        if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
            entry.blocked = false;
            entry.blockUntil = undefined;
            entry.count = 0;
            entry.firstRequest = now;
        }
        // Increment count
        entry.count++;
        rateLimitCache.set(key, entry);
        // Check if limit exceeded
        if (entry.count > limits.requests) {
            entry.blocked = true;
            entry.blockUntil = now + (limits.blockDurationMs || limits.windowMs);
            rateLimitCache.set(key, entry);
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.blockUntil,
                reason: "Rate limit exceeded",
            };
        }
        return {
            allowed: true,
            remaining: limits.requests - entry.count,
            resetTime: entry.firstRequest + limits.windowMs,
        };
    };
    /**
     * 🤖 Adaptive limits based on route sensitivity
     */
    RateLimitLogic.getAdaptiveLimits = function (route, method) {
        // High sensitivity routes (auth, payments)
        if (route.includes('/auth') || route.includes('/payment')) {
            return {
                requests: method === 'POST' ? 5 : 15, // Very restrictive
                windowMs: 60 * 1000, // 1 minute
                blockDurationMs: 5 * 60 * 1000, // 5 minutes block
            };
        }
        // API routes (moderate sensitivity)
        if (route.startsWith('/api/')) {
            return {
                requests: method === 'POST' ? 30 : 100,
                windowMs: 60 * 1000, // 1 minute
                blockDurationMs: 2 * 60 * 1000, // 2 minutes block
            };
        }
        // Static/public routes (low sensitivity)
        return {
            requests: 200,
            windowMs: 60 * 1000, // 1 minute
            blockDurationMs: 30 * 1000, // 30 seconds block
        };
    };
    /**
     * Clear rate limit cache (for testing or admin purposes)
     */
    RateLimitLogic.clearCache = function () {
        rateLimitCache.clear();
    };
    /**
     * Get current cache stats
     */
    RateLimitLogic.getCacheStats = function () {
        return {
            size: rateLimitCache.size,
            entries: Array.from(rateLimitCache.entries()).map(function (_a) {
                var key = _a[0], entry = _a[1];
                return ({ key: key, entry: entry });
            })
        };
    };
    return RateLimitLogic;
}());
exports.RateLimitLogic = RateLimitLogic;
