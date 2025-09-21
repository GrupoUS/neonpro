/**
 * Performance Optimization Utilities (T079)
 * Mobile-first performance optimization for healthcare applications
 *
 * Features:
 * - Mobile performance targets (<500ms load time)
 * - Search optimization (<300ms response)
 * - Image lazy loading and compression
 * - Bundle optimization and code splitting
 * - Brazilian healthcare context performance
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Performance monitoring interface
export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  searchResponseTime?: number;
  aiResponseTime?: number;
}

// Performance targets for healthcare applications
export const PERFORMANCE_TARGETS = {
  MOBILE_LOAD_TIME: 500, // ms - Brazilian mobile network optimization
  SEARCH_RESPONSE_TIME: 300, // ms - Patient search requirement
  AI_INSIGHTS_TIME: 2000, // ms - AI response requirement
  REAL_TIME_LATENCY: 1000, // ms - Real-time updates
  LARGEST_CONTENTFUL_PAINT: 2500, // ms - WCAG recommendation
  FIRST_INPUT_DELAY: 100, // ms - Accessibility requirement
  CUMULATIVE_LAYOUT_SHIFT: 0.1, // score - Visual stability
} as const;

// Performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Initialize performance monitoring
   * Sets up observers for Core Web Vitals and healthcare-specific metrics
   */
  initialize(): void {
    if (typeof window === 'undefined') return;

    // Monitor paint metrics
    this.observePaintMetrics();

    // Monitor layout shift
    this.observeLayoutShift();

    // Monitor first input delay
    this.observeFirstInputDelay();

    // Monitor largest contentful paint
    this.observeLargestContentfulPaint();

    console.info(
      '🚀 Performance monitoring initialized for healthcare application',
    );
  }

  /**
   * Measure and optimize component load time
   */
  measureComponentLoad(componentName: string, startTime: number): number {
    const endTime = performance.now();
    const loadTime = endTime - startTime;

    this.metrics.set(`component_${componentName}`, loadTime);

    // Log warning if load time exceeds mobile target
    if (loadTime > PERFORMANCE_TARGETS.MOBILE_LOAD_TIME) {
      console.warn(
        `⚡ Component ${componentName} load time: ${
          loadTime.toFixed(
            2,
          )
        }ms (target: ${PERFORMANCE_TARGETS.MOBILE_LOAD_TIME}ms)`,
      );
    }

    return loadTime;
  }

  /**
   * Optimize search performance with debouncing and caching
   */
  optimizeSearch<T>(
    searchFn: (query: string) => Promise<T>,
    debounceMs: number = 150,
  ): (query: string) => Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const cache = new Map<string, { data: T; timestamp: number }>();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    return (query: string): Promise<T> => {
      return new Promise((resolve, reject) => {
        // Clear previous timeout
        clearTimeout(timeoutId);

        // Check cache first
        const cached = cache.get(query);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          resolve(cached.data);
          return;
        }

        // Debounced search
        timeoutId = setTimeout(async () => {
          try {
            const startTime = performance.now();
            const result = await searchFn(query);
            const responseTime = performance.now() - startTime;

            // Cache result
            cache.set(query, { data: result, timestamp: Date.now() });

            // Monitor search performance
            this.metrics.set('search_response_time', responseTime);

            if (responseTime > PERFORMANCE_TARGETS.SEARCH_RESPONSE_TIME) {
              console.warn(
                `🔍 Search response time: ${
                  responseTime.toFixed(
                    2,
                  )
                }ms (target: ${PERFORMANCE_TARGETS.SEARCH_RESPONSE_TIME}ms)`,
              );
            }

            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, debounceMs);
      });
    };
  }

  /**
   * Lazy loading utility for images and components
   */
  createLazyLoader(
    options: IntersectionObserverInit = {},
  ): IntersectionObserver {
    if (typeof window === 'undefined') {
      // Return mock observer for SSR
      return {
        observe: () => {},
        unobserve: () => {},
        disconnect: () => {},
        root: null,
        rootMargin: '0px',
        thresholds: [0],
        takeRecords: () => [],
      } as IntersectionObserver;
    }

    return new IntersectionObserver(
      entries => {
        entries.forEach(_entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;

            // Load image
            if (element.tagName === 'IMG') {
              const img = element as HTMLImageElement;
              const src = img.dataset.src;
              if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                element.classList.remove('lazy');
              }
            }

            // Load component
            const lazyComponent = element.dataset.lazyComponent;
            if (lazyComponent) {
              element.dispatchEvent(
                new CustomEvent('lazy-load', {
                  detail: { component: lazyComponent },
                }),
              );
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      },
    );
  }

  /**
   * Optimize images for mobile devices
   */
  optimizeImage(
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
      lazy?: boolean;
    } = {},
  ): string {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      lazy = true,
    } = options;

    // Use responsive image service or CDN optimization
    let optimizedSrc = src;

    // Add responsive parameters
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);

    if (params.toString()) {
      optimizedSrc += (src.includes('?') ? '&' : '?') + params.toString();
    }

    return optimizedSrc;
  }

  /**
   * Bundle optimization utilities
   */
  static preloadModule(moduleUrl: string): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = moduleUrl;
    document.head.appendChild(link);
  }

  static preloadFont(fontUrl: string): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    if (typeof window === 'undefined') {
      return {
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timeToInteractive: 0,
      };
    }

    const navigation = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming;

    return {
      loadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      firstContentfulPaint: this.metrics.get('first-contentful-paint') || 0,
      largestContentfulPaint: this.metrics.get('largest-contentful-paint') || 0,
      cumulativeLayoutShift: this.metrics.get('cumulative-layout-shift') || 0,
      firstInputDelay: this.metrics.get('first-input-delay') || 0,
      timeToInteractive: this.metrics.get('time-to-interactive') || 0,
      searchResponseTime: this.metrics.get('search_response_time'),
      aiResponseTime: this.metrics.get('ai_response_time'),
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    metrics: PerformanceMetrics;
    recommendations: string[];
    score: number;
  } {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];
    let score = 100;

    // Check mobile load time
    if (metrics.loadTime > PERFORMANCE_TARGETS.MOBILE_LOAD_TIME) {
      recommendations.push(
        `Reduce mobile load time from ${
          metrics.loadTime.toFixed(
            2,
          )
        }ms to under ${PERFORMANCE_TARGETS.MOBILE_LOAD_TIME}ms`,
      );
      score -= 20;
    }

    // Check search response time
    if (
      metrics.searchResponseTime
      && metrics.searchResponseTime > PERFORMANCE_TARGETS.SEARCH_RESPONSE_TIME
    ) {
      recommendations.push(
        `Optimize search response time from ${
          metrics.searchResponseTime.toFixed(
            2,
          )
        }ms to under ${PERFORMANCE_TARGETS.SEARCH_RESPONSE_TIME}ms`,
      );
      score -= 15;
    }

    // Check AI response time
    if (
      metrics.aiResponseTime
      && metrics.aiResponseTime > PERFORMANCE_TARGETS.AI_INSIGHTS_TIME
    ) {
      recommendations.push(
        `Optimize AI insights response time from ${
          metrics.aiResponseTime.toFixed(
            2,
          )
        }ms to under ${PERFORMANCE_TARGETS.AI_INSIGHTS_TIME}ms`,
      );
      score -= 15;
    }

    // Check Core Web Vitals
    if (
      metrics.largestContentfulPaint
        > PERFORMANCE_TARGETS.LARGEST_CONTENTFUL_PAINT
    ) {
      recommendations.push(
        'Improve Largest Contentful Paint for better user experience',
      );
      score -= 10;
    }

    if (metrics.firstInputDelay > PERFORMANCE_TARGETS.FIRST_INPUT_DELAY) {
      recommendations.push('Reduce First Input Delay for better interactivity');
      score -= 10;
    }

    if (
      metrics.cumulativeLayoutShift
        > PERFORMANCE_TARGETS.CUMULATIVE_LAYOUT_SHIFT
    ) {
      recommendations.push(
        'Reduce Cumulative Layout Shift for visual stability',
      );
      score -= 10;
    }

    return {
      metrics,
      recommendations,
      score: Math.max(0, score),
    };
  }

  // Private methods for observers
  private observePaintMetrics(): void {
    try {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(_entry => {
          this.metrics.set(entry.name, entry.startTime);
        });
      });
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Paint metrics not supported');
    }
  }

  private observeLayoutShift(): void {
    try {
      const observer = new PerformanceObserver(list => {
        let clsValue = 0;
        list.getEntries().forEach((_entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.set('cumulative-layout-shift', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Layout shift metrics not supported');
    }
  }

  private observeFirstInputDelay(): void {
    try {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(_entry => {
          const processingStart = (entry as any).processingStart || entry.startTime;
          this.metrics.set(
            'first-input-delay',
            processingStart - entry.startTime,
          );
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('First input delay metrics not supported');
    }
  }

  private observeLargestContentfulPaint(): void {
    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('largest-contentful-paint', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Largest contentful paint metrics not supported');
    }
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(_observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Utility functions
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Mobile-first responsive utility for Brazilian healthcare
 */
export function createResponsiveBreakpoints() {
  return {
    mobile: '320px', // Minimum Brazilian smartphone
    tablet: '768px', // Brazilian tablet average
    desktop: '1024px', // Brazilian desktop average
    wide: '1440px', // Wide screen support
  };
}

/**
 * Debounce utility optimized for healthcare search
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 150,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle utility for real-time updates
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 100,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// PERFORMANCE_TARGETS already exported above
