// Finding entity with severity classification and impact assessment
// Healthcare compliance focused for Brazilian aesthetic clinics
// Enhanced with OXLint integration and security vulnerability assessment

import { Location } from './location';
import { ImpactAssessment } from './impact-assessment';
import { Solution } from './solution';
import { FindingType, SeverityLevel } from './finding-enums';

export interface Finding {
  id: string;
  type: FindingType;
  severity: SeverityLevel;
  location: Location[];
  description: string;
  impact: ImpactAssessment;
  proposedSolution: Solution;
  evidence: string[];
  
  // OXLint integration
  oxlintData?: OXLintFindingData;
  
  // Healthcare-specific data
  healthcareData?: HealthcareFindingData;
  
  // Security assessment
  securityData?: SecurityFindingData;
  
  // Performance impact
  performanceData?: PerformanceFindingData;
  
  // Fix suggestion automation
  fixAutomation?: FixAutomationData;
  
  // ROI calculation
  roiCalculation?: ROICalculation;
}

export interface OXLintFindingData {
  ruleId: string;
  ruleCategory: 'performance' | 'correctness' | 'style' | 'complexity' | 'security';
  message: string;
  suggestion?: string;
  
  // Performance metrics
  performanceGain?: number; // 50-100x faster than ESLint
  
  // Healthcare rule violations
  healthcareRuleViolations: HealthcareRuleViolation[];
  
  // Suggested fixes
  suggestedFixes: OXLintSuggestedFix[];
}

export interface HealthcareRuleViolation {
  rule: string;
  category: 'lgpd' | 'anvisa' | 'cfm' | 'coren' | 'patient-safety' | 'data-privacy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedCode: string;
  recommendation: string;
  
  // Brazilian healthcare context
  brazilianContext?: {
    portugueseTerm?: string;
    clinicalContext?: string;
    regulatoryReference?: string;
  };
}

export interface OXLintSuggestedFix {
  type: 'replace' | 'insert' | 'delete' | 'move';
  description: string;
  codeBefore: string;
  codeAfter: string;
  
  // Healthcare compliance impact
  complianceImpact?: {
    improvesCompliance: boolean;
    affectedRegulations: string[];
  };
}

export interface HealthcareFindingData {
  // Patient data involvement
  patientDataInvolved: boolean;
  patientDataTypes: string[]; // ['name', 'cpf', 'medical-record', 'treatment-history']
  
  // Clinical relevance
  clinicalRelevance: 'none' | 'low' | 'medium' | 'high' | 'critical';
  clinicalContext: string;
  
  // Compliance impact
  lgpdImpact: LGPDImpact;
  anvisaImpact: ANVISAImpact;
  professionalCouncilImpact: ProfessionalCouncilImpact;
  
  // Brazilian healthcare context
  brazilianHealthcareContext: BrazilianHealthcareContext;
  
  // Risk assessment
  riskAssessment: HealthcareRiskAssessment;
}

export interface LGPDImpact {
  affectedArticles: number[]; // LGPD law articles
  dataProcessingBasis: string; // Legal basis for processing
  consentRequired: boolean;
  retentionPeriod: string;
  internationalTransfer: boolean;
  
  // Violation assessment
  violationType: 'unauthorized-access' | 'data-breach' | 'lack-of-consent' | 'excessive-retention';
  potentialFine: 'low' | 'medium' | 'high' | 'very-high';
}

export interface ANVISAImpact {
  affectedRegulations: string[]; // ANVISA resolutions
  medicalDeviceClassification?: string;
  clinicalTrialRelevance: boolean;
  safetyReporting: boolean;
  
  // Compliance requirements
  documentationRequired: string[];
  validationRequired: boolean;
  auditTrailRequired: boolean;
}

export interface ProfessionalCouncilImpact {
  affectedCouncil: 'cfm' | 'coren' | 'cfo' | 'cno' | 'cne';
  ethicalImplications: string[];
  professionalResponsibility: boolean;
  patientSafetyImpact: boolean;
  
  // Regulatory compliance
  codeViolations: string[];
  requiredActions: string[];
  reportingRequirements: string[];
}

export interface BrazilianHealthcareContext {
  // Portuguese terminology
  portugueseTerms: string[];
  
  // Clinical terminology
  clinicalTerms: string[];
  
  // Administrative terminology
  administrativeTerms: string[];
  
  // Regional considerations
  region: 'national' | 'state-specific' | 'municipal';
  state?: string;
  municipality?: string;
  
  // Cultural context
  culturalConsiderations: string[];
}

export interface HealthcareRiskAssessment {
  patientSafetyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  dataPrivacyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  complianceRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  clinicalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // Overall risk
  overallRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // Mitigation requirements
  immediateActionRequired: boolean;
  mitigationSteps: string[];
  monitoringRequired: boolean;
}

export interface SecurityFindingData {
  vulnerabilityType: 'sql-injection' | 'xss' | 'csrf' | 'authentication' | 'authorization' | 'data-leak' | 'encryption';
  cveId?: string;
  cvssScore?: number; // 0-10
  
