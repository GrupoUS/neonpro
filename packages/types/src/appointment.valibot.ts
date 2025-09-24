/**
 * Appointment Types and Valibot Schemas
 * Brazilian Aesthetic Clinic Operations
 */

import * as v from 'valibot';
import { BrazilianPhoneSchema } from './patient.valibot';

// Appointment Status Types
export const AppointmentStatus = v.picklist([
  'scheduled',
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'rescheduled',
]);

export type AppointmentStatus = v.InferOutput<typeof AppointmentStatus>;

// Aesthetic Procedure Types
export const AestheticProcedureType = v.picklist([
  'botox',
  'preenchimento',
  'peeling',
  'laser',
  'limpeza_pele',
  'harmonização_facial',
  'microagulhamento',
  'fotorejuvenescimento',
]);

export type AestheticProcedureType = v.InferOutput<
  typeof AestheticProcedureType
>;

// Appointment Priority
export const AppointmentPriority = v.picklist([
  'low',
  'normal',
  'high',
  'urgent',
]);

export type AppointmentPriority = v.InferOutput<typeof AppointmentPriority>;

// Brazilian CPF Schema
export const BrazilianCPFSchema = v.pipe(
  v.string(),
  v.regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Invalid CPF format'),
);

// Patient Schema
export const PatientSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
  email: v.pipe(v.string(), v.email()),
  phone: BrazilianPhoneSchema,
  cpf: BrazilianCPFSchema,
  date_of_birth: v.pipe(v.string(), v.isoDate()),
  gender: v.picklist(['M', 'F', 'O']),
  address: v.optional(v.string()),
  emergency_contact: v.optional(v.string()),
  allergies: v.optional(v.array(v.string())),
  medical_history: v.optional(v.string()),
  lgpd_consent: v.boolean(),
  lgpd_consent_date: v.optional(v.pipe(v.string(), v.isoDateTime())),
  whatsapp_consent: v.boolean(),
  created_at: v.pipe(v.string(), v.isoDateTime()),
  updated_at: v.pipe(v.string(), v.isoDateTime()),
});

export type Patient = v.InferOutput<typeof PatientSchema>;

// Professional Schema
export const ProfessionalSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
  email: v.pipe(v.string(), v.email()),
  cfm_license: v.optional(v.pipe(v.string(), v.regex(/^CFM\/\d{4,6}$/))),
  specialties: v.array(v.string()),
  phone: BrazilianPhoneSchema,
  is_active: v.boolean(),
  can_prescribe: v.boolean(),
  created_at: v.pipe(v.string(), v.isoDateTime()),
  updated_at: v.pipe(v.string(), v.isoDateTime()),
});

export type Professional = v.InferOutput<typeof ProfessionalSchema>;

// Appointment Schema
export const AppointmentSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  patient_id: v.pipe(v.string(), v.uuid()),
  professional_id: v.pipe(v.string(), v.uuid()),
  clinic_id: v.pipe(v.string(), v.uuid()),
  procedure_type: AestheticProcedureType,
  status: AppointmentStatus,
  priority: AppointmentPriority,
  scheduled_date: v.pipe(v.string(), v.isoDateTime()),
  duration_minutes: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(15),
    v.maxValue(480),
  ),
  estimated_cost: v.optional(v.pipe(v.number(), v.minValue(0))),
  notes: v.optional(v.string()),
  pre_procedure_instructions: v.optional(v.string()),
  post_procedure_instructions: v.optional(v.string()),
  consent_forms_signed: v.boolean(),
  payment_status: v.picklist(['pending', 'partial', 'paid', 'refunded']),
  reminder_preferences: v.object({
    whatsapp: v.boolean(),
    sms: v.boolean(),
    email: v.boolean(),
    hours_before: v.array(
      v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(168)),
    ),
  }),
  no_show_risk_score: v.optional(
    v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  ),
  weather_sensitive: v.optional(v.boolean()),
  created_at: v.pipe(v.string(), v.isoDateTime()),
  updated_at: v.pipe(v.string(), v.isoDateTime()),
  cancelled_at: v.optional(v.pipe(v.string(), v.isoDateTime())),
  cancellation_reason: v.optional(v.string()),
});

export type Appointment = v.InferOutput<typeof AppointmentSchema>;

