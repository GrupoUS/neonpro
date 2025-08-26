/**
 * 📝 Types Export Index - NeonPro Healthcare
 * ==========================================
 *
 * Centralização de exports para todos os tipos TypeScript
 * do sistema NeonPro Healthcare.
 */

// Import Notification from database package
import type { Notification } from "@neonpro/db";
import type {
	ApiResponse,
	PaginatedResponse,
	PaginationParams,
} from "./api.types";

// Re-export commonly used types for convenience
export type {
	Address,
	ApiError,
	ApiMeta,
	// API types
	ApiResponse,
	ApiStatusCode,
	Appointment,
	AppointmentResponse,
	// Entity types
	BaseEntity,
	BusinessHours,
	Clinic,
	ClinicResponse,
	ContactInfo,
	ErrorResponse,
	FileDocument,
	GeoCoordinates,
	HealthCheckResponse,
	HttpMethod,
	ListResponse,
	// Response types
	LoginResponse,
	PaginatedResponse,
	PaginationMeta,
	PaginationParams,
	Patient,
	PatientResponse,
	Payment,
	Professional,
	RegisterResponse,
	RequestContext,
	SearchParams,
	SuccessResponse,
	TreatmentRecord,
	User,
	ValidationError,
} from "./api.types";

// Re-export Notification from database package
export type { Notification };
// API types
export * from "./api.types";
export type { Entity, EntityType } from "./entities.types";
// Entity types
export * from "./entities.types";
// Hono types for RPC client
export type { RpcClient } from "./hono.types";
export type {
	AuthErrorResponse,
	ConflictErrorResponse,
	NotFoundErrorResponse,
	RateLimitErrorResponse,
	ServerErrorResponse,
	ValidationErrorResponse,
} from "./responses.types";
// Response types
export * from "./responses.types";

// Utility types for common patterns
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Nullable<T> = T | null;
export type NonNullable<T> = T extends null | undefined ? never : T;

// ID types
export type UUID = string;
export type EntityId = UUID;

// Date/Time types
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string; // ISO 8601
export type TimeString = string; // HH:MM

// Common enums as const assertions for better type inference
export const APPOINTMENT_STATUSES = [
	"scheduled",
	"confirmed",
	"in_progress",
	"completed",
	"cancelled",
	"no_show",
	"rescheduled",
] as const;

export const USER_ROLES = [
	"super_admin",
	"admin",
	"doctor",
	"nurse",
	"aesthetician",
	"receptionist",
	"manager",
	"patient",
] as const;

export const APPOINTMENT_TYPES = [
	"consultation",
	"follow_up",
	"botox",
	"filler",
	"laser_hair_removal",
	"chemical_peel",
	"microneedling",
	"hydrafacial",
	"laser_treatment",
	"fat_reduction",
	"skin_tightening",
	"assessment",
	"other",
] as const;

// Type utilities for form handling
export type FormData<T> = {
	[K in keyof T]: T[K] extends string | number | boolean | null | undefined
		? T[K]
		: string;
};

export type FormErrors<T> = {
	[K in keyof T]?: string | string[];
} & {
	_global?: string[];
};

// API endpoint utilities
export type EndpointMethod<T> = T extends `${string}:${infer M}` ? M : "GET";
export type EndpointPath<T> = T extends `${infer P}:${string}` ? P : T;

// Generic CRUD operations types
export type CrudOperations<
	T,
	TCreate = Omit<T, "id" | "createdAt" | "updatedAt">,
	TUpdate = Partial<TCreate>,
> = {
	create: (data: TCreate) => Promise<ApiResponse<T>>;
	read: (id: EntityId) => Promise<ApiResponse<T>>;
	update: (id: EntityId, data: TUpdate) => Promise<ApiResponse<T>>;
	delete: (id: EntityId) => Promise<ApiResponse<{ id: EntityId }>>;
	list: (params?: PaginationParams) => Promise<PaginatedResponse<T>>;
};

// Filter utilities
export type FilterOperator =
	| "eq"
	| "ne"
	| "gt"
	| "gte"
	| "lt"
	| "lte"
	| "in"
	| "nin"
	| "like"
	| "ilike";

export type FilterCondition<T = unknown> = {
	field: string;
	operator: FilterOperator;
	value: T;
};

export type SearchFilter = {
	conditions: FilterCondition[];
	logic?: "AND" | "OR";
	pagination?: PaginationParams;
	sorting?: {
		field: string;
		order: "asc" | "desc";
	};
};

// Event types for real-time updates
export type DomainEvent<T = unknown> = {
	id: string;
	type: string;
	aggregateId: string;
	aggregateType: string;
	payload: T;
	metadata: {
		version: number;
		timestamp: string;
		userId?: string;
		correlationId?: string;
	};
};

// Configuration types
export type HealthConfig = {
	timeout: number;
	retries: number;
	circuitBreaker: {
		enabled: boolean;
		threshold: number;
		resetTimeout: number;
	};
};

export type CacheConfig = {
	enabled: boolean;
	ttl: number; // seconds
	maxSize: number;
	provider: "memory" | "redis";
};

// Environment configuration
export type EnvironmentConfig = {
	NODE_ENV: "development" | "production" | "test";
	API_URL: string;
	DATABASE_URL: string;
	REDIS_URL?: string;
	JWT_SECRET: string;
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
	ENCRYPTION_KEY: string;
};

// Type guards
export const isUUID = (value: string): value is UUID => {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
};

export const isISODate = (value: string): value is ISODate => {
	const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
	return isoDateRegex.test(value) && !Number.isNaN(Date.parse(value));
};

export const isISODateTime = (value: string): value is ISODateTime => {
	return !Number.isNaN(Date.parse(value));
};

export const isTimeString = (value: string): value is TimeString => {
	const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
	return timeRegex.test(value);
};
