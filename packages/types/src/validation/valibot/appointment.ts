import * as v from 'valibot'

/**
 * Appointment status enum
 */
const AppointmentStatusSchema = v.enum({
  scheduled: 'scheduled',
  confirmed: 'confirmed',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'no_show',
  rescheduled: 'rescheduled',
})

/**
 * Appointment priority enum
 */
const AppointmentPrioritySchema = v.enum({
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
})

/**
 * Appointment type enum
 */
const AppointmentTypeSchema = v.enum({
  consultation: 'consultation',
  follow_up: 'follow_up',
  emergency: 'emergency',
  procedure: 'procedure',
  surgery: 'surgery',
  therapy: 'therapy',
  vaccination: 'vaccination',
  check_up: 'check_up',
})

/**
 * Cancellation reason enum
 */
const CancellationReasonSchema = v.enum({
  patient_cancelled: 'patient_cancelled',
  professional_cancelled: 'professional_cancelled',
  clinic_cancelled: 'clinic_cancelled',
  no_show: 'no_show',
  medical_reason: 'medical_reason',
  scheduling_error: 'scheduling_error',
  other: 'other',
})

/**
 * Base appointment schema
 */
export const BaseAppointmentSchema = v.object({
  id: v.string(),
  clinicId: v.string(),
  patientId: v.string(),
  professionalId: v.string(),
  serviceTypeId: v.optional(v.string()),
  startTime: v.string(),
  endTime: v.string(),
  duration: v.optional(v.number()),
  status: AppointmentStatusSchema,
  priority: v.optional(AppointmentPrioritySchema),
  type: AppointmentTypeSchema,
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),
  diagnosis: v.optional(v.string()),
  treatment: v.optional(v.string()),
  prescription: v.optional(v.string()),
  reminderSentAt: v.optional(v.string()),
  confirmationSentAt: v.optional(v.string()),
  whatsappReminderSent: v.optional(v.boolean()),
  smsReminderSent: v.optional(v.boolean()),
  emailReminderSent: v.optional(v.boolean()),
  roomId: v.optional(v.string()),
  location: v.optional(v.string()),
  virtualMeetingLink: v.optional(v.string()),
  cancelledAt: v.optional(v.string()),
  cancelledBy: v.optional(v.string()),
  cancellationReason: v.optional(CancellationReasonSchema),
  cancellationNotes: v.optional(v.string()),
  rescheduledFrom: v.optional(v.string()),
  rescheduledTo: v.optional(v.string()),
  billingCode: v.optional(v.string()),
  insuranceApproved: v.optional(v.boolean()),
  cost: v.optional(v.number()),
  paidAmount: v.optional(v.number()),
  createdAt: v.string(),
  updatedAt: v.string(),
  createdBy: v.string(),
  updatedBy: v.optional(v.string()),
})

/**
 * Appointment creation schema (without generated fields)
 */
export const CreateAppointmentSchema = v.object({
  clinicId: v.string(),
  patientId: v.string(),
  professionalId: v.string(),
  serviceTypeId: v.optional(v.string()),
  startTime: v.string(),
  endTime: v.string(),
  duration: v.optional(v.number()),
  status: v.optional(AppointmentStatusSchema),
  priority: v.optional(AppointmentPrioritySchema),
  type: v.optional(AppointmentTypeSchema),
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),
  diagnosis: v.optional(v.string()),
  treatment: v.optional(v.string()),
  prescription: v.optional(v.string()),
  roomId: v.optional(v.string()),
  location: v.optional(v.string()),
  virtualMeetingLink: v.optional(v.string()),
  billingCode: v.optional(v.string()),
  insuranceApproved: v.optional(v.boolean()),
  cost: v.optional(v.number()),
  paidAmount: v.optional(v.number()),
})

/**
 * Appointment update schema (all fields optional)
 */
export const UpdateAppointmentSchema = v.partial(BaseAppointmentSchema)

/**
 * Calendar view appointment schema
 */
export const CalendarAppointmentSchema = v.object({
  id: v.string(),
  clinicId: v.string(),
  patientId: v.string(),
  professionalId: v.string(),
  serviceTypeId: v.optional(v.string()),
  startTime: v.string(),
  endTime: v.string(),
  duration: v.optional(v.number()),
  status: AppointmentStatusSchema,
  priority: v.optional(AppointmentPrioritySchema),
  type: AppointmentTypeSchema,
  title: v.string(),
  start: v.union([v.date(), v.string()]),
  end: v.union([v.date(), v.string()]),
  color: v.optional(v.string()),
  description: v.optional(v.string()),
  allDay: v.optional(v.boolean()),
  resource: v.optional(v.any()),
  location: v.optional(v.string()),
  virtualMeetingLink: v.optional(v.string()),
  cancelledAt: v.optional(v.string()),
  cancelledBy: v.optional(v.string()),
  cancellationReason: v.optional(CancellationReasonSchema),
  createdAt: v.string(),
  updatedAt: v.string(),
  createdBy: v.string(),
  updatedBy: v.optional(v.string()),
})

// Type exports
export type AppointmentStatus = v.InferOutput<typeof AppointmentStatusSchema>
export type AppointmentPriority = v.InferOutput<typeof AppointmentPrioritySchema>
export type AppointmentType = v.InferOutput<typeof AppointmentTypeSchema>
export type BaseAppointment = v.InferOutput<typeof BaseAppointmentSchema>
export type CreateAppointment = v.InferOutput<typeof CreateAppointmentSchema>
export type UpdateAppointment = v.InferOutput<typeof UpdateAppointmentSchema>
export type CalendarAppointment = v.InferOutput<typeof CalendarAppointmentSchema>