/**
 * NEONPRO Root Directory Cleanup Script
 * Removes temporary files and optimizes project structure
 * Healthcare SaaS Quality Standard: ≥9.9/10
 */

import { promises as fs } from 'fs';
import { join } from 'path';

interface CleanupConfig {
  rootPath: string;
  filesToRemove: string[];
  patternsToRemove: RegExp[];
  directoriesToClean: string[];
  preservePatterns: RegExp[];
}

const healthcareCleanupConfig: CleanupConfig = {
  rootPath: process.cwd(),

  // Temporary and development files to remove
  filesToRemove: [
    'temp_story_05_01.txt',
    'temp_story_analysis.md',
    'read_story_05_01.txt',
    'check_anvisa_structure.js',
    'check_middleware.js',
    'check_story.js',
    'copy_hook.js',
    'copy_hook_direct.js',
    'examine_and_migrate.js',
    'examine_anvisa.js',
    'examine_current_structure.js',
    'examine_existing_anvisa.js',
    'examine_files.js',
    'examine_files_directly.js',
    'examine_hook_content.js',
    'examine_migration_files.js',
    'examine_src_files.js',
    'examine_structure.js',
  ],

  // Patterns for files to remove
  patternsToRemove: [
    /^temp_.*\.(js|ts|txt|md)$/,
    /^read_.*\.(js|ts)$/,
    /^examine_.*\.js$/,
    /^migrate_.*\.js$/,
    /^check_.*\.js$/,
    /.*\.backup$/,
    /.*\.removed$/,
    /.*\.disabled$/,
    /.*\.old$/,
    /.*\.temp$/,
  ],

  // Directories to clean (remove empty directories)
  directoriesToClean: ['temp', 'temp_files', 'migration_temp', 'backup'],

  // Patterns to preserve (important files)
  preservePatterns: [
    /^\.git/,
    /^\.github/,
    /^node_modules/,
    /^\.next/,
    /^dist/,
    /^build/,
    /package\.json$/,
    /package-lock\.json$/,
    /pnpm-lock\.yaml$/,
    /yarn\.lock$/,
    /turbo\.json$/,
    /tsconfig\.json$/,
    /\.env/,
    /README\.md$/,
    /CHANGELOG\.md$/,
    /LICENSE$/,
  ],
};
export class HealthcareDirectoryCleanup {
  private config: CleanupConfig;
  private cleanedFiles: string[] = [];
  private preservedFiles: string[] = [];
  private errors: Array<{ file: string; error: string }> = [];

  constructor(config: CleanupConfig) {
    this.config = config;
  }

  async executeCleanup(): Promise<void> {
    console.log('🏥 Starting Healthcare Directory Cleanup...');

    try {
      // Remove specific files
      await this.removeSpecificFiles();

      // Remove files matching patterns
      await this.removePatternFiles();

      // Clean empty directories
      await this.cleanEmptyDirectories();

      // Generate cleanup report
      this.generateReport();

      console.log('✅ Healthcare Directory Cleanup Completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }

  private async removeSpecificFiles(): Promise<void> {
    console.log('🧹 Removing specific temporary files...');

    for (const filename of this.config.filesToRemove) {
      const filepath = join(this.config.rootPath, filename);

      try {
        await fs.access(filepath);
        await fs.unlink(filepath);
        this.cleanedFiles.push(filename);
        console.log(`   ✓ Removed: ${filename}`);
      } catch (error) {
        // File doesn't exist or can't be removed - this is often expected
        if ((error as any).code !== 'ENOENT') {
          this.errors.push({ file: filename, error: (error as Error).message });
        }
      }
    }
  }

  private async removePatternFiles(): Promise<void> {
    console.log('🔍 Scanning for pattern-matched files...');

    try {
      const files = await fs.readdir(this.config.rootPath);

      for (const filename of files) {
        // Check if file should be preserved
        const shouldPreserve = this.config.preservePatterns.some((pattern) =>
          pattern.test(filename)
        );

        if (shouldPreserve) {
          this.preservedFiles.push(filename);
          continue;
        }

        // Check if file matches removal patterns
        const shouldRemove = this.config.patternsToRemove.some((pattern) => pattern.test(filename));

        if (shouldRemove) {
          const filepath = join(this.config.rootPath, filename);

          try {
            const stats = await fs.stat(filepath);
            if (stats.isFile()) {
              await fs.unlink(filepath);
              this.cleanedFiles.push(filename);
              console.log(`   ✓ Pattern removal: ${filename}`);
            }
          } catch (error) {
            this.errors.push({ file: filename, error: (error as Error).message });
          }
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
    }
  }
  private async cleanEmptyDirectories(): Promise<void> {
    console.log('📁 Cleaning empty directories...');

    for (const dirName of this.config.directoriesToClean) {
      const dirPath = join(this.config.rootPath, dirName);

      try {
        const stats = await fs.stat(dirPath);
        if (stats.isDirectory()) {
          const files = await fs.readdir(dirPath);
          if (files.length === 0) {
            await fs.rmdir(dirPath);
            this.cleanedFiles.push(`${dirName}/`);
            console.log(`   ✓ Removed empty directory: ${dirName}/`);
          }
        }
      } catch (error) {
        // Directory doesn't exist - this is expected
        if ((error as any).code !== 'ENOENT') {
          this.errors.push({ file: dirName, error: (error as Error).message });
        }
      }
    }
  }

  private generateReport(): void {
    console.log('\n📊 HEALTHCARE DIRECTORY CLEANUP REPORT');
    console.log('=====================================');
    console.log(`✅ Files cleaned: ${this.cleanedFiles.length}`);
    console.log(`🔒 Files preserved: ${this.preservedFiles.length}`);
    console.log(`❌ Errors encountered: ${this.errors.length}`);

    if (this.cleanedFiles.length > 0) {
      console.log('\n🧹 Cleaned Files:');
      this.cleanedFiles.forEach((file) => console.log(`   - ${file}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ file, error }) => console.log(`   - ${file}: ${error}`));
    }

    console.log('\n🏥 Healthcare directory cleanup completed successfully!');
  }
}

// Execute cleanup if run directly
if (require.main === module) {
  const cleanup = new HealthcareDirectoryCleanup(healthcareCleanupConfig);
  cleanup.executeCleanup().catch(console.error);
}

export { healthcareCleanupConfig };