// Appointment Creation Schema
export const CreateAppointmentSchema = v.object({
  patient_id: v.pipe(v.string(), v.uuid()),
  professional_id: v.pipe(v.string(), v.uuid()),
  clinic_id: v.pipe(v.string(), v.uuid()),
  procedure_type: AestheticProcedureType,
  scheduled_date: v.pipe(v.string(), v.isoDateTime()),
  duration_minutes: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(15),
    v.maxValue(480),
  ),
  priority: v.optional(AppointmentPriority),
  estimated_cost: v.optional(v.pipe(v.number(), v.minValue(0))),
  notes: v.optional(v.string()),
  reminder_preferences: v.optional(
    v.object({
      whatsapp: v.boolean(),
      sms: v.boolean(),
      email: v.boolean(),
      hours_before: v.array(
        v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(168)),
      ),
    }),
  ),
});

export type CreateAppointment = v.InferOutput<typeof CreateAppointmentSchema>;

// Appointment Update Schema
export const UpdateAppointmentSchema = v.object({
  status: v.optional(AppointmentStatus),
  scheduled_date: v.optional(v.pipe(v.string(), v.isoDateTime())),
  duration_minutes: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(15), v.maxValue(480)),
  ),
  notes: v.optional(v.string()),
  cancellation_reason: v.optional(v.string()),
  payment_status: v.optional(
    v.picklist(['pending', 'partial', 'paid', 'refunded']),
  ),
  consent_forms_signed: v.optional(v.boolean()),
});

export type UpdateAppointment = v.InferOutput<typeof UpdateAppointmentSchema>;

// Appointment Search Filters
export const AppointmentFiltersSchema = v.object({
  patient_id: v.optional(v.pipe(v.string(), v.uuid())),
  professional_id: v.optional(v.pipe(v.string(), v.uuid())),
  clinic_id: v.optional(v.pipe(v.string(), v.uuid())),
  status: v.optional(AppointmentStatus),
  procedure_type: v.optional(AestheticProcedureType),
  date_from: v.optional(v.pipe(v.string(), v.isoDate())),
  date_to: v.optional(v.pipe(v.string(), v.isoDate())),
  high_risk_no_show: v.optional(v.boolean()),
  payment_status: v.optional(
    v.picklist(['pending', 'partial', 'paid', 'refunded']),
  ),
});

export type AppointmentFilters = v.InferOutput<typeof AppointmentFiltersSchema>;

// Reminder Configuration
export const ReminderConfigSchema = v.object({
  appointment_id: v.pipe(v.string(), v.uuid()),
  reminder_type: v.picklist(['24h', '12h', '6h', '2h', 'confirmacao']),
  channel: v.picklist(['whatsapp', 'sms', 'email']),
  scheduled_time: v.pipe(v.string(), v.isoDateTime()),
  sent: v.boolean(),
  sent_at: v.optional(v.pipe(v.string(), v.isoDateTime())),
  response_received: v.optional(v.boolean()),
  response_type: v.optional(
    v.picklist(['confirmed', 'cancelled', 'rescheduled']),
  ),
});

export type ReminderConfig = v.InferOutput<typeof ReminderConfigSchema>;

// No-Show Prediction
export const NoShowPredictionSchema = v.object({
  appointment_id: v.pipe(v.string(), v.uuid()),
  risk_score: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  risk_level: v.picklist(['low', 'medium', 'high']),
  factors: v.object({
    weather_risk: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
    historical_pattern: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
    appointment_timing: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
    patient_behavior: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
    procedure_complexity: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  }),
  recommendations: v.array(v.string()),
  prediction_date: v.pipe(v.string(), v.isoDateTime()),
});

export type NoShowPrediction = v.InferOutput<typeof NoShowPredictionSchema>;

// Appointment Analytics
export const AppointmentAnalyticsSchema = v.object({
  total_appointments: v.pipe(v.number(), v.integer(), v.minValue(0)),
  completed_appointments: v.pipe(v.number(), v.integer(), v.minValue(0)),
  cancelled_appointments: v.pipe(v.number(), v.integer(), v.minValue(0)),
  no_show_appointments: v.pipe(v.number(), v.integer(), v.minValue(0)),
  completion_rate: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  no_show_rate: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  average_duration: v.pipe(v.number(), v.minValue(0)),
  revenue_total: v.pipe(v.number(), v.minValue(0)),
  most_popular_procedures: v.array(
    v.object({
      procedure_type: AestheticProcedureType,
      count: v.pipe(v.number(), v.integer(), v.minValue(0)),
      percentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
    }),
  ),
  period_start: v.pipe(v.string(), v.isoDate()),
  period_end: v.pipe(v.string(), v.isoDate()),
  generated_at: v.pipe(v.string(), v.isoDateTime()),
});

export type AppointmentAnalytics = v.InferOutput<
  typeof AppointmentAnalyticsSchema
>;
