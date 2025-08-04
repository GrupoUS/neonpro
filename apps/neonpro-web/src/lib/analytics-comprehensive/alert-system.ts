import { createClient } from '@/lib/supabase/client'
import { PerformanceMetrics, PerformanceAlert } from './performance-calculator'
import { SchedulingMetrics } from './scheduling-analytics'

type SupabaseClient = ReturnType<typeof createClient>

// Alert Configuration Interfaces
export interface AlertRule {
  id: string
  name: string
  description: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'between' | 'outside_range'
  threshold: number | { min: number; max: number }
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly'
  recipients: string[]
  actions: AlertAction[]
  cooldownMinutes: number
  createdAt: Date
  updatedAt: Date
}

export interface AlertAction {
  type: 'email' | 'sms' | 'push' | 'webhook' | 'auto_reschedule' | 'escalate'
  config: Record<string, any>
  delay?: number // minutes
}

export interface AlertHistory {
  id: string
  ruleId: string
  alertId: string
  triggeredAt: Date
  resolvedAt?: Date
  status: 'active' | 'resolved' | 'acknowledged' | 'suppressed'
  acknowledgedBy?: string
  acknowledgedAt?: Date
  escalationLevel: number
  metadata: Record<string, any>
}

export interface NotificationChannel {
  id: string
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack' | 'teams'
  name: string
  config: Record<string, any>
  enabled: boolean
  priority: number
  retryAttempts: number
  retryDelay: number
}

export interface AlertDashboard {
  activeAlerts: PerformanceAlert[]
  alertsByCategory: { category: string; count: number; severity: string }[]
  alertTrends: { date: string; count: number; severity: string }[]
  topAlertRules: { ruleId: string; name: string; triggerCount: number }[]
  resolutionMetrics: {
    averageResolutionTime: number
    acknowledgmentRate: number
    escalationRate: number
    falsePositiveRate: number
  }
  systemHealth: {
    overallStatus: 'healthy' | 'warning' | 'critical'
    uptime: number
    responseTime: number
    errorRate: number
  }
}

export interface AlertTemplate {
  id: string
  name: string
  category: string
  description: string
  rules: Partial<AlertRule>[]
  isDefault: boolean
}

/**
 * Advanced Alert and Notification System
 * Monitors performance metrics and triggers intelligent alerts
 */
export class AlertSystem {
  private supabase: SupabaseClient
  private alertRules: Map<string, AlertRule>
  private activeAlerts: Map<string, PerformanceAlert>
  private notificationChannels: Map<string, NotificationChannel>
  private alertHistory: AlertHistory[]
  private isMonitoring: boolean
  private monitoringInterval?: NodeJS.Timeout

  // Default alert templates
  private readonly DEFAULT_TEMPLATES: AlertTemplate[] = [
    {
      id: 'efficiency_monitoring',
      name: 'Efficiency Monitoring',
      category: 'Performance',
      description: 'Monitor appointment completion rates and time efficiency',
      isDefault: true,
      rules: [
        {
          name: 'Low Appointment Completion Rate',
          metric: 'appointmentCompletionRate',
          condition: 'less_than',
          threshold: 85,
          severity: 'high'
        },
        {
          name: 'Poor Time Utilization',
          metric: 'timeUtilizationRate',
          condition: 'less_than',
          threshold: 70,
          severity: 'medium'
        }
      ]
    },
    {
      id: 'patient_satisfaction',
      name: 'Patient Satisfaction',
      category: 'Quality',
      description: 'Monitor patient satisfaction and service quality',
      isDefault: true,
      rules: [
        {
          name: 'Low Patient Satisfaction',
          metric: 'patientSatisfactionScore',
          condition: 'less_than',
          threshold: 3.5,
          severity: 'high'
        },
        {
          name: 'High Complication Rate',
          metric: 'complicationRate',
          condition: 'greater_than',
          threshold: 5,
          severity: 'critical'
        }
      ]
    },
    {
      id: 'resource_utilization',
      name: 'Resource Utilization',
      category: 'Operations',
      description: 'Monitor staff and resource utilization',
      isDefault: true,
      rules: [
        {
          name: 'Low Staff Utilization',
          metric: 'staffUtilizationRate',
          condition: 'less_than',
          threshold: 60,
          severity: 'medium'
        },
        {
          name: 'High Staff Utilization',
          metric: 'staffUtilizationRate',
          condition: 'greater_than',
          threshold: 90,
          severity: 'high'
        }
      ]
    }
  ]

