/**
 * Performance Dashboard Routes
 * Provides real-time performance monitoring and optimization insights
 */

import { ErrorMapper } from '@neonpro/shared/errors'
import { Hono } from 'hono'
import { PerformanceMonitor } from '../middleware/performance-middleware'
import { AestheticClinicPerformanceOptimizer } from '../services/performance/aesthetic-clinic-performance-optimizer'

export const createPerformanceDashboardRoutes = (
  optimizer: AestheticClinicPerformanceOptimizer,
  monitor: PerformanceMonitor,
) => {
  const router = new Hono()

  /**
   * Get current performance metrics
   */
  router.get('/metrics', async (c) => {
    try {
      const url = new URL(c.req.url)
      const timeRange = url.searchParams.get('timeRange') as string
      let timeRangeObj

      if (timeRange) {
        const [start, end] = timeRange.split(',')
        timeRangeObj = { start, end }
      }

      const metrics = optimizer.getPerformanceMetrics(timeRangeObj)
      const dbMetrics = optimizer.getPerformanceMetrics(timeRangeObj)

      return c.json({
        success: true,
        data: {
          applicationMetrics: metrics,
          databaseMetrics: dbMetrics,
          apiMetrics: monitor.getMetrics(
            timeRangeObj
              ? {
                start: new Date(timeRangeObj.start).getTime(),
                end: new Date(timeRangeObj.end).getTime(),
              }
              : undefined,
          ),
          statistics: {
            application: calculateApplicationStatistics(metrics),
            database: calculateDatabaseStatistics(dbMetrics),
            api: monitor.getStatistics(),
          },
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'get_performance_metrics',
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  /**
   * Get performance insights and recommendations
   */
  router.get('/insights', async (c) => {
    try {
      const insights = await generatePerformanceInsights(optimizer, monitor)

      return c.json({
        success: true,
        data: insights,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'get_performance_insights',
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  /**
   * Get cache performance data
   */
  router.get('/cache', async (c) => {
    try {
      const cacheStats = getCacheStatistics(optimizer)

      return c.json({
        success: true,
        data: cacheStats,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'get_cache_statistics',
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  /**
   * Clear cache entries
   */
  router.post('/cache/clear', async (c) => {
    try {
      const { pattern } = await c.req.json()

      optimizer.clearCache(pattern)

      return c.json({
        success: true,
        message: pattern
          ? `Cache entries matching pattern '${pattern}' cleared`
          : 'All cache entries cleared',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'clear_cache',
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  /**
   * Warm up cache
   */
  router.post('/cache/warmup', async (c) => {
    try {
      await optimizer.warmUpCache()

      return c.json({
        success: true,
        message: 'Cache warm-up initiated',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'warm_up_cache',
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  /**
   * Get query performance data
   */
  router.get('/queries', async (c) => {
    try {
      const url = new URL(c.req.url)
      const timeRange = url.searchParams.get('timeRange') as string
      let timeRangeObj

      if (timeRange) {
        const [start, end] = timeRange.split(',')
        timeRangeObj = { start, end }
      }

      const queryMetrics = optimizer.getPerformanceMetrics(timeRangeObj)
      const queryStats = calculateQueryStatistics(queryMetrics)

      return c.json({
        success: true,
        data: {
          queries: queryMetrics,
          statistics: queryStats,
          slowQueries: queryStats.slowQueries,
          recommendations: generateQueryRecommendations(queryStats),
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'get_query_performance',
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  /**
   * Get image optimization metrics
   */
  router.get('/images', async (c) => {
    try {
      const imageMetrics = getImageOptimizationMetrics(optimizer)

      return c.json({
        success: true,
        data: imageMetrics,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'get_image_metrics',
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  /**
   * Get real-time performance stream
   */
  router.get('/stream', async (c) => {
    try {
      const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      })

      const sendMetrics = () => {
        const _metrics = optimizer.getPerformanceMetrics()
        const stats = monitor.getStatistics()

        return `data: ${
          JSON.stringify({
            type: 'metrics',
            data: {
              metrics: _metrics,
              statistics: stats,
              timestamp: new Date().toISOString(),
            },
          })
        }\n\n`
      }

      // Send initial metrics
      const initialData = sendMetrics()

      // Return streaming response
      return new Response(initialData, {
        headers,
      })
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'performance_stream',
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  /**
   * Performance health check
   */
  router.get('/health', async (c) => {
    try {
      const health = await getPerformanceHealth(optimizer, monitor)

      const statusCode = health.status === 'healthy'
        ? 200
        : health.status === 'degraded'
        ? 503
        : 500

      return c.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      }, statusCode)
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'performance_health_check',
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  /**
   * Export performance data
   */
  router.get('/export', async (c) => {
    try {
      const url = new URL(c.req.url)
      const format = url.searchParams.get('format') as string || 'json'
      const timeRange = url.searchParams.get('timeRange') as string

      let timeRangeObj
      if (timeRange) {
        const [start, end] = timeRange.split(',')
        timeRangeObj = { start, end }
      }

      const metrics = optimizer.getPerformanceMetrics(timeRangeObj)
      const apiMetrics = monitor.getMetrics(
        timeRangeObj
          ? {
              start: new Date(timeRangeObj.start).getTime(),
              end: new Date(timeRangeObj.end).getTime(),
            }
          : undefined,
      )

      let exportData
      let contentType
      let filename

      switch (format) {
        case 'csv':
          exportData = exportToCsv(metrics, apiMetrics)
          contentType = 'text/csv'
          filename = `performance_metrics_${new Date().toISOString().split('T')[0]}.csv`
          break
        case 'json':
        default:
          exportData = JSON.stringify({ metrics, apiMetrics }, null, 2)
          contentType = 'application/json'
          filename = `performance_metrics_${new Date().toISOString().split('T')[0]}.json`
          break
      }

      return new Response(exportData, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } catch (error) {
      const mappedError = ErrorMapper.mapError(error, {
        action: 'export_performance_data',
        format: 'unknown', // Would need to extract from context
        timestamp: new Date().toISOString(),
      })

      return c.json({
        success: false,
        error: mappedError.message,
        timestamp: new Date().toISOString(),
      }, 500)
    }
  })

  return router
}

/**
 * Calculate application performance statistics
 */
function calculateApplicationStatistics(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
    }
  }

  const responseTimes = metrics.map(m => m.duration || 0)
  const errors = metrics.filter(m => !m.success).length

  responseTimes.sort((a, b) => a - b)

  const p95Index = Math.floor(responseTimes.length * 0.95)
  const p99Index = Math.floor(responseTimes.length * 0.99)

  return {
    totalRequests: metrics.length,
    averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
    p95ResponseTime: responseTimes[p95Index] || 0,
    p99ResponseTime: responseTimes[p99Index] || 0,
    errorRate: (errors / metrics.length) * 100,
    cacheHitRate: 0, // Would need to track cache hits
  }
}

/**
 * Calculate database performance statistics
 */
function calculateDatabaseStatistics(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      totalQueries: 0,
      averageQueryTime: 0,
      slowQueries: 0,
      cacheHitRate: 0,
      connectionPoolUsage: 0,
    }
  }

  const queryTimes = metrics.map(m => m.duration || 0)
  const slowQueries = queryTimes.filter(time => time > 1000).length

  return {
    totalQueries: metrics.length,
    averageQueryTime: queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length,
    slowQueries,
    slowQueryRate: (slowQueries / metrics.length) * 100,
    cacheHitRate: 0, // Would need to track cache hits
  }
}

/**
 * Calculate query performance statistics
 */
function calculateQueryStatistics(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      totalQueries: 0,
      averageQueryTime: 0,
      slowQueries: 0,
      queriesByTable: {},
      queriesByOperation: {},
    }
  }

  const queryTimes = metrics.map(m => m.duration || 0)
  const slowQueries = queryTimes.filter(time => time > 1000).length

  const queriesByTable = metrics.reduce((acc, metric) => {
    const table = metric.table || 'unknown'
    acc[table] = (acc[table] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const queriesByOperation = metrics.reduce((acc, metric) => {
    const operation = metric.operation || 'unknown'
    acc[operation] = (acc[operation] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalQueries: metrics.length,
    averageQueryTime: queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length,
    slowQueries,
    slowQueryRate: (slowQueries / metrics.length) * 100,
    queriesByTable,
    queriesByOperation,
  }
}

/**
 * Generate query performance recommendations
 */
function generateQueryRecommendations(stats: any) {
  const recommendations = []

  if (stats.slowQueryRate > 10) {
    recommendations.push({
      type: 'warning',
      category: 'query_performance',
      message: `${
        stats.slowQueryRate.toFixed(1)
      }% of queries are slow (>1s). Consider adding indexes or optimizing queries.`,
      priority: 'high',
    })
  }

  if (stats.averageQueryTime > 500) {
    recommendations.push({
      type: 'warning',
      category: 'query_performance',
      message: `Average query time is ${
        stats.averageQueryTime.toFixed(0)
      }ms. Consider database optimization.`,
      priority: 'medium',
    })
  }

  return recommendations
}

/**
 * Get cache statistics
 */
function getCacheStatistics(_optimizer: AestheticClinicPerformanceOptimizer) {
  // This would need to be implemented in the optimizer
  return {
    totalEntries: 0,
    hitRate: 0,
    missRate: 0,
    averageEntrySize: 0,
    memoryUsage: 0,
    topKeys: [],
  }
}

/**
 * Generate performance insights
 */
async function generatePerformanceInsights(
  optimizer: AestheticClinicPerformanceOptimizer,
  monitor: PerformanceMonitor,
) {
  const _metrics = optimizer.getPerformanceMetrics()
  const stats = monitor.getStatistics()

  const insights = []

  // Response time insights
  if (stats.averageResponseTime > 1000) {
    insights.push({
      type: 'performance_issue',
      category: 'response_time',
      severity: 'high',
      title: 'High Average Response Time',
      description: `Average response time is ${
        stats.averageResponseTime.toFixed(0)
      }ms, which is above the recommended threshold.`,
      recommendation:
        'Consider implementing caching, optimizing database queries, or scaling resources.',
    })
  }

  // Error rate insights
  if (stats.errorRate > 5) {
    insights.push({
      type: 'reliability_issue',
      category: 'error_rate',
      severity: 'high',
      title: 'High Error Rate',
      description: `Error rate is ${
        stats.errorRate.toFixed(1)
      }%, which is above the acceptable threshold.`,
      recommendation: 'Review error logs and implement better error handling and monitoring.',
    })
  }

  // Memory usage insights
  if (stats.memoryUsage.average > 300 * 1024 * 1024) {
    insights.push({
      type: 'resource_issue',
      category: 'memory_usage',
      severity: 'medium',
      title: 'High Memory Usage',
      description: `Average memory usage is ${
        (stats.memoryUsage.average / 1024 / 1024).toFixed(0)
      }MB.`,
      recommendation:
        'Consider implementing memory optimization and garbage collection strategies.',
    })
  }

  return {
    summary: {
      totalIssues: insights.length,
      criticalIssues: insights.filter(i => i.severity === 'high').length,
      warningIssues: insights.filter(i => i.severity === 'medium').length,
    },
    insights,
    trends: {
      responseTime: 'stable', // Would need historical data
      errorRate: 'stable',
      memoryUsage: 'stable',
    },
    recommendations: [
      {
        category: 'performance',
        priority: 'high',
        action: 'Implement caching for frequently accessed aesthetic clinic data',
        expectedImpact: 'Reduce response times by 40-60%',
      },
      {
        category: 'database',
        priority: 'medium',
        action: 'Optimize database queries and add proper indexing',
        expectedImpact: 'Improve query performance by 30-50%',
      },
      {
        category: 'monitoring',
        priority: 'medium',
        action: 'Set up automated alerts for performance thresholds',
        expectedImpact: 'Early detection of performance issues',
      },
    ],
  }
}

/**
 * Get performance health status
 */
async function getPerformanceHealth(
  optimizer: AestheticClinicPerformanceOptimizer,
  monitor: PerformanceMonitor,
) {
  const stats = monitor.getStatistics()

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  const issues = []

  // Check response time
  if (stats.averageResponseTime > 2000) {
    status = 'unhealthy'
    issues.push('Response time too high')
  } else if (stats.averageResponseTime > 1000) {
    status = 'degraded'
    issues.push('Response time elevated')
  }

  // Check error rate
  if (stats.errorRate > 10) {
    status = 'unhealthy'
    issues.push('Error rate too high')
  } else if (stats.errorRate > 5) {
    status = 'degraded'
    issues.push('Error rate elevated')
  }

  // Check memory usage
  if (stats.memoryUsage.peak > 400 * 1024 * 1024) {
    status = 'unhealthy'
    issues.push('Memory usage too high')
  } else if (stats.memoryUsage.peak > 300 * 1024 * 1024) {
    status = 'degraded'
    issues.push('Memory usage elevated')
  }

  return {
    status,
    issues,
    metrics: {
      responseTime: stats.averageResponseTime,
      errorRate: stats.errorRate,
      memoryUsage: stats.memoryUsage.peak,
      cacheHitRate: stats.cacheHitRate,
    },
    lastChecked: new Date().toISOString(),
  }
}

/**
 * Get image optimization metrics
 */
function getImageOptimizationMetrics(_optimizer: AestheticClinicPerformanceOptimizer) {
  // This would need to be implemented in the optimizer
  return {
    totalImages: 0,
    optimizedImages: 0,
    bandwidthSaved: 0,
    averageLoadTime: 0,
    formats: {
      webp: 0,
      jpeg: 0,
      png: 0,
    },
  }
}

/**
 * Export metrics to CSV format
 */
function exportToCsv(metrics: any[], apiMetrics: any[]) {
  const headers = [
    'timestamp',
    'type',
    'duration',
    'success',
    'table',
    'operation',
    'statusCode',
    'responseSize',
  ]

  const rows = [headers.join(',')]

  // Add application metrics
  metrics.forEach(metric => {
    rows.push([
      metric.timestamp,
      'database',
      metric.duration || '',
      metric.success || '',
      metric.table || '',
      metric.operation || '',
      '',
      '',
    ].join(','))
  })

  // Add API metrics
  apiMetrics.forEach(metric => {
    rows.push([
      new Date(metric.startTime).toISOString(),
      'api',
      metric.duration || '',
      metric.statusCode ? metric.statusCode < 400 : '',
      '',
      '',
      metric.statusCode || '',
      metric.responseSize || '',
    ].join(','))
  })

  return rows.join('\n')
}
