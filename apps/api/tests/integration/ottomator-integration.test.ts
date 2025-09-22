/**
 * Ottomator Agent Integration Tests
 *
 * Tests the integration between the Node.js backend and Python ottomator-agents.
 */

import { PermissionContext } from '@neonpro/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AIDataService } from '../../src/services/ai-data-service';
import { OttomatorAgentBridge } from '../../src/services/ottomator-agent-bridge';

describe('Ottomator Agent Integration', () => {
  let dataService: AIDataService;
  let permissionContext: PermissionContext;

  beforeAll(() => {
    // Mock permission context for testing
    permissionContext = {
      _userId: 'test-user-123',
      domain: 'test-clinic',
      _role: 'admin',
      permissions: ['read_clients', 'read_appointments', 'read_financial'],
      dataScope: 'all_clients',
      lastAccess: new Date(),
      sessionExpiry: new Date(Date.now() + 30 * 60 * 1000),
    };

    dataService = new AIDataService(permissionContext);
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('OttomatorAgentBridge', () => {
    it('should create bridge instance', () => {
      const bridge = new OttomatorAgentBridge();
      expect(bridge).toBeDefined();
      expect(bridge.isAgentHealthy()).toBe(false); // Not initialized yet
    });

    it('should handle configuration', () => {
      const config = {
        pythonPath: 'python3',
        agentPath: '/test/path',
        maxConcurrentQueries: 3,
        queryTimeout: 15000,
      };

      const bridge = new OttomatorAgentBridge(config);
      expect(bridge).toBeDefined();
    });
  });

  describe('AIDataService Natural Language Processing', () => {
    it('should process natural language query with fallback', async () => {
      const query = 'Mostre os clientes ativos';
      const sessionId = 'test-session-123';

      const response = await dataService.processNaturalLanguageQuery(
        query,
        sessionId,
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.response).toBeDefined();
      expect(response.response?.content).toContain('cliente');
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.model).toBe('fallback');
    });

    it('should handle appointment queries', async () => {
      const query = 'Quais são os agendamentos de hoje?';
      const sessionId = 'test-session-456';

      const response = await dataService.processNaturalLanguageQuery(
        query,
        sessionId,
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.response?.content).toContain('agendamento');
    });

    it('should handle financial queries', async () => {
      const query = 'Mostre o resumo financeiro';
      const sessionId = 'test-session-789';

      const response = await dataService.processNaturalLanguageQuery(
        query,
        sessionId,
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.response?.content).toContain('financeiro');
    });

    it('should handle unknown queries gracefully', async () => {
      const query = 'Qual é a cor do céu?';
      const sessionId = 'test-session-unknown';

      const response = await dataService.processNaturalLanguageQuery(
        query,
        sessionId,
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.response?.content).toContain('não consegui entender');
    });

    it('should include context in queries', async () => {
      const query = 'Mostre informações do paciente João';
      const sessionId = 'test-session-context';
      const context = {
        patientId: 'patient-123',
        previousQueries: ['Quem é João?'],
      };

      const response = await dataService.processNaturalLanguageQuery(
        query,
        sessionId,
        context,
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
    });
  });

  describe('Intent Detection', () => {
    it('should detect client data intent', async () => {
      const queries = [
        'Mostre os clientes',
        'Informações do paciente Maria',
        'Lista de clientes ativos',
      ];

      for (const query of queries) {
        const response = await dataService.processNaturalLanguageQuery(
          query,
          'test-session',
        );

        expect(response.success).toBe(true);
        expect(response.response?.content).toContain('cliente');
      }
    });

    it('should detect appointment intent', async () => {
      const queries = [
        'Agendamentos de hoje',
        'Consultas da semana',
        'Horários disponíveis',
      ];

      for (const query of queries) {
        const response = await dataService.processNaturalLanguageQuery(
          query,
          'test-session',
        );

        expect(response.success).toBe(true);
        expect(response.response?.content).toContain('agendamento');
      }
    });

    it('should detect financial intent', async () => {
      const queries = [
        'Resumo financeiro',
        'Valores recebidos hoje',
        'Pagamentos pendentes',
      ];

      for (const query of queries) {
        const response = await dataService.processNaturalLanguageQuery(
          query,
          'test-session',
        );

        expect(response.success).toBe(true);
        expect(response.response?.content).toContain('financeiro');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty queries', async () => {
      const response = await dataService.processNaturalLanguageQuery(
        '',
        'test-session',
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.response?.content).toContain('não consegui entender');
    });

    it('should handle very long queries', async () => {
      const longQuery = 'A'.repeat(1000) + ' clientes';

      const response = await dataService.processNaturalLanguageQuery(
        longQuery,
        'test-session',
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
    });

    it('should handle special characters in queries', async () => {
      const specialQuery = 'Clientes com @#$%^&*()';

      const response = await dataService.processNaturalLanguageQuery(
        specialQuery,
        'test-session',
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();

      const response = await dataService.processNaturalLanguageQuery(
        'Clientes ativos',
        'test-session',
      );

      const duration = Date.now() - startTime;

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(duration).toBeLessThan(5000); // Should respond within 5 seconds
      expect(response.metadata?.processingTimeMs).toBeLessThan(5000);
    });

    it('should handle concurrent queries', async () => {
      const queries = [
        'Clientes ativos',
        'Agendamentos hoje',
        'Resumo financeiro',
      ];

      const promises = queries.map((query, index) =>
        dataService.processNaturalLanguageQuery(query, `session-${index}`)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
      });
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted response', async () => {
      const response = await dataService.processNaturalLanguageQuery(
        'Clientes ativos',
        'test-session',
      );

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.response).toBeDefined();
      expect(response.response?.content).toBeDefined();
      expect(response.response?.type).toBeDefined();
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.processingTimeMs).toBeGreaterThan(0);
    });

    it('should include sources in response', async () => {
      const response = await dataService.processNaturalLanguageQuery(
        'Clientes ativos',
        'test-session',
      );

      expect(response.response?.sources).toBeDefined();
      expect(Array.isArray(response.response?.sources)).toBe(true);
      expect(response.response?.sources?.length).toBeGreaterThan(0);
    });
  });
});
