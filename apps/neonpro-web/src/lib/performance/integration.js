/**
 * Performance Integration Hook
 * Seamlessly integrate performance monitor into NeonPro layout
 */
'use client';
"use strict";
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
exports.usePerformanceMonitoring = usePerformanceMonitoring;
exports.PerformanceMonitor = PerformanceMonitor;
var react_1 = require("react");
var web_vitals_1 = require("web-vitals");
/**
 * Custom hook for automatic performance monitoring
 */
function usePerformanceMonitoring() {
    var _this = this;
    (0, react_1.useEffect)(function () {
        // Only run in production or when explicitly enabled
        if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING) {
            return;
        }
        var metrics = {};
        var reportingTimeout;
        /**
         * Send metrics to API when all are collected
         */
        var sendMetrics = function () { return __awaiter(_this, void 0, void 0, function () {
            var score, performanceData, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        score = calculatePerformanceScore(metrics);
                        performanceData = __assign(__assign({}, metrics), { score: score, page: window.location.pathname, userAgent: navigator.userAgent, connection: ((_a = navigator.connection) === null || _a === void 0 ? void 0 : _a.effectiveType) || 'unknown', deviceType: getDeviceType(), timestamp: new Date().toISOString() });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch('/api/analytics/performance', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(performanceData)
                            })];
                    case 2:
                        _b.sent();
                        console.log('✅ Performance metrics sent:', performanceData);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error('❌ Failed to send performance metrics:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Collect metrics with debounced reporting
         */
        var collectMetric = function (name, value) {
            metrics[name] = value;
            // Clear existing timeout
            if (reportingTimeout) {
                clearTimeout(reportingTimeout);
            }
            // Report metrics after 2 seconds of inactivity or when all metrics are collected
            var hasAllMetrics = Object.keys(metrics).length >= 5;
            var delay = hasAllMetrics ? 100 : 2000;
            reportingTimeout = setTimeout(sendMetrics, delay);
        };
        // Collect Core Web Vitals
        (0, web_vitals_1.onCLS)(function (metric) { return collectMetric('cls', metric.value); });
        (0, web_vitals_1.onFID)(function (metric) { return collectMetric('fid', metric.value); });
        (0, web_vitals_1.onFCP)(function (metric) { return collectMetric('fcp', metric.value / 1000); }); // Convert to seconds
        (0, web_vitals_1.onLCP)(function (metric) { return collectMetric('lcp', metric.value / 1000); }); // Convert to seconds
        (0, web_vitals_1.onTTFB)(function (metric) { return collectMetric('ttfb', metric.value); });
        // Cleanup on unmount
        return function () {
            if (reportingTimeout) {
                clearTimeout(reportingTimeout);
            }
        };
    }, []);
}
/**
 * Calculate performance score based on Core Web Vitals
 * Uses Google's performance scoring methodology
 */
function calculatePerformanceScore(metrics) {
    if (!metrics.lcp || !metrics.fid || !metrics.cls) {
        return 0;
    }
    // Weight factors based on Google's Core Web Vitals importance
    var weights = {
        lcp: 0.25, // Largest Contentful Paint
        fid: 0.25, // First Input Delay
        cls: 0.25, // Cumulative Layout Shift
        fcp: 0.15, // First Contentful Paint
        ttfb: 0.10 // Time to First Byte
    };
    // Score thresholds (good/needs improvement/poor)
    var thresholds = {
        lcp: { good: 2.5, poor: 4.0 },
        fid: { good: 100, poor: 300 },
        cls: { good: 0.1, poor: 0.25 },
        fcp: { good: 1.8, poor: 3.0 },
        ttfb: { good: 800, poor: 1800 }
    };
    var totalScore = 0;
    // Calculate score for each metric
    Object.entries(metrics).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var threshold = thresholds[key];
        var weight = weights[key];
        if (!threshold || !weight)
            return;
        var score = 100;
        if (value <= threshold.good) {
            score = 100; // Perfect score
        }
        else if (value <= threshold.poor) {
            // Linear interpolation between good and poor
            var range = threshold.poor - threshold.good;
            var position = value - threshold.good;
            score = 100 - ((position / range) * 50);
        }
        else {
            score = 50; // Poor performance
        }
        totalScore += score * weight;
    });
    return Math.round(totalScore);
}
/**
 * Detect device type based on user agent and screen size
 */
function getDeviceType() {
    var userAgent = navigator.userAgent.toLowerCase();
    var screenWidth = window.screen.width;
    if (/mobile|android|iphone/.test(userAgent) || screenWidth < 768) {
        return 'mobile';
    }
    if (/tablet|ipad/.test(userAgent) || (screenWidth >= 768 && screenWidth < 1024)) {
        return 'tablet';
    }
    return 'desktop';
}
/**
 * Performance monitoring component for layout integration
 */
function PerformanceMonitor(_a) {
    var children = _a.children;
    // Initialize performance monitoring
    usePerformanceMonitoring();
    // Return children without additional wrapper to avoid layout impact
    return <>{children}</>;
}
