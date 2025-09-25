/**
 * Unified Chat Service - Main Orchestration Class
 * @package `@neonpro/chat-services`
 */

import {
  UnifiedChatServiceConfig,
  EnhancedChatSession,
  EnhancedChatMessage,
  ChatServiceError,
  ChatSessionCreationParams,
  ChatMessageCreationParams,
  ChatSearchQuery,
  ChatSearchResults
} from '../types/chat';

import {
  ClinicalChatService,
  AestheticChatService,
  PatientEducationChatService,
  EmergencyChatService
} from './healthcare';

import {
  HealthcareComplianceService
} from './compliance';

import {
  ChatAnalyticsService,
  ChatMetrics,
  SessionMetrics,
  UserMetrics
} from './analytics';

import {
  AGUIProtocolService
} from './agui-protocol';

import {
  WebSocketService
} from './websocket';

import {
  CopilotKitIntegrationService
} from './copilotkit';

import {
  ProviderManagementService
} from '@neonpro/ai-services';

import { Logger } from '@neonpro/core-services';

/**
 * Main orchestration service for unified chat functionality
 */
export class UnifiedChatService {
  private static instance: UnifiedChatService | null = null;
  private config: UnifiedChatServiceConfig;
  private logger: Logger;
  private isInitialized: boolean = false;

  // Service instances
  private clinicalService: ClinicalChatService;
  private aestheticService: AestheticChatService;
  private educationService: PatientEducationChatService;
  private emergencyService: EmergencyChatService;
  private complianceService: HealthcareComplianceService;
  private analyticsService: ChatAnalyticsService;
  private aguiService: AGUIProtocolService;
  private websocketService: WebSocketService;
  private copilotKitService: CopilotKitIntegrationService;
  private providerService: ProviderManagementService;

  // Active sessions cache
  private activeSessions: Map<string, EnhancedChatSession> = new Map();
  private sessionMetrics: Map<string, SessionMetrics> = new Map();

  /**
   * Get singleton instance
   */
  public static getInstance(config?: UnifiedChatServiceConfig): UnifiedChatService {
    if (!UnifiedChatService.instance) {
      UnifiedChatService.instance = new UnifiedChatService(config);
    }
    return UnifiedChatService.instance;
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config?: UnifiedChatServiceConfig) {
    this.config = config || this.getDefaultConfig();
    this.logger = new Logger('UnifiedChatService');
    
    // Initialize service instances
    this.clinicalService = new ClinicalChatService(this.config.clinical);
    this.aestheticService = new AestheticChatService(this.config.aesthetic);
    this.educationService = new PatientEducationChatService(this.config.education);
    this.emergencyService = new EmergencyChatService(this.config.emergency);
    this.complianceService = new HealthcareComplianceService(this.config.compliance);
    this.analyticsService = new ChatAnalyticsService(this.config.analytics);
    this.aguiService = new AGUIProtocolService(this.config.agui);
    this.websocketService = new WebSocketService(this.config.websocket);
    this.copilotKitService = new CopilotKitIntegrationService(this.config.copilotKit);
    this.providerService = ProviderManagementService.getInstance();
  }

