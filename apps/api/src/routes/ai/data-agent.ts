/**
 * AI Agent Data API Endpoint
 * Handles conversational queries for healthcare data using Hono.js
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { validator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { AIDataService } from '@/services/ai-data-service';
import { intentParser } from '@/services/intent-parser';
import { 
  QueryIntent,
  AgentResponse,
  AgentAction,
  DataAgentRequest,
  DataAgentResponse,
  ValidDataAgentRequest,
  ValidDataAgentResponse,
  safeValidate,
  DataAgentRequestSchema,
  AgentError,
  AgentResponseSchema
} from '@neonpro/types';

// Initialize Hono app
const app = new Hono<{ 
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_KEY: string;
  };
  Variables: {
    user: {
      id: string;
      role: string;
      domain?: string;
    };
  };
}>();

// Middleware
app.use('*', cors({
  origin: (origin) => {
    // Allow specific origins in production
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://neonpro.app'
    ];
    return allowedOrigins.includes(origin) || origin === undefined;
  },
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize services
const dataService = new AIDataService();

// =====================================
// Main Agent Endpoint
// =====================================

/**
 * POST /api/ai/data-agent
 * Main endpoint for AI agent queries
 */
app.post(
  '/api/ai/data-agent',
  validator('json', (value, c) => {
    const result = safeValidate(DataAgentRequestSchema, value);
    if (!result.success) {
      throw new HTTPException(400, {
        message: `Invalid request: ${result.error.message}`,
        cause: result.error
      });
    }
    return result.data;
  }),
  async (c) => {
    const startTime = Date.now();
    
    try {
      const request: ValidDataAgentRequest = c.req.valid('json');
      const user = c.get('user');

      // Parse user intent
      const userQuery = await intentParser.parseQuery(request.query, {
        userId: user?.id,
        userRole: user?.role,
        domain: user?.domain || request.context?.domain
      });

      // Process query based on intent
      const response = await processQuery(userQuery, request.context);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Format final response
      const agentResponse: AgentResponse = {
        id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        queryId: userQuery.id,
        success: true,
        message: generateSuccessMessage(userQuery.intent, response),
        data: response.data,
        actions: response.actions,
        suggestions: generateSuggestions(userQuery.intent, response),
        confidence: response.confidence || 0.8,
        processingTime,
        timestamp: new Date().toISOString()
      };

      // Validate response
      const validatedResponse = safeValidate(AgentResponseSchema, agentResponse);
      if (!validatedResponse.success) {
        console.error('Response validation failed:', validatedResponse.error);
        // Continue with response anyway for debugging
      }

      const apiResponse: DataAgentResponse = {
        success: true,
        response: agentResponse
      };

      return c.json(apiResponse);
    } catch (error) {
      console.error('Agent endpoint error:', error);
      
      const processingTime = Date.now() - startTime;
      
      const errorResponse: DataAgentResponse = {
        success: false,
        error: {
          code: error instanceof AgentError ? error.code : 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error instanceof AgentError ? error.details : undefined
        }
      };

      return c.json(errorResponse, 500);
    }
  }
);

// =====================================
// Helper Functions
// =====================================

/**
 * Process query based on detected intent
 */
async function processQuery(
  userQuery: any,
  context?: any
): Promise<{
  data: any;
  actions: AgentAction[];
  confidence: number;
}> {
  switch (userQuery.intent) {
    case QueryIntent.CLIENT_SEARCH:
      return await processClientSearch(userQuery, context);
    
    case QueryIntent.APPOINTMENT_QUERY:
      return await processAppointmentQuery(userQuery, context);
    
    case QueryIntent.FINANCIAL_QUERY:
      return await processFinancialQuery(userQuery, context);
    
    case QueryIntent.APPOINTMENT_CREATION:
      return await processAppointmentCreation(userQuery, context);
    
    case QueryIntent.GENERAL_INQUIRY:
      return await processGeneralInquiry(userQuery, context);
    
    default:
      throw new AgentError('Unable to determine query intent', 'UNKNOWN_INTENT');
  }
}

/**
 * Process client search queries
 */
