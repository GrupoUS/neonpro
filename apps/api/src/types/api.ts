/**
 * API Types for NeonPro Healthcare Backend
 * Implements proper TypeScript interfaces for request/response handling
 * Healthcare compliance: LGPD + ANVISA + CFM data structures
 */

import type { Database } from "@neonpro/database/types";

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication types
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  clinic_id: string;
  permissions: string[];
  professional_id?: string;
}

// Patient API types
export interface CreatePatientRequest {
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  birth_date: string;
  gender: "M" | "F" | "O";
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_history?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    notes?: string;
  };
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: string;
}

export interface PatientResponse {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  birth_date: string;
  gender: "M" | "F" | "O";
  address?: any;
  emergency_contact?: any;
  medical_history?: any;
  clinic_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface PatientListParams extends PaginationParams {
  search?: string;
  gender?: "M" | "F" | "O";
  age_min?: number;
  age_max?: number;
  created_after?: string;
  created_before?: string;
}

// Appointment API types
export interface CreateAppointmentRequest {
  patient_id: string;
  professional_id: string;
  scheduled_at: string;
  duration_minutes: number;
  appointment_type: string;
  notes?: string;
  priority: "low" | "normal" | "high" | "urgent";
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
  id: string;
  status?: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
}

export interface AppointmentResponse {
  id: string;
  patient_id: string;
  professional_id: string;
  clinic_id: string;
  scheduled_at: string;
  duration_minutes: number;
  appointment_type: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  notes?: string;
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  // Populated fields
  patient?: PatientResponse;
  professional?: {
    id: string;
    name: string;
    specialty: string;
    license_number: string;
  };
}

export interface AppointmentListParams extends PaginationParams {
  patient_id?: string;
  professional_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  appointment_type?: string;
  priority?: string;
}

// Professional API types
export interface ProfessionalResponse {
  id: string;
  name: string;
  email: string;
  specialty: string;
  license_number: string;
  license_type: string;
  clinic_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Health check types
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  latency: number;
  services: {
    database: {
      status: "healthy" | "unhealthy";
      latency: number;
      error?: string;
    };
    api: {
      status: "healthy";
      uptime: number;
      memory_usage?: number;
    };
    auth: {
      status: "healthy" | "unhealthy";
      error?: string;
    };
  };
  version: string;
  environment: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  request_id?: string;
}

export interface ValidationError extends ApiError {
  code: "VALIDATION_ERROR";
  field_errors: {
    field: string;
    message: string;
  }[];
}

export interface AuthenticationError extends ApiError {
  code: "AUTHENTICATION_ERROR";
}

export interface AuthorizationError extends ApiError {
  code: "AUTHORIZATION_ERROR";
  required_permission?: string;
}

export interface NotFoundError extends ApiError {
  code: "NOT_FOUND";
  resource: string;
  resource_id?: string;
}

export interface ConflictError extends ApiError {
  code: "CONFLICT";
  conflict_type: string;
}

// Request context types
export interface RequestContext {
  user: AuthenticatedUser;
  request_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

// Audit log types
export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: any;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  clinic_id: string;
}

// Database table types (re-exported for convenience)
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type Professional = Database["public"]["Tables"]["healthcare_professionals"]["Row"];
export type Clinic = Database["public"]["Tables"]["clinics"]["Row"];

// Insert types
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
export type ProfessionalInsert = Database["public"]["Tables"]["healthcare_professionals"]["Insert"];

// Update types
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];
export type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];
export type ProfessionalUpdate = Database["public"]["Tables"]["healthcare_professionals"]["Update"];

// Query filter types
export interface BaseFilters {
  clinic_id: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}

export interface PatientFilters extends BaseFilters {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  gender?: "M" | "F" | "O";
  age_min?: number;
  age_max?: number;
}

export interface AppointmentFilters extends BaseFilters {
  patient_id?: string;
  professional_id?: string;
  status?: string;
  scheduled_after?: string;
  scheduled_before?: string;
  appointment_type?: string;
  priority?: string;
}

// Response helpers
export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (error: string, details?: any): ApiResponse => ({
  success: false,
  error,
  message: details,
  timestamp: new Date().toISOString(),
});

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginatedResponse<T>["pagination"],
): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination,
  timestamp: new Date().toISOString(),
});
