/**
 * AI Agent Database Integration Types
 * 
 * TypeScript definitions for AI agent system with healthcare compliance
 * Compatible with Brazilian LGPD, ANVISA, and CFM regulations
 */

import { z } from 'zod';

// =====================================
// AGENT TYPES & SCHEMAS
// =====================================

export const AgentTypeSchema = z.enum(['client', 'financial', 'appointment']);
export type AgentType = z.infer<typeof AgentTypeSchema>;

export const AgentStatusSchema = z.enum(['active', 'archived', 'pending']);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

export const AgentRoleSchema = z.enum(['user', 'assistant', 'system']);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

export const MessageRoleSchema = z.enum(['user', 'assistant']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

// =====================================
// PROVIDER CONFIGURATION
// =====================================

export interface AgentProvider {
  id: string;
  name: string;
  endpoint: string;
  apiKey?: string;
  capabilities: string[];
  healthcareOptimized: boolean;
  status: 'available' | 'limited' | 'unavailable';
  maxTokens: number;
  temperature: number;
}

export const AgentProviderSchema: z.ZodType<AgentProvider> = z.object({
  id: z.string(),
  name: z.string(),
  endpoint: z.string().url(),
  apiKey: z.string().optional(),
  capabilities: z.array(z.string()),
  healthcareOptimized: z.boolean(),
  status: z.enum(['available', 'limited', 'unavailable']),
  maxTokens: z.number().positive(),
  temperature: z.number().min(0).max(2),
});

// =====================================
// SESSION MANAGEMENT
// =====================================

export interface AgentSession {
  id: string;
  userId: string;
  agentType: AgentType;
  status: AgentStatus;
  metadata: AgentSessionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSessionMetadata {
  initial_context?: string;
  patientId?: string;
  healthcareProfessionalId?: string;
  clinicId?: string;
  created_via: 'api' | 'web' | 'mobile';
  archived_at?: string;
  archived_by?: string;
  archive_reason?: string;
  compliance_version?: string;
}

export const AgentSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  agentType: AgentTypeSchema,
  status: AgentStatusSchema,
  metadata: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// =====================================
// MESSAGE TYPES
// =====================================

export interface AgentMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  metadata?: AgentMessageMetadata;
  attachments?: AgentAttachment[];
  createdAt: Date;
}

export interface AgentMessageMetadata {
  provider?: string;
  model?: string;
  processing_time?: number;
  tokens_used?: number;
  rag_results_count?: number;
  confidence_score?: number;
  healthcare_context?: boolean;
  patient_context?: boolean;
  compliance_flags?: string[];
}

export interface AgentAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  url?: string;
  metadata?: Record<string, unknown>;
}

export const AgentMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string().max(10000), // 10KB limit per message
  metadata: z.record(z.unknown()).optional(),
  attachments: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string(),
    content_type: z.string(),
    size: z.number().positive(),
    url: z.string().url().optional(),
    metadata: z.record(z.unknown()).optional(),
  })).optional(),
  createdAt: z.date(),
});

// =====================================
// KNOWLEDGE BASE
// =====================================

