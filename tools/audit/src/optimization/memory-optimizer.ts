/**
 * Memory Optimizer for NeonPro Audit System
 *
 * Specialized memory management and optimization system with leak detection,
 * resource pooling, and constitutional compliance for enterprise-scale operations.
 */

import { EventEmitter } from 'events';
import { AuditError, ErrorCategory, ErrorSeverity } from '../error-handling/error-types.js';

/**
 * Memory optimization strategies
 */
export enum MemoryStrategy {
  POOL_REUSE = 'pool_reuse',
  LAZY_LOADING = 'lazy_loading',
  STREAMING = 'streaming',
  GARBAGE_COLLECTION = 'garbage_collection',
  RESOURCE_CLEANUP = 'resource_cleanup',
  MEMORY_MAPPING = 'memory_mapping',
  WEAK_REFERENCES = 'weak_references',
  OBJECT_RECYCLING = 'object_recycling',
}

/**
 * Memory leak detection result
 */
export interface MemoryLeakDetection {
  detectionId: string;
  timestamp: Date;
  leakType:
    | 'event_listener'
    | 'closure'
    | 'dom_reference'
    | 'timer'
    | 'global_reference'
    | 'circular_reference';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  estimatedLeakRate: number; // bytes per second
  recommendedAction: string;
  confidence: number; // 0-1 scale
}

/**
 * Memory pool configuration
 */
export interface MemoryPoolConfig {
  initialSize: number;
  maxSize: number;
  growthFactor: number;
  shrinkThreshold: number;
  cleanupInterval: number;
  itemLifetime: number;
}

/**
 * Resource tracking information
 */
export interface ResourceInfo {
  id: string;
  type: string;
  size: number;
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
  isReusable: boolean;
  metadata: Record<string, any>;
}

/**
 * Memory optimization result
 */
export interface MemoryOptimizationResult {
  optimizationId: string;
  strategy: MemoryStrategy;
  beforeMemory: number;
  afterMemory: number;
  memoryReduced: number;
  executionTime: number;
  success: boolean;
  details: string;
  warnings: string[];
}

export interface MemoryObservation {
  timestamp: Date;
  memoryUsage: number;
  objectCounts: Map<string, number>;
  eventListenerCount: number;
}

/**
 * Memory pool implementation for object reuse
 */
