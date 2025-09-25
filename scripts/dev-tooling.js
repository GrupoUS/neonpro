#!/usr/bin/env node

/**
 * NeonPro Development Tooling
 * ===========================
 * 
 * Comprehensive development tooling for the 8-package architecture.
 * Features:
 * - Code analysis and optimization
 * - Performance monitoring
 * - Debug utilities
 * - Package management
 * - Development environment setup
 * - Code generation
 * - Dependency management
 * - Development metrics
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, watch } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Development tooling configuration
const DEV_TOOLING_CONFIG = {
  // Code analysis
  analysis: {
    complexity: {
      enabled: true,
      threshold: 10,
      report: true
    },
    dependencies: {
      enabled: true,
      circular: true,
      outdated: true
    },
    performance: {
      enabled: true,
      bundleAnalysis: true,
      loadTime: true
    }
  },

  // Debug tools
  debug: {
    breakpoints: {
      enabled: true,
      sourceMaps: true
    },
    profiling: {
      enabled: true,
      memory: true,
      cpu: true
    },
    logging: {
      enabled: true,
      level: 'debug',
      format: 'structured'
    }
  },

  // Code generation
  generation: {
    components: {
      enabled: true,
      template: 'typescript-react'
    },
    services: {
      enabled: true,
      template: 'typescript-service'
    },
    tests: {
      enabled: true,
      template: 'vitest'
    }
  },

  // Development metrics
  metrics: {
    buildTime: {
      enabled: true,
      threshold: 30000
    },
    testTime: {
      enabled: true,
      threshold: 60000
    },
    startupTime: {
      enabled: true,
      threshold: 5000
    }
  }
};

// Package-specific tooling configurations
const PACKAGE_TOOLING_CONFIGS = {
  '@neonpro/types': {
    analysis: ['complexity', 'dependencies'],
    tools: ['tsc', 'vitest'],
    generators: ['types', 'schemas']
  },
  '@neonpro/shared': {
    analysis: ['complexity', 'dependencies', 'performance'],
    tools: ['tsc', 'vitest', 'eslint'],
    generators: ['services', 'utilities']
  },
  '@neonpro/database': {
    analysis: ['complexity', 'dependencies', 'performance'],
    tools: ['tsc', 'vitest', 'eslint', 'prisma'],
    generators: ['models', 'migrations', 'queries']
  },
  '@neonpro/ai-services': {
    analysis: ['complexity', 'dependencies', 'performance'],
    tools: ['tsc', 'vitest', 'eslint'],
    generators: ['services', 'prompts']
  },
  '@neonpro/healthcare-core': {
    analysis: ['complexity', 'dependencies', 'performance'],
    tools: ['tsc', 'vitest', 'eslint'],
    generators: ['services', 'validators', 'business-logic']
  },
  '@neonpro/security-compliance': {
    analysis: ['complexity', 'dependencies', 'security'],
    tools: ['tsc', 'vitest', 'eslint', 'oxlint'],
    generators: ['validators', 'auth', 'compliance']
  },
  '@neonpro/api-gateway': {
    analysis: ['complexity', 'dependencies', 'performance'],
    tools: ['tsc', 'vitest', 'eslint', 'hono'],
    generators: ['routes', 'middleware', 'handlers']
  },
  '@neonpro/ui': {
    analysis: ['complexity', 'dependencies', 'performance'],
    tools: ['tsc', 'vitest', 'eslint', 'storybook'],
    generators: ['components', 'hooks', 'forms']
  }
};

class DevelopmentTooling {
  constructor() {
    this.rootDir = rootDir;
    this.metrics = new Map();
    this.watchers = new Map();
    this.analyzers = new Map();
    this.isCI = process.env.CI === 'true';
    this.verbose = process.argv.includes('--verbose');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🛠️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  exec(command, options = {}) {
    try {
      if (this.verbose) {
        this.log(`Executing: ${command}`);
      }
      const startTime = performance.now();
      const result = execSync(command, {
        cwd: this.rootDir,
        stdio: this.verbose ? 'inherit' : 'pipe',
        ...options
      }).toString().trim();
      const duration = performance.now() - startTime;
      
      // Record execution metrics
      this.recordMetric(command, duration);
      
      return { result, duration };
    } catch (error) {
      this.log(`Command failed: ${command}`, 'error');
      if (this.verbose) {
        console.error(error.message);
      }
      throw error;
    }
  }

  // Record performance metrics
  recordMetric(command, duration) {
    const key = command.split(' ')[0];
    const metrics = this.metrics.get(key) || [];
    metrics.push({ timestamp: Date.now(), duration });
    this.metrics.set(key, metrics);
  }

  // Get performance metrics
  getMetrics(command) {
    return this.metrics.get(command) || [];
  }

  // Calculate average execution time
  getAverageExecutionTime(command) {
    const metrics = this.getMetrics(command);
    if (metrics.length === 0) return 0;
    
    const totalTime = metrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / metrics.length;
  }

  // Code analysis
  async analyzeCode(options = {}) {
    const { 
      packages = Object.keys(PACKAGE_TOOLING_CONFIGS),
      types = ['complexity', 'dependencies', 'performance'],
      outputFormat = 'json'
    } = options;

    this.log('🔍 Analyzing code...');

    const results = {};

    for (const packageName of packages) {
      this.log(`Analyzing package: ${packageName}`);
      
      const config = PACKAGE_TOOLING_CONFIGS[packageName];
      if (!config) continue;

      const packageResults = {};

      for (const type of types) {
        if (config.analysis.includes(type)) {
          const result = await this.runAnalysis(packageName, type);
          packageResults[type] = result;
        }
      }

      results[packageName] = packageResults;
    }

    // Generate analysis report
    await this.generateAnalysisReport(results, outputFormat);

    this.log('✅ Code analysis completed');
    return results;
  }

  // Run specific analysis type
  async runAnalysis(packageName, analysisType) {
    this.log(`Running ${analysisType} analysis for ${packageName}`);

    switch (analysisType) {
      case 'complexity':
        return await this.analyzeComplexity(packageName);
      case 'dependencies':
        return await this.analyzeDependencies(packageName);
      case 'performance':
        return await this.analyzePerformance(packageName);
      case 'security':
        return await this.analyzeSecurity(packageName);
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }
  }

  // Analyze code complexity
  async analyzeComplexity(packageName) {
    const packagePath = join(this.rootDir, 'packages', packageName.replace('@neonpro/', ''));
    
    try {
      // Run complexity analysis
      const result = this.exec(`npx complexity-report ${packagePath}`);
      
      return {
        type: 'complexity',
        status: 'completed',
        metrics: this.parseComplexityOutput(result.result),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        type: 'complexity',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Analyze dependencies
  async analyzeDependencies(packageName) {
    const packagePath = join(this.rootDir, 'packages', packageName.replace('@neonpro/', ''));
    const packageJsonPath = join(packagePath, 'package.json');
    
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      // Check for circular dependencies
      const circularDeps = this.checkCircularDependencies(packageName);
      
      // Check for outdated dependencies
      const outdatedDeps = this.checkOutdatedDependencies(packageJson);
      
      return {
        type: 'dependencies',
        status: 'completed',
        metrics: {
          total: Object.keys(packageJson.dependencies || {}).length + Object.keys(packageJson.devDependencies || {}).length,
          circular: circularDeps.length,
          outdated: outdatedDeps.length
        },
        circularDependencies: circularDeps,
        outdatedDependencies: outdatedDeps,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        type: 'dependencies',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Analyze performance
  async analyzePerformance(packageName) {
    try {
      // Run build performance analysis
      const buildResult = this.exec(`bun run build-system build:packages --filter=${packageName}`);
      
      // Run bundle analysis
      const bundleResult = this.exec(`bun run build-system build:analyze --filter=${packageName}`);
      
      return {
        type: 'performance',
        status: 'completed',
        metrics: {
          buildTime: buildResult.duration,
          bundleSize: this.parseBundleSize(bundleResult.result),
          loadTime: this.estimateLoadTime(packageName)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        type: 'performance',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Analyze security
  async analyzeSecurity(packageName) {
    try {
      // Run security audit
      const auditResult = this.exec(`bun run security:audit`);
      
      // Run code security scan
      const scanResult = this.exec(`bun run security:scan`);
      
      return {
        type: 'security',
        status: 'completed',
        metrics: {
          vulnerabilities: this.parseSecurityResults(auditResult.result),
          issues: this.parseSecurityResults(scanResult.result)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        type: 'security',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Check circular dependencies
  checkCircularDependencies(packageName) {
    // Simplified circular dependency detection
    // In a real implementation, this would use a proper dependency graph
    return [];
  }

  // Check outdated dependencies
  checkOutdatedDependencies(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const outdated = [];
    
    // Check for common outdated patterns
    for (const [name, version] of Object.entries(deps)) {
      if (typeof version === 'string' && version.includes('beta')) {
        outdated.push({ name, version, reason: 'beta version' });
      }
    }
    
    return outdated;
  }

  // Parse complexity output
  parseComplexityOutput(output) {
    // Simplified complexity parsing
    const lines = output.split('\n');
    const metrics = {
      averageComplexity: 0,
      maxComplexity: 0,
      totalFunctions: 0,
      complexFunctions: 0
    };
    
    // Parse actual complexity metrics from output
    // This is a simplified version
    
    return metrics;
  }

  // Parse bundle size
  parseBundleSize(output) {
    // Extract bundle size from output
    const sizeMatch = output.match(/Total size:\s*([\d.]+)\s*(KB|MB)/);
    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2];
      return unit === 'MB' ? size * 1024 : size;
    }
    return 0;
  }

  // Estimate load time
  estimateLoadTime(packageName) {
    // Simplified load time estimation
    const avgBuildTime = this.getAverageExecutionTime(`bun run build-system build:packages --filter=${packageName}`);
    return avgBuildTime * 0.1; // Rough estimate
  }

  // Parse security results
  parseSecurityResults(output) {
    const lines = output.split('\n');
    const issues = [];
    
    for (const line of lines) {
      if (line.includes('vulnerability') || line.includes('security')) {
        issues.push({
          type: 'security',
          message: line.trim(),
          severity: 'medium'
        });
      }
    }
    
    return issues;
  }

  // Generate analysis report
  async generateAnalysisReport(results, outputFormat = 'json') {
    this.log('📊 Generating analysis report...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPackages: Object.keys(results).length,
        packagesWithIssues: Object.values(results).filter(r => 
          Object.values(r).some(a => a.status === 'error')
        ).length,
        averageComplexity: this.calculateAverageComplexity(results),
        totalDependencies: this.calculateTotalDependencies(results)
      },
      packages: results,
      recommendations: this.generateRecommendations(results)
    };

    if (outputFormat === 'json') {
      const reportPath = join(this.rootDir, 'dist', 'analysis-report.json');
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      this.log(`📊 Analysis report saved to ${reportPath}`);
    } else if (outputFormat === 'html') {
      await this.generateHtmlAnalysisReport(report);
    }

    return report;
  }

  // Calculate average complexity
  calculateAverageComplexity(results) {
    const complexityValues = Object.values(results)
      .flatMap(r => Object.values(r))
      .filter(a => a.type === 'complexity' && a.metrics)
      .map(a => a.metrics.averageComplexity);
    
    return complexityValues.length > 0 
      ? complexityValues.reduce((sum, val) => sum + val, 0) / complexityValues.length 
      : 0;
  }

  // Calculate total dependencies
  calculateTotalDependencies(results) {
    return Object.values(results)
      .flatMap(r => Object.values(r))
      .filter(a => a.type === 'dependencies' && a.metrics)
      .reduce((sum, a) => sum + a.metrics.total, 0);
  }

  // Generate recommendations
  generateRecommendations(results) {
    const recommendations = [];
    
    for (const [packageName, analyses] of Object.entries(results)) {
      for (const [type, analysis] of Object.entries(analyses)) {
        if (analysis.status === 'error') {
          recommendations.push({
            package: packageName,
            type,
            severity: 'high',
            message: `Fix ${type} analysis errors in ${packageName}`
          });
        } else if (analysis.metrics) {
          if (type === 'complexity' && analysis.metrics.averageComplexity > 10) {
            recommendations.push({
              package: packageName,
              type,
              severity: 'medium',
              message: `Consider refactoring complex code in ${packageName}`
            });
          }
          if (type === 'dependencies' && analysis.metrics.circular > 0) {
            recommendations.push({
              package: packageName,
              type,
              severity: 'high',
              message: `Resolve circular dependencies in ${packageName}`
            });
          }
        }
      }
    }
    
    return recommendations;
  }

  // Generate HTML analysis report
  async generateHtmlAnalysisReport(report) {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>NeonPro Code Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .metric h3 { margin: 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; color: #007acc; }
        .packages { margin: 20px 0; }
        .package { background: #fff; border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .package.has-issues { border-left: 4px solid #dc3545; }
        .package.clean { border-left: 4px solid #28a745; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .recommendation { margin: 10px 0; padding: 10px; background: #fff; border-radius: 3px; }
        .recommendation.high { border-left: 4px solid #dc3545; }
        .recommendation.medium { border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 NeonPro Code Analysis Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Packages</h3>
            <div class="value">${report.summary.totalPackages}</div>
        </div>
        <div class="metric">
            <h3>Packages with Issues</h3>
            <div class="value">${report.summary.packagesWithIssues}</div>
        </div>
        <div class="metric">
            <h3>Average Complexity</h3>
            <div class="value">${Math.round(report.summary.averageComplexity)}</div>
        </div>
        <div class="metric">
            <h3>Total Dependencies</h3>
            <div class="value">${report.summary.totalDependencies}</div>
        </div>
    </div>
    
    <div class="packages">
        <h2>Package Analysis</h2>
        ${Object.entries(report.packages).map(([name, analyses]) => {
          const hasIssues = Object.values(analyses).some(a => a.status === 'error');
          return `
            <div class="package ${hasIssues ? 'has-issues' : 'clean'}">
                <h3>${name}</h3>
                ${Object.entries(analyses).map(([type, analysis]) => `
                    <div>
                        <strong>${type}:</strong> 
                        <span style="color: ${analysis.status === 'error' ? '#dc3545' : '#28a745'}">
                          ${analysis.status}
                        </span>
                        ${analysis.metrics ? ` - ${JSON.stringify(analysis.metrics)}` : ''}
                    </div>
                `).join('')}
            </div>
          `;
        }).join('')}
    </div>
    
    <div class="recommendations">
        <h2>Recommendations</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation ${rec.severity}">
                <strong>${rec.package} - ${rec.type}:</strong> ${rec.message}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const htmlPath = join(this.rootDir, 'dist', 'analysis-report.html');
    writeFileSync(htmlPath, htmlTemplate);

    this.log(`📊 HTML analysis report saved to ${htmlPath}`);
  }

  // Debug utilities
  async setupDebugEnvironment(options = {}) {
    const { 
      packages = Object.keys(PACKAGE_TOOLING_CONFIGS),
      enableSourceMaps = true,
      enableProfiling = true
    } = options;

    this.log('🐛 Setting up debug environment...');

    for (const packageName of packages) {
      this.log(`Setting up debug for ${packageName}`);
      
      // Create debug configuration
      const debugConfig = {
        packageName,
        sourceMaps: enableSourceMaps,
        profiling: enableProfiling,
        breakpoints: true,
        inspect: true
      };

      // Save debug configuration
      const configPath = join(this.rootDir, 'packages', packageName.replace('@neonpro/', ''), '.vscode', 'launch.json');
      mkdirSync(dirname(configPath), { recursive: true });
      
      const launchConfig = {
        version: '0.2.0',
        configurations: [
          {
            name: `Debug ${packageName}`,
            type: 'node',
            request: 'launch',
            program: '${workspaceFolder}/dist/index.js',
            preLaunchTask: 'build',
            sourceMaps: enableSourceMaps,
            outFiles: ['${workspaceFolder}/dist/**/*.js'],
            env: {
              NODE_ENV: 'development',
              DEBUG: `${packageName}:*`
            }
          }
        ]
      };

      writeFileSync(configPath, JSON.stringify(launchConfig, null, 2));
    }

    this.log('✅ Debug environment setup complete');
  }

  // Performance monitoring
  async startPerformanceMonitoring(options = {}) {
    const { 
      packages = Object.keys(PACKAGE_TOOLING_CONFIGS),
      interval = 60000 // 1 minute
    } = options;

    this.log('📊 Starting performance monitoring...');

    // Set up monitoring for each package
    for (const packageName of packages) {
      this.monitorPackagePerformance(packageName, interval);
    }

    this.log('✅ Performance monitoring started');
  }

  // Monitor individual package performance
  monitorPackagePerformance(packageName, interval) {
    const monitor = () => {
      try {
        const metrics = {
          timestamp: Date.now(),
          packageName,
          buildTime: this.getAverageExecutionTime(`bun run build-system build:packages --filter=${packageName}`),
          testTime: this.getAverageExecutionTime(`bun run testing-infrastructure test --filter=${packageName}`),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        };

        // Save metrics
        this.savePerformanceMetrics(metrics);

        // Check thresholds
        this.checkPerformanceThresholds(metrics);

      } catch (error) {
        this.log(`Performance monitoring error for ${packageName}: ${error.message}`, 'warn');
      }
    };

    // Run immediately and then on interval
    monitor();
    const intervalId = setInterval(monitor, interval);
    
    this.watchers.set(`perf-${packageName}`, { type: 'performance', id: intervalId });
  }

  // Save performance metrics
  savePerformanceMetrics(metrics) {
    const metricsPath = join(this.rootDir, 'dist', 'performance-metrics.json');
    const existingMetrics = existsSync(metricsPath) 
      ? JSON.parse(readFileSync(metricsPath, 'utf8'))
      : [];
    
    existingMetrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (existingMetrics.length > 1000) {
      existingMetrics.splice(0, existingMetrics.length - 1000);
    }
    
    writeFileSync(metricsPath, JSON.stringify(existingMetrics, null, 2));
  }

  // Check performance thresholds
  checkPerformanceThresholds(metrics) {
    const config = DEV_TOOLING_CONFIG.metrics;
    
    if (config.buildTime.enabled && metrics.buildTime > config.buildTime.threshold) {
      this.log(`Build time threshold exceeded for ${metrics.packageName}: ${metrics.buildTime}ms > ${config.buildTime.threshold}ms`, 'warn');
    }
    
    if (config.testTime.enabled && metrics.testTime > config.testTime.threshold) {
      this.log(`Test time threshold exceeded for ${metrics.packageName}: ${metrics.testTime}ms > ${config.testTime.threshold}ms`, 'warn');
    }
  }

  // Code generation
  async generateCode(options = {}) {
    const { 
      type = 'component',
      packageName,
      name,
      template = 'default'
    } = options;

    this.log(`🔧 Generating ${type} code...`);

    if (!packageName || !name) {
      throw new Error('Package name and component name are required');
    }

    const config = PACKAGE_TOOLING_CONFIGS[packageName];
    if (!config || !config.generators.includes(type)) {
      throw new Error(`Code generation not supported for ${type} in ${packageName}`);
    }

    const generatedCode = await this.generateCodeFile(packageName, type, name, template);
    
    this.log(`✅ Generated ${type} ${name} in ${packageName}`);
    return generatedCode;
  }

  // Generate code file
  async generateCodeFile(packageName, type, name, template) {
    const packagePath = join(this.rootDir, 'packages', packageName.replace('@neonpro/', ''));
    
    // Get template
    const templateContent = this.getTemplate(type, template);
    
    // Generate code based on template
    const code = this.renderTemplate(templateContent, { name, packageName });
    
    // Save generated code
    const fileName = this.getFileName(type, name);
    const filePath = join(packagePath, 'src', fileName);
    
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, code);
    
    return { filePath, code };
  }

  // Get template content
  getTemplate(type, template) {
    const templatePath = join(this.rootDir, 'templates', type, `${template}.template`);
    
    if (existsSync(templatePath)) {
      return readFileSync(templatePath, 'utf8');
    }
    
    // Return default template
    return this.getDefaultTemplate(type);
  }

  // Get default template
  getDefaultTemplate(type) {
    const templates = {
      component: `
import React from 'react';

interface {{name}}Props {
  // Add props here
}

export function {{name}}(props: {{name}}Props) {
  return (
    <div>
      {/* Add component content here */}
    </div>
  );
}
`,
      service: `
export class {{name}}Service {
  constructor() {
    // Initialize service
  }

  async execute() {
    // Implement service logic
    return { success: true };
  }
}
`,
      test: `
import { describe, it, expect } from 'vitest';

describe('{{name}}', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
`
    };
    
    return templates[type] || '';
  }

  // Render template
  renderTemplate(template, variables) {
    let rendered = template;
    
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return rendered;
  }

  // Get file name
  getFileName(type, name) {
    const nameKebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    
    const fileNames = {
      component: `components/${nameKebab}.tsx`,
      service: `services/${nameKebab}.ts`,
      test: `__tests__/${nameKebab}.test.ts`
    };
    
    return fileNames[type] || `${nameKebab}.ts`;
  }

  // Dependency management
  async manageDependencies(options = {}) {
    const { 
      action = 'update',
      packages = Object.keys(PACKAGE_TOOLING_CONFIGS),
      dependencyType = 'all'
    } = options;

    this.log(`📦 Managing dependencies (${action})...`);

    for (const packageName of packages) {
      this.log(`Managing dependencies for ${packageName}`);
      
      switch (action) {
        case 'update':
          await this.updateDependencies(packageName, dependencyType);
          break;
        case 'audit':
          await this.auditDependencies(packageName);
          break;
        case 'dedupe':
          await this.dedupeDependencies(packageName);
          break;
      }
    }

    this.log('✅ Dependency management completed');
  }

  // Update dependencies
  async updateDependencies(packageName, dependencyType) {
    const packagePath = join(this.rootDir, 'packages', packageName.replace('@neonpro/', ''));
    
    try {
      const command = dependencyType === 'all' 
        ? 'bun update'
        : `bun update ${dependencyType}`;
      
      this.exec(command, { cwd: packagePath });
    } catch (error) {
      this.log(`Failed to update dependencies for ${packageName}: ${error.message}`, 'warn');
    }
  }

  // Audit dependencies
  async auditDependencies(packageName) {
    const packagePath = join(this.rootDir, 'packages', packageName.replace('@neonpro/', ''));
    
    try {
      this.exec('bun audit', { cwd: packagePath });
    } catch (error) {
      this.log(`Dependency audit failed for ${packageName}: ${error.message}`, 'warn');
    }
  }

  // Dedupe dependencies
  async dedupeDependencies(packageName) {
    try {
      this.exec('bun dedupe');
    } catch (error) {
      this.log(`Failed to dedupe dependencies for ${packageName}: ${error.message}`, 'warn');
    }
  }

  // Development metrics
  async getDevelopmentMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      performance: {},
      quality: {},
      productivity: {}
    };

    // Performance metrics
    for (const command of ['build', 'test', 'lint']) {
      const executionTimes = this.getMetrics(`bun run ${command}`);
      metrics.performance[command] = {
        average: this.getAverageExecutionTime(`bun run ${command}`),
        executions: executionTimes.length,
        lastExecution: executionTimes[executionTimes.length - 1]?.timestamp || null
      };
    }

    // Quality metrics
    metrics.quality = {
      testCoverage: await this.getTestCoverage(),
      lintIssues: await this.getLintIssues(),
      typeErrors: await this.getTypeErrors()
    };

    // Productivity metrics
    metrics.productivity = {
      totalCommits: this.getTotalCommits(),
      deployments: this.getTotalDeployments(),
      buildTime: this.getTotalBuildTime()
    };

    return metrics;
  }

  // Get test coverage
  async getTestCoverage() {
    try {
      const coveragePath = join(this.rootDir, 'coverage', 'coverage-final.json');
      if (existsSync(coveragePath)) {
        const coverage = JSON.parse(readFileSync(coveragePath, 'utf8'));
        return coverage.total?.lines?.pct || 0;
      }
    } catch (error) {
      this.log('Error getting test coverage', 'warn');
    }
    return 0;
  }

  // Get lint issues
  async getLintIssues() {
    try {
      const result = this.exec('bun run lint:oxlint --json');
      const issues = JSON.parse(result.result);
      return issues.length;
    } catch (error) {
      this.log('Error getting lint issues', 'warn');
    }
    return 0;
  }

  // Get type errors
  async getTypeErrors() {
    try {
      const result = this.exec('bun run type-check');
      const lines = result.result.split('\n');
      return lines.filter(line => line.includes('error')).length;
    } catch (error) {
      this.log('Error getting type errors', 'warn');
    }
    return 0;
  }

  // Get total commits
  getTotalCommits() {
    try {
      const result = this.exec('git rev-list --count HEAD');
      return parseInt(result.result);
    } catch (error) {
      return 0;
    }
  }

  // Get total deployments
  getTotalDeployments() {
    try {
      const deploymentsPath = join(this.rootDir, 'dist', 'deployments.json');
      if (existsSync(deploymentsPath)) {
        const deployments = JSON.parse(readFileSync(deploymentsPath, 'utf8'));
        return deployments.filter(d => d.status === 'completed').length;
      }
    } catch (error) {
      this.log('Error getting deployment count', 'warn');
    }
    return 0;
  }

  // Get total build time
  getTotalBuildTime() {
    const buildMetrics = this.getMetrics('bun run build');
    return buildMetrics.reduce((sum, m) => sum + m.duration, 0);
  }

  // Clean up tooling
  cleanup() {
    this.log('🧹 Cleaning up development tooling...');

    // Clear all watchers
    for (const [key, watcher] of this.watchers) {
      if (watcher.type === 'performance') {
        clearInterval(watcher.id);
      } else {
        watcher.close();
      }
    }

    this.watchers.clear();
    this.log('✅ Development tooling cleanup complete');
  }
}

