/**
 * Prediction Result Types for NeonPro AI Engine
 */

export interface PredictionResult {
  modelType: string;
  confidence: number; // 0-1 scale
  accuracy: number; // Model's known accuracy
  timestamp: Date;
  version: string;
  inputs: PredictionInputs;
  outputs: PredictionOutputs;
  metadata: PredictionMetadata;
}

export interface PredictionInputs {
  patientFeatures: number[];
  treatmentFeatures: number[];
  contextualFeatures: number[];
  featureNames: string[];
}

export interface PredictionOutputs {
  primary: number | number[];
  secondary?: number | number[];
  confidence: number;
  alternatives?: AlternativePrediction[];
}

export interface AlternativePrediction {
  prediction: number | number[];
  confidence: number;
  reasoning: string;
}

export interface PredictionMetadata {
  processingTime: number; // milliseconds
  modelVersion: string;
  featureImportance?: FeatureImportance[];
  uncertainty?: UncertaintyMetrics;
  recommendations?: string[];
}
