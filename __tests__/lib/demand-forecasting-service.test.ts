/**
 * Demand Forecasting Service Tests - Story 11.1
 *
 * Comprehensive test suite for demand forecasting service
 * Tests accuracy requirements (≥80%), multi-factor analysis, and real-time functionality
 */

// Mock createServerSupabaseClient before imports
jest.mock("@/app/utils/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() =>
                Promise.resolve({
                  data: [
                    {
                      id: "1",
                      created_at: "2024-01-15",
                      service_type_id: "service-1",
                      status: "completed",
                      total_amount: 150,
                      service_types: {
                        name: "Facial Treatment",
                        duration: 60,
                        category: "facial",
                      },
                    },
                    {
                      id: "2",
                      created_at: "2024-01-16",
                      service_type_id: "service-1",
                      status: "completed",
                      total_amount: 150,
                      service_types: {
                        name: "Facial Treatment",
                        duration: 60,
                        category: "facial",
                      },
                    },
                    {
                      id: "3",
                      created_at: "2024-01-17",
                      service_type_id: "service-2",
                      status: "completed",
                      total_amount: 200,
                      service_types: {
                        name: "Body Treatment",
                        duration: 90,
                        category: "body",
                      },
                    },
                  ],
                  error: null,
                }),
              ),
            })),
          })),
          eq: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({
                data: [
                  {
                    id: "1",
                    created_at: "2024-01-15",
                    service_type_id: "service-1",
                    status: "completed",
                    total_amount: 150,
                    service_types: {
                      name: "Facial Treatment",
                      duration: 60,
                      category: "facial",
                    },
                  },
                ],
                error: null,
              }),
            ),
          })),
        })),
        eq: jest.fn(() => ({
          order: jest.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            }),
          ),
        })),
      })),
    })),
  })),
}));

import {
  DemandForecastingEngine,
  calculateDemandForecast,
  generateResourceAllocation,
  monitorForecastAccuracy,
  detectSeasonalPatterns,
  processExternalFactors,
} from "@/src/lib/analytics/demand-forecasting";
import {
  DemandForecast,
  ForecastType,
  FORECASTING_CONSTANTS,
} from "@/src/app/types/demand-forecasting";

// Mock data for testing
const mockAppointmentData = [
  {
    id: "1",
    user_id: "user-1",
    service_id: "service-1",
    scheduled_at: "2024-01-15T10:00:00Z",
    status: "confirmed",
    created_at: "2024-01-10T09:00:00Z",
  },
  {
    id: "2",
    user_id: "user-2",
    service_id: "service-1",
    scheduled_at: "2024-01-16T14:00:00Z",
    status: "confirmed",
    created_at: "2024-01-11T11:00:00Z",
  },
  {
    id: "3",
    user_id: "user-3",
    service_id: "service-2",
    scheduled_at: "2024-01-17T09:00:00Z",
    status: "confirmed",
    created_at: "2024-01-12T08:00:00Z",
  },
];

const mockHistoricalData = {
  weekly_patterns: [
    { week: 1, demand: 25, actual: 23, accuracy: 0.92 },
    { week: 2, demand: 30, actual: 28, accuracy: 0.93 },
    { week: 3, demand: 35, actual: 37, accuracy: 0.94 },
    { week: 4, demand: 28, actual: 26, accuracy: 0.93 },
  ],
  monthly_trends: [
    { month: "January", growth_rate: 0.15, seasonal_factor: 1.2 },
    { month: "February", growth_rate: 0.08, seasonal_factor: 0.9 },
    { month: "March", growth_rate: 0.12, seasonal_factor: 1.1 },
  ],
};

const mockExternalFactors = {
  economic_indicators: { gdp_growth: 0.025, inflation: 0.035 },
  seasonal_events: [{ name: "Summer Season", impact: 0.15, start_date: "2024-06-01" }],
  market_trends: { aesthetic_demand_index: 1.18, competition_factor: 0.92 },
};

