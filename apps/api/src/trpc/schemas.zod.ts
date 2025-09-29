/**
 * Validation Schemas for Healthcare Compliance (Zod v4)
 * Using Zod v4 for type-safe validation with Brazilian healthcare standards
 * Migration from Valibot to Zod v4 with healthcare compliance maintained
 */

import { z } from 'zod'

// Brazilian CPF validation regex
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

// Brazilian phone validation regex
const PHONE_REGEX = /^\(\d{2}\)\s\d{4,5}-\d{4}$/

// =====================================
// HEALTHCARE-SPECIFIC UTILITIES
// =====================================

/**
 * CPF validation utility for Zod
 */
const validateCPF = (cpf: string): boolean => {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '')
  
  // Check length
  if (cleanCPF.length !== 11) return false
  
  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cleanCPF)) return false
  
  // Validate first digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i)
  }
  const firstDigit = 11 - (sum % 11)
  if (firstDigit > 9) sum = 0
  else sum = firstDigit
  
  if (sum !== parseInt(cleanCPF[9])) return false
  
  // Validate second digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i)
  }
  const secondDigit = 11 - (sum % 11)
  if (secondDigit > 9) sum = 0
  else sum = secondDigit
  
  return sum === parseInt(cleanCPF[10])
}

/**
 * Brazilian healthcare-specific validations
 */
const validateHealthcareId = (id: string): boolean => {
  // Validate various Brazilian healthcare IDs
  const patterns = {
    cns: /^[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}$/, // Cartão Nacional de Saúde
    cnes: /^[0-9]{7}$/, // Cadastro Nacional de Estabelecimentos de Saúde
    tuss: /^[0-9]{10}$/, // TUSS procedure codes
  }
  
  return Object.values(patterns).some(pattern => pattern.test(id))
}

// =====================================
// CORE HEALTHCARE SCHEMAS
// =====================================

/**
 * Patient Creation Schema
 * Includes LGPD compliance fields and Brazilian healthcare requirements
 */
export const CreatePatientSchema = z.object({
  // Basic patient information
  medicalRecordNumber: z.string().min(1, 'Medical record number is required'),
  givenNames: z.array(z.string().min(1)),
  familyName: z.string().min(1, 'Family name is required'),
  fullName: z.string().min(1, 'Full name is required'),
  preferredName: z.string().optional(),

  // Contact information
  phonePrimary: z.string()
    .regex(PHONE_REGEX, 'Invalid phone format')
    .optional(),
  phoneSecondary: z.string()
    .regex(PHONE_REGEX, 'Invalid phone format')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional(),

  // Address information
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string()
    .refine(val => val === 'BR', 'Only Brazilian addresses are supported')
    .optional(),

  // Personal information
  birthDate: z.date().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),

  // Brazilian documents
  cpf: z.string()
    .refine(val => CPF_REGEX.test(val), 'Invalid CPF format')
    .refine(validateCPF, 'Invalid CPF checksum')
    .optional(),
  rg: z.string().optional(),
  passportNumber: z.string().optional(),

  // Healthcare information
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),

  // Insurance information
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insurancePlan: z.string().optional(),

  // Emergency contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string()
    .regex(PHONE_REGEX, 'Invalid phone format')
    .optional(),
  emergencyContactRelationship: z.string().optional(),

  // LGPD Consent (required for patient creation)
  lgpdConsentGiven: z.literal(true, 'LGPD consent is required'),
  lgpdConsentVersion: z.string().min(1, 'Consent version is required'),
  dataSharingConsent: z.any().optional(),
  marketingConsent: z.boolean().optional(),
  researchConsent: z.boolean().optional(),

  // Communication preferences
  preferredContactMethod: z.string().optional(),
  communicationPreferences: z.any().optional(),
})

/**
 * Patient Update Schema
 * Allows partial updates while maintaining validation
 */
export const UpdatePatientSchema = CreatePatientSchema.partial()

/**
 * Patient Query Schema
 */
export const GetPatientSchema = z.object({
  id: z.string().uuid('Invalid patient ID format'),
})

/**
 * Patient List Schema
 */
export const ListPatientsSchema = z.object({
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
})

/**
 * Appointment Creation Schema
 * Includes CFM validation and no-show prediction fields
 */
export const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  professionalId: z.string().uuid('Invalid professional ID'),
  serviceTypeId: z.string().uuid('Invalid service type ID'),
  startTime: z.date(),
  endTime: z.date(),
  notes: z.string().optional(),
  priority: z.number()
    .int('Priority must be an integer')
    .min(1, 'Priority must be at least 1')
    .max(5, 'Priority cannot exceed 5')
    .optional(),
})

