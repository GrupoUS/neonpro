// DuplicationFinding entity with similarity scoring
// Healthcare compliance focused for Brazilian aesthetic clinics
// Enhanced with OXLint integration and healthcare-specific analysis

import { Location } from './location';
import { ImpactAssessment } from './impact-assessment';
import { Solution } from './solution';
import { SeverityLevel } from './finding-enums';

export interface DuplicationFinding extends Finding {
  type: 'CODE_DUPLICATION';
  
  // Duplication-specific data
  duplicationData: DuplicationData;
  
  // Cluster information
  cluster: DuplicationCluster;
  
  // Similarity metrics
  similarityMetrics: SimilarityMetrics;
  
  // OXLint integration
  oxlintData?: OXLintDuplicationData;
  
  // Healthcare duplication data
  healthcareDuplication?: HealthcareDuplicationData;
  
  // Refactoring analysis
  refactoringAnalysis: RefactoringAnalysis;
}

export interface Finding {
  id: string;
  type: string;
  severity: SeverityLevel;
  location: Location[];
  description: string;
  impact: ImpactAssessment;
  proposedSolution: Solution;
  evidence: string[];
}

export interface DuplicationData {
  similarityScore: number; // 0-100
  duplicateLines: number;
  totalLines: number;
  filesInvolved: number;
  
  // Duplication patterns
  patterns: DuplicationPattern[];
  
  // Code structure
  structure: {
    functionsDuplicated: number;
    classesDuplicated: number;
    interfacesDuplicated: number;
    componentsDuplicated: number;
  };
  
  // Language-specific data
  languageData: {
    programmingLanguage: string;
    frameworks: string[];
    libraries: string[];
    patterns: string[];
  };
}

export interface DuplicationCluster {
  id: string;
  files: string[];
  lines: number;
  tokens: number;
  similarity: number;
  
  // First occurrence
  firstOccurrence: {
    file: string;
    startLine: number;
    endLine: number;
  };
  
  // All occurrences
  occurrences: Array<{
    file: string;
    startLine: number;
    endLine: number;
    similarity: number;
  }>;
  
  // Cluster analysis
  analysis: {
    complexity: 'simple' | 'moderate' | 'complex';
    stability: 'stable' | 'evolving' | 'deprecated';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Healthcare context
  healthcareContext: {
    patientDataInvolved: boolean;
    clinicalLogicInvolved: boolean;
    validationLogicInvolved: boolean;
    businessLogicInvolved: boolean;
    regulatoryRelevance: boolean;
  };
}

export interface DuplicationPattern {
  type: 'exact-match' | 'structural-similarity' | 'logical-similarity';
  confidence: number; // 0-100
  
  // Pattern description
  description: string;
  
  // Pattern context
  context: {
    businessLogic: boolean;
    clinicalLogic: boolean;
    validationLogic: boolean;
    infrastructure: boolean;
    uiComponents: boolean;
  };
  
