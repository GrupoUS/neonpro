/**
 * Zod Validation Schemas for FHIR Patient Data
 *
 * Provides comprehensive validation for HL7 FHIR Patient resources
 * with LGPD compliance for Brazilian healthcare data protection.
 *
 * Based on HL7 FHIR R4 Patient Resource specification.
 */

import { z } from 'zod';

// Base FHIR data type schemas
export const FHIRDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid FHIR date (YYYY-MM-DD)');

export const FHIRDateTimeSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
    'Must be a valid FHIR datetime (YYYY-MM-DDTHH:mm:ss.sssZ)'
  );

export const FHIRCodeSchema = z.string().min(1, 'Code cannot be empty');
export const FHIRURISchema = z.string().url('Must be a valid URI');

// FHIR Identifier schema
export const FHIRIdentifierSchema = z.object({
  use: z.enum(['usual', 'official', 'temp', 'secondary', 'old']).optional(),
  type: z
    .object({
      coding: z
        .array(
          z.object({
            system: FHIRURISchema.optional(),
            code: FHIRCodeSchema.optional(),
            display: z.string().optional(),
          })
        )
        .optional(),
      text: z.string().optional(),
    })
    .optional(),
  system: FHIRURISchema.optional(),
  value: z.string().min(1, 'Identifier value is required'),
  period: z
    .object({
      start: FHIRDateTimeSchema.optional(),
      end: FHIRDateTimeSchema.optional(),
    })
    .optional(),
  assigner: z
    .object({
      reference: z.string().optional(),
      display: z.string().optional(),
    })
    .optional(),
});

// FHIR HumanName schema
export const FHIRHumanNameSchema = z.object({
  use: z
    .enum([
      'usual',
      'official',
      'temp',
      'nickname',
      'anonymous',
      'old',
      'maiden',
    ])
    .optional(),
  text: z.string().optional(),
  family: z.string().min(1, 'Family name is required'),
  given: z.array(z.string()).optional(),
  prefix: z.array(z.string()).optional(),
  suffix: z.array(z.string()).optional(),
  period: z
    .object({
      start: FHIRDateTimeSchema.optional(),
      end: FHIRDateTimeSchema.optional(),
    })
    .optional(),
});

// FHIR ContactPoint schema
export const FHIRContactPointSchema = z.object({
  system: z
    .enum(['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other'])
    .optional(),
  value: z.string().optional(),
  use: z.enum(['home', 'work', 'temp', 'old', 'mobile']).optional(),
  rank: z.number().int().positive().optional(),
  period: z
    .object({
      start: FHIRDateTimeSchema.optional(),
      end: FHIRDateTimeSchema.optional(),
    })
    .optional(),
});

// Brazilian phone number validation
export const BrazilianPhoneSchema = z
  .string()
  .regex(
    /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
    'Must be a valid Brazilian phone number (+55 (11) 99999-9999)'
  );

// Brazilian CPF validation
export const CPFSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Must be a valid CPF (000.000.000-00)');

// Brazilian CEP validation
export const CEPSchema = z
  .string()
  .regex(/^\d{5}-?\d{3}$/, 'Must be a valid CEP (00000-000)');

// FHIR Address schema with Brazilian extensions
export const FHIRAddressSchema = z.object({
  use: z.enum(['home', 'work', 'temp', 'old', 'billing']).optional(),
  type: z.enum(['postal', 'physical', 'both']).optional(),
  text: z.string().optional(),
  line: z.array(z.string()).optional(),
  city: z.string().min(1, 'City is required'),
  district: z.string().optional(),
  state: z
    .string()
    .min(2, 'State is required')
    .max(2, 'State must be 2 characters'),
  postalCode: CEPSchema.optional(),
  country: z.string().default('BR'),
  period: z
    .object({
      start: FHIRDateTimeSchema.optional(),
      end: FHIRDateTimeSchema.optional(),
    })
    .optional(),
});

