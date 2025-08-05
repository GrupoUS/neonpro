// Story 11.2: No-Show Prediction System Types
// ≥80% accuracy requirement with multi-factor analysis
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskFactorAnalysisSchema =
  exports.NoShowDashboardStatsSchema =
  exports.NoShowTrendsSchema =
  exports.ModelPerformanceSchema =
  exports.PredictionAnalysisSchema =
  exports.UpdateInterventionInputSchema =
  exports.CreateInterventionInputSchema =
  exports.CreateRiskFactorInputSchema =
  exports.UpdatePredictionInputSchema =
  exports.CreatePredictionInputSchema =
  exports.NoShowAnalyticsSchema =
  exports.InterventionStrategySchema =
  exports.RiskFactorSchema =
  exports.NoShowPredictionSchema =
  exports.InterventionOutcome =
  exports.AppointmentOutcome =
  exports.InterventionType =
  exports.RiskFactorType =
    void 0;
var zod_1 = require("zod");
// Base enums
exports.RiskFactorType = zod_1.z.enum([
  "historical_attendance",
  "appointment_timing",
  "demographics",
  "communication_response",
  "weather_sensitivity",
  "distance_travel",
  "appointment_type",
  "day_of_week",
  "season",
  "confirmation_pattern",
]);
exports.InterventionType = zod_1.z.enum([
  "targeted_reminder",
  "confirmation_request",
  "incentive_offer",
  "flexible_rescheduling",
  "personal_call",
  "priority_booking",
]);
exports.AppointmentOutcome = zod_1.z.enum(["attended", "no_show", "cancelled", "rescheduled"]);
exports.InterventionOutcome = zod_1.z.enum(["successful", "failed", "no_response"]);
// Core schemas
exports.NoShowPredictionSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  appointment_id: zod_1.z.string().uuid(),
  patient_id: zod_1.z.string().uuid(),
  risk_score: zod_1.z.number().min(0).max(1),
  prediction_confidence: zod_1.z.number().min(0).max(1),
  prediction_date: zod_1.z.string().datetime(),
  factors_analyzed: zod_1.z.record(zod_1.z.any()),
  intervention_recommended: zod_1.z.boolean(),
  actual_outcome: exports.AppointmentOutcome.optional(),
  prediction_accuracy: zod_1.z.number().min(0).max(1).optional(),
  model_version: zod_1.z.string(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.RiskFactorSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  patient_id: zod_1.z.string().uuid(),
  factor_type: exports.RiskFactorType,
  factor_value: zod_1.z.number(),
  weight_score: zod_1.z.number().min(0).max(1),
  last_updated: zod_1.z.string().datetime(),
  calculation_details: zod_1.z.record(zod_1.z.any()),
  created_at: zod_1.z.string().datetime(),
});
exports.InterventionStrategySchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  prediction_id: zod_1.z.string().uuid(),
  intervention_type: exports.InterventionType,
  trigger_time: zod_1.z.string().datetime(),
  executed_at: zod_1.z.string().datetime().optional(),
  effectiveness_score: zod_1.z.number().min(0).max(1).optional(),
  intervention_details: zod_1.z.record(zod_1.z.any()),
  result_outcome: exports.InterventionOutcome.optional(),
  cost_impact: zod_1.z.number(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
exports.NoShowAnalyticsSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  date: zod_1.z.string().date(),
  predicted_no_shows: zod_1.z.number().int().min(0),
  actual_no_shows: zod_1.z.number().int().min(0),
  accuracy_rate: zod_1.z.number().min(0).max(1),
  cost_impact: zod_1.z.number(),
  revenue_recovered: zod_1.z.number(),
  interventions_executed: zod_1.z.number().int().min(0),
  model_performance_metrics: zod_1.z.record(zod_1.z.any()),
  clinic_id: zod_1.z.string().uuid(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
// Input schemas for API endpoints
exports.CreatePredictionInputSchema = zod_1.z.object({
  appointment_id: zod_1.z.string().uuid(),
  patient_id: zod_1.z.string().uuid(),
  risk_score: zod_1.z.number().min(0).max(1),
  prediction_confidence: zod_1.z.number().min(0).max(1),
  factors_analyzed: zod_1.z.record(zod_1.z.any()),
  intervention_recommended: zod_1.z.boolean(),
  model_version: zod_1.z.string().default("v1.0"),
});
exports.UpdatePredictionInputSchema = zod_1.z.object({
  risk_score: zod_1.z.number().min(0).max(1).optional(),
  prediction_confidence: zod_1.z.number().min(0).max(1).optional(),
  factors_analyzed: zod_1.z.record(zod_1.z.any()).optional(),
  intervention_recommended: zod_1.z.boolean().optional(),
  actual_outcome: exports.AppointmentOutcome.optional(),
});
exports.CreateRiskFactorInputSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  factor_type: exports.RiskFactorType,
  factor_value: zod_1.z.number(),
  weight_score: zod_1.z.number().min(0).max(1),
  calculation_details: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.CreateInterventionInputSchema = zod_1.z.object({
  prediction_id: zod_1.z.string().uuid(),
  intervention_type: exports.InterventionType,
  trigger_time: zod_1.z.string().datetime(),
  intervention_details: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.UpdateInterventionInputSchema = zod_1.z.object({
  executed_at: zod_1.z.string().datetime().optional(),
  effectiveness_score: zod_1.z.number().min(0).max(1).optional(),
  intervention_details: zod_1.z.record(zod_1.z.any()).optional(),
  result_outcome: exports.InterventionOutcome.optional(),
  cost_impact: zod_1.z.number().optional(),
});
// Analysis and reporting schemas
exports.PredictionAnalysisSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  appointment_id: zod_1.z.string().uuid(),
  risk_factors: zod_1.z.array(exports.RiskFactorSchema),
  historical_pattern: zod_1.z.object({
    total_appointments: zod_1.z.number().int(),
    no_shows: zod_1.z.number().int(),
    attendance_rate: zod_1.z.number().min(0).max(1),
    last_attendance: zod_1.z.string().datetime().optional(),
  }),
  prediction_result: zod_1.z.object({
    risk_score: zod_1.z.number().min(0).max(1),
    confidence: zod_1.z.number().min(0).max(1),
    intervention_recommended: zod_1.z.boolean(),
    key_factors: zod_1.z.array(zod_1.z.string()),
  }),
});
exports.ModelPerformanceSchema = zod_1.z.object({
  model_version: zod_1.z.string(),
  accuracy_rate: zod_1.z.number().min(0).max(1),
  precision: zod_1.z.number().min(0).max(1),
  recall: zod_1.z.number().min(0).max(1),
  f1_score: zod_1.z.number().min(0).max(1),
  total_predictions: zod_1.z.number().int(),
  correct_predictions: zod_1.z.number().int(),
  false_positives: zod_1.z.number().int(),
  false_negatives: zod_1.z.number().int(),
  evaluation_period: zod_1.z.object({
    start_date: zod_1.z.string().date(),
    end_date: zod_1.z.string().date(),
  }),
});
exports.NoShowTrendsSchema = zod_1.z.object({
  period: zod_1.z.object({
    start_date: zod_1.z.string().date(),
    end_date: zod_1.z.string().date(),
  }),
  overall_stats: zod_1.z.object({
    total_appointments: zod_1.z.number().int(),
    predicted_no_shows: zod_1.z.number().int(),
    actual_no_shows: zod_1.z.number().int(),
    accuracy_rate: zod_1.z.number().min(0).max(1),
    cost_impact: zod_1.z.number(),
    revenue_recovered: zod_1.z.number(),
  }),
  trends_by_factor: zod_1.z.record(
    zod_1.z.object({
      factor_impact: zod_1.z.number().min(0).max(1),
      trend_direction: zod_1.z.enum(["increasing", "decreasing", "stable"]),
      correlation_strength: zod_1.z.number().min(-1).max(1),
    }),
  ),
  intervention_effectiveness: zod_1.z.record(
    zod_1.z.object({
      success_rate: zod_1.z.number().min(0).max(1),
      cost_per_prevention: zod_1.z.number(),
      roi: zod_1.z.number(),
    }),
  ),
});
// Dashboard visualization schemas
exports.NoShowDashboardStatsSchema = zod_1.z.object({
  today: zod_1.z.object({
    high_risk_appointments: zod_1.z.number().int(),
    interventions_scheduled: zod_1.z.number().int(),
    predicted_no_shows: zod_1.z.number().int(),
    estimated_cost_impact: zod_1.z.number(),
  }),
  this_week: zod_1.z.object({
    accuracy_rate: zod_1.z.number().min(0).max(1),
    interventions_executed: zod_1.z.number().int(),
    successful_interventions: zod_1.z.number().int(),
    revenue_saved: zod_1.z.number(),
  }),
  this_month: zod_1.z.object({
    total_predictions: zod_1.z.number().int(),
    model_accuracy: zod_1.z.number().min(0).max(1),
    cost_savings: zod_1.z.number(),
    trend_analysis: zod_1.z.string(),
  }),
});
exports.RiskFactorAnalysisSchema = zod_1.z.object({
  factor_type: exports.RiskFactorType,
  current_weight: zod_1.z.number().min(0).max(1),
  impact_score: zod_1.z.number().min(0).max(1),
  trend: zod_1.z.enum(["increasing", "decreasing", "stable"]),
  correlation_with_no_shows: zod_1.z.number().min(-1).max(1),
  sample_size: zod_1.z.number().int(),
  confidence_interval: zod_1.z.object({
    lower: zod_1.z.number(),
    upper: zod_1.z.number(),
  }),
});
