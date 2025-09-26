// Common base types for NeonPro platform
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

// LGPD Compliance types
export interface LGPDConsent {
  given: boolean
  timestamp: Date
  version: string
  purpose: string
  ipAddress?: string
}

export interface DataRetentionPolicy {
  expiresAt: Date
  purpose: string
  category: 'medical' | 'personal' | 'administrative' | 'financial'
}

// User and authentication types
export interface User extends BaseEntity {
  email: string
  name: string
  role: UserRole
  consent: LGPDConsent
  dataRetention: DataRetentionPolicy
  isActive: boolean
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient' | 'viewer'

// Generic response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

// Status and state types
export type Status = 'active' | 'inactive' | 'pending' | 'archived'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
