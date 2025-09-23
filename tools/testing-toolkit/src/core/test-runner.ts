/**
 * Test Runner Utilities
 *
 * Provides utilities for running tests with different configurations
 * and collecting results.
 */

import type { TestConfig, TestResult, TestSuite } from "./types";

export class TestRunner {
  private config: TestConfig;
  private results: TestResult[] = [];

  constructor(config: TestConfig) {
    this.config = config;
  }

  /**
   * Run a single test
   */
  async runTest(
    name: string,
    testFn: () => Promise<void> | void,
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      await testFn();
      const duration = Date.now() - startTime;

      const result: TestResult = {
        name,
        category: this.config.category,
        passed: true,
        duration,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      let errorMessage: string;
      if (error === undefined) {
        errorMessage = "undefined";
      } else if (error === null) {
        errorMessage = "null";
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = JSON.stringify(error);
      }

      const result: TestResult = {
        name,
        category: this.config.category,
        passed: false,
        duration,
        errors: [errorMessage],
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * Get test suite summary
   */
  getSuite(suiteName: string): TestSuite {
    const totalDuration = this.results.reduce(
      (sum, result) => sum + result.duration,
      0,
    );
    const passedTests = this.results.filter((result) => result.passed);
    const passRate =
      this.results.length > 0
        ? (passedTests.length / this.results.length) * 100
        : 0;

    // Calculate average coverage (if available)
    const testsWithCoverage = this.results.filter(
      (result) => result.coverage !== undefined,
    );
    const coverageRate =
      testsWithCoverage.length > 0
        ? testsWithCoverage.reduce(
            (sum, result) => sum + (result.coverage || 0),
            0,
          ) / testsWithCoverage.length
        : 0;

    return {
      name: suiteName,
      tests: [...this.results],
      totalDuration,
      passRate,
      coverageRate,
    };
  }

  /**
   * Reset results
   */
  reset(): void {
    this.results = [];
  }
}
