// Core AI Service Types
export interface AIServiceConfig {
	enableCaching: boolean;
	cacheTTL: number;
	enableRetry: boolean;
	maxRetries: number;
	enableMetrics: boolean;
	enableCompliance: boolean;
	complianceLevel: "basic" | "healthcare" | "enterprise";
	rateLimitConfig?: RateLimitConfig;
}

export interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
	keyGenerator?: (input: any) => string;
}

export interface ServiceMetrics {
	operation: string;
	duration: number;
	success: boolean;
	errorType?: string;
	userId?: string;
	clinicId?: string;
	timestamp: Date;
}

export interface ComplianceEvent {
	type: string;
	userId?: string;
	clinicId?: string;
	severity: "low" | "medium" | "high" | "critical";
	details?: string;
	timestamp: Date;
}

// Chat Service Types
export interface ChatMessage {
	id: string;
	sessionId: string;
	role: "user" | "assistant" | "system";
	content: string;
	metadata?: Record<string, any>;
	createdAt: Date;
}

export interface ChatSession {
	id: string;
	userId: string;
	clinicId?: string;
	startedAt: Date;
	lastMessageAt?: Date;
	status: "active" | "completed" | "terminated";
	messageCount: number;
	messages: ChatMessage[];
	context?: HealthcareChatContext;
}

export interface HealthcareChatContext {
	patientId?: string;
	appointmentId?: string;
	procedureType?: string;
	urgencyLevel?: "low" | "medium" | "high" | "emergency";
	specialization?: string;
	language: "pt-BR" | "en";
	clinicContext?: {
		name: string;
		type: "medical" | "dental" | "aesthetic" | "veterinary";
		location: string;
	};
}

export interface ChatResponse {
	response: string;
	messageId: string;
	sessionId: string;
	confidence: number;
	complianceFlags: ComplianceMetrics;
	suggestedActions: string[];
	escalationRequired: boolean;
	processingTime: number;
}

export interface ComplianceMetrics {
	lgpdCompliant: boolean;
	anvisaCompliant: boolean;
	cfmCompliant: boolean;
	riskLevel: "low" | "medium" | "high" | "critical";
	warnings: string[];
	auditTrail?: AuditEntry[];
}

export interface AuditEntry {
	action: string;
	timestamp: Date;
	userId?: string;
	details: Record<string, any>;
	ipAddress?: string;
	userAgent?: string;
}

// Prediction Service Types
export interface AppointmentData {
	id: string;
	scheduledDateTime: Date;
	duration?: number;
	procedureType: string;
	doctorId: string;
	patientId: string;
	clinicId: string;
	cost?: number;
	status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
	roomType?: string;
	source?: "web" | "phone" | "app" | "referral";
	paymentMethod?: string;
	notes?: string;
	createdAt: Date;
	confirmedAt?: Date;
}

export interface PatientBehaviorData {
	patientId: string;
	clinicId: string;
	totalAppointments: number;
	completedAppointments: number;
	noShows: number;
	cancellations: number;
	avgResponseTime: number; // in minutes
	avgConfirmationTime: number; // in minutes
	punctualityScore: number; // 0-100
	preferredTimeSlots: TimeSlot[];
	communicationPreference: "sms" | "email" | "phone" | "app";
	daysSinceLastEngagement: number;
	seasonalPatterns: SeasonalPattern[];
	riskProfile: "low" | "medium" | "high";
	lastUpdated: Date;
}

export interface TimeSlot {
	dayOfWeek: number; // 0-6
	hour: number; // 0-23
	frequency: number; // how often this slot is chosen
}

export interface SeasonalPattern {
	month: number;
	attendanceRate: number;
	avgNoShowRate: number;
}

export interface PredictionResult {
	appointmentId: string;
	patientId: string;
	clinicId: string;
	riskScore: number; // 0-100
	riskCategory: "low" | "medium" | "high" | "critical";
	confidence: number; // 0-1
	primaryRiskFactors: RiskFactors[];
	preventionRecommendations: PreventionRecommendations[];
	predictionId: string;
	modelVersion: string;
	predictedAt: Date;
}

export interface RiskFactors {
	factor: string;
	impact: "low" | "medium" | "high";
	description: string;
	weight: number; // contribution to overall risk
	category?: "temporal" | "behavioral" | "demographic" | "procedural" | "contextual";
}

export interface PreventionRecommendations {
	type: "automated_reminder" | "phone_confirmation" | "flexible_rescheduling" | "incentive" | "mid_point_reminder";
	priority: "low" | "medium" | "high";
	description: string;
	estimatedImpact: number; // percentage reduction in no-show probability
	cost?: number; // implementation cost in BRL
	timing?: string; // when to execute the recommendation
}

