'use client';

import { useEffect } from 'react';

export function WebVitalsReporter() {
  useEffect(() => {
    const reportWebVitals = (metric: any) => {
      // Healthcare-compliant performance monitoring
      const { name, value, id, label } = metric;

      // Only log in development or with explicit consent
      if (
        process.env.NODE_ENV === 'development' ||
        window.localStorage.getItem('performance-consent') === 'true'
      ) {
        console.log(`[WebVitals] ${name}:`, {
          value: Math.round(value),
          id,
          label,
          timestamp: Date.now(),
        });

        // Send to monitoring service (if available)
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', name, {
            value: Math.round(value),
            event_label: id,
            custom_parameter_1: label === 'web-vital',
          });
        }
      }
    };

    // Dynamic import for Next.js web vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    });
  }, []);

  return null;
}

// Performance monitoring hook for healthcare applications
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor healthcare-specific metrics
    const startTime = performance.now();

    return () => {
      const loadTime = performance.now() - startTime;

      // Healthcare compliance: only track with consent
      if (window.localStorage.getItem('performance-consent') === 'true') {
        console.log(
          `[Healthcare Performance] Component load time: ${Math.round(loadTime)}ms`
        );
      }
    };
  }, []);
}

// LGPD-compliant performance consent
export function requestPerformanceConsent() {
  const hasConsent = window.localStorage.getItem('performance-consent');

  if (!hasConsent) {
    const consent = window.confirm(
      'Para melhorar a performance do sistema de saúde, podemos coletar métricas de performance não identificadas. Aceita?'
    );

    window.localStorage.setItem(
      'performance-consent',
      consent ? 'true' : 'false'
    );
    return consent;
  }

  return hasConsent === 'true';
}
