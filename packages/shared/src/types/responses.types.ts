/**
 * 📡 Response Types - NeonPro Healthcare
 * =======================================
 *
 * Tipos específicos para respostas da API
 * com estruturas padronizadas para cada endpoint.
 */

import type { Notification } from "@neonpro/db";
import type { TimeSlot } from "../schemas/appointment.schema";
import type { AuthToken, AuthUser } from "../schemas/auth.schema";
import type { ApiMeta, ApiResponse, PaginationMeta } from "./api.types";
import type {
	Appointment,
	Clinic,
	FileDocument,
	Patient,
	Payment,
	Professional,
	TreatmentRecord,
} from "./entities.types";

// Generic paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	meta: ApiMeta & {
		pagination: PaginationMeta;
	};
}

// Generic list response (without pagination)
export interface ListResponse<T> extends ApiResponse<T[]> {
	meta: ApiMeta & {
		total: number;
	};
}

// Authentication Responses
export interface LoginResponse
	extends ApiResponse<{
		user: AuthUser;
		tokens: AuthToken;
		requiresMFA?: boolean;
	}> {}

export interface RegisterResponse
	extends ApiResponse<{
		user: AuthUser;
		message: string;
		requiresVerification?: boolean;
	}> {}

export interface RefreshTokenResponse
	extends ApiResponse<{
		tokens: AuthToken;
	}> {}

export interface ProfileResponse extends ApiResponse<AuthUser> {}

export interface MFASetupResponse
	extends ApiResponse<{
		qrCode?: string; // For TOTP
		backupCodes?: string[];
		secret?: string;
	}> {}

// Patient Responses
export interface PatientResponse extends ApiResponse<Patient> {}

export interface PatientsListResponse extends PaginatedResponse<Patient> {}

export interface PatientSearchResponse extends PaginatedResponse<Patient> {}

export interface PatientStatsResponse
	extends ApiResponse<{
		totalPatients: number;
		newPatientsThisMonth: number;
		averageAge: number;
		genderDistribution: {
			male: number;
			female: number;
			other: number;
		};
		topCities: Array<{
			city: string;
			count: number;
		}>;
	}> {}

export interface PatientExportResponse
	extends ApiResponse<{
		downloadUrl: string;
		format: "csv" | "xlsx" | "pdf";
		totalRecords: number;
		expiresAt: string;
	}> {}

// Appointment Responses
export interface AppointmentResponse extends ApiResponse<Appointment> {}

export interface AppointmentsListResponse
	extends PaginatedResponse<Appointment> {}

export interface AppointmentSearchResponse
	extends PaginatedResponse<Appointment> {}

export interface AppointmentAvailabilityResponse
	extends ApiResponse<TimeSlot[]> {}

export interface AppointmentRescheduleResponse
	extends ApiResponse<{
		appointment: Appointment;
		message: string;
	}> {}

export interface AppointmentCancelResponse
	extends ApiResponse<{
		appointment: Appointment;
		refundAmount?: number;
		message: string;
	}> {}

export interface AppointmentStatsResponse
	extends ApiResponse<{
		totalAppointments: number;
		thisMonth: number;
		upcomingToday: number;
		completedThisMonth: number;
		cancelledThisMonth: number;
		noShowsThisMonth: number;
		averageDuration: number;
		statusDistribution: Record<string, number>;
		typeDistribution: Record<string, number>;
		revenueThisMonth: number;
		averageRating: number;
	}> {}

// Clinic Responses
export interface ClinicResponse extends ApiResponse<Clinic> {}

export interface ClinicsListResponse extends PaginatedResponse<Clinic> {}

export interface ClinicSearchResponse extends PaginatedResponse<Clinic> {}

export interface ClinicStaffResponse extends ListResponse<Professional> {}

export interface ClinicServicesResponse
	extends ListResponse<{
		id: string;
		name: string;
		category: string;
		duration: number;
		price?: number;
		isActive: boolean;
	}> {}

