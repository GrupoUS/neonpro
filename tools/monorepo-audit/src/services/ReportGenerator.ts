import { promises as fs } from 'fs';
import path from 'path';
import {
  AuditData,
  ComparisonReport,
  DetailLevel,
  ExecutiveSummary,
  GeneratedReport,
  IReportGenerator,
  MetricsSummary,
  PerformanceMetrics,
  ReportFormat,
  ReportMetadata,
  ReportOptions,
  ReportSection,
  ReportTemplate,
  TechnicalReport,
  TechnicalReportOptions,
  VisualizationData,
} from '../../specs/contracts/report-generator.contract.js';
import { AuditReport } from '../models/types.js';

/**
 * Generates comprehensive audit reports in multiple formats
 * Supports executive summaries, technical reports, dashboards, and comparisons
 */
export class ReportGenerator implements IReportGenerator {
  private templates: Map<string, ReportTemplate> = new Map();

  constructor() {
    // Initialize default templates
    this.initializeDefaultTemplates();
  }

  /**
   * Generate comprehensive audit report
   */
  async generateAuditReport(auditData: AuditData, options: ReportOptions): Promise<GeneratedReport> {
    const startTime = Date.now();
    const reportId = this.generateReportId();
    
    // Initialize template
    await this.initializeTemplate(options.template);
    
    // Extract data
    const extractedData = this.extractReportData(auditData);
    
    // Generate content based on format
    let content: string;
    switch (options.format) {
      case 'html':
        content = this.generateHtmlReport(extractedData, options);
        break;
      case 'markdown':
        content = this.generateMarkdownReport(extractedData, options);
        break;
      case 'json':
        content = JSON.stringify(extractedData, null, 2);
        break;
      default:
        content = this.generateHtmlReport(extractedData, options);
    }
    
    const generationTime = Date.now() - startTime;
    const size = Buffer.byteLength(content, 'utf8');
    
    return {
      metadata: {
        reportId,
        generatedAt: new Date(),
        format: options.format,
        size,
        generationTime
      },
      content,
      attachments: []
    };
  }

  /**
   * Generate executive summary
   */
  async generateExecutiveSummary(auditData: AuditData): Promise<ExecutiveSummary> {
    const extractedData = this.extractReportData(auditData);
    const overallScore = this.calculateOverallScore(extractedData);
    
    // Generate overall assessment
    const overallAssessment = this.generateOverallAssessment(extractedData, overallScore);
    
    // Extract key findings
    const keyFindings = this.extractKeyFindings(extractedData);
    
    // Generate top recommendations
    const topRecommendations = this.generateTopRecommendations(extractedData);
    
    // Create metrics summary
    const metricsSummary = {
      overallScore,
      totalFiles: extractedData.fileResults?.totalFiles || 0,
      unusedFiles: extractedData.fileResults?.unusedFiles?.length || 0,
      circularDependencies: extractedData.dependencyResults?.circularDependencies?.length || 0,
      architectureViolations: extractedData.architectureResults?.violations?.length || 0,
      spaceReclaimable: extractedData.cleanupResults?.spaceReclaimed || 0
    };
    
    return {
      overallAssessment,
      keyFindings,
      topRecommendations,
      metricsSummary
    };
  }

  /**
   * Generate technical report
   */
  public async generateTechnicalReport(
    auditData: AuditData,
    options: TechnicalReportOptions,
  ): Promise<TechnicalReport> {
    const sections = {
      fileSystemAnalysis: this.generateDetailedFileAnalysis(auditData.fileResults, options),
      dependencyAnalysis: this.generateDetailedDependencyAnalysis(
        auditData.dependencyResults,
        options,
      ),
      architectureValidation: this.generateDetailedArchitectureAnalysis(
        auditData.architectureResults,
        options,
      ),
      cleanupAnalysis: this.generateDetailedCleanupAnalysis(auditData.cleanupResults, options),
      performanceAnalysis: this.generateDetailedPerformanceAnalysis(
        auditData.performanceMetrics,
        options,
      ),
    };

    const technicalMetrics = this.calculateTechnicalMetrics(auditData);
    const detailedRecommendations = this.generateDetailedRecommendations(auditData, options);

    return {
      sections,
      technicalMetrics,
      detailedRecommendations,
      appendices: options.includeAppendices ? this.generateAppendices(auditData) : {},
    };
  }

  /**
   * Generate comparison report
   */
  public async generateComparisonReport(
    beforeData: AuditData,
    afterData: AuditData,
  ): Promise<ComparisonReport> {
    // Compare metrics
    const beforeSummary = await this.generateExecutiveSummary(beforeData);
    const afterSummary = await this.generateExecutiveSummary(afterData);

    const improvements = {
      healthScoreChange: afterSummary.overallHealthScore - beforeSummary.overallHealthScore,
      complianceScoreChange: afterSummary.complianceScore - beforeSummary.complianceScore,
      efficiencyScoreChange: afterSummary.efficiencyScore - beforeSummary.efficiencyScore,
      unusedAssetsReduced: beforeSummary.unusedAssetsFound - afterSummary.unusedAssetsFound,
      criticalIssuesResolved: beforeSummary.criticalIssuesFound - afterSummary.criticalIssuesFound,
      spaceReclaimed: beforeSummary.spaceReclaimable - afterSummary.spaceReclaimable,
    };

    const detailedComparisons = {
      fileChanges: this.compareFileResults(beforeData.fileResults, afterData.fileResults),
      dependencyChanges: this.compareDependencyResults(
        beforeData.dependencyResults,
        afterData.dependencyResults,
      ),
      architectureChanges: this.compareArchitectureResults(
        beforeData.architectureResults,
        afterData.architectureResults,
      ),
      performanceChanges: this.comparePerformanceMetrics(
        beforeData.performanceMetrics,
        afterData.performanceMetrics,
      ),
    };

    const impactAnalysis = this.generateImpactAnalysis(improvements);

    return {
      beforeSummary,
      afterSummary,
      improvements,
      detailedComparisons,
      impactAnalysis,
      generatedAt: new Date(),
    };
  }