// FHIR Patient Contact schema
export const FHIRPatientContactSchema = z.object({
  relationship: z
    .array(
      z.object({
        coding: z
          .array(
            z.object({
              system: FHIRURISchema.optional(),
              code: FHIRCodeSchema.optional(),
              display: z.string().optional(),
            })
          )
          .optional(),
        text: z.string().optional(),
      })
    )
    .optional(),
  name: FHIRHumanNameSchema.optional(),
  telecom: z.array(FHIRContactPointSchema).optional(),
  address: FHIRAddressSchema.optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  organization: z
    .object({
      reference: z.string().optional(),
      display: z.string().optional(),
    })
    .optional(),
  period: z
    .object({
      start: FHIRDateTimeSchema.optional(),
      end: FHIRDateTimeSchema.optional(),
    })
    .optional(),
});

// Main FHIR Patient schema
export const FHIRPatientSchema = z.object({
  resourceType: z.literal('Patient'),
  id: z.string().optional(),
  meta: z
    .object({
      versionId: z.string().optional(),
      lastUpdated: FHIRDateTimeSchema.optional(),
      profile: z.array(FHIRURISchema).optional(),
    })
    .optional(),
  implicitRules: FHIRURISchema.optional(),
  language: FHIRCodeSchema.optional(),

  // Patient Demographics - Required fields
  identifier: z
    .array(FHIRIdentifierSchema)
    .min(1, 'At least one identifier is required'),
  active: z.boolean().default(true),
  name: z.array(FHIRHumanNameSchema).min(1, 'At least one name is required'),
  telecom: z.array(FHIRContactPointSchema).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birthDate: FHIRDateSchema,
  deceased: z.union([z.boolean(), FHIRDateTimeSchema]).optional(),
  address: z.array(FHIRAddressSchema).optional(),
  maritalStatus: z
    .object({
      coding: z
        .array(
          z.object({
            system: FHIRURISchema.optional(),
            code: FHIRCodeSchema.optional(),
            display: z.string().optional(),
          })
        )
        .optional(),
      text: z.string().optional(),
    })
    .optional(),
  multipleBirth: z.union([z.boolean(), z.number().int().positive()]).optional(),
  photo: z
    .array(
      z.object({
        contentType: FHIRCodeSchema.optional(),
        language: FHIRCodeSchema.optional(),
        data: z.string().optional(),
        url: FHIRURISchema.optional(),
        size: z.number().int().positive().optional(),
        hash: z.string().optional(),
        title: z.string().optional(),
        creation: FHIRDateTimeSchema.optional(),
      })
    )
    .optional(),
  contact: z.array(FHIRPatientContactSchema).optional(),
  communication: z
    .array(
      z.object({
        language: z.object({
          coding: z
            .array(
              z.object({
                system: FHIRURISchema.optional(),
                code: FHIRCodeSchema.optional(),
                display: z.string().optional(),
              })
            )
            .optional(),
          text: z.string().optional(),
        }),
        preferred: z.boolean().optional(),
      })
    )
    .optional(),
  generalPractitioner: z
    .array(
      z.object({
        reference: z.string().optional(),
        display: z.string().optional(),
      })
    )
    .optional(),
  managingOrganization: z
    .object({
      reference: z.string().optional(),
      display: z.string().optional(),
    })
    .optional(),
  link: z
    .array(
      z.object({
        other: z.object({
          reference: z.string().optional(),
          display: z.string().optional(),
        }),
        type: z.enum(['replaced-by', 'replaces', 'refer', 'seealso']),
      })
    )
    .optional(),
});

