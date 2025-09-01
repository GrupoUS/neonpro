import { z } from "zod";

// Brazilian specific validators
export const CpfSchema = z
  .string()
  .regex(
    /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    "CPF deve estar no formato XXX.XXX.XXX-XX",
  );

export const RgSchema = z
  .string()
  .regex(
    /^\d{1,2}\.\d{3}\.\d{3}-[\dXx]$/,
    "RG deve estar no formato XX.XXX.XXX-X",
  );

export const CepSchema = z
  .string()
  .regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato XXXXX-XXX");

// Patient Gender Schema
export const PatientGenderSchema = z.enum([
  "male",
  "female",
  "non_binary",
  "prefer_not_to_say",
]);

// Marital Status Schema
export const MaritalStatusSchema = z.enum([
  "single",
  "married",
  "divorced",
  "widowed",
  "separated",
  "domestic_partnership",
]);

// Blood Type Schema
export const BloodTypeSchema = z.enum([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "unknown",
]);

// Emergency Contact Schema
export const EmergencyContactSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  relationship: z
    .string()
    .min(2, "Relacionamento deve ter pelo menos 2 caracteres")
    .max(50, "Relacionamento deve ter no máximo 50 caracteres"),
  phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      "Telefone deve estar no formato (XX) XXXXX-XXXX",
    ),
  email: z.string().email("Email deve ser válido").optional(),
  is_primary: z.boolean().default(false),
});

// Address Schema
export const AddressSchema = z.object({
  id: z.string().uuid().optional(),
  street: z
    .string()
    .min(5, "Logradouro deve ter pelo menos 5 caracteres")
    .max(200, "Logradouro deve ter no máximo 200 caracteres"),
  number: z
    .string()
    .min(1, "Número é obrigatório")
    .max(10, "Número deve ter no máximo 10 caracteres"),
  complement: z
    .string()
    .max(100, "Complemento deve ter no máximo 100 caracteres")
    .optional(),
  neighborhood: z
    .string()
    .min(2, "Bairro deve ter pelo menos 2 caracteres")
    .max(100, "Bairro deve ter no máximo 100 caracteres"),
  city: z
    .string()
    .min(2, "Cidade deve ter pelo menos 2 caracteres")
    .max(100, "Cidade deve ter no máximo 100 caracteres"),
  state: z
    .string()
    .length(2, "Estado deve ter 2 caracteres (UF)")
    .regex(/^[A-Z]{2}$/, "Estado deve ser uma UF válida"),
  zip_code: CepSchema,
  country: z.string().default("Brasil"),
  is_primary: z.boolean().default(false),
  type: z.enum(["home", "work", "billing"]).default("home"),
});

