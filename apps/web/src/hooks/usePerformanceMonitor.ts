/**
 * Performance Monitoring Hooks (FR-012)
 * Comprehensive performance measurement and optimization tools
 *
 * Performance Targets:
 * - Search response time: <300ms
 * - Mobile load time: <500ms
 * - Real-time latency: <1s
 *
 * Features:
 * - Response time validation and tracking
 * - Mobile performance optimization
 * - Real-time performance monitoring
 * - Performance bottleneck detection
 * - Brazilian healthcare context
 * - Accessibility compliance (WCAG 2.1 AA+)
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Performance metrics types
export interface PerformanceMetrics {
  searchResponseTime: number;
  mobileLoadTime: number;
  realTimeLatency: number;
  pageLoadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  bundleSize: number;
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  SEARCH_RESPONSE_TIME: 300, // ms
  MOBILE_LOAD_TIME: 500, // ms
  REAL_TIME_LATENCY: 1000, // ms
  PAGE_LOAD_TIME: 2000, // ms
  RENDER_TIME: 100, // ms
} as const;

// Performance status
export type PerformanceStatus = 'excellent' | 'good' | 'fair' | 'poor';

// Performance alert types
export interface PerformanceAlert {
  type: 'search' | 'mobile' | 'realtime' | 'general';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

/**
 * Main Performance Monitor Hook
 * Provides comprehensive performance tracking and monitoring
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    searchResponseTime: 0,
    mobileLoadTime: 0,
    realTimeLatency: 0,
    pageLoadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    bundleSize: 0,
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const metricsHistory = useRef<PerformanceMetrics[]>([]);
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Setup Performance Observer
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver(list => {
        const entries = list.getEntries();

        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            updateMetrics({
              pageLoadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              networkLatency: navEntry.responseStart - navEntry.requestStart,
            });
          }

          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              updateMetrics({
                renderTime: entry.startTime,
              });
            }
          }
        });
      });

      performanceObserver.current.observe({
        entryTypes: ['navigation', 'paint', 'measure'],
      });
    }

    // Monitor memory usage
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        updateMetrics({
          memoryUsage: memInfo.usedJSHeapSize / 1024 / 1024, // MB
        });
      }
    };

    const memoryInterval = setInterval(monitorMemory, 5000);

    return () => {
      performanceObserver.current?.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  // Update metrics and check thresholds
  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => {
      const updated = { ...prev, ...newMetrics };

      // Store in history
      metricsHistory.current.push(updated);
      if (metricsHistory.current.length > 100) {
        metricsHistory.current.shift();
      }

      // Check thresholds and create alerts
      checkPerformanceThresholds(updated, newMetrics);

      return updated;
    });
  }, []);

  // Check performance thresholds
  const checkPerformanceThresholds = useCallback((
    _metrics: PerformanceMetrics,
    newMetrics: Partial<PerformanceMetrics>,
  ) => {
    const newAlerts: PerformanceAlert[] = [];

    // Check search response time
    if (
      newMetrics.searchResponseTime
      && newMetrics.searchResponseTime > PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_TIME
    ) {
      newAlerts.push({
        type: 'search',
        severity: newMetrics.searchResponseTime > 500 ? 'error' : 'warning',
        message: `Busca lenta detectada: ${newMetrics.searchResponseTime}ms (meta: <300ms)`,
        value: newMetrics.searchResponseTime,
        threshold: PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_TIME,
        timestamp: Date.now(),
      });
    }

    // Check mobile load time
    if (
      newMetrics.mobileLoadTime
      && newMetrics.mobileLoadTime > PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME
    ) {
      newAlerts.push({
        type: 'mobile',
        severity: newMetrics.mobileLoadTime > 1000 ? 'error' : 'warning',
        message: `Carregamento móvel lento: ${newMetrics.mobileLoadTime}ms (meta: <500ms)`,
        value: newMetrics.mobileLoadTime,
        threshold: PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME,
        timestamp: Date.now(),
      });
    }

    // Check real-time latency
    if (
      newMetrics.realTimeLatency
      && newMetrics.realTimeLatency > PERFORMANCE_THRESHOLDS.REAL_TIME_LATENCY
    ) {
      newAlerts.push({
        type: 'realtime',
        severity: newMetrics.realTimeLatency > 2000 ? 'error' : 'warning',
        message: `Latência em tempo real alta: ${newMetrics.realTimeLatency}ms (meta: <1s)`,
        value: newMetrics.realTimeLatency,
        threshold: PERFORMANCE_THRESHOLDS.REAL_TIME_LATENCY,
        timestamp: Date.now(),
      });
    }

    // Add new alerts
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-20)); // Keep last 20 alerts

      // Show toast notifications for critical issues
      newAlerts.forEach(alert => {
        if (alert.severity === 'error' || alert.severity === 'critical') {
          toast.error(alert.message);
        } else if (alert.severity === 'warning') {
          toast.warning(alert.message);
        }
      });
    }
  }, []);

  // Get performance status
  const getPerformanceStatus = useCallback(
    (value: number, threshold: number): PerformanceStatus => {
      const ratio = value / threshold;
      if (ratio <= 0.5) return 'excellent';
      if (ratio <= 0.8) return 'good';
      if (ratio <= 1.0) return 'fair';
      return 'poor';
    },
    [],
  );

  // Get performance analytics
  const getAnalytics = useCallback(() => {
    if (metricsHistory.current.length === 0) return null;

    const history = metricsHistory.current;
    const latest = history[history.length - 1];

    return {
      current: latest,
      average: {
        searchResponseTime: history.reduce((sum, m) => sum + m.searchResponseTime, 0)
          / history.length,
        mobileLoadTime: history.reduce((sum, m) => sum + m.mobileLoadTime, 0) / history.length,
        realTimeLatency: history.reduce((sum, m) => sum + m.realTimeLatency, 0) / history.length,
      },
      trend: {
        searchResponseTime: getPerformanceStatus(
          latest.searchResponseTime,
          PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_TIME,
        ),
        mobileLoadTime: getPerformanceStatus(
          latest.mobileLoadTime,
          PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME,
        ),
        realTimeLatency: getPerformanceStatus(
          latest.realTimeLatency,
          PERFORMANCE_THRESHOLDS.REAL_TIME_LATENCY,
        ),
      },
      alerts: alerts.slice(-5), // Last 5 alerts
    };
  }, [metrics, alerts, getPerformanceStatus]);

  // Measure performance
  const measurePerformance = useCallback((
    operation: string,
    fn: () => Promise<any> | any,
  ) => {
    const startTime = performance.now();

    const finish = (result?: any) => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Update relevant metrics based on operation type
      if (operation.includes('search')) {
        updateMetrics({ searchResponseTime: duration });
      } else if (operation.includes('mobile') || operation.includes('load')) {
        updateMetrics({ mobileLoadTime: duration });
      } else if (operation.includes('realtime')) {
        updateMetrics({ realTimeLatency: duration });
      }

      return result;
    };

    try {
      const result = fn();

      if (result && typeof result.then === 'function') {
        return result.then(finish).catch((error: any) => {
          finish();
          throw error;
        });
      } else {
        return finish(result);
      }
    } catch (error) {
      finish();
      throw error;
    }
  }, [updateMetrics]);

  return {
    metrics,
    alerts,
    updateMetrics,
    measurePerformance,
    getAnalytics,
    getPerformanceStatus,
    isHealthy: metrics.searchResponseTime < PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_TIME
      && metrics.mobileLoadTime < PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME
      && metrics.realTimeLatency < PERFORMANCE_THRESHOLDS.REAL_TIME_LATENCY,
  };
}

/**
 * Search Performance Hook
 * Specialized hook for tracking search performance
 */
