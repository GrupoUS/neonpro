// Phase 4 Validation System Types
// Sistema abrangente de validação para plataforma de saúde

export type ValidationLevel =
  | "basic"
  | "intermediate"
  | "advanced"
  | "critical";
export type ValidationStatus =
  | "pending"
  | "validating"
  | "passed"
  | "failed"
  | "requires_review";
export type ValidationType =
  | "patient_data"
  | "appointment"
  | "treatment"
  | "compliance"
  | "billing"
  | "staff"
  | "equipment";

// Core Validation Interfaces
export interface ValidationRule {
  id: string;
  name: string;
  type: ValidationType;
  level: ValidationLevel;
  description: string;
  criteria: ValidationCriteria;
  enabled: boolean;
  priority: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface ValidationCriteria {
  required_fields: string[];
  pattern_validations: PatternValidation[];
  business_rules: BusinessRule[];
  compliance_checks: ComplianceCheck[];
  cross_reference_checks: CrossReferenceCheck[];
}

export interface PatternValidation {
  field: string;
  pattern: string;
  error_message: string;
  severity: "warning" | "error";
}

export interface BusinessRule {
  id: string;
  name: string;
  condition: string;
  action: "block" | "warn" | "require_approval";
  message: string;
}

export interface ComplianceCheck {
  regulation: "LGPD" | "CFM" | "ANVISA" | "CRM";
  requirement: string;
  check_function: string;
  mandatory: boolean;
}

export interface CrossReferenceCheck {
  source_field: string;
  reference_table: string;
  reference_field: string;
  validation_type: "exists" | "matches" | "within_range";
}

// Validation Execution
export interface ValidationRequest {
  id: string;
  entity_type: ValidationType;
  entity_id: string;
  data: Record<string, any>;
  rules: string[];
  context: ValidationContext;
  initiated_by: string;
  initiated_at: Date;
}

export interface ValidationContext {
  clinic_id?: string;
  patient_id?: string;
  professional_id?: string;
  session_id: string;
  ip_address: string;
  user_agent: string;
}

export interface ValidationResult {
  id: string;
  request_id: string;
  rule_id: string;
  status: ValidationStatus;
  passed: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  execution_time: number;
  validated_at: Date;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: "high" | "medium" | "low";
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  impact: "data_quality" | "compliance" | "performance";
}

export interface ValidationSuggestion {
  type: "correction" | "improvement" | "alternative";
  message: string;
  auto_fixable: boolean;
}

// Validation Session
export interface ValidationSession {
  id: string;
  entity_type: ValidationType;
  entity_id: string;
  status: ValidationStatus;
  total_rules: number;
  passed_rules: number;
  failed_rules: number;
  overall_score: number;
  results: ValidationResult[];
  start_time: Date;
  end_time?: Date;
  duration?: number;
  metadata: ValidationMetadata;
}

export interface ValidationMetadata {
  clinic_settings: Record<string, any>;
  regulatory_context: string[];
  data_sensitivity: "public" | "internal" | "confidential" | "restricted";
  audit_trail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  user: string;
  details: Record<string, any>;
}

// Validation Statistics
export interface ValidationStats {
  total_validations: number;
  success_rate: number;
  average_score: number;
  common_errors: ErrorFrequency[];
  performance_metrics: PerformanceMetric[];
  compliance_score: number;
  trending_data: TrendingData[];
}

export interface ErrorFrequency {
  error_code: string;
  count: number;
  percentage: number;
  last_occurrence: Date;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

export interface TrendingData {
  date: Date;
  total_validations: number;
  success_rate: number;
  average_response_time: number;
}

// Validation Configuration
export interface ValidationConfig {
  id: string;
  clinic_id: string;
  strict_mode: boolean;
  auto_fix_enabled: boolean;
  notification_settings: NotificationSettings;
  thresholds: ValidationThresholds;
  custom_rules: CustomRule[];
  integration_settings: IntegrationSettings;
}

export interface NotificationSettings {
  email_alerts: boolean;
  sms_alerts: boolean;
  dashboard_notifications: boolean;
  alert_recipients: string[];
  escalation_rules: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  delay_minutes: number;
  recipient: string;
  message_template: string;
}

export interface ValidationThresholds {
  minimum_score: number;
  warning_score: number;
  critical_error_limit: number;
  response_time_limit: number;
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  script: string;
  enabled: boolean;
  test_cases: TestCase[];
}

export interface TestCase {
  input: Record<string, any>;
  expected_result: boolean;
  description: string;
}

export interface IntegrationSettings {
  external_validators: ExternalValidator[];
  api_endpoints: ApiEndpoint[];
  webhook_config: WebhookConfig;
}

export interface ExternalValidator {
  name: string;
  endpoint: string;
  auth_method: "api_key" | "bearer" | "oauth";
  timeout: number;
  retry_count: number;
}

export interface ApiEndpoint {
  name: string;
  url: string;
  method: "GET" | "POST" | "PUT";
  headers: Record<string, string>;
}

export interface WebhookConfig {
  enabled: boolean;
  endpoint: string;
  events: string[];
  secret: string;
}

// Validation Dashboard
export interface ValidationDashboard {
  summary: ValidationSummary;
  recent_activities: RecentActivity[];
  system_health: SystemHealth;
  alerts: ValidationAlert[];
  recommendations: SystemRecommendation[];
}

export interface ValidationSummary {
  today_validations: number;
  success_rate: number;
  average_response_time: number;
  critical_errors: number;
  pending_reviews: number;
}

export interface RecentActivity {
  id: string;
  type: ValidationType;
  entity_id: string;
  status: ValidationStatus;
  timestamp: Date;
  duration: number;
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  uptime: number;
  memory_usage: number;
  cpu_usage: number;
  database_connectivity: boolean;
  external_services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  response_time: number;
  last_check: Date;
}

export interface ValidationAlert {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  severity: ValidationLevel;
  created_at: Date;
  acknowledged: boolean;
  actions: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: string;
  variant: "primary" | "secondary" | "destructive";
}

export interface SystemRecommendation {
  type: "performance" | "security" | "compliance" | "usability";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  priority_score: number;
}

// Brazilian Portuguese Labels
export const ValidationLabels = {
  validation_levels: {
    basic: "Básico",
    intermediate: "Intermediário",
    advanced: "Avançado",
    critical: "Crítico",
  },
  validation_status: {
    pending: "Pendente",
    validating: "Validando",
    passed: "Aprovado",
    failed: "Rejeitado",
    requires_review: "Requer Revisão",
  },
  validation_types: {
    patient_data: "Dados do Paciente",
    appointment: "Consulta",
    treatment: "Tratamento",
    compliance: "Conformidade",
    billing: "Faturamento",
    staff: "Funcionário",
    equipment: "Equipamento",
  },
  system_health: {
    healthy: "Saudável",
    warning: "Alerta",
    critical: "Crítico",
  },
  alert_types: {
    error: "Erro",
    warning: "Aviso",
    info: "Informação",
  },
} as const;

// Validation Presets for Brazilian Healthcare
export const BrazilianHealthcareValidationPresets = {
  cpf_validation: {
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    message: "CPF deve estar no formato XXX.XXX.XXX-XX",
  },
  cnpj_validation: {
    pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    message: "CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX",
  },
  cep_validation: {
    pattern: /^\d{5}-?\d{3}$/,
    message: "CEP deve estar no formato XXXXX-XXX",
  },
  crm_validation: {
    pattern: /^CRM\/[A-Z]{2}\s\d+$/,
    message: "CRM deve estar no formato CRM/UF NÚMERO",
  },
  phone_validation: {
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message: "Telefone deve estar no formato (XX) XXXXX-XXXX",
  },
  anvisa_validation: {
    pattern: /^\d{13}$/,
    message: "Código ANVISA deve conter 13 dígitos",
  },
} as const;

export type ValidationPreset = keyof typeof BrazilianHealthcareValidationPresets;
