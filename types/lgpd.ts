// LGPD Types and Interfaces

export interface LGPDMetrics {
  compliance_percentage: number;
  active_consents: number;
  pending_requests: number;
  active_breaches: number;
  total_users: number;
  consent_rate: number;
  avg_response_time: number;
  last_assessment: string | null;
}

export interface ConsentPurpose {
  id: string;
  name: string;
  description: string;
  category: string;
  required: boolean;
  retention_period: number | null;
  legal_basis: string;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserConsent {
  id: string;
  user_id: string;
  purpose_id: string;
  granted: boolean;
  granted_at: string | null;
  withdrawn_at: string | null;
  expires_at: string | null;
  version: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  purpose?: ConsentPurpose;
}

export interface DataSubjectRequest {
  id: string;
  user_id: string;
  request_type: DataSubjectRequestType;
  status: DataSubjectRequestStatus;
  description: string | null;
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
  response_data: any | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DataSubjectRequestType =
  | "access"
  | "rectification"
  | "erasure"
  | "portability"
  | "restriction"
  | "objection";

export type DataSubjectRequestStatus = "pending" | "in_progress" | "completed" | "rejected";

export interface BreachIncident {
  id: string;
  title: string;
  description: string;
  severity: BreachSeverity;
  status: BreachStatus;
  affected_users: number;
  data_types: string[];
  discovered_at: string;
  reported_at: string | null;
  resolved_at: string | null;
  reported_by: string;
  assigned_to: string | null;
  authority_notified: boolean;
  users_notified: boolean;
  mitigation_steps: string | null;
  created_at: string;
  updated_at: string;
}

export type BreachSeverity = "low" | "medium" | "high" | "critical";
export type BreachStatus = "reported" | "investigating" | "contained" | "resolved";

export interface AuditEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  action: string;
  details: any | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface ComplianceAssessment {
  id: string;
  assessment_type: AssessmentType;
  status: AssessmentStatus;
  score: number | null;
  max_score: number;
  findings: any | null;
  recommendations: string[] | null;
  conducted_by: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AssessmentType = "manual" | "automated";
export type AssessmentStatus = "pending" | "in_progress" | "completed" | "failed";

export interface DataRetentionPolicy {
  id: string;
  name: string;
  description: string;
  data_category: string;
  retention_period_months: number;
  legal_basis: string;
  auto_delete: boolean;
  notification_before_days: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalDocument {
  id: string;
  document_type: DocumentType;
  title: string;
  content: string;
  version: string;
  effective_date: string;
  expiry_date: string | null;
  language: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type DocumentType =
  | "privacy_policy"
  | "terms_of_service"
  | "cookie_policy"
  | "data_processing_agreement"
  | "consent_form";

export interface ThirdPartySharing {
  id: string;
  partner_name: string;
  partner_type: PartnerType;
  data_categories: string[];
  purpose: string;
  legal_basis: string;
  transfer_mechanism: string;
  country: string;
  adequacy_decision: boolean;
  contract_date: string;
  contract_expiry: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type PartnerType =
  | "processor"
  | "joint_controller"
  | "third_party"
  | "vendor"
  | "service_provider";

// API Request/Response Types
export interface ConsentUpdateRequest {
  user_id?: string;
  purpose_id: string;
  granted: boolean;
  ip_address?: string;
  user_agent?: string;
}

export interface ConsentWithdrawRequest {
  consent_id: string;
}

export interface DataSubjectRequestCreate {
  request_type: DataSubjectRequestType;
  description?: string;
}

export interface DataSubjectRequestUpdate {
  request_id: string;
  status?: DataSubjectRequestStatus;
  response_data?: any;
  notes?: string;
}

export interface BreachIncidentCreate {
  title: string;
  description: string;
  severity: BreachSeverity;
  affected_users: number;
  data_types: string[];
  discovered_at: string;
}

export interface BreachIncidentUpdate {
  breach_id: string;
  status?: BreachStatus;
  severity?: BreachSeverity;
  assigned_to?: string;
  authority_notified?: boolean;
  users_notified?: boolean;
  mitigation_steps?: string;
}

export interface AuditEventCreate {
  event_type: string;
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  action: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}

export interface ComplianceAssessmentCreate {
  assessment_type: AssessmentType;
}

// Filter Types
export interface ConsentFilters {
  user_id?: string;
  purpose_id?: string;
  granted?: boolean;
  page?: number;
  limit?: number;
}

export interface DataSubjectRequestFilters {
  user_id?: string;
  request_type?: DataSubjectRequestType;
  status?: DataSubjectRequestStatus;
  page?: number;
  limit?: number;
}

export interface BreachIncidentFilters {
  severity?: BreachSeverity;
  status?: BreachStatus;
  page?: number;
  limit?: number;
}

export interface AuditEventFilters {
  event_type?: string;
  user_id?: string;
  resource_type?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  export?: "json" | "csv";
}

export interface ComplianceAssessmentFilters {
  assessment_type?: AssessmentType;
  status?: AssessmentStatus;
  page?: number;
  limit?: number;
}

// Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ConsentResponse {
  consents: UserConsent[];
  total: number;
  page: number;
  limit: number;
}

export interface DataSubjectRequestResponse {
  requests: DataSubjectRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface BreachIncidentResponse {
  breaches: BreachIncident[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditEventResponse {
  events: AuditEvent[];
  total: number;
  page: number;
  limit: number;
  statistics?: AuditStatistics;
}

export interface ComplianceAssessmentResponse {
  assessments: ComplianceAssessment[];
  total: number;
  page: number;
  limit: number;
}

export interface LGPDDashboardResponse {
  metrics: LGPDMetrics;
  recent_assessments: ComplianceAssessment[];
  recent_breaches: BreachIncident[];
  recent_requests: DataSubjectRequest[];
}

// Statistics Types
export interface AuditStatistics {
  total_events: number;
  by_event_type: Record<string, number>;
  by_action: Record<string, number>;
  by_user: Record<string, number>;
  timeline: Array<{
    date: string;
    count: number;
  }>;
}

export interface BreachStatistics {
  total_breaches: number;
  by_severity: Record<BreachSeverity, number>;
  by_status: Record<BreachStatus, number>;
  by_month: Array<{
    month: string;
    count: number;
  }>;
}

export interface ConsentStatistics {
  total_consents: number;
  active_consents: number;
  consent_rate: number;
  by_purpose: Record<
    string,
    {
      granted: number;
      withdrawn: number;
      rate: number;
    }
  >;
  by_month: Array<{
    month: string;
    granted: number;
    withdrawn: number;
  }>;
}

// Error Types
export interface LGPDError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Component Props Types
export interface LGPDDashboardProps {
  className?: string;
}

export interface ConsentManagementPanelProps {
  className?: string;
  userId?: string;
}

export interface DataSubjectRightsPanelProps {
  className?: string;
  userId?: string;
}

export interface ComplianceAssessmentPanelProps {
  className?: string;
}

export interface BreachManagementPanelProps {
  className?: string;
}

export interface AuditTrailPanelProps {
  className?: string;
}

export interface ConsentBannerProps {
  className?: string;
  position?: "top" | "bottom";
  theme?: "light" | "dark";
  showLogo?: boolean;
}

// Hook Return Types
export interface UseLGPDDashboardReturn {
  metrics: LGPDMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseConsentManagementReturn {
  consents: UserConsent[];
  isLoading: boolean;
  error: Error | null;
  fetchConsents: (filters?: ConsentFilters) => Promise<void>;
  updateConsent: (data: ConsentUpdateRequest) => Promise<UserConsent>;
  withdrawConsent: (consentId: string) => Promise<void>;
}

export interface UseDataSubjectRightsReturn {
  requests: DataSubjectRequest[];
  isLoading: boolean;
  error: Error | null;
  fetchRequests: (filters?: DataSubjectRequestFilters) => Promise<void>;
  createRequest: (data: DataSubjectRequestCreate) => Promise<DataSubjectRequest>;
  updateRequest: (
    requestId: string,
    data: Partial<DataSubjectRequestUpdate>,
  ) => Promise<DataSubjectRequest>;
}

export interface UseBreachManagementReturn {
  breaches: BreachIncident[];
  isLoading: boolean;
  error: Error | null;
  fetchBreaches: (filters?: BreachIncidentFilters) => Promise<void>;
  reportBreach: (data: BreachIncidentCreate) => Promise<BreachIncident>;
  updateBreach: (breachId: string, data: Partial<BreachIncidentUpdate>) => Promise<BreachIncident>;
}

export interface UseAuditTrailReturn {
  events: AuditEvent[];
  isLoading: boolean;
  error: Error | null;
  fetchEvents: (filters?: AuditEventFilters) => Promise<void>;
  exportEvents: (format: "json" | "csv", filters?: AuditEventFilters) => Promise<void>;
}

export interface UseComplianceAssessmentReturn {
  assessments: ComplianceAssessment[];
  isLoading: boolean;
  error: Error | null;
  fetchAssessments: (filters?: ComplianceAssessmentFilters) => Promise<void>;
  createAssessment: (data: ComplianceAssessmentCreate) => Promise<ComplianceAssessment>;
  runAutomatedAssessment: () => Promise<ComplianceAssessment>;
}

export interface UseConsentBannerReturn {
  purposes: ConsentPurpose[];
  userConsents: UserConsent[];
  isLoading: boolean;
  error: Error | null;
  updateUserConsent: (purposeId: string, granted: boolean) => Promise<void>;
  refetch: () => void;
}

// Utility Types
export type LGPDEventType =
  | "consent_management"
  | "data_subject_rights"
  | "breach_management"
  | "compliance_assessment"
  | "data_access"
  | "data_modification"
  | "data_deletion"
  | "system_access"
  | "configuration_change";

export type LGPDAction =
  | "consent_granted"
  | "consent_withdrawn"
  | "consent_updated"
  | "request_created"
  | "request_processed"
  | "request_completed"
  | "breach_reported"
  | "breach_investigated"
  | "breach_resolved"
  | "assessment_started"
  | "assessment_completed"
  | "data_accessed"
  | "data_exported"
  | "data_deleted"
  | "user_login"
  | "admin_access"
  | "config_updated";

export type LGPDResourceType =
  | "consent"
  | "data_subject_request"
  | "breach_incident"
  | "compliance_assessment"
  | "user_data"
  | "system_config"
  | "legal_document"
  | "retention_policy"
  | "third_party_sharing";

// Constants
export const LGPD_CONSTANTS = {
  MAX_RETENTION_YEARS: 10,
  DEFAULT_CONSENT_EXPIRY_MONTHS: 24,
  BREACH_NOTIFICATION_HOURS: 72,
  DATA_PORTABILITY_DAYS: 30,
  ERASURE_REQUEST_DAYS: 30,
  ACCESS_REQUEST_DAYS: 15,
  RECTIFICATION_REQUEST_DAYS: 15,
  ASSESSMENT_FREQUENCY_MONTHS: 6,
  AUDIT_RETENTION_YEARS: 5,
} as const;

export const LGPD_SEVERITY_COLORS = {
  low: "green",
  medium: "yellow",
  high: "orange",
  critical: "red",
} as const;

export const LGPD_STATUS_COLORS = {
  pending: "gray",
  in_progress: "blue",
  completed: "green",
  rejected: "red",
  reported: "orange",
  investigating: "blue",
  contained: "yellow",
  resolved: "green",
  failed: "red",
} as const;
