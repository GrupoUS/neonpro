import { describe, expect, it } from 'vitest';
import {
  aggregateMetricsByPeriod,
  calculateARR,
  calculateChurnRate,
  calculateGrowthRate,
  calculateLTV,
  calculateMRR,
  exportToCSV,
  formatAnalyticsCurrency,
  formatAnalyticsPercentage,
  parseAnalyticsFilters,
} from '../../../../../packages/utils/src/analytics/utils';

// Test data
const testSubscriptions = [
  { id: 1, status: 'active', amount: 2999 }, // $29.99
  { id: 2, status: 'active', amount: 1999 }, // $19.99
  { id: 3, status: 'canceled', amount: 2999 },
  { id: 4, status: 'active', amount: 4999 }, // $49.99
];

const testMetricsData = [
  { date: '2024-01-15', revenue: 1000, customers: 10 },
  { date: '2024-01-16', revenue: 1200, customers: 12 },
  { date: '2024-02-15', revenue: 1500, customers: 15 },
  { date: '2024-02-16', revenue: 1800, customers: 18 },
];

describe('analytics Utils', () => {
  describe('mRR Calculations', () => {
    it('should calculate MRR correctly for active subscriptions', () => {
      const mrr = calculateMRR(testSubscriptions);
      // Active subscriptions: 29.99 + 19.99 + 49.99 = 99.97
      expect(mrr).toBe(99.97);
    });

    it('should return 0 for empty array', () => {
      const mrr = calculateMRR([]);
      expect(mrr).toBe(0);
    });

    it('should handle invalid input gracefully', () => {
      const mrr = calculateMRR(undefined as any);
      expect(mrr).toBe(0);
    });
  });

  describe('aRR Calculations', () => {
    it('should calculate ARR correctly', () => {
      const mrr = 1000;
      const arr = calculateARR(mrr);
      expect(arr).toBe(12_000);
    });
  });

  describe('churn Rate Calculations', () => {
    it('should calculate churn rate correctly', () => {
      // 10 churned customers out of 100 total customers = 10% churn rate
      const churnRate = calculateChurnRate(10, 100);
      expect(churnRate).toBe(0.1);
    });

    it('should handle zero starting customers', () => {
      // 0 total customers means no churn is possible
      const churnRate = calculateChurnRate(10, 0);
      expect(churnRate).toBe(0);
    });

    it('should handle invalid inputs', () => {
      const churnRate = calculateChurnRate(100, Number.NaN);
      expect(churnRate).toBeNaN();
    });
  });

  describe('lTV Calculations', () => {
    it('should calculate LTV correctly', () => {
      const ltv = calculateLTV(100, 0.1);
      expect(ltv).toBe(1000);
    });

    it('should handle zero churn rate', () => {
      const ltv = calculateLTV(100, 0);
      expect(ltv).toBe(Number.POSITIVE_INFINITY);
    });

    it('should handle invalid inputs', () => {
      const ltv = calculateLTV(Number.NaN, 0.1);
      expect(ltv).toBeNaN();
    });
  });

  describe('growth Rate Calculations', () => {
    it('should calculate positive growth rate', () => {
      // Growth from 100 to 120 = 20% growth
      const growthRate = calculateGrowthRate(100, 120);
      expect(growthRate).toBe(0.2);
    });

    it('should calculate negative growth rate', () => {
      // Decline from 100 to 80 = -20% growth
      const growthRate = calculateGrowthRate(100, 80);
      expect(growthRate).toBe(-0.2);
    });

    it('should handle zero previous value', () => {
      const growthRate = calculateGrowthRate(0, 100);
      expect(growthRate).toBe(Number.POSITIVE_INFINITY);
    });
  });

  describe('currency Formatting', () => {
    it('should format currency correctly', () => {
      const formatted = formatAnalyticsCurrency(1234.56);
      expect(formatted).toBe('$1,234.56');
    });

    it('should handle zero amount', () => {
      const formatted = formatAnalyticsCurrency(0);
      expect(formatted).toBe('$0.00');
    });

    it('should handle null/undefined', () => {
      const formatted = formatAnalyticsCurrency(undefined as any);
      expect(formatted).toBe('$0.00');
    });
  });

  describe('percentage Formatting', () => {
    it('should format percentage correctly', () => {
      const formatted = formatAnalyticsPercentage(0.1234);
      expect(formatted).toBe('12.34%');
    });

    it('should handle zero value', () => {
      const formatted = formatAnalyticsPercentage(0);
      expect(formatted).toBe('0.00%');
    });

    it('should handle null/undefined', () => {
      const formatted = formatAnalyticsPercentage(undefined as any);
      expect(formatted).toBe('0.00%');
    });
  });

  describe('metrics Aggregation', () => {
    it('should aggregate metrics by month', () => {
      const aggregated = aggregateMetricsByPeriod(
        testMetricsData,
        'month',
        (items) => items.reduce((sum, item) => sum + item.revenue, 0),
      );

      expect(aggregated).toHaveLength(2);
      expect(aggregated[0].period).toBe('Jan 2024');
      expect(aggregated[0].value).toBe(2200); // 1000 + 1200
      expect(aggregated[1].period).toBe('Feb 2024');
      expect(aggregated[1].value).toBe(3300); // 1500 + 1800
    });

    it('should handle empty data', () => {
      const aggregated = aggregateMetricsByPeriod(
        [],
        'month',
        (items) => items.length,
      );
      expect(aggregated).toStrictEqual([]);
    });
  });

  describe('filter Parsing', () => {
    it('should parse analytics filters correctly', () => {
      const params = new URLSearchParams({
        period: 'last_30_days',
        metric: 'revenue',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        group_by: 'month',
        'filter[clinic_id]': '123',
      });

      const filters = parseAnalyticsFilters(params);

      expect(filters.period).toBe('last_30_days');
      expect(filters.metric).toBe('revenue');
      expect(filters.groupBy).toBe('month');
      expect(filters.filters).toStrictEqual({ clinic_id: '123' });
    });

    it('should use default values for missing parameters', () => {
      const params = new URLSearchParams();
      const filters = parseAnalyticsFilters(params);

      expect(filters.period).toBe('last_30_days');
      expect(filters.metric).toBe('all');
      expect(filters.startDate).toBeInstanceOf(Date);
      expect(filters.endDate).toBeInstanceOf(Date);
    });
  });

  describe('data Export', () => {
    it('should export data to CSV format', () => {
      const data = [
        { name: 'Test', value: 123 },
        { name: 'Test2', value: 456 },
      ];

      const csv = exportToCSV(data, 'test.csv');
      expect(typeof csv).toBe('string');
      expect(csv).toContain('name');
      expect(csv).toContain('value');
    });
  });
});
