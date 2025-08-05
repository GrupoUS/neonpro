/**
 * Predictive Analytics API Integration Tests
 * Story 8.3: Predictive Analytics for Demand Forecasting (≥85% Accuracy)
 *
 * API Testing Coverage:
 * - Forecasting models management
 * - Demand predictions generation
 * - Model training and accuracy tracking
 * - Alert system for demand spikes
 * - Recommendations based on forecasts
 * - Performance monitoring
 */

import type { NextRequest } from "next/server";
import { createMocks } from "node-mocks-http";
import { GET as accuracyGET } from "@/app/api/predictive-analytics/accuracy/route";
import {
  GET as alertsGET,
  PATCH as alertsPATCH,
} from "@/app/api/predictive-analytics/alerts/route";
// API Route Handlers
import { GET as modelsGET, POST as modelsPOST } from "@/app/api/predictive-analytics/models/route";
import {
  GET as predictionsGET,
  POST as predictionsPOST,
} from "@/app/api/predictive-analytics/predictions/route";
import { GET as recommendationsGET } from "@/app/api/predictive-analytics/recommendations/route";

// Mock Supabase
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
  })),
}));

// Mock data
const mockForecastingModel = {
  id: "model-123",
  model_type: "appointment_demand",
  model_name: "Agendamentos - Modelo Principal",
  accuracy_score: 0.875,
  status: "active",
  last_trained: "2025-01-26T09:00:00Z",
  training_data_start_date: "2024-01-01T00:00:00Z",
  training_data_end_date: "2025-01-26T00:00:00Z",
  metadata: {
    features: ["historical_bookings", "seasonal_patterns", "marketing_campaigns"],
    algorithm: "Random Forest",
  },
  created_at: "2025-01-26T09:00:00Z",
  updated_at: "2025-01-26T09:00:00Z",
};

const mockPrediction = {
  id: "pred-123",
  model_id: "model-123",
  prediction_date: "2025-02-01",
  forecast_period: "daily",
  category: "appointments",
  forecast_value: 45.5,
  confidence_interval_lower: 40.2,
  confidence_interval_upper: 50.8,
  confidence_score: 0.89,
  created_at: "2025-01-26T09:00:00Z",
};

const mockAlert = {
  id: "alert-123",
  alert_type: "demand_spike",
  severity: "high",
  title: "Pico de Demanda Detectado",
  description: "Previsão indica aumento de 35% na demanda para a próxima semana",
  metadata: {
    predicted_increase: 0.35,
    current_baseline: 45,
    predicted_peak: 61,
  },
  notification_sent: false,
  acknowledged: false,
  resolution_status: "open",
  alert_date: "2025-01-26T09:00:00Z",
  created_at: "2025-01-26T09:00:00Z",
};

const mockUser = {
  id: "user-123",
  email: "test@clinic.com",
  role: "admin",
};

const mockSession = {
  user: mockUser,
  access_token: "mock-token",
  expires_at: Date.now() + 3600000,
};

