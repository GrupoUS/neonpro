"use strict";
/**
 * Enhanced Subscription Middleware v2 - Performance Optimized
 *
 * Advanced subscription middleware with performance optimizations:
 * - Intelligent caching with adaptive TTL
 * - Request batching and deduplication
 * - Performance monitoring and alerting
 * - Circuit breaker pattern for resilience
 * - Parallel processing where possible
 * - Memory-efficient route matching
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Performance Optimized
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedSubscriptionMiddleware = enhancedSubscriptionMiddleware;
exports.getMiddlewarePerformanceStats = getMiddlewarePerformanceStats;
exports.resetCircuitBreaker = resetCircuitBreaker;
var ssr_1 = require("@supabase/ssr");
var server_1 = require("next/server");
var subscription_cache_enhanced_1 = require("../lib/subscription-cache-enhanced");
var subscription_performance_monitor_1 = require("../lib/subscription-performance-monitor");
var subscription_query_optimizer_1 = require("../lib/subscription-query-optimizer");
var defaultConfig = {
    enableCaching: true,
    cacheStrategy: 'adaptive',
    enableBatching: true,
    batchTimeout: 100,
    circuitBreaker: {
        enabled: true,
        failureThreshold: 10,
        recoveryTimeout: 30000,
    },
    monitoring: {
        enabled: true,
        sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        slowRequestThreshold: 500,
    },
    routeOptimization: {
        precompileRoutes: true,
        enableRegexCaching: true,
        maxCacheSize: 1000,
    },
};
// Route patterns cache for performance
var routePatternsCache = new Map();
var routeMatchCache = new Map();
// Circuit breaker state
var circuitBreakerState = 'closed';
var circuitBreakerFailures = 0;
var lastFailureTime = 0;
// Request batching
var pendingRequests = new Map();
var requestBatches = new Map();
var requestMetrics = [];
/**
 * Enhanced subscription middleware with performance optimizations
 */
