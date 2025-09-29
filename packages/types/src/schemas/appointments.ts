import { z } from 'zod';

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  service_type: z.string().min(1),
  notes: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().positive(),
  lgpd_processing_consent: z.boolean(),
});

export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  version: true,
}).extend({
  // Additional validation for creation
  start_time: z.string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), 'Start time must be in the future'),
  end_time: z.string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), 'End time must be in the future'),
});

export const UpdateAppointmentSchema = AppointmentSchema.partial().extend({
  id: z.string().uuid(),
  version: z.number().positive(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof UpdateAppointmentSchema>;