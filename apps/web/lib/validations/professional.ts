// Professional Management Validation Schemas
// FHIR-compliant validation with LGPD compliance and modern healthcare standards

import { z } from 'zod';

// ============================================
// COMMON VALIDATION PATTERNS
// ============================================

// NPI (National Provider Identifier) validation - exactly 10 digits
const npiSchema = z
  .string()
  .regex(/^\d{10}$/, 'NPI must be exactly 10 digits')
  .refine((npi) => {
    // Luhn algorithm validation for NPI
    const digits = npi.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let digit = digits[i];
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[9];
  }, 'Invalid NPI checksum');

// Phone number validation (international format)
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .min(10, 'Phone number too short')
  .max(15, 'Phone number too long');

// Email validation
const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email too long');

// License number validation (alphanumeric, state-specific patterns)
const licenseSchema = z
  .string()
  .min(3, 'License number too short')
  .max(20, 'License number too long')
  .regex(
    /^[A-Z0-9-]+$/,
    'License number must contain only uppercase letters, numbers, and hyphens',
  );

// Professional suffix validation
const suffixSchema = z
  .string()
  .regex(
    /^[A-Z.]+$/,
    'Professional suffix must be uppercase letters and periods',
  )
  .max(10, 'Professional suffix too long')
  .optional();

// Date validation helpers
const dateSchema = z
  .string()
  .datetime()
  .or(z.date().transform((d) => d.toISOString()));
const futureDateSchema = z
  .string()
  .datetime()
  .refine((date) => new Date(date) > new Date(), 'Date must be in the future');

// ============================================
// ENUM VALIDATIONS
// ============================================

const employmentStatusSchema = z.enum([
  'full_time',
  'part_time',
  'contractor',
  'locum_tenens',
  'retired',
]);
const professionalStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'pending_verification',
]);
const credentialTypeSchema = z.enum([
  'license',
  'certification',
  'board_certification',
  'fellowship',
  'residency',
  'degree',
  'cme',
  'training',
]);
const verificationStatusSchema = z.enum([
  'pending',
  'in_progress',
  'verified',
  'expired',
  'rejected',
  'requires_update',
]);
const metricTypeSchema = z.enum([
  'quality',
  'safety',
  'efficiency',
  'patient_satisfaction',
  'productivity',
  'compliance',
  'availability',
]);
const workflowStatusSchema = z.enum([
  'pending',
  'in_progress',
  'requires_documents',
  'under_review',
  'approved',
  'rejected',
  'expired',
]);
const alertSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
const alertTypeSchema = z.enum([
  'expiration',
  'renewal_required',
  'compliance_check',
  'performance_review',
  'document_missing',
  'license_status',
]);
const serviceTypeSchema = z.enum([
  'consultation',
  'procedure',
  'surgery',
  'diagnostic',
  'therapy',
  'emergency',
  'telemedicine',
  'administrative',
]);
const specialtyCategorySchema = z.enum([
  'primary_care',
  'specialty',
  'surgical',
  'emergency',
  'diagnostic',
  'mental_health',
  'perioperative',
  'administrative',
]);

// ============================================
// CORE PROFESSIONAL VALIDATION
// ============================================

