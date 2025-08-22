/**
 * 🏥 Entity Types - NeonPro Healthcare
 * ====================================
 *
 * Tipos base das entidades do domínio de saúde estética
 * para uso consistente em todo o sistema.
 */

import type { AppointmentPriority, AppointmentStatus, AppointmentType } from "../schemas/appointment.schema";
import type { MFAMethod, UserRole } from "../schemas/auth.schema";

// Base entity interface (all entities extend this)
export interface BaseEntity {
	id: string; // UUID
	createdAt: string; // ISO datetime
	updatedAt: string; // ISO datetime
	isActive?: boolean;
}

// Soft delete support
export interface SoftDeletable {
	deletedAt?: string | null;
	deletedBy?: string | null;
}

// Audit trail support
export interface Auditable {
	createdBy?: string;
	updatedBy?: string;
	version?: number;
}

// Geographic coordinates
export interface GeoCoordinates {
	latitude: number;
	longitude: number;
}

// Address interface
export interface Address {
	street: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
	zipCode: string;
	country?: string;
	coordinates?: GeoCoordinates;
	landmark?: string;
}

// Contact information
export interface ContactInfo {
	phone: string;
	whatsapp?: string;
	email: string;
	website?: string;
	socialMedia?: {
		instagram?: string;
		facebook?: string;
		tiktok?: string;
	};
}

// User Entity
export interface User extends BaseEntity, SoftDeletable, Auditable {
	email: string;
	fullName: string;
	avatar?: string;
	phone?: string;
	role: UserRole;

	// Professional info
	licenseNumber?: string;
	specialization?: string;
	bio?: string;
	title?: string; // Dr., Enf., etc.

	// Security
	isVerified: boolean;
	isMFAEnabled: boolean;
	mfaMethods?: MFAMethod[];
	lastLoginAt?: string;
	passwordChangedAt?: string;

	// Clinic association
	clinicId?: string;

	// Preferences
	preferences: {
		language: "pt" | "en" | "es";
		timezone: string;
		theme: "light" | "dark" | "auto";
		emailNotifications: boolean;
		smsNotifications: boolean;
		marketingConsent: boolean;
	};

	// Permissions (computed based on role and clinic)
	permissions: string[];
}

// Patient Entity
export interface Patient extends BaseEntity, SoftDeletable, Auditable {
	// Personal information
	fullName: string;
	email: string;
	phone: string;
	cpf: string;
	rg?: string;
	birthDate: string;
	gender: "male" | "female" | "other" | "prefer_not_to_say";

	// Address
	address: Address;

	// Emergency contact
	emergencyContact?: {
		name: string;
		relationship: string;
		phone: string;
	};

	// Medical information
	allergies: string[];
	chronicConditions: string[];
	currentMedications: string[];
	bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
	height?: number; // cm
	weight?: number; // kg

	// Insurance
	insuranceProvider?: string;
	insuranceNumber?: string;

	// LGPD Consent
	consentGiven: boolean;
	consentDate: string;
	dataProcessingConsent: boolean;
	marketingConsent: boolean;

	// Relationships
	clinicId?: string;
	assignedProfessionalId?: string;

	// Statistics
	totalAppointments?: number;
	lastAppointmentDate?: string;
	totalSpent?: number;
}

// Professional Entity (extends User)
export interface Professional extends Omit<User, "role"> {
	role: "doctor" | "nurse" | "aesthetician";

	// Professional specific fields
	crm?: string; // For doctors
	coren?: string; // For nurses
	specializations: string[];
	qualifications: string[];
	yearsOfExperience?: number;

	// Schedule and availability
	workingHours?: BusinessHours[];
	isAvailableForBooking: boolean;
	consultationDuration: number; // default duration in minutes

	// Statistics
	totalPatients?: number;
	totalAppointments?: number;
	averageRating?: number;
	totalReviews?: number;

	// Clinic association
	clinics: string[]; // Can work at multiple clinics
	primaryClinicId: string;
}

// Business hours type
export interface BusinessHours {
	day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
	isOpen: boolean;
	openTime: string; // HH:MM
	closeTime: string; // HH:MM
	breakStart?: string; // HH:MM
	breakEnd?: string; // HH:MM
}

// Clinic Service
export interface ClinicService extends BaseEntity {
	name: string;
	category:
		| "injectables"
		| "laser"
		| "skincare"
		| "body_treatments"
		| "hair_removal"
		| "wellness"
		| "consultation"
		| "other";
	description?: string;
	duration: number; // minutes
	price?: number;
	isActive: boolean;

	// Requirements
	requiresConsultation?: boolean;
	ageRestrictions?: {
		minAge: number;
		maxAge?: number;
	};
	contraindications?: string[];

	// Professional requirements
	requiredRole?: UserRole[];
	requiredCertifications?: string[];

	clinicId: string;
}

// Clinic Entity
export interface Clinic extends BaseEntity, SoftDeletable, Auditable {
	// Basic information
	name: string;
	tradeName?: string;
	description?: string;

