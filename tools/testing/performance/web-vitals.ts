/**
 * Web Vitals Performance Monitoring
 *
 * Advanced Core Web Vitals tracking implementation for Next.js 15
 * Based on latest 2025 performance optimization patterns
 */

import {
  getCLS,
  getFCP,
  getFID,
  getLCP,
  getTTFB,
  type Metric,
} from 'web-vitals';

// Performance thresholds based on Core Web Vitals 2025 standards
export const PERFORMANCE_THRESHOLDS = {
  // Largest Contentful Paint - measures loading performance
  LCP: {
    GOOD: 2500, // <= 2.5s
    NEEDS_IMPROVEMENT: 4000, // 2.5s - 4.0s
  },
  // First Input Delay - measures interactivity (being replaced by INP)
  FID: {
    GOOD: 100, // <= 100ms
    NEEDS_IMPROVEMENT: 300, // 100ms - 300ms
  },
  // Cumulative Layout Shift - measures visual stability
  CLS: {
    GOOD: 0.1, // <= 0.1
    NEEDS_IMPROVEMENT: 0.25, // 0.1 - 0.25
  },
  // First Contentful Paint - measures perceived loading
  FCP: {
    GOOD: 1800, // <= 1.8s
    NEEDS_IMPROVEMENT: 3000, // 1.8s - 3.0s
  },
  // Time to First Byte - measures server response time
  TTFB: {
    GOOD: 800, // <= 800ms
    NEEDS_IMPROVEMENT: 1800, // 800ms - 1.8s
  },
} as const;

// Performance grade calculator
export function getPerformanceGrade(
  metric: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds =
    PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];

  if (!thresholds) {
    return 'poor';
  }

  if (value <= thresholds.GOOD) {
    return 'good';
  }
  if (value <= thresholds.NEEDS_IMPROVEMENT) {
    return 'needs-improvement';
  }
  return 'poor';
}

// Analytics endpoint for storing performance data
const ANALYTICS_ENDPOINT = '/api/analytics/performance';

// Send metric to analytics service
export async function sendToAnalytics(metric: Metric) {
  try {
    const body = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      entries: metric.entries,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      grade: getPerformanceGrade(metric.name, metric.value),
    };

    // Use sendBeacon for reliability, fallback to fetch
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], {
        type: 'application/json',
      });
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    } else {
      fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {
        // Silently fail - don't impact user experience
      });
    }
  } catch (_error) {}
}

// Enhanced metric reporting with additional context
export function reportWebVitals() {
  try {
    // Core web vitals with enhanced reporting
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);

    // Additional performance observations
    if ('PerformanceObserver' in window) {
      // Long Tasks API - detect blocking main thread
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          sendToAnalytics({
            name: 'LONG_TASK',
            value: entry.duration,
            rating: entry.duration > 50 ? 'poor' : 'good',
            delta: 0,
            id: `long-task-${Date.now()}`,
            navigationType: 'navigate',
            entries: [entry],
          } as Metric);
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (_e) {
        // Long Tasks API not supported
      }

      // Navigation Timing API - detailed navigation metrics
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;

          // DNS lookup time
          const dnsTime = navEntry.domainLookupEnd - navEntry.domainLookupStart;
          if (dnsTime > 0) {
            sendToAnalytics({
              name: 'DNS_TIME',
              value: dnsTime,
              rating: dnsTime > 100 ? 'poor' : 'good',
              delta: 0,
              id: `dns-${Date.now()}`,
              navigationType: 'navigate',
              entries: [entry],
            } as Metric);
          }

          // Connection time
          const connectTime = navEntry.connectEnd - navEntry.connectStart;
          if (connectTime > 0) {
            sendToAnalytics({
              name: 'CONNECT_TIME',
              value: connectTime,
              rating: connectTime > 100 ? 'poor' : 'good',
              delta: 0,
              id: `connect-${Date.now()}`,
              navigationType: 'navigate',
              entries: [entry],
            } as Metric);
          }
        }
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
      } catch (_e) {
        // Navigation Timing API not supported
      }
    }
  } catch (_error) {}
}

// Performance monitoring hook for React components
export function usePerformanceMonitoring() {
  const startTime = performance.now();

  return {
    // Mark component render time
    markRender: (componentName: string) => {
      const renderTime = performance.now() - startTime;

      sendToAnalytics({
        name: 'COMPONENT_RENDER',
        value: renderTime,
        rating: renderTime > 16 ? 'poor' : 'good', // 60fps = 16.67ms per frame
        delta: 0,
        id: `${componentName}-${Date.now()}`,
        navigationType: 'navigate',
        entries: [],
      } as Metric);
    },

    // Mark interaction response time
    markInteraction: (interactionName: string, startTime: number) => {
      const responseTime = performance.now() - startTime;

      sendToAnalytics({
        name: 'INTERACTION_RESPONSE',
        value: responseTime,
        rating: responseTime > 200 ? 'poor' : 'good', // INP threshold
        delta: 0,
        id: `${interactionName}-${Date.now()}`,
        navigationType: 'navigate',
        entries: [],
      } as Metric);
    },
  };
}

// Advanced performance utilities
export const PerformanceUtils = {
  // Measure function execution time
  measureFunction: async <T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    sendToAnalytics({
      name: 'FUNCTION_EXECUTION',
      value: duration,
      rating: duration > 100 ? 'poor' : 'good',
      delta: 0,
      id: `${name}-${Date.now()}`,
      navigationType: 'navigate',
      entries: [],
    } as Metric);

    return result;
  },

  // Monitor resource loading performance
  observeResourceTiming: () => {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;

          // Focus on large resources that might impact performance
          if (resource.transferSize > 100_000) {
            // > 100kb
            sendToAnalytics({
              name: 'LARGE_RESOURCE',
              value: resource.duration,
              rating: resource.duration > 1000 ? 'poor' : 'good',
              delta: 0,
              id: `resource-${Date.now()}`,
              navigationType: 'navigate',
              entries: [entry],
            } as Metric);
          }
        }
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (_e) {
        // Resource Timing API not supported
      }
    }
  },
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Start monitoring when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reportWebVitals);
  } else {
    reportWebVitals();
  }
}
