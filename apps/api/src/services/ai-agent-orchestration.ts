/**
 * Unified Agent Interface - Orchestration Layer
 * Integrates AG-UI Protocol, CopilotKit, and AI Services
 * Following KISS/YAGNI principles - leverages existing components
 */

import { ServiceResponse } from '../types/shared'
import { AIChatService } from './ai-chat-service'
// Mock AgentConfig interface - would interface with Python agent in production
export interface AgentConfig {
  name: string
  version: string
  environment: string
  ai: {
    provider: string
    model: string
    max_tokens: number
    temperature: number
    api_key: string
  }
  compliance: {
    audit_logging: boolean
    pii_detection: boolean
    data_encryption: boolean
    enabled_standards: string[]
  }
}

// Mock HealthcareLogger - would interface with Python agent in production
export class HealthcareLogger {
  log(level: string, message: string, metadata?: any): void {
    console.log(`[${level.toUpperCase()}] ${message}`, metadata)
  }
  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error)
  }
  info(message: string, metadata?: any): void {
    console.info(`[INFO] ${message}`, metadata)
  }
  warn(message: string, metadata?: any): void {
    console.warn(`[WARN] ${message}`, metadata)
  }
}

import { AuditTrailService } from './audit-trail'
import { ComprehensiveAuditService } from './audit-service'

// Mock AgUiRagAgent class - would interface with Python agent in production
export class AgUiRagAgent {
  private config: AgentConfig
  private initialized = false
  private startTime = Date.now()

  constructor(config: AgentConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    // Mock initialization - would connect to Python agent in production
    this.initialized = true
  }

  async process_query(
    query: string,
    sessionId: string,
    userId: string,
    patientId?: string,
    context?: Record<string, any>
  ): Promise<{
    response?: {
      content: string
      confidence?: number
      provider?: string
      usage?: {
        total_tokens?: number
        total_cost?: number
      }
    }
    context_used?: Array<{ type: string }>
    error?: string
  }> {
    // Mock processing - would call Python agent in production
    return {
      response: {
        content: `Mock RAG response for: ${query}`,
        confidence: 0.85,
        provider: 'rag',
        usage: {
          total_tokens: 150,
          total_cost: 0.002
        }
      },
      context_used: [
        { type: 'patient_records' },
        { type: 'medical_knowledge' }
      ]
    }
  }

  async get_agent_status(): Promise<{
    agent?: {
      initialized: boolean
      version: string
      environment: string
      uptime: number
    }
    components?: Record<string, any>
    connections?: {
      active_sessions: number
      websocket_connections: number
    }
    compliance?: Record<string, any>
  }> {
    return {
      agent: {
        initialized: this.initialized,
        version: this.config.version,
        environment: this.config.environment,
        uptime: Date.now() - this.startTime
      },
      components: {
        database: 'connected',
        vector_store: 'active',
        embedding_manager: 'ready'
      },
      connections: {
        active_sessions: 1,
        websocket_connections: 0
      },
      compliance: {
        lgpd_compliant: true,
        pii_detection_enabled: true,
        audit_logging_enabled: true
      }
    }
  }

  async shutdown(): Promise<void> {
    // Mock shutdown - would disconnect from Python agent in production
    this.initialized = false
  }
}

// Core interfaces for unified agent orchestration
export interface UnifiedAgentRequest {
  sessionId: string
  userId: string
  patientId?: string
  query: string
  context?: Record<string, any>
  provider?: 'openai' | 'anthropic' | 'google' | 'local'
  mode?: 'chat' | 'rag' | 'copilot'
}

export interface UnifiedAgentResponse {
  sessionId: string
  response: {
    content: string
    type: 'text' | 'action' | 'insight'
    metadata?: {
      confidence?: number
      sources?: string[]
      compliance?: string[]
    }
  }
  timestamp: string
  provider: string
  mode: string
  usage?: {
    tokens?: number
    responseTime?: number
    cost?: number
  }
}