// Insurance Schema
export const InsuranceSchema = z.object({
  id: z.string().uuid().optional(),
  provider_name: z
    .string()
    .min(2, "Nome do plano deve ter pelo menos 2 caracteres")
    .max(100, "Nome do plano deve ter no máximo 100 caracteres"),
  policy_number: z
    .string()
    .min(3, "Número da apólice deve ter pelo menos 3 caracteres")
    .max(50, "Número da apólice deve ter no máximo 50 caracteres"),
  group_number: z
    .string()
    .max(50, "Número do grupo deve ter no máximo 50 caracteres")
    .optional(),
  coverage_type: z.enum(["full", "partial", "emergency_only"]).default("full"),
  valid_from: z.string().date(),
  valid_until: z.string().date().optional(),
  is_active: z.boolean().default(true),
  copay_amount: z.number().min(0).optional(),
  deductible_amount: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

// Medical History Schema
export const MedicalHistorySchema = z.object({
  id: z.string().uuid().optional(),
  condition: z
    .string()
    .min(2, "Condição deve ter pelo menos 2 caracteres")
    .max(200, "Condição deve ter no máximo 200 caracteres"),
  diagnosis_date: z.string().date().optional(),
  severity: z.enum(["mild", "moderate", "severe"]).optional(),
  status: z
    .enum(["active", "resolved", "chronic", "monitoring"])
    .default("active"),
  treatment: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  physician: z.string().max(100).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Allergy Schema
export const AllergySchema = z.object({
  id: z.string().uuid().optional(),
  allergen: z
    .string()
    .min(2, "Alérgeno deve ter pelo menos 2 caracteres")
    .max(100, "Alérgeno deve ter no máximo 100 caracteres"),
  type: z.enum(["drug", "food", "environmental", "contact", "other"]),
  severity: z.enum(["mild", "moderate", "severe", "life_threatening"]),
  reaction: z.string().max(500, "Reação deve ter no máximo 500 caracteres"),
  onset_date: z.string().date().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().max(500).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Medication Schema
export const MedicationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(2, "Nome do medicamento deve ter pelo menos 2 caracteres")
    .max(200, "Nome do medicamento deve ter no máximo 200 caracteres"),
  dosage: z
    .string()
    .min(1, "Dosagem é obrigatória")
    .max(100, "Dosagem deve ter no máximo 100 caracteres"),
  frequency: z
    .string()
    .min(1, "Frequência é obrigatória")
    .max(100, "Frequência deve ter no máximo 100 caracteres"),
  route: z
    .enum(["oral", "topical", "injection", "inhalation", "rectal", "other"])
    .optional(),
  start_date: z.string().date(),
  end_date: z.string().date().optional(),
  is_active: z.boolean().default(true),
  prescribing_physician: z.string().max(100).optional(),
  indication: z.string().max(300).optional(),
  side_effects: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Patient Base Schema
export const PatientBaseSchema = z.object({
  id: z.string().uuid(),

  // Personal Information
  first_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  last_name: z
    .string()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .max(50, "Sobrenome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Sobrenome deve conter apenas letras"),
  email: z.string().email("Email deve ser válido"),
  phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      "Telefone deve estar no formato (XX) XXXXX-XXXX",
    ),
  birth_date: z.string().date(),
  gender: PatientGenderSchema,
  marital_status: MaritalStatusSchema.optional(),

  // Brazilian Documents
  cpf: CpfSchema,
  rg: RgSchema.optional(),
  sus_number: z
    .string()
    .regex(/^\d{15}$/, "Número do SUS deve ter 15 dígitos")
    .optional(),

  // Contact Information
  addresses: z
    .array(AddressSchema)
    .min(1, "Pelo menos um endereço é obrigatório"),
  emergency_contacts: z.array(EmergencyContactSchema),

  // Medical Information
  blood_type: BloodTypeSchema.optional(),
  height: z.number().min(50).max(250).optional(), // cm
  weight: z.number().min(20).max(300).optional(), // kg
  allergies: z.array(AllergySchema).default([]),
  medications: z.array(MedicationSchema).default([]),
  medical_history: z.array(MedicalHistorySchema).default([]),

  // Insurance
  insurance_plans: z.array(InsuranceSchema).default([]),

  // Professional Relationship
  clinic_id: z.string().uuid(),
  primary_physician_id: z.string().uuid().optional(),
  referred_by: z.string().max(100).optional(),

  // Status
  is_active: z.boolean().default(true),
  patient_number: z.string().optional(), // Internal clinic patient number

  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),

  // LGPD Compliance Fields
  lgpd_consent_date: z.string().datetime(),
  lgpd_consent_version: z.string(),
  lgpd_data_retention_date: z.string().datetime(),
  marketing_consent: z.boolean().default(false),
  data_sharing_consent: z.boolean().default(false),

  // Notes and Preferences
  notes: z.string().max(2000).optional(),
  communication_preferences: z
    .object({
      email_notifications: z.boolean().default(true),
      sms_notifications: z.boolean().default(true),
      appointment_reminders: z.boolean().default(true),
      marketing_communications: z.boolean().default(false),
      preferred_contact_time: z
        .enum(["morning", "afternoon", "evening", "anytime"])
        .default("anytime"),
    })
    .optional(),
});

// Patient Query Schema
export const PatientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  clinic_id: z.string().uuid().optional(),
  is_active: z.coerce.boolean().optional(),
  gender: PatientGenderSchema.optional(),
  age_min: z.coerce.number().min(0).max(120).optional(),
  age_max: z.coerce.number().min(0).max(120).optional(),
  has_insurance: z.coerce.boolean().optional(),
  physician_id: z.string().uuid().optional(),
  created_from: z.string().date().optional(),
  created_to: z.string().date().optional(),
  sort_by: z
    .enum(["name", "created_at", "last_appointment", "age"])
    .default("name"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});

// Create Patient Schema
export const CreatePatientSchema = z.object({
  first_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  last_name: z
    .string()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .max(50, "Sobrenome deve ter no máximo 50 caracteres"),
  email: z.string().email("Email deve ser válido"),
  phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      "Telefone deve estar no formato (XX) XXXXX-XXXX",
    ),
  birth_date: z.string().date(),
  gender: PatientGenderSchema,
  cpf: CpfSchema,
  clinic_id: z.string().uuid(),

  // Required LGPD consent
  lgpd_consent: z
    .boolean()
    .refine((val) => val === true, "Consentimento LGPD é obrigatório"),

  // Optional fields
  rg: RgSchema.optional(),
  marital_status: MaritalStatusSchema.optional(),
  addresses: z
    .array(AddressSchema)
    .min(1, "Pelo menos um endereço é obrigatório"),
  emergency_contacts: z.array(EmergencyContactSchema).optional().default([]),
  blood_type: BloodTypeSchema.optional(),
  allergies: z.array(AllergySchema).optional().default([]),
  medications: z.array(MedicationSchema).optional().default([]),
  insurance_plans: z.array(InsuranceSchema).optional().default([]),
  referred_by: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  marketing_consent: z.boolean().default(false),
  communication_preferences: z
    .object({
      email_notifications: z.boolean().default(true),
      sms_notifications: z.boolean().default(true),
      appointment_reminders: z.boolean().default(true),
      marketing_communications: z.boolean().default(false),
      preferred_contact_time: z
        .enum(["morning", "afternoon", "evening", "anytime"])
        .default("anytime"),
    })
    .optional(),
});

// Update Patient Schema
export const UpdatePatientSchema = z.object({
  first_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .optional(),
  last_name: z
    .string()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .max(50, "Sobrenome deve ter no máximo 50 caracteres")
    .optional(),
  email: z.string().email("Email deve ser válido").optional(),
  phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      "Telefone deve estar no formato (XX) XXXXX-XXXX",
    )
    .optional(),
  birth_date: z.string().date().optional(),
  gender: PatientGenderSchema.optional(),
  marital_status: MaritalStatusSchema.optional(),
  rg: RgSchema.optional(),
  sus_number: z
    .string()
    .regex(/^\d{15}$/, "Número do SUS deve ter 15 dígitos")
    .optional(),
  addresses: z.array(AddressSchema).optional(),
  emergency_contacts: z.array(EmergencyContactSchema).optional(),
  blood_type: BloodTypeSchema.optional(),
  height: z.number().min(50).max(250).optional(),
  weight: z.number().min(20).max(300).optional(),
  allergies: z.array(AllergySchema).optional(),
  medications: z.array(MedicationSchema).optional(),
  medical_history: z.array(MedicalHistorySchema).optional(),
  insurance_plans: z.array(InsuranceSchema).optional(),
  primary_physician_id: z.string().uuid().optional(),
  referred_by: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  marketing_consent: z.boolean().optional(),
  data_sharing_consent: z.boolean().optional(),
  communication_preferences: z
    .object({
      email_notifications: z.boolean().default(true),
      sms_notifications: z.boolean().default(true),
      appointment_reminders: z.boolean().default(true),
      marketing_communications: z.boolean().default(false),
      preferred_contact_time: z
        .enum(["morning", "afternoon", "evening", "anytime"])
        .default("anytime"),
    })
    .optional(),
});

// Patient Response Schemas
export const PatientResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      patient: PatientBaseSchema,
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      details: z.record(z.<unknown>()).optional(),
    })
    .optional(),
});

