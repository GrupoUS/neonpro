"use strict";
/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW VALIDATION SCHEMAS
 * =====================================================================================
 *
 * Zod validation schemas for predictive cash flow analysis system.
 * Provides comprehensive type-safe validation for AI-powered forecasting.
 *
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 *
 * Features:
 * - AI prediction model validation with accuracy constraints
 * - Multi-period forecasting validation
 * - Scenario planning validation with business rules
 * - Alert system validation with threshold management
 * - Comprehensive error handling and validation
 * =====================================================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createForecastingScenarioSchema =
  exports.createCashFlowPredictionSchema =
  exports.predictionPeriodTypeSchema =
  exports.ConfidenceRangeSchema =
  exports.AmountRangeSchema =
  exports.DateRangeSchema =
  exports.PaginationParamsSchema =
  exports.AlertFiltersSchema =
  exports.ScenarioFiltersSchema =
  exports.ModelFiltersSchema =
  exports.PredictionFiltersSchema =
  exports.UpdatePredictionAlertSchema =
  exports.CreatePredictionAlertSchema =
  exports.CreatePredictionAccuracySchema =
  exports.UpdateForecastingScenarioSchema =
  exports.CreateForecastingScenarioSchema =
  exports.UpdateCashFlowPredictionSchema =
  exports.CreateCashFlowPredictionSchema =
  exports.UpdatePredictionModelSchema =
  exports.CreatePredictionModelSchema =
  exports.ErrorMagnitudeSchema =
  exports.ErrorCategorySchema =
  exports.AlertStatusSchema =
  exports.SeverityLevelSchema =
  exports.AlertTypeSchema =
  exports.ScenarioTypeSchema =
    void 0;
var zod_1 = require("zod");
// =====================================================================================
// CORE VALIDATION SCHEMAS
// =====================================================================================
var PredictionPeriodTypeSchema = zod_1.z.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "annual",
]);
var ModelTypeSchema = zod_1.z.enum(["linear_regression", "arima", "lstm", "ensemble"]);
var AlgorithmTypeSchema = zod_1.z.enum(["statistical", "machine_learning", "deep_learning"]);
exports.ScenarioTypeSchema = zod_1.z.enum(["optimistic", "realistic", "pessimistic", "custom"]);
exports.AlertTypeSchema = zod_1.z.enum([
  "cash_shortfall",
  "negative_trend",
  "accuracy_drop",
  "threshold_breach",
]);
exports.SeverityLevelSchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
exports.AlertStatusSchema = zod_1.z.enum(["active", "acknowledged", "resolved", "dismissed"]);
exports.ErrorCategorySchema = zod_1.z.enum([
  "under_prediction",
  "over_prediction",
  "seasonal_miss",
  "trend_miss",
]);
exports.ErrorMagnitudeSchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
// =====================================================================================
// COMMON VALIDATION PATTERNS
// =====================================================================================
var UUIDSchema = zod_1.z.string().uuid("Invalid UUID format");
var PositiveNumberSchema = zod_1.z.number().min(0, "Must be non-negative");
var PercentageSchema = zod_1.z
  .number()
  .min(0, "Percentage must be at least 0")
  .max(100, "Percentage cannot exceed 100");
var AccuracyPercentageSchema = zod_1.z
  .number()
  .min(0, "Accuracy must be at least 0%")
  .max(100, "Accuracy cannot exceed 100%");
var ConfidenceScoreSchema = zod_1.z
  .number()
  .min(0, "Confidence score must be at least 0")
  .max(100, "Confidence score cannot exceed 100");
var AmountInCentavosSchema = zod_1.z
  .number()
  .int("Amount must be an integer (centavos)")
  .min(-999999999999, "Amount too small")
  .max(999999999999, "Amount too large");
var DateStringSchema = zod_1.z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
var TimestampSchema = zod_1.z.string().datetime("Invalid timestamp format");
var JSONObjectSchema = zod_1.z.record(zod_1.z.any()).default({});
// =====================================================================================
// PREDICTION MODEL VALIDATION SCHEMAS
// =====================================================================================
exports.CreatePredictionModelSchema = zod_1.z
  .object({
    model_name: zod_1.z
      .string()
      .min(1, "Model name is required")
      .max(100, "Model name too long")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Model name can only contain letters, numbers, hyphens, and underscores",
      ),
    model_type: ModelTypeSchema,
    algorithm_type: AlgorithmTypeSchema,
    accuracy_rate: AccuracyPercentageSchema.optional().default(0),
    confidence_score: ConfidenceScoreSchema.optional().default(0),
    model_parameters: JSONObjectSchema.optional().default({}),
    training_data_size: zod_1.z
      .number()
      .int("Training data size must be an integer")
      .min(0, "Training data size must be non-negative")
      .optional()
      .default(0),
    training_period_start: DateStringSchema.optional(),
    training_period_end: DateStringSchema.optional(),
  })
  .refine(
    function (data) {
      if (data.training_period_start && data.training_period_end) {
        return new Date(data.training_period_start) <= new Date(data.training_period_end);
      }
      return true;
    },
    {
      message: "Training period end must be after start date",
      path: ["training_period_end"],
    },
  );
