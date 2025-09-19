/**
 * tRPC v11 Appointment API Contracts
 * Comprehensive appointment management with conflict detection and AI predictions
 */

import {
  AppointmentResponseSchema,
  AppointmentsListResponseSchema,
  CreateAppointmentRequestSchema,
  HealthcareTRPCError,
  PaginationSchema,
  UpdateAppointmentRequestSchema,
} from '@neonpro/types/api/contracts';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const appointmentRouter = router({
  /**
   * Create new appointment with conflict detection
   */
  create: protectedProcedure
    .meta({
      description: 'Create new appointment with conflict detection and AI no-show prediction',
      tags: ['appointment', 'create', 'ai-prediction'],
      requiresPermission: 'appointment:create',
    })
    .input(CreateAppointmentRequestSchema)
    .output(AppointmentResponseSchema)
    .mutation(async ({ input, ctx }) => {
      // Validate patient exists and is active
      const patient = await ctx.prisma.patient.findFirst({
        where: {
          id: input.patientId,
          isActive: true,
          clinicId: input.clinicId,
        },
      });

      if (!patient) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Patient not found or inactive',
          'PATIENT_NOT_FOUND',
          { patientId: input.patientId },
        );
      }

      // Validate professional exists and is available
      const professional = await ctx.prisma.professional.findFirst({
        where: {
          id: input.professionalId,
          isActive: true,
          clinicId: input.clinicId,
        },
      });

      if (!professional) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Professional not found or unavailable',
          'PROFESSIONAL_UNAVAILABLE',
          { professionalId: input.professionalId },
        );
      }

      // Check for appointment conflicts
      const appointmentDate = new Date(input.scheduledDate);
      const endDate = new Date(appointmentDate.getTime() + input.duration * 60000);

      const conflictingAppointment = await ctx.prisma.appointment.findFirst({
        where: {
          professionalId: input.professionalId,
          status: { in: ['scheduled', 'confirmed', 'in_progress'] },
          OR: [
            {
              scheduledDate: { lte: appointmentDate },
              endDate: { gt: appointmentDate },
            },
            {
              scheduledDate: { lt: endDate },
              endDate: { gte: endDate },
            },
            {
              scheduledDate: { gte: appointmentDate },
              endDate: { lte: endDate },
            },
          ],
        },
      });

      if (conflictingAppointment) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Appointment conflicts with existing booking',
          'APPOINTMENT_CONFLICT',
          {
            conflictingAppointmentId: conflictingAppointment.id,
            conflictDate: conflictingAppointment.scheduledDate,
          },
        );
      }

      // Validate appointment is not in the past (except for emergency)
      if (appointmentDate < new Date() && input.priority !== 'emergency') {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          'Cannot schedule appointment in the past',
          'APPOINTMENT_PAST_DUE',
          { scheduledDate: input.scheduledDate },
        );
      }

      // Calculate no-show risk using AI prediction
      const noShowPrediction = await calculateNoShowRisk({
        patientId: input.patientId,
        professionalId: input.professionalId,
        appointmentDate: appointmentDate,
        treatmentType: input.treatmentType,
        priority: input.priority,
      });

      // Create appointment
      const appointment = await ctx.prisma.appointment.create({
        data: {
          ...input,
          endDate: endDate,
          status: 'scheduled',
          noShowRisk: noShowPrediction.risk,
          riskFactors: noShowPrediction.factors,
          createdBy: ctx.user.id,
        },
        include: {
          patient: {
            select: {
              fullName: true,
              phone: true,
              email: true,
            },
          },
          professional: {
            select: {
              fullName: true,
              specialization: true,
            },
          },
        },
      });

      // Send notifications based on priority
      if (input.priority === 'emergency') {
        await sendEmergencyNotification(appointment);
      } else {
        await scheduleAppointmentReminders(appointment);
      }

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'appointment_created',
          entityType: 'appointment',
          entityId: appointment.id,
          details: {
            patientId: input.patientId,
            professionalId: input.professionalId,
            scheduledDate: input.scheduledDate,
            priority: input.priority,
            noShowRisk: noShowPrediction.risk,
          },
          userId: ctx.user.id,
        },
      });

      return {
        success: true,
        data: appointment,
        message: 'Appointment created successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * Get appointment by ID
   */
  getById: protectedProcedure
    .meta({
      description: 'Get appointment by ID with related data',
      tags: ['appointment', 'read'],
      requiresPermission: 'appointment:read',
    })
    .input(z.object({
      id: z.string().uuid(),
      includePatient: z.boolean().default(true),
      includeProfessional: z.boolean().default(true),
      includeMedicalHistory: z.boolean().default(false),
    }))
    .output(AppointmentResponseSchema)
    .query(async ({ input, ctx }) => {
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id },
        include: {
          patient: input.includePatient
            ? {
              select: {
                id: true,
                fullName: true,
                cpf: input.includeMedicalHistory,
                phone: true,
                email: true,
                dateOfBirth: input.includeMedicalHistory,
              },
            }
            : false,
          professional: input.includeProfessional
            ? {
              select: {
                id: true,
                fullName: true,
                specialization: true,
                licenseNumber: true,
                licenseType: true,
              },
            }
            : false,
          medicalHistory: input.includeMedicalHistory,
        },
      });

      if (!appointment) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Appointment not found',
          'APPOINTMENT_NOT_FOUND',
          { appointmentId: input.id },
        );
      }

      // Validate clinic access
      await validateClinicAccess(ctx.user.id, appointment.clinicId);

      return {
        success: true,
        data: appointment,
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * List appointments with advanced filtering
   */
  list: protectedProcedure
    .meta({
      description: 'List appointments with filtering, search, and pagination',
      tags: ['appointment', 'list', 'filter'],
      requiresPermission: 'appointment:list',
    })
    .input(PaginationSchema.extend({
      clinicId: z.string().uuid(),
      patientId: z.string().uuid().optional(),
      professionalId: z.string().uuid().optional(),
      status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
        .optional(),
      priority: z.enum(['routine', 'urgent', 'emergency']).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      treatmentType: z.string().optional(),
      highNoShowRisk: z.boolean().default(false),
      sortBy: z.enum(['scheduledDate', 'createdAt', 'noShowRisk', 'priority']).default(
        'scheduledDate',
      ),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }))
    .output(AppointmentsListResponseSchema)
    .query(async ({ input, ctx }) => {
      // Validate clinic access
      await validateClinicAccess(ctx.user.id, input.clinicId);

      const where = {
        clinicId: input.clinicId,
        ...(input.patientId && { patientId: input.patientId }),
        ...(input.professionalId && { professionalId: input.professionalId }),
        ...(input.status && { status: input.status }),
        ...(input.priority && { priority: input.priority }),
        ...(input.treatmentType && {
          treatmentType: { contains: input.treatmentType, mode: 'insensitive' },
        }),
        ...(input.highNoShowRisk && { noShowRisk: { gte: 0.7 } }),
        ...(input.dateFrom || input.dateTo) && {
          scheduledDate: {
            ...(input.dateFrom && { gte: new Date(input.dateFrom) }),
            ...(input.dateTo && { lte: new Date(input.dateTo) }),
          },
        },
      };

      const [appointments, total] = await Promise.all([
        ctx.prisma.appointment.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: {
            [input.sortBy]: input.sortOrder,
          },
          include: {
            patient: {
              select: {
                fullName: true,
                phone: true,
              },
            },
            professional: {
              select: {
                fullName: true,
                specialization: true,
              },
            },
          },
        }),
        ctx.prisma.appointment.count({ where }),
      ]);

      return {
        success: true,
        data: {
          appointments,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
          },
        },
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * Update appointment status and details
   */
  update: protectedProcedure
    .meta({
      description: 'Update appointment with status change tracking',
      tags: ['appointment', 'update', 'status'],
      requiresPermission: 'appointment:update',
    })
    .input(UpdateAppointmentRequestSchema)
    .output(AppointmentResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const currentAppointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id },
      });

      if (!currentAppointment) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Appointment not found',
          'APPOINTMENT_NOT_FOUND',
          { appointmentId: input.id },
        );
      }

      // Validate clinic access
      await validateClinicAccess(ctx.user.id, currentAppointment.clinicId);

      // Check if status change is valid
      if (input.status && !isValidStatusTransition(currentAppointment.status, input.status)) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          `Invalid status transition from ${currentAppointment.status} to ${input.status}`,
          'INVALID_STATUS_TRANSITION',
          {
            currentStatus: currentAppointment.status,
            requestedStatus: input.status,
          },
        );
      }

      // Handle rescheduling conflicts
      if (
        input.scheduledDate
        && input.scheduledDate !== currentAppointment.scheduledDate.toISOString()
      ) {
        await checkRescheduleConflicts(
          input.id,
          currentAppointment.professionalId,
          new Date(input.scheduledDate),
          input.duration || currentAppointment.duration,
        );
      }

      // Update appointment
      const updatedAppointment = await ctx.prisma.appointment.update({
        where: { id: input.id },
        data: {
          ...input,
          ...(input.scheduledDate && {
            endDate: new Date(
              new Date(input.scheduledDate).getTime()
                + (input.duration || currentAppointment.duration) * 60000,
            ),
          }),
          updatedAt: new Date(),
          updatedBy: ctx.user.id,
        },
        include: {
          patient: {
            select: {
              fullName: true,
              phone: true,
              email: true,
            },
          },
          professional: {
            select: {
              fullName: true,
              specialization: true,
            },
          },
        },
      });

      // Handle status-specific actions
      if (input.status) {
        await handleStatusChange(updatedAppointment, currentAppointment.status, input.status, ctx);
      }

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'appointment_updated',
          entityType: 'appointment',
          entityId: input.id,
          details: {
            changes: getChanges(currentAppointment, input),
            previousStatus: currentAppointment.status,
            newStatus: input.status,
          },
          userId: ctx.user.id,
        },
      });

      return {
        success: true,
        data: updatedAppointment,
        message: 'Appointment updated successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),

  /**
   * Cancel appointment with reason tracking
   */
  cancel: protectedProcedure
    .meta({
      description: 'Cancel appointment with reason tracking and notifications',
      tags: ['appointment', 'cancel'],
      requiresPermission: 'appointment:cancel',
    })
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().min(5).max(500),
      notifyPatient: z.boolean().default(true),
    }))
    .output(z.object({
      success: z.literal(true),
      message: z.string(),
      timestamp: z.string().datetime(),
      requestId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id },
        include: {
          patient: {
            select: { fullName: true, phone: true, email: true },
          },
        },
      });

      if (!appointment) {
        throw new HealthcareTRPCError(
          'NOT_FOUND',
          'Appointment not found',
          'APPOINTMENT_NOT_FOUND',
          { appointmentId: input.id },
        );
      }

      // Validate clinic access
      await validateClinicAccess(ctx.user.id, appointment.clinicId);

      // Check if appointment can be cancelled
      if (!['scheduled', 'confirmed'].includes(appointment.status)) {
        throw new HealthcareTRPCError(
          'BAD_REQUEST',
          `Cannot cancel appointment with status: ${appointment.status}`,
          'INVALID_CANCELLATION',
          { currentStatus: appointment.status },
        );
      }

      // Update appointment status
      await ctx.prisma.appointment.update({
        where: { id: input.id },
        data: {
          status: 'cancelled',
          cancellationReason: input.reason,
          cancelledAt: new Date(),
          cancelledBy: ctx.user.id,
        },
      });

      // Send cancellation notification
      if (input.notifyPatient) {
        await sendCancellationNotification(appointment, input.reason);
      }

      // Audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'appointment_cancelled',
          entityType: 'appointment',
          entityId: input.id,
          details: {
            reason: input.reason,
            notifyPatient: input.notifyPatient,
            originalDate: appointment.scheduledDate,
          },
          userId: ctx.user.id,
        },
      });

      return {
        success: true,
        message: 'Appointment cancelled successfully',
        timestamp: new Date().toISOString(),
        requestId: ctx.requestId,
      };
    }),
});

