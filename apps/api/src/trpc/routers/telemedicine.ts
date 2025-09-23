/**
 * Telemedicine Router
 * Implements CFM Resolution 2314/2022 compliant endpoints
 * for secure telemedicine sessions with comprehensive compliance
 */

import { TRPCError } from '@trpc/server';
import {
  healthcareProcedure,
  patientProcedure,
  publicProcedure,
  router,
  telemedicineProcedure,
} from '../trpc';

// Import services
import { CFMComplianceService } from '../../services/cfm-compliance';
import { telemedicineService } from '../../services/telemedicine-service';
// import { PatientIdentityService } from '@neonpro/database/src/services/patient-identity.service';

// Initialize services
const cfmService = new CFMComplianceService();
// const identityService = new PatientIdentityService();

// Input validation schemas
const createSessionSchema = z.object({
  patientId: z.string().uuid(),
  physicianId: z.string().uuid(),
  sessionType: z.enum([
    'consultation',
    'follow_up',
    'emergency',
    'second_opinion',
  ]),
  specialty: z.string().optional(),
  scheduledFor: z.date().optional(),
  estimatedDuration: z.number().min(5).max(180).default(30), // 5-180 minutes
  notes: z.string().max(500).optional(),
});

const joinSessionSchema = z.object({
  sessionId: z.string().uuid(),
  participantType: z.enum(['physician', 'patient', 'observer']),
  deviceInfo: z.object({
    browser: z.string(),
    os: z.string(),
    device: z.string(),
    connection: z.string(),
  }),
});

const patientVerificationSchema = z.object({
  patientId: z.string().uuid(),
  documents: z.array(
    z.object({
      type: z.enum(['cpf', 'rg', 'cns', 'passport', 'driver_license']),
      number: z.string(),
      issuingAuthority: z.string().optional(),
      issueDate: z.date().optional(),
      expiryDate: z.date().optional(),
    }),
  ),
  enableBiometric: z.boolean().default(false),
});

const licenseVerificationSchema = z.object({
  cfmNumber: z.string(),
  physicianState: z.string().length(2),
  requestedSpecialty: z.string().optional(),
});

const consentSchema = z.object({
  patientId: z.string().uuid(),
  sessionId: z.string().uuid(),
  consentType: z.enum([
    'telemedicine',
    'data_processing',
    'recording',
    'second_opinion',
  ]),
  consentData: z.record(z.any()),
});

const complianceReportSchema = z.object({
  sessionId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  physicianId: z.string().uuid().optional(),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
  reportType: z.enum([
    'session_audit',
    'compliance_violations',
    'license_status',
    'consent_status',
  ]),
});

