// Predictive Analytics Validation Schemas
// Generated to fix missing validation exports

import { z } from 'zod';

// Create Alert Schema
export const createAlertSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  metric: z.string(),
  threshold: z.number(),
  comparison: z.enum(['greater_than', 'less_than', 'equals']),
  enabled: z.boolean().default(true),
  notification_channels: z.array(z.string()),
});

// Forecasting Model Schemas
export const createForecastingModelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  model_type: z.enum(['arima', 'lstm', 'prophet', 'linear_regression']),
  target_metric: z.string(),
  features: z.array(z.string()),
  training_period_days: z.number().positive(),
  prediction_horizon_days: z.number().positive(),
});

export const updateForecastingModelSchema = createForecastingModelSchema.partial();

// Create Prediction Schema
export const createPredictionSchema = z.object({
  model_id: z.string(),
  input_data: z.record(z.any()),
  prediction_date: z.string(),
  confidence_level: z.number().min(0).max(1),
  metadata: z.record(z.any()).optional(),
});

// Export all schemas
export default {
  createAlertSchema,
  createForecastingModelSchema,
  updateForecastingModelSchema,
  createPredictionSchema,
};