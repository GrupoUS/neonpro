/**
 * Treatment & Procedure Validation Schemas
 * Zod validation schemas for HL7 FHIR R4 compliant treatment documentation
 * Includes LGPD consent validation for Brazilian healthcare compliance
 * 
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */

import { z } from 'zod';
import { 
  TreatmentPlanStatus, 
  TreatmentPlanIntent, 
  ProcedureStatus, 
  ClinicalNoteStatus, 
  ConfidentialityLevel 
} from '@/lib/types/treatment';

// ===============================================
// BASE VALIDATION SCHEMAS
// ===============================================

const uuidSchema = z.string().uuid('ID deve ser um UUID válido');

const fhirIdSchema = z.string()
  .min(1, 'FHIR ID é obrigatório')
  .max(255, 'FHIR ID deve ter no máximo 255 caracteres')
  .regex(/^[a-zA-Z0-9\-._]+$/, 'FHIR ID deve conter apenas letras, números, hífens, pontos e sublinhados');

const isoDateTimeSchema = z.string()
  .datetime('Data deve estar no formato ISO 8601')
  .optional()
  .or(z.literal(''));

const nonEmptyStringSchema = z.string()
  .min(1, 'Campo é obrigatório')
  .trim();

const optionalStringSchema = z.string()
  .trim()
  .optional()
  .or(z.literal(''));

// LGPD consent validation
const lgpdConsentSchema = z.object({
  data_consent_given: z.boolean({
    required_error: 'Consentimento de dados é obrigatório',
  }),
  data_consent_date: z.string()
    .datetime('Data de consentimento deve estar no formato ISO 8601')
    .optional(),
  data_retention_until: z.string()
    .datetime('Data de retenção deve estar no formato ISO 8601')
    .optional(),
}).refine((data) => {
  if (data.data_consent_given && !data.data_consent_date) {
    return false;
  }
  return true;
}, {
  message: 'Data de consentimento é obrigatória quando consentimento é dado',
  path: ['data_consent_date'],
});

// ===============================================
// TREATMENT PLAN VALIDATION SCHEMAS
// ===============================================

const treatmentPlanStatusSchema = z.enum([
  'draft', 'active', 'on-hold', 'revoked', 'completed', 'entered-in-error', 'unknown'
] as const, {
  errorMap: () => ({ message: 'Status do plano de tratamento inválido' }),
});

const treatmentPlanIntentSchema = z.enum([
  'proposal', 'plan', 'order', 'option', 'directive'
] as const, {
  errorMap: () => ({ message: 'Intenção do plano de tratamento inválida' }),
});

export const treatmentPlanActivitySchema = z.object({
  id: optionalStringSchema,
  reference: z.string().optional(),
  detail: z.object({
    category: z.any().optional(), // FHIRCodeableConcept
    code: z.any().optional(), // FHIRCodeableConcept
    status: z.enum([
      'not-started', 'scheduled', 'in-progress', 'on-hold', 
      'completed', 'cancelled', 'stopped', 'unknown'
    ]).optional(),
    statusReason: z.any().optional(), // FHIRCodeableConcept
    doNotPerform: z.boolean().optional(),
    scheduled: z.object({
      timing: optionalStringSchema,
      period: z.object({
        start: isoDateTimeSchema,
        end: isoDateTimeSchema,
      }).optional(),
      string: optionalStringSchema,
    }).optional(),
    location: z.string().optional(),
    performer: z.array(z.string()).optional(),
    product: z.any().optional(), // FHIRCodeableConcept | FHIRReference
    dailyAmount: z.object({
      value: z.number().optional(),
      unit: optionalStringSchema,
      system: optionalStringSchema,
      code: optionalStringSchema,
    }).optional(),
    quantity: z.object({
      value: z.number().optional(),
      unit: optionalStringSchema,
      system: optionalStringSchema,
      code: optionalStringSchema,
    }).optional(),
    description: optionalStringSchema,
  }).optional(),
});

