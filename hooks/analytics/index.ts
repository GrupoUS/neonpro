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

// Combined hook for comprehensive analytics dashboard
export { useAnalyticsDashboard } from './use-analytics-dashboard';
// Utility hooks for common analytics operations
export { useAnalyticsExport } from './use-analytics-export';
export { useAnalyticsFilters } from './use-analytics-filters';
// Core analytics hooks
export {
  type CohortAnalysisActions,
  type CohortAnalysisHookConfig,
  type CohortAnalysisState,
  useCohortAnalysis,
  useCohortComparison,
  useCohortDataFormatters,
  useCohortInsights,
  useRealTimeCohortMetrics,
} from './use-cohort-analysis';
export {
  type ForecastingActions,
  type ForecastingHookConfig,
  type ForecastingState,
  useForecastAccuracy,
  useForecastComparison,
  useForecastFormatters,
  useForecasting,
  useRealTimeForecastUpdates,
} from './use-forecasting';
export {
  type RealTimeActions,
  type RealTimeConfig,
  type RealTimeMetrics,
  type RealTimeState,
  usePerformanceMonitoring,
  useRealTimeAnalytics,
  useUserActivityMonitoring,
} from './use-real-time-analytics';
export {
  type AnomalyDetection,
  type CorrelationAnalysis,
  type PredictiveInsight,
  type StatisticalInsightsActions,
  type StatisticalInsightsConfig,
  type StatisticalInsightsState,
  useABTestAnalysis,
  useMetricBenchmarking,
  useStatisticalFormatters,
  useStatisticalInsights,
} from './use-statistical-insights';
