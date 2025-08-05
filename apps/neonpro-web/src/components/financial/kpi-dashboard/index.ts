// Main Components

// Configuration
// Re-export default configuration
export {
  ANIMATIONS,
  API_CONFIG,
  API_ENDPOINTS,
  CACHE_KEYS,
  CHART_COLORS,
  CHART_PALETTES,
  DASHBOARD_CONFIG,
  DATE_RANGE_PRESETS,
  DEFAULT_ALERT_RULES,
  DEFAULT_CHART_CONFIGS,
  DEFAULT_KPI_CONFIGS,
  default as config,
  ERROR_MESSAGES,
  EXPORT_FORMATS,
  FEATURE_FLAGS,
  KPI_THRESHOLDS,
  PERFORMANCE_BENCHMARKS,
  STORAGE_KEYS,
  SUCCESS_MESSAGES,
  WIDGET_SIZES,
} from "./config";
export { default as FinancialKPIDashboard } from "./FinancialKPIDashboard";

// Hooks
export { default as useFinancialKPIs } from "./hooks/useFinancialKPIs";
export { default as KPIDrillDown } from "./KPIDrillDown";
export { default as KPIFilters } from "./KPIFilters";
// Services
export {
  default as services,
  FinancialKPIService,
  PerformanceService,
  SupabaseKPIService,
} from "./services";
// Types
export type {
  AlertRule,
  AlertSeverity,
  APIError,
  APIResponse,
  AuditLog,
  BackupStatus,
  ChartConfiguration,
  ChartType,
  ComplianceStatus,
  ComponentProps,
  ConfigTypes,
  DashboardLayout,
  DashboardTheme,
  DataQuality,
  DateRange,
  DrillDownData,
  ErrorTypes,
  EventTypes,
  ExportFormat,
  ExportOptions,
  FilterOperator,
  FinancialData,
  FinancialReport,
  HookReturnTypes,
  IntegrationStatus,
  KPIAlert,
  KPIBenchmark,
  KPIConfiguration,
  KPIFilter,
  KPIForecast,
  KPIMetric,
  KPIStatus,
  KPITrend,
  KPIWidget,
  LocationMetrics,
  NotificationSettings,
  PaginatedResponse,
  PatientSegmentMetrics,
  PerformanceMetrics,
  ProviderMetrics,
  SecuritySettings,
  ServiceMetrics,
  ShareOptions,
  SharePermission,
  SortOrder,
  SystemHealth,
  TimeSeriesPoint,
  UserPreferences,
  UtilityTypes,
  WidgetSize,
} from "./types";
// Utilities
export {
  calculateCAGR,
  calculateCorrelation,
  calculateGrowthRate,
  calculateMovingAverage,
  calculatePercentageChange,
  calculateStatistics,
  calculateTrend,
  detectAnomalies,
  filterAlerts,
  formatCurrency,
  formatDate,
  formatDateRange,
  formatNumber,
  formatPercentage,
  generateMockTimeSeries,
  getDateRangePreset,
  getKPIStatus,
  getKPIStatusColor,
  getTrendColor,
  sortKPIs,
} from "./utils";

// Component Props Types for easier importing
export type FinancialKPIDashboardProps = {
  className?: string;
  initialFilters?: Partial<KPIFilter>;
  enableRealtime?: boolean;
  enableExport?: boolean;
  enableSharing?: boolean;
  customWidgets?: KPIWidget[];
  onFilterChange?: (filters: KPIFilter) => void;
  onExport?: (options: ExportOptions) => void;
  onShare?: (options: ShareOptions) => void;
};

export type KPIFiltersProps = {
  filters: KPIFilter;
  onFiltersChange: (filters: KPIFilter) => void;
  className?: string;
  enablePresets?: boolean;
  enableCustomDateRange?: boolean;
  availableServices?: string[];
  availableProviders?: string[];
  availableLocations?: string[];
};

export type KPIDrillDownProps = {
  kpi: KPIMetric;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  enableExport?: boolean;
  enableComparison?: boolean;
};

// Hook Props Types
export type UseFinancialKPIsProps = {
  initialFilters?: Partial<KPIFilter>;
  enableRealtime?: boolean;
  refreshInterval?: number;
  enableCaching?: boolean;
};

