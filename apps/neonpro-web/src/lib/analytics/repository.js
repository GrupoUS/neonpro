"use strict";
// Analytics Repository Layer - STORY-SUB-002 Task 2
// Data access layer for analytics with optimized queries and caching
// Created: 2025-01-22
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
exports.AnalyticsRepository = void 0;
var server_1 = require("@/lib/supabase/server");
var AnalyticsRepository = /** @class */ (function () {
    function AnalyticsRepository() {
        this.supabase = (0, server_1.createClient)();
    }
    // ========================================================================
    // RAW METRICS RETRIEVAL
    // ========================================================================
    AnalyticsRepository.prototype.getRevenueMetrics = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('get_revenue_metrics', {
                            p_start_date: query.startDate.toISOString(),
                            p_end_date: query.endDate.toISOString(),
                            p_filters: query.filters || {}
                        })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Revenue metrics query failed: ".concat(error.message));
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    AnalyticsRepository.prototype.getConversionMetrics = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('get_conversion_metrics', {
                            p_start_date: query.startDate.toISOString(),
                            p_end_date: query.endDate.toISOString(),
                            p_filters: query.filters || {}
                        })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Conversion metrics query failed: ".concat(error.message));
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    AnalyticsRepository.prototype.getTrialMetrics = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('get_trial_metrics', {
                            p_start_date: query.startDate.toISOString(),
                            p_end_date: query.endDate.toISOString(),
                            p_filters: query.filters || {}
                        })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Trial metrics query failed: ".concat(error.message));
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    // ========================================================================
    // AGGREGATED ANALYTICS QUERIES
    // ========================================================================
    AnalyticsRepository.prototype.getRevenueAggregation = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('calculate_revenue_aggregation', {
                            p_period: query.period,
                            p_start_date: query.startDate.toISOString(),
                            p_end_date: query.endDate.toISOString(),
                            p_group_by: query.groupBy || []
                        })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Revenue aggregation failed: ".concat(error.message));
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data[0]) || this.createEmptyAggregation(query)];
                }
            });
        });
    };
    AnalyticsRepository.prototype.getConversionAggregation = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('calculate_conversion_aggregation', {
                            p_period: query.period,
                            p_start_date: query.startDate.toISOString(),
                            p_end_date: query.endDate.toISOString(),
                            p_group_by: query.groupBy || []
                        })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Conversion aggregation failed: ".concat(error.message));
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data[0]) || this.createEmptyAggregation(query)];
                }
            });
        });
    }; // ========================================================================
    // REAL-TIME METRICS & STREAMING
    // ========================================================================
    AnalyticsRepository.prototype.getRealTimeMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('get_realtime_metrics')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Real-time metrics query failed: ".concat(error.message));
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    AnalyticsRepository.prototype.subscribeToRealTimeMetrics = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var channel;
            return __generator(this, function (_a) {
                channel = this.supabase
                    .channel('realtime-analytics')
                    .on('postgres_changes', { event: '*', schema: 'analytics', table: 'metrics' }, function (payload) {
                    var _a, _b, _c, _d, _e, _f;
                    var metric = {
                        id: ((_a = payload.new) === null || _a === void 0 ? void 0 : _a.id) || '',
                        type: ((_b = payload.new) === null || _b === void 0 ? void 0 : _b.type) || 'user',
                        value: ((_c = payload.new) === null || _c === void 0 ? void 0 : _c.value) || 0,
                        delta: ((_d = payload.new) === null || _d === void 0 ? void 0 : _d.delta) || 0,
                        timestamp: new Date(((_e = payload.new) === null || _e === void 0 ? void 0 : _e.created_at) || Date.now()),
                        trend: ((_f = payload.new) === null || _f === void 0 ? void 0 : _f.trend) || 'stable'
                    };
                    callback(metric);
                })
                    .subscribe();
                return [2 /*return*/, function () { return channel.unsubscribe(); }];
            });
        });
    };
    // ========================================================================
    // UTILITY METHODS
    // ========================================================================
    AnalyticsRepository.prototype.createEmptyAggregation = function (query) {
        return {
            period: query.period,
            startDate: query.startDate,
            endDate: query.endDate,
            total: 0,
            average: 0,
            median: 0,
            percentile95: 0,
            growth: 0,
            periodOverPeriod: 0
        };
    };
    return AnalyticsRepository;
}());
exports.AnalyticsRepository = AnalyticsRepository;
