/**
 * useVisionConfig Hook Tests
 *
 * Test suite for the useVisionConfig custom React hook
 * that manages computer vision analysis configuration and user preferences.
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var useVisionConfig_1 = require("@/hooks/useVisionConfig");
var sonner_1 = require("sonner");
// Mock dependencies
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));
// Mock fetch
global.fetch = jest.fn();
var mockDefaultConfig = {
  analysisThresholds: {
    accuracyThreshold: 0.85,
    confidenceThreshold: 0.8,
    processingTimeLimit: 30000,
  },
  imageProcessing: {
    maxImageSize: 5242880, // 5MB
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    autoResize: true,
    compressionQuality: 0.8,
  },
  notifications: {
    analysisComplete: true,
    lowAccuracyWarning: true,
    processingTimeWarning: true,
    emailNotifications: false,
  },
  export: {
    defaultFormat: "pdf",
    includeImages: true,
    includeAnnotations: true,
    includeMetrics: true,
  },
  privacy: {
    shareByDefault: false,
    allowPublicSharing: false,
    dataRetentionDays: 365,
  },
  advanced: {
    enableDebugMode: false,
    customModelEndpoint: "",
    batchProcessing: false,
    parallelAnalysis: true,
  },
};
var mockUserConfig = __assign(__assign({}, mockDefaultConfig), {
  analysisThresholds: __assign(__assign({}, mockDefaultConfig.analysisThresholds), {
    accuracyThreshold: 0.9,
  }),
  notifications: __assign(__assign({}, mockDefaultConfig.notifications), {
    emailNotifications: true,
  }),
});
describe("useVisionConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });
  it("should initialize with default state", () => {
    var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
    expect(result.current.config).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.error).toBeNull();
  });
  describe("loadConfig", () => {
    it("should load user configuration successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        config: mockUserConfig,
                        isDefault: false,
                      },
                    ]);
                  }),
              });
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.loadConfig()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(result.current.config).toEqual(mockUserConfig);
              expect(result.current.isLoading).toBe(false);
              expect(result.current.error).toBeNull();
              return [2 /*return*/];
          }
        });
      }));
    it("should load default configuration when user config not found", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        config: mockDefaultConfig,
                        isDefault: true,
                      },
                    ]);
                  }),
              });
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.loadConfig()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(result.current.config).toEqual(mockDefaultConfig);
              expect(sonner_1.toast.info).toHaveBeenCalledWith("Using default configuration");
              return [2 /*return*/];
          }
        });
      }));
    it("should handle loading errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              fetch.mockRejectedValueOnce(new Error("Network error"));
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.loadConfig()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Failed to load configuration");
              expect(result.current.isLoading).toBe(false);
              expect(sonner_1.toast.error).toHaveBeenCalledWith("Failed to load configuration");
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("updateConfig", () => {
    it("should update configuration and mark as unsaved", () => {
      var _a;
      var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
      // Set initial config
      (0, react_1.act)(() => {
        result.current.config = mockDefaultConfig;
      });
      var updates = {
        analysisThresholds: __assign(__assign({}, mockDefaultConfig.analysisThresholds), {
          accuracyThreshold: 0.9,
        }),
      };
      (0, react_1.act)(() => {
        result.current.updateConfig(updates);
      });
      expect(
        (_a = result.current.config) === null || _a === void 0
          ? void 0
          : _a.analysisThresholds.accuracyThreshold,
      ).toBe(0.9);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
    it("should handle nested configuration updates", () => {
      var _a, _b;
      var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
      // Set initial config
      (0, react_1.act)(() => {
        result.current.config = mockDefaultConfig;
      });
      (0, react_1.act)(() => {
        result.current.updateConfig({
          notifications: __assign(__assign({}, mockDefaultConfig.notifications), {
            emailNotifications: true,
            analysisComplete: false,
          }),
        });
      });
      expect(
        (_a = result.current.config) === null || _a === void 0
          ? void 0
          : _a.notifications.emailNotifications,
      ).toBe(true);
      expect(
        (_b = result.current.config) === null || _b === void 0
          ? void 0
          : _b.notifications.analysisComplete,
      ).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });
  describe("saveConfig", () => {
    it("should save configuration successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        success: true,
                        config: mockUserConfig,
                      },
                    ]);
                  }),
              });
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              // Set config with changes
              (0, react_1.act)(() => {
                result.current.config = mockUserConfig;
                result.current.hasUnsavedChanges = true;
              });
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.saveConfig()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(result.current.isSaving).toBe(false);
              expect(result.current.hasUnsavedChanges).toBe(false);
              expect(sonner_1.toast.success).toHaveBeenCalledWith(
                "Configuration saved successfully!",
              );
              return [2 /*return*/];
          }
        });
      }));
    it("should handle save errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: false,
                json: () =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        error: "Validation failed",
                      },
                    ]);
                  }),
              });
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              // Set config with changes
              (0, react_1.act)(() => {
                result.current.config = mockUserConfig;
                result.current.hasUnsavedChanges = true;
              });
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.saveConfig()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Validation failed");
              expect(result.current.isSaving).toBe(false);
              expect(result.current.hasUnsavedChanges).toBe(true);
              expect(sonner_1.toast.error).toHaveBeenCalledWith("Validation failed");
              return [2 /*return*/];
          }
        });
      }));
    it("should not save when no config is loaded", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.saveConfig()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(fetch).not.toHaveBeenCalled();
              expect(sonner_1.toast.error).toHaveBeenCalledWith("No configuration to save");
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("resetToDefaults", () => {
    it("should reset configuration to defaults successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        success: true,
                        config: mockDefaultConfig,
                      },
                    ]);
                  }),
              });
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              // Set custom config first
              (0, react_1.act)(() => {
                result.current.config = mockUserConfig;
              });
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.resetToDefaults()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(result.current.config).toEqual(mockDefaultConfig);
              expect(result.current.hasUnsavedChanges).toBe(false);
              expect(sonner_1.toast.success).toHaveBeenCalledWith(
                "Configuration reset to defaults",
              );
              return [2 /*return*/];
          }
        });
      }));
    it("should handle reset errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: false,
                json: () =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        error: "Reset failed",
                      },
                    ]);
                  }),
              });
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.resetToDefaults()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Reset failed");
              expect(sonner_1.toast.error).toHaveBeenCalledWith("Reset failed");
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("discardChanges", () => {
    it("should discard unsaved changes and reload config", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        config: mockDefaultConfig,
                        isDefault: false,
                      },
                    ]);
                  }),
              });
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              // Set config with changes
              (0, react_1.act)(() => {
                result.current.config = __assign(__assign({}, mockDefaultConfig), {
                  analysisThresholds: __assign(__assign({}, mockDefaultConfig.analysisThresholds), {
                    accuracyThreshold: 0.95, // Modified value
                  }),
                });
                result.current.hasUnsavedChanges = true;
              });
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.discardChanges()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(result.current.config).toEqual(mockDefaultConfig);
              expect(result.current.hasUnsavedChanges).toBe(false);
              expect(sonner_1.toast.info).toHaveBeenCalledWith("Changes discarded");
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("validation", () => {
    it("should validate accuracy threshold range", () => {
      var _a;
      var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
      (0, react_1.act)(() => {
        result.current.config = mockDefaultConfig;
      });
      // Test invalid accuracy threshold
      (0, react_1.act)(() => {
        result.current.updateConfig({
          analysisThresholds: __assign(__assign({}, mockDefaultConfig.analysisThresholds), {
            accuracyThreshold: 1.5, // Invalid: > 1.0
          }),
        });
      });
      // Should clamp to valid range
      expect(
        (_a = result.current.config) === null || _a === void 0
          ? void 0
          : _a.analysisThresholds.accuracyThreshold,
      ).toBe(1.0);
    });
    it("should validate processing time limit", () => {
      var _a;
      var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
      (0, react_1.act)(() => {
        result.current.config = mockDefaultConfig;
      });
      // Test invalid processing time
      (0, react_1.act)(() => {
        result.current.updateConfig({
          analysisThresholds: __assign(__assign({}, mockDefaultConfig.analysisThresholds), {
            processingTimeLimit: -1000, // Invalid: negative
          }),
        });
      });
      // Should clamp to minimum value
      expect(
        (_a = result.current.config) === null || _a === void 0
          ? void 0
          : _a.analysisThresholds.processingTimeLimit,
      ).toBe(1000);
    });
    it("should validate image size limits", () => {
      var _a;
      var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
      (0, react_1.act)(() => {
        result.current.config = mockDefaultConfig;
      });
      // Test invalid image size
      (0, react_1.act)(() => {
        result.current.updateConfig({
          imageProcessing: __assign(__assign({}, mockDefaultConfig.imageProcessing), {
            maxImageSize: 50 * 1024 * 1024, // 50MB - too large
          }),
        });
      });
      // Should clamp to maximum allowed
      expect(
        (_a = result.current.config) === null || _a === void 0
          ? void 0
          : _a.imageProcessing.maxImageSize,
      ).toBe(20 * 1024 * 1024); // 20MB max
    });
  });
  describe("configuration presets", () => {
    it("should apply conservative preset", () => {
      var _a, _b;
      var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
      (0, react_1.act)(() => {
        result.current.config = mockDefaultConfig;
      });
      (0, react_1.act)(() => {
        result.current.applyPreset("conservative");
      });
      expect(
        (_a = result.current.config) === null || _a === void 0
          ? void 0
          : _a.analysisThresholds.accuracyThreshold,
      ).toBe(0.95);
      expect(
        (_b = result.current.config) === null || _b === void 0
          ? void 0
          : _b.analysisThresholds.confidenceThreshold,
      ).toBe(0.9);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
    it("should apply performance preset", () => {
      var _a, _b, _c;
      var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
      (0, react_1.act)(() => {
        result.current.config = mockDefaultConfig;
      });
      (0, react_1.act)(() => {
        result.current.applyPreset("performance");
      });
      expect(
        (_a = result.current.config) === null || _a === void 0
          ? void 0
          : _a.analysisThresholds.processingTimeLimit,
      ).toBe(15000);
      expect(
        (_b = result.current.config) === null || _b === void 0
          ? void 0
          : _b.imageProcessing.compressionQuality,
      ).toBe(0.6);
      expect(
        (_c = result.current.config) === null || _c === void 0
          ? void 0
          : _c.advanced.parallelAnalysis,
      ).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
    it("should apply balanced preset", () => {
      var _a, _b, _c;
      var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
      (0, react_1.act)(() => {
        result.current.config = mockDefaultConfig;
      });
      (0, react_1.act)(() => {
        result.current.applyPreset("balanced");
      });
      expect(
        (_a = result.current.config) === null || _a === void 0
          ? void 0
          : _a.analysisThresholds.accuracyThreshold,
      ).toBe(0.85);
      expect(
        (_b = result.current.config) === null || _b === void 0
          ? void 0
          : _b.analysisThresholds.confidenceThreshold,
      ).toBe(0.8);
      expect(
        (_c = result.current.config) === null || _c === void 0
          ? void 0
          : _c.analysisThresholds.processingTimeLimit,
      ).toBe(30000);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });
  describe("error handling", () => {
    it("should clear errors when updating config", () => {
      var result = (0, react_1.renderHook)(() => (0, useVisionConfig_1.useVisionConfig)()).result;
      // Set an error
      (0, react_1.act)(() => {
        result.current.error = "Test error";
        result.current.config = mockDefaultConfig;
      });
      // Update config should clear error
      (0, react_1.act)(() => {
        result.current.updateConfig({
          notifications: __assign(__assign({}, mockDefaultConfig.notifications), {
            emailNotifications: true,
          }),
        });
      });
      expect(result.current.error).toBeNull();
    });
    it("should handle network errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              fetch.mockRejectedValueOnce(new Error("Network error"));
              result = (0, react_1.renderHook)(() =>
                (0, useVisionConfig_1.useVisionConfig)(),
              ).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.loadConfig()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Failed to load configuration");
              expect(result.current.config).toBeNull();
              return [2 /*return*/];
          }
        });
      }));
  });
});