  /**
   * Initialize the unified chat service
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Unified Chat Service...');

      // Initialize all services in parallel
      const initializationPromises = [
        this.clinicalService.initialize(),
        this.aestheticService.initialize(),
        this.educationService.initialize(),
        this.emergencyService.initialize(),
        this.complianceService.initialize(),
        this.analyticsService.initialize(),
        this.aguiService.initialize(),
        this.websocketService.initialize(),
        this.copilotKitService.initialize()
      ];

      await Promise.all(initializationPromises);

      // Set up event handlers and connections
      await this.setupEventHandlers();
      await this.setupConnections();

      this.isInitialized = true;
      this.logger.info('Unified Chat Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Unified Chat Service', { error });
      throw new ChatServiceError('INITIALIZATION_FAILED', 'Failed to initialize unified chat service', error);
    }
  }

  /**
   * Create a new chat session
   */
  public async createSession(params: ChatSessionCreationParams): Promise<EnhancedChatSession> {
    try {
      this.ensureInitialized();

      // Compliance check before creating session
      const complianceCheck = await this.complianceService.checkSessionCreation(params);
      if (!complianceCheck.passed) {
        throw new ChatServiceError('COMPLIANCE_CHECK_FAILED', 'Session creation failed compliance check', complianceCheck);
      }

      // Get appropriate service based on session type
      const service = this.getServiceByType(params.type);
      const session = await service.createSession(params);

      // Store session in cache
      this.activeSessions.set(session.id, session);

      // Initialize session metrics
      const metrics = await this.analyticsService.initializeSessionMetrics(session.id);
      this.sessionMetrics.set(session.id, metrics);

      // Emit session created event
      await this.emitSessionEvent('session_created', session);

      this.logger.info('Chat session created successfully', { sessionId: session.id, type: params.type });
      return session;
    } catch (error) {
      this.logger.error('Failed to create chat session', { error, params });
      throw error instanceof ChatServiceError ? error : new ChatServiceError('SESSION_CREATION_FAILED', 'Failed to create chat session', error);
    }
  }

  /**
   * Send a message in a chat session
   */
  public async sendMessage(params: ChatMessageCreationParams): Promise<EnhancedChatMessage> {
    try {
      this.ensureInitialized();

      // Get session from cache or database
      const session = await this.getSession(params.sessionId);
      
      // Compliance check for message
      const complianceCheck = await this.complianceService.checkMessageContent(params.content, session.type);
      if (!complianceCheck.passed) {
        throw new ChatServiceError('COMPLIANCE_CHECK_FAILED', 'Message failed compliance check', complianceCheck);
      }

      // Get appropriate service
      const service = this.getServiceByType(session.type);
      const message = await service.sendMessage(params);

      // Update session metrics
      await this.updateSessionMetrics(params.sessionId, { messageCount: 1 });

      // Process message with AI if needed
      if (params.requireAIResponse) {
        await this.processAIResponse(message, session);
      }

      // Emit message sent event
      await this.emitMessageEvent('message_sent', message);

      this.logger.info('Message sent successfully', { messageId: message.id, sessionId: params.sessionId });
      return message;
    } catch (error) {
      this.logger.error('Failed to send message', { error, params });
      throw error instanceof ChatServiceError ? error : new ChatServiceError('MESSAGE_SEND_FAILED', 'Failed to send message', error);
    }
  }

  /**
   * Get chat session details
   */
  public async getSession(sessionId: string): Promise<EnhancedChatSession> {
    try {
      this.ensureInitialized();

      // Check cache first
      if (this.activeSessions.has(sessionId)) {
        return this.activeSessions.get(sessionId)!;
      }

      // Get from appropriate service
      const sessionType = await this.determineSessionType(sessionId);
      const service = this.getServiceByType(sessionType);
      const session = await service.getSession(sessionId);

      // Cache session
      this.activeSessions.set(sessionId, session);

      return session;
    } catch (error) {
      this.logger.error('Failed to get session', { error, sessionId });
      throw error instanceof ChatServiceError ? error : new ChatServiceError('SESSION_GET_FAILED', 'Failed to get session', error);
    }
  }

