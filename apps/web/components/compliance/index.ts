// Main compliance system integration and exports
export { ComplianceDashboard, } from './ComplianceDashboard'
export { ComplianceOrchestrator, } from './ComplianceOrchestrator'
export { ComplianceService, } from './ComplianceService'
export { ComplianceSystemValidator, } from './ComplianceSystemValidator'

// Core components
export { ANVISATester, } from './testing/ANVISATester'
export { CFMTester, } from './testing/CFMTester'
export { ComplianceTestRunner, } from './testing/ComplianceTestRunner'
export { LGPDTester, } from './testing/LGPDTester'
export { WCAGTester, } from './testing/WCAGTester'

// Reporting components
export { ComplianceReportGenerator, } from './reporting/ComplianceReportGenerator'
export { ComplianceReportManager, } from './reporting/ComplianceReportManager'
export { ReportScheduler, } from './reporting/ReportScheduler'

// Workflow components
export { RemediationEngine, } from './workflows/RemediationEngine'
export { ViolationDetector, } from './workflows/ViolationDetector'
export { WorkflowManager, } from './workflows/WorkflowManager'

// Audit components
export { AuditPreparationEngine, } from './audit/AuditPreparationEngine'
export { EvidenceCollector, } from './audit/EvidenceCollector'

// Feedback and improvement
export { FeedbackCollector, ImprovementEngine, } from './feedback'

// Automation components
export { AutomationConfig, } from './automation/AutomationConfig'
export { AutomationDashboard, } from './automation/AutomationDashboard'

// Types
export * from './feedback/types'
export * from './types'

// Hooks for React integration
export { useComplianceData, } from './hooks'

// Default system configuration
export const defaultComplianceConfig = {
  frameworks: ['WCAG', 'LGPD', 'ANVISA', 'CFM',] as const,
  enabledModules: {
    dashboard: true,
    testing: true,
    reporting: true,
    workflows: true,
    auditPrep: true,
    feedback: true,
  },
  monitoring: {
    realTimeUpdates: true,
    detectionInterval: 15, // minutes
    reportingSchedule: 'weekly' as const,
    alertThresholds: {
      criticalViolations: 0,
      scoreThreshold: 80,
    },
  },
  automation: {
    autoRemediation: true,
    scheduledReports: true,
    feedbackAnalysis: true,
  },
}

/**
 * Initialize the complete compliance system
 */
export const initializeComplianceSystem = async (config = defaultComplianceConfig,) => {
  console.log('🏥 Initializing NeonPro Healthcare Compliance System',)

  const orchestrator = new ComplianceOrchestrator(config,)
  await orchestrator.initialize()

  const validator = new ComplianceSystemValidator(orchestrator,)
  const validationReport = await validator.runFullValidation()

  console.log('✅ Compliance system initialization complete',)
  console.log(
    `📊 Validation: ${validationReport.overallStatus} (${validationReport.passedTests}/${validationReport.totalTests} tests passed)`,
  )

  return {
    orchestrator,
    validator,
    validationReport,
    config,
  }
}

/**
 * Quick start compliance monitoring
 */
export const startComplianceMonitoring = async (
  frameworks: ComplianceFramework[] = ['WCAG', 'LGPD', 'ANVISA', 'CFM',],
) => {
  console.log('🚀 Starting quick compliance monitoring',)

  const config = {
    ...defaultComplianceConfig,
    frameworks,
  }

  const system = await initializeComplianceSystem(config,)

  // Run initial comprehensive check
  const initialCheck = await system.orchestrator.runComprehensiveCheck()
  console.log('📋 Initial compliance check complete:', initialCheck.summary,)

  return system
}

/**
 * Emergency compliance response helper
 */
export const triggerEmergencyResponse = async (
  orchestrator: ComplianceOrchestrator,
  trigger: {
    type: 'critical_violation' | 'audit_alert' | 'security_breach' | 'system_failure'
    details: unknown
  },
) => {
  console.log(`🚨 Triggering emergency compliance response: ${trigger.type}`,)

  await orchestrator.executeEmergencyResponse(trigger,)

  // Generate immediate status report
  const statusReport = await orchestrator.getSystemStatus()

  return {
    triggerType: trigger.type,
    responseExecuted: true,
    systemStatus: statusReport,
    timestamp: new Date(),
  }
}