export interface ClinicAvailabilityResponse
	extends ApiResponse<{
		date: string;
		professionals: Array<{
			professionalId: string;
			name: string;
			availableSlots: TimeSlot[];
		}>;
	}> {}

export interface ClinicStatsResponse
	extends ApiResponse<{
		totalRevenue: number;
		monthlyRevenue: number;
		totalAppointments: number;
		monthlyAppointments: number;
		totalPatients: number;
		activePatients: number;
		staffCount: number;
		averageRating: number;
		occupancyRate: number;
		popularServices: Array<{
			name: string;
			count: number;
			revenue: number;
		}>;
	}> {}

// Professional Responses
export interface ProfessionalResponse extends ApiResponse<Professional> {}

export interface ProfessionalsListResponse extends ListResponse<Professional> {}

export interface ProfessionalScheduleResponse
	extends ApiResponse<{
		professional: Professional;
		schedule: Array<{
			date: string;
			slots: TimeSlot[];
		}>;
	}> {}

export interface ProfessionalStatsResponse
	extends ApiResponse<{
		totalPatients: number;
		totalAppointments: number;
		completedAppointments: number;
		averageRating: number;
		totalReviews: number;
		monthlyAppointments: number;
		monthlyRevenue: number;
		popularTreatments: Array<{
			treatment: string;
			count: number;
		}>;
	}> {}

// Notification Responses
export interface NotificationResponse extends ApiResponse<Notification> {}

export interface NotificationsListResponse
	extends PaginatedResponse<Notification> {}

export interface NotificationMarkReadResponse
	extends ApiResponse<{
		notification: Notification;
	}> {}

export interface NotificationStatsResponse
	extends ApiResponse<{
		unreadCount: number;
		totalCount: number;
		byType: Record<string, number>;
	}> {}

// Treatment Record Responses
export interface TreatmentRecordResponse extends ApiResponse<TreatmentRecord> {}

export interface TreatmentRecordsListResponse
	extends PaginatedResponse<TreatmentRecord> {}

export interface TreatmentStatsResponse
	extends ApiResponse<{
		totalTreatments: number;
		byType: Record<string, number>;
		successRate: number;
		averageRating: number;
		adverseReactions: number;
		mostPopular: Array<{
			treatment: string;
			count: number;
		}>;
	}> {}

// Payment Responses
export interface PaymentResponse extends ApiResponse<Payment> {}

export interface PaymentsListResponse extends PaginatedResponse<Payment> {}

export interface PaymentCreateResponse
	extends ApiResponse<{
		payment: Payment;
		paymentUrl?: string; // For external processors
		qrCode?: string; // For PIX
		barcodeNumber?: string; // For bank slip
	}> {}

export interface PaymentStatsResponse
	extends ApiResponse<{
		totalRevenue: number;
		monthlyRevenue: number;
		pendingAmount: number;
		completedPayments: number;
		pendingPayments: number;
		failedPayments: number;
		byMethod: Record<
			string,
			{
				count: number;
				amount: number;
			}
		>;
		avgPaymentValue: number;
	}> {}

// File/Document Responses
export interface FileUploadResponse extends ApiResponse<FileDocument> {}

export interface FilesListResponse extends ListResponse<FileDocument> {}

export interface FileDownloadResponse
	extends ApiResponse<{
		downloadUrl: string;
		expiresAt: string;
	}> {}

// Health Check Response
export interface HealthCheckResponse
	extends ApiResponse<{
		status: "healthy" | "unhealthy";
		environment: string;
		version: string;
		uptime: number;
		timestamp: string;
		services: {
			database: "healthy" | "unhealthy";
			redis?: "healthy" | "unhealthy";
			storage: "healthy" | "unhealthy";
			email?: "healthy" | "unhealthy";
		};
		performance: {
			responseTime: number;
			memoryUsage: number;
			cpuUsage?: number;
		};
	}> {}

