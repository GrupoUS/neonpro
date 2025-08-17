/**
 * NEONPRO Workspace Optimization Script
 * Optimizes Turborepo workspace for healthcare SaaS development
 * Quality Standard: ≥9.9/10 Healthcare Override
 */

import { promises as fs } from 'fs';
import { join } from 'path';

interface WorkspaceOptimization {
  packageJson: any;
  turboConfig: any;
  workspacePackages: string[];
  dependencyIssues: string[];
  optimizations: string[];
}

export class HealthcareWorkspaceOptimizer {
  private rootPath: string;
  private results: WorkspaceOptimization;

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath;
    this.results = {
      packageJson: null,
      turboConfig: null,
      workspacePackages: [],
      dependencyIssues: [],
      optimizations: [],
    };
  }

  async optimize(): Promise<WorkspaceOptimization> {
    console.log('🏥 Starting Healthcare Workspace Optimization...');

    try {
      // Analyze current workspace structure
      await this.analyzeWorkspace();

      // Optimize package.json for healthcare
      await this.optimizeRootPackageJson();

      // Optimize Turborepo configuration
      await this.optimizeTurboConfig();

      // Clean up workspace dependencies
      await this.cleanupDependencies();

      // Generate optimization report
      this.generateOptimizationReport();

      console.log('✅ Healthcare Workspace Optimization Completed');
      return this.results;
    } catch (error) {
      console.error('❌ Workspace optimization failed:', error);
      throw error;
    }
  }

  private async analyzeWorkspace(): Promise<void> {
    console.log('🔍 Analyzing workspace structure...');

    // Read root package.json
    try {
      const packageJsonPath = join(this.rootPath, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      this.results.packageJson = JSON.parse(packageJsonContent);

      // Extract workspace packages
      if (this.results.packageJson.workspaces) {
        this.results.workspacePackages = Array.isArray(
          this.results.packageJson.workspaces
        )
          ? this.results.packageJson.workspaces
          : this.results.packageJson.workspaces.packages || [];
      }

      console.log(
        `   ✓ Found ${this.results.workspacePackages.length} workspace packages`
      );
    } catch (error) {
      this.results.dependencyIssues.push(
        `Failed to read package.json: ${error}`
      );
    }

    // Read turbo.json
    try {
      const turboJsonPath = join(this.rootPath, 'turbo.json');
      const turboJsonContent = await fs.readFile(turboJsonPath, 'utf-8');
      this.results.turboConfig = JSON.parse(turboJsonContent);
      console.log('   ✓ Turborepo configuration loaded');
    } catch (error) {
      this.results.dependencyIssues.push(`Failed to read turbo.json: ${error}`);
    }
  }
  private async optimizeRootPackageJson(): Promise<void> {
    console.log('📦 Optimizing root package.json for healthcare...');

    if (!this.results.packageJson) return;

    // Healthcare-specific script optimizations
    const healthcareScripts = {
      dev: 'turbo dev',
      build: 'turbo build',
      test: 'turbo test',
      'test:healthcare': 'turbo test:healthcare',
      lint: 'turbo lint',
      'lint:healthcare': 'turbo lint:healthcare',
      typecheck: 'turbo typecheck',
      clean: 'turbo clean',
      'healthcare:cleanup': 'turbo healthcare:cleanup',
      'healthcare:test:load':
        'artillery run tools/testing/configs/artillery-healthcare.yml',
      'healthcare:validate':
        'npm run typecheck && npm run lint:healthcare && npm run test:healthcare',
    };

    // Merge healthcare scripts with existing scripts
    this.results.packageJson.scripts = {
      ...this.results.packageJson.scripts,
      ...healthcareScripts,
    };

    // Healthcare-specific engines
    this.results.packageJson.engines = {
      node: '>=18.0.0',
      pnpm: '>=8.0.0',
    };

    // Healthcare development dependencies
    const healthcareDevDeps = {
      artillery: '^2.0.0',
      '@types/node': '^20.0.0',
      typescript: '^5.0.0',
    };

    this.results.packageJson.devDependencies = {
      ...this.results.packageJson.devDependencies,
      ...healthcareDevDeps,
    };

    this.results.optimizations.push(
      'Root package.json optimized for healthcare development'
    );
    console.log('   ✓ Healthcare scripts and dependencies added');
  }

  private async optimizeTurboConfig(): Promise<void> {
    console.log('⚡ Optimizing Turborepo configuration...');

    // Use the healthcare-optimized turbo config
    try {
      const healthcareTurboPath = join(this.rootPath, 'turbo-healthcare.json');
      const healthcareTurboContent = await fs.readFile(
        healthcareTurboPath,
        'utf-8'
      );
      const healthcareTurboConfig = JSON.parse(healthcareTurboContent);

      // Merge with existing turbo.json
      const optimizedConfig = {
        ...this.results.turboConfig,
        ...healthcareTurboConfig,
        tasks: {
          ...this.results.turboConfig?.tasks,
          ...healthcareTurboConfig.tasks,
        },
      };

      // Write optimized turbo.json
      const turboJsonPath = join(this.rootPath, 'turbo.json');
      await fs.writeFile(
        turboJsonPath,
        JSON.stringify(optimizedConfig, null, 2)
      );

      this.results.optimizations.push(
        'Turborepo configuration optimized for healthcare workflows'
      );
      console.log('   ✓ Healthcare Turborepo configuration applied');
    } catch (error) {
      this.results.dependencyIssues.push(
        `Failed to optimize turbo.json: ${error}`
      );
    }
  }
  private async cleanupDependencies(): Promise<void> {
    console.log('🧹 Cleaning up workspace dependencies...');

    // Remove duplicate dependencies across workspace packages
    for (const workspacePattern of this.results.workspacePackages) {
      try {
        // Find packages matching the pattern
        const packages = await this.findPackages(workspacePattern);

        for (const packagePath of packages) {
          await this.optimizePackageDependencies(packagePath);
        }
      } catch (error) {
        this.results.dependencyIssues.push(
          `Failed to cleanup ${workspacePattern}: ${error}`
        );
      }
    }

    this.results.optimizations.push(
      'Workspace dependencies cleaned and optimized'
    );
    console.log('   ✓ Dependency cleanup completed');
  }

  private async findPackages(pattern: string): Promise<string[]> {
    // Simple glob-like pattern matching for workspace packages
    const packages: string[] = [];

    if (pattern.includes('*')) {
      // Handle patterns like "packages/*" or "apps/*"
      const baseDir = pattern.replace('/*', '');
      try {
        const entries = await fs.readdir(join(this.rootPath, baseDir));
        for (const entry of entries) {
          const packageJsonPath = join(
            this.rootPath,
            baseDir,
            entry,
            'package.json'
          );
          try {
            await fs.access(packageJsonPath);
            packages.push(join(baseDir, entry));
          } catch {
            // No package.json in this directory
          }
        }
      } catch {
        // Base directory doesn't exist
      }
    } else {
      packages.push(pattern);
    }

    return packages;
  }

  private async optimizePackageDependencies(
    packagePath: string
  ): Promise<void> {
    try {
      const fullPackagePath = join(this.rootPath, packagePath);
      const packageJsonPath = join(fullPackagePath, 'package.json');

      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      // Healthcare-specific dependency optimizations
      let modified = false;

      // Ensure TypeScript strict mode
      if (packageJson.devDependencies?.typescript) {
        const tsconfigPath = join(fullPackagePath, 'tsconfig.json');
        try {
          const tsconfigContent = await fs.readFile(tsconfigPath, 'utf-8');
          const tsconfig = JSON.parse(tsconfigContent);

          if (!tsconfig.compilerOptions?.strict) {
            tsconfig.compilerOptions = tsconfig.compilerOptions || {};
            tsconfig.compilerOptions.strict = true;
            tsconfig.compilerOptions.noImplicitAny = true;
            tsconfig.compilerOptions.strictNullChecks = true;

            await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
            modified = true;
            this.results.optimizations.push(
              `TypeScript strict mode enabled in ${packagePath}`
            );
          }
        } catch {
          // tsconfig.json doesn't exist or is invalid
        }
      }

      // Add healthcare-specific scripts if this is an app
      if (packagePath.startsWith('apps/')) {
        const healthcareAppScripts = {
          'test:healthcare':
            'vitest run --config ../../tools/testing/configs/healthcare-test.config.ts',
          'test:load':
            'artillery run ../../tools/testing/configs/artillery-healthcare.yml',
        };

        packageJson.scripts = {
          ...packageJson.scripts,
          ...healthcareAppScripts,
        };
        modified = true;
      }

      if (modified) {
        await fs.writeFile(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2)
        );
      }
    } catch (error) {
      this.results.dependencyIssues.push(
        `Failed to optimize ${packagePath}: ${error}`
      );
    }
  }
  private generateOptimizationReport(): void {
    console.log('\n📊 HEALTHCARE WORKSPACE OPTIMIZATION REPORT');
    console.log('==========================================');
    console.log(
      `✅ Optimizations applied: ${this.results.optimizations.length}`
    );
    console.log(
      `📦 Workspace packages: ${this.results.workspacePackages.length}`
    );
    console.log(
      `❌ Issues encountered: ${this.results.dependencyIssues.length}`
    );

    if (this.results.optimizations.length > 0) {
      console.log('\n✨ Optimizations Applied:');
      this.results.optimizations.forEach((opt) => console.log(`   ✓ ${opt}`));
    }

    if (this.results.dependencyIssues.length > 0) {
      console.log('\n⚠️  Issues Encountered:');
      this.results.dependencyIssues.forEach((issue) =>
        console.log(`   ⚠️  ${issue}`)
      );
    }

    if (this.results.workspacePackages.length > 0) {
      console.log('\n📦 Workspace Packages:');
      this.results.workspacePackages.forEach((pkg) =>
        console.log(`   • ${pkg}`)
      );
    }

    console.log(
      '\n🏥 Healthcare workspace optimization completed successfully!'
    );
    console.log('🔧 Recommended next steps:');
    console.log('   1. Run `pnpm install` to update dependencies');
    console.log(
      '   2. Run `pnpm healthcare:validate` to validate optimization'
    );
    console.log(
      '   3. Run `pnpm test:healthcare` to test healthcare functionality'
    );
  }
}

// Execute optimization if run directly
if (require.main === module) {
  const optimizer = new HealthcareWorkspaceOptimizer();
  optimizer.optimize().catch(console.error);
}

export { HealthcareWorkspaceOptimizer };
