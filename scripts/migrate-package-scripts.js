#!/usr/bin/env node

/**
 * Script to migrate all package.json files in packages directory to Bun
 * Optimizes individual package scripts for Bun runtime
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const packages = [
  'packages/database',
  'packages/core', 
  'packages/ui',
  'packages/config',
  'packages/types'
];

console.log('🔄 Migrating package scripts to Bun...');
console.log('=====================================');

const migrationResults = {
  successful: [],
  failed: [],
  summary: {}
};

packages.forEach(packagePath => {
  console.log(`\n📦 Processing ${packagePath}...`);
  
  const packageJsonPath = join(packagePath, 'package.json');
  const backupPath = join(packagePath, 'package.json.backup');
  
  try {
    if (!existsSync(packageJsonPath)) {
      console.log(`  ⚠️  package.json not found in ${packagePath}`);
      migrationResults.failed.push({ package: packagePath, reason: 'package.json not found' });
      return;
    }
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const originalScripts = { ...packageJson.scripts };
    
    // Create backup
    writeFileSync(backupPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`  💾 Backup saved to ${backupPath}`);
    
    // Apply package-specific optimizations
    const optimizedScripts = optimizeScriptsForPackage(packagePath, packageJson.scripts || {});
    
    // Update package.json
    packageJson.scripts = optimizedScripts;
    
    // Add Bun-specific metadata
    packageJson.engines = packageJson.engines || {};
    packageJson.engines.bun = '>=1.0.0';
    
    // Save updated package.json
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    migrationResults.successful.push({
      package: packagePath,
      originalScripts: Object.keys(originalScripts).length,
      optimizedScripts: Object.keys(optimizedScripts).length
    });
    
    migrationResults.summary[packagePath] = {
      original: originalScripts,
      optimized: optimizedScripts,
      stats: {
        originalCount: Object.keys(originalScripts).length,
        optimizedCount: Object.keys(optimizedScripts).length,
        newCount: Object.keys(optimizedScripts).filter(name => !originalScripts[name]).length
      }
    };
    
    console.log(`  ✅ Migrated ${Object.keys(originalScripts).length} scripts`);
    console.log(`  🆕 Added ${Object.keys(optimizedScripts).filter(name => !originalScripts[name]).length} Bun-optimized scripts`);
    
  } catch (error) {
    console.log(`  ❌ Failed to migrate ${packagePath}: ${error.message}`);
    migrationResults.failed.push({ package: packagePath, reason: error.message });
  }
});

// Print summary
console.log('\n📊 Migration Summary');
console.log('==================');
console.log(`✅ Successfully migrated: ${migrationResults.successful.length} packages`);
console.log(`❌ Failed migrations: ${migrationResults.failed.length} packages`);

if (migrationResults.failed.length > 0) {
  console.log('\n❌ Failed Packages:');
  migrationResults.failed.forEach(({ package: pkg, reason }) => {
    console.log(`   • ${pkg}: ${reason}`);
  });
}

console.log('\n📈 Detailed Results:');
Object.entries(migrationResults.summary).forEach(([packagePath, details]) => {
  console.log(`\n🔧 ${packagePath}:`);
  console.log(`   • Original scripts: ${details.stats.originalCount}`);
  console.log(`   • Optimized scripts: ${details.stats.optimizedCount}`);
  console.log(`   • New Bun scripts: ${details.stats.newCount}`);
  
  if (details.stats.newCount > 0) {
    console.log(`   • New scripts:`);
    Object.entries(details.optimized)
      .filter(([name]) => !details.original[name])
      .forEach(([name, command]) => {
        console.log(`     - ${name}: ${command}`);
      });
  }
});

console.log('\n🚀 Next Steps:');
console.log('   1. Test individual packages: bun run --filter <package>');
console.log('   2. Test builds: bun run build');
console.log('   3. Compare performance with baseline');
console.log('   4. Verify all scripts work with Bun');

function optimizeScriptsForPackage(packagePath, originalScripts) {
  const optimized = { ...originalScripts };
  
  // Common optimizations for all packages
  const commonOptimizations = {
    // Bun-specific scripts
    'dev:bun': 'vite dev --force',
    'build:bun': 'vite build --mode production',
    'build:analyze': 'vite build --mode analyze',
    'test:bun': 'vitest run --reporter=dot',
    'test:watch:bun': 'vitest watch --reporter=dot',
    'type-check:bun': 'tsc --noEmit',
    'clean:bun': 'rm -rf dist node_modules/.cache',
    'format:bun': 'biome format . --write',
    'lint:bun': 'oxlint . --fix',
    'perf:test': 'vitest run --reporter=verbose --isolate',
    'setup:test': 'bun install && bun run build'
  };
  
  // Package-specific optimizations
  switch (packagePath) {
    case 'packages/database':
      Object.assign(optimized, {
        ...commonOptimizations,
        'build:bun': 'prisma generate && tsc --noEmit',
        'build:edge': 'prisma generate && tsc --noEmit --outDir dist-edge',
        'test:integration:bun': 'vitest run --config vitest.integration.config.ts',
        'migrate:dev': 'prisma migrate dev',
        'migrate:deploy': 'prisma migrate deploy',
        'generate:client': 'prisma generate',
        'db:seed': 'bun run src/seed.ts',
        'db:studio': 'prisma studio',
        'db:push': 'prisma db push',
        'validate:schema': 'prisma validate',
        'format:prisma': 'prisma format',
        'perf:query': 'bun run src/benchmark-queries.ts'
      });
      break;
      
    case 'packages/ui':
      Object.assign(optimized, {
        ...commonOptimizations,
        'build:bun': 'vite build --mode production && tsc --emitDeclarationOnly',
        'build:lib': 'tsup',
        'build:types': 'tsc --emitDeclarationOnly',
        'dev:storybook': 'vite dev --config .storybook/vite.config.ts',
        'build:storybook': 'vite build --config .storybook/vite.config.ts',
        'test:visual': 'playwright test tests/visual/',
        'test:accessibility': 'axe tests/accessibility/',
        'export:components': 'bun run src/export-components.ts',
        'analyze:bundle': 'bun run build && webpack-bundle-analyzer stats.json',
        'optimize:images': 'bun run src/optimize-images.ts'
      });
      break;
      
    case 'packages/core':
      Object.assign(optimized, {
        ...commonOptimizations,
        'build:bun': 'tsc --build && vite build',
        'test:unit:bun': 'vitest run --reporter=verbose',
        'test:integration:bun': 'vitest run --config vitest.integration.config.ts',
        'test:e2e:bun': 'playwright test --reporter=list',
        'bench:performance': 'bun run src/benchmarks/',
        'validate:types': 'tsc --noEmit --strict',
        'generate:schemas': 'bun run src/generate-schemas.ts',
        'docs:generate': 'typedoc src/index.ts'
      });
      break;
      
    case 'packages/config':
      Object.assign(optimized, {
        ...commonOptimizations,
        'build:bun': 'tsc --build',
        'test:config:bun': 'vitest run --config vitest.config.ts',
        'validate:configs': 'bun run src/validate-configs.ts',
        'sync:configs': 'bun run src/sync-configs.ts',
        'format:configs': 'biome format --write configs/'
      });
      break;
      
    case 'packages/types':
      Object.assign(optimized, {
        ...commonOptimizations,
        'build:bun': 'tsc --build --declaration',
        'build:watch': 'tsc --build --declaration --watch',
        'validate:types': 'tsc --noEmit --strict',
        'generate:docs': 'typedoc src/index.ts',
        'test:types': 'vitest run --reporter=verbose',
        'format:types': 'biome format --write src/',
        'check:duplicates': 'bun run src/check-duplicate-types.ts'
      });
      break;
  }
  
  return optimized;
}