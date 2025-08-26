/**
 * @fileoverview ML Pipeline Types for Healthcare AI
 * @description Types for model management, A/B testing, and drift detection
 * @version 1.0.0
 */

import type { BaseEntity } from './common';

// Core ML Pipeline Types
export interface ModelVersion extends BaseEntity {
  model_name: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  status: 'training' | 'active' | 'retired' | 'archived';
  deployment_date?: string;
  retired_date?: string;
  clinic_id: string;
  model_config: Record<string, any>;
  validation_metrics: Record<string, number>;
  notes?: string;
}

export interface ABTest extends BaseEntity {
  test_name: string;
  model_a_id: string;
  model_b_id: string;
  status: 'running' | 'completed' | 'paused' | 'cancelled';
  start_date: string;
  end_date?: string;
  traffic_split: number; // 0.0 to 1.0, percentage for model A
  clinic_id: string;
  description?: string;
  success_criteria: Record<string, any>;
}

export interface ABTestResult extends BaseEntity {
  test_id: string;
  model_id: string;
  model_version: string;
  sample_size: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  statistical_significance: boolean;
  p_value: number;
  clinic_id: string;
  evaluation_date: string;
}

export interface DriftDetection extends BaseEntity {
  model_id: string;
  drift_type: 'data' | 'prediction' | 'performance';
  detection_date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  drift_score: number;
  threshold: number;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  clinic_id: string;
  affected_metrics: string[];
  details: Record<string, any>;
}

export interface DriftDetectionResult {
  hasDrift: boolean;
  driftScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedFeatures: string[];
  details: Record<string, any>;
}

// Request/Response Types
export interface CreateModelVersionRequest {
  model_name: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  clinic_id: string;
  model_config: Record<string, any>;
  validation_metrics: Record<string, number>;
  notes?: string;
}

export interface CreateABTestRequest {
  test_name: string;
  model_a_id: string;
  model_b_id: string;
  traffic_split: number;
  clinic_id: string;
  description?: string;
  success_criteria: Record<string, any>;
  end_date?: string;
}

export interface DriftDetectionRequest {
  model_id: string;
  current_data: Record<string, any>[];
  reference_data?: Record<string, any>[];
  clinic_id: string;
}

// ML Pipeline Configuration
export interface MLPipelineConfig {
  drift_detection_threshold: number;
  model_performance_threshold: number;
  ab_test_min_sample_size: number;
  ab_test_significance_level: number;
  auto_retrain_enabled: boolean;
  model_retention_days: number;
}

// Analytics and Reporting Types
export interface ModelPerformanceMetrics {
  model_id: string;
  model_version: string;
  period_start: string;
  period_end: string;
  total_predictions: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  avg_confidence: number;
  error_rate: number;
  clinic_id: string;
}

export interface MLPipelineStatus {
  active_models: number;
  running_ab_tests: number;
  detected_drifts: number;
  models_needing_retrain: number;
  last_evaluation_date: string;
  overall_health: 'healthy' | 'warning' | 'critical';
}
