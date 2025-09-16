/**
 * Performance Testing Utilities
 * Healthcare-specific performance testing with compliance requirements
 */

import { expect } from 'vitest';
import { createLogger, LogLevel } from '@neonpro/tools-shared';

const performanceLogger = createLogger('PerformanceTesting', {
  level: LogLevel.DEBUG,
  format: 'pretty',
  enablePerformance: true,
});

// Healthcare Performance Thresholds (Brazilian regulations)
export const HEALTHCARE_PERFORMANCE_THRESHOLDS = {
  CRITICAL_OPERATIONS: 100, // ms - Patient data access, emergency features
  IMPORTANT_OPERATIONS: 200, // ms - Appointment scheduling, reports
  NORMAL_OPERATIONS: 500, // ms - Administrative features
  BATCH_OPERATIONS: 2000, // ms - Bulk data processing
  NETWORK_TIMEOUT: 30000, // ms - External API calls
} as const;

export const MEMORY_THRESHOLDS = {
  LOW_MEMORY: 50 * 1024 * 1024, // 50MB
  MEDIUM_MEMORY: 100 * 1024 * 1024, // 100MB
  HIGH_MEMORY: 200 * 1024 * 1024, // 200MB
  CRITICAL_MEMORY: 500 * 1024 * 1024, // 500MB
} as const;

// Advanced Performance Timer with Healthcare Compliance
export class HealthcarePerformanceTimer {
  private timers: Map<string, { start: number; threshold: number; category: string }> = new Map();
  private results: Map<string, { duration: number; passed: boolean; category: string }> = new Map();

  start(
    name: string,
    threshold: number = HEALTHCARE_PERFORMANCE_THRESHOLDS.NORMAL_OPERATIONS,
    category: 'critical' | 'important' | 'normal' | 'batch' = 'normal'
  ): void {
    this.timers.set(name, {
      start: performance.now(),
      threshold,
      category,
    });

    performanceLogger.startTimer(name);
  }

  end(name: string): { duration: number; passed: boolean; category: string } {
    const timer = this.timers.get(name);
    if (!timer) {
      throw new Error(`Timer '${name}' not found. Call start() first.`);
    }

    const end = performance.now();
    const duration = Math.round(end - timer.start);
    const passed = duration <= timer.threshold;

    const result = {
      duration,
      passed,
      category: timer.category,
    };

    this.results.set(name, result);
    this.timers.delete(name);

    const endDuration = performanceLogger.endTimer(name, {
      duration,
      threshold: timer.threshold,
      category: timer.category,
      passed,
    });

    if (passed) {
      performanceLogger.success(
        `⚡ Performance test passed: ${name} = ${duration}ms ≤ ${timer.threshold}ms (${timer.category})`
      );
    } else {
      performanceLogger.error(
        `❌ Performance test failed: ${name} = ${duration}ms > ${timer.threshold}ms (${timer.category})`
      );
    }

    return result;
  }

  getResult(name: string) {
    return this.results.get(name);
  }

  getAllResults() {
    return Array.from(this.results.entries()).map(([name, result]) => ({
      name,
      ...result,
    }));
  }

  reset(): void {
    this.timers.clear();
    this.results.clear();
  }

  // Healthcare-specific performance validation
  assertHealthcareCompliance(name: string): void {
    const result = this.getResult(name);
    if (!result) {
      throw new Error(`No performance result found for '${name}'`);
    }

    expect(result.passed).toBe(true);

    if (result.category === 'critical') {
      expect(result.duration).toBeLessThanOrEqual(HEALTHCARE_PERFORMANCE_THRESHOLDS.CRITICAL_OPERATIONS);
    }

    performanceLogger.constitutional(
      LogLevel.INFO,
      `Healthcare performance compliance validated: ${name}`,
      {
        compliance: result.passed,
        requirement: 'Healthcare Performance Standards',
        standard: 'LGPD',
      }
    );
  }
}

// Memory Usage Monitor
export class MemoryMonitor {
  private baseline: number = 0;
  private measurements: Array<{ timestamp: number; used: number; total: number; label?: string }> = [];

