#!/usr/bin/env bun
/**
 * NEONPRO - BUN DEPENDENCY MIGRATION SCRIPT
 * =========================================
 * 
 * FASE 1.3.1: Migrate dependencies to Bun
 * -----------------------------------------
 * 
 * Este script realiza a migração completa de pnpm para Bun:
 * 1. Remove pnpm lockfile e configurações
 * 2. Atualiza bunfig.toml para usar Bun nativo
 * 3. Regenera lockfile com Bun
 * 4. Limpa cache antigo
 * 5. Valida instalação
 * 
 * MODO DE OPERAÇÃO:
 * - Preserva node_modules existente durante migração
 * - Atualiza configurações para performance máxima
 * - Valida healthcare dependencies
 * - Gera relatório de migração
 * 
 * @author NeonPro Development Team
 * @version 1.0.0
 * @license MIT
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

// Configuração
const PROJECT_ROOT = process.cwd();
const BUN_LOCK = join(PROJECT_ROOT, 'bun.lock');
const PNPM_LOCK = join(PROJECT_ROOT, 'pnpm-lock.yaml');
const BUNFIG_PATH = join(PROJECT_ROOT, 'bunfig.toml');
const REPORT_PATH = join(PROJECT_ROOT, 'benchmark-results', 'dependency-migration-report.json');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

// Logger estilizado
const logger = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}[STEP]${colors.reset} ${msg}`),
  result: (msg) => console.log(`${colors.magenta}[RESULT]${colors.reset} ${msg}`)
};

// Funções utilitárias
function runCommand(command, options = {}) {
  try {
    logger.info(`Executing: ${command}`);
    const result = execSync(command, { 
      encoding: 'utf8', 
      cwd: PROJECT_ROOT,
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, code: error.status };
  }
}

function fileExists(filePath) {
  return existsSync(filePath);
}

function deleteFile(filePath) {
  if (fileExists(filePath)) {
    unlinkSync(filePath);
    logger.success(`Deleted: ${filePath}`);
  }
}

function measureExecutionTime(fn) {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  return { ...result, executionTime: end - start };
}

// Relatório de migração
const migrationReport = {
  timestamp: new Date().toISOString(),
  phase: '1.3.1 - Migrate dependencies to Bun',
  steps: [],
  summary: {},
  performance: {},
  healthcareValidation: {}
};

// Funções de migração
async function backupExistingFiles() {
  logger.step('Creating backup of existing lockfiles...');
  
  const backupSteps = [];
  
  if (fileExists(PNPM_LOCK)) {
    const backupCmd = `cp "${PNPM_LOCK}" "${PNPM_LOCK}.backup"`;
    const result = runCommand(backupCmd);
    backupSteps.push({
      step: 'backup_pnpm_lock',
      success: result.success,
      file: PNPM_LOCK,
      backupFile: `${PNPM_LOCK}.backup`
    });
  }
  
  if (fileExists(BUN_LOCK)) {
    const backupCmd = `cp "${BUN_LOCK}" "${BUN_LOCK}.backup"`;
    const result = runCommand(backupCmd);
    backupSteps.push({
      step: 'backup_bun_lock',
      success: result.success,
      file: BUN_LOCK,
      backupFile: `${BUN_LOCK}.backup`
    });
  }
  
  migrationReport.steps.push({
    name: 'Backup Existing Files',
    status: backupSteps.every(s => s.success) ? 'completed' : 'partial',
    details: backupSteps
  });
  
  return backupSteps.every(s => s.success);
}

async function removePnpmArtifacts() {
  logger.step('Removing pnpm artifacts...');
  
  const removalSteps = [];
  
  // Remove pnpm lockfile
  if (fileExists(PNPM_LOCK)) {
    const startSize = runCommand(`wc -l < "${PNPM_LOCK}"`).output.trim();
    deleteFile(PNPM_LOCK);
    removalSteps.push({
      step: 'remove_pnpm_lock',
      success: true,
      originalSize: startSize
    });
  }
  
  // Remove .pnpm-store if exists
  const pnpmStore = join(PROJECT_ROOT, '.pnpm-store');
  if (existsSync(pnpmStore)) {
    const result = runCommand(`rm -rf "${pnpmStore}"`);
    removalSteps.push({
      step: 'remove_pnpm_store',
      success: result.success,
      path: pnpmStore
    });
  }
  
  migrationReport.steps.push({
    name: 'Remove Pnpm Artifacts',
    status: removalSteps.every(s => s.success) ? 'completed' : 'partial',
    details: removalSteps
  });
  
  return removalSteps.every(s => s.success);
}

async function updateBunfigToml() {
  logger.step('Updating bunfig.toml for native Bun usage...');
  
  const newBunfig = `# NeonPro Bunfig - Native Bun Configuration
# Optimized for maximum performance and healthcare compliance

[install]
# Native Bun package manager
registry = "https://registry.npmjs.org"
production = false
optional = true
dev = true
peer = true
frozenLockfile = true
# Aggressive caching for maximum performance
cache = ".bun/install-cache"
# Exact versions for healthcare compliance
exact = true

[run]
# Preload common modules for faster startup
preload = [
  "./node_modules/@types/node/index.d.ts",
  "./node_modules/@copilotkit/react-core/dist/index.js",
  "./node_modules/@copilotkit/react-ui/dist/index.js",
]
# Hot reload optimized
hot = true
# Optimized logging
silent = false

[test]
# Test runner optimizations
timeout = 30000
coverage = true
# Preload testing libraries
preload = [
  "./node_modules/vitest/dist/index.js",
]

[build]
# Build optimizations
minify = true
sourcemap = true
target = "node20"
# External dependencies
external = ["react", "react-dom"]

[cache]
# Intelligent caching for turborepo
enabled = true
dir = ".bun/cache"
# Content-based invalidation
strategy = "content"

# Performance optimizations
[optimize]
# Enable Bun's optimizer
enabled = true
# Dedupe dependencies
dedupe = true
# Prefer ES modules
esModule = true
`;
  
  try {
    writeFileSync(BUNFIG_PATH, newBunfig, 'utf8');
    logger.success('bunfig.toml updated for native Bun');
    
    migrationReport.steps.push({
      name: 'Update Bun Configuration',
      status: 'completed',
      details: { configFile: BUNFIG_PATH, strategy: 'native_bun' }
    });
    
    return true;
  } catch (error) {
    logger.error(`Failed to update bunfig.toml: ${error.message}`);
    migrationReport.steps.push({
      name: 'Update Bun Configuration',
      status: 'failed',
      error: error.message
    });
    return false;
  }
}

async function regenerateBunLockfile() {
  logger.step('Regenerating Bun lockfile...');
  
  const result = measureExecutionTime(() => {
    return runCommand('bun install --no-frozen-lockfile');
  });
  
  if (result.success) {
    const lockfileSize = runCommand('wc -l < bun.lock').output.trim();
    logger.success(`Bun lockfile regenerated (${lockfileSize} lines)`);
    
    migrationReport.steps.push({
      name: 'Regenerate Bun Lockfile',
      status: 'completed',
      details: {
        executionTime: result.executionTime,
        lockfileSize: parseInt(lockfileSize),
        command: 'bun install --no-frozen-lockfile'
      }
    });
    
    return true;
  } else {
    logger.error(`Failed to regenerate Bun lockfile: ${result.error}`);
    migrationReport.steps.push({
      name: 'Regenerate Bun Lockfile',
      status: 'failed',
      error: result.error
    });
    return false;
  }
}

async function validateHealthcareDependencies() {
  logger.step('Validating healthcare compliance dependencies...');
  
  const healthcareDeps = [
    '@supabase/supabase-js',
    'zod',
    '@types/node',
    'vitest',
    'typescript'
  ];
  
  const validationResults = [];
  
  for (const dep of healthcareDeps) {
    // Check if dependency exists in node_modules
    const result = runCommand(`test -d "node_modules/${dep}" && echo "found" || echo "not found"`);
    validationResults.push({
      dependency: dep,
      installed: result.success && result.output.trim() === 'found',
      status: result.success ? result.output.trim() : 'error'
    });
  }
  
  const allValid = validationResults.every(v => v.installed);
  
  migrationReport.healthcareValidation = {
    status: allValid ? 'valid' : 'invalid',
    dependencies: validationResults,
    timestamp: new Date().toISOString()
  };
  
  if (allValid) {
    logger.success('All healthcare dependencies validated');
  } else {
    logger.warning('Some healthcare dependencies need attention');
  }
  
  return allValid;
}

async function cleanupAndOptimize() {
  logger.step('Cleaning up and optimizing installation...');
  
  const cleanupSteps = [];
  
  // Clean Bun cache
  const cacheClean = runCommand('bun pm cache rm');
  cleanupSteps.push({
    step: 'clean_bun_cache',
    success: cacheClean.success
  });
  
  // Prune unnecessary packages
  const pruneResult = runCommand('bun prune');
  cleanupSteps.push({
    step: 'prune_packages',
    success: pruneResult.success
  });
  
  // Check final node_modules size
  const sizeResult = runCommand('du -sh node_modules');
  const finalSize = sizeResult.success ? sizeResult.output.trim() : 'unknown';
  
  migrationReport.steps.push({
    name: 'Cleanup and Optimize',
    status: cleanupSteps.every(s => s.success) ? 'completed' : 'partial',
    details: {
      cleanupSteps,
      finalNodeModulesSize: finalSize
    }
  });
  
  return cleanupSteps.every(s => s.success);
}

async function generateMigrationReport() {
  logger.step('Generating migration report...');
  
  // Calculate performance metrics
  const performanceMetrics = {
    lockfileSize: {
      before: 18958, // pnpm-lock.yaml size
      after: parseInt(runCommand('wc -l < bun.lock').output.trim()),
      reduction: 0
    },
    installStrategy: 'bun-native',
    cacheEnabled: true,
    healthcareCompliance: migrationReport.healthcareValidation.status === 'valid'
  };
  
  performanceMetrics.lockfileSize.reduction = 
    ((performanceMetrics.lockfileSize.before - performanceMetrics.lockfileSize.after) / 
     performanceMetrics.lockfileSize.before * 100).toFixed(1);
  
  migrationReport.performance = performanceMetrics;
  migrationReport.summary = {
    phase: '1.3.1 - Migrate dependencies to Bun',
    status: migrationReport.steps.every(s => s.status === 'completed') ? 'completed' : 'partial',
    completedSteps: migrationReport.steps.filter(s => s.status === 'completed').length,
    totalSteps: migrationReport.steps.length,
    timestamp: new Date().toISOString(),
    recommendations: [
      'Use bun install for all future dependency operations',
      'Monitor healthcare compliance dependencies regularly',
      'Consider enabling frozenLockfile in production builds',
      'Utilize bun pm cache rm periodically for maintenance'
    ]
  };
  
  // Save report
  try {
    writeFileSync(REPORT_PATH, JSON.stringify(migrationReport, null, 2));
    logger.success(`Migration report saved to: ${REPORT_PATH}`);
  } catch (error) {
    logger.error(`Failed to save report: ${error.message}`);
  }
  
  return migrationReport;
}

async function main() {
  logger.info('🚀 Starting NEONPRO Dependency Migration to Bun');
  logger.info('===============================================');
  
  const migrationSteps = [
    { name: 'Backup Existing Files', fn: backupExistingFiles },
    { name: 'Remove Pnpm Artifacts', fn: removePnpmArtifacts },
    { name: 'Update Bun Configuration', fn: updateBunfigToml },
    { name: 'Regenerate Bun Lockfile', fn: regenerateBunLockfile },
    { name: 'Validate Healthcare Dependencies', fn: validateHealthcareDependencies },
    { name: 'Cleanup and Optimize', fn: cleanupAndOptimize }
  ];
  
  let migrationSuccess = true;
  
  for (const step of migrationSteps) {
    logger.info(`Executing: ${step.name}`);
    const result = await step.fn();
    
    if (!result) {
      migrationSuccess = false;
      logger.error(`Step failed: ${step.name}`);
      break;
    }
    
    logger.success(`Step completed: ${step.name}`);
  }
  
  // Generate final report
  const report = await generateMigrationReport();
  
  // Final status
  logger.info('===============================================');
  if (migrationSuccess) {
    logger.success('🎉 Dependency migration completed successfully!');
    logger.result(`Lockfile size reduction: ${report.performance.lockfileSize.reduction}%`);
    logger.result(`Healthcare compliance: ${report.healthcareValidation.status}`);
  } else {
    logger.error('❌ Dependency migration completed with errors');
    logger.result('Check migration report for details');
  }
  
  logger.info('===============================================');
  
  return migrationSuccess ? 0 : 1;
}

// Execute migration
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(await main());
}

export { main as runDependencyMigration };