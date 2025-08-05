// =====================================================================================
// MARKETING CAMPAIGNS API TESTS - Story 7.2
// Integration tests for marketing campaigns API endpoints
// =====================================================================================

import { NextRequest } from "next/server";
import { createMocks } from "node-mocks-http";
import { DELETE, GET, POST, PUT } from "@/app/api/campaigns/route";

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        data: null,
        error: null,
      })),
      data: [],
      error: null,
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  })),
  auth: {
    getUser: jest.fn(() => ({
      data: { user: { id: "test-user-id" } },
      error: null,
    })),
  },
};

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe("/api/campaigns API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/campaigns", () => {
    it("should fetch all campaigns successfully", async () => {
      const mockCampaigns = [
        {
          id: "1",
          name: "Welcome Series",
          type: "email",
          status: "active",
          automation_rate: 0.92,
          created_at: "2025-01-28T10:00:00Z",
        },
        {
          id: "2",
          name: "Follow-up Campaign",
          type: "multi_channel",
          status: "active",
          automation_rate: 0.87,
          created_at: "2025-01-25T14:30:00Z",
        },
      ];

      mockSupabaseClient.from().select().data = mockCampaigns;

      const { req } = createMocks({
        method: "GET",
        url: "/api/campaigns",
      });

      const request = new NextRequest(req.url!, {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.campaigns).toEqual(mockCampaigns);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("marketing_campaigns");
    });

    it("should handle database errors gracefully", async () => {
      mockSupabaseClient.from().select().error = new Error("Database connection failed");

      const { req } = createMocks({
        method: "GET",
        url: "/api/campaigns",
      });

      const request = new NextRequest(req.url!, {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch campaigns");
    });

    it("should require authentication", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const { req } = createMocks({
        method: "GET",
        url: "/api/campaigns",
      });

      const request = new NextRequest(req.url!, {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("POST /api/campaigns", () => {
    const validCampaignData = {
      name: "New Test Campaign",
      description: "Test campaign description",
      type: "email",
      target_segment: "new_patients",
      automation_triggers: ["new_patient", "appointment_booking"],
      personalization_enabled: true,
      ai_optimization: true,
      ab_testing_enabled: false,
      lgpd_compliance: true,
      schedule_type: "trigger_based",
    };

    it("should create a new campaign successfully", async () => {
      const mockCreatedCampaign = {
        id: "new-campaign-id",
        ...validCampaignData,
        created_at: "2025-01-28T10:00:00Z",
        status: "draft",
      };

      mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
        data: mockCreatedCampaign,
        error: null,
      });

      const { req } = createMocks({
        method: "POST",
        url: "/api/campaigns",
        body: validCampaignData,
      });

      const request = new NextRequest(req.url!, {
        method: "POST",
        body: JSON.stringify(validCampaignData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.campaign).toEqual(mockCreatedCampaign);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("marketing_campaigns");
    });

    it("should validate required fields", async () => {
      const invalidData = {
        description: "Missing name field",
      };

      const { req } = createMocks({
        method: "POST",
        url: "/api/campaigns",
        body: invalidData,
      });

      const request = new NextRequest(req.url!, {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });

    it("should validate automation rate threshold", async () => {
      const lowAutomationData = {
        ...validCampaignData,
        personalization_enabled: false,
        ai_optimization: false,
        automation_triggers: [],
        schedule_type: "immediate",
      };

      const { req } = createMocks({
        method: "POST",
        url: "/api/campaigns",
        body: lowAutomationData,
      });

      const request = new NextRequest(req.url!, {
        method: "POST",
        body: JSON.stringify(lowAutomationData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("automation rate");
    });

    it("should enforce LGPD compliance", async () => {
      const nonCompliantData = {
        ...validCampaignData,
        lgpd_compliance: false,
      };

      const { req } = createMocks({
        method: "POST",
        url: "/api/campaigns",
        body: nonCompliantData,
      });

      const request = new NextRequest(req.url!, {
        method: "POST",
        body: JSON.stringify(nonCompliantData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("LGPD compliance");
    });
  });

  describe("PUT /api/campaigns", () => {
    const updateData = {
      id: "existing-campaign-id",
      name: "Updated Campaign Name",
      status: "paused",
    };

    it("should update campaign successfully", async () => {
      const mockUpdatedCampaign = {
        ...updateData,
        updated_at: "2025-01-28T10:00:00Z",
      };

      mockSupabaseClient.from().update().eq().select().single.mockResolvedValueOnce({
        data: mockUpdatedCampaign,
        error: null,
      });

      const { req } = createMocks({
        method: "PUT",
        url: "/api/campaigns",
        body: updateData,
      });

      const request = new NextRequest(req.url!, {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.campaign).toEqual(mockUpdatedCampaign);
    });

    it("should require campaign ID for updates", async () => {
      const invalidUpdateData = {
        name: "Updated Name",
        // Missing ID
      };

      const { req } = createMocks({
        method: "PUT",
        url: "/api/campaigns",
        body: invalidUpdateData,
      });

      const request = new NextRequest(req.url!, {
        method: "PUT",
        body: JSON.stringify(invalidUpdateData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Campaign ID");
    });
  });

  describe("DELETE /api/campaigns", () => {
    it("should delete campaign successfully", async () => {
      mockSupabaseClient.from().delete().eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const { req } = createMocks({
        method: "DELETE",
        url: "/api/campaigns?id=campaign-to-delete",
      });

      const request = new NextRequest(req.url!, {
        method: "DELETE",
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Campaign deleted successfully");
    });

    it("should require campaign ID for deletion", async () => {
      const { req } = createMocks({
        method: "DELETE",
        url: "/api/campaigns",
        // Missing ID parameter
      });

      const request = new NextRequest(req.url!, {
        method: "DELETE",
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Campaign ID");
    });

    it("should handle non-existent campaign deletion", async () => {
      mockSupabaseClient
        .from()
        .delete()
        .eq.mockResolvedValueOnce({
          data: null,
          error: new Error("Campaign not found"),
        });

      const { req } = createMocks({
        method: "DELETE",
        url: "/api/campaigns?id=non-existent-id",
      });

      const request = new NextRequest(req.url!, {
        method: "DELETE",
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  describe("Campaign Automation Features", () => {
    it("should calculate automation rate correctly", async () => {
      const campaignWithHighAutomation = {
        name: "High Automation Campaign",
        type: "email",
        target_segment: "all_patients",
        automation_triggers: ["new_patient", "appointment_booking", "treatment_completion"],
        personalization_enabled: true,
        ai_optimization: true,
        ab_testing_enabled: true,
        lgpd_compliance: true,
        schedule_type: "trigger_based",
      };

      mockSupabaseClient
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { ...campaignWithHighAutomation, automation_rate: 0.95 },
          error: null,
        });

      const { req } = createMocks({
        method: "POST",
        url: "/api/campaigns",
        body: campaignWithHighAutomation,
      });

      const request = new NextRequest(req.url!, {
        method: "POST",
        body: JSON.stringify(campaignWithHighAutomation),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.campaign.automation_rate).toBeGreaterThanOrEqual(0.8);
    });

    it("should support multi-channel campaigns", async () => {
      const multiChannelCampaign = {
        name: "Multi-Channel Campaign",
        type: "multi_channel",
        target_segment: "active_patients",
        automation_triggers: ["treatment_reminder"],
        personalization_enabled: true,
        ai_optimization: true,
        lgpd_compliance: true,
        schedule_type: "trigger_based",
        channels: ["email", "whatsapp", "sms"],
      };

      mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
        data: multiChannelCampaign,
        error: null,
      });

      const { req } = createMocks({
        method: "POST",
        url: "/api/campaigns",
        body: multiChannelCampaign,
      });

      const request = new NextRequest(req.url!, {
        method: "POST",
        body: JSON.stringify(multiChannelCampaign),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("marketing_campaigns");
    });
  });

  describe("A/B Testing Integration", () => {
    it("should handle A/B testing enabled campaigns", async () => {
      const abTestCampaign = {
        name: "A/B Test Campaign",
        type: "email",
        target_segment: "new_patients",
        automation_triggers: ["new_patient"],
        personalization_enabled: true,
        ai_optimization: true,
        ab_testing_enabled: true,
        ab_test_variants: [
          { name: "Variant A", subject_line: "Welcome to NeonPro" },
          { name: "Variant B", subject_line: "Your Beauty Journey Starts Here" },
        ],
        lgpd_compliance: true,
        schedule_type: "trigger_based",
      };

      mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
        data: abTestCampaign,
        error: null,
      });

      const { req } = createMocks({
        method: "POST",
        url: "/api/campaigns",
        body: abTestCampaign,
      });

      const request = new NextRequest(req.url!, {
        method: "POST",
        body: JSON.stringify(abTestCampaign),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe("Analytics and Metrics", () => {
    it("should track campaign performance metrics", async () => {
      const campaignWithMetrics = {
        id: "campaign-with-metrics",
        name: "Test Campaign",
        metrics: {
          sent: 1000,
          delivered: 950,
          opened: 665,
          clicked: 133,
          converted: 40,
          revenue: 2400,
          cost: 300,
        },
      };

      mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
        data: campaignWithMetrics,
        error: null,
      });

      const { req } = createMocks({
        method: "GET",
        url: "/api/campaigns?id=campaign-with-metrics",
      });

      const request = new NextRequest(req.url!, {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.campaign.metrics).toBeDefined();
      expect(data.campaign.metrics.sent).toBe(1000);
    });
  });

  describe("Story 7.2 Acceptance Criteria Validation", () => {
    it("should enforce ≥80% automation rate requirement", async () => {
      const lowAutomationCampaign = {
        name: "Low Automation Campaign",
        type: "email",
        target_segment: "all_patients",
        automation_triggers: [],
        personalization_enabled: false,
        ai_optimization: false,
        ab_testing_enabled: false,
        lgpd_compliance: true,
        schedule_type: "immediate",
      };

      const { req } = createMocks({
        method: "POST",
        url: "/api/campaigns",
        body: lowAutomationCampaign,
      });

      const request = new NextRequest(req.url!, {
        method: "POST",
        body: JSON.stringify(lowAutomationCampaign),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("80%");
    });

    it("should require LGPD compliance for all campaigns", async () => {
      const nonCompliantCampaign = {
        name: "Non-Compliant Campaign",
        type: "email",
        target_segment: "all_patients",
        automation_triggers: ["new_patient"],
        personalization_enabled: true,
        ai_optimization: true,
        ab_testing_enabled: false,
        lgpd_compliance: false,
        schedule_type: "trigger_based",
      };

      const { req } = createMocks({
        method: "POST",
        url: "/api/campaigns",
        body: nonCompliantCampaign,
      });

      const request = new NextRequest(req.url!, {
        method: "POST",
        body: JSON.stringify(nonCompliantCampaign),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(data.error).toContain("LGPD");
    });
  });
});