export class MemoryPool<T> extends EventEmitter {
  private pool: T[];
  private inUse: Set<T>;
  private config: MemoryPoolConfig;
  private createFn: () => T;
  private resetFn: (item: T) => void;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    createFn: () => T,
    resetFn: (item: T) => void,
    config: Partial<MemoryPoolConfig> = {},
  ) {
    super();

    this.createFn = createFn;
    this.resetFn = resetFn;
    this.config = {
      initialSize: 10,
      maxSize: 100,
      growthFactor: 1.5,
      shrinkThreshold: 0.25,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      itemLifetime: 30 * 60 * 1000, // 30 minutes
      ...config,
    };

    this.pool = [];
    this.inUse = new Set();

    this.initialize();
  }

  private initialize(): void {
    // Pre-populate pool with initial items
    for (let i = 0; i < this.config.initialSize; i++) {
      this.pool.push(this.createFn());
    }

    // Start cleanup interval
    this.startCleanup();

    this.emit('pool_initialized', {
      initialSize: this.config.initialSize,
      maxSize: this.config.maxSize,
    });
  }

  /**
   * Acquire item from pool
   */
  acquire(): T {
    let item: T;

    if (this.pool.length > 0) {
      item = this.pool.pop()!;
      this.emit('item_reused', { poolSize: this.pool.length });
    } else {
      // Pool empty, create new item if within limits
      if (this.inUse.size < this.config.maxSize) {
        item = this.createFn();
        this.emit('item_created', { inUse: this.inUse.size });
      } else {
        throw new AuditError(
          `Memory pool exhausted: ${this.inUse.size} items in use`,
          ErrorCategory.MEMORY,
          ErrorSeverity.HIGH,
          true,
        );
      }
    }

    this.inUse.add(item);
    return item;
  }

  /**
   * Release item back to pool
   */
  release(item: T): void {
    if (!this.inUse.has(item)) {
      this.emit('release_warning', { message: 'Attempted to release item not in use' });
      return;
    }

    this.inUse.delete(item);

    try {
      // Reset item to clean state
      this.resetFn(item);

      // Add back to pool if under capacity
      if (this.pool.length < this.config.maxSize) {
        this.pool.push(item);
        this.emit('item_returned', { poolSize: this.pool.length });
      } else {
        this.emit('item_discarded', { poolSize: this.pool.length });
      }
    } catch (error) {
      this.emit('reset_error', { error, item });
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    poolSize: number;
    inUse: number;
    totalCapacity: number;
    utilization: number;
  } {
    return {
      poolSize: this.pool.length,
      inUse: this.inUse.size,
      totalCapacity: this.config.maxSize,
      utilization: this.inUse.size / this.config.maxSize,
    };
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Perform pool cleanup
   */
  private performCleanup(): void {
    const stats = this.getStats();

    // Shrink pool if utilization is low
    if (
      stats.utilization < this.config.shrinkThreshold && this.pool.length > this.config.initialSize
    ) {
      const toRemove = Math.floor((this.pool.length - this.config.initialSize) / 2);
      this.pool.splice(0, toRemove);

      this.emit('pool_shrunk', {
        removed: toRemove,
        newSize: this.pool.length,
      });
    }
  }

  /**
   * Clean up pool resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.pool = [];
    this.inUse.clear();

    this.emit('pool_destroyed');
  }
}

/**
 * Memory leak detector
 */
export interface MemoryObservation {
  timestamp: Date;
  memoryUsage: number;
  objectCounts: Map<string, number>;
  eventListenerCount: number;
}

// MemoryMonitoring
export class MemoryLeakDetector extends EventEmitter {
  private observations: Map<string, MemoryObservation> = new Map();
  private detectionInterval: NodeJS.Timeout | null = null;
  private thresholds = {
    memoryGrowthRate: 1024 * 1024, // 1MB per minute
    eventListenerGrowth: 10, // 10 listeners per minute
    objectGrowthRate: 100, // 100 objects per minute
  };

  // MemoryObservation interface moved to top-level above the class to satisfy TypeScript parsing

  /**
   * Start memory leak detection
   */
  startDetection(interval: number = 60000): void { // 1 minute default
    this.detectionInterval = setInterval(() => {
      this.performDetection();
    }, interval);

    this.emit('detection_started', { interval });
  }

  /**
   * Stop memory leak detection
   */
  stopDetection(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    this.emit('detection_stopped');
  }

  /**
   * Perform leak detection analysis
   */
  private async performDetection(): Promise<void> {
    const currentObservation = await this.captureMemoryObservation();
    const observationId = `obs_${Date.now()}`;

    this.observations.set(observationId, currentObservation);

    // Keep only recent observations (last 10 minutes)
    const cutoffTime = Date.now() - 10 * 60 * 1000;
    for (const [id, obs] of this.observations) {
      if (obs.timestamp.getTime() < cutoffTime) {
        this.observations.delete(id);
      }
    }

    // Analyze for leaks
    const leaks = await this.analyzePotentialLeaks(currentObservation);

    for (const leak of leaks) {
      this.emit('leak_detected', leak);
    }
  }

  /**
   * Capture current memory observation
   */
  private async captureMemoryObservation(): Promise<MemoryObservation> {
    const memoryUsage = process.memoryUsage().heapUsed;

    // Count objects by type (simplified implementation)
    const objectCounts = new Map<string, number>();

    // Get event listener count (if available)
    let eventListenerCount = 0;
    try {
      // This is a simplified approach - in practice, you'd need more sophisticated tracking
      eventListenerCount = process.listenerCount ? Object.keys(process.listenerCount).length : 0;
    } catch (error) {
      // Ignore errors in event listener counting
    }

    return {
      timestamp: new Date(),
      memoryUsage,
      objectCounts,
      eventListenerCount,
    };
  }

  /**
   * Analyze potential memory leaks
   */
  private async analyzePotentialLeaks(current: MemoryObservation): Promise<MemoryLeakDetection[]> {
    const leaks: MemoryLeakDetection[] = [];
    const observations = Array.from(this.observations.values());

    if (observations.length < 2) {
      return leaks; // Need at least 2 observations to compare
    }

    const previous = observations[observations.length - 2];
    const timeDiff = (current.timestamp.getTime() - previous.timestamp.getTime()) / 1000; // seconds

    // Check memory growth rate
    const memoryGrowth = (current.memoryUsage - previous.memoryUsage) / timeDiff;
    if (memoryGrowth > this.thresholds.memoryGrowthRate / 60) { // Convert to per second
      leaks.push({
        detectionId: `leak_memory_${Date.now()}`,
        timestamp: new Date(),
        leakType: 'global_reference',
        severity: memoryGrowth > this.thresholds.memoryGrowthRate ? 'high' : 'medium',
        location: 'global',
        description: `Memory usage growing at ${
          (memoryGrowth * 60 / 1024 / 1024).toFixed(2)
        } MB/min`,
        estimatedLeakRate: memoryGrowth,
        recommendedAction: 'Review recent code changes for memory leaks',
        confidence: 0.7,
      });
    }

    // Check event listener growth
    const listenerGrowth = (current.eventListenerCount - previous.eventListenerCount) / timeDiff;
    if (listenerGrowth > this.thresholds.eventListenerGrowth / 60) {
      leaks.push({
        detectionId: `leak_listeners_${Date.now()}`,
        timestamp: new Date(),
        leakType: 'event_listener',
        severity: 'medium',
        location: 'event_system',
        description: `Event listeners growing at ${(listenerGrowth * 60).toFixed(2)} per minute`,
        estimatedLeakRate: listenerGrowth * 1000, // Estimate 1KB per listener
        recommendedAction: 'Ensure event listeners are properly removed',
        confidence: 0.8,
      });
    }

    return leaks;
  }
}

/**
 * Comprehensive memory optimizer
 */
export class MemoryOptimizer extends EventEmitter {
  private pools: Map<string, MemoryPool<any>> = new Map();
  private resources: Map<string, ResourceInfo> = new Map();
  private leakDetector: MemoryLeakDetector;
  private optimizationHistory: MemoryOptimizationResult[] = [];
  private gcOptimizationEnabled = true;
  private constitutionalLimits = {
    maxMemoryBytes: 2 * 1024 * 1024 * 1024, // 2GB
    maxGCPauseMs: 100,
    maxMemoryGrowthRate: 10 * 1024 * 1024, // 10MB per minute
  };

  constructor() {
    super();

    this.leakDetector = new MemoryLeakDetector();
    this.setupLeakDetection();
    this.initializeGCOptimization();
  }

  /**
   * Create memory pool for object reuse
   */
  createPool<T>(
    poolId: string,
    createFn: () => T,
    resetFn: (item: T) => void,
    config?: Partial<MemoryPoolConfig>,
  ): MemoryPool<T> {
    if (this.pools.has(poolId)) {
      throw new AuditError(
        `Memory pool already exists: ${poolId}`,
        ErrorCategory.CONFIGURATION,
        ErrorSeverity.MEDIUM,
        false,
      );
    }

    const pool = new MemoryPool(createFn, resetFn, config);
    this.pools.set(poolId, pool);

    // Forward pool events
    pool.on('pool_exhausted', data => {
      this.emit('pool_exhausted', { poolId, ...data });
    });

    this.emit('pool_created', { poolId, config });
    return pool;
  }

  /**
   * Get existing memory pool
   */
  getPool<T>(poolId: string): MemoryPool<T> | null {
    return this.pools.get(poolId) || null;
  }

  /**
   * Perform comprehensive memory optimization
   */
  async optimizeMemory(): Promise<MemoryOptimizationResult[]> {
    this.emit('optimization_started');
    const results: MemoryOptimizationResult[] = [];

    try {
      // Strategy 1: Garbage collection optimization
      const gcResult = await this.optimizeGarbageCollection();
      results.push(gcResult);

      // Strategy 2: Resource cleanup
      const cleanupResult = await this.optimizeResourceCleanup();
      results.push(cleanupResult);

      // Strategy 3: Pool optimization
      const poolResult = await this.optimizeMemoryPools();
      results.push(poolResult);

      // Strategy 4: Memory mapping optimization
      const mappingResult = await this.optimizeMemoryMapping();
      results.push(mappingResult);

      // Validate constitutional compliance
      await this.validateConstitutionalCompliance();

      // Store results
      this.optimizationHistory.push(...results);

      this.emit('optimization_completed', { results });
      return results;
    } catch (error) {
      this.emit('optimization_failed', { error });
      throw error;
    }
  }

  /**
   * Optimize garbage collection
   */
  private async optimizeGarbageCollection(): Promise<MemoryOptimizationResult> {
    const beforeMemory = process.memoryUsage().heapUsed;
    const startTime = Date.now();
    let success = false;
    const warnings: string[] = [];

    try {
      if (global.gc && this.gcOptimizationEnabled) {
        // Force garbage collection
        global.gc();

        // Wait a moment for GC to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        success = true;
      } else {
        warnings.push('Garbage collection not available - run with --expose-gc flag');
      }

      const afterMemory = process.memoryUsage().heapUsed;
      const memoryReduced = Math.max(0, beforeMemory - afterMemory);

      return {
        optimizationId: `gc_${Date.now()}`,
        strategy: MemoryStrategy.GARBAGE_COLLECTION,
        beforeMemory,
        afterMemory,
        memoryReduced,
        executionTime: Date.now() - startTime,
        success,
        details: `Garbage collection ${success ? 'executed' : 'skipped'}`,
        warnings,
      };
    } catch (error) {
      return {
        optimizationId: `gc_${Date.now()}`,
        strategy: MemoryStrategy.GARBAGE_COLLECTION,
        beforeMemory,
        afterMemory: beforeMemory,
        memoryReduced: 0,
        executionTime: Date.now() - startTime,
        success: false,
        details: `Garbage collection failed: ${error.message}`,
        warnings: [],
      };
    }
  }

  /**
   * Optimize resource cleanup
   */
  private async optimizeResourceCleanup(): Promise<MemoryOptimizationResult> {
    const beforeMemory = process.memoryUsage().heapUsed;
    const startTime = Date.now();
    let cleanedCount = 0;
    const warnings: string[] = [];

    const cutoffTime = Date.now() - 30 * 60 * 1000; // 30 minutes ago

    for (const [id, resource] of this.resources) {
      try {
        // Clean up old unused resources
        if (resource.lastUsed.getTime() < cutoffTime && resource.useCount === 0) {
          await this.cleanupResource(id);
          cleanedCount++;
        }
      } catch (error) {
        warnings.push(`Failed to cleanup resource ${id}: ${error.message}`);
      }
    }

    const afterMemory = process.memoryUsage().heapUsed;
    const memoryReduced = Math.max(0, beforeMemory - afterMemory);

    return {
      optimizationId: `cleanup_${Date.now()}`,
      strategy: MemoryStrategy.RESOURCE_CLEANUP,
      beforeMemory,
      afterMemory,
      memoryReduced,
      executionTime: Date.now() - startTime,
      success: true,
      details: `Cleaned up ${cleanedCount} unused resources`,
      warnings,
    };
  }

  /**
   * Optimize memory pools
   */
  private async optimizeMemoryPools(): Promise<MemoryOptimizationResult> {
    const beforeMemory = process.memoryUsage().heapUsed;
    const startTime = Date.now();
    let optimizedPools = 0;

    for (const [poolId, pool] of this.pools) {
      try {
        const stats = pool.getStats();

        // Optimize under-utilized pools
        if (stats.utilization < 0.1 && stats.poolSize > 5) {
          // Trigger cleanup on the pool
          (pool as any).performCleanup?.(); // If method exists
          optimizedPools++;

          this.emit('pool_optimized', { poolId, stats });
        }
      } catch (error) {
        this.emit('pool_optimization_error', { poolId, error });
      }
    }

    const afterMemory = process.memoryUsage().heapUsed;
    const memoryReduced = Math.max(0, beforeMemory - afterMemory);

    return {
      optimizationId: `pools_${Date.now()}`,
      strategy: MemoryStrategy.POOL_REUSE,
      beforeMemory,
      afterMemory,
      memoryReduced,
      executionTime: Date.now() - startTime,
      success: true,
      details: `Optimized ${optimizedPools} memory pools`,
      warnings: [],
    };
  }

  /**
   * Optimize memory mapping
   */
  private async optimizeMemoryMapping(): Promise<MemoryOptimizationResult> {
    const beforeMemory = process.memoryUsage().heapUsed;
    const startTime = Date.now();

    // This is a placeholder for memory mapping optimizations
    // In practice, this would involve optimizing file mappings, buffer usage, etc.

    const afterMemory = process.memoryUsage().heapUsed;

    return {
      optimizationId: `mapping_${Date.now()}`,
      strategy: MemoryStrategy.MEMORY_MAPPING,
      beforeMemory,
      afterMemory,
      memoryReduced: 0,
      executionTime: Date.now() - startTime,
      success: true,
      details: 'Memory mapping optimization completed (placeholder)',
      warnings: [],
    };
  }

  /**
   * Register resource for tracking
   */
  registerResource(
    id: string,
    type: string,
    size: number,
    metadata: Record<string, any> = {},
  ): void {
    const resource: ResourceInfo = {
      id,
      type,
      size,
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0,
      isReusable: false,
      metadata,
    };

    this.resources.set(id, resource);
    this.emit('resource_registered', { id, type, size });
  }

  /**
   * Update resource usage
   */
  updateResourceUsage(id: string): void {
    const resource = this.resources.get(id);
    if (resource) {
      resource.lastUsed = new Date();
      resource.useCount++;

      this.emit('resource_used', { id, useCount: resource.useCount });
    }
  }

  /**
   * Cleanup specific resource
   */
  private async cleanupResource(id: string): Promise<void> {
    const resource = this.resources.get(id);
    if (!resource) return;

    try {
      // Perform type-specific cleanup
      switch (resource.type) {
        case 'buffer':
          // Clear buffer if it exists in metadata
          if (resource.metadata.buffer) {
            resource.metadata.buffer.fill(0);
          }
          break;

        case 'stream':
          // Close stream if it exists in metadata
          if (resource.metadata.stream && typeof resource.metadata.stream.close === 'function') {
            resource.metadata.stream.close();
          }
          break;

        case 'timer':
          // Clear timer if it exists in metadata
          if (resource.metadata.timer) {
            clearTimeout(resource.metadata.timer);
          }
          break;
      }

      this.resources.delete(id);
      this.emit('resource_cleaned', { id, type: resource.type });
    } catch (error) {
      this.emit('resource_cleanup_error', { id, error });
      throw error;
    }
  }

  /**
   * Setup leak detection
   */
  private setupLeakDetection(): void {
    this.leakDetector.on('leak_detected', (leak: MemoryLeakDetection) => {
      this.emit('memory_leak_detected', leak);

      // Auto-trigger optimization for critical leaks
      if (leak.severity === 'critical') {
        this.optimizeMemory().catch(error => {
          this.emit('auto_optimization_failed', { leak, error });
        });
      }
    });

    // Start leak detection
    this.leakDetector.startDetection();
  }

  /**
   * Initialize GC optimization
   */
  private initializeGCOptimization(): void {
    // Monitor memory pressure and trigger GC when appropriate
    const checkInterval = setInterval(() => {
      const usage = process.memoryUsage();
      const memoryPressure = usage.heapUsed / usage.heapTotal;

      if (memoryPressure > 0.8 && global.gc && this.gcOptimizationEnabled) {
        // High memory pressure - trigger GC
        try {
          global.gc();
          this.emit('gc_triggered', { memoryPressure, heapUsed: usage.heapUsed });
        } catch (error) {
          this.emit('gc_error', { error });
        }
      }
    }, 30000); // Check every 30 seconds

    // Cleanup interval on destruction
    this.on('destroy', () => clearInterval(checkInterval));
  }

  /**
   * Validate constitutional compliance
   */
  private async validateConstitutionalCompliance(): Promise<void> {
    const usage = process.memoryUsage();

    if (usage.heapUsed > this.constitutionalLimits.maxMemoryBytes) {
      throw new AuditError(
        `Memory usage exceeds constitutional limit: ${usage.heapUsed} > ${this.constitutionalLimits.maxMemoryBytes}`,
        ErrorCategory.MEMORY,
        ErrorSeverity.CRITICAL,
        false,
        { component: 'MemoryOptimizer', memoryUsage: usage.heapUsed },
      );
    }
  }

  /**
   * Get memory optimization statistics
   */
  getOptimizationStats(): {
    totalOptimizations: number;
    memoryReduced: number;
    activeResources: number;
    activePools: number;
    averageOptimizationTime: number;
  } {
    const totalMemoryReduced = this.optimizationHistory.reduce(
      (sum, result) => sum + result.memoryReduced,
      0,
    );

    const averageTime = this.optimizationHistory.length > 0
      ? this.optimizationHistory.reduce((sum, result) => sum + result.executionTime, 0)
        / this.optimizationHistory.length
      : 0;

    return {
      totalOptimizations: this.optimizationHistory.length,
      memoryReduced: totalMemoryReduced,
      activeResources: this.resources.size,
      activePools: this.pools.size,
      averageOptimizationTime: averageTime,
    };
  }

  /**
   * Get current memory status
   */
  getMemoryStatus(): {
    current: NodeJS.MemoryUsage;
    constitutional: {
      limit: number;
      usage: number;
      remaining: number;
      utilizationPercentage: number;
    };
    resources: {
      count: number;
      totalSize: number;
    };
  } {
    const current = process.memoryUsage();
    const resourceTotalSize = Array.from(this.resources.values()).reduce(
      (sum, resource) => sum + resource.size,
      0,
    );

    return {
      current,
      constitutional: {
        limit: this.constitutionalLimits.maxMemoryBytes,
        usage: current.heapUsed,
        remaining: this.constitutionalLimits.maxMemoryBytes - current.heapUsed,
        utilizationPercentage: (current.heapUsed / this.constitutionalLimits.maxMemoryBytes) * 100,
      },
      resources: {
        count: this.resources.size,
        totalSize: resourceTotalSize,
      },
    };
  }

  /**
   * Clean up optimizer resources
   */
  destroy(): void {
    // Stop leak detection
    this.leakDetector.stopDetection();

    // Destroy all pools
    for (const pool of this.pools.values()) {
      pool.destroy();
    }
    this.pools.clear();

    // Clear resources
    this.resources.clear();

    // Clear history
    this.optimizationHistory = [];

    this.emit('destroy');
  }
}
