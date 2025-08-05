// Story 11.2: No-Show Prediction API Tests
// Test suite for main prediction API endpoints

import { GET, POST } from "@/app/api/no-show-prediction/route";
import { createClient } from "@/app/utils/supabase/server";
import { NextRequest } from "next/server";

// Mock Supabase client
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock noShowPredictionEngine
jest.mock("@/app/lib/services/no-show-prediction", () => ({
  noShowPredictionEngine: {
    generatePrediction: jest.fn(),
    getHighRiskPatients: jest.fn(),
    calculateAccuracyMetrics: jest.fn(),
  },
}));

describe("/api/no-show-prediction", () => {
  let mockSupabase: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: "user-123" },
            },
          },
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });
  describe("GET /api/no-show-prediction", () => {
    it("should return predictions list successfully", async () => {
      const mockPredictions = [
        {
          id: "prediction-1",
          appointment_id: "appointment-1",
          patient_id: "patient-1",
          risk_score: 0.85,
          confidence_score: 0.92,
          prediction_date: "2024-02-15T10:00:00Z",
          patient: { name: "João Silva" },
          appointment: { scheduled_at: "2024-02-15T14:00:00Z" },
        },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockPredictions,
        error: null,
      });

      mockRequest = new NextRequest("http://localhost:3000/api/no-show-prediction?page=1&limit=10");

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.predictions).toBeDefined();
      expect(Array.isArray(data.predictions)).toBe(true);
      expect(data.predictions.length).toBe(1);
      expect(data.pagination).toBeDefined();
    });

    it("should handle unauthorized requests", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      mockRequest = new NextRequest("http://localhost:3000/api/no-show-prediction");

      const response = await GET(mockRequest);

      expect(response.status).toBe(401);
    });

    it("should apply filters correctly", async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      mockRequest = new NextRequest(
        "http://localhost:3000/api/no-show-prediction?clinic_id=clinic-123&min_risk=0.8",
      );

      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      expect(mockSupabase.eq).toHaveBeenCalledWith("clinic_id", "clinic-123");
      expect(mockSupabase.gte).toHaveBeenCalledWith("risk_score", 0.8);
    });
  });
  describe("POST /api/no-show-prediction", () => {
    it("should create new prediction successfully", async () => {
      const { noShowPredictionEngine } = require("@/app/lib/services/no-show-prediction");

      const mockPrediction = {
        id: "prediction-123",
        appointment_id: "appointment-123",
        patient_id: "patient-123",
        risk_score: 0.75,
        confidence_score: 0.88,
        prediction_date: "2024-02-15T10:00:00Z",
        model_version: "1.0",
      };

      noShowPredictionEngine.generatePrediction.mockResolvedValueOnce(mockPrediction);

      mockRequest = new NextRequest("http://localhost:3000/api/no-show-prediction", {
        method: "POST",
        body: JSON.stringify({
          appointment_id: "appointment-123",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe("prediction-123");
      expect(data.risk_score).toBe(0.75);
      expect(noShowPredictionEngine.generatePrediction).toHaveBeenCalledWith("appointment-123");
    });

    it("should validate request body", async () => {
      mockRequest = new NextRequest("http://localhost:3000/api/no-show-prediction", {
        method: "POST",
        body: JSON.stringify({
          // Missing appointment_id
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it("should handle prediction generation errors", async () => {
      const { noShowPredictionEngine } = require("@/app/lib/services/no-show-prediction");

      noShowPredictionEngine.generatePrediction.mockRejectedValueOnce(
        new Error("Appointment not found"),
      );

      mockRequest = new NextRequest("http://localhost:3000/api/no-show-prediction", {
        method: "POST",
        body: JSON.stringify({
          appointment_id: "invalid-appointment",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
    });
  });
});
