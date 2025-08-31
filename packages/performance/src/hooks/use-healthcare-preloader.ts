/**
 * Healthcare Preloader Hook
 * Intelligent preloading system based on user navigation patterns
 * and healthcare workflow priorities
 */

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { HealthcareDynamicLoader, HealthcarePriority } from '../lazy-loading/healthcare-dynamic-loader';

interface PreloaderOptions {
  enableIdleCallback?: boolean;
  emergencyThreshold?: number; // ms
  warmUpOnMount?: boolean;
}

interface PreloaderStats {
  preloadedComponents: number;
  loadedLibraries: number;
  averageLoadTime: number;
  failedLoads: number;
}

export const useHealthcarePreloader = (options: PreloaderOptions = {}) => {
  const {
    enableIdleCallback = true,
    emergencyThreshold = 200,
    warmUpOnMount = true,
  } = options;

  const router = useRouter();
  const statsRef = useRef<PreloaderStats>({
    preloadedComponents: 0,
    loadedLibraries: 0,
    averageLoadTime: 0,
    failedLoads: 0,
  });
  
  const loadTimes = useRef<number[]>([]);

  /**
   * Track loading performance for healthcare compliance
   */
  const trackLoadTime = useCallback((loadTime: number, priority: HealthcarePriority) => {
    loadTimes.current.push(loadTime);
    statsRef.current.averageLoadTime = 
      loadTimes.current.reduce((a, b) => a + b, 0) / loadTimes.current.length;

    // Alert if emergency components load too slowly
    if (priority === HealthcarePriority.EMERGENCY && loadTime > emergencyThreshold) {
      console.warn(`🚨 Emergency component exceeded threshold: ${loadTime}ms > ${emergencyThreshold}ms`);
    }
  }, [emergencyThreshold]);

  /**
   * Preload components based on current route
   */
  const preloadByCurrentRoute = useCallback(async () => {
    const currentPath = router.asPath;
    const startTime = performance.now();

    try {
      await HealthcareDynamicLoader.preloadByRoute(currentPath);
      const loadTime = performance.now() - startTime;
      
      // Determine priority based on route
      let priority = HealthcarePriority.STANDARD;
      if (currentPath.includes('/emergency')) {priority = HealthcarePriority.EMERGENCY;}
      else if (currentPath.includes('/urgent')) {priority = HealthcarePriority.URGENT;}
      else if (currentPath.includes('/admin')) {priority = HealthcarePriority.ADMINISTRATIVE;}

      trackLoadTime(loadTime, priority);
      statsRef.current.preloadedComponents++;
    } catch (error) {
      statsRef.current.failedLoads++;
      console.error('Healthcare preloading failed:', error);
    }
  }, [router.asPath, trackLoadTime]);

  /**
   * Predictive preloading based on user behavior
   */
  const predictivePreload = useCallback((targetRoute: string) => {
    // Emergency routes get highest priority
    if (targetRoute.includes('/emergency') || targetRoute.includes('/ambulance')) {
      HealthcareDynamicLoader.preloadByRoute('/emergency');
      return;
    }

    // Patient care routes
    if (targetRoute.includes('/patient') || targetRoute.includes('/vital')) {
      HealthcareDynamicLoader.preloadByRoute('/dashboard');
      return;
    }

    // Administrative routes load lazily
    if (targetRoute.includes('/admin') || targetRoute.includes('/report')) {
      // Only preload if user shows strong intent (e.g., multiple hovers)
      setTimeout(() => {
        HealthcareDynamicLoader.preloadByRoute('/admin');
      }, 1000);
    }
  }, []);

  /**
   * Emergency preloader - immediate loading of critical components
   */
  const preloadEmergency = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      await Promise.all([
        HealthcareDynamicLoader.preloadByRoute('/emergency'),
        import('@react-pdf/renderer'),
        import('html2canvas'),
      ]);

      const loadTime = performance.now() - startTime;
      trackLoadTime(loadTime, HealthcarePriority.EMERGENCY);
      
      console.log(`🚨 Emergency components preloaded in ${loadTime}ms`);
    } catch (error) {
      console.error('🚨 Emergency preloading failed:', error);
      statsRef.current.failedLoads++;
    }
  }, [trackLoadTime]);

  /**
   * Warm up healthcare libraries during idle time
   */
  const warmUpLibraries = useCallback(async () => {
    if (!enableIdleCallback || !('requestIdleCallback' in window)) {
      return HealthcareDynamicLoader.warmUpHealthcareLibraries();
    }

    return new Promise<void>((resolve) => {
      requestIdleCallback(async () => {
        const startTime = performance.now();
        
        try {
          await HealthcareDynamicLoader.warmUpHealthcareLibraries();
          const loadTime = performance.now() - startTime;
          
          statsRef.current.loadedLibraries++;
          console.log(`📚 Healthcare libraries warmed up in ${loadTime}ms`);
        } catch (error) {
          console.error('Library warm-up failed:', error);
          statsRef.current.failedLoads++;
        }
        
        resolve();
      });
    });
  }, [enableIdleCallback]);

  /**
   * Initialize preloading system
   */
  useEffect(() => {
    if (warmUpOnMount) {
      warmUpLibraries();
      preloadByCurrentRoute();
    }
  }, [warmUpOnMount, warmUpLibraries, preloadByCurrentRoute]);

  /**
   * Preload on route changes
   */
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      predictivePreload(url);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, predictivePreload]);

  /**
   * Get current performance statistics
   */
  const getStats = useCallback((): PreloaderStats => {
    return { ...statsRef.current };
  }, []);

  return {
    // Core preloading functions
    preloadByCurrentRoute,
    preloadEmergency,
    predictivePreload,
    warmUpLibraries,
    
    // Performance monitoring
    getStats,
    
    // Utility functions
    trackLoadTime,
    
    // Healthcare-specific preloaders
    preloadForPatientDashboard: () => HealthcareDynamicLoader.preloadByRoute('/dashboard'),
    preloadForEmergencyRoom: () => HealthcareDynamicLoader.preloadByRoute('/emergency'),
    preloadForAdmin: () => HealthcareDynamicLoader.preloadByRoute('/admin'),
  };
};