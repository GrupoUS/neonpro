/**
 * Validation Helpers for Healthcare Compliance
 * ANVISA, CFM, LGPD validation utilities
 */

import { z } from "zod";

// ANVISA medical device registration validation
export function validateAnvisaRegistration(registration: string): boolean {
  // ANVISA format: XXXXXXXX-XX (8-10 digits, dash, 1-2 digits)
  const anvisaPattern = /^\d{8,10}-\d{1,2}$/;
  return anvisaPattern.test(registration);
}

// CFM professional license validation
export function validateCFMLicense(license: string, state: string): boolean {
  const cleanLicense = license.replaceAll(/\D/g, "");

  // CFM license should be 4-6 digits
  if (cleanLicense.length < 4 || cleanLicense.length > 6) {
    return false;
  }

  // State should be valid Brazilian state
  const validStates = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return validStates.includes(state.toUpperCase());
}

// LGPD consent validation
export function validateLGPDConsent(consent: {
  purpose: string;
  granted: boolean;
  granted_at: Date;
  data_types: string[];
  retention_period: number;
}): { valid: boolean; errors: string[]; } {
  const errors: string[] = [];

  if (!consent.purpose || consent.purpose.trim().length < 10) {
    errors.push("Purpose must be clearly specified (minimum 10 characters)");
  }

  if (!consent.granted) {
    errors.push("Consent must be explicitly granted");
  }

  if (!consent.granted_at || consent.granted_at > new Date()) {
    errors.push("Consent date must be valid and not in the future");
  }

  if (!consent.data_types || consent.data_types.length === 0) {
    errors.push("Data types must be specified");
  }

  if (!consent.retention_period || consent.retention_period <= 0) {
    errors.push("Retention period must be positive");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

import { HealthcareRole, HealthcareUser } from "../enterprise/security/healthcare-rbac";
import { ComplianceError, HealthcareRegulation } from "../types";

export interface ValidationContext {
  user: HealthcareUser;
  clinicId?: string;
  patientId?: string;
  resourceType?: string;
  action?: string;
  timestamp?: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
}

export interface HealthcareProfessionalInfo {
  licenseNumber: string;
  specialty: string;
  isActive: boolean;
  expirationDate?: Date;
}

export interface AccessValidationResult {
  hasAccess: boolean;
  reason?: string;
  requiredRole?: HealthcareRole;
  additionalPermissions?: string[];
}

/**
 * Validates if a user has the required healthcare professional access
 * @param user - The healthcare user object
 * @param requiredRole - The required healthcare role
 * @param clinicId - Optional clinic ID for context
 * @returns Promise<AccessValidationResult>
 */
export async function validateHealthcareProfessionalAccess(
  user: HealthcareUser,
  requiredRole?: HealthcareRole,
  clinicId?: string,
): Promise<AccessValidationResult> {
  // Check if user is authenticated
  if (!user.user_id) {
    return {
      hasAccess: false,
      reason: "User not authenticated",
    };
  }

  // Check if user is active
  if (!user.active) {
    return {
      hasAccess: false,
      reason: "User account is inactive",
    };
  }

  // Check if user has professional credentials
  if (!user.professional_credentials) {
    return {
      hasAccess: false,
      reason: "User does not have professional credentials",
    };
  }

  // Check if license is valid (not expired)
  const credentials = user.professional_credentials;
  if (credentials.license_expiry_date && new Date(credentials.license_expiry_date) < new Date()) {
    return {
      hasAccess: false,
      reason: "Professional license has expired",
    };
  }

  // Check if user has completed required security clearance
  if (!user.security_clearance.background_check_completed) {
    return {
      hasAccess: false,
      reason: "Background check not completed",
    };
  }

  if (!user.security_clearance.lgpd_training_completed) {
    return {
      hasAccess: false,
      reason: "LGPD training not completed",
    };
  }

  if (!user.security_clearance.cfm_ethics_training_completed) {
    return {
      hasAccess: false,
      reason: "CFM ethics training not completed",
    };
  }

  // Check clinic access if clinicId is provided
  if (clinicId && !user.clinic_assignments.includes(clinicId)) {
    return {
      hasAccess: false,
      reason: "User does not have access to this clinic",
    };
  }

  return {
    hasAccess: true,
  };
}

// Validate Brazilian postal code (CEP)
export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replaceAll(/\D/g, "");
  return cleanCEP.length === 8 && /^\d{8}$/.test(cleanCEP);
}

// Validate Brazilian phone number
export function validateBrazilianPhone(phone: string): boolean {
  const cleanPhone = phone.replaceAll(/\D/g, "");

  // Mobile: 11 digits (XX9XXXXXXXX)
  // Landline: 10 digits (XXXXXXXXXX)
  if (cleanPhone.length === 11) {
    // Mobile number validation
    return /^[1-9][1-9]9[0-9]{8}$/.test(cleanPhone);
  }
  if (cleanPhone.length === 10) {
    // Landline validation
    return /^[1-9][1-9][2-5][0-9]{7}$/.test(cleanPhone);
  }

  return false;
}

// Healthcare data retention validation
export function validateDataRetention(
  dataType: string,
  createdAt: Date,
  retentionPolicy: Record<string, number>,
): { expired: boolean; expiryDate: Date; daysRemaining: number; } {
  const retentionDays = retentionPolicy[dataType] || 365 * 5; // Default 5 years
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(expiryDate.getDate() + retentionDays);

  const now = new Date();
  const expired = now > expiryDate;
  const daysRemaining = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    expired,
    expiryDate,
    daysRemaining: expired ? 0 : daysRemaining,
  };
}

