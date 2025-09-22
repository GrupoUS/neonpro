import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { AIDataService } from '../../apps/api/src/services/ai-data-service';
import { PermissionContext, QueryIntent, QueryParameters } from '@neonpro/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getOttomatorBridge } from '../../apps/api/src/services/ottomator-agent-bridge';

// Mock dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

vi.mock('../../../apps/api/src/services/ottomator-agent-bridge', () => ({
  getOttomatorBridge: vi.fn(),
}));

describe('AIDataService', () => {
  let aiDataService: AIDataService;
  let mockSupabase: SupabaseClient;
  let mockPermissionContext: PermissionContext;
  let mockGetOttomatorBridge: Mock;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn(),
    } as any;

    (createClient as Mock).mockReturnValue(mockSupabase);

    // Mock Ottomator bridge
    mockGetOttomatorBridge = getOttomatorBridge as Mock;
    mockGetOttomatorBridge.mockReturnValue({
      processQuery: vi.fn(),
      isHealthy: vi.fn().mockReturnValue(true),
    });

    // Create test permission context
    mockPermissionContext = {
      userId: 'test-user-id',
      role: 'healthcare_professional',
      permissions: ['read_clients', 'read_appointments', 'read_financial'],
      domain: 'test-clinic',
    };

    aiDataService = new AIDataService(mockPermissionContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize Supabase client with correct configuration', () => {
      expect(createClient).toHaveBeenCalledWith(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            persistSession: false,
          },
        }
      );
    });

    it('should store permission context', () => {
      expect((aiDataService as any).permissionContext).toEqual(mockPermissionContext);
    });
  });

  describe('Permission Validation', () => {
    it('should allow access to client data with proper permissions', () => {
      const context = { ...mockPermissionContext, permissions: ['read_clients'] };
      const service = new AIDataService(context);
      
      expect(() => (service as any).validatePermission('client_data')).not.toThrow();
    });

    it('should deny access to client data without proper permissions', () => {
      const context = { ...mockPermissionContext, permissions: ['read_appointments'] };
      const service = new AIDataService(context);
      
      expect(() => (service as any).validatePermission('client_data')).toThrow(
        'Access denied: Insufficient permissions for client data access'
      );
    });

    it('should deny access without domain specified', () => {
      const context = { ...mockPermissionContext, domain: undefined as any };
      const service = new AIDataService(context);
      
      expect(() => (service as any).validatePermission('client_data')).toThrow(
        'Access denied: User domain not specified'
      );
    });

    it('should allow general queries without specific permissions', () => {
      const context = { ...mockPermissionContext, permissions: [] };
      const service = new AIDataService(context);
      
      expect(() => (service as any).validatePermission('general')).not.toThrow();
    });
  });

  describe('Audit Logging', () => {
    it('should log successful data access', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      await (aiDataService as any).logAccess('client_data', { clientNames: ['test'] }, 5, true);

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        action: 'ai_agent_client_data',
        entity_type: 'client_data',
        parameters: { clientNames: ['test'] },
        record_count: 5,
        success: true,
        domain: 'test-clinic',
        timestamp: expect.any(String),
      });
    });

    it('should handle audit logging failures gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      await expect((aiDataService as any).logAccess('client_data', {}, 0, false)).resolves.not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to log audit entry:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Domain Filtering', () => {
    it('should apply domain filter to queries', () => {
      const mockQuery = { eq: vi.fn().mockReturnThis() };
      const result = (aiDataService as any).withDomainFilter(mockQuery, 'test-domain');
      
      expect(mockQuery.eq).toHaveBeenCalledWith('domain', 'test-domain');
      expect(result).toBe(mockQuery);
    });
  });

  describe('getClientsByName', () => {
    const mockParameters: QueryParameters = {
      clientNames: ['John Doe', 'Jane Smith'],
    };

    it('should retrieve clients with domain filtering', async () => {
      const mockData = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      } as any);

      (mockSupabase.select as Mock).mockResolvedValue({ data: mockData, error: null });

      const result = await aiDataService.getClientsByName(mockParameters);

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        id,
        name,
        email,
        phone,
        address,
        birth_date,
        created_at,
        updated_at
      `);
      expect(result).toEqual(mockData);
    });

    it('should handle case-insensitive name search', async () => {
      const mockData = [{ id: 1, name: 'john doe', email: 'john@example.com' }];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      } as any);

      (mockSupabase.select as Mock).mockResolvedValue({ data: mockData, error: null });

      await aiDataService.getClientsByName({ clientNames: ['John Doe'] });

      expect(mockSupabase.or).toHaveBeenCalledWith('name.ilike.%John Doe%');
    });

    it('should apply role-based filtering for receptionists', async () => {
      const receptionistContext = { ...mockPermissionContext, role: 'receptionist' };
      const service = new AIDataService(receptionistContext);

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      } as any);

      (mockSupabase.select as Mock).mockResolvedValue({ data: [], error: null });

      await service.getClientsByName(mockParameters);

      // Should call select twice - once for full fields, once for limited fields
      expect(mockSupabase.select).toHaveBeenLastCalledWith('id, name, email, phone');
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      } as any);

      (mockSupabase.select as Mock).mockResolvedValue({ data: null, error: mockError });

      await expect(aiDataService.getClientsByName(mockParameters)).rejects.toThrow(
        'Failed to retrieve clients: Database connection failed'
      );
    });

    it('should return empty array when no data found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      } as any);

      (mockSupabase.select as Mock).mockResolvedValue({ data: null, error: null });

      const result = await aiDataService.getClientsByName(mockParameters);
      
      expect(result).toEqual([]);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large result sets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Client ${i + 1}`,
        email: `client${i + 1}@example.com`,
      }));

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      } as any);

      (mockSupabase.select as Mock).mockResolvedValue({ data: largeDataset, error: null });

      const startTime = Date.now();
      const result = await aiDataService.getClientsByName({ clientNames: ['Client'] });
      const endTime = Date.now();

      expect(result.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle concurrent requests', async () => {
      const mockData = [{ id: 1, name: 'Test Client', email: 'test@example.com' }];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      } as any);

      (mockSupabase.select as Mock).mockResolvedValue({ data: mockData, error: null });

      // Run multiple requests concurrently
      const promises = Array.from({ length: 10 }, () => 
        aiDataService.getClientsByName({ clientNames: ['Test'] })
      );

      const results = await Promise.all(promises);
      
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result).toEqual(mockData);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty client names parameter', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      } as any);

      (mockSupabase.select as Mock).mockResolvedValue({ data: [], error: null });

      await aiDataService.getClientsByName({ clientNames: [] });

      expect(mockSupabase.or).not.toHaveBeenCalled();
    });

    it('should handle special characters in client names', async () => {
      const mockData = [{ id: 1, name: "O'Connor", email: 'oconnor@example.com' }];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      } as any);

      (mockSupabase.select as Mock).mockResolvedValue({ data: mockData, error: null });

      await aiDataService.getClientsByName({ clientNames: ["O'Connor"] });

      expect(mockSupabase.or).toHaveBeenCalledWith("name.ilike.%O'Connor%");
    });

    it('should validate permission before executing query', async () => {
      const context = { ...mockPermissionContext, permissions: [] };
      const service = new AIDataService(context);

      await expect(service.getClientsByName({ clientNames: ['Test'] })).rejects.toThrow(
        'Access denied: Insufficient permissions for client data access'
      );
    });
  });
});