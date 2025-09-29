/**
 * Simple Zod Schemas for Healthcare Compliance
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
  medicalRecordNumber: z.string().min(1, 'Medical record number is required'),
  givenNames: z.array(z.string().min(1)),
  familyName: z.string().min(1, 'Family name is required'),
  fullName: z.string().min(1, 'Full name is required'),
  preferredName: z.string().optional(),
  phonePrimary: z.string().regex(PHONE_REGEX, 'Invalid phone format').optional(),
  phoneSecondary: z.string().regex(PHONE_REGEX, 'Invalid phone format').optional(),
  email: z.string().email('Invalid email format').optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  birthDate: z.date().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  cpf: z.string().regex(CPF_REGEX, 'Invalid CPF format').optional(),
  rg: z.string().optional(),
  passportNumber: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insurancePlan: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().regex(PHONE_REGEX).optional(),
  emergencyContactRelationship: z.string().optional(),
  lgpdConsentGiven: z.boolean().refine(val => val === true, 'LGPD consent is required'),
  lgpdConsentVersion: z.string().min(1),
  dataSharingConsent: z.any().optional(),
  marketingConsent: z.boolean().optional(),
  researchConsent: z.boolean().optional(),
  preferredContactMethod: z.string().optional(),
  communicationPreferences: z.any().optional(),
})

export const UpdatePatientSchema = CreatePatientSchema.partial()

export const GetPatientSchema = z.object({
  id: z.string().uuid('Invalid patient ID format'),
})

export const ListPatientsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
})

/**
 * Appointment Creation Schema
 */
export const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  professionalId: z.string().uuid('Invalid professional ID'),
  serviceTypeId: z.string().uuid('Invalid service type ID'),
  startTime: z.date(),
  endTime: z.date(),
  notes: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
})

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial()

export const GetAppointmentSchema = z.object({
  id: z.string().uuid('Invalid appointment ID format'),
})

export const ListAppointmentsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  patientId: z.string().uuid().optional(),
  professionalId: z.string().uuid().optional(),
  status: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

// Type exports
export type CreatePatientInput = z.infer<typeof CreatePatientSchema>
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>
export type GetPatientInput = z.infer<typeof GetPatientSchema>
export type ListPatientsInput = z.infer<typeof ListPatientsSchema>
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>
export type GetAppointmentInput = z.infer<typeof GetAppointmentSchema>
export type ListAppointmentsInput = z.infer<typeof ListAppointmentsSchema>