  start(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      this.baseline = process.memoryUsage().heapUsed;
      this.addMeasurement('baseline');
    }
  }

  addMeasurement(label?: string): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      this.measurements.push({
        timestamp: Date.now(),
        used: memory.heapUsed,
        total: memory.heapTotal,
        label,
      });
    }
  }

  getCurrentUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  getMemoryGrowth(): number {
    const current = this.getCurrentUsage();
    return current - this.baseline;
  }

  assertMemoryThreshold(threshold: number = MEMORY_THRESHOLDS.MEDIUM_MEMORY): void {
    const growth = this.getMemoryGrowth();
    expect(growth).toBeLessThanOrEqual(threshold);

    performanceLogger.info(
      `Memory growth: ${Math.round(growth / 1024 / 1024)}MB ≤ ${Math.round(threshold / 1024 / 1024)}MB`
    );
  }

  reset(): void {
    this.baseline = this.getCurrentUsage();
    this.measurements = [];
  }

  getReport() {
    return {
      baseline: this.baseline,
      current: this.getCurrentUsage(),
      growth: this.getMemoryGrowth(),
      measurements: this.measurements,
    };
  }
}

// Load Testing Utilities
export class LoadTestRunner {
  private concurrency: number;
  private iterations: number;

  constructor(concurrency: number = 10, iterations: number = 100) {
    this.concurrency = concurrency;
    this.iterations = iterations;
  }

  async runLoadTest<T>(
    testFunction: () => Promise<T>,
    options?: {
      warmupRounds?: number;
      timeout?: number;
      expectedThroughput?: number; // operations per second
    }
  ): Promise<{
    totalTime: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    throughput: number;
    successCount: number;
    errorCount: number;
    errors: Error[];
  }> {
    const { warmupRounds = 5, timeout = 30000, expectedThroughput } = options || {};

    // Warmup
    for (let i = 0; i < warmupRounds; i++) {
      try {
        await testFunction();
      } catch (error) {
        // Ignore warmup errors
      }
    }

    const results: number[] = [];
    const errors: Error[] = [];
    let successCount = 0;
    let errorCount = 0;

    const timer = new HealthcarePerformanceTimer();
    timer.start('load-test-total', timeout, 'batch');

    // Run concurrent batches
    const promises = [];
    for (let batch = 0; batch < this.concurrency; batch++) {
      promises.push(this.runBatch(testFunction, this.iterations / this.concurrency, results, errors));
    }

    await Promise.all(promises);

    const totalResult = timer.end('load-test-total');

    successCount = results.length;
    errorCount = errors.length;

    const averageTime = results.reduce((a, b) => a + b, 0) / results.length || 0;
    const minTime = Math.min(...results) || 0;
    const maxTime = Math.max(...results) || 0;
    const throughput = (successCount / totalResult.duration) * 1000; // ops/second

    const report = {
      totalTime: totalResult.duration,
      averageTime,
      minTime,
      maxTime,
      throughput,
      successCount,
      errorCount,
      errors,
    };

    performanceLogger.info(`Load test completed: ${successCount} success, ${errorCount} errors`);
    performanceLogger.info(`Throughput: ${throughput.toFixed(2)} ops/second`);

    if (expectedThroughput) {
      expect(throughput).toBeGreaterThanOrEqual(expectedThroughput);
    }

    return report;
  }

  private async runBatch<T>(
    testFunction: () => Promise<T>,
    iterations: number,
    results: number[],
    errors: Error[]
  ): Promise<void> {
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      try {
        await testFunction();
        const duration = performance.now() - start;
        results.push(duration);
      } catch (error) {
        errors.push(error as Error);
      }
    }
  }
}

// Healthcare-Specific Performance Tests
export class HealthcarePerformanceTests {
  static async testPatientDataAccess(
    accessFunction: () => Promise<any>,
    patientCount: number = 100
  ): Promise<void> {
    const timer = new HealthcarePerformanceTimer();

    timer.start('patient-data-access', HEALTHCARE_PERFORMANCE_THRESHOLDS.CRITICAL_OPERATIONS, 'critical');

    const results = [];
    for (let i = 0; i < patientCount; i++) {
      const result = await accessFunction();
      results.push(result);
    }

    timer.end('patient-data-access');
    timer.assertHealthcareCompliance('patient-data-access');

    expect(results).toHaveLength(patientCount);
  }

  static async testAppointmentScheduling(
    scheduleFunction: () => Promise<any>,
    appointmentCount: number = 50
  ): Promise<void> {
    const timer = new HealthcarePerformanceTimer();

    timer.start('appointment-scheduling', HEALTHCARE_PERFORMANCE_THRESHOLDS.IMPORTANT_OPERATIONS, 'important');

    const results = [];
    for (let i = 0; i < appointmentCount; i++) {
      const result = await scheduleFunction();
      results.push(result);
    }

    timer.end('appointment-scheduling');
    timer.assertHealthcareCompliance('appointment-scheduling');

    expect(results).toHaveLength(appointmentCount);
  }

