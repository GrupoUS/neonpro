#!/usr/bin/env node

/**
 * NeonPro 8-Package Build System
 * =================================
 * 
 * Unified build system for the new 8-package architecture:
 * 1. @neonpro/types - Core type definitions and schemas
 * 2. @neonpro/shared - Shared utilities and services
 * 3. @neonpro/database - Database layer and models
 * 4. @neonpro/ai-services - AI and ML services
 * 5. @neonpro/healthcare-core - Healthcare business logic
 * 6. @neonpro/security-compliance - Security and compliance
 * 7. @neonpro/api-gateway - API gateway and routing
 * 8. @neonpro/ui - React component library
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Core packages in build order
const CORE_PACKAGES = [
  '@neonpro/types',
  '@neonpro/shared',
  '@neonpro/database',
  '@neonpro/ai-services',
  '@neonpro/healthcare-core',
  '@neonpro/security-compliance',
  '@neonpro/api-gateway',
  '@neonpro/ui'
];

// Applications in build order
const APPLICATIONS = [
  '@neonpro/api',
  '@neonpro/web',
  '@neonpro/ai-agent',
  '@neonpro/tools'
];

class BuildSystem {
  constructor() {
    this.rootDir = rootDir;
    this.isCI = process.env.CI === 'true';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.verbose = process.argv.includes('--verbose');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  exec(command, options = {}) {
    try {
      if (this.verbose) {
        this.log(`Executing: ${command}`);
      }
      return execSync(command, {
        cwd: this.rootDir,
        stdio: this.verbose ? 'inherit' : 'pipe',
        ...options
      }).toString().trim();
    } catch (error) {
      this.log(`Command failed: ${command}`, 'error');
      if (this.verbose) {
        console.error(error.message);
      }
      throw error;
    }
  }

  // Check if a package exists
  packageExists(packageName) {
    const packagePath = join(this.rootDir, 'packages', packageName.replace('@neonpro/', ''));
    return existsSync(packagePath);
  }

  // Build packages in dependency order
  buildPackages(packages = CORE_PACKAGES, options = {}) {
    const { 
      parallel = false, 
      force = false, 
      mode = 'development',
      includeTests = false 
    } = options;

    this.log(`Building ${packages.length} packages in ${mode} mode`);

    const buildCommand = parallel 
      ? `turbo run build --filter=${packages.join('--filter=')}`
      : packages.map(pkg => `turbo run build --filter=${pkg}`).join(' && ');

    if (force) {
      buildCommand += ' --force';
    }

    if (mode === 'production') {
      buildCommand += ' --env=production';
    }

    if (includeTests) {
      buildCommand += ' && turbo run test --filter=' + packages.join('--filter=');
    }

    this.exec(buildCommand);
  }

  // Build all packages with proper dependency order
  buildAll(options = {}) {
    const { mode = 'development', includeTests = false } = options;
    
    this.log('🚀 Starting full build process');
    
    // Build core packages first
    this.buildPackages(CORE_PACKAGES, { ...options, parallel: false });
    
    // Then build applications
    this.buildPackages(APPLICATIONS, { ...options, parallel: true });
    
    this.log('✅ All packages built successfully');
  }

  // Development server with hot reloading
  dev(options = {}) {
    const { packages = APPLICATIONS, port = 3000 } = options;
    
    this.log(`🚀 Starting development server for ${packages.join(', ')}`);
    
    // Start turbo dev with hot reloading
    const devCommand = `turbo run dev --filter=${packages.join('--filter=')} --concurrency=20`;
    this.exec(devCommand, { stdio: 'inherit' });
  }

  // Run tests with coverage
  test(options = {}) {
    const { packages = [...CORE_PACKAGES, ...APPLICATIONS], coverage = true, watch = false } = options;
    
    this.log(`🧪 Running tests for ${packages.length} packages`);
    
    let testCommand = 'turbo run test';
    
    if (packages.length > 0) {
      testCommand += ` --filter=${packages.join('--filter=')}`;
    }
    
    if (coverage) {
      testCommand += ' --coverage';
    }
    
    if (watch) {
      testCommand += ' --watch';
    }
    
    this.exec(testCommand, { stdio: 'inherit' });
  }

  // Type checking
  typeCheck(options = {}) {
    const { packages = [...CORE_PACKAGES, ...APPLICATIONS] } = options;
    
    this.log(`🔍 Running type checking for ${packages.length} packages`);
    
    const typeCheckCommand = `turbo run type-check --filter=${packages.join('--filter=')}`;
    this.exec(typeCheckCommand);
  }

  // Linting and formatting
  lint(options = {}) {
    const { packages = [...CORE_PACKAGES, ...APPLICATIONS], fix = false } = options;
    
    this.log(`🔍 Running linting for ${packages.length} packages`);
    
    const lintCommand = fix 
      ? `turbo run lint:fix --filter=${packages.join('--filter=')}`
      : `turbo run lint --filter=${packages.join('--filter=')}`;
    
    this.exec(lintCommand);
  }

  // Quality gates
  qualityCheck(options = {}) {
    const { strict = false } = options;
    
    this.log('🔍 Running quality gates');
    
    try {
      // Type checking
      this.typeCheck();
      
      // Linting
      this.lint();
      
      // Format check
      this.exec('dprint check');
      
      // Security scan
      this.exec('bun run security:scan');
      
      if (strict) {
        // Performance checks
        this.exec('bun run performance:check');
      }
      
      this.log('✅ All quality gates passed');
    } catch (error) {
      this.log('❌ Quality gates failed', 'error');
      throw error;
    }
  }

  // Clean build artifacts
  clean(options = {}) {
    const { packages = [...CORE_PACKAGES, ...APPLICATIONS], deep = false } = options;
    
    this.log(`🧹 Cleaning build artifacts for ${packages.length} packages`);
    
    const cleanCommand = deep 
      ? `turbo run clean --filter=${packages.join('--filter=')} && rimraf dist .turbo node_modules/.cache`
      : `turbo run clean --filter=${packages.join('--filter=')}`;
    
    this.exec(cleanCommand);
  }

  // Production build with optimizations
  buildProduction(options = {}) {
    const { 
      includeApps = true, 
      analyze = false,
      generateStats = false
    } = options;
    
    this.log('🏭 Starting production build');
    
    // Clean previous builds
    this.clean({ deep: true });
    
    // Build packages
    this.buildPackages(CORE_PACKAGES, { mode: 'production', parallel: false });
    
    if (includeApps) {
      this.buildPackages(APPLICATIONS, { mode: 'production', parallel: true });
    }
    
    // Generate analysis
    if (analyze) {
      this.exec('turbo run build:analyze');
    }
    
    if (generateStats) {
      this.exec('turbo run build:stats');
    }
    
    this.log('✅ Production build completed');
  }

  // Create deployment package
  packageForDeployment(options = {}) {
    const { environment = 'production', format = 'tar' } = options;
    
    this.log(`📦 Creating deployment package for ${environment}`);
    
    // Build for production
    this.buildProduction();
    
    // Create deployment package
    const deployDir = join(this.rootDir, 'dist', 'deploy');
    this.exec(`mkdir -p ${deployDir}`);
    
    // Copy necessary files
    this.exec(`cp -r dist/apps ${deployDir}/`);
    this.exec(`cp -r dist/packages ${deployDir}/`);
    this.exec(`cp package.json ${deployDir}/`);
    this.exec(`cp bun.lock ${deployDir}/`);
    
    // Create archive
    const archiveName = `neonpro-${environment}-${Date.now()}.${format}`;
    this.exec(`cd ${deployDir} && tar -czf ../${archiveName} .`);
    
    this.log(`✅ Deployment package created: ${archiveName}`);
    return join(this.rootDir, 'dist', archiveName);
  }

  // Health check
  healthCheck() {
    this.log('🏥 Running build system health check');
    
    const checks = [
      () => {
        if (!existsSync(join(this.rootDir, 'turbo.json'))) {
          throw new Error('turbo.json not found');
        }
      },
      () => {
        if (!existsSync(join(this.rootDir, 'package.json'))) {
          throw new Error('package.json not found');
        }
      },
      () => {
        CORE_PACKAGES.forEach(pkg => {
          if (!this.packageExists(pkg)) {
            throw new Error(`Package ${pkg} not found`);
          }
        });
      }
    ];
    
    checks.forEach(check => {
      try {
        check();
      } catch (error) {
        this.log(`Health check failed: ${error.message}`, 'error');
        throw error;
      }
    });
    
    this.log('✅ Build system health check passed');
  }

  // Generate build matrix for CI
  generateBuildMatrix() {
    this.log('📊 Generating build matrix for CI');
    
    const matrix = {
      include: [
        {
          name: 'Core Packages',
          packages: CORE_PACKAGES.slice(0, 4),
          command: 'build'
        },
        {
          name: 'Service Packages',
          packages: CORE_PACKAGES.slice(4),
          command: 'build'
        },
        {
          name: 'Applications',
          packages: APPLICATIONS,
          command: 'build'
        },
        {
          name: 'Tests',
          packages: CORE_PACKAGES,
          command: 'test'
        },
        {
          name: 'Type Check',
          packages: [...CORE_PACKAGES, ...APPLICATIONS],
          command: 'type-check'
        }
      ]
    };
    
    return matrix;
  }
}

// CLI Interface
function main() {
  const [,, command, ...args] = process.argv;
  
  const buildSystem = new BuildSystem();
  
  try {
    switch (command) {
      case 'build':
        buildSystem.buildAll();
        break;
        
      case 'build:packages':
        buildSystem.buildPackages(CORE_PACKAGES);
        break;
        
      case 'build:apps':
        buildSystem.buildPackages(APPLICATIONS);
        break;
        
      case 'build:production':
        buildSystem.buildProduction();
        break;
        
      case 'dev':
        buildSystem.dev();
        break;
        
      case 'test':
        buildSystem.test();
        break;
        
      case 'test:coverage':
        buildSystem.test({ coverage: true });
        break;
        
      case 'type-check':
        buildSystem.typeCheck();
        break;
        
      case 'lint':
        buildSystem.lint();
        break;
        
      case 'lint:fix':
        buildSystem.lint({ fix: true });
        break;
        
      case 'quality':
        buildSystem.qualityCheck();
        break;
        
      case 'clean':
        buildSystem.clean();
        break;
        
      case 'package':
        const env = args[0] || 'production';
        buildSystem.packageForDeployment({ environment: env });
        break;
        
      case 'health':
        buildSystem.healthCheck();
        break;
        
      case 'matrix':
        const matrix = buildSystem.generateBuildMatrix();
        console.log(JSON.stringify(matrix, null, 2));
        break;
        
      default:
        console.log(`
NeonPro Build System

Usage: node scripts/build-system.js <command> [options]

Commands:
  build              Build all packages and applications
  build:packages     Build only core packages
  build:apps         Build only applications
  build:production   Build for production with optimizations
  dev                Start development server
  test               Run tests
  test:coverage      Run tests with coverage
  type-check         Run TypeScript type checking
  lint               Run linting
  lint:fix           Fix linting issues
  quality            Run quality gates
  clean              Clean build artifacts
  package [env]      Create deployment package
  health             Run health check
  matrix             Generate CI build matrix

Options:
  --verbose          Enable verbose output
        `);
        process.exit(1);
    }
  } catch (error) {
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default BuildSystem;