// LGPD Consent schema
export const LGPDConsentSchema = z.object({
  id: z.string().optional(),
  patient_id: z.string().uuid('Must be a valid patient ID'),
  consent_type: z.enum([
    'explicit',
    'legitimate_interest',
    'vital_interest',
    'public_task',
    'legal_obligation',
    'contract',
  ]),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  data_categories: z
    .array(z.string())
    .min(1, 'At least one data category is required'),
  retention_period_years: z.number().int().min(1).max(50),
  consent_date: FHIRDateTimeSchema,
  expiration_date: FHIRDateTimeSchema.optional(),
  withdrawal_date: FHIRDateTimeSchema.optional(),
  is_active: z.boolean().default(true),
  legal_basis_article: z.string().min(1, 'Legal basis article is required'),
  processing_details: z
    .string()
    .min(20, 'Processing details must be at least 20 characters'),
  third_party_sharing: z
    .array(
      z.object({
        organization: z.string().min(1, 'Organization name is required'),
        purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
        legal_basis: z.string().min(1, 'Legal basis is required'),
      })
    )
    .optional(),
  patient_signature: z.string().optional(),
  witness_signature: z.string().optional(),
  created_at: FHIRDateTimeSchema,
  updated_at: FHIRDateTimeSchema,
});

// NeonPro Patient Registration Form schema
export const PatientRegistrationSchema = z.object({
  // Basic Demographics
  medical_record_number: z
    .string()
    .min(1, 'Medical record number is required')
    .max(20, 'Medical record number must be less than 20 characters'),

  // Name information
  family_name: z
    .string()
    .min(1, 'Family name is required')
    .max(50, 'Family name must be less than 50 characters'),
  given_names: z
    .array(z.string().min(1))
    .min(1, 'At least one given name is required'),
  preferred_name: z.string().optional(),

  // Contact information
  cpf: CPFSchema.optional(),
  rg: z.string().optional(),
  email: z.string().email('Must be a valid email address').optional(),
  phone_primary: BrazilianPhoneSchema,
  phone_secondary: BrazilianPhoneSchema.optional(),

  // Demographics
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birth_date: FHIRDateSchema,
  marital_status: z
    .enum([
      'single',
      'married',
      'divorced',
      'widowed',
      'separated',
      'domestic_partner',
      'unknown',
    ])
    .optional(),

  // Address information
  address_line1: z.string().min(1, 'Address line 1 is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z
    .string()
    .min(2, 'State is required')
    .max(2, 'State must be 2 characters'),
  postal_code: CEPSchema,
  country: z.string().default('BR'),

  // Emergency contact
  emergency_contact_name: z
    .string()
    .min(1, 'Emergency contact name is required'),
  emergency_contact_relationship: z
    .string()
    .min(1, 'Emergency contact relationship is required'),
  emergency_contact_phone: BrazilianPhoneSchema,
  emergency_contact_email: z.string().email().optional(),

  // Insurance information (optional)
  insurance_provider: z.string().optional(),
  insurance_plan: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  insurance_group_number: z.string().optional(),

  // Preferred language
  preferred_language: z.string().default('pt-BR'),

  // Medical history (basic)
  known_allergies: z.string().optional(),
  current_medications: z.string().optional(),
  medical_conditions: z.string().optional(),

  // LGPD Consent (required)
  lgpd_consent_general: z.boolean().refine((val) => val === true, {
    message: 'General consent for data processing is required',
  }),
  lgpd_consent_marketing: z.boolean().default(false),
  lgpd_consent_research: z.boolean().default(false),
  lgpd_consent_third_party: z.boolean().default(false),
});

// Patient search/filter schema
export const PatientSearchSchema = z.object({
  query: z.string().optional(),
  medical_record_number: z.string().optional(),
  cpf: CPFSchema.optional(),
  email: z.string().email().optional(),
  phone: BrazilianPhoneSchema.optional(),
  birth_date_from: FHIRDateSchema.optional(),
  birth_date_to: FHIRDateSchema.optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  active: z.boolean().optional(),
  created_from: FHIRDateTimeSchema.optional(),
  created_to: FHIRDateTimeSchema.optional(),
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().min(0).default(0),
  sort_by: z
    .enum(['name', 'created_at', 'updated_at', 'birth_date'])
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports for TypeScript inference
export type PatientRegistrationData = z.infer<typeof PatientRegistrationSchema>;
export type PatientSearchParams = z.infer<typeof PatientSearchSchema>;
export type LGPDConsentData = z.infer<typeof LGPDConsentSchema>;
export type FHIRPatientData = z.infer<typeof FHIRPatientSchema>;
