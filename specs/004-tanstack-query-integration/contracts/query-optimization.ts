/**
 * Query Optimization Contracts
 * TanStack Query Integration Analysis and Optimization
 */

import { QueryOptions, UseMutationResult, UseQueryResult, } from '@tanstack/react-query'

// ============================================================================
// Query Pattern Contracts
// ============================================================================

/**
 * Enhanced Query Factory Contract
 * Provides type-safe query options with healthcare-specific configurations
 */
export interface QueryFactory<TData, TError = Error,> {
  queryKey: readonly unknown[]
  queryFn: () => Promise<TData>
  staleTime?: number
  gcTime?: number
  enabled?: boolean
}

/**
 * Healthcare Query Configuration Contract
 * Defines cache times and policies for different healthcare data types
 */
export interface HealthcareQueryConfig {
  patient: {
    staleTime: number // 2 minutes for patient safety
    gcTime: number // 5 minutes for LGPD compliance
  }
  appointment: {
    staleTime: number // 1 minute for real-time scheduling
    gcTime: number // 10 minutes for operational data
  }
  audit: {
    staleTime: number // 0 for compliance requirements
    gcTime: number // 2 minutes minimal retention
  }
  professional: {
    staleTime: number // 10 minutes for stable data
    gcTime: number // 30 minutes for professional info
  }
  service: {
    staleTime: number // 30 minutes for service catalog
    gcTime: number // 60 minutes for configuration data
  }
}

/**
 * Query Options Factory Contract
 * Type-safe factory for creating optimized query configurations
 */
export interface QueryOptionsFactory {
  patient: {
    detail: (id: string,) => QueryFactory<Patient>
    list: (filters?: PatientFilters,) => QueryFactory<PaginatedResponse<Patient>>
    appointments: (patientId: string,) => QueryFactory<Appointment[]>
    medicalRecords: (patientId: string,) => QueryFactory<MedicalRecord[]>
  }
  appointment: {
    detail: (id: string,) => QueryFactory<Appointment>
    list: (filters?: AppointmentFilters,) => QueryFactory<PaginatedResponse<Appointment>>
    calendar: (date: string,) => QueryFactory<Appointment[]>
    availability: (params: AvailabilityParams,) => QueryFactory<TimeSlot[]>
  }
  professional: {
    detail: (id: string,) => QueryFactory<Professional>
    list: (filters?: ProfessionalFilters,) => QueryFactory<PaginatedResponse<Professional>>
    schedule: (professionalId: string,) => QueryFactory<Schedule>
  }
}

// ============================================================================
// Cache Strategy Contracts
// ============================================================================

/**
 * Intelligent Prefetching Contract
 * Defines prefetching strategies for healthcare workflows
 */
export interface PrefetchStrategy {
  /**
   * Prefetch patient workflow data
   * Loads patient details, appointments, and medical records
   */
  prefetchPatientWorkflow: (patientId: string,) => Promise<void>

  /**
   * Warm scheduling cache
   * Preloads availability and calendar data for appointment scheduling
   */
  warmSchedulingCache: (professionalId: string, date: string,) => Promise<void>

  /**
   * Emergency access prefetch
   * Immediately loads critical patient data for emergency scenarios
   */
  emergencyPrefetch: (patientId: string,) => Promise<void>
}

/**
 * Cache Management Contract
 * Provides cache control and monitoring capabilities
 */
export interface CacheManager {
  /**
   * Invalidate healthcare-specific cache patterns
   */
  invalidatePatientData: (patientId: string,) => Promise<void>
  invalidateAppointmentData: (appointmentId: string,) => Promise<void>
  invalidateScheduleData: (professionalId: string, date: string,) => Promise<void>

  /**
   * Cache health monitoring
   */
  getCacheHealth: () => CacheHealthMetrics
  getCacheSize: () => number
  getHitRate: () => number
}

/**
 * Cache Health Metrics Contract
 */
