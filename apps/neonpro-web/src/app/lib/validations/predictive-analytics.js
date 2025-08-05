"use strict";
// Predictive Analytics Validation Schemas
// Generated to fix missing validation exports
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPredictionSchema = exports.updateForecastingModelSchema = exports.createForecastingModelSchema = exports.createAlertSchema = void 0;
var zod_1 = require("zod");
// Create Alert Schema
exports.createAlertSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    metric: zod_1.z.string(),
    threshold: zod_1.z.number(),
    comparison: zod_1.z.enum(['greater_than', 'less_than', 'equals']),
    enabled: zod_1.z.boolean().default(true),
    notification_channels: zod_1.z.array(zod_1.z.string()),
});
// Forecasting Model Schemas
exports.createForecastingModelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    model_type: zod_1.z.enum(['arima', 'lstm', 'prophet', 'linear_regression']),
    target_metric: zod_1.z.string(),
    features: zod_1.z.array(zod_1.z.string()),
    training_period_days: zod_1.z.number().positive(),
    prediction_horizon_days: zod_1.z.number().positive(),
});
exports.updateForecastingModelSchema = exports.createForecastingModelSchema.partial();
// Create Prediction Schema
exports.createPredictionSchema = zod_1.z.object({
    model_id: zod_1.z.string(),
    input_data: zod_1.z.record(zod_1.z.any()),
    prediction_date: zod_1.z.string(),
    confidence_level: zod_1.z.number().min(0).max(1),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// Export all schemas
exports.default = {
    createAlertSchema: exports.createAlertSchema,
    createForecastingModelSchema: exports.createForecastingModelSchema,
    updateForecastingModelSchema: exports.updateForecastingModelSchema,
    createPredictionSchema: exports.createPredictionSchema,
};
