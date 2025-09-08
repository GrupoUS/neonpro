/**
 * Infrastructure Monitoring & Performance Dashboard
 * Real-time monitoring for Brazilian healthcare infrastructure
 */

export interface PerformanceDashboardConfig {
  refreshInterval: number // ms
  metricsRetention: number // hours
  alertThresholds: AlertThresholds
  brazilianRegions: BrazilianMonitoringRegion[]
  healthcareWorkflows: HealthcareWorkflowMonitoring
}

export interface AlertThresholds {
  emergencyResponseTime: number // ms
  patientLookupTime: number // ms
  appointmentBookingTime: number // ms
  aiChatResponseTime: number // ms
  errorRate: number // percentage
  cpuUsage: number // percentage
  memoryUsage: number // percentage
  diskUsage: number // percentage
}

export interface BrazilianMonitoringRegion {
  id: string
  name: string
  cdnNodes: string[]
  expectedLatency: number
  connectivityTier: 'tier1' | 'tier2' | 'tier3'
  isActive: boolean
  lastHealthCheck: string
}

export interface HealthcareWorkflowMonitoring {
  criticalPaths: CriticalPath[]
  slaTargets: SLATarget[]
  complianceChecks: ComplianceCheck[]
}

export interface CriticalPath {
  name: string
  workflow: string[]
  maxDuration: number // ms
  priority: 'critical' | 'high' | 'medium' | 'low'
  healthcareContext: 'emergency' | 'routine' | 'ai_assisted'
}

export interface SLATarget {
  metric: string
  target: number
  unit: 'ms' | '%' | 'count'
  tier: 'tier1' | 'tier2' | 'tier3'
  description: string
}

export interface ComplianceCheck {
  id: string
  name: string
  regulation: 'LGPD' | 'CFM' | 'ANVISA' | 'ANS'
  checkInterval: number // minutes
  lastCheck: string
  status: 'compliant' | 'warning' | 'violation'
}

export interface MonitoringMetrics {
  timestamp: string
  region: string
  connectivity: {
    latency: number
    throughput: number
    packetLoss: number
    jitter: number
  }
  performance: {
    responseTime: number
    errorRate: number
    throughput: number
    availability: number
  }
  resources: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  healthcare: {
    emergencyResponseTime: number
    patientLookupTime: number
    aiChatResponseTime: number
    complianceScore: number
  }
  alerts: Alert[]
}

export interface Alert {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  type: 'performance' | 'security' | 'compliance' | 'infrastructure'
  message: string
  source: string
  timestamp: string
  resolved: boolean
  resolvedAt?: string
  actionTaken?: string
}

export class InfrastructureMonitoringService {
  private static instance: InfrastructureMonitoringService
  private config: PerformanceDashboardConfig
  private metrics: MonitoringMetrics[] = []
  private alerts: Alert[] = []
  private healthChecks: Map<string, boolean> = new Map()

