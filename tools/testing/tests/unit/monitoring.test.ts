const fs = require('node:fs');
const path = require('node:path');
const { describe, expect, it } = require('vitest');

describe('TASK-001 Foundation Setup Verification', () => {
  const rootDir = path.join(__dirname, '../../../../');

  describe('Project Structure', () => {
    it('should have monorepo structure with apps/web', () => {
      const appsDir = path.join(rootDir, 'apps');
      const webAppDir = path.join(rootDir, 'apps/web');

      expect(fs.existsSync(appsDir)).toBe(true);
      expect(fs.existsSync(webAppDir)).toBe(true);
    });

    it('should have lib directory with core modules', () => {
      const libDir = path.join(rootDir, 'lib');
      const authDir = path.join(rootDir, 'lib/auth');
      const securityDir = path.join(rootDir, 'lib/security');

      expect(fs.existsSync(libDir)).toBe(true);
      expect(fs.existsSync(authDir)).toBe(true);
      expect(fs.existsSync(securityDir)).toBe(true);
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

    it('should have ESLint configuration in web app', () => {
      const eslintConfigPath = path.join(rootDir, 'apps/web/.eslintrc.json');
      expect(fs.existsSync(eslintConfigPath)).toBe(true);
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
    it('should have Jest configuration in testing tools', () => {
      const jestConfigPath = path.join(rootDir, 'tools/testing/jest.config.ts');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
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
