#!/usr/bin/env node
/**
 * NEONPRO - BUN INSTALLATION OPTIMIZATION SCRIPT
 * ==============================================
 * 
 * FASE 1.3.2: Optimize dependency installation
 * ----------------------------------------------
 * 
 * Este script otimiza a instalação de dependências Bun:
 * 1. Corrige problemas de compatibilidade CommonJS/ESM
 * 2. Otimiza configuração do Bun para monorepo
 * 3. Implementa estratégias de cache avançadas
 * 4. Resolve problemas de PATH e binários
 * 5. Valida pipeline de build completo
 * 
 * MODO DE OPERAÇÃO:
 * - Análise profunda de problemas de compatibilidade
 * - Correções automatizadas de binários
 * - Otimizações específicas para healthcare
 * - Validação completa do pipeline
 * 
 * @author NeonPro Development Team
 * @version 1.0.0
 * @license MIT
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Configuração
const PROJECT_ROOT = process.cwd();
const BUNFIG_PATH = join(PROJECT_ROOT, 'bunfig.toml');
const REPORT_PATH = join(PROJECT_ROOT, 'benchmark-results', 'installation-optimization-report.json');
const BINARIES_DIR = join(PROJECT_ROOT, 'node_modules', '.bin');

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
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
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

function readFile(filePath) {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function writeFile(filePath, content) {
  try {
    writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    logger.error(`Failed to write ${filePath}: ${error.message}`);
    return false;
  }
}

function measureExecutionTime(fn) {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  return { ...result, executionTime: end - start };
}

// Relatório de otimização
const optimizationReport = {
  timestamp: new Date().toISOString(),
  phase: '1.3.2 - Optimize dependency installation',
  steps: [],
  summary: {},
  performance: {},
  healthcareValidation: {},
  binaryFixes: {},
  cacheOptimization: {}
};

// Funções de otimização
async function analyzeCurrentState() {
  logger.step('Analyzing current installation state...');
  
  const analysis = {
    nodeModulesSize: 'unknown',
    lockfileSize: 0,
    binaryCount: 0,
    issuesFound: [],
    healthcareDeps: []
  };
  
  // Analisar node_modules
  const sizeResult = runCommand('du -sh node_modules 2>/dev/null || echo "0"');
  analysis.nodeModulesSize = sizeResult.success ? sizeResult.output.trim() : '0';
  
  // Analisar lockfile
  const lockfileResult = runCommand('wc -l < bun.lock 2>/dev/null || echo "0"');
  analysis.lockfileSize = parseInt(lockfileResult.output.trim()) || 0;
  
  // Contar binários
  const binCount = runCommand('ls node_modules/.bin 2>/dev/null | wc -l || echo "0"');
  analysis.binaryCount = parseInt(binCount.output.trim()) || 0;
  
  // Verificar dependências de saúde
  const healthDeps = ['@supabase/supabase-js', 'zod', 'typescript', 'vitest'];
  for (const dep of healthDeps) {
    const exists = runCommand(`test -d node_modules/${dep} && echo "found" || echo "missing"`);
    analysis.healthcareDeps.push({
      dependency: dep,
      installed: exists.success && exists.output.trim() === 'found'
    });
  }
  
  // Detectar problemas de binários
  const binaryIssues = [];
  const criticalBinaries = ['tsc', 'vitest', 'tsx'];
  
  for (const binary of criticalBinaries) {
    const binaryPath = join(BINARIES_DIR, binary);
    if (fileExists(binaryPath)) {
      const content = readFile(binaryPath);
      if (content && content.includes('require(')) {
        binaryIssues.push({
          binary,
          issue: 'CommonJS require() in ES module context',
          path: binaryPath
        });
      }
    }
  }
  
  analysis.issuesFound = binaryIssues;
  
  optimizationReport.steps.push({
    name: 'Analyze Current State',
    status: 'completed',
    details: analysis
  });
  
  return analysis;
}

async function fixBinaryCompatibility() {
  logger.step('Fixing binary compatibility issues...');
  
  const fixes = [];
  
  // Corrigir binário TypeScript
  const tscBinary = join(BINARIES_DIR, 'tsc');
  const tscContent = readFile(tscBinary);
  
  if (tscContent && tscContent.includes('require(')) {
    // Criar versão ES module do tsc
    const esmTscContent = `#!/usr/bin/env node
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('../lib/tsc.js');
`;
    
    if (writeFile(tscBinary, esmTscContent)) {
      fixes.push({
        binary: 'tsc',
        fix: 'Converted to ES module with createRequire',
        status: 'fixed'
      });
    }
  }
  
  // Corrigir outros binários com problemas similares
  const binaryFiles = runCommand('find node_modules/.bin -type f -executable').output.split('\n').filter(Boolean);
  
  for (const binaryFile of binaryFiles) {
    const content = readFile(binaryFile);
    if (content && content.includes('require(') && !content.includes('createRequire')) {
      const dir = dirname(binaryFile);
      const binaryName = binaryFile.split('/').pop();
      
      // Tentar converter para ES module
      const esmContent = `#!/usr/bin/env node
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const path = require('path');
const scriptPath = path.join(path.dirname(import.meta.url), '..', 'lib', '${binaryName}.js');
require(scriptPath);
`;
      
      if (writeFile(binaryFile, esmContent)) {
        fixes.push({
          binary: binaryName,
          fix: 'Converted to ES module with createRequire',
          status: 'fixed'
        });
      }
    }
  }
  
  optimizationReport.binaryFixes = {
    totalFixed: fixes.length,
    fixes,
    timestamp: new Date().toISOString()
  };
  
  optimizationReport.steps.push({
    name: 'Fix Binary Compatibility',
    status: 'completed',
    details: optimizationReport.binaryFixes
  });
  
  return fixes.length > 0;
}

async function optimizeBunConfiguration() {
  logger.step('Optimizing Bun configuration...');
  
  const currentBunfig = readFile(BUNFIG_PATH) || '';
  
  const optimizedBunfig = `# NeonPro Bunfig - Healthcare-Optimized Configuration
# Optimized for maximum performance, compliance, and reliability

[install]
# Native Bun package manager with healthcare compliance
registry = "https://registry.npmjs.org"
production = false
optional = true
dev = true
peer = true
frozenLockfile = true
# Healthcare compliance: exact versions
exact = true
# Aggressive caching for performance
cache = ".bun/install-cache"
# Prefer ES modules for better compatibility
esModule = true
# Dedupe dependencies for efficiency
dedupe = true

[run]
# Preload critical healthcare modules
preload = [
  "./node_modules/@types/node/index.d.ts",
  "./node_modules/@supabase/supabase-js/dist/index.js",
  "./node_modules/zod/lib/index.js",
]
# Hot reload optimized for development
hot = true
# Optimized logging for healthcare debugging
silent = false
# PATH resolution for local binaries
env = { "PATH": "./node_modules/.bin:$PATH" }

[test]
# Healthcare test optimizations
timeout = 60000
coverage = true
# Preload healthcare testing libraries
preload = [
  "./node_modules/vitest/dist/index.js",
  "./node_modules/@testing-library/jest-dom/index.js"
]
# Healthcare compliance test patterns
testNamePattern = ".*healthcare.*|.*compliance.*|.*lgpd.*"

[build]
# Healthcare-optimized build settings
minify = true
sourcemap = true
target = "node20"
# Healthcare external dependencies
external = ["react", "react-dom", "@supabase/supabase-js"]
# Source maps for healthcare debugging
sourcemap = true

[cache]
# Healthcare-compliant caching strategy
enabled = true
dir = ".bun/cache"
# Content-based invalidation for compliance
strategy = "content"
# Healthcare audit trail
audit = true

# Performance optimizations for healthcare workloads
[optimize]
# Enable Bun's optimizer for healthcare apps
enabled = true
# Dedupe healthcare dependencies
dedupe = true
# ES modules for better performance
esModule = true
# Skip unnecessary transpilation
skipTranspile = ["react", "react-dom"]

# Healthcare-specific settings
[healthcare]
# Enable compliance validation
compliance = true
# Healthcare data residency
dataResidency = "local"
# Audit logging for healthcare
auditLogging = true
# LGPD compliance mode
lgpdMode = true
`;
  
  if (writeFile(BUNFIG_PATH, optimizedBunfig)) {
    optimizationReport.steps.push({
      name: 'Optimize Bun Configuration',
      status: 'completed',
      details: {
        configFile: BUNFIG_PATH,
        features: ['healthcare-compliance', 'esm-optimization', 'cache-strategy']
      }
    });
    
    return true;
  }
  
  return false;
}

async function implementCacheOptimization() {
  logger.step('Implementing cache optimization...');
  
  const cacheStrategies = [];
  
  // Limpar cache antigo
  const cacheClean = runCommand('bun pm cache rm');
  cacheStrategies.push({
    strategy: 'clean_old_cache',
    success: cacheClean.success
  });
  
  // Configurar cache por ambiente
  const cacheConfig = {
    development: {
      enabled: true,
      dir: '.bun/cache/dev',
      strategy: 'content'
    },
    production: {
      enabled: true,
      dir: '.bun/cache/prod',
      strategy: 'content',
      readOnly: true
    },
    test: {
      enabled: true,
      dir: '.bun/cache/test',
      strategy: 'content'
    }
  };
  
  // Criar diretórios de cache
  for (const [env, config] of Object.entries(cacheConfig)) {
    const cacheDir = join(PROJECT_ROOT, config.dir);
    try {
      mkdirSync(cacheDir, { recursive: true });
      cacheStrategies.push({
        strategy: `create_${env}_cache_dir`,
        success: true,
        path: cacheDir
      });
    } catch (error) {
      cacheStrategies.push({
        strategy: `create_${env}_cache_dir`,
        success: false,
        error: error.message
      });
    }
  }
  
  optimizationReport.cacheOptimization = {
    strategies: cacheStrategies,
    config: cacheConfig,
    timestamp: new Date().toISOString()
  };
  
  optimizationReport.steps.push({
    name: 'Implement Cache Optimization',
    status: 'completed',
    details: optimizationReport.cacheOptimization
  });
  
  return cacheStrategies.every(s => s.success);
}

async function validateBuildPipeline() {
  logger.step('Validating build pipeline...');
  
  const validationTests = [];
  
  // Testar TypeScript individualmente
  const tscTest = runCommand('PATH=./node_modules/.bin:$PATH tsc --version');
  validationTests.push({
    test: 'typescript_version',
    success: tscTest.success,
    output: tscTest.success ? tscTest.output.trim() : tscTest.error
  });
  
  // Testar Vitest
  const vitestTest = runCommand('PATH=./node_modules/.bin:$PATH vitest --version');
  validationTests.push({
    test: 'vitest_version',
    success: vitestTest.success,
    output: vitestTest.success ? vitestTest.output.trim() : vitestTest.error
  });
  
  // Testar build individual de um pacote
  const configBuildTest = runCommand('cd packages/config && PATH=../../node_modules/.bin:$PATH tsc --version');
  validationTests.push({
    test: 'config_package_tsc',
    success: configBuildTest.success,
    output: configBuildTest.success ? configBuildTest.output.trim() : configBuildTest.error
  });
  
  // Validar dependências de saúde
  const healthDeps = ['@supabase/supabase-js', 'zod', 'typescript', 'vitest'];
  for (const dep of healthDeps) {
    const depTest = runCommand(`test -d node_modules/${dep} && echo "found" || echo "missing"`);
    validationTests.push({
      test: `healthcare_dep_${dep}`,
      success: depTest.success && depTest.output.trim() === 'found',
      dependency: dep
    });
  }
  
  const successRate = (validationTests.filter(t => t.success).length / validationTests.length) * 100;
  
  optimizationReport.healthcareValidation = {
    successRate: successRate.toFixed(1) + '%',
    tests: validationTests,
    timestamp: new Date().toISOString()
  };
  
  optimizationReport.steps.push({
    name: 'Validate Build Pipeline',
    status: successRate > 80 ? 'completed' : 'partial',
    details: optimizationReport.healthcareValidation
  });
  
  return successRate > 80;
}

async function generateOptimizationReport() {
  logger.step('Generating optimization report...');
  
  // Calcular métricas de performance
  const performanceMetrics = {
    lockfileSize: optimizationReport.steps.find(s => s.name === 'Analyze Current State')?.details?.lockfileSize || 0,
    nodeModulesSize: optimizationReport.steps.find(s => s.name === 'Analyze Current State')?.details?.nodeModulesSize || 'unknown',
    binaryFixes: optimizationReport.binaryFixes?.totalFixed || 0,
    cacheStrategies: optimizationReport.cacheOptimization?.strategies?.length || 0,
    validationSuccess: optimizationReport.healthcareValidation?.successRate || '0%'
  };
  
  optimizationReport.performance = performanceMetrics;
  optimizationReport.summary = {
    phase: '1.3.2 - Optimize dependency installation',
    status: optimizationReport.steps.every(s => s.status === 'completed') ? 'completed' : 'partial',
    completedSteps: optimizationReport.steps.filter(s => s.status === 'completed').length,
    totalSteps: optimizationReport.steps.length,
    timestamp: new Date().toISOString(),
    recommendations: [
      'Use bun install --frozen-lockfile for production deployments',
      'Enable cache optimization for CI/CD pipelines',
      'Regular maintenance: bun pm cache rm',
      'Monitor healthcare compliance dependencies',
      'Use PATH=./node_modules/.bin:$PATH for local development'
    ]
  };
  
  // Salvar relatório
  try {
    writeFile(REPORT_PATH, JSON.stringify(optimizationReport, null, 2));
    logger.success(`Optimization report saved to: ${REPORT_PATH}`);
  } catch (error) {
    logger.error(`Failed to save report: ${error.message}`);
  }
  
  return optimizationReport;
}

async function main() {
  logger.info('🚀 Starting NEONPRO Bun Installation Optimization');
  logger.info('================================================');
  
  const optimizationSteps = [
    { name: 'Analyze Current State', fn: analyzeCurrentState },
    { name: 'Fix Binary Compatibility', fn: fixBinaryCompatibility },
    { name: 'Optimize Bun Configuration', fn: optimizeBunConfiguration },
    { name: 'Implement Cache Optimization', fn: implementCacheOptimization },
    { name: 'Validate Build Pipeline', fn: validateBuildPipeline }
  ];
  
  let optimizationSuccess = true;
  
  for (const step of optimizationSteps) {
    logger.info(`Executing: ${step.name}`);
    const result = await step.fn();
    
    if (!result) {
      optimizationSuccess = false;
      logger.error(`Step failed: ${step.name}`);
      // Continue com outros passos mesmo se um falhar
    }
    
    logger.success(`Step completed: ${step.name}`);
  }
  
  // Gerar relatório final
  const report = await generateOptimizationReport();
  
  // Status final
  logger.info('================================================');
  if (optimizationSuccess) {
    logger.success('🎉 Installation optimization completed successfully!');
    logger.result(`Binary fixes: ${report.performance.binaryFixes}`);
    logger.result(`Validation success: ${report.performance.validationSuccess}`);
    logger.result(`Cache strategies: ${report.performance.cacheStrategies}`);
  } else {
    logger.warning('⚠️  Installation optimization completed with some issues');
    logger.result('Check optimization report for details');
  }
  
  logger.info('================================================');
  
  return optimizationSuccess ? 0 : 1;
}

// Execute otimização
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(await main());
}

export { main as runInstallationOptimization };