import { z } from "zod";

// Appointment Status Schema
export const AppointmentStatusSchema = z.enum([
	"scheduled", // Agendado
	"confirmed", // Confirmado
	"in_progress", // Em andamento
	"completed", // Concluído
	"cancelled", // Cancelado
	"no_show", // Falta
	"rescheduled", // Reagendado
]);

// Appointment Type Schema
export const AppointmentTypeSchema = z.enum([
	"consultation", // Consulta
	"follow_up", // Retorno
	"procedure", // Procedimento
	"evaluation", // Avaliação
	"emergency", // Emergência
	"online_consultation", // Teleconsulta
]);

// Appointment Priority Schema
export const AppointmentPrioritySchema = z.enum([
	"low", // Baixa
	"normal", // Normal
	"high", // Alta
	"urgent", // Urgente
]);

// Time Slot Schema
export const TimeSlotSchema = z.object({
	start_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
	end_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
	is_available: z.boolean().default(true),
	professional_id: z.string().uuid().optional(),
	date: z.string().date("Data deve estar em formato válido"),
});

// Payment Status Schema
export const PaymentStatusSchema = z.enum([
	"pending", // Pendente
	"paid", // Pago
	"partial", // Parcial
	"overdue", // Em atraso
	"cancelled", // Cancelado
	"refunded", // Reembolsado
]);

// Payment Method Schema
export const PaymentMethodSchema = z.enum([
	"cash", // Dinheiro
	"credit_card", // Cartão de crédito
	"debit_card", // Cartão de débito
	"pix", // PIX
	"bank_transfer", // Transferência bancária
	"insurance", // Plano de saúde
	"installments", // Parcelado
]);

// Cancellation Reason Schema
export const CancellationReasonSchema = z.enum([
	"patient_request", // Solicitação do paciente
	"professional_unavailable", // Profissional indisponível
	"clinic_closure", // Fechamento da clínica
	"emergency", // Emergência
	"weather", // Clima
	"equipment_failure", // Falha no equipamento
	"other", // Outro
]);

