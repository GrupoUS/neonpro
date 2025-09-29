#!/usr/bin/env node

/**
 * Quick Performance Benchmark - Baseline Measurement
 * Focus on essential build metrics before Bun migration
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
      execSync(command, { stdio: 'pipe', timeout: 180000 });
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

console.log('🚀 Quick Performance Benchmark');
console.log('================================');

// Measure essential build operations
results.measurements.build = measureCommand('pnpm build', 'Full build (pnpm)');
results.measurements.typeCheck = measureCommand('pnpm type-check', 'Type checking');

// Save results
const resultsDir = join(process.cwd(), 'benchmark-results');
if (!existsSync(resultsDir)) mkdirSync(resultsDir, { recursive: true });

const resultsFile = join(resultsDir, `quick-baseline-${Date.now()}.json`);
writeFileSync(resultsFile, JSON.stringify(results, null, 2));

console.log('\n📊 Quick Results Summary');
console.log('======================');
if (results.measurements.build.average) {
  console.log(`🏗️  Build: ${results.measurements.build.average.toFixed(0)}ms (range: ${results.measurements.build.min.toFixed(0)}-${results.measurements.build.max.toFixed(0)}ms)`);
}
if (results.measurements.typeCheck.average) {
  console.log(`🔍 Type Check: ${results.measurements.typeCheck.average.toFixed(0)}ms`);
}
console.log(`💻 System: ${results.system.cpus} CPUs, ${results.system.totalMemory} RAM`);
console.log(`📄 Results saved to: ${resultsFile}`);