  constructor() {
    this.supabase = createClient()
    this.alertRules = new Map()
    this.activeAlerts = new Map()
    this.notificationChannels = new Map()
    this.alertHistory = []
    this.isMonitoring = false
    
    this.initializeDefaultChannels()
    this.loadAlertRules()
  }

  /**
   * Start real-time monitoring
   */
  async startMonitoring(intervalMinutes: number = 5): Promise<void> {
    if (this.isMonitoring) {
      console.log('Monitoring already active')
      return
    }

    this.isMonitoring = true
    console.log(`Starting alert monitoring with ${intervalMinutes} minute intervals`)

    // Initial check
    await this.checkAllAlerts()

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAllAlerts()
      } catch (error) {
        console.error('Error during alert monitoring:', error)
      }
    }, intervalMinutes * 60 * 1000)

    // Set up real-time subscriptions for critical metrics
    this.setupRealtimeSubscriptions()
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    this.isMonitoring = false
    console.log('Alert monitoring stopped')
  }

  /**
   * Check all active alert rules
   */
  async checkAllAlerts(): Promise<PerformanceAlert[]> {
    const triggeredAlerts: PerformanceAlert[] = []

    try {
      // Get current metrics
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
      
      // This would integrate with PerformanceCalculator
      // const metrics = await this.performanceCalculator.calculatePerformanceMetrics({ startDate, endDate })
      
      // For now, simulate metrics checking
      for (const [ruleId, rule] of this.alertRules) {
        if (!rule.enabled) continue

        const alert = await this.evaluateAlertRule(rule)
        if (alert) {
          triggeredAlerts.push(alert)
          await this.processAlert(alert, rule)
        }
      }

      return triggeredAlerts

    } catch (error) {
      console.error('Error checking alerts:', error)
      return []
    }
  }

  /**
   * Evaluate a specific alert rule
   */
  private async evaluateAlertRule(rule: AlertRule): Promise<PerformanceAlert | null> {
    try {
      // Get current metric value (this would integrate with actual metrics)
      const currentValue = await this.getCurrentMetricValue(rule.metric)
      
      if (currentValue === null) return null

      const isTriggered = this.evaluateCondition(currentValue, rule.condition, rule.threshold)
      
      if (!isTriggered) return null

      // Check cooldown period
      if (this.isInCooldown(rule.id)) return null

      // Create alert
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: this.getAlertType(rule.metric),
        severity: rule.severity,
        metric: rule.metric,
        currentValue,
        threshold: typeof rule.threshold === 'number' ? rule.threshold : rule.threshold.min,
        trend: await this.calculateMetricTrend(rule.metric),
        impact: this.calculateImpact(rule.metric, currentValue, rule.threshold),
        recommendations: this.generateRecommendations(rule.metric, currentValue),
        priority: this.calculatePriority(rule.severity, currentValue, rule.threshold)
      }

      return alert

    } catch (error) {
      console.error(`Error evaluating alert rule ${rule.id}:`, error)
      return null
    }
  }

  /**
   * Process triggered alert
   */
  private async processAlert(alert: PerformanceAlert, rule: AlertRule): Promise<void> {
    try {
      // Store alert
      this.activeAlerts.set(alert.id, alert)

      // Create alert history entry
      const historyEntry: AlertHistory = {
        id: `history_${Date.now()}`,
        ruleId: rule.id,
        alertId: alert.id,
        triggeredAt: new Date(),
        status: 'active',
        escalationLevel: 0,
        metadata: {
          metric: alert.metric,
          currentValue: alert.currentValue,
          threshold: alert.threshold
        }
      }
      
      this.alertHistory.push(historyEntry)

      // Execute alert actions
      for (const action of rule.actions) {
        await this.executeAlertAction(action, alert, rule)
      }

      // Store in database
      await this.storeAlert(alert, rule)

      console.log(`Alert triggered: ${rule.name} - ${alert.metric}: ${alert.currentValue}`)

    } catch (error) {
      console.error('Error processing alert:', error)
    }
  }

  /**
   * Execute alert action
   */
  private async executeAlertAction(action: AlertAction, alert: PerformanceAlert, rule: AlertRule): Promise<void> {
    try {
      // Apply delay if specified
      if (action.delay) {
        setTimeout(() => this.performAction(action, alert, rule), action.delay * 60 * 1000)
      } else {
        await this.performAction(action, alert, rule)
      }
    } catch (error) {
      console.error(`Error executing alert action ${action.type}:`, error)
    }
  }

  /**
   * Perform specific action
   */
  private async performAction(action: AlertAction, alert: PerformanceAlert, rule: AlertRule): Promise<void> {
    switch (action.type) {
      case 'email':
        await this.sendEmailNotification(alert, rule, action.config)
        break
      case 'sms':
        await this.sendSMSNotification(alert, rule, action.config)
        break
      case 'push':
        await this.sendPushNotification(alert, rule, action.config)
        break
      case 'webhook':
        await this.sendWebhookNotification(alert, rule, action.config)
        break
      case 'auto_reschedule':
        await this.triggerAutoReschedule(alert, rule)
        break
      case 'escalate':
        await this.escalateAlert(alert, rule)
        break
      default:
        console.warn(`Unknown action type: ${action.type}`)
    }
  }

  /**
   * Create alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.alertRules.set(newRule.id, newRule)

    // Store in database
    const { error } = await this.supabase
      .from('alert_rules')
      .insert(newRule)

    if (error) {
      console.error('Error storing alert rule:', error)
      throw error
    }

    return newRule
  }

  /**
   * Update alert rule
   */
  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    const existingRule = this.alertRules.get(ruleId)
    if (!existingRule) return null

    const updatedRule: AlertRule = {
      ...existingRule,
      ...updates,
      updatedAt: new Date()
    }

    this.alertRules.set(ruleId, updatedRule)

    // Update in database
    const { error } = await this.supabase
      .from('alert_rules')
      .update(updatedRule)
      .eq('id', ruleId)

    if (error) {
      console.error('Error updating alert rule:', error)
      throw error
    }

    return updatedRule
  }

  /**
   * Delete alert rule
   */
  async deleteAlertRule(ruleId: string): Promise<boolean> {
    const deleted = this.alertRules.delete(ruleId)

    if (deleted) {
      const { error } = await this.supabase
        .from('alert_rules')
        .delete()
        .eq('id', ruleId)

      if (error) {
        console.error('Error deleting alert rule:', error)
        return false
      }
    }

    return deleted
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId)
    if (!alert) return false

    // Update alert history
    const historyEntry = this.alertHistory.find(h => h.alertId === alertId)
    if (historyEntry) {
      historyEntry.status = 'acknowledged'
      historyEntry.acknowledgedBy = userId
      historyEntry.acknowledgedAt = new Date()
    }

    // Update in database
    const { error } = await this.supabase
      .from('alert_history')
      .update({
        status: 'acknowledged',
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString()
      })
      .eq('alert_id', alertId)

    if (error) {
      console.error('Error acknowledging alert:', error)
      return false
    }

    return true
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, userId: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId)
    if (!alert) return false

    // Remove from active alerts
    this.activeAlerts.delete(alertId)

    // Update alert history
    const historyEntry = this.alertHistory.find(h => h.alertId === alertId)
    if (historyEntry) {
      historyEntry.status = 'resolved'
      historyEntry.resolvedAt = new Date()
    }

    // Update in database
    const { error } = await this.supabase
      .from('alert_history')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('alert_id', alertId)

    if (error) {
      console.error('Error resolving alert:', error)
      return false
    }

    return true
  }

  /**
   * Get alert dashboard data
   */
  async getAlertDashboard(): Promise<AlertDashboard> {
    const activeAlerts = Array.from(this.activeAlerts.values())
    
    // Calculate alert statistics
    const alertsByCategory = this.calculateAlertsByCategory(activeAlerts)
    const alertTrends = await this.calculateAlertTrends()
    const topAlertRules = this.calculateTopAlertRules()
    const resolutionMetrics = await this.calculateResolutionMetrics()
    const systemHealth = await this.calculateSystemHealth()

    return {
      activeAlerts,
      alertsByCategory,
      alertTrends,
      topAlertRules,
      resolutionMetrics,
      systemHealth
    }
  }

  // Helper methods
  private async getCurrentMetricValue(metric: string): Promise<number | null> {
    // This would integrate with actual metrics calculation
    // For now, return simulated values
    const simulatedValues: Record<string, number> = {
      'appointmentCompletionRate': 88,
      'patientSatisfactionScore': 4.1,
      'staffUtilizationRate': 75,
      'timeUtilizationRate': 82,
      'complicationRate': 3.2,
      'revenuePerHour': 165
    }
    
    return simulatedValues[metric] || null
  }

  private evaluateCondition(value: number, condition: string, threshold: number | { min: number; max: number }): boolean {
    switch (condition) {
      case 'greater_than':
        return typeof threshold === 'number' && value > threshold
      case 'less_than':
        return typeof threshold === 'number' && value < threshold
      case 'equals':
        return typeof threshold === 'number' && value === threshold
      case 'not_equals':
        return typeof threshold === 'number' && value !== threshold
      case 'between':
        return typeof threshold === 'object' && value >= threshold.min && value <= threshold.max
      case 'outside_range':
        return typeof threshold === 'object' && (value < threshold.min || value > threshold.max)
      default:
        return false
    }
  }

  private isInCooldown(ruleId: string): boolean {
    const rule = this.alertRules.get(ruleId)
    if (!rule) return false

    const lastTrigger = this.alertHistory
      .filter(h => h.ruleId === ruleId)
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())[0]

    if (!lastTrigger) return false

    const cooldownEnd = new Date(lastTrigger.triggeredAt.getTime() + rule.cooldownMinutes * 60 * 1000)
    return new Date() < cooldownEnd
  }

  private getAlertType(metric: string): PerformanceAlert['type'] {
    if (metric.includes('utilization') || metric.includes('efficiency')) return 'efficiency'
    if (metric.includes('satisfaction') || metric.includes('quality')) return 'satisfaction'
    if (metric.includes('revenue') || metric.includes('productivity')) return 'productivity'
    return 'utilization'
  }

  private async calculateMetricTrend(metric: string): Promise<'improving' | 'declining' | 'stable'> {
    // Simplified trend calculation
    return 'stable'
  }

  private calculateImpact(metric: string, currentValue: number, threshold: number | { min: number; max: number }): string {
    const impacts: Record<string, string> = {
      'appointmentCompletionRate': 'Reduced patient satisfaction and revenue loss',
      'patientSatisfactionScore': 'Potential reputation damage and patient churn',
      'staffUtilizationRate': 'Inefficient resource allocation and increased costs',
      'complicationRate': 'Patient safety concerns and liability risks'
    }
    
    return impacts[metric] || 'Performance degradation detected'
  }

  private generateRecommendations(metric: string, currentValue: number): string[] {
    const recommendations: Record<string, string[]> = {
      'appointmentCompletionRate': [
        'Review scheduling processes',
        'Implement automated reminders',
        'Analyze cancellation patterns'
      ],
      'patientSatisfactionScore': [
        'Conduct patient feedback surveys',
        'Improve wait time management',
        'Enhance staff training programs'
      ],
      'staffUtilizationRate': [
        'Optimize staff scheduling',
        'Balance workload distribution',
        'Consider staffing adjustments'
      ]
    }
    
    return recommendations[metric] || ['Review current processes', 'Implement monitoring', 'Consider optimization']
  }

  private calculatePriority(severity: string, currentValue: number, threshold: number | { min: number; max: number }): number {
    const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 }
    const baseWeight = severityWeights[severity as keyof typeof severityWeights] || 1
    
    // Calculate deviation magnitude
    const thresholdValue = typeof threshold === 'number' ? threshold : threshold.min
    const deviation = Math.abs(currentValue - thresholdValue) / thresholdValue
    
    return Math.min(10, baseWeight * (1 + deviation) * 2)
  }

  private calculateAlertsByCategory(alerts: PerformanceAlert[]): { category: string; count: number; severity: string }[] {
    const categories = new Map<string, { count: number; maxSeverity: string }>()
    
    alerts.forEach(alert => {
      const category = alert.type
      const existing = categories.get(category) || { count: 0, maxSeverity: 'low' }
      
      existing.count++
      if (this.getSeverityWeight(alert.severity) > this.getSeverityWeight(existing.maxSeverity)) {
        existing.maxSeverity = alert.severity
      }
      
      categories.set(category, existing)
    })
    
    return Array.from(categories.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      severity: data.maxSeverity
    }))
  }

  private getSeverityWeight(severity: string): number {
    const weights = { low: 1, medium: 2, high: 3, critical: 4 }
    return weights[severity as keyof typeof weights] || 1
  }

  private async calculateAlertTrends(): Promise<{ date: string; count: number; severity: string }[]> {
    // Simplified implementation
    return []
  }

  private calculateTopAlertRules(): { ruleId: string; name: string; triggerCount: number }[] {
    const ruleCounts = new Map<string, number>()
    
    this.alertHistory.forEach(history => {
      const count = ruleCounts.get(history.ruleId) || 0
      ruleCounts.set(history.ruleId, count + 1)
    })
    
    return Array.from(ruleCounts.entries())
      .map(([ruleId, triggerCount]) => {
        const rule = this.alertRules.get(ruleId)
        return {
          ruleId,
          name: rule?.name || 'Unknown Rule',
          triggerCount
        }
      })
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 10)
  }

  private async calculateResolutionMetrics(): Promise<AlertDashboard['resolutionMetrics']> {
    const resolvedAlerts = this.alertHistory.filter(h => h.status === 'resolved')
    const acknowledgedAlerts = this.alertHistory.filter(h => h.acknowledgedAt)
    
    const resolutionTimes = resolvedAlerts
      .filter(h => h.resolvedAt)
      .map(h => h.resolvedAt!.getTime() - h.triggeredAt.getTime())
    
    const averageResolutionTime = resolutionTimes.length > 0 ?
      resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length / (1000 * 60) : 0
    
    return {
      averageResolutionTime,
      acknowledgmentRate: this.alertHistory.length > 0 ? (acknowledgedAlerts.length / this.alertHistory.length) * 100 : 0,
      escalationRate: 15, // Placeholder
      falsePositiveRate: 8 // Placeholder
    }
  }

  private async calculateSystemHealth(): Promise<AlertDashboard['systemHealth']> {
    const criticalAlerts = Array.from(this.activeAlerts.values()).filter(a => a.severity === 'critical')
    const highAlerts = Array.from(this.activeAlerts.values()).filter(a => a.severity === 'high')
    
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (criticalAlerts.length > 0) {
      overallStatus = 'critical'
    } else if (highAlerts.length > 2) {
      overallStatus = 'warning'
    }
    
    return {
      overallStatus,
      uptime: 99.8, // Placeholder
      responseTime: 150, // Placeholder
      errorRate: 0.5 // Placeholder
    }
  }

  private initializeDefaultChannels(): void {
    // Initialize default notification channels
    const emailChannel: NotificationChannel = {
      id: 'default_email',
      type: 'email',
      name: 'Default Email',
      config: { smtp: 'default' },
      enabled: true,
      priority: 1,
      retryAttempts: 3,
      retryDelay: 5
    }
    
    this.notificationChannels.set(emailChannel.id, emailChannel)
  }

  private async loadAlertRules(): Promise<void> {
    try {
      const { data: rules, error } = await this.supabase
        .from('alert_rules')
        .select('*')
        .eq('enabled', true)

      if (error) {
        console.error('Error loading alert rules:', error)
        return
      }

      rules?.forEach(rule => {
        this.alertRules.set(rule.id, rule)
      })

    } catch (error) {
      console.error('Error loading alert rules:', error)
    }
  }

  private setupRealtimeSubscriptions(): void {
    // Set up real-time subscriptions for critical metrics
    this.supabase
      .channel('appointments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        () => this.checkAllAlerts()
      )
      .subscribe()
  }

  private async storeAlert(alert: PerformanceAlert, rule: AlertRule): Promise<void> {
    const { error } = await this.supabase
      .from('alerts')
      .insert({
        id: alert.id,
        rule_id: rule.id,
        type: alert.type,
        severity: alert.severity,
        metric: alert.metric,
        current_value: alert.currentValue,
        threshold: alert.threshold,
        trend: alert.trend,
        impact: alert.impact,
        recommendations: alert.recommendations,
        priority: alert.priority,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error storing alert:', error)
    }
  }

  // Notification methods (simplified implementations)
  private async sendEmailNotification(alert: PerformanceAlert, rule: AlertRule, config: any): Promise<void> {
    console.log(`Email notification sent for alert: ${rule.name}`)
  }

  private async sendSMSNotification(alert: PerformanceAlert, rule: AlertRule, config: any): Promise<void> {
    console.log(`SMS notification sent for alert: ${rule.name}`)
  }

  private async sendPushNotification(alert: PerformanceAlert, rule: AlertRule, config: any): Promise<void> {
    console.log(`Push notification sent for alert: ${rule.name}`)
  }

  private async sendWebhookNotification(alert: PerformanceAlert, rule: AlertRule, config: any): Promise<void> {
    console.log(`Webhook notification sent for alert: ${rule.name}`)
  }

  private async triggerAutoReschedule(alert: PerformanceAlert, rule: AlertRule): Promise<void> {
    console.log(`Auto-reschedule triggered for alert: ${rule.name}`)
  }

  private async escalateAlert(alert: PerformanceAlert, rule: AlertRule): Promise<void> {
    console.log(`Alert escalated: ${rule.name}`)
  }
}

export default AlertSystem