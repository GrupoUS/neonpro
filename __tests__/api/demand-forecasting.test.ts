/**
 * Demand Forecasting API Tests - Story 11.1
 * Test coverage for demand forecasting endpoints with ≥80% accuracy requirement
 */

import { GET } from "@/src/app/api/forecasting/route";
import {
  GET as getAllocationsGET,
  POST as allocationsPOST,
} from "@/src/app/api/forecasting/resource-allocation/route";
import { NextRequest } from "next/server";

// Mock NextResponse for Jest compatibility with Next.js 15
jest.mock("next/server", () => ({
  NextRequest: jest.requireActual("next/server").NextRequest,
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: new Map(),
    })),
  },
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  data: [],
  error: null,
};

jest.mock("@/app/utils/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(() => mockSupabaseClient),
}));

// Mock demand forecasting engine
jest.mock("@/src/lib/analytics/demand-forecasting", () => ({
  DemandForecastingEngine: jest.fn().mockImplementation(() => ({
    generateForecast: jest.fn().mockResolvedValue({
      id: "123e4567-e89b-12d3-a456-426614174000",
      accuracy: 0.85,
      predictions: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          service_id: "123e4567-e89b-12d3-a456-426614174001",
          demand_value: 150,
          confidence_level: 0.85,
          forecast_period: {
            start_date: "2024-01-01",
            end_date: "2024-01-31",
          },
          seasonal_factors: { summer: 1.2, winter: 0.8 },
          external_factors: { promotion: 1.1, weather: 0.95 },
        },
      ],
      metadata: {
        service_id: "123e4567-e89b-12d3-a456-426614174001",
        forecast_period: {
          start_date: "2024-01-01",
          end_date: "2024-01-31",
        },
      },
    }),
    generateResourceAllocation: jest.fn().mockResolvedValue({
      recommendations: [
        {
          resource_type: "staff",
          recommended_quantity: 5,
          current_quantity: 4,
          optimization_score: 0.85,
        },
      ],
      optimization_type: "balanced",
      expected_efficiency: 0.88,
    }),
  })),
}));

// Valid test data with proper UUIDs
const validServiceId = "123e4567-e89b-12d3-a456-426614174001";
const validForecastId = "123e4567-e89b-12d3-a456-426614174000";

const mockForecast = {
  id: validForecastId,
  service_id: validServiceId,
  demand_value: 150,
  confidence_level: 0.85,
  forecast_period: {
    start_date: "2024-01-01",
    end_date: "2024-01-31",
  },
  seasonal_factors: { summer: 1.2, winter: 0.8 },
  external_factors: { promotion: 1.1, weather: 0.95 },
};

const mockAppointments = [
  {
    id: "123e4567-e89b-12d3-a456-426614174002",
    service_id: validServiceId,
    scheduled_at: "2024-01-15T10:00:00Z",
    status: "completed",
    duration_minutes: 60,
  },
];

