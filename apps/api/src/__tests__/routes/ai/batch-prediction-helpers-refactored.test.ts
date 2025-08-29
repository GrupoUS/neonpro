/**
 * Batch Prediction Helper Functions - Refactored
 * Tests focus on the refactor/diff: input validation, rounding, caps, and date/time utilities.
 *
 * Testing library: Jest (ts-jest). Compatible with Vitest via globalThis.vi guards for timers.
 */

import {
  getErrorMessage,
  calculateSuccessRate,
  calculateAverageProcessingTime,
  calculateThroughputPerHour,
  calculateAveragePredictionsPerJob,
  getDatePlusHours,
  getDatePlusDays,
  getTodayDateString,
  hasErrors,
  getStatusCode,
  validateProcessingTimes,
  calculateProcessingMetrics,
} from "../../../routes/ai/batch-prediction-helpers-refactored";

const g: any = globalThis;

describe("Batch Prediction Helpers (refactored)", () => {
  describe("getErrorMessage", () => {
    it("returns error.message for Error instances", () => {
      const err = new Error("boom");
      expect(getErrorMessage(err, "fallback")).toBe("boom");
    });

    it("returns the string when error is a string", () => {
      expect(getErrorMessage("oops", "fallback")).toBe("oops");
    });

    it("returns fallback for non-Error, non-string types", () => {
      expect(getErrorMessage(123 as unknown, "fallback")).toBe("fallback");
      expect(getErrorMessage({} as unknown, "fallback")).toBe("fallback");
      expect(getErrorMessage(null as unknown, "fallback")).toBe("fallback");
      expect(getErrorMessage(undefined as unknown, "fallback")).toBe("fallback");
    });
  });

  describe("calculateSuccessRate", () => {
    it("returns 0 for total 0 or negative inputs", () => {
      expect(calculateSuccessRate(5, 0)).toBe(0);
      expect(calculateSuccessRate(-1, 10)).toBe(0);
      expect(calculateSuccessRate(1, -10)).toBe(0);
    });

    it("caps at 100 when completed > total", () => {
      expect(calculateSuccessRate(120, 100)).toBe(100);
    });

    it("rounds to nearest integer", () => {
      expect(calculateSuccessRate(1, 3)).toBe(33); // 33.33 -> 33
      expect(calculateSuccessRate(2, 3)).toBe(67); // 66.67 -> 67
      expect(calculateSuccessRate(50, 100)).toBe(50);
    });
  });

  describe("calculateAverageProcessingTime", () => {
    it("returns 0 for empty or all-invalid (negative) arrays", () => {
      expect(calculateAverageProcessingTime([])).toBe(0);
      expect(calculateAverageProcessingTime([-1, -5, -10])).toBe(0);
    });

    it("ignores negative values and rounds average", () => {
      expect(calculateAverageProcessingTime([100, -50, 100])).toBe(100);
      expect(calculateAverageProcessingTime([10, 11])).toBe(11); // 10.5 -> 11
      expect(calculateAverageProcessingTime([100, 200, 300])).toBe(200);
    });
  });

  describe("calculateThroughputPerHour", () => {
    it("returns 0 when totalProcessed <= 0 or avgProcessingTimeMs <= 0", () => {
      expect(calculateThroughputPerHour(0, 1000)).toBe(0);
      expect(calculateThroughputPerHour(10, 0)).toBe(0);
      expect(calculateThroughputPerHour(-5, 100)).toBe(0);
      expect(calculateThroughputPerHour(5, -100)).toBe(0);
    });

    it("computes items per hour using provided formula and rounds", () => {
      expect(calculateThroughputPerHour(1, 1000)).toBe(3_600_000);
      expect(calculateThroughputPerHour(100, 250)).toBe(1_440_000); // (100/250)*3,600,000
    });
  });

  describe("calculateAveragePredictionsPerJob", () => {
    it("returns 0 for invalid inputs", () => {
      expect(calculateAveragePredictionsPerJob(-1, 2)).toBe(0);
      expect(calculateAveragePredictionsPerJob(10, 0)).toBe(0);
      expect(calculateAveragePredictionsPerJob(10, -3)).toBe(0);
    });

    it("calculates and rounds average predictions per job", () => {
      expect(calculateAveragePredictionsPerJob(10, 4)).toBe(3);
      expect(calculateAveragePredictionsPerJob(5, 2)).toBe(3);
    });
  });

  describe("Date utilities", () => {
    const fixed = new Date("2025-01-15T00:00:00.000Z");

    beforeAll(() => {
      if (g.jest) {
        g.jest.useFakeTimers().setSystemTime(fixed);
      } else if (g.vi) {
        g.vi.useFakeTimers();
        g.vi.setSystemTime(fixed);
      }
    });

    afterAll(() => {
      if (g.jest) {
        g.jest.useRealTimers();
      } else if (g.vi) {
        g.vi.useRealTimers();
      }
    });

    describe("getDatePlusHours", () => {
      it("throws for negative hours", () => {
        expect(() => getDatePlusHours(-1)).toThrow("Hours must be non-negative");
      });

      it("returns YYYY-MM-DD for 0, 12, and 24 hours from fixed time", () => {
        expect(getDatePlusHours(0)).toBe("2025-01-15");
        expect(getDatePlusHours(12)).toBe("2025-01-15");
        expect(getDatePlusHours(24)).toBe("2025-01-16");
      });
    });

    describe("getDatePlusDays", () => {
      it("throws for negative days", () => {
        expect(() => getDatePlusDays(-5)).toThrow("Days must be non-negative");
      });

      it("returns YYYY-MM-DD for N days from fixed time", () => {
        expect(getDatePlusDays(0)).toBe("2025-01-15");
        expect(getDatePlusDays(1)).toBe("2025-01-16");
        expect(getDatePlusDays(10)).toBe("2025-01-25");
      });
    });

    it("getTodayDateString returns today's date (fixed)", () => {
      expect(getTodayDateString()).toBe("2025-01-15");
    });
  });

  describe("hasErrors", () => {
    it("returns false for non-array inputs and empty arrays", () => {
      expect(hasErrors([])).toBe(false);
      expect(hasErrors("error" as any)).toBe(false);
      expect(hasErrors({ msg: "x" } as any)).toBe(false);
      expect(hasErrors(null as any)).toBe(false);
      expect(hasErrors(undefined as any)).toBe(false);
    });

    it("returns true when array has at least one item", () => {
      expect(hasErrors([undefined])).toBe(true);
      expect(hasErrors([new Error("x")])).toBe(true);
      expect(hasErrors(["e1", "e2"])).toBe(true);
    });
  });

  describe("getStatusCode", () => {
    it("returns 207 when errors present, otherwise 201", () => {
      expect(getStatusCode(true)).toBe(207);
      expect(getStatusCode(false)).toBe(201);
    });
  });

  describe("validateProcessingTimes", () => {
    it("filters out negatives, NaN, and non-finite values", () => {
      const input = [100, -1, 0, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 50];
      expect(validateProcessingTimes(input)).toEqual([100, 0, 50]);
    });

    it("returns empty array when nothing valid remains", () => {
      const input = [-1, Number.NaN, Number.POSITIVE_INFINITY];
      expect(validateProcessingTimes(input)).toEqual([]);
    });
  });

  describe("calculateProcessingMetrics (integration over helpers)", () => {
    it("returns medium efficiency with valid times and ~80% success", () => {
      const res = calculateProcessingMetrics(80, 100, [100, 200, 300], 4);
      expect(res).toEqual({
        successRate: 80,
        averageProcessingTime: 200,
        throughputPerHour: 1_440_000,
        avgPredictionsPerJob: 20,
        efficiency: "medium",
      });
    });

    it("returns high efficiency when successRate >= 95 and avgProcessingTime > 0", () => {
      const res = calculateProcessingMetrics(95, 100, [10]); // avg time 10ms
      expect(res).toEqual({
        successRate: 95,
        averageProcessingTime: 10,
        throughputPerHour: 34_200_000,
        avgPredictionsPerJob: 95,
        efficiency: "high",
      });
    });

    it("handles invalid processingTimes gracefully (average=0 => throughput=0) and still classifies by success rate", () => {
      const res = calculateProcessingMetrics(100, 100, [-1, Number.NaN, Number.POSITIVE_INFINITY]);
      expect(res).toEqual({
        successRate: 100,
        averageProcessingTime: 0,
        throughputPerHour: 0,
        avgPredictionsPerJob: 100,
        efficiency: "medium", // not 'high' because avgProcessingTime is 0
      });
    });

    it("returns low efficiency when success < 80%", () => {
      const res = calculateProcessingMetrics(75, 100, [250, 250], 2);
      expect(res).toEqual({
        successRate: 75,
        averageProcessingTime: 250,
        throughputPerHour: 1_080_000,
        avgPredictionsPerJob: 38,
        efficiency: "low",
      });
    });
  });
});