export interface CacheHealthMetrics {
  totalQueries: number
  staleQueries: number
  errorQueries: number
  patientCacheSize: number
  appointmentCacheSize: number
  lastUpdated: string
}

// ============================================================================
// Performance Monitoring Contracts
// ============================================================================

/**
 * Performance Metrics Contract
 * Defines measurable performance indicators
 */
export interface PerformanceMetrics {
  cacheHitRate: number
  apiRequestReduction: number
  bundleSize: number
  perceivedPerformance: 'poor' | 'fair' | 'good' | 'excellent'
  typeSeafetyCoverage: number
  developmentSpeed: number
  errorRate: number
  responseTime: number
}

/**
 * Performance Monitoring Contract
 * Provides performance tracking and alerting
 */
export interface PerformanceMonitor {
  /**
   * Track query performance metrics
   */
  trackQueryPerformance: (queryKey: unknown[], duration: number,) => void

  /**
   * Monitor cache performance
   */
  trackCachePerformance: (operation: 'hit' | 'miss' | 'invalidate', queryKey: unknown[],) => void

  /**
   * Get performance report
   */
  getPerformanceReport: () => PerformanceReport

  /**
   * Set performance alerts
   */
  setPerformanceAlert: (metric: keyof PerformanceMetrics, threshold: number,) => void
}

/**
 * Performance Report Contract
 */
export interface PerformanceReport {
  current: PerformanceMetrics
  target: PerformanceMetrics
  improvement: Partial<PerformanceMetrics>
  recommendations: string[]
}

// ============================================================================
// Optimistic Updates Contracts
// ============================================================================

/**
 * Optimistic Update Contract
 * Defines optimistic update patterns for healthcare operations
 */
export interface OptimisticUpdateStrategy<TData, TVariables,> {
  /**
   * Optimistic update function
   */
  onMutate: (variables: TVariables,) => Promise<{ previousData: TData | undefined }>

  /**
   * Error rollback function
   */
  onError: (
    error: Error,
    variables: TVariables,
    context: { previousData: TData | undefined },
  ) => void

  /**
   * Settlement function (always runs)
   */
  onSettled: () => Promise<void>
}

/**
 * Healthcare Optimistic Updates Contract
 * Specific optimistic update patterns for healthcare entities
 */
export interface HealthcareOptimisticUpdates {
  patient: {
    create: OptimisticUpdateStrategy<Patient[], CreatePatientData>
    update: OptimisticUpdateStrategy<Patient, UpdatePatientData>
    delete: OptimisticUpdateStrategy<Patient[], string>
  }
  appointment: {
    create: OptimisticUpdateStrategy<Appointment[], CreateAppointmentData>
    update: OptimisticUpdateStrategy<Appointment, UpdateAppointmentData>
    reschedule: OptimisticUpdateStrategy<Appointment, RescheduleAppointmentData>
    cancel: OptimisticUpdateStrategy<Appointment, CancelAppointmentData>
  }
}

// ============================================================================
// Compliance Contracts
// ============================================================================

/**
 * LGPD Compliance Contract
 * Ensures query operations comply with Brazilian data protection law
 */
export interface LGPDCompliance {
  /**
   * Validate data access consent
   */
  validateConsent: (userId: string, dataType: string,) => Promise<boolean>

  /**
   * Log data access for audit trail
   */
  logDataAccess: (userId: string, dataType: string, operation: string,) => Promise<void>

  /**
   * Check data retention policy
   */
  checkRetentionPolicy: (dataType: string,) => number

  /**
   * Handle right to erasure
   */
  handleDataErasure: (userId: string, dataType: string,) => Promise<void>
}

/**
 * ANVISA Compliance Contract
 * Ensures medical device and data integrity compliance
 */
export interface ANVISACompliance {
  /**
   * Validate data integrity
   */
  validateDataIntegrity: (data: unknown,) => boolean

  /**
   * Log medical device operations
   */
  logMedicalOperation: (operation: string, data: unknown,) => Promise<void>

