"use strict";
/**
 * Analytics Engine Base - NeonPro Analytics System
 *
 * Core analytics calculation engine for healthcare metrics,
 * patient data analysis, and clinical performance tracking.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
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
exports.analyticsEngine = exports.AnalyticsEngine = void 0;
exports.createTimeRange = createTimeRange;
var server_1 = require("@/lib/supabase/server");
var react_1 = require("react");
/**
 * Base Analytics Engine
 * Core calculation engine for all analytics operations
 */
var AnalyticsEngine = /** @class */ (function () {
    function AnalyticsEngine() {
        this.supabase = (0, server_1.createClient)();
    }
    /**
     * Calculate percentage change between two values
     */
    AnalyticsEngine.prototype.calculateChange = function (current, previous) {
        var change = current - previous;
        var changePercent = previous === 0 ? 0 : (change / previous) * 100;
        var trend = 'stable';
        if (changePercent > 1)
            trend = 'up';
        else if (changePercent < -1)
            trend = 'down';
        return { change: change, changePercent: changePercent, trend: trend };
    };
    /**
     * Format time range for SQL queries
     */
    AnalyticsEngine.prototype.formatTimeRange = function (timeRange) {
        return {
            startDate: timeRange.start.toISOString(),
            endDate: timeRange.end.toISOString()
        };
    };
    /**
     * Get previous period for comparison
     */
    AnalyticsEngine.prototype.getPreviousPeriod = function (timeRange) {
        var duration = timeRange.end.getTime() - timeRange.start.getTime();
        return {
            start: new Date(timeRange.start.getTime() - duration),
            end: new Date(timeRange.start.getTime()),
            period: timeRange.period
        };
    };
    /**
     * Execute cached query with performance optimization
     */
    AnalyticsEngine.prototype.executeQuery = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, params) {
            var _a, data, error, error_1;
            if (params === void 0) { params = []; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase.rpc('execute_analytics_query', {
                                query_text: query,
                                query_params: params
                            })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Analytics Query Error:', error);
                            throw new Error("Analytics query failed: ".concat(error.message));
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Analytics Engine Error:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate aggregated metrics with comparison
     */
    AnalyticsEngine.prototype.calculateAggregatedMetric = function (tableName_1, column_1, aggregation_1, timeRange_1) {
        return __awaiter(this, arguments, void 0, function (tableName, column, aggregation, timeRange, filters) {
            var currentPeriod, previousPeriod, filterConditions, currentQuery, previousQuery, _a, currentResult, previousResult, currentValue, previousValue, changeData;
            var _b, _c;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        currentPeriod = this.formatTimeRange(timeRange);
                        previousPeriod = this.formatTimeRange(this.getPreviousPeriod(timeRange));
                        filterConditions = Object.entries(filters)
                            .map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return "".concat(key, " = '").concat(value, "'");
                        })
                            .join(' AND ');
                        currentQuery = "\n      SELECT ".concat(aggregation, "(").concat(column, ") as value\n      FROM ").concat(tableName, "\n      WHERE created_at >= '").concat(currentPeriod.startDate, "'\n        AND created_at <= '").concat(currentPeriod.endDate, "'\n        ").concat(filterConditions ? "AND ".concat(filterConditions) : '', "\n    ");
                        previousQuery = "\n      SELECT ".concat(aggregation, "(").concat(column, ") as value\n      FROM ").concat(tableName, "\n      WHERE created_at >= '").concat(previousPeriod.startDate, "'\n        AND created_at <= '").concat(previousPeriod.endDate, "'\n        ").concat(filterConditions ? "AND ".concat(filterConditions) : '', "\n    ");
                        return [4 /*yield*/, Promise.all([
                                this.executeQuery(currentQuery),
                                this.executeQuery(previousQuery)
                            ])];
                    case 1:
                        _a = _d.sent(), currentResult = _a[0], previousResult = _a[1];
                        currentValue = ((_b = currentResult[0]) === null || _b === void 0 ? void 0 : _b.value) || 0;
                        previousValue = ((_c = previousResult[0]) === null || _c === void 0 ? void 0 : _c.value) || 0;
                        changeData = this.calculateChange(currentValue, previousValue);
                        return [2 /*return*/, {
                                value: currentValue,
                                change: changeData.change,
                                changePercent: changeData.changePercent,
                                trend: changeData.trend,
                                period: timeRange.period
                            }];
                }
            });
        });
    };
    /**
     * Get time series data for trending
     */
    AnalyticsEngine.prototype.getTimeSeries = function (tableName_1, column_1, aggregation_1, timeRange_1) {
        return __awaiter(this, arguments, void 0, function (tableName, column, aggregation, timeRange, groupBy, filters) {
            var _a, startDate, endDate, filterConditions, dateFormat, dateTrunc, query;
            if (groupBy === void 0) { groupBy = 'day'; }
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                _a = this.formatTimeRange(timeRange), startDate = _a.startDate, endDate = _a.endDate;
                filterConditions = Object.entries(filters)
                    .map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return "".concat(key, " = '").concat(value, "'");
                })
                    .join(' AND ');
                dateFormat = {
                    day: 'YYYY-MM-DD',
                    week: 'YYYY-"W"WW',
                    month: 'YYYY-MM'
                }[groupBy];
                dateTrunc = {
                    day: 'day',
                    week: 'week',
                    month: 'month'
                }[groupBy];
                query = "\n      SELECT \n        TO_CHAR(DATE_TRUNC('".concat(dateTrunc, "', created_at), '").concat(dateFormat, "') as date,\n        ").concat(aggregation, "(").concat(column, ") as value\n      FROM ").concat(tableName, "\n      WHERE created_at >= '").concat(startDate, "'\n        AND created_at <= '").concat(endDate, "'\n        ").concat(filterConditions ? "AND ".concat(filterConditions) : '', "\n      GROUP BY DATE_TRUNC('").concat(dateTrunc, "', created_at)\n      ORDER BY DATE_TRUNC('").concat(dateTrunc, "', created_at)\n    ");
                return [2 /*return*/, this.executeQuery(query)];
            });
        });
    };
    return AnalyticsEngine;
}());
exports.AnalyticsEngine = AnalyticsEngine;
/**
 * Cached analytics engine instance
 */
exports.analyticsEngine = (0, react_1.cache)(function () { return new AnalyticsEngine(); });
/**
 * Helper function to create standard time ranges
 */
function createTimeRange(period, customStart, customEnd) {
    var now = new Date();
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (period) {
        case 'last7days':
            return {
                start: new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000),
                end: now,
                period: 'day'
            };
        case 'last30days':
            return {
                start: new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000),
                end: now,
                period: 'day'
            };
        case 'last3months':
            return {
                start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
                end: now,
                period: 'week'
            };
        case 'last6months':
            return {
                start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
                end: now,
                period: 'month'
            };
        case 'lastyear':
            return {
                start: new Date(now.getFullYear() - 1, 0, 1),
                end: now,
                period: 'month'
            };
        case 'custom':
            if (!customStart || !customEnd) {
                throw new Error('Custom period requires start and end dates');
            }
            var daysDiff = Math.ceil((customEnd.getTime() - customStart.getTime()) / (1000 * 60 * 60 * 24));
            var periodType = daysDiff <= 30 ? 'day' : daysDiff <= 180 ? 'week' : 'month';
            return {
                start: customStart,
                end: customEnd,
                period: periodType
            };
        default:
            throw new Error("Unsupported period: ".concat(period));
    }
}