// Patient Data Types
export interface PatientProfile {
	id: string;
	clinicId: string;
	personalInfo: PersonalInfo;
	contactInfo: ContactInfo;
	medicalInfo?: MedicalInfo;
	behaviorProfile: PatientBehaviorData;
	preferences: PatientPreferences;
	consentRecords: ConsentRecord[];
	createdAt: Date;
	updatedAt: Date;
	lastLoginAt?: Date;
}

export interface PersonalInfo {
	firstName: string;
	lastName: string;
	birthDate: Date;
	gender: "male" | "female" | "other" | "prefer_not_to_say";
	cpf?: string; // Brazilian tax ID
	rg?: string; // Brazilian ID
	nationality?: string;
	maritalStatus?: string;
}

export interface ContactInfo {
	email?: string;
	phone?: string;
	alternativePhone?: string;
	address?: Address;
	emergencyContact?: EmergencyContact;
	communicationPreferences: CommunicationPreferences;
}

export interface Address {
	street: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

export interface EmergencyContact {
	name: string;
	relationship: string;
	phone: string;
	email?: string;
}

export interface CommunicationPreferences {
	preferredMethod: "sms" | "email" | "phone" | "app";
	appointmentReminders: boolean;
	promotionalMessages: boolean;
	healthTips: boolean;
	surveyRequests: boolean;
	preferredLanguage: "pt-BR" | "en";
	optOutFromAI: boolean;
}

export interface MedicalInfo {
	allergies: string[];
	medications: Medication[];
	medicalHistory: MedicalHistoryEntry[];
	insuranceInfo?: InsuranceInfo;
	specialNeeds?: string[];
}

export interface Medication {
	name: string;
	dosage: string;
	frequency: string;
	startDate: Date;
	endDate?: Date;
	prescribedBy: string;
}

export interface MedicalHistoryEntry {
	condition: string;
	diagnosedDate: Date;
	status: "active" | "resolved" | "chronic";
	notes?: string;
	treatedBy?: string;
}

export interface InsuranceInfo {
	provider: string;
	policyNumber: string;
	validUntil: Date;
	coverage: string[];
}

export interface PatientPreferences {
	appointmentPreferences: AppointmentPreferences;
	doctorPreferences: DoctorPreferences;
	facilityPreferences: FacilityPreferences;
	privacySettings: PrivacySettings;
}

export interface AppointmentPreferences {
	preferredDays: number[]; // 0-6
	preferredTimes: TimeSlot[];
	advanceBookingPreference: number; // days in advance
	reminderPreferences: {
		sms: { enabled: boolean; hoursBeforeH; boolean };
		email: { enabled: boolean; hoursBeforeemphasis: number };
		phone: { enabled: boolean; hoursBeforeemphasis: number };
	};
}

export interface DoctorPreferences {
	preferredDoctors: string[]; // doctor IDs
	avoidDoctors: string[]; // doctor IDs
	genderPreference?: "male" | "female" | "no_preference";
	languagePreference: "pt-BR" | "en";
}

export interface FacilityPreferences {
	preferredLocations: string[]; // clinic/room IDs
	accessibilityNeeds: string[];
	parkingRequired: boolean;
	publicTransportPreferred: boolean;
}

export interface PrivacySettings {
	shareDataForResearch: boolean;
	allowAIAnalysis: boolean;
	dataRetentionConsent: boolean;
	marketingConsent: boolean;
	thirdPartySharing: boolean;
	parentalConsent?: boolean; // for minors
}

export interface ConsentRecord {
	type: "lgpd" | "medical" | "marketing" | "research" | "ai_analysis";
	granted: boolean;
	grantedAt: Date;
	expiresAt?: Date;
	withdrawnAt?: Date;
	version: string;
	ipAddress?: string;
	documentation: string; // consent text or document reference
}

// Cache Service Types
export interface CacheService {
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, value: T, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
	exists(key: string): Promise<boolean>;
	clear(pattern?: string): Promise<void>;
}

// Logger Service Types
export interface LoggerService {
	info(message: string, meta?: Record<string, any>): Promise<void>;
	warn(message: string, meta?: Record<string, any>): Promise<void>;
	error(message: string, meta?: Record<string, any>): Promise<void>;
	debug(message: string, meta?: Record<string, any>): Promise<void>;
}

// Metrics Service Types
export interface MetricsService {
	recordMetric(metric: ServiceMetrics): Promise<void>;
	recordCounter(name: string, value?: number, labels?: Record<string, string>): Promise<void>;
	recordGauge(name: string, value: number, labels?: Record<string, string>): Promise<void>;
	recordHistogram(name: string, value: number, labels?: Record<string, string>): Promise<void>;
}

// Database Types
export interface DatabaseService {
	// Chat related
	chatSessions: ChatSessionRepository;
	aiConversations: ConversationRepository;
	chatEmbeddings: EmbeddingRepository;

