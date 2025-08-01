/**
 * Forecasting Components Index
 * Epic 11 - Story 11.1: Centralized exports for demand forecasting components
 * 
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

// Main forecasting components
export { ForecastChart } from './forecast-chart';
export { ForecastMetrics } from './forecast-metrics';
export { ResourceAllocation } from './resource-allocation';
export { ModelPerformance } from './model-performance';
export { ForecastAlerts } from './forecast-alerts';
export { ForecastConfiguration } from './forecast-configuration';

// Export all components as a single object for convenient importing
export * as ForecastingComponents from './index';