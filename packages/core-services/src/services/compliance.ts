// ================================================
// COMPLIANCE SERVICE
// Regulatory compliance automation and monitoring
// ================================================

import { createClient } from "@supabase/supabase-js";
import { monitoring } from "./monitoring";

// ================================================
// TYPES AND INTERFACES
// ================================================

interface CompliancePolicy {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: PolicyType;
  category: ComplianceCategory;
  framework: ComplianceFramework;
  rules: ComplianceRule[];
  isActive: boolean;
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  condition: RuleCondition;
  action: RuleAction;
  severity: SeverityLevel;
  isActive: boolean;
  metadata: Record<string, unknown>;
}

interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  dataSource: DataSource;
  logicalOperator?: LogicalOperator;
  nestedConditions?: RuleCondition[];
}

interface RuleAction {
  type: ActionType;
  parameters: Record<string, unknown>;
  autoExecute: boolean;
  notificationRequired: boolean;
  escalationRequired: boolean;
}

// TODO: Implement compliance audit functionality
// interface ComplianceAudit {
//   id: string;
//   tenantId: string;
//   policyId: string;
//   name: string;
//   description: string;
//   type: AuditType;
//   scope: AuditScope;
//   status: AuditStatus;
//   findings: ComplianceFinding[];
//   riskLevel: RiskLevel;
//   startDate: Date;
//   endDate?: Date;
//   completedAt?: Date;
//   nextDueDate?: Date;
//   assessor: string;
//   metadata: Record<string, unknown>;
//   createdAt: Date;
//   updatedAt: Date;
// }

interface ComplianceFinding {
  id: string;
  auditId: string;
  ruleId: string;
  type: FindingType;
  severity: SeverityLevel;
  title: string;
  description: string;
  evidence: ComplianceEvidence[];
  recommendation: string;
  status: FindingStatus;
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  resolution?: string;
  metadata: Record<string, unknown>;
}

interface ComplianceEvidence {
  id: string;
  type: EvidenceType;
  source: string;
  timestamp: Date;
  data: Record<string, unknown>;
  hash: string;
  metadata: Record<string, unknown>;
}