export const treatmentPlanSchema = z.object({
  id: uuidSchema.optional(),
  patient_id: uuidSchema,
  provider_id: uuidSchema,
  
  // FHIR CarePlan Core Fields
  fhir_id: fhirIdSchema.optional(),
  status: treatmentPlanStatusSchema,
  intent: treatmentPlanIntentSchema,
  category: z.array(z.any()).default([]), // FHIRCodeableConcept[]
  title: nonEmptyStringSchema.max(255, 'Título deve ter no máximo 255 caracteres'),
  description: z.string().max(2000, 'Descrição deve ter no máximo 2000 caracteres').optional(),
  
  // Clinical Context
  subject_reference: nonEmptyStringSchema,
  encounter_reference: optionalStringSchema,
  period_start: isoDateTimeSchema,
  period_end: isoDateTimeSchema,
  
  // Care Team & Goals
  care_team: z.array(z.any()).default([]), // FHIRReference[]
  goals: z.array(z.any()).default([]), // FHIRReference[]
  activities: z.array(treatmentPlanActivitySchema).default([]),
  
  // Supporting Information
  supporting_info: z.array(z.any()).default([]), // FHIRReference[]
  addresses: z.array(z.any()).default([]), // FHIRReference[]
  
  // FHIR Metadata
  fhir_meta: z.object({}).default({}),
  fhir_text: z.object({}).default({}),
  
  // LGPD Compliance
  ...lgpdConsentSchema.shape,
  
  // Audit & Versioning
  version: z.number().int().min(1).default(1),
  replaces: uuidSchema.optional(),
}).refine((data) => {
  if (data.period_start && data.period_end) {
    return new Date(data.period_start) <= new Date(data.period_end);
  }
  return true;
}, {
  message: 'Data de início deve ser anterior à data de fim',
  path: ['period_end'],
});

// Form data schema for treatment plan creation/editing
export const treatmentPlanFormSchema = z.object({
  title: nonEmptyStringSchema.max(255, 'Título deve ter no máximo 255 caracteres'),
  description: z.string().max(2000, 'Descrição deve ter no máximo 2000 caracteres').optional(),
  patient_id: uuidSchema,
  status: treatmentPlanStatusSchema,
  intent: treatmentPlanIntentSchema,
  category: z.array(z.string()).default([]),
  period_start: isoDateTimeSchema,
  period_end: isoDateTimeSchema,
  goals: z.array(z.string()).default([]),
  addresses: z.array(z.string()).default([]),
  data_consent_given: z.boolean({
    required_error: 'Consentimento de dados é obrigatório',
  }),
}).refine((data) => {
  if (data.period_start && data.period_end) {
    return new Date(data.period_start) <= new Date(data.period_end);
  }
  return true;
}, {
  message: 'Data de início deve ser anterior à data de fim',
  path: ['period_end'],
});

// ===============================================
// PROCEDURE VALIDATION SCHEMAS
// ===============================================

const procedureStatusSchema = z.enum([
  'preparation', 'in-progress', 'not-done', 'on-hold', 
  'stopped', 'completed', 'entered-in-error', 'unknown'
] as const, {
  errorMap: () => ({ message: 'Status do procedimento inválido' }),
});

export const procedurePerformerSchema = z.object({
  function: z.any().optional(), // FHIRCodeableConcept
  actor: z.string().min(1, 'Referência do ator é obrigatória'),
  onBehalfOf: z.string().optional(),
});

