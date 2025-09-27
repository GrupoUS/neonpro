// Types for compliance reporting and monitoring

export interface ComplianceMetrics {
  overallScore: number;
  pendingRequests: number;
  incidentCount: number;
  regulatoryCompliance: RegulatoryCompliance[];
  lgpdRequirements: LGPDRequirement[];
  securityValidations: SecurityValidation[];
  auditTrail: AuditEntry[];
  lastAssessment: string;
}

export interface RegulatoryCompliance {
  regulator: 'ANVISA' | 'CFM' | 'LGPD' | 'SAMU';
  description: string;
  score: number;
  status: 'compliant' | 'partial' | 'non_compliant' | 'pending';
  lastAudit: string;
  findings: string[];
}

export interface LGPDRequirement {
  article: string;
  description: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'pending';
  implementation: string;
  evidence: string[];
  lastVerified: string;
}

export interface SecurityValidation {
  check: string;
  description: string;
  details: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastTest: string;
  recommendation?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'warning';
  blockchainHash?: string;
  evidence: string[];
}

export interface ConsentStats {
  totalPatients: number;
  activePatients: number;
  consentedPatients: number;
  consentRate: number;
  byCategory: CategoryStats[];
  recentActivities: RecentActivity[];
  withdrawalStats: WithdrawalStats;
}

export interface CategoryStats {
  category: string;
  total: number;
  consented: number;
  pending: number;
  withdrawn: number;
  lastUpdated: string;
}

export interface RecentActivity {
  id: string;
  type: 'consent_given' | 'consent_withdrawn' | 'data_accessed' | 'rights_exercised';
  description: string;
  patientId: string;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
}

export interface WithdrawalStats {
  totalWithdrawals: number;
  emergencyOverrides: number;
  averageProcessingTime: number; // in seconds
  byReason: WithdrawalReason[];
}

export interface WithdrawalReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface ComplianceReport {
  id: string;
  clinicId: string;
  generatedAt: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  format: 'pdf' | 'json' | 'csv';
  content: string; // Base64 encoded content
  sections: ReportSection[];
  metadata: ReportMetadata;
}

export interface ReportSection {
  title: string;
  content: string;
  charts?: ChartData[];
  tables?: TableData[];
  metrics: number[];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
  labels: string[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
  footnotes?: string[];
}

export interface ReportMetadata {
  generatedBy: string;
  version: string;
  complianceScore: number;
  patientCount: number;
  consentRate: number;
  incidentCount: number;
  regulatoryFindings: number;
  recommendations: string[];
  nextReviewDate: string;
}

export interface DataSubjectRightsRequest {
  id: string;
  patientId: string;
  requestType: 'access' | 'correction' | 'deletion' | 'portability' | 'objection' | 'automated_decision';
  status: 'pending' | 'processing' | 'completed' | 'denied';
  requestedAt: string;
  processedAt?: string;
  details: string;
  evidence: string[];
  response?: string;
  denialReason?: string;
}

export interface ComplianceAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'consent_expired' | 'security_incident' | 'regulatory_change' | 'audit_finding';
  title: string;
  description: string;
  affectedPatients: number;
  recommendedActions: string[];
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface ComplianceSettings {
  autoReportGeneration: boolean;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
  alertThresholds: {
    lowComplianceScore: number;
    highIncidentRate: number;
    pendingRequestsThreshold: number;
  };
  retentionPeriod: number; // days
  blockchainVerification: boolean;
  automatedBackup: boolean;
  notificationRecipients: string[];
}