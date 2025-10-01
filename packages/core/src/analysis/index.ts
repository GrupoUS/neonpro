// Analysis domain services for monorepo architectural analysis
// Healthcare compliance focused for Brazilian aesthetic clinics
// Enhanced with comprehensive model entities and OXLint integration

// Export services
export * from './services/jscpd-service.js';
export * from './services/hono-trpc-analysis/index.js';

// Export all type definitions
export * from './types/codebase-analysis.js';
export * from './types/finding.js';
export * from './types/location.js';
export * from './types/impact-assessment.js';
export * from './types/solution.js';
export * from './types/package-analysis.js';
export * from './types/duplication-finding.js';
export * from './types/finding-enums.js';
export * from './types/analysis-enums.js';

// Export existing jscpd configuration for backward compatibility
export type {
  JscpdConfiguration,
  JscpdAnalysisResult,
  DuplicationCluster,
  RefactoringSuggestion,
  TokenBasedMetrics,
  StructuralMetrics,
  HealthcareMetrics,
  PerformanceMetrics,
} from './types/jscpd-config.js';

// Enhanced exports for comprehensive analysis
export type {
  CodebaseAnalysis,
  Finding,
  PackageAnalysis,
  DuplicationFinding,
  Location,
  ImpactAssessment,
  Solution,
} from './types';

// Re-exports for backward compatibility
export {
  JscpdService,
} from './services/jscpd-service.js';

// Healthcare-specific exports
export {
  HealthcareComplianceScore,
  QualityGateValidation,
  OXLintMetrics,
  MobilePerformanceTier,
  AccessibilityCompliance,
} from './types/codebase-analysis';

// Architectural compliance exports
export {
  SOLIDCompliance,
  CleanArchitectureCompliance,
  MicroservicesCompliance,
  DDDCompliance,
  PackageArchitecturalCompliance,
} from './types/package-analysis';

// Analysis status and configuration exports
export {
  AnalysisStatus,
  AnalysisType,
  AnalysisScope,
  AnalysisPhase,
  QualityThresholds,
  Priority,
  ReportFormat,
} from './types/analysis-enums';

// Professional council exports
export {
  ProfessionalCouncil,
  BrazilianHealthcareDomain,
  HealthcareRegulationType,
} from './types/finding-enums';

// Performance and accessibility exports
export {
  MobilePerformanceTier,
  AccessibilityCompliance,
  MobileNetworkCondition,
  DeviceType,
} from './types/analysis-enums';

// OXLint integration exports
export {
  OXLintIntegrationLevel,
  HealthcareComplianceLevel,
  JscpdIntegration,
  SonarQubeIntegration,
  SmartTSXLIntegration,
} from './types/analysis-enums';

// Healthcare compliance exports
export {
  LGPDComplianceAssessment,
  ANVISAComplianceAssessment,
  ProfessionalCouncilComplianceAssessment,
  HealthcareComplianceViolation,
  HealthcareComplianceAction,
} from './types/package-analysis';

// Healthcare data exports
export {
  PatientDataDuplicationAnalysis,
  ClinicalLogicDuplicationAnalysis,
  ValidationLogicDuplicationAnalysis,
  BusinessLogicDuplicationAnalysis,
  BrazilianHealthcareContext,
} from './types/duplication-finding';

// Security and testing exports
export {
  PackageSecurityAssessment,
  SecurityVulnerability,
  PackageTestCoverage,
  TestCoverageRecommendation,
} from './types/package-analysis';

// Architectural exports
export {
  BoundaryViolation,
  CleanArchitectureCompliance,
  MicroservicesCompliance,
  DDDCompliance,
  SOLIDCompliance,
  PatternMisuse,
} from './types/package-analysis';

// Refactoring and automation exports
export {
  RefactoringAnalysis,
  DuplicationFixSuggestion,
  OXLintDuplicationData,
  AutomationData,
} from './types/duplication-finding';

// Impact and solution exports
export {
  EffortEstimate,
  BenefitEstimate,
  HealthcareImpact,
  ROIMetrics,
  TimelineImpact,
  FinancialImpact,
} from './types/impact-assessment';

// Package health metrics exports
export {
  PackageHealthMetrics,
  DependencyAnalysis,
  PackageCodeMetrics,
  PackagePerformanceMetrics,
} from './types/package-analysis';

// Performance and security metrics exports
export {
  PerformanceBottleneck,
  PerformanceFinding,
  SecurityFindingData,
} from './types/impact-assessment';

// Clinical workflow exports
export {
  ClinicalScenario,
  ClinicalValidation,
  ClinicalSafety,
} from './types/solution';

// Brazilian healthcare context exports
export {
  BrazilianContextImpact,
  HealthcareRiskAssessment,
  ComplianceAction,
  ClinicalStep,
} from './types/solution';

// Testing strategy exports
export {
  TestEnvironment,
  DataSource,
  TestDataStrategy,
  HealthcareTestingStrategy,
  TestingLevel,
} from './types/solution';

// Implementation strategy exports

// Risk management exports
export {
  Risk,
  RiskMitigationPlan,
  ContingencyPlan,
  Monitoring,
} from './types/solution';

// Notification and reporting exports
export {
  NotificationType,
  NotificationChannel,
  ReportFormat,
  ChartType,
  VisualizationType,
} from './types/analysis-enums';