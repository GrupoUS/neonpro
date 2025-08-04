// Marketing Campaigns Validation Schemas
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent

import { z } from 'zod';

// Campaign Template Schemas
export const CampaignTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  template_type: z.enum(['email', 'sms', 'whatsapp', 'push', 'multi-channel']),
  content_template: z.record(z.any()),
  subject_template: z.string().optional(),
  personalization_fields: z.record(z.any()).optional(),
  target_segments: z.record(z.any()).optional(),
  default_settings: z.record(z.any()).optional(),
  is_active: z.boolean().default(true),
  created_by: z.string().uuid().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export const CreateCampaignTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  template_type: z.enum(['email', 'sms', 'whatsapp', 'push', 'multi-channel']),
  content_template: z.record(z.any()),
  subject_template: z.string().optional(),
  personalization_fields: z.record(z.any()).optional(),
  target_segments: z.record(z.any()).optional(),
  default_settings: z.record(z.any()).optional(),
  is_active: z.boolean().default(true)
});

// Marketing Campaign Schemas
export const MarketingCampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  campaign_type: z.enum(['automated', 'manual', 'trigger-based', 'a-b-test']),
  template_id: z.string().uuid().optional(),
  target_segments: z.record(z.any()),
  content: z.record(z.any()),
  delivery_channels: z.array(z.string()).min(1, 'At least one delivery channel is required'),
  schedule_config: z.record(z.any()).optional(),
  trigger_config: z.record(z.any()).optional(),
  personalization_config: z.record(z.any()).optional(),
  send_time_optimization: z.boolean().default(true),
  automation_level: z.number().min(0).max(1).default(0.80), // ≥80% automation target
  status: z.enum(['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled']).default('draft'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export const CreateCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255, 'Campaign name too long'),
  description: z.string().optional(),
  campaign_type: z.enum(['automated', 'manual', 'trigger-based', 'a-b-test']),
  template_id: z.string().uuid().optional(),
  target_segments: z.record(z.any()),
  content: z.record(z.any()),
  delivery_channels: z.array(z.enum(['email', 'sms', 'whatsapp', 'push'])).min(1, 'At least one delivery channel is required'),
  schedule_config: z.record(z.any()).optional(),
  trigger_config: z.record(z.any()).optional(),
  personalization_config: z.record(z.any()).optional(),
  send_time_optimization: z.boolean().default(true),
  automation_level: z.number().min(0.80, 'Automation level must be at least 80%').max(1).default(0.80),
  start_date: z.string().optional(),
  end_date: z.string().optional()
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) < new Date(data.end_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date']
});

export const UpdateCampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Campaign name is required').max(255, 'Campaign name too long').optional(),
  description: z.string().optional(),
  campaign_type: z.enum(['automated', 'manual', 'trigger-based', 'a-b-test']).optional(),
  template_id: z.string().uuid().optional(),
  target_segments: z.record(z.any()).optional(),
  content: z.record(z.any()).optional(),
  delivery_channels: z.array(z.enum(['email', 'sms', 'whatsapp', 'push'])).min(1, 'At least one delivery channel is required').optional(),
  schedule_config: z.record(z.any()).optional(),
  trigger_config: z.record(z.any()).optional(),
  personalization_config: z.record(z.any()).optional(),
  send_time_optimization: z.boolean().optional(),
  automation_level: z.number().min(0.80, 'Automation level must be at least 80%').max(1).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

// Campaign Execution Schemas
export const CampaignExecutionSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  execution_type: z.enum(['scheduled', 'triggered', 'manual', 'test']),
  target_patient_ids: z.array(z.string().uuid()),
  content_variation_id: z.string().optional(),
  delivery_channel: z.string(),
  personalized_content: z.record(z.any()),
  execution_status: z.enum(['pending', 'sending', 'sent', 'failed', 'cancelled']).default('pending'),
  scheduled_at: z.string().optional(),
  executed_at: z.string().optional(),
  metrics: z.record(z.any()).optional(),
  error_details: z.record(z.any()).optional(),
  created_at: z.string()
});