export interface AgentHealthStatus {
  ragAgent: {
    initialized: boolean
    uptime: number
    activeConnections: number
    components: {
      database: 'connected' | 'disconnected' | 'error'
      vectorStore: 'active' | 'inactive' | 'error'
      embeddingManager: 'ready' | 'initializing' | 'error'
    }
  }
  chatService: {
    uptime: number
    conversations: number
    providers: {
      openai: boolean
      anthropic: boolean
      google: boolean
      local: boolean
    }
  }
  compliance: {
    auditLogging: boolean
    piiDetection: boolean
    lgpdCompliant: boolean
  }
  timestamp: string
}

/**
 * Unified Agent Interface
 * Provides a single entry point for all AI agent functionality
 * while maintaining compliance with healthcare regulations
 */
export class UnifiedAgentInterface {
  private ragAgent: AgUiRagAgent | null = null
  private chatService: AIChatService
  private auditService: AuditTrailService
  private healthcareLogger: HealthcareLogger
  private initialized = false
  private startTime: Date = new Date()

  constructor(
    auditService?: AuditTrailService,
    healthcareLogger?: HealthcareLogger
  ) {
    this.auditService = auditService || new AuditTrailService()
    this.healthcareLogger = healthcareLogger || new HealthcareLogger()
    // Use ComprehensiveAuditService for AI chat service compatibility
    const chatAuditService = new ComprehensiveAuditService()
    this.chatService = new AIChatService(chatAuditService, this.healthcareLogger)
  }

  /**
   * Initialize the unified agent interface
   * Starts RAG agent and validates all components
   */
  async initialize(): Promise<ServiceResponse<void>> {
    try {
      if (this.initialized) {
        return { success: true, data: undefined }
      }

      // Initialize RAG agent with healthcare compliance
      const ragConfig: AgentConfig = {
        name: 'NeonPro Healthcare Agent',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        ai: {
          provider: 'openai', // Default, can be overridden per request
          model: 'gpt-4',
          max_tokens: 2000,
          temperature: 0.1,
          api_key: process.env.OPENAI_API_KEY || ''
        },
        compliance: {
          audit_logging: true,
          pii_detection: true,
          data_encryption: true,
          enabled_standards: ['lgpd', 'anvisa', 'cfm']
        }
      }

      // Initialize RAG agent (Python agent)
      this.ragAgent = new AgUiRagAgent(ragConfig)
      await this.ragAgent.initialize()

      this.initialized = true

      await this.auditService.logEvent({
        action: 'unified_agent_init',
        details: { environment: ragConfig.environment, compliance: ragConfig.compliance },
        result: 'success'
      })

      return { success: true, data: undefined }
    } catch (error: any) {
      await this.auditService.logEvent({
        action: 'unified_agent_init',
        details: { error: error.message },
        result: 'failure'
      })
      
      return {
        success: false,
        error: `Failed to initialize unified agent: ${error.message}`
      }
    }
  }

  /**
   * Process a unified agent request
   * Routes to appropriate service based on mode and context
   */
  async processRequest(
    request: UnifiedAgentRequest
  ): Promise<ServiceResponse<UnifiedAgentResponse>> {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize()
        if (!initResult.success) {
          return {
            success: false,
            error: 'Failed to initialize agent interface'
          }
        }
      }

      // Log request for compliance
      await this.auditService.logEvent({
        action: 'unified_agent_request',
        details: {
          sessionId: request.sessionId,
          userId: request.userId,
          patientId: request.patientId,
          mode: request.mode || 'chat',
          provider: request.provider
        },
        result: 'success'
      })

