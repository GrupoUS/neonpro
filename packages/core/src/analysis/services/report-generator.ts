/**
 * Report Generator Service
 * Generates analysis reports in various formats
 */

import type { AnalysisResult } from '../types/package-analysis'

export interface ReportOptions {
  includeRecommendations?: boolean
  includeCharts?: boolean
  format?: 'pdf' | 'html' | 'json'
}

export interface GeneratedReport {
  id: string
  title: string
  content: string
  format: string
  generatedAt: string
  metadata: {
    analysisId: string
    reportType: string
    pageCount?: number
  }
}

export class ReportGenerator {
  /**
   * Generate a report for an analysis
   */
  async generateReport(
    analysis: AnalysisResult,
    reportType: string,
    format: string = 'json',
    includeRecommendations: boolean = true,
    includeCharts: boolean = false
  ): Promise<GeneratedReport> {
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const report: GeneratedReport = {
      id: reportId,
      title: `${reportType} Report - ${analysis.packageName}`,
      content: JSON.stringify({
        summary: analysis.summary,
        healthScore: analysis.healthScore,
        recommendations: includeRecommendations ? analysis.recommendations : [],
        metrics: analysis.metrics,
        charts: includeCharts ? this.generateChartData(analysis) : []
      }, null, 2),
      format,
      generatedAt: new Date().toISOString(),
      metadata: {
        analysisId: analysis.id,
        reportType,
        pageCount: format === 'pdf' ? 1 : undefined
      }
    }

    return report
  }

  /**
   * Generate chart data for reports
   */
  private generateChartData(analysis: AnalysisResult): any[] {
    return [
      {
        type: 'health-score',
        data: analysis.healthScore,
        label: 'Health Score'
      },
      {
        type: 'dependencies',
        data: analysis.dependencyAnalysis.totalDependencies,
        label: 'Total Dependencies'
      }
    ]
  }

  /**
   * Get available report types
   */
  getAvailableReportTypes(): string[] {
    return [
      'executive-summary',
      'technical-analysis',
      'security-assessment',
      'performance-analysis',
      'compliance-report'
    ]
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): string[] {
    return ['json', 'html', 'pdf']
  }
}