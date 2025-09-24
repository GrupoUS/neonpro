/**
 * @fileoverview ML Pipeline Interfaces for Healthcare Analytics
 *
 * Defines the core interfaces for machine learning model providers
 * and prediction services in the healthcare analytics system.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Supported prediction types for healthcare analytics
 */
export type PredictionType =
  | 'patient_outcome'
  | 'readmission_risk'
  | 'treatment_effectiveness'
  | 'cost_prediction'
  | 'no_show_risk'
  | 'resource_utilization'
  | 'clinical_deterioration'
  | 'medication_adherence';

/**
 * Model confidence levels
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

/**
 * Feature importance for model interpretability
 */
export interface FeatureImportance {
  /** Feature name */
  feature: string;
  /** Importance score (0-1) */
  importance: number;
  /** Human-readable description of the feature */
  description: string;
}

/**
 * Model metadata and configuration
 */
export interface ModelMetadata {
  /** Model identifier */
  id: string;
  /** Model name */
  name: string;
  /** Model version */
  version: string;
  /** Model type/algorithm */
  type: string;
  /** Model description */
  description: string;
  /** Training date */
  trainedAt: Date;
  /** Model accuracy metrics */
  accuracy?: number;
  /** Supported prediction types */
  supportedTypes: PredictionType[];
  /** Required features for prediction */
  requiredFeatures: string[];
}

// ============================================================================
// Input/Output Interfaces
// ============================================================================

/**
 * Generic input data for ML predictions
 */
export interface PredictionInput {
  /** Prediction type */
  type: PredictionType;
  /** Input features as key-value pairs */
  features: Record<string, unknown>;
  /** Optional patient ID for context */
  patientId?: string;
  /** Optional clinic ID for context */
  clinicId?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Prediction result from ML models
 */
export interface PredictionResult {
  /** Predicted value or classification */
  prediction: unknown;
  /** Confidence score (0-1) */
  confidence: number;
  /** Confidence level classification */
  confidenceLevel: ConfidenceLevel;
  /** Feature importance for interpretability */
  featureImportance?: FeatureImportance[];
  /** Additional metadata about the prediction */
  metadata?: Record<string, unknown>;
  /** Timestamp of prediction */
  timestamp: Date;
}

/**
 * Batch prediction input
 */
export interface BatchPredictionInput {
  /** Array of prediction inputs */
  inputs: PredictionInput[];
  /** Batch processing options */
  options?: {
    /** Maximum parallel predictions */
    maxConcurrency?: number;
    /** Timeout per prediction (ms) */
    timeoutMs?: number;
  };
}

/**
 * Batch prediction result
 */
export interface BatchPredictionResult {
  /** Array of prediction results */
  results: PredictionResult[];
  /** Batch processing statistics */
  stats: {
    /** Total predictions processed */
    total: number;
    /** Successful predictions */
    successful: number;
    /** Failed predictions */
    failed: number;
    /** Processing time (ms) */
    processingTimeMs: number;
  };
}

// ============================================================================
// Model Provider Interface
// ============================================================================

/**
 * Core interface for ML model providers
 *
 * This interface defines the contract that all ML model providers
 * must implement to be compatible with the healthcare analytics system.
 */
export interface ModelProvider {
  /**
   * Provider metadata
   */
  readonly metadata: ModelMetadata;

  /**
   * Initialize the model provider
   *
   * @param config - Provider-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  initialize(config?: Record<string, unknown>): Promise<void>;

  /**
   * Make a single prediction
   *
   * @param input - Prediction input data
   * @returns Promise with prediction result
   * @throws Error if prediction fails or input is invalid
   */
  predict(input: PredictionInput): Promise<PredictionResult>;

  /**
   * Make batch predictions
   *
   * @param input - Batch prediction input
   * @returns Promise with batch prediction results
   */
  batchPredict(input: BatchPredictionInput): Promise<BatchPredictionResult>;

  /**
   * Validate input features
   *
   * @param input - Input to validate
   * @returns True if input is valid, throws error with details if not
   */
  validateInput(input: PredictionInput): boolean;

  /**
   * Get model health status
   *
   * @returns Promise with health check result
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: Record<string, unknown>;
  }>;

  /**
   * Cleanup resources
   *
   * @returns Promise that resolves when cleanup is complete
   */
  dispose(): Promise<void>;
}

// ============================================================================
// Model Manager Interface
// ============================================================================

/**
 * Interface for managing multiple model providers
 */
export interface ModelManager {
  /**
   * Register a model provider
   *
   * @param provider - Model provider to register
   */
  registerProvider(provider: ModelProvider): Promise<void>;

  /**
   * Get a model provider by ID
   *
   * @param modelId - Model identifier
   * @returns Model provider or null if not found
   */
  getProvider(modelId: string): ModelProvider | null;

  /**
   * Get all registered providers
   *
   * @returns Array of registered providers
   */
  getAllProviders(): ModelProvider[];

  /**
   * Get providers by prediction type
   *
   * @param type - Prediction type
   * @returns Array of compatible providers
   */
  getProvidersByType(type: PredictionType): ModelProvider[];

  /**
   * Make prediction using best available model
   *
   * @param input - Prediction input
   * @returns Promise with prediction result
   */
  predict(input: PredictionInput): Promise<PredictionResult>;

  /**
   * Health check for all registered providers
   *
   * @returns Promise with health status of all providers
   */
  healthCheck(): Promise<
    Record<
      string,
      {
        status: 'healthy' | 'degraded' | 'unhealthy';
        details?: Record<string, unknown>;
      }
    >
  >;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base error for ML-related operations
 */
export class MLError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'MLError';
  }
}

/**
 * Error for invalid prediction input
 */
export class InvalidInputError extends MLError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INVALID_INPUT', details);
    this.name = 'InvalidInputError';
  }
}

/**
 * Error for model initialization failures
 */
export class ModelInitializationError extends MLError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'MODEL_INITIALIZATION_FAILED', details);
    this.name = 'ModelInitializationError';
  }
}

/**
 * Error for prediction failures
 */
export class PredictionError extends MLError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'PREDICTION_FAILED', details);
    this.name = 'PredictionError';
  }
}