function enhancedSubscriptionMiddleware(req_1) {
    return __awaiter(this, arguments, void 0, function (req, config) {
        var mergedConfig, startTime, pathname, method, timerId, _a, user, sessionValidationResult, routeProtection, subscriptionResult, hasAccess, duration, response, error_1, duration;
        var _b;
        if (config === void 0) { config = {}; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    mergedConfig = __assign(__assign({}, defaultConfig), config);
                    startTime = performance.now();
                    pathname = req.nextUrl.pathname;
                    method = req.method;
                    timerId = subscription_performance_monitor_1.subscriptionPerformanceMonitor.startTimer("middleware_".concat(pathname));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    // Fast path for public routes
                    if (isPublicRoute(pathname)) {
                        return [2 /*return*/, server_1.NextResponse.next()];
                    }
                    // Circuit breaker check
                    if (circuitBreakerState === 'open') {
                        if (Date.now() - lastFailureTime > mergedConfig.circuitBreaker.recoveryTimeout) {
                            circuitBreakerState = 'half-open';
                        }
                        else {
                            return [2 /*return*/, createErrorResponse('Service temporarily unavailable', 503)];
                        }
                    }
                    return [4 /*yield*/, getCachedUserSession(req, mergedConfig)];
                case 2:
                    _a = _c.sent(), user = _a.user, sessionValidationResult = _a.sessionValidationResult;
                    if (!user) {
                        return [2 /*return*/, redirectToLogin(req)];
                    }
                    return [4 /*yield*/, getRouteProtection(pathname, mergedConfig)];
                case 3:
                    routeProtection = _c.sent();
                    if (!routeProtection.requiresSubscription) {
                        return [2 /*return*/, server_1.NextResponse.next()];
                    }
                    return [4 /*yield*/, getOptimizedSubscriptionStatus(user.id, pathname, mergedConfig)
                        // Validate access
                    ];
                case 4:
                    subscriptionResult = _c.sent();
                    return [4 /*yield*/, validateRouteAccess(subscriptionResult, routeProtection, user, mergedConfig)
                        // Record performance metrics
                    ];
                case 5:
                    hasAccess = _c.sent();
                    duration = performance.now() - startTime;
                    recordRequestMetrics({
                        path: pathname,
                        method: method,
                        duration: duration,
                        cacheHit: ((_b = subscriptionResult.performance) === null || _b === void 0 ? void 0 : _b.cacheHit) || false,
                        status: hasAccess ? 200 : 403,
                        timestamp: Date.now(),
                        userId: user.id,
                    }, mergedConfig);
                    // Handle access result
                    if (!hasAccess) {
                        return [2 /*return*/, createAccessDeniedResponse(subscriptionResult, routeProtection)];
                    }
                    response = server_1.NextResponse.next();
                    addSubscriptionHeaders(response, subscriptionResult, user);
                    // Performance monitoring end
                    subscription_performance_monitor_1.subscriptionPerformanceMonitor.endTimer(timerId, true);
                    return [2 /*return*/, response];
                case 6:
                    error_1 = _c.sent();
                    duration = performance.now() - startTime;
                    // Handle circuit breaker
                    handleCircuitBreakerFailure(error_1, mergedConfig);
                    // Record error metrics
                    recordRequestMetrics({
                        path: pathname,
                        method: method,
                        duration: duration,
                        cacheHit: false,
                        status: 500,
                        timestamp: Date.now(),
                    }, mergedConfig);
                    // Performance monitoring end with error
                    subscription_performance_monitor_1.subscriptionPerformanceMonitor.endTimer(timerId, false);
                    console.error('Enhanced subscription middleware error:', error_1);
                    return [2 /*return*/, createErrorResponse('Authentication error', 500)];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if route is public (no auth required)
 */
function isPublicRoute(pathname) {
    var publicRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/api/auth',
        '/api/webhooks',
        '/_next',
        '/favicon.ico',
        '/robots.txt',
        '/sitemap.xml',
    ];
    return publicRoutes.some(function (route) { return pathname.startsWith(route); });
}
/**
 * Get cached user session with optimization
 */
function getCachedUserSession(req, config) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, cached, supabase, _a, user, error, sessionData, cacheData;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cacheKey = "session_".concat(req.headers.get('authorization') || 'anonymous');
                    if (!config.enableCaching) return [3 /*break*/, 2];
                    return [4 /*yield*/, subscription_cache_enhanced_1.enhancedSubscriptionCache.get(cacheKey)];
                case 1:
                    cached = _b.sent();
                    if (cached && cached.sessionData) {
                        return [2 /*return*/, cached.sessionData];
                    }
                    _b.label = 2;
                case 2:
                    supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
                        cookies: {
                            getAll: function () {
                                return req.cookies.getAll();
                            },
                            setAll: function () {
                                // No-op for middleware
                            },
                        },
                    });
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    _a = _b.sent(), user = _a.data.user, error = _a.error;
                    sessionData = { user: user, sessionValidationResult: { error: error } };
                    if (!(config.enableCaching && user)) return [3 /*break*/, 5];
                    cacheData = {
                        hasAccess: true,
                        status: 'active',
                        subscription: null,
                        message: 'Session cached',
                        performance: {
                            validationTime: 0,
                            cacheHit: false,
                            source: 'database'
                        },
                        sessionData: sessionData
                    };
                    return [4 /*yield*/, subscription_cache_enhanced_1.enhancedSubscriptionCache.set(cacheKey, cacheData, 60000)]; // 1 minute cache
                case 4:
                    _b.sent(); // 1 minute cache
                    _b.label = 5;
                case 5: return [2 /*return*/, sessionData];
            }
        });
    });
}
/**
 * Get route protection configuration with caching
 */
