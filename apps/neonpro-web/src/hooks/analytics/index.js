"use strict";
/**
 * Analytics Hooks Index for NeonPro
 *
 * Central export point for all analytics-related React hooks.
 * Provides convenient access to comprehensive analytics capabilities including:
 * - Cohort analysis and retention tracking
 * - Advanced forecasting and predictions
 * - Real-time analytics dashboard
 * - Statistical insights and correlations
 *
 * All hooks integrate with NeonPro's advanced analytics backend
 * and provide UI-ready data formats.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnalyticsFilters =
  exports.useAnalyticsExport =
  exports.useAnalyticsDashboard =
  exports.useStatisticalFormatters =
  exports.useMetricBenchmarking =
  exports.useABTestAnalysis =
  exports.useStatisticalInsights =
  exports.useUserActivityMonitoring =
  exports.usePerformanceMonitoring =
  exports.useRealTimeAnalytics =
  exports.useForecastFormatters =
  exports.useForecastAccuracy =
  exports.useRealTimeForecastUpdates =
  exports.useForecastComparison =
  exports.useForecasting =
  exports.useCohortDataFormatters =
  exports.useCohortInsights =
  exports.useRealTimeCohortMetrics =
  exports.useCohortComparison =
  exports.useCohortAnalysis =
    void 0;
// Core analytics hooks
var use_cohort_analysis_1 = require("./use-cohort-analysis");
Object.defineProperty(exports, "useCohortAnalysis", {
  enumerable: true,
  get: function () {
    return use_cohort_analysis_1.useCohortAnalysis;
  },
});
Object.defineProperty(exports, "useCohortComparison", {
  enumerable: true,
  get: function () {
    return use_cohort_analysis_1.useCohortComparison;
  },
});
Object.defineProperty(exports, "useRealTimeCohortMetrics", {
  enumerable: true,
  get: function () {
    return use_cohort_analysis_1.useRealTimeCohortMetrics;
  },
});
Object.defineProperty(exports, "useCohortInsights", {
  enumerable: true,
  get: function () {
    return use_cohort_analysis_1.useCohortInsights;
  },
});
Object.defineProperty(exports, "useCohortDataFormatters", {
  enumerable: true,
  get: function () {
    return use_cohort_analysis_1.useCohortDataFormatters;
  },
});
var use_forecasting_1 = require("./use-forecasting");
Object.defineProperty(exports, "useForecasting", {
  enumerable: true,
  get: function () {
    return use_forecasting_1.useForecasting;
  },
});
Object.defineProperty(exports, "useForecastComparison", {
  enumerable: true,
  get: function () {
    return use_forecasting_1.useForecastComparison;
  },
});
Object.defineProperty(exports, "useRealTimeForecastUpdates", {
  enumerable: true,
  get: function () {
    return use_forecasting_1.useRealTimeForecastUpdates;
  },
});
Object.defineProperty(exports, "useForecastAccuracy", {
  enumerable: true,
  get: function () {
    return use_forecasting_1.useForecastAccuracy;
  },
});
Object.defineProperty(exports, "useForecastFormatters", {
  enumerable: true,
  get: function () {
    return use_forecasting_1.useForecastFormatters;
  },
});
var use_real_time_analytics_1 = require("./use-real-time-analytics");
Object.defineProperty(exports, "useRealTimeAnalytics", {
  enumerable: true,
  get: function () {
    return use_real_time_analytics_1.useRealTimeAnalytics;
  },
});
Object.defineProperty(exports, "usePerformanceMonitoring", {
  enumerable: true,
  get: function () {
    return use_real_time_analytics_1.usePerformanceMonitoring;
  },
});
Object.defineProperty(exports, "useUserActivityMonitoring", {
  enumerable: true,
  get: function () {
    return use_real_time_analytics_1.useUserActivityMonitoring;
  },
});
var use_statistical_insights_1 = require("./use-statistical-insights");
Object.defineProperty(exports, "useStatisticalInsights", {
  enumerable: true,
  get: function () {
    return use_statistical_insights_1.useStatisticalInsights;
  },
});
Object.defineProperty(exports, "useABTestAnalysis", {
  enumerable: true,
  get: function () {
    return use_statistical_insights_1.useABTestAnalysis;
  },
});
Object.defineProperty(exports, "useMetricBenchmarking", {
  enumerable: true,
  get: function () {
    return use_statistical_insights_1.useMetricBenchmarking;
  },
});
Object.defineProperty(exports, "useStatisticalFormatters", {
  enumerable: true,
  get: function () {
    return use_statistical_insights_1.useStatisticalFormatters;
  },
});
// Combined hook for comprehensive analytics dashboard
var use_analytics_dashboard_1 = require("./use-analytics-dashboard");
Object.defineProperty(exports, "useAnalyticsDashboard", {
  enumerable: true,
  get: function () {
    return use_analytics_dashboard_1.useAnalyticsDashboard;
  },
});
// Utility hooks for common analytics operations
var use_analytics_export_1 = require("./use-analytics-export");
Object.defineProperty(exports, "useAnalyticsExport", {
  enumerable: true,
  get: function () {
    return use_analytics_export_1.useAnalyticsExport;
  },
});
var use_analytics_filters_1 = require("./use-analytics-filters");
Object.defineProperty(exports, "useAnalyticsFilters", {
  enumerable: true,
  get: function () {
    return use_analytics_filters_1.useAnalyticsFilters;
  },
});