/**
 * Appointment Update Schema
 */
export const UpdateAppointmentSchema = CreateAppointmentSchema.partial()

/**
 * Appointment Query Schema
 */
export const GetAppointmentSchema = z.object({
  id: z.string().uuid('Invalid appointment ID format'),
})

/**
 * Appointment List Schema
 */
export const ListAppointmentsSchema = z.object({
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
  patientId: z.string().uuid('Invalid patient ID').optional(),
  professionalId: z.string().uuid('Invalid professional ID').optional(),
  status: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

// =====================================
// AESTHETIC CLINIC SCHEMAS
// =====================================

/**
 * Aesthetic Procedure Scheduling Request Schema
 */
export const ScheduleAestheticProceduresSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  procedures: z.array(z.string().uuid('Invalid procedure ID'), {
    message: 'Procedure IDs must be valid UUIDs'
  })
    .min(1, 'At least one procedure is required')
    .max(10, 'Maximum 10 procedures per request'),
  preferredProfessionals: z.array(z.string().uuid('Invalid professional ID')).optional(),
  preferredDates: z.array(z.date())
    .min(1, 'At least one preferred date required')
    .max(5, 'Maximum 5 preferred dates')
    .optional(),
  specialRequirements: z.array(z.string()).optional(),
  medicalHistory: z.object({
    allergies: z.array(z.string()),
    medications: z.array(z.string()),
    previousProcedures: z.array(z.string()),
    skinConditions: z.array(z.string()),
    contraindications: z.array(z.string()),
    pregnancyStatus: z.enum(['not_pregnant', 'pregnant', 'breastfeeding', 'none', 'planning']).optional(),
  }).optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'immediate']).optional(),
  budgetRange: z.object({
    min: z.number().min(0, 'Minimum budget must be positive'),
    max: z.number().min(0, 'Maximum budget must be positive'),
  }).optional(),
})

/**
 * Treatment Package Scheduling Schema
 */
export const ScheduleTreatmentPackageSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
  patientId: z.string().uuid('Invalid patient ID'),
  startDate: z.date(),
  preferences: z.object({
    preferredProfessionals: z.array(z.string().uuid('Invalid professional ID')),
    timePreferences: z.enum(['morning', 'afternoon', 'evening']).optional(),
    dayPreferences: z.array(z.string()),
  }).optional(),
})

/**
 * Professional Certification Validation Schema
 */
export const ValidateProfessionalCertificationsSchema = z.object({
  professionalId: z.string().uuid('Invalid professional ID'),
  procedureIds: z.array(z.string().uuid('Invalid procedure ID'), {
    message: 'Procedure IDs must be valid UUIDs'
  })
    .min(1, 'At least one procedure is required'),
})

/**
 * Room Allocation Optimization Schema
 */
export const OptimizeRoomAllocationSchema = z.object({
  appointments: z.array(z.object({
    id: z.string().uuid('Invalid appointment ID'),
    procedureId: z.string().uuid('Invalid procedure ID'),
    startTime: z.date(),
    endTime: z.date(),
    specialRequirements: z.array(z.string()),
  })),
})

/**
 * Contraindication Check Schema
 */
export const CheckContraindicationsSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  procedureIds: z.array(z.string().uuid('Invalid procedure ID'), {
    message: 'Procedure IDs must be valid UUIDs'
  })
    .min(1, 'At least one procedure is required'),
  medicalHistory: z.object({
    allergies: z.array(z.string()),
    medications: z.array(z.string()),
    previousProcedures: z.array(z.string()),
    skinConditions: z.array(z.string()),
    contraindications: z.array(z.string()),
    pregnancyStatus: z.enum(['not_pregnant', 'pregnant', 'breastfeeding']).optional(),
  }).optional(),
})

/**
 * Duration Variable Factor Schema
 */
export const DurationVariableFactorSchema = z.object({
  factor: z.enum(['area_size', 'complexity', 'patient_condition', 'combination_procedure']),
  impact: z.enum(['add_minutes', 'multiply_duration']),
  value: z.number().min(0, 'Factor value must be positive'),
  description: z.string().min(1, 'Description is required'),
})

/**
 * Variable Duration Calculation Schema
 */
export const CalculateVariableDurationSchema = z.object({
  baseDuration: z.number().min(1, 'Base duration must be positive'),
  factors: z.array(DurationVariableFactorSchema),
})

