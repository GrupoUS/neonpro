import { EventEmitter, } from 'events'
import { performance, PerformanceObserver, } from 'perf_hooks'
import { LogContext, logger, } from './Logger.js'

export interface PerformanceMetrics {
  timestamp: number
  memory: NodeJS.MemoryUsage
  cpu: NodeJS.CpuUsage
  eventLoopLag: number
  gcMetrics?: GCMetrics
  customMetrics: Map<string, number>
}

export interface GCMetrics {
  count: number
  duration: number
  type: 'minor' | 'major' | 'incremental' | 'weakCallback'
}

export interface OperationProfile {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  memoryBefore: NodeJS.MemoryUsage
  memoryAfter?: NodeJS.MemoryUsage
  memoryDelta?: Partial<NodeJS.MemoryUsage>
  context?: LogContext
  childOperations: OperationProfile[]
  tags: string[]
}

export interface PerformanceReport {
  summary: {
    totalOperations: number
    averageOperationTime: number
    longestOperation: string
    shortestOperation: string
    totalMemoryUsed: number
    peakMemoryUsage: number
    avgEventLoopLag: number
    gcCount: number
    totalGCTime: number
  }
  operations: OperationProfile[]
  systemMetrics: PerformanceMetrics[]
  alerts: PerformanceAlert[]
  recommendations: string[]
}

export interface PerformanceAlert {
  type: 'memory' | 'cpu' | 'eventLoop' | 'operation' | 'gc'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: number
  context?: LogContext
}

export interface PerformanceThresholds {
  memoryUsage: number // MB
  eventLoopLag: number // ms
  operationDuration: number // ms
  gcDuration: number // ms
  cpuUsage: number // percentage
}

export class PerformanceMonitor extends EventEmitter {
  private operations: Map<string, OperationProfile> = new Map()
  private operationStack: OperationProfile[] = []
  private metricsHistory: PerformanceMetrics[] = []
  private gcObserver?: PerformanceObserver
  private monitoringInterval?: NodeJS.Timeout
  private eventLoopMonitor?: NodeJS.Timeout
  private isMonitoring = false
  private startTime = performance.now()
  private thresholds: PerformanceThresholds

  constructor(thresholds?: Partial<PerformanceThresholds>,) {
    super()

    this.thresholds = {
      memoryUsage: 1024, // 1GB
      eventLoopLag: 100, // 100ms
      operationDuration: 5000, // 5 seconds
      gcDuration: 100, // 100ms
      cpuUsage: 80, // 80%
      ...thresholds,
    }

    this.initializeGCMonitoring()
    this.startMonitoring()
  }

  private initializeGCMonitoring(): void {
    try {
      this.gcObserver = new PerformanceObserver((list,) => {
        const entries = list.getEntries()
        entries.forEach((entry,) => {
          if (entry.entryType === 'gc') {
            const gcMetric: GCMetrics = {
              count: 1,
              duration: entry.duration,
              type: this.getGCType(entry.detail?.kind,),
            }

            // Check GC duration threshold
            if (gcMetric.duration > this.thresholds.gcDuration) {
              this.emit('alert', {
                type: 'gc',
                severity: gcMetric.duration > this.thresholds.gcDuration * 2 ? 'high' : 'medium',
                message: `Long garbage collection detected: ${gcMetric.duration.toFixed(2,)}ms`,
                value: gcMetric.duration,
                threshold: this.thresholds.gcDuration,
                timestamp: performance.now(),
              },)
            }

            logger.trace('Garbage collection performed', {
              component: 'PerformanceMonitor',
              metadata: gcMetric,
            },)
          }
        },)
      },)

      this.gcObserver.observe({ entryTypes: ['gc',], },)
    } catch (error) {
      logger.warn('GC monitoring not available in this environment', {
        component: 'PerformanceMonitor',
      },)
    }
  }

  private getGCType(kind?: number,): GCMetrics['type'] {
    switch (kind) {
      case 1:
        return 'minor'
      case 2:
        return 'major'
      case 4:
        return 'incremental'
      case 8:
        return 'weakCallback'
      default:
        return 'minor'
    }
  }

  private measureEventLoopLag(): Promise<number> {
    return new Promise((resolve,) => {
      const start = performance.now()
      setImmediate(() => {
        const lag = performance.now() - start
        resolve(lag,)
      },)
    },)
  }

