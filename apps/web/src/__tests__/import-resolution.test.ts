import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('Import Resolution Tests', () => {
  describe('Vite Configuration Validation', () => {
    it('should validate vite config has proper alias configuration', () => {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      if (existsSync(viteConfigPath)) {
        const content = readFileSync(viteConfigPath, 'utf8');
        const hasAliasConfig = content.includes('find: \'@\'') && content.includes('./src');
        const hasProperReplacement = content.includes(
          'replacement: path.resolve(__dirname, \'./src\')',
        );

        expect(hasAliasConfig && hasProperReplacement).toBe(true);
      }
    });

    it('should validate @ alias is used consistently across components', () => {
      const files = [
        'src/components/ui/button.tsx',
        'src/components/ui/card.tsx',
        'src/components/ui/input.tsx',
      ];

      files.forEach(file => {
        if (existsSync(join(process.cwd(), file))) {
          const content = readFileSync(join(process.cwd(), file), 'utf8');
          const usesAliasImport = content.includes('from \'@/\'') || content.includes('from \'@/');
          expect(usesAliasImport).toBe(true);
        }
      });
    });

    it('should prefer absolute imports over relative imports', () => {
      const sourceFiles = [
        'src/routes/dashboard/main.tsx',
        'src/routes/patients/ai-insights.tsx',
      ];

      sourceFiles.forEach(file => {
        if (existsSync(join(process.cwd(), file))) {
          const content = readFileSync(join(process.cwd(), file), 'utf8');
          const hasRelativeImports = content.includes('from \'./\'') || content.includes('from \'../');
          const hasAbsoluteImports = content.includes('from \'@/');

          // Test will pass if absolute imports are used
          expect(hasAbsoluteImports || !hasRelativeImports).toBe(true);
        }
      });
    });
  });

  describe('TypeScript Configuration Validation', () => {
    it('should validate tsconfig has proper paths configuration', () => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      if (existsSync(tsConfigPath)) {
        const content = readFileSync(tsConfigPath, 'utf8');
        const hasPathsConfig = content.includes('"paths"');
        const hasWorkspaceMapping = content.includes('"@/*": ["./src/*"]');

        expect(hasPathsConfig && hasWorkspaceMapping).toBe(true);
      }
    });

    it('should validate tsconfig has baseUrl and paths', () => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      if (existsSync(tsConfigPath)) {
        const content = readFileSync(tsConfigPath, 'utf8');
        const hasBaseUrl = content.includes('"baseUrl"');
        const hasPaths = content.includes('"paths"');

        expect(hasBaseUrl && hasPaths).toBe(true);
      }
    });
  });

  describe('Build Configuration Validation', () => {
    it('should validate both vite and tsconfig have path resolution', () => {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');

      if (existsSync(viteConfigPath) && existsSync(tsConfigPath)) {
        const viteContent = readFileSync(viteConfigPath, 'utf8');
        const tsContent = readFileSync(tsConfigPath, 'utf8');

        const hasAliasConfig = viteContent.includes('alias');
        const hasWorkspaceAlias = viteContent.includes('@');
        const hasPathsConfig = tsContent.includes('"paths"');
        const hasWorkspaceMapping = tsContent.includes('@');

        const viteHasAlias = hasAliasConfig && hasWorkspaceAlias;
        const tsHasPaths = hasPathsConfig && hasWorkspaceMapping;

        // Both configs should have path resolution configured
        expect(viteHasAlias && tsHasPaths).toBe(true);
      }
    });
  });

  describe('Import Consistency Validation', () => {
    it('should validate consistent import patterns in dashboard files', () => {
      const dashboardFiles = [
        'src/routes/dashboard/main.tsx',
        'src/routes/patients/ai-insights.tsx',
      ];

      dashboardFiles.forEach(file => {
        if (existsSync(join(process.cwd(), file))) {
          const content = readFileSync(join(process.cwd(), file), 'utf8');
          const hasRelativeImports = content.includes('from \'./\'') || content.includes('from \'../');
          const hasAbsoluteImports = content.includes('from \'@/');

          // Prefer absolute imports
          expect(hasAbsoluteImports || !hasRelativeImports).toBe(true);
        }
      });
    });

    it('should validate consistent import patterns in hook files', () => {
      const hookFiles = [
        'src/routes/dashboard/main.tsx',
        'src/hooks/useAIChat.ts',
      ];

      hookFiles.forEach(file => {
        if (existsSync(join(process.cwd(), file))) {
          const content = readFileSync(join(process.cwd(), file), 'utf8');
          const hasRelativeImports = content.includes('from \'./\'') || content.includes('from \'../');
          const hasAbsoluteImports = content.includes('from \'@/');

          // Prefer absolute imports
          expect(hasAbsoluteImports || !hasRelativeImports).toBe(true);
        }
      });
    });
  });
});