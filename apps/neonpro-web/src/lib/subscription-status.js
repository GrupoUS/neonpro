"use strict";
/**
 * Subscription Status Validation Utilities
 *
 * This module provides utilities for validating and managing user subscription status
 * with caching, performance optimization, and comprehensive error handling.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSubscriptionStatus = validateSubscriptionStatus;
exports.clearSubscriptionCache = clearSubscriptionCache;
exports.getCacheStats = getCacheStats;
exports.getPerformanceMetrics = getPerformanceMetrics;
exports.getPerformanceSummary = getPerformanceSummary;
exports.healthCheck = healthCheck;
var ssr_1 = require("@supabase/ssr");
var SubscriptionCache = /** @class */ (function () {
    function SubscriptionCache() {
        this.cache = new Map();
        this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
        this.GRACE_TTL = 30 * 1000; // 30 seconds for grace period
        this.ERROR_TTL = 30 * 1000; // 30 seconds for errors
    }
    SubscriptionCache.prototype.get = function (key) {
        var entry = this.cache.get(key);
        if (!entry)
            return null;
        if (entry.expires <= Date.now()) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    };
    SubscriptionCache.prototype.set = function (key, data, customTTL) {
        var ttl = this.DEFAULT_TTL;
        // Use shorter TTL for grace period and errors
        if (data.gracePeriod) {
            ttl = this.GRACE_TTL;
        }
        else if (!data.hasAccess && data.status === null) {
            ttl = this.ERROR_TTL;
        }
        else if (customTTL) {
            ttl = customTTL;
        }
        this.cache.set(key, {
            data: data,
            expires: Date.now() + ttl,
            created: Date.now()
        });
    };
    SubscriptionCache.prototype.clear = function (userIdPattern) {
        var _this = this;
        if (userIdPattern) {
            var pattern_1 = "subscription:".concat(userIdPattern);
            var keysToDelete_1 = [];
            this.cache.forEach(function (_, key) {
                if (key.startsWith(pattern_1)) {
                    keysToDelete_1.push(key);
                }
            });
            keysToDelete_1.forEach(function (key) { return _this.cache.delete(key); });
        }
        else {
            this.cache.clear();
        }
    };
    SubscriptionCache.prototype.getStats = function () {
        var now = Date.now();
        var entries = Array.from(this.cache.entries());
        var validEntries = entries.filter(function (_a) {
            var _ = _a[0], entry = _a[1];
            return entry.expires > now;
        });
        return {
            totalEntries: this.cache.size,
            validEntries: validEntries.length,
            expiredEntries: this.cache.size - validEntries.length,
            oldestEntry: entries.length > 0 ? Math.min.apply(Math, entries.map(function (_a) {
                var _ = _a[0], entry = _a[1];
                return entry.created;
            })) : null,
            newestEntry: entries.length > 0 ? Math.max.apply(Math, entries.map(function (_a) {
                var _ = _a[0], entry = _a[1];
                return entry.created;
            })) : null
        };
    };
    return SubscriptionCache;
}());
// Global cache instance
// Performance metrics collector
var performanceMetrics = [];
var MAX_METRICS_HISTORY = 1000;
function addPerformanceMetric(metric) {
    performanceMetrics.push(metric);
    if (performanceMetrics.length > MAX_METRICS_HISTORY) {
        performanceMetrics.shift();
    }
}
/**
 * Create Supabase client for subscription operations
 */
function createSubscriptionClient(request) {
    return (0, ssr_1.createServerClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        cookies: {
            get: function (name) {
                var _a;
                return (_a = request.cookies.get(name)) === null || _a === void 0 ? void 0 : _a.value;
            },
            set: function () {
                // No-op for middleware
            },
            remove: function () {
                // No-op for middleware
            },
        },
    });
}
/**
 * Validates user subscription status with comprehensive error handling and performance tracking
 */
