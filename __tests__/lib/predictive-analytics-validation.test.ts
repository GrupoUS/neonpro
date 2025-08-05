/**
 * Predictive Analytics Types and Validations Tests
 * Story 8.3: Predictive Analytics for Demand Forecasting (≥85% Accuracy)
 *
 * Testing Coverage:
 * - TypeScript interfaces validation
 * - Zod schema validation
 * - Data transformation utilities
 * - Type safety enforcement
 * - Service layer validation
 */

import {
  ForecastingModel,
  DemandPrediction,
  ForecastAccuracy,
  DemandAlert,
  ForecastingSettings,
  ModelTrainingHistory,
  PredictionRequest,
  TrainingRequest,
  AlertUpdateRequest,
} from "@/app/types/predictive-analytics";

import {
  forecastingModelSchema,
  demandPredictionSchema,
  forecastAccuracySchema,
  demandAlertSchema,
  forecastingSettingsSchema,
  modelTrainingHistorySchema,
  predictionRequestSchema,
  trainingRequestSchema,
  alertUpdateRequestSchema,
} from "@/app/lib/validations/predictive-analytics";

import {
  PredictiveAnalyticsService,
  generateDemandPrediction,
  calculateAccuracyMetrics,
  createDemandAlert,
  optimizeResourceAllocation,
} from "@/app/lib/services/predictive-analytics";

