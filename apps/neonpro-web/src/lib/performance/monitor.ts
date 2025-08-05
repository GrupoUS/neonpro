/**
 * Performance Monitor - VIBECODE V1.0 Enhanced
 * Comprehensive performance monitoring for subscription middleware
 */

export interface PerformanceMetrics {
  timestamp: number;
  operation: string;
  duration: number;
  memory: number;
  errors: number;
  success: boolean;
}

export interface PerformanceBenchmark {
  responseTime: number;
  throughput: number;
  memoryUsage: number;
  errorRate: number;
  cacheHitRate: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }  /**
   * Start performance measurement for operation
   */
  startMeasurement(operation: string): string {
    const measurementId = `${operation}-${Date.now()}`;
    performance.mark(`${measurementId}-start`);
    return measurementId;
  }

  /**
   * End performance measurement and record metrics
   */
  endMeasurement(measurementId: string, success: boolean = true): PerformanceMetrics {
    const endMark = `${measurementId}-end`;
    performance.mark(endMark);
    
    const measure = performance.measure(
      measurementId, 
      `${measurementId}-start`, 
      endMark
    );
    
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      operation: measurementId.split('-')[0],
      duration: measure.duration,
      memory: this.getMemoryUsage(),
      errors: success ? 0 : 1,
      success
    };

    this.metrics.push(metric);
    this.cleanOldMetrics();
    return metric;
  }

  /**
   * Get current memory usage in MB
   */
  private getMemoryUsage(): number {    if (typeof window !== 'undefined' && 'memory' in performance) {
      // Browser environment
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024);
    }
    
    if (typeof process !== 'undefined' && process.memoryUsage) {
      // Node.js environment
      const usage = process.memoryUsage();
      return usage.heapUsed / (1024 * 1024);
    }
    
    return 0;
  }

  /**
   * Calculate performance benchmark for operation
   */
  getBenchmark(operation: string): PerformanceBenchmark | null {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    
    if (operationMetrics.length === 0) return null;

    const avgResponseTime = operationMetrics.reduce(
      (sum, m) => sum + m.duration, 0
    ) / operationMetrics.length;

    const avgMemory = operationMetrics.reduce(
      (sum, m) => sum + m.memory, 0
    ) / operationMetrics.length;

    const errorCount = operationMetrics.filter(m => !m.success).length;
    const errorRate = (errorCount / operationMetrics.length) * 100;    const benchmark: PerformanceBenchmark = {
      responseTime: avgResponseTime,
      throughput: operationMetrics.length,
      memoryUsage: avgMemory,
      errorRate,
      cacheHitRate: 0 // Will be calculated by cache monitor
    };

    this.benchmarks.set(operation, benchmark);
    return benchmark;
  }

  /**
   * Get all current metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clean metrics older than 1 hour
   */
  private cleanOldMetrics(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  /**
   * Generate performance report
   */
  generateReport(): Record<string, PerformanceBenchmark> {
    const report: Record<string, PerformanceBenchmark> = {};
    
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    operations.forEach(op => {
      const benchmark = this.getBenchmark(op);
      if (benchmark) report[op] = benchmark;
    });

    return report;
  }

  /**
   * Reset all metrics and benchmarks
   */
  reset(): void {
    this.metrics = [];
    this.benchmarks.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