function validateSubscriptionStatus(userId, request) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, cacheKey, cached, metric, supabase, _a, subscription, error, result_1, metric_1, result_2, metric_2, now, currentPeriodEnd, trialEnd, gracePeriodEnd, result, isTrialActive, expiresAt, isNearExpiry, metric, error_1, result, metric;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startTime = Date.now();
                    cacheKey = "subscription:".concat(userId);
                    cached = subscriptionCache.get(cacheKey);
                    if (cached) {
                        metric = {
                            validationTime: Date.now() - startTime,
                            cacheHit: true,
                            errorCount: 0,
                            source: 'cache',
                            timestamp: Date.now()
                        };
                        addPerformanceMetric(metric);
                        // Update performance data
                        cached.performance.validationTime = metric.validationTime;
                        cached.performance.cacheHit = true;
                        cached.performance.source = 'cache';
                        return [2 /*return*/, cached];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    supabase = createSubscriptionClient(request);
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions_view')
                            .select('*')
                            .eq('user_id', userId)
                            .maybeSingle()];
                case 2:
                    _a = _b.sent(), subscription = _a.data, error = _a.error;
                    if (error) {
                        console.error('Subscription validation error:', {
                            error: error.message,
                            userId: userId,
                            code: error.code,
                            timestamp: new Date().toISOString()
                        });
                        result_1 = {
                            hasAccess: false,
                            status: null,
                            subscription: null,
                            message: 'Unable to verify subscription status. Please try again.',
                            redirectTo: '/dashboard/subscription',
                            performance: {
                                validationTime: Date.now() - startTime,
                                cacheHit: false,
                                source: 'error'
                            }
                        };
                        metric_1 = {
                            validationTime: result_1.performance.validationTime,
                            cacheHit: false,
                            errorCount: 1,
                            source: 'error',
                            timestamp: Date.now()
                        };
                        addPerformanceMetric(metric_1);
                        // Cache error result for short period
                        subscriptionCache.set(cacheKey, result_1);
                        return [2 /*return*/, result_1];
                    }
                    // No subscription found
                    if (!subscription) {
                        result_2 = {
                            hasAccess: false,
                            status: null,
                            subscription: null,
                            message: 'No subscription found. Upgrade to access premium features.',
                            redirectTo: '/dashboard/subscription',
                            performance: {
                                validationTime: Date.now() - startTime,
                                cacheHit: false,
                                source: 'database'
                            }
                        };
                        metric_2 = {
                            validationTime: result_2.performance.validationTime,
                            cacheHit: false,
                            errorCount: 0,
                            source: 'database',
                            timestamp: Date.now()
                        };
                        addPerformanceMetric(metric_2);
                        subscriptionCache.set(cacheKey, result_2);
                        return [2 /*return*/, result_2];
                    }
                    now = new Date();
                    currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
                    trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
                    gracePeriodEnd = currentPeriodEnd ? new Date(currentPeriodEnd.getTime() + (3 * 24 * 60 * 60 * 1000)) : null;
                    result = void 0;
                    isTrialActive = trialEnd && trialEnd > now && subscription.status === 'trialing';
                    if (subscription.status === 'active' || isTrialActive) {
                        expiresAt = isTrialActive ? trialEnd : currentPeriodEnd;
                        isNearExpiry = expiresAt && (expiresAt.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000) // 7 days
                        ;
                        result = {
                            hasAccess: true,
                            status: subscription.status,
                            subscription: subscription,
                            message: isTrialActive
                                ? "Trial active until ".concat(expiresAt.toLocaleDateString())
                                : isNearExpiry
                                    ? "Subscription expires on ".concat(expiresAt.toLocaleDateString())
                                    : 'Subscription is active',
                            expiresAt: expiresAt,
                            trialActive: isTrialActive !== null && isTrialActive !== void 0 ? isTrialActive : undefined,
                            performance: {
                                validationTime: Date.now() - startTime,
                                cacheHit: false,
                                source: 'database'
                            }
                        };
                    }
                    else if (subscription.status === 'past_due' && gracePeriodEnd && gracePeriodEnd > now) {
                        // Grace period for past due
                        result = {
                            hasAccess: true,
                            status: subscription.status,
                            subscription: subscription,
                            message: 'Payment overdue. Please update your payment method to avoid service interruption.',
                            redirectTo: undefined,
                            gracePeriod: true,
                            expiresAt: gracePeriodEnd,
                            performance: {
                                validationTime: Date.now() - startTime,
                                cacheHit: false,
                                source: 'database'
                            }
                        };
                    }
                    else {
                        // Expired, cancelled, or invalid
                        result = {
                            hasAccess: false,
                            status: subscription.status,
                            subscription: subscription,
                            message: getStatusMessage(subscription.status),
                            redirectTo: '/dashboard/subscription',
                            expiresAt: currentPeriodEnd !== null && currentPeriodEnd !== void 0 ? currentPeriodEnd : undefined,
                            performance: {
                                validationTime: Date.now() - startTime,
                                cacheHit: false,
                                source: 'database'
                            }
                        };
                    }
                    metric = {
                        validationTime: result.performance.validationTime,
                        cacheHit: false,
                        errorCount: 0,
                        source: 'database',
                        timestamp: Date.now()
                    };
                    addPerformanceMetric(metric);
                    // Cache the result
                    subscriptionCache.set(cacheKey, result);
                    return [2 /*return*/, result];
                case 3:
                    error_1 = _b.sent();
                    console.error('Subscription validation failed:', {
                        error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                        userId: userId,
                        stack: error_1 instanceof Error ? error_1.stack : undefined,
                        timestamp: new Date().toISOString()
                    });
                    result = {
                        hasAccess: false,
                        status: null,
                        subscription: null,
                        message: 'Unable to verify subscription status. Please try again.',
                        redirectTo: '/dashboard/subscription',
                        performance: {
                            validationTime: Date.now() - startTime,
                            cacheHit: false,
                            source: 'error'
                        }
                    };
                    metric = {
                        validationTime: result.performance.validationTime,
                        cacheHit: false,
                        errorCount: 1,
                        source: 'error',
                        timestamp: Date.now()
                    };
                    addPerformanceMetric(metric);
                    // Cache error result for short period
                    subscriptionCache.set(cacheKey, result);
                    return [2 /*return*/, result];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get user-friendly message for subscription status
 */