  /**
   * Export report in specified format
   */
  async exportReport(report: GeneratedReport, format: ReportFormat, outputPath: string): Promise<void> {
    try {
      let exportContent: string;
      
      switch (format) {
        case 'html':
          exportContent = report.content;
          break;
        case 'markdown':
          exportContent = this.convertToMarkdown(report.content);
          break;
        case 'json':
          exportContent = JSON.stringify({
            metadata: report.metadata,
            content: report.content,
            attachments: report.attachments
          }, null, 2);
          break;
        case 'pdf':
          // For PDF, we would need a PDF generation library
          throw new Error('PDF export not yet implemented');
        case 'csv':
          exportContent = this.convertToCsv(report);
          break;
        case 'xml':
          exportContent = this.convertToXml(report);
          break;
        case 'yaml':
          exportContent = this.convertToYaml(report);
          break;
        default:
          exportContent = report.content;
      }
      
      // Write to file
      await this.writeToFile(outputPath, exportContent);
      
    } catch (error) {
      throw new Error(`Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate metrics dashboard
   */
  async generateDashboard(auditData: AuditData): Promise<string> {
    const extractedData = this.extractReportData(auditData);
    const overallScore = this.calculateOverallScore(extractedData);
    
    // Generate dashboard HTML
    const dashboardHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monorepo Audit Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .dashboard { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .metric-label { color: #6b7280; margin-top: 5px; }
        .score-circle { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; color: white; margin: 0 auto; }
        .score-excellent { background: #10b981; }
        .score-good { background: #f59e0b; }
        .score-poor { background: #ef4444; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>Monorepo Audit Dashboard</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="score-circle ${overallScore >= 80 ? 'score-excellent' : overallScore >= 60 ? 'score-good' : 'score-poor'}">
                    ${overallScore}%
                </div>
                <div class="metric-label">Overall Health Score</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${extractedData.fileResults?.totalFiles || 0}</div>
                <div class="metric-label">Total Files</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${extractedData.fileResults?.unusedFiles?.length || 0}</div>
                <div class="metric-label">Unused Files</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${extractedData.dependencyResults?.circularDependencies?.length || 0}</div>
                <div class="metric-label">Circular Dependencies</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${extractedData.architectureResults?.violations?.length || 0}</div>
                <div class="metric-label">Architecture Violations</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${Math.round((extractedData.cleanupResults?.spaceReclaimed || 0) / 1024 / 1024)}MB</div>
                <div class="metric-label">Space Reclaimable</div>
            </div>
        </div>
    </div>
</body>
</html>`;
    
    return dashboardHtml;
  } /**

  private convertToMarkdown(htmlContent: string): string {
    // Simple HTML to Markdown conversion
    return htmlContent
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
  }

  private convertToCsv(report: GeneratedReport): string {
    // Convert report data to CSV format
    const lines = ['Report ID,Generated At,Format,Size'];
    lines.push(`${report.metadata.reportId},${report.metadata.generatedAt.toISOString()},${report.metadata.format},${report.metadata.size}`);
    return lines.join('\n');
  }

  private convertToXml(report: GeneratedReport): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<report>
  <metadata>
    <reportId>${report.metadata.reportId}</reportId>
    <generatedAt>${report.metadata.generatedAt.toISOString()}</generatedAt>
    <format>${report.metadata.format}</format>
    <size>${report.metadata.size}</size>
  </metadata>
  <content><![CDATA[${report.content}]]></content>
</report>`;
  }

  private convertToYaml(report: GeneratedReport): string {
    return `metadata:
  reportId: ${report.metadata.reportId}
  generatedAt: ${report.metadata.generatedAt.toISOString()}
  format: ${report.metadata.format}
  size: ${report.metadata.size}
content: |
  ${report.content.split('\n').map(line => '  ' + line).join('\n')}`;
  }

  private async writeToFile(outputPath: string, content: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(outputPath, content, 'utf8');
  }

  private generateOverallAssessment(extractedData: any, overallScore: number): string {
    if (overallScore >= 80) {
      return 'Excellent - The codebase demonstrates strong architectural patterns and maintainability.';
    } else if (overallScore >= 60) {
      return 'Good - The codebase is generally well-structured with some areas for improvement.';
    } else if (overallScore >= 40) {
      return 'Fair - The codebase has moderate issues that should be addressed to improve maintainability.';
    } else {
      return 'Poor - The codebase has significant issues that require immediate attention.';
    }
  }

  private extractKeyFindings(extractedData: any): string[] {
    const findings: string[] = [];
    
    if (extractedData.fileResults?.unusedFiles?.length > 0) {
      findings.push(`Found ${extractedData.fileResults.unusedFiles.length} unused files that can be removed`);
    }
    
    if (extractedData.dependencyResults?.circularDependencies?.length > 0) {
      findings.push(`Detected ${extractedData.dependencyResults.circularDependencies.length} circular dependencies`);
    }
    
    if (extractedData.architectureResults?.violations?.length > 0) {
      findings.push(`Identified ${extractedData.architectureResults.violations.length} architecture violations`);
    }
    
    return findings;
  }

  private generateTopRecommendations(extractedData: any): string[] {
    const recommendations: string[] = [];
    
    if (extractedData.fileResults?.unusedFiles?.length > 0) {
      recommendations.push('Remove unused files to reduce codebase size and complexity');
    }
    
    if (extractedData.dependencyResults?.circularDependencies?.length > 0) {
      recommendations.push('Refactor circular dependencies to improve modularity');
    }
    
    if (extractedData.architectureResults?.violations?.length > 0) {
      recommendations.push('Address architecture violations to maintain design consistency');
    }
    
    return recommendations;
  }
   * Create report template
   */

  public async createTemplate(
    templateName: string,
    templateConfig: ReportTemplate,
  ): Promise<void> {
    this.templates.set(templateName, templateConfig);
  }

  // Private helper methods

  private initializeDefaultTemplates(): void {
    // Default executive template
    this.templates.set('default', {
      name: 'Default Template',
      sections: [
        'executive_summary',
        'file_analysis',
        'dependency_analysis',
        'architecture_validation',
      ],
      styling: {
        primaryColor: '#2563eb',
        fontFamily: 'system-ui, sans-serif',
        headerStyle: 'modern',
      },
      layout: 'single-column',
    });

    // Technical template
    this.templates.set('technical', {
      name: 'Technical Template',
      sections: [
        'file_analysis',
        'dependency_analysis',
        'architecture_validation',
        'performance_metrics',
      ],
      styling: {
        primaryColor: '#059669',
        fontFamily: 'Monaco, Consolas, monospace',
        headerStyle: 'minimal',
      },
      layout: 'multi-column',
    });
  }

  private generateReportId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  // Data extraction methods
  private extractTotalFiles(fileResults: any): number {
    return fileResults?.totalFiles || 0;
  }

  private extractUnusedFiles(fileResults: any): number {
    return fileResults?.unusedFiles?.length || 0;
  }

  private extractArchitectureViolations(architectureResults: any): any[] {
    return architectureResults?.violations || [];
  }

  private extractCircularDependencies(dependencyResults: any): any[] {
    return dependencyResults?.circularDependencies || [];
  }

  private extractSpaceReclaimed(cleanupResults: any): number {
    return cleanupResults?.spaceReclaimed || 0;
  }

  // Score calculation methods
  private calculateHealthScore(auditData: AuditData): number {
    const totalFiles = this.extractTotalFiles(auditData.fileResults);
    const unusedFiles = this.extractUnusedFiles(auditData.fileResults);
    const violations = this.extractArchitectureViolations(auditData.architectureResults);

    if (totalFiles === 0) {
      return 100;
    }

    const unusedRatio = unusedFiles / totalFiles;
    const violationRatio = violations.length / totalFiles;

    // Simple scoring algorithm (can be made more sophisticated)
    const score = 100 - unusedRatio * 30 - violationRatio * 40;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateComplianceScore(architectureResults: any): number {
    const violations = this.extractArchitectureViolations(architectureResults);
    const totalRules = architectureResults?.totalRules || 100;

    if (totalRules === 0) {
      return 100;
    }

    const errorCount = violations.filter((v: any) => v.severity === 'error').length;
    const warningCount = violations.filter((v: any) => v.severity === 'warning').length;

    // Weight errors more heavily
    const penaltyScore = errorCount * 5 + warningCount * 2;
    const score = Math.max(0, 100 - (penaltyScore / totalRules) * 100);

    return Math.round(score);
  }

  private calculateEfficiencyScore(auditData: AuditData): number {
    const totalFiles = this.extractTotalFiles(auditData.fileResults);
    const unusedFiles = this.extractUnusedFiles(auditData.fileResults);
    const circularDeps = this.extractCircularDependencies(auditData.dependencyResults);

    if (totalFiles === 0) {
      return 100;
    }

    const efficiency = ((totalFiles - unusedFiles - circularDeps.length) / totalFiles) * 100;
    return Math.max(0, Math.min(100, Math.round(efficiency)));
  }

  // Content generation methods
  private generateKeyFindings(auditData: AuditData): any[] {
    const findings = [];

    const unusedFiles = this.extractUnusedFiles(auditData.fileResults);
    if (unusedFiles > 0) {
      findings.push({
        severity: 'warning',
        description: `Found ${unusedFiles} unused files that can be safely removed`,
        impact: 'medium',
      });
    }

    const violations = this.extractArchitectureViolations(auditData.architectureResults);
    const criticalViolations = violations.filter((v: any) => v.severity === 'error');
    if (criticalViolations.length > 0) {
      findings.push({
        severity: 'error',
        description: `Found ${criticalViolations.length} critical architecture violations`,
        impact: 'high',
      });
    }

    const circularDeps = this.extractCircularDependencies(auditData.dependencyResults);
    if (circularDeps.length > 0) {
      findings.push({
        severity: 'warning',
        description: `Detected ${circularDeps.length} circular dependencies`,
        impact: 'medium',
      });
    }

    return findings;
  }

  private generateRecommendations(auditData: AuditData): any[] {
    const recommendations = [];

    const unusedFiles = this.extractUnusedFiles(auditData.fileResults);
    if (unusedFiles > 10) {
      recommendations.push({
        description: 'Consider running cleanup operation to remove unused files',
        priority: 'medium',
        effort: 'low',
        impact: 'medium',
      });
    }

    const violations = this.extractArchitectureViolations(auditData.architectureResults);
    const criticalViolations = violations.filter((v: any) => v.severity === 'error');
    if (criticalViolations.length > 0) {
      recommendations.push({
        description: 'Address critical architecture violations immediately',
        priority: 'high',
        effort: 'high',
        impact: 'high',
      });
    }

    const circularDeps = this.extractCircularDependencies(auditData.dependencyResults);
    if (circularDeps.length > 0) {
      recommendations.push({
        description: 'Refactor code to eliminate circular dependencies',
        priority: 'medium',
        effort: 'medium',
        impact: 'high',
      });
    }

    return recommendations;
  }

  // Section generation methods
  private generateFileAnalysisSection(fileResults: any): any {
    return {
      title: 'File System Analysis',
      summary: {
        totalFiles: fileResults?.totalFiles || 0,
        totalSize: fileResults?.totalSize || 0,
        unusedFiles: fileResults?.unusedFiles?.length || 0,
        largestFiles: fileResults?.largestFiles || [],
      },
      details: fileResults || {},
    };
  }

  private generateDependencyAnalysisSection(dependencyResults: any): any {
    return {
      title: 'Dependency Analysis',
      summary: {
        totalDependencies: dependencyResults?.totalDependencies || 0,
        circularDependencies: dependencyResults?.circularDependencies?.length || 0,
        unusedDependencies: dependencyResults?.unusedDependencies?.length || 0,
        importanceScores: dependencyResults?.importanceScores || {},
      },
      details: dependencyResults || {},
    };
  }

  private generateArchitectureValidationSection(architectureResults: any): any {
    const violations = this.extractArchitectureViolations(architectureResults);
    return {
      title: 'Architecture Validation',
      summary: {
        totalViolations: violations.length,
        errorCount: violations.filter((v: any) => v.severity === 'error').length,
        warningCount: violations.filter((v: any) => v.severity === 'warning').length,
        complianceScore: this.calculateComplianceScore(architectureResults),
      },
      details: architectureResults || {},
    };
  }

  private generateCleanupResultsSection(cleanupResults: any): any {
    return {
      title: 'Cleanup Results',
      summary: {
        filesProcessed: cleanupResults?.filesProcessed || 0,
        filesRemoved: cleanupResults?.filesRemoved || 0,
        spaceReclaimed: cleanupResults?.spaceReclaimed || 0,
        errorsEncountered: cleanupResults?.errors?.length || 0,
      },
      details: cleanupResults || {},
    };
  }

  private generatePerformanceMetricsSection(performanceMetrics: PerformanceMetrics): any {
    return {
      title: 'Performance Metrics',
      summary: {
        totalExecutionTime: performanceMetrics.totalExecutionTime,
        memoryUsage: performanceMetrics.memoryUsage,
        peakMemoryUsage: performanceMetrics.peakMemoryUsage,
        filesProcessedPerSecond: performanceMetrics.filesProcessedPerSecond,
      },
      details: performanceMetrics,
    };
  }

  // Visualization generation
  private generateVisualizations(auditData: AuditData): VisualizationData[] {
    const visualizations: VisualizationData[] = [];

    // File distribution chart
    visualizations.push({
      id: 'file-distribution',
      type: 'pie',
      title: 'File Distribution by Type',
      data: this.generateFileDistributionData(auditData.fileResults),
    });

    // Architecture compliance chart
    visualizations.push({
      id: 'architecture-compliance',
      type: 'bar',
      title: 'Architecture Compliance by Category',
      data: this.generateComplianceData(auditData.architectureResults),
    });

    // Performance trends
    visualizations.push({
      id: 'performance-metrics',
      type: 'line',
      title: 'Performance Metrics Over Time',
      data: this.generatePerformanceData(auditData.performanceMetrics),
    });

    return visualizations;
  }
  private generateFileDistributionData(fileResults: any): any {
    const distribution = fileResults?.fileTypeDistribution || {};
    return Object.entries(distribution).map(([type, count]) => ({
      label: type,
      value: count,
    }));
  }

  private generateComplianceData(architectureResults: any): any {
    const violations = this.extractArchitectureViolations(architectureResults);
    const categories = violations.reduce((acc: any, violation: any) => {
      const category = violation.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categories).map(([category, count]) => ({
      label: category,
      value: count,
    }));
  }

  private generatePerformanceData(performanceMetrics: PerformanceMetrics): any {
    return [
      { label: 'Execution Time', value: performanceMetrics.totalExecutionTime },
      { label: 'Memory Usage', value: performanceMetrics.memoryUsage },
      { label: 'Peak Memory', value: performanceMetrics.peakMemoryUsage },
    ];
  }

  // Summary calculation
  private calculateMetricsSummary(auditData: AuditData): MetricsSummary {
    return {
      totalFiles: this.extractTotalFiles(auditData.fileResults),
      unusedFiles: this.extractUnusedFiles(auditData.fileResults),
      totalViolations: this.extractArchitectureViolations(auditData.architectureResults).length,
      circularDependencies: this.extractCircularDependencies(auditData.dependencyResults).length,
      spaceReclaimable: this.extractSpaceReclaimed(auditData.cleanupResults),
      healthScore: this.calculateHealthScore(auditData),
      complianceScore: this.calculateComplianceScore(auditData.architectureResults),
      efficiencyScore: this.calculateEfficiencyScore(auditData),
    };
  }

  // Detailed report generation methods
  private generateDetailedFileAnalysis(fileResults: any, options: TechnicalReportOptions): any {
    return {
      fileSystemSummary: this.generateFileAnalysisSection(fileResults),
      largeFilesAnalysis: this.analyzeLargeFiles(fileResults),
      duplicateFilesAnalysis: this.analyzeDuplicateFiles(fileResults),
      unusedFilesBreakdown: this.analyzeUnusedFiles(fileResults),
      fileTypeDistribution: fileResults?.fileTypeDistribution || {},
    };
  }

  private generateDetailedDependencyAnalysis(
    dependencyResults: any,
    options: TechnicalReportOptions,
  ): any {
    return {
      dependencyGraph: dependencyResults?.graph || {},
      circularDependenciesDetails: dependencyResults?.circularDependencies || [],
      unusedDependencies: dependencyResults?.unusedDependencies || [],
      importanceAnalysis: dependencyResults?.importanceScores || {},
      dependencyMetrics: this.calculateDependencyMetrics(dependencyResults),
    };
  }

  private generateDetailedArchitectureAnalysis(
    architectureResults: any,
    options: TechnicalReportOptions,
  ): any {
    const violations = this.extractArchitectureViolations(architectureResults);
    return {
      complianceOverview: this.generateArchitectureValidationSection(architectureResults),
      violationsByCategory: this.groupViolationsByCategory(violations),
      violationsBySeverity: this.groupViolationsBySeverity(violations),
      frameworkCompliance: this.analyzeFrameworkCompliance(architectureResults),
      autoFixSuggestions: this.generateAutoFixSuggestions(violations),
    };
  }

  private generateDetailedCleanupAnalysis(
    cleanupResults: any,
    options: TechnicalReportOptions,
  ): any {
    return {
      cleanupSummary: this.generateCleanupResultsSection(cleanupResults),
      actionBreakdown: cleanupResults?.actions || [],
      riskAssessment: cleanupResults?.riskAssessment || {},
      backupStatus: cleanupResults?.backupStatus || {},
      rollbackCapability: cleanupResults?.rollbackCapability || {},
    };
  }

  private generateDetailedPerformanceAnalysis(
    performanceMetrics: PerformanceMetrics,
    options: TechnicalReportOptions,
  ): any {
    return {
      executionTimes: {
        fileScanning: performanceMetrics.fileScanTime,
        dependencyAnalysis: performanceMetrics.dependencyAnalysisTime,
        architectureValidation: performanceMetrics.architectureValidationTime,
        total: performanceMetrics.totalExecutionTime,
      },
      resourceUtilization: {
        memoryUsage: performanceMetrics.memoryUsage,
        peakMemoryUsage: performanceMetrics.peakMemoryUsage,
        cpuUsage: performanceMetrics.cpuUsage,
      },
      throughput: {
        filesProcessedPerSecond: performanceMetrics.filesProcessedPerSecond,
        dependenciesAnalyzedPerSecond: performanceMetrics.dependenciesAnalyzedPerSecond,
      },
      bottleneckAnalysis: this.analyzePerformanceBottlenecks(performanceMetrics),
    };
  }

  // Analysis helper methods
  private analyzeLargeFiles(fileResults: any): any {
    const largeFiles = fileResults?.largestFiles || [];
    return {
      count: largeFiles.length,
      totalSize: largeFiles.reduce((sum: number, file: any) => sum + file.size, 0),
      files: largeFiles.slice(0, 20), // Top 20
    };
  }

  private analyzeDuplicateFiles(fileResults: any): any {
    const duplicates = fileResults?.duplicateFiles || [];
    return {
      groupCount: duplicates.length,
      totalWastedSpace: duplicates.reduce(
        (sum: number, group: any) => sum + (group.files.length - 1) * group.size,
        0,
      ),
      groups: duplicates.slice(0, 10), // Top 10 groups
    };
  }

  private analyzeUnusedFiles(fileResults: any): any {
    const unusedFiles = fileResults?.unusedFiles || [];
    return {
      count: unusedFiles.length,
      totalSize: unusedFiles.reduce((sum: number, file: any) => sum + file.size, 0),
      byCategory: this.categorizeUnusedFiles(unusedFiles),
    };
  }

  private calculateDependencyMetrics(dependencyResults: any): any {
    return {
      totalNodes: dependencyResults?.graph?.nodes?.size || 0,
      totalEdges: dependencyResults?.graph?.edges?.length || 0,
      averageDependenciesPerFile: 0, // Calculate based on graph
      maxDependencyDepth: 0, // Calculate based on graph
      orphanedNodes: 0, // Calculate based on graph
    };
  }

  private groupViolationsByCategory(violations: any[]): any {
    return violations.reduce((acc: any, violation: any) => {
      const category = violation.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(violation);
      return acc;
    }, {});
  }

  private groupViolationsBySeverity(violations: any[]): any {
    return violations.reduce((acc: any, violation: any) => {
      const severity = violation.severity || 'info';
      if (!acc[severity]) {
        acc[severity] = [];
      }
      acc[severity].push(violation);
      return acc;
    }, {});
  }

  private analyzeFrameworkCompliance(architectureResults: any): any {
    return {
      turborepoCompliance: architectureResults?.turborepoCompliance || {},
      honoCompliance: architectureResults?.honoCompliance || {},
      tanStackRouterCompliance: architectureResults?.tanStackRouterCompliance || {},
    };
  }

  private generateAutoFixSuggestions(violations: any[]): any[] {
    return violations
      .filter(v => v.suggestedFix)
      .map(v => ({
        violationId: v.violationId,
        description: v.suggestedFix.description,
        automatable: v.suggestedFix.automatable || false,
        riskLevel: v.suggestedFix.riskLevel || 'low',
      }));
  }

  private analyzePerformanceBottlenecks(performanceMetrics: PerformanceMetrics): any {
    const bottlenecks = [];

    if (performanceMetrics.memoryUsage > 500 * 1024 * 1024) {
      // > 500MB
      bottlenecks.push({
        type: 'memory',
        severity: 'high',
        description: 'High memory usage detected',
        value: performanceMetrics.memoryUsage,
      });
    }

    if (performanceMetrics.filesProcessedPerSecond < 10) {
      bottlenecks.push({
        type: 'throughput',
        severity: 'medium',
        description: 'Low file processing throughput',
        value: performanceMetrics.filesProcessedPerSecond,
      });
    }

    return bottlenecks;
  }

  private categorizeUnusedFiles(unusedFiles: any[]): any {
    return unusedFiles.reduce((acc: any, file: any) => {
      const ext = file.path.split('.').pop() || 'unknown';
      if (!acc[ext]) {
        acc[ext] = { count: 0, size: 0 };
      }
      acc[ext].count++;
      acc[ext].size += file.size;
      return acc;
    }, {});
  }

  // Comparison methods
  private compareFileResults(before: any, after: any): any {
    return {
      totalFilesChange: (after?.totalFiles || 0) - (before?.totalFiles || 0),
      unusedFilesChange: (after?.unusedFiles?.length || 0) - (before?.unusedFiles?.length || 0),
      sizeChange: (after?.totalSize || 0) - (before?.totalSize || 0),
    };
  }

  private compareDependencyResults(before: any, after: any): any {
    return {
      dependenciesChange: (after?.totalDependencies || 0) - (before?.totalDependencies || 0),
      circularDependenciesChange: (after?.circularDependencies?.length || 0)
        - (before?.circularDependencies?.length || 0),
      unusedDependenciesChange: (after?.unusedDependencies?.length || 0)
        - (before?.unusedDependencies?.length || 0),
    };
  }

  private compareArchitectureResults(before: any, after: any): any {
    const beforeViolations = this.extractArchitectureViolations(before);
    const afterViolations = this.extractArchitectureViolations(after);

    return {
      totalViolationsChange: afterViolations.length - beforeViolations.length,
      errorCountChange: afterViolations.filter((v: any) => v.severity === 'error').length
        - beforeViolations.filter((v: any) => v.severity === 'error').length,
      warningCountChange: afterViolations.filter((v: any) => v.severity === 'warning').length
        - beforeViolations.filter((v: any) => v.severity === 'warning').length,
    };
  }

  private comparePerformanceMetrics(before: PerformanceMetrics, after: PerformanceMetrics): any {
    return {
      executionTimeChange: after.totalExecutionTime - before.totalExecutionTime,
      memoryUsageChange: after.memoryUsage - before.memoryUsage,
      throughputChange: after.filesProcessedPerSecond - before.filesProcessedPerSecond,
    };
  }
  private generateImpactAnalysis(improvements: any): any {
    const positiveImpacts = [];
    const negativeImpacts = [];

    if (improvements.healthScoreChange > 0) {
      positiveImpacts.push(`Health score improved by ${improvements.healthScoreChange} points`);
    } else if (improvements.healthScoreChange < 0) {
      negativeImpacts.push(
        `Health score decreased by ${Math.abs(improvements.healthScoreChange)} points`,
      );
    }

    if (improvements.unusedAssetsReduced > 0) {
      positiveImpacts.push(`Reduced unused assets by ${improvements.unusedAssetsReduced} files`);
    }

    if (improvements.criticalIssuesResolved > 0) {
      positiveImpacts.push(`Resolved ${improvements.criticalIssuesResolved} critical issues`);
    }

    if (improvements.spaceReclaimed > 0) {
      positiveImpacts.push(
        `Reclaimed ${this.formatBytes(improvements.spaceReclaimed)} of disk space`,
      );
    }

    return {
      overallImpact: positiveImpacts.length > negativeImpacts.length
        ? 'positive'
        : negativeImpacts.length > positiveImpacts.length
        ? 'negative'
        : 'neutral',
      positiveImpacts,
      negativeImpacts,
      impactScore: this.calculateImpactScore(improvements),
    };
  }

  private calculateImpactScore(improvements: any): number {
    let score = 0;

    // Weight different improvements
    score += improvements.healthScoreChange * 1;
    score += improvements.complianceScoreChange * 1.2;
    score += improvements.efficiencyScoreChange * 0.8;
    score += improvements.unusedAssetsReduced * 0.1;
    score += improvements.criticalIssuesResolved * 2;

    return Math.round(score);
  }

  private calculateTechnicalMetrics(auditData: AuditData): any {
    return {
      codeQualityMetrics: {
        maintainabilityIndex: this.calculateMaintainabilityIndex(auditData),
        technicalDebt: this.calculateTechnicalDebt(auditData),
        codeComplexity: this.calculateCodeComplexity(auditData),
      },
      architecturalMetrics: {
        modularity: this.calculateModularity(auditData),
        coupling: this.calculateCoupling(auditData),
        cohesion: this.calculateCohesion(auditData),
      },
      performanceMetrics: {
        buildPerformance: this.analyzeBuildPerformance(auditData),
        runtimePerformance: this.analyzeRuntimePerformance(auditData),
      },
    };
  }

  private generateDetailedRecommendations(
    auditData: AuditData,
    options: TechnicalReportOptions,
  ): any[] {
    const recommendations = [];

    // Technical debt recommendations
    const technicalDebt = this.calculateTechnicalDebt(auditData);
    if (technicalDebt > 0.5) {
      recommendations.push({
        category: 'Technical Debt',
        priority: 'high',
        title: 'Address Technical Debt',
        description:
          'High technical debt detected. Consider refactoring to improve maintainability.',
        actionItems: [
          'Review and refactor complex functions',
          'Eliminate code duplication',
          'Improve test coverage',
        ],
        effort: 'high',
        impact: 'high',
      });
    }

    // Performance recommendations
    const performanceMetrics = auditData.performanceMetrics;
    if (performanceMetrics.filesProcessedPerSecond < 50) {
      recommendations.push({
        category: 'Performance',
        priority: 'medium',
        title: 'Optimize Processing Performance',
        description: 'File processing performance is below optimal levels.',
        actionItems: [
          'Implement parallel processing',
          'Optimize I/O operations',
          'Add caching mechanisms',
        ],
        effort: 'medium',
        impact: 'medium',
      });
    }

    return recommendations;
  }

  private generateAppendices(auditData: AuditData): any {
    return {
      glossary: this.generateGlossary(),
      configurationReference: this.generateConfigurationReference(),
      troubleshootingGuide: this.generateTroubleshootingGuide(),
      changeHistory: this.generateChangeHistory(auditData),
    };
  }

  // Metric calculation helpers
  private calculateMaintainabilityIndex(auditData: AuditData): number {
    // Simplified maintainability calculation
    const violations = this.extractArchitectureViolations(auditData.architectureResults);
    const unusedFiles = this.extractUnusedFiles(auditData.fileResults);
    const totalFiles = this.extractTotalFiles(auditData.fileResults);

    if (totalFiles === 0) {
      return 100;
    }

    const violationRatio = violations.length / totalFiles;
    const unusedRatio = unusedFiles / totalFiles;

    return Math.max(0, Math.round(100 - violationRatio * 40 - unusedRatio * 20));
  }

  private calculateTechnicalDebt(auditData: AuditData): number {
    const violations = this.extractArchitectureViolations(auditData.architectureResults);
    const totalFiles = this.extractTotalFiles(auditData.fileResults);

    if (totalFiles === 0) {
      return 0;
    }

    const errorWeight = 3;
    const warningWeight = 1;

    const debtScore = violations.reduce((sum: number, v: any) => {
      return sum + (v.severity === 'error' ? errorWeight : warningWeight);
    }, 0);

    return Math.min(1, debtScore / (totalFiles * 2)); // Normalize to 0-1
  }

  private calculateCodeComplexity(auditData: AuditData): number {
    const circularDeps = this.extractCircularDependencies(auditData.dependencyResults);
    const totalFiles = this.extractTotalFiles(auditData.fileResults);

    if (totalFiles === 0) {
      return 0;
    }

    return Math.min(1, circularDeps.length / totalFiles); // Simplified complexity measure
  }

  private calculateModularity(auditData: AuditData): number {
    // Simplified modularity calculation based on dependency structure
    const dependencyResults = auditData.dependencyResults;
    const totalNodes = dependencyResults?.graph?.nodes?.size || 1;
    const totalEdges = dependencyResults?.graph?.edges?.length || 0;

    // Higher edge-to-node ratio indicates lower modularity
    const ratio = totalEdges / totalNodes;
    return Math.max(0, Math.min(1, 1 - ratio / 10));
  }

  private calculateCoupling(auditData: AuditData): number {
    const circularDeps = this.extractCircularDependencies(auditData.dependencyResults);
    const totalFiles = this.extractTotalFiles(auditData.fileResults);

    if (totalFiles === 0) {
      return 0;
    }

    return Math.min(1, circularDeps.length / totalFiles);
  }

  private calculateCohesion(auditData: AuditData): number {
    // Simplified cohesion measure - inverse of unused files ratio
    const unusedFiles = this.extractUnusedFiles(auditData.fileResults);
    const totalFiles = this.extractTotalFiles(auditData.fileResults);

    if (totalFiles === 0) {
      return 1;
    }

    return Math.max(0, 1 - unusedFiles / totalFiles);
  }

  private analyzeBuildPerformance(auditData: AuditData): any {
    return {
      estimatedBuildTime: auditData.performanceMetrics.totalExecutionTime * 2, // Rough estimate
      bottlenecks: ['Large bundle size', 'Circular dependencies'],
      optimizationOpportunities: ['Code splitting', 'Tree shaking'],
    };
  }

  private analyzeRuntimePerformance(auditData: AuditData): any {
    const unusedFiles = this.extractUnusedFiles(auditData.fileResults);
    return {
      unusedCodeImpact: unusedFiles > 0 ? 'medium' : 'low',
      loadTimeImpact: unusedFiles > 50 ? 'high' : 'low',
      recommendations: unusedFiles > 0 ? ['Remove unused code'] : ['Performance looks good'],
    };
  }

  // Appendix generation helpers
  private generateGlossary(): any {
    return {
      'Architecture Violation': 'Code that does not conform to defined architectural standards',
      'Circular Dependency': 'A situation where modules depend on each other in a circular manner',
      'Technical Debt':
        'The implied cost of additional rework caused by choosing an easy solution now',
      'Unused Asset': 'A file or module that is not referenced by any other code',
    };
  }

  private generateConfigurationReference(): any {
    return {
      scanOptions: 'Configuration options for file scanning',
      validationRules: 'Architecture validation rule configuration',
      cleanupSettings: 'Safe cleanup operation settings',
      reportFormats: 'Available report output formats',
    };
  }

  private generateTroubleshootingGuide(): any {
    return {
      commonIssues: [
        'Memory usage too high during scanning',
        'False positive architecture violations',
        'Cleanup operations not completing',
      ],
      solutions: [
        'Increase batch size or reduce parallelism',
        'Review and adjust validation rules',
        'Check file permissions and disk space',
      ],
    };
  }

  private generateChangeHistory(auditData: AuditData): any {
    return {
      lastModified: new Date(),
      version: '1.0.0',
      changes: ['Initial audit report generation'],
    };
  }

  // Export methods
  private async exportAsJson(report: GeneratedReport, outputPath: string): Promise<void> {
    const jsonContent = JSON.stringify(report, null, 2);
    await fs.writeFile(outputPath, jsonContent, 'utf-8');
  }

  private async exportAsHtml(report: GeneratedReport, outputPath: string): Promise<void> {
    const htmlContent = this.generateHtmlReport(report);
    await fs.writeFile(outputPath, htmlContent, 'utf-8');
  }

  private async exportAsMarkdown(report: GeneratedReport, outputPath: string): Promise<void> {
    const markdownContent = this.generateMarkdownReport(report);
    await fs.writeFile(outputPath, markdownContent, 'utf-8');
  }

  private async exportAsPdf(report: GeneratedReport, outputPath: string): Promise<void> {
    // PDF export would require a PDF generation library like puppeteer
    // For now, we'll create an HTML version that can be printed to PDF
    const htmlContent = this.generateHtmlReport(report);
    const pdfReadyPath = outputPath.replace('.pdf', '.html');
    await fs.writeFile(pdfReadyPath, htmlContent, 'utf-8');

    // In a real implementation, you would use something like:
    // const puppeteer = require('puppeteer')
    // const browser = await puppeteer.launch()
    // const page = await browser.newPage()
    // await page.setContent(htmlContent)
    // await page.pdf({ path: outputPath })
    // await browser.close()
  }

  private generateHtmlReport(report: GeneratedReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Report - ${report.reportId}</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        h1, h2, h3 { color: #374151; }
        .finding { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .finding.error { background: #fee2e2; color: #991b1b; }
        .finding.warning { background: #fef3c7; color: #92400e; }
        .finding.info { background: #dbeafe; color: #1e40af; }
    </style>
</head>
<body>
    <header class="header">
        <h1>Monorepo Audit Report</h1>
        <p>Report ID: ${report.reportId}</p>
        <p>Generated: ${report.metadata.generatedAt.toLocaleDateString()}</p>
    </header>
    
    <section class="section">
        <h2>Executive Summary</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${report.executiveSummary.overallHealthScore}%</div>
                <div>Health Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.executiveSummary.complianceScore}%</div>
                <div>Compliance Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.executiveSummary.totalAssetsScanned}</div>
                <div>Assets Scanned</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.executiveSummary.criticalIssuesFound}</div>
                <div>Critical Issues</div>
            </div>
        </div>
    </section>
    
    <section class="section">
        <h2>Key Findings</h2>
        ${
      report.executiveSummary.keyFindings
        .map(
          (finding: any) => `<div class="finding ${finding.severity}">${finding.description}</div>`,
        )
        .join('')
    }
    </section>
    
    <section class="section">
        <h2>Recommendations</h2>
        <ul>
        ${
      report.executiveSummary.recommendations
        .map(
          (rec: any) => `<li><strong>${rec.description}</strong> (Priority: ${rec.priority})</li>`,
        )
        .join('')
    }
        </ul>
    </section>
</body>
</html>
    `;
  }

  private generateMarkdownReport(report: GeneratedReport): string {
    let markdown = `# Audit Report\n\n`;
    markdown += `**Report ID**: ${report.reportId}\n`;
    markdown += `**Generated**: ${report.metadata.generatedAt.toLocaleDateString()}\n\n`;

    markdown += `## Executive Summary\n\n`;
    markdown += `- **Health Score**: ${report.executiveSummary.overallHealthScore}%\n`;
    markdown += `- **Compliance Score**: ${report.executiveSummary.complianceScore}%\n`;
    markdown += `- **Assets Scanned**: ${report.executiveSummary.totalAssetsScanned}\n`;
    markdown += `- **Critical Issues**: ${report.executiveSummary.criticalIssuesFound}\n\n`;

    markdown += `## Key Findings\n\n`;
    for (const finding of report.executiveSummary.keyFindings) {
      markdown += `- **${finding.severity.toUpperCase()}**: ${finding.description}\n`;
    }

    markdown += `\n## Recommendations\n\n`;
    for (const rec of report.executiveSummary.recommendations) {
      markdown += `- ${rec.description} _(Priority: ${rec.priority})_\n`;
    }

    return markdown;
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 Bytes';
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.templates.clear();
  }
}
