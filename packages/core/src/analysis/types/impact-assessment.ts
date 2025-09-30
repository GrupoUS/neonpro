// Impact assessment for findings
// Healthcare compliance focused for Brazilian aesthetic clinics

export interface ImpactAssessment {
  maintenanceCost: number; // Estimated hours/week
  developerExperience: 'severe' | 'moderate' | 'minor';
  performanceImpact: 'critical' | 'significant' | 'minor';
  scalabilityRisk: 'high' | 'medium' | 'low';
  businessRisk: 'critical' | 'significant' | 'minor';
  
  // Healthcare-specific impacts
  healthcareImpact?: HealthcareImpact;
  
  // Financial impact
  financialImpact?: FinancialImpact;
  
  // Patient impact
  patientImpact?: PatientImpact;
  
  // Timeline impact
  timelineImpact?: TimelineImpact;
  
  // Risk assessment
  riskAssessment?: RiskAssessment;
}

export interface HealthcareImpact {
  // Patient safety
  patientSafetyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  patientDataRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // Clinical workflow
  clinicalWorkflowDisruption: 'none' | 'minimal' | 'moderate' | 'severe';
  clinicalDecisionImpact: 'none' | 'minor' | 'moderate' | 'significant';
  
  // Compliance
  lgpdComplianceRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  anvisaComplianceRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  professionalCouncilRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // Quality of care
  qualityOfCareImpact: 'none' | 'minor' | 'moderate' | 'significant';
  patientExperienceImpact: 'none' | 'minor' | 'moderate' | 'significant';
  
  // Brazilian healthcare context
  brazilianContextImpact: BrazilianContextImpact;
}

export interface BrazilianContextImpact {
  // Regulatory impact
  regulatoryImpact: {
    lgpdImpact: string;
    anvisaImpact: string;
    stateRegulations: string[];
    municipalRegulations: string[];
  };
  
  // Cultural impact
  culturalImpact: {
    patientProviderRelationship: 'unaffected' | 'minor' | 'moderate' | 'significant';
    trustImpact: 'none' | 'minor' | 'moderate' | 'significant';
    communicationImpact: 'none' | 'minor' | 'moderate' | 'significant';
  };
  
  // Regional considerations
  regionalImpact: {
    affectedRegion: string;
    specificRegulations: string[];
    culturalConsiderations: string[];
  };
}

export interface FinancialImpact {
  // Direct costs
  immediateCosts: {
    developmentHours: number;
    testingHours: number;
    deploymentHours: number;
    totalCost: number;
  };
  
  // Ongoing costs
  ongoingCosts: {
    maintenanceHoursPerMonth: number;
    infrastructureCostPerMonth: number;
    complianceCostPerMonth: number;
    totalOngoingCostPerMonth: number;
  };
  
  // Risk costs
  riskCosts: {
    potentialFines: number;
    legalFees: number;
    reputationalCost: number;
    totalRiskCost: number;
  };
  
  // Savings
  potentialSavings: {
    developmentTimeSavings: number;
    maintenanceSavings: number;
    riskReductionSavings: number;
    totalSavingsPerMonth: number;
  };
  
  // ROI
  roi: {
    paybackPeriodMonths: number;
    annualROI: number;
    netPresentValue: number;
    internalRateOfReturn: number;
  };
}

export interface PatientImpact {
  // Safety
  safetyImpact: {
    immediateRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    longTermRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    errorLikelihood: 'none' | 'rare' | 'occasional' | 'frequent' | 'very-frequent';
  };
  
  // Privacy
  privacyImpact: {
    dataExposureRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
    consentIssues: 'none' | 'minor' | 'moderate' | 'significant';
    dataRetentionIssues: 'none' | 'minor' | 'moderate' | 'significant';
  };
  
  // Experience
  experienceImpact: {
    usabilityImpact: 'none' | 'minor' | 'moderate' | 'significant';
    accessibilityImpact: 'none' | 'minor' | 'moderate' | 'significant';
    satisfactionImpact: 'none' | 'minor' | 'moderate' | 'significant';
  };
  
  // Clinical care
  clinicalImpact: {
    diagnosisAccuracy: 'none' | 'minor' | 'moderate' | 'significant';
    treatmentEffectiveness: 'none' | 'minor' | 'moderate' | 'significant';
    monitoringCapability: 'none' | 'minor' | 'moderate' | 'significant';
  };
}

export interface TimelineImpact {
  // Development timeline
  developmentImpact: {
    delayDays: number;
    additionalTestingDays: number;
    additionalDeploymentDays: number;
    totalDelayDays: number;
  };
  
  // Clinical timeline
  clinicalImpact: {
    appointmentDelayMinutes: number;
    treatmentDelayDays: number;
    followUpDelayDays: number;
    patientCareDelay: 'none' | 'minor' | 'moderate' | 'significant';
  };
  
  // Compliance timeline
  complianceImpact: {
    immediateActionRequired: boolean;
    deadlineDays: number;
    extensionPossible: boolean;
    penaltyRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Business timeline
  businessImpact: {
    timeToMarketDelay: number;
    revenueDelayDays: number;
    competitiveDisadvantage: 'none' | 'minor' | 'moderate' | 'significant';
  };
}

export interface RiskAssessment {
  // Probability
  probability: {
    occurrenceLikelihood: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
    detectionLikelihood: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
    preventionLikelihood: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  };
  
