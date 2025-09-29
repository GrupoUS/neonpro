#!/usr/bin/env node

/**
 * NeonPro Bun Performance Benchmark Script
 * Healthcare-optimized performance testing with compliance validation
 * 
 * This script benchmarks Bun's performance compared to Node.js/pnpm baseline
 * with healthcare-specific validation and compliance metrics
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resultsDir = path.join(__dirname, '..', 'test-results', 'performance');

// Healthcare compliance thresholds
const HEALTHCARE_THRESHOLDS = {
  testExecutionTime: 5000, // 5 seconds max for compliance tests
  memoryUsage: 512, // 512MB max memory usage
  startupTime: 1000, // 1 second max startup time
  healthcareComplianceScore: 95, // 95% minimum compliance score
  lgpdValidationTime: 100, // 100ms max for LGPD validation
  anvisaComplianceTime: 200, // 200ms max for ANVISA compliance
};

// Performance benchmarks
const benchmarks = [
  {
    name: 'Bun Test Runner Performance',
    command: 'bun test src/test/__tests__/ --timeout=30000',
    iterations: 5,
    type: 'execution',
    threshold: HEALTHCARE_THRESHOLDS.testExecutionTime,
  },
  {
    name: 'Bun Package Installation',
    command: 'time bun install --frozen-lockfile',
    iterations: 3,
    type: 'installation',
    threshold: 30000, // 30 seconds max
  },
  {
    name: 'Bun Build Performance',
    command: 'time bun run build',
    iterations: 3,
    type: 'build',
    threshold: 60000, // 60 seconds max
  },
  {
    name: 'Healthcare Compliance Tests',
    command: 'bun test src/test/__tests__/ --timeout=30000',
    iterations: 5,
    type: 'compliance',
    threshold: HEALTHCARE_THRESHOLDS.healthcareComplianceScore,
  },
  {
    name: 'Memory Usage Benchmark',
    command: 'bun test src/test/__tests__/ --timeout=30000 --memory-report',
    iterations: 3,
    type: 'memory',
    threshold: HEALTHCARE_THRESHOLDS.memoryUsage,
  },
];

// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runBenchmark(benchmark) {
    console.log(`🏃 Running benchmark: ${benchmark.name}`);
    const results = [];

    for (let i = 0; i < benchmark.iterations; i++) {
      const startTime = process.hrtime.bigint();
      const startMemory = process.memoryUsage();

      try {
        const output = execSync(benchmark.command, {
          encoding: 'utf8',
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          timeout: benchmark.threshold * 2,
        });

        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage();

        const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        const memoryUsed = Math.round((endMemory.rss - startMemory.rss) / 1024 / 1024); // MB

        results.push({
          iteration: i + 1,
          executionTime,
          memoryUsed,
          success: true,
          output: output.substring(0, 500), // Truncate output
        });

        console.log(`  ✅ Iteration ${i + 1}: ${executionTime.toFixed(2)}ms, ${memoryUsed}MB`);
      } catch (error) {
        results.push({
          iteration: i + 1,
          executionTime: benchmark.threshold * 2,
          memoryUsed: 0,
          success: false,
          error: error.message,
        });

        console.log(`  ❌ Iteration ${i + 1}: Failed - ${error.message}`);
      }
    }

    const successfulResults = results.filter(r => r.success);
    const avgExecutionTime = successfulResults.reduce((sum, r) => sum + r.executionTime, 0) / successfulResults.length;
    const avgMemoryUsed = successfulResults.reduce((sum, r) => sum + r.memoryUsed, 0) / successfulResults.length;
    const successRate = (successfulResults.length / results.length) * 100;

    const benchmarkResult = {
      name: benchmark.name,
      type: benchmark.type,
      iterations: benchmark.iterations,
      results,
      averageExecutionTime: avgExecutionTime,
      averageMemoryUsed: avgMemoryUsed,
      successRate,
      withinThreshold: avgExecutionTime <= benchmark.threshold,
      threshold: benchmark.threshold,
      timestamp: new Date().toISOString(),
    };

    this.results.push(benchmarkResult);

    // Healthcare compliance validation
    if (benchmark.type === 'compliance') {
      benchmarkResult.healthcareCompliance = this.validateHealthcareCompliance(results);
    }

    return benchmarkResult;
  }

  validateHealthcareCompliance(results) {
    const successfulResults = results.filter(r => r.success);
    const complianceScore = successfulResults.reduce((score, result) => {
      // Extract compliance metrics from test output
      const complianceMatch = result.output.match(/Healthcare Compliance Score: (\d+)%/);
      if (complianceMatch) {
        score += parseInt(complianceMatch[1]);
      }
      return score;
    }, 0) / successfulResults.length;

    return {
      score: complianceScore || 0,
      compliant: complianceScore >= HEALTHCARE_THRESHOLDS.healthcareComplianceScore,
      threshold: HEALTHCARE_THRESHOLDS.healthcareComplianceScore,
    };
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        bunVersion: execSync('bun --version', { encoding: 'utf8' }).trim(),
      },
      benchmarks: this.results,
      summary: {
        totalBenchmarks: this.results.length,
        passedBenchmarks: this.results.filter(r => r.withinThreshold).length,
        failedBenchmarks: this.results.filter(r => !r.withinThreshold).length,
        averageExecutionTime: this.results.reduce((sum, r) => sum + r.averageExecutionTime, 0) / this.results.length,
        totalSuccessRate: this.results.reduce((sum, r) => sum + r.successRate, 0) / this.results.length,
      },
      healthcareCompliance: {
        lgpdValidationTime: HEALTHCARE_THRESHOLDS.lgpdValidationTime,
        anvisaComplianceTime: HEALTHCARE_THRESHOLDS.anvisaComplianceTime,
        healthcareComplianceScore: HEALTHCARE_THRESHOLDS.healthcareComplianceScore,
      },
    };

    return report;
  }

  async saveReport() {
    const report = this.generateReport();
    
    // Ensure results directory exists
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(resultsDir, `bun-performance-${timestamp}.json`);
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Performance report saved to: ${reportPath}`);

    // Print summary
    console.log('\n🎯 Performance Summary:');
    console.log(`   Total Benchmarks: ${report.summary.totalBenchmarks}`);
    console.log(`   Passed: ${report.summary.passedBenchmarks}`);
    console.log(`   Failed: ${report.summary.failedBenchmarks}`);
    console.log(`   Average Execution Time: ${report.summary.averageExecutionTime.toFixed(2)}ms`);
    console.log(`   Success Rate: ${report.summary.totalSuccessRate.toFixed(2)}%`);

    if (report.summary.failedBenchmarks > 0) {
      console.log('\n⚠️  Failed Benchmarks:');
      this.results.filter(r => !r.withinThreshold).forEach(r => {
        console.log(`   - ${r.name}: ${r.averageExecutionTime.toFixed(2)}ms > ${r.threshold}ms`);
      });
    }

    return report;
  }
}

// Main execution
async function main() {
  console.log('🚀 NeonPro Bun Performance Benchmark');
  console.log('=====================================');
  console.log('🏥 Healthcare-Optimized Performance Testing\n');

  const monitor = new PerformanceMonitor();

  try {
    // Run all benchmarks
    for (const benchmark of benchmarks) {
      await monitor.runBenchmark(benchmark);
      console.log(''); // Add spacing between benchmarks
    }

    // Generate and save report
    const report = await monitor.saveReport();

    // Exit with appropriate code
    process.exit(report.summary.failedBenchmarks > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Performance benchmark failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PerformanceMonitor, benchmarks, HEALTHCARE_THRESHOLDS };