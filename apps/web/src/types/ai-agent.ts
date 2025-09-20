/**
 * AI Agent Database Integration Types
 * Defines the contract between frontend, backend, and AI agent for healthcare data queries
 */

import { z } from "zod";

// =====================================
// Core Data Types
// =====================================

/**
 * Client information with healthcare-specific fields
 */
export interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ for Brazilian healthcare
  birthDate?: string;
  gender?: string;
  healthPlan?: string;
  healthPlanNumber?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}

/**
 * Appointment data with scheduling information
 */
export interface AppointmentData {
  id: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  scheduledAt: string;
  duration: number; // in minutes
  status:
    | "scheduled"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show";
  type: "consultation" | "exam" | "procedure" | "return" | "emergency";
  notes?: string;
  location?: string;
  telemedicine?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Financial data for appointments and services
 */
export interface FinancialData {
  appointmentId?: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  amount: number;
  currency: "BRL";
  status: "pending" | "paid" | "overdue" | "cancelled" | "refunded";
  paymentMethod?:
    | "cash"
    | "credit_card"
    | "debit_card"
    | "health_plan"
    | "other";
  paymentDate?: string;
  dueDate?: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================
// AI Agent Types
// =====================================

/**
 * User query intent classification
 */
export enum QueryIntent {
  CLIENT_SEARCH = "client_search",
  APPOINTMENT_QUERY = "appointment_query",
  FINANCIAL_QUERY = "financial_query",
  APPOINTMENT_CREATION = "appointment_creation",
  GENERAL_INQUIRY = "general_inquiry",
  UNKNOWN = "unknown",
}

/**
 * Structured user query for AI processing
 */
export interface UserQuery {
  id: string;
  text: string;
  intent: QueryIntent;
  entities: {
    clients?: Array<{
      name: string;
      confidence: number;
    }>;
    dates?: Array<{
      date: string;
      type: "absolute" | "relative";
      confidence: number;
    }>;
    services?: Array<{
      name: string;
      confidence: number;
    }>;
    professionals?: Array<{
      name: string;
      confidence: number;
    }>;
  };
  context?: {
    userId: string;
    userRole: string;
    domain?: string;
    session?: string;
  };
  timestamp: string;
}

/**
 * AI agent response with structured data
 */
export interface AgentResponse {
  id: string;
  queryId: string;
  success: boolean;
  message: string;
  data?: {
    clients?: ClientData[];
    appointments?: AppointmentData[];
    financial?: FinancialData[];
    summary?: {
      total: number;
      count: number;
      currency?: string;
    };
  };
  actions?: AgentAction[];
  suggestions?: string[];
  confidence: number;
  processingTime: number;
  timestamp: string;
}

/**
 * Suggested actions from AI agent
 */
export interface AgentAction {
  id: string;
  type:
    | "create_appointment"
    | "view_details"
    | "export_data"
    | "navigate"
    | "refresh";
  label: string;
  payload?: Record<string, any>;
  icon?: string;
  primary?: boolean;
}

// =====================================
// API Request/Response Types
// =====================================

/**
 * Request payload for AI agent endpoint
 */
export interface DataAgentRequest {
  query: string;
  context?: {
    userId?: string;
    domain?: string;
    limit?: number;
    filters?: Record<string, any>;
  };
}

/**
 * Response payload from AI agent
 */
export interface DataAgentResponse {
  success: boolean;
  response?: AgentResponse;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// =====================================
// Chat UI Types (CopilotKit Integration)
// =====================================

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  data?: any; // Structured data from assistant
  actions?: AgentAction[];
}

/**
 * Chat state and configuration
 */
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
  context?: {
    userId: string;
    userRole: string;
    domain?: string;
  };
}

/**
 * CopilotKit runtime configuration
 */
export interface CopilotRuntimeConfig {
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
}

// =====================================
// Zod Schemas for Validation
// =====================================

// Client schema
export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.string().optional(),
  healthPlan: z.string().optional(),
  healthPlanNumber: z.string().optional(),
  address: z
    .object({
      street: z.string(),
      number: z.string(),
      complement: z.string().optional(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
    })
    .optional(),
  status: z.enum(["active", "inactive", "suspended"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Appointment schema
export const AppointmentSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  professionalId: z.string(),
  professionalName: z.string(),
  serviceId: z.string(),
  serviceName: z.string(),
  scheduledAt: z.string().datetime(),
  duration: z.number().positive(),
  status: z.enum([
    "scheduled",
    "confirmed",
    "in-progress",
    "completed",
    "cancelled",
    "no-show",
  ]),
  type: z.enum(["consultation", "exam", "procedure", "return", "emergency"]),
  notes: z.string().optional(),
  location: z.string().optional(),
  telemedicine: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Financial schema
export const FinancialSchema = z.object({
  appointmentId: z.string().optional(),
  clientId: z.string(),
  clientName: z.string(),
  serviceId: z.string(),
  serviceName: z.string(),
  professionalId: z.string(),
  professionalName: z.string(),
  amount: z.number().nonnegative(),
  currency: z.literal("BRL"),
  status: z.enum(["pending", "paid", "overdue", "cancelled", "refunded"]),
  paymentMethod: z
    .enum(["cash", "credit_card", "debit_card", "health_plan", "other"])
    .optional(),
  paymentDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  invoiceId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Query intent schema
export const QueryIntentSchema = z.nativeEnum(QueryIntent);

// User query schema
export const UserQuerySchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  intent: QueryIntentSchema,
  entities: z.object({
    clients: z
      .array(
        z.object({
          name: z.string(),
          confidence: z.number().min(0).max(1),
        }),
      )
      .optional(),
    dates: z
      .array(
        z.object({
          date: z.string(),
          type: z.enum(["absolute", "relative"]),
          confidence: z.number().min(0).max(1),
        }),
      )
      .optional(),
    services: z
      .array(
        z.object({
          name: z.string(),
          confidence: z.number().min(0).max(1),
        }),
      )
      .optional(),
    professionals: z
      .array(
        z.object({
          name: z.string(),
          confidence: z.number().min(0).max(1),
        }),
      )
      .optional(),
  }),
  context: z
    .object({
      userId: z.string(),
      userRole: z.string(),
      domain: z.string().optional(),
      session: z.string().optional(),
    })
    .optional(),
  timestamp: z.string().datetime(),
});

// Agent response schema
export const AgentResponseSchema = z.object({
  id: z.string(),
  queryId: z.string(),
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      clients: z.array(ClientSchema).optional(),
      appointments: z.array(AppointmentSchema).optional(),
      financial: z.array(FinancialSchema).optional(),
      summary: z
        .object({
          total: z.number(),
          count: z.number(),
          currency: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  actions: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum([
          "create_appointment",
          "view_details",
          "export_data",
          "navigate",
          "refresh",
        ]),
        label: z.string(),
        payload: z.record(z.any()).optional(),
        icon: z.string().optional(),
        primary: z.boolean().optional(),
      }),
    )
    .optional(),
  suggestions: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
  processingTime: z.number().nonnegative(),
  timestamp: z.string().datetime(),
});

// API request schema
export const DataAgentRequestSchema = z.object({
  query: z.string().min(1),
  context: z
    .object({
      userId: z.string().optional(),
      domain: z.string().optional(),
      limit: z.number().positive().optional(),
      filters: z.record(z.any()).optional(),
    })
    .optional(),
});

// API response schema
export const DataAgentResponseSchema = z.object({
  success: z.boolean(),
  response: AgentResponseSchema.optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    })
    .optional(),
});

// =====================================
// Type Helpers and Utilities
// =====================================

export type Client = z.infer<typeof ClientSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type Financial = z.infer<typeof FinancialSchema>;
export type ValidUserQuery = z.infer<typeof UserQuerySchema>;
export type ValidAgentResponse = z.infer<typeof AgentResponseSchema>;
export type ValidDataAgentRequest = z.infer<typeof DataAgentRequestSchema>;
export type ValidDataAgentResponse = z.infer<typeof DataAgentResponseSchema>;

// =====================================
// Error Types
// =====================================

export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = "AgentError";
  }
}

