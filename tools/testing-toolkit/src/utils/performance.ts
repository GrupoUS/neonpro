/**
 * Performance Testing Utilities
 *
 * Utilities for performance testing and benchmarking.
 */

import { describe, it } from "vitest";

// Healthcare-specific performance budget interface
export interface HealthcarePerformanceBudget {
  LCP: { budget: number; unit: string; description: string };
  CLS: { budget: number; unit: string; description: string };
  TTFB: { budget: number; unit: string; description: string };
  FID: { budget: number; unit: string; description: string };
  TBT: { budget: number; unit: string; description: string };
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  iterations?: number;
  averageTime?: number;
  minTime?: number;
  maxTime?: number;
}

export interface PerformanceBudget {
  maxExecutionTime: number;
  maxMemoryUsage?: number;
  minIterationsPerSecond?: number;
}

/**
 * Performance measurement utility
 */
export class PerformanceMeasurer {
  private startTime: number = 0;
  private startMemory?: NodeJS.MemoryUsage;

  /**
   * Start measuring performance
   */
  start(): void {
    if (typeof process !== "undefined" && process.memoryUsage) {
      this.startMemory = process.memoryUsage();
    }
    this.startTime = performance.now();
  }

  /**
   * Stop measuring and return metrics
   */
  stop(): PerformanceMetrics {
    const executionTime = performance.now() - this.startTime;

    const metrics: PerformanceMetrics = {
      executionTime,
    };

    if (
      this.startMemory &&
      typeof process !== "undefined" &&
      process.memoryUsage
    ) {
      const endMemory = process.memoryUsage();
      metrics.memoryUsage = {
        heapUsed: endMemory.heapUsed - this.startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - this.startMemory.heapTotal,
        external: endMemory.external - this.startMemory.external,
      };
    }

    return metrics;
  }

  /**
   * Measure a function's performance
   */
  static async measure<T>(
    fn: () => Promise<T> | T,
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const measurer = new PerformanceMeasurer();
    measurer.start();

    const result = await fn();
    const metrics = measurer.stop();

    return { result, metrics };
  }

