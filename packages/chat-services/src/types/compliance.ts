/**
 * Brazilian Healthcare Compliance Types
 */

import { EnhancedChatMessage, EnhancedChatSession, ComplianceValidationResult } from './chat';

// LGPD Compliance Types
export interface LGPDComplianceConfig {
  enabled: boolean;
  dataProcessingBasis: LGPDDataProcessingBasis;
  purposeSpecification: boolean;
  dataMinimization: boolean;
  storageLimitation: boolean;
  accuracy: boolean;
  transparency: boolean;
  securityMeasures: LGPDSecurityMeasures;
  accountability: boolean;
  internationalTransfers: LGPDInternationalTransferConfig;
  dataSubjectRights: LGPDDataSubjectRights;
}

export type LGPDDataProcessingBasis = 
  | 'consent' 
  | 'contractual_necessity' 
  | 'legal_obligation' 
  | 'vital_interests' 
  | 'public_interest' 
  | 'legitimate_interests';

export interface LGPDSecurityMeasures {
  encryption: EncryptionConfig;
  accessControls: AccessControlConfig;
  auditLogging: AuditLoggingConfig;
  incidentResponse: IncidentResponseConfig;
  staffTraining: StaffTrainingConfig;
  vendorManagement: VendorManagementConfig;
}

export interface LGPDInternationalTransferConfig {
  allowed: boolean;
  mechanism: 'adequacy_decision' | 'standard_contractual_clauses' | 'binding_corporate_rules' | 'certification';
  destinationCountries: string[];
}

export interface LGPDDataSubjectRights {
  access: boolean;
  rectification: boolean;
  erasure: boolean;
  portability: boolean;
  objection: boolean;
  automatedDecisionMaking: boolean;
  explanation: boolean;
}

// ANVISA Compliance Types
export interface ANVISAComplianceConfig {
  enabled: boolean;
  goodPractices: ANVISAGoodPractices;
  deviceRegulation: ANVISADeviceRegulation;
  clinicalTrials: ANVISAClinicalTrials;
  pharmacovigilance: ANVISAPharmacovigilance;
  advertising: ANVISAAdvertising;
  qualityManagement: ANVISAQualityManagement;
}

export interface ANVISAGoodPractices {
  storage: ANVISAStoragePractices;
  documentation: ANVISADocumentationPractices;
  traceability: ANVISATraceabilityPractices;
  validation: ANVISAValidationPractices;
}

export interface ANVISAStoragePractices {
  temperatureControl: boolean;
  humidityControl: boolean;
  monitoring: boolean;
  backup: boolean;
  disasterRecovery: boolean;
}

export interface ANVISADocumentationPractices {
  standardOperatingProcedures: boolean;
  batchRecords: boolean;
  changeControl: boolean;
  deviationManagement: boolean;
  trainingRecords: boolean;
}

export interface ANVISATraceabilityPractices {
  productTracking: boolean;
  distributionRecords: boolean;
  complaintHandling: boolean;
  recallProcedures: boolean;
}

export interface ANVISAValidationPractices {
  processValidation: boolean;
  cleaningValidation: boolean;
  analyticalMethodValidation: boolean;
  computerSystemValidation: boolean;
}

export interface ANVISADeviceRegulation {
  classification: ANVISADeviceClassification;
  registration: boolean;
  certification: boolean;
  postMarketSurveillance: boolean;
  vigilanceSystem: boolean;
}

export type ANVISADeviceClassification = 'I' | 'II' | 'III' | 'IV';

export interface ANVISAClinicalTrials {
  ethicsCommitteeApproval: boolean;
  informedConsent: boolean;
  protocolRegistration: boolean;
  safetyReporting: boolean;
  monitoring: boolean;
}

export interface ANVISAPharmacovigilance {
  adverseEventReporting: boolean;
  signalDetection: boolean;
  riskManagement: boolean;
  periodicSafetyUpdates: boolean;
}

export interface ANVISAAdvertising {
  preApproval: boolean;
  contentRestrictions: boolean;
  disclaimerRequirements: boolean;
  monitoring: boolean;
}

export interface ANVISAQualityManagement {
  qualitySystem: boolean;
  riskManagement: boolean;
  designControls: boolean;
  supplierControls: boolean;
}

