// Vision Analysis Engine Tests
// Epic 10.1: Automated Before/After Analysis
// Target: ≥95% accuracy, <30s processing time

import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";
import * as tf from "@tensorflow/tfjs";
import { VisionAnalysisEngine } from "../../lib/vision/analysis-engine";
import { ANALYSIS_REQUIREMENTS } from "../../types/vision";

// Mock dependencies
jest.mock("@supabase/supabase-js");
jest.mock("@tensorflow/tfjs");

const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
    update: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  storage: {
    from: jest.fn(() => ({
      download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
    })),
  },
};

const mockModel = {
  predict: jest.fn().mockReturnValue({
    dataSync: () => new Float32Array([0.95, 0.85, 0.9, 0.88]),
  }),
  dispose: jest.fn(),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);
(tf.loadLayersModel as jest.Mock).mockResolvedValue(mockModel);
(tf.browser.fromPixels as jest.Mock).mockReturnValue({
  resizeNearestNeighbor: jest.fn().mockReturnValue({
    expandDims: jest.fn().mockReturnValue({
      div: jest.fn().mockReturnValue({
        dataSync: () => new Float32Array(224 * 224 * 3),
      }),
    }),
  }),
});

describe("VisionAnalysisEngine", () => {
  let engine: VisionAnalysisEngine;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Setup canvas mock
    mockCanvas = {
      getContext: jest.fn(),
      width: 224,
      height: 224,
    } as any;

    mockContext = {
      drawImage: jest.fn(),
      getImageData: jest.fn().mockReturnValue({
        data: new Uint8ClampedArray(224 * 224 * 4),
      }),
    } as any;

    mockCanvas.getContext = jest.fn().mockReturnValue(mockContext);

    // Setup document mock
    global.document = {
      createElement: jest.fn().mockReturnValue(mockCanvas),
    } as any;

    // Setup Image mock
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = "";
      width: number = 224;
      height: number = 224;

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;

    engine = new VisionAnalysisEngine();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with correct configuration", () => {
      expect(engine).toBeInstanceOf(VisionAnalysisEngine);
    });

    it("should load model successfully", async () => {
      await engine.initialize();
      expect(tf.loadLayersModel).toHaveBeenCalledWith("/models/vision-analysis-model.json");
    });

    it("should handle model loading errors", async () => {
      (tf.loadLayersModel as jest.Mock).mockRejectedValueOnce(new Error("Model not found"));

      await expect(engine.initialize()).rejects.toThrow("Model not found");
    });
  });

  describe("Image Analysis", () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it("should analyze before/after images successfully", async () => {
      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "skin-aesthetic" as const,
      };

      const result = await engine.analyzeImages(analysisRequest);

      expect(result).toBeDefined();
      expect(result.accuracy_score).toBeGreaterThanOrEqual(ANALYSIS_REQUIREMENTS.MIN_ACCURACY);
      expect(result.processing_time).toBeLessThanOrEqual(ANALYSIS_REQUIREMENTS.MAX_PROCESSING_TIME);
      expect(result.meets_accuracy_requirement).toBe(true);
      expect(result.meets_time_requirement).toBe(true);
    });

    it("should meet accuracy requirement (≥95%)", async () => {
      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "facial-rejuvenation" as const,
      };

      const result = await engine.analyzeImages(analysisRequest);

      expect(result.accuracy_score).toBeGreaterThanOrEqual(0.95);
      expect(result.meets_accuracy_requirement).toBe(true);
    });

    it("should meet processing time requirement (<30s)", async () => {
      const startTime = Date.now();

      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "scar-treatment" as const,
      };

      const result = await engine.analyzeImages(analysisRequest);
      const actualProcessingTime = Date.now() - startTime;

      expect(result.processing_time).toBeLessThanOrEqual(30000);
      expect(actualProcessingTime).toBeLessThanOrEqual(30000);
      expect(result.meets_time_requirement).toBe(true);
    });

    it("should generate comprehensive change metrics", async () => {
      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "pigmentation" as const,
      };

      const result = await engine.analyzeImages(analysisRequest);

      expect(result.change_metrics).toBeDefined();
      expect(result.change_metrics.overallImprovement).toBeGreaterThan(0);
      expect(result.change_metrics.skinTexture).toBeDefined();
      expect(result.change_metrics.pigmentationChange).toBeDefined();
    });

    it("should generate visual annotations", async () => {
      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "body-contouring" as const,
      };

      const result = await engine.analyzeImages(analysisRequest);

      expect(result.annotations).toBeDefined();
      expect(Array.isArray(result.annotations)).toBe(true);
      expect(result.annotations.length).toBeGreaterThan(0);

      result.annotations.forEach((annotation) => {
        expect(annotation.confidence_score).toBeGreaterThanOrEqual(0.8);
        expect(annotation.coordinates).toBeDefined();
        expect(Array.isArray(annotation.coordinates)).toBe(true);
      });
    });

    it("should handle invalid image data", async () => {
      mockSupabase.storage.from().download.mockResolvedValueOnce({
        data: null,
        error: { message: "Image not found" },
      });

      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "invalid-before",
        after_image_id: "after-789",
        treatment_type: "skin-aesthetic" as const,
      };

      await expect(engine.analyzeImages(analysisRequest)).rejects.toThrow(
        "Failed to load before image",
      );
    });

    it("should validate treatment type", async () => {
      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "invalid-treatment" as any,
      };

      await expect(engine.analyzeImages(analysisRequest)).rejects.toThrow("Invalid treatment type");
    });
  });

  describe("Change Metrics Calculation", () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it("should calculate skin texture improvements", async () => {
      const beforeFeatures = new Float32Array([0.6, 0.7, 0.5, 0.8]);
      const afterFeatures = new Float32Array([0.8, 0.9, 0.7, 0.9]);

      const metrics = engine.calculateChangeMetrics(
        beforeFeatures,
        afterFeatures,
        "skin-aesthetic",
      );

      expect(metrics.skinTexture).toBeDefined();
      expect(metrics.skinTexture?.improvement).toBeGreaterThan(0);
      expect(metrics.skinTexture?.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it("should calculate wrinkle reduction", async () => {
      const beforeFeatures = new Float32Array([0.8, 0.7, 0.9, 0.6]);
      const afterFeatures = new Float32Array([0.5, 0.4, 0.6, 0.3]);

      const metrics = engine.calculateChangeMetrics(
        beforeFeatures,
        afterFeatures,
        "facial-rejuvenation",
      );

      expect(metrics.wrinkleReduction).toBeDefined();
      expect(metrics.wrinkleReduction?.improvement).toBeGreaterThan(0);
    });

    it("should calculate scar healing progress", async () => {
      const beforeFeatures = new Float32Array([0.9, 0.8, 0.7, 0.8]);
      const afterFeatures = new Float32Array([0.4, 0.3, 0.2, 0.3]);

      const metrics = engine.calculateChangeMetrics(
        beforeFeatures,
        afterFeatures,
        "scar-treatment",
      );

      expect(metrics.scarHealing).toBeDefined();
      expect(metrics.scarHealing?.improvement).toBeGreaterThan(0);
    });

    it("should handle edge cases in metric calculation", async () => {
      const identicalFeatures = new Float32Array([0.5, 0.5, 0.5, 0.5]);

      const metrics = engine.calculateChangeMetrics(
        identicalFeatures,
        identicalFeatures,
        "skin-aesthetic",
      );

      expect(metrics.overallImprovement).toBe(0);
      expect(metrics.skinTexture?.improvement).toBe(0);
    });
  });

  describe("Annotation Generation", () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it("should generate measurement annotations", async () => {
      const features = new Float32Array([0.8, 0.9, 0.7, 0.85]);
      const analysisId = "analysis-123";

      const annotations = engine.generateAnnotations(features, analysisId, "skin-aesthetic");

      expect(annotations).toBeDefined();
      expect(Array.isArray(annotations)).toBe(true);

      const measurementAnnotations = annotations.filter((a) => a.annotation_type === "measurement");
      expect(measurementAnnotations.length).toBeGreaterThan(0);

      measurementAnnotations.forEach((annotation) => {
        expect(annotation.measurement_value).toBeDefined();
        expect(annotation.measurement_unit).toBeDefined();
        expect(annotation.confidence_score).toBeGreaterThanOrEqual(0.8);
      });
    });

    it("should generate highlight annotations for significant changes", async () => {
      const features = new Float32Array([0.95, 0.92, 0.88, 0.9]);
      const analysisId = "analysis-456";

      const annotations = engine.generateAnnotations(features, analysisId, "facial-rejuvenation");

      const highlightAnnotations = annotations.filter((a) => a.annotation_type === "highlight");
      expect(highlightAnnotations.length).toBeGreaterThan(0);

      highlightAnnotations.forEach((annotation) => {
        expect(annotation.description).toContain("improvement");
        expect(annotation.coordinates.length).toBeGreaterThan(0);
      });
    });

    it("should generate comparison annotations", async () => {
      const features = new Float32Array([0.85, 0.88, 0.82, 0.87]);
      const analysisId = "analysis-789";

      const annotations = engine.generateAnnotations(features, analysisId, "body-contouring");

      const comparisonAnnotations = annotations.filter((a) => a.annotation_type === "comparison");
      expect(comparisonAnnotations.length).toBeGreaterThan(0);
    });
  });

  describe("Database Integration", () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it("should save analysis results to database", async () => {
      const analysisData = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "skin-aesthetic" as const,
        accuracy_score: 0.96,
        processing_time: 25000,
        confidence: 0.92,
        improvement_percentage: 15.5,
        change_metrics: { overallImprovement: 15.5 },
        annotations: [],
      };

      await engine.saveAnalysisResults(analysisData);

      expect(mockSupabase.from).toHaveBeenCalledWith("image_analysis");
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          patient_id: "patient-123",
          accuracy_score: 0.96,
          processing_time: 25000,
        }),
      );
    });

    it("should save performance metrics", async () => {
      const performanceData = {
        analysis_id: "analysis-123",
        preprocessing_time: 5000,
        model_inference_time: 15000,
        postprocessing_time: 5000,
        total_processing_time: 25000,
        memory_usage_mb: 512,
        model_version: "1.0.0",
      };

      await engine.savePerformanceMetrics(performanceData);

      expect(mockSupabase.from).toHaveBeenCalledWith("analysis_performance");
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining(performanceData),
      );
    });

    it("should handle database errors gracefully", async () => {
      mockSupabase.from().insert.mockResolvedValueOnce({
        data: null,
        error: { message: "Database connection failed" },
      });

      const analysisData = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "skin-aesthetic" as const,
        accuracy_score: 0.96,
        processing_time: 25000,
        confidence: 0.92,
        improvement_percentage: 15.5,
        change_metrics: { overallImprovement: 15.5 },
        annotations: [],
      };

      await expect(engine.saveAnalysisResults(analysisData)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("Performance Requirements", () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it("should consistently meet accuracy requirements across multiple analyses", async () => {
      const analysisRequests = Array.from({ length: 10 }, (_, i) => ({
        patient_id: `patient-${i}`,
        before_image_id: `before-${i}`,
        after_image_id: `after-${i}`,
        treatment_type: "skin-aesthetic" as const,
      }));

      const results = await Promise.all(
        analysisRequests.map((request) => engine.analyzeImages(request)),
      );

      results.forEach((result) => {
        expect(result.accuracy_score).toBeGreaterThanOrEqual(0.95);
        expect(result.meets_accuracy_requirement).toBe(true);
      });

      const averageAccuracy =
        results.reduce((sum, r) => sum + r.accuracy_score, 0) / results.length;
      expect(averageAccuracy).toBeGreaterThanOrEqual(0.95);
    });

    it("should consistently meet processing time requirements", async () => {
      const analysisRequests = Array.from({ length: 5 }, (_, i) => ({
        patient_id: `patient-${i}`,
        before_image_id: `before-${i}`,
        after_image_id: `after-${i}`,
        treatment_type: "facial-rejuvenation" as const,
      }));

      const results = await Promise.all(
        analysisRequests.map((request) => engine.analyzeImages(request)),
      );

      results.forEach((result) => {
        expect(result.processing_time).toBeLessThanOrEqual(30000);
        expect(result.meets_time_requirement).toBe(true);
      });

      const averageProcessingTime =
        results.reduce((sum, r) => sum + r.processing_time, 0) / results.length;
      expect(averageProcessingTime).toBeLessThanOrEqual(30000);
    });
  });

  describe("Error Handling", () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it("should handle model prediction errors", async () => {
      mockModel.predict.mockImplementationOnce(() => {
        throw new Error("Model prediction failed");
      });

      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "skin-aesthetic" as const,
      };

      await expect(engine.analyzeImages(analysisRequest)).rejects.toThrow(
        "Model prediction failed",
      );
    });

    it("should handle image loading timeouts", async () => {
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src: string = "";

        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      } as any;

      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "skin-aesthetic" as const,
      };

      await expect(engine.analyzeImages(analysisRequest)).rejects.toThrow(
        "Failed to load before image",
      );
    });

    it("should validate input parameters", async () => {
      const invalidRequest = {
        patient_id: "",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "skin-aesthetic" as const,
      };

      await expect(engine.analyzeImages(invalidRequest)).rejects.toThrow("Patient ID is required");
    });
  });

  describe("Memory Management", () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it("should dispose of tensors after analysis", async () => {
      const analysisRequest = {
        patient_id: "patient-123",
        before_image_id: "before-456",
        after_image_id: "after-789",
        treatment_type: "skin-aesthetic" as const,
      };

      await engine.analyzeImages(analysisRequest);

      // Verify that tensors are properly disposed
      // This would be implementation-specific based on how tensors are managed
      expect(tf.memory().numTensors).toBeLessThanOrEqual(10); // Reasonable threshold
    });

    it("should handle cleanup on engine disposal", async () => {
      await engine.dispose();
      expect(mockModel.dispose).toHaveBeenCalled();
    });
  });
});
