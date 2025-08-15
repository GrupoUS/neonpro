/**
 * Load Testing Suite - VIBECODE V1.0 Performance Testing
 * Enterprise-grade load testing for subscription middleware
 */

import { performanceMonitor } from './monitor';

export interface LoadTestConfig {
  concurrent: number;
  duration: number; // in seconds
  rampUpTime: number; // in seconds
  operation: string;
  payload?: any;
}

export interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  throughput: number; // requests per second
  errorRate: number;
  memoryPeak: number;
}

export class LoadTester {
  private results: LoadTestResult[] = [];

  /**
   * Execute load test with specified configuration
   */
  async executeLoadTest(
    testFn: () => Promise<boolean>,
    config: LoadTestConfig
  ): Promise<LoadTestResult> {
    const startTime = Date.now();
    const results: Array<{ success: boolean; responseTime: number }> = [];
    const memoryReadings: number[] = [];

    // Calculate requests per interval
    const _totalRequests = config.concurrent * config.duration;
    const batchSize = Math.max(1, Math.floor(config.concurrent / 10));

    console.log(
      `🚀 Starting load test: ${config.concurrent} concurrent users for ${config.duration}s`
    );

    // Execute test in batches with ramp-up
    const batches = Math.ceil(config.concurrent / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const batchPromises: Promise<void>[] = [];

      // Ramp-up delay
      const rampDelay = (config.rampUpTime * 1000 * batch) / batches;
      await new Promise((resolve) => setTimeout(resolve, rampDelay));

      // Execute batch
      for (
        let i = 0;
        i < batchSize && batch * batchSize + i < config.concurrent;
        i++
      ) {
        const requestPromise = this.executeRequest(testFn, config.operation);
        batchPromises.push(
          requestPromise.then((result) => {
            results.push(result);
            memoryReadings.push(this.getCurrentMemoryUsage());
          })
        );
      }

      await Promise.all(batchPromises);
    }

    // Calculate final results
    return this.calculateResults(results, memoryReadings, startTime, config);
  } /**
   * Execute individual request with performance monitoring
   */
  private async executeRequest(
    testFn: () => Promise<boolean>,
    operation: string
  ): Promise<{ success: boolean; responseTime: number }> {
    const measurementId = performanceMonitor.startMeasurement(operation);
    const startTime = performance.now();

    try {
      const success = await testFn();
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      performanceMonitor.endMeasurement(measurementId, success);

      return { success, responseTime };
    } catch (_error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      performanceMonitor.endMeasurement(measurementId, false);

      return { success: false, responseTime };
    }
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }

    if (typeof process !== 'undefined') {
      return process.memoryUsage().heapUsed / (1024 * 1024);
    }

    return 0;
  } /**
   * Calculate final load test results
   */
  private calculateResults(
    results: Array<{ success: boolean; responseTime: number }>,
    memoryReadings: number[],
    startTime: number,
    _config: LoadTestConfig
  ): LoadTestResult {
    const totalRequests = results.length;
    const successfulRequests = results.filter((r) => r.success).length;
    const failedRequests = totalRequests - successfulRequests;

    const responseTimes = results.map((r) => r.responseTime);
    const avgResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);

    const totalTime = (Date.now() - startTime) / 1000; // in seconds
    const throughput = totalRequests / totalTime;
    const errorRate = (failedRequests / totalRequests) * 100;
    const memoryPeak = Math.max(...memoryReadings);

    const result: LoadTestResult = {
      totalRequests,
      successfulRequests,
      failedRequests,
      avgResponseTime,
      maxResponseTime,
      minResponseTime,
      throughput,
      errorRate,
      memoryPeak,
    };

    this.results.push(result);
    return result;
  }

  /**
   * Get all load test results
   */
  getResults(): LoadTestResult[] {
    return [...this.results];
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results = [];
  }
}

export const loadTester = new LoadTester();