// Reminder Schema
export const AppointmentReminderSchema = z.object({
	id: z.string().uuid().optional(),
	type: z.enum(["email", "sms", "whatsapp", "push"]),
	sent_at: z.string().datetime().optional(),
	status: z.enum(["pending", "sent", "failed", "cancelled"]).default("pending"),
	scheduled_for: z.string().datetime(),
	message_template: z.string().optional(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
});

// Appointment Note Schema
export const AppointmentNoteSchema = z.object({
	id: z.string().uuid().optional(),
	content: z
		.string()
		.min(1, "Nota não pode estar vazia")
		.max(2000, "Nota deve ter no máximo 2000 caracteres"),
	type: z
		.enum(["clinical", "administrative", "billing", "follow_up"])
		.default("clinical"),
	is_private: z.boolean().default(false),
	author_id: z.string().uuid(),
	author_name: z.string(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
});

// Vital Signs Schema
export const VitalSignsSchema = z.object({
	id: z.string().uuid().optional(),
	systolic_bp: z.number().min(50).max(300).optional(), // mmHg
	diastolic_bp: z.number().min(30).max(200).optional(), // mmHg
	heart_rate: z.number().min(30).max(200).optional(), // bpm
	temperature: z.number().min(30).max(45).optional(), // °C
	respiratory_rate: z.number().min(5).max(60).optional(), // rpm
	oxygen_saturation: z.number().min(70).max(100).optional(), // %
	height: z.number().min(50).max(250).optional(), // cm
	weight: z.number().min(20).max(300).optional(), // kg
	bmi: z.number().min(10).max(60).optional(),
	pain_level: z.number().min(0).max(10).optional(), // 0-10 scale
	recorded_by: z.string().uuid(),
	recorded_at: z.string().datetime(),
	notes: z.string().max(500).optional(),
});

// Prescription Schema
export const PrescriptionSchema = z.object({
	id: z.string().uuid().optional(),
	medication_name: z
		.string()
		.min(2, "Nome do medicamento deve ter pelo menos 2 caracteres")
		.max(200, "Nome do medicamento deve ter no máximo 200 caracteres"),
	dosage: z
		.string()
		.min(1, "Dosagem é obrigatória")
		.max(100, "Dosagem deve ter no máximo 100 caracteres"),
	frequency: z
		.string()
		.min(1, "Frequência é obrigatória")
		.max(100, "Frequência deve ter no máximo 100 caracteres"),
	duration: z
		.string()
		.min(1, "Duração é obrigatória")
		.max(100, "Duração deve ter no máximo 100 caracteres"),
	instructions: z.string().max(500).optional(),
	is_controlled: z.boolean().default(false),
	generic_allowed: z.boolean().default(true),
	prescribed_by: z.string().uuid(),
	prescribed_at: z.string().datetime(),
	status: z.enum(["active", "completed", "cancelled"]).default("active"),
});

// Service Performed Schema
export const ServicePerformedSchema = z.object({
	id: z.string().uuid().optional(),
	service_id: z.string().uuid(),
	service_name: z.string(),
	quantity: z.number().min(1).default(1),
	unit_price: z.number().min(0),
	total_price: z.number().min(0),
	discount_amount: z.number().min(0).default(0),
	final_price: z.number().min(0),
	performed_by: z.string().uuid(),
	duration_minutes: z.number().min(1).optional(),
	notes: z.string().max(1000).optional(),
	complications: z.string().max(1000).optional(),
	outcome: z
		.enum(["successful", "partial", "complications", "cancelled"])
		.default("successful"),
});

// File Attachment Schema
export const FileAttachmentSchema = z.object({
	id: z.string().uuid().optional(),
	filename: z
		.string()
		.min(1, "Nome do arquivo é obrigatório")
		.max(255, "Nome do arquivo deve ter no máximo 255 caracteres"),
	original_name: z.string(),
	file_path: z.string(),
	file_size: z.number().min(0),
	mime_type: z.string(),
	file_type: z.enum(["image", "document", "video", "audio", "other"]),
	description: z.string().max(500).optional(),
	is_public: z.boolean().default(false),
	uploaded_by: z.string().uuid(),
	uploaded_at: z.string().datetime(),
});

// Base Appointment Schema
export const AppointmentBaseSchema = z.object({
	id: z.string().uuid(),

	// Basic Information
	appointment_number: z.string().optional(),
	patient_id: z.string().uuid(),
	professional_id: z.string().uuid(),
	clinic_id: z.string().uuid(),
	service_id: z.string().uuid().optional(),

	// Scheduling Details
	scheduled_date: z.string().date(),
	scheduled_time: z
		.string()
		.regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:MM"),
	duration_minutes: z.number().min(15).max(480).default(60),
	end_time: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional(),

	// Status and Type
	status: AppointmentStatusSchema,
	type: AppointmentTypeSchema,
	priority: AppointmentPrioritySchema.default("normal"),

	// Patient Information
	patient_name: z.string(),
	patient_phone: z.string(),
	patient_email: z.string().email().optional(),

	// Professional Information
	professional_name: z.string(),
	professional_specialization: z.string().optional(),

	// Service Information
	service_name: z.string().optional(),
	service_category: z.string().optional(),

	// Clinical Data
	chief_complaint: z.string().max(1000).optional(),
	symptoms: z.string().max(2000).optional(),
	diagnosis: z.string().max(2000).optional(),
	treatment_plan: z.string().max(2000).optional(),

	// Vital Signs and Clinical Records
	vital_signs: VitalSignsSchema.optional(),
	services_performed: z.array(ServicePerformedSchema).default([]),
	prescriptions: z.array(PrescriptionSchema).default([]),
	notes: z.array(AppointmentNoteSchema).default([]),
	file_attachments: z.array(FileAttachmentSchema).default([]),

	// Follow-up
	follow_up_required: z.boolean().default(false),
	follow_up_date: z.string().date().optional(),
	follow_up_notes: z.string().max(1000).optional(),

	// Billing Information
	estimated_cost: z.number().min(0).optional(),
	final_cost: z.number().min(0).optional(),
	payment_status: PaymentStatusSchema.default("pending"),
	payment_method: PaymentMethodSchema.optional(),
	insurance_covered: z.boolean().default(false),
	insurance_amount: z.number().min(0).optional(),

	// Cancellation Details
	cancellation_reason: CancellationReasonSchema.optional(),
	cancellation_notes: z.string().max(1000).optional(),
	cancelled_by: z.string().uuid().optional(),
	cancelled_at: z.string().datetime().optional(),

	// Reminders
	reminders: z.array(AppointmentReminderSchema).default([]),

	// Timestamps
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
	checked_in_at: z.string().datetime().optional(),
	started_at: z.string().datetime().optional(),
	completed_at: z.string().datetime().optional(),

	// Metadata
	room_number: z.string().max(20).optional(),
	special_instructions: z.string().max(1000).optional(),
	tags: z.array(z.string()).default([]),
});

// Appointment Query Schema
export const AppointmentQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),

	// Filters
	patient_id: z.string().uuid().optional(),
	professional_id: z.string().uuid().optional(),
	clinic_id: z.string().uuid().optional(),
	service_id: z.string().uuid().optional(),

	status: AppointmentStatusSchema.optional(),
	type: AppointmentTypeSchema.optional(),
	priority: AppointmentPrioritySchema.optional(),
	payment_status: PaymentStatusSchema.optional(),

	// Date filters
	date_from: z.string().date().optional(),
	date_to: z.string().date().optional(),
	scheduled_date: z.string().date().optional(),

	// Search
	search: z.string().max(100).optional(),

	// Sorting
	sort_by: z
		.enum([
			"scheduled_date",
			"created_at",
			"patient_name",
			"professional_name",
			"status",
			"priority",
		])
		.default("scheduled_date"),
	sort_order: z.enum(["asc", "desc"]).default("asc"),

	// Special filters
	today_only: z.coerce.boolean().optional(),
	upcoming_only: z.coerce.boolean().optional(),
	overdue_only: z.coerce.boolean().optional(),
});

