"use strict";
/**
 * TASK-001: Foundation Setup & Baseline
 * Metrics Collection API
 *
 * Provides comprehensive metrics collection for baseline establishment
 * and ongoing performance monitoring across all epic functionality.
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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var performance_1 = require("@/lib/monitoring/performance");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, metric_type, timeframe, limit, metrics, stats, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = request.nextUrl.searchParams;
                    metric_type = searchParams.get('type');
                    timeframe = searchParams.get('timeframe') || '24h';
                    limit = parseInt(searchParams.get('limit') || '100');
                    return [4 /*yield*/, (0, performance_1.getPerformanceMetrics)({
                            metric_type: metric_type,
                            timeframe: timeframe,
                            limit: limit,
                        })];
                case 3:
                    metrics = _a.sent();
                    stats = calculateMetricStats(metrics);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                metrics: metrics,
                                stats: stats,
                                baseline: {
                                    api_max_ms: 500,
                                    page_max_ms: 2000,
                                    db_max_ms: 100,
                                    component_max_ms: 50,
                                },
                                timeframe: timeframe,
                                total_count: metrics.length,
                            },
                        })];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error fetching metrics:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, body, route_path, metric_type, duration_ms, status_code, error_message, metadata, metric, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _a.sent();
                    route_path = body.route_path, metric_type = body.metric_type, duration_ms = body.duration_ms, status_code = body.status_code, error_message = body.error_message, metadata = body.metadata;
                    // Validate required fields
                    if (!route_path || !metric_type || duration_ms === undefined) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Missing required fields: route_path, metric_type, duration_ms' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, performance_1.recordPerformanceMetric)({
                            route_path: route_path,
                            metric_type: metric_type,
                            duration_ms: duration_ms,
                            status_code: status_code,
                            error_message: error_message,
                            metadata: metadata,
                        })];
                case 4:
                    metric = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: { metric: metric },
                            message: 'Metric recorded successfully',
                        })];
                case 5:
                    error_2 = _a.sent();
                    console.error('Error recording metric:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to record metric' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function calculateMetricStats(metrics) {
    if (metrics.length === 0) {
        return {
            count: 0,
            avg_duration: 0,
            min_duration: 0,
            max_duration: 0,
            p95_duration: 0,
            error_rate: 0,
        };
    }
    var durations = metrics.map(function (m) { return m.duration_ms; }).sort(function (a, b) { return a - b; });
    var errorCount = metrics.filter(function (m) { return m.error_message; }).length;
    return {
        count: metrics.length,
        avg_duration: Math.round(durations.reduce(function (a, b) { return a + b; }, 0) / durations.length),
        min_duration: durations[0],
        max_duration: durations[durations.length - 1],
        p95_duration: durations[Math.floor(durations.length * 0.95)],
        error_rate: (errorCount / metrics.length) * 100,
    };
}
