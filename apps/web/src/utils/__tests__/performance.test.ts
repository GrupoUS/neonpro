/**
 * Performance Utilities Tests
 * T078 - Frontend Performance Optimization
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createIntersectionObserver,
  logBundleSize,
  monitorMemoryUsage,
  PerformanceMonitor,
  prefetchResource,
  preloadResource,
} from '../performance';

// Mock web-vitals
vi.mock(_'web-vitals',_() => ({
  onCLS: vi.fn(callback => callback({ value: 0.1 })),
  onFCP: vi.fn(callback => callback({ value: 1200 })),
  onINP: vi.fn(callback => callback({ value: 100 })),
  onLCP: vi.fn(callback => callback({ value: 2500 })),
  onTTFB: vi.fn(callback => callback({ value: 800 })),
}));

// Mock DOM APIs
const mockIntersectionObserver = vi.fn();
const mockPerformanceObserver = vi.fn();

beforeEach(_() => {
  // Reset DOM
  document.head.innerHTML = '';
  document.body.innerHTML = '';

  // Mock IntersectionObserver
  global.IntersectionObserver = vi
    .fn()
    .mockImplementation(_(callback,_options) => {
      mockIntersectionObserver.mockImplementation(callback);
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      };
    });

  // Mock PerformanceObserver
  global.PerformanceObserver = vi.fn().mockImplementation(callback => {
    mockPerformanceObserver.mockImplementation(callback);
    return {
      observe: vi.fn(),
      disconnect: vi.fn(),
    };
  });

  // Mock console methods
  vi.spyOn(console, 'log').mockImplementation(_() => {});
  vi.spyOn(console, 'table').mockImplementation(_() => {});
});

afterEach(_() => {
  vi.clearAllMocks();
});

describe(_'PerformanceMonitor',_() => {
  it(_'should initialize web vitals monitoring',_() => {
    const monitor = new PerformanceMonitor();

    expect(monitor).toBeDefined();
    expect(monitor.getMetrics()).toEqual({
      cls: 0.1,
      fcp: 1200,
      inp: 100,
      lcp: 2500,
      ttfb: 800,
    });
  });

  it(_'should initialize performance observer',_() => {
    new PerformanceMonitor();

    expect(global.PerformanceObserver).toHaveBeenCalled();
  });

  it(_'should report metrics in development',_() => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    new PerformanceMonitor();

    expect(console.log).toHaveBeenCalledWith('[Performance] CLS: 0.10ms');
    expect(console.log).toHaveBeenCalledWith('[Performance] FCP: 1200.00ms');
    expect(console.log).toHaveBeenCalledWith('[Performance] INP: 100.00ms');
    expect(console.log).toHaveBeenCalledWith('[Performance] LCP: 2500.00ms');
    expect(console.log).toHaveBeenCalledWith('[Performance] TTFB: 800.00ms');

    process.env.NODE_ENV = originalEnv;
  });

  it(_'should destroy observers on cleanup',_() => {
    const monitor = new PerformanceMonitor();
    const disconnectSpy = vi.fn();

    // Mock observer with disconnect method
    monitor['observers'] = [{ disconnect: disconnectSpy } as any];

    monitor.destroy();

    expect(disconnectSpy).toHaveBeenCalled();
    expect(monitor['observers']).toHaveLength(0);
  });
});

describe(_'createIntersectionObserver',_() => {
  it(_'should create intersection observer when supported',_() => {
    const callback = vi.fn();
    const options = { threshold: 0.5 };

    const observer = createIntersectionObserver(callback, options);

    expect(observer).toBeDefined();
    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      callback,
      expect.objectContaining({
        rootMargin: '50px',
        threshold: 0.5,
      }),
    );
  });

  it(_'should return null when not supported',_() => {
    // @ts-ignore
    delete global.IntersectionObserver;

    const callback = vi.fn();
    const observer = createIntersectionObserver(callback);

    expect(observer).toBeNull();
  });

  it(_'should use default options',_() => {
    const callback = vi.fn();

    createIntersectionObserver(callback);

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      callback,
      expect.objectContaining({
        rootMargin: '50px',
        threshold: 0.1,
      }),
    );
  });
});

describe(_'Resource preloading',_() => {
  it(_'should preload resources',_() => {
    preloadResource('/test.js', 'script');

    const link = document.querySelector(
      'link[rel="preload"]',
    ) as HTMLLinkElement;
    expect(link).toBeDefined();
    expect(link.href).toContain('/test.js');
    expect(link.as).toBe('script');
  });

  it(_'should preload resources with crossorigin',_() => {
    preloadResource('/test.css', 'style', 'anonymous');

    const link = document.querySelector(
      'link[rel="preload"]',
    ) as HTMLLinkElement;
    expect(link).toBeDefined();
    expect(link.crossOrigin).toBe('anonymous');
  });

  it(_'should prefetch resources',_() => {
    prefetchResource('/next-page.js');

    const link = document.querySelector(
      'link[rel="prefetch"]',
    ) as HTMLLinkElement;
    expect(link).toBeDefined();
    expect(link.href).toContain('/next-page.js');
  });

  it(_'should handle server-side rendering',_() => {
    const originalDocument = global.document;
    // @ts-ignore
    delete global.document;

    expect(_() => preloadResource('/test.js', 'script')).not.toThrow();
    expect(_() => prefetchResource('/test.js')).not.toThrow();

    global.document = originalDocument;
  });
});

describe(_'Bundle analysis',_() => {
  it(_'should log bundle size in development',_() => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Add mock scripts and styles
    document.head.innerHTML = `
      <script src="/script1.js"></script>
      <script src="/script2.js"></script>
      <link rel="stylesheet" href="/style1.css">
    `;

    logBundleSize();

    expect(console.log).toHaveBeenCalledWith('Scripts:', 2);
    expect(console.log).toHaveBeenCalledWith('Stylesheets:', 1);

    process.env.NODE_ENV = originalEnv;
  });

  it(_'should not log in production',_() => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    logBundleSize();

    expect(console.log).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });
});

describe(_'Memory monitoring',_() => {
  it(_'should monitor memory usage when supported',_() => {
    const mockMemory = {
      usedJSHeapSize: 50 * 1048576, // 50MB
      totalJSHeapSize: 100 * 1048576, // 100MB
      jsHeapSizeLimit: 200 * 1048576, // 200MB
    };

    // @ts-ignore
    global.performance = { memory: mockMemory };

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const usage = monitorMemoryUsage();

    expect(usage).toEqual({
      used: 50,
      total: 100,
      limit: 200,
    });

    expect(console.log).toHaveBeenCalledWith('Memory Usage (MB):', usage);

    process.env.NODE_ENV = originalEnv;
  });

  it(_'should return undefined when not supported',_() => {
    // @ts-ignore
    delete global.performance;

    const usage = monitorMemoryUsage();

    expect(usage).toBeUndefined();
  });

  it(_'should handle missing memory API',_() => {
    // @ts-ignore
    global.performance = {};

    const usage = monitorMemoryUsage();

    expect(usage).toBeUndefined();
  });
});
