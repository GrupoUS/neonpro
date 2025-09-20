/**
 * AI Agents API Contracts
 *
 * OpenAPI 3.0 specifications for AI Agent Database Integration
 * Following healthcare compliance standards (LGPD/ANVISA/CFM)
 */

import { HealthcareTRPCError } from '@neonpro/types/api/contracts';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

/**
 * Core Agent Types
 */
export const AgentTypeSchema = z.enum(['client', 'financial', 'appointment']);
export type AgentType = z.infer<typeof AgentTypeSchema>;

export const AgentStatusSchema = z.enum(['active', 'inactive', 'archived']);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

/**
 * Agent Session Schemas
 */
export const CreateAgentSessionSchema = z.object({
  agent_type: AgentTypeSchema,
  initial_context: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const AgentSessionResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  agent_type: AgentTypeSchema,
  status: AgentStatusSchema,
  metadata: z.record(z.unknown()),
  created_at: z.date(),
  updated_at: z.date(),
});

/**
 * Agent Message Schemas
 */
export const AgentMessageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type AgentMessageRole = z.infer<typeof AgentMessageRoleSchema>;

export const CreateAgentMessageSchema = z.object({
  session_id: z.string().uuid(),
  role: AgentMessageRoleSchema,
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        type: z.string(),
        size: z.number(),
        url: z.string().url().optional(),
      }),
    )
    .optional(),
});

export const AgentMessageResponseSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  role: AgentMessageRoleSchema,
  content: z.string(),
  metadata: z.record(z.unknown()),
  attachments: z.array(
    z.object({
      filename: z.string(),
      type: z.string(),
      size: z.number(),
      url: z.string().url().optional(),
    }),
  ),
  created_at: z.date(),
});

/**
 * Agent Knowledge Base Schemas
 */
export const CreateKnowledgeEntrySchema = z.object({
  agent_type: AgentTypeSchema,
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  source: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const KnowledgeEntryResponseSchema = z.object({
  id: z.string().uuid(),
  agent_type: AgentTypeSchema,
  title: z.string(),
  content: z.string(),
  source: z.string().url().nullable(),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()),
  embedding: z.array(z.number()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

/**
 * Agent Analytics Schemas
 */
export const AgentAnalyticsSchema = z.object({
  session_id: z.string().uuid(),
  user_id: z.string().uuid(),
  agent_type: AgentTypeSchema,
  metrics: z.object({
    total_messages: z.number().int().min(0),
    average_response_time: z.number().min(0),
    user_satisfaction: z.number().min(0).max(5).optional(),
    resolution_rate: z.number().min(0).max(1).optional(),
    tokens_used: z.number().int().min(0),
  }),
  created_at: z.date(),
});

/**
 * Query and Filter Schemas
 */
export const ListAgentSessionsSchema = z.object({
  agent_type: AgentTypeSchema.optional(),
  status: AgentStatusSchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export const ListAgentMessagesSchema = z.object({
  session_id: z.string().uuid(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  role: AgentMessageRoleSchema.optional(),
});

export const SearchKnowledgeBaseSchema = z.object({
  agent_type: AgentTypeSchema,
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).default(10),
  threshold: z.number().min(0).max(1).default(0.7),
});

/**
 * RAG (Retrieval-Augmented Generation) Schemas
 */
export const RAGQuerySchema = z.object({
  session_id: z.string().uuid(),
  query: z.string().min(1),
  context_filter: z
    .object({
      date_range: z
        .object({
          start: z.date().optional(),
          end: z.date().optional(),
        })
        .optional(),
      data_types: z.array(z.string()).optional(),
      agent_types: z.array(AgentTypeSchema).optional(),
    })
    .optional(),
  max_results: z.number().int().min(1).max(50).default(10),
});

export const RAGResponseSchema = z.object({
  query: z.string(),
  results: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      source: z.string().optional(),
      score: z.number().min(0).max(1),
      metadata: z.record(z.unknown()),
    }),
  ),
  context: z.string(),
  response: z.string(),
  tokens_used: z.number().int().min(0),
  processing_time: z.number().min(0),
});

/**
 * Agent Action Schemas (for AG-UI Protocol)
 */
export const AgentActionSchema = z.object({
  type: z.enum(['message', 'action', 'navigation', 'data_request']),
  payload: z.record(z.unknown()),
  timestamp: z.date(),
});

export const AgentEventSchema = z.object({
  event: z.string(),
  data: z.record(z.unknown()),
  session_id: z.string().uuid(),
  timestamp: z.date(),
});

/**
 * Response Wrappers
 */
export const AgentSessionListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    sessions: z.array(AgentSessionResponseSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      total_pages: z.number().int(),
    }),
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

export const AgentMessageListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    messages: z.array(AgentMessageResponseSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      total_pages: z.number().int(),
    }),
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

export const KnowledgeBaseListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    entries: z.array(KnowledgeEntryResponseSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      total_pages: z.number().int(),
    }),
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

/**
 * Error Response Schema
 */
export const AgentErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().optional(),
});

/**
 * Export all types
 */
export type CreateAgentSessionRequest = z.infer<
  typeof CreateAgentSessionSchema
>;
export type CreateAgentMessageRequest = z.infer<
  typeof CreateAgentMessageSchema
>;
export type CreateKnowledgeEntryRequest = z.infer<
  typeof CreateKnowledgeEntrySchema
>;
export type ListAgentSessionsRequest = z.infer<typeof ListAgentSessionsSchema>;
export type ListAgentMessagesRequest = z.infer<typeof ListAgentMessagesSchema>;
export type SearchKnowledgeBaseRequest = z.infer<
  typeof SearchKnowledgeBaseSchema
>;
export type RAGQueryRequest = z.infer<typeof RAGQuerySchema>;
export type AgentAction = z.infer<typeof AgentActionSchema>;
export type AgentEvent = z.infer<typeof AgentEventSchema>;
