"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentNotificationSchema = exports.appointmentReportSchema = exports.appointmentRescheduleSchema = exports.appointmentCancellationSchema = exports.appointmentConfirmationSchema = exports.availableTimesSchema = exports.availabilitySchema = exports.appointmentFiltersSchema = exports.updateAppointmentSchema = exports.appointmentSchema = void 0;
var zod_1 = require("zod");
// Schema para agendamento
exports.appointmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    // Informações básicas do agendamento
    patientId: zod_1.z.string().uuid(),
    professionalId: zod_1.z.string().uuid(),
    treatmentId: zod_1.z.string().uuid().optional(),
    // Data e horário
    scheduledDate: zod_1.z.date(),
    duration: zod_1.z.number().min(15, 'Duração mínima de 15 minutos').max(480, 'Duração máxima de 8 horas'),
    // Status do agendamento
    status: zod_1.z.enum([
        'scheduled', // Agendado
        'confirmed', // Confirmado pelo paciente
        'in_progress', // Em andamento
        'completed', // Concluído
        'cancelled', // Cancelado
        'no_show', // Paciente não compareceu
        'rescheduled' // Reagendado
    ]).default('scheduled'),
    // Tipo de agendamento
    type: zod_1.z.enum([
        'consultation', // Consulta
        'treatment', // Tratamento
        'follow_up', // Retorno
        'procedure', // Procedimento
        'evaluation', // Avaliação
        'emergency' // Emergência
    ]),
    // Informações adicionais
    notes: zod_1.z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional(),
    internalNotes: zod_1.z.string().max(1000, 'Notas internas não podem exceder 1000 caracteres').optional(),
    // Confirmação e lembretes
    confirmationRequired: zod_1.z.boolean().default(true),
    confirmedAt: zod_1.z.date().optional(),
    confirmationMethod: zod_1.z.enum(['email', 'sms', 'whatsapp', 'phone']).optional(),
    // Lembretes
    reminders: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['email', 'sms', 'whatsapp', 'push']),
        scheduledFor: zod_1.z.date(),
        sent: zod_1.z.boolean().default(false),
        sentAt: zod_1.z.date().optional()
    })).default([]),
    // Sala/equipamento
    roomId: zod_1.z.string().uuid().optional(),
    equipmentIds: zod_1.z.array(zod_1.z.string().uuid()).default([]),
    // Informações de pagamento
    paymentStatus: zod_1.z.enum(['pending', 'partial', 'paid', 'refunded']).default('pending'),
    paymentAmount: zod_1.z.number().min(0).optional(),
    // Metadados
    createdAt: zod_1.z.date().default(function () { return new Date(); }),
    updatedAt: zod_1.z.date().default(function () { return new Date(); }),
    createdBy: zod_1.z.string().uuid(),
    updatedBy: zod_1.z.string().uuid().optional(),
    // Informações de cancelamento/reagendamento
    cancellationReason: zod_1.z.string().optional(),
    cancelledAt: zod_1.z.date().optional(),
    cancelledBy: zod_1.z.string().uuid().optional(),
    originalAppointmentId: zod_1.z.string().uuid().optional() // Para reagendamentos
});
// Schema para atualização de agendamento
exports.updateAppointmentSchema = exports.appointmentSchema.partial().extend({
    id: zod_1.z.string().uuid(),
    updatedAt: zod_1.z.date().default(function () { return new Date(); }),
    updatedBy: zod_1.z.string().uuid()
});
// Schema para filtros de agendamento
exports.appointmentFiltersSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid().optional(),
    professionalId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.array(exports.appointmentSchema.shape.status).optional(),
    type: zod_1.z.array(exports.appointmentSchema.shape.type).optional(),
    dateFrom: zod_1.z.date().optional(),
    dateTo: zod_1.z.date().optional(),
    roomId: zod_1.z.string().uuid().optional(),
    paymentStatus: zod_1.z.array(exports.appointmentSchema.shape.paymentStatus).optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['scheduledDate', 'createdAt', 'patientName', 'status']).default('scheduledDate'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc')
});
// Schema para disponibilidade de horários
exports.availabilitySchema = zod_1.z.object({
    professionalId: zod_1.z.string().uuid(),
    date: zod_1.z.date(),
    startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    isAvailable: zod_1.z.boolean().default(true),
    reason: zod_1.z.string().optional() // Motivo da indisponibilidade
});
// Schema para busca de horários disponíveis
exports.availableTimesSchema = zod_1.z.object({
    professionalId: zod_1.z.string().uuid(),
    treatmentId: zod_1.z.string().uuid().optional(),
    dateFrom: zod_1.z.date(),
    dateTo: zod_1.z.date(),
    duration: zod_1.z.number().min(15).max(480).default(60), // Duração em minutos
    timeSlots: zod_1.z.enum(['15', '30', '60']).default('30') // Intervalos de tempo
});
// Schema para confirmação de agendamento
exports.appointmentConfirmationSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().uuid(),
    confirmationMethod: zod_1.z.enum(['email', 'sms', 'whatsapp', 'phone']),
    confirmedBy: zod_1.z.enum(['patient', 'clinic', 'system']),
    notes: zod_1.z.string().max(500).optional()
});
// Schema para cancelamento de agendamento
exports.appointmentCancellationSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().uuid(),
    reason: zod_1.z.string().min(5, 'Motivo do cancelamento é obrigatório'),
    cancelledBy: zod_1.z.string().uuid(),
    refundAmount: zod_1.z.number().min(0).optional(),
    notifyPatient: zod_1.z.boolean().default(true),
    allowReschedule: zod_1.z.boolean().default(true)
});
// Schema para reagendamento
exports.appointmentRescheduleSchema = zod_1.z.object({
    originalAppointmentId: zod_1.z.string().uuid(),
    newScheduledDate: zod_1.z.date(),
    newProfessionalId: zod_1.z.string().uuid().optional(),
    reason: zod_1.z.string().min(5, 'Motivo do reagendamento é obrigatório'),
    rescheduledBy: zod_1.z.string().uuid(),
    notifyPatient: zod_1.z.boolean().default(true)
});
// Schema para relatório de agendamentos
exports.appointmentReportSchema = zod_1.z.object({
    dateFrom: zod_1.z.date(),
    dateTo: zod_1.z.date(),
    professionalIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    treatmentIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    statuses: zod_1.z.array(exports.appointmentSchema.shape.status).optional(),
    includeFinancialData: zod_1.z.boolean().default(false),
    includePatientData: zod_1.z.boolean().default(false),
    groupBy: zod_1.z.enum(['day', 'week', 'month', 'professional', 'treatment']).default('day')
});
// Schema para notificações de agendamento
exports.appointmentNotificationSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['confirmation', 'reminder', 'cancellation', 'rescheduling']),
    method: zod_1.z.enum(['email', 'sms', 'whatsapp', 'push']),
    scheduledFor: zod_1.z.date().optional(), // Para lembretes agendados
    templateId: zod_1.z.string().optional(),
    customMessage: zod_1.z.string().max(500).optional()
});
