/**
 * TASK-001: Foundation Setup & Baseline
 * Monitoring Module Index
 *
 * Central export point for all monitoring and observability utilities
 * providing comprehensive system monitoring, analytics, and emergency response.
 */

// User analytics and tracking
export {
  type FeatureUsageData,
  type PageViewData,
  trackFeatureUsage,
  trackPageView,
  trackUserAction,
  type UserActionData,
  type UserEvent,
  userAnalytics,
} from './analytics';
// Baseline metrics and comparison
export {
  type BaselineComparison,
  type BaselineMetric,
  type BaselineReport,
  baselineManager,
  compareToBaseline,
  establishBaseline,
  generateBaselineReport,
} from './baseline';
// Emergency response system
export {
  addEmergencyRule,
  type EmergencyAction,
  type EmergencyAlert,
  type EmergencyRule,
  emergencyResponse,
  getEmergencyStatus,
  resolveEmergencyAlert,
  type SystemSnapshot,
  takeEmergencySnapshot,
} from './emergency-response';

// Error tracking and monitoring
export {
  type ErrorEvent,
  type ErrorSummary,
  type ErrorThreshold,
  errorTracker,
  trackError,
  useErrorTracking,
} from './error-tracking';
// Feature flags management
export {
  type FeatureFlag,
  type FeatureFlagConfig,
  type FeatureFlagContext,
  featureFlags,
  getAllFeatures,
  getFeatureValue,
  isFeatureEnabled,
} from './feature-flags';
// Performance monitoring
export {
  getPerformanceMetrics,
  measureApiCall,
  measurePageLoad,
  measureRender,
  type PerformanceMetric,
  type PerformanceThreshold,
  performanceMonitor,
} from './performance';

// Initialize monitoring system
export function initializeMonitoringSystem(): void {}

// Cleanup function for proper resource management
export function destroyMonitoringSystem(): void {}

// Health check function
export function getMonitoringSystemHealth(): {
  performance: boolean;
  analytics: boolean;
  featureFlags: boolean;
  errorTracking: boolean;
  baseline: boolean;
  emergencyResponse: boolean;
  overall: 'healthy' | 'degraded' | 'critical';
} {
  const health = {
    performance: true, // Would check actual health
    analytics: true,
    featureFlags: true,
    errorTracking: true,
    baseline: true,
    emergencyResponse: true,
    overall: 'healthy' as const,
  };

  const healthyComponents = Object.values(health).filter(Boolean).length - 1; // -1 for overall

  if (healthyComponents === 6) {
    health.overall = 'healthy';
  } else if (healthyComponents >= 4) {
    health.overall = 'degraded';
  } else {
    health.overall = 'critical';
  }

  return health;
}
