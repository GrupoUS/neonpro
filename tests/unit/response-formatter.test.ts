import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryIntent, InteractiveAction } from '@neonpro/types';

// Import the formatResponse function from the data-agent endpoint
// We'll need to extract it for testing
function formatResponse(data: any, intent: QueryIntent, actions: InteractiveAction[] = []) {
  const responseId = 'test-response-id';

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
          },
          actions,
        };
      }
      break;

    case 'general':
      return {
        id: responseId,
        type: 'text' as const,
        content: {
          title: 'Assistente Virtual',
          text: 'Olá! Sou seu assistente virtual. Como posso ajudar você hoje?',
        },
        actions,
      };

    default:
      return {
        id: responseId,
        type: 'text' as const,
        content: {
          title: 'Consulta Não Reconhecida',
          text: 'Não entendi sua consulta. Por favor, tente reformular.',
        },
        actions: [],
      };
  }
}

describe('ResponseFormatter', () => {
  let mockActions: InteractiveAction[];

  beforeEach(() => {
    mockActions = [
      {
        id: 'test_action',
        label: 'Test Action',
        type: 'button',
        action: 'test',
      },
    ];
  }

  describe('Client Data Formatting', () => {
    it('should format client data as table with results', () => {
      const mockClients = [
        {
          id: 1,
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '(11) 9999-8888',
          created_at: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria@example.com',
          phone: '(11) 9777-6666',
          created_at: '2024-01-20T14:45:00Z',
        },
      ];

      const result = formatResponse(mockClients, 'client_data', mockActions

      expect(result.type).toBe('table')
      expect(result.content.title).toBe('Clientes Encontrados')
      expect(result.content.data).toHaveLength(2
      expect(result.content.data[0]).toEqual({
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '(11) 9999-8888',
        cadastrado_em: '15/01/2024',
      }
      expect(result.content.columns).toHaveLength(4
      expect(result.actions).toEqual(mockActions
    }

    it('should format empty client data with no results message', () => {
      const result = formatResponse([], 'client_data', mockActions

      expect(result.type).toBe('text')
      expect(result.content.title).toBe('Nenhum Cliente Encontrado')
      expect(result.content.text).toBe('Não foram encontrados clientes com os critérios especificados.')
      expect(result.actions).toHaveLength(1
      expect(result.actions[0].id).toBe('view_all_clients')
    }

    it('should format null client data with no results message', () => {
      const result = formatResponse(null, 'client_data', mockActions

      expect(result.type).toBe('text')
      expect(result.content.title).toBe('Nenhum Cliente Encontrado')
    }

    it('should handle client data with missing fields', () => {
      const incompleteClients = [
        {
          id: 1,
          name: 'João Silva',
          // missing email and phone
          created_at: '2024-01-15T10:30:00Z',
        },
      ];

      const result = formatResponse(incompleteClients, 'client_data', mockActions

      expect(result.type).toBe('table')
      expect(result.content.data[0]).toEqual({
        id: 1,
        nome: 'João Silva',
        email: undefined,
        telefone: undefined,
        cadastrado_em: '15/01/2024',
      }
    }
  }

  describe('Appointment Formatting', () => {
    it('should format appointments as list with results', () => {
      const mockAppointments = [
        {
          id: 1,
          datetime: '2024-01-15T10:30:00Z',
          status: 'confirmed',
          type: 'consultation',
          clients: { name: 'João Silva' },
          providers: { name: 'Dr. Silva' },
        },
        {
          id: 2,
          datetime: '2024-01-20T14:45:00Z',
          status: 'pending',
          type: 'follow_up',
          clients: { name: 'Maria Santos' },
          providers: null,
        },
      ];

      const result = formatResponse(mockAppointments, 'appointments', mockActions

      expect(result.type).toBe('list')
      expect(result.content.title).toBe('Agendamentos')
      expect(result.content.text).toBe('Encontrados 2 agendamentos:')
      expect(result.content.data).toHaveLength(2
      expect(result.content.data[0]).toEqual({
        id: 1,
        cliente: 'João Silva',
        data_hora: '15/01/2024, 07:30:00',
        status: 'confirmed',
        tipo: 'consultation',
        medico: 'Dr. Silva',
      }
      expect(result.actions).toEqual(mockActions
    }

    it('should format empty appointments with no results message', () => {
      const result = formatResponse([], 'appointments', mockActions

      expect(result.type).toBe('text')
      expect(result.content.title).toBe('Nenhum Agendamento Encontrado')
      expect(result.content.text).toBe('Não foram encontrados agendamentos no período especificado.')
      expect(result.actions[0].id).toBe('view_today_appointments')
    }

    it('should handle appointments with missing relationships', () => {
      const appointmentsWithoutRelations = [
        {
          id: 1,
          datetime: '2024-01-15T10:30:00Z',
          status: 'confirmed',
          type: 'consultation',
          // missing clients and providers
        },
      ];

      const result = formatResponse(appointmentsWithoutRelations, 'appointments', mockActions

      expect(result.type).toBe('list')
      expect(result.content.data[0].cliente).toBe('N/A')
      expect(result.content.data[0].medico).toBe('N/A')
    }
  }

  describe('Financial Data Formatting', () => {
    it('should format financial data as chart', () => {
      const mockFinancialData = {
        revenue: 15000,
        payments: 12000,
        expenses: 8000,
        profit: 7000,
      };

      const result = formatResponse(mockFinancialData, 'financial', mockActions

      expect(result.type).toBe('chart')
      expect(result.content.title).toBe('Resumo Financeiro')
      expect(result.content.chart.type).toBe('bar')
      expect(result.content.chart.data).toEqual([
        { label: 'Receita', value: 15000 },
        { label: 'Pagamentos', value: 12000 },
        { label: 'Despesas', value: 8000 },
      ]
      expect(result.content.chart.title).toBe('Visão Geral Financeira')
      expect(result.actions).toEqual(mockActions
    }

    it('should handle financial data with missing values', () => {
      const incompleteFinancialData = {
        revenue: 15000,
        // missing payments and expenses
      };

      const result = formatResponse(incompleteFinancialData, 'financial', mockActions

      expect(result.type).toBe('chart')
      expect(result.content.chart.data).toEqual([
        { label: 'Receita', value: 15000 },
        { label: 'Pagamentos', value: 0 },
        { label: 'Despesas', value: 0 },
      ]
    }

    it('should handle null financial data', () => {
      const result = formatResponse(null, 'financial', mockActions

      expect(result.type).toBe('chart')
      expect(result.content.chart.data).toEqual([
        { label: 'Receita', value: 0 },
        { label: 'Pagamentos', value: 0 },
        { label: 'Despesas', value: 0 },
      ]
    }
  }

  describe('General Query Formatting', () => {
    it('should format general queries as text response', () => {
      const result = formatResponse({}, 'general', mockActions

      expect(result.type).toBe('text')
      expect(result.content.title).toBe('Assistente Virtual')
      expect(result.content.text).toBe('Olá! Sou seu assistente virtual. Como posso ajudar você hoje?')
      expect(result.actions).toEqual(mockActions
    }

    it('should handle general queries without data', () => {
      const result = formatResponse(null, 'general', []

      expect(result.type).toBe('text')
      expect(result.content.title).toBe('Assistente Virtual')
      expect(result.actions).toEqual([]
    }
  }

  describe('Unknown Intent Formatting', () => {
    it('should format unknown intents with error message', () => {
      const result = formatResponse({}, 'unknown' as QueryIntent, mockActions

      expect(result.type).toBe('text')
      expect(result.content.title).toBe('Consulta Não Reconhecida')
      expect(result.content.text).toBe('Não entendi sua consulta. Por favor, tente reformular.')
      expect(result.actions).toEqual([]
    }

    it('should handle unsupported intents gracefully', () => {
      const result = formatResponse({}, 'unsupported_intent' as QueryIntent, mockActions

      expect(result.type).toBe('text')
      expect(result.content.title).toBe('Consulta Não Reconhecida')
    }
  }

  describe('Response Structure Validation', () => {
    it('should always include response ID', () => {
      const intents: QueryIntent[] = ['client_data', 'appointments', 'financial', 'general', 'unknown'];
      
      intents.forEach(intent => {
        const result = formatResponse({}, intent
        expect(result.id).toBe('test-response-id')
      }
    }

    it('should always include valid response type', () => {
      const validTypes = ['table', 'list', 'chart', 'text'];
      const intents: QueryIntent[] = ['client_data', 'appointments', 'financial', 'general', 'unknown'];
      
      intents.forEach(intent => {
        const result = formatResponse({}, intent
        expect(validTypes).toContain(result.type
      }
    }

    it('should always include content object', () => {
      const intents: QueryIntent[] = ['client_data', 'appointments', 'financial', 'general', 'unknown'];
      
      intents.forEach(intent => {
        const result = formatResponse({}, intent
        expect(result.content).toBeDefined(
        expect(typeof result.content).toBe('object')
      }
    }

    it('should include actions array when provided', () => {
      const result = formatResponse([], 'client_data', mockActions

      expect(Array.isArray(result.actions)).toBe(true);
      expect(result.actions).toEqual(mockActions
    }
  }

  describe('Data Type Validation', () => {
    it('should handle non-array data for client data', () => {
      const invalidData = { name: 'Invalid Data' };
      const result = formatResponse(invalidData, 'client_data')

      expect(result.type).toBe('text')
      expect(result.content.title).toBe('Nenhum Cliente Encontrado')
    }

    it('should handle non-array data for appointments', () => {
      const invalidData = { datetime: 'Invalid Data' };
      const result = formatResponse(invalidData, 'appointments')

      expect(result.type).toBe('text')
      expect(result.content.title).toBe('Nenhum Agendamento Encontrado')
    }

    it('should handle invalid date objects', () => {
      const mockClients = [
        {
          id: 1,
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '(11) 9999-8888',
          created_at: 'invalid-date',
        },
      ];

      const result = formatResponse(mockClients, 'client_data')

      expect(result.type).toBe('table')
      expect(result.content.data[0].cadastrado_em).toBe('Invalid Date')
    }
  }

  describe('Localization and Formatting', () => {
    it('should format dates in Brazilian Portuguese format', () => {
      const mockClients = [
        {
          id: 1,
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '(11) 9999-8888',
          created_at: '2024-12-25T15:30:00Z',
        },
      ];

      const result = formatResponse(mockClients, 'client_data')

      expect(result.content.data[0].cadastrado_em).toMatch(/\d{2}\/\d{2}\/\d{4}/
    }

    it('should format datetime in Brazilian Portuguese format', () => {
      const mockAppointments = [
        {
          id: 1,
          datetime: '2024-12-25T15:30:00Z',
          status: 'confirmed',
          type: 'consultation',
          clients: { name: 'João Silva' },
          providers: { name: 'Dr. Silva' },
        },
      ];

      const result = formatResponse(mockAppointments, 'appointments')

      expect(result.content.data[0].data_hora).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/
    }

    it('should use Portuguese labels for all response types', () => {
      const testCases = [
        { intent: 'client_data' as QueryIntent, data: [], expectedTitle: 'Nenhum Cliente Encontrado' },
        { intent: 'appointments' as QueryIntent, data: [], expectedTitle: 'Nenhum Agendamento Encontrado' },
        { intent: 'financial' as QueryIntent, data: {}, expectedTitle: 'Resumo Financeiro' },
        { intent: 'general' as QueryIntent, data: {}, expectedTitle: 'Assistente Virtual' },
      ];

      testCases.forEach(({ intent, data, expectedTitle }) => {
        const result = formatResponse(data, intent
        expect(result.content.title).toBe(expectedTitle
      }
    }
  }

  describe('Performance Tests', () => {
    it('should format responses quickly', () => {
      const largeClientData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Client ${i + 1}`,
        email: `client${i + 1}@example.com`,
        phone: `(11) 9${String(i + 1).padStart(4, '0')}-${String(i + 1).padStart(4, '0')}`,
        created_at: '2024-01-15T10:30:00Z',
      })

      const startTime = Date.now(
      const result = formatResponse(largeClientData, 'client_data')
      const endTime = Date.now(

      expect(result.type).toBe('table')
      expect(result.content.data).toHaveLength(1000
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    }

    it('should handle concurrent formatting operations', async () => {
      const testData = [
        { intent: 'client_data' as QueryIntent, data: [{ id: 1, name: 'Test', created_at: '2024-01-15T10:30:00Z' }] },
        { intent: 'appointments' as QueryIntent, data: [{ id: 1, datetime: '2024-01-15T10:30:00Z', status: 'confirmed' }] },
        { intent: 'financial' as QueryIntent, data: { revenue: 1000 } },
      ];

      const promises = testData.map(({ intent, data }) => 
        Promise.resolve(formatResponse(data, intent))
      

      const results = await Promise.all(promises
      
      expect(results.length).toBe(3
      results.forEach(result => {
        expect(result.id).toBe('test-response-id')
      }
    }
  }
}