// Helper functions
async function calculateNoShowRisk(params: {
  patientId: string;
  professionalId: string;
  appointmentDate: Date;
  treatmentType: string;
  priority: string;
}): Promise<{ risk: number; factors: string[] }> {
  // Placeholder for AI no-show prediction
  // This would integrate with your ML model
  return {
    risk: 0.2,
    factors: ['no_previous_no_shows', 'confirmed_appointment'],
  };
}

function isValidStatusTransition(current: string, next: string): boolean {
  const validTransitions = {
    scheduled: ['confirmed', 'cancelled', 'no_show'],
    confirmed: ['in_progress', 'cancelled', 'no_show'],
    in_progress: ['completed', 'cancelled'],
    completed: [], // Terminal state
    cancelled: [], // Terminal state
    no_show: [], // Terminal state
  };

  return validTransitions[current]?.includes(next) || false;
}

async function checkRescheduleConflicts(
  appointmentId: string,
  professionalId: string,
  newDate: Date,
  duration: number,
): Promise<void> {
  // Implementation for conflict checking during rescheduling
  // This is a placeholder
}

async function handleStatusChange(
  appointment: any,
  oldStatus: string,
  newStatus: string,
  ctx: any,
): Promise<void> {
  // Handle status-specific notifications and actions
  switch (newStatus) {
    case 'confirmed':
      await sendConfirmationNotification(appointment);
      break;
    case 'completed':
      await scheduleFollowUpReminder(appointment);
      break;
    case 'no_show':
      await updateNoShowStatistics(appointment.patientId);
      break;
  }
}

function getChanges(current: any, input: any): Record<string, any> {
  const changes = {};
  Object.keys(input).forEach(key => {
    if (key !== 'id' && input[key] !== undefined && input[key] !== current[key]) {
      changes[key] = {
        from: current[key],
        to: input[key],
      };
    }
  });
  return changes;
}

// Notification helpers (placeholders)
async function sendEmergencyNotification(appointment: any): Promise<void> {
  // Implementation for emergency notifications
}

async function scheduleAppointmentReminders(appointment: any): Promise<void> {
  // Implementation for scheduling reminders
}

async function sendConfirmationNotification(appointment: any): Promise<void> {
  // Implementation for confirmation notifications
}

async function sendCancellationNotification(appointment: any, reason: string): Promise<void> {
  // Implementation for cancellation notifications
}

async function scheduleFollowUpReminder(appointment: any): Promise<void> {
  // Implementation for follow-up reminders
}

async function updateNoShowStatistics(patientId: string): Promise<void> {
  // Implementation for no-show statistics tracking
}

async function validateClinicAccess(userId: string, clinicId: string): Promise<void> {
  // Implementation for clinic access validation
  return Promise.resolve();
}
