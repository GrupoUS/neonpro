import type { PaginatedResponse } from './common.js'
import type { Appointment, HealthcareProfessional, Patient } from './healthcare.js'

// tRPC API types
export interface TRPCContext {
  user?: {
    id: string
    email: string
    role: string
  }
  session?: {
    id: string
    expiresAt: Date
  }
}

// Authentication API types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  expiresAt: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// Patient API types
export interface CreatePatientRequest {
  name: string
  cpf: string
  email?: string
  phone?: string
  birthDate: string // ISO string
  consent: {
    given: boolean
    purpose: string
  }
}

export interface UpdatePatientRequest {
  name?: string
  email?: string
  phone?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface GetPatientsRequest {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive'
}

// Appointment API types
export interface CreateAppointmentRequest {
  patientId: string
  professionalId: string
  datetime: string // ISO string
  duration?: number
  type: 'consultation' | 'exam' | 'procedure' | 'follow_up' | 'emergency'
  notes?: string
}

export interface UpdateAppointmentRequest {
  datetime?: string
  duration?: number
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  diagnosis?: string
  treatment?: string
}

export interface GetAppointmentsRequest {
  page?: number
  limit?: number
  patientId?: string
  professionalId?: string
  date?: string // ISO date string
  status?: string
}

// Professional API types
export interface CreateProfessionalRequest {
  name: string
  email: string
  phone: string
  crm?: string
  coren?: string
  specialty?: string
  department?: string
}

export interface UpdateProfessionalRequest {
  name?: string
  phone?: string
  specialty?: string
  department?: string
  isActive?: boolean
}

// Error response types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ErrorResponse {
  success: false
  error: string
  details?: ValidationError[]
  timestamp: string
}

// Compliance API types
export interface LGPDConsentRequest {
  purpose: string
  version: string
}

export interface DataExportRequest {
  patientId: string
  format: 'json' | 'pdf'
  includeDeleted?: boolean
}

export interface DataDeletionRequest {
  patientId: string
  reason: string
  confirmDelete: boolean
}

// Search and filter types
export interface SearchFilters {
  query?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  type?: string
  professionalId?: string
  patientId?: string
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// Paginated API responses
export type PatientsResponse = PaginatedResponse<Patient>
export type AppointmentsResponse = PaginatedResponse<Appointment>
export type ProfessionalsResponse = PaginatedResponse<HealthcareProfessional>
