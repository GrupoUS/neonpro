import { SupabaseClient } from '@supabase/supabase-js'
import { HealthcareLogger } from '../logging/healthcare-logger'
import { SessionManager } from '../session/session-manager'
import {
  ErrorContext,
  getErrorMessage,
  logErrorWithContext,
  withErrorHandling,
} from '../utils/error-handling'

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    tool_calls?: any[]
    citations?: any[]
    confidence?: number
    intent?: string
    entities?: any[]
  }
}

export interface ConversationContext {
  id: string
  sessionId: string
  userId: string
  clinicId: string
  patientId?: string
  title: string
  messages: ConversationMessage[]
  context?: {
    currentIntent?: string
    patientContext?: any
    medicalHistory?: any
    preferences?: any
    lastTopic?: string
    followUpQuestions?: string[]
  }
  status: 'active' | 'archived' | 'deleted'
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface ConversationCreateParams {
  sessionId: string
  userId: string
  clinicId: string
  patientId?: string
  title?: string
  initialContext?: any
  expirationHours?: number
}

export interface ConversationUpdateParams {
  patientId?: string
  title?: string
  status?: 'active' | 'archived' | 'deleted'
  context?: any
  expiresAt?: Date
}

export class ConversationContextManager {
  private supabase: SupabaseClient
  private logger: HealthcareLogger
  private sessionManager: SessionManager
  private activeContexts: Map<string, ConversationContext> = new Map()

  constructor(
    supabase: SupabaseClient,
    logger: HealthcareLogger,
    sessionManager: SessionManager,
  ) {
    this.supabase = supabase
    this.logger = logger
    this.sessionManager = sessionManager
  }

