import { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseConnector } from '../database/supabase-connector'
import { HealthcareLogger } from '../logging/healthcare-logger'
import { SessionManager } from '../session/session-manager'
import {
  ConversationContext,
  ConversationContextManager,
  ConversationMessage,
} from './conversation-context'

export interface ConversationRequest {
  sessionId: string
  _userId: string
  clinicId: string
  patientId?: string
  message: string
  _context?: any
  title?: string
}

export interface ConversationResponse {
  conversationId: string
  message: string
  _role: 'assistant' | 'system'
  _context: any
  citations?: any[]
  confidence?: number
  followUpQuestions?: string[]
}

export interface ConversationHistoryParams {
  _userId: string
  clinicId: string
  patientId?: string
  limit?: number
  offset?: number
  status?: 'active' | 'archived'
}

export class ConversationService {
  private contextManager: ConversationContextManager
  private supabase: SupabaseClient
  private logger: HealthcareLogger
  private sessionManager: SessionManager
  private supabaseConnector: SupabaseConnector

  constructor(
    supabase: SupabaseClient,
    logger: HealthcareLogger,
    sessionManager: SessionManager,
    supabaseConnector: SupabaseConnector,
  ) {
    this.supabase = supabase
    this.logger = logger
    this.sessionManager = sessionManager
    this.supabaseConnector = supabaseConnector
    this.contextManager = new ConversationContextManager(
      supabase,
      logger,
      sessionManager,
    )
  }