function getRouteProtection(pathname, config) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, cached, protectedRoutes, routeProtection, _i, protectedRoutes_1, route, entries, toDelete;
        return __generator(this, function (_a) {
            cacheKey = "route_protection_".concat(pathname);
            if (config.routeOptimization.enableRegexCaching) {
                cached = routeMatchCache.get(cacheKey);
                if (cached) {
                    return [2 /*return*/, JSON.parse(cached)];
                }
            }
            protectedRoutes = [
                {
                    pattern: /^\/dashboard\/patients/,
                    requiresSubscription: true,
                    requiredTier: 'basic',
                    permissions: ['patients:read']
                },
                {
                    pattern: /^\/dashboard\/appointments/,
                    requiresSubscription: true,
                    requiredTier: 'basic',
                    permissions: ['appointments:read']
                },
                {
                    pattern: /^\/dashboard\/analytics/,
                    requiresSubscription: true,
                    requiredTier: 'pro',
                    permissions: ['analytics:read']
                },
                {
                    pattern: /^\/dashboard\/billing/,
                    requiresSubscription: true,
                    requiredTier: 'basic',
                    permissions: ['billing:read']
                },
                {
                    pattern: /^\/dashboard\/settings/,
                    requiresSubscription: false,
                    permissions: ['settings:read']
                },
                {
                    pattern: /^\/api\/patients/,
                    requiresSubscription: true,
                    requiredTier: 'basic',
                    permissions: ['patients:write']
                }
            ];
            routeProtection = { requiresSubscription: false };
            for (_i = 0, protectedRoutes_1 = protectedRoutes; _i < protectedRoutes_1.length; _i++) {
                route = protectedRoutes_1[_i];
                if (route.pattern.test(pathname)) {
                    routeProtection = {
                        requiresSubscription: route.requiresSubscription,
                        requiredTier: route.requiredTier,
                        permissions: route.permissions
                    };
                    break;
                }
            }
            // Cache result if enabled
            if (config.routeOptimization.enableRegexCaching) {
                if (routeMatchCache.size > config.routeOptimization.maxCacheSize) {
                    entries = Array.from(routeMatchCache.entries());
                    toDelete = entries.slice(0, Math.floor(entries.length * 0.2));
                    toDelete.forEach(function (_a) {
                        var key = _a[0];
                        return routeMatchCache.delete(key);
                    });
                }
                routeMatchCache.set(cacheKey, JSON.stringify(routeProtection));
            }
            return [2 /*return*/, routeProtection];
        });
    });
}
/**
 * Get optimized subscription status with batching and caching
 */
function getOptimizedSubscriptionStatus(userId, pathname, config) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, pendingRequest, requestPromise, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cacheKey = "subscription_".concat(userId);
                    pendingRequest = pendingRequests.get(userId);
                    if (pendingRequest) {
                        return [2 /*return*/, pendingRequest];
                    }
                    // Check if we should use batching
                    if (config.enableBatching) {
                        return [2 /*return*/, getBatchedSubscriptionStatus(userId, config)];
                    }
                    requestPromise = subscription_query_optimizer_1.subscriptionQueryOptimizer.getSubscriptionStatus(userId, {
                        useCache: config.enableCaching,
                        cacheTTL: getCacheTTL(config.cacheStrategy, pathname),
                        priority: getRequestPriority(pathname),
                    });
                    pendingRequests.set(userId, requestPromise);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, requestPromise];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 3:
                    pendingRequests.delete(userId);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get batched subscription status to reduce database load
 */
function getBatchedSubscriptionStatus(userId, config) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var batchKey = 'subscription_batch';
                    var batch = requestBatches.get(batchKey);
                    if (!batch) {
                        batch = [];
                        requestBatches.set(batchKey, batch);
                        // Schedule batch execution
                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            var currentBatch, userIds, results_1, error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        currentBatch = requestBatches.get(batchKey);
                                        if (!currentBatch || currentBatch.length === 0)
                                            return [2 /*return*/];
                                        requestBatches.delete(batchKey);
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        userIds = currentBatch.map(function (item) { return item.userId; });
                                        return [4 /*yield*/, subscription_query_optimizer_1.subscriptionQueryOptimizer.getBatchSubscriptionStatus(userIds, {
                                                useCache: config.enableCaching,
                                                batch: true,
                                            })
                                            // Resolve all pending requests
                                        ];
                                    case 2:
                                        results_1 = _a.sent();
                                        // Resolve all pending requests
                                        currentBatch.forEach(function (_a) {
                                            var batchUserId = _a.userId, batchResolve = _a.resolve;
                                            var result = results_1.get(batchUserId);
                                            if (result) {
                                                batchResolve(result);
                                            }
                                            else {
                                                batchResolve({
                                                    hasAccess: false,
                                                    status: null,
                                                    subscription: null,
                                                    message: 'No subscription found',
                                                    performance: {
                                                        validationTime: 0,
                                                        cacheHit: false,
                                                        source: 'database'
                                                    }
                                                });
                                            }
                                        });
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_2 = _a.sent();
                                        // Reject all pending requests
                                        currentBatch.forEach(function (_a) {
                                            var batchReject = _a.reject;
                                            batchReject(error_2);
                                        });
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }, config.batchTimeout);
                    }
                    batch.push({ userId: userId, resolve: resolve, reject: reject });
                })];
        });
    });
}
/**
 * Calculate cache TTL based on strategy
 */