describe("DemandForecastingEngine", () => {
  let engine: DemandForecastingEngine;

  beforeEach(() => {
    engine = new DemandForecastingEngine();
  });

  describe("Initialization and Configuration", () => {
    test("should initialize with default configuration", () => {
      expect(engine).toBeDefined();
      expect(engine.getConfiguration()).toEqual(
        expect.objectContaining({
          minAccuracyThreshold: FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD,
          maxLookAheadDays: FORECASTING_CONSTANTS.MAX_LOOKAHEAD_DAYS,
          confidenceLevel: FORECASTING_CONSTANTS.DEFAULT_CONFIDENCE_LEVEL,
        }),
      );
    });

    test("should allow custom configuration", () => {
      const customConfig = {
        minAccuracyThreshold: 0.85,
        maxLookAheadDays: 60,
        confidenceLevel: 0.99,
      };

      engine.updateConfiguration(customConfig);
      const config = engine.getConfiguration();

      expect(config.minAccuracyThreshold).toBe(0.85);
      expect(config.maxLookAheadDays).toBe(60);
      expect(config.confidenceLevel).toBe(0.99);
    });
  });

  describe("Data Processing and Analysis", () => {
    test("should process appointment data correctly", async () => {
      const result = await engine.processAppointmentData(mockAppointmentData);

      expect(result).toEqual(
        expect.objectContaining({
          totalAppointments: 3,
          serviceDistribution: expect.any(Object),
          timePatterns: expect.any(Object),
          demandMetrics: expect.any(Object),
        }),
      );
    });

    test("should detect seasonal patterns accurately", () => {
      const patterns = detectSeasonalPatterns(mockHistoricalData.weekly_patterns);

      expect(patterns).toEqual(
        expect.objectContaining({
          hasSeasonality: expect.any(Boolean),
          seasonalityStrength: expect.any(Number),
          peakPeriods: expect.any(Array),
          trendDirection: expect.stringMatching(/increasing|decreasing|stable/),
        }),
      );

      // Validate seasonality strength is within valid range
      expect(patterns.seasonalityStrength).toBeGreaterThanOrEqual(0);
      expect(patterns.seasonalityStrength).toBeLessThanOrEqual(1);
    });

    test("should process external factors with proper validation", () => {
      const processed = processExternalFactors(mockExternalFactors);

      expect(processed).toEqual(
        expect.objectContaining({
          economicImpact: expect.any(Number),
          seasonalAdjustment: expect.any(Number),
          marketTrendMultiplier: expect.any(Number),
          confidenceAdjustment: expect.any(Number),
        }),
      );

      // Validate adjustment factors are reasonable
      expect(processed.economicImpact).toBeGreaterThan(-0.5);
      expect(processed.economicImpact).toBeLessThan(0.5);
      expect(processed.seasonalAdjustment).toBeGreaterThan(0.5);
      expect(processed.seasonalAdjustment).toBeLessThan(2.0);
    });
  });

  describe("Forecast Generation", () => {
    test("should generate forecast with required accuracy threshold", async () => {
      const forecastParams = {
        forecastType: "weekly" as ForecastType,
        lookAheadDays: 30,
        serviceId: "service-1",
        includeSeasonality: true,
        includeExternalFactors: true,
        confidenceLevel: 0.95,
      };

      const forecast = await calculateDemandForecast(
        mockAppointmentData,
        mockHistoricalData,
        forecastParams,
        forecastParams.serviceId, // Use serviceId from forecastParams, not mockExternalFactors
      );

      // Validate forecast structure
      expect(forecast).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          forecast_type: forecastParams.forecastType,
          service_id: forecastParams.serviceId,
          period_start: expect.any(String),
          period_end: expect.any(String),
          predicted_demand: expect.any(Number),
          confidence_level: expect.any(Number),
          factors_considered: expect.any(Array),
          created_at: expect.any(String),
        }),
      );

      // Validate accuracy requirements
      expect(forecast.confidence_level).toBeGreaterThanOrEqual(
        FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD,
      );
      expect(forecast.predicted_demand).toBeGreaterThan(0);

      // Validate factors considered include required elements
      expect(forecast.factors_considered).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ factor_type: "weekly_seasonality" }),
          expect.objectContaining({ factor_type: "monthly_seasonality" }),
        ]),
      );

      if (forecastParams.includeExternalFactors) {
        expect(forecast.factors_considered).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ factor_type: "holiday_impact" }),
            expect.objectContaining({ factor_type: "weather_impact" }),
          ]),
        );
      }
    });

    test("should generate multiple forecast types accurately", async () => {
      const forecastTypes: ForecastType[] = ["daily", "weekly", "monthly"];

      for (const forecastType of forecastTypes) {
        const forecastParams = {
          forecastType,
          lookAheadDays: 30,
          includeSeasonality: true,
          includeExternalFactors: false,
          confidenceLevel: 0.9,
        };

        const forecast = await calculateDemandForecast(
          mockAppointmentData,
          mockHistoricalData,
          forecastParams,
        );

        expect(forecast.forecast_type).toBe(forecastType);
        expect(forecast.confidence_level).toBeGreaterThanOrEqual(0.8);
        expect(forecast.predicted_demand).toBeGreaterThan(0);
      }
    });

    test("should handle service-specific forecasting", async () => {
      const serviceIds = ["service-1", "service-2"];

      for (const serviceId of serviceIds) {
        const forecastParams = {
          forecastType: "weekly" as ForecastType,
          lookAheadDays: 14,
          serviceId,
          includeSeasonality: true,
          includeExternalFactors: true,
          confidenceLevel: 0.95,
        };

        const forecast = await calculateDemandForecast(
          mockAppointmentData,
          mockHistoricalData,
          forecastParams,
          serviceId, // Use the actual serviceId from iteration, not hardcoded 'service-1'
        );

        expect(forecast.service_id).toBe(serviceId);
        expect(forecast.confidence_level).toBeGreaterThanOrEqual(
          FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD,
        );
      }
    });
  });

  describe("Resource Allocation", () => {
    test("should generate resource allocation recommendations", async () => {
      const forecast: DemandForecast = {
        id: "forecast-1",
        forecast_type: "weekly",
        service_id: "service-1",
        period_start: "2024-02-01T00:00:00Z",
        period_end: "2024-02-07T23:59:59Z",
        predicted_demand: 45,
        confidence_level: 0.92,
        factors_considered: ["historical_data", "seasonal_patterns"],
        metadata: {
          algorithm_version: "1.0",
          data_quality_score: 0.95,
          computation_time_ms: 250,
        },
        created_at: "2024-01-25T10:00:00Z",
        updated_at: "2024-01-25T10:00:00Z",
      };

      const allocation = await generateResourceAllocation([forecast], "balanced");

      expect(allocation).toEqual(
        expect.objectContaining({
          forecast_id: forecast.id,
          staffing: expect.objectContaining({
            required_staff_count: expect.any(Number),
            skill_requirements: expect.any(Array),
            shift_distribution: expect.any(Object),
          }),
          equipment: expect.objectContaining({
            required_equipment: expect.any(Array),
            utilization_target: expect.any(Number),
          }),
          cost_optimization: expect.objectContaining({
            total_cost_impact: expect.any(Number),
            efficiency_gains: expect.any(Number),
            roi_projection: expect.any(Number),
          }),
          priority_level: expect.stringMatching(/low|medium|high|critical/),
        }),
      );

      // Validate staffing recommendations are reasonable
      expect(allocation.staffing.required_staff_count).toBeGreaterThan(0);
      expect(allocation.staffing.required_staff_count).toBeLessThan(20);

      // Validate cost optimization metrics
      expect(allocation.cost_optimization.efficiency_gains).toBeGreaterThanOrEqual(0);
      expect(allocation.cost_optimization.roi_projection).toBeGreaterThan(0);
    });

    test("should optimize for different strategies", async () => {
      const forecast: DemandForecast = {
        id: "forecast-1",
        forecast_type: "weekly",
        service_id: null,
        period_start: "2024-02-01T00:00:00Z",
        period_end: "2024-02-07T23:59:59Z",
        predicted_demand: 60,
        confidence_level: 0.88,
        factors_considered: ["historical_data"],
        metadata: {
          algorithm_version: "1.0",
          data_quality_score: 0.9,
          computation_time_ms: 180,
        },
        created_at: "2024-01-25T10:00:00Z",
        updated_at: "2024-01-25T10:00:00Z",
      };

      const strategies = ["cost_effective", "balanced", "performance_focused"];

      for (const strategy of strategies) {
        const allocation = await generateResourceAllocation([forecast], strategy);

        expect(allocation.cost_optimization).toBeDefined();
        expect(allocation.priority_level).toBeDefined();

        // Different strategies should produce different cost profiles
        if (strategy === "cost_effective") {
          expect(allocation.cost_optimization.total_cost_impact).toBeLessThan(10000);
        }
      }
    });
  });

  describe("Accuracy Monitoring", () => {
    test("should monitor forecast accuracy against actual demand", async () => {
      const forecasts: DemandForecast[] = [
        {
          id: "forecast-1",
          forecast_type: "weekly",
          service_id: "service-1",
          period_start: "2024-01-01T00:00:00Z",
          period_end: "2024-01-07T23:59:59Z",
          predicted_demand: 25,
          confidence_level: 0.9,
          factors_considered: ["historical_data"],
          metadata: {
            algorithm_version: "1.0",
            data_quality_score: 0.95,
            computation_time_ms: 200,
          },
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      const actualDemand = [
        {
          forecast_id: "forecast-1",
          actual_demand: 23,
          period_start: "2024-01-01T00:00:00Z",
          period_end: "2024-01-07T23:59:59Z",
        },
      ];

      const accuracyReport = await monitorForecastAccuracy(forecasts, actualDemand);

      expect(accuracyReport).toEqual(
        expect.objectContaining({
          overall_accuracy: expect.any(Number),
          individual_accuracies: expect.any(Array),
          performance_metrics: expect.objectContaining({
            mean_absolute_error: expect.any(Number),
            root_mean_square_error: expect.any(Number),
            mean_absolute_percentage_error: expect.any(Number),
          }),
          accuracy_trend: expect.stringMatching(/improving|declining|stable/),
          meets_threshold: expect.any(Boolean),
        }),
      );

      // Validate accuracy calculation
      const expectedAccuracy = 1 - Math.abs(25 - 23) / 25; // 0.92
      expect(accuracyReport.overall_accuracy).toBeCloseTo(expectedAccuracy, 1); // Use 1 decimal precision
      expect(accuracyReport.meets_threshold).toBe(
        expectedAccuracy >= FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD,
      );
    });

    test("should identify accuracy degradation patterns", async () => {
      const degradingForecasts: DemandForecast[] = [
        {
          id: "forecast-1",
          forecast_type: "weekly",
          service_id: null,
          period_start: "2024-01-01T00:00:00Z",
          period_end: "2024-01-07T23:59:59Z",
          predicted_demand: 50,
          confidence_level: 0.95,
          factors_considered: ["historical_data"],
          metadata: {
            algorithm_version: "1.0",
            data_quality_score: 0.95,
            computation_time_ms: 200,
          },
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "forecast-2",
          forecast_type: "weekly",
          service_id: null,
          period_start: "2024-01-08T00:00:00Z",
          period_end: "2024-01-14T23:59:59Z",
          predicted_demand: 45,
          confidence_level: 0.9,
          factors_considered: ["historical_data"],
          metadata: { algorithm_version: "1.0", data_quality_score: 0.9, computation_time_ms: 250 },
          created_at: "2024-01-08T00:00:00Z",
          updated_at: "2024-01-08T00:00:00Z",
        },
      ];

      const actualDemand = [
        {
          forecast_id: "forecast-1",
          actual_demand: 30,
          period_start: "2024-01-01T00:00:00Z",
          period_end: "2024-01-07T23:59:59Z",
        },
        {
          forecast_id: "forecast-2",
          actual_demand: 25,
          period_start: "2024-01-08T00:00:00Z",
          period_end: "2024-01-14T23:59:59Z",
        },
      ];

      const accuracyReport = await monitorForecastAccuracy(degradingForecasts, actualDemand);

      expect(accuracyReport.accuracy_trend).toBe("declining");
      expect(accuracyReport.overall_accuracy).toBeLessThan(
        FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD,
      );
      expect(accuracyReport.meets_threshold).toBe(false);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("should handle empty appointment data gracefully", async () => {
      const forecastParams = {
        forecastType: "weekly" as ForecastType,
        lookAheadDays: 7,
        includeSeasonality: false,
        includeExternalFactors: false,
        confidenceLevel: 0.8,
      };

      await expect(calculateDemandForecast([], {}, forecastParams)).rejects.toThrow(
        "Insufficient data for forecast generation",
      );
    });

    test("should validate forecast parameters", async () => {
      const invalidParams = {
        forecastType: "invalid" as ForecastType,
        lookAheadDays: -5,
        confidenceLevel: 1.5,
      };

      await expect(
        calculateDemandForecast(mockAppointmentData, mockHistoricalData, invalidParams),
      ).rejects.toThrow();
    });

    test("should handle resource allocation with zero demand", async () => {
      const zeroDemandForecast: DemandForecast = {
        id: "forecast-zero",
        forecast_type: "daily",
        service_id: "service-1",
        period_start: "2024-02-01T00:00:00Z",
        period_end: "2024-02-01T23:59:59Z",
        predicted_demand: 0,
        confidence_level: 0.95,
        factors_considered: ["historical_data"],
        metadata: { algorithm_version: "1.0", data_quality_score: 0.95, computation_time_ms: 100 },
        created_at: "2024-01-25T10:00:00Z",
        updated_at: "2024-01-25T10:00:00Z",
      };

      const allocation = await generateResourceAllocation([zeroDemandForecast], "balanced");

      expect(allocation.staffing.required_staff_count).toBe(0);
      expect(allocation.priority_level).toBe("low");
      expect(allocation.cost_optimization.total_cost_impact).toBe(0);
    });
  });

  describe("Performance Requirements", () => {
    test("should generate forecasts within acceptable time limits", async () => {
      const startTime = Date.now();

      const forecastParams = {
        forecastType: "monthly" as ForecastType,
        lookAheadDays: 90,
        includeSeasonality: true,
        includeExternalFactors: true,
        confidenceLevel: 0.95,
      };

      const forecast = await calculateDemandForecast(
        mockAppointmentData,
        mockHistoricalData,
        forecastParams,
        mockExternalFactors,
      );

      const executionTime = Date.now() - startTime;

      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(forecast.metadata?.computation_time_ms).toBeLessThan(3000);
    });

    test("should maintain accuracy across multiple forecast generations", async () => {
      const accuracies: number[] = [];

      for (let i = 0; i < 10; i++) {
        const forecastParams = {
          forecastType: "weekly" as ForecastType,
          lookAheadDays: 14,
          includeSeasonality: true,
          includeExternalFactors: true,
          confidenceLevel: 0.9,
        };

        const forecast = await calculateDemandForecast(
          mockAppointmentData,
          mockHistoricalData,
          forecastParams,
          "service-1", // Pass serviceId as string instead of mockExternalFactors
        );

        accuracies.push(forecast.confidence_level);
      }

      const averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      expect(averageAccuracy).toBeGreaterThanOrEqual(FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD);

      // Ensure consistency - all accuracies should be within 10% of each other
      const maxAccuracy = Math.max(...accuracies);
      const minAccuracy = Math.min(...accuracies);
      expect(maxAccuracy - minAccuracy).toBeLessThan(0.1);
    });
  });
});
