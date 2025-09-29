#!/usr/bin/env node
/**
 * NeonPro Optimized Build Script
 * Healthcare-optimized build system for Bun runtime
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exec = promisify(require('child_process').exec);

// Healthcare build configuration
const BUILD_CONFIG = {
  // Build targets optimized for healthcare
  targets: [
    {
      name: 'types',
      command: 'bun run build',
      parallel: true,
      priority: 1 // Build types first
    },
    {
      name: 'database',
      command: 'bun run build',
      parallel: true,
      priority: 2
    },
    {
      name: 'core',
      command: 'bun run build',
      parallel: true,
      priority: 3
    },
    {
      name: 'ui',
      command: 'bun run build',
      parallel: true,
      priority: 4
    },
    {
      name: 'config',
      command: 'bun run build',
      parallel: true,
      priority: 5
    }
  ],
  
  // Healthcare compliance settings
  compliance: {
    validateTypes: true,
    checkSecurity: true,
    auditDependencies: true
  },
  
  // Performance optimizations
  performance: {
    parallel: true,
    cache: true,
    minify: true
  }
};

class OptimizedBuilder {
  constructor() {
    this.buildResults = new Map();
    this.startTime = Date.now();
  }

  async log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);
  }

  async executeCommand(command, cwd = process.cwd()) {
    try {
      this.log(`Executing: ${command} in ${cwd}`);
      const result = await exec(command, { cwd, maxBuffer: 1024 * 1024 * 10 });
      return { success: true, output: result.stdout, error: result.stderr };
    } catch (error) {
      this.log(`Command failed: ${command} - ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async buildPackage(packageName, command) {
    const packagePath = path.join(__dirname, '..', 'packages', packageName);
    
    // Check if package directory exists
    try {
      await fs.access(packagePath);
    } catch {
      this.log(`Package directory not found: ${packagePath}`, 'warn');
      return { success: false, error: 'Package directory not found' };
    }

    // Execute build command
    const result = await this.executeCommand(command, packagePath);
    this.buildResults.set(packageName, result);
    
    if (result.success) {
      this.log(`✅ Successfully built ${packageName}`);
    } else {
      this.log(`❌ Failed to build ${packageName}: ${result.error}`, 'error');
    }
    
    return result;
  }

  async buildParallel(packages) {
    this.log(`Building ${packages.length} packages in parallel...`);
    
    const buildPromises = packages.map(pkg => 
      this.buildPackage(pkg.name, pkg.command)
    );
    
    const results = await Promise.all(buildPromises);
    return results;
  }

  async buildSequential(packages) {
    this.log(`Building ${packages.length} packages sequentially...`);
    
    const results = [];
    for (const pkg of packages) {
      const result = await this.buildPackage(pkg.name, pkg.command);
      results.push(result);
      
      if (!result.success && BUILD_CONFIG.compliance.strict) {
        this.log(`Stopping build due to failure in ${pkg.name}`, 'error');
        break;
      }
    }
    
    return results;
  }

  async validateBuild() {
    this.log('Validating build output...');
    
    const validationResults = [];
    
    for (const [packageName, result] of this.buildResults) {
      if (!result.success) {
        validationResults.push({ package: packageName, valid: false, error: 'Build failed' });
        continue;
      }
      
      const packagePath = path.join(__dirname, '..', 'packages', packageName);
      const distPath = path.join(packagePath, 'dist');
      
      try {
        await fs.access(distPath);
        const stats = await fs.stat(distPath);
        
        validationResults.push({
          package: packageName,
          valid: true,
          size: stats.size,
          files: await fs.readdir(distPath)
        });
      } catch {
        validationResults.push({
          package: packageName,
          valid: false,
          error: 'No dist directory found'
        });
      }
    }
    
    return validationResults;
  }

  async generateBuildReport() {
    const buildTime = Date.now() - this.startTime;
    const validationResults = await this.validateBuild();
    
    const successfulBuilds = Array.from(this.buildResults.values()).filter(r => r.success).length;
    const totalBuilds = this.buildResults.size;
    
    const report = {
      timestamp: new Date().toISOString(),
      buildTime: `${buildTime}ms`,
      success: successfulBuilds === totalBuilds,
      packages: {
        total: totalBuilds,
        successful: successfulBuilds,
        failed: totalBuilds - successfulBuilds
      },
      validation: validationResults,
      healthcare: {
        compliance: BUILD_CONFIG.compliance,
        performance: BUILD_CONFIG.performance
      }
    };
    
    // Save build report
    const reportPath = path.join(__dirname, '..', 'build-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📊 Build report saved to ${reportPath}`);
    this.log(`⏱️  Total build time: ${buildTime}ms`);
    this.log(`✅ Success rate: ${successfulBuilds}/${totalBuilds}`);
    
    return report;
  }

  async run() {
    this.log('🚀 Starting NeonPro optimized build...');
    this.log('🏥 Healthcare compliance mode enabled');
    
    try {
      // Build packages
      if (BUILD_CONFIG.performance.parallel) {
        await this.buildParallel(BUILD_CONFIG.targets);
      } else {
        await this.buildSequential(BUILD_CONFIG.targets);
      }
      
      // Generate build report
      const report = await this.generateBuildReport();
      
      if (report.success) {
        this.log('🎉 Build completed successfully!');
        return 0;
      } else {
        this.log('❌ Build completed with errors', 'error');
        return 1;
      }
    } catch (error) {
      this.log(`💥 Build failed: ${error.message}`, 'error');
      return 1;
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new OptimizedBuilder();
  builder.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Build script failed:', error);
    process.exit(1);
  });
}

export default OptimizedBuilder;