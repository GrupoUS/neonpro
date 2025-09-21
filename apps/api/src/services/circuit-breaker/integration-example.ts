/**
 * Circuit Breaker Integration Examples
 * T083 - Service Reliability Integration
 *
 * Examples showing how to integrate circuit breakers with existing services
 * for healthcare compliance and reliability.
 */

import {
  CircuitBreakerService,
  HEALTHCARE_CIRCUIT_CONFIG,
  RequestContext,
  STANDARD_CIRCUIT_CONFIG,
  withCircuitBreaker,
} from './circuit-breaker-service';
import {
  ExternalServiceHealthChecker,
  HEALTHCARE_HEALTH_CONFIG,
  ServiceDependency,
} from './health-checker';

// Example 1: Enhanced AG-UI Service with Circuit Breaker
export class AguiServiceWithCircuitBreaker {
  private ragAgentCircuitBreaker: CircuitBreakerService;
  private databaseCircuitBreaker: CircuitBreakerService;
  private healthChecker: ExternalServiceHealthChecker;

  constructor(config: any) {
    // Create circuit breakers for different external dependencies
    this.ragAgentCircuitBreaker = new CircuitBreakerService({
      ...HEALTHCARE_CIRCUIT_CONFIG,
      customFallback: this.createRagAgentFallback(),
    });

    this.databaseCircuitBreaker = new CircuitBreakerService({
      ...HEALTHCARE_CIRCUIT_CONFIG,
      failureThreshold: 3,
      resetTimeout: 30000,
      customFallback: this.createDatabaseFallback(),
    });

    // Initialize health checker
    this.healthChecker = new ExternalServiceHealthChecker(HEALTHCARE_HEALTH_CONFIG);

    // Register services for health monitoring
    this.registerServicesForHealthMonitoring();
  }

  /**
   * Example of processing query with circuit breaker protection
   */
  async processQueryWithCircuitBreaker(
    query: string,
    context: any,
    options?: any,
  ): Promise<any> {
    const requestContext: RequestContext = {
      userId: context.userId,
      sessionId: context.sessionId,
      patientId: context.patientId,
      endpoint: '/api/ai/data-agent',
      method: 'POST',
      service: 'rag-agent',
      timestamp: new Date(),
      metadata: {
        queryIntent: this.extractIntent(query),
        dataClassification: this.classifyData(query),
      },
    };

    // Execute with circuit breaker protection
    return this.ragAgentCircuitBreaker.execute(
      () => this.sendToRagAgent(query, context),
      requestContext,
      this.createFallbackResponse(query, context),
    );
  }

  /**
   * Example of database operation with circuit breaker
   */
  async storeConversationWithCircuitBreaker(message: any): Promise<void> {
    const requestContext: RequestContext = {
      userId: message.userId,
      sessionId: message.sessionId,
      patientId: message.patientId,
      endpoint: 'database',
      method: 'INSERT',
      service: 'conversation-storage',
      timestamp: new Date(),
      metadata: {
        operation: 'store_message',
        dataClassification: message.dataClassification,
      },
    };

    return this.databaseCircuitBreaker.execute(
      () => this.storeMessageInDatabase(message),
      requestContext,
    );
  }

