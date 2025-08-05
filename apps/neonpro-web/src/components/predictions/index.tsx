/**
 * Story 11.2: Predictions Components - Centralized Exports
 * Export all prediction-related components for easy importing
 */

// Main Components
export { PredictionOverview } from "./prediction-overview";
export { RiskFactors } from "./risk-factors";
export { InterventionManagement } from "./intervention-management";
export { WaitlistOptimization } from "./waitlist-optimization";
export { PredictionAnalytics } from "./prediction-analytics";
export { PredictionConfiguration } from "./prediction-configuration";

// Types and Interfaces
export type {
  PredictionData,
  RiskLevel,
  RiskFactorData,
  InterventionType,
  InterventionStatus,
  WaitlistEntry,
  OptimizationStrategy,
  AnalyticsMetrics,
  PredictionTrend,
} from "./prediction-overview";

export type {
  RiskFactor,
  FactorCategory,
  RiskFactorWeight,
} from "./risk-factors";

export type {
  Intervention,
  InterventionTemplate,
  AutomationRule,
} from "./intervention-management";

export type {
  OptimizationResult,
  WaitlistAnalytics,
  SlotRecommendation,
} from "./waitlist-optimization";

export type {
  ModelPerformance,
  PredictionAccuracy,
  TrendData,
} from "./prediction-analytics";