// Utility function to create a complete KPI dashboard setup
export const createKPIDashboard = ({
  containerId,
  initialFilters = {},
  enableRealtime = true,
  enableExport = true,
  enableSharing = true,
  customConfig = {},
}: {
  containerId: string;
  initialFilters?: Partial<KPIFilter>;
  enableRealtime?: boolean;
  enableExport?: boolean;
  enableSharing?: boolean;
  customConfig?: Partial<typeof DASHBOARD_CONFIG>;
}) => {
  // Merge custom configuration
  const config = {
    ...DASHBOARD_CONFIG,
    ...customConfig,
  };

  return {
    containerId,
    config,
    props: {
      initialFilters,
      enableRealtime,
      enableExport,
      enableSharing,
    },
  };
};

// Utility function to validate KPI configuration
export const validateKPIConfig = (config: Partial<KPIConfiguration>): boolean => {
  const required = ["id", "name", "formula", "dataSource"];
  return required.every((field) => field in config && config[field as keyof KPIConfiguration]);
};

// Utility function to create custom alert rules
export const createAlertRule = ({
  kpiId,
  name,
  condition,
  severity = "warning",
  notifications = { email: true, sms: false, push: true },
}: {
  kpiId: string;
  name: string;
  condition: AlertRule["condition"];
  severity?: AlertSeverity;
  notifications?: AlertRule["notifications"];
}): AlertRule => {
  return {
    id: `alert-${Date.now()}`,
    name,
    kpiId,
    condition,
    severity,
    notifications,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Utility function to create custom chart configuration
export const createChartConfig = ({
  type,
  title,
  subtitle,
  xAxisLabel,
  yAxisLabel,
  series,
  colors = CHART_COLORS,
}: {
  type: ChartType;
  title: string;
  subtitle?: string;
  xAxisLabel: string;
  yAxisLabel: string;
  series: ChartConfiguration["series"];
  colors?: typeof CHART_COLORS;
}): ChartConfiguration => {
  return {
    type,
    title,
    subtitle,
    xAxis: {
      label: xAxisLabel,
      type: type === "pie" ? "category" : "datetime",
    },
    yAxis: {
      label: yAxisLabel,
      format: yAxisLabel.includes("R$")
        ? "currency"
        : yAxisLabel.includes("%")
          ? "percentage"
          : "number",
    },
    series,
    legend: true,
    grid: type !== "pie",
    tooltip: true,
    zoom: type === "line",
    responsive: true,
  };
};

// Version information
export const VERSION = "1.0.0";
export const BUILD_DATE = new Date().toISOString();

// Feature detection
export const FEATURES = {
  REALTIME_UPDATES: typeof WebSocket !== "undefined",
  LOCAL_STORAGE: typeof localStorage !== "undefined",
  NOTIFICATIONS: typeof Notification !== "undefined",
  PERFORMANCE_API: typeof performance !== "undefined",
  INTERSECTION_OBSERVER: typeof IntersectionObserver !== "undefined",
};

// Browser compatibility check
export const checkBrowserCompatibility = (): {
  isCompatible: boolean;
  missingFeatures: string[];
} => {
  const requiredFeatures = {
    "ES6 Modules": typeof window !== "undefined" && "modules" in HTMLScriptElement.prototype,
    "Fetch API": typeof fetch !== "undefined",
    Promise: typeof Promise !== "undefined",
    "Local Storage": typeof localStorage !== "undefined",
  };

  const missingFeatures = Object.entries(requiredFeatures)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  return {
    isCompatible: missingFeatures.length === 0,
    missingFeatures,
  };
};

// Debug utilities (only in development)
if (process.env.NODE_ENV === "development") {
  (window as any).KPIDashboardDebug = {
    config: DASHBOARD_CONFIG,
    services: { FinancialKPIService, SupabaseKPIService, PerformanceService },
    utils: { formatCurrency, formatPercentage, calculateTrend },
    features: FEATURES,
    version: VERSION,
  };
}

// Default export for convenience
export default {
  FinancialKPIDashboard,
  KPIFilters,
  KPIDrillDown,
  useFinancialKPIs,
  FinancialKPIService,
  SupabaseKPIService,
  PerformanceService,
  config: DASHBOARD_CONFIG,
  version: VERSION,
};
