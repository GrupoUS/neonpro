/**
 * Prediction Result Types for NeonPro AI Engine
 */

export type PredictionResult = {
  modelType: string;
  confidence: number; // 0-1 scale
  accuracy: number; // Model's known accuracy
  timestamp: Date;
  version: string;
  inputs: PredictionInputs;
  outputs: PredictionOutputs;
  metadata: PredictionMetadata;
};

export type PredictionInputs = {
  patientFeatures: number[];
  treatmentFeatures: number[];
  contextualFeatures: number[];
  featureNames: string[];
};

export type PredictionOutputs = {
  primary: number | number[];
  secondary?: number | number[];
  confidence: number;
  alternatives?: AlternativePrediction[];
};

export type AlternativePrediction = {
  prediction: number | number[];
  confidence: number;
  reasoning: string;
};

export type FeatureImportance = {
  feature: string;
  importance: number;
  description?: string;
};

export type UncertaintyMetrics = {
  confidence: number;
  variance: number;
  range: [number, number];
};

export type PredictionMetadata = {
  processingTime: number; // milliseconds
  modelVersion: string;
  featureImportance?: FeatureImportance[];
  uncertainty?: UncertaintyMetrics;
  recommendations?: string[];
};
