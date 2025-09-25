import { z } from 'zod'

/**
 * Minimal shared API contracts for Aesthetic Scheduling
 * Keep KISS/YAGNI: only fields required by current web flows.
 */

// Request
export const MultiSessionSchedulingRequestSchema = z.object({
  patientId: z.string().uuid(),
  procedures: z.array(z.string().uuid()).min(1),
  preferredDates: z.array(z.string()), // ISO strings at API boundary
  preferredProfessionals: z.array(z.string().uuid()).optional(),
  urgencyLevel: z.enum(['routine', 'priority', 'urgent']),
  specialRequirements: z.array(z.string()).optional(),
  medicalHistory: z
    .object({
      pregnancyStatus: z
        .enum(['none', 'pregnant', 'breastfeeding', 'planning'])
        .optional(),
      contraindications: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      allergies: z.array(z.string()).optional(),
    })
    .optional(),
})

// Minimal appointment summary returned by the API
export const AestheticAppointmentSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  procedureId: z.string().uuid().optional(),
  startTime: z.string(), // ISO
  endTime: z.string(), // ISO
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
})

export const AestheticSchedulingResponseSchema = z.object({
  success: z.literal(true),
  appointments: z.array(AestheticAppointmentSchema),
  totalCost: z.number(),
  totalDuration: z.number(), // minutes
  // Minimal compliance flags (expand later as needed)
  complianceStatus: z
    .object({
      anvisaCompliant: z.boolean(),
      cfmValidated: z.boolean(),
      lgpdCompliant: z.boolean(),
    })
    .optional(),
})

// Inferred types
export type MultiSessionSchedulingRequest = z.infer<
  typeof MultiSessionSchedulingRequestSchema
>
export type AestheticAppointment = z.infer<typeof AestheticAppointmentSchema>
export type AestheticSchedulingResponse = z.infer<
  typeof AestheticSchedulingResponseSchema
>