// Create Appointment Schema
export const CreateAppointmentSchema = z.object({
	patient_id: z.string().uuid(),
	professional_id: z.string().uuid(),
	clinic_id: z.string().uuid(),
	service_id: z.string().uuid().optional(),

	scheduled_date: z.string().date(),
	scheduled_time: z
		.string()
		.regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:MM"),
	duration_minutes: z.number().min(15).max(480).default(60),

	type: AppointmentTypeSchema.default("consultation"),
	priority: AppointmentPrioritySchema.default("normal"),

	chief_complaint: z.string().max(1000).optional(),
	special_instructions: z.string().max(1000).optional(),

	estimated_cost: z.number().min(0).optional(),
	room_number: z.string().max(20).optional(),

	// Reminder preferences
	send_reminders: z.boolean().default(true),
	reminder_methods: z
		.array(z.enum(["email", "sms", "whatsapp"]))
		.default(["email"]),

	notes: z.string().max(2000).optional(),
});

// Update Appointment Schema
export const UpdateAppointmentSchema = z.object({
	scheduled_date: z.string().date().optional(),
	scheduled_time: z
		.string()
		.regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:MM")
		.optional(),
	duration_minutes: z.number().min(15).max(480).optional(),

	status: AppointmentStatusSchema.optional(),
	type: AppointmentTypeSchema.optional(),
	priority: AppointmentPrioritySchema.optional(),

	chief_complaint: z.string().max(1000).optional(),
	symptoms: z.string().max(2000).optional(),
	diagnosis: z.string().max(2000).optional(),
	treatment_plan: z.string().max(2000).optional(),

	special_instructions: z.string().max(1000).optional(),
	room_number: z.string().max(20).optional(),

	estimated_cost: z.number().min(0).optional(),
	final_cost: z.number().min(0).optional(),
	payment_status: PaymentStatusSchema.optional(),
	payment_method: PaymentMethodSchema.optional(),

	follow_up_required: z.boolean().optional(),
	follow_up_date: z.string().date().optional(),
	follow_up_notes: z.string().max(1000).optional(),

	cancellation_reason: CancellationReasonSchema.optional(),
	cancellation_notes: z.string().max(1000).optional(),
});

// Check-in Schema
export const CheckInAppointmentSchema = z.object({
	arrived_at: z.string().datetime().optional(),
	vital_signs: VitalSignsSchema.optional(),
	notes: z.string().max(500).optional(),
});

// Complete Appointment Schema
export const CompleteAppointmentSchema = z.object({
	diagnosis: z.string().max(2000),
	treatment_plan: z.string().max(2000).optional(),
	services_performed: z.array(ServicePerformedSchema).min(1),
	prescriptions: z.array(PrescriptionSchema).default([]),
	follow_up_required: z.boolean().default(false),
	follow_up_date: z.string().date().optional(),
	follow_up_notes: z.string().max(1000).optional(),
	final_cost: z.number().min(0),
	payment_method: PaymentMethodSchema.optional(),
	clinical_notes: z.string().max(2000).optional(),
});

// Bulk Operations Schema
export const BulkUpdateAppointmentsSchema = z.object({
	appointment_ids: z.array(z.string().uuid()).min(1).max(50),
	updates: z.object({
		status: AppointmentStatusSchema.optional(),
		professional_id: z.string().uuid().optional(),
		scheduled_date: z.string().date().optional(),
		cancellation_reason: CancellationReasonSchema.optional(),
	}),
});

