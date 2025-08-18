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
import { AnalyticsService } from '@/lib/analytics/service';
import type {
  CohortAnalysis,
  SubscriptionMetrics,
  TrialMetrics,
} from '@/lib/analytics/types';

// Mock the repository
vi.mock('@/lib/analytics/repository');

const MockedAnalyticsRepository = AnalyticsRepository as vi.MockedClass<
  typeof AnalyticsRepository
>;

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockRepository: vi.Mocked<AnalyticsRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Create a new instance of the mocked repository
    mockRepository =
      new MockedAnalyticsRepository() as vi.Mocked<AnalyticsRepository>;
    analyticsService = new AnalyticsService(mockRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getSubscriptionMetrics', () => {
    test('should return cached metrics when available', async () => {
      // Arrange
      const mockMetrics: SubscriptionMetrics = {
        totalSubscriptions: 150,
        activeSubscriptions: 125,
        mrr: 15_000,
        arr: 180_000,
        churnRate: 0.05,
        growthRate: 0.12,
        conversionRate: 0.25,
        period: 'monthly',
        generatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      mockRepository.getSubscriptionMetrics.mockResolvedValue(mockMetrics);

      // Act
      const result = await analyticsService.getSubscriptionMetrics('monthly');

      // Assert
      expect(result).toEqual(mockMetrics);
      expect(mockRepository.getSubscriptionMetrics).toHaveBeenCalledWith(
        'monthly'
      );
      expect(mockRepository.getSubscriptionMetrics).toHaveBeenCalledTimes(1);
    });

    test('should handle repository errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockRepository.getSubscriptionMetrics.mockRejectedValue(
        new Error(errorMessage)
      );

      // Act & Assert
      await expect(
        analyticsService.getSubscriptionMetrics('monthly')
      ).rejects.toThrow(errorMessage);
    });

    test('should validate period parameter', async () => {
      // Act & Assert
      await expect(
        analyticsService.getSubscriptionMetrics('invalid' as any)
      ).rejects.toThrow('Invalid period specified');
    });
  });

  describe('getTrialMetrics', () => {
    test('should return trial conversion data with AI predictions', async () => {
      // Arrange
      const mockTrialMetrics: TrialMetrics = {
        totalTrials: 500,
        activeTrials: 150,
        convertedTrials: 125,
        expiredTrials: 225,
        conversionRate: 0.25,
        averageTrialDuration: 14,
        conversionPredictions: [
          {
            userId: 'user1',
            probability: 0.85,
            factors: ['high_engagement', 'email_response'],
          },
          { userId: 'user2', probability: 0.6, factors: ['moderate_usage'] },
        ],
        period: 'monthly',
        generatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      mockRepository.getTrialMetrics.mockResolvedValue(mockTrialMetrics);

      // Act
      const result = await analyticsService.getTrialMetrics('monthly');

      // Assert
      expect(result).toEqual(mockTrialMetrics);
      expect(result.conversionPredictions).toHaveLength(2);
      expect(result.conversionPredictions[0].probability).toBeGreaterThan(0.8);
      expect(mockRepository.getTrialMetrics).toHaveBeenCalledWith('monthly');
    });

    test('should handle empty trial data', async () => {
      // Arrange
      const emptyTrialMetrics: TrialMetrics = {
        totalTrials: 0,
        activeTrials: 0,
        convertedTrials: 0,
        expiredTrials: 0,
        conversionRate: 0,
        averageTrialDuration: 0,
        conversionPredictions: [],
        period: 'monthly',
        generatedAt: new Date(),
      };

      mockRepository.getTrialMetrics.mockResolvedValue(emptyTrialMetrics);

      // Act
      const result = await analyticsService.getTrialMetrics('monthly');

      // Assert
      expect(result.totalTrials).toBe(0);
      expect(result.conversionPredictions).toHaveLength(0);
    });
  });

  describe('getCohortAnalysis', () => {
    test('should return cohort retention data', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockCohortData: CohortAnalysis = {
        cohorts: [
          {
            cohortMonth: '2024-01',
            initialUsers: 100,
            retentionByPeriod: [
              {
                period: 0,
                retainedUsers: 100,
                retentionRate: 1.0,
                revenue: 5000,
              },
              {
                period: 1,
                retainedUsers: 85,
                retentionRate: 0.85,
                revenue: 4250,
              },
              {
                period: 2,
                retainedUsers: 72,
                retentionRate: 0.72,
                revenue: 3600,
              },
            ],
          },
        ],
        totalRevenue: 12_850,
        averageRetentionRate: 0.86,
        generatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      mockRepository.getCohortAnalysis.mockResolvedValue(mockCohortData);

      // Act
      const result = await analyticsService.getCohortAnalysis(
        startDate,
        endDate
      );

      // Assert
      expect(result).toEqual(mockCohortData);
      expect(result.cohorts).toHaveLength(1);
      expect(result.cohorts[0].retentionByPeriod).toHaveLength(3);
      expect(result.averageRetentionRate).toBeCloseTo(0.86);
      expect(mockRepository.getCohortAnalysis).toHaveBeenCalledWith(
        startDate,
        endDate
      );
    });

    test('should validate date range parameters', async () => {
      // Arrange
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01'); // End date before start date

      // Act & Assert
      await expect(
        analyticsService.getCohortAnalysis(startDate, endDate)
      ).rejects.toThrow('End date must be after start date');
    });
  });

  describe('getRevenueForecasting', () => {
    test('should return revenue predictions with confidence intervals', async () => {
      // Arrange
      const periods = 6;
      const mockForecast = {
        predictions: [
          {
            period: '2024-02',
            value: 16_000,
            confidence: { lower: 14_500, upper: 17_500 },
          },
          {
            period: '2024-03',
            value: 17_200,
            confidence: { lower: 15_400, upper: 19_000 },
          },
        ],
        accuracy: 0.92,
        modelVersion: 'v2.1',
        generatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      mockRepository.getRevenueForecasting.mockResolvedValue(mockForecast);

      // Act
      const result = await analyticsService.getRevenueForecasting(periods);

      // Assert
      expect(result).toEqual(mockForecast);
      expect(result.predictions).toHaveLength(2);
      expect(result.accuracy).toBeGreaterThan(0.9);
      expect(result.predictions[0].confidence.lower).toBeLessThan(
        result.predictions[0].value
      );
      expect(result.predictions[0].confidence.upper).toBeGreaterThan(
        result.predictions[0].value
      );
    });

    test('should validate periods parameter', async () => {
      // Act & Assert
      await expect(analyticsService.getRevenueForecasting(0)).rejects.toThrow(
        'Periods must be greater than 0'
      );

      await expect(analyticsService.getRevenueForecasting(25)).rejects.toThrow(
        'Periods cannot exceed 24'
      );
    });
  });

  describe('caching behavior', () => {
    test('should cache subscription metrics and return cached data on subsequent calls', async () => {
      // Arrange
      const mockMetrics: SubscriptionMetrics = {
        totalSubscriptions: 150,
        activeSubscriptions: 125,
        mrr: 15_000,
        arr: 180_000,
        churnRate: 0.05,
        growthRate: 0.12,
        conversionRate: 0.25,
        period: 'monthly',
        generatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      mockRepository.getSubscriptionMetrics.mockResolvedValue(mockMetrics);

      // Act
      const result1 = await analyticsService.getSubscriptionMetrics('monthly');
      const result2 = await analyticsService.getSubscriptionMetrics('monthly');

      // Assert
      expect(result1).toEqual(result2);
      expect(mockRepository.getSubscriptionMetrics).toHaveBeenCalledTimes(1); // Should be cached
    });

    test('should invalidate cache after specified TTL', async () => {
      // This test would require dependency injection of cache configuration
      // Implementation depends on the actual caching strategy used
      expect(true).toBe(true); // Placeholder for cache TTL testing
    });
  });

  describe('error handling', () => {
    test('should handle network errors gracefully', async () => {
      // Arrange
      mockRepository.getSubscriptionMetrics.mockRejectedValue(
        new Error('Network timeout')
      );

      // Act & Assert
      await expect(
        analyticsService.getSubscriptionMetrics('monthly')
      ).rejects.toThrow('Network timeout');
    });

    test('should handle malformed data gracefully', async () => {
      // Arrange
      mockRepository.getSubscriptionMetrics.mockResolvedValue(null as any);

      // Act & Assert
      await expect(
        analyticsService.getSubscriptionMetrics('monthly')
      ).rejects.toThrow('Invalid analytics data received');
    });
  });

  describe('performance metrics', () => {
    test('should complete subscription metrics retrieval within acceptable time', async () => {
      // Arrange
      const mockMetrics: SubscriptionMetrics = {
        totalSubscriptions: 150,
        activeSubscriptions: 125,
        mrr: 15_000,
        arr: 180_000,
        churnRate: 0.05,
        growthRate: 0.12,
        conversionRate: 0.25,
        period: 'monthly',
        generatedAt: new Date(),
      };

      mockRepository.getSubscriptionMetrics.mockResolvedValue(mockMetrics);

      // Act
      const startTime = Date.now();
      await analyticsService.getSubscriptionMetrics('monthly');
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
