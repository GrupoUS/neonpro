/**
 * Performance Optimization Utilities
 * T078 - Frontend Performance Optimization
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

// Core Web Vitals monitoring
export interface WebVitalsMetrics {
  cls: number;
  fcp: number;
  inp: number;
  lcp: number;
  ttfb: number;
}

// Declare global gtag for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'event' | string,
      action: string,
      params?: Record<string, any>
    ) => void;
  }
}

export class PerformanceMonitor {
  private metrics: Partial<WebVitalsMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeWebVitals();
    this.initializeResourceTiming();
  }

  private initializeWebVitals() {
    onCLS(metric => {
      this.metrics.cls = metric.value;
      this.reportMetric('CLS', metric.value);
    });

    onFCP(metric => {
      this.metrics.fcp = metric.value;
      this.reportMetric('FCP', metric.value);
    });

    onINP(metric => {
      this.metrics.inp = metric.value;
      this.reportMetric('INP', metric.value);
    });

    onLCP(metric => {
      this.metrics.lcp = metric.value;
      this.reportMetric('LCP', metric.value);
    });

    onTTFB(metric => {
      this.metrics.ttfb = metric.value;
      this.reportMetric('TTFB', metric.value);
    });
  }

  private initializeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.reportNavigationTiming(entry as PerformanceNavigationTiming);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    }
  }

  private reportMetric(name: string, value: number) {
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }
  }

  private reportNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.connectEnd - entry.secureConnectionStart,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domParse: entry.domContentLoadedEventStart - entry.responseEnd,
      domReady: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
    };

    if (process.env.NODE_ENV === 'development') {
      console.table(metrics);
    }
  }

  getMetrics(): Partial<WebVitalsMetrics> {
    return { ...this.metrics };
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Image lazy loading utility
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {},
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Resource preloading utilities
export const preloadResource = (href: string, as: string, crossorigin?: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) link.crossOrigin = crossorigin;

  document.head.appendChild(link);
};

export const prefetchResource = (href: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;

  document.head.appendChild(link);
};

// Bundle size monitoring
export const logBundleSize = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  console.group('Bundle Analysis');
  console.log('Scripts:', scripts.length);
  console.log('Stylesheets:', styles.length);
  console.groupEnd();
};

// Memory usage monitoring
export const monitorMemoryUsage = (): { used: number; total: number; limit: number } | undefined => {
  if (typeof window === 'undefined' || !('performance' in window)) return undefined;

  const memory = (performance as any).memory;
  if (memory) {
    const usage = {
      used: Math.round(memory.usedJSHeapSize / 1048576),
      total: Math.round(memory.totalJSHeapSize / 1048576),
      limit: Math.round(memory.jsHeapSizeLimit / 1048576),
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Memory Usage (MB):', usage);
    }

    return usage;
  }
  return undefined;
};

// Performance singleton
export const performanceMonitor = new PerformanceMonitor();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.destroy();
  });
}
