// Agent Session Schema
export const AgentSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  agent_type: z.enum(['client', 'financial', 'appointment']),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.date(),
  updated_at: z.date(),
});

export type AgentSession = z.infer<typeof AgentSessionSchema>;

// Agent Message Schema
export const AgentMessageSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  _role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.date(),
});

export type AgentMessage = z.infer<typeof AgentMessageSchema>;

// Agent Knowledge Base Schema
export const AgentKnowledgeBaseSchema = z.object({
  id: z.string().uuid(),
  agent_type: z.enum(['client', 'financial', 'appointment']),
  content: z.string().min(1),
  source: z.string().nullable(),
  embedding: z.array(z.number()).length(1536).nullable(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.date(),
  updated_at: z.date(),
});

export type AgentKnowledgeBase = z.infer<typeof AgentKnowledgeBaseSchema>;

// Agent Analytics Schema
export const AgentAnalyticsSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid().nullable(),
  user_id: z.string().uuid(),
  agent_type: z.enum(['client', 'financial', 'appointment']),
  metric_type: z.enum(['query', 'response_time', 'satisfaction', 'error']),
  metric_value: z.number(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.date(),
});

export type AgentAnalytics = z.infer<typeof AgentAnalyticsSchema>;

// API Schemas

// Chat Request
export const ChatRequestSchema = z.object({
  agentType: z.enum(['client', 'financial', 'appointment']),
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Chat Response
export const ChatResponseSchema = z.object({
  response: z.string().min(1),
  sessionId: z.string().uuid(),
  sources: z
    .array(
      z.object({
        type: z.string(),
        content: z.string(),
        confidence: z.number().min(0).max(1).optional(),
      }),
    )
    .default([]),
  metadata: z.record(z.unknown()).default({}),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// Session Response
export const SessionResponseSchema = z.object({
  session: AgentSessionSchema.extend({
    messages: z.array(AgentMessageSchema),
  }),
});

export type SessionResponse = z.infer<typeof SessionResponseSchema>;

// Knowledge Entry Response
export const KnowledgeEntryResponseSchema = AgentKnowledgeBaseSchema.omit({
  embedding: true,
});

export type KnowledgeEntryResponse = z.infer<
  typeof KnowledgeEntryResponseSchema
>;

// Agent Types
export type AgentType = 'client' | 'financial' | 'appointment';

// Agent Configuration
export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  allowedOperations: string[];
}

// Agent Context
export interface AgentContext {
  user: {
    id: string;
    email: string;
    _role: string;
  };
  session: AgentSession | null;
  permissions: string[];
}

// Search Parameters
export const KnowledgeSearchParamsSchema = z.object({
  agentType: z.enum(['client', 'financial', 'appointment']),
  _query: z.string().min(1),
  limit: z.number().min(1).max(100).default(5),
  threshold: z.number().min(0).max(1).default(0.7),
});

export type KnowledgeSearchParams = z.infer<typeof KnowledgeSearchParamsSchema>;

// Error Types
export enum AgentErrorType {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_AGENT_TYPE = 'INVALID_AGENT_TYPE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
}

export const AgentErrorSchema = z.object({
  type: z.nativeEnum(AgentErrorType),
  message: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type AgentError = z.infer<typeof AgentErrorSchema>;
