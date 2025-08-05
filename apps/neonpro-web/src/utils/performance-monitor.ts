"use client";

import type { useEffect, useRef, useCallback, useState } from "react";

// =====================================================================================
// PERFORMANCE MONITORING SYSTEM
// Real-time performance tracking and optimization suggestions
// =====================================================================================

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  threshold?: number;
  unit?: string;
}

interface PerformanceAlert {
  id: string;
  type: "warning" | "critical";
  metric: string;
  message: string;
  suggestion: string;
  timestamp: number;
}

interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRender: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

interface PerformanceReport {
  overall: {
    score: number; // 0-100
    grade: "A" | "B" | "C" | "D" | "F";
  };
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  components: ComponentPerformance[];
  recommendations: string[];
}

// =====================================================================================
// PERFORMANCE MONITOR CLASS
// =====================================================================================

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alerts: PerformanceAlert[] = [];
  private components: Map<string, ComponentPerformance> = new Map();
  private observers: ((report: PerformanceReport) => void)[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private memoryObserver?: PerformanceObserver;
  private navigationObserver?: PerformanceObserver;

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === "undefined") return;

    try {
      // Memory usage observer
      if ("PerformanceObserver" in window) {
        this.memoryObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "measure") {
              this.addMetric("custom-measure", {
                name: entry.name,
                value: entry.duration,
                timestamp: Date.now(),
                unit: "ms",
              });
            }
          }
        });
        this.memoryObserver.observe({ entryTypes: ["measure"] });

        // Navigation timing observer
        this.navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "navigation") {
              const navEntry = entry as PerformanceNavigationTiming;
              this.addMetric("navigation", {
                name: "page-load-time",
                value: navEntry.loadEventEnd - navEntry.navigationStart,
                timestamp: Date.now(),
                threshold: 3000,
                unit: "ms",
              });
            }
          }
        });
        this.navigationObserver.observe({ entryTypes: ["navigation"] });
      }
    } catch (error) {
      console.warn("Performance observers not supported:", error);
    }
  }

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
      this.notifyObservers();
    }, 5000); // Check every 5 seconds

    console.log("🚀 Performance monitoring started");
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.memoryObserver) {
      this.memoryObserver.disconnect();
    }
    if (this.navigationObserver) {
      this.navigationObserver.disconnect();
    }
    console.log("⏹️ Performance monitoring stopped");
  }

  private collectMetrics() {
    if (typeof window === "undefined") return;

    const now = Date.now();

    // Memory usage
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      this.addMetric("memory", {
        name: "heap-used",
        value: memory.usedJSHeapSize / 1024 / 1024, // MB
        timestamp: now,
        threshold: 100, // 100MB
        unit: "MB",
      });

      this.addMetric("memory", {
        name: "heap-total",
        value: memory.totalJSHeapSize / 1024 / 1024, // MB
        timestamp: now,
        unit: "MB",
      });
    }

    // FPS (approximate)
    this.measureFPS();

    // DOM nodes count
    this.addMetric("dom", {
      name: "node-count",
      value: document.querySelectorAll("*").length,
      timestamp: now,
      threshold: 1500,
      unit: "nodes",
    });

    // Event listeners count (approximate)
    this.addMetric("events", {
      name: "listener-count",
      value: this.estimateEventListeners(),
      timestamp: now,
      threshold: 100,
      unit: "listeners",
    });
  }

  private measureFPS() {
    let frames = 0;
    let lastTime = performance.now();

    const measureFrame = (currentTime: number) => {
      frames++;
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        this.addMetric("rendering", {
          name: "fps",
          value: fps,
          timestamp: Date.now(),
          threshold: 30,
          unit: "fps",
        });
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }

  private estimateEventListeners(): number {
    // This is an approximation - actual count is hard to get
    const elements = document.querySelectorAll("*");
    let count = 0;

    elements.forEach((el) => {
      // Check for common event attributes
      const attributes = el.attributes;
      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].name.startsWith("on")) {
          count++;
        }
      }
    });

    return count;
  }

  addMetric(category: string, metric: PerformanceMetric) {
    if (!this.metrics.has(category)) {
      this.metrics.set(category, []);
    }

    const categoryMetrics = this.metrics.get(category)!;
    categoryMetrics.push(metric);

    // Keep only last 100 metrics per category
    if (categoryMetrics.length > 100) {
      categoryMetrics.shift();
    }
  }

  trackComponent(componentName: string, renderTime: number) {
    const existing = this.components.get(componentName);

    if (existing) {
      existing.renderCount++;
      existing.lastRender = Date.now();
      existing.averageRenderTime =
        (existing.averageRenderTime * (existing.renderCount - 1) + renderTime) /
        existing.renderCount;
    } else {
      this.components.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        lastRender: Date.now(),
        averageRenderTime: renderTime,
      });
    }
  }

  private analyzePerformance() {
    this.alerts = []; // Clear previous alerts

    // Check all metrics against thresholds
    this.metrics.forEach((categoryMetrics, category) => {
      categoryMetrics.forEach((metric) => {
        if (metric.threshold && metric.value > metric.threshold) {
          this.addAlert({
            type: metric.value > metric.threshold * 1.5 ? "critical" : "warning",
            metric: metric.name,
            message: `${metric.name} is ${metric.value}${metric.unit || ""} (threshold: ${metric.threshold}${metric.unit || ""})`,
            suggestion: this.getSuggestion(metric.name, metric.value, metric.threshold),
          });
        }
      });
    });

    // Check component performance
    this.components.forEach((comp) => {
      if (comp.averageRenderTime > 16) {
        // 60fps = 16ms per frame
        this.addAlert({
          type: comp.averageRenderTime > 50 ? "critical" : "warning",
          metric: "component-render-time",
          message: `Component ${comp.componentName} average render time: ${comp.averageRenderTime.toFixed(2)}ms`,
          suggestion: "Consider memoization, virtualization, or code splitting for this component",
        });
      }
    });
  }

  private getSuggestion(metricName: string, value: number, threshold: number): string {
    const suggestions: Record<string, string> = {
      "heap-used":
        "Consider implementing memory cleanup, removing unused variables, or using WeakMap/WeakSet",
      "node-count":
        "Reduce DOM complexity, implement virtualization for large lists, or use fragments",
      "listener-count":
        "Remove unused event listeners, use event delegation, or implement cleanup in useEffect",
      fps: "Optimize animations, reduce DOM manipulations, or use CSS transforms instead of JS",
      "page-load-time": "Implement code splitting, optimize images, or use lazy loading",
    };

    return suggestions[metricName] || "Monitor this metric and consider optimization strategies";
  }

  private addAlert(alert: Omit<PerformanceAlert, "id" | "timestamp">) {
    this.alerts.push({
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    });
  }

  getReport(): PerformanceReport {
    const score = this.calculateOverallScore();
    const grade = this.getGrade(score);

    return {
      overall: { score, grade },
      metrics: this.getAllMetrics(),
      alerts: [...this.alerts],
      components: Array.from(this.components.values()),
      recommendations: this.getRecommendations(),
    };
  }

  private calculateOverallScore(): number {
    let score = 100;

    // Deduct points for alerts
    this.alerts.forEach((alert) => {
      score -= alert.type === "critical" ? 15 : 5;
    });

    // Deduct points for slow components
    this.components.forEach((comp) => {
      if (comp.averageRenderTime > 16) {
        score -= Math.min(10, comp.averageRenderTime / 5);
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  private getAllMetrics(): PerformanceMetric[] {
    const allMetrics: PerformanceMetric[] = [];
    this.metrics.forEach((categoryMetrics) => {
      allMetrics.push(...categoryMetrics.slice(-10)); // Last 10 of each category
    });
    return allMetrics.sort((a, b) => b.timestamp - a.timestamp);
  }

  private getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.alerts.some((a) => a.metric === "heap-used")) {
      recommendations.push("Implement memory management best practices");
    }

    if (this.alerts.some((a) => a.metric === "fps")) {
      recommendations.push("Optimize rendering performance and animations");
    }

    if (this.components.size > 20) {
      recommendations.push("Consider component lazy loading and code splitting");
    }

    if (this.alerts.some((a) => a.metric === "node-count")) {
      recommendations.push("Implement virtual scrolling for large lists");
    }

    return recommendations;
  }

  subscribe(callback: (report: PerformanceReport) => void) {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers() {
    const report = this.getReport();
    this.observers.forEach((callback) => callback(report));
  }
}

// =====================================================================================
// SINGLETON INSTANCE
// =====================================================================================

const performanceMonitor = new PerformanceMonitor();

// =====================================================================================
// REACT HOOKS
// =====================================================================================

export function usePerformanceMonitor() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(setReport);
    return unsubscribe;
  }, []);

  const startMonitoring = useCallback(() => {
    performanceMonitor.startMonitoring();
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    performanceMonitor.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  const getReport = useCallback(() => {
    return performanceMonitor.getReport();
  }, []);

  return {
    report,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getReport,
  };
}

export function useComponentPerformance(componentName: string) {
  const renderStartRef = useRef<number>();
  const renderCountRef = useRef(0);

  const startRender = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      renderCountRef.current++;
      performanceMonitor.trackComponent(componentName, renderTime);
    }
  }, [componentName]);

  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  return {
    startRender,
    endRender,
    renderCount: renderCountRef.current,
  };
}