exports.UpdatePredictionModelSchema = zod_1.z
  .object({
    model_name: zod_1.z
      .string()
      .min(1, "Model name is required")
      .max(100, "Model name too long")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Model name can only contain letters, numbers, hyphens, and underscores",
      )
      .optional(),
    accuracy_rate: AccuracyPercentageSchema.optional(),
    confidence_score: ConfidenceScoreSchema.optional(),
    mse_score: PositiveNumberSchema.optional(),
    mae_score: PositiveNumberSchema.optional(),
    r2_score: zod_1.z
      .number()
      .min(-1, "R² score cannot be less than -1")
      .max(1, "R² score cannot exceed 1")
      .optional(),
    model_version: zod_1.z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, "Model version must be in semantic version format (x.y.z)")
      .optional(),
    model_parameters: JSONObjectSchema.optional(),
    training_data_size: zod_1.z
      .number()
      .int("Training data size must be an integer")
      .min(0, "Training data size must be non-negative")
      .optional(),
    is_active: zod_1.z.boolean().optional(),
    is_production_ready: zod_1.z.boolean().optional(),
    next_training_due: TimestampSchema.optional(),
  })
  .refine(
    function (data) {
      // Ensure production-ready models have minimum accuracy requirements
      if (data.is_production_ready && data.accuracy_rate !== undefined) {
        return data.accuracy_rate >= 75; // Minimum 75% accuracy for production
      }
      return true;
    },
    {
      message: "Production-ready models must have at least 75% accuracy",
      path: ["accuracy_rate"],
    },
  );
// =====================================================================================
// CASH FLOW PREDICTION VALIDATION SCHEMAS
// =====================================================================================
exports.CreateCashFlowPredictionSchema = zod_1.z
  .object({
    model_id: UUIDSchema,
    clinic_id: UUIDSchema,
    period_type: PredictionPeriodTypeSchema,
    start_date: DateStringSchema,
    end_date: DateStringSchema,
    predicted_inflow_amount: AmountInCentavosSchema,
    predicted_outflow_amount: AmountInCentavosSchema,
    predicted_net_amount: AmountInCentavosSchema,
    confidence_score: ConfidenceScoreSchema,
    confidence_interval_lower: AmountInCentavosSchema,
    confidence_interval_upper: AmountInCentavosSchema,
    prediction_variance: PositiveNumberSchema.optional(),
    seasonal_adjustment: zod_1.z
      .number()
      .min(0.1, "Seasonal adjustment must be at least 0.1")
      .max(10.0, "Seasonal adjustment cannot exceed 10.0")
      .optional()
      .default(1.0),
    trend_adjustment: zod_1.z
      .number()
      .min(0.1, "Trend adjustment must be at least 0.1")
      .max(10.0, "Trend adjustment cannot exceed 10.0")
      .optional()
      .default(1.0),
    input_features: JSONObjectSchema.optional().default({}),
    scenario_id: UUIDSchema.optional(),
  })
  .refine(
    function (data) {
      return new Date(data.start_date) <= new Date(data.end_date);
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    },
  )
  .refine(
    function (data) {
      return data.confidence_interval_lower <= data.confidence_interval_upper;
    },
    {
      message: "Confidence interval upper bound must be greater than or equal to lower bound",
      path: ["confidence_interval_upper"],
    },
  )
  .refine(
    function (data) {
      // Net amount should be inflow minus outflow (with some tolerance for rounding)
      var calculated_net = data.predicted_inflow_amount - data.predicted_outflow_amount;
      var tolerance = Math.abs(calculated_net * 0.01); // 1% tolerance
      return Math.abs(data.predicted_net_amount - calculated_net) <= tolerance;
    },
    {
      message: "Predicted net amount must equal inflow minus outflow",
      path: ["predicted_net_amount"],
    },
  )
  .refine(
    function (data) {
      // Confidence score should align with confidence interval width
      var interval_width = data.confidence_interval_upper - data.confidence_interval_lower;
      var predicted_amount = Math.abs(data.predicted_net_amount);
      if (predicted_amount > 0) {
        var relative_width = interval_width / predicted_amount;
        // High confidence should have narrow intervals, low confidence should have wide intervals
        if (data.confidence_score > 90 && relative_width > 0.2) return false;
        if (data.confidence_score < 50 && relative_width < 0.1) return false;
      }
      return true;
    },
    {
      message: "Confidence score must align with confidence interval width",
      path: ["confidence_score"],
    },
  );
