// Governance Types for HIPAA/LGPD Compliant Systems
// Generated from database schema - DO NOT EDIT MANUALLY

// Enums matching database schema
export type AuditAction =
  | "VIEW"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "LOGIN"
  | "LOGOUT";
export type ResourceType =
  | "PATIENT_RECORD"
  | "REPORT"
  | "SYSTEM_CONFIG"
  | "USER_ACCOUNT"
  | "HEALTHCARE_METRIC";
export type AuditStatus = "SUCCESS" | "FAILED" | "BLOCKED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type KPIStatus = "ACTIVE" | "ARCHIVED" | "PROVISIONAL";
export type ComplianceFramework = "HIPAA" | "LGPD" | "GDPR" | "SOC2";
export type ComplianceStatusEnum =
  | "COMPLIANT"
  | "NON_COMPLIANT"
  | "UNDER_REVIEW"
  | "CRITICAL";
export type AIModelStatus = "ACTIVE" | "INACTIVE" | "TRAINING" | "DEPRECATED";
export type PolicyStatus = "ACTIVE" | "DRAFT" | "ARCHIVED" | "UNDER_REVIEW";
export type EscalationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type EscalationStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "ESCALATED"
  | "RESOLVED"
  | "CLOSED";

// Audit Trail Types
export interface AuditTrailEntry {
  id: string;
  _userId: string;
  clinicId?: string;
  patientId?: string;
  action: AuditAction;
  resource: string;
  resourceType: ResourceType;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  status: AuditStatus;
  riskLevel: RiskLevel;
  additionalInfo?: string;
  createdAt: Date;
  encryptedDetails?: Record<string, unknown>;
}

export interface CreateAuditTrailEntry {
  _userId: string;
  clinicId?: string;
  patientId?: string;
  action: AuditAction;
  resource: string;
  resourceType: ResourceType;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  status: AuditStatus;
  riskLevel?: RiskLevel;
  additionalInfo?: string;
  encryptedDetails?: Record<string, unknown>;
}

