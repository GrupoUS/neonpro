/**
 * Enhanced Patient Identity Router
 *
 * Provides comprehensive patient identity management with LGPD compliance
 * for Brazilian aesthetic clinics
 */

import { z } from 'zod';
import { EnhancedPatientIdentityService } from '../../services/enhanced-patient-identity-service';
import { protectedProcedure, publicProcedure, router } from '../trpc';

// Input schemas
const PatientRegistrationInput = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().regex(/^\(\d{2}\)\s*\d{4,5}-\d{4}$/),
  dateOfBirth: z.date(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  gender: z.enum(['M', 'F', 'X']).optional(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}-\d{3}$/),
    complement: z.string().optional(),
  }).optional(),
  skinType: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']).optional(),
  concerns: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string().regex(/^\(\d{2}\)\s*\d{4,5}-\d{4}$/),
    relationship: z.string(),
  }).optional(),
  lgpdConsent: z.object({
    dataProcessing: z.boolean(),
    communication: z.boolean(),
    marketing: z.boolean().default(false),
    consentDate: z.date(),
    version: z.string(),
  }),
});

const UpdatePatientInput = PatientRegistrationInput.partial().extend({
  id: z.string().uuid(),
});

const PatientVerificationInput = z.object({
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  dateOfBirth: z.date(),
  email: z.string().email().optional(),
});

const PatientQueryInput = z.object({
  search: z.string().optional(),
  skinType: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']).optional(),
  concern: z.string().optional(),
  active: z.boolean().default(true),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const LgpdDataAccessRequestInput = z.object({
  patientId: z.string().uuid(),
  requestType: z.enum(['FULL_ACCESS', 'LIMITED_ACCESS', 'DATA_PORTABILITY']),
  purpose: z.string(),
  contactEmail: z.string().email(),
});

const LgpdDataDeletionRequestInput = z.object({
  patientId: z.string().uuid(),
  reason: z.string(),
  contactEmail: z.string().email(),
  legalBasis: z.enum(['WITHDRAWAL_OF_CONSENT', 'DATA_NO_LONGER_NEEDED', 'ILLEGAL_PROCESSING']),
});

const LgpdConsentUpdateInput = z.object({
  patientId: z.string().uuid(),
  consentType: z.enum(['DATA_PROCESSING', 'COMMUNICATION', 'MARKETING']),
  granted: z.boolean(),
  version: z.string(),
});

// Initialize service
const patientIdentityService = new EnhancedPatientIdentityService();

export const enhancedPatientIdentityRouter = router({
  // Register new patient
  register: publicProcedure
    .input(PatientRegistrationInput)
    .mutation(async ({ input }) => {
      return await patientIdentityService.registerPatient(input);
    }),

  // Get patient by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      return await patientIdentityService.getPatientById(input.id);
    }),

  // Update patient information
  update: protectedProcedure
    .input(UpdatePatientInput)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await patientIdentityService.updatePatient(id, data);
    }),

  // List patients with filtering
  list: protectedProcedure
    .input(PatientQueryInput)
    .query(async ({ input }) => {
      return await patientIdentityService.listPatients(input);
    }),

  // Verify patient identity
  verify: publicProcedure
    .input(PatientVerificationInput)
    .mutation(async ({ input }) => {
      return await patientIdentityService.verifyPatientIdentity(input);
    }),

  // Handle LGPD data access request
  requestDataAccess: publicProcedure
    .input(LgpdDataAccessRequestInput)
    .mutation(async ({ input }) => {
      return await patientIdentityService.handleDataAccessRequest(input);
    }),

  // Handle LGPD data deletion request
  requestDeletion: publicProcedure
    .input(LgpdDataDeletionRequestInput)
    .mutation(async ({ input }) => {
      return await patientIdentityService.handleDataDeletionRequest(input);
    }),

  // Update LGPD consent
  updateConsent: protectedProcedure
    .input(LgpdConsentUpdateInput)
    .mutation(async ({ input }) => {
      return await patientIdentityService.updateLgpdConsent(input);
    }),

  // Get patient by CPF
  getByCpf: protectedProcedure
    .input(z.object({ cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/) }))
    .query(async ({ input }) => {
      return await patientIdentityService.getPatientByCpf(input.cpf);
    }),

  // Get patient treatment history
  getTreatmentHistory: protectedProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      return await patientIdentityService.getPatientTreatmentHistory(input.patientId, input.limit);
    }),

  // Get patient statistics
  getStats: protectedProcedure
    .query(async () => {
      return await patientIdentityService.getPatientStatistics();
    }),

  // Deactivate patient (soft delete)
  deactivate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await patientIdentityService.deactivatePatient(input.id);
    }),

  // Reactivate patient
  reactivate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await patientIdentityService.reactivatePatient(input.id);
    }),
});