  async createConversation(
    params: ConversationCreateParams,
  ): Promise<ConversationContext> {
    try {
      // Validate session
      const session = await this.sessionManager.getSession(params.sessionId)
      if (!session || session.userId !== params.userId) {
        throw new Error('Invalid session for conversation creation')
      }

      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date()
      const expiresAt = params.expirationHours
        ? new Date(now.getTime() + params.expirationHours * 60 * 60 * 1000)
        : undefined

      const conversation: ConversationContext = {
        id: conversationId,
        sessionId: params.sessionId,
        userId: params.userId,
        clinicId: params.clinicId,
        patientId: params.patientId,
        title: params.title || 'New Conversation',
        messages: [],
        context: params.initialContext || {},
        status: 'active',
        createdAt: now,
        updatedAt: now,
        expiresAt,
      }

      // Store in database
      const { data, error } = await this.supabase
        .from('ai_conversation_contexts')
        .insert({
          id: conversationId,
          session_id: params.sessionId,
          user_id: params.userId,
          clinic_id: params.clinicId,
          patient_id: params.patientId,
          title: conversation.title,
          messages: [],
          context: params.initialContext || {},
          status: 'active',
          expires_at: expiresAt?.toISOString(),
        })
        .select()
        .single()

      if (error) {
        logErrorWithContext(
          this.logger,
          'conversation_creation_failed',
          error,
          ErrorContext.conversation(conversationId, params.userId, params.clinicId),
        )
        throw new Error(`Failed to create conversation: ${getErrorMessage(error)}`)
      }

      // Cache in memory
      this.activeContexts.set(conversationId, conversation)

      await this.logger.logDataAccess(params.userId, params.clinicId, {
        action: 'create_conversation',
        resource: 'ai_conversation_contexts',
        conversationId,
        patientId: params.patientId,
        success: true,
      })

      return conversation
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'conversation_creation_error',
        error,
        ErrorContext.conversation('temp', params.userId, params.clinicId, {
          params: params,
        }),
      )
      throw error
    }
  }

  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<ConversationContext | null> {
    try {
      // Check memory cache first
      const cached = this.activeContexts.get(conversationId)
      if (cached && cached.userId === userId) {
        return cached
      }

      // Fetch from database
      const { data, error } = await this.supabase
        .from('ai_conversation_contexts')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw new Error(`Database error: ${getErrorMessage(error)}`)
      }

      const conversation: ConversationContext = {
        id: data.id,
        sessionId: data.session_id,
        userId: data.user_id,
        clinicId: data.clinic_id,
        patientId: data.patient_id,
        title: data.title,
        messages: data.messages || [],
        context: data.context || {},
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      }

      // Cache in memory
      if (conversation.status === 'active') {
        this.activeContexts.set(conversationId, conversation)
      }

      await this.logger.logDataAccess(userId, conversation.clinicId, {
        action: 'read_conversation',
        resource: 'ai_conversation_contexts',
        conversationId,
        success: true,
      })

      return conversation
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'conversation_retrieval_error',
        error,
        ErrorContext.conversation(conversationId, userId, 'unknown'),
      )
      throw error
    }
  }

  async updateConversation(
    conversationId: string,
    userId: string,
    updates: ConversationUpdateParams,
  ): Promise<ConversationContext> {
    try {
      const conversation = await this.getConversation(conversationId, userId)
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const updatedConversation = {
        ...conversation,
        ...updates,
        updatedAt: new Date(),
      }

      // Update database
      const { error } = await this.supabase
        .from('ai_conversation_contexts')
        .update({
          title: updates.title,
          patient_id: updates.patientId,
          status: updates.status,
          context: updates.context,
          expires_at: updates.expiresAt?.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to update conversation: ${getErrorMessage(error)}`)
      }

      // Update cache
      if (updates.status === 'deleted' || updates.status === 'archived') {
        this.activeContexts.delete(conversationId)
      } else {
        this.activeContexts.set(conversationId, updatedConversation)
      }

      await this.logger.logDataAccess(userId, updatedConversation.clinicId, {
        action: 'update_conversation',
        resource: 'ai_conversation_contexts',
        conversationId,
        updates,
        success: true,
      })

      return updatedConversation
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'conversation_update_error',
        error,
        ErrorContext.conversation(conversationId, userId, 'unknown', {
          updates: updates,
        }),
      )
      throw error
    }
  }

  async addMessage(
    conversationId: string,
    userId: string,
    message: Omit<ConversationMessage, 'id' | 'timestamp'>,
  ): Promise<ConversationContext> {
    try {
      const conversation = await this.getConversation(conversationId, userId)
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const newMessage: ConversationMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      }

      conversation.messages.push(newMessage)
      conversation.updatedAt = new Date()

      // Update database
      const { error } = await this.supabase
        .from('ai_conversation_contexts')
        .update({
          messages: conversation.messages,
          updated_at: conversation.updatedAt.toISOString(),
        })
        .eq('id', conversationId)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to add message: ${getErrorMessage(error)}`)
      }

      // Update cache
      this.activeContexts.set(conversationId, conversation)

      await this.logger.logDataAccess(userId, conversation.clinicId, {
        action: 'add_message',
        resource: 'ai_conversation_contexts',
        conversationId,
        messageId: newMessage.id,
        role: message.role,
        success: true,
      })

      return conversation
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'message_addition_error',
        error,
        ErrorContext.conversation(conversationId, userId, 'unknown', {
          messageRole: message.role,
        }),
      )
      throw error
    }
  }

  async updateContext(
    conversationId: string,
    userId: string,
    context: any,
  ): Promise<ConversationContext> {
    try {
      const conversation = await this.getConversation(conversationId, userId)
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const updatedContext = {
        ...conversation.context,
        ...context,
        lastUpdated: new Date().toISOString(),
      }

      return await this.updateConversation(conversationId, userId, {
        context: updatedContext,
      })
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'context_update_error',
        error,
        ErrorContext.conversation(conversationId, userId, 'unknown'),
      )
      throw error
    }
  }

  async getUserConversations(
    userId: string,
    clinicId: string,
  ): Promise<ConversationContext[]> {
    try {
      const { data, error } = await this.supabase
        .from('ai_conversation_contexts')
        .select('*')
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .in('status', ['active', 'archived'])
        .order('updated_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch conversations: ${getErrorMessage(error)}`)
      }

      const conversations: ConversationContext[] = data.map(conv => ({
        id: conv.id,
        sessionId: conv.session_id,
        userId: conv.user_id,
        clinicId: conv.clinic_id,
        patientId: conv.patient_id,
        title: conv.title,
        messages: conv.messages || [],
        context: conv.context || {},
        status: conv.status,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        expiresAt: conv.expires_at ? new Date(conv.expires_at) : undefined,
      }))

      // Update cache
      conversations.forEach(conv => {
        if (conv.status === 'active') {
          this.activeContexts.set(conv.id, conv)
        }
      })

      await this.logger.logDataAccess(userId, clinicId, {
        action: 'list_conversations',
        resource: 'ai_conversation_contexts',
        count: conversations.length,
        success: true,
      })

      return conversations
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'conversation_list_error',
        error,
        ErrorContext.dataAccess(userId, clinicId, 'ai_conversation_contexts', 'list'),
      )
      throw error
    }
  }

  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Soft delete by marking as deleted
      await this.updateConversation(conversationId, userId, {
        status: 'deleted',
      })

      // Remove from cache
      this.activeContexts.delete(conversationId)

      await this.logger.logDataAccess(userId, 'unknown', {
        action: 'delete_conversation',
        resource: 'ai_conversation_contexts',
        conversationId,
        success: true,
      })
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'conversation_deletion_error',
        error,
        ErrorContext.conversation(conversationId, userId, 'unknown'),
      )
      throw error
    }
  }

  async cleanupExpiredConversations(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('ai_conversation_contexts')
        .update({ status: 'archived' })
        .lt('expires_at', new Date().toISOString())
        .in('status', ['active'])
        .select()

      if (error) {
        throw new Error(
          `Failed to cleanup expired conversations: ${getErrorMessage(error)}`,
        )
      }

      // Remove from cache
      data?.forEach(conv => {
        this.activeContexts.delete(conv.id)
      })

      await this.logger.logSystemEvent('expired_conversations_cleanup', {
        archivedCount: data?.length || 0,
        timestamp: new Date().toISOString(),
      })

      return data?.length || 0
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'conversation_cleanup_error',
        error,
        ErrorContext.system('cleanup_expired_conversations'),
      )
      return 0
    }
  }

  getActiveContextCount(): number {
    return this.activeContexts.size
  }

  getMemoryUsage(): any {
    return {
      activeContexts: this.activeContexts.size,
      estimatedMemorySize: Array.from(this.activeContexts.values()).reduce(
        (total, conv) => total + JSON.stringify(conv).length,
        0,
      ),
    }
  }
}
