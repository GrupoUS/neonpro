import { z } from "zod";

// Enum para ações de auditoria
export enum AuditAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
  BACKUP = "BACKUP",
  RESTORE = "RESTORE",
  PERMISSION_CHANGE = "PERMISSION_CHANGE",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  DATA_ACCESS = "DATA_ACCESS",
  REPORT_GENERATE = "REPORT_GENERATE",
  SYSTEM_CONFIG = "SYSTEM_CONFIG",
}

// Enum para tipos de recursos
export enum ResourceType {
  PATIENT = "PATIENT",
  APPOINTMENT = "APPOINTMENT",
  PROFESSIONAL = "PROFESSIONAL",
  PAYMENT = "PAYMENT",
  TREATMENT = "TREATMENT",
  MEDICAL_RECORD = "MEDICAL_RECORD",
  USER = "USER",
  ROLE = "ROLE",
  PERMISSION = "PERMISSION",
  SYSTEM = "SYSTEM",
  REPORT = "REPORT",
  BACKUP = "BACKUP",
  CONFIGURATION = "CONFIGURATION",
  AUDIT_LOG = "AUDIT_LOG",
}

// Enum para níveis de severidade
export enum AuditSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// Schema de validação para evento de auditoria
export const AuditEventSchema = z.object({
  user_id: z.string().uuid().optional(),
  session_id: z.string().optional(),
  action: z.nativeEnum(AuditAction),
  resource_type: z.nativeEnum(ResourceType),
  resource_id: z.string().optional(),
  resource_name: z.string().optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  endpoint: z.string().optional(),
  status_code: z.number().optional(),
  severity: z.nativeEnum(AuditSeverity).default(AuditSeverity.LOW),
  details: z.record(z.any()).optional(),
  before_data: z.record(z.any()).optional(),
  after_data: z.record(z.any()).optional(),
  error_message: z.string().optional(),
  duration_ms: z.number().optional(),
  timestamp: z.date().default(() => new Date()),
});

// Tipo inferido do schema
export type AuditEvent = z.infer<typeof AuditEventSchema>;

// Interface para entrada de log de auditoria no banco
export interface AuditLogEntry extends AuditEvent {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// Schema para filtros de consulta de auditoria
export const AuditFilterSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  user_id: z.string().uuid().optional(),
  action: z.nativeEnum(AuditAction).optional(),
  resource_type: z.nativeEnum(ResourceType).optional(),
  resource_id: z.string().optional(),
  severity: z.nativeEnum(AuditSeverity).optional(),
  ip_address: z.string().ip().optional(),
  status_code: z.number().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
  sort_by: z.enum(["timestamp", "action", "severity", "user_id"]).default("timestamp"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export type AuditFilter = z.infer<typeof AuditFilterSchema>;

// Interface para estatísticas de auditoria
export interface AuditStats {
  total_events: number;
  events_by_action: Record<AuditAction, number>;
  events_by_resource: Record<ResourceType, number>;
  events_by_severity: Record<AuditSeverity, number>;
  top_users: { user_id: string; count: number; }[];
  recent_critical_events: AuditLogEntry[];
  daily_activity: { date: string; count: number; }[];
}

// Interface para configuração de auditoria
export interface AuditConfig {
  enabled: boolean;
  log_level: AuditSeverity;
  retention_days: number;
  excluded_endpoints: string[];
  excluded_actions: AuditAction[];
  auto_archive: boolean;
  alert_on_critical: boolean;
  max_details_size: number;
}

// Interface para exportação de logs
export interface AuditExportOptions {
  format: "json" | "csv" | "pdf";
  filters: AuditFilter;
  include_details: boolean;
  include_sensitive_data: boolean;
  compression: boolean;
}

// Resposta padrão para APIs de auditoria
export interface AuditResponse<T = any> {
  success: boolean;
  data: T;
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  timestamp: Date;
}

// Contexto de auditoria para middleware
export interface AuditContext {
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  start_time: number;
  request_id: string;
}

// Evento de alerta crítico
export interface CriticalAuditAlert {
  event: AuditLogEntry;
  alert_type: "UNAUTHORIZED_ACCESS" | "DATA_BREACH" | "SYSTEM_COMPROMISE" | "SUSPICIOUS_ACTIVITY";
  description: string;
  recommended_actions: string[];
  auto_resolved: boolean;
}
