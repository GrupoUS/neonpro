"use strict";
// Professional Management Validation Schemas
// FHIR-compliant validation with LGPD compliance and modern healthcare standards
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialAnalyticsFiltersSchema =
  exports.professionalDashboardFiltersSchema =
  exports.credentialImportSchema =
  exports.professionalImportSchema =
  exports.bulkCredentialExpirationCheckSchema =
  exports.bulkProfessionalUpdateSchema =
  exports.performanceMetricSearchSchema =
  exports.credentialSearchSchema =
  exports.professionalSearchSchema =
  exports.credentialingAlertUpdateSchema =
  exports.credentialingAlertCreateSchema =
  exports.credentialingWorkflowUpdateSchema =
  exports.credentialingWorkflowCreateSchema =
  exports.professionalDevelopmentUpdateSchema =
  exports.professionalDevelopmentCreateSchema =
  exports.performanceMetricUpdateSchema =
  exports.performanceMetricCreateSchema =
  exports.professionalServiceUpdateSchema =
  exports.professionalServiceCreateSchema =
  exports.professionalCredentialUpdateSchema =
  exports.professionalCredentialCreateSchema =
  exports.professionalSpecialtyCreateSchema =
  exports.medicalSpecialtyUpdateSchema =
  exports.medicalSpecialtyCreateSchema =
  exports.professionalUpdateSchema =
  exports.professionalCreateSchema =
    void 0;
