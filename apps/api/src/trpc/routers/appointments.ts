/**
 * Appointments tRPC Router
 * Implements CFM validation, no-show prediction, and Brazilian healthcare compliance
 */

import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, patientProcedure } from '../trpc';
import { 
  CreateAppointmentSchema, 
  UpdateAppointmentSchema, 
  GetAppointmentSchema, 
  ListAppointmentsSchema 
} from '../schemas';
import { AuditAction, ResourceType, AuditStatus, RiskLevel } from '@prisma/client';

/**
 * Mock CFM License Validation
 * In production, this would call the actual CFM API
 */
async function validateCFMLicense(professionalId: string, prisma: any) {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { licenseNumber: true, specialization: true },
  });

  if (!professional?.licenseNumber) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Professional must have valid CFM license',
    });
  }

  // Mock CFM validation - in production call portal.cfm.org.br API
  return {
    isValid: true,
    licenseNumber: professional.licenseNumber,
    specialization: professional.specialization,
  };
}/**
 * Mock No-Show Risk Prediction
 * In production, this would use AI/ML models
 */
async function predictNoShowRisk(patientId: string, appointmentTime: Date, prisma: any) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { 
      noShowRiskScore: true, 
      totalNoShows: true, 
      totalAppointments: true,
      lastNoShowDate: true,
    },
  });

  if (!patient) {
    return { riskLevel: 'medium', riskScore: 50 };
  }

  // Simple risk calculation - in production use ML models
  let riskScore = patient.noShowRiskScore || 0;
  
  // Increase risk based on appointment time (early morning/late evening)
  const hour = appointmentTime.getHours();
  if (hour < 8 || hour > 18) riskScore += 10;
  
  // Increase risk based on no-show history
  const noShowRate = patient.totalAppointments ? 
    (patient.totalNoShows / patient.totalAppointments) * 100 : 0;
  riskScore += noShowRate;

  const riskLevel = riskScore > 70 ? 'high' : 
                   riskScore > 40 ? 'medium' : 'low';

  return { riskLevel, riskScore: Math.min(riskScore, 100) };
}

export const appointmentsRouter = router({
  /**
   * Create Appointment
   * Includes CFM validation and no-show prediction
   */
  create: protectedProcedure
    .input(CreateAppointmentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate CFM license
        await validateCFMLicense(input.professionalId, ctx.prisma);

        // Predict no-show risk
        const riskPrediction = await predictNoShowRisk(
          input.patientId, 
          input.startTime, 
          ctx.prisma
        );

        // Create appointment
        const appointment = await ctx.prisma.appointment.create({
          data: {
            ...input,
            clinicId: ctx.clinicId,
            createdBy: ctx.userId,
            status: 'scheduled',
          },
          include: {
            patient: true,
            professional: true,
            serviceType: true,
          },
        });

        // Log audit trail
        await ctx.prisma.auditTrail.create({
          data: {
            userId: ctx.userId,
            clinicId: ctx.clinicId,
            patientId: input.patientId,
            action: AuditAction.CREATE,
            resource: 'appointment',
            resourceType: ResourceType.SYSTEM_CONFIG,
            resourceId: appointment.id,
            ipAddress: ctx.auditMeta.ipAddress,
            userAgent: ctx.auditMeta.userAgent,
            sessionId: ctx.auditMeta.sessionId,
            status: AuditStatus.SUCCESS,
            riskLevel: RiskLevel.LOW,
            additionalInfo: JSON.stringify({
              action: 'appointment_created',
              noShowRiskLevel: riskPrediction.riskLevel,
              noShowRiskScore: riskPrediction.riskScore,
            }),
          },
        });

        return {
          ...appointment,
          noShowPrediction: riskPrediction,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create appointment',
          cause: error,
        });
      }
    }),