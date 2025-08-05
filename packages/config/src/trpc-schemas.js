Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientDataSchema =
  exports.TenantFilterInputSchema =
  exports.UpdateConsentInputSchema =
  exports.HealthcareAuditLogSchema =
  exports.HealthcareUserSchema =
  exports.LGPDComplianceSchema =
  exports.MedicalLicenseSchema =
  exports.MedicalSpecializationSchema =
  exports.HealthcareRoleSchema =
    void 0;
var zod_1 = require("zod");
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
exports.HealthcareRoleSchema = zod_1.z.enum([
  "admin",
  "healthcare_professional",
  "patient",
  "staff",
]);
// Medical specialization validation
exports.MedicalSpecializationSchema = zod_1.z.enum([
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
exports.MedicalLicenseSchema = zod_1.z
  .string()
  .regex(/^CRM\/[A-Z]{2}\s\d{4,6}$/, "Formato inválido de CRM (ex: CRM/SP 123456)");
// LGPD compliance validation
exports.LGPDComplianceSchema = zod_1.z.object({
  lgpd_consent: zod_1.z.boolean(),
  data_consent_given: zod_1.z.boolean(),
  data_consent_date: zod_1.z.string().datetime().optional(),
  data_retention_period: zod_1.z.number().min(30).max(3650).optional(),
  data_processing_purposes: zod_1.z.array(zod_1.z.string()).min(1),
  third_party_sharing_consent: zod_1.z.boolean(),
});
// Healthcare user profile validation
exports.HealthcareUserSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  email: zod_1.z.string().email("Email inválido"),
  role: exports.HealthcareRoleSchema,
  tenant_id: zod_1.z.string().uuid(),
  medical_license: exports.MedicalLicenseSchema.optional(),
  specialization: exports.MedicalSpecializationSchema.optional(),
  department: zod_1.z.string().min(2).max(100).optional(),
  full_name: zod_1.z.string().min(2).max(100),
  phone: zod_1.z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/, "Telefone inválido")
    .optional(),
  avatar_url: zod_1.z.string().url().optional(),
  lgpd_compliance: exports.LGPDComplianceSchema,
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
}); // Audit trail validation
exports.HealthcareAuditLogSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  user_id: zod_1.z.string().uuid().nullable(),
  action: zod_1.z.string().min(1).max(100),
  resource_type: zod_1.z.string().min(1).max(50),
  resource_id: zod_1.z.string().uuid().optional(),
  tenant_id: zod_1.z.string().uuid().optional(),
  metadata: zod_1.z.record(zod_1.z.any()),
  request_id: zod_1.z.string().min(1),
  ip_address: zod_1.z.string().ip(),
  user_agent: zod_1.z.string().min(1),
  timestamp: zod_1.z.string().datetime(),
  compliance_flags: zod_1.z.object({
    lgpd_compliant: zod_1.z.boolean(),
    data_consent_validated: zod_1.z.boolean(),
    medical_role_verified: zod_1.z.boolean(),
  }),
});
// API input validation schemas
exports.UpdateConsentInputSchema = zod_1.z.object({
  lgpd_consent: zod_1.z.boolean(),
  data_consent_given: zod_1.z.boolean(),
});
exports.TenantFilterInputSchema = zod_1.z.object({
  tenant_id: zod_1.z.string().uuid(),
});
// Patient data validation (basic structure)
exports.PatientDataSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  full_name: zod_1.z.string().min(2).max(100),
  email: zod_1.z.string().email().optional(),
  phone: zod_1.z
    .string()
    .regex(/^\+?[1-9]\d{10,14}$/)
    .optional(),
  date_of_birth: zod_1.z.string().datetime(),
  cpf: zod_1.z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
    .optional(),
  tenant_id: zod_1.z.string().uuid(),
  lgpd_consent: zod_1.z.boolean(),
  data_consent_date: zod_1.z.string().datetime(),
  created_at: zod_1.z.string().datetime(),
  updated_at: zod_1.z.string().datetime(),
});
// All schemas are already exported individually above
