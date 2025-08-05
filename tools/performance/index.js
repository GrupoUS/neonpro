"use strict";
/**
 * Performance Optimization Suite - Main Export
 *
 * Comprehensive performance optimization utilities for Next.js 15 & React 19
 * Based on 2025 industry best practices and expert recommendations
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPERT_RECOMMENDATIONS = exports.DEFAULT_PERFORMANCE_CONFIG = exports.PERFORMANCE_CONSTANTS = exports.PerformanceSuite = exports.DEPLOYMENT_CONFIG = exports.DeploymentAutomation = exports.ProductionHealthCheck = exports.BuildOptimizer = exports.PreBuildOptimizer = exports.usePerformanceProfiler = exports.usePreloadResources = exports.useOptimizedChartData = exports.useMemoryMonitor = exports.useIntersectionObserver = exports.useVirtualScrolling = exports.useDebouncedState = exports.useRenderPerformance = exports.useOptimizedMemo = exports.useOptimizedCallback = exports.CACHE_CONFIG = exports.cacheManager = exports.withCache = exports.CachePerformanceMonitor = exports.CDNOptimization = exports.CacheInvalidation = exports.CacheHeaders = exports.CacheKeyGenerator = exports.CacheManager = exports.BUNDLE_THRESHOLDS = exports.formatBytes = exports.runBundleAnalysis = exports.generateBundleReport = exports.analyzeBundleStats = exports.PERFORMANCE_THRESHOLDS = exports.PerformanceUtils = exports.usePerformanceMonitoring = exports.getPerformanceGrade = exports.sendToAnalytics = exports.reportWebVitals = void 0;
// Core Web Vitals and Performance Monitoring
var web_vitals_1 = require("./web-vitals");
Object.defineProperty(exports, "reportWebVitals", { enumerable: true, get: function () { return web_vitals_1.reportWebVitals; } });
Object.defineProperty(exports, "sendToAnalytics", { enumerable: true, get: function () { return web_vitals_1.sendToAnalytics; } });
Object.defineProperty(exports, "getPerformanceGrade", { enumerable: true, get: function () { return web_vitals_1.getPerformanceGrade; } });
Object.defineProperty(exports, "usePerformanceMonitoring", { enumerable: true, get: function () { return web_vitals_1.usePerformanceMonitoring; } });
Object.defineProperty(exports, "PerformanceUtils", { enumerable: true, get: function () { return web_vitals_1.PerformanceUtils; } });
Object.defineProperty(exports, "PERFORMANCE_THRESHOLDS", { enumerable: true, get: function () { return web_vitals_1.PERFORMANCE_THRESHOLDS; } });
// Bundle Analysis and Optimization
var bundle_analyzer_1 = require("./bundle-analyzer");
Object.defineProperty(exports, "analyzeBundleStats", { enumerable: true, get: function () { return bundle_analyzer_1.analyzeBundleStats; } });
Object.defineProperty(exports, "generateBundleReport", { enumerable: true, get: function () { return bundle_analyzer_1.generateBundleReport; } });
Object.defineProperty(exports, "runBundleAnalysis", { enumerable: true, get: function () { return bundle_analyzer_1.runBundleAnalysis; } });
Object.defineProperty(exports, "formatBytes", { enumerable: true, get: function () { return bundle_analyzer_1.formatBytes; } });
Object.defineProperty(exports, "BUNDLE_THRESHOLDS", { enumerable: true, get: function () { return bundle_analyzer_1.BUNDLE_THRESHOLDS; } });
// Caching Strategies
var caching_1 = require("./caching");
Object.defineProperty(exports, "CacheManager", { enumerable: true, get: function () { return caching_1.CacheManager; } });
Object.defineProperty(exports, "CacheKeyGenerator", { enumerable: true, get: function () { return caching_1.CacheKeyGenerator; } });
Object.defineProperty(exports, "CacheHeaders", { enumerable: true, get: function () { return caching_1.CacheHeaders; } });
Object.defineProperty(exports, "CacheInvalidation", { enumerable: true, get: function () { return caching_1.CacheInvalidation; } });
Object.defineProperty(exports, "CDNOptimization", { enumerable: true, get: function () { return caching_1.CDNOptimization; } });
Object.defineProperty(exports, "CachePerformanceMonitor", { enumerable: true, get: function () { return caching_1.CachePerformanceMonitor; } });
Object.defineProperty(exports, "withCache", { enumerable: true, get: function () { return caching_1.withCache; } });
Object.defineProperty(exports, "cacheManager", { enumerable: true, get: function () { return caching_1.cacheManager; } });
Object.defineProperty(exports, "CACHE_CONFIG", { enumerable: true, get: function () { return caching_1.CACHE_CONFIG; } });
// React Performance Hooks
var react_hooks_1 = require("./react-hooks");
Object.defineProperty(exports, "useOptimizedCallback", { enumerable: true, get: function () { return react_hooks_1.useOptimizedCallback; } });
Object.defineProperty(exports, "useOptimizedMemo", { enumerable: true, get: function () { return react_hooks_1.useOptimizedMemo; } });
Object.defineProperty(exports, "useRenderPerformance", { enumerable: true, get: function () { return react_hooks_1.useRenderPerformance; } });
Object.defineProperty(exports, "useDebouncedState", { enumerable: true, get: function () { return react_hooks_1.useDebouncedState; } });
Object.defineProperty(exports, "useVirtualScrolling", { enumerable: true, get: function () { return react_hooks_1.useVirtualScrolling; } });
Object.defineProperty(exports, "useIntersectionObserver", { enumerable: true, get: function () { return react_hooks_1.useIntersectionObserver; } });
Object.defineProperty(exports, "useMemoryMonitor", { enumerable: true, get: function () { return react_hooks_1.useMemoryMonitor; } });
Object.defineProperty(exports, "useOptimizedChartData", { enumerable: true, get: function () { return react_hooks_1.useOptimizedChartData; } });
Object.defineProperty(exports, "usePreloadResources", { enumerable: true, get: function () { return react_hooks_1.usePreloadResources; } });
Object.defineProperty(exports, "usePerformanceProfiler", { enumerable: true, get: function () { return react_hooks_1.usePerformanceProfiler; } });
// Production Deployment
var deployment_1 = require("./deployment");
Object.defineProperty(exports, "PreBuildOptimizer", { enumerable: true, get: function () { return deployment_1.PreBuildOptimizer; } });
Object.defineProperty(exports, "BuildOptimizer", { enumerable: true, get: function () { return deployment_1.BuildOptimizer; } });
Object.defineProperty(exports, "ProductionHealthCheck", { enumerable: true, get: function () { return deployment_1.ProductionHealthCheck; } });
Object.defineProperty(exports, "DeploymentAutomation", { enumerable: true, get: function () { return deployment_1.DeploymentAutomation; } });
Object.defineProperty(exports, "DEPLOYMENT_CONFIG", { enumerable: true, get: function () { return deployment_1.DEPLOYMENT_CONFIG; } });
// Performance utility functions
exports.PerformanceSuite = {
    // Initialize all performance monitoring
    init: function () {
        if (typeof window !== 'undefined') {
            // Start Web Vitals monitoring
            Promise.resolve().then(function () { return require('./web-vitals'); }).then(function (_a) {
                var reportWebVitals = _a.reportWebVitals;
                reportWebVitals();
            });
            // Start resource timing monitoring
            Promise.resolve().then(function () { return require('./web-vitals'); }).then(function (_a) {
                var PerformanceUtils = _a.PerformanceUtils;
                PerformanceUtils.observeResourceTiming();
            });
        }
    },
    // Production build optimization
    build: function () { return __awaiter(void 0, void 0, void 0, function () {
        var BuildOptimizer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./deployment'); })];
                case 1:
                    BuildOptimizer = (_a.sent()).BuildOptimizer;
                    return [2 /*return*/, BuildOptimizer.optimizedBuild()];
            }
        });
    }); },
    // Health checks for production
    healthCheck: function () { return __awaiter(void 0, void 0, void 0, function () {
        var ProductionHealthCheck;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./deployment'); })];
                case 1:
                    ProductionHealthCheck = (_a.sent()).ProductionHealthCheck;
                    return [2 /*return*/, ProductionHealthCheck.runHealthChecks()];
            }
        });
    }); },
    // Bundle analysis
    analyzeBundle: function (statsPath) { return __awaiter(void 0, void 0, void 0, function () {
        var runBundleAnalysis;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./bundle-analyzer'); })];
                case 1:
                    runBundleAnalysis = (_a.sent()).runBundleAnalysis;
                    return [2 /*return*/, runBundleAnalysis(statsPath)];
            }
        });
    }); },
    // Cache performance stats
    getCacheStats: function () {
        var _a = require('./caching'), cacheManager = _a.cacheManager, CachePerformanceMonitor = _a.CachePerformanceMonitor;
        return {
            cache: cacheManager.getStats(),
            performance: CachePerformanceMonitor.getStats(),
        };
    },
};
// Performance constants for external use
exports.PERFORMANCE_CONSTANTS = {
    // Core Web Vitals thresholds (2025 standards)
    CORE_WEB_VITALS: {
        LCP: { GOOD: 2500, NEEDS_IMPROVEMENT: 4000 }, // Largest Contentful Paint
        FID: { GOOD: 100, NEEDS_IMPROVEMENT: 300 }, // First Input Delay
        CLS: { GOOD: 0.1, NEEDS_IMPROVEMENT: 0.25 }, // Cumulative Layout Shift
        FCP: { GOOD: 1800, NEEDS_IMPROVEMENT: 3000 }, // First Contentful Paint
        TTFB: { GOOD: 800, NEEDS_IMPROVEMENT: 1800 }, // Time to First Byte
    },
    // Bundle size recommendations
    BUNDLE_SIZES: {
        CRITICAL: 50 * 1024, // 50KB for critical resources
        WARNING: 100 * 1024, // 100KB warning threshold
        ERROR: 250 * 1024, // 250KB error threshold
        TOTAL_MAX: 2 * 1024 * 1024, // 2MB total bundle limit
    },
    // React performance thresholds
    REACT_PERFORMANCE: {
        RENDER_TIME_WARNING: 16, // 60fps = 16.67ms per frame
        RENDER_TIME_ERROR: 33, // 30fps = 33.33ms per frame
        INTERACTION_TIME_WARNING: 100, // 100ms for good UX
        MEMORY_USAGE_WARNING: 50 * 1024 * 1024, // 50MB
    },
    // Cache TTL recommendations
    CACHE_TTL: {
        STATIC_ASSETS: 31536000, // 1 year
        API_RESPONSES: 300, // 5 minutes
        DYNAMIC_CONTENT: 60, // 1 minute
        USER_SPECIFIC: 0, // No caching
    },
};
// Default performance configuration
exports.DEFAULT_PERFORMANCE_CONFIG = {
    webVitals: {
        enabled: true,
        sampleRate: 1.0,
    },
    bundleAnalysis: {
        enabled: process.env.NODE_ENV === 'production',
        warningThreshold: 100 * 1024, // 100KB
        errorThreshold: 250 * 1024, // 250KB
    },
    caching: {
        enabled: true,
        defaultTTL: 300000, // 5 minutes
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    },
    monitoring: {
        logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
        enableDevTools: process.env.NODE_ENV === 'development',
        memoryMonitoring: process.env.NODE_ENV === 'development',
    },
};
// Initialize performance suite on import (client-side only)
if (typeof window !== 'undefined') {
    // Auto-initialize with default config
    exports.PerformanceSuite.init();
}
// Expert recommendations summary
exports.EXPERT_RECOMMENDATIONS = {
    // From MCP research findings
    nextjs15: [
        'Use React Server Components by default for better performance',
        'Enable Turbopack for faster development builds',
        'Implement proper caching strategies with opt-in approach',
        'Use Next.js Image component with AVIF/WebP formats',
        'Enable bundle analysis in production builds',
        'Implement proper error boundaries and loading states',
    ],
    react19: [
        'Use React Compiler for automatic memoization',
        'Leverage startTransition for better UX',
        'Implement proper Suspense boundaries',
        'Use useOptimistic for instant UI updates',
        'Avoid premature optimization - measure first',
    ],
    deployment: [
        'Run health checks before deployment',
        'Implement proper security headers',
        'Use CDN for static assets',
        'Enable compression and minification',
        'Monitor Core Web Vitals in production',
        'Implement proper cache invalidation strategies',
    ],
    analytics: [
        'Use server-side rendering for SEO',
        'Implement lazy loading for charts',
        'Optimize data processing with Web Workers',
        'Use virtual scrolling for large datasets',
        'Implement proper error tracking',
    ],
};
exports.default = exports.PerformanceSuite;