export const procedureSchema = z.object({
  id: uuidSchema.optional(),
  patient_id: uuidSchema,
  provider_id: uuidSchema,
  treatment_plan_id: uuidSchema.optional(),
  
  // FHIR Procedure Core Fields
  fhir_id: fhirIdSchema.optional(),
  status: procedureStatusSchema,
  status_reason: z.any().optional(), // FHIRCodeableConcept
  
  // Procedure Classification
  category: z.any().optional(), // FHIRCodeableConcept
  code: z.any({ required_error: 'Código do procedimento é obrigatório' }), // FHIRCodeableConcept
  
  // Clinical Context
  subject_reference: nonEmptyStringSchema,
  encounter_reference: optionalStringSchema,
  performed_datetime: isoDateTimeSchema,
  performed_period_start: isoDateTimeSchema,
  performed_period_end: isoDateTimeSchema,
  
  // Procedure Details
  recorder_reference: optionalStringSchema,
  asserter_reference: optionalStringSchema,
  performers: z.array(procedurePerformerSchema).default([]),
  location_reference: optionalStringSchema,
  reason_code: z.array(z.any()).default([]), // FHIRCodeableConcept[]
  reason_reference: z.array(z.any()).default([]), // FHIRReference[]
  body_site: z.array(z.any()).default([]), // FHIRCodeableConcept[]
  outcome: z.any().optional(), // FHIRCodeableConcept
  report: z.array(z.any()).default([]), // FHIRReference[]
  complications: z.array(z.any()).default([]), // FHIRCodeableConcept[]
  follow_up: z.array(z.any()).default([]), // FHIRCodeableConcept[]
  
  // Supporting Documentation
  notes: z.string().max(5000, 'Observações devem ter no máximo 5000 caracteres').optional(),
  used_reference: z.array(z.any()).default([]), // FHIRReference[]
  used_code: z.array(z.any()).default([]), // FHIRCodeableConcept[]
  
  // FHIR Metadata
  fhir_meta: z.object({}).default({}),
  fhir_text: z.object({}).default({}),
  
  // LGPD Compliance
  ...lgpdConsentSchema.shape,
  
  // Audit & Versioning
  version: z.number().int().min(1).default(1),
}).refine((data) => {
  if (data.performed_period_start && data.performed_period_end) {
    return new Date(data.performed_period_start) <= new Date(data.performed_period_end);
  }
  return true;
}, {
  message: 'Data de início deve ser anterior à data de fim',
  path: ['performed_period_end'],
});

// Form data schema for procedure creation/editing
export const procedureFormSchema = z.object({
  code: nonEmptyStringSchema.max(50, 'Código deve ter no máximo 50 caracteres'),
  code_display: nonEmptyStringSchema.max(255, 'Nome do procedimento deve ter no máximo 255 caracteres'),
  patient_id: uuidSchema,
  treatment_plan_id: uuidSchema.optional(),
  status: procedureStatusSchema,
  category: z.string().max(50, 'Categoria deve ter no máximo 50 caracteres').optional(),
  performed_datetime: isoDateTimeSchema,
  performed_period_start: isoDateTimeSchema,
  performed_period_end: isoDateTimeSchema,
  body_site: z.array(z.string()).default([]),
  reason_code: z.array(z.string()).default([]),
  notes: z.string().max(5000, 'Observações devem ter no máximo 5000 caracteres').optional(),
  outcome: z.string().max(255, 'Resultado deve ter no máximo 255 caracteres').optional(),
  data_consent_given: z.boolean({
    required_error: 'Consentimento de dados é obrigatório',
  }),
}).refine((data) => {
  if (data.performed_period_start && data.performed_period_end) {
    return new Date(data.performed_period_start) <= new Date(data.performed_period_end);
  }
  return true;
}, {
  message: 'Data de início deve ser anterior à data de fim',
  path: ['performed_period_end'],
});

// ===============================================
// CLINICAL NOTES VALIDATION SCHEMAS
// ===============================================

const clinicalNoteStatusSchema = z.enum([
  'current', 'superseded', 'entered-in-error'
] as const, {
  errorMap: () => ({ message: 'Status da nota clínica inválido' }),
});

const confidentialityLevelSchema = z.enum([
  'U', 'L', 'M', 'N', 'R', 'V'
] as const, {
  errorMap: () => ({ message: 'Nível de confidencialidade inválido' }),
});

export const clinicalNoteRelatesToSchema = z.object({
  code: z.enum(['replaces', 'transforms', 'signs', 'appends']),
  target: z.string().min(1, 'Referência do alvo é obrigatória'),
});

