/**
 * 🔗 API Types - NeonPro Healthcare
 * =================================
 *
 * Tipos base para comunicação entre frontend e backend
 * com type-safety completo via Hono RPC.
 */

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Status codes
export type ApiStatusCode =
  | 200
  | 201
  | 202
  | 204 // Success
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422 // Client Error
  | 500
  | 502
  | 503
  | 504; // Server Error

// Base API Response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>; // Validation errors
  meta?: ApiMeta;
}

// API Meta information (pagination, etc.)
export interface ApiMeta {
  pagination?: PaginationMeta;
  total?: number;
  count?: number;
  timestamp?: string;
  requestId?: string;
}

// Pagination meta
export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Base pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Base search params
export interface SearchParams extends PaginationParams {
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Error structure
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path?: string;
  method?: HttpMethod;
}

// Validation error structure
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

// Base entity ID type
export type EntityId = string; // UUID

// Date range type
export interface DateRange {
  startDate: string; // ISO date
  endDate: string; // ISO date
}

// Time range type
export interface TimeRange {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

// Geolocation type
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// File upload type
export interface FileUpload {
  filename: string;
  mimetype: string;
  size: number;
  url?: string;
  key?: string; // Storage key
}

// Bulk operation result
export interface BulkOperationResult<T = EntityId> {
  success: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

// API endpoint paths (type-safe route definitions)
export interface ApiRoutes {
  // Authentication
  auth: {
    login: '/auth/login';
    register: '/auth/register';
    logout: '/auth/logout';
    refresh: '/auth/refresh';
    profile: '/auth/profile';
    'forgot-password': '/auth/forgot-password';
    'reset-password': '/auth/reset-password';
    'change-password': '/auth/change-password';
    mfa: {
      enable: '/auth/mfa/enable';
      verify: '/auth/mfa/verify';
      disable: '/auth/mfa/disable';
    };
  };

  // Patients
  patients: {
    base: '/patients';
    byId: '/patients/:id';
    search: '/patients/search';
    export: '/patients/export';
    import: '/patients/import';
  };

  // Appointments
  appointments: {
    base: '/appointments';
    byId: '/appointments/:id';
    search: '/appointments/search';
    availability: '/appointments/availability';
    reschedule: '/appointments/:id/reschedule';
    cancel: '/appointments/:id/cancel';
  };

  // Clinics
  clinics: {
    base: '/clinics';
    byId: '/clinics/:id';
    search: '/clinics/search';
    staff: '/clinics/:id/staff';
    services: '/clinics/:id/services';
    availability: '/clinics/:id/availability';
  };

  // Health check
  health: '/health';
}

// Request context type (middleware data)
export interface RequestContext {
  user?: {
    id: EntityId;
    email: string;
    role: string;
    clinicId?: EntityId;
  };
  device?: {
    id: string;
    type: string;
    userAgent: string;
    ipAddress: string;
  };
  permissions?: string[];
  requestId: string;
  timestamp: string;
}

// Audit trail type
export interface AuditTrail {
  action: string;
  entityType: string;
  entityId: EntityId;
  userId: EntityId;
  changes?: Record<
    string,
    {
      before: unknown;
      after: unknown;
    }
  >;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ipAddress: string;
}

// Rate limiting info
export interface RateLimit {
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter?: number;
}

// API Headers type
export interface ApiHeaders {
  'Content-Type'?: string;
  Authorization?: string;
  'X-Request-ID'?: string;
  'X-Rate-Limit'?: string;
  'X-User-Agent'?: string;
  'X-Forwarded-For'?: string;
  'Accept-Language'?: string;
}

// WebSocket message types
export type WebSocketMessageType =
  | 'appointment_created'
  | 'appointment_updated'
  | 'appointment_cancelled'
  | 'patient_registered'
  | 'notification'
  | 'system_alert'
  | 'heartbeat';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  data: T;
  timestamp: string;
  userId?: EntityId;
  clinicId?: EntityId;
}

// Export utility types
export type ApiEndpoint<T = unknown> = (params?: T) => Promise<ApiResponse>;
export type ApiMutation<TParams = unknown, TResponse = unknown> = (
  params: TParams
) => Promise<ApiResponse<TResponse>>;
export type ApiQuery<TParams = unknown, TResponse = unknown> = (
  params?: TParams
) => Promise<ApiResponse<TResponse>>;

// Type guards
export const isApiError = (obj: unknown): obj is ApiError => {
  return (
    typeof obj === 'object' && obj !== null && 'code' in obj && 'message' in obj
  );
};

export const isApiResponse = <T>(obj: unknown): obj is ApiResponse<T> => {
  return typeof obj === 'object' && obj !== null && 'success' in obj;
};

export const isValidationError = (obj: unknown): obj is ValidationError => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'field' in obj &&
    'message' in obj
  );
};
