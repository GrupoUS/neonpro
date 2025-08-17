/**
 * Performance Optimization Hooks for React Components
 *
 * Advanced React 19 and Next.js 15 performance optimization utilities
 * Based on 2025 performance best practices
 */

import {
  type DependencyList,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// Performance thresholds for monitoring
const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_WARNING: 16, // 60fps = 16.67ms per frame
  RENDER_TIME_ERROR: 33, // 30fps = 33.33ms per frame
  MEMORY_USAGE_WARNING: 50 * 1024 * 1024, // 50MB
  INTERACTION_TIME_WARNING: 100, // 100ms for good UX
} as const;

// Enhanced useCallback with performance monitoring
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  _debugName?: string
): T {
  const performanceRef = useRef<{
    callCount: number;
    totalTime: number;
    lastCall: number;
  }>({
    callCount: 0,
    totalTime: 0,
    lastCall: 0,
  });

  return useCallback((...args: Parameters<T>) => {
    const start = performance.now();
    const result = callback(...args);

    // Track performance metrics
    const duration = performance.now() - start;
    performanceRef.current.callCount++;
    performanceRef.current.totalTime += duration;
    performanceRef.current.lastCall = duration;

    // Warn about slow callbacks in development
    if (
      process.env.NODE_ENV === 'development' &&
      duration > PERFORMANCE_THRESHOLDS.INTERACTION_TIME_WARNING
    ) {
    }

    return result;
  }, deps) as T;
}

// Enhanced useMemo with performance monitoring
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: DependencyList,
  _debugName?: string
): T {
  const performanceRef = useRef<{
    computeCount: number;
    totalTime: number;
    lastCompute: number;
  }>({
    computeCount: 0,
    totalTime: 0,
    lastCompute: 0,
  });

  return useMemo(() => {
    const start = performance.now();
    const result = factory();

    // Track performance metrics
    const duration = performance.now() - start;
    performanceRef.current.computeCount++;
    performanceRef.current.totalTime += duration;
    performanceRef.current.lastCompute = duration;

    // Warn about expensive computations in development
    if (
      process.env.NODE_ENV === 'development' &&
      duration > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING
    ) {
    }

    return result;
  }, deps);
}

// Component render performance monitor
export function useRenderPerformance(_componentName: string) {
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const totalRenderTimeRef = useRef<number>(0);

  // Mark render start
  renderStartRef.current = performance.now();
  renderCountRef.current++;

  useEffect(() => {
    // Mark render end
    const renderTime = performance.now() - renderStartRef.current;
    totalRenderTimeRef.current += renderTime;

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      const _avgRenderTime = totalRenderTimeRef.current / renderCountRef.current;

      if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_ERROR) {
      } else if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING) {
      }
    }
  });

  return {
    renderCount: renderCountRef.current,
    averageRenderTime: totalRenderTimeRef.current / renderCountRef.current,
  };
}

// Debounced state with startTransition for better UX
export function useDebouncedState<T>(initialValue: T, delay = 300): [T, T, (value: T) => void] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setValue = useCallback(
    (value: T) => {
      // Update immediate value for UI responsiveness
      setImmediateValue(value);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set debounced value with transition
      timeoutRef.current = setTimeout(() => {
        startTransition(() => {
          setDebouncedValue(value);
        });
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [immediateValue, debouncedValue, setValue];
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling<T>(items: T[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, items.length);

    return { start: Math.max(0, start - 1), end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      style: {
        position: 'absolute' as const,
        top: (visibleRange.start + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useOptimizedCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    },
    [],
    'virtualScrolling'
  );

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange,
  };
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(options: IntersectionObserverInit = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      const intersecting = entry.isIntersecting;
      setIsIntersecting(intersecting);

      if (intersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}

// Memory usage monitor hook
export function useMemoryMonitor(_componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;

        if (used > PERFORMANCE_THRESHOLDS.MEMORY_USAGE_WARNING) {
        }

        return { used, total, percentage: (used / total) * 100 };
      };

      const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, []);
}

// Optimized chart data processor for analytics
export function useOptimizedChartData<T>(
  rawData: T[],
  processor: (data: T[]) => any,
  deps: DependencyList
) {
  return useOptimizedMemo(
    () => {
      if (!rawData || rawData.length === 0) {
        return [];
      }

      // Batch process large datasets
      if (rawData.length > 1000) {
        const batchSize = 100;
        const batches = [];

        for (let i = 0; i < rawData.length; i += batchSize) {
          batches.push(rawData.slice(i, i + batchSize));
        }

        return batches.reduce((acc, batch) => {
          return [...acc, ...processor(batch)];
        }, []);
      }

      return processor(rawData);
    },
    [rawData, ...deps],
    'chartDataProcessor'
  );
}

// Preload resources hook
export function usePreloadResources(resources: string[]) {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';

      // Determine resource type
      if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.match(/\.(woff|woff2|ttf|otf)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif|svg)$/)) {
        link.as = 'image';
      }

      link.href = resource;
      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources]);
}

// Performance profiler hook for development
export function usePerformanceProfiler(
  name: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const marksRef = useRef<{ [key: string]: number }>({});

  const mark = useCallback(
    (markName: string) => {
      if (!enabled) {
        return;
      }

      const fullName = `${name}-${markName}`;
      performance.mark(fullName);
      marksRef.current[markName] = performance.now();
    },
    [name, enabled]
  );

  const measure = useCallback(
    (startMark: string, endMark: string) => {
      if (!enabled) {
        return;
      }

      const startName = `${name}-${startMark}`;
      const endName = `${name}-${endMark}`;

      try {
        performance.measure(`${name}-${startMark}-to-${endMark}`, startName, endName);

        const duration = marksRef.current[endMark] - marksRef.current[startMark];

        return duration;
      } catch (_error) {}
    },
    [name, enabled]
  );

  return { mark, measure };
}
