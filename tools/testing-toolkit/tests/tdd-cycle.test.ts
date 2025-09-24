/**
 * TDD Cycle Test Suite
 *
 * Tests for TDD cycle orchestration and agent coordination
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTDDSuite, TDDCycle, TDDCycleConfig } from '../src/core/tdd-cycle';

// Mock console methods
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

vi.spyOn(console, 'log').mockImplementation(mockConsoleLog);
vi.spyOn(console, 'error').mockImplementation(mockConsoleError);

describe('TDDCycle', () => {
  let config: TDDCycleConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    config = {
      feature: 'Test Feature',
      agents: ['tdd-orchestrator', 'code-reviewer'],
      coverageThreshold: 80,
    };
  }

  describe('constructor', () => {
    it('should initialize with valid config', () => {
      const cycle = new TDDCycle(config);
      const results = cycle.getResults();

      expect(results.feature).toBe('Test Feature');
      expect(results.agents).toEqual(['tdd-orchestrator', 'code-reviewer']);
      expect(results.phases).toEqual({});
      expect(results.success).toBe(true);
      expect(results.currentPhase).toBe('COMPLETE');
    }

    it('should handle config with compliance requirements', () => {
      const configWithCompliance: TDDCycleConfig = {
        ...config,
        compliance: ['LGPD', 'ANVISA'],
      };

      const cycle = new TDDCycle(configWithCompliance);
      expect(cycle).toBeDefined();
    }

    it('should handle config without optional properties', () => {
      const minimalConfig: TDDCycleConfig = {
        feature: 'Minimal Feature',
        agents: ['tdd-orchestrator'],
      };

      const cycle = new TDDCycle(minimalConfig);
      expect(cycle).toBeDefined();
    }
  }

  describe('redPhase', () => {
    it('should complete RED phase when tests fail as expected', async () => {
      const cycle = new TDDCycle(config);
      const failingTest = () => {
        throw new Error('Test should fail in RED phase');
      };

      const result = await cycle.redPhase(failingTest);

      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith('🔴 RED Phase: Test Feature');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ RED Phase complete - Tests failing as expected',
      );
    }

    it('should fail RED phase when tests pass unexpectedly', async () => {
      const cycle = new TDDCycle(config);
      const passingTest = () => {
        // Test passes - this should fail in RED phase
      };

      const result = await cycle.redPhase(passingTest);

      expect(result).toBe(false);
    }

    it('should set correct phase configuration', async () => {
      const cycle = new TDDCycle(config);
      const failingTest = () => {
        throw new Error('Test failure');
      };

      await cycle.redPhase(failingTest);
      const results = cycle.getResults();

      expect(results.phases['red-phase']).toBe(true);
      expect(results.currentPhase).toBe('RED');
    }

    it('should handle different agent configurations', async () => {
      const configWithAgents: TDDCycleConfig = {
        feature: 'Multi-agent Feature',
        agents: ['architect-review', 'code-reviewer', 'tdd-orchestrator'],
      };

      const cycle = new TDDCycle(configWithAgents);
      const failingTest = () => {
        throw new Error('Test failure');
      };

      await cycle.redPhase(failingTest);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Primary Agent: tdd-orchestrator',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Support Agents: architect-review, tdd-orchestrator',
      );
    }
  }

  describe('greenPhase', () => {
    it('should complete GREEN phase when implementation passes', async () => {
      const cycle = new TDDCycle(config);
      const passingImplementation = () => {
        // Implementation that passes tests
      };

      const result = await cycle.greenPhase(passingImplementation);

      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🟢 GREEN Phase: Test Feature',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ GREEN Phase complete - Tests passing',
      );
    }

    it('should fail GREEN phase when implementation fails', async () => {
      const cycle = new TDDCycle(config);
      const failingImplementation = () => {
        throw new Error('Implementation failed');
      };

      const result = await cycle.greenPhase(failingImplementation);

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ GREEN Phase failed:',
        expect.any(Error),
      );
    }

    it('should set correct phase configuration', async () => {
      const cycle = new TDDCycle(config);
      const passingImplementation = () => {
        // Implementation that passes tests
      };

      await cycle.greenPhase(passingImplementation);
      const results = cycle.getResults();

      expect(results.phases['green-phase']).toBe(true);
      expect(results.currentPhase).toBe('GREEN');
    }
  }

  describe('refactorPhase', () => {
    it('should complete REFACTOR phase when refactoring succeeds', async () => {
      const cycle = new TDDCycle(config);
      const successfulRefactoring = () => {
        // Refactoring that maintains functionality
      };

      const result = await cycle.refactorPhase(successfulRefactoring);

      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔄 REFACTOR Phase: Test Feature',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ REFACTOR Phase complete - Code improved',
      );
    }

    it('should fail REFACTOR phase when refactoring fails', async () => {
      const cycle = new TDDCycle(config);
      const failingRefactoring = () => {
        throw new Error('Refactoring failed');
      };

      const result = await cycle.refactorPhase(failingRefactoring);

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ REFACTOR Phase failed:',
        expect.any(Error),
      );
    }

    it('should set correct phase configuration', async () => {
      const cycle = new TDDCycle(config);
      const successfulRefactoring = () => {
        // Refactoring that maintains functionality
      };

      await cycle.refactorPhase(successfulRefactoring);
      const results = cycle.getResults();

      expect(results.phases['refactor-phase']).toBe(true);
      expect(results.currentPhase).toBe('REFACTOR');
    }
  }

  describe('getResults', () => {
    it('should return initial results', () => {
      const cycle = new TDDCycle(config);
      const results = cycle.getResults();

      expect(results.feature).toBe('Test Feature');
      expect(results.agents).toEqual(['tdd-orchestrator', 'code-reviewer']);
      expect(results.phases).toEqual({});
      expect(results.success).toBe(true);
      expect(results.currentPhase).toBe('COMPLETE');
    }

    it('should return results after phases', async () => {
      const cycle = new TDDCycle(config);

      await cycle.redPhase(() => {
        throw new Error('Test failure')
      }

      await cycle.greenPhase(() => {
        // Implementation that passes
      }

      const results = cycle.getResults();

      expect(results.phases['red-phase']).toBe(true);
      expect(results.phases['green-phase']).toBe(true);
      expect(results.success).toBe(true);
      expect(results.currentPhase).toBe('GREEN');
    }

    it('should calculate success correctly when phases fail', async () => {
      const cycle = new TDDCycle(config);

      await cycle.redPhase(() => {
        // Test passes - should fail in RED phase
      }

      const results = cycle.getResults();

      expect(results.phases['red-phase']).toBe(false);
      expect(results.success).toBe(false);
    }
  }

  describe('complete TDD cycle', () => {
    it('should complete full cycle successfully', async () => {
      const cycle = new TDDCycle(config);

      // RED phase - tests should fail
      const redResult = await cycle.redPhase(() => {
        throw new Error('Test failure')
      }
      expect(redResult).toBe(true);

      // GREEN phase - implementation should pass
      const greenResult = await cycle.greenPhase(() => {
        // Implementation that passes tests
      }
      expect(greenResult).toBe(true);

      // REFACTOR phase - refactoring should succeed
      const refactorResult = await cycle.refactorPhase(() => {
        // Refactoring that maintains functionality
      }
      expect(refactorResult).toBe(true);

      const results = cycle.getResults();
      expect(results.success).toBe(true);
      expect(results.phases['red-phase']).toBe(true);
      expect(results.phases['green-phase']).toBe(true);
      expect(results.phases['refactor-phase']).toBe(true);
    }

    it('should handle cycle with failures', async () => {
      const cycle = new TDDCycle(config);

      // RED phase fails (tests pass when they should fail)
      const redResult = await cycle.redPhase(() => {
        // Test passes - should fail in RED phase
      }
      expect(redResult).toBe(false);

      // GREEN phase fails
      const greenResult = await cycle.greenPhase(() => {
        throw new Error('Implementation failed')
      }
      expect(greenResult).toBe(false);

      // REFACTOR phase fails
      const refactorResult = await cycle.refactorPhase(() => {
        throw new Error('Refactoring failed')
      }
      expect(refactorResult).toBe(false);

      const results = cycle.getResults();
      expect(results.success).toBe(false);
      expect(results.phases['red-phase']).toBe(false);
      expect(results.phases['green-phase']).toBe(false);
      expect(results.phases['refactor-phase']).toBe(false);
    }
  }

  describe('createTDDSuite', () => {
    it('should create a complete TDD test suite', () => {
      const implementation = {
        redPhase: () => {
          throw new Error('Test should fail')
        },
        greenPhase: () => {
          // Implementation passes
        },
        refactorPhase: () => {
          // Refactoring succeeds
        },
      };

      // Note: This creates a test suite, but we can't directly test it here
      // The function itself should not throw
      expect(() => {
        createTDDSuite(config, implementation
      }).not.toThrow(
    }

    it('should handle different configurations', () => {
      const complexConfig: TDDCycleConfig = {
        feature: 'Complex Feature',
        agents: [
          'architect-review',
          'code-reviewer',
          'tdd-orchestrator',
        ],
        compliance: ['LGPD', 'ANVISA', 'CFM'],
        coverageThreshold: 95,
      };

      const implementation = {
        redPhase: () => {
          throw new Error('Test failure')
        },
        greenPhase: () => {
          // Implementation passes
        },
        refactorPhase: () => {
          // Refactoring succeeds
        },
      };

      expect(() => {
        createTDDSuite(complexConfig, implementation
      }).not.toThrow(
    }
  }

  describe('error handling', () => {
    it('should handle errors in test functions gracefully', async () => {
      const cycle = new TDDCycle(config);

      const result = await cycle.redPhase(() => {
        throw new Error('Unexpected error')
      }

      expect(result).toBe(true); // Should pass because test failed as expected
    }

    it('should handle errors in implementation functions', async () => {
      const cycle = new TDDCycle(config);

      const result = await cycle.greenPhase(() => {
        throw new Error('Implementation error')
      }

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ GREEN Phase failed:',
        expect.any(Error),
      );
    }

    it('should handle errors in refactoring functions', async () => {
      const cycle = new TDDCycle(config);

      const result = await cycle.refactorPhase(() => {
        throw new Error('Refactoring error')
      }

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ REFACTOR Phase failed:',
        expect.any(Error),
      );
    }
  }

  describe('phase transitions', () => {
    it('should track current phase correctly', async () => {
      const cycle = new TDDCycle(config);

      expect(cycle.getResults().currentPhase).toBe('COMPLETE')

      await cycle.redPhase(() => {
        throw new Error('Test failure')
      }
      expect(cycle.getResults().currentPhase).toBe('RED')

      await cycle.greenPhase(() => {
        // Implementation passes
      }
      expect(cycle.getResults().currentPhase).toBe('GREEN')

      await cycle.refactorPhase(() => {
        // Refactoring succeeds
      }
      expect(cycle.getResults().currentPhase).toBe('REFACTOR')
    }
  }
}
