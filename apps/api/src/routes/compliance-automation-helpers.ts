import { COMPLIANCE_STANDARDS, MAGIC_NUMBERS, } from './compliance-automation-constants'

export async function calculateComplianceTrends(complianceHistory: unknown[],) {
  const trends = {
    areas_declining: [] as string[],
    areas_improving: [] as string[],
    average_score: COMPLIANCE_STANDARDS.MINIMUM_SCORE,
    compliance_consistency: MAGIC_NUMBERS.HUNDRED,
    score_trend: 'stable' as 'improving' | 'stable' | 'declining',
  }

  if (complianceHistory && complianceHistory.length >= MAGIC_NUMBERS.TWO) {
    const scores = complianceHistory.map((history,) => history.overall_score)
    const averageScore = scores.reduce((sum, score,) => sum + score, MAGIC_NUMBERS.ZERO,)
      / scores.length

    const [firstScore,] = scores
    const lastScore = scores.at(MAGIC_NUMBERS.NEGATIVE_ONE,)
    const trendPercentage = ((lastScore - firstScore) / firstScore) * MAGIC_NUMBERS.HUNDRED

    trends.average_score = Math.round(averageScore * MAGIC_NUMBERS.HUNDRED,) / MAGIC_NUMBERS.HUNDRED
    trends.compliance_consistency = Math.round(
      (scores.filter((score,) => score >= COMPLIANCE_STANDARDS.MINIMUM_SCORE)
        .length
        / scores.length)
        * MAGIC_NUMBERS.HUNDRED,
    )

    if (trendPercentage > MAGIC_NUMBERS.ONE) {
      trends.score_trend = 'improving'
    } else if (trendPercentage < MAGIC_NUMBERS.NEGATIVE_ONE) {
      trends.score_trend = 'declining'
    }
  }

  return trends
}

export async function categorizeAlertsBySeverity(alerts: unknown[],) {
  return {
    critical: alerts?.filter(
      (alertItem,) =>
        alertItem.severity === 'critical'
        || alertItem.severity === 'constitutional_violation',
    ).length || MAGIC_NUMBERS.ZERO,
    info: alerts?.filter((alertItem,) => alertItem.severity === 'info').length
      || MAGIC_NUMBERS.ZERO,
    total: alerts?.length || MAGIC_NUMBERS.ZERO,
    warning: alerts?.filter((alertItem,) => alertItem.severity === 'warning').length
      || MAGIC_NUMBERS.ZERO,
  }
}

export async function generateComplianceReportSummary(
  reportData: unknown[],
  startDate: Date,
  endDate: Date,
  periodDays: number,
  reportType: string,
  _tenantId: string,
) {
  return {
    compliance_overview: {
      areas_analyzed: ['LGPD', 'ANVISA', 'CFM',],
      average_score: reportData?.length
        ? reportData.reduce(
          (sum, record,) => sum + record.overall_score,
          MAGIC_NUMBERS.ZERO,
        ) / reportData.length
        : COMPLIANCE_STANDARDS.MINIMUM_SCORE,
      constitutional_compliance_rate: reportData?.length
        ? (reportData.filter(
          (record,) => record.overall_score >= COMPLIANCE_STANDARDS.MINIMUM_SCORE,
        ).length
          / reportData.length)
          * MAGIC_NUMBERS.HUNDRED
        : MAGIC_NUMBERS.HUNDRED,
      total_assessments: reportData?.length || MAGIC_NUMBERS.ZERO,
    },
    download_url: '/api/v1/compliance-automation/reports/download/',
    generated_at: new Date().toISOString(),
    period: {
      days: periodDays,
      end: endDate.toISOString(),
      start: startDate.toISOString(),
    },
    report_id: `compliance_report_${Date.now()}`,
    report_type: reportType,
  }
}

// Additional missing helper functions for compliance automation
export async function createComplianceAutomationResult(data: unknown,) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    compliance_score: COMPLIANCE_STANDARDS.MINIMUM_SCORE,
  }
}

export async function createComplianceReport(data: unknown,) {
  return generateComplianceReportSummary(
    data.reportData || [],
    new Date(data.startDate,),
    new Date(data.endDate,),
    data.periodDays || MAGIC_NUMBERS.THIRTY,
    data.reportType || 'general',
    data.tenantId || 'default',
  )
}

export async function validateComplianceData(data: unknown,) {
  const isValid = data && typeof data === 'object' && data.tenantId
  return {
    isValid,
    errors: isValid ? [] : ['Missing required tenant ID',],
    warnings: [],
  }
}