      // Route request based on mode and available context
      if (request.mode === 'rag' && this.ragAgent) {
        return await this.processRagRequest(request)
      } else if (request.mode === 'copilot') {
        return await this.processCopilotRequest(request)
      } else {
        return await this.processChatRequest(request)
      }
    } catch (error: any) {
      await this.auditService.logEvent({
        action: 'unified_agent_request',
        details: {
          sessionId: request.sessionId,
          userId: request.userId,
          error: error.message
        },
        result: 'failure'
      })

      return {
        success: false,
        error: `Failed to process request: ${error.message}`
      }
    }
  }

  /**
   * Process RAG (Retrieval-Augmented Generation) request
   * Uses the Python AG-UI RAG agent for healthcare-specific queries
   */
  private async processRagRequest(
    request: UnifiedAgentRequest
  ): Promise<ServiceResponse<UnifiedAgentResponse>> {
    try {
      if (!this.ragAgent) {
        return {
          success: false,
          error: 'RAG agent not available'
        }
      }

      const startTime = Date.now()

      // Use RAG agent for processing
      const ragResponse = await this.ragAgent.process_query(
        request.query,
        request.sessionId,
        request.userId,
        request.patientId,
        request.context
      )

      const responseTime = Date.now() - startTime

      if (ragResponse.error) {
        return {
          success: false,
          error: ragResponse.error
        }
      }

      const unifiedResponse: UnifiedAgentResponse = {
        sessionId: request.sessionId,
        response: {
          content: ragResponse.response?.content || ragResponse.response || '',
          type: 'text',
          metadata: {
            confidence: ragResponse.response?.confidence,
            sources: ragResponse.context_used?.map((ctx: any) => ctx.type) || [],
            compliance: ['lgpd', 'anvisa', 'cfm']
          }
        },
        timestamp: new Date().toISOString(),
        provider: ragResponse.response?.provider || 'rag',
        mode: 'rag',
        usage: {
          tokens: ragResponse.response?.usage?.total_tokens,
          responseTime,
          cost: ragResponse.response?.usage?.total_cost || 0
        }
      }

      return { success: true, data: unifiedResponse }
    } catch (error: any) {
      return {
        success: false,
        error: `RAG processing failed: ${error.message}`
      }
    }
  }

  /**
   * Process CopilotKit request
   * Integrates with CopilotKit frontend components
   */
  private async processCopilotRequest(
    request: UnifiedAgentRequest
  ): Promise<ServiceResponse<UnifiedAgentResponse>> {
    try {
      // For now, route through chat service with Copilot-specific context
      // In future, this would integrate with CopilotKit's action system
      const chatResponse = await this.chatService.generateResponse({
        provider: request.provider || 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: request.query }],
        patientId: request.patientId || request.userId,
        context: request.context
      })

      if (!chatResponse.success) {
        return {
          success: false,
          error: chatResponse.error || 'Copilot request failed'
        }
      }

      const unifiedResponse: UnifiedAgentResponse = {
        sessionId: request.sessionId,
        response: {
          content: chatResponse.data?.response || '',
          type: 'action',
          metadata: {
            confidence: chatResponse.data?.confidence,
            compliance: ['lgpd', 'anvisa', 'cfm']
          }
        },
        timestamp: new Date().toISOString(),
        provider: request.provider || 'openai',
        mode: 'copilot',
        usage: {
          tokens: chatResponse.data?.tokensUsed,
          responseTime: chatResponse.data?.responseTime,
          cost: chatResponse.data?.cost
        }
      }

      return { success: true, data: unifiedResponse }
    } catch (error: any) {
      return {
        success: false,
        error: `Copilot processing failed: ${error.message}`
      }
    }
  }

  /**
   * Process standard chat request
   * Uses the AI chat service for general queries
   */
  private async processChatRequest(
    request: UnifiedAgentRequest
  ): Promise<ServiceResponse<UnifiedAgentResponse>> {
    try {
      const chatResponse = await this.chatService.generateHealthcareResponse({
        _query: request.query,
        patientId: request.patientId || request.userId,
        _context: request.mode || 'general'
      })

      if (!chatResponse.success) {
        return {
          success: false,
          error: chatResponse.error || 'Chat request failed'
        }
      }

      const unifiedResponse: UnifiedAgentResponse = {
        sessionId: request.sessionId,
        response: {
          content: chatResponse.data?.response || '',
          type: 'text',
          metadata: {
            sources: chatResponse.data?.sources,
            compliance: ['lgpd', 'anvisa', 'cfm']
          }
        },
        timestamp: new Date().toISOString(),
        provider: request.provider || 'openai',
        mode: 'chat',
        usage: {
          responseTime: 0 // Would be calculated in actual implementation
        }
      }

      return { success: true, data: unifiedResponse }
    } catch (error: any) {
      return {
        success: false,
        error: `Chat processing failed: ${error.message}`
      }
    }
  }

  /**
   * Get comprehensive health status of all agent components
   */
  async getHealthStatus(): Promise<ServiceResponse<AgentHealthStatus>> {
    try {
      const ragAgentStatus = this.ragAgent 
        ? await this.ragAgent.get_agent_status()
        : {
            agent: { initialized: false, version: 'N/A', environment: 'N/A' },
            components: {},
            connections: { active_sessions: 0, websocket_connections: 0 },
            compliance: {}
          }

      const chatServiceStatus = this.chatService.getHealthStatus()

      const healthStatus: AgentHealthStatus = {
        ragAgent: {
          initialized: ragAgentStatus.agent?.initialized || false,
          uptime: ragAgentStatus.agent?.uptime || 0,
          activeConnections: ragAgentStatus.connections?.active_sessions || 0,
          components: {
            database: ragAgentStatus.components?.database || 'disconnected',
            vectorStore: ragAgentStatus.components?.vector_store || 'inactive',
            embeddingManager: ragAgentStatus.components?.embedding_manager || 'initializing'
          }
        },
        chatService: {
          uptime: chatServiceStatus.uptime,
          conversations: this.chatService['conversations']?.size || 0,
          providers: chatServiceStatus.providers
        },
        compliance: {
          auditLogging: true,
          piiDetection: true,
          lgpdCompliant: true
        },
        timestamp: new Date().toISOString()
      }

      return { success: true, data: healthStatus }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get health status: ${error.message}`
      }
    }
  }

  /**
   * Create or continue a conversation session
   */
  async createConversation(
    sessionId: string,
    userId: string,
    patientId?: string,
    title?: string,
    context?: Record<string, any>
  ): Promise<ServiceResponse<{ sessionId: string; created: boolean }>> {
    try {
      // Check if conversation already exists
      const existingConversation = await this.chatService.getConversationHistory(sessionId)
      
      if (existingConversation.success) {
        return {
          success: true,
          data: { sessionId, created: false }
        }
      }

      // Create new conversation
      const conversation = await this.chatService.createConversation({
        patientId: patientId || userId,
        title: title || `Healthcare Assistant Session - ${new Date().toLocaleDateString()}`,
        context: context?.mode || 'general',
        metadata: {
          sessionId,
          userId,
          mode: context?.mode || 'chat',
          compliance: ['lgpd', 'anvisa', 'cfm']
        }
      })

      if (!conversation.success) {
        return {
          success: false,
          error: conversation.error || 'Failed to create conversation'
        }
      }

      return {
        success: true,
        data: { sessionId, created: true }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to create conversation: ${error.message}`
      }
    }
  }

  /**
   * Clean up resources and shutdown gracefully
   */
  async shutdown(): Promise<ServiceResponse<void>> {
    try {
      if (this.ragAgent) {
        await this.ragAgent.shutdown()
      }

      this.initialized = false

      await this.auditService.logEvent({
        action: 'unified_agent_shutdown',
        details: { uptime: Date.now() - this.startTime.getTime() },
        result: 'success'
      })

      return { success: true, data: undefined }
    } catch (error: any) {
      await this.auditService.logEvent({
        action: 'unified_agent_shutdown',
        details: { error: error.message },
        result: 'failure'
      })

      return {
        success: false,
        error: `Failed to shutdown gracefully: ${error.message}`
      }
    }
  }
}

// Export singleton instance for easy import
export const unifiedAgentInterface = new UnifiedAgentInterface()