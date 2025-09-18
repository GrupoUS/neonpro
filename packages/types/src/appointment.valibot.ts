/**
 * Appointment Valibot Schemas for Brazilian Healthcare System
 * 
 * Comprehensive validation for appointment scheduling with Brazilian compliance
 * Supports TUSS codes, CFM validation, ANVISA protocols, and AI-powered no-show prevention
 * Optimized for Edge Runtime with timezone support for America/Sao_Paulo
 * 
 * @package @neonpro/types
 * @author Claude AI Agent
 * @version 1.0.0
 * @compliance CFM, ANVISA, TUSS, Brazilian Healthcare Standards
 */

import * as v from 'valibot';

// =====================================
// BRANDED TYPES FOR TYPE SAFETY
// =====================================

/**
 * Branded type for Appointment ID - ensures type safety
 */
export type AppointmentId = string & { readonly __brand: 'AppointmentId' };

/**
 * Branded type for TUSS Code - Brazilian healthcare procedure codes
 */
export type TUSSCode = string & { readonly __brand: 'TUSSCode' };

/**
 * Branded type for CFM Specialty Code
 */
export type CFMSpecialtyCode = string & { readonly __brand: 'CFMSpecialtyCode' };

/**
 * Branded type for CRM Number - Brazilian medical license
 */
export type CRMNumber = string & { readonly __brand: 'CRMNumber' };

/**
 * Branded type for ANVISA Protocol Number
 */
export type ANVISAProtocol = string & { readonly __brand: 'ANVISAProtocol' };

/**
 * Branded type for No-Show Risk Score (0.0-1.0)
 */
export type NoShowRiskScore = number & { readonly __brand: 'NoShowRiskScore' };

// =====================================
// BRAZILIAN HEALTHCARE VALIDATION UTILITIES
// =====================================

/**
 * Validates TUSS (Terminologia Unificada da Saúde Suplementar) procedure codes
 * TUSS codes are 8-digit codes used for healthcare billing in Brazil
 */
const validateTUSSCode = (code: string): boolean => {
  // TUSS codes are 8 digits: XXXXXXXX
  const tussRegex = /^\d{8}$/;
  
  if (!tussRegex.test(code)) return false;
  
  // Basic range validation - TUSS codes typically start with specific prefixes
  const validPrefixes = [
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', // Medical consultations
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', // Diagnostic procedures
    '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', // Therapeutic procedures
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', // Surgical procedures
    '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', // Other procedures
    '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', // Materials and medications
    '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'  // Taxes and fees
  ];
  
  const prefix = code.substring(0, 2);
  return validPrefixes.includes(prefix);
};

/**
 * Validates CFM specialty codes according to Brazilian medical specialties
 */
const validateCFMSpecialtyCode = (code: string): boolean => {
  // CFM specialty codes are typically 2-3 digit codes
  const cfmRegex = /^\d{2,3}$/;
  
  if (!cfmRegex.test(code)) return false;
  
  // Some common CFM specialty codes
  const validCodes = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
    '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
    '51', '52', '53', '54', '55'
  ];
  
  return validCodes.includes(code);
};

/**
 * Validates CRM number format for Brazilian medical professionals
 */
const validateCRMNumber = (crm: string): boolean => {
  // CRM format: XXXXXX/UF (6 digits + state)
  const crmRegex = /^\d{4,6}\/[A-Z]{2}$/;
  
  if (!crmRegex.test(crm)) return false;
  
  // Validate Brazilian state codes
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  const state = crm.split('/')[1];
  return validStates.includes(state);
};

/**
 * Validates ANVISA protocol number format
 */
const validateANVISAProtocol = (protocol: string): boolean => {
  // ANVISA protocols typically follow format: XXXX.XXXXXX/YYYY-XX
  const anvisaRegex = /^\d{4}\.\d{6}\/\d{4}-\d{2}$/;
  return anvisaRegex.test(protocol);
};

/**
 * Validates Brazilian timezone
 */