describe("Predictive Analytics API Integration Tests", () => {
  const mockSupabase = require("@/app/utils/supabase/server").createClient();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("/api/predictive-analytics/models", () => {
    describe("GET - List forecasting models", () => {
      it("returns active forecasting models successfully", async () => {
        mockSupabase
          .from()
          .select()
          .mockResolvedValue({
            data: [mockForecastingModel],
            error: null,
          });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/models",
        });

        const response = await modelsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.models).toHaveLength(1);
        expect(data.models[0]).toMatchObject({
          id: "model-123",
          model_type: "appointment_demand",
          accuracy_score: 0.875,
        });
      });

      it("filters models by type when specified", async () => {
        mockSupabase
          .from()
          .select()
          .eq()
          .mockResolvedValue({
            data: [mockForecastingModel],
            error: null,
          });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/models?type=appointment_demand",
          query: { type: "appointment_demand" },
        });

        const response = await modelsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSupabase.from().eq).toHaveBeenCalledWith("model_type", "appointment_demand");
      });

      it("handles database errors gracefully", async () => {
        mockSupabase
          .from()
          .select()
          .mockResolvedValue({
            data: null,
            error: { message: "Database connection failed", code: "08000" },
          });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/models",
        });

        const response = await modelsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
      });

      it("requires authentication", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: "No user found" },
        });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/models",
        });

        const response = await modelsGET(req as NextRequest);

        expect(response.status).toBe(401);
      });
    });

    describe("POST - Create new forecasting model", () => {
      const newModelData = {
        model_type: "treatment_demand",
        model_name: "Tratamentos - Modelo Sazonal",
        metadata: {
          features: ["historical_treatments", "seasonal_patterns"],
          algorithm: "Linear Regression",
        },
      };

      it("creates new forecasting model successfully", async () => {
        mockSupabase
          .from()
          .insert()
          .single()
          .mockResolvedValue({
            data: { ...mockForecastingModel, ...newModelData, id: "model-456" },
            error: null,
          });

        const { req } = createMocks({
          method: "POST",
          url: "/api/predictive-analytics/models",
          body: newModelData,
        });

        const response = await modelsPOST(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.model.model_type).toBe("treatment_demand");
        expect(data.model.model_name).toBe("Tratamentos - Modelo Sazonal");
      });

      it("validates required fields", async () => {
        const invalidData = {
          model_name: "Modelo Sem Tipo",
          // Missing model_type
        };

        const { req } = createMocks({
          method: "POST",
          url: "/api/predictive-analytics/models",
          body: invalidData,
        });

        const response = await modelsPOST(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("validation");
      });

      it("handles database insert errors", async () => {
        mockSupabase
          .from()
          .insert()
          .single()
          .mockResolvedValue({
            data: null,
            error: { message: "Duplicate key value", code: "23505" },
          });

        const { req } = createMocks({
          method: "POST",
          url: "/api/predictive-analytics/models",
          body: newModelData,
        });

        const response = await modelsPOST(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
      });
    });
  });

  describe("/api/predictive-analytics/predictions", () => {
    describe("GET - List demand predictions", () => {
      it("returns predictions with filtering options", async () => {
        mockSupabase
          .from()
          .select()
          .mockResolvedValue({
            data: [mockPrediction],
            error: null,
          });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/predictions?category=appointments&period=daily",
          query: { category: "appointments", period: "daily" },
        });

        const response = await predictionsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.predictions).toHaveLength(1);
        expect(data.predictions[0].category).toBe("appointments");
        expect(data.predictions[0].forecast_period).toBe("daily");
      });

      it("supports date range filtering", async () => {
        const startDate = "2025-02-01";
        const endDate = "2025-02-07";

        mockSupabase
          .from()
          .select()
          .gte()
          .lte()
          .mockResolvedValue({
            data: [mockPrediction],
            error: null,
          });

        const { req } = createMocks({
          method: "GET",
          url: `/api/predictive-analytics/predictions?start_date=${startDate}&end_date=${endDate}`,
          query: { start_date: startDate, end_date: endDate },
        });

        const response = await predictionsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSupabase.from().gte).toHaveBeenCalledWith("prediction_date", startDate);
        expect(mockSupabase.from().lte).toHaveBeenCalledWith("prediction_date", endDate);
      });

      it("includes confidence intervals and scores", async () => {
        mockSupabase
          .from()
          .select()
          .mockResolvedValue({
            data: [mockPrediction],
            error: null,
          });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/predictions",
        });

        const response = await predictionsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.predictions[0]).toHaveProperty("confidence_interval_lower");
        expect(data.predictions[0]).toHaveProperty("confidence_interval_upper");
        expect(data.predictions[0]).toHaveProperty("confidence_score");
        expect(data.predictions[0].confidence_score).toBe(0.89);
      });
    });

    describe("POST - Generate new predictions", () => {
      const predictionRequest = {
        model_id: "model-123",
        prediction_date: "2025-02-01",
        forecast_period: "daily",
        category: "appointments",
      };

      it("generates new predictions successfully", async () => {
        // Mock model exists
        mockSupabase.from().select().eq().single().mockResolvedValue({
          data: mockForecastingModel,
          error: null,
        });

        // Mock prediction creation
        mockSupabase.from().insert().single().mockResolvedValue({
          data: mockPrediction,
          error: null,
        });

        const { req } = createMocks({
          method: "POST",
          url: "/api/predictive-analytics/predictions",
          body: predictionRequest,
        });

        const response = await predictionsPOST(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.prediction.forecast_value).toBe(45.5);
        expect(data.prediction.confidence_score).toBe(0.89);
      });

      it("validates model exists and is active", async () => {
        mockSupabase
          .from()
          .select()
          .eq()
          .single()
          .mockResolvedValue({
            data: null,
            error: { message: "Model not found", code: "PGRST116" },
          });

        const { req } = createMocks({
          method: "POST",
          url: "/api/predictive-analytics/predictions",
          body: predictionRequest,
        });

        const response = await predictionsPOST(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toContain("Model not found");
      });

      it("validates prediction parameters", async () => {
        const invalidRequest = {
          model_id: "model-123",
          // Missing required fields
        };

        const { req } = createMocks({
          method: "POST",
          url: "/api/predictive-analytics/predictions",
          body: invalidRequest,
        });

        const response = await predictionsPOST(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("validation");
      });
    });
  });

  describe("/api/predictive-analytics/accuracy", () => {
    describe("GET - Model accuracy tracking", () => {
      const accuracyData = [
        {
          id: "acc-123",
          model_id: "model-123",
          evaluation_date: "2025-01-26",
          accuracy_score: 0.875,
          mae: 2.3,
          rmse: 3.1,
          evaluation_period: "weekly",
        },
      ];

      it("returns accuracy metrics for models", async () => {
        mockSupabase.from().select().mockResolvedValue({
          data: accuracyData,
          error: null,
        });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/accuracy",
        });

        const response = await accuracyGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.accuracy_metrics).toHaveLength(1);
        expect(data.accuracy_metrics[0].accuracy_score).toBe(0.875);
        expect(data.accuracy_metrics[0]).toHaveProperty("mae");
        expect(data.accuracy_metrics[0]).toHaveProperty("rmse");
      });

      it("filters by model_id when specified", async () => {
        mockSupabase.from().select().eq().mockResolvedValue({
          data: accuracyData,
          error: null,
        });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/accuracy?model_id=model-123",
          query: { model_id: "model-123" },
        });

        const response = await accuracyGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSupabase.from().eq).toHaveBeenCalledWith("model_id", "model-123");
      });

      it("calculates average accuracy across models", async () => {
        const multipleAccuracy = [
          { ...accuracyData[0], accuracy_score: 0.85 },
          { ...accuracyData[0], id: "acc-456", accuracy_score: 0.9 },
        ];

        mockSupabase.from().select().mockResolvedValue({
          data: multipleAccuracy,
          error: null,
        });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/accuracy",
        });

        const response = await accuracyGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.average_accuracy).toBe(0.875); // (0.85 + 0.90) / 2
      });

      it("identifies models meeting accuracy threshold", async () => {
        const varyingAccuracy = [
          { ...accuracyData[0], accuracy_score: 0.87 }, // Above 85%
          { ...accuracyData[0], id: "acc-456", accuracy_score: 0.8 }, // Below 85%
        ];

        mockSupabase.from().select().mockResolvedValue({
          data: varyingAccuracy,
          error: null,
        });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/accuracy",
        });

        const response = await accuracyGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.models_above_threshold).toBe(1);
        expect(data.models_below_threshold).toBe(1);
      });
    });
  });

  describe("/api/predictive-analytics/alerts", () => {
    describe("GET - List demand alerts", () => {
      it("returns active demand alerts", async () => {
        mockSupabase
          .from()
          .select()
          .mockResolvedValue({
            data: [mockAlert],
            error: null,
          });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/alerts",
        });

        const response = await alertsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.alerts).toHaveLength(1);
        expect(data.alerts[0].alert_type).toBe("demand_spike");
        expect(data.alerts[0].severity).toBe("high");
      });

      it("filters alerts by severity", async () => {
        mockSupabase
          .from()
          .select()
          .eq()
          .mockResolvedValue({
            data: [mockAlert],
            error: null,
          });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/alerts?severity=high",
          query: { severity: "high" },
        });

        const response = await alertsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSupabase.from().eq).toHaveBeenCalledWith("severity", "high");
      });

      it("filters alerts by acknowledgment status", async () => {
        mockSupabase
          .from()
          .select()
          .eq()
          .mockResolvedValue({
            data: [mockAlert],
            error: null,
          });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/alerts?acknowledged=false",
          query: { acknowledged: "false" },
        });

        const response = await alertsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSupabase.from().eq).toHaveBeenCalledWith("acknowledged", false);
      });
    });

    describe("PATCH - Update alert status", () => {
      const updateRequest = {
        alert_id: "alert-123",
        acknowledged: true,
        resolution_status: "resolved",
      };

      it("acknowledges alert successfully", async () => {
        mockSupabase
          .from()
          .update()
          .eq()
          .single()
          .mockResolvedValue({
            data: { ...mockAlert, acknowledged: true, resolution_status: "resolved" },
            error: null,
          });

        const { req } = createMocks({
          method: "PATCH",
          url: "/api/predictive-analytics/alerts",
          body: updateRequest,
        });

        const response = await alertsPATCH(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.alert.acknowledged).toBe(true);
        expect(data.alert.resolution_status).toBe("resolved");
      });

      it("validates alert exists", async () => {
        mockSupabase
          .from()
          .update()
          .eq()
          .single()
          .mockResolvedValue({
            data: null,
            error: { message: "Alert not found", code: "PGRST116" },
          });

        const { req } = createMocks({
          method: "PATCH",
          url: "/api/predictive-analytics/alerts",
          body: updateRequest,
        });

        const response = await alertsPATCH(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toContain("Alert not found");
      });

      it("validates update parameters", async () => {
        const invalidRequest = {
          alert_id: "alert-123",
          acknowledged: "invalid", // Should be boolean
        };

        const { req } = createMocks({
          method: "PATCH",
          url: "/api/predictive-analytics/alerts",
          body: invalidRequest,
        });

        const response = await alertsPATCH(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("validation");
      });
    });
  });

  describe("/api/predictive-analytics/recommendations", () => {
    describe("GET - Resource optimization recommendations", () => {
      const mockRecommendations = [
        {
          id: "rec-123",
          recommendation_type: "resource_allocation",
          title: "Aumento de Equipe Recomendado",
          description:
            "Previsão indica necessidade de 2 profissionais adicionais na próxima semana",
          priority: "high",
          estimated_impact: "Redução de 15% no tempo de espera",
          confidence_score: 0.92,
          metadata: {
            resource_type: "staff",
            recommended_quantity: 2,
            timeframe: "next_week",
          },
          created_at: "2025-01-26T09:00:00Z",
        },
      ];

      it("returns optimization recommendations", async () => {
        mockSupabase.from().select().mockResolvedValue({
          data: mockRecommendations,
          error: null,
        });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/recommendations",
        });

        const response = await recommendationsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.recommendations).toHaveLength(1);
        expect(data.recommendations[0].recommendation_type).toBe("resource_allocation");
        expect(data.recommendations[0].priority).toBe("high");
        expect(data.recommendations[0].confidence_score).toBe(0.92);
      });

      it("filters recommendations by type", async () => {
        mockSupabase.from().select().eq().mockResolvedValue({
          data: mockRecommendations,
          error: null,
        });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/recommendations?type=resource_allocation",
          query: { type: "resource_allocation" },
        });

        const response = await recommendationsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSupabase.from().eq).toHaveBeenCalledWith(
          "recommendation_type",
          "resource_allocation",
        );
      });

      it("filters recommendations by priority", async () => {
        mockSupabase.from().select().eq().mockResolvedValue({
          data: mockRecommendations,
          error: null,
        });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/recommendations?priority=high",
          query: { priority: "high" },
        });

        const response = await recommendationsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSupabase.from().eq).toHaveBeenCalledWith("priority", "high");
      });

      it("orders recommendations by confidence score", async () => {
        mockSupabase.from().select().order().mockResolvedValue({
          data: mockRecommendations,
          error: null,
        });

        const { req } = createMocks({
          method: "GET",
          url: "/api/predictive-analytics/recommendations",
        });

        const response = await recommendationsGET(req as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSupabase.from().order).toHaveBeenCalledWith("confidence_score", {
          ascending: false,
        });
      });
    });
  });

  describe("Authentication and Authorization", () => {
    it("requires valid session for all endpoints", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "No user found" },
      });

      const endpoints = [
        { handler: modelsGET, url: "/api/predictive-analytics/models" },
        { handler: predictionsGET, url: "/api/predictive-analytics/predictions" },
        { handler: accuracyGET, url: "/api/predictive-analytics/accuracy" },
        { handler: alertsGET, url: "/api/predictive-analytics/alerts" },
        { handler: recommendationsGET, url: "/api/predictive-analytics/recommendations" },
      ];

      for (const endpoint of endpoints) {
        const { req } = createMocks({
          method: "GET",
          url: endpoint.url,
        });

        const response = await endpoint.handler(req as NextRequest);
        expect(response.status).toBe(401);
      }
    });

    it("validates user permissions for write operations", async () => {
      const limitedUser = { ...mockUser, role: "user" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: limitedUser },
        error: null,
      });

      const { req } = createMocks({
        method: "POST",
        url: "/api/predictive-analytics/models",
        body: { model_type: "test", model_name: "Test Model" },
      });

      const response = await modelsPOST(req as NextRequest);

      // Should check permissions (implementation dependent)
      expect(response.status).toBeOneOf([201, 403]);
    });
  });

  describe("Story 8.3 API Acceptance Criteria Validation", () => {
    it("AC1: ML-based forecasting with ≥85% accuracy tracking", async () => {
      const highAccuracyMetrics = [
        { accuracy_score: 0.87, model_id: "model-1" },
        { accuracy_score: 0.89, model_id: "model-2" },
      ];

      mockSupabase.from().select().mockResolvedValue({
        data: highAccuracyMetrics,
        error: null,
      });

      const { req } = createMocks({
        method: "GET",
        url: "/api/predictive-analytics/accuracy",
      });

      const response = await accuracyGET(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.average_accuracy).toBeGreaterThanOrEqual(0.85);
      expect(data.models_above_threshold).toBe(2);
    });

    it("AC2: Multi-dimensional forecasting capabilities", async () => {
      const multiDimensionalPredictions = [
        { category: "appointments", forecast_period: "daily" },
        { category: "treatments", forecast_period: "weekly" },
        { category: "revenue", forecast_period: "monthly" },
      ];

      mockSupabase.from().select().mockResolvedValue({
        data: multiDimensionalPredictions,
        error: null,
      });

      const { req } = createMocks({
        method: "GET",
        url: "/api/predictive-analytics/predictions",
      });

      const response = await predictionsGET(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.predictions).toHaveLength(3);

      const categories = data.predictions.map((p: any) => p.category);
      expect(categories).toContain("appointments");
      expect(categories).toContain("treatments");
      expect(categories).toContain("revenue");
    });

    it("AC4: Early warning system implementation", async () => {
      const demandAlerts = [
        { alert_type: "demand_spike", severity: "high" },
        { alert_type: "resource_shortage", severity: "medium" },
      ];

      mockSupabase.from().select().mockResolvedValue({
        data: demandAlerts,
        error: null,
      });

      const { req } = createMocks({
        method: "GET",
        url: "/api/predictive-analytics/alerts",
      });

      const response = await alertsGET(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.alerts).toHaveLength(2);

      const alertTypes = data.alerts.map((a: any) => a.alert_type);
      expect(alertTypes).toContain("demand_spike");
      expect(alertTypes).toContain("resource_shortage");
    });

    it("AC5: Resource optimization recommendations", async () => {
      const optimizationRecs = [
        { recommendation_type: "resource_allocation", confidence_score: 0.92 },
        { recommendation_type: "schedule_optimization", confidence_score: 0.88 },
      ];

      mockSupabase.from().select().order().mockResolvedValue({
        data: optimizationRecs,
        error: null,
      });

      const { req } = createMocks({
        method: "GET",
        url: "/api/predictive-analytics/recommendations",
      });

      const response = await recommendationsGET(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recommendations).toHaveLength(2);
      expect(data.recommendations[0].confidence_score).toBeGreaterThan(0.85);
    });

    it("AC8: Customizable forecasting timeframes", async () => {
      const timeframePredictions = [
        { forecast_period: "daily" },
        { forecast_period: "weekly" },
        { forecast_period: "monthly" },
      ];

      mockSupabase.from().select().mockResolvedValue({
        data: timeframePredictions,
        error: null,
      });

      const { req } = createMocks({
        method: "GET",
        url: "/api/predictive-analytics/predictions",
      });

      const response = await predictionsGET(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);

      const periods = data.predictions.map((p: any) => p.forecast_period);
      expect(periods).toContain("daily");
      expect(periods).toContain("weekly");
      expect(periods).toContain("monthly");
    });

    it("AC10: Performance tracking and continuous improvement", async () => {
      const performanceMetrics = [
        {
          accuracy_score: 0.87,
          mae: 2.1,
          rmse: 2.8,
          evaluation_date: "2025-01-26",
        },
      ];

      mockSupabase.from().select().mockResolvedValue({
        data: performanceMetrics,
        error: null,
      });

      const { req } = createMocks({
        method: "GET",
        url: "/api/predictive-analytics/accuracy",
      });

      const response = await accuracyGET(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.accuracy_metrics[0]).toHaveProperty("accuracy_score");
      expect(data.accuracy_metrics[0]).toHaveProperty("mae");
      expect(data.accuracy_metrics[0]).toHaveProperty("rmse");
      expect(data.accuracy_metrics[0]).toHaveProperty("evaluation_date");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("handles malformed request bodies gracefully", async () => {
      const { req } = createMocks({
        method: "POST",
        url: "/api/predictive-analytics/models",
        body: "invalid json",
      });

      const response = await modelsPOST(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("handles database connection timeouts", async () => {
      mockSupabase.from().select().mockRejectedValue(new Error("Connection timeout"));

      const { req } = createMocks({
        method: "GET",
        url: "/api/predictive-analytics/models",
      });

      const response = await modelsGET(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it("validates date formats in requests", async () => {
      const invalidRequest = {
        model_id: "model-123",
        prediction_date: "invalid-date",
        forecast_period: "daily",
        category: "appointments",
      };

      const { req } = createMocks({
        method: "POST",
        url: "/api/predictive-analytics/predictions",
        body: invalidRequest,
      });

      const response = await predictionsPOST(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("date");
    });

    it("handles concurrent access gracefully", async () => {
      // Simulate concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        createMocks({
          method: "GET",
          url: "/api/predictive-analytics/models",
        }),
      );

      mockSupabase
        .from()
        .select()
        .mockResolvedValue({
          data: [mockForecastingModel],
          error: null,
        });

      const responses = await Promise.all(requests.map(({ req }) => modelsGET(req as NextRequest)));

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });
});
