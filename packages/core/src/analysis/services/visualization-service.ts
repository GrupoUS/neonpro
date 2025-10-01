/**
 * Visualization Service
 * Generates data visualizations for analysis results
 */

import type { AnalysisResult } from '../types/package-analysis'

export interface VisualizationOptions {
  chartTypes: string[]
  dataFormat: string
  includeMetrics: boolean
}

export interface GeneratedVisualization {
  id: string
  chartType: string
  data: any
  config: any
  format: string
  generatedAt: string
}

export class VisualizationService {
  /**
   * Generate visualization data for analysis
   */
  async generateVisualization(
    analysis: AnalysisResult,
    chartTypes: string[],
    dataFormat: string = 'chartjs',
    includeMetrics: boolean = true
  ): Promise<GeneratedVisualization[]> {
    const visualizations: GeneratedVisualization[] = []

    for (const chartType of chartTypes) {
      const visualization = await this.generateSingleVisualization(
        analysis,
        chartType,
        dataFormat,
        includeMetrics
      )
      visualizations.push(visualization)
    }

    return visualizations
  }

  /**
   * Generate a single visualization
   */
  private async generateSingleVisualization(
    analysis: AnalysisResult,
    chartType: string,
    dataFormat: string,
    includeMetrics: boolean
  ): Promise<GeneratedVisualization> {
    const visualizationId = `viz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    let data: any
    let config: any

    switch (chartType) {
      case 'health-score-gauge':
        data = {
          labels: ['Health Score'],
          datasets: [{
            data: [analysis.healthScore],
            backgroundColor: this.getHealthScoreColor(analysis.healthScore),
            borderWidth: 0
          }]
        }
        config = {
          type: 'doughnut',
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Health Score' }
            }
          }
        }
        break

      case 'dependency-breakdown':
        const depAnalysis = analysis.dependencyAnalysis
        data = {
          labels: ['Production', 'Development', 'Peer', 'Optional'],
          datasets: [{
            data: [
              depAnalysis.productionDependencies,
              depAnalysis.devDependencies,
              depAnalysis.peerDependencies,
              depAnalysis.optionalDependencies
            ],
            backgroundColor: ['#3498db', '#e74c3c', '#f39c12', '#95a5a6']
          }]
        }
        config = {
          type: 'pie',
          options: {
            responsive: true,
            plugins: {
              title: { display: true, text: 'Dependency Breakdown' }
            }
          }
        }
        break

      case 'performance-metrics':
        const metrics = analysis.metrics
        data = {
          labels: Object.keys(metrics.performanceMetrics || {}),
          datasets: [{
            label: 'Performance Metrics',
            data: Object.values(metrics.performanceMetrics || {}),
            backgroundColor: '#2ecc71'
          }]
        }
        config = {
          type: 'bar',
          options: {
            responsive: true,
            plugins: {
              title: { display: true, text: 'Performance Metrics' }
            }
          }
        }
        break

      default:
        data = { labels: [], datasets: [] }
        config = { type: 'bar', options: {} }
    }

    return {
      id: visualizationId,
      chartType,
      data,
      config,
      format: dataFormat,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Get color based on health score
   */
  private getHealthScoreColor(score: number): string {
    if (score >= 80) return '#2ecc71' // green
    if (score >= 60) return '#f39c12' // yellow
    if (score >= 40) return '#e67e22' // orange
    return '#e74c3c' // red
  }

  /**
   * Get available chart types
   */
  getAvailableChartTypes(): string[] {
    return [
      'health-score-gauge',
      'dependency-breakdown',
      'performance-metrics',
      'security-compliance',
      'code-quality-trends'
    ]
  }

  /**
   * Get supported data formats
   */
  getSupportedDataFormats(): string[] {
    return ['chartjs', 'd3', 'plotly', 'raw']
  }
}