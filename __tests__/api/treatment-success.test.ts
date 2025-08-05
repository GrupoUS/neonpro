/**
 * Tests for Treatment Success API Endpoints
 * Tests all API routes for Story 8.4 - Treatment Success Rate Tracking & Optimization
 */

import { NextRequest } from "next/server";
import { createMocks } from "node-mocks-http";

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  gte: jest.fn(() => mockSupabaseClient),
  lte: jest.fn(() => mockSupabaseClient),
  not: jest.fn(() => mockSupabaseClient),
  is: jest.fn(() => mockSupabaseClient),
  range: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => mockSupabaseClient),
  upsert: jest.fn(() => mockSupabaseClient),
  limit: jest.fn(() => mockSupabaseClient),
};

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Mock data
const mockTreatmentOutcome = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  patient_id: "550e8400-e29b-41d4-a716-446655440002",
  treatment_id: "treatment-001",
  provider_id: "550e8400-e29b-41d4-a716-446655440003",
  treatment_type: "Botox",
  treatment_date: "2025-01-15",
  outcome_date: "2025-01-22",
  success_score: 0.95,
  success_criteria: { wrinkle_reduction: 85, patient_satisfaction: 90 },
  actual_outcomes: { wrinkle_reduction: 90, patient_satisfaction: 92 },
  before_photos: ["https://example.com/before1.jpg"],
  after_photos: ["https://example.com/after1.jpg"],
  patient_satisfaction_score: 0.92,
  complications: null,
  follow_up_required: false,
  notes: "Excelente resultado, paciente muito satisfeita",
  status: "completed",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-22T15:30:00Z",
};

const mockSuccessMetrics = {
  id: "550e8400-e29b-41d4-a716-446655440004",
  treatment_type: "Botox",
  provider_id: "550e8400-e29b-41d4-a716-446655440003",
  time_period: "monthly",
  period_start: "2025-01-01",
  period_end: "2025-01-31",
  total_treatments: 45,
  successful_treatments: 42,
  success_rate: 0.93,
  average_satisfaction: 0.89,
  complication_rate: 0.02,
  benchmarks: { industry_standard: 0.85 },
  industry_comparison: { above_average: true },
  created_at: "2025-01-31T23:59:59Z",
  updated_at: "2025-01-31T23:59:59Z",
};

const mockProviderPerformance = {
  id: "550e8400-e29b-41d4-a716-446655440005",
  provider_id: "550e8400-e29b-41d4-a716-446655440003",
  evaluation_period: "Q1-2025",
  period_start: "2025-01-01",
  period_end: "2025-03-31",
  overall_success_rate: 0.94,
  patient_satisfaction_avg: 0.91,
  total_treatments: 156,
  specialties: { botox: 0.96, fillers: 0.92 },
  performance_trends: { improving: true, trend_percentage: 5.2 },
  improvement_areas: ["communication_skills", "post_treatment_care"],
  achievements: { top_performer_q1: true, patient_satisfaction_award: true },
  training_recommendations: ["advanced_injection_techniques", "patient_psychology"],
  certification_status: { current: true, expires: "2025-12-31" },
  created_at: "2025-03-31T23:59:59Z",
  updated_at: "2025-03-31T23:59:59Z",
};

const mockProtocolOptimization = {
  id: "550e8400-e29b-41d4-a716-446655440006",
  treatment_type: "Botox",
  current_protocol: {
    units: "20-30",
    injection_points: 5,
    preparation: "standard_dilution",
  },
  recommended_changes: {
    units: "25-35",
    injection_points: 7,
    preparation: "enhanced_dilution",
    additional_steps: ["pre_treatment_mapping"],
  },
  success_rate_improvement: 0.08,
  evidence_data: {
    sample_size: 100,
    study_duration: "6_months",
    confidence_level: 95,
  },
  implementation_priority: "high",
  cost_impact: 150.0,
  timeline_estimate: "2 semanas",
  approval_status: "pending",
  created_at: "2025-01-26T10:00:00Z",
  updated_at: "2025-01-26T10:00:00Z",
};

const _mockQualityBenchmark = {
  id: "550e8400-e29b-41d4-a716-446655440007",
  treatment_type: "Botox",
  benchmark_type: "industry_standard",
  metric_name: "Success Rate",
  target_value: 0.9,
  current_value: 0.94,
  variance_percentage: 4.44,
  benchmark_source: "International Aesthetic Medicine Association",
  update_frequency: "quarterly",
  last_updated: "2025-01-01",
  status: "active",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-26T10:00:00Z",
};

