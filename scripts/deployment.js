#!/usr/bin/env node

/**
 * NeonPro Deployment System
 * =========================
 * 
 * Comprehensive deployment system for the 8-package architecture.
 * Features:
 * - Multi-environment deployment
 * - Zero-downtime deployments
 * - Rollback capabilities
 * - Environment management
 * - Configuration management
 * - Health checks
 * - Monitoring and alerts
 * - Deployment analytics
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Deployment configuration
const DEPLOYMENT_CONFIG = {
  environments: {
    development: {
      domain: 'dev.neonpro.com.br',
      region: 'us-east-1',
      provider: 'vercel',
      autoDeploy: true,
      healthCheck: true,
      monitoring: true
    },
    staging: {
      domain: 'staging.neonpro.com.br',
      region: 'us-east-1',
      provider: 'vercel',
      autoDeploy: true,
      healthCheck: true,
      monitoring: true
    },
    production: {
      domain: 'neonpro.com.br',
      region: 'us-east-1',
      provider: 'vercel',
      autoDeploy: false,
      healthCheck: true,
      monitoring: true,
      backup: true
    }
  },

  // Deployment strategies
  strategies: {
    rolling: {
      enabled: true,
      batch_size: 2,
      health_check_wait: 30000,
      rollback_on_failure: true
    },
    bluegreen: {
      enabled: true,
      health_check_wait: 60000,
      rollback_on_failure: true
    },
    canary: {
      enabled: true,
      percentage: 10,
      increment_time: 300000,
      rollback_on_failure: true
    }
  },

  // Health checks
  healthChecks: {
    endpoints: [
      '/health',
      '/api/health',
      '/metrics'
    ],
    timeout: 30000,
    retries: 3,
    success_threshold: 3,
    failure_threshold: 3
  },

  // Monitoring
  monitoring: {
    metrics: [
      'cpu_usage',
      'memory_usage',
      'response_time',
      'error_rate',
      'active_connections'
    ],
    alerts: {
      cpu_usage: { threshold: 80, severity: 'warning' },
      memory_usage: { threshold: 90, severity: 'critical' },
      response_time: { threshold: 2000, severity: 'warning' },
      error_rate: { threshold: 5, severity: 'critical' }
    }
  }
};

// Package deployment configurations
const PACKAGE_DEPLOYMENT_CONFIGS = {
  '@neonpro/types': {
    type: 'library',
    deployable: false,
    dependencies: []
  },
  '@neonpro/shared': {
    type: 'library',
    deployable: false,
    dependencies: ['@neonpro/types']
  },
  '@neonpro/database': {
    type: 'service',
    deployable: true,
    dependencies: ['@neonpro/types', '@neonpro/shared'],
    migrations: true,
    healthCheck: '/database/health'
  },
  '@neonpro/ai-services': {
    type: 'service',
    deployable: true,
    dependencies: ['@neonpro/types', '@neonpro/shared'],
    healthCheck: '/ai/health'
  },
  '@neonpro/healthcare-core': {
    type: 'service',
    deployable: true,
    dependencies: ['@neonpro/types', '@neonpro/shared', '@neonpro/database'],
    healthCheck: '/healthcare/health'
  },
  '@neonpro/security-compliance': {
    type: 'service',
    deployable: true,
    dependencies: ['@neonpro/types', '@neonpro/shared'],
    healthCheck: '/security/health'
  },
  '@neonpro/api-gateway': {
    type: 'service',
    deployable: true,
    dependencies: ['@neonpro/types', '@neonpro/shared', '@neonpro/healthcare-core'],
    healthCheck: '/api/health'
  },
  '@neonpro/ui': {
    type: 'library',
    deployable: false,
    dependencies: ['@neonpro/types', '@neonpro/shared', '@neonpro/healthcare-core']
  }
};

class DeploymentSystem {
  constructor() {
    this.rootDir = rootDir;
    this.deployments = new Map();
    this.rollbacks = new Map();
    this.healthStatus = new Map();
    this.isCI = process.env.CI === 'true';
    this.verbose = process.argv.includes('--verbose');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🚀';
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

  // Get deployment configuration
  getDeploymentConfig(environment) {
    const config = DEPLOYMENT_CONFIG.environments[environment];
    if (!config) {
      throw new Error(`Invalid environment: ${environment}`);
    }
    return config;
  }

  // Create deployment package
  async createDeploymentPackage(options = {}) {
    const { 
      environment = 'production',
      includeSource = true,
      includeTests = false,
      includeDocs = false
    } = options;

    this.log(`📦 Creating deployment package for ${environment}`);

    const config = this.getDeploymentConfig(environment);
    const deploymentId = this.generateDeploymentId();
    const packageDir = join(this.rootDir, 'dist', 'deployments', deploymentId);

    // Create deployment directory
    mkdirSync(packageDir, { recursive: true });

    // Build for production
    this.log('🔨 Building for production...');
    this.exec('bun run build-system build:production');

    // Copy built artifacts
    this.log('📋 Copying built artifacts...');
    this.exec(`cp -r dist/apps ${packageDir}/`);
    this.exec(`cp -r dist/packages ${packageDir}/`);

    // Copy configuration files
    this.log('⚙️ Copying configuration files...');
    const configFiles = [
      'package.json',
      'bun.lock',
      'turbo.json',
      '.env.production',
      'vercel.json'
    ];

    for (const file of configFiles) {
      const sourcePath = join(this.rootDir, file);
      if (existsSync(sourcePath)) {
        copyFileSync(sourcePath, join(packageDir, file));
      }
    }

    // Copy additional files
    if (includeSource) {
      this.log('📄 Including source files...');
      this.exec(`cp -r src ${packageDir}/`);
    }

    if (includeTests) {
      this.log('🧪 Including test files...');
      this.exec(`cp -r test-results ${packageDir}/`);
    }

    if (includeDocs) {
      this.log('📚 Including documentation...');
      this.exec(`cp -r docs ${packageDir}/`);
    }

    // Create deployment manifest
    const manifest = {
      deploymentId,
      environment,
      timestamp: new Date().toISOString(),
      version: this.getVersion(),
      commit: this.getCurrentCommit(),
      packages: this.getPackageVersions(),
      config,
      files: this.getFileList(packageDir)
    };

    writeFileSync(join(packageDir, 'deployment-manifest.json'), JSON.stringify(manifest, null, 2));

    // Create archive
    const archiveName = `neonpro-${environment}-${deploymentId}.tar.gz`;
    this.exec(`cd ${packageDir} && tar -czf ../${archiveName} .`);

    this.log(`✅ Deployment package created: ${archiveName}`);
    return {
      deploymentId,
      packagePath: join(this.rootDir, 'dist', 'deployments', archiveName),
      manifest
    };
  }

  // Deploy to environment
  async deploy(options = {}) {
    const { 
      environment = 'staging',
      strategy = 'rolling',
      dryRun = false,
      skipHealthCheck = false,
      skipBackup = false
    } = options;

    this.log(`🚀 Starting deployment to ${environment}...`);

    const config = this.getDeploymentConfig(environment);
    const deploymentId = this.generateDeploymentId();

    try {
      // Record deployment start
      this.recordDeployment({
        deploymentId,
        environment,
        status: 'started',
        strategy,
        timestamp: new Date().toISOString()
      });

      // Create deployment package
      const deploymentPackage = await this.createDeploymentPackage({ environment });

      if (dryRun) {
        this.log('🔍 Dry run mode - skipping actual deployment');
        return deploymentPackage;
      }

      // Backup current deployment if needed
      if (config.backup && !skipBackup) {
        await this.backupDeployment(environment);
      }

      // Deploy based on provider
      switch (config.provider) {
        case 'vercel':
          await this.deployToVercel(deploymentPackage, config);
          break;
        case 'aws':
          await this.deployToAWS(deploymentPackage, config);
          break;
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }

      // Run health checks
      if (!skipHealthCheck) {
        await this.runHealthChecks(environment, config);
      }

      // Record deployment success
      this.recordDeployment({
        deploymentId,
        environment,
        status: 'completed',
        strategy,
        timestamp: new Date().toISOString(),
        packagePath: deploymentPackage.packagePath
      });

      this.log(`✅ Deployment to ${environment} completed successfully`);
      
      return {
        deploymentId,
        environment,
        status: 'completed',
        packagePath: deploymentPackage.packagePath
      };

    } catch (error) {
      this.log(`Deployment to ${environment} failed: ${error.message}`, 'error');

      // Record deployment failure
      this.recordDeployment({
        deploymentId,
        environment,
        status: 'failed',
        strategy,
        timestamp: new Date().toISOString(),
        error: error.message
      });

      // Auto-rollback if enabled
      if (DEPLOYMENT_CONFIG.strategies[strategy].rollback_on_failure) {
        this.log('🔄 Initiating auto-rollback...');
        await this.rollback(environment, deploymentId);
      }

      throw error;
    }
  }

  // Deploy to Vercel
  async deployToVercel(deploymentPackage, config) {
    this.log('🚀 Deploying to Vercel...');

    const vercelConfig = {
      token: process.env.VERCEL_TOKEN,
      orgId: process.env.VERCEL_ORG_ID,
      projectId: process.env.VERCEL_PROJECT_ID,
      scope: process.env.VERCEL_SCOPE
    };

    if (!vercelConfig.token || !vercelConfig.orgId || !vercelConfig.projectId) {
      throw new Error('Vercel configuration missing');
    }

    // Extract deployment package
    const extractDir = join(this.rootDir, 'dist', 'deployments', deploymentPackage.deploymentId);
    this.exec(`tar -xzf ${deploymentPackage.packagePath} -C ${extractDir}`);

    // Deploy to Vercel
    const deployCommand = `cd ${extractDir} && vercel deploy --prod --scope ${vercelConfig.scope}`;
    const deployOutput = this.exec(deployCommand);

    // Extract deployment URL
    const deploymentUrl = this.extractDeploymentUrl(deployOutput);
    
    this.log(`✅ Deployed to Vercel: ${deploymentUrl}`);
    return deploymentUrl;
  }

  // Deploy to AWS
  async deployToAWS(deploymentPackage, config) {
    this.log('🚀 Deploying to AWS...');

    // Implementation for AWS deployment
    // This would include:
    // - S3 bucket upload
    // - CloudFront distribution
    // - Lambda functions
    // - API Gateway
    // - ECS/EKS deployments
    
    this.log('⚠️ AWS deployment not yet implemented');
    throw new Error('AWS deployment not yet implemented');
  }

  // Rollback deployment
  async rollback(environment, deploymentId) {
    this.log(`🔄 Rolling back deployment ${deploymentId} in ${environment}...`);

    try {
      // Get previous deployment
      const previousDeployment = this.getPreviousDeployment(environment);
      if (!previousDeployment) {
        throw new Error('No previous deployment found for rollback');
      }

      // Deploy previous version
      await this.deploy({
        environment,
        strategy: 'rolling',
        skipBackup: true,
        skipHealthCheck: false
      });

      // Record rollback
      this.recordRollback({
        deploymentId,
        environment,
        rollbackDeploymentId: previousDeployment.deploymentId,
        timestamp: new Date().toISOString()
      });

      this.log('✅ Rollback completed successfully');
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Run health checks
  async runHealthChecks(environment, config) {
    this.log(`🏥 Running health checks for ${environment}...`);

    const healthCheckConfig = DEPLOYMENT_CONFIG.healthChecks;
    const baseUrl = this.getEnvironmentUrl(environment);

    for (const endpoint of healthCheckConfig.endpoints) {
      const url = `${baseUrl}${endpoint}`;
      
      try {
        const response = await this.checkHealth(url, healthCheckConfig);
        
        if (response.status === 'healthy') {
          this.log(`✅ Health check passed: ${endpoint}`);
        } else {
          throw new Error(`Health check failed: ${endpoint} - ${response.message}`);
        }
      } catch (error) {
        this.log(`Health check error: ${endpoint} - ${error.message}`, 'error');
        throw error;
      }
    }

    this.log('✅ All health checks passed');
  }

  // Check specific health endpoint
  async checkHealth(url, config) {
    const startTime = Date.now();
    const timeout = config.timeout || 30000;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          status: 'unhealthy',
          message: `HTTP ${response.status}`,
          responseTime: Date.now() - startTime
        };
      }

      const data = await response.json();
      
      return {
        status: data.status === 'healthy' ? 'healthy' : 'unhealthy',
        message: data.message || 'OK',
        responseTime: Date.now() - startTime,
        data
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  // Backup current deployment
  async backupDeployment(environment) {
    this.log(`💾 Creating backup for ${environment}...`);

    const backupId = this.generateDeploymentId();
    const backupDir = join(this.rootDir, 'dist', 'backups', backupId);

    mkdirSync(backupDir, { recursive: true });

    // Get current deployment info
    const currentDeployment = this.getCurrentDeployment(environment);
    
    if (currentDeployment) {
      // Backup current deployment
      const backupManifest = {
        backupId,
        environment,
        timestamp: new Date().toISOString(),
        deploymentId: currentDeployment.deploymentId,
        config: currentDeployment.config
      };

      writeFileSync(join(backupDir, 'backup-manifest.json'), JSON.stringify(backupManifest, null, 2));
      
      this.log(`✅ Backup created: ${backupId}`);
    } else {
      this.log('No current deployment to backup', 'warn');
    }
  }

  // Record deployment
  recordDeployment(deployment) {
    const deploymentsFile = join(this.rootDir, 'dist', 'deployments.json');
    const deployments = this.loadDeployments();
    
    deployments.push(deployment);
    writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));
    
    this.deployments.set(deployment.deploymentId, deployment);
  }

  // Record rollback
  recordRollback(rollback) {
    const rollbacksFile = join(this.rootDir, 'dist', 'rollbacks.json');
    const rollbacks = this.loadRollbacks();
    
    rollbacks.push(rollback);
    writeFileSync(rollbacksFile, JSON.stringify(rollbacks, null, 2));
    
    this.rollbacks.set(rollback.deploymentId, rollback);
  }

  // Load deployments
  loadDeployments() {
    const deploymentsFile = join(this.rootDir, 'dist', 'deployments.json');
    
    try {
      if (existsSync(deploymentsFile)) {
        return JSON.parse(readFileSync(deploymentsFile, 'utf8'));
      }
    } catch (error) {
      this.log('Error loading deployments', 'warn');
    }
    
    return [];
  }

  // Load rollbacks
  loadRollbacks() {
    const rollbacksFile = join(this.rootDir, 'dist', 'rollbacks.json');
    
    try {
      if (existsSync(rollbacksFile)) {
        return JSON.parse(readFileSync(rollbacksFile, 'utf8'));
      }
    } catch (error) {
      this.log('Error loading rollbacks', 'warn');
    }
    
    return [];
  }

  // Generate deployment ID
  generateDeploymentId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substr(2, 6);
    return `deploy-${timestamp}-${random}`;
  }

  // Get version
  getVersion() {
    try {
      const packageJson = JSON.parse(readFileSync(join(this.rootDir, 'package.json'), 'utf8'));
      return packageJson.version;
    } catch (error) {
      return 'unknown';
    }
  }

  // Get current commit
  getCurrentCommit() {
    try {
      return this.exec('git rev-parse HEAD');
    } catch (error) {
      return 'unknown';
    }
  }

  // Get package versions
  getPackageVersions() {
    const versions = {};
    
    for (const [packageName, config] of Object.entries(PACKAGE_DEPLOYMENT_CONFIGS)) {
      try {
        const packagePath = join(this.rootDir, 'packages', packageName.replace('@neonpro/', ''));
        const packageJson = JSON.parse(readFileSync(join(packagePath, 'package.json'), 'utf8'));
        versions[packageName] = packageJson.version;
      } catch (error) {
        versions[packageName] = 'unknown';
      }
    }
    
    return versions;
  }

  // Get file list
  getFileList(directory) {
    const files = [];
    
    const scanDir = (dir) => {
      const items = this.exec(`find ${dir} -type f`).split('\n').filter(Boolean);
      
      for (const item of items) {
        const relativePath = item.replace(directory + '/', '');
        files.push(relativePath);
      }
    };
    
    try {
      scanDir(directory);
    } catch (error) {
      this.log('Error scanning directory', 'warn');
    }
    
    return files;
  }

  // Extract deployment URL
  extractDeploymentUrl(output) {
    const urlMatch = output.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : 'unknown';
  }

  // Get environment URL
  getEnvironmentUrl(environment) {
    const config = DEPLOYMENT_CONFIG.environments[environment];
    return `https://${config.domain}`;
  }

  // Get previous deployment
  getPreviousDeployment(environment) {
    const deployments = this.loadDeployments();
    
    return deployments
      .filter(d => d.environment === environment && d.status === 'completed')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[1]; // Skip current
  }

  // Get current deployment
  getCurrentDeployment(environment) {
    const deployments = this.loadDeployments();
    
    return deployments
      .filter(d => d.environment === environment && d.status === 'completed')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }

  // Get deployment status
  getDeploymentStatus(environment) {
    const currentDeployment = this.getCurrentDeployment(environment);
    
    if (!currentDeployment) {
      return { status: 'not_deployed', message: 'No deployment found' };
    }

    return {
      status: currentDeployment.status,
      deploymentId: currentDeployment.deploymentId,
      timestamp: currentDeployment.timestamp,
      version: currentDeployment.version
    };
  }

  // Generate deployment report
  generateDeploymentReport() {
    this.log('📊 Generating deployment report...');

    const deployments = this.loadDeployments();
    const rollbacks = this.loadRollbacks();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDeployments: deployments.length,
        successfulDeployments: deployments.filter(d => d.status === 'completed').length,
        failedDeployments: deployments.filter(d => d.status === 'failed').length,
        totalRollbacks: rollbacks.length
      },
      environments: {},
      recentDeployments: deployments.slice(-10).reverse(),
      recentRollbacks: rollbacks.slice(-5).reverse()
    };

    // Environment summary
    for (const env of Object.keys(DEPLOYMENT_CONFIG.environments)) {
      const envDeployments = deployments.filter(d => d.environment === env);
      const envRollbacks = rollbacks.filter(r => r.environment === env);
      
      report.environments[env] = {
        totalDeployments: envDeployments.length,
        successfulDeployments: envDeployments.filter(d => d.status === 'completed').length,
        failedDeployments: envDeployments.filter(d => d.status === 'failed').length,
        totalRollbacks: envRollbacks.length,
        lastDeployment: envDeployments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      };
    }

    // Save report
    const reportPath = join(this.rootDir, 'dist', 'deployment-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`📊 Deployment report saved to ${reportPath}`);
    return report;
  }

  // Clean old deployments
  cleanOldDeployments(options = {}) {
    const { keepCount = 10, environment } = options;
    
    this.log('🧹 Cleaning old deployments...');

    const deployments = this.loadDeployments();
    const deploymentsDir = join(this.rootDir, 'dist', 'deployments');

    let filteredDeployments = deployments;
    if (environment) {
      filteredDeployments = deployments.filter(d => d.environment === environment);
    }

    // Keep only the most recent deployments
    const sortedDeployments = filteredDeployments
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(keepCount);

    // Remove old deployment files
    const toRemove = filteredDeployments.filter(d => !sortedDeployments.includes(d));
    
    for (const deployment of toRemove) {
      const deploymentDir = join(deploymentsDir, deployment.deploymentId);
      try {
        this.exec(`rm -rf ${deploymentDir}`);
        this.log(`Removed old deployment: ${deployment.deploymentId}`);
      } catch (error) {
        this.log(`Failed to remove deployment ${deployment.deploymentId}`, 'warn');
      }
    }

    // Update deployments file
    writeFileSync(join(this.rootDir, 'dist', 'deployments.json'), JSON.stringify(sortedDeployments, null, 2));

    this.log(`✅ Cleaned ${toRemove.length} old deployments`);
  }
}

// CLI Interface
async function main() {
  const [,, command, ...args] = process.argv;
  
  const deploymentSystem = new DeploymentSystem();

  try {
    switch (command) {
      case 'deploy':
        const environment = args[0] || 'staging';
        await deploymentSystem.deploy({ environment });
        break;
        
      case 'package':
        const packageEnv = args[0] || 'production';
        await deploymentSystem.createDeploymentPackage({ environment: packageEnv });
        break;
        
      case 'rollback':
        const rollbackEnv = args[0] || 'production';
        const deploymentId = args[1];
        await deploymentSystem.rollback(rollbackEnv, deploymentId);
        break;
        
      case 'health':
        const healthEnv = args[0] || 'production';
        await deploymentSystem.runHealthChecks(healthEnv, deploymentSystem.getDeploymentConfig(healthEnv));
        break;
        
      case 'backup':
        const backupEnv = args[0] || 'production';
        await deploymentSystem.backupDeployment(backupEnv);
        break;
        
      case 'status':
        const statusEnv = args[0] || 'production';
        const status = deploymentSystem.getDeploymentStatus(statusEnv);
        console.log(JSON.stringify(status, null, 2));
        break;
        
      case 'report':
        const report = deploymentSystem.generateDeploymentReport();
        console.log(JSON.stringify(report, null, 2));
        break;
        
      case 'clean':
        const cleanEnv = args[0];
        const keepCount = parseInt(args[1]) || 10;
        await deploymentSystem.cleanOldDeployments({ environment: cleanEnv, keepCount });
        break;
        
      default:
        console.log(`
NeonPro Deployment System

Usage: node scripts/deployment.js <command> [options]

Commands:
  deploy [env]         Deploy to environment (default: staging)
  package [env]        Create deployment package (default: production)
  rollback [env] [id]  Rollback deployment
  health [env]         Run health checks
  backup [env]         Create backup
  status [env]         Get deployment status
  report               Generate deployment report
  clean [env] [count]  Clean old deployments

Environments:
  development          Development environment
  staging              Staging environment
  production           Production environment

Options:
  --verbose            Enable verbose output
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

export default DeploymentSystem;