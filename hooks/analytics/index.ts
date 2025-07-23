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

// Core analytics hooks
export {
  useCohortAnalysis,
  useCohortComparison,
  useRealTimeCohortMetrics,
  useCohortInsights,
  useCohortDataFormatters,
  type CohortAnalysisHookConfig,
  type CohortAnalysisState,
  type CohortAnalysisActions
} from './use-cohort-analysis'

export {
  useForecasting,
  useForecastComparison,
  useRealTimeForecastUpdates,
  useForecastAccuracy,
  useForecastFormatters,
  type ForecastingHookConfig,
  type ForecastingState,
  type ForecastingActions
} from './use-forecasting'

export {
  useRealTimeAnalytics,
  usePerformanceMonitoring,
  useUserActivityMonitoring,
  type RealTimeMetrics,
  type RealTimeConfig,
  type RealTimeState,
  type RealTimeActions
} from './use-real-time-analytics'

export {
  useStatisticalInsights,
  useABTestAnalysis,
  useMetricBenchmarking,
  useStatisticalFormatters,
  type StatisticalInsightsConfig,
  type CorrelationAnalysis,
  type AnomalyDetection,
  type PredictiveInsight,
  type StatisticalInsightsState,
  type StatisticalInsightsActions
} from './use-statistical-insights'

// Combined hook for comprehensive analytics dashboard
export { useAnalyticsDashboard } from './use-analytics-dashboard'

// Utility hooks for common analytics operations
export { useAnalyticsExport } from './use-analytics-export'
export { useAnalyticsFilters } from './use-analytics-filters'