interface ComplianceIncident {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  type: IncidentType;
  category: ComplianceCategory;
  severity: SeverityLevel;
  status: IncidentStatus;
  reportedBy: string;
  assignedTo?: string;
  detectedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  affectedSystems: string[];
  affectedData: DataImpactAssessment;
  containmentActions: ContainmentAction[];
  rootCause?: string;
  remediation: RemediationPlan;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface DataImpactAssessment {
  recordsAffected: number;
  dataTypes: string[];
  sensitivityLevel: SensitivityLevel;
  jurisdictions: string[];
  estimatedImpact: ImpactLevel;
  notificationRequired: boolean;
  regulatoryReportingRequired: boolean;
}

interface ContainmentAction {
  id: string;
  type: string;
  description: string;
  executedAt: Date;
  executedBy: string;
  effectiveness: EffectivenessLevel;
  metadata: Record<string, unknown>;
}

interface RemediationPlan {
  actions: RemediationAction[];
  timeline: string;
  responsibleParty: string;
  estimatedCost?: number;
  approvalRequired: boolean;
  status: RemediationStatus;
}

interface RemediationAction {
  id: string;
  description: string;
  type: string;
  priority: PriorityLevel;
  dueDate: Date;
  assignedTo: string;
  status: ActionStatus;
  completedAt?: Date;
  notes?: string;
}

interface ConsentRecord {
  id: string;
  tenantId: string;
  dataSubjectId: string;
  dataSubjectType: DataSubjectType;
  purpose: string;
  legalBasis: LegalBasis;
  dataCategories: string[];
  processingActivities: string[];
  consentGiven: boolean;
  consentDate: Date;
  consentMethod: ConsentMethod;
  consentVersion: string;
  withdrawalDate?: Date;
  withdrawalMethod?: string;
  retentionPeriod: number;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface DataSubjectRequest {
  id: string;
  tenantId: string;
  dataSubjectId: string;
  requestType: DataSubjectRequestType;
  status: RequestStatus;
  description: string;
  receivedAt: Date;
  dueDate: Date;
  completedAt?: Date;
  response?: string;
  attachments: string[];
  processedBy?: string;
  verificationMethod: VerificationMethod;
  verificationStatus: VerificationStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface ComplianceReport {
  id: string;
  tenantId: string;
  name: string;
  type: ReportType;
  framework: ComplianceFramework;
  period: ReportPeriod;
  status: ReportStatus;
  data: Record<string, unknown>;
  generatedAt?: Date;
  generatedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  submittedAt?: Date;
  submittedTo?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface ComplianceMetrics {
  policyCompliance: number;
  incidentCount: number;
  findingCount: number;
  riskScore: number;
  consentRate: number;
  responseTime: number;
  auditScore: number;
  trendsAnalysis: TrendsAnalysis;
  riskBreakdown: RiskBreakdown;
  complianceByFramework: Record<ComplianceFramework, FrameworkCompliance>;
}

interface TrendsAnalysis {
  incidentTrend: TrendData[];
  complianceTrend: TrendData[];
  riskTrend: TrendData[];
}

interface TrendData {
  period: string;
  value: number;
  change: number;
}

interface RiskBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface FrameworkCompliance {
  score: number;
  policies: number;
  violations: number;
  lastAssessment: Date;
}

// ================================================
// ENUMS
// ================================================

enum PolicyType {
  PRIVACY = "privacy",
  SECURITY = "security",
  DATA_RETENTION = "data_retention",
  ACCESS_CONTROL = "access_control",
  AUDIT = "audit",
  INCIDENT_RESPONSE = "incident_response",
  TRAINING = "training",
  VENDOR_MANAGEMENT = "vendor_management",
}

enum ComplianceCategory {
  DATA_PROTECTION = "data_protection",
  HEALTHCARE = "healthcare",
  FINANCIAL = "financial",
  SECURITY = "security",
  OPERATIONAL = "operational",
  ENVIRONMENTAL = "environmental",
  QUALITY = "quality",
}

enum ComplianceFramework {
  LGPD = "lgpd",
  GDPR = "gdpr",
  ANVISA = "anvisa",
  CFM = "cfm",
  ISO27001 = "iso27001",
  HIPAA = "hipaa",
  SOX = "sox",
  PCI_DSS = "pci_dss",
  CUSTOM = "custom",
}

enum RuleType {
  PREVENTIVE = "preventive",
  DETECTIVE = "detective",
  CORRECTIVE = "corrective",
  COMPENSATING = "compensating",
}

enum ConditionOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  GREATER_EQUAL = "greater_equal",
  LESS_EQUAL = "less_equal",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  IN = "in",
  NOT_IN = "not_in",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
  REGEX = "regex",
}

enum DataSource {
  DATABASE = "database",
  LOG_FILE = "log_file",
  API = "api",
  FILE_SYSTEM = "file_system",
  EXTERNAL = "external",
}

enum LogicalOperator {
  AND = "and",
  OR = "or",
  NOT = "not",
}

enum ActionType {
  BLOCK = "block",
  ALERT = "alert",
  LOG = "log",
  QUARANTINE = "quarantine",
  ENCRYPT = "encrypt",
  DELETE = "delete",
  BACKUP = "backup",
  NOTIFY = "notify",
}

enum SeverityLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFO = "info",
}

enum AuditType {
  INTERNAL = "internal",
  EXTERNAL = "external",
  REGULATORY = "regulatory",
  CERTIFICATION = "certification",
  CONTINUOUS = "continuous",
}

enum AuditScope {
  FULL = "full",
  PARTIAL = "partial",
  FOCUSED = "focused",
  FOLLOW_UP = "follow_up",
}

enum AuditStatus {
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PENDING_REVIEW = "pending_review",
}

enum RiskLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

enum FindingType {
  NON_COMPLIANCE = "non_compliance",
  WEAKNESS = "weakness",
  OPPORTUNITY = "opportunity",
  BEST_PRACTICE = "best_practice",
}

enum FindingStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  ACCEPTED = "accepted",
  DEFERRED = "deferred",
}

enum EvidenceType {
  DOCUMENT = "document",
  SCREENSHOT = "screenshot",
  LOG_ENTRY = "log_entry",
  DATABASE_RECORD = "database_record",
  AUDIT_TRAIL = "audit_trail",
  WITNESS_STATEMENT = "witness_statement",
}

enum IncidentType {
  DATA_BREACH = "data_breach",
  PRIVACY_VIOLATION = "privacy_violation",
  SECURITY_INCIDENT = "security_incident",
  POLICY_VIOLATION = "policy_violation",
  SYSTEM_FAILURE = "system_failure",
  HUMAN_ERROR = "human_error",
  EXTERNAL_THREAT = "external_threat",
}

enum IncidentStatus {
  REPORTED = "reported",
  INVESTIGATING = "investigating",
  CONTAINED = "contained",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

enum SensitivityLevel {
  PUBLIC = "public",
  INTERNAL = "internal",
  CONFIDENTIAL = "confidential",
  RESTRICTED = "restricted",
}

enum ImpactLevel {
  MINIMAL = "minimal",
  MINOR = "minor",
  MODERATE = "moderate",
  MAJOR = "major",
  CATASTROPHIC = "catastrophic",
}

enum EffectivenessLevel {
  INEFFECTIVE = "ineffective",
  PARTIALLY_EFFECTIVE = "partially_effective",
  EFFECTIVE = "effective",
  HIGHLY_EFFECTIVE = "highly_effective",
}

enum RemediationStatus {
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

enum PriorityLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

enum ActionStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

enum DataSubjectType {
  PATIENT = "patient",
  EMPLOYEE = "employee",
  CUSTOMER = "customer",
  VENDOR = "vendor",
  OTHER = "other",
}

enum LegalBasis {
  CONSENT = "consent",
  CONTRACT = "contract",
  LEGAL_OBLIGATION = "legal_obligation",
  VITAL_INTERESTS = "vital_interests",
  PUBLIC_TASK = "public_task",
  LEGITIMATE_INTERESTS = "legitimate_interests",
}

enum ConsentMethod {
  ELECTRONIC = "electronic",
  WRITTEN = "written",
  VERBAL = "verbal",
  IMPLIED = "implied",
}

enum DataSubjectRequestType {
  ACCESS = "access",
  RECTIFICATION = "rectification",
  ERASURE = "erasure",
  PORTABILITY = "portability",
  RESTRICTION = "restriction",
  OBJECTION = "objection",
}

enum RequestStatus {
  RECEIVED = "received",
  VERIFIED = "verified",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  REJECTED = "rejected",
  EXTENDED = "extended",
}

enum VerificationMethod {
  DOCUMENT = "document",
  EMAIL = "email",
  PHONE = "phone",
  IN_PERSON = "in_person",
  BIOMETRIC = "biometric",
}

enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  FAILED = "failed",
  EXPIRED = "expired",
}

enum ReportType {
  COMPLIANCE_SUMMARY = "compliance_summary",
  INCIDENT_REPORT = "incident_report",
  AUDIT_REPORT = "audit_report",
  RISK_ASSESSMENT = "risk_assessment",
  DATA_BREACH_NOTIFICATION = "data_breach_notification",
  REGULATORY_FILING = "regulatory_filing",
}

enum ReportPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUALLY = "annually",
  CUSTOM = "custom",
}

enum ReportStatus {
  DRAFT = "draft",
  PENDING_REVIEW = "pending_review",
  APPROVED = "approved",
  SUBMITTED = "submitted",
  REJECTED = "rejected",
}

// ================================================
// REQUEST/RESPONSE TYPES
// ================================================

interface CreatePolicyRequest {
  tenantId: string;
  name: string;
  description: string;
  type: PolicyType;
  category: ComplianceCategory;
  framework: ComplianceFramework;
  rules: Omit<ComplianceRule, "id">[];
  effectiveDate: Date;
  expiryDate?: Date;
  metadata?: Record<string, unknown>;
}

interface CreateAuditRequest {
  tenantId: string;
  policyId: string;
  name: string;
  description: string;
  type: AuditType;
  scope: AuditScope;
  startDate: Date;
  endDate?: Date;
  assessor: string;
  metadata?: Record<string, unknown>;
}

interface ReportIncidentRequest {
  tenantId: string;
  title: string;
  description: string;
  type: IncidentType;
  category: ComplianceCategory;
  severity: SeverityLevel;
  affectedSystems: string[];
  affectedData: Omit<
    DataImpactAssessment,
    "notificationRequired" | "regulatoryReportingRequired"
  >;
  metadata?: Record<string, unknown>;
}

interface CreateConsentRequest {
  tenantId: string;
  dataSubjectId: string;
  dataSubjectType: DataSubjectType;
  purpose: string;
  legalBasis: LegalBasis;
  dataCategories: string[];
  processingActivities: string[];
  consentMethod: ConsentMethod;
  consentVersion: string;
  retentionPeriod: number;
  metadata?: Record<string, unknown>;
}

interface DataSubjectRequestRequest {
  tenantId: string;
  dataSubjectId: string;
  requestType: DataSubjectRequestType;
  description: string;
  verificationMethod: VerificationMethod;
  metadata?: Record<string, unknown>;
}

interface ComplianceFilters {
  tenantId?: string;
  framework?: ComplianceFramework;
  category?: ComplianceCategory;
  severity?: SeverityLevel;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ================================================
// COMPLIANCE SERVICE
// ================================================

export class ComplianceService {
  private static instance: ComplianceService;
  private readonly supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  );