	// Prediction related
	appointmentPredictions: PredictionRepository;
	patientBehavior: PatientBehaviorRepository;

	// General
	patients: PatientRepository;
	appointments: AppointmentRepository;
	auditLogs: AuditLogRepository;
}

export interface ChatSessionRepository {
	findFirst(query: any): Promise<ChatSession | null>;
	create(data: any): Promise<ChatSession>;
	update(query: any): Promise<ChatSession>;
	delete(query: any): Promise<void>;
}

export interface ConversationRepository {
	create(data: any): Promise<void>;
	findMany(query: any): Promise<any[]>;
	aggregate(query: any): Promise<any>;
}

export interface EmbeddingRepository {
	create(data: any): Promise<void>;
	findSimilar(embedding: number[], limit: number): Promise<any[]>;
}

export interface PredictionRepository {
	create(data: any): Promise<void>;
	findMany(query: any): Promise<PredictionResult[]>;
	updateActual(predictionId: string, actual: boolean): Promise<void>;
}

export interface PatientBehaviorRepository {
	findFirst(query: any): Promise<PatientBehaviorData | null>;
	upsert(data: any): Promise<PatientBehaviorData>;
	update(query: any): Promise<PatientBehaviorData>;
}

export interface PatientRepository {
	findFirst(query: any): Promise<any>;
	findUnique(query: any): Promise<any>;
	update(query: any): Promise<any>;
}

export interface AppointmentRepository {
	findMany(query: any): Promise<AppointmentData[]>;
	findFirst(query: any): Promise<AppointmentData | null>;
	update(query: any): Promise<AppointmentData>;
}

export interface AuditLogRepository {
	create(data: any): Promise<void>;
	findMany(query: any): Promise<any[]>;
}

// Feature Flag Types
export interface FeatureFlag {
	name: string;
	enabled: boolean;
	enabledFor?: string[]; // user IDs or clinic IDs
	rolloutPercentage?: number; // 0-100
	conditions?: FeatureFlagCondition[];
	metadata?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

export interface FeatureFlagCondition {
	attribute: string;
	operator: "equals" | "not_equals" | "contains" | "in" | "not_in";
	value: any;
}

// Error Types
export interface AIServiceError extends Error {
	code: string;
	statusCode: number;
	details?: Record<string, any>;
	retryable: boolean;
}

export interface ValidationError extends AIServiceError {
	field: string;
	value: any;
}

export interface ComplianceError extends AIServiceError {
	complianceType: "lgpd" | "anvisa" | "cfm";
	violation: string;
}

// API Response Types
export interface APIResponse<T> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
		details?: any;
	};
	metadata?: {
		requestId: string;
		timestamp: Date;
		processingTime: number;
		version: string;
	};
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

// Configuration Types
export interface AIServiceConfiguration {
	openai: {
		apiKey: string;
		model: string;
		maxTokens: number;
		temperature: number;
		organization?: string;
	};
	redis: {
		host: string;
		port: number;
		password?: string;
		database: number;
	};
	database: {
		url: string;
		poolSize: number;
		timeout: number;
	};
	monitoring: {
		enabled: boolean;
		metricsEndpoint?: string;
		logLevel: "debug" | "info" | "warn" | "error";
	};
	compliance: {
		lgpd: {
			enabled: boolean;
			dataRetentionDays: number;
			auditLogLevel: "basic" | "detailed";
		};
		anvisa: {
			enabled: boolean;
			reportingEndpoint?: string;
		};
		cfm: {
			enabled: boolean;
			ethicsValidation: boolean;
		};
	};
	featureFlags: {
		enabled: boolean;
		refreshIntervalMs: number;
	};
}

// Utility Types
export type ServiceStatus = "initializing" | "ready" | "degraded" | "offline";
export type LogLevel = "debug" | "info" | "warn" | "error";
export type ComplianceLevel = "basic" | "healthcare" | "enterprise";
export type Language = "pt-BR" | "en";
export type UserRole = "patient" | "doctor" | "nurse" | "admin" | "receptionist";
export type ClinicType = "medical" | "dental" | "aesthetic" | "veterinary";
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show" | "rescheduled";
export type PredictionAccuracy = "low" | "medium" | "high" | "very_high";

// Re-export everything as default
export * from "./chat-types";
export * from "./compliance-types";
export * from "./patient-types";
export * from "./prediction-types";
