/**
 * Appointment validation schemas using Valibot
 * Provides the missing appointment.valibot types
 */

import * as v from 'valibot';

/**
 * Base appointment schema with common fields
 */
export const BaseAppointmentSchema = v.object({
  id: v.optional(v.pipe(v.string(), v.uuid())),
  patientId: v.pipe(v.string(), v.uuid()),
  doctorId: v.pipe(v.string(), v.uuid()),
  clinicId: v.pipe(v.string(), v.uuid()),
  appointmentDate: v.pipe(v.string(), v.isoDateTime()),
  duration: v.pipe(v.number(), v.minValue(15), v.maxValue(480)), // 15 minutes to 8 hours
  status: v.picklist(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']),
  notes: v.optional(v.pipe(v.string(), v.maxLength(1000))),
  createdAt: v.optional(v.pipe(v.string(), v.isoDateTime())),
  updatedAt: v.optional(v.pipe(v.string(), v.isoDateTime())),
});

/**
 * Schema for creating a new appointment
 */
export const CreateAppointmentValibot = v.object({
  patientId: v.pipe(v.string(), v.uuid()),
  doctorId: v.pipe(v.string(), v.uuid()),
  clinicId: v.pipe(v.string(), v.uuid()),
  appointmentDate: v.pipe(v.string(), v.isoDateTime()),
  duration: v.pipe(v.number(), v.minValue(15), v.maxValue(480)),
  status: v.optional(v.picklist(['scheduled', 'confirmed'])),
  notes: v.optional(v.pipe(v.string(), v.maxLength(1000))),
});

/**
 * Schema for updating an existing appointment
 */
export const UpdateAppointmentValibot = v.object({
  id: v.pipe(v.string(), v.uuid()),
  patientId: v.optional(v.pipe(v.string(), v.uuid())),
  doctorId: v.optional(v.pipe(v.string(), v.uuid())),
  clinicId: v.optional(v.pipe(v.string(), v.uuid())),
  appointmentDate: v.optional(v.pipe(v.string(), v.isoDateTime())),
  duration: v.optional(v.pipe(v.number(), v.minValue(15), v.maxValue(480))),
  status: v.optional(v.picklist(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])),
  notes: v.optional(v.pipe(v.string(), v.maxLength(1000))),
});

/**
 * Schema for appointment reminders
 */
export const AppointmentReminderValibot = v.object({
  id: v.optional(v.pipe(v.string(), v.uuid())),
  appointmentId: v.pipe(v.string(), v.uuid()),
  patientId: v.pipe(v.string(), v.uuid()),
  reminderType: v.picklist(['sms', 'email', 'whatsapp', 'push']),
  reminderTime: v.pipe(v.string(), v.isoDateTime()),
  status: v.picklist(['pending', 'sent', 'delivered', 'failed']),
  message: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
  createdAt: v.optional(v.pipe(v.string(), v.isoDateTime())),
  updatedAt: v.optional(v.pipe(v.string(), v.isoDateTime())),
});

/**
 * Schema for real-time availability checking
 */
export const RealTimeAvailabilityValibot = v.object({
  doctorId: v.pipe(v.string(), v.uuid()),
  clinicId: v.pipe(v.string(), v.uuid()),
  date: v.pipe(v.string(), v.isoDate()),
  duration: v.pipe(v.number(), v.minValue(15), v.maxValue(480)),
});

/**
 * Schema for no-show prediction
 */
export const NoShowPredictionValibot = v.object({
  appointmentId: v.pipe(v.string(), v.uuid()),
  patientId: v.pipe(v.string(), v.uuid()),
  riskFactors: v.object({
    previousNoShows: v.pipe(v.number(), v.minValue(0)),
    appointmentAge: v.pipe(v.number(), v.minValue(0)), // Hours between booking and appointment
    timeOfDay: v.pipe(v.string(), v.regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)),
    dayOfWeek: v.pipe(v.number(), v.minValue(0), v.maxValue(6)), // 0 = Sunday, 6 = Saturday
  }),
  predictionScore: v.pipe(v.number(), v.minValue(0), v.maxValue(1)), // 0 = low risk, 1 = high risk
});

/**
 * Schema for appointment cancellation
 */
export const CancelAppointmentValibot = v.object({
  appointmentId: v.pipe(v.string(), v.uuid()),
  reason: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
  cancelledBy: v.picklist(['patient', 'doctor', 'clinic', 'system']),
});

/**
 * Schema for appointment rescheduling
 */
export const RescheduleAppointmentValibot = v.object({
  appointmentId: v.pipe(v.string(), v.uuid()),
  newAppointmentDate: v.pipe(v.string(), v.isoDateTime()),
  reason: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
  requestedBy: v.picklist(['patient', 'doctor', 'clinic']),
});

/**
 * Schema for appointment search filters
 */
export const AppointmentSearchFiltersValibot = v.object({
  patientId: v.optional(v.pipe(v.string(), v.uuid())),
  doctorId: v.optional(v.pipe(v.string(), v.uuid())),
  clinicId: v.optional(v.pipe(v.string(), v.uuid())),
  status: v.optional(v.picklist(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])),
  startDate: v.optional(v.pipe(v.string(), v.isoDate())),
  endDate: v.optional(v.pipe(v.string(), v.isoDate())),
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100))),
  offset: v.optional(v.pipe(v.number(), v.minValue(0))),
});

/**
 * Schema for appointment statistics
 */
export const AppointmentStatisticsValibot = v.object({
  clinicId: v.optional(v.pipe(v.string(), v.uuid())),
  doctorId: v.optional(v.pipe(v.string(), v.uuid())),
  startDate: v.pipe(v.string(), v.isoDate()),
  endDate: v.pipe(v.string(), v.isoDate()),
  groupBy: v.optional(v.picklist(['day', 'week', 'month', 'doctor', 'status'])),
});

/**
 * Type definitions derived from schemas
 */
export type BaseAppointment = v.InferOutput<typeof BaseAppointmentSchema>;
export type CreateAppointment = v.InferOutput<typeof CreateAppointmentValibot>;
export type UpdateAppointment = v.InferOutput<typeof UpdateAppointmentValibot>;
export type AppointmentReminder = v.InferOutput<typeof AppointmentReminderValibot>;
export type RealTimeAvailability = v.InferOutput<typeof RealTimeAvailabilityValibot>;
export type NoShowPrediction = v.InferOutput<typeof NoShowPredictionValibot>;
export type CancelAppointment = v.InferOutput<typeof CancelAppointmentValibot>;
export type RescheduleAppointment = v.InferOutput<typeof RescheduleAppointmentValibot>;
export type AppointmentSearchFilters = v.InferOutput<typeof AppointmentSearchFiltersValibot>;
export type AppointmentStatistics = v.InferOutput<typeof AppointmentStatisticsValibot>;
