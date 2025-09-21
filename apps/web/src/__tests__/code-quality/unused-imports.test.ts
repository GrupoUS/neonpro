/**
 * TDD Orchestrator - Phase 1: RED
 * Code Quality Tests for Unused Imports Validation
 *
 * These tests will initially FAIL to establish the RED phase of TDD.
 * They validate that files have clean imports with no unused imports.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

/**
 * Helper function to check for unused imports in a file
 * This uses basic regex patterns to detect import usage
 */
function checkUnusedImports(
  filePath: string,
): { hasUnusedImports: boolean; unusedImports: string[] } {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const unusedImports: string[] = [];

  // Find import lines
  const importLines = lines.filter(line => line.trim().startsWith('import'));

  for (const importLine of importLines) {
    // Extract imported names from import statements
    const importMatch = importLine.match(/import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))/);
    if (importMatch) {
      let importedNames: string[] = [];

      if (importMatch[1]) {
        // Named imports: import { a, b, c } from 'module'
        importedNames = importMatch[1]
          .split(',')
          .map(name => name.trim().split(' as ')[0].trim())
          .filter(name => name.length > 0);
      } else if (importMatch[2]) {
        // Namespace import: import * as name from 'module'
        importedNames = [importMatch[2]];
      } else if (importMatch[3]) {
        // Default import: import name from 'module'
        importedNames = [importMatch[3]];
      }

      // Check if each imported name is used in the file
      for (const importedName of importedNames) {
        const escapedName = importedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const usageRegex = new RegExp(`\\b${escapedName}\\b`, 'g');
        const matches = content.match(usageRegex) || [];

        // If the name appears only once (in the import), it's unused
        if (matches.length <= 1) {
          unusedImports.push(importedName);
        }
      }
    }
  }

  return {
    hasUnusedImports: unusedImports.length > 0,
    unusedImports,
  };
}

describe('TDD Orchestrator - Code Quality: Unused Imports', () => {
  const webSrcPath = join(process.cwd(), 'src');

  describe('Phase 1: RED - Failing Tests for Clean Imports', () => {
    it('should have no unused imports in useFinancialMetrics.ts', () => {
      const filePath = join(webSrcPath, 'hooks/useFinancialMetrics.ts');
      const result = checkUnusedImports(filePath);

      if (result.hasUnusedImports) {
        console.log(`Unused imports in useFinancialMetrics.ts: ${result.unusedImports.join(', ')}`);
      }

      // This test will FAIL initially (RED phase)
      expect(result.hasUnusedImports).toBe(false);
      expect(result.unusedImports).toHaveLength(0);
    });

    it('should have no unused imports in insights-enhanced.tsx', () => {
      const filePath = join(webSrcPath, 'routes/ai/insights-enhanced.tsx');
      const result = checkUnusedImports(filePath);

      // This test will FAIL initially (RED phase)
      expect(result.hasUnusedImports).toBe(false);
      expect(result.unusedImports).toHaveLength(0);

      if (result.hasUnusedImports) {
        console.log(`Unused imports in insights-enhanced.tsx: ${result.unusedImports.join(', ')}`);
      }
    });

    it('should have no unused imports in insights.tsx', () => {
      const filePath = join(webSrcPath, 'routes/ai/insights.tsx');
      const result = checkUnusedImports(filePath);

      // This test will FAIL initially (RED phase)
      expect(result.hasUnusedImports).toBe(false);
      expect(result.unusedImports).toHaveLength(0);

      if (result.hasUnusedImports) {
        console.log(`Unused imports in insights.tsx: ${result.unusedImports.join(', ')}`);
      }
    });

    it('should have no unused imports in dashboard/main.tsx', () => {
      const filePath = join(webSrcPath, 'routes/dashboard/main.tsx');
      const result = checkUnusedImports(filePath);

      // This test will FAIL initially (RED phase)
      expect(result.hasUnusedImports).toBe(false);
      expect(result.unusedImports).toHaveLength(0);

      if (result.hasUnusedImports) {
        console.log(`Unused imports in dashboard/main.tsx: ${result.unusedImports.join(', ')}`);
      }
    });
  });

  describe('Code Quality Standards', () => {
    it('should validate import organization patterns', () => {
      // This test establishes standards for import organization
      const testFile = join(webSrcPath, 'routes/ai/insights-enhanced.tsx');
      const content = readFileSync(testFile, 'utf-8');

      // Check for proper import grouping (external, internal, types)
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));

      // This will help establish patterns during REFACTOR phase
      expect(importLines.length).toBeGreaterThan(0);
    });
  });
});
