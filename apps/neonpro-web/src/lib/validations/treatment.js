"use strict";
/**
 * Treatment & Procedure Validation Schemas
 * Zod validation schemas for HL7 FHIR R4 compliant treatment documentation
 * Includes LGPD consent validation for Brazilian healthcare compliance
 *
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicalNoteSearchSchema =
  exports.procedureSearchSchema =
  exports.treatmentPlanSearchSchema =
  exports.clinicalNoteFormSchema =
  exports.clinicalNoteSchema =
  exports.clinicalNoteRelatesToSchema =
  exports.procedureFormSchema =
  exports.procedureSchema =
  exports.procedurePerformerSchema =
  exports.treatmentPlanFormSchema =
  exports.treatmentPlanSchema =
  exports.treatmentPlanActivitySchema =
    void 0;
var zod_1 = require("zod");
// ===============================================
// BASE VALIDATION SCHEMAS
// ===============================================
var uuidSchema = zod_1.z.string().uuid("ID deve ser um UUID válido");
var fhirIdSchema = zod_1.z
  .string()
  .min(1, "FHIR ID é obrigatório")
  .max(255, "FHIR ID deve ter no máximo 255 caracteres")
  .regex(
    /^[a-zA-Z0-9\-._]+$/,
    "FHIR ID deve conter apenas letras, números, hífens, pontos e sublinhados",
  );
var isoDateTimeSchema = zod_1.z
  .string()
  .datetime("Data deve estar no formato ISO 8601")
  .optional()
  .or(zod_1.z.literal(""));
var nonEmptyStringSchema = zod_1.z.string().min(1, "Campo é obrigatório").trim();
var optionalStringSchema = zod_1.z.string().trim().optional().or(zod_1.z.literal(""));
// LGPD consent validation
var lgpdConsentSchema = zod_1.z
  .object({
    data_consent_given: zod_1.z.boolean({
      required_error: "Consentimento de dados é obrigatório",
    }),
    data_consent_date: zod_1.z
      .string()
      .datetime("Data de consentimento deve estar no formato ISO 8601")
      .optional(),
    data_retention_until: zod_1.z
      .string()
      .datetime("Data de retenção deve estar no formato ISO 8601")
      .optional(),
  })
  .refine(
    function (data) {
      if (data.data_consent_given && !data.data_consent_date) {
        return false;
      }
      return true;
    },
    {
      message: "Data de consentimento é obrigatória quando consentimento é dado",
      path: ["data_consent_date"],
    },
  );
// ===============================================
// TREATMENT PLAN VALIDATION SCHEMAS
// ===============================================
var treatmentPlanStatusSchema = zod_1.z.enum(
  ["draft", "active", "on-hold", "revoked", "completed", "entered-in-error", "unknown"],
  {
    errorMap: function () {
      return { message: "Status do plano de tratamento inválido" };
    },
  },
);
var treatmentPlanIntentSchema = zod_1.z.enum(["proposal", "plan", "order", "option", "directive"], {
  errorMap: function () {
    return { message: "Intenção do plano de tratamento inválida" };
  },
});
exports.treatmentPlanActivitySchema = zod_1.z.object({
  id: optionalStringSchema,
  reference: zod_1.z.string().optional(),
  detail: zod_1.z
    .object({
      category: zod_1.z.any().optional(), // FHIRCodeableConcept
      code: zod_1.z.any().optional(), // FHIRCodeableConcept
      status: zod_1.z
        .enum([
          "not-started",
          "scheduled",
          "in-progress",
          "on-hold",
          "completed",
          "cancelled",
          "stopped",
          "unknown",
        ])
        .optional(),
      statusReason: zod_1.z.any().optional(), // FHIRCodeableConcept
      doNotPerform: zod_1.z.boolean().optional(),
      scheduled: zod_1.z
        .object({
          timing: optionalStringSchema,
          period: zod_1.z
            .object({
              start: isoDateTimeSchema,
              end: isoDateTimeSchema,
            })
            .optional(),
          string: optionalStringSchema,
        })
        .optional(),
      location: zod_1.z.string().optional(),
      performer: zod_1.z.array(zod_1.z.string()).optional(),
      product: zod_1.z.any().optional(), // FHIRCodeableConcept | FHIRReference
      dailyAmount: zod_1.z
        .object({
          value: zod_1.z.number().optional(),
          unit: optionalStringSchema,
          system: optionalStringSchema,
          code: optionalStringSchema,
        })
        .optional(),
      quantity: zod_1.z
        .object({
          value: zod_1.z.number().optional(),
          unit: optionalStringSchema,
          system: optionalStringSchema,
          code: optionalStringSchema,
        })
        .optional(),
      description: optionalStringSchema,
    })
    .optional(),
});
exports.treatmentPlanSchema = zod_1.z
  .object(
    __assign(
      __assign(
        {
          id: uuidSchema.optional(),
          patient_id: uuidSchema,
          provider_id: uuidSchema,
          // FHIR CarePlan Core Fields
          fhir_id: fhirIdSchema.optional(),
          status: treatmentPlanStatusSchema,
          intent: treatmentPlanIntentSchema,
          category: zod_1.z.array(zod_1.z.any()).default([]),
          title: nonEmptyStringSchema.max(255, "Título deve ter no máximo 255 caracteres"),
          description: zod_1.z
            .string()
            .max(2000, "Descrição deve ter no máximo 2000 caracteres")
            .optional(),
          // Clinical Context
          subject_reference: nonEmptyStringSchema,
          encounter_reference: optionalStringSchema,
          period_start: isoDateTimeSchema,
          period_end: isoDateTimeSchema,
          // Care Team & Goals
          care_team: zod_1.z.array(zod_1.z.any()).default([]),
          goals: zod_1.z.array(zod_1.z.any()).default([]),
          activities: zod_1.z.array(exports.treatmentPlanActivitySchema).default([]),
          // Supporting Information
          supporting_info: zod_1.z.array(zod_1.z.any()).default([]),
          addresses: zod_1.z.array(zod_1.z.any()).default([]),
          // FHIR Metadata
          fhir_meta: zod_1.z.object({}).default({}),
          fhir_text: zod_1.z.object({}).default({}),
        },
        lgpdConsentSchema.shape,
      ),
      {
        // Audit & Versioning
        version: zod_1.z.number().int().min(1).default(1),
        replaces: uuidSchema.optional(),
      },
    ),
  )
  .refine(
    function (data) {
      if (data.period_start && data.period_end) {
        return new Date(data.period_start) <= new Date(data.period_end);
      }
      return true;
    },
    {
      message: "Data de início deve ser anterior à data de fim",
      path: ["period_end"],
    },
  );
// Form data schema for treatment plan creation/editing
exports.treatmentPlanFormSchema = zod_1.z
  .object({
    title: nonEmptyStringSchema.max(255, "Título deve ter no máximo 255 caracteres"),
    description: zod_1.z
      .string()
      .max(2000, "Descrição deve ter no máximo 2000 caracteres")
      .optional(),
    patient_id: uuidSchema,
    status: treatmentPlanStatusSchema,
    intent: treatmentPlanIntentSchema,
    category: zod_1.z.array(zod_1.z.string()).default([]),
    period_start: isoDateTimeSchema,
    period_end: isoDateTimeSchema,
    goals: zod_1.z.array(zod_1.z.string()).default([]),
    addresses: zod_1.z.array(zod_1.z.string()).default([]),
    data_consent_given: zod_1.z.boolean({
      required_error: "Consentimento de dados é obrigatório",
    }),
  })
  .refine(
    function (data) {
      if (data.period_start && data.period_end) {
        return new Date(data.period_start) <= new Date(data.period_end);
      }
      return true;
    },
    {
      message: "Data de início deve ser anterior à data de fim",
      path: ["period_end"],
    },
  );
// ===============================================
// PROCEDURE VALIDATION SCHEMAS
// ===============================================
var procedureStatusSchema = zod_1.z.enum(
  [
    "preparation",
    "in-progress",
    "not-done",
    "on-hold",
    "stopped",
    "completed",
    "entered-in-error",
    "unknown",
  ],
  {
    errorMap: function () {
      return { message: "Status do procedimento inválido" };
    },
  },
);
exports.procedurePerformerSchema = zod_1.z.object({
  function: zod_1.z.any().optional(), // FHIRCodeableConcept
  actor: zod_1.z.string().min(1, "Referência do ator é obrigatória"),
  onBehalfOf: zod_1.z.string().optional(),
});
exports.procedureSchema = zod_1.z
  .object(
    __assign(
      __assign(
        {
          id: uuidSchema.optional(),
          patient_id: uuidSchema,
          provider_id: uuidSchema,
          treatment_plan_id: uuidSchema.optional(),
          // FHIR Procedure Core Fields
          fhir_id: fhirIdSchema.optional(),
          status: procedureStatusSchema,
          status_reason: zod_1.z.any().optional(),
          // Procedure Classification
          category: zod_1.z.any().optional(),
          code: zod_1.z.any({ required_error: "Código do procedimento é obrigatório" }),
          // Clinical Context
          subject_reference: nonEmptyStringSchema,
          encounter_reference: optionalStringSchema,
          performed_datetime: isoDateTimeSchema,
          performed_period_start: isoDateTimeSchema,
          performed_period_end: isoDateTimeSchema,
          // Procedure Details
          recorder_reference: optionalStringSchema,
          asserter_reference: optionalStringSchema,
          performers: zod_1.z.array(exports.procedurePerformerSchema).default([]),
          location_reference: optionalStringSchema,
          reason_code: zod_1.z.array(zod_1.z.any()).default([]),
          reason_reference: zod_1.z.array(zod_1.z.any()).default([]),
          body_site: zod_1.z.array(zod_1.z.any()).default([]),
          outcome: zod_1.z.any().optional(),
          report: zod_1.z.array(zod_1.z.any()).default([]),
          complications: zod_1.z.array(zod_1.z.any()).default([]),
          follow_up: zod_1.z.array(zod_1.z.any()).default([]),
          // Supporting Documentation
          notes: zod_1.z
            .string()
            .max(5000, "Observações devem ter no máximo 5000 caracteres")
            .optional(),
          used_reference: zod_1.z.array(zod_1.z.any()).default([]),
          used_code: zod_1.z.array(zod_1.z.any()).default([]),
          // FHIR Metadata
          fhir_meta: zod_1.z.object({}).default({}),
          fhir_text: zod_1.z.object({}).default({}),
        },
        lgpdConsentSchema.shape,
      ),
      {
        // Audit & Versioning
        version: zod_1.z.number().int().min(1).default(1),
      },
    ),
  )
  .refine(
    function (data) {
      if (data.performed_period_start && data.performed_period_end) {
        return new Date(data.performed_period_start) <= new Date(data.performed_period_end);
      }
      return true;
    },
    {
      message: "Data de início deve ser anterior à data de fim",
      path: ["performed_period_end"],
    },
  );
// Form data schema for procedure creation/editing
exports.procedureFormSchema = zod_1.z
  .object({
    code: nonEmptyStringSchema.max(50, "Código deve ter no máximo 50 caracteres"),
    code_display: nonEmptyStringSchema.max(
      255,
      "Nome do procedimento deve ter no máximo 255 caracteres",
    ),
    patient_id: uuidSchema,
    treatment_plan_id: uuidSchema.optional(),
    status: procedureStatusSchema,
    category: zod_1.z.string().max(50, "Categoria deve ter no máximo 50 caracteres").optional(),
    performed_datetime: isoDateTimeSchema,
    performed_period_start: isoDateTimeSchema,
    performed_period_end: isoDateTimeSchema,
    body_site: zod_1.z.array(zod_1.z.string()).default([]),
    reason_code: zod_1.z.array(zod_1.z.string()).default([]),
    notes: zod_1.z.string().max(5000, "Observações devem ter no máximo 5000 caracteres").optional(),
    outcome: zod_1.z.string().max(255, "Resultado deve ter no máximo 255 caracteres").optional(),
    data_consent_given: zod_1.z.boolean({
      required_error: "Consentimento de dados é obrigatório",
    }),
  })
  .refine(
    function (data) {
      if (data.performed_period_start && data.performed_period_end) {
        return new Date(data.performed_period_start) <= new Date(data.performed_period_end);
      }
      return true;
    },
    {
      message: "Data de início deve ser anterior à data de fim",
      path: ["performed_period_end"],
    },
  );
// ===============================================
// CLINICAL NOTES VALIDATION SCHEMAS
// ===============================================
var clinicalNoteStatusSchema = zod_1.z.enum(["current", "superseded", "entered-in-error"], {
  errorMap: function () {
    return { message: "Status da nota clínica inválido" };
  },
});
var confidentialityLevelSchema = zod_1.z.enum(["U", "L", "M", "N", "R", "V"], {
  errorMap: function () {
    return { message: "Nível de confidencialidade inválido" };
  },
});
exports.clinicalNoteRelatesToSchema = zod_1.z.object({
  code: zod_1.z.enum(["replaces", "transforms", "signs", "appends"]),
  target: zod_1.z.string().min(1, "Referência do alvo é obrigatória"),
});
exports.clinicalNoteSchema = zod_1.z.object(
  __assign(
    __assign(
      {
        id: uuidSchema.optional(),
        patient_id: uuidSchema,
        provider_id: uuidSchema,
        treatment_plan_id: uuidSchema.optional(),
        procedure_id: uuidSchema.optional(),
        // FHIR DocumentReference/Observation Fields
        fhir_id: fhirIdSchema.optional(),
        status: clinicalNoteStatusSchema,
        // Note Classification
        category: zod_1.z.any().optional(),
        type: zod_1.z.any({ required_error: "Tipo de nota é obrigatório" }),
        subject_reference: nonEmptyStringSchema,
        encounter_reference: optionalStringSchema,
        // Note Content
        title: nonEmptyStringSchema.max(255, "Título deve ter no máximo 255 caracteres"),
        content: nonEmptyStringSchema.max(10000, "Conteúdo deve ter no máximo 10000 caracteres"),
        content_type: zod_1.z.string().default("text/plain"),
        // Clinical Context
        authored_time: zod_1.z.string().datetime("Data de autoria deve estar no formato ISO 8601"),
        author_reference: nonEmptyStringSchema,
        authenticator_reference: optionalStringSchema,
        // Related Information
        relates_to: zod_1.z.array(exports.clinicalNoteRelatesToSchema).default([]),
        context_reference: optionalStringSchema,
        // Security & Access
        security_label: zod_1.z.array(zod_1.z.any()).default([]),
        confidentiality: confidentialityLevelSchema,
        // FHIR Metadata
        fhir_meta: zod_1.z.object({}).default({}),
        fhir_text: zod_1.z.object({}).default({}),
      },
      lgpdConsentSchema.shape,
    ),
    {
      // Audit & Versioning
      version: zod_1.z.number().int().min(1).default(1),
      replaces: uuidSchema.optional(),
    },
  ),
);
// Form data schema for clinical note creation/editing
exports.clinicalNoteFormSchema = zod_1.z.object({
  title: nonEmptyStringSchema.max(255, "Título deve ter no máximo 255 caracteres"),
  content: nonEmptyStringSchema.max(10000, "Conteúdo deve ter no máximo 10000 caracteres"),
  content_type: zod_1.z.string().default("text/plain"),
  patient_id: uuidSchema,
  treatment_plan_id: uuidSchema.optional(),
  procedure_id: uuidSchema.optional(),
  type: nonEmptyStringSchema.max(50, "Tipo deve ter no máximo 50 caracteres"),
  type_display: nonEmptyStringSchema.max(255, "Nome do tipo deve ter no máximo 255 caracteres"),
  category: zod_1.z.string().max(50, "Categoria deve ter no máximo 50 caracteres").optional(),
  confidentiality: confidentialityLevelSchema,
  data_consent_given: zod_1.z.boolean({
    required_error: "Consentimento de dados é obrigatório",
  }),
});
// ===============================================
// SEARCH AND FILTER VALIDATION SCHEMAS
// ===============================================
exports.treatmentPlanSearchSchema = zod_1.z.object({
  patient_id: uuidSchema.optional(),
  provider_id: uuidSchema.optional(),
  status: zod_1.z.array(treatmentPlanStatusSchema).optional(),
  intent: zod_1.z.array(treatmentPlanIntentSchema).optional(),
  period_start: isoDateTimeSchema,
  period_end: isoDateTimeSchema,
  search_text: zod_1.z
    .string()
    .max(255, "Texto de busca deve ter no máximo 255 caracteres")
    .optional(),
  page: zod_1.z.number().int().min(1).default(1),
  per_page: zod_1.z.number().int().min(1).max(100).default(10),
});
exports.procedureSearchSchema = zod_1.z.object({
  patient_id: uuidSchema.optional(),
  provider_id: uuidSchema.optional(),
  treatment_plan_id: uuidSchema.optional(),
  status: zod_1.z.array(procedureStatusSchema).optional(),
  procedure_code: zod_1.z.array(zod_1.z.string()).optional(),
  performed_start: isoDateTimeSchema,
  performed_end: isoDateTimeSchema,
  search_text: zod_1.z
    .string()
    .max(255, "Texto de busca deve ter no máximo 255 caracteres")
    .optional(),
  page: zod_1.z.number().int().min(1).default(1),
  per_page: zod_1.z.number().int().min(1).max(100).default(10),
});
exports.clinicalNoteSearchSchema = zod_1.z.object({
  patient_id: uuidSchema.optional(),
  provider_id: uuidSchema.optional(),
  treatment_plan_id: uuidSchema.optional(),
  procedure_id: uuidSchema.optional(),
  status: zod_1.z.array(clinicalNoteStatusSchema).optional(),
  note_type: zod_1.z.array(zod_1.z.string()).optional(),
  authored_start: isoDateTimeSchema,
  authored_end: isoDateTimeSchema,
  confidentiality: zod_1.z.array(confidentialityLevelSchema).optional(),
  search_text: zod_1.z
    .string()
    .max(255, "Texto de busca deve ter no máximo 255 caracteres")
    .optional(),
  page: zod_1.z.number().int().min(1).default(1),
  per_page: zod_1.z.number().int().min(1).max(100).default(10),
});
