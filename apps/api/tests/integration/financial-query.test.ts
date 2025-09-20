import { Hono } from 'hono';
import { createServer } from 'http';
import { fetch } from 'undici';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Import the agent endpoint with mock data service
import { agentRouter } from '../../src/routes/ai/data-agent';

// Mock the AIDataService to avoid actual database calls during tests
vi.mock('../../src/services/ai-data-service', () => ({
  AIDataService: {
    getInstance: () => ({
      getClientsByName: async (name: string) => ({
        type: 'list',
        title: 'Clientes Encontrados',
        data: [],
        columns: [],
      }),
      getAppointmentsByDate: async (date: string) => ({
        type: 'list',
        title: 'Agendamentos',
        data: [],
        columns: [],
      }),
      getFinancialSummary: async (period: string) => {
        // Mock financial data
        const mockFinancialRecords = [
          {
            id: 'fin-1',
            date: '2024-01-19',
            type: 'revenue',
            amount: 1500.0,
            currency: 'BRL',
            description: 'Consulta - Maria Silva',
            status: 'paid',
            category: 'Consultas',
          },
          {
            id: 'fin-2',
            date: '2024-01-19',
            type: 'revenue',
            amount: 800.0,
            currency: 'BRL',
            description: 'Procedimento - João Santos',
            status: 'paid',
            category: 'Procedimentos',
          },
          {
            id: 'fin-3',
            date: '2024-01-18',
            type: 'expense',
            amount: 500.0,
            currency: 'BRL',
            description: 'Material médico',
            status: 'paid',
            category: 'Suprimentos',
          },
          {
            id: 'fin-4',
            date: '2024-01-17',
            type: 'revenue',
            amount: 1200.0,
            currency: 'BRL',
            description: 'Pacote tratamento',
            status: 'pending',
            category: 'Pacotes',
          },
        ];

        // Calculate summary
        const totalRevenue = mockFinancialRecords
          .filter(r => r.type === 'revenue')
          .reduce((sum, r) => sum + r.amount, 0);

        const totalExpenses = mockFinancialRecords
          .filter(r => r.type === 'expense')
          .reduce((sum, r) => sum + r.amount, 0);

        return {
          type: 'summary',
          title: 'Resumo Financeiro',
          data: mockFinancialRecords,
          summary: {
            totalRevenue,
            totalExpenses,
            netIncome: totalRevenue - totalExpenses,
            period: period || 'Últimos 30 dias',
            currency: 'BRL',
          },
          columns: [
            { key: 'date', label: 'Data', type: 'date' },
            { key: 'type', label: 'Tipo', type: 'badge' },
            { key: 'amount', label: 'Valor', type: 'currency' },
            { key: 'description', label: 'Descrição', type: 'text' },
            { key: 'status', label: 'Status', type: 'badge' },
          ],
        };
      },
    }),
  },
}));

