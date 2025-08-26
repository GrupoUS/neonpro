/**
 * NeonPro AI Prediction Engine - Main Export
 * Comprehensive aesthetic treatment prediction system with 85%+ accuracy
 *
 * Features:
 * - 7 specialized ML models for different treatment types
 * - Real-time inference with <2s response time
 * - Comprehensive risk assessment and safety recommendations
 * - LGPD compliant data processing
 * - Performance monitoring and accuracy tracking
 */

// Analytics
export { predictionPerformanceMonitor } from "./analytics/performance-monitor";
// API Layer
export { aestheticInferenceAPI } from "./api/inference-api";
export { AestheticFeatureExtractor } from "./core/feature-extractor";
// Core Components
export { aiModelManager } from "./core/model-manager";
export { AestheticPostProcessor } from "./core/post-processor";
export { aestheticPredictionEngine } from "./core/prediction-engine";

// Integration
export { neonproAIIntegration } from "./integrations/neonpro-integration";

// Types
export type * from "./types";
export type * from "./types/prediction-results";

// Utility functions for easy integration
export {
  createPatientProfile,
  createTreatmentRequest,
  initializeAIPredictionEngine,
} from "./utils/helpers";

/**
 * Quick Start Usage Example:
 *
 * ```typescript
 * import { initializeAIPredictionEngine, neonproAIIntegration } from '@neonpro/ai/prediction';
 *
 * // Initialize the AI system
 * await initializeAIPredictionEngine();
 *
 * // Get treatment recommendation
 * const result = await neonproAIIntegration.getTreatmentRecommendation(
 *   'patient-123',
 *   'botox',
 *   ['forehead', 'crows-feet']
 * );
 *
 * if (result.success) {
 *   console.log('Treatment Plan:', result.recommendation.treatmentPlan);
 *   console.log('Risk Assessment:', result.recommendation.riskProfile);
 *   console.log('Success Probability:', result.recommendation.successProbability);
 * }
 * ```
 */