export function useSearchPerformance() {
  const { measurePerformance, metrics, getPerformanceStatus } = usePerformanceMonitor();

  const measureSearch = useCallback(async (searchFn: () => Promise<any>) => {
    return measurePerformance('search', searchFn);
  }, [measurePerformance]);

  const getSearchStatus = useCallback(() => {
    return getPerformanceStatus(
      metrics.searchResponseTime,
      PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_TIME,
    );
  }, [metrics.searchResponseTime, getPerformanceStatus]);

  return {
    measureSearch,
    searchResponseTime: metrics.searchResponseTime,
    searchStatus: getSearchStatus(),
    isSearchHealthy: metrics.searchResponseTime < PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_TIME,
  };
}

/**
 * Mobile Performance Hook
 * Specialized hook for mobile performance optimization
 */
export function useMobilePerformance() {
  const { measurePerformance, metrics, getPerformanceStatus } = usePerformanceMonitor();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const measureMobileLoad = useCallback(async (loadFn: () => Promise<any>) => {
    return measurePerformance('mobile-load', loadFn);
  }, [measurePerformance]);

  const getMobileStatus = useCallback(() => {
    return getPerformanceStatus(metrics.mobileLoadTime, PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME);
  }, [metrics.mobileLoadTime, getPerformanceStatus]);

  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.mobileLoadTime > PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME) {
      recommendations.push('Considere implementar lazy loading para componentes não críticos');
      recommendations.push('Otimize imagens e recursos para dispositivos móveis');
    }

    if (metrics.bundleSize > 1000) { // 1MB
      recommendations.push('Reduza o tamanho do bundle com code splitting');
    }

    if (metrics.memoryUsage > 50) { // 50MB
      recommendations.push('Otimize o uso de memória removendo vazamentos');
    }

    return recommendations;
  }, [metrics]);

  return {
    isMobile,
    measureMobileLoad,
    mobileLoadTime: metrics.mobileLoadTime,
    mobileStatus: getMobileStatus(),
    isMobileHealthy: metrics.mobileLoadTime < PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME,
    recommendations: getRecommendations(),
  };
}
