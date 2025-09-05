// Deprecated: Re-exporting from @neonpro/ui
// This package has been merged into @neonpro/ui. Please migrate imports to @neonpro/ui/components/dashboard/health/*.

export { CacheMetrics } from "@neonpro/ui/components/dashboard/health/cache-metrics";
export { PerformanceDashboard } from "@neonpro/ui/components/dashboard/health/dashboard";
export { MetricWidget, ROIMetric } from "@neonpro/ui/components/dashboard/health/metric-widgets";

// Previous type exports are kept for compatibility
export type {
  Alert,
  HealthCheckResult,
  PerformanceInsight,
  PerformanceMetric,
} from "@neonpro/monitoring";
