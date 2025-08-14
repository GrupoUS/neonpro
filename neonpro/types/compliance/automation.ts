// Tipos para o sistema de automação LGPD

export interface AutomationConfig {
  id?: string;
  clinic_id: string;
  enabled: boolean;
  schedules: {
    fullAutomation: {
      enabled: boolean;
      cron: string;
      timezone: string;
    };
    consentManagement: {
      enabled: boolean;
      cron: string;
    };
    dataSubjectRights: {
      enabled: boolean;
      cron: string;
    };
    auditReporting: {
      enabled: boolean;
      cron: string;
    };
    anonymization: {
      enabled: boolean;
      cron: string;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      recipients: string[];
      events: string[];
    };
    webhook: {
      enabled: boolean;
      url: string;
      events: string[];
    };
  };
  limits: {
    maxConcurrentJobs: number;
    jobTimeout: number;
    retryAttempts: number;
    batchSize: number;
  };
  features: {
    autoConsentManagement: boolean;
    autoDataSubjectRights: boolean;
    autoAuditReporting: boolean;
    autoAnonymization: boolean;
    realTimeMonitoring: boolean;
    smartAlerts: boolean;
  };
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface AutomationStatus {
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  status: 'running' | 'idle' | 'error';
  currentJobs: AutomationJob[];
  features: {
    autoConsentManagement: boolean;
    autoDataSubjectRights: boolean;
    autoAuditReporting: boolean;
    autoAnonymization: boolean;
    realTimeMonitoring: boolean;
    smartAlerts: boolean;
  };
}

export interface AutomationJob {
  id: string;
  type: 'full_automation' | 'consent_management' | 'data_subject_rights' | 
        'audit_reporting' | 'anonymization' | 'health_check';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  progress: number;
  message?: string;
  error?: string;
  results?: any;
}

export interface AutomationMetrics {
  consent: {
    total: number;
    active: number;
    revoked: number;
    expired: number;
    byPurpose: Record<string, number>;
  };
  audit: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentEvents: number;
  };
  dataSubjectRequests: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    avgProcessingTime: number;
  };
  security: {
    incidents: number;
    breaches: number;
    vulnerabilities: number;
  };
  performance: {
    avgResponseTime: number;
    uptime: number;
    errorRate: number;
  };
}

export interface ComplianceAlert {
  id: string;
  clinic_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'consent' | 'data_subject_rights' | 'security' | 'audit' | 'performance' | 'compliance';
  status: 'active' | 'resolved' | 'dismissed';
  source: string;
  metadata?: Record<string, any>;
  auto_resolve_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface MonitoringData {
  complianceScore: number;
  metrics: AutomationMetrics;
  alerts: {
    total: number;
    active: number;
    resolved: number;
    bySeverity: Record<string, number>;
    recent: ComplianceAlert[];
  };
  trends: {
    complianceScore: Array<{ date: string; score: number }>;
    incidents: Array<{ date: string; count: number }>;
    requests: Array<{ date: string; count: number }>;
  };
  lastUpdated: string;
}

export interface AutomationExecutionRequest {
  action: 'run_full_automation' | 'process_consent_automation' | 
          'process_data_subject_rights' | 'run_audit_automation' | 
          'generate_compliance_reports' | 'run_anonymization' | 'health_check';
  parameters?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  scheduledFor?: string;
}

export interface AutomationExecutionResponse {
  success: boolean;
  jobId?: string;
  message: string;
  estimatedDuration?: number;
  results?: any;
  error?: string;
}

// Filtros para monitoramento
export interface MonitoringFilters {
  timeRange: {
    start: string;
    end: string;
  };
  eventTypes?: string[];
  severity?: ('low' | 'medium' | 'high' | 'critical')[];
  includeMetrics?: boolean;
  includeAlerts?: boolean;
  includeTrends?: boolean;
}

// Esquemas de validação
export interface CreateAlertRequest {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'consent' | 'data_subject_rights' | 'security' | 'audit' | 'performance' | 'compliance';
  source: string;
  metadata?: Record<string, any>;
  auto_resolve_hours?: number;
}

export interface UpdateAlertRequest {
  status?: 'active' | 'resolved' | 'dismissed';
  resolution_notes?: string;
}

// Eventos de auditoria para automação
export interface AutomationAuditEvent {
  clinic_id: string;
  event_type: 'automation';
  action: 'automation_started' | 'automation_completed' | 'automation_failed' | 
          'config_updated' | 'alert_created' | 'alert_resolved' | 'job_executed';
  user_id?: string;
  details: {
    jobId?: string;
    jobType?: string;
    configChanges?: any;
    alertId?: string;
    error?: string;
    duration?: number;
    results?: any;
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  ip_address?: string;
  user_agent?: string;
}

// Configurações de notificação
export interface NotificationEvent {
  type: 'automation_completed' | 'automation_failed' | 'alert_created' | 
        'compliance_score_changed' | 'security_incident' | 'config_updated';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

// Resposta da API de status
export interface AutomationStatusResponse {
  success: boolean;
  data: {
    status: AutomationStatus;
    metrics: AutomationMetrics;
    recentJobs: AutomationJob[];
    healthCheck: {
      database: boolean;
      scheduler: boolean;
      notifications: boolean;
      overall: boolean;
    };
  };
  message?: string;
}