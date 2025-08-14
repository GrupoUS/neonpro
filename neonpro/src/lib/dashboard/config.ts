/**
 * Executive Dashboard Configuration
 * Centralizes all dashboard settings, constants, and configurations
 */

import { DashboardTheme, RefreshInterval, ChartType, AlertSeverity, ReportFormat } from './types';

// Dashboard Configuration
export const DASHBOARD_CONFIG = {
  // Refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    REAL_TIME: 5000,      // 5 seconds
    FAST: 30000,          // 30 seconds
    NORMAL: 60000,        // 1 minute
    SLOW: 300000,         // 5 minutes
    MANUAL: 0             // Manual refresh only
  } as const,

  // Cache settings
  CACHE: {
    KPI_TTL: 60000,           // 1 minute
    CHART_DATA_TTL: 300000,   // 5 minutes
    ALERT_TTL: 30000,         // 30 seconds
    REPORT_TTL: 600000        // 10 minutes
  } as const,

  // Performance settings
  PERFORMANCE: {
    MAX_CONCURRENT_REQUESTS: 5,
    REQUEST_TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  } as const,

  // WebSocket settings
  WEBSOCKET: {
    RECONNECT_INTERVAL: 5000,
    MAX_RECONNECT_ATTEMPTS: 10,
    HEARTBEAT_INTERVAL: 30000
  } as const,

  // Chart settings
  CHARTS: {
    DEFAULT_HEIGHT: 300,
    ANIMATION_DURATION: 750,
    COLORS: {
      PRIMARY: '#3b82f6',
      SECONDARY: '#8b5cf6',
      SUCCESS: '#10b981',
      WARNING: '#f59e0b',
      DANGER: '#ef4444',
      INFO: '#06b6d4'
    },
    GRADIENTS: {
      BLUE: ['#3b82f6', '#1d4ed8'],
      PURPLE: ['#8b5cf6', '#7c3aed'],
      GREEN: ['#10b981', '#059669'],
      ORANGE: ['#f59e0b', '#d97706'],
      RED: ['#ef4444', '#dc2626']
    }
  } as const
};

// KPI Configurations
export const KPI_CONFIG = {
  // Financial KPIs
  FINANCIAL: {
    REVENUE: {
      id: 'monthly_revenue',
      title: 'Receita Mensal',
      format: 'currency',
      target: 500000,
      critical_threshold: 0.7,
      warning_threshold: 0.85
    },
    PROFIT_MARGIN: {
      id: 'profit_margin',
      title: 'Margem de Lucro',
      format: 'percentage',
      target: 0.25,
      critical_threshold: 0.1,
      warning_threshold: 0.15
    },
    CASH_FLOW: {
      id: 'cash_flow',
      title: 'Fluxo de Caixa',
      format: 'currency',
      target: 100000,
      critical_threshold: 10000,
      warning_threshold: 50000
    }
  },

  // Operational KPIs
  OPERATIONAL: {
    APPOINTMENT_UTILIZATION: {
      id: 'appointment_utilization',
      title: 'Taxa de Ocupação',
      format: 'percentage',
      target: 0.85,
      critical_threshold: 0.6,
      warning_threshold: 0.75
    },
    AVERAGE_WAIT_TIME: {
      id: 'average_wait_time',
      title: 'Tempo Médio de Espera',
      format: 'duration',
      target: 15,
      critical_threshold: 45,
      warning_threshold: 30
    },
    NO_SHOW_RATE: {
      id: 'no_show_rate',
      title: 'Taxa de Faltas',
      format: 'percentage',
      target: 0.05,
      critical_threshold: 0.15,
      warning_threshold: 0.1
    }
  },

  // Patient KPIs
  PATIENT: {
    SATISFACTION_SCORE: {
      id: 'patient_satisfaction',
      title: 'Satisfação do Paciente',
      format: 'score',
      target: 4.5,
      critical_threshold: 3.0,
      warning_threshold: 4.0
    },
    NEW_PATIENTS: {
      id: 'new_patients_monthly',
      title: 'Novos Pacientes',
      format: 'number',
      target: 100,
      critical_threshold: 50,
      warning_threshold: 75
    },
    RETENTION_RATE: {
      id: 'patient_retention',
      title: 'Taxa de Retenção',
      format: 'percentage',
      target: 0.9,
      critical_threshold: 0.7,
      warning_threshold: 0.8
    }
  },

  // Staff KPIs
  STAFF: {
    PRODUCTIVITY: {
      id: 'staff_productivity',
      title: 'Produtividade da Equipe',
      format: 'percentage',
      target: 0.85,
      critical_threshold: 0.6,
      warning_threshold: 0.75
    },
    SATISFACTION: {
      id: 'staff_satisfaction',
      title: 'Satisfação da Equipe',
      format: 'score',
      target: 4.0,
      critical_threshold: 2.5,
      warning_threshold: 3.5
    },
    TURNOVER_RATE: {
      id: 'staff_turnover',
      title: 'Taxa de Rotatividade',
      format: 'percentage',
      target: 0.1,
      critical_threshold: 0.25,
      warning_threshold: 0.15
    }
  }
} as const;

