/**
 * Validation Schemas for Healthcare Compliance
 * Using Zod for type-safe validation with Brazilian healthcare standards
 */

import * as z from 'zod'

// Brazilian CPF validation regex
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

// Brazilian phone validation regex
const PHONE_REGEX = /^\(\d{2}\)\s\d{4,5}-\d{4}$/

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
  phonePrimary: z.string().regex(PHONE_REGEX, 'Invalid phone format').optional(),
  phoneSecondary: z.string().regex(PHONE_REGEX, 'Invalid phone format').optional(),
  email: z.string().email('Invalid email address'),
  
  // Date of birth with validation
  dateOfBirth: z.string().refine((date) => {
    const d = new Date(date)
    return !isNaN(d.getTime()) && d < new Date()
  }, 'Invalid date of birth'),
  
  // Gender and pronouns
  gender: z.enum(['male', 'female', 'other', 'undisclosed']).optional(),
  pronouns: z.string().optional(),
  
  // Address information
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    number: z.string().min(1, 'Street number is required'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Neighborhood is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State code is required').max(2),
    postalCode: z.string().regex(/^\d{5}-?\d{3}$/, 'Invalid postal code format'),
    country: z.string().default('Brasil'),
  }).optional(),
  
  // Emergency contact
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().regex(PHONE_REGEX, 'Invalid phone format'),
  }).optional(),
  
  // Healthcare information
  healthcare: z.object({
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    observations: z.string().optional(),
  }).optional(),
  
  // LGPD compliance
  lgpdConsent: z.object({
    dataProcessing: z.boolean(),
    marketing: z.boolean().optional(),
    shareWithPartners: z.boolean().optional(),
    consentDate: z.string().datetime(),
    version: z.string().default('1.0'),
  }),
  
  // Metadata
  source: z.enum(['web', 'mobile', 'api', 'import']).default('web'),
  referralSource: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

/**
 * Patient Update Schema
 * Similar to creation but all fields are optional
 */
export const UpdatePatientSchema = CreatePatientSchema.partial()

/**
 * Patient Search Schema
 */
export const PatientSearchSchema = z.object({
  query: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['fullName', 'dateOfBirth', 'createdAt']).default('fullName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  filters: z.object({
    gender: z.enum(['male', 'female', 'other', 'undisclosed']).optional(),
    dateOfBirthFrom: z.string().datetime().optional(),
    dateOfBirthTo: z.string().datetime().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
})

/**
 * Appointment Schema
 */
export const AppointmentSchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  type: z.enum(['consultation', 'procedure', 'follow_up', 'emergency']),
  notes: z.string().optional(),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  price: z.number().min(0).optional(),
  insurance: z.object({
    provider: z.string(),
    code: z.string().optional(),
    authorizationNumber: z.string().optional(),
  }).optional(),
})

/**
 * Medical Record Schema
 */
export const MedicalRecordSchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  type: z.enum(['consultation', 'procedure', 'exam', 'prescription', 'follow_up']),
  title: z.string().min(1),
  content: z.string().min(1),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string().url(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  confidential: z.boolean().default(false),
})

/**
 * Type exports
 */
export type CreatePatient = z.infer<typeof CreatePatientSchema>
export type UpdatePatient = z.infer<typeof UpdatePatientSchema>
export type PatientSearch = z.infer<typeof PatientSearchSchema>
export type Appointment = z.infer<typeof AppointmentSchema>
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>