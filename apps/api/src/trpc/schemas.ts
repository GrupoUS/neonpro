/**
 * Validation Schemas for Healthcare Compliance
 * Using Valibot for type-safe validation with Brazilian healthcare standards
 */

import * as v from 'valibot';

// Brazilian CPF validation regex
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Brazilian phone validation regex
const PHONE_REGEX = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

/**
 * Patient Creation Schema
 * Includes LGPD compliance fields and Brazilian healthcare requirements
 */
export const CreatePatientSchema = v.object({
  // Basic patient information
  medicalRecordNumber: v.string([
    v.minLength(1, 'Medical record number is required'),
  ]),
  givenNames: v.array(v.string([v.minLength(1)])),
  familyName: v.string([v.minLength(1, 'Family name is required')]),
  fullName: v.string([v.minLength(1, 'Full name is required')]),
  preferredName: v.optional(v.string()),

  // Contact information
  phonePrimary: v.optional(
    v.string([v.regex(PHONE_REGEX, 'Invalid phone format')]),
  ),
  phoneSecondary: v.optional(
    v.string([v.regex(PHONE_REGEX, 'Invalid phone format')]),
  ),
  email: v.optional(v.string([v.email('Invalid email format')])),

  // Address information
  addressLine1: v.optional(v.string()),
  addressLine2: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  country: v.optional(v.string([v.value('BR')])),

  // Personal information
  birthDate: v.optional(v.date()),
  gender: v.optional(v.string()),
  maritalStatus: v.optional(v.string()),

  // Brazilian documents
  cpf: v.optional(v.string([v.regex(CPF_REGEX, 'Invalid CPF format')])),
  rg: v.optional(v.string()),
  passportNumber: v.optional(v.string()),

  // Healthcare information
  bloodType: v.optional(v.string()),
  allergies: v.optional(v.array(v.string())),
  chronicConditions: v.optional(v.array(v.string())),
  currentMedications: v.optional(v.array(v.string())),

  // Insurance information
  insuranceProvider: v.optional(v.string()),
  insuranceNumber: v.optional(v.string()),
  insurancePlan: v.optional(v.string()),

  // Emergency contact
  emergencyContactName: v.optional(v.string()),
  emergencyContactPhone: v.optional(v.string([v.regex(PHONE_REGEX)])),
  emergencyContactRelationship: v.optional(v.string()),

  // LGPD Consent (required for patient creation)
  lgpdConsentGiven: v.boolean([v.literal(true, 'LGPD consent is required')]),
  lgpdConsentVersion: v.string([v.minLength(1)]),
  dataSharingConsent: v.optional(v.any()),
  marketingConsent: v.optional(v.boolean()),
  researchConsent: v.optional(v.boolean()),

  // Communication preferences
  preferredContactMethod: v.optional(v.string()),
  communicationPreferences: v.optional(v.any()),
}); /**
 * Patient Update Schema
 * Allows partial updates while maintaining validation
 */

export const UpdatePatientSchema = v.partial(CreatePatientSchema);

/**
 * Patient Query Schema
 */
export const GetPatientSchema = v.object({
  id: v.string([v.uuid('Invalid patient ID format')]),
});

/**
 * Patient List Schema
 */
export const ListPatientsSchema = v.object({
  limit: v.optional(v.number([v.integer(), v.minValue(1), v.maxValue(100)])),
  offset: v.optional(v.number([v.integer(), v.minValue(0)])),
  search: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
});

/**
 * Appointment Creation Schema
 * Includes CFM validation and no-show prediction fields
 */
export const CreateAppointmentSchema = v.object({
  patientId: v.string([v.uuid('Invalid patient ID')]),
  professionalId: v.string([v.uuid('Invalid professional ID')]),
  serviceTypeId: v.string([v.uuid('Invalid service type ID')]),
  startTime: v.date(),
  endTime: v.date(),
  notes: v.optional(v.string()),
  priority: v.optional(v.number([v.integer(), v.minValue(1), v.maxValue(5)])),
}); /**
 * Appointment Update Schema
 */

export const UpdateAppointmentSchema = v.partial(CreateAppointmentSchema);

/**
 * Appointment Query Schema
 */
export const GetAppointmentSchema = v.object({
  id: v.string([v.uuid('Invalid appointment ID format')]),
});

/**
 * Appointment List Schema
 */
export const ListAppointmentsSchema = v.object({
  limit: v.optional(v.number([v.integer(), v.minValue(1), v.maxValue(100)])),
  offset: v.optional(v.number([v.integer(), v.minValue(0)])),
  patientId: v.optional(v.string([v.uuid()])),
  professionalId: v.optional(v.string([v.uuid()])),
  status: v.optional(v.string()),
  startDate: v.optional(v.date()),
  endDate: v.optional(v.date()),
});

