/**
 * NeonPro Performance Monitor
 * Real-time performance tracking and Web Vitals monitoring
 */

"use client";

import type { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } from "web-vitals";
import type { useEffect } from "react";

// Performance thresholds based on Google's recommendations
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// Performance analytics endpoint
const ANALYTICS_ENDPOINT = "/api/analytics/performance";

/**
 * Send performance metrics to analytics
 */
function sendMetrics(name: string, delta: number, value: number, rating: string) {
  const metric = {
    name,
    delta,
    value,
    rating,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  // Send to analytics service
  if (typeof window !== "undefined" && "navigator" in window && "sendBeacon" in navigator) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify(metric));
  } else {
    // Fallback to fetch
    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metric),
      keepalive: true,
    }).catch(console.error);
  }

  // Development logging
  if (process.env.NODE_ENV === "development") {
    console.group(`🎯 Web Vital: ${name}`);
    console.log(`Value: ${value}ms`);
    console.log(`Delta: ${delta}ms`);
    console.log(`Rating: ${rating}`);
    console.log(`URL: ${window.location.href}`);
    console.groupEnd();
  }
}

/**
 * Get or create session ID for tracking
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = sessionStorage.getItem("neonpro-session-id");
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("neonpro-session-id", sessionId);
  }
  return sessionId;
}

/**
 * Performance Monitor Component
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Largest Contentful Paint
    onLCP((metric) => {
      const threshold = PERFORMANCE_THRESHOLDS.LCP;
      const rating =
        metric.value <= threshold.good
          ? "good"
          : metric.value <= threshold.poor
            ? "needs-improvement"
            : "poor";

      sendMetrics("LCP", metric.delta, metric.value, rating);
    });

    // First Input Delay (legacy, replaced by INP)
    onFID((metric) => {
      const threshold = PERFORMANCE_THRESHOLDS.FID;
      const rating =
        metric.value <= threshold.good
          ? "good"
          : metric.value <= threshold.poor
            ? "needs-improvement"
            : "poor";

      sendMetrics("FID", metric.delta, metric.value, rating);
    });

    // Interaction to Next Paint (new Core Web Vital)
    onINP((metric) => {
      const threshold = PERFORMANCE_THRESHOLDS.INP;
      const rating =
        metric.value <= threshold.good
          ? "good"
          : metric.value <= threshold.poor
            ? "needs-improvement"
            : "poor";

      sendMetrics("INP", metric.delta, metric.value, rating);
    });

    // Cumulative Layout Shift
    onCLS((metric) => {
      const threshold = PERFORMANCE_THRESHOLDS.CLS;
      const rating =
        metric.value <= threshold.good
          ? "good"
          : metric.value <= threshold.poor
            ? "needs-improvement"
            : "poor";

      sendMetrics("CLS", metric.delta, metric.value, rating);
    });

    // First Contentful Paint
    onFCP((metric) => {
      const threshold = PERFORMANCE_THRESHOLDS.FCP;
      const rating =
        metric.value <= threshold.good
          ? "good"
          : metric.value <= threshold.poor
            ? "needs-improvement"
            : "poor";

      sendMetrics("FCP", metric.delta, metric.value, rating);
    });

    // Time to First Byte
    onTTFB((metric) => {
      const threshold = PERFORMANCE_THRESHOLDS.TTFB;
      const rating =
        metric.value <= threshold.good
          ? "good"
          : metric.value <= threshold.poor
            ? "needs-improvement"
            : "poor";

      sendMetrics("TTFB", metric.delta, metric.value, rating);
    });
  }, []);

  // Component renders nothing - it's just for side effects
  return null;
}

/**
 * Custom hook for performance monitoring
 */
export function usePerformanceMonitor() {
  useEffect(() => {
    // Custom performance marks
    const markNavigation = () => {
      if (typeof window !== "undefined" && "performance" in window) {
        performance.mark("navigation-start");
      }
    };

    const markInteraction = (event: Event) => {
      if (typeof window !== "undefined" && "performance" in window) {
        performance.mark(`interaction-${event.type}`);
      }
    };

    // Mark navigation start
    markNavigation();

    // Listen for user interactions
    const events = ["click", "scroll", "keydown", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, markInteraction, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, markInteraction);
      });
    };
  }, []);
}

/**
 * Performance debugging utilities for development
 */
export const PerformanceDebug = {
  /**
   * Get all performance entries
   */
  getAllEntries: () => {
    if (typeof window === "undefined" || !("performance" in window)) return [];
    return performance.getEntries();
  },

  /**
   * Get navigation timing
   */
  getNavigationTiming: () => {
    if (typeof window === "undefined" || !("performance" in window)) return null;
    return performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  },

  /**
   * Get resource timing
   */
  getResourceTiming: () => {
    if (typeof window === "undefined" || !("performance" in window)) return [];
    return performance.getEntriesByType("resource");
  },

  /**
   * Measure time between two marks
   */
  measureTime: (startMark: string, endMark: string, measureName: string) => {
    if (typeof window === "undefined" || !("performance" in window)) return null;

    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      return measure.duration;
    } catch (error) {
      console.warn("Performance measurement failed:", error);
      return null;
    }
  },

  /**
   * Clear all performance entries
   */
  clearEntries: () => {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.clearMarks();
      performance.clearMeasures();
      performance.clearResourceTimings();
    }
  },

  /**
   * Log performance summary
   */
  logSummary: () => {
    const navigation = PerformanceDebug.getNavigationTiming();
    if (!navigation) return;

    console.group("🚀 NeonPro Performance Summary");
    console.log(`DNS Lookup: ${navigation.domainLookupEnd - navigation.domainLookupStart}ms`);
    console.log(`TCP Connection: ${navigation.connectEnd - navigation.connectStart}ms`);
    console.log(`Server Response: ${navigation.responseEnd - navigation.requestStart}ms`);
    console.log(
      `DOM Processing: ${navigation.domContentLoadedEventEnd - navigation.responseEnd}ms`,
    );
    console.log(`Total Load Time: ${navigation.loadEventEnd - navigation.navigationStart}ms`);
    console.groupEnd();
  },
};
