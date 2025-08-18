import { describe, expect, it } from 'vitest';
import {
  generateDateRange,
  validateDateRange,
  aggregateMetricsByPeriod,
  formatAnalyticsCurrency,
  formatAnalyticsPercentage,
  calculateMRR,
  calculateChurnRate,
  calculateLTV,
} from '../../../../../packages/utils/src/analytics/utils';

describe('Analytics Repository Utils', () => {
  describe('Date Range Generation', () => {
    it('should generate date range correctly', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-03');
      const dates = generateDateRange(start, end);

      expect(dates).toHaveLength(3);
      expect(dates[0]).toEqual(start);
      expect(dates[2]).toEqual(end);
    });

    it('should handle single day range', () => {
      const date = new Date('2024-01-01');
      const dates = generateDateRange(date, date);

      expect(dates).toHaveLength(1);
      expect(dates[0]).toEqual(date);
    });

    it('should throw error for invalid range', () => {
      const start = new Date('2024-01-03');
      const end = new Date('2024-01-01');

      expect(() => generateDateRange(start, end)).toThrow();
    });
  });

  describe('Date Range Validation', () => {
    it('should validate correct date range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      
      expect(validateDateRange(start, end)).toBe(true);
    });

    it('should invalidate incorrect date range', () => {
      const start = new Date('2024-01-31');
      const end = new Date('2024-01-01');
      
      expect(validateDateRange(start, end)).toBe(false);
    });

    it('should handle invalid dates', () => {
      const invalidDate = new Date('invalid');
      const validDate = new Date('2024-01-01');
      
      expect(validateDateRange(invalidDate, validDate)).toBe(false);
      expect(validateDateRange(validDate, invalidDate)).toBe(false);
    });

    it('should handle equal dates', () => {
      const date = new Date('2024-01-01');
      
      expect(validateDateRange(date, date)).toBe(true);
    });
  });

  describe('Metrics Data Processing', () => {
    const testData = [
      { date: '2024-01-15', revenue: 1000, customers: 10, subscriptions: 5 },
      { date: '2024-01-16', revenue: 1200, customers: 12, subscriptions: 6 },
      { date: '2024-02-15', revenue: 1500, customers: 15, subscriptions: 8 },
      { date: '2024-02-16', revenue: 1800, customers: 18, subscriptions: 9 },
    ];

    it('should aggregate revenue by month', () => {
      const aggregated = aggregateMetricsByPeriod(
        testData,
        'month',
        (items) => items.reduce((sum, item) => sum + item.revenue, 0)
      );

      expect(aggregated).toHaveLength(2);
      expect(aggregated[0].period).toBe('Jan 2024');
      expect(aggregated[0].value).toBe(2200);
      expect(aggregated[1].period).toBe('Feb 2024');
      expect(aggregated[1].value).toBe(3300);
    });

    it('should aggregate customers by month', () => {
      const aggregated = aggregateMetricsByPeriod(
        testData,
        'month',
        (items) => Math.max(...items.map(item => item.customers))
      );

      expect(aggregated).toHaveLength(2);
      expect(aggregated[0].value).toBe(12); // Max customers in Jan
      expect(aggregated[1].value).toBe(18); // Max customers in Feb
    });

    it('should handle day aggregation', () => {
      const aggregated = aggregateMetricsByPeriod(
        testData,
        'day',
        (items) => items.reduce((sum, item) => sum + item.subscriptions, 0)
      );

      expect(aggregated).toHaveLength(4);
      expect(aggregated[0].value).toBe(5);
      expect(aggregated[1].value).toBe(6);
    });
  });

  describe('Analytics Formatting', () => {
    it('should format large currency amounts', () => {
      expect(formatAnalyticsCurrency(1234567.89)).toBe('$1,234,567.89');
    });

    it('should format small currency amounts', () => {
      expect(formatAnalyticsCurrency(0.99)).toBe('$0.99');
    });

    it('should format negative currency amounts', () => {
      expect(formatAnalyticsCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should format percentage with custom precision', () => {
      expect(formatAnalyticsPercentage(0.12345, 3)).toBe('12.345%');
    });

    it('should format very small percentages', () => {
      expect(formatAnalyticsPercentage(0.001)).toBe('0.10%');
    });
  });

  describe('Business Metrics Calculations', () => {
    const subscriptionData = [
      { id: 1, status: 'active', amount: 2999, plan: 'premium' },
      { id: 2, status: 'active', amount: 1999, plan: 'basic' },
      { id: 3, status: 'canceled', amount: 2999, plan: 'premium' },
      { id: 4, status: 'active', amount: 4999, plan: 'enterprise' },
      { id: 5, status: 'trialing', amount: 2999, plan: 'premium' },
    ];

    it('should calculate MRR for different subscription statuses', () => {
      const mrr = calculateMRR(subscriptionData);
      // Active subscriptions only: 29.99 + 19.99 + 49.99 = 99.97
      expect(mrr).toBe(99.97);
    });

    it('should handle subscription data with missing fields', () => {
      const invalidData = [
        { id: 1, status: 'active' }, // Missing amount
        { id: 2, amount: 1999 }, // Missing status
        { id: 3, status: 'active', amount: 'invalid' }, // Invalid amount
        { id: 4, status: 'active', amount: 2999 }, // Valid
      ];

      const mrr = calculateMRR(invalidData);
      expect(mrr).toBe(29.99); // Only the valid subscription
    });

    it('should calculate churn rate scenarios', () => {
      // Low churn
      expect(calculateChurnRate(5, 100)).toBe(0.05);
      
      // High churn
      expect(calculateChurnRate(20, 100)).toBe(0.2);
      
      // Complete churn
      expect(calculateChurnRate(100, 100)).toBe(1);
      
      // Negative churn (should default to 0)
      expect(calculateChurnRate(-5, 100)).toBe(0);
    });

    it('should calculate LTV for different scenarios', () => {
      // High value, low churn
      expect(calculateLTV(100, 0.05)).toBe(2000);
      
      // Low value, high churn
      expect(calculateLTV(50, 0.2)).toBe(250);
      
      // Zero ARPU
      expect(calculateLTV(0, 0.1)).toBe(0);
      
      // Negative ARPU (should default to 0)
      expect(calculateLTV(-100, 0.1)).toBe(0);
    });
  });

  describe('Data Edge Cases', () => {
    it('should handle empty datasets gracefully', () => {
      const aggregated = aggregateMetricsByPeriod(
        [],
        'month',
        (items) => items.reduce((sum, item) => sum + (item as any).value, 0)
      );

      expect(aggregated).toEqual([]);
    });

    it('should handle null/undefined data', () => {
      expect(calculateMRR(null as any)).toBe(0);
      expect(calculateMRR(undefined as any)).toBe(0);
    });

    it('should handle data with null dates', () => {
      const dataWithNullDates = [
        { date: null, value: 100 },
        { date: '2024-01-01', value: 200 },
        { date: undefined, value: 300 },
      ];

      // Should skip null/undefined dates
      const aggregated = aggregateMetricsByPeriod(
        dataWithNullDates.filter(item => item.date),
        'day',
        (items) => items.reduce((sum, item) => sum + (item as any).value, 0)
      );

      expect(aggregated).toHaveLength(1);
      expect(aggregated[0].value).toBe(200);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large datasets efficiently', () => {
      // Generate a large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        date: new Date(2024, 0, 1 + (i % 365)).toISOString().split('T')[0],
        value: Math.random() * 1000,
      }));

      const start = performance.now();
      const aggregated = aggregateMetricsByPeriod(
        largeDataset,
        'month',
        (items) => items.reduce((sum, item) => sum + (item as any).value, 0)
      );
      const end = performance.now();

      expect(aggregated.length).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});