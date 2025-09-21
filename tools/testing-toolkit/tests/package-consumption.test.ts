/**
 * Package Consumption Test
 * Tests that the testing toolkit can be consumed as a package
 */

import { describe, expect, it } from 'vitest';

describe('Package Consumption', () => {
  it('should import and use createTDDSuite without Vitest errors', () => {
    // Test that the function can be imported and called
    const result = createTDDSuite('Test Suite', {
      redPhase: () => {
        expect(true).toBe(true);
      },
      greenPhase: () => {
        expect(true).toBe(true);
      },
      refactorPhase: () => {
        expect(true).toBe(true);
      },
    });

    expect(result).toBeDefined();
  });

  // Import the function directly to test
  const { createTDDSuite } = require('../src/core/tdd-cycle');

  expect(typeof createTDDSuite).toBe('function');

  // Test that we can create a TDD suite without errors
  // The function expects a config object and implementation object
  const suite = createTDDSuite(
    {
      feature: 'test-suite',
      description: 'Test description',
      agents: ['test-agent'],
    },
    {
      // RED phase should throw an error to simulate failing tests
      redPhase: () => {
        throw new Error('Tests should fail in RED phase');
      },
      greenPhase: () => {/* Implementation that passes tests */},
      refactorPhase: () => {/* Code improvement */},
    },
    { forceMock: true },
  );
  expect(suite).toBeDefined();
  expect(suite.name).toBe('test-suite');
  expect(suite.description).toBe('TDD: test-suite');
});
