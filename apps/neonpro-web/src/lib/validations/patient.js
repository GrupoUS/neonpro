/**
 * Zod Validation Schemas for FHIR Patient Data
 *
 * Provides comprehensive validation for HL7 FHIR Patient resources
 * with LGPD compliance for Brazilian healthcare data protection.
 *
 * Based on HL7 FHIR R4 Patient Resource specification.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientSearchSchema =
  exports.PatientRegistrationSchema =
  exports.LGPDConsentSchema =
  exports.FHIRPatientSchema =
  exports.FHIRPatientContactSchema =
  exports.FHIRAddressSchema =
  exports.CEPSchema =
  exports.CPFSchema =
  exports.BrazilianPhoneSchema =
  exports.FHIRContactPointSchema =
  exports.FHIRHumanNameSchema =
  exports.FHIRIdentifierSchema =
  exports.FHIRURISchema =
  exports.FHIRCodeSchema =
  exports.FHIRDateTimeSchema =
  exports.FHIRDateSchema =
    void 0;
var zod_1 = require("zod");
// Base FHIR data type schemas
exports.FHIRDateSchema = zod_1.z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid FHIR date (YYYY-MM-DD)");
exports.FHIRDateTimeSchema = zod_1.z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
    "Must be a valid FHIR datetime (YYYY-MM-DDTHH:mm:ss.sssZ)",
  );
exports.FHIRCodeSchema = zod_1.z.string().min(1, "Code cannot be empty");
exports.FHIRURISchema = zod_1.z.string().url("Must be a valid URI");
// FHIR Identifier schema
exports.FHIRIdentifierSchema = zod_1.z.object({
  use: zod_1.z.enum(["usual", "official", "temp", "secondary", "old"]).optional(),
  type: zod_1.z
    .object({
      coding: zod_1.z
        .array(
          zod_1.z.object({
            system: exports.FHIRURISchema.optional(),
            code: exports.FHIRCodeSchema.optional(),
            display: zod_1.z.string().optional(),
          }),
        )
        .optional(),
      text: zod_1.z.string().optional(),
    })
    .optional(),
  system: exports.FHIRURISchema.optional(),
  value: zod_1.z.string().min(1, "Identifier value is required"),
  period: zod_1.z
    .object({
      start: exports.FHIRDateTimeSchema.optional(),
      end: exports.FHIRDateTimeSchema.optional(),
    })
    .optional(),
  assigner: zod_1.z
    .object({
      reference: zod_1.z.string().optional(),
      display: zod_1.z.string().optional(),
    })
    .optional(),
});
// FHIR HumanName schema
exports.FHIRHumanNameSchema = zod_1.z.object({
  use: zod_1.z
    .enum(["usual", "official", "temp", "nickname", "anonymous", "old", "maiden"])
    .optional(),
  text: zod_1.z.string().optional(),
  family: zod_1.z.string().min(1, "Family name is required"),
  given: zod_1.z.array(zod_1.z.string()).optional(),
  prefix: zod_1.z.array(zod_1.z.string()).optional(),
  suffix: zod_1.z.array(zod_1.z.string()).optional(),
  period: zod_1.z
    .object({
      start: exports.FHIRDateTimeSchema.optional(),
      end: exports.FHIRDateTimeSchema.optional(),
    })
    .optional(),
});
// FHIR ContactPoint schema
exports.FHIRContactPointSchema = zod_1.z.object({
  system: zod_1.z.enum(["phone", "fax", "email", "pager", "url", "sms", "other"]).optional(),
  value: zod_1.z.string().optional(),
  use: zod_1.z.enum(["home", "work", "temp", "old", "mobile"]).optional(),
  rank: zod_1.z.number().int().positive().optional(),
  period: zod_1.z
    .object({
      start: exports.FHIRDateTimeSchema.optional(),
      end: exports.FHIRDateTimeSchema.optional(),
    })
    .optional(),
});
// Brazilian phone number validation
exports.BrazilianPhoneSchema = zod_1.z
  .string()
  .regex(
    /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
    "Must be a valid Brazilian phone number (+55 (11) 99999-9999)",
  );
// Brazilian CPF validation
exports.CPFSchema = zod_1.z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "Must be a valid CPF (000.000.000-00)");
// Brazilian CEP validation
exports.CEPSchema = zod_1.z.string().regex(/^\d{5}-?\d{3}$/, "Must be a valid CEP (00000-000)");
// FHIR Address schema with Brazilian extensions
exports.FHIRAddressSchema = zod_1.z.object({
  use: zod_1.z.enum(["home", "work", "temp", "old", "billing"]).optional(),
  type: zod_1.z.enum(["postal", "physical", "both"]).optional(),
  text: zod_1.z.string().optional(),
  line: zod_1.z.array(zod_1.z.string()).optional(),
  city: zod_1.z.string().min(1, "City is required"),
  district: zod_1.z.string().optional(),
  state: zod_1.z.string().min(2, "State is required").max(2, "State must be 2 characters"),
  postalCode: exports.CEPSchema.optional(),
  country: zod_1.z.string().default("BR"),
  period: zod_1.z
    .object({
      start: exports.FHIRDateTimeSchema.optional(),
      end: exports.FHIRDateTimeSchema.optional(),
    })
    .optional(),
});
// FHIR Patient Contact schema
exports.FHIRPatientContactSchema = zod_1.z.object({
  relationship: zod_1.z
    .array(
      zod_1.z.object({
        coding: zod_1.z
          .array(
            zod_1.z.object({
              system: exports.FHIRURISchema.optional(),
              code: exports.FHIRCodeSchema.optional(),
              display: zod_1.z.string().optional(),
            }),
          )
          .optional(),
        text: zod_1.z.string().optional(),
      }),
    )
    .optional(),
  name: exports.FHIRHumanNameSchema.optional(),
  telecom: zod_1.z.array(exports.FHIRContactPointSchema).optional(),
  address: exports.FHIRAddressSchema.optional(),
  gender: zod_1.z.enum(["male", "female", "other", "unknown"]).optional(),
  organization: zod_1.z
    .object({
      reference: zod_1.z.string().optional(),
      display: zod_1.z.string().optional(),
    })
    .optional(),
  period: zod_1.z
    .object({
      start: exports.FHIRDateTimeSchema.optional(),
      end: exports.FHIRDateTimeSchema.optional(),
    })
    .optional(),
});
// Main FHIR Patient schema
exports.FHIRPatientSchema = zod_1.z.object({
  resourceType: zod_1.z.literal("Patient"),
  id: zod_1.z.string().optional(),
  meta: zod_1.z
    .object({
      versionId: zod_1.z.string().optional(),
      lastUpdated: exports.FHIRDateTimeSchema.optional(),
      profile: zod_1.z.array(exports.FHIRURISchema).optional(),
    })
    .optional(),
  implicitRules: exports.FHIRURISchema.optional(),
  language: exports.FHIRCodeSchema.optional(),
  // Patient Demographics - Required fields
  identifier: zod_1.z
    .array(exports.FHIRIdentifierSchema)
    .min(1, "At least one identifier is required"),
  active: zod_1.z.boolean().default(true),
  name: zod_1.z.array(exports.FHIRHumanNameSchema).min(1, "At least one name is required"),
  telecom: zod_1.z.array(exports.FHIRContactPointSchema).optional(),
  gender: zod_1.z.enum(["male", "female", "other", "unknown"]),
  birthDate: exports.FHIRDateSchema,
  deceased: zod_1.z.union([zod_1.z.boolean(), exports.FHIRDateTimeSchema]).optional(),
  address: zod_1.z.array(exports.FHIRAddressSchema).optional(),
  maritalStatus: zod_1.z
    .object({
      coding: zod_1.z
        .array(
          zod_1.z.object({
            system: exports.FHIRURISchema.optional(),
            code: exports.FHIRCodeSchema.optional(),
            display: zod_1.z.string().optional(),
          }),
        )
        .optional(),
      text: zod_1.z.string().optional(),
    })
    .optional(),
  multipleBirth: zod_1.z.union([zod_1.z.boolean(), zod_1.z.number().int().positive()]).optional(),
  photo: zod_1.z
    .array(
      zod_1.z.object({
        contentType: exports.FHIRCodeSchema.optional(),
        language: exports.FHIRCodeSchema.optional(),
        data: zod_1.z.string().optional(),
        url: exports.FHIRURISchema.optional(),
        size: zod_1.z.number().int().positive().optional(),
        hash: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        creation: exports.FHIRDateTimeSchema.optional(),
      }),
    )
    .optional(),
  contact: zod_1.z.array(exports.FHIRPatientContactSchema).optional(),
  communication: zod_1.z
    .array(
      zod_1.z.object({
        language: zod_1.z.object({
          coding: zod_1.z
            .array(
              zod_1.z.object({
                system: exports.FHIRURISchema.optional(),
                code: exports.FHIRCodeSchema.optional(),
                display: zod_1.z.string().optional(),
              }),
            )
            .optional(),
          text: zod_1.z.string().optional(),
        }),
        preferred: zod_1.z.boolean().optional(),
      }),
    )
    .optional(),
  generalPractitioner: zod_1.z
    .array(
      zod_1.z.object({
        reference: zod_1.z.string().optional(),
        display: zod_1.z.string().optional(),
      }),
    )
    .optional(),
  managingOrganization: zod_1.z
    .object({
      reference: zod_1.z.string().optional(),
      display: zod_1.z.string().optional(),
    })
    .optional(),
  link: zod_1.z
    .array(
      zod_1.z.object({
        other: zod_1.z.object({
          reference: zod_1.z.string().optional(),
          display: zod_1.z.string().optional(),
        }),
        type: zod_1.z.enum(["replaced-by", "replaces", "refer", "seealso"]),
      }),
    )
    .optional(),
});
// LGPD Consent schema
exports.LGPDConsentSchema = zod_1.z.object({
  id: zod_1.z.string().optional(),
  patient_id: zod_1.z.string().uuid("Must be a valid patient ID"),
  consent_type: zod_1.z.enum([
    "explicit",
    "legitimate_interest",
    "vital_interest",
    "public_task",
    "legal_obligation",
    "contract",
  ]),
  purpose: zod_1.z.string().min(10, "Purpose must be at least 10 characters"),
  data_categories: zod_1.z.array(zod_1.z.string()).min(1, "At least one data category is required"),
  retention_period_years: zod_1.z.number().int().min(1).max(50),
  consent_date: exports.FHIRDateTimeSchema,
  expiration_date: exports.FHIRDateTimeSchema.optional(),
  withdrawal_date: exports.FHIRDateTimeSchema.optional(),
  is_active: zod_1.z.boolean().default(true),
  legal_basis_article: zod_1.z.string().min(1, "Legal basis article is required"),
  processing_details: zod_1.z.string().min(20, "Processing details must be at least 20 characters"),
  third_party_sharing: zod_1.z
    .array(
      zod_1.z.object({
        organization: zod_1.z.string().min(1, "Organization name is required"),
        purpose: zod_1.z.string().min(10, "Purpose must be at least 10 characters"),
        legal_basis: zod_1.z.string().min(1, "Legal basis is required"),
      }),
    )
    .optional(),
  patient_signature: zod_1.z.string().optional(),
  witness_signature: zod_1.z.string().optional(),
  created_at: exports.FHIRDateTimeSchema,
  updated_at: exports.FHIRDateTimeSchema,
});
// NeonPro Patient Registration Form schema
exports.PatientRegistrationSchema = zod_1.z.object({
  // Basic Demographics
  medical_record_number: zod_1.z
    .string()
    .min(1, "Medical record number is required")
    .max(20, "Medical record number must be less than 20 characters"),
  // Name information
  family_name: zod_1.z
    .string()
    .min(1, "Family name is required")
    .max(50, "Family name must be less than 50 characters"),
  given_names: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one given name is required"),
  preferred_name: zod_1.z.string().optional(),
  // Contact information
  cpf: exports.CPFSchema.optional(),
  rg: zod_1.z.string().optional(),
  email: zod_1.z.string().email("Must be a valid email address").optional(),
  phone_primary: exports.BrazilianPhoneSchema,
  phone_secondary: exports.BrazilianPhoneSchema.optional(),
  // Demographics
  gender: zod_1.z.enum(["male", "female", "other", "unknown"]),
  birth_date: exports.FHIRDateSchema,
  marital_status: zod_1.z
    .enum(["single", "married", "divorced", "widowed", "separated", "domestic_partner", "unknown"])
    .optional(),
  // Address information
  address_line1: zod_1.z.string().min(1, "Address line 1 is required"),
  address_line2: zod_1.z.string().optional(),
  city: zod_1.z.string().min(1, "City is required"),
  state: zod_1.z.string().min(2, "State is required").max(2, "State must be 2 characters"),
  postal_code: exports.CEPSchema,
  country: zod_1.z.string().default("BR"),
  // Emergency contact
  emergency_contact_name: zod_1.z.string().min(1, "Emergency contact name is required"),
  emergency_contact_relationship: zod_1.z
    .string()
    .min(1, "Emergency contact relationship is required"),
  emergency_contact_phone: exports.BrazilianPhoneSchema,
  emergency_contact_email: zod_1.z.string().email().optional(),
  // Insurance information (optional)
  insurance_provider: zod_1.z.string().optional(),
  insurance_plan: zod_1.z.string().optional(),
  insurance_policy_number: zod_1.z.string().optional(),
  insurance_group_number: zod_1.z.string().optional(),
  // Preferred language
  preferred_language: zod_1.z.string().default("pt-BR"),
  // Medical history (basic)
  known_allergies: zod_1.z.string().optional(),
  current_medications: zod_1.z.string().optional(),
  medical_conditions: zod_1.z.string().optional(),
  // LGPD Consent (required)
  lgpd_consent_general: zod_1.z.boolean().refine((val) => val === true, {
    message: "General consent for data processing is required",
  }),
  lgpd_consent_marketing: zod_1.z.boolean().default(false),
  lgpd_consent_research: zod_1.z.boolean().default(false),
  lgpd_consent_third_party: zod_1.z.boolean().default(false),
});
// Patient search/filter schema
exports.PatientSearchSchema = zod_1.z.object({
  query: zod_1.z.string().optional(),
  medical_record_number: zod_1.z.string().optional(),
  cpf: exports.CPFSchema.optional(),
  email: zod_1.z.string().email().optional(),
  phone: exports.BrazilianPhoneSchema.optional(),
  birth_date_from: exports.FHIRDateSchema.optional(),
  birth_date_to: exports.FHIRDateSchema.optional(),
  gender: zod_1.z.enum(["male", "female", "other", "unknown"]).optional(),
  active: zod_1.z.boolean().optional(),
  created_from: exports.FHIRDateTimeSchema.optional(),
  created_to: exports.FHIRDateTimeSchema.optional(),
  limit: zod_1.z.number().int().min(1).max(100).default(25),
  offset: zod_1.z.number().int().min(0).default(0),
  sort_by: zod_1.z.enum(["name", "created_at", "updated_at", "birth_date"]).default("created_at"),
  sort_order: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