  public startMonitoring(intervalMs: number = 5000,): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    logger.info('Performance monitoring started', {
      component: 'PerformanceMonitor',
      metadata: { intervalMs, thresholds: this.thresholds, },
    },)

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
    }, intervalMs,)

    // More frequent event loop monitoring
    this.eventLoopMonitor = setInterval(async () => {
      const lag = await this.measureEventLoopLag()
      if (lag > this.thresholds.eventLoopLag) {
        this.emit('alert', {
          type: 'eventLoop',
          severity: lag > this.thresholds.eventLoopLag * 2 ? 'high' : 'medium',
          message: `High event loop lag detected: ${lag.toFixed(2,)}ms`,
          value: lag,
          threshold: this.thresholds.eventLoopLag,
          timestamp: performance.now(),
        },)
      }
    }, 1000,)
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval,)
      this.monitoringInterval = undefined
    }

    if (this.eventLoopMonitor) {
      clearInterval(this.eventLoopMonitor,)
      this.eventLoopMonitor = undefined
    }

    if (this.gcObserver) {
      this.gcObserver.disconnect()
    }

    logger.info('Performance monitoring stopped', {
      component: 'PerformanceMonitor',
    },)
  }

  private async collectMetrics(): Promise<void> {
    const memory = process.memoryUsage()
    const cpu = process.cpuUsage()
    const eventLoopLag = await this.measureEventLoopLag()

    const metrics: PerformanceMetrics = {
      timestamp: performance.now(),
      memory,
      cpu,
      eventLoopLag,
      customMetrics: new Map(),
    }

    this.metricsHistory.push(metrics,)

    // Keep only last 1000 metrics to prevent memory leak
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000,)
    }

    // Check memory threshold
    const memoryUsageMB = memory.heapUsed / 1024 / 1024
    if (memoryUsageMB > this.thresholds.memoryUsage) {
      this.emit('alert', {
        type: 'memory',
        severity: memoryUsageMB > this.thresholds.memoryUsage * 1.5 ? 'critical' : 'high',
        message: `High memory usage detected: ${memoryUsageMB.toFixed(2,)}MB`,
        value: memoryUsageMB,
        threshold: this.thresholds.memoryUsage,
        timestamp: metrics.timestamp,
      },)
    }

    logger.trace('Performance metrics collected', {
      component: 'PerformanceMonitor',
      metadata: {
        memoryMB: memoryUsageMB.toFixed(2,),
        eventLoopLag: eventLoopLag.toFixed(2,),
        activeOperations: this.operationStack.length,
      },
    },)
  } // Operation profiling methods
  public startOperation(name: string, context?: LogContext, tags: string[] = [],): string {
    const operationId = `${name}_${performance.now()}_${Math.random().toString(36,).substr(2, 9,)}`

    const operation: OperationProfile = {
      name,
      startTime: performance.now(),
      memoryBefore: process.memoryUsage(),
      context,
      childOperations: [],
      tags,
    }

    this.operations.set(operationId, operation,)
    this.operationStack.push(operation,)

    logger.debug(`Started operation: ${name}`, {
      component: 'PerformanceMonitor',
      operation: name,
      metadata: { operationId, tags, },
      ...context,
    },)

    return operationId
  }

  public endOperation(operationId: string,): OperationProfile | null {
    const operation = this.operations.get(operationId,)
    if (!operation) {
      logger.warn(`Operation not found: ${operationId}`, {
        component: 'PerformanceMonitor',
      },)
      return null
    }

    operation.endTime = performance.now()
    operation.duration = operation.endTime - operation.startTime
    operation.memoryAfter = process.memoryUsage()

    // Calculate memory delta
    operation.memoryDelta = {
      rss: operation.memoryAfter.rss - operation.memoryBefore.rss,
      heapTotal: operation.memoryAfter.heapTotal - operation.memoryBefore.heapTotal,
      heapUsed: operation.memoryAfter.heapUsed - operation.memoryBefore.heapUsed,
      external: operation.memoryAfter.external - operation.memoryBefore.external,
    }

    // Remove from stack
    const stackIndex = this.operationStack.findIndex(op => op === operation)
    if (stackIndex !== -1) {
      this.operationStack.splice(stackIndex, 1,)
    }

    // Add to parent operation if exists
    if (this.operationStack.length > 0) {
      const parentOperation = this.operationStack[this.operationStack.length - 1]
      parentOperation.childOperations.push(operation,)
    }

    // Check operation duration threshold
    if (operation.duration > this.thresholds.operationDuration) {
      this.emit('alert', {
        type: 'operation',
        severity: operation.duration > this.thresholds.operationDuration * 2 ? 'high' : 'medium',
        message: `Long operation detected: ${operation.name} took ${
          operation.duration.toFixed(2,)
        }ms`,
        value: operation.duration,
        threshold: this.thresholds.operationDuration,
        timestamp: operation.endTime,
        context: operation.context,
      },)
    }

    logger.debug(`Completed operation: ${operation.name}`, {
      component: 'PerformanceMonitor',
      operation: operation.name,
      metadata: {
        duration: `${operation.duration.toFixed(2,)}ms`,
        memoryDelta: `${(operation.memoryDelta.heapUsed! / 1024 / 1024).toFixed(2,)}MB`,
        tags: operation.tags,
      },
      ...operation.context,
    },)

    return operation
  }

  public profileFunction<T,>(
    name: string,
    fn: () => T,
    context?: LogContext,
    tags: string[] = [],
  ): T
  public profileFunction<T,>(
    name: string,
    fn: () => Promise<T>,
    context?: LogContext,
    tags: string[] = [],
  ): Promise<T>
  public profileFunction<T,>(
    name: string,
    fn: () => T | Promise<T>,
    context?: LogContext,
    tags: string[] = [],
  ): T | Promise<T> {
    const operationId = this.startOperation(name, context, tags,)

    try {
      const result = fn()

      if (result instanceof Promise) {
        return result
          .then((value,) => {
            this.endOperation(operationId,)
            return value
          },)
          .catch((error,) => {
            this.endOperation(operationId,)
            throw error
          },)
      } else {
        this.endOperation(operationId,)
        return result
      }
    } catch (error) {
      this.endOperation(operationId,)
      throw error
    }
  }

  // Metrics and reporting methods
  public addCustomMetric(name: string, value: number,): void {
    const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1]
    if (latestMetrics) {
      latestMetrics.customMetrics.set(name, value,)
    }

    logger.trace(`Custom metric recorded: ${name}`, {
      component: 'PerformanceMonitor',
      metadata: { metricName: name, value, },
    },)
  }

  public getMetricsSnapshot(): PerformanceMetrics {
    return {
      timestamp: performance.now(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      eventLoopLag: 0, // Will be updated asynchronously
      customMetrics: new Map(),
    }
  }

  public getActiveOperations(): OperationProfile[] {
    return [...this.operationStack,]
  }

  public getCompletedOperations(): OperationProfile[] {
    return Array.from(this.operations.values(),).filter(op => op.endTime !== undefined)
  }
  public generateReport(): PerformanceReport {
    const completedOperations = this.getCompletedOperations()
    const alerts: PerformanceAlert[] = []

    // Calculate summary statistics
    const operationDurations = completedOperations.map(op => op.duration!).filter(d =>
      d !== undefined
    )
    const memoryDeltas = completedOperations.map(op => op.memoryDelta?.heapUsed || 0)
    const eventLoopLags = this.metricsHistory.map(m => m.eventLoopLag)

    const summary = {
      totalOperations: completedOperations.length,
      averageOperationTime: operationDurations.length > 0
        ? operationDurations.reduce((sum, d,) => sum + d, 0,) / operationDurations.length
        : 0,
      longestOperation: completedOperations.reduce(
        (longest, op,) => (op.duration! > (longest?.duration || 0)) ? op : longest,
        completedOperations[0],
      )?.name || 'N/A',
      shortestOperation: completedOperations.reduce(
        (shortest, op,) => (op.duration! < (shortest?.duration || Infinity)) ? op : shortest,
        completedOperations[0],
      )?.name || 'N/A',
      totalMemoryUsed: memoryDeltas.reduce((sum, delta,) => sum + Math.max(0, delta,), 0,),
      peakMemoryUsage: Math.max(...this.metricsHistory.map(m => m.memory.heapUsed), 0,),
      avgEventLoopLag: eventLoopLags.length > 0
        ? eventLoopLags.reduce((sum, lag,) => sum + lag, 0,) / eventLoopLags.length
        : 0,
      gcCount: 0, // Updated from GC observer
      totalGCTime: 0, // Updated from GC observer
    }

    const recommendations = this.generateRecommendations(summary, completedOperations,)

    const report: PerformanceReport = {
      summary,
      operations: completedOperations,
      systemMetrics: [...this.metricsHistory,],
      alerts,
      recommendations,
    }

    logger.info('Performance report generated', {
      component: 'PerformanceMonitor',
      metadata: {
        totalOperations: summary.totalOperations,
        avgOperationTime: `${summary.averageOperationTime.toFixed(2,)}ms`,
        peakMemoryMB: `${(summary.peakMemoryUsage / 1024 / 1024).toFixed(2,)}MB`,
        recommendationCount: recommendations.length,
      },
    },)

    return report
  }

  private generateRecommendations(
    summary: PerformanceReport['summary'],
    operations: OperationProfile[],
  ): string[] {
    const recommendations: string[] = []

    // Memory recommendations
    if (summary.peakMemoryUsage > this.thresholds.memoryUsage * 1024 * 1024) {
      recommendations.push(
        `Consider optimizing memory usage. Peak usage: ${
          (summary.peakMemoryUsage / 1024 / 1024).toFixed(2,)
        }MB`,
      )
    }

    // Operation duration recommendations
    const longOperations = operations.filter(op => op.duration! > this.thresholds.operationDuration)
    if (longOperations.length > 0) {
      recommendations.push(
        `${longOperations.length} operations exceeded duration threshold. Consider optimization.`,
      )
    }

    // Event loop lag recommendations
    if (summary.avgEventLoopLag > this.thresholds.eventLoopLag) {
      recommendations.push(
        `High average event loop lag (${
          summary.avgEventLoopLag.toFixed(2,)
        }ms). Consider using worker threads for CPU-intensive tasks.`,
      )
    }

    // Frequent GC recommendations
    if (summary.gcCount > 100) {
      recommendations.push(
        `Frequent garbage collection detected (${summary.gcCount} times). Review object allocation patterns.`,
      )
    }

    // Memory leak detection
    const memoryTrend = this.analyzeMemoryTrend()
    if (memoryTrend === 'increasing') {
      recommendations.push(
        'Potential memory leak detected. Memory usage is consistently increasing over time.',
      )
    }

    return recommendations
  }

  private analyzeMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.metricsHistory.length < 10) return 'stable'

    const recent = this.metricsHistory.slice(-10,)
    const older = this.metricsHistory.slice(-20, -10,)

    const recentAvg = recent.reduce((sum, m,) => sum + m.memory.heapUsed, 0,) / recent.length
    const olderAvg = older.length > 0
      ? older.reduce((sum, m,) => sum + m.memory.heapUsed, 0,) / older.length
      : recentAvg

    const threshold = 10 * 1024 * 1024 // 10MB threshold

    if (recentAvg - olderAvg > threshold) return 'increasing'
    if (olderAvg - recentAvg > threshold) return 'decreasing'
    return 'stable'
  }

  public exportReport(report: PerformanceReport, format: 'json' | 'csv' = 'json',): string {
    if (format === 'json') {
      return JSON.stringify(report, (key, value,) => {
        if (value instanceof Map) {
          return Object.fromEntries(value,)
        }
        return value
      }, 2,)
    }

    if (format === 'csv') {
      const csvLines = ['Operation,Duration (ms),Memory Delta (MB),Tags',]

      report.operations.forEach(op => {
        const memoryDeltaMB = (op.memoryDelta?.heapUsed || 0) / 1024 / 1024
        csvLines.push(
          `"${op.name}",${op.duration?.toFixed(2,)},${memoryDeltaMB.toFixed(2,)},"${
            op.tags.join(';',)
          }"`,
        )
      },)

      return csvLines.join('\n',)
    }

    throw new Error(`Unsupported export format: ${format}`,)
  }

  // Utility methods
  public reset(): void {
    this.operations.clear()
    this.operationStack = []
    this.metricsHistory = []
    this.startTime = performance.now()

    logger.info('Performance monitor reset', {
      component: 'PerformanceMonitor',
    },)
  }

  public setThresholds(thresholds: Partial<PerformanceThresholds>,): void {
    this.thresholds = { ...this.thresholds, ...thresholds, }

    logger.info('Performance thresholds updated', {
      component: 'PerformanceMonitor',
      metadata: this.thresholds,
    },)
  }

  public getUptime(): number {
    return performance.now() - this.startTime
  }

  public getStats(): {
    uptime: number
    totalOperations: number
    activeOperations: number
    metricsCollected: number
  } {
    return {
      uptime: this.getUptime(),
      totalOperations: this.operations.size,
      activeOperations: this.operationStack.length,
      metricsCollected: this.metricsHistory.length,
    }
  }

  // Cleanup
  public destroy(): void {
    this.stopMonitoring()
    this.removeAllListeners()
    this.operations.clear()
    this.operationStack = []
    this.metricsHistory = []

    logger.info('Performance monitor destroyed', {
      component: 'PerformanceMonitor',
    },)
  }
}

// Default performance monitor instance
export const defaultPerformanceMonitor = new PerformanceMonitor()

// Convenience functions
export const performanceMonitor = {
  startOperation: (name: string, context?: LogContext, tags?: string[],) =>
    defaultPerformanceMonitor.startOperation(name, context, tags,),
  endOperation: (operationId: string,) => defaultPerformanceMonitor.endOperation(operationId,),
  profileFunction: <T,>(
    name: string,
    fn: () => T | Promise<T>,
    context?: LogContext,
    tags?: string[],
  ) => defaultPerformanceMonitor.profileFunction(name, fn, context, tags,),
  addCustomMetric: (name: string, value: number,) =>
    defaultPerformanceMonitor.addCustomMetric(name, value,),
  generateReport: () => defaultPerformanceMonitor.generateReport(),
  exportReport: (report: PerformanceReport, format?: 'json' | 'csv',) =>
    defaultPerformanceMonitor.exportReport(report, format,),
  getStats: () => defaultPerformanceMonitor.getStats(),
}
