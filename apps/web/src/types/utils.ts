import { z } from 'zod'

// Utility types for common patterns
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Deep readonly type
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Extract error type from Zod schema
export type ErrorType<T> = T extends z.ZodSchema<infer U> ? z.ZodError<U> : never

// Extract success type from Result
export type SuccessType<T> = T extends { success: true; data: infer U } ? U
  : never
export type ErrorTypeFromResult<T> = T extends {
  success: false
  error: infer E
} ? E
  : never

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Healthcare-specific types
export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  dateOfBirth: Date
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  scheduledAt: Date
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  type: string
  duration: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Form state types
export interface FormState<T = unknown> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
}

// Async state types
export interface AsyncState<T = unknown, E = Error> {
  data: T | null
  loading: boolean
  error: E | null
  success: boolean
}

// Query key factory for React Query
export const QueryKeyFactory = {
  patients: {
    all: ['patients'] as const,
    lists: () => [...QueryKeyFactory.patients.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...QueryKeyFactory.patients.lists(), filters] as const,
    details: () => [...QueryKeyFactory.patients.all, 'detail'] as const,
    detail: (id: string) => [...QueryKeyFactory.patients.details(), id] as const,
  },

  appointments: {
    all: ['appointments'] as const,
    lists: () => [...QueryKeyFactory.appointments.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...QueryKeyFactory.appointments.lists(), filters] as const,
    details: () => [...QueryKeyFactory.appointments.all, 'detail'] as const,
    detail: (id: string) => [...QueryKeyFactory.appointments.details(), id] as const,
  },

  doctors: {
    all: ['doctors'] as const,
    lists: () => [...QueryKeyFactory.doctors.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...QueryKeyFactory.doctors.lists(), filters] as const,
    details: () => [...QueryKeyFactory.doctors.all, 'detail'] as const,
    detail: (id: string) => [...QueryKeyFactory.doctors.details(), id] as const,
  },
} as const

// Event types
export interface AppEvent {
  type: string
  payload: unknown
  timestamp: Date
  userId?: string
}

export type EventHandler<T extends AppEvent = AppEvent> = (event: T) => void

// Utility functions
export const createApiResponse = <T>(
  data: T,
  meta?: ApiResponse<T>['meta'],
): ApiResponse<T> => ({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    version: '1.0.0',
    ...meta,
  },
})

export const createApiError = (
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
  meta: {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    version: '1.0.0',
  },
})

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  meta?: PaginatedResponse<T>['meta'],
): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    version: '1.0.0',
    ...meta,
  },
})

// Type-safe event emitter
export class EventEmitter<TEvents extends Record<string, unknown>> {
  private listeners = new Map<keyof TEvents, Set<Function>>()

  on<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  off<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): void {
    this.listeners.get(event)?.delete(listener)
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    this.listeners.get(event)?.forEach(listener => listener(payload))
  }

  removeAllListeners<K extends keyof TEvents>(event?: K): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}
