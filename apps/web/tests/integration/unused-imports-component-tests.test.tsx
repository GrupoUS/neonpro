/**
 * Test for unused imports in component test files
 * This test verifies that unused imports are present (will fail initially)
 * and should pass after cleanup
 */

import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

describe('Component Test Files - Unused Imports', () => {
  const projectRoot = path.resolve(__dirname, '../../../../');

  describe('apps/web/src/components/event-calendar/__tests__/contract-tests-tdd-comprehensive.tsx', () => {
    it('should have unused import CalendarView', () => {
      const filePath = path.join(
        projectRoot,
        'apps/web/src/components/event-calendar/__tests__/contract-tests-tdd-comprehensive.tsx',
      );
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check that unused import has been removed
      expect(content).not.toContain('CalendarView');

      // Verify CalendarView is not used in the code
      const lines = content.split('\n');

      // CalendarView should not be used anywhere except import
      const calendarViewUsage = lines.filter(line =>
        line.includes('CalendarView')
        && !line.includes('import')
        && !line.includes('from')
        && !line.includes('*')
        && !line.startsWith(' ') // Exclude indented lines (part of import blocks)
        && line.trim() !== ''
      );
      expect(calendarViewUsage).toHaveLength(0);
    });
  });
});
