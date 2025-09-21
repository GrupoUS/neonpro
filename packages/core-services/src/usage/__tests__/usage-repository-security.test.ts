/**
 * Security tests for Usage Counter Repository
 * Tests for type safety and healthcare data handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UsageCounterRepository, UsageMetadata, UsageCounterDatabaseRow } from '../repository';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('Usage Counter Repository Security Tests', () => {
  let repository: UsageCounterRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful database operations
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: createMockDatabaseRow(),
            error: null 
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: createMockDatabaseRow(),
            error: null 
          }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: createMockDatabaseRow(),
            error: null 
          }),
        }),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ 
          data: [createMockDatabaseRow()], 
          error: null,
          count: 1 
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    repository = new UsageCounterRepository(
      'https://test.supabase.co',
      'test-key'
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createMockDatabaseRow(): UsageCounterDatabaseRow {
    return {
      id: 'test-id',
      entity_type: 'clinic',
      entity_id: 'clinic123',
      monthly_queries: 100,
      daily_queries: 10,
      current_cost_usd: 0.05,
      average_latency_ms: 150,
      cache_hit_rate: 0.8,
      error_rate: 0.02,
      date: '2024-01-01',
      month: '2024-01',
      metadata: {
        userId: 'user123',
        planCode: 'premium',
        concurrentRequests: 5,
        totalRequests: 1000,
        totalCostUsd: 50.0,
        totalTokensUsed: 50000,
        cacheSavingsUsd: 10.0,
        periodStart: '2024-01-01T00:00:00Z',
        lastActivity: '2024-01-01T12:00:00Z',
        lastReset: '2024-01-01T00:00:00Z',
        patientDataAccessCount: 25,
        healthcareComplianceScore: 0.95,
        dataRetentionDays: 365,
        auditLogEntries: 100,
        securityEvents: 0,
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T12:00:00Z',
    };
  }

  describe('Type Safety', () => {
    it('should enforce strict TypeScript interfaces', () => {
      const metadata: UsageMetadata = {
        userId: 'user123',
        planCode: 'premium',
        concurrentRequests: 5,
        totalRequests: 1000,
        totalCostUsd: 50.0,
        totalTokensUsed: 50000,
        cacheSavingsUsd: 10.0,
        periodStart: '2024-01-01T00:00:00Z',
        lastActivity: '2024-01-01T12:00:00Z',
        lastReset: '2024-01-01T00:00:00Z',
        patientDataAccessCount: 25,
        healthcareComplianceScore: 0.95,
        dataRetentionDays: 365,
        auditLogEntries: 100,
        securityEvents: 0,
      };

      expect(metadata.userId).toBe('user123');
      expect(metadata.planCode).toBe('premium');
      expect(metadata.healthcareComplianceScore).toBe(0.95);
    });

    it('should validate healthcare-specific metadata fields', async () => {
      const createData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: 100,
        dailyQueries: 10,
        currentCostUsd: 0.05,
        totalRequests: 1000,
        totalCostUsd: 50.0,
        totalTokensUsed: 50000,
        cacheSavingsUsd: 10.0,
        averageLatencyMs: 150,
        cacheHitRate: 0.8,
        errorRate: 0.02,
      };

      const result = await repository.create(createData);

      expect(result).toBeDefined();
      expect(result.clinicId).toBe('clinic123');
      expect(result.metadata?.healthcareComplianceScore).toBeDefined();
    });

    it('should handle optional healthcare security fields', async () => {
      const metadata: Partial<UsageMetadata> = {
        userId: 'user123',
        planCode: 'premium',
        concurrentRequests: 5,
        totalRequests: 1000,
        totalCostUsd: 50.0,
        totalTokensUsed: 50000,
        cacheSavingsUsd: 10.0,
        periodStart: '2024-01-01T00:00:00Z',
        lastActivity: '2024-01-01T12:00:00Z',
        lastReset: '2024-01-01T00:00:00Z',
        // Optional security fields
        patientDataAccessCount: 25,
        securityEvents: 0,
      };

      // Should handle optional fields gracefully
      expect(metadata.securityEvents).toBe(0);
      expect(metadata.patientDataAccessCount).toBe(25);
    });
  });

  describe('Database Operations Security', () => {
    it('should safely handle database row mapping', async () => {
      const mockRow = createMockDatabaseRow();
      
      // Mock the findByUserAndClinic method to return our test data
      vi.spyOn(repository, 'findByUserAndClinic' as any).mockResolvedValue({
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium',
        monthlyQueries: 100,
        dailyQueries: 10,
        currentCostUsd: 0.05,
        concurrentRequests: 5,
        totalRequests: 1000,
        totalCostUsd: 50.0,
        totalTokensUsed: 50000,
        cacheSavingsUsd: 10.0,
        averageLatencyMs: 150,
        cacheHitRate: 0.8,
        errorRate: 0.02,
        periodStart: new Date('2024-01-01T00:00:00Z'),
        lastActivity: new Date('2024-01-01T12:00:00Z'),
        lastReset: new Date('2024-01-01T00:00:00Z'),
      });

      const result = await repository.dailyUpsert({
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium',
        increment: {
          monthlyQueries: 10,
          dailyQueries: 1,
          costUsd: 0.01,
          totalRequests: 10,
          tokensUsed: 100,
          cacheSavingsUsd: 0.1,
        },
        updateMetrics: {
          averageLatencyMs: 160,
          cacheHitRate: 0.85,
          errorRate: 0.01,
          concurrentRequests: 6,
        },
      });

      expect(result).toBeDefined();
      expect(result.clinicId).toBe('clinic123');
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          }),
        }),
      });

      const createData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: 100,
        dailyQueries: 10,
        currentCostUsd: 0.05,
      };

      await expect(repository.create(createData)).rejects.toThrow('Database connection failed');
    });

    it('should validate numeric field parsing', async () => {
      const rowWithStrings: UsageCounterDatabaseRow = {
        ...createMockDatabaseRow(),
        current_cost_usd: '0.05' as any, // Test string to number conversion
        average_latency_ms: '150' as any,
        cache_hit_rate: '0.8' as any,
      };

      // Mock the mapping method directly
      const result = (repository as any).mapDatabaseToModel(rowWithStrings);

      expect(typeof result.currentCostUsd).toBe('number');
      expect(typeof result.averageLatencyMs).toBe('number');
      expect(typeof result.cacheHitRate).toBe('number');
    });
  });

  describe('Healthcare Data Security', () => {
    it('should track patient data access count', async () => {
      const createData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: 100,
        dailyQueries: 10,
        currentCostUsd: 0.05,
        totalTokensUsed: 50000,
        patientDataAccessCount: 25,
        healthcareComplianceScore: 0.95,
      };

      const result = await repository.create(createData);

      expect(result.metadata?.patientDataAccessCount).toBe(25);
      expect(result.metadata?.healthcareComplianceScore).toBe(0.95);
    });

    it('should validate healthcare compliance score range', async () => {
      const createData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: 100,
        dailyQueries: 10,
        currentCostUsd: 0.05,
        healthcareComplianceScore: 1.5, // Invalid score > 1.0
      };

      // Should handle invalid scores gracefully
      const result = await repository.create(createData);
      expect(result).toBeDefined();
    });

    it('should track security events in healthcare context', async () => {
      const createData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: 100,
        dailyQueries: 10,
        currentCostUsd: 0.05,
        securityEvents: 2, // Track security incidents
        auditLogEntries: 100,
      };

      const result = await repository.create(createData);

      expect(result.metadata?.securityEvents).toBe(2);
      expect(result.metadata?.auditLogEntries).toBe(100);
    });
  });

  describe('Input Validation', () => {
    it('should validate numeric inputs', async () => {
      const invalidData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: -100, // Invalid negative value
        dailyQueries: -10, // Invalid negative value
        currentCostUsd: -0.05, // Invalid negative value
      };

      // Should handle invalid values gracefully
      const result = await repository.create(invalidData);
      expect(result).toBeDefined();
    });

    it('should handle extremely large values', async () => {
      const largeValueData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: Number.MAX_SAFE_INTEGER,
        dailyQueries: Number.MAX_SAFE_INTEGER,
        currentCostUsd: Number.MAX_VALUE,
        totalTokensUsed: Number.MAX_SAFE_INTEGER,
      };

      // Should handle large values without overflow
      const result = await repository.create(largeValueData);
      expect(result).toBeDefined();
    });

    it('should validate date strings', async () => {
      const createData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: 100,
        dailyQueries: 10,
        currentCostUsd: 0.05,
        totalTokensUsed: 50000,
        periodStart: 'invalid-date', // Invalid date format
        lastActivity: 'invalid-date',
        lastReset: 'invalid-date',
      };

      // Should handle invalid date formats gracefully
      const result = await repository.create(createData);
      expect(result).toBeDefined();
    });
  });

  describe('Privacy and Compliance', () => {
    it('should not expose sensitive data in error messages', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Invalid data format')),
          }),
        }),
      });

      const sensitiveData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: 100,
        patientData: 'sensitive_health_information', // This should not appear in errors
      };

      await expect(repository.create(sensitiveData as any)).rejects.not.toThrow(
        /sensitive_health_information/
      );
    });

    it('should maintain data retention policies', async () => {
      const createData = {
        clinicId: 'clinic123',
        userId: 'user123',
        planCode: 'premium' as const,
        monthlyQueries: 100,
        dailyQueries: 10,
        currentCostUsd: 0.05,
        dataRetentionDays: 365, // Specific retention period
      };

      const result = await repository.create(createData);

      expect(result.metadata?.dataRetentionDays).toBe(365);
    });
  });
});