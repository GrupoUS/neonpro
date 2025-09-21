import { useCallback, useEffect, useState } from 'react';

export interface ResourceTimingEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  initiatorType: string;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
}

export interface UseResourceTimingReturn {
  resources: ResourceTimingEntry[];
  getResourceByName: (name: string) => ResourceTimingEntry | undefined;
  getResourcesByType: (type: string) => ResourceTimingEntry[];
  clearResources: () => void;
  isSupported: boolean;
}

export function useResourceTiming(): UseResourceTimingReturn {
  const [resources, setResources] = useState<ResourceTimingEntry[]>([]);
  const [isSupported] = useState(() =>
    'performance' in window && 'getEntriesByType' in performance
  );

  const updateResources = useCallback(() => {
    if (!isSupported) return;

    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const formattedEntries: ResourceTimingEntry[] = entries.map(entry => ({
      name: entry.name,
      entryType: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      initiatorType: entry.initiatorType,
      fetchStart: entry.fetchStart,
      domainLookupStart: entry.domainLookupStart,
      domainLookupEnd: entry.domainLookupEnd,
      connectStart: entry.connectStart,
      connectEnd: entry.connectEnd,
      requestStart: entry.requestStart,
      responseStart: entry.responseStart,
      responseEnd: entry.responseEnd,
    }));

    setResources(formattedEntries);
  }, [isSupported]);

  const getResourceByName = useCallback((_name: any) => {
    return resources.find(resource => resource.name === name);
  }, [resources]);

  const getResourcesByType = useCallback((_type: any) => {
    return resources.filter(resource => resource.initiatorType === type);
  }, [resources]);

  const clearResources = useCallback(() => {
    if (isSupported && 'clearResourceTimings' in performance) {
      (performance as any).clearResourceTimings();
    }
    setResources([]);
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;

    // Initial load
    updateResources();

    // Listen for new resources
    const observer = new PerformanceObserver(list => {
      updateResources();
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (_error) {
      // Fallback for browsers that don't support PerformanceObserver
      console.warn('PerformanceObserver not supported, using fallback');
    }

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [isSupported, updateResources]);

  return {
    resources,
    getResourceByName,
    getResourcesByType,
    clearResources,
    isSupported,
  };
}
