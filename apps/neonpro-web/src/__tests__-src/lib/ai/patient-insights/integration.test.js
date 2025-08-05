"use strict";
// Tests for Patient Insights Integration Module
// Story 3.2: Task 9 - Basic Integration Testing
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
var index_1 = require("@/lib/ai/patient-insights/index");
describe("PatientInsightsIntegration", function () {
  var patientInsights;
  beforeEach(function () {
    // Initialize with test configuration
    patientInsights = new index_1.PatientInsightsIntegration({
      enableRiskAssessment: true,
      enableTreatmentRecommendations: true,
      enablePredictiveAnalytics: true,
      enableBehaviorAnalysis: true,
      enableHealthTrends: true,
      enableContinuousLearning: true,
      riskThresholds: {
        low: 0.3,
        medium: 0.6,
        high: 0.8,
      },
      parallelProcessing: true,
    });
  });
  describe("Configuration and Initialization", function () {
    it("should initialize with default configuration", function () {
      var defaultInstance = new index_1.PatientInsightsIntegration();
      expect(defaultInstance).toBeInstanceOf(index_1.PatientInsightsIntegration);
    });
    it("should apply custom configuration", function () {
      var customConfig = {
        enableRiskAssessment: false,
        enableBehaviorAnalysis: true,
        riskThresholds: {
          low: 0.2,
          medium: 0.5,
          high: 0.7,
        },
      };
      var customInstance = new index_1.PatientInsightsIntegration(customConfig);
      expect(customInstance).toBeInstanceOf(index_1.PatientInsightsIntegration);
    });
  });
  describe("Basic Functionality", function () {
    it("should have required methods", function () {
      expect(typeof patientInsights.generateComprehensiveInsights).toBe("function");
      expect(typeof patientInsights.generateQuickRiskAssessment).toBe("function");
      expect(typeof patientInsights.generateTreatmentGuidance).toBe("function");
      expect(typeof patientInsights.monitorPatientAlerts).toBe("function");
      expect(typeof patientInsights.updatePatientOutcome).toBe("function");
      expect(typeof patientInsights.getSystemHealth).toBe("function");
    });
    it("should return system health status", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, patientInsights.getSystemHealth()];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.overall).toMatch(/^(healthy|degraded|critical)$/);
              expect(Array.isArray(result.engines)).toBe(true);
              expect(result.lastChecked).toBeInstanceOf(Date);
              expect(result.uptime).toBeGreaterThanOrEqual(0);
              expect(result.performance).toBeDefined();
              expect(result.performance.averageResponseTime).toBeGreaterThanOrEqual(0);
              expect(result.performance.successRate).toBeGreaterThanOrEqual(0);
              expect(result.performance.errorRate).toBeGreaterThanOrEqual(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Configuration Edge Cases", function () {
    it("should handle disabled modules gracefully", function () {
      var minimalInstance = new index_1.PatientInsightsIntegration({
        enableRiskAssessment: false,
        enableTreatmentRecommendations: false,
        enablePredictiveAnalytics: false,
        enableBehaviorAnalysis: false,
        enableHealthTrends: false,
        enableContinuousLearning: false,
      });
      expect(minimalInstance).toBeInstanceOf(index_1.PatientInsightsIntegration);
    });
    it("should handle partial configuration", function () {
      var partialInstance = new index_1.PatientInsightsIntegration({
        enableRiskAssessment: true,
        riskThresholds: {
          low: 0.1,
          medium: 0.5,
          high: 0.9,
        },
      });
      expect(partialInstance).toBeInstanceOf(index_1.PatientInsightsIntegration);
    });
  });
  describe("Error Handling for Disabled Features", function () {
    it("should throw error when risk assessment is disabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var disabledInstance;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              disabledInstance = new index_1.PatientInsightsIntegration({
                enableRiskAssessment: false,
              });
              return [
                4 /*yield*/,
                expect(disabledInstance.generateQuickRiskAssessment("patient-123")).rejects.toThrow(
                  "Risk assessment is disabled",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should throw error when treatment recommendations are disabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var disabledInstance;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              disabledInstance = new index_1.PatientInsightsIntegration({
                enableTreatmentRecommendations: false,
              });
              return [
                4 /*yield*/,
                expect(disabledInstance.generateTreatmentGuidance("patient-123")).rejects.toThrow(
                  "Treatment recommendations are disabled",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should return empty array when continuous learning is disabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var disabledInstance, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              disabledInstance = new index_1.PatientInsightsIntegration({
                enableContinuousLearning: false,
              });
              return [
                4 /*yield*/,
                disabledInstance.updatePatientOutcome("patient-123", "treatment-456", {
                  result: "successful",
                }),
              ];
            case 1:
              result = _a.sent();
              expect(result).toEqual([]);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Input Validation", function () {
    it("should validate patient ID in comprehensive insights", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                expect(
                  patientInsights.generateComprehensiveInsights({
                    patientId: "",
                    requestId: "req-456",
                    requestedInsights: ["risk"],
                    timestamp: new Date(),
                    userId: "user-789",
                    clinicId: "clinic-abc",
                  }),
                ).rejects.toThrow("Patient ID is required"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should validate requested insights array", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                expect(
                  patientInsights.generateComprehensiveInsights({
                    patientId: "patient-123",
                    requestId: "req-456",
                    requestedInsights: [],
                    timestamp: new Date(),
                    userId: "user-789",
                    clinicId: "clinic-abc",
                  }),
                ).rejects.toThrow("At least one insight type must be requested"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Performance Requirements", function () {
    it("should complete system health check within reasonable time", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var start, duration;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              start = Date.now();
              return [4 /*yield*/, patientInsights.getSystemHealth()];
            case 1:
              _a.sent();
              duration = Date.now() - start;
              expect(duration).toBeLessThan(5000); // 5 seconds max
              return [2 /*return*/];
          }
        });
      });
    }, 10000);
  });
});
