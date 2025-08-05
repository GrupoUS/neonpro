"use strict";
/**
 * Comprehensive Analytics Dashboard Hook for NeonPro
 *
 * Master hook that orchestrates multiple analytics capabilities:
 * - Integrates cohort analysis, forecasting, real-time metrics
 * - Provides unified dashboard state management
 * - Handles cross-analytics correlations and insights
 * - Manages dashboard-wide configuration and filters
 *
 * This hook serves as the primary interface for the advanced analytics hub.
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
exports.useAnalyticsDashboard = useAnalyticsDashboard;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var index_1 = require("./index");
/**
 * Master analytics dashboard hook
 */
function useAnalyticsDashboard(initialConfig) {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    var _a = (0, react_1.useState)(initialConfig), config = _a[0], setConfig = _a[1];
    var _b = (0, react_1.useState)(false), isInitialized = _b[0], setIsInitialized = _b[1];
    var _c = (0, react_1.useState)([]), dashboardAlerts = _c[0], setDashboardAlerts = _c[1];
    var _d = (0, react_1.useState)({
        totalRevenue: 0,
        activeSubscriptions: 0,
        churnRate: 0,
        conversionRate: 0,
        growthRate: 0
    }), kpis = _d[0], setKpis = _d[1];
    // Initialize individual analytics hooks
    var cohortAnalysis = (0, index_1.useCohortAnalysis)(config.cohortAnalysis);
    var forecasting = (0, index_1.useForecasting)(config.forecasting);
    var realTimeAnalytics = (0, index_1.useRealTimeAnalytics)(config.realTime);
    var statisticalInsights = (0, index_1.useStatisticalInsights)(config.statisticalInsights);
    // Aggregate loading states
    var isLoading = (0, react_1.useMemo)(function () {
        return cohortAnalysis.isLoading ||
            forecasting.isLoading ||
            realTimeAnalytics.isConnected === false ||
            statisticalInsights.isLoading;
    }, [
        cohortAnalysis.isLoading,
        forecasting.isLoading,
        realTimeAnalytics.isConnected,
        statisticalInsights.isLoading
    ]);
    // Aggregate error states
    var errors = (0, react_1.useMemo)(function () {
        var errorList = [];
        if (cohortAnalysis.error)
            errorList.push("Cohort Analysis: ".concat(cohortAnalysis.error));
        if (forecasting.error)
            errorList.push("Forecasting: ".concat(forecasting.error));
        if (realTimeAnalytics.error)
            errorList.push("Real-time: ".concat(realTimeAnalytics.error));
        if (statisticalInsights.error)
            errorList.push("Statistical: ".concat(statisticalInsights.error));
        return errorList;
    }, [
        cohortAnalysis.error,
        forecasting.error,
        realTimeAnalytics.error,
        statisticalInsights.error
    ]);
    // Aggregate insights and recommendations
    var aggregatedInsights = (0, react_1.useMemo)(function () {
        var insights = __spreadArray(__spreadArray([], cohortAnalysis.insights, true), statisticalInsights.insights, true);
        var recommendations = __spreadArray([], statisticalInsights.recommendations, true);
        var correlations = __spreadArray([], statisticalInsights.correlations, true);
        return { insights: insights, recommendations: recommendations, correlations: correlations };
    }, [
        cohortAnalysis.insights,
        statisticalInsights.insights,
        statisticalInsights.recommendations,
        statisticalInsights.correlations
    ]);
    // Calculate KPIs from all sources
    (0, react_1.useEffect)(function () {
        var calculateKPIs = function () {
            var _a, _b;
            var newKpis = {
                totalRevenue: realTimeAnalytics.metrics.monthlyRecurringRevenue,
                activeSubscriptions: realTimeAnalytics.metrics.activeSubscriptions,
                churnRate: realTimeAnalytics.metrics.churnRate,
                conversionRate: realTimeAnalytics.metrics.trialConversions > 0
                    ? (realTimeAnalytics.metrics.trialConversions / realTimeAnalytics.metrics.newSignups) * 100
                    : 0,
                growthRate: 0 // Calculate from historical data
            };
            // Calculate growth rate from forecasting data
            if (forecasting.forecast && forecasting.forecast.predictions.length > 1) {
                var current = ((_a = forecasting.forecast.predictions[0]) === null || _a === void 0 ? void 0 : _a.value) || 0;
                var future = ((_b = forecasting.forecast.predictions[forecasting.forecast.predictions.length - 1]) === null || _b === void 0 ? void 0 : _b.value) || 0;
                newKpis.growthRate = current > 0 ? ((future - current) / current) * 100 : 0;
            }
            setKpis(newKpis);
        };
        if (isInitialized) {
            calculateKPIs();
        }
    }, [
        isInitialized,
        realTimeAnalytics.metrics,
        forecasting.forecast
    ]);
    // Combine alerts from all sources
    var allAlerts = (0, react_1.useMemo)(function () {
        return __spreadArray(__spreadArray(__spreadArray([], dashboardAlerts, true), realTimeAnalytics.alerts, true), statisticalInsights.anomalies.map(function (anomaly) { return ({
            id: "anomaly-".concat(anomaly.metric, "-").concat(Date.now()),
            type: anomaly.severity === 'high' ? 'critical' : 'warning',
            message: "Anomaly detected in ".concat(anomaly.metric, ": ").concat(anomaly.explanation),
            timestamp: new Date(anomaly.timestamp),
            metric: anomaly.metric
        }); }), true);
    }, [dashboardAlerts, realTimeAnalytics.alerts, statisticalInsights.anomalies]);
    // Initialize dashboard
    var initialize = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    // Start real-time monitoring
                    realTimeAnalytics.startMonitoring();
                    if (!(config.cohortAnalysis.startDate && config.cohortAnalysis.endDate)) return [3 /*break*/, 2];
                    return [4 /*yield*/, cohortAnalysis.generateAnalysis({
                            cohortType: config.cohortAnalysis.cohortType,
                            granularity: config.cohortAnalysis.granularity,
                            periods: config.cohortAnalysis.periods,
                            startDate: config.cohortAnalysis.startDate,
                            endDate: config.cohortAnalysis.endDate,
                            includeRevenue: true,
                            includeChurn: true
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: 
                // Generate initial forecast
                return [4 /*yield*/, forecasting.generateForecast({
                        metric: config.forecasting.metric,
                        timeHorizon: config.forecasting.timeHorizon,
                        model: config.forecasting.model === 'auto' ? 'seasonal' : config.forecasting.model,
                        granularity: config.forecasting.granularity,
                        confidenceLevel: config.forecasting.confidenceLevel,
                        includeSeasonality: config.forecasting.includeSeasonality,
                        includeTrends: config.forecasting.includeTrends,
                        startDate: config.filters.dateRange.start,
                        endDate: config.filters.dateRange.end
                    })
                    // Run initial statistical analysis
                ];
                case 3:
                    // Generate initial forecast
                    _a.sent();
                    // Run initial statistical analysis
                    return [4 /*yield*/, statisticalInsights.runAnalysis({
                            metrics: config.filters.metrics,
                            timeRange: "".concat(config.filters.dateRange.start, ":").concat(config.filters.dateRange.end),
                            analysisType: 'correlation',
                            confidenceLevel: config.statisticalInsights.confidenceLevel,
                            anomalyThreshold: config.statisticalInsights.anomalyThreshold,
                            includeSeasonality: config.statisticalInsights.includeSeasonality
                        })];
                case 4:
                    // Run initial statistical analysis
                    _a.sent();
                    setIsInitialized(true);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('Dashboard initialization failed:', error_1);
                    setDashboardAlerts(function (prev) { return __spreadArray(__spreadArray([], prev, true), [{
                            id: "init-error-".concat(Date.now()),
                            type: 'critical',
                            message: 'Dashboard initialization failed',
                            timestamp: new Date(),
                            metric: 'system'
                        }], false); });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [
        config,
        cohortAnalysis,
        forecasting,
        realTimeAnalytics,
        statisticalInsights
    ]);
    // Refresh all analytics
    var refreshAll = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            cohortAnalysis.refreshData(),
                            forecasting.refreshData(),
                            realTimeAnalytics.refreshMetrics(),
                            statisticalInsights.refreshInsights()
                        ])];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Dashboard refresh failed:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [cohortAnalysis, forecasting, realTimeAnalytics, statisticalInsights]);
    // Update configuration
    var updateConfig = (0, react_1.useCallback)(function (newConfig) { return __awaiter(_this, void 0, void 0, function () {
        var updatedConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updatedConfig = __assign(__assign({}, config), newConfig);
                    setConfig(updatedConfig);
                    // Update individual hook configurations
                    if (newConfig.cohortAnalysis) {
                        cohortAnalysis.updateConfig(newConfig.cohortAnalysis);
                    }
                    if (newConfig.forecasting) {
                        forecasting.updateConfig(newConfig.forecasting);
                    }
                    if (newConfig.realTime) {
                        realTimeAnalytics.updateConfig(newConfig.realTime);
                    }
                    // Refresh with new config
                    return [4 /*yield*/, refreshAll()];
                case 1:
                    // Refresh with new config
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [config, cohortAnalysis, forecasting, realTimeAnalytics, refreshAll]);
    // Export dashboard
    var exportDashboard = (0, react_1.useCallback)(function (format) { return __awaiter(_this, void 0, void 0, function () {
        var response, blob, url, a, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/analytics/export-dashboard', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                format: format,
                                data: {
                                    kpis: kpis,
                                    cohorts: cohortAnalysis.metrics,
                                    forecasts: forecasting.predictions,
                                    insights: aggregatedInsights.insights,
                                    correlations: aggregatedInsights.correlations,
                                    config: config
                                }
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Export failed');
                    return [4 /*yield*/, response.blob()];
                case 2:
                    blob = _a.sent();
                    url = window.URL.createObjectURL(blob);
                    a = document.createElement('a');
                    a.href = url;
                    a.download = "analytics-dashboard-".concat(new Date().toISOString().split('T')[0], ".").concat(format);
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Dashboard export failed:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [kpis, cohortAnalysis.metrics, forecasting.predictions, aggregatedInsights, config]);
    // Alert management
    var addAlert = (0, react_1.useCallback)(function (alert) {
        setDashboardAlerts(function (prev) { return __spreadArray(__spreadArray([], prev, true), [__assign(__assign({}, alert), { id: "custom-".concat(Date.now()) })], false); });
    }, []);
    var clearAlerts = (0, react_1.useCallback)(function () {
        setDashboardAlerts([]);
        realTimeAnalytics.clearAlerts();
    }, [realTimeAnalytics]);
    // Auto-initialize on mount
    (0, react_1.useEffect)(function () {
        if (!isInitialized) {
            initialize();
        }
        return function () {
            // Cleanup on unmount
            realTimeAnalytics.stopMonitoring();
        };
    }, [isInitialized, initialize, realTimeAnalytics]);
    return {
        // State
        isInitialized: isInitialized,
        isLoading: isLoading,
        hasErrors: errors.length > 0,
        errors: errors,
        lastUpdate: new Date(),
        kpis: kpis,
        correlations: aggregatedInsights.correlations,
        trends: [], // TODO: Implement trend aggregation
        recommendations: aggregatedInsights.recommendations,
        alerts: allAlerts,
        // Actions
        initialize: initialize,
        refreshAll: refreshAll,
        updateConfig: updateConfig,
        exportDashboard: exportDashboard,
        addAlert: addAlert,
        clearAlerts: clearAlerts
    };
}