// KPI Metrics Types
export interface KPIMetric {
  id: string;
  name: string;
  description?: string;
  category: string;
  currentValue: number;
  targetValue: number;
  direction: "higher_better" | "lower_better" | "target_exact";
  unit?: string;
  status: KPIStatus;
  threshold?: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateKPIMetric {
  name: string;
  description?: string;
  category: string;
  currentValue: number;
  targetValue: number;
  direction: "higher_better" | "lower_better" | "target_exact";
  unit?: string;
  status?: KPIStatus;
  threshold?: number;
}

export interface UpdateKPIMetric {
  id: string;
  currentValue?: number;
  targetValue?: number;
  threshold?: number;
  status?: KPIStatus;
}

// Compliance Status Types
export interface ComplianceStatus {
  id: string;
  clinicId: string;
  framework: ComplianceFramework;
  score: number;
  status: ComplianceStatusEnum;
  violations: number;
  lastAudit?: Date;
  nextAudit?: Date;
  details?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateComplianceStatus {
  clinicId: string;
  framework: ComplianceFramework;
  score: number;
  status: ComplianceStatusEnum;
  violations?: number;
  lastAudit?: Date;
  nextAudit?: Date;
  details?: Record<string, unknown>;
}

// Risk Assessment Types
export interface RiskAssessment {
  id: string;
  clinicId: string;
  category: string;
  title: string;
  description: string;
  severity: RiskLevel;
  likelihood: RiskLevel;
  impact: RiskLevel;
  status: "Open" | "Mitigated" | "Accepted" | "Transferred";
  mitigation?: string;
  owner?: string;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateRiskAssessment {
  clinicId: string;
  category: string;
  title: string;
  description: string;
  severity: RiskLevel;
  likelihood: RiskLevel;
  impact: RiskLevel;
  status?: "Open" | "Mitigated" | "Accepted" | "Transferred";
  mitigation?: string;
  owner?: string;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
}

// AI Governance Types
export interface AIGovernanceMetric {
  id: string;
  modelName: string;
  modelVersion: string;
  status: AIModelStatus;
  hallucinationRate: number;
  accuracyScore: number;
  biasScore?: number;
  complianceScore: number;
  requestsProcessed: number;
  averageResponseTime?: number;
  errorRate: number;
  lastTrainingDate?: Date;
  modelSize?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAIGovernanceMetric {
  modelName: string;
  modelVersion: string;
  status?: AIModelStatus;
  hallucinationRate: number;
  accuracyScore: number;
  biasScore?: number;
  complianceScore: number;
  requestsProcessed?: number;
  averageResponseTime?: number;
  errorRate?: number;
  lastTrainingDate?: Date;
  modelSize?: string;
  metadata?: Record<string, unknown>;
} // Policy Management Types
export interface PolicyManagement {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: ComplianceFramework;
  status: PolicyStatus;
  version: string;
  enforcementRate: number;
  violationCount: number;
  lastReview?: Date;
  nextReview?: Date;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePolicyManagement {
  name: string;
  description: string;
  category: string;
  framework: ComplianceFramework;
  status?: PolicyStatus;
  version?: string;
  enforcementRate?: number;
  violationCount?: number;
  lastReview?: Date;
  nextReview?: Date;
  content: string;
  metadata?: Record<string, unknown>;
}

// Escalation Workflow Types
export interface EscalationWorkflow {
  id: string;
  _userId: string;
  title: string;
  description: string;
  category: string;
  source: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  assignedTo?: string;
  deadline?: Date;
  escalatedAt?: Date;
  resolvedAt?: Date;
  responseTime?: number;
  resolutionTime?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateEscalationWorkflow {
  _userId: string;
  title: string;
  description: string;
  category: string;
  source: string;
  priority: EscalationPriority;
  status?: EscalationStatus;
  assignedTo?: string;
  deadline?: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateEscalationWorkflow {
  id: string;
  status?: EscalationStatus;
  assignedTo?: string;
  deadline?: Date;
  escalatedAt?: Date;
  resolvedAt?: Date;
  responseTime?: number;
  resolutionTime?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// Dashboard Data Types
export interface KPIOverviewData {
  totalKPIs: number;
  normalizedKPIs: number;
  normalizationRate: number;
  dataQualityScore: number;
  criticalKPIs: number;
  trends: {
    normalizationTrend: string;
    qualityTrend: string;
    criticalTrend: string;
  };
}

export interface ComplianceStatusData {
  hipaaCompliance: {
    score: number;
    status: ComplianceStatusEnum;
    violations: number;
    lastAudit: string;
  };
  lgpdCompliance: {
    score: number;
    status: ComplianceStatusEnum;
    violations: number;
    lastAudit: string;
  };
  overallScore: number;
  criticalViolations: number;
  upcomingDeadlines: number;
  auditStatus: string;
}

// Service Interfaces
export interface GovernanceService {
  // Audit Trail
  createAuditEntry(entry: CreateAuditTrailEntry): Promise<AuditTrailEntry>;
  getAuditTrail(filters?: AuditTrailFilters): Promise<{
    entries: AuditTrailEntry[];
    totalCount: number;
    filteredCount: number;
  }>;

  // KPI Metrics
  getKPIMetrics(): Promise<KPIMetric[]>;
  updateKPIMetric(update: UpdateKPIMetric): Promise<KPIMetric>;

  // Compliance Status
  getComplianceStatus(clinicId: string): Promise<ComplianceStatus[]>;
  updateComplianceStatus(
    id: string,
    updates: Partial<ComplianceStatus>,
  ): Promise<ComplianceStatus>;

  // Risk Assessment
  getRiskAssessments(clinicId: string): Promise<RiskAssessment[]>;
  createRiskAssessment(
    assessment: CreateRiskAssessment,
  ): Promise<RiskAssessment>;

  // AI Governance
  getAIGovernanceMetrics(): Promise<AIGovernanceMetric[]>;
  updateAIGovernanceMetric(
    id: string,
    updates: Partial<AIGovernanceMetric>,
  ): Promise<AIGovernanceMetric>;

  // Policy Management
  getPolicies(): Promise<PolicyManagement[]>;
  updatePolicy(
    id: string,
    updates: Partial<PolicyManagement>,
  ): Promise<PolicyManagement>;

  // Escalation Workflow
  getEscalations(filters?: EscalationFilters): Promise<EscalationWorkflow[]>;
  createEscalation(
    escalation: CreateEscalationWorkflow,
  ): Promise<EscalationWorkflow>;
  updateEscalation(
    update: UpdateEscalationWorkflow,
  ): Promise<EscalationWorkflow>;
}

export interface AuditTrailFilters {
  _userId?: string;
  clinicId?: string;
  action?: AuditAction;
  status?: AuditStatus;
  riskLevel?: RiskLevel;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface EscalationFilters {
  status?: EscalationStatus;
  priority?: EscalationPriority;
  assignedTo?: string;
  category?: string;
}
