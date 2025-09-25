// T029: Metrics instrumentation for AI Chat
// Purpose: Track latency, refusals, rate limits, and compliance metrics for monitoring
// File: packages/core-services/src/metrics/aiChat.ts

export interface AIMetrics {
  // Latency metrics
  responseTime: number // milliseconds
  firstTokenTime?: number // milliseconds (for streaming)
  totalTokens?: number

  // Quality metrics
  refusalCount: number
  successCount: number
  errorCount: number

  // Rate limiting
  rateLimitHits: number
  rateLimitRemaining: number

  // Compliance
  piiDetections: number
  consentValidations: number
  auditEvents: number
}

export interface MetricEvent {
  timestamp: string
  _userId?: string
  clinicId?: string
  sessionId?: string
  eventType:
    | 'query'
    | 'explanation'
    | 'rate_limit'
    | 'refusal'
    | 'error'
    | 'success'
  metrics: Partial<AIMetrics>
  metadata?: Record<string, any>
}

export class AIChatMetrics {
  private metrics: Map<string, AIMetrics> = new Map()
  private events: MetricEvent[] = []
  private maxEventsRetention = 10000 // Keep last 10k events

  /**
   * Record a new AI chat interaction
   */
  recordInteraction(event: Omit<MetricEvent, 'timestamp'>): void {
    const timestamp = new Date().toISOString()
    const fullEvent: MetricEvent = {
      ...event,
      timestamp,
    }

    // Add to events history
    this.events.push(fullEvent)

    // Trim old events if necessary
    if (this.events.length > this.maxEventsRetention) {
      this.events = this.events.slice(-this.maxEventsRetention)
    }

    // Update aggregated metrics by clinic
    const clinicKey = event.clinicId || 'unknown'
    this.updateAggregatedMetrics(clinicKey, event.metrics)
  }

  /**
   * Record successful AI query completion
   */
  recordSuccess(params: {
    _userId?: string
    clinicId?: string
    sessionId?: string
    responseTime: number
    firstTokenTime?: number
    totalTokens?: number
    piiDetected?: boolean
  }): void {
    this.recordInteraction({
      _userId: params._userId,
      clinicId: params.clinicId,
      sessionId: params.sessionId,
      eventType: 'success',
      metrics: {
        responseTime: params.responseTime,
        firstTokenTime: params.firstTokenTime,
        totalTokens: params.totalTokens,
        successCount: 1,
        piiDetections: params.piiDetected ? 1 : 0,
        consentValidations: 1, // Always validate consent
        auditEvents: 1,
      },
    })
  }

  /**
   * Record AI query refusal (due to content policy, etc.)
   */
  recordRefusal(params: {
    _userId?: string
    clinicId?: string
    sessionId?: string
    reason: string
    responseTime: number
  }): void {
    this.recordInteraction({
      _userId: params._userId,
      clinicId: params.clinicId,
      sessionId: params.sessionId,
      eventType: 'refusal',
      metrics: {
        responseTime: params.responseTime,
        refusalCount: 1,
        auditEvents: 1,
      },
      metadata: {
        refusalReason: params.reason,
      },
    })
  }

  /**
   * Record rate limit hit
   */
  recordRateLimit(params: {
    _userId?: string
    clinicId?: string
    limitType: 'perMinute' | 'perHour' | 'perDay'
    remaining: number
  }): void {
    this.recordInteraction({
      _userId: params._userId,
      clinicId: params.clinicId,
      eventType: 'rate_limit',
      metrics: {
        rateLimitHits: 1,
        rateLimitRemaining: params.remaining,
        auditEvents: 1,
      },
      metadata: {
        limitType: params.limitType,
      },
    })
  }

  /**
   * Record error occurrence
   */
  recordError(params: {
    _userId?: string
    clinicId?: string
    sessionId?: string
    errorType: string
    errorCode?: string
    responseTime?: number
  }): void {
    this.recordInteraction({
      _userId: params._userId,
      clinicId: params.clinicId,
      sessionId: params.sessionId,
      eventType: 'error',
      metrics: {
        responseTime: params.responseTime || 0,
        errorCount: 1,
        auditEvents: 1,
      },
      metadata: {
        errorType: params.errorType,
        errorCode: params.errorCode,
      },
    })
  }

  /**
   * Get aggregated metrics for a clinic
   */
  getClinicMetrics(clinicId: string): AIMetrics | null {
    return this.metrics.get(clinicId) || null
  }

  /**
   * Get overall system metrics
   */
  getSystemMetrics(): AIMetrics {
    const allMetrics = Array.from(this.metrics.values())

    if (allMetrics.length === 0) {
      return this.createEmptyMetrics()
    }

    return allMetrics.reduce((acc, current) => ({
      responseTime: (acc.responseTime + current.responseTime) / 2, // Average
      firstTokenTime: acc.firstTokenTime && current.firstTokenTime
        ? (acc.firstTokenTime + current.firstTokenTime) / 2
        : acc.firstTokenTime || current.firstTokenTime,
      totalTokens: (acc.totalTokens || 0) + (current.totalTokens || 0),
      refusalCount: acc.refusalCount + current.refusalCount,
      successCount: acc.successCount + current.successCount,
      errorCount: acc.errorCount + current.errorCount,
      rateLimitHits: acc.rateLimitHits + current.rateLimitHits,
      rateLimitRemaining: Math.min(
        acc.rateLimitRemaining,
        current.rateLimitRemaining,
      ),
      piiDetections: acc.piiDetections + current.piiDetections,
      consentValidations: acc.consentValidations + current.consentValidations,
      auditEvents: acc.auditEvents + current.auditEvents,
    }))
  }

  /**
   * Get recent events for analysis
   */
  getRecentEvents(limit = 100): MetricEvent[] {
    return this.events.slice(-limit)
  }

  /**
   * Get performance percentiles
   */
  getPerformanceStats(clinicId?: string): {
    p50: number
    p95: number
    p99: number
    average: number
    count: number
  } {
    const events = clinicId
      ? this.events.filter(e => e.clinicId === clinicId)
      : this.events

    const responseTimes = events
      .filter(e => e.metrics.responseTime)
      .map(e => e.metrics.responseTime!)
      .sort((a, b) => a - b)

    if (responseTimes.length === 0) {
      return { p50: 0, p95: 0, p99: 0, average: 0, count: 0 }
    }

    const getPercentile = (arr: number[], p: number) => {
      const index = Math.ceil((arr.length * p) / 100) - 1
      return arr[index] || 0
    }

    return {
      p50: getPercentile(responseTimes, 50),
      p95: getPercentile(responseTimes, 95),
      p99: getPercentile(responseTimes, 99),
      average: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      count: responseTimes.length,
    }
  }

  /**
   * Get compliance metrics summary
   */
  getComplianceStats(clinicId?: string): {
    piiDetectionRate: number
    consentValidationRate: number
    auditCoverage: number
    totalInteractions: number
  } {
    const events = clinicId
      ? this.events.filter(e => e.clinicId === clinicId)
      : this.events

    const totalInteractions = events.length
    const piiDetections = events.reduce(
      (sum, e) => sum + (e.metrics.piiDetections || 0),
      0,
    )
    const consentValidations = events.reduce(
      (sum, e) => sum + (e.metrics.consentValidations || 0),
      0,
    )
    const auditEvents = events.reduce(
      (sum, e) => sum + (e.metrics.auditEvents || 0),
      0,
    )

    return {
      piiDetectionRate: totalInteractions > 0 ? (piiDetections / totalInteractions) * 100 : 0,
      consentValidationRate: totalInteractions > 0
        ? (consentValidations / totalInteractions) * 100
        : 0,
      auditCoverage: totalInteractions > 0 ? (auditEvents / totalInteractions) * 100 : 0,
      totalInteractions,
    }
  }

  /**
   * Get rate limiting analysis
   */
  getRateLimitingStats(clinicId?: string): {
    hitRate: number
    averageRemaining: number
    totalHits: number
    lastHit?: string
  } {
    const events = clinicId
      ? this.events.filter(e => e.clinicId === clinicId)
      : this.events

    const rateLimitEvents = events.filter(e => e.eventType === 'rate_limit')
    const totalInteractions = events.length
    const totalHits = rateLimitEvents.reduce(
      (sum, e) => sum + (e.metrics.rateLimitHits || 0),
      0,
    )

    const remainingValues = events
      .filter(e => e.metrics.rateLimitRemaining !== undefined)
      .map(e => e.metrics.rateLimitRemaining!)

    const averageRemaining = remainingValues.length > 0
      ? remainingValues.reduce((a, b) => a + b, 0) / remainingValues.length
      : 0

    const lastHitEvent = rateLimitEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0]

    return {
      hitRate: totalInteractions > 0 ? (totalHits / totalInteractions) * 100 : 0,
      averageRemaining,
      totalHits,
      lastHit: lastHitEvent?.timestamp,
    }
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(): {
    timestamp: string
    systemMetrics: AIMetrics
    performanceStats: any
    complianceStats: any
    rateLimitingStats: any
    clinicMetrics: Array<{ clinicId: string; metrics: AIMetrics }>
  } {
    const clinicMetrics = Array.from(this.metrics.entries()).map(
      ([clinicId, metrics]) => ({
        clinicId,
        metrics,
      }),
    )

    return {
      timestamp: new Date().toISOString(),
      systemMetrics: this.getSystemMetrics(),
      performanceStats: this.getPerformanceStats(),
      complianceStats: this.getComplianceStats(),
      rateLimitingStats: this.getRateLimitingStats(),
      clinicMetrics,
    }
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.metrics.clear()
    this.events = []
  }

  private updateAggregatedMetrics(
    clinicKey: string,
    newMetrics: Partial<AIMetrics>,
  ): void {
    const existing = this.metrics.get(clinicKey) || this.createEmptyMetrics()

    const updated: AIMetrics = {
      responseTime: this.updateAverage(
        existing.responseTime,
        newMetrics.responseTime,
      ),
      firstTokenTime: this.updateAverage(
        existing.firstTokenTime,
        newMetrics.firstTokenTime,
      ),
      totalTokens: (existing.totalTokens || 0) + (newMetrics.totalTokens || 0),
      refusalCount: existing.refusalCount + (newMetrics.refusalCount || 0),
      successCount: existing.successCount + (newMetrics.successCount || 0),
      errorCount: existing.errorCount + (newMetrics.errorCount || 0),
      rateLimitHits: existing.rateLimitHits + (newMetrics.rateLimitHits || 0),
      rateLimitRemaining: newMetrics.rateLimitRemaining ?? existing.rateLimitRemaining,
      piiDetections: existing.piiDetections + (newMetrics.piiDetections || 0),
      consentValidations: existing.consentValidations + (newMetrics.consentValidations || 0),
      auditEvents: existing.auditEvents + (newMetrics.auditEvents || 0),
    }

    this.metrics.set(clinicKey, updated)
  }

  private updateAverage(existing?: number, newValue?: number): number {
    if (existing === undefined) return newValue || 0
    if (newValue === undefined) return existing
    return (existing + newValue) / 2
  }

  private createEmptyMetrics(): AIMetrics {
    return {
      responseTime: 0,
      firstTokenTime: undefined,
      totalTokens: 0,
      refusalCount: 0,
      successCount: 0,
      errorCount: 0,
      rateLimitHits: 0,
      rateLimitRemaining: 100, // Default assumption
      piiDetections: 0,
      consentValidations: 0,
      auditEvents: 0,
    }
  }
}

// Global metrics instance
export const aiChatMetrics = new AIChatMetrics()

// Convenience functions for common use cases
export const recordAISuccess = (
  params: Parameters<AIChatMetrics['recordSuccess']>[0],
) => {
  aiChatMetrics.recordSuccess(params)
}

export const recordAIRefusal = (
  params: Parameters<AIChatMetrics['recordRefusal']>[0],
) => {
  aiChatMetrics.recordRefusal(params)
}

export const recordAIError = (
  params: Parameters<AIChatMetrics['recordError']>[0],
) => {
  aiChatMetrics.recordError(params)
}

export const recordRateLimit = (
  params: Parameters<AIChatMetrics['recordRateLimit']>[0],
) => {
  aiChatMetrics.recordRateLimit(params)
}

export default AIChatMetrics
