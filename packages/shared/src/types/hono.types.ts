/**
 * ⚡ Hono RPC Types - NeonPro Healthcare
 * ====================================
 *
 * Tipos específicos para integração com Hono.dev RPC
 * garantindo type-safety end-to-end.
 */

import type { Context } from "hono";
import type { ApiResponse, RequestContext } from "./api.types";

// Auth context interface for middleware
export interface AuthContext {
  user: RequestContext["user"];
  token: string;
}

// Hono Context extension with NeonPro specific data - just a type alias
export type NeonProContext = Context;

// Hono Route Handler type with our context
export type NeonProHandler<T = unknown> = (
  c: NeonProContext,
) => Promise<Response> | Response | Promise<T> | T;

// Validated route handler with Zod
export type ValidatedHandler<TInput = unknown, TOutput = unknown> = (
  c: NeonProContext & { req: { valid: (target: string) => TInput } },
) => Promise<ApiResponse<TOutput>> | ApiResponse<TOutput>;

// Route configuration for type inference
export interface RouteConfig<TInput = unknown, TOutput = unknown> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  handler: ValidatedHandler<TInput, TOutput>;
  middleware?: ((
    c: NeonProContext,
    next: () => Promise<void>,
  ) => Promise<void>)[];
  validation?: {
    body?: unknown; // Zod schema
    query?: unknown; // Zod schema
    params?: unknown; // Zod schema
    headers?: unknown; // Zod schema
  };
  auth?: {
    required: boolean;
    roles?: string[];
    permissions?: string[];
  };
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  lgpd?: {
    requiresConsent?: string[];
    dataCategories?: string[];
  };
}

// Hono App Type inference helpers
export type ExtractRouteInput<T> =
  T extends RouteConfig<infer I, any> ? I : never;
export type ExtractRouteOutput<T> =
  T extends RouteConfig<any, infer O> ? O : never;

// RPC Client types for frontend
export interface RpcClient {
  // Auth endpoints
  auth: {
    login: {
      $post: (data: { json: LoginRequest }) => Promise<Response>;
    };
    register: {
      $post: (data: { json: RegisterRequest }) => Promise<Response>;
    };
    logout: {
      $post: () => Promise<Response>;
    };
    refresh: {
      $post: (data: { json: RefreshTokenRequest }) => Promise<Response>;
    };
    profile: {
      $get: () => Promise<Response>;
      $put: (data: { json: UpdateProfileRequest }) => Promise<Response>;
    };
  };

  // Patient endpoints
  patients: {
    $get: (params?: { query?: PatientsQuery }) => Promise<Response>;
    $post: (data: { json: CreatePatientRequest }) => Promise<Response>;
  } & {
    [key: `${string}`]: {
      $get: () => Promise<Response>;
      $put: (data: { json: UpdatePatientRequest }) => Promise<Response>;
      $delete: () => Promise<Response>;
    };
  };

  // Appointment endpoints
  appointments: {
    $get: (params?: { query?: AppointmentsQuery }) => Promise<Response>;
    $post: (data: { json: CreateAppointmentRequest }) => Promise<Response>;
    availability: {
      $get: (params?: { query?: AvailabilityQuery }) => Promise<Response>;
    };
  } & {
    [key: `${string}`]: {
      $get: () => Promise<Response>;
      $put: (data: { json: UpdateAppointmentRequest }) => Promise<Response>;
      $delete: () => Promise<Response>;
    };
  };

  // Professional endpoints
  professionals: {
    $get: (params?: { query?: ProfessionalsQuery }) => Promise<Response>;
    $post: (data: { json: CreateProfessionalRequest }) => Promise<Response>;
  } & {
    [key: `${string}`]: {
      $get: () => Promise<Response>;
      $put: (data: { json: UpdateProfessionalRequest }) => Promise<Response>;
      $delete: () => Promise<Response>;
      stats: {
        $get: () => Promise<Response>;
      };
      availability: {
        $get: (params?: { query?: { date: string } }) => Promise<Response>;
      };
    };
  };

  // Service endpoints
  services: {
    $get: (params?: { query?: ServicesQuery }) => Promise<Response>;
    $post: (data: { json: CreateServiceRequest }) => Promise<Response>;
    category: {
      [key: `${string}`]: {
        $get: () => Promise<Response>;
      };
    };
  } & {
    [key: `${string}`]: {
      $get: () => Promise<Response>;
      $put: (data: { json: UpdateServiceRequest }) => Promise<Response>;
      $delete: () => Promise<Response>;
      compliance: {
        $get: () => Promise<Response>;
      };
    };
  };

