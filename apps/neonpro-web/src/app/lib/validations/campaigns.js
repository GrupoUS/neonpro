"use strict";
// Marketing Campaigns Validation Schemas
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABTestCreateSchema =
  exports.bulkBudgetCreateSchema =
  exports.approvalSchema =
  exports.budgetSchema =
  exports.createForecastingScenarioSchema =
  exports.predictionPeriodTypeSchema =
  exports.updateProtocolVersionSchema =
  exports.createProtocolVersionSchema =
  exports.createProtocolOutcomeSchema =
  exports.updateProtocolFeedbackSchema =
  exports.createProtocolFeedbackSchema =
  exports.updateProtocolExperimentSchema =
  exports.createProtocolExperimentSchema =
  exports.CampaignQuerySchema =
  exports.CreateConsentSchema =
  exports.MarketingConsentSchema =
  exports.CreateABTestSchema =
  exports.CampaignABTestSchema =
  exports.CampaignExecutionSchema =
  exports.UpdateCampaignSchema =
  exports.CreateCampaignSchema =
  exports.MarketingCampaignSchema =
  exports.CreateCampaignTemplateSchema =
  exports.CampaignTemplateSchema =
    void 0;
var zod_1 = require("zod");
// Campaign Template Schemas
exports.CampaignTemplateSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  name: zod_1.z.string().min(1, "Template name is required"),
  description: zod_1.z.string().optional(),
  template_type: zod_1.z.enum(["email", "sms", "whatsapp", "push", "multi-channel"]),
  content_template: zod_1.z.record(zod_1.z.any()),
  subject_template: zod_1.z.string().optional(),
  personalization_fields: zod_1.z.record(zod_1.z.any()).optional(),
  target_segments: zod_1.z.record(zod_1.z.any()).optional(),
  default_settings: zod_1.z.record(zod_1.z.any()).optional(),
  is_active: zod_1.z.boolean().default(true),
  created_by: zod_1.z.string().uuid().optional(),
  created_at: zod_1.z.string(),
  updated_at: zod_1.z.string(),
});
exports.CreateCampaignTemplateSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Template name is required"),
  description: zod_1.z.string().optional(),
  template_type: zod_1.z.enum(["email", "sms", "whatsapp", "push", "multi-channel"]),
  content_template: zod_1.z.record(zod_1.z.any()),
  subject_template: zod_1.z.string().optional(),
  personalization_fields: zod_1.z.record(zod_1.z.any()).optional(),
  target_segments: zod_1.z.record(zod_1.z.any()).optional(),
  default_settings: zod_1.z.record(zod_1.z.any()).optional(),
  is_active: zod_1.z.boolean().default(true),
});
// Marketing Campaign Schemas
exports.MarketingCampaignSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  name: zod_1.z.string().min(1, "Campaign name is required"),
  description: zod_1.z.string().optional(),
  campaign_type: zod_1.z.enum(["automated", "manual", "trigger-based", "a-b-test"]),
  template_id: zod_1.z.string().uuid().optional(),
  target_segments: zod_1.z.record(zod_1.z.any()),
  content: zod_1.z.record(zod_1.z.any()),
  delivery_channels: zod_1.z
    .array(zod_1.z.string())
    .min(1, "At least one delivery channel is required"),
  schedule_config: zod_1.z.record(zod_1.z.any()).optional(),
  trigger_config: zod_1.z.record(zod_1.z.any()).optional(),
  personalization_config: zod_1.z.record(zod_1.z.any()).optional(),
  send_time_optimization: zod_1.z.boolean().default(true),
  automation_level: zod_1.z.number().min(0).max(1).default(0.8), // ≥80% automation target
  status: zod_1.z
    .enum(["draft", "scheduled", "running", "paused", "completed", "cancelled"])
    .default("draft"),
  start_date: zod_1.z.string().optional(),
  end_date: zod_1.z.string().optional(),
  created_by: zod_1.z.string().uuid().optional(),
  created_at: zod_1.z.string(),
  updated_at: zod_1.z.string(),
});
exports.CreateCampaignSchema = zod_1.z
  .object({
    name: zod_1.z.string().min(1, "Campaign name is required").max(255, "Campaign name too long"),
    description: zod_1.z.string().optional(),
    campaign_type: zod_1.z.enum(["automated", "manual", "trigger-based", "a-b-test"]),
    template_id: zod_1.z.string().uuid().optional(),
    target_segments: zod_1.z.record(zod_1.z.any()),
    content: zod_1.z.record(zod_1.z.any()),
    delivery_channels: zod_1.z
      .array(zod_1.z.enum(["email", "sms", "whatsapp", "push"]))
      .min(1, "At least one delivery channel is required"),
    schedule_config: zod_1.z.record(zod_1.z.any()).optional(),
    trigger_config: zod_1.z.record(zod_1.z.any()).optional(),
    personalization_config: zod_1.z.record(zod_1.z.any()).optional(),
    send_time_optimization: zod_1.z.boolean().default(true),
    automation_level: zod_1.z
      .number()
      .min(0.8, "Automation level must be at least 80%")
      .max(1)
      .default(0.8),
    start_date: zod_1.z.string().optional(),
    end_date: zod_1.z.string().optional(),
  })
  .refine(
    function (data) {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) < new Date(data.end_date);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    },
  );