  static async testBulkDataProcessing(
    processFunction: (data: any[]) => Promise<any>,
    dataSize: number = 1000
  ): Promise<void> {
    const timer = new HealthcarePerformanceTimer();
    const memory = new MemoryMonitor();

    memory.start();
    timer.start('bulk-data-processing', HEALTHCARE_PERFORMANCE_THRESHOLDS.BATCH_OPERATIONS, 'batch');

    const testData = Array.from({ length: dataSize }, (_, i) => ({
      id: `test-${i}`,
      data: Math.random(),
      timestamp: new Date().toISOString(),
    }));

    const result = await processFunction(testData);

    timer.end('bulk-data-processing');
    memory.addMeasurement('after-processing');

    timer.assertHealthcareCompliance('bulk-data-processing');
    memory.assertMemoryThreshold(MEMORY_THRESHOLDS.HIGH_MEMORY);

    expect(result).toBeDefined();
  }

  static async testDatabaseQuery(
    queryFunction: () => Promise<any>,
    expectedMaxTime: number = HEALTHCARE_PERFORMANCE_THRESHOLDS.CRITICAL_OPERATIONS
  ): Promise<void> {
    const timer = new HealthcarePerformanceTimer();

    timer.start('database-query', expectedMaxTime, 'critical');

    const result = await queryFunction();

    timer.end('database-query');
    timer.assertHealthcareCompliance('database-query');

    expect(result).toBeDefined();
  }

  static async testApiEndpoint(
    apiFunction: () => Promise<Response>,
    expectedMaxTime: number = HEALTHCARE_PERFORMANCE_THRESHOLDS.IMPORTANT_OPERATIONS
  ): Promise<void> {
    const timer = new HealthcarePerformanceTimer();

    timer.start('api-endpoint', expectedMaxTime, 'important');

    const response = await apiFunction();

    timer.end('api-endpoint');
    timer.assertHealthcareCompliance('api-endpoint');

    expect(response.ok).toBe(true);
  }
}

// Performance Benchmark Suite
export class PerformanceBenchmarkSuite {
  private benchmarks: Map<string, () => Promise<any>> = new Map();
  private results: Map<string, any> = new Map();

  addBenchmark(name: string, benchmarkFunction: () => Promise<any>): void {
    this.benchmarks.set(name, benchmarkFunction);
  }

  async runAllBenchmarks(): Promise<Map<string, any>> {
    performanceLogger.info(`Running ${this.benchmarks.size} performance benchmarks...`);

    for (const [name, benchmarkFunction] of this.benchmarks) {
      try {
        performanceLogger.info(`Running benchmark: ${name}`);
        const result = await benchmarkFunction();
        this.results.set(name, { success: true, result });
        performanceLogger.success(`✅ Benchmark passed: ${name}`);
      } catch (error) {
        this.results.set(name, { success: false, error: error.message });
        performanceLogger.error(`❌ Benchmark failed: ${name} - ${error.message}`);
      }
    }

    this.generateReport();
    return this.results;
  }

  private generateReport(): void {
    const totalBenchmarks = this.benchmarks.size;
    const passedBenchmarks = Array.from(this.results.values()).filter(r => r.success).length;
    const failedBenchmarks = totalBenchmarks - passedBenchmarks;

    performanceLogger.info('='.repeat(50));
    performanceLogger.info('PERFORMANCE BENCHMARK REPORT');
    performanceLogger.info('='.repeat(50));
    performanceLogger.info(`Total Benchmarks: ${totalBenchmarks}`);
    performanceLogger.info(`Passed: ${passedBenchmarks}`);
    performanceLogger.info(`Failed: ${failedBenchmarks}`);
    performanceLogger.info(`Success Rate: ${Math.round((passedBenchmarks / totalBenchmarks) * 100)}%`);
    performanceLogger.info('='.repeat(50));

    if (failedBenchmarks > 0) {
      performanceLogger.warn('Failed benchmarks:');
      for (const [name, result] of this.results) {
        if (!result.success) {
          performanceLogger.error(`  - ${name}: ${result.error}`);
        }
      }
    }
  }

  clear(): void {
    this.benchmarks.clear();
    this.results.clear();
  }
}

// Export performance utilities
export {
  performanceLogger,
};