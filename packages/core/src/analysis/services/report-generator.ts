/**
 * Report Generator Service
 * Generates analysis reports in various formats
 */

import type { PackageAnalysis } from '../types/package-analysis'

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
    analysis: PackageAnalysis,
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
  private generateChartData(analysis: PackageAnalysis): any[] {
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

// Simple report generator for basic clinic analysis
export class SimpleReportGenerator {
  /**
   * Generate a simple report for clinic analysis
   */
  static generate(data: {
    name: string;
    lgpdIssues: number;
    mobileScore: number;
    bookingIssues: number;
    paymentIssues: number;
    findings: any[];
  }) {
    return {
      clinicName: data.name,
      summary: {
        lgpdIssues: data.lgpdIssues,
        mobileScore: data.mobileScore,
        bookingIssues: data.bookingIssues,
        paymentIssues: data.paymentIssues,
        totalIssues: data.lgpdIssues + data.bookingIssues + data.paymentIssues
      },
      roi: {
        monthlySavings: data.lgpdIssues * 5000 + data.bookingIssues * 2000 + data.paymentIssues * 3000,
        implementationCost: 15000,
        paybackMonths: Math.ceil(15000 / (data.lgpdIssues * 5000 + data.bookingIssues * 2000 + data.paymentIssues * 3000))
      },
      recommendations: data.findings.slice(0, 5).map((finding: any) => ({
        title: finding.description,
        priority: finding.severity,
        impact: finding.impact
      })),
      generatedAt: new Date().toISOString()
    };
  }
}