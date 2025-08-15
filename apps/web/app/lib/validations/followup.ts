// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { z } from 'zod';

// Base validation schemas
export const followupProtocolSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  treatment_type: z
    .string()
    .min(1, 'Tipo de tratamento é obrigatório')
    .max(100),
  specialty: z.string().max(100).optional(),
  protocol_version: z.string().max(20).default('1.0'),
  is_active: z.boolean().default(true),
  evidence_level: z.enum(['A', 'B', 'C', 'D']),
  protocol_source: z.string().max(500).optional(),

  // Follow-up scheduling rules
  initial_followup_days: z.number().int().min(0).max(365),
  subsequent_intervals: z.array(z.number().int().min(1).max(365)),
  max_followups: z.number().int().min(1).max(20).default(4),
  urgent_threshold_hours: z.number().int().min(1).max(168).default(24),

  // Automation settings
  automation_level: z.number().min(0.5).max(1.0),
  auto_schedule_enabled: z.boolean().default(true),
  auto_reminders_enabled: z.boolean().default(true),
  escalation_enabled: z.boolean().default(true),

  // Content templates
  sms_template: z.string().max(160).optional(),
  whatsapp_template: z.string().max(1000).optional(),
  email_template: z.string().max(5000).optional(),
  phone_script: z.string().max(2000).optional(),

  // Compliance tracking
  lgpd_compliant: z.boolean().default(true),
  consent_required: z.boolean().default(true),
  data_retention_days: z.number().int().min(30).max(3650).default(2555),
});

export const patientFollowupSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  treatment_id: z.string().uuid().optional(),
  protocol_id: z.string().uuid(),

  // Follow-up details
  followup_type: z.enum(['initial', 'routine', 'urgent', 'outcome_check']),
  sequence_number: z.number().int().min(1).default(1),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  scheduled_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Hora inválida')
    .optional(),
  optimal_time_calculated: z.boolean().default(false),

  // Communication preferences
  preferred_channel: z
    .enum(['sms', 'whatsapp', 'email', 'phone'])
    .default('sms'),
  backup_channels: z
    .array(z.enum(['sms', 'whatsapp', 'email', 'phone']))
    .default(['email', 'phone']),
  language_preference: z.string().max(10).default('pt-BR'),

  // Status tracking
  status: z
    .enum([
      'scheduled',
      'sent',
      'completed',
      'missed',
      'cancelled',
      'escalated',
    ])
    .default('scheduled'),
  attempts_count: z.number().int().min(0).default(0),
  last_attempt_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),

  // Response tracking
  patient_responded: z.boolean().default(false),
  response_channel: z.enum(['sms', 'whatsapp', 'email', 'phone']).optional(),
  response_content: z.string().max(1000).optional(),
  satisfaction_score: z.number().int().min(1).max(10).optional(),

  // Outcome tracking
  treatment_compliance_score: z.number().min(0).max(1).optional(),
  symptoms_improved: z.boolean().optional(),
  side_effects_reported: z.boolean().optional(),
  additional_care_needed: z.boolean().optional(),
  notes: z.string().max(2000).optional(),

  // Automation metadata
  auto_generated: z.boolean().default(true),
  ai_optimized_timing: z.boolean().default(false),
  shadow_test_variant: z.string().max(50).optional(),
});

export const followupCommunicationSchema = z.object({
  id: z.string().uuid().optional(),
  followup_id: z.string().uuid(),

  // Communication details
  channel: z.enum(['sms', 'whatsapp', 'email', 'phone']),
  message_content: z.string().max(5000).optional(),
  sent_at: z.string().datetime(),
  delivery_status: z
    .enum(['pending', 'sent', 'delivered', 'failed', 'read'])
    .default('pending'),
  delivery_confirmed_at: z.string().datetime().optional(),

  // Response tracking
  response_received: z.boolean().default(false),
  response_time_minutes: z.number().int().min(0).optional(),
  response_content: z.string().max(1000).optional(),

  // Metadata
  cost_cents: z.number().int().min(0).optional(),
  provider_message_id: z.string().max(255).optional(),
  internal_notes: z.string().max(1000).optional(),
});

export const escalationRuleSchema = z.object({
  id: z.string().uuid().optional(),
  protocol_id: z.string().uuid(),

  // Trigger conditions
  trigger_condition: z.enum([
    'missed_followup',
    'negative_response',
    'urgent_symptoms',
    'manual_escalation',
  ]),
  trigger_threshold: z.number().int().min(1).default(1),
  time_threshold_hours: z.number().int().min(1).max(168).optional(),

  // Escalation levels
  escalation_level: z.enum(['low', 'medium', 'high', 'critical']),
  escalation_path: z.array(z.string().max(100)),

  // Actions
  auto_assign_staff: z.boolean().default(false),
  staff_role: z.string().max(50).optional(),
  create_task: z.boolean().default(true),
  task_priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

  // Notifications
  notify_immediately: z.boolean().default(true),
  notification_channels: z.array(
    z.enum(['email', 'sms', 'whatsapp', 'phone', 'dashboard'])
  ),
  notification_template: z.string().max(1000).optional(),
  internal_alert_template: z.string().max(1000).optional(),

  is_active: z.boolean().default(true),
});

