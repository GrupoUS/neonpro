// Workflow Automation Engine Types
// Event-driven automation for ML prediction-based interventions

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number; // 1-100, higher = executed first

  // Rule categorization
  category:
    | "prediction"
    | "intervention"
    | "escalation"
    | "notification"
    | "scheduling";
  ruleType: "trigger" | "condition" | "action" | "composite";

  // Execution context
  clinicId: string;
  departmentIds: string[];
  applicableRoles: string[];

  // Rule definition
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];

  // Execution settings
  executionMode: "immediate" | "scheduled" | "batch";
  maxExecutionsPerHour: number;
  cooldownPeriod: number; // minutes between executions for same entity
  retryPolicy: RetryPolicy;

  // Compliance and audit
  complianceRequirements: ComplianceRequirement[];
  auditLevel: "minimal" | "standard" | "comprehensive";
  dataRetentionDays: number;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastExecutedAt?: Date;
  executionCount: number;
  successRate: number; // percentage
}

export interface WorkflowTrigger {
  id: string;
  type: "ml_prediction" | "time_based" | "event" | "manual" | "webhook";

  // ML Prediction triggers
  predictionThreshold?: number; // risk score threshold
  riskLevels?: ("low" | "medium" | "high" | "critical")[];
  confidenceMinimum?: number; // minimum ML confidence

  // Time-based triggers
  schedule?: CronExpression;
  timeRange?: TimeRange;
  timezone?: string;

  // Event triggers
  eventType?: string; // 'appointment_created', 'patient_updated', etc.
  eventSource?: string;

  // Webhook triggers
  webhookUrl?: string;
  webhookSecret?: string;
  httpMethod?: "GET" | "POST" | "PUT" | "DELETE";

  // Condition for trigger activation
  conditions?: WorkflowCondition[];

  // Rate limiting
  maxTriggersPerMinute?: number;
  debounceMs?: number;
}

export interface WorkflowCondition {
  id: string;
  type: "logical" | "comparison" | "pattern" | "custom";
  operator:
    | "and"
    | "or"
    | "not"
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "matches";

  // Data source
  dataSource:
    | "appointment"
    | "patient"
    | "prediction"
    | "staff"
    | "clinic"
    | "external";
  fieldPath: string; // JSON path to field (e.g., "patient.age", "prediction.riskScore")

  // Comparison values
  value?: any;
  valueType?: "static" | "dynamic" | "calculated";

  // Pattern matching (for text fields)
  pattern?: string; // regex pattern
  flags?: string; // regex flags

  // Nested conditions (for logical operators)
  nestedConditions?: WorkflowCondition[];

  // Custom validation
  customFunction?: string; // function name for complex validation

  // Caching
  cacheDuration?: number; // minutes to cache result
}

export interface WorkflowAction {
  id: string;
  type:
    | "notification"
    | "intervention"
    | "data_update"
    | "external_api"
    | "workflow"
    | "schedule";
  order: number; // execution order within rule

  // Action configuration
  config: ActionConfig;

  // Execution settings
  async: boolean; // execute asynchronously
  timeout: number; // seconds
  retryOnFailure: boolean;
  maxRetries: number;

  // Conditional execution
  conditions?: WorkflowCondition[];

  // Output handling
  outputMapping?: { [key: string]: string; }; // map action outputs to workflow variables
  errorHandling: "ignore" | "retry" | "escalate" | "stop_workflow";
}

export interface ActionConfig {
  // Notification actions
  notificationType?: "email" | "sms" | "whatsapp" | "push" | "slack" | "teams";
  recipients?: string[]; // user IDs, emails, or phone numbers
  template?: string; // message template ID or content
  variables?: { [key: string]: any; }; // template variables

  // Intervention actions
  interventionType?: "call" | "message" | "email" | "reschedule" | "reminder";
  interventionTemplate?: string;
  scheduleDelay?: number; // minutes to delay intervention

  // Data update actions
  entityType?: "appointment" | "patient" | "prediction";
  entityId?: string; // dynamic field path or static ID
  updateFields?: { [fieldName: string]: any; };

  // External API actions
  apiUrl?: string;
  httpMethod?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: { [key: string]: string; };
  body?: any;
  authentication?: ApiAuthentication;

  // Workflow actions (trigger other workflows)
  workflowId?: string;
  workflowVariables?: { [key: string]: any; };

  // Scheduling actions
  scheduleType?: "appointment" | "task" | "reminder";
  scheduleDateTime?: string; // ISO datetime or relative (e.g., "+2h")
  scheduleRecurrence?: RecurrencePattern;
}

export interface ApiAuthentication {
  type: "none" | "basic" | "bearer" | "api_key" | "oauth2";
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    keyLocation?: "header" | "query" | "body";
    keyName?: string;
  };
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: "fixed" | "exponential" | "linear";
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  jitter: boolean; // add randomness to prevent thundering herd
}

export interface ComplianceRequirement {
  type: "LGPD" | "CFM" | "ANVISA" | "HIPAA" | "custom";
  description: string;
  validationFunction?: string; // function to validate compliance
  auditFields: string[]; // fields to audit for compliance
  dataMinimization: boolean; // only process necessary data
  consentRequired: boolean; // require patient consent
  retentionPeriod: number; // days to retain data
}

export interface WorkflowExecution {
  id: string;
  workflowRuleId: string;
  status:
    | "pending"
    | "running"
    | "completed"
    | "failed"
    | "cancelled"
    | "timeout";

  // Execution context
  triggeredBy: string; // user ID or 'system'
  triggeredAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // milliseconds