export const professionalCreateSchema = z.object({
  // Required identifiers
  npi_number: npiSchema,
  fhir_practitioner_id: z.string().uuid().optional(),

  // Required personal information
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'First name contains invalid characters'),

  middle_name: z
    .string()
    .max(50, 'Middle name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Middle name contains invalid characters')
    .optional(),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name contains invalid characters'),

  professional_suffix: suffixSchema,

  // Licensing information
  license_number: licenseSchema,
  license_state: z
    .string()
    .length(2, 'State code must be 2 characters')
    .regex(/^[A-Z]{2}$/, 'State code must be uppercase letters'),
  license_expiration: dateSchema.optional(),

  // Professional details
  primary_specialty: z
    .string()
    .min(1, 'Primary specialty is required')
    .max(100, 'Primary specialty name too long'),

  secondary_specialties: z.array(z.string().max(100)).optional(),

  // Contact information
  phone: phoneSchema,
  email: emailSchema,
  emergency_contact: phoneSchema.optional(),

  // Employment
  hire_date: dateSchema,
  employment_status: employmentStatusSchema,
  department: z.string().max(100).optional(),
  supervisor_id: z.string().uuid().optional(),

  // Status
  status: professionalStatusSchema.default('pending_verification'),

  // Optional metadata
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export const professionalUpdateSchema = professionalCreateSchema
  .partial()
  .omit({
    npi_number: true, // NPI cannot be changed
    hire_date: true, // Hire date cannot be changed
  });

// ============================================
// MEDICAL SPECIALTY VALIDATION
// ============================================

export const medicalSpecialtyCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Specialty name is required')
    .max(100, 'Specialty name too long'),

  code: z
    .string()
    .min(1, 'Specialty code is required')
    .max(20, 'Specialty code too long')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Specialty code must be uppercase letters, numbers, underscores, or hyphens',
    ),

  description: z.string().max(500).optional(),
  category: specialtyCategorySchema,
  parent_specialty_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true),

  // Certification requirements
  board_certification_required: z.boolean().optional(),
  continuing_education_hours: z.number().int().min(0).max(200).optional(),

  // External coding systems
  external_codes: z.record(z.string()).optional(),
});

export const medicalSpecialtyUpdateSchema = medicalSpecialtyCreateSchema
  .partial()
  .omit({
    code: true, // Code cannot be changed once set
  });

export const professionalSpecialtyCreateSchema = z.object({
  professional_id: z.string().uuid(),
  specialty_id: z.string().uuid(),

  is_primary: z.boolean().default(false),
  certification_date: dateSchema.optional(),
  recertification_date: futureDateSchema.optional(),
  board_certified: z.boolean().default(false),
});

// ============================================
// CREDENTIALS VALIDATION
// ============================================

export const professionalCredentialCreateSchema = z.object({
  professional_id: z.string().uuid(),

  // Credential details
  credential_type: credentialTypeSchema,
  credential_name: z
    .string()
    .min(1, 'Credential name is required')
    .max(100, 'Credential name too long'),

  credential_number: z
    .string()
    .max(50, 'Credential number too long')
    .optional(),

  issuing_organization: z
    .string()
    .min(1, 'Issuing organization is required')
    .max(100, 'Issuing organization name too long'),

  // Dates
  issue_date: dateSchema,
  expiration_date: z
    .string()
    .datetime()
    .optional()
    .refine((date, ctx) => {
      if (date && new Date(date) <= new Date(ctx.parent.issue_date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expiration date must be after issue date',
        });
        return false;
      }
      return true;
    }),

  renewal_date: futureDateSchema.optional(),

  // Verification
  verification_status: verificationStatusSchema.default('pending'),
  verification_date: dateSchema.optional(),
  verified_by: z.string().max(100).optional(),
  verification_source: z.string().max(200).optional(),

  // Automation settings
  auto_renewal: z.boolean().default(false),
  renewal_reminder_days: z.number().int().min(1).max(365).default(30),

  // Documentation
  document_url: z.string().url().optional(),
  document_hash: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const professionalCredentialUpdateSchema =
  professionalCredentialCreateSchema.partial().omit({
    professional_id: true,
    credential_type: true,
    issuing_organization: true,
    issue_date: true,
  });

// ============================================
// PROFESSIONAL SERVICES VALIDATION
// ============================================

export const professionalServiceCreateSchema = z.object({
  professional_id: z.string().uuid(),
  specialty_id: z.string().uuid().optional(),

  // Service details
  service_name: z
    .string()
    .min(1, 'Service name is required')
    .max(100, 'Service name too long'),

  service_type: serviceTypeSchema,
  service_code: z.string().max(20).optional(), // CPT/HCPCS codes
  description: z.string().max(500).optional(),

  // Availability
  is_active: z.boolean().default(true),
  available_from: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(), // HH:MM format
  available_to: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  days_of_week: z
    .array(
      z.enum([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]),
    )
    .optional(),
  max_patients_per_day: z.number().int().min(1).max(100).optional(),
  average_appointment_duration: z.number().int().min(5).max(480).optional(), // 5 minutes to 8 hours

  // Financial
  base_fee: z.number().min(0).max(10_000).optional(),
  insurance_accepted: z.array(z.string().max(100)).optional(),
  billing_code: z.string().max(20).optional(),

  // Delivery
  location: z.string().max(100).optional(),
  telemedicine_available: z.boolean().default(false),
  emergency_service: z.boolean().default(false),

  // Quality metrics
  patient_satisfaction_score: z.number().min(0).max(5).optional(),
  wait_time_minutes: z.number().int().min(0).max(240).optional(),
  success_rate: z.number().min(0).max(1).optional(),
});

export const professionalServiceUpdateSchema = professionalServiceCreateSchema
  .partial()
  .omit({
    professional_id: true,
  });

// ============================================
// PERFORMANCE METRICS VALIDATION
// ============================================

export const performanceMetricCreateSchema = z.object({
  professional_id: z.string().uuid(),

  // Metric identification
  metric_type: metricTypeSchema,
  metric_name: z
    .string()
    .min(1, 'Metric name is required')
    .max(100, 'Metric name too long'),

  metric_description: z.string().max(500).optional(),

  // Values
  metric_value: z.number().finite(),
  metric_unit: z.string().max(20).optional(),
  benchmark_value: z.number().finite().optional(),
  target_value: z.number().finite().optional(),

  // Time period
  measurement_period_start: dateSchema,
  measurement_period_end: dateSchema.refine((endDate, ctx) => {
    if (new Date(endDate) <= new Date(ctx.parent.measurement_period_start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
      });
      return false;
    }
    return true;
  }),

  measurement_frequency: z
    .enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually'])
    .optional(),

  // Context
  data_source: z.string().max(100).optional(),
  calculation_method: z.string().max(200).optional(),
  sample_size: z.number().int().min(1).optional(),
  confidence_level: z.number().min(0).max(1).optional(),

  // Analysis
  previous_value: z.number().finite().optional(),
  trend_direction: z.enum(['improving', 'stable', 'declining']).optional(),
  percentile_rank: z.number().min(0).max(100).optional(),
});

