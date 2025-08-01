import { ChartType, ValueFormat, AlertSeverity, KPIStatus, TrendDirection } from './types';

// Dashboard Configuration Constants
export const DASHBOARD_CONFIG = {
  // Refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    REAL_TIME: 30000,      // 30 seconds
    FAST: 60000,           // 1 minute
    NORMAL: 300000,        // 5 minutes
    SLOW: 900000,          // 15 minutes
    HOURLY: 3600000,       // 1 hour
    DAILY: 86400000        // 24 hours
  },
  
  // Grid layout settings
  GRID: {
    COLS: {
      lg: 12,
      md: 10,
      sm: 6,
      xs: 4,
      xxs: 2
    },
    ROW_HEIGHT: 60,
    MARGIN: [10, 10],
    CONTAINER_PADDING: [10, 10],
    BREAKPOINTS: {
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
      xxs: 0
    }
  },
  
  // Widget size constraints
  WIDGET_SIZES: {
    MIN: { w: 2, h: 2 },
    MAX: { w: 12, h: 8 },
    DEFAULT: { w: 4, h: 3 }
  },
  
  // Cache settings
  CACHE: {
    DEFAULT_TTL: 300000,   // 5 minutes
    METRICS_TTL: 60000,    // 1 minute
    ALERTS_TTL: 30000,     // 30 seconds
    REPORTS_TTL: 3600000,  // 1 hour
    MAX_SIZE: 100          // Maximum cache entries
  },
  
  // API settings
  API: {
    TIMEOUT: 30000,        // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,     // 1 second
    BATCH_SIZE: 50
  },
  
  // Export settings
  EXPORT: {
    MAX_ROWS: 10000,
    FORMATS: ['json', 'csv', 'excel', 'pdf'],
    COMPRESSION: ['none', 'zip', 'gzip']
  }
} as const;

// KPI Metric Categories
export const KPI_CATEGORIES = {
  FINANCIAL: {
    id: 'financial',
    name: 'Financeiro',
    icon: 'DollarSign',
    color: '#10b981',
    metrics: [
      'revenue',
      'profit',
      'expenses',
      'collections',
      'outstanding',
      'cost_per_patient',
      'revenue_per_patient',
      'profit_margin'
    ]
  },
  OPERATIONAL: {
    id: 'operational',
    name: 'Operacional',
    icon: 'Activity',
    color: '#3b82f6',
    metrics: [
      'appointments',
      'utilization',
      'efficiency',
      'wait_time',
      'visit_duration',
      'no_shows',
      'cancellations',
      'capacity'
    ]
  },
  CLINICAL: {
    id: 'clinical',
    name: 'Clínico',
    icon: 'Heart',
    color: '#ef4444',
    metrics: [
      'patient_satisfaction',
      'treatment_success',
      'complications',
      'readmissions',
      'mortality',
      'adherence',
      'protocol_compliance',
      'safety_score'
    ]
  },
  QUALITY: {
    id: 'quality',
    name: 'Qualidade',
    icon: 'Award',
    color: '#f59e0b',
    metrics: [
      'satisfaction_score',
      'complaint_rate',
      'resolution_time',
      'staff_satisfaction',
      'training_completion',
      'certification_rate',
      'audit_score'
    ]
  },
  PATIENT: {
    id: 'patient',
    name: 'Pacientes',
    icon: 'Users',
    color: '#8b5cf6',
    metrics: [
      'new_patients',
      'returning_patients',
      'patient_retention',
      'referrals',
      'demographics',
      'acquisition_cost',
      'lifetime_value'
    ]
  }
} as const;

// Alert Categories
export const ALERT_CATEGORIES = {
  SYSTEM: {
    id: 'system',
    name: 'Sistema',
    icon: 'Server',
    color: '#6b7280'
  },
  PERFORMANCE: {
    id: 'performance',
    name: 'Performance',
    icon: 'TrendingDown',
    color: '#ef4444'
  },
  SECURITY: {
    id: 'security',
    name: 'Segurança',
    icon: 'Shield',
    color: '#dc2626'
  },
  COMPLIANCE: {
    id: 'compliance',
    name: 'Conformidade',
    icon: 'CheckCircle',
    color: '#f59e0b'
  },
  FINANCIAL: {
    id: 'financial',
    name: 'Financeiro',
    icon: 'DollarSign',
    color: '#10b981'
  },
  OPERATIONAL: {
    id: 'operational',
    name: 'Operacional',
    icon: 'Activity',
    color: '#3b82f6'
  },
  CLINICAL: {
    id: 'clinical',
    name: 'Clínico',
    icon: 'Heart',
    color: '#ef4444'
  }
} as const;

