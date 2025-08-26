import { z } from "zod";

// Brazilian Professional Registration Schemas
export const CrmSchema = z
  .string()
  .regex(/^\d{4,6}\/[A-Z]{2}$/, "CRM deve estar no formato XXXXXX/UF");

export const CroSchema = z
  .string()
  .regex(/^\d{4,6}\/[A-Z]{2}$/, "CRO deve estar no formato XXXXXX/UF");

export const CreSchema = z
  .string()
  .regex(/^\d{4,6}\/[A-Z]{2}$/, "CRE deve estar no formato XXXXXX/UF");

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

// Professional Specialization Schema
export const SpecializationSchema = z.enum([
  // Medicine
  "medicina_geral",
  "cardiologia",
  "dermatologia",
  "endocrinologia",
  "ginecologia",
  "neurologia",
  "ortopedia",
  "pediatria",
  "psiquiatria",
  "urologia",

  // Aesthetic Medicine
  "medicina_estetica",
  "cirurgia_plastica",
  "harmonizacao_facial",
  "tratamentos_corporais",

  // Dentistry
  "odontologia_geral",
  "ortodontia",
  "implantodontia",
  "periodontia",
  "endodontia",
  "protese_dentaria",

  // Nursing
  "enfermagem",
  "enfermagem_estetica",

  // Physical Therapy
  "fisioterapia",
  "fisioterapia_dermatofuncional",

  // Nutrition
  "nutricao",
  "nutricao_estetica",

  // Psychology
  "psicologia",
  "psicologia_clinica",

  // Other
  "biomedicina",
  "farmacia",
  "educacao_fisica",
  "other",
]);

// Professional Status Schema
export const ProfessionalStatusSchema = z.enum([
  "active", // Ativo
  "inactive", // Inativo
  "suspended", // Suspenso
  "pending", // Pendente de aprovação
  "vacation", // Férias
  "sick_leave", // Licença médica
]);

// Professional Type Schema
export const ProfessionalTypeSchema = z.enum([
  "doctor", // Médico
  "dentist", // Dentista
  "nurse", // Enfermeiro(a)
  "physiotherapist", // Fisioterapeuta
  "nutritionist", // Nutricionista
  "psychologist", // Psicólogo(a)
  "aesthetician", // Esteticista
  "other", // Outro
]);

// Work Schedule Schema
export const WorkingHoursSchema = z.object({
  day_of_week: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:MM"),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:MM"),
  break_start: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  break_end: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  is_available: z.boolean().default(true),
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
  complement: z.string().max(100).optional(),
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
  zip_code: z
    .string()
    .regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato XXXXX-XXX"),
  country: z.string().default("Brasil"),
});

// Bank Account Schema (for payments)
export const BankAccountSchema = z.object({
  id: z.string().uuid().optional(),
  bank_code: z.string().regex(/^\d{3}$/, "Código do banco deve ter 3 dígitos"),
  bank_name: z.string(),
  agency: z.string().regex(/^\d{4}$/, "Agência deve ter 4 dígitos"),
  account_number: z
    .string()
    .min(5, "Número da conta deve ter pelo menos 5 caracteres")
    .max(20, "Número da conta deve ter no máximo 20 caracteres"),
  account_type: z.enum(["checking", "savings"]).default("checking"),
  pix_key: z.string().optional(),
  pix_type: z.enum(["cpf", "email", "phone", "random"]).optional(),
  is_primary: z.boolean().default(false),
});

// Professional Certificate/License Schema
export const ProfessionalLicenseSchema = z.object({
  id: z.string().uuid().optional(),
  license_type: z.enum([
    "crm",
    "cro",
    "cre",
    "coren",
    "crefito",
    "crn",
    "other",
  ]),
  license_number: z
    .string()
    .min(4, "Número do registro deve ter pelo menos 4 caracteres")
    .max(20, "Número do registro deve ter no máximo 20 caracteres"),
  issuing_state: z
    .string()
    .length(2, "Estado deve ter 2 caracteres (UF)")
    .regex(/^[A-Z]{2}$/, "Estado deve ser uma UF válida"),
  issue_date: z.string().date(),
  expiry_date: z.string().date().optional(),
  is_active: z.boolean().default(true),
  verification_status: z
    .enum(["pending", "verified", "rejected"])
    .default("pending"),
  verified_at: z.string().datetime().optional(),
  document_url: z.string().url().optional(),
});

// Professional Service Schema
export const ProfessionalServiceSchema = z.object({
  id: z.string().uuid().optional(),
  service_id: z.string().uuid(),
  service_name: z.string(),
  category: z.string(),
  base_price: z.number().min(0),
  duration_minutes: z.number().min(15).max(480),
  is_active: z.boolean().default(true),
  experience_years: z.number().min(0).optional(),
  certification_required: z.boolean().default(false),
  anvisa_compliant: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

// Professional Rating Schema
export const ProfessionalRatingSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  is_anonymous: z.boolean().default(false),
  created_at: z.string().datetime(),
  response: z.string().max(1000).optional(),
  response_at: z.string().datetime().optional(),
});

