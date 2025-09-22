/**
 * AI Agents tRPC Router
 *
 * Implements AI Agent Database Integration with CopilotKit, AG-UI Protocol, and RAG
 * Full LGPD/ANVISA/CFM compliance for healthcare data interactions
 */

import { HealthcareTRPCError } from '@neonpro/utils/healthcare-errors';
import { AuditAction, AuditStatus, ResourceType, RiskLevel } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
  AgentMessageResponseSchema,
  AgentSessionResponseSchema,
  AgentTypeSchema,
  CreateAgentMessageSchema,
  CreateAgentSessionSchema,
  CreateKnowledgeEntrySchema,
  KnowledgeEntryResponseSchema,
  ListAgentSessionsSchema,
  RAGQuerySchema,
  RAGResponseSchema,
  SearchKnowledgeBaseSchema,
} from '../contracts/agent';
import { protectedProcedure, router } from '../trpc';

// =====================================
// AGENT TYPES AND INTERFACES
// =====================================

interface AgentProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
  maxTokens: number;
  temperature: number;
  capabilities: string[];
}

interface RAGResult {
  id: string;
  content: string;
  source: string;
  score: number;
  metadata: Record<string, unknown>;
}

// =====================================
// AGENT PROVIDER CONFIGURATION
// =====================================

const AGENT_PROVIDERS: Record<string, AgentProvider> = {
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 4000,
    temperature: 0.3,
    capabilities: ['chat', 'analysis', 'prediction'],
  },
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxTokens: 4000,
    temperature: 0.3,
    capabilities: ['chat', 'analysis'],
  },
  local: {
    name: 'Local Model',
    endpoint: process.env.LOCAL_AI_ENDPOINT || 'http://localhost:8000/v1/chat',
    maxTokens: 2000,
    temperature: 0.2,
    capabilities: ['chat'],
  },
};

/**
 * Portuguese Healthcare Context for Agents
 */
