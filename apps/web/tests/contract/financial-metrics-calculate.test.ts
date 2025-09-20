/**
 * Contract Test: Financial Metrics Calculate API
 *
 * Tests the POST /api/financial/metrics/calculate endpoint for:
 * - Custom period calculations with user-defined parameters
 * - Real-time metrics calculation accuracy
 * - Calculation request validation and error handling
 * - Performance and timeout handling
 *
 * CRITICAL: These tests MUST FAIL initially (TDD Red phase)
 * The endpoint /api/financial/metrics/calculate does NOT exist yet
 */

import type { Currency, FinancialMetrics, MonetaryValue, Period } from '@/types/financial';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { server } from '../mocks/server';

// Setup MSW server
beforeAll(() => {
  console.log('📡 Starting MSW server for financial metrics calculate tests...');
  server.listen({ onUnhandledRequest: 'error' });
  console.log('✅ MSW server started');
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('Contract: Financial Metrics Calculate API', () => {
  describe('POST /api/financial/metrics/calculate', () => {
    it('should calculate custom period metrics', async () => {
      // TDD RED PHASE: Test custom period calculation

      const requestBody = {
        period: {
          start: '2024-01-01',
          end: '2024-03-31',
          type: 'custom',
        },
        metrics: ['mrr', 'arr', 'churn', 'growth'],
        includeComparisons: true,
      };

      // ACT: Call real endpoint with calculation request
      const response = await fetch('http://localhost:3000/api/financial/metrics/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-test-token',
        },
        body: JSON.stringify(requestBody),
      });

      // ASSERT: Should return calculated metrics
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.calculation).toBeDefined();
      expect(data.data.calculation.period).toBeDefined();
      expect(data.data.calculation.metrics).toBeDefined();

      // Validate calculated period matches request
      expect(data.data.calculation.period.start).toBe('2024-01-01');
      expect(data.data.calculation.period.end).toBe('2024-03-31');
      expect(data.data.calculation.period.type).toBe('custom');
    });

    it('should validate calculation request structure', async () => {
      // TDD RED PHASE: Test request validation

      const invalidRequestBody = {
        period: {
          start: 'invalid-date',
          end: '2024-03-31',
        },
        metrics: ['invalid-metric'],
      };

      // ACT: Call endpoint with invalid request
      const response = await fetch('http://localhost:3000/api/financial/metrics/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-test-token',
        },
        body: JSON.stringify(invalidRequestBody),
      });

      // ASSERT: Should return validation error
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toBeDefined();
      expect(data.error.details.field).toBe('period.start');
    });

    it('should calculate real-time metrics with high accuracy', async () => {
      // TDD RED PHASE: Test real-time calculation accuracy

      const requestBody = {
        period: {
          start: '2024-01-01',
          end: '2024-01-31',
          type: 'month',
        },
        metrics: ['mrr', 'arr'],
        realTime: true,
        precision: 'high',
      };

      // ACT: Call endpoint for real-time calculation
      const response = await fetch('http://localhost:3000/api/financial/metrics/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-test-token',
        },
        body: JSON.stringify(requestBody),
      });

      // ASSERT: Real-time calculation validation
      expect(response.ok).toBe(true);

      const data = await response.json();
      const calculation = data.data.calculation;

      // Validate real-time flag and timestamps
      expect(calculation.realTime).toBe(true);
      expect(calculation.calculatedAt).toBeDefined();
      expect(new Date(calculation.calculatedAt)).toBeInstanceOf(Date);

      // Validate high precision calculations
      expect(calculation.precision).toBe('high');
      expect(calculation.metrics.mrr.amount).toBeTypeOf('number');
      expect(calculation.metrics.arr.amount).toBeCloseTo(
        calculation.metrics.mrr.amount * 12,
        4,
      ); // 4 decimal precision
    });
    it('should handle bulk calculations for multiple periods', async () => {
      // TDD RED PHASE: Test bulk calculation capabilities

      const requestBody = {
        calculations: [
          {
            period: { start: '2024-01-01', end: '2024-01-31', type: 'month' },
            metrics: ['mrr', 'churn'],
          },
          {
            period: { start: '2024-02-01', end: '2024-02-29', type: 'month' },
            metrics: ['mrr', 'churn'],
          },
          {
            period: { start: '2024-03-01', end: '2024-03-31', type: 'month' },
            metrics: ['mrr', 'churn'],
          },
        ],
        compareResults: true,
      };

      // ACT: Call endpoint for bulk calculations
      const response = await fetch('http://localhost:3000/api/financial/metrics/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-test-token',
        },
        body: JSON.stringify(requestBody),
      });

      // ASSERT: Bulk calculation validation
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.data.calculations).toBeDefined();
      expect(data.data.calculations).toHaveLength(3);

      // Validate each calculation result
      data.data.calculations.forEach((calc: any, index: number) => {
        expect(calc.period).toBeDefined();
        expect(calc.metrics.mrr).toBeDefined();
        expect(calc.metrics.churn).toBeDefined();
      });

      // Validate comparison results
      expect(data.data.comparison).toBeDefined();
      expect(data.data.comparison.trends).toBeDefined();
    });

    it('should handle calculation timeout scenarios', async () => {
      // TDD RED PHASE: Test timeout handling

      const requestBody = {
        period: {
          start: '2020-01-01',
          end: '2024-12-31',
          type: 'custom',
        },
        metrics: ['mrr', 'arr', 'churn', 'growth', 'cohort_analysis'],
        timeout: 5000, // 5 seconds timeout
      };

      // ACT: Call endpoint with potentially long calculation
      const response = await fetch('http://localhost:3000/api/financial/metrics/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-test-token',
        },
        body: JSON.stringify(requestBody),
      });

      // ASSERT: Should handle timeout appropriately
      if (response.status === 408) {
        // Timeout response
        expect(response.ok).toBe(false);
        const data = await response.json();
        expect(data.error.code).toBe('CALCULATION_TIMEOUT');
        expect(data.error.message).toContain('timeout');
      } else {
        // Successful response within timeout
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.data.calculation.executionTime).toBeLessThanOrEqual(5000);
      }
    });

    it('should validate calculation performance metrics', async () => {
      // TDD RED PHASE: Test performance monitoring

      const requestBody = {
        period: {
          start: '2024-01-01',
          end: '2024-01-31',
          type: 'month',
        },
        metrics: ['mrr'],
        includePerformance: true,
      };

      // ACT: Call endpoint with performance monitoring
      const response = await fetch('http://localhost:3000/api/financial/metrics/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-test-token',
        },
        body: JSON.stringify(requestBody),
      });

      // ASSERT: Performance metrics validation
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.data.performance).toBeDefined();
      expect(data.data.performance.executionTime).toBeTypeOf('number');
      expect(data.data.performance.executionTime).toBeGreaterThan(0);
      expect(data.data.performance.memoryUsage).toBeDefined();
      expect(data.data.performance.cacheHit).toBeTypeOf('boolean');
    });

    it('should handle missing required fields validation', async () => {
      // TDD RED PHASE: Test required fields validation

      const invalidRequestBody = {
        // Missing period
        metrics: ['mrr'],
      };

      // ACT: Call endpoint with missing required fields
      const response = await fetch('http://localhost:3000/api/financial/metrics/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-test-token',
        },
        body: JSON.stringify(invalidRequestBody),
      });

      // ASSERT: Should return validation error for missing fields
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_REQUIRED_FIELDS');
      expect(data.error.details.missingFields).toContain('period');
    });

    it('should validate calculation accuracy with known data', async () => {
      // TDD RED PHASE: Test calculation accuracy with predictable results

      const requestBody = {
        period: {
          start: '2024-01-01',
          end: '2024-01-31',
          type: 'month',
        },
        metrics: ['mrr', 'arr'],
        testMode: true, // Use test data for predictable results
        expectedResults: {
          mrr: 10000.0,
          arr: 120000.0,
        },
      };

      // ACT: Call endpoint with test data
      const response = await fetch('http://localhost:3000/api/financial/metrics/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-test-token',
        },
        body: JSON.stringify(requestBody),
      });

      // ASSERT: Calculation accuracy validation
      expect(response.ok).toBe(true);

      const data = await response.json();
      const metrics = data.data.calculation.metrics;

      // Validate calculation accuracy
      expect(metrics.mrr.amount).toBeCloseTo(10000.0, 2);
      expect(metrics.arr.amount).toBeCloseTo(120000.0, 2);
      expect(metrics.arr.amount).toBeCloseTo(metrics.mrr.amount * 12, 2);
    });
  });
});