  // Exploitability
  exploitability: 'low' | 'medium' | 'high' | 'critical';
  attackVector: 'network' | 'local' | 'physical';
  
  // Healthcare security impact
  patientDataExposed: boolean;
  medicalRecordsAccessible: boolean;
  systemIntegrityCompromised: boolean;
  
  // Brazilian healthcare security context
  lgpdSecurityViolation: boolean;
  anvisaSecurityRequirements: string[];
  
  // Required actions
  immediateActionRequired: boolean;
  patchRequired: boolean;
  monitoringRequired: boolean;
}

export interface PerformanceFindingData {
  performanceIssueType: 'bundle-size' | 'build-time' | 'runtime' | 'memory' | 'network' | 'database';
  
  // Performance metrics
  currentMetrics: {
    buildTime?: number;
    bundleSize?: number;
    memoryUsage?: number;
    responseTime?: number;
    throughput?: number;
  };
  
  targetMetrics: {
    buildTime?: number;
    bundleSize?: number;
    memoryUsage?: number;
    responseTime?: number;
    throughput?: number;
  };
  
  // Healthcare performance context
  clinicalImpact: string; // How performance affects clinical workflows
  patientExperienceImpact: string; // How performance affects patient experience
  
  // Mobile performance
  mobilePerformance: {
    loadTime3G?: number;
    loadTime4G?: number;
    memoryUsageMobile?: number;
    batteryImpact?: 'low' | 'medium' | 'high';
  };
  
  // Optimization potential
  optimizationPotential: number; // 0-100 percentage improvement possible
}

export interface FixAutomationData {
  automatedFixAvailable: boolean;
  fixType: 'simple-replace' | 'pattern-replace' | 'extract-function' | 'refactor-class' | 'add-validation';
  
  // Fix details
  fixDescription: string;
  confidenceLevel: number; // 0-100
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high';
  potentialSideEffects: string[];
  
  // Implementation
  implementationComplexity: 'trivial' | 'easy' | 'moderate' | 'complex';
  estimatedTime: number; // minutes
  
  // Healthcare fix validation
  healthcareValidation: {
    patientDataSafe: boolean;
    clinicalWorkflowUnaffected: boolean;
    complianceMaintained: boolean;
  };
  
  // Code transformations
  transformations?: CodeTransformation[];
}

export interface CodeTransformation {
  type: 'replace' | 'insert' | 'delete' | 'move';
  filePath: string;
  lineStart: number;
  lineEnd?: number;
  originalCode: string;
  transformedCode: string;
  
  // Validation
  validationRequired: boolean;
  testsRequired: string[];
}

export interface ROICalculation {
  // Cost analysis
  implementationCost: {
    hours: number;
    complexity: 'simple' | 'moderate' | 'complex';
    requiredSkills: string[];
  };
  
  // Benefit analysis
  monthlySavings: {
    hours: number;
    money: number;
  };
  
  // ROI metrics
  paybackPeriod: number; // months
  annualROI: number; // percentage
  netPresentValue: number; // 5 years
  
  // Healthcare-specific ROI
  healthcareROI: {
    patientSafetyImprovement: number; // percentage
    complianceRiskReduction: number; // percentage
    clinicalEfficiencyImprovement: number; // percentage
  };
  
  // Risk reduction
  riskReduction: {
    securityRiskReduction: number; // percentage
    complianceRiskReduction: number; // percentage
    operationalRiskReduction: number; // percentage
  };
}

// Finding-specific enums
export enum FindingType {
  CODE_DUPLICATION = 'CODE_DUPLICATION',
  ARCHITECTURAL_VIOLATION = 'ARCHITECTURAL_VIOLATION',
  PERFORMANCE_ISSUE = 'PERFORMANCE_ISSUE',
  TYPE_SAFETY_ISSUE = 'TYPE_SAFETY_ISSUE',
  DEPENDENCY_ISSUE = 'DEPENDENCY_ISSUE',
  ORGANIZATIONAL_ISSUE = 'ORGANIZATIONAL_ISSUE',
  SECURITY_VULNERABILITY = 'SECURITY_VULNERABILITY',
  HEALTHCARE_COMPLIANCE = 'HEALTHCARE_COMPLIANCE',
  LGPD_VIOLATION = 'LGPD_VIOLATION',
  ANVISA_VIOLATION = 'ANVISA_VIOLATION',
  PROFESSIONAL_COUNCIL_VIOLATION = 'PROFESSIONAL_COUNCIL_VIOLATION'
}

export enum SeverityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// Type guards
export function isFinding(obj: any): obj is Finding {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.severity === 'string' &&
    Array.isArray(obj.location) &&
    typeof obj.description === 'string' &&
    typeof obj.impact === 'object' &&
    typeof obj.proposedSolution === 'object' &&
    Array.isArray(obj.evidence);
}

export function isHealthcareFinding(obj: any): obj is Finding & { healthcareData: HealthcareFindingData } {
  return isFinding(obj) && obj.healthcareData !== undefined;
}

export function isSecurityFinding(obj: any): obj is Finding & { securityData: SecurityFindingData } {
  return isFinding(obj) && obj.securityData !== undefined;
}

