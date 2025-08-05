import { z } from "zod";

/**
 * Healthcare Zod Schemas for tRPC Validation
 *
 * Comprehensive validation schemas for:
 * - Healthcare user data with LGPD compliance
 * - Medical professional credentials
 * - Patient information with privacy controls
 * - Audit trail data validation
 * - API request/response validation
 */

// Healthcare role validation
export const HealthcareRoleSchema = z.enum([
  "admin",
  "healthcare_professional",
  "patient",
  "staff",
]);

// Medical specialization validation
export const MedicalSpecializationSchema = z.enum([
  "general_medicine",
  "cardiology",
  "pediatrics",
  "orthopedics",
  "neurology",
  "dermatology",
  "psychiatry",
  "radiology",
  "surgery",
  "emergency",
  "other",
]);

// Brazilian medical license validation (CRM format)
export const MedicalLicenseSchema = z
  .string()
  .regex(/^CRM\/[A-Z]{2}\s\d{4,6}$/, "Formato inválido de CRM (ex: CRM/SP 123456)");

// LGPD compliance validation
export const LGPDComplianceSchema = z.object({
  lgpd_consent: z.boolean(),
  data_consent_given: z.boolean(),
  data_consent_date: z.string().datetime().optional(),
  data_retention_period: z.number().min(30).max(3650).optional(),
  data_processing_purposes: z.array(z.string()).min(1),
  third_party_sharing_consent: z.boolean(),
});

// Healthcare user profile validation
export const HealthcareUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Email inválido"),
  role: HealthcareRoleSchema,
  tenant_id: z.string().uuid(),
  medical_license: MedicalLicenseSchema.optional(),
  specialization: MedicalSpecializationSchema.optional(),
  department: z.string().min(2).max(100).optional(),
  full_name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/, "Telefone inválido")
    .optional(),
  avatar_url: z.string().url().optional(),
  lgpd_compliance: LGPDComplianceSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}); // Audit trail validation
export const HealthcareAuditLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  action: z.string().min(1).max(100),
  resource_type: z.string().min(1).max(50),
  resource_id: z.string().uuid().optional(),
  tenant_id: z.string().uuid().optional(),
  metadata: z.record(z.any()),
  request_id: z.string().min(1),
  ip_address: z.string().ip(),
  user_agent: z.string().min(1),
  timestamp: z.string().datetime(),
  compliance_flags: z.object({
    lgpd_compliant: z.boolean(),
    data_consent_validated: z.boolean(),
    medical_role_verified: z.boolean(),
  }),
});

// API input validation schemas
export const UpdateConsentInputSchema = z.object({
  lgpd_consent: z.boolean(),
  data_consent_given: z.boolean(),
});

export const TenantFilterInputSchema = z.object({
  tenant_id: z.string().uuid(),
});

// Patient data validation (basic structure)
export const PatientDataSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/)
    .optional(),
  date_of_birth: z.string().datetime(),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
    .optional(),
  tenant_id: z.string().uuid(),
  lgpd_consent: z.boolean(),
  data_consent_date: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// All schemas are already exported individually above