export const performanceMetricUpdateSchema = performanceMetricCreateSchema
  .partial()
  .omit({
    professional_id: true,
    measurement_period_start: true,
    measurement_period_end: true,
  }); // ============================================
// PROFESSIONAL DEVELOPMENT VALIDATION
// ============================================

export const professionalDevelopmentCreateSchema = z.object({
  professional_id: z.string().uuid(),

  // Activity details
  activity_type: z.enum([
    'cme',
    'conference',
    'workshop',
    'certification',
    'course',
    'simulation',
    'research',
  ]),
  activity_name: z
    .string()
    .min(1, 'Activity name is required')
    .max(200, 'Activity name too long'),

  provider_organization: z.string().max(100).optional(),
  activity_description: z.string().max(1000).optional(),

  // Dates and duration
  start_date: dateSchema,
  end_date: z
    .string()
    .datetime()
    .optional()
    .refine((endDate, ctx) => {
      if (endDate && new Date(endDate) < new Date(ctx.parent.start_date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be after start date',
        });
        return false;
      }
      return true;
    }),

  duration_hours: z.number().min(0.5).max(240).optional(), // 30 minutes to 240 hours

  // Credits and certification
  cme_credits: z.number().min(0).max(50).optional(),
  certification_earned: z.string().max(100).optional(),
  completion_status: z
    .enum(['registered', 'in_progress', 'completed', 'cancelled'])
    .default('registered'),
  completion_date: dateSchema.optional(),

  // Verification
  certificate_url: z.string().url().optional(),
  verification_code: z.string().max(50).optional(),
  accreditation_body: z.string().max(100).optional(),

  // Cost and approval
  cost: z.number().min(0).max(50_000).optional(),
  approval_required: z.boolean().default(false),
  approved_by: z.string().max(100).optional(),
  approval_date: dateSchema.optional(),

  // Learning outcomes
  learning_objectives: z.array(z.string().max(200)).optional(),
  competencies_gained: z.array(z.string().max(100)).optional(),
  assessment_score: z.number().min(0).max(100).optional(),
});

export const professionalDevelopmentUpdateSchema =
  professionalDevelopmentCreateSchema.partial().omit({
    professional_id: true,
    activity_type: true,
    start_date: true,
  });

// ============================================
// CREDENTIALING WORKFLOW VALIDATION
// ============================================

