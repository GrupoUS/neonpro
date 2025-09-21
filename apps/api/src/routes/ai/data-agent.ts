import { AgentQueryRequest, AgentResponse, InteractiveAction, QueryIntent, UserRole } from '@neonpro/types';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { handle } from 'hono/vercel';
import { AIDataService } from '../../services/ai-data-service';
import { IntentParserService } from '../../services/intent-parser';

// Create Hono app for Vercel deployment
const app = new Hono().basePath('/api');

// Enable CORS for frontend integration
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  }),
);

// JWT middleware for authentication
app.use('*', async (c, next) => {
  const jwtMiddleware = jwt({
    secret: process.env.JWT_SECRET!,
  });
  return jwtMiddleware(c, next);
});

/**
 * POST /api/ai/data-agent
 * Process natural language queries and return structured responses
 */
app.post('/ai/data-agent', async c => {
  const startTime = Date.now();

  try {
    // Parse and validate request
    const body = await c.req.json() as AgentQueryRequest;

    if (!body.query || body.query.trim().length === 0) {
      return c.json({
        success: false,
        response: {
          id: crypto.randomUUID(),
          type: 'error',
          content: {
            title: 'Erro de Validação',
            text: 'A consulta não pode estar vazia.',
            error: {
              code: 'INVALID_QUERY',
              message: 'Query cannot be empty',
              suggestion:
                'Por favor, digite uma pergunta sobre clientes, agendamentos ou dados financeiros.',
            },
          },
          metadata: {
            processingTime: Date.now() - startTime,
            confidence: 0,
            sources: [],
          },
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        },
      }, 400);
    }

    if (!body.sessionId) {
      return c.json({
        success: false,
        response: {
          id: crypto.randomUUID(),
          type: 'error',
          content: {
            title: 'Erro de Sessão',
            text: 'ID da sessão é obrigatório.',
            error: {
              code: 'INVALID_SESSION',
              message: 'Session ID is required',
              suggestion: 'Por favor, recarregue a página e tente novamente.',
            },
          },
          metadata: {
            processingTime: Date.now() - startTime,
            confidence: 0,
            sources: [],
          },
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        },
      }, 400);
    }

    // Get user information from JWT token
    const payload = c.get('jwtPayload');
    const userId = payload.sub as string;
    const userRole = payload.role as UserRole;
    const userDomain = payload.domain as string;

    // Create permission context
    const permissionContext = {
      userId,
      domain: userDomain,
      role: userRole,
      permissions: payload.permissions || [],
      dataScope: payload.dataScope || 'own_clients',
      lastAccess: new Date(),
      sessionExpiry: new Date(Date.now() + (30 * 60 * 1000)), // 30 minutes
    };

    // Initialize services
    const dataService = new AIDataService(permissionContext);
    const intentParser = new IntentParserService();

    // Parse user query
    const { intent, parameters, confidence } = intentParser.parseQuery(body.query, userRole);

    // Validate parameters
    const validation = intentParser.validateParameters(parameters, intent);
    if (!validation.valid) {
      return c.json({
        success: false,
        response: {
          id: crypto.randomUUID(),
          type: 'error',
          content: {
            title: 'Parâmetros Inválidos',
            text: 'Os parâmetros da consulta não são válidos.',
            error: {
              code: 'INVALID_PARAMETERS',
              message: 'Invalid query parameters',
              suggestion: validation.errors.join(', '),
            },
          },
          metadata: {
            processingTime: Date.now() - startTime,
            confidence: confidence,
            sources: [],
          },
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        },
      }, 400);
    }

    // Low confidence handling
    if (confidence < 0.5) {
      const suggestions = intentParser.getSuggestedQueries(userRole);
      return c.json({
        success: true,
        response: {
          id: crypto.randomUUID(),
          type: 'text',
          content: {
            title: 'Consulta Não Entendida',
            text: 'Não consegui entender sua consulta. Aqui estão algumas sugestões:',
          },
          actions: suggestions.map(suggestion => ({
            id: `suggest_${suggestion.replace(/\s+/g, '_')}`,
            label: suggestion,
            type: 'button' as const,
            action: 'suggest_query',
            parameters: { query: suggestion },
          })),
          metadata: {
            processingTime: Date.now() - startTime,
            confidence,
            sources: [],
          },
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        },
      }, 200);
    }

    // Try ottomator-agents integration first
    try {
      const ottomatorResponse = await dataService.processNaturalLanguageQuery(
        body.query,
        body.sessionId || crypto.randomUUID(),
        {
          patientId: body.patientId,
          previousQueries: body.context?.previousQueries,
        },
      );

      if (ottomatorResponse.success && ottomatorResponse.response) {
        // Use ottomator-agents response
        const formattedResponse = {
          id: crypto.randomUUID(),
          type: ottomatorResponse.response.type === 'structured' ? 'table' : 'text',
          content: {
            title: 'Resultado da Consulta',
            text: ottomatorResponse.response.content,
            data: ottomatorResponse.response.type === 'structured'
              ? JSON.parse(ottomatorResponse.response.content)
              : null,
          },
          metadata: {
            processingTime: ottomatorResponse.metadata?.processingTimeMs
              || (Date.now() - startTime),
            confidence: ottomatorResponse.response.sources?.[0]?.confidence || 0.8,
            sources: ottomatorResponse.response.sources?.map(s => s.title) || ['NeonPro AI Agent'],
          },
          timestamp: new Date(),
          processingTime: ottomatorResponse.metadata?.processingTimeMs || (Date.now() - startTime),
        };

        // Add actions from ottomator response
        let ottomatorActions: InteractiveAction[] = [];
        if (ottomatorResponse.response.actions) {
          ottomatorActions = ottomatorResponse.response.actions.map(action => ({
            id: crypto.randomUUID(),
            type: action.type as 'button' | 'link' | 'form',
            label: action.label,
            action: action.action,
            parameters: action.data,
          }));
        }

        return c.json({
          success: true,
          response: formattedResponse,
          actions: ottomatorActions,
          metadata: {
            intent,
            confidence,
            parameters,
            processingTime: Date.now() - startTime,
            model: ottomatorResponse.metadata?.model || 'ottomator-agents',
          },
        });
      }
    } catch (ottomatorError) {
      console.warn('Ottomator-agents failed, falling back to direct processing:', ottomatorError);
    }

    // Fallback to original intent-based processing
    let responseData: any;
    let actions: InteractiveAction[] = [];
    let sources: string[] = [];

    try {
      switch (intent) {
        case 'client_data':
          responseData = await dataService.getClientsByName(parameters);
          sources = ['clients'];

          if (parameters.clientNames && parameters.clientNames.length > 0) {
            // If specific client names, provide drill-down actions
            responseData.forEach((client: any) => {
              actions.push({
                id: `view_client_${client.id}`,
                label: `Ver detalhes de ${client.name}`,
                type: 'button',
                action: 'view_client_details',
                parameters: { clientId: client.id },
              });
            });
          }
          break;

        case 'appointments':
          responseData = await dataService.getAppointmentsByDate(parameters);
          sources = ['appointments'];

          // Add actions for appointments
          responseData.forEach((appointment: any) => {
            actions.push({
              id: `view_appt_${appointment.id}`,
              label: `Ver detalhes`,
              type: 'button',
              action: 'view_appointment_details',
              parameters: { appointmentId: appointment.id },
            });
          });
          break;

        case 'financial':
          responseData = await dataService.getFinancialSummary(parameters);
          sources = ['financial_records'];

          // Add drill-down actions for financial data
          actions.push({
            id: 'view_detailed_financial',
            label: 'Ver relatório detalhado',
            type: 'button',
            action: 'view_financial_details',
            parameters: { type: parameters.financial?.type || 'all' },
          });
          break;

        default:
          throw new Error(`Intent não suportado: ${intent}`);
      }

      // Format response based on data type
      const response = formatResponse(responseData, intent, actions);
      const processingTime = Date.now() - startTime;

      return c.json({
        success: true,
        response: {
          ...response,
          metadata: {
            processingTime,
            confidence,
            sources,
          },
          timestamp: new Date(),
          processingTime,
        },
      }, 200);
    } catch (error) {
      console.error('Error processing query:', error);

      return c.json({
        success: false,
        response: {
          id: crypto.randomUUID(),
          type: 'error',
          content: {
            title: 'Erro ao Processar Consulta',
            text: 'Ocorreu um erro ao processar sua consulta.',
            error: {
              code: 'PROCESSING_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
              suggestion: 'Por favor, tente novamente com uma consulta diferente.',
            },
          },
          metadata: {
            processingTime: Date.now() - startTime,
            confidence: confidence,
            sources: [],
          },
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        },
      }, 500);
    }
  } catch (error) {
    console.error('Data-agent endpoint error:', error);

    return c.json({
      success: false,
      response: {
        id: crypto.randomUUID(),
        type: 'error',
        content: {
          title: 'Erro Interno',
          text: 'Ocorreu um erro interno no servidor.',
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            suggestion: 'Por favor, tente novamente mais tarde.',
          },
        },
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0,
          sources: [],
        },
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      },
    }, 500);
  }
});