export const clinicalNoteSchema = z.object({
  id: uuidSchema.optional(),
  patient_id: uuidSchema,
  provider_id: uuidSchema,
  treatment_plan_id: uuidSchema.optional(),
  procedure_id: uuidSchema.optional(),
  
  // FHIR DocumentReference/Observation Fields
  fhir_id: fhirIdSchema.optional(),
  status: clinicalNoteStatusSchema,
  
  // Note Classification
  category: z.any().optional(), // FHIRCodeableConcept
  type: z.any({ required_error: 'Tipo de nota é obrigatório' }), // FHIRCodeableConcept
  subject_reference: nonEmptyStringSchema,
  encounter_reference: optionalStringSchema,
  
  // Note Content
  title: nonEmptyStringSchema.max(255, 'Título deve ter no máximo 255 caracteres'),
  content: nonEmptyStringSchema.max(10000, 'Conteúdo deve ter no máximo 10000 caracteres'),
  content_type: z.string().default('text/plain'),
  
  // Clinical Context
  authored_time: z.string().datetime('Data de autoria deve estar no formato ISO 8601'),
  author_reference: nonEmptyStringSchema,
  authenticator_reference: optionalStringSchema,
  
  // Related Information
  relates_to: z.array(clinicalNoteRelatesToSchema).default([]),
  context_reference: optionalStringSchema,
  
  // Security & Access
  security_label: z.array(z.any()).default([]), // FHIRCodeableConcept[]
  confidentiality: confidentialityLevelSchema,
  
  // FHIR Metadata
  fhir_meta: z.object({}).default({}),
  fhir_text: z.object({}).default({}),
  
  // LGPD Compliance
  ...lgpdConsentSchema.shape,
  
  // Audit & Versioning
  version: z.number().int().min(1).default(1),
  replaces: uuidSchema.optional(),
});

// Form data schema for clinical note creation/editing
export const clinicalNoteFormSchema = z.object({
  title: nonEmptyStringSchema.max(255, 'Título deve ter no máximo 255 caracteres'),
  content: nonEmptyStringSchema.max(10000, 'Conteúdo deve ter no máximo 10000 caracteres'),
  content_type: z.string().default('text/plain'),
  patient_id: uuidSchema,
  treatment_plan_id: uuidSchema.optional(),
  procedure_id: uuidSchema.optional(),
  type: nonEmptyStringSchema.max(50, 'Tipo deve ter no máximo 50 caracteres'),
  type_display: nonEmptyStringSchema.max(255, 'Nome do tipo deve ter no máximo 255 caracteres'),
  category: z.string().max(50, 'Categoria deve ter no máximo 50 caracteres').optional(),
  confidentiality: confidentialityLevelSchema,
  data_consent_given: z.boolean({
    required_error: 'Consentimento de dados é obrigatório',
  }),
});

// ===============================================
// SEARCH AND FILTER VALIDATION SCHEMAS
// ===============================================

export const treatmentPlanSearchSchema = z.object({
  patient_id: uuidSchema.optional(),
  provider_id: uuidSchema.optional(),
  status: z.array(treatmentPlanStatusSchema).optional(),
  intent: z.array(treatmentPlanIntentSchema).optional(),
  period_start: isoDateTimeSchema,
  period_end: isoDateTimeSchema,
  search_text: z.string().max(255, 'Texto de busca deve ter no máximo 255 caracteres').optional(),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(10),
});

export const procedureSearchSchema = z.object({
  patient_id: uuidSchema.optional(),
  provider_id: uuidSchema.optional(),
  treatment_plan_id: uuidSchema.optional(),
  status: z.array(procedureStatusSchema).optional(),
  procedure_code: z.array(z.string()).optional(),
  performed_start: isoDateTimeSchema,
  performed_end: isoDateTimeSchema,
  search_text: z.string().max(255, 'Texto de busca deve ter no máximo 255 caracteres').optional(),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(10),
});

export const clinicalNoteSearchSchema = z.object({
  patient_id: uuidSchema.optional(),
  provider_id: uuidSchema.optional(),
  treatment_plan_id: uuidSchema.optional(),
  procedure_id: uuidSchema.optional(),
  status: z.array(clinicalNoteStatusSchema).optional(),
  note_type: z.array(z.string()).optional(),
  authored_start: isoDateTimeSchema,
  authored_end: isoDateTimeSchema,
  confidentiality: z.array(confidentialityLevelSchema).optional(),
  search_text: z.string().max(255, 'Texto de busca deve ter no máximo 255 caracteres').optional(),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(10),
});

// ===============================================
// EXPORT SCHEMAS
// ===============================================

export type TreatmentPlanFormData = z.infer<typeof treatmentPlanFormSchema>;
export type ProcedureFormData = z.infer<typeof procedureFormSchema>;
export type ClinicalNoteFormData = z.infer<typeof clinicalNoteFormSchema>;
export type TreatmentPlanSearchData = z.infer<typeof treatmentPlanSearchSchema>;
export type ProcedureSearchData = z.infer<typeof procedureSearchSchema>;
export type ClinicalNoteSearchData = z.infer<typeof clinicalNoteSearchSchema>;
