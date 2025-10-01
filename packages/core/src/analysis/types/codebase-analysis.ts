// CodebaseAnalysis entity with comprehensive finding support
// Healthcare compliance focused for Brazilian aesthetic clinics
// Enhanced with OXLint performance metrics and quality gates

import { Finding } from './finding';
import { PackageAnalysis } from './package-analysis';
import { AnalysisStatus, AnalysisScope } from './analysis-enums';

export interface CodebaseAnalysis {
  id: string;
  analysisDate: Date;
  version: string;
  scope: AnalysisScope;
  findings: Finding[];
  metrics: AnalysisMetrics;
  recommendations: Recommendation[];
  status: AnalysisStatus;
  progress?: AnalysisProgress;
  
  // OXLint performance enhancement
  oxlintMetrics?: OXLintMetrics;
  
  // Healthcare compliance
  healthcareCompliance?: HealthcareComplianceScore;
  
  // Quality gates validation
  qualityGates?: QualityGateValidation;
}

export interface AnalysisMetrics {
  totalLines: number;
  duplicateLines: number;
  duplicationPercentage: number;
  packageCount: number;
  dependencyCount: number;
  circularDependencyCount: number;
  typeSafetyScore: number;
  averageBuildTime: number;
  bundleSize: number;
  testCoverage: number;
  technicalDebtHours: number;
  
  // Performance metrics
  analysisExecutionTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  
  // Healthcare-specific metrics
  lgpdComplianceScore: number;
  anvisaComplianceScore: number;
  patientDataSafetyScore: number;
}

export interface AnalysisProgress {
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  percentageComplete: number;
  estimatedTimeRemaining: number;
  currentFile?: string;
}

export interface Recommendation {
  id: string;
  priority: Priority;
  category: RecommendationCategory;
  title: string;
  description: string;
  implementationSteps: string[];
  estimatedEffort: EffortEstimate;
  expectedBenefit: BenefitEstimate;
  dependencies: string[];
  
  // Healthcare compliance impact
  healthcareImpact?: HealthcareComplianceImpact;
  
  // ROI calculation
  roiMetrics?: ROIMetrics;
}

export enum Priority {
  IMMEDIATE = 'IMMEDIATE',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum RecommendationCategory {
  STRUCTURAL = 'STRUCTURAL',
  PERFORMANCE = 'PERFORMANCE',
  MAINTAINABILITY = 'MAINTAINABILITY',
  SECURITY = 'SECURITY',
  TYPE_SAFETY = 'TYPE_SAFETY',
  HEALTHCARE_COMPLIANCE = 'HEALTHCARE_COMPLIANCE'
}

export interface EffortEstimate {
  hours: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  requiredSkills: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface BenefitEstimate {
  maintainabilityImprovement: number; // 0-100
  performanceImprovement: number; // 0-100
  securityImprovement: number; // 0-100
  complianceImprovement: number; // 0-100
  estimatedCostSavings: number; // hours per month
}

export interface OXLintMetrics {
  lintingTime: number; // OXLint 50-100x faster than ESLint
  warningsFound: number;
  errorsFound: number;
  rulesViolated: string[];
  performanceGain: number; // Percentage improvement over ESLint
}

export interface HealthcareComplianceScore {
  lgpdScore: number; // 0-100
  anvisaScore: number; // 0-100
  cfmScore: number; // 0-100
  corenScore: number; // 0-100
  overallCompliance: number; // 0-100
  
  // Compliance violations
  violations: ComplianceViolation[];
  
