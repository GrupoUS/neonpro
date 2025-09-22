/**
 * Enhanced Healthcare Services tRPC Router
 * T027-T029 Integration: LGPD Lifecycle, No-Show Prediction, Telemedicine
 *
 * Features:
 * - LGPD data lifecycle management with automated compliance
 * - AI-powered no-show prediction with Brazilian behavior analysis
 * - CFM-compliant telemedicine sessions with NGS2 security
 * - Integration with existing middleware and schemas
 * - Comprehensive audit trails and compliance monitoring
 */

import { TRPCError } from '@trpc/server';
import * as v from 'valibot';
import {
  healthcareProcedure,
  patientProcedure,
  protectedProcedure,
  router,
  telemedicineProcedure,
} from '../trpc';

// Import our new services
import EnhancedLGPDLifecycleService from '../../services/enhanced-lgpd-lifecycle';
import NoShowPredictionService from '../../services/no-show-prediction';
import TelemedicineService from '../../services/telemedicine';

// Import existing validation schemas
import {
  AppointmentCreateSchema,
  LGPDConsentCreateSchema,
  PatientCreateSchema,
} from '@neonpro/types';

// Import only used schemas
import { ConsentWithdrawalRecordSchema } from '../../services/enhanced-lgpd-lifecycle';

// Service instances (would be injected in real app)
let lgpdService: EnhancedLGPDLifecycleService;
let noShowService: NoShowPredictionService;
let telemedicineService: TelemedicineService;

// Initialize services
export function initializeHealthcareServices(prisma: any) {
  lgpdService = new EnhancedLGPDLifecycleService(prisma);
  noShowService = new NoShowPredictionService(prisma);
  telemedicineService = new TelemedicineService(prisma);
}

/**
 * Enhanced Healthcare Services Router
 */
