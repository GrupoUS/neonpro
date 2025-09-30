// PackageAnalysis entity with health metrics and dependency mapping
// Healthcare compliance focused for Brazilian aesthetic clinics

export interface PackageAnalysis {
  id: string;
  packageName: string;
  version: string;
  analysisDate: Date;
  
  // Basic package information
  metadata: PackageMetadata;
  
  // Health metrics
  health: PackageHealthMetrics;
  
  // Dependencies
  dependencies: DependencyAnalysis;
  
  // Code metrics
  codeMetrics: PackageCodeMetrics;
  
  // Healthcare compliance
  healthcareCompliance: PackageHealthcareCompliance;
  
  // Performance metrics
  performance: PackagePerformanceMetrics;
  
  // Security assessment
  security: PackageSecurityAssessment;
  
  // Test coverage
  testCoverage: PackageTestCoverage;
  
  // Architectural compliance
  architecturalCompliance: PackageArchitecturalCompliance;
}

export interface PackageMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  
  // Package classification
  classification: PackageClassification;
  
  // Package purpose
  purpose: PackagePurpose;
  
  // Dependencies
  dependencies: {
    production: number;
    development: number;
    optional: number;
    peer: number;
  };
  
  // Size metrics
  size: {
    totalFiles: number;
    totalLines: number;
    bundleSize: number;
    gzipSize: number;
  };
  
  // Build information
  build: {
    buildTime: number;
    buildCommand: string;
    buildTool: string;
  };
}

export enum PackageClassification {
  DOMAIN = 'DOMAIN',
  UI = 'UI',
  UTILITIES = 'UTILITIES',
  CONFIG = 'CONFIG',
  TYPES = 'TYPES',
  SERVICES = 'SERVICES',
  DATABASE = 'DATABASE',
  API = 'API',
  TESTING = 'TESTING',
  DOCUMENTATION = 'DOCUMENTATION'
}

export enum PackagePurpose {
  HEALTHCARE_DOMAIN = 'HEALTHCARE_DOMAIN',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  USER_INTERFACE = 'USER_INTERFACE',
  DATA_ACCESS = 'DATA_ACCESS',
  SHARED_UTILITIES = 'SHARED_UTILITIES',
  DEVELOPMENT_TOOLS = 'DEVELOPMENT_TOOLS',
  TESTING_FRAMEWORKS = 'TESTING_FRAMEWORKS',
  DOCUMENTATION = 'DOCUMENTATION'
}

export interface PackageHealthMetrics {
  overallScore: number; // 0-100
  maintainabilityIndex: number; // 0-100
  complexityScore: number; // 0-100 (lower is better)
  duplicationPercentage: number; // 0-100 (lower is better)
  
  // Health indicators
  indicators: {
    hasCircularDependencies: boolean;
    hasDeadCode: boolean;
    hasUncoveredPaths: boolean;
    hasLargeFiles: boolean;
    hasComplexFiles: boolean;
  };
  
  // Trend analysis
  trends: {
    maintainabilityTrend: 'improving' | 'stable' | 'declining';
    complexityTrend: 'improving' | 'stable' | 'declining';
    duplicationTrend: 'improving' | 'stable' | 'declining';
  };
  
  // Recommendations
  recommendations: PackageRecommendation[];
}

export interface PackageRecommendation {
  id: string;
  type: 'refactor' | 'optimize' | 'decompose' | 'merge' | 'dependency';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Impact assessment
  impact: {
    maintainability: number; // 0-100
    performance: number; // 0-100
    testability: number; // 0-100
    security: number; // 0-100
  };
  
  // Implementation
  implementation: {
    estimatedEffort: number; // hours
    requiredSkills: string[];
    dependencies: string[];
  };
}

export interface DependencyAnalysis {
  // Dependency metrics
  metrics: {
    totalDependencies: number;
    circularDependencies: number;
    outdatedDependencies: number;
    vulnerableDependencies: number;
    duplicateDependencies: number;
  };
  
  // Dependency categories
  categories: {
    framework: string[];
    library: string[];
    utility: string[];
    healthcare: string[];
    compliance: string[];
  };
  
  // Health analysis
  health: {
    stableDependencies: number;
    wellMaintained: number;
    activelyDeveloped: number;
    securityVulnerabilities: number;
  };
  
  // Circular dependency analysis
  circularDependencies: CircularDependency[];
  
  // Outdated dependencies
  outdatedDependencies: OutdatedDependency[];
  
  // Vulnerable dependencies
  vulnerableDependencies: VulnerableDependency[];
  