export function usePerformanceMetric(name: string, category: string = "custom") {
  const addMetric = useCallback(
    (value: number, threshold?: number, unit?: string) => {
      performanceMonitor.addMetric(category, {
        name,
        value,
        timestamp: Date.now(),
        threshold,
        unit,
      });
    },
    [name, category],
  );

  const measureAsync = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      const start = performance.now();
      try {
        const result = await fn();
        const duration = performance.now() - start;
        addMetric(duration, undefined, "ms");
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        addMetric(duration, undefined, "ms");
        throw error;
      }
    },
    [addMetric],
  );

  const measureSync = useCallback(
    <T>(fn: () => T): T => {
      const start = performance.now();
      try {
        const result = fn();
        const duration = performance.now() - start;
        addMetric(duration, undefined, "ms");
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        addMetric(duration, undefined, "ms");
        throw error;
      }
    },
    [addMetric],
  );

  return {
    addMetric,
    measureAsync,
    measureSync,
  };
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  performanceMonitor.addMetric("custom", {
    name,
    value: duration,
    timestamp: Date.now(),
    unit: "ms",
  });

  return result;
}

export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;

    performanceMonitor.addMetric("custom", {
      name,
      value: duration,
      timestamp: Date.now(),
      unit: "ms",
    });

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    performanceMonitor.addMetric("custom", {
      name: `${name}-error`,
      value: duration,
      timestamp: Date.now(),
      unit: "ms",
    });

    throw error;
  }
}

export default performanceMonitor;