// Alert Configurations
export const ALERT_CONFIG = {
  SEVERITIES: {
    CRITICAL: {
      level: 'critical' as AlertSeverity,
      color: '#ef4444',
      icon: 'AlertTriangle',
      autoResolve: false,
      notificationRequired: true
    },
    WARNING: {
      level: 'warning' as AlertSeverity,
      color: '#f59e0b',
      icon: 'AlertCircle',
      autoResolve: false,
      notificationRequired: true
    },
    INFO: {
      level: 'info' as AlertSeverity,
      color: '#06b6d4',
      icon: 'Info',
      autoResolve: true,
      notificationRequired: false
    }
  },

  // Alert thresholds
  THRESHOLDS: {
    REVENUE_DROP: 0.15,           // 15% drop triggers alert
    WAIT_TIME_CRITICAL: 60,       // 60 minutes
    NO_SHOW_CRITICAL: 0.2,        // 20%
    SATISFACTION_CRITICAL: 3.0,    // Below 3.0
    SYSTEM_ERROR_RATE: 0.05       // 5% error rate
  },

  // Auto-resolution timeouts (in milliseconds)
  AUTO_RESOLVE_TIMEOUTS: {
    INFO: 300000,      // 5 minutes
    WARNING: 0,        // No auto-resolve
    CRITICAL: 0        // No auto-resolve
  }
} as const;

// Report Configurations
export const REPORT_CONFIG = {
  FORMATS: {
    PDF: {
      format: 'pdf' as ReportFormat,
      mimeType: 'application/pdf',
      extension: '.pdf'
    },
    EXCEL: {
      format: 'excel' as ReportFormat,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: '.xlsx'
    },
    CSV: {
      format: 'csv' as ReportFormat,
      mimeType: 'text/csv',
      extension: '.csv'
    }
  },

  TEMPLATES: {
    EXECUTIVE_SUMMARY: {
      id: 'executive_summary',
      name: 'Resumo Executivo',
      description: 'Relatório executivo com principais KPIs e métricas',
      sections: ['kpis', 'trends', 'alerts', 'recommendations']
    },
    FINANCIAL_REPORT: {
      id: 'financial_report',
      name: 'Relatório Financeiro',
      description: 'Análise detalhada das métricas financeiras',
      sections: ['revenue', 'expenses', 'profit_margin', 'cash_flow']
    },
    OPERATIONAL_REPORT: {
      id: 'operational_report',
      name: 'Relatório Operacional',
      description: 'Métricas operacionais e de eficiência',
      sections: ['appointments', 'utilization', 'wait_times', 'staff_metrics']
    },
    PATIENT_ANALYTICS: {
      id: 'patient_analytics',
      name: 'Análise de Pacientes',
      description: 'Insights sobre satisfação e comportamento dos pacientes',
      sections: ['satisfaction', 'retention', 'demographics', 'feedback']
    }
  },

  SCHEDULING: {
    FREQUENCIES: {
      DAILY: { value: 'daily', cron: '0 8 * * *' },
      WEEKLY: { value: 'weekly', cron: '0 8 * * 1' },
      MONTHLY: { value: 'monthly', cron: '0 8 1 * *' },
      QUARTERLY: { value: 'quarterly', cron: '0 8 1 */3 *' }
    }
  }
} as const;

