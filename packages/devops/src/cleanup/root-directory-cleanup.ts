/**
 * @fileoverview Root Directory Cleanup for NeonPro Healthcare
 * Story 05.02: Root Directory Cleanup + Turborepo Optimization
 * Safely removes temporary files while preserving important configurations
 */

import { existsSync, promises as fs } from 'node:fs';
import { extname, join } from 'node:path';

export type CleanupConfig = {
  dryRun: boolean;
  preserveReports: boolean;
  preserveConfigs: boolean;
  preserveDocumentation: boolean;
  createBackup: boolean;
  backupDirectory: string;
};

export type CleanupResult = {
  filesRemoved: string[];
  filesPreserved: string[];
  sizeCleaned: number;
  errors: string[];
  summary: CleanupSummary;
};

export type CleanupSummary = {
  totalFilesAnalyzed: number;
  temporaryFilesRemoved: number;
  configFilesPreserved: number;
  documentationPreserved: number;
  spaceSavedMB: number;
  cleanupScore: number;
};

export class RootDirectoryCleanup {
  private readonly config: CleanupConfig;
  private readonly projectRoot: string;
  private readonly temporaryPatterns: RegExp[];
  private readonly preservePatterns: RegExp[];
  private readonly importantFiles: string[];

  constructor(projectRoot: string, config: Partial<CleanupConfig> = {}) {
    this.projectRoot = projectRoot;
    this.config = {
      dryRun: false,
      preserveReports: true,
      preserveConfigs: true,
      preserveDocumentation: true,
      createBackup: true,
      backupDirectory: '.cleanup-backup',
      ...config,
    };

    this.temporaryPatterns = [
      // Temporary JavaScript files
      /^temp.*\.js$/,
      /^analyze_.*\.js$/,
      /^check_.*\.js$/,
      /^complete_story_.*\.js$/,
      /^copy_.*\.js$/,
      /^examine_.*\.js$/,
      /^fix_.*\.py$/,
      /^migrate_.*\.js$/,
      /^read_.*\.js$/,
      /^run_.*\.js$/,
      /^start_.*\.js$/,
      /^test_.*\.js$/,
      /^update_.*\.js$/,
      /^validate_.*\.js$/,
      /^show_.*\.js$/,
      /^simple_.*\.js$/,
      /^perform_.*\.js$/,

      // Temporary batch and PowerShell files
      /^.*\.bat$/,
      /^.*\.ps1$/,
      /^execute-.*$/,
      /^run_.*$/,
      /^EXECUTE_.*$/,

      // Temporary Python files
      /^fix_.*\.py$/,
      /^disable_.*\.py$/,
      /^final_.*\.py$/,

      // Temporary configuration files
      /^.*\.backup$/,
      /^.*\.disabled$/,
      /^.*\.removed$/,
      /^.*\.temp$/,
      /^.*\.tmp$/,

      // Temporary content files
      /^.*_content\.js$/,
      /^.*_content\.txt$/,
      /^hook_content\.txt$/,
      /^temp_.*\.txt$/,

      // Build artifacts that shouldn't be in root
      /^.*\.tsbuildinfo$/,
      /^.*\.lock$/,
    ];

    this.preservePatterns = [
      // Essential configuration files
      /^package\.json$/,
      /^pnpm-workspace\.yaml$/,
      /^turbo\.json$/,
      /^tsconfig\.json$/,
      /^next\.config\./,
      /^tailwind\.config\./,
      /^postcss\.config\./,
      /^biome\.jsonc$/,
      /^\.env/,
      /^vercel\.json$/,
      /^Dockerfile/,
      /^\.dockerignore$/,
      /^\.gitignore$/,
      /^\.gitattributes$/,
      /^playwright\.config\./,
      /^vitest\.config\./,
      /^jest\.config\./,

      // Important documentation
      /^README\.md$/,
      /^CHANGELOG\.md$/,
      /^LICENSE/,
      /^CLAUDE\.md$/,
      /^API\.md$/,

      // Component and framework files
      /^components\.json$/,
      /^middleware\.ts$/,
      /^instrumentation\.ts$/,

      // Database and infrastructure
      /^.*schema\.sql$/,
      /^notifications-schema\.sql$/,
    ];

    this.importantFiles = [
      'package.json',
      'pnpm-workspace.yaml',
      'turbo.json',
      'tsconfig.json',
      'README.md',
      'CLAUDE.md',
      'API.md',
      'CHANGELOG.md',
      'vercel.json',
      'components.json',
      'biome.jsonc',
      'middleware.ts',
      'instrumentation.ts',
    ];
  }