  // Required actions
  requiredActions: ComplianceAction[];
}

export interface ComplianceViolation {
  type: 'lgpd' | 'anvisa' | 'cfm' | 'coren' | 'cff' | 'cnep';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedFiles: string[];
  recommendation: string;
  deadline?: Date;
}

export interface ComplianceAction {
  id: string;
  type: 'immediate' | 'short-term' | 'long-term';
  description: string;
  responsible: string;
  estimatedHours: number;
  deadline?: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface QualityGateValidation {
  passed: boolean;
  score: number; // 0-100
  failedGates: string[];
  warnings: string[];
  
  // Specific quality validations
  testCoverageValidation: TestCoverageValidation;
  typeSafetyValidation: TypeSafetyValidation;
  performanceValidation: PerformanceValidation;
  securityValidation: SecurityValidation;
}

export interface TestCoverageValidation {
  required: number; // Minimum 90%
  actual: number;
  passed: boolean;
  uncoveredFiles: string[];
}

export interface TypeSafetyValidation {
  strictModeEnabled: boolean;
  anyTypesFound: number;
  typeErrorsFound: number;
  passed: boolean;
  violations: TypeSafetyViolation[];
}

export interface TypeSafetyViolation {
  file: string;
  line: number;
  type: 'any' | 'missing-annotation' | 'implicit-any' | 'unsafe-cast';
  description: string;
}

export interface PerformanceValidation {
  buildTimeTarget: number; // 2000ms
  actualBuildTime: number;
  bundleSizeTarget: number; // 500KB
  actualBundleSize: number;
  passed: boolean;
  bottlenecks: PerformanceBottleneck[];
}

export interface PerformanceBottleneck {
  type: 'bundle-size' | 'build-time' | 'memory' | 'dependencies';
  file: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface SecurityValidation {
  vulnerabilitiesFound: number;
  criticalVulnerabilities: number;
  passed: boolean;
  issues: SecurityIssue[];
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  file: string;
  description: string;
  recommendation: string;
}

export interface HealthcareComplianceImpact {
  patientDataSafety: 'improved' | 'unchanged' | 'degraded';
  lgpdCompliance: 'improved' | 'unchanged' | 'degraded';
  anvisaCompliance: 'improved' | 'unchanged' | 'degraded';
  clinicalSafety: 'improved' | 'unchanged' | 'degraded';
}

export interface ROIMetrics {
  implementationCost: number; // hours
  monthlySavings: number; // hours
  paybackPeriod: number; // months
  annualROI: number; // percentage
  riskReduction: number; // percentage
}

// Type guards
export function isCodebaseAnalysis(obj: any): obj is CodebaseAnalysis {
  return obj &&
    typeof obj.id === 'string' &&
    obj.analysisDate instanceof Date &&
    typeof obj.version === 'string' &&
    typeof obj.scope === 'object' &&
    Array.isArray(obj.findings) &&
    typeof obj.metrics === 'object' &&
    Array.isArray(obj.recommendations) &&
    typeof obj.status === 'string';
}

export function isAnalysisMetrics(obj: any): obj is AnalysisMetrics {
  return obj &&
    typeof obj.totalLines === 'number' &&
    typeof obj.duplicateLines === 'number' &&
    typeof obj.duplicationPercentage === 'number' &&
    typeof obj.packageCount === 'number' &&
    typeof obj.dependencyCount === 'number' &&
    typeof obj.circularDependencyCount === 'number' &&
    typeof obj.typeSafetyScore === 'number' &&
    typeof obj.averageBuildTime === 'number' &&
    typeof obj.bundleSize === 'number' &&
    typeof obj.testCoverage === 'number' &&
    typeof obj.technicalDebtHours === 'number';
}

export function isRecommendation(obj: any): obj is Recommendation {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.priority === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    Array.isArray(obj.implementationSteps) &&
    typeof obj.estimatedEffort === 'object' &&
    typeof obj.expectedBenefit === 'object' &&
    Array.isArray(obj.dependencies);
}

// Validation functions
export function validateCodebaseAnalysis(analysis: Partial<CodebaseAnalysis>): string[] {
  const errors: string[] = [];
  
  if (!analysis.id) errors.push('ID is required');
  if (!analysis.analysisDate) errors.push('Analysis date is required');
  if (!analysis.version) errors.push('Version is required');
  if (!analysis.scope) errors.push('Scope is required');
  if (!Array.isArray(analysis.findings)) errors.push('Findings must be an array');
  if (!analysis.metrics) errors.push('Metrics are required');
  if (!Array.isArray(analysis.recommendations)) errors.push('Recommendations must be an array');
  if (!analysis.status) errors.push('Status is required');
  
  return errors;
}

export function calculateOverallHealthScore(analysis: CodebaseAnalysis): number {
  const metrics = analysis.metrics;
  
  // Weight different aspects of code health
  const weights = {
    duplication: 0.2, // 20% - Code duplication affects maintainability
    typeSafety: 0.2, // 20% - TypeScript strict compliance
    testCoverage: 0.15, // 15% - Test coverage
    performance: 0.15, // 15% - Build and runtime performance
    circularDependencies: 0.1, // 10% - Architecture violations
    technicalDebt: 0.1, // 10% - Technical debt
    healthcareCompliance: 0.1, // 10% - Healthcare compliance
  };
  
  const scores = {
    duplication: Math.max(0, 100 - metrics.duplicationPercentage * 10), // Invert duplication
    typeSafety: metrics.typeSafetyScore,
    testCoverage: metrics.testCoverage,
    performance: Math.max(0, 100 - (metrics.averageBuildTime / 20)), // Invert build time
    circularDependencies: Math.max(0, 100 - metrics.circularDependencyCount * 20),
    technicalDebt: Math.max(0, 100 - (metrics.technicalDebtHours / 10)), // Invert technical debt
    healthcareCompliance: metrics.lgpdComplianceScore,
  };
  
  const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key as keyof typeof scores] * weight);
  }, 0);
  
