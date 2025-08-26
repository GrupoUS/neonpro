import { z } from "zod";

// Service Category Schema (Brazilian healthcare/aesthetic market)
export const ServiceCategorySchema = z.enum([
	// Medical Consultations
	"consultation_general",
	"consultation_specialist",
	"consultation_emergency",
	"consultation_follow_up",
	"consultation_online",

	// Aesthetic Procedures - Face
	"facial_treatments",
	"botox_dysport",
	"dermal_fillers",
	"chemical_peeling",
	"microneedling",
	"laser_facial",
	"harmonizacao_facial",
	"bioestimuladores",

	// Aesthetic Procedures - Body
	"body_treatments",
	"laser_hair_removal",
	"cryolipolysis",
	"radiofrequency",
	"ultrasound_therapy",
	"lymphatic_drainage",
	"body_contouring",
	"cellulite_treatment",

	// Dental Procedures
	"dental_consultation",
	"dental_cleaning",
	"dental_restoration",
	"dental_surgery",
	"orthodontics",
	"dental_implants",
	"dental_whitening",

	// Nursing Services
	"nursing_care",
	"vaccination",
	"wound_care",
	"medication_administration",

	// Diagnostic Services
	"laboratory_tests",
	"imaging_exams",
	"cardiology_exams",
	"endoscopy",

	// Therapeutic Services
	"physiotherapy",
	"psychological_therapy",
	"nutritional_counseling",
	"speech_therapy",

	// Wellness
	"wellness",
	"massage_therapy",
	"acupuncture",
	"aromatherapy",

	// Other
	"other",
]);

// Service Type Schema
export const ServiceTypeSchema = z.enum([
	"procedure", // Procedimento
	"consultation", // Consulta
	"exam", // Exame
	"therapy", // Terapia
	"treatment", // Tratamento
	"maintenance", // Manutenção
	"emergency", // Emergência
	"follow_up", // Acompanhamento
]);

// Service Status Schema
export const ServiceStatusSchema = z.enum([
	"active", // Ativo
	"inactive", // Inativo
	"pending", // Pendente aprovação
	"suspended", // Suspenso
	"discontinued", // Descontinuado
]);

// ANVISA Risk Classification
export const AnvisaRiskClassificationSchema = z.enum([
	"class_i", // Classe I - Baixo risco
	"class_ii", // Classe II - Médio risco
	"class_iii", // Classe III - Alto risco
	"class_iv", // Classe IV - Máximo risco
	"not_applicable", // Não se aplica
]);

// Age Restriction Schema
export const AgeRestrictionSchema = z.object({
	min_age: z.number().min(0).max(120).optional(),
	max_age: z.number().min(0).max(120).optional(),
	requires_guardian_consent: z.boolean().default(false),
});

