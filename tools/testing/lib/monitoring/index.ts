// Main monitoring index - exports all monitoring utilities
export { default as AnalyticsService } from './analytics';
export { default as ErrorTrackingService } from './error-tracking';
export { default as FeatureFlagsService } from './feature-flags';
export { default as PerformanceService } from './performance';
export { default as BaselineMonitoringService } from './baseline';
export { default as EmergencyResponseService } from './emergency-response';
export { default as PerformanceMonitor } from './performance-monitor';

// Re-export types
export type { AnalyticsEvent } from './analytics';
export type { ErrorEvent } from './error-tracking';
export type { FeatureFlag } from './feature-flags';
export type { PerformanceMetric, WebVital } from './performance';
export type { BaselineMetric } from './baseline';
export type { EmergencyEvent } from './emergency-response';
export type { HealthcarePerformanceMetrics } from './performance-monitor';

// Common monitoring interface
export interface MonitoringConfig {
  analytics: boolean;
  errorTracking: boolean;
  performance: boolean;
  emergency: boolean;
}

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  analytics: true,
  errorTracking: true,
  performance: true,
  emergency: true
};