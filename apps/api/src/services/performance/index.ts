/**
 * Performance Optimization Services Index
 * Main entry point for all performance optimization features
 */

export { AestheticClinicPerformanceOptimizer } from './aesthetic-clinic-performance-optimizer'
export { SecurityComplianceValidator } from './security-compliance-validator'
export { WebSocketOptimizer } from './websocket-optimizer'

export type {
  AestheticCacheConfig,
  AestheticPerformanceMetrics,
  ImageOptimizationConfig,
  QueryOptimizationConfig,
} from './aesthetic-clinic-performance-optimizer'

export type { WebSocketConfig, WebSocketConnection, WebSocketMetrics } from './websocket-optimizer'

export type {
  ComplianceFramework,
  SecurityRecommendation,
  SecurityValidationResult,
  SecurityViolation,
} from './security-compliance-validator'

// Factory functions
export { createAestheticClinicPerformanceOptimizer } from './aesthetic-clinic-performance-optimizer'

export { createWebSocketOptimizer } from './websocket-optimizer'

export { createSecurityComplianceValidator } from './security-compliance-validator'

// Performance monitoring middleware
export { PerformanceMonitor } from '../../middleware/performance-middleware'

// Performance dashboard routes
export { createPerformanceDashboardRoutes } from '../../routes/performance-dashboard'

/**
 * Initialize complete performance optimization stack
 */
export async function initializePerformanceOptimization(config: {
  supabase: any
  websocket?: {
    server: any
    config?: Partial<any>
  }
  monitoring?: {
    thresholds?: Partial<any>
    enableRealtimeMonitoring?: boolean
  }
  security?: {
    enableComplianceValidation?: boolean
    validationInterval?: number
  }
}) {
  const { supabase, websocket, monitoring, security } = config

  // Initialize core performance optimizer
  const optimizer = new AestheticClinicPerformanceOptimizer(supabase)

  // Initialize WebSocket optimizer if configured
  let websocketOptimizer: WebSocketOptimizer | undefined
  if (websocket?.server) {
    const { createWebSocketOptimizer } = await import('./websocket-optimizer')
    websocketOptimizer = createWebSocketOptimizer(optimizer, websocket.config)
    websocketOptimizer.initializeServer(websocket.server)
  }

  // Initialize performance monitoring if enabled
  let performanceMonitor: any
  if (monitoring?.enableRealtimeMonitoring !== false) {
    const { PerformanceMonitor } = await import('../../middleware/performance-middleware')
    performanceMonitor = new PerformanceMonitor(optimizer, monitoring?.thresholds)
  }

  // Initialize security compliance validator if enabled
  let securityValidator: SecurityComplianceValidator | undefined
  if (security?.enableComplianceValidation !== false) {
    const { createSecurityComplianceValidator } = await import('./security-compliance-validator')
    securityValidator = createSecurityComplianceValidator(optimizer, websocketOptimizer)
  }

  // Start periodic security validation if configured
  if (securityValidator && security?.validationInterval) {
    setInterval(async () => {
      try {
        const validationResult = await securityValidator.validateOptimizations()

        // Log validation results
        if (validationResult.violations.length > 0) {
          console.warn(
            '[Security] Performance optimization validation found violations:',
            validationResult.violations.map(v => `${v.type}: ${v.description}`),
          )
        }

        if (validationResult.complianceScore < 80) {
          console.error(`[Security] Low compliance score: ${validationResult.complianceScore}%`)
        }
      } catch {
        console.error('[Security] Compliance validation failed:', error)
      }
    }, security.validationInterval)
  }

  // Warm up cache on startup
  await optimizer.warmUpCache()

  console.warn('[Performance] Optimization stack initialized successfully')

  return {
    optimizer,
    websocketOptimizer,
    performanceMonitor,
    securityValidator,

    // Convenience methods
    getMetrics: () => optimizer.getPerformanceMetrics(),
    getWebSocketMetrics: () => websocketOptimizer?.getMetrics(),
    getSecurityStatus: () => securityValidator?.validateOptimizations(),

    // Utility methods
    clearCache: (pattern?: string) => optimizer.clearCache(pattern),
    warmUpCache: () => optimizer.warmUpCache(),
    validateCompliance: () => securityValidator?.validateOptimizations(),

    // Destroy method for cleanup
    destroy: () => {
      websocketOptimizer?.destroy()
      optimizer.clearCache()
    },
  }
}

