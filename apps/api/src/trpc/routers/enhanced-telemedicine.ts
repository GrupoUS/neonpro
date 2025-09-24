/**
 * Enhanced Telemedicine Router
 *
 * Provides comprehensive telemedicine services for Brazilian aesthetic clinics
 * with CFM compliance and LGPD data protection
 */

import { z } from 'zod';
import { EnhancedTelemedicineService } from '../../services/enhanced-telemedicine-service';
import { protectedProcedure, publicProcedure, router } from '../trpc';

// Input schemas
const CreateSessionInput = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  scheduledDate: z.date(),
  duration: z.number().min(15).max(120),
  sessionType: z.enum(['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE_REVIEW', 'TREATMENT_PLANNING']),
  reason: z.string().min(10),
  priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).default('ROUTINE'),
  notes: z.string().optional(),
});

const UpdateSessionInput = CreateSessionInput.partial().extend({
  sessionId: z.string().uuid(),
});

const SessionQueryInput = z.object({
  patientId: z.string().uuid().optional(),
  professionalId: z.string().uuid().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const SendMessageInput = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(5000),
  messageType: z.enum(['TEXT', 'IMAGE', 'DOCUMENT', 'PRESCRIPTION']).default('TEXT'),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().optional(),
});

const CreatePrescriptionInput = z.object({
  sessionId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    instructions: z.string(),
    anvisaRegistration: z.string().optional(),
  })),
  diagnosis: z.string(),
  notes: z.string().optional(),
  validUntil: z.date(),
});

const SessionFeedbackInput = z.object({
  sessionId: z.string().uuid(),
  patientId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
  technicalQuality: z.number().min(1).max(5),
  audioQuality: z.number().min(1).max(5),
  videoQuality: z.number().min(1).max(5),
  wouldRecommend: z.boolean(),
});

const UpdateSessionStatusInput = z.object({
  sessionId: z.string().uuid(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  cancellationReason: z.string().optional(),
  notes: z.string().optional(),
});

// Initialize service
const telemedicineService = new EnhancedTelemedicineService();

export const enhancedTelemedicineRouter = router({
  // Create new telemedicine session
  createSession: protectedProcedure
    .input(CreateSessionInput)
    .mutation(async ({ input }) => {
      return await telemedicineService.createSession(input);
    }),

  // Get session by ID
  getSessionById: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await telemedicineService.getSessionById(input.sessionId);
    }),

  // Update session
  updateSession: protectedProcedure
    .input(UpdateSessionInput)
    .mutation(async ({ input }) => {
      const { sessionId, ...data } = input;
      return await telemedicineService.updateSession(sessionId, data);
    }),

  // List sessions with filtering
  listSessions: protectedProcedure
    .input(SessionQueryInput)
    .query(async ({ input }) => {
      return await telemedicineService.listSessions(input);
    }),

  // Update session status
  updateSessionStatus: protectedProcedure
    .input(UpdateSessionStatusInput)
    .mutation(async ({ input }) => {
      return await telemedicineService.updateSessionStatus(input);
    }),

  // Send message in session
  sendMessage: protectedProcedure
    .input(SendMessageInput)
    .mutation(async ({ input }) => {
      return await telemedicineService.sendMessage(input);
    }),

  // Get session messages
  getSessionMessages: protectedProcedure
    .input(z.object({
      sessionId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      return await telemedicineService.getSessionMessages(
        input.sessionId,
        input.limit,
        input.offset,
      );
    }),

  // Create prescription from session
  createPrescription: protectedProcedure
    .input(CreatePrescriptionInput)
    .mutation(async ({ input }) => {
      return await telemedicineService.createPrescription(input);
    }),

  // Get session prescriptions
  getSessionPrescriptions: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await telemedicineService.getSessionPrescriptions(input.sessionId);
    }),

  // Submit session feedback
  submitFeedback: protectedProcedure
    .input(SessionFeedbackInput)
    .mutation(async ({ input }) => {
      return await telemedicineService.submitFeedback(input);
    }),

  // Get patient's telemedicine history
  getPatientHistory: protectedProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      return await telemedicineService.getPatientHistory(input.patientId, input.limit);
    }),

  // Get professional's telemedicine statistics
  getProfessionalStats: protectedProcedure
    .input(z.object({ professionalId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await telemedicineService.getProfessionalStats(input.professionalId);
    }),

  // Get upcoming sessions for professional
  getUpcomingSessions: protectedProcedure
    .input(z.object({
      professionalId: z.string().uuid(),
      daysAhead: z.number().min(1).max(30).default(7),
    }))
    .query(async ({ input }) => {
      return await telemedicineService.getUpcomingSessions(input.professionalId, input.daysAhead);
    }),

  // Check session eligibility (compliance checks)
  checkSessionEligibility: protectedProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      professionalId: z.string().uuid(),
      sessionType: z.enum(['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE_REVIEW', 'TREATMENT_PLANNING']),
    }))
    .query(async ({ input }) => {
      return await telemedicineService.checkSessionEligibility(input);
    }),

  // Generate session report (compliance and clinical)
  generateSessionReport: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await telemedicineService.generateSessionReport(input.sessionId);
    }),

  // Cancel session with refund calculation
  cancelSession: protectedProcedure
    .input(z.object({
      sessionId: z.string().uuid(),
      reason: z.string().min(10),
      initiateRefund: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      return await telemedicineService.cancelSession(
        input.sessionId,
        input.reason,
        input.initiateRefund,
      );
    }),
});
