/**
 * @fileoverview ML Pipeline Module - Healthcare Analytics
 *
 * This module provides machine learning capabilities for healthcare analytics,
 * including interfaces for model providers and stub implementations for development.
 *
 * @example
 * ```typescript
 * import { StubModelProvider, PredictionInput } from '@neonpro/core-services/analytics/ml';
 *
 * const provider = new StubModelProvider();
 * await provider.initialize();
 *
 * const prediction = await provider.predict({
 *   type: 'readmission_risk',
 *   features: {
 *     age: 65,
 *     gender: 'male',
 *     medical_history: ['diabetes', 'hypertension'],
 *     current_symptoms: ['chest_pain'],
 *     vital_signs: { bp: '140/90', hr: 80 }
 *   }
 * });
 * ```
 */

// ============================================================================
// Core Interfaces
// ============================================================================

import type { PredictionType, PredictionInput } from "./interfaces";

import { StubModelProvider } from "./stub-provider";

export type {
  PredictionType,
  ConfidenceLevel,
  FeatureImportance,
  ModelMetadata,
  PredictionInput,
  PredictionResult,
  BatchPredictionInput,
  BatchPredictionResult,
  ModelProvider,
  ModelManager,
} from "./interfaces";

// ============================================================================
// Error Classes
// ============================================================================

export {
  MLError,
  InvalidInputError,
  ModelInitializationError,
  PredictionError,
} from "./interfaces";

// ============================================================================
// Stub Implementation
// ============================================================================

export { StubModelProvider };

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a stub model provider with default configuration
 *
 * @param overrides - Configuration overrides
 * @returns Configured stub model provider
 */
export function createStubModelProvider(overrides?: {
  id?: string;
  name?: string;
  version?: string;
  supportedTypes?: PredictionType[];
  accuracy?: number;
  latencyMs?: number;
  failureRate?: number;
}) {
  return new StubModelProvider(overrides);
}

/**
 * Validate prediction input structure
 *
 * @param input - Input to validate
 * @returns True if valid structure, throws error if not
 */
export function validatePredictionInputStructure(
  input: unknown,
): input is PredictionInput {
  if (!input || typeof input !== "object") {
    throw new Error("Prediction input must be an object");
  }

  const obj = input as Record<string, unknown>;

  if (!obj.type || typeof obj.type !== "string") {
    throw new Error("Prediction input must have a valid type");
  }

  if (!obj.features || typeof obj.features !== "object") {
    throw new Error("Prediction input must have features object");
  }

  return true;
}

/**
 * Create a mock prediction input for testing
 *
 * @param type - Prediction type
 * @param customFeatures - Custom features to include
 * @returns Mock prediction input
 */
export function createMockPredictionInput(
  type: PredictionType,
  customFeatures?: Record<string, unknown>,
): PredictionInput {
  const baseFeatures = {
    age: 45,
    gender: "female",
    medical_history: ["hypertension"],
    current_symptoms: ["headache"],
    vital_signs: {
      blood_pressure: "120/80",
      heart_rate: 72,
      temperature: 36.5,
    },
  };

  return {
    type,
    features: { ...baseFeatures, ...customFeatures },
    patientId: "patient-123",
    clinicId: "clinic-456",
    metadata: {
      timestamp: new Date().toISOString(),
      source: "test",
    },
  };
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Supported prediction types for healthcare analytics
 */
export const PREDICTION_TYPES: readonly PredictionType[] = [
  "patient_outcome",
  "readmission_risk",
  "treatment_effectiveness",
  "cost_prediction",
  "no_show_risk",
  "resource_utilization",
  "clinical_deterioration",
  "medication_adherence",
] as const;

/**
 * Standard confidence thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.0,
} as const;

/**
 * Default timeout for prediction operations (ms)
 */
export const DEFAULT_PREDICTION_TIMEOUT_MS = 5000;

/**
 * Maximum batch size for batch predictions
 */
export const MAX_BATCH_SIZE = 100;
