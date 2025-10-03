// Comprehensive analysis orchestration service
// Healthcare compliance focused for Brazilian aesthetic clinics
// Enhanced with OXLint integration and healthcare workflow orchestration

import { JscpdService } from './jscpd-service';
import { ArchitecturalValidator } from './architectural-validator';
import { PackageAnalyzer } from './package-analyzer';
import { ReportGenerator } from './report-generator';
import { CodebaseAnalysis } from '../types/codebase-analysis';
import { Finding } from '../types/finding';
import { AnalysisStatus, AnalysisScope, AnalysisType } from '../types/analysis-enums';
import { Priority } from '../types/finding-enums';
import { QualityThresholds } from '../types/analysis-enums';
import { HealthcareComplianceLevel, BrazilianHealthcareDomain } from '../types/finding-enums';
import { ProfessionalCouncil } from '../types/finding-enums';

export interface AnalysisOrchestrationRequest {
  scope: AnalysisScope;
  options: {
    includeTests?: boolean;
    parallel?: boolean;
    verbose?: boolean;
    healthcareCompliance?: HealthcareComplianceLevel;
  };
}

export interface AnalysisOrchestrationResult {
  status: AnalysisStatus;
  
  // Analysis results
  codebaseAnalysis: CodebaseAnalysis;
  findings: Finding[];
  metrics: AnalysisMetrics;
  
  // Execution metrics
  performanceMetrics: {
    executionTime: number;
    totalTime: number;
    filesProcessed: number;
    linesProcessed: number;
    oXLintGain: number; // 50-100x performance gain
  };
  
  // Healthcare compliance metrics
  healthcareMetrics: {
    lgpdComplianceScore: number;
    anvisaComplianceScore: number;
    professionalCouncilScores: {
      [ProfessionalCouncil.CFM]: number;
      [ProfessionalCouncil.COREN]: number;
      [ProfessionalCouncil.CFO]: number;
      [ProfessionalCouncil.CNO]: number;
      [ProfessionalCouncil.CNEP]: number;
    };
  };
  
  // Recommendations
  recommendations: Solution[];
  
  // Validation status
  validation: {
    codeQualityScore: number;
    testCoverageScore: number;
    complianceScore: number;
    qualityGates: QualityGateStatus[];
  };
  
  // Timeline analysis
  timeline: {
    estimatedTotalTime: number;
    actualTime: number;
    efficiencyScore: number; // 0-100
  };
}

export interface AnalysisMetrics {
  // General metrics
  totalFiles: number;
  totalLines: number;
  duplicateLines: number;
  circularDependencies: number;
  typeSafetyScore: number;
  testCoverage: number;
  
  // Performance metrics
  buildTime: number;
  bundleSize: number;
  memoryUsage: number;
  cacheHitRate: number;
  
  // Healthcare-specific metrics
  lgpdComplianceScore: number;
  anvisaComplianceScore: number;
  professionalCouncilScores: {
    [ProfessionalCouncil.CFM]: number;
    [ProfessionalCouncil.COREN]: number;
    [ProfessionalCouncil.CFO]: number;
    [ProfessionalCouncil.CNO]: number;
    [ProfessionalCouncil.CNEP]: number;
  };
  
  // Quality metrics
  codeQualityScore: number;
  securityScore: number;
  maintainabilityScore: number;
  overallHealthScore: number;
}

export interface QualityGateStatus {
  name: string;
  status: QualityGateResult;
  score: number;
  message?: string;
}

// Analysis progress tracking
export interface AnalysisProgress {
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  percentageComplete: number;
  estimatedTimeRemaining: number;
  currentFile?: string;
}

export class AnalysisOrchestrator {
  