export const telemedicineRouter = router({
  /**
   * Session Management Endpoints
   */

  // Create a new telemedicine session
  createSession: telemedicineProcedure
    .input(createSessionSchema)
    .mutation(async ({ input, _ctx }) => {
      try {
        // Verify physician license and authorization
        const { data: physician } = await ctx.supabase
          .from('users')
          .select('cfm_number, state, specialty')
          .eq('id', input.physicianId)
          .eq('role', 'physician')
          .single();

        if (!physician) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Physician not found',
          });
        }

        // Verify medical license using telemedicine service
        const licenseVerification = await telemedicineService[
          'verifyPhysicianLicense'
        ](input.physicianId, input.specialty || physician.specialty);

        if (!licenseVerification.complianceStatus.telemedicineCompliant) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Physician not authorized for telemedicine',
            cause: licenseVerification.riskIndicators,
          });
        }

        // Create WebRTC session using telemedicine service
        const session = await telemedicineService.createSession({
          patientId: input.patientId,
          physicianId: input.physicianId,
          sessionType: input.sessionType,
          specialty: input.specialty || physician.specialty,
          scheduledFor: input.scheduledFor || new Date(),
          estimatedDuration: input.estimatedDuration,
          notes: input.notes,
          clinicId: physician.clinic_id,
        });

        // Create CFM compliance record
        const complianceRecord = await cfmService.createComplianceRecord({
          sessionId: session.sessionId,
          patientId: input.patientId,
          physicianId: input.physicianId,
          cfmNumber: physician.cfm_number,
          physicianState: physician.state,
          sessionType: input.sessionType,
          licenseVerification,
        });

        return {
          session,
          complianceRecord,
          licenseVerification: {
            cfmCompliant: licenseVerification.complianceStatus.cfmCompliant,
            telemedicineCompliant: licenseVerification.complianceStatus.telemedicineCompliant,
            restrictions: licenseVerification.telemedicineAuth.restrictions,
          },
        };
      } catch (error) {
        console.error('Error creating telemedicine session:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create telemedicine session',
          cause: error,
        });
      }
    }),

  // Join an existing session
  joinSession: telemedicineProcedure
    .input(joinSessionSchema)
    .mutation(async ({ input, _ctx }) => {
      try {
        // const sessionDetails = await webrtcService.joinSession(
        //   input.sessionId,
        //   ctx.userId!,
        //   input.participantType,
        //   input.deviceInfo,
        // );

        // Temporary session details for testing
        const sessionDetails = {
          sessionId: input.sessionId,
          participantId: ctx.userId,
          participantType: input.participantType,
          status: 'joined',
          joinedAt: new Date(),
        };

        // Log compliance event
        await cfmService.logComplianceEvent({
          sessionId: input.sessionId,
          eventType: 'session_join',
          _userId: ctx.userId!,
          participantType: input.participantType,
          metadata: { deviceInfo: input.deviceInfo },
        });

        return sessionDetails;
      } catch (error) {
        console.error('Error joining telemedicine session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to join session',
          cause: error,
        });
      }
    }),

  // End a session
  endSession: telemedicineProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        endReason: z.enum([
          'completed',
          'cancelled',
          'technical_issue',
          'emergency',
        ]),
        notes: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input, _ctx }) => {
      try {
        // Calculate actual duration using telemedicine service
        const sessionResult = await telemedicineService.endSession({
          sessionId: input.sessionId,
          endReason: input.endReason,
          endedBy: ctx.userId!,
          recordingStopped: true,
        });

        const sessionSummary = {
          sessionId: sessionResult.sessionId,
          endReason: input.endReason,
          endedBy: ctx.userId!,
          endedAt: sessionResult.endedAt,
          duration: sessionResult.duration,
        };

        // Complete compliance record
        await cfmService.completeComplianceRecord(input.sessionId, {
          endReason: input.endReason,
          sessionSummary,
          endedBy: ctx.userId!,
        });

        return sessionSummary;
      } catch (error) {
        console.error('Error ending telemedicine session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to end session',
          cause: error,
        });
      }
    }),

  // Get session status
  getSessionStatus: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        // Get session status using telemedicine service
        const sessionStatus = await telemedicineService.getSessionStatus(
          input.sessionId,
        );

        return {
          sessionId: sessionStatus.session.sessionId,
          status: sessionStatus.session.status,
          participants: sessionStatus.participants,
          webrtcStatus: sessionStatus.webrtcStatus,
          qualityMetrics: sessionStatus.qualityMetrics,
          recording: sessionStatus.recording,
          createdAt: sessionStatus.session.scheduledFor,
        };
      } catch (error) {
        console.error('Error getting session status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get session status',
          cause: error,
        });
      }
    }),

  /**
   * Patient Verification Endpoints
   */

  // Verify patient identity - TODO: Implement when service available
  // verifyPatientIdentity: patientProcedure
  //   .input(patientVerificationSchema)
  //   .mutation(async ({ input }) => {
  //     try {
  //       return await identityService.verifyPatientIdentity(
  //         input.patientId,
  //         input.documents,
  //         input.enableBiometric,
  //       );
  //     } catch (error) {
  //       console.error('Error verifying patient identity:', error);
  //       throw new TRPCError({
  //         code: 'INTERNAL_SERVER_ERROR',
  //         message: 'Patient identity verification failed',
  //         cause: error,
  //       });
  //     }
  //   }),

  // Verify patient address - TODO: Implement when service available
  // verifyPatientAddress: patientProcedure
  //   .input(
  //     z.object({
  //       patientId: z.string().uuid(),
  //       address: z.object({
  //         zipCode: z.string(),
  //         state: z.string(),
  //         city: z.string(),
  //         neighborhood: z.string().optional(),
  //         street: z.string(),
  //         number: z.string().optional(),
  //         complement: z.string().optional(),
  //         verificationMethod: z.enum([
  //           'postal_service',
  //           'utility_bill',
  //           'bank_statement',
  //           'manual',
  //         ]),
  //       }),
  //     }),
  //   )
  //   .mutation(async ({ input }) => {
  //     try {
  //       return await identityService.verifyPatientAddress(input.patientId, {
  //         ...input.address,
  //         verified: false,
  //         verificationDate: new Date(),
  //       });
  //     } catch (error) {
  //       console.error('Error verifying patient address:', error);
  //       throw new TRPCError({
  //         code: 'INTERNAL_SERVER_ERROR',
  //         message: 'Patient address verification failed',
  //         cause: error,
  //       });
  //     }
  //   }),

  /**
   * License Verification Endpoints
   */

  // Verify medical license - TODO: Implement when service available
  // verifyMedicalLicense: healthcareProcedure
  //   .input(licenseVerificationSchema)
  //   .query(async ({ input }) => {
  //     try {
  //       return await licenseService.verifyMedicalLicense(
  //         input.cfmNumber,
  //         input.physicianState,
  //         input.requestedSpecialty,
  //       );
  //     } catch (error) {
  //       console.error('Error verifying medical license:', error);
  //       throw new TRPCError({
  //         code: 'INTERNAL_SERVER_ERROR',
  //         message: 'Medical license verification failed',
  //         cause: error,
  //       });
  //     }
  //   }),

  // Check telemedicine authorization - TODO: Implement when service available
  // checkTelemedicineAuthorization: healthcareProcedure
  //   .input(
  //     z.object({
  //       cfmNumber: z.string(),
  //       physicianState: z.string().length(2),
  //       consultationState: z.string().length(2),
  //       specialty: z.string().optional(),
  //     }),
  //   )
  //   .query(async ({ input }) => {
  //     try {
  //       return await licenseService.isAuthorizedForTelemedicine(
  //         input.cfmNumber,
  //         input.physicianState,
  //         input.consultationState,
  //         input.specialty,
  //       );
  //     } catch (error) {
  //       console.error('Error checking telemedicine authorization:', error);
  //       throw new TRPCError({
  //         code: 'INTERNAL_SERVER_ERROR',
  //         message: 'Telemedicine authorization check failed',
  //         cause: error,
  //       });
  //     }
  //   }),

  /**
   * Consent Management Endpoints
   */

  // Record patient consent
  recordConsent: patientProcedure
    .input(consentSchema)
    .mutation(async ({ input, _ctx }) => {
      try {
        const consent = await cfmService.recordPatientConsent({
          patientId: input.patientId,
          sessionId: input.sessionId,
          consentType: input.consentType,
          consentData: input.consentData,
          recordedBy: ctx.userId!,
          timestamp: new Date(),
        });

        return consent;
      } catch (error) {
        console.error('Error recording patient consent:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record patient consent',
          cause: error,
        });
      }
    }),

  // Get consent status
  getConsentStatus: patientProcedure
    .input(
      z.object({
        patientId: z.string().uuid(),
        consentType: z
          .enum([
            'telemedicine',
            'data_processing',
            'recording',
            'second_opinion',
          ])
          .optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await cfmService.getPatientConsentStatus(
          input.patientId,
          input.consentType,
        );
      } catch (error) {
        console.error('Error getting consent status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get consent status',
          cause: error,
        });
      }
    }),

  /**
   * Compliance Monitoring Endpoints
   */

  // Get compliance report
  getComplianceReport: healthcareProcedure
    .input(complianceReportSchema)
    .query(async ({ input }) => {
      try {
        return await cfmService.generateComplianceReport({
          sessionId: input.sessionId,
          patientId: input.patientId,
          physicianId: input.physicianId,
          dateRange: input.dateRange,
          reportType: input.reportType,
        });
      } catch (error) {
        console.error('Error generating compliance report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate compliance report',
          cause: error,
        });
      }
    }),

  // Get session audit trail
  getSessionAuditTrail: healthcareProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        return await cfmService.getSessionAuditTrail(input.sessionId);
      } catch (error) {
        console.error('Error getting session audit trail:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get session audit trail',
          cause: error,
        });
      }
    }),

  // List active sessions (for admin monitoring)
  listActiveSessions: healthcareProcedure
    .input(
      z.object({
        clinicId: z.string().uuid().optional(),
        physicianId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      try {
        // return await webrtcService.listActiveSessions({
        //   clinicId: input.clinicId,
        //   physicianId: input.physicianId,
        //   limit: input.limit,
        //   offset: input.offset,
        // });

        // Temporary empty list for testing
        return {
          sessions: [],
          total: 0,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error('Error listing active sessions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list active sessions',
          cause: error,
        });
      }
    }),

  /**
   * WebRTC Signal Management
   */

  // Send WebRTC signal (for peer connection establishment)
  sendSignal: telemedicineProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        signal: z.object({
          type: z.enum(['offer', 'answer', 'ice-candidate']),
          data: z.any(),
        }),
        targetParticipant: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, _ctx }) => {
      try {
        // await webrtcService.sendSignal(
        //   input.sessionId,
        //   ctx.userId!,
        //   input.targetParticipant,
        //   input.signal,
        // );

        // Temporary signal handling - just log for now
        console.log('Signal sent:', {
          sessionId: input.sessionId,
          fromUserId: ctx.userId,
          targetParticipant: input.targetParticipant,
          signalType: input.signal.type,
        });

        return { success: true };
      } catch (error) {
        console.error('Error sending WebRTC signal:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send WebRTC signal',
          cause: error,
        });
      }
    }),

  // Get session recording status
  getRecordingStatus: telemedicineProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        // return await webrtcService.getRecordingStatus(input.sessionId);

        // Temporary recording status for testing
        return {
          sessionId: input.sessionId,
          isRecording: false,
          recordingType: null,
          startedAt: null,
        };
      } catch (error) {
        console.error('Error getting recording status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get recording status',
          cause: error,
        });
      }
    }),

  // Start session recording (requires consent)
  startRecording: telemedicineProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        recordingType: z.enum(['video', 'audio', 'screen']),
      }),
    )
    .mutation(async ({ input, _ctx }) => {
      try {
        // Verify recording consent exists
        const consentStatus = await cfmService.getPatientConsentStatus(
          // We'll need to get patientId from session
          input.sessionId,
          'recording',
        );

        if (!consentStatus.hasValidConsent) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Recording consent required',
          });
        }

        // return await webrtcService.startRecording(
        //   input.sessionId,
        //   input.recordingType,
        //   ctx.userId!,
        // );

        // Temporary recording start for testing
        return {
          sessionId: input.sessionId,
          isRecording: true,
          recordingType: input.recordingType,
          startedAt: new Date(),
          startedBy: ctx.userId,
        };
      } catch (error) {
        console.error('Error starting recording:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start recording',
          cause: error,
        });
      }
    }),

  // Stop session recording
  stopRecording: telemedicineProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ input, _ctx }) => {
      try {
        // Stop recording using telemedicine service
        const recordingResult = await telemedicineService.stopRecording(
          input.sessionId,
        );

        return {
          sessionId: input.sessionId,
          isRecording: false,
          stoppedAt: new Date(),
          duration: recordingResult.duration,
        };
      } catch (error) {
        console.error('Error stopping recording:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to stop recording',
          cause: error,
        });
      }
    }),
});