export const performanceAnalyticsSchema = z.object({
  id: z.string().uuid().optional(),

  // Time period
  analysis_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  period_type: z.enum(['daily', 'weekly', 'monthly']).default('daily'),

  // Volume metrics
  total_followups_scheduled: z.number().int().min(0).default(0),
  total_followups_completed: z.number().int().min(0).default(0),
  total_followups_missed: z.number().int().min(0).default(0),
  total_escalations: z.number().int().min(0).default(0),

  // Performance metrics
  completion_rate: z.number().min(0).max(100).default(0),
  response_rate: z.number().min(0).max(100).default(0),
  satisfaction_average: z.number().min(0).max(10).default(0),
  escalation_rate: z.number().min(0).max(100).default(0),

  // Channel performance
  sms_success_rate: z.number().min(0).max(100).default(0),
  whatsapp_success_rate: z.number().min(0).max(100).default(0),
  email_success_rate: z.number().min(0).max(100).default(0),
  phone_success_rate: z.number().min(0).max(100).default(0),

  // Timing optimization
  optimal_time_accuracy: z.number().min(0).max(100).default(0),
  avg_response_time_minutes: z.number().int().min(0).default(0),

  // Treatment outcomes
  treatment_improvement_rate: z.number().min(0).max(100).default(0),
  goal_achievement_rate: z.number().min(0).max(100).default(0),

  // AI performance
  ai_prediction_accuracy: z.number().min(0).max(100).default(0),
  automation_success_rate: z.number().min(0).max(100).default(0),
});

// API request schemas
export const createFollowupProtocolSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  description: z.string().max(1000).optional(),
  treatment_type: z
    .string()
    .min(1, 'Tipo de tratamento é obrigatório')
    .max(100),
  specialty: z.string().max(100).optional(),
  evidence_level: z.enum(['A', 'B', 'C', 'D']),
  protocol_source: z.string().max(500).optional(),
  initial_followup_days: z.number().int().min(0).max(365),
  subsequent_intervals: z
    .array(z.number().int().min(1).max(365))
    .min(1, 'Pelo menos um intervalo é obrigatório'),
  max_followups: z.number().int().min(1).max(20).default(4),
  urgent_threshold_hours: z.number().int().min(1).max(168).default(24),
  automation_level: z.number().min(0.5).max(1.0),
  auto_schedule_enabled: z.boolean().default(true),
  auto_reminders_enabled: z.boolean().default(true),
  escalation_enabled: z.boolean().default(true),
  sms_template: z.string().max(160).optional(),
  whatsapp_template: z.string().max(1000).optional(),
  email_template: z.string().max(5000).optional(),
  phone_script: z.string().max(2000).optional(),
  lgpd_compliant: z.boolean().default(true),
  consent_required: z.boolean().default(true),
  data_retention_days: z.number().int().min(30).max(3650).default(2555),
});

export const createPatientFollowupSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  treatment_id: z.string().uuid('ID do tratamento inválido').optional(),
  protocol_id: z.string().uuid('ID do protocolo inválido'),
  followup_type: z.enum(['initial', 'routine', 'urgent', 'outcome_check']),
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
  scheduled_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Hora inválida (use HH:MM)')
    .optional(),
  preferred_channel: z
    .enum(['sms', 'whatsapp', 'email', 'phone'])
    .default('sms'),
  backup_channels: z
    .array(z.enum(['sms', 'whatsapp', 'email', 'phone']))
    .default(['email', 'phone']),
  language_preference: z.string().max(10).default('pt-BR'),
  shadow_test_variant: z.string().max(50).optional(),
});

export const createTreatmentOutcomeSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  treatment_id: z.string().uuid('ID do tratamento inválido').optional(),
  followup_id: z.string().uuid('ID do follow-up inválido').optional(),
  outcome_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
  measurement_type: z.string().min(1, 'Tipo de medição é obrigatório').max(50),
  value_numeric: z.number().optional(),
  value_text: z.string().max(500).optional(),
  scale_type: z.enum(['1_to_10', 'percentage', 'yes_no', 'custom']),
  clinical_improvement: z.boolean().optional(),
  meets_treatment_goals: z.boolean().optional(),
  requires_additional_treatment: z.boolean().optional(),
  patient_satisfaction: z.number().int().min(1).max(10).optional(),
  quality_of_life_score: z.number().min(0).max(1).optional(),
  pain_level: z.number().int().min(0).max(10).optional(),
  mobility_score: z.number().min(0).max(1).optional(),
  next_followup_recommended: z.boolean().default(true),
  followup_interval_days: z.number().int().min(1).max(365).optional(),
  escalation_required: z.boolean().default(false),
  referral_needed: z.boolean().default(false),
  specialist_type: z.string().max(100).optional(),
  data_source: z
    .enum(['patient_report', 'clinical_exam', 'automated_assessment'])
    .default('patient_report'),
  reliability_score: z.number().min(0).max(1).default(0.8),
});

