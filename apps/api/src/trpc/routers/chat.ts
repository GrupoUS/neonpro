/**
 * Chat API Router
 * 
 * Backend API for NeonPro Chat interface with multi-agent coordination
 * Features:
 * - Multi-agent coordination (Client, Financial, Appointment)
 * - LGPD-compliant message handling
 * - Healthcare-specific context management
 * - Real-time agent communication
 * - Audit logging for compliance
 */

import { z } from 'zod'
import { router, procedure } from '../trpc-factory'
import { rlsGuard } from '../middleware/rls-guard'

// Types
export interface ChatAgent {
  id: string
  type: 'client' | 'financial' | 'appointment' | 'clinical'
  name: string
  status: 'idle' | 'thinking' | 'responding' | 'error'
  capabilities: string[]
  context: Record<string, any>
}

export interface ChatMessage {
  id: string
  sessionId: string
  agentId: string
  content: string
  role: 'user' | 'assistant'
  metadata: {
    timestamp: Date
    patientId?: string
    clinicId: string
    agentType: string
    complianceLevel: 'standard' | 'sensitive' | 'emergency'
    auditTrail: {
      logged: boolean
      eventId?: string
    }
  }
}

export interface ChatSession {
  id: string
  clinicId: string
  userId: string
  patientId?: string
  config: {
    language: 'pt-BR' | 'en-US'
    userRole: 'admin' | 'aesthetician' | 'coordinator' | 'receptionist' | 'doctor'
    compliance: {
      lgpdEnabled: boolean
      auditLogging: boolean
      dataRetention: number
    }
  }
  agents: ChatAgent[]
  activeAgent: string
  status: 'active' | 'paused' | 'ended'
  createdAt: Date
  lastActivity: Date
}

// Input schemas
const CreateSessionSchema = z.object({
  clinicId: z.string().uuid(),
  userId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
  config: z.object({
    language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
    userRole: z.enum(['admin', 'aesthetician', 'coordinator', 'receptionist', 'doctor']),
    compliance: z.object({
      lgpdEnabled: z.boolean().default(true),
      auditLogging: z.boolean().default(true),
      dataRetention: z.number().min(30).max(2555).default(365),
    }),
  }),
})

const SendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  agentId: z.string().uuid().optional(),
  metadata: z.object({
    patientId: z.string().uuid().optional(),
    complianceLevel: z.enum(['standard', 'sensitive', 'emergency']).default('standard'),
  }).optional(),
})

const GetSessionSchema = z.object({
  sessionId: z.string().uuid(),
})

const UpdateAgentSchema = z.object({
  sessionId: z.string().uuid(),
  agentId: z.string().uuid(),
  status: z.enum(['idle', 'thinking', 'responding', 'error']),
  context: z.record(z.any()).optional(),
})