export const credentialingWorkflowCreateSchema = z.object({
  professional_id: z.string().uuid(),

  // Workflow identification
  workflow_type: z.enum([
    'initial_credentialing',
    'recredentialing',
    'privilege_request',
    'status_change',
    'incident_review',
  ]),
  workflow_name: z
    .string()
    .min(1, 'Workflow name is required')
    .max(100, 'Workflow name too long'),

  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

  // Status and assignment
  status: workflowStatusSchema.default('pending'),
  assigned_to: z.string().max(100).optional(),
  reviewer_id: z.string().uuid().optional(),
  committee_review_required: z.boolean().default(false),

  // Timeline
  initiated_date: dateSchema.default(new Date().toISOString()),
  due_date: futureDateSchema.optional(),
  estimated_completion_days: z.number().int().min(1).max(365).optional(),

  // Requirements
  required_documents: z.array(z.string().max(100)).optional(),
  submitted_documents: z.array(z.string().max(100)).optional(),
  verification_checklist: z.record(z.boolean()).optional(),

  // Decision
  decision: z
    .enum(['approved', 'denied', 'conditional', 'deferred'])
    .optional(),
  decision_rationale: z.string().max(1000).optional(),
  conditions: z.array(z.string().max(200)).optional(),

  // Communication
  communication_log: z
    .array(
      z.object({
        date: dateSchema,
        type: z.enum(['email', 'phone', 'letter', 'meeting']),
        summary: z.string().max(500),
        sent_by: z.string().max(100),
      }),
    )
    .optional(),
});

export const credentialingWorkflowUpdateSchema =
  credentialingWorkflowCreateSchema.partial().omit({
    professional_id: true,
    workflow_type: true,
    initiated_date: true,
  });

// ============================================
// ALERTS VALIDATION
// ============================================

export const credentialingAlertCreateSchema = z.object({
  professional_id: z.string().uuid(),

  // Alert details
  alert_type: alertTypeSchema,
  title: z
    .string()
    .min(1, 'Alert title is required')
    .max(200, 'Alert title too long'),

  message: z
    .string()
    .min(1, 'Alert message is required')
    .max(1000, 'Alert message too long'),

  severity: alertSeveritySchema,

  // Timing
  due_date: futureDateSchema.optional(),
  reminder_date: futureDateSchema.optional(),
  escalation_date: futureDateSchema.optional(),

  // Status
  is_active: z.boolean().default(true),
  acknowledged: z.boolean().default(false),
  resolved: z.boolean().default(false),

  // Automation
  auto_generated: z.boolean().default(false),
  recurring: z.boolean().default(false),
  recurrence_pattern: z.string().max(100).optional(),

  // Related records
  related_credential_id: z.string().uuid().optional(),
  related_workflow_id: z.string().uuid().optional(),

  // Actions
  action_required: z.boolean().default(false),
  action_taken: z.string().max(500).optional(),
  next_action_date: futureDateSchema.optional(),
});

export const credentialingAlertUpdateSchema = credentialingAlertCreateSchema
  .partial()
  .omit({
    professional_id: true,
    alert_type: true,
    auto_generated: true,
  });

// ============================================
// SEARCH AND FILTER SCHEMAS
// ============================================