const validateBrazilianTimezone = (timezone: string): boolean => {
  const brazilianTimezones = [
    'America/Sao_Paulo',    // UTC-3 (most of Brazil)
    'America/Fortaleza',    // UTC-3 (Northeast)
    'America/Recife',       // UTC-3 (Northeast)
    'America/Bahia',        // UTC-3 (Bahia)
    'America/Manaus',       // UTC-4 (Amazon)
    'America/Cuiaba',       // UTC-4 (Mato Grosso)
    'America/Porto_Acre',   // UTC-5 (Acre)
    'America/Boa_Vista',    // UTC-4 (Roraima)
    'America/Campo_Grande', // UTC-4 (Mato Grosso do Sul)
    'America/Belem',        // UTC-3 (Pará)
    'America/Santarem',     // UTC-3 (West Pará)
    'America/Araguaina',    // UTC-3 (Tocantins)
    'America/Maceio',       // UTC-3 (Alagoas)
    'America/Noronha'       // UTC-2 (Fernando de Noronha)
  ];
  
  return brazilianTimezones.includes(timezone);
};

/**
 * Validates no-show risk score range (0.0-1.0)
 */
const validateNoShowRiskScore = (score: number): boolean => {
  return score >= 0.0 && score <= 1.0 && !isNaN(score) && isFinite(score);
};

/**
 * Validates appointment duration (reasonable healthcare appointment times)
 */
const validateAppointmentDuration = (duration: number): boolean => {
  // Duration in minutes - typical healthcare appointments: 15min to 8 hours
  return duration >= 15 && duration <= 480 && duration % 5 === 0; // 5-minute increments
};

/**
 * Validates Brazilian business hours for appointments
 */
const validateBusinessHours = (dateTime: string): boolean => {
  const date = new Date(dateTime);
  const hour = date.getHours();
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Basic business hours: Monday-Friday 6:00-22:00, Saturday 8:00-18:00
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return hour >= 6 && hour < 22;
  } else if (dayOfWeek === 6) {
    return hour >= 8 && hour < 18;
  }
  
  // Sundays typically no regular appointments (emergency only)
  return false;
};

// =====================================
// APPOINTMENT ENUM SCHEMAS
// =====================================

/**
 * Appointment Status Schema
 */
export const AppointmentStatusSchema = v.picklist([
  'scheduled',            // Agendado
  'confirmed',            // Confirmado
  'in_progress',          // Em andamento
  'completed',            // Concluído
  'cancelled',            // Cancelado
  'no_show',              // Faltou
  'rescheduled',          // Reagendado
  'waiting',              // Aguardando
  'checked_in',           // Check-in feito
  'ready',                // Pronto para atendimento
  'delayed'               // Atrasado
], 'Status do agendamento inválido');

/**
 * Appointment Type Schema
 */
export const AppointmentTypeSchema = v.picklist([
  'in_person',            // Presencial
  'telemedicine',         // Telemedicina
  'hybrid',               // Híbrido
  'home_visit',           // Visita domiciliar
  'emergency',            // Emergência
  'follow_up',            // Retorno
  'consultation',         // Consulta
  'procedure',            // Procedimento
  'surgery',              // Cirurgia
  'exam',                 // Exame
  'vaccination'           // Vacinação
], 'Tipo de agendamento inválido');

/**
 * Priority Level Schema
 */
export const PriorityLevelSchema = v.picklist([
  1, 2, 3, 4, 5
], 'Nível de prioridade deve ser entre 1 (baixa) e 5 (urgente)');

/**
 * CFM Validation Status Schema
 */
export const CFMValidationStatusSchema = v.picklist([
  'pending',              // Pendente
  'validated',            // Validado
  'rejected',             // Rejeitado
  'expired',              // Expirado
  'under_review',         // Em revisão
  'suspended'             // Suspenso
], 'Status de validação CFM inválido');

/**
 * Payment Status Schema
 */
export const PaymentStatusSchema = v.picklist([
  'pending',              // Pendente
  'paid',                 // Pago
  'partially_paid',       // Parcialmente pago
  'overdue',              // Em atraso
  'cancelled',            // Cancelado
  'refunded',             // Reembolsado
  'disputed'              // Contestado
], 'Status de pagamento inválido');

/**
 * Reminder Type Schema for multi-channel communication
 */
