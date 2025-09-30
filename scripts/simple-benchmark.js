#!/usr/bin/env bun

/**
 * Simple Performance Benchmark - Basic Measurement
 * Focus on individual package performance before Bun migration
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { cpus, totalmem } from 'os';

const results = {
  timestamp: new Date().toISOString(),
  system: {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    cpus: cpus().length,
    totalMemory: Math.round(totalmem() / 1024 / 1024 / 1024) + 'GB'
  },
  measurements: {}
};

function measureCommand(command, label, iterations = 2) {
  console.log(`🔬 ${label}`);
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    try {
      const start = process.hrtime.bigint();
      execSync(command, { stdio: 'pipe', timeout: 120000 });
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1000000;
      times.push(durationMs);
      console.log(`  ✅ ${durationMs.toFixed(0)}ms`);
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message.slice(0, 100)}`);
      times.push(null);
    }
  }
  
  const validTimes = times.filter(t => t !== null);
  return validTimes.length > 0 ? {
    average: validTimes.reduce((a, b) => a + b, 0) / validTimes.length,
    min: Math.min(...validTimes),
    max: Math.max(...validTimes),
    runs: validTimes.length
  } : { error: 'All runs failed' };
}

console.log('🚀 Simple Performance Benchmark');
console.log('==============================');

// Test individual package installations
try {
  console.log('\n📦 Testing package installations...');
  
  // Clean install test
  if (existsSync('./node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'pipe' });
  }
  
  results.measurements.install = measureCommand(
    'bun install', 
    'Fresh bun install',
    1
  );
} catch (error) {
  results.measurements.install = { error: error.message };
}

// Test individual package builds where possible
console.log('\n🏗️ Testing individual package builds...');

// Test database package (likely to work)
try {
  results.measurements.databaseBuild = measureCommand(
    'cd packages/database && bun run build', 
    'Database package build'
  );
} catch (error) {
  results.measurements.databaseBuild = { error: error.message };
}

// Test types package (likely to work)
try {
  results.measurements.typesBuild = measureCommand(
    'cd packages/types && bun run build', 
    'Types package build'
  );
} catch (error) {
  results.measurements.typesBuild = { error: error.message };
}

// Test API package type checking
try {
  results.measurements.apiTypeCheck = measureCommand(
    'cd apps/api && bun run type-check', 
    'API type checking'
  );
} catch (error) {
  results.measurements.apiTypeCheck = { error: error.message };
}

// Test web package type checking
try {
  results.measurements.webTypeCheck = measureCommand(
    'cd apps/web && bun run type-check', 
    'Web type checking'
  );
} catch (error) {
  results.measurements.webTypeCheck = { error: error.message };
}

// Measure disk usage
try {
  console.log('\n💾 Measuring disk usage...');
  const nodeModulesSize = execSync('du -sh node_modules 2>/dev/null || echo "0"', { encoding: 'utf8' }).trim().split('\t')[0];
  results.measurements.diskUsage = {
    nodeModules: nodeModulesSize !== '0' ? nodeModulesSize : 'not installed'
  };
} catch (error) {
  results.measurements.diskUsage = { error: error.message };
}

// Save results
const resultsDir = join(process.cwd(), 'benchmark-results');
if (!existsSync(resultsDir)) mkdirSync(resultsDir, { recursive: true });

const resultsFile = join(resultsDir, `simple-baseline-${Date.now()}.json`);
writeFileSync(resultsFile, JSON.stringify(results, null, 2));

// Print summary
console.log('\n📊 Baseline Results Summary');
console.log('==========================');

if (results.measurements.install?.average) {
  console.log(`📦 Install: ${results.measurements.install.average.toFixed(0)}ms`);
} else {
  console.log(`📦 Install: Failed - ${results.measurements.install?.error || 'Unknown error'}`);
}

if (results.measurements.databaseBuild?.average) {
  console.log(`🗄️  Database Build: ${results.measurements.databaseBuild.average.toFixed(0)}ms`);
}

if (results.measurements.typesBuild?.average) {
  console.log(`📝 Types Build: ${results.measurements.typesBuild.average.toFixed(0)}ms`);
}

if (results.measurements.apiTypeCheck?.average) {
  console.log(`🔧 API Type Check: ${results.measurements.apiTypeCheck.average.toFixed(0)}ms`);
}

if (results.measurements.webTypeCheck?.average) {
  console.log(`🌐 Web Type Check: ${results.measurements.webTypeCheck.average.toFixed(0)}ms`);
}

if (results.measurements.diskUsage?.nodeModules) {
  console.log(`💾 Disk Usage: ${results.measurements.diskUsage.nodeModules}`);
}

console.log(`💻 System: ${results.system.cpus} CPUs, ${results.system.totalMemory} RAM`);
console.log(`📄 Results saved to: ${resultsFile}`);

// Establish baseline metrics
const baseline = {
  installTime: results.measurements.install?.average || null,
  successfulPackages: [
    results.measurements.databaseBuild?.success,
    results.measurements.typesBuild?.success,
    results.measurements.apiTypeCheck?.success,
    results.measurements.webTypeCheck?.success
  ].filter(Boolean).length,
  totalPackages: 4,
  timestamp: results.timestamp
};

console.log('\n🎯 Baseline Established');
console.log('====================');
console.log(`✅ Successful operations: ${baseline.successfulPackages}/${baseline.totalPackages}`);
console.log(`📦 Install time: ${baseline.installTime ? baseline.installTime.toFixed(0) + 'ms' : 'Failed'}`);
console.log(`📅 Measured: ${new Date(baseline.timestamp).toLocaleString()}`);

// Create baseline file for comparison
const baselineFile = join(resultsDir, 'baseline-current.json');
writeFileSync(baselineFile, JSON.stringify(baseline, null, 2));
console.log(`📄 Baseline saved: ${baselineFile}`);