#!/usr/bin/env node

/**
 * Script to migrate root package.json scripts from pnpm to Bun
 * Analyzes current scripts and creates Bun-optimized versions
 */

import { readFileSync, writeFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

console.log('🔄 Analyzing current scripts for Bun migration...');

// Current scripts analysis
const currentScripts = packageJson.scripts;
const bunOptimizedScripts = {};

// Script-specific optimizations
const scriptOptimizations = {
  // Core scripts - keep as-is since they use turbo which works well with Bun
  'build': 'turbo build',
  'dev': 'turbo dev --concurrency=15',
  'dev:web': 'turbo dev --filter=@neonpro/web', 
  'dev:api': 'turbo dev --filter=@neonpro/api',
  'type-check': 'turbo type-check',
  'clean': 'turbo clean',
  
  // Test scripts - vitest is already optimized for Bun
  'test': 'vitest',
  'test:watch': 'vitest --watch',
  'test:coverage': 'vitest --coverage',
  'test:e2e': 'playwright test',
  'test:e2e:ui': 'playwright test --ui',
  'test:e2e:headed': 'playwright test --headed',
  
  // Linting - tools work with Bun
  'lint': 'oxlint . --import-plugin --react-plugin --jsx-a11y-plugin',
  'lint:fix': 'oxlint . --import-plugin --react-plugin --jsx-a11y-plugin --fix',
  'lint:security': 'eslint . --max-warnings 0',
  'lint:biome': 'biome lint .',
  'lint:biome:fix': 'biome lint --fix .',
  
  // Formatting - biome works with Bun
  'format': 'biome format .',
  'format:fix': 'biome format --write .',
  'format:check': 'biome format .',
  'biome:check': 'biome check .',
  'biome:fix': 'biome check --fix .',
  
  // Quality scripts - already use bun run
  'quality': 'bun run lint && bun run lint:security && bun run type-check',
  'quality:fix': 'bun run lint:fix && bun run lint:security',
  'quality:complete': 'bun run lint && bun run lint:security && bun run type-check && bun run biome:check && bun run test:accessibility',
  
  // Prepare - husky works with Bun
  'prepare': 'husky',
  
  // Compliance tests - vitest with Bun
  'test:healthcare-compliance': 'vitest run --config vitest.config.ts --reporter=verbose packages/healthcare-core/src/__tests__/',
  'test:security-compliance': 'vitest run --config vitest.config.ts --reporter=verbose packages/security/src/__tests__/',
  'test:regulatory-compliance': 'vitest run --config vitest.config.ts --reporter=verbose apps/api/src/__tests__/services/',
  'test:compliance-report': 'vitest run --config vitest.config.ts --reporter=verbose --coverage.dir=coverage-compliance',
  'test:audit-compliance': 'vitest run --config vitest.config.ts --reporter=verbose',
  'test:all-compliance': 'bun run test:healthcare-compliance && bun run test:security-compliance && bun run test:regulatory-compliance',
  'test:accessibility': 'bash scripts/accessibility-check.sh',
  
  // Bun-specific optimizations (new scripts)
  'dev:bun': 'turbo dev --concurrency=20', // Higher concurrency for Bun
  'build:bun': 'turbo build --force', // Force rebuild with Bun
  'test:bun': 'vitest run --reporter=dot', // Optimized test output
  'test:perf': 'vitest run --reporter=verbose --isolate', // Performance testing
  'install:fresh': 'rm -rf node_modules && bun install', // Fresh install with Bun
  'install:clean': 'bun install --frozen-lockfile', // Clean install with Bun
  'type-check:bun': 'turbo type-check --force', // Force type check
  'format:bun': 'biome format . --write', // Format with Bun
  'lint:bun': 'oxlint . --import-plugin --react-plugin --jsx-a11y-plugin --fix', // Lint and fix with Bun
  'analyze': 'bun run build && bun run analyze:bundle', // Build analysis
  'analyze:bundle': 'node scripts/analyze-bundle.js', // Bundle analysis
  'perf:compare': 'node scripts/compare-performance.js', // Performance comparison
  'migrate:scripts': 'node scripts/migrate-root-scripts.js', // This script
  'migrate:deps': 'node scripts/migrate-dependencies.js', // Dependency migration
  'setup:dev': 'bun install && bun run build', // Development setup
  'deploy:prepare': 'bun run build && bun run test:run && bun run lint', // Deployment preparation
  'health:check': 'bun run type-check && bun run test:run && bun run lint', // Health check
  
  // Development hot-reload (Bun optimized)
  'dev:hot': 'turbo dev --concurrency=15 --force',
  'dev:inspect': 'turbo dev --concurrency=10', // Lower concurrency for debugging
  
  // Performance monitoring
  'perf:baseline': 'node scripts/simple-benchmark.js',
  'perf:measure': 'node scripts/benchmark-performance.js'
};

console.log('📋 Applying script optimizations for Bun...');

// Apply optimizations
Object.keys(scriptOptimizations).forEach(scriptName => {
  bunOptimizedScripts[scriptName] = scriptOptimizations[scriptName];
});

console.log('🔧 Updating package.json scripts...');

// Create backup
const backupPackageJson = { ...packageJson };
delete backupPackageJson.scripts;
backupPackageJson.scripts = { ...currentScripts };
backupPackageJson.scriptsBackup = currentScripts;

// Update scripts
packageJson.scripts = bunOptimizedScripts;

// Add Bun-specific metadata
packageJson.engines = packageJson.engines || {};
packageJson.engines.bun = '>=1.0.0';

// Add packageManager field for Bun
packageJson.packageManager = 'bun@1.2.23';

console.log('💾 Saving updated package.json...');

// Save the updated package.json
writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');

// Save backup
writeFileSync('./package.json.backup', JSON.stringify(backupPackageJson, null, 2) + '\n');

console.log('✅ Root package.json scripts migrated to Bun!');
console.log('');
console.log('📊 Migration Summary:');
console.log('====================');
console.log(`🔄 Scripts migrated: ${Object.keys(bunOptimizedScripts).length}`);
console.log('🆕 New Bun-optimized scripts added:');
Object.keys(scriptOptimizations).filter(name => !currentScripts[name]).forEach(script => {
  console.log(`   • ${script}: ${scriptOptimizations[script]}`);
});
console.log('📋 Backup saved to: package.json.backup');
console.log('');
console.log('🚀 Next steps:');
console.log('   1. Run: bun install to test package manager');
console.log('   2. Test: bun run build to verify builds work');
console.log('   3. Test: bun run dev to verify development works');
console.log('   4. Compare performance with baseline metrics');