var zod_1 = require("zod");
// ============================================
// COMMON VALIDATION PATTERNS
// ============================================
// NPI (National Provider Identifier) validation - exactly 10 digits
var npiSchema = zod_1.z
  .string()
  .regex(/^\d{10}$/, "NPI must be exactly 10 digits")
  .refine(function (npi) {
    // Luhn algorithm validation for NPI
    var digits = npi.split("").map(Number);
    var sum = 0;
    for (var i = 0; i < 9; i++) {
      var digit = digits[i];
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    var checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[9];
  }, "Invalid NPI checksum");
// Phone number validation (international format)
var phoneSchema = zod_1.z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .min(10, "Phone number too short")
  .max(15, "Phone number too long");
// Email validation
var emailSchema = zod_1.z.string().email("Invalid email format").max(255, "Email too long");
// License number validation (alphanumeric, state-specific patterns)
var licenseSchema = zod_1.z
  .string()
  .min(3, "License number too short")
  .max(20, "License number too long")
  .regex(
    /^[A-Z0-9-]+$/,
    "License number must contain only uppercase letters, numbers, and hyphens",
  );
// Professional suffix validation
var suffixSchema = zod_1.z
  .string()
  .regex(/^[A-Z.]+$/, "Professional suffix must be uppercase letters and periods")
  .max(10, "Professional suffix too long")
  .optional();
// Date validation helpers
var dateSchema = zod_1.z
  .string()
  .datetime()
  .or(
    zod_1.z.date().transform(function (d) {
      return d.toISOString();
    }),
  );
var futureDateSchema = zod_1.z
  .string()
  .datetime()
  .refine(function (date) {
    return new Date(date) > new Date();
  }, "Date must be in the future");
// ============================================
// ENUM VALIDATIONS
// ============================================
var employmentStatusSchema = zod_1.z.enum([
  "full_time",
  "part_time",
  "contractor",
  "locum_tenens",
  "retired",
]);
var professionalStatusSchema = zod_1.z.enum([
  "active",
  "inactive",
  "suspended",
  "pending_verification",
]);
var credentialTypeSchema = zod_1.z.enum([
  "license",
  "certification",
  "board_certification",
  "fellowship",
  "residency",
  "degree",
  "cme",
  "training",
]);
var verificationStatusSchema = zod_1.z.enum([
  "pending",
  "in_progress",
  "verified",
  "expired",
  "rejected",
  "requires_update",
]);
var metricTypeSchema = zod_1.z.enum([
  "quality",
  "safety",
  "efficiency",
  "patient_satisfaction",
  "productivity",
  "compliance",
  "availability",
]);
var workflowStatusSchema = zod_1.z.enum([
  "pending",
  "in_progress",
  "requires_documents",
  "under_review",
  "approved",
  "rejected",
  "expired",
]);
var alertSeveritySchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
var alertTypeSchema = zod_1.z.enum([
  "expiration",
  "renewal_required",
  "compliance_check",
  "performance_review",
  "document_missing",
  "license_status",
]);
var serviceTypeSchema = zod_1.z.enum([
  "consultation",
  "procedure",
  "surgery",
  "diagnostic",
  "therapy",
  "emergency",
  "telemedicine",
  "administrative",
]);
var specialtyCategorySchema = zod_1.z.enum([
  "primary_care",
  "specialty",
  "surgical",
  "emergency",
  "diagnostic",
  "mental_health",
  "perioperative",
  "administrative",
]);
// ============================================
// CORE PROFESSIONAL VALIDATION
// ============================================
exports.professionalCreateSchema = zod_1.z.object({
  // Required identifiers
  npi_number: npiSchema,
  fhir_practitioner_id: zod_1.z.string().uuid().optional(),
  // Required personal information
  first_name: zod_1.z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z\s-']+$/, "First name contains invalid characters"),
  middle_name: zod_1.z
    .string()
    .max(50, "Middle name too long")
    .regex(/^[a-zA-Z\s-']+$/, "Middle name contains invalid characters")
    .optional(),
  last_name: zod_1.z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .regex(/^[a-zA-Z\s-']+$/, "Last name contains invalid characters"),
  professional_suffix: suffixSchema,
  // Licensing information
  license_number: licenseSchema,
  license_state: zod_1.z
    .string()
    .length(2, "State code must be 2 characters")
    .regex(/^[A-Z]{2}$/, "State code must be uppercase letters"),
  license_expiration: dateSchema.optional(),
  // Professional details
  primary_specialty: zod_1.z
    .string()
    .min(1, "Primary specialty is required")
    .max(100, "Primary specialty name too long"),
  secondary_specialties: zod_1.z.array(zod_1.z.string().max(100)).optional(),
  // Contact information
  phone: phoneSchema,
  email: emailSchema,
  emergency_contact: phoneSchema.optional(),
  // Employment
  hire_date: dateSchema,
  employment_status: employmentStatusSchema,
  department: zod_1.z.string().max(100).optional(),
  supervisor_id: zod_1.z.string().uuid().optional(),
  // Status
  status: professionalStatusSchema.default("pending_verification"),
  // Optional metadata
  notes: zod_1.z.string().max(1000).optional(),
  tags: zod_1.z.array(zod_1.z.string().max(50)).optional(),
});
exports.professionalUpdateSchema = exports.professionalCreateSchema.partial().omit({
  npi_number: true, // NPI cannot be changed
  hire_date: true, // Hire date cannot be changed
});
// ============================================
// MEDICAL SPECIALTY VALIDATION
// ============================================
exports.medicalSpecialtyCreateSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Specialty name is required").max(100, "Specialty name too long"),
  code: zod_1.z
    .string()
    .min(1, "Specialty code is required")
    .max(20, "Specialty code too long")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Specialty code must be uppercase letters, numbers, underscores, or hyphens",
    ),
  description: zod_1.z.string().max(500).optional(),
  category: specialtyCategorySchema,
  parent_specialty_id: zod_1.z.string().uuid().optional(),
  is_active: zod_1.z.boolean().default(true),
  // Certification requirements
  board_certification_required: zod_1.z.boolean().optional(),
  continuing_education_hours: zod_1.z.number().int().min(0).max(200).optional(),
  // External coding systems
  external_codes: zod_1.z.record(zod_1.z.string()).optional(),
});
exports.medicalSpecialtyUpdateSchema = exports.medicalSpecialtyCreateSchema.partial().omit({
  code: true, // Code cannot be changed once set
});
exports.professionalSpecialtyCreateSchema = zod_1.z.object({
  professional_id: zod_1.z.string().uuid(),
  specialty_id: zod_1.z.string().uuid(),
  is_primary: zod_1.z.boolean().default(false),
  certification_date: dateSchema.optional(),
  recertification_date: futureDateSchema.optional(),
  board_certified: zod_1.z.boolean().default(false),
});
// ============================================
// CREDENTIALS VALIDATION
// ============================================
exports.professionalCredentialCreateSchema = zod_1.z.object({
  professional_id: zod_1.z.string().uuid(),
  // Credential details
  credential_type: credentialTypeSchema,
  credential_name: zod_1.z
    .string()
    .min(1, "Credential name is required")
    .max(100, "Credential name too long"),
  credential_number: zod_1.z.string().max(50, "Credential number too long").optional(),
  issuing_organization: zod_1.z
    .string()
    .min(1, "Issuing organization is required")
    .max(100, "Issuing organization name too long"),
  // Dates
  issue_date: dateSchema,
  expiration_date: zod_1.z
    .string()
    .datetime()
    .optional()
    .refine(function (date, ctx) {
      if (date && new Date(date) <= new Date(ctx.parent.issue_date)) {
        ctx.addIssue({
          code: zod_1.z.ZodIssueCode.custom,
          message: "Expiration date must be after issue date",
        });
        return false;
      }
      return true;
    }),
  renewal_date: futureDateSchema.optional(),
  // Verification
  verification_status: verificationStatusSchema.default("pending"),
  verification_date: dateSchema.optional(),
  verified_by: zod_1.z.string().max(100).optional(),
  verification_source: zod_1.z.string().max(200).optional(),
  // Automation settings
  auto_renewal: zod_1.z.boolean().default(false),
  renewal_reminder_days: zod_1.z.number().int().min(1).max(365).default(30),
  // Documentation
  document_url: zod_1.z.string().url().optional(),
  document_hash: zod_1.z.string().max(100).optional(),
  notes: zod_1.z.string().max(1000).optional(),
});
exports.professionalCredentialUpdateSchema = exports.professionalCredentialCreateSchema
  .partial()
  .omit({
    professional_id: true,
    credential_type: true,
    issuing_organization: true,
    issue_date: true,
  });
// ============================================
// PROFESSIONAL SERVICES VALIDATION
// ============================================
exports.professionalServiceCreateSchema = zod_1.z.object({
  professional_id: zod_1.z.string().uuid(),
  specialty_id: zod_1.z.string().uuid().optional(),
  // Service details
  service_name: zod_1.z
    .string()
    .min(1, "Service name is required")
    .max(100, "Service name too long"),
  service_type: serviceTypeSchema,
  service_code: zod_1.z.string().max(20).optional(), // CPT/HCPCS codes
  description: zod_1.z.string().max(500).optional(),
  // Availability
  is_active: zod_1.z.boolean().default(true),
  available_from: zod_1.z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(), // HH:MM format
  available_to: zod_1.z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  days_of_week: zod_1.z
    .array(
      zod_1.z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
    )
    .optional(),
  max_patients_per_day: zod_1.z.number().int().min(1).max(100).optional(),
  average_appointment_duration: zod_1.z.number().int().min(5).max(480).optional(), // 5 minutes to 8 hours
  // Financial
  base_fee: zod_1.z.number().min(0).max(10000).optional(),
  insurance_accepted: zod_1.z.array(zod_1.z.string().max(100)).optional(),
  billing_code: zod_1.z.string().max(20).optional(),
  // Delivery
  location: zod_1.z.string().max(100).optional(),
  telemedicine_available: zod_1.z.boolean().default(false),
  emergency_service: zod_1.z.boolean().default(false),
  // Quality metrics
  patient_satisfaction_score: zod_1.z.number().min(0).max(5).optional(),
  wait_time_minutes: zod_1.z.number().int().min(0).max(240).optional(),
  success_rate: zod_1.z.number().min(0).max(1).optional(),
});
exports.professionalServiceUpdateSchema = exports.professionalServiceCreateSchema.partial().omit({
  professional_id: true,
});
// ============================================
// PERFORMANCE METRICS VALIDATION
// ============================================
exports.performanceMetricCreateSchema = zod_1.z.object({
  professional_id: zod_1.z.string().uuid(),
  // Metric identification
  metric_type: metricTypeSchema,
  metric_name: zod_1.z.string().min(1, "Metric name is required").max(100, "Metric name too long"),
  metric_description: zod_1.z.string().max(500).optional(),
  // Values
  metric_value: zod_1.z.number().finite(),
  metric_unit: zod_1.z.string().max(20).optional(),
  benchmark_value: zod_1.z.number().finite().optional(),
  target_value: zod_1.z.number().finite().optional(),
  // Time period
  measurement_period_start: dateSchema,
  measurement_period_end: dateSchema.refine(function (endDate, ctx) {
    if (new Date(endDate) <= new Date(ctx.parent.measurement_period_start)) {
      ctx.addIssue({
        code: zod_1.z.ZodIssueCode.custom,
        message: "End date must be after start date",
      });
      return false;
    }
    return true;
  }),
  measurement_frequency: zod_1.z
    .enum(["daily", "weekly", "monthly", "quarterly", "annually"])
    .optional(),
  // Context
  data_source: zod_1.z.string().max(100).optional(),
  calculation_method: zod_1.z.string().max(200).optional(),
  sample_size: zod_1.z.number().int().min(1).optional(),
  confidence_level: zod_1.z.number().min(0).max(1).optional(),
  // Analysis
  previous_value: zod_1.z.number().finite().optional(),
  trend_direction: zod_1.z.enum(["improving", "stable", "declining"]).optional(),
  percentile_rank: zod_1.z.number().min(0).max(100).optional(),
});
exports.performanceMetricUpdateSchema = exports.performanceMetricCreateSchema.partial().omit({
  professional_id: true,
  measurement_period_start: true,
  measurement_period_end: true,
}); // ============================================
// PROFESSIONAL DEVELOPMENT VALIDATION
// ============================================
exports.professionalDevelopmentCreateSchema = zod_1.z.object({
  professional_id: zod_1.z.string().uuid(),
  // Activity details
  activity_type: zod_1.z.enum([
    "cme",
    "conference",
    "workshop",
    "certification",
    "course",
    "simulation",
    "research",
  ]),
  activity_name: zod_1.z
    .string()
    .min(1, "Activity name is required")
    .max(200, "Activity name too long"),
  provider_organization: zod_1.z.string().max(100).optional(),
  activity_description: zod_1.z.string().max(1000).optional(),
  // Dates and duration
  start_date: dateSchema,
  end_date: zod_1.z
    .string()
    .datetime()
    .optional()
    .refine(function (endDate, ctx) {
      if (endDate && new Date(endDate) < new Date(ctx.parent.start_date)) {
        ctx.addIssue({
          code: zod_1.z.ZodIssueCode.custom,
          message: "End date must be after start date",
        });
        return false;
      }
      return true;
    }),
  duration_hours: zod_1.z.number().min(0.5).max(240).optional(), // 30 minutes to 240 hours
  // Credits and certification
  cme_credits: zod_1.z.number().min(0).max(50).optional(),
  certification_earned: zod_1.z.string().max(100).optional(),
  completion_status: zod_1.z
    .enum(["registered", "in_progress", "completed", "cancelled"])
    .default("registered"),
  completion_date: dateSchema.optional(),
  // Verification
  certificate_url: zod_1.z.string().url().optional(),
  verification_code: zod_1.z.string().max(50).optional(),
  accreditation_body: zod_1.z.string().max(100).optional(),
  // Cost and approval
  cost: zod_1.z.number().min(0).max(50000).optional(),
  approval_required: zod_1.z.boolean().default(false),
  approved_by: zod_1.z.string().max(100).optional(),
  approval_date: dateSchema.optional(),
  // Learning outcomes
  learning_objectives: zod_1.z.array(zod_1.z.string().max(200)).optional(),
  competencies_gained: zod_1.z.array(zod_1.z.string().max(100)).optional(),
  assessment_score: zod_1.z.number().min(0).max(100).optional(),
});
exports.professionalDevelopmentUpdateSchema = exports.professionalDevelopmentCreateSchema
  .partial()
  .omit({
    professional_id: true,
    activity_type: true,
    start_date: true,
  });
// ============================================
// CREDENTIALING WORKFLOW VALIDATION
// ============================================
exports.credentialingWorkflowCreateSchema = zod_1.z.object({
  professional_id: zod_1.z.string().uuid(),
  // Workflow identification
  workflow_type: zod_1.z.enum([
    "initial_credentialing",
    "recredentialing",
    "privilege_request",
    "status_change",
    "incident_review",
  ]),
  workflow_name: zod_1.z
    .string()
    .min(1, "Workflow name is required")
    .max(100, "Workflow name too long"),
  priority: zod_1.z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  // Status and assignment
  status: workflowStatusSchema.default("pending"),
  assigned_to: zod_1.z.string().max(100).optional(),
  reviewer_id: zod_1.z.string().uuid().optional(),
  committee_review_required: zod_1.z.boolean().default(false),
  // Timeline
  initiated_date: dateSchema.default(new Date().toISOString()),
  due_date: futureDateSchema.optional(),
  estimated_completion_days: zod_1.z.number().int().min(1).max(365).optional(),
  // Requirements
  required_documents: zod_1.z.array(zod_1.z.string().max(100)).optional(),
  submitted_documents: zod_1.z.array(zod_1.z.string().max(100)).optional(),
  verification_checklist: zod_1.z.record(zod_1.z.boolean()).optional(),
  // Decision
  decision: zod_1.z.enum(["approved", "denied", "conditional", "deferred"]).optional(),
  decision_rationale: zod_1.z.string().max(1000).optional(),
  conditions: zod_1.z.array(zod_1.z.string().max(200)).optional(),
  // Communication
  communication_log: zod_1.z
    .array(
      zod_1.z.object({
        date: dateSchema,
        type: zod_1.z.enum(["email", "phone", "letter", "meeting"]),
        summary: zod_1.z.string().max(500),
        sent_by: zod_1.z.string().max(100),
      }),
    )
    .optional(),
});
exports.credentialingWorkflowUpdateSchema = exports.credentialingWorkflowCreateSchema
  .partial()
  .omit({
    professional_id: true,
    workflow_type: true,
    initiated_date: true,
  });
// ============================================
// ALERTS VALIDATION
// ============================================
exports.credentialingAlertCreateSchema = zod_1.z.object({
  professional_id: zod_1.z.string().uuid(),
  // Alert details
  alert_type: alertTypeSchema,
  title: zod_1.z.string().min(1, "Alert title is required").max(200, "Alert title too long"),
  message: zod_1.z.string().min(1, "Alert message is required").max(1000, "Alert message too long"),
  severity: alertSeveritySchema,
  // Timing
  due_date: futureDateSchema.optional(),
  reminder_date: futureDateSchema.optional(),
  escalation_date: futureDateSchema.optional(),
  // Status
  is_active: zod_1.z.boolean().default(true),
  acknowledged: zod_1.z.boolean().default(false),
  resolved: zod_1.z.boolean().default(false),
  // Automation
  auto_generated: zod_1.z.boolean().default(false),
  recurring: zod_1.z.boolean().default(false),
  recurrence_pattern: zod_1.z.string().max(100).optional(),
  // Related records
  related_credential_id: zod_1.z.string().uuid().optional(),
  related_workflow_id: zod_1.z.string().uuid().optional(),
  // Actions
  action_required: zod_1.z.boolean().default(false),
  action_taken: zod_1.z.string().max(500).optional(),
  next_action_date: futureDateSchema.optional(),
});
exports.credentialingAlertUpdateSchema = exports.credentialingAlertCreateSchema.partial().omit({
  professional_id: true,
  alert_type: true,
  auto_generated: true,
});
// ============================================
// SEARCH AND FILTER SCHEMAS
// ============================================
exports.professionalSearchSchema = zod_1.z.object({
  // Text search
  search: zod_1.z.string().max(100).optional(),
  // Filters
  status: zod_1.z.array(professionalStatusSchema).optional(),
  employment_status: zod_1.z.array(employmentStatusSchema).optional(),
  primary_specialty: zod_1.z.array(zod_1.z.string()).optional(),
  department: zod_1.z.array(zod_1.z.string()).optional(),
  // Date ranges
  hire_date_from: dateSchema.optional(),
  hire_date_to: dateSchema.optional(),
  // License information
  license_state: zod_1.z.array(zod_1.z.string().length(2)).optional(),
  license_expiring_within_days: zod_1.z.number().int().min(1).max(365).optional(),
  // Pagination
  page: zod_1.z.number().int().min(1).default(1),
  limit: zod_1.z.number().int().min(1).max(100).default(20),
  // Sorting
  sort_by: zod_1.z
    .enum(["last_name", "first_name", "hire_date", "status", "primary_specialty"])
    .default("last_name"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("asc"),
});
exports.credentialSearchSchema = zod_1.z.object({
  // Professional filter
  professional_id: zod_1.z.string().uuid().optional(),
  // Credential filters
  credential_type: zod_1.z.array(credentialTypeSchema).optional(),
  verification_status: zod_1.z.array(verificationStatusSchema).optional(),
  issuing_organization: zod_1.z.array(zod_1.z.string()).optional(),
  // Date filters
  expiring_within_days: zod_1.z.number().int().min(1).max(365).optional(),
  expired: zod_1.z.boolean().optional(),
  issued_after: dateSchema.optional(),
  issued_before: dateSchema.optional(),
  // Pagination and sorting
  page: zod_1.z.number().int().min(1).default(1),
  limit: zod_1.z.number().int().min(1).max(100).default(20),
  sort_by: zod_1.z
    .enum(["expiration_date", "issue_date", "credential_name", "verification_status"])
    .default("expiration_date"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("asc"),
});
exports.performanceMetricSearchSchema = zod_1.z.object({
  // Professional filter
  professional_id: zod_1.z.string().uuid().optional(),
  // Metric filters
  metric_type: zod_1.z.array(metricTypeSchema).optional(),
  metric_name: zod_1.z.array(zod_1.z.string()).optional(),
  // Value filters
  min_value: zod_1.z.number().optional(),
  max_value: zod_1.z.number().optional(),
  above_benchmark: zod_1.z.boolean().optional(),
  below_target: zod_1.z.boolean().optional(),
  // Date range
  period_start_after: dateSchema.optional(),
  period_end_before: dateSchema.optional(),
  // Pagination and sorting
  page: zod_1.z.number().int().min(1).default(1),
  limit: zod_1.z.number().int().min(1).max(100).default(20),
  sort_by: zod_1.z
    .enum(["measurement_period_start", "metric_value", "metric_name"])
    .default("measurement_period_start"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// ============================================
// BULK OPERATIONS SCHEMAS
// ============================================
exports.bulkProfessionalUpdateSchema = zod_1.z.object({
  professional_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1).max(100),
  updates: exports.professionalUpdateSchema.omit({ id: true }),
});
exports.bulkCredentialExpirationCheckSchema = zod_1.z.object({
  professional_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
  days_ahead: zod_1.z.number().int().min(1).max(365).default(30),
  credential_types: zod_1.z.array(credentialTypeSchema).optional(),
  generate_alerts: zod_1.z.boolean().default(true),
});
// ============================================
// IMPORT/EXPORT SCHEMAS
// ============================================
exports.professionalImportSchema = zod_1.z.object({
  professionals: zod_1.z.array(exports.professionalCreateSchema),
  validate_npi: zod_1.z.boolean().default(true),
  skip_duplicates: zod_1.z.boolean().default(true),
  send_welcome_email: zod_1.z.boolean().default(false),
});
exports.credentialImportSchema = zod_1.z.object({
  credentials: zod_1.z.array(exports.professionalCredentialCreateSchema),
  auto_verify: zod_1.z.boolean().default(false),
  skip_duplicates: zod_1.z.boolean().default(true),
  generate_alerts: zod_1.z.boolean().default(true),
});
// ============================================
// DASHBOARD AND ANALYTICS SCHEMAS
// ============================================
exports.professionalDashboardFiltersSchema = zod_1.z.object({
  date_range: zod_1.z.enum(["7d", "30d", "90d", "1y", "custom"]).default("30d"),
  custom_start_date: dateSchema.optional(),
  custom_end_date: dateSchema.optional(),
  departments: zod_1.z.array(zod_1.z.string()).optional(),
  specialties: zod_1.z.array(zod_1.z.string()).optional(),
  employment_status: zod_1.z.array(employmentStatusSchema).optional(),
});
exports.credentialAnalyticsFiltersSchema = zod_1.z.object({
  timeframe: zod_1.z.enum(["current", "30d", "60d", "90d", "1y"]).default("current"),
  credential_types: zod_1.z.array(credentialTypeSchema).optional(),
  departments: zod_1.z.array(zod_1.z.string()).optional(),
  risk_level: zod_1.z.enum(["all", "low", "medium", "high", "critical"]).default("all"),
});