function getStatusMessage(status) {
    switch (status) {
        case 'canceled':
            return 'Your subscription has been cancelled. Reactivate to continue accessing premium features.';
        case 'past_due':
            return 'Your subscription payment is overdue. Please update your payment method.';
        case 'unpaid':
            return 'Your subscription is unpaid. Please resolve payment issues to continue.';
        case 'incomplete':
            return 'Your subscription setup is incomplete. Please complete the payment process.';
        case 'incomplete_expired':
            return 'Your subscription setup has expired. Please start the subscription process again.';
        default:
            return 'Your subscription is not active. Please upgrade to access premium features.';
    }
}
/**
 * Clear subscription cache for specific user or all users
 */
function clearSubscriptionCache(userId) {
    subscriptionCache.clear(userId);
}
/**
 * Get cache statistics for monitoring
 */
function getCacheStats() {
    return subscriptionCache.getStats();
}
/**
 * Get performance metrics for monitoring
 */
function getPerformanceMetrics(limit) {
    var metrics = __spreadArray([], performanceMetrics, true).reverse(); // Most recent first
    return limit ? metrics.slice(0, limit) : metrics;
}
/**
 * Get performance summary
 */
function getPerformanceSummary() {
    if (performanceMetrics.length === 0) {
        return {
            totalValidations: 0,
            averageTime: 0,
            cacheHitRate: 0,
            errorRate: 0,
            recentMetrics: []
        };
    }
    var totalValidations = performanceMetrics.length;
    var averageTime = performanceMetrics.reduce(function (sum, m) { return sum + m.validationTime; }, 0) / totalValidations;
    var cacheHits = performanceMetrics.filter(function (m) { return m.cacheHit; }).length;
    var errors = performanceMetrics.reduce(function (sum, m) { return sum + m.errorCount; }, 0);
    return {
        totalValidations: totalValidations,
        averageTime: Math.round(averageTime * 100) / 100,
        cacheHitRate: Math.round((cacheHits / totalValidations) * 10000) / 100, // Percentage with 2 decimals
        errorRate: Math.round((errors / totalValidations) * 10000) / 100,
        recentMetrics: getPerformanceMetrics(10)
    };
}
/**
 * Health check for subscription validation system
 */
function healthCheck(request) {
    return __awaiter(this, void 0, void 0, function () {
        var performanceSummary, cacheStats, healthy;
        return __generator(this, function (_a) {
            performanceSummary = getPerformanceSummary();
            cacheStats = getCacheStats();
            healthy = performanceSummary.totalValidations === 0 || (performanceSummary.averageTime < 200 &&
                performanceSummary.errorRate < 5 &&
                (performanceSummary.totalValidations < 10 || performanceSummary.cacheHitRate > 60));
            return [2 /*return*/, {
                    healthy: healthy,
                    performanceSummary: performanceSummary,
                    cacheStats: cacheStats,
                    timestamp: Date.now()
                }];
        });
    });
}
