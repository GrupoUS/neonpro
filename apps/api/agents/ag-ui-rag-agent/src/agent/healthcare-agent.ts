/**
 * Healthcare AI Agent with CopilotKit integration
 * AG-UI Protocol compatible agent for NeonPro
 */

import { SupabaseConnector, QueryPermissions } from '../database/supabase-connector.js';
import { SecurityManager } from '../security/security-manager.js';
import { HealthcareLogger } from '../logging/healthcare-logger.js';
import { IntentParser } from './intent-parser.js';
import { ResponseFormatter } from './response-formatter.js';
import { z } from 'zod';

// Agent configuration schema
const HealthcareAgentConfigSchema = z.object({
  agentId: z.string(),
  database: z.any(), // SupabaseConnector
  security: z.any(), // SecurityManager
  aiModels: z.object({
    primary: z.object({
      provider: z.enum(['openai', 'anthropic']),
      model: z.string(),
      apiKey: z.string(),
      maxTokens: z.number(),
      temperature: z.number(),
    }),
    fallback: z.object({
      provider: z.enum(['openai', 'anthropic']),
      model: z.string(),
      apiKey: z.string(),
      maxTokens: z.number(),
      temperature: z.number(),
    }).optional(),
  }),
  healthcare: z.object({
    lgpdCompliance: z.boolean(),
    anvisaCompliance: z.boolean(),
    cfmCompliance: z.boolean(),
    auditLogging: z.boolean(),
    dataClassification: z.string(),
  }),
  performance: z.object({
    cachingEnabled: z.boolean(),
    cacheTtl: z.number(),
    responseTimeThreshold: z.number(),
    enableCompression: z.boolean(),
  }),
});

export type HealthcareAgentConfig = z.infer<typeof HealthcareAgentConfigSchema>;

// Query interfaces
export interface UserQuery {
  id: string;
  sessionId: string;
  userId: string;
  query: string;
  intent?: string;
  parameters?: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface AgentResponse {
  id: string;
  queryId: string;
  type: 'text' | 'list' | 'table' | 'chart' | 'error';
  content: {
    title?: string;
    text?: string;
    data?: any[];
    columns?: Array<{ key: string; label: string; type: string }>;
  };
  actions?: Array<{
    id: string;
    label: string;
    type: 'button' | 'link' | 'form';
    action: string;
    parameters?: Record<string, any>;
  }>;
  metadata: {
    processingTime: number;
    confidence: number;
    sources: string[];
  };
  timestamp: string;
}

/**
 * Healthcare AI Agent with CopilotKit and AG-UI integration
 */
export class HealthcareAgent {
  private config: HealthcareAgentConfig;
  private database: SupabaseConnector;
  private security: SecurityManager;
  private intentParser: IntentParser;
  private responseFormatter: ResponseFormatter;
  private logger: HealthcareLogger;
  private isInitialized = false;

  constructor(config: HealthcareAgentConfig) {
    this.config = HealthcareAgentConfigSchema.parse(config);
    this.database = config.database;
    this.security = config.security;
    this.logger = HealthcareLogger.getInstance();
    this.intentParser = new IntentParser(config.aiModels);
    this.responseFormatter = new ResponseFormatter();
  }

  /**
   * Initialize the healthcare agent
   */
  async initialize(): Promise<void> {
    try {
      // Initialize intent parser with AI models
      await this.intentParser.initialize();
      
      this.isInitialized = true;
      this.logger.info('Healthcare agent initialized', {
        agentId: this.config.agentId,
        lgpdCompliance: this.config.healthcare.lgpdCompliance,
        auditLogging: this.config.healthcare.auditLogging,
      });
    } catch (error) {
      this.logger.error('Failed to initialize healthcare agent', error);
      throw error;
    }
  }