  private readonly DEFAULT_CONFIG: PerformanceDashboardConfig = {
    refreshInterval: 30_000, // 30 seconds
    metricsRetention: 24, // 24 hours
    alertThresholds: {
      emergencyResponseTime: 100, // 100ms
      patientLookupTime: 200, // 200ms
      appointmentBookingTime: 500, // 500ms
      aiChatResponseTime: 1500, // 1.5s
      errorRate: 1, // 1%
      cpuUsage: 80, // 80%
      memoryUsage: 85, // 85%
      diskUsage: 90, // 90%
    },
    brazilianRegions: [
      {
        id: 'sao-paulo-1',
        name: 'São Paulo Primary',
        cdnNodes: ['sao-paulo-edge-1', 'sao-paulo-edge-2',],
        expectedLatency: 20,
        connectivityTier: 'tier1',
        isActive: true,
        lastHealthCheck: new Date().toISOString(),
      },
      {
        id: 'rio-janeiro-1',
        name: 'Rio de Janeiro',
        cdnNodes: ['rio-edge-1',],
        expectedLatency: 25,
        connectivityTier: 'tier1',
        isActive: true,
        lastHealthCheck: new Date().toISOString(),
      },
      {
        id: 'brasilia-1',
        name: 'Brasília Government',
        cdnNodes: ['brasilia-edge-1',],
        expectedLatency: 30,
        connectivityTier: 'tier1',
        isActive: true,
        lastHealthCheck: new Date().toISOString(),
      },
      {
        id: 'regional-capitals',
        name: 'Regional Capitals',
        cdnNodes: ['regional-edge-1', 'regional-edge-2',],
        expectedLatency: 50,
        connectivityTier: 'tier2',
        isActive: true,
        lastHealthCheck: new Date().toISOString(),
      },
      {
        id: 'interior-brazil',
        name: 'Interior Brazil',
        cdnNodes: ['interior-edge-1',],
        expectedLatency: 100,
        connectivityTier: 'tier3',
        isActive: true,
        lastHealthCheck: new Date().toISOString(),
      },
    ],
    healthcareWorkflows: {
      criticalPaths: [
        {
          name: 'Emergency Patient Access',
          workflow: [
            'auth',
            'patient-lookup',
            'emergency-protocols',
            'samu-integration',
          ],
          maxDuration: 100,
          priority: 'critical',
          healthcareContext: 'emergency',
        },
        {
          name: 'Patient Data Retrieval',
          workflow: [
            'auth',
            'patient-search',
            'lgpd-compliance',
            'data-access',
          ],
          maxDuration: 200,
          priority: 'critical',
          healthcareContext: 'routine',
        },
        {
          name: 'AI-Assisted Diagnosis',
          workflow: [
            'patient-context',
            'ai-processing',
            'cfm-validation',
            'result-display',
          ],
          maxDuration: 1500,
          priority: 'high',
          healthcareContext: 'ai_assisted',
        },
        {
          name: 'Appointment Booking',
          workflow: [
            'patient-lookup',
            'schedule-check',
            'availability',
            'confirmation',
          ],
          maxDuration: 500,
          priority: 'high',
          healthcareContext: 'routine',
        },
      ],
      slaTargets: [
        {
          metric: 'emergency_response',
          target: 100,
          unit: 'ms',
          tier: 'tier1',
          description: 'Emergency protocol access',
        },
        {
          metric: 'emergency_response',
          target: 150,
          unit: 'ms',
          tier: 'tier2',
          description: 'Emergency protocol access',
        },
        {
          metric: 'emergency_response',
          target: 200,
          unit: 'ms',
          tier: 'tier3',
          description: 'Emergency protocol access',
        },
        {
          metric: 'patient_lookup',
          target: 200,
          unit: 'ms',
          tier: 'tier1',
          description: 'Patient data retrieval',
        },
        {
          metric: 'patient_lookup',
          target: 350,
          unit: 'ms',
          tier: 'tier2',
          description: 'Patient data retrieval',
        },
        {
          metric: 'patient_lookup',
          target: 500,
          unit: 'ms',
          tier: 'tier3',
          description: 'Patient data retrieval',
        },
        {
          metric: 'ai_chat_response',
          target: 1500,
          unit: 'ms',
          tier: 'tier1',
          description: 'AI chat response time',
        },
        {
          metric: 'ai_chat_response',
          target: 2000,
          unit: 'ms',
          tier: 'tier2',
          description: 'AI chat response time',
        },
        {
          metric: 'ai_chat_response',
          target: 3000,
          unit: 'ms',
          tier: 'tier3',
          description: 'AI chat response time',
        },
        {
          metric: 'availability',
          target: 99.9,
          unit: '%',
          tier: 'tier1',
          description: 'System availability',
        },
        {
          metric: 'availability',
          target: 99.5,
          unit: '%',
          tier: 'tier2',
          description: 'System availability',
        },
        {
          metric: 'availability',
          target: 99,
          unit: '%',
          tier: 'tier3',
          description: 'System availability',
        },
      ],
      complianceChecks: [
        {
          id: 'lgpd-audit',
          name: 'LGPD Compliance Check',
          regulation: 'LGPD',
          checkInterval: 60, // 1 hour
          lastCheck: new Date().toISOString(),
          status: 'compliant',
        },
        {
          id: 'cfm-validation',
          name: 'CFM Professional Validation',
          regulation: 'CFM',
          checkInterval: 240, // 4 hours
          lastCheck: new Date().toISOString(),
          status: 'compliant',
        },
        {
          id: 'anvisa-controlled-substances',
          name: 'ANVISA Controlled Substances Tracking',
          regulation: 'ANVISA',
          checkInterval: 120, // 2 hours
          lastCheck: new Date().toISOString(),
          status: 'compliant',
        },
      ],
    },
  }

  private constructor(config?: Partial<PerformanceDashboardConfig>,) {
    this.config = { ...this.DEFAULT_CONFIG, ...config, }
    this.initializeMonitoring()
  }

