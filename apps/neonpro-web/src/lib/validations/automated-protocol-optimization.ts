import { z } from 'zod';

export const createProtocolExperimentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  clinicId: z.string().uuid(),
  parameters: z.record(z.any()),
  targetMetrics: z.array(z.string()),
  duration: z.number().positive(),
  active: z.boolean().default(true)
});

export const updateProtocolExperimentSchema = createProtocolExperimentSchema.partial();

export const createProtocolFeedbackSchema = z.object({
  experimentId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  metrics: z.record(z.number()),
  timestamp: z.date().default(() => new Date())
});

export const updateProtocolFeedbackSchema = createProtocolFeedbackSchema.partial();

export const createProtocolOutcomeSchema = z.object({
  experimentId: z.string().uuid(),
  metrics: z.record(z.number()),
  success: z.boolean(),
  analysis: z.string(),
  recommendations: z.array(z.string()),
  timestamp: z.date().default(() => new Date())
});

export const createProtocolVersionSchema = z.object({
  protocolId: z.string().uuid(),
  version: z.string(),
  changes: z.string(),
  parameters: z.record(z.any()),
  active: z.boolean().default(false),
  createdBy: z.string().uuid()
});

export const updateProtocolVersionSchema = createProtocolVersionSchema.partial();
