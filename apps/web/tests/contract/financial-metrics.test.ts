/**
 * Contract Test: Financial Metrics API
 *
 * Tests the GET /api/financial/metrics endpoint for:
 * - Metrics aggregation by period (monthly, quarterly, yearly)
 * - Metric calculations validation (MRR, ARR, churn, growth)
 * - Period filtering and date range validation
 * - Performance metrics and caching headers
 *
 * CRITICAL: These tests MUST FAIL initially (TDD Red phase)
 * The endpoint /api/financial/metrics does NOT exist yet
 */

import { describe, it, expect } from "vitest";
import type {
  FinancialMetrics,
  MonetaryValue,
  Currency,
  Period,
} from "@/types/financial";

describe("Contract: Financial Metrics API", () => {
  describe("GET /api/financial/metrics", () => {
    it("should return metrics aggregated by month", async () => {
      // TDD RED PHASE: Test monthly metrics aggregation

      // ACT: Call real endpoint with monthly period
      const response = await fetch(
        "/api/financial/metrics?period=month&date=2024-01",
      );

      // ASSERT: Should return monthly metrics data
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.metrics).toBeDefined();

      // Validate monthly period structure
      expect(data.data.period.type).toBe("month");
      expect(data.data.period.start).toBeDefined();
      expect(data.data.period.end).toBeDefined();
      expect(data.data.period.label).toMatch(/\w+ 2024/); // "Janeiro 2024"
    });

    it("should return metrics aggregated by quarter", async () => {
      // TDD RED PHASE: Test quarterly metrics aggregation

      // ACT: Call real endpoint with quarterly period
      const response = await fetch(
        "/api/financial/metrics?period=quarter&date=2024-Q1",
      );

      // ASSERT: Should return quarterly metrics data
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.data.period.type).toBe("quarter");
      expect(data.data.period.quarter).toBe(1);
      expect(data.data.period.year).toBe(2024);
      expect(data.data.period.label).toBe("Q1 2024");
    });

    it("should return metrics aggregated by year", async () => {
      // TDD RED PHASE: Test yearly metrics aggregation

      // ACT: Call real endpoint with yearly period
      const response = await fetch(
        "/api/financial/metrics?period=year&date=2024",
      );

      // ASSERT: Should return yearly metrics data
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.data.period.type).toBe("year");
      expect(data.data.period.year).toBe(2024);
      expect(data.data.period.label).toBe("2024");
    });

    it("should validate MRR calculation accuracy", async () => {
      // TDD RED PHASE: Test MRR calculation requirements

      // ACT: Call real endpoint for current month
      const response = await fetch(
        "/api/financial/metrics?period=month&date=current",
      );

      // ASSERT: MRR calculation validation
      expect(response.ok).toBe(true);

      const data = await response.json();
      const metrics = data.data.metrics;

      // MRR should be properly calculated
      expect(metrics.mrr).toBeDefined();
      expect(metrics.mrr.amount).toBeTypeOf("number");
      expect(metrics.mrr.amount).toBeGreaterThanOrEqual(0);
      expect(metrics.mrr.currency).toBe("BRL");
      expect(metrics.mrr.formatted).toMatch(/^R\$ [\d.,]+$/);

      // ARR should be MRR * 12 (approximately)
      expect(metrics.arr).toBeDefined();
      expect(metrics.arr.amount).toBeCloseTo(metrics.mrr.amount * 12, 2);
    });
    it("should validate churn rate calculation", async () => {
      // TDD RED PHASE: Test churn rate calculation accuracy

      // ACT: Call real endpoint for churn metrics
      const response = await fetch(
        "/api/financial/metrics?period=month&include=churn",
      );

      // ASSERT: Churn rate validation
      expect(response.ok).toBe(true);

      const data = await response.json();
      const metrics = data.data.metrics;

      expect(metrics.churnRate).toBeDefined();
      expect(metrics.churnRate).toBeTypeOf("number");
      expect(metrics.churnRate).toBeGreaterThanOrEqual(0);
      expect(metrics.churnRate).toBeLessThanOrEqual(100); // Percentage

      // Churn details should be included
      expect(metrics.churnDetails).toBeDefined();
      expect(metrics.churnDetails.churned).toBeTypeOf("number");
      expect(metrics.churnDetails.retained).toBeTypeOf("number");
      expect(metrics.churnDetails.total).toBeTypeOf("number");
    });

    it("should validate growth metrics calculation", async () => {
      // TDD RED PHASE: Test growth metrics accuracy

      // ACT: Call real endpoint for growth metrics
      const response = await fetch(
        "/api/financial/metrics?period=month&include=growth",
      );

      // ASSERT: Growth metrics validation
      expect(response.ok).toBe(true);

      const data = await response.json();
      const metrics = data.data.metrics;

      expect(metrics.growth).toBeDefined();
      expect(metrics.growth.mrrGrowth).toBeTypeOf("number");
      expect(metrics.growth.customerGrowth).toBeTypeOf("number");
      expect(metrics.growth.ticketGrowth).toBeTypeOf("number");

      // Growth percentages should be reasonable (-100% to +1000%)
      expect(metrics.growth.mrrGrowth).toBeGreaterThanOrEqual(-100);
      expect(metrics.growth.mrrGrowth).toBeLessThanOrEqual(1000);
    });

    it("should handle invalid date range validation", async () => {
      // TDD RED PHASE: Test date validation

      // ACT: Call endpoint with invalid date
      const response = await fetch(
        "/api/financial/metrics?period=month&date=invalid-date",
      );

      // ASSERT: Should return validation error
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_DATE_FORMAT");
      expect(data.error.message).toContain("formato de data");
    });

    it("should include proper caching headers", async () => {
      // TDD RED PHASE: Test performance caching headers

      // ACT: Call real endpoint
      const response = await fetch("/api/financial/metrics?period=month");

      // ASSERT: Caching headers validation
      expect(response.ok).toBe(true);

      // Cache headers should be present
      expect(response.headers.get("cache-control")).toBeDefined();
      expect(response.headers.get("etag")).toBeDefined();
      expect(response.headers.get("x-cache-ttl")).toBeDefined();

      // Cache control should specify max-age
      const cacheControl = response.headers.get("cache-control");
      expect(cacheControl).toMatch(/max-age=\d+/);
    });

    it("should handle period filtering with custom date range", async () => {
      // TDD RED PHASE: Test custom date range filtering

      // ACT: Call endpoint with custom date range
      const response = await fetch(
        "/api/financial/metrics?start_date=2024-01-01&end_date=2024-01-31",
      );

      // ASSERT: Custom period validation
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.data.period.type).toBe("custom");
      expect(data.data.period.start).toBe("2024-01-01");
      expect(data.data.period.end).toBe("2024-01-31");
      expect(data.data.period.days).toBe(31);
    });

    it("should validate metrics aggregation accuracy", async () => {
      // TDD RED PHASE: Test aggregation calculations

      // ACT: Call endpoint for aggregation validation
      const response = await fetch(
        "/api/financial/metrics?period=month&aggregate=true",
      );

      // ASSERT: Aggregation accuracy
      expect(response.ok).toBe(true);

      const data = await response.json();
      const metrics = data.data.metrics;

      // Total revenue should equal sum of all revenue streams
      expect(metrics.totalRevenue).toBeDefined();
      expect(metrics.revenueBreakdown).toBeDefined();

      const sum = metrics.revenueBreakdown.reduce(
        (acc: number, item: any) => acc + item.amount,
        0,
      );
      expect(metrics.totalRevenue.amount).toBeCloseTo(sum, 2);
    });
  });
});