  // Healthcare relevance
  healthcareRelevance: {
    patientDataRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    clinicalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    complianceRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface SimilarityMetrics {
  overall: number; // 0-100
  structural: number; // 0-100
  semantic: number; // 0-100
  
  // Granular metrics
  granular: {
    tokenSimilarity: number; // 0-100
    lineSimilarity: number; // 0-100
    characterSimilarity: number; // 0-100
    syntacticSimilarity: number; // 0-100
  };
  
  // Language-specific metrics
  languageMetrics: {
    [language: string]: LanguageSimilarityMetrics;
  };
}

export interface LanguageSimilarityMetrics {
  typeInference: number; // 0-100
  patternRecognition: number; // 0-100
  frameworkSpecific: number; // 0-100
  librarySpecific: number; // 0-100
}

export interface OXLintDuplicationData {
  ruleId: string;
  ruleCategory: 'duplication' | 'redundancy' | 'similarity';
  message: string;
  suggestion?: string;
  
  // Performance metrics
  performanceMetrics: {
    detectionTime: number; // milliseconds
    processingTime: number; // milliseconds
    memoryUsage: number; // bytes
    
    // OXLint 50-100x performance gain
    performanceGain: number; // percentage over ESLint
  };
  
  // Healthcare rule violations
  healthcareViolations: HealthcareDuplicationViolation[];
  
  // Suggested fixes
  suggestedFixes: DuplicationFixSuggestion[];
}

export interface HealthcareDuplicationViolation {
  rule: string;
  category: 'patient-data' | 'clinical-logic' | 'validation-logic' | 'business-logic' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  
  // Brazilian context
  brazilianContext: {
    portugueseTerm?: string;
    clinicalContext?: string;
    regulatoryReference?: string;
  };
  
  // Risk assessment
  riskAssessment: {
    patientSafetyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    complianceRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    operationalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Required action
  requiredAction: {
    actionType: 'immediate' | 'short-term' | 'long-term';
    deadline?: Date;
    responsible: string;
    approvalRequired: boolean;
  };
}

export interface DuplicationFixSuggestion {
  type: 'extract-function' | 'extract-class' | 'create-base-class' | 'use-composition' | 'move-code';
  description: string;
  
  // Implementation details
  implementation: {
    confidence: number; // 0-100
    complexity: 'trivial' | 'simple' | 'moderate' | 'complex';
    estimatedEffort: number; // hours
  };
  
  // Code transformation
  transformation: {
    beforeCode: string;
    afterCode: string;
    location: string;
  };
  
  // Validation
  validation: {
    syntaxCheck: boolean;
    typeCheck: boolean;
    testCompatibility: boolean;
    performanceImpact: 'positive' | 'neutral' | 'negative';
  };
  
  // Healthcare compliance check
  healthcareCompliance: {
    patientDataSafe: boolean;
    clinicalWorkflowUnaffected: boolean;
    complianceMaintained: boolean;
    regulatoryCompliant: boolean;
  };
  
  // Testing requirements
  testing: {
    unitTestsRequired: boolean;
    integrationTestsRequired: boolean;
    clinicalValidationRequired: boolean;
    complianceValidationRequired: boolean;
  };
}

export interface HealthcareDuplicationData {
  // Patient data analysis
  patientDataAnalysis: PatientDataDuplicationAnalysis;
  
  // Clinical logic analysis
  clinicalLogicAnalysis: ClinicalLogicDuplicationAnalysis;
  
  // Validation logic analysis
  validationLogicAnalysis: ValidationLogicDuplicationAnalysis;
  
  // Business logic analysis
  businessLogicAnalysis: BusinessLogicDuplicationAnalysis;
  
  // Brazilian healthcare context
  brazilianContext: BrazilianHealthcareContext;
  
  // Compliance assessment
  complianceAssessment: DuplicationComplianceAssessment;
  
  // Risk assessment
  riskAssessment: DuplicationRiskAssessment;
}

export interface PatientDataDuplicationAnalysis {
  duplicatesFound: number;
  totalPatterns: string[];
  
  // Data types involved
  dataTypesInvolved: string[];
  
  // Risk assessment
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // LGPD compliance
  lgpdCompliance: {
    consentRequired: boolean;
    anonymizationRequired: boolean;
    encryptionRequired: boolean;
    retentionPolicy: string;
  };
  
  // Geographic considerations
  dataResidency: {
    brazilianData: boolean;
    internationalTransfer: boolean;
    storageLocation: string;
  };
  
  // Access patterns
  accessPatterns: {
    directAccess: boolean;
    indirectAccess: boolean;
    apiAccess: boolean;
    batchAccess: boolean;
  };
}

export interface ClinicalLogicDuplicationAnalysis {
  duplicatesFound: number;
  totalPatterns: string[];
  
  // Clinical context
  clinicalContexts: string[];
  
  // Risk assessment
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // Clinical safety
  clinicalSafety: {
    decisionSupportImpact: 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
    treatmentAccuracyImpact: 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
    patientSafetyImpact: 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
  };
  
  // Professional council implications
  professionalCouncilImplications: {
    cfmImplications: string[];
    corenImplications: string[];
    cfoImplications: string[];
  };
  
  // Evidence requirements
  evidenceRequirements: {
    documentationRequired: boolean;
    auditTrailRequired: boolean;
    expertValidationRequired: boolean;
  };
}

export interface ValidationLogicDuplicationAnalysis {
  duplicatesFound: number;
  totalPatterns: string[];
  
  // Validation types
  validationTypes: string[];
  
  // Risk assessment
  riskLevel: 'none' | 'low' | 'mandatory';
  
  // Compliance impact
  complianceImpact: {
    lgpdImpact: 'none' | 'minor' | 'significant' | 'critical';
    anvisaImpact: 'none' | 'minor' | 'significant' | 'critical';
    councilImpact: 'none' | 'minor' | 'significant' | 'critical';
  };
  
  // Validation effectiveness
  effectiveness: {
    bugPrevention: number; // 0-100
    securityEnhancement: number; // 0-100
    maintainability: number; // 0-100
  };
  
  // Testing requirements
  testingRequirements: {
    unitTestsRequired: boolean;
    integrationTestsRequired: boolean;
    securityTestsRequired: boolean;
  };
}

export interface BusinessLogicDuplicationAnalysis {
  duplicatesFound: number;
  totalPatterns: string[];
  
  // Business functions
  businessFunctions: string[];
  
  // Impact assessment
  businessImpact: {
    operationalEfficiency: 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
    customerExperience: 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
    revenueImpact: 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
  };
  
  // Cost analysis
  costImpact: {
    developmentMaintenanceCost: number;
    opportunityCost: number;
    refactoringCost: number;
    trainingCost: number;
  };
  
  // Risk assessment
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // Timeline impact
  timelineImpact: {
    developmentDelay: number;
    deploymentDelay: number;
    timeToMarketImpact: number;
  };
}

export interface BrazilianHealthcareContext {
  // Portuguese terminology
  portugueseTerms: string[];
  
  // Clinical terminology
  clinicalTerms: string[];
  
  // Administrative terminology
  administrativeTerms: string[];
  
  // Regional considerations
  regionalContext: {
    state?: string;
    municipality?: string;
    localRegulations: string[];
  };
  
  // Cultural considerations
  culturalConsiderations: string[];
  
  // Medical specialties
  medicalSpecialties: string[];
  
  // Healthcare procedures
  healthcareProcedures: string[];
}

export interface DuplicationComplianceAssessment {
  // Overall compliance score
  overallScore: number; // 0-100
  
  // Regulatory compliance
  regulatoryCompliance: {
    lgpdScore: number; // 0-100
    anvisaScore: number; // 0-100
    councilScores: {
      [council: string]: number; // 0-100
    };
  };
  
  // Data protection
  dataProtection: {
    encryptionStatus: 'compliant' | 'partial' | 'non-compliant';
    accessControlStatus: 'compliant' | 'partial' | 'non-compliant';
    auditTrailStatus: 'compliant' | 'partial' | 'non-compliant';
    consentManagement: 'compliant' | 'partial' | 'non-compliant';
  };
  
  // Clinical safety
  clinicalSafety: {
    protocolsFollowed: boolean;
    documentationRequired: boolean;
    reviewProcess: boolean;
    trainingProvided: boolean;
  };
  
  // Compliance violations
  violations: DuplicationComplianceViolation[];
  
  // Required actions
  requiredActions: DuplicationComplianceAction[];
  
  // Validation requirements
  validation: {
    testingRequired: boolean;
    expertReviewRequired: boolean;
    auditTrailRequired: boolean;
  };
}

export interface DuplicationComplianceViolation {
  id: string;
  regulation: 'lgpd' | 'anvisa' | 'council' | 'safety' | 'privacy';
  description: string;
  
  // Severity
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Duplication details
  duplicationDetails: {
    duplicateFiles: string[];
    duplicateLines: number;
    affectedCode: string[];
  };
  
  // Regulatory reference
  regulatoryReference: {
    regulation: string;
    article?: string;
    section?: string;
    requirement: string;
  };
  
  // Impact assessment
  impact: {
    patientDataRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    clinicalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    legalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    operationalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Resolution requirements
  resolution: {
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedHours: number;
    deadline?: Date;
    responsibleParty: string;
    approvalRequired: boolean;
  };
}

export interface DuplicationComplianceAction {
  id: string;
  type: 'remediation' | 'documentation' | 'process' | 'training' | 'validation';
  description: string;
  
  // Implementation
  implementation: {
    timeline: string;
    resources: string[];
    milestones: string[];
    successCriteria: string[];
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
    signoffRequired: boolean;
  };
  
  // Status
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  completedDate?: Date;
}

export interface DuplicationRiskAssessment {
  // Overall risk level
  overallRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  
  // Risk categories
  riskCategories: {
    patientSafetyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    dataPrivacyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    clinicalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    operationalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    financialRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    reputationalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Risk factors
  riskFactors: RiskFactor[];
  
  // Mitigation strategies
  mitigation: {
    strategies: string[];
    costs: number[];
    timeline: string[];
    effectiveness: number[];
  };
  
  // Monitoring requirements
  monitoring: {
    indicators: string[];
    frequency: string;
    responsibilities: string[];
  };
}

export interface RiskFactor {
  name: string;
  description: string;
  category: string;
  impact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  probability: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  
  // Context
  context: {
    healthcareContext?: string;
    technicalContext?: string;
    businessContext?: string;
  };
  
  // Current status
  status: 'identified' | 'mitigating' | 'mitigated' | 'accepted';
  
  // Owner
  owner: string;
  dueDate?: Date;
}

export interface RefactoringAnalysis {
  // Refactoring complexity
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'enterprise';
  
  // Refactoring type analysis
  recommendedApproach: RefactoringApproach[];
  
  // Effort estimation
  effortEstimation: {
    totalHours: number;
    phases: RefactoringPhase[];
    skillRequirements: string[];
    resourceRequirements: string[];
  };
  
  // Impact analysis
  impactAnalysis: {
    maintainabilityImprovement: number; // 0-100
    performanceImprovement: number; // 0-100
    testabilityImprovement: number; // 0-100
    codeQualityImprovement: number; // 0-100
  };
  
  // Healthcare impact
  healthcareImpact: {
    patientDataSafety: 'improved' | 'unchanged' | 'degraded';
    clinicalWorkflow: 'improved' | 'unchanged' | 'degraded';
    complianceStatus: 'improved' | 'unchanged' | 'degraded';
  };
  
  // Risk assessment
  riskAssessment: {
    refactoringRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    regressionRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    deploymentRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Testing requirements
  testingRequirements: {
    unitTestsRequired: boolean;
    integrationTestsRequired: boolean;
    endToEndTestsRequired: boolean;
    healthcareTestsRequired: boolean;
    performanceTestsRequired: boolean;
    securityTestsRequired: boolean;
  };
  
  // Validation requirements
  validation: {
    codeReviewRequired: boolean;
    expertReviewRequired: boolean;
    clinicalValidationRequired: boolean;
    complianceReviewRequired: boolean;
  };
}

export interface RefactoringApproach {
  type: 'extract-function' | 'extract-class' | 'create-base-class' | 'use-composition' | 'move-code' | 'inline-code';
  
  // Description
  description: string;
  
  // Applicability
  applicability: {
    applicablePatterns: string[];
    nonApplicablePatterns: string[];
    complexity: 'trivial' | 'simple' | 'moderate' | 'complex';
  };
  
  // Benefits
  benefits: {
    maintainability: number; // 0-100
    reusability: number; // 0-100
    testability: number; // 0-100
    performance: number; // 0-100
  };
  
  // Considerations
  considerations: string[];
  
  // Healthcare compliance
  healthcareCompliance: {
    patientDataSafe: boolean;
    clinicalWorkflowSafe: boolean;
    complianceMaintained: boolean;
    regulatoryCompliant: boolean;
  };
}

export interface RefactoringPhase {
  name: string;
  description: string;
  
  // Timeline
  duration: number; // days
  startDate?: Date;
  endDate?: Date;
  
  // Deliverables
  deliverables: string[];
  
  // Dependencies
  dependencies: string[];
  
  // Resources
  resources: {
    personnel: string[];
    tools: string[];
    training: string[];
  };
  
  // Acceptance criteria
  acceptanceCriteria: string[];
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskMitigation: string[];
}

// Type guards
export function isDuplicationFinding(obj: any): obj is DuplicationFinding {
  return isFinding(obj) && obj.type === 'CODE_DUPLICATION';
}

export function isDuplicationCluster(obj: any): obj is DuplicationCluster {
  return obj &&
    typeof obj.id === 'string' &&
    Array.isArray(obj.files) &&
    typeof obj.lines === 'number' &&
    typeof obj.tokens === 'number' &&
    typeof obj.similarity === 'number' &&
    typeof obj.firstOccurrence === 'object' &&
    Array.isArray(obj.occurrences);
}

export function isHealthcareDuplication(obj: any): obj is DuplicationFinding & { healthcareDuplication: HealthcareDuplicationData } {
  return isDuplicationFinding(obj) && obj.healthcareDuplication !== undefined;
}

export function isOXLintDuplication(obj: any): obj is DuplicationFinding & { oxlintData: OXLintDuplicationData } {
  return isDuplicationFinding(obj) && obj.oxlintData !== undefined;
}

// Utility functions
export function calculateDuplicationSeverity(duplication: DuplicationFinding): SeverityLevel {
  const baseScore = calculateDuplicationScore(duplication);
  
  // Healthcare-specific severity adjustment
  if (duplication.healthcareDuplication) {
    const healthcareScore = calculateHealthcareDuplicationScore(duplication.healthcareDuplication);
    const combinedScore = Math.max(baseScore, healthcareScore);
    
    if (combinedScore >= 90) return SeverityLevel.CRITICAL;
    if (combinedScore >= 75) return SeverityLevel.HIGH;
    if (combinedScore >= 50) return SeverityLevel.MEDIUM;
  }
  
  return baseScore >= 75 ? SeverityLevel.HIGH :
         baseScore >= 50 ? SeverityLevel.MEDIUM :
         SeverityLevel.LOW;
}

export function calculateDuplicationScore(duplication: DuplicationFinding): number {
  let score = 0;
  
  // Base score from similarity
  score += duplication.duplicationData.similarityScore * 0.4;
  
  // Impact from number of files
  score += Math.min(25, duplication.duplicationData.filesInvolved * 5);
  
  // Impact from duplicate lines
  score += Math.min(25, duplication.duplicationData.duplicateLines / 100);
  
  // Structural complexity
  if (duplication.duplicationData.structure.classesDuplicated > 0) {
    score += 15;
  }
  if (duplication.duplicationData.structure.componentsDuplicated > 0) {
    score += 10;
  }
  
  return Math.min(100, score);
}

export function calculateHealthcareDuplicationScore(healthcareData: HealthcareDuplicationData): number {
  let score = 0;
  
  // Patient data involvement is critical
  if (healthcareData.patientDataAnalysis.riskLevel !== 'none') {
    const riskScores = {
      'critical': 50,
      'high': 35,
      'medium': 20,
      'low': 10,
      'none': 0
    };
    score += riskScores[healthcareData.patientDataAnalysis.riskLevel] || 0;
  }
  
  // Clinical logic risk
  if (healthcareData.clinicalLogicAnalysis.riskLevel !== 'none') {
    const clinicalScores = {
      'critical': 40,
      'high': 30,
      'medium': 20,
      'low': 10,
      'none': 0
    };
    score += clinicalScores[healthcare.clinicalLogicAnalysis.riskLevel] || 0;
  }
  
  // Validation logic risk
  if (healthcareData.validationLogicAnalysis.riskLevel === 'mandatory') {
    score += 30;
  } else if (healthcareData.validationLogicAnalysis.riskLevel !== 'none') {
    score += 15;
  }
  
  // Business logic impact
  if (healthcareData.businessLogicAnalysis.businessImpact === 'critical') {
    score += 25;
  } else if (healthcareData.businessLogicAnalysis.businessImpact !== 'none') {
    score += 15;
  }
  
  // LGPD compliance issues
  if (healthcareData.brazilianContext.portugueseTerms.length > 0) {
    score += 10;
  }
  
  return Math.min(100, score);
}

export function generateDuplicationFindingSummary(finding: DuplicationFinding): string {
  const severity = calculateDuplicationSeverity(finding);
  const score = calculateDuplicationScore(finding);
  
  let summary = `**${finding.type}** (${severity}) - Score: ${score}/100\n`;
  summary += `Location: ${finding.location.map(loc => loc.filePath).join(', ')}\n`;
  summary += `Similarity: ${finding.duplicationData.similarityScore}%\n`;
  summary += `Files involved: ${finding.duplicationData.filesInvolved}\n`;
  summary += `Duplicate lines: ${finding.duplicationData.duplicateLines}\n`;
  
  // Healthcare context
  if (finding.healthcareDuplication) {
    if (finding.healthcareDuplication.patientDataAnalysis.duplicatesFound > 0) {
      summary += `⚠️ **PATIENT DATA DUPLICATION** - ${finding.healthcareDuplication.patientDataAnalysis.riskLevel} risk\n`;
    }
    
    if (finding.healthcareDuplication.clinicalLogicAnalysis.duplicatesFound > 0) {
      summary += `🏥 **CLINICAL LOGIC DUPLICATION** - ${finding.healthcareDuplication.clinicalLogicAnalysis.riskLevel} risk\n`;
    }
    
    if (finding.healthcareDuplication.validationLogicAnalysis.riskLevel === 'mandatory') {
      summary += `🔒 **VALIDATION LOGIC DUPLICATION** - Mandatory refactoring required\n`;
    }
  }
  
  // OXLint context
  if (finding.oxlintData) {
    summary += `OXLint Rule: ${finding.oxlintData.ruleId} - Performance gain: ${finding.oxlintData.performanceMetrics.performanceGain}x\n`;
  }
  
  // Impact summary
  summary += `Impact: ${finding.impact.developerExperience} dev experience, ${finding.impact.performanceImpact} performance impact\n`;
  
  // Refactoring suggestion
  if (finding.proposedSolution.steps.length > 0) {
    summary += `Refactoring: ${finding.proposedSolution.implementation?.estimatedEffort?.hours || 0} hours estimated effort\n`;
  }
  
  return summary;
}

// Export all types
export * from './finding';
export * from './location';
export * from './impact-assessment';
export * from './solution';
export * from './finding-enums';
export * from './analysis-enums';