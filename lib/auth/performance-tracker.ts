/**
 * Performance Tracker for OAuth and Authentication Systems
 * Monitors and tracks performance metrics for optimization
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number[]> = new Map();
  private metricTags: Map<string, Record<string, string>[]> = new Map();
  private readonly MAX_METRICS_PER_TYPE = 1000;
  
  private constructor() {}
  
  public static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    try {
      // Get or create metric array
      let values = this.metrics.get(name);
      if (!values) {
        values = [];
        this.metrics.set(name, values);
      }
      
      // Add value
      values.push(value);
      
      // Maintain size limit
      if (values.length > this.MAX_METRICS_PER_TYPE) {
        values.shift(); // Remove oldest
      }
      
      // Store tags if provided
      if (tags) {
        let tagArray = this.metricTags.get(name);
        if (!tagArray) {
          tagArray = [];
          this.metricTags.set(name, tagArray);
        }
        
        tagArray.push(tags);
        
        // Maintain size limit
        if (tagArray.length > this.MAX_METRICS_PER_TYPE) {
          tagArray.shift();
        }
      }
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  }

  /**
   * Get statistics for a metric
   */
  getStats(name: string): PerformanceStats | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    
    return {
      count,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sorted.reduce((sum, val) => sum + val, 0) / count,
      p50: this.getPercentile(sorted, 0.5),
      p95: this.getPercentile(sorted, 0.95),
      p99: this.getPercentile(sorted, 0.99),
    };
  }

  /**
   * Get all metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(name: string, count: number = 10): PerformanceMetric[] {
    const values = this.metrics.get(name);
    const tags = this.metricTags.get(name);
    
    if (!values) {
      return [];
    }
    
    const recentValues = values.slice(-count);
    const recentTags = tags ? tags.slice(-count) : [];
    
    return recentValues.map((value, index) => ({
      name,
      value,
      timestamp: Date.now() - (recentValues.length - index - 1) * 1000,
      tags: recentTags[index],
    }));
  }

  /**
   * Clear metrics for a specific name
   */
  clearMetrics(name: string): void {
    this.metrics.delete(name);
    this.metricTags.delete(name);
  }

  /**
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.metrics.clear();
    this.metricTags.clear();
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<string, PerformanceStats> {
    const summary: Record<string, PerformanceStats> = {};
    
    for (const name of this.getMetricNames()) {
      const stats = this.getStats(name);
      if (stats) {
        summary[name] = stats;
      }
    }
    
    return summary;
  }

  /**
   * Private helper methods
   */
  private getPercentile(sortedValues: number[], percentile: number): number {
    const index = Math.ceil(sortedValues.length * percentile) - 1;
    return sortedValues[Math.max(0, index)];
  }
}

export const performanceTracker = PerformanceTracker.getInstance();