function getCacheTTL(strategy, pathname) {
    switch (strategy) {
        case 'aggressive':
            return 600000; // 10 minutes
        case 'conservative':
            return 60000; // 1 minute
        case 'adaptive':
            // Adaptive TTL based on route criticality
            if (pathname.includes('/api/'))
                return 120000; // 2 minutes for API
            if (pathname.includes('/analytics'))
                return 300000; // 5 minutes for analytics
            if (pathname.includes('/dashboard'))
                return 180000; // 3 minutes for dashboard
            return 240000; // 4 minutes default
        default:
            return 180000; // 3 minutes default
    }
}
/**
 * Get request priority based on pathname
 */
function getRequestPriority(pathname) {
    if (pathname.includes('/api/'))
        return 'high';
    if (pathname.includes('/dashboard/patients'))
        return 'high';
    if (pathname.includes('/dashboard/appointments'))
        return 'high';
    if (pathname.includes('/dashboard/analytics'))
        return 'medium';
    return 'low';
}
/**
 * Validate route access based on subscription and requirements
 */
function validateRouteAccess(subscriptionResult, routeProtection, user, config) {
    return __awaiter(this, void 0, void 0, function () {
        var userTier, requiredTier, tierHierarchy, userTierIndex, requiredTierIndex;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            // Basic access check
            if (!subscriptionResult.hasAccess) {
                return [2 /*return*/, false];
            }
            // Check tier requirements
            if (routeProtection.requiredTier) {
                userTier = ((_c = (_b = (_a = subscriptionResult.subscription) === null || _a === void 0 ? void 0 : _a.plan) === null || _b === void 0 ? void 0 : _b.name) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || 'free';
                requiredTier = routeProtection.requiredTier.toLowerCase();
                tierHierarchy = ['free', 'basic', 'pro', 'enterprise'];
                userTierIndex = tierHierarchy.indexOf(userTier);
                requiredTierIndex = tierHierarchy.indexOf(requiredTier);
                if (userTierIndex < requiredTierIndex) {
                    return [2 /*return*/, false];
                }
            }
            // Check specific permissions (placeholder for future implementation)
            if (routeProtection.permissions && routeProtection.permissions.length > 0) {
                // This would check user permissions from database or JWT
                // For now, we'll assume users with active subscriptions have all permissions
                return [2 /*return*/, subscriptionResult.hasAccess];
            }
            return [2 /*return*/, true];
        });
    });
}
/**
 * Handle circuit breaker failures
 */
function handleCircuitBreakerFailure(error, config) {
    if (!config.circuitBreaker.enabled)
        return;
    circuitBreakerFailures++;
    lastFailureTime = Date.now();
    if (circuitBreakerFailures >= config.circuitBreaker.failureThreshold) {
        circuitBreakerState = 'open';
        console.warn("Circuit breaker opened after ".concat(circuitBreakerFailures, " failures"));
    }
}
/**
 * Record request metrics for monitoring
 */
function recordRequestMetrics(metrics, config) {
    if (!config.monitoring.enabled)
        return;
    // Sample requests in production
    if (Math.random() > config.monitoring.sampleRate)
        return;
    requestMetrics.push(metrics);
    // Alert on slow requests
    if (metrics.duration > config.monitoring.slowRequestThreshold) {
        console.warn("Slow request detected: ".concat(metrics.path, " took ").concat(metrics.duration, "ms"));
    }
    // Keep only recent metrics
    if (requestMetrics.length > 10000) {
        requestMetrics.splice(0, requestMetrics.length - 5000);
    }
    // Record in performance monitor
    subscription_performance_monitor_1.subscriptionPerformanceMonitor.recordRealtimeOperation(metrics.duration, requestMetrics.length);
}
/**
 * Create error response
 */
