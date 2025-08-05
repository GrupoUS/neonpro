"use strict";
/**
 * Performance Metrics Collection API
 *
 * Collects and stores Web Vitals and custom performance metrics
 * Based on 2025 performance monitoring best practices
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var caching_1 = require("@/performance/caching");
// Supported metric types
var SUPPORTED_METRICS = [
    'CLS', // Cumulative Layout Shift
    'FID', // First Input Delay (deprecated)
    'FCP', // First Contentful Paint
    'LCP', // Largest Contentful Paint
    'TTFB', // Time to First Byte
    'INP', // Interaction to Next Paint (new)
    'LONG_TASK', // Long Task API
    'DNS_TIME', // DNS lookup time
    'CONNECT_TIME', // Connection time
    'COMPONENT_RENDER', // Component render time
    'INTERACTION_RESPONSE', // Interaction response time
    'FUNCTION_EXECUTION', // Function execution time
    'LARGE_RESOURCE', // Large resource loading
];
// Performance thresholds for automated alerts
var PERFORMANCE_ALERTS = {
    LCP: { critical: 4000, warning: 2500 },
    FID: { critical: 300, warning: 100 },
    CLS: { critical: 0.25, warning: 0.1 },
    FCP: { critical: 3000, warning: 1800 },
    TTFB: { critical: 1800, warning: 800 },
    INP: { critical: 500, warning: 200 },
};
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, metrics, metricsArray, validMetrics, session, userId_1, enrichedMetrics, _a, data, error, response_1, headers, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_2.createClient)()
                        // Parse request body
                    ];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, request.json()];
                case 2:
                    metrics = _c.sent();
                    metricsArray = Array.isArray(metrics) ? metrics : [metrics];
                    validMetrics = metricsArray.filter(function (metric) {
                        return metric.name &&
                            typeof metric.value === 'number' &&
                            SUPPORTED_METRICS.includes(metric.name);
                    });
                    if (validMetrics.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'No valid metrics provided' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 3:
                    session = (_c.sent()).data.session;
                    userId_1 = (_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id;
                    enrichedMetrics = validMetrics.map(function (metric) {
                        var _a, _b;
                        return (__assign(__assign({}, metric), { userId: userId_1 || null, sessionId: generateSessionId(request), url: metric.url || request.headers.get('referer') || 'unknown', userAgent: metric.userAgent || request.headers.get('user-agent') || 'unknown', timestamp: metric.timestamp || Date.now(), grade: metric.grade || calculateGrade(metric.name, metric.value), ip_address: getClientIP(request), country: ((_a = request.geo) === null || _a === void 0 ? void 0 : _a.country) || 'unknown', city: ((_b = request.geo) === null || _b === void 0 ? void 0 : _b.city) || 'unknown' }));
                    });
                    return [4 /*yield*/, supabase
                            .from('performance_metrics')
                            .insert(enrichedMetrics)
                            .select()];
                case 4:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Failed to store performance metrics:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to store metrics' }, { status: 500 })];
                    }
                    // Check for performance alerts
                    return [4 /*yield*/, checkPerformanceAlerts(enrichedMetrics, supabase)
                        // Return success response with appropriate cache headers
                    ];
                case 5:
                    // Check for performance alerts
                    _c.sent();
                    response_1 = server_1.NextResponse.json({
                        success: true,
                        stored: (data === null || data === void 0 ? void 0 : data.length) || 0,
                        metrics: data === null || data === void 0 ? void 0 : data.map(function (d) { return ({ id: d.id, name: d.name, grade: d.grade }); })
                    });
                    headers = caching_1.CacheHeaders.noCache();
                    headers.forEach(function (value, key) {
                        response_1.headers.set(key, value);
                    });
                    return [2 /*return*/, response_1];
                case 6:
                    error_1 = _c.sent();
                    console.error('Performance metrics API error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, searchParams, session, userId, metric, timeRange, limit, query, timeRangeMs, cutoff, _a, data, error, stats, response_2, headers, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    searchParams = new URL(request.url).searchParams;
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_b.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    userId = searchParams.get('userId') || session.user.id;
                    metric = searchParams.get('metric');
                    timeRange = searchParams.get('timeRange') || '24h';
                    limit = parseInt(searchParams.get('limit') || '100');
                    query = supabase
                        .from('performance_metrics')
                        .select('*')
                        .eq('userId', userId)
                        .order('timestamp', { ascending: false })
                        .limit(Math.min(limit, 1000)) // Cap at 1000 records
                    ;
                    // Filter by metric type
                    if (metric && SUPPORTED_METRICS.includes(metric)) {
                        query = query.eq('name', metric);
                    }
                    timeRangeMs = parseTimeRange(timeRange);
                    if (timeRangeMs > 0) {
                        cutoff = Date.now() - timeRangeMs;
                        query = query.gte('timestamp', cutoff);
                    }
                    return [4 /*yield*/, query];
                case 3:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Failed to fetch performance metrics:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })];
                    }
                    stats = calculateAggregatedStats(data || []);
                    response_2 = server_1.NextResponse.json({
                        metrics: data || [],
                        count: (data === null || data === void 0 ? void 0 : data.length) || 0,
                        timeRange: timeRange,
                        stats: stats,
                    });
                    headers = caching_1.CacheHeaders.apiResponse();
                    headers.forEach(function (value, key) {
                        response_2.headers.set(key, value);
                    });
                    return [2 /*return*/, response_2];
                case 4:
                    error_2 = _b.sent();
                    console.error('Performance metrics GET API error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Helper functions
function generateSessionId(request) {
    var ip = getClientIP(request);
    var userAgent = request.headers.get('user-agent') || '';
    var timestamp = Math.floor(Date.now() / (1000 * 60 * 30)); // 30-minute buckets
    return Buffer.from("".concat(ip, "-").concat(userAgent, "-").concat(timestamp)).toString('base64').slice(0, 16);
}
function getClientIP(request) {
    var _a;
    return (((_a = request.headers.get('x-forwarded-for')) === null || _a === void 0 ? void 0 : _a.split(',')[0]) ||
        request.headers.get('x-real-ip') ||
        request.ip ||
        'unknown');
}
function calculateGrade(metric, value) {
    var thresholds = PERFORMANCE_ALERTS[metric];
    if (!thresholds)
        return 'poor';
    if (value <= thresholds.warning)
        return 'good';
    if (value <= thresholds.critical)
        return 'needs-improvement';
    return 'poor';
}
function parseTimeRange(timeRange) {
    var ranges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
    };
    return ranges[timeRange] || 0;
}
function calculateAggregatedStats(metrics) {
    if (metrics.length === 0)
        return {};
    var statsByMetric = {};
    for (var _i = 0, metrics_1 = metrics; _i < metrics_1.length; _i++) {
        var metric = metrics_1[_i];
        if (!statsByMetric[metric.name]) {
            statsByMetric[metric.name] = {
                count: 0,
                values: [],
                grades: { good: 0, 'needs-improvement': 0, poor: 0 }
            };
        }
        statsByMetric[metric.name].count++;
        statsByMetric[metric.name].values.push(metric.value);
        statsByMetric[metric.name].grades[metric.grade]++;
    }
    // Calculate percentiles and averages
    for (var _a = 0, _b = Object.entries(statsByMetric); _a < _b.length; _a++) {
        var _c = _b[_a], metricName = _c[0], stats = _c[1];
        var values = stats.values.sort(function (a, b) { return a - b; });
        var count = values.length;
        statsByMetric[metricName] = __assign(__assign({}, stats), { min: values[0], max: values[count - 1], average: values.reduce(function (sum, val) { return sum + val; }, 0) / count, median: values[Math.floor(count / 2)], p75: values[Math.floor(count * 0.75)], p95: values[Math.floor(count * 0.95)], p99: values[Math.floor(count * 0.99)] });
        delete statsByMetric[metricName].values; // Remove raw values to reduce response size
    }
    return statsByMetric;
}
function checkPerformanceAlerts(metrics, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, metrics_2, metric, threshold, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, metrics_2 = metrics;
                    _a.label = 1;
                case 1:
                    if (!(_i < metrics_2.length)) return [3 /*break*/, 6];
                    metric = metrics_2[_i];
                    threshold = PERFORMANCE_ALERTS[metric.name];
                    if (!(threshold && metric.grade === 'poor')) return [3 /*break*/, 5];
                    // Log critical performance issue
                    console.warn("\uD83D\uDEA8 Critical performance issue: ".concat(metric.name, " = ").concat(metric.value, "ms (threshold: ").concat(threshold.critical, "ms)"));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, supabase
                            .from('performance_alerts')
                            .insert({
                            metric_name: metric.name,
                            metric_value: metric.value,
                            threshold: threshold.critical,
                            user_id: metric.userId,
                            url: metric.url,
                            severity: 'critical',
                            timestamp: metric.timestamp,
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error('Failed to store performance alert:', error_3);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