export const professionalSearchSchema = z.object({
  // Text search
  search: z.string().max(100).optional(),

  // Filters
  status: z.array(professionalStatusSchema).optional(),
  employment_status: z.array(employmentStatusSchema).optional(),
  primary_specialty: z.array(z.string()).optional(),
  department: z.array(z.string()).optional(),

  // Date ranges
  hire_date_from: dateSchema.optional(),
  hire_date_to: dateSchema.optional(),

  // License information
  license_state: z.array(z.string().length(2)).optional(),
  license_expiring_within_days: z.number().int().min(1).max(365).optional(),

  // Pagination
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),

  // Sorting
  sort_by: z
    .enum([
      'last_name',
      'first_name',
      'hire_date',
      'status',
      'primary_specialty',
    ])
    .default('last_name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

export const credentialSearchSchema = z.object({
  // Professional filter
  professional_id: z.string().uuid().optional(),

  // Credential filters
  credential_type: z.array(credentialTypeSchema).optional(),
  verification_status: z.array(verificationStatusSchema).optional(),
  issuing_organization: z.array(z.string()).optional(),

  // Date filters
  expiring_within_days: z.number().int().min(1).max(365).optional(),
  expired: z.boolean().optional(),
  issued_after: dateSchema.optional(),
  issued_before: dateSchema.optional(),

  // Pagination and sorting
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z
    .enum([
      'expiration_date',
      'issue_date',
      'credential_name',
      'verification_status',
    ])
    .default('expiration_date'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

export const performanceMetricSearchSchema = z.object({
  // Professional filter
  professional_id: z.string().uuid().optional(),

  // Metric filters
  metric_type: z.array(metricTypeSchema).optional(),
  metric_name: z.array(z.string()).optional(),

  // Value filters
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  above_benchmark: z.boolean().optional(),
  below_target: z.boolean().optional(),

  // Date range
  period_start_after: dateSchema.optional(),
  period_end_before: dateSchema.optional(),

  // Pagination and sorting
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z
    .enum(['measurement_period_start', 'metric_value', 'metric_name'])
    .default('measurement_period_start'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// BULK OPERATIONS SCHEMAS
// ============================================

export const bulkProfessionalUpdateSchema = z.object({
  professional_ids: z.array(z.string().uuid()).min(1).max(100),
  updates: professionalUpdateSchema.omit({ id: true }),
});

export const bulkCredentialExpirationCheckSchema = z.object({
  professional_ids: z.array(z.string().uuid()).optional(),
  days_ahead: z.number().int().min(1).max(365).default(30),
  credential_types: z.array(credentialTypeSchema).optional(),
  generate_alerts: z.boolean().default(true),
});

// ============================================
// IMPORT/EXPORT SCHEMAS
// ============================================

export const professionalImportSchema = z.object({
  professionals: z.array(professionalCreateSchema),
  validate_npi: z.boolean().default(true),
  skip_duplicates: z.boolean().default(true),
  send_welcome_email: z.boolean().default(false),
});

export const credentialImportSchema = z.object({
  credentials: z.array(professionalCredentialCreateSchema),
  auto_verify: z.boolean().default(false),
  skip_duplicates: z.boolean().default(true),
  generate_alerts: z.boolean().default(true),
});

// ============================================
// DASHBOARD AND ANALYTICS SCHEMAS
// ============================================

export const professionalDashboardFiltersSchema = z.object({
  date_range: z.enum(['7d', '30d', '90d', '1y', 'custom']).default('30d'),
  custom_start_date: dateSchema.optional(),
  custom_end_date: dateSchema.optional(),
  departments: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  employment_status: z.array(employmentStatusSchema).optional(),
});

export const credentialAnalyticsFiltersSchema = z.object({
  timeframe: z.enum(['current', '30d', '60d', '90d', '1y']).default('current'),
  credential_types: z.array(credentialTypeSchema).optional(),
  departments: z.array(z.string()).optional(),
  risk_level: z
    .enum(['all', 'low', 'medium', 'high', 'critical'])
    .default('all'),
});

// ============================================
// TYPE EXPORTS FOR COMPONENTS
// ============================================

export type ProfessionalCreateInput = z.infer<typeof professionalCreateSchema>;
export type ProfessionalUpdateInput = z.infer<typeof professionalUpdateSchema>;
export type ProfessionalSearchInput = z.infer<typeof professionalSearchSchema>;
export type CredentialCreateInput = z.infer<
  typeof professionalCredentialCreateSchema
>;
export type CredentialUpdateInput = z.infer<
  typeof professionalCredentialUpdateSchema
>;
export type CredentialSearchInput = z.infer<typeof credentialSearchSchema>;
export type ServiceCreateInput = z.infer<
  typeof professionalServiceCreateSchema
>;
export type ServiceUpdateInput = z.infer<
  typeof professionalServiceUpdateSchema
>;
export type MetricCreateInput = z.infer<typeof performanceMetricCreateSchema>;
export type DevelopmentCreateInput = z.infer<
  typeof professionalDevelopmentCreateSchema
>;
export type WorkflowCreateInput = z.infer<
  typeof credentialingWorkflowCreateSchema
>;
export type AlertCreateInput = z.infer<typeof credentialingAlertCreateSchema>;