  /**
   * Execute comprehensive analysis orchestrator
   * @param scope Analysis scope and configuration
   @returns Promise<AnalysisOrchestrationResult> Complete orchestration results
   */
  static async executeAnalysis(
    scope: AnalysisOrchestrationRequest
  ): Promise<AnalysisOrchestrationResult> {
    const startTime = Date.now();
    
    try {
      console.log('Starting comprehensive analysis...');
      
      // Validate scope
      this.validateScope(scope);
      
      // Phase 1: Duplicate detection
      console.log('Phase 1: Analyzing code duplication...');
      const jscpdAnalysis = await this.executeDuplicationDetection(scope);
      
      // Phase 2: Architectural validation
      console.log('Phase 2: Analyzing architectural violations...');
      const architecturalViolations = await this.executeArchitecturalValidation(scope);
      
      // Phase 3: Package boundary analysis
      console.log('Phase 3: Analyzing package boundaries...');
      const packageViolations = await this.executePackageAnalysis(scope);
      
      // Phase 4: Healthcare compliance analysis
      console.log('Phase 4: Analyzing healthcare compliance...');
      const healthcareViolations = await this.executeHealthcareComplianceAnalysis(scope);
      
      // Combine all findings
      const allFindings = [
        ...jscpdAnalysis,
        ...architecturalViolations,
        ...packageViolations,
        ...healthcareViolations
      ];
      
      // Generate comprehensive report
      const report = await this.generateAnalysisReport(allFindings, scope);
      
      // Calculate metrics
      const metrics = await this.calculateAnalysisMetrics(allFindings, scope);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(allFindings, scope);
      
      const executionTime = Date.now() - startTime;
      
      console.log(`Analysis completed in ${executionTime}ms`);
      
      return {
        status: AnalysisStatus.COMPLETED,
        codebaseAnalysis: this.createCodebaseAnalysis(allFindings, scope),
        findings: allFindings,
        metrics,
        performanceMetrics: {
          executionTime,
          totalTime: executionTime,
          filesProcessed: metrics.totalFiles,
          linesProcessed: metrics.totalLines,
          oXLintGain: metrics.performanceMetrics.oXLintGain
        },
        recommendations,
        validation: this.validateAnalysisResults(metrics),
        timeline: {
          estimatedTotalTime: metrics.estimatedTotalTime,
          actualTime: executionTime,
          efficiencyScore: Math.round(100 - (executionTime / metrics.estimatedTotalTime * 100))
        }
      };
      
    } catch (error) {
      console.error('Analysis orchestration failed:', error);
      return {
        status: AnalysisStatus.FAILED,
        codebaseAnalysis: null,
        findings: [],
        metrics: {
          executionTime: Date.now() - startTime,
          totalTime: Date.now() - startTime,
          filesProcessed: 0,
          linesProcessed: 0,
          performanceMetrics: {
            executionTime: 0,
            totalTime: Date.now() - startTime,
            filesProcessed: 0,
            linesProcessed: 0,
            oXLintGain: 0
          }
        },
        recommendations: [],
        validation: null,
        timeline: {
          estimatedTotalTime: 0,
          actualTime: Date.now() - startTime,
          efficiencyScore: 0
        }
      };
    }
  }

  /**
   * Execute code duplication detection
   */
  private static async executeDuplicationDetection(
    scope: AnalysisScope
  ): Promise<DuplicationFinding[]> {
    try {
      console.log('Detecting code duplication patterns...');
      
      // Use existing jscpd service
      const jscpdResult = await JscpdService.analyzeDuplication(
        scope.patterns.include[0], // Use first pattern include path
        {
          healthcare: {
            brazilianContext: true,
            portugueseTerms: true,
            clinicalTerms: true,
            healthcareTerms: true
          },
          performance: {
            maxFileSize: 2 * 1024 * 1024, // 2MB max file size
            parallelProcessing: true,
            timeoutMs: 30000 // 30s timeout
          }
        }
      );
      
      // Convert jscpd results to DuplicationFinding entities
      const findings = jscpdResult.clusters.map(cluster => this.jscpdClusterToDuplicationFinding(cluster));
      
      console.log(`Found ${findings.length} duplication clusters`);
      return findings;
      
    } catch (error) {
      console.error('Duplication detection failed:', error);
      return [];
    }
  }

