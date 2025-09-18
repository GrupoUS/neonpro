import { GovernanceService, AuditTrailEntry, CreateAuditTrailEntry, PolicyManagement } from './governance.types';
export type HealthcareMetricType = 'PATIENT_SAFETY' | 'CLINICAL_QUALITY' | 'OPERATIONAL_EFFICIENCY' | 'COMPLIANCE_SCORE' | 'TELEMEDICINE_QUALITY' | 'DATA_SECURITY' | 'RESPONSE_TIME' | 'ERROR_RATE';
export type HealthcareMetricStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW' | 'CRITICAL';
export type HealthcareMetricCategory = 'CFM_COMPLIANCE' | 'ANVISA_COMPLIANCE' | 'PATIENT_SAFETY' | 'CLINICAL_OUTCOMES' | 'OPERATIONAL' | 'SECURITY';
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
    complianceFramework: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    metadata?: Record<string, unknown>;
}
export interface UpdateHealthcareMetric {
    id: string;
    currentValue?: number;
    targetValue?: number;
    threshold?: number;
    status?: HealthcareMetricStatus;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    metadata?: Record<string, unknown>;
}
export interface HealthcarePolicy extends PolicyManagement {
    regulatoryBody: 'CFM' | 'ANVISA' | 'MS' | 'CRM';
    regulationNumber: string;
    applicableServices: string[];
    complianceDeadline?: Date;
    auditFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    criticalityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export interface CreateHealthcarePolicy {
    name: string;
    description: string;
    category: string;
    regulatoryBody: 'CFM' | 'ANVISA' | 'MS' | 'CRM';
    regulationNumber: string;
    applicableServices: string[];
    complianceDeadline?: Date;
    auditFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    criticalityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    content: string;
    metadata?: Record<string, unknown>;
}
export interface PatientSafetyKPI {
    id: string;
    clinicId: string;
    kpiName: string;
    category: 'MEDICATION_SAFETY' | 'DIAGNOSTIC_ACCURACY' | 'TREATMENT_OUTCOMES' | 'INFECTION_CONTROL';
    currentValue: number;
    targetValue: number;
    benchmark: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    alertThreshold: number;
    lastIncident?: Date;
    incidentCount: number;
    mitigationActions: string[];
    responsibleTeam: string;
    reportingFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    createdAt: Date;
    updatedAt: Date;
}
export interface HealthcareAlert {
    id: string;
    clinicId: string;
    alertType: 'COMPLIANCE_VIOLATION' | 'SAFETY_INCIDENT' | 'METRIC_THRESHOLD' | 'POLICY_BREACH';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    source: string;
    triggeredBy: string;
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
    assignedTo?: string;
    escalationLevel: number;
    autoEscalationTime?: Date;
    resolutionDeadline?: Date;
    actions: string[];
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
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
    reportType: 'CFM_TELEMEDICINE' | 'ANVISA_ESTABLISHMENT' | 'PATIENT_SAFETY' | 'COMPREHENSIVE';
    period: {
        startDate: Date;
        endDate: Date;
    };
    overallScore: number;
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW' | 'CRITICAL';
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
export interface HealthcareGovernanceService extends GovernanceService {
    getHealthcareMetrics(clinicId: string, filters?: HealthcareMetricFilters): Promise<HealthcareMetric[]>;
    createHealthcareMetric(metric: CreateHealthcareMetric): Promise<HealthcareMetric>;
    updateHealthcareMetric(update: UpdateHealthcareMetric): Promise<HealthcareMetric>;
    deleteHealthcareMetric(id: string): Promise<void>;
    getPatientSafetyKPIs(clinicId: string): Promise<PatientSafetyKPI[]>;
    updatePatientSafetyKPI(id: string, updates: Partial<PatientSafetyKPI>): Promise<PatientSafetyKPI>;
    getHealthcarePolicies(filters?: HealthcarePolicyFilters): Promise<HealthcarePolicy[]>;
    createHealthcarePolicy(policy: CreateHealthcarePolicy): Promise<HealthcarePolicy>;
    updateHealthcarePolicy(id: string, updates: Partial<HealthcarePolicy>): Promise<HealthcarePolicy>;
    getHealthcareAlerts(clinicId: string, filters?: HealthcareAlertFilters): Promise<HealthcareAlert[]>;
    createHealthcareAlert(alert: Omit<HealthcareAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthcareAlert>;
    updateHealthcareAlert(id: string, updates: Partial<HealthcareAlert>): Promise<HealthcareAlert>;
    generateComplianceReport(clinicId: string, reportType: HealthcareComplianceReport['reportType'], period: {
        startDate: Date;
        endDate: Date;
    }): Promise<HealthcareComplianceReport>;
    getComplianceReports(clinicId: string, filters?: ComplianceReportFilters): Promise<HealthcareComplianceReport[]>;
    createHealthcareAuditEntry(entry: HealthcareAuditEvent): Promise<AuditTrailEntry>;
    getHealthcareDashboardData(clinicId: string): Promise<HealthcareDashboardData>;
}
export interface HealthcareMetricFilters {
    metricType?: HealthcareMetricType;
    category?: HealthcareMetricCategory;
    status?: HealthcareMetricStatus;
    complianceFramework?: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export interface HealthcarePolicyFilters {
    regulatoryBody?: 'CFM' | 'ANVISA' | 'MS' | 'CRM';
    category?: string;
    criticalityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    applicableService?: string;
}
export interface HealthcareAlertFilters {
    alertType?: HealthcareAlert['alertType'];
    severity?: HealthcareAlert['severity'];
    status?: HealthcareAlert['status'];
    assignedTo?: string;
    dateFrom?: Date;
    dateTo?: Date;
}
export interface ComplianceReportFilters {
    reportType?: HealthcareComplianceReport['reportType'];
    complianceStatus?: HealthcareComplianceReport['complianceStatus'];
    dateFrom?: Date;
    dateTo?: Date;
}
export interface HealthcareDashboardData {
    overallComplianceScore: number;
    criticalAlerts: number;
    activeViolations: number;
    patientSafetyScore: number;
    cfmComplianceStatus: {
        score: number;
        status: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW' | 'CRITICAL';
        lastAudit: Date;
        nextAudit: Date;
    };
    anvisaComplianceStatus: {
        score: number;
        status: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW' | 'CRITICAL';
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
//# sourceMappingURL=healthcare-governance.types.d.ts.map