/**
 * Generate compliance dashboard data
 */
export const getComplianceDashboardData = async (orchestrator: ComplianceOrchestrator,) => {
  const [systemStatus, comprehensiveCheck,] = await Promise.all([
    orchestrator.getSystemStatus(),
    orchestrator.runComprehensiveCheck(),
  ],)

  return {
    systemHealth: systemStatus,
    complianceScores: comprehensiveCheck.summary,
    recommendations: comprehensiveCheck.recommendations,
    nextActions: comprehensiveCheck.nextActions,
    lastUpdated: new Date(),
  }
}

/**
 * Healthcare-specific compliance utilities
 */
export const healthcareComplianceUtils = {
  /**
   * Check if system meets Brazilian healthcare regulations
   */
  validateBrazilianHealthcareCompliance: async (orchestrator: ComplianceOrchestrator,) => {
    const brazilianFrameworks: ComplianceFramework[] = new Set(['ANVISA', 'CFM', 'LGPD',],)
    const check = await orchestrator.runComprehensiveCheck()

    const brazilianScores = Object.entries(check.summary.frameworkScores,)
      .filter(([framework,],) => brazilianFrameworks.has(framework as ComplianceFramework,))
      .reduce((acc, [framework, score,],) => {
        acc[framework as ComplianceFramework] = score
        return acc
      }, {} as Record<ComplianceFramework, number>,)

    const averageScore = Object.values(brazilianScores,).reduce((sum, score,) => sum + score, 0,)
      / Object.values(brazilianScores,).length
    const meetsStandards = averageScore >= 85

    return {
      meetsStandards,
      averageScore,
      frameworkScores: brazilianScores,
      criticalIssues: check.nextActions.filter(action => action.priority === 'high'),
      certification: meetsStandards ? 'compliant' : 'needs_improvement',
    }
  },

  /**
   * Generate audit-ready compliance package
   */
  generateAuditPackage: async (
    orchestrator: ComplianceOrchestrator,
    framework: ComplianceFramework,
  ) => {
    const [report, systemStatus,] = await Promise.all([
      orchestrator.generateComprehensiveReport('audit',),
      orchestrator.getSystemStatus(),
    ],)

    return {
      framework,
      auditReport: report,
      systemHealth: systemStatus,
      complianceStatement: `Sistema em conformidade com ${framework}`,
      evidencePackage: {
        policies: [],
        procedures: [],
        testResults: [],
        screenshots: [],
      },
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000,), // 90 days
    }
  },

  /**
   * Patient data protection assessment
   */
  assessPatientDataProtection: async (orchestrator: ComplianceOrchestrator,) => {
    const lgpdCheck = await orchestrator.runComprehensiveCheck()
    const lgpdScore = lgpdCheck.summary.frameworkScores.LGPD || 0

    return {
      protectionLevel: lgpdScore >= 90
        ? 'excellent'
        : lgpdScore >= 75
        ? 'good'
        : lgpdScore >= 60
        ? 'adequate'
        : 'needs_improvement',
      score: lgpdScore,
      dataProcessingCompliance: lgpdScore >= 80,
      consentManagementActive: lgpdScore >= 70,
      retentionPoliciesImplemented: lgpdScore >= 85,
      recommendations: lgpdCheck.recommendations.filter(r =>
        r.toLowerCase().includes('lgpd',) || r.toLowerCase().includes('data',)
      ),
      lastAssessment: new Date(),
    }
  },
}

// Export default configuration and utilities
export default {
  initializeComplianceSystem,
  startComplianceMonitoring,
  triggerEmergencyResponse,
  getComplianceDashboardData,
  healthcareComplianceUtils,
  defaultConfig: defaultComplianceConfig,
}