// Professional Base Schema
export const ProfessionalBaseSchema = z.object({
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
  mobile_phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      "Celular deve estar no formato (XX) XXXXX-XXXX",
    )
    .optional(),
  birth_date: z.string().date(),
  gender: z
    .enum(["male", "female", "non_binary", "prefer_not_to_say"])
    .optional(),

  // Brazilian Documents
  cpf: CpfSchema,
  rg: RgSchema,

  // Professional Information
  type: ProfessionalTypeSchema,
  specializations: z
    .array(SpecializationSchema)
    .min(1, "Pelo menos uma especialização é obrigatória"),
  licenses: z
    .array(ProfessionalLicenseSchema)
    .min(1, "Pelo menos um registro profissional é obrigatório"),

  // Status and Availability
  status: ProfessionalStatusSchema.default("pending"),
  is_available: z.boolean().default(true),
  accepts_new_patients: z.boolean().default(true),

  // Professional Profile
  bio: z.string().max(2000).optional(),
  experience_years: z.number().min(0).max(70).optional(),
  education: z
    .array(
      z.object({
        institution: z.string().max(200),
        degree: z.string().max(100),
        field: z.string().max(100),
        graduation_year: z.number().min(1950).max(new Date().getFullYear()),
        is_primary: z.boolean().default(false),
      }),
    )
    .default([]),

  // Languages spoken
  languages: z
    .array(
      z.enum([
        "portuguese",
        "english",
        "spanish",
        "french",
        "italian",
        "german",
        "other",
      ]),
    )
    .default(["portuguese"]),

  // Contact Information
  addresses: z.array(AddressSchema).default([]),
  website: z.string().url().optional(),
  social_media: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),

  // Work Schedule
  working_hours: z.array(WorkingHoursSchema).default([]),
  consultation_duration: z.number().min(15).max(180).default(60), // minutes
  buffer_time: z.number().min(0).max(60).default(15), // minutes between appointments

  // Services and Pricing
  services: z.array(ProfessionalServiceSchema).default([]),
  consultation_fee: z.number().min(0).optional(),
  accepts_insurance: z.boolean().default(false),
  accepted_insurance_plans: z.array(z.string()).default([]),

  // Financial Information
  bank_accounts: z.array(BankAccountSchema).default([]),
  commission_rate: z.number().min(0).max(100).optional(), // percentage

  // Ratings and Reviews
  ratings: z.array(ProfessionalRatingSchema).default([]),
  average_rating: z.number().min(0).max(5).default(0),
  total_ratings: z.number().min(0).default(0),

  // Clinical Information
  clinic_id: z.string().uuid(),
  clinic_name: z.string(),
  room_number: z.string().max(20).optional(),

  // System Information
  user_id: z.string().uuid(), // Reference to auth user
  is_verified: z.boolean().default(false),
  verification_date: z.string().datetime().optional(),

  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_active: z.string().datetime().optional(),

  // LGPD Compliance
  lgpd_consent_date: z.string().datetime(),
  lgpd_consent_version: z.string(),
  data_retention_date: z.string().datetime(),
  marketing_consent: z.boolean().default(false),

  // Professional Photo
  profile_photo_url: z.string().url().optional(),

  // Additional Notes
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
});

// Professional Query Schema
export const ProfessionalQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),

  // Filters
  search: z.string().max(100).optional(),
  clinic_id: z.string().uuid().optional(),
  type: ProfessionalTypeSchema.optional(),
  specialization: SpecializationSchema.optional(),
  status: ProfessionalStatusSchema.optional(),
  is_available: z.coerce.boolean().optional(),
  accepts_new_patients: z.coerce.boolean().optional(),
  accepts_insurance: z.coerce.boolean().optional(),
  is_verified: z.coerce.boolean().optional(),

  // Experience and rating filters
  min_experience: z.coerce.number().min(0).optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),

  // Date filters
  created_from: z.string().date().optional(),
  created_to: z.string().date().optional(),

  // Availability filters
  available_date: z.string().date().optional(),
  available_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),

  // Sorting
  sort_by: z
    .enum([
      "name",
      "created_at",
      "experience_years",
      "average_rating",
      "total_ratings",
      "last_active",
    ])
    .default("name"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});

// Create Professional Schema
export const CreateProfessionalSchema = z.object({
  // Personal Information
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

  // Documents
  cpf: CpfSchema,
  rg: RgSchema,

  // Professional Information
  type: ProfessionalTypeSchema,
  specializations: z.array(SpecializationSchema).min(1),
  licenses: z.array(ProfessionalLicenseSchema).min(1),

  // Clinic Assignment
  clinic_id: z.string().uuid(),

  // Profile
  bio: z.string().max(2000).optional(),
  experience_years: z.number().min(0).max(70).optional(),
  consultation_fee: z.number().min(0).optional(),

  // Working hours
  working_hours: z.array(WorkingHoursSchema).optional(),
  consultation_duration: z.number().min(15).max(180).default(60),

  // Required LGPD consent
  lgpd_consent: z
    .boolean()
    .refine((val) => val === true, "Consentimento LGPD é obrigatório"),
  marketing_consent: z.boolean().default(false),

  // Optional fields
  addresses: z.array(AddressSchema).optional(),
  services: z.array(ProfessionalServiceSchema).optional(),
  education: z
    .array(
      z.object({
        institution: z.string().max(200),
        degree: z.string().max(100),
        field: z.string().max(100),
        graduation_year: z.number().min(1950).max(new Date().getFullYear()),
      }),
    )
    .optional(),
  languages: z
    .array(
      z.enum([
        "portuguese",
        "english",
        "spanish",
        "french",
        "italian",
        "german",
        "other",
      ]),
    )
    .default(["portuguese"]),
  notes: z.string().max(2000).optional(),
});

