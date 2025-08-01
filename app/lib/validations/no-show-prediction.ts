// Story 11.2: No-Show Prediction Validation Schemas
// Comprehensive validation for ≥80% accuracy ML system

import { z } from 'zod';
import {
  RiskFactorType,
  InterventionType,
  AppointmentOutcome,
  InterventionOutcome,
  NoShowPredictionSchema,
  RiskFactorSchema,
  InterventionStrategySchema,
  NoShowAnalyticsSchema,
  CreatePredictionInputSchema,
  UpdatePredictionInputSchema,
  CreateRiskFactorInputSchema,
  CreateInterventionInputSchema,
  UpdateInterventionInputSchema,
  PredictionAnalysisSchema,
  ModelPerformanceSchema,
  NoShowTrendsSchema,
  NoShowDashboardStatsSchema,
  RiskFactorAnalysisSchema
} from '@/app/types/no-show-prediction';

// API Query Parameters Validation
export const GetPredictionsQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  risk_threshold: z.number().min(0).max(1).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  intervention_recommended: z.boolean().optional(),
  model_version: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['risk_score', 'prediction_date', 'accuracy']).default('prediction_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export const GetRiskFactorsQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  factor_type: RiskFactorType.optional(),
  min_weight: z.number().min(0).max(1).optional(),
  updated_since: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['weight_score', 'last_updated', 'factor_value']).default('last_updated'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export const GetInterventionsQuerySchema = z.object({
  prediction_id: z.string().uuid().optional(),
  intervention_type: InterventionType.optional(),
  status: z.enum(['scheduled', 'executed', 'failed']).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  effectiveness_threshold: z.number().min(0).max(1).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['trigger_time', 'effectiveness_score', 'cost_impact']).default('trigger_time'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export const GetAnalyticsQuerySchema = z.object({
  clinic_id: z.string().uuid().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  min_accuracy: z.number().min(0).max(1).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['date', 'accuracy_rate', 'cost_impact']).default('date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Batch Operations Validation
export const BatchPredictionInputSchema = z.object({
  predictions: z.array(CreatePredictionInputSchema).min(1).max(50),
  model_version: z.string().default('v1.0'),
  force_update: z.boolean().default(false)
});

export const BatchRiskFactorInputSchema = z.object({
  risk_factors: z.array(CreateRiskFactorInputSchema).min(1).max(100),
  recalculate_weights: z.boolean().default(true)
});

export const BatchInterventionInputSchema = z.object({
  interventions: z.array(CreateInterventionInputSchema).min(1).max(20),
  schedule_immediately: z.boolean().default(false)
});

// Model Training and Evaluation Validation
export const ModelTrainingInputSchema = z.object({
  training_data_period: z.object({
    start_date: z.string().date(),
    end_date: z.string().date()
  }),
  feature_config: z.object({
    enabled_factors: z.array(RiskFactorType).min(1),
    weight_adjustments: z.record(z.number().min(0).max(1)).optional(),
    custom_features: z.array(z.string()).optional()
  }),
  model_parameters: z.object({
    algorithm: z.enum(['random_forest', 'gradient_boosting', 'neural_network']).default('random_forest'),
    hyperparameters: z.record(z.any()).optional(),
    validation_split: z.number().min(0.1).max(0.5).default(0.2)
  }),
  target_accuracy: z.number().min(0.8).max(1).default(0.85),
  retrain_existing: z.boolean().default(false)
});

export const ModelEvaluationInputSchema = z.object({
  model_version: z.string(),
  evaluation_period: z.object({
    start_date: z.string().date(),
    end_date: z.string().date()
  }),
  metrics_to_calculate: z.array(z.enum([
    'accuracy', 'precision', 'recall', 'f1_score', 
    'auc_roc', 'cost_effectiveness', 'intervention_success'
  ])).default(['accuracy', 'precision', 'recall', 'f1_score']),
  include_confusion_matrix: z.boolean().default(true)
});

// Dashboard and Reporting Validation
export const DashboardPeriodSchema = z.object({
  period_type: z.enum(['day', 'week', 'month', 'quarter', 'custom']),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  timezone: z.string().default('America/Sao_Paulo')
});

export const ReportGenerationInputSchema = z.object({
  report_type: z.enum(['accuracy_report', 'intervention_effectiveness', 'cost_analysis', 'trend_analysis']),
  period: DashboardPeriodSchema,
  clinic_id: z.string().uuid().optional(),
  include_recommendations: z.boolean().default(true),
  format: z.enum(['pdf', 'excel', 'json']).default('pdf'),
  email_recipients: z.array(z.string().email()).optional()
});

export const AlertConfigurationSchema = z.object({
  alert_type: z.enum(['high_risk_surge', 'accuracy_drop', 'intervention_failure', 'cost_threshold']),
  trigger_conditions: z.object({
    threshold_value: z.number(),
    comparison_operator: z.enum(['greater_than', 'less_than', 'equals']),
    time_window_hours: z.number().int().min(1).max(168).default(24)
  }),
  notification_settings: z.object({
    email_enabled: z.boolean().default(true),
    sms_enabled: z.boolean().default(false),
    webhook_url: z.string().url().optional(),
    escalation_delay_minutes: z.number().int().min(5).max(1440).default(30)
  }),
  recipients: z.array(z.string().email()).min(1),
  active: z.boolean().default(true)
});

// Intervention Optimization Validation
export const InterventionOptimizationInputSchema = z.object({
  optimization_period: z.object({
    start_date: z.string().date(),
    end_date: z.string().date()
  }),
  current_strategies: z.array(InterventionType),
  success_criteria: z.object({
    min_success_rate: z.number().min(0).max(1).default(0.7),
    max_cost_per_prevention: z.number().min(0),
    target_roi: z.number().min(1).default(2)
  }),
  constraints: z.object({
    max_interventions_per_patient: z.number().int().min(1).max(10).default(3),
    excluded_patient_segments: z.array(z.string()).optional(),
    budget_limit: z.number().min(0).optional()
  })
});

// Risk Score Calibration Validation
export const RiskScoreCalibrationInputSchema = z.object({
  calibration_data_period: z.object({
    start_date: z.string().date(),
    end_date: z.string().date()
  }),
  target_segments: z.array(z.object({
    risk_range: z.object({
      min_score: z.number().min(0).max(1),
      max_score: z.number().min(0).max(1)
    }),
    expected_no_show_rate: z.number().min(0).max(1)
  })),
  calibration_method: z.enum(['platt_scaling', 'isotonic_regression']).default('platt_scaling'),
  validation_split: z.number().min(0.1).max(0.5).default(0.3)
});

// External Integration Validation
export const ExternalSystemSyncSchema = z.object({
  system_type: z.enum(['appointment_system', 'communication_platform', 'analytics_tool']),
  sync_config: z.object({
    api_endpoint: z.string().url(),
    authentication: z.object({
      type: z.enum(['api_key', 'oauth2', 'basic_auth']),
      credentials: z.record(z.string())
    }),
    sync_frequency_hours: z.number().int().min(1).max(24).default(4),
    data_mapping: z.record(z.string())
  }),
  data_validation: z.object({
    required_fields: z.array(z.string()),
    data_quality_checks: z.array(z.string()),
    error_handling: z.enum(['skip', 'retry', 'alert']).default('alert')
  })
});

// Response Schemas for API validation
export const PredictionResponseSchema = z.object({
  prediction: NoShowPredictionSchema,
  related_risk_factors: z.array(RiskFactorSchema),
  recommended_interventions: z.array(InterventionStrategySchema),
  confidence_breakdown: z.record(z.number())
});

export const AnalyticsResponseSchema = z.object({
  analytics: z.array(NoShowAnalyticsSchema),
  summary: z.object({
    total_records: z.number().int(),
    average_accuracy: z.number().min(0).max(1),
    total_cost_impact: z.number(),
    total_revenue_recovered: z.number()
  }),
  trends: z.array(z.object({
    date: z.string().date(),
    metric: z.string(),
    value: z.number(),
    change_percentage: z.number()
  }))
});

export const ModelPerformanceResponseSchema = z.object({
  performance: ModelPerformanceSchema,
  historical_comparison: z.array(z.object({
    model_version: z.string(),
    accuracy_rate: z.number().min(0).max(1),
    deployment_date: z.string().date()
  })),
  improvement_recommendations: z.array(z.object({
    category: z.string(),
    recommendation: z.string(),
    expected_impact: z.number().min(0).max(1),
    implementation_effort: z.enum(['low', 'medium', 'high'])
  }))
});

// Type exports for validation
export type GetPredictionsQuery = z.infer<typeof GetPredictionsQuerySchema>;
export type GetRiskFactorsQuery = z.infer<typeof GetRiskFactorsQuerySchema>;
export type GetInterventionsQuery = z.infer<typeof GetInterventionsQuerySchema>;
export type GetAnalyticsQuery = z.infer<typeof GetAnalyticsQuerySchema>;

export type BatchPredictionInput = z.infer<typeof BatchPredictionInputSchema>;
export type BatchRiskFactorInput = z.infer<typeof BatchRiskFactorInputSchema>;
export type BatchInterventionInput = z.infer<typeof BatchInterventionInputSchema>;

export type ModelTrainingInput = z.infer<typeof ModelTrainingInputSchema>;
export type ModelEvaluationInput = z.infer<typeof ModelEvaluationInputSchema>;

export type DashboardPeriod = z.infer<typeof DashboardPeriodSchema>;
export type ReportGenerationInput = z.infer<typeof ReportGenerationInputSchema>;
export type AlertConfiguration = z.infer<typeof AlertConfigurationSchema>;

export type InterventionOptimizationInput = z.infer<typeof InterventionOptimizationInputSchema>;
export type RiskScoreCalibrationInput = z.infer<typeof RiskScoreCalibrationInputSchema>;
export type ExternalSystemSync = z.infer<typeof ExternalSystemSyncSchema>;

export type PredictionResponse = z.infer<typeof PredictionResponseSchema>;
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;
export type ModelPerformanceResponse = z.infer<typeof ModelPerformanceResponseSchema>;