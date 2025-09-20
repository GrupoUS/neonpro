/**
 * Test Runner Tests
 *
 * Tests for the TestRunner class that handles test execution and result collection.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestRunner } from '../src/core/test-runner';
import type { TestConfig, TestResult } from '../src/core/types';

describe('TestRunner', () => {
  let testRunner: TestRunner;
  let mockConfig: TestConfig;

  beforeEach(() => {
    mockConfig = {
      category: 'unit',
      environment: 'node',
      timeout: 5000,
      retries: 1,
    };

    testRunner = new TestRunner(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(testRunner).toBeDefined();
      // TestRunner should have a private config property
      // We'll test its behavior rather than direct access
    });

    it('should handle different configurations', () => {
      const integrationConfig: TestConfig = {
        category: 'integration',
        environment: 'node',
        timeout: 10000,
        retries: 3,
      };

      const integrationRunner = new TestRunner(integrationConfig);
      expect(integrationRunner).toBeDefined();
    });
  });

  describe('runTest', () => {
    it('should run a successful test', async () => {
      const testName = 'successful test';
      const testFn = vi.fn().mockResolvedValue(undefined);

      const result = await testRunner.runTest(testName, testFn);

      expect(result).toBeDefined();
      expect(result.name).toBe(testName);
      expect(result.category).toBe('unit');
      expect(result.passed).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.errors).toBeUndefined();
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should run a successful synchronous test', async () => {
      const testName = 'sync test';
      const testFn = vi.fn(() => {
        // Synchronous function
      });

      const result = await testRunner.runTest(testName, testFn);

      expect(result).toBeDefined();
      expect(result.name).toBe(testName);
      expect(result.passed).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should handle failing test', async () => {
      const testName = 'failing test';
      const errorMessage = 'Test assertion failed';
      const testFn = vi.fn().mockRejectedValue(new Error(errorMessage));

      const result = await testRunner.runTest(testName, testFn);

      expect(result).toBeDefined();
      expect(result.name).toBe(testName);
      expect(result.category).toBe('unit');
      expect(result.passed).toBe(false);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0]).toBe(errorMessage);
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should handle test throwing non-Error objects', async () => {
      const testName = 'test with string error';
      const errorString = 'String error message';
      const testFn = vi.fn().mockRejectedValue(errorString);

      const result = await testRunner.runTest(testName, testFn);

      expect(result).toBeDefined();
      expect(result.passed).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toBe(errorString);
    });

    it('should handle test throwing objects', async () => {
      const testName = 'test with object error';
      const errorObject = { code: 'TEST_ERROR', message: 'Test failed' };
      const testFn = vi.fn().mockRejectedValue(errorObject);

      const result = await testRunner.runTest(testName, testFn);

      expect(result).toBeDefined();
      expect(result.passed).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toBe(JSON.stringify(errorObject));
    });

    it('should accumulate results across multiple tests', async () => {
      const test1 = await testRunner.runTest('test 1', () => Promise.resolve());
      const test2 = await testRunner.runTest('test 2', () => Promise.resolve());
      const test3 = await testRunner.runTest('test 3', () => Promise.reject(new Error('Failed')));

      expect(test1.passed).toBe(true);
      expect(test2.passed).toBe(true);
      expect(test3.passed).toBe(false);
    });

    it('should handle test with coverage information', async () => {
      const testName = 'test with coverage';
      const testFn = vi.fn().mockResolvedValue(undefined);

      // Note: coverage is typically added by the test framework, not the test itself
      // This tests that the TestRunner can handle results with coverage
      const result = await testRunner.runTest(testName, testFn);

      // Coverage would be added by the test framework, not by runTest
      expect(result.coverage).toBeUndefined();
    });
  });

  describe('getSuite', () => {
    it('should return empty suite when no tests run', () => {
      const suite = testRunner.getSuite('empty-suite');

      expect(suite).toBeDefined();
      expect(suite.name).toBe('empty-suite');
      expect(suite.tests).toHaveLength(0);
      expect(suite.totalDuration).toBe(0);
      expect(suite.passRate).toBe(0);
      expect(suite.coverageRate).toBe(0);
    });

    it('should return suite with single successful test', async () => {
      await testRunner.runTest('single test', () => Promise.resolve());
      const suite = testRunner.getSuite('single-suite');

      expect(suite).toBeDefined();
      expect(suite.name).toBe('single-suite');
      expect(suite.tests).toHaveLength(1);
      expect(suite.tests[0]?.passed).toBe(true);
      expect(suite.totalDuration).toBeGreaterThanOrEqual(0);
      expect(suite.passRate).toBe(100);
      expect(suite.coverageRate).toBe(0); // No coverage info
    });

    it('should return suite with multiple tests', async () => {
      await testRunner.runTest('test 1', () => Promise.resolve());
      await testRunner.runTest('test 2', () => Promise.resolve());
      await testRunner.runTest('test 3', () => Promise.reject(new Error('Failed')));

      const suite = testRunner.getSuite('multi-suite');

      expect(suite).toBeDefined();
      expect(suite.name).toBe('multi-suite');
      expect(suite.tests).toHaveLength(3);
      expect(suite.passRate).toBeCloseTo(66.67, 1); // 2 out of 3 passed
      expect(suite.totalDuration).toBeGreaterThanOrEqual(0);
    });

    it('should calculate coverage rate correctly', async () => {
      // Create a mock result with coverage (simulating what a test framework might do)
      const mockResultWithCoverage: TestResult = {
        name: 'test with coverage',
        category: 'unit',
        passed: true,
        duration: 100,
        coverage: 85.5,
      };

      // Manually add the result to simulate test framework behavior
      (testRunner as any).results.push(mockResultWithCoverage);

      const suite = testRunner.getSuite('coverage-suite');

      expect(suite).toBeDefined();
      expect(suite.tests).toHaveLength(1);
      expect(suite.coverageRate).toBe(85.5);
    });

    it('should handle multiple tests with different coverage values', async () => {
      const mockResults: TestResult[] = [
        {
          name: 'test 1',
          category: 'unit',
          passed: true,
          duration: 100,
          coverage: 80,
        },
        {
          name: 'test 2',
          category: 'unit',
          passed: true,
          duration: 150,
          coverage: 90,
        },
        {
          name: 'test 3',
          category: 'unit',
          passed: false,
          duration: 50,
          coverage: 75,
        },
        {
          name: 'test 4',
          category: 'unit',
          passed: true,
          duration: 200,
          // No coverage
        },
      ];

      // Manually add results
      (testRunner as any).results = mockResults;

      const suite = testRunner.getSuite('mixed-coverage-suite');

      expect(suite).toBeDefined();
      expect(suite.tests).toHaveLength(4);
      expect(suite.coverageRate).toBeCloseTo(81.67, 1); // (80 + 90 + 75) / 3
      expect(suite.passRate).toBe(75); // 3 out of 4 passed
    });

    it('should handle suite with all tests having coverage', () => {
      const mockResults: TestResult[] = [
        { name: 'test 1', category: 'unit', passed: true, duration: 100, coverage: 85 },
        { name: 'test 2', category: 'unit', passed: true, duration: 120, coverage: 90 },
        { name: 'test 3', category: 'unit', passed: true, duration: 80, coverage: 88 },
      ];

      (testRunner as any).results = mockResults;

      const suite = testRunner.getSuite('full-coverage-suite');

      expect(suite.coverageRate).toBeCloseTo(87.67, 1); // (85 + 90 + 88) / 3
      expect(suite.passRate).toBe(100);
    });

    it('should handle suite with no tests having coverage', () => {
      const mockResults: TestResult[] = [
        { name: 'test 1', category: 'unit', passed: true, duration: 100 },
        { name: 'test 2', category: 'unit', passed: false, duration: 50 },
        { name: 'test 3', category: 'unit', passed: true, duration: 75 },
      ];

      (testRunner as any).results = mockResults;

      const suite = testRunner.getSuite('no-coverage-suite');

      expect(suite.coverageRate).toBe(0);
      expect(suite.passRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('reset', () => {
    it('should clear all test results', async () => {
      // Run some tests first
      await testRunner.runTest('test 1', () => Promise.resolve());
      await testRunner.runTest('test 2', () => Promise.reject(new Error('Failed')));

      // Verify tests exist
      let suite = testRunner.getSuite('before-reset');
      expect(suite.tests).toHaveLength(2);

      // Reset
      testRunner.reset();

      // Verify tests are cleared
      suite = testRunner.getSuite('after-reset');
      expect(suite.tests).toHaveLength(0);
      expect(suite.totalDuration).toBe(0);
      expect(suite.passRate).toBe(0);
      expect(suite.coverageRate).toBe(0);
    });

    it('should allow running new tests after reset', async () => {
      // Run initial tests
      await testRunner.runTest('initial test', () => Promise.resolve());

      let suite = testRunner.getSuite('initial');
      expect(suite.tests).toHaveLength(1);

      // Reset
      testRunner.reset();

      // Run new tests
      await testRunner.runTest('new test 1', () => Promise.resolve());
      await testRunner.runTest('new test 2', () => Promise.resolve());

      suite = testRunner.getSuite('after-reset');
      expect(suite.tests).toHaveLength(2);
      expect(suite.tests[0]?.name).toBe('new test 1');
      expect(suite.tests[1]?.name).toBe('new test 2');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very fast tests', async () => {
      const testName = 'fast test';
      const testFn = vi.fn().mockResolvedValue(undefined);

      const result = await testRunner.runTest(testName, testFn);

      expect(result.passed).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle tests with undefined return values', async () => {
      const testName = 'undefined return test';
      const testFn = vi.fn().mockResolvedValue(undefined);

      const result = await testRunner.runTest(testName, testFn);

      expect(result.passed).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle tests with null return values', async () => {
      const testName = 'null return test';
      const testFn = vi.fn().mockResolvedValue(null);

      const result = await testRunner.runTest(testName, testFn);

      expect(result.passed).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle tests that throw null', async () => {
      const testName = 'null throw test';
      const testFn = vi.fn().mockRejectedValue(null);

      const result = await testRunner.runTest(testName, testFn);

      expect(result.passed).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toBe('null');
    });

    it('should handle tests that throw undefined', async () => {
      const testName = 'undefined throw test';
      const testFn = vi.fn().mockRejectedValue(undefined);

      const result = await testRunner.runTest(testName, testFn);

      expect(result.passed).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toBe('undefined');
    });

    it('should handle tests with very long names', async () => {
      const longTestName = 'a'.repeat(1000);
      const testFn = vi.fn().mockResolvedValue(undefined);

      const result = await testRunner.runTest(longTestName, testFn);

      expect(result.name).toBe(longTestName);
      expect(result.passed).toBe(true);
    });

    it('should handle suite names with special characters', async () => {
      await testRunner.runTest('test', () => Promise.resolve());

      const specialNames = [
        'suite-with-dashes',
        'suite_with_underscores',
        'suite.with.dots',
        'suite with spaces',
        'suite\twith\ttabs',
        'suite\nwith\nnewlines',
        'suite/with/slashes',
        'suite\\with\\backslashes',
        'suite:with:colons',
        'suite;with;semicolons',
      ];

      specialNames.forEach(name => {
        const suite = testRunner.getSuite(name);
        expect(suite.name).toBe(name);
        expect(suite.tests).toHaveLength(1);
      });
    });
  });
});