// Analytics/Dashboard Responses
export interface DashboardStatsResponse
	extends ApiResponse<{
		overview: {
			totalPatients: number;
			totalAppointments: number;
			totalRevenue: number;
			averageRating: number;
		};
		trends: {
			patientsGrowth: number; // percentage
			appointmentsGrowth: number;
			revenueGrowth: number;
		};
		upcomingAppointments: Appointment[];
		recentPatients: Patient[];
		topTreatments: Array<{
			name: string;
			count: number;
			revenue: number;
		}>;
		monthlyRevenue: Array<{
			month: string;
			revenue: number;
			appointments: number;
		}>;
	}> {}

export interface ReportsResponse
	extends ApiResponse<{
		reportType: string;
		generatedAt: string;
		period: {
			startDate: string;
			endDate: string;
		};
		data: Record<string, unknown>;
		downloadUrl?: string;
	}> {}

// Bulk Operation Responses
export interface BulkImportResponse
	extends ApiResponse<{
		totalProcessed: number;
		successCount: number;
		errorCount: number;
		errors: Array<{
			row: number;
			field: string;
			message: string;
		}>;
		importId: string;
	}> {}

export interface BulkDeleteResponse
	extends ApiResponse<{
		deletedCount: number;
		failedCount: number;
		errors?: Array<{
			id: string;
			reason: string;
		}>;
	}> {}

// Search/Filter Response Types
export type SearchResponse<T> = PaginatedResponse<T>;

// Generic CRUD Response Types
export interface CreateResponse<T> extends ApiResponse<T> {}
export interface UpdateResponse<T> extends ApiResponse<T> {}
export interface DeleteResponse
	extends ApiResponse<{
		id: string;
		message: string;
	}> {}

// Error Response Types
export interface ValidationErrorResponse extends ApiResponse<never> {
	success: false;
	errors: Record<string, string[]>;
	message: "Validation failed";
}

export interface AuthErrorResponse extends ApiResponse<never> {
	success: false;
	error: "UNAUTHORIZED" | "FORBIDDEN" | "TOKEN_EXPIRED" | "INVALID_CREDENTIALS";
	message: string;
}

export interface NotFoundErrorResponse extends ApiResponse<never> {
	success: false;
	error: "NOT_FOUND";
	message: string;
}

export interface ConflictErrorResponse extends ApiResponse<never> {
	success: false;
	error: "CONFLICT";
	message: string;
	details?: {
		field: string;
		value: unknown;
	};
}

export interface RateLimitErrorResponse extends ApiResponse<never> {
	success: false;
	error: "RATE_LIMIT_EXCEEDED";
	message: string;
	retryAfter: number; // seconds
}

export interface ServerErrorResponse extends ApiResponse<never> {
	success: false;
	error: "INTERNAL_SERVER_ERROR" | "SERVICE_UNAVAILABLE";
	message: string;
	requestId?: string;
}

// Union type of all possible error responses
export type ErrorResponse =
	| ValidationErrorResponse
	| AuthErrorResponse
	| NotFoundErrorResponse
	| ConflictErrorResponse
	| RateLimitErrorResponse
	| ServerErrorResponse;

// Union type of all success responses
export type SuccessResponse =
	| LoginResponse
	| RegisterResponse
	| PatientResponse
	| AppointmentResponse
	| ClinicResponse
	| HealthCheckResponse;
// ... add more as needed

// Type guard helpers
export const isErrorResponse = (
	response: unknown,
): response is ErrorResponse => {
	return (
		typeof response === "object" &&
		response !== null &&
		"success" in response &&
		(response as any).success === false
	);
};

export const isPaginatedResponse = <T>(
	response: unknown,
): response is PaginatedResponse<T> => {
	return (
		typeof response === "object" &&
		response !== null &&
		"success" in response &&
		"meta" in response &&
		"pagination" in (response as any).meta
	);
};
