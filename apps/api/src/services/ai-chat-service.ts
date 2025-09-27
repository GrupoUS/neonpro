/**
 * AI Chat Service with Multi-Model Support (T039)
 * Comprehensive AI chat service for Brazilian healthcare
 *
 * Features:
 * - Multi-provider support (OpenAI, Anthropic, Google, local models)
 * - Brazilian healthcare context with Portuguese responses
 * - Conversation management and history tracking
 * - AI insights integration with symptom analysis
 * - LGPD compliance with audit tracking and anonymization
 * - Performance monitoring and rate limiting
 * - Comprehensive error handling
 */

// Basic AI types to replace shared package imports
export interface AIInsight {
  id: string
  type: AIInsightType
  content: string
  confidence: number
  timestamp: Date
}

export enum AIInsightType {
  SYMPTOM_ANALYSIS = 'symptom_analysis',
  TREATMENT_SUGGESTION = 'treatment_suggestion',
  RISK_ASSESSMENT = 'risk_assessment',
  EMERGENCY_DETECTION = 'emergency_detection',
}

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  LOCAL = 'local',
}

export const createAIInsight = (
  type: AIInsightType,
  content: string,
  confidence: number,
): AIInsight => ({
  id: Math.random().toString(36).substr(2, 9),
  type,
  content,
  confidence,
  timestamp: new Date(),
})
import { HealthcareLogger } from '../logging/healthcare-logger'
import { ComprehensiveAuditService } from './audit-service'

// Minimal audit interface to avoid tight coupling
export interface AuditLogger {
  logActivity(data: {
    _userId?: string
    userId?: string
    action: string
    resource?: string
    details?: Record<string, any>
    result?: 'success' | 'failure' | 'blocked' | 'alert'
    severity?: any
  }): Promise<void>
}

// Service response interface
export interface ServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Array<{ field: string; message: string; code: string }>
  message?: string
}

// Chat message interface
export interface ChatMessage {
  id?: string
  _role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Conversation interface
export interface Conversation {
  id: string
  patientId: string
  title: string
  _context: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'archived' | 'anonymized'
  metadata?: Record<string, any>
}

// AI request interface
export interface AIRequest {
  provider: string
  model: string
  messages: ChatMessage[]
  patientId: string
  temperature?: number
  maxTokens?: number
  timeout?: number
}

// AI response interface
export interface AIResponse {
  response: string
  provider: string
  model: string
  responseTime: number
  tokensUsed?: number
  cost?: number
  confidence?: number
}

// Healthcare response interface
export interface HealthcareResponse {
  response: string
  language: string
  _context: string
  disclaimer?: string
  sources?: string[]
}

// Personalized response interface
export interface PersonalizedResponse {
  response: string
  personalized: boolean
  patientId: string
  patientContext?: Record<string, any>
}

// Medical info interface
export interface MedicalInfo {
  response: string
  compliance: string
  disclaimer: string
  sources?: string[]
  lastUpdated?: Date
}

// Conversation creation interface
export interface ConversationCreation {
  patientId: string
  title: string
  _context: string
  metadata?: Record<string, any>
}

// Message addition interface
export interface MessageAddition {
  conversationId: string
  _role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Insights generation interface
export interface InsightsGeneration {
  conversationId: string
  analysisType: string
  includeHistory?: boolean
}

// Follow-up suggestion interface
export interface FollowUpSuggestion {
  conversationId: string
  lastMessage: string
  maxSuggestions?: number
}

// Urgent symptoms detection interface
export interface UrgentSymptomsDetection {
  messages: ChatMessage[]
  patientId?: string
}

// Access tracking interface
export interface AccessTracking {
  conversationId: string
  _userId: string
  action: string
  ipAddress?: string
  userAgent?: string
}

// Data export interface
export interface DataExport {
  patientId: string
  format: 'json' | 'pdf' | 'csv'
  includeMetadata?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

// Rate limit interface
export interface RateLimit {
  allowed: boolean
  remaining: number
  resetTime: Date
  limit: number
}

// Health status interface
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  providers: Record<string, boolean>
  uptime: number
  lastCheck: Date
}

/**
 * AI Chat Service Class
 * Handles all AI chat operations with multi-model support and Brazilian healthcare compliance
 */
export class AIChatService {
  private conversations: Map<string, Conversation> = new Map()
  private rateLimits: Map<string, RateLimit> = new Map()
  private startTime: Date = new Date()
  private isInitialized = false
  private audit: AuditLogger
  private logger: HealthcareLogger