/**
 * Aesthetic Scheduling Schema
 * Comprehensive validation for aesthetic procedure scheduling with Brazilian healthcare compliance
 */

/**
 * Aesthetic Procedure Scheduling Request Schema
 */
export const ScheduleAestheticProceduresSchema = v.object({
  patientId: v.string([v.uuid('Invalid patient ID')]),
  procedures: v.array(v.string([v.uuid('Invalid procedure ID')]), [
    v.minLength(1, 'At least one procedure is required'),
    v.maxLength(10, 'Maximum 10 procedures per request'),
  ]),
  preferredProfessionals: v.optional(v.array(v.string([v.uuid('Invalid professional ID')]))),
  preferredDates: v.optional(v.array(v.date(), [
    v.minLength(1, 'At least one preferred date required'),
    v.maxLength(5, 'Maximum 5 preferred dates'),
  ])),
  specialRequirements: v.optional(v.array(v.string())),
  medicalHistory: v.optional(v.object({
    allergies: v.array(v.string()),
    medications: v.array(v.string()),
    previousProcedures: v.array(v.string()),
    skinConditions: v.array(v.string()),
    contraindications: v.array(v.string()),
  })),
  urgencyLevel: v.optional(v.picklist(['low', 'medium', 'high', 'immediate'])),
  budgetRange: v.optional(v.object({
    min: v.number([v.minValue(0, 'Minimum budget must be positive')]),
    max: v.number([v.minValue(0, 'Maximum budget must be positive')]),
  })),
});

/**
 * Treatment Package Scheduling Schema
 */
export const ScheduleTreatmentPackageSchema = v.object({
  packageId: v.string([v.uuid('Invalid package ID')]),
  patientId: v.string([v.uuid('Invalid patient ID')]),
  startDate: v.date(),
  preferences: v.optional(v.object({
    preferredProfessionals: v.array(v.string([v.uuid('Invalid professional ID')])),
    timePreferences: v.optional(v.picklist(['morning', 'afternoon', 'evening'])),
    dayPreferences: v.array(v.string()),
  })),
});

/**
 * Professional Certification Validation Schema
 */
export const ValidateProfessionalCertificationsSchema = v.object({
  professionalId: v.string([v.uuid('Invalid professional ID')]),
  procedureIds: v.array(v.string([v.uuid('Invalid procedure ID')]), [
    v.minLength(1, 'At least one procedure is required'),
  ]),
});

/**
 * Room Allocation Optimization Schema
 */
export const OptimizeRoomAllocationSchema = v.object({
  appointments: v.array(v.object({
    id: v.string([v.uuid('Invalid appointment ID')]),
    procedureId: v.string([v.uuid('Invalid procedure ID')]),
    startTime: v.date(),
    endTime: v.date(),
    specialRequirements: v.array(v.string()),
  })),
});

/**
 * Contraindication Check Schema
 */
export const CheckContraindicationsSchema = v.object({
  patientId: v.string([v.uuid('Invalid patient ID')]),
  procedureIds: v.array(v.string([v.uuid('Invalid procedure ID')]), [
    v.minLength(1, 'At least one procedure is required'),
  ]),
  medicalHistory: v.optional(v.object({
    allergies: v.array(v.string()),
    medications: v.array(v.string()),
    previousProcedures: v.array(v.string()),
    skinConditions: v.array(v.string()),
    contraindications: v.array(v.string()),
    pregnancyStatus: v.optional(v.picklist(['not_pregnant', 'pregnant', 'breastfeeding'])),
  })),
});

/**
 * Duration Variable Factor Schema
 */
export const DurationVariableFactorSchema = v.object({
  factor: v.picklist(['area_size', 'complexity', 'patient_condition', 'combination_procedure']),
  impact: v.picklist(['add_minutes', 'multiply_duration']),
  value: v.number([v.minValue(0, 'Factor value must be positive')]),
  description: v.string([v.minLength(1, 'Description is required')]),
});

/**
 * Variable Duration Calculation Schema
 */
export const CalculateVariableDurationSchema = v.object({
  baseDuration: v.number([v.minValue(1, 'Base duration must be positive')]),
  factors: v.array(DurationVariableFactorSchema),
});

/**
 * Get Aesthetic Procedures Schema
 */
export const GetAestheticProceduresSchema = v.object({
  category: v.optional(v.string()),
  procedureType: v.optional(v.picklist(['injectable', 'laser', 'facial', 'body', 'surgical', 'combination'])),
  search: v.optional(v.string()),
  limit: v.optional(v.number([v.integer(), v.minValue(1), v.maxValue(100)])),
  offset: v.optional(v.number([v.integer(), v.minValue(0)])),
});

