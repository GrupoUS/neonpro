import type { z } from "zod";

// Schema para agendamento
export const appointmentSchema = z.object({
  id: z.string().uuid().optional(),

  // Informações básicas do agendamento
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  treatmentId: z.string().uuid().optional(),

  // Data e horário
  scheduledDate: z.date(),
  duration: z
    .number()
    .min(15, "Duração mínima de 15 minutos")
    .max(480, "Duração máxima de 8 horas"),

  // Status do agendamento
  status: z
    .enum([
      "scheduled", // Agendado
      "confirmed", // Confirmado pelo paciente
      "in_progress", // Em andamento
      "completed", // Concluído
      "cancelled", // Cancelado
      "no_show", // Paciente não compareceu
      "rescheduled", // Reagendado
    ])
    .default("scheduled"),

  // Tipo de agendamento
  type: z.enum([
    "consultation", // Consulta
    "treatment", // Tratamento
    "follow_up", // Retorno
    "procedure", // Procedimento
    "evaluation", // Avaliação
    "emergency", // Emergência
  ]),

  // Informações adicionais
  notes: z.string().max(1000, "Notas não podem exceder 1000 caracteres").optional(),
  internalNotes: z
    .string()
    .max(1000, "Notas internas não podem exceder 1000 caracteres")
    .optional(),

  // Confirmação e lembretes
  confirmationRequired: z.boolean().default(true),
  confirmedAt: z.date().optional(),
  confirmationMethod: z.enum(["email", "sms", "whatsapp", "phone"]).optional(),

  // Lembretes
  reminders: z
    .array(
      z.object({
        type: z.enum(["email", "sms", "whatsapp", "push"]),
        scheduledFor: z.date(),
        sent: z.boolean().default(false),
        sentAt: z.date().optional(),
      }),
    )
    .default([]),

  // Sala/equipamento
  roomId: z.string().uuid().optional(),
  equipmentIds: z.array(z.string().uuid()).default([]),

  // Informações de pagamento
  paymentStatus: z.enum(["pending", "partial", "paid", "refunded"]).default("pending"),
  paymentAmount: z.number().min(0).optional(),

  // Metadados
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),

  // Informações de cancelamento/reagendamento
  cancellationReason: z.string().optional(),
  cancelledAt: z.date().optional(),
  cancelledBy: z.string().uuid().optional(),
  originalAppointmentId: z.string().uuid().optional(), // Para reagendamentos
});

// Schema para atualização de agendamento
export const updateAppointmentSchema = appointmentSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date().default(() => new Date()),
  updatedBy: z.string().uuid(),
});

// Schema para filtros de agendamento
export const appointmentFiltersSchema = z.object({
  patientId: z.string().uuid().optional(),
  professionalId: z.string().uuid().optional(),
  status: z.array(appointmentSchema.shape.status).optional(),
  type: z.array(appointmentSchema.shape.type).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  roomId: z.string().uuid().optional(),
  paymentStatus: z.array(appointmentSchema.shape.paymentStatus).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(["scheduledDate", "createdAt", "patientName", "status"]).default("scheduledDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Schema para disponibilidade de horários
export const availabilitySchema = z.object({
  professionalId: z.string().uuid(),
  date: z.date(),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  isAvailable: z.boolean().default(true),
  reason: z.string().optional(), // Motivo da indisponibilidade
});

// Schema para busca de horários disponíveis
export const availableTimesSchema = z.object({
  professionalId: z.string().uuid(),
  treatmentId: z.string().uuid().optional(),
  dateFrom: z.date(),
  dateTo: z.date(),
  duration: z.number().min(15).max(480).default(60), // Duração em minutos
  timeSlots: z.enum(["15", "30", "60"]).default("30"), // Intervalos de tempo
});

// Schema para confirmação de agendamento
export const appointmentConfirmationSchema = z.object({
  appointmentId: z.string().uuid(),
  confirmationMethod: z.enum(["email", "sms", "whatsapp", "phone"]),
  confirmedBy: z.enum(["patient", "clinic", "system"]),
  notes: z.string().max(500).optional(),
});

// Schema para cancelamento de agendamento
export const appointmentCancellationSchema = z.object({
  appointmentId: z.string().uuid(),
  reason: z.string().min(5, "Motivo do cancelamento é obrigatório"),
  cancelledBy: z.string().uuid(),
  refundAmount: z.number().min(0).optional(),
  notifyPatient: z.boolean().default(true),
  allowReschedule: z.boolean().default(true),
});

// Schema para reagendamento
export const appointmentRescheduleSchema = z.object({
  originalAppointmentId: z.string().uuid(),
  newScheduledDate: z.date(),
  newProfessionalId: z.string().uuid().optional(),
  reason: z.string().min(5, "Motivo do reagendamento é obrigatório"),
  rescheduledBy: z.string().uuid(),
  notifyPatient: z.boolean().default(true),
});

// Schema para relatório de agendamentos
export const appointmentReportSchema = z.object({
  dateFrom: z.date(),
  dateTo: z.date(),
  professionalIds: z.array(z.string().uuid()).optional(),
  treatmentIds: z.array(z.string().uuid()).optional(),
  statuses: z.array(appointmentSchema.shape.status).optional(),
  includeFinancialData: z.boolean().default(false),
  includePatientData: z.boolean().default(false),
  groupBy: z.enum(["day", "week", "month", "professional", "treatment"]).default("day"),
});

// Schema para notificações de agendamento
export const appointmentNotificationSchema = z.object({
  appointmentId: z.string().uuid(),
  type: z.enum(["confirmation", "reminder", "cancellation", "rescheduling"]),
  method: z.enum(["email", "sms", "whatsapp", "push"]),
  scheduledFor: z.date().optional(), // Para lembretes agendados
  templateId: z.string().optional(),
  customMessage: z.string().max(500).optional(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;
export type AppointmentFilters = z.infer<typeof appointmentFiltersSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type AvailableTimes = z.infer<typeof availableTimesSchema>;
export type AppointmentConfirmation = z.infer<typeof appointmentConfirmationSchema>;
export type AppointmentCancellation = z.infer<typeof appointmentCancellationSchema>;
export type AppointmentReschedule = z.infer<typeof appointmentRescheduleSchema>;
export type AppointmentReport = z.infer<typeof appointmentReportSchema>;
export type AppointmentNotification = z.infer<typeof appointmentNotificationSchema>;