  /**
   * Get session messages
   */
  public async getSessionMessages(sessionId: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<EnhancedChatMessage[]> {
    try {
      this.ensureInitialized();

      const session = await this.getSession(sessionId);
      const service = this.getServiceByType(session.type);
      const messages = await service.getSessionMessages(sessionId, options);

      return messages;
    } catch (error) {
      this.logger.error('Failed to get session messages', { error, sessionId });
      throw error instanceof ChatServiceError ? error : new ChatServiceError('MESSAGES_GET_FAILED', 'Failed to get session messages', error);
    }
  }

  /**
   * Search chat sessions and messages
   */
  public async search(query: ChatSearchQuery): Promise<ChatSearchResults> {
    try {
      this.ensureInitialized();

      // Compliance check for search
      const complianceCheck = await this.complianceService.checkSearchQuery(query);
      if (!complianceCheck.passed) {
        throw new ChatServiceError('COMPLIANCE_CHECK_FAILED', 'Search query failed compliance check', complianceCheck);
      }

      const results = await this.analyticsService.searchChatData(query);
      
      this.logger.info('Chat search completed', { query, resultCount: results.total });
      return results;
    } catch (error) {
      this.logger.error('Failed to search chat data', { error, query });
      throw error instanceof ChatServiceError ? error : new ChatServiceError('SEARCH_FAILED', 'Failed to search chat data', error);
    }
  }

  /**
   * End a chat session
   */
  public async endSession(sessionId: string, reason?: string): Promise<EnhancedChatSession> {
    try {
      this.ensureInitialized();

      const session = await this.getSession(sessionId);
      const service = this.getServiceByType(session.type);
      const updatedSession = await service.endSession(sessionId, reason);

      // Remove from active sessions cache
      this.activeSessions.delete(sessionId);

      // Finalize session metrics
      await this.analyticsService.finalizeSessionMetrics(sessionId);

      // Emit session ended event
      await this.emitSessionEvent('session_ended', updatedSession);

      this.logger.info('Chat session ended successfully', { sessionId, reason });
      return updatedSession;
    } catch (error) {
      this.logger.error('Failed to end session', { error, sessionId });
      throw error instanceof ChatServiceError ? error : new ChatServiceError('SESSION_END_FAILED', 'Failed to end session', error);
    }
  }

  /**
   * Get service health status
   */
  public async getHealthStatus(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      clinical: 'healthy' | 'degraded' | 'unhealthy';
      aesthetic: 'healthy' | 'degraded' | 'unhealthy';
      education: 'healthy' | 'degraded' | 'unhealthy';
      emergency: 'healthy' | 'degraded' | 'unhealthy';
      compliance: 'healthy' | 'degraded' | 'unhealthy';
      analytics: 'healthy' | 'degraded' | 'unhealthy';
      agui: 'healthy' | 'degraded' | 'unhealthy';
      websocket: 'healthy' | 'degraded' | 'unhealthy';
      copilotKit: 'healthy' | 'degraded' | 'unhealthy';
      providers: 'healthy' | 'degraded' | 'unhealthy';
    };
    metrics: {
      activeSessions: number;
      totalSessions: number;
      messagesPerMinute: number;
      averageResponseTime: number;
      uptime: number;
    };
  }> {
    try {
      const serviceHealthChecks = await Promise.allSettled([
        this.clinicalService.getHealthStatus(),
        this.aestheticService.getHealthStatus(),
        this.educationService.getHealthStatus(),
        this.emergencyService.getHealthStatus(),
        this.complianceService.getHealthStatus(),
        this.analyticsService.getHealthStatus(),
        this.aguiService.getHealthStatus(),
        this.websocketService.getHealthStatus(),
        this.copilotKitService.getHealthStatus(),
        this.providerService.getHealthStatus()
      ]);

      const services = {
        clinical: this.getServiceHealthStatus(serviceHealthChecks[0]),
        aesthetic: this.getServiceHealthStatus(serviceHealthChecks[1]),
        education: this.getServiceHealthStatus(serviceHealthChecks[2]),
        emergency: this.getServiceHealthStatus(serviceHealthChecks[3]),
        compliance: this.getServiceHealthStatus(serviceHealthChecks[4]),
        analytics: this.getServiceHealthStatus(serviceHealthChecks[5]),
        agui: this.getServiceHealthStatus(serviceHealthChecks[6]),
        websocket: this.getServiceHealthStatus(serviceHealthChecks[7]),
        copilotKit: this.getServiceHealthStatus(serviceHealthChecks[8]),
        providers: this.getServiceHealthStatus(serviceHealthChecks[9])
      };

      const overall = this.calculateOverallHealth(services);
      const metrics = await this.analyticsService.getSystemMetrics();

      return { overall, services, metrics };
    } catch (error) {
      this.logger.error('Failed to get health status', { error });
      throw new ChatServiceError('HEALTH_CHECK_FAILED', 'Failed to get health status', error);
    }
  }

