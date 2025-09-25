/**
 * Core Base Types and Interfaces
 * Foundation types used across the NeonPro ecosystem
 */

// Primitive type aliases for consistency
export type UUID = string
export type Timestamp = string
export type DateString = string
export type Email = string
export type PhoneNumber = string
export type URL = string
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export type JSONObject = { [key: string]: JSONValue }
export type JSONArray = JSONValue[]

// Base entity interface
export interface BaseEntity {
  id: UUID
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy?: UUID
  updatedBy?: UUID
  isActive?: boolean
  deletedAt?: Timestamp | null
}

// Auditable interface for tracking changes
export interface Auditable {
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy?: UUID
  updatedBy?: UUID
}

// Soft deletable interface
export interface SoftDeletable {
  deletedAt?: Timestamp | null
  isDeleted?: boolean
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Query parameters interface
export interface QueryParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, unknown>
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: Timestamp
    requestId: UUID
    version: string
  }
}

// Result pattern for operations
export interface Result<T, E = Error> {
  success: boolean
  data?: T
  error?: E
  message?: string
}

// Event interface for domain events
export interface DomainEvent {
  id: UUID
  type: string
  payload: unknown
  timestamp: Timestamp
  aggregateId: UUID
  version: number
  metadata?: Record<string, unknown>
}

// Command interface for CQRS
export interface Command {
  id: UUID
  type: string
  payload: unknown
  timestamp: Timestamp
  metadata?: Record<string, unknown>
}

// Query interface for CQRS
export interface Query {
  id: UUID
  type: string
  payload: unknown
  timestamp: Timestamp
  metadata?: Record<string, unknown>
}

// Configuration interface
export interface Config {
  environment: 'development' | 'staging' | 'production'
  version: string
  debug: boolean
  features: Record<string, boolean>
}

// Health check interface
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: Timestamp
  services: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy'
    message?: string
    latency?: number
  }>
}

// Cache interface
export interface Cache<T = unknown> {
  get(key: string): Promise<T | undefined>
  set(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
  exists(key: string): Promise<boolean>
}

// Logger interface
export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void
  info(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  error(message: string, error?: Error, meta?: Record<string, unknown>): void
}

// Metrics interface
export interface Metrics {
  increment(name: string, value?: number, tags?: Record<string, string>): void
  gauge(name: string, value: number, tags?: Record<string, string>): void
  timing(name: string, value: number, tags?: Record<string, string>): void
}

// Webhook interface
export interface Webhook {
  id: UUID
  url: URL
  events: string[]
  secret?: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Notification interface
export interface Notification {
  id: UUID
  type: 'email' | 'sms' | 'push' | 'webhook'
  recipient: string
  subject?: string
  content: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sentAt?: Timestamp
  metadata?: Record<string, unknown>
  createdAt: Timestamp
}

