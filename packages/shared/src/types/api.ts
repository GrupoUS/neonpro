/**
 * Shared API types for NeonPro Healthcare Platform
 * Type-safe interfaces for all API communications
 */

// Base API response structure
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: PaginationResponse;
}

// Patient API types
export interface PatientCreateRequest {
  clinicId: string;
  fullName: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  lgpdConsentGiven: boolean;
}

export interface PatientUpdateRequest extends Partial<PatientCreateRequest> {
  id: string;
}

export interface PatientQueryParams extends PaginationParams {
  clinicId: string;
  status?: "active" | "inactive" | "all";
}

// Appointment API types
export interface AppointmentCreateRequest {
  patientId: string;
  professionalId: string;
  serviceId: string;
  clinicId: string;
  scheduledAt: string;
  notes?: string;
  duration?: number;
}

export interface AppointmentUpdateRequest
  extends Partial<AppointmentCreateRequest> {
  id: string;
  status?:
    | "scheduled"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
}

export interface AppointmentQueryParams extends PaginationParams {
  clinicId: string;
  patientId?: string;
  professionalId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Professional API types
export interface ProfessionalCreateRequest {
  clinicId: string;
  _userId: string;
  fullName: string;
  specialization: string;
  licenseNumber: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface ProfessionalUpdateRequest
  extends Partial<ProfessionalCreateRequest> {
  id: string;
}

// Real-time event types
export interface RealtimeEvent<T = any> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  new?: T;
  old?: T;
  timestamp: string;
}

// LGPD Compliance types
export interface ConsentRequest {
  patientId: string;
  purpose:
    | "medical_treatment"
    | "ai_assistance"
    | "communication"
    | "marketing";
  expiresAt?: string;
}

export interface AuditLogEntry {
  operation: string;
  _userId: string;
  tableName: string;
  recordId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  duration: number;
  success: boolean;
  error?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError extends ApiError {
  field: string;
  value: any;
  constraint: string;
}

// Health check types
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  _service: string;
  version: string;
  checks: {
    database: boolean;
    supabase: boolean;
    cache?: boolean;
  };
  metrics?: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  _role: "admin" | "professional" | "receptionist";
  clinicAccess: string[];
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends ApiResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// File upload types
export interface FileUploadRequest {
  file: File;
  category: "patient_photo" | "document" | "treatment_photo";
  patientId?: string;
  appointmentId?: string;
}

export interface FileUploadResponse extends ApiResponse {
  fileId: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}
