// Performance monitoring utilities for NeonPro Healthcare System
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp?: Date;
}

export interface WebVital {
  name: "CLS" | "FID" | "FCP" | "LCP" | "TTFB";
  value: number;
  delta: number;
  rating: "good" | "needs-improvement" | "poor";
}

// TODO: Convert to standalone functions
export class PerformanceService {
  static startTimer(name: string): { end: () => number; } {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        PerformanceService.recordMetric({
          name,
          value: duration,
          unit: "ms",
        });
        return duration;
      },
    };
  }

  static recordMetric(_metric: PerformanceMetric): void {}

  static recordWebVital(_vital: WebVital): void {}

  static getMetrics(): PerformanceMetric[] {
    // Mock implementation for testing
    return [];
  }
}

export default PerformanceService;