/**
 * Performance optimization configuration presets
 */
export const PERFORMANCE_PRESETS = {
  // Optimized for high-traffic production environments
  production: {
    cache: {
      clientProfiles: { ttl: 600000, maxSize: 2000, strategy: 'lru' },
      treatmentCatalog: { ttl: 3600000, maxSize: 1000, strategy: 'lru' },
      beforeAfterPhotos: { ttl: 1800000, maxSize: 5000, compressionEnabled: true },
      analytics: { ttl: 120000, maxSize: 500, realtimeEnabled: true },
    },
    images: {
      maxWidth: 1200,
      quality: 85,
      formats: ['webp', 'avif', 'jpeg'],
      lazyLoading: true,
      placeholderEnabled: true,
      cdnEnabled: true,
    },
    queries: {
      enableBatching: true,
      batchSize: 100,
      enableConnectionPooling: true,
      poolSize: 20,
      enableReadReplicas: true,
      indexHints: ['idx_aesthetic_clients_email', 'idx_treatment_sessions_date'],
    },
    websocket: {
      maxConnections: 5000,
      maxMessageSize: 2 * 1024 * 1024,
      heartbeatInterval: 30000,
      connectionTimeout: 120000,
      pingTimeout: 10000,
      enableCompression: true,
      enableMessageQueueing: true,
      maxQueueSize: 2000,
      enableConnectionPooling: true,
      poolSize: 50,
    },
    monitoring: {
      warningThreshold: 1000,
      criticalThreshold: 3000,
      maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
      maxResponseSize: 50 * 1024 * 1024, // 50MB
    },
    security: {
      enableComplianceValidation: true,
      validationInterval: 300000, // 5 minutes
    },
  },

  // Optimized for development and testing
  development: {
    cache: {
      clientProfiles: { ttl: 30000, maxSize: 100, strategy: 'lru' },
      treatmentCatalog: { ttl: 60000, maxSize: 50, strategy: 'lru' },
      beforeAfterPhotos: { ttl: 45000, maxSize: 200, compressionEnabled: false },
      analytics: { ttl: 15000, maxSize: 20, realtimeEnabled: false },
    },
    images: {
      maxWidth: 800,
      quality: 70,
      formats: ['jpeg'],
      lazyLoading: false,
      placeholderEnabled: false,
      cdnEnabled: false,
    },
    queries: {
      enableBatching: false,
      batchSize: 10,
      enableConnectionPooling: false,
      poolSize: 5,
      enableReadReplicas: false,
      indexHints: [],
    },
    websocket: {
      maxConnections: 100,
      maxMessageSize: 1024 * 1024,
      heartbeatInterval: 60000,
      connectionTimeout: 30000,
      pingTimeout: 5000,
      enableCompression: false,
      enableMessageQueueing: false,
      maxQueueSize: 100,
      enableConnectionPooling: false,
      poolSize: 10,
    },
    monitoring: {
      warningThreshold: 2000,
      criticalThreshold: 5000,
      maxMemoryUsage: 200 * 1024 * 1024, // 200MB
      maxResponseSize: 10 * 1024 * 1024, // 10MB
    },
    security: {
      enableComplianceValidation: true,
      validationInterval: 600000, // 10 minutes
    },
  },

  // Optimized for staging and pre-production
  staging: {
    cache: {
      clientProfiles: { ttl: 300000, maxSize: 1000, strategy: 'lru' },
      treatmentCatalog: { ttl: 1800000, maxSize: 500, strategy: 'lru' },
      beforeAfterPhotos: { ttl: 900000, maxSize: 1000, compressionEnabled: true },
      analytics: { ttl: 60000, maxSize: 100, realtimeEnabled: true },
    },
    images: {
      maxWidth: 1000,
      quality: 80,
      formats: ['webp', 'jpeg'],
      lazyLoading: true,
      placeholderEnabled: true,
      cdnEnabled: false,
    },
    queries: {
      enableBatching: true,
      batchSize: 50,
      enableConnectionPooling: true,
      poolSize: 10,
      enableReadReplicas: false,
      indexHints: ['idx_aesthetic_clients_email', 'idx_treatment_sessions_date'],
    },
    websocket: {
      maxConnections: 1000,
      maxMessageSize: 1024 * 1024,
      heartbeatInterval: 30000,
      connectionTimeout: 60000,
      pingTimeout: 5000,
      enableCompression: true,
      enableMessageQueueing: true,
      maxQueueSize: 500,
      enableConnectionPooling: true,
      poolSize: 25,
    },
    monitoring: {
      warningThreshold: 1500,
      criticalThreshold: 4000,
      maxMemoryUsage: 512 * 1024 * 1024, // 512MB
      maxResponseSize: 25 * 1024 * 1024, // 25MB
    },
    security: {
      enableComplianceValidation: true,
      validationInterval: 300000, // 5 minutes
    },
  },
}