exports.UpdateCashFlowPredictionSchema = zod_1.z
  .object({
    predicted_inflow_amount: AmountInCentavosSchema.optional(),
    predicted_outflow_amount: AmountInCentavosSchema.optional(),
    predicted_net_amount: AmountInCentavosSchema.optional(),
    confidence_score: ConfidenceScoreSchema.optional(),
    confidence_interval_lower: AmountInCentavosSchema.optional(),
    confidence_interval_upper: AmountInCentavosSchema.optional(),
    prediction_variance: PositiveNumberSchema.optional(),
    is_validated: zod_1.z.boolean().optional(),
    validation_date: TimestampSchema.optional(),
  })
  .refine(
    function (data) {
      if (
        data.confidence_interval_lower !== undefined &&
        data.confidence_interval_upper !== undefined
      ) {
        return data.confidence_interval_lower <= data.confidence_interval_upper;
      }
      return true;
    },
    {
      message: "Confidence interval upper bound must be greater than or equal to lower bound",
      path: ["confidence_interval_upper"],
    },
  );
// =====================================================================================
// FORECASTING SCENARIO VALIDATION SCHEMAS
// =====================================================================================
exports.CreateForecastingScenarioSchema = zod_1.z
  .object({
    scenario_name: zod_1.z
      .string()
      .min(1, "Scenario name is required")
      .max(100, "Scenario name too long"),
    scenario_type: exports.ScenarioTypeSchema,
    description: zod_1.z.string().max(500, "Description too long").optional(),
    parameters: JSONObjectSchema,
    market_conditions: JSONObjectSchema.optional().default({}),
    business_assumptions: JSONObjectSchema.optional().default({}),
    forecast_start_date: DateStringSchema,
    forecast_end_date: DateStringSchema,
    clinic_id: UUIDSchema,
    is_baseline: zod_1.z.boolean().optional().default(false),
  })
  .refine(
    function (data) {
      return new Date(data.forecast_start_date) <= new Date(data.forecast_end_date);
    },
    {
      message: "Forecast end date must be after start date",
      path: ["forecast_end_date"],
    },
  )
  .refine(
    function (data) {
      // Forecast period should be reasonable (not more than 5 years)
      var start = new Date(data.forecast_start_date);
      var end = new Date(data.forecast_end_date);
      var diffYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return diffYears <= 5;
    },
    {
      message: "Forecast period cannot exceed 5 years",
      path: ["forecast_end_date"],
    },
  );
exports.UpdateForecastingScenarioSchema = zod_1.z
  .object({
    scenario_name: zod_1.z
      .string()
      .min(1, "Scenario name is required")
      .max(100, "Scenario name too long")
      .optional(),
    scenario_type: exports.ScenarioTypeSchema.optional(),
    description: zod_1.z.string().max(500, "Description too long").optional(),
    parameters: JSONObjectSchema.optional(),
    market_conditions: JSONObjectSchema.optional(),
    business_assumptions: JSONObjectSchema.optional(),
    forecast_start_date: DateStringSchema.optional(),
    forecast_end_date: DateStringSchema.optional(),
    total_predicted_revenue: AmountInCentavosSchema.optional(),
    total_predicted_expenses: AmountInCentavosSchema.optional(),
    total_predicted_profit: AmountInCentavosSchema.optional(),
    cash_flow_variance: PositiveNumberSchema.optional(),
    is_active: zod_1.z.boolean().optional(),
    is_baseline: zod_1.z.boolean().optional(),
  })
  .refine(
    function (data) {
      if (data.forecast_start_date && data.forecast_end_date) {
        return new Date(data.forecast_start_date) <= new Date(data.forecast_end_date);
      }
      return true;
    },
    {
      message: "Forecast end date must be after start date",
      path: ["forecast_end_date"],
    },
  )
  .refine(
    function (data) {
      if (
        data.total_predicted_revenue !== undefined &&
        data.total_predicted_expenses !== undefined &&
        data.total_predicted_profit !== undefined
      ) {
        var calculated_profit = data.total_predicted_revenue - data.total_predicted_expenses;
        var tolerance = Math.abs(calculated_profit * 0.01); // 1% tolerance
        return Math.abs(data.total_predicted_profit - calculated_profit) <= tolerance;
      }
      return true;
    },
    {
      message: "Total predicted profit must equal revenue minus expenses",
      path: ["total_predicted_profit"],
    },
  );
