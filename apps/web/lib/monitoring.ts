/**
 * Performance Monitoring and Analytics for NeonPro
 * Vercel Analytics & Speed Insights Integration
 */

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Performance Monitoring Components
 * Includes Vercel Analytics and Speed Insights
 */
export function PerformanceMonitoring() {
  return (
    <>
      {process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" && <Analytics />}
      {process.env.NEXT_PUBLIC_ENABLE_MONITORING === "true" && <SpeedInsights />}
    </>
  );
}

/**
 * Web Vitals Tracking
 * Reports Core Web Vitals to analytics service
 */
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: unknown[];
}) {
  if (process.env.NODE_ENV === "production") {
    // Console log for debugging (remove in production)
    console.log("Web Vitals:", {
      name: metric.name,
      value: metric.value,
      id: metric.id,
    });

    // Send to analytics service
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", metric.name, {
        event_category: "Web Vitals",
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Send to Vercel Analytics
    if (typeof window !== "undefined" && (window as unknown).va) {
      (window as unknown).va("track", "Web Vitals", {
        metric: metric.name,
        value: metric.value,
        id: metric.id,
      });
    }
  }
}

/**
 * Custom Performance Tracker for Healthcare Actions
 */
export class HealthcarePerformanceTracker {
  private static instance: HealthcarePerformanceTracker;

  static getInstance(): HealthcarePerformanceTracker {
    if (!HealthcarePerformanceTracker.instance) {
      HealthcarePerformanceTracker.instance = new HealthcarePerformanceTracker();
    }
    return HealthcarePerformanceTracker.instance;
  }

  trackPatientAction(action: string, duration?: number) {
    this.trackEvent("patient_action", {
      action,
      duration,
      timestamp: Date.now(),
    });
  }

  trackAppointmentAction(action: string, duration?: number) {
    this.trackEvent("appointment_action", {
      action,
      duration,
      timestamp: Date.now(),
    });
  }

  trackDashboardLoad(loadTime: number) {
    this.trackEvent("dashboard_load", {
      loadTime,
      timestamp: Date.now(),
    });
  }

  private trackEvent(eventName: string, data: unknown) {
    if (process.env.NODE_ENV === "production") {
      // Send to Vercel Analytics
      if (typeof window !== "undefined" && (window as unknown).va) {
        (window as unknown).va("track", eventName, data);
      }

      // Console log for debugging
      console.log("Healthcare Performance:", eventName, data);
    }
  }
}

/**
 * Performance Timing Hook
 */
export function usePerformanceTiming() {
  const startTiming = (label: string) => {
    if (typeof window !== "undefined") {
      performance.mark(`${label}_start`);
    }
  };

  const endTiming = (label: string) => {
    if (typeof window !== "undefined") {
      try {
        performance.mark(`${label}_end`);
        performance.measure(label, `${label}_start`, `${label}_end`);

        const measure = performance.getEntriesByName(label)[0];
        if (measure && process.env.NODE_ENV === "development") {
          console.log(`Performance: ${label} took ${measure.duration}ms`);
        }

        return measure?.duration;
      } catch (error) {
        console.warn("Performance timing error:", error);
      }
    }
    return 0;
  };

  return { startTiming, endTiming };
}

// Global type declarations
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
