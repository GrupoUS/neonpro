/**
 * Healthcare Dynamic Loader
 * Intelligent preloading system for healthcare applications
 * Prioritizes emergency components over administrative features
 */

import type { ComponentType, LazyExoticComponent } from 'react';
import React, { lazy } from 'react';

// Priority levels for healthcare components
export enum HealthcarePriority {
  EMERGENCY = 'emergency',     // <200ms - Critical medical situations
  URGENT = 'urgent',          // <500ms - Patient care
  STANDARD = 'standard',      // <1s - General healthcare operations
  ADMINISTRATIVE = 'admin',   // <2s - Non-critical admin functions
}

// Preloading strategy configuration
interface LoaderConfig {
  priority: HealthcarePriority;
  preload?: boolean;
  retryAttempts?: number;
  timeout?: number;
}

// Emergency component registry
const EMERGENCY_COMPONENTS = new Set([
  'emergency-dashboard',
  'patient-vitals',
  'ambulance-tracker',
  'urgent-alerts',
  'medical-emergency-form',
]);

// Heavy library loaders with intelligent chunking
export class HealthcareDynamicLoader {
  private static preloadedComponents = new Map<string, Promise<any>>();
  private static loadedLibraries = new Map<string, any>();

  /**
   * Lazy load React PDF components for medical reports
   */
  static loadPDFGenerator() {
    return lazy(async () => {
    try {
      const [pdfRenderer, jsPdf] = await Promise.all([
        import('@react-pdf/renderer'),
        import('jspdf')
      ]);

      return {
        default: {
          PDFDocument: pdfRenderer.Document,
          PDFPage: pdfRenderer.Page,
          PDFView: pdfRenderer.View,
          PDFText: pdfRenderer.Text,
          PDFDownloadLink: pdfRenderer.PDFDownloadLink,
          jsPDF: jsPdf.default,
        }
      };
    } catch (error) {
      console.error('PDF libraries failed to load:', error);
      return {
        default: {
          PDFDocument: ({ children }: { children?: React.ReactNode }) => React.createElement('div', { className: 'pdf-unavailable' }, 'PDF functionality unavailable'),
          PDFPage: ({ children }: { children?: React.ReactNode }) => React.createElement('div', { className: 'pdf-page' }, children),
          PDFView: ({ children }: { children?: React.ReactNode }) => React.createElement('div', { className: 'pdf-view' }, children),
          PDFText: ({ children }: { children?: React.ReactNode }) => React.createElement('span', { className: 'pdf-text' }, children),
          PDFDownloadLink: ({ children }: { children?: React.ReactNode }) => React.createElement('button', { disabled: true, className: 'pdf-download-disabled' }, 'PDF Download unavailable'),
          jsPDF: undefined,
        }
      };
    });
  }

  /**
   * Lazy load Chart components for healthcare analytics
   */
  static loadChartsLibrary() {
    return lazy(async () => {
    const recharts = await import('recharts');

    return {
      default: {
        LineChart: recharts.LineChart,
        BarChart: recharts.BarChart,
        PieChart: recharts.PieChart,
        XAxis: recharts.XAxis,
        YAxis: recharts.YAxis,
        CartesianGrid: recharts.CartesianGrid,
        Tooltip: recharts.Tooltip,
        Legend: recharts.Legend,
        ResponsiveContainer: recharts.ResponsiveContainer,
      }
    };
    });
  }

  /**
   * Lazy load animation library for UI feedback
   */
  static loadAnimationLibrary() {
    return lazy(async () => {
    const framerMotion = await import('framer-motion');

    return {
      default: {
        motion: framerMotion.motion,
        AnimatePresence: framerMotion.AnimatePresence,
        useAnimation: framerMotion.useAnimation,
        useInView: framerMotion.useInView,
      }
    };
    });
  }

  /**
   * Lazy load HTML2Canvas for medical screenshots
   */
  static loadScreenshotLibrary() {
    return lazy(async () => {
    const html2canvas = await import('html2canvas');

    return {
      default: html2canvas.default
    };
    });
  }

  /**
   * Preload PDF libraries - returns the actual import promise
   */
  static preloadPDFGenerator = (): Promise<any> => {
    return Promise.all([
      import('@react-pdf/renderer'),
      import('jspdf')
    ]);
  };

  /**
   * Preload screenshot library - returns the actual import promise
   */
  static preloadScreenshotLibrary = (): Promise<any> => {
    return import('html2canvas');
  };

  /**
   * Preload charts library - returns the actual import promise
   */
  static preloadChartsLibrary = (): Promise<any> => {
    return import('recharts');
  };

  /**
   * Preload animation library - returns the actual import promise
   */
  static preloadAnimationLibrary = (): Promise<any> => {
    return import('framer-motion');
  };

  /**
   * Preload critical healthcare components based on route
   */
  static preloadByRoute = async (route: string): Promise<void> => {
    const preloadPromises: Promise<any>[] = [];

    // Emergency routes - preload immediately
    if (route.includes('/emergency') || route.includes('/ambulance')) {
      preloadPromises.push(
        HealthcareDynamicLoader.preloadPDFGenerator(),
        HealthcareDynamicLoader.preloadScreenshotLibrary()
      );
    }

    // Patient dashboard - preload charts and animations
    else if (route.includes('/dashboard') || route.includes('/patient')) {
      preloadPromises.push(
        HealthcareDynamicLoader.preloadChartsLibrary(),
        HealthcareDynamicLoader.preloadAnimationLibrary()
      );
    }

    // Administrative routes - lazy load everything
    else if (route.includes('/admin') || route.includes('/reports')) {
      // Defer loading until user interaction
      return;
    }

    // Execute preloading
    if (preloadPromises.length > 0) {
      try {
        await Promise.allSettled(preloadPromises);
      } catch (error) {
        console.warn('Healthcare preloading failed:', error);
      }
    }
  };

  /**
   * Intelligent component loader with healthcare priorities
   */
  static createHealthcareComponent = <T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    config: LoaderConfig
  ): LazyExoticComponent<T> => {
    const componentKey = importFn.toString();

    // Emergency components get immediate priority
    if (config.priority === HealthcarePriority.EMERGENCY) {
      if (!this.preloadedComponents.has(componentKey)) {
        this.preloadedComponents.set(componentKey, importFn());
      }
    }

    return lazy(async () => {
      const startTime = performance.now();

      try {
        // Use preloaded component if available
        const preloaded = this.preloadedComponents.get(componentKey);
        const result = preloaded ? await preloaded : await importFn();

        const loadTime = performance.now() - startTime;

        // Performance monitoring for healthcare compliance
        if (config.priority === HealthcarePriority.EMERGENCY && loadTime > 200) {
          console.warn(`Emergency component loaded slowly: ${loadTime}ms`);
        }

        return result;
      } catch (error) {
        console.error(`Failed to load healthcare component:`, error);
        throw error;
      }
    });
  };