  /**
   * Get real-time analytics dashboard data
   */
  public async getDashboardData(): Promise<{
    sessions: SessionMetrics[];
    users: UserMetrics[];
    system: ChatMetrics;
    alerts: Array<{
      type: string;
      severity: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      timestamp: Date;
    }>;
  }> {
    try {
      this.ensureInitialized();

      const [sessions, users, system, alerts] = await Promise.all([
        this.analyticsService.getActiveSessionMetrics(),
        this.analyticsService.getUserMetrics(),
        this.analyticsService.getSystemMetrics(),
        this.analyticsService.getActiveAlerts()
      ]);

      return { sessions, users, system, alerts };
    } catch (error) {
      this.logger.error('Failed to get dashboard data', { error });
      throw new ChatServiceError('DASHBOARD_DATA_FAILED', 'Failed to get dashboard data', error);
    }
  }

  /**
   * Process AI response for a message
   */
  private async processAIResponse(message: EnhancedChatMessage, session: EnhancedChatSession): Promise<void> {
    try {
      // Get AI provider
      const provider = await this.providerService.getBestProvider();
      
      // Create AI prompt based on session type and message content
      const prompt = this.createAIPrompt(message, session);
      
      // Get AI completion
      const response = await provider.complete(prompt, {
        temperature: 0.7,
        maxTokens: 500,
        context: session.healthcareContext
      });

      // Create AI response message
      const aiMessage: ChatMessageCreationParams = {
        sessionId: session.id,
        content: response.content,
        role: 'assistant',
        provider: provider.name,
        metadata: {
          aiResponse: true,
          confidence: response.confidence,
          tokensUsed: response.usage?.totalTokens || 0
        }
      };

      // Send AI response
      const service = this.getServiceByType(session.type);
      await service.sendMessage(aiMessage);

      this.logger.info('AI response processed successfully', { 
        messageId: message.id, 
        sessionId: session.id,
        provider: provider.name 
      });
    } catch (error) {
      this.logger.error('Failed to process AI response', { error, messageId: message.id });
      // Don't throw here - AI response failure shouldn't break the main flow
    }
  }

  /**
   * Create AI prompt based on session type and message
   */
  private createAIPrompt(message: EnhancedChatMessage, session: EnhancedChatSession): string {
    const context = session.healthcareContext;
    
    switch (session.type) {
      case 'clinical':
        return `As a clinical AI assistant, please respond to this patient message: "${message.content}"
         Patient context: ${JSON.stringify(context)}
         Provide professional, accurate, and compassionate advice.`;
         
      case 'aesthetic':
        return `As an aesthetic medicine AI assistant, please respond to this client message: "${message.content}"
         Client context: ${JSON.stringify(context)}
         Provide professional aesthetic consultation and recommendations.`;
         
      case 'education':
        return `As a patient education AI assistant, please respond to this educational query: "${message.content}"
         Patient context: ${JSON.stringify(context)}
         Provide clear, accurate educational information.`;
         
      case 'emergency':
        return `As an emergency medical AI assistant, please respond to this urgent message: "${message.content}"
         Emergency context: ${JSON.stringify(context)}
         Provide immediate, life-saving guidance and recommend emergency services if needed.`;
         
      default:
        return `As a healthcare AI assistant, please respond to this message: "${message.content}"
         Context: ${JSON.stringify(context)}
         Provide professional healthcare assistance.`;
    }
  }

  /**
   * Get appropriate service by session type
   */
  private getServiceByType(type: string) {
    switch (type) {
      case 'clinical':
        return this.clinicalService;
      case 'aesthetic':
        return this.aestheticService;
      case 'education':
        return this.educationService;
      case 'emergency':
        return this.emergencyService;
      default:
        throw new ChatServiceError('INVALID_SESSION_TYPE', `Invalid session type: ${type}`);
    }
  }

