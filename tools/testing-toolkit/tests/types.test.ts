/**
 * Types Test Suite
 *
 * Tests for type definitions and runtime validation
 */

import { describe, expect, it } from 'vitest';
import type {
  CoverageThreshold,
  QualityGateResult,
  TestCategory,
  TestConfig,
  TestEnvironment,
  TestResult,
  TestSuite,
} from '../src/core/types';

describe('Types', () => {
  describe('TestCategory', () => {
    it('should accept valid test categories', () => {
      const categories: TestCategory[] = ['unit', 'integration', 'e2e', 'performance', 'security'];
      expect(categories).toBeDefined();
      expect(categories.length).toBe(5);
    });

    it('should work with type guards', () => {
      function isValidTestCategory(value: string): value is TestCategory {
        return ['unit', 'integration', 'e2e', 'performance', 'security'].includes(value);
      }

      expect(isValidTestCategory('unit')).toBe(true);
      expect(isValidTestCategory('integration')).toBe(true);
      expect(isValidTestCategory('invalid')).toBe(false);
    });
  });

  describe('TestEnvironment', () => {
    it('should accept valid test environments', () => {
      const environments: TestEnvironment[] = ['jsdom', 'node', 'happy-dom'];
      expect(environments).toBeDefined();
      expect(environments.length).toBe(3);
    });

    it('should work with type guards', () => {
      function isValidTestEnvironment(value: string): value is TestEnvironment {
        return ['jsdom', 'node', 'happy-dom'].includes(value);
      }

      expect(isValidTestEnvironment('node')).toBe(true);
      expect(isValidTestEnvironment('jsdom')).toBe(true);
      expect(isValidTestEnvironment('happy-dom')).toBe(true);
      expect(isValidTestEnvironment('browser')).toBe(false);
      expect(isValidTestEnvironment('invalid')).toBe(false);
    });
  });

  describe('CoverageThreshold', () => {
    it('should accept different coverage threshold values', () => {
      const thresholds: CoverageThreshold[] = ['critical', 'important', 'useful'];

      thresholds.forEach(threshold => {
        expect(['critical', 'important', 'useful']).toContain(threshold);
      });
    });
  });

  describe('TestConfig', () => {
    it('should create valid test config with all properties', () => {
      const config: TestConfig = {
        category: 'unit',
        environment: 'node',
        timeout: 5000,
        retries: 3,
        coverage: {
          threshold: 'critical',
          minimum: 80,
        },
      };

      expect(config.category).toBe('unit');
      expect(config.environment).toBe('node');
      expect(config.timeout).toBe(5000);
      expect(config.retries).toBe(3);
      expect(config.coverage?.threshold).toBe('critical');
      expect(config.coverage?.minimum).toBe(80);
    });

    it('should create valid test config with minimal properties', () => {
      const config: TestConfig = {
        category: 'integration',
        environment: 'node',
      };

      expect(config.category).toBe('integration');
      expect(config.environment).toBe('node');
      expect(config.timeout).toBeUndefined();
      expect(config.retries).toBeUndefined();
      expect(config.coverage).toBeUndefined();
    });

    it('should accept different category values', () => {
      const categories: TestCategory[] = ['unit', 'integration', 'e2e', 'performance', 'security'];

      categories.forEach(category => {
        const config: TestConfig = {
          category,
          environment: 'node',
        };
        expect(config.category).toBe(category);
      });
    });

    it('should accept different environment values', () => {
      const environments: TestEnvironment[] = ['jsdom', 'node', 'happy-dom'];

      environments.forEach(environment => {
        const config: TestConfig = {
          category: 'unit',
          environment,
        };
        expect(config.environment).toBe(environment);
      });
    });
  });

  describe('TestResult', () => {
    it('should create valid test result with all properties', () => {
      const result: TestResult = {
        name: 'Test Case',
        category: 'unit',
        passed: true,
        duration: 150,
        coverage: 85.5,
        errors: ['Error 1', 'Error 2'],
        warnings: ['Warning 1'],
      };

      expect(result.name).toBe('Test Case');
      expect(result.category).toBe('unit');
      expect(result.passed).toBe(true);
      expect(result.duration).toBe(150);
      expect(result.coverage).toBe(85.5);
      expect(result.errors).toHaveLength(2);
      expect(result.warnings).toHaveLength(1);
    });

    it('should create valid test result with minimal properties', () => {
      const result: TestResult = {
        name: 'Minimal Test',
        category: 'integration',
        passed: false,
        duration: 50,
      };

      expect(result.name).toBe('Minimal Test');
      expect(result.category).toBe('integration');
      expect(result.passed).toBe(false);
      expect(result.duration).toBe(50);
      expect(result.coverage).toBeUndefined();
      expect(result.errors).toBeUndefined();
      expect(result.warnings).toBeUndefined();
    });

    it('should handle empty arrays for errors and warnings', () => {
      const result: TestResult = {
        name: 'Test with empty arrays',
        category: 'unit',
        passed: true,
        duration: 100,
        errors: [],
        warnings: [],
      };

      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should handle different category values', () => {
      const categories: TestCategory[] = ['unit', 'integration', 'e2e', 'performance', 'security'];

      categories.forEach(category => {
        const result: TestResult = {
          name: `Test ${category}`,
          category,
          passed: true,
          duration: 100,
        };
        expect(result.category).toBe(category);
      });
    });
  });

  describe('TestSuite', () => {
    it('should create valid test suite with all properties', () => {
      const suite: TestSuite = {
        name: 'Test Suite',
        tests: [
          {
            name: 'Test 1',
            category: 'unit',
            passed: true,
            duration: 100,
          },
          {
            name: 'Test 2',
            category: 'integration',
            passed: false,
            duration: 200,
            errors: ['Failed assertion'],
          },
        ],
        totalDuration: 300,
        passRate: 50,
        coverageRate: 75.5,
      };

      expect(suite.name).toBe('Test Suite');
      expect(suite.tests).toHaveLength(2);
      expect(suite.totalDuration).toBe(300);
      expect(suite.passRate).toBe(50);
      expect(suite.coverageRate).toBe(75.5);
    });

    it('should create valid test suite with minimal properties', () => {
      const suite: TestSuite = {
        name: 'Minimal Suite',
        tests: [],
        totalDuration: 0,
        passRate: 0,
        coverageRate: 0,
      };

      expect(suite.name).toBe('Minimal Suite');
      expect(suite.tests).toEqual([]);
      expect(suite.totalDuration).toBe(0);
      expect(suite.passRate).toBe(0);
      expect(suite.coverageRate).toBe(0);
    });

    it('should handle single test in suite', () => {
      const suite: TestSuite = {
        name: 'Single Test Suite',
        tests: [
          {
            name: 'Only Test',
            category: 'unit',
            passed: true,
            duration: 50,
          },
        ],
        totalDuration: 50,
        passRate: 100,
        coverageRate: 90,
      };

      expect(suite.tests).toHaveLength(1);
      expect(suite.tests[0]?.name).toBe('Only Test');
      expect(suite.passRate).toBe(100);
    });
  });

  describe('QualityGateResult', () => {
    it('should create valid quality gate result with all properties', () => {
      const result: QualityGateResult = {
        gate: 'Test Coverage Gate',
        passed: true,
        actual: 87.5,
        expected: 80,
        critical: false,
      };

      expect(result.gate).toBe('Test Coverage Gate');
      expect(result.passed).toBe(true);
      expect(result.actual).toBe(87.5);
      expect(result.expected).toBe(80);
      expect(result.critical).toBe(false);
    });

    it('should create valid quality gate result with minimal properties', () => {
      const result: QualityGateResult = {
        gate: 'Pass Rate Gate',
        passed: false,
        actual: 75,
        expected: 80,
        critical: true,
      };

      expect(result.gate).toBe('Pass Rate Gate');
      expect(result.passed).toBe(false);
      expect(result.actual).toBe(75);
      expect(result.expected).toBe(80);
      expect(result.critical).toBe(true);
    });

    it('should handle different gate types', () => {
      const coverageGate: QualityGateResult = {
        gate: 'Coverage Gate',
        passed: true,
        actual: 95,
        expected: 90,
        critical: false,
      };

      const performanceGate: QualityGateResult = {
        gate: 'Performance Gate',
        passed: false,
        actual: 250,
        expected: 200,
        critical: true,
      };

      expect(coverageGate.gate).toBe('Coverage Gate');
      expect(performanceGate.gate).toBe('Performance Gate');
      expect(coverageGate.passed).toBe(true);
      expect(performanceGate.passed).toBe(false);
    });
  });

  describe('Type compatibility', () => {
    it('should allow TestResult to be used in TestSuite', () => {
      const testResult: TestResult = {
        name: 'Test Case',
        category: 'unit',
        passed: true,
        duration: 100,
      };

      const testSuite: TestSuite = {
        name: 'Test Suite',
        tests: [testResult],
        totalDuration: 100,
        passRate: 100,
        coverageRate: 0,
      };

      expect(testSuite.tests[0]).toBe(testResult);
      expect(testSuite.tests[0]?.name).toBe('Test Case');
    });

    it('should allow TestConfig to be used with TestResult', () => {
      const config: TestConfig = {
        category: 'unit',
        environment: 'node',
      };

      const result: TestResult = {
        name: 'Test from Config',
        category: config.category,
        passed: true,
        duration: 50,
      };

      expect(result.name).toBe('Test from Config');
      expect(result.category).toBe(config.category);
    });

    it('should handle complex nested structures', () => {
      const complexSuite: TestSuite = {
        name: 'Complex Suite',
        tests: [
          {
            name: 'Test 1',
            category: 'unit',
            passed: true,
            duration: 100,
            coverage: 90,
            errors: ['Error 1'],
            warnings: ['Warning 1', 'Warning 2'],
          },
          {
            name: 'Test 2',
            category: 'integration',
            passed: false,
            duration: 200,
            coverage: 75,
            errors: ['Error 2', 'Error 3'],
          },
        ],
        totalDuration: 300,
        passRate: 50,
        coverageRate: 82.5,
      };

      expect(complexSuite.tests).toHaveLength(2);
      expect(complexSuite.tests[0]?.coverage).toBe(90);
      expect(complexSuite.tests[0]?.errors).toEqual(['Error 1']);
      expect(complexSuite.tests[0]?.warnings).toEqual(['Warning 1', 'Warning 2']);
      expect(complexSuite.tests[1]?.coverage).toBe(75);
      expect(complexSuite.tests[1]?.errors).toEqual(['Error 2', 'Error 3']);
    });
  });
});
