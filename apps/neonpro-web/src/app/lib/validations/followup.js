"use strict";
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiPersonalizationSchema =
  exports.aiTimingOptimizationSchema =
  exports.messageTemplateSchema =
  exports.followupFiltersSchema =
  exports.updateFollowupStatusSchema =
  exports.treatmentOutcomeSchema =
  exports.createTreatmentOutcomeSchema =
  exports.createPatientFollowupSchema =
  exports.createFollowupProtocolSchema =
  exports.performanceAnalyticsSchema =
  exports.escalationRuleSchema =
  exports.followupCommunicationSchema =
  exports.patientFollowupSchema =
  exports.followupProtocolSchema =
    void 0;
var zod_1 = require("zod");
// Base validation schemas
exports.followupProtocolSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  name: zod_1.z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: zod_1.z.string().max(1000, "Descrição muito longa").optional(),
  treatment_type: zod_1.z.string().min(1, "Tipo de tratamento é obrigatório").max(100),
  specialty: zod_1.z.string().max(100).optional(),
  protocol_version: zod_1.z.string().max(20).default("1.0"),
  is_active: zod_1.z.boolean().default(true),
  evidence_level: zod_1.z.enum(["A", "B", "C", "D"]),
  protocol_source: zod_1.z.string().max(500).optional(),
  // Follow-up scheduling rules
  initial_followup_days: zod_1.z.number().int().min(0).max(365),
  subsequent_intervals: zod_1.z.array(zod_1.z.number().int().min(1).max(365)),
  max_followups: zod_1.z.number().int().min(1).max(20).default(4),
  urgent_threshold_hours: zod_1.z.number().int().min(1).max(168).default(24),
  // Automation settings
  automation_level: zod_1.z.number().min(0.5).max(1.0),
  auto_schedule_enabled: zod_1.z.boolean().default(true),
  auto_reminders_enabled: zod_1.z.boolean().default(true),
  escalation_enabled: zod_1.z.boolean().default(true),
  // Content templates
  sms_template: zod_1.z.string().max(160).optional(),
  whatsapp_template: zod_1.z.string().max(1000).optional(),
  email_template: zod_1.z.string().max(5000).optional(),
  phone_script: zod_1.z.string().max(2000).optional(),
  // Compliance tracking
  lgpd_compliant: zod_1.z.boolean().default(true),
  consent_required: zod_1.z.boolean().default(true),
  data_retention_days: zod_1.z.number().int().min(30).max(3650).default(2555),
});
exports.patientFollowupSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  treatment_id: zod_1.z.string().uuid().optional(),
  protocol_id: zod_1.z.string().uuid(),
  // Follow-up details
  followup_type: zod_1.z.enum(["initial", "routine", "urgent", "outcome_check"]),
  sequence_number: zod_1.z.number().int().min(1).default(1),
  scheduled_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  scheduled_time: zod_1.z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Hora inválida")
    .optional(),
  optimal_time_calculated: zod_1.z.boolean().default(false),
  // Communication preferences
  preferred_channel: zod_1.z.enum(["sms", "whatsapp", "email", "phone"]).default("sms"),
  backup_channels: zod_1.z
    .array(zod_1.z.enum(["sms", "whatsapp", "email", "phone"]))
    .default(["email", "phone"]),
  language_preference: zod_1.z.string().max(10).default("pt-BR"),
  // Status tracking
  status: zod_1.z
    .enum(["scheduled", "sent", "completed", "missed", "cancelled", "escalated"])
    .default("scheduled"),
  attempts_count: zod_1.z.number().int().min(0).default(0),
  last_attempt_at: zod_1.z.string().datetime().optional(),
  completed_at: zod_1.z.string().datetime().optional(),
  // Response tracking
  patient_responded: zod_1.z.boolean().default(false),
  response_channel: zod_1.z.enum(["sms", "whatsapp", "email", "phone"]).optional(),
  response_content: zod_1.z.string().max(1000).optional(),
  satisfaction_score: zod_1.z.number().int().min(1).max(10).optional(),
  // Outcome tracking
  treatment_compliance_score: zod_1.z.number().min(0).max(1).optional(),
  symptoms_improved: zod_1.z.boolean().optional(),
  side_effects_reported: zod_1.z.boolean().optional(),
  additional_care_needed: zod_1.z.boolean().optional(),
  notes: zod_1.z.string().max(2000).optional(),
  // Automation metadata
  auto_generated: zod_1.z.boolean().default(true),
  ai_optimized_timing: zod_1.z.boolean().default(false),
  shadow_test_variant: zod_1.z.string().max(50).optional(),
});
exports.followupCommunicationSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  followup_id: zod_1.z.string().uuid(),
  // Communication details
  channel: zod_1.z.enum(["sms", "whatsapp", "email", "phone"]),
  message_content: zod_1.z.string().max(5000).optional(),
  sent_at: zod_1.z.string().datetime(),
  delivery_status: zod_1.z
    .enum(["pending", "sent", "delivered", "failed", "read"])
    .default("pending"),
  delivery_confirmed_at: zod_1.z.string().datetime().optional(),
  // Response tracking
  response_received: zod_1.z.boolean().default(false),
  response_time_minutes: zod_1.z.number().int().min(0).optional(),
  response_content: zod_1.z.string().max(1000).optional(),
  // Metadata
  cost_cents: zod_1.z.number().int().min(0).optional(),
  provider_message_id: zod_1.z.string().max(255).optional(),
  internal_notes: zod_1.z.string().max(1000).optional(),
});
exports.escalationRuleSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  protocol_id: zod_1.z.string().uuid(),
  // Trigger conditions
  trigger_condition: zod_1.z.enum([
    "missed_followup",
    "negative_response",
    "urgent_symptoms",
    "manual_escalation",
  ]),
  trigger_threshold: zod_1.z.number().int().min(1).default(1),
  time_threshold_hours: zod_1.z.number().int().min(1).max(168).optional(),
  // Escalation levels
  escalation_level: zod_1.z.enum(["low", "medium", "high", "critical"]),
  escalation_path: zod_1.z.array(zod_1.z.string().max(100)),
  // Actions
  auto_assign_staff: zod_1.z.boolean().default(false),
  staff_role: zod_1.z.string().max(50).optional(),
  create_task: zod_1.z.boolean().default(true),
  task_priority: zod_1.z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  // Notifications
  notify_immediately: zod_1.z.boolean().default(true),
  notification_channels: zod_1.z.array(
    zod_1.z.enum(["email", "sms", "whatsapp", "phone", "dashboard"]),
  ),
  notification_template: zod_1.z.string().max(1000).optional(),
  internal_alert_template: zod_1.z.string().max(1000).optional(),
  is_active: zod_1.z.boolean().default(true),
});
exports.performanceAnalyticsSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  // Time period
  analysis_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  period_type: zod_1.z.enum(["daily", "weekly", "monthly"]).default("daily"),
  // Volume metrics
  total_followups_scheduled: zod_1.z.number().int().min(0).default(0),
  total_followups_completed: zod_1.z.number().int().min(0).default(0),
  total_followups_missed: zod_1.z.number().int().min(0).default(0),
  total_escalations: zod_1.z.number().int().min(0).default(0),
  // Performance metrics
  completion_rate: zod_1.z.number().min(0).max(100).default(0),
  response_rate: zod_1.z.number().min(0).max(100).default(0),
  satisfaction_average: zod_1.z.number().min(0).max(10).default(0),
  escalation_rate: zod_1.z.number().min(0).max(100).default(0),
  // Channel performance
  sms_success_rate: zod_1.z.number().min(0).max(100).default(0),
  whatsapp_success_rate: zod_1.z.number().min(0).max(100).default(0),
  email_success_rate: zod_1.z.number().min(0).max(100).default(0),
  phone_success_rate: zod_1.z.number().min(0).max(100).default(0),
  // Timing optimization
  optimal_time_accuracy: zod_1.z.number().min(0).max(100).default(0),
  avg_response_time_minutes: zod_1.z.number().int().min(0).default(0),
  // Treatment outcomes
  treatment_improvement_rate: zod_1.z.number().min(0).max(100).default(0),
  goal_achievement_rate: zod_1.z.number().min(0).max(100).default(0),
  // AI performance
  ai_prediction_accuracy: zod_1.z.number().min(0).max(100).default(0),
  automation_success_rate: zod_1.z.number().min(0).max(100).default(0),
});
// API request schemas
exports.createFollowupProtocolSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome é obrigatório").max(255),
  description: zod_1.z.string().max(1000).optional(),
  treatment_type: zod_1.z.string().min(1, "Tipo de tratamento é obrigatório").max(100),
  specialty: zod_1.z.string().max(100).optional(),
  evidence_level: zod_1.z.enum(["A", "B", "C", "D"]),
  protocol_source: zod_1.z.string().max(500).optional(),
  initial_followup_days: zod_1.z.number().int().min(0).max(365),
  subsequent_intervals: zod_1.z
    .array(zod_1.z.number().int().min(1).max(365))
    .min(1, "Pelo menos um intervalo é obrigatório"),
  max_followups: zod_1.z.number().int().min(1).max(20).default(4),
  urgent_threshold_hours: zod_1.z.number().int().min(1).max(168).default(24),
  automation_level: zod_1.z.number().min(0.5).max(1.0),
  auto_schedule_enabled: zod_1.z.boolean().default(true),
  auto_reminders_enabled: zod_1.z.boolean().default(true),
  escalation_enabled: zod_1.z.boolean().default(true),
  sms_template: zod_1.z.string().max(160).optional(),
  whatsapp_template: zod_1.z.string().max(1000).optional(),
  email_template: zod_1.z.string().max(5000).optional(),
  phone_script: zod_1.z.string().max(2000).optional(),
  lgpd_compliant: zod_1.z.boolean().default(true),
  consent_required: zod_1.z.boolean().default(true),
  data_retention_days: zod_1.z.number().int().min(30).max(3650).default(2555),
});
exports.createPatientFollowupSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid("ID do paciente inválido"),
  treatment_id: zod_1.z.string().uuid("ID do tratamento inválido").optional(),
  protocol_id: zod_1.z.string().uuid("ID do protocolo inválido"),
  followup_type: zod_1.z.enum(["initial", "routine", "urgent", "outcome_check"]),
  scheduled_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use YYYY-MM-DD)"),
  scheduled_time: zod_1.z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Hora inválida (use HH:MM)")
    .optional(),
  preferred_channel: zod_1.z.enum(["sms", "whatsapp", "email", "phone"]).default("sms"),
  backup_channels: zod_1.z
    .array(zod_1.z.enum(["sms", "whatsapp", "email", "phone"]))
    .default(["email", "phone"]),
  language_preference: zod_1.z.string().max(10).default("pt-BR"),
  shadow_test_variant: zod_1.z.string().max(50).optional(),
});
exports.createTreatmentOutcomeSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid("ID do paciente inválido"),
  treatment_id: zod_1.z.string().uuid("ID do tratamento inválido").optional(),
  followup_id: zod_1.z.string().uuid("ID do follow-up inválido").optional(),
  outcome_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use YYYY-MM-DD)"),
  measurement_type: zod_1.z.string().min(1, "Tipo de medição é obrigatório").max(50),
  value_numeric: zod_1.z.number().optional(),
  value_text: zod_1.z.string().max(500).optional(),
  scale_type: zod_1.z.enum(["1_to_10", "percentage", "yes_no", "custom"]),
  clinical_improvement: zod_1.z.boolean().optional(),
  meets_treatment_goals: zod_1.z.boolean().optional(),
  requires_additional_treatment: zod_1.z.boolean().optional(),
  patient_satisfaction: zod_1.z.number().int().min(1).max(10).optional(),
  quality_of_life_score: zod_1.z.number().min(0).max(1).optional(),
  pain_level: zod_1.z.number().int().min(0).max(10).optional(),
  mobility_score: zod_1.z.number().min(0).max(1).optional(),
  next_followup_recommended: zod_1.z.boolean().default(true),
  followup_interval_days: zod_1.z.number().int().min(1).max(365).optional(),
  escalation_required: zod_1.z.boolean().default(false),
  referral_needed: zod_1.z.boolean().default(false),
  specialist_type: zod_1.z.string().max(100).optional(),
  data_source: zod_1.z
    .enum(["patient_report", "clinical_exam", "automated_assessment"])
    .default("patient_report"),
  reliability_score: zod_1.z.number().min(0).max(1).default(0.8),
});
exports.treatmentOutcomeSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  patient_id: zod_1.z.string().uuid(),
  treatment_id: zod_1.z.string().uuid().optional(),
  followup_id: zod_1.z.string().uuid().optional(),
  outcome_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  measurement_type: zod_1.z.string().max(50),
  value_numeric: zod_1.z.number().optional(),
  value_text: zod_1.z.string().max(500).optional(),
  scale_type: zod_1.z.enum(["1_to_10", "percentage", "yes_no", "custom"]),
  clinical_improvement: zod_1.z.boolean().optional(),
  meets_treatment_goals: zod_1.z.boolean().optional(),
  requires_additional_treatment: zod_1.z.boolean().optional(),
  patient_satisfaction: zod_1.z.number().int().min(1).max(10).optional(),
  quality_of_life_score: zod_1.z.number().min(0).max(1).optional(),
  pain_level: zod_1.z.number().int().min(0).max(10).optional(),
  mobility_score: zod_1.z.number().min(0).max(1).optional(),
  next_followup_recommended: zod_1.z.boolean().default(true),
  followup_interval_days: zod_1.z.number().int().min(1).max(365).optional(),
  escalation_required: zod_1.z.boolean().default(false),
  referral_needed: zod_1.z.boolean().default(false),
  specialist_type: zod_1.z.string().max(100).optional(),
  data_source: zod_1.z
    .enum(["patient_report", "clinical_exam", "automated_assessment"])
    .default("patient_report"),
  reliability_score: zod_1.z.number().min(0).max(1).default(0.8),
  created_at: zod_1.z.string().datetime().optional(),
  updated_at: zod_1.z.string().datetime().optional(),
});
exports.updateFollowupStatusSchema = zod_1.z.object({
  status: zod_1.z.enum(["scheduled", "sent", "completed", "missed", "cancelled", "escalated"]),
  patient_responded: zod_1.z.boolean().optional(),
  response_channel: zod_1.z.enum(["sms", "whatsapp", "email", "phone"]).optional(),
  response_content: zod_1.z.string().max(1000).optional(),
  satisfaction_score: zod_1.z.number().int().min(1).max(10).optional(),
  treatment_compliance_score: zod_1.z.number().min(0).max(1).optional(),
  symptoms_improved: zod_1.z.boolean().optional(),
  side_effects_reported: zod_1.z.boolean().optional(),
  additional_care_needed: zod_1.z.boolean().optional(),
  notes: zod_1.z.string().max(2000).optional(),
});
exports.followupFiltersSchema = zod_1.z.object({
  page: zod_1.z.number().int().min(1).default(1),
  limit: zod_1.z.number().int().min(1).max(100).default(10),
  search: zod_1.z.string().max(255).optional(),
  patient_id: zod_1.z.string().uuid().optional(),
  protocol_id: zod_1.z.string().uuid().optional(),
  status: zod_1.z
    .enum(["scheduled", "sent", "completed", "missed", "cancelled", "escalated"])
    .optional(),
  followup_type: zod_1.z.enum(["initial", "routine", "urgent", "outcome_check"]).optional(),
  channel: zod_1.z.enum(["sms", "whatsapp", "email", "phone"]).optional(),
  date_from: zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  date_to: zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  escalation_level: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
  automation_only: zod_1.z.boolean().optional(),
  pending_only: zod_1.z.boolean().optional(),
  overdue_only: zod_1.z.boolean().optional(),
  order: zod_1.z.string().max(50).default("scheduled_date desc"),
});
// Message template validation
exports.messageTemplateSchema = zod_1.z
  .object({
    template: zod_1.z.string().min(1, "Template é obrigatório"),
    variables: zod_1.z.record(
      zod_1.z.string(),
      zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    ),
    channel: zod_1.z.enum(["sms", "whatsapp", "email", "phone"]),
    max_length: zod_1.z.number().int().min(1).optional(),
  })
  .refine(
    function (data) {
      // Channel-specific length validation
      var lengths = {
        sms: 160,
        whatsapp: 1000,
        email: 5000,
        phone: 2000,
      };
      var maxLength = data.max_length || lengths[data.channel];
      return data.template.length <= maxLength;
    },
    {
      message: "Template excede o tamanho máximo permitido para o canal",
    },
  );
// AI optimization schemas
exports.aiTimingOptimizationSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  historical_response_times: zod_1.z.array(zod_1.z.number().int().min(0)),
  preferred_time_slots: zod_1.z.array(zod_1.z.string().regex(/^\d{2}:\d{2}$/)),
  timezone: zod_1.z.string().max(50),
  optimal_day_of_week: zod_1.z.number().int().min(0).max(6),
  optimal_hour: zod_1.z.number().int().min(0).max(23),
  confidence_score: zod_1.z.number().min(0).max(1),
  factors_analyzed: zod_1.z.array(zod_1.z.string().max(100)),
});
exports.aiPersonalizationSchema = zod_1.z.object({
  message_tone: zod_1.z.enum(["formal", "casual", "empathetic", "urgent"]),
  content_focus: zod_1.z.array(zod_1.z.string().max(100)),
  channel_preference: zod_1.z.enum(["sms", "whatsapp", "email", "phone"]),
  frequency_adjustment: zod_1.z.enum(["increase", "decrease", "maintain"]),
  escalation_threshold: zod_1.z.number().min(0).max(1),
  personalization_confidence: zod_1.z.number().min(0).max(1),
});