// Widget Configurations
export const WIDGET_CONFIG = {
  TYPES: {
    KPI: {
      type: 'kpi',
      defaultSize: { width: 1, height: 1 },
      minSize: { width: 1, height: 1 },
      maxSize: { width: 2, height: 2 }
    },
    CHART: {
      type: 'chart',
      defaultSize: { width: 2, height: 2 },
      minSize: { width: 2, height: 2 },
      maxSize: { width: 4, height: 3 }
    },
    TABLE: {
      type: 'table',
      defaultSize: { width: 3, height: 2 },
      minSize: { width: 2, height: 2 },
      maxSize: { width: 4, height: 4 }
    },
    ALERT: {
      type: 'alert',
      defaultSize: { width: 2, height: 2 },
      minSize: { width: 2, height: 1 },
      maxSize: { width: 3, height: 3 }
    },
    METRIC: {
      type: 'metric',
      defaultSize: { width: 1, height: 1 },
      minSize: { width: 1, height: 1 },
      maxSize: { width: 2, height: 1 }
    }
  },

  GRID: {
    COLUMNS: 12,
    ROW_HEIGHT: 100,
    MARGIN: [16, 16],
    CONTAINER_PADDING: [16, 16]
  }
} as const;

// Theme Configurations
export const THEME_CONFIG = {
  THEMES: {
    LIGHT: {
      name: 'light' as DashboardTheme,
      colors: {
        background: '#ffffff',
        surface: '#f8fafc',
        primary: '#3b82f6',
        text: '#1e293b',
        border: '#e2e8f0'
      }
    },
    DARK: {
      name: 'dark' as DashboardTheme,
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        primary: '#60a5fa',
        text: '#f1f5f9',
        border: '#334155'
      }
    },
    AUTO: {
      name: 'auto' as DashboardTheme,
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        text: 'var(--text)',
        border: 'var(--border)'
      }
    }
  }
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  DASHBOARD: '/api/dashboard',
  KPI: '/api/dashboard/kpi',
  CHARTS: '/api/dashboard/charts',
  ALERTS: '/api/dashboard/alerts',
  REPORTS: '/api/dashboard/reports',
  WIDGETS: '/api/dashboard/widgets',
  REAL_TIME: '/api/dashboard/realtime'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente.',
  UNAUTHORIZED: 'Acesso não autorizado. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  TIMEOUT_ERROR: 'Tempo limite excedido. Tente novamente.',
  UNKNOWN_ERROR: 'Erro desconhecido. Entre em contato com o suporte.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  DASHBOARD_LOADED: 'Dashboard carregado com sucesso.',
  DATA_UPDATED: 'Dados atualizados com sucesso.',
  REPORT_GENERATED: 'Relatório gerado com sucesso.',
  ALERT_RESOLVED: 'Alerta resolvido com sucesso.',
  SETTINGS_SAVED: 'Configurações salvas com sucesso.',
  EXPORT_COMPLETED: 'Exportação concluída com sucesso.'
} as const;

// Default Dashboard Layout
export const DEFAULT_LAYOUT = {
  id: 'default_executive_layout',
  name: 'Layout Executivo Padrão',
  widgets: [
    {
      id: 'revenue_kpi',
      type: 'kpi' as const,
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: { kpiId: 'monthly_revenue' }
    },
    {
      id: 'patients_kpi',
      type: 'kpi' as const,
      position: { x: 3, y: 0, w: 3, h: 2 },
      config: { kpiId: 'new_patients_monthly' }
    },
    {
      id: 'satisfaction_kpi',
      type: 'kpi' as const,
      position: { x: 6, y: 0, w: 3, h: 2 },
      config: { kpiId: 'patient_satisfaction' }
    },
    {
      id: 'utilization_kpi',
      type: 'kpi' as const,
      position: { x: 9, y: 0, w: 3, h: 2 },
      config: { kpiId: 'appointment_utilization' }
    },
    {
      id: 'revenue_chart',
      type: 'chart' as const,
      position: { x: 0, y: 2, w: 6, h: 4 },
      config: { chartType: 'line', dataSource: 'revenue_trend' }
    },
    {
      id: 'alerts_panel',
      type: 'alert' as const,
      position: { x: 6, y: 2, w: 6, h: 4 },
      config: { maxAlerts: 10, showResolved: false }
    }
  ]
} as const;

// Export all configurations
export default {
  DASHBOARD_CONFIG,
  KPI_CONFIG,
  ALERT_CONFIG,
  REPORT_CONFIG,
  WIDGET_CONFIG,
  THEME_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULT_LAYOUT
};