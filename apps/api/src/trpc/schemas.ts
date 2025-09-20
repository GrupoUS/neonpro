/**
 * Validation Schemas for Healthcare Compliance
 * Using Valibot for type-safe validation with Brazilian healthcare standards
 */

import * as v from "valibot";

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
    v.minLength(1, "Medical record number is required"),
  ]),
  givenNames: v.array(v.string([v.minLength(1)])),
  familyName: v.string([v.minLength(1, "Family name is required")]),
  fullName: v.string([v.minLength(1, "Full name is required")]),
  preferredName: v.optional(v.string()),

  // Contact information
  phonePrimary: v.optional(
    v.string([v.regex(PHONE_REGEX, "Invalid phone format")]),
  ),
  phoneSecondary: v.optional(
    v.string([v.regex(PHONE_REGEX, "Invalid phone format")]),
  ),
  email: v.optional(v.string([v.email("Invalid email format")])),

  // Address information
  addressLine1: v.optional(v.string()),
  addressLine2: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  country: v.optional(v.string([v.value("BR")])),

  // Personal information
  birthDate: v.optional(v.date()),
  gender: v.optional(v.string()),
  maritalStatus: v.optional(v.string()),

  // Brazilian documents
  cpf: v.optional(v.string([v.regex(CPF_REGEX, "Invalid CPF format")])),
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
  lgpdConsentGiven: v.boolean([v.literal(true, "LGPD consent is required")]),
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
  id: v.string([v.uuid("Invalid patient ID format")]),
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
  patientId: v.string([v.uuid("Invalid patient ID")]),
  professionalId: v.string([v.uuid("Invalid professional ID")]),
  serviceTypeId: v.string([v.uuid("Invalid service type ID")]),
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
  id: v.string([v.uuid("Invalid appointment ID format")]),
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
 * LGPD Consent Schema
 */
export const CreateConsentSchema = v.object({
  patientId: v.string([v.uuid("Invalid patient ID")]),
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
