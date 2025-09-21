/**
 * AG-UI Protocol Service
 * 
 * Integrates the AG-UI Protocol with the backend services and RAG agent.
 * Provides high-level methods for agent communication and session management.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { AguiProtocol, AguiProtocolConfig } from './protocol';
import {
  AguiQueryMessage,
  AguiResponseMessage,
  AguiMessage,
  AguiSession,
  AguiHealthStatus,
  AguiCapability,
  AguiSource,
  AguiUsageStats,
  AguiAction
} from './types';
import { AgentPermissionService, PermissionContext } from '../permissions';
import { ConversationContextService } from '../conversation';
import { RealtimeSubscriptionService } from '../realtime';
import { ResponseCacheService, createHealthcareCacheConfig } from '../cache/response-cache-service';
import type { ConversationMessage } from '../conversation';
import type { RealtimeEvent } from '../realtime';

export interface AguiServiceConfig extends AguiProtocolConfig {
  ragAgentEndpoint: string;
  enableMetrics: boolean;
  metricsInterval?: number;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
}

export interface QueryContext {
  sessionId: string;
  userId: string;
  patientId?: string;
  userPreferences?: Record<string, any>;
  previousTopics?: string[];
}

export interface QueryResult {
  content: string;
  type: 'text' | 'structured' | 'error';
  sources?: AguiSource[];
  confidence?: number;
  usage?: AguiUsageStats;
  actions?: AguiAction[];
  processingTimeMs: number;
}

export class AguiService extends EventEmitter {
  private protocol: AguiProtocol;
  private config: AguiServiceConfig;
  private activeQueries: Map<string, AbortController> = new Map();
  private metrics: ServiceMetrics;
  private metricsInterval?: NodeJS.Timeout;
  private permissionService: AgentPermissionService;
  private conversationService: ConversationContextService;
  private realtimeService: RealtimeSubscriptionService;
  private cacheService: ResponseCacheService;

  constructor(config: AguiServiceConfig) {
    super();
    this.config = config;
    this.protocol = new AguiProtocol(config);
    this.metrics = this.initializeMetrics();
    
    // Initialize permission service if Supabase config is provided
    if (config.supabaseUrl && config.supabaseServiceKey) {
      this.permissionService = new AgentPermissionService(
        config.supabaseUrl,
        config.supabaseServiceKey
      );
      
      // Initialize conversation context service
      this.conversationService = new ConversationContextService(
        config.supabaseUrl,
        config.supabaseServiceKey
      );
      
      // Initialize real-time subscription service
      this.realtimeService = new RealtimeSubscriptionService(
        config.supabaseUrl,
        config.supabaseServiceKey
      );
      
      // Initialize cache service
      this.cacheService = new ResponseCacheService(createHealthcareCacheConfig());
    }
    
    this.setupEventHandlers();
    
    if (config.enableMetrics && config.metricsInterval) {
      this.startMetricsCollection(config.metricsInterval);
    }
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    this.emit('initializing');
    
    try {
      // Test RAG agent connectivity
      await this.testRagAgentConnectivity();
      
      // Initialize protocol
      this.protocol.getHealthStatus();
      
      this.emit('initialized');
      
    } catch (error) {
      this.emit('initializationError', error);
      throw error;
    }
  }

  /**
   * Process a query through the RAG agent with caching
   */
  async processQuery(
    query: string,
    context: QueryContext,
    options?: {
      streaming?: boolean;
      maxResults?: number;
      timeout?: number;
      includeSources?: boolean;
      skipCache?: boolean;
    }
  ): Promise<QueryResult> {
    const queryId = uuidv4();
    const startTime = Date.now();
    
    try {
      // Create abort controller for timeout
      const abortController = new AbortController();
      this.activeQueries.set(queryId, abortController);
      
      // Check cache first if available and not skipped
      if (this.cacheService && !options?.skipCache) {
        const cachedResponse = await this.cacheService.getCachedResponse({
          query,
          context: {
            patientId: context.patientId,
            userId: context.userId,
            previousTopics: context.previousTopics,
            userPreferences: context.userPreferences
          },
          options
        }, context.userId);

        if (cachedResponse) {
          const cachedResult: QueryResult = {
            content: cachedResponse.content,
            type: cachedResponse.type,
            sources: cachedResponse.sources,
            confidence: cachedResponse.confidence,
            usage: cachedResponse.usage,
            actions: cachedResponse.actions,
            processingTimeMs: Date.now() - startTime
          };

          // Update metrics for cache hit
          this.updateMetrics({
            queryCount: 1,
            processingTimeMs: cachedResult.processingTimeMs,
            success: true
          });

          this.emit('queryCompleted', { queryId, result: cachedResult, context, cached: true });
          return cachedResult;
        }
      }
      
      // Prepare query for RAG agent
      const ragQuery = {
        query,
        session_id: context.sessionId,
        user_id: context.userId,
        patient_id: context.patientId,
        context: {
          patient_id: context.patientId,
          user_id: context.userId,
          preferences: context.userPreferences,
          previous_topics: context.previousTopics
        },
        options
      };

      // Send query to RAG agent
      const response = await this.sendToRagAgent(ragQuery, {
        signal: abortController.signal,
        timeout: options?.timeout || 30000
      });

      // Process response
      const result: QueryResult = {
        content: response.content,
        type: response.type,
        sources: response.sources,
        confidence: response.confidence,
        usage: response.usage,
        actions: response.actions,
        processingTimeMs: Date.now() - startTime
      };

      // Cache the response if caching is enabled
      if (this.cacheService && !options?.skipCache) {
        try {
          await this.cacheService.cacheResponse({
            query,
            context: {
              patientId: context.patientId,
              userId: context.userId,
              previousTopics: context.previousTopics,
              userPreferences: context.userPreferences
            },
            options
          }, response, context.userId, {
            skipCache: false
          });
        } catch (error) {
          console.error('[AguiService] Error caching response:', error);
          // Don't fail the query if caching fails
        }
      }

      // Store user message in conversation context
      if (this.conversationService) {
        try {
          await this.conversationService.storeMessage({
            sessionId: context.sessionId,
            userId: context.userId,
            patientId: context.patientId,
            role: 'user',
            content: query,
            type: 'text',
            metadata: {
              queryIntent: this.extractIntent(query),
              entitiesExtracted: this.extractEntities(query)
            },
            dataClassification: this.classifyData(query)
          });

          // Store assistant response
          await this.conversationService.storeMessage({
            sessionId: context.sessionId,
            userId: context.userId,
            patientId: context.patientId,
            role: 'assistant',
            content: response.content,
            type: response.type,
            metadata: {
              sources: response.sources,
              confidence: response.confidence,
              processingTimeMs: result.processingTimeMs,
              actionTaken: response.actions?.[0]?.type
            },
            dataClassification: this.classifyData(response.content)
          });
        } catch (error) {
          console.error('[AguiService] Error storing conversation context:', error);
          // Don't fail the query if context storage fails
        }
      }

      // Broadcast real-time events
      if (this.realtimeService) {
        try {
          // Broadcast user message event
          await this.realtimeService.broadcastEvent({
            type: 'message',
            sessionId: context.sessionId,
            userId: context.userId,
            patientId: context.patientId,
            payload: {
              messageId: queryId,
              role: 'user',
              content: query,
              messageType: 'text',
              processingTimeMs: result.processingTimeMs
            },
            eventType: 'user_message',
            metadata: {
              source: 'user',
              urgency: 'medium',
              dataClassification: this.classifyData(query)
            }
          });

          // Broadcast assistant response event
          await this.realtimeService.broadcastEvent({
            type: 'message',
            sessionId: context.sessionId,
            userId: context.userId,
            patientId: context.patientId,
            payload: {
              messageId: `response_${queryId}`,
              role: 'assistant',
              content: result.content,
              messageType: result.type,
              sources: result.sources,
              confidence: result.confidence,
              processingTimeMs: result.processingTimeMs
            },
            eventType: 'assistant_response',
            metadata: {
              source: 'assistant',
              urgency: result.type === 'error' ? 'high' : 'medium',
              dataClassification: this.classifyData(result.content)
            }
          });
        } catch (error) {
          console.error('[AguiService] Error broadcasting real-time events:', error);
          // Don't fail the query if real-time broadcasting fails
        }
      }

      // Update metrics
      this.updateMetrics({
        queryCount: 1,
        processingTimeMs: result.processingTimeMs,
        success: true
      });

      this.emit('queryCompleted', { queryId, result, context });
      
      return result;

    } catch (error) {
      // Update metrics
      this.updateMetrics({
        queryCount: 1,
        errorCount: 1,
        success: false
      });

      this.emit('queryError', { queryId, error, context });
      
      if (error.name === 'AbortError') {
        throw new Error('Query timeout');
      }
      
      throw error;
    } finally {
      this.activeQueries.delete(queryId);
    }
  }

  /**
   * Process streaming query
   */
  async processStreamingQuery(
    query: string,
    context: QueryContext,
    onChunk: (chunk: string) => void,
    options?: {
      maxResults?: number;
      timeout?: number;
      includeSources?: boolean;
    }
  ): Promise<QueryResult> {
    const queryId = uuidv4();
    const startTime = Date.now();
    
    try {
      const abortController = new AbortController();
      this.activeQueries.set(queryId, abortController);

      // For streaming, we'll simulate chunks for now
      // In a real implementation, this would use Server-Sent Events or WebSocket streaming
      const response = await this.processQuery(query, context, {
        ...options,
        streaming: true
      });

      // Simulate streaming by breaking response into chunks
      const chunks = this.splitIntoChunks(response.content, 50); // 50 characters per chunk
      
      for (const chunk of chunks) {
        if (abortController.signal.aborted) {
          throw new Error('Query aborted');
        }
        
        onChunk(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming delay
      }

      this.emit('streamingQueryCompleted', { queryId, result: response, context });
      
      return response;

    } catch (error) {
      this.emit('streamingQueryError', { queryId, error, context });
      throw error;
    } finally {
      this.activeQueries.delete(queryId);
    }
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    options?: {
      title?: string;
      context?: Record<string, any>;
      expiresAt?: Date;
    }
  ): Promise<AguiSession> {
    const sessionId = uuidv4();
    const session: AguiSession = {
      id: sessionId,
      userId,
      title: options?.title || 'Healthcare Assistant Session',
      context: options?.context || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: options?.expiresAt?.toISOString() || 
                new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      isActive: true,
      messageCount: 0,
      lastActivity: new Date().toISOString()
    };

    // Store session in database or cache
    await this.storeSession(session);

    this.emit('sessionCreated', session);
    
    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<AguiSession | null> {
    try {
      // Retrieve session from database or cache
      const session = await this.retrieveSession(sessionId);
      
      if (session && new Date(session.expiresAt) > new Date()) {
        return session;
      }
      
      return null;
    } catch (error) {
      this.emit('sessionError', { sessionId, error });
      return null;
    }
  }

  /**
   * Update session
   */
  async updateSession(
    sessionId: string,
    updates: {
      title?: string;
      context?: Record<string, any>;
      expiresAt?: Date;
    }
  ): Promise<AguiSession | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return null;
      }

      // Apply updates
      Object.assign(session, updates, { updatedAt: new Date().toISOString() });
      
      // Store updated session
      await this.storeSession(session);

      this.emit('sessionUpdated', { session, updates });
      
      return session;

    } catch (error) {
      this.emit('sessionError', { sessionId, error });
      return null;
    }
  }

  /**
   * Submit feedback for a query
   */
  async submitFeedback(
    sessionId: string,
    messageId: string,
    rating: number,
    feedback?: string,
    category?: 'accuracy' | 'helpfulness' | 'clarity' | 'completeness'
  ): Promise<void> {
    try {
      const feedbackData = {
        sessionId,
        messageId,
        rating,
        feedback,
        category,
        timestamp: new Date().toISOString()
      };

      // Store feedback in database
      await this.storeFeedback(feedbackData);

      this.updateMetrics({ feedbackCount: 1 });

      this.emit('feedbackSubmitted', feedbackData);

    } catch (error) {
      this.emit('feedbackError', { sessionId, messageId, error });
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<AguiHealthStatus> {
    const protocolHealth = this.protocol.getHealthStatus();
    
    // Test RAG agent connectivity
    let ragAgentHealthy = true;
    try {
      await this.testRagAgentConnectivity();
    } catch (error) {
      ragAgentHealthy = false;
    }

    return {
      ...protocolHealth,
      components: {
        ...protocolHealth.components,
        rag_agent: ragAgentHealthy ? 'healthy' : 'unhealthy'
      }
    };
  }

  /**
   * Get service metrics
   */
  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Abort a running query
   */
  abortQuery(queryId: string): boolean {
    const abortController = this.activeQueries.get(queryId);
    if (abortController) {
      abortController.abort();
      this.activeQueries.delete(queryId);
      this.emit('queryAborted', { queryId });
      return true;
    }
    return false;
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    this.emit('shuttingDown');
    
    // Abort all active queries
    for (const [queryId, abortController] of this.activeQueries) {
      abortController.abort();
    }
    this.activeQueries.clear();
    
    // Stop metrics collection
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    // Shutdown real-time service
    if (this.realtimeService) {
      await this.realtimeService.shutdown();
    }
    
    this.emit('shutdown');
  }

  /**
   * Send query to RAG agent
   */
  private async sendToRagAgent(
    query: any,
    options: {
      signal?: AbortSignal;
      timeout?: number;
    }
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);
    
    try {
      // Combine signals
      const combinedSignal = options.signal ? 
        AbortSignal.any([options.signal, controller.signal]) : 
        controller.signal;

      const response = await fetch(`${this.config.ragAgentEndpoint}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        signal: combinedSignal
      });

      if (!response.ok) {
        throw new Error(`RAG agent error: ${response.status} ${response.statusText}`);
      }

      return await response.json();

    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Test RAG agent connectivity
   */
  private async testRagAgentConnectivity(): Promise<void> {
    const response = await fetch(`${this.config.ragAgentEndpoint}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`RAG agent health check failed: ${response.status}`);
    }
  }

  /**
   * Store session in database
   */
  private async storeSession(session: AguiSession): Promise<void> {
    // This would store the session in your database
    // For now, it's a placeholder implementation
    console.log('Storing session:', session.id);
  }

  /**
   * Retrieve session from database
   */
  private async retrieveSession(sessionId: string): Promise<AguiSession | null> {
    // This would retrieve the session from your database
    // For now, it's a placeholder implementation
    console.log('Retrieving session:', sessionId);
    return null;
  }

  /**
   * Store feedback in database
   */
  private async storeFeedback(feedback: any): Promise<void> {
    // This would store the feedback in your database
    // For now, it's a placeholder implementation
    console.log('Storing feedback:', feedback);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.protocol.on('query', async (data) => {
      try {
        const result = await this.processQuery(
          data.query,
          {
            sessionId: data.session.id,
            userId: data.session.userId,
            patientId: data.query.context?.patientId,
            userPreferences: data.query.context?.userPreferences,
            previousTopics: data.query.context?.previousTopics
          },
          data.query.options
        );

        this.protocol.sendResponse(data.connection.id, result, data.messageId);

      } catch (error) {
        this.protocol.sendError(
          data.connection.ws,
          'INTERNAL_ERROR',
          'Failed to process query'
        );
      }
    });

    this.protocol.on('sessionCreated', (session) => {
      this.emit('sessionCreated', session);
    });

    this.protocol.on('sessionUpdated', (data) => {
      this.emit('sessionUpdated', data);
    });

    this.protocol.on('feedback', async (data) => {
      await this.submitFeedback(
        data.sessionId,
        data.messageId,
        data.rating,
        data.feedback,
        data.category
      );
    });
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): ServiceMetrics {
    return {
      uptime: process.uptime(),
      queryCount: 0,
      errorCount: 0,
      feedbackCount: 0,
      averageProcessingTimeMs: 0,
      lastReset: new Date().toISOString()
    };
  }

  /**
   * Update metrics
   */
  private updateMetrics(updates: Partial<ServiceMetrics>): void {
    Object.assign(this.metrics, updates);
    
    // Calculate average processing time
    if (updates.processingTimeMs && this.metrics.queryCount > 0) {
      this.metrics.averageProcessingTimeMs = 
        (this.metrics.averageProcessingTimeMs * (this.metrics.queryCount - 1) + updates.processingTimeMs) / 
        this.metrics.queryCount;
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(interval: number): void {
    this.metricsInterval = setInterval(() => {
      this.emit('metrics', this.getMetrics());
    }, interval);
  }

  /**
   * Split text into chunks for streaming
   */
  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get WebSocket server instance for integration
   */
  getProtocolInstance(): AguiProtocol {
    return this.protocol;
  }

  /**
   * Create real-time subscription for a user
   */
  async createRealtimeSubscription(
    userId: string,
    options: {
      sessionId?: string;
      eventTypes?: ('message' | 'session_update' | 'context_change' | 'system_event')[];
      includeSystemEvents?: boolean;
      heartbeatInterval?: number;
    } = {}
  ) {
    if (!this.realtimeService) {
      throw new Error('Real-time service not available');
    }

    return await this.realtimeService.createSubscription(userId, options);
  }

  /**
   * Remove real-time subscription
   */
  async removeRealtimeSubscription(subscriptionId: string): Promise<void> {
    if (!this.realtimeService) {
      return;
    }

    await this.realtimeService.removeSubscription(subscriptionId);
  }

  /**
   * Get real-time analytics
   */
  getRealtimeAnalytics() {
    if (!this.realtimeService) {
      return null;
    }

    return this.realtimeService.getAnalytics();
  }

  /**
   * Get user subscriptions
   */
  getUserRealtimeSubscriptions(userId: string) {
    if (!this.realtimeService) {
      return [];
    }

    return this.realtimeService.getUserSubscriptions(userId);
  }

  /**
   * Extract intent from query text
   */
  private extractIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('agendamento') || lowerQuery.includes('consulta') || lowerQuery.includes('appointment')) {
      return 'scheduling';
    } else if (lowerQuery.includes('paciente') || lowerQuery.includes('patient') || lowerQuery.includes('cliente')) {
      return 'patient_inquiry';
    } else if (lowerQuery.includes('financeiro') || lowerQuery.includes('pagamento') || lowerQuery.includes('financial')) {
      return 'financial_inquiry';
    } else if (lowerQuery.includes('exame') || lowerQuery.includes('resultado') || lowerQuery.includes('exam')) {
      return 'results_inquiry';
    } else if (lowerQuery.includes('tratamento') || lowerQuery.includes('medicamento') || lowerQuery.includes('treatment')) {
      return 'treatment_inquiry';
    } else {
      return 'general_inquiry';
    }
  }

  /**
   * Extract entities from query text
   */
  private extractEntities(query: string): string[] {
    const entities: string[] = [];
    
    // Extract potential names (simple implementation)
    const namePattern = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;
    const names = query.match(namePattern);
    if (names) {
      entities.push(...names);
    }
    
    // Extract dates
    const datePattern = /\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/g;
    const dates = query.match(datePattern);
    if (dates) {
      entities.push(...dates);
    }
    
    // Extract phone numbers
    const phonePattern = /\(\d{2}\)\s*\d{4,5}-\d{4}|\d{10,11}/g;
    const phones = query.match(phonePattern);
    if (phones) {
      entities.push(...phones);
    }
    
    return entities;
  }

  /**
   * Classify data sensitivity level
   */
  private classifyData(text: string): ConversationMessage['dataClassification'] {
    const lowerText = text.toLowerCase();
    
    // Check for highly sensitive healthcare information
    if (lowerText.includes('diagnóstico') || 
        lowerText.includes('diagnosis') ||
        lowerText.includes('hiv') ||
        lowerText.includes('câncer') ||
        lowerText.includes('cancer') ||
        lowerText.includes('saúde mental') ||
        lowerText.includes('mental health') ||
        lowerText.includes('doença sexualmente transmissível') ||
        lowerText.includes('std')) {
      return 'restricted';
    }
    
    // Check for confidential healthcare information
    if (lowerText.includes('paciente') ||
        lowerText.includes('patient') ||
        lowerText.includes('médico') ||
        lowerText.includes('doctor') ||
        lowerText.includes('tratamento') ||
        lowerText.includes('treatment') ||
        lowerText.includes('medicação') ||
        lowerText.includes('medication') ||
        lowerText.includes('cpf') ||
        lowerText.includes('rg')) {
      return 'confidential';
    }
    
    // Check for internal operational data
    if (lowerText.includes('agendamento') ||
        lowerText.includes('appointment') ||
        lowerText.includes('consulta') ||
        lowerText.includes('consulta') ||
        lowerText.includes('clinica') ||
        lowerText.includes('clinic')) {
      return 'internal';
    }
    
    // Default to public for general information
    return 'public';
  }

  /**
   * Process CopilotKit request from frontend
   */
  async processCopilotRequest(request: CopilotRequest): Promise<CopilotResponse> {
    const startTime = Date.now();
    
    try {
      logger.info('Processing CopilotKit request', {
        requestId: request.id,
        sessionId: request.sessionId,
        userId: request.userId,
        type: request.type,
      });

      // Convert CopilotKit request to AG-UI format
      const aguiRequest: AguiRequest = {
        id: request.id,
        type: 'query',
        content: request.content,
        sessionId: request.sessionId,
        userId: request.userId,
        metadata: {
          ...request.metadata,
          source: 'copilotkit',
        },
      };

      // Process through AG-UI protocol
      const aguiResponse = await this.processQuery(aguiRequest);

      // Convert AG-UI response to CopilotKit format
      const copilotResponse: CopilotResponse = {
        id: aguiResponse.id,
        type: 'response',
        content: aguiResponse.content,
        sessionId: aguiResponse.sessionId,
        userId: aguiResponse.userId,
        timestamp: aguiResponse.timestamp,
        metadata: {
          ...aguiResponse.metadata,
          processingTime: Date.now() - startTime,
        },
      };

      logger.info('CopilotKit request processed successfully', {
        requestId: request.id,
        sessionId: request.sessionId,
        processingTime: copilotResponse.metadata?.processingTime,
      });

      return copilotResponse;
    } catch (error) {
      logger.error('Failed to process CopilotKit request', error, {
        requestId: request.id,
        sessionId: request.sessionId,
      });

      const errorResponse: CopilotResponse = {
        id: request.id,
        type: 'error',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
        sessionId: request.sessionId,
        userId: request.userId,
        timestamp: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: Date.now() - startTime,
        },
      };

      return errorResponse;
    }
  }
}

// Metrics interface
export interface ServiceMetrics {
  uptime: number;
  queryCount: number;
  errorCount: number;
  feedbackCount: number;
  averageProcessingTimeMs: number;
  lastReset: string;
}