  /**
   * Send query to RAG agent (original method wrapped in circuit breaker)
   */
  private async sendToRagAgent(query: string, context: any): Promise<any> {
    const response = await fetch(`${process.env.RAG_AGENT_ENDPOINT}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RAG_AGENT_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        session_id: context.sessionId,
        user_id: context.userId,
        patient_id: context.patientId,
      }),
    });

    if (!response.ok) {
      throw new Error(`RAG agent error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Store message in database (original method wrapped in circuit breaker)
   */
  private async storeMessageInDatabase(message: any): Promise<void> {
    // Database operation would go here
    console.log('Storing message in database:', message.id);
  }

  /**
   * Create fallback for RAG agent failures
   */
  private createRagAgentFallback() {
    return async (error: Error, context?: RequestContext) => {
      console.log('RAG Agent fallback activated:', error.message);

      // For healthcare-critical queries, provide a safe response
      if (context?.metadata?.dataClassification === 'restricted') {
        return {
          content:
            'Desculpe, estou temporariamente com problemas para acessar informações médicas detalhadas. Por favor, tente novamente em alguns minutos ou entre em contato com suporte.',
          type: 'error',
          confidence: 0,
          sources: [],
          fallback: true,
          error: 'SERVICE_UNAVAILABLE',
        };
      }

      // For general queries, provide cached or simplified response
      return {
        content:
          'Estou experiencing dificuldades técnicas no momento. Por favor, tente novamente ou entre em contato com o suporte.',
        type: 'error',
        confidence: 0,
        sources: [],
        fallback: true,
        error: 'SERVICE_UNAVAILABLE',
      };
    };
  }

  /**
   * Create fallback for database failures
   */
  private createDatabaseFallback() {
    return async (error: Error, context?: RequestContext) => {
      console.log('Database fallback activated:', error.message);

      // For database failures, we might want to queue the operation
      // or temporarily store in memory/cache

      // Don't throw error - just log and continue
      console.warn('Database operation failed, operation skipped:', {
        error: error.message,
        context,
      });
    };
  }

  /**
   * Create fallback response
   */
  private createFallbackResponse(query: string, context: any) {
    return {
      content:
        'Desculpe, estou temporariamente indisponível. Por favor, tente novamente em alguns minutos.',
      type: 'error',
      confidence: 0,
      sources: [],
      fallback: true,
      error: 'SERVICE_UNAVAILABLE',
    };
  }

  /**
   * Register services for health monitoring
   */
  private registerServicesForHealthMonitoring(): void {
    // Register RAG agent service
    this.healthChecker.registerService({
      name: 'rag-agent',
      type: 'external',
      endpoint: process.env.RAG_AGENT_ENDPOINT || 'http://localhost:3001',
      description: 'RAG AI Agent for healthcare queries',
      healthcareCritical: true,
      dataSensitivity: 'high',
      requiredFor: ['ai-assistant', 'patient-queries', 'diagnostic-support'],
    });

    // Register database service
    this.healthChecker.registerService({
      name: 'database',
      type: 'database',
      endpoint: process.env.DATABASE_URL || 'postgresql://localhost:5432/neonpro',
      description: 'Primary database for patient data and conversations',
      healthcareCritical: true,
      dataSensitivity: 'critical',
      requiredFor: ['all-operations'],
    });

    // Register cache service
    this.healthChecker.registerService({
      name: 'redis-cache',
      type: 'cache',
      endpoint: process.env.REDIS_URL || 'redis://localhost:6379',
      description: 'Redis cache for performance optimization',
      healthcareCritical: false,
      dataSensitivity: 'medium',
      requiredFor: ['performance', 'caching'],
    });
  }

  /**
   * Get comprehensive health status
   */
  getHealthStatus() {
    return this.healthChecker.getComprehensiveHealthStatus();
  }

  /**
   * Get circuit breaker metrics
   */
  getCircuitBreakerMetrics() {
    return {
      ragAgent: this.ragAgentCircuitBreaker.getMetrics(),
      database: this.databaseCircuitBreaker.getMetrics(),
    };
  }

  // Helper methods (simplified from original service)
  private extractIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('agendamento') || lowerQuery.includes('consulta')) {
      return 'scheduling';
    } else if (lowerQuery.includes('paciente') || lowerQuery.includes('patient')) {
      return 'patient_inquiry';
    }
    return 'general_inquiry';
  }

  private classifyData(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('diagnóstico') || lowerText.includes('hiv')) {
      return 'restricted';
    } else if (lowerText.includes('paciente') || lowerText.includes('médico')) {
      return 'confidential';
    }
    return 'public';
  }
}

// Example 2: Google Calendar Service with Circuit Breaker
export class GoogleCalendarServiceWithCircuitBreaker {
  private circuitBreaker: CircuitBreakerService;
  private healthChecker: ExternalServiceHealthChecker;