  /**
   * Determine session type from session ID
   */
  private async determineSessionType(sessionId: string): Promise<string> {
    // This would typically query the database to determine session type
    // For now, we'll use a simple heuristic or cache lookup
    const session = this.activeSessions.get(sessionId);
    if (session) {
      return session.type;
    }
    
    // Fallback to querying all services
    const services = [this.clinicalService, this.aestheticService, this.educationService, this.emergencyService];
    
    for (const service of services) {
      try {
        await service.getSession(sessionId);
        return service.constructor.name.replace('Service', '').toLowerCase();
      } catch {
        // Continue to next service
      }
    }
    
    throw new ChatServiceError('SESSION_NOT_FOUND', `Session not found: ${sessionId}`);
  }

  /**
   * Setup event handlers
   */
  private async setupEventHandlers(): Promise<void> {
    // Setup WebSocket event handlers
    this.websocketService.on('message', this.handleWebSocketMessage.bind(this));
    this.websocketService.on('connection', this.handleWebSocketConnection.bind(this));
    this.websocketService.on('disconnection', this.handleWebSocketDisconnection.bind(this));

    // Setup AG-UI event handlers
    this.aguiService.on('session_update', this.handleAguiSessionUpdate.bind(this));
    this.aguiService.on('message', this.handleAguiMessage.bind(this));
    this.aguiService.on('emergency', this.handleAguiEmergency.bind(this));

    // Setup compliance event handlers
    this.complianceService.on('violation', this.handleComplianceViolation.bind(this));
    this.complianceService.on('alert', this.handleComplianceAlert.bind(this));

    // Setup analytics event handlers
    this.analyticsService.on('metric_update', this.handleAnalyticsUpdate.bind(this));
    this.analyticsService.on('alert', this.handleAnalyticsAlert.bind(this));
  }

  /**
   * Setup connections
   */
  private async setupConnections(): Promise<void> {
    // Connect to WebSocket server
    await this.websocketService.connect();

    // Connect to AG-UI protocol
    await this.aguiService.connect();

    // Setup CopilotKit integration
    await this.copilotKitService.setup();
  }

  /**
   * Update session metrics
   */
  private async updateSessionMetrics(sessionId: string, updates: Partial<SessionMetrics>): Promise<void> {
    const metrics = this.sessionMetrics.get(sessionId);
    if (metrics) {
      Object.assign(metrics, updates);
      await this.analyticsService.updateSessionMetrics(sessionId, updates);
    }
  }

  /**
   * Emit session event
   */
  private async emitSessionEvent(eventType: string, session: EnhancedChatSession): Promise<void> {
    const event = {
      type: eventType,
      sessionId: session.id,
      sessionType: session.type,
      timestamp: new Date(),
      data: session
    };

    await Promise.all([
      this.websocketService.broadcast(event),
      this.aguiService.emitEvent(eventType, event),
      this.analyticsService.trackEvent(event)
    ]);
  }

  /**
   * Emit message event
   */
  private async emitMessageEvent(eventType: string, message: EnhancedChatMessage): Promise<void> {
    const event = {
      type: eventType,
      messageId: message.id,
      sessionId: message.sessionId,
      timestamp: new Date(),
      data: message
    };

    await Promise.all([
      this.websocketService.broadcast(event),
      this.aguiService.emitEvent(eventType, event),
      this.analyticsService.trackEvent(event)
    ]);
  }

  /**
   * Event handlers
   */
  private async handleWebSocketMessage(event: any): Promise<void> {
    this.logger.debug('WebSocket message received', { event });
    // Handle WebSocket message based on type
  }

  private async handleWebSocketConnection(connection: any): Promise<void> {
    this.logger.debug('WebSocket connection established', { connection });
    // Handle new WebSocket connection
  }

  private async handleWebSocketDisconnection(connection: any): Promise<void> {
    this.logger.debug('WebSocket connection lost', { connection });
    // Handle WebSocket disconnection
  }