// Contraindication Schema
export const ContraindicationSchema = z.object({
	id: z.string().uuid().optional(),
	condition: z
		.string()
		.min(2, "Condição deve ter pelo menos 2 caracteres")
		.max(200, "Condição deve ter no máximo 200 caracteres"),
	severity: z.enum(["absolute", "relative"]).default("relative"),
	description: z.string().max(500).optional(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
});

// Pre-care Instruction Schema
export const PreCareInstructionSchema = z.object({
	id: z.string().uuid().optional(),
	instruction: z
		.string()
		.min(5, "Instrução deve ter pelo menos 5 caracteres")
		.max(500, "Instrução deve ter no máximo 500 caracteres"),
	timing: z.string().max(100, "Tempo deve ter no máximo 100 caracteres"), // "24h antes", "1 semana antes"
	is_mandatory: z.boolean().default(false),
	priority: z.number().min(1).max(10).default(5),
});

// Post-care Instruction Schema
export const PostCareInstructionSchema = z.object({
	id: z.string().uuid().optional(),
	instruction: z
		.string()
		.min(5, "Instrução deve ter pelo menos 5 caracteres")
		.max(500, "Instrução deve ter no máximo 500 caracteres"),
	duration: z.string().max(100, "Duração deve ter no máximo 100 caracteres"), // "7 dias", "2 semanas"
	is_mandatory: z.boolean().default(false),
	priority: z.number().min(1).max(10).default(5),
});

// Required Equipment Schema
export const RequiredEquipmentSchema = z.object({
	id: z.string().uuid().optional(),
	equipment_name: z
		.string()
		.min(2, "Nome do equipamento deve ter pelo menos 2 caracteres")
		.max(200, "Nome do equipamento deve ter no máximo 200 caracteres"),
	brand: z.string().max(100).optional(),
	model: z.string().max(100).optional(),
	is_mandatory: z.boolean().default(true),
	anvisa_registration: z.string().optional(),
	calibration_required: z.boolean().default(false),
	last_calibration: z.string().date().optional(),
	next_calibration: z.string().date().optional(),
});

// Material/Supply Schema
export const MaterialSupplySchema = z.object({
	id: z.string().uuid().optional(),
	material_name: z
		.string()
		.min(2, "Nome do material deve ter pelo menos 2 caracteres")
		.max(200, "Nome do material deve ter no máximo 200 caracteres"),
	brand: z.string().max(100).optional(),
	quantity_per_service: z.number().min(0),
	unit: z.string().max(20), // "ml", "unidade", "g"
	cost_per_unit: z.number().min(0),
	supplier: z.string().max(200).optional(),
	anvisa_registration: z.string().optional(),
	expiry_tracking: z.boolean().default(false),
});

// Pricing Tier Schema
export const PricingTierSchema = z.object({
	id: z.string().uuid().optional(),
	tier_name: z
		.string()
		.min(2, "Nome do nível deve ter pelo menos 2 caracteres")
		.max(50, "Nome do nível deve ter no máximo 50 caracteres"),
	price: z.number().min(0),
	description: z.string().max(300).optional(),
	conditions: z.string().max(500).optional(), // "Para novos pacientes", "Pacote com 3 sessões"
	is_promotional: z.boolean().default(false),
	valid_from: z.string().date().optional(),
	valid_until: z.string().date().optional(),
});

// Service Variation Schema (for services with different options)
export const ServiceVariationSchema = z.object({
	id: z.string().uuid().optional(),
	variation_name: z
		.string()
		.min(2, "Nome da variação deve ter pelo menos 2 caracteres")
		.max(100, "Nome da variação deve ter no máximo 100 caracteres"),
	description: z.string().max(500).optional(),
	additional_cost: z.number().default(0),
	duration_modifier: z.number().default(0), // minutes to add/subtract
	requires_additional_consent: z.boolean().default(false),
	is_default: z.boolean().default(false),
});

// Service Protocol Schema
export const ServiceProtocolSchema = z.object({
	id: z.string().uuid().optional(),
	step_number: z.number().min(1),
	step_title: z
		.string()
		.min(3, "Título da etapa deve ter pelo menos 3 caracteres")
		.max(200, "Título da etapa deve ter no máximo 200 caracteres"),
	step_description: z
		.string()
		.min(10, "Descrição deve ter pelo menos 10 caracteres")
		.max(2000, "Descrição deve ter no máximo 2000 caracteres"),
	estimated_duration: z.number().min(1).optional(), // minutes
	materials_needed: z.array(z.string()).default([]),
	safety_considerations: z.string().max(1000).optional(),
	is_critical: z.boolean().default(false),
});

// Service Base Schema
export const ServiceBaseSchema = z.object({
	id: z.string().uuid(),

	// Basic Information
	name: z
		.string()
		.min(3, "Nome do serviço deve ter pelo menos 3 caracteres")
		.max(200, "Nome do serviço deve ter no máximo 200 caracteres"),
	description: z
		.string()
		.min(10, "Descrição deve ter pelo menos 10 caracteres")
		.max(2000, "Descrição deve ter no máximo 2000 caracteres"),
	short_description: z
		.string()
		.max(300, "Descrição curta deve ter no máximo 300 caracteres")
		.optional(),

	// Categorization
	category: ServiceCategorySchema,
	type: ServiceTypeSchema,
	subcategory: z.string().max(100).optional(),
	tags: z.array(z.string()).default([]),

	// Status and Availability
	status: ServiceStatusSchema.default("pending"),
	is_active: z.boolean().default(true),
	is_featured: z.boolean().default(false),

	// Clinic and Professional
	clinic_id: z.string().uuid(),
	clinic_name: z.string(),
	available_professionals: z.array(z.string().uuid()).default([]),

	// Timing and Scheduling
	duration_minutes: z.number().min(15).max(480),
	buffer_time_before: z.number().min(0).max(60).default(0),
	buffer_time_after: z.number().min(0).max(60).default(0),
	sessions_required: z.number().min(1).default(1),
	interval_between_sessions: z.number().min(0).optional(), // days

	// Pricing
	base_price: z.number().min(0),
	pricing_tiers: z.array(PricingTierSchema).default([]),
	cost_calculation: z
		.object({
			material_cost: z.number().min(0).default(0),
			equipment_cost: z.number().min(0).default(0),
			professional_cost: z.number().min(0).default(0),
			overhead_percentage: z.number().min(0).max(100).default(30),
		})
		.optional(),

	// Insurance and Payment
	accepts_insurance: z.boolean().default(false),
	insurance_coverage_percentage: z.number().min(0).max(100).optional(),
	payment_methods: z
		.array(
			z.enum([
				"cash",
				"credit_card",
				"debit_card",
				"pix",
				"bank_transfer",
				"insurance",
			]),
		)
		.default(["cash", "credit_card"]),
	installment_options: z
		.array(
			z.object({
				installments: z.number().min(1).max(24),
				interest_rate: z.number().min(0).max(50).default(0),
			}),
		)
		.default([]),

	// Clinical Information
	age_restrictions: AgeRestrictionSchema.optional(),
	contraindications: z.array(ContraindicationSchema).default([]),
	pre_care_instructions: z.array(PreCareInstructionSchema).default([]),
	post_care_instructions: z.array(PostCareInstructionSchema).default([]),
	side_effects: z.array(z.string()).default([]),
	recovery_time: z.string().max(100).optional(),

	// Resources Required
	required_equipment: z.array(RequiredEquipmentSchema).default([]),
	materials_supplies: z.array(MaterialSupplySchema).default([]),
	room_requirements: z.string().max(500).optional(),

	// Service Variations and Protocols
	variations: z.array(ServiceVariationSchema).default([]),
	protocol_steps: z.array(ServiceProtocolSchema).default([]),

	// Regulatory Compliance
	anvisa_risk_class: AnvisaRiskClassificationSchema.default("not_applicable"),
	anvisa_registration: z.string().optional(),
	requires_medical_supervision: z.boolean().default(false),
	requires_anesthesia: z.boolean().default(false),
	requires_informed_consent: z.boolean().default(true),
	informed_consent_template: z.string().optional(),

	// Quality and Safety
	success_rate: z.number().min(0).max(100).optional(),
	satisfaction_score: z.number().min(0).max(10).optional(),
	complication_rate: z.number().min(0).max(100).optional(),

	// Documentation
	before_after_photos_required: z.boolean().default(false),
	clinical_photos_required: z.boolean().default(false),
	documentation_template: z.string().optional(),

	// Marketing and Display
	display_order: z.number().min(0).default(0),
	image_urls: z.array(z.string().url()).default([]),
	video_url: z.string().url().optional(),
	brochure_url: z.string().url().optional(),
	is_visible_online: z.boolean().default(true),

	// Statistics
	total_bookings: z.number().min(0).default(0),
	total_completed: z.number().min(0).default(0),
	total_cancelled: z.number().min(0).default(0),
	average_rating: z.number().min(0).max(5).default(0),
	total_ratings: z.number().min(0).default(0),

	// Timestamps
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
	last_booked: z.string().datetime().optional(),

	// Additional Notes
	internal_notes: z.string().max(2000).optional(),
	public_notes: z.string().max(1000).optional(),
});

// Service Query Schema
export const ServiceQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),

	// Filters
	search: z.string().max(100).optional(),
	clinic_id: z.string().uuid().optional(),
	category: ServiceCategorySchema.optional(),
	type: ServiceTypeSchema.optional(),
	status: ServiceStatusSchema.optional(),
	is_active: z.coerce.boolean().optional(),
	is_featured: z.coerce.boolean().optional(),
	professional_id: z.string().uuid().optional(),

	// Price filters
	min_price: z.coerce.number().min(0).optional(),
	max_price: z.coerce.number().min(0).optional(),
	accepts_insurance: z.coerce.boolean().optional(),

	// Duration filters
	min_duration: z.coerce.number().min(15).optional(),
	max_duration: z.coerce.number().max(480).optional(),

	// Regulatory filters
	anvisa_risk_class: AnvisaRiskClassificationSchema.optional(),
	requires_medical_supervision: z.coerce.boolean().optional(),

	// Availability filters
	available_date: z.string().date().optional(),
	professional_available: z.string().uuid().optional(),

	// Display filters
	is_visible_online: z.coerce.boolean().optional(),
	has_images: z.coerce.boolean().optional(),

	// Sorting
	sort_by: z
		.enum([
			"name",
			"created_at",
			"base_price",
			"duration_minutes",
			"total_bookings",
			"average_rating",
			"display_order",
		])
		.default("display_order"),
	sort_order: z.enum(["asc", "desc"]).default("asc"),
});

