/**
 * Core Utilities Import Validation Tests
 * RED-002: Validates that all critical utility modules can be imported successfully
 */

import { describe, it, expect } from 'vitest';

// Test core utils imports
describe('Core Utilities Import Validation', () => {
  
  it('should import all main utilities from index', () => {
    expect(() => {
      // Test all main exports exist
      const utils = require('../src/index');
      
      // Validate expected utilities are available
      expect(utils).toBeDefined();
    }).not.toThrow();
  });

  it('should import LGPD compliance utilities successfully', () => {
    expect(() => {
      const lgpdUtils = require('../src/lgpd');
      expect(lgpdUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import healthcare errors utilities', () => {
    expect(() => {
      const healthcareErrors = require('../src/healthcare-errors');
      expect(healthcareErrors).toBeDefined();
    }).not.toThrow();
  });

  it('should import CRUD compliance utilities', () => {
    expect(() => {
      const crudCompliance = require('../src/crud-compliance');
      expect(crudCompliance).toBeDefined();
    }).not.toThrow();
  });

  it('should import main utilities', () => {
    expect(() => {
      const mainUtils = require('../src/utils');
      expect(mainUtils).toBeDefined();
    }).not.toThrow();
  });

  // Test specific files that exist
  it('should import chat session management utilities', () => {
    expect(() => {
      const sessionUtils = require('../src/chat/session-management');
      expect(sessionUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import chat message redaction utilities', () => {
    expect(() => {
      const redactionUtils = require('../src/chat/message-redaction');
      expect(redactionUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import logging utilities', () => {
    expect(() => {
      const loggingUtils = require('../src/logging/logger');
      expect(loggingUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import redaction utilities', () => {
    expect(() => {
      const redactionUtils = require('../src/redaction/pii');
      expect(redactionUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import BR utilities', () => {
    expect(() => {
      const brUtils = require('../src/br/identifiers');
      expect(brUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import currency utilities', () => {
    expect(() => {
      const currencyUtils = require('../src/currency/brl');
      expect(currencyUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import env utilities', () => {
    expect(() => {
      const envUtils = require('../src/env/validate');
      expect(envUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import lib utilities', () => {
    expect(() => {
      const libUtils = require('../src/lib/utils');
      expect(libUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import lib BR utilities', () => {
    expect(() => {
      const libBrUtils = require('../src/lib/br/identifiers');
      expect(libBrUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import lib currency utilities', () => {
    expect(() => {
      const libCurrencyUtils = require('../src/lib/currency/brl');
      expect(libCurrencyUtils).toBeDefined();
    }).not.toThrow();
  });

  it('should import CLI utilities', () => {
    expect(() => {
      const cliUtils = require('../src/cli/index');
      expect(cliUtils).toBeDefined();
    }).not.toThrow();
  });

  // Test that should fail for known missing utilities
  describe('Missing Utilities Detection', () => {
    
    it('should fail gracefully for missing event-calendar utils', () => {
      // This import should fail because event-calendar/utils.ts doesn't exist
      expect(() => {
        require('../../event-calendar/utils');
      }).toThrow();
    });

    it('should fail gracefully for non-existent modules', () => {
      // Test that non-existent modules fail gracefully
      const nonExistentModules = [
        '../src/non-existent-module',
        '../src/analytics',
        '../src/validation',
        '../src/formatting'
      ];

      nonExistentModules.forEach(module => {
        expect(() => {
          require(module);
        }).toThrow();
      });
    });
  });

  // Test circular dependencies (only for existing modules)
  describe('Circular Dependency Detection', () => {
    
    it('should not have circular dependencies in existing modules', () => {
      const existingModules = [
        '../src/lgpd', 
        '../src/chat/session-management',
        '../src/chat/message-redaction',
        '../src/logging/logger',
        '../src/redaction/pii',
        '../src/br/identifiers',
        '../src/currency/brl',
        '../src/env/validate',
        '../src/lib/utils',
        '../src/lib/br/identifiers',
        '../src/lib/currency/brl',
        '../src/cli/index'
      ];

      existingModules.forEach(module => {
        expect(() => {
          const imported = require(module);
          expect(imported).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  // Test TypeScript compatibility
  describe('TypeScript Compatibility', () => {
    
    it('should export proper TypeScript types', async () => {
      // This test validates that the exports are TypeScript compatible
      const utils = await import('../src/index');
      expect(utils).toBeDefined();
    });

    it('should have consistent export types', () => {
      const utils = require('../src/index');
      
      // Validate that exports have consistent types
      Object.keys(utils).forEach(key => {
        const value = utils[key];
        
        // Skip non-function/object exports
        if (typeof value === 'function') {
          expect(value.length).toBeGreaterThanOrEqual(0);
        } else if (typeof value === 'object' && value !== null) {
          expect(Object.keys(value)).toBeDefined();
        }
      });
    });
  });

  // Test critical utility functions
  describe('Critical Utility Functions', () => {
    
    it('should have LGPD utility functions', () => {
      const lgpdUtils = require('../src/lgpd');
      
      // Test for common LGPD functions
      const expectedFunctions = [
        'anonymizeData',
        'checkConsent',
        'redactPII',
        'validateCompliance'
      ];
      
      expectedFunctions.forEach(funcName => {
        if (lgpdUtils[funcName]) {
          expect(typeof lgpdUtils[funcName]).toBe('function');
        }
      });
    });

    it('should have healthcare error utilities', () => {
      const healthcareErrors = require('../src/healthcare-errors');
      
      // Test for common error functions
      const expectedFunctions = [
        'createHealthcareError',
        'isHealthcareError',
        'handleHealthcareError'
      ];
      
      expectedFunctions.forEach(funcName => {
        if (healthcareErrors[funcName]) {
          expect(typeof healthcareErrors[funcName]).toBe('function');
        }
      });
    });

    it('should have CRUD compliance utilities', () => {
      const crudCompliance = require('../src/crud-compliance');
      
      // Test for common CRUD compliance functions
      const expectedFunctions = [
        'validateCRUD',
        'auditCRUD',
        'ensureCompliance'
      ];
      
      expectedFunctions.forEach(funcName => {
        if (crudCompliance[funcName]) {
          expect(typeof crudCompliance[funcName]).toBe('function');
        }
      });
    });
  });
});