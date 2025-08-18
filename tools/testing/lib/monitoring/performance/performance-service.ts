// Main monitoring performance service - ensures compatibility with test expectations
export { default as PerformanceService } from '../performance';
export { default as PerformanceMonitor } from '../performance-monitor';
export { monitoringPerformanceIntegration } from './index';

// Re-export types
export type { PerformanceMetric, WebVital } from '../performance';
export type { HealthcarePerformanceMetrics } from '../performance-monitor';

// CommonJS compatibility
module.exports = {
  PerformanceService: require('../performance').default,
  PerformanceMonitor: require('../performance-monitor').default,
  monitoringPerformanceIntegration: require('./index').monitoringPerformanceIntegration,
};