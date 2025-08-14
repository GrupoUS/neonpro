// Executive Dashboard - Main Export File

// Core Engine
export { ExecutiveDashboardEngine } from './executive-dashboard-engine';

// Types
export type {
  // Core Dashboard Types
  DashboardConfig,
  DateRange,
  DashboardFilters,
  DashboardWidget,
  WidgetType,
  WidgetPosition,
  WidgetConfig,
  
  // KPI Types
  KPIMetric,
  ValueFormat,
  TrendDirection,
  KPIStatus,
  KPIThreshold,
  
  // Alert Types
  Alert,
  AlertSeverity,
  AlertAction,
  
  // Chart Types
  ChartConfig,
  ChartType,
  ChartAxis,
  ChartSeries,
  ChartDataPoint,
  
  // Performance Types
  PerformanceMetric,
  PerformanceDataPoint,
  PerformanceSummary,
  
  // Executive Summary Types
  ExecutiveSummaryData,
  KeyMetric,
  Insight,
  Recommendation,
  RecommendationAction,
  Achievement,
  TrendAnalysis,
  TrendForecast,
  FinancialSummary,
  ServiceRevenue,
  ProviderRevenue,
  OperationalSummary,
  ClinicalSummary,
  PatientDemographics,
  DiagnosisStats,
  ProcedureStats,
  
  // Report Types
  ReportTemplate,
  ReportType,
  ReportFormat,
  ReportSection,
  ReportParameter,
  ReportSchedule,
  GeneratedReport,
  
  // Layout Types
  DashboardLayout,
  LayoutBreakpoints,
  
  // Real-time Types
  RealTimeConfig,
  RealTimeUpdate,
  
  // Export Types
  ExportConfig,
  
  // Error Types
  DashboardError,
  
  // Utility Types
  DeepPartial,
  RequiredFields,
  OptionalFields,
  
  // API Types
  ApiResponse,
  PaginatedResponse,
  
  // State Types
  DashboardState,
  DashboardActions,
  
  // Component Props Types
  DashboardComponentProps,
  WidgetComponentProps,
  ChartComponentProps,
  MetricComponentProps
} from './types';

// Utilities
export {
  // Value Formatting
  formatValue,
  formatDuration,
  formatBytes,
  
  // Date Formatting
  formatDate,
  formatRelativeTime,
  
  // Trend Calculation
  calculateTrend,
  calculateTrendPercentage,
  
  // KPI Status
  calculateKPIStatus,
  
  // Color Utilities
  getStatusColor,
  getTrendColor,
  getAlertColor,
  
  // Chart Utilities
  generateChartColors,
  processChartData,
  
  // Data Aggregation
  aggregateData,
  
  // Validation
  validateDateRange,
  validateKPIMetric,
  validateWidget,
  
  // Search and Filter
  filterAlerts,
  sortData,
  
  // Performance
  debounce,
  throttle,
  SimpleCache,
  
  // Export
  generateCSV,
  downloadFile,
  
  // URL Utilities
  buildQueryString,
  parseQueryString,
  
  // Error Handling
  createErrorHandler,
  isNetworkError,
  
  // Local Storage
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage
} from './utils';

// Constants
export {
  DASHBOARD_CONFIG,
  KPI_CATEGORIES,
  ALERT_CATEGORIES,
  CHART_CONFIGS,
  STATUS_CONFIG,
  TREND_CONFIG,
  ALERT_SEVERITY_CONFIG,
  VALUE_FORMAT_CONFIG,
  DATE_RANGE_PRESETS,
  WIDGET_TYPE_CONFIG,
  REPORT_CATEGORIES,
  DEFAULT_KPI_THRESHOLDS,
  COLOR_PALETTES,
  ANIMATION_DURATIONS,
  Z_INDEX,
  BREAKPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  FEATURE_FLAGS,
  API_ENDPOINTS,
  STORAGE_KEYS,
  EVENTS
} from './constants';

// Component Exports (for external use)
export { ExecutiveDashboard } from '../components/dashboard/executive/ExecutiveDashboard';
export { ExecutiveSummary } from '../components/dashboard/executive/ExecutiveSummary';
export { PerformanceMetrics } from '../components/dashboard/executive/PerformanceMetrics';
export { DashboardGrid } from '../components/dashboard/executive/DashboardGrid';
export { MetricWidget } from '../components/dashboard/executive/MetricWidget';
export { ChartWidget } from '../components/dashboard/executive/ChartWidget';
export { AlertPanel } from '../components/dashboard/executive/AlertPanel';
export { FilterPanel } from '../components/dashboard/executive/FilterPanel';
export { ExecutiveReportGenerator } from '../components/dashboard/executive/ExecutiveReportGenerator';
export { KPICard } from '../components/dashboard/executive/KPICard';

// Helper Functions
export const createDashboardConfig = (
  clinicId: string,
  userId: string,
  options: Partial<DashboardConfig> = {}
): DashboardConfig => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    clinicId,
    userId,
    dateRange: {
      from: thirtyDaysAgo,
      to: now
    },
    filters: {
      categories: [],
      departments: [],
      providers: [],
      patientTypes: []
    },
    realTimeEnabled: true,
    refreshInterval: DASHBOARD_CONFIG.REFRESH_INTERVALS.NORMAL,
    theme: 'light',
    timezone: 'America/Sao_Paulo',
    ...options
  };
};

