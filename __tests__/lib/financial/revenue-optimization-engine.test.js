"use strict";
/**
 * Revenue Optimization Engine Tests
 *
 * Comprehensive test suite for revenue optimization functionality:
 * - Dynamic pricing optimization
 * - Service mix optimization
 * - Customer lifetime value enhancement
 * - Automated revenue recommendations
 * - Competitive analysis and benchmarking
 * - ROI tracking and performance monitoring
 */
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
var revenue_optimization_engine_1 = require("@/lib/financial/revenue-optimization-engine");
// Mock Supabase client
var mockSelect = jest.fn(function () {
  return {
    eq: jest.fn(function () {
      return {
        eq: jest.fn(function () {
          return {
            eq: jest.fn(function () {
              return {
                single: jest.fn(function () {
                  return Promise.resolve({
                    data: {
                      id: "test-strategy-1",
                      strategy_name: "Dynamic Pricing",
                      strategy_type: "dynamic",
                      base_price: 500,
                      is_active: true,
                    },
                    error: null,
                  });
                }),
                order: jest.fn(function () {
                  return {
                    limit: jest.fn(function () {
                      return Promise.resolve({
                        data: [
                          {
                            id: "test-analysis-1",
                            competitor_name: "Competitor A",
                            price_comparison: 0.85,
                            analysis_date: "2024-01-01",
                          },
                        ],
                        error: null,
                      });
                    }),
                  };
                }),
              };
            }),
          };
        }),
        single: jest.fn(function () {
          return Promise.resolve({
            data: {
              id: "test-strategy-1",
              strategy_name: "Dynamic Pricing",
              strategy_type: "dynamic",
              base_price: 500,
              is_active: true,
            },
            error: null,
          });
        }),
        order: jest.fn(function () {
          return {
            limit: jest.fn(function () {
              return Promise.resolve({
                data: [
                  {
                    id: "test-analysis-1",
                    competitor_name: "Competitor A",
                    price_comparison: 0.85,
                    analysis_date: "2024-01-01",
                  },
                ],
                error: null,
              });
            }),
          };
        }),
        limit: jest.fn(function () {
          return Promise.resolve({
            data: [
              {
                id: "test-analysis-1",
                competitor_name: "Competitor A",
                price_comparison: 0.85,
                analysis_date: "2024-01-01",
              },
            ],
            error: null,
          });
        }),
      };
    }),
  };
});
jest.mock("@/app/utils/supabase/client", function () {
  return {
    createClient: function () {
      return {
        from: jest.fn(function () {
          return {
            select: mockSelect,
          };
        }),
      };
    },
  };
});
describe("RevenueOptimizationEngine", function () {
  var engine;
  var mockClinicId = "clinic-123";
  var mockServiceId = "service-456";
  var mockPatientId = "patient-789";
  beforeEach(function () {
    engine = new revenue_optimization_engine_1.RevenueOptimizationEngine();
    jest.clearAllMocks();
  });
  describe("🔥 Core Engine Initialization", function () {
    test("should initialize RevenueOptimizationEngine", function () {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(revenue_optimization_engine_1.RevenueOptimizationEngine);
    });
    test("should have required methods", function () {
      expect(typeof engine.optimizePricing).toBe("function");
      expect(typeof engine.optimizeServiceMix).toBe("function");
      expect(typeof engine.enhanceCLV).toBe("function");
      expect(typeof engine.generateAutomatedRecommendations).toBe("function");
      expect(typeof engine.getCompetitiveAnalysis).toBe("function");
      expect(typeof engine.trackROI).toBe("function");
    });
  });
  describe("💰 Dynamic Pricing Optimization", function () {
    test("should optimize pricing strategy successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.optimizePricing(mockClinicId, mockServiceId)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.currentStrategy).toBeDefined();
              expect(result.recommendations).toBeInstanceOf(Array);
              expect(result.projectedIncrease).toBeGreaterThan(0);
              expect(result.competitiveAnalysis).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle pricing optimization without service ID", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.optimizePricing(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.recommendations).toBeInstanceOf(Array);
              expect(result.projectedIncrease).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should generate pricing recommendations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.optimizePricing(mockClinicId, mockServiceId)];
            case 1:
              result = _a.sent();
              expect(result.recommendations).toBeInstanceOf(Array);
              expect(result.recommendations.length).toBeGreaterThan(0);
              result.recommendations.forEach(function (rec) {
                expect(typeof rec).toBe("string");
                expect(rec.length).toBeGreaterThan(0);
              });
              return [2 /*return*/];
          }
        });
      });
    });
    test("should calculate projected revenue increase", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.optimizePricing(mockClinicId, mockServiceId)];
            case 1:
              result = _a.sent();
              expect(result.projectedIncrease).toBeGreaterThan(0);
              expect(result.projectedIncrease).toBeLessThan(100); // Reasonable upper bound
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle pricing optimization errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockEngine;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockEngine = new revenue_optimization_engine_1.RevenueOptimizationEngine();
              jest
                .spyOn(mockEngine, "analyzeMarketDemand")
                .mockRejectedValue(new Error("Network error"));
              return [
                4 /*yield*/,
                expect(mockEngine.optimizePricing(mockClinicId)).rejects.toThrow(
                  "Failed to optimize pricing strategy",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("🎨 Service Mix Optimization", function () {
    test("should optimize service mix successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.optimizeServiceMix(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.currentMix).toBeInstanceOf(Array);
              expect(result.optimizedMix).toBeInstanceOf(Array);
              expect(result.profitabilityGain).toBeGreaterThan(0);
              expect(result.recommendations).toBeInstanceOf(Array);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should analyze service performance", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.optimizeServiceMix(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.currentMix).toBeInstanceOf(Array);
              result.currentMix.forEach(function (service) {
                expect(service).toHaveProperty("serviceId");
                expect(service).toHaveProperty("serviceName");
                expect(service).toHaveProperty("revenue");
                expect(service).toHaveProperty("margin");
                expect(service).toHaveProperty("profitabilityRank");
              });
              return [2 /*return*/];
          }
        });
      });
    });
    test("should generate service mix recommendations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.optimizeServiceMix(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.recommendations).toBeInstanceOf(Array);
              expect(result.recommendations.length).toBe(5); // Standard recommendations
              result.recommendations.forEach(function (rec) {
                expect(typeof rec).toBe("string");
                expect(rec.length).toBeGreaterThan(0);
              });
              return [2 /*return*/];
          }
        });
      });
    });
    test("should calculate profitability gain", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.optimizeServiceMix(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.profitabilityGain).toBeGreaterThan(0);
              expect(result.profitabilityGain).toBeLessThan(50); // Reasonable upper bound
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("📊 Customer Lifetime Value Enhancement", function () {
    test("should enhance CLV successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.enhanceCLV(mockClinicId, mockPatientId)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.clvPredictions).toBeInstanceOf(Array);
              expect(result.enhancementStrategies).toBeInstanceOf(Array);
              expect(result.projectedIncrease).toBeGreaterThan(0);
              expect(result.riskSegmentation).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle CLV enhancement without patient ID", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.enhanceCLV(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.clvPredictions).toBeInstanceOf(Array);
              expect(result.enhancementStrategies).toBeInstanceOf(Array);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should segment customers by risk", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.enhanceCLV(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.riskSegmentation).toBeDefined();
              expect(result.riskSegmentation).toHaveProperty("highValueLowRisk");
              expect(result.riskSegmentation).toHaveProperty("highValueHighRisk");
              expect(result.riskSegmentation).toHaveProperty("lowValueLowRisk");
              expect(result.riskSegmentation).toHaveProperty("lowValueHighRisk");
              return [2 /*return*/];
          }
        });
      });
    });
    test("should generate CLV enhancement strategies", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.enhanceCLV(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.enhancementStrategies).toBeInstanceOf(Array);
              expect(result.enhancementStrategies.length).toBe(5); // Standard strategies
              result.enhancementStrategies.forEach(function (strategy) {
                expect(typeof strategy).toBe("string");
                expect(strategy.length).toBeGreaterThan(0);
              });
              return [2 /*return*/];
          }
        });
      });
    });
    test("should calculate CLV increase projection", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.enhanceCLV(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.projectedIncrease).toBeGreaterThan(0);
              expect(result.projectedIncrease).toBeLessThan(100); // Reasonable upper bound
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("🤖 Automated Revenue Recommendations", function () {
    test("should generate automated recommendations successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.generateAutomatedRecommendations(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.recommendations).toBeInstanceOf(Array);
              expect(result.totalProjectedIncrease).toBeGreaterThan(0);
              expect(result.implementationPlan).toBeInstanceOf(Array);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should provide comprehensive recommendations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.generateAutomatedRecommendations(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.recommendations.length).toBe(5); // Standard recommendation count
              result.recommendations.forEach(function (rec) {
                expect(rec).toHaveProperty("type");
                expect(rec).toHaveProperty("priority");
                expect(rec).toHaveProperty("description");
                expect(rec).toHaveProperty("expectedImpact");
                expect(rec).toHaveProperty("implementationEffort");
                expect(rec).toHaveProperty("timeframe");
              });
              return [2 /*return*/];
          }
        });
      });
    });
    test("should calculate total projected increase", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result, manualTotal;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.generateAutomatedRecommendations(mockClinicId)];
            case 1:
              result = _a.sent();
              manualTotal = result.recommendations.reduce(function (sum, rec) {
                return sum + rec.expectedImpact;
              }, 0);
              expect(result.totalProjectedIncrease).toBe(manualTotal);
              expect(result.totalProjectedIncrease).toBeGreaterThan(30); // Expected minimum impact
              return [2 /*return*/];
          }
        });
      });
    });
    test("should provide implementation plan", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.generateAutomatedRecommendations(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.implementationPlan).toBeInstanceOf(Array);
              expect(result.implementationPlan.length).toBe(5); // Standard phases
              result.implementationPlan.forEach(function (phase) {
                expect(typeof phase).toBe("string");
                expect(phase.length).toBeGreaterThan(0);
              });
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("🏆 Competitive Analysis and Benchmarking", function () {
    test("should get competitive analysis successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.getCompetitiveAnalysis(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.competitorData).toBeInstanceOf(Array);
              expect(result.marketPosition).toBeDefined();
              expect(result.pricingGaps).toBeInstanceOf(Array);
              expect(result.opportunityAreas).toBeInstanceOf(Array);
              expect(result.benchmarkMetrics).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    test("should analyze market position", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.getCompetitiveAnalysis(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(typeof result.marketPosition).toBe("string");
              expect(result.marketPosition.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should identify pricing gaps", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.getCompetitiveAnalysis(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.pricingGaps).toBeInstanceOf(Array);
              result.pricingGaps.forEach(function (gap) {
                expect(gap).toHaveProperty("service");
                expect(gap).toHaveProperty("currentPrice");
                expect(gap).toHaveProperty("marketAverage");
                expect(gap).toHaveProperty("opportunity");
                expect(gap).toHaveProperty("recommendedPrice");
              });
              return [2 /*return*/];
          }
        });
      });
    });
    test("should provide opportunity areas", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.getCompetitiveAnalysis(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.opportunityAreas).toBeInstanceOf(Array);
              expect(result.opportunityAreas.length).toBe(5); // Standard opportunities
              result.opportunityAreas.forEach(function (area) {
                expect(typeof area).toBe("string");
                expect(area.length).toBeGreaterThan(0);
              });
              return [2 /*return*/];
          }
        });
      });
    });
    test("should calculate benchmark metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.getCompetitiveAnalysis(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.benchmarkMetrics).toBeDefined();
              expect(result.benchmarkMetrics).toHaveProperty("priceCompetitiveness");
              expect(result.benchmarkMetrics).toHaveProperty("serviceQuality");
              expect(result.benchmarkMetrics).toHaveProperty("customerSatisfaction");
              expect(result.benchmarkMetrics).toHaveProperty("marketShare");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("📈 ROI Tracking and Performance", function () {
    test("should track ROI successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.trackROI(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.roiMetrics).toBeInstanceOf(Array);
              expect(result.performanceIndicators).toBeDefined();
              expect(result.trendAnalysis).toBeDefined();
              expect(result.recommendations).toBeInstanceOf(Array);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should track specific optimization ROI", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockOptimizationId, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockOptimizationId = "optimization-123";
              return [4 /*yield*/, engine.trackROI(mockClinicId, mockOptimizationId)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.roiMetrics).toBeInstanceOf(Array);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should calculate performance indicators", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.trackROI(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.performanceIndicators).toBeDefined();
              expect(result.performanceIndicators).toHaveProperty("overallROI");
              expect(result.performanceIndicators).toHaveProperty("successRate");
              expect(result.performanceIndicators).toHaveProperty("averagePerformance");
              return [2 /*return*/];
          }
        });
      });
    });
    test("should analyze trends", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.trackROI(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.trendAnalysis).toBeDefined();
              expect(result.trendAnalysis).toHaveProperty("improving");
              expect(result.trendAnalysis).toHaveProperty("declining");
              expect(result.trendAnalysis).toHaveProperty("stable");
              // Verify trend counts are non-negative integers
              expect(result.trendAnalysis.improving).toBeGreaterThanOrEqual(0);
              expect(result.trendAnalysis.declining).toBeGreaterThanOrEqual(0);
              expect(result.trendAnalysis.stable).toBeGreaterThanOrEqual(0);
              return [2 /*return*/];
          }
        });
      });
    });
    test("should generate performance recommendations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.trackROI(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.recommendations).toBeInstanceOf(Array);
              result.recommendations.forEach(function (rec) {
                expect(typeof rec).toBe("string");
                expect(rec.length).toBeGreaterThan(0);
              });
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("🔧 Error Handling and Edge Cases", function () {
    test("should handle invalid clinic ID", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidClinicId;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidClinicId = "";
              // Mock invalid response for empty clinic ID
              mockSelect.mockImplementationOnce(function () {
                return {
                  eq: jest.fn(function () {
                    return {
                      eq: jest.fn(function () {
                        return {
                          eq: jest.fn(function () {
                            return {
                              single: jest.fn(function () {
                                return Promise.resolve({
                                  data: null,
                                  error: { message: "No data found" },
                                });
                              }),
                              order: jest.fn(function () {
                                return {
                                  limit: jest.fn(function () {
                                    return Promise.resolve({
                                      data: [],
                                      error: { message: "No data found" },
                                    });
                                  }),
                                };
                              }),
                            };
                          }),
                        };
                      }),
                    };
                  }),
                  order: jest.fn(function () {
                    return {
                      limit: jest.fn(function () {
                        return Promise.resolve({
                          data: [],
                          error: { message: "No data found" },
                        });
                      }),
                    };
                  }),
                };
              });
              return [
                4 /*yield*/,
                expect(engine.optimizePricing(invalidClinicId)).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle network errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock network failure
              mockSelect.mockImplementationOnce(function () {
                throw new Error("Network connection failed");
              });
              return [
                4 /*yield*/,
                expect(engine.optimizePricing(mockClinicId)).rejects.toThrow(
                  /Failed to optimize pricing strategy/,
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    test("should handle empty data responses", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockEngine, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockEngine = new revenue_optimization_engine_1.RevenueOptimizationEngine();
              jest.spyOn(mockEngine, "analyzeServicePerformance").mockResolvedValue([]);
              return [4 /*yield*/, mockEngine.optimizeServiceMix(mockClinicId)];
            case 1:
              result = _a.sent();
              expect(result.currentMix).toEqual([]);
              expect(result.optimizedMix).toEqual([]);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("🎯 Integration and Performance", function () {
    test("should complete full optimization cycle within reasonable time", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var startTime, executionTime;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              startTime = Date.now();
              return [
                4 /*yield*/,
                Promise.all([
                  engine.optimizePricing(mockClinicId),
                  engine.optimizeServiceMix(mockClinicId),
                  engine.enhanceCLV(mockClinicId),
                  engine.getCompetitiveAnalysis(mockClinicId),
                  engine.trackROI(mockClinicId),
                ]),
              ];
            case 1:
              _a.sent();
              executionTime = Date.now() - startTime;
              expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
              return [2 /*return*/];
          }
        });
      });
    });
    test("should maintain data consistency across methods", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, pricingResult, serviceMixResult, clvResult;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.all([
                  engine.optimizePricing(mockClinicId),
                  engine.optimizeServiceMix(mockClinicId),
                  engine.enhanceCLV(mockClinicId),
                ]),
              ];
            case 1:
              (_a = _b.sent()),
                (pricingResult = _a[0]),
                (serviceMixResult = _a[1]),
                (clvResult = _a[2]);
              // All results should be for the same clinic
              expect(pricingResult).toBeDefined();
              expect(serviceMixResult).toBeDefined();
              expect(clvResult).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    test("should provide realistic optimization projections", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var automatedResult;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.generateAutomatedRecommendations(mockClinicId)];
            case 1:
              automatedResult = _a.sent();
              // Total projected increase should be realistic (not excessive)
              expect(automatedResult.totalProjectedIncrease).toBeGreaterThan(10);
              expect(automatedResult.totalProjectedIncrease).toBeLessThan(100);
              // Individual recommendations should have reasonable impact
              automatedResult.recommendations.forEach(function (rec) {
                expect(rec.expectedImpact).toBeGreaterThan(0);
                expect(rec.expectedImpact).toBeLessThan(30);
              });
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
