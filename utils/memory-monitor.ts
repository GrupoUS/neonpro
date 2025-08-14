'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

// =====================================================================================
// MEMORY MONITORING SYSTEM
// Real-time memory leak detection and optimization
// =====================================================================================

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsagePercent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  leakSuspected: boolean;
  timestamp: number;
}

interface MemorySnapshot {
  timestamp: number;
  metrics: MemoryMetrics;
  activeComponents: number;
  eventListeners: number;
  domNodes: number;
  context: string;
}

interface MemoryAlert {
  id: string;
  type: 'warning' | 'critical' | 'leak';
  message: string;
  timestamp: number;
  metrics: MemoryMetrics;
  suggestions: string[];
}

interface MemoryConfig {
  samplingInterval: number;
  alertThreshold: number;
  leakDetectionWindow: number;
  maxSnapshots: number;
  enableAutoCleanup: boolean;
  enableDetailedTracking: boolean;
}

// =====================================================================================
// MEMORY MONITOR CLASS
// =====================================================================================

export class MemoryMonitor {
  private config: MemoryConfig;
  private snapshots: MemorySnapshot[];
  private alerts: MemoryAlert[];
  private observers: Set<(metrics: MemoryMetrics) => void>;
  private alertObservers: Set<(alert: MemoryAlert) => void>;
  private intervalId: number | null = null;
  private isMonitoring = false;
  private componentRegistry = new Map<string, number>();
  private listenerRegistry = new WeakMap<EventTarget, Set<string>>();
  private cleanupTasks: Set<() => void> = new Set();

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = {
      samplingInterval: 5000, // 5 seconds
      alertThreshold: 80, // 80% memory usage
      leakDetectionWindow: 60000, // 1 minute
      maxSnapshots: 100,
      enableAutoCleanup: true,
      enableDetailedTracking: true,
      ...config
    };

    this.snapshots = [];
    this.alerts = [];
    this.observers = new Set();
    this.alertObservers = new Set();

