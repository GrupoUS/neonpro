/**
 * tRPC Contract: Appointments Router  
 * Healthcare Domain: Scheduling and Appointment Management
 * Business Critical: No-show prediction and prevention
 */

import { z } from 'zod';
import { procedure, router } from '../trpc-setup';

// Valibot Schema Imports (will be implemented)
import {
  AppointmentIdSchema,
  PatientIdSchema,
  DoctorIdSchema,
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  AppointmentSchema,
  AppointmentFilterSchema,
  NoShowPredictionSchema
} from '@neonpro/types/validation';

/**
 * Appointments Router Contract
 * Focus: Scheduling optimization and no-show prevention
 */
export const appointmentsRouter = router({

  /**
   * List Appointments with Smart Filtering
   * AI: No-show risk scoring for each appointment
   * Performance: Optimized for mobile scheduling interface
   */
  list: procedure
    .input(z.object({
      filters: AppointmentFilterSchema,
      includeNoShowRisk: z.boolean().default(true),
      pagination: z.object({
        page: z.number().min(1),
        limit: z.number().min(10).max(100).default(20)
      })
    }))
    .output(z.object({
      appointments: z.array(AppointmentSchema.extend({
        noShowRisk: NoShowPredictionSchema.optional()
      })),
      totalCount: z.number(),
      todayStats: z.object({
        total: z.number(),
        confirmed: z.number(),
        highRisk: z.number() // No-show prediction
      })
    }))
    .query(),

  /**
   * Create New Appointment
   * AI: Automatic no-show risk calculation
   * LGPD: Patient consent for scheduling data
   */
  create: procedure
    .input(z.object({
      appointment: CreateAppointmentSchema,
      autoReminders: z.boolean().default(true),
      noShowPrevention: z.boolean().default(true)
    }))
    .output(z.object({
      appointment: AppointmentSchema,
      noShowRisk: NoShowPredictionSchema,
      reminderSchedule: z.array(z.object({
        type: z.enum(['SMS', 'EMAIL', 'WHATSAPP', 'PUSH']),
        scheduledFor: z.date(),
        message: z.string()
      })),
      auditId: z.string()
    }))
    .mutation(),

  /**
   * Update Appointment Status
   * Business Logic: Availability recalculation
   * Analytics: Status change tracking for insights
   */
  updateStatus: procedure
    .input(z.object({
      appointmentId: AppointmentIdSchema,
      status: z.enum([
        'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 
        'COMPLETED', 'CANCELLED', 'NO_SHOW'
      ]),
      reason: z.string().optional(),
      rescheduleData: z.object({
        newDateTime: z.date(),
        reason: z.string()
      }).optional()
    }))
    .output(z.object({
      appointment: AppointmentSchema,
      availabilityUpdated: z.boolean(),
      noShowRiskUpdated: NoShowPredictionSchema.optional(),
      auditId: z.string()
    }))
    .mutation(),

  /**
   * Doctor Availability Check
   * Real-time: WebSocket updates for live availability
   * Performance: <200ms response for scheduling interface
   */
  checkAvailability: procedure
    .input(z.object({
      doctorId: DoctorIdSchema,
      dateRange: z.object({
        startDate: z.date(),
        endDate: z.date()
      }),
      duration: z.number().min(15).max(240) // minutes
    }))
    .output(z.object({
      availableSlots: z.array(z.object({
        startTime: z.date(),
        endTime: z.date(),
        type: z.enum(['AVAILABLE', 'PREFERRED', 'LIMITED'])
      })),
      suggestedAlternatives: z.array(z.object({
        doctorId: DoctorIdSchema,
        doctorName: z.string(),
        availability: z.date()
      })).optional()
    }))
    .query(),

  /**
   * No-Show Risk Analysis
   * AI: Predictive analytics for appointment attendance
   * Business: Revenue protection through early intervention
   */
  analyzeNoShowRisk: procedure
    .input(z.object({
      appointmentId: AppointmentIdSchema.optional(),
      patientId: PatientIdSchema.optional(),
      batchAnalysis: z.array(AppointmentIdSchema).optional()
    }))
    .output(z.object({
      riskAnalysis: z.union([
        NoShowPredictionSchema, // Single appointment
        z.array(z.object({
          appointmentId: AppointmentIdSchema,
          risk: NoShowPredictionSchema
        })) // Batch analysis
      ]),
      interventionSuggestions: z.array(z.object({
        type: z.enum(['REMINDER', 'INCENTIVE', 'RESCHEDULE', 'CONTACT']),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        message: z.string(),
        scheduledFor: z.date().optional()
      }))
    }))
    .query(),

  /**
   * Appointment Reminders Management
   * WhatsApp: Business API integration for patient communication
   * LGPD: Communication consent tracking
   */
  manageReminders: procedure
    .input(z.object({
      appointmentId: AppointmentIdSchema,
      reminderSettings: z.object({
        sms: z.boolean().default(true),
        email: z.boolean().default(true),
        whatsapp: z.boolean().default(true),
        push: z.boolean().default(true)
      }),
      customMessage: z.string().optional(),
      scheduleOverride: z.array(z.object({
        type: z.enum(['SMS', 'EMAIL', 'WHATSAPP', 'PUSH']),
        hoursBeforeAppointment: z.number().min(1).max(168) // 1 hour to 1 week
      })).optional()
    }))
    .output(z.object({
      remindersScheduled: z.array(z.object({
        type: z.enum(['SMS', 'EMAIL', 'WHATSAPP', 'PUSH']),
        scheduledFor: z.date(),
        status: z.enum(['SCHEDULED', 'SENT', 'FAILED', 'CANCELLED'])
      })),
      consentStatus: z.object({
        sms: z.boolean(),
        email: z.boolean(),
        whatsapp: z.boolean(),
        push: z.boolean()
      })
    }))
    .mutation()

});

export type AppointmentsRouter = typeof appointmentsRouter;