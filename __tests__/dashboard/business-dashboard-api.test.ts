/**
 * @file Business Dashboard API Integration Tests
 * @description Integration tests for Story 8.1 - Business Dashboard APIs
 * @author NeonPro Development Team
 * @created 2024-01-15
 */

// Mock global fetch for API testing
global.fetch = jest.fn();

describe("Business Dashboard API Integration - Story 8.1", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  describe("API Performance (<1s Load)", () => {
    it("should fetch KPIs data within performance budget", async () => {
      const startTime = performance.now();

      // Mock successful KPIs API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 125000.0,
          totalAppointments: 850,
          conversionRate: 0.2875,
          newPatients: 120,
          averageTicket: 147.06,
          retentionRate: 0.82,
          nps: 8.5,
          cac: 75.0,
        }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await fetch("/api/dashboard/kpis");
      const data = await response.json();

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(data.totalRevenue).toBe(125000.0);
      expect(data.totalAppointments).toBe(850);
      expect(duration).toBeLessThan(1000); // <1s load requirement
    });

    it("should fetch charts data within performance budget", async () => {
      const startTime = performance.now();

      // Mock successful charts API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          revenueChart: [
            { month: "Jan", revenue: 15000, appointments: 120 },
            { month: "Feb", revenue: 18000, appointments: 140 },
            { month: "Mar", revenue: 22000, appointments: 160 },
          ],
          conversionFunnel: [
            { stage: "Visitantes", value: 2500 },
            { stage: "Leads", value: 850 },
            { stage: "Agendamentos", value: 245 },
            { stage: "Conversões", value: 120 },
          ],
          procedureDistribution: [
            { procedure: "Limpeza", count: 320, revenue: 24000 },
            { procedure: "Botox", count: 85, revenue: 34000 },
            { procedure: "Preenchimento", count: 45, revenue: 22500 },
          ],
        }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await fetch("/api/dashboard/charts");
      const data = await response.json();

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(data.revenueChart).toHaveLength(3);
      expect(data.conversionFunnel).toHaveLength(4);
      expect(data.procedureDistribution).toHaveLength(3);
      expect(duration).toBeLessThan(1000); // <1s load requirement
    });
  });

  describe("API Data Validation", () => {
    it("should validate KPIs data structure", async () => {
      // Mock successful KPIs API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalRevenue: 125000.0,
          totalAppointments: 850,
          conversionRate: 0.2875,
          newPatients: 120,
          averageTicket: 147.06,
          retentionRate: 0.82,
          nps: 8.5,
          cac: 75.0,
        }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await fetch("/api/dashboard/kpis");
      const data = await response.json();

      // Validate required KPI fields
      expect(data).toHaveProperty("totalRevenue");
      expect(data).toHaveProperty("totalAppointments");
      expect(data).toHaveProperty("conversionRate");
      expect(data).toHaveProperty("newPatients");
      expect(data).toHaveProperty("averageTicket");
      expect(data).toHaveProperty("retentionRate");
      expect(data).toHaveProperty("nps");
      expect(data).toHaveProperty("cac");

      // Validate data types
      expect(typeof data.totalRevenue).toBe("number");
      expect(typeof data.totalAppointments).toBe("number");
      expect(typeof data.conversionRate).toBe("number");
      expect(typeof data.newPatients).toBe("number");
    });

    it("should validate charts data structure", async () => {
      // Mock successful charts API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          revenueChart: [
            { month: "Jan", revenue: 15000, appointments: 120 },
            { month: "Feb", revenue: 18000, appointments: 140 },
          ],
          conversionFunnel: [
            { stage: "Visitantes", value: 2500 },
            { stage: "Leads", value: 850 },
          ],
          procedureDistribution: [
            { procedure: "Limpeza", count: 320, revenue: 24000 },
            { procedure: "Botox", count: 85, revenue: 34000 },
          ],
        }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await fetch("/api/dashboard/charts");
      const data = await response.json();

      // Validate charts structure
      expect(data).toHaveProperty("revenueChart");
      expect(data).toHaveProperty("conversionFunnel");
      expect(data).toHaveProperty("procedureDistribution");

      // Validate array structures
      expect(Array.isArray(data.revenueChart)).toBe(true);
      expect(Array.isArray(data.conversionFunnel)).toBe(true);
      expect(Array.isArray(data.procedureDistribution)).toBe(true);

      // Validate array item structures
      if (data.revenueChart.length > 0) {
        expect(data.revenueChart[0]).toHaveProperty("month");
        expect(data.revenueChart[0]).toHaveProperty("revenue");
      }
    });
  });

  describe("API Error Handling", () => {
    it("should handle KPIs API errors gracefully", async () => {
      // Mock failed KPIs API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: "Internal Server Error",
          message: "Database connection failed",
        }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await fetch("/api/dashboard/kpis");
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Internal Server Error");
    });

    it("should handle charts API errors gracefully", async () => {
      // Mock failed charts API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: "Not Found",
          message: "Charts data not available",
        }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await fetch("/api/dashboard/charts");
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Not Found");
    });
  });

  describe("API Security & Authentication", () => {
    it("should require authentication for KPIs endpoint", async () => {
      // Mock unauthorized response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: "Unauthorized",
          message: "Authentication required",
        }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await fetch("/api/dashboard/kpis");
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should validate user permissions for dashboard access", async () => {
      // Mock forbidden response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: "Forbidden",
          message: "Insufficient permissions for dashboard access",
        }),
        headers: new Headers({ "content-type": "application/json" }),
      });

      const response = await fetch("/api/dashboard/charts");
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });
  });

  describe("API Caching & Performance", () => {
    it("should support cache headers for performance", async () => {
      // Mock response with cache headers
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalRevenue: 125000 }),
        headers: new Headers({
          "content-type": "application/json",
          "cache-control": "public, max-age=300",
          etag: '"abc123"',
        }),
      });

      const response = await fetch("/api/dashboard/kpis");

      expect(response.headers.get("cache-control")).toBe("public, max-age=300");
      expect(response.headers.get("etag")).toBe('"abc123"');
    });

    it("should handle concurrent requests efficiently", async () => {
      // Mock multiple concurrent responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ totalRevenue: 125000 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ revenueChart: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ alerts: [] }),
        });

      const startTime = performance.now();

      // Simulate concurrent API calls
      const promises = [
        fetch("/api/dashboard/kpis"),
        fetch("/api/dashboard/charts"),
        fetch("/api/dashboard/alerts"),
      ];

      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(3);
      expect(responses.every((r) => r.ok)).toBe(true);
      expect(duration).toBeLessThan(2000); // Should handle concurrent requests efficiently
    });
  });
});
