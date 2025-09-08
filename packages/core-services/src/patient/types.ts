import { z, } from 'zod'
import { DateSchema, EmailSchema, PatientStatus, PhoneSchema, UUIDSchema, } from '../types'
import type { BaseEntity, } from '../types'

// Patient interfaces for aesthetic clinic
export interface Patient extends BaseEntity {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: Date
  gender: Gender
  address: Address
  emergencyContact: EmergencyContact
  medicalHistory: MedicalHistory
  aestheticHistory: AestheticHistory
  allergies: Allergy[]
  medications: Medication[]
  skinAssessment: SkinAssessment
  consentForms: ConsentForm[]
  status: PatientStatus
  referralSource?: string
  notes: string
  photoConsent: boolean
  marketingConsent: boolean
  lgpdConsent: boolean
  tags: string[]
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}
export interface MedicalHistory {
  pregnancyStatus?: PregnancyStatus
  isBreastfeeding?: boolean
  hasHeartCondition: boolean
  hasBloodClottingDisorder: boolean
  hasDiabetes: boolean
  hasAutoimmune: boolean
  hasKeloidScarring: boolean
  hasSkinCancer: boolean
  hasHerpes: boolean
  hasRecentSurgery: boolean
  recentSurgeryDetails?: string
  otherConditions: string[]
}

export interface AestheticHistory {
  previousTreatments: PreviousTreatment[]
  lastBotoxDate?: Date
  lastFillerDate?: Date
  lastLaserDate?: Date
  lastChemicalPeelDate?: Date
  treatmentGoals: string[]
  concernAreas: string[]
  expectedResults: string
}

export interface PreviousTreatment {
  treatmentType: string
  date: Date
  provider: string
  result: 'excellent' | 'good' | 'fair' | 'poor'
  complications?: string
  notes?: string
}

export interface Allergy {
  allergen: string
  severity: AllergySeverity
  reaction: string
  notes?: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  prescribedBy?: string
  relevantToTreatment: boolean
  notes?: string
}
export interface SkinAssessment {
  skinType: SkinType
  skinTone: string
  skinCondition: SkinCondition[]
  hydrationLevel: HydrationLevel
  elasticity: ElasticityLevel
  sensitivity: SensitivityLevel
  acneGrade?: AcneGrade
  pigmentationIssues: string[]
  wrinkleAssessment: WrinkleAssessment
  notes: string
  assessmentDate: Date
  assessedBy: string
}

export interface WrinkleAssessment {
  forehead: WrinkleGrade
  glabella: WrinkleGrade
  crowsFeet: WrinkleGrade
  nasolabial: WrinkleGrade
  marionette: WrinkleGrade
  perioral: WrinkleGrade
}

export interface ConsentForm {
  treatmentType: string
  version: string
  signedDate: Date
  signedBy: string // patient name
  signature: string // digital signature or file URL
  witnessedBy?: string
  documentUrl: string
  isActive: boolean
}

// Enums
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum PregnancyStatus {
  NOT_PREGNANT = 'not_pregnant',
  PREGNANT = 'pregnant',
  TRYING_TO_CONCEIVE = 'trying_to_conceive',
  NOT_APPLICABLE = 'not_applicable',
}

export enum AllergySeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  ANAPHYLACTIC = 'anaphylactic',
}
export enum SkinType {
  TYPE_I = 'type_i', // Very fair, always burns, never tans
  TYPE_II = 'type_ii', // Fair, usually burns, tans minimally
  TYPE_III = 'type_iii', // Medium, sometimes burns, tans gradually
  TYPE_IV = 'type_iv', // Olive, rarely burns, tans easily
  TYPE_V = 'type_v', // Brown, very rarely burns, tans very easily
  TYPE_VI = 'type_vi', // Dark brown/black, never burns, tans very easily
}

export enum SkinCondition {
  NORMAL = 'normal',
  DRY = 'dry',
  OILY = 'oily',
  COMBINATION = 'combination',
  SENSITIVE = 'sensitive',
  ACNE_PRONE = 'acne_prone',
  MATURE = 'mature',
  ROSACEA = 'rosacea',
  HYPERPIGMENTATION = 'hyperpigmentation',
  MELASMA = 'melasma',
}