export class ValidationError extends AgentError {
  constructor(
    message: string,
    public field: string,
  ) {
    super(message, "VALIDATION_ERROR", { field });
    this.name = "ValidationError";
  }
}

export class DataAccessError extends AgentError {
  constructor(
    message: string,
    public resource: string,
  ) {
    super(message, "DATA_ACCESS_ERROR", { resource });
    this.name = "DataAccessError";
  }
}

export class IntentParsingError extends AgentError {
  constructor(
    message: string,
    public query: string,
  ) {
    super(message, "INTENT_PARSING_ERROR", { query });
    this.name = "IntentParsingError";
  }
}

// =====================================
// Utility Functions
// =====================================

/**
 * Validate data against schemas
 */
export function validateClient(data: unknown): Client {
  return ClientSchema.parse(data);
}

export function validateAppointment(data: unknown): Appointment {
  return AppointmentSchema.parse(data);
}

export function validateFinancial(data: unknown): Financial {
  return FinancialSchema.parse(data);
}

export function validateUserQuery(data: unknown): ValidUserQuery {
  return UserQuerySchema.parse(data);
}

export function validateAgentResponse(data: unknown): ValidAgentResponse {
  return AgentResponseSchema.parse(data);
}

/**
 * Safe validation with error handling
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

/**
 * Format currency for Brazilian locale
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

/**
 * Format date for Brazilian locale
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
