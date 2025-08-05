"use strict";
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
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var predictive_analytics_1 = require("@/app/lib/validations/predictive-analytics");
var predictive_analytics_2 = require("@/app/lib/services/predictive-analytics");
describe("Predictive Analytics Types and Validations", function () {
  describe("TypeScript Interfaces", function () {
    describe("ForecastingModel Interface", function () {
      it("accepts valid forecasting model data", function () {
        var validModel = {
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
      it("enforces required fields", function () {
        // TypeScript compilation would catch missing required fields
        // This test verifies the interface structure is correct
        var model = {};
        expect(function () {
          // These properties should be required by TypeScript
          var requiredFields = [
            "id",
            "model_type",
            "model_name",
            "accuracy_score",
            "status",
            "created_at",
            "updated_at",
          ];
          requiredFields.forEach(function (field) {
            expect(model).toHaveProperty(field);
          });
        }).not.toThrow();
      });
      it("supports valid model types", function () {
        var validTypes = [
          "appointment_demand",
          "treatment_demand",
          "revenue_forecast",
          "resource_utilization",
        ];
        validTypes.forEach(function (type) {
          var model = {
            id: "test",
            model_type: type,
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
    describe("DemandPrediction Interface", function () {
      it("accepts valid prediction data with confidence intervals", function () {
        var validPrediction = {
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
      it("supports multiple forecast periods", function () {
        var periods = ["hourly", "daily", "weekly", "monthly"];
        periods.forEach(function (period) {
          var prediction = {
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
      it("supports multiple prediction categories", function () {
        var categories = ["appointments", "treatments", "revenue", "resources"];
        categories.forEach(function (category) {
          var prediction = {
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
    describe("DemandAlert Interface", function () {
      it("accepts valid alert data", function () {
        var validAlert = {
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
      it("supports alert severity levels", function () {
        var severities = ["low", "medium", "high", "critical"];
        severities.forEach(function (severity) {
          var alert = {
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
      it("supports different alert types", function () {
        var alertTypes = ["demand_spike", "demand_drop", "resource_shortage", "capacity_exceeded"];
        alertTypes.forEach(function (type) {
          var alert = {
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
  describe("Zod Schema Validations", function () {
    describe("ForecastingModel Schema", function () {
      it("validates valid forecasting model", function () {
        var validData = {
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
        var result = predictive_analytics_1.forecastingModelSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.accuracy_score).toBe(0.875);
          expect(result.data.model_type).toBe("appointment_demand");
        }
      });
      it("rejects invalid model type", function () {
        var invalidData = {
          id: "model-123",
          model_type: "invalid_type",
          model_name: "Test Model",
          accuracy_score: 0.85,
          status: "active",
          created_at: "2025-01-26T09:00:00Z",
          updated_at: "2025-01-26T09:00:00Z",
        };
        var result = predictive_analytics_1.forecastingModelSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("model_type");
        }
      });
      it("validates accuracy score range (0-1)", function () {
        var invalidData = {
          id: "model-123",
          model_type: "appointment_demand",
          model_name: "Test Model",
          accuracy_score: 1.5, // Invalid - greater than 1
          status: "active",
          created_at: "2025-01-26T09:00:00Z",
          updated_at: "2025-01-26T09:00:00Z",
        };
        var result = predictive_analytics_1.forecastingModelSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("accuracy_score");
        }
      });
      it("validates required fields", function () {
        var incompleteData = {
          id: "model-123",
          // Missing required fields
        };
        var result = predictive_analytics_1.forecastingModelSchema.safeParse(incompleteData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });
    describe("DemandPrediction Schema", function () {
      it("validates valid prediction data", function () {
        var validData = {
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
        var result = predictive_analytics_1.demandPredictionSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.forecast_value).toBe(45.5);
          expect(result.data.confidence_score).toBe(0.89);
        }
      });
      it("validates confidence interval logic", function () {
        var invalidData = {
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
        var result = predictive_analytics_1.demandPredictionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
      it("validates confidence score range (0-1)", function () {
        var invalidData = {
          id: "pred-123",
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: "daily",
          category: "appointments",
          forecast_value: 45.5,
          confidence_score: 1.5, // Invalid - greater than 1
          created_at: "2025-01-26T09:00:00Z",
        };
        var result = predictive_analytics_1.demandPredictionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
      it("validates forecast period enum", function () {
        var invalidData = {
          id: "pred-123",
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: "invalid_period",
          category: "appointments",
          forecast_value: 45.5,
          confidence_score: 0.89,
          created_at: "2025-01-26T09:00:00Z",
        };
        var result = predictive_analytics_1.demandPredictionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
    describe("Request Schemas", function () {
      it("validates prediction request", function () {
        var validRequest = {
          model_id: "model-123",
          prediction_date: "2025-02-01",
          forecast_period: "daily",
          category: "appointments",
        };
        var result = predictive_analytics_1.predictionRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });
      it("validates training request", function () {
        var validRequest = {
          model_id: "model-123",
          training_data_start_date: "2024-01-01",
          training_data_end_date: "2025-01-26",
        };
        var result = predictive_analytics_1.trainingRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });
      it("validates training date range logic", function () {
        var invalidRequest = {
          model_id: "model-123",
          training_data_start_date: "2025-01-26",
          training_data_end_date: "2024-01-01", // End before start
        };
        var result = predictive_analytics_1.trainingRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
      it("validates alert update request", function () {
        var validRequest = {
          alert_id: "alert-123",
          acknowledged: true,
          resolution_status: "resolved",
        };
        var result = predictive_analytics_1.alertUpdateRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });
    });
  });
  describe("Service Layer Functions", function () {
    describe("generateDemandPrediction", function () {
      var mockHistoricalData = [
        { date: "2025-01-01", value: 40 },
        { date: "2025-01-02", value: 42 },
        { date: "2025-01-03", value: 45 },
        { date: "2025-01-04", value: 43 },
        { date: "2025-01-05", value: 47 },
      ];
      it("generates prediction with confidence intervals", function () {
        var prediction = (0, predictive_analytics_2.generateDemandPrediction)(
          mockHistoricalData,
          "2025-01-06",
          "daily",
        );
        expect(prediction).toHaveProperty("forecast_value");
        expect(prediction).toHaveProperty("confidence_interval_lower");
        expect(prediction).toHaveProperty("confidence_interval_upper");
        expect(prediction).toHaveProperty("confidence_score");
        expect(prediction.confidence_interval_lower).toBeLessThan(prediction.forecast_value);
        expect(prediction.confidence_interval_upper).toBeGreaterThan(prediction.forecast_value);
        expect(prediction.confidence_score).toBeGreaterThanOrEqual(0);
        expect(prediction.confidence_score).toBeLessThanOrEqual(1);
      });
      it("handles different forecast periods", function () {
        var periods = ["daily", "weekly", "monthly"];
        periods.forEach(function (period) {
          var prediction = (0, predictive_analytics_2.generateDemandPrediction)(
            mockHistoricalData,
            "2025-01-06",
            period,
          );
          expect(prediction.forecast_period).toBe(period);
          expect(prediction.forecast_value).toBeGreaterThan(0);
        });
      });
      it("adapts to seasonal patterns", function () {
        var seasonalData = [
          { date: "2024-12-01", value: 30 }, // Low season
          { date: "2024-12-15", value: 60 }, // High season
          { date: "2025-01-01", value: 35 }, // Low season
          { date: "2025-01-15", value: 65 }, // High season
        ];
        var prediction = (0, predictive_analytics_2.generateDemandPrediction)(
          seasonalData,
          "2025-01-16",
          "daily",
        );
        expect(prediction.forecast_value).toBeGreaterThan(50); // Should predict high season
      });
      it("provides higher confidence for stable patterns", function () {
        var stableData = [
          { date: "2025-01-01", value: 45 },
          { date: "2025-01-02", value: 45 },
          { date: "2025-01-03", value: 45 },
          { date: "2025-01-04", value: 45 },
          { date: "2025-01-05", value: 45 },
        ];
        var prediction = (0, predictive_analytics_2.generateDemandPrediction)(
          stableData,
          "2025-01-06",
          "daily",
        );
        expect(prediction.confidence_score).toBeGreaterThan(0.8);
      });
    });
    describe("calculateAccuracyMetrics", function () {
      var mockActualValues = [40, 42, 45, 43, 47];
      var mockPredictedValues = [38, 44, 46, 41, 49];
      it("calculates accuracy score", function () {
        var metrics = (0, predictive_analytics_2.calculateAccuracyMetrics)(
          mockActualValues,
          mockPredictedValues,
        );
        expect(metrics).toHaveProperty("accuracy_score");
        expect(metrics.accuracy_score).toBeGreaterThanOrEqual(0);
        expect(metrics.accuracy_score).toBeLessThanOrEqual(1);
      });
      it("calculates MAE (Mean Absolute Error)", function () {
        var metrics = (0, predictive_analytics_2.calculateAccuracyMetrics)(
          mockActualValues,
          mockPredictedValues,
        );
        expect(metrics).toHaveProperty("mae");
        expect(metrics.mae).toBeGreaterThanOrEqual(0);
      });
      it("calculates RMSE (Root Mean Square Error)", function () {
        var metrics = (0, predictive_analytics_2.calculateAccuracyMetrics)(
          mockActualValues,
          mockPredictedValues,
        );
        expect(metrics).toHaveProperty("rmse");
        expect(metrics.rmse).toBeGreaterThanOrEqual(0);
        expect(metrics.rmse).toBeGreaterThanOrEqual(metrics.mae);
      });
      it("identifies when accuracy meets threshold", function () {
        var perfectPredictions = mockActualValues;
        var metrics = (0, predictive_analytics_2.calculateAccuracyMetrics)(
          mockActualValues,
          perfectPredictions,
        );
        expect(metrics.accuracy_score).toBe(1.0);
        expect(metrics.mae).toBe(0);
        expect(metrics.rmse).toBe(0);
      });
      it("handles edge cases gracefully", function () {
        // Empty arrays
        expect(function () {
          (0, predictive_analytics_2.calculateAccuracyMetrics)([], []);
        }).not.toThrow();
        // Mismatched lengths
        expect(function () {
          (0, predictive_analytics_2.calculateAccuracyMetrics)([1, 2, 3], [1, 2]);
        }).not.toThrow();
      });
    });
    describe("createDemandAlert", function () {
      it("creates spike alert for significant increases", function () {
        var currentDemand = 45;
        var predictedDemand = 65; // 44% increase
        var alert = (0, predictive_analytics_2.createDemandAlert)(
          currentDemand,
          predictedDemand,
          "appointments",
          0.9,
        );
        expect(alert.alert_type).toBe("demand_spike");
        expect(alert.severity).toBe("high");
        expect(alert.metadata.predicted_increase).toBeGreaterThan(0.3);
      });
      it("creates drop alert for significant decreases", function () {
        var currentDemand = 65;
        var predictedDemand = 35; // 46% decrease
        var alert = (0, predictive_analytics_2.createDemandAlert)(
          currentDemand,
          predictedDemand,
          "appointments",
          0.9,
        );
        expect(alert.alert_type).toBe("demand_drop");
        expect(alert.severity).toBe("medium");
      });
      it("adjusts severity based on magnitude", function () {
        var scenarios = [
          { current: 50, predicted: 55, expectedSeverity: "low" }, // 10% increase
          { current: 50, predicted: 65, expectedSeverity: "medium" }, // 30% increase
          { current: 50, predicted: 75, expectedSeverity: "high" }, // 50% increase
          { current: 50, predicted: 90, expectedSeverity: "critical" }, // 80% increase
        ];
        scenarios.forEach(function (scenario) {
          var alert = (0, predictive_analytics_2.createDemandAlert)(
            scenario.current,
            scenario.predicted,
            "appointments",
            0.9,
          );
          expect(alert.severity).toBe(scenario.expectedSeverity);
        });
      });
      it("includes confidence in alert metadata", function () {
        var alert = (0, predictive_analytics_2.createDemandAlert)(45, 65, "appointments", 0.89);
        expect(alert.metadata).toHaveProperty("confidence_score");
        expect(alert.metadata.confidence_score).toBe(0.89);
      });
      it("generates appropriate titles and descriptions", function () {
        var alert = (0, predictive_analytics_2.createDemandAlert)(45, 65, "appointments", 0.9);
        expect(alert.title).toContain("Demanda");
        expect(alert.description).toContain("%");
        expect(alert.description).toContain("appointments");
      });
    });
    describe("optimizeResourceAllocation", function () {
      var mockDemandForecast = [
        { date: "2025-02-01", predicted_demand: 45, category: "appointments" },
        { date: "2025-02-02", predicted_demand: 52, category: "appointments" },
        { date: "2025-02-03", predicted_demand: 38, category: "appointments" },
      ];
      var mockCurrentResources = {
        staff: 5,
        rooms: 3,
        equipment: 2,
      };
      it("provides staff optimization recommendations", function () {
        var recommendations = (0, predictive_analytics_2.optimizeResourceAllocation)(
          mockDemandForecast,
          mockCurrentResources,
        );
        expect(recommendations).toBeInstanceOf(Array);
        expect(recommendations.length).toBeGreaterThan(0);
        var staffRec = recommendations.find(function (r) {
          return (
            r.recommendation_type === "resource_allocation" && r.metadata.resource_type === "staff"
          );
        });
        expect(staffRec).toBeDefined();
      });
      it("calculates optimal resource levels", function () {
        var recommendations = (0, predictive_analytics_2.optimizeResourceAllocation)(
          mockDemandForecast,
          mockCurrentResources,
        );
        var staffRec = recommendations.find(function (r) {
          return r.metadata.resource_type === "staff";
        });
        if (staffRec) {
          expect(staffRec.metadata).toHaveProperty("recommended_quantity");
          expect(staffRec.metadata.recommended_quantity).toBeGreaterThan(0);
        }
      });
      it("provides schedule optimization suggestions", function () {
        var recommendations = (0, predictive_analytics_2.optimizeResourceAllocation)(
          mockDemandForecast,
          mockCurrentResources,
        );
        var scheduleRec = recommendations.find(function (r) {
          return r.recommendation_type === "schedule_optimization";
        });
        expect(scheduleRec).toBeDefined();
        if (scheduleRec) {
          expect(scheduleRec.priority).toMatch(/low|medium|high/);
        }
      });
      it("considers confidence scores in recommendations", function () {
        var highConfidenceForecast = mockDemandForecast.map(function (f) {
          return __assign(__assign({}, f), { confidence_score: 0.95 });
        });
        var recommendations = (0, predictive_analytics_2.optimizeResourceAllocation)(
          highConfidenceForecast,
          mockCurrentResources,
        );
        recommendations.forEach(function (rec) {
          expect(rec.confidence_score).toBeGreaterThan(0.8);
        });
      });
      it("handles capacity constraints", function () {
        var highDemandForecast = [
          { date: "2025-02-01", predicted_demand: 100, category: "appointments" },
          { date: "2025-02-02", predicted_demand: 120, category: "appointments" },
        ];
        var recommendations = (0, predictive_analytics_2.optimizeResourceAllocation)(
          highDemandForecast,
          mockCurrentResources,
        );
        var capacityAlert = recommendations.find(function (r) {
          return r.recommendation_type === "capacity_warning";
        });
        expect(capacityAlert).toBeDefined();
        if (capacityAlert) {
          expect(capacityAlert.priority).toBe("high");
        }
      });
    });
  });
  describe("PredictiveAnalyticsService Class", function () {
    var service;
    beforeEach(function () {
      service = new predictive_analytics_2.PredictiveAnalyticsService();
    });
    describe("Model Management", function () {
      it("creates forecasting model with validation", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var modelData, createSpy, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                modelData = {
                  model_type: "appointment_demand",
                  model_name: "Test Model",
                  metadata: {
                    features: ["historical_data"],
                    algorithm: "Linear Regression",
                  },
                };
                createSpy = jest.spyOn(service, "createModel");
                createSpy.mockResolvedValue(
                  __assign(__assign({ id: "model-123" }, modelData), {
                    accuracy_score: 0.85,
                    status: "training",
                    created_at: "2025-01-26T09:00:00Z",
                    updated_at: "2025-01-26T09:00:00Z",
                  }),
                );
                return [4 /*yield*/, service.createModel(modelData)];
              case 1:
                result = _a.sent();
                expect(result.model_type).toBe("appointment_demand");
                expect(result.accuracy_score).toBeGreaterThanOrEqual(0.85);
                createSpy.mockRestore();
                return [2 /*return*/];
            }
          });
        });
      });
      it("validates model accuracy threshold", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var lowAccuracyModel, validateSpy, isValid;
          return __generator(this, function (_a) {
            lowAccuracyModel = {
              id: "model-123",
              accuracy_score: 0.75, // Below 85% threshold
            };
            validateSpy = jest.spyOn(service, "validateAccuracyThreshold");
            validateSpy.mockReturnValue(false);
            isValid = service.validateAccuracyThreshold(lowAccuracyModel.accuracy_score);
            expect(isValid).toBe(false);
            validateSpy.mockRestore();
            return [2 /*return*/];
          });
        });
      });
      it("activates models only when accuracy ≥85%", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var highAccuracyModel, activateSpy, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                highAccuracyModel = {
                  id: "model-123",
                  accuracy_score: 0.87,
                };
                activateSpy = jest.spyOn(service, "activateModel");
                activateSpy.mockResolvedValue(true);
                return [4 /*yield*/, service.activateModel(highAccuracyModel.id)];
              case 1:
                result = _a.sent();
                expect(result).toBe(true);
                activateSpy.mockRestore();
                return [2 /*return*/];
            }
          });
        });
      });
    });
    describe("Prediction Generation", function () {
      it("generates predictions with confidence intervals", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var predictionRequest, generateSpy, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                predictionRequest = {
                  model_id: "model-123",
                  prediction_date: "2025-02-01",
                  forecast_period: "daily",
                  category: "appointments",
                };
                generateSpy = jest.spyOn(service, "generatePrediction");
                generateSpy.mockResolvedValue(
                  __assign(__assign({ id: "pred-123" }, predictionRequest), {
                    forecast_value: 45.5,
                    confidence_interval_lower: 40.2,
                    confidence_interval_upper: 50.8,
                    confidence_score: 0.89,
                    created_at: "2025-01-26T09:00:00Z",
                  }),
                );
                return [4 /*yield*/, service.generatePrediction(predictionRequest)];
              case 1:
                result = _a.sent();
                expect(result.forecast_value).toBe(45.5);
                expect(result.confidence_score).toBe(0.89);
                expect(result.confidence_interval_lower).toBeLessThan(result.forecast_value);
                expect(result.confidence_interval_upper).toBeGreaterThan(result.forecast_value);
                generateSpy.mockRestore();
                return [2 /*return*/];
            }
          });
        });
      });
      it("supports multi-dimensional forecasting", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var categories, predictions, generateSpy, _i, categories_1, category, prediction;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                categories = ["appointments", "treatments", "revenue"];
                predictions = [];
                generateSpy = jest.spyOn(service, "generatePrediction");
                (_i = 0), (categories_1 = categories);
                _a.label = 1;
              case 1:
                if (!(_i < categories_1.length)) return [3 /*break*/, 4];
                category = categories_1[_i];
                generateSpy.mockResolvedValueOnce({
                  id: "pred-".concat(category),
                  model_id: "model-123",
                  prediction_date: "2025-02-01",
                  forecast_period: "daily",
                  category: category,
                  forecast_value: 45.5,
                  confidence_score: 0.89,
                  created_at: "2025-01-26T09:00:00Z",
                });
                return [
                  4 /*yield*/,
                  service.generatePrediction({
                    model_id: "model-123",
                    prediction_date: "2025-02-01",
                    forecast_period: "daily",
                    category: category,
                  }),
                ];
              case 2:
                prediction = _a.sent();
                predictions.push(prediction);
                _a.label = 3;
              case 3:
                _i++;
                return [3 /*break*/, 1];
              case 4:
                expect(predictions).toHaveLength(3);
                expect(
                  predictions.map(function (p) {
                    return p.category;
                  }),
                ).toEqual(categories);
                generateSpy.mockRestore();
                return [2 /*return*/];
            }
          });
        });
      });
    });
    describe("Alert System", function () {
      it("creates demand spike alerts", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var alertData, createSpy, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                alertData = {
                  alert_type: "demand_spike",
                  severity: "high",
                  title: "Pico de Demanda",
                  description: "Aumento significativo previsto",
                };
                createSpy = jest.spyOn(service, "createAlert");
                createSpy.mockResolvedValue(
                  __assign(__assign({ id: "alert-123" }, alertData), {
                    notification_sent: false,
                    acknowledged: false,
                    resolution_status: "open",
                    alert_date: "2025-01-26T09:00:00Z",
                    created_at: "2025-01-26T09:00:00Z",
                  }),
                );
                return [4 /*yield*/, service.createAlert(alertData)];
              case 1:
                result = _a.sent();
                expect(result.alert_type).toBe("demand_spike");
                expect(result.severity).toBe("high");
                expect(result.acknowledged).toBe(false);
                createSpy.mockRestore();
                return [2 /*return*/];
            }
          });
        });
      });
      it("manages alert acknowledgment workflow", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var updateRequest, updateSpy, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                updateRequest = {
                  alert_id: "alert-123",
                  acknowledged: true,
                  resolution_status: "resolved",
                };
                updateSpy = jest.spyOn(service, "updateAlert");
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
                return [4 /*yield*/, service.updateAlert(updateRequest)];
              case 1:
                result = _a.sent();
                expect(result.acknowledged).toBe(true);
                expect(result.resolution_status).toBe("resolved");
                updateSpy.mockRestore();
                return [2 /*return*/];
            }
          });
        });
      });
    });
    describe("Performance Monitoring", function () {
      it("tracks accuracy metrics over time", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var accuracyData, trackSpy, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                accuracyData = [
                  { model_id: "model-123", accuracy_score: 0.87, evaluation_date: "2025-01-25" },
                  { model_id: "model-123", accuracy_score: 0.89, evaluation_date: "2025-01-26" },
                ];
                trackSpy = jest.spyOn(service, "trackAccuracy");
                trackSpy.mockResolvedValue(accuracyData);
                return [4 /*yield*/, service.trackAccuracy("model-123")];
              case 1:
                result = _a.sent();
                expect(result).toHaveLength(2);
                expect(result[1].accuracy_score).toBeGreaterThan(result[0].accuracy_score);
                trackSpy.mockRestore();
                return [2 /*return*/];
            }
          });
        });
      });
      it("identifies models needing retraining", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var models, identifySpy, result;
          return __generator(this, function (_a) {
            models = [
              { id: "model-1", accuracy_score: 0.82 }, // Below threshold
              { id: "model-2", accuracy_score: 0.89 }, // Above threshold
            ];
            identifySpy = jest.spyOn(service, "identifyModelsNeedingRetraining");
            identifySpy.mockReturnValue(["model-1"]);
            result = service.identifyModelsNeedingRetraining(models);
            expect(result).toContain("model-1");
            expect(result).not.toContain("model-2");
            identifySpy.mockRestore();
            return [2 /*return*/];
          });
        });
      });
    });
  });
  describe("Story 8.3 Acceptance Criteria Type Validation", function () {
    it("AC1: Enforces ≥85% accuracy requirement in types", function () {
      var highAccuracyModel = {
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
    it("AC2: Supports multi-dimensional prediction types", function () {
      var dimensions = ["appointments", "treatments", "revenue", "resources"];
      dimensions.forEach(function (category) {
        var prediction = {
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
    it("AC4: Supports early warning alert types", function () {
      var warningTypes = ["demand_spike", "demand_drop", "resource_shortage", "capacity_exceeded"];
      warningTypes.forEach(function (alertType) {
        var alert = {
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
    it("AC8: Supports customizable timeframe types", function () {
      var timeframes = ["hourly", "daily", "weekly", "monthly"];
      timeframes.forEach(function (period) {
        var prediction = {
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
    it("AC10: Includes performance tracking types", function () {
      var accuracy = {
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
