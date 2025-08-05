"use strict";
// No-Show Prediction Validation Schemas
// Generated to fix missing validation exports
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPredictionsQuerySchema =
  exports.GetAnalyticsQuerySchema =
  exports.InterventionCreateSchema =
  exports.UpdatePredictionInputSchema =
  exports.CreatePredictionInputSchema =
    void 0;
var zod_1 = require("zod");
// Create Prediction Input Schema
exports.CreatePredictionInputSchema = zod_1.z.object({
  patient_id: zod_1.z.string(),
  appointment_id: zod_1.z.string(),
  appointment_datetime: zod_1.z.string(),
  patient_age: zod_1.z.number().positive(),
  previous_no_shows: zod_1.z.number().min(0),
  appointment_type: zod_1.z.string(),
  reminder_sent: zod_1.z.boolean(),
  weather_conditions: zod_1.z.string().optional(),
  traffic_conditions: zod_1.z.string().optional(),
});
// Update Prediction Input Schema
exports.UpdatePredictionInputSchema = exports.CreatePredictionInputSchema.partial();
// Intervention Create Schema
exports.InterventionCreateSchema = zod_1.z.object({
  prediction_id: zod_1.z.string(),
  intervention_type: zod_1.z.enum(["sms", "email", "call", "push_notification"]),
  scheduled_time: zod_1.z.string(),
  message_template: zod_1.z.string(),
  priority: zod_1.z.enum(["low", "medium", "high"]),
  auto_trigger: zod_1.z.boolean().default(false),
});
// Export all schemas
exports.default = {
  CreatePredictionInputSchema: exports.CreatePredictionInputSchema,
  UpdatePredictionInputSchema: exports.UpdatePredictionInputSchema,
  InterventionCreateSchema: exports.InterventionCreateSchema,
};
// Additional validation schemas
exports.GetAnalyticsQuerySchema = zod_1.z.object({
  startDate: zod_1.z.string().optional(),
  endDate: zod_1.z.string().optional(),
  clinicId: zod_1.z.string().optional(),
  providerId: zod_1.z.string().optional(),
});
exports.GetPredictionsQuerySchema = zod_1.z.object({
  page: zod_1.z.coerce.number().min(1).default(1),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
  riskLevel: zod_1.z.enum(["low", "medium", "high"]).optional(),
  clinicId: zod_1.z.string().optional(),
});