export interface KnowledgeEntry {
  id: string;
  agentType: AgentType;
  title: string;
  content: string;
  source: string;
  tags: string[];
  metadata: KnowledgeEntryMetadata;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeEntryMetadata {
  createdBy?: string;
  createdAt?: string;
  lastModifiedBy?: string;
  confidence?: number;
  category?: string;
  language?: string;
  compliance_level?: 'basic' | 'enhanced' | 'strict';
  review_status?: 'pending' | 'approved' | 'rejected';
}

export const KnowledgeEntrySchema = z.object({
  id: z.string().uuid(),
  agentType: AgentTypeSchema,
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000), // 50KB limit
  source: z.string().min(1),
  tags: z.array(z.string()).max(20),
  metadata: z.record(z.unknown()),
  embedding: z.array(z.number()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// =====================================
// RAG (RETRIEVAL-AUGMENTED GENERATION)
// =====================================

export interface RAGResult {
  id: string;
  content: string;
  source: string;
  score: number;
  metadata: RAGResultMetadata;
}

export interface RAGResultMetadata {
  type: 'protocol' | 'regulation' | 'policy' | 'guideline' | 'best_practice';
  category: 'safety' | 'compliance' | 'operational' | 'clinical' | 'administrative';
  relevance_score?: number;
  confidence_level?: number;
  last_updated?: string;
  version?: string;
}

export const RAGResultSchema = z.object({
  id: z.string(),
  content: z.string(),
  source: z.string(),
  score: z.number().min(0).max(1),
  metadata: z.record(z.unknown()),
});

// =====================================
// ANALYTICS & MONITORING
// =====================================

export interface AgentAnalytics {
  total_sessions: number;
  total_messages: number;
  average_response_time: number;
  user_satisfaction?: number;
  top_queries: QueryAnalytics[];
  agent_usage: AgentUsageStats[];
  performance_metrics: PerformanceMetrics;
}

export interface QueryAnalytics {
  query: string;
  count: number;
  average_response_time: number;
  success_rate: number;
}

export interface AgentUsageStats {
  agent_type: AgentType;
  session_count: number;
  message_count: number;
  average_session_duration: number;
  user_satisfaction: number;
}

export interface PerformanceMetrics {
  p50_response_time: number;
  p95_response_time: number;
  p99_response_time: number;
  error_rate: number;
  uptime_percentage: number;
  token_usage: TokenUsageStats;
}

export interface TokenUsageStats {
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  average_tokens_per_request: number;
  cost_estimate?: number;
}

export const AgentAnalyticsSchema = z.object({
  total_sessions: z.number().int().min(0),
  total_messages: z.number().int().min(0),
  average_response_time: z.number().min(0),
  user_satisfaction: z.number().min(0).max(5).optional(),
  top_queries: z.array(z.object({
    query: z.string(),
    count: z.number().int().min(0),
    average_response_time: z.number().min(0),
    success_rate: z.number().min(0).max(1),
  })),
  agent_usage: z.array(z.object({
    agent_type: AgentTypeSchema,
    session_count: z.number().int().min(0),
    message_count: z.number().int().min(0),
    average_session_duration: z.number().min(0),
    user_satisfaction: z.number().min(0).max(5),
  })),
  performance_metrics: z.object({
    p50_response_time: z.number().min(0),
    p95_response_time: z.number().min(0),
    p99_response_time: z.number().min(0),
    error_rate: z.number().min(0).max(1),
    uptime_percentage: z.number().min(0).max(1),
    token_usage: z.object({
      total_tokens: z.number().int().min(0),
      input_tokens: z.number().int().min(0),
      output_tokens: z.number().int().min(0),
      average_tokens_per_request: z.number().min(0),
      cost_estimate: z.number().optional(),
    }),
  }),
});

// =====================================
// COMPLIANCE & SECURITY
// =====================================

export interface AIComplianceConfig {
  lgpd_enabled: boolean;
  data_retention_days: number;
  encryption_enabled: boolean;
  audit_logging_enabled: boolean;
  consent_required: boolean;
  anonymization_level: 'none' | 'basic' | 'strict' | 'full';
  data_localization: 'brazil' | 'global';
  healthcare_compliance: {
    anvisa_certified: boolean;
    cfm_compliant: boolean;
    hipaa_compliant?: boolean;
  };
}

export interface ComplianceReport {
  timestamp: string;
  compliance_score: number;
  issues_found: ComplianceIssue[];
  recommendations: string[];
  next_audit_date: string;
}

export interface ComplianceIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'data_privacy' | 'security' | 'access_control' | 'audit_trail';
  description: string;
  impact: string;
  remediation_steps: string[];
  affected_resources: string[];
}

export const AIComplianceConfigSchema = z.object({
  lgpd_enabled: z.boolean(),
  data_retention_days: z.number().int().min(1).max(365),
  encryption_enabled: z.boolean(),
  audit_logging_enabled: z.boolean(),
  consent_required: z.boolean(),
  anonymization_level: z.enum(['none', 'basic', 'strict', 'full']),
  data_localization: z.enum(['brazil', 'global']),
  healthcare_compliance: z.object({
    anvisa_certified: z.boolean(),
    cfm_compliant: z.boolean(),
    hipaa_compliant: z.boolean().optional(),
  }),
});

// =====================================
// API CONTRACTS
// =====================================

// Request Schemas
export const CreateAgentSessionRequestSchema = z.object({
  agent_type: AgentTypeSchema,
  initial_context: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateAgentMessageRequestSchema = z.object({
  session_id: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string().min(1).max(10000),
  metadata: z.record(z.unknown()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content_type: z.string(),
    size: z.number().positive(),
    url: z.string().url().optional(),
  })).optional(),
});

export const SearchKnowledgeBaseRequestSchema = z.object({
  agent_type: AgentTypeSchema,
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(100).default(10),
  filters: z.record(z.unknown()).optional(),
});

export const RAGQueryRequestSchema = z.object({
  session_id: z.string().uuid(),
  query: z.string().min(1).max(1000),
  max_results: z.number().int().min(1).max(50).default(10),
  context_filter: z.record(z.unknown()).optional(),
});

// Response Schemas
export const AgentSessionResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  agent_type: AgentTypeSchema,
  status: AgentStatusSchema,
  metadata: z.record(z.unknown()),
  created_at: z.date(),
  updated_at: z.date(),
});