export const ReminderTypeSchema = v.picklist([
  'whatsapp',             // WhatsApp
  'sms',                  // SMS
  'email',                // Email
  'phone_call',           // Ligação telefônica
  'push_notification',    // Notificação push
  'in_app',               // No aplicativo
  'physical_letter'       // Carta física
], 'Tipo de lembrete inválido');

/**
 * Insurance Type Schema (Brazilian health insurance)
 */
export const InsuranceTypeSchema = v.picklist([
  'sus',                  // Sistema Único de Saúde
  'private',              // Convênio privado
  'corporate',            // Empresarial
  'individual',           // Individual
  'family',               // Familiar
  'partial',              // Cobertura parcial
  'none'                  // Particular
], 'Tipo de convênio inválido');

// =====================================
// BASIC VALIDATION SCHEMAS
// =====================================

/**
 * TUSS Code Validation Schema
 */
export const TUSSCodeSchema = v.pipe(
  v.string('Código TUSS deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Código TUSS é obrigatório para procedimentos'),
  v.length(8, 'Código TUSS deve ter exatamente 8 dígitos'),
  v.regex(/^\d{8}$/, 'Código TUSS deve conter apenas dígitos'),
  v.check(validateTUSSCode, 'Código TUSS inválido ou não reconhecido'),
  v.transform((value) => value as TUSSCode)
);

/**
 * CFM Specialty Code Validation Schema
 */
export const CFMSpecialtyCodeSchema = v.pipe(
  v.string('Código de especialidade CFM deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Código de especialidade CFM é obrigatório'),
  v.regex(/^\d{1,3}$/, 'Código de especialidade CFM deve ter 1-3 dígitos'),
  v.check(validateCFMSpecialtyCode, 'Código de especialidade CFM inválido'),
  v.transform((value) => value as CFMSpecialtyCode)
);

/**
 * CRM Number Validation Schema
 */
export const CRMNumberSchema = v.pipe(
  v.string('Número do CRM deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Número do CRM é obrigatório'),
  v.regex(/^\d{4,6}\/[A-Z]{2}$/, 'CRM deve estar no formato XXXXXX/UF'),
  v.check(validateCRMNumber, 'Número do CRM inválido'),
  v.transform((value) => value.toUpperCase() as CRMNumber)
);

/**
 * ANVISA Protocol Validation Schema
 */
export const ANVISAProtocolSchema = v.pipe(
  v.string('Protocolo ANVISA deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Protocolo ANVISA é obrigatório para telemedicina'),
  v.regex(/^\d{4}\.\d{6}\/\d{4}-\d{2}$/, 'Protocolo ANVISA deve estar no formato XXXX.XXXXXX/YYYY-XX'),
  v.check(validateANVISAProtocol, 'Protocolo ANVISA inválido'),
  v.transform((value) => value as ANVISAProtocol)
);

/**
 * Brazilian Timezone Validation Schema
 */
export const BrazilianTimezoneSchema = v.pipe(
  v.string('Timezone deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Timezone é obrigatório'),
  v.check(validateBrazilianTimezone, 'Timezone brasileiro inválido'),
  v.transform((value) => value as string)
);

/**
 * No-Show Risk Score Validation Schema (0.0-1.0)
 */
export const NoShowRiskScoreSchema = v.pipe(
  v.number('Score de risco deve ser um número'),
  v.minValue(0.0, 'Score de risco deve ser maior ou igual a 0.0'),
  v.maxValue(1.0, 'Score de risco deve ser menor ou igual a 1.0'),
  v.check(validateNoShowRiskScore, 'Score de risco de no-show inválido'),
  v.transform((value) => value as NoShowRiskScore)
);

/**
 * Appointment Duration Validation Schema (in minutes)
 */
export const AppointmentDurationSchema = v.pipe(
  v.number('Duração deve ser um número'),
  v.minValue(15, 'Duração mínima de 15 minutos'),
  v.maxValue(480, 'Duração máxima de 8 horas'),
  v.check(validateAppointmentDuration, 'Duração deve ser múltiplo de 5 minutos'),
  v.transform((value) => Math.round(value))
);

/**
 * Business Hours DateTime Validation Schema
 */