export enum HydrationLevel {
  VERY_DRY = 'very_dry',
  DRY = 'dry',
  NORMAL = 'normal',
  WELL_HYDRATED = 'well_hydrated',
}

export enum ElasticityLevel {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

export enum SensitivityLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum AcneGrade {
  GRADE_0 = 'grade_0', // Clear skin
  GRADE_1 = 'grade_1', // Mild
  GRADE_2 = 'grade_2', // Moderate
  GRADE_3 = 'grade_3', // Moderately severe
  GRADE_4 = 'grade_4', // Severe
}

export enum WrinkleGrade {
  GRADE_0 = 'grade_0', // No wrinkles
  GRADE_1 = 'grade_1', // Fine wrinkles
  GRADE_2 = 'grade_2', // Moderate wrinkles
  GRADE_3 = 'grade_3', // Deep wrinkles
  GRADE_4 = 'grade_4', // Very deep wrinkles
} // Validation schemas
export const AddressSchema = z.object({
  street: z.string().min(1,),
  city: z.string().min(1,),
  state: z.string().min(1,),
  zipCode: z.string().min(1,),
  country: z.string().min(1,),
},)

export const EmergencyContactSchema = z.object({
  name: z.string().min(2,),
  relationship: z.string().min(1,),
  phone: PhoneSchema,
  email: EmailSchema.optional(),
},)

export const AllergySchema = z.object({
  allergen: z.string().min(1,),
  severity: z.nativeEnum(AllergySeverity,),
  reaction: z.string().min(1,),
  notes: z.string().optional(),
},)

export const MedicationSchema = z.object({
  name: z.string().min(1,),
  dosage: z.string().min(1,),
  frequency: z.string().min(1,),
  prescribedBy: z.string().optional(),
  relevantToTreatment: z.boolean(),
  notes: z.string().optional(),
},)

export const CreatePatientSchema = z.object({
  firstName: z.string().min(1,).max(50,),
  lastName: z.string().min(1,).max(50,),
  email: EmailSchema,
  phone: PhoneSchema,
  dateOfBirth: DateSchema,
  gender: z.nativeEnum(Gender,),
  address: AddressSchema,
  emergencyContact: EmergencyContactSchema,
  allergies: z.array(AllergySchema,).default([],),
  medications: z.array(MedicationSchema,).default([],),
  referralSource: z.string().optional(),
  notes: z.string().default('',),
  photoConsent: z.boolean(),
  marketingConsent: z.boolean(),
  lgpdConsent: z
    .boolean()
    .refine((val,) => val === true, 'LGPD consent is required',),
  tags: z.array(z.string(),).default([],),
},)

export const UpdatePatientSchema = CreatePatientSchema.partial().extend({
  id: UUIDSchema,
  status: z.nativeEnum(PatientStatus,).optional(),
},)

export type CreatePatientData = z.infer<typeof CreatePatientSchema>
export type UpdatePatientData = z.infer<typeof UpdatePatientSchema>

// Additional types for patient management
export interface PatientFilters {
  status?: PatientStatus
  gender?: Gender
  ageRange?: {
    min: number
    max: number
  }
  skinType?: SkinType
  lastVisitRange?: {
    start: Date
    end: Date
  }
  treatmentHistory?: string[]
  tags?: string[]
  searchTerm?: string
  referralSource?: string
  hasAllergies?: boolean
  hasConditions?: boolean
}

export interface PatientStats {
  totalPatients: number
  activePatients: number
  inactivePatients: number
  newPatientsThisMonth: number
  averageAge: number
  genderDistribution: {
    male: number
    female: number
    other: number
  }
  topSkinTypes: {
    type: SkinType
    count: number
  }[]
  topTreatments: {
    treatment: string
    count: number
  }[]
  retentionRate: number
  averageLifetimeValue: number
}
