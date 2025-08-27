// Batch Prediction API Schemas - Zod Validation Schemas
// Validation schemas for batch prediction endpoints

import { z } from "zod";
import {
  BATCH_LIMITS,
  // PRIORITY_LEVELS,
  PRIORITY_VALUES,
  RISK_THRESHOLDS,
} from "./batch-prediction-constants";

// Batch Job Parameters Schema
export const BatchJobParametersSchema = z.object({
  date_range: z
    .object({
      start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
      end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    })
    .refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
      message: "Start date must be before or equal to end date",
    }),
  filters: z
    .object({
      clinic_ids: z.array(z.string()).optional(),
      doctor_ids: z.array(z.string()).optional(),
      appointment_types: z.array(z.string()).optional(),
      priority_levels: z
        .array(z.enum(["low", "medium", "high", "urgent"]))
        .optional(),
      min_risk_threshold: z
        .number()
        .min(RISK_THRESHOLDS.MIN)
        .max(RISK_THRESHOLDS.MAX)
        .optional(),
    })
    .optional(),
  batch_size: z
    .number()
    .min(BATCH_LIMITS.MIN_SIZE)
    .max(BATCH_LIMITS.MAX_SIZE)
    .default(BATCH_LIMITS.DEFAULT_SIZE),
  priority: z
    .number()
    .min(PRIORITY_VALUES.MIN)
    .max(PRIORITY_VALUES.MAX)
    .default(PRIORITY_VALUES.DEFAULT),
});

// Create Batch Job Schema
export const CreateBatchJobSchema = z.object({
  type: z.enum([
    "daily_predictions",
    "weekly_forecast",
    "intervention_planning",
    "risk_assessment",
  ]),
  parameters: BatchJobParametersSchema,
  created_by: z.string().optional().default("api_user"),
});

// Batch Job Filters Schema
export const BatchJobFiltersSchema = z.object({
  status: z
    .enum(["queued", "processing", "completed", "failed", "cancelled"])
    .optional(),
  type: z
    .enum([
      "daily_predictions",
      "weekly_forecast",
      "intervention_planning",
      "risk_assessment",
    ])
    .optional(),
  created_by: z.string().optional(),
  limit: z
    .number()
    .min(BATCH_LIMITS.MIN_LIMIT)
    .max(BATCH_LIMITS.MAX_LIMIT)
    .default(BATCH_LIMITS.DEFAULT_LIMIT),
});

// Bulk Job Creation Schema
export const BulkJobCreationSchema = z.object({
  jobs: z
    .array(CreateBatchJobSchema)
    .min(BATCH_LIMITS.MIN_BULK_JOBS)
    .max(BATCH_LIMITS.MAX_BULK_JOBS),
  bulk_operation_id: z.string().optional(),
});