  // Analytics endpoints
  analytics: {
    dashboard: {
      $get: (params?: { query?: AnalyticsQuery }) => Promise<Response>;
    };
    revenue: {
      $get: (params?: { query?: RevenueQuery }) => Promise<Response>;
    };
    appointments: {
      $get: (params?: { query?: AnalyticsQuery }) => Promise<Response>;
    };
    patients: {
      $get: () => Promise<Response>;
    };
    performance: {
      $get: () => Promise<Response>;
    };
    reports: {
      $post: (data: { json: CustomReportRequest }) => Promise<Response>;
    };
  };

  // Compliance endpoints
  compliance: {
    lgpd: {
      overview: {
        $get: () => Promise<Response>;
      };
      requests: {
        $get: () => Promise<Response>;
        $post: (data: { json: LGPDRequestData }) => Promise<Response>;
      };
      consent: {
        $put: (data: { json: ConsentUpdateData }) => Promise<Response>;
      };
    };
    anvisa: {
      overview: {
        $get: () => Promise<Response>;
      };
      reports: {
        $post: (data: { json: AnvisaReportData }) => Promise<Response>;
      };
    };
    audit: {
      logs: {
        $get: (params?: { query?: AuditLogsQuery }) => Promise<Response>;
      };
    };
    export: {
      dashboard: {
        $get: () => Promise<Response>;
      };
    };
  };
}

// Request/Response type mappings for RPC client
export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
  mfaCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  acceptsTerms: boolean;
  acceptsPrivacyPolicy: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    theme?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
}

export interface PatientsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  professionalId?: string;
}

export interface CreatePatientRequest {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  gender: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  consentGiven: boolean;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}

export interface UpdatePatientRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: Partial<CreatePatientRequest["address"]>;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface AppointmentsQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  professionalId?: string;
  patientId?: string;
  serviceId?: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  professionalId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  notes?: string;
  priority?: string;
}

export interface UpdateAppointmentRequest {
  scheduledDate?: string;
  scheduledTime?: string;
  status?: string;
  notes?: string;
  priority?: string;
}

export interface AvailabilityQuery {
  professionalId?: string;
  serviceId?: string;
  startDate: string;
  endDate: string;
}

export interface ProfessionalsQuery {
  page?: number;
  limit?: number;
  search?: string;
  profession?: string;
  isActive?: boolean;
}

export interface CreateProfessionalRequest {
  fullName: string;
  email: string;
  phone: string;
  profession: string;
  specialization?: string;
  registrationNumber?: string;
  isActive?: boolean;
  workingHours?: Record<string, string[]>;
  permissions?: string[];
}

export interface UpdateProfessionalRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  isActive?: boolean;
  workingHours?: Record<string, string[]>;
}

export interface ServicesQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  profession?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  isActive?: boolean;
  anvisaCategory?: string;
  anvisaRegistration?: string;
  requiresLicense?: boolean;
  requiredProfessions: string[];
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

export interface AnalyticsQuery {
  period?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
}

export interface RevenueQuery extends AnalyticsQuery {
  serviceCategory?: string;
  professionalId?: string;
}

export interface CustomReportRequest {
  reportType: string;
  filters?: {
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    serviceIds?: string[];
    professionalIds?: string[];
    categories?: string[];
  };
  groupBy?: string;
  includeComparison?: boolean;
}

export interface LGPDRequestData {
  type: string;
  patientId: string;
  requesterName: string;
  requesterEmail: string;
  justification: string;
  urgency?: string;
}

export interface ConsentUpdateData {
  patientId: string;
  consentType: string;
  granted: boolean;
  version: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AnvisaReportData {
  reportType: string;
  period: {
    startDate: string;
    endDate: string;
  };
  includeDetails?: boolean;
}

export interface AuditLogsQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
  resourceType?: string;
}

// Type utilities for Hono RPC
export type InferRequestType<T> = T extends {
  $post: (data: { json: infer R }) => any;
}
  ? R
  : T extends { $put: (data: { json: infer R }) => any }
    ? R
    : never;

export type InferResponseType<T> = T extends { $get: () => Promise<infer R> }
  ? R
  : T extends { $post: (data: unknown) => Promise<infer R> }
    ? R
    : never;

// RPC Error types
export interface RpcError {
  success: false;
  error: string;
  message: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

// Type guard for RPC responses
export const isRpcError = (response: unknown): response is RpcError => {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as { success: boolean }).success === false
  );
};

// RPC Client configuration
export interface RpcClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  onRequest?: (init: RequestInit) => Promise<RequestInit> | RequestInit;
  onResponse?: (response: Response) => Promise<Response> | Response;
  onError?: (error: Error) => void;
}
