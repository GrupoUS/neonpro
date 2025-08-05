/**
 * Executive Dashboard Service Integration Test
 * Tests the complete executive dashboard functionality end-to-end
 */

import { ExecutiveDashboardService } from "@/lib/services/executive-dashboard";

// Mock the dependencies
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(() =>
          Promise.resolve({
            data: { role: "admin", permissions: ["executive_dashboard"] },
            error: null,
          }),
        ),
      };

      // Mock different responses based on table
      if (table === "executive_dashboard_metrics" || table === "executive_dashboard_charts") {
        // Add promise resolution to the chain for metrics/charts
        mockChain.order = jest.fn(() =>
          Promise.resolve({
            data: [
              {
                id: "1",
                date: "2024-01-01",
                revenue: 10000,
                new_patients: 15,
                appointments: 50,
                completed_appointments: 45,
                costs: 7000,
                satisfaction_sum: 200,
                satisfaction_count: 40,
              },
            ],
            error: null,
          }),
        );
      } else if (table === "executive_dashboard_alerts") {
        // Mock alerts with double order + limit
        mockChain.order = jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() =>
              Promise.resolve({
                data: [],
                error: null,
              }),
            ),
          })),
        }));
      } else if (table === "professionals") {
        // Mock professionals table for access verification
        mockChain.eq = jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { role: "admin", permissions: ["executive_dashboard"] },
              error: null,
            }),
          ),
        }));
      }

      return mockChain;
    }),
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
      ),
    },
  })),
}));

jest.mock("@/lib/auth/server", () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({ id: "test-user-id" })),
}));

jest.mock("@/lib/analytics/service", () => ({
  AnalyticsService: jest.fn(() => ({})),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("ExecutiveDashboardService Integration", () => {
  let service: ExecutiveDashboardService;

  beforeEach(() => {
    service = new ExecutiveDashboardService();
    jest.clearAllMocks();
  });

  describe("Dashboard Metrics", () => {
    it("should fetch comprehensive dashboard metrics successfully", async () => {
      const filters = {
        dateRange: {
          start: "2024-01-01",
          end: "2024-01-31",
        },
        clinicIds: ["clinic-1"],
        categories: ["financial", "operational"],
      };

      const result = await service.getDashboardMetrics(filters);

      expect(result).toHaveProperty("kpis");
      expect(result).toHaveProperty("charts");
      expect(result).toHaveProperty("alerts");
      expect(result).toHaveProperty("lastUpdated");
      expect(result.kpis).toBeInstanceOf(Array);
      expect(result.kpis.length).toBeGreaterThan(0);
    });

    it("should calculate KPIs correctly", async () => {
      const filters = {
        dateRange: {
          start: "2024-01-01",
          end: "2024-01-31",
        },
      };

      const kpis = await service.getKPIs(filters);

      expect(kpis).toBeInstanceOf(Array);
      expect(kpis.length).toBe(6); // Revenue, Patients, Appointments, Efficiency, Profitability, Satisfaction

      const revenueKPI = kpis.find((kpi) => kpi.id === "revenue");
      expect(revenueKPI).toBeDefined();
      expect(revenueKPI?.format).toBe("currency");
      expect(revenueKPI?.category).toBe("financial");
    });

    it("should fetch chart data with proper structure", async () => {
      const filters = {
        dateRange: {
          start: "2024-01-01",
          end: "2024-01-31",
        },
      };

      const charts = await service.getChartData(filters);

      expect(charts).toHaveProperty("revenue");
      expect(charts).toHaveProperty("appointments");
      expect(charts).toHaveProperty("patients");

      expect(charts.revenue).toHaveProperty("labels");
      expect(charts.revenue).toHaveProperty("data");
      expect(charts.revenue).toHaveProperty("previousData");
    });

    it("should fetch alerts with proper prioritization", async () => {
      const filters = {
        dateRange: {
          start: "2024-01-01",
          end: "2024-01-31",
        },
      };

      const alerts = await service.getAlerts(filters);

      expect(alerts).toBeInstanceOf(Array);
      // Since we mocked empty alerts, we expect an empty array
      expect(alerts.length).toBe(0);
    });
  });

  describe("Period Comparison", () => {
    it("should compare metrics between two periods", async () => {
      const currentPeriod = {
        start: "2024-01-01",
        end: "2024-01-31",
      };

      const previousPeriod = {
        start: "2023-12-01",
        end: "2023-12-31",
      };

      const comparison = await service.comparePeriods(currentPeriod, previousPeriod);

      expect(comparison).toHaveProperty("current");
      expect(comparison).toHaveProperty("previous");
      expect(comparison).toHaveProperty("changes");

      expect(comparison.current).toHaveProperty("metrics");
      expect(comparison.previous).toHaveProperty("metrics");
      expect(comparison.changes).toBeInstanceOf(Object);
    });
  });

  describe("Export Functionality", () => {
    it("should generate export URLs for different formats", async () => {
      const filters = {
        dateRange: {
          start: "2024-01-01",
          end: "2024-01-31",
        },
      };

      const pdfExport = await service.exportDashboard(filters, "pdf");
      const excelExport = await service.exportDashboard(filters, "excel");
      const csvExport = await service.exportDashboard(filters, "csv");

      expect(pdfExport).toHaveProperty("url");
      expect(pdfExport).toHaveProperty("filename");
      expect(pdfExport.filename).toContain(".pdf");

      expect(excelExport).toHaveProperty("url");
      expect(excelExport).toHaveProperty("filename");
      expect(excelExport.filename).toContain(".excel");

      expect(csvExport).toHaveProperty("url");
      expect(csvExport).toHaveProperty("filename");
      expect(csvExport.filename).toContain(".csv");
    });
  });

  describe("Error Handling", () => {
    it("should handle authentication errors gracefully", async () => {
      // Mock unauthenticated user
      const mockGetCurrentUser = require("@/lib/auth/server").getCurrentUser;
      mockGetCurrentUser.mockResolvedValueOnce(null);

      const filters = {
        dateRange: {
          start: "2024-01-01",
          end: "2024-01-31",
        },
      };

      await expect(service.getDashboardMetrics(filters)).rejects.toThrow("User not authenticated");
    });

    it("should handle insufficient permissions", async () => {
      const service = new ExecutiveDashboardService();

      // Spy on the verifyExecutiveAccess method and make it throw
      const verifyAccessSpy = jest
        .spyOn(service as any, "verifyExecutiveAccess")
        .mockRejectedValue(new Error("Insufficient permissions for executive dashboard"));

      const filters = {
        dateRange: {
          start: "2024-01-01",
          end: "2024-01-31",
        },
      };

      await expect(service.getDashboardMetrics(filters)).rejects.toThrow(
        "Insufficient permissions for executive dashboard",
      );

      verifyAccessSpy.mockRestore();
    });
  });
});