    this.setupMemoryTracking();
  }

  private setupMemoryTracking() {
    if (typeof window === 'undefined') return;

    // Track component mounts/unmounts
    if (this.config.enableDetailedTracking) {
      this.setupComponentTracking();
      this.setupEventListenerTracking();
      this.setupDOMNodeTracking();
    }

    // Setup cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  private setupComponentTracking() {
    // Monkey patch React DevTools if available
    if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      
      const originalOnCommitFiberRoot = hook.onCommitFiberRoot;
      hook.onCommitFiberRoot = (...args: any[]) => {
        this.trackComponentMount();
        return originalOnCommitFiberRoot?.(...args);
      };
    }
  }

  private setupEventListenerTracking() {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
      if (!this.listenerRegistry.has(this)) {
        this.listenerRegistry.set(this, new Set());
      }
      this.listenerRegistry.get(this)!.add(type);
      return originalAddEventListener.call(this, type, listener, options);
    }.bind(this);

    EventTarget.prototype.removeEventListener = function(type: string, listener: any, options?: any) {
      const listeners = this.listenerRegistry.get(this);
      if (listeners) {
        listeners.delete(type);
        if (listeners.size === 0) {
          this.listenerRegistry.delete(this);
        }
      }
      return originalRemoveEventListener.call(this, type, listener, options);
    }.bind(this);
  }

  private setupDOMNodeTracking() {
    // Track DOM mutations
    if ('MutationObserver' in window) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            // Track added/removed nodes
            this.trackDOMChanges(mutation.addedNodes.length, mutation.removedNodes.length);
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      this.cleanupTasks.add(() => observer.disconnect());
    }
  }

  private trackComponentMount() {
    const count = this.componentRegistry.get('total') || 0;
    this.componentRegistry.set('total', count + 1);
  }

  private trackDOMChanges(added: number, removed: number) {
    const current = this.componentRegistry.get('domNodes') || 0;
    this.componentRegistry.set('domNodes', current + added - removed);
  }

  private getCurrentMemoryMetrics(): MemoryMetrics | null {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    const usedJSHeapSize = memory.usedJSHeapSize;
    const totalJSHeapSize = memory.totalJSHeapSize;
    const jsHeapSizeLimit = memory.jsHeapSizeLimit;
    
    const memoryUsagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
    const trend = this.calculateTrend(usedJSHeapSize);
    const leakSuspected = this.detectMemoryLeak(usedJSHeapSize);

    return {
      usedJSHeapSize,
      totalJSHeapSize,
      jsHeapSizeLimit,
      memoryUsagePercent,
      trend,
      leakSuspected,
      timestamp: Date.now()
    };
  }

  private calculateTrend(currentUsage: number): 'increasing' | 'decreasing' | 'stable' {
    if (this.snapshots.length < 3) return 'stable';

    const recent = this.snapshots.slice(-3).map(s => s.metrics.usedJSHeapSize);
    const avgRecent = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    
    const threshold = currentUsage * 0.05; // 5% threshold
    
    if (currentUsage > avgRecent + threshold) return 'increasing';
    if (currentUsage < avgRecent - threshold) return 'decreasing';
    return 'stable';
  }

  private detectMemoryLeak(currentUsage: number): boolean {
    if (this.snapshots.length < 5) return false;

    const windowStart = Date.now() - this.config.leakDetectionWindow;
    const recentSnapshots = this.snapshots.filter(s => s.timestamp > windowStart);
    
    if (recentSnapshots.length < 3) return false;

    // Check for consistent memory growth
    const usages = recentSnapshots.map(s => s.metrics.usedJSHeapSize);
    const growthRate = (usages[usages.length - 1] - usages[0]) / usages[0];
    
    // Leak suspected if memory grew by more than 50% in the detection window
    return growthRate > 0.5;
  }

  private createSnapshot(context: string = 'automatic'): MemorySnapshot | null {
    const metrics = this.getCurrentMemoryMetrics();
    if (!metrics) return null;

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      metrics,
      activeComponents: this.componentRegistry.get('total') || 0,
      eventListeners: this.getTotalEventListeners(),
      domNodes: document.querySelectorAll('*').length,
      context
    };

    this.snapshots.push(snapshot);
    
    // Limit snapshots to prevent memory issues
    if (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  private getTotalEventListeners(): number {
    let total = 0;
    // This is an approximation since we can't accurately count all listeners
    return total;
  }

  private checkForAlerts(metrics: MemoryMetrics) {
    const alerts: MemoryAlert[] = [];

    // High memory usage alert
    if (metrics.memoryUsagePercent > this.config.alertThreshold) {
      alerts.push({
        id: `high-memory-${Date.now()}`,
        type: metrics.memoryUsagePercent > 95 ? 'critical' : 'warning',
        message: `High memory usage: ${metrics.memoryUsagePercent.toFixed(1)}%`,
        timestamp: Date.now(),
        metrics,
        suggestions: [
          'Consider implementing component cleanup',
          'Check for memory leaks in event listeners',
          'Optimize large data structures',
          'Implement virtual scrolling for large lists'
        ]
      });
    }

    // Memory leak alert
    if (metrics.leakSuspected) {
      alerts.push({
        id: `memory-leak-${Date.now()}`,
        type: 'leak',
        message: 'Potential memory leak detected',
        timestamp: Date.now(),
        metrics,
        suggestions: [
          'Check for uncleaned event listeners',
          'Verify component cleanup in useEffect',
          'Look for circular references',
          'Check for retained DOM references'
        ]
      });
    }

    // Rapid growth alert
    if (metrics.trend === 'increasing' && this.snapshots.length > 1) {
      const lastSnapshot = this.snapshots[this.snapshots.length - 1];
      const growthRate = (metrics.usedJSHeapSize - lastSnapshot.metrics.usedJSHeapSize) / lastSnapshot.metrics.usedJSHeapSize;
      
      if (growthRate > 0.1) { // 10% growth
        alerts.push({
          id: `rapid-growth-${Date.now()}`,
          type: 'warning',
          message: `Rapid memory growth detected: ${(growthRate * 100).toFixed(1)}%`,
          timestamp: Date.now(),
          metrics,
          suggestions: [
            'Check recent component changes',
            'Look for new data loading patterns',
            'Verify cleanup in recent code changes'
          ]
        });
      }
    }

    alerts.forEach(alert => {
      this.alerts.push(alert);
      this.alertObservers.forEach(observer => observer(alert));
    });

    // Limit alerts to prevent memory issues
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-25);
    }
  }

  // =====================================================================================
  // PUBLIC API
  // =====================================================================================

  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.intervalId = window.setInterval(() => {
      const snapshot = this.createSnapshot();
      if (snapshot) {
        this.checkForAlerts(snapshot.metrics);
        this.observers.forEach(observer => observer(snapshot.metrics));
        
        if (this.config.enableAutoCleanup) {
          this.performAutoCleanup(snapshot.metrics);
        }
      }
    }, this.config.samplingInterval);
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public takeSnapshot(context?: string): MemorySnapshot | null {
    return this.createSnapshot(context);
  }

  public getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  public getAlerts(): MemoryAlert[] {
    return [...this.alerts];
  }

  public getCurrentMetrics(): MemoryMetrics | null {
    return this.getCurrentMemoryMetrics();
  }

  public subscribe(observer: (metrics: MemoryMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  public subscribeToAlerts(observer: (alert: MemoryAlert) => void): () => void {
    this.alertObservers.add(observer);
    return () => this.alertObservers.delete(observer);
  }

  public forceGarbageCollection(): void {
    if ((window as any).gc) {
      (window as any).gc();
    } else {
      console.warn('Garbage collection not available. Run Chrome with --js-flags="--expose-gc"');
    }
  }

  public generateReport(): MemoryReport {
    const currentMetrics = this.getCurrentMemoryMetrics();
    const recentSnapshots = this.snapshots.slice(-10);
    const recentAlerts = this.alerts.slice(-5);

    return {
      timestamp: Date.now(),
      current: currentMetrics,
      history: recentSnapshots,
      alerts: recentAlerts,
      analysis: this.analyzeMemoryPatterns(),
      recommendations: this.generateRecommendations()
    };
  }

  private performAutoCleanup(metrics: MemoryMetrics): void {
    if (metrics.memoryUsagePercent > 90) {
      // Trigger cleanup for high memory usage
      this.cleanupUnusedReferences();
      
      // Force garbage collection if available
      this.forceGarbageCollection();
    }
  }

  private cleanupUnusedReferences(): void {
    // Clear old snapshots more aggressively
    if (this.snapshots.length > this.config.maxSnapshots / 2) {
      this.snapshots = this.snapshots.slice(-Math.floor(this.config.maxSnapshots / 2));
    }

    // Clear old alerts
    if (this.alerts.length > 25) {
      this.alerts = this.alerts.slice(-10);
    }
  }

  private analyzeMemoryPatterns(): MemoryAnalysis {
    if (this.snapshots.length < 3) {
      return {
        trend: 'insufficient_data',
        averageUsage: 0,
        peakUsage: 0,
        growthRate: 0,
        stability: 'unknown'
      };
    }

    const usages = this.snapshots.map(s => s.metrics.usedJSHeapSize);
    const averageUsage = usages.reduce((sum, val) => sum + val, 0) / usages.length;
    const peakUsage = Math.max(...usages);
    const growthRate = (usages[usages.length - 1] - usages[0]) / usages[0];
    
    // Calculate stability (coefficient of variation)
    const variance = usages.reduce((sum, val) => sum + Math.pow(val - averageUsage, 2), 0) / usages.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / averageUsage;
    
    let stability: 'stable' | 'moderate' | 'unstable';
    if (coefficientOfVariation < 0.1) stability = 'stable';
    else if (coefficientOfVariation < 0.3) stability = 'moderate';
    else stability = 'unstable';

    return {
      trend: growthRate > 0.1 ? 'increasing' : growthRate < -0.1 ? 'decreasing' : 'stable',
      averageUsage,
      peakUsage,
      growthRate,
      stability
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analysis = this.analyzeMemoryPatterns();
    const currentMetrics = this.getCurrentMemoryMetrics();

    if (!currentMetrics) return recommendations;

    if (currentMetrics.memoryUsagePercent > 80) {
      recommendations.push('Memory usage is high. Consider implementing cleanup strategies.');
    }

    if (analysis.trend === 'increasing') {
      recommendations.push('Memory usage is consistently increasing. Check for memory leaks.');
    }

    if (analysis.stability === 'unstable') {
      recommendations.push('Memory usage is unstable. Review component lifecycle management.');
    }

    if (currentMetrics.leakSuspected) {
      recommendations.push('Potential memory leak detected. Review event listeners and component cleanup.');
    }

    if (this.alerts.filter(a => a.type === 'critical').length > 0) {
      recommendations.push('Critical memory alerts detected. Immediate action required.');
    }

    return recommendations;
  }

  public cleanup(): void {
    this.stopMonitoring();
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks.clear();
    this.observers.clear();
    this.alertObservers.clear();
    this.snapshots.length = 0;
    this.alerts.length = 0;
  }
}

// =====================================================================================
// TYPES
// =====================================================================================

interface MemoryReport {
  timestamp: number;
  current: MemoryMetrics | null;
  history: MemorySnapshot[];
  alerts: MemoryAlert[];
  analysis: MemoryAnalysis;
  recommendations: string[];
}

interface MemoryAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  averageUsage: number;
  peakUsage: number;
  growthRate: number;
  stability: 'stable' | 'moderate' | 'unstable' | 'unknown';
}

// =====================================================================================
// REACT HOOKS
// =====================================================================================

export function useMemoryMonitor(config?: Partial<MemoryConfig>) {
  const [monitor] = useState(() => new MemoryMonitor(config));
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);
  const [alerts, setAlerts] = useState<MemoryAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const unsubscribeMetrics = monitor.subscribe(setMetrics);
    const unsubscribeAlerts = monitor.subscribeToAlerts((alert) => {
      setAlerts(prev => [...prev, alert].slice(-10)); // Keep last 10 alerts
    });

    return () => {
      unsubscribeMetrics();
      unsubscribeAlerts();
      monitor.cleanup();
    };
  }, [monitor]);

  const startMonitoring = useCallback(() => {
    monitor.startMonitoring();
    setIsMonitoring(true);
  }, [monitor]);

  const stopMonitoring = useCallback(() => {
    monitor.stopMonitoring();
    setIsMonitoring(false);
  }, [monitor]);

  const takeSnapshot = useCallback((context?: string) => {
    return monitor.takeSnapshot(context);
  }, [monitor]);

  const generateReport = useCallback(() => {
    return monitor.generateReport();
  }, [monitor]);

  const forceGC = useCallback(() => {
    monitor.forceGarbageCollection();
  }, [monitor]);

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    takeSnapshot,
    generateReport,
    forceGC,
    snapshots: monitor.getSnapshots()
  };
}