/**
 * Get Treatment Packages Schema
 */
export const GetTreatmentPackagesSchema = v.object({
  search: v.optional(v.string()),
  category: v.optional(v.string()),
  minPrice: v.optional(v.number([v.minValue(0)])),
  maxPrice: v.optional(v.number([v.minValue(0)])),
  limit: v.optional(v.number([v.integer(), v.minValue(1), v.maxValue(100)])),
  offset: v.optional(v.number([v.integer(), v.minValue(0)])),
});

/**
 * Aesthetic Procedure Details Schema
 */
export const AestheticProcedureDetailsSchema = v.object({
  id: v.string([v.uuid('Invalid procedure ID')]),
  name: v.string([v.minLength(1, 'Procedure name is required')]),
  category: v.string([v.minLength(1, 'Category is required')]),
  procedureType: v.picklist(['injectable', 'laser', 'facial', 'body', 'surgical', 'combination']),
  baseDurationMinutes: v.number([v.minValue(1, 'Duration must be positive')]),
  variableDurationFactors: v.array(DurationVariableFactorSchema),
  requiredCertifications: v.array(v.string()),
  minExperienceLevel: v.number([v.minValue(0, 'Experience level must be non-negative')]),
  contraindications: v.array(v.string()),
  aftercareInstructions: v.array(v.string()),
  recoveryPeriodDays: v.number([v.minValue(0, 'Recovery period must be non-negative')]),
  anestheticType: v.picklist(['none', 'topical', 'local', 'sedation']),
  sessionCount: v.number([v.minValue(1, 'Session count must be positive')]),
  intervalBetweenSessionsDays: v.number([v.minValue(0, 'Interval must be non-negative')]),
  specialRequirements: v.array(v.string()),
});

/**
 * Treatment Package Details Schema
 */
export const TreatmentPackageDetailsSchema = v.object({
  id: v.string([v.uuid('Invalid package ID')]),
  name: v.string([v.minLength(1, 'Package name is required')]),
  description: v.string([v.minLength(1, 'Description is required')]),
  procedures: v.array(AestheticProcedureDetailsSchema),
  totalSessions: v.number([v.minValue(1, 'Total sessions must be positive')]),
  totalDurationMinutes: v.number([v.minValue(1, 'Duration must be positive')]),
  totalPrice: v.number([v.minValue(0, 'Price must be non-negative')]),
  recoveryPeriodDays: v.number([v.minValue(0, 'Recovery period must be non-negative')]),
  recommendedIntervalWeeks: v.number([v.minValue(0, 'Interval must be non-negative')]),
  packageDiscount: v.number([v.minValue(0), v.maxValue(100, 'Discount must be between 0-100%')]),
});

// Type exports for use in routers
export type ScheduleAestheticProceduresInput = v.Input<typeof ScheduleAestheticProceduresSchema>;
export type ScheduleTreatmentPackageInput = v.Input<typeof ScheduleTreatmentPackageSchema>;
export type ValidateProfessionalCertificationsInput = v.Input<typeof ValidateProfessionalCertificationsSchema>;
export type OptimizeRoomAllocationInput = v.Input<typeof OptimizeRoomAllocationSchema>;
export type CheckContraindicationsInput = v.Input<typeof CheckContraindicationsSchema>;
export type CalculateVariableDurationInput = v.Input<typeof CalculateVariableDurationSchema>;
export type GetAestheticProceduresInput = v.Input<typeof GetAestheticProceduresSchema>;
export type GetTreatmentPackagesInput = v.Input<typeof GetTreatmentPackagesSchema>;

/**
 * LGPD Consent Schema
 */
export const CreateConsentSchema = v.object({
  patientId: v.string([v.uuid('Invalid patient ID')]),
  consentType: v.string([v.minLength(1)]),
  purpose: v.string([v.minLength(1)]),
  legalBasis: v.string([v.minLength(1)]),
  dataCategories: v.array(v.string()),
  collectionMethod: v.string([v.minLength(1)]),
  evidence: v.optional(v.any()),
});

// Type exports for use in routers
export type CreatePatientInput = v.Input<typeof CreatePatientSchema>;
export type UpdatePatientInput = v.Input<typeof UpdatePatientSchema>;
export type GetPatientInput = v.Input<typeof GetPatientSchema>;
export type ListPatientsInput = v.Input<typeof ListPatientsSchema>;
export type CreateAppointmentInput = v.Input<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = v.Input<typeof UpdateAppointmentSchema>;
export type GetAppointmentInput = v.Input<typeof GetAppointmentSchema>;
export type ListAppointmentsInput = v.Input<typeof ListAppointmentsSchema>;
export type CreateConsentInput = v.Input<typeof CreateConsentSchema>;
