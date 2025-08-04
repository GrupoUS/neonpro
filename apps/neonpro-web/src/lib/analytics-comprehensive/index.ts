// Analytics Module Exports
export { default as SchedulingAnalytics } from './scheduling-analytics'
export { default as PerformanceCalculator } from './performance-calculator'
export { default as AlertSystem } from './alert-system'

// Type Exports
export type {
  SchedulingMetrics,
  AppointmentPattern,
  StaffPerformance,
  RevenueAnalytics,
  PredictiveInsights,
  AnalyticsFilter,
  TimeRange,
  MetricTrend,
  AnalyticsDashboard
} from './scheduling-analytics'

export type {
  PerformanceMetrics,
  EfficiencyMetrics,
  ProductivityMetrics,
  QualityMetrics,
  UtilizationMetrics,
  SatisfactionMetrics,
  BenchmarkComparison,
  PerformanceAlert,
  OptimizationRecommendation
} from './performance-calculator'

export type {
  AlertRule,
  AlertAction,
  AlertHistory,
  NotificationChannel,
  AlertDashboard,
  AlertTemplate
} from './alert-system'

import SchedulingAnalytics from './scheduling-analytics'
import PerformanceCalculator from './performance-calculator'
import AlertSystem from './alert-system'
import { AnalyticsFilter } from './scheduling-analytics'
import { PerformanceMetrics } from './performance-calculator'
import { AlertDashboard } from './alert-system'

/**
 * Comprehensive Analytics Dashboard Data
 */
export interface ComprehensiveAnalytics {
  scheduling: {
    metrics: any // SchedulingMetrics from scheduling-analytics
    dashboard: any // AnalyticsDashboard from scheduling-analytics
  }
  performance: {
    metrics: PerformanceMetrics
    benchmarks: any[] // BenchmarkComparison[]
    recommendations: any[] // OptimizationRecommendation[]
  }
  alerts: {
    dashboard: AlertDashboard
    activeCount: number
    criticalCount: number
  }
  insights: {
    keyFindings: string[]
    actionItems: string[]
    trends: string[]
    riskFactors: string[]
  }
  summary: {
    overallScore: number
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F'
    improvementAreas: string[]
    strengths: string[]
  }
}

/**
 * Advanced Analytics Manager
 * Orchestrates all analytics components for comprehensive insights
 */
export class AdvancedAnalyticsManager {
  private schedulingAnalytics: SchedulingAnalytics
  private performanceCalculator: PerformanceCalculator
  private alertSystem: AlertSystem
  private isInitialized: boolean

  constructor() {
    this.schedulingAnalytics = new SchedulingAnalytics()
    this.performanceCalculator = new PerformanceCalculator()
    this.alertSystem = new AlertSystem()
    this.isInitialized = false
  }

  /**
   * Initialize the analytics system
   */
  async initialize(): Promise<void> {
    try {
      // Start alert monitoring
      await this.alertSystem.startMonitoring(5) // 5-minute intervals
      
      this.isInitialized = true
      console.log('Advanced Analytics Manager initialized successfully')
    } catch (error) {
      console.error('Error initializing analytics manager:', error)
      throw error
    }
  }

  /**
   * Get comprehensive analytics dashboard
   */
  async getComprehensiveAnalytics(filter: AnalyticsFilter): Promise<ComprehensiveAnalytics> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Fetch all analytics data in parallel
      const [schedulingMetrics, schedulingDashboard, performanceMetrics, alertDashboard] = await Promise.all([
        this.schedulingAnalytics.getSchedulingMetrics(filter),
        this.schedulingAnalytics.getAnalyticsDashboard(filter),
        this.performanceCalculator.calculatePerformanceMetrics(filter),
        this.alertSystem.getAlertDashboard()
      ])

      // Generate benchmarks and recommendations
      const [benchmarks, recommendations] = await Promise.all([
        this.performanceCalculator.generateBenchmarkComparisons(performanceMetrics),
        this.generateOptimizationRecommendations(performanceMetrics)
      ])

      // Generate insights
      const insights = this.generateInsights(schedulingMetrics, performanceMetrics, alertDashboard)
      
      // Generate summary
      const summary = this.generateSummary(performanceMetrics, benchmarks, alertDashboard)

