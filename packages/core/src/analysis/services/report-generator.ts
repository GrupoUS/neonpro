// Report generation service for architectural analysis
// Healthcare compliance focused for Brazilian aesthetic clinics
// Enhanced with OXLint integration and healthcare-specific reporting

import { Finding } from '../types/finding';
import { CodebaseAnalysis } from '../types/codebase-analysis';
import { PackageAnalysis } from '../types/package-analysis';
import { AnalysisStatus, ReportFormat } from '../types/analysis-enums';
import { SeverityLevel, Priority } from '../types/finding-enums';
import { HealthCareComplianceScore } from '../types/codebase-analysis';
import { Priority } from '../types/finding-enums';

export interface ReportGenerationRequest {
  format: ReportFormat;
  includeCharts: boolean;
  includeHealthcareData: boolean;
  includePerformanceData: boolean;
  includeComplianceData: boolean;
  includeTestData: boolean;
  executive: boolean;
  detailed: boolean;
  brazilianLocale: boolean;
}

export interface ReportGenerationResult {
  format: ReportFormat;
  content: string;
  metadata: ReportMetadata;
  summary: ReportSummary;
  detailedFindings: Finding[];
  metrics: ReportMetrics;
  recommendations: Solution[];
  healthcareData?: ReportHealthcareData;
  performanceData?: ReportPerformanceData;
  testData?: ReportTestData;
  charts?: ReportChart[];
}

export interface ReportMetadata {
  generatedAt: Date;
  generatedBy: 'NeonPro Architectural Analysis System';
  version: string;
  scope: string;
  duration: number;
  fileCount: number;
  lineCount: number;
  tooling: string[];
}

export interface ReportSummary {
  overallHealthScore: number;
  criticalIssuesCount: number;
  highPriorityIssuesCount: number;
  totalViolations: number;
  recommendationsCount: number;
  estimatedTechnicalDebt: number;
  topCategories: TopViolationCategory[];
  
  // Executive summary
  executiveMetrics: {
    overallScore: number;
    criticalFindingsCount: number;
    highPriorityFindingsCount: number;
    estimatedTechnicalDebt: number;
    businessImpact: string;
    keyRecommendations: string[];
    nextSteps: string[];
  };
  
  // Healthcare compliance summary
  healthcareMetrics: {
    lgpdScore: number;
    anvisaScore: number;
    councilScores: {
      [council: string;
      score: number;
    };
    patientDataMetrics: PatientDataMetrics;
  };
  
  // Performance summary
  performanceMetrics: {
    buildTimeAverage: number;
    bundleSizeAverage: number;
    mobilePerformance: MobilePerformanceMetrics;
    performanceScore: number;
  };
  
  // Quality summary
  qualityMetrics: {
    codeQualityScore: number;
    testCoverage: number;
    maintainabilityIndex: number;
    testCoverage: number;
    overallScore: number;
  };
  
  // Risk summary
  riskMetrics: {
    securityRisk: number;
    complianceRisk: number;
    operationalRisk: number;
    financialRisk: number;
    totalRiskScore: number;
  };
}

export interface TopViolationCategory {
  category: string;
  count: number;
  description: string;
  brazilianContext?: string;
}

export interface ReportMetrics {
  // Overall metrics
  overallScore: number;
  codeQualityScore: number;
  testCoverage: number;
  maintainabilityIndex: number;
  performanceScore: number;
  
  // Violation metrics
  totalViolations: number;
  criticalViolations: number;
  highViolations: number;
  mediumViolations: number;
  lowViolations: number;
  
  // Category breakdown
  categoryCounts: {
    [category: string]: number;
  };
  
  // Compliance scores
  complianceScores: {
    overallScore: number;
    lgpdScore: number;
    anvisaScore: number;
    councilScores: {
      [council: string]: number;
      score: number;
    };
  };
  
  // Performance metrics
  performanceMetrics: {
    buildTime: number;
    bundleSize: number;
    memoryUsage: number;
    performanceScore: number;
  };
  
