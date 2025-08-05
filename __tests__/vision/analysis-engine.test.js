// Vision Analysis Engine Tests
// Epic 10.1: Automated Before/After Analysis
// Target: ≥95% accuracy, <30s processing time
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
var globals_1 = require("@jest/globals");
var analysis_engine_1 = require("../../lib/vision/analysis-engine");
var supabase_js_1 = require("@supabase/supabase-js");
var tf = require("@tensorflow/tfjs");
var vision_1 = require("../../types/vision");
// Mock dependencies
globals_1.jest.mock("@supabase/supabase-js");
globals_1.jest.mock("@tensorflow/tfjs");
var mockSupabase = {
  from: globals_1.jest.fn(() => ({
    insert: globals_1.jest.fn().mockResolvedValue({ data: null, error: null }),
    select: globals_1.jest.fn().mockResolvedValue({ data: [], error: null }),
    update: globals_1.jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  storage: {
    from: globals_1.jest.fn(() => ({
      download: globals_1.jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
    })),
  },
};
var mockModel = {
  predict: globals_1.jest.fn().mockReturnValue({
    dataSync: () => new Float32Array([0.95, 0.85, 0.9, 0.88]),
  }),
  dispose: globals_1.jest.fn(),
};
supabase_js_1.createClient.mockReturnValue(mockSupabase);
tf.loadLayersModel.mockResolvedValue(mockModel);
tf.browser.fromPixels.mockReturnValue({
  resizeNearestNeighbor: globals_1.jest.fn().mockReturnValue({
    expandDims: globals_1.jest.fn().mockReturnValue({
      div: globals_1.jest.fn().mockReturnValue({
        dataSync: () => new Float32Array(224 * 224 * 3),
      }),
    }),
  }),
});
(0, globals_1.describe)("VisionAnalysisEngine", () => {
  var engine;
  var mockCanvas;
  var mockContext;
  (0, globals_1.beforeEach)(() => {
    // Setup canvas mock
    mockCanvas = {
      getContext: globals_1.jest.fn(),
      width: 224,
      height: 224,
    };
    mockContext = {
      drawImage: globals_1.jest.fn(),
      getImageData: globals_1.jest.fn().mockReturnValue({
        data: new Uint8ClampedArray(224 * 224 * 4),
      }),
    };
    mockCanvas.getContext = globals_1.jest.fn().mockReturnValue(mockContext);
    // Setup document mock
    global.document = {
      createElement: globals_1.jest.fn().mockReturnValue(mockCanvas),
    };
    // Setup Image mock
    global.Image = /** @class */ (() => {
      function class_1() {
        this.onload = null;
        this.onerror = null;
        this.src = "";
        this.width = 224;
        this.height = 224;
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
      return class_1;
    })();
    engine = new analysis_engine_1.VisionAnalysisEngine();
  });
  (0, globals_1.afterEach)(() => {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("Initialization", () => {
    (0, globals_1.it)("should initialize with correct configuration", () => {
      (0, globals_1.expect)(engine).toBeInstanceOf(analysis_engine_1.VisionAnalysisEngine);
    });
    (0, globals_1.it)("should load model successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.initialize()];
            case 1:
              _a.sent();
              (0, globals_1.expect)(tf.loadLayersModel).toHaveBeenCalledWith(
                "/models/vision-analysis-model.json",
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle model loading errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              tf.loadLayersModel.mockRejectedValueOnce(new Error("Model not found"));
              return [
                4 /*yield*/,
                (0, globals_1.expect)(engine.initialize()).rejects.toThrow("Model not found"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Image Analysis", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should analyze before/after images successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequest, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "skin-aesthetic",
              };
              return [4 /*yield*/, engine.analyzeImages(analysisRequest)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result).toBeDefined();
              (0, globals_1.expect)(result.accuracy_score).toBeGreaterThanOrEqual(
                vision_1.ANALYSIS_REQUIREMENTS.MIN_ACCURACY,
              );
              (0, globals_1.expect)(result.processing_time).toBeLessThanOrEqual(
                vision_1.ANALYSIS_REQUIREMENTS.MAX_PROCESSING_TIME,
              );
              (0, globals_1.expect)(result.meets_accuracy_requirement).toBe(true);
              (0, globals_1.expect)(result.meets_time_requirement).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should meet accuracy requirement (≥95%)", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequest, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "facial-rejuvenation",
              };
              return [4 /*yield*/, engine.analyzeImages(analysisRequest)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.accuracy_score).toBeGreaterThanOrEqual(0.95);
              (0, globals_1.expect)(result.meets_accuracy_requirement).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should meet processing time requirement (<30s)", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var startTime, analysisRequest, result, actualProcessingTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              startTime = Date.now();
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "scar-treatment",
              };
              return [4 /*yield*/, engine.analyzeImages(analysisRequest)];
            case 1:
              result = _a.sent();
              actualProcessingTime = Date.now() - startTime;
              (0, globals_1.expect)(result.processing_time).toBeLessThanOrEqual(30000);
              (0, globals_1.expect)(actualProcessingTime).toBeLessThanOrEqual(30000);
              (0, globals_1.expect)(result.meets_time_requirement).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should generate comprehensive change metrics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequest, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "pigmentation",
              };
              return [4 /*yield*/, engine.analyzeImages(analysisRequest)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.change_metrics).toBeDefined();
              (0, globals_1.expect)(result.change_metrics.overallImprovement).toBeGreaterThan(0);
              (0, globals_1.expect)(result.change_metrics.skinTexture).toBeDefined();
              (0, globals_1.expect)(result.change_metrics.pigmentationChange).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should generate visual annotations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequest, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "body-contouring",
              };
              return [4 /*yield*/, engine.analyzeImages(analysisRequest)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.annotations).toBeDefined();
              (0, globals_1.expect)(Array.isArray(result.annotations)).toBe(true);
              (0, globals_1.expect)(result.annotations.length).toBeGreaterThan(0);
              result.annotations.forEach((annotation) => {
                (0, globals_1.expect)(annotation.confidence_score).toBeGreaterThanOrEqual(0.8);
                (0, globals_1.expect)(annotation.coordinates).toBeDefined();
                (0, globals_1.expect)(Array.isArray(annotation.coordinates)).toBe(true);
              });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle invalid image data", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.storage.from().download.mockResolvedValueOnce({
                data: null,
                error: { message: "Image not found" },
              });
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "invalid-before",
                after_image_id: "after-789",
                treatment_type: "skin-aesthetic",
              };
              return [
                4 /*yield*/,
                (0, globals_1.expect)(engine.analyzeImages(analysisRequest)).rejects.toThrow(
                  "Failed to load before image",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should validate treatment type", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "invalid-treatment",
              };
              return [
                4 /*yield*/,
                (0, globals_1.expect)(engine.analyzeImages(analysisRequest)).rejects.toThrow(
                  "Invalid treatment type",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Change Metrics Calculation", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should calculate skin texture improvements", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var beforeFeatures, afterFeatures, metrics;
        return __generator(this, (_a) => {
          beforeFeatures = new Float32Array([0.6, 0.7, 0.5, 0.8]);
          afterFeatures = new Float32Array([0.8, 0.9, 0.7, 0.9]);
          metrics = engine.calculateChangeMetrics(beforeFeatures, afterFeatures, "skin-aesthetic");
          (0, globals_1.expect)(metrics.skinTexture).toBeDefined();
          (0, globals_1.expect)(metrics.skinTexture.improvement).toBeGreaterThan(0);
          (0, globals_1.expect)(metrics.skinTexture.confidence).toBeGreaterThanOrEqual(0.8);
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should calculate wrinkle reduction", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var beforeFeatures, afterFeatures, metrics;
        return __generator(this, (_a) => {
          beforeFeatures = new Float32Array([0.8, 0.7, 0.9, 0.6]);
          afterFeatures = new Float32Array([0.5, 0.4, 0.6, 0.3]);
          metrics = engine.calculateChangeMetrics(
            beforeFeatures,
            afterFeatures,
            "facial-rejuvenation",
          );
          (0, globals_1.expect)(metrics.wrinkleReduction).toBeDefined();
          (0, globals_1.expect)(metrics.wrinkleReduction.improvement).toBeGreaterThan(0);
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should calculate scar healing progress", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var beforeFeatures, afterFeatures, metrics;
        return __generator(this, (_a) => {
          beforeFeatures = new Float32Array([0.9, 0.8, 0.7, 0.8]);
          afterFeatures = new Float32Array([0.4, 0.3, 0.2, 0.3]);
          metrics = engine.calculateChangeMetrics(beforeFeatures, afterFeatures, "scar-treatment");
          (0, globals_1.expect)(metrics.scarHealing).toBeDefined();
          (0, globals_1.expect)(metrics.scarHealing.improvement).toBeGreaterThan(0);
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should handle edge cases in metric calculation", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var identicalFeatures, metrics;
        return __generator(this, (_a) => {
          identicalFeatures = new Float32Array([0.5, 0.5, 0.5, 0.5]);
          metrics = engine.calculateChangeMetrics(
            identicalFeatures,
            identicalFeatures,
            "skin-aesthetic",
          );
          (0, globals_1.expect)(metrics.overallImprovement).toBe(0);
          (0, globals_1.expect)(metrics.skinTexture.improvement).toBe(0);
          return [2 /*return*/];
        });
      }),
    );
  });
  (0, globals_1.describe)("Annotation Generation", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should generate measurement annotations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var features, analysisId, annotations, measurementAnnotations;
        return __generator(this, (_a) => {
          features = new Float32Array([0.8, 0.9, 0.7, 0.85]);
          analysisId = "analysis-123";
          annotations = engine.generateAnnotations(features, analysisId, "skin-aesthetic");
          (0, globals_1.expect)(annotations).toBeDefined();
          (0, globals_1.expect)(Array.isArray(annotations)).toBe(true);
          measurementAnnotations = annotations.filter((a) => a.annotation_type === "measurement");
          (0, globals_1.expect)(measurementAnnotations.length).toBeGreaterThan(0);
          measurementAnnotations.forEach((annotation) => {
            (0, globals_1.expect)(annotation.measurement_value).toBeDefined();
            (0, globals_1.expect)(annotation.measurement_unit).toBeDefined();
            (0, globals_1.expect)(annotation.confidence_score).toBeGreaterThanOrEqual(0.8);
          });
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should generate highlight annotations for significant changes", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var features, analysisId, annotations, highlightAnnotations;
        return __generator(this, (_a) => {
          features = new Float32Array([0.95, 0.92, 0.88, 0.9]);
          analysisId = "analysis-456";
          annotations = engine.generateAnnotations(features, analysisId, "facial-rejuvenation");
          highlightAnnotations = annotations.filter((a) => a.annotation_type === "highlight");
          (0, globals_1.expect)(highlightAnnotations.length).toBeGreaterThan(0);
          highlightAnnotations.forEach((annotation) => {
            (0, globals_1.expect)(annotation.description).toContain("improvement");
            (0, globals_1.expect)(annotation.coordinates.length).toBeGreaterThan(0);
          });
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should generate comparison annotations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var features, analysisId, annotations, comparisonAnnotations;
        return __generator(this, (_a) => {
          features = new Float32Array([0.85, 0.88, 0.82, 0.87]);
          analysisId = "analysis-789";
          annotations = engine.generateAnnotations(features, analysisId, "body-contouring");
          comparisonAnnotations = annotations.filter((a) => a.annotation_type === "comparison");
          (0, globals_1.expect)(comparisonAnnotations.length).toBeGreaterThan(0);
          return [2 /*return*/];
        });
      }),
    );
  });
  (0, globals_1.describe)("Database Integration", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should save analysis results to database", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisData;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              analysisData = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "skin-aesthetic",
                accuracy_score: 0.96,
                processing_time: 25000,
                confidence: 0.92,
                improvement_percentage: 15.5,
                change_metrics: { overallImprovement: 15.5 },
                annotations: [],
              };
              return [4 /*yield*/, engine.saveAnalysisResults(analysisData)];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("image_analysis");
              (0, globals_1.expect)(mockSupabase.from().insert).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  patient_id: "patient-123",
                  accuracy_score: 0.96,
                  processing_time: 25000,
                }),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should save performance metrics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var performanceData;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              performanceData = {
                analysis_id: "analysis-123",
                preprocessing_time: 5000,
                model_inference_time: 15000,
                postprocessing_time: 5000,
                total_processing_time: 25000,
                memory_usage_mb: 512,
                model_version: "1.0.0",
              };
              return [4 /*yield*/, engine.savePerformanceMetrics(performanceData)];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("analysis_performance");
              (0, globals_1.expect)(mockSupabase.from().insert).toHaveBeenCalledWith(
                globals_1.expect.objectContaining(performanceData),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle database errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisData;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.from().insert.mockResolvedValueOnce({
                data: null,
                error: { message: "Database connection failed" },
              });
              analysisData = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "skin-aesthetic",
                accuracy_score: 0.96,
                processing_time: 25000,
                confidence: 0.92,
                improvement_percentage: 15.5,
                change_metrics: { overallImprovement: 15.5 },
                annotations: [],
              };
              return [
                4 /*yield*/,
                (0, globals_1.expect)(engine.saveAnalysisResults(analysisData)).rejects.toThrow(
                  "Database connection failed",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Performance Requirements", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)(
      "should consistently meet accuracy requirements across multiple analyses",
      () =>
        __awaiter(void 0, void 0, void 0, function () {
          var analysisRequests, results, averageAccuracy;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                analysisRequests = Array.from({ length: 10 }, (_, i) => ({
                  patient_id: "patient-".concat(i),
                  before_image_id: "before-".concat(i),
                  after_image_id: "after-".concat(i),
                  treatment_type: "skin-aesthetic",
                }));
                return [
                  4 /*yield*/,
                  Promise.all(analysisRequests.map((request) => engine.analyzeImages(request))),
                ];
              case 1:
                results = _a.sent();
                results.forEach((result) => {
                  (0, globals_1.expect)(result.accuracy_score).toBeGreaterThanOrEqual(0.95);
                  (0, globals_1.expect)(result.meets_accuracy_requirement).toBe(true);
                });
                averageAccuracy =
                  results.reduce((sum, r) => sum + r.accuracy_score, 0) / results.length;
                (0, globals_1.expect)(averageAccuracy).toBeGreaterThanOrEqual(0.95);
                return [2 /*return*/];
            }
          });
        }),
    );
    (0, globals_1.it)("should consistently meet processing time requirements", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequests, results, averageProcessingTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              analysisRequests = Array.from({ length: 5 }, (_, i) => ({
                patient_id: "patient-".concat(i),
                before_image_id: "before-".concat(i),
                after_image_id: "after-".concat(i),
                treatment_type: "facial-rejuvenation",
              }));
              return [
                4 /*yield*/,
                Promise.all(analysisRequests.map((request) => engine.analyzeImages(request))),
              ];
            case 1:
              results = _a.sent();
              results.forEach((result) => {
                (0, globals_1.expect)(result.processing_time).toBeLessThanOrEqual(30000);
                (0, globals_1.expect)(result.meets_time_requirement).toBe(true);
              });
              averageProcessingTime =
                results.reduce((sum, r) => sum + r.processing_time, 0) / results.length;
              (0, globals_1.expect)(averageProcessingTime).toBeLessThanOrEqual(30000);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Error Handling", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle model prediction errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockModel.predict.mockImplementationOnce(() => {
                throw new Error("Model prediction failed");
              });
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "skin-aesthetic",
              };
              return [
                4 /*yield*/,
                (0, globals_1.expect)(engine.analyzeImages(analysisRequest)).rejects.toThrow(
                  "Model prediction failed",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle image loading timeouts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              global.Image = /** @class */ (() => {
                function class_2() {
                  this.onload = null;
                  this.onerror = null;
                  this.src = "";
                  setTimeout(() => {
                    if (this.onerror) this.onerror();
                  }, 0);
                }
                return class_2;
              })();
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "skin-aesthetic",
              };
              return [
                4 /*yield*/,
                (0, globals_1.expect)(engine.analyzeImages(analysisRequest)).rejects.toThrow(
                  "Failed to load before image",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should validate input parameters", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidRequest = {
                patient_id: "",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "skin-aesthetic",
              };
              return [
                4 /*yield*/,
                (0, globals_1.expect)(engine.analyzeImages(invalidRequest)).rejects.toThrow(
                  "Patient ID is required",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Memory Management", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.initialize()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should dispose of tensors after analysis", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analysisRequest;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              analysisRequest = {
                patient_id: "patient-123",
                before_image_id: "before-456",
                after_image_id: "after-789",
                treatment_type: "skin-aesthetic",
              };
              return [4 /*yield*/, engine.analyzeImages(analysisRequest)];
            case 1:
              _a.sent();
              // Verify that tensors are properly disposed
              // This would be implementation-specific based on how tensors are managed
              (0, globals_1.expect)(tf.memory().numTensors).toBeLessThanOrEqual(10); // Reasonable threshold
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle cleanup on engine disposal", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, engine.dispose()];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockModel.dispose).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