// Update Professional Schema
export const UpdateProfessionalSchema = z.object({
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
  mobile_phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      "Celular deve estar no formato (XX) XXXXX-XXXX",
    )
    .optional(),

  specializations: z.array(SpecializationSchema).optional(),
  status: ProfessionalStatusSchema.optional(),
  is_available: z.boolean().optional(),
  accepts_new_patients: z.boolean().optional(),

  bio: z.string().max(2000).optional(),
  experience_years: z.number().min(0).max(70).optional(),
  consultation_fee: z.number().min(0).optional(),
  accepts_insurance: z.boolean().optional(),
  accepted_insurance_plans: z.array(z.string()).optional(),

  working_hours: z.array(WorkingHoursSchema).optional(),
  consultation_duration: z.number().min(15).max(180).optional(),
  buffer_time: z.number().min(0).max(60).optional(),

  addresses: z.array(AddressSchema).optional(),
  services: z.array(ProfessionalServiceSchema).optional(),
  bank_accounts: z.array(BankAccountSchema).optional(),

  website: z.string().url().optional(),
  social_media: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),

  profile_photo_url: z.string().url().optional(),
  room_number: z.string().max(20).optional(),
  languages: z
    .array(
      z.enum([
        "portuguese",
        "english",
        "spanish",
        "french",
        "italian",
        "german",
        "other",
      ]),
    )
    .optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  marketing_consent: z.boolean().optional(),
});

// Professional Availability Schema
export const ProfessionalAvailabilitySchema = z.object({
  professional_id: z.string().uuid(),
  date: z.string().date(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  is_available: z.boolean().default(true),
  reason: z.string().max(200).optional(), // vacation, sick leave, etc.
});

// Response Schemas
export const ProfessionalResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      professional: ProfessionalBaseSchema,
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      details: z.record(z.any()).optional(),
    })
    .optional(),
});

export const ProfessionalsListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      professionals: z.array(ProfessionalBaseSchema),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        total_pages: z.number(),
        has_next: z.boolean(),
        has_prev: z.boolean(),
      }),
      summary: z
        .object({
          total: z.number(),
          by_type: z.record(z.number()),
          by_specialization: z.record(z.number()),
          by_status: z.record(z.number()),
          average_rating: z.number(),
          verified_count: z.number(),
        })
        .optional(),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      details: z.record(z.any()).optional(),
    })
    .optional(),
});

// Statistics Schema
export const ProfessionalStatsSchema = z.object({
  total_professionals: z.number(),
  active_professionals: z.number(),
  verified_professionals: z.number(),
  by_specialization: z.record(z.number()),
  by_clinic: z.array(
    z.object({
      clinic_id: z.string().uuid(),
      clinic_name: z.string(),
      professional_count: z.number(),
    }),
  ),
  average_experience: z.number(),
  average_rating: z.number(),
  top_rated: z.array(
    z.object({
      professional_id: z.string().uuid(),
      name: z.string(),
      rating: z.number(),
    }),
  ),
});

// Type exports
export type Specialization = z.infer<typeof SpecializationSchema>;
export type ProfessionalStatus = z.infer<typeof ProfessionalStatusSchema>;
export type ProfessionalType = z.infer<typeof ProfessionalTypeSchema>;
export type WorkingHours = z.infer<typeof WorkingHoursSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type BankAccount = z.infer<typeof BankAccountSchema>;
export type ProfessionalLicense = z.infer<typeof ProfessionalLicenseSchema>;
export type ProfessionalService = z.infer<typeof ProfessionalServiceSchema>;
export type ProfessionalRating = z.infer<typeof ProfessionalRatingSchema>;
export type ProfessionalBase = z.infer<typeof ProfessionalBaseSchema>;
export type ProfessionalQuery = z.infer<typeof ProfessionalQuerySchema>;
export type CreateProfessional = z.infer<typeof CreateProfessionalSchema>;
export type UpdateProfessional = z.infer<typeof UpdateProfessionalSchema>;
export type ProfessionalAvailability = z.infer<
  typeof ProfessionalAvailabilitySchema
>;
export type ProfessionalResponse = z.infer<typeof ProfessionalResponseSchema>;
export type ProfessionalsListResponse = z.infer<
  typeof ProfessionalsListResponseSchema
>;
export type ProfessionalStats = z.infer<typeof ProfessionalStatsSchema>;