export const AgentMessageResponseSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  attachments: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string(),
    content_type: z.string(),
    size: z.number().positive(),
    url: z.string().url().optional(),
  })).optional(),
  created_at: z.date(),
});

export const KnowledgeEntryResponseSchema = z.object({
  id: z.string().uuid(),
  agent_type: AgentTypeSchema,
  title: z.string(),
  content: z.string(),
  source: z.string(),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()),
  embedding: z.array(z.number()),
  created_at: z.date(),
  updated_at: z.date(),
});

export const RAGResponseSchema = z.object({
  query: z.string(),
  results: z.array(RAGResultSchema),
  context: z.string(),
  response: z.string(),
  tokens_used: z.number().int().min(0),
  processing_time: z.number().min(0),
});

// =====================================
// UTILITY TYPES & HELPERS
// =====================================

export type AgentSessionRequest = z.infer<typeof CreateAgentSessionRequestSchema>;
export type AgentMessageRequest = z.infer<typeof CreateAgentMessageRequestSchema>;
export type KnowledgeSearchRequest = z.infer<typeof SearchKnowledgeBaseRequestSchema>;
export type RAGQueryRequest = z.infer<typeof RAGQueryRequestSchema>;

export type AgentSessionResponse = z.infer<typeof AgentSessionResponseSchema>;
export type AgentMessageResponse = z.infer<typeof AgentMessageResponseSchema>;
export type KnowledgeEntryResponse = z.infer<typeof KnowledgeEntryResponseSchema>;
export type RAGResponse = z.infer<typeof RAGResponseSchema>;

// =====================================
// HEALTHCARE CONTEXT TYPES
// =====================================

export interface HealthcareContext {
  patient?: PatientContext;
  professional?: ProfessionalContext;
  clinic?: ClinicContext;
  appointment?: AppointmentContext;
}

export interface PatientContext {
  id: string;
  ageGroup?: string; // Generalized for privacy
  bloodType?: string;
  allergies?: string[]; // Non-identifying
  chronicConditions?: string[]; // Non-identifying
  appointmentHistory?: {
    totalAppointments: number;
    noShowCount: number;
    lastVisit?: string;
  };
}

export interface ProfessionalContext {
  id: string;
  specialty: string;
  department?: string;
  permissions: string[];
}

export interface ClinicContext {
  id: string;
  name: string;
  timezone: string;
  operatingHours: {
    [key: string]: { open: string; close: string };
  };
}

export interface AppointmentContext {
  id?: string;
  type: string;
  status: string;
  scheduledDateTime?: Date;
  duration?: number;
  location?: string;
}

// =====================================
// ERROR TYPES
// =====================================

export enum AIErrorType {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
  DATA_SANITIZATION_ERROR = 'DATA_SANITIZATION_ERROR',
}

export interface AIError {
  type: AIErrorType;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

export const AIErrorSchema = z.object({
  type: z.nativeEnum(AIErrorType),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid().optional(),
});

// =====================================
// CONFIGURATION DEFAULTS
// =====================================

export const DEFAULT_AI_CONFIG = {
  providers: {
    openai: {
      id: 'openai',
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      capabilities: ['chat', 'analysis', 'prediction'],
      healthcareOptimized: true,
      status: 'available' as const,
      maxTokens: 4000,
      temperature: 0.3,
    },
    anthropic: {
      id: 'anthropic',
      name: 'Anthropic',
      endpoint: 'https://api.anthropic.com/v1/messages',
      capabilities: ['chat', 'analysis'],
      healthcareOptimized: true,
      status: 'available' as const,
      maxTokens: 4000,
      temperature: 0.3,
    },
    local: {
      id: 'local',
      name: 'Local Model',
      endpoint: 'http://localhost:8000/v1/chat',
      capabilities: ['chat'],
      healthcareOptimized: false,
      status: 'available' as const,
      maxTokens: 2000,
      temperature: 0.2,
    },
  },
  healthcare: {
    contextEnabled: true,
    lgpdCompliance: true,
    auditEnabled: true,
    anonymizationLevel: 'strict' as const,
    dataRetentionDays: 30,
  },
  performance: {
    maxResponseTime: 5000, // 5 seconds
    timeoutThreshold: 30000, // 30 seconds
    retryAttempts: 3,
  },
} as const;

// =====================================
// EXPORT ALL TYPES
// =====================================



