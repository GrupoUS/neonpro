// 🧪 **Revenue Optimization API Route Tests**
// Comprehensive test suite for revenue optimization endpoints

import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";

// Mock Supabase FIRST
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock revenue optimization engine with proper ES module pattern
jest.mock("@/lib/financial/revenue-optimization-engine", () => ({
  RevenueOptimizationEngine: jest.fn().mockImplementation(() => ({
    optimizePricing: jest.fn(),
    optimizeServiceMix: jest.fn(),
    enhanceCLV: jest.fn(),
    generateAutomatedRecommendations: jest.fn(),
    performCompetitiveAnalysis: jest.fn(),
    trackROI: jest.fn(),
  })),
  revenueOptimizationEngine: {
    optimizePricing: jest.fn(),
    optimizeServiceMix: jest.fn(),
    enhanceCLV: jest.fn(),
    generateAutomatedRecommendations: jest.fn(),
    performCompetitiveAnalysis: jest.fn(),
    trackROI: jest.fn(),
  },
}));

// Import AFTER mocks are defined
import { GET, POST, PUT, DELETE } from "@/app/api/revenue-optimization/route";
import { createClient } from "@/app/utils/supabase/server";

describe("Revenue Optimization API", () => {
  let mockSupabaseClient: any;

  const validUserId = "550e8400-e29b-41d4-a716-446655440001";
  const validClinicId = "550e8400-e29b-41d4-a716-446655440002";
  const validOptId = "550e8400-e29b-41d4-a716-446655440003";

  beforeEach(() => {
    jest.clearAllMocks();

    // Import mocked engine using require pattern
    const { revenueOptimizationEngine } = require("@/lib/financial/revenue-optimization-engine");

    // Setup Supabase client mock
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: validUserId, email: "test@test.com" } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({
                    data: { clinic_id: validClinicId },
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: { id: validOptId, title: "Test Optimization" },
                error: null,
              }),
            ),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({
                    data: { id: validOptId, title: "Updated Title" },
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() =>
              Promise.resolve({
                error: null,
              }),
            ),
          })),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            }),
          ),
        })),
      }),
    };

    // createClient returns a Promise that resolves to the client
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

    // Setup engine mocks using require pattern
    (revenueOptimizationEngine.optimizePricing as jest.Mock).mockResolvedValue({
      recommendations: ["Increase premium service prices by 10%"],
      projectedIncrease: 15,
      implementationPlan: ["Update pricing", "Train staff"],
      metrics: { currentRevenue: 10000, projectedRevenue: 11500 },
    });

    (revenueOptimizationEngine.optimizeServiceMix as jest.Mock).mockResolvedValue({
      recommendations: ["Focus on high-margin procedures"],
      profitabilityGain: 20,
      implementationPlan: ["Staff training", "Marketing"],
      analysis: { highMarginServices: ["Botox", "Fillers"] },
    });

    (revenueOptimizationEngine.enhanceCLV as jest.Mock).mockResolvedValue({
      recommendations: ["Implement loyalty program"],
      projectedIncrease: 25,
      implementationPlan: ["Program design", "Launch"],
      insights: { avgCLV: 5000, targetCLV: 6250 },
    });

    (revenueOptimizationEngine.generateAutomatedRecommendations as jest.Mock).mockResolvedValue({
      recommendations: ["Optimize scheduling"],
      confidence: 0.85,
      implementationPlan: ["System update"],
      insights: { efficiency: 90 },
    });

    (revenueOptimizationEngine.performCompetitiveAnalysis as jest.Mock).mockResolvedValue({
      recommendations: ["Price adjustments"],
      marketPosition: "competitive",
      implementationPlan: ["Research", "Adjust"],
      analysis: { competitors: 5, avgPrice: 100 },
    });

    (revenueOptimizationEngine.trackROI as jest.Mock).mockResolvedValue({
      recommendations: ["Monitor metrics"],
      currentROI: 15,
      implementationPlan: ["Setup tracking"],
      metrics: { investment: 1000, returns: 1150 },
    });
  });

  describe("🔥 GET /api/revenue-optimization", () => {
    test("should return comprehensive revenue optimization overview", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/revenue-optimization?clinicId=${validClinicId}`,
      );

      try {
        const response = await GET(request);

        // Debug: log error details if status is not 200
        if (response.status !== 200) {
          const errorData = await response.json();
          throw new Error(`API returned ${response.status}: ${JSON.stringify(errorData)}`);
        }

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty("pricingOptimization");
        expect(data).toHaveProperty("serviceMixOptimization");
        expect(data).toHaveProperty("clvEnhancement");
        expect(data).toHaveProperty("automatedRecommendations");
        expect(data).toHaveProperty("competitiveAnalysis");
        expect(data).toHaveProperty("roiTracking");
      } catch (error) {
        throw new Error(`Test failed with error: ${error.message}`);
      }
    });

    test("should validate clinic access", async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
          })),
        })),
      });

      const request = new NextRequest(
        `http://localhost:3000/api/revenue-optimization?clinicId=${validClinicId}`,
      );
      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    test("should require clinic ID", async () => {
      const request = new NextRequest("http://localhost:3000/api/revenue-optimization");
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    test("should handle authentication errors", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/revenue-optimization?clinicId=${validClinicId}`,
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    test("should call all optimization engines", async () => {
      const { revenueOptimizationEngine } = require("@/lib/financial/revenue-optimization-engine");

      const request = new NextRequest(
        `http://localhost:3000/api/revenue-optimization?clinicId=${validClinicId}`,
      );
      await GET(request);

      expect(revenueOptimizationEngine.optimizePricing).toHaveBeenCalledWith(
        validClinicId,
        undefined,
      );
      expect(revenueOptimizationEngine.optimizeServiceMix).toHaveBeenCalledWith(validClinicId);
      expect(revenueOptimizationEngine.enhanceCLV).toHaveBeenCalledWith(validClinicId, undefined);
      expect(revenueOptimizationEngine.generateAutomatedRecommendations).toHaveBeenCalledWith(
        validClinicId,
      );
      expect(revenueOptimizationEngine.performCompetitiveAnalysis).toHaveBeenCalledWith(
        validClinicId,
      );
      expect(revenueOptimizationEngine.trackROI).toHaveBeenCalledWith(validClinicId, undefined);
    });

    test("should handle engine errors gracefully", async () => {
      const { revenueOptimizationEngine } = require("@/lib/financial/revenue-optimization-engine");

      revenueOptimizationEngine.optimizePricing.mockRejectedValueOnce(new Error("Engine error"));

      const request = new NextRequest(
        `http://localhost:3000/api/revenue-optimization?clinicId=${validClinicId}`,
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe("🔥 POST /api/revenue-optimization", () => {
    test("should create pricing optimization", async () => {
      const requestBody = {
        optimizationType: "pricing",
        clinicId: validClinicId,
        title: "Pricing Optimization Test",
        serviceId: "service-123",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockOptimizePricing).toHaveBeenCalledWith(validClinicId, "service-123");
    });

    test("should create service mix optimization", async () => {
      const requestBody = {
        optimizationType: "service_mix",
        clinicId: validClinicId,
        title: "Service Mix Test",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockOptimizeServiceMix).toHaveBeenCalledWith(validClinicId);
    });

    test("should create CLV optimization", async () => {
      const requestBody = {
        optimizationType: "clv",
        clinicId: validClinicId,
        title: "CLV Test",
        patientId: "patient-123",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockEnhanceCLV).toHaveBeenCalledWith(validClinicId, "patient-123");
    });

    test("should create automated recommendations", async () => {
      const requestBody = {
        optimizationType: "automated_recommendations",
        clinicId: validClinicId,
        title: "Automated Test",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockGenerateAutomatedRecommendations).toHaveBeenCalledWith(validClinicId);
    });

    test("should create competitive analysis", async () => {
      const requestBody = {
        optimizationType: "competitive_analysis",
        clinicId: validClinicId,
        title: "Competitive Test",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockPerformCompetitiveAnalysis).toHaveBeenCalledWith(validClinicId);
    });

    test("should create ROI tracking", async () => {
      const requestBody = {
        optimizationType: "roi_tracking",
        clinicId: validClinicId,
        title: "ROI Test",
        optimizationId: "opt-789",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockTrackROI).toHaveBeenCalledWith(validClinicId, "opt-789");
    });

    test("should validate required fields", async () => {
      const requestBody = {
        optimizationType: "pricing",
        // Missing clinicId
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    test("should reject invalid optimization type", async () => {
      const requestBody = {
        optimizationType: "invalid_type",
        clinicId: validClinicId,
        title: "Invalid Test",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    test("should handle Supabase insert errors", async () => {
      // Mock professional verification (success)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({
                    data: { clinic_id: validClinicId },
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      // Mock optimization insert (error)
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: "Insert failed", code: "INSERT_ERROR" },
              }),
            ),
          })),
        })),
      });

      const requestBody = {
        optimizationType: "pricing",
        clinicId: validClinicId,
        title: "Test Optimization",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe("🔥 PUT /api/revenue-optimization", () => {
    test("should update optimization successfully", async () => {
      const requestBody = {
        id: validOptId,
        clinicId: validClinicId,
        title: "Updated Title",
        status: "completed",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
    });

    test("should validate required fields for update", async () => {
      const requestBody = {
        clinicId: validClinicId,
        title: "Updated Title",
        // Missing id
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
    });

    test("should handle update errors", async () => {
      // Mock professional verification (success)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({
                    data: { clinic_id: validClinicId },
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      // Mock optimization update (error)
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({
                    data: null,
                    error: { message: "Update failed", code: "UPDATE_ERROR" },
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      const requestBody = {
        id: validOptId,
        clinicId: validClinicId,
        title: "Updated Title",
      };

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

      const response = await PUT(request);

      expect(response.status).toBe(500);
    });
  });

  describe("🔥 DELETE /api/revenue-optimization", () => {
    test("should delete optimization successfully", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/revenue-optimization?id=opt-1&clinicId=clinic-123",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request);

      expect(response.status).toBe(200);
    });

    test("should validate required parameters for delete", async () => {
      const request = new NextRequest("http://localhost:3000/api/revenue-optimization?id=opt-1", {
        method: "DELETE",
        // Missing clinicId
      });

      const response = await DELETE(request);

      expect(response.status).toBe(400);
    });

    test("should handle delete errors", async () => {
      // Mock professional verification (success)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({
                    data: { clinic_id: validClinicId },
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      // Mock optimization delete (error)
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() =>
              Promise.resolve({
                error: { message: "Delete failed", code: "DELETE_ERROR" },
              }),
            ),
          })),
        })),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/revenue-optimization?id=opt-1&clinicId=clinic-123",
        {
          method: "DELETE",
        },
      );

      const response = await DELETE(request);

      expect(response.status).toBe(500);
    });
  });

  describe("🔥 Authorization and Security", () => {
    test("should require authentication for all endpoints", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const getRequest = new NextRequest(
        "http://localhost:3000/api/revenue-optimization?clinicId=clinic-123",
      );
      const postRequest = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: JSON.stringify({ optimizationType: "pricing", clinicId: validClinicId }),
      });

      const getResponse = await GET(getRequest);
      const postResponse = await POST(postRequest);

      expect(getResponse.status).toBe(401);
      expect(postResponse.status).toBe(401);
    });

    test("should verify clinic access for all endpoints", async () => {
      // Mock authenticated user but without access to the specific clinic
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: validUserId, email: "test@test.com" } },
        error: null,
      });

      // Mock professional verification (no access - returns null)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
          })),
        })),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/revenue-optimization?clinicId=unauthorized-clinic",
      );

      const response = await GET(request);

      expect(response.status).toBe(403);
    });
  });

  describe("🔥 Performance and Error Handling", () => {
    test("should handle concurrent optimization requests", async () => {
      // Mock authenticated user for concurrent requests
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: validUserId, email: "test@test.com" } },
        error: null,
      });

      // Mock professional verification (success for all)
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({ data: { clinic_id: validClinicId }, error: null }),
                ),
              })),
            })),
          })),
        })),
      });

      const requests = Array.from(
        { length: 5 },
        (_, i) =>
          new NextRequest(
            `http://localhost:3000/api/revenue-optimization?clinicId=${validClinicId}`,
          ),
      );

      const responses = await Promise.all(requests.map((req) => GET(req)));

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    test("should handle malformed JSON in POST requests", async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: validUserId, email: "test@test.com" } },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/revenue-optimization", {
        method: "POST",
        body: "invalid json",
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    test("should timeout gracefully on slow operations", async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: validUserId, email: "test@test.com" } },
        error: null,
      });

      // Mock professional verification (success)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({ data: { clinic_id: validClinicId }, error: null }),
                ),
              })),
            })),
          })),
        })),
      });

      const request = new NextRequest(
        `http://localhost:3000/api/revenue-optimization?clinicId=${validClinicId}`,
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Test timeout")), 1000),
      );

      try {
        await Promise.race([GET(request), timeoutPromise]);
      } catch (error) {
        expect(error).toEqual(new Error("Test timeout"));
      }
    });
  });
});