  /**
   * Preload emergency healthcare components during idle time
   */
  static preloadEmergencyComponents = (): void => {
    const executePreload = () => {
      // Preload PDF generation for emergency medical reports
      this.preloadedComponents.set('pdf',
        Promise.all([
          import('@react-pdf/renderer'),
          import('jspdf')
        ]).then(([pdfRenderer, jsPdf]) => ({
          pdfRenderer: pdfRenderer.default || pdfRenderer,
          jsPdf: jsPdf.default || jsPdf
        }))
      );

      // Preload screenshot capability for medical documentation
      this.preloadedComponents.set('screenshot',
        import('html2canvas').then(module => module.default || module)
      );

      // Preload TensorFlow.js for medical AI features
      this.preloadedComponents.set('tensorflow',
        import('@neonpro/ai/ml').then(
          module => module.TensorFlowLazyLoader || module.default
        ).catch(error => {
          console.warn('TensorFlow AI module not available:', error);
          return null;
        })
      );
    };

    // Use requestIdleCallback if available, otherwise use setTimeout as fallback
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(executePreload);
    } else {
      setTimeout(executePreload, 200);
    }
  };

  /**
   * Warm up critical healthcare libraries
   */
  static warmUpHealthcareLibraries = async (): Promise<void> => {
    const criticalLibraries = [
      'date-fns/format',
      'date-fns/parseISO',
      'zod',
      '@supabase/supabase-js',
    ];

    const warmUpPromises = criticalLibraries.map(async (lib) => {
      try {
        await import(lib);
        this.loadedLibraries.set(lib, true);
      } catch (error) {
        console.warn(`Failed to warm up library: ${lib}`, error);
      }
    });

    await Promise.allSettled(warmUpPromises);
  };
}



// Export lazy-loaded components ready for healthcare use
export const LazyPDFGenerator = HealthcareDynamicLoader.loadPDFGenerator;
export const LazyHealthcareCharts = HealthcareDynamicLoader.loadChartsLibrary;
export const LazyAnimations = HealthcareDynamicLoader.loadAnimationLibrary;
export const LazyScreenshot = HealthcareDynamicLoader.loadScreenshotLibrary;