// A/B Test Schemas
export const CampaignABTestSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  test_name: z.string().min(1, 'Test name is required'),
  test_type: z.enum(['content', 'subject', 'timing', 'channel', 'multivariate']),
  variations: z.record(z.any()),
  traffic_split: z.record(z.any()),
  success_metrics: z.record(z.any()),
  confidence_level: z.number().min(0.80).max(0.99).default(0.95),
  min_sample_size: z.number().min(50).default(100),
  test_duration_hours: z.number().min(1).optional(),
  status: z.enum(['draft', 'running', 'completed', 'stopped']).default('draft'),
  winner_variation_id: z.string().optional(),
  statistical_significance: z.number().optional(),
  results: z.record(z.any()).optional(),
  auto_select_winner: z.boolean().default(false),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string()
});

export const CreateABTestSchema = z.object({
  campaign_id: z.string().uuid(),
  test_name: z.string().min(1, 'Test name is required'),
  test_type: z.enum(['content', 'subject', 'timing', 'channel', 'multivariate']),
  variations: z.record(z.any()),
  traffic_split: z.record(z.any()),
  success_metrics: z.record(z.any()),
  confidence_level: z.number().min(0.80).max(0.99).default(0.95),
  min_sample_size: z.number().min(50).default(100),
  test_duration_hours: z.number().min(1).optional(),
  auto_select_winner: z.boolean().default(false)
});

// Marketing Consent Schemas
export const MarketingConsentSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  consent_type: z.enum(['email', 'sms', 'whatsapp', 'push', 'all']),
  consent_status: z.boolean(),
  consent_source: z.string().optional(),
  consent_date: z.string(),
  expiry_date: z.string().optional(),
  withdrawal_date: z.string().optional(),
  withdrawal_reason: z.string().optional(),
  opt_in_campaign_id: z.string().uuid().optional(),
  legal_basis: z.string().optional(),
  consent_text: z.string().optional(),
  created_at: z.string()
});

export const CreateConsentSchema = z.object({
  patient_id: z.string().uuid(),
  consent_type: z.enum(['email', 'sms', 'whatsapp', 'push', 'all']),
  consent_status: z.boolean(),
  consent_source: z.string().optional(),
  consent_date: z.string().default(() => new Date().toISOString()),
  expiry_date: z.string().optional(),
  legal_basis: z.string().optional(),
  consent_text: z.string().optional()
});

// Query Parameter Schemas
export const CampaignQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'name', 'status', 'automation_level']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.string().optional(),
  campaign_type: z.string().optional(),
  search: z.string().optional()
});

// Type exports
export type CampaignTemplateInput = z.infer<typeof CreateCampaignTemplateSchema>;
export type CampaignInput = z.infer<typeof CreateCampaignSchema>;
export type CampaignUpdateInput = z.infer<typeof UpdateCampaignSchema>;
export type ABTestInput = z.infer<typeof CreateABTestSchema>;
export type ConsentInput = z.infer<typeof CreateConsentSchema>;
export type CampaignQueryInput = z.infer<typeof CampaignQuerySchema>;

// Temporary schema exports
export const createProtocolExperimentSchema = { type: 'object' } as const;
export const updateProtocolExperimentSchema = { type: 'object' } as const;
export const createProtocolFeedbackSchema = { type: 'object' } as const;
export const updateProtocolFeedbackSchema = { type: 'object' } as const;
export const createProtocolOutcomeSchema = { type: 'object' } as const;
export const createProtocolVersionSchema = { type: 'object' } as const;
export const updateProtocolVersionSchema = { type: 'object' } as const;
export const predictionPeriodTypeSchema = { type: 'string' } as const;
export const createForecastingScenarioSchema = { type: 'object' } as const;
export const budgetSchema = { type: 'object' } as const;
export const approvalSchema = { type: 'object' } as const;
export const bulkBudgetCreateSchema = { type: 'object' } as const;
export const ABTestCreateSchema = { type: 'object' } as const;