export function useMemoryAlert(threshold: number = 80) {
  const [alert, setAlert] = useState<MemoryAlert | null>(null);
  const monitor = useRef<MemoryMonitor | null>(null);

  useEffect(() => {
    monitor.current = new MemoryMonitor({ alertThreshold: threshold });
    
    const unsubscribe = monitor.current.subscribeToAlerts(setAlert);
    monitor.current.startMonitoring();

    return () => {
      unsubscribe();
      monitor.current?.cleanup();
    };
  }, [threshold]);

  return alert;
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function createMemoryProfiler() {
  const profiles: Array<{ name: string; start: number; end?: number; memory?: any }> = [];
  
  return {
    start: (name: string) => {
      const memory = (performance as any).memory;
      profiles.push({
        name,
        start: performance.now(),
        memory: memory ? { ...memory } : null
      });
    },
    
    end: (name: string) => {
      const profile = profiles.find(p => p.name === name && !p.end);
      if (profile) {
        profile.end = performance.now();
        const currentMemory = (performance as any).memory;
        if (profile.memory && currentMemory) {
          const memoryDelta = currentMemory.usedJSHeapSize - profile.memory.usedJSHeapSize;
          console.log(`Memory Profile [${name}]:`, {
            duration: `${(profile.end - profile.start).toFixed(2)}ms`,
            memoryDelta: formatBytes(memoryDelta),
            finalMemory: formatBytes(currentMemory.usedJSHeapSize)
          });
        }
      }
    },
    
    getProfiles: () => [...profiles]
  };
}

// Global instance
export const globalMemoryMonitor = new MemoryMonitor();

export default MemoryMonitor;