// CFM (Federal Council of Medicine) Compliance Types
export interface CFMComplianceConfig {
  enabled: boolean;
  ethicalGuidelines: CFMEthicalGuidelines;
  telemedicine: CFMTelemedicineGuidelines;
  patientRecords: CFMPatientRecordGuidelines;
  professionalConduct: CFMProfessionalConduct;
  continuingEducation: CFMContinuingEducation;
}

export interface CFMEthicalGuidelines {
  patientAutonomy: boolean;
  beneficence: boolean;
  nonMaleficence: boolean;
  justice: boolean;
  confidentiality: boolean;
  veracity: boolean;
  fidelity: boolean;
}

export interface CFMTelemedicineGuidelines {
  appropriateUse: boolean;
  technologicalRequirements: boolean;
  documentation: boolean;
  emergencyProtocols: boolean;
  crossBorderPractice: boolean;
}

export interface CFMPatientRecordGuidelines {
  completeness: boolean;
  accuracy: boolean;
  timeliness: boolean;
  accessibility: boolean;
  confidentiality: boolean;
  retention: boolean;
}

export interface CFMProfessionalConduct {
  scopeOfPractice: boolean;
  referralGuidelines: boolean;
  feeGuidelines: boolean;
  advertising: boolean;
  collaboration: boolean;
}

export interface CFMContinuingEducation {
  requirementsMet: boolean;
  documentation: boolean;
  creditsTracking: boolean;
  renewalProcess: boolean;
}

// Comprehensive Compliance Framework
export interface HealthcareComplianceFramework {
  lgpd: LGPDComplianceConfig;
  anvisa: ANVISAComplianceConfig;
  cfm: CFMComplianceConfig;
  hipaa?: HIPAAComplianceConfig;
  gdpr?: GDPRComplianceConfig;
  iso27001?: ISO27001ComplianceConfig;
  customFrameworks: Record<string, unknown>;
}

export interface HIPAAComplianceConfig {
  enabled: boolean;
  privacyRule: boolean;
  securityRule: boolean;
  breachNotification: boolean;
  omnibusRule: boolean;
}

export interface GDPRComplianceConfig {
  enabled: boolean;
  lawfulBasis: boolean;
  dataProtectionOfficer: boolean;
  dataProtectionImpactAssessment: boolean;
  internationalTransfers: boolean;
}

export interface ISO27001ComplianceConfig {
  enabled: boolean;
  informationSecurityPolicy: boolean;
  riskAssessment: boolean;
  securityControls: boolean;
  continuousImprovement: boolean;
}

// Compliance Validation and Monitoring
export interface ComplianceValidator {
  validateMessage(message: EnhancedChatMessage): Promise<ComplianceValidationResult>;
  validateSession(session: EnhancedChatSession): Promise<ComplianceValidationResult>;
  validateData(data: unknown, dataType: string): Promise<ComplianceValidationResult>;
  validateConsent(consentData: ConsentData): Promise<ConsentValidationResult>;
  generateComplianceReport(): Promise<ComplianceReport>;
}

export interface ConsentData {
  patientId: string;
  treatmentTypes: string[];
  dataProcessingPurposes: string[];
  dataRetentionPeriod: string;
  thirdPartySharing: boolean;
  withdrawalMechanism: string;
  givenAt: string;
  expiresAt?: string;
  version: string;
  legalGuardian?: ConsentGuardianInfo;
}

export interface ConsentGuardianInfo {
  name: string;
  relationship: string;
  contact: string;
  id: string;
}

export interface ConsentValidationResult {
  valid: boolean;
  consentId: string;
  patientId: string;
  validationTime: string;
  checks: ConsentValidationCheck[];
  overallScore: number;
  recommendations: string[];
  expiresAt: string;
}