// Chart Type Configurations
export const CHART_CONFIGS = {
  line: {
    name: 'Linha',
    icon: 'LineChart',
    defaultConfig: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      animated: true,
      responsive: true,
      height: 300
    }
  },
  area: {
    name: 'Área',
    icon: 'AreaChart',
    defaultConfig: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      animated: true,
      responsive: true,
      height: 300,
      fillOpacity: 0.3
    }
  },
  bar: {
    name: 'Barra',
    icon: 'BarChart3',
    defaultConfig: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      animated: true,
      responsive: true,
      height: 300
    }
  },
  column: {
    name: 'Coluna',
    icon: 'BarChart',
    defaultConfig: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      animated: true,
      responsive: true,
      height: 300
    }
  },
  pie: {
    name: 'Pizza',
    icon: 'PieChart',
    defaultConfig: {
      showLegend: true,
      showTooltip: true,
      animated: true,
      responsive: true,
      height: 300
    }
  },
  donut: {
    name: 'Rosca',
    icon: 'Circle',
    defaultConfig: {
      showLegend: true,
      showTooltip: true,
      animated: true,
      responsive: true,
      height: 300,
      innerRadius: 0.5
    }
  },
  gauge: {
    name: 'Medidor',
    icon: 'Gauge',
    defaultConfig: {
      showTooltip: true,
      animated: true,
      responsive: true,
      height: 300,
      min: 0,
      max: 100
    }
  }
} as const;

// Status Colors and Icons
export const STATUS_CONFIG = {
  excellent: {
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#d1fae5',
    icon: 'CheckCircle',
    label: 'Excelente'
  },
  good: {
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#dbeafe',
    icon: 'ThumbsUp',
    label: 'Bom'
  },
  warning: {
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fed7aa',
    icon: 'AlertTriangle',
    label: 'Atenção'
  },
  critical: {
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    icon: 'XCircle',
    label: 'Crítico'
  },
  unknown: {
    color: '#6b7280',
    bgColor: '#f9fafb',
    borderColor: '#e5e7eb',
    icon: 'HelpCircle',
    label: 'Desconhecido'
  }
} as const;

// Trend Configuration
export const TREND_CONFIG = {
  up: {
    color: '#10b981',
    icon: 'TrendingUp',
    label: 'Crescimento'
  },
  down: {
    color: '#ef4444',
    icon: 'TrendingDown',
    label: 'Declínio'
  },
  stable: {
    color: '#6b7280',
    icon: 'Minus',
    label: 'Estável'
  },
  unknown: {
    color: '#9ca3af',
    icon: 'HelpCircle',
    label: 'Desconhecido'
  }
} as const;

// Alert Severity Configuration
export const ALERT_SEVERITY_CONFIG = {
  critical: {
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    icon: 'AlertCircle',
    label: 'Crítico',
    priority: 1
  },
  warning: {
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fed7aa',
    icon: 'AlertTriangle',
    label: 'Aviso',
    priority: 2
  },
  info: {
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#dbeafe',
    icon: 'Info',
    label: 'Informação',
    priority: 3
  },
  success: {
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#d1fae5',
    icon: 'CheckCircle',
    label: 'Sucesso',
    priority: 4
  }
} as const;

// Value Format Configuration
export const VALUE_FORMAT_CONFIG = {
  number: {
    label: 'Número',
    example: '1,234.56',
    decimals: 2
  },
  currency: {
    label: 'Moeda',
    example: 'R$ 1.234,56',
    decimals: 2,
    currency: 'BRL'
  },
  percentage: {
    label: 'Porcentagem',
    example: '12.34%',
    decimals: 2
  },
  duration: {
    label: 'Duração',
    example: '2h 30min',
    unit: 'minutes'
  },
  bytes: {
    label: 'Bytes',
    example: '1.23 MB',
    decimals: 2
  },
  decimal: {
    label: 'Decimal',
    example: '1234.56',
    decimals: 2
  },
  integer: {
    label: 'Inteiro',
    example: '1,234',
    decimals: 0
  }
} as const;

