"use strict";
/**
 * useVisionAnalysis Hook Tests
 *
 * Test suite for the useVisionAnalysis custom React hook
 * that manages computer vision analysis operations.
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
var react_1 = require("@testing-library/react");
var useVisionAnalysis_1 = require("@/hooks/useVisionAnalysis");
var sonner_1 = require("sonner");
// Mock dependencies
jest.mock("sonner", function () {
  return {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      loading: jest.fn(function () {
        return "toast-id";
      }),
      dismiss: jest.fn(),
    },
  };
});
// Mock fetch
global.fetch = jest.fn();
// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});
// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(function () {
  return "blob:mock-url";
});
global.URL.revokeObjectURL = jest.fn();
// Mock document.createElement for download
var mockAnchorElement = {
  href: "",
  download: "",
  click: jest.fn(),
  style: {},
};
jest.spyOn(document, "createElement").mockImplementation(function (tagName) {
  if (tagName === "a") {
    return mockAnchorElement;
  }
  return document.createElement(tagName);
});
jest.spyOn(document.body, "appendChild").mockImplementation(function () {
  return mockAnchorElement;
});
jest.spyOn(document.body, "removeChild").mockImplementation(function () {
  return mockAnchorElement;
});
var mockAnalysisResult = {
  id: "analysis-123",
  patientId: "patient-456",
  treatmentId: "treatment-789",
  beforeImageUrl: "/images/before.jpg",
  afterImageUrl: "/images/after.jpg",
  accuracyScore: 0.96,
  confidenceScore: 0.94,
  processingTime: 15000,
  improvementPercentage: 25.5,
  changeMetrics: {
    overallImprovement: 25.5,
    textureImprovement: 30.2,
    colorImprovement: 20.8,
    clarityImprovement: 28.1,
    symmetryImprovement: 22.3,
  },
  annotations: [],
  metadata: {
    modelVersion: "2.1.0",
    analysisDate: "2024-01-15T10:30:00Z",
  },
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
};
describe("useVisionAnalysis", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    fetch.mockClear();
  });
  it("should initialize with default state", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, useVisionAnalysis_1.useVisionAnalysis)();
    }).result;
    expect(result.current.currentAnalysis).toBeNull();
    expect(result.current.analysisHistory).toEqual([]);
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isExporting).toBe(false);
    expect(result.current.isSharing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.performanceMetrics).toEqual({
      averageAccuracy: 0,
      averageProcessingTime: 0,
      successRate: 0,
      totalAnalyses: 0,
    });
  });
  describe("startAnalysis", function () {
    it("should start analysis successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [
                        2 /*return*/,
                        {
                          success: true,
                          analysis: mockAnalysisResult,
                          performance: {
                            accuracyScore: 0.96,
                            processingTime: 15000,
                          },
                        },
                      ];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.startAnalysis({
                              patientId: "patient-456",
                              treatmentId: "treatment-789",
                              beforeImage: "base64-before-image",
                              afterImage: "base64-after-image",
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.currentAnalysis).toEqual(mockAnalysisResult);
              expect(result.current.isAnalyzing).toBe(false);
              expect(result.current.progress).toBe(100);
              expect(sonner_1.toast.success).toHaveBeenCalledWith(
                "Analysis completed successfully!",
              );
              return [2 /*return*/];
          }
        });
      });
    });
    it("should validate input parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.startAnalysis({
                              patientId: "",
                              treatmentId: "treatment-789",
                              beforeImage: "base64-before-image",
                              afterImage: "base64-after-image",
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Patient ID is required");
              expect(sonner_1.toast.error).toHaveBeenCalledWith("Patient ID is required");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle API errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: false,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [
                        2 /*return*/,
                        {
                          error: "Analysis failed",
                        },
                      ];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.startAnalysis({
                              patientId: "patient-456",
                              treatmentId: "treatment-789",
                              beforeImage: "base64-before-image",
                              afterImage: "base64-after-image",
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Analysis failed");
              expect(result.current.isAnalyzing).toBe(false);
              expect(sonner_1.toast.error).toHaveBeenCalledWith("Analysis failed");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should simulate progress during analysis", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockImplementation(function () {
                return new Promise(function (resolve) {
                  return setTimeout(function () {
                    return resolve({
                      ok: true,
                      json: function () {
                        return __awaiter(void 0, void 0, void 0, function () {
                          return __generator(this, function (_a) {
                            return [
                              2 /*return*/,
                              {
                                success: true,
                                analysis: mockAnalysisResult,
                              },
                            ];
                          });
                        });
                      },
                    });
                  }, 100);
                });
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              (0, react_1.act)(function () {
                result.current.startAnalysis({
                  patientId: "patient-456",
                  treatmentId: "treatment-789",
                  beforeImage: "base64-before-image",
                  afterImage: "base64-after-image",
                });
              });
              expect(result.current.isAnalyzing).toBe(true);
              expect(result.current.progress).toBeGreaterThan(0);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(result.current.isAnalyzing).toBe(false);
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("loadAnalysisHistory", function () {
    it("should load analysis history successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockHistory, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockHistory = [mockAnalysisResult];
              fetch.mockResolvedValueOnce({
                ok: true,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [
                        2 /*return*/,
                        {
                          analyses: mockHistory,
                          total: 1,
                        },
                      ];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.loadAnalysisHistory("patient-456")];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.analysisHistory).toEqual(mockHistory);
              expect(result.current.isLoading).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle loading errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockRejectedValueOnce(new Error("Network error"));
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.loadAnalysisHistory("patient-456")];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Failed to load analysis history");
              expect(sonner_1.toast.error).toHaveBeenCalledWith("Failed to load analysis history");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("exportAnalysis", function () {
    it("should export analysis as PDF successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockBlob, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockBlob = new Blob(["pdf content"], { type: "application/pdf" });
              fetch.mockResolvedValueOnce({
                ok: true,
                blob: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [2 /*return*/, mockBlob];
                    });
                  });
                },
                headers: {
                  get: function (name) {
                    if (name === "content-disposition") {
                      return 'attachment; filename="analysis-report.pdf"';
                    }
                    return null;
                  },
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.exportAnalysis("analysis-123", {
                              format: "pdf",
                              includeImages: true,
                              includeAnnotations: true,
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.isExporting).toBe(false);
              expect(mockAnchorElement.click).toHaveBeenCalled();
              expect(sonner_1.toast.success).toHaveBeenCalledWith(
                "Analysis exported successfully!",
              );
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle export errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: false,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [
                        2 /*return*/,
                        {
                          error: "Export failed",
                        },
                      ];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.exportAnalysis("analysis-123", {
                              format: "pdf",
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Export failed");
              expect(sonner_1.toast.error).toHaveBeenCalledWith("Export failed");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("shareAnalysis", function () {
    it("should share analysis successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [
                        2 /*return*/,
                        {
                          success: true,
                          shareUrl: "https://app.com/share/abc123",
                          shareId: "share-123",
                        },
                      ];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.shareAnalysis("analysis-123", {
                              shareType: "professional",
                              expiresIn: "7d",
                              includeImages: true,
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.isSharing).toBe(false);
              expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                "https://app.com/share/abc123",
              );
              expect(sonner_1.toast.success).toHaveBeenCalledWith(
                "Share link copied to clipboard!",
              );
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle share errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: false,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [
                        2 /*return*/,
                        {
                          error: "Share failed",
                        },
                      ];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.shareAnalysis("analysis-123", {
                              shareType: "public",
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Share failed");
              expect(sonner_1.toast.error).toHaveBeenCalledWith("Share failed");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("utility functions", function () {
    it("should clear current analysis", function () {
      var result = (0, react_1.renderHook)(function () {
        return (0, useVisionAnalysis_1.useVisionAnalysis)();
      }).result;
      // Set some analysis first
      (0, react_1.act)(function () {
        result.current.currentAnalysis = mockAnalysisResult;
      });
      (0, react_1.act)(function () {
        result.current.clearCurrentAnalysis();
      });
      expect(result.current.currentAnalysis).toBeNull();
    });
    it("should clear errors", function () {
      var result = (0, react_1.renderHook)(function () {
        return (0, useVisionAnalysis_1.useVisionAnalysis)();
      }).result;
      // Set an error first
      (0, react_1.act)(function () {
        result.current.error = "Test error";
      });
      (0, react_1.act)(function () {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });
  });
  describe("performance metrics", function () {
    it("should update performance metrics after successful analysis", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [
                        2 /*return*/,
                        {
                          success: true,
                          analysis: mockAnalysisResult,
                          performance: {
                            accuracyScore: 0.96,
                            processingTime: 15000,
                          },
                        },
                      ];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.startAnalysis({
                              patientId: "patient-456",
                              treatmentId: "treatment-789",
                              beforeImage: "base64-before-image",
                              afterImage: "base64-after-image",
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.performanceMetrics.totalAnalyses).toBe(1);
              expect(result.current.performanceMetrics.averageAccuracy).toBe(0.96);
              expect(result.current.performanceMetrics.averageProcessingTime).toBe(15000);
              expect(result.current.performanceMetrics.successRate).toBe(1);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle failed analyses in performance metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: false,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [
                        2 /*return*/,
                        {
                          error: "Analysis failed",
                        },
                      ];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, useVisionAnalysis_1.useVisionAnalysis)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.startAnalysis({
                              patientId: "patient-456",
                              treatmentId: "treatment-789",
                              beforeImage: "base64-before-image",
                              afterImage: "base64-after-image",
                            }),
                          ];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.performanceMetrics.totalAnalyses).toBe(1);
              expect(result.current.performanceMetrics.successRate).toBe(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