  static getInstance(
    config?: Partial<PerformanceDashboardConfig>,
  ): InfrastructureMonitoringService {
    if (!InfrastructureMonitoringService.instance) {
      InfrastructureMonitoringService.instance = new InfrastructureMonitoringService(config,)
    }
    return InfrastructureMonitoringService.instance
  }

  /**
   * Initialize monitoring systems
   */
  private initializeMonitoring(): void {
    // Start periodic health checks
    setInterval(() => {
      this.performHealthChecks()
    }, this.config.refreshInterval,)

    // Start compliance monitoring
    setInterval(
      () => {
        this.performComplianceChecks()
      },
      5 * 60 * 1000,
    ) // Every 5 minutes

    // Cleanup old metrics
    setInterval(
      () => {
        this.cleanupOldMetrics()
      },
      60 * 60 * 1000,
    ) // Every hour
  }

  /**
   * Collect current performance metrics
   */
  async collectMetrics(regionId?: string,): Promise<MonitoringMetrics> {
    const timestamp = new Date().toISOString()
    const region = regionId || 'sao-paulo-1'

    // Simulate metrics collection (in production, integrate with actual monitoring)
    const connectivity = await this.measureConnectivity(region,)
    const performance = await this.measurePerformance()
    const resources = await this.measureResources()
    const healthcare = await this.measureHealthcareMetrics()
    const alerts = this.getActiveAlerts()

    const metrics: MonitoringMetrics = {
      timestamp,
      region,
      connectivity,
      performance,
      resources,
      healthcare,
      alerts,
    }

    // Store metrics
    this.metrics.push(metrics,)

    // Check for alert conditions
    this.checkAlertConditions(metrics,)

    return metrics
  }

  private async measureConnectivity(
    region: string,
  ): Promise<MonitoringMetrics['connectivity']> {
    // Simulate network measurements
    const regionConfig = this.config.brazilianRegions.find(
      (r,) => r.id === region,
    )
    const baseLatency = regionConfig?.expectedLatency || 50

    return {
      latency: baseLatency + Math.random() * 10, // Add jitter
      throughput: Math.random() * 100 + 50, // 50-150 Mbps
      packetLoss: Math.random() * 0.1, // 0-0.1%
      jitter: Math.random() * 5, // 0-5ms
    }
  }

  private async measurePerformance(): Promise<
    MonitoringMetrics['performance']
  > {
    return {
      responseTime: Math.random() * 200 + 100, // 100-300ms
      errorRate: Math.random() * 0.5, // 0-0.5%
      throughput: Math.random() * 1000 + 500, // 500-1500 req/min
      availability: 99.5 + Math.random() * 0.5, // 99.5-100%
    }
  }

  private async measureResources(): Promise<MonitoringMetrics['resources']> {
    return {
      cpu: Math.random() * 80 + 20, // 20-100%
      memory: Math.random() * 70 + 30, // 30-100%
      disk: Math.random() * 60 + 40, // 40-100%
      network: Math.random() * 90 + 10, // 10-100%
    }
  }

  private async measureHealthcareMetrics(): Promise<
    MonitoringMetrics['healthcare']
  > {
    return {
      emergencyResponseTime: Math.random() * 50 + 50, // 50-100ms
      patientLookupTime: Math.random() * 100 + 100, // 100-200ms
      aiChatResponseTime: Math.random() * 500 + 1000, // 1000-1500ms
      complianceScore: Math.random() * 10 + 90, // 90-100%
    }
  }

  /**
   * Perform health checks on all Brazilian regions
   */
  private async performHealthChecks(): Promise<void> {
    const promises = this.config.brazilianRegions.map(async (region,) => {
      try {
        const isHealthy = await this.checkRegionHealth(region.id,)
        this.healthChecks.set(region.id, isHealthy,)

        if (!isHealthy) {
          this.createAlert({
            severity: 'high',
            type: 'infrastructure',
            message: `Region ${region.name} health check failed`,
            source: region.id,
          },)
        }

        // Update last health check
        region.lastHealthCheck = new Date().toISOString()
      } catch (error) {
        this.healthChecks.set(region.id, false,)
        this.createAlert({
          severity: 'critical',
          type: 'infrastructure',
          message: `Region ${region.name} unreachable: ${error}`,
          source: region.id,
        },)
      }
    },)

    await Promise.allSettled(promises,)
  }

  private async checkRegionHealth(regionId: string,): Promise<boolean> {
    // Simulate health check (in production, ping actual endpoints)
    const healthScore = Math.random()
    return healthScore > 0.1 // 90% uptime simulation
  }