/**
 * Get Aesthetic Procedures Schema
 */
export const GetAestheticProceduresSchema = z.object({
  category: z.string().optional(),
  procedureType: z.enum(['injectable', 'laser', 'facial', 'body', 'surgical', 'combination']).optional(),
  search: z.string().optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
})

/**
 * Get Treatment Packages Schema
 */
export const GetTreatmentPackagesSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
})

/**
 * Aesthetic Procedure Details Schema
 */
export const AestheticProcedureDetailsSchema = z.object({
  id: z.string().uuid('Invalid procedure ID'),
  name: z.string().min(1, 'Procedure name is required'),
  category: z.string().min(1, 'Category is required'),
  procedureType: z.enum(['injectable', 'laser', 'facial', 'body', 'surgical', 'combination']),
  baseDurationMinutes: z.number().min(1, 'Duration must be positive'),
  variableDurationFactors: z.array(DurationVariableFactorSchema),
  requiredCertifications: z.array(z.string()),
  minExperienceLevel: z.number().min(0, 'Experience level must be non-negative'),
  contraindications: z.array(z.string()),
  aftercareInstructions: z.array(z.string()),
  recoveryPeriodDays: z.number().min(0, 'Recovery period must be non-negative'),
  anestheticType: z.enum(['none', 'topical', 'local', 'sedation']),
  sessionCount: z.number().min(1, 'Session count must be positive'),
  intervalBetweenSessionsDays: z.number().min(0, 'Interval must be non-negative'),
  specialRequirements: z.array(z.string()),
})

/**
 * Treatment Package Details Schema
 */
export const TreatmentPackageDetailsSchema = z.object({
  id: z.string().uuid('Invalid package ID'),
  name: z.string().min(1, 'Package name is required'),
  description: z.string().min(1, 'Description is required'),
  procedures: z.array(AestheticProcedureDetailsSchema),
  totalSessions: z.number().min(1, 'Total sessions must be positive'),
  totalDurationMinutes: z.number().min(1, 'Duration must be positive'),
  totalPrice: z.number().min(0, 'Price must be non-negative'),
  recoveryPeriodDays: z.number().min(0, 'Recovery period must be non-negative'),
  recommendedIntervalWeeks: z.number().min(0, 'Interval must be non-negative'),
  packageDiscount: z.number()
    .min(0, 'Discount must be at least 0%')
    .max(100, 'Discount cannot exceed 100%'),
})

// =====================================
// AESTHETIC CLIENT PROFILE SCHEMAS
// =====================================

/**
 * Aesthetic Client Profile Creation Schema
 */
export const CreateAestheticClientProfileSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  skinType: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']).optional(),
  skinConditions: z.array(z.string()).optional(),
  aestheticHistory: z.array(z.string()).optional(),
  previousProcedures: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  lifestyleFactors: z.object({
    smokingStatus: z.enum(['never', 'former', 'current']),
    alcoholConsumption: z.enum(['none', 'occasional', 'moderate', 'frequent']),
    sunExposure: z.enum(['minimal', 'moderate', 'significant', 'extensive']),
    stressLevel: z.enum(['low', 'moderate', 'high', 'very_high']),
    sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
  }).optional(),
  aestheticGoals: z.array(z.string()).optional(),
  budgetRange: z.object({
    min: z.number().min(0, 'Minimum budget must be positive'),
    max: z.number().min(0, 'Maximum budget must be positive'),
  }).optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp', 'sms']).optional(),
  marketingConsent: z.boolean().optional(),
  photoConsent: z.boolean().optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().regex(PHONE_REGEX, 'Invalid phone format'),
    relationship: z.string().min(1, 'Relationship is required'),
  }).optional(),
})

/**
 * Aesthetic Client Profile Update Schema
 */
export const UpdateAestheticClientProfileSchema = CreateAestheticClientProfileSchema.partial()

/**
 * Get Aesthetic Client Profile Schema
 */
export const GetAestheticClientProfileSchema = z.object({
  id: z.string().uuid('Invalid client profile ID format'),
})

/**
 * Aesthetic Session Schema
 */
export const CreateAestheticSessionSchema = z.object({
  clientProfileId: z.string().uuid('Invalid client profile ID'),
  procedureId: z.string().uuid('Invalid procedure ID'),
  professionalId: z.string().uuid('Invalid professional ID'),
  scheduledDate: z.date(),
  duration: z.number().min(1, 'Duration must be positive'),
  notes: z.string().optional(),
  preTreatmentPhotos: z.array(z.string()).optional(),
  postTreatmentPhotos: z.array(z.string()).optional(),
  complications: z.array(z.string()).optional(),
  patientSatisfaction: z.number()
    .min(1, 'Satisfaction must be at least 1')
    .max(10, 'Satisfaction cannot exceed 10')
    .optional(),
})

