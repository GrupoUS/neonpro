/**
 * HTTPS Handshake Performance Monitoring Service
 *
 * Monitors TLS handshake performance with ≤300ms compliance requirement
 * for healthcare applications.
 */

import { logger } from '../../utils/secure-logger'

export interface TLSHandshakeMetrics {
  handshakeTimeMs: number
  tlsVersion: string
  cipherSuite: string
  serverName: string
  clientHelloTime: number
  serverHelloTime: number
  certificateTime: number
  keyExchangeTime: number
  finishedTime: number
  alpnProtocol?: string
  ocspStapling: boolean
  certificateTransparency: boolean
  sessionId: string
}

export interface HTTPSMonitoringConfig {
  maxHandshakeTimeMs: number
  warningThresholdMs: number
  sampleRate: number
  enabledProtocols: string[]
  enabledCipherSuites: string[]
  monitoringInterval: number
  alertThreshold: number
}

export interface MonitoringAlert {
  id: string
  type:
    | 'handshake_timeout'
    | 'degraded_performance'
    | 'protocol_deprecated'
    | 'cipher_weak'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metrics: TLSHandshakeMetrics
  timestamp: string
  resolved: boolean
}

export class HTTPSMonitoringService {
  private metrics: Map<string, TLSHandshakeMetrics[]> = new Map()
  private alerts: MonitoringAlert[] = []
  private config: HTTPSMonitoringConfig
  private monitoringInterval?: NodeJS.Timeout

  constructor(config?: Partial<HTTPSMonitoringConfig>) {
    this.config = {
      maxHandshakeTimeMs: 300,
      warningThresholdMs: 200,
      sampleRate: 0.1, // 10% sampling
      enabledProtocols: ['TLSv1.2', 'TLSv1.3'],
      enabledCipherSuites: [
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_128_GCM_SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
      ],
      monitoringInterval: 30000, // 30 seconds
      alertThreshold: 5, // 5 alerts before escalation
      ...config,
    }

    this.startMonitoring()
  }

  /**
   * Record TLS handshake metrics
   */
  async recordHandshakeMetrics(metrics: TLSHandshakeMetrics): Promise<void> {
    // Sample based on configuration
    if (Math.random() > this.config.sampleRate) {
      return
    }

    const serverName = metrics.serverName || 'default'
    const existingMetrics = this.metrics.get(serverName) || []

    // Keep only last 1000 metrics per server
    const updatedMetrics = [...existingMetrics.slice(-999), metrics]
    this.metrics.set(serverName, updatedMetrics)

    // Check for compliance violations
    await this.checkCompliance(metrics)

    // Log metrics
    logger.performance(
      'https_handshake',
      'TLS handshake completed',
      {
        serverName,
        handshakeTimeMs: metrics.handshakeTimeMs,
        tlsVersion: metrics.tlsVersion,
        cipherSuite: metrics.cipherSuite,
        sessionId: metrics.sessionId,
      },
      {
        compliance: metrics.handshakeTimeMs <= this.config.maxHandshakeTimeMs,
        performance: metrics.handshakeTimeMs <= this.config.warningThresholdMs,
      },
    )
  }

  /**
   * Check compliance with healthcare requirements
   */
  private async checkCompliance(metrics: TLSHandshakeMetrics): Promise<void> {
    // Check handshake time (≤300ms requirement)
    if (metrics.handshakeTimeMs > this.config.maxHandshakeTimeMs) {
      await this.createAlert({
        id: `handshake_timeout_${Date.now()}`,
        type: 'handshake_timeout',
        severity: metrics.handshakeTimeMs > 500 ? 'critical' : 'high',
        message:
          `TLS handshake time (${metrics.handshakeTimeMs}ms) exceeds healthcare requirement of ${this.config.maxHandshakeTimeMs}ms`,
        metrics,
        timestamp: new Date().toISOString(),
        resolved: false,
      })
    }

    // Check for performance degradation
    if (metrics.handshakeTimeMs > this.config.warningThresholdMs) {
      await this.createAlert({
        id: `degraded_performance_${Date.now()}`,
        type: 'degraded_performance',
        severity: 'medium',
        message:
          `TLS handshake time (${metrics.handshakeTimeMs}ms) is above warning threshold of ${this.config.warningThresholdMs}ms`,
        metrics,
        timestamp: new Date().toISOString(),
        resolved: false,
      })
    }

    // Check TLS version
    if (!this.config.enabledProtocols.includes(metrics.tlsVersion)) {
      await this.createAlert({
        id: `protocol_deprecated_${Date.now()}`,
        type: 'protocol_deprecated',
        severity: 'high',
        message: `Deprecated TLS version detected: ${metrics.tlsVersion}`,
        metrics,
        timestamp: new Date().toISOString(),
        resolved: false,
      })
    }

    // Check cipher suite strength
    if (!this.config.enabledCipherSuites.includes(metrics.cipherSuite)) {
      await this.createAlert({
        id: `cipher_weak_${Date.now()}`,
        type: 'cipher_weak',
        severity: 'high',
        message: `Weak cipher suite detected: ${metrics.cipherSuite}`,
        metrics,
        timestamp: new Date().toISOString(),
        resolved: false,
      })
    }
  }

  /**
   * Create monitoring alert
   */
  private async createAlert(alert: MonitoringAlert): Promise<void> {
    this.alerts.push(alert)

    // Log alert
    logger.warning(
      'https_monitoring_alert',
      alert.message,
      {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity,
        serverName: alert.metrics.serverName,
        sessionId: alert.metrics.sessionId,
      },
      alert.metrics,
    )

    // Check for escalation threshold
    const recentAlerts = this.alerts.filter(
      (a) =>
        !a.resolved
        && a.type === alert.type
        && Date.now() - new Date(a.timestamp).getTime() < 300000, // 5 minutes
    )

    if (recentAlerts.length >= this.config.alertThreshold) {
      await this.escalateAlert(alert)
    }
  }

  /**
   * Escalate critical alerts
   */
  private async escalateAlert(alert: MonitoringAlert): Promise<void> {
    logger.error(
      'https_monitoring_escalation',
      `Critical HTTPS monitoring alert: ${alert.message}`,
      {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity,
        serverName: alert.metrics.serverName,
        alertCount: this.alerts.filter(
          (a) => !a.resolved && a.type === alert.type,
        ).length,
      },
      alert.metrics,
    )

    // Integration with external monitoring systems can be added here
    // e.g., Slack notifications, PagerDuty, etc.
  }

  /**
   * Get performance summary for a server
   */
  getPerformanceSummary(serverName?: string): {
    totalHandshakes: number
    averageHandshakeTime: number
    minHandshakeTime: number
    maxHandshakeTime: number
    complianceRate: number
    protocolDistribution: Record<string, number>
    cipherSuiteDistribution: Record<string, number>
    recentAlerts: MonitoringAlert[]
  } {
    const allMetrics = serverName
      ? this.metrics.get(serverName) || []
      : Array.from(this.metrics.values()).flat()

    if (allMetrics.length === 0) {
      return {
        totalHandshakes: 0,
        averageHandshakeTime: 0,
        minHandshakeTime: 0,
        maxHandshakeTime: 0,
        complianceRate: 0,
        protocolDistribution: {},
        cipherSuiteDistribution: {},
        recentAlerts: [],
      }
    }

    const handshakeTimes = allMetrics.map((m) => m.handshakeTimeMs)
    const compliantHandshakes = allMetrics.filter(
      (m) => m.handshakeTimeMs <= this.config.maxHandshakeTimeMs,
    )

    const protocolDistribution = allMetrics.reduce(
      (acc, _m) => {
        acc[m.tlsVersion] = (acc[m.tlsVersion] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const cipherSuiteDistribution = allMetrics.reduce(
      (acc, _m) => {
        acc[m.cipherSuite] = (acc[m.cipherSuite] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const recentAlerts = this.alerts
      .filter(
        (a) => !a.resolved && Date.now() - new Date(a.timestamp).getTime() < 3600000,
      )
      .sort(
        (a, _b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

    return {
      totalHandshakes: allMetrics.length,
      averageHandshakeTime: handshakeTimes.reduce((a, _b) => a + b, 0) / handshakeTimes.length,
      minHandshakeTime: Math.min(...handshakeTimes),
      maxHandshakeTime: Math.max(...handshakeTimes),
      complianceRate: (compliantHandshakes.length / allMetrics.length) * 100,
      protocolDistribution,
      cipherSuiteDistribution,
      recentAlerts,
    }
  }

  /**
   * Get detailed metrics for analysis
   */
  getDetailedMetrics(
    serverName?: string,
    timeRange?: { start: Date; end: Date },
  ): TLSHandshakeMetrics[] {
    let metrics = serverName
      ? this.metrics.get(serverName) || []
      : Array.from(this.metrics.values()).flat()

    if (timeRange) {
      metrics = metrics.filter((m) => {
        const timestamp = new Date(m.clientHelloTime)
        return timestamp >= timeRange.start && timestamp <= timeRange.end
      })
    }

    return metrics
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): MonitoringAlert[] {
    return this.alerts.filter((a) => !a.resolved)
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.resolved = true
      logger.info(
        'https_monitoring_alert_resolved',
        `Alert resolved: ${alert.message}`,
        {
          alertId,
          serverName: alert.metrics.serverName,
        },
      )
    }
  }

  /**
   * Start background monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck()
    }, this.config.monitoringInterval)
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      // Check for stale metrics and clean up
      const cutoffTime = Date.now() - 24 * 60 * 60 * 1000 // 24 hours
      let cleanedMetrics = 0

      for (const [serverName, metrics] of this.metrics.entries()) {
        const filteredMetrics = metrics.filter(
          (m) => m.clientHelloTime > cutoffTime,
        )
        if (filteredMetrics.length !== metrics.length) {
          this.metrics.set(serverName, filteredMetrics)
          cleanedMetrics += metrics.length - filteredMetrics.length
        }
      }

      if (cleanedMetrics > 0) {
        logger.info('https_monitoring_cleanup', 'Cleaned up stale metrics', {
          cleanedMetrics,
        })
      }

      // Generate health report
      const summary = this.getPerformanceSummary()
      if (summary.totalHandshakes > 0) {
        logger.healthcare(
          'https_monitoring_health',
          'HTTPS monitoring health check completed',
          {
            totalHandshakes: summary.totalHandshakes,
            averageHandshakeTime: Math.round(summary.averageHandshakeTime),
            complianceRate: Math.round(summary.complianceRate * 100) / 100,
            activeAlerts: summary.recentAlerts.length,
          },
          summary,
        )
      }
    } catch {
      logger.error('https_monitoring_health_check', 'Health check failed', {
        error: (error as Error).message,
      })
    }
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isMonitoring: boolean
    config: HTTPSMonitoringConfig
    metricsCount: number
    alertsCount: number
    activeAlertsCount: number
  } {
    return {
      isMonitoring: !!this.monitoringInterval,
      config: this.config,
      metricsCount: Array.from(this.metrics.values()).flat().length,
      alertsCount: this.alerts.length,
      activeAlertsCount: this.alerts.filter((a) => !a.resolved).length,
    }
  }
}

// Global instance
export const httpsMonitoringService = new HTTPSMonitoringService()
