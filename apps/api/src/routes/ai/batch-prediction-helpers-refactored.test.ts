//
// ============================================================================
// UNIT TESTS (appended)
// Testing library/framework note:
// - These tests are written using Jest-style APIs (describe, it/test, expect).
// - If the repository uses Vitest, they should work with vi.* timers;
//   you can map jest.* to vi.* if configured (or replace jest with vi).
// ============================================================================
//

/* eslint-disable @typescript-eslint/no-explicit-<unknown> */

describe('Batch Prediction Helper Functions - Refactored (unit tests)', () => {
  // Import functions from this same file scope (already defined above)
  // In TS test runners, top-level exports are available for import by path,
  // but since we're in the same file we reference them directly.

  describe('getErrorMessage', () => {
    it('returns message from Error instance', () => {
      const msg = 'boom'
      const err = new Error(msg,)
      expect(getErrorMessage(err, 'fallback',),).toBe(msg,)
    })

    it('returns string when error is a string', () => {
      expect(getErrorMessage('simple error', 'fallback',),).toBe('simple error',)
    })

    it('returns fallback for unknown non-string errors', () => {
      expect(getErrorMessage({ code: 500, } as unknown, 'fallback',),).toBe('fallback',)
      expect(getErrorMessage(null as unknown, 'fallback2',),).toBe('fallback2',)
      expect(getErrorMessage(undefined as unknown, 'fallback3',),).toBe('fallback3',)
    })
  })

  describe('calculateSuccessRate', () => {
    it('returns 0 when total is 0', () => {
      expect(calculateSuccessRate(0, 0,),).toBe(0,)
      expect(calculateSuccessRate(10, 0,),).toBe(0,)
    })

    it('returns 0 for negative inputs', () => {
      expect(calculateSuccessRate(-1, 10,),).toBe(0,)
      expect(calculateSuccessRate(1, -10,),).toBe(0,)
    })

    it('caps at 100 when completed > total', () => {
      expect(calculateSuccessRate(11, 10,),).toBe(100,)
    })

    it('rounds to nearest integer for valid inputs', () => {
      expect(calculateSuccessRate(1, 3,),).toBe(33,)
      expect(calculateSuccessRate(2, 3,),).toBe(67,)
      expect(calculateSuccessRate(5, 10,),).toBe(50,)
      expect(calculateSuccessRate(9, 10,),).toBe(90,)
    })
  })

  describe('calculateAverageProcessingTime', () => {
    it('returns 0 for empty array', () => {
      expect(calculateAverageProcessingTime([],),).toBe(0,)
    })

    it('filters out negatives and returns 0 if all invalid', () => {
      expect(calculateAverageProcessingTime([-1, -2, -3,],),).toBe(0,)
    })

    it('computes rounded average over valid non-negative times', () => {
      expect(calculateAverageProcessingTime([100, 200, 300,],),).toBe(200,)
      // mixture with negatives filtered out: valid [50,150] => avg 100
      expect(calculateAverageProcessingTime([-5, 50, -1, 150,],),).toBe(100,)
      // rounding
      expect(calculateAverageProcessingTime([1, 2,],),).toBe(2,) // 1.5 rounds to 2
    })
  })

  describe('calculateThroughputPerHour', () => {
    it('returns 0 for non-positive inputs', () => {
      expect(calculateThroughputPerHour(0, 1000,),).toBe(0,)
      expect(calculateThroughputPerHour(10, 0,),).toBe(0,)
      expect(calculateThroughputPerHour(-1, 1000,),).toBe(0,)
      expect(calculateThroughputPerHour(10, -1000,),).toBe(0,)
    })

    it('calculates items per hour and rounds', () => {
      // items/hour = (totalProcessed / avgMs) * 3_600_000
      // Example: total=100, avg=1000ms => (100/1000)*3_600_000 = 360_000
      expect(calculateThroughputPerHour(100, 1000,),).toBe(360_000,)
      // Check rounding
      // total=3, avg=2000ms => (3/2000)*3_600_000 = 5400
      expect(calculateThroughputPerHour(3, 2000,),).toBe(5400,)
    })
  })

  describe('calculateAveragePredictionsPerJob', () => {
    it('returns 0 for invalid edge cases', () => {
      expect(calculateAveragePredictionsPerJob(10, 0,),).toBe(0,)
      expect(calculateAveragePredictionsPerJob(-1, 1,),).toBe(0,)
      expect(calculateAveragePredictionsPerJob(10, -1,),).toBe(0,)
    })

    it('returns rounded average per job', () => {
      expect(calculateAveragePredictionsPerJob(10, 3,),).toBe(3,) // 3.33 -> 3
      expect(calculateAveragePredictionsPerJob(5, 2,),).toBe(3,) // 2.5 -> 3
      expect(calculateAveragePredictionsPerJob(9, 2,),).toBe(5,) // 4.5 -> 5
    })
  })

  describe('date utilities with frozen time', () => {
    const fixedDate = new Date('2025-08-15T12:34:56.789Z',) // fixed reference date

    beforeAll(() => {
      // Prefer Jest modern timers API; if using Vitest, a compat layer or vi.setSystemTime can be used.
      const g: unknown = globalThis as unknown
      if (g.jest && typeof g.jest.useFakeTimers === 'function') {
        g.jest.useFakeTimers()
        g.jest.setSystemTime(fixedDate,)
      } else if (g.vi && typeof g.vi.useFakeTimers === 'function') {
        g.vi.useFakeTimers()
        g.vi.setSystemTime(fixedDate,)
      }
    },)

    afterAll(() => {
      const g: unknown = globalThis as unknown
      if (g.jest && typeof g.jest.useRealTimers === 'function') {
        g.jest.useRealTimers()
      } else if (g.vi && typeof g.vi.useRealTimers === 'function') {
        g.vi.useRealTimers()
      }
    },)

    it('getDatePlusHours returns YYYY-MM-DD for non-negative hours', () => {
      // fixed date 2025-08-15T12:34:56.789Z + 12h => 2025-08-16
      expect(getDatePlusHours(12,),).toBe('2025-08-16',)
      // +0h => same date
      expect(getDatePlusHours(0,),).toBe('2025-08-15',)
    })

    it('getDatePlusHours throws for negative hours', () => {
      expect(() => getDatePlusHours(-1,)).toThrow('Hours must be non-negative',)
    })

    it('getDatePlusDays returns YYYY-MM-DD for non-negative days', () => {
      // +1 day => 2025-08-16
      expect(getDatePlusDays(1,),).toBe('2025-08-16',)
      expect(getDatePlusDays(0,),).toBe('2025-08-15',)
    })

    it('getDatePlusDays throws for negative days', () => {
      expect(() => getDatePlusDays(-3,)).toThrow('Days must be non-negative',)
    })

    it("getTodayDateString returns today's date in YYYY-MM-DD", () => {
      expect(getTodayDateString(),).toBe('2025-08-15',)
    })
  })

  describe('hasErrors', () => {
    it('returns true when array has items', () => {
      expect(hasErrors([new Error('x',),],),).toBe(true,)
      expect(hasErrors([1,],),).toBe(true,)
    })

    it('returns false for empty array', () => {
      expect(hasErrors([],),).toBe(false,)
    })

    it('returns false when not an array at runtime', () => {
      expect(hasErrors((null as unknown) as unknown[],),).toBe(false,)
      expect(hasErrors((undefined as unknown) as unknown[],),).toBe(false,)
      expect(hasErrors(({} as unknown) as unknown[],),).toBe(false,)
    })
  })

  describe('getStatusCode', () => {
    it('returns 207 for hasErrors=true, 201 otherwise', () => {
      expect(getStatusCode(true,),).toBe(207,)
      expect(getStatusCode(false,),).toBe(201,)
    })
  })

  describe('validateProcessingTimes', () => {
    it('filters invalid values (negatives, NaN, Infinity, non-numbers)', () => {
      const mixed = [-1, 0, 10, Number.NaN, Number.POSITIVE_INFINITY,] as number[] // Inject a non-number through '<unknown>' cast to validate runtime guarding
      ;(mixed as unknown).push('12ms',)
      const valid = validateProcessingTimes(mixed as unknown as number[],)
      expect(valid,).toStrictEqual([0, 10,],)
    })

    it('returns empty array if nothing valid', () => {
      const input = [Number.NaN, Number.POSITIVE_INFINITY, -5,] as number[]
      expect(validateProcessingTimes(input as unknown as number[],),).toStrictEqual([],)
    })
  })

  describe('calculateProcessingMetrics (integration of helpers)', () => {
    const baseTimes = [100, 200, 300,] // avg 200ms

    it("computes metrics and classifies efficiency as 'high' with >=95% success and avg>0", () => {
      const completed = 95
      const total = 100
      const metrics = calculateProcessingMetrics(completed, total, baseTimes, 5,)
      expect(metrics.successRate,).toBe(95,)
      expect(metrics.averageProcessingTime,).toBe(200,)
      // throughput: (completed / avgMs)*3_600_000 = (95/200)*3_600_000 = 1_710_000 -> rounded
      expect(metrics.throughputPerHour,).toBe(1_710_000,)
      // avg per job: 95/5 = 19
      expect(metrics.avgPredictionsPerJob,).toBe(19,)
      expect(metrics.efficiency,).toBe('high',)
    })

    it("classifies efficiency as 'medium' with >=80% success", () => {
      const metrics = calculateProcessingMetrics(80, 100, baseTimes, 4,)
      expect(metrics.successRate,).toBe(80,)
      expect(metrics.efficiency,).toBe('medium',)
    })

    it("classifies efficiency as 'medium' (not 'high') when success >=95 but avgProcessingTime is 0", () => {
      // Make processingTimes invalid to yield averageProcessingTime=0
      const metrics = calculateProcessingMetrics(99, 100, [], 2,)
      expect(metrics.averageProcessingTime,).toBe(0,)
      expect(metrics.successRate,).toBe(99,)
      expect(metrics.efficiency,).toBe('medium',) // falls through to medium because avg=0
      expect(metrics.throughputPerHour,).toBe(0,) // since avg=0
      expect(metrics.avgPredictionsPerJob,).toBe(50,) // 99/2 => 49.5 -> 50
    })

    it('handles edge cases and returns zeros appropriately', () => {
      const metrics = calculateProcessingMetrics(-1, -5, [-10, -20,], 0,)
      expect(metrics.successRate,).toBe(0,)
      expect(metrics.averageProcessingTime,).toBe(0,)
      expect(metrics.throughputPerHour,).toBe(0,)
      expect(metrics.avgPredictionsPerJob,).toBe(0,)
      expect(metrics.efficiency,).toBe('low',)
    })
  })
})