// Date Range Presets
export const DATE_RANGE_PRESETS = [
  {
    id: 'today',
    label: 'Hoje',
    days: 0,
    type: 'current'
  },
  {
    id: 'yesterday',
    label: 'Ontem',
    days: 1,
    type: 'previous'
  },
  {
    id: 'thisWeek',
    label: 'Esta Semana',
    days: 0,
    type: 'currentWeek'
  },
  {
    id: 'lastWeek',
    label: 'Semana Passada',
    days: 7,
    type: 'previousWeek'
  },
  {
    id: 'thisMonth',
    label: 'Este Mês',
    days: 0,
    type: 'currentMonth'
  },
  {
    id: 'lastMonth',
    label: 'Mês Passado',
    days: 30,
    type: 'previousMonth'
  },
  {
    id: 'last7Days',
    label: 'Últimos 7 Dias',
    days: 7,
    type: 'rolling'
  },
  {
    id: 'last30Days',
    label: 'Últimos 30 Dias',
    days: 30,
    type: 'rolling'
  },
  {
    id: 'last90Days',
    label: 'Últimos 90 Dias',
    days: 90,
    type: 'rolling'
  },
  {
    id: 'thisQuarter',
    label: 'Este Trimestre',
    days: 0,
    type: 'currentQuarter'
  },
  {
    id: 'lastQuarter',
    label: 'Trimestre Passado',
    days: 90,
    type: 'previousQuarter'
  },
  {
    id: 'thisYear',
    label: 'Este Ano',
    days: 0,
    type: 'currentYear'
  },
  {
    id: 'lastYear',
    label: 'Ano Passado',
    days: 365,
    type: 'previousYear'
  }
] as const;

// Widget Type Configuration
export const WIDGET_TYPE_CONFIG = {
  metric: {
    name: 'Métrica',
    icon: 'BarChart3',
    description: 'Exibe uma métrica única com valor, tendência e status',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 4 }
  },
  chart: {
    name: 'Gráfico',
    icon: 'LineChart',
    description: 'Exibe dados em formato de gráfico (linha, barra, pizza, etc.)',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 12, h: 8 }
  },
  kpi: {
    name: 'KPI',
    icon: 'Target',
    description: 'Indicador chave de performance com meta e benchmark',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 3 }
  },
  alert: {
    name: 'Alerta',
    icon: 'AlertTriangle',
    description: 'Lista de alertas e notificações importantes',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 8, h: 6 }
  },
  summary: {
    name: 'Resumo',
    icon: 'FileText',
    description: 'Resumo executivo com insights e recomendações',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 12, h: 8 }
  },
  table: {
    name: 'Tabela',
    icon: 'Table',
    description: 'Dados tabulares com ordenação e filtros',
    defaultSize: { w: 8, h: 4 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 12, h: 8 }
  },
  gauge: {
    name: 'Medidor',
    icon: 'Gauge',
    description: 'Medidor circular para exibir progresso ou status',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 4 }
  },
  progress: {
    name: 'Progresso',
    icon: 'ProgressBar',
    description: 'Barra de progresso para metas e objetivos',
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 3, h: 1 },
    maxSize: { w: 8, h: 3 }
  }
} as const;

// Report Template Categories
export const REPORT_CATEGORIES = {
  executive: {
    id: 'executive',
    name: 'Executivo',
    icon: 'Crown',
    description: 'Relatórios de alto nível para executivos'
  },
  financial: {
    id: 'financial',
    name: 'Financeiro',
    icon: 'DollarSign',
    description: 'Relatórios financeiros e de faturamento'
  },
  operational: {
    id: 'operational',
    name: 'Operacional',
    icon: 'Activity',
    description: 'Relatórios operacionais e de eficiência'
  },
  clinical: {
    id: 'clinical',
    name: 'Clínico',
    icon: 'Heart',
    description: 'Relatórios clínicos e de qualidade'
  },
  quality: {
    id: 'quality',
    name: 'Qualidade',
    icon: 'Award',
    description: 'Relatórios de qualidade e satisfação'
  },
  compliance: {
    id: 'compliance',
    name: 'Conformidade',
    icon: 'Shield',
    description: 'Relatórios de conformidade e auditoria'
  },
  custom: {
    id: 'custom',
    name: 'Personalizado',
    icon: 'Settings',
    description: 'Relatórios personalizados'
  }
} as const;

// Default KPI Thresholds
export const DEFAULT_KPI_THRESHOLDS = {
  revenue: {
    excellent: { min: 100 }, // 100% of target
    good: { min: 90 },       // 90% of target
    warning: { min: 70 },    // 70% of target
    critical: { max: 70 }    // Below 70% of target
  },
  satisfaction: {
    excellent: { min: 90 },  // 90%+
    good: { min: 80 },       // 80-89%
    warning: { min: 70 },    // 70-79%
    critical: { max: 70 }    // Below 70%
  },
  efficiency: {
    excellent: { min: 95 },  // 95%+
    good: { min: 85 },       // 85-94%
    warning: { min: 75 },    // 75-84%
    critical: { max: 75 }    // Below 75%
  },
  waitTime: {
    excellent: { max: 15 },  // 15 minutes or less
    good: { max: 30 },       // 16-30 minutes
    warning: { max: 45 },    // 31-45 minutes
    critical: { min: 45 }    // More than 45 minutes
  }
} as const;