export const PatientsListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      patients: z.array(PatientBaseSchema),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        total_pages: z.number(),
        has_next: z.boolean(),
        has_prev: z.boolean(),
      }),
      filters_applied: z.record(z.<unknown>()).optional(),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      details: z.record(z.<unknown>()).optional(),
    })
    .optional(),
});

// Patient Statistics Schema
export const PatientStatsSchema = z.object({
  total_patients: z.number(),
  active_patients: z.number(),
  inactive_patients: z.number(),
  new_patients_this_month: z.number(),
  average_age: z.number(),
  gender_distribution: z.object({
    male: z.number(),
    female: z.number(),
    non_binary: z.number(),
    prefer_not_to_say: z.number(),
  }),
  patients_with_insurance: z.number(),
  patients_by_clinic: z.array(
    z.object({
      clinic_id: z.string().uuid(),
      clinic_name: z.string(),
      patient_count: z.number(),
    }),
  ),
});

// LGPD Data Export Schema
export const PatientDataExportSchema = z.object({
  patient_id: z.string().uuid(),
  export_format: z.enum(["json", "pdf"]).default("pdf"),
  include_medical_history: z.boolean().default(true),
  include_appointments: z.boolean().default(true),
  include_files: z.boolean().default(false),
});

export const PatientDataExportResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      download_url: z.string().url(),
      expires_at: z.string().datetime(),
      file_size: z.number(),
      format: z.enum(["json", "pdf"]),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      details: z.record(z.<unknown>()).optional(),
    })
    .optional(),
});

// Type exports
export type PatientGender = z.infer<typeof PatientGenderSchema>;
export type MaritalStatus = z.infer<typeof MaritalStatusSchema>;
export type BloodType = z.infer<typeof BloodTypeSchema>;
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Insurance = z.infer<typeof InsuranceSchema>;
export type MedicalHistory = z.infer<typeof MedicalHistorySchema>;
export type Allergy = z.infer<typeof AllergySchema>;
export type Medication = z.infer<typeof MedicationSchema>;
export type PatientBase = z.infer<typeof PatientBaseSchema>;
export type PatientQuery = z.infer<typeof PatientQuerySchema>;
export type CreatePatient = z.infer<typeof CreatePatientSchema>;
export type UpdatePatient = z.infer<typeof UpdatePatientSchema>;
export type PatientResponse = z.infer<typeof PatientResponseSchema>;
export type PatientsListResponse = z.infer<typeof PatientsListResponseSchema>;
export type PatientStats = z.infer<typeof PatientStatsSchema>;
export type PatientDataExport = z.infer<typeof PatientDataExportSchema>;
export type PatientDataExportResponse = z.infer<
  typeof PatientDataExportResponseSchema
>;
