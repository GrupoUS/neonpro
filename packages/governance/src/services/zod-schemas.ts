// Realistic zod schemas for compliance integration tests (Phase 1)
// --- Compliance Validation Schemas (Phase 1 minimal) ---

import * as z from "zod";

// Basic patient schema focusing on fields used in prediction & compliance flows
export const patientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  age: z.number().int().min(0).max(120),
  gender: z.enum(["male", "female", "other"]).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

export type Patient = z.infer<typeof patientSchema>;

export const appointmentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  type: z.enum(["consultation", "exam", "followup"]).default("consultation"),
  status: z
    .enum(["scheduled", "completed", "cancelled", "noshow"])
    .default("scheduled"),
  daysSinceScheduled: z.number().int().min(0).optional(),
  previousNoShows: z.number().int().min(0).optional(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

// Compliance policy schema: minimal for tests
export const compliancePolicySchema = z.object({
  version: z.string(),
  encryption: z.boolean().default(true),
  piiMasking: z.boolean().default(true),
  retentionDays: z.number().int().min(0).max(3650).default(365),
});
export type CompliancePolicy = z.infer<typeof compliancePolicySchema>;

// Validation helpers (used in integration tests)
export function validatePatient(input: unknown) {
  return patientSchema.parse(input);
}
export function validateAppointment(input: unknown) {
  return appointmentSchema.parse(input);
}
export function validateCompliancePolicy(input: unknown) {
  return compliancePolicySchema.parse(input);
}

// Aggregator for dynamic resolution
export const schemas = {
  patient: patientSchema,
  appointment: appointmentSchema,
  compliancePolicy: compliancePolicySchema,
};

export type SchemaKey = keyof typeof schemas;

// --- Extended Compliance Schemas (simplified) ---

const phiPatientSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.date().refine((d) => d.getTime() <= Date.now(), {
    message: "Birth date cannot be in future",
  }),
  cpf: z
    .string()
    .regex(/^\d{11}$/, { message: "CPF must be 11 digits" })
    .optional(),
  medicalRecordNumber: z.string().min(1),
  insuranceId: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().min(1),
      phone: z.string().optional(),
      relationship: z
        .enum(["spouse", "parent", "child", "sibling", "other"])
        .optional(),
    })
    .optional(),
});

