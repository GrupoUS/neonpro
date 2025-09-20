// Healthcare Governance Types for CFM/ANVISA Compliance
// Extends the base governance system with healthcare-specific metrics and policies

import {
  GovernanceService,
  AuditTrailEntry,
  CreateAuditTrailEntry,
  PolicyManagement,
} from "./governance.types";

// Healthcare Metric Enums (matching database schema)
export type HealthcareMetricType =
  | "PATIENT_SAFETY"
  | "CLINICAL_QUALITY"
  | "OPERATIONAL_EFFICIENCY"
  | "COMPLIANCE_SCORE"
  | "TELEMEDICINE_QUALITY"
  | "DATA_SECURITY"
  | "RESPONSE_TIME"
  | "ERROR_RATE";

export type HealthcareMetricStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "UNDER_REVIEW"
  | "CRITICAL";

export type HealthcareMetricCategory =
  | "CFM_COMPLIANCE"
  | "ANVISA_COMPLIANCE"
  | "PATIENT_SAFETY"
  | "CLINICAL_OUTCOMES"
  | "OPERATIONAL"
  | "SECURITY";

// Healthcare Metrics Types
export interface HealthcareMetric {
  id: string;
  clinicId: string;
  metricType: HealthcareMetricType;
  name: string;
  description?: string;
  category: HealthcareMetricCategory;
  currentValue: number;
  targetValue: number;
  threshold: number;
  unit: string;
  status: HealthcareMetricStatus;
  complianceFramework: string; // CFM, ANVISA, etc.
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lastUpdated: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHealthcareMetric {
  clinicId: string;
  metricType: HealthcareMetricType;
  name: string;
  description?: string;
  category: HealthcareMetricCategory;
  currentValue: number;
  targetValue: number;
  threshold: number;
  unit: string;
  status?: HealthcareMetricStatus;
  complianceFramework: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  metadata?: Record<string, unknown>;
}

export interface UpdateHealthcareMetric {
  id: string;
  currentValue?: number;
  targetValue?: number;
  threshold?: number;
  status?: HealthcareMetricStatus;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  metadata?: Record<string, unknown>;
}

// CFM/ANVISA Specific Policy Types
export interface HealthcarePolicy extends PolicyManagement {
  regulatoryBody: "CFM" | "ANVISA" | "MS" | "CRM";
  regulationNumber: string; // e.g., "CFM 2.314/2022", "RDC 302/2005"
  applicableServices: string[]; // telemedicine, clinical_care, etc.
  complianceDeadline?: Date;
  auditFrequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  criticalityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface CreateHealthcarePolicy {
  name: string;
  description: string;
  category: string;
  regulatoryBody: "CFM" | "ANVISA" | "MS" | "CRM";
  regulationNumber: string;
  applicableServices: string[];
  complianceDeadline?: Date;
  auditFrequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  criticalityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  content: string;
  metadata?: Record<string, unknown>;
}

// Patient Safety KPIs
export interface PatientSafetyKPI {
  id: string;
  clinicId: string;
  kpiName: string;
  category:
    | "MEDICATION_SAFETY"
    | "DIAGNOSTIC_ACCURACY"
    | "TREATMENT_OUTCOMES"
    | "INFECTION_CONTROL";
  currentValue: number;
  targetValue: number;
  benchmark: number; // Industry benchmark
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  alertThreshold: number;
  lastIncident?: Date;
  incidentCount: number;
  mitigationActions: string[];
  responsibleTeam: string;
  reportingFrequency: "DAILY" | "WEEKLY" | "MONTHLY";
  createdAt: Date;
  updatedAt: Date;
}

// Real-time Monitoring Types
export interface HealthcareAlert {
  id: string;
  clinicId: string;
  alertType:
    | "COMPLIANCE_VIOLATION"
    | "SAFETY_INCIDENT"
    | "METRIC_THRESHOLD"
    | "POLICY_BREACH";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  source: string; // metric_id, policy_id, etc.
  triggeredBy: string; // user_id or system
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";
  assignedTo?: string;
  escalationLevel: number;
  autoEscalationTime?: Date;
  resolutionDeadline?: Date;
  actions: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Integration Layer Types
export interface HealthcareAuditEvent extends CreateAuditTrailEntry {
  healthcareContext: {
    patientId?: string;
    appointmentId?: string;
    treatmentId?: string;
    medicalRecordId?: string;
    complianceFramework: string;
    clinicalContext?: string;
  };
}

export interface HealthcareComplianceReport {
  id: string;
  clinicId: string;
  reportType:
    | "CFM_TELEMEDICINE"
    | "ANVISA_ESTABLISHMENT"
    | "PATIENT_SAFETY"
    | "COMPREHENSIVE";
  period: {
    startDate: Date;
    endDate: Date;
  };
  overallScore: number;
  complianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "UNDER_REVIEW" | "CRITICAL";
  metrics: HealthcareMetric[];
  violations: {
    count: number;
    critical: number;
    resolved: number;
    pending: number;
  };
  recommendations: string[];
  nextAuditDate: Date;
  generatedBy: string;
  approvedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Healthcare Governance Service Interface
export interface HealthcareGovernanceService extends GovernanceService {
  // Healthcare Metrics
  getHealthcareMetrics(
    clinicId: string,
    filters?: HealthcareMetricFilters,
  ): Promise<HealthcareMetric[]>;
  createHealthcareMetric(
    metric: CreateHealthcareMetric,
  ): Promise<HealthcareMetric>;
  updateHealthcareMetric(
    update: UpdateHealthcareMetric,
  ): Promise<HealthcareMetric>;
  deleteHealthcareMetric(id: string): Promise<void>;