// Medical procedure validation schemas
export const MedicalProcedureSchema = z.object({
  code: z.string().regex(/^[0-9A-Z]{6,10}$/, "Invalid procedure code format"),
  name: z.string().min(3, "Procedure name must be at least 3 characters"),
  category: z.enum(["aesthetic", "clinical", "surgical", "diagnostic"]),
  duration_minutes: z.number().positive("Duration must be positive"),
  requires_anesthesia: z.boolean(),
  anvisa_regulated: z.boolean(),
  minimum_interval_days: z.number().nonnegative(),
});

// Treatment plan validation
export const TreatmentPlanSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID"),
  professional_id: z.string().uuid("Invalid professional ID"),
  procedures: z.array(z.string()).min(1, "At least one procedure required"),
  start_date: z.date(),
  estimated_duration_weeks: z.number().positive(),
  contraindications: z.array(z.string()),
  patient_consent: z
    .boolean()
    .refine((val) => val === true, "Patient consent required"),
  professional_notes: z.string().optional(),
});

// Appointment validation
export const AppointmentSchema = z.object({
  patient_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  procedure_id: z.string(),
  scheduled_at: z
    .date()
    .refine(
      (date) => date > new Date(),
      "Appointment must be scheduled in the future",
    ),
  duration_minutes: z.number().positive(),
  status: z.enum([
    "scheduled",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
  ]),
  clinic_room: z.string().optional(),
  pre_appointment_notes: z.string().optional(),
});

// Patient consent validation
export const PatientConsentValidationSchema = z
  .object({
    patient_id: z.string().uuid(),
    procedure_id: z.string(),
    consent_type: z.enum([
      "treatment",
      "image_use",
      "data_processing",
      "research",
    ]),
    granted: z.boolean(),
    granted_at: z.date(),
    witness_required: z.boolean(),
    witness_id: z.string().uuid().optional(),
    digital_signature: z.string().optional(),
    expiry_date: z.date().optional(),
    revocable: z.boolean().default(true),
  })
  .refine((data) => !data.witness_required || data.witness_id, {
    message: "Witness ID required when witness is mandatory",
  });

// Batch validation helper
export function validateBatch<T>(
  items: unknown[],
  schema: z.ZodSchema<T>,
): { valid: T[]; invalid: { item: unknown; errors: string[]; }[]; } {
  const valid: T[] = [];
  const invalid: { item: unknown; errors: string[]; }[] = [];

  for (const item of items) {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({
        item,
        errors: result.error.errors.map((err) => err.message),
      });
    }
  }

  return { valid, invalid };
}

// Healthcare compliance summary
export interface ComplianceSummary {
  lgpd_score: number;
  anvisa_score: number;
  cfm_score: number;
  overall_score: number;
  violations: string[];
  recommendations: string[];
}

export function generateComplianceSummary(validationResults: {
  lgpd_violations: string[];
  anvisa_violations: string[];
  cfm_violations: string[];
}): ComplianceSummary {
  const { lgpd_violations, anvisa_violations, cfm_violations } = validationResults;

  const lgpd_score = Math.max(0, 100 - lgpd_violations.length * 10);
  const anvisa_score = Math.max(0, 100 - anvisa_violations.length * 15);
  const cfm_score = Math.max(0, 100 - cfm_violations.length * 20);

  const overall_score = (lgpd_score + anvisa_score + cfm_score) / 3;

  const allViolations = [
    ...lgpd_violations.map((v) => `LGPD: ${v}`),
    ...anvisa_violations.map((v) => `ANVISA: ${v}`),
    ...cfm_violations.map((v) => `CFM: ${v}`),
  ];

  const recommendations: string[] = [];
  if (lgpd_score < 90) {
    recommendations.push("Review data processing consent mechanisms");
  }
  if (anvisa_score < 90) {
    recommendations.push("Verify medical device registrations");
  }
  if (cfm_score < 90) {
    recommendations.push("Update professional license validations");
  }

  return {
    lgpd_score,
    anvisa_score,
    cfm_score,
    overall_score,
    violations: allViolations,
    recommendations,
  };
}
