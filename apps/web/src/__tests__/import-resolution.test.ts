import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('TDD: Import Resolution Issues - RED Phase', () => {
  describe('Path Alias Validation', () => {
    it('should validate @ alias resolves to src directory', () => {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      const content = readFileSync(viteConfigPath, 'utf8');

      const hasAliasConfig = content.includes("find: '@'") && content.includes('./src');
      const hasProperReplacement = content.includes("replacement: path.resolve(__dirname, './src')");

      expect(hasAliasConfig && hasProperReplacement).toBe(true);
    });

    it('should validate @ alias is used consistently across components', () => {
      const componentsPath = join(process.cwd(), 'src/components');
      const files = [
        'src/components/ui/button.tsx',
        'src/components/ui/card.tsx',
        'src/components/ui/input.tsx',
      ];

      files.forEach(file => {
        if (existsSync(join(process.cwd(), file))) {
          const content = readFileSync(join(process.cwd(), file), 'utf8');
          const usesAliasImport = content.includes("from '@/") || content.includes("from '@/");
          expect(usesAliasImport).toBe(true);
        }
      });
    });

    it('should validate workspace package aliases are properly configured', () => {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      const content = readFileSync(viteConfigPath, 'utf8');

      const requiredAliases = [
        '@neonpro/ui',
        '@neonpro/utils',
        '@neonpro/shared',
        '@neonpro/types',
      ];

      const hasAllWorkspaceAliases = requiredAliases.every(alias =>
        content.includes(`find: '${alias}'`) || content.includes(`find: "${alias}"`)
      );

      expect(hasAllWorkspaceAliases).toBe(true);
    });

    it('should validate workspace package aliases point to correct paths', () => {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      const content = readFileSync(viteConfigPath, 'utf8');

      const hasCorrectUiPath = content.includes('../../packages/ui/src');
      const hasCorrectUtilsPath = content.includes('../../packages/utils/src');
      const hasCorrectSharedPath = content.includes('../../packages/shared/src');

      expect(hasCorrectUiPath && hasCorrectUtilsPath && hasCorrectSharedPath).toBe(true);
    });
  });

  describe('Workspace Package Resolution', () => {
    it('should validate @neonpro/ui package is properly imported', () => {
      const dashboardPath = join(process.cwd(), 'src/routes/dashboard/main.tsx');
      const content = readFileSync(dashboardPath, 'utf8');

      const hasUiImport = content.includes("@neonpro/ui");
      const usesUiComponents = content.includes('Button') || content.includes('Card') || content.includes('Input');

      // This test will fail if UI components are used but package is not imported
      expect(hasUiImport || !usesUiComponents).toBe(true);
    });

    it('should validate @neonpro/utils package is properly imported', () => {
      const dashboardPath = join(process.cwd(), 'src/routes/dashboard/main.tsx');
      const content = readFileSync(dashboardPath, 'utf8');

      const hasUtilsImport = content.includes("@neonpro/utils");
      const usesUtils = content.includes('cn(') || content.includes('cn ');

      // This test will fail if utils are used but package is not imported
      expect(hasUtilsImport || !usesUtils).toBe(true);
    });

    it('should validate workspace packages exist in correct locations', () => {
      const packages = [
        '../../packages/ui/src',
        '../../packages/utils/src',
        '../../packages/shared/src',
        '../../packages/types/src',
      ];

      packages.forEach(packagePath => {
        const fullPath = join(process.cwd(), packagePath);
        expect(existsSync(fullPath)).toBe(true);
      });
    });

    it('should validate workspace packages have proper index files', () => {
      const packageIndexFiles = [
        '../../packages/ui/src/index.ts',
        '../../packages/utils/src/index.ts',
        '../../packages/shared/src/index.ts',
        '../../packages/types/src/index.ts',
      ];

      packageIndexFiles.forEach(indexPath => {
        const fullPath = join(process.cwd(), indexPath);
        expect(existsSync(fullPath)).toBe(true);
      });
    });
  });

  describe('TypeScript Path Mapping Validation', () => {
    it('should validate tsconfig.json has proper path mappings', () => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      const content = readFileSync(tsConfigPath, 'utf8');

      const hasPathsSection = content.includes('"paths":');
      const hasWorkspaceMappings = content.includes('@neonpro/ui') && content.includes('@neonpro/utils');

      expect(hasPathsSection && hasWorkspaceMappings).toBe(true);
    });

    it('should validate tsconfig.json paths point to correct locations', () => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      const content = readFileSync(tsConfigPath, 'utf8');

      const hasCorrectUiPath = content.includes('../../packages/ui/src');
      const hasCorrectUtilsPath = content.includes('../../packages/utils/src');
      const hasCorrectSharedPath = content.includes('../../packages/shared/src');

      expect(hasCorrectUiPath && hasCorrectUtilsPath && hasCorrectSharedPath).toBe(true);
    });

    it('should validate TypeScript baseUrl is properly configured', () => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      const content = readFileSync(tsConfigPath, 'utf8');

      const hasBaseUrl = content.includes('"baseUrl": "."');
      const hasProperBaseUrl = content.includes('baseUrl') && content.includes('"."');

      expect(hasBaseUrl && hasProperBaseUrl).toBe(true);
    });
  });

  describe('Import Statement Consistency', () => {
    it('should validate consistent import patterns across the codebase', () => {
      const testFiles = [
        'src/routes/dashboard/main.tsx',
        'src/routes/patients/ai-insights.tsx',
        'src/components/ui/button.tsx',
      ];

      testFiles.forEach(file => {
        const fullPath = join(process.cwd(), file);
        if (existsSync(fullPath)) {
          const content = readFileSync(fullPath, 'utf8');

          // Check for consistent import patterns
          const hasImportStatements = content.includes('import') && content.includes('from');
          const usesProperSyntax = !content.includes('require(') || content.includes('import');

          expect(hasImportStatements && usesProperSyntax).toBe(true);
        }
      });
    });

    it('should validate no mixed import types in same file', () => {
      const testFiles = [
        'src/routes/dashboard/main.tsx',
        'src/routes/patients/ai-insights.tsx',
      ];

      testFiles.forEach(file => {
        const fullPath = join(process.cwd(), file);
        if (existsSync(fullPath)) {
          const content = readFileSync(fullPath, 'utf8');

          const hasRequireStatements = content.includes('require(');
          const hasImportStatements = content.includes('import') && content.includes('from');

          // Should not have both require and import in the same file
          expect(!(hasRequireStatements && hasImportStatements)).toBe(true);
        }
      });
    });

    it('should validate proper React import patterns', () => {
      const testFiles = [
        'src/routes/dashboard/main.tsx',
        'src/routes/patients/ai-insights.tsx',
      ];

      testFiles.forEach(file => {
        const fullPath = join(process.cwd(), file);
        if (existsSync(fullPath)) {
          const content = readFileSync(fullPath, 'utf8');

          // Should use React 19 automatic JSX runtime (no React import needed)
          const hasReactImport = content.includes("import React") || content.includes("import * as React");
          const usesJSX = content.includes('</') || content.includes('/>');

          // In React 19 with automatic JSX runtime, we shouldn't need React imports for JSX
          expect(!hasReactImport || !usesJSX).toBe(true);
        }
      });
    });
  });

  describe('Module Resolution Edge Cases', () => {
    it('should validate file extensions are properly handled', () => {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      const content = readFileSync(viteConfigPath, 'utf8');

      const hasExtensionsConfig = content.includes('extensions:');
      const hasProperExtensions = content.includes('.ts') && content.includes('.tsx') && content.includes('.js');

      expect(hasExtensionsConfig && hasProperExtensions).toBe(true);
    });

    it('should validate module resolution strategy is correct', () => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      const content = readFileSync(tsConfigPath, 'utf8');

      const hasModuleResolution = content.includes('moduleResolution');
      const usesBundlerResolution = content.includes('moduleResolution') && content.includes('bundler');

      expect(hasModuleResolution && usesBundlerResolution).toBe(true);
    });

    it('should validate allowImportingTsExtensions is properly configured', () => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      const content = readFileSync(tsConfigPath, 'utf8');

      const hasAllowImportingTsExtensions = content.includes('allowImportingTsExtensions');
      const isSetToTrue = content.includes('allowImportingTsExtensions') && content.includes('true');

      expect(hasAllowImportingTsExtensions && isSetToTrue).toBe(true);
    });
  });
});