function createErrorResponse(message, status) {
    return server_1.NextResponse.json({ error: message }, { status: status });
}
/**
 * Redirect to login
 */
function redirectToLogin(req) {
    var redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return server_1.NextResponse.redirect(redirectUrl);
}
/**
 * Create access denied response
 */
function createAccessDeniedResponse(subscriptionResult, routeProtection) {
    var _a, _b, _c, _d;
    var upgradeNeeded = routeProtection.requiredTier &&
        (!((_b = (_a = subscriptionResult.subscription) === null || _a === void 0 ? void 0 : _a.plan) === null || _b === void 0 ? void 0 : _b.name) ||
            getTierLevel(subscriptionResult.subscription.plan.name) < getTierLevel(routeProtection.requiredTier));
    return server_1.NextResponse.json({
        error: 'Access denied',
        message: subscriptionResult.message,
        upgradeNeeded: upgradeNeeded,
        requiredTier: routeProtection.requiredTier,
        currentTier: ((_d = (_c = subscriptionResult.subscription) === null || _c === void 0 ? void 0 : _c.plan) === null || _d === void 0 ? void 0 : _d.name) || 'free',
    }, { status: 403 });
}
/**
 * Get tier level for comparison
 */
function getTierLevel(tier) {
    var levels = { 'free': 0, 'basic': 1, 'pro': 2, 'enterprise': 3 };
    return levels[tier.toLowerCase()] || 0;
}
/**
 * Add subscription headers for downstream consumption
 */
function addSubscriptionHeaders(response, subscriptionResult, user) {
    var _a, _b;
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-subscription-status', subscriptionResult.status || 'unknown');
    response.headers.set('x-subscription-tier', ((_b = (_a = subscriptionResult.subscription) === null || _a === void 0 ? void 0 : _a.plan) === null || _b === void 0 ? void 0 : _b.name) || 'free');
    response.headers.set('x-has-access', subscriptionResult.hasAccess.toString());
    if (subscriptionResult.gracePeriod) {
        response.headers.set('x-grace-period', 'true');
    }
    if (subscriptionResult.performance) {
        response.headers.set('x-cache-hit', subscriptionResult.performance.cacheHit.toString());
        response.headers.set('x-validation-time', subscriptionResult.performance.validationTime.toString());
    }
}
/**
 * Get performance statistics
 */
function getMiddlewarePerformanceStats() {
    var totalRequests = requestMetrics.length;
    var averageResponseTime = requestMetrics.reduce(function (sum, m) { return sum + m.duration; }, 0) / totalRequests || 0;
    var cacheHits = requestMetrics.filter(function (m) { return m.cacheHit; }).length;
    var cacheHitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;
    var slowRequestCount = requestMetrics.filter(function (m) { return m.duration > 500; }).length;
    // Calculate top slow paths
    var pathStats = new Map();
    requestMetrics.forEach(function (metric) {
        var existing = pathStats.get(metric.path) || { totalTime: 0, count: 0 };
        pathStats.set(metric.path, {
            totalTime: existing.totalTime + metric.duration,
            count: existing.count + 1
        });
    });
    var topSlowPaths = Array.from(pathStats.entries())
        .map(function (_a) {
        var path = _a[0], stats = _a[1];
        return ({
            path: path,
            averageTime: stats.totalTime / stats.count,
            count: stats.count
        });
    })
        .sort(function (a, b) { return b.averageTime - a.averageTime; })
        .slice(0, 10);
    return {
        totalRequests: totalRequests,
        averageResponseTime: averageResponseTime,
        cacheHitRate: cacheHitRate,
        slowRequestCount: slowRequestCount,
        circuitBreakerState: circuitBreakerState,
        topSlowPaths: topSlowPaths,
    };
}
/**
 * Reset circuit breaker (manual recovery)
 */
function resetCircuitBreaker() {
    circuitBreakerState = 'closed';
    circuitBreakerFailures = 0;
    lastFailureTime = 0;
    console.log('Circuit breaker manually reset');
}
// Default export
exports.default = enhancedSubscriptionMiddleware;