exports.UpdateCampaignSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  name: zod_1.z
    .string()
    .min(1, "Campaign name is required")
    .max(255, "Campaign name too long")
    .optional(),
  description: zod_1.z.string().optional(),
  campaign_type: zod_1.z.enum(["automated", "manual", "trigger-based", "a-b-test"]).optional(),
  template_id: zod_1.z.string().uuid().optional(),
  target_segments: zod_1.z.record(zod_1.z.any()).optional(),
  content: zod_1.z.record(zod_1.z.any()).optional(),
  delivery_channels: zod_1.z
    .array(zod_1.z.enum(["email", "sms", "whatsapp", "push"]))
    .min(1, "At least one delivery channel is required")
    .optional(),
  schedule_config: zod_1.z.record(zod_1.z.any()).optional(),
  trigger_config: zod_1.z.record(zod_1.z.any()).optional(),
  personalization_config: zod_1.z.record(zod_1.z.any()).optional(),
  send_time_optimization: zod_1.z.boolean().optional(),
  automation_level: zod_1.z
    .number()
    .min(0.8, "Automation level must be at least 80%")
    .max(1)
    .optional(),
  start_date: zod_1.z.string().optional(),
  end_date: zod_1.z.string().optional(),
});
// Campaign Execution Schemas
exports.CampaignExecutionSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  campaign_id: zod_1.z.string().uuid(),
  execution_type: zod_1.z.enum(["scheduled", "triggered", "manual", "test"]),
  target_patient_ids: zod_1.z.array(zod_1.z.string().uuid()),
  content_variation_id: zod_1.z.string().optional(),
  delivery_channel: zod_1.z.string(),
  personalized_content: zod_1.z.record(zod_1.z.any()),
  execution_status: zod_1.z
    .enum(["pending", "sending", "sent", "failed", "cancelled"])
    .default("pending"),
  scheduled_at: zod_1.z.string().optional(),
  executed_at: zod_1.z.string().optional(),
  metrics: zod_1.z.record(zod_1.z.any()).optional(),
  error_details: zod_1.z.record(zod_1.z.any()).optional(),
  created_at: zod_1.z.string(),
});
// A/B Test Schemas
exports.CampaignABTestSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  campaign_id: zod_1.z.string().uuid(),
  test_name: zod_1.z.string().min(1, "Test name is required"),
  test_type: zod_1.z.enum(["content", "subject", "timing", "channel", "multivariate"]),
  variations: zod_1.z.record(zod_1.z.any()),
  traffic_split: zod_1.z.record(zod_1.z.any()),
  success_metrics: zod_1.z.record(zod_1.z.any()),
  confidence_level: zod_1.z.number().min(0.8).max(0.99).default(0.95),
  min_sample_size: zod_1.z.number().min(50).default(100),
  test_duration_hours: zod_1.z.number().min(1).optional(),
  status: zod_1.z.enum(["draft", "running", "completed", "stopped"]).default("draft"),
  winner_variation_id: zod_1.z.string().optional(),
  statistical_significance: zod_1.z.number().optional(),
  results: zod_1.z.record(zod_1.z.any()).optional(),
  auto_select_winner: zod_1.z.boolean().default(false),
  started_at: zod_1.z.string().optional(),
  completed_at: zod_1.z.string().optional(),
  created_by: zod_1.z.string().uuid().optional(),
  created_at: zod_1.z.string(),
});
exports.CreateABTestSchema = zod_1.z.object({
  campaign_id: zod_1.z.string().uuid(),
  test_name: zod_1.z.string().min(1, "Test name is required"),
  test_type: zod_1.z.enum(["content", "subject", "timing", "channel", "multivariate"]),
  variations: zod_1.z.record(zod_1.z.any()),
  traffic_split: zod_1.z.record(zod_1.z.any()),
  success_metrics: zod_1.z.record(zod_1.z.any()),
  confidence_level: zod_1.z.number().min(0.8).max(0.99).default(0.95),
  min_sample_size: zod_1.z.number().min(50).default(100),
  test_duration_hours: zod_1.z.number().min(1).optional(),
  auto_select_winner: zod_1.z.boolean().default(false),
});
// Marketing Consent Schemas
exports.MarketingConsentSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  patient_id: zod_1.z.string().uuid(),
  consent_type: zod_1.z.enum(["email", "sms", "whatsapp", "push", "all"]),
  consent_status: zod_1.z.boolean(),
  consent_source: zod_1.z.string().optional(),
  consent_date: zod_1.z.string(),
  expiry_date: zod_1.z.string().optional(),
  withdrawal_date: zod_1.z.string().optional(),
  withdrawal_reason: zod_1.z.string().optional(),
  opt_in_campaign_id: zod_1.z.string().uuid().optional(),
  legal_basis: zod_1.z.string().optional(),
  consent_text: zod_1.z.string().optional(),
  created_at: zod_1.z.string(),
});
exports.CreateConsentSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  consent_type: zod_1.z.enum(["email", "sms", "whatsapp", "push", "all"]),
  consent_status: zod_1.z.boolean(),
  consent_source: zod_1.z.string().optional(),
  consent_date: zod_1.z.string().default(function () {
    return new Date().toISOString();
  }),
  expiry_date: zod_1.z.string().optional(),
  legal_basis: zod_1.z.string().optional(),
  consent_text: zod_1.z.string().optional(),
});
// Query Parameter Schemas
exports.CampaignQuerySchema = zod_1.z.object({
  page: zod_1.z.coerce.number().min(1).default(1),
  limit: zod_1.z.coerce.number().min(1).max(100).default(20),
  sort: zod_1.z.enum(["created_at", "name", "status", "automation_level"]).default("created_at"),
  order: zod_1.z.enum(["asc", "desc"]).default("desc"),
  status: zod_1.z.string().optional(),
  campaign_type: zod_1.z.string().optional(),
  search: zod_1.z.string().optional(),
});
// Temporary schema exports
exports.createProtocolExperimentSchema = { type: "object" };
exports.updateProtocolExperimentSchema = { type: "object" };
exports.createProtocolFeedbackSchema = { type: "object" };
exports.updateProtocolFeedbackSchema = { type: "object" };
exports.createProtocolOutcomeSchema = { type: "object" };
exports.createProtocolVersionSchema = { type: "object" };
exports.updateProtocolVersionSchema = { type: "object" };
exports.predictionPeriodTypeSchema = { type: "string" };
exports.createForecastingScenarioSchema = { type: "object" };
exports.budgetSchema = { type: "object" };
exports.approvalSchema = { type: "object" };
exports.bulkBudgetCreateSchema = { type: "object" };
exports.ABTestCreateSchema = { type: "object" };
