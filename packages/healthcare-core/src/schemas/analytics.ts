/**
 * Analytics schemas for healthcare business intelligence
 */

import { z } from 'zod'

// Analytics Configuration Schema
export const AnalyticsConfigurationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  configuration: z.record(z.string(), z.unknown()),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Input Schemas
export const CreateAnalyticsConfigurationInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  configuration: z.record(z.string(), z.unknown()),
})

export const UpdateAnalyticsConfigurationInput = z.object({
  id: z.string(),
  configuration: z.record(z.string(), z.unknown()),
})

export const DeleteAnalyticsConfigurationInput = z.object({
  id: z.string(),
})

// Types
export type AnalyticsConfiguration = z.infer<typeof AnalyticsConfigurationSchema>
export type CreateAnalyticsConfigurationInputType = z.infer<typeof CreateAnalyticsConfigurationInput>
export type UpdateAnalyticsConfigurationInputType = z.infer<typeof UpdateAnalyticsConfigurationInput>
export type DeleteAnalyticsConfigurationInputType = z.infer<typeof DeleteAnalyticsConfigurationInput>