  private async handleAguiSessionUpdate(update: any): Promise<void> {
    this.logger.debug('AG-UI session update received', { update });
    // Handle AG-UI session update
  }

  private async handleAguiMessage(message: any): Promise<void> {
    this.logger.debug('AG-UI message received', { message });
    // Handle AG-UI message
  }

  private async handleAguiEmergency(emergency: any): Promise<void> {
    this.logger.warn('AG-UI emergency received', { emergency });
    // Handle AG-UI emergency
    await this.handleEmergency(emergency);
  }

  private async handleComplianceViolation(violation: any): Promise<void> {
    this.logger.warn('Compliance violation detected', { violation });
    // Handle compliance violation
  }

  private async handleComplianceAlert(alert: any): Promise<void> {
    this.logger.info('Compliance alert received', { alert });
    // Handle compliance alert
  }

  private async handleAnalyticsUpdate(update: any): Promise<void> {
    this.logger.debug('Analytics update received', { update });
    // Handle analytics update
  }

  private async handleAnalyticsAlert(alert: any): Promise<void> {
    this.logger.info('Analytics alert received', { alert });
    // Handle analytics alert
  }

  private async handleEmergency(emergency: any): Promise<void> {
    this.logger.error('Emergency situation detected', { emergency });
    
    // Broadcast emergency alert
    await this.websocketService.broadcast({
      type: 'emergency_alert',
      severity: emergency.severity,
      message: emergency.message,
      timestamp: new Date()
    });

    // Trigger emergency protocols
    await this.emergencyService.handleEmergency(emergency);

    // Notify relevant parties
    await this.complianceService.handleEmergencyCompliance(emergency);
  }

  /**
   * Utility methods
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new ChatServiceError('SERVICE_NOT_INITIALIZED', 'Unified Chat Service is not initialized');
    }
  }

  private getServiceHealthStatus(result: PromiseSettledResult<any>): 'healthy' | 'degraded' | 'unhealthy' {
    if (result.status === 'fulfilled' && result.value?.status === 'healthy') {
      return 'healthy';
    } else if (result.status === 'fulfilled' && result.value?.status === 'degraded') {
      return 'degraded';
    }
    return 'unhealthy';
  }

  private calculateOverallHealth(services: Record<string, 'healthy' | 'degraded' | 'unhealthy'>): 'healthy' | 'degraded' | 'unhealthy' {
    const values = Object.values(services);
    const unhealthyCount = values.filter(status => status === 'unhealthy').length;
    const degradedCount = values.filter(status => status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (degradedCount > values.length * 0.3) {
      return 'degraded';
    }
    return 'healthy';
  }

  private getDefaultConfig(): UnifiedChatServiceConfig {
    return {
      clinical: {},
      aesthetic: {},
      education: {},
      emergency: {},
      compliance: {},
      analytics: {},
      agui: {
        url: 'ws://localhost:8080/agui',
        timeout: 30000,
        retries: 3
      },
      websocket: {
        url: 'ws://localhost:8080/ws',
        timeout: 30000,
        retries: 3
      },
      copilotKit: {},
      logging: {
        level: 'info',
        enableConsole: true,
        enableFile: true
      }
    };
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down Unified Chat Service...');

      // Shutdown all services
      const shutdownPromises = [
        this.clinicalService.shutdown(),
        this.aestheticService.shutdown(),
        this.educationService.shutdown(),
        this.emergencyService.shutdown(),
        this.complianceService.shutdown(),
        this.analyticsService.shutdown(),
        this.aguiService.shutdown(),
        this.websocketService.shutdown(),
        this.copilotKitService.shutdown()
      ];

      await Promise.allSettled(shutdownPromises);

      // Clear caches
      this.activeSessions.clear();
      this.sessionMetrics.clear();

      this.isInitialized = false;
      this.logger.info('Unified Chat Service shutdown completed');
    } catch (error) {
      this.logger.error('Error during shutdown', { error });
      throw error;
    }
  }
}