  // Healthcare-specific dependencies
  healthcareDependencies: HealthcareDependency[];
}

export interface CircularDependency {
  cycle: string[];
  cycleLength: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Healthcare impact
  healthcareImpact: {
    patientDataInvolved: boolean;
    clinicalLogicAffected: boolean;
    complianceRisk: 'none' | 'low' | 'medium' | 'high';
  };
  
  // Resolution
  resolution: {
    complexity: 'simple' | 'moderate' | 'complex';
    suggestedRefactoring: string[];
  };
}

export interface OutdatedDependency {
  name: string;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: string;
  
  // Update impact
  updateImpact: {
    breakingChanges: boolean;
    securityFixes: boolean;
    performanceImprovements: boolean;
    newFeatures: string[];
  };
  
  // Healthcare context
  healthcareContext: {
    patientDataHandling: boolean;
    clinicalFunctionality: boolean;
    complianceFeatures: string[];
  };
  
  // Recommendation
  recommendation: {
    action: 'update' | 'upgrade' | 'replace' | 'monitor';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    timeline: string;
  };
}

export interface VulnerableDependency {
  name: string;
  version: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cveId?: string;
  cvssScore?: number;
  
  // Vulnerability details
  vulnerability: {
    type: string;
    description: string;
    affectedVersions: string[];
    patchedVersions: string[];
  };
  
  // Healthcare impact
  healthcareImpact: {
    patientDataExposed: boolean;
    clinicalSystemsAffected: boolean;
    complianceViolations: string[];
  };
  
  // Mitigation
  mitigation: {
    immediateAction: boolean;
    workarounds: string[];
    timeline: string;
  };
}

export interface HealthcareDependency {
  name: string;
  version: string;
  category: 'lgpd' | 'anvisa' | 'clinical' | 'billing' | 'scheduling' | 'communication';
  
  // Compliance information
  compliance: {
    regulatoryApprovals: string[];
    certifications: string[];
    lastAudit: Date;
    complianceStatus: 'compliant' | 'partial' | 'non-compliant';
  };
  
  // Healthcare validation
  validation: {
    clinicalValidation: boolean;
    patientSafetyValidation: boolean;
    dataPrivacyValidation: boolean;
  };
  
  // Usage context
  usage: {
    patientDataAccess: boolean;
    clinicalDecisionSupport: boolean;
    patientCommunication: boolean;
  };
  