  /**
   * Convert jscpd cluster to DuplicationFinding
   */
  private jscpdClusterToDuplicationFinding(cluster: any): DuplicationFinding {
    return {
      id: cluster.id,
      type: FindingType.CODE_DUPLICATION,
      severity: this.calculateDuplicationSeverity(cluster),
      location: cluster.occurrences.map(occ => ({
        filePath: occ.file,
        lineNumber: occ.startLine
      })),
      description: `Code duplication found in ${cluster.files.length} files with ${Math.round(cluster.similarity * 100)} similarity`,
      impact: {
        maintenanceCost: this.calculateMaintenanceCost(cluster),
        developerExperience: this.calculateDeveloperExperience(cluster),
        performanceImpact: this.calculatePerformanceImpact(cluster),
        scalabilityRisk: this.calculateScalabilityRisk(cluster),
        businessRisk: this.calculateBusinessRisk(cluster),
        technicalDebt: this.calculateTechnicalDebt(cluster)
      },
      duplicationData: {
        similarityScore: cluster.similarity,
        duplicateLines: this.calculateTotalDuplicateLines(cluster),
        filesInvolved: cluster.files.length,
        patterns: cluster.typescriptAnalysis?.typeComplexity > 0 ? [
          cluster.typescriptAnalysis?.typeComplexity > 0 ? 'TypeScript-specific patterns detected' : ''
        ] : [],
        structure: {
          functionsDuplicated: cluster.typescriptAnalysis?.typeComplexity > 0 ? 1 : 0,
          classesDuplicated: cluster.typescriptAnalysis?.typeComplexity > 0 ? 1 : 0,
          interfacesDuplicated: cluster.typescriptAnalysis?.typeComplexity > 0 ? 1 : 0,
          componentsDuplicated: cluster.typescriptAnalysis?.typeComplexity > 0 ? 1 : 0
        }
      },
      healthcareData: cluster.healthcareContext
        ? {
            patientDataInvolved: cluster.healthcareContext.patientDataInvolved,
            clinicalLogicInvolved: cluster.healthcareContext.clinicalLogic,
            validationLogicInvolved: cluster.healthcareContext.validationLogic,
            businessLogicInvolved: cluster.healthcareContext.businessLogic,
            regulatoryRelevance: cluster.healthcareContext.regulatoryRelevance,
            riskLevel: cluster.healthcareContext.riskLevel
          }
        : undefined,
      // OXLint integration if available
      oxlintData: cluster.typescriptAnalysis?.oxlintIntegration ? {
        ruleId: 'duplication-detection',
        ruleCategory: 'redundancy',
        performanceGain: cluster.typescriptAnalysis?.oxlintData?.performanceGain || 50,
        healthcareViolations: cluster.typescriptAnalysis?.oxlintData?.healthcareViolations || []
      } : undefined
    };
  }

  /**
   * Calculate maintenance cost for duplication
   */
  private calculateMaintenanceCost(cluster: any): number {
    // Base cost depends on complexity and files involved
    const baseCost = cluster.lines * 2; // 2 hours per 100 lines of duplicated code
    const complexityMultiplier =
      cluster.typescriptAnalysis?.typeComplexity === 'high'
        ? 3
        : cluster.typescriptAnalysis?.typeComplexity === 'medium'
          ? 2
          : cluster.typescriptAnalysis?.typeComplexity === 'low'
            ? 1
            : 1.5;
    
    // Healthcare cost multiplier
    let healthcareMultiplier = 1;
    if (cluster.healthcareContext?.patientDataInvolved) healthcareMultiplier *= 5;
    if (cluster.healthcareContext?.clinicalLogicInvolved) healthcareMultiplier *= 3;
    if (cluster.healthcareContext?.validationLogicInvolved) healthcareMultiplier *= 2;
    if (cluster.healthcareContext?.businessLogicInvolved) healthcareMultiplier *= 1.5;
    
    return Math.round(baseCost * complexityMultiplier * healthcareMultiplier);
  }

