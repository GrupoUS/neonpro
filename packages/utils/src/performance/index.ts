/**
 * Performance Optimization Module
 * Brazilian Healthcare Infrastructure Performance Suite
 */

// Brazilian Connectivity Optimization
export {
  BrazilianConnectivityOptimizer,
  brazilianConnectivityOptimizer,
} from './brazilian-connectivity-optimizer'

export type {
  BrazilianCDNConfig,
  BrazilianRegion,
  ConnectivityTier,
  PerformanceMetrics,
} from './brazilian-connectivity-optimizer'

// Bundle Analysis & Optimization
export { brazilianBundleAnalyzer, BundleAnalyzer, } from './bundle-analyzer'

export type {
  BundleAnalysisReport,
  BundleChunk,
  BundleDependency,
  BundleRecommendation,
  OptimizationConfig,
} from './bundle-analyzer'

// Infrastructure Monitoring & Performance Dashboard
export {
  brazilianInfrastructureMonitoring,
  InfrastructureMonitoringService,
} from './infrastructure-monitoring'

export type {
  Alert,
  AlertThresholds,
  BrazilianMonitoringRegion,
  ComplianceCheck,
  CriticalPath,
  HealthcareWorkflowMonitoring,
  MonitoringMetrics,
  PerformanceDashboardConfig,
  SLATarget,
} from './infrastructure-monitoring'

// Performance optimization utilities
export const PerformanceOptimization = {
  // Quick access to main services with lazy initialization
  get connectivity() {
    return BrazilianConnectivityOptimizer.getInstance()
  },
  get bundleAnalyzer() {
    return brazilianBundleAnalyzer
  },
  get monitoring() {
    return brazilianInfrastructureMonitoring
  },

  // Utility functions for Brazilian healthcare performance
  async initializeForHealthcare() {
    const tier = this.connectivity.detectConnectivityTier()
    await this.connectivity.loadResourcesForTier(tier,)

    // Start monitoring
    await this.monitoring.collectMetrics()

    return {
      tier,
      cdnConfig: this.connectivity.getCDNConfig(),
      optimalNode: this.connectivity.getOptimalCDNNode(),
    }
  },

  async generatePerformanceReport() {
    const [bundleReport, dashboardData,] = await Promise.all([
      this.bundleAnalyzer.generateBrazilianHealthcareReport(),
      Promise.resolve(this.monitoring.generateDashboardData(),),
    ],)

    return {
      bundle: bundleReport,
      infrastructure: dashboardData,
      timestamp: new Date().toISOString(),
    }
  },

  getOptimizationConfigs() {
    return {
      webpack: this.bundleAnalyzer.generateOptimizedWebpackConfig(),
      nextjs: this.bundleAnalyzer.generateOptimizedNextConfig(),
      performanceBudget: this.bundleAnalyzer.createPerformanceBudget(),
    }
  },
}

// Export performance constants for Brazilian healthcare
export const BRAZILIAN_PERFORMANCE_TARGETS = {
  EMERGENCY_RESPONSE_TIME: 100, // ms
  PATIENT_LOOKUP_TIME: 200, // ms
  APPOINTMENT_BOOKING_TIME: 500, // ms
  AI_CHAT_RESPONSE_TIME: 1500, // ms
  BUNDLE_SIZE_TARGET: 500 * 1024, // 500KB
  CDN_CACHE_TTL: 31_536_000, // 1 year
  CONNECTIVITY_TIERS: {
    TIER1_PREMIUM: ['São Paulo', 'Rio de Janeiro', 'Brasília',],
    TIER2_STANDARD: ['Regional Capitals',],
    TIER3_LIMITED: ['Interior Cities',],
  },
} as const

export const HEALTHCARE_WORKFLOW_PRIORITIES = {
  CRITICAL: ['emergency-protocols', 'patient-management', 'cfm-compliance',],
  HIGH: ['appointment-booking', 'lgpd-compliance', 'anvisa-tracking',],
  MEDIUM: ['ai-chat', 'predictive-analytics', 'automated-analysis',],
  LOW: ['advanced-reporting', 'dashboard-widgets', 'export-tools',],
} as const