  // Risk assessment
  riskMetrics: {
    securityRiskScore: number;
    complianceRiskScore: number;
    operationalRiskScore: number;
  };
  
  // Trend analysis
  trendAnalysis: TrendAnalysis;
}

export interface TrendAnalysis {
  maintainabilityTrend: 'improving' | 'stable' | 'declining';
  complexityTrend: 'improving' | 'stable' | 'declining';
  duplicationTrend: 'improving' | 'stable' | 'declining';
  securityTrend: 'improving' | 'stable' | 'declining';
}

export interface ReportHealthData {
  patientDataMetrics: PatientDataMetrics;
  clinicalMetrics: ClinicalMetrics;
  validationMetrics: ValidationMetrics;
  complianceMetrics: ComplianceMetrics;
}

export interface PatientDataMetrics {
  totalPatients: number;
  recordsWithPatientData: number;
  patientDataFields: string[];
  dataClassification: {
    highly_sensitive: number;
    moderately_sensitive: number;
    low_sensitivity: number;
  non_sensitive: number;
  };
  
  // Data handling
  dataHandling: {
    encryptionEnabled: boolean;
    anonymizationEnabled: boolean;
    encryptionEnabled: boolean;
    accessControl: boolean;
    auditTrail: boolean;
    consentRequired: boolean;
  };
  
  // Geographic distribution
  geographicDistribution: {
    brazil: boolean;
    international: boolean;
    storageLocation: string;
  };
  
  // Access patterns
  accessPatterns: {
    directAccess: boolean;
    apiAccess: boolean;
    databaseAccess: boolean;
    sharedAccess: boolean;
  };
  
  // Data categories
  dataCategories: {
    personal: string[];
    health: string[];
    financial: string[];
    clinical: string[];
    administrative: string[];
    technical: string[];
  };
}

export interface ClinicalMetrics {
  totalProcedures: number;
  validatedProcedures: number;
  expertValidationRequired: number;
  documentationRequired: boolean;
  
  // Clinical workflow metrics
  workflowMetrics: {
    efficiencyScore: number;
    errorRate: number;
    successRate: number;
    complianceScore: number;
  };
  
  // Safety metrics
  safetyMetrics: {
    safetyIncidents: number;
    nearMisses: number;
    adverseEvents: number;
    patientSafetyRisk: number;
  };
  
  // Clinical outcomes
  outcomes: {
    treatmentAccuracy: number;
    patientSafety: number;
    clinicalEfficiency: number;
    satisfactionScore: number;
  };
  
  // Professional council compliance
  professionalCompliance: {
    cfm: boolean;
    coren: boolean;
    cfo: boolean;
    cno: boolean;
    cfo: boolean;
    cno: boolean;
  };
  