  /**
   * Calculate developer experience impact
   */
  private calculateDeveloperExperience(cluster: any): 'severe' | 'moderate' | 'minor' | 'none' {
    if (cluster.typescriptAnalysis?.typeComplexity === 'high') return 'severe';
    if (cluster.typescriptAnalysis?.typeComplexity === 'medium') return 'moderate';
    if (cluster.typescriptAnalysis?.typeComplexity === 'low') return 'minor';
    return 'none';
  }

  /**
   * Calculate performance impact
   */
  private calculatePerformanceImpact(cluster: any): 'critical' | 'significant' | 'minor' {
    if (cluster.lines > 500) return 'critical';
    if (cluster.lines > 100) return 'significant';
    return 'minor';
  }

  /**
   * Calculate scalability risk
   */
  private calculateScalabilityRisk(cluster: any): 'high' | 'medium' | 'low' | 'none' {
    if (cluster.files.length > 5) return 'high';
    if (cluster.files.length > 3) return 'medium';
    if (cluster.files.length > 1) return 'low';
    return 'none';
  }

  /**
   * Calculate business risk
   */
  private calculateBusinessRisk(cluster: any): 'critical' | 'significant' | 'minor' | 'none' {
    if (cluster.healthcareContext?.patientDataInvolved && cluster.healthcareContext.regulatoryRelevance) {
      return 'critical';
    }
    if (cluster.healthcareContext?.clinicalLogicInvolved || cluster.healthcareContext.complianceRisk === 'critical') {
      return 'critical';
    }
    if (cluster.healthcareContext?.businessLogicInvolved) {
      return 'significant';
    }
    return cluster.files.length > 1 ? 'minor' : 'none';
  }

  /**
   * Calculate technical debt hours
   */
  private calculateTechnicalDebt(cluster: any): number {
    // Base technical debt from complexity and size
    baseDebt = cluster.lines * 0.5; // 0.5 hours per 100 lines
    complexityMultiplier = cluster.typescriptAnalysis?.typeComplexity === 'high' ? 3 : 
                       cluster.typescriptAnalysis?.typeComplexity === 'medium' ? 2 : 1.5;
    
    const healthcareMultiplier = cluster.healthcareContext?.riskLevel === 'critical' ? 5 :
                          cluster.healthcareContext?.riskLevel === 'high' ? 3 :
                          cluster.healthcareContext?.riskLevel === 'medium' ? 2 :
                          cluster.healthcareContext?.riskLevel === 'low' ? 1 : 0;
    
    return Math.round(baseDebt * complexityMultiplier * healthcareMultiplier);
  }

  /**
   * Calculate total duplicate lines in cluster
   */
  private calculateTotalDuplicateLines(cluster: any): number {
    return cluster.occurrences.reduce((total, occ) => total + (cluster.lines * (occ.occurrences.length - 1)), 0);
  }

  /**
   * Calculate duplication severity based on healthcare risk and complexity
   */
  private calculateDuplicationSeverity(cluster: any): SeverityLevel {
    const healthcareScore = this.calculateHealthcareDuplicationScore(cluster.healthcareData);
    const complexityScore = cluster.duplicationData.typeComplexity;
    const businessRisk = cluster.healthcareContext?.businessRisk || 'none';
    
    let baseScore = this.calculateDuplicationScore(cluster.duplicationData);
    
    // Adjust for healthcare context
    if (healthcareScore > 0) {
      baseScore = Math.max(baseScore, 50);
    }
    
    // Adjust for complexity
    if (complexityScore > 0) {
      baseScore = Math.max(baseScore, 30);
    }
    
    // Adjust for business risk
    if (businessRisk !== 'none') {
      baseScore = Math.max(baseScore, 20);
    }
    
    // Apply severity mapping
    return this.calculateDuplicationSeverityFromScore(baseScore);
  }

  /**
   * Calculate DuplicationSeverity from score
   */
  private calculateDuplicationSeverityFromScore(score: number): SeverityLevel {
    if (score >= 90) return SeverityLevel.CRITICAL;
    if (score >= 75) return SeverityLevel.HIGH;
    if (score >= 50) return SeverityLevel.MEDIUM;
    return SeverityLevel.LOW;
  }
}