  return Math.round(weightedScore * 100) / 100;
}

export function generateExecutiveSummary(analysis: CodebaseAnalysis): string {
  const healthScore = calculateOverallHealthScore(analysis);
  const criticalIssues = analysis.findings.filter(f => f.severity === 'CRITICAL').length;
  const highPriorityIssues = analysis.findings.filter(f => f.severity === 'HIGH').length;
  const technicalDebt = analysis.metrics.technicalDebtHours;
  
  return `
# Codebase Analysis Executive Summary

## Overall Health Score: ${healthScore}/100

### Critical Issues
- **Critical Issues Found**: ${criticalIssues}
- **High Priority Issues**: ${highPriorityIssues}
- **Estimated Technical Debt**: ${technicalDebt} hours

### Key Metrics
- **Code Duplication**: ${metrics.duplicationPercentage}% (Target: <5%)
- **Type Safety Score**: ${metrics.typeSafetyScore}% (Target: 100%)
- **Test Coverage**: ${metrics.testCoverage}% (Target: ≥90%)
- **Build Performance**: ${metrics.averageBuildTime}ms (Target: <2000ms)
- **Circular Dependencies**: ${metrics.circularDependencyCount} (Target: 0)

### Healthcare Compliance
- **LGPD Compliance**: ${metrics.lgpdComplianceScore}% (Target: 100%)
- **ANVISA Compliance**: ${metrics.anvisaComplianceScore}% (Target: 100%)
- **Patient Data Safety**: ${metrics.patientDataSafetyScore}% (Target: 100%)

### Top Recommendations
${analysis.recommendations
  .filter(r => r.priority === Priority.IMMEDIATE || r.priority === Priority.HIGH)
  .slice(0, 5)
  .map(r => `- **${r.title}**: ${r.description}`)
  .join('\n')}

### Next Steps
1. Address all critical and high priority issues immediately
2. Implement healthcare compliance improvements
3. Focus on reducing code duplication and improving type safety
4. Enhance test coverage to meet 90%+ requirement
5. Optimize build performance for <2s target

**Analysis Date**: ${analysis.analysisDate.toLocaleDateString('pt-BR')}
**Analysis Version**: ${analysis.version}
  `.trim();
}