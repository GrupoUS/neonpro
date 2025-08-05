/**
 * Tests for Treatment Success Service, Types, and Validations
 * Tests backend logic for Story 8.4 - Treatment Success Rate Tracking & Optimization
 */

import { TreatmentSuccessService } from "@/app/lib/services/treatment-success";
import {
  createTreatmentOutcomeSchema,
  updateTreatmentOutcomeSchema,
  createSuccessMetricsSchema,
  createProviderPerformanceSchema,
  createProtocolOptimizationSchema,
  createQualityBenchmarkSchema,
  createSuccessPredictionSchema,
  createComplianceReportSchema,
  treatmentSuccessQuerySchema,
} from "@/app/lib/validations/treatment-success";
import {
  TreatmentOutcome,
  SuccessMetrics,
  ProviderPerformance,
  ProtocolOptimization,
  QualityBenchmark,
  SuccessPrediction,
  ComplianceReport,
} from "@/app/types/treatment-success";

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

// Mock data for testing
const mockTreatmentOutcome: TreatmentOutcome = {
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

const mockSuccessMetrics: SuccessMetrics = {
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

describe("Treatment Success Validation Schemas", () => {
  describe("createTreatmentOutcomeSchema", () => {
    it("should validate correct treatment outcome data", () => {
      const validData = {
        patient_id: "550e8400-e29b-41d4-a716-446655440002",
        treatment_id: "treatment-001",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        treatment_type: "Botox",
        treatment_date: "2025-01-15",
        success_criteria: { wrinkle_reduction: 85 },
        notes: "Test treatment outcome",
      };

      const result = createTreatmentOutcomeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID for patient_id", () => {
      const invalidData = {
        patient_id: "invalid-uuid",
        treatment_id: "treatment-001",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        treatment_type: "Botox",
        treatment_date: "2025-01-15",
        success_criteria: { wrinkle_reduction: 85 },
      };

      const result = createTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("UUID válido");
      }
    });

    it("should reject empty success_criteria", () => {
      const invalidData = {
        patient_id: "550e8400-e29b-41d4-a716-446655440002",
        treatment_id: "treatment-001",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        treatment_type: "Botox",
        treatment_date: "2025-01-15",
        success_criteria: {},
      };

      const result = createTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Critérios de sucesso são obrigatórios");
      }
    });

    it("should reject invalid date format", () => {
      const invalidData = {
        patient_id: "550e8400-e29b-41d4-a716-446655440002",
        treatment_id: "treatment-001",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        treatment_type: "Botox",
        treatment_date: "invalid-date",
        success_criteria: { wrinkle_reduction: 85 },
      };

      const result = createTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Data de tratamento inválida");
      }
    });
  });

  describe("updateTreatmentOutcomeSchema", () => {
    it("should validate success score range", () => {
      const validData = { success_score: 0.95 };
      const result = updateTreatmentOutcomeSchema.safeParse(validData);
      expect(result.success).toBe(true);

      const invalidData = { success_score: 1.5 };
      const result2 = updateTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result2.success).toBe(false);
    });

    it("should validate patient satisfaction score range", () => {
      const validData = { patient_satisfaction_score: 0.89 };
      const result = updateTreatmentOutcomeSchema.safeParse(validData);
      expect(result.success).toBe(true);

      const invalidData = { patient_satisfaction_score: -0.1 };
      const result2 = updateTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result2.success).toBe(false);
    });

    it("should validate photo URLs", () => {
      const validData = {
        before_photos: ["https://example.com/before.jpg"],
        after_photos: ["https://example.com/after.jpg"],
      };
      const result = updateTreatmentOutcomeSchema.safeParse(validData);
      expect(result.success).toBe(true);

      const invalidData = { before_photos: ["not-a-url"] };
      const result2 = updateTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result2.success).toBe(false);
    });
  });

  describe("createSuccessMetricsSchema", () => {
    it("should validate success metrics data", () => {
      const validData = {
        treatment_type: "Botox",
        time_period: "monthly",
        period_start: "2025-01-01",
        period_end: "2025-01-31",
        total_treatments: 45,
        successful_treatments: 42,
        success_rate: 0.93,
      };

      const result = createSuccessMetricsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when successful_treatments > total_treatments", () => {
      const invalidData = {
        treatment_type: "Botox",
        time_period: "monthly",
        period_start: "2025-01-01",
        period_end: "2025-01-31",
        total_treatments: 40,
        successful_treatments: 45, // More than total
        success_rate: 0.93,
      };

      const result = createSuccessMetricsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("não pode ser maior que o total");
      }
    });

    it("should validate time period enum", () => {
      const invalidData = {
        treatment_type: "Botox",
        time_period: "invalid_period",
        period_start: "2025-01-01",
        period_end: "2025-01-31",
        total_treatments: 45,
        successful_treatments: 42,
        success_rate: 0.93,
      };

      const result = createSuccessMetricsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createProtocolOptimizationSchema", () => {
    it("should validate protocol optimization data", () => {
      const validData = {
        treatment_type: "Botox",
        current_protocol: { units: "20-30", injection_points: 5 },
        recommended_changes: { units: "25-35", injection_points: 7 },
        implementation_priority: "high",
        success_rate_improvement: 0.08,
      };

      const result = createProtocolOptimizationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty protocols", () => {
      const invalidData = {
        treatment_type: "Botox",
        current_protocol: {},
        recommended_changes: { units: "25-35" },
        implementation_priority: "high",
      };

      const result = createProtocolOptimizationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Protocolo atual é obrigatório");
      }
    });

    it("should validate implementation priority enum", () => {
      const invalidData = {
        treatment_type: "Botox",
        current_protocol: { units: "20-30" },
        recommended_changes: { units: "25-35" },
        implementation_priority: "invalid_priority",
      };

      const result = createProtocolOptimizationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createQualityBenchmarkSchema", () => {
    it("should validate quality benchmark data", () => {
      const validData = {
        treatment_type: "Botox",
        benchmark_type: "industry_standard",
        metric_name: "Success Rate",
        target_value: 0.9,
      };

      const result = createQualityBenchmarkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject negative target values", () => {
      const invalidData = {
        treatment_type: "Botox",
        benchmark_type: "industry_standard",
        metric_name: "Success Rate",
        target_value: -0.1,
      };

      const result = createQualityBenchmarkSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("treatmentSuccessQuerySchema", () => {
    it("should parse and validate query parameters", () => {
      const queryParams = {
        page: "2",
        limit: "20",
        treatment_type: "Botox",
        success_rate_min: "0.8",
        date_from: "2025-01-01",
      };

      const result = treatmentSuccessQuerySchema.safeParse(queryParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
        expect(result.data.success_rate_min).toBe(0.8);
      }
    });

    it("should use default values for missing parameters", () => {
      const queryParams = {};

      const result = treatmentSuccessQuerySchema.safeParse(queryParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });
  });
});

describe("TreatmentSuccessService", () => {
  let service: TreatmentSuccessService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TreatmentSuccessService();
  });

  describe("getTreatmentOutcomes", () => {
    it("should fetch treatment outcomes with filters", async () => {
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

      const filters = {
        treatment_type: "Botox",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        success_rate_min: 0.8,
      };

      const result = await service.getTreatmentOutcomes(filters, 1, 10);

      expect(result).toEqual({
        data: [mockTreatmentOutcome],
        total: 1,
        page: 1,
        limit: 10,
      });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("treatment_type", "Botox");
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        "provider_id",
        "550e8400-e29b-41d4-a716-446655440003",
      );
      expect(mockSupabaseClient.gte).toHaveBeenCalledWith("success_score", 0.8);
    });

    it("should handle date range filters", async () => {
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

      const filters = {
        date_from: "2025-01-01",
        date_to: "2025-01-31",
      };

      await service.getTreatmentOutcomes(filters);

      expect(mockSupabaseClient.gte).toHaveBeenCalledWith("treatment_date", "2025-01-01");
      expect(mockSupabaseClient.lte).toHaveBeenCalledWith("treatment_date", "2025-01-31");
    });

    it("should handle complications filter", async () => {
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

      await service.getTreatmentOutcomes({ has_complications: true });
      expect(mockSupabaseClient.not).toHaveBeenCalledWith("complications", "is", null);

      await service.getTreatmentOutcomes({ has_complications: false });
      expect(mockSupabaseClient.is).toHaveBeenCalledWith("complications", null);
    });

    it("should handle database errors", async () => {
      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        range: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
            count: 0,
          }),
        }),
      });

      await expect(service.getTreatmentOutcomes()).rejects.toThrow(
        "Erro ao buscar resultados de tratamento",
      );
    });
  });

  describe("createTreatmentOutcome", () => {
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

      const outcomeData = {
        patient_id: "550e8400-e29b-41d4-a716-446655440002",
        treatment_id: "treatment-001",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        treatment_type: "Botox",
        treatment_date: "2025-01-15",
        success_criteria: { wrinkle_reduction: 85 },
        notes: "Test outcome",
      };

      const result = await service.createTreatmentOutcome(outcomeData);

      expect(result).toEqual(mockTreatmentOutcome);
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(outcomeData);
    });
  });

  describe("generateSuccessMetrics", () => {
    it("should calculate and generate success metrics", async () => {
      const mockOutcomes = [
        { success_score: 0.9, patient_satisfaction_score: 0.85, complications: null },
        { success_score: 0.8, patient_satisfaction_score: 0.9, complications: null },
        { success_score: 0.7, patient_satisfaction_score: 0.8, complications: { minor: true } },
      ];

      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          gte: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            lte: jest.fn().mockResolvedValue({
              data: mockOutcomes,
              error: null,
            }),
          }),
        }),
      });

      mockSupabaseClient.upsert.mockReturnValue({
        ...mockSupabaseClient,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          single: jest.fn().mockResolvedValue({
            data: mockSuccessMetrics,
            error: null,
          }),
        }),
      });

      const result = await service.generateSuccessMetrics("Botox", undefined, "monthly");

      expect(result).toEqual(mockSuccessMetrics);
      expect(mockSupabaseClient.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          treatment_type: "Botox",
          time_period: "monthly",
          total_treatments: 3,
          successful_treatments: 2, // success_score >= 0.8
        }),
      );
    });
  });

  describe("createSuccessPrediction", () => {
    it("should create success prediction with calculated rate", async () => {
      const mockHistoricalData = [
        { success_score: 0.9 },
        { success_score: 0.8 },
        { success_score: 0.85 },
      ];

      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          not: jest.fn().mockResolvedValue({
            data: mockHistoricalData,
            error: null,
          }),
        }),
      });

      mockSupabaseClient.insert.mockReturnValue({
        ...mockSupabaseClient,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          single: jest.fn().mockResolvedValue({
            data: {
              id: "prediction-1",
              patient_id: "patient-1",
              treatment_type: "Botox",
              predicted_success_rate: 0.85, // Average of historical data
              prediction_factors: { age: 35, skin_type: "normal" },
              created_at: "2025-01-26T10:00:00Z",
              updated_at: "2025-01-26T10:00:00Z",
            },
            error: null,
          }),
        }),
      });

      const predictionData = {
        patient_id: "patient-1",
        treatment_type: "Botox",
        prediction_factors: { age: 35, skin_type: "normal" },
      };

      const result = await service.createSuccessPrediction(predictionData);

      expect(result.predicted_success_rate).toBe(0.85);
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          ...predictionData,
          predicted_success_rate: 0.85,
        }),
      );
    });

    it("should use default success rate when no historical data", async () => {
      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          not: jest.fn().mockResolvedValue({
            data: [], // No historical data
            error: null,
          }),
        }),
      });

      mockSupabaseClient.insert.mockReturnValue({
        ...mockSupabaseClient,
        select: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          single: jest.fn().mockResolvedValue({
            data: {
              id: "prediction-1",
              patient_id: "patient-1",
              treatment_type: "NewTreatment",
              predicted_success_rate: 0.5, // Default when no data
              prediction_factors: { age: 35 },
              created_at: "2025-01-26T10:00:00Z",
              updated_at: "2025-01-26T10:00:00Z",
            },
            error: null,
          }),
        }),
      });

      const predictionData = {
        patient_id: "patient-1",
        treatment_type: "NewTreatment",
        prediction_factors: { age: 35 },
      };

      const result = await service.createSuccessPrediction(predictionData);

      expect(result.predicted_success_rate).toBe(0.5);
    });
  });

  describe("Dashboard Statistics", () => {
    it("should calculate success rate statistics", async () => {
      const mockMetricsData = [
        { success_rate: 0.9, total_treatments: 100, average_satisfaction: 0.85 },
        { success_rate: 0.8, total_treatments: 50, average_satisfaction: 0.9 },
      ];

      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        order: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          limit: jest.fn().mockResolvedValue({
            data: mockMetricsData,
            error: null,
          }),
        }),
      });

      const result = await service.getSuccessRateStats();

      expect(result.total_treatments).toBe(150);
      expect(result.overall_success_rate).toBeCloseTo(0.87, 2); // Weighted average
      expect(result.average_satisfaction).toBeCloseTo(0.875, 3);
    });

    it("should calculate provider statistics", async () => {
      const mockPerformanceData = [
        { provider_id: "provider-1", overall_success_rate: 0.95 },
        { provider_id: "provider-2", overall_success_rate: 0.85 },
        { provider_id: "provider-3", overall_success_rate: 0.75 }, // Below 0.8 threshold
      ];

      mockSupabaseClient.select.mockReturnValue({
        ...mockSupabaseClient,
        not: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          order: jest.fn().mockResolvedValue({
            data: mockPerformanceData,
            error: null,
          }),
        }),
      });

      const result = await service.getProviderStats();

      expect(result.total_providers).toBe(3);
      expect(result.top_performer.provider_id).toBe("provider-1");
      expect(result.top_performer.success_rate).toBe(0.95);
      expect(result.improvement_needed).toBe(1); // Providers with rate < 0.8
    });
  });
});
