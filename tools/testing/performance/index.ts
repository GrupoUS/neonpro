/**
 * Performance Optimization Suite - Main Export
 *
 * Comprehensive performance optimization utilities for Next.js 15 & React 19
 * Based on 2025 industry best practices and expert recommendations
 */

// Bundle Analysis and Optimization
export {
  analyzeBundleStats,
  BUNDLE_THRESHOLDS,
  type BundleAnalysis,
  formatBytes,
  generateBundleReport,
  runBundleAnalysis,
} from './bundle-analyzer'
// Caching Strategies
export {
  CACHE_CONFIG,
  CacheHeaders,
  CacheInvalidation,
  CacheKeyGenerator,
  CacheManager,
  cacheManager,
  CachePerformanceMonitor,
  CDNOptimization,
  withCache,
} from './caching'
// Production Deployment
export {
  BuildOptimizer,
  DEPLOYMENT_CONFIG,
  DeploymentAutomation,
  PreBuildOptimizer,
  ProductionHealthCheck,
} from './deployment'

// React Performance Hooks
export {
  useDebouncedState,
  useIntersectionObserver,
  useMemoryMonitor,
  useOptimizedCallback,
  useOptimizedChartData,
  useOptimizedMemo,
  usePerformanceProfiler,
  usePreloadResources,
  useRenderPerformance,
  useVirtualScrolling,
} from './react-hooks'
// Core Web Vitals and Performance Monitoring
export {
  getPerformanceGrade,
  PERFORMANCE_THRESHOLDS,
  PerformanceUtils,
  reportWebVitals,
  sendToAnalytics,
  usePerformanceMonitoring,
} from './web-vitals'

// Performance utility functions
export const PerformanceSuite = {
  // Initialize all performance monitoring
  init: () => {
    if (typeof window !== 'undefined') {
      // Start Web Vitals monitoring
      import('./web-vitals').then(({ reportWebVitals, },) => {
        reportWebVitals()
      },)

      // Start resource timing monitoring
      import('./web-vitals').then(({ PerformanceUtils, },) => {
        PerformanceUtils.observeResourceTiming()
      },)
    }
  },

  // Production build optimization
  build: async () => {
    const { BuildOptimizer, } = await import('./deployment')
    return BuildOptimizer.optimizedBuild()
  },

  // Health checks for production
  healthCheck: async () => {
    const { ProductionHealthCheck, } = await import('./deployment')
    return ProductionHealthCheck.runHealthChecks()
  },

  // Bundle analysis
  analyzeBundle: async (statsPath?: string,) => {
    const { runBundleAnalysis, } = await import('./bundle-analyzer')
    return runBundleAnalysis(statsPath,)
  },

  // Cache performance stats
  getCacheStats: () => {
    const { cacheManager, CachePerformanceMonitor, } = require('./caching',)
    return {
      cache: cacheManager.getStats(),
      performance: CachePerformanceMonitor.getStats(),
    }
  },
}

// Performance constants for external use
export const PERFORMANCE_CONSTANTS = {
  // Core Web Vitals thresholds (2025 standards)
  CORE_WEB_VITALS: {
    LCP: { GOOD: 2500, NEEDS_IMPROVEMENT: 4000, }, // Largest Contentful Paint
    FID: { GOOD: 100, NEEDS_IMPROVEMENT: 300, }, // First Input Delay
    CLS: { GOOD: 0.1, NEEDS_IMPROVEMENT: 0.25, }, // Cumulative Layout Shift
    FCP: { GOOD: 1800, NEEDS_IMPROVEMENT: 3000, }, // First Contentful Paint
    TTFB: { GOOD: 800, NEEDS_IMPROVEMENT: 1800, }, // Time to First Byte
  },

  // Bundle size recommendations
  BUNDLE_SIZES: {
    CRITICAL: 50 * 1024, // 50KB for critical resources
    WARNING: 100 * 1024, // 100KB warning threshold
    ERROR: 250 * 1024, // 250KB error threshold
    TOTAL_MAX: 2 * 1024 * 1024, // 2MB total bundle limit
  },

  // React performance thresholds
  REACT_PERFORMANCE: {
    RENDER_TIME_WARNING: 16, // 60fps = 16.67ms per frame
    RENDER_TIME_ERROR: 33, // 30fps = 33.33ms per frame
    INTERACTION_TIME_WARNING: 100, // 100ms for good UX
    MEMORY_USAGE_WARNING: 50 * 1024 * 1024, // 50MB
  },

  // Cache TTL recommendations
  CACHE_TTL: {
    STATIC_ASSETS: 31_536_000, // 1 year
    API_RESPONSES: 300, // 5 minutes
    DYNAMIC_CONTENT: 60, // 1 minute
    USER_SPECIFIC: 0, // No caching
  },
} as const

// Type definitions for external use
export type PerformanceGrade = 'good' | 'needs-improvement' | 'poor'
export type CacheStrategy = 'static' | 'api' | 'dynamic' | 'private'
export type DeploymentEnvironment = 'development' | 'staging' | 'production'

// Performance monitoring configuration
export interface PerformanceConfig {
  webVitals: {
    enabled: boolean
    endpoint?: string
    sampleRate?: number
  }
  bundleAnalysis: {
    enabled: boolean
    warningThreshold: number
    errorThreshold: number
  }
  caching: {
    enabled: boolean
    defaultTTL: number
    maxMemoryUsage: number
  }
  monitoring: {
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    enableDevTools: boolean
    memoryMonitoring: boolean
  }
}

// Default performance configuration
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  webVitals: {
    enabled: true,
    sampleRate: 1,
  },
  bundleAnalysis: {
    enabled: process.env.NODE_ENV === 'production',
    warningThreshold: 100 * 1024, // 100KB
    errorThreshold: 250 * 1024, // 250KB
  },
  caching: {
    enabled: true,
    defaultTTL: 300_000, // 5 minutes
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  },
  monitoring: {
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    enableDevTools: process.env.NODE_ENV === 'development',
    memoryMonitoring: process.env.NODE_ENV === 'development',
  },
}

// Initialize performance suite on import (client-side only)
if (typeof window !== 'undefined') {
  // Auto-initialize with default config
  PerformanceSuite.init()
}

// Expert recommendations summary
export const EXPERT_RECOMMENDATIONS = {
  // From MCP research findings
  nextjs15: [
    'Use React Server Components by default for better performance',
    'Enable Turbopack for faster development builds',
    'Implement proper caching strategies with opt-in approach',
    'Use Next.js Image component with AVIF/WebP formats',
    'Enable bundle analysis in production builds',
    'Implement proper error boundaries and loading states',
  ],

  react19: [
    'Use React Compiler for automatic memoization',
    'Leverage startTransition for better UX',
    'Implement proper Suspense boundaries',
    'Use useOptimistic for instant UI updates',
    'Avoid premature optimization - measure first',
  ],

  deployment: [
    'Run health checks before deployment',
    'Implement proper security headers',
    'Use CDN for static assets',
    'Enable compression and minification',
    'Monitor Core Web Vitals in production',
    'Implement proper cache invalidation strategies',
  ],

  analytics: [
    'Use server-side rendering for SEO',
    'Implement lazy loading for charts',
    'Optimize data processing with Web Workers',
    'Use virtual scrolling for large datasets',
    'Implement proper error tracking',
  ],
} as const

export default PerformanceSuite
