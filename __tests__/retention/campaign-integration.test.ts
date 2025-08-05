// RETENTION CAMPAIGN INTEGRATION TESTS
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// Comprehensive test suite for retention campaign integration
// =====================================================================================

import { createMocks } from "node-mocks-http";
import {
  GET as getById,
  PUT as updateById,
} from "@/app/api/retention-analytics/campaigns/[id]/route";
import { GET, POST } from "@/app/api/retention-analytics/campaigns/route";

// =====================================================================================
// MOCKS
// =====================================================================================

// Mock Supabase client
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: mockCampaigns,
            error: null,
          })),
          single: jest.fn(() => ({
            data: mockCampaigns[0],
            error: null,
          })),
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              data: mockCampaigns,
              error: null,
            })),
          })),
          in: jest.fn(() => ({
            data: mockCampaigns.slice(0, 2),
            error: null,
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            data: [mockCampaigns[0]],
            error: null,
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              data: [{ ...mockCampaigns[0], name: "Updated Campaign" }],
              error: null,
            })),
          })),
        })),
      })),
    })),
  })),
}));

// Mock campaign data
const mockCampaigns = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    clinic_id: "22222222-2222-2222-2222-222222222222",
    name: "High-Risk Patient Re-engagement",
    target_segments: ["high_churn_risk"],
    intervention_strategy: {
      type: "personalized_communication",
      channels: ["email", "sms"],
      content_template_id: "retention_001",
      timing: { days_since_last_visit: 30 },
      frequency_cap: { max_per_month: 2 },
    },
    measurement_criteria: {
      success_metrics: ["retention_rate", "booking_conversion"],
      target_improvement: 15,
      measurement_window_days: 90,
      abtest_enabled: true,
      abtest_split_percentage: 50,
    },
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    campaign_metrics: [
      {
        sent: 1000,
        delivered: 950,
        opened: 380,
        clicked: 76,
        conversions: 45,
        revenue: 22500,
        costs: 1200,
      },
    ],
    executions: [
      {
        id: "33333333-3333-3333-3333-333333333333",
        patients_targeted: 250,
        status: "executed",
        executed_at: "2024-01-16T09:00:00Z",
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        patients_targeted: 300,
        status: "executed",
        executed_at: "2024-01-17T09:00:00Z",
      },
    ],
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    clinic_id: "22222222-2222-2222-2222-222222222222",
    name: "First-Time Patient Follow-up",
    target_segments: ["new_patients"],
    intervention_strategy: {
      type: "educational_series",
      channels: ["email"],
      content_template_id: "education_001",
      timing: { days_after_first_visit: 7 },
      frequency_cap: { max_per_month: 4 },
    },
    measurement_criteria: {
      success_metrics: ["retention_rate", "satisfaction_score"],
      target_improvement: 20,
      measurement_window_days: 60,
      abtest_enabled: false,
    },
    status: "draft",
    created_at: "2024-01-20T10:00:00Z",
    campaign_metrics: [
      {
        sent: 500,
        delivered: 485,
        opened: 242,
        clicked: 48,
        conversions: 30,
        revenue: 15000,
        costs: 800,
      },
    ],
    executions: [],
  },
];

// =====================================================================================
// CAMPAIGN CRUD TESTS
// =====================================================================================

describe("/api/retention-analytics/campaigns", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET - List campaigns", () => {
    it("should return campaigns for a clinic", async () => {
      const { req, res } = createMocks({
        method: "GET",
        url: "/api/retention-analytics/campaigns?clinic_id=22222222-2222-2222-2222-222222222222",
      });

      await GET(req);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.campaigns).toHaveLength(2);
      expect(responseData.data.campaigns[0].name).toBe("High-Risk Patient Re-engagement");
    });

    it("should filter campaigns by status", async () => {
      const { req, res } = createMocks({
        method: "GET",
        url: "/api/retention-analytics/campaigns?clinic_id=22222222-2222-2222-2222-222222222222&status=active",
      });

      await GET(req);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.campaigns.every((c) => c.status === "active")).toBe(true);
    });

    it("should return 400 for invalid clinic_id", async () => {
      const { req, res } = createMocks({
        method: "GET",
        url: "/api/retention-analytics/campaigns?clinic_id=invalid-uuid",
      });

      await GET(req);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe("Invalid query parameters");
    });
  });

  describe("POST - Create campaign", () => {
    it("should create a new retention campaign", async () => {
      const campaignData = {
        clinic_id: "22222222-2222-2222-2222-222222222222",
        name: "New Retention Campaign",
        target_segments: ["moderate_churn_risk"],
        intervention_strategy: {
          type: "incentive_offer",
          channels: ["email"],
          content_template_id: "incentive_001",
          timing: { days_since_last_visit: 45 },
        },
        measurement_criteria: {
          success_metrics: ["retention_rate"],
          target_improvement: 10,
          measurement_window_days: 60,
        },
      };

      const { req, res } = createMocks({
        method: "POST",
        body: campaignData,
      });

      await POST(req);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.campaign.name).toBe("New Retention Campaign");
      expect(responseData.data.campaign.status).toBe("draft");
    });

    it("should validate required fields", async () => {
      const invalidData = {
        name: "Incomplete Campaign",
        // Missing required fields
      };

      const { req, res } = createMocks({
        method: "POST",
        body: invalidData,
      });

      await POST(req);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe("Invalid campaign data");
    });
  });
});

// =====================================================================================
// CAMPAIGN EXECUTION TESTS
// =====================================================================================

describe("/api/retention-analytics/campaigns/[id]", () => {
  describe("PUT - Execute campaign", () => {
    it("should execute a retention campaign", async () => {
      const executionData = {
        execution_type: "immediate",
        target_criteria: {
          patient_segments: ["high_churn_risk"],
          max_patients: 100,
        },
        test_mode: false,
      };

      const { req, res } = createMocks({
        method: "PUT",
        body: executionData,
      });

      await updateById(req, { params: { id: "11111111-1111-1111-1111-111111111111" } });

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.execution).toBeDefined();
    });

    it("should handle test mode execution", async () => {
      const testExecutionData = {
        execution_type: "test",
        target_criteria: {
          patient_segments: ["high_churn_risk"],
          max_patients: 10,
        },
        test_mode: true,
      };

      const { req, res } = createMocks({
        method: "PUT",
        body: testExecutionData,
      });

      await updateById(req, { params: { id: "11111111-1111-1111-1111-111111111111" } });

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.execution.test_mode).toBe(true);
      expect(responseData.data.execution.patients_targeted).toBeLessThanOrEqual(10);
    });
  });

  describe("GET - Get campaign by ID", () => {
    it("should return campaign details with metrics", async () => {
      const { req, res } = createMocks({
        method: "GET",
      });

      await getById(req, { params: { id: "11111111-1111-1111-1111-111111111111" } });

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.campaign.id).toBe("11111111-1111-1111-1111-111111111111");
      expect(responseData.data.campaign.name).toBe("High-Risk Patient Re-engagement");
    });

    it("should return 404 for non-existent campaign", async () => {
      // Mock error response for non-existent campaign
      const mockSupabase = require("@/app/utils/supabase/server").createClient();
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockReturnValueOnce({
          data: null,
          error: { message: "Not found" },
        });

      const { req, res } = createMocks({
        method: "GET",
      });

      await getById(req, { params: { id: "99999999-9999-9999-9999-999999999999" } });

      expect(res._getStatusCode()).toBe(404);
    });
  });
});