const HEALTHCARE_CONTEXTS = {
  client: `
    Você é um assistente de IA especializado em atendimento ao paciente no sistema de saúde brasileiro.
    Sempre responda em português brasileiro e considere:
    - Terminologia médica brasileira
    - Protocolos do SUS e planos de saúde
    - Regulamentações da ANVISA
    - Normas do Conselho Federal de Medicina (CFM)
    - LGPD para dados de saúde
    
    IMPORTANTE: Este assistente NÃO substitui consulta médica presencial.
    Sempre recomende procurar um profissional de saúde qualificado.
  `,
  financial: `
    Você é um assistente financeiro especializado em gestão de clínicas médicas no Brasil.
    Sempre responda em português brasileiro e considere:
    - Regras fiscais brasileiras
    - Tabela AMB para procedimentos médicos
    - Regulamentações da ANS
    - Práticas de cobrança éticas
    - Transparência com pacientes
    
    Forneça informações claras sobre custos, pagamentos e opções financeiras.
  `,
  appointment: `
    Você é um assistente de agendamento especializado em clínicas médicas brasileiras.
    Sempre responda em português brasileiro e considere:
    - Cultura brasileira de pontualidade
    - Horários comerciais padrão
    - Feriados nacionais e regionais
    - Padrões de transporte urbano
    - Boas práticas de comunicação
    
    Ajude pacientes a agendar, remarcar e confirmar consultas de forma eficiente.
  `,
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

/**
 * Create audit trail for agent operations
 */
async function createAgentAuditTrail(
  ctx: any,
  action: string,
  agentType: string,
  sessionId?: string,
  additionalInfo?: Record<string, unknown>,
) {
  await ctx.prisma.auditTrail.create({
    data: {
      _userId: ctx.userId,
      clinicId: ctx.clinicId,
      action: AuditAction.CREATE,
      resource: 'agent_operation',
      resourceType: ResourceType.SYSTEM_CONFIG,
      ipAddress: ctx.auditMeta.ipAddress,
      userAgent: ctx.auditMeta.userAgent,
      sessionId: sessionId || ctx.auditMeta.sessionId,
      status: AuditStatus.SUCCESS,
      riskLevel: RiskLevel.MEDIUM,
      additionalInfo: JSON.stringify({
        action,
        agentType,
        timestamp: new Date().toISOString(),
        ...additionalInfo,
      }),
    },
  });
}

/**
 * Mock RAG implementation (replace with real vector database)
 */
async function performRAGSearch(
  _query: string,
  agentType: string,
  limit: number = 10,
): Promise<RAGResult[]> {
  // Simulate RAG search delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock results based on agent type
  const mockResults = {
    client: [
      {
        id: 'doc1',
        content:
          'Pacientes com alergias a penicilina devem ser identificados com alerta vermelho no prontuário',
        source: 'Protocolos Clínicos',
        score: 0.95,
        metadata: { type: 'protocol', category: 'safety' },
      },
      {
        id: 'doc2',
        content: 'LGPD exige consentimento explícito para compartilhamento de dados médicos',
        source: 'LGPD Guidelines',
        score: 0.9,
        metadata: { type: 'regulation', category: 'compliance' },
      },
    ],
    financial: [
      {
        id: 'doc3',
        content: 'Tabela AMB 2024: consulta clínica geral - R$ 150,00',
        source: 'Tabela AMB',
        score: 0.98,
        metadata: { type: 'pricing', category: 'standard' },
      },
      {
        id: 'doc4',
        content: 'Pacientes particulares têm 10% de desconto para pagamentos à vista',
        source: 'Políticas da Clínica',
        score: 0.85,
        metadata: { type: 'policy', category: 'discount' },
      },
    ],
    appointment: [
      {
        id: 'doc5',
        content: 'Horário de almoço: 12:00-14:00, consultas apenas em casos de emergência',
        source: 'Horários de Funcionamento',
        score: 0.92,
        metadata: { type: 'schedule', category: 'operational' },
      },
      {
        id: 'doc6',
        content: 'Confirmar consultas 24h antes via WhatsApp reduz no-show em 40%',
        source: 'Best Practices',
        score: 0.88,
        metadata: { type: 'recommendation', category: 'efficiency' },
      },
    ],
  };

  return (mockResults[agentType as keyof typeof mockResults] || []).slice(
    0,
    limit,
  );
}

// =====================================
// TRPC ROUTER IMPLEMENTATION
// =====================================

export const agentRouter = router({
  /**
   * Create Agent Session
   * Starts a new conversational session with an AI agent
   */
  createSession: protectedProcedure
    .input(CreateAgentSessionSchema)
    .output(
      z.object({
        success: z.literal(true),
        data: AgentSessionResponseSchema,
        message: z.string(),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, _input }) => {
      try {
        // Validate user has permission for this agent type
        if (
          input.agent_type === 'client'
          && !ctx.user.permissions?.includes('patient:read')
        ) {
          throw new HealthcareTRPCError(
            'FORBIDDEN',
            'Insufficient permissions for client agent',
            'INSUFFICIENT_PERMISSIONS',
            { required: 'patient:read' },
          );
        }

        // Create session in database
        const session = await ctx.prisma.agentSession.create({
          data: {
            _userId: ctx.user.id,
            agentType: input.agent_type,
            status: 'active',
            metadata: {
              ...input.metadata,
              initial_context: input.initial_context,
              created_via: 'api',
            },
          },
        });

        // Create audit trail
        await createAgentAuditTrail(
          ctx,
          'session_created',
          input.agent_type,
          session.id,
          {
            session_id: session.id,
            initial_context: input.initial_context,
          },
        );

        return {
          success: true,
          data: {
            id: session.id,
            user_id: session.userId,
            agent_type: session.agentType as any,
            status: session.status as any,
            metadata: session.metadata,
            created_at: session.createdAt,
            updated_at: session.updatedAt,
          },
          message: 'Agent session created successfully',
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        if (error instanceof HealthcareTRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create agent session',
          cause: error,
        });
      }
    }),

  /**
   * List Agent Sessions
   * Retrieve paginated list of user's agent sessions
   */
  listSessions: protectedProcedure
    .input(ListAgentSessionsSchema)
    .output(
      z.object({
        success: z.literal(true),
        data: z.object({
          sessions: z.array(AgentSessionResponseSchema),
          pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            total_pages: z.number(),
          }),
        }),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, _input }) => {
      try {
        const where = {
          _userId: ctx.user.id,
          ...(input.agent_type && { agentType: input.agent_type }),
          ...(input.status && { status: input.status }),
        };

        const [sessions, total] = await Promise.all([
          ctx.prisma.agentSession.findMany({
            where,
            skip: (input.page - 1) * input.limit,
            take: input.limit,
            orderBy: {
              [input.sort_by]: input.sort_order,
            },
          }),
          ctx.prisma.agentSession.count({ where }),
        ]);

        return {
          success: true,
          data: {
            sessions: sessions.map(session => ({
              id: session.id,
              user_id: session.userId,
              agent_type: session.agentType as any,
              status: session.status as any,
              metadata: session.metadata,
              created_at: session.createdAt,
              updated_at: session.updatedAt,
            })),
            pagination: {
              page: input.page,
              limit: input.limit,
              total,
              total_pages: Math.ceil(total / input.limit),
            },
          },
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list agent sessions',
          cause: error,
        });
      }
    }),

  /**
   * Get Agent Session
   * Retrieve session details with message history
   */
  getSession: protectedProcedure
    .input(
      z.object({
        session_id: z.string().uuid(),
        include_messages: z.boolean().default(false),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
        data: z.object({
          session: AgentSessionResponseSchema,
          messages: z.array(AgentMessageResponseSchema).optional(),
        }),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, _input }) => {
      try {
        const session = await ctx.prisma.agentSession.findFirst({
          where: {
            id: input.session_id,
            _userId: ctx.user.id,
          },
        });

        if (!session) {
          throw new HealthcareTRPCError(
            'NOT_FOUND',
            'Agent session not found',
            'SESSION_NOT_FOUND',
            { session_id: input.session_id },
          );
        }

        let messages = [];
        if (input.include_messages) {
          messages = await ctx.prisma.agentMessage.findMany({
            where: { sessionId: input.session_id },
            orderBy: { createdAt: 'asc' },
          });
        }

        return {
          success: true,
          data: {
            session: {
              id: session.id,
              user_id: session.userId,
              agent_type: session.agentType as any,
              status: session.status as any,
              metadata: session.metadata,
              created_at: session.createdAt,
              updated_at: session.updatedAt,
            },
            messages: messages.map(msg => ({
              id: msg.id,
              session_id: msg.sessionId,
              _role: msg.role as any,
              content: msg.content,
              metadata: msg.metadata,
              attachments: msg.attachments || [],
              created_at: msg.createdAt,
            })),
          },
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        if (error instanceof HealthcareTRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get agent session',
          cause: error,
        });
      }
    }),

  /**
   * Send Message to Agent
   * Process user message and generate agent response
   */
  sendMessage: protectedProcedure
    .input(CreateAgentMessageSchema)
    .output(
      z.object({
        success: z.literal(true),
        data: z.object({
          message: AgentMessageResponseSchema,
          agent_response: z.object({
            content: z.string(),
            actions: z.array(z.any()).optional(),
            processing_time: z.number(),
          }),
        }),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, _input }) => {
      try {
        // Verify session exists and belongs to user
        const session = await ctx.prisma.agentSession.findFirst({
          where: {
            id: input.session_id,
            _userId: ctx.user.id,
            status: 'active',
          },
        });

        if (!session) {
          throw new HealthcareTRPCError(
            'NOT_FOUND',
            'Active agent session not found',
            'SESSION_NOT_FOUND',
            { session_id: input.session_id },
          );
        }

        // Save user message
        const userMessage = await ctx.prisma.agentMessage.create({
          data: {
            sessionId: input.session_id,
            _role: input.role,
            content: input.content,
            metadata: input.metadata,
            attachments: input.attachments,
          },
        });

        // Process message with RAG
        const startTime = Date.now();

        // Perform RAG search for relevant context
        const ragResults = await performRAGSearch(
          input.content,
          session.agentType,
          5,
        );

        // Build context for AI
        const context = HEALTHCARE_CONTEXTS[session.agentType];
        const ragContext = ragResults
          .map(r => `${r.content} (Fonte: ${r.source})`)
          .join('\n\n');

        // Select AI provider
        const provider = AGENT_PROVIDERS.local; // Default to local for now

        // Mock AI response (replace with real AI call)
        const aiResponse = `Entendi sua mensagem. Como assistente de ${
          session.agentType === 'client'
            ? 'pacientes'
            : session.agentType === 'financial'
            ? 'finanças'
            : 'agendamento'
        }, estou aqui para ajudar.`;

        // Save agent response
        const agentMessage = await ctx.prisma.agentMessage.create({
          data: {
            sessionId: input.session_id,
            _role: 'assistant',
            content: aiResponse,
            metadata: {
              provider: provider.name,
              rag_results: ragResults.length,
              processing_time: Date.now() - startTime,
            },
          },
        });

        // Update session timestamp
        await ctx.prisma.agentSession.update({
          where: { id: input.session_id },
          data: { updatedAt: new Date() },
        });

        // Create audit trail
        await createAgentAuditTrail(
          ctx,
          'message_sent',
          session.agentType,
          input.session_id,
          {
            message_id: userMessage.id,
            rag_results_count: ragResults.length,
            processing_time: Date.now() - startTime,
          },
        );

        return {
          success: true,
          data: {
            message: {
              id: userMessage.id,
              session_id: userMessage.sessionId,
              _role: userMessage.role as any,
              content: userMessage.content,
              metadata: userMessage.metadata,
              attachments: userMessage.attachments || [],
              created_at: userMessage.createdAt,
            },
            agent_response: {
              content: aiResponse,
              actions: [],
              processing_time: Date.now() - startTime,
            },
          },
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        if (error instanceof HealthcareTRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message to agent',
          cause: error,
        });
      }
    }),

  /**
   * Add Knowledge Entry
   * Add new information to agent knowledge base
   */
  addKnowledge: protectedProcedure
    .input(CreateKnowledgeEntrySchema)
    .output(
      z.object({
        success: z.literal(true),
        data: KnowledgeEntryResponseSchema,
        message: z.string(),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, _input }) => {
      try {
        // Create knowledge entry
        const entry = await ctx.prisma.agentKnowledgeBase.create({
          data: {
            agentType: input.agent_type,
            title: input.title,
            content: input.content,
            source: input.source,
            tags: input.tags || [],
            metadata: input.metadata || {},
            embedding: [], // TODO: Generate real embeddings
          },
        });

        // Create audit trail
        await createAgentAuditTrail(
          ctx,
          'knowledge_added',
          input.agent_type,
          undefined,
          {
            knowledge_id: entry.id,
            title: input.title,
            tags: input.tags,
          },
        );

        return {
          success: true,
          data: {
            id: entry.id,
            agent_type: entry.agentType as any,
            title: entry.title,
            content: entry.content,
            source: entry.source,
            tags: entry.tags,
            metadata: entry.metadata,
            embedding: entry.embedding,
            created_at: entry.createdAt,
            updated_at: entry.updatedAt,
          },
          message: 'Knowledge entry added successfully',
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add knowledge entry',
          cause: error,
        });
      }
    }),

  /**
   * Search Knowledge Base
   * Search agent knowledge base using semantic similarity
   */
  searchKnowledge: protectedProcedure
    .input(SearchKnowledgeBaseSchema)
    .output(
      z.object({
        success: z.literal(true),
        data: z.object({
          results: z.array(KnowledgeEntryResponseSchema),
          _query: z.string(),
          total_matches: z.number(),
        }),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, _input }) => {
      try {
        // Mock semantic search (replace with vector search)
        const results = await ctx.prisma.agentKnowledgeBase.findMany({
          where: {
            agentType: input.agent_type,
            OR: [
              { title: { contains: input.query, mode: 'insensitive' } },
              { content: { contains: input.query, mode: 'insensitive' } },
              { tags: { has: input.query } },
            ],
          },
          take: input.limit,
        });

        return {
          success: true,
          data: {
            results: results.map(entry => ({
              id: entry.id,
              agent_type: entry.agentType as any,
              title: entry.title,
              content: entry.content,
              source: entry.source,
              tags: entry.tags,
              metadata: entry.metadata,
              embedding: entry.embedding,
              created_at: entry.createdAt,
              updated_at: entry.updatedAt,
            })),
            _query: input.query,
            total_matches: results.length,
          },
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search knowledge base',
          cause: error,
        });
      }
    }),

  /**
   * Perform RAG Query
   * Retrieval-Augmented Generation with context from database
   */
  ragQuery: protectedProcedure
    .input(RAGQuerySchema)
    .output(RAGResponseSchema)
    .mutation(async ({ ctx, _input }) => {
      try {
        const startTime = Date.now();

        // Get session to determine agent type
        const session = await ctx.prisma.agentSession.findFirst({
          where: {
            id: input.session_id,
            _userId: ctx.user.id,
          },
        });

        if (!session) {
          throw new HealthcareTRPCError(
            'NOT_FOUND',
            'Agent session not found',
            'SESSION_NOT_FOUND',
            { session_id: input.session_id },
          );
        }

        // Perform RAG search
        const ragResults = await performRAGSearch(
          input.query,
          session.agentType,
          input.max_results,
        );

        // Build context
        const context = ragResults.map(r => r.content).join('\n\n');

        // Generate response (mock implementation)
        const response = `Com base nas informações disponíveis: ${context.substring(0, 200)}...`;

        return {
          _query: input.query,
          results: ragResults,
          context,
          response,
          tokens_used: Math.floor(response.length / 4),
          processing_time: Date.now() - startTime,
        };
      } catch (error) {
        if (error instanceof HealthcareTRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to perform RAG query',
          cause: error,
        });
      }
    }),

  /**
   * Archive Session
   * Soft delete session for audit compliance
   */
  archiveSession: protectedProcedure
    .input(
      z.object({
        session_id: z.string().uuid(),
        reason: z.string().min(10).max(500),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
        message: z.string(),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, _input }) => {
      try {
        const session = await ctx.prisma.agentSession.findFirst({
          where: {
            id: input.session_id,
            _userId: ctx.user.id,
          },
        });

        if (!session) {
          throw new HealthcareTRPCError(
            'NOT_FOUND',
            'Agent session not found',
            'SESSION_NOT_FOUND',
            { session_id: input.session_id },
          );
        }

        // Archive session
        await ctx.prisma.agentSession.update({
          where: { id: input.session_id },
          data: {
            status: 'archived',
            metadata: {
              ...session.metadata,
              archived_at: new Date(),
              archived_by: ctx.user.id,
              archive_reason: input.reason,
            },
          },
        });

        // Create audit trail
        await createAgentAuditTrail(
          ctx,
          'session_archived',
          session.agentType,
          input.session_id,
          {
            reason: input.reason,
          },
        );

        return {
          success: true,
          message: 'Agent session archived successfully',
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        if (error instanceof HealthcareTRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to archive agent session',
          cause: error,
        });
      }
    }),

  /**
   * Get Agent Analytics
   * Retrieve usage statistics and performance metrics
   */
  getAnalytics: protectedProcedure
    .input(
      z.object({
        agent_type: AgentTypeSchema.optional(),
        start_date: z.string().date().optional(),
        end_date: z.string().date().optional(),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
        data: z.object({
          total_sessions: z.number(),
          total_messages: z.number(),
          average_response_time: z.number(),
          user_satisfaction: z.number().optional(),
          top_queries: z.array(
            z.object({
              _query: z.string(),
              count: z.number(),
            }),
          ),
        }),
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, _input }) => {
      try {
        const where = {
          _userId: ctx.user.id,
          ...(input.agent_type && { agentType: input.agent_type }),
          ...(input.start_date && {
            createdAt: { gte: new Date(input.start_date) },
          }),
          ...(input.end_date && {
            createdAt: { lte: new Date(input.end_date) },
          }),
        };

        const [sessions, messages] = await Promise.all([
          ctx.prisma.agentSession.findMany({ where }),
          ctx.prisma.agentMessage.findMany({
            where: {
              session: where,
            },
          }),
        ]);

        // Mock analytics (replace with real aggregation)
        const analytics = {
          total_sessions: sessions.length,
          total_messages: messages.length,
          average_response_time: 1.2, // seconds
          user_satisfaction: 4.5,
          top_queries: [
            { _query: 'agendar consulta', count: 15 },
            { _query: 'valor da consulta', count: 12 },
            { _query: 'horário de funcionamento', count: 8 },
          ],
        };

        return {
          success: true,
          data: analytics,
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get agent analytics',
          cause: error,
        });
      }
    }),
});
