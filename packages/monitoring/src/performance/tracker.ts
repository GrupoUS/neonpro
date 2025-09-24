import { observeAIProviderLatency, observeChatResponseTime } from '../metrics/histograms';
import type { PerformanceMetrics } from '../types';

export class PerformanceTracker {
  private startTimes: Map<string, number> = new Map();

  startTimer(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  endTimer(operation: string, labels?: Record<string, string>): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = (performance.now() - startTime) / 1000; // Convert to seconds
    this.startTimes.delete(operation);

    // Record metrics based on operation type
    if (operation.startsWith('chat-')) {
      observeChatResponseTime(duration, labels);
    } else if (operation.startsWith('ai-')) {
      observeAIProviderLatency(duration, labels);
    }

    return duration;
  }

  getCurrentMetrics(): PerformanceMetrics {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      responseTime: 0, // Would be calculated from recent requests
      throughput: 0, // Would be calculated from request count
      errorRate: 0, // Would be calculated from error count
      cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
      memoryUsage: memoryUsage.heapUsed / 1024 / 1024, // Convert to MB
      dbConnections: 0, // Would be fetched from database pool
    };
  }

  measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>,
  ): Promise<T> {
    this.startTimer(operation);
    return fn().finally(() => {
      this.endTimer(operation, labels);
    });
  }

  measureSync<T>(
    operation: string,
    fn: () => T,
    labels?: Record<string, string>,
  ): T {
    this.startTimer(operation);
    try {
      return fn();
    } finally {
      this.endTimer(operation, labels);
    }
  }
}

// Global performance tracker instance
export const globalPerformanceTracker = new PerformanceTracker();