  private constructor() {
    this.initializeConfiguration();
  }

  public static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  // ================================================
  // POLICY MANAGEMENT
  // ================================================

  async createPolicy(
    request: CreatePolicyRequest,
    userId: string,
  ): Promise<CompliancePolicy> {
    try {
      monitoring.info("Creating compliance policy", "compliance-service", {
        tenantId: request.tenantId,
        name: request.name,
        framework: request.framework,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      // Generate version
      const version = this.generatePolicyVersion();

      const policyData = {
        tenant_id: request.tenantId,
        name: request.name,
        description: request.description,
        type: request.type,
        category: request.category,
        framework: request.framework,
        rules: request.rules,
        is_active: true,
        version,
        effective_date: request.effectiveDate.toISOString(),
        expiry_date: request.expiryDate?.toISOString(),
        metadata: request.metadata || {},
        created_by: userId,
      };

      const { data, error } = await this.supabase
        .from("compliance_policies")
        .insert(policyData)
        .select()
        .single();

      if (error) {
        monitoring.error(
          "Policy creation failed",
          "compliance-service",
          new Error(error.message),
          {
            tenantId: request.tenantId,
          },
        );
        throw new Error(error.message);
      }

      const policy = this.mapPolicyFromDb(data);

      // Create audit trail
      await this.createAuditTrail(
        request.tenantId,
        "policy_created",
        `Policy "${policy.name}" created`,
        { policyId: policy.id },
        userId,
      );

      monitoring.info("Policy created successfully", "compliance-service", {
        policyId: policy.id,
        tenantId: policy.tenantId,
      });

      return policy;
    } catch (error) {
      monitoring.error(
        "Create policy error",
        "compliance-service",
        error as Error,
        {
          tenantId: request.tenantId,
          name: request.name,
        },
      );
      throw error;
    }
  }

  async getPolicy(
    policyId: string,
    userId: string,
  ): Promise<CompliancePolicy | null> {
    try {
      const { data, error } = await this.supabase
        .from("compliance_policies")
        .select("*")
        .eq("id", policyId)
        .single();

      if (error || !data) {
        return;
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, data.tenant_id);

      return this.mapPolicyFromDb(data);
    } catch (error) {
      monitoring.error(
        "Get policy error",
        "compliance-service",
        error as Error,
        { policyId },
      );
      return;
    }
  }

  async searchPolicies(
    filters: ComplianceFilters,
    userId: string,
  ): Promise<{ policies: CompliancePolicy[]; total: number; }> {
    try {
      monitoring.debug("Searching compliance policies", "compliance-service", {
        filters,
      });

      // Validate tenant access if specified
      if (filters.tenantId) {
        await this.validateTenantAccess(userId, filters.tenantId);
      }

      let query = this.supabase
        .from("compliance_policies")
        .select("*", { count: "exact" });

      // Apply filters
      if (filters.tenantId) {
        query = query.eq("tenant_id", filters.tenantId);
      }

      if (filters.framework) {
        query = query.eq("framework", filters.framework);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo.toISOString());
      }

      // Apply sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const limit = Math.min(filters.limit || 50, 100);
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const policies = data.map(this.mapPolicyFromDb);

      return { policies, total: count || 0 };
    } catch (error) {
      monitoring.error(
        "Search policies error",
        "compliance-service",
        error as Error,
        { filters },
      );
      throw error;
    }
  }

  // ================================================
  // INCIDENT MANAGEMENT
  // ================================================

  async reportIncident(
    request: ReportIncidentRequest,
    userId: string,
  ): Promise<ComplianceIncident> {
    try {
      monitoring.info("Reporting compliance incident", "compliance-service", {
        tenantId: request.tenantId,
        type: request.type,
        severity: request.severity,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      // Assess impact and regulatory requirements
      const impactAssessment = await this.assessDataImpact(
        request.affectedData,
      );

      const incidentData = {
        tenant_id: request.tenantId,
        title: request.title,
        description: request.description,
        type: request.type,
        category: request.category,
        severity: request.severity,
        status: IncidentStatus.REPORTED,
        reported_by: userId,
        detected_at: new Date().toISOString(),
        affected_systems: request.affectedSystems,
        affected_data: impactAssessment,
        containment_actions: [],
        remediation: {
          actions: [],
          timeline: "",
          responsibleParty: userId,
          approvalRequired: request.severity === SeverityLevel.CRITICAL,
          status: RemediationStatus.PLANNED,
        },
        metadata: request.metadata || {},
      };

      const { data, error } = await this.supabase
        .from("compliance_incidents")
        .insert(incidentData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const incident = this.mapIncidentFromDb(data);

      // Auto-assign based on severity
      if (
        incident.severity === SeverityLevel.CRITICAL
        || incident.severity === SeverityLevel.HIGH
      ) {
        await this.autoAssignIncident(incident.id, request.tenantId);
      }

      // Create notifications
      await this.createIncidentNotifications(incident);

      // Check for regulatory reporting requirements
      if (impactAssessment.regulatoryReportingRequired) {
        await this.initiateRegulatoryReporting(incident);
      }

      // Create audit trail
      await this.createAuditTrail(
        request.tenantId,
        "incident_reported",
        `Incident "${incident.title}" reported`,
        { incidentId: incident.id, severity: incident.severity },
        userId,
      );

      monitoring.info("Incident reported successfully", "compliance-service", {
        incidentId: incident.id,
        tenantId: incident.tenantId,
        severity: incident.severity,
      });

      return incident;
    } catch (error) {
      monitoring.error(
        "Report incident error",
        "compliance-service",
        error as Error,
        {
          tenantId: request.tenantId,
          type: request.type,
        },
      );
      throw error;
    }
  }

  async acknowledgeIncident(
    incidentId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("compliance_incidents")
        .update({
          status: IncidentStatus.INVESTIGATING,
          assigned_to: userId,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", incidentId);

      if (!error) {
        await this.createAuditTrail(
          "", // Will be filled from incident data
          "incident_acknowledged",
          "Incident acknowledged by user",
          { incidentId, userId },
          userId,
        );
      }

      return !error;
    } catch (error) {
      monitoring.error(
        "Acknowledge incident error",
        "compliance-service",
        error as Error,
        {
          incidentId,
          userId,
        },
      );
      return false;
    }
  }

  // ================================================
  // CONSENT MANAGEMENT
  // ================================================

  async recordConsent(
    request: CreateConsentRequest,
    userId: string,
  ): Promise<ConsentRecord> {
    try {
      monitoring.info("Recording consent", "compliance-service", {
        tenantId: request.tenantId,
        dataSubjectId: request.dataSubjectId,
        purpose: request.purpose,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      const consentData = {
        tenant_id: request.tenantId,
        data_subject_id: request.dataSubjectId,
        data_subject_type: request.dataSubjectType,
        purpose: request.purpose,
        legal_basis: request.legalBasis,
        data_categories: request.dataCategories,
        processing_activities: request.processingActivities,
        consent_given: true,
        consent_date: new Date().toISOString(),
        consent_method: request.consentMethod,
        consent_version: request.consentVersion,
        retention_period: request.retentionPeriod,
        is_active: true,
        metadata: request.metadata || {},
      };

      const { data, error } = await this.supabase
        .from("consent_records")
        .insert(consentData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const consent = this.mapConsentFromDb(data);

      // Create audit trail
      await this.createAuditTrail(
        request.tenantId,
        "consent_recorded",
        `Consent recorded for ${request.dataSubjectId}`,
        { consentId: consent.id, purpose: request.purpose },
        userId,
      );

      monitoring.info("Consent recorded successfully", "compliance-service", {
        consentId: consent.id,
        dataSubjectId: consent.dataSubjectId,
      });

      return consent;
    } catch (error) {
      monitoring.error(
        "Record consent error",
        "compliance-service",
        error as Error,
        {
          tenantId: request.tenantId,
          dataSubjectId: request.dataSubjectId,
        },
      );
      throw error;
    }
  }

  async withdrawConsent(
    consentId: string,
    method: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("consent_records")
        .update({
          consent_given: false,
          withdrawal_date: new Date().toISOString(),
          withdrawal_method: method,
          is_active: false,
        })
        .eq("id", consentId);

      if (!error) {
        await this.createAuditTrail(
          "", // Will be filled from consent data
          "consent_withdrawn",
          "Consent withdrawn",
          { consentId, method },
          userId,
        );
      }

      return !error;
    } catch (error) {
      monitoring.error(
        "Withdraw consent error",
        "compliance-service",
        error as Error,
        {
          consentId,
          userId,
        },
      );
      return false;
    }
  }

  // ================================================
  // DATA SUBJECT REQUESTS
  // ================================================

  async createDataSubjectRequest(
    request: DataSubjectRequestRequest,
    userId: string,
  ): Promise<DataSubjectRequest> {
    try {
      monitoring.info("Creating data subject request", "compliance-service", {
        tenantId: request.tenantId,
        dataSubjectId: request.dataSubjectId,
        requestType: request.requestType,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      // Calculate due date (30 days for LGPD/GDPR)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const requestData = {
        tenant_id: request.tenantId,
        data_subject_id: request.dataSubjectId,
        request_type: request.requestType,
        status: RequestStatus.RECEIVED,
        description: request.description,
        received_at: new Date().toISOString(),
        due_date: dueDate.toISOString(),
        attachments: [],
        verification_method: request.verificationMethod,
        verification_status: VerificationStatus.PENDING,
        metadata: request.metadata || {},
      };

      const { data, error } = await this.supabase
        .from("data_subject_requests")
        .insert(requestData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const dsRequest = this.mapDataSubjectRequestFromDb(data);

      // Create notifications for compliance team
      await this.createDataSubjectRequestNotifications(dsRequest);

      // Create audit trail
      await this.createAuditTrail(
        request.tenantId,
        "data_subject_request_created",
        `Data subject request created: ${request.requestType}`,
        { requestId: dsRequest.id, dataSubjectId: request.dataSubjectId },
        userId,
      );

      monitoring.info(
        "Data subject request created successfully",
        "compliance-service",
        {
          requestId: dsRequest.id,
          dataSubjectId: dsRequest.dataSubjectId,
          requestType: dsRequest.requestType,
        },
      );

      return dsRequest;
    } catch (error) {
      monitoring.error(
        "Create data subject request error",
        "compliance-service",
        error as Error,
        {
          tenantId: request.tenantId,
          dataSubjectId: request.dataSubjectId,
          requestType: request.requestType,
        },
      );
      throw error;
    }
  }

  async processDataSubjectRequest(
    requestId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      // Implementation would handle the specific request type
      // For now, we'll mark it as in progress
      const { error } = await this.supabase
        .from("data_subject_requests")
        .update({
          status: RequestStatus.IN_PROGRESS,
          processed_by: userId,
        })
        .eq("id", requestId);

      return !error;
    } catch (error) {
      monitoring.error(
        "Process data subject request error",
        "compliance-service",
        error as Error,
        {
          requestId,
          userId,
        },
      );
      return false;
    }
  }

  // ================================================
  // COMPLIANCE METRICS AND REPORTING
  // ================================================

  async getComplianceMetrics(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    userId: string,
  ): Promise<ComplianceMetrics> {
    try {
      monitoring.debug("Getting compliance metrics", "compliance-service", {
        tenantId,
        periodStart,
        periodEnd,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, tenantId);

      // Get policy compliance metrics
      const { data: policies } = await this.supabase
        .from("compliance_policies")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true);

      // Get incident metrics
      const { data: incidents } = await this.supabase
        .from("compliance_incidents")
        .select("severity, status, detected_at")
        .eq("tenant_id", tenantId)
        .gte("detected_at", periodStart.toISOString())
        .lte("detected_at", periodEnd.toISOString());

      // Get audit findings
      const { data: findings } = await this.supabase
        .from("compliance_findings")
        .select("severity, status")
        .eq("tenant_id", tenantId)
        .gte("created_at", periodStart.toISOString())
        .lte("created_at", periodEnd.toISOString());

      // Get consent metrics
      const { data: consents } = await this.supabase
        .from("consent_records")
        .select("consent_given, created_at")
        .eq("tenant_id", tenantId)
        .gte("created_at", periodStart.toISOString())
        .lte("created_at", periodEnd.toISOString());

      // Calculate metrics
      const policyCompliance = this.calculatePolicyCompliance(policies || []);
      const incidentCount = incidents?.length || 0;
      const findingCount = findings?.length || 0;
      const riskScore = this.calculateRiskScore(
        incidents || [],
        findings || [],
      );
      const consentRate = this.calculateConsentRate(consents || []);
      const responseTime = await this.calculateAverageResponseTime(
        tenantId,
        periodStart,
        periodEnd,
      );
      const auditScore = this.calculateAuditScore(findings || []);

      // Create trends analysis
      const trendsAnalysis = await this.createTrendsAnalysis(
        tenantId,
        periodStart,
        periodEnd,
      );

      // Create risk breakdown
      const riskBreakdown = this.createRiskBreakdown(
        incidents || [],
        findings || [],
      );

      // Create compliance by framework
      const complianceByFramework = await this.createComplianceByFramework(tenantId);

      return {
        policyCompliance,
        incidentCount,
        findingCount,
        riskScore,
        consentRate,
        responseTime,
        auditScore,
        trendsAnalysis,
        riskBreakdown,
        complianceByFramework,
      };
    } catch (error) {
      monitoring.error(
        "Get compliance metrics error",
        "compliance-service",
        error as Error,
        {
          tenantId,
          periodStart,
          periodEnd,
        },
      );
      throw error;
    }
  }

  // ================================================
  // PRIVATE HELPER METHODS
  // ================================================

  private async initializeConfiguration(): Promise<void> {
    // Initialize compliance service configuration
  }

  private async validateTenantAccess(
    _userId: string,
    _tenantId: string,
  ): Promise<void> {
    // Implementation would validate user has access to tenant
    // For now, we'll assume the auth service handles this
  }

  private generatePolicyVersion(): string {
    return `v${Date.now()}`;
  }

  private async createAuditTrail(
    tenantId: string,
    event: string,
    description: string,
    data: Record<string, unknown>,
    userId: string,
  ): Promise<void> {
    try {
      await this.supabase.from("audit_trail").insert({
        tenant_id: tenantId,
        event,
        description,
        data,
        created_by: userId,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      monitoring.error(
        "Create audit trail error",
        "compliance-service",
        error as Error,
        {
          tenantId,
          event,
        },
      );
    }
  }

  private async assessDataImpact(
    affectedData: Omit<
      DataImpactAssessment,
      "notificationRequired" | "regulatoryReportingRequired"
    >,
  ): Promise<DataImpactAssessment> {
    // Assess notification and regulatory reporting requirements
    const notificationRequired = affectedData.recordsAffected > 100
      || affectedData.sensitivityLevel === SensitivityLevel.RESTRICTED;

    const regulatoryReportingRequired = affectedData.recordsAffected > 500
      || affectedData.sensitivityLevel === SensitivityLevel.RESTRICTED
      || affectedData.estimatedImpact === ImpactLevel.MAJOR
      || affectedData.estimatedImpact === ImpactLevel.CATASTROPHIC;

    return {
      ...affectedData,
      notificationRequired,
      regulatoryReportingRequired,
    };
  }

  private async autoAssignIncident(
    incidentId: string,
    tenantId: string,
  ): Promise<void> {
    // Implementation would auto-assign to appropriate compliance officer
    monitoring.info("Auto-assigning incident", "compliance-service", {
      incidentId,
      tenantId,
    });
  }

  private async createIncidentNotifications(
    incident: ComplianceIncident,
  ): Promise<void> {
    // Create notifications for incident
    monitoring.info("Creating incident notifications", "compliance-service", {
      incidentId: incident.id,
      severity: incident.severity,
    });
  }

  private async initiateRegulatoryReporting(
    incident: ComplianceIncident,
  ): Promise<void> {
    // Initiate regulatory reporting process
    monitoring.info("Initiating regulatory reporting", "compliance-service", {
      incidentId: incident.id,
    });
  }

  private async createDataSubjectRequestNotifications(
    request: DataSubjectRequest,
  ): Promise<void> {
    // Create notifications for data subject request
    monitoring.info(
      "Creating data subject request notifications",
      "compliance-service",
      {
        requestId: request.id,
        requestType: request.requestType,
      },
    );
  }

  private calculatePolicyCompliance(policies: unknown[]): number {
    if (policies.length === 0) {
      return 100;
    }

    const activePolicies = policies.filter((p) => p.is_active);
    return (activePolicies.length / policies.length) * 100;
  }

  private calculateRiskScore(
    incidents: unknown[],
    findings: unknown[],
  ): number {
    let score = 0;

    incidents.forEach((incident) => {
      switch (incident.severity) {
        case SeverityLevel.CRITICAL: {
          score += 10;
          break;
        }
        case SeverityLevel.HIGH: {
          score += 7;
          break;
        }
        case SeverityLevel.MEDIUM: {
          score += 4;
          break;
        }
        case SeverityLevel.LOW: {
          score += 1;
          break;
        }
      }
    });

    findings.forEach((finding) => {
      switch (finding.severity) {
        case SeverityLevel.CRITICAL: {
          score += 5;
          break;
        }
        case SeverityLevel.HIGH: {
          score += 3;
          break;
        }
        case SeverityLevel.MEDIUM: {
          score += 2;
          break;
        }
        case SeverityLevel.LOW: {
          score += 1;
          break;
        }
      }
    });

    return Math.min(score, 100);
  }

  private calculateConsentRate(consents: unknown[]): number {
    if (consents.length === 0) {
      return 0;
    }

    const givenConsents = consents.filter((c) => c.consent_given);
    return (givenConsents.length / consents.length) * 100;
  }

  private async calculateAverageResponseTime(
    _tenantId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<number> {
    // Calculate average response time for incidents/requests
    return 24; // hours (mock)
  }

  private calculateAuditScore(findings: unknown[]): number {
    if (findings.length === 0) {
      return 100;
    }

    const resolvedFindings = findings.filter(
      (f) => f.status === FindingStatus.RESOLVED,
    );
    return (resolvedFindings.length / findings.length) * 100;
  }

  private async createTrendsAnalysis(
    _tenantId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<TrendsAnalysis> {
    // Create trends analysis (simplified)
    return {
      incidentTrend: [],
      complianceTrend: [],
      riskTrend: [],
    };
  }

  private createRiskBreakdown(
    incidents: unknown[],
    findings: unknown[],
  ): RiskBreakdown {
    const breakdown = { critical: 0, high: 0, medium: 0, low: 0 };

    [...incidents, ...findings].forEach((item) => {
      switch (item.severity) {
        case SeverityLevel.CRITICAL: {
          breakdown.critical++;
          break;
        }
        case SeverityLevel.HIGH: {
          breakdown.high++;
          break;
        }
        case SeverityLevel.MEDIUM: {
          breakdown.medium++;
          break;
        }
        case SeverityLevel.LOW: {
          breakdown.low++;
          break;
        }
      }
    });

    return breakdown;
  }

  private async createComplianceByFramework(
    _tenantId: string,
  ): Promise<Record<ComplianceFramework, FrameworkCompliance>> {
    // Create compliance breakdown by framework (simplified)
    const frameworks: Record<ComplianceFramework, FrameworkCompliance> = {} as unknown;

    Object.values(ComplianceFramework).forEach((framework) => {
      frameworks[framework] = {
        score: 85, // Mock score
        policies: 0,
        violations: 0,
        lastAssessment: new Date(),
      };
    });

    return frameworks;
  }

  private mapPolicyFromDb(data: unknown): CompliancePolicy {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      framework: data.framework,
      rules: data.rules || [],
      isActive: data.is_active,
      version: data.version,
      effectiveDate: new Date(data.effective_date),
      expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
    };
  }

  private mapIncidentFromDb(data: unknown): ComplianceIncident {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      severity: data.severity,
      status: data.status,
      reportedBy: data.reported_by,
      assignedTo: data.assigned_to,
      detectedAt: new Date(data.detected_at),
      acknowledgedAt: data.acknowledged_at
        ? new Date(data.acknowledged_at)
        : undefined,
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      affectedSystems: data.affected_systems || [],
      affectedData: data.affected_data || {},
      containmentActions: data.containment_actions || [],
      rootCause: data.root_cause,
      remediation: data.remediation || {},
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapConsentFromDb(data: unknown): ConsentRecord {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      dataSubjectId: data.data_subject_id,
      dataSubjectType: data.data_subject_type,
      purpose: data.purpose,
      legalBasis: data.legal_basis,
      dataCategories: data.data_categories || [],
      processingActivities: data.processing_activities || [],
      consentGiven: data.consent_given,
      consentDate: new Date(data.consent_date),
      consentMethod: data.consent_method,
      consentVersion: data.consent_version,
      withdrawalDate: data.withdrawal_date
        ? new Date(data.withdrawal_date)
        : undefined,
      withdrawalMethod: data.withdrawal_method,
      retentionPeriod: data.retention_period,
      isActive: data.is_active,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDataSubjectRequestFromDb(data: unknown): DataSubjectRequest {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      dataSubjectId: data.data_subject_id,
      requestType: data.request_type,
      status: data.status,
      description: data.description,
      receivedAt: new Date(data.received_at),
      dueDate: new Date(data.due_date),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      response: data.response,
      attachments: data.attachments || [],
      processedBy: data.processed_by,
      verificationMethod: data.verification_method,
      verificationStatus: data.verification_status,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// ================================================
// COMPLIANCE SERVICE INSTANCE
// ================================================

export const complianceService = ComplianceService.getInstance();