export const BusinessHoursDateTimeSchema = v.pipe(
  v.string('Data/hora deve ser uma string válida'),
  v.trim(),
  v.nonEmpty('Data/hora é obrigatória'),
  v.isoDateTime('Data/hora deve estar em formato ISO 8601'),
  v.check(validateBusinessHours, 'Agendamento fora do horário comercial'),
  v.transform((value) => new Date(value).toISOString())
);

/**
 * Brazilian Currency Validation Schema (Real - BRL)
 */
export const BrazilianCurrencySchema = v.pipe(
  v.number('Valor deve ser um número'),
  v.minValue(0, 'Valor deve ser maior ou igual a zero'),
  v.maxValue(999999.99, 'Valor máximo excedido'),
  v.transform((value) => Math.round(value * 100) / 100) // Round to 2 decimal places
);

// =====================================
// COMPLEX OBJECT SCHEMAS
// =====================================

/**
 * No-Show Risk Factors Schema
 */
export const NoShowRiskFactorsSchema = v.object({
  patient_history_score: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  appointment_time_factor: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  weather_impact: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1))),
  previous_cancellations: v.pipe(v.number(), v.minValue(0)),
  communication_responsiveness: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  distance_to_clinic: v.optional(v.pipe(v.number(), v.minValue(0))),
  payment_history: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1))),
  day_of_week_pattern: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1))),
  time_of_day_pattern: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1))),
  seasonal_factors: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1)))
});

/**
 * No-Show Prevention Actions Schema
 */
export const NoShowPreventionActionsSchema = v.array(v.picklist([
  'early_reminder',           // Lembrete antecipado
  'multiple_reminders',       // Múltiplos lembretes
  'personal_call',            // Ligação pessoal
  'whatsapp_confirmation',    // Confirmação por WhatsApp
  'incentive_offer',          // Oferta de incentivo
  'flexible_rescheduling',    // Reagendamento flexível
  'weather_alert',            // Alerta meteorológico
  'transportation_assistance', // Assistência de transporte
  'appointment_value_reminder', // Lembrete do valor da consulta
  'health_importance_message', // Mensagem sobre importância da saúde
  'family_notification',      // Notificação familiar
  'loyalty_program_points'    // Pontos programa fidelidade
], 'Ação de prevenção de no-show inválida'));

/**
 * Reminder Configuration Schema
 */
export const ReminderConfigurationSchema = v.object({
  reminder_type: ReminderTypeSchema,
  schedule_before_minutes: v.pipe(v.number(), v.minValue(5), v.maxValue(10080)), // 5 min to 1 week
  message_template: v.pipe(v.string(), v.minLength(10), v.maxLength(1000)),
  language: v.pipe(v.string(), v.picklist(['pt-BR', 'en-US', 'es-ES'], 'Idioma não suportado')),
  requires_confirmation: v.boolean(),
  max_attempts: v.pipe(v.number(), v.minValue(1), v.maxValue(5)),
  priority: PriorityLevelSchema
});

/**
 * Insurance Information Schema
 */
export const InsuranceInformationSchema = v.object({
  insurance_type: InsuranceTypeSchema,
  provider_name: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(100))),
  policy_number: v.optional(v.pipe(v.string(), v.minLength(5), v.maxLength(50))),
  ans_operator_code: v.optional(v.pipe(v.string(), v.regex(/^\d{6}$/, 'Código ANS deve ter 6 dígitos'))),
  coverage_percentage: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100))),
  copay_amount: v.optional(BrazilianCurrencySchema),
  prior_authorization_required: v.boolean(),
  prior_authorization_number: v.optional(v.string()),
  valid_until: v.optional(v.pipe(v.string(), v.isoDateTime())),
  emergency_coverage: v.boolean()
});

/**
 * Clinical Protocol Schema
 */
export const ClinicalProtocolSchema = v.object({
  protocol_name: v.pipe(v.string(), v.minLength(5), v.maxLength(200)),
  protocol_version: v.pipe(v.string(), v.regex(/^\d+\.\d+(\.\d+)?$/, 'Versão deve seguir formato semântico')),
  clinical_guidelines: v.array(v.string()),
  required_procedures: v.array(TUSSCodeSchema),
  estimated_duration: AppointmentDurationSchema,
  complexity_level: v.pipe(v.number(), v.minValue(1), v.maxValue(5)),
  anvisa_compliance_required: v.boolean(),
  cfm_specialty_required: v.optional(CFMSpecialtyCodeSchema)
});

