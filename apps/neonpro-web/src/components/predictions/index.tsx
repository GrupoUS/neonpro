/**
 * Story 11.2: Predictions Components - Centralized Exports
 * Export all prediction-related components for easy importing
 */

export type {
  AutomationRule,
  Intervention,
  InterventionTemplate,
} from "./intervention-management";
export { InterventionManagement } from "./intervention-management";
export type {
  ModelPerformance,
  PredictionAccuracy,
  TrendData,
} from "./prediction-analytics";
export { PredictionAnalytics } from "./prediction-analytics";
export { PredictionConfiguration } from "./prediction-configuration";
// Types and Interfaces
export type {
  AnalyticsMetrics,
  InterventionStatus,
  InterventionType,
  OptimizationStrategy,
  PredictionData,
  PredictionTrend,
  RiskFactorData,
  RiskLevel,
  WaitlistEntry,
} from "./prediction-overview";
// Main Components
export { PredictionOverview } from "./prediction-overview";

export type {
  FactorCategory,
  RiskFactor,
  RiskFactorWeight,
} from "./risk-factors";
export { RiskFactors } from "./risk-factors";

export type {
  OptimizationResult,
  SlotRecommendation,
  WaitlistAnalytics,
} from "./waitlist-optimization";
export { WaitlistOptimization } from "./waitlist-optimization";
