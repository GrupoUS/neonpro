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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateKPIConfig = exports.createKPIDashboard = exports.services = exports.config = exports.ANIMATIONS = exports.STORAGE_KEYS = exports.CACHE_KEYS = exports.API_ENDPOINTS = exports.FEATURE_FLAGS = exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.PERFORMANCE_BENCHMARKS = exports.DATE_RANGE_PRESETS = exports.EXPORT_FORMATS = exports.WIDGET_SIZES = exports.DEFAULT_ALERT_RULES = exports.DEFAULT_CHART_CONFIGS = exports.DEFAULT_KPI_CONFIGS = exports.KPI_THRESHOLDS = exports.CHART_PALETTES = exports.CHART_COLORS = exports.API_CONFIG = exports.DASHBOARD_CONFIG = exports.calculateCorrelation = exports.detectAnomalies = exports.calculateStatistics = exports.generateMockTimeSeries = exports.filterAlerts = exports.sortKPIs = exports.getDateRangePreset = exports.getTrendColor = exports.getKPIStatusColor = exports.getKPIStatus = exports.calculateMovingAverage = exports.calculateCAGR = exports.calculateGrowthRate = exports.calculatePercentageChange = exports.calculateTrend = exports.formatDateRange = exports.formatDate = exports.formatNumber = exports.formatPercentage = exports.formatCurrency = exports.PerformanceService = exports.SupabaseKPIService = exports.FinancialKPIService = exports.useFinancialKPIs = exports.KPIDrillDown = exports.KPIFilters = exports.FinancialKPIDashboard = void 0;
exports.checkBrowserCompatibility = exports.FEATURES = exports.BUILD_DATE = exports.VERSION = exports.createChartConfig = exports.createAlertRule = void 0;
// Main Components
var FinancialKPIDashboard_1 = require("./FinancialKPIDashboard");
Object.defineProperty(exports, "FinancialKPIDashboard", { enumerable: true, get: function () { return FinancialKPIDashboard_1.default; } });
var KPIFilters_1 = require("./KPIFilters");
Object.defineProperty(exports, "KPIFilters", { enumerable: true, get: function () { return KPIFilters_1.default; } });
var KPIDrillDown_1 = require("./KPIDrillDown");
Object.defineProperty(exports, "KPIDrillDown", { enumerable: true, get: function () { return KPIDrillDown_1.default; } });
// Hooks
var useFinancialKPIs_1 = require("./hooks/useFinancialKPIs");
Object.defineProperty(exports, "useFinancialKPIs", { enumerable: true, get: function () { return useFinancialKPIs_1.default; } });
// Services
var services_1 = require("./services");
Object.defineProperty(exports, "FinancialKPIService", { enumerable: true, get: function () { return services_1.FinancialKPIService; } });
Object.defineProperty(exports, "SupabaseKPIService", { enumerable: true, get: function () { return services_1.SupabaseKPIService; } });
Object.defineProperty(exports, "PerformanceService", { enumerable: true, get: function () { return services_1.PerformanceService; } });
// Utilities
var utils_1 = require("./utils");
Object.defineProperty(exports, "formatCurrency", { enumerable: true, get: function () { return utils_1.formatCurrency; } });
Object.defineProperty(exports, "formatPercentage", { enumerable: true, get: function () { return utils_1.formatPercentage; } });
Object.defineProperty(exports, "formatNumber", { enumerable: true, get: function () { return utils_1.formatNumber; } });
Object.defineProperty(exports, "formatDate", { enumerable: true, get: function () { return utils_1.formatDate; } });
Object.defineProperty(exports, "formatDateRange", { enumerable: true, get: function () { return utils_1.formatDateRange; } });
Object.defineProperty(exports, "calculateTrend", { enumerable: true, get: function () { return utils_1.calculateTrend; } });
Object.defineProperty(exports, "calculatePercentageChange", { enumerable: true, get: function () { return utils_1.calculatePercentageChange; } });
Object.defineProperty(exports, "calculateGrowthRate", { enumerable: true, get: function () { return utils_1.calculateGrowthRate; } });
Object.defineProperty(exports, "calculateCAGR", { enumerable: true, get: function () { return utils_1.calculateCAGR; } });
Object.defineProperty(exports, "calculateMovingAverage", { enumerable: true, get: function () { return utils_1.calculateMovingAverage; } });
Object.defineProperty(exports, "getKPIStatus", { enumerable: true, get: function () { return utils_1.getKPIStatus; } });
Object.defineProperty(exports, "getKPIStatusColor", { enumerable: true, get: function () { return utils_1.getKPIStatusColor; } });
Object.defineProperty(exports, "getTrendColor", { enumerable: true, get: function () { return utils_1.getTrendColor; } });
Object.defineProperty(exports, "getDateRangePreset", { enumerable: true, get: function () { return utils_1.getDateRangePreset; } });
Object.defineProperty(exports, "sortKPIs", { enumerable: true, get: function () { return utils_1.sortKPIs; } });
Object.defineProperty(exports, "filterAlerts", { enumerable: true, get: function () { return utils_1.filterAlerts; } });
Object.defineProperty(exports, "generateMockTimeSeries", { enumerable: true, get: function () { return utils_1.generateMockTimeSeries; } });
Object.defineProperty(exports, "calculateStatistics", { enumerable: true, get: function () { return utils_1.calculateStatistics; } });
Object.defineProperty(exports, "detectAnomalies", { enumerable: true, get: function () { return utils_1.detectAnomalies; } });
Object.defineProperty(exports, "calculateCorrelation", { enumerable: true, get: function () { return utils_1.calculateCorrelation; } });
// Configuration
var config_1 = require("./config");
Object.defineProperty(exports, "DASHBOARD_CONFIG", { enumerable: true, get: function () { return config_1.DASHBOARD_CONFIG; } });
Object.defineProperty(exports, "API_CONFIG", { enumerable: true, get: function () { return config_1.API_CONFIG; } });
Object.defineProperty(exports, "CHART_COLORS", { enumerable: true, get: function () { return config_1.CHART_COLORS; } });
Object.defineProperty(exports, "CHART_PALETTES", { enumerable: true, get: function () { return config_1.CHART_PALETTES; } });
Object.defineProperty(exports, "KPI_THRESHOLDS", { enumerable: true, get: function () { return config_1.KPI_THRESHOLDS; } });
Object.defineProperty(exports, "DEFAULT_KPI_CONFIGS", { enumerable: true, get: function () { return config_1.DEFAULT_KPI_CONFIGS; } });
Object.defineProperty(exports, "DEFAULT_CHART_CONFIGS", { enumerable: true, get: function () { return config_1.DEFAULT_CHART_CONFIGS; } });
Object.defineProperty(exports, "DEFAULT_ALERT_RULES", { enumerable: true, get: function () { return config_1.DEFAULT_ALERT_RULES; } });
Object.defineProperty(exports, "WIDGET_SIZES", { enumerable: true, get: function () { return config_1.WIDGET_SIZES; } });
Object.defineProperty(exports, "EXPORT_FORMATS", { enumerable: true, get: function () { return config_1.EXPORT_FORMATS; } });
Object.defineProperty(exports, "DATE_RANGE_PRESETS", { enumerable: true, get: function () { return config_1.DATE_RANGE_PRESETS; } });
Object.defineProperty(exports, "PERFORMANCE_BENCHMARKS", { enumerable: true, get: function () { return config_1.PERFORMANCE_BENCHMARKS; } });
Object.defineProperty(exports, "ERROR_MESSAGES", { enumerable: true, get: function () { return config_1.ERROR_MESSAGES; } });
Object.defineProperty(exports, "SUCCESS_MESSAGES", { enumerable: true, get: function () { return config_1.SUCCESS_MESSAGES; } });
Object.defineProperty(exports, "FEATURE_FLAGS", { enumerable: true, get: function () { return config_1.FEATURE_FLAGS; } });
Object.defineProperty(exports, "API_ENDPOINTS", { enumerable: true, get: function () { return config_1.API_ENDPOINTS; } });
Object.defineProperty(exports, "CACHE_KEYS", { enumerable: true, get: function () { return config_1.CACHE_KEYS; } });
Object.defineProperty(exports, "STORAGE_KEYS", { enumerable: true, get: function () { return config_1.STORAGE_KEYS; } });
Object.defineProperty(exports, "ANIMATIONS", { enumerable: true, get: function () { return config_1.ANIMATIONS; } });
// Re-export default configuration
var config_2 = require("./config");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return config_2.default; } });
var services_2 = require("./services");
Object.defineProperty(exports, "services", { enumerable: true, get: function () { return services_2.default; } });
// Utility function to create a complete KPI dashboard setup
var createKPIDashboard = function (_a) {
    var containerId = _a.containerId, _b = _a.initialFilters, initialFilters = _b === void 0 ? {} : _b, _c = _a.enableRealtime, enableRealtime = _c === void 0 ? true : _c, _d = _a.enableExport, enableExport = _d === void 0 ? true : _d, _e = _a.enableSharing, enableSharing = _e === void 0 ? true : _e, _f = _a.customConfig, customConfig = _f === void 0 ? {} : _f;
    // Merge custom configuration
    var config = __assign(__assign({}, DASHBOARD_CONFIG), customConfig);
    return {
        containerId: containerId,
        config: config,
        props: {
            initialFilters: initialFilters,
            enableRealtime: enableRealtime,
            enableExport: enableExport,
            enableSharing: enableSharing
        }
    };
};
exports.createKPIDashboard = createKPIDashboard;
// Utility function to validate KPI configuration
var validateKPIConfig = function (config) {
    var required = ['id', 'name', 'formula', 'dataSource'];
    return required.every(function (field) { return field in config && config[field]; });
};
exports.validateKPIConfig = validateKPIConfig;
// Utility function to create custom alert rules
var createAlertRule = function (_a) {
    var kpiId = _a.kpiId, name = _a.name, condition = _a.condition, _b = _a.severity, severity = _b === void 0 ? 'warning' : _b, _c = _a.notifications, notifications = _c === void 0 ? { email: true, sms: false, push: true } : _c;
    return {
        id: "alert-".concat(Date.now()),
        name: name,
        kpiId: kpiId,
        condition: condition,
        severity: severity,
        notifications: notifications,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
};
exports.createAlertRule = createAlertRule;
// Utility function to create custom chart configuration
var createChartConfig = function (_a) {
    var type = _a.type, title = _a.title, subtitle = _a.subtitle, xAxisLabel = _a.xAxisLabel, yAxisLabel = _a.yAxisLabel, series = _a.series, _b = _a.colors, colors = _b === void 0 ? CHART_COLORS : _b;
    return {
        type: type,
        title: title,
        subtitle: subtitle,
        xAxis: {
            label: xAxisLabel,
            type: type === 'pie' ? 'category' : 'datetime'
        },
        yAxis: {
            label: yAxisLabel,
            format: yAxisLabel.includes('R$') ? 'currency' :
                yAxisLabel.includes('%') ? 'percentage' : 'number'
        },
        series: series,
        legend: true,
        grid: type !== 'pie',
        tooltip: true,
        zoom: type === 'line',
        responsive: true
    };
};
exports.createChartConfig = createChartConfig;
// Version information
exports.VERSION = '1.0.0';
exports.BUILD_DATE = new Date().toISOString();
// Feature detection
exports.FEATURES = {
    REALTIME_UPDATES: typeof WebSocket !== 'undefined',
    LOCAL_STORAGE: typeof localStorage !== 'undefined',
    NOTIFICATIONS: typeof Notification !== 'undefined',
    PERFORMANCE_API: typeof performance !== 'undefined',
    INTERSECTION_OBSERVER: typeof IntersectionObserver !== 'undefined'
};
// Browser compatibility check
var checkBrowserCompatibility = function () {
    var requiredFeatures = {
        'ES6 Modules': typeof , import:  !== 'undefined',
        'Fetch API': typeof fetch !== 'undefined',
        'Promise': typeof Promise !== 'undefined',
        'Local Storage': typeof localStorage !== 'undefined'
    };
    var missingFeatures = Object.entries(requiredFeatures)
        .filter(function (_a) {
        var supported = _a[1];
        return !supported;
    })
        .map(function (_a) {
        var feature = _a[0];
        return feature;
    });
    return {
        isCompatible: missingFeatures.length === 0,
        missingFeatures: missingFeatures
    };
};
exports.checkBrowserCompatibility = checkBrowserCompatibility;
// Debug utilities (only in development)
if (process.env.NODE_ENV === 'development') {
    window.KPIDashboardDebug = {
        config: DASHBOARD_CONFIG,
        services: { FinancialKPIService: FinancialKPIService, SupabaseKPIService: SupabaseKPIService, PerformanceService: PerformanceService },
        utils: { formatCurrency: formatCurrency, formatPercentage: formatPercentage, calculateTrend: calculateTrend },
        features: exports.FEATURES,
        version: exports.VERSION
    };
}
// Default export for convenience
exports.default = {
    FinancialKPIDashboard: FinancialKPIDashboard,
    KPIFilters: KPIFilters,
    KPIDrillDown: KPIDrillDown,
    useFinancialKPIs: useFinancialKPIs,
    FinancialKPIService: FinancialKPIService,
    SupabaseKPIService: SupabaseKPIService,
    PerformanceService: PerformanceService,
    config: DASHBOARD_CONFIG,
    version: exports.VERSION
};