  /**
   * Validate access control
   */
  validateAccessControl: (userId: string, resource: string,) => Promise<boolean>
}

/**
 * Audit Logging Contract
 * Comprehensive audit trail for healthcare operations
 */
export interface AuditLogger {
  /**
   * Log query operations
   */
  logQueryOperation: (queryKey: unknown[], operation: string, userId: string,) => Promise<void>

  /**
   * Log cache operations
   */
  logCacheOperation: (operation: string, queryKey: unknown[], userId: string,) => Promise<void>

  /**
   * Log performance metrics
   */
  logPerformanceMetrics: (metrics: PerformanceMetrics,) => Promise<void>

  /**
   * Get audit trail
   */
  getAuditTrail: (filters: AuditFilters,) => Promise<AuditEntry[]>
}

// ============================================================================
// Developer Experience Contracts
// ============================================================================

/**
 * Developer Utilities Contract
 * Tools for debugging and monitoring query operations
 */
export interface DeveloperUtilities {
  /**
   * Debug query state
   */
  debugQuery: (queryKey: unknown[],) => QueryDebugInfo

  /**
   * Monitor query performance
   */
  monitorPerformance: () => PerformanceMetrics

  /**
   * Analyze cache health
   */
  analyzeCacheHealth: () => CacheHealthMetrics

  /**
   * Generate performance report
   */
  generateReport: () => PerformanceReport
}

/**
 * Query Debug Information Contract
 */
export interface QueryDebugInfo {
  queryKey: unknown[]
  status: 'idle' | 'pending' | 'error' | 'success'
  data: unknown
  error: Error | null
  isStale: boolean
  isFetching: boolean
  lastUpdated: number
  cacheTime: number
  staleTime: number
}

// ============================================================================
// Type Definitions (Referenced in contracts)
// ============================================================================

// Healthcare Entity Types
export interface Patient {
  id: string
  name: string
  cpf: string
  email: string
  phone: string
  birthDate: string
  gender: 'male' | 'female' | 'other'
  address: Address
  medicalHistory: MedicalHistory
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: string
  patientId: string
  professionalId: string
  serviceId: string
  scheduledAt: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Professional {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  license: string
  clinicId: string
  schedule: Schedule
  createdAt: string
  updatedAt: string
}

// Utility Types
export interface PaginatedResponse<T,> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
  professionalId: string
}

// Filter Types
export interface PatientFilters {
  query?: string
  gender?: string
  city?: string
  ageRange?: { min: number; max: number }
  page?: number
  limit?: number
}

export interface AppointmentFilters {
  startDate?: string
  endDate?: string
  patientId?: string
  professionalId?: string
  status?: string
  page?: number
  limit?: number
}

export interface ProfessionalFilters {
  query?: string
  specialization?: string
  clinicId?: string
  license?: string
  page?: number
  limit?: number
}

// Operation Data Types
export interface CreatePatientData extends Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdatePatientData extends Partial<CreatePatientData> {
  id: string
}
export interface CreateAppointmentData
  extends Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
{}
export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  id: string
}
export interface RescheduleAppointmentData {
  id: string
  newScheduledAt: string
  reason?: string
}
export interface CancelAppointmentData {
  id: string
  reason: string
  cancelledBy: string
}

// Additional Types
export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface MedicalHistory {
  allergies: string[]
  medications: string[]
  conditions: string[]
  procedures: string[]
}

export interface Schedule {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

export interface MedicalRecord {
  id: string
  patientId: string
  professionalId: string
  date: string
  type: string
  content: string
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export interface AvailabilityParams {
  professionalId: string
  startDate: string
  endDate: string
  duration: number
}

export interface AuditFilters {
  userId?: string
  operation?: string
  startDate?: string
  endDate?: string
  dataType?: string
}

export interface AuditEntry {
  id: string
  userId: string
  operation: string
  dataType: string
  timestamp: string
  details: Record<string, unknown>
}