// Response Schemas
export const AppointmentResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.object({
			appointment: AppointmentBaseSchema,
		})
		.optional(),
	error: z
		.object({
			code: z.string(),
			details: z.record(z.any()).optional(),
		})
		.optional(),
});

export const AppointmentsListResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.object({
			appointments: z.array(AppointmentBaseSchema),
			pagination: z.object({
				page: z.number(),
				limit: z.number(),
				total: z.number(),
				total_pages: z.number(),
				has_next: z.boolean(),
				has_prev: z.boolean(),
			}),
			summary: z
				.object({
					total: z.number(),
					by_status: z.record(z.number()),
					by_type: z.record(z.number()),
					upcoming_count: z.number(),
					overdue_count: z.number(),
				})
				.optional(),
		})
		.optional(),
	error: z
		.object({
			code: z.string(),
			details: z.record(z.any()).optional(),
		})
		.optional(),
});

// Calendar/Schedule Schemas
export const AvailabilitySlotSchema = z.object({
	start_time: z.string().regex(/^\d{2}:\d{2}$/),
	end_time: z.string().regex(/^\d{2}:\d{2}$/),
	is_available: z.boolean(),
	appointment_id: z.string().uuid().optional(),
	patient_name: z.string().optional(),
});

export const DailyScheduleSchema = z.object({
	date: z.string().date(),
	professional_id: z.string().uuid(),
	professional_name: z.string(),
	working_hours: z.object({
		start_time: z.string().regex(/^\d{2}:\d{2}$/),
		end_time: z.string().regex(/^\d{2}:\d{2}$/),
		break_start: z
			.string()
			.regex(/^\d{2}:\d{2}$/)
			.optional(),
		break_end: z
			.string()
			.regex(/^\d{2}:\d{2}$/)
			.optional(),
	}),
	appointments: z.array(AppointmentBaseSchema),
	available_slots: z.array(AvailabilitySlotSchema),
	total_appointments: z.number(),
	total_revenue: z.number().optional(),
});

export const WeeklyScheduleResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.object({
			week_start: z.string().date(),
			week_end: z.string().date(),
			schedule: z.array(DailyScheduleSchema),
			summary: z.object({
				total_appointments: z.number(),
				total_revenue: z.number(),
				busiest_day: z.string().date(),
				average_utilization: z.number(),
			}),
		})
		.optional(),
});

// Statistics Schemas
export const AppointmentStatsSchema = z.object({
	total_appointments: z.number(),
	appointments_by_status: z.record(z.number()),
	appointments_by_type: z.record(z.number()),
	appointments_this_month: z.number(),
	appointments_last_month: z.number(),
	no_show_rate: z.number(),
	cancellation_rate: z.number(),
	average_duration: z.number(),
	total_revenue: z.number(),
	pending_payments: z.number(),
	busiest_hours: z.array(
		z.object({
			hour: z.number(),
			count: z.number(),
		}),
	),
	popular_services: z.array(
		z.object({
			service_id: z.string().uuid(),
			service_name: z.string(),
			count: z.number(),
		}),
	),
});

// Type exports
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type AppointmentType = z.infer<typeof AppointmentTypeSchema>;
export type AppointmentPriority = z.infer<typeof AppointmentPrioritySchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type CancellationReason = z.infer<typeof CancellationReasonSchema>;
export type AppointmentReminder = z.infer<typeof AppointmentReminderSchema>;
export type AppointmentNote = z.infer<typeof AppointmentNoteSchema>;
export type VitalSigns = z.infer<typeof VitalSignsSchema>;
export type Prescription = z.infer<typeof PrescriptionSchema>;
export type ServicePerformed = z.infer<typeof ServicePerformedSchema>;
export type FileAttachment = z.infer<typeof FileAttachmentSchema>;
export type AppointmentBase = z.infer<typeof AppointmentBaseSchema>;
export type AppointmentQuery = z.infer<typeof AppointmentQuerySchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof UpdateAppointmentSchema>;
export type CheckInAppointment = z.infer<typeof CheckInAppointmentSchema>;
export type CompleteAppointment = z.infer<typeof CompleteAppointmentSchema>;
export type BulkUpdateAppointments = z.infer<
	typeof BulkUpdateAppointmentsSchema
>;
export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;
export type AppointmentsListResponse = z.infer<
	typeof AppointmentsListResponseSchema
>;
export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>;
export type DailySchedule = z.infer<typeof DailyScheduleSchema>;
export type WeeklyScheduleResponse = z.infer<
	typeof WeeklyScheduleResponseSchema
>;
export type AppointmentStats = z.infer<typeof AppointmentStatsSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