export interface ConsentValidationCheck {
  type: 'existence' | 'validity' | 'scope' | 'freshness' | 'capacity';
  passed: boolean;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface ComplianceReport {
  id: string;
  generatedAt: string;
  period: ComplianceReportPeriod;
  framework: string;
  overallScore: number;
  sections: ComplianceReportSection[];
  recommendations: ComplianceRecommendation[];
  attachments: ComplianceReportAttachment[];
}

export interface ComplianceReportPeriod {
  start: string;
  end: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface ComplianceReportSection {
  title: string;
  score: number;
  details: string;
  findings: ComplianceFinding[];
  metrics: ComplianceMetric[];
}

export interface ComplianceFinding {
  id: string;
  type: 'violation' | 'observation' | 'best_practice' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendation: string;
  evidence: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'deferred';
  assignedTo?: string;
  dueDate?: string;
}

export interface ComplianceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ComplianceRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  implementation: ImplementationPlan;
  benefits: string[];
  estimatedCost?: number;
  estimatedTime?: string;
}

export interface ImplementationPlan {
  steps: ImplementationStep[];
  timeline: string;
  resources: string[];
  dependencies: string[];
  successCriteria: string[];
}

export interface ImplementationStep {
  step: number;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  dependencies?: string[];
}

export interface ComplianceReportAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  description: string;
}

// Compliance Audit Trail
export interface ComplianceAuditTrail {
  id: string;
  timestamp: string;
  action: ComplianceAuditAction;
  user: string;
  resource: string;
  details: ComplianceAuditDetails;
  result: ComplianceAuditResult;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export type ComplianceAuditAction = 
  | 'data_access' 
  | 'data_modification' 
  | 'data_deletion' 
  | 'consent_given' 
  | 'consent_withdrawn' 
  | 'compliance_check' 
  | 'policy_violation' 
  | 'security_incident' 
  | 'breach_notification';

export interface ComplianceAuditDetails {
  dataType?: string;
  dataFields?: string[];
  purpose?: string;
  legalBasis?: string;
  retentionPeriod?: string;
  thirdParties?: string[];
  riskLevel?: string;
  mitigations?: string[];
}

export interface ComplianceAuditResult {
  status: 'success' | 'failure' | 'warning' | 'error';
  message: string;
  complianceScore?: number;
  violations?: ComplianceViolation[];
  recommendations?: string[];
}

export interface ComplianceViolation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  regulatoryReference: string;
  impact: string;
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'deferred';
  assignedTo?: string;
  dueDate?: string;
}

// Compliance Monitoring and Alerting
export interface ComplianceMonitor {
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  checkCompliance(): Promise<ComplianceCheckResult[]>;
  generateAlerts(checkResults: ComplianceCheckResult[]): Promise<ComplianceAlert[]>;
  getComplianceStatus(): Promise<ComplianceStatus>;
}

export interface ComplianceCheckResult {
  id: string;
  checkType: string;
  timestamp: string;
  resource: string;
  result: 'pass' | 'fail' | 'warning';
  score: number;
  details: string;
  violations?: ComplianceViolation[];
  recommendations?: string[];
}

export interface ComplianceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  source: string;
  resource: string;
  actionRequired: boolean;
  dueDate?: string;
  assignedTo?: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
}

export interface ComplianceStatus {
  overallScore: number;
  frameworkScores: Record<string, number>;
  activeViolations: number;
  activeAlerts: number;
  lastCheck: string;
  nextCheck: string;
  trends: ComplianceTrend[];
}

export interface ComplianceTrend {
  metric: string;
  period: string;
  value: number;
  change: number;
  direction: 'improving' | 'stable' | 'declining';
}

// Configuration interfaces
export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  mode: string;
  keyRotationDays: number;
  atRest: boolean;
  inTransit: boolean;
}

export interface AccessControlConfig {
  roleBasedAccess: boolean;
  multiFactorAuthentication: boolean;
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
  auditLogging: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays: number;
  historyCount: number;
}

export interface AuditLoggingConfig {
  enabled: boolean;
  logLevel: 'basic' | 'detailed' | 'comprehensive';
  retentionDays: number;
  includeSensitiveData: boolean;
  realTimeAlerts: boolean;
}

export interface IncidentResponseConfig {
  incidentTypes: string[];
  responseTimeSLA: number;
  escalationProcedures: boolean;
  communicationPlan: boolean;
  testingFrequency: string;
}

export interface StaffTrainingConfig {
  required: boolean;
  frequency: string;
  topics: string[];
  assessmentRequired: boolean;
  recordKeeping: boolean;
}

export interface VendorManagementConfig {
  assessmentRequired: boolean;
  contractReview: boolean;
  monitoring: boolean;
  auditRights: boolean;
}