/**
 * 🔗 API Types - NeonPro Healthcare
 * =================================
 *
 * Tipos base para comunicação entre frontend e backend
 * com type-safety completo via Hono RPC.
 */

// HTTP Methods
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// API Status codes
export type ApiStatusCode =
	| 200
	| 201
	| 202
	| 204 // Success
	| 400
	| 401
	| 403
	| 404
	| 409
	| 422 // Client Error
	| 500
	| 502
	| 503
	| 504; // Server Error

// Base API Response structure
export type ApiResponse<T = unknown> = {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
	errors?: Record<string, string[]>; // Validation errors
	meta?: ApiMeta;
};

// API Meta information (pagination, etc.)
export type ApiMeta = {
	pagination?: PaginationMeta;
	total?: number;
	count?: number;
	timestamp?: string;
	requestId?: string;
};

// Pagination meta
export type PaginationMeta = {
	page: number;
	limit: number;
	totalPages: number;
	totalItems: number;
	hasNext: boolean;
	hasPrev: boolean;
};

// Base pagination params
export type PaginationParams = {
	page?: number;
	limit?: number;
};

// Base search params
export interface SearchParams extends PaginationParams {
	query?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

// API Error structure
export type ApiError = {
	code: string;
	message: string;
	details?: Record<string, unknown>;
	timestamp: string;
	path?: string;
	method?: HttpMethod;
};

// Validation error structure
export type ValidationError = {
	field: string;
	message: string;
	code: string;
	value?: unknown;
};

// Base entity ID type
export type EntityId = string; // UUID

// Date range type
export type DateRange = {
	startDate: string; // ISO date
	endDate: string; // ISO date
};

// Time range type
export type TimeRange = {
	startTime: string; // HH:MM format
	endTime: string; // HH:MM format
};

// Geolocation type
export type GeoLocation = {
	latitude: number;
	longitude: number;
	accuracy?: number;
};

// File upload type
export type FileUpload = {
	filename: string;
	mimetype: string;
	size: number;
	url?: string;
	key?: string; // Storage key
};

// Bulk operation result
export type BulkOperationResult<T = EntityId> = {
	success: T[];
	failed: Array<{
		item: T;
		error: string;
	}>;
	totalProcessed: number;
	successCount: number;
	failureCount: number;
};

// API endpoint paths (type-safe route definitions)
export type ApiRoutes = {
	// Authentication
	auth: {
		login: "/auth/login";
		register: "/auth/register";
		logout: "/auth/logout";
		refresh: "/auth/refresh";
		profile: "/auth/profile";
		"forgot-password": "/auth/forgot-password";
		"reset-password": "/auth/reset-password";
		"change-password": "/auth/change-password";
		mfa: {
			enable: "/auth/mfa/enable";
			verify: "/auth/mfa/verify";
			disable: "/auth/mfa/disable";
		};
	};

	// Patients
	patients: {
		base: "/patients";
		byId: "/patients/:id";
		search: "/patients/search";
		export: "/patients/export";
		import: "/patients/import";
	};

	// Appointments
	appointments: {
		base: "/appointments";
		byId: "/appointments/:id";
		search: "/appointments/search";
		availability: "/appointments/availability";
		reschedule: "/appointments/:id/reschedule";
		cancel: "/appointments/:id/cancel";
	};

	// Clinics
	clinics: {
		base: "/clinics";
		byId: "/clinics/:id";
		search: "/clinics/search";
		staff: "/clinics/:id/staff";
		services: "/clinics/:id/services";
		availability: "/clinics/:id/availability";
	};

	// Health check
	health: "/health";
};

// Request context type (middleware data)
export type RequestContext = {
	user?: {
		id: EntityId;
		email: string;
		role: string;
		clinicId?: EntityId;
	};
	device?: {
		id: string;
		type: string;
		userAgent: string;
		ipAddress: string;
	};
	permissions?: string[];
	requestId: string;
	timestamp: string;
};

// Audit trail type
export type AuditTrail = {
	action: string;
	entityType: string;
	entityId: EntityId;
	userId: EntityId;
	changes?: Record<
		string,
		{
			before: unknown;
			after: unknown;
		}
	>;
	metadata?: Record<string, unknown>;
	timestamp: string;
	ipAddress: string;
};

// Rate limiting info
export type RateLimit = {
	limit: number;
	remaining: number;
	resetTime: string;
	retryAfter?: number;
};

// API Headers type
export type ApiHeaders = {
	"Content-Type"?: string;
	Authorization?: string;
	"X-Request-ID"?: string;
	"X-Rate-Limit"?: string;
	"X-User-Agent"?: string;
	"X-Forwarded-For"?: string;
	"Accept-Language"?: string;
};

// WebSocket message types
export type WebSocketMessageType =
	| "appointment_created"
	| "appointment_updated"
	| "appointment_cancelled"
	| "patient_registered"
	| "notification"
	| "system_alert"
	| "heartbeat";

export type WebSocketMessage<T = unknown> = {
	type: WebSocketMessageType;
	data: T;
	timestamp: string;
	userId?: EntityId;
	clinicId?: EntityId;
};

// Export utility types
export type ApiEndpoint<T = unknown> = (params?: T) => Promise<ApiResponse>;
export type ApiMutation<TParams = unknown, TResponse = unknown> = (params: TParams) => Promise<ApiResponse<TResponse>>;
export type ApiQuery<TParams = unknown, TResponse = unknown> = (params?: TParams) => Promise<ApiResponse<TResponse>>;

// Type guards
export const isApiError = (obj: unknown): obj is ApiError => {
	return typeof obj === "object" && obj !== null && "code" in obj && "message" in obj;
};

export const isApiResponse = <T>(obj: unknown): obj is ApiResponse<T> => {
	return typeof obj === "object" && obj !== null && "success" in obj;
};

export const isValidationError = (obj: unknown): obj is ValidationError => {
	return typeof obj === "object" && obj !== null && "field" in obj && "message" in obj;
};

// Additional entity types for compatibility
export type BaseEntity = {
	id: string;
	created_at: string;
	updated_at: string;
};

export type Address = {
	street: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
	zip_code: string;
	country: string;
};

export type ContactInfo = {
	phone?: string;
	email?: string;
	mobile?: string;
};

export type GeoCoordinates = {
	latitude: number;
	longitude: number;
};

export type BusinessHours = {
	day_of_week: number;
	open_time: string;
	close_time: string;
	is_closed: boolean;
};

export interface Clinic extends BaseEntity {
	name: string;
	cnpj: string;
	address: Address;
	contact_info: ContactInfo;
	business_hours: BusinessHours[];
	is_active: boolean;
}

export interface Patient extends BaseEntity {
	user_id: string;
	name: string;
	cpf: string;
	birth_date: string;
	contact_info: ContactInfo;
	address?: Address;
}

export interface Professional extends BaseEntity {
	user_id: string;
	name: string;
	cpf: string;
	crm: string;
	specialization: string;
	bio?: string;
	clinic_id: string;
}

export interface Appointment extends BaseEntity {
	patient_id: string;
	professional_id: string;
	clinic_id: string;
	scheduled_at: string;
	duration_minutes: number;
	status: string;
	type: string;
	notes?: string;
}

export interface User extends BaseEntity {
	email: string;
	first_name: string;
	last_name: string;
	role: string;
	is_active: boolean;
	is_verified: boolean;
}

export interface Notification extends BaseEntity {
	user_id: string;
	title: string;
	message: string;
	type: string;
	is_read: boolean;
	priority: string;
}

export interface Payment extends BaseEntity {
	appointment_id: string;
	amount: number;
	currency: string;
	status: string;
	payment_method: string;
	reference: string;
}

export interface TreatmentRecord extends BaseEntity {
	appointment_id: string;
	diagnosis: string;
	treatment: string;
	prescription?: string;
	notes?: string;
}

export interface FileDocument extends BaseEntity {
	name: string;
	type: string;
	size: number;
	url: string;
	owner_id: string;
	entity_type: string;
	entity_id: string;
}

// Response types
export interface ClinicResponse extends ApiResponse<Clinic> {}
export interface PatientResponse extends ApiResponse<Patient> {}
export interface AppointmentResponse extends ApiResponse<Appointment> {}
export interface LoginResponse
	extends ApiResponse<{
		user: User;
		token: string;
		expires_at: string;
	}> {}
export interface RegisterResponse
	extends ApiResponse<{
		user: User;
		verification_required: boolean;
	}> {}

export type SuccessResponse<T = unknown> = ApiResponse<T> & { success: true };
export type ErrorResponse = ApiResponse<never> & { success: false };
export type HealthCheckResponse = ApiResponse<{
	status: string;
	timestamp: string;
	version: string;
}>;

export type ListResponse<T> = {
	items: T[];
	total: number;
	page: number;
	per_page: number;
};

export interface PaginatedResponse<T> extends ApiResponse<ListResponse<T>> {}