/**
 * Performance optimization utilities
 */
export const PerformanceUtils = {
  /**
   * Format performance metrics for display
   */
  formatMetrics(metrics: any) {
    return {
      ...metrics,
      queryMetrics: {
        ...metrics.queryMetrics,
        averageQueryTime: `${metrics.queryMetrics.averageQueryTime?.toFixed(2) || 0}ms`,
        slowQueries: `${metrics.queryMetrics.slowQueries || 0} queries`,
        cacheHitRate: `${((metrics.queryMetrics.cacheHitRate || 0) * 100).toFixed(1)}%`,
      },
      imageMetrics: {
        ...metrics.imageMetrics,
        averageLoadTime: `${metrics.imageMetrics.averageLoadTime?.toFixed(2) || 0}ms`,
        totalBandwidthSaved: `${
          ((metrics.imageMetrics.totalBandwidthSaved || 0) / 1024 / 1024).toFixed(2)
        }MB`,
      },
      apiMetrics: {
        ...metrics.apiMetrics,
        averageResponseTime: `${metrics.apiMetrics.averageResponseTime?.toFixed(2) || 0}ms`,
        compressionRatio: `${((metrics.apiMetrics.compressionRatio || 0) * 100).toFixed(1)}%`,
      },
      websocketMetrics: {
        ...metrics.websocketMetrics,
        averageLatency: `${metrics.websocketMetrics.averageLatency?.toFixed(2) || 0}ms`,
        messagesPerSecond: `${metrics.websocketMetrics.messagesPerSecond?.toFixed(1) || 0}/s`,
      },
    }
  },

  /**
   * Calculate performance score from metrics
   */
  calculatePerformanceScore(metrics: any): number {
    const _weights = {
      responseTime: 0.3,
      cacheHitRate: 0.2,
      errorRate: 0.2,
      throughput: 0.15,
      memoryUsage: 0.15,
    }

    let score = 100

    // Response time impact (lower is better)
    const avgResponseTime = metrics.queryMetrics?.averageQueryTime || 0
    if (avgResponseTime > 1000) score -= 30
    else if (avgResponseTime > 500) score -= 15
    else if (avgResponseTime > 200) score -= 5

    // Cache hit rate impact (higher is better)
    const cacheHitRate = metrics.queryMetrics?.cacheHitRate || 0
    if (cacheHitRate < 0.5) score -= 20
    else if (cacheHitRate < 0.7) score -= 10
    else if (cacheHitRate < 0.9) score -= 5

    // Error rate impact (lower is better)
    const errorRate = metrics.queryMetrics?.errorRate || 0
    if (errorRate > 5) score -= 25
    else if (errorRate > 2) score -= 15
    else if (errorRate > 1) score -= 5

    // Memory usage impact (lower is better)
    const memoryUsage = metrics.memoryUsage || 0
    if (memoryUsage > 1024 * 1024 * 1024) score -= 15 // 1GB
    else if (memoryUsage > 512 * 1024 * 1024) score -= 10 // 512MB
    else if (memoryUsage > 256 * 1024 * 1024) score -= 5 // 256MB

    return Math.max(0, Math.min(100, score))
  },

  /**
   * Generate performance recommendations
   */
  generateRecommendations(metrics: any): Array<{
    type: 'warning' | 'critical'
    category: string
    message: string
    action: string
  }> {
    const recommendations = []

    // Response time recommendations
    const avgResponseTime = metrics.queryMetrics?.averageQueryTime || 0
    if (avgResponseTime > 1000) {
      recommendations.push({
        type: 'critical',
        category: 'response_time',
        message: `High average response time: ${avgResponseTime.toFixed(0)}ms`,
        action: 'Optimize database queries and implement caching strategies',
      })
    }

    // Cache hit rate recommendations
    const cacheHitRate = metrics.queryMetrics?.cacheHitRate || 0
    if (cacheHitRate < 0.5) {
      recommendations.push({
        type: 'warning',
        category: 'caching',
        message: `Low cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`,
        action: 'Review caching strategy and increase cache TTL for frequently accessed data',
      })
    }

    // Error rate recommendations
    const errorRate = metrics.queryMetrics?.errorRate || 0
    if (errorRate > 2) {
      recommendations.push({
        type: 'warning',
        category: 'reliability',
        message: `High error rate: ${errorRate.toFixed(1)}%`,
        action: 'Review error logs and implement better error handling',
      })
    }

    // Memory usage recommendations
    const memoryUsage = metrics.memoryUsage || 0
    if (memoryUsage > 512 * 1024 * 1024) {
      recommendations.push({
        type: 'warning',
        category: 'memory',
        message: `High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(0)}MB`,
        action: 'Implement memory optimization and garbage collection strategies',
      })
    }

    return recommendations
  },
}

