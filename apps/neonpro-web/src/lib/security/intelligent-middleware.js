"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreatDetection = exports.IntelligentRateLimit = void 0;
var lru_cache_1 = require("lru-cache");
// Cache para rate limiting (IP-based)
var rateLimitCache = new lru_cache_1.LRUCache({
    max: 10000, // 10k IPs max
    ttl: 60 * 60 * 1000, // 1 hour TTL
});
// Cache para detecção de comportamento suspeito
var securityCache = new lru_cache_1.LRUCache({
    max: 5000,
    ttl: 15 * 60 * 1000, // 15 minutes TTL
});
// Cache para IPs conhecidos como seguros (whitelist dinâmica)
var trustedIPsCache = new lru_cache_1.LRUCache({
    max: 1000,
    ttl: 24 * 60 * 60 * 1000, // 24 hours TTL
}); /**
 * Rate limiting inteligente baseado em comportamento
 */
var IntelligentRateLimit = /** @class */ (function () {
    function IntelligentRateLimit() {
    }
    IntelligentRateLimit.getKey = function (ip, route) {
        return "".concat(ip, ":").concat(route);
    };
    /**
     * 🚦 Check if request should be rate limited
     */
    IntelligentRateLimit.checkRateLimit = function (ip, route, limits) {
        var key = this.getKey(ip, route);
        var now = Date.now();
        var entry = rateLimitCache.get(key);
        if (!entry) {
            entry = {
                count: 1,
                firstRequest: now,
                blocked: false,
            };
            rateLimitCache.set(key, entry);
            return {
                allowed: true,
                remaining: limits.requests - 1,
                resetTime: now + limits.windowMs,
            };
        }
        // Check if block period has expired
        if (entry.blocked && entry.blockUntil && now > entry.blockUntil) {
            entry.blocked = false;
            entry.blockUntil = undefined;
            entry.count = 1;
            entry.firstRequest = now;
            rateLimitCache.set(key, entry);
        }
        // If still blocked, deny
        if (entry.blocked && entry.blockUntil) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.blockUntil,
                reason: "Rate limit exceeded, temporarily blocked",
            };
        }
        // Check if window has expired
        if (now - entry.firstRequest > limits.windowMs) {
            entry.count = 1;
            entry.firstRequest = now;
            rateLimitCache.set(key, entry);
            return {
                allowed: true,
                remaining: limits.requests - 1,
                resetTime: now + limits.windowMs,
            };
        }
        // Increment count
        entry.count++;
        // Check if limit exceeded
        if (entry.count > limits.requests) {
            entry.blocked = true;
            entry.blockUntil = now + (limits.blockDurationMs || 60000); // Default 1 minute block
            rateLimitCache.set(key, entry);
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.blockUntil,
                reason: "Rate limit exceeded",
            };
        }
        rateLimitCache.set(key, entry);
        return {
            allowed: true,
            remaining: limits.requests - entry.count,
            resetTime: entry.firstRequest + limits.windowMs,
        };
    };
    return IntelligentRateLimit;
}());
exports.IntelligentRateLimit = IntelligentRateLimit;
/**
 * 🔍 Threat Detection System
 */
var ThreatDetection = /** @class */ (function () {
    function ThreatDetection() {
    }
    /**
     * 🤖 Analyze request for suspicious patterns
     */
    ThreatDetection.analyzeSuspiciousActivity = function (ip, userAgent, route, method) {
        var riskScore = 0;
        var reasons = [];
        // Check for known bot patterns
        if (this.isBotUserAgent(userAgent)) {
            riskScore += 3;
            reasons.push("Bot user agent detected");
        }
        // Check for scanning behavior
        if (this.isScanningPattern(route)) {
            riskScore += 4;
            reasons.push("Route scanning detected");
        }
        // Check for suspicious request frequency
        var recentEvents = securityCache.get(ip) || [];
        var recentRequests = recentEvents.filter(function (e) {
            return Date.now() - e.timestamp < 10 * 1000;
        } // last 10 seconds
        );
        if (recentRequests.length > 20) {
            riskScore += 5;
            reasons.push("High request frequency");
        }
        // Check for diverse route access (potential reconnaissance)
        var uniqueRoutes = new Set(recentEvents.map(function (e) { return e.route; }));
        if (uniqueRoutes.size > 10) {
            riskScore += 3;
            reasons.push("Accessing many different routes");
        }
        return {
            suspicious: riskScore >= 5,
            reason: reasons.join(", "),
            riskScore: riskScore,
        };
    };
    /**
     * 🤖 Check if user agent indicates bot
     */
    ThreatDetection.isBotUserAgent = function (userAgent) {
        var botPatterns = [
            /bot|crawler|spider|scraper/i,
            /curl|wget|python-requests|go-http-client/i,
            /postman|insomnia|httpie/i,
        ];
        return botPatterns.some(function (pattern) { return pattern.test(userAgent); });
    };
    /**
     * 🔍 Check if route indicates scanning behavior
     */
    ThreatDetection.isScanningPattern = function (route) {
        var scanningPatterns = [
            /\.(php|asp|jsp|cgi)$/i,
            /\/admin|\/wp-admin|\/phpmyadmin/i,
            /\.env|\.git|backup|config\./i,
            /\/api\/[^\/]+\/[^\/]+\/[^\/]+/, // Deep API exploration
        ];
        return scanningPatterns.some(function (pattern) { return pattern.test(route); });
    };
    /**
     * 📝 Record security event
     */
    ThreatDetection.recordEvent = function (event) {
        var events = securityCache.get(event.ip) || [];
        events.push(event);
        // Keep only recent events to prevent memory bloat
        var recent = events.filter(function (e) { return Date.now() - e.timestamp < 15 * 60 * 1000; });
        securityCache.set(event.ip, recent);
    };
    return ThreatDetection;
}());
exports.ThreatDetection = ThreatDetection;