  async startConversation(
    _request: ConversationRequest,
  ): Promise<ConversationResponse> {
    try {
      // Validate session and permissions
      await this.validateRequestPermissions(request)

      // Check for existing active conversation
      const existingConversation = await this.findExistingConversation(request)

      let conversation: ConversationContext
      if (existingConversation) {
        conversation = existingConversation
      } else {
        // Create new conversation
        conversation = await this.contextManager.createConversation({
          sessionId: request.sessionId,
          _userId: request.userId,
          clinicId: request.clinicId,
          patientId: request.patientId,
          title: request.title || this.generateConversationTitle(request.message),
          initialContext: request.context || {},
        })
      }

      // Add user message
      await this.contextManager.addMessage(conversation.id, request.userId, {
        _role: 'user',
        content: request.message,
        metadata: {
          intent: await this.analyzeIntent(request.message),
          entities: await this.extractEntities(request.message),
        },
      })

      // Process with RAG agent and get response
      const agentResponse = await this.processWithRAGAgent(
        request.message,
        conversation,
      )

      // Add assistant response to conversation
      await this.contextManager.addMessage(conversation.id, request.userId, {
        _role: 'assistant',
        content: agentResponse.message,
        metadata: {
          confidence: agentResponse.confidence,
          citations: agentResponse.citations,
          tool_calls: agentResponse.tool_calls,
        },
      })

      // Update conversation context
      await this.contextManager.updateContext(conversation.id, request.userId, {
        currentIntent: agentResponse.intent,
        patientContext: agentResponse.patientContext,
        lastTopic: agentResponse.topic,
        followUpQuestions: agentResponse.followUpQuestions,
      })

      await this.logger.logDataAccess(request.userId, request.clinicId, {
        action: 'start_conversation',
        resource: 'ai_conversation_contexts',
        conversationId: conversation.id,
        patientId: request.patientId,
        messageLength: request.message.length,
        success: true,
      })

      return {
        conversationId: conversation.id,
        message: agentResponse.message,
        _role: 'assistant',
        _context: agentResponse.context,
        citations: agentResponse.citations,
        confidence: agentResponse.confidence,
        followUpQuestions: agentResponse.followUpQuestions,
      }
    } catch (error) {
      await this.logger.logError('conversation_start_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        _request: {
          _userId: request.userId,
          clinicId: request.clinicId,
          patientId: request.patientId,
          messageLength: request.message.length,
        },
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }

  async continueConversation(
    conversationId: string,
    _userId: string,
    message: string,
    _context?: any,
  ): Promise<ConversationResponse> {
    try {
      // Get conversation
      const conversation = await this.contextManager.getConversation(
        conversationId,
        _userId,
      )
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      // Validate permissions
      await this.validateUserAccess(userId, conversation.clinicId)

      // Add user message
      await this.contextManager.addMessage(conversationId, userId, {
        _role: 'user',
        content: message,
        metadata: {
          intent: await this.analyzeIntent(message),
          entities: await this.extractEntities(message),
        },
      })

      // Get conversation history for context
      const recentMessages = conversation.messages.slice(-10) // Last 10 messages

      // Process with RAG agent
      const agentResponse = await this.processWithRAGAgent(
        message,
        conversation,
        recentMessages,
        context,
      )

      // Add assistant response
      await this.contextManager.addMessage(conversationId, userId, {
        _role: 'assistant',
        content: agentResponse.message,
        metadata: {
          confidence: agentResponse.confidence,
          citations: agentResponse.citations,
          tool_calls: agentResponse.tool_calls,
        },
      })

      // Update conversation context
      await this.contextManager.updateContext(conversationId, userId, {
        ...conversation.context,
        ...context,
        currentIntent: agentResponse.intent,
        lastTopic: agentResponse.topic,
        followUpQuestions: agentResponse.followUpQuestions,
      })

      await this.logger.logDataAccess(userId, conversation.clinicId, {
        action: 'continue_conversation',
        resource: 'ai_conversation_contexts',
        conversationId,
        messageLength: message.length,
        success: true,
      })

      return {
        conversationId,
        message: agentResponse.message,
        _role: 'assistant',
        _context: agentResponse.context,
        citations: agentResponse.citations,
        confidence: agentResponse.confidence,
        followUpQuestions: agentResponse.followUpQuestions,
      }
    } catch (error) {
      await this.logger.logError('conversation_continue_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        conversationId,
        userId,
        messageLength: message.length,
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }

  async getConversationHistory(
    params: ConversationHistoryParams,
  ): Promise<{ conversations: ConversationContext[]; total: number }> {
    try {
      await this.validateUserAccess(params.userId, params.clinicId)

      const conversations = await this.contextManager.getUserConversations(
        params.userId,
        params.clinicId,
      )

      // Apply filters
      let filteredConversations = conversations
      if (params.patientId) {
        filteredConversations = filteredConversations.filter(
          conv => conv.patientId === params.patientId,
        )
      }
      if (params.status) {
        filteredConversations = filteredConversations.filter(
          conv => conv.status === params.status,
        )
      }

      // Apply pagination
      const offset = params.offset || 0
      const limit = params.limit || 20
      const paginatedConversations = filteredConversations.slice(
        offset,
        offset + limit,
      )

      await this.logger.logDataAccess(params.userId, params.clinicId, {
        action: 'get_conversation_history',
        resource: 'ai_conversation_contexts',
        filters: params,
        returnedCount: paginatedConversations.length,
        totalCount: filteredConversations.length,
        success: true,
      })

      return {
        conversations: paginatedConversations,
        total: filteredConversations.length,
      }
    } catch (error) {
      await this.logger.logError('conversation_history_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }

  async getConversationDetails(
    conversationId: string,
    _userId: string,
  ): Promise<ConversationContext | null> {
    try {
      const conversation = await this.contextManager.getConversation(
        conversationId,
        _userId,
      )
      if (!conversation) {
        return null
      }

      await this.validateUserAccess(userId, conversation.clinicId)

      await this.logger.logDataAccess(userId, conversation.clinicId, {
        action: 'get_conversation_details',
        resource: 'ai_conversation_contexts',
        conversationId,
        messageCount: conversation.messages.length,
        success: true,
      })

      return conversation
    } catch (error) {
      await this.logger.logError('conversation_details_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        conversationId,
        userId,
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }

  async deleteConversation(
    conversationId: string,
    _userId: string,
  ): Promise<void> {
    try {
      const conversation = await this.contextManager.getConversation(
        conversationId,
        _userId,
      )
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      await this.validateUserAccess(userId, conversation.clinicId)

      await this.contextManager.deleteConversation(conversationId, _userId)

      await this.logger.logDataAccess(userId, conversation.clinicId, {
        action: 'delete_conversation',
        resource: 'ai_conversation_contexts',
        conversationId,
        messageCount: conversation.messages.length,
        success: true,
      })
    } catch (error) {
      await this.logger.logError('conversation_delete_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        conversationId,
        userId,
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }

  async searchConversations(
    _userId: string,
    clinicId: string,
    _query: string,
    filters?: {
      patientId?: string
      dateFrom?: Date
      dateTo?: Date
      status?: 'active' | 'archived'
    },
  ): Promise<ConversationContext[]> {
    try {
      await this.validateUserAccess(userId, clinicId)

      const conversations = await this.contextManager.getUserConversations(
        userId,
        clinicId,
      )

      // Filter by search query and additional filters
      const filteredConversations = conversations.filter(conv => {
        // Search in title and messages
        const searchText = `${conv.title} ${conv.messages.map(m => m.content).join(' ')}`
          .toLowerCase()
        const matchesQuery = searchText.includes(query.toLowerCase())

        // Apply additional filters
        if (filters?.patientId && conv.patientId !== filters.patientId) {
          return false
        }
        if (filters?.dateFrom && conv.createdAt < filters.dateFrom) {
          return false
        }
        if (filters?.dateTo && conv.createdAt > filters.dateTo) {
          return false
        }
        if (filters?.status && conv.status !== filters.status) {
          return false
        }

        return matchesQuery
      })

      await this.logger.logDataAccess(userId, clinicId, {
        action: 'search_conversations',
        resource: 'ai_conversation_contexts',
        query,
        filters,
        resultCount: filteredConversations.length,
        success: true,
      })

      return filteredConversations
    } catch (error) {
      await this.logger.logError('conversation_search_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clinicId,
        query,
        filters,
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }

  private async validateRequestPermissions(
    _request: ConversationRequest,
  ): Promise<void> {
    const hasAccess = await this.supabaseConnector.validateDataAccess({
      _userId: request.userId,
      clinicId: request.clinicId,
      action: 'read',
      resource: 'ai_conversation_contexts',
    })

    if (!hasAccess) {
      throw new Error('Insufficient permissions to start conversation')
    }

    // Validate session
    const session = await this.sessionManager.getSession(request.sessionId)
    if (!session || session.userId !== request._userId) {
      throw new Error('Invalid session')
    }
  }

  private async validateUserAccess(
    _userId: string,
    clinicId: string,
  ): Promise<void> {
    const hasAccess = await this.supabaseConnector.validateDataAccess({
      userId,
      clinicId,
      action: 'read',
      resource: 'ai_conversation_contexts',
    })

    if (!hasAccess) {
      throw new Error('Insufficient permissions to access conversations')
    }
  }

  private async findExistingConversation(
    _request: ConversationRequest,
  ): Promise<ConversationContext | null> {
    // Look for active conversations in the same session
    const conversations = await this.contextManager.getUserConversations(
      request.userId,
      request.clinicId,
    )

    return (
      conversations.find(
        conv =>
          conv.sessionId === request.sessionId &&
          conv.status === 'active' &&
          conv.patientId === request.patientId,
      ) || null
    )
  }

  private generateConversationTitle(message: string): string {
    // Simple title generation based on first few words
    const words = message.split(' ').slice(0, 5)
    return (
      words.join(' ') + (words.length < message.split(' ').length ? '...' : '')
    )
  }

  private async analyzeIntent(message: string): Promise<string> {
    // Placeholder for intent analysis - in real implementation, this would use NLP
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('help') || lowerMessage.includes('how to')) {
      return 'help_request'
    } else if (
      lowerMessage.includes('appointment') ||
      lowerMessage.includes('schedule')
    ) {
      return 'appointment_related'
    } else if (
      lowerMessage.includes('patient') ||
      lowerMessage.includes('medical')
    ) {
      return 'patient_inquiry'
    } else if (
      lowerMessage.includes('billing') ||
      lowerMessage.includes('payment')
    ) {
      return 'billing_inquiry'
    } else {
      return 'general_inquiry'
    }
  }

  private async extractEntities(message: string): Promise<any[]> {
    // Placeholder for entity extraction - in real implementation, this would use NLP
    const entities = []

    // Simple regex-based extraction
    const datePattern = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g
    const dates = message.match(datePattern)
    if (dates) {
      entities.push({ type: 'date', value: dates[0] })
    }

    const phonePattern = /\b(\d{10,11})\b/g
    const phones = message.match(phonePattern)
    if (phones) {
      entities.push({ type: 'phone', value: phones[0] })
    }

    return entities
  }

  private async processWithRAGAgent(
    message: string,
    conversation: ConversationContext,
    history?: ConversationMessage[],
    additionalContext?: any,
  ): Promise<{
    message: string
    intent: string
    _context: any
    confidence: number
    citations?: any[]
    tool_calls?: any[]
    patientContext?: any
    topic: string
    followUpQuestions?: string[]
  }> {
    // This is a placeholder for RAG agent processing
    // In a real implementation, this would:
    // 1. Retrieve relevant documents from vector database
    // 2. Process with language model
    // 3. Generate response with citations
    // 4. Extract follow-up questions

    const context = {
      ...conversation.context,
      ...additionalContext,
      patientId: conversation.patientId,
      clinicId: conversation.clinicId,
      messageHistory: history?.map(m => ({ _role: m.role, content: m.content })) || [],
    }

    return {
      message:
        `I understand you're asking about: "${message}". As an AI assistant, I'm here to help you with healthcare-related inquiries. This is a placeholder response - in the full implementation, I would provide relevant information based on your clinic's data and policies.`,
      intent: await this.analyzeIntent(message),
      context,
      confidence: 0.85,
      citations: [
        {
          type: 'policy',
          title: 'Healthcare AI Assistant Guidelines',
          url: '/docs/ai-guidelines',
        },
      ],
      tool_calls: [],
      patientContext: context.patientContext,
      topic: this.generateConversationTitle(message),
      followUpQuestions: [
        'Would you like me to help you schedule an appointment?',
        'Do you need information about specific medical services?',
        'Is there anything else I can help you with?',
      ],
    }
  }

  getStatistics(): any {
    return {
      activeConversations: this.contextManager.getActiveContextCount(),
      memoryUsage: this.contextManager.getMemoryUsage(),
    }
  }
}
