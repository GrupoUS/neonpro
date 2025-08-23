/**
 * Brazilian Aesthetic Medicine Treatment Types
 * Optimized for CFM compliance and LGPD data protection
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Treatment Plan Types for Brazilian Aesthetic Medicine
export type TreatmentPlanType =
	| "single_session" // Tratamento em sessão única
	| "multi_session" // Tratamento multi-sessão
	| "combination_therapy" // Terapia combinada
	| "maintenance_protocol"; // Protocolo de manutenção

// Brazilian Aesthetic Treatment Categories
export type AestheticTreatmentCategory =
	| "facial" // Tratamentos faciais
	| "body_contouring" // Contorno corporal
	| "skin_rejuvenation" // Rejuvenescimento cutâneo
	| "hair_restoration" // Restauração capilar
	| "intimate_health" // Saúde íntima
	| "preventive_care" // Cuidados preventivos
	| "post_surgical" // Pós-cirúrgico
	| "dermatological"; // Dermatológico

// Treatment Status following Brazilian medical protocols
export type TreatmentStatus =
	| "planned" // Planejado
	| "consent_pending" // Aguardando consentimento
	| "active" // Em andamento
	| "paused" // Pausado
	| "completed" // Concluído
	| "cancelled" // Cancelado
	| "under_review"; // Em revisão

// CFM Compliance Status
export type CFMComplianceStatus =
	| "compliant" // Conforme CFM
	| "pending_review" // Aguardando revisão
	| "requires_attention" // Requer atenção
	| "non_compliant"; // Não conforme

// LGPD Photo Consent Status
export type LGPDPhotoConsentStatus =
	| "granted" // Consentimento concedido
	| "withdrawn" // Consentimento retirado
	| "expired" // Consentimento expirado
	| "pending" // Aguardando consentimento
	| "refused"; // Consentimento recusado

// Treatment Database Schema
export type TreatmentPlan = {
	id: string;
	patient_id: string;
	professional_id: string;
	treatment_name: string;
	treatment_type: TreatmentPlanType;
	category: AestheticTreatmentCategory;
	status: TreatmentStatus;

	// Treatment Details
	description: string;
	expected_sessions: number;
	completed_sessions: number;
	session_interval_days: number;

	// Brazilian Compliance
	cfm_compliance_status: CFMComplianceStatus;
	professional_license_verified: boolean;
	ethics_review_required: boolean;

	// LGPD Compliance
	lgpd_consent_granted: boolean;
	lgpd_consent_date: string | null;
	lgpd_photo_consent_status: LGPDPhotoConsentStatus;
	data_retention_days: number;

	// Expected Outcomes
	expected_outcomes: Json; // Structured data for realistic expectations
	risk_assessment: Json; // Contraindications and risks

	// Pricing and Financial
	total_cost: number;
	payment_plan: Json | null;
	insurance_coverage: Json | null;

	// Scheduling
	start_date: string;
	estimated_completion_date: string;
	next_session_date: string | null;

	// Audit Trail
	created_at: string;
	updated_at: string;
	created_by: string;
	last_modified_by: string;
};

// Treatment Session Record
export type TreatmentSession = {
	id: string;
	treatment_plan_id: string;
	session_number: number;

	// Session Details
	scheduled_date: string;
	actual_date: string | null;
	duration_minutes: number;
	professional_id: string;

	// Session Status
	status: "scheduled" | "completed" | "cancelled" | "no_show" | "rescheduled";
	completion_percentage: number;

	// Clinical Notes
	pre_session_notes: string | null;
	post_session_notes: string | null;
	patient_feedback: string | null;
	professional_observations: string | null;

	// Photo Documentation
	before_photos: Json | null; // LGPD-compliant photo metadata
	after_photos: Json | null; // LGPD-compliant photo metadata
	photo_consent_confirmed: boolean;

	// Session Outcomes
	achieved_outcomes: Json | null;
	side_effects: Json | null;
	patient_satisfaction_score: number | null; // 1-10 scale

	// Recovery and Follow-up
	recovery_timeline: Json | null;
	follow_up_required: boolean;
	follow_up_date: string | null;
	home_care_instructions: string | null;

	// Quality Metrics
	treatment_effectiveness: number | null; // 1-10 scale
	technique_used: string | null;
	equipment_used: Json | null;
	products_used: Json | null;

	// Audit Trail
	created_at: string;
	updated_at: string;
	completed_by: string | null;
};

// Treatment Protocol Library
export type TreatmentProtocol = {
	id: string;
	protocol_name: string;
	category: AestheticTreatmentCategory;
	treatment_type: TreatmentPlanType;

	// Protocol Details
	description: string;
	indications: string[];
	contraindications: string[];

	// Brazilian Standards
	cfm_approved: boolean;
	anvisa_approved: boolean;
	specialty_certification_required: string[];

	// Protocol Steps
	preparation_steps: Json; // Structured preparation protocol
	procedure_steps: Json; // Step-by-step procedure guide
	aftercare_steps: Json; // Post-treatment care protocol

	// Equipment and Products
	required_equipment: Json; // Equipment specifications
	recommended_products: Json; // Product recommendations
	alternative_products: Json; // Alternative product options

	// Expected Outcomes
	typical_results: Json; // Expected results and timeline
	success_rate: number; // Success rate percentage
	patient_satisfaction_average: number; // Average satisfaction score

	// Safety and Risks
	risk_level: "low" | "medium" | "high" | "very_high";
	common_side_effects: string[];
	rare_complications: string[];
	emergency_procedures: Json;

	// Scheduling Guidelines
	recommended_sessions: number;
	session_interval_days: number;
	total_treatment_duration_days: number;
	seasonal_considerations: string | null;

	// Audit and Version Control
	version: string;
	created_at: string;
	updated_at: string;
	created_by: string;
	approved_by: string | null;
	approval_date: string | null;
};

// Before/After Photo Management (LGPD Compliant)
export type TreatmentPhoto = {
	id: string;
	treatment_session_id: string;
	photo_type: "before" | "after" | "during" | "follow_up";

	// LGPD Compliance
	lgpd_consent_id: string;
	consent_scope: "clinical_only" | "marketing_allowed" | "research_allowed";
	anonymization_applied: boolean;
	face_blurred: boolean;
	watermarked: boolean;

	// Photo Metadata
	file_path: string; // Encrypted storage path
	file_hash: string; // Integrity verification
	original_filename: string;
	file_size_bytes: number;
	image_width: number;
	image_height: number;

	// Biometric Security
	biometric_hash: string | null; // For patient verification
	access_key: string; // Temporary access key
	access_expiry: string; // Access expiration

	// Clinical Information
	anatomical_region: string;
	photo_angle: string;
	lighting_conditions: string;
	camera_settings: Json | null;

	// Access Control
	viewed_by: Json; // Access audit trail
	last_accessed: string | null;
	access_count: number;
	sharing_enabled: boolean;
	sharing_expiry: string | null;

	// Data Retention
	retention_period_days: number;
	deletion_scheduled_date: string | null;
	deletion_reason: string | null;

	// Audit Trail
	uploaded_at: string;
	uploaded_by: string;
	modified_at: string | null;
	modified_by: string | null;
};

// Patient Consent Management (Brazilian LGPD + CFM Compliance)
export type PatientConsent = {
	id: string;
	patient_id: string;
	treatment_plan_id: string | null;

	// Consent Type
	consent_type: "treatment" | "photo_documentation" | "data_processing" | "marketing" | "research";

	// LGPD Compliance
	purpose_description: string; // Clear purpose in Portuguese
	data_categories: string[]; // Types of data being processed
	retention_period_days: number; // Data retention period
	sharing_with_third_parties: boolean;
	cross_border_transfer: boolean;

	// CFM Ethics Compliance
	informed_consent_provided: boolean;
	risks_explained: boolean;
	alternatives_discussed: boolean;
	realistic_expectations_set: boolean;

	// Consent Details
	consent_granted: boolean;
	consent_date: string;
	consent_method: "digital" | "physical" | "verbal_recorded";
	witness_present: boolean;
	witness_name: string | null;

	// Legal Guardian (for minors)
	requires_guardian_consent: boolean;
	guardian_name: string | null;
	guardian_relationship: string | null;
	guardian_consent_date: string | null;

	// Withdrawal Management
	withdrawal_allowed: boolean;
	withdrawal_date: string | null;
	withdrawal_reason: string | null;
	withdrawal_method: string | null;

	// Digital Signature
	patient_signature: string | null; // Base64 or digital signature hash
	professional_signature: string | null;
	electronic_signature_method: string | null;
	ip_address: string | null;
	device_information: string | null;

	// Audit Trail
	created_at: string;
	updated_at: string;
	created_by: string;
	verified_by: string | null;
	verification_date: string | null;
};

// Progress Tracking and Outcome Measurement
export type TreatmentProgress = {
	id: string;
	treatment_plan_id: string;
	session_id: string | null;

	// Progress Metrics
	overall_progress_percentage: number;
	session_progress_percentage: number;
	milestone_achieved: string | null;

	// Clinical Measurements
	objective_measurements: Json; // Standardized measurements
	subjective_assessment: Json; // Patient-reported outcomes
	professional_assessment: Json; // Clinical evaluation

	// Photo Comparison Data
	photo_comparison_results: Json | null;
	automated_analysis_results: Json | null; // AI-powered analysis if available

	// Patient Satisfaction
	satisfaction_score: number; // 1-10 scale
	satisfaction_comments: string | null;
	would_recommend: boolean | null;

	// Recovery Tracking
	recovery_stage: string;
	recovery_complications: Json | null;
	recovery_timeline_adherence: number; // Percentage of expected timeline

	// Next Steps
	next_milestone: string | null;
	next_milestone_date: string | null;
	adjustments_needed: boolean;
	adjustment_plan: string | null;

	// Audit Trail
	recorded_at: string;
	recorded_by: string;
	reviewed_by: string | null;
	review_date: string | null;
};

// Exported type unions for easy use
export type AllTreatmentTypes = {
	TreatmentPlan: TreatmentPlan;
	TreatmentSession: TreatmentSession;
	TreatmentProtocol: TreatmentProtocol;
	TreatmentPhoto: TreatmentPhoto;
	PatientConsent: PatientConsent;
	TreatmentProgress: TreatmentProgress;
};

// Helper types for component props
export type TreatmentPlanSummary = Pick<
	TreatmentPlan,
	"id" | "treatment_name" | "category" | "status" | "expected_sessions" | "completed_sessions"
>;

export type SessionSummary = Pick<
	TreatmentSession,
	"id" | "session_number" | "scheduled_date" | "status" | "completion_percentage"
>;

export type ProtocolSummary = Pick<
	TreatmentProtocol,
	"id" | "protocol_name" | "category" | "risk_level" | "success_rate"
>;