const consentRecordSchema = z.object({
  patientId: z.string().uuid(),
  consentId: z.string().uuid(),
  consentType: z.enum(["data_processing", "marketing", "research"]),
  lawfulBasis: z.enum([
    "consent",
    "contract",
    "legal_obligation",
    "vital_interest",
    "public_task",
    "legitimate_interest",
  ]),
  granted: z.boolean(),
  grantedAt: z.date(),
  revokedAt: z.date().optional(),
  version: z.string(),
  dataCategories: z
    .array(z.enum(["personal", "health", "behavioral", "device"]))
    .min(1),
  processingPurpose: z.string().min(5),
  retentionPeriod: z.number().int().min(0).max(2555),
  auditTrail: z.array(
    z.object({
      action: z.enum(["granted", "revoked"]),
      timestamp: z.date(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }),
  ),
});

const kpiSchema = z.object({
  kpiId: z.string().regex(/^KPI-[A-Z0-9_]+$/, {
    message: "KPI ID must match pattern KPI-UPPER_SNAKE",
  }),
  value: z.number(),
  unit: z.enum(["percentage", "count", "ms", "kb"]).optional(),
  timestamp: z.date(),
  source: z
    .enum(["ehr_system", "manual_entry", "automated_calculation"])
    .optional(),
  confidence: z.number().min(0).max(1).optional(),
  patientCohort: z
    .object({
      totalPatients: z.number().int().min(1),
      ageRange: z
        .object({ min: z.number().int().min(0), max: z.number().int().min(0) })
        .refine((r) => r.min <= r.max, {
          message: "ageRange.min must be <= max",
        }),
      conditions: z.array(z.string()).optional(),
      excludePHI: z.boolean().optional(),
    })
    .optional(),
});

const aiGovernanceSchema = z.object({
  modelId: z.string().min(3),
  version: z.string().min(1),
  evaluationId: z.string().uuid(),
  hallucinationRate: z.number().min(0).max(1),
  accuracy: z.number().min(0).max(1),
  evaluationMethod: z.enum(["hybrid", "automated_similarity", "manual_review"]),
  sampleSize: z.number().int().min(1),
  evaluatedAt: z.date(),
  thresholds: z.object({
    maxHallucinationRate: z.number().min(0).max(1),
    minAccuracy: z.number().min(0).max(1),
    escalationTrigger: z.number().int().min(1),
  }),
  complianceFlags: z
    .array(
      z.enum([
        "hallucination_spike",
        "performance_degradation",
        "bias_concern",
      ]),
    )
    .default([]),
});

const riskAssessmentSchema = z.object({
  riskId: z.string().regex(/^RISK-[A-Z0-9_-]+$/),
  category: z.enum([
    "data_privacy",
    "security",
    "system_performance",
    "clinical",
    "operational",
    "security",
    "system_performance",
    "data_privacy",
  ]),
  probability: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  exposure: z.number().int().min(0),
  mitigationStrategy: z.string().min(5),
  owner: z.string().min(1),
  reviewCadence: z.enum(["monthly", "quarterly"]).optional(),
  status: z.enum(["mitigating", "accepted", "transferred"]).optional(),
  complianceMapping: z.array(z.string()).optional(),
});

const performanceBudgetSchema = z.object({
  metric: z.enum(["lcp", "cls", "fid", "api_latency", "bundle_size"]),
  budget: z.number().int().min(0),
  unit: z.enum(["ms", "kb", "percentage"]),
  environment: z.enum(["production", "staging"]).optional(),
  monitoringEnabled: z.boolean().optional(),
  alertThreshold: z.number().min(0).max(1).optional(),
  escalationPath: z.string().optional(),
});

const auditTrailSchema = z.object({
  id: z.string().uuid(),
  _userId: z.string().uuid(),
  action: z.enum(["read", "write", "update", "delete"]),
  resource: z.string().min(1),
  resourceType: z.enum(["patient", "appointment", "kpi", "policy", "risk"]),
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  outcome: z.enum(["success", "failure"]),
  details: z
    .object({
      fieldsAccessed: z.array(z.string()).optional(),
      purpose: z.string().optional(),
    })
    .optional(),
  phi_accessed: z.boolean().optional(),
  retention_expires: z.date().optional(),
});

export const COMPLIANCE_SCHEMAS = {
  PHIPatient: phiPatientSchema,
  ConsentRecord: consentRecordSchema,
  HealthcareKPI: kpiSchema,
  AIEvaluation: aiGovernanceSchema,
  RiskAssessment: riskAssessmentSchema,
  PerformanceBudget: performanceBudgetSchema,
  AuditTrail: auditTrailSchema,
};

// --- Validator Functions ---
export function validatePHI(data: unknown) {
  return COMPLIANCE_SCHEMAS.PHIPatient.parse(data);
}
export function validateConsent(data: unknown) {
  return COMPLIANCE_SCHEMAS.ConsentRecord.parse(data);
}
export function validateKPI(data: unknown) {
  return COMPLIANCE_SCHEMAS.HealthcareKPI.parse(data);
}
export function validateAIGovernance(data: unknown) {
  return COMPLIANCE_SCHEMAS.AIEvaluation.parse(data);
}
export function validateRisk(data: unknown) {
  return COMPLIANCE_SCHEMAS.RiskAssessment.parse(data);
}

export function checkComplianceRequirements(
  schemaType: keyof typeof COMPLIANCE_SCHEMAS,
  data: unknown,
) {
  try {
    // @ts-ignore dynamic index
    const parsed = COMPLIANCE_SCHEMAS[schemaType].parse(data);
    return { valid: true, data: parsed, errors: [] as any[] };
  } catch (_err: any) {
    if (_err?.issues) {
      return { valid: false, data: null, errors: _err.issues };
    }
    return {
      valid: false,
      data: null,
      errors: [{ message: _err?.message || "Unknown error" }],
    };
  }
}

export function validate<K extends SchemaKey>(key: K, data: unknown) {
  return schemas[key].parse(data);
}