describe('Integration Tests: Financial Query', () => {
  let server: any;
  let baseUrl: string;
  let app: Hono;

  beforeAll(async () => {
    // Create Hono app with agent route
    app = new Hono();
    app.route('/api/ai/data-agent', agentRouter);

    // Start test server
    server = createServer({
      fetch: app.fetch,
      port: 0,
    });

    await new Promise(resolve => {
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve(true);
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  describe('Financial Query Integration', () => {
    it('should successfully query financial summary', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Como está o faturamento?',
          sessionId: 'test-session-fin-1',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.type).toBe('summary');
      expect(data.response.title).toBe('Resumo Financeiro');
      expect(data.response.summary).toBeDefined();

      // Verify summary structure
      const summary = data.response.summary;
      expect(summary).toHaveProperty('totalRevenue');
      expect(summary).toHaveProperty('totalExpenses');
      expect(summary).toHaveProperty('netIncome');
      expect(summary).toHaveProperty('period');
      expect(summary).toHaveProperty('currency');

      // Verify financial calculations
      expect(typeof summary.totalRevenue).toBe('number');
      expect(typeof summary.totalExpenses).toBe('number');
      expect(typeof summary.netIncome).toBe('number');
      expect(summary.netIncome).toBe(
        summary.totalRevenue - summary.totalExpenses,
      );
    });

    it('should query for revenue specifically', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Qual foi a receita este mês?',
          sessionId: 'test-session-fin-2',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.type).toBe('summary');
      expect(data.response.summary.totalRevenue).toBeGreaterThan(0);
    });

    it('should query for expenses specifically', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Mostrar as despesas',
          sessionId: 'test-session-fin-3',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.type).toBe('summary');

      // Filter for expenses in the data
      const expenses = data.response.data.filter(
        (r: any) => r.type === 'expense',
      );
      expect(expenses.length).toBeGreaterThan(0);
    });

    it('should handle different financial query variations', async () => {
      const variations = [
        'Faturamento do mês',
        'Resumo financeiro',
        'Balancete',
        'Relatório financeiro',
        'Como estão as finanças?',
        'Receitas e despesas',
      ];

      for (const query of variations) {
        const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-var-${query}`,
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.response.type).toBe('summary');
      }
    });

    it('should include detailed financial records', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Detalhes financeiros',
          sessionId: 'test-session-fin-4',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(Array.isArray(data.response.data)).toBe(true);
      expect(data.response.data.length).toBeGreaterThan(0);

      // Verify record structure
      const record = data.response.data[0];
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('date');
      expect(record).toHaveProperty('type');
      expect(record).toHaveProperty('amount');
      expect(record).toHaveProperty('description');
      expect(record).toHaveProperty('status');
      expect(record).toHaveProperty('category');
    });

    it('should properly categorize financial transactions', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Categorias financeiras',
          sessionId: 'test-session-fin-5',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      const records = data.response.data;

      // Verify all records have categories
      records.forEach((record: any) => {
        expect(record.category).toBeDefined();
        expect(typeof record.category).toBe('string');
        expect(record.category.length).toBeGreaterThan(0);
      });
    });

    it('should handle currency formatting correctly', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Valores financeiros',
          sessionId: 'test-session-fin-6',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify currency column exists
      const currencyColumn = data.response.columns.find(
        (col: any) => col.key === 'amount',
      );
      expect(currencyColumn).toBeDefined();
      expect(currencyColumn.type).toBe('currency');

      // Verify amounts are numbers
      data.response.data.forEach((record: any) => {
        expect(typeof record.amount).toBe('number');
        expect(record.amount).toBeGreaterThan(0);
      });
    });

    it('should handle financial status tracking', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Status dos pagamentos',
          sessionId: 'test-session-fin-7',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      const records = data.response.data;

      // Verify status field exists and has valid values
      const validStatuses = ['paid', 'pending', 'overdue', 'cancelled'];
      records.forEach((record: any) => {
        expect(validStatuses).toContain(record.status);
      });
    });

    it('should calculate financial metrics correctly', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Métricas financeiras',
          sessionId: 'test-session-fin-8',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      const summary = data.response.summary;

      // Verify positive revenue
      expect(summary.totalRevenue).toBeGreaterThan(0);

      // Verify non-negative expenses
      expect(summary.totalExpenses).toBeGreaterThanOrEqual(0);

      // Verify calculation accuracy
      const actualNet = summary.totalRevenue - summary.totalExpenses;
      expect(summary.netIncome).toBe(actualNet);
    });

    it('should handle period-specific queries', async () => {
      const periods = [
        'hoje',
        'esta semana',
        'este mês',
        'últimos 30 dias',
        'trimestre atual',
      ];

      for (const period of periods) {
        const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          body: JSON.stringify({
            query: `Faturamento ${period}`,
            sessionId: `test-session-period-${period}`,
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.response.type).toBe('summary');
      }
    });

    it('should handle empty financial data', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Faturamento do período sem movimentação',
          sessionId: 'test-session-fin-9',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.type).toBe('summary');
      expect(data.response.summary.totalRevenue).toBe(0);
      expect(data.response.summary.totalExpenses).toBe(0);
      expect(data.response.summary.netIncome).toBe(0);
    });

    it('should include date formatting for financial records', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          query: 'Registros financeiros',
          sessionId: 'test-session-fin-10',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify date column exists
      const dateColumn = data.response.columns.find(
        (col: any) => col.key === 'date',
      );
      expect(dateColumn).toBeDefined();
      expect(dateColumn.type).toBe('date');

      // Verify date format
      data.response.data.forEach((record: any) => {
        expect(() => new Date(record.date)).not.toThrow();
      });
    });
  });
});