// Create Service Schema
export const CreateServiceSchema = z.object({
	name: z
		.string()
		.min(3, "Nome do serviço deve ter pelo menos 3 caracteres")
		.max(200, "Nome do serviço deve ter no máximo 200 caracteres"),
	description: z
		.string()
		.min(10, "Descrição deve ter pelo menos 10 caracteres")
		.max(2000, "Descrição deve ter no máximo 2000 caracteres"),
	category: ServiceCategorySchema,
	type: ServiceTypeSchema,
	clinic_id: z.string().uuid(),

	duration_minutes: z.number().min(15).max(480),
	base_price: z.number().min(0),

	// Optional fields
	short_description: z.string().max(300).optional(),
	subcategory: z.string().max(100).optional(),
	tags: z.array(z.string()).optional(),

	available_professionals: z.array(z.string().uuid()).optional(),
	sessions_required: z.number().min(1).default(1),
	interval_between_sessions: z.number().min(0).optional(),

	pricing_tiers: z.array(PricingTierSchema).optional(),
	accepts_insurance: z.boolean().default(false),
	insurance_coverage_percentage: z.number().min(0).max(100).optional(),

	age_restrictions: AgeRestrictionSchema.optional(),
	contraindications: z.array(ContraindicationSchema).optional(),
	pre_care_instructions: z.array(PreCareInstructionSchema).optional(),
	post_care_instructions: z.array(PostCareInstructionSchema).optional(),

	required_equipment: z.array(RequiredEquipmentSchema).optional(),
	materials_supplies: z.array(MaterialSupplySchema).optional(),

	anvisa_risk_class: AnvisaRiskClassificationSchema.default("not_applicable"),
	requires_medical_supervision: z.boolean().default(false),
	requires_informed_consent: z.boolean().default(true),

	image_urls: z.array(z.string().url()).optional(),
	is_visible_online: z.boolean().default(true),
	display_order: z.number().min(0).default(0),

	internal_notes: z.string().max(2000).optional(),
});