  /**
   * Process natural language query from CopilotKit
   */
  async processQuery(
    query: UserQuery,
    userPermissions: QueryPermissions
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    
    if (!this.isInitialized) {
      throw new Error('Healthcare agent not initialized');
    }

    try {
      // Validate user permissions
      await this.security.validateUserPermissions(userPermissions);

      // Parse query intent and extract parameters
      const intentResult = await this.intentParser.parseIntent(query.query);
      
      // Update query with parsed intent
      const updatedQuery: UserQuery = {
        ...query,
        intent: intentResult.intent,
        parameters: intentResult.parameters,
        status: 'processing',
      };

      // Log query processing start
      this.logger.info('Processing healthcare query', {
        queryId: query.id,
        userId: query.userId,
        intent: intentResult.intent,
        domain: userPermissions.domain,
      });

      // Execute data retrieval based on intent
      let responseData: any;
      let sources: string[] = [];

      switch (intentResult.intent) {
        case 'client_search':
          responseData = await this.handleClientSearch(intentResult.parameters, userPermissions);
          sources = ['clients'];
          break;
          
        case 'appointment_query':
          responseData = await this.handleAppointmentQuery(intentResult.parameters, userPermissions);
          sources = ['appointments'];
          break;
          
        case 'financial_summary':
          responseData = await this.handleFinancialQuery(intentResult.parameters, userPermissions);
          sources = ['financial_records'];
          break;
          
        case 'general_help':
          responseData = await this.handleGeneralHelp(intentResult.parameters);
          sources = ['help_system'];
          break;
          
        default:
          throw new Error(`Unsupported intent: ${intentResult.intent}`);
      }

      // Format response for CopilotKit/AG-UI
      const formattedResponse = await this.responseFormatter.formatResponse({
        intent: intentResult.intent,
        data: responseData,
        query: query.query,
        confidence: intentResult.confidence,
      });

      const processingTime = Date.now() - startTime;

      // Create agent response
      const agentResponse: AgentResponse = {
        id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        queryId: query.id,
        type: formattedResponse.type,
        content: formattedResponse.content,
        actions: formattedResponse.actions,
        metadata: {
          processingTime,
          confidence: intentResult.confidence,
          sources,
        },
        timestamp: new Date().toISOString(),
      };

      // Validate response time threshold
      if (processingTime > this.config.performance.responseTimeThreshold) {
        this.logger.warn('Response time exceeded threshold', {
          queryId: query.id,
          processingTime,
          threshold: this.config.performance.responseTimeThreshold,
        });
      }

      this.logger.info('Healthcare query processed successfully', {
        queryId: query.id,
        userId: query.userId,
        intent: intentResult.intent,
        processingTime,
        responseType: agentResponse.type,
        dataCount: Array.isArray(responseData) ? responseData.length : 1,
      });

      return agentResponse;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Healthcare query processing failed', error, {
        queryId: query.id,
        userId: query.userId,
        processingTime,
      });

      // Return error response
      return {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        queryId: query.id,
        type: 'error',
        content: {
          title: 'Erro no Processamento',
          text: 'Não foi possível processar sua consulta. Tente reformular sua pergunta ou entre em contato com o suporte.',
        },
        metadata: {
          processingTime,
          confidence: 0,
          sources: [],
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Handle client search queries
   */
  private async handleClientSearch(
    parameters: Record<string, any>,
    permissions: QueryPermissions
  ): Promise<any> {
    const { namePattern } = parameters;
    
    if (!namePattern) {
      throw new Error('Nome do cliente é obrigatório para busca');
    }

    return await this.database.getClientsByName(namePattern, permissions);
  }

  /**
   * Handle appointment queries
   */
  private async handleAppointmentQuery(
    parameters: Record<string, any>,
    permissions: QueryPermissions
  ): Promise<any> {
    const { startDate, endDate } = parameters;
    
    // Default to next 7 days if no dates specified
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return await this.database.getAppointmentsByDate(start, end, permissions);
  }

  /**
   * Handle financial queries
   */
  private async handleFinancialQuery(
    parameters: Record<string, any>,
    permissions: QueryPermissions
  ): Promise<any> {
    const { startDate, endDate } = parameters;
    
    // Default to current month if no dates specified
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    return await this.database.getFinancialSummary(start, end, permissions);
  }

  /**
   * Handle general help queries
   */
  private async handleGeneralHelp(parameters: Record<string, any>): Promise<any> {
    return {
      helpTopics: [
        {
          title: 'Consulta de Clientes',
          description: 'Pesquise clientes por nome ou informações de contato',
          examples: ['Buscar cliente Maria Silva', 'Clientes cadastrados hoje'],
        },
        {
          title: 'Agendamentos',
          description: 'Consulte agendamentos por data, status ou profissional',
          examples: ['Próximos agendamentos', 'Agendamentos de amanhã', 'Consultas canceladas'],
        },
        {
          title: 'Informações Financeiras',
          description: 'Acesse relatórios financeiros e estatísticas',
          examples: ['Faturamento do mês', 'Pagamentos pendentes', 'Resumo financeiro'],
        },
      ],
    };
  }

  /**
   * Get agent status for monitoring
   */
  getStatus(): {
    isInitialized: boolean;
    agentId: string;
    uptime: number;
    lastQuery?: string;
    performance: {
      averageResponseTime: number;
      totalQueries: number;
      successRate: number;
    };
  } {
    return {
      isInitialized: this.isInitialized,
      agentId: this.config.agentId,
      uptime: process.uptime(),
      performance: {
        averageResponseTime: 0, // Would track this in production
        totalQueries: 0, // Would track this in production
        successRate: 0.95, // Would track this in production
      },
    };
  }

  /**
   * Shutdown the agent gracefully
   */
  async shutdown(): Promise<void> {
    try {
      await this.intentParser.shutdown();
      this.isInitialized = false;
      
      this.logger.info('Healthcare agent shutdown complete', {
        agentId: this.config.agentId,
      });
    } catch (error) {
      this.logger.error('Error during healthcare agent shutdown', error);
      throw error;
    }
  }
}