import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { RevenueAnalyticsEngine } from "../../../lib/financial/revenue-analytics-engine";

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    returns: jest.fn(),
  })),
};

jest.mock("../../../lib/supabase-browser", () => ({
  createBrowserClient: () => mockSupabaseClient,
}));

describe("RevenueAnalyticsEngine", () => {
  let analytics: RevenueAnalyticsEngine;

  beforeEach(() => {
    analytics = new RevenueAnalyticsEngine();

    // Mock current date
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15"));

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("Revenue Analysis Basic Tests", () => {
    it("should create analytics engine instance", () => {
      expect(analytics).toBeInstanceOf(RevenueAnalyticsEngine);
    });

    it("should have required methods", () => {
      expect(typeof analytics.analyzeRevenueByService).toBe("function");
      expect(typeof analytics.analyzeProviderPerformance).toBe("function");
      expect(typeof analytics.generateRevenueReport).toBe("function");
    });

    it("should handle empty date ranges gracefully", async () => {
      // Mock empty result
      mockSupabaseClient.from().returns({
        data: [],
        error: null,
      });

      const result = await analytics.analyzeRevenueByService({
        period: "monthly",
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });

  describe("Performance Tests", () => {
    it("should complete analysis within performance targets", async () => {
      // Mock performance data
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        service_type: `service${i % 10}`,
        revenue: Math.random() * 1000,
        count: Math.floor(Math.random() * 50),
        month: "2024-01",
      }));

      mockSupabaseClient.from().returns({
        data: mockData,
        error: null,
      });

      const startTime = Date.now();
      await analytics.generateRevenueReport({
        period: "monthly",
        limit: 100,
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Less than 1 second
    });
  });
});