  async performCleanup(): Promise<CleanupResult> {
    const result: CleanupResult = {
      filesRemoved: [],
      filesPreserved: [],
      sizeCleaned: 0,
      errors: [],
      summary: {
        totalFilesAnalyzed: 0,
        temporaryFilesRemoved: 0,
        configFilesPreserved: 0,
        documentationPreserved: 0,
        spaceSavedMB: 0,
        cleanupScore: 0,
      },
    };

    try {
      // Create backup if requested
      if (this.config.createBackup && !this.config.dryRun) {
        await this.createBackup();
      }

      // Analyze all files in root directory
      const files = await this.getFilesInDirectory(this.projectRoot);
      result.summary.totalFilesAnalyzed = files.length;

      for (const file of files) {
        try {
          const fullPath = join(this.projectRoot, file);
          const stats = await fs.stat(fullPath);

          if (stats.isFile()) {
            const shouldRemove = await this.shouldRemoveFile(file);
            const shouldPreserve = this.shouldPreserveFile(file);

            if (shouldRemove && !shouldPreserve) {
              if (!this.config.dryRun) {
                await fs.unlink(fullPath);
              }
              result.filesRemoved.push(file);
              result.sizeCleaned += stats.size;
              result.summary.temporaryFilesRemoved++;
            } else {
              result.filesPreserved.push(file);

              if (this.isConfigFile(file)) {
                result.summary.configFilesPreserved++;
              } else if (this.isDocumentationFile(file)) {
                result.summary.documentationPreserved++;
              }

              if (shouldRemove && shouldPreserve) {
              }
            }
          }
        } catch (error) {
          const errorMsg = `Error processing ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
        }
      }

      // Calculate summary metrics
      result.summary.spaceSavedMB =
        Math.round((result.sizeCleaned / (1024 * 1024)) * 100) / 100;
      result.summary.cleanupScore = this.calculateCleanupScore(result);

      // Generate cleanup report
      await this.generateCleanupReport(result);

      return result;
    } catch (error) {
      const errorMsg = `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      throw new Error(errorMsg);
    }
  }

  private async getFilesInDirectory(directory: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => !name.startsWith('.')); // Skip hidden files
    } catch (error) {
      throw new Error(
        `Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async shouldRemoveFile(filename: string): Promise<boolean> {
    // Check if file matches temporary patterns
    for (const pattern of this.temporaryPatterns) {
      if (pattern.test(filename)) {
        return true;
      }
    }

    // Check specific temporary file names
    const temporaryFiles = [
      'analyze_consolidation.js',
      'check_anvisa_structure.js',
      'check_file_exists.js',
      'check_imports.js',
      'check_middleware.js',
      'check_mocks.js',
      'check_biome_configs.js',
      'check_story.js',
      'check_story_05_02.js',
      'check_test_content.js',
      'check_turbo_config.js',
      'check_turbo_json.js',
      'cleanup-progress.md',
      'cleanup-script.ps1',
      'context7,desktop-commander',
      'devops-batch-implementation-tracker.md',
      'disable_files.py',
      'execute-cleanup.ps1',
      'EXECUTE_CLEANUP_NOW.bat',
      'file-comparison-analysis.md',
      'file-content-comparison.md',
      'final_api_cleanup.py',
      'find_story.js',
      'hook_content.txt',
      'init.js',
      'monorepo.json',
      'post-cleanup-validation.ps1',
      'pre-cleanup-validation.ps1',
      'quick_analysis.js',
      'quick_story_check.js',
      'reconciliation-test-results.json',
      'run-reconciliation-tests.js',
      'run_analysis.bat',
      'run_structure_analysis.js',
      'show_hook.bat',
      'show_service_content.js',
      'sync-prisma-supabase.js',
      'temp_analysis.txt',
      'test-hook-fix.ps1',
      'test-hook-fix.sh',
      'test-prisma-supabase.js',
      'test-quality-analysis-report.json',
      'test-quality-analyzer.js',
      'test-supabase-client.js',
      'validate-migration.bat',
      'validation',
    ];

    return temporaryFiles.includes(filename);
  }

  private shouldPreserveFile(filename: string): boolean {
    // Always preserve important files
    if (this.importantFiles.includes(filename)) {
      return true;
    }

    // Check preserve patterns
    for (const pattern of this.preservePatterns) {
      if (pattern.test(filename)) {
        return true;
      }
    }

    // Preserve based on configuration
    if (this.config.preserveConfigs && this.isConfigFile(filename)) {
      return true;
    }

    if (
      this.config.preserveDocumentation &&
      this.isDocumentationFile(filename)
    ) {
      return true;
    }

    if (this.config.preserveReports && this.isReportFile(filename)) {
      return true;
    }

    return false;
  }

  private isConfigFile(filename: string): boolean {
    const configExtensions = [
      '.json',
      '.js',
      '.ts',
      '.mjs',
      '.cjs',
      '.yaml',
      '.yml',
      '.toml',
    ];
    const configNames = [
      'package.json',
      'tsconfig.json',
      'turbo.json',
      'vercel.json',
      'components.json',
      'biome.jsonc',
      'next.config',
      'tailwind.config',
      'postcss.config',
      'playwright.config',
      'vitest.config',
      'jest.config',
    ];

    return (
      configNames.some((name) => filename.startsWith(name)) ||
      (configExtensions.includes(extname(filename)) &&
        filename.includes('config'))
    );
  }

  private isDocumentationFile(filename: string): boolean {
    const docExtensions = ['.md', '.txt', '.rst'];
    const docPatterns = [
      /README/i,
      /CHANGELOG/i,
      /LICENSE/i,
      /CLAUDE/i,
      /API/i,
    ];

    return (
      docExtensions.includes(extname(filename)) ||
      docPatterns.some((pattern) => pattern.test(filename))
    );
  }

  private isReportFile(filename: string): boolean {
    const reportPatterns = [
      /report/i,
      /summary/i,
      /progress/i,
      /todo/i,
      /tracking/i,
      /completion/i,
      /implementation/i,
    ];

    return (
      reportPatterns.some((pattern) => pattern.test(filename)) &&
      extname(filename) === '.md'
    );
  }

  private async createBackup(): Promise<void> {
    const backupPath = join(this.projectRoot, this.config.backupDirectory);

    try {
      await fs.mkdir(backupPath, { recursive: true });

      const files = await this.getFilesInDirectory(this.projectRoot);
      const filesToBackup = [];

      for (const file of files) {
        if (
          (await this.shouldRemoveFile(file)) &&
          !this.shouldPreserveFile(file)
        ) {
          filesToBackup.push(file);
        }
      }

      for (const file of filesToBackup) {
        const sourcePath = join(this.projectRoot, file);
        const backupFilePath = join(backupPath, file);
        await fs.copyFile(sourcePath, backupFilePath);
      }
    } catch (error) {
      throw new Error(
        `Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private calculateCleanupScore(result: CleanupResult): number {
    const { summary } = result;

    // Calculate score based on multiple factors
    let score = 0;

    // Files cleaned ratio (40% weight)
    const cleanRatio =
      summary.temporaryFilesRemoved / summary.totalFilesAnalyzed;
    score += cleanRatio * 40;

    // Space saved factor (30% weight)
    const spaceFactor = Math.min(summary.spaceSavedMB / 10, 1); // Max 10MB for full points
    score += spaceFactor * 30;

    // Important files preserved (20% weight)
    const preserveRatio =
      summary.configFilesPreserved / this.importantFiles.length;
    score += preserveRatio * 20;

    // Error-free execution (10% weight)
    const errorFactor = Math.max(0, 1 - result.errors.length / 10);
    score += errorFactor * 10;

    return Math.min(100, Math.round(score * 10) / 10); // Cap at 100, round to 1 decimal
  }

  private async generateCleanupReport(result: CleanupResult): Promise<void> {
    const reportPath = join(
      this.projectRoot,
      'root-directory-cleanup-report.json'
    );

    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      result,
      recommendations: this.generateRecommendations(result),
    };

    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    } catch (_error) {}
  }

  private generateRecommendations(result: CleanupResult): string[] {
    const recommendations: string[] = [];

    if (result.summary.temporaryFilesRemoved > 20) {
      recommendations.push(
        'Consider implementing automated cleanup as part of CI/CD pipeline'
      );
    }

    if (result.summary.spaceSavedMB > 5) {
      recommendations.push(
        'Significant space saved - recommend regular cleanup maintenance'
      );
    }

    if (result.errors.length > 0) {
      recommendations.push(
        'Review errors and adjust cleanup patterns if needed'
      );
    }

    if (result.summary.cleanupScore < 80) {
      recommendations.push(
        'Consider reviewing file organization and temporary file management practices'
      );
    }

    recommendations.push('Add automated file cleanup to development workflow');
    recommendations.push(
      'Implement git hooks to prevent committing temporary files'
    );

    return recommendations;
  }

  // Public utility methods
  async validateCleanup(): Promise<boolean> {
    try {
      // Verify important files still exist
      for (const file of this.importantFiles) {
        const filePath = join(this.projectRoot, file);
        if (!existsSync(filePath)) {
          return false;
        }
      }

      // Check for remaining temporary files
      const files = await this.getFilesInDirectory(this.projectRoot);
      const remainingTempFiles = [];

      for (const file of files) {
        if (
          (await this.shouldRemoveFile(file)) &&
          !this.shouldPreserveFile(file)
        ) {
          remainingTempFiles.push(file);
        }
      }

      if (remainingTempFiles.length > 0) {
      }
      return true;
    } catch (_error) {
      return false;
    }
  }

  async getDryRunReport(): Promise<CleanupResult> {
    const originalDryRun = this.config.dryRun;
    this.config.dryRun = true;

    try {
      const result = await this.performCleanup();
      return result;
    } finally {
      this.config.dryRun = originalDryRun;
    }
  }
}

// Utility function for easy cleanup execution
export async function cleanupRootDirectory(
  projectRoot: string,
  config: Partial<CleanupConfig> = {}
): Promise<CleanupResult> {
  const cleanup = new RootDirectoryCleanup(projectRoot, config);
  return cleanup.performCleanup();
}

// Utility function for dry run
export async function previewCleanup(
  projectRoot: string,
  config: Partial<CleanupConfig> = {}
): Promise<CleanupResult> {
  const cleanup = new RootDirectoryCleanup(projectRoot, {
    ...config,
    dryRun: true,
  });
  return cleanup.performCleanup();
}
