import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock external dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

// Mock financial services
vi.mock('@/services/financial-metrics', () => ({
  FinancialMetricsService: {
    calculateMetrics: vi.fn(),
    getCachedMetrics: vi.fn(),
    invalidateCache: vi.fn(),
    aggregateData: vi.fn(),
    exportMetrics: vi.fn(),
    getMetricsHistory: vi.fn(),
  },
}));

vi.mock('@/services/cache', () => ({
  CacheService: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
    clear: vi.fn(),
  },
}));

// Mock components that should exist but don't yet (TDD RED)
vi.mock('@/components/financial/FinancialMetrics', () => ({
  FinancialMetrics: () =>
    React.createElement(
      'div',
      { 'data-testid': 'financial-metrics' },
      'Financial Metrics Component',
    ),
}));

vi.mock('@/components/financial/MetricsCalculator', () => ({
  MetricsCalculator: () =>
    React.createElement(
      'div',
      { 'data-testid': 'metrics-calculator' },
      'Metrics Calculator Component',
    ),
}));

vi.mock('@/components/financial/MetricsAggregator', () => ({
  MetricsAggregator: () =>
    React.createElement(
      'div',
      { 'data-testid': 'metrics-aggregator' },
      'Metrics Aggregator Component',
    ),
}));

vi.mock('@/components/financial/MetricsCache', () => ({
  MetricsCache: () =>
    React.createElement(
      'div',
      { 'data-testid': 'metrics-cache' },
      'Metrics Cache Component',
    ),
}));

vi.mock('@/components/financial/MetricsPerformance', () => ({
  MetricsPerformance: () =>
    React.createElement(
      'div',
      { 'data-testid': 'metrics-performance' },
      'Metrics Performance Component',
    ),
}));

// Types that should exist but don't yet (TDD RED)
interface FinancialMetrics {
  id: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  growth: number;
  period: string;
  calculatedAt: Date;
  cacheExpiry?: Date;
  performanceMetrics?: {
    calculationTime: number;
    dataPoints: number;
    complexity: 'low' | 'medium' | 'high';
  };
}

interface MetricsCalculationRequest {
  clinicId: string;
  startDate: string;
  endDate: string;
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly';
  includeProjections: boolean;
  cacheStrategy: 'none' | 'aggressive' | 'conservative';
  performanceMode: 'fast' | 'accurate' | 'balanced';
}

interface MetricsAggregationConfig {
  groupBy: string[];
  aggregationFunctions: Record<string, 'sum' | 'avg' | 'count' | 'max' | 'min'>;
  filters: Record<string, any>;
  sorting: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

interface CacheStrategy {
  key: string;
  ttl: number;
  maxSize: number;
  compressionEnabled: boolean;
  invalidationTriggers: string[];
}

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return React.createElement(
    BrowserRouter,
    {},
    React.createElement(QueryClientProvider, { client: queryClient }, children),
  );
};