/**
 * Format response data based on intent and data type
 */
function formatResponse(data: any, intent: QueryIntent, actions: InteractiveAction[]) {
  const responseId = crypto.randomUUID();

  switch (intent) {
    case 'client_data':
      if (Array.isArray(data) && data.length > 0) {
        return {
          id: responseId,
          type: 'table' as const,
          content: {
            title: 'Clientes Encontrados',
            data: data.map(client => ({
              id: client.id,
              nome: client.name,
              email: client.email,
              telefone: client.phone,
              cadastrado_em: new Date(client.created_at).toLocaleDateString('pt-BR'),
            })),
            columns: [
              { key: 'nome', label: 'Nome', type: 'string' as const },
              { key: 'email', label: 'Email', type: 'string' as const },
              { key: 'telefone', label: 'Telefone', type: 'string' as const },
              { key: 'cadastrado_em', label: 'Cadastrado em', type: 'date' as const },
            ],
          },
          actions,
        };
      } else {
        return {
          id: responseId,
          type: 'text' as const,
          content: {
            title: 'Nenhum Cliente Encontrado',
            text: 'Não foram encontrados clientes com os critérios especificados.',
          },
          actions: [
            {
              id: 'view_all_clients',
              label: 'Ver todos os clientes',
              type: 'button' as const,
              action: 'view_all_clients',
            },
          ],
        };
      }

    case 'appointments':
      if (Array.isArray(data) && data.length > 0) {
        return {
          id: responseId,
          type: 'list' as const,
          content: {
            title: 'Agendamentos',
            text: `Encontrados ${data.length} agendamentos:`,
            data: data.map(appt => ({
              id: appt.id,
              cliente: appt.clients?.name || 'N/A',
              data_hora: new Date(appt.datetime).toLocaleString('pt-BR'),
              status: appt.status,
              tipo: appt.type,
              medico: appt.providers?.name || 'N/A',
            })),
          },
          actions,
        };
      } else {
        return {
          id: responseId,
          type: 'text' as const,
          content: {
            title: 'Nenhum Agendamento Encontrado',
            text: 'Não foram encontrados agendamentos no período especificado.',
          },
          actions: [
            {
              id: 'view_today_appointments',
              label: 'Ver agendamentos de hoje',
              type: 'button' as const,
              action: 'view_today_appointments',
            },
          ],
        };
      }

    case 'financial':
      if (data && typeof data === 'object') {
        return {
          id: responseId,
          type: 'chart' as const,
          content: {
            title: 'Resumo Financeiro',
            chart: {
              type: 'bar' as const,
              data: [
                { label: 'Receita', value: data.revenue || 0 },
                { label: 'Pagamentos', value: data.payments || 0 },
                { label: 'Despesas', value: data.expenses || 0 },
              ],
              title: 'Visão Geral Financeira',
            },
            data: [
              {
                período: data.period || 'Mês atual',
                receita: `R$ ${(data.revenue || 0).toFixed(2)}`,
                pagamentos: `R$ ${(data.payments || 0).toFixed(2)}`,
                despesas: `R$ ${(data.expenses || 0).toFixed(2)}`,
                saldo: `R$ ${((data.revenue || 0) - (data.expenses || 0)).toFixed(2)}`,
              },
            ],
            columns: [
              { key: 'período', label: 'Período', type: 'string' as const },
              { key: 'receita', label: 'Receita', type: 'currency' as const },
              { key: 'pagamentos', label: 'Pagamentos', type: 'currency' as const },
              { key: 'despesas', label: 'Despesas', type: 'currency' as const },
              { key: 'saldo', label: 'Saldo', type: 'currency' as const },
            ],
          },
          actions,
        };
      } else {
        return {
          id: responseId,
          type: 'text' as const,
          content: {
            title: 'Dados Financeiros Indisponíveis',
            text: 'Não foi possível obter os dados financeiros no momento.',
          },
        };
      }

    default:
      return {
        id: responseId,
        type: 'text' as const,
        content: {
          title: 'Resposta',
          text: 'Sua consulta foi processada com sucesso.',
        },
      };
  }
}

export const GET = handle(app);
export const POST = handle(app);