export const healthcareServicesRouter = router({
  // =====================================
  // LGPD DATA LIFECYCLE MANAGEMENT
  // =====================================

  /**
   * Create data processing record with lifecycle tracking
   */
  createDataProcessingRecord: patientProcedure
    .input(
      v.parser(
        v.object({
          patientId: v.string(),
          dataCategory: v.string(),
          legalBasis: v.string(),
          processingPurpose: v.string(),
          dataSource: v.string(),
        }),
      ),
    )
   .mutation(async ({ input, ctx }) => {
      try {
        if (!lgpdService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'LGPD service not initialized',
          });
        }

        const record = await lgpdService.createDataProcessingRecord(
          input.patientId,
          input.dataCategory as any,
          input.legalBasis as any,
          input.processingPurpose,
          input.dataSource,
        );

        // Audit trail
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.CREATE,
            resourceType: ResourceType.PATIENT_DATA,
            resource: record.id,
            _userId: ctx.userId,
            status: AuditStatus.SUCCESS,
            riskLevel: RiskLevel.LOW,
            ipAddress: ctx.auditMeta.ipAddress,
            userAgent: ctx.auditMeta.userAgent,
            sessionId: ctx.auditMeta.sessionId,
            additionalInfo: JSON.stringify({
              dataCategory: input.dataCategory,
              legalBasis: input.legalBasis,
              processingPurpose: input.processingPurpose,
            }),
          },
        });

        return {
          success: true,
          record,
          message: 'Data processing record created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create data processing record: ${error.message}`,
        });
      }
    }),

  /**
   * Process consent withdrawal with legal validity
   */
  processConsentWithdrawal: patientProcedure
    .input(
      v.parser(
        v.object({
          patientId: v.string(),
          withdrawalMethod: v.picklist([
            'online',
            'written',
            'verbal',
            'email',
            'phone',
          ]),
          withdrawalReason: v.optional(v.string()),
          affectedDataCategories: v.optional(v.array(v.string())),
        }),
      ),
    )
   .mutation(async ({ input, ctx }) => {
      try {
        if (!lgpdService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'LGPD service not initialized',
          });
        }

        const withdrawalRecord = await lgpdService.processConsentWithdrawal(
          input.patientId,
          input.withdrawalMethod,
          input.withdrawalReason,
          input.affectedDataCategories as any[],
        );

        // Audit trail for consent withdrawal
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.UPDATE,
            resourceType: ResourceType.PATIENT_CONSENT,
            resource: withdrawalRecord.id,
            _userId: ctx.userId,
            status: AuditStatus.SUCCESS,
            riskLevel: RiskLevel.HIGH, // Consent withdrawal is high risk
            ipAddress: ctx.auditMeta.ipAddress,
            userAgent: ctx.auditMeta.userAgent,
            sessionId: ctx.auditMeta.sessionId,
            additionalInfo: JSON.stringify({
              withdrawalMethod: input.withdrawalMethod,
              withdrawalReason: input.withdrawalReason,
              affectedCategories: input.affectedDataCategories?.length || 0,
              anonymizationScheduled: withdrawalRecord.anonymizationSchedule.length,
            }),
          },
        });

        return {
          success: true,
          withdrawalRecord,
          message: 'Consent withdrawal processed successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to process consent withdrawal: ${error.message}`,
        });
      }
    }),

  /**
   * Execute data anonymization workflow
   */
  executeAnonymization: healthcareProcedure
    .input(
      v.parser(
        v.object({
          patientId: v.string(),
          dataCategory: v.string(),
          method: v.string(),
        }),
      ),
    )
   .mutation(async ({ input, ctx }) => {
      try {
        if (!lgpdService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'LGPD service not initialized',
          });
        }

        const result = await lgpdService.executeAnonymization(
          input.patientId,
          input.dataCategory as any,
          input.method as any,
        );

        // Audit trail for anonymization
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.UPDATE,
            resourceType: ResourceType.PATIENT_DATA,
            resource: input.patientId,
            _userId: ctx.userId,
            status: result.success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
            riskLevel: RiskLevel.HIGH,
            ipAddress: ctx.auditMeta.ipAddress,
            userAgent: ctx.auditMeta.userAgent,
            sessionId: ctx.auditMeta.sessionId,
            additionalInfo: JSON.stringify({
              dataCategory: input.dataCategory,
              anonymizationMethod: input.method,
              recordsAnonymized: result.anonymizedRecords,
              errors: result.errors,
            }),
          },
        });

        return {
          success: result.success,
          anonymizedRecords: result.anonymizedRecords,
          errors: result.errors,
          message: result.success
            ? `Successfully anonymized ${result.anonymizedRecords} records`
            : 'Anonymization completed with errors',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to execute anonymization: ${error.message}`,
        });
      }
    }),

  /**
   * Generate LGPD lifecycle compliance report
   */
  generateLifecycleComplianceReport: healthcareProcedure
    .input(
      v.parser(
        v.object({
          patientId: v.optional(v.string()),
        }),
      ),
    )
   .query(async ({ input, ctx }) => {
      try {
        if (!lgpdService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'LGPD service not initialized',
          });
        }

        const report = await lgpdService.generateLifecycleComplianceReport(
          input.patientId,
        );

        // Audit trail for report generation
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.READ,
            resourceType: ResourceType.COMPLIANCE_REPORT,
            resource: input.patientId || 'all',
            _userId: ctx.userId,
            status: AuditStatus.SUCCESS,
            riskLevel: RiskLevel.LOW,
            ipAddress: ctx.auditMeta.ipAddress,
            userAgent: ctx.auditMeta.userAgent,
            sessionId: ctx.auditMeta.sessionId,
            additionalInfo: JSON.stringify({
              reportType: 'lgpd_lifecycle_compliance',
              totalRecords: report.totalRecords,
              complianceScore: report.complianceScore,
            }),
          },
        });

        return {
          success: true,
          report,
          message: 'Compliance report generated successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to generate compliance report: ${error.message}`,
        });
      }
    }), // =====================================
  // NO-SHOW PREDICTION SERVICE
  // =====================================

  /**
   * Predict no-show risk for appointment
   */
  predictNoShowRisk: healthcareProcedure
    .input(
      v.parser(
        v.object({
          appointmentId: v.string(),
          patientId: v.string(),
          appointmentDetails: v.object({
            scheduledDate: v.string(), // ISO date string
            appointmentType: v.string(),
            professionalId: v.string(),
            clinicId: v.string(),
            estimatedDuration: v.number(),
            cost: v.optional(v.number()),
          }),
        }),
      ),
    )
   .mutation(async ({ input, ctx }) => {
      try {
        if (!noShowService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'No-show prediction service not initialized',
          });
        }

        const appointmentDetails = {
          ...input.appointmentDetails,
          scheduledDate: new Date(input.appointmentDetails.scheduledDate),
        };

        const prediction = await noShowService.predictNoShowRisk(
          input.appointmentId,
          input.patientId,
          appointmentDetails,
        );

        // Audit trail for prediction
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.CREATE,
            resourceType: ResourceType.AI_PREDICTION,
            resourceId: prediction.id,
            _userId: ctx.userId,

            status: AuditStatus.SUCCESS,
            riskLevel: prediction.riskLevel === 'very_high'
                || prediction.riskLevel === 'high'
              ? RiskLevel.HIGH
              : RiskLevel.MEDIUM,
            details: {
              appointmentId: input.appointmentId,
              patientId: input.patientId,
              riskScore: prediction.riskScore,
              riskLevel: prediction.riskLevel,
              confidenceScore: prediction.confidenceScore,
              interventionsRecommended: prediction.recommendedInterventions.length,
              processingTime: prediction.processingTime,
            },
            ipAddress: ctx.req?.ip || 'unknown',
            userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          },
        });

        return {
          success: true,
          prediction,
          message: 'No-show risk prediction completed successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to predict no-show risk: ${error.message}`,
        });
      }
    }),

  /**
   * Get model performance report
   */
  getNoShowModelPerformance: healthcareProcedure.query(async ({ ctx }) => {
    try {
      if (!noShowService) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No-show prediction service not initialized',
        });
      }

      const report = await noShowService.getModelPerformanceReport();

      // Audit trail for performance report
      await ctx.prisma.auditTrail.create({
        data: {
          action: AuditAction.READ,
          resourceType: ResourceType.AI_MODEL_PERFORMANCE,
          resourceId: 'no_show_prediction',
          _userId: ctx.userId,

          status: AuditStatus.SUCCESS,
          details: {
            reportType: 'no_show_model_performance',
            totalPredictions: report.overallPerformance.totalPredictions,
            averageAccuracy: report.overallPerformance.averageAccuracy,
            averageProcessingTime: report.overallPerformance.averageProcessingTime,
            modelsCount: report.models.length,
          },
          ipAddress: ctx.req?.ip || 'unknown',
          userAgent: ctx.req?.headers['user-agent'] || 'unknown',
        },
      });

      return {
        success: true,
        report,
        message: 'Model performance report retrieved successfully',
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get model performance: ${error.message}`,
      });
    }
  }),

  // =====================================
  // TELEMEDICINE SERVICE
  // =====================================

  /**
   * Create telemedicine session
   */
  createTelemedicineSession: telemedicineProcedure
    .input(
      v.parser(
        v.object({
          sessionType: v.string(),
          patientId: v.string(),
          professionalId: v.string(),
          scheduledStartTime: v.string(), // ISO date string
          options: v.optional(
            v.object({
              recordingConsent: v.optional(v.boolean()),
              emergencyProtocols: v.optional(v.boolean()),
              securityLevel: v.optional(v.string()),
            }),
          ),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!telemedicineService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Telemedicine service not initialized',
          });
        }

        const scheduledStartTime = new Date(input.scheduledStartTime);
        const session = await telemedicineService.createSession(
          input.sessionType as any,
          input.patientId,
          input.professionalId,
          scheduledStartTime,
          input.options as any,
        );

        // Audit trail for session creation
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.CREATE,
            resourceType: ResourceType.TELEMEDICINE_SESSION,
            resourceId: session.id,
            _userId: ctx.userId,

            status: AuditStatus.SUCCESS,
            riskLevel: RiskLevel.MEDIUM, // Telemedicine requires security monitoring
            details: {
              sessionType: input.sessionType,
              patientId: input.patientId,
              professionalId: input.professionalId,
              scheduledStartTime: scheduledStartTime.toISOString(),
              securityLevel: session.securityLevel,
              recordingConsent: session.communicationChannel.recordingConsent,
            },
            ipAddress: ctx.req?.ip || 'unknown',
            userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          },
        });

        return {
          success: true,
          session,
          message: 'Telemedicine session created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create telemedicine session: ${error.message}`,
        });
      }
    }),

  /**
   * Start telemedicine session with authentication
   */
  startTelemedicineSession: telemedicineProcedure
    .input(
      v.parser(
        v.object({
          sessionId: v.string(),
          authContext: v.object({
            _userId: v.string(),
            securityLevel: v.string(),
            authenticationMethods: v.array(v.string()),
            sessionExpiry: v.string(), // ISO date string
            lastActivity: v.string(), // ISO date string
            riskScore: v.number(),
          }),
          patientConsent: v.object({
            recordingConsent: v.boolean(),
            dataProcessingConsent: v.boolean(),
            telemedicineConsent: v.boolean(),
          }),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!telemedicineService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Telemedicine service not initialized',
          });
        }

        const authContext = {
          ...input.authContext,
          sessionExpiry: new Date(input.authContext.sessionExpiry),
          lastActivity: new Date(input.authContext.lastActivity),
        };

        const result = await telemedicineService.startSession(
          input.sessionId,
          authContext as any,
          input.patientConsent,
        );

        // Audit trail for session start
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.UPDATE,
            resourceType: ResourceType.TELEMEDICINE_SESSION,
            resourceId: input.sessionId,
            _userId: ctx.userId,

            status: result.success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
            riskLevel: authContext.riskScore > 70 ? RiskLevel.HIGH : RiskLevel.MEDIUM,
            details: {
              sessionStarted: result.success,
              securityLevel: authContext.securityLevel,
              authMethods: authContext.authenticationMethods,
              riskScore: authContext.riskScore,
              consentObtained: input.patientConsent.telemedicineConsent,
            },
            ipAddress: ctx.req?.ip || 'unknown',
            userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          },
        });

        return {
          success: result.success,
          session: result.session,
          connectionDetails: result.connectionDetails,
          qualityRequirements: result.qualityRequirements,
          message: result.success
            ? 'Telemedicine session started successfully'
            : 'Failed to start telemedicine session',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to start telemedicine session: ${error.message}`,
        });
      }
    }),

  /**
   * Monitor telemedicine session quality
   */
  monitorSessionQuality: telemedicineProcedure
    .input(
      v.parser(
        v.object({
          sessionId: v.string(),
          qualityMetrics: v.object({
            videoResolution: v.string(),
            audioQuality: v.number(),
            latency: v.number(),
            packetLoss: v.number(),
            jitter: v.number(),
            bandwidth: v.number(),
          }),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!telemedicineService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Telemedicine service not initialized',
          });
        }

        const result = await telemedicineService.monitorSessionQuality(
          input.sessionId,
          input.qualityMetrics,
        );

        // Audit trail for quality monitoring
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.UPDATE,
            resourceType: ResourceType.TELEMEDICINE_SESSION,
            resourceId: input.sessionId,
            _userId: ctx.userId,

            status: AuditStatus.SUCCESS,
            riskLevel: result.shouldEscalate ? RiskLevel.HIGH : RiskLevel.LOW,
            details: {
              qualityScore: result.qualityScore,
              complianceIssues: result.complianceIssues.length,
              recommendations: result.recommendations.length,
              shouldEscalate: result.shouldEscalate,
              qualityMetrics: input.qualityMetrics,
            },
            ipAddress: ctx.req?.ip || 'unknown',
            userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          },
        });

        return {
          success: true,
          qualityScore: result.qualityScore,
          recommendations: result.recommendations,
          complianceIssues: result.complianceIssues,
          shouldEscalate: result.shouldEscalate,
          message: result.shouldEscalate
            ? 'Quality issues detected - escalation recommended'
            : 'Session quality monitoring completed',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to monitor session quality: ${error.message}`,
        });
      }
    }),

  /**
   * Create digital prescription with ICP-Brasil signature
   */
  createDigitalPrescription: telemedicineProcedure
    .input(
      v.parser(
        v.object({
          sessionId: v.string(),
          professionalId: v.string(),
          medications: v.array(
            v.object({
              name: v.string(),
              dosage: v.string(),
              frequency: v.string(),
              duration: v.string(),
              instructions: v.string(),
            }),
          ),
          digitalCertificate: v.object({
            type: v.string(),
            serialNumber: v.string(),
            privateKey: v.string(),
          }),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!telemedicineService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Telemedicine service not initialized',
          });
        }

        const result = await telemedicineService.createDigitalPrescription(
          input.sessionId,
          input.professionalId,
          input.medications,
          input.digitalCertificate as any,
        );

        // Audit trail for prescription creation
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.CREATE,
            resourceType: ResourceType.PRESCRIPTION,
            resourceId: result.prescriptionId,
            _userId: ctx.userId,

            status: result.isValid ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
            riskLevel: RiskLevel.HIGH, // Prescriptions are high-risk operations
            details: {
              sessionId: input.sessionId,
              professionalId: input.professionalId,
              medicationCount: input.medications.length,
              prescriptionId: result.prescriptionId,
              digitalSignatureValid: result.isValid,
              certificateType: input.digitalCertificate.type,
            },
            ipAddress: ctx.req?.ip || 'unknown',
            userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          },
        });

        return {
          success: result.isValid,
          prescriptionId: result.prescriptionId,
          digitalSignature: result.digitalSignature,
          timestamp: result.timestamp,
          isValid: result.isValid,
          message: result.isValid
            ? 'Digital prescription created successfully'
            : 'Failed to create valid digital prescription',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create digital prescription: ${error.message}`,
        });
      }
    }),

  /**
   * Activate emergency escalation protocol
   */
  activateEmergencyEscalation: telemedicineProcedure
    .input(
      v.parser(
        v.object({
          sessionId: v.string(),
          escalationLevel: v.picklist(['urgent', 'critical', 'emergency']),
          reason: v.string(),
          location: v.optional(
            v.object({
              latitude: v.number(),
              longitude: v.number(),
              address: v.string(),
            }),
          ),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!telemedicineService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Telemedicine service not initialized',
          });
        }

        const result = await telemedicineService.activateEmergencyEscalation(
          input.sessionId,
          input.escalationLevel,
          input.reason,
          input.location,
        );

        // Audit trail for emergency escalation
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.UPDATE,
            resourceType: ResourceType.TELEMEDICINE_SESSION,
            resourceId: input.sessionId,
            _userId: ctx.userId,

            status: result.success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
            riskLevel: RiskLevel.CRITICAL, // Emergency escalations are critical
            details: {
              escalationId: result.escalationId,
              escalationLevel: input.escalationLevel,
              reason: input.reason,
              location: input.location,
              emergencyContactsNotified: result.emergencyContacts.filter(
                c => c.notified,
              ).length,
              nearestHospital: result.nearestHospital?.name,
            },
            ipAddress: ctx.req?.ip || 'unknown',
            userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          },
        });

        return {
          success: result.success,
          escalationId: result.escalationId,
          emergencyContacts: result.emergencyContacts,
          nearestHospital: result.nearestHospital,
          message: result.success
            ? 'Emergency escalation activated successfully'
            : 'Failed to activate emergency escalation',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to activate emergency escalation: ${error.message}`,
        });
      }
    }),

  /**
   * End telemedicine session
   */
  endTelemedicineSession: telemedicineProcedure
    .input(
      v.parser(
        v.object({
          sessionId: v.string(),
          sessionSummary: v.object({
            clinicalNotes: v.optional(v.string()),
            diagnosis: v.optional(v.string()),
            followUpRequired: v.boolean(),
            nextAppointment: v.optional(v.string()), // ISO date string
            patientSatisfaction: v.optional(v.number()),
          }),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!telemedicineService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Telemedicine service not initialized',
          });
        }

        const sessionSummary = {
          ...input.sessionSummary,
          nextAppointment: input.sessionSummary.nextAppointment
            ? new Date(input.sessionSummary.nextAppointment)
            : undefined,
        };

        const result = await telemedicineService.endSession(
          input.sessionId,
          ctx.userId,
          sessionSummary,
        );

        // Audit trail for session end
        await ctx.prisma.auditTrail.create({
          data: {
            action: AuditAction.UPDATE,
            resourceType: ResourceType.TELEMEDICINE_SESSION,
            resourceId: input.sessionId,
            _userId: ctx.userId,

            status: result.success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
            riskLevel: !result.complianceReport.cfmCompliant
                || !result.complianceReport.lgpdCompliant
              ? RiskLevel.HIGH
              : RiskLevel.LOW,
            details: {
              sessionDuration: result.sessionDuration,
              cfmCompliant: result.complianceReport.cfmCompliant,
              lgpdCompliant: result.complianceReport.lgpdCompliant,
              qualityCompliant: result.complianceReport.qualityCompliant,
              complianceIssues: result.complianceReport.issues.length,
              archiveId: result.archivalDetails.archiveId,
              followUpRequired: sessionSummary.followUpRequired,
            },
            ipAddress: ctx.req?.ip || 'unknown',
            userAgent: ctx.req?.headers['user-agent'] || 'unknown',
          },
        });

        return {
          success: result.success,
          sessionDuration: result.sessionDuration,
          complianceReport: result.complianceReport,
          archivalDetails: result.archivalDetails,
          message: result.success
            ? 'Telemedicine session ended successfully'
            : 'Failed to end telemedicine session properly',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to end telemedicine session: ${error.message}`,
        });
      }
    }),

  /**
   * Get active telemedicine sessions summary
   */
  getActiveSessionsSummary: healthcareProcedure.query(async ({ ctx }) => {
    try {
      if (!telemedicineService) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Telemedicine service not initialized',
        });
      }

      const summary = await telemedicineService.getActiveSessionsSummary();

      // Audit trail for summary access
      await ctx.prisma.auditTrail.create({
        data: {
          action: AuditAction.READ,
          resourceType: ResourceType.TELEMEDICINE_SESSION,
          resourceId: 'summary',
          _userId: ctx.userId,

          status: AuditStatus.SUCCESS,
          details: {
            totalActiveSessions: summary.totalActiveSessions,
            averageQualityScore: summary.averageQualityScore,
            complianceIssues: summary.complianceIssues,
          },
          ipAddress: ctx.req?.ip || 'unknown',
          userAgent: ctx.req?.headers['user-agent'] || 'unknown',
        },
      });

      return {
        success: true,
        summary,
        message: 'Active sessions summary retrieved successfully',
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get active sessions summary: ${error.message}`,
      });
    }
  }),

  // =====================================
  // COMPLIANCE AND MONITORING
  // =====================================

  /**
   * Enforce retention periods across all services
   */
  enforceRetentionPeriods: healthcareProcedure.mutation(async ({ ctx }) => {
    try {
      if (!lgpdService) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'LGPD service not initialized',
        });
      }

      const result = await lgpdService.enforceRetentionPeriods();

      // Audit trail for retention enforcement
      await ctx.prisma.auditTrail.create({
        data: {
          action: AuditAction.DELETE,
          resourceType: ResourceType.PATIENT_DATA,
          resourceId: 'retention_enforcement',
          _userId: ctx.userId,

          status: result.errors.length === 0
            ? AuditStatus.SUCCESS
            : AuditStatus.PARTIAL_SUCCESS,
          details: {
            deletedRecords: result.deletedRecords,
            anonymizedRecords: result.anonymizedRecords,
            notificationsSent: result.notificationsSent,
            errors: result.errors.length,
          },
          ipAddress: ctx.req?.ip || 'unknown',
          userAgent: ctx.req?.headers['user-agent'] || 'unknown',
        },
      });

      return {
        success: result.errors.length === 0,
        deletedRecords: result.deletedRecords,
        anonymizedRecords: result.anonymizedRecords,
        notificationsSent: result.notificationsSent,
        errors: result.errors,
        message: result.errors.length === 0
          ? 'Retention periods enforced successfully'
          : 'Retention enforcement completed with some errors',
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to enforce retention periods: ${error.message}`,
      });
    }
  }),

  /**
   * Get comprehensive compliance dashboard
   */
  getComplianceDashboard: healthcareProcedure.query(async ({ ctx }) => {
    try {
      const dashboardData: any = {
        lgpdCompliance: null,
        noShowModelPerformance: null,
        telemedicineSessionsSummary: null,
        overallComplianceScore: 0,
        criticalIssues: [],
        recommendations: [],
      };

      // Get LGPD compliance report
      if (lgpdService) {
        dashboardData.lgpdCompliance = await lgpdService.generateLifecycleComplianceReport();
      }

      // Get no-show model performance
      if (noShowService) {
        dashboardData.noShowModelPerformance = await noShowService.getModelPerformanceReport();
      }

      // Get telemedicine sessions summary
      if (telemedicineService) {
        dashboardData.telemedicineSessionsSummary = await telemedicineService
          .getActiveSessionsSummary();
      }

      // Calculate overall compliance score
      const scores = [];
      if (dashboardData.lgpdCompliance) {
        scores.push(dashboardData.lgpdCompliance.complianceScore);
      }
      if (dashboardData.noShowModelPerformance) {
        scores.push(
          dashboardData.noShowModelPerformance.overallPerformance
            .averageAccuracy * 100,
        );
      }
      if (dashboardData.telemedicineSessionsSummary) {
        scores.push(
          dashboardData.telemedicineSessionsSummary.averageQualityScore,
        );
      }

      dashboardData.overallComplianceScore = scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length,
        )
        : 0;

      // Collect critical issues and recommendations
      if (dashboardData.lgpdCompliance) {
        dashboardData.recommendations.push(
          ...dashboardData.lgpdCompliance.recommendations,
        );
      }
      if (dashboardData.noShowModelPerformance) {
        dashboardData.recommendations.push(
          ...dashboardData.noShowModelPerformance.recommendations,
        );
      }

      // Audit trail for dashboard access
      await ctx.prisma.auditTrail.create({
        data: {
          action: AuditAction.READ,
          resourceType: ResourceType.COMPLIANCE_REPORT,
          resourceId: 'dashboard',
          _userId: ctx.userId,

          status: AuditStatus.SUCCESS,
          details: {
            overallComplianceScore: dashboardData.overallComplianceScore,
            recommendationsCount: dashboardData.recommendations.length,
            servicesIncluded: Object.keys(dashboardData).filter(
              key =>
                dashboardData[key] !== null
                && ![
                  'overallComplianceScore',
                  'criticalIssues',
                  'recommendations',
                ].includes(key),
            ),
          },
          ipAddress: ctx.req?.ip || 'unknown',
          userAgent: ctx.req?.headers['user-agent'] || 'unknown',
        },
      });

      return {
        success: true,
        dashboard: dashboardData,
        message: 'Compliance dashboard data retrieved successfully',
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get compliance dashboard: ${error.message}`,
      });
    }
  }),
});

export default healthcareServicesRouter;