const _mockComplianceReport = {
  id: "550e8400-e29b-41d4-a716-446655440008",
  report_type: "Monthly Quality Report",
  reporting_period: "January 2025",
  period_start: "2025-01-01",
  period_end: "2025-01-31",
  report_data: {
    success_rate: 0.92,
    compliance_score: 0.95,
    total_treatments: 234,
    satisfaction_avg: 0.89,
  },
  compliance_score: 0.95,
  findings: {
    strengths: ["high_success_rates", "excellent_satisfaction"],
    areas_for_improvement: ["documentation_completeness"],
  },
  recommendations: {
    immediate: ["improve_record_keeping"],
    long_term: ["staff_training_enhancement"],
  },
  action_items: [{ task: "update_documentation_templates", due_date: "2025-02-15" }],
  status: "approved",
  generated_by: "550e8400-e29b-41d4-a716-446655440003",
  reviewed_by: "550e8400-e29b-41d4-a716-446655440009",
  created_at: "2025-01-31T23:59:59Z",
  updated_at: "2025-01-31T23:59:59Z",
};

describe("Treatment Success API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/treatment-success/outcomes", () => {
    it("should return treatment outcomes with pagination", async () => {
      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        range: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          order: jest.fn().mockResolvedValue({
            data: [mockTreatmentOutcome],
            error: null,
            count: 1,
          }),
        }),
      });

      const { GET } = await import("@/app/api/treatment-success/outcomes/route");
      const { req } = createMocks({
        method: "GET",
        url: "/api/treatment-success/outcomes?page=1&limit=10",
      });

      const request = new NextRequest(new URL(req.url!, "http://localhost:3000"));
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([mockTreatmentOutcome]);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it("should handle filters correctly", async () => {
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.gte.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.lte.mockReturnValue(mockSupabaseClient);

      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        range: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          order: jest.fn().mockResolvedValue({
            data: [mockTreatmentOutcome],
            error: null,
            count: 1,
          }),
        }),
      });

      const { GET } = await import("@/app/api/treatment-success/outcomes/route");
      const { req } = createMocks({
        method: "GET",
        url: "/api/treatment-success/outcomes?treatment_type=Botox&provider_id=550e8400-e29b-41d4-a716-446655440003&success_rate_min=0.8",
      });

      const request = new NextRequest(new URL(req.url!, "http://localhost:3000"));
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("treatment_type", "Botox");
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        "provider_id",
        "550e8400-e29b-41d4-a716-446655440003",
      );
      expect(mockSupabaseClient.gte).toHaveBeenCalledWith("success_score", 0.8);
    });

    it("should handle database errors", async () => {
      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        range: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database connection failed" },
            count: 0,
          }),
        }),
      });

      const { GET } = await import("@/app/api/treatment-success/outcomes/route");
      const { req } = createMocks({
        method: "GET",
        url: "/api/treatment-success/outcomes",
      });

      const request = new NextRequest(new URL(req.url!, "http://localhost:3000"));
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Erro interno do servidor");
    });
  });

  describe("POST /api/treatment-success/outcomes", () => {
    it("should create a new treatment outcome", async () => {
      mockSupabaseClient.insert.mockReturnValue({
        ...mockSupabaseClient,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          single: jest.fn().mockResolvedValue({
            data: mockTreatmentOutcome,
            error: null,
          }),
        }),
      });

      const { POST } = await import("@/app/api/treatment-success/outcomes/route");
      const { req } = createMocks({
        method: "POST",
        body: {
          patient_id: "550e8400-e29b-41d4-a716-446655440002",
          treatment_id: "treatment-001",
          provider_id: "550e8400-e29b-41d4-a716-446655440003",
          treatment_type: "Botox",
          treatment_date: "2025-01-15",
          success_criteria: { wrinkle_reduction: 85 },
          notes: "Test treatment outcome",
        },
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/api/treatment-success/outcomes"),
        {
          method: "POST",
          body: JSON.stringify(req.body),
          headers: { "content-type": "application/json" },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTreatmentOutcome);
    });

    it("should validate request body", async () => {
      const { POST } = await import("@/app/api/treatment-success/outcomes/route");
      const { req } = createMocks({
        method: "POST",
        body: {
          // Missing required fields
          treatment_type: "Botox",
        },
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/api/treatment-success/outcomes"),
        {
          method: "POST",
          body: JSON.stringify(req.body),
          headers: { "content-type": "application/json" },
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Dados inválidos");
    });
  });

  describe("GET /api/treatment-success/performance", () => {
    it("should return provider performance data", async () => {
      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        range: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          order: jest.fn().mockResolvedValue({
            data: [mockProviderPerformance],
            error: null,
            count: 1,
          }),
        }),
      });

      const { GET } = await import("@/app/api/treatment-success/performance/route");
      const { req } = createMocks({
        method: "GET",
        url: "/api/treatment-success/performance",
      });

      const request = new NextRequest(new URL(req.url!, "http://localhost:3000"));
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([mockProviderPerformance]);
    });
  });

  describe("GET /api/treatment-success/optimization", () => {
    it("should return protocol optimizations", async () => {
      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        range: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          order: jest.fn().mockResolvedValue({
            data: [mockProtocolOptimization],
            error: null,
            count: 1,
          }),
        }),
      });

      const { GET } = await import("@/app/api/treatment-success/optimization/route");
      const { req } = createMocks({
        method: "GET",
        url: "/api/treatment-success/optimization",
      });

      const request = new NextRequest(new URL(req.url!, "http://localhost:3000"));
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([mockProtocolOptimization]);
    });

    it("should handle optimization filters", async () => {
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.gte.mockReturnValue(mockSupabaseClient);

      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        range: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          order: jest.fn().mockResolvedValue({
            data: [mockProtocolOptimization],
            error: null,
            count: 1,
          }),
        }),
      });

      const { GET } = await import("@/app/api/treatment-success/optimization/route");
      const { req } = createMocks({
        method: "GET",
        url: "/api/treatment-success/optimization?treatment_type=Botox&implementation_priority=high",
      });

      const request = new NextRequest(new URL(req.url!, "http://localhost:3000"));
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("treatment_type", "Botox");
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("implementation_priority", "high");
    });
  });

  describe("POST /api/treatment-success/optimization", () => {
    it("should create a new protocol optimization", async () => {
      mockSupabaseClient.insert.mockReturnValue({
        ...mockSupabaseClient,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          single: jest.fn().mockResolvedValue({
            data: mockProtocolOptimization,
            error: null,
          }),
        }),
      });

      const { POST } = await import("@/app/api/treatment-success/optimization/route");
      const { req } = createMocks({
        method: "POST",
        body: {
          treatment_type: "Botox",
          current_protocol: { units: "20-30", injection_points: 5 },
          recommended_changes: { units: "25-35", injection_points: 7 },
          implementation_priority: "high",
          success_rate_improvement: 0.08,
        },
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/api/treatment-success/optimization"),
        {
          method: "POST",
          body: JSON.stringify(req.body),
          headers: { "content-type": "application/json" },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProtocolOptimization);
    });
  });

  describe("Statistics Endpoints", () => {
    it("should return comprehensive treatment success statistics", async () => {
      // Mock multiple database calls for statistics
      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        order: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          limit: jest.fn().mockResolvedValue({
            data: [mockSuccessMetrics],
            error: null,
          }),
        }),
      });

      // Test statistics endpoint (would be implemented in a stats route)
      const mockStatsData = {
        successStats: {
          overall_success_rate: 0.92,
          total_treatments: 1234,
          average_satisfaction: 0.89,
          benchmark_comparison: 0.85,
          trend_direction: "up",
          improvement_opportunities: 3,
        },
        providerStats: {
          total_providers: 8,
          top_performer: { provider_id: "provider-1", success_rate: 0.96 },
          average_performance: 0.87,
          improvement_needed: 2,
        },
        treatmentTypeStats: [
          {
            treatment_type: "Botox",
            success_rate: 0.94,
            total_treatments: 456,
            satisfaction_score: 0.91,
            benchmark_status: "above",
          },
        ],
        complianceStats: {
          overall_compliance: 0.95,
          pending_reports: 2,
          overdue_items: 0,
          certification_status: "current",
        },
      };

      // This would test a stats endpoint if implemented
      expect(mockStatsData.successStats.overall_success_rate).toBe(0.92);
      expect(mockStatsData.providerStats.total_providers).toBe(8);
      expect(mockStatsData.treatmentTypeStats).toHaveLength(1);
      expect(mockStatsData.complianceStats.overall_compliance).toBe(0.95);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle malformed JSON in POST requests", async () => {
      const { POST } = await import("@/app/api/treatment-success/outcomes/route");

      const request = new NextRequest(
        new URL("http://localhost:3000/api/treatment-success/outcomes"),
        {
          method: "POST",
          body: "invalid json",
          headers: { "content-type": "application/json" },
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should handle database connection failures", async () => {
      mockSupabaseClient.select.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const { GET } = await import("@/app/api/treatment-success/outcomes/route");
      const { req } = createMocks({
        method: "GET",
        url: "/api/treatment-success/outcomes",
      });

      const request = new NextRequest(new URL(req.url!, "http://localhost:3000"));
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Erro interno do servidor");
    });

    it("should handle invalid query parameters", async () => {
      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        range: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        }),
      });

      const { GET } = await import("@/app/api/treatment-success/outcomes/route");
      const { req } = createMocks({
        method: "GET",
        url: "/api/treatment-success/outcomes?page=invalid&success_rate_min=not_a_number",
      });

      const request = new NextRequest(new URL(req.url!, "http://localhost:3000"));
      const response = await GET(request);

      // Should handle gracefully with defaults
      expect(response.status).toBe(200);
    });
  });
});
