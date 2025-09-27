// Browser-compatible performance API
const getPerformance = () => {
  if (typeof performance !== 'undefined') {
    return performance
  }
  // Fallback for Node.js environments
  try {
    return require('perf_hooks').performance
  } catch {
    // Minimal fallback
    return {
      now: () => Date.now(),
    }
  }
}

const perf = getPerformance()

// Healthcare Compliance Framework Constants
const COMPLIANCE_FRAMEWORKS = {
  LGPD: 'Lei Geral de Proteção de Dados',
  ANVISA: 'Agência Nacional de Vigilância Sanitária',
  CFM: 'Conselho Federal de Medicina',
  HIPAA: 'Health Insurance Portability and Accountability Act',
} as const

// Security Event Types for Healthcare
const SECURITY_EVENT_TYPES = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATA_ACCESS: 'data_access',
  DATA_MODIFICATION: 'data_modification',
  AUDIT_TRAIL: 'audit_trail',
  SECURITY_VIOLATION: 'security_violation',
  ANOMALY_DETECTED: 'anomaly_detected',
  COMPLIANCE_CHECK: 'compliance_check',
} as const

// Performance Metrics Interface
interface PerformanceMetrics {
  totalLogs: number
  errorLogs: number
  warnLogs: number
  infoLogs: number
  debugLogs: number
  averageProcessingTime: number
  memoryUsage: number
  bufferSize: number
  droppedLogs: number
}

// Healthcare Compliance Metadata
interface HealthcareComplianceMetadata {
  patientId?: string
  professionalId?: string
  dataType: 'phi' | 'pii' | 'medical_data' | 'administrative' | 'system'
  retentionPeriod: string
  consentVerified: boolean
  dataClassification: 'public' | 'restricted' | 'confidential' | 'highly_confidential'
  legalBasis: string
}

// Security Event Context
interface SecurityEventContext {
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action: string
  result: 'success' | 'failure' | 'blocked' | 'warning'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

// Optimized Log Entry Structure
interface OptimizedLogEntry {
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  metadata?: Record<string, any>
  compliance?: HealthcareComplianceMetadata
  security?: SecurityEventContext
  performanceMs?: number
  traceId?: string
  spanId?: string
}

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
  BUFFER_SIZE: 1000,
  FLUSH_INTERVAL: 5000,
  MAX_BATCH_SIZE: 100,
  PERFORMANCE_THRESHOLD: 5, // ms
  MEMORY_CHECK_INTERVAL: 30000,
} as const

export class HealthcareLogger {
  private static instance: HealthcareLogger
  private logBuffer: OptimizedLogEntry[] = []
  private performanceMetrics: PerformanceMetrics = {
    totalLogs: 0,
    errorLogs: 0,
    warnLogs: 0,
    infoLogs: 0,
    debugLogs: 0,
    averageProcessingTime: 0,
    memoryUsage: 0,
    bufferSize: 0,
    droppedLogs: 0,
  }
  private flushTimer: NodeJS.Timeout | null = null
  private processingTimes: number[] = []
  private isInitialized = false

  private constructor() {
    this.initializeOptimizedLogging()
  }

  static getInstance(): HealthcareLogger {
    if (!HealthcareLogger.instance) {
      HealthcareLogger.instance = new HealthcareLogger()
    }
    return HealthcareLogger.instance
  }

