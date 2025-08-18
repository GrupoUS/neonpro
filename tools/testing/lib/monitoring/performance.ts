// Performance monitoring utilities for NeonPro Healthcare System
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp?: Date;
}

export interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export class PerformanceService {
  static startTimer(name: string): { end: () => number } {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        this.recordMetric({
          name,
          value: duration,
          unit: 'ms'
        });
        return duration;
      }
    };
  }

  static recordMetric(metric: PerformanceMetric): void {
    // Mock implementation for testing
    console.log('Performance metric recorded:', metric);
  }

  static recordWebVital(vital: WebVital): void {
    // Mock implementation for testing
    console.log('Web vital recorded:', vital);
  }

  static getMetrics(): PerformanceMetric[] {
    // Mock implementation for testing
    return [];
  }
}

export default PerformanceService;