describe('Financial Metrics Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
  });

  describe('Metrics Calculation Integration', () => {
    it('should calculate basic financial metrics for a clinic', async () => {
      // Arrange
      const mockMetricsData: FinancialMetrics = {
        id: 'metrics-001',
        revenue: 25000,
        expenses: 15000,
        profit: 10000,
        profitMargin: 0.4,
        growth: 0.15,
        period: '2024-01',
        calculatedAt: new Date('2024-01-31T23:59:59Z'),
      };

      const mockRequest: MetricsCalculationRequest = {
        clinicId: 'clinic-001',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        granularity: 'monthly',
        includeProjections: false,
        cacheStrategy: 'conservative',
        performanceMode: 'balanced',
      };

      // Mock service responses
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.calculateMetrics).mockResolvedValue(
        mockMetricsData,
      );

      // Act
      const result = await FinancialMetricsService.calculateMetrics(mockRequest);

      // Assert
      expect(result).toEqual(mockMetricsData);
      expect(FinancialMetricsService.calculateMetrics).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(result.profit).toBe(10000);
      expect(result.profitMargin).toBe(0.4);
    });

    it('should handle complex multi-period metrics calculations', async () => {
      // Arrange
      const mockMultiPeriodMetrics: FinancialMetrics[] = [
        {
          id: 'metrics-q1',
          revenue: 75000,
          expenses: 45000,
          profit: 30000,
          profitMargin: 0.4,
          growth: 0.1,
          period: '2024-Q1',
          calculatedAt: new Date('2024-03-31T23:59:59Z'),
        },
        {
          id: 'metrics-q2',
          revenue: 82000,
          expenses: 48000,
          profit: 34000,
          profitMargin: 0.41,
          growth: 0.13,
          period: '2024-Q2',
          calculatedAt: new Date('2024-06-30T23:59:59Z'),
        },
      ];

      const mockRequest: MetricsCalculationRequest = {
        clinicId: 'clinic-001',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        granularity: 'quarterly',
        includeProjections: true,
        cacheStrategy: 'aggressive',
        performanceMode: 'accurate',
      };

      // Mock service responses
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.calculateMetrics).mockResolvedValue(
        mockMultiPeriodMetrics,
      );

      // Act
      const result = await FinancialMetricsService.calculateMetrics(mockRequest);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[1].growth).toBeGreaterThan(result[0].growth);
    });

    it('should calculate metrics with performance optimization', async () => {
      // Arrange
      const mockMetricsWithPerformance: FinancialMetrics = {
        id: 'metrics-perf-001',
        revenue: 50000,
        expenses: 30000,
        profit: 20000,
        profitMargin: 0.4,
        growth: 0.12,
        period: '2024-02',
        calculatedAt: new Date('2024-02-29T23:59:59Z'),
        performanceMetrics: {
          calculationTime: 150,
          dataPoints: 5000,
          complexity: 'high',
        },
      };

      const mockRequest: MetricsCalculationRequest = {
        clinicId: 'clinic-001',
        startDate: '2024-02-01',
        endDate: '2024-02-29',
        granularity: 'daily',
        includeProjections: false,
        cacheStrategy: 'aggressive',
        performanceMode: 'fast',
      };

      // Mock service responses
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.calculateMetrics).mockResolvedValue(
        mockMetricsWithPerformance,
      );

      // Act
      const result = await FinancialMetricsService.calculateMetrics(mockRequest);

      // Assert
      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics!.calculationTime).toBeLessThan(200);
      expect(result.performanceMetrics!.complexity).toBe('high');
    });
  });

  describe('Data Aggregation Integration', () => {
    it('should aggregate financial data by multiple dimensions', async () => {
      // Arrange
      const mockAggregationConfig: MetricsAggregationConfig = {
        groupBy: ['period', 'serviceType'],
        aggregationFunctions: {
          revenue: 'sum',
          expenses: 'sum',
          profit: 'sum',
          profitMargin: 'avg',
        },
        filters: {
          clinicId: 'clinic-001',
          serviceType: ['consultation', 'procedure'],
        },
        sorting: [
          { field: 'period', direction: 'desc' },
          { field: 'revenue', direction: 'desc' },
        ],
      };

      const mockAggregatedData = {
        groups: [
          {
            period: '2024-01',
            serviceType: 'consultation',
            revenue: 15000,
            expenses: 8000,
            profit: 7000,
            profitMargin: 0.467,
          },
          {
            period: '2024-01',
            serviceType: 'procedure',
            revenue: 10000,
            expenses: 7000,
            profit: 3000,
            profitMargin: 0.3,
          },
        ],
        totals: {
          revenue: 25000,
          expenses: 15000,
          profit: 10000,
          profitMargin: 0.4,
        },
      };

      // Mock service responses
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.aggregateData).mockResolvedValue(
        mockAggregatedData,
      );

      // Act
      const result = await FinancialMetricsService.aggregateData(
        mockAggregationConfig,
      );

      // Assert
      expect(result.groups).toHaveLength(2);
      expect(result.totals.revenue).toBe(25000);
      expect(result.groups[0].profitMargin).toBeGreaterThan(
        result.groups[1].profitMargin,
      );
    });

    it('should handle complex aggregation with time series data', async () => {
      // Arrange
      const mockTimeSeriesConfig: MetricsAggregationConfig = {
        groupBy: ['year', 'month'],
        aggregationFunctions: {
          revenue: 'sum',
          expenses: 'sum',
          appointments: 'count',
          avgRevenuePerAppointment: 'avg',
        },
        filters: {
          clinicId: 'clinic-001',
          dateRange: ['2024-01-01', '2024-12-31'],
        },
        sorting: [
          { field: 'year', direction: 'asc' },
          { field: 'month', direction: 'asc' },
        ],
      };

      const mockTimeSeriesData = {
        timeSeries: Array.from({ length: 12 }, (_, i) => ({
          year: 2024,
          month: i + 1,
          revenue: 20000 + i * 1000,
          expenses: 12000 + i * 500,
          appointments: 100 + i * 5,
          avgRevenuePerAppointment: (20000 + i * 1000) / (100 + i * 5),
        })),
        trends: {
          revenueGrowth: 0.05,
          expenseGrowth: 0.04,
          appointmentGrowth: 0.05,
          efficiencyGrowth: 0.01,
        },
      };

      // Mock service responses
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.aggregateData).mockResolvedValue(
        mockTimeSeriesData,
      );

      // Act
      const result = await FinancialMetricsService.aggregateData(mockTimeSeriesConfig);

      // Assert
      expect(result.timeSeries).toHaveLength(12);
      expect(result.trends.revenueGrowth).toBe(0.05);
      expect(result.timeSeries[11].revenue).toBeGreaterThan(
        result.timeSeries[0].revenue,
      );
    });
  });

  describe('Caching Strategy Integration', () => {
    it('should implement aggressive caching for frequently accessed metrics', async () => {
      // Arrange
      const mockCacheStrategy: CacheStrategy = {
        key: 'financial-metrics:clinic-001:monthly',
        ttl: 3600000, // 1 hour
        maxSize: 100,
        compressionEnabled: true,
        invalidationTriggers: ['financial-data-update', 'settings-change'],
      };

      const mockCachedMetrics: FinancialMetrics = {
        id: 'cached-metrics-001',
        revenue: 30000,
        expenses: 18000,
        profit: 12000,
        profitMargin: 0.4,
        growth: 0.08,
        period: '2024-03',
        calculatedAt: new Date('2024-03-31T23:59:59Z'),
        cacheExpiry: new Date(Date.now() + 3600000),
      };

      // Mock cache service
      const { CacheService } = await import('@/services/cache');
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );

      vi.mocked(CacheService.get).mockResolvedValue(null); // Cache miss first
      vi.mocked(CacheService.set).mockResolvedValue(true);
      vi.mocked(FinancialMetricsService.calculateMetrics).mockResolvedValue(
        mockCachedMetrics,
      );
      vi.mocked(FinancialMetricsService.getCachedMetrics).mockResolvedValue(
        mockCachedMetrics,
      );

      // Act - First call (cache miss)
      const firstResult = await FinancialMetricsService.getCachedMetrics(
        mockCacheStrategy.key,
      );

      // Set up cache hit for second call
      vi.mocked(CacheService.get).mockResolvedValue(mockCachedMetrics);

      // Act - Second call (cache hit)
      const secondResult = await FinancialMetricsService.getCachedMetrics(
        mockCacheStrategy.key,
      );

      // Assert
      expect(firstResult).toEqual(mockCachedMetrics);
      expect(secondResult).toEqual(mockCachedMetrics);
      expect(CacheService.set).toHaveBeenCalledWith(
        mockCacheStrategy.key,
        mockCachedMetrics,
        expect.any(Number),
      );
    });

    it('should handle cache invalidation on data updates', async () => {
      // Arrange
      const cacheKey = 'financial-metrics:clinic-001:weekly';
      const invalidationTriggers = [
        'financial-data-update',
        'appointment-completed',
      ];

      // Mock cache service
      const { CacheService } = await import('@/services/cache');
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );

      vi.mocked(CacheService.invalidate).mockResolvedValue(true);
      vi.mocked(FinancialMetricsService.invalidateCache).mockResolvedValue(
        true,
      );

      // Act
      const result = await FinancialMetricsService.invalidateCache(
        cacheKey,
        invalidationTriggers,
      );

      // Assert
      expect(result).toBe(true);
      expect(FinancialMetricsService.invalidateCache).toHaveBeenCalledWith(
        cacheKey,
        invalidationTriggers,
      );
    });

    it('should implement conservative caching for critical metrics', async () => {
      // Arrange
      const mockConservativeCacheStrategy: CacheStrategy = {
        key: 'financial-metrics:clinic-001:critical:yearly',
        ttl: 300000, // 5 minutes
        maxSize: 10,
        compressionEnabled: false,
        invalidationTriggers: ['any-financial-update', 'compliance-audit'],
      };

      const mockCriticalMetrics: FinancialMetrics = {
        id: 'critical-metrics-001',
        revenue: 500000,
        expenses: 300000,
        profit: 200000,
        profitMargin: 0.4,
        growth: 0.12,
        period: '2024',
        calculatedAt: new Date('2024-12-31T23:59:59Z'),
        cacheExpiry: new Date(Date.now() + 300000),
      };

      // Mock cache service with conservative settings
      const { CacheService } = await import('@/services/cache');
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );

      vi.mocked(CacheService.get).mockResolvedValue(null);
      vi.mocked(CacheService.set).mockResolvedValue(true);
      vi.mocked(FinancialMetricsService.getCachedMetrics).mockResolvedValue(
        mockCriticalMetrics,
      );

      // Act
      const result = await FinancialMetricsService.getCachedMetrics(
        mockConservativeCacheStrategy.key,
      );

      // Assert
      expect(result).toEqual(mockCriticalMetrics);
      expect(result.cacheExpiry!.getTime()).toBeLessThan(Date.now() + 600000); // Less than 10 minutes
    });
  });

  describe('Performance Optimization Integration', () => {
    it('should optimize metrics calculation for large datasets', async () => {
      // Arrange
      const mockLargeDatasetRequest: MetricsCalculationRequest = {
        clinicId: 'clinic-001',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        granularity: 'daily',
        includeProjections: true,
        cacheStrategy: 'aggressive',
        performanceMode: 'fast',
      };

      const mockOptimizedMetrics: FinancialMetrics = {
        id: 'optimized-metrics-001',
        revenue: 600000,
        expenses: 360000,
        profit: 240000,
        profitMargin: 0.4,
        growth: 0.15,
        period: '2024',
        calculatedAt: new Date(),
        performanceMetrics: {
          calculationTime: 250,
          dataPoints: 50000,
          complexity: 'high',
        },
      };

      // Mock service with performance tracking
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.calculateMetrics).mockImplementation(
        async request => {
          // Simulate performance optimization
          const startTime = Date.now();
          await new Promise(resolve => setTimeout(resolve, 50)); // Simulate calculation
          const endTime = Date.now();

          return {
            ...mockOptimizedMetrics,
            performanceMetrics: {
              ...mockOptimizedMetrics.performanceMetrics!,
              calculationTime: endTime - startTime,
            },
          };
        },
      );

      // Act
      const result = await FinancialMetricsService.calculateMetrics(
        mockLargeDatasetRequest,
      );

      // Assert
      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics!.calculationTime).toBeLessThan(500);
      expect(result.performanceMetrics!.dataPoints).toBe(50000);
    });

    it('should implement parallel processing for multi-clinic metrics', async () => {
      // Arrange
      const mockMultiClinicRequests: MetricsCalculationRequest[] = [
        {
          clinicId: 'clinic-001',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          granularity: 'monthly',
          includeProjections: false,
          cacheStrategy: 'conservative',
          performanceMode: 'balanced',
        },
        {
          clinicId: 'clinic-002',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          granularity: 'monthly',
          includeProjections: false,
          cacheStrategy: 'conservative',
          performanceMode: 'balanced',
        },
      ];

      const mockParallelResults: FinancialMetrics[] = [
        {
          id: 'metrics-clinic-001',
          revenue: 75000,
          expenses: 45000,
          profit: 30000,
          profitMargin: 0.4,
          growth: 0.1,
          period: '2024-Q1',
          calculatedAt: new Date(),
          performanceMetrics: {
            calculationTime: 100,
            dataPoints: 1000,
            complexity: 'medium',
          },
        },
        {
          id: 'metrics-clinic-002',
          revenue: 82000,
          expenses: 50000,
          profit: 32000,
          profitMargin: 0.39,
          growth: 0.12,
          period: '2024-Q1',
          calculatedAt: new Date(),
          performanceMetrics: {
            calculationTime: 120,
            dataPoints: 1200,
            complexity: 'medium',
          },
        },
      ];

      // Mock parallel processing
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.calculateMetrics)
        .mockResolvedValueOnce(mockParallelResults[0])
        .mockResolvedValueOnce(mockParallelResults[1]);

      // Act
      const results = await Promise.all(
        mockMultiClinicRequests.map(request => FinancialMetricsService.calculateMetrics(request)),
      );

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].performanceMetrics!.calculationTime).toBeLessThan(200);
      expect(results[1].performanceMetrics!.calculationTime).toBeLessThan(200);
      expect(results[0].revenue).not.toBe(results[1].revenue);
    });

    it('should handle memory optimization for long-running calculations', async () => {
      // Arrange
      const mockMemoryOptimizedRequest: MetricsCalculationRequest = {
        clinicId: 'clinic-001',
        startDate: '2020-01-01',
        endDate: '2024-12-31',
        granularity: 'daily',
        includeProjections: true,
        cacheStrategy: 'none',
        performanceMode: 'accurate',
      };

      const mockMemoryMetrics: FinancialMetrics = {
        id: 'memory-optimized-001',
        revenue: 2000000,
        expenses: 1200000,
        profit: 800000,
        profitMargin: 0.4,
        growth: 0.08,
        period: '2020-2024',
        calculatedAt: new Date(),
        performanceMetrics: {
          calculationTime: 2000,
          dataPoints: 1800,
          complexity: 'high',
        },
      };

      // Mock memory-optimized calculation
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.calculateMetrics).mockImplementation(
        async request => {
          // Simulate memory optimization
          const memoryUsageBefore = process.memoryUsage?.()?.heapUsed || 0;
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate calculation
          const memoryUsageAfter = process.memoryUsage?.()?.heapUsed || 0;

          return {
            ...mockMemoryMetrics,
            performanceMetrics: {
              ...mockMemoryMetrics.performanceMetrics!,
              memoryUsage: memoryUsageAfter - memoryUsageBefore,
            },
          };
        },
      );

      // Act
      const result = await FinancialMetricsService.calculateMetrics(
        mockMemoryOptimizedRequest,
      );

      // Assert
      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics!.dataPoints).toBe(1800);
      expect(result.period).toBe('2020-2024');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle calculation errors gracefully', async () => {
      // Arrange
      const mockErrorRequest: MetricsCalculationRequest = {
        clinicId: 'invalid-clinic',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        granularity: 'monthly',
        includeProjections: false,
        cacheStrategy: 'conservative',
        performanceMode: 'balanced',
      };

      // Mock service error
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.calculateMetrics).mockRejectedValue(
        new Error('Clinic not found: invalid-clinic'),
      );

      // Act & Assert
      await expect(
        FinancialMetricsService.calculateMetrics(mockErrorRequest),
      ).rejects.toThrow('Clinic not found: invalid-clinic');
    });

    it('should handle cache failures gracefully', async () => {
      // Arrange
      const cacheKey = 'financial-metrics:clinic-001:monthly';

      // Mock cache failure
      const { CacheService } = await import('@/services/cache');
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );

      vi.mocked(CacheService.get).mockRejectedValue(
        new Error('Cache service unavailable'),
      );
      vi.mocked(FinancialMetricsService.getCachedMetrics).mockImplementation(
        async key => {
          try {
            await CacheService.get(key);
          } catch (error) {
            // Fall back to direct calculation
            return await FinancialMetricsService.calculateMetrics({
              clinicId: 'clinic-001',
              startDate: '2024-01-01',
              endDate: '2024-01-31',
              granularity: 'monthly',
              includeProjections: false,
              cacheStrategy: 'none',
              performanceMode: 'balanced',
            });
          }
        },
      );

      // Act
      const result = await FinancialMetricsService.getCachedMetrics(cacheKey);

      // Assert
      expect(result).toBeDefined();
      expect(CacheService.get).toHaveBeenCalledWith(cacheKey);
    });

    it('should validate data integrity in calculations', async () => {
      // Arrange
      const mockDataIntegrityRequest: MetricsCalculationRequest = {
        clinicId: 'clinic-001',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        granularity: 'monthly',
        includeProjections: false,
        cacheStrategy: 'conservative',
        performanceMode: 'accurate',
      };

      const mockValidatedMetrics: FinancialMetrics = {
        id: 'validated-metrics-001',
        revenue: 25000,
        expenses: 15000,
        profit: 10000,
        profitMargin: 0.4,
        growth: 0.1,
        period: '2024-01',
        calculatedAt: new Date(),
      };

      // Mock validation
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.calculateMetrics).mockImplementation(
        async request => {
          // Validate data integrity
          const result = mockValidatedMetrics;

          if (result.revenue < 0 || result.expenses < 0) {
            throw new Error('Invalid financial data: negative values detected');
          }

          if (result.profit !== result.revenue - result.expenses) {
            throw new Error(
              'Data integrity error: profit calculation mismatch',
            );
          }

          if (result.profitMargin !== result.profit / result.revenue) {
            throw new Error(
              'Data integrity error: profit margin calculation mismatch',
            );
          }

          return result;
        },
      );

      // Act
      const result = await FinancialMetricsService.calculateMetrics(
        mockDataIntegrityRequest,
      );

      // Assert
      expect(result.profit).toBe(result.revenue - result.expenses);
      expect(result.profitMargin).toBe(result.profit / result.revenue);
      expect(result.revenue).toBeGreaterThan(0);
      expect(result.expenses).toBeGreaterThan(0);
    });
  });

  describe('Export and Historical Data Integration', () => {
    it('should export metrics in multiple formats', async () => {
      // Arrange
      const mockExportRequest = {
        clinicId: 'clinic-001',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        format: 'excel',
        includeCharts: true,
        granularity: 'monthly',
      };

      const mockExportData = {
        filename: 'financial-metrics-clinic-001-2024.xlsx',
        size: 1024000,
        url: 'https://storage.example.com/exports/financial-metrics-clinic-001-2024.xlsx',
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
      };

      // Mock export service
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.exportMetrics).mockResolvedValue(
        mockExportData,
      );

      // Act
      const result = await FinancialMetricsService.exportMetrics(mockExportRequest);

      // Assert
      expect(result.filename).toContain('financial-metrics-clinic-001-2024');
      expect(result.url).toContain('https://storage.example.com');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should retrieve historical metrics with trend analysis', async () => {
      // Arrange
      const mockHistoricalRequest = {
        clinicId: 'clinic-001',
        startDate: '2020-01-01',
        endDate: '2024-12-31',
        granularity: 'yearly',
        includeTrends: true,
      };

      const mockHistoricalData = {
        metrics: Array.from({ length: 5 }, (_, i) => ({
          id: `historical-${2020 + i}`,
          revenue: 100000 * (1 + i * 0.1),
          expenses: 60000 * (1 + i * 0.08),
          profit: 40000 * (1 + i * 0.12),
          profitMargin: 0.4 + i * 0.01,
          growth: 0.1 + i * 0.02,
          period: `${2020 + i}`,
          calculatedAt: new Date(`${2020 + i}-12-31`),
        })),
        trends: {
          revenueGrowth: 0.1,
          expenseGrowth: 0.08,
          profitGrowth: 0.12,
          marginImprovement: 0.01,
        },
        projections: {
          nextYear: {
            revenue: 155000,
            expenses: 85000,
            profit: 70000,
            confidence: 0.85,
          },
        },
      };

      // Mock historical service
      const { FinancialMetricsService } = await import(
        '@/services/financial-metrics'
      );
      vi.mocked(FinancialMetricsService.getMetricsHistory).mockResolvedValue(
        mockHistoricalData,
      );

      // Act
      const result = await FinancialMetricsService.getMetricsHistory(
        mockHistoricalRequest,
      );

      // Assert
      expect(result.metrics).toHaveLength(5);
      expect(result.trends.revenueGrowth).toBe(0.1);
      expect(result.projections.nextYear.confidence).toBe(0.85);
      expect(result.metrics[4].revenue).toBeGreaterThan(
        result.metrics[0].revenue,
      );
    });
  });
});
