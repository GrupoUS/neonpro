"use client";

import { useEffect } from "react";

export function WebVitalsReporter() {
  useEffect(() => {
    const reportWebVitals = (metric: unknown) => {
      // Healthcare-compliant performance monitoring
      const { name, value, id, label } = metric;

      // Only log in development or with explicit consent
      if (
        process.env.NODE_ENV === "development"
        || window.localStorage.getItem("performance-consent") === "true"
      ) {
        // Send to monitoring service (if available)
        if (typeof window !== "undefined" && "gtag" in window) {
          (window as unknown).gtag("event", name, {
            value: Math.round(value),
            event_label: id,
            custom_parameter_1: label === "web-vital",
          });
        }
      }
    };

    // Dynamic import for Next.js web vitals
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    });
  }, []);

  return;
}

// Performance monitoring hook for healthcare applications
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor healthcare-specific metrics
    const startTime = performance.now();

    return () => {
      // Healthcare compliance: only track with consent
      if (window.localStorage.getItem("performance-consent") === "true") {
      }
    };
  }, []);
}

// LGPD-compliant performance consent
export function requestPerformanceConsent() {
  const hasConsent = window.localStorage.getItem("performance-consent");

  if (!hasConsent) {
    // Note: Performance consent should be handled at component level using ConfirmationDialog
    // for LGPD compliance and accessibility (WCAG 2.1 AA+)
    console.warn(
      "Performance consent should be requested using ConfirmationDialog component for LGPD compliance and accessibility.",
    );

    // Default to denied until proper consent is implemented
    window.localStorage.setItem("performance-consent", "false");
    return false;
  }

  return hasConsent === "true";
}