  // Risk assessment
  risk: {
    patientSafetyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    dataPrivacyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    complianceRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface PackageCodeMetrics {
  // Size metrics
  size: {
    totalLines: number;
    linesOfCode: number;
    commentLines: number;
    blankLines: number;
    files: number;
  };
  
  // Complexity metrics
  complexity: {
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    halsteadVolume: number;
    maintainabilityIndex: number;
  };
  
  // Quality metrics
  quality: {
    codeQuality: number; // 0-100
    documentationQuality: number; // 0-100
    testQuality: number; // 0-100
    overallQuality: number; // 0-100
  };
  
  // TypeScript-specific metrics
  typescript: {
    strictMode: boolean;
    anyUsage: number;
    typeCoverage: number; // 0-100
    interfaceUsage: number;
    genericUsage: number;
  };
  
  // Healthcare-specific metrics
  healthcare: {
    patientDataHandling: number;
    clinicalLogicComplexity: number;
    validationComplexity: number;
    complianceCodePercentage: number;
  };
}

export interface PackageHealthcareCompliance {
  // Overall compliance score
  overallScore: number; // 0-100
  
  // Regulatory compliance
  lgpdCompliance: LGPDComplianceAssessment;
  anvisaCompliance: ANVISAComplianceAssessment;
  professionalCouncilCompliance: ProfessionalCouncilComplianceAssessment;
  
  // Data protection
  dataProtection: {
    encryptionStatus: 'compliant' | 'partial' | 'non-compliant';
    accessControlStatus: 'compliant' | 'partial' | 'non-compliant';
    auditTrailStatus: 'compliant' | 'partial' | 'non-compliant';
    consentManagementStatus: 'compliant' | 'partial' | 'non-compliant';
  };
  
  // Clinical compliance
  clinicalCompliance: {
    safetyProtocols: boolean;
    clinicalGuidelines: boolean;
    medicalStandards: boolean;
    documentationRequirements: boolean;
  };
  
  // Language and localization
  localization: {
    portugueseSupport: boolean;
    medicalTerminology: boolean;
    culturalAdaptation: boolean;
    accessibilityStandards: boolean;
  };
  
  // Violations
  violations: HealthcareComplianceViolation[];
  
  // Required actions
  requiredActions: HealthcareComplianceAction[];
}

export interface LGPDComplianceAssessment {
  score: number; // 0-100
  
  // LGPD articles compliance
  articles: {
    [articleNumber: number]: {
      status: 'compliant' | 'partial' | 'non-compliant';
      description: string;
      evidence: string[];
    };
  };
  
  // Data processing basis
  dataProcessingBasis: {
    consent: boolean;
    legalObligation: boolean;
    vitalInterests: boolean;
    legitimateInterests: boolean;
  };
  
  // Data subject rights
  dataSubjectRights: {
    access: boolean;
    rectification: boolean;
    erasure: boolean;
    portability: boolean;
    objection: boolean;
    automatedDecisionMaking: boolean;
  };
}

export interface ANVISAComplianceAssessment {
  score: number; // 0-100
  
  // ANVISA resolutions
  resolutions: {
    [resolutionNumber: string]: {
      status: 'compliant' | 'partial' | 'non-compliant';
      description: string;
      requirements: string[];
    };
  };
  
  // Medical device classification
  medicalDevice: {
    classification: string;
    registrationStatus: 'registered' | 'pending' | 'not-required';
    safetyReporting: boolean;
    postMarketSurveillance: boolean;
  };
  
  // Clinical trials
  clinicalTrials: {
    protocolsRequired: boolean;
    ethicsApproval: boolean;
    informedConsent: boolean;
    safetyMonitoring: boolean;
  };
}

export interface ProfessionalCouncilComplianceAssessment {
  score: number; // 0-100
  
  // Council-specific compliance
  council: 'cfm' | 'coren' | 'cfo' | 'cno' | 'cne';
  
  // Ethical compliance
  ethics: {
    codeOfEthics: boolean;
    professionalConduct: boolean;
    patientRights: boolean;
    confidentiality: boolean;
  };
  
  // Professional requirements
  requirements: {
    licenseStatus: 'valid' | 'expired' | 'suspended';
    continuingEducation: boolean;
    professionalRecord: boolean;
    supervision: boolean;
  };
}

export interface HealthcareComplianceViolation {
  id: string;
  type: 'lgpd' | 'anvisa' | 'council' | 'safety' | 'privacy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  
  // Location
  location: {
    filePath: string;
    functionName?: string;
    lineNumber?: number;
  };
  
  // Regulatory reference
  regulation: {
    name: string;
    article?: string;
    section?: string;
    requirement: string;
  };
  
  // Impact assessment
  impact: {
    patientSafetyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    legalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    operationalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Resolution
  resolution: {
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedHours: number;
    deadline?: Date;
    responsibleParty: string;
  };
}

export interface HealthcareComplianceAction {
  id: string;
  type: 'remediation' | 'documentation' | 'process' | 'training' | 'system';
  description: string;
  
  // Implementation details
  implementation: {
    timeline: string;
    resources: string[];
    milestones: string[];
  };
  
  // Responsibility
  responsibility: {
    role: string;
    department: string;
    individual?: string;
  };
  
  // Validation
  validation: {
    testingRequired: boolean;
    reviewRequired: boolean;
    auditRequired: boolean;
  };
  
  // Status
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  completedDate?: Date;
}

export interface PackagePerformanceMetrics {
  // Build performance
  build: {
    buildTime: number; // milliseconds
    incrementalBuildTime: number; // milliseconds
    cleanBuildTime: number; // milliseconds
    rebuildTime: number; // milliseconds
  };
  
  // Bundle performance
  bundle: {
    size: number; // bytes
    gzippedSize: number; // bytes
    chunkCount: number;
    largestChunk: number; // bytes
  };
  
  // Runtime performance
  runtime: {
    initializationTime: number; // milliseconds
    averageResponseTime: number; // milliseconds
    memoryUsage: number; // bytes
    cpuUsage: number; // percentage
  };
  
  // Mobile performance
  mobile: {
    loadTime3G: number; // milliseconds
    loadTime4G: number; // milliseconds
    batteryImpact: 'low' | 'medium' | 'high';
    memoryUsageMobile: number; // bytes
  };
  
  // Healthcare-specific performance
  healthcare: {
    patientDataLoadTime: number; // milliseconds
    clinicalDecisionSupportTime: number; // milliseconds
    emergencyResponseTime: number; // milliseconds
    concurrentUserSupport: number;
  };
  
  // Performance benchmarks
  benchmarks: {
    industryAverage: number;
    healthcareBest: number;
    currentScore: number; // 0-100
    targetScore: number; // 0-100
  };
  
  // Optimization opportunities
  optimization: {
    lazyLoadingPotential: number; // percentage
    codeSplittingPotential: number; // percentage
    compressionImprovement: number; // percentage
    cachingOpportunities: string[];
  };
}

export interface PackageSecurityAssessment {
  // Overall security score
  overallScore: number; // 0-100
  
  // Vulnerabilities
  vulnerabilities: SecurityVulnerability[];
  
  // Security metrics
  metrics: {
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    totalVulnerabilities: number;
  };
  
  // Security practices
  practices: {
    inputValidation: 'compliant' | 'partial' | 'non-compliant';
    authentication: 'compliant' | 'partial' | 'non-compliant';
    authorization: 'compliant' | 'partial' | 'non-compliant';
    encryption: 'compliant' | 'partial' | 'non-compliant';
    logging: 'compliant' | 'partial' | 'non-compliant';
  };
  
  // Healthcare security
  healthcareSecurity: {
    patientDataEncryption: boolean;
    accessControl: boolean;
    auditLogging: boolean;
    dataAnonymization: boolean;
    secureCommunication: boolean;
  };
  
  // Security dependencies
  securityDependencies: {
    securityLibraries: string[];
    securityScanning: boolean;
    penetrationTesting: boolean;
    securityTraining: boolean;
  };
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cveId?: string;
  cvssScore?: number;
  
  // Location
  location: {
    filePath: string;
    functionName?: string;
    lineNumber?: number;
  };
  
  // Vulnerability details
  vulnerability: {
    type: string;
    affectedVersions: string[];
    patchedVersions: string[];
    discovered: Date;
    published: Date;
  };
  
  // Impact assessment
  impact: {
    patientDataExposed: boolean;
    systemIntegrityCompromised: boolean;
    regulatoryComplianceViolated: boolean;
    businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Remediation
  remediation: {
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedEffort: number; // hours
    patchAvailable: boolean;
    workaroundAvailable: boolean;
  };
}

export interface PackageTestCoverage {
  // Overall coverage
  overall: {
    lineCoverage: number; // 0-100
    branchCoverage: number; // 0-100
    functionCoverage: number; // 0-100
    statementCoverage: number; // 0-100
  };
  
  // Test categories
  categories: {
    unitTests: TestCoverage;
    integrationTests: TestCoverage;
    endToEndTests: TestCoverage;
    securityTests: TestCoverage;
    healthcareTests: TestCoverage;
  };
  
  // Healthcare testing
  healthcareTesting: {
    patientDataTesting: number; // 0-100
    clinicalWorkflowTesting: number; // 0-100
    complianceTesting: number; // 0-100
    accessibilityTesting: number; // 0-100
  };
  
  // Test quality
  quality: {
    testQualityScore: number; // 0-100
    flakyTests: number;
    slowTests: number;
    obsoleteTests: number;
  };
  
  // Coverage gaps
  gaps: CoverageGap[];
  
  // Recommendations
  recommendations: TestCoverageRecommendation[];
}

export interface TestCoverage {
  name: string;
  coverage: number; // 0-100
  files: number;
  tests: number;
  
  // File-level details
  filesCoverage: FileCoverage[];
  
  // Uncovered files
  uncoveredFiles: string[];
  
  // Partially covered files
  partiallyCoveredFiles: string[];
}

export interface FileCoverage {
  filePath: string;
  lines: number;
  coveredLines: number;
  coverage: number; // 0-100
  
  // Function coverage
  functions: {
    total: number;
    covered: number;
    coverage: number; // 0-100
  };
  
  // Branch coverage
  branches: {
    total: number;
    covered: number;
    coverage: number; // 0-100
  };
}

export interface CoverageGap {
  filePath: string;
  gapType: 'no-coverage' | 'partial-coverage' | 'complex-function' | 'complex-branch';
  description: string;
  priority: 'low' | 'medium' | 'high';
  
  // Healthcare context
  healthcareContext?: {
    patientDataInvolved: boolean;
    clinicalLogicInvolved: boolean;
    complianceCritical: boolean;
  };
  
  // Recommendation
  recommendation: string;
}

export interface TestCoverageRecommendation {
  type: 'add-tests' | 'improve-coverage' | 'refactor-for-testability' | 'add-hardware-testing';
  description: string;
  
  // Priority
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Implementation
  implementation: {
    estimatedEffort: number; // hours
    complexity: 'simple' | 'moderate' | 'complex';
    requiredSkills: string[];
  };
  
  // Expected benefit
  expectedBenefit: {
    coverageImprovement: number; // percentage
    qualityImprovement: number; // percentage
    riskReduction: number; // percentage
  };
}

export interface PackageArchitecturalCompliance {
  // Overall architectural score
  overallScore: number; // 0-100
  
  // Architectural principles
  principles: {
    solid: SOLIDCompliance;
    cleanArchitecture: CleanArchitectureCompliance;
    microservices: MicroservicesCompliance;
    domainDrivenDesign: DDDCompliance;
  };
  
  // Package boundaries
  boundaries: {
    boundaryViolations: BoundaryViolation[];
    properSeparation: boolean;
    circularDependencies: CircularDependency[];
  };
  
  // Healthcare architecture
  healthcareArchitecture: {
    domainSeparation: boolean;
    patientDataIsolation: boolean;
    clinicalWorkflowSeparation: boolean;
    complianceLayerPresence: boolean;
  };
  
  // Design patterns
  patterns: {
    designPatternsUsed: string[];
    patternsMissing: string[];
    patternsMisused: PatternMisuse[];
  };
}

export interface SOLIDCompliance {
  singleResponsibility: {
    score: number; // 0-100
    violations: string[];
  };
  openClosed: {
    score: number; // 0-100
    violations: string[];
  };
  liskovSubstitution: {
    score: number; // 0-100
    violations: string[];
  };
  interfaceSegregation: {
    score: number; // 0-100
    violations: string[];
  };
  dependencyInversion: {
    score: number; // 0-100
    violations: string[];
  };
}

export interface CleanArchitectureCompliance {
  layerSeparation: {
    score: number; // 0-100
    violations: string[];
  };
  dependencyFlow: {
    score: number; // 0-100
    violations: string[];
  };
  abstraction: {
    score: number; // 0-100
    violations: string[];
  };
  isolation: {
    score: number; // 0-100
    violations: string[];
  };
}

export interface MicroservicesCompliance {
  serviceBoundaries: {
    score: number; // 0-100
    violations: string[];
  };
  communication: {
    score: number; // 0-100
    patterns: string[];
    violations: string[];
  };
  dataOwnership: {
    score: number; // 0-100
    violations: string[];
  };
  faultTolerance: {
    score: number; // 0-100
    implementations: string[];
  };
}

export interface DDDCompliance {
  boundedContexts: {
    score: number; // 0-100
    violations: string[];
  };
  aggregates: {
    score: number; // 0-100
    violations: string[];
  };
  domainEvents: {
    score: number; // 0-100
    implementations: string[];
  };
  repositories: {
    score: number; // 0-100
    implementations: string[];
  };
}

export interface BoundaryViolation {
  violationType: 'dependency' | 'import' | 'export' | 'circular';
  fromPackage: string;
  toPackage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Description
  description: string;
  
  // Healthcare impact
  healthcareImpact: {
    patientDataBoundaryViolation: boolean;
    clinicalDomainMixing: boolean;
    complianceLayerViolation: boolean;
  };
  
  // Suggested fix
  suggestedFix: string;
}

export interface PatternMisuse {
  pattern: string;
  description: string;
  location: string;
  
  // Misuse type
  misuseType: 'incorrect-implementation' | 'over-engineering' | 'misapplication' | 'anti-pattern';
  
  // Healthcare context
  healthcareContext: {
    patientDataImpact: boolean;
    clinicalWorkflowImpact: boolean;
    complianceImpact: boolean;
  };
  
  // Refactoring suggestion
  refactoring: {
    recommendation: string;
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedEffort: number;
  };
}

// Package analysis utilities
export function calculatePackageHealthScore(analysis: PackageAnalysis): number {
  const weights = {
    maintainability: 0.3,
    complexity: 0.2,
    duplication: 0.15,
    dependencies: 0.15,
    healthcareCompliance: 0.15,
    testCoverage: 0.1,
    security: 0.1,
    performance: 0.1
  };
  
  let score = 0;
  
  // Maintainability index
  score += analysis.health.maintainabilityIndex * weights.maintainability;
  
  // Complexity (inverted - lower complexity is better)
  score += (100 - analysis.health.complexityScore) * weights.complexity;
  
  // Duplication (inverted - lower duplication is better)
  score += (100 - analysis.health.duplicationPercentage) * weights.duplication;
  
  // Dependencies (inverted - fewer violations is better)
  const dependencyScore = Math.max(0, 100 - (
    analysis.dependencies.metrics.circularDependencies * 20 +
    analysis.dependencies.metrics.vulnerableDependencies * 10 +
    analysis.dependencies.metrics.outdatedDependencies * 5
  ));
  score += dependencyScore * weights.dependencies;
  
  // Healthcare compliance
  score += analysis.healthcareCompliance.overallScore * weights.healthcareCompliance;
  
  // Test coverage
  score += analysis.testCoverage.overall.lineCoverage * weights.testCoverage;
  
  // Security (inverted - fewer vulnerabilities is better)
  const securityScore = Math.max(0, 100 - (
    analysis.security.metrics.criticalVulnerabilities * 20 +
    analysis.security.metrics.highVulnerabilities * 10 +
    analysis.security.metrics.mediumVulnerabilities * 5
  ));
  score += securityScore * weights.security;
  
  // Performance (inverted - better performance is better)
  const performanceScore = Math.max(0, 100 - (
    (analysis.performance.build.buildTime / 50) + // 50ms target
    (analysis.performance.bundle.size / 500000) + // 500KB target
    (analysis.performance.runtime.initializationTime / 100) // 100ms target
  ));
  score += performanceScore * weights.performance;
  
  return Math.min(100, Math.round(score));
}

export function generatePackageSummary(analysis: PackageAnalysis): string {
  const healthScore = calculatePackageHealthScore(analysis);
  
  return `
# Package Analysis Summary: ${analysis.metadata.name}

## Overall Health Score: ${healthScore}/100

### Package Information
- **Name**: ${analysis.metadata.name}
- **Version**: ${analysis.metadata.version}
- **Classification**: ${analysis.metadata.classification}
- **Purpose**: ${analysis.metadata.purpose}

### Key Metrics
- **Maintainability**: ${analysis.health.maintainabilityIndex}/100
- **Complexity**: ${analysis.health.complexityScore}/100
- **Code Duplication**: ${analysis.health.duplicationPercentage}%
- **Dependencies**: ${analysis.dependencies.metrics.totalDependencies} total
- **Circular Dependencies**: ${analysis.dependencies.metrics.circularDependencies}
- **Test Coverage**: ${analysis.testCoverage.overall.lineCoverage}%
- **Security Score**: ${analysis.security.overallScore}/100

### Healthcare Compliance
- **Overall Compliance**: ${analysis.healthcareCompliance.overallScore}/100
- **LGPD Compliance**: ${analysis.healthcareCompliance.lgpdCompliance.score}/100
- **ANVISA Compliance**: ${analysis.healthcareCompliance.anvisaCompliance.score}/100
- **Council Compliance**: ${analysis.healthcareCompliance.professionalCouncilCompliance.score}/100

### Performance Metrics
- **Build Time**: ${analysis.performance.build.buildTime}ms
- **Bundle Size**: ${analysis.performance.bundle.size} bytes
- **Memory Usage**: ${analysis.performance.runtime.memoryUsage} bytes
- **Mobile Load Time (3G)**: ${analysis.performance.mobile.loadTime3G}ms

### Top Recommendations
${analysis.health.recommendations
  .slice(0, 5)
  .map(r => `- **${r.title}**: ${r.description}`)
  .join('\n')}

### Security Summary
- **Critical Vulnerabilities**: ${analysis.security.metrics.criticalVulnerabilities}
- **High Vulnerabilities**: ${analysis.security.metrics.highVulnerabilities}
- **Total Vulnerabilities**: ${analysis.security.metrics.totalVulnerabilities}

### Test Coverage Summary
- **Line Coverage**: ${analysis.testCoverage.overall.lineCoverage}%
- **Branch Coverage**: ${analysis.testCoverage.overall.branchCoverage}%
- **Function Coverage**: ${analysis.testCoverage.overall.functionCoverage}%
- **Healthcare Testing**: ${analysis.testCoverage.healthcareTesting.patientDataTesting}%

**Analysis Date**: ${analysis.analysisDate.toLocaleDateString('pt-BR')}
**Analysis Version**: ${analysis.version}
  `.trim();
}

// Type guards
export function isPackageAnalysis(obj: any): obj is PackageAnalysis {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.packageName === 'string' &&
    typeof obj.version === 'string' &&
    obj.analysisDate instanceof Date &&
    typeof obj.metadata === 'object' &&
    typeof obj.health === 'object' &&
    typeof obj.dependencies === 'object' &&
    typeof obj.codeMetrics === 'object';
}