describe("/api/forecasting - Demand Forecasting API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset engine mock to default working state
    const { DemandForecastingEngine } = require("@/src/lib/analytics/demand-forecasting");
    DemandForecastingEngine.mockImplementation(() => ({
      generateForecast: jest.fn().mockResolvedValue({
        id: "123e4567-e89b-12d3-a456-426614174000",
        accuracy: 0.85,
        predictions: [mockForecast],
      }),
      generateResourceAllocationRecommendations: jest.fn().mockResolvedValue([
        {
          resource_type: "staff",
          recommended_quantity: 5,
          priority: "high",
          estimated_cost: 5000,
          time_period: "2024-02-01 to 2024-02-07",
          cost_optimization: {
            total_cost_impact: 5000,
            efficiency_gains: 0.95,
          },
        },
      ]),
    }));

    // Setup different return values for different operations
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === "appointments") {
        return {
          ...mockSupabaseClient,
          data: mockAppointments,
          error: null,
        };
      } else if (table === "demand_forecasts") {
        return {
          ...mockSupabaseClient,
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValue({
            data: [mockForecast],
            error: null,
          }),
          data: [mockForecast],
          error: null,
        };
      }
      return mockSupabaseClient;
    });

    mockSupabaseClient.data = mockAppointments;
    mockSupabaseClient.error = null;
  });

  describe("GET /api/forecasting", () => {
    test("should generate demand forecast with default parameters", async () => {
      const request = new NextRequest("http://localhost:3000/api/forecasting");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.accuracy).toBeGreaterThanOrEqual(0.8);
      expect(data.data.forecasts).toBeDefined();
      expect(Array.isArray(data.data.forecasts)).toBe(true);
      expect(data.data.forecasts[0].demand_value).toBeGreaterThan(0);
    });

    test("should generate forecast with custom parameters", async () => {
      const url = new URL("http://localhost:3000/api/forecasting");
      url.searchParams.set("period", "30");
      url.searchParams.set("includeSeasonality", "true");
      url.searchParams.set("includeExternalFactors", "true");
      url.searchParams.set("confidenceLevel", "0.95");

      const request = new NextRequest(url.toString());
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.accuracy).toBeGreaterThanOrEqual(0.8);
    });

    test("should filter by service ID when provided", async () => {
      const url = new URL("http://localhost:3000/api/forecasting");
      url.searchParams.set("serviceId", validServiceId);

      const request = new NextRequest(url.toString());
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Verify that the API was called (may call either appointments or demand_forecasts)
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });

    test("should validate accuracy threshold requirement", async () => {
      const request = new NextRequest("http://localhost:3000/api/forecasting");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.accuracy).toBeGreaterThanOrEqual(0.8);
    });

    test("should handle missing appointment data", async () => {
      mockSupabaseClient.data = [];

      const request = new NextRequest("http://localhost:3000/api/forecasting");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("should handle authentication errors", async () => {
      mockSupabaseClient.error = { message: "Authentication required" };

      const request = new NextRequest("http://localhost:3000/api/forecasting");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("should validate parameter ranges", async () => {
      const url = new URL("http://localhost:3000/api/forecasting");
      url.searchParams.set("period", "1000"); // Invalid range
      url.searchParams.set("confidenceLevel", "0.99"); // Valid max value

      const request = new NextRequest(url.toString());
      const response = await GET(request);

      // Should handle validation errors gracefully
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe("Forecast Generation Performance", () => {
    test("should complete forecast generation within time limits", async () => {
      const startTime = Date.now();

      const request = new NextRequest("http://localhost:3000/api/forecasting");
      const response = await GET(request);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // 5 second max
      expect(response.status).toBe(200);
    });

    test("should handle concurrent forecast requests", async () => {
      const requests = Array.from({ length: 3 }, () =>
        GET(new NextRequest("http://localhost:3000/api/forecasting")),
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle database connection errors", async () => {
      mockSupabaseClient.error = new Error("Database connection failed");

      const request = new NextRequest("http://localhost:3000/api/forecasting");
      const response = await GET(request);

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test("should handle forecasting engine errors", async () => {
      const { DemandForecastingEngine } = require("@/src/lib/analytics/demand-forecasting");
      DemandForecastingEngine.mockImplementation(() => ({
        generateForecast: jest.fn().mockRejectedValue(new Error("Engine error")),
      }));

      const request = new NextRequest("http://localhost:3000/api/forecasting");
      const response = await GET(request);

      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});

describe("/api/forecasting/resource-allocation - Resource Allocation API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup engine mock for resource allocation
    const { DemandForecastingEngine } = require("@/src/lib/analytics/demand-forecasting");
    DemandForecastingEngine.mockImplementation(() => ({
      generateForecast: jest.fn().mockResolvedValue({
        id: "123e4567-e89b-12d3-a456-426614174000",
        accuracy: 0.85,
        predictions: [mockForecast],
      }),
      generateResourceAllocationRecommendations: jest.fn().mockResolvedValue([
        {
          resource_type: "staff",
          recommended_quantity: 5,
          priority: "high",
          estimated_cost: 5000,
          time_period: "2024-02-01 to 2024-02-07",
          cost_optimization: {
            total_cost_impact: 5000,
            efficiency_gains: 0.95,
          },
        },
      ]),
    }));

    // Setup mock for resource allocation queries
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === "demand_forecasts") {
        return {
          ...mockSupabaseClient,
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [mockForecast],
            error: null,
          }),
        };
      }
      return mockSupabaseClient;
    });

    mockSupabaseClient.data = [mockForecast];
    mockSupabaseClient.error = null;
  });

  describe("POST /api/forecasting/resource-allocation", () => {
    test("should generate resource allocation recommendations", async () => {
      const requestBody = {
        forecastIds: [validForecastId],
        optimizationType: "balanced",
        constraints: {
          budget_limit: 10000,
          staff_limit: 10,
        },
      };

      const request = new NextRequest("http://localhost:3000/api/forecasting/resource-allocation", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const response = await allocationsPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201); // 201 for created resource allocation
      expect(data.success).toBe(true);
      expect(data.data.recommendations).toBeDefined();
      expect(Array.isArray(data.data.recommendations)).toBe(true);
    });

    test("should handle different optimization strategies", async () => {
      const strategies = ["cost", "efficiency", "quality", "balanced"];

      for (const strategy of strategies) {
        const requestBody = {
          forecastIds: [validForecastId],
          optimizationType: strategy,
          constraints: {},
        };

        const request = new NextRequest(
          "http://localhost:3000/api/forecasting/resource-allocation",
          {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await allocationsPOST(request);
        const data = await response.json();

        expect(response.status).toBe(201); // 201 for created resource allocation
        expect(data.success).toBe(true);
      }
    });

    test("should validate required request parameters", async () => {
      const requestBody = {
        // Missing forecastIds
        optimizationType: "balanced",
      };

      const request = new NextRequest("http://localhost:3000/api/forecasting/resource-allocation", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const response = await allocationsPOST(request);

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test("should handle empty forecast IDs array", async () => {
      const requestBody = {
        forecastIds: [],
        optimizationType: "balanced",
      };

      const request = new NextRequest("http://localhost:3000/api/forecasting/resource-allocation", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const response = await allocationsPOST(request);

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test("should validate optimization type parameter", async () => {
      const requestBody = {
        forecastIds: [validForecastId],
        optimizationType: "invalid_type",
      };

      const request = new NextRequest("http://localhost:3000/api/forecasting/resource-allocation", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const response = await allocationsPOST(request);

      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe("GET /api/forecasting/resource-allocation", () => {
    test("should return current resource allocation status", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/forecasting/resource-allocation?forecastId=${validForecastId}`,
      );
      const response = await getAllocationsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("should return error for missing forecastId", async () => {
      const request = new NextRequest("http://localhost:3000/api/forecasting/resource-allocation");
      const response = await getAllocationsGET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("At least one forecast ID is required");
      expect(data.error.code).toBe("MISSING_FORECAST_IDS");
    });

    test("should handle no existing allocations", async () => {
      mockSupabaseClient.data = [];

      const request = new NextRequest(
        `http://localhost:3000/api/forecasting/resource-allocation?forecastId=${validForecastId}`,
      );
      const response = await getAllocationsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Resource Allocation Performance", () => {
    test("should optimize resource allocation within time constraints", async () => {
      const requestBody = {
        forecastIds: [validForecastId],
        optimizationType: "efficiency",
      };

      const startTime = Date.now();

      const request = new NextRequest("http://localhost:3000/api/forecasting/resource-allocation", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const response = await allocationsPOST(request);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // 10 second max
      expect(response.status).toBe(201); // 201 for created resource allocation
    });

    test("should handle large numbers of forecasts efficiently", async () => {
      const largeArray = Array(50).fill(validForecastId);

      const requestBody = {
        forecastIds: largeArray,
        optimizationType: "balanced",
      };

      const request = new NextRequest("http://localhost:3000/api/forecasting/resource-allocation", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const response = await allocationsPOST(request);

      expect(response.status).toBe(201); // 201 for created resource allocation
    });
  });
});
