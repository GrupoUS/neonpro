// Database Record Types for Healthcare Governance Service
// These types represent the raw data structure from the database

export interface HealthcareMetricRecord {
  id: string;
  clinic_id: string;
  metric_type: string;
  name: string;
  description: string | null;
  category: string;
  current_value: number;
  target_value: number;
  threshold: number;
  unit: string;
  status: string;
  compliance_framework: string;
  risk_level: string;
  last_updated: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PatientSafetyKPIRecord {
  id: string;
  clinic_id: string;
  kpi_name: string;
  category: string;
  current_value: number;
  target_value: number;
  benchmark: number;
  trend: string;
  alert_threshold: number;
  last_incident: string | null;
  incident_count: number;
  mitigation_actions: string[] | null;
  responsible_team: string;
  reporting_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface HealthcarePolicyRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string | null;
  status: string | null;
  content: string;
  framework: string;
  last_review: string | null;
  next_review: string | null;
  enforcement_rate: number;
  violation_count: number;
  regulatory_body: string | null;
  regulation_number: string | null;
  applicable_services: string[] | null;
  compliance_deadline: string | null;
  audit_frequency: string | null;
  criticality_level: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface HealthcareAlertRecord {
  id: string;
  clinic_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  metric_id: string | null;
  threshold_value: number | null;
  current_value: number | null;
  status: string;
  assigned_to: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  source: string | null;
  triggered_by: string | null;
  escalation_level: string | null;
  auto_escalation_time: string | null;
  resolution_deadline: string | null;
  actions: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceReportRecord {
  id: string;
  clinic_id: string;
  framework: string;
  report_type: string;
  period_start: string;
  period_end: string;
  overall_score: number;
  compliance_status: string;
  score: number;
  status: string;
  findings: Record<string, unknown> | null;
  recommendations: string[] | null;
  violations: number | null;
  next_audit_date: string | null;
  generated_by: string;
  approved_by: string | null;
  approved_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Database Record Types for Supabase Governance Service

export interface AuditTrailRecord {
  id: string;
  user_id: string;
  clinic_id: string;
  patient_id: string | null;
  action: string;
  resource: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  status: string;
  risk_level: string;
  additional_info: Record<string, unknown> | null;
  encrypted_details: string | null;
  created_at: string;
}

export interface KPIMetricRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  current_value: string;
  target_value: string;
  direction: string;
  unit: string;
  status: string;
  threshold: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceStatusRecord {
  id: string;
  clinic_id: string;
  framework: string;
  score: string;
  status: string;
  violations: number;
  last_audit: string | null;
  next_audit: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface RiskAssessmentRecord {
  id: string;
  clinic_id: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  likelihood: string;
  impact: string;
  status: string;
  mitigation: string | null;
  owner: string | null;
  due_date: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AIGovernanceMetricRecord {
  id: string;
  model_name: string;
  model_version: string;
  status: string;
  hallucination_rate: string;
  accuracy_score: string;
  bias_score: string | null;
  compliance_score: string;
  requests_processed: number;
  average_response_time: string | null;
  error_rate: string;
  last_training_date: string | null;
  model_size: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PolicyManagementRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  status: string;
  version: string;
  enforcement_rate: string;
  violation_count: number;
  last_review: string | null;
  next_review: string | null;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface EscalationWorkflowRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  deadline: string | null;
  escalated_at: string | null;
  resolved_at: string | null;
  response_time: number | null;
  resolution_time: number | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}