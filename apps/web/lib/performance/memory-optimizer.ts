/**
 * Memory Optimizer - VIBECODE V1.0 Memory Management
 * Advanced memory optimization for subscription middleware
 */

export type MemorySnapshot = {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss?: number; // Node.js only
};

export type MemoryLeak = {
  type: 'growing_heap' | 'retained_objects' | 'event_listeners';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
};

export type MemoryOptimizationReport = {
  baseline: MemorySnapshot;
  peak: MemorySnapshot;
  current: MemorySnapshot;
  leaks: MemoryLeak[];
  optimizationOpportunities: string[];
  memoryEfficiency: number; // 0-100 score
};

export class MemoryOptimizer {
  private snapshots: MemorySnapshot[] = [];
  private monitoringInterval?: NodeJS.Timeout;

  /**
   * Start memory monitoring
   */
  startMonitoring(intervalMs = 5000): void {
    this.stopMonitoring();

    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
      this.detectLeaks();
    }, intervalMs);
  } /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Take memory snapshot
   */
  takeSnapshot(): MemorySnapshot {
    let snapshot: MemorySnapshot;

    if (typeof process !== 'undefined' && process.memoryUsage) {
      // Node.js environment
      const usage = process.memoryUsage();
      snapshot = {
        timestamp: Date.now(),
        heapUsed: usage.heapUsed / (1024 * 1024),
        heapTotal: usage.heapTotal / (1024 * 1024),
        external: usage.external / (1024 * 1024),
        arrayBuffers: usage.arrayBuffers / (1024 * 1024),
        rss: usage.rss / (1024 * 1024),
      };
    } else if (typeof window !== 'undefined' && 'memory' in performance) {
      // Browser environment
      const memory = (performance as any).memory;
      snapshot = {
        timestamp: Date.now(),
        heapUsed: memory.usedJSHeapSize / (1024 * 1024),
        heapTotal: memory.totalJSHeapSize / (1024 * 1024),
        external: 0,
        arrayBuffers: 0,
      };
    } else {
      // Fallback
      snapshot = {
        timestamp: Date.now(),
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        arrayBuffers: 0,
      };
    }

    this.snapshots.push(snapshot);
    this.cleanOldSnapshots();

    return snapshot;
  }

  /**
   * Detect memory leaks
   */
  private detectLeaks(): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];

    if (this.snapshots.length < 5) {
      return leaks;
    }

    const recent = this.snapshots.slice(-5);
    const growthRate = this.calculateGrowthRate(recent);

    if (growthRate > 10) {
      // 10MB/minute growth
      leaks.push({
        type: 'growing_heap',
        severity:
          growthRate > 50 ? 'critical' : growthRate > 25 ? 'high' : 'medium',
        description: `Heap growing at ${growthRate.toFixed(2)}MB/min`,
        recommendations: [
          'Check for memory leaks in event listeners',
          'Review object retention patterns',
          'Consider implementing object pooling',
        ],
      });
    }

    return leaks;
  }

  /**
   * Generate optimization report
   */
  generateReport(): MemoryOptimizationReport {
    if (this.snapshots.length === 0) {
      this.takeSnapshot();
    }

    const baseline = this.snapshots[0];
    const peak = this.snapshots.reduce((max, snap) =>
      snap.heapUsed > max.heapUsed ? snap : max,
    );
    const current = this.snapshots.at(-1);

    return {
      baseline,
      peak,
      current,
      leaks: this.detectLeaks(),
      optimizationOpportunities: this.getOptimizationOpportunities(),
      memoryEfficiency: this.calculateEfficiency(),
    };
  }

  /**
   * Force garbage collection (if available)
   */
  forceGC(): void {
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    } else {
    }
  }

  /**
   * Clean old snapshots (keep last 100)
   */
  private cleanOldSnapshots(): void {
    if (this.snapshots.length > 100) {
      this.snapshots = this.snapshots.slice(-100);
    }
  }

  /**
   * Calculate memory growth rate
   */
  private calculateGrowthRate(snapshots: MemorySnapshot[]): number {
    if (snapshots.length < 2) {
      return 0;
    }

    const first = snapshots[0];
    const last = snapshots.at(-1);
    const timeDiff = (last.timestamp - first.timestamp) / (1000 * 60); // minutes
    const memoryDiff = last.heapUsed - first.heapUsed;

    return timeDiff > 0 ? memoryDiff / timeDiff : 0;
  }

  /**
   * Get optimization opportunities
   */
  private getOptimizationOpportunities(): string[] {
    const opportunities: string[] = [];

    if (this.snapshots.length > 0) {
      const current = this.snapshots.at(-1);

      if (current.heapUsed > 100) {
        opportunities.push(
          'Consider implementing object pooling for large objects',
        );
      }

      if (current.external > 50) {
        opportunities.push('Review external memory usage (buffers, etc.)');
      }
    }

    return opportunities;
  }

  /**
   * Calculate memory efficiency score
   */
  private calculateEfficiency(): number {
    if (this.snapshots.length === 0) {
      return 100;
    }

    const current = this.snapshots.at(-1);
    const growthRate = this.calculateGrowthRate(this.snapshots.slice(-10));

    // Base score on memory usage and growth rate
    let score = 100;

    if (current.heapUsed > 200) {
      score -= 20;
    }
    if (current.heapUsed > 500) {
      score -= 30;
    }
    if (growthRate > 10) {
      score -= 25;
    }
    if (growthRate > 25) {
      score -= 25;
    }

    return Math.max(0, score);
  }
}
