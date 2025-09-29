/**
 * Appointment validation schemas using Zod v4
 * Provides the missing appointment.zod types
 * Migrated from Valibot to Zod v4 with enhanced healthcare compliance
 */

import { z } from 'zod'

/**
 * Base appointment schema with common fields
 */
export const BaseAppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid('Invalid patient ID'),
  doctorId: z.string().uuid('Invalid doctor ID'),
  clinicId: z.string().uuid('Invalid clinic ID'),
  appointmentDate: z.string().datetime('Invalid appointment date format'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours (480 minutes)'),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'], {
    message: 'Invalid appointment status',
  }),
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

/**
 * Schema for creating a new appointment
 */
export const CreateAppointmentZod = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  doctorId: z.string().uuid('Invalid doctor ID'),
  clinicId: z.string().uuid('Invalid clinic ID'),
  appointmentDate: z.string().datetime('Invalid appointment date format'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours (480 minutes)'),
  status: z.enum(['scheduled', 'confirmed']).optional(),
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
})

/**
 * Schema for updating an existing appointment
 */
export const UpdateAppointmentZod = z.object({
  id: z.string().uuid('Invalid appointment ID'),
  patientId: z.string().uuid('Invalid patient ID').optional(),
  doctorId: z.string().uuid('Invalid doctor ID').optional(),
  clinicId: z.string().uuid('Invalid clinic ID').optional(),
  appointmentDate: z.string().datetime('Invalid appointment date format').optional(),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours (480 minutes)')
    .optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'], {
    message: 'Invalid appointment status',
  }).optional(),
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
})

/**
 * Schema for appointment reminders
 */
export const AppointmentReminderZod = z.object({
  id: z.string().uuid().optional(),
  appointmentId: z.string().uuid('Invalid appointment ID'),
  patientId: z.string().uuid('Invalid patient ID'),
  reminderType: z.enum(['sms', 'email', 'whatsapp', 'push'], {
    message: 'Invalid reminder type',
  }),
  reminderTime: z.string().datetime('Invalid reminder time format'),
  status: z.enum(['pending', 'sent', 'delivered', 'failed'], {
    message: 'Invalid reminder status',
  }),
  message: z.string()
    .min(1, 'Message is required')
    .max(500, 'Message cannot exceed 500 characters'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

/**
 * Schema for real-time availability checking
 */
export const RealTimeAvailabilityZod = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  clinicId: z.string().uuid('Invalid clinic ID'),
  date: z.string().date('Invalid date format'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours (480 minutes)'),
})

/**
 * Schema for no-show prediction
 */
export const NoShowPredictionZod = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  patientId: z.string().uuid('Invalid patient ID'),
  riskFactors: z.object({
    previousNoShows: z.number()
      .min(0, 'Previous no-shows cannot be negative'),
    appointmentAge: z.number()
      .min(0, 'Appointment age cannot be negative'), // Hours between booking and appointment
    timeOfDay: z.string()
      .regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    dayOfWeek: z.number()
      .min(0, 'Day of week must be between 0-6 (Sunday-Saturday)')
      .max(6, 'Day of week must be between 0-6 (Sunday-Saturday)'),
  }),
  predictionScore: z.number()
    .min(0, 'Prediction score must be between 0-1')
    .max(1, 'Prediction score must be between 0-1'), // 0 = low risk, 1 = high risk
})

/**
 * Schema for appointment cancellation
 */
export const CancelAppointmentZod = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  reason: z.string()
    .min(1, 'Cancellation reason is required')
    .max(500, 'Reason cannot exceed 500 characters'),
  cancelledBy: z.enum(['patient', 'doctor', 'clinic', 'system'], {
    message: 'Invalid cancelled by value',
  }),
})

/**
 * Schema for appointment rescheduling
 */
export const RescheduleAppointmentZod = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  newAppointmentDate: z.string().datetime('Invalid new appointment date format'),
  reason: z.string()
    .min(1, 'Rescheduling reason is required')
    .max(500, 'Reason cannot exceed 500 characters'),
  requestedBy: z.enum(['patient', 'doctor', 'clinic'], {
    message: 'Invalid requested by value',
  }),
})

/**
 * Schema for appointment search filters
 */
