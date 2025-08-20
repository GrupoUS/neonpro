import { z } from 'zod';

/**
 * 📅 Appointment Schemas - NeonPro Healthcare
 * ===========================================
 * 
 * Schemas Zod para validação de agendamentos médicos
 * com validações específicas do domínio de estética.
 */

// Appointment status enum
export const AppointmentStatus = z.enum([
  'scheduled',    // Agendado
  'confirmed',    // Confirmado
  'in_progress',  // Em andamento
  'completed',    // Concluído
  'cancelled',    // Cancelado
  'no_show',      // Paciente não compareceu
  'rescheduled'   // Reagendado
]);

// Appointment types for aesthetic clinic
export const AppointmentType = z.enum([
  'consultation',        // Consulta inicial
  'follow_up',          // Retorno
  'botox',              // Aplicação de Botox
  'filler',             // Preenchimento
  'laser_hair_removal', // Depilação a laser
  'chemical_peel',      // Peeling químico
  'microneedling',      // Microagulhamento
  'hydrafacial',        // Hydrafacial
  'laser_treatment',    // Tratamento a laser
  'fat_reduction',      // Redução de gordura
  'skin_tightening',    // Lifting não cirúrgico
  'assessment',         // Avaliação
  'other'               // Outro
]);

// Priority levels
export const AppointmentPriority = z.enum([
  'low',      // Baixa
  'normal',   // Normal
  'high',     // Alta
  'urgent'    // Urgente
]);

// Base appointment schema
export const AppointmentBaseSchema = z.object({
  // Core appointment data
  patientId: z.string().uuid('ID do paciente deve ser um UUID válido'),
  professionalId: z.string().uuid('ID do profissional deve ser um UUID válido'),
  clinicId: z.string().uuid('ID da clínica deve ser um UUID válido'),
  
  // Schedule information
  scheduledAt: z.string()
    .datetime('Data deve estar no formato ISO datetime')
    .refine((date) => {
      const appointmentDate = new Date(date);
      const now = new Date();
      // Must be in the future (at least 1 hour from now)
      return appointmentDate.getTime() > now.getTime() + (60 * 60 * 1000);
    }, 'Agendamento deve ser pelo menos 1 hora no futuro'),
  
  duration: z.number()
    .min(15, 'Duração mínima é 15 minutos')
    .max(480, 'Duração máxima é 8 horas')
    .multipleOf(15, 'Duração deve ser múltipla de 15 minutos'),
  
  // Appointment details
  type: AppointmentType,
  status: AppointmentStatus.default('scheduled'),
  priority: AppointmentPriority.default('normal'),
  
  // Description and notes
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  
  notes: z.string()
    .max(2000, 'Notas devem ter no máximo 2000 caracteres')
    .optional(),
  
  // Treatment specific
  treatmentArea: z.string()
    .max(100, 'Área de tratamento deve ter no máximo 100 caracteres')
    .optional(),
  
  estimatedCost: z.number()
    .min(0, 'Custo não pode ser negativo')
    .max(50000, 'Custo máximo é R$ 50.000')
    .optional(),
  
  // Preparation and follow-up
  preAppointmentInstructions: z.string()
    .max(1000, 'Instruções pré-consulta devem ter no máximo 1000 caracteres')
    .optional(),
  
  postAppointmentInstructions: z.string()
    .max(1000, 'Instruções pós-consulta devem ter no máximo 1000 caracteres')
    .optional(),
});

// Create appointment schema
export const CreateAppointmentSchema = AppointmentBaseSchema.omit({
  status: true, // Will be set to 'scheduled' by default
});

// Update appointment schema
export const UpdateAppointmentSchema = AppointmentBaseSchema
  .partial()
  .extend({
    id: z.string().uuid('ID deve ser um UUID válido'),
    // Additional fields for updates
    cancelReason: z.string()
      .max(500, 'Motivo do cancelamento deve ter no máximo 500 caracteres')
      .optional(),
    
    rescheduleReason: z.string()
      .max(500, 'Motivo do reagendamento deve ter no máximo 500 caracteres')
      .optional(),
  });

// Reschedule appointment schema
export const RescheduleAppointmentSchema = z.object({
  id: z.string().uuid(),
  newScheduledAt: z.string().datetime(),
  reason: z.string().max(500).optional(),
});

// Cancel appointment schema
export const CancelAppointmentSchema = z.object({
  id: z.string().uuid(),
  reason: z.string()
    .min(10, 'Motivo deve ter pelo menos 10 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres'),
  cancelledBy: z.enum(['patient', 'professional', 'clinic', 'system']),
});

// Appointment response schema
export const AppointmentResponseSchema = AppointmentBaseSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  
  // Populated relations
  patient: z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
  }).optional(),
  
  professional: z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    specialization: z.string(),
    title: z.string(),
  }).optional(),
  
  clinic: z.object({
    id: z.string().uuid(),
    name: z.string(),
    address: z.string(),
  }).optional(),
});

// Search/filter appointments
export const AppointmentSearchSchema = z.object({
  // Date filters
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  
  // Entity filters
  patientId: z.string().uuid().optional(),
  professionalId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  
  // Status and type filters
  status: AppointmentStatus.optional(),
  type: AppointmentType.optional(),
  priority: AppointmentPriority.optional(),
  
  // Text search
  query: z.string().max(100).optional(),
  
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  // Sorting
  sortBy: z.enum(['scheduledAt', 'createdAt', 'updatedAt', 'priority']).default('scheduledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Appointment availability schema
export const AvailabilitySearchSchema = z.object({
  professionalId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  duration: z.number().min(15).max(480).multipleOf(15),
});

// Time slot schema
export const TimeSlotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  available: z.boolean(),
  reason: z.string().optional(), // Why not available
});

// Export types
export type AppointmentStatus = z.infer<typeof AppointmentStatus>;
export type AppointmentType = z.infer<typeof AppointmentType>;
export type AppointmentPriority = z.infer<typeof AppointmentPriority>;
export type AppointmentBase = z.infer<typeof AppointmentBaseSchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof UpdateAppointmentSchema>;
export type RescheduleAppointment = z.infer<typeof RescheduleAppointmentSchema>;
export type CancelAppointment = z.infer<typeof CancelAppointmentSchema>;
export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;
export type AppointmentSearch = z.infer<typeof AppointmentSearchSchema>;
export type AvailabilitySearch = z.infer<typeof AvailabilitySearchSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;