/**
 * Performance monitoring utilities
 */
export const MonitoringUtils = {
  /**
   * Create performance monitoring middleware chain
   */
  createMiddlewareChain(optimizer: any, monitor: any) {
    const middlewares = []

    // Add performance monitoring middleware
    middlewares.push(monitor.middleware())

    // Add database query tracking
    middlewares.push(monitor.databaseQueryMiddleware())

    // Add compression middleware
    middlewares.push(monitor.compressionMiddleware())

    // Add cache middleware
    middlewares.push(monitor.cacheMiddleware())

    // Add rate limiting
    middlewares.push(monitor.rateLimitMiddleware())

    // Add optimization headers
    middlewares.push(monitor.optimizationHeadersMiddleware())

    return middlewares
  },

  /**
   * Set up performance event listeners
   */
  setupEventListeners(optimizer: any, monitor: any, websocketOptimizer?: any) {
    // Performance threshold alerts
    setInterval(() => {
      const stats = monitor.getStatistics()

      if (stats.averageResponseTime > 2000) {
        console.warn(
          `[Performance] High average response time: ${stats.averageResponseTime.toFixed(0)}ms`,
        )
      }

      if (stats.errorRate > 5) {
        console.warn(`[Performance] High error rate: ${stats.errorRate.toFixed(1)}%`)
      }

      if (stats.memoryUsage.peak > 512 * 1024 * 1024) {
        console.warn(
          `[Performance] High memory usage: ${(stats.memoryUsage.peak / 1024 / 1024).toFixed(0)}MB`,
        )
      }
    }, 60000) // Every minute

    // WebSocket performance monitoring
    if (websocketOptimizer) {
      setInterval(() => {
        const wsMetrics = websocketOptimizer.getMetrics()

        if (wsMetrics.averageLatency > 1000) {
          console.warn(`[WebSocket] High latency: ${wsMetrics.averageLatency.toFixed(0)}ms`)
        }

        if (wsMetrics.errors.connectionErrors > 0) {
          console.warn(`[WebSocket] Connection errors: ${wsMetrics.errors.connectionErrors}`)
        }
      }, 30000) // Every 30 seconds
    }
  },
}

// Default export
export default {
  AestheticClinicPerformanceOptimizer,
  WebSocketOptimizer,
  SecurityComplianceValidator,
  initializePerformanceOptimization,
  PERFORMANCE_PRESETS,
  PerformanceUtils,
  MonitoringUtils,
}
