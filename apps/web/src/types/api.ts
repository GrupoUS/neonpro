// Re-export types from shared packages (specific exports to avoid conflicts)
// export type * from '@neonpro/database'
// export type * from '@neonpro/types'

// Import specific types when needed
import type {
  Appointment as DatabaseAppointment,
  Database as DatabaseType,
  Patient as DatabasePatient,
} from '@neonpro/database'

// Re-export with aliases to avoid conflicts
export type { DatabaseAppointment, DatabasePatient, DatabaseType, }

// Frontend-specific API types
export interface ApiResponse<T = unknown,> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T,> extends ApiResponse<T[]> {
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'professional' | 'receptionist'
  clinicId?: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: string
}
