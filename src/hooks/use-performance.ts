"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage?: number;
}

export function usePerformanceMonitor(enabled = false) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef<number>();

  const measureFPS = useCallback(() => {
    frameCount.current++;
    const currentTime = performance.now();

    if (currentTime >= lastTime.current + 1000) {
      const fps = Math.round(
        (frameCount.current * 1000) / (currentTime - lastTime.current)
      );

      // Get memory usage if available
      let memoryUsage: number | undefined;
      if ("memory" in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        memoryUsage = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
      }

      setMetrics({
        fps,
        renderTime: Math.round(currentTime - lastTime.current),
        memoryUsage,
      });

      frameCount.current = 0;
      lastTime.current = currentTime;
    }

    if (enabled) {
      animationId.current = requestAnimationFrame(measureFPS);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      animationId.current = requestAnimationFrame(measureFPS);
    }

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [enabled, measureFPS]);

  return metrics;
}

// Hook for lazy loading images with intersection observer
export function useLazyLoad(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isIntersecting };
}

// Hook for optimizing heavy computations with memoization
export function useOptimizedComputation<T>(
  computeFn: () => T,
  deps: React.DependencyList
): T {
  const [result, setResult] = useState<T>(() => computeFn());
  const computationId = useRef(0);

  useEffect(() => {
    const id = ++computationId.current;

    // Run computation in next frame to avoid blocking UI
    requestAnimationFrame(() => {
      if (id === computationId.current) {
        setResult(computeFn());
      }
    });
  }, deps);

  return result;
}
