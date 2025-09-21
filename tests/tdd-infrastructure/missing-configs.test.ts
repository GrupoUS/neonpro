import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

describe('TDD Infrastructure - Missing Configurations Validation', () => {
  const packagesDir = join(process.cwd(), 'packages');
  
  // Packages that should have vitest.config.ts but are currently missing
  const packagesMissingConfigs = [
    'security', 'ui', 'validators', 'schemas', 'utils', 'compliance'
  ];

  describe('Configuration Existence', () => {
    it('should fail when packages are missing vitest.config.ts', () => {
      // This test should FAIL for all 6 missing packages
      // This drives the creation of the missing configurations
      const missingConfigs = packagesMissingConfigs.filter(pkg => {
        const configPath = join(packagesDir, pkg, 'vitest.config.ts');
        return !existsSync(configPath);
      });

      // Should FAIL initially - all 6 packages missing configs
      expect(missingConfigs).toHaveLength(0);
    });

    it('should validate each specific missing package', () => {
      packagesMissingConfigs.forEach(pkg => {
        const configPath = join(packagesDir, pkg, 'vitest.config.ts');
        
        // Each of these should FAIL individually
        expect(existsSync(configPath)).toBe(true);
      });
    });
  });

  describe('Package Structure Validation', () => {
    it('should verify packages exist and are structured properly', () => {
      packagesMissingConfigs.forEach(pkg => {
        const packageDir = join(packagesDir, pkg);
        const packageJsonPath = join(packageDir, 'package.json');
        
        // Verify package directory exists
        expect(existsSync(packageDir)).toBe(true);
        
        // Verify package.json exists
        expect(existsSync(packageJsonPath)).toBe(true);
      });
    });
  });

  describe('Test Directory Readiness', () => {
    it('should have __tests__ directories ready for TDD', () => {
      packagesMissingConfigs.forEach(pkg => {
        const testDir = join(packagesDir, pkg, '__tests__');
        
        // This test creates the expectation for test directories
        // It may fail initially, driving the creation of test structure
        expect(existsSync(testDir)).toBe(true);
      });
    });
  });
});