// =====================================
// MAIN APPOINTMENT SCHEMAS
// =====================================

/**
 * Appointment Creation Schema
 */
export const AppointmentCreationSchema = v.object({
  // Basic appointment info
  clinic_id: v.pipe(v.string(), v.uuid('ID da clínica deve ser UUID válido')),
  patient_id: v.pipe(v.string(), v.uuid('ID do paciente deve ser UUID válido')),
  professional_id: v.pipe(v.string(), v.uuid('ID do profissional deve ser UUID válido')),
  service_type_id: v.pipe(v.string(), v.uuid('ID do tipo de serviço deve ser UUID válido')),
  
  // Scheduling
  appointment_type: AppointmentTypeSchema,
  start_time: v.pipe(v.string(), v.isoDateTime('Horário de início deve estar em formato ISO')),
  end_time: v.pipe(v.string(), v.isoDateTime('Horário de término deve estar em formato ISO')),
  timezone: v.optional(BrazilianTimezoneSchema),
  duration: v.optional(AppointmentDurationSchema),
  priority: v.optional(PriorityLevelSchema),
  
  // Brazilian healthcare compliance
  tuss_code: v.optional(TUSSCodeSchema),
  tuss_procedure_name: v.optional(v.pipe(v.string(), v.minLength(5), v.maxLength(200))),
  cfm_specialty_code: v.optional(CFMSpecialtyCodeSchema),
  cfm_professional_crm: v.optional(CRMNumberSchema),
  anvisa_protocol_number: v.optional(ANVISAProtocolSchema),
  
  // Clinical information
  chief_complaint: v.optional(v.pipe(v.string(), v.minLength(10), v.maxLength(500))),
  clinical_protocol: v.optional(ClinicalProtocolSchema),
  
  // Insurance and billing
  insurance_information: v.optional(InsuranceInformationSchema),
  estimated_cost: v.optional(BrazilianCurrencySchema),
  
  // Location and logistics
  appointment_location: v.optional(v.pipe(v.string(), v.minLength(5), v.maxLength(200))),
  room_id: v.optional(v.string()),
  
  // Reminders and communication
  reminder_configurations: v.optional(v.array(ReminderConfigurationSchema)),
  real_time_update_enabled: v.optional(v.boolean()),
  
  // Notes
  notes: v.optional(v.pipe(v.string(), v.maxLength(2000))),
  internal_notes: v.optional(v.pipe(v.string(), v.maxLength(2000)))
});

/**
 * Appointment Update Schema
 */
export const AppointmentUpdateSchema = v.object({
  appointment_id: v.pipe(v.string(), v.uuid('ID do agendamento deve ser UUID válido')),
  
  // Updatable fields
  status: v.optional(AppointmentStatusSchema),
  start_time: v.optional(v.pipe(v.string(), v.isoDateTime())),
  end_time: v.optional(v.pipe(v.string(), v.isoDateTime())),
  appointment_type: v.optional(AppointmentTypeSchema),
  priority: v.optional(PriorityLevelSchema),
  
  // Clinical updates
  chief_complaint: v.optional(v.string()),
  clinical_notes: v.optional(v.string()),
  follow_up_required: v.optional(v.boolean()),
  follow_up_date: v.optional(v.pipe(v.string(), v.isoDateTime())),
  follow_up_instructions: v.optional(v.string()),
  
  // AI predictions
  no_show_risk_score: v.optional(NoShowRiskScoreSchema),
  no_show_risk_factors: v.optional(NoShowRiskFactorsSchema),
  no_show_prevention_actions: v.optional(NoShowPreventionActionsSchema),
  
  // Confirmation and reminders
  patient_confirmed: v.optional(v.boolean()),
  reminder_configurations: v.optional(v.array(ReminderConfigurationSchema)),
  
  // Times tracking
  actual_start_time: v.optional(v.pipe(v.string(), v.isoDateTime())),
  actual_end_time: v.optional(v.pipe(v.string(), v.isoDateTime())),
  check_in_time: v.optional(v.pipe(v.string(), v.isoDateTime())),
  check_out_time: v.optional(v.pipe(v.string(), v.isoDateTime())),
  waiting_time: v.optional(v.pipe(v.number(), v.minValue(0))),
  
  // Financial
  actual_cost: v.optional(BrazilianCurrencySchema),
  payment_status: v.optional(PaymentStatusSchema),
  copay_amount: v.optional(BrazilianCurrencySchema),
  
  // Quality feedback
  patient_satisfaction_score: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(5))),
  patient_feedback: v.optional(v.string()),
  service_quality_score: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(5))),
  
  // Audit context
  updated_by: v.optional(v.pipe(v.string(), v.uuid())),
  update_reason: v.optional(v.pipe(v.string(), v.minLength(5), v.maxLength(500)))
});