async function processClientSearch(
  userQuery: any,
  context?: any
): Promise<{
  data: any;
  actions: AgentAction[];
  confidence: number;
}> {
  const names = userQuery.entities?.clients?.map((c: any) => c.name) || [];
  
  if (names.length === 0) {
    return {
      data: { clients: [] },
      actions: [],
      confidence: 0.3
    };
  }

  // Search for clients
  const allClients: any[] = [];
  for (const name of names) {
    const clients = await dataService.getClientsByName(name, context);
    allClients.push(...clients);
  }

  // Remove duplicates
  const uniqueClients = allClients.filter((client, index, self) => 
    index === self.findIndex(c => c.id === client.id)
  );

  const actions: AgentAction[] = uniqueClients.slice(0, 5).map(client => ({
    id: `view_client_${client.id}`,
    type: 'view_details' as const,
    label: `Ver detalhes de ${client.name}`,
    payload: { clientId: client.id },
    icon: 'user'
  }));

  return {
    data: { 
      clients: uniqueClients.slice(0, context?.limit || 10),
      summary: uniqueClients.length > 0 ? {
        total: uniqueClients.length,
        count: uniqueClients.length
      } : undefined
    },
    actions,
    confidence: Math.min(0.95, 0.5 + (names[0].length * 0.05))
  };
}

/**
 * Process appointment queries
 */
async function processAppointmentQuery(
  userQuery: any,
  context?: any
): Promise<{
  data: any;
  actions: AgentAction[];
  confidence: number;
}> {
  const dates = userQuery.entities?.dates || [];
  const clients = userQuery.entities?.clients || [];
  
  let appointments: any[] = [];
  
  if (dates.length > 0) {
    // Get appointments by date range
    const startDate = new Date(Math.min(...dates.map((d: any) => new Date(d.date))));
    const endDate = new Date(Math.max(...dates.map((d: any) => new Date(d.date))));
    endDate.setHours(23, 59, 59, 999);
    
    appointments = await dataService.getAppointmentsByDate(
      startDate.toISOString(),
      endDate.toISOString(),
      context
    );
  } else if (clients.length > 0) {
    // Get appointments for specific clients
    for (const client of clients) {
      const clientData = await dataService.getClientById(client.name);
      if (clientData) {
        const clientAppointments = await dataService.getAppointmentsByClient(
          clientData.id,
          { ...context, upcoming: true }
        );
        appointments.push(...clientAppointments);
      }
    }
  } else {
    // Get upcoming appointments for today/this week
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    
    appointments = await dataService.getAppointmentsByDate(
      today.toISOString(),
      endOfWeek.toISOString(),
      context
    );
  }

  // Group by date for better display
  const groupedAppointments = groupAppointmentsByDate(appointments);

  const actions: AgentAction[] = [
    {
      id: 'create_appointment',
      type: 'create_appointment' as const,
      label: 'Novo Agendamento',
      icon: 'plus',
      primary: true
    },
    {
      id: 'refresh_appointments',
      type: 'refresh' as const,
      label: 'Atualizar',
      icon: 'refresh'
    }
  ];

  return {
    data: {
      appointments: appointments.slice(0, context?.limit || 20),
      groupedByDate: groupedAppointments,
      summary: appointments.length > 0 ? {
        total: appointments.length,
        count: appointments.filter(a => a.status === 'scheduled').length
      } : undefined
    },
    actions,
    confidence: 0.8
  };
}

/**
 * Process financial queries
 */
async function processFinancialQuery(
  userQuery: any,
  context?: any
): Promise<{
  data: any;
  actions: AgentAction[];
  confidence: number;
}> {
  const clients = userQuery.entities?.clients || [];
  const dates = userQuery.entities?.dates || [];
  
  let filters: any = {};
  
  if (dates.length > 0) {
    filters.startDate = new Date(Math.min(...dates.map((d: any) => new Date(d.date)))).toISOString();
    filters.endDate = new Date(Math.max(...dates.map((d: any) => new Date(d.date)))).toISOString();
  }
  
  if (clients.length > 0) {
    const clientData = await dataService.getClientById(clients[0].name);
    if (clientData) {
      filters.clientId = clientData.id;
    }
  }

  const financialData = await dataService.getFinancialSummary(filters, context);

  const actions: AgentAction[] = [
    {
      id: 'export_financial',
      type: 'export_data' as const,
      label: 'Exportar Relatório',
      icon: 'download'
    },
    {
      id: 'view_financial_details',
      type: 'navigate' as const,
      label: 'Ver Detalhes Financeiros',
      payload: { path: '/financeiro' },
      icon: 'chart-bar'
    }
  ];

  return {
    data: {
      financial: financialData.transactions,
      summary: financialData.summary
    },
    actions,
    confidence: 0.85
  };
}