  // Risk assessment
  riskAssessment: {
    clinicalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    operationalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    legalRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface ValidationMetrics {
  validationTests: number;
  validationPassed: number;
  validationFailed: number;
  validationSkipped: number;
  totalValidations: number;
  validationRate: number; // 0-100
  
  // Validation types
  validationTypes: string[];
  
  // Healthcare validation
  healthcareValidation: {
    patientDataValidation: boolean;
    clinicalValidation: boolean;
    complianceValidation: boolean;
    safetyValidation: boolean;
    regulatoryValidation: boolean;
  };
  
  // Testing coverage
  testingCoverage: {
    unitTests: number;
    integrationTests: number;
    endToEndTests: number;
    healthcareTests: number;
    securityTests: number;
  };
}

export interface ComplianceMetrics {
  lgpdScore: number;
  anvisaScore: number;
  councilScores: {
    [council: string];
    score: number;
  };
  
  // Risk scores
  riskScores: {
    securityScore: number;
    complianceScore: number;
    operationalScore: number;
  legalScore: number;
    totalRiskScore: number;
  };
  
  // Violation tracking
  violations: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  
  // Required actions
  requiredActions: string[];
  
  // Status
  status: 'compliant' | 'partial' | 'non-compliant' | 'non-compliant';
}
export interface ValidationMetrics {
  validationTests: number;
  validationPassed: number;
  validationFailed: number;
  validationSkipped: number;
  totalValidations: number;
  validationRate: number; // 0-100
  
  // Validation types
  validationTypes: string[];
  
  // Testing coverage
  testingCoverage: {
    unitTests: number;
    integrationTests: number;
    endToEndTests: number;
    healthcareTests: number;
    securityTests: number;
  };
  
  // Validation requirements
  validation: {
    patientDataValidation: boolean;
    clinicalValidation: boolean;
    complianceValidation: boolean;
    expertReviewRequired: boolean;
    auditTrailRequired: boolean;
  };
  
  // Healthcare validation
  healthcareValidation: {
    lgpdValidation: boolean;
    anvisaValidation: boolean;
    councilValidation: boolean;
    patientSafetyValidation: boolean;
  clinicalValidation: boolean;
  };
}

export interface ComplianceMetrics {
  lgpdScore: number;
  anvisaScore: number;
  councilScores: {
    [council: string];
    score: number;
  };
  
  // Risk assessments
  riskScores: {
    securityScore: number;
    complianceScore: number;
    operationalScore: number;
    legalScore: number;
    totalRiskScore: number;
  };
  
  // Violations
  violations: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  
  // Required actions
  requiredActions: string[];
  
  // Status
  status: 'compliant' | 'partial' | 'non-compliant' | 'non-compliant';
}

export interface ReportPerformanceData {
  buildMetrics: {
    buildTime: number;
    incrementalBuildTime: number;
    cleanBuildTime: number;
    rebuildTime: number;
  },
  
  bundleMetrics: {
    size: number;
    gzippedSize: number;
    chunkCount: number;
    largestChunk: number;
  },
  
  runtimeMetrics: {
    initializationTime: number;
    averageResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    throughput: number;
  },
  
  // Mobile performance metrics
  mobilePerformance: {
    loadTime3G: number;
    loadTime4G: number;
    loadTimeWiFi: number;
    memoryUsageMobile: number;
    batteryImpact: 'low' | 'medium' | 'high';
  },
  
  // Performance optimization opportunities
  optimization: {
    codeSplittingOpportunities: number;
    lazyLoadingOpportunities: number;
    compressionOpportunities: number;
    cachingOpportunities: number;
    optimizationPotential: number;
  },
  
  // Performance benchmarks
  benchmarks: {
    buildTimeTarget: number;
    bundleSizeTarget: number;
    performanceScore: number;
    mobilePerformanceTarget: string;
    currentScore: number;
    targetScore: number;
  },
  
  // Trend analysis
  trends: TrendAnalysis;
}

export interface MobilePerformanceMetrics {
  loadTime3G: number;
  loadTime4G: number;
  loadTimeWiFi: number;
  memoryUsageMobile: number;
  batteryImpact: 'low' | 'mobile' | 'medium' | 'high';
  
  // Performance classification
  tier: MobilePerformanceTier;
  
  // Performance metrics
  performanceScore: number; // 0-100
  
  // Impact assessment
  impact: {
    userExperienceImpact: 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
    performanceImpact: 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
  };
  
  // Network conditions
  networkConditions: string;
  deviceType: string;
  
  // Battery impact
  batteryImpact: 'low' | 'mobile' | 'medium' | 'high';
  
  // Optimization recommendations
  optimizationRecommendations: {
    codeSplittingOpportunities: string[];
    lazyLoadingOpportunities: string[];
    compressionOpportunities: string[];
    cachingOpportunities: string[];
  };
}

export interface ReportHealthData {
  patientDataMetrics: PatientDataMetrics;
  clinicalMetrics: ClinicalMetrics;
  validationMetrics: ValidationMetrics;
  complianceMetrics: ComplianceMetrics;
  complianceScores: {
    lgpdScore: number;
    anvisaScore: number;
    councilScores: {
      [council: string];
      score: number;
    };
  };
  
  // Risk assessment
  riskAssessment: {
    patientSafetyRisk: string;
    dataPrivacyRisk: string;
    clinicalRisk: string;
    complianceRisk: string;
    overallRisk: string;
  };
  
  // Geographic distribution
  geographicDistribution: {
    brazilianOnly: boolean;
    internationalTransfer: boolean;
    storageLocation: string;
    countries: string[];
  };
  
  // Data handling
  dataHandling: {
    encryptedInTransit: boolean;
    encryptedAtRest: boolean;
    encryptedAtRest: boolean;
    accessControl: boolean;
    auditTrail: boolean;
  consentManagement: boolean;
    dataResidency: string;
  };
  
  // Compliance status
  complianceStatus: 'compliant' | 'partial' | 'non-compliant';
  
  // Clinical workflow
  clinicalWorkflow: {
    validationRequired: boolean;
    documentationRequired: boolean;
    expertReviewRequired: boolean;
    peerReviewRequired: boolean;
  };
  
  // Business impact
  businessImpact: {
    efficiencyImprovement: string;
    patientExperienceImpact: string;
    revenueImpact: string;
    complianceImpact: string;
  };
  
  // Required actions
  requiredActions: string[];
  
  // Timeline
  timeline: {
    estimatedHours: number;
    priority: string;
    deadline?: Date;
  };
  
  // Risk mitigation
  riskMitigation: string[];
  
  // Monitoring
  monitoring: {
    indicators: string[];
    frequency: string;
    responsibilities: string[];
  };
  
  // Quality metrics
  qualityScore: number;
  validationScore: number;
  complianceScore: number;
  qualityGateStatus: string[];
}

export interface PatientDataMetrics {
  // Total patient records
  totalPatients: number;
  totalRecords: number;
  recordsWithPatientData: number;
  
  // Patient demographics
  demographics: {
    ageGroups: {
      [ageGroup: string];
      count: number;
      percentage: number;
    }[];
    
    genderDistribution: {
      gender: string;
      count: number;
      percentage: number;
    };
    
    geographicDistribution: {
      region: string;
      count: number;
      percentage: number;
    ];
    
    // Patient records
    patientRecords: string[];
  };
  
  // Data categories
  dataCategories: string[];
  
  // Data access patterns
  accessPatterns: {
    directDatabaseAccess: boolean;
    apiAccess: boolean;
    indirectAccess: boolean;
    sharedAccess: boolean;
    apiAccess: boolean;
  };
  
  // Data quality
  dataQuality: {
    dataCompleteness: number;
    dataAccuracy: number;
    dataConsistency: number;
    duplicateRecords: number;
  };
  
  // Data handling
  dataHandling: {
    encryptedInTransit: boolean;
    encryptedAtRest: boolean;
    anonymized: boolean;
    consentManagement: boolean;
    auditTrail: boolean;
  };
  
  // Geographic data residency
  dataResidency: {
    brazilianOnly: boolean;
    internationalTransfer: boolean;
    storageLocation: string;
    countries: string[];
  };
  
  // Data classification
  dataClassification: {
    highly_sensitive: number;
    moderately_sensitive: number;
    low_sensitivity: number;
    non_sensitive: number;
    highly_sensitive: number;
  };
  
  // Risk assessment
  riskAssessment: {
    patientSafetyRisk: string;
    dataPrivacyRisk: string;
    clinicalRisk: string;
    complianceRisk: string;
    operationalRisk: string;
    overallRisk: string;
  };
  
  // Compliance validation
  complianceValidation: {
    lgpdCompliant: boolean;
    anvisaCompliant: boolean;
    councilCompliant: boolean;
    professionalCouncilCompliant: boolean;
    patientDataSafe: boolean;
  };
  
  // Clinical relevance
  clinicalRelevance: string;
  
  // Business impact
  businessImpact: {
    operationalEfficiency: string;
    patientExperience: string;
    revenueImpact: string;
    operationalCost: string;
  };
  
  // Technical metrics
  technicalMetrics: {
    codeQuality: string;
    testCoverage: string;
    performanceImpact: string;
    maintainability: string;
    securityImpact: string;
  };
}

export interface ClinicalMetrics {
  totalProcedures: number;
  validatedProcedures: number;
  expertValidation: boolean;
  documentationRequired: boolean;
  
  // Clinical workflow metrics
  workflowMetrics: {
    efficiencyScore: number; // 0-100
    errorRate: number; // 0-100
    successRate: number; // 0-100
    averageTime: number; // seconds
    throughput: number; // procedures/hour
  };
  
  // Clinical outcomes
  outcomes: {
    treatmentAccuracy: number; // 0-100
    patientSafety: number; // 0-100
    clinicalEfficacy: number; // 0-100
    patientExperience: number; // 0-100
    satisfactionScore: number; // 0-100
  };
  
  // Clinical quality
  qualityMetrics: {
    protocolAdherence: number; // 0-100
    documentationQuality: number; // 0-100
    clinicalValidation: number; // 0-100
  expertReview: number; // 0-100
  peerReview: number; // 0-100
    codeReview: number; // 0-100
  };
  
  // Testing coverage
  testCoverage: number; // 0-100
  
  // Safety metrics
  safetyMetrics: {
    errorsAvoided: number; // 0-100
    nearMisses: number; // 0-100
    safetyIncidents: number; // 0-100
  safetyIncidents: number; // 0-100
  nearMisses: number; // 0-100
  totalSafetyIncidents: number; // 0-100
  };
  
  // Performance metrics
  performanceMetrics: {
    responseTime: number; // milliseconds
    throughput: number; // operations/second
    resourceUsage: number; // 0-100
    errorRate: number; // 0-100
  efficiencyScore: number; // 0-100
  };
  
  // Compliance metrics
  complianceMetrics: {
    protocolAdherence: number; // 0-100
    consentManagement: number; // 0-100
    accessControl: number; // 0-100
    auditTrail: number; // 0-100
  complianceRisk: number; // 0-100
  };
  
  // Resource utilization
  resourceUtilization: {
    cpu: number; // 0-100
    memory: number; // 0-100
    storage: number; // 0-100
    network: number; // 0-100
  };
  
  // Mobile optimization
  mobileOptimization: {
    codeSplitting: number; // 0-100
    lazyLoading: number; // 0-100
    compression: number; // 0-100
    caching: number; // 0-100
  };
  
  // Performance optimization opportunities
  optimization: {
    codeSplittingOpportunities: number; // 0-100
    lazyLoadingOpportunities: number; // 0-100
    compressionOpportunities: number; // 0-100
    cachingOpportunities: number; // 0-100
    optimizationPotential: number; // 0-100
  };
  
  // Clinical workflow optimization
  clinicalWorkflowOptimization: {
    procedureOptimization: number; // 0-100
    efficiencyImprovement: number; // 0-100
    patientSafety: number; // 0-100
    clinicalDecisions: number; // 0-100
    workflowOptimization: number; // 0-100
  };
  
  // Mobile performance optimization
  mobilePerformanceOptimization: {
    bundleSizeOptimization: number; // 0-100
    codeSplittingOptimization: number; // 0-100
    lazyLoadingOptimization: number; // 0-100
    cachingOptimization: number; // 0-100
  };
  
  // Compliance optimization
  complianceOptimization: {
    complianceOptimization: number; // 0-100
    complianceImprovements: number; // 0-100
    regulatoryCompliance: number; // 0-100
    securityImprovements: number; // 0-100
    complianceImprovements: number; // 0-100
  };
  
  // Resource efficiency
  efficiencyOptimization: number; // 0-100
  
  // Cost optimization
  costReduction: number; // 0-100
  };
  
  // Performance metrics
  performanceScore: number; // 0-100
  performanceScoreOptimization: number; // 0-100
  
  // Healthcare ROI
  roi: {
    patientSafetyImprovement: number; // 0-100
    healthcareComplianceImprovement: number; // 0-100
    clinicalEfficiencyImprovement: number; // 0-100
    clinicalSafetyImprovement: number; // 0-100
  };
}