// Performance tracking for monitoring
export interface PerformanceTracker {
  startTracking(name: string): void;
  endTracking(name: string): number;
  getMetrics(): PerformanceMetrics;
}

export interface PerformanceMetrics {
  [key: string]: {
    count: number;
    totalTime: number;
    averageTime: number;
  };
}

export class DefaultPerformanceTracker implements PerformanceTracker {
  private metrics: PerformanceMetrics = {};
  private timers: Map<string, number> = new Map();

  startTracking(name: string): void {
    this.timers.set(name, Date.now());
  }

  endTracking(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      throw new Error(`No timer found for ${name}`);
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(name);
    
    if (!this.metrics[name]) {
      this.metrics[name] = { count: 0, totalTime: 0, averageTime: 0 };
    }
    
    const metric = this.metrics[name];
    metric.count++;
    metric.totalTime += duration;
    metric.averageTime = metric.totalTime / metric.count;
    
    return duration;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}
