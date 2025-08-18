import type { SupabaseClient } from '@supabase/supabase-js';
import {
  afterEach,
  afterEach,
  beforeEach,
  beforeEach,
  describe,
  describe,
  expect,
  expect,
  test,
  test,
  vi,
} from 'vitest';
import { AnalyticsRepository } from '@/lib/analytics/repository';
import { createClient } from '@/utils/supabase/server';

// Mock Supabase client
vi.mock('@/utils/supabase/server');
const mockCreateClient = createClient as vi.MockedFunction<typeof createClient>;

describe('AnalyticsRepository', () => {
  let repository: AnalyticsRepository;
  let mockSupabase: vi.Mocked<SupabaseClient>;

  beforeEach(() => {
    // Create mock Supabase client with typed methods
    mockSupabase = {
      from: vi.fn(),
      rpc: vi.fn(),
      auth: {
        getUser: vi.fn(),
      },
    } as any;

    // Mock the createClient function to return our mock
    mockCreateClient.mockResolvedValue(mockSupabase);

    repository = new AnalyticsRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getSubscriptionMetrics', () => {
    test('should fetch subscription metrics from database', async () => {
      // Arrange
      const mockData = {
        data: {
          total_subscriptions: 150,
          active_subscriptions: 125,
          mrr: 15_000,
          arr: 180_000,
          churn_rate: 0.05,
          growth_rate: 0.12,
          conversion_rate: 0.25,
        },
        error: null,
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      // Act
      const result = await repository.getSubscriptionMetrics('monthly');

      // Assert
      expect(result).toEqual({
        totalSubscriptions: 150,
        activeSubscriptions: 125,
        mrr: 15_000,
        arr: 180_000,
        churnRate: 0.05,
        growthRate: 0.12,
        conversionRate: 0.25,
        period: 'monthly',
        generatedAt: expect.any(Date),
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_metrics');
      expect(mockFrom.select).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('period', 'monthly');
    });

    test('should handle database errors', async () => {
      // Arrange
      const mockError = { message: 'Database connection failed' };
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      // Act & Assert
      await expect(
        repository.getSubscriptionMetrics('monthly')
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle missing data gracefully', async () => {
      // Arrange
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      // Act & Assert
      await expect(
        repository.getSubscriptionMetrics('monthly')
      ).rejects.toThrow('No subscription metrics found for period: monthly');
    });
  });

  describe('getTrialMetrics', () => {
    test('should fetch trial metrics with AI predictions', async () => {
      // Arrange
      const mockTrialData = {
        data: [
          {
            total_trials: 500,
            active_trials: 150,
            converted_trials: 125,
            expired_trials: 225,
            conversion_rate: 0.25,
            average_trial_duration: 14,
          },
        ],
        error: null,
      };

      const mockPredictionData = {
        data: [
          {
            user_id: 'user1',
            conversion_probability: 0.85,
            conversion_factors: ['high_engagement'],
          },
          {
            user_id: 'user2',
            conversion_probability: 0.6,
            conversion_factors: ['moderate_usage'],
          },
        ],
        error: null,
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockTrialData),
        limit: vi.fn().mockResolvedValue(mockPredictionData),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      // Act
      const result = await repository.getTrialMetrics('monthly');

      // Assert
      expect(result.totalTrials).toBe(500);
      expect(result.activeTrials).toBe(150);
      expect(result.conversionRate).toBe(0.25);
      expect(result.conversionPredictions).toBeDefined();
      expect(result.conversionPredictions).toHaveLength(2);
    });

    test('should handle RPC function calls for complex analytics', async () => {
      // Arrange
      const mockRpcResult = {
        data: {
          engagement_score: 0.85,
          conversion_factors: ['email_response', 'support_interaction'],
          predicted_conversion_date: '2024-02-15',
        },
        error: null,
      };

      mockSupabase.rpc.mockResolvedValue(mockRpcResult);

      // Act
      const result =
        await repository.calculateTrialConversionProbability('user123');

      // Assert
      expect(result).toEqual(mockRpcResult.data);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'calculate_trial_conversion_ai',
        {
          user_id: 'user123',
        }
      );
    });
  });

  describe('getCohortAnalysis', () => {
    test('should fetch cohort data with retention rates', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockCohortData = {
        data: [
          {
            cohort_month: '2024-01',
            period_number: 0,
            customers_count: 100,
            revenue_amount: 5000,
            retention_rate: 1.0,
          },
          {
            cohort_month: '2024-01',
            period_number: 1,
            customers_count: 85,
            revenue_amount: 4250,
            retention_rate: 0.85,
          },
        ],
        error: null,
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockCohortData),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      // Act
      const result = await repository.getCohortAnalysis(startDate, endDate);

      // Assert
      expect(result.cohorts).toBeDefined();
      expect(result.totalRevenue).toBeGreaterThan(0);
      expect(result.averageRetentionRate).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_cohorts');
    });
  });

  describe('getRevenueForecasting', () => {
    test('should fetch revenue predictions from ML model', async () => {
      // Arrange
      const periods = 6;
      const mockForecastData = {
        data: [
          {
            forecast_date: '2024-02-01',
            forecast_type: 'mrr',
            predicted_value: 16_000,
            confidence_interval: { lower: 14_500, upper: 17_500 },
            model_version: 'v2.1',
          },
        ],
        error: null,
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockForecastData),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      // Act
      const result = await repository.getRevenueForecasting(periods);

      // Assert
      expect(result.predictions).toBeDefined();
      expect(result.predictions).toHaveLength(1);
      expect(result.predictions[0].value).toBe(16_000);
      expect(result.predictions[0].confidence.lower).toBeLessThan(
        result.predictions[0].value
      );
      expect(result.modelVersion).toBe('v2.1');
    });
  });

  describe('real-time subscriptions', () => {
    test('should set up real-time listener for metrics updates', async () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      };

      mockSupabase.channel = vi.fn().mockReturnValue(mockChannel);

      // Act
      await repository.subscribeToMetricsUpdates(mockCallback);

      // Assert
      expect(mockSupabase.channel).toHaveBeenCalledWith('analytics-updates');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'subscription_metrics',
        }),
        mockCallback
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe('data validation', () => {
    test('should validate subscription metrics data format', async () => {
      // Arrange
      const invalidData = {
        data: {
          total_subscriptions: 'invalid', // Should be number
          active_subscriptions: 125,
          mrr: -1000, // Should be positive
        },
        error: null,
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(invalidData),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      // Act & Assert
      await expect(
        repository.getSubscriptionMetrics('monthly')
      ).rejects.toThrow('Invalid subscription metrics data format');
    });

    test('should validate date ranges for cohort analysis', async () => {
      // Arrange
      const startDate = new Date('invalid-date');
      const endDate = new Date('2024-01-31');

      // Act & Assert
      await expect(
        repository.getCohortAnalysis(startDate, endDate)
      ).rejects.toThrow('Invalid date range provided');
    });
  });

  describe('performance optimization', () => {
    test('should implement connection pooling', async () => {
      // Arrange
      const mockMetrics = {
        data: { total_subscriptions: 100, active_subscriptions: 80 },
        error: null,
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockMetrics),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      // Act - Make multiple concurrent requests
      const promises = new Array(5)
        .fill(null)
        .map(() => repository.getSubscriptionMetrics('monthly'));

      await Promise.all(promises);

      // Assert - Should reuse connection
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
    });

    test('should handle concurrent requests efficiently', async () => {
      // Arrange
      const mockData = {
        data: { total_subscriptions: 150 },
        error: null,
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData),
      };

      mockSupabase.from.mockReturnValue(mockFrom as any);

      // Act
      const startTime = Date.now();
      const promises = new Array(10)
        .fill(null)
        .map(() => repository.getSubscriptionMetrics('monthly'));

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Assert
      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(2000); // Should handle concurrency efficiently
    });
  });
});