  /**
   * Check for alert conditions based on current metrics
   */
  private checkAlertConditions(metrics: MonitoringMetrics,): void {
    const thresholds = this.config.alertThresholds

    // Performance alerts
    if (
      metrics.healthcare.emergencyResponseTime
        > thresholds.emergencyResponseTime
    ) {
      this.createAlert({
        severity: 'critical',
        type: 'performance',
        message:
          `Emergency response time exceeded: ${metrics.healthcare.emergencyResponseTime}ms > ${thresholds.emergencyResponseTime}ms`,
        source: metrics.region,
      },)
    }

    if (metrics.healthcare.patientLookupTime > thresholds.patientLookupTime) {
      this.createAlert({
        severity: 'high',
        type: 'performance',
        message:
          `Patient lookup time exceeded: ${metrics.healthcare.patientLookupTime}ms > ${thresholds.patientLookupTime}ms`,
        source: metrics.region,
      },)
    }

    if (metrics.healthcare.aiChatResponseTime > thresholds.aiChatResponseTime) {
      this.createAlert({
        severity: 'medium',
        type: 'performance',
        message:
          `AI chat response time exceeded: ${metrics.healthcare.aiChatResponseTime}ms > ${thresholds.aiChatResponseTime}ms`,
        source: metrics.region,
      },)
    }

    // Resource alerts
    if (metrics.resources.cpu > thresholds.cpuUsage) {
      this.createAlert({
        severity: 'high',
        type: 'infrastructure',
        message: `High CPU usage: ${metrics.resources.cpu.toFixed(1,)}% > ${thresholds.cpuUsage}%`,
        source: metrics.region,
      },)
    }

    if (metrics.resources.memory > thresholds.memoryUsage) {
      this.createAlert({
        severity: 'high',
        type: 'infrastructure',
        message: `High memory usage: ${
          metrics.resources.memory.toFixed(1,)
        }% > ${thresholds.memoryUsage}%`,
        source: metrics.region,
      },)
    }

    if (metrics.resources.disk > thresholds.diskUsage) {
      this.createAlert({
        severity: 'critical',
        type: 'infrastructure',
        message: `High disk usage: ${
          metrics.resources.disk.toFixed(1,)
        }% > ${thresholds.diskUsage}%`,
        source: metrics.region,
      },)
    }

    if (metrics.performance.errorRate > thresholds.errorRate) {
      this.createAlert({
        severity: 'high',
        type: 'performance',
        message: `Error rate exceeded: ${
          metrics.performance.errorRate.toFixed(2,)
        }% > ${thresholds.errorRate}%`,
        source: metrics.region,
      },)
    }
  }

