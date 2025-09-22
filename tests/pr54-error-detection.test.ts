/**
 * PR 54 Error Detection Tests - RED Phase
 *
 * Failing tests to detect all issues in PR 54:
 * - JSX syntax errors in .ts files
 * - POST request format issues (data vs json)
 * - Variable reference inconsistencies
 * - Test structure issues
 *
 * These tests are designed to FAIL initially and pass once issues are fixed.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('PR 54 Error Detection - RED Phase', () => {
  describe('JSX Syntax Error Detection', () => {
    it('should detect JSX syntax errors in bundle-optimization-simple.test.ts', () => {
<<<<<<< HEAD
      const filePath = join(__dirname, '../apps/web/src/__tests__/bundle-optimization-simple.test.ts')
      
      // Skip test if file doesn't exist
      if (!existsSync(filePath)) {
        console.log(`File not found: ${filePath}`
=======
      const filePath = join(__dirname, '../apps/web/src/__tests__/bundle-optimization-simple.test.ts');
      
      // Skip test if file doesn't exist
      if (!existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
>>>>>>> origin/main
        expect(true).toBe(true);
        return;
      }

      const content = readFileSync(filePath, 'utf8');
      
      // Detect JSX syntax patterns in .ts file
      const jsxPatterns = [
        /<[^>]+>/g, // JSX tags
        /\/>/g, // Self-closing tags
        /<\/[^>]+>/g, // Closing tags
        /={\(.*?\)}>/g, // JSX props with functions
      ];

<<<<<<< HEAD
      const hasJsx = jsxPatterns.some(pattern => pattern.test(content)
      
      // This should FAIL because .ts files shouldn't have JSX
      expect(hasJsx).toBe(false);
    }

    it('should detect missing closing parentheses in describe blocks', () => {
      const filePath = join(__dirname, '../apps/web/src/__tests__/bundle-optimization-simple.test.ts')
=======
      const hasJsx = jsxPatterns.some(pattern => pattern.test(content));
      
      // This should FAIL because .ts files shouldn't have JSX
      expect(hasJsx).toBe(false);
    });

    it('should detect missing closing parentheses in describe blocks', () => {
      const filePath = join(__dirname, '../apps/web/src/__tests__/bundle-optimization-simple.test.ts');
>>>>>>> origin/main
      
      if (!existsSync(filePath)) {
        expect(true).toBe(true);
        return;
      }

      const content = readFileSync(filePath, 'utf8');
      
      // Detect malformed describe blocks with missing closing parentheses
      const malformedDescribePatterns = [
        /describe\(\s*['"][^'"]*['"]\s*,\s*\(\s*=>\s*{[^}]*$/gm, // Missing closing )
        /it\(\s*['"][^'"]*['"]\s*,\s*\(\s*=>\s*{[^}]*$/gm, // Missing closing )
      ];

      const hasMalformedBlocks = malformedDescribePatterns.some(pattern => {
<<<<<<< HEAD
        const matches = content.match(pattern
        return matches && matches.length > 0;
      }

      // This should FAIL because there are malformed blocks
      expect(hasMalformedBlocks).toBe(false);
    }

    it('should detect JSX syntax errors in chart-css-syntax.test.ts', () => {
      const filePath = join(__dirname, '../apps/web/src/__tests__/chart-css-syntax.test.ts')
=======
        const matches = content.match(pattern);
        return matches && matches.length > 0;
      });

      // This should FAIL because there are malformed blocks
      expect(hasMalformedBlocks).toBe(false);
    });

    it('should detect JSX syntax errors in chart-css-syntax.test.ts', () => {
      const filePath = join(__dirname, '../apps/web/src/__tests__/chart-css-syntax.test.ts');
>>>>>>> origin/main
      
      if (!existsSync(filePath)) {
        expect(true).toBe(true);
        return;
      }

      const content = readFileSync(filePath, 'utf8');
      
      // Detect JSX syntax patterns in .ts file
      const jsxPatterns = [
        /<[^>]+>/g, // JSX tags
        /\/>/g, // Self-closing tags
        /<\/[^>]+>/g, // Closing tags
      ];

<<<<<<< HEAD
      const hasJsx = jsxPatterns.some(pattern => pattern.test(content)
      
      // This should FAIL because .ts files shouldn't have JSX
      expect(hasJsx).toBe(false);
    }
  }

  describe('POST Request Format Detection', () => {
    it('should detect incorrect POST request format in performance.spec.ts', () => {
      const filePath = join(__dirname, '../apps/web/e2e/performance.spec.ts')
=======
      const hasJsx = jsxPatterns.some(pattern => pattern.test(content));
      
      // This should FAIL because .ts files shouldn't have JSX
      expect(hasJsx).toBe(false);
    });
  });

  describe('POST Request Format Detection', () => {
    it('should detect incorrect POST request format in performance.spec.ts', () => {
      const filePath = join(__dirname, '../apps/web/e2e/performance.spec.ts');
>>>>>>> origin/main
      
      if (!existsSync(filePath)) {
        expect(true).toBe(true);
        return;
      }

      const content = readFileSync(filePath, 'utf8');
      
<<<<<<< HEAD
      // Detect incorrect POST request format using 'data' instead of 'json')
      const incorrectPostPattern = /request\.post\([^,]+,\s*{[^}]*data\s*:/g;
      const hasIncorrectFormat = incorrectPostPattern.test(content
      
      // This should FAIL because POST requests should use 'json', not 'data')
      expect(hasIncorrectFormat).toBe(false);
    }

    it('should detect inconsistent query parameter naming', () => {
      const filePath = join(__dirname, '../apps/web/e2e/performance.spec.ts')
=======
      // Detect incorrect POST request format using 'data' instead of 'json'
      const incorrectPostPattern = /request\.post\([^,]+,\s*{[^}]*data\s*:/g;
      const hasIncorrectFormat = incorrectPostPattern.test(content);
      
      // This should FAIL because POST requests should use 'json', not 'data'
      expect(hasIncorrectFormat).toBe(false);
    });

    it('should detect inconsistent query parameter naming', () => {
      const filePath = join(__dirname, '../apps/web/e2e/performance.spec.ts');
>>>>>>> origin/main
      
      if (!existsSync(filePath)) {
        expect(true).toBe(true);
        return;
      }

      const content = readFileSync(filePath, 'utf8');
      
<<<<<<< HEAD
      // Detect inconsistent use of 'query' vs '_query')
=======
      // Detect inconsistent use of 'query' vs '_query'
>>>>>>> origin/main
      const queryMatches = (content.match(/query:/g) || []).length;
      const underscoreQueryMatches = (content.match(/_query:/g) || []).length;
      
      const hasInconsistentNaming = queryMatches > 0 && underscoreQueryMatches > 0;
      
      // This should FAIL because naming should be consistent
      expect(hasInconsistentNaming).toBe(false);
<<<<<<< HEAD
    }
  }

  describe('Variable Reference Consistency Detection', () => {
    it('should detect unused underscore prefix variables', () => {
      const filePath = join(__dirname, '../apps/web/src/__tests__/bundle-optimization-simple.test.ts')
=======
    });
  });

  describe('Variable Reference Consistency Detection', () => {
    it('should detect unused underscore prefix variables', () => {
      const filePath = join(__dirname, '../apps/web/src/__tests__/bundle-optimization-simple.test.ts');
>>>>>>> origin/main
      
      if (!existsSync(filePath)) {
        expect(true).toBe(true);
        return;
      }

      const content = readFileSync(filePath, 'utf8');
      
      // Detect unused underscore prefix variables
      const underscoreVarPattern = /it\s*\(\s*([^,]+),/g;
      const matches = [...content.matchAll(underscoreVarPattern)];
      
      const hasUnusedUnderscore = matches.some(match => {
        const varName = match[1];
<<<<<<< HEAD
        return varName.startsWith('_') && !content.includes(varName.substring(1)
      }
      
      // This should FAIL because underscore variables should be used consistently
      expect(hasUnusedUnderscore).toBe(false);
    }
  }
=======
        return varName.startsWith('_') && !content.includes(varName.substring(1));
      });
      
      // This should FAIL because underscore variables should be used consistently
      expect(hasUnusedUnderscore).toBe(false);
    });
  });
>>>>>>> origin/main

  describe('File Extension Validation', () => {
    it('should detect .ts files that contain JSX content', () => {
      const testFiles = [
        'apps/web/src/__tests__/bundle-optimization-simple.test.ts',
        'apps/web/src/__tests__/chart-css-syntax.test.ts',
      ];

      const invalidFiles = testFiles.filter(file => {
<<<<<<< HEAD
        const filePath = join(__dirname, '../', file
=======
        const filePath = join(__dirname, '../', file);
>>>>>>> origin/main
        if (!existsSync(filePath)) return false;
        
        const content = readFileSync(filePath, 'utf8');
        return /<[^>]+>/.test(content); // Contains JSX
<<<<<<< HEAD
      }

      // This should FAIL because JSX files should have .tsx extension
      expect(invalidFiles.length).toBe(0
    }
  }

  describe('Bundle Validation Issues', () => {
    it('should detect bundle validation tests with mock data', () => {
      const filePath = join(__dirname, '../apps/web/src/__tests__/bundle-validation.test.ts')
=======
      });

      // This should FAIL because JSX files should have .tsx extension
      expect(invalidFiles.length).toBe(0);
    });
  });

  describe('Bundle Validation Issues', () => {
    it('should detect bundle validation tests with mock data', () => {
      const filePath = join(__dirname, '../apps/web/src/__tests__/bundle-validation.test.ts');
>>>>>>> origin/main
      
      if (!existsSync(filePath)) {
        expect(true).toBe(true);
        return;
      }

      const content = readFileSync(filePath, 'utf8');
      
      // Detect mock data that should be real validation
      const mockDataPattern = /mock.*bundle.*size|bundle.*size.*mock/gi;
<<<<<<< HEAD
      const hasMockData = mockDataPattern.test(content
      
      // This should FAIL because bundle validation should use real data
      expect(hasMockData).toBe(false);
    }
  }
}
=======
      const hasMockData = mockDataPattern.test(content);
      
      // This should FAIL because bundle validation should use real data
      expect(hasMockData).toBe(false);
    });
  });
});
>>>>>>> origin/main