export const createDefaultWidget = (
  type: WidgetType,
  title: string,
  position: WidgetPosition,
  config: WidgetConfig = {}
): DashboardWidget => {
  const widgetConfig = WIDGET_TYPE_CONFIG[type];
  
  return {
    id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    position,
    config: {
      ...widgetConfig?.defaultSize && { size: widgetConfig.defaultSize },
      ...config
    },
    visible: true,
    locked: false,
    resizable: true,
    draggable: true,
    minSize: widgetConfig?.minSize,
    maxSize: widgetConfig?.maxSize
  };
};

export const createKPIMetric = (
  name: string,
  value: number,
  options: Partial<KPIMetric> = {}
): KPIMetric => {
  const category = options.category || 'general';
  const unit = options.unit || '';
  const format = options.format || 'number';
  const target = options.target;
  const previousValue = options.previousValue;
  
  return {
    id: `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    value,
    unit,
    format,
    category,
    trend: previousValue ? calculateTrend(value, previousValue) : 'unknown',
    status: target ? calculateKPIStatus(value, target) : 'unknown',
    lastUpdated: new Date(),
    ...options
  };
};

export const createAlert = (
  title: string,
  message: string,
  severity: AlertSeverity,
  category: string,
  options: Partial<Alert> = {}
): Alert => {
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    message,
    severity,
    category,
    source: 'dashboard',
    timestamp: new Date(),
    acknowledged: false,
    resolved: false,
    ...options
  };
};

export const createChartConfig = (
  type: ChartType,
  dataSource: string,
  options: Partial<ChartConfig> = {}
): ChartConfig => {
  const chartConfig = CHART_CONFIGS[type];
  
  return {
    type,
    dataSource,
    ...chartConfig?.defaultConfig,
    ...options
  };
};

export const createDateRange = (
  presetId: string
): DateRange => {
  const preset = DATE_RANGE_PRESETS.find(p => p.id === presetId);
  
  if (!preset) {
    throw new Error(`Invalid date range preset: ${presetId}`);
  }
  
  const now = new Date();
  
  switch (preset.type) {
    case 'current':
      return { from: now, to: now };
      
    case 'previous': {
      const date = new Date(now.getTime() - preset.days * 24 * 60 * 60 * 1000);
      return { from: date, to: date };
    }
    
    case 'rolling': {
      const from = new Date(now.getTime() - preset.days * 24 * 60 * 60 * 1000);
      return { from, to: now };
    }
    
    case 'currentWeek': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return { from: startOfWeek, to: endOfWeek };
    }
    
    case 'previousWeek': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return { from: startOfWeek, to: endOfWeek };
    }
    
    case 'currentMonth': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      return { from: startOfMonth, to: endOfMonth };
    }
    
    case 'previousMonth': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      return { from: startOfMonth, to: endOfMonth };
    }
    
    case 'currentQuarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      const endOfQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      endOfQuarter.setHours(23, 59, 59, 999);
      
      return { from: startOfQuarter, to: endOfQuarter };
    }
    
    case 'previousQuarter': {
      const quarter = Math.floor(now.getMonth() / 3) - 1;
      const year = quarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const adjustedQuarter = quarter < 0 ? 3 : quarter;
      
      const startOfQuarter = new Date(year, adjustedQuarter * 3, 1);
      const endOfQuarter = new Date(year, (adjustedQuarter + 1) * 3, 0);
      endOfQuarter.setHours(23, 59, 59, 999);
      
      return { from: startOfQuarter, to: endOfQuarter };
    }
    
    case 'currentYear': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      
      return { from: startOfYear, to: endOfYear };
    }
    
    case 'previousYear': {
      const startOfYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfYear = new Date(now.getFullYear() - 1, 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      
      return { from: startOfYear, to: endOfYear };
    }
    
    default:
      throw new Error(`Unsupported date range type: ${preset.type}`);
  }
};

// Dashboard Validation
export const validateDashboardConfig = (config: Partial<DashboardConfig>): string[] => {
  const errors: string[] = [];
  
  if (!config.clinicId?.trim()) {
    errors.push('ID da clínica é obrigatório');
  }
  
  if (!config.userId?.trim()) {
    errors.push('ID do usuário é obrigatório');
  }
  
  if (config.dateRange && !validateDateRange(config.dateRange)) {
    errors.push('Intervalo de datas inválido');
  }
  
  if (config.refreshInterval && (config.refreshInterval < 1000 || config.refreshInterval > 3600000)) {
    errors.push('Intervalo de atualização deve estar entre 1 segundo e 1 hora');
  }
  
  return errors;
};

// Dashboard State Management
export const createDashboardState = (): DashboardState => {
  return {
    config: createDashboardConfig('', ''),
    data: null,
    widgets: [],
    kpis: [],
    alerts: [],
    layout: {
      id: 'default',
      name: 'Layout Padrão',
      widgets: [],
      breakpoints: {
        lg: [],
        md: [],
        sm: [],
        xs: [],
        xxs: []
      },
      isDefault: true,
      isShared: false,
      createdBy: '',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    isLoading: false,
    error: null,
    lastUpdated: null,
    realTimeEnabled: false,
    autoRefresh: false
  };
};

// Export version
export const VERSION = '1.0.0';

// Export build info
export const BUILD_INFO = {
  version: VERSION,
  buildDate: new Date().toISOString(),
  features: Object.keys(FEATURE_FLAGS).filter(key => FEATURE_FLAGS[key as keyof typeof FEATURE_FLAGS])
};

// Default export
export default {
  ExecutiveDashboardEngine,
  ExecutiveDashboard,
  createDashboardConfig,
  createDefaultWidget,
  createKPIMetric,
  createAlert,
  createChartConfig,
  createDateRange,
  validateDashboardConfig,
  createDashboardState,
  VERSION,
  BUILD_INFO
};