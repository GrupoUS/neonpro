/**
 * Unit Tests for AIDataService
 *
 * Tests the core functionality of the AI Data Service including:
 * - Permission validation
 * - Data access methods
 * - Natural language query processing
 * - Audit logging
 * - Error handling
 */

import { PermissionContext } from '@neonpro/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIDataService } from '../../src/services/ai-data-service';

// Mock data for tests
let mockQueryResult = { data: [], error: null };

// Mock query builder
const mockQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  // Make it awaitable
  then: vi.fn(resolve => resolve(mockQueryResult)),
  catch: vi.fn(),
};

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => mockQuery),
  rpc: vi.fn(() => mockQuery),
};

// Mock createClient
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
})

// Mock ottomator bridge
vi.mock('../../src/services/ottomator-agent-bridge', () => ({
  getOttomatorBridge: vi.fn(() => ({
    isAgentHealthy: vi.fn(() => false),
    processQuery: vi.fn(),
  })),
})

describe('AIDataService', () => {
  let dataService: AIDataService;
  let mockPermissionContext: PermissionContext;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks(

    // Setup mock permission context
    mockPermissionContext = {
      _userId: 'test-user-123',
      domain: 'test-clinic',
      _role: 'admin',
      permissions: ['read_clients', 'read_appointments', 'read_financial'],
      dataScope: 'all_clients',
      lastAccess: new Date(),
      sessionExpiry: new Date(Date.now() + 30 * 60 * 1000),
    };

    // Setup mock query chain
    mockSupabaseClient.from.mockReturnValue(mockQuery
    mockSupabaseClient.rpc.mockReturnValue(mockQuery

    dataService = new AIDataService(mockPermissionContext
  }

  describe('Constructor and Initialization', () => {
    it('should initialize with permission context', () => {
      expect(dataService).toBeDefined(
      expect(dataService.getPermissionContext()).toEqual(mockPermissionContext
    }

    it('should initialize Supabase client', () => {
      expect(mockSupabaseClient).toBeDefined(
    }
  }

  describe('Permission Validation', () => {
    it('should allow access with correct permissions', async () => {
      mockQuery.single.mockResolvedValue({ data: [], error: null }

      await expect(dataService.getClientsByName({ clientNames: ['test'] }))
        .resolves.not.toThrow(
    }

    it('should deny access without client permissions', async () => {
      const restrictedContext = {
        ...mockPermissionContext,
        permissions: ['read_appointments'], // Missing read_clients
      };

      const restrictedService = new AIDataService(restrictedContext

      await expect(restrictedService.getClientsByName({ clientNames: ['test'] }))
        .rejects.toThrow('Access denied: Insufficient permissions for client data access')
    }

    it('should deny access without appointment permissions', async () => {
      const restrictedContext = {
        ...mockPermissionContext,
        permissions: ['read_clients'], // Missing read_appointments
      };

      const restrictedService = new AIDataService(restrictedContext

      await expect(restrictedService.getAppointmentsByDate({ dateRanges: [] }))
        .rejects.toThrow('Access denied: Insufficient permissions for appointment data access')
    }

    it('should deny access without financial permissions', async () => {
      const restrictedContext = {
        ...mockPermissionContext,
        permissions: ['read_clients'], // Missing read_financial
      };

      const restrictedService = new AIDataService(restrictedContext

      await expect(restrictedService.getFinancialSummary({}))
        .rejects.toThrow('Access denied: Insufficient permissions for financial data access')
    }

    it('should require domain specification', async () => {
      const noDomainContext = {
        ...mockPermissionContext,
        domain: '', // Empty domain
      };

      const noDomainService = new AIDataService(noDomainContext

      await expect(noDomainService.getClientsByName({ clientNames: ['test'] }))
        .rejects.toThrow('Access denied: User domain not specified')
    }
  }

  describe('Client Data Access', () => {
    beforeEach(() => {
      // Reset mocks and set up test data
      vi.clearAllMocks(

      // Set mock data for this test suite
      mockQueryResult = {
        data: [
          { id: '1', name: 'João Silva', email: 'joao@test.com' },
          { id: '2', name: 'Maria Santos', email: 'maria@test.com' },
        ],
        error: null,
      };
    }

    it('should retrieve clients by name', async () => {
      const result = await dataService.getClientsByName({
        clientNames: ['João', 'Maria'],
      }

      expect(result).toHaveLength(2
      expect(result[0].name).toBe('João Silva')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('clients')
    }

    it('should apply domain filter', async () => {
      await dataService.getClientsByName({ clientNames: ['test'] }

      expect(mockQuery.eq).toHaveBeenCalledWith('domain', 'test-clinic')
    }

    it('should handle empty client names', async () => {
      const result = await dataService.getClientsByName({ clientNames: [] }

      expect(result).toBeDefined(
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('clients')
    }

    it('should handle database errors', async () => {
      // Set error result for this test
      mockQueryResult = {
        data: null,
        error: { message: 'Database connection failed' },
      };

      await expect(dataService.getClientsByName({ clientNames: ['test'] }))
        .rejects.toThrow('Failed to retrieve clients: Database connection failed')
    }
  }

  describe('Appointment Data Access', () => {
    beforeEach(() => {
      // Reset mocks and set up appointment test data
      vi.clearAllMocks(

      mockQueryResult = {
        data: [
          {
            id: '1',
            datetime: '2024-12-21T10:00:00Z',
            clients: { name: 'João Silva' },
            providers: { name: 'Dr. Ana' },
          },
        ],
        error: null,
      };
    }

    it('should retrieve appointments by date range', async () => {
      const dateRange = {
        start: new Date('2024-12-21'),
        end: new Date('2024-12-22'),
      };

      const result = await dataService.getAppointmentsByDate({
        dateRanges: [dateRange],
      }

      expect(result).toHaveLength(1
      expect(result[0].clients.name).toBe('João Silva')
      expect(mockQuery.gte).toHaveBeenCalledWith('datetime', dateRange.start.toISOString()
      expect(mockQuery.lte).toHaveBeenCalledWith('datetime', dateRange.end.toISOString()
    }

    it('should order appointments by datetime', async () => {
      await dataService.getAppointmentsByDate({ dateRanges: [] }

      expect(mockQuery.order).toHaveBeenCalledWith('datetime', { ascending: true }
    }
  }

  describe('Financial Data Access', () => {
    beforeEach(() => {
      // Reset mocks and set up financial test data
      vi.clearAllMocks(

      // Set up RPC mock for financial queries
      mockSupabaseClient.rpc.mockResolvedValue({
        data: { total_revenue: 5000, total_expenses: 2000 },
        error: null,
      }
    }

    it('should retrieve financial summary', async () => {
      const result = await dataService.getFinancialSummary({
        financial: { period: 'today', type: 'all' },
      }

      expect(result.total_revenue).toBe(5000
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_financial_summary', {
        domain_filter: 'test-clinic',
        date_filter: expect.stringContaining('date::date'),
        type_filter: 'all',
      }
    }

    it('should restrict financial access to admin role', async () => {
      const nonAdminContext = {
        ...mockPermissionContext,
        _role: 'receptionist' as const,
      };

      const nonAdminService = new AIDataService(nonAdminContext

      await expect(nonAdminService.getFinancialSummary({}))
        .rejects.toThrow('Access denied: Insufficient permissions for financial data access')
    }
  }

  describe('Natural Language Query Processing', () => {
    beforeEach(() => {
      // Reset mocks and set up NLP test data
      vi.clearAllMocks(

      // Set up mock data with clients for NLP tests
      mockQueryResult = {
        data: [
          { id: '1', name: 'João Silva', email: 'joao@test.com' },
          { id: '2', name: 'Maria Santos', email: 'maria@test.com' },
        ],
        error: null,
      };
    }

    it('should process natural language queries with fallback', async () => {
      const response = await dataService.processNaturalLanguageQuery(
        'Mostre os clientes ativos',
        'test-session',
      

      expect(response).toBeDefined(
      expect(response.success).toBe(true);
      expect(response.response?.content).toContain('cliente')
      expect(response.metadata?.model).toBe('fallback')
    }

    it('should detect client intent', async () => {
      const response = await dataService.processNaturalLanguageQuery(
        'Informações do paciente João',
        'test-session',
      

      expect(response.response?.content).toContain('cliente')
    }

    it('should detect appointment intent', async () => {
      const response = await dataService.processNaturalLanguageQuery(
        'Agendamentos de hoje',
        'test-session',
      

      expect(response.response?.content).toContain('agendamento')
    }

    it('should detect financial intent', async () => {
      // Set up RPC mock for financial queries
      mockSupabaseClient.rpc.mockResolvedValue({ data: {}, error: null }

      const response = await dataService.processNaturalLanguageQuery(
        'Resumo financeiro',
        'test-session',
      

      expect(response.response?.content).toContain('financeiro')
    }

    it('should handle unknown queries gracefully', async () => {
      const response = await dataService.processNaturalLanguageQuery(
        'Qual é a cor do céu?',
        'test-session',
      

      expect(response.success).toBe(true);
      expect(response.response?.content).toContain('não consegui entender')
    }
  }

  describe('Audit Logging', () => {
    beforeEach(() => {
      // Reset mocks and set up audit logging test data
      vi.clearAllMocks(

      mockQueryResult = { data: [], error: null };
      mockQuery.insert.mockResolvedValue({ data: null, error: null }
    }

    it('should log successful data access', async () => {
      await dataService.getClientsByName({ clientNames: ['test'] }

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('audit_logs')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: 'test-user-123',
        action: 'ai_agent_client_data',
        entity_type: 'client_data',
        parameters: { clientNames: ['test'] },
        record_count: 0,
        success: true,
        domain: 'test-clinic',
        timestamp: expect.any(String),
      }
    }

    it('should log failed data access', async () => {
      // Set error result for this test
      mockQueryResult = {
        data: null,
        error: { message: 'Access denied' },
      };

      await expect(dataService.getClientsByName({ clientNames: ['test'] }))
        .rejects.toThrow(

      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          record_count: 0,
        }),
      
    }
  }

  describe('Health Check', () => {
    beforeEach(() => {
      // Reset mocks for health check tests
      vi.clearAllMocks(
    }

    it('should return healthy status when database is accessible', async () => {
      mockQueryResult = { data: [], error: null };

      const health = await dataService.healthCheck(

      expect(health.status).toBe('healthy')
      expect(health.database).toBe('connected')
      expect(health.timestamp).toBeDefined(
    }

    it('should return unhealthy status when database is inaccessible', async () => {
      mockQueryResult = {
        data: null,
        error: { message: 'Connection failed' },
      };

      const health = await dataService.healthCheck(

      expect(health.status).toBe('unhealthy')
      expect(health.database).toBe('disconnected')
    }
  }

  describe('Permission Context Management', () => {
    it('should update permission context', () => {
      const newContext = {
        ...mockPermissionContext,
        _role: 'receptionist' as const,
      };

      dataService.updatePermissionContext(newContext

      expect(dataService.getPermissionContext()._role).toBe('receptionist')
    }

    it('should return copy of permission context', () => {
      const context = dataService.getPermissionContext(
      context.role = 'modified' as any;

      expect(dataService.getPermissionContext()._role).toBe('admin')
    }
  }
}