  constructor() {
    this.circuitBreaker = new CircuitBreakerService({
      ...STANDARD_CIRCUIT_CONFIG,
      failureThreshold: 5,
      resetTimeout: 60000,
      healthcareCritical: false, // Calendar is not healthcare-critical
      customFallback: this.createCalendarFallback(),
    });

    this.healthChecker = new ExternalServiceHealthChecker(STANDARD_HEALTH_CONFIG);
    this.registerForHealthMonitoring();
  }

  /**
   * Connect to Google Calendar with circuit breaker protection
   */
  async connectWithCircuitBreaker(userId: string, code: string): Promise<any> {
    const requestContext: RequestContext = {
      userId,
      endpoint: 'https://accounts.google.com/o/oauth2/token',
      method: 'POST',
      service: 'google-calendar',
      timestamp: new Date(),
      metadata: {
        operation: 'oauth_token_exchange',
      },
    };

    return this.circuitBreaker.execute(
      () => this.exchangeCodeForToken(code, userId),
      requestContext,
    );
  }

  /**
   * Sync calendar events with circuit breaker protection
   */
  async syncEventsWithCircuitBreaker(userId: string, events: any[]): Promise<any> {
    const requestContext: RequestContext = {
      userId,
      endpoint: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      method: 'POST',
      service: 'google-calendar',
      timestamp: new Date(),
      metadata: {
        operation: 'sync_events',
        eventCount: events.length,
      },
    };

    return this.circuitBreaker.execute(
      () => this.syncEventsToGoogle(userId, events),
      requestContext,
      { success: false, synced: 0, failed: events.length }, // Fallback value
    );
  }

  private async exchangeCodeForToken(code: string, userId: string): Promise<any> {
    const response = await fetch('https://accounts.google.com/o/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return await response.json();
  }

  private async syncEventsToGoogle(userId: string, events: any[]): Promise<any> {
    // Calendar sync logic would go here
    return { success: true, synced: events.length, failed: 0 };
  }

  private createCalendarFallback() {
    return async (error: Error, context?: RequestContext) => {
      console.log('Google Calendar fallback activated:', error.message);

      // For calendar sync failures, return a failure response
      // The system can retry later or use local storage
      return {
        success: false,
        error: 'CALENDAR_SERVICE_UNAVAILABLE',
        message: 'Calendar sync failed, will retry later',
        timestamp: new Date().toISOString(),
      };
    };
  }

  private registerForHealthMonitoring(): void {
    this.healthChecker.registerService({
      name: 'google-calendar',
      type: 'external',
      endpoint: 'https://www.googleapis.com/calendar/v3',
      description: 'Google Calendar API for appointment synchronization',
      healthcareCritical: false,
      dataSensitivity: 'medium',
      requiredFor: ['appointment-sync', 'calendar-integration'],
    });
  }
}

// Example 3: AI Agent Service with Circuit Breaker
export class AIAgentServiceWithCircuitBreaker {
  private circuitBreaker: CircuitBreakerService;
  private healthChecker: ExternalServiceHealthChecker;

  constructor() {
    this.circuitBreaker = new CircuitBreakerService({
      ...HEALTHCARE_CIRCUIT_CONFIG,
      failureThreshold: 3,
      resetTimeout: 45000,
      healthcareCritical: true,
      customFallback: this.createAIAgentFallback(),
    });

    this.healthChecker = new ExternalServiceHealthChecker(HEALTHCARE_HEALTH_CONFIG);
    this.registerForHealthMonitoring();
  }

  /**
   * Process AI agent request with circuit breaker protection
   */
  async processRequestWithCircuitBreaker(
    request: any,
    context: any,
  ): Promise<any> {
    const requestContext: RequestContext = {
      userId: context.userId,
      sessionId: context.sessionId,
      patientId: context.patientId,
      endpoint: '/api/ai/agent',
      method: 'POST',
      service: 'ai-agent',
      timestamp: new Date(),
      metadata: {
        requestType: request.type,
        dataClassification: this.classifyRequestData(request),
      },
    };

    return this.circuitBreaker.execute(
      () => this.processAIRequest(request, context),
      requestContext,
      this.createAIFallbackResponse(request),
    );
  }