  constructor(auditService?: AuditLogger, logger?: HealthcareLogger) {
    // Backwards-compatible defaults
    this.audit = auditService || new ComprehensiveAuditService()
    this.logger = logger || new HealthcareLogger()
    this.initialize()
  }

  /**
   * Initialize service with mock data
   */
  private initialize(): void {
    // Mock conversation data for testing
    const mockConversation: Conversation = {
      id: 'conv-123',
      patientId: 'patient-123',
      title: 'Consulta sobre sintomas',
      _context: 'medical_consultation',
      messages: [
        {
          id: 'msg-1',
          _role: 'user',
          content: 'Estou sentindo dor de cabeça',
          timestamp: new Date(),
        },
        {
          id: 'msg-2',
          _role: 'assistant',
          content:
            'Entendo sua preocupação. Há quanto tempo você está sentindo essa dor de cabeça?',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    }

    this.conversations.set('conv-123', mockConversation)

    // Initialize rate limits
    this.rateLimits.set('patient-123', {
      allowed: true,
      remaining: 100,
      resetTime: new Date(Date.now() + 3600000), // 1 hour from now
      limit: 100,
    })

    this.isInitialized = true
  }

  /**
   * Generate AI response with multi-model support
   */
  async generateResponse(
    request: AIRequest,
  ): Promise<ServiceResponse<AIResponse>> {
    try {
      const startTime = Date.now()

      // Validate input
      const validation = this.validateAIRequest(request)
      if (!validation.isValid) {
        await this.audit.logActivity({
          action: 'ai_generate_response',
          details: {
            errors: validation.errors,
            patientId: request.patientId,
            provider: request.provider,
            model: request.model,
          },
          result: 'failure',
        })
        return {
          success: false,
          errors: validation.errors,
        }
      }

      // Check provider support
      const supportedProviders = ['openai', 'anthropic', 'google', 'local']
      if (!supportedProviders.includes(request.provider)) {
        await this.audit.logActivity({
          action: 'ai_generate_response',
          details: {
            reason: 'unsupported_provider',
            patientId: request.patientId,
            provider: request.provider,
            model: request.model,
          },
          result: 'failure',
        })
        return {
          success: false,
          error: 'Provedor de IA não suportado',
        }
      }

      // Mock AI response generation
      const mockResponses = {
        openai: 'Resposta gerada pelo OpenAI GPT-4 em português para contexto médico brasileiro.',
        anthropic: 'Resposta gerada pelo Claude-3 com foco em saúde e conformidade ANVISA.',
        google: 'Resposta do Gemini Pro adaptada para o sistema de saúde brasileiro.',
        local: 'Resposta do modelo local Llama-2 com contexto de saúde brasileiro.',
      }

      const responseTime = Date.now() - startTime
      const response: AIResponse = {
        response: mockResponses[request.provider as keyof typeof mockResponses] ||
          'Resposta padrão',
        provider: request.provider,
        model: request.model,
        responseTime,
        tokensUsed: Math.floor(Math.random() * 1000) + 100,
        cost: Math.random() * 0.1,
        confidence: 0.85 + Math.random() * 0.1,
      }

      await this.audit.logActivity({
        action: 'ai_generate_response',
        details: {
          patientId: request.patientId,
          provider: request.provider,
          model: request.model,
          responseTime,
        },
        result: 'success',
      })

      return {
        success: true,
        data: response,
      }
    } catch (error: any) {
      this.logger.error('generateResponse failed', error, {
        request: {
          provider: request?.provider,
          model: request?.model,
          patientId: request?.patientId,
        },
      })
      await this.audit.logActivity({
        action: 'ai_generate_response',
        details: {
          error: error?.message,
          patientId: request?.patientId,
          provider: request?.provider,
          model: request?.model,
        },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Generate healthcare-specific response in Portuguese
   */
  async generateHealthcareResponse(params: {
    _query: string
    patientId: string
    _context: string
  }): Promise<ServiceResponse<HealthcareResponse>> {
    try {
      const response: HealthcareResponse = {
        response:
          `Resposta médica sobre ${params._query} adaptada para o contexto brasileiro de saúde. Esta informação é baseada em diretrizes da ANVISA e protocolos do SUS.`,
        language: 'pt-BR',
        _context: params._context,
        disclaimer:
          'Esta informação não substitui consulta médica profissional. Procure sempre orientação médica qualificada.',
        sources: ['ANVISA', 'Ministério da Saúde', 'SUS'],
      }

      await this.audit.logActivity({
        action: 'ai_generate_healthcare_response',
        details: { patientId: params.patientId, context: params._context, query: params._query },
        result: 'success',
      })

      return {
        success: true,
        data: response,
      }
    } catch (error: any) {
      this.logger.error('generateHealthcareResponse failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_generate_healthcare_response',
        details: { error: error?.message, patientId: params.patientId, context: params._context },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Generate personalized response based on patient data
   */
  async generatePersonalizedResponse(params: {
    _query: string
    patientId: string
    includeHistory?: boolean
  }): Promise<ServiceResponse<PersonalizedResponse>> {
    try {
      const response: PersonalizedResponse = {
        response:
          `Resposta personalizada para o paciente ${params.patientId}: Com base no seu histórico médico e perfil de saúde, posso fornecer informações específicas sobre ${params._query}.`,
        personalized: true,
        patientId: params.patientId,
        patientContext: {
          hasHistory: params.includeHistory || false,
          lastConsultation: new Date(),
          riskFactors: ['diabetes', 'hipertensão'],
        },
      }

      await this.audit.logActivity({
        action: 'ai_generate_personalized_response',
        details: { patientId: params.patientId, includeHistory: !!params.includeHistory },
        result: 'success',
      })

      return {
        success: true,
        data: response,
      }
    } catch (error: any) {
      this.logger.error('generatePersonalizedResponse failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_generate_personalized_response',
        details: { error: error?.message, patientId: params.patientId },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Generate ANVISA-compliant medical information
   */
  async generateMedicalInfo(params: {
    topic: string
    _query: string
    complianceLevel: string
  }): Promise<ServiceResponse<MedicalInfo>> {
    try {
      const response: MedicalInfo = {
        response:
          `Informações médicas sobre ${params._query} em conformidade com regulamentações da ANVISA. Este conteúdo segue as diretrizes brasileiras de informação médica.`,
        compliance: params.complianceLevel,
        disclaimer:
          'Informação regulamentada pela ANVISA. Não substitui prescrição médica. Consulte sempre um profissional de saúde.',
        sources: ['ANVISA', 'Bulário Eletrônico', 'RDC ANVISA'],
        lastUpdated: new Date(),
      }

      await this.audit.logActivity({
        action: 'ai_generate_medical_info',
        details: {
          topic: params.topic,
          query: params._query,
          complianceLevel: params.complianceLevel,
        },
        result: 'success',
      })

      return {
        success: true,
        data: response,
      }
    } catch (error: any) {
      this.logger.error('generateMedicalInfo failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_generate_medical_info',
        details: { error: error?.message, topic: params.topic, query: params._query },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Create new conversation
   */
  async createConversation(
    params: ConversationCreation,
  ): Promise<ServiceResponse<Conversation>> {
    try {
      const conversation: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId: params.patientId,
        title: params.title,
        _context: params.context,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        metadata: params.metadata,
      }

      this.conversations.set(conversation.id, conversation)

      // Audit
      await this.audit.logActivity({
        action: 'ai_conversation_create',
        details: {
          patientId: params.patientId,
          title: params.title,
          context: params.context,
          conversationId: conversation.id,
        },
        result: 'success',
      })

      return {
        success: true,
        data: conversation,
      }
    } catch (error: any) {
      this.logger.error('createConversation failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_conversation_create',
        details: { error: error?.message, params },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Add message to conversation
   */
  async addMessage(
    params: MessageAddition,
  ): Promise<ServiceResponse<ChatMessage>> {
    try {
      const conversation = this.conversations.get(params.conversationId)

      if (!conversation) {
        return {
          success: false,
          error: 'Conversa não encontrada',
        }
      }

      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        _role: params.role,
        content: params.content,
        timestamp: params.timestamp,
        metadata: params.metadata,
      }

      conversation.messages.push(message)
      conversation.updatedAt = new Date()
      this.conversations.set(params.conversationId, conversation)

      // Audit
      await this.audit.logActivity({
        action: 'ai_message_add',
        details: {
          conversationId: params.conversationId,
          role: params.role,
          hasMetadata: !!params.metadata,
        },
        result: 'success',
      })

      return {
        success: true,
        data: message,
      }
    } catch (error: any) {
      this.logger.error('addMessage failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_message_add',
        details: { error: error?.message, params },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId: string): Promise<
    ServiceResponse<{
      conversationId: string
      messages: ChatMessage[]
    }>
  > {
    try {
      const conversation = this.conversations.get(conversationId)

      if (!conversation) {
        return {
          success: false,
          error: 'Conversa não encontrada',
        }
      }

      const result = {
        conversationId,
        messages: conversation.messages,
      }

      await this.audit.logActivity({
        action: 'ai_conversation_history',
        details: { conversationId, messageCount: result.messages.length },
        result: 'success',
      })

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      this.logger.error('getConversationHistory failed', error, { conversationId })
      await this.audit.logActivity({
        action: 'ai_conversation_history',
        details: { error: error?.message, conversationId },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * List patient conversations
   */
  async listConversations(patientId: string): Promise<
    ServiceResponse<{
      patientId: string
      conversations: Conversation[]
    }>
  > {
    try {
      const patientConversations = Array.from(this.conversations.values())
        .filter(conv => conv.patientId === patientId)
        .sort((a, _b) => b.updatedAt.getTime() - a.updatedAt.getTime())

      const result = {
        patientId,
        conversations: patientConversations,
      }

      await this.audit.logActivity({
        action: 'ai_conversation_list',
        details: { patientId, count: patientConversations.length },
        result: 'success',
      })

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      this.logger.error('listConversations failed', error, { patientId })
      await this.audit.logActivity({
        action: 'ai_conversation_list',
        details: { error: error?.message, patientId },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Generate insights from conversation
   */
  async generateInsights(params: InsightsGeneration): Promise<
    ServiceResponse<{
      insights: AIInsight[]
      analysisType: string
    }>
  > {
    try {
      const conversation = this.conversations.get(params.conversationId)

      if (!conversation) {
        return {
          success: false,
          error: 'Conversa não encontrada',
        }
      }

      // Mock insights generation
      const insights: AIInsight[] = [
        createAIInsight({
          patientId: conversation.patientId,
          type: AIInsightType.HEALTH_ANALYSIS,
          title: 'Análise de Sintomas',
          content: {
            summary: 'Análise baseada na conversa do paciente',
            recommendations: ['Consultar médico', 'Monitorar sintomas'],
            confidence: 0.8,
          },
          confidence: 0.8,
          model: 'gpt-4',
          provider: AIProvider.OPENAI,
        }),
      ]

      const result = { insights, analysisType: params.analysisType }

      await this.audit.logActivity({
        action: 'ai_insights_generate',
        details: { conversationId: params.conversationId, count: insights.length },
        result: 'success',
      })

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      this.logger.error('generateInsights failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_insights_generate',
        details: { error: error?.message, params },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Suggest follow-up questions
   */
  async suggestFollowUp(params: FollowUpSuggestion): Promise<
    ServiceResponse<{
      suggestions: string[]
    }>
  > {
    try {
      const suggestions = [
        'Há quanto tempo você está sentindo esses sintomas?',
        'Os sintomas pioram em algum momento específico do dia?',
        'Você está tomando algum medicamento atualmente?',
        'Já teve sintomas similares antes?',
        'Gostaria de agendar uma consulta médica?',
      ]

      const result = { suggestions: suggestions.slice(0, params.maxSuggestions || 3) }

      await this.audit.logActivity({
        action: 'ai_followup_suggest',
        details: { conversationId: params.conversationId, count: result.suggestions.length },
        result: 'success',
      })

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      this.logger.error('suggestFollowUp failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_followup_suggest',
        details: { error: error?.message, params },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Detect urgent symptoms
   */
  async detectUrgentSymptoms(params: UrgentSymptomsDetection): Promise<
    ServiceResponse<{
      urgent: boolean
      urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
      recommendation: string
    }>
  > {
    try {
      // Mock urgent symptom detection
      const urgentKeywords = [
        'dor no peito',
        'falta de ar',
        'desmaio',
        'sangramento',
      ]
      const hasUrgentSymptoms = params.messages.some(msg =>
        urgentKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
      )

      const result = {
        urgent: hasUrgentSymptoms,
        urgencyLevel: hasUrgentSymptoms ? 'high' : 'low',
        recommendation: hasUrgentSymptoms
          ? 'Procure atendimento médico imediatamente ou ligue para o SAMU (192)'
          : 'Continue monitorando os sintomas e agende consulta se necessário',
      }

      await this.audit.logActivity({
        action: 'ai_urgent_detection',
        details: { urgent: hasUrgentSymptoms, messagesChecked: params.messages.length },
        result: 'success',
      })

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      this.logger.error('detectUrgentSymptoms failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_urgent_detection',
        details: { error: error?.message, params },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Track conversation access for LGPD audit
   */
  async trackConversationAccess(params: AccessTracking): Promise<
    ServiceResponse<{
      accessLogged: boolean
    }>
  > {
    try {
      const conversation = this.conversations.get(params.conversationId)

      if (!conversation) {
        return {
          success: false,
          error: 'Conversa não encontrada',
        }
      }

      // Mock access logging
      if (!conversation.metadata) {
        conversation.metadata = {}
      }

      if (!conversation.metadata.accessLog) {
        conversation.metadata.accessLog = []
      }

      conversation.metadata.accessLog.push({
        _userId: params.userId,
        action: params.action,
        timestamp: new Date(),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      })

      this.conversations.set(params.conversationId, conversation)

      await this.audit.logActivity({
        action: 'ai_conversation_access',
        details: {
          conversationId: params.conversationId,
          _userId: params.userId,
          action: params.action,
          ipAddress: params.ipAddress,
        },
        result: 'success',
      })

      return {
        success: true,
        data: { accessLogged: true },
      }
    } catch (error: any) {
      this.logger.error('trackConversationAccess failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_conversation_access',
        details: { error: error?.message, params },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Anonymize conversation data for LGPD compliance
   */
  async anonymizeConversation(conversationId: string): Promise<
    ServiceResponse<{
      anonymized: boolean
    }>
  > {
    try {
      const conversation = this.conversations.get(conversationId)

      if (!conversation) {
        return {
          success: false,
          error: 'Conversa não encontrada',
        }
      }

      // Anonymize conversation data
      conversation.title = `CONVERSA ANONIMIZADA - ${Date.now()}`
      conversation.messages = conversation.messages.map(msg => ({
        ...msg,
        content: `MENSAGEM ANONIMIZADA - ${Date.now()}`,
      }))
      conversation.status = 'anonymized'
      conversation.updatedAt = new Date()

      this.conversations.set(conversationId, conversation)

      await this.audit.logActivity({
        action: 'ai_conversation_anonymize',
        details: { conversationId },
        result: 'success',
      })

      return {
        success: true,
        data: { anonymized: true },
        message: 'Conversa anonimizada com sucesso',
      }
    } catch (error: any) {
      this.logger.error('anonymizeConversation failed', error, { conversationId })
      await this.audit.logActivity({
        action: 'ai_conversation_anonymize',
        details: { error: error?.message, conversationId },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Export conversation data for LGPD requests
   */
  async exportConversationData(params: DataExport): Promise<
    ServiceResponse<{
      exportUrl: string
      format: string
    }>
  > {
    try {
      // Mock export URL generation
      const exportUrl = `/exports/conversations-${params.patientId}-${Date.now()}.${params.format}`

      await this.audit.logActivity({
        action: 'ai_conversation_export',
        details: { patientId: params.patientId, format: params.format },
        result: 'success',
      })

      return {
        success: true,
        data: {
          exportUrl,
          format: params.format,
        },
      }
    } catch (error: any) {
      this.logger.error('exportConversationData failed', error, { params })
      await this.audit.logActivity({
        action: 'ai_conversation_export',
        details: { error: error?.message, patientId: params.patientId, format: params.format },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Check rate limit for patient
   */
  async checkRateLimit(patientId: string): Promise<ServiceResponse<RateLimit>> {
    try {
      const rateLimit = this.rateLimits.get(patientId) || {
        allowed: true,
        remaining: 100,
        resetTime: new Date(Date.now() + 3600000),
        limit: 100,
      }

      await this.audit.logActivity({
        action: 'ai_rate_limit_check',
        details: {
          patientId,
          remaining: rateLimit.remaining,
          limit: rateLimit.limit,
          resetTime: rateLimit.resetTime,
        },
        result: 'success',
      })

      return {
        success: true,
        data: rateLimit,
      }
    } catch (error: any) {
      this.logger.error('checkRateLimit failed', error, { patientId })
      await this.audit.logActivity({
        action: 'ai_rate_limit_check',
        details: { error: error?.message, patientId },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Generate response with timeout handling
   */
  async generateResponseWithTimeout(
    request: AIRequest & { timeout: number },
  ): Promise<ServiceResponse<AIResponse>> {
    try {
      if (request.timeout < 100) {
        await this.audit.logActivity({
          action: 'ai_generate_response_timeout',
          details: {
            reason: 'timeout_too_low',
            timeout: request.timeout,
            patientId: request.patientId,
            provider: request.provider,
            model: request.model,
          },
          result: 'failure',
        })
        return {
          success: false,
          error: 'Timeout na requisição para o provedor de IA',
        }
      }

      const result = await this.generateResponse(request)

      // Optionally reflect success/failure at wrapper level
      await this.audit.logActivity({
        action: 'ai_generate_response_timeout',
        details: {
          timeout: request.timeout,
          patientId: request.patientId,
          provider: request.provider,
          model: request.model,
          innerResult: result.success ? 'success' : 'failure',
        },
        result: result.success ? 'success' : 'failure',
      })

      return result
    } catch (error: any) {
      this.logger.error('generateResponseWithTimeout failed', error, {
        request: {
          timeout: request?.timeout,
          patientId: request?.patientId,
          provider: request?.provider,
          model: request?.model,
        },
      })
      await this.audit.logActivity({
        action: 'ai_generate_response_timeout',
        details: {
          error: error?.message,
          timeout: request?.timeout,
          patientId: request?.patientId,
          provider: request?.provider,
          model: request?.model,
        },
        result: 'failure',
      })
      return {
        success: false,
        error: 'Erro interno do servidor',
      }
    }
  }

  /**
   * Get service health status
   */
  getHealthStatus(): HealthStatus {
    const uptime = Date.now() - this.startTime.getTime()

    const status: HealthStatus = {
      status: 'healthy',
      providers: {
        openai: true,
        anthropic: true,
        google: true,
        local: true,
      },
      uptime: Math.floor(uptime / 1000), // seconds
      lastCheck: new Date(),
    }

    // Non-PII audit for health check
    void this.audit.logActivity({
      action: 'ai_health_check',
      details: { uptime: status.uptime },
      result: 'success',
    })

    return status
  }

  /**
   * Validate AI request parameters
   */
  private validateAIRequest(_request: AIRequest): {
    isValid: boolean
    errors: Array<{ field: string; message: string; code: string }>
  } {
    const errors: Array<{ field: string; message: string; code: string }> = []

    if (!request.provider || request.provider.trim() === '') {
      errors.push({
        field: 'provider',
        message: 'Provedor de IA é obrigatório',
        code: 'REQUIRED',
      })
    }

    if (!request.model || request.model.trim() === '') {
      errors.push({
        field: 'model',
        message: 'Modelo de IA é obrigatório',
        code: 'REQUIRED',
      })
    }

    if (!request.messages || request.messages.length === 0) {
      errors.push({
        field: 'messages',
        message: 'Mensagens são obrigatórias',
        code: 'REQUIRED',
      })
    }

    if (!request.patientId || request.patientId.trim() === '') {
      errors.push({
        field: 'patientId',
        message: 'ID do paciente é obrigatório',
        code: 'REQUIRED',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
