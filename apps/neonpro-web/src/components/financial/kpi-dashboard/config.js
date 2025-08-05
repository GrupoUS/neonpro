Object.defineProperty(exports, "__esModule", { value: true });
exports.ANIMATIONS =
  exports.STORAGE_KEYS =
  exports.CACHE_KEYS =
  exports.API_ENDPOINTS =
  exports.FEATURE_FLAGS =
  exports.SUCCESS_MESSAGES =
  exports.ERROR_MESSAGES =
  exports.PERFORMANCE_BENCHMARKS =
  exports.DATE_RANGE_PRESETS =
  exports.EXPORT_FORMATS =
  exports.WIDGET_SIZES =
  exports.DEFAULT_ALERT_RULES =
  exports.DEFAULT_CHART_CONFIGS =
  exports.DEFAULT_KPI_CONFIGS =
  exports.KPI_THRESHOLDS =
  exports.CHART_PALETTES =
  exports.CHART_COLORS =
  exports.API_CONFIG =
  exports.DASHBOARD_CONFIG =
    void 0;
// Dashboard Configuration
exports.DASHBOARD_CONFIG = {
  refreshInterval: 300000, // 5 minutes
  maxAlerts: 50,
  defaultDateRange: "current-month",
  enableRealtime: true,
  enableNotifications: true,
  theme: "light",
  locale: "pt-BR",
  currency: "BRL",
};
// API Configuration
exports.API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  cacheTimeout: 300000, // 5 minutes
  enableMocking: process.env.NODE_ENV === "development",
};
// Chart Colors
exports.CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  danger: "#ef4444",
  warning: "#f97316",
  success: "#22c55e",
  info: "#06b6d4",
  muted: "#6b7280",
  background: "#f8fafc",
  foreground: "#0f172a",
};
// Chart Color Palettes
exports.CHART_PALETTES = {
  default: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
  revenue: ["#10b981", "#22c55e", "#16a34a", "#15803d", "#166534"],
  profitability: ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"],
  efficiency: ["#f59e0b", "#f97316", "#ea580c", "#dc2626", "#b91c1c"],
  growth: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
};
// KPI Thresholds
exports.KPI_THRESHOLDS = {
  revenue: {
    critical: 50000,
    warning: 75000,
    good: 100000,
  },
  profitMargin: {
    critical: 15,
    warning: 25,
    good: 35,
  },
  cashFlow: {
    critical: 10000,
    warning: 25000,
    good: 50000,
  },
  utilizationRate: {
    critical: 60,
    warning: 75,
    good: 85,
  },
  patientSatisfaction: {
    critical: 70,
    warning: 80,
    good: 90,
  },
};
// Default KPI Configurations
exports.DEFAULT_KPI_CONFIGS = [
  {
    id: "total-revenue",
    name: "Receita Total",
    formula: "SUM(appointments.total_amount)",
    dataSource: "appointments",
    updateFrequency: "hourly",
    thresholds: exports.KPI_THRESHOLDS.revenue,
    targets: {
      daily: 3500,
      weekly: 25000,
      monthly: 100000,
      quarterly: 300000,
      yearly: 1200000,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "gross-margin",
    name: "Margem Bruta",
    formula: "((revenue - direct_costs) / revenue) * 100",
    dataSource: "financial_summary",
    updateFrequency: "daily",
    thresholds: exports.KPI_THRESHOLDS.profitMargin,
    targets: {
      daily: 35,
      weekly: 35,
      monthly: 35,
      quarterly: 35,
      yearly: 35,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cash-flow",
    name: "Fluxo de Caixa",
    formula: "SUM(cash_inflows) - SUM(cash_outflows)",
    dataSource: "cash_flow",
    updateFrequency: "daily",
    thresholds: exports.KPI_THRESHOLDS.cashFlow,
    targets: {
      daily: 1500,
      weekly: 10000,
      monthly: 40000,
      quarterly: 120000,
      yearly: 480000,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "utilization-rate",
    name: "Taxa de Utilização",
    formula: "(occupied_slots / total_slots) * 100",
    dataSource: "schedule",
    updateFrequency: "hourly",
    thresholds: exports.KPI_THRESHOLDS.utilizationRate,
    targets: {
      daily: 85,
      weekly: 85,
      monthly: 85,
      quarterly: 85,
      yearly: 85,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
// Default Chart Configurations
exports.DEFAULT_CHART_CONFIGS = {
  revenue_trend: {
    type: "line",
    title: "Tendência de Receita",
    subtitle: "Evolução da receita ao longo do tempo",
    xAxis: {
      label: "Data",
      type: "datetime",
      format: "dd/MM",
    },
    yAxis: {
      label: "Receita (R$)",
      format: "currency",
    },
    series: [
      {
        name: "Receita Atual",
        dataKey: "value",
        color: exports.CHART_COLORS.primary,
        type: "line",
      },
      {
        name: "Meta",
        dataKey: "target",
        color: exports.CHART_COLORS.success,
        type: "line",
      },
    ],
    legend: true,
    grid: true,
    tooltip: true,
    zoom: true,
    responsive: true,
  },
  service_breakdown: {
    type: "pie",
    title: "Receita por Serviço",
    subtitle: "Distribuição da receita por categoria de serviço",
    xAxis: {
      label: "Serviço",
      type: "category",
    },
    yAxis: {
      label: "Receita (R$)",
      format: "currency",
    },
    series: [
      {
        name: "Receita",
        dataKey: "value",
        color: exports.CHART_COLORS.primary,
      },
    ],
    legend: true,
    grid: false,
    tooltip: true,
    zoom: false,
    responsive: true,
  },
  profitability_analysis: {
    type: "bar",
    title: "Análise de Rentabilidade",
    subtitle: "Margem de lucro por categoria",
    xAxis: {
      label: "Categoria",
      type: "category",
    },
    yAxis: {
      label: "Margem (%)",
      format: "percentage",
    },
    series: [
      {
        name: "Margem Bruta",
        dataKey: "grossMargin",
        color: exports.CHART_COLORS.primary,
        type: "bar",
      },
      {
        name: "Margem Líquida",
        dataKey: "netMargin",
        color: exports.CHART_COLORS.secondary,
        type: "bar",
      },
    ],
    legend: true,
    grid: true,
    tooltip: true,
    zoom: false,
    responsive: true,
  },
};
// Default Alert Rules
exports.DEFAULT_ALERT_RULES = [
  {
    id: "revenue-critical",
    name: "Receita Crítica",
    kpiId: "total-revenue",
    condition: {
      operator: "lt",
      value: 50000,
      duration: 60, // 1 hour
    },
    severity: "critical",
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "margin-warning",
    name: "Margem em Alerta",
    kpiId: "gross-margin",
    condition: {
      operator: "lt",
      value: 25,
      duration: 30, // 30 minutes
    },
    severity: "warning",
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cash-flow-critical",
    name: "Fluxo de Caixa Crítico",
    kpiId: "cash-flow",
    condition: {
      operator: "lt",
      value: 10000,
      duration: 120, // 2 hours
    },
    severity: "critical",
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
// Widget Size Configurations
exports.WIDGET_SIZES = {
  small: {
    width: 300,
    height: 200,
    gridCols: 1,
    gridRows: 1,
  },
  medium: {
    width: 600,
    height: 300,
    gridCols: 2,
    gridRows: 2,
  },
  large: {
    width: 900,
    height: 400,
    gridCols: 3,
    gridRows: 3,
  },
};
// Export Format Configurations
exports.EXPORT_FORMATS = {
  pdf: {
    extension: "pdf",
    mimeType: "application/pdf",
    supportsCharts: true,
    supportsFormatting: true,
  },
  excel: {
    extension: "xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    supportsCharts: true,
    supportsFormatting: true,
  },
  csv: {
    extension: "csv",
    mimeType: "text/csv",
    supportsCharts: false,
    supportsFormatting: false,
  },
  json: {
    extension: "json",
    mimeType: "application/json",
    supportsCharts: false,
    supportsFormatting: false,
  },
};
// Date Range Presets
exports.DATE_RANGE_PRESETS = [
  { id: "today", label: "Hoje", days: 1 },
  { id: "yesterday", label: "Ontem", days: 1 },
  { id: "last-7-days", label: "Últimos 7 dias", days: 7 },
  { id: "last-30-days", label: "Últimos 30 dias", days: 30 },
  { id: "current-month", label: "Mês atual", days: "current-month" },
  { id: "last-month", label: "Mês passado", days: "last-month" },
  { id: "current-quarter", label: "Trimestre atual", days: "current-quarter" },
  { id: "last-quarter", label: "Trimestre passado", days: "last-quarter" },
  { id: "current-year", label: "Ano atual", days: "current-year" },
  { id: "last-year", label: "Ano passado", days: "last-year" },
  { id: "custom", label: "Personalizado", days: "custom" },
];
// Performance Benchmarks
exports.PERFORMANCE_BENCHMARKS = {
  loadTime: {
    excellent: 1000, // 1 second
    good: 2000, // 2 seconds
    acceptable: 3000, // 3 seconds
    poor: 5000, // 5 seconds
  },
  renderTime: {
    excellent: 100, // 100ms
    good: 200, // 200ms
    acceptable: 500, // 500ms
    poor: 1000, // 1 second
  },
  dataFreshness: {
    realtime: 30, // 30 seconds
    nearRealtime: 300, // 5 minutes
    periodic: 1800, // 30 minutes
    batch: 3600, // 1 hour
  },
};
// Error Messages
exports.ERROR_MESSAGES = {
  NETWORK_ERROR: "Erro de conexão. Verifique sua internet.",
  TIMEOUT_ERROR: "Tempo limite excedido. Tente novamente.",
  VALIDATION_ERROR: "Dados inválidos fornecidos.",
  PERMISSION_ERROR: "Você não tem permissão para esta ação.",
  NOT_FOUND_ERROR: "Recurso não encontrado.",
  SERVER_ERROR: "Erro interno do servidor.",
  RATE_LIMIT_ERROR: "Muitas solicitações. Tente novamente em alguns minutos.",
  MAINTENANCE_ERROR: "Sistema em manutenção. Tente novamente mais tarde.",
};
// Success Messages
exports.SUCCESS_MESSAGES = {
  DATA_LOADED: "Dados carregados com sucesso.",
  EXPORT_COMPLETED: "Exportação concluída com sucesso.",
  SHARE_COMPLETED: "Relatório compartilhado com sucesso.",
  SETTINGS_SAVED: "Configurações salvas com sucesso.",
  ALERT_DISMISSED: "Alerta marcado como lido.",
  LAYOUT_SAVED: "Layout salvo com sucesso.",
};
// Feature Flags
exports.FEATURE_FLAGS = {
  ENABLE_REALTIME_UPDATES: true,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_EXPORT_FUNCTIONALITY: true,
  ENABLE_SHARING: true,
  ENABLE_CUSTOM_DASHBOARDS: true,
  ENABLE_MOBILE_OPTIMIZATION: true,
  ENABLE_DARK_MODE: false,
  ENABLE_AI_INSIGHTS: true,
  ENABLE_PREDICTIVE_ANALYTICS: true,
  ENABLE_BENCHMARKING: true,
};
// API Endpoints
exports.API_ENDPOINTS = {
  KPI_DATA: "/financial/kpis",
  ALERTS: "/financial/alerts",
  BENCHMARKS: "/financial/benchmarks",
  FORECASTS: "/financial/forecasts",
  EXPORT: "/financial/export",
  SHARE: "/financial/share",
  LAYOUTS: "/dashboard/layouts",
  PREFERENCES: "/user/preferences",
};
// Cache Keys
exports.CACHE_KEYS = {
  KPI_DATA: "financial_kpi_data",
  ALERTS: "financial_alerts",
  BENCHMARKS: "financial_benchmarks",
  FORECASTS: "financial_forecasts",
  USER_PREFERENCES: "user_preferences",
  DASHBOARD_LAYOUT: "dashboard_layout",
};
// Local Storage Keys
exports.STORAGE_KEYS = {
  DASHBOARD_FILTERS: "neonpro_dashboard_filters",
  DASHBOARD_LAYOUT: "neonpro_dashboard_layout",
  USER_PREFERENCES: "neonpro_user_preferences",
  THEME_PREFERENCE: "neonpro_theme",
  LAST_VISIT: "neonpro_last_visit",
};
// Animation Configurations
exports.ANIMATIONS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
};
exports.default = {
  DASHBOARD_CONFIG: exports.DASHBOARD_CONFIG,
  API_CONFIG: exports.API_CONFIG,
  CHART_COLORS: exports.CHART_COLORS,
  CHART_PALETTES: exports.CHART_PALETTES,
  KPI_THRESHOLDS: exports.KPI_THRESHOLDS,
  DEFAULT_KPI_CONFIGS: exports.DEFAULT_KPI_CONFIGS,
  DEFAULT_CHART_CONFIGS: exports.DEFAULT_CHART_CONFIGS,
  DEFAULT_ALERT_RULES: exports.DEFAULT_ALERT_RULES,
  WIDGET_SIZES: exports.WIDGET_SIZES,
  EXPORT_FORMATS: exports.EXPORT_FORMATS,
  DATE_RANGE_PRESETS: exports.DATE_RANGE_PRESETS,
  PERFORMANCE_BENCHMARKS: exports.PERFORMANCE_BENCHMARKS,
  ERROR_MESSAGES: exports.ERROR_MESSAGES,
  SUCCESS_MESSAGES: exports.SUCCESS_MESSAGES,
  FEATURE_FLAGS: exports.FEATURE_FLAGS,
  API_ENDPOINTS: exports.API_ENDPOINTS,
  CACHE_KEYS: exports.CACHE_KEYS,
  STORAGE_KEYS: exports.STORAGE_KEYS,
  ANIMATIONS: exports.ANIMATIONS,
};