  private async processAIRequest(request: any, context: any): Promise<any> {
    const response = await fetch(`${process.env.AI_AGENT_ENDPOINT}/api/ai/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_AGENT_API_KEY}`,
      },
      body: JSON.stringify({
        ...request,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Agent error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private createAIAgentFallback() {
    return async (error: Error, context?: RequestContext) => {
      console.log('AI Agent fallback activated:', error.message);

      // For healthcare-critical AI requests, provide a safe response
      if (context?.metadata?.dataClassification === 'restricted') {
        return {
          response:
            'Desculpe, estou temporariamente com problemas para processar solicitações médicas. Por favor, consulte um profissional de saúde ou tente novamente.',
          confidence: 0,
          sources: [],
          fallback: true,
          error: 'AI_SERVICE_UNAVAILABLE',
        };
      }

      // For general AI requests, provide a helpful error message
      return {
        response:
          'Estou temporariamente indisponível para processar sua solicitação. Por favor, tente novamente em alguns minutos.',
        confidence: 0,
        sources: [],
        fallback: true,
        error: 'AI_SERVICE_UNAVAILABLE',
      };
    };
  }

  private createAIFallbackResponse(request: any) {
    return {
      response: 'Desculpe, estou temporariamente indisponível.',
      confidence: 0,
      sources: [],
      fallback: true,
      error: 'AI_SERVICE_UNAVAILABLE',
    };
  }

  private classifyRequestData(request: any): string {
    // Classify the data sensitivity level of the AI request
    if (request.type === 'medical_diagnosis' || request.type === 'patient_analysis') {
      return 'restricted';
    } else if (request.type === 'appointment_scheduling' || request.type === 'patient_lookup') {
      return 'confidential';
    }
    return 'public';
  }

  private registerForHealthMonitoring(): void {
    this.healthChecker.registerService({
      name: 'ai-agent',
      type: 'external',
      endpoint: process.env.AI_AGENT_ENDPOINT || 'http://localhost:3002',
      description: 'AI Agent for healthcare assistance and analysis',
      healthcareCritical: true,
      dataSensitivity: 'high',
      requiredFor: ['ai-assistant', 'patient-support', 'medical-analysis'],
    });
  }
}

// Example 4: Utility function for easy circuit breaker integration
export function withCircuitBreakerProtection<T>(
  serviceName: string,
  operation: () => Promise<T>,
  context?: RequestContext,
  fallbackValue?: T,
  config?: any,
): Promise<T> {
  return withCircuitBreaker(serviceName, operation, context, fallbackValue, config);
}

// Example 5: Health monitoring setup utility
export function setupHealthMonitoring(services: ServiceDependency[]) {
  const healthChecker = new ExternalServiceHealthChecker(HEALTHCARE_HEALTH_CONFIG);

  services.forEach(service => {
    healthChecker.registerService(service);
  });

  // Set up event listeners for alerts
  healthChecker.onEvent(event => {
    console.log('Health Check Event:', {
      type: event.type,
      service: event.serviceName,
      status: event.currentStatus,
      timestamp: event.timestamp,
    });

    // Send alerts for critical health issues
    if (event.type === 'SERVICE_UNHEALTHY' || event.type === 'COMPLIANCE_VIOLATION') {
      sendHealthAlert(event);
    }
  });

  return healthChecker;
}

// Helper function to send health alerts
function sendHealthAlert(event: any) {
  // In a real implementation, this would send alerts to monitoring systems
  console.error('Health Alert:', {
    type: event.type,
    service: event.serviceName,
    status: event.currentStatus,
    details: event.details,
    timestamp: event.timestamp,
  });

  // Could integrate with:
  // - Email alerts
  // - Slack notifications
  // - PagerDuty
  // - Monitoring dashboards
}

// Export examples and utilities
export {
  AguiServiceWithCircuitBreaker,
  AIAgentServiceWithCircuitBreaker,
  GoogleCalendarServiceWithCircuitBreaker,
  setupHealthMonitoring,
  withCircuitBreakerProtection,
};
