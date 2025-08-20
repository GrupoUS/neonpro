import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('TASK-001 Foundation Setup Verification', () => {
  const rootDir = path.join(__dirname, '../../../../');

  describe('Project Structure', () => {
    it('should have monorepo structure with apps/web', () => {
      const appsDir = path.join(rootDir, 'apps');
      const webAppDir = path.join(rootDir, 'apps/web');

      expect(fs.existsSync(appsDir)).toBe(true);
      expect(fs.existsSync(webAppDir)).toBe(true);
    });

    it('should have app directory with core modules', () => {
      const webAppDir = path.join(rootDir, 'apps/web/app');
      const webLibDir = path.join(rootDir, 'apps/web/lib');

      expect(fs.existsSync(webAppDir)).toBe(true);
      expect(fs.existsSync(webLibDir)).toBe(true);
    });

    it('should have web app components', () => {
      const webComponentsDir = path.join(rootDir, 'apps/web/components');
      expect(fs.existsSync(webComponentsDir)).toBe(true);
    });

    it('should have web app API routes', () => {
      const webAppDir = path.join(rootDir, 'apps/web/app');
      expect(fs.existsSync(webAppDir)).toBe(true);
    });
  });

  describe('Code Quality', () => {
    it('should have TypeScript configuration', () => {
      const tsconfigPath = path.join(rootDir, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });

    it('should have Biome configuration', () => {
      const biomeConfigPath = path.join(rootDir, 'biome.jsonc');
      expect(fs.existsSync(biomeConfigPath)).toBe(true);
    });

    it('should have package.json with required scripts', () => {
      const packageJsonPath = path.join(rootDir, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.lint).toBeDefined();
    });
  });

  describe('Testing Infrastructure', () => {
    it('should have Vitest configuration in testing tools', () => {
      const vitestConfigPath = path.join(rootDir, 'vitest.config.ts');
      expect(fs.existsSync(vitestConfigPath)).toBe(true);
    });

    it('should have testing directory structure', () => {
      const testingDir = path.join(rootDir, 'tools/testing');
      const testsDir = path.join(rootDir, 'tools/testing/tests');
      const unitTestsDir = path.join(rootDir, 'tools/testing/tests/unit');

      expect(fs.existsSync(testingDir)).toBe(true);
      expect(fs.existsSync(testsDir)).toBe(true);
      expect(fs.existsSync(unitTestsDir)).toBe(true);
    });
  });

  describe('Documentation', () => {
    it('should have docs directory', () => {
      const docsDir = path.join(rootDir, 'docs');
      expect(fs.existsSync(docsDir)).toBe(true);
    });

    it('should have README file', () => {
      const readmePath = path.join(rootDir, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });
  });
});