  // Impact severity
  impactSeverity: {
    patientSafetySeverity: 'none' | 'low' | 'medium' | 'high' | 'critical';
    financialSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical';
    reputationalSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical';
    legalSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Overall risk
  overallRisk: {
    level: 'none' | 'low' | 'medium' | 'high' | 'critical';
    score: number; // 0-100
    priority: number; // 1-100
  };
  
  // Mitigation
  mitigation: {
    strategies: string[];
    costs: number[];
    effectiveness: number[];
    timeline: string[];
  };
  
  // Monitoring
  monitoring: {
    indicators: string[];
    frequency: string;
    responsibilities: string[];
  };
}

// Impact scoring
export function calculateImpactScore(impact: ImpactAssessment): number {
  let score = 0;
  
  // Developer experience impact (0-25 points)
  const experienceScores = {
    severe: 25,
    moderate: 15,
    minor: 5,
  };
  score += experienceScores[impact.developerExperience] || 0;
  
  // Performance impact (0-25 points)
  const performanceScores = {
    critical: 25,
    significant: 15,
    minor: 5,
  };
  score += performanceScores[impact.performanceImpact] || 0;
  
  // Business risk (0-25 points)
  const businessScores = {
    critical: 25,
    significant: 15,
    minor: 5,
  };
  score += businessScores[impact.businessRisk] || 0;
  
  // Scalability risk (0-25 points)
  const scalabilityScores = {
    high: 25,
    medium: 15,
    low: 5,
  };
  score += scalabilityScores[impact.scalabilityRisk] || 0;
  
  // Healthcare impact adjustments
  if (impact.healthcareImpact) {
    const healthScore = calculateHealthcareImpactScore(impact.healthcareImpact);
    score = Math.min(100, score + healthScore);
  }
  
  return Math.min(100, score);
}

export function calculateHealthcareImpactScore(healthcareImpact: HealthcareImpact): number {
  let score = 0;
  
  // Patient safety risk (0-40 points)
  const safetyScores = {
    critical: 40,
    high: 30,
    medium: 20,
    low: 10,
    none: 0,
  };
  score += safetyScores[healthcareImpact.patientSafetyRisk] || 0;
  
  // Clinical workflow disruption (0-30 points)
  const workflowScores = {
    severe: 30,
    moderate: 20,
    minimal: 10,
    none: 0,
  };
  score += workflowScores[healthcareImpact.clinicalWorkflowDisruption] || 0;
  
  // Compliance risk (0-30 points)
  const complianceScores = {
    critical: 30,
    high: 20,
    medium: 15,
    low: 10,
    none: 0,
  };
  
  // Use the highest compliance risk
  const lgpdScore = complianceScores[healthcareImpact.lgpdComplianceRisk] || 0;
  const anvisaScore = complianceScores[healthcareImpact.anvisaComplianceRisk] || 0;
  const councilScore = complianceScores[healthcareImpact.professionalCouncilRisk] || 0;
  
  score += Math.max(lgpdScore, anvisaScore, councilScore);
  
  return score;
}

// Impact severity classification
export function classifyImpactSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

// Impact mitigation strategies
export function generateMitigationStrategies(impact: ImpactAssessment): string[] {
  const strategies: string[] = [];
  
  // Based on developer experience
  if (impact.developerExperience === 'severe') {
    strategies.push('Implement comprehensive code review process');
    strategies.push('Provide extensive documentation and training');
    strategies.push('Consider rewriting affected code');
  }
  
  // Based on performance impact
  if (impact.performanceImpact === 'critical') {
    strategies.push('Immediate performance optimization required');
    strategies.push('Implement performance monitoring');
    strategies.push('Consider architecture redesign');
  }
  
  // Based on business risk
  if (impact.businessRisk === 'critical') {
    strategies.push('Implement risk mitigation measures immediately');
    strategies.push('Escalate to senior management');
    strategies.push('Prepare contingency plans');
  }
  
  // Based on healthcare impact
  if (impact.healthcareImpact) {
    if (impact.healthcareImpact.patientSafetyRisk !== 'none') {
      strategies.push('Immediate patient safety review required');
      strategies.push('Implement clinical workflow validation');
      strategies.push('Notify healthcare compliance team');
    }
    
    if (impact.healthcareImpact.lgpdComplianceRisk !== 'none') {
      strategies.push('Conduct LGPD compliance assessment');
      strategies.push('Implement data protection measures');
      strategies.push('Update privacy policies if needed');
    }
  }
  
  return strategies;
}

// Impact monitoring recommendations
export function generateMonitoringRecommendations(impact: ImpactAssessment): string[] {
  const recommendations: string[] = [];
  
  // General monitoring
  recommendations.push('Monitor system performance metrics');
  recommendations.push('Track error rates and user complaints');
  
  // Healthcare-specific monitoring
  if (impact.healthcareImpact) {
    recommendations.push('Monitor patient safety indicators');
    recommendations.push('Track clinical workflow efficiency');
    recommendations.push('Audit data access and modification');
    recommendations.push('Monitor LGPD compliance metrics');
  }
  
  // Business impact monitoring
  if (impact.businessRisk === 'critical' || impact.businessRisk === 'significant') {
    recommendations.push('Monitor revenue and patient retention');
    recommendations.push('Track competitive positioning');
    recommendations.push('Monitor regulatory compliance status');
  }
  
  return recommendations;
}