// =====================================================================================
// PREDICTION ACCURACY VALIDATION SCHEMAS
// =====================================================================================
exports.CreatePredictionAccuracySchema = zod_1.z
  .object({
    prediction_id: UUIDSchema,
    model_id: UUIDSchema,
    actual_inflow_amount: AmountInCentavosSchema,
    actual_outflow_amount: AmountInCentavosSchema,
    actual_net_amount: AmountInCentavosSchema,
    accuracy_percentage: AccuracyPercentageSchema,
    absolute_error: PositiveNumberSchema,
    relative_error: zod_1.z.number(),
    squared_error: PositiveNumberSchema,
    error_category: exports.ErrorCategorySchema.optional(),
    error_magnitude: exports.ErrorMagnitudeSchema.optional(),
    contributing_factors: JSONObjectSchema.optional().default({}),
    validation_period_type: PredictionPeriodTypeSchema,
    validation_date: DateStringSchema,
    is_outlier: zod_1.z.boolean().optional().default(false),
  })
  .refine(
    function (data) {
      // Net amount should be inflow minus outflow
      var calculated_net = data.actual_inflow_amount - data.actual_outflow_amount;
      var tolerance = Math.abs(calculated_net * 0.01); // 1% tolerance
      return Math.abs(data.actual_net_amount - calculated_net) <= tolerance;
    },
    {
      message: "Actual net amount must equal inflow minus outflow",
      path: ["actual_net_amount"],
    },
  )
  .refine(
    function (data) {
      // Validate error magnitude matches accuracy percentage
      if (data.error_magnitude) {
        var accuracy = data.accuracy_percentage;
        switch (data.error_magnitude) {
          case "low":
            return accuracy >= 90;
          case "medium":
            return accuracy >= 70 && accuracy < 90;
          case "high":
            return accuracy >= 50 && accuracy < 70;
          case "critical":
            return accuracy < 50;
          default:
            return true;
        }
      }
      return true;
    },
    {
      message: "Error magnitude must align with accuracy percentage",
      path: ["error_magnitude"],
    },
  );
// =====================================================================================
// PREDICTION ALERT VALIDATION SCHEMAS
// =====================================================================================
exports.CreatePredictionAlertSchema = zod_1.z
  .object({
    prediction_id: UUIDSchema.optional(),
    clinic_id: UUIDSchema,
    alert_type: exports.AlertTypeSchema,
    severity_level: exports.SeverityLevelSchema,
    threshold_amount: AmountInCentavosSchema.optional(),
    threshold_percentage: PercentageSchema.optional(),
    threshold_period: zod_1.z.string().max(50, "Threshold period too long").optional(),
    alert_message: zod_1.z
      .string()
      .min(1, "Alert message is required")
      .max(500, "Alert message too long"),
    alert_description: zod_1.z.string().max(1000, "Alert description too long").optional(),
    recommended_actions: zod_1.z
      .array(zod_1.z.string().max(200, "Recommended action too long"))
      .max(10, "Too many recommended actions")
      .optional()
      .default([]),
    assigned_to: UUIDSchema.optional(),
    notification_channels: zod_1.z
      .array(zod_1.z.enum(["email", "sms", "push", "dashboard"]))
      .max(4, "Too many notification channels")
      .optional()
      .default([]),
  })
  .refine(
    function (data) {
      // Ensure at least one threshold is provided for threshold-based alerts
      if (data.alert_type === "threshold_breach") {
        return data.threshold_amount !== undefined || data.threshold_percentage !== undefined;
      }
      return true;
    },
    {
      message: "Threshold-based alerts must have either amount or percentage threshold",
      path: ["threshold_amount"],
    },
  );
exports.UpdatePredictionAlertSchema = zod_1.z
  .object({
    status: exports.AlertStatusSchema.optional(),
    acknowledged_at: TimestampSchema.optional(),
    resolved_at: TimestampSchema.optional(),
    assigned_to: UUIDSchema.optional(),
    notification_sent: zod_1.z.boolean().optional(),
    recommended_actions: zod_1.z
      .array(zod_1.z.string().max(200, "Recommended action too long"))
      .max(10, "Too many recommended actions")
      .optional(),
  })
  .refine(
    function (data) {
      // If status is acknowledged, acknowledged_at should be provided
      if (data.status === "acknowledged" && !data.acknowledged_at) {
        return false;
      }
      // If status is resolved, resolved_at should be provided
      if (data.status === "resolved" && !data.resolved_at) {
        return false;
      }
      return true;
    },
    {
      message: "Status change requires corresponding timestamp",
      path: ["status"],
    },
  );
