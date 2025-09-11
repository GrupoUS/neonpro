import { useEffect, useRef } from 'react';
import { performanceMonitor } from '../lib/performance';

export function usePerformance(componentName: string) {
  const mountTime = useRef<number>();
  const renderCount = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    return () => {
      if (mountTime.current) {
        const mountDuration = performance.now() - mountTime.current;
        (performanceMonitor as any).handleCustomMetric(
          `${componentName}-mount-time`,
          mountDuration
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
    return (fn: () => Promise<any>) => {
      return async (...args: any[]) => {
        const start = performance.now();
        try {
          const result = await fn.apply(this, args);
          const end = performance.now();
          (performanceMonitor as any).handleCustomMetric(
            `${componentName}-${operationName}`,
            end - start
          );
          return result;
        } catch (error) {
          const end = performance.now();
          (performanceMonitor as any).handleCustomMetric(
            `${componentName}-${operationName}-error`,
            end - start
          );
          throw error;
        }
      };
    };
  };

  return {
    measureAsyncOperation,
    getRenderCount: () => renderCount.current
  };
}