/**
 * Appointment Cancellation Schema
 */
export const AppointmentCancellationSchema = v.object({
  appointment_id: v.pipe(v.string(), v.uuid('ID do agendamento deve ser UUID válido')),
  cancellation_reason: v.pipe(v.string(), v.minLength(10), v.maxLength(500)),
  cancelled_by: v.pipe(v.string(), v.uuid('ID do cancelador deve ser UUID válido')),
  cancellation_fee: v.optional(BrazilianCurrencySchema),
  reschedule_requested: v.optional(v.boolean()),
  refund_amount: v.optional(BrazilianCurrencySchema),
  notification_sent: v.optional(v.boolean()),
  
  // Context
  cancellation_time: v.pipe(v.string(), v.isoDateTime()),
  advanced_notice_hours: v.optional(v.pipe(v.number(), v.minValue(0))),
  
  // Communication
  patient_notified: v.optional(v.boolean()),
  professional_notified: v.optional(v.boolean()),
  clinic_notified: v.optional(v.boolean())
});

/**
 * Appointment Rescheduling Schema
 */
export const AppointmentReschedulingSchema = v.object({
  appointment_id: v.pipe(v.string(), v.uuid('ID do agendamento deve ser UUID válido')),
  new_start_time: v.pipe(v.string(), v.isoDateTime('Nova data/hora deve estar em formato ISO')),
  new_end_time: v.pipe(v.string(), v.isoDateTime('Nova data/hora de término deve estar em formato ISO')),
  new_professional_id: v.optional(v.pipe(v.string(), v.uuid())),
  
  reschedule_reason: v.pipe(v.string(), v.minLength(10), v.maxLength(500)),
  rescheduled_by: v.pipe(v.string(), v.uuid('ID do reagendador deve ser UUID válido')),
  reschedule_fee: v.optional(BrazilianCurrencySchema),
  
  // Validation
  patient_consent: v.pipe(v.boolean(), v.literal(true, 'Consentimento do paciente é obrigatório')),
  professional_availability_confirmed: v.pipe(v.boolean(), v.literal(true, 'Disponibilidade do profissional deve ser confirmada')),
  
  // Communication
  notifications_sent: v.optional(v.boolean()),
  confirmation_required: v.optional(v.boolean())
});

/**
 * Appointment Query Schema
 */
export const AppointmentQuerySchema = v.object({
  clinic_id: v.optional(v.pipe(v.string(), v.uuid())),
  patient_id: v.optional(v.pipe(v.string(), v.uuid())),
  professional_id: v.optional(v.pipe(v.string(), v.uuid())),
  status: v.optional(AppointmentStatusSchema),
  appointment_type: v.optional(AppointmentTypeSchema),
  
  // Date range
  start_date: v.optional(v.pipe(v.string(), v.isoDateTime())),
  end_date: v.optional(v.pipe(v.string(), v.isoDateTime())),
  
  // Brazilian healthcare filters
  tuss_code: v.optional(TUSSCodeSchema),
  cfm_specialty_code: v.optional(CFMSpecialtyCodeSchema),
  insurance_type: v.optional(InsuranceTypeSchema),
  
  // AI filters
  no_show_risk_above: v.optional(NoShowRiskScoreSchema),
  no_show_risk_below: v.optional(NoShowRiskScoreSchema),
  
  // Pagination
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(1000))),
  offset: v.optional(v.pipe(v.number(), v.minValue(0))),
  
  // Sorting
  sort_by: v.optional(v.picklist(['start_time', 'created_at', 'priority', 'no_show_risk_score'], 'Campo de ordenação inválido')),
  sort_order: v.optional(v.picklist(['asc', 'desc'], 'Ordem de classificação inválida'))
});

