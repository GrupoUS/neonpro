/**
 * Memory Optimizer - VIBECODE V1.0 Memory Management
 * Advanced memory optimization for subscription middleware
 */

export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss?: number; // Node.js only
}

export interface MemoryLeak {
  type: 'growing_heap' | 'retained_objects' | 'event_listeners';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
}

export interface MemoryOptimizationReport {
  baseline: MemorySnapshot;
  peak: MemorySnapshot;
  current: MemorySnapshot;
  leaks: MemoryLeak[];
  optimizationOpportunities: string[];
  memoryEfficiency: number; // 0-100 score
}

export class MemoryOptimizer {
  private snapshots: MemorySnapshot[] = [];
  private gcCallbacks: (() => void)[] = [];
  private monitoringInterval?: NodeJS.Timeout;

  /**
   * Start memory monitoring
   */
  startMonitoring(intervalMs: number = 5000): void {
    this.stopMonitoring();
    
    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
      this.detectLeaks();
    }, intervalMs);
    
    console.log('🧠 Memory monitoring started');
  }  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('🧠 Memory monitoring stopped');
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
        rss: usage.rss / (1024 * 1024)
      };
    } else if (typeof window !== 'undefined' && 'memory' in performance) {
      // Browser environment
      const memory = (performance as any).memory;
      snapshot = {
        timestamp: Date.now(),
        heapUsed: memory.usedJSHeapSize / (1024 * 1024),
        heapTotal: memory.totalJSHeapSize / (1024 * 1024),
        external: 0,
        arrayBuffers: 0
      };
    } else {
      // Fallback
      snapshot = {
        timestamp: Date.now(),
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        arrayBuffers: 0
      };
    }
    
    this.snapshots.push(snapshot);
    this.cleanOldSnapshots();
    
    return snapshot;
  }