  // Patient Safety KPIs
  getPatientSafetyKPIs(clinicId: string): Promise<PatientSafetyKPI[]>;
  updatePatientSafetyKPI(
    id: string,
    updates: Partial<PatientSafetyKPI>,
  ): Promise<PatientSafetyKPI>;

  // Healthcare Policies (CFM/ANVISA)
  getHealthcarePolicies(
    filters?: HealthcarePolicyFilters,
  ): Promise<HealthcarePolicy[]>;
  createHealthcarePolicy(
    policy: CreateHealthcarePolicy,
  ): Promise<HealthcarePolicy>;
  updateHealthcarePolicy(
    id: string,
    updates: Partial<HealthcarePolicy>,
  ): Promise<HealthcarePolicy>;

  // Real-time Monitoring
  getHealthcareAlerts(
    clinicId: string,
    filters?: HealthcareAlertFilters,
  ): Promise<HealthcareAlert[]>;
  createHealthcareAlert(
    alert: Omit<HealthcareAlert, "id" | "createdAt" | "updatedAt">,
  ): Promise<HealthcareAlert>;
  updateHealthcareAlert(
    id: string,
    updates: Partial<HealthcareAlert>,
  ): Promise<HealthcareAlert>;

  // Compliance Reporting
  generateComplianceReport(
    clinicId: string,
    reportType: HealthcareComplianceReport["reportType"],
    period: { startDate: Date; endDate: Date },
  ): Promise<HealthcareComplianceReport>;
  getComplianceReports(
    clinicId: string,
    filters?: ComplianceReportFilters,
  ): Promise<HealthcareComplianceReport[]>;

  // Integration with Audit System
  createHealthcareAuditEntry(
    entry: HealthcareAuditEvent,
  ): Promise<AuditTrailEntry>;

  // Dashboard Data
  getHealthcareDashboardData(
    clinicId: string,
  ): Promise<HealthcareDashboardData>;
}

// Filter Types
export interface HealthcareMetricFilters {
  metricType?: HealthcareMetricType;
  category?: HealthcareMetricCategory;
  status?: HealthcareMetricStatus;
  complianceFramework?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface HealthcarePolicyFilters {
  regulatoryBody?: "CFM" | "ANVISA" | "MS" | "CRM";
  category?: string;
  criticalityLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  applicableService?: string;
}

export interface HealthcareAlertFilters {
  alertType?: HealthcareAlert["alertType"];
  severity?: HealthcareAlert["severity"];
  status?: HealthcareAlert["status"];
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ComplianceReportFilters {
  reportType?: HealthcareComplianceReport["reportType"];
  complianceStatus?: HealthcareComplianceReport["complianceStatus"];
  dateFrom?: Date;
  dateTo?: Date;
}

// Dashboard Data Types
export interface HealthcareDashboardData {
  overallComplianceScore: number;
  criticalAlerts: number;
  activeViolations: number;
  patientSafetyScore: number;
  cfmComplianceStatus: {
    score: number;
    status: "COMPLIANT" | "NON_COMPLIANT" | "UNDER_REVIEW" | "CRITICAL";
    lastAudit: Date;
    nextAudit: Date;
  };
  anvisaComplianceStatus: {
    score: number;
    status: "COMPLIANT" | "NON_COMPLIANT" | "UNDER_REVIEW" | "CRITICAL";
    lastAudit: Date;
    nextAudit: Date;
  };
  recentMetrics: HealthcareMetric[];
  upcomingDeadlines: {
    policyReviews: number;
    complianceAudits: number;
    certificationRenewals: number;
  };
  trends: {
    complianceScoreTrend: string;
    safetyIncidentTrend: string;
    alertResolutionTrend: string;
  };
}
