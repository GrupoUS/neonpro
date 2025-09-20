/**
 * Test for unused imports in route files
 * This test verifies that unused imports are present (will fail initially)
 * and should pass after cleanup
 */

import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

describe('Route Files - Unused Imports', () => {
  const projectRoot = path.resolve(__dirname, '../../../../');

  const routeFiles = [
    'apps/api/tests/integration/pr44-fixes/architecture-issues.test.ts',
    'apps/api/tests/integration/pr44-fixes/code-quality-issues.test.ts',
    'apps/api/tests/integration/pr44-fixes/security-vulnerabilities.test.ts',
    'apps/api/tests/integration/pr44-fixes/targeted-issues.test.ts',
  ];

  describe.each(routeFiles)('%s', filePath => {
    it('should have unused import beforeEach', () => {
      const fullPath = path.join(projectRoot, filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Check that unused import has been removed
      expect(content).not.toContain('beforeEach');

      // Verify beforeEach is not used in the code
      const lines = content.split('\n');

      // beforeEach should not be used anywhere except import
      const beforeEachUsage = lines.filter(line =>
        line.includes('beforeEach')
        && !line.includes('import')
        && !line.includes('from')
        && !line.includes('*')
        && !line.startsWith(' ') // Exclude indented lines (part of import blocks)
        && line.trim() !== ''
      );
      expect(beforeEachUsage).toHaveLength(0);
    });
  });
});