  // Input data
  triggerData: any; // data that triggered the workflow
  inputVariables: { [key: string]: any; };

  // Execution results
  actionResults: ActionResult[];
  outputVariables: { [key: string]: any; };

  // Error handling
  error?: WorkflowError;
  retryCount: number;

  // Compliance and audit
  auditLog: WorkflowAuditEntry[];
  complianceChecks: ComplianceCheck[];

  // Performance metrics
  metrics: ExecutionMetrics;
}

export interface ActionResult {
  actionId: string;
  actionType: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds

  // Results
  output?: any;
  error?: string;

  // Metrics
  resourceUsage?: {
    memoryMB?: number;
    cpuMs?: number;
    networkBytes?: number;
  };
}

export interface WorkflowError {
  code: string;
  message: string;
  actionId?: string;
  stackTrace?: string;
  retryable: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

export interface WorkflowAuditEntry {
  id: string;
  timestamp: Date;
  action:
    | "workflow_started"
    | "action_executed"
    | "condition_evaluated"
    | "workflow_completed"
    | "error_occurred";
  details: string;
  userId?: string;
  dataAccessed?: string[]; // fields accessed during execution
  sensitiveDataInvolved: boolean;
}

export interface ComplianceCheck {
  requirementType: string;
  status: "passed" | "failed" | "warning";
  details: string;
  checkedAt: Date;
  evidence?: any; // proof of compliance
}

export interface ExecutionMetrics {
  totalDuration: number; // milliseconds
  actionCount: number;
  actionSuccessRate: number; // percentage
  dataProcessed: number; // bytes
  externalApiCalls: number;
  resourceCost: number; // estimated cost in BRL
}

export interface WorkflowQueue {
  id: string;
  name: string;
  type: "fifo" | "priority" | "delayed" | "scheduled";
  maxConcurrency: number;
  maxQueueSize: number;

  // Queue metrics
  pendingJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;

  // Performance settings
  batchSize?: number;
  processingDelay?: number; // milliseconds between jobs
  deadLetterQueue?: string; // queue for failed jobs

  // Monitoring
  healthStatus: "healthy" | "degraded" | "unhealthy";
  lastProcessedAt?: Date;
  throughput: number; // jobs per minute
  errorRate: number; // percentage
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;

  // Template definition
  ruleTemplate: Partial<WorkflowRule>;
  configurableFields: ConfigurableField[];

  // Usage and documentation
  usageExamples: UsageExample[];
  documentation: string; // markdown
  tags: string[];

  // Versioning
  createdAt: Date;
  updatedAt: Date;
  isDeprecated: boolean;
  migrationPath?: string; // path to newer version
}

export interface ConfigurableField {
  fieldPath: string; // JSON path in rule
  displayName: string;
  description: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule;
  options?: { label: string; value: any; }[]; // for dropdowns
}

export interface ValidationRule {
  pattern?: string; // regex
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  customValidator?: string; // function name
}

export interface UsageExample {
  title: string;
  description: string;
  configuration: { [fieldPath: string]: any; };
  expectedOutcome: string;
}

// Time-related interfaces
export interface CronExpression {
  minute: string; // 0-59 or *
  hour: string; // 0-23 or *
  dayOfMonth: string; // 1-31 or *
  month: string; // 1-12 or *
  dayOfWeek: string; // 0-7 or *
  expression?: string; // full cron expression
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string; // HH:MM format
  timezone?: string;
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
}

export interface RecurrencePattern {
  type: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval: number; // every N days/weeks/months
  daysOfWeek?: number[]; // for weekly
  dayOfMonth?: number; // for monthly
  endDate?: Date;
  occurrences?: number; // max number of occurrences
}

// Brazilian Portuguese localization
export const WORKFLOW_CATEGORY_LABELS_PT = {
  prediction: "Predição de IA",
  intervention: "Intervenção",
  escalation: "Escalação",
  notification: "Notificação",
  scheduling: "Agendamento",
} as const;

export const ACTION_TYPE_LABELS_PT = {
  notification: "Notificação",
  intervention: "Intervenção",
  data_update: "Atualização de Dados",
  external_api: "API Externa",
  workflow: "Fluxo de Trabalho",
  schedule: "Agendamento",
} as const;

export const EXECUTION_STATUS_LABELS_PT = {
  pending: "Pendente",
  running: "Executando",
  completed: "Concluído",
  failed: "Falhou",
  cancelled: "Cancelado",
  timeout: "Timeout",
} as const;

// Default workflow templates for Brazilian healthcare
export const HEALTHCARE_WORKFLOW_TEMPLATES = [
  {
    name: "Alerta de Alto Risco No-Show",
    description: "Notifica equipe quando predição indica risco crítico de falta",
    category: "prediction",
    triggers: ["ml_prediction"],
    conditions: ["riskScore >= 75", "confidence >= 0.8"],
    actions: ["staff_notification", "schedule_intervention"],
  },
  {
    name: "Lembretes Automáticos WhatsApp",
    description: "Envia lembretes por WhatsApp baseado no perfil de risco",
    category: "intervention",
    triggers: ["time_based"],
    conditions: ["appointment in next 24h", "riskScore >= 25"],
    actions: ["whatsapp_reminder"],
  },
  {
    name: "Escalação por Inatividade",
    description: "Escala alertas não tratados para supervisor",
    category: "escalation",
    triggers: ["time_based"],
    conditions: ["alert age > 30 minutes", "status = pending"],
    actions: ["notify_supervisor", "increase_priority"],
  },
] as const;