// =====================================================================================
// FILTER VALIDATION SCHEMAS
// =====================================================================================
exports.PredictionFiltersSchema = zod_1.z
  .object({
    clinic_id: UUIDSchema.optional(),
    model_id: UUIDSchema.optional(),
    period_type: PredictionPeriodTypeSchema.optional(),
    start_date: DateStringSchema.optional(),
    end_date: DateStringSchema.optional(),
    min_confidence: ConfidenceScoreSchema.optional(),
    is_validated: zod_1.z.boolean().optional(),
    scenario_id: UUIDSchema.optional(),
  })
  .refine(
    function (data) {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) <= new Date(data.end_date);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    },
  );
exports.ModelFiltersSchema = zod_1.z.object({
  model_type: ModelTypeSchema.optional(),
  algorithm_type: AlgorithmTypeSchema.optional(),
  min_accuracy: AccuracyPercentageSchema.optional(),
  is_active: zod_1.z.boolean().optional(),
  is_production_ready: zod_1.z.boolean().optional(),
});
exports.ScenarioFiltersSchema = zod_1.z.object({
  clinic_id: UUIDSchema.optional(),
  scenario_type: exports.ScenarioTypeSchema.optional(),
  is_active: zod_1.z.boolean().optional(),
  is_baseline: zod_1.z.boolean().optional(),
  created_by: UUIDSchema.optional(),
  date_range: zod_1.z
    .object({
      start: DateStringSchema,
      end: DateStringSchema,
    })
    .refine(
      function (data) {
        return new Date(data.start) <= new Date(data.end);
      },
      {
        message: "End date must be after start date",
        path: ["end"],
      },
    )
    .optional(),
});
exports.AlertFiltersSchema = zod_1.z.object({
  clinic_id: UUIDSchema.optional(),
  alert_type: exports.AlertTypeSchema.optional(),
  severity_level: exports.SeverityLevelSchema.optional(),
  status: exports.AlertStatusSchema.optional(),
  assigned_to: UUIDSchema.optional(),
  date_range: zod_1.z
    .object({
      start: DateStringSchema,
      end: DateStringSchema,
    })
    .refine(
      function (data) {
        return new Date(data.start) <= new Date(data.end);
      },
      {
        message: "End date must be after start date",
        path: ["end"],
      },
    )
    .optional(),
});
// =====================================================================================
// PAGINATION AND UTILITY SCHEMAS
// =====================================================================================
exports.PaginationParamsSchema = zod_1.z.object({
  page: zod_1.z.number().int().min(1, "Page must be at least 1").optional().default(1),
  per_page: zod_1.z
    .number()
    .int()
    .min(1, "Per page must be at least 1")
    .max(100, "Per page cannot exceed 100")
    .optional()
    .default(20),
  sort_by: zod_1.z.string().max(50, "Sort field too long").optional(),
  sort_order: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
});
exports.DateRangeSchema = zod_1.z
  .object({
    start_date: DateStringSchema,
    end_date: DateStringSchema,
  })
  .refine(
    function (data) {
      return new Date(data.start_date) <= new Date(data.end_date);
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    },
  );
exports.AmountRangeSchema = zod_1.z
  .object({
    min_amount: AmountInCentavosSchema,
    max_amount: AmountInCentavosSchema,
  })
  .refine(
    function (data) {
      return data.min_amount <= data.max_amount;
    },
    {
      message: "Maximum amount must be greater than or equal to minimum amount",
      path: ["max_amount"],
    },
  );
exports.ConfidenceRangeSchema = zod_1.z
  .object({
    min_confidence: ConfidenceScoreSchema,
    max_confidence: ConfidenceScoreSchema,
  })
  .refine(
    function (data) {
      return data.min_confidence <= data.max_confidence;
    },
    {
      message: "Maximum confidence must be greater than or equal to minimum confidence",
      path: ["max_confidence"],
    },
  );
// =====================================================================================
// EXPORTS WITH CORRECT SCHEMA REFERENCES
// =====================================================================================
// Export the actual schemas for use in API routes
exports.predictionPeriodTypeSchema = PredictionPeriodTypeSchema;
exports.createCashFlowPredictionSchema = exports.CreateCashFlowPredictionSchema;
exports.createForecastingScenarioSchema = exports.CreateForecastingScenarioSchema;
