/**
 * tRPC Contract: Patients Router
 * Healthcare Domain: Patient Management APIs
 * LGPD Compliance: All procedures require patient consent validation
 */

import { z } from 'zod';
import { procedure, router } from '../trpc-setup';

// Valibot Schema Imports (will be implemented)
import {
  PatientIdSchema,
  CreatePatientSchema,
  UpdatePatientSchema,
  PatientSchema,
  PaginationSchema,
  PatientFilterSchema
} from '@neonpro/types/validation';

/**
 * Patients Router Contract
 * All procedures include LGPD audit middleware
 */
export const patientsRouter = router({
  
  /**
   * List Patients with Pagination
   * LGPD: Logs all patient data access
   * CFM: Validates medical professional access
   */
  list: procedure
    .input(z.object({
      pagination: PaginationSchema,
      filters: PatientFilterSchema.optional()
    }))
    .output(z.object({
      patients: z.array(PatientSchema),
      totalCount: z.number(),
      hasNextPage: z.boolean(),
      auditId: z.string() // LGPD compliance
    }))
    .query(),

  /**
   * Get Single Patient
   * LGPD: Patient consent verification required
   * CFM: Medical professional license validation
   */
  getById: procedure
    .input(z.object({
      patientId: PatientIdSchema
    }))
    .output(z.object({
      patient: PatientSchema,
      consentStatus: z.enum(['ACTIVE', 'WITHDRAWN', 'PENDING']),
      auditId: z.string()
    }))
    .query(),

  /**
   * Create New Patient
   * LGPD: Consent collection mandatory
   * ANVISA: Medical data validation
   */
  create: procedure
    .input(z.object({
      patientData: CreatePatientSchema,
      lgpdConsent: z.object({
        consentGiven: z.boolean(),
        consentTimestamp: z.date(),
        ipAddress: z.string(),
        userAgent: z.string()
      })
    }))
    .output(z.object({
      patient: PatientSchema,
      consentId: z.string(),
      auditId: z.string()
    }))
    .mutation(),

  /**
   * Update Patient Information
   * LGPD: Data modification audit trail
   * CFM: Professional authorization required
   */
  update: procedure
    .input(z.object({
      patientId: PatientIdSchema,
      updates: UpdatePatientSchema,
      updateReason: z.string().min(10) // CFM requirement
    }))
    .output(z.object({
      patient: PatientSchema,
      changeLog: z.array(z.object({
        field: z.string(),
        oldValue: z.string().optional(),
        newValue: z.string(),
        timestamp: z.date()
      })),
      auditId: z.string()
    }))
    .mutation(),

  /**
   * Delete Patient (LGPD Compliance)
   * LGPD: Right to deletion, complete data removal
   * Audit: Permanent deletion log
   */
  delete: procedure
    .input(z.object({
      patientId: PatientIdSchema,
      deletionReason: z.enum(['PATIENT_REQUEST', 'DATA_RETENTION_POLICY', 'CONSENT_WITHDRAWN']),
      confirmationCode: z.string() // Additional security
    }))
    .output(z.object({
      success: z.boolean(),
      deletionId: z.string(),
      deletedAt: z.date(),
      auditId: z.string()
    }))
    .mutation(),

  /**
   * Search Patients
   * LGPD: Search query logging for audit
   * Performance: Optimized for mobile usage
   */
  search: procedure
    .input(z.object({
      query: z.string().min(2),
      filters: PatientFilterSchema.optional(),
      pagination: PaginationSchema
    }))
    .output(z.object({
      results: z.array(PatientSchema),
      searchId: z.string(), // Performance tracking
      totalCount: z.number(),
      auditId: z.string()
    }))
    .query()

});

/**
 * Type Inference for Frontend
 * Automatic TypeScript types from procedures
 */
export type PatientsRouter = typeof patientsRouter;
export type PatientsProcedures = keyof PatientsRouter['_def']['procedures'];