export const treatmentOutcomeSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  treatment_id: z.string().uuid().optional(),
  followup_id: z.string().uuid().optional(),
  outcome_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  measurement_type: z.string().max(50),
  value_numeric: z.number().optional(),
  value_text: z.string().max(500).optional(),
  scale_type: z.enum(['1_to_10', 'percentage', 'yes_no', 'custom']),
  clinical_improvement: z.boolean().optional(),
  meets_treatment_goals: z.boolean().optional(),
  requires_additional_treatment: z.boolean().optional(),
  patient_satisfaction: z.number().int().min(1).max(10).optional(),
  quality_of_life_score: z.number().min(0).max(1).optional(),
  pain_level: z.number().int().min(0).max(10).optional(),
  mobility_score: z.number().min(0).max(1).optional(),
  next_followup_recommended: z.boolean().default(true),
  followup_interval_days: z.number().int().min(1).max(365).optional(),
  escalation_required: z.boolean().default(false),
  referral_needed: z.boolean().default(false),
  specialist_type: z.string().max(100).optional(),
  data_source: z
    .enum(['patient_report', 'clinical_exam', 'automated_assessment'])
    .default('patient_report'),
  reliability_score: z.number().min(0).max(1).default(0.8),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const updateFollowupStatusSchema = z.object({
  status: z.enum([
    'scheduled',
    'sent',
    'completed',
    'missed',
    'cancelled',
    'escalated',
  ]),
  patient_responded: z.boolean().optional(),
  response_channel: z.enum(['sms', 'whatsapp', 'email', 'phone']).optional(),
  response_content: z.string().max(1000).optional(),
  satisfaction_score: z.number().int().min(1).max(10).optional(),
  treatment_compliance_score: z.number().min(0).max(1).optional(),
  symptoms_improved: z.boolean().optional(),
  side_effects_reported: z.boolean().optional(),
  additional_care_needed: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

export const followupFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().max(255).optional(),
  patient_id: z.string().uuid().optional(),
  protocol_id: z.string().uuid().optional(),
  status: z
    .enum([
      'scheduled',
      'sent',
      'completed',
      'missed',
      'cancelled',
      'escalated',
    ])
    .optional(),
  followup_type: z
    .enum(['initial', 'routine', 'urgent', 'outcome_check'])
    .optional(),
  channel: z.enum(['sms', 'whatsapp', 'email', 'phone']).optional(),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  escalation_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  automation_only: z.boolean().optional(),
  pending_only: z.boolean().optional(),
  overdue_only: z.boolean().optional(),
  order: z.string().max(50).default('scheduled_date desc'),
});

// Message template validation
export const messageTemplateSchema = z
  .object({
    template: z.string().min(1, 'Template é obrigatório'),
    variables: z.record(z.string(), z.union([z.string(), z.number()])),
    channel: z.enum(['sms', 'whatsapp', 'email', 'phone']),
    max_length: z.number().int().min(1).optional(),
  })
  .refine(
    (data) => {
      // Channel-specific length validation
      const lengths = {
        sms: 160,
        whatsapp: 1000,
        email: 5000,
        phone: 2000,
      };

      const maxLength = data.max_length || lengths[data.channel];
      return data.template.length <= maxLength;
    },
    {
      message: 'Template excede o tamanho máximo permitido para o canal',
    }
  );

// AI optimization schemas
export const aiTimingOptimizationSchema = z.object({
  patient_id: z.string().uuid(),
  historical_response_times: z.array(z.number().int().min(0)),
  preferred_time_slots: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
  timezone: z.string().max(50),
  optimal_day_of_week: z.number().int().min(0).max(6),
  optimal_hour: z.number().int().min(0).max(23),
  confidence_score: z.number().min(0).max(1),
  factors_analyzed: z.array(z.string().max(100)),
});

export const aiPersonalizationSchema = z.object({
  message_tone: z.enum(['formal', 'casual', 'empathetic', 'urgent']),
  content_focus: z.array(z.string().max(100)),
  channel_preference: z.enum(['sms', 'whatsapp', 'email', 'phone']),
  frequency_adjustment: z.enum(['increase', 'decrease', 'maintain']),
  escalation_threshold: z.number().min(0).max(1),
  personalization_confidence: z.number().min(0).max(1),
});