// Update Service Schema
export const UpdateServiceSchema = z.object({
	name: z
		.string()
		.min(3, "Nome do serviço deve ter pelo menos 3 caracteres")
		.max(200, "Nome do serviço deve ter no máximo 200 caracteres")
		.optional(),
	description: z
		.string()
		.min(10, "Descrição deve ter pelo menos 10 caracteres")
		.max(2000, "Descrição deve ter no máximo 2000 caracteres")
		.optional(),
	short_description: z.string().max(300).optional(),

	category: ServiceCategorySchema.optional(),
	type: ServiceTypeSchema.optional(),
	subcategory: z.string().max(100).optional(),
	tags: z.array(z.string()).optional(),

	status: ServiceStatusSchema.optional(),
	is_active: z.boolean().optional(),
	is_featured: z.boolean().optional(),

	duration_minutes: z.number().min(15).max(480).optional(),
	buffer_time_before: z.number().min(0).max(60).optional(),
	buffer_time_after: z.number().min(0).max(60).optional(),

	base_price: z.number().min(0).optional(),
	pricing_tiers: z.array(PricingTierSchema).optional(),
	accepts_insurance: z.boolean().optional(),
	insurance_coverage_percentage: z.number().min(0).max(100).optional(),

	available_professionals: z.array(z.string().uuid()).optional(),
	sessions_required: z.number().min(1).optional(),
	interval_between_sessions: z.number().min(0).optional(),

	age_restrictions: AgeRestrictionSchema.optional(),
	contraindications: z.array(ContraindicationSchema).optional(),
	pre_care_instructions: z.array(PreCareInstructionSchema).optional(),
	post_care_instructions: z.array(PostCareInstructionSchema).optional(),
	side_effects: z.array(z.string()).optional(),
	recovery_time: z.string().max(100).optional(),

	required_equipment: z.array(RequiredEquipmentSchema).optional(),
	materials_supplies: z.array(MaterialSupplySchema).optional(),
	room_requirements: z.string().max(500).optional(),

	variations: z.array(ServiceVariationSchema).optional(),
	protocol_steps: z.array(ServiceProtocolSchema).optional(),

	anvisa_risk_class: AnvisaRiskClassificationSchema.optional(),
	anvisa_registration: z.string().optional(),
	requires_medical_supervision: z.boolean().optional(),
	requires_anesthesia: z.boolean().optional(),
	requires_informed_consent: z.boolean().optional(),
	informed_consent_template: z.string().optional(),

	before_after_photos_required: z.boolean().optional(),
	clinical_photos_required: z.boolean().optional(),
	documentation_template: z.string().optional(),

	display_order: z.number().min(0).optional(),
	image_urls: z.array(z.string().url()).optional(),
	video_url: z.string().url().optional(),
	brochure_url: z.string().url().optional(),
	is_visible_online: z.boolean().optional(),

	internal_notes: z.string().max(2000).optional(),
	public_notes: z.string().max(1000).optional(),
});