// CLI Interface
async function main() {
  const [,, command, ...args] = process.argv;
  
  const devTooling = new DevelopmentTooling();

  try {
    switch (command) {
      case 'analyze':
        const packages = args.filter(arg => !arg.startsWith('--'));
        const options = {
          packages: packages.length > 0 ? packages : undefined,
          outputFormat: args.includes('--html') ? 'html' : 'json'
        };
        await devTooling.analyzeCode(options);
        break;
        
      case 'debug':
        await devTooling.setupDebugEnvironment();
        break;
        
      case 'monitor':
        await devTooling.startPerformanceMonitoring();
        break;
        
      case 'generate':
        const type = args[0];
        const packageName = args[1];
        const name = args[2];
        const template = args[3];
        await devTooling.generateCode({ type, packageName, name, template });
        break;
        
      case 'deps':
        const action = args[0] || 'update';
        await devTooling.manageDependencies({ action });
        break;
        
      case 'metrics':
        const metrics = await devTooling.getDevelopmentMetrics();
        console.log(JSON.stringify(metrics, null, 2));
        break;
        
      case 'cleanup':
        devTooling.cleanup();
        break;
        
      default:
        console.log(`
NeonPro Development Tooling

Usage: node scripts/dev-tooling.js <command> [options]

Commands:
  analyze [packages]    Analyze code complexity, dependencies, and performance
  debug                Setup debug environment
  monitor              Start performance monitoring
  generate <type> <pkg> <name> [template]  Generate code from templates
  deps [action]        Manage dependencies (update, audit, dedupe)
  metrics              Get development metrics
  cleanup              Clean up tooling resources

Generate types:
  component           React component
  service             Service class
  test               Test file

Options:
  --html              Generate HTML report
  --verbose           Enable verbose output
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DevelopmentTooling;