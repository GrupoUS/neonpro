/**
 * PredictiveModelsService unit tests
 *
 * Testing library/framework: Vitest (preferred). If this repo uses Jest, replace "vitest" imports with Jest globals.
 *
 * Focus: Validate behavior of PredictiveModelsService public interfaces and critical private logic paths
 * - predictPatientOutcome (happy path and failure)
 * - getAvailableModels, getModelMetrics, retrainModel
 * - predictNoShowProbability edge behavior when model missing
 * - generateTreatmentTimeline deterministic calculation (via private access)
 *
 * Notes:
 * - We stub randomness (Math.random) and time-sensitive helpers to ensure determinism.
 * - We access private methods/properties via type casting to unknown; TS privacy is compile-time only.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Import the module under test. Adjust the import if the source file path differs.
import { PredictiveModelsService } from "./predictive-models";

describe("PredictiveModelsService", () => {
  let service: PredictiveModelsService;

  beforeEach(() => {
    service = new PredictiveModelsService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAvailableModels()", () => {
    it("returns a non-empty list with expected computed metrics", () => {
      const models = service.getAvailableModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThanOrEqual(3);

      // Find a known model and verify computed fields exist and make sense
      const outcome = models.find((m) => m.id === "neonpro-outcome-predictor-v2.1");
      expect(outcome).toBeTruthy();
      expect(outcome?.name).toBe("NeonPro Outcome Predictor");
      expect(outcome?.version).toBe("2.1");
      expect(outcome?.precision).toBeCloseTo((outcome?.accuracy ?? 0) * 0.95, 6);
      expect(outcome?.recall).toBeCloseTo((outcome?.accuracy ?? 0) * 0.92, 6);
      expect(outcome?.f1Score).toBeCloseTo((outcome?.accuracy ?? 0) * 0.93, 6);
      expect(outcome?.trainingDate).toBeInstanceOf(Date);
      expect(outcome?.deploymentDate).toBeInstanceOf(Date);
      expect(outcome?.lastRetraining).toBeInstanceOf(Date);
      expect(outcome?.validationMetrics?.auc).toBeCloseTo(outcome?.accuracy ?? 0, 6);
    });
  });

  describe("getModelMetrics()", () => {
    it("returns metrics object when model exists", () => {
      const metrics = service.getModelMetrics("neonpro-complication-detector-v1.3");
      expect(metrics).toBeTruthy();
      expect(metrics!.accuracy).toBeGreaterThan(0.5);
      expect(metrics!.precision).toBeGreaterThan(0.5);
      expect(metrics!.recall).toBeGreaterThan(0.5);
      expect(metrics!.f1Score).toBeGreaterThan(0.5);
      expect(metrics!.lastUpdated).toBeInstanceOf(Date);
    });

    it("returns null for unknown model", () => {
      const metrics = service.getModelMetrics("does-not-exist");
      expect(metrics).toBeNull();
    });
  });

  describe("retrainModel()", () => {
    it("updates lastRetraining, increases trainingDataSize, and slightly improves accuracy", async () => {
      const id = "neonpro-no-show-predictor-v1.5";
      const before = (service as unknown).models.get(id);
      expect(before).toBeDefined();
      const origSize = before.trainingDataSize;
      const origAcc = before.accuracy;

      const ok = await service.retrainModel(id, [{ x: 1 }, { x: 2 }, { x: 3 }]);
      expect(ok).toBe(true);

      const after = (service as unknown).models.get(id);
      expect(after.trainingDataSize).toBe(origSize + 3);
      expect(after.lastRetraining).toBeInstanceOf(Date);
      // Accuracy improves by up to 0.005 but capped at 0.98
      expect(after.accuracy).toBeCloseTo(Math.min(0.98, origAcc + 0.005), 6);
    });

    it("returns false for non-existent model", async () => {
      const ok = await service.retrainModel("missing-model", []);
      expect(ok).toBe(false);
    });
  });

  describe("predictNoShowProbability()", () => {
    it("uses fallback 0.12 when the model is missing", async () => {
      // Remove the no-show model to trigger fallback
      (service as unknown).models.delete("neonpro-no-show-predictor-v1.5");

      const prob = await (service as unknown).predictNoShowProbability({
        age: 40,
        appointmentHistory: [],
        distanceToClinic: 5,
      });
      expect(prob).toBeCloseTo(0.12, 6);
    });

    it("adjusts probability based on age, history, and distance", async () => {
      const patient = {
        age: 22, // < 25 increases
        appointmentHistory: [
          { status: "attended" },
          { status: "no_show" },
          { status: "attended" },
          { status: "no_show" },
        ],
        distanceToClinic: 25, // > 20 increases
      };

      const prob = await (service as unknown).predictNoShowProbability(patient);
      expect(prob).toBeGreaterThan(0.12);
      expect(prob).toBeLessThanOrEqual(0.6);
    });
  });

  describe("generateTreatmentTimeline() [private]", () => {
    it("computes adjusted duration based on recovery age and health factors", async () => {
      const features = {
        recovery_factors: {
          age_factor: 1.2,
          health_factor: 0.8,
        },
      };
      const timeline = await (service as unknown).generateTreatmentTimeline(features);
      // baseDuration = 21; adjusted = round(21 * (2 - ageFactor) * (2 - healthFactor))
      const expected = Math.round(21 * (2 - 1.2) * (2 - 0.8));
      expect(timeline.totalDuration).toBe(expected);
      expect(Array.isArray(timeline.phases)).toBe(true);
      expect(Array.isArray(timeline.criticalMilestones)).toBe(true);
    });
  });

  describe("predictPatientOutcome()", () => {
    it("returns a complete prediction object (happy path) with deterministic stubs", async () => {
      // Stub internal randomness
      vi.spyOn(Math, "random").mockReturnValue(0.1);

      // Stub time-sensitive seasonal factors to deterministic values
      vi.spyOn(service as unknown, "getSeasonalFactors").mockReturnValue({
        season_impact: 1,
        humidity: 1,
        uv_exposure: 1,
      });

      // Stub sub-calls to ensure determinism
      const mockOutcome = {
        treatmentId: "treat-xyz",
        outcomeScore: 82, // intentionally below 85 to exercise medium/high risk thresholds
        predictionAccuracy: 0.9,
        factors: [],
        timeline: { totalDuration: 28, phases: [], criticalMilestones: [], flexibilityScore: 50 },
        alternatives: [],
        riskFactors: [],
        confidenceInterval: [70, 90],
      };
      const mockComps = [
        {
          type: "Infecção localizada",
          probability: 0.31, // > 0.3 makes it high-risk candidate
          severity: "severe",
          timeframe: 7,
          preventionStrategies: ["Higiene rigorosa"],
          warningSignals: ["Febre"],
        },
      ];
      const mockNoShow = 0.22;

      vi.spyOn(service as unknown, "generateOutcomePrediction").mockResolvedValue(mockOutcome);
      vi.spyOn(service as unknown, "predictComplications").mockResolvedValue(mockComps);
      vi.spyOn(service as unknown, "predictNoShowProbability").mockResolvedValue(mockNoShow);
      vi.spyOn(service as unknown, "generateRecoveryTimeline").mockReturnValue([
        { milestone: "X", expectedDay: 3, probability: 0.9, dependencies: [], criticalFactors: [] },
      ]);
      vi.spyOn(service as unknown, "generateRecommendations").mockReturnValue({
        optimalTreatment: {
          id: "opt",
          name: "Opt",
          description: "",
          steps: [],
          duration: 28,
          cost: 0,
          successProbability: 0.82,
        },
        preventiveMeasures: [],
        followUpSchedule: { appointments: [] },
        riskMitigation: [],
        resourceAllocation: [],
      });

      const result = await service.predictPatientOutcome(
        "patient-1",
        "laser_facial",
        { age: 40 },
      );

      expect(result.patientId).toBe("patient-1");
      expect(result.modelVersion).toBe("neonpro-outcome-predictor-v2.1");
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.predictions.noShowProbability).toBeCloseTo(mockNoShow, 6);
      expect(result.predictions.complications).toStrictEqual(mockComps);
      expect(result.predictions.recoveryTimeline).toHaveLength(1);
      expect(result.recommendations.optimalTreatment.duration).toBe(28);

      // Risk level should consider outcomeScore and high-risk complications
      expect(["medium", "high", "critical", "low"]).toContain(result.predictions.riskLevel);
    });

    it("throws an explicit error when modelId is unknown", async () => {
      await expect(
        service.predictPatientOutcome("p", "t", {}, "unknown-model-id"),
      ).rejects.toThrow(/Model unknown-model-id not found/);
    });

    it("wraps internal errors and rethrows with a clear message", async () => {
      // Force an internal method to throw
      vi.spyOn(service as unknown, "extractFeatures").mockRejectedValue(new Error("boom"));
      await expect(
        service.predictPatientOutcome("p2", "t2", {}),
      ).rejects.toThrow(/Failed to generate prediction: /);
    });
  });

  describe("Edge behaviors in complication prediction [private]", () => {
    it("only includes complications with adjusted probability above 0.05 and sorts descending", async () => {
      // Make getSeasonalFactors deterministic so features composition is stable
      vi.spyOn(service as unknown, "getSeasonalFactors").mockReturnValue({
        season_impact: 1,
        humidity: 1,
        uv_exposure: 1,
      });

      const features = await (service as unknown).extractFeatures(
        {
          age: 30,
          skinType: "sensitive", // increases impact for 'skin_type'
          complianceScore: 0.6, // affects compliance-based adjustments
          lifestyle: {
            smoking: true,
            alcohol: "moderate",
            exercise: "regular",
            stressLevel: "moderate",
          },
        },
        "laser_facial",
      );

      const comps = await (service as unknown).predictComplications(features, {});
      expect(Array.isArray(comps)).toBe(true);
      expect(comps.length).toBeGreaterThan(0);
      // Ensure sorted by probability descending
      for (let i = 1; i < comps.length; i++) {
        expect(comps[i - 1].probability).toBeGreaterThanOrEqual(comps[i].probability);
      }
      // Probabilities must be capped at 0.8
      comps.forEach(c => {
        expect(c.probability).toBeLessThanOrEqual(0.8);
      });
    });
  });
});