  private initializeOptimizedLogging(): void {
    this.startFlushTimer()
    this.startPerformanceMonitoring()
    this.isInitialized = true
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushBuffer()
    }, PERFORMANCE_CONFIG.FLUSH_INTERVAL)
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.updatePerformanceMetrics()
      this.checkMemoryUsage()
    }, PERFORMANCE_CONFIG.MEMORY_CHECK_INTERVAL)
  }

  private updatePerformanceMetrics(): void {
    if (this.processingTimes.length > 0) {
      const avgTime = this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length
      this.performanceMetrics.averageProcessingTime = avgTime
      this.performanceMetrics.bufferSize = this.logBuffer.length

      // Keep only recent measurements for rolling average
      if (this.processingTimes.length > 1000) {
        this.processingTimes = this.processingTimes.slice(-500)
      }
    }
  }

  private checkMemoryUsage(): void {
    const used = process.memoryUsage()
    this.performanceMetrics.memoryUsage = used.heapUsed / 1024 / 1024 // MB

    // Memory pressure handling
    if (used.heapUsed / used.heapTotal > 0.9) {
      this.warn('Memory pressure detected - flushing buffer immediately', {
        heapUsed: used.heapUsed,
        heapTotal: used.heapTotal,
        bufferSize: this.logBuffer.length,
      })
      this.flushBuffer()
    }
  }

  private createLogEntry(
    level: OptimizedLogEntry['level'],
    message: string,
    metadata?: Record<string, any>,
    compliance?: HealthcareComplianceMetadata,
    security?: SecurityEventContext,
  ): OptimizedLogEntry {
    const startTime = perf.now()

    const entry: OptimizedLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      compliance,
      security,
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
    }

    const processingTime = perf.now() - startTime
    entry.performanceMs = processingTime
    this.processingTimes.push(processingTime)

    return entry
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSpanId(): string {
    return `span_${Math.random().toString(36).substr(2, 6)}`
  }

  private addToBuffer(entry: OptimizedLogEntry): void {
    // Buffer overflow protection
    if (this.logBuffer.length >= PERFORMANCE_CONFIG.BUFFER_SIZE) {
      this.performanceMetrics.droppedLogs++
      this.flushBuffer()
    }

    this.logBuffer.push(entry)
    this.updateMetrics(entry.level)

    // Auto-flush for critical errors
    if (entry.level === 'error' || entry.security?.riskLevel === 'critical') {
      this.flushBuffer()
    }
  }

  private updateMetrics(level: OptimizedLogEntry['level']): void {
    this.performanceMetrics.totalLogs++
    switch (level) {
      case 'error':
        this.performanceMetrics.errorLogs++
        break
      case 'warn':
        this.performanceMetrics.warnLogs++
        break
      case 'info':
        this.performanceMetrics.infoLogs++
        break
      case 'debug':
        this.performanceMetrics.debugLogs++
        break
    }
  }

  private flushBuffer(): void {
    if (this.logBuffer.length === 0) return

    const batch = this.logBuffer.splice(0, PERFORMANCE_CONFIG.MAX_BATCH_SIZE)

    // Process batch with optimized formatting
    batch.forEach(entry => {
      this.outputLogEntry(entry)
    })

    // If still more logs, schedule immediate flush
    if (this.logBuffer.length > 0) {
      setImmediate(() => this.flushBuffer())
    }
  }

  private outputLogEntry(entry: OptimizedLogEntry): void {
    const formatted = this.formatLogEntry(entry)

    // Use appropriate console method based on level
    switch (entry.level) {
      case 'error':
        console.error(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'info':
        console.info(formatted)
        break
      case 'debug':
        console.debug(formatted)
        break
    }
  }

  private formatLogEntry(entry: OptimizedLogEntry): string {
    const baseMessage = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`

    const parts = [baseMessage]

    // Add performance metrics
    if (entry.performanceMs && entry.performanceMs > PERFORMANCE_CONFIG.PERFORMANCE_THRESHOLD) {
      parts.push(`⚡ ${entry.performanceMs.toFixed(2)}ms`)
    }

    // Add security context
    if (entry.security) {
      const securityInfo =
        `🔒 ${entry.security.action}:${entry.security.result} (${entry.security.riskLevel})`
      parts.push(securityInfo)
    }

    // Add compliance info
    if (entry.compliance) {
      const complianceInfo =
        `🏥 ${entry.compliance.dataClassification} | ${entry.compliance.dataType}`
      parts.push(complianceInfo)
    }

    // Add trace information
    if (entry.traceId) {
      parts.push(`📊 ${entry.traceId}:${entry.spanId}`)
    }

    // Add metadata if present
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      const metadataStr = JSON.stringify(entry.metadata)
      if (metadataStr.length < 200) { // Don't overwhelm console
        parts.push(metadataStr)
      } else {
        parts.push('📦 [complex metadata omitted]')
      }
    }

    return parts.join(' | ')
  }

  // Core logging methods with optimization
  log(level: string, message: string, metadata?: any): void {
    const entry = this.createLogEntry('info', message, metadata)
    this.addToBuffer(entry)
  }

  error(message: string, error?: Error | any, metadata?: any): void {
    const errorMetadata = {
      ...metadata,
      ...(error instanceof Error
        ? {
          errorMessage: error.message,
          stackTrace: error.stack,
          errorName: error.name,
        }
        : { error }),
    }

    const entry = this.createLogEntry('error', message, errorMetadata)
    this.addToBuffer(entry)
  }

  warn(message: string, metadata?: any): void {
    const entry = this.createLogEntry('warn', message, metadata)
    this.addToBuffer(entry)
  }

  info(message: string, metadata?: any): void {
    const entry = this.createLogEntry('info', message, metadata)
    this.addToBuffer(entry)
  }

  debug(message: string, metadata?: any): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_LOGGING === 'true') {
      const entry = this.createLogEntry('debug', message, metadata)
      this.addToBuffer(entry)
    }
  }

  // Healthcare Compliance Logging
  logComplianceEvent(
    message: string,
    compliance: HealthcareComplianceMetadata,
    security?: SecurityEventContext,
    level: OptimizedLogEntry['level'] = 'info',
  ): void {
    const entry = this.createLogEntry(level, message, undefined, compliance, security)
    this.addToBuffer(entry)
  }

  // Security Event Logging
  logSecurityEvent(
    eventType: keyof typeof SECURITY_EVENT_TYPES,
    action: string,
    result: SecurityEventContext['result'],
    riskLevel: SecurityEventContext['riskLevel'],
    message: string,
    context?: Partial<SecurityEventContext>,
  ): void {
    const securityContext: SecurityEventContext = {
      action,
      result,
      riskLevel,
      ...context,
    }

    const compliance: HealthcareComplianceMetadata = {
      dataType: 'system',
      retentionPeriod: '7 years',
      consentVerified: false,
      dataClassification: riskLevel === 'critical' ? 'highly_confidential' : 'confidential',
      legalBasis: 'security_monitoring',
    }

    this.logComplianceEvent(
      `[SECURITY] ${eventType}: ${message}`,
      compliance,
      securityContext,
      riskLevel === 'critical' ? 'error' : riskLevel === 'high' ? 'warn' : 'info',
    )
  }

  // Performance Monitoring API
  getPerformanceMetrics(): PerformanceMetrics {
    this.updatePerformanceMetrics()
    return { ...this.performanceMetrics }
  }

  getOptimizationStats(): {
    bufferEfficiency: number
    averageProcessingTime: number
    throughputPerSecond: number
    memoryEfficiency: number
  } {
    const metrics = this.getPerformanceMetrics()
    const uptime = process.uptime()

    return {
      bufferEfficiency: (metrics.totalLogs - metrics.droppedLogs) / metrics.totalLogs * 100,
      averageProcessingTime: metrics.averageProcessingTime,
      throughputPerSecond: metrics.totalLogs / uptime,
      memoryEfficiency: metrics.bufferSize / PERFORMANCE_CONFIG.BUFFER_SIZE * 100,
    }
  }

  // Health check
  healthCheck(): { status: 'healthy' | 'degraded' | 'unhealthy'; issues: string[] } {
    const issues: string[] = []
    const metrics = this.getPerformanceMetrics()

    if (metrics.averageProcessingTime > PERFORMANCE_CONFIG.PERFORMANCE_THRESHOLD * 2) {
      issues.push('High processing time detected')
    }

    if (metrics.droppedLogs > metrics.totalLogs * 0.01) { // >1% dropped
      issues.push('High log drop rate detected')
    }

    if (metrics.memoryUsage > 500) { // >500MB
      issues.push('High memory usage detected')
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (issues.length > 2) status = 'unhealthy'
    else if (issues.length > 0) status = 'degraded'

    return { status, issues }
  }

  // Cleanup resources
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }

    // Flush remaining logs
    this.flushBuffer()

    this.isInitialized = false
  }
}

// Export singleton instance
export const healthcareLogger = HealthcareLogger.getInstance()

// Export utilities for easy import
export const { log, error, warn, info, debug, logComplianceEvent, logSecurityEvent } =
  healthcareLogger
export {
  COMPLIANCE_FRAMEWORKS,
  type HealthcareComplianceMetadata,
  type PerformanceMetrics,
  SECURITY_EVENT_TYPES,
  type SecurityEventContext,
}