/**
 * Aesthetic Treatment Schema
 */
export const CreateAestheticTreatmentSchema = z.object({
  clientProfileId: z.string().uuid('Invalid client profile ID'),
  procedureId: z.string().uuid('Invalid procedure ID'),
  professionalId: z.string().uuid('Invalid professional ID'),
  treatmentPlan: z.object({
    sessionCount: z.number().min(1, 'Session count must be positive'),
    intervalWeeks: z.number().min(0, 'Interval must be non-negative'),
    totalCost: z.number().min(0, 'Total cost must be non-negative'),
  }),
  startDate: z.date(),
  expectedCompletionDate: z.date(),
  notes: z.string().optional(),
})

/**
 * Photo Assessment Schema
 */
export const CreatePhotoAssessmentSchema = z.object({
  clientProfileId: z.string().uuid('Invalid client profile ID'),
  procedureId: z.string().uuid('Invalid procedure ID'),
  sessionNumber: z.number().min(1, 'Session number must be positive'),
  photos: z.array(z.object({
    url: z.string().url('Invalid photo URL'),
    type: z.enum(['before', 'after', 'side_profile', 'close_up']),
    angle: z.string().optional(),
    lighting: z.string().optional(),
    notes: z.string().optional(),
  })),
  assessmentNotes: z.string().optional(),
  improvementRating: z.number()
    .min(1, 'Improvement rating must be at least 1')
    .max(10, 'Improvement rating cannot exceed 10')
    .optional(),
})

/**
 * Treatment Plan Schema
 */
export const CreateTreatmentPlanSchema = z.object({
  clientProfileId: z.string().uuid('Invalid client profile ID'),
  procedures: z.array(z.object({
    procedureId: z.string().uuid('Invalid procedure ID'),
    sessionCount: z.number().min(1, 'Session count must be positive'),
    intervalWeeks: z.number().min(0, 'Interval must be non-negative'),
    notes: z.string().optional(),
  })),
  totalDuration: z.number().min(1, 'Total duration must be positive'),
  totalCost: z.number().min(0, 'Total cost must be non-negative'),
  startDate: z.date(),
  expectedCompletionDate: z.date(),
  goals: z.array(z.string()),
  contraindications: z.array(z.string()).optional(),
  aftercareInstructions: z.array(z.string()).optional(),
})

/**
 * Financial Transaction Schema
 */
export const CreateFinancialTransactionSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  appointmentId: z.string().uuid('Invalid appointment ID').optional(),
  procedureId: z.string().uuid('Invalid procedure ID').optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().default('BRL'),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'installment']),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  transactionDate: z.date(),
  description: z.string().min(1, 'Description is required'),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * Client Retention Metrics Schema
 */
export const GetClientRetentionMetricsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  procedureCategory: z.string().optional(),
  professionalId: z.string().uuid('Invalid professional ID').optional(),
})

/**
 * Revenue Analytics Schema
 */
export const GetRevenueAnalyticsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  procedureCategory: z.string().optional(),
  professionalId: z.string().uuid('Invalid professional ID').optional(),
  groupBy: z.enum(['day', 'week', 'month', 'procedure', 'professional']).optional(),
})

/**
 * Predictive Analytics Schema
 */
export const GetPredictiveAnalyticsSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID').optional(),
  procedureCategory: z.string().optional(),
  timeframe: z.enum(['30_days', '90_days', '180_days', '1_year']),
})

/**
 * Search Aesthetic Clients Schema
 */
export const SearchAestheticClientsSchema = z.object({
  name: z.string().optional(),
  skinType: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']).optional(),
  procedureType: z.enum(['injectable', 'laser', 'facial', 'body', 'surgical', 'combination']).optional(),
  lastVisitAfter: z.date().optional(),
  lastVisitBefore: z.date().optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
})

/**
 * List Aesthetic Sessions Schema
 */
export const ListAestheticSessionsSchema = z.object({
  clientProfileId: z.string().uuid('Invalid client profile ID').optional(),
  professionalId: z.string().uuid('Invalid professional ID').optional(),
  procedureId: z.string().uuid('Invalid procedure ID').optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
})

/**
 * List Photo Assessments Schema
 */