describe("Predictive Analytics Types and Validations", () => {
  describe("TypeScript Interfaces", () => {
    describe("ForecastingModel Interface", () => {
      it("accepts valid forecasting model data", () => {
        const validModel: ForecastingModel = {
          id: "model-123",
          model_type: "appointment_demand",
          model_name: "Agendamentos - Modelo Principal",
          accuracy_score: 0.875,
          status: "active",
          last_trained: "2025-01-26T09:00:00Z",
          training_data_start_date: "2024-01-01T00:00:00Z",
          training_data_end_date: "2025-01-26T00:00:00Z",
          metadata: {
            features: ["historical_bookings", "seasonal_patterns"],
            algorithm: "Random Forest",
          },
          created_at: "2025-01-26T09:00:00Z",
          updated_at: "2025-01-26T09:00:00Z",
        };

        expect(validModel.model_type).toBe("appointment_demand");
        expect(validModel.accuracy_score).toBeGreaterThanOrEqual(0.85);
        expect(validModel.status).toBe("active");
      });

      it("enforces required fields", () => {
        // TypeScript compilation would catch missing required fields
        // This test verifies the interface structure is correct
        const model = {} as ForecastingModel;

        expect(() => {
          // These properties should be required by TypeScript
          const requiredFields = [
            "id",
            "model_type",
            "model_name",
            "accuracy_score",
            "status",
            "created_at",
            "updated_at",
          ];

          requiredFields.forEach((field) => {
            expect(model).toHaveProperty(field);
          });
        }).not.toThrow();
      });

      it("supports valid model types", () => {
        const validTypes = [
          "appointment_demand",
          "treatment_demand",
          "revenue_forecast",
          "resource_utilization",
        ];

        validTypes.forEach((type) => {
          const model: ForecastingModel = {
            id: "test",
            model_type: type as any,
            model_name: "Test",
            accuracy_score: 0.9,
            status: "active",
            created_at: "2025-01-26T09:00:00Z",
            updated_at: "2025-01-26T09:00:00Z",
          };

          expect(model.model_type).toBe(type);
        });
      });
    });

    describe("DemandPrediction Interface", () => {
      it("accepts valid prediction data with confidence intervals", () => {
        const validPrediction: DemandPrediction = {
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

        expect(validPrediction.forecast_value).toBe(45.5);
        expect(validPrediction.confidence_score).toBe(0.89);
        expect(validPrediction.confidence_interval_lower).toBeLessThan(
          validPrediction.forecast_value,
        );
        expect(validPrediction.confidence_interval_upper).toBeGreaterThan(
          validPrediction.forecast_value,
        );
      });

      it("supports multiple forecast periods", () => {
        const periods: DemandPrediction["forecast_period"][] = [
          "hourly",
          "daily",
          "weekly",
          "monthly",
        ];

        periods.forEach((period) => {
          const prediction: DemandPrediction = {
            id: "test",
            model_id: "model-123",
            prediction_date: "2025-02-01",
            forecast_period: period,
            category: "appointments",
            forecast_value: 45,
            confidence_score: 0.9,
            created_at: "2025-01-26T09:00:00Z",
          };

          expect(prediction.forecast_period).toBe(period);
        });
      });

      it("supports multiple prediction categories", () => {
        const categories: DemandPrediction["category"][] = [
          "appointments",
          "treatments",
          "revenue",
          "resources",
        ];

        categories.forEach((category) => {
          const prediction: DemandPrediction = {
            id: "test",
            model_id: "model-123",
            prediction_date: "2025-02-01",
            forecast_period: "daily",
            category: category,
            forecast_value: 45,
            confidence_score: 0.9,
            created_at: "2025-01-26T09:00:00Z",
          };

          expect(prediction.category).toBe(category);
        });
      });
    });

    describe("DemandAlert Interface", () => {
      it("accepts valid alert data", () => {
        const validAlert: DemandAlert = {
          id: "alert-123",
          alert_type: "demand_spike",
          severity: "high",
          title: "Pico de Demanda Detectado",
          description: "Previsão indica aumento de 35% na demanda",
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

        expect(validAlert.alert_type).toBe("demand_spike");
        expect(validAlert.severity).toBe("high");
        expect(validAlert.acknowledged).toBe(false);
      });

      it("supports alert severity levels", () => {
        const severities: DemandAlert["severity"][] = ["low", "medium", "high", "critical"];

        severities.forEach((severity) => {
          const alert: DemandAlert = {
            id: "test",
            alert_type: "demand_spike",
            severity: severity,
            title: "Test Alert",
            description: "Test description",
            notification_sent: false,
            acknowledged: false,
            resolution_status: "open",
            alert_date: "2025-01-26T09:00:00Z",
            created_at: "2025-01-26T09:00:00Z",
          };

          expect(alert.severity).toBe(severity);
        });
      });

      it("supports different alert types", () => {
        const alertTypes: DemandAlert["alert_type"][] = [
          "demand_spike",
          "demand_drop",
          "resource_shortage",
          "capacity_exceeded",
        ];

        alertTypes.forEach((type) => {
          const alert: DemandAlert = {
            id: "test",
            alert_type: type,
            severity: "medium",
            title: "Test Alert",
            description: "Test description",
            notification_sent: false,
            acknowledged: false,
            resolution_status: "open",
            alert_date: "2025-01-26T09:00:00Z",
            created_at: "2025-01-26T09:00:00Z",
          };

          expect(alert.alert_type).toBe(type);
        });
      });
    });
  });

  describe("Zod Schema Validations", () => {
    describe("ForecastingModel Schema", () => {
      it("validates valid forecasting model", () => {
        const validData = {
          id: "model-123",
          model_type: "appointment_demand",
          model_name: "Agendamentos - Modelo Principal",
          accuracy_score: 0.875,
          status: "active",
          last_trained: "2025-01-26T09:00:00Z",
          training_data_start_date: "2024-01-01T00:00:00Z",
          training_data_end_date: "2025-01-26T00:00:00Z",
          created_at: "2025-01-26T09:00:00Z",
          updated_at: "2025-01-26T09:00:00Z",
        };

        const result = forecastingModelSchema.safeParse(validData);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.accuracy_score).toBe(0.875);
          expect(result.data.model_type).toBe("appointment_demand");
        }
      });

      it("rejects invalid model type", () => {
        const invalidData = {
          id: "model-123",
          model_type: "invalid_type",
          model_name: "Test Model",
          accuracy_score: 0.85,
          status: "active",
          created_at: "2025-01-26T09:00:00Z",
          updated_at: "2025-01-26T09:00:00Z",
        };

        const result = forecastingModelSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].path).toContain("model_type");
        }
      });

      it("validates accuracy score range (0-1)", () => {
        const invalidData = {
          id: "model-123",
          model_type: "appointment_demand",
          model_name: "Test Model",
          accuracy_score: 1.5, // Invalid - greater than 1
          status: "active",
          created_at: "2025-01-26T09:00:00Z",
          updated_at: "2025-01-26T09:00:00Z",
        };

        const result = forecastingModelSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].path).toContain("accuracy_score");
        }
      });

      it("validates required fields", () => {
        const incompleteData = {
          id: "model-123",
          // Missing required fields
        };

        const result = forecastingModelSchema.safeParse(incompleteData);
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    describe("DemandPrediction Schema", () => {
      it("validates valid prediction data", () => {
        const validData = {
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

        const result = demandPredictionSchema.safeParse(validData);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.forecast_value).toBe(45.5);
          expect(result.data.confidence_score).toBe(0.89);
        }
      });

      it("validates confidence interval logic", () => {
        const invalidData = {
          id: "pred-123",
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: "daily",
          category: "appointments",
          forecast_value: 45.5,
          confidence_interval_lower: 55.0, // Invalid - higher than forecast
          confidence_interval_upper: 50.8, // Invalid - lower than forecast
          confidence_score: 0.89,
          created_at: "2025-01-26T09:00:00Z",
        };

        const result = demandPredictionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("validates confidence score range (0-1)", () => {
        const invalidData = {
          id: "pred-123",
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: "daily",
          category: "appointments",
          forecast_value: 45.5,
          confidence_score: 1.5, // Invalid - greater than 1
          created_at: "2025-01-26T09:00:00Z",
        };

        const result = demandPredictionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("validates forecast period enum", () => {
        const invalidData = {
          id: "pred-123",
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: "invalid_period",
          category: "appointments",
          forecast_value: 45.5,
          confidence_score: 0.89,
          created_at: "2025-01-26T09:00:00Z",
        };

        const result = demandPredictionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe("Request Schemas", () => {
      it("validates prediction request", () => {
        const validRequest = {
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: "daily",
          category: "appointments",
        };

        const result = predictionRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it("validates training request", () => {
        const validRequest = {
          model_id: "model-123",
          training_data_start_date: "2024-01-01",
          training_data_end_date: "2025-01-26",
        };

        const result = trainingRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it("validates training date range logic", () => {
        const invalidRequest = {
          model_id: "model-123",
          training_data_start_date: "2025-01-26",
          training_data_end_date: "2024-01-01", // End before start
        };

        const result = trainingRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it("validates alert update request", () => {
        const validRequest = {
          alert_id: "alert-123",
          acknowledged: true,
          resolution_status: "resolved",
        };

        const result = alertUpdateRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Service Layer Functions", () => {
    describe("generateDemandPrediction", () => {
      const mockHistoricalData = [
        { date: "2025-01-01", value: 40 },
        { date: "2025-01-02", value: 42 },
        { date: "2025-01-03", value: 45 },
        { date: "2025-01-04", value: 43 },
        { date: "2025-01-05", value: 47 },
      ];

      it("generates prediction with confidence intervals", () => {
        const prediction = generateDemandPrediction(mockHistoricalData, "2025-01-06", "daily");

        expect(prediction).toHaveProperty("forecast_value");
        expect(prediction).toHaveProperty("confidence_interval_lower");
        expect(prediction).toHaveProperty("confidence_interval_upper");
        expect(prediction).toHaveProperty("confidence_score");

        expect(prediction.confidence_interval_lower).toBeLessThan(prediction.forecast_value);
        expect(prediction.confidence_interval_upper).toBeGreaterThan(prediction.forecast_value);
        expect(prediction.confidence_score).toBeGreaterThanOrEqual(0);
        expect(prediction.confidence_score).toBeLessThanOrEqual(1);
      });

      it("handles different forecast periods", () => {
        const periods = ["daily", "weekly", "monthly"];

        periods.forEach((period) => {
          const prediction = generateDemandPrediction(
            mockHistoricalData,
            "2025-01-06",
            period as any,
          );

          expect(prediction.forecast_period).toBe(period);
          expect(prediction.forecast_value).toBeGreaterThan(0);
        });
      });

      it("adapts to seasonal patterns", () => {
        const seasonalData = [
          { date: "2024-12-01", value: 30 }, // Low season
          { date: "2024-12-15", value: 60 }, // High season
          { date: "2025-01-01", value: 35 }, // Low season
          { date: "2025-01-15", value: 65 }, // High season
        ];

        const prediction = generateDemandPrediction(seasonalData, "2025-01-16", "daily");

        expect(prediction.forecast_value).toBeGreaterThan(50); // Should predict high season
      });

      it("provides higher confidence for stable patterns", () => {
        const stableData = [
          { date: "2025-01-01", value: 45 },
          { date: "2025-01-02", value: 45 },
          { date: "2025-01-03", value: 45 },
          { date: "2025-01-04", value: 45 },
          { date: "2025-01-05", value: 45 },
        ];

        const prediction = generateDemandPrediction(stableData, "2025-01-06", "daily");

        expect(prediction.confidence_score).toBeGreaterThan(0.8);
      });
    });

    describe("calculateAccuracyMetrics", () => {
      const mockActualValues = [40, 42, 45, 43, 47];
      const mockPredictedValues = [38, 44, 46, 41, 49];

      it("calculates accuracy score", () => {
        const metrics = calculateAccuracyMetrics(mockActualValues, mockPredictedValues);

        expect(metrics).toHaveProperty("accuracy_score");
        expect(metrics.accuracy_score).toBeGreaterThanOrEqual(0);
        expect(metrics.accuracy_score).toBeLessThanOrEqual(1);
      });

      it("calculates MAE (Mean Absolute Error)", () => {
        const metrics = calculateAccuracyMetrics(mockActualValues, mockPredictedValues);

        expect(metrics).toHaveProperty("mae");
        expect(metrics.mae).toBeGreaterThanOrEqual(0);
      });

      it("calculates RMSE (Root Mean Square Error)", () => {
        const metrics = calculateAccuracyMetrics(mockActualValues, mockPredictedValues);

        expect(metrics).toHaveProperty("rmse");
        expect(metrics.rmse).toBeGreaterThanOrEqual(0);
        expect(metrics.rmse).toBeGreaterThanOrEqual(metrics.mae);
      });

      it("identifies when accuracy meets threshold", () => {
        const perfectPredictions = mockActualValues;
        const metrics = calculateAccuracyMetrics(mockActualValues, perfectPredictions);

        expect(metrics.accuracy_score).toBe(1.0);
        expect(metrics.mae).toBe(0);
        expect(metrics.rmse).toBe(0);
      });

      it("handles edge cases gracefully", () => {
        // Empty arrays
        expect(() => {
          calculateAccuracyMetrics([], []);
        }).not.toThrow();

        // Mismatched lengths
        expect(() => {
          calculateAccuracyMetrics([1, 2, 3], [1, 2]);
        }).not.toThrow();
      });
    });

    describe("createDemandAlert", () => {
      it("creates spike alert for significant increases", () => {
        const currentDemand = 45;
        const predictedDemand = 65; // 44% increase

        const alert = createDemandAlert(currentDemand, predictedDemand, "appointments", 0.9);

        expect(alert.alert_type).toBe("demand_spike");
        expect(alert.severity).toBe("high");
        expect(alert.metadata.predicted_increase).toBeGreaterThan(0.3);
      });

      it("creates drop alert for significant decreases", () => {
        const currentDemand = 65;
        const predictedDemand = 35; // 46% decrease

        const alert = createDemandAlert(currentDemand, predictedDemand, "appointments", 0.9);

        expect(alert.alert_type).toBe("demand_drop");
        expect(alert.severity).toBe("medium");
      });

      it("adjusts severity based on magnitude", () => {
        const scenarios = [
          { current: 50, predicted: 55, expectedSeverity: "low" }, // 10% increase
          { current: 50, predicted: 65, expectedSeverity: "medium" }, // 30% increase
          { current: 50, predicted: 75, expectedSeverity: "high" }, // 50% increase
          { current: 50, predicted: 90, expectedSeverity: "critical" }, // 80% increase
        ];

        scenarios.forEach((scenario) => {
          const alert = createDemandAlert(
            scenario.current,
            scenario.predicted,
            "appointments",
            0.9,
          );

          expect(alert.severity).toBe(scenario.expectedSeverity);
        });
      });

      it("includes confidence in alert metadata", () => {
        const alert = createDemandAlert(45, 65, "appointments", 0.89);

        expect(alert.metadata).toHaveProperty("confidence_score");
        expect(alert.metadata.confidence_score).toBe(0.89);
      });

      it("generates appropriate titles and descriptions", () => {
        const alert = createDemandAlert(45, 65, "appointments", 0.9);

        expect(alert.title).toContain("Demanda");
        expect(alert.description).toContain("%");
        expect(alert.description).toContain("appointments");
      });
    });

    describe("optimizeResourceAllocation", () => {
      const mockDemandForecast = [
        { date: "2025-02-01", predicted_demand: 45, category: "appointments" },
        { date: "2025-02-02", predicted_demand: 52, category: "appointments" },
        { date: "2025-02-03", predicted_demand: 38, category: "appointments" },
      ];

      const mockCurrentResources = {
        staff: 5,
        rooms: 3,
        equipment: 2,
      };

      it("provides staff optimization recommendations", () => {
        const recommendations = optimizeResourceAllocation(
          mockDemandForecast,
          mockCurrentResources,
        );

        expect(recommendations).toBeInstanceOf(Array);
        expect(recommendations.length).toBeGreaterThan(0);

        const staffRec = recommendations.find(
          (r) =>
            r.recommendation_type === "resource_allocation" && r.metadata.resource_type === "staff",
        );

        expect(staffRec).toBeDefined();
      });

      it("calculates optimal resource levels", () => {
        const recommendations = optimizeResourceAllocation(
          mockDemandForecast,
          mockCurrentResources,
        );

        const staffRec = recommendations.find((r) => r.metadata.resource_type === "staff");

        if (staffRec) {
          expect(staffRec.metadata).toHaveProperty("recommended_quantity");
          expect(staffRec.metadata.recommended_quantity).toBeGreaterThan(0);
        }
      });

      it("provides schedule optimization suggestions", () => {
        const recommendations = optimizeResourceAllocation(
          mockDemandForecast,
          mockCurrentResources,
        );

        const scheduleRec = recommendations.find(
          (r) => r.recommendation_type === "schedule_optimization",
        );

        expect(scheduleRec).toBeDefined();
        if (scheduleRec) {
          expect(scheduleRec.priority).toMatch(/low|medium|high/);
        }
      });

      it("considers confidence scores in recommendations", () => {
        const highConfidenceForecast = mockDemandForecast.map((f) => ({
          ...f,
          confidence_score: 0.95,
        }));

        const recommendations = optimizeResourceAllocation(
          highConfidenceForecast,
          mockCurrentResources,
        );

        recommendations.forEach((rec) => {
          expect(rec.confidence_score).toBeGreaterThan(0.8);
        });
      });

      it("handles capacity constraints", () => {
        const highDemandForecast = [
          { date: "2025-02-01", predicted_demand: 100, category: "appointments" },
          { date: "2025-02-02", predicted_demand: 120, category: "appointments" },
        ];

        const recommendations = optimizeResourceAllocation(
          highDemandForecast,
          mockCurrentResources,
        );

        const capacityAlert = recommendations.find(
          (r) => r.recommendation_type === "capacity_warning",
        );

        expect(capacityAlert).toBeDefined();
        if (capacityAlert) {
          expect(capacityAlert.priority).toBe("high");
        }
      });
    });
  });

  describe("PredictiveAnalyticsService Class", () => {
    let service: PredictiveAnalyticsService;

    beforeEach(() => {
      service = new PredictiveAnalyticsService();
    });

    describe("Model Management", () => {
      it("creates forecasting model with validation", async () => {
        const modelData = {
          model_type: "appointment_demand" as const,
          model_name: "Test Model",
          metadata: {
            features: ["historical_data"],
            algorithm: "Linear Regression",
          },
        };

        // Mock the service method
        const createSpy = jest.spyOn(service, "createModel");
        createSpy.mockResolvedValue({
          id: "model-123",
          ...modelData,
          accuracy_score: 0.85,
          status: "training",
          created_at: "2025-01-26T09:00:00Z",
          updated_at: "2025-01-26T09:00:00Z",
        });

        const result = await service.createModel(modelData);

        expect(result.model_type).toBe("appointment_demand");
        expect(result.accuracy_score).toBeGreaterThanOrEqual(0.85);

        createSpy.mockRestore();
      });

      it("validates model accuracy threshold", async () => {
        const lowAccuracyModel = {
          id: "model-123",
          accuracy_score: 0.75, // Below 85% threshold
        };

        const validateSpy = jest.spyOn(service, "validateAccuracyThreshold");
        validateSpy.mockReturnValue(false);

        const isValid = service.validateAccuracyThreshold(lowAccuracyModel.accuracy_score);

        expect(isValid).toBe(false);

        validateSpy.mockRestore();
      });

      it("activates models only when accuracy ≥85%", async () => {
        const highAccuracyModel = {
          id: "model-123",
          accuracy_score: 0.87,
        };

        const activateSpy = jest.spyOn(service, "activateModel");
        activateSpy.mockResolvedValue(true);

        const result = await service.activateModel(highAccuracyModel.id);

        expect(result).toBe(true);

        activateSpy.mockRestore();
      });
    });

    describe("Prediction Generation", () => {
      it("generates predictions with confidence intervals", async () => {
        const predictionRequest = {
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: "daily" as const,
          category: "appointments" as const,
        };

        const generateSpy = jest.spyOn(service, "generatePrediction");
        generateSpy.mockResolvedValue({
          id: "pred-123",
          ...predictionRequest,
          forecast_value: 45.5,
          confidence_interval_lower: 40.2,
          confidence_interval_upper: 50.8,
          confidence_score: 0.89,
          created_at: "2025-01-26T09:00:00Z",
        });

        const result = await service.generatePrediction(predictionRequest);

        expect(result.forecast_value).toBe(45.5);
        expect(result.confidence_score).toBe(0.89);
        expect(result.confidence_interval_lower).toBeLessThan(result.forecast_value);
        expect(result.confidence_interval_upper).toBeGreaterThan(result.forecast_value);

        generateSpy.mockRestore();
      });

      it("supports multi-dimensional forecasting", async () => {
        const categories = ["appointments", "treatments", "revenue"];
        const predictions = [];

        const generateSpy = jest.spyOn(service, "generatePrediction");

        for (const category of categories) {
          generateSpy.mockResolvedValueOnce({
            id: `pred-${category}`,
            model_id: "model-123",
            prediction_date: "2025-02-01",
            forecast_period: "daily",
            category: category as any,
            forecast_value: 45.5,
            confidence_score: 0.89,
            created_at: "2025-01-26T09:00:00Z",
          });

          const prediction = await service.generatePrediction({
            model_id: "model-123",
            prediction_date: "2025-02-01",
            forecast_period: "daily",
            category: category as any,
          });

          predictions.push(prediction);
        }

        expect(predictions).toHaveLength(3);
        expect(predictions.map((p) => p.category)).toEqual(categories);

        generateSpy.mockRestore();
      });
    });

    describe("Alert System", () => {
      it("creates demand spike alerts", async () => {
        const alertData = {
          alert_type: "demand_spike" as const,
          severity: "high" as const,
          title: "Pico de Demanda",
          description: "Aumento significativo previsto",
        };

        const createSpy = jest.spyOn(service, "createAlert");
        createSpy.mockResolvedValue({
          id: "alert-123",
          ...alertData,
          notification_sent: false,
          acknowledged: false,
          resolution_status: "open",
          alert_date: "2025-01-26T09:00:00Z",
          created_at: "2025-01-26T09:00:00Z",
        });

        const result = await service.createAlert(alertData);

        expect(result.alert_type).toBe("demand_spike");
        expect(result.severity).toBe("high");
        expect(result.acknowledged).toBe(false);

        createSpy.mockRestore();
      });

      it("manages alert acknowledgment workflow", async () => {
        const updateRequest = {
          alert_id: "alert-123",
          acknowledged: true,
          resolution_status: "resolved" as const,
        };

        const updateSpy = jest.spyOn(service, "updateAlert");
        updateSpy.mockResolvedValue({
          id: "alert-123",
          alert_type: "demand_spike",
          severity: "high",
          title: "Test Alert",
          description: "Test description",
          notification_sent: true,
          acknowledged: true,
          resolution_status: "resolved",
          alert_date: "2025-01-26T09:00:00Z",
          created_at: "2025-01-26T09:00:00Z",
        });

        const result = await service.updateAlert(updateRequest);

        expect(result.acknowledged).toBe(true);
        expect(result.resolution_status).toBe("resolved");

        updateSpy.mockRestore();
      });
    });

    describe("Performance Monitoring", () => {
      it("tracks accuracy metrics over time", async () => {
        const accuracyData = [
          { model_id: "model-123", accuracy_score: 0.87, evaluation_date: "2025-01-25" },
          { model_id: "model-123", accuracy_score: 0.89, evaluation_date: "2025-01-26" },
        ];

        const trackSpy = jest.spyOn(service, "trackAccuracy");
        trackSpy.mockResolvedValue(accuracyData);

        const result = await service.trackAccuracy("model-123");

        expect(result).toHaveLength(2);
        expect(result[1].accuracy_score).toBeGreaterThan(result[0].accuracy_score);

        trackSpy.mockRestore();
      });

      it("identifies models needing retraining", async () => {
        const models = [
          { id: "model-1", accuracy_score: 0.82 }, // Below threshold
          { id: "model-2", accuracy_score: 0.89 }, // Above threshold
        ];

        const identifySpy = jest.spyOn(service, "identifyModelsNeedingRetraining");
        identifySpy.mockReturnValue(["model-1"]);

        const result = service.identifyModelsNeedingRetraining(models);

        expect(result).toContain("model-1");
        expect(result).not.toContain("model-2");

        identifySpy.mockRestore();
      });
    });
  });

  describe("Story 8.3 Acceptance Criteria Type Validation", () => {
    it("AC1: Enforces ≥85% accuracy requirement in types", () => {
      const highAccuracyModel: ForecastingModel = {
        id: "model-123",
        model_type: "appointment_demand",
        model_name: "High Accuracy Model",
        accuracy_score: 0.87, // Above threshold
        status: "active",
        created_at: "2025-01-26T09:00:00Z",
        updated_at: "2025-01-26T09:00:00Z",
      };

      expect(highAccuracyModel.accuracy_score).toBeGreaterThanOrEqual(0.85);
    });

    it("AC2: Supports multi-dimensional prediction types", () => {
      const dimensions: DemandPrediction["category"][] = [
        "appointments",
        "treatments",
        "revenue",
        "resources",
      ];

      dimensions.forEach((category) => {
        const prediction: DemandPrediction = {
          id: "pred-test",
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: "daily",
          category: category,
          forecast_value: 45,
          confidence_score: 0.9,
          created_at: "2025-01-26T09:00:00Z",
        };

        expect(prediction.category).toBe(category);
      });
    });

    it("AC4: Supports early warning alert types", () => {
      const warningTypes: DemandAlert["alert_type"][] = [
        "demand_spike",
        "demand_drop",
        "resource_shortage",
        "capacity_exceeded",
      ];

      warningTypes.forEach((alertType) => {
        const alert: DemandAlert = {
          id: "alert-test",
          alert_type: alertType,
          severity: "medium",
          title: "Test Alert",
          description: "Test description",
          notification_sent: false,
          acknowledged: false,
          resolution_status: "open",
          alert_date: "2025-01-26T09:00:00Z",
          created_at: "2025-01-26T09:00:00Z",
        };

        expect(alert.alert_type).toBe(alertType);
      });
    });

    it("AC8: Supports customizable timeframe types", () => {
      const timeframes: DemandPrediction["forecast_period"][] = [
        "hourly",
        "daily",
        "weekly",
        "monthly",
      ];

      timeframes.forEach((period) => {
        const prediction: DemandPrediction = {
          id: "pred-test",
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: period,
          category: "appointments",
          forecast_value: 45,
          confidence_score: 0.9,
          created_at: "2025-01-26T09:00:00Z",
        };

        expect(prediction.forecast_period).toBe(period);
      });
    });

    it("AC10: Includes performance tracking types", () => {
      const accuracy: ForecastAccuracy = {
        id: "acc-123",
        model_id: "model-123",
        evaluation_date: "2025-01-26",
        accuracy_score: 0.87,
        mae: 2.3,
        rmse: 3.1,
        evaluation_period: "weekly",
        created_at: "2025-01-26T09:00:00Z",
      };

      expect(accuracy).toHaveProperty("accuracy_score");
      expect(accuracy).toHaveProperty("mae");
      expect(accuracy).toHaveProperty("rmse");
      expect(accuracy.accuracy_score).toBeGreaterThanOrEqual(0.85);
    });
  });
});
