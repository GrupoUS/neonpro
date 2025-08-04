/**
 * Automated Protocol Optimization Validation Schemas
 * 
 * This file contains Zod validation schemas for the automated protocol optimization feature.
 * These schemas ensure data integrity and type safety for protocol experiments and feedback.
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { z } from 'zod';

// =====================================================
// PROTOCOL EXPERIMENT SCHEMAS
// =====================================================

/**
 * Schema for creating a new protocol experiment
 */
export const createProtocolExperimentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  protocolType: z.enum(['diagnostic', 'treatment', 'monitoring', 'consultation']),
  parameters: z.record(z.any()),
  targetMetrics: z.array(z.string()),
  duration: z.number().positive(),
  sampleSize: z.number().positive(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Schema for updating an existing protocol experiment
 */
export const updateProtocolExperimentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional(),
  parameters: z.record(z.any()).optional(),
  targetMetrics: z.array(z.string()).optional(),
  results: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional()
});

// =====================================================
// PROTOCOL FEEDBACK SCHEMAS
// =====================================================

/**
 * Schema for creating protocol feedback
 */
export const createProtocolFeedbackSchema = z.object({
  experimentId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  feedback: z.string().min(1),
  category: z.enum(['effectiveness', 'usability', 'safety', 'efficiency', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Schema for updating protocol feedback
 */
export const updateProtocolFeedbackSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().min(1).optional(),
  category: z.enum(['effectiveness', 'usability', 'safety', 'efficiency', 'other']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'reviewed', 'implemented', 'rejected']).optional(),
  response: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional()
});

// =====================================================
// QUERY PARAMETER SCHEMAS
// =====================================================

/**
 * Schema for experiment query parameters
 */
export const experimentQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional(),
  protocolType: z.enum(['diagnostic', 'treatment', 'monitoring', 'consultation']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['created_at', 'updated_at', 'name', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Schema for feedback query parameters
 */
export const feedbackQuerySchema = z.object({
  experimentId: z.string().uuid().optional(),
  category: z.enum(['effectiveness', 'usability', 'safety', 'efficiency', 'other']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'reviewed', 'implemented', 'rejected']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['created_at', 'updated_at', 'rating']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
});

// =====================================================
// RESPONSE SCHEMAS
// =====================================================

/**
 * Schema for experiment response data
 */
export const protocolExperimentResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  protocolType: z.enum(['diagnostic', 'treatment', 'monitoring', 'consultation']),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']),
  parameters: z.record(z.any()),
  targetMetrics: z.array(z.string()),
  results: z.record(z.any()).nullable(),
  duration: z.number(),
  sampleSize: z.number(),
  metadata: z.record(z.any()).nullable(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  notes: z.string().nullable()
});

/**
 * Schema for feedback response data
 */
export const protocolFeedbackResponseSchema = z.object({
  id: z.string().uuid(),
  experimentId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  feedback: z.string(),
  category: z.enum(['effectiveness', 'usability', 'safety', 'efficiency', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).nullable(),
  status: z.enum(['pending', 'reviewed', 'implemented', 'rejected']),
  response: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type CreateProtocolExperimentInput = z.infer<typeof createProtocolExperimentSchema>;
export type UpdateProtocolExperimentInput = z.infer<typeof updateProtocolExperimentSchema>;
export type CreateProtocolFeedbackInput = z.infer<typeof createProtocolFeedbackSchema>;
export type UpdateProtocolFeedbackInput = z.infer<typeof updateProtocolFeedbackSchema>;
export type ExperimentQuery = z.infer<typeof experimentQuerySchema>;
export type FeedbackQuery = z.infer<typeof feedbackQuerySchema>;
export type ProtocolExperimentResponse = z.infer<typeof protocolExperimentResponseSchema>;
export type ProtocolFeedbackResponse = z.infer<typeof protocolFeedbackResponseSchema>;

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validates experiment creation data
 */
export function validateCreateExperiment(data: unknown): {
  success: boolean;
  data?: CreateProtocolExperimentInput;
  error?: string;
} {
  try {
    const result = createProtocolExperimentSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}

/**
 * Validates experiment update data
 */
export function validateUpdateExperiment(data: unknown): {
  success: boolean;
  data?: UpdateProtocolExperimentInput;
  error?: string;
} {
  try {
    const result = updateProtocolExperimentSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}

/**
 * Validates feedback creation data
 */
export function validateCreateFeedback(data: unknown): {
  success: boolean;
  data?: CreateProtocolFeedbackInput;
  error?: string;
} {
  try {
    const result = createProtocolFeedbackSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}

/**
 * Validates feedback update data
 */
export function validateUpdateFeedback(data: unknown): {
  success: boolean;
  data?: UpdateProtocolFeedbackInput;
  error?: string;
} {
  try {
    const result = updateProtocolFeedbackSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}