// =====================================
// VALIDATION HELPER FUNCTIONS
// =====================================

/**
 * Validates appointment time conflicts
 */
export const validateTimeConflict = (
  startTime: string,
  endTime: string,
  professionalId: string,
  existingAppointments: Array<{start_time: string; end_time: string; professional_id: string}>
): boolean => {
  const newStart = new Date(startTime);
  const newEnd = new Date(endTime);
  
  // Check if end time is after start time
  if (newEnd <= newStart) return false;
  
  // Check for conflicts with existing appointments
  for (const appointment of existingAppointments) {
    if (appointment.professional_id === professionalId) {
      const existingStart = new Date(appointment.start_time);
      const existingEnd = new Date(appointment.end_time);
      
      // Check for time overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        return false; // Conflict found
      }
    }
  }
  
  return true; // No conflict
};

/**
 * Calculates no-show risk score based on multiple factors
 */
export const calculateNoShowRiskScore = (factors: {
  patient_history_score: number;
  appointment_time_factor: number;
  weather_impact?: number;
  previous_cancellations: number;
  communication_responsiveness: number;
}): NoShowRiskScore => {
  const weights = {
    patient_history: 0.35,
    appointment_time: 0.20,
    weather: 0.10,
    cancellations: 0.20,
    communication: 0.15
  };
  
  let score = 0;
  score += factors.patient_history_score * weights.patient_history;
  score += factors.appointment_time_factor * weights.appointment_time;
  score += (factors.weather_impact || 0) * weights.weather;
  score += Math.min(factors.previous_cancellations / 5, 1) * weights.cancellations;
  score += (1 - factors.communication_responsiveness) * weights.communication;
  
  // Ensure score is within 0.0-1.0 range
  const finalScore = Math.max(0, Math.min(1, score));
  return finalScore as NoShowRiskScore;
};

/**
 * Validates Brazilian healthcare appointment compliance
 */
export const validateAppointmentHealthcareCompliance = (appointment: {
  appointment_type: string;
  tuss_code?: string;
  cfm_professional_crm?: string;
  anvisa_protocol_number?: string;
}): boolean => {
  // Telemedicine appointments require ANVISA protocol
  if (appointment.appointment_type === 'telemedicine') {
    if (!appointment.anvisa_protocol_number) return false;
  }
  
  // All medical appointments should have TUSS code
  if (['consultation', 'procedure', 'surgery', 'exam'].includes(appointment.appointment_type)) {
    if (!appointment.tuss_code) return false;
  }
  
  // Professional CRM is required for medical appointments
  if (!appointment.cfm_professional_crm) return false;
  
  return true;
};

/**
 * Generates optimal reminder schedule based on appointment type and patient preferences
 */
export const generateReminderSchedule = (
  appointmentType: string,
  _patientPreferences?: { preferred_contact_method: string; reminder_frequency: string }
): Array<{ type: string; minutes_before: number }> => {
  const schedules: Record<string, Array<{ type: string; minutes_before: number }>> = {
    telemedicine: [
      { type: 'whatsapp', minutes_before: 1440 }, // 24 hours
      { type: 'whatsapp', minutes_before: 120 },  // 2 hours
      { type: 'whatsapp', minutes_before: 15 }    // 15 minutes
    ],
    in_person: [
      { type: 'whatsapp', minutes_before: 1440 }, // 24 hours
      { type: 'sms', minutes_before: 240 }        // 4 hours
    ],
    surgery: [
      { type: 'phone_call', minutes_before: 2880 }, // 48 hours
      { type: 'whatsapp', minutes_before: 1440 },   // 24 hours
      { type: 'phone_call', minutes_before: 720 }   // 12 hours
    ]
  };
  
  return schedules[appointmentType] || schedules.in_person;
};