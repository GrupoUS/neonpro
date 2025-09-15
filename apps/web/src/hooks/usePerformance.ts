import { useEffect, useRef } from 'react';
// Temporary stub during type sweep; replace with real impl when available
export const performanceMonitor = {
  mark: (_label: string) => {},
  measure: (_name: string, _start: string, _end: string) => {},
};

export function usePerformance(componentName: string) { // componentName required
  const mountTime = useRef<number | null>(null);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    return () => {
      if (typeof mountTime.current === 'number') {
        const mountDuration = performance.now() - mountTime.current;
        (performanceMonitor as any).handleCustomMetric(
          `${componentName}-mount-time`,
          mountDuration,
        );
      }
    };
  }, [componentName]);

  useEffect(() => {
    renderCount.current += 1;
    if (renderCount.current > 1) {
      performance.mark(`${componentName}-render-${renderCount.current}`);
    }
  });

  const measureAsyncOperation = (operationName: string) => {
    return <T extends (...args: any[]) => Promise<any>>(fn: T) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const start = performance.now();
        try {
          const result = await fn(...args);
          const end = performance.now();
          (performanceMonitor as any).handleCustomMetric(
            `${componentName}-${operationName}`,
            end - start,
          );
          return result as ReturnType<T>;
        } catch (error) {
          const end = performance.now();
          (performanceMonitor as any).handleCustomMetric(
            `${componentName}-${operationName}-error`,
            end - start,
          );
          throw error;
        }
      };
    };
  };

  return {
    measureAsyncOperation,
    getRenderCount: () => renderCount.current,
  };
}