// Color Palettes
export const COLOR_PALETTES = {
  default: [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#ec4899', // pink
    '#6b7280'  // gray
  ],
  financial: [
    '#10b981', // green
    '#059669', // dark green
    '#34d399', // light green
    '#6ee7b7', // very light green
    '#a7f3d0'  // pale green
  ],
  clinical: [
    '#ef4444', // red
    '#dc2626', // dark red
    '#f87171', // light red
    '#fca5a5', // very light red
    '#fecaca'  // pale red
  ],
  operational: [
    '#3b82f6', // blue
    '#2563eb', // dark blue
    '#60a5fa', // light blue
    '#93c5fd', // very light blue
    '#dbeafe'  // pale blue
  ],
  quality: [
    '#f59e0b', // yellow
    '#d97706', // dark yellow
    '#fbbf24', // light yellow
    '#fcd34d', // very light yellow
    '#fde68a'  // pale yellow
  ]
} as const;

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  CHART: 1000,
  LOADING: 2000
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
} as const;

// Responsive Breakpoints
export const BREAKPOINTS = {
  xs: '480px',
  sm: '768px',
  md: '996px',
  lg: '1200px',
  xl: '1400px'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  TIMEOUT_ERROR: 'Tempo limite excedido. Tente novamente.',
  UNAUTHORIZED: 'Acesso não autorizado. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
  NOT_FOUND: 'Recurso não encontrado.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Dados carregados com sucesso.',
  DATA_SAVED: 'Dados salvos com sucesso.',
  DATA_UPDATED: 'Dados atualizados com sucesso.',
  DATA_DELETED: 'Dados excluídos com sucesso.',
  EXPORT_SUCCESS: 'Exportação realizada com sucesso.',
  IMPORT_SUCCESS: 'Importação realizada com sucesso.',
  ALERT_ACKNOWLEDGED: 'Alerta reconhecido com sucesso.',
  ALERT_RESOLVED: 'Alerta resolvido com sucesso.'
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING_DATA: 'Carregando dados...',
  LOADING_DASHBOARD: 'Carregando dashboard...',
  LOADING_METRICS: 'Carregando métricas...',
  LOADING_ALERTS: 'Carregando alertas...',
  LOADING_REPORTS: 'Carregando relatórios...',
  GENERATING_REPORT: 'Gerando relatório...',
  EXPORTING_DATA: 'Exportando dados...',
  SAVING_DATA: 'Salvando dados...'
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  REAL_TIME_UPDATES: true,
  ADVANCED_ANALYTICS: true,
  CUSTOM_WIDGETS: true,
  REPORT_SCHEDULING: true,
  ALERT_NOTIFICATIONS: true,
  DATA_EXPORT: true,
  DASHBOARD_SHARING: true,
  MOBILE_RESPONSIVE: true,
  DARK_MODE: false,
  AI_INSIGHTS: false
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  DASHBOARD: '/api/dashboard',
  METRICS: '/api/metrics',
  ALERTS: '/api/alerts',
  REPORTS: '/api/reports',
  WIDGETS: '/api/widgets',
  LAYOUTS: '/api/layouts',
  EXPORTS: '/api/exports',
  REAL_TIME: '/api/realtime'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  DASHBOARD_CONFIG: 'neonpro_dashboard_config',
  DASHBOARD_LAYOUT: 'neonpro_dashboard_layout',
  DASHBOARD_FILTERS: 'neonpro_dashboard_filters',
  USER_PREFERENCES: 'neonpro_user_preferences',
  CACHE_PREFIX: 'neonpro_cache_'
} as const;

// Event Names
export const EVENTS = {
  DASHBOARD_LOADED: 'dashboard:loaded',
  DASHBOARD_ERROR: 'dashboard:error',
  WIDGET_UPDATED: 'widget:updated',
  WIDGET_ADDED: 'widget:added',
  WIDGET_REMOVED: 'widget:removed',
  ALERT_RECEIVED: 'alert:received',
  ALERT_ACKNOWLEDGED: 'alert:acknowledged',
  ALERT_RESOLVED: 'alert:resolved',
  DATA_REFRESHED: 'data:refreshed',
  EXPORT_COMPLETED: 'export:completed'
} as const;