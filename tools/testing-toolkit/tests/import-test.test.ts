import { describe, expect, it } from 'vitest';
import { createTDDSuite } from '../src/core/tdd-cycle';

describe('TDD Suite Test', () => {
  it('should create TDD suite successfully', () => {
    const result = createTDDSuite({
      feature: 'Example TDD Cycle',
      agents: ['test-agent'],
      coverageThreshold: 80,
    }, {
      redPhase: () => {
        // This should fail initially
        expect(false).toBe(true);
      },
      greenPhase: () => {
        // Make it pass
        expect(true).toBe(true);
      },
      refactorPhase: () => {
        // Refactor code
        expect(true).toBe(true);
      },
    });

    expect(result).toBeDefined();
  });
});