	// Legal information
	cnpj: string;
	stateRegistration?: string;
	municipalRegistration?: string;
	anvisaLicense?: string;

	// Contact and location
	contact: ContactInfo;
	address: Address;
	businessHours: BusinessHours[];

	// Branding
	logo?: string;
	images: string[];
	primaryColor?: string;

	// Settings
	capacity: number; // max simultaneous appointments
	acceptsInsurance: boolean;
	acceptedPaymentMethods: ("cash" | "credit_card" | "debit_card" | "pix" | "bank_transfer" | "installments")[];

	// Booking settings
	bookingSettings: {
		allowOnlineBooking: boolean;
		requireApproval: boolean;
		advanceBookingDays: number;
		cancellationHours: number;
		reminderEnabled: boolean;
		reminderHours: number;
	};

	// Owner
	ownerId: string;

	// Statistics
	stats?: {
		totalPatients: number;
		totalAppointments: number;
		activeStaff: number;
		averageRating: number;
		totalReviews: number;
		monthlyRevenue?: number;
	};

	// Compliance
	complianceStatus: {
		lgpd: "compliant" | "non_compliant" | "pending";
		anvisa: "compliant" | "non_compliant" | "pending";
		lastAuditDate?: string;
	};
}

// Appointment Entity
export interface Appointment extends BaseEntity, SoftDeletable, Auditable {
	// Core data
	patientId: string;
	professionalId: string;
	clinicId: string;

	// Schedule
	scheduledAt: string;
	duration: number;
	estimatedEndTime: string; // computed

	// Details
	type: AppointmentType;
	status: AppointmentStatus;
	priority: AppointmentPriority;

	title: string;
	description?: string;
	notes?: string;

	// Treatment specific
	treatmentArea?: string;
	estimatedCost?: number;
	actualCost?: number;

	// Instructions
	preAppointmentInstructions?: string;
	postAppointmentInstructions?: string;

	// Cancellation/Rescheduling
	cancelReason?: string;
	rescheduleReason?: string;
	cancelledBy?: "patient" | "professional" | "clinic" | "system";
	originalScheduledAt?: string; // for rescheduled appointments

	// Actual times (for completed appointments)
	actualStartTime?: string;
	actualEndTime?: string;

	// Payment
	paymentStatus?: "pending" | "paid" | "partially_paid" | "refunded";
	paymentMethod?: string;

	// Follow-up
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;

	// Populated relations (when needed)
	patient?: Patient;
	professional?: Professional;
	clinic?: Clinic;
}

// Treatment Record Entity
export interface TreatmentRecord extends BaseEntity, Auditable {
	appointmentId: string;
	patientId: string;
	professionalId: string;
	clinicId: string;

	// Treatment details
	treatmentType: string;
	area: string;
	products?: {
		name: string;
		brand: string;
		quantity: number;
		batchNumber?: string;
		expirationDate?: string;
	}[];

	// Before/After
	beforePhotos?: string[];
	afterPhotos?: string[];

	// Results and notes
	results: string;
	patientFeedback?: string;
	complications?: string;

	// Follow-up
	nextRecommendedDate?: string;
	recommendations: string;

	// ANVISA compliance
	anvisaReportId?: string;
	adverseReaction?: boolean;
	adverseReactionDetails?: string;
}

// Payment Entity
export interface Payment extends BaseEntity {
	appointmentId: string;
	patientId: string;
	clinicId: string;

	// Amount
	amount: number;
	currency: "BRL";

	// Payment details
	method: "cash" | "credit_card" | "debit_card" | "pix" | "bank_transfer";
	status: "pending" | "completed" | "failed" | "cancelled" | "refunded";

	// External references
	transactionId?: string;
	paymentProcessorId?: string;

	// Installments (if applicable)
	installments?: {
		total: number;
		current: number;
		amount: number;
	};

	// Dates
	dueDate?: string;
	paidAt?: string;

	// Notes
	notes?: string;
}

// File/Document Entity
export interface FileDocument extends BaseEntity {
	filename: string;
	originalName: string;
	mimetype: string;
	size: number;

	// Storage
	storageProvider: "local" | "aws" | "gcs";
	storageKey: string;
	url?: string;

	// Metadata
	description?: string;
	tags?: string[];

	// Relations
	entityType: "patient" | "appointment" | "clinic" | "user" | "treatment";
	entityId: string;
	uploadedBy: string;

	// Security
	isPublic: boolean;
	encryptionKey?: string;

	// LGPD
	containsSensitiveData: boolean;
	retentionPolicy?: {
		deleteAfterDays: number;
		reason: string;
	};
}

// Export all entity types as a union
export type Entity = User | Patient | Professional | Clinic | Appointment | TreatmentRecord | Payment | FileDocument;

export type EntityType =
	| "user"
	| "patient"
	| "professional"
	| "clinic"
	| "appointment"
	| "notification"
	| "treatment"
	| "payment"
	| "file";