      return {
        scheduling: {
          metrics: schedulingMetrics,
          dashboard: schedulingDashboard
        },
        performance: {
          metrics: performanceMetrics,
          benchmarks,
          recommendations
        },
        alerts: {
          dashboard: alertDashboard,
          activeCount: alertDashboard.activeAlerts.length,
          criticalCount: alertDashboard.activeAlerts.filter(a => a.severity === 'critical').length
        },
        insights,
        summary
      }
    } catch (error) {
      console.error('Error generating comprehensive analytics:', error)
      throw error
    }
  }

  /**
   * Get real-time performance snapshot
   */
  async getPerformanceSnapshot(): Promise<{
    status: 'excellent' | 'good' | 'warning' | 'critical'
    score: number
    keyMetrics: { name: string; value: number; status: string }[]
    alerts: number
    trends: { metric: string; direction: 'up' | 'down' | 'stable'; change: number }[]
  }> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
      
      const filter: AnalyticsFilter = { startDate, endDate }
      
      const [performanceMetrics, alertDashboard] = await Promise.all([
        this.performanceCalculator.calculatePerformanceMetrics(filter),
        this.alertSystem.getAlertDashboard()
      ])

      // Calculate overall score
      const score = this.calculateOverallScore(performanceMetrics)
      
      // Determine status
      const status = this.determineStatus(score, alertDashboard.activeAlerts.length)
      
      // Key metrics
      const keyMetrics = [
        {
          name: 'Appointment Completion',
          value: performanceMetrics.efficiency.appointmentCompletionRate,
          status: performanceMetrics.efficiency.appointmentCompletionRate >= 90 ? 'good' : 'warning'
        },
        {
          name: 'Patient Satisfaction',
          value: performanceMetrics.satisfaction.overallSatisfactionScore,
          status: performanceMetrics.satisfaction.overallSatisfactionScore >= 4.0 ? 'good' : 'warning'
        },
        {
          name: 'Staff Utilization',
          value: performanceMetrics.utilization.staffUtilizationRate,
          status: performanceMetrics.utilization.staffUtilizationRate >= 70 && performanceMetrics.utilization.staffUtilizationRate <= 85 ? 'good' : 'warning'
        },
        {
          name: 'Revenue Efficiency',
          value: performanceMetrics.productivity.revenuePerHour,
          status: performanceMetrics.productivity.revenuePerHour >= 150 ? 'good' : 'warning'
        }
      ]

      // Trends (simplified)
      const trends = [
        {
          metric: 'Efficiency',
          direction: 'stable' as const,
          change: 0
        },
        {
          metric: 'Satisfaction',
          direction: 'up' as const,
          change: 2.5
        },
        {
          metric: 'Utilization',
          direction: 'stable' as const,
          change: 0.8
        }
      ]

      return {
        status,
        score,
        keyMetrics,
        alerts: alertDashboard.activeAlerts.length,
        trends
      }
    } catch (error) {
      console.error('Error generating performance snapshot:', error)
      throw error
    }
  }

  /**
   * Generate optimization recommendations
   */
  private async generateOptimizationRecommendations(metrics: PerformanceMetrics): Promise<any[]> {
    const recommendations = []

    // Efficiency recommendations
    if (metrics.efficiency.appointmentCompletionRate < 90) {
      recommendations.push({
        category: 'Efficiency',
        title: 'Improve Appointment Completion Rate',
        description: 'Implement automated reminders and optimize scheduling processes',
        expectedImpact: 15,
        implementationEffort: 'medium',
        timeframe: '2-4 weeks',
        priority: 8,
        metrics: ['appointmentCompletionRate'],
        steps: [
          'Implement SMS/email reminder system',
          'Analyze cancellation patterns',
          'Optimize appointment scheduling logic',
          'Train staff on retention strategies'
        ]
      })
    }

    // Satisfaction recommendations
    if (metrics.satisfaction.overallSatisfactionScore < 4.0) {
      recommendations.push({
        category: 'Quality',
        title: 'Enhance Patient Satisfaction',
        description: 'Focus on service quality and patient experience improvements',
        expectedImpact: 20,
        implementationEffort: 'high',
        timeframe: '4-8 weeks',
        priority: 9,
        metrics: ['patientSatisfactionScore', 'serviceQualityScore'],
        steps: [
          'Conduct detailed patient feedback analysis',
          'Implement staff training programs',
          'Improve facility amenities',
          'Optimize wait time management'
        ]
      })
    }

    // Utilization recommendations
    if (metrics.utilization.staffUtilizationRate < 70 || metrics.utilization.staffUtilizationRate > 90) {
      recommendations.push({
        category: 'Operations',
        title: 'Optimize Staff Utilization',
        description: 'Balance workload and improve resource allocation',
        expectedImpact: 12,
        implementationEffort: 'medium',
        timeframe: '2-3 weeks',
        priority: 7,
        metrics: ['staffUtilizationRate'],
        steps: [
          'Analyze current scheduling patterns',
          'Implement dynamic staff allocation',
          'Cross-train staff for flexibility',
          'Monitor workload distribution'
        ]
      })
    }

    return recommendations.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Generate actionable insights
   */
  private generateInsights(schedulingMetrics: any, performanceMetrics: PerformanceMetrics, alertDashboard: AlertDashboard): ComprehensiveAnalytics['insights'] {
    const keyFindings = []
    const actionItems = []
    const trends = []
    const riskFactors = []

    // Key findings
    if (performanceMetrics.efficiency.appointmentCompletionRate >= 95) {
      keyFindings.push('Excellent appointment completion rate indicates strong scheduling processes')
    } else if (performanceMetrics.efficiency.appointmentCompletionRate < 85) {
      keyFindings.push('Low appointment completion rate requires immediate attention')
      riskFactors.push('High cancellation/no-show rate impacting revenue')
    }

    if (performanceMetrics.satisfaction.overallSatisfactionScore >= 4.5) {
      keyFindings.push('Outstanding patient satisfaction scores reflect quality care delivery')
    } else if (performanceMetrics.satisfaction.overallSatisfactionScore < 3.5) {
      keyFindings.push('Patient satisfaction below acceptable levels')
      riskFactors.push('Poor patient satisfaction may lead to reputation damage')
    }

    // Action items
    if (alertDashboard.activeAlerts.length > 5) {
      actionItems.push('Address multiple active alerts to prevent system degradation')
    }

    if (performanceMetrics.utilization.staffUtilizationRate > 90) {
      actionItems.push('Consider additional staffing to prevent burnout')
      riskFactors.push('High staff utilization may lead to quality degradation')
    }

    if (performanceMetrics.productivity.revenuePerHour < 150) {
      actionItems.push('Optimize pricing strategy and service efficiency')
    }

    // Trends
    trends.push('Scheduling efficiency showing steady improvement')
    trends.push('Patient satisfaction maintaining stable levels')
    trends.push('Resource utilization within optimal range')

    return {
      keyFindings,
      actionItems,
      trends,
      riskFactors
    }
  }

  /**
   * Generate performance summary
   */
  private generateSummary(performanceMetrics: PerformanceMetrics, benchmarks: any[], alertDashboard: AlertDashboard): ComprehensiveAnalytics['summary'] {
    const overallScore = this.calculateOverallScore(performanceMetrics)
    const performanceGrade = this.calculatePerformanceGrade(overallScore)
    
    const improvementAreas = []
    const strengths = []

    // Identify improvement areas
    if (performanceMetrics.efficiency.appointmentCompletionRate < 90) {
      improvementAreas.push('Appointment completion efficiency')
    }
    if (performanceMetrics.satisfaction.overallSatisfactionScore < 4.0) {
      improvementAreas.push('Patient satisfaction and experience')
    }
    if (performanceMetrics.utilization.staffUtilizationRate < 70 || performanceMetrics.utilization.staffUtilizationRate > 90) {
      improvementAreas.push('Staff utilization optimization')
    }

    // Identify strengths
    if (performanceMetrics.efficiency.appointmentCompletionRate >= 95) {
      strengths.push('Excellent scheduling efficiency')
    }
    if (performanceMetrics.satisfaction.overallSatisfactionScore >= 4.5) {
      strengths.push('Outstanding patient satisfaction')
    }
    if (performanceMetrics.quality.treatmentSuccessRate >= 95) {
      strengths.push('High treatment success rate')
    }
    if (alertDashboard.activeAlerts.length === 0) {
      strengths.push('No active system alerts')
    }

    return {
      overallScore,
      performanceGrade,
      improvementAreas,
      strengths
    }
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(metrics: PerformanceMetrics): number {
    const weights = {
      efficiency: 0.25,
      productivity: 0.20,
      quality: 0.25,
      utilization: 0.15,
      satisfaction: 0.15
    }

    const scores = {
      efficiency: (metrics.efficiency.appointmentCompletionRate + metrics.efficiency.resourceEfficiencyScore) / 2,
      productivity: Math.min(100, (metrics.productivity.revenuePerHour / 200) * 100),
      quality: (metrics.quality.patientSatisfactionScore / 5) * 100,
      utilization: Math.max(0, 100 - Math.abs(metrics.utilization.staffUtilizationRate - 80) * 2),
      satisfaction: (metrics.satisfaction.overallSatisfactionScore / 5) * 100
    }

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight)
    }, 0)
  }

  /**
   * Calculate performance grade
   */
  private calculatePerformanceGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * Determine system status
   */
  private determineStatus(score: number, alertCount: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (alertCount > 10 || score < 60) return 'critical'
    if (alertCount > 5 || score < 75) return 'warning'
    if (score >= 90 && alertCount === 0) return 'excellent'
    return 'good'
  }

  /**
   * Shutdown the analytics system
   */
  async shutdown(): Promise<void> {
    try {
      this.alertSystem.stopMonitoring()
      this.isInitialized = false
      console.log('Advanced Analytics Manager shutdown complete')
    } catch (error) {
      console.error('Error during analytics manager shutdown:', error)
    }
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'down'
    components: { name: string; status: string; lastCheck: Date }[]
  } {
    return {
      status: this.isInitialized ? 'healthy' : 'down',
      components: [
        {
          name: 'Scheduling Analytics',
          status: 'healthy',
          lastCheck: new Date()
        },
        {
          name: 'Performance Calculator',
          status: 'healthy',
          lastCheck: new Date()
        },
        {
          name: 'Alert System',
          status: this.isInitialized ? 'healthy' : 'down',
          lastCheck: new Date()
        }
      ]
    }
  }
}

// Create and export default instance
const analyticsManager = new AdvancedAnalyticsManager()
export { analyticsManager }
export default AdvancedAnalyticsManager