  /**
   * Benchmark a function with multiple iterations
   */
  static async benchmark<T>(
    fn: () => Promise<T> | T,
    iterations: number = 100,
  ): Promise<PerformanceMetrics> {
    const times: number[] = [];
    let totalMemoryUsage = 0;

    for (let i = 0; i < iterations; i++) {
      const { metrics } = await this.measure(fn);
      times.push(metrics.executionTime);

      if (metrics.memoryUsage) {
        totalMemoryUsage += metrics.memoryUsage.heapUsed;
      }
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const result: PerformanceMetrics = {
      executionTime: totalTime,
      iterations,
      averageTime,
      minTime,
      maxTime,
    };

    if (totalMemoryUsage > 0) {
      result.memoryUsage = {
        heapUsed: totalMemoryUsage / iterations,
        heapTotal: 0,
        external: 0,
      };
    }

    return result;
  }
}

/**
 * Performance budget validator
 */
export class PerformanceBudgetValidator {
  /**
   * Validate performance metrics against budget
   */
  static validate(
    metrics: PerformanceMetrics,
    budget: PerformanceBudget,
  ): {
    passed: boolean;
    violations: string[];
    summary: string;
  } {
    const violations: string[] = [];

    // Check execution time
    const timeToCheck = metrics.averageTime || metrics.executionTime;
    if (timeToCheck > budget.maxExecutionTime) {
      violations.push(
        `Execution time ${timeToCheck.toFixed(2)}ms exceeds budget of ${budget.maxExecutionTime}ms`,
      );
    }

    // Check memory usage
    if (budget.maxMemoryUsage && metrics.memoryUsage) {
      const memoryUsed = metrics.memoryUsage.heapUsed / (1024 * 1024); // Convert to MB
      const memoryBudget = budget.maxMemoryUsage / (1024 * 1024);

      if (memoryUsed > memoryBudget) {
        violations.push(
          `Memory usage ${memoryUsed.toFixed(2)}MB exceeds budget of ${memoryBudget.toFixed(2)}MB`,
        );
      }
    }

    // Check iterations per second
    if (
      budget.minIterationsPerSecond &&
      metrics.iterations &&
      metrics.averageTime
    ) {
      const iterationsPerSecond = 1000 / metrics.averageTime;
      if (iterationsPerSecond < budget.minIterationsPerSecond) {
        violations.push(
          `Performance ${iterationsPerSecond.toFixed(
            2,
          )} iterations/sec below budget of ${budget.minIterationsPerSecond} iterations/sec`,
        );
      }
    }

    const passed = violations.length === 0;
    const summary = passed
      ? "All performance budgets met"
      : `${violations.length} performance budget violations`;

    return { passed, violations, summary };
  }
}

/**
 * Performance test helpers
 */
export async function expectPerformance<T>(
  fn: () => Promise<T> | T,
  budget: PerformanceBudget,
): Promise<T> {
  const { result, metrics } = await PerformanceMeasurer.measure(fn);
  const validation = PerformanceBudgetValidator.validate(metrics, budget);

  if (!validation.passed) {
    throw new Error(
      `Performance budget failed: ${validation.violations.join(", ")}`,
    );
  }

  return result;
}

/**
 * Expect function to complete within time budget
 */
export async function expectToCompleteWithin<T>(
  fn: () => Promise<T> | T,
  maxTimeMs: number,
): Promise<T> {
  return expectPerformance(fn, { maxExecutionTime: maxTimeMs });
}

/**
 * Expect function to use less than specified memory
 */
export async function expectToUseMemoryLessThan<T>(
  fn: () => Promise<T> | T,
  maxMemoryBytes: number,
): Promise<T> {
  return expectPerformance(fn, {
    maxExecutionTime: Infinity,
    maxMemoryUsage: maxMemoryBytes,
  });
}

/**
 * Create a performance test suite
 */
export function createPerformanceTestSuite(
  name: string,
  tests: Array<{
    name: string;
    fn: () => Promise<any> | any;
    budget: PerformanceBudget;
  }>,
) {
  describe(`Performance: ${name}`, () => {
    tests.forEach((test) => {
      it(`should meet performance budget for ${test.name}`, async () => {
        await expectPerformance(test.fn, test.budget);
      });
    });
  });
}

/**
 * Healthcare performance budgets (from config)
 */
export const HEALTHCARE_PERFORMANCE_BUDGETS: HealthcarePerformanceBudget = {
  LCP: {
    budget: 2500,
    unit: "ms",
    description:
      "Largest Contentful Paint - Healthcare compliance requires ≤2.5s",
  },
  CLS: {
    budget: 0.1,
    unit: "score",
    description:
      "Cumulative Layout Shift - Medical interfaces require stability",
  },
  TTFB: {
    budget: 600,
    unit: "ms",
    description: "Time to First Byte - Critical for healthcare data access",
  },
  FID: {
    budget: 100,
    unit: "ms",
    description: "First Input Delay - Medical form responsiveness",
  },
  TBT: {
    budget: 300,
    unit: "ms",
    description: "Total Blocking Time - Healthcare workflow efficiency",
  },
};

/**
 * Create healthcare-compliant performance budget
 */
export function createHealthcarePerformanceBudget(
  overrides: Partial<PerformanceBudget> = {},
): PerformanceBudget {
  return {
    maxExecutionTime: HEALTHCARE_PERFORMANCE_BUDGETS.LCP.budget,
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB default
    minIterationsPerSecond: 10, // Default minimum performance
    ...overrides,
  };
}

/**
 * Validate healthcare performance requirements
 */
export function validateHealthcarePerformance<T>(
  fn: () => Promise<T> | T,
  metric: keyof HealthcarePerformanceBudget = "LCP",
): Promise<T> {
  const budget = HEALTHCARE_PERFORMANCE_BUDGETS[metric];
  return expectPerformance(fn, {
    maxExecutionTime: budget.budget,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB for healthcare apps
  });
}

/**
 * Create healthcare-specific performance test suite
 */
export function createHealthcarePerformanceTestSuite(
  name: string,
  tests: Array<{
    name: string;
    fn: () => Promise<any> | any;
    metric?: keyof HealthcarePerformanceBudget;
  }>,
) {
  describe(`Healthcare Performance: ${name}`, () => {
    tests.forEach((test) => {
      const metric = test.metric || "LCP";
      const budget = HEALTHCARE_PERFORMANCE_BUDGETS[metric];

      it(`should meet ${metric} budget for ${test.name} (≤${budget.budget}${budget.unit})`, async () => {
        await validateHealthcarePerformance(test.fn, metric);
      });
    });
  });
}