export function isPerformanceFinding(obj: any): obj is Finding & { performanceData: PerformanceFindingData } {
  return isFinding(obj) && obj.performanceData !== undefined;
}

// Validation functions
export function validateFinding(finding: Partial<Finding>): string[] {
  const errors: string[] = [];
  
  if (!finding.id) errors.push('ID is required');
  if (!finding.type) errors.push('Type is required');
  if (!finding.severity) errors.push('Severity is required');
  if (!Array.isArray(finding.location)) errors.push('Location must be an array');
  if (!finding.description) errors.push('Description is required');
  if (!finding.impact) errors.push('Impact assessment is required');
  if (!finding.proposedSolution) errors.push('Proposed solution is required');
  if (!Array.isArray(finding.evidence)) errors.push('Evidence must be an array');
  
  return errors;
}

// Priority calculation
export function calculateFindingPriority(finding: Finding): number {
  const severityWeights = {
    [SeverityLevel.CRITICAL]: 100,
    [SeverityLevel.HIGH]: 75,
    [SeverityLevel.MEDIUM]: 50,
    [SeverityLevel.LOW]: 25,
  };
  
  const typeWeights = {
    [FindingType.SECURITY_VULNERABILITY]: 1.5,
    [FindingType.LGPD_VIOLATION]: 1.5,
    [FindingType.ANVISA_VIOLATION]: 1.4,
    [FindingType.PROFESSIONAL_COUNCIL_VIOLATION]: 1.3,
    [FindingType.HEALTHCARE_COMPLIANCE]: 1.2,
    [FindingType.PERFORMANCE_ISSUE]: 1.1,
    [FindingType.CODE_DUPLICATION]: 1.0,
    [FindingType.ARCHITECTURAL_VIOLATION]: 1.0,
    [FindingType.TYPE_SAFETY_ISSUE]: 0.9,
    [FindingType.DEPENDENCY_ISSUE]: 0.8,
    [FindingType.ORGANIZATIONAL_ISSUE]: 0.7,
  };
  
  const basePriority = severityWeights[finding.severity] || 0;
  const typeMultiplier = typeWeights[finding.type] || 1;
  
  // Healthcare-specific adjustments
  let healthcareMultiplier = 1;
  if (finding.healthcareData) {
    if (finding.healthcareData.patientDataInvolved) healthcareMultiplier *= 1.5;
    if (finding.healthcareData.clinicalRelevance === 'critical') healthcareMultiplier *= 1.3;
    if (finding.healthcareData.riskAssessment.overallRisk === 'critical') healthcareMultiplier *= 1.4;
  }
  
  // Security-specific adjustments
  let securityMultiplier = 1;
  if (finding.securityData) {
    if (finding.securityData.patientDataExposed) securityMultiplier *= 1.5;
    if (finding.securityData.medicalRecordsAccessible) securityMultiplier *= 1.4;
    if (finding.securityData.immediateActionRequired) securityMultiplier *= 1.3;
  }
  
  return Math.round(basePriority * typeMultiplier * healthcareMultiplier * securityMultiplier);
}

// Finding summary generation
export function generateFindingSummary(finding: Finding): string {
  const priority = calculateFindingPriority(finding);
  const locations = finding.location.map(loc => `${loc.filePath}:${loc.lineNumber}`).join(', ');
  
  let summary = `**${finding.type}** (${finding.severity}) - Priority: ${priority}\n`;
  summary += `Location: ${locations}\n`;
  summary += `Description: ${finding.description}\n`;
  
  if (finding.healthcareData?.patientDataInvolved) {
    summary += `⚠️ **PATIENT DATA INVOLVED** - LGPD compliance risk\n`;
  }
  
  if (finding.securityData?.patientDataExposed) {
    summary += `🚨 **SECURITY RISK** - Patient data exposure possible\n`;
  }
  
  if (finding.oxlintData) {
    summary += `OXLint Rule: ${finding.oxlintData.ruleId} - Performance gain: ${finding.oxlintData.performanceGain}x\n`;
  }
  
  summary += `Impact: ${finding.impact.developerExperience} developer experience, ${finding.impact.performanceImpact} performance impact\n`;
  
  return summary;
}

// Healthcare compliance check
export function requiresHealthcareComplianceValidation(finding: Finding): boolean {
  return (
    finding.type === FindingType.LGPD_VIOLATION ||
    finding.type === FindingType.ANVISA_VIOLATION ||
    finding.type === FindingType.PROFESSIONAL_COUNCIL_VIOLATION ||
    finding.type === FindingType.HEALTHCARE_COMPLIANCE ||
    finding.healthcareData?.patientDataInvolved === true ||
    finding.healthcareData?.clinicalRelevance === 'critical' ||
    finding.securityData?.patientDataExposed === true
  );
}

// Automated fix eligibility
export function isEligibleForAutomatedFix(finding: Finding): boolean {
  return (
    finding.fixAutomation?.automatedFixAvailable === true &&
    finding.fixAutomation?.riskLevel !== 'high' &&
    finding.fixAutomation?.confidenceLevel > 70
  );
}