export const AppointmentSearchFiltersZod = z.object({
  patientId: z.string().uuid('Invalid patient ID').optional(),
  doctorId: z.string().uuid('Invalid doctor ID').optional(),
  clinicId: z.string().uuid('Invalid clinic ID').optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'], {
    message: 'Invalid appointment status',
  }).optional(),
  startDate: z.string().date('Invalid start date format').optional(),
  endDate: z.string().date('Invalid end date format').optional(),
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  offset: z.number()
    .min(0, 'Offset cannot be negative')
    .optional(),
})

/**
 * Schema for appointment statistics
 */
export const AppointmentStatisticsZod = z.object({
  clinicId: z.string().uuid('Invalid clinic ID').optional(),
  doctorId: z.string().uuid('Invalid doctor ID').optional(),
  startDate: z.string().date('Invalid start date format'),
  endDate: z.string().date('Invalid end date format'),
  groupBy: z.enum(['day', 'week', 'month', 'doctor', 'status'], {
    message: 'Invalid group by value',
  }).optional(),
})

/**
 * Healthcare-specific appointment validation schema
 * Includes CFM (Conselho Federal de Medicina) compliance
 */
export const HealthcareAppointmentSchema = BaseAppointmentSchema.extend({
  // Healthcare-specific fields
  procedureType: z.string().min(1, 'Procedure type is required'),
  medicalSpecialty: z.string().min(1, 'Medical specialty is required'),
  insuranceAuthorization: z.string().optional(),
  priorAuthorizationCode: z.string().optional(),
  
  // CFM compliance fields
  cfmCompliant: z.literal(true, 'CFM compliance is required for medical appointments'),
  professionalLicense: z.string().min(1, 'Professional license is required'),
  supervisionRequired: z.boolean().optional(),
  supervisorId: z.string().uuid('Invalid supervisor ID').optional(),
  
  // Telemedicine compliance
  isTelemedicine: z.boolean().optional(),
  telemedicinePlatform: z.string().optional(),
  patientConsentForTelemedicine: z.boolean().optional(),
  
  // Emergency flags
  isEmergency: z.boolean().optional(),
  emergencyLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  
  // No-show risk assessment
  noShowRisk: z.number()
    .min(0, 'No-show risk must be between 0-1')
    .max(1, 'No-show risk must be between 0-1')
    .optional(),
  
  // Follow-up requirements
  requiresFollowUp: z.boolean().optional(),
  followUpIntervalDays: z.number()
    .min(1, 'Follow-up interval must be at least 1 day')
    .optional(),
})

/**
 * Schema for appointment creation with healthcare compliance
 */
export const CreateHealthcareAppointmentSchema = HealthcareAppointmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * Schema for appointment update with healthcare compliance
 */
export const UpdateHealthcareAppointmentSchema = HealthcareAppointmentSchema.partial()
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().uuid('Invalid appointment ID'),
  })

/**
 * Schema for appointment cancellation with healthcare compliance
 */
export const CancelHealthcareAppointmentSchema = CancelAppointmentZod.extend({
  // Healthcare-specific cancellation reasons
  cancellationReason: z.enum([
    'patient_request',
    'doctor_recommendation',
    'medical_contraindication',
    'insurance_denial',
    'facility_closure',
    'emergency',
    'no_show',
    'other',
  ], {
    message: 'Invalid healthcare cancellation reason',
  }),
  
  // Medical justification if applicable
  medicalJustification: z.string()
    .max(1000, 'Medical justification cannot exceed 1000 characters')
    .optional(),
  
  // Insurance coordination
  insuranceNotified: z.boolean().optional(),
  insuranceClaimCancelled: z.boolean().optional(),
  
  // Refund information
  refundRequired: z.boolean().optional(),
  refundAmount: z.number()
    .min(0, 'Refund amount cannot be negative')
    .optional(),
  refundMethod: z.enum(['cash', 'credit', 'bank_transfer', 'insurance']).optional(),
})

/**
 * Schema for appointment rescheduling with healthcare compliance
 */
export const RescheduleHealthcareAppointmentSchema = RescheduleAppointmentZod.extend({
  // Healthcare-specific rescheduling requirements
  medicalReason: z.string()
    .max(500, 'Medical reason cannot exceed 500 characters')
    .optional(),
  
  // Insurance coordination
  insuranceNotified: z.boolean().optional(),
  newAuthorizationRequired: z.boolean().optional(),
  
  // Patient communication
  patientNotified: z.boolean().optional(),
  notificationMethod: z.enum(['phone', 'email', 'sms', 'whatsapp', 'in_person']).optional(),
})

/**
 * Schema for appointment waitlist management
 */
export const WaitlistAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  doctorId: z.string().uuid('Invalid doctor ID'),
  clinicId: z.string().uuid('Invalid clinic ID'),
  requestedDate: z.string().date('Invalid requested date format'),
  requestedTimeSlot: z.string()
    .regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours (480 minutes)'),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'urgent'], {
    message: 'Invalid urgency level',
  }),
  contactPreference: z.enum(['phone', 'email', 'sms', 'whatsapp'], {
    message: 'Invalid contact preference',
  }),
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
  createdAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
})

/**
 * Schema for appointment resource allocation
 */
export const AppointmentResourceSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  roomId: z.string().uuid('Invalid room ID'),
  equipmentIds: z.array(z.string().uuid('Invalid equipment ID')).optional(),
  staffIds: z.array(z.string().uuid('Invalid staff ID')).optional(),
  specialRequirements: z.array(z.string()).optional(),
  setupTime: z.number()
    .min(0, 'Setup time cannot be negative')
    .optional(),
  cleanupTime: z.number()
    .min(0, 'Cleanup time cannot be negative')
    .optional(),
})

/**
 * Schema for appointment feedback collection
 */
export const AppointmentFeedbackSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  patientId: z.string().uuid('Invalid patient ID'),
  overallRating: z.number()
    .min(1, 'Overall rating must be at least 1')
    .max(5, 'Overall rating cannot exceed 5'),
  doctorRating: z.number()
    .min(1, 'Doctor rating must be at least 1')
    .max(5, 'Doctor rating cannot exceed 5')
    .optional(),
  facilityRating: z.number()
    .min(1, 'Facility rating must be at least 1')
    .max(5, 'Facility rating cannot exceed 5')
    .optional(),
  staffRating: z.number()
    .min(1, 'Staff rating must be at least 1')
    .max(5, 'Staff rating cannot exceed 5')
    .optional(),
  waitTimeRating: z.number()
    .min(1, 'Wait time rating must be at least 1')
    .max(5, 'Wait time rating cannot exceed 5')
    .optional(),
  comments: z.string()
    .max(2000, 'Comments cannot exceed 2000 characters')
    .optional(),
  recommendations: z.array(z.string()).optional(),
  wouldRecommend: z.boolean().optional(),
  feedbackDate: z.string().datetime('Invalid feedback date format'),
  anonymous: z.boolean().optional(),
})

// =====================================
// TYPE DEFINITIONS
// =====================================

export type BaseAppointment = z.infer<typeof BaseAppointmentSchema>
export type CreateAppointment = z.infer<typeof CreateAppointmentZod>
export type UpdateAppointment = z.infer<typeof UpdateAppointmentZod>
export type AppointmentReminder = z.infer<typeof AppointmentReminderZod>
export type RealTimeAvailability = z.infer<typeof RealTimeAvailabilityZod>
export type NoShowPrediction = z.infer<typeof NoShowPredictionZod>
export type CancelAppointment = z.infer<typeof CancelAppointmentZod>
export type RescheduleAppointment = z.infer<typeof RescheduleAppointmentZod>
export type AppointmentSearchFilters = z.infer<typeof AppointmentSearchFiltersZod>
export type AppointmentStatistics = z.infer<typeof AppointmentStatisticsZod>
export type HealthcareAppointment = z.infer<typeof HealthcareAppointmentSchema>
export type CreateHealthcareAppointment = z.infer<typeof CreateHealthcareAppointmentSchema>
export type UpdateHealthcareAppointment = z.infer<typeof UpdateHealthcareAppointmentSchema>
export type CancelHealthcareAppointment = z.infer<typeof CancelHealthcareAppointmentSchema>
export type RescheduleHealthcareAppointment = z.infer<typeof RescheduleHealthcareAppointmentSchema>
export type WaitlistAppointment = z.infer<typeof WaitlistAppointmentSchema>
export type AppointmentResource = z.infer<typeof AppointmentResourceSchema>
export type AppointmentFeedback = z.infer<typeof AppointmentFeedbackSchema>