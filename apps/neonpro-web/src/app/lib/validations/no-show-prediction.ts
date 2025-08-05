// No-Show Prediction Validation Schemas
// Generated to fix missing validation exports

import { z } from 'zod';

// Create Prediction Input Schema
export const CreatePredictionInputSchema = z.object({
  patient_id: z.string(),
  appointment_id: z.string(),
  appointment_datetime: z.string(),
  patient_age: z.number().positive(),
  previous_no_shows: z.number().min(0),
  appointment_type: z.string(),
  reminder_sent: z.boolean(),
  weather_conditions: z.string().optional(),
  traffic_conditions: z.string().optional(),
});

// Update Prediction Input Schema
export const UpdatePredictionInputSchema = CreatePredictionInputSchema.partial();

// Intervention Create Schema
export const InterventionCreateSchema = z.object({
  prediction_id: z.string(),
  intervention_type: z.enum(['sms', 'email', 'call', 'push_notification']),
  scheduled_time: z.string(),
  message_template: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  auto_trigger: z.boolean().default(false),
});

// Export all schemas
export default {
  CreatePredictionInputSchema,
  UpdatePredictionInputSchema,
  InterventionCreateSchema,
};
// Additional validation schemas
export const GetAnalyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clinicId: z.string().optional(),
  providerId: z.string().optional()
});

export const GetPredictionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  clinicId: z.string().optional()
});