// Service Response Schemas
export const ServiceResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.object({
			service: ServiceBaseSchema,
		})
		.optional(),
	error: z
		.object({
			code: z.string(),
			details: z.record(z.any()).optional(),
		})
		.optional(),
});

export const ServicesListResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z
		.object({
			services: z.array(ServiceBaseSchema),
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
					by_category: z.record(z.number()),
					by_status: z.record(z.number()),
					average_price: z.number(),
					price_range: z.object({
						min: z.number(),
						max: z.number(),
					}),
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

// Service Statistics Schema
export const ServiceStatsSchema = z.object({
	total_services: z.number(),
	active_services: z.number(),
	featured_services: z.number(),
	by_category: z.record(z.number()),
	by_type: z.record(z.number()),
	average_price: z.number(),
	price_range: z.object({
		min: z.number(),
		max: z.number(),
	}),
	total_bookings: z.number(),
	total_revenue: z.number(),
	most_popular: z.array(
		z.object({
			service_id: z.string().uuid(),
			service_name: z.string(),
			booking_count: z.number(),
		}),
	),
	highest_rated: z.array(
		z.object({
			service_id: z.string().uuid(),
			service_name: z.string(),
			average_rating: z.number(),
		}),
	),
});

// Bulk Operations Schema
export const BulkUpdateServicesSchema = z.object({
	service_ids: z.array(z.string().uuid()).min(1).max(50),
	updates: z.object({
		status: ServiceStatusSchema.optional(),
		is_active: z.boolean().optional(),
		is_featured: z.boolean().optional(),
		display_order: z.number().min(0).optional(),
	}),
});

// Type exports
export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;
export type ServiceType = z.infer<typeof ServiceTypeSchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
export type AnvisaRiskClassification = z.infer<
	typeof AnvisaRiskClassificationSchema
>;
export type AgeRestriction = z.infer<typeof AgeRestrictionSchema>;
export type Contraindication = z.infer<typeof ContraindicationSchema>;
export type PreCareInstruction = z.infer<typeof PreCareInstructionSchema>;
export type PostCareInstruction = z.infer<typeof PostCareInstructionSchema>;
export type RequiredEquipment = z.infer<typeof RequiredEquipmentSchema>;
export type MaterialSupply = z.infer<typeof MaterialSupplySchema>;
export type PricingTier = z.infer<typeof PricingTierSchema>;
export type ServiceVariation = z.infer<typeof ServiceVariationSchema>;
export type ServiceProtocol = z.infer<typeof ServiceProtocolSchema>;
export type ServiceBase = z.infer<typeof ServiceBaseSchema>;
export type ServiceQuery = z.infer<typeof ServiceQuerySchema>;
export type CreateService = z.infer<typeof CreateServiceSchema>;
export type UpdateService = z.infer<typeof UpdateServiceSchema>;
export type ServiceResponse = z.infer<typeof ServiceResponseSchema>;
export type ServicesListResponse = z.infer<typeof ServicesListResponseSchema>;
export type ServiceStats = z.infer<typeof ServiceStatsSchema>;
export type BulkUpdateServices = z.infer<typeof BulkUpdateServicesSchema>;
