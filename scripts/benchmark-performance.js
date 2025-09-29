#!/usr/bin/env node

/**
 * NeonPro Performance Benchmarking Script
 * Measures current pnpm performance before Bun migration
 * 
 * Metrics collected:
 * - Cold build times
 * - Warm build times (with cache)
 * - Memory usage
 * - Disk usage
 * - Network requests (if applicable)
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

class PerformanceBenchmark {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      system: this.getSystemInfo(),
      benchmarks: {}
    };
    this.resultsDir = join(process.cwd(), 'benchmark-results');
  }

  getSystemInfo() {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      cpus: require('os').cpus().length,
      totalMemory: Math.round(require('os').totalmem() / 1024 / 1024 / 1024) + 'GB',
      freeMemory: Math.round(require('os').freemem() / 1024 / 1024 / 1024) + 'GB'
    };
  }

  async measureCommand(command, label, warmup = true) {
    console.log(`🔬 Measuring: ${label}`);
    
    if (warmup) {
      try {
        console.log(`  🔄 Warmup: ${command}`);
        execSync(command, { stdio: 'pipe', timeout: 300000 });
      } catch (error) {
        console.log(`  ⚠️  Warmup failed: ${error.message}`);
      }
    }

    const iterations = 3;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      try {
        console.log(`  📊 Run ${i + 1}/${iterations}`);
        const start = process.hrtime.bigint();
        
        execSync(command, { 
          stdio: 'pipe', 
          timeout: 300000,
          env: { ...process.env, NODE_ENV: 'production' }
        });
        
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1000000;
        times.push(durationMs);
        
        console.log(`  ✅ ${durationMs.toFixed(0)}ms`);
      } catch (error) {
        console.log(`  ❌ Run ${i + 1} failed: ${error.message}`);
        times.push(null);
      }
    }

    const validTimes = times.filter(t => t !== null);
    if (validTimes.length === 0) {
      return {
        success: false,
        error: 'All runs failed',
        times: times
      };
    }

    return {
      success: true,
      average: validTimes.reduce((a, b) => a + b, 0) / validTimes.length,
      min: Math.min(...validTimes),
      max: Math.max(...validTimes),
      times: times,
      iterations: iterations,
        successfulRuns: validTimes.length
      };
    }

  async measureMemoryUsage(command, label) {
    console.log(`🧠 Measuring memory: ${label}`);
    
    try {
      const startMemory = process.memoryUsage();
      execSync(command, { stdio: 'pipe', timeout: 300000 });
      const endMemory = process.memoryUsage();
      
      return {
        success: true,
        rssUsed: Math.round((endMemory.rss - startMemory.rss) / 1024 / 1024),
        heapUsed: Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024),
        externalUsed: Math.round((endMemory.external - startMemory.external) / 1024 / 1024)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async measureDiskUsage() {
    console.log(`💾 Measuring disk usage...`);
    
    try {
      const nodeModulesSize = this.getDirectorySize('./node_modules');
      const buildSize = this.getDirectorySize('./dist');
      const cacheSize = this.getDirectorySize('./.turbo');
      
      return {
        nodeModules: nodeModulesSize,
        build: buildSize,
        cache: cacheSize
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getDirectorySize(dirPath) {
    try {
      if (!existsSync(dirPath)) return 0;
      
      const result = execSync(`du -sh ${dirPath} 2>/dev/null || echo "0"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return result.trim().split('\t')[0];
    } catch (error) {
      return 'unknown';
    }
  }

  async runFullBenchmark() {
    console.log('🚀 Starting NeonPro Performance Benchmark');
    console.log('=====================================');
    
    // Create results directory
    if (!existsSync(this.resultsDir)) {
      mkdirSync(this.resultsDir, { recursive: true });
    }

    // Measure build performance
    console.log('\n📦 Build Performance');
    this.results.benchmarks.build = await this.measureCommand(
      'pnpm build',
      'Full build (pnpm)'
    );

    // Measure dev server startup
    console.log('\n🔧 Development Server');
    this.results.benchmarks.dev = await this.measureCommand(
      'timeout 10s pnpm dev || true',
      'Dev server startup (10s timeout)',
      false
    );

    // Measure test performance
    console.log('\n🧪 Test Performance');
    this.results.benchmarks.test = await this.measureCommand(
      'pnpm test:run',
      'Test execution'
    );

    // Measure type checking
    console.log('\n🔍 Type Checking');
    this.results.benchmarks.typeCheck = await this.measureCommand(
      'pnpm type-check',
      'Type checking'
    );

    // Measure memory usage
    console.log('\n🧠 Memory Usage');
    this.results.benchmarks.memory = await this.measureMemoryUsage(
      'pnpm build',
      'Build memory usage'
    );

    // Measure disk usage
    console.log('\n💾 Disk Usage');
    this.results.benchmarks.disk = await this.measureDiskUsage();

    // Package manager performance
    console.log('\n📦 Package Manager Performance');
    this.results.benchmarks.packageManager = {};
    
    // Measure install (clean)
    if (existsSync('./node_modules')) {
      console.log('  🧹 Cleaning node_modules for fresh install measurement...');
      execSync('rm -rf node_modules', { stdio: 'pipe' });
    }
    
    this.results.benchmarks.packageManager.install = await this.measureCommand(
      'pnpm install',
      'Fresh install',
      false
    );

    // Save results
    const resultsFile = join(this.resultsDir, `baseline-${Date.now()}.json`);
    writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    
    // Print summary
    this.printSummary();
    
    console.log(`\n💾 Results saved to: ${resultsFile}`);
    return this.results;
  }

  printSummary() {
    console.log('\n📊 Performance Summary');
    console.log('=====================');
    
    console.log('\n🏗️  Build Performance:');
    if (this.results.benchmarks.build?.success) {
      console.log(`  ⏱️  Average: ${this.results.benchmarks.build.average.toFixed(0)}ms`);
      console.log(`  🚀 Fastest: ${this.results.benchmarks.build.min.toFixed(0)}ms`);
      console.log(`  🐢 Slowest: ${this.results.benchmarks.build.max.toFixed(0)}ms`);
    } else {
      console.log(`  ❌ Build failed: ${this.results.benchmarks.build?.error}`);
    }

    console.log('\n🧪 Test Performance:');
    if (this.results.benchmarks.test?.success) {
      console.log(`  ⏱️  Average: ${this.results.benchmarks.test.average.toFixed(0)}ms`);
    } else {
      console.log(`  ❌ Tests failed: ${this.results.benchmarks.test?.error}`);
    }

    console.log('\n💾 Disk Usage:');
    if (this.results.benchmarks.disk) {
      console.log(`  📦 node_modules: ${this.results.benchmarks.disk.nodeModules}`);
      console.log(`  🏗️  build: ${this.results.benchmarks.disk.build}`);
      console.log(`  ⚡ cache: ${this.results.benchmarks.disk.cache}`);
    }

    console.log('\n📦 Package Manager:');
    if (this.results.benchmarks.packageManager.install?.success) {
      console.log(`  ⏱️  Install time: ${this.results.benchmarks.packageManager.install.average.toFixed(0)}ms`);
    }

    console.log('\n🧠 Memory Usage:');
    if (this.results.benchmarks.memory?.success) {
      console.log(`  📊 RSS: +${this.results.benchmarks.memory.rssUsed}MB`);
      console.log(`  🗃️  Heap: +${this.results.benchmarks.memory.heapUsed}MB`);
      console.log(`  🔌 External: +${this.results.benchmarks.memory.externalUsed}MB`);
    }

    console.log('\n💻 System Info:');
    console.log(`  🖥️  Platform: ${this.results.system.platform} (${this.results.system.arch})`);
    console.log(`  🔧 Node.js: ${this.results.system.nodeVersion}`);
    console.log(`  🧠 CPUs: ${this.results.system.cpus}`);
    console.log(`  💾 Memory: ${this.results.system.totalMemory} total, ${this.results.system.freeMemory} free`);
  }
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new PerformanceBenchmark();
  benchmark.runFullBenchmark()
    .then(results => {
      console.log('\n✅ Benchmark completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Benchmark failed:', error);
      process.exit(1);
    });
}

export default PerformanceBenchmark;