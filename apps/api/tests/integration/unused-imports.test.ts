import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('TDD: Unused Imports Detection', () => {
  const testFiles = [
    'tests/integration/access-control.test.ts',
    'tests/integration/appointment-query.test.ts',
    'tests/integration/client-query.test.ts',
    'tests/integration/financial-query.test.ts',
    'tests/unit/agent-endpoint.test.ts',
    'tests/unit/feedback.test.ts',
    'tests/unit/sessions.test.ts',
    'tests/integration/pr44-fixes/architecture-issues.test.ts',
    'tests/integration/pr44-fixes/code-quality-issues.test.ts',
    'tests/integration/pr44-fixes/security-vulnerabilities.test.ts',
    'tests/integration/pr44-fixes/targeted-issues.test.ts',
  ];

  describe('API Test Files - Unused \'serve\' imports', () => {
    it('should detect unused \'serve\' import from \'@hono/node-server\' in access-control.test.ts', () => {
      const filePath = join(process.cwd(), 'tests/integration/access-control.test.ts')
      const content = readFileSync(filePath, 'utf8');

      // This test will fail initially because the unused import exists
      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      // The test should fail because we have the import but don't use it
      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }

    it('should detect unused \'serve\' import from \'@hono/node-server\' in appointment-query.test.ts', () => {
      const filePath = join(process.cwd(), 'tests/integration/appointment-query.test.ts')
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }

    it('should detect unused \'serve\' import from \'@hono/node-server\' in client-query.test.ts', () => {
      const filePath = join(
        process.cwd(),
        'tests/integration/client-query.test.ts',
      
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }

    it('should detect unused \'serve\' import from \'@hono/node-server\' in financial-query.test.ts', () => {
      const filePath = join(
        process.cwd(),
        'tests/integration/financial-query.test.ts',
      
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }
  }

  describe('Unit Test Files - Unused \'serve\' imports', () => {
    it('should detect unused \'serve\' import from \'@hono/node-server\' in agent-endpoint.test.ts', () => {
      const filePath = join(
        process.cwd(),
        'tests/unit/agent-endpoint.test.ts',
      
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }

    it('should detect unused \'serve\' import from \'@hono/node-server\' in feedback.test.ts', () => {
      const filePath = join(
        process.cwd(),
        'tests/unit/feedback.test.ts',
      
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }

    it('should detect unused \'serve\' import from \'@hono/node-server\' in sessions.test.ts', () => {
      const filePath = join(
        process.cwd(),
        'tests/unit/sessions.test.ts',
      
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }
  }

  describe('PR44 Fix Test Files - Unused \'serve\' imports', () => {
    it('should detect unused \'serve\' import from \'@hono/node-server\' in architecture-issues.test.ts', () => {
      const filePath = join(
        process.cwd(),
        'tests/integration/pr44-fixes/architecture-issues.test.ts',
      
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }

    it('should detect unused \'serve\' import from \'@hono/node-server\' in code-quality-issues.test.ts', () => {
      const filePath = join(
        process.cwd(),
        'tests/integration/pr44-fixes/code-quality-issues.test.ts',
      
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }

    it('should detect unused \'serve\' import from \'@hono/node-server\' in security-vulnerabilities.test.ts', () => {
      const filePath = join(
        process.cwd(),
        'tests/integration/pr44-fixes/security-vulnerabilities.test.ts',
      
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }

    it('should detect unused \'serve\' import from \'@hono/node-server\' in targeted-issues.test.ts', () => {
      const filePath = join(
        process.cwd(),
        'tests/integration/pr44-fixes/targeted-issues.test.ts',
      
      const content = readFileSync(filePath, 'utf8');

      const hasUnusedServeImport = content.includes(
        'import { serve } from "@hono/node-server"',
      
      const usesServe = content.includes('serve(')

      expect(hasUnusedServeImport && !usesServe).toBe(false);
    }
  }
}