export const chatRouter = router({
  // Create new chat session
  createSession: procedure
    .input(CreateSessionSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      const sessionId = crypto.randomUUID()
      
      try {
        // Initialize default agents for healthcare clinic
        const defaultAgents: ChatAgent[] = [
          {
            id: crypto.randomUUID(),
            type: 'client',
            name: 'Atendimento ao Cliente',
            status: 'idle',
            capabilities: ['appointment_booking', 'general_inquiries', 'clinic_info'],
            context: { clinicId: input.clinicId },
          },
          {
            id: crypto.randomUUID(),
            type: 'financial',
            name: 'Consultor Financeiro',
            status: 'idle',
            capabilities: ['pricing', 'payment_methods', 'insurance'],
            context: { clinicId: input.clinicId },
          },
          {
            id: crypto.randomUUID(),
            type: 'appointment',
            name: 'Agendamento',
            status: 'idle',
            capabilities: ['scheduling', 'availability', 'rescheduling'],
            context: { clinicId: input.clinicId },
          },
          {
            id: crypto.randomUUID(),
            type: 'clinical',
            name: 'Suporte Clínico',
            status: 'idle',
            capabilities: ['treatment_info', 'preparation_instructions', 'aftercare'],
            context: { clinicId: input.clinicId },
          },
        ]

        // Create session in database
        const { data: session, error } = await ctx.supabase
          .from('chat_sessions')
          .insert({
            id: sessionId,
            clinic_id: input.clinicId,
            user_id: input.userId,
            patient_id: input.patientId,
            config: input.config,
            agents: defaultAgents,
            active_agent: defaultAgents[0].id, // Start with client agent
            status: 'active',
            created_at: new Date().toISOString(),
            last_activity: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error

        // Log session creation for audit
        if (input.config.compliance.auditLogging) {
          await ctx.supabase
            .from('audit_logs')
            .insert({
              id: crypto.randomUUID(),
              clinic_id: input.clinicId,
              user_id: input.userId,
              action: 'chat_session_created',
              resource_type: 'chat_session',
              resource_id: sessionId,
              details: {
                patient_id: input.patientId,
                agents_count: defaultAgents.length,
                compliance_level: input.config.compliance.lgpdEnabled ? 'lgpd' : 'standard',
              },
              created_at: new Date().toISOString(),
            })
        }

        return {
          success: true,
          session: {
            ...session,
            agents: defaultAgents,
          },
        }
      } catch (error) {
        console.error('Failed to create chat session:', error)
        throw new Error('Failed to create chat session')
      }
    }),

  // Send message in chat session
  sendMessage: procedure
    .input(SendMessageSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      const messageId = crypto.randomUUID()
      
      try {
        // Get session and verify access
        const { data: session, error: sessionError } = await ctx.supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', input.sessionId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (sessionError || !session) {
          throw new Error('Session not found or access denied')
        }

        if (session.status !== 'active') {
          throw new Error('Session is not active')
        }

        // Store message
        const messageData: ChatMessage = {
          id: messageId,
          sessionId: input.sessionId,
          agentId: input.agentId || session.active_agent,
          content: input.content,
          role: 'user',
          metadata: {
            timestamp: new Date(),
            clinicId: session.clinic_id,
            agentType: 'user',
            complianceLevel: input.metadata?.complianceLevel || 'standard',
            patientId: input.metadata?.patientId || session.patient_id,
            auditTrail: {
              logged: false,
            },
          },
        }

        const { data: message, error: messageError } = await ctx.supabase
          .from('chat_messages')
          .insert({
            id: messageId,
            session_id: input.sessionId,
            agent_id: messageData.agentId,
            content: input.content,
            role: 'user',
            metadata: messageData.metadata,
            created_at: messageData.metadata.timestamp.toISOString(),
          })
          .select()
          .single()

        if (messageError) throw messageError

        // Update session last activity
        await ctx.supabase
          .from('chat_sessions')
          .update({ 
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.sessionId)

        // Get agent response (mock implementation - would integrate with actual AI)
        const agentResponse = await generateAgentResponse(
          input.content,
          session.agents.find(a => a.id === session.active_agent)!,
          {
            patientId: session.patient_id,
            clinicId: session.clinic_id,
            userRole: session.config.userRole,
          }
        )

        // Store agent response
        if (agentResponse) {
          const responseId = crypto.randomUUID()
          const responseMessage = {
            id: responseId,
            sessionId: input.sessionId,
            agentId: session.active_agent,
            content: agentResponse.content,
            role: 'assistant' as const,
            metadata: {
              timestamp: new Date(),
              clinicId: session.clinic_id,
              agentType: session.agents.find(a => a.id === session.active_agent)?.type || 'client',
              complianceLevel: input.metadata?.complianceLevel || 'standard',
              patientId: input.metadata?.patientId || session.patient_id,
              auditTrail: {
                logged: false,
              },
            },
          }

          await ctx.supabase
            .from('chat_messages')
            .insert({
              id: responseId,
              session_id: input.sessionId,
              agent_id: session.active_agent,
              content: agentResponse.content,
              role: 'assistant',
              metadata: responseMessage.metadata,
              created_at: responseMessage.metadata.timestamp.toISOString(),
            })

          // Update agent status
          const updatedAgents = session.agents.map(agent =>
            agent.id === session.active_agent
              ? { ...agent, status: 'idle' as const }
              : agent
          )

          await ctx.supabase
            .from('chat_sessions')
            .update({ 
              agents: updatedAgents,
              updated_at: new Date().toISOString(),
            })
            .eq('id', input.sessionId)

          // Log messages for audit if required
          if (session.config.compliance.auditLogging) {
            await Promise.all([
              logChatMessage(ctx.supabase, session, messageData, messageId),
              logChatMessage(ctx.supabase, session, responseMessage, responseId),
            ])
          }

          return {
            success: true,
            userMessage: message,
            agentResponse: {
              id: responseId,
              content: agentResponse.content,
              agentId: session.active_agent,
              agentType: responseMessage.metadata.agentType,
              timestamp: responseMessage.metadata.timestamp,
            },
          }
        }

        return {
          success: true,
          userMessage: message,
          agentResponse: null,
        }
      } catch (error) {
        console.error('Failed to send message:', error)
        throw new Error('Failed to send message')
      }
    }),

  // Get chat session
  getSession: procedure
    .input(GetSessionSchema)
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      try {
        const { data: session, error } = await ctx.supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', input.sessionId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (error || !session) {
          throw new Error('Session not found or access denied')
        }

        // Get messages for this session
        const { data: messages, error: messagesError } = await ctx.supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', input.sessionId)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError

        return {
          session,
          messages: messages || [],
        }
      } catch (error) {
        console.error('Failed to get chat session:', error)
        throw new Error('Failed to get chat session')
      }
    }),

  // Get chat history for user/clinic
  getHistory: procedure
    .input(z.object({
      clinicId: z.string().uuid(),
      userId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabase
          .from('chat_sessions')
          .select('*')
          .eq('clinic_id', input.clinicId)
          .order('last_activity', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        if (input.userId) {
          query = query.eq('user_id', input.userId)
        }

        if (input.patientId) {
          query = query.eq('patient_id', input.patientId)
        }

        const { data: sessions, error } = await query

        if (error) throw error

        return {
          sessions: sessions || [],
          total: sessions?.length || 0,
        }
      } catch (error) {
        console.error('Failed to get chat history:', error)
        throw new Error('Failed to get chat history')
      }
    }),

  // Update agent status
  updateAgent: procedure
    .input(UpdateAgentSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: session, error } = await ctx.supabase
          .from('chat_sessions')
          .select('agents')
          .eq('id', input.sessionId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (error || !session) {
          throw new Error('Session not found or access denied')
        }

        const updatedAgents = session.agents.map((agent: ChatAgent) =>
          agent.id === input.agentId
            ? { 
                ...agent, 
                status: input.status,
                ...(input.context && { context: { ...agent.context, ...input.context } }),
              }
            : agent
        )

        const { data: updatedSession, error: updateError } = await ctx.supabase
          .from('chat_sessions')
          .update({ 
            agents: updatedAgents,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.sessionId)
          .select()
          .single()

        if (updateError) throw updateError

        return {
          success: true,
          agent: updatedAgents.find(a => a.id === input.agentId),
        }
      } catch (error) {
        console.error('Failed to update agent:', error)
        throw new Error('Failed to update agent')
      }
    }),

  // End chat session
  endSession: procedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: session, error } = await ctx.supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', input.sessionId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (error || !session) {
          throw new Error('Session not found or access denied')
        }

        const { error: updateError } = await ctx.supabase
          .from('chat_sessions')
          .update({ 
            status: 'ended',
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.sessionId)

        if (updateError) throw updateError

        // Log session end for audit
        if (session.config.compliance.auditLogging) {
          await ctx.supabase
            .from('audit_logs')
            .insert({
              id: crypto.randomUUID(),
              clinic_id: session.clinic_id,
              user_id: session.user_id,
              action: 'chat_session_ended',
              resource_type: 'chat_session',
              resource_id: input.sessionId,
              details: {
                duration: Date.now() - new Date(session.created_at).getTime(),
                message_count: await getMessageCount(ctx.supabase, input.sessionId),
              },
              created_at: new Date().toISOString(),
            })
        }

        return {
          success: true,
          endedAt: new Date().toISOString(),
        }
      } catch (error) {
        console.error('Failed to end chat session:', error)
        throw new Error('Failed to end chat session')
      }
    }),
})

// Helper functions
async function generateAgentResponse(
  userMessage: string,
  agent: ChatAgent,
  context: {
    patientId?: string
    clinicId: string
    userRole: string
  }
): Promise<{ content: string } | null> {
  // Mock AI response generation
  // In production, this would integrate with actual AI services
  const responses = {
    client: [
      'Olá! Sou o assistente de atendimento. Como posso ajudar você hoje?',
      'Posso ajudar com agendamentos, informações sobre a clínica ou tirar suas dúvidas.',
      'Para agendar uma consulta, preciso saber qual procedimento você deseja.',
    ],
    financial: [
      'Posso ajudar com informações sobre preços e formas de pagamento.',
      'Aceitamos cartão de crédito, débito e parcelamentos em até 12x.',
      'Também trabalhamos com convênios médicos. Qual seu plano?',
    ],
    appointment: [
      'Vou verificar nossa agenda para você. Qual dia e horário prefere?',
      'Temos vagas amanhã às 14h e 16h. Qual delas seria melhor?',
      'Seu agendamento foi confirmado! Receberá um lembrete por WhatsApp.',
    ],
    clinical: [
      'Posso fornecer informações sobre tratamentos e cuidados pré e pós-procedimento.',
      'É importante chegar 15 minutos antes para preencher a anamnese.',
      'Lembre-se de trazer seus exames e documentos para a consulta.',
    ],
  }

  const agentResponses = responses[agent.type] || responses.client
  const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)]

  return {
    content: randomResponse,
  }
}

async function logChatMessage(
  supabase: any,
  session: any,
  message: ChatMessage,
  messageId: string
): Promise<void> {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        id: crypto.randomUUID(),
        clinic_id: session.clinic_id,
        user_id: session.user_id,
        action: 'chat_message_sent',
        resource_type: 'chat_message',
        resource_id: messageId,
        details: {
          session_id: message.sessionId,
          agent_type: message.metadata.agentType,
          role: message.role,
          compliance_level: message.metadata.complianceLevel,
          patient_id: message.metadata.patientId,
        },
        created_at: message.metadata.timestamp.toISOString(),
      })
  } catch (error) {
    console.error('Failed to log chat message:', error)
  }
}

async function getMessageCount(supabase: any, sessionId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
    
    return count || 0
  } catch (error) {
    console.error('Failed to get message count:', error)
    return 0
  }
}