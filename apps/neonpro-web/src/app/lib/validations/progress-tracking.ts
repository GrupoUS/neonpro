import type { z } from "zod";

export const createProgressTrackingSchema = z.object({
  patientId: z.string().uuid(),
  treatmentId: z.string().uuid(),
  clinicId: z.string().uuid(),
  milestones: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      targetDate: z.date(),
      completedDate: z.date().optional(),
      status: z.enum(["pending", "in_progress", "completed", "delayed"]),
      progress: z.number().min(0).max(100),
    }),
  ),
  overallProgress: z.number().min(0).max(100),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  createdBy: z.string().uuid(),
});

export const updateProgressTrackingSchema = createProgressTrackingSchema.partial().extend({
  id: z.string().uuid(),
});

export type ProgressTracking = z.infer<typeof createProgressTrackingSchema>;
export type ProgressTrackingUpdate = z.infer<typeof updateProgressTrackingSchema>;

// Missing exports for API routes
export const createProgressAlertRequestSchema = z.object({
  placeholder: z.string().optional(),
});

export const progressAlertFiltersSchema = z.object({
  placeholder: z.string().optional(),
});

export const createProgressMilestoneRequestSchema = z.object({
  placeholder: z.string().optional(),
});

export const progressMilestoneFiltersSchema = z.object({
  placeholder: z.string().optional(),
});

export const createMultiSessionAnalysisRequestSchema = z.object({
  placeholder: z.string().optional(),
});

export const createProgressPredictionRequestSchema = z.object({
  placeholder: z.string().optional(),
});

export const progressTrackingFiltersSchema = z.object({
  placeholder: z.string().optional(),
});