export const ListPhotoAssessmentsSchema = z.object({
  clientProfileId: z.string().uuid('Invalid client profile ID').optional(),
  procedureId: z.string().uuid('Invalid procedure ID').optional(),
  sessionNumber: z.number().min(1).optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
})

/**
 * List Financial Transactions Schema
 */
export const ListFinancialTransactionsSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID').optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'installment']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
})

/**
 * Get Treatment Catalog Schema
 */
export const GetTreatmentCatalogSchema = z.object({
  category: z.string().optional(),
  procedureType: z.enum(['injectable', 'laser', 'facial', 'body', 'surgical', 'combination']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
})

/**
 * Get Treatment Plans by Client Schema
 */
export const GetTreatmentPlansByClientSchema = z.object({
  clientProfileId: z.string().uuid('Invalid client profile ID'),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional(),
})

// =====================================
// LGPD CONSENT SCHEMAS
// =====================================

/**
 * LGPD Consent Creation Schema
 */
export const CreateConsentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  consentType: z.string().min(1, 'Consent type is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  legalBasis: z.string().min(1, 'Legal basis is required'),
  dataCategories: z.array(z.string()),
  collectionMethod: z.string().min(1, 'Collection method is required'),
  evidence: z.any().optional(),
})

// =====================================
// TYPE EXPORTS
// =====================================

// Core types
export type CreatePatientInput = z.infer<typeof CreatePatientSchema>
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>
export type GetPatientInput = z.infer<typeof GetPatientSchema>
export type ListPatientsInput = z.infer<typeof ListPatientsSchema>
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>
export type GetAppointmentInput = z.infer<typeof GetAppointmentSchema>
export type ListAppointmentsInput = z.infer<typeof ListAppointmentsSchema>
export type CreateConsentInput = z.infer<typeof CreateConsentSchema>

// Aesthetic clinic types
export type ScheduleAestheticProceduresInput = z.infer<typeof ScheduleAestheticProceduresSchema>
export type ScheduleTreatmentPackageInput = z.infer<typeof ScheduleTreatmentPackageSchema>
export type ValidateProfessionalCertificationsInput = z.infer<typeof ValidateProfessionalCertificationsSchema>
export type OptimizeRoomAllocationInput = z.infer<typeof OptimizeRoomAllocationSchema>
export type CheckContraindicationsInput = z.infer<typeof CheckContraindicationsSchema>
export type CalculateVariableDurationInput = z.infer<typeof CalculateVariableDurationSchema>
export type GetAestheticProceduresInput = z.infer<typeof GetAestheticProceduresSchema>
export type GetTreatmentPackagesInput = z.infer<typeof GetTreatmentPackagesSchema>

// Aesthetic client profile types
export type CreateAestheticClientProfileInput = z.infer<typeof CreateAestheticClientProfileSchema>
export type UpdateAestheticClientProfileInput = z.infer<typeof UpdateAestheticClientProfileSchema>
export type GetAestheticClientProfileInput = z.infer<typeof GetAestheticClientProfileSchema>
export type CreateAestheticSessionInput = z.infer<typeof CreateAestheticSessionSchema>
export type CreateAestheticTreatmentInput = z.infer<typeof CreateAestheticTreatmentSchema>
export type CreatePhotoAssessmentInput = z.infer<typeof CreatePhotoAssessmentSchema>
export type CreateTreatmentPlanInput = z.infer<typeof CreateTreatmentPlanSchema>

// Financial types
export type CreateFinancialTransactionInput = z.infer<typeof CreateFinancialTransactionSchema>
export type ListFinancialTransactionsInput = z.infer<typeof ListFinancialTransactionsSchema>

// Analytics types
export type GetClientRetentionMetricsInput = z.infer<typeof GetClientRetentionMetricsSchema>
export type GetRevenueAnalyticsInput = z.infer<typeof GetRevenueAnalyticsSchema>
export type GetPredictiveAnalyticsInput = z.infer<typeof GetPredictiveAnalyticsSchema>

// Search and list types
export type SearchAestheticClientsInput = z.infer<typeof SearchAestheticClientsSchema>
export type ListAestheticSessionsInput = z.infer<typeof ListAestheticSessionsSchema>
export type ListPhotoAssessmentsInput = z.infer<typeof ListPhotoAssessmentsSchema>
export type GetTreatmentCatalogInput = z.infer<typeof GetTreatmentCatalogSchema>
export type GetTreatmentPlansByClientInput = z.infer<typeof GetTreatmentPlansByClientSchema>