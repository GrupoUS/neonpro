/**
 * Test for unused imports in AI service files
 * This test verifies that unused imports are present (will fail initially)
 * and should pass after cleanup
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('AI Service Files - Unused Imports', () => {
  const projectRoot = path.resolve(__dirname, '../../../../');

  describe('apps/api/src/services/ai-data-service.ts', () => {
    it('should have unused imports AgentError and QueryIntent', () => {
      const filePath = path.join(projectRoot, 'apps/api/src/services/ai-data-service.ts');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check that unused imports are present
      expect(content).toContain("import {\n  AgentError,");
      expect(content).toContain("  QueryIntent,\n} from '@neonpro/types';");

      // Verify these imports are not used in the code
      const lines = content.split('\n');

      // AgentError should not be used anywhere except import
      const agentErrorUsage = lines.filter(line =>
        line.includes('AgentError') &&
        !line.includes('import') &&
        !line.includes('from') &&
        !line.includes('*') &&
        line.trim() !== ''
      );
      console.log('AgentError usage found:', agentErrorUsage);
      expect(agentErrorUsage).toHaveLength(0);

      // QueryIntent should not be used anywhere except import
      const queryIntentUsage = lines.filter(line =>
        line.includes('QueryIntent') &&
        !line.includes('import') &&
        !line.includes('*') &&
        line.trim() !== ''
      );
      expect(queryIntentUsage).toHaveLength(0);
    });
  });

  describe('apps/api/src/routes/ai/data-agent.ts', () => {
    it('should have unused import AgentError', () => {
      const filePath = path.join(projectRoot, 'apps/api/src/routes/ai/data-agent.ts');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check that unused import is present
      expect(content).toContain("  AgentError,");

      // Verify AgentError is not used in the code (QueryIntent is used, so we don't check it)
      const lines = content.split('\n');

      // AgentError should not be used anywhere except import
      const agentErrorUsage = lines.filter(line =>
        line.includes('AgentError') &&
        !line.includes('import') &&
        !line.includes('*') &&
        line.trim() !== ''
      );
      expect(agentErrorUsage).toHaveLength(0);
    });
  });
});