// Story 11.2: No-Show Prediction Engine Tests
// Comprehensive test suite for no-show prediction service

import { noShowPredictionEngine } from "@/app/lib/services/no-show-prediction";
import { createClient } from "@/app/utils/supabase/server";

// Mock Supabase client
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock data
const mockPatient = {
  id: "patient-123",
  name: "João Silva",
  email: "joao@example.com",
  phone: "+5511999999999",
  date_of_birth: "1985-05-15",
  created_at: "2024-01-01T00:00:00Z",
};

const mockAppointment = {
  id: "appointment-123",
  patient_id: "patient-123",
  clinic_id: "clinic-123",
  scheduled_at: "2024-02-15T14:00:00Z",
  status: "scheduled",
  service_type: "consultation",
  estimated_duration: 60,
  created_at: "2024-02-01T00:00:00Z",
};

const mockHistoricalData = [
  {
    patient_id: "patient-123",
    scheduled_at: "2024-01-15T14:00:00Z",
    status: "no_show",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    patient_id: "patient-123",
    scheduled_at: "2024-01-20T10:00:00Z",
    status: "completed",
    created_at: "2024-01-05T00:00:00Z",
  },
];

describe("NoShowPredictionEngine", () => {
  let mockSupabase: any;
  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("generatePrediction", () => {
    it("should generate prediction for valid appointment", async () => {
      // Mock database responses
      mockSupabase.single.mockResolvedValueOnce({
        data: mockAppointment,
        error: null,
      });

      mockSupabase.select.mockResolvedValueOnce({
        data: mockHistoricalData,
        error: null,
      });

      mockSupabase.insert.mockResolvedValueOnce({
        data: {
          id: "prediction-123",
          appointment_id: "appointment-123",
          patient_id: "patient-123",
          risk_score: 0.65,
          confidence_score: 0.85,
          prediction_date: expect.any(String),
          model_version: "1.0",
        },
        error: null,
      });

      const result = await noShowPredictionEngine.generatePrediction("appointment-123");

      expect(result).toBeDefined();
      expect(result.risk_score).toBeGreaterThan(0);
      expect(result.risk_score).toBeLessThanOrEqual(1);
      expect(result.confidence_score).toBeGreaterThan(0);
      expect(result.confidence_score).toBeLessThanOrEqual(1);
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it("should handle missing appointment", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Appointment not found" },
      });

      await expect(
        noShowPredictionEngine.generatePrediction("invalid-appointment"),
      ).rejects.toThrow("Appointment not found");
    });
  });
  describe("analyzeRiskFactors", () => {
    it("should analyze patient risk factors correctly", async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: mockHistoricalData,
        error: null,
      });

      const riskFactors = await noShowPredictionEngine.analyzeRiskFactors(
        "patient-123",
        mockAppointment,
      );

      expect(riskFactors).toBeDefined();
      expect(Array.isArray(riskFactors)).toBe(true);
      expect(riskFactors.length).toBeGreaterThan(0);

      // Verify risk factor structure
      riskFactors.forEach((factor) => {
        expect(factor).toHaveProperty("factor_type");
        expect(factor).toHaveProperty("factor_value");
        expect(factor).toHaveProperty("impact_weight");
        expect(factor.impact_weight).toBeGreaterThanOrEqual(0);
        expect(factor.impact_weight).toBeLessThanOrEqual(1);
      });
    });

    it("should handle patient with no history", async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const riskFactors = await noShowPredictionEngine.analyzeRiskFactors(
        "new-patient",
        mockAppointment,
      );

      expect(riskFactors).toBeDefined();
      expect(Array.isArray(riskFactors)).toBe(true);
    });
  });

  describe("updatePredictionOutcome", () => {
    it("should update prediction with actual outcome", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "prediction-123" },
        error: null,
      });

      mockSupabase.update.mockResolvedValueOnce({
        data: { id: "prediction-123", actual_outcome: true },
        error: null,
      });

      const result = await noShowPredictionEngine.updatePredictionOutcome("prediction-123", true);

      expect(result).toBeDefined();
      expect(mockSupabase.update).toHaveBeenCalled();
    });
  });

  describe("calculateAccuracyMetrics", () => {
    it("should calculate accuracy metrics correctly", async () => {
      const mockPredictions = [
        { risk_score: 0.8, actual_outcome: true }, // True positive
        { risk_score: 0.3, actual_outcome: false }, // True negative
        { risk_score: 0.7, actual_outcome: false }, // False positive
        { risk_score: 0.2, actual_outcome: true }, // False negative
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockPredictions,
        error: null,
      });

      const metrics = await noShowPredictionEngine.calculateAccuracyMetrics(
        "clinic-123",
        "2024-01-01",
        "2024-01-31",
      );

      expect(metrics).toBeDefined();
      expect(metrics.accuracy).toBe(0.5); // 2 correct out of 4
      expect(metrics.precision).toBeGreaterThanOrEqual(0);
      expect(metrics.recall).toBeGreaterThanOrEqual(0);
      expect(metrics.f1_score).toBeGreaterThanOrEqual(0);
    });
  });
  describe("getHighRiskPatients", () => {
    it("should return high-risk patients for given date range", async () => {
      const mockHighRiskPredictions = [
        {
          id: "prediction-1",
          patient_id: "patient-1",
          risk_score: 0.85,
          appointment: { scheduled_at: "2024-02-15T14:00:00Z" },
          patient: { name: "João Silva", email: "joao@example.com" },
        },
        {
          id: "prediction-2",
          patient_id: "patient-2",
          risk_score: 0.92,
          appointment: { scheduled_at: "2024-02-16T10:00:00Z" },
          patient: { name: "Maria Santos", email: "maria@example.com" },
        },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockHighRiskPredictions,
        error: null,
      });

      const result = await noShowPredictionEngine.getHighRiskPatients(
        "clinic-123",
        "2024-02-15",
        "2024-02-16",
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].risk_score).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("generateInterventionRecommendations", () => {
    it("should recommend appropriate interventions based on risk score", async () => {
      const highRiskPrediction = {
        id: "prediction-123",
        risk_score: 0.9,
        patient_id: "patient-123",
        appointment_id: "appointment-123",
      };

      const recommendations =
        await noShowPredictionEngine.generateInterventionRecommendations(highRiskPrediction);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // High risk should recommend multiple interventions
      expect(recommendations).toContain("phone_call");
      expect(recommendations).toContain("sms_reminder");
    });

    it("should recommend fewer interventions for medium risk", async () => {
      const mediumRiskPrediction = {
        id: "prediction-124",
        risk_score: 0.6,
        patient_id: "patient-124",
        appointment_id: "appointment-124",
      };

      const recommendations =
        await noShowPredictionEngine.generateInterventionRecommendations(mediumRiskPrediction);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThan(3);
    });
  });
});