/**
 * Process appointment creation requests
 */
async function processAppointmentCreation(
  userQuery: any,
  context?: any
): Promise<{
  data: any;
  actions: AgentAction[];
  confidence: number;
}> {
  // For now, return a response indicating this feature is coming soon
  return {
    data: {
      message: 'A criação de agendamentos estará disponível em breve.',
      entities: userQuery.entities
    },
    actions: [
      {
        id: 'navigate_to_scheduling',
        type: 'navigate' as const,
        label: 'Ir para Agenda',
        payload: { path: '/agendamentos/novo' },
        icon: 'calendar',
        primary: true
      }
    ],
    confidence: 0.6
  };
}

/**
 * Process general inquiries
 */
async function processGeneralInquiry(
  userQuery: any,
  context?: any
): Promise<{
  data: any;
  actions: AgentAction[];
  confidence: number;
}> {
  // Try to understand what the user wants based on context
  const text = userQuery.text.toLowerCase();
  
  if (text.includes('ajuda') || text.includes('help')) {
    return {
      data: {
        message: `Posso ajudar você a:
- Buscar clientes e pacientes
- Consultar agendamentos
- Ver informações financeiras
- Agendar consultas (em breve)

Como posso ajudar?`
      },
      actions: [
        {
          id: 'show_examples',
          type: 'navigate' as const,
          label: 'Ver Exemplos',
          payload: { path: '/ajuda/exemplos' },
          icon: 'help'
        }
      ],
      confidence: 0.9
    };
  }

  // Default response
  return {
    data: {
      message: 'Não entendi completamente. Pode reformular sua pergunta?',
      suggestions: [
        'Buscar cliente João Silva',
        'Quais agendamentos para hoje?',
        'Resumo financeiro deste mês'
      ]
    },
    actions: [],
    confidence: 0.3
  };
}

/**
 * Generate success message based on intent and results
 */
function generateSuccessMessage(
  intent: QueryIntent,
  result: any
): string {
  switch (intent) {
    case QueryIntent.CLIENT_SEARCH:
      const clientCount = result.data?.clients?.length || 0;
      return clientCount > 0 
        ? `Encontrei ${clientCount} cliente${clientCount > 1 ? 's' : ''}`
        : 'Nenhum cliente encontrado com esses critérios';
    
    case QueryIntent.APPOINTMENT_QUERY:
      const aptCount = result.data?.appointments?.length || 0;
      return aptCount > 0
        ? `Encontrei ${aptCount} agendamento${aptCount > 1 ? 's' : ''}`
        : 'Nenhum agendamento encontrado para este período';
    
    case QueryIntent.FINANCIAL_QUERY:
      const summary = result.data?.summary;
      if (summary) {
        return `Resumo financeiro: ${formatCurrency(summary.total)} em ${summary.count} transações`;
      }
      return 'Nenhum dado financeiro encontrado';
    
    case QueryIntent.APPOINTMENT_CREATION:
      return 'Entendi que você quer agendar uma consulta';
    
    default:
      return 'Consulta processada com sucesso';
  }
}

/**
 * Generate contextual suggestions
 */
function generateSuggestions(
  intent: QueryIntent,
  result: any
): string[] {
  switch (intent) {
    case QueryIntent.CLIENT_SEARCH:
      return [
        'Ver histórico do cliente',
        'Agendar consulta',
        'Ver financeiro do cliente'
      ];
    
    case QueryIntent.APPOINTMENT_QUERY:
      return [
        'Agendar nova consulta',
        'Ver agenda completa',
        'Consultar agendamentos de amanhã'
      ];
    
    case QueryIntent.FINANCIAL_QUERY:
      return [
        'Exportar relatório',
        'Ver contas a receber',
        'Consultar pagamentos do mês'
      ];
    
    default:
      return [];
  }
}

/**
 * Group appointments by date
 */
function groupAppointmentsByDate(appointments: any[]): Record<string, any[]> {
  return appointments.reduce((groups, apt) => {
    const date = apt.scheduledAt.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {} as Record<string, any[]>);
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

// Health check endpoint
app.get('/api/ai/health', async (c) => {
  const isHealthy = await dataService.healthCheck();
  
  return c.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }, isHealthy ? 200 : 503);
});

export default app;