  /**
   * Create a new alert
   */
  private createAlert(
    alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>,
  ): Alert {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36,).slice(2, 9,)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
      ...alertData,
    }

    this.alerts.push(alert,)

    // Auto-resolve similar alerts after 5 minutes for non-critical issues
    if (alert.severity !== 'critical') {
      setTimeout(
        () => {
          this.resolveAlert(alert.id, 'Auto-resolved after timeout',)
        },
        5 * 60 * 1000,
      )
    }

    return alert
  }

  /**
   * Perform compliance checks
   */
  private async performComplianceChecks(): Promise<void> {
    const checks = this.config.healthcareWorkflows.complianceChecks

    for (const check of checks) {
      const now = new Date()
      const lastCheck = new Date(check.lastCheck,)
      const minutesSinceCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60)

      if (minutesSinceCheck >= check.checkInterval) {
        const isCompliant = await this.performComplianceCheck(check,)

        check.lastCheck = now.toISOString()
        check.status = isCompliant ? 'compliant' : 'violation'

        if (!isCompliant) {
          this.createAlert({
            severity: 'high',
            type: 'compliance',
            message: `${check.regulation} compliance violation detected: ${check.name}`,
            source: check.id,
          },)
        }
      }
    }
  }

  private async performComplianceCheck(
    check: ComplianceCheck,
  ): Promise<boolean> {
    // Simulate compliance check (in production, integrate with actual compliance systems)
    switch (check.regulation) {
      case 'LGPD':
        return Math.random() > 0.05 // 95% compliance rate
      case 'CFM':
        return Math.random() > 0.02 // 98% compliance rate
      case 'ANVISA':
        return Math.random() > 0.03 // 97% compliance rate
      case 'ANS':
        return Math.random() > 0.04 // 96% compliance rate
      default:
        return true
    }
  }

  /**
   * Get active (unresolved) alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert,) => !alert.resolved)
  }

  /**
   * Get all alerts within time range
   */
  getAlertsInRange(startDate: Date, endDate: Date,): Alert[] {
    return this.alerts.filter((alert,) => {
      const alertDate = new Date(alert.timestamp,)
      return alertDate >= startDate && alertDate <= endDate
    },)
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, actionTaken: string,): boolean {
    const alert = this.alerts.find((a,) => a.id === alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date().toISOString()
      alert.actionTaken = actionTaken
      return true
    }
    return false
  }

  /**
   * Get metrics for a specific time range
   */
  getMetricsInRange(
    startDate: Date,
    endDate: Date,
    regionId?: string,
  ): MonitoringMetrics[] {
    return this.metrics.filter((metric,) => {
      const metricDate = new Date(metric.timestamp,)
      const inRange = metricDate >= startDate && metricDate <= endDate
      const matchesRegion = !regionId || metric.region === regionId
      return inRange && matchesRegion
    },)
  }

  /**
   * Clean up old metrics beyond retention period
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - this.config.metricsRetention,)

    this.metrics = this.metrics.filter(
      (metric,) => new Date(metric.timestamp,) > cutoffTime,
    )

    // Also cleanup resolved alerts older than 7 days
    const alertCutoffTime = new Date()
    alertCutoffTime.setDate(alertCutoffTime.getDate() - 7,)

    this.alerts = this.alerts.filter(
      (alert,) => !alert.resolved || new Date(alert.timestamp,) > alertCutoffTime,
    )
  }

  /**
   * Generate monitoring dashboard data
   */
  generateDashboardData(regionId?: string,): Record<string, unknown> {
    const recentMetrics = this.getMetricsInRange(
      new Date(Date.now() - 60 * 60 * 1000,), // Last hour
      new Date(),
      regionId,
    )

    const activeAlerts = this.getActiveAlerts()
    const healthStatus = Array.from(this.healthChecks.entries(),).map(
      ([region, isHealthy,],) => ({
        region,
        isHealthy,
      }),
    )

    return {
      summary: {
        totalRegions: this.config.brazilianRegions.length,
        healthyRegions: healthStatus.filter((h,) => h.isHealthy).length,
        activeAlerts: activeAlerts.length,
        criticalAlerts: activeAlerts.filter((a,) => a.severity === 'critical')
          .length,
        averageResponseTime: recentMetrics.length > 0
          ? recentMetrics.reduce(
            (sum, m,) => sum + m.performance.responseTime,
            0,
          ) / recentMetrics.length
          : 0,
        overallHealth: this.calculateOverallHealth(),
      },
      metrics: recentMetrics,
      alerts: activeAlerts,
      regions: healthStatus,
      compliance: this.config.healthcareWorkflows.complianceChecks,
      slaTargets: this.config.healthcareWorkflows.slaTargets,
    }
  }

  private calculateOverallHealth(): number {
    const totalRegions = this.config.brazilianRegions.length
    const healthyRegions = Array.from(this.healthChecks.values(),).filter(
      (h,) => h,
    ).length
    const activeAlerts = this.getActiveAlerts()
    const criticalAlerts = activeAlerts.filter(
      (a,) => a.severity === 'critical',
    ).length

    let healthScore = (healthyRegions / totalRegions) * 100
    healthScore -= criticalAlerts * 15 // -15 points per critical alert
    healthScore -= activeAlerts.length * 2 // -2 points per alert

    return Math.max(0, Math.min(100, healthScore,),)
  }

  /**
   * Export monitoring configuration
   */
  exportConfiguration(): PerformanceDashboardConfig {
    return { ...this.config, }
  }

  /**
   * Update monitoring configuration
   */
  updateConfiguration(updates: Partial<PerformanceDashboardConfig>,): void {
    this.config = { ...this.config, ...updates, }
  }
}

// Export singleton instance optimized for Brazilian healthcare
export const brazilianInfrastructureMonitoring = InfrastructureMonitoringService.getInstance({
  refreshInterval: 30_000, // 30 seconds for healthcare systems
  alertThresholds: {
    emergencyResponseTime: 100, // Critical for Brazilian emergency care
    patientLookupTime: 200, // Fast patient access
    appointmentBookingTime: 500, // Reasonable booking time
    aiChatResponseTime: 1500, // AI response under 1.5s
    errorRate: 0.5, // Low error tolerance for healthcare
    cpuUsage: 75, // Conservative CPU threshold
    memoryUsage: 80, // Conservative memory threshold
    diskUsage: 85, // Conservative disk threshold
  },